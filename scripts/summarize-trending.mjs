// summarize-trending.mjs — Viết dòng giải thích tiếng Việt cho repo GitHub
// trending bằng Gemini API (gói miễn phí).
// Đọc src/data/trending.json (do fetch-data.mjs tạo) -> ghi lại cùng file, thêm
// trường `purpose` cho mỗi repo: 1 dòng tiếng Việt (tối đa 120 ký tự) giải thích
// repo DÙNG ĐỂ LÀM GÌ. Trang chủ ưu tiên hiện purpose, chưa có thì fallback về
// mô tả tiếng Anh gốc (xem trendingRowHtml trong src/pages/home.js và
// initTrending trong src/app.js).
// Key lấy từ biến môi trường GEMINI_API_KEY (trong GitHub Action: secrets.GEMINI_API_KEY).
// KHÔNG có key -> ghi purpose rỗng + cảnh báo, không lỗi. KHÔNG tự tạo key,
// KHÔNG nhúng key vào code. Chỉ 6 repo, 1 lần gọi batch.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_DIR = join(ROOT, 'src', 'data');
// Model chính + dự phòng: Google có thể ngừng cấp model cũ cho key mới
// (gemini-2.5-flash trả 404 với key tạo 18/11/2026) — gặp 404 thì thử model sau.
const MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'];
let MODEL_USED = MODELS[0];
const apiUrl = (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;
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

async function summarizeBatch(apiKey, items) {
  const numbered = items.map((it, i) => {
    const lang = it.language ? ` [${it.language}]` : '';
    const desc = it.description ? ` — ${it.description}` : '';
    return `${i + 1}. ${it.name || ''}${lang}${desc}`;
  }).join('\n');
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: `Viết dòng giải thích cho ${items.length} repo sau (trả về mảng JSON gồm đúng ${items.length} đối tượng {"purpose"}):\n${numbered}` }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };
  let res = null;
  let lastErr = '';
  for (const m of MODELS) {
    res = await fetch(apiUrl(m), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
    if (res.ok) { MODEL_USED = m; break; }
    lastErr = `Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
    if (res.status !== 404) throw new Error(lastErr);
    console.warn(`Model ${m} không dùng được (404) — thử model sau.`);
    res = null;
  }
  if (!res) throw new Error(lastErr || 'Gemini: không model nào dùng được');
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const arr = JSON.parse(jsonText);
  if (!Array.isArray(arr) || arr.length !== items.length) throw new Error('Gemini trả JSON không đúng số lượng');
  return arr.map((el) => {
    if (typeof el === 'string') return trimPurpose(el);
    if (el && typeof el === 'object') return trimPurpose(el.purpose);
    return '';
  });
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
    console.warn('CẢNH BÁO: chưa có GEMINI_API_KEY — ghi trending.json với purpose rỗng (trang chủ hiện mô tả tiếng Anh như cũ).');
    console.warn('Thêm key: GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret, tên GEMINI_API_KEY.');
    data.items = items.map((it) => ({ ...it, purpose: '' }));
    data.purposeSummarized = false;
    data.purposeNote = 'Chưa có GEMINI_API_KEY nên chưa viết được dòng tiếng Việt.';
    delete data.purposeModel;
    await writeFile(join(DATA_DIR, 'trending.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Đã ghi trending.json: ${items.length} repo, purpose rỗng.`);
    return;
  }

  let purposes = items.map(() => '');
  try {
    purposes = await summarizeBatch(apiKey, items);
    console.log(`Viết dòng tiếng Việt OK: ${purposes.filter(Boolean).length}/${items.length} repo có purpose.`);
  } catch (e) {
    console.warn(`Lỗi viết dòng tiếng Việt: ${e.message || e} (để purpose rỗng)`);
  }
  data.items = items.map((it, i) => ({ ...it, purpose: purposes[i] || '' }));
  data.purposeSummarized = true;
  data.purposeModel = MODEL_USED;
  delete data.purposeNote;
  await writeFile(join(DATA_DIR, 'trending.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Đã ghi trending.json: ${purposes.filter(Boolean).length}/${items.length} repo có purpose.`);
}

await main();
