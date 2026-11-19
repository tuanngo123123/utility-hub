// test-so-diem-tt22.mjs — Bộ kiểm tra công cụ Sổ điểm lớp theo TT22
// (logic thuần trong src/so-diem-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de): kiểm nào trượt thì build thất bại để
// không đăng công cụ tính điểm sai lên web.
//
// Nguồn số kiểm:
// - 6 ví dụ ĐTBmhk của diennguyenaz (An 7,9; Bình 9,2; Cường 4,8;
//   Dung 6,9; Em 6,3; Giang 8,6) — nguồn độc lập đã tính tay.
// - 4 ví dụ xếp loại của diennguyenaz (An Tốt, Bình Khá, Cường Đạt,
//   Dung Chưa đạt) + ví dụ ĐTBmcn (6,8 và 7,4 → 7,2).
// - Mọi số còn lại tự tính tay trong file này (ghi rõ phép tính).
// - Quy tắc xếp loại + luật điều chỉnh đối chiếu văn bản gốc TT22
//   qua thuvienphapluat.vn (khoản 2 + khoản 3 Điều 9).
import {
  LEVELS, round1, fmtScore, parseScore, dtbHocKy, dtbCaNam, mucMon,
  xepLoaiTho, xepLoaiChung, parseStudentNames, displayNames, SAMPLE, toTsv,
} from '../src/so-diem-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}
function ok(name, cond, extra) {
  if (cond) passed++;
  else { failed++; failures.push(`${name}${extra ? ' — ' + extra : ''}`); }
}

// --- Làm tròn 1 chữ số thập phân (nửa lên) ---
check('round1(7,875) = 7,9', round1(7.875), 7.9);
check('round1(7,85) = 7,9 (bẫy số thực: 7,85 lưu là 7,8499…)', round1(7.85), 7.9);
check('round1(7,75) = 7,8', round1(7.75), 7.8);
check('round1(6,75) = 6,8', round1(6.75), 6.8);
check('round1(9,75) = 9,8', round1(9.75), 9.8);
check('round1(4,8125) = 4,8', round1(4.8125), 4.8);
check('round1(9,1666…) = 9,2', round1(82.5 / 9), 9.2);
check('round1(6,3125) = 6,3', round1(6.3125), 6.3);
check('round1(8,6111…) = 8,6', round1(77.5 / 9), 8.6);

// --- Hiện điểm + đọc điểm gõ vào ---
check('fmtScore(7,9) = "7,9"', fmtScore(7.9), '7,9');
check('fmtScore(8) = "8"', fmtScore(8), '8');
check('fmtScore(null) = ""', fmtScore(null), '');
check('parseScore("7,5") = 7,5', parseScore('7,5'), 7.5);
check('parseScore("7.5") = 7,5', parseScore('7.5'), 7.5);
check('parseScore(" 8 ") = 8', parseScore(' 8 '), 8);
check('parseScore("10") = 10', parseScore('10'), 10);
check('parseScore("") = null', parseScore(''), null);
ok('parseScore("11") = NaN (quá 10)', Number.isNaN(parseScore('11')));
ok('parseScore("-1") = NaN (âm)', Number.isNaN(parseScore('-1')));
ok('parseScore("abc") = NaN (không phải số)', Number.isNaN(parseScore('abc')));
ok('parseScore("7,5,2") = NaN', Number.isNaN(parseScore('7,5,2')));

// --- ĐTB môn học kỳ: 6 ví dụ của diennguyenaz (nguồn độc lập) ---
check('An: (8+7+9)+2×7,5+3×8=63 /8=7,875 → 7,9', dtbHocKy([8, 7, 9], 7.5, 8), 7.9);
check('Bình: (9+10+9+8)+2×9+3×9,5=82,5 /9 → 9,2', dtbHocKy([9, 10, 9, 8], 9, 9.5), 9.2);
check('Cường: (5+6+4)+2×5+3×4,5=38,5 /8 → 4,8', dtbHocKy([5, 6, 4], 5, 4.5), 4.8);
check('Dung: (7+8+6+7)+2×6,5+3×7=62 /9 → 6,9', dtbHocKy([7, 8, 6, 7], 6.5, 7), 6.9);
check('Em: (6+7+6)+2×6+3×6,5=50,5 /8 → 6,3', dtbHocKy([6, 7, 6], 6, 6.5), 6.3);
check('Giang: (8+9+8+9)+2×9+3×8,5=77,5 /9 → 8,6', dtbHocKy([8, 9, 8, 9], 9, 8.5), 8.6);
check('thiếu GK → chưa tính (null)', dtbHocKy([8, 7, 9], null, 8), null);
check('thiếu CK → chưa tính (null)', dtbHocKy([8, 7, 9], 7.5, null), null);
check('0 cột TX: (0+2×8+3×8)/5 = 8', dtbHocKy([], 8, 8), 8);
check('ô TX trống không tính: (8+9)+2×8+3×8=57 /7 → 8,1', dtbHocKy([8, null, 9, null], 8, 8), 8.1);
check('nửa lên qua dữ liệu thật: 78/8=9,75 → 9,8', dtbHocKy([10, 9, 10], 9.5, 10), 9.8);

// --- ĐTB môn cả năm ---
check('ví dụ diennguyenaz: (6,8+2×7,4)/3 = 7,2', dtbCaNam(6.8, 7.4), 7.2);
check('An Toán: (7,9+2×8,7)/3 = 8,4', dtbCaNam(7.9, 8.7), 8.4);
check('Bình Toán: (9,2+2×9,8)/3 = 9,6', dtbCaNam(9.2, 9.8), 9.6);
check('Cường Toán: (4,8+2×5,7)/3 = 5,4', dtbCaNam(4.8, 5.7), 5.4);
check('Dung Toán: (6,9+2×7,8)/3 = 7,5', dtbCaNam(6.9, 7.8), 7.5);
check('Em Toán: (6,3+2×6,7)/3 = 6,6', dtbCaNam(6.3, 6.7), 6.6);
check('An Văn: (8,4+2×8,8)/3 = 8,7', dtbCaNam(8.4, 8.8), 8.7);
check('Bình Văn: (8,9+2×9,4)/3 = 9,2', dtbCaNam(8.9, 9.4), 9.2);
check('Cường Văn: (4,7+2×4,7)/3 = 4,7', dtbCaNam(4.7, 4.7), 4.7);
check('Dung Văn: (6,7+2×6,8)/3 = 6,8', dtbCaNam(6.7, 6.8), 6.8);
check('Em Văn: (5,9+2×6,4)/3 = 6,2', dtbCaNam(5.9, 6.4), 6.2);
check('thiếu học kỳ I → null', dtbCaNam(null, 7), null);
check('thiếu học kỳ II → null', dtbCaNam(7, null), null);

// --- Mức tham khảo từng môn (ngưỡng TT22) ---
check('mucMon(8) = Tốt', mucMon(8), 'Tốt');
check('mucMon(7,9) = Khá', mucMon(7.9), 'Khá');
check('mucMon(6,5) = Khá', mucMon(6.5), 'Khá');
check('mucMon(6,4) = Đạt', mucMon(6.4), 'Đạt');
check('mucMon(5) = Đạt', mucMon(5), 'Đạt');
check('mucMon(4,9) = Chưa đạt', mucMon(4.9), 'Chưa đạt');
check('mucMon(null) = null', mucMon(null), null);

// --- Lớp mẫu: tính lại toàn bộ 20 ĐTB học kỳ + 10 ĐTB cả năm ---
function sampleDtb(sem, subjectIdx) {
  return SAMPLE.scores.map((row) => {
    const cell = row[subjectIdx][sem];
    return dtbHocKy(cell.tx, cell.gk, cell.ck);
  });
}
function sampleYear(subjectIdx) {
  const h1 = sampleDtb('h1', subjectIdx);
  const h2 = sampleDtb('h2', subjectIdx);
  return h1.map((v, i) => dtbCaNam(v, h2[i]));
}
check('mẫu: 5 học sinh, 2 môn', [SAMPLE.students.length, SAMPLE.subjects.length], [5, 2]);
check('mẫu Toán HKI: 7,9 / 9,2 / 4,8 / 6,9 / 6,3', sampleDtb('h1', 0), [7.9, 9.2, 4.8, 6.9, 6.3]);
check('mẫu Toán HKII: 8,7 / 9,8 / 5,7 / 7,8 / 6,7', sampleDtb('h2', 0), [8.7, 9.8, 5.7, 7.8, 6.7]);
check('mẫu Văn HKI: 8,4 / 8,9 / 4,7 / 6,7 / 5,9', sampleDtb('h1', 1), [8.4, 8.9, 4.7, 6.7, 5.9]);
check('mẫu Văn HKII: 8,8 / 9,4 / 4,7 / 6,8 / 6,4', sampleDtb('h2', 1), [8.8, 9.4, 4.7, 6.8, 6.4]);
check('mẫu Toán cả năm: 8,4 / 9,6 / 5,4 / 7,5 / 6,6', sampleYear(0), [8.4, 9.6, 5.4, 7.5, 6.6]);
check('mẫu Văn cả năm: 8,7 / 9,2 / 4,7 / 6,8 / 6,2', sampleYear(1), [8.7, 9.2, 4.7, 6.8, 6.2]);
check('mẫu: Cường Văn cả năm Chưa đạt (để hộp cảnh báo có ví dụ)', mucMon(sampleYear(1)[2]), 'Chưa đạt');

// --- Xếp loại chung: 4 ví dụ của diennguyenaz (8 môn điểm + 4 môn nhận xét) ---
function subsFrom(scores, remarks) {
  const out = scores.map((dtb, i) => ({ name: 'Môn ' + (i + 1), type: 'diem', dtb, nx: null }));
  (remarks || []).forEach((nx, i) => out.push({ name: 'Nhận xét ' + (i + 1), type: 'nhanxet', dtb: null, nx }));
  return out;
}
const ALL_DAT = ['dat', 'dat', 'dat', 'dat'];
check('An: 6 môn ≥ 8, thấp nhất 7,5 → Tốt',
  xepLoaiChung(subsFrom([8.5, 7.9, 8.2, 8.0, 8.6, 9.0, 7.5, 8.8], ALL_DAT)),
  { state: 'ok', level: 3, rawLevel: 3, adjusted: false, adjustedBy: null });
check('Bình: 1 môn 6,4 dưới 6,5 → Khá (không điều chỉnh: chỉ thấp 1 mức)',
  xepLoaiChung(subsFrom([9.0, 8.5, 8.0, 6.4, 8.2, 8.8, 8.1, 9.2], ALL_DAT)),
  { state: 'ok', level: 2, rawLevel: 2, adjusted: false, adjustedBy: null });
check('Cường: 1 môn nhận xét Chưa đạt, thấp nhất 4,8 → Đạt',
  xepLoaiChung(subsFrom([5.5, 4.8, 6.0, 5.2, 5.0, 6.8, 7.0, 5.5], ['dat', 'dat', 'dat', 'chuadat'])),
  { state: 'ok', level: 1, rawLevel: 1, adjusted: false, adjustedBy: null });
check('Dung: có môn 3,2 dưới 3,5 → Chưa đạt (bỏ môn 3,2 chỉ lên Đạt: thấp 1 mức)',
  xepLoaiChung(subsFrom([6.0, 3.2, 5.5, 5.0, 6.5, 7.0, 5.8, 6.2], ALL_DAT)),
  { state: 'ok', level: 0, rawLevel: 0, adjusted: false, adjustedBy: null });

// --- Luật điều chỉnh 1 môn (khoản 3 Điều 9 TT22) ---
check('thấp 3 mức do 1 môn 3,0: Chưa đạt → điều chỉnh lên Đạt',
  xepLoaiChung(subsFrom([8.5, 8.2, 8.0, 8.6, 9.0, 8.8, 7.5, 3.0], [])),
  { state: 'ok', level: 1, rawLevel: 0, adjusted: true, adjustedBy: 'Môn 8' });
check('thấp 2 mức do 1 môn 4,0: Đạt → điều chỉnh lên Khá',
  xepLoaiChung(subsFrom([8.5, 8.2, 8.0, 8.6, 9.0, 8.8, 4.0, 7.5], [])),
  { state: 'ok', level: 2, rawLevel: 1, adjusted: true, adjustedBy: 'Môn 7' });
check('2 môn thấp (3,0 và 3,2): không điều chỉnh — không phải do 1 môn',
  xepLoaiChung(subsFrom([8.5, 8.2, 8.0, 8.6, 9.0, 8.8, 3.0, 3.2], [])),
  { state: 'ok', level: 0, rawLevel: 0, adjusted: false, adjustedBy: null });
check('1 môn nhận xét Chưa đạt kéo Tốt xuống Đạt → điều chỉnh lên Khá',
  xepLoaiChung(subsFrom([8.5, 8.5, 8.5, 8.5, 8.5, 8.5, 8.5, 8.5], ['dat', 'dat', 'dat', 'chuadat'])),
  { state: 'ok', level: 2, rawLevel: 1, adjusted: true, adjustedBy: 'Nhận xét 4' });
check('đúng 6 môn, 1 môn 3,0: không điều chỉnh (bỏ môn chỉ còn 5, không xét được Tốt/Khá)',
  xepLoaiChung(subsFrom([8.5, 8.2, 8.0, 8.6, 9.0, 3.0], [])),
  { state: 'ok', level: 0, rawLevel: 0, adjusted: false, adjustedBy: null });
check('2 môn nhận xét Chưa đạt → Chưa đạt (quá 1 môn cho mức Đạt)',
  xepLoaiChung(subsFrom([8.5, 8.5, 8.5, 8.5, 8.5, 8.5, 8.5, 8.5], ['dat', 'dat', 'chuadat', 'chuadat'])),
  { state: 'ok', level: 0, rawLevel: 0, adjusted: false, adjustedBy: null });

// --- Chưa đủ dữ liệu: không xếp nhầm ---
check('còn môn chưa có điểm → thieu', xepLoaiChung(subsFrom([8.5, null, 8.0, 8.6, 9.0, 8.8, 7.5, 8.8], ALL_DAT)).state, 'thieu');
check('còn môn nhận xét chưa đánh giá → thieu', xepLoaiChung(subsFrom([8.5, 8.2, 8.0, 8.6, 9.0, 8.8, 7.5, 8.8], ['dat', 'dat', null, 'dat'])).state, 'thieu');
check('chỉ 2 môn có điểm → chua-du-mon (không ghi Chưa đạt oan)', xepLoaiChung(subsFrom([8.5, 9.0], [])).state, 'chua-du-mon');
check('0 môn → chua-du-mon', xepLoaiChung([]).state, 'chua-du-mon');
check('xepLoaiTho trực tiếp: 6 môn ≥ 8 → Tốt', xepLoaiTho([8, 8, 8, 8, 8, 8], []), { state: 'ok', level: 3 });
check('LEVELS đủ 4 mức theo đúng thứ tự', LEVELS, ['Chưa đạt', 'Đạt', 'Khá', 'Tốt']);

// --- Tách tên + đánh số trùng tên ---
check('parseStudentNames: bỏ dòng trống + khoảng trắng', parseStudentNames('An\nBình\n\n Cường \n'), ['An', 'Bình', 'Cường']);
check('parseStudentNames("") = []', parseStudentNames(''), []);
check('displayNames: trùng tên đánh số (1)/(2)', displayNames(['Lan', 'Lan', 'Minh']), ['Lan (1)', 'Lan (2)', 'Minh']);
check('displayNames: không trùng giữ nguyên', displayNames(['An', 'Bình']), ['An', 'Bình']);

// --- Xuất văn bản tách tab ---
check('toTsv: nối tab + xuống dòng', toTsv([['Họ tên', 'Toán'], ['An', '7,9']]), 'Họ tên\tToán\nAn\t7,9\n');

console.log(`test-so-diem-tt22: ${passed} đạt, ${failed} trượt.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
