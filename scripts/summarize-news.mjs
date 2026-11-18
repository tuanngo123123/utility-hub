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
// Mỗi tin còn có trường `why`: 1 SỰ KIỆN CỤ THỂ trong bài (con số, tên,
// quyết định) — không phải câu bình luận chung chung — và trường `titleVi`:
// tiêu đề tiếng Việt tự viết (tối đa ~90 ký tự), hiển thị thay tiêu đề
// tiếng Anh gốc (giữ `title` gốc trong dữ liệu để đối chiếu).
// Số + đơn vị chuẩn hoá kiểu Việt ở bước hậu xử lý normalizeNumbersVi()
// ("65 B $" -> "65 tỷ USD") vì model mở hay viết sai dù prompt đã cấm;
// cụm bình luận sáo rỗng bị chặn bởi BANNED_PHRASES + stripBannedSentences().
// Kiểm cuối (đợt sửa UX 19/11, Claude bắt): câu why trùng ý summary thì bỏ
// hẳn (whyDuplicatesSummary — Jaccard >= 0,30 và không có số mới); tít Việt
// có số không nằm trong tít gốc/mô tả RSS thì hỏi lại 1 lần, vẫn lệch thì
// để trống titleVi để hiển thị rơi về tít gốc (titleNumbersMatch — chỉ bắt
// được LỖI SỐ, lỗi nghĩa "tăng/đạt" dựa vào quy tắc 1c trong prompt).
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

// Kiểm tra tiếng Việt: tóm tắt tiếng Việt dài cả trăm ký tự gần như luôn có
// dấu (của, đã, là, với, tăng, giảm...). Model mở đôi khi trả lại nguyên câu
// tiếng Anh trong mô tả gốc (đã xảy ra thật 18/11: 1/18 tin) — batch nào có
// trường không phải tiếng Việt thì thử lại, thử lại vẫn lỗi thì để trống.
const VI_DIACRITIC = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
function looksVietnamese(t) {
  return !t || VI_DIACRITIC.test(t);
}
// Kiểm tiếng Việt cho TIÊU ĐỀ (ngắn — có thể không có dấu, vd "Nvidia mua
// startup"): có dấu HOẶC chứa từ tiếng Việt thông dụng. Tiêu đề tiếng Anh
// nguyên văn không chứa từ nào trong danh sách này.
const VI_COMMON_WORDS = new Set('là của và đã cho với trong sau khi lên xuống tăng giảm thêm mới nhất hơn ra mắt đầu tư công ty thị trường giá cổ phiếu lợi nhuận doanh thu sản phẩm công nghệ người dùng triệu tỷ đồng tháng năm ngày trước đang sẽ có không được bị về ngoài từ đến tại theo nhưng vì nếu thì mua bán vượt đạt mất nhận công bố ký kết ra mắt gọi vốn niêm yết phá sản kiện cáo'.split(' '));
function looksVietnameseTitle(t) {
  const s = String(t || '').trim();
  if (!s) return false;
  if (VI_DIACRITIC.test(s)) return true;
  return s.toLowerCase().split(/[^a-zà-ỹđ]+/i).some((w) => VI_COMMON_WORDS.has(w));
}
const ADVICE_PHRASES = ['nên mua', 'nên bán', 'nên đầu tư', 'nên giữ', 'nên nắm giữ', 'cân nhắc đầu tư', 'cân nhắc mua', 'cân nhắc bán', 'đáng mua', 'đáng đầu tư', 'cơ hội mua', 'khuyến nghị', 'đa dạng hoá danh mục', 'đa dạng hóa danh mục'];
function stripAdvice(text) {
  const low = String(text || '').toLowerCase();
  if (ADVICE_PHRASES.some((p) => low.includes(p))) return '';
  return text;
}
// Lưới lọc góc Việt Nam (Tuấn quyết 18/11: Điểm báo KHÔNG đăng nội dung
// về Việt Nam — dễ vi phạm; gốc rễ là prompt rule 4 cũ từng bắt model
// gắn mọi tin với người đọc Việt Nam nên 27/36 tin lọt góc Việt Nam).
// Trường nào nhắc Việt Nam thì để trống, giống stripAdvice.
function stripVietnam(text) {
  if (/việt nam|vietnam|người việt/i.test(String(text || ''))) return '';
  return text;
}
// Lưới lọc mệnh đề tiếng Anh lọt trong tóm tắt (đã xảy ra thật 18/11:
// tin Nvidia đầu tiên có vế đầu bằng tiếng Anh, vế sau tiếng Việt —
// looksVietnamese() kiểm cả đoạn nên vẫn qua vì vế sau có dấu). Tách
// tóm tắt thành từng mệnh đề theo dấu , . ; : ! ? — mệnh đề nào có từ
// 4 từ trở lên, không có dấu tiếng Việt mà có từ chức năng tiếng Anh
// (the, of, to, is...) thì lược bỏ. Tên riêng nước ngoài được giữ vì
// chúng nằm trong mệnh đề tiếng Việt (có dấu) hoặc ngắn hơn 4 từ. Sau
// khi lược, bỏ từ nối đầu câu còn trơ lại (nhưng/và...) và viết hoa
// chữ đầu để câu còn lại đứng được một mình.
const EN_WORDS = new Set('a an the of to and in is are was were has have had with for by from after before says said will would can could should its it this that these those as on at be been being not no but or if then than more most other new over under between through into about up out'.split(' '));
function stripEnglishClauses(text) {
  const t = String(text || '');
  if (!t) return t;
  const parts = t.split(/(?<=[,.;:!?])\s+/);
  const kept = parts.filter(function (p) {
    const words = p.trim().split(/\s+/).filter(Boolean);
    if (words.length < 4) return true;
    if (VI_DIACRITIC.test(p)) return true;
    const hasEn = words.some(function (w) { return EN_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, '')); });
    return !hasEn;
  });
  let out = kept.join(' ').replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  if (kept.length < parts.length) {
    out = out.replace(/^(nhưng|tuy nhiên|và|còn|thì)\s+/i, '');
    out = out.replace(/^([a-zà-ỹđ])/, function (m) { return m.toUpperCase(); });
  }
  return out;
}
// Chuẩn hoá số + đơn vị theo kiểu Việt (đợt sửa UX 19/11 — model mở hay
// viết "65 B $", "$2.5B", "$10M" dù prompt đã cấm): B/billion -> tỷ,
// M/million -> triệu, $ -> USD sau số; thập phân dấu phẩy, nghìn dấu chấm.
// "65 B $" -> "65 tỷ USD"; "$2.5B" -> "2,5 tỷ USD"; "$10M" -> "10 triệu
// USD"; "$604.000" -> "604.000 USD". KHÔNG đụng "3M" (tên công ty — chỉ
// chuẩn hoá khi có $ đi kèm hoặc hậu tố B/M đứng sau số có $).
function fixViNum(s) {
  const t = String(s);
  if (t.includes(',') && t.includes('.')) {
    // Kiểu Anh "1,234.56": bỏ phẩy nghìn, chấm thập phân -> phẩy, thêm chấm nghìn.
    const parts = t.replace(/,/g, '').split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.length > 1 ? intPart + ',' + parts.slice(1).join('') : intPart;
  }
  // Chỉ có chấm: ".000" (3 chữ số) là nghìn — giữ; ".5" (1-2 chữ số) là
  // thập phân — đổi sang phẩy.
  return t.replace(/(\d)\.(\d{1,2})(?!\d)/g, '$1,$2');
}
const NUM = '(\\d(?:[\\d.,]*\\d)?)';
function normalizeNumbersVi(text) {
  let t = String(text || '');
  if (!t) return t;
  const unit = (u) => (String(u).toUpperCase() === 'B' ? ' tỷ USD' : ' triệu USD');
  // $2.5B / $10M / $65B (kèm hậu tố B/M, có thể viết "billion"/"million").
  t = t.replace(new RegExp('\\$\\s*' + NUM + '\\s*([BM])(?:illion)?\\b', 'gi'),
    (m, num, u) => fixViNum(num) + unit(u));
  // 65 B $ / 65B$ (số + B/M + $ ở sau).
  t = t.replace(new RegExp(NUM + '\\s*([BM])(?:illion)?\\s*\\$', 'gi'),
    (m, num, u) => fixViNum(num) + unit(u));
  // 65 B USD / 65 billion USD (số + B/M/billion/million + USD, không có $).
  t = t.replace(new RegExp(NUM + '\\s*([BM])(?:illion)?\\s+USD\\b', 'gi'),
    (m, num, u) => fixViNum(num) + unit(u));
  t = t.replace(new RegExp(NUM + '\\s*billion\\b', 'gi'), (m, num) => fixViNum(num) + ' tỷ USD');
  t = t.replace(new RegExp(NUM + '\\s*million\\b', 'gi'), (m, num) => fixViNum(num) + ' triệu USD');
  // $604.000 / $2.5 / $270 triệu (còn lại, không hậu tố B/M — "triệu"/"tỷ"
  // đi kèm thì giữ lại trước USD: "$270 triệu" -> "270 triệu USD", không
  // phải "270 USD triệu").
  t = t.replace(new RegExp('\\$\\s*' + NUM + '(?:\\s+(triệu|tỷ))?', 'g'),
    (m, num, u) => fixViNum(num) + (u ? ' ' + u + ' USD' : ' USD'));
  // 604.000$ (số + $ ở sau).
  t = t.replace(new RegExp(NUM + '\\s*\\$(?:\\s+(triệu|tỷ))?', 'g'),
    (m, num, u) => fixViNum(num) + (u ? ' ' + u + ' USD' : ' USD'));
  // "tỷ đô la" / "triệu đô la" / "X đô la" -> USD.
  t = t.replace(/(\d[\d.,]*)\s*(tỷ|triệu)\s*đô la\b/gi, '$1 $2 USD');
  t = t.replace(/(\d[\d.,]*)\s*đô la\b/gi, '$1 USD');
  // Dọn "USD USD" thừa (khi bản gốc đã có USD mà vẫn lọt qua một rule trên).
  t = t.replace(/\bUSD\s+USD\b/g, 'USD');
  return t;
}
// Cụm bình luận sáo rỗng — model hay nhét vào câu "vì sao đáng đọc" (đã
// xảy ra thật 18/11: "cho thấy sức mạnh tài chính"). Tin nào còn cụm này
// thì hỏi lại AI 1 lần với nhắc viết lại bằng sự kiện cụ thể; vẫn còn thì
// bỏ câu đó (stripBannedSentences) — không bao giờ để lọt vào news.json.
const BANNED_PHRASES = ['sức ép thị trường', 'sức mạnh tài chính', 'cho thấy sức mạnh', 'đánh dấu bước ngoặt', 'mở ra kỷ nguyên'];
function hasBannedPhrase(text) {
  const low = String(text || '').toLowerCase();
  return BANNED_PHRASES.some((p) => low.includes(p));
}
function stripBannedSentences(text) {
  const t = String(text || '');
  if (!t || !hasBannedPhrase(t)) return t;
  const parts = t.split(/(?<=[.!?])\s+/);
  return parts.filter((p) => !hasBannedPhrase(p)).join(' ').trim();
}
// --- Kiểm câu "vì sao đáng đọc" có trùng ý tóm tắt không (đợt sửa UX
// 19/11, Claude bắt: câu 2 hay lặp lại đúng ý câu 1, vd tóm tắt nói "dự
// báo doanh thu kỷ lục sẽ tiếp tục" thì why cũng nói "dự báo doanh thu
// tăng liên tục"). Bỏ why khi (i) mọi số trong why đều đã có trong
// summary VÀ (ii) độ trùng từ nội dung (Jaccard trên tập từ đã lọc
// stopword) >= 0,30. Ngưỡng 0,30 (hạ từ 0,5 ngày 19/11 sau khi parent
// đọc tay cả 10 tin ở vùng 0,30–0,50: 9/10 là lặp lại rõ ràng, kể cả
// ví dụ Claude nêu J=0,38; 1 tin biên — Xi/APEC — chỉ thêm chi tiết
// phụ "trước cuộc gặp với Trump và Putin" nên bỏ cũng được). Dưới 0,30
// vẫn còn vài cách diễn lại lọt (vd Nvidia mã nguồn mở J=0,29) — ngưỡng
// thấp hơn nữa sẽ bỏ oan why có ý mới (vd vệ tinh J=0,26 nêu hợp đồng
// đã ký, không có trong tóm tắt), nên dừng ở 0,30; prompt quy tắc 4
// (why phải là 1 sự kiện cụ thể) là lớp chắn còn lại.
// thì GIỮ — số mới là thông tin mới. Trang hiển thị đã bỏ sẵn câu why
// khi why rỗng (home.js/app.js/build.mjs đều kiểm item.why) nên tin bị
// bỏ why chỉ hiện 1 câu tóm tắt.
const VI_STOPWORDS = new Set('của đã là và với trong sau khi cho về từ đến tại theo nhưng vì nếu thì mà để có không được bị đang sẽ một các những này đó ấy như trên dưới vào ra lên xuống ở cũng còn lại rồi mới chỉ từng vẫn cứ hay hoặc nên cần phải bởi qua giữa trước ngay cả hơn nhất rất quá lắm đều cùng mỗi mọi bao nhiêu gì nào ai đâu sao thế vậy ơi à ạ nhé nha ừ hả'.split(' '));
function contentWords(text) {
  return new Set(
    String(text || '').toLowerCase()
      .replace(/[^a-zà-ỹđ0-9\s]/gi, ' ')
      .split(/\s+/).filter(Boolean)
      .filter((w) => !VI_STOPWORDS.has(w) && !/\d/.test(w))
  );
}
// Số trong câu tiếng Việt (kiểu Việt: chấm = nghìn, phẩy = thập phân):
// "65 tỷ" -> 65; "604.000" -> 604000; "2,5" -> 2.5. Trả về tập số.
function extractNumbersVi(text) {
  const out = new Set();
  for (const m of String(text || '').matchAll(/\d[\d.,]*/g)) {
    const raw = m[0].replace(/[.]+$/, '');
    const v = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (!Number.isNaN(v)) out.add(v);
  }
  return out;
}
function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 1 : inter / union;
}
export function whyDuplicatesSummary(summary, why) {
  const w = String(why || '').trim();
  if (!w) return false;
  const sNums = extractNumbersVi(summary);
  for (const n of extractNumbersVi(w)) if (!sNums.has(n)) return false;
  return jaccard(contentWords(summary), contentWords(w)) >= 0.3;
}
// --- Soi lại số liệu tít Việt so với tít gốc (đợt sửa UX 19/11, Claude
// bắt: tít Việt viết "tăng 65 tỷ USD" trong khi bài gốc nói danh mục LÊN
// TỚI 65 tỷ USD — sai nghĩa, không chỉ gượng). Kiểm bằng máy chỉ bắt được
// LỖI SỐ (số trong tít Việt không có trong nguồn); lỗi nghĩa "tăng" hay
// "đạt/lên tới" KHÔNG bắt được bằng số — dựa vào quy tắc 1c trong prompt
// bắt model đối chiếu lại với tít gốc trước khi viết.
// Quy tắc kiểm (đã chỉnh sau khi chạy thử trên 35 tin thật 19/11): mọi số
// trong titleVi phải có trong TIÊU ĐỀ GỐC hoặc MÔ TẢ RSS (nguồn mà AI
// được đọc) — so chỉ với tít gốc thì báo sai 6/35 tin, vì AI lấy số đúng
// từ mô tả (vd tít gốc "Hydropower hit record lows" không có số, mô tả
// có "28% less", tít Việt "giảm 28%" là ĐÚNG). Chỉ kiểm chiều "số trong
// tít Việt có trong nguồn không" (bắt số bịa/sai); KHÔNG bắt chiều ngược
// (tít Việt bỏ bớt số của tít gốc — bỏ số là lựa chọn biên tập, vd bỏ
// năm "2026" trong tít khuyến mãi là bình thường).
const UNIT_SCALE = { b: 1e9, billion: 1e9, 'tỷ': 1e9, m: 1e6, million: 1e6, 'triệu': 1e6, k: 1e3, thousand: 1e3, 'nghìn': 1e3 };
// Trích các số kèm đơn vị, quy về cùng thang (B/tỷ = 1e9, M/triệu = 1e6):
// "$65B" -> [65000000000]; "65 tỷ USD" -> [65000000000]; "$2.5B" và
// "2,5 tỷ USD" đều -> [2500000000]. locale 'en': phẩy = nghìn, chấm =
// thập phân; locale 'vi': chấm = nghìn, phẩy = thập phân. Số dính trong
// tên riêng (Web3, Q3, B2B) không tính — chỉ lấy số đứng riêng.
export function parseScaledNumbers(text, locale) {
  const out = [];
  // KHÔNG dùng \b sau nhóm đơn vị: \b của JS chỉ hiểu chữ ASCII nên sau
  // "tỷ" (kết thúc bằng ỷ) không có boundary — "65 tỷ" từng bị đọc thành
  // 65 thay vì 65e9. Dùng lookahead (?![a-zà-ỹđ]) thay thế: ký tự sau đơn
  // vị không được là chữ (để "B" trong "Bitcoin" không bị đọc thành tỷ).
  // Lookbehind (?<![A-Za-zÀ-ỹđ]) trước số: bỏ số dính trong tên (Web3).
  const re = /\$?\s*(?<![A-Za-zÀ-ỹđ])(\d[\d.,]*)\s*(billion|million|thousand|tỷ|triệu|nghìn|[BMK])?(?![a-zà-ỹđ])/gi;
  for (const m of String(text || '').matchAll(re)) {
    const raw = m[1].replace(/[.]+$/, '').replace(/[,]+$/, '');
    const v = locale === 'en'
      ? parseFloat(raw.replace(/,/g, ''))
      : parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (Number.isNaN(v)) continue;
    out.push(v * (UNIT_SCALE[(m[2] || '').toLowerCase()] || 1));
  }
  // Tên tháng tiếng Anh -> số tháng (chỉ phía nguồn 'en'): tít Việt hay
  // viết "tháng 11" trong khi tít gốc viết "November" — không quy đổi thì
  // số 11 bị coi là số bịa. "May" chỉ tính là tháng khi đi kèm năm/ngày
  // ("May 2026") vì "may" làm động từ ("may rise") xuất hiện quá nhiều
  // trong mô tả RSS — tính cả thì số 5 gần như luôn được cho qua.
  if (locale === 'en') {
    const monthRe = /\b(january|february|march|april|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi;
    for (const m of String(text || '').matchAll(monthRe)) out.push(EN_MONTHS[m[1].toLowerCase()]);
    if (/\bmay\s+\d{1,4}\b/i.test(String(text || ''))) out.push(5);
  }
  return out.sort((a, b) => a - b);
}
const EN_MONTHS = { january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12, jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
// Mọi số trong tít Việt phải có trong tít gốc hoặc mô tả RSS (cùng thang
// sau chuẩn hoá). Tít Việt không có số nào thì coi là khớp.
export function titleNumbersMatch(titleEn, titleVi, description = '') {
  const viNums = parseScaledNumbers(titleVi, 'vi');
  if (viNums.length === 0) return true;
  const allowed = parseScaledNumbers(String(titleEn || '') + ' ' + String(description || ''), 'en');
  const used = new Array(allowed.length).fill(false);
  return viNums.every((v) => {
    const i = allowed.findIndex((a, j) => !used[j] && Math.abs(a - v) <= Math.max(1, Math.abs(v) * 1e-9));
    if (i < 0) return false;
    used[i] = true;
    return true;
  });
}
const MAX_LEN = 260;
const WHY_MAX_LEN = 200;
const TITLE_MAX_LEN = 90;
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

// Tiêu đề tiếng Việt: ngắn gọn như tít báo, tối đa ~90 ký tự.
function trimTitleVi(s) {
  return trimText(s, TITLE_MAX_LEN);
}

const SYSTEM_PROMPT = [
  'Bạn tóm tắt tin tức nước ngoài sang tiếng Việt cho mục Điểm báo của một trang tiện ích.',
  'QUY TẮC BẮT BUỘC:',
  '1. Mỗi tin: tóm tắt đúng 1-2 câu, TỐI ĐA 260 ký tự, viết lại bằng lời của mình — KHÔNG dịch toàn văn, KHÔNG chép nguyên câu tiếng Anh. Mọi câu trong tóm tắt đều phải là tiếng Việt có dấu (chỉ tên riêng nước ngoài giữ tiếng Anh theo quy tắc 2); không để lọt mệnh đề tiếng Anh.',
  '1b. Tiêu đề tiếng Việt (titleVi): TỰ VIẾT ngắn gọn như tít báo Việt, tối đa ~90 ký tự, đúng nội dung bài gốc — KHÔNG dịch máy từng chữ tiêu đề tiếng Anh, KHÔNG chép nguyên tiêu đề gốc. Giữ tên riêng nước ngoài theo quy tắc 2.',
  '1c. Sau khi viết tiêu đề tiếng Việt, ĐỐI CHIẾU LẠI với tiêu đề gốc: số liệu phải khớp đúng; phân biệt "tăng" (tăng thêm bao nhiêu) với "đạt/lên tới" (đạt mức bao nhiêu); chủ ngữ và hành động phải đúng người đúng việc. Nếu tít gốc nói "reaches $65B" thì viết "lên tới 65 tỷ USD", KHÔNG viết "tăng 65 tỷ USD". Nếu tít gốc nói "up 5%" thì mới viết "tăng 5%".',
  '2. Chỉ nêu SỰ KIỆN (ai làm gì, con số nào, khi nào). Không thêm bình luận, không suy đoán, không thêm thông tin ngoài bản gốc. Chỉ dùng từ đúng nghĩa trong ngữ cảnh bài gốc — KHÔNG dùng cụm bình luận sáo rỗng: "sức ép thị trường", "sức mạnh tài chính", "cho thấy sức mạnh", "đánh dấu bước ngoặt", "mở ra kỷ nguyên". Giữ nguyên tên riêng nước ngoài (người, công ty, sản phẩm) theo bản gốc, KHÔNG phiên âm sang tiếng Việt — ví dụ viết "Donald Trump", "Vladimir Putin", "Jensen Huang", "Nvidia"; CHỈ có Xi Jinping viết là "Tập Cận Bình".',
  '3. TUYỆT ĐỐI KHÔNG dùng ngôn ngữ khuyến nghị đầu tư: không viết "nên mua", "nên bán", "nên đầu tư", "nên giữ", "cân nhắc đầu tư", "cân nhắc mua", "đáng mua", "đáng đầu tư", "cơ hội mua vào", "khuyến nghị", "đa dạng hoá danh mục" hay bất kỳ lời khuyên mua/bán/giữ tài sản nào — áp dụng cho cả tóm tắt lẫn câu "vì sao đáng đọc".',
  '4. Câu "vì sao đáng đọc" (tối đa 200 ký tự) phải là 1 SỰ KIỆN CỤ THỂ lấy trong bài gốc — một con số, một cái tên, một quyết định — KHÔNG phải câu bình luận chung chung. Không viết kiểu "cho thấy sức mạnh tài chính của…", "đánh dấu bước ngoặt…", "mở ra kỷ nguyên…". Ví dụ tốt: "Nvidia đang nắm cổ phần ở hơn 20 startup AI." — KHÔNG gợi ý người đọc làm gì, không dùng "cân nhắc", "nên", "có thể mua/bán/đầu tư/giữ". Không viết chung chung kiểu "tin này rất quan trọng".',
  '4b. TUYỆT ĐỐI KHÔNG nhắc tới Việt Nam trong tiêu đề, tóm tắt lẫn câu "vì sao đáng đọc": không viết "Việt Nam", "tại Việt Nam", "ở Việt Nam", "người Việt", "người Việt Nam", "doanh nghiệp Việt Nam", "người tiêu dùng Việt Nam" hay bất kỳ góc nhìn Việt Nam nào — chỉ nói tác động chung, không gắn với một nước cụ thể.',
  '5. Tiền tệ và đơn vị theo kiểu Việt: dùng "tỷ" cho billion, "triệu" cho million — viết "65 tỷ USD", "2,5 tỷ USD", "10 triệu USD", "604.000 USD"; số thập phân dùng dấu phẩy (2,5), nghìn dùng dấu chấm (604.000). KHÔNG viết ký hiệu "$", "B", "M" hay "đô la".',
  '6. Không lặp cùng một từ/cụm từ trong một câu: mỗi câu chỉ dùng mỗi từ quan trọng một lần — ví dụ không viết "ảnh hưởng tới giá XRP, ảnh hưởng tới người dùng"; nếu cần nói hai tác động thì gộp thành một vế ("ảnh hưởng tới giá XRP và tới người dùng") hoặc đổi từ ("tác động tới").',
  '7. Địa danh nước ngoài dùng tên tiếng Việt đã quen thuộc và THỐNG NHẤT trong toàn bộ bản tóm tắt: Thâm Quyến (không viết Shenzhen), Bắc Kinh, Thượng Hải, Quảng Châu, Hồng Kông... — riêng tên người/công ty/sản phẩm vẫn giữ tiếng Anh theo quy tắc 2.',
  '8. Trả về DUY NHẤT một mảng JSON, mỗi phần tử là một đối tượng {"titleVi": "<tiêu đề tiếng Việt>", "summary": "<tóm tắt>", "why": "<vì sao đáng đọc>"}, theo ĐÚNG thứ tự tin đầu vào, không thêm chữ nào ngoài JSON.',
].join('\n');

async function summarizeBatch(apiKey, batch, allowRepair = true, extraNote = '') {
  const numbered = batch.map((it, i) => `${i + 1}. [${it.source}] ${it.title}${it.description ? ' — ' + it.description : ''}`).join('\n');
  const userText = `Tóm tắt ${batch.length} tin sau (trả về mảng JSON gồm đúng ${batch.length} đối tượng {"titleVi", "summary", "why"}):\n${numbered}${extraNote ? '\n' + extraNote : ''}`;
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
  const parseOut = (text) => {
    const arr = parseJsonArray(text);
    if (!Array.isArray(arr) || arr.length !== batch.length) throw new Error('Model trả JSON không đúng số lượng');
    // Chuẩn mới: mỗi phần tử là {titleVi, summary, why}. Dung sai: chuỗi thuần (dạng cũ)
    // thì coi là summary, why rỗng — để một lần trả về lệch định dạng không làm
    // mất cả loạt tóm tắt. Chuỗi lọc (áp cho cả 3 trường): trim -> stripAdvice
    // (lọt ngôn ngữ gợi ý đầu tư thì để trống) -> stripVietnam (nhắc Việt Nam
    // thì để trống) -> stripEnglishClauses (lược mệnh đề tiếng Anh) ->
    // normalizeNumbersVi ("65 B $" -> "65 tỷ USD") -> stripBannedSentences
    // (bỏ câu chứa cụm bình luận sáo rỗng). Cờ _banned ghi lại tin nào từng
    // có cụm cấm TRƯỚC khi lọc (để hỏi lại AI viết lại bằng sự kiện cụ thể);
    // cờ bị gỡ trước khi trả về, không ghi vào news.json.
    const clean = (s, trimFn) => trimFn(stripBannedSentences(normalizeNumbersVi(stripEnglishClauses(stripVietnam(stripAdvice(trimFn(s)))))));
    return arr.map((el) => {
      if (typeof el === 'string') return { titleVi: '', summary: clean(el, trimSummary), why: '', _banned: hasBannedPhrase(el) };
      if (el && typeof el === 'object') {
        return {
          titleVi: clean(el.titleVi, trimTitleVi),
          summary: clean(el.summary, trimSummary),
          why: clean(el.why, trimWhy),
          _banned: hasBannedPhrase(el.summary) || hasBannedPhrase(el.why) || hasBannedPhrase(el.titleVi),
        };
      }
      return { titleVi: '', summary: '', why: '', _banned: false };
    });
  };
  // Model mở đôi khi trả JSON lỗi (dấu ngoặc thiếu, chuỗi chưa đóng) — thử
  // lại 1 lần thì thường trả đúng; không để 1 lần lỗi làm mất cả batch 5 tin
  // (đã xảy ra thật 18/11: batch 1 lỗi JSON, mất 5/18 tin).
  let out = null;
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      out = parseOut(await fetchText());
      break;
    } catch (e) {
      lastErr = e;
      console.warn(`Batch lỗi lần ${attempt}: ${e.message || e}`);
      if (attempt < 2) { console.warn('Thử lại batch này 1 lần.'); await sleep(15000); continue; }
      throw lastErr;
    }
  }
  // Sửa từng tin lỗi thay vì bỏ cả batch: gom các tin trả không phải tiếng
  // Việt (hoặc tóm tắt bị lọc thành trống — ví dụ toàn bộ bằng tiếng Anh
  // nên stripEnglishClauses lược hết), tiêu đề tiếng Việt thiếu/sai, số
  // liệu trong tít Việt lệch tít gốc (titleNumbersMatch), hoặc từng chứa
  // cụm bình luận sáo rỗng (cờ _banned — câu đó đã bị lược, hỏi lại để AI
  // viết lại bằng sự kiện cụ thể thay vì mất nội dung); hỏi lại riêng 1
  // lần (sau 15s, tôn trọng giới hạn Pollinations), kèm nhắc viết lại câu
  // sáo rỗng bằng sự kiện cụ thể và đối chiếu lại số liệu tít. Vẫn lỗi thì
  // để trống TỪNG TRƯỜNG lỗi (giữ lại trường tốt — trước đây để trống cả
  // tin làm mất tóm tắt tốt chỉ vì why lỗi).
  const badIdx = [];
  out.forEach((p, k) => {
    if (!p.summary || !looksVietnamese(p.summary) || !looksVietnamese(p.why) ||
      !p.titleVi || !looksVietnameseTitle(p.titleVi) || p._banned ||
      (p.titleVi && !titleNumbersMatch(batch[k].title, p.titleVi, batch[k].description))) badIdx.push(k);
  });
  if (allowRepair && badIdx.length > 0) {
    console.warn(`Batch có ${badIdx.length}/${batch.length} tin cần hỏi lại (không phải tiếng Việt / thiếu tít Việt / lệch số tít / có cụm sáo rỗng).`);
    await sleep(15000);
    try {
      const sub = await summarizeBatch(apiKey, badIdx.map((k) => batch[k]), false,
        'LƯU Ý: bản tóm tắt trước có câu bình luận chung chung (kiểu "cho thấy sức mạnh…", "đánh dấu bước ngoặt…"), tiêu đề chưa phải tiếng Việt, hoặc số liệu trong tiêu đề tiếng Việt lệch tiêu đề gốc. Viết lại các câu đó bằng SỰ KIỆN CỤ THỂ trong bài (con số, tên, quyết định), viết tiêu đề bằng tiếng Việt, và ĐỐI CHIẾU LẠI số liệu với tiêu đề gốc: số phải khớp đúng; "reaches $65B" là "lên tới 65 tỷ USD", KHÔNG phải "tăng 65 tỷ USD".');
      badIdx.forEach((k, j) => {
        const p = sub[j];
        out[k] = {
          titleVi: (p.titleVi && looksVietnameseTitle(p.titleVi)) ? p.titleVi : '',
          summary: (!p.summary || !looksVietnamese(p.summary)) ? '' : p.summary,
          why: (!looksVietnamese(p.why)) ? '' : p.why,
        };
      });
    } catch (e) {
      console.warn(`Hỏi lại vẫn lỗi (${e.message || e}) — để trống từng trường lỗi của ${badIdx.length} tin này.`);
      badIdx.forEach((k) => {
        const p = out[k];
        out[k] = {
          titleVi: (p.titleVi && looksVietnameseTitle(p.titleVi)) ? p.titleVi : '',
          summary: (!p.summary || !looksVietnamese(p.summary)) ? '' : p.summary,
          why: (!looksVietnamese(p.why)) ? '' : p.why,
        };
      });
    }
  } else if (badIdx.length > 0) {
    badIdx.forEach((k) => {
      const p = out[k];
      out[k] = {
        titleVi: (p.titleVi && looksVietnameseTitle(p.titleVi)) ? p.titleVi : '',
        summary: (!p.summary || !looksVietnamese(p.summary)) ? '' : p.summary,
        why: (!looksVietnamese(p.why)) ? '' : p.why,
      };
    });
  }
  // Kiểm cuối sau bước sinh + sửa lỗi (đợt sửa UX 19/11):
  // (1) Tít Việt vẫn lệch số so với tít gốc sau 1 lần hỏi lại -> để trống
  // titleVi để trang hiển thị rơi về tít gốc tiếng Anh, thay vì đăng tít
  // Việt sai số. (2) Câu why trùng ý summary -> bỏ hẳn why, tin chỉ hiện
  // 1 câu tóm tắt là đủ.
  out.forEach((p, k) => {
    if (p.titleVi && !titleNumbersMatch(batch[k].title, p.titleVi, batch[k].description)) {
      console.warn(`Tít Việt lệch số sau hỏi lại, giữ tít gốc: "${batch[k].title}" — tít Việt bị bỏ: "${p.titleVi}"`);
      p.titleVi = '';
    }
    if (p.why && whyDuplicatesSummary(p.summary, p.why)) {
      console.warn(`Bỏ câu why trùng ý summary: "${p.why}"`);
      p.why = '';
    }
  });
  // Gỡ cờ nội bộ trước khi trả về — news.json chỉ chứa titleVi/summary/why.
  out.forEach((p) => { delete p._banned; });
  return out;
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
    titleVi: pair.titleVi || '',
    summary: pair.summary,
    why: pair.why,
    link: it.link,
    source: it.source,
    publishedAt: it.publishedAt || '',
  });
  const EMPTY = { titleVi: '', summary: '', why: '' };

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
  // Đếm lại theo tóm tắt THẬT (sửa từng tin lỗi có thể để trống 1-2 tin
  // trong batch thành công — không đếm batch thành công thành tin có tóm tắt).
  okCount = pairs.filter((p) => p.summary).length;
  // summarized chỉ true khi CÓ tóm tắt thật (trước đây ghi true cả khi 0/18).
  await writeFile(join(DATA_DIR, 'news.json'), JSON.stringify({
    updatedAt: new Date().toISOString(), summarized: okCount > 0,
    ...(okCount > 0 ? { model: MODEL_USED } : {}), groups,
  }, null, 2) + '\n', 'utf8');
  console.log(`Đã ghi news.json: ${okCount}/${items.length} tin có tóm tắt, ${pairs.filter((p) => p.titleVi).length}/${items.length} tin có tiêu đề tiếng Việt.`);
}

// Chỉ chạy pipeline khi gọi trực tiếp (node scripts/summarize-news.mjs) —
// import module (để kiểm hàm whyDuplicatesSummary/titleNumbersMatch)
// thì không chạy main.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
