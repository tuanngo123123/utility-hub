// Sổ điểm lớp theo TT22 — logic thuần (tính ĐTB môn học kỳ/cả năm,
// xếp mức từng môn, xếp loại chung kèm luật điều chỉnh 1 môn, tách
// danh sách học sinh, lớp mẫu). Một nguồn duy nhất cho cả trang công
// cụ (build.mjs chèn file này vào trang, trừ dòng export cuối, để
// init() gọi qua window.UH_SODIEM) và bộ kiểm
// scripts/test-so-diem-tt22.mjs — công thức trên trang và trong test
// là một, theo đúng mẫu src/money-formulas.js và src/tron-de-logic.js.
//
// CÔNG THỨC (Thông tư 22/2021/TT-BGDĐT, đối chiếu văn bản gốc qua
// thuvienphapluat.vn + vietnamnet + diennguyenaz, 20/11/2026):
// - ĐTB môn học kỳ: ĐTBmhk = (TĐĐGtx + 2 × ĐĐGgk + 3 × ĐĐGck) /
//   (Số ĐĐGtx + 5); TX hệ số 1, GK hệ số 2, CK hệ số 3; làm tròn 1
//   chữ số thập phân. Chưa có đủ điểm GK và CK thì chưa tính ĐTB
//   (tránh hiện số sai giữa kỳ — cùng cách làm của bảng Excel mẫu).
// - ĐTB môn cả năm: ĐTBmcn = (ĐTBmhkI + 2 × ĐTBmhkII) / 3, làm tròn
//   1 chữ số thập phân; tính từ ĐTB học kỳ ĐÃ LÀM TRÒN (cách trường
//   vẫn làm: điểm học kỳ ghi vào sổ đã làm tròn rồi mới tính cả năm).
// - Xếp loại chung (khoản 2 Điều 9 TT22): Tốt = mọi môn nhận xét đều
//   Đạt, mọi môn có điểm ≥ 6,5, trong đó ít nhất 6 môn ≥ 8,0; Khá =
//   mọi môn nhận xét đều Đạt, mọi môn có điểm ≥ 5,0, trong đó ít nhất
//   6 môn ≥ 6,5; Đạt = tối đa 1 môn nhận xét Chưa đạt, ít nhất 6 môn
//   có điểm ≥ 5,0, không môn nào dưới 3,5; còn lại là Chưa đạt.
// - Luật điều chỉnh (khoản 3 Điều 9 TT22): mức chung bị thấp xuống từ
//   2 mức trở lên so với mức Tốt/Khá chỉ do kết quả của DUY NHẤT 1
//   môn thì được điều chỉnh LÊN mức liền kề. Cài bằng cách thử bỏ
//   từng môn một: bỏ đúng 1 môn mà mức lên Tốt/Khá (cao hơn mức thô
//   từ 2 mức) thì nâng mức thô lên 1 mức. Bỏ môn làm còn dưới 6 môn
//   có điểm thì không xét được (quy tắc Tốt/Khá cần đủ 6 môn).
// - Mức từng môn (Tốt/Khá/Đạt/Chưa đạt theo ngưỡng 8,0/6,5/5,0) chỉ
//   là nhãn tham khảo nhanh dùng chung ngưỡng của TT22 — TT22 chỉ
//   định nghĩa 4 mức cho kết quả chung, không xếp mức từng môn.
// - Môn nhận xét cả năm: Đạt nếu học kỳ II Đạt (theo TT22).
//
// CẢNH BÁO: trang tracuudiemthi.edu.vn ghi SAI công thức ở 2 chỗ
// (ĐTBmhk không nhân hệ số; ĐTB cả năm = trung bình cộng 2 kỳ) —
// bị văn bản TT22 + 4+ nguồn khác bác bỏ. KHÔNG dùng 2 công thức đó.

const LEVELS = ['Chưa đạt', 'Đạt', 'Khá', 'Tốt'];

// Làm tròn 1 chữ số thập phân, nửa lên (7,85 → 7,9). Cộng 1e-9 trước
// khi làm tròn để trị đúng các số nửa (7,85 lưu trong máy là
// 7,8499999… nên Math.round(7,85 × 10) ra 78 thay vì 79 nếu không
// có epsilon; epsilon nhỏ hơn nhiều so với khoảng cách tới mốc nửa
// gần nhất của mọi phân số có mẫu số ≤ 9×10 nên không lật số khác).
function round1(x) {
  return Math.round(x * 10 + 1e-9) / 10;
}

// Hiện điểm theo cách viết của Việt Nam: dấu phẩy thập phân.
function fmtScore(n) {
  if (n == null || isNaN(n)) return '';
  return String(n).replace('.', ',');
}

// Đọc điểm giáo viên gõ: chấp nhận cả dấu phẩy (7,5) lẫn dấu chấm
// (7.5). Trả null khi ô trống, NaN khi không phải số 0–10.
function parseScore(str) {
  const t = String(str == null ? '' : str).trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  if (!isFinite(n) || n < 0 || n > 10) return NaN;
  return n;
}

// ĐTB môn học kỳ. tx: mảng điểm TX (null = ô trống, không tính);
// gk, ck: điểm giữa kỳ / cuối kỳ (null = chưa có). Thiếu GK hoặc CK
// thì trả null (chưa tính được). Ô TX sai định dạng (NaN) cũng bị bỏ
// qua ở đây — giao diện tự tô đỏ ô sai để giáo viên sửa.
function dtbHocKy(tx, gk, ck) {
  if (gk == null || ck == null || isNaN(gk) || isNaN(ck)) return null;
  const valid = (tx || []).filter((v) => v != null && !isNaN(v));
  const sum = valid.reduce((a, b) => a + b, 0);
  return round1((sum + 2 * gk + 3 * ck) / (valid.length + 5));
}

// ĐTB môn cả năm từ ĐTB 2 học kỳ đã làm tròn. Thiếu 1 kỳ → null.
function dtbCaNam(hk1, hk2) {
  if (hk1 == null || hk2 == null) return null;
  return round1((hk1 + 2 * hk2) / 3);
}

// Mức tham khảo của 1 môn theo ngưỡng TT22 (xem ghi chú đầu file).
function mucMon(dtb) {
  if (dtb == null) return null;
  if (dtb >= 8) return 'Tốt';
  if (dtb >= 6.5) return 'Khá';
  if (dtb >= 5) return 'Đạt';
  return 'Chưa đạt';
}

// Xếp loại thô theo khoản 2 Điều 9 TT22.
// scored: mảng ĐTB các môn có điểm (null = chưa có điểm).
// remark: mảng kết quả môn nhận xét ('dat' | 'chuadat' | null).
// Trả { state, level }: state 'ok' (level 0–3 theo LEVELS),
// 'thieu' (còn môn chưa đủ điểm/nhận xét — không xếp, tránh xếp
// nhầm Tốt vì ô trống bị đếm là "không có môn Chưa đạt"), hoặc
// 'chua-du-mon' (dưới 6 môn có điểm — quy tắc Tốt/Khá/Đạt đều cần
// ít nhất 6 môn nên không xếp được, hiện lời giải thích thay vì
// ghi Chưa đạt oan cho học sinh).
function xepLoaiTho(scored, remark) {
  const s = scored || [];
  const r = remark || [];
  if (s.some((v) => v == null) || r.some((v) => v == null)) {
    return { state: 'thieu', level: null };
  }
  if (s.length < 6) return { state: 'chua-du-mon', level: null };
  const nCD = r.filter((v) => v === 'chuadat').length;
  const min = Math.min.apply(null, s);
  const n8 = s.filter((v) => v >= 8).length;
  const n65 = s.filter((v) => v >= 6.5).length;
  const n5 = s.filter((v) => v >= 5).length;
  if (nCD === 0 && min >= 6.5 && n8 >= 6) return { state: 'ok', level: 3 };
  if (nCD === 0 && min >= 5 && n65 >= 6) return { state: 'ok', level: 2 };
  if (nCD <= 1 && n5 >= 6 && min >= 3.5) return { state: 'ok', level: 1 };
  return { state: 'ok', level: 0 };
}

// Xếp loại chung kèm luật điều chỉnh (khoản 3 Điều 9 TT22).
// subjects: [{ name, type: 'diem' | 'nhanxet', dtb: number|null,
//   nx: 'dat' | 'chuadat' | null }] — dtb dùng khi type 'diem',
//   nx dùng khi type 'nhanxet'.
// Trả { state, level, rawLevel, adjusted, adjustedBy }.
function xepLoaiChung(subjects) {
  const scored = [];
  const remark = [];
  (subjects || []).forEach((sub) => {
    if (sub.type === 'nhanxet') remark.push(sub.nx != null ? sub.nx : null);
    else scored.push(sub.dtb != null ? sub.dtb : null);
  });
  const raw = xepLoaiTho(scored, remark);
  if (raw.state !== 'ok') {
    return { state: raw.state, level: null, rawLevel: null, adjusted: false, adjustedBy: null };
  }
  // Thử bỏ từng môn một để tìm môn duy nhất gây ra mức thấp.
  const candidates = [];
  for (let i = 0; i < subjects.length; i++) {
    const rest = subjects.filter((_, j) => j !== i);
    const s2 = [];
    const r2 = [];
    rest.forEach((sub) => {
      if (sub.type === 'nhanxet') r2.push(sub.nx != null ? sub.nx : null);
      else s2.push(sub.dtb != null ? sub.dtb : null);
    });
    const w = xepLoaiTho(s2, r2);
    if (w.state === 'ok' && w.level >= 2 && w.level - raw.level >= 2) candidates.push(i);
  }
  if (candidates.length === 1) {
    return {
      state: 'ok', level: raw.level + 1, rawLevel: raw.level,
      adjusted: true, adjustedBy: subjects[candidates[0]].name,
    };
  }
  return { state: 'ok', level: raw.level, rawLevel: raw.level, adjusted: false, adjustedBy: null };
}

// Tách danh sách học sinh dán vào: mỗi dòng 1 tên, bỏ dòng trống.
function parseStudentNames(text) {
  return String(text == null ? '' : text)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Tên hiển thị có đánh số trùng tên ("Bùi Ngọc Lan (1)" / "(2)") —
// cùng quy tắc với UhGvClasses.displayNames.
function displayNames(names) {
  const counts = {};
  (names || []).forEach((n) => { counts[n] = (counts[n] || 0) + 1; });
  const seen = {};
  return (names || []).map((n) => {
    if (counts[n] <= 1) return n;
    seen[n] = (seen[n] || 0) + 1;
    return n + ' (' + seen[n] + ')';
  });
}

// Lớp mẫu 5 bạn, 2 môn, đủ điểm 2 học kỳ — hiện sẵn khi mở trang.
// Điểm Toán học kỳ I lấy đúng ví dụ đã kiểm tay của diennguyenaz
// (An 7,9; Bình 9,2; Cường 4,8; Dung 6,9; Em 6,3); các điểm còn lại
// tự đặt và đã tính tay trong bộ kiểm (xem test-so-diem-tt22.mjs):
// ĐTB cả năm: An Toán 8,4 / Văn 8,7; Bình 9,6 / 9,2; Cường 5,4 /
// 4,7 (Văn Chưa đạt — để hộp cảnh báo có ví dụ); Dung 7,5 / 6,8;
// Em 6,6 / 6,2. Chỉ 2 môn nên cột xếp loại chung hiện "chưa đủ môn"
// (TT22 cần ít nhất 6 môn có điểm) — thêm môn để thấy xếp loại.
const SAMPLE = {
  className: 'Lớp mẫu 10A1',
  students: ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em'],
  subjects: [
    { name: 'Toán', type: 'diem' },
    { name: 'Ngữ văn', type: 'diem' },
  ],
  // scores[stt học sinh][stt môn] = { h1: {...}, h2: {...} };
  // môn có điểm: { tx: [TX1..TX4], gk, ck } (null = ô trống);
  // môn nhận xét: { nx: 'dat' | 'chuadat' | null }.
  scores: [
    [ // An
      { h1: { tx: [8, 7, 9, null], gk: 7.5, ck: 8 }, h2: { tx: [9, 9, 8, null], gk: 9, ck: 8.5 } },
      { h1: { tx: [8, 9, null, null], gk: 8, ck: 8.5 }, h2: { tx: [9, 8, 9, null], gk: 8.5, ck: 9 } },
    ],
    [ // Bình
      { h1: { tx: [9, 10, 9, 8], gk: 9, ck: 9.5 }, h2: { tx: [10, 9, 10, null], gk: 9.5, ck: 10 } },
      { h1: { tx: [9, 9, 8, null], gk: 9, ck: 9 }, h2: { tx: [9, 10, null, null], gk: 9, ck: 9.5 } },
    ],
    [ // Cường
      { h1: { tx: [5, 6, 4, null], gk: 5, ck: 4.5 }, h2: { tx: [6, 5, 6, null], gk: 6, ck: 5.5 } },
      { h1: { tx: [4, 5, null, null], gk: 4.5, ck: 5 }, h2: { tx: [4, 5, null, null], gk: 4.5, ck: 5 } },
    ],
    [ // Dung
      { h1: { tx: [7, 8, 6, 7], gk: 6.5, ck: 7 }, h2: { tx: [8, 7, 8, null], gk: 7.5, ck: 8 } },
      { h1: { tx: [7, 6, 7, null], gk: 7, ck: 6.5 }, h2: { tx: [7, 7, 6, null], gk: 6.5, ck: 7 } },
    ],
    [ // Em
      { h1: { tx: [6, 7, 6, null], gk: 6, ck: 6.5 }, h2: { tx: [7, 6, 7, null], gk: 7, ck: 6.5 } },
      { h1: { tx: [6, 6, null, null], gk: 5.5, ck: 6 }, h2: { tx: [6, 7, null, null], gk: 6, ck: 6.5 } },
    ],
  ],
};

// Gộp mảng dòng thành văn bản tách bằng tab (dán thẳng vào Excel).
function toTsv(rows) {
  return (rows || []).map((row) => row.map((c) => String(c == null ? '' : c).replace(/[\t\r\n]/g, ' ')).join('\t')).join('\n') + '\n';
}

if (typeof window !== 'undefined') window.UH_SODIEM = { LEVELS, round1, fmtScore, parseScore, dtbHocKy, dtbCaNam, mucMon, xepLoaiTho, xepLoaiChung, parseStudentNames, displayNames, SAMPLE, toTsv };
export { LEVELS, round1, fmtScore, parseScore, dtbHocKy, dtbCaNam, mucMon, xepLoaiTho, xepLoaiChung, parseStudentNames, displayNames, SAMPLE, toTsv };
