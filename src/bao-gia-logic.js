// Tạo báo giá nhanh xuất PDF — logic thuần. Một nguồn duy nhất cho
// cả trang công cụ (build.mjs chèn file này vào trang, trừ dòng
// export cuối, để init() gọi qua window.UH_BAOGIA) và bộ kiểm
// scripts/test-tao-bao-gia.mjs — số trên trang và trong test là một,
// theo đúng mẫu src/thue-nha-dat-logic.js.
//
// QUY ƯỚC TÍNH (đối chiếu 20/11/2026):
// - Tạm tính = tổng (số lượng × đơn giá) từng hạng mục, làm tròn
//   tới đồng. Số lượng lẻ được (ví dụ 2,5 giờ).
// - Chiết khấu: theo % (trên tạm tính, tối đa 100%) hoặc theo số
//   tiền (tối đa bằng tạm tính). VAT tính trên số tiền SAU chiết
//   khấu — đúng cách tính thuế GTGT trên giá đã trừ chiết khấu
//   thương mại.
// - VAT: 0% / 8% / 10% do người dùng chọn. Mức 8% áp dụng đến
//   31/12/2026 theo Nghị quyết 204/2025/QH15 + Nghị định
//   174/2025/NĐ-CP; từ 01/01/2027 về 10% nếu không được gia hạn
//   (ghi chú trong trang + FAQ).
// - Đọc số tiền bằng chữ: "lẻ" sau trăm (một trăm lẻ năm), "mốt"
//   sau mươi (hai mươi mốt), "lăm" sau mươi/mười (mười lăm),
//   "tư" sau mươi từ 2 trở lên (hai mươi tư; 14 vẫn "mười bốn"),
//   nhóm dưới 100 không phải nhóm đầu thì đọc "không trăm …"
//   (một nghìn không trăm lẻ năm). Đây là cách đọc phổ biến trong
//   chứng từ kế toán.
// - Trình ghi PDF viết tay (buildPdfFromJpegs) theo mẫu công cụ
//   Ảnh → PDF: nhúng ảnh JPEG vào file PDF, không cần thư viện.
//   pdf-lib không dùng được ở đây vì phông chuẩn của nó (WinAnsi)
//   không có dấu tiếng Việt, còn nhúng phông TTF thì cần fontkit
//   (chưa có trong repo). Báo giá được vẽ lên canvas bằng phông
//   Be Vietnam Pro của trang rồi nhúng vào PDF — chữ tiếng Việt
//   hiện đúng, đổi lại chữ trong PDF là ảnh (không chọn/cọp được
//   văn bản; nút Chép báo giá bù phần đó).

// Mức thuế GTGT người dùng chọn.
const VAT_RATES = [0, 0.08, 0.1];

// Số hạng mục tối đa trong một báo giá (đủ cho báo giá thường, và
// giữ file PDF gọn khi in nhiều trang).
const MAX_ITEMS = 50;

// Làm tròn tới đồng, cộng epsilon để tránh bẫy float (2,675 × 100).
function roundMoney(x) {
  return Math.round(x + 1e-9);
}

// Hiển thị số tiền kiểu Việt Nam: chấm ngăn nghìn + ₫.
function fmtMoney(n) {
  if (n == null || Number.isNaN(n)) return '';
  return Math.round(n).toLocaleString('vi-VN') + ' ₫';
}

// Hiển thị số lượng: số nguyên không có phần thập phân ("2"), còn
// lại tối đa 2 chữ số, dấu phẩy ("2,5").
function fmtQty(q) {
  if (q == null || Number.isNaN(q)) return '';
  const r = Math.round(q * 100 + 1e-9) / 100;
  if (Number.isInteger(r)) return String(r);
  return String(r).replace('.', ',');
}

// Đọc số tiền từ ô nhập: chấp nhận dấu chấm ngăn nghìn, khoảng
// trắng, dấu phẩy thập phân. Trả số >= 0, hoặc null khi ô trống,
// không phải số, hoặc âm (để giao diện báo lỗi thay vì đoán).
function parseMoney(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/[\s.]/g, '').replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

// Đọc số lượng: số thập phân >= 0, chấp nhận dấu phẩy. Trả null
// khi ô trống/không phải số/âm.
function parseQty(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

// --- Đọc số tiền bằng chữ tiếng Việt ---

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const GROUP_NAMES = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ'];

// Đọc phần chục + đơn vị của một nhóm 3 chữ số (t = chục, u = đơn
// vị). afterHundred = true khi nhóm có chữ số trăm (hoặc đọc kèm
// "không trăm") thì đơn vị lẻ phải thêm "lẻ" ("một trăm lẻ năm").
// Quy tắc: 15 = "mười lăm", 21 = "hai mươi mốt", 24 = "hai mươi
// tư", 14 = "mười bốn" (chỉ "tư" khi chục từ 2 trở lên).
function readTensUnits(t, u, afterHundred) {
  if (t === 0) {
    if (u === 0) return '';
    return (afterHundred ? 'lẻ ' : '') + DIGITS[u];
  }
  if (t === 1) {
    if (u === 0) return 'mười';
    if (u === 5) return 'mười lăm';
    return 'mười ' + DIGITS[u];
  }
  let s = DIGITS[t] + ' mươi';
  if (u === 0) return s;
  if (u === 1) return s + ' mốt';
  if (u === 5) return s + ' lăm';
  if (u === 4) return s + ' tư';
  return s + ' ' + DIGITS[u];
}

// Đọc một nhóm 3 chữ số (1–999). Nhóm không phải nhóm đầu mà nhỏ
// hơn 100 thì đọc kèm "không trăm" ("một nghìn không trăm lẻ năm",
// "một triệu không trăm mười lăm").
function readGroup(value, isLeading) {
  const h = Math.floor(value / 100);
  const t = Math.floor((value % 100) / 10);
  const u = value % 10;
  if (h === 0 && !isLeading) {
    return 'không trăm ' + readTensUnits(t, u, true);
  }
  let s = '';
  if (h > 0) s = DIGITS[h] + ' trăm';
  const rest = readTensUnits(t, u, h > 0);
  if (rest) s = s ? s + ' ' + rest : rest;
  return s;
}

// Đọc số tiền thành chữ, viết hoa chữ đầu, kết thúc bằng "đồng".
// Hỗ trợ tới 999 nghìn tỷ (số nguyên an toàn của JavaScript).
function moneyToWords(n) {
  let num = Math.round(Number(n) || 0);
  if (num < 0) num = 0;
  if (num === 0) return 'Không đồng';
  const groups = [];
  let rest = num;
  while (rest > 0) {
    groups.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    const isLeading = (i === groups.length - 1);
    let words = readGroup(g, isLeading);
    const gname = GROUP_NAMES[i] || '';
    if (gname) words += ' ' + gname;
    parts.push(words);
  }
  const s = parts.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + ' đồng';
}

// --- Tính báo giá ---
//
// input: { items: [{ name, qty, price }],
//   discountType: 'none' | 'percent' | 'amount',
//   discountValue: số (% hoặc đồng),
//   vatRate: 0 | 0.08 | 0.1 }
// Trả { lines: [{ name, qty, price, amount }], subtotal,
//   discountType, discountValue (đã giới hạn), discount,
//   afterDiscount, vatRate, vat, total, words }.
function computeQuote(input) {
  const inp = input || {};
  const items = Array.isArray(inp.items) ? inp.items : [];
  const lines = items.slice(0, MAX_ITEMS).map((it) => {
    const name = String((it && it.name) || '').trim();
    const qty = Math.max(0, Number(it && it.qty) || 0);
    const price = Math.max(0, Math.round(Number(it && it.price) || 0));
    return { name, qty, price, amount: roundMoney(qty * price) };
  });
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const discountType = inp.discountType === 'amount' ? 'amount'
    : inp.discountType === 'percent' ? 'percent' : 'none';
  let discount = 0;
  let discountValue = 0;
  if (discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, Number(inp.discountValue) || 0));
    discountValue = pct;
    discount = roundMoney(subtotal * pct / 100);
  } else if (discountType === 'amount') {
    discount = Math.min(subtotal, Math.max(0, Math.round(Number(inp.discountValue) || 0)));
    discountValue = discount;
  }
  const afterDiscount = subtotal - discount;
  const vatRate = VAT_RATES.indexOf(Number(inp.vatRate)) >= 0 ? Number(inp.vatRate) : 0.1;
  const vat = roundMoney(afterDiscount * vatRate);
  const total = afterDiscount + vat;
  return {
    lines, subtotal, discountType, discountValue, discount,
    afterDiscount, vatRate, vat, total, words: moneyToWords(total),
  };
}

// Hàng bảng cho PDF + bản văn bản: mỗi hạng mục một hàng, kèm số
// thứ tự và các cột đã định dạng sẵn (số lượng, đơn giá, thành
// tiền). Hàm thuần để bộ kiểm kiểm được nội dung bảng mà không cần
// render PDF thật.
function quoteRows(quote) {
  const q = quote || { lines: [] };
  return (q.lines || []).map((l, i) => ({
    stt: i + 1,
    name: l.name,
    qty: l.qty,
    qtyText: fmtQty(l.qty),
    price: l.price,
    priceText: fmtMoney(l.price),
    amount: l.amount,
    amountText: fmtMoney(l.amount),
  }));
}

// Ngày ISO (YYYY-MM-DD) → kiểu Việt Nam (DD/MM/YYYY).
function formatDateVi(iso) {
  const s = String(iso || '');
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  return m[3] + '/' + m[2] + '/' + m[1];
}

// Báo giá dạng văn bản thuần (nút Chép): mỗi hạng mục một dòng,
// rồi các dòng tạm tính / chiết khấu / VAT / tổng cộng + tiền bằng
// chữ + ghi chú + dòng phân biệt với hóa đơn.
function quoteToText(meta, quote) {
  const m = meta || {};
  const q = quote || computeQuote({ items: [] });
  const lines = [];
  lines.push('BÁO GIÁ');
  if (m.seller) lines.push('Người bán: ' + m.seller);
  if (m.contact) lines.push('Liên hệ: ' + m.contact);
  if (m.customer) lines.push('Khách hàng: ' + m.customer);
  if (m.date) lines.push('Ngày báo giá: ' + formatDateVi(m.date));
  lines.push('');
  quoteRows(q).forEach((r) => {
    lines.push(r.stt + '. ' + (r.name || '(chưa đặt tên)') + ' — ' + r.qtyText + ' × ' + r.priceText + ' = ' + r.amountText);
  });
  lines.push('');
  lines.push('Tạm tính: ' + fmtMoney(q.subtotal));
  if (q.discount > 0) {
    const how = q.discountType === 'percent'
      ? fmtQty(q.discountValue) + '%'
      : fmtMoney(q.discountValue);
    lines.push('Chiết khấu (' + how + '): -' + fmtMoney(q.discount));
  }
  lines.push('Thuế GTGT (' + fmtQty(q.vatRate * 100) + '%): ' + fmtMoney(q.vat));
  lines.push('TỔNG CỘNG: ' + fmtMoney(q.total));
  lines.push('Bằng chữ: ' + q.words);
  if (m.note) lines.push('Ghi chú: ' + m.note);
  lines.push('Đây là báo giá, không phải hóa đơn GTGT.');
  return lines.join('\n');
}

// Báo giá mẫu điền sẵn khi mở trang (đã tính tay, xem bộ kiểm):
// 2 bàn làm việc gỗ × 1.250.000₫ + 2 ghế văn phòng × 750.000₫ =
// tạm tính 4.000.000₫; không chiết khấu; VAT 10% = 400.000₫;
// tổng cộng 4.400.000₫ (Bốn triệu bốn trăm nghìn đồng).
function sampleQuote() {
  return {
    meta: {
      seller: 'Công ty TNHH An Phát',
      contact: '12 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
      customer: 'Anh Nguyễn Văn Bình',
      date: '',
      note: 'Báo giá có hiệu lực 15 ngày kể từ ngày báo giá.',
    },
    items: [
      { name: 'Bàn làm việc gỗ', qty: 2, price: 1250000 },
      { name: 'Ghế văn phòng', qty: 2, price: 750000 },
    ],
    discountType: 'none',
    discountValue: 0,
    vatRate: 0.1,
  };
}

// --- Trình ghi PDF viết tay (theo mẫu công cụ Ảnh → PDF) ---
//
// Ghi file PDF tối giản: mỗi trang 1 ảnh JPEG (DCTDecode). Không
// phụ thuộc DOM nên kiểm được trong Node.
// pages: [{jpeg: Uint8Array, w, h, pageW, pageH}] — w/h: px ảnh;
// pageW/pageH: điểm (pt, khổ A4 = 595 × 842).
function buildPdfFromJpegs(pages) {
  function fmt(n) {
    const s = n.toFixed(2);
    return s.replace(/\.?0+$/, '') || '0';
  }
  const enc = new TextEncoder();
  const parts = [];
  const offsets = {};
  let len = 0;
  function pushBytes(bytes) { parts.push(bytes); len += bytes.length; }
  function pushStr(s) { pushBytes(enc.encode(s)); }
  function pushObj(id, bodyStr, streamBytes) {
    offsets[id] = len;
    pushStr(id + ' 0 obj\n' + bodyStr + '\n');
    if (streamBytes) {
      pushStr('stream\n');
      pushBytes(streamBytes);
      pushStr('\nendstream\n');
    }
    pushStr('endobj\n');
  }
  pushStr('%PDF-1.4\n');
  const kids = pages.map(function (_, i) { return (3 + 3 * i) + ' 0 R'; }).join(' ');
  pushObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  pushObj(2, '<< /Type /Pages /Kids [' + kids + '] /Count ' + pages.length + ' >>');
  pages.forEach(function (pg, i) {
    const pageId = 3 + 3 * i;
    const imgId = 4 + 3 * i;
    const contentId = 5 + 3 * i;
    pushObj(pageId, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + fmt(pg.pageW) + ' ' + fmt(pg.pageH) + ']' +
      ' /Resources << /XObject << /Im0 ' + imgId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>');
    pushObj(imgId, '<< /Type /XObject /Subtype /Image /Width ' + pg.w + ' /Height ' + pg.h +
      ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.jpeg.length + ' >>', pg.jpeg);
    const scale = Math.min(pg.pageW / pg.w, pg.pageH / pg.h);
    const dw = pg.w * scale;
    const dh = pg.h * scale;
    const x = (pg.pageW - dw) / 2;
    const y = (pg.pageH - dh) / 2;
    const content = 'q ' + fmt(dw) + ' 0 0 ' + fmt(dh) + ' ' + fmt(x) + ' ' + fmt(y) + ' cm /Im0 Do Q';
    const contentBytes = enc.encode(content);
    pushObj(contentId, '<< /Length ' + contentBytes.length + ' >>', contentBytes);
  });
  const xrefPos = len;
  const maxId = 2 + 3 * pages.length;
  pushStr('xref\n0 ' + (maxId + 1) + '\n0000000000 65535 f \n');
  for (let id = 1; id <= maxId; id++) {
    const off = offsets[id];
    pushStr(('0000000000' + off).slice(-10) + ' 00000 n \n');
  }
  pushStr('trailer\n<< /Size ' + (maxId + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF\n');
  const out = new Uint8Array(len);
  let o = 0;
  parts.forEach(function (p) { out.set(p, o); o += p.length; });
  return out;
}

if (typeof window !== 'undefined') window.UH_BAOGIA = { VAT_RATES, MAX_ITEMS, roundMoney, fmtMoney, fmtQty, parseMoney, parseQty, moneyToWords, computeQuote, quoteRows, formatDateVi, quoteToText, sampleQuote, buildPdfFromJpegs };
export { VAT_RATES, MAX_ITEMS, roundMoney, fmtMoney, fmtQty, parseMoney, parseQty, moneyToWords, computeQuote, quoteRows, formatDateVi, quoteToText, sampleQuote, buildPdfFromJpegs };
