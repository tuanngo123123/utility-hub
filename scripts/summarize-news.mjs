// summarize-news.mjs — Tóm tắt tin RSS sang tiếng Việt bằng Gemini API (gói miễn phí).
// Đọc src/data/news-raw.json (do fetch-data.mjs tạo) -> ghi src/data/news.json.
// Key lấy từ biến môi trường GEMINI_API_KEY (trong GitHub Action: secrets.GEMINI_API_KEY).
// KHÔNG có key -> ghi news.json với summary + why rỗng (trang chủ vẫn hiện tiêu đề
// + nguồn + link) và in cảnh báo rõ ràng. KHÔNG tự tạo key, KHÔNG nhúng key vào code.
// Pháp lý: mỗi tin chỉ tóm tắt 1-2 câu, TỐI ĐA 260 ký tự, bằng lời của mình (không dịch
// toàn văn), kèm link gốc; prompt CẤM ngôn ngữ khuyến nghị đầu tư.
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
let MODEL_USED = MODELS[0];
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
      lastErr = `Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
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
  '2. Chỉ nêu SỰ KIỆN (ai làm gì, con số nào, khi nào). Không thêm bình luận, không suy đoán, không thêm thông tin ngoài bản gốc.',
  '3. TUYỆT ĐỐI KHÔNG dùng ngôn ngữ khuyến nghị đầu tư: không viết "nên mua", "nên bán", "nên đầu tư", "cơ hội mua vào", "đáng mua", "khuyến nghị" hay bất kỳ lời khuyên mua/bán/giữ tài sản nào — áp dụng cho cả tóm tắt lẫn câu "vì sao đáng đọc".',
  '4. Mỗi tin thêm 1 câu "vì sao tin này đáng đọc" (tối đa 200 ký tự): NGẮN, CỤ THỂ, nói rõ tác động hoặc lợi ích cho người đọc Việt Nam — ví dụ tin về lãi suất thì nói ảnh hưởng tới lãi vay ngân hàng/lãi tiết kiệm; tin về giá vàng, tỉ giá, chứng khoán thì nói ảnh hưởng tới giá trong nước; tin công nghệ thì nói ảnh hưởng tới người dùng/công việc ở Việt Nam. Không viết chung chung kiểu "tin này rất quan trọng".',
  '5. Trả về DUY NHẤT một mảng JSON, mỗi phần tử là một đối tượng {"summary": "<tóm tắt>", "why": "<vì sao đáng đọc>"}, theo ĐÚNG thứ tự tin đầu vào, không thêm chữ nào ngoài JSON.',
].join('\n');

async function summarizeBatch(apiKey, batch) {
  const numbered = batch.map((it, i) => `${i + 1}. [${it.source}] ${it.title}${it.description ? ' — ' + it.description : ''}`).join('\n');
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: `Tóm tắt ${batch.length} tin sau (trả về mảng JSON gồm đúng ${batch.length} đối tượng {"summary", "why"}):\n${numbered}` }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
  };
  const res = await callGemini(apiKey, body);
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const arr = JSON.parse(jsonText);
  if (!Array.isArray(arr) || arr.length !== batch.length) throw new Error('Gemini trả JSON không đúng số lượng');
  // Chuẩn mới: mỗi phần tử là {summary, why}. Dung sai: chuỗi thuần (dạng cũ)
  // thì coi là summary, why rỗng — để một lần trả về lệch định dạng không làm
  // mất cả loạt tóm tắt.
  return arr.map((el) => {
    if (typeof el === 'string') return { summary: trimSummary(el), why: '' };
    if (el && typeof el === 'object') {
      return { summary: trimSummary(el.summary), why: trimWhy(el.why) };
    }
    return { summary: '', why: '' };
  });
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

  if (!apiKey) {
    console.warn('CẢNH BÁO: chưa có GEMINI_API_KEY — ghi news.json với summary + why rỗng (trang chủ hiện tiêu đề + nguồn + link).');
    console.warn('Thêm key: GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret, tên GEMINI_API_KEY.');
    for (const it of items) if (GROUPS.includes(it.group)) groups[it.group].push(base(it, EMPTY));
    await writeFile(join(DATA_DIR, 'news.json'), JSON.stringify({
      updatedAt: new Date().toISOString(), summarized: false,
      note: 'Chưa có GEMINI_API_KEY nên chưa tóm tắt được.',
      groups,
    }, null, 2) + '\n', 'utf8');
    console.log(`Đã ghi news.json: ${items.length} tin, summary + why rỗng.`);
    return;
  }

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
    }
  }
  items.forEach((it, i) => { if (GROUPS.includes(it.group)) groups[it.group].push(base(it, pairs[i])); });
  await writeFile(join(DATA_DIR, 'news.json'), JSON.stringify({
    updatedAt: new Date().toISOString(), summarized: true, model: MODEL_USED, groups,
  }, null, 2) + '\n', 'utf8');
  console.log(`Đã ghi news.json: ${okCount}/${items.length} tin có tóm tắt.`);
}

await main();
