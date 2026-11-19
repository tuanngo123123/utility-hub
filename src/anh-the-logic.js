// Ảnh thẻ 3×4/4×6/2×3 + nén ảnh — logic thuần. Một nguồn duy
// nhất cho cả trang công cụ (build.mjs chèn file này vào trang, trừ
// dòng export cuối, để init() gọi qua window.UH_ANHTHE) và bộ kiểm
// scripts/test-anh-the.mjs — số trên trang và trong test là một,
// theo đúng mẫu src/ma-tran-logic.js và src/chuyen-ma-logic.js.
//
// QUY ƯỚC KÍCH THƯỚC (đối chiếu 20/11/2026):
// - Ảnh thẻ in ở 300 DPI; 1 inch = 2,54 cm nên px = cm / 2,54 × 300.
//   3×4 cm → 354×472 px; 4×6 cm → 472×709 px; 2×3 cm → 236×354 px.
// - Tờ in 10×15 cm → 1181×1772 px ở 300 DPI. Ảnh xếp có khe 12 px
//   (khoảng 1 mm) để cắt cho dễ, căn giữa tờ; thử cả xếp xuôi và
//   xếp xoay 90° rồi lấy cách xếp được nhiều ảnh hơn (hòa thì lấy
//   xếp xuôi). Số ảnh trên tờ: 3×4 → 9 (3×3 xuôi), 4×6 → 4 (2×2
//   xuôi), 2×3 → 21 (3×7 xoay). Đề bài ghi 3×4 xếp được 8 ảnh là
//   tính nhẩm sai — tính lại bằng máy: 3 cột vừa (3×354 + 2×12 =
//   1086 ≤ 1181), 3 hàng vừa (3×472 + 2×12 = 1440 ≤ 1772) nên 9
//   ảnh, không phải 8; bộ kiểm ghi rõ phép tính này.
// - Nén ảnh: xuất JPEG với chất lượng do người dùng chọn (90/70/50%);
//   ảnh PNG nền trong suốt thành nền trắng (JPEG không có kênh
//   trong suốt) — ghi rõ trong giao diện + FAQ.

// Độ phân giải in chuẩn cho ảnh thẻ.
const DPI = 300;
const CM_PER_INCH = 2.54;

// Đổi cm sang px ở 300 DPI, làm tròn số nguyên gần nhất.
function cmToPx(cm) {
  return Math.round((cm / CM_PER_INCH) * DPI);
}

// 3 cỡ ảnh thẻ (cm). Thứ tự hiển thị: 3×4 trước (dùng nhiều nhất).
const SIZES = [
  { id: '3x4', label: '3×4 cm', wCm: 3, hCm: 4 },
  { id: '4x6', label: '4×6 cm', wCm: 4, hCm: 6 },
  { id: '2x3', label: '2×3 cm', wCm: 2, hCm: 3 },
];

function sizeById(id) {
  const found = SIZES.find((s) => s.id === id);
  return found || SIZES[0];
}

// Kích thước ảnh thẻ tính bằng px ở 300 DPI.
function sizePx(id) {
  const s = sizeById(id);
  return { w: cmToPx(s.wCm), h: cmToPx(s.hCm) };
}

// Tỷ lệ khung cắt (rộng / cao): 3×4 = 0,75; 4×6 và 2×3 = 2/3.
function aspect(id) {
  const s = sizeById(id);
  return s.wCm / s.hCm;
}

// Tờ in ảnh 10×15 cm + khe cắt giữa các ảnh (px).
const SHEET = { wCm: 10, hCm: 15, gapPx: 12 };

function sheetPx() {
  return { w: cmToPx(SHEET.wCm), h: cmToPx(SHEET.hCm) };
}

// Cách xếp ảnh thẻ lên tờ in: trả về số cột, số hàng, tổng số ảnh,
// ảnh có xoay 90° không, kích thước ô xếp và vị trí bắt đầu (căn
// giữa tờ). Thử cả xuôi và xoay, lấy cách được nhiều ảnh hơn.
function sheetLayout(sizeId) {
  const sw = sheetPx().w;
  const sh = sheetPx().h;
  const gap = SHEET.gapPx;
  const pw = sizePx(sizeId).w;
  const ph = sizePx(sizeId).h;
  function tryLayout(w, h, rotated) {
    const cols = Math.floor((sw + gap) / (w + gap));
    const rows = Math.floor((sh + gap) / (h + gap));
    return { cols: cols, rows: rows, count: cols * rows, rotated: rotated };
  }
  const straight = tryLayout(pw, ph, false);
  const turned = tryLayout(ph, pw, true);
  const best = turned.count > straight.count ? turned : straight;
  const cellW = best.rotated ? ph : pw;
  const cellH = best.rotated ? pw : ph;
  const totalW = best.cols * cellW + (best.cols - 1) * gap;
  const totalH = best.rows * cellH + (best.rows - 1) * gap;
  return {
    sheetW: sw, sheetH: sh, photoW: pw, photoH: ph, gap: gap,
    cols: best.cols, rows: best.rows, count: best.count,
    rotated: best.rotated, cellW: cellW, cellH: cellH,
    offsetX: Math.floor((sw - totalW) / 2),
    offsetY: Math.floor((sh - totalH) / 2),
  };
}

// Hiển thị dung lượng theo kiểu Việt Nam: dưới 1 KB là "n B", dưới
// 1 MB là KB 1 chữ số thập phân, còn lại là MB 2 chữ số thập phân;
// dấu thập phân là dấu phẩy (cùng quy ước anh-sang-pdf.js).
function fmtBytes(n) {
  if (n == null || Number.isNaN(n) || n < 0) return '';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
  return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
}

// Khung cắt mặc định: hình chữ nhật lớn nhất đúng tỷ lệ, căn giữa
// ảnh. Trả {x, y, w, h} tính bằng px ảnh gốc.
function cropRect(imgW, imgH, ratio) {
  let w = imgW;
  let h = Math.floor(imgW / ratio);
  if (h > imgH) {
    h = imgH;
    w = Math.floor(imgH * ratio);
  }
  return {
    x: Math.floor((imgW - w) / 2),
    y: Math.floor((imgH - h) / 2),
    w: w,
    h: h,
  };
}

// Kẹp khung cắt vào trong ảnh (không cho tràn mép, không cho rộng
// hơn ảnh, mỗi chiều tối thiểu 1 px).
function clampCrop(r, imgW, imgH) {
  const w = Math.max(1, Math.min(r.w, imgW));
  const h = Math.max(1, Math.min(r.h, imgH));
  return {
    x: Math.max(0, Math.min(r.x, imgW - w)),
    y: Math.max(0, Math.min(r.y, imgH - h)),
    w: w,
    h: h,
  };
}

// Tỷ lệ hiển thị ảnh trong khung cắt: ảnh phủ kín khung (cover) rồi
// nhân thêm mức phóng to (zoom ≥ 1).
function displayScale(frameW, frameH, naturalW, naturalH, zoom) {
  return Math.max(frameW / naturalW, frameH / naturalH) * zoom;
}

// Vị trí ảnh khi căn giữa khung (góc trái-trên của ảnh so với góc
// trái-trên của khung, tính bằng px màn hình; số âm khi ảnh lớn hơn
// khung).
function defaultPan(frameW, frameH, dispW, dispH) {
  return { ox: (frameW - dispW) / 2, oy: (frameH - dispH) / 2 };
}

// Kẹp vị trí kéo ảnh: ảnh phải luôn phủ kín khung, không được hở mép.
function clampPan(ox, oy, frameW, frameH, dispW, dispH) {
  return {
    ox: Math.max(frameW - dispW, Math.min(0, ox)),
    oy: Math.max(frameH - dispH, Math.min(0, oy)),
  };
}

// Vùng ảnh gốc tương ứng với khung đang thấy (để cắt ra khi tải về):
// ox/oy là vị trí góc trái-trên của ảnh so với khung, zoom là mức
// phóng to. Trả {x, y, w, h} tính bằng px ảnh gốc.
function frameToSourceRect(frameW, frameH, naturalW, naturalH, zoom, ox, oy) {
  const s = displayScale(frameW, frameH, naturalW, naturalH, zoom);
  const x = Math.max(0, Math.round((0 - ox) / s));
  const y = Math.max(0, Math.round((0 - oy) / s));
  return {
    x: x,
    y: y,
    w: Math.min(naturalW - x, Math.round(frameW / s)),
    h: Math.min(naturalH - y, Math.round(frameH / s)),
  };
}

if (typeof window !== 'undefined') window.UH_ANHTHE = { DPI, CM_PER_INCH, cmToPx, SIZES, sizeById, sizePx, aspect, SHEET, sheetPx, sheetLayout, fmtBytes, cropRect, clampCrop, displayScale, defaultPan, clampPan, frameToSourceRect };
export { DPI, CM_PER_INCH, cmToPx, SIZES, sizeById, sizePx, aspect, SHEET, sheetPx, sheetLayout, fmtBytes, cropRect, clampCrop, displayScale, defaultPan, clampPan, frameToSourceRect };
