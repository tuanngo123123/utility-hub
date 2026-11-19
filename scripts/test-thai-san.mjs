// test-thai-san.mjs — Bộ kiểm tra công cụ Tính tiền thai sản BHXH
// (logic thuần trong src/thai-san-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet,
// test-ma-tran, test-lop-hoc-3, test-chuyen-ma, test-anh-the,
// test-diem-dh): kiểm nào trượt thì build thất bại để không đăng
// công cụ tính tiền thai sản sai lên web.
//
// Mọi số trong file này đều tự tính tay (ghi rõ phép tính):
// - Mức tham chiếu = lương cơ sở 2.530.000₫ (NĐ 161/2026, từ 01/7/2026)
//   nên trợ cấp một lần = 2 × 2.530.000 = 5.060.000₫ mỗi con.
// - Mẹ: trợ cấp hằng tháng = 100% bình quân lương đóng BHXH 6 tháng
//   gần nhất; nghỉ 6 tháng (7 tháng khi sinh con thứ hai, Luật Dân
//   số 2025 từ 01/7/2026) + 1 tháng cho mỗi con từ con thứ 2 — sinh
//   con thứ hai mà sinh đôi nghỉ 8 tháng.
// - Chồng: mức một ngày = bình quân lương đóng ÷ 24 (khoản 2 Điều 59);
//   tổng = mức một ngày × số ngày nghỉ, làm tròn tới đồng; vợ sinh
//   con thứ hai thì chồng nghỉ tối thiểu 10 ngày (mức sàn, lấy max
//   với bảng theo số con và cách sinh).
// - Ví dụ đối chiếu nguồn ngoài (cafef, theo Điều 59): lương 6 triệu,
//   nghỉ 5 ngày được 1.250.000₫.
import {
  LUONG_CO_SO, CAP_BHXH, REQUIRED_MONTHS, REST_MONTHS,
  REST_TOTAL_MONTHS, LEAVE_MONTHS, LEAVE_MONTHS_SECOND,
  leaveMonths, checkEligibility, capSalary, computeMother,
  husbandDays, computeHusband, parseMoney,
} from '../src/thai-san-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}

// --- Hằng số (Luật BHXH 41/2024 + NĐ 161/2026) ---
check('Mức tham chiếu (lương cơ sở) = 2.530.000₫', LUONG_CO_SO, 2530000);
check('Trần đóng BHXH = 50.600.000₫', CAP_BHXH, 50600000);
check('Điều kiện thường: đủ 6 tháng trong 12 tháng', REQUIRED_MONTHS, 6);
check('Dưỡng thai: đủ 3 tháng trong 12 tháng', REST_MONTHS, 3);
check('Dưỡng thai: đã đóng tổng cộng từ đủ 12 tháng', REST_TOTAL_MONTHS, 12);
check('Nghỉ thai sản cơ bản 6 tháng', LEAVE_MONTHS, 6);
check('Sinh con thứ hai nghỉ 7 tháng (Luật Dân số 2025)', LEAVE_MONTHS_SECOND, 7);

// --- Số tháng nghỉ theo số con + con thứ mấy (Điều 139 BLLĐ 2019,
// sửa bởi khoản 1 Điều 29 Luật Dân số 2025) ---
check('Sinh 1 con đầu nghỉ 6 tháng', leaveMonths(1, false), 6);
check('Sinh con thứ hai 1 con nghỉ 7 tháng', leaveMonths(1, true), 7);
check('Sinh đôi (con đầu) nghỉ 7 tháng', leaveMonths(2, false), 7);
check('Sinh con thứ hai mà sinh đôi nghỉ 8 tháng', leaveMonths(2, true), 8);
check('Sinh ba (con đầu) nghỉ 8 tháng', leaveMonths(3, false), 8);
check('Sinh con thứ hai mà sinh ba nghỉ 9 tháng', leaveMonths(3, true), 9);

// --- Điều kiện hưởng của mẹ (Điều 50) ---
check('Đóng 12 tháng: đủ điều kiện',
  checkEligibility(12, false, false),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false });
check('Đóng đúng 6 tháng: đủ điều kiện (ranh giới)',
  checkEligibility(6, false, false),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false });
check('Đóng 5 tháng: thiếu 1 tháng',
  checkEligibility(5, false, false),
  { eligible: false, required: 6, missing: 1, reason: 'thieu-thang', needTotal12: false });
check('Dưỡng thai, đóng 3 tháng + tổng đủ 12 tháng: đủ điều kiện',
  checkEligibility(3, true, true),
  { eligible: true, required: 3, missing: 0, reason: 'ok', needTotal12: false });
check('Dưỡng thai, đóng 2 tháng + tổng đủ 12 tháng: thiếu 1 tháng',
  checkEligibility(2, true, true),
  { eligible: false, required: 3, missing: 1, reason: 'thieu-thang', needTotal12: false });
check('Dưỡng thai, đóng 3 tháng nhưng tổng chưa đủ 12 tháng: không đủ',
  checkEligibility(3, true, false),
  { eligible: false, required: 3, missing: 0, reason: 'thieu-tong-12-thang', needTotal12: true });

// --- Trần lương đóng BHXH ---
check('Lương 10 triệu không bị chặn trần',
  capSalary(10000000), { avg: 10000000, capped: false });
check('Lương 60 triệu chặn ở 50.600.000₫',
  capSalary(60000000), { avg: 50600000, capped: true });

// --- Mẹ sinh con: ví dụ trong đề bài ---
// Lương 10 triệu, sinh 1 con, đóng 12 tháng:
// trợ cấp 6 × 10.000.000 = 60.000.000 + một lần 5.060.000 = 65.060.000.
check('Mẹ lương 10tr, 1 con, đủ điều kiện → 65.060.000₫',
  computeMother({ avgSalary: 10000000, children: 1, months12: 12, restCase: false, total12plus: false }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 1, secondChild: false, baseMonths: 6, avg: 10000000, capped: false, months: 6, monthly: 10000000, allowance: 60000000, oneTime: 5060000, total: 65060000 });
// Sinh đôi: 7 × 10.000.000 = 70.000.000 + 2 × 5.060.000 = 80.120.000.
check('Mẹ lương 10tr, sinh đôi → 80.120.000₫',
  computeMother({ avgSalary: 10000000, children: 2, months12: 12, restCase: false, total12plus: false }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 2, secondChild: false, baseMonths: 6, avg: 10000000, capped: false, months: 7, monthly: 10000000, allowance: 70000000, oneTime: 10120000, total: 80120000 });
// Sinh ba: 8 × 10.000.000 = 80.000.000 + 3 × 5.060.000 = 95.180.000.
check('Mẹ lương 10tr, sinh ba → 95.180.000₫',
  computeMother({ avgSalary: 10000000, children: 3, months12: 12, restCase: false, total12plus: false }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 3, secondChild: false, baseMonths: 6, avg: 10000000, capped: false, months: 8, monthly: 10000000, allowance: 80000000, oneTime: 15180000, total: 95180000 });
// Đóng 5 tháng: chưa đủ điều kiện, các khoản tiền = 0.
check('Mẹ lương 10tr, đóng 5 tháng → chưa đủ điều kiện, 0₫',
  computeMother({ avgSalary: 10000000, children: 1, months12: 5, restCase: false, total12plus: false }),
  { eligible: false, required: 6, missing: 1, reason: 'thieu-thang', needTotal12: false, months12: 5, children: 1, secondChild: false, baseMonths: 6, avg: 10000000, capped: false, months: 6, monthly: 0, allowance: 0, oneTime: 0, total: 0 });
// Dưỡng thai, đóng 3 tháng + tổng đủ 12 tháng: đủ điều kiện.
check('Mẹ dưỡng thai, đóng 3 tháng + tổng đủ 12 tháng → 65.060.000₫',
  computeMother({ avgSalary: 10000000, children: 1, months12: 3, restCase: true, total12plus: true }),
  { eligible: true, required: 3, missing: 0, reason: 'ok', needTotal12: false, months12: 3, children: 1, secondChild: false, baseMonths: 6, avg: 10000000, capped: false, months: 6, monthly: 10000000, allowance: 60000000, oneTime: 5060000, total: 65060000 });
// Lương 60 triệu bị chặn trần: 6 × 50.600.000 = 303.600.000 + 5.060.000 = 308.660.000.
check('Mẹ lương 60tr bị chặn trần → 308.660.000₫',
  computeMother({ avgSalary: 60000000, children: 1, months12: 12, restCase: false, total12plus: false }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 1, secondChild: false, baseMonths: 6, avg: 50600000, capped: true, months: 6, monthly: 50600000, allowance: 303600000, oneTime: 5060000, total: 308660000 });

// --- Mẹ sinh con thứ hai: nghỉ 7 tháng (Luật Dân số 2025) ---
// Lương 10 triệu, sinh con thứ hai 1 con:
// 7 × 10.000.000 = 70.000.000 + 5.060.000 = 75.060.000.
check('Mẹ lương 10tr, sinh con thứ hai 1 con → 75.060.000₫',
  computeMother({ avgSalary: 10000000, children: 1, months12: 12, restCase: false, total12plus: false, secondChild: true }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 1, secondChild: true, baseMonths: 7, avg: 10000000, capped: false, months: 7, monthly: 10000000, allowance: 70000000, oneTime: 5060000, total: 75060000 });
// Sinh con thứ hai mà sinh đôi: 8 × 10.000.000 = 80.000.000
// + 2 × 5.060.000 = 90.120.000.
check('Mẹ lương 10tr, sinh con thứ hai + sinh đôi → 90.120.000₫',
  computeMother({ avgSalary: 10000000, children: 2, months12: 12, restCase: false, total12plus: false, secondChild: true }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 2, secondChild: true, baseMonths: 7, avg: 10000000, capped: false, months: 8, monthly: 10000000, allowance: 80000000, oneTime: 10120000, total: 90120000 });
// Sinh con thứ ba trở lên: về 6 tháng như con đầu → 65.060.000.
check('Mẹ lương 10tr, sinh con thứ ba 1 con → 65.060.000₫',
  computeMother({ avgSalary: 10000000, children: 1, months12: 12, restCase: false, total12plus: false, secondChild: false }),
  { eligible: true, required: 6, missing: 0, reason: 'ok', needTotal12: false, months12: 12, children: 1, secondChild: false, baseMonths: 6, avg: 10000000, capped: false, months: 6, monthly: 10000000, allowance: 60000000, oneTime: 5060000, total: 65060000 });

// --- Số ngày nghỉ của chồng (khoản 2 Điều 53) ---
check('Chồng: sinh thường 1 con = 5 ngày', husbandDays(1, 'thuong'), 5);
check('Chồng: phẫu thuật 1 con = 7 ngày', husbandDays(1, 'mo'), 7);
check('Chồng: sinh đôi = 10 ngày', husbandDays(2, 'thuong'), 10);
check('Chồng: sinh đôi phẫu thuật = 14 ngày', husbandDays(2, 'mo'), 14);
check('Chồng: sinh ba thường = 13 ngày (10 + 3)', husbandDays(3, 'thuong'), 13);
check('Chồng: sinh ba phẫu thuật = 17 ngày (14 + 3)', husbandDays(3, 'mo'), 17);
// Vợ sinh con thứ hai: mức 10 ngày là sàn (lấy max với bảng trên).
check('Chồng: vợ sinh con thứ hai, 1 con thường = 10 ngày', husbandDays(1, 'thuong', true), 10);
check('Chồng: vợ sinh con thứ hai, 1 con mổ = 10 ngày (max 7, 10)', husbandDays(1, 'mo', true), 10);
check('Chồng: vợ sinh con thứ hai + sinh đôi = 10 ngày', husbandDays(2, 'thuong', true), 10);
check('Chồng: vợ sinh con thứ hai + sinh đôi mổ = 14 ngày', husbandDays(2, 'mo', true), 14);
check('Chồng: vợ sinh con thứ hai + sinh ba thường = 13 ngày', husbandDays(3, 'thuong', true), 13);
check('Chồng: vợ sinh con thứ hai + sinh ba mổ = 17 ngày', husbandDays(3, 'mo', true), 17);

// --- Chồng: tiền trợ cấp (mức ngày = lương ÷ 24) ---
// Lương 10 triệu, sinh thường 5 ngày: 10.000.000 ÷ 24 × 5 = 2.083.333,33 → 2.083.333.
check('Chồng lương 10tr, sinh thường 5 ngày → 2.083.333₫',
  computeHusband({ avgSalary: 10000000, children: 1, type: 'thuong' }).total, 2083333);
check('Chồng lương 10tr, sinh thường 5 ngày → đúng 5 ngày',
  computeHusband({ avgSalary: 10000000, children: 1, type: 'thuong' }).days, 5);
// Lương 10 triệu, mổ 7 ngày: 10.000.000 ÷ 24 × 7 = 2.916.666,67 → 2.916.667.
check('Chồng lương 10tr, mổ 7 ngày → 2.916.667₫',
  computeHusband({ avgSalary: 10000000, children: 1, type: 'mo' }).total, 2916667);
// Lương 6 triệu, sinh thường 5 ngày: 6.000.000 ÷ 24 × 5 = 1.250.000 (ví dụ cafef).
check('Chồng lương 6tr, sinh thường 5 ngày → 1.250.000₫',
  computeHusband({ avgSalary: 6000000, children: 1, type: 'thuong' }).total, 1250000);
// Lương 10 triệu, sinh đôi 10 ngày: 10.000.000 ÷ 24 × 10 = 4.166.666,67 → 4.166.667.
check('Chồng lương 10tr, sinh đôi 10 ngày → 4.166.667₫',
  computeHusband({ avgSalary: 10000000, children: 2, type: 'thuong' }).total, 4166667);
// Lương 10 triệu, sinh đôi mổ 14 ngày: 10.000.000 ÷ 24 × 14 = 5.833.333,33 → 5.833.333.
check('Chồng lương 10tr, sinh đôi mổ 14 ngày → 5.833.333₫',
  computeHusband({ avgSalary: 10000000, children: 2, type: 'mo' }).total, 5833333);
// Lương 10 triệu, sinh ba thường 13 ngày: 10.000.000 ÷ 24 × 13 = 5.416.666,67 → 5.416.667.
check('Chồng lương 10tr, sinh ba thường 13 ngày → 5.416.667₫',
  computeHusband({ avgSalary: 10000000, children: 3, type: 'thuong' }).total, 5416667);
// Lương 10 triệu, sinh ba mổ 17 ngày: 10.000.000 ÷ 24 × 17 = 7.083.333,33 → 7.083.333.
check('Chồng lương 10tr, sinh ba mổ 17 ngày → 7.083.333₫',
  computeHusband({ avgSalary: 10000000, children: 3, type: 'mo' }).total, 7083333);
// Lương 10 triệu, vợ sinh con thứ hai 10 ngày → 4.166.667.
check('Chồng lương 10tr, vợ sinh con thứ hai → 4.166.667₫',
  computeHusband({ avgSalary: 10000000, children: 1, type: 'thuong', secondChild: true }).total, 4166667);
// Lương 10 triệu, vợ sinh con thứ hai + sinh ba thường 13 ngày:
// 10.000.000 ÷ 24 × 13 = 5.416.666,67 → 5.416.667.
check('Chồng lương 10tr, vợ sinh con thứ hai + sinh ba thường 13 ngày → 5.416.667₫',
  computeHusband({ avgSalary: 10000000, children: 3, type: 'thuong', secondChild: true }).total, 5416667);
check('Chồng vợ sinh con thứ hai + sinh ba thường → đúng 13 ngày',
  computeHusband({ avgSalary: 10000000, children: 3, type: 'thuong', secondChild: true }).days, 13);
// Lương 10 triệu, vợ sinh con thứ hai + sinh đôi mổ 14 ngày:
// 10.000.000 ÷ 24 × 14 = 5.833.333,33 → 5.833.333.
check('Chồng lương 10tr, vợ sinh con thứ hai + sinh đôi mổ 14 ngày → 5.833.333₫',
  computeHusband({ avgSalary: 10000000, children: 2, type: 'mo', secondChild: true }).total, 5833333);
check('Chồng vợ sinh con thứ hai + sinh đôi mổ → đúng 14 ngày',
  computeHusband({ avgSalary: 10000000, children: 2, type: 'mo', secondChild: true }).days, 14);
// Lương 10 triệu, vợ sinh con thứ hai + 1 con mổ: max(7, 10) = 10 ngày → 4.166.667.
check('Chồng lương 10tr, vợ sinh con thứ hai + 1 con mổ → 4.166.667₫',
  computeHusband({ avgSalary: 10000000, children: 1, type: 'mo', secondChild: true }).total, 4166667);
// floorApplied: sàn 10 ngày là lý do khi bảng cũ cho dưới 10 ngày.
check('Chồng con thứ hai 1 con thường: sàn 10 ngày quyết định số ngày',
  computeHusband({ avgSalary: 10000000, children: 1, type: 'thuong', secondChild: true }).floorApplied, true);
check('Chồng con thứ hai + sinh đôi mổ: mức mổ 14 ngày cao hơn sàn',
  computeHusband({ avgSalary: 10000000, children: 2, type: 'mo', secondChild: true }).floorApplied, false);

// --- Đọc số tiền từ ô nhập ---
check("parseMoney('10.000.000') = 10000000", parseMoney('10.000.000'), 10000000);
check("parseMoney(' 8.500.000 ') = 8500000 (khoảng trắng đầu/cuối)", parseMoney(' 8.500.000 '), 8500000);
check("parseMoney('0') = 0", parseMoney('0'), 0);
check("parseMoney('') = null (ô trống)", parseMoney(''), null);
check("parseMoney('abc') = null (không phải số)", parseMoney('abc'), null);
check("parseMoney('-5') = null (âm)", parseMoney('-5'), null);

if (failed) {
  console.error(`test-thai-san: ${passed} đạt, ${failed} trượt.\n` + failures.join('\n'));
  process.exit(1);
} else {
  console.log(`test-thai-san: ${passed} đạt, 0 trượt.`);
}
