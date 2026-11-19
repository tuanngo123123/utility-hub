// test-anh-the.mjs — Bộ kiểm tra công cụ Ảnh thẻ 3×4/4×6/2×3 +
// nén ảnh (logic thuần trong src/anh-the-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet,
// test-ma-tran, test-lop-hoc-3, test-chuyen-ma): kiểm nào trượt thì
// build thất bại để không đăng công cụ cắt ảnh sai cỡ lên web.
//
// Mọi số trong file này đều tự tính tay (ghi rõ phép tính):
// - px = cm / 2,54 × 300 (300 DPI): 3 cm = 354,33 → 354;
//   4 cm = 472,44 → 472; 6 cm = 708,66 → 709; 2 cm = 236,22 → 236;
//   10 cm = 1181,10 → 1181; 15 cm = 1771,65 → 1772.
// - Tờ in 1181×1772, khe cắt 12 px: 3×4 xuôi được 3 cột
//   (3×354 + 2×12 = 1086 ≤ 1181; 4 cột cần 1452 > 1181) và 3 hàng
//   (3×472 + 2×12 = 1440 ≤ 1772; 4 hàng cần 1924 > 1772) → 9 ảnh.
//   Đề bài ghi 8 ảnh là tính nhẩm sai — máy tính lại ra 9.
//   4×6 xuôi: 2 cột (2×472 + 12 = 956; 3 cột cần 1440 > 1181),
//   2 hàng (2×709 + 12 = 1430; 3 hàng cần 2151 > 1772) → 4 ảnh.
//   2×3 xoay (354×236): 3 cột (3×354 + 24 = 1086; 4 cột cần 1452),
//   7 hàng (7×236 + 6×12 = 1724; 8 hàng cần 1972 > 1772) → 21 ảnh,
//   nhiều hơn xếp xuôi (4×4 = 16) nên lấy xếp xoay.
import {
  DPI, cmToPx, SIZES, sizeById, sizePx, aspect,
  SHEET, sheetPx, sheetLayout, fmtBytes,
  cropRect, clampCrop, displayScale, defaultPan, clampPan,
  frameToSourceRect,
} from '../src/anh-the-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}

// --- Đổi cm sang px ở 300 DPI ---
check('DPI = 300', DPI, 300);
check('cmToPx(3) = 354 (3/2,54×300 = 354,33)', cmToPx(3), 354);
check('cmToPx(4) = 472 (472,44)', cmToPx(4), 472);
check('cmToPx(6) = 709 (708,66)', cmToPx(6), 709);
check('cmToPx(2) = 236 (236,22)', cmToPx(2), 236);
check('cmToPx(10) = 1181 (1181,10)', cmToPx(10), 1181);
check('cmToPx(15) = 1772 (1771,65)', cmToPx(15), 1772);

// --- Cỡ ảnh thẻ ---
check('SIZES đủ 3 cỡ theo đúng thứ tự', SIZES.map((s) => s.id), ['3x4', '4x6', '2x3']);
check("sizePx('3x4') = 354×472", sizePx('3x4'), { w: 354, h: 472 });
check("sizePx('4x6') = 472×709", sizePx('4x6'), { w: 472, h: 709 });
check("sizePx('2x3') = 236×354", sizePx('2x3'), { w: 236, h: 354 });
check("sizePx('lạ') dùng 3×4", sizePx('xxx'), { w: 354, h: 472 });
check("aspect('3x4') = 0,75", aspect('3x4'), 0.75);
check("aspect('4x6') = 2/3", aspect('4x6'), 2 / 3);
check("aspect('2x3') = 2/3", aspect('2x3'), 2 / 3);

// --- Tờ in 10×15 ---
check('SHEET 10×15 cm, khe 12 px', SHEET, { wCm: 10, hCm: 15, gapPx: 12 });
check('sheetPx() = 1181×1772', sheetPx(), { w: 1181, h: 1772 });

const lay34 = sheetLayout('3x4');
check('Tờ 3×4: 3 cột × 3 hàng = 9 ảnh, xếp xuôi',
  { cols: lay34.cols, rows: lay34.rows, count: lay34.count, rotated: lay34.rotated },
  { cols: 3, rows: 3, count: 9, rotated: false });
check('Tờ 3×4: căn giữa, lề trái 47, lề trên 166',
  { offsetX: lay34.offsetX, offsetY: lay34.offsetY }, { offsetX: 47, offsetY: 166 });

const lay46 = sheetLayout('4x6');
check('Tờ 4×6: 2 cột × 2 hàng = 4 ảnh, xếp xuôi',
  { cols: lay46.cols, rows: lay46.rows, count: lay46.count, rotated: lay46.rotated },
  { cols: 2, rows: 2, count: 4, rotated: false });
check('Tờ 4×6: căn giữa, lề trái 112, lề trên 171',
  { offsetX: lay46.offsetX, offsetY: lay46.offsetY }, { offsetX: 112, offsetY: 171 });

const lay23 = sheetLayout('2x3');
check('Tờ 2×3: 3 cột × 7 hàng = 21 ảnh, xếp xoay',
  { cols: lay23.cols, rows: lay23.rows, count: lay23.count, rotated: lay23.rotated },
  { cols: 3, rows: 7, count: 21, rotated: true });
check('Tờ 2×3: ô xếp 354×236, lề trái 47, lề trên 24',
  { cellW: lay23.cellW, cellH: lay23.cellH, offsetX: lay23.offsetX, offsetY: lay23.offsetY },
  { cellW: 354, cellH: 236, offsetX: 47, offsetY: 24 });

// Mọi cách xếp đều vừa trong tờ, không tràn mép.
for (const id of ['3x4', '4x6', '2x3']) {
  const l = sheetLayout(id);
  const fitW = l.offsetX + l.cols * l.cellW + (l.cols - 1) * l.gap <= l.sheetW;
  const fitH = l.offsetY + l.rows * l.cellH + (l.rows - 1) * l.gap <= l.sheetH;
  check(`Tờ ${id}: vừa trong tờ (${l.cols}×${l.cellW} + khe)`, fitW && fitH, true);
  // Thêm 1 cột hoặc 1 hàng nữa thì không vừa (xếp đã tối đa).
  const noMoreCol = (l.cols + 1) * l.cellW + l.cols * l.gap > l.sheetW;
  const noMoreRow = (l.rows + 1) * l.cellH + l.rows * l.gap > l.sheetH;
  check(`Tờ ${id}: thêm 1 cột thì tràn`, noMoreCol, true);
  check(`Tờ ${id}: thêm 1 hàng thì tràn`, noMoreRow, true);
}

// --- Định dạng dung lượng ---
check("fmtBytes(0) = '0 B'", fmtBytes(0), '0 B');
check("fmtBytes(500) = '500 B'", fmtBytes(500), '500 B');
check("fmtBytes(1023) = '1023 B'", fmtBytes(1023), '1023 B');
check("fmtBytes(1024) = '1,0 KB'", fmtBytes(1024), '1,0 KB');
check("fmtBytes(1536) = '1,5 KB'", fmtBytes(1536), '1,5 KB');
check("fmtBytes(1048576) = '1,00 MB'", fmtBytes(1048576), '1,00 MB');
check("fmtBytes(2621440) = '2,50 MB'", fmtBytes(2621440), '2,50 MB');
check("fmtBytes(12345678) = '11,77 MB'", fmtBytes(12345678), '11,77 MB');

// --- Khung cắt mặc định (căn giữa, lớn nhất, đúng tỷ lệ) ---
check('cropRect ảnh ngang 1200×800, tỷ lệ 3/4 → 600×800 ở giữa',
  cropRect(1200, 800, 0.75), { x: 300, y: 0, w: 600, h: 800 });
check('cropRect ảnh dọc 800×1200, tỷ lệ 3/4 → 800×1066 ở giữa',
  cropRect(800, 1200, 0.75), { x: 0, y: 67, w: 800, h: 1066 });
check('cropRect ảnh vuông 1000×1000, tỷ lệ 2/3 → 666×1000 ở giữa',
  cropRect(1000, 1000, 2 / 3), { x: 167, y: 0, w: 666, h: 1000 });

// --- Kẹp khung cắt vào trong ảnh ---
check('clampCrop: tràn trái-trên + to hơn ảnh → ôm vừa ảnh',
  clampCrop({ x: -5, y: 10, w: 200, h: 200 }, 100, 100), { x: 0, y: 0, w: 100, h: 100 });
check('clampCrop: tràn phải-dưới → đẩy vào trong',
  clampCrop({ x: 90, y: 90, w: 20, h: 20 }, 100, 100), { x: 80, y: 80, w: 20, h: 20 });
check('clampCrop: khung trong ảnh thì giữ nguyên',
  clampCrop({ x: 10, y: 10, w: 20, h: 20 }, 100, 100), { x: 10, y: 10, w: 20, h: 20 });

// --- Tỷ lệ hiển thị / kéo thả trong khung ---
check('displayScale: ảnh 1200×1600 vào khung 300×400, zoom 1 → 0,25',
  displayScale(300, 400, 1200, 1600, 1), 0.25);
check('displayScale: zoom 2 → 0,5',
  displayScale(300, 400, 1200, 1600, 2), 0.5);
check('displayScale: ảnh ngang 1600×1200 vào khung 300×400 → 1/3 (phủ kín chiều cao)',
  displayScale(300, 400, 1600, 1200, 1), 1 / 3);
check('defaultPan: ảnh hiển thị 600×800 trong khung 300×400 → căn giữa (-150, -200)',
  defaultPan(300, 400, 600, 800), { ox: -150, oy: -200 });
check('clampPan: kéo quá mép phải + quá mép dưới → kẹp về (0, -400)',
  clampPan(50, -900, 300, 400, 600, 800), { ox: 0, oy: -400 });
check('clampPan: vị trí hợp lệ giữ nguyên',
  clampPan(-100, -100, 300, 400, 600, 800), { ox: -100, oy: -100 });

// --- Khung thấy được ↔ vùng ảnh gốc (để cắt ra khi tải về) ---
check('frameToSourceRect: ảnh 1200×1600, khung 300×400, zoom 1, căn giữa → cả ảnh',
  frameToSourceRect(300, 400, 1200, 1600, 1, 0, 0), { x: 0, y: 0, w: 1200, h: 1600 });
check('frameToSourceRect: zoom 2, căn giữa → nửa giữa ảnh (600×800 ở 300,400)',
  frameToSourceRect(300, 400, 1200, 1600, 2, -150, -200), { x: 300, y: 400, w: 600, h: 800 });
const panNg = defaultPan(300, 400, 1600 * (1 / 3), 1200 * (1 / 3));
check('frameToSourceRect: ảnh ngang 1600×1200, zoom 1, căn giữa → 900×1200 ở giữa',
  frameToSourceRect(300, 400, 1600, 1200, 1, panNg.ox, panNg.oy), { x: 350, y: 0, w: 900, h: 1200 });

console.log(`test-anh-the: ${passed} đạt, ${failed} trượt.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
