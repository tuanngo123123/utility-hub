// test-gv-parser.mjs — Bộ kiểm tra bộ tách bảng lớp (gvParseTable /
// gvParseNames trong src/app.js, qua window.UhGvClasses).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools):
// kiểm nào trượt thì build thất bại để không đăng bộ tách lỗi lên web.
//
// app.js là script thường (không phải ES module) trong repo "type":
// "module" nên require() trực tiếp sẽ nạp nó như ESM và các dòng
// module.exports KHÔNG chạy (module không tồn tại trong ESM) — vì vậy
// nạp bằng vm với sandbox có module/console/timer, theo đúng cách
// UHMascot đã xuất cho Node.
//
// Gốc: bộ test 17 case đợt 1.1 chưa từng được commit — viết lại từ đầu
// ở đây kèm các case cũ (STT, Họ đệm+T tách cột, ghi chú sau giới
// tính, trùng tên không gộp) + case lỗi dán mỗi-ô-một-dòng (19/11).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const code = readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
const moduleObj = { exports: {} };
const ctx = vm.createContext({
  module: moduleObj, exports: moduleObj.exports,
  console, setTimeout, clearTimeout,
});
vm.runInContext(code, ctx);
const P = moduleObj.exports.UhGvClasses;
if (!P || typeof P.parseRecords !== 'function') {
  console.error('test-gv-parser: không nạp được UhGvClasses.parseRecords từ src/app.js.');
  process.exit(1);
}

let passed = 0;
let failed = 0;
const failures = [];

function recs(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}
function names(name, actual, expected) {
  recs(name, actual, expected);
}

// --- Bảng tab 2 cột (Họ tên | Giới tính) ---
recs('tab 2 cột: giới tính đúng', P.parseRecords(
  'Nguyễn Văn A\tNam\nTrần Thị B\tNữ\nLê Văn C\tNam',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
  { name: 'Lê Văn C', gender: 'nam' },
]);

// --- Bảng tab có dòng tiêu đề ---
recs('tab có tiêu đề: bỏ dòng tiêu đề', P.parseRecords(
  'Họ tên\tGiới tính\nNguyễn Văn A\tNam\nTrần Thị B\tNữ',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);
recs('tab tiêu đề STT: bỏ dòng tiêu đề + cột STT', P.parseRecords(
  'STT\tHọ tên\tGiới tính\n1\tNguyễn Văn A\tNam\n2\tTrần Thị B\tNữ',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);

// --- Cột STT (không có dòng tiêu đề) ---
recs('tab có STT: bỏ cột STT', P.parseRecords(
  '1\tNguyễn Văn A\tNam\n2\tTrần Thị B\tNữ\n3\tLê Văn C\tNam',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
  { name: 'Lê Văn C', gender: 'nam' },
]);

// --- Họ đệm + Tên tách 2 cột ---
recs('tab Họ đệm+T: ghép 2 cột thành tên', P.parseRecords(
  'Nguyễn Văn\tA\tNam\nTrần Thị\tB\tNữ',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);

// --- Ghi chú sau cột giới tính ---
recs('tab ghi chú sau giới tính: bỏ cột ghi chú', P.parseRecords(
  'Nguyễn Văn A\tNam\tLớp trưởng\nTrần Thị B\tNữ\t',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);

// --- Trùng tên không gộp ---
recs('trùng tên: giữ 2 bản ghi riêng', P.parseRecords(
  'Bùi Ngọc Lan\tNữ\nBùi Ngọc Lan\tNữ\nNguyễn Văn A\tNam',
), [
  { name: 'Bùi Ngọc Lan', gender: 'nữ' },
  { name: 'Bùi Ngọc Lan', gender: 'nữ' },
  { name: 'Nguyễn Văn A', gender: 'nam' },
]);

// --- Lỗi dán mỗi-ô-một-dòng (19/11): "Nam"/"Nữ" thành tên ---
recs('mỗi-ô-một-dòng: ghép cặp tên/giới tính', P.parseRecords(
  'Nguyễn Văn A\nNam\nTrần Thị B\nNữ\nLê Văn C\nNam\nPhạm Thị D\nNữ',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
  { name: 'Lê Văn C', gender: 'nam' },
  { name: 'Phạm Thị D', gender: 'nữ' },
]);
recs('mỗi-ô-một-dòng lớp 10A1 test: không còn bạn tên "Nam"/"Nữ"', (() => {
  const out = P.parseRecords('Nguyễn Văn A\nNam\nTrần Thị B\nNữ');
  return out.filter((r) => r.name === 'Nam' || r.name === 'Nữ');
})(), []);
recs('mỗi-ô-một-dòng có tiêu đề: bỏ tiêu đề rồi ghép', P.parseRecords(
  'Họ tên\nGiới tính\nNguyễn Văn A\nNam\nTrần Thị B\nNữ',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);
recs('mỗi-ô-một-dòng M/F: chuẩn hóa về nam/nữ', P.parseRecords(
  'Nguyễn Văn A\nM\nTrần Thị B\nF\nLê Văn C\nMale\nPhạm Thị D\nFemale',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
  { name: 'Lê Văn C', gender: 'nam' },
  { name: 'Phạm Thị D', gender: 'nữ' },
]);
recs('mỗi-ô-một-dòng dòng trống xen kẽ: bỏ dòng trống rồi ghép', P.parseRecords(
  'Nguyễn Văn A\n\nNam\n\nTrần Thị B\nNữ\n',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);

// --- Không ghép khi không đúng quy luật xen kẽ ---
recs('tên thuần có bạn tên "Nam": KHÔNG ghép, giữ nguyên 8 bạn', P.parseRecords(
  'Mai\nNam\nPhương\nTuấn\nHương\nĐức\nLinh\nKhoa',
), [
  { name: 'Mai', gender: '' }, { name: 'Nam', gender: '' },
  { name: 'Phương', gender: '' }, { name: 'Tuấn', gender: '' },
  { name: 'Hương', gender: '' }, { name: 'Đức', gender: '' },
  { name: 'Linh', gender: '' }, { name: 'Khoa', gender: '' },
]);
recs('mỗi-ô-một-dòng số dòng lẻ: không ghép nửa vời', P.parseRecords(
  'Nguyễn Văn A\nNam\nTrần Thị B\nNữ\nLê Văn C',
), [
  { name: 'Nguyễn Văn A', gender: '' }, { name: 'Nam', gender: '' },
  { name: 'Trần Thị B', gender: '' }, { name: 'Nữ', gender: '' },
  { name: 'Lê Văn C', gender: '' },
]);
recs('mỗi-ô-một-dòng chỉ 2 dòng: quá ngắn, không ghép', P.parseRecords(
  'Nguyễn Văn A\nNam',
), [
  { name: 'Nguyễn Văn A', gender: '' },
  { name: 'Nam', gender: '' },
]);

// --- Danh sách 1 cột tên thuần ---
recs('1 cột tên thuần: giữ nguyên, không giới tính', P.parseRecords(
  'Nguyễn Văn A\nTrần Thị B\nLê Văn C',
), [
  { name: 'Nguyễn Văn A', gender: '' },
  { name: 'Trần Thị B', gender: '' },
  { name: 'Lê Văn C', gender: '' },
]);
recs('1 cột có số thứ tự đầu dòng: bỏ số', P.parseRecords(
  '1. Nguyễn Văn A\n2. Trần Thị B\n3) Lê Văn C',
), [
  { name: 'Nguyễn Văn A', gender: '' },
  { name: 'Trần Thị B', gender: '' },
  { name: 'Lê Văn C', gender: '' },
]);

// --- Định dạng dòng + rỗng ---
recs('CRLF: tách đúng', P.parseRecords(
  'Nguyễn Văn A\tNam\r\nTrần Thị B\tNữ\r\n',
), [
  { name: 'Nguyễn Văn A', gender: 'nam' },
  { name: 'Trần Thị B', gender: 'nữ' },
]);
recs('văn bản rỗng: mảng rỗng', P.parseRecords(''), []);
recs('chỉ có tiêu đề: mảng rỗng', P.parseRecords('Họ tên\tGiới tính'), []);

// --- parse (chỉ lấy tên) ---
names('parse tab 2 cột: chỉ tên', P.parse(
  'Nguyễn Văn A\tNam\nTrần Thị B\tNữ',
), ['Nguyễn Văn A', 'Trần Thị B']);
names('parse mỗi-ô-một-dòng: chỉ tên, không "Nam"/"Nữ"', P.parse(
  'Nguyễn Văn A\nNam\nTrần Thị B\nNữ',
), ['Nguyễn Văn A', 'Trần Thị B']);
names('parse tên thuần có bạn tên "Nam": giữ tên "Nam"', P.parse(
  'Mai\nNam\nPhương\nTuấn\nHương\nĐức\nLinh\nKhoa',
), ['Mai', 'Nam', 'Phương', 'Tuấn', 'Hương', 'Đức', 'Linh', 'Khoa']);

console.log(`test-gv-parser: ${passed} đạt, ${failed} trượt.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
