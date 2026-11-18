// summarize-news.mjs — Tóm tắt tin RSS sang tiếng Việt.
// Nhà cung cấp CHÍNH: Pollinations (miễn phí, KHÔNG cần key) — endpoint tương
// thích OpenAI, model "openai" (= gpt-oss-20b). Thử thật 18/11/2026: 2/2 lần
// chạy, JSON đúng, tiếng Việt tốt, 5-9s/lần. Tier anonymous giới hạn ~1
// request/15 giây nên vòng lặp batch sleep 15s giữa các lần gọi. Endpoint
// legacy (text.pollinations.ai) có thể bị thay thế dần nên Gemini giữ lại
// làm DỰ PHÒNG (khi quota đã reset).
// Đọc src/data/news-raw.json (do fetch-data.mjs tạo) -> ghi src/data/news.json.
// Key Gemini lấy từ biến môi trường GEMINI_API_KEY (trong GitHub Action:
// secrets.GEMINI_API_KEY). KHÔNG có key -> vẫn chạy bằng Pollinations, chỉ
// mất đường dự phòng. KHÔNG tự tạo key, KHÔNG nhúng key vào code.
// Pháp lý: mỗi tin chỉ tóm tắt 1-2 câu, TỐI ĐA 260 ký tự, bằng lời của mình (không dịch
// toàn văn), kèm link gốc; prompt CẤM ngôn ngữ khuyến nghị đầu tư — và script
// có lưới lọc stripAdvice() để trống mọi trường lọt cụm gợi ý đầu tư (model mở
// đôi khi vẫn lọt dù prompt đã cấm: thử thật 18/11 "có thể cân nhắc đầu tư").
// Mỗi tin còn có trường `why`: 1 câu ngắn nói rõ vì sao tin đáng đọc với người Việt
// (tác động/lợi ích cụ thể); trang chỉ hiện why khi có nội dung.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_DIR = join(ROOT, 'src', 'data');
// Model chính + dự phòng: Google có thể ngừng cấp model cũ cho key mới
// (gemini-2.5-flash trả 404 với key tạo 18/11/2026) — gặp 404 thì thử model sau.
// Model mới cũng hay quá tải (503) nên mỗi model được thử lại 1 lần sau 15s.
// 3.5-flash đứng đầu vì kiểm trực tiếp 18/11: model duy nhất trả 200
// (3.8 treo 90s không trả, 3.7/3.6/flash-latest đều 503 quá tải).
const MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
// Model đã gọi THÀNH CÔNG (rỗng = chưa gọi thành công lần nào — không được
// ghi tên model vào file dữ liệu khi chưa có lần gọi nào thành công).
let MODEL_USED = '';
const apiUrl = (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Gọi Gemini: thử từng model; lỗi 503/429 (quá tải) hoặc lỗi mạng/timeout
// thì chờ 15s thử lại 1 lần rồi mới sang model sau; lỗi 404 (model bị gỡ)
// sang model sau ngay. Timeout 120s vì model mới trả chậm (2 tin đã ~40s).
async function callGemini(apiKey, body) {
  let lastErr = '';
  for (const m of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      let res;
      try {
        res = await fetch(apiUrl(m), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(120000),
        });
      } catch (e) {
        lastErr = `Gemini lỗi mạng/timeout (${m}): ${e.message || e}`;
        if (attempt < 2) { console.warn(`${lastErr} — chờ 15s thử lại.`); await sleep(15000); continue; }
        console.warn(`Model ${m} vẫn lỗi mạng — thử model sau.`);
        break;
      }
      if (res.ok) { MODEL_USED = m; return res; }
      const bodyText = await res.text();
      lastErr = `Gemini HTTP ${res.status}: ${bodyText.slice(0, 300)}`;
      // 429 do HẾT QUOTA của key (không phải quá tải từng model): thử model
      // khác cũng vô ích mà còn đốt thêm quota — dừng ngay, không thử lại.
      if (res.status === 429 && /quota/i.test(bodyText)) {
        throw new Error(`Gemini hết quota (${m}): ${bodyText.slice(0, 200)}`);
      }
      if (res.status === 404) { console.warn(`Model ${m} không dùng được (404) — thử model sau.`); break; }
      if (res.status === 503 || res.status === 429) {
        if (attempt < 2) { console.warn(`Model ${m} quá tải (${res.status}) — chờ 15s thử lại.`); await sleep(15000); continue; }
        console.warn(`Model ${m} vẫn quá tải — thử model sau.`);
        break;
      }
      throw new Error(lastErr);
    }
  }
  throw new Error(lastErr || 'Gemini: không model nào dùng được');
}

// Nhà cung cấp chính: Pollinations (miễn phí, không cần key).
// Endpoint tương thích OpenAI; model "openai" (= gpt-oss-20b).
// Lỗi 429/503 hoặc lỗi mạng: chờ 15s thử lại 1 lần rồi mới đầu hàng (về
// Gemini dự phòng). Timeout 120s như Gemini.
const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/v1/chat/completions';
async function callPollinations(messages, maxTokens = 2048) {
  let lastErr = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res;
    try {
      res = await fetch(POLLINATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'openai', messages, temperature: 0.3, max_tokens: maxTokens }),
        signal: AbortSignal.timeout(120000),
      });
    } catch (e) {
      lastErr = `Pollinations lỗi mạng/timeout: ${e.message || e}`;
      if (attempt < 2) { console.warn(`${lastErr} — chờ 15s thử lại.`); await sleep(15000); continue; }
      throw new Error(lastErr);
    }
    if (res.ok) { MODEL_USED = 'pollinations-openai'; return res; }
    const bodyText = await res.text();
    lastErr = `Pollinations HTTP ${res.status}: ${bodyText.slice(0, 300)}`;
    if ((res.status === 429 || res.status === 503) && attempt < 2) { console.warn(`${lastErr} — chờ 15s thử lại.`); await sleep(15000); continue; }
    throw new Error(lastErr);
  }
  throw new Error(lastErr || 'Pollinations: không gọi được');
}

// Bóc mảng JSON từ text model trả về: gỡ fence ```json nếu có; nếu parse
// trực tiếp thất bại thì thử cắt từ dấu [ đầu tới ] cuối (model mở đôi khi
// thêm lời mở đầu ngoài JSON).
function parseJsonArray(text) {
  const cleaned = String(text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('Không bóc được mảng JSON từ kết quả model');
  }
}

// Lưới lọc an toàn: model mở đôi khi vẫn lọt ngôn ngữ gợi ý đầu tư dù prompt
// đã cấm (thử thật 18/11: "có thể cân nhắc đầu tư để đa dạng hoá danh mục").
// Trường nào dính cụm này thì để trống — trang vẫn hiện tiêu đề + nguồn,
// không bao giờ đăng lời khuyên đầu tư.
const ADVICE_PHRASES = ['nên mua', 'nên bán', 'nên đầu tư', 'nên giữ', 'nên nắm giữ', 'cân nhắc đầu tư', 'cân nhắc mua', 'cân nhắc bán', 'đáng mua', 'đáng đầu tư', 'cơ hội mua', 'khuyến nghị', 'đa dạng hoá danh mục', 'đa dạng hóa danh mục'];
function stripAdvice(text) {
  const low = String(text || '').toLowerCase();
  if (ADVICE_PHRASES.some((p) => low.includes(p))) return '';
  return text;
}
const MAX_LEN = 260;
const WHY_MAX_LEN = 200;
const BATCH = 5;

const GROUPS = ['ai', 'chung-khoan', 'crypto'];

function trimText(s, maxLen) {
  let t = String(s || '').replace(/\s+/g, ' ').trim().replace(/^["“]|["”]$/g, '');
  if (t.length <= maxLen) return t;
  t = t.slice(0, maxLen);
  const cut = t.lastIndexOf(' ');
  return (cut > 100 ? t.slice(0, cut) : t).trim();
}

function trimSummary(s) {
  return trimText(s, MAX_LEN);
}

// Câu "vì sao đáng đọc": ngắn, tối đa 200 ký tự.
function trimWhy(s) {
  return trimText(s, WHY_MAX_LEN);
}

const SYSTEM_PROMPT = [
  'Bạn tóm tắt tin tức nước ngoài sang tiếng Việt cho mục Điểm báo của một trang tiện ích.',
  'QUY TẮC BẮT BUỘC:',
  '1. Mỗi tin: tóm tắt đúng 1-2 câu, TỐI ĐA 260 ký tự, viết lại bằng lời của mình — KHÔNG dịch toàn văn, KHÔNG chép nguyên câu tiếng Anh.',
  '2. Chỉ nêu SỰ KIỆN (ai làm gì, con số nào, khi nào). Không thêm bình luận, không suy đoán, không thêm thông tin ngoài bản gốc. Giữ nguyên tên riêng nước ngoài (người, công ty, sản phẩm) theo bản gốc, KHÔNG phiên âm sang tiếng Việt — ví dụ viết "Donald Trump", "Vladimir Putin", "Jensen Huang", "Nvidia"; CHỈ có Xi Jinping viết là "Tập Cận Bình".',
  '3. TUYỆT ĐỐI KHÔNG dùng ngôn ngữ khuyến nghị đầu tư: không viết "nên mua", "nên bán", "nên đầu tư", "nên giữ", "cân nhắc đầu tư", "cân nhắc mua", "đáng mua", "đáng đầu tư", "cơ hội mua vào", "khuyến nghị", "đa dạng hoá danh mục" hay bất kỳ lời khuyên mua/bán/giữ tài sản nào — áp dụng cho cả tóm tắt lẫn câu "vì sao đáng đọc".',
  '4. Mỗi tin thêm 1 câu "vì sao tin này đáng đọc" (tối đa 200 ký tự): NGẮN, CỤ THỂ, chỉ nói TÁC ĐỘNG tới người đọc Việt Nam (giá cả, lãi suất, công việc, chi tiêu thay đổi thế nào) — KHÔNG gợi ý người đọc làm gì, không dùng "cân nhắc", "nên", "có thể mua/bán/đầu tư/giữ". Ví dụ tin về lãi suất thì nói ảnh hưởng tới lãi vay ngân hàng/lãi tiết kiệm; tin về giá vàng, tỉ giá, chứng khoán thì nói ảnh hưởng tới giá trong nước; tin công nghệ thì nói ảnh hưởng tới người dùng/công việc ở Việt Nam. Không viết chung chung kiểu "tin này rất quan trọng".',
  '5. Trả về DUY NHẤT một mảng JSON, mỗi phần tử là một đối tượng {"summary": "<tóm tắt>", "why": "<vì sao đáng đọc>"}, theo ĐÚNG thứ tự tin đầu vào, không thêm chữ nào ngoài JSON.',
].join('\n');

async function summarizeBatch(apiKey, batch) {
  const numbered = batch.map((it, i) => `${i + 1}. [${it.source}] ${it.title}${it.description ? ' — ' + it.description : ''}`).join('\n');
  const userText = `Tóm tắt ${batch.length} tin sau (trả về mảng JSON gồm đúng ${batch.length} đối tượng {"summary", "why"}):\n${numbered}`;
  const fetchText = async () => {
    try {
      const res = await callPollinations([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ], 3072);
      const j = await res.json();
      return j?.choices?.[0]?.message?.content || '';
    } catch (e) {
      console.warn(`Pollinations lỗi: ${e.message || e} — thử Gemini dự phòng.`);
      if (!apiKey) throw new Error('Pollinations lỗi và không có GEMINI_API_KEY để dự phòng.');
      const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userText }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      };
      const res = await callGemini(apiKey, body);
      const j = await res.json();
      return j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    }
  };
  // Model mở đôi khi trả JSON lỗi (dấu ngoặc thiếu, chuỗi chưa đóng) — thử
  // lại 1 lần thì thường trả đúng; không để 1 lần lỗi làm mất cả batch 5 tin
  // (đã xảy ra thật 18/11: batch 1 lỗi JSON, mất 5/18 tin).
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let text = '';
    try {
      text = await fetchText();
    } catch (e) {
      lastErr = e;
      if (attempt < 2) { console.warn(`Batch lỗi lần ${attempt}: ${e.message || e} — chờ 15s thử lại.`); await sleep(15000); continue; }
      throw e;
    }
    try {
      const arr = parseJsonArray(text);
      if (!Array.isArray(arr) || arr.length !== batch.length) throw new Error('Model trả JSON không đúng số lượng');
      // Chuẩn mới: mỗi phần tử là {summary, why}. Dung sai: chuỗi thuần (dạng cũ)
      // thì coi là summary, why rỗng — để một lần trả về lệch định dạng không làm
      // mất cả loạt tóm tắt. stripAdvice(): trường nào lọt ngôn ngữ gợi ý đầu tư
      // thì để trống.
      return arr.map((el) => {
        if (typeof el === 'string') return { summary: stripAdvice(trimSummary(el)), why: '' };
        if (el && typeof el === 'object') {
          return { summary: stripAdvice(trimSummary(el.summary)), why: stripAdvice(trimWhy(el.why)) };
        }
        return { summary: '', why: '' };
      });
    } catch (e) {
      lastErr = e;
      console.warn(`Batch trả JSON lỗi lần ${attempt}: ${e.message || e}`);
      if (attempt < 2) { console.warn('Thử lại batch này 1 lần.'); await sleep(15000); continue; }
      throw lastErr;
    }
  }
  throw lastErr || new Error('Không tóm tắt được batch');
}

async function main() {
  let raw;
  try {
    raw = JSON.parse(await readFile(join(DATA_DIR, 'news-raw.json'), 'utf8'));
  } catch (e) {
    console.error('KHÔNG đọc được src/data/news-raw.json — chạy fetch-data.mjs trước. ' + (e.message || e));
    process.exit(1);
  }
  const items = Array.isArray(raw.items) ? raw.items : [];
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('CẢNH BÁO: chưa có GEMINI_API_KEY — chỉ chạy được Pollinations, mất đường dự phòng Gemini.');
    console.warn('Thêm key: GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret, tên GEMINI_API_KEY.');
  }

  const groups = { ai: [], 'chung-khoan': [], crypto: [] };
  const base = (it, pair) => ({
    title: it.title,
    summary: pair.summary,
    why: pair.why,
    link: it.link,
    source: it.source,
    publishedAt: it.publishedAt || '',
  });
  const EMPTY = { summary: '', why: '' };

  const pairs = new Array(items.length).fill(EMPTY);
  let okCount = 0;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    try {
      const out = await summarizeBatch(apiKey, batch);
      out.forEach((p, k) => { pairs[i + k] = p; });
      okCount += batch.length;
      console.log(`Tóm tắt OK: tin ${i + 1}-${i + batch.length}/${items.length}`);
    } catch (e) {
      console.warn(`Lỗi tóm tắt tin ${i + 1}-${i + batch.length}: ${e.message || e} (để summary + why rỗng)`);
      // Hết quota thì các batch sau cũng lỗi y hệt — dừng luôn để khỏi đốt quota.
      if (/hết quota/i.test(e.message || '')) { console.warn('Hết quota Gemini — dừng tóm tắt, chờ đợt làm mới sau.'); break; }
    }
    // Pollinations tier anonymous giới hạn ~1 request/15 giây — chờ đủ 15s
    // trước batch sau (trừ batch cuối).
    if (i + BATCH < items.length) await sleep(15000);
  }
  items.forEach((it, i) => { if (GROUPS.includes(it.group)) groups[it.group].push(base(it, pairs[i])); });
  // summarized chỉ true khi CÓ tóm tắt thật (trước đây ghi true cả khi 0/18).
  await writeFile(join(DATA_DIR, 'news.json'), JSON.stringify({
    updatedAt: new Date().toISOString(), summarized: okCount > 0,
    ...(okCount > 0 ? { model: MODEL_USED } : {}), groups,
  }, null, 2) + '\n', 'utf8');
  console.log(`Đã ghi news.json: ${okCount}/${items.length} tin có tóm tắt.`);
}

await main();
