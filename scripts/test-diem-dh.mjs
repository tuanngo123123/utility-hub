// test-diem-dh.mjs — Bộ kiểm tra công cụ Tính điểm xét tuyển đại học
// (logic thuần trong src/diem-dh-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet,
// test-ma-tran, test-lop-hoc-3, test-chuyen-ma, test-anh-the):
// kiểm nào trượt thì build thất bại để không đăng công cụ tính
// điểm xét tuyển sai lên web.
//
// Mọi số trong file này đều tự tính tay (ghi rõ phép tính):
// - Công thức giảm dần (khoản 4 Điều 7, TT 06/2026/TT-BGDĐT):
//   điểm ưu tiên thực tế = [(30 − tổng điểm) ÷ 7,5] × mức ưu tiên,
//   áp dụng từ tổng điểm 22,5 trở lên, làm tròn đến hàng phần trăm.
// - Ví dụ trong đề bài: 8 + 8,5 + 7,5 = 24; KV1 0,75:
//   [(30 − 24) ÷ 7,5] × 0,75 = 0,8 × 0,75 = 0,6 → 24,6.
// - Ví dụ đối chiếu nguồn ngoài (fptshop, theo khoản 4 Điều 7):
//   KV1 tổng 27 → 0,3; KV1 tổng 29 → 0,1.
import {
  KV_POINTS, OBJ_POINTS, SLIDE_FROM, MAX_TOTAL, MAX_BONUS,
  round2, fmtScore, parseScore, priorityPoints, computeAdmission,
  sampleExam, sampleTranscript,
} from '../src/diem-dh-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}

// --- Hằng số (Điều 7, TT 06/2026/TT-BGDĐT) ---
check('KV1 = 0,75', KV_POINTS.KV1, 0.75);
check('KV2-NT = 0,5', KV_POINTS['KV2-NT'], 0.5);
check('KV2 = 0,25', KV_POINTS.KV2, 0.25);
check('KV3 = 0', KV_POINTS.KV3, 0);
check('UT1 = 2', OBJ_POINTS.UT1, 2);
check('UT2 = 1', OBJ_POINTS.UT2, 1);
check('Không đối tượng = 0', OBJ_POINTS.NONE, 0);
check('Ngưỡng giảm dần = 22,5', SLIDE_FROM, 22.5);
check('Tổng tối đa thang 30', MAX_TOTAL, 30);
check('Trần điểm cộng thêm = 3', MAX_BONUS, 3);

// --- Làm tròn + định dạng (bẫy float) ---
check('round2(0,1 + 0,2) = 0,3', round2(0.1 + 0.2), 0.3);
check('round2(0,225) = 0,23 (làm tròn lên hàng phần trăm)', round2(0.225), 0.23);
check('round2(0,8 × 0,75) = 0,6', round2(0.8 * 0.75), 0.6);
check('fmtScore(24,6) = "24,60"', fmtScore(24.6), '24,60');
check('fmtScore(30) = "30,00"', fmtScore(30), '30,00');
check('fmtScore(0) = "0,00"', fmtScore(0), '0,00');

// --- Đọc điểm ---
check("parseScore('8,5') = 8,5", parseScore('8,5'), 8.5);
check("parseScore('10') = 10", parseScore('10'), 10);
check("parseScore('0') = 0", parseScore('0'), 0);
check("parseScore(' 7,5 ') = 7,5 (khoảng trắng đầu/cuối)", parseScore(' 7,5 '), 7.5);
check("parseScore('') = null (ô trống)", parseScore(''), null);
check("parseScore('11') = null (quá 10)", parseScore('11'), null);
check("parseScore('-1') = null (âm)", parseScore('-1'), null);
check("parseScore('abc') = null (không phải số)", parseScore('abc'), null);

// --- Ví dụ trong đề bài: 8 + 8,5 + 7,5 = 24, KV1 ---
// [(30 − 24) ÷ 7,5] × 0,75 = 0,8 × 0,75 = 0,6 → 24 + 0,6 = 24,6.
check('Ví dụ đề bài: tổng 24, KV1 → ưu tiên 0,6, xét tuyển 24,6',
  computeAdmission({ scores: [8, 8.5, 7.5], kv: 'KV1', obj: 'NONE', bonus: 0 }),
  { total: 24, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.6, scaled: true, bonus: 0, final: 24.6 });

// --- Dưới ngưỡng 22,5: cộng đủ, không giảm ---
// 7 + 7 + 7 = 21 < 22,5 → KV1 cộng đủ 0,75 → 21,75.
check('Tổng 21, KV1 → cộng đủ 0,75, xét tuyển 21,75',
  computeAdmission({ scores: [7, 7, 7], kv: 'KV1', obj: 'NONE', bonus: 0 }),
  { total: 21, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.75, scaled: false, bonus: 0, final: 21.75 });

// --- Đúng ngưỡng 22,5: hệ số (30 − 22,5) ÷ 7,5 = 1 nên vẫn cộng đủ ---
// 7,5 × 3 = 22,5 → 1 × 0,75 = 0,75 → 23,25.
check('Tổng đúng 22,5, KV1 → vẫn cộng đủ 0,75, xét tuyển 23,25',
  computeAdmission({ scores: [7.5, 7.5, 7.5], kv: 'KV1', obj: 'NONE', bonus: 0 }),
  { total: 22.5, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.75, scaled: true, bonus: 0, final: 23.25 });

// --- Trên ngưỡng: 27 điểm KV1 → (3 ÷ 7,5) × 0,75 = 0,3 → 27,3 ---
check('Tổng 27, KV1 → ưu tiên 0,3, xét tuyển 27,3',
  computeAdmission({ scores: [9, 9, 9], kv: 'KV1', obj: 'NONE', bonus: 0 }),
  { total: 27, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.3, scaled: true, bonus: 0, final: 27.3 });

// --- 29 điểm KV1 → (1 ÷ 7,5) × 0,75 = 0,1 → 29,1 ---
check('Tổng 29, KV1 → ưu tiên 0,1, xét tuyển 29,1',
  computeAdmission({ scores: [10, 10, 9], kv: 'KV1', obj: 'NONE', bonus: 0 }),
  { total: 29, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.1, scaled: true, bonus: 0, final: 29.1 });

// --- Tổng 30: ưu tiên về 0 dù KV1 + UT1 = 2,75 ---
// (30 − 30) ÷ 7,5 = 0 → 0 × 2,75 = 0 → 30.
check('Tổng 30, KV1 + UT1 → ưu tiên 0, xét tuyển 30',
  computeAdmission({ scores: [10, 10, 10], kv: 'KV1', obj: 'UT1', bonus: 0 }),
  { total: 30, kv: 0.75, obj: 2, pri0: 2.75, pri: 0, scaled: true, bonus: 0, final: 30 });

// --- Khu vực + đối tượng cộng cả hai rồi mới giảm dần ---
// 8 × 3 = 24; KV2-NT 0,5 + UT2 1 = 1,5; 0,8 × 1,5 = 1,2 → 25,2.
check('Tổng 24, KV2-NT + UT2 → ưu tiên 1,2, xét tuyển 25,2',
  computeAdmission({ scores: [8, 8, 8], kv: 'KV2-NT', obj: 'UT2', bonus: 0 }),
  { total: 24, kv: 0.5, obj: 1, pri0: 1.5, pri: 1.2, scaled: true, bonus: 0, final: 25.2 });

// --- UT1 dưới ngưỡng: 7 + 7 + 6 = 20, KV3 + UT1 → cộng đủ 2 → 22 ---
check('Tổng 20, KV3 + UT1 → ưu tiên 2, xét tuyển 22',
  computeAdmission({ scores: [7, 7, 6], kv: 'KV3', obj: 'UT1', bonus: 0 }),
  { total: 20, kv: 0, obj: 2, pri0: 2, pri: 2, scaled: false, bonus: 0, final: 22 });

// --- Bẫy làm tròn: 9,25 × 3 = 27,75; KV1: (2,25 ÷ 7,5) × 0,75
// = 0,3 × 0,75 = 0,225 → làm tròn 0,23 → 27,98 ---
check('Tổng 27,75, KV1 → ưu tiên 0,23, xét tuyển 27,98',
  computeAdmission({ scores: [9.25, 9.25, 9.25], kv: 'KV1', obj: 'NONE', bonus: 0 }),
  { total: 27.75, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.23, scaled: true, bonus: 0, final: 27.98 });

// --- Xét học bạ: 8 + 7,5 + 8,5 = 24; KV2-NT 0,5:
// 0,8 × 0,5 = 0,4 → 24,4 ---
check('Học bạ tổng 24, KV2-NT → ưu tiên 0,4, xét tuyển 24,4',
  computeAdmission({ scores: [8, 7.5, 8.5], kv: 'KV2-NT', obj: 'NONE', bonus: 0 }),
  { total: 24, kv: 0.5, obj: 0, pri0: 0.5, pri: 0.4, scaled: true, bonus: 0, final: 24.4 });

// --- Không ưu tiên: KV3 + không đối tượng → 0 ---
check('Tổng 24, KV3 + không đối tượng → ưu tiên 0, xét tuyển 24',
  computeAdmission({ scores: [8, 8, 8], kv: 'KV3', obj: 'NONE', bonus: 0 }),
  { total: 24, kv: 0, obj: 0, pri0: 0, pri: 0, scaled: false, bonus: 0, final: 24 });

// --- Điểm cộng thêm không bị giảm dần ---
// Tổng 24, KV1 (ưu tiên 0,6) + cộng thêm 2 → 24 + 0,6 + 2 = 26,6.
check('Tổng 24, KV1 + cộng thêm 2 → xét tuyển 26,6',
  computeAdmission({ scores: [8, 8.5, 7.5], kv: 'KV1', obj: 'NONE', bonus: 2 }),
  { total: 24, kv: 0.75, obj: 0, pri0: 0.75, pri: 0.6, scaled: true, bonus: 2, final: 26.6 });

// --- Điểm cộng thêm vượt trần 3 thì chặn ở 3 ---
// Tổng 21, KV3, bonus 5 → 21 + 0 + 3 = 24.
check('Bonus 5 bị chặn ở 3: tổng 21 → xét tuyển 24',
  computeAdmission({ scores: [7, 7, 7], kv: 'KV3', obj: 'NONE', bonus: 5 }),
  { total: 21, kv: 0, obj: 0, pri0: 0, pri: 0, scaled: false, bonus: 3, final: 24 });

// --- Điểm xét tuyển chặn ở thang 30 (quy chế: không vượt 30,
// bao gồm cả điểm cộng và điểm ưu tiên) ---
// Tổng 29, KV1 (ưu tiên 0,1) + cộng thêm 3 → chưa chặn 32,1 → lấy 30.
check('Tổng 29 + ưu tiên 0,1 + cộng thêm 3 → chặn ở 30',
  computeAdmission({ scores: [10, 10, 9], kv: 'KV1', obj: 'NONE', bonus: 3 }).final, 30);
// Tổng 30, KV1 (ưu tiên 0) + cộng thêm 3 → chưa chặn 33 → lấy 30.
check('Tổng 30 + cộng thêm 3 → chặn ở 30',
  computeAdmission({ scores: [10, 10, 10], kv: 'KV1', obj: 'NONE', bonus: 3 }).final, 30);

// --- priorityPoints trực tiếp ---
check('priorityPoints(24, KV1, NONE)',
  priorityPoints(24, 'KV1', 'NONE'),
  { kv: 0.75, obj: 0, pri0: 0.75, pri: 0.6, scaled: true });
check('priorityPoints(20, KV2, UT2) — dưới ngưỡng, cộng đủ 1,25',
  priorityPoints(20, 'KV2', 'UT2'),
  { kv: 0.25, obj: 1, pri0: 1.25, pri: 1.25, scaled: false });

// --- Ví dụ mẫu điền sẵn ---
check('sampleExam đúng đề bài', sampleExam(), { scores: [8, 8.5, 7.5], kv: 'KV1', obj: 'NONE', bonus: 0 });
check('sampleExam tính ra 24,6', computeAdmission(sampleExam()).final, 24.6);
check('sampleTranscript tính ra 24,6', computeAdmission(sampleTranscript()).final, 24.6);

if (failed) {
  console.error(`test-diem-dh: ${passed} đạt, ${failed} trượt.\n` + failures.join('\n'));
  process.exit(1);
} else {
  console.log(`test-diem-dh: ${passed} đạt, 0 trượt.`);
}
