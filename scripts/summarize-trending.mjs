// summarize-trending.mjs — Viết dòng giải thích tiếng Việt cho repo GitHub
// trending.
// Nhà cung cấp CHÍNH: Pollinations (miễn phí, KHÔNG cần key) — endpoint tương
// thích OpenAI, model "openai" (= gpt-oss-20b). Thử thật 18/11/2026: chạy được,
// JSON đúng, tiếng Việt tốt, ~5s/lần. Gemini giữ lại làm DỰ PHÒNG (khi quota
// đã reset).
// Đọc src/data/trending.json (do fetch-data.mjs tạo) -> ghi lại cùng file, thêm
// trường `purpose` cho mỗi repo: 1 dòng tiếng Việt (tối đa 120 ký tự) giải thích
// repo DÙNG ĐỂ LÀM GÌ. Trang chủ ưu tiên hiện purpose, chưa có thì fallback về
// mô tả tiếng Anh gốc (xem trendingRowHtml trong src/pages/home.js và
// initTrending trong src/app.js).
// Key Gemini lấy từ biến môi trường GEMINI_API_KEY (trong GitHub Action:
// secrets.GEMINI_API_KEY). KHÔNG có key -> vẫn chạy bằng Pollinations, chỉ mất
// đường dự phòng. KHÔNG tự tạo key, KHÔNG nhúng key vào code. Chỉ 6 repo,
// 1 lần gọi batch.
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
async function callPollinations(messages) {
  let lastErr = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res;
    try {
      res = await fetch(POLLINATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'openai', messages, temperature: 0.3, max_tokens: 2048 }),
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
// Kiểm tra tiếng Việt: dòng tiếng Việt gần như luôn có dấu (trong, trình,
// duyệt, hiển thị...). Model mở đôi khi trả lại nguyên mô tả tiếng Anh —
// thử lại 1 lần, vẫn lỗi thì để trống (trang hiện mô tả tiếng Anh gốc).
const VI_DIACRITIC = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
function looksVietnamese(t) {
  return !t || VI_DIACRITIC.test(t);
}

const MAX_LEN = 120;

function trimPurpose(s) {
  let t = String(s || '').replace(/\s+/g, ' ').trim().replace(/^["“]|["”]$/g, '');
  if (t.length <= MAX_LEN) return t;
  t = t.slice(0, MAX_LEN);
  const cut = t.lastIndexOf(' ');
  return (cut > 60 ? t.slice(0, cut) : t).trim();
}

const SYSTEM_PROMPT = [
  'Bạn viết dòng giải thích tiếng Việt cho các repo GitHub trending, hiển thị trong mục Xu hướng của một trang tiện ích.',
  'QUY TẮC BẮT BUỘC:',
  '1. Mỗi repo: ĐÚNG 1 dòng, TỐI ĐA 120 ký tự, giải thích nó DÙNG ĐỂ LÀM GÌ, bằng tiếng Việt đời thường — ví dụ "Trợ lý AI viết code ngay trong trình soạn thảo", không dịch tên repo.',
  '2. Chỉ dựa vào tên repo, mô tả tiếng Anh và ngôn ngữ lập trình được cho. Không bịa thêm tính năng, không suy đoán ngoài thông tin có sẵn.',
  '3. Nếu mô tả không nói rõ repo làm gì, trả về chuỗi rỗng "" cho repo đó (trang sẽ hiện mô tả tiếng Anh gốc thay thế).',
  '4. Trả về DUY NHẤT một mảng JSON, mỗi phần tử là một đối tượng {"purpose": "<dòng tiếng Việt hoặc chuỗi rỗng>"}, theo ĐÚNG thứ tự repo đầu vào, không thêm chữ nào ngoài JSON.',
].join('\n');

async function summarizeBatch(apiKey, items, allowRepair = true) {
  const numbered = items.map((it, i) => {
    const lang = it.language ? ` [${it.language}]` : '';
    const desc = it.description ? ` — ${it.description}` : '';
    return `${i + 1}. ${it.name || ''}${lang}${desc}`;
  }).join('\n');
  const userText = `Viết dòng giải thích cho ${items.length} repo sau (trả về mảng JSON gồm đúng ${items.length} đối tượng {"purpose"}):\n${numbered}`;
  const fetchText = async () => {
    try {
      const res = await callPollinations([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ]);
      const j = await res.json();
      return j?.choices?.[0]?.message?.content || '';
    } catch (e) {
      console.warn(`Pollinations lỗi: ${e.message || e} — thử Gemini dự phòng.`);
      if (!apiKey) throw new Error('Pollinations lỗi và không có GEMINI_API_KEY để dự phòng.');
      const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userText }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      };
      const res = await callGemini(apiKey, body);
      const j = await res.json();
      return j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    }
  };
  const parseOut = (text) => {
    const arr = parseJsonArray(text);
    if (!Array.isArray(arr) || arr.length !== items.length) throw new Error('Model trả JSON không đúng số lượng');
    return arr.map((el) => {
      if (typeof el === 'string') return trimPurpose(el);
      if (el && typeof el === 'object') return trimPurpose(el.purpose);
      return '';
    });
  };
  // Chỉ 1 batch duy nhất — JSON lỗi 1 lần là mất cả 6 dòng tiếng Việt nên
  // thử lại 1 lần trước khi bỏ (model mở đôi khi trả JSON lỗi, thử lại
  // thường trả đúng).
  let out = null;
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      out = parseOut(await fetchText());
      break;
    } catch (e) {
      lastErr = e;
      console.warn(`Lỗi lần ${attempt}: ${e.message || e}`);
      if (attempt < 2) { console.warn('Thử lại 1 lần.'); await sleep(15000); continue; }
      throw lastErr;
    }
  }
  // Sửa từng repo lỗi ngôn ngữ thay vì bỏ cả batch: hỏi lại riêng các repo
  // đó 1 lần (sau 15s); vẫn lỗi thì để trống repo đó (trang hiện mô tả
  // tiếng Anh gốc), giữ các repo tốt.
  const badIdx = [];
  out.forEach((p, k) => { if (!looksVietnamese(p)) badIdx.push(k); });
  if (allowRepair && badIdx.length > 0) {
    console.warn(`Có ${badIdx.length}/${items.length} dòng không phải tiếng Việt — hỏi lại riêng.`);
    await sleep(15000);
    try {
      const sub = await summarizeBatch(apiKey, badIdx.map((k) => items[k]), false);
      badIdx.forEach((k, j) => { out[k] = looksVietnamese(sub[j]) ? sub[j] : ''; });
    } catch (e) {
      console.warn(`Hỏi lại vẫn lỗi (${e.message || e}) — để trống ${badIdx.length} dòng này.`);
      badIdx.forEach((k) => { out[k] = ''; });
    }
  } else if (badIdx.length > 0) {
    badIdx.forEach((k) => { out[k] = ''; });
  }
  return out;
}

async function main() {
  let data;
  try {
    data = JSON.parse(await readFile(join(DATA_DIR, 'trending.json'), 'utf8'));
  } catch (e) {
    // Không đọc được file: cảnh báo và thoát êm — dòng tiếng Việt chỉ là
    // tăng thêm, không được làm hỏng cả đợt làm mới daily.
    console.warn('CẢNH BÁO: không đọc được src/data/trending.json — bỏ qua dòng tiếng Việt. ' + (e.message || e));
    return;
  }
  const items = Array.isArray(data.items) ? data.items : [];
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('CẢNH BÁO: chưa có GEMINI_API_KEY — chỉ chạy được Pollinations, mất đường dự phòng Gemini.');
  }

  let purposes = items.map(() => '');
  try {
    purposes = await summarizeBatch(apiKey, items);
    console.log(`Viết dòng tiếng Việt OK: ${purposes.filter(Boolean).length}/${items.length} repo có purpose.`);
  } catch (e) {
    console.warn(`Lỗi viết dòng tiếng Việt: ${e.message || e} (để purpose rỗng)`);
  }
  data.items = items.map((it, i) => ({ ...it, purpose: purposes[i] || '' }));
  // purposeSummarized chỉ true khi CÓ dòng tiếng Việt thật (trước đây ghi
  // true cả khi 0/6); model chỉ ghi khi có lần gọi thành công.
  const wroteCount = purposes.filter(Boolean).length;
  data.purposeSummarized = wroteCount > 0;
  if (wroteCount > 0) { data.purposeModel = MODEL_USED; } else { delete data.purposeModel; }
  delete data.purposeNote;
  await writeFile(join(DATA_DIR, 'trending.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Đã ghi trending.json: ${purposes.filter(Boolean).length}/${items.length} repo có purpose.`);
}

await main();
