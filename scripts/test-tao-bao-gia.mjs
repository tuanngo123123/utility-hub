// Kiểm tạo báo giá nhanh xuất PDF (src/bao-gia-logic.js).
// Công cụ: tao-bao-gia-nhanh — mọi điểm neo tính tay (xem đầu file
// logic). Gắn vào `npm run build`: build dừng nếu test này lỗi.
// Chạy riêng: node scripts/test-tao-bao-gia.mjs
import { VAT_RATES, MAX_ITEMS, roundMoney, fmtMoney, fmtQty, parseMoney, parseQty, moneyToWords, computeQuote, quoteRows, formatDateVi, quoteToText, sampleQuote, buildPdfFromJpegs } from '../src/bao-gia-logic.js';

let passed = 0;
let failed = 0;
const failures = [];
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { passed += 1; return; }
  failed += 1;
  failures.push(`${name}\n  kỳ vọng: ${e}\n  thực tế: ${a}`);
}
function checkQuote(name, actual, expected) {
  const pick = (o) => ({ subtotal: o.subtotal, discount: o.discount, afterDiscount: o.afterDiscount, vat: o.vat, total: o.total, words: o.words });
  check(name, pick(actual), expected);
}

// --- Hằng số + định dạng ---
check('VAT_RATES', VAT_RATES, [0, 0.08, 0.1]);
check('MAX_ITEMS', MAX_ITEMS, 50);
check('fmtMoney 4.400.000', fmtMoney(4400000), '4.400.000 ₫');
check('fmtMoney 0', fmtMoney(0), '0 ₫');
check('fmtQty nguyên', fmtQty(2), '2');
check('fmtQty lẻ', fmtQty(2.5), '2,5');
check('parseMoney chấm nghìn', parseMoney('1.250.000'), 1250000);
check('parseMoney rỗng', parseMoney(''), null);
check('parseMoney chữ', parseMoney('abc'), null);
check('parseMoney âm', parseMoney('-5'), null);
check('parseQty phẩy', parseQty('2,5'), 2.5);
check('parseQty rỗng', parseQty(''), null);
check('formatDateVi', formatDateVi('2026-11-20'), '20/11/2026');

// --- Đọc số tiền bằng chữ (quy tắc: lẻ/mốt/lăm/tư/không trăm) ---
check('chữ 0', moneyToWords(0), 'Không đồng');
check('chữ 5', moneyToWords(5), 'Năm đồng');
check('chữ 11', moneyToWords(11), 'Mười một đồng');
check('chữ 14', moneyToWords(14), 'Mười bốn đồng');
check('chữ 20', moneyToWords(20), 'Hai mươi đồng');
check('chữ 24', moneyToWords(24), 'Hai mươi tư đồng');
check('chữ 100', moneyToWords(100), 'Một trăm đồng');
check('chữ 101', moneyToWords(101), 'Một trăm lẻ một đồng');
check('chữ 105', moneyToWords(105), 'Một trăm lẻ năm đồng');
check('chữ 115', moneyToWords(115), 'Một trăm mười lăm đồng');
check('chữ 1.000', moneyToWords(1000), 'Một nghìn đồng');
check('chữ 1.005', moneyToWords(1005), 'Một nghìn không trăm lẻ năm đồng');
check('chữ 1.010', moneyToWords(1010), 'Một nghìn không trăm mười đồng');
check('chữ 15.000', moneyToWords(15000), 'Mười lăm nghìn đồng');
check('chữ 21.000', moneyToWords(21000), 'Hai mươi mốt nghìn đồng');
check('chữ 105.000', moneyToWords(105000), 'Một trăm lẻ năm nghìn đồng');
check('chữ 1.000.000', moneyToWords(1000000), 'Một triệu đồng');
check('chữ 1.000.005', moneyToWords(1000005), 'Một triệu không trăm lẻ năm đồng');
check('chữ 1.000.100', moneyToWords(1000100), 'Một triệu một trăm đồng');
check('chữ 3.250.000', moneyToWords(3250000), 'Ba triệu hai trăm năm mươi nghìn đồng');
check('chữ 4.400.000', moneyToWords(4400000), 'Bốn triệu bốn trăm nghìn đồng');
check('chữ 15.400.000', moneyToWords(15400000), 'Mười lăm triệu bốn trăm nghìn đồng');
check('chữ 999.999.999', moneyToWords(999999999), 'Chín trăm chín mươi chín triệu chín trăm chín mươi chín nghìn chín trăm chín mươi chín đồng');
check('chữ 1.000.000.000', moneyToWords(1000000000), 'Một tỷ đồng');
check('chữ 2.000.000.005', moneyToWords(2000000005), 'Hai tỷ không trăm lẻ năm đồng');
check('chữ 2.345.678.901', moneyToWords(2345678901), 'Hai tỷ ba trăm bốn mươi lăm triệu sáu trăm bảy mươi tám nghìn chín trăm lẻ một đồng');
check('chữ 10.000.000.000', moneyToWords(10000000000), 'Mười tỷ đồng');
check('chữ 1.000.000.000.000', moneyToWords(1000000000000), 'Một nghìn tỷ đồng');

// --- Tính báo giá ---
const SAMPLE_ITEMS = sampleQuote().items;
checkQuote('mẫu: 2 bàn + 2 ghế, VAT 10%',
  computeQuote({ items: SAMPLE_ITEMS, discountType: 'none', discountValue: 0, vatRate: 0.1 }),
  { subtotal: 4000000, discount: 0, afterDiscount: 4000000, vat: 400000, total: 4400000, words: 'Bốn triệu bốn trăm nghìn đồng' });
checkQuote('mẫu, VAT 8%',
  computeQuote({ items: SAMPLE_ITEMS, discountType: 'none', discountValue: 0, vatRate: 0.08 }),
  { subtotal: 4000000, discount: 0, afterDiscount: 4000000, vat: 320000, total: 4320000, words: 'Bốn triệu ba trăm hai mươi nghìn đồng' });
const ITEMS_3TR = [{ name: 'A', qty: 10, price: 250000 }, { name: 'B', qty: 5, price: 100000 }];
checkQuote('3tr, chiết khấu 10%, VAT 8%',
  computeQuote({ items: ITEMS_3TR, discountType: 'percent', discountValue: 10, vatRate: 0.08 }),
  { subtotal: 3000000, discount: 300000, afterDiscount: 2700000, vat: 216000, total: 2916000, words: 'Hai triệu chín trăm mười sáu nghìn đồng' });
checkQuote('3tr, chiết khấu 500.000₫, VAT 0%',
  computeQuote({ items: ITEMS_3TR, discountType: 'amount', discountValue: 500000, vatRate: 0 }),
  { subtotal: 3000000, discount: 500000, afterDiscount: 2500000, vat: 0, total: 2500000, words: 'Hai triệu năm trăm nghìn đồng' });
checkQuote('chiết khấu tiền vượt tạm tính → chặn bằng tạm tính',
  computeQuote({ items: ITEMS_3TR, discountType: 'amount', discountValue: 5000000, vatRate: 0.1 }),
  { subtotal: 3000000, discount: 3000000, afterDiscount: 0, vat: 0, total: 0, words: 'Không đồng' });
checkQuote('chiết khấu 150% → chặn 100%',
  computeQuote({ items: ITEMS_3TR, discountType: 'percent', discountValue: 150, vatRate: 0.1 }),
  { subtotal: 3000000, discount: 3000000, afterDiscount: 0, vat: 0, total: 0, words: 'Không đồng' });
checkQuote('số lượng lẻ 2,5 + dòng 0₫',
  computeQuote({ items: [{ name: 'Giờ công', qty: 2.5, price: 100000 }, { name: 'Tặng kèm', qty: 1, price: 0 }], discountType: 'none', discountValue: 0, vatRate: 0.1 }),
  { subtotal: 250000, discount: 0, afterDiscount: 250000, vat: 25000, total: 275000, words: 'Hai trăm bảy mươi lăm nghìn đồng' });
checkQuote('không hạng mục',
  computeQuote({ items: [], discountType: 'none', discountValue: 0, vatRate: 0.1 }),
  { subtotal: 0, discount: 0, afterDiscount: 0, vat: 0, total: 0, words: 'Không đồng' });
checkQuote('làm tròn: 3 × 33.333₫, VAT 8%',
  computeQuote({ items: [{ name: 'C', qty: 3, price: 33333 }], discountType: 'none', discountValue: 0, vatRate: 0.08 }),
  { subtotal: 99999, discount: 0, afterDiscount: 99999, vat: 8000, total: 107999, words: 'Một trăm lẻ bảy nghìn chín trăm chín mươi chín đồng' });
check('làm tròn dòng 1,5 × 999₫', computeQuote({ items: [{ name: 'D', qty: 1.5, price: 999 }], discountType: 'none', discountValue: 0, vatRate: 0 }).lines[0].amount, 1499);
check('VAT lạ → về 10%', computeQuote({ items: ITEMS_3TR, discountType: 'none', discountValue: 0, vatRate: 0.05 }).vatRate, 0.1);

// --- Hàng bảng cho PDF + bản văn bản ---
const rows = quoteRows(computeQuote({ items: SAMPLE_ITEMS, discountType: 'none', discountValue: 0, vatRate: 0.1 }));
check('hàng bảng mẫu', rows, [
  { stt: 1, name: 'Bàn làm việc gỗ', qty: 2, qtyText: '2', price: 1250000, priceText: '1.250.000 ₫', amount: 2500000, amountText: '2.500.000 ₫' },
  { stt: 2, name: 'Ghế văn phòng', qty: 2, qtyText: '2', price: 750000, priceText: '750.000 ₫', amount: 1500000, amountText: '1.500.000 ₫' },
]);
const txt = quoteToText(sampleQuote().meta, computeQuote({ items: SAMPLE_ITEMS, discountType: 'none', discountValue: 0, vatRate: 0.1 }));
check('bản văn bản có tiêu đề', txt.includes('BÁO GIÁ'), true);
check('bản văn bản có người bán', txt.includes('Công ty TNHH An Phát'), true);
check('bản văn bản có dòng hạng mục', txt.includes('1. Bàn làm việc gỗ — 2 × 1.250.000 ₫ = 2.500.000 ₫'), true);
check('bản văn bản có tổng cộng', txt.includes('TỔNG CỘNG: 4.400.000 ₫'), true);
check('bản văn bản có tiền bằng chữ', txt.includes('Bằng chữ: Bốn triệu bốn trăm nghìn đồng'), true);
check('bản văn bản phân biệt hóa đơn', txt.includes('Đây là báo giá, không phải hóa đơn GTGT.'), true);

// --- Trình ghi PDF viết tay: cấu trúc file hợp lệ ---
const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const pdf1 = buildPdfFromJpegs([{ jpeg: fakeJpeg, w: 100, h: 200, pageW: 595, pageH: 842 }]);
const pdf1Text = new TextDecoder().decode(pdf1);
check('PDF mở đầu %PDF-1.4', pdf1Text.startsWith('%PDF-1.4'), true);
check('PDF kết thúc %%EOF', pdf1Text.endsWith('%%EOF\n'), true);
check('PDF 1 trang', pdf1Text.includes('/Count 1'), true);
check('PDF có ảnh DCTDecode', pdf1Text.includes('/Filter /DCTDecode'), true);
// Kiểm bảng xref: mỗi offset phải trỏ đúng tới "N 0 obj".
function xrefOk(pdfText) {
  const xrefIdx = pdfText.indexOf('\nxref\n');
  if (xrefIdx < 0) return false;
  const trailerIdx = pdfText.indexOf('\ntrailer', xrefIdx);
  const xrefBody = pdfText.slice(xrefIdx + 6, trailerIdx);
  const lines = xrefBody.trim().split('\n');
  const count = parseInt(lines[0].split(' ')[1], 10);
  for (let id = 1; id < count; id++) {
    // lines[0] là dòng "0 N", lines[1] là mục của object 0 (trống),
    // nên mục của object id nằm ở lines[id + 1].
    const off = parseInt(lines[id + 1].slice(0, 10), 10);
    if (pdfText.slice(off, off + (String(id).length + 6)) !== id + ' 0 obj') return false;
  }
  const startxref = parseInt(pdfText.slice(pdfText.indexOf('startxref') + 9).trim(), 10);
  return pdfText.slice(startxref, startxref + 4) === 'xref';
}
check('PDF 1 trang: bảng xref đúng', xrefOk(pdf1Text), true);
const pdf2 = buildPdfFromJpegs([
  { jpeg: fakeJpeg, w: 100, h: 200, pageW: 595, pageH: 842 },
  { jpeg: fakeJpeg, w: 100, h: 200, pageW: 595, pageH: 842 },
]);
const pdf2Text = new TextDecoder().decode(pdf2);
check('PDF 2 trang', pdf2Text.includes('/Count 2'), true);
check('PDF 2 trang: bảng xref đúng', xrefOk(pdf2Text), true);

if (failed) {
  console.error(`test-tao-bao-gia: ${passed} đạt, ${failed} trượt:\n` + failures.join('\n---\n'));
  process.exit(1);
}
console.log(`test-tao-bao-gia: ${passed} đạt, 0 trượt.`);
