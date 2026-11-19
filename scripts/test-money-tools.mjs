// test-money-tools.mjs — Bộ kiểm tra tự động cho 9 công cụ tiền/lương/thuế.
//
// Chạy trong `npm run build` TRƯỚC build.mjs: kiểm nào trượt thì build
// thất bại (exit 1) để không đăng số sai lên web.
//
// Mọi kỳ vọng đều TÍNH TAY độc lập bằng Python theo đúng văn bản (không
// lấy số từ chính hàm đang kiểm). Tiền so sánh sau khi làm tròn đồng,
// dung sai ±2đ để trừ sai số dấu phẩy động (Python và JS cùng IEEE 754
// nên thực tế khớp tuyệt đối; dung sai chỉ để phòng pow() khác nhau ở
// chữ số cuối).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  taxByBrackets, grossNet, netToGross, thueTncnFromSalary, thueTncnFromTaxable,
  bhxhMotLan, luongHuu, tienDien, laiVay, luongThang13, bhtn, quyetToanThue,
} from '../src/money-formulas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;
const failures = [];

function eq(name, actual, expected, tol = 2) {
  const a = Math.round(actual);
  const e = Math.round(expected);
  if (Math.abs(a - e) <= tol) {
    passed++;
  } else {
    failed++;
    failures.push(`${name}: được ${a.toLocaleString('vi-VN')}, kỳ vọng ${e.toLocaleString('vi-VN')}`);
  }
}
function is(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; failures.push(`${name}: được ${actual}, kỳ vọng ${expected}`); }
}

// --- Lương Gross ⇄ Net (luật 2026: BHXH 10,5%, trần 50,6tr; giảm trừ 15,5tr/6,2tr) ---
{
  let r = grossNet(30000000, 30000000, 106200000, 0);
  eq('gross-net 30tr: net', r.net, 26215000);
  eq('gross-net 30tr: bảo hiểm', r.insurance, 3150000);
  eq('gross-net 30tr: TNTT', r.taxable, 11350000);
  eq('gross-net 30tr: thuế', r.tax, 635000);
  r = grossNet(15000000, 15000000, 106200000, 0);
  eq('gross-net 15tr: net', r.net, 13425000);
  eq('gross-net 15tr: thuế 0', r.tax, 0);
  r = grossNet(30000000, 30000000, 106200000, 1);
  eq('gross-net 30tr 1 phụ thuộc: net', r.net, 26592500);
  eq('gross-net 30tr 1 phụ thuộc: thuế', r.tax, 257500);
  eq('gross-net 30tr 1 phụ thuộc: TNTT', r.taxable, 5150000);
  r = grossNet(20000000, 20000000, 106200000, 0);
  eq('gross-net 20tr: net', r.net, 17780000);
  r = grossNet(45000000, 45000000, 106200000, 0);
  eq('gross-net 45tr: net', r.net, 38297500);
  r = grossNet(120000000, 120000000, 106200000, 0);
  eq('gross-net 120tr vùng I: bảo hiểm (trần BHXH 50,6tr + BHTN 106,2tr)', r.insurance, 5869000);
  eq('gross-net 120tr vùng I: net', r.net, 94041700);
  r = grossNet(120000000, 120000000, 74000000, 0);
  eq('gross-net 120tr vùng IV: bảo hiểm (BHTN trần 74tr)', r.insurance, 5547000);
  eq('gross-net 120tr vùng IV: net', r.net, 94267100);
  // Net → Gross: đi vòng về lại đúng số (sai số dưới 2.000đ).
  const back = netToGross(20000000, null, 106200000, 0);
  eq('net-to-gross 20tr: net vòng lại', back.net, 20000000, 2000);
  const back2 = netToGross(26215000, null, 106200000, 0);
  eq('net-to-gross 26.215.000: gross vòng lại 30tr', back2.gross, 30000000, 2000);
}

// --- Thuế TNCN ---
{
  let r = thueTncnFromSalary(45000000, 45000000, 106200000, 1);
  eq('tncn lương 45tr 1 phụ thuộc: TNTT', r.taxable, 18575000);
  eq('tncn lương 45tr 1 phụ thuộc: thuế/tháng', r.tax, 1357500);
  eq('tncn lương 45tr 1 phụ thuộc: bảo hiểm', r.insurance, 4725000);
  eq('tncn TNTT 18.575.000: thuế', thueTncnFromTaxable(18575000).tax, 1357500);
  eq('tncn TNTT 10.000.000: thuế', thueTncnFromTaxable(10000000).tax, 500000);
  eq('tncn TNTT 0: thuế', thueTncnFromTaxable(0).tax, 0);
  eq('tncn TNTT 100.000.000: thuế', thueTncnFromTaxable(100000000).tax, 20500000);
  eq('tncn TNTT 150.000.000: thuế', thueTncnFromTaxable(150000000).tax, 38000000);
  is('tncn TNTT 18.575.000: 2 bậc thuế', thueTncnFromTaxable(18575000).taxRows.length, 2);
}

// --- BHXH một lần (Điều 70 Luật 41/2024) ---
{
  eq('bhxh 10tr, 5n3t trước 2014 + 8n sau 2014', bhxhMotLan(10000000, 5, 3, 8, 0, 0).amount, 245000000);
  eq('bhxh 12tr, 3n8t trước 2014 + 6n2t sau 2014', bhxhMotLan(12000000, 3, 8, 6, 2, 0).amount, 222000000);
  eq('bhxh 10tr, đóng 6 tháng (chưa đủ 1 năm, ước tính)', bhxhMotLan(10000000, 0, 6, 0, 0, 0).amount, 13200000);
  eq('bhxh 10tr, đóng 6 tháng, đã đóng 25tr (chặn 2 tháng lương)', bhxhMotLan(10000000, 0, 6, 0, 0, 25000000).amount, 20000000);
  eq('bhxh 10tr, 1 năm sau 2014', bhxhMotLan(10000000, 0, 0, 1, 0, 0).amount, 20000000);
  eq('bhxh 10tr, 10 năm trước 2014', bhxhMotLan(10000000, 10, 0, 0, 0, 0).amount, 150000000);
  eq('bhxh 10tr, 7 tháng sau 2014 (chưa đủ 1 năm)', bhxhMotLan(10000000, 0, 0, 0, 7, 0).amount, 15400000);
}

// --- Lương hưu (Điều 66, 68 Luật 41/2024) ---
{
  let r = luongHuu('nu', 28, 0, 12000000, 0, 0, 0);
  eq('lương hưu nữ 28n 12tr: tỷ lệ', r.rate, 71);
  eq('lương hưu nữ 28n 12tr: lương hưu', r.pension, 8520000);
  r = luongHuu('nu', 15, 0, 10000000, 0, 0, 0);
  eq('lương hưu nữ 15n: tỷ lệ', r.rate, 45);
  eq('lương hưu nữ 15n: lương hưu', r.pension, 4500000);
  r = luongHuu('nu', 30, 0, 10000000, 0, 0, 0);
  eq('lương hưu nữ 30n: tỷ lệ tối đa 75%', r.rate, 75);
  r = luongHuu('nam', 15, 0, 10000000, 0, 0, 0);
  eq('lương hưu nam 15n: tỷ lệ 40%', r.rate, 40);
  r = luongHuu('nam', 20, 0, 10000000, 0, 0, 0);
  eq('lương hưu nam 20n: tỷ lệ 45%', r.rate, 45);
  r = luongHuu('nam', 35, 0, 10000000, 0, 0, 0);
  eq('lương hưu nam 35n: tỷ lệ tối đa 75%', r.rate, 75);
  r = luongHuu('nam', 17, 6, 10000000, 0, 0, 0);
  eq('lương hưu nam 17,5n: tỷ lệ 42,5%', r.rate * 10, 425);
  eq('lương hưu nam 17,5n: lương hưu', r.pension, 4250000);
  r = luongHuu('nu', 28, 0, 12000000, 2, 0, 0);
  eq('lương hưu nghỉ sớm 2 năm: trừ 4%', r.reduction, 4);
  eq('lương hưu nghỉ sớm 2 năm: lương hưu', r.pension, 8040000);
  r = luongHuu('nu', 28, 0, 12000000, 0, 8, 0);
  eq('lương hưu nghỉ sớm 8 tháng: trừ 1%', r.reduction, 1);
  eq('lương hưu nghỉ sớm 8 tháng: lương hưu', r.pension, 8400000);
  r = luongHuu('nu', 28, 0, 12000000, 0, 5, 0);
  eq('lương hưu nghỉ sớm 5 tháng: không trừ', r.reduction, 0);
  r = luongHuu('nu', 32, 0, 10000000, 0, 0, 0);
  eq('lương hưu nữ 32n: trợ cấp một lần (vượt 2 năm × 0,5)', r.lump, 10000000);
  r = luongHuu('nu', 32, 0, 10000000, 0, 0, 2);
  eq('lương hưu nữ 32n + 2n sau tuổi hưu: trợ cấp (2n × 2)', r.lump, 40000000);
  r = luongHuu('nu', 28, 0, 60000000, 0, 0, 0);
  is('lương hưu bình quân 60tr: áp trần 50,6tr', r.capped, true);
  eq('lương hưu bình quân 60tr: lương hưu', r.pension, 35926000);
  r = luongHuu('nu', 10, 0, 10000000, 0, 0, 0);
  is('lương hưu 10n: chưa đủ điều kiện', r.eligible, false);
  eq('lương hưu 10n: còn thiếu 5 năm', r.needYears, 5);
}

// --- Tiền điện bậc thang (QĐ 2892/QĐ-BCT, VAT 8%) ---
{
  let r = tienDien(500, 8);
  eq('điện 500 kWh: trước thuế', r.subtotal, 1343400);
  eq('điện 500 kWh: VAT', r.vat, 107472);
  eq('điện 500 kWh: tổng', r.total, 1450872);
  r = tienDien(250, 8);
  eq('điện 250 kWh: tổng', r.total, 608796);
  r = tienDien(100, 8);
  eq('điện 100 kWh: tổng', r.total, 205308);
  r = tienDien(0, 8);
  eq('điện 0 kWh: tổng', r.total, 0);
  r = tienDien(1000, 8);
  eq('điện 1000 kWh: trước thuế', r.subtotal, 3187800);
  eq('điện 1000 kWh: tổng', r.total, 3442824);
  r = tienDien(350, 8);
  eq('điện 350 kWh: tổng', r.total, 921348);
  r = tienDien(500, 0);
  eq('điện 500 kWh VAT 0%: tổng = trước thuế', r.total, 1343400);
}

// --- Lãi vay ---
{
  let r = laiVay(100000000, 12, 12, 'annuity');
  eq('vay 100tr 12%/12t trả đều: mỗi tháng', r.monthly, 8884879);
  eq('vay 100tr 12%/12t trả đều: tổng lãi', r.totalInterest, 6618546);
  eq('vay 100tr 12%/12t trả đều: tổng phải trả', r.totalPay, 106618546);
  is('vay 100tr trả đều: đủ 12 kỳ', r.schedule.length, 12);
  eq('vay 100tr trả đều: dư nợ cuối = 0', r.schedule[11].balance, 0);
  r = laiVay(100000000, 12, 12, 'declining');
  eq('vay 100tr dư nợ giảm dần: tháng đầu', r.firstPay, 9333333);
  eq('vay 100tr dư nợ giảm dần: tháng cuối', r.lastPay, 8416667);
  eq('vay 100tr dư nợ giảm dần: tổng lãi', r.totalInterest, 6500000);
  r = laiVay(100000000, 0, 10, 'annuity');
  eq('vay 100tr lãi 0%: mỗi tháng', r.monthly, 10000000);
  eq('vay 100tr lãi 0%: tổng lãi', r.totalInterest, 0);
  r = laiVay(300000000, 10.5, 24, 'annuity');
  eq('vay 300tr 10,5%/24t trả đều: mỗi tháng', r.monthly, 13912812);
  eq('vay 300tr 10,5%/24t trả đều: tổng lãi', r.totalInterest, 33907500);
  r = laiVay(50000000, 18, 6, 'annuity');
  eq('vay 50tr 18%/6t trả đều: mỗi tháng', r.monthly, 8776261);
  eq('vay 50tr 18%/6t trả đều: tổng lãi', r.totalInterest, 2657564);
}

// --- Lương tháng 13 ---
{
  let r = luongThang13(15000000, 12, 0, 0);
  eq('tháng 13 lương 15tr đủ 12t: thưởng', r.bonus, 15000000);
  eq('tháng 13 lương 15tr đủ 12t: thuế trên thưởng', r.taxOnBonus, 950000);
  eq('tháng 13 lương 15tr đủ 12t: thực nhận', r.net, 14050000);
  eq('tháng 13 lương 15tr đủ 12t: TNTT tháng nhận thưởng', r.taxableMonth, 14500000);
  eq('tháng 13 lương 15tr đủ 12t: TNTT tháng không thưởng', r.taxableWithout, 0);
  r = luongThang13(15000000, 6, 0, 0);
  eq('tháng 13 lương 15tr 6t: thưởng', r.bonus, 7500000);
  eq('tháng 13 lương 15tr 6t: thuế', r.taxOnBonus, 350000);
  eq('tháng 13 lương 15tr 6t: thực nhận', r.net, 7150000);
  r = luongThang13(30000000, 12, 1, 0);
  eq('tháng 13 lương 30tr 1 phụ thuộc: thuế', r.taxOnBonus, 3745000);
  eq('tháng 13 lương 30tr 1 phụ thuộc: thực nhận', r.net, 26255000);
  eq('tháng 13 lương 30tr 1 phụ thuộc: TNTT tháng không thưởng', r.taxableWithout, 8300000);
  r = luongThang13(15000000, 12, 0, 1575000);
  eq('tháng 13 có bảo hiểm 1.575.000: thuế', r.taxOnBonus, 792500);
  eq('tháng 13 có bảo hiểm 1.575.000: thực nhận', r.net, 14207500);
  r = luongThang13(10000000, 12, 0, 0);
  eq('tháng 13 lương 10tr: thuế', r.taxOnBonus, 225000);
  eq('tháng 13 lương 10tr: thực nhận', r.net, 9775000);
}

// --- BHTN + trợ cấp thôi việc (Điều 39 Luật Việc làm 74/2025) ---
{
  let r = bhtn(12000000, 24, 'I', 0);
  eq('bhtn 12tr 24t vùng I: /tháng', r.monthly, 7200000);
  eq('bhtn 12tr 24t vùng I: trần', r.cap, 26550000);
  eq('bhtn 12tr 24t vùng I: số tháng hưởng', r.benefitMonths, 3);
  eq('bhtn 12tr 24t vùng I: tổng', r.totalBHTN, 21600000);
  r = bhtn(12000000, 12, 'I', 0);
  eq('bhtn 12 tháng đóng: 3 tháng hưởng', r.benefitMonths, 3);
  r = bhtn(12000000, 11, 'I', 0);
  is('bhtn 11 tháng đóng: chưa đủ điều kiện', r.eligible, false);
  eq('bhtn 11 tháng đóng: tổng 0', r.totalBHTN, 0);
  r = bhtn(12000000, 48, 'I', 0);
  eq('bhtn 48 tháng đóng: 4 tháng hưởng', r.benefitMonths, 4);
  eq('bhtn 48 tháng đóng: tổng', r.totalBHTN, 28800000);
  r = bhtn(12000000, 144, 'I', 0);
  eq('bhtn 144 tháng đóng: tối đa 12 tháng', r.benefitMonths, 12);
  r = bhtn(50000000, 24, 'I', 0);
  is('bhtn lương 50tr: áp trần', r.capped, true);
  eq('bhtn lương 50tr: /tháng = trần', r.monthly, 26550000);
  eq('bhtn lương 50tr: tổng', r.totalBHTN, 79650000);
  r = bhtn(12000000, 24, 'IV', 0);
  eq('bhtn vùng IV: trần 18.500.000', r.cap, 18500000);
  r = bhtn(12000000, 24, 'I', 2);
  eq('bhtn + 2 năm trước 2009: trợ cấp thôi việc', r.severance, 12000000);
}

// --- Quyết toán thuế TNCN 2026 (biểu năm = bậc tháng × 12; giảm trừ bản thân đủ 186tr khi quyết toán) ---
{
  // Thu nhập đều cả năm (45tr/tháng, 1 phụ thuộc) thì khấu trừ hằng tháng khớp thuế năm (chênh 0).
  let r = quyetToanThue(540000000, 56700000, 1, 12, 0, 0, 16290000);
  eq('QTTT đều cả năm: TNTT', r.taxable, 222900000);
  eq('QTTT đều cả năm: thuế', r.tax, 16290000);
  eq('QTTT đều cả năm: chênh', r.diff, 0);
  // Giảm trừ y tế + giáo dục đủ trần (23tr + 24tr): TNTT 14,8tr, thuế 740.000₫, hoàn 2.350.000₫.
  r = quyetToanThue(360000000, 37800000, 1, 12, 23000000, 24000000, 3090000);
  eq('QTTT y tế+GD đủ trần: TNTT', r.taxable, 14800000);
  eq('QTTT y tế+GD đủ trần: thuế', r.tax, 740000);
  eq('QTTT y tế+GD đủ trần: hoàn', r.refund, 2350000);
  // Trần y tế/giáo dục: nhập 30tr thì chỉ tính 23tr/24tr (TNTT 89,2tr → thuế 4.460.000₫).
  r = quyetToanThue(360000000, 37800000, 0, 12, 30000000, 30000000, 0);
  eq('QTTT trần y tế: áp dụng', r.medicalApplied, 23000000);
  eq('QTTT trần giáo dục: áp dụng', r.eduApplied, 24000000);
  eq('QTTT trần y tế+GD: thuế', r.tax, 4460000);
  is('QTTT trần y tế: cờ vượt trần', r.medicalCapped, true);
  is('QTTT trần giáo dục: cờ vượt trần', r.eduCapped, true);
  // Phụ thuộc 2 người × 6 tháng: giảm trừ 74,4tr, thuế 21.660.000₫.
  r = quyetToanThue(600000000, 63000000, 2, 6, 0, 0, 0);
  eq('QTTT 2 PT × 6 tháng: giảm trừ', r.depDeduct, 74400000);
  eq('QTTT 2 PT × 6 tháng: thuế', r.tax, 21660000);
  // Nộp thêm 20.000₫ (≤ 50.000₫) thì được miễn, không phải nộp hồ sơ (Điều 66 TT 89/2026).
  r = quyetToanThue(320000000, 33600000, 0, 12, 0, 0, 5000000);
  eq('QTTT miễn: nộp thêm', r.extraDue, 20000);
  is('QTTT miễn: cờ', r.exempt, true);
  // Thu nhập thấp (200tr/năm, BH 21tr): TNTT bằng 0, thuế 0.
  r = quyetToanThue(200000000, 21000000, 0, 12, 0, 0, 0);
  eq('QTTT thu nhập thấp: TNTT', r.taxable, 0);
  eq('QTTT thu nhập thấp: thuế', r.tax, 0);
}

// --- Ví dụ trong bài Hướng dẫn (khóa bài ↔ công thức, thêm 19/11/2026) ---
// Mỗi ví dụ tính sẵn trong bài Hướng dẫn gắn với 8 công cụ tiền đều có ca
// kiểm ở đây (ghi rõ tên bài). Bài sai số thì sửa BÀI, không sửa công thức
// (công thức đã kiểm đúng theo văn bản). BHTN chưa có bài Hướng dẫn riêng.
{
  // Bài "Quyết toán thuế TNCN 2026", Ví dụ 1: làm 8 tháng, lương 40tr/tháng, 0 phụ thuộc.
  let r = quyetToanThue(320000000, 33600000, 0, 12, 0, 0, 12240000);
  eq('bài quyết toán Vd1 8 tháng 40tr: TNTT', r.taxable, 100400000);
  eq('bài quyết toán Vd1 8 tháng 40tr: thuế cả năm', r.tax, 5020000);
  eq('bài quyết toán Vd1 8 tháng 40tr: hoàn', r.refund, 7220000);
  // Bài "Quyết toán thuế TNCN 2026", Ví dụ 2: lương 60tr/tháng + vãng lai 150tr, 1 phụ thuộc.
  r = quyetToanThue(870000000, 75600000, 1, 12, 0, 0, 49800000);
  eq('bài quyết toán Vd2 60tr + vãng lai: TNTT', r.taxable, 534000000);
  eq('bài quyết toán Vd2 60tr + vãng lai: thuế cả năm', r.tax, 64800000);
  eq('bài quyết toán Vd2 60tr + vãng lai: nộp thêm', r.extraDue, 15000000);
  // Bài "Cách tính lương Gross sang Net 2026", Ví dụ 1: 30tr, 0 phụ thuộc.
  r = grossNet(30000000, 30000000, 106200000, 0);
  eq('bài gross-net Vd1 30tr: bảo hiểm', r.insurance, 3150000);
  eq('bài gross-net Vd1 30tr: TNTT', r.taxable, 11350000);
  eq('bài gross-net Vd1 30tr: thuế', r.tax, 635000);
  eq('bài gross-net Vd1 30tr: net', r.net, 26215000);
  // Bài "Cách tính lương Gross sang Net 2026", Ví dụ 2: 45tr, 1 phụ thuộc.
  r = grossNet(45000000, 45000000, 106200000, 1);
  eq('bài gross-net Vd2 45tr 1 phụ thuộc: bảo hiểm', r.insurance, 4725000);
  eq('bài gross-net Vd2 45tr 1 phụ thuộc: TNTT', r.taxable, 18575000);
  eq('bài gross-net Vd2 45tr 1 phụ thuộc: thuế', r.tax, 1357500);
  eq('bài gross-net Vd2 45tr 1 phụ thuộc: net', r.net, 38917500);
  // Bài "Cách tính thuế thu nhập cá nhân 2026", Ví dụ 1: 25tr, 0 phụ thuộc.
  r = thueTncnFromSalary(25000000, 25000000, 106200000, 0);
  eq('bài thuế TNCN Vd1 25tr: bảo hiểm', r.insurance, 2625000);
  eq('bài thuế TNCN Vd1 25tr: TNTT', r.taxable, 6875000);
  eq('bài thuế TNCN Vd1 25tr: thuế/tháng', r.tax, 343750);
  // Bài "Cách tính thuế thu nhập cá nhân 2026", Ví dụ 2: 80tr, 2 phụ thuộc.
  r = thueTncnFromSalary(80000000, 80000000, 106200000, 2);
  eq('bài thuế TNCN Vd2 80tr 2 phụ thuộc: bảo hiểm (trần 50,6tr)', r.insurance, 5607000);
  eq('bài thuế TNCN Vd2 80tr 2 phụ thuộc: TNTT', r.taxable, 46493000);
  eq('bài thuế TNCN Vd2 80tr 2 phụ thuộc: thuế/tháng', r.tax, 5798600);
  // Bài "Cách tính BHXH một lần 2026": 5n trước 2014 + 8n sau 2014, BQ 8tr.
  eq('bài BHXH một lần: 5n + 8n, BQ 8tr', bhxhMotLan(8000000, 5, 0, 8, 0, 0).amount, 188000000);
  // Bài "Cách tính lương hưu BHXH 2026", Ví dụ 1: nữ 28n, BQ 12tr.
  r = luongHuu('nu', 28, 0, 12000000, 0, 0, 0);
  eq('bài lương hưu Vd1 nữ 28n 12tr: tỷ lệ', r.rate, 71);
  eq('bài lương hưu Vd1 nữ 28n 12tr: lương hưu', r.pension, 8520000);
  // Bài "Cách tính lương hưu BHXH 2026", Ví dụ 2: nam 32n, BQ 15tr.
  r = luongHuu('nam', 32, 0, 15000000, 0, 0, 0);
  eq('bài lương hưu Vd2 nam 32n 15tr: tỷ lệ', r.rate, 69);
  eq('bài lương hưu Vd2 nam 32n 15tr: lương hưu', r.pension, 10350000);
  // Bài "Cách tính lương hưu BHXH 2026", Ví dụ 3: nam 17n, BQ 10tr.
  r = luongHuu('nam', 17, 0, 10000000, 0, 0, 0);
  eq('bài lương hưu Vd3 nam 17n 10tr: tỷ lệ', r.rate, 42);
  eq('bài lương hưu Vd3 nam 17n 10tr: lương hưu', r.pension, 4200000);
  // Bài "Cách tính lương hưu BHXH 2026", Ví dụ 4: nữ 25n, nghỉ sớm 3n, BQ 10tr.
  r = luongHuu('nu', 25, 0, 10000000, 3, 0, 0);
  eq('bài lương hưu Vd4 nữ 25n nghỉ sớm 3n: tỷ lệ cuối', r.rateFinal, 59);
  eq('bài lương hưu Vd4 nữ 25n nghỉ sớm 3n: lương hưu', r.pension, 5900000);
  // Bài "Cách tính lương hưu BHXH 2026", Ví dụ 5: nữ 32n, BQ 12tr.
  r = luongHuu('nu', 32, 0, 12000000, 0, 0, 0);
  eq('bài lương hưu Vd5 nữ 32n 12tr: lương hưu (trần 75%)', r.pension, 9000000);
  eq('bài lương hưu Vd5 nữ 32n 12tr: trợ cấp một lần', r.lump, 12000000);
  // Bài "Cách tính tiền điện bậc thang 2026", Ví dụ 1: 350 kWh.
  r = tienDien(350, 8);
  eq('bài tiền điện Vd1 350 kWh: trước thuế', r.subtotal, 853100);
  eq('bài tiền điện Vd1 350 kWh: tổng', r.total, 921348);
  // Bài "Cách tính tiền điện bậc thang 2026", Ví dụ 2: 500 kWh.
  r = tienDien(500, 8);
  eq('bài tiền điện Vd2 500 kWh: trước thuế', r.subtotal, 1343400);
  eq('bài tiền điện Vd2 500 kWh: tổng', r.total, 1450872);
  // Bài "Cách tính lãi vay trả góp theo dư nợ giảm dần": 100tr, 12%/12t.
  r = laiVay(100000000, 12, 12, 'declining');
  eq('bài lãi vay dư nợ giảm dần: tháng 1', r.firstPay, 9333333);
  eq('bài lãi vay dư nợ giảm dần: tháng 2', r.schedule[1].pay, 9250000);
  eq('bài lãi vay dư nợ giảm dần: tháng cuối', r.lastPay, 8416667);
  eq('bài lãi vay dư nợ giảm dần: tổng lãi', r.totalInterest, 6500000);
  r = laiVay(100000000, 12, 12, 'annuity');
  eq('bài lãi vay trả đều: mỗi tháng', r.monthly, 8884879);
  eq('bài lãi vay trả đều: tổng lãi', r.totalInterest, 6618546);
  // Bài "Lương tháng 13 & thưởng Tết 2027", Ví dụ 1: 15tr, BH 1.575.000.
  r = luongThang13(15000000, 12, 0, 1575000);
  eq('bài tháng 13 Vd1 15tr: TNTT tháng nhận thưởng', r.taxableMonth, 12925000);
  eq('bài tháng 13 Vd1 15tr: thuế trên thưởng', r.taxOnBonus, 792500);
  eq('bài tháng 13 Vd1 15tr: thực nhận', r.net, 14207500);
  // Bài "Lương tháng 13 & thưởng Tết 2027", Ví dụ 2: 25tr, 1 phụ thuộc, BH 2.625.000.
  r = luongThang13(25000000, 12, 1, 2625000);
  eq('bài tháng 13 Vd2 25tr 1 phụ thuộc: TNTT tháng nhận thưởng', r.taxableMonth, 25675000);
  eq('bài tháng 13 Vd2 25tr 1 phụ thuộc: thuế trên thưởng', r.taxOnBonus, 2033750);
  eq('bài tháng 13 Vd2 25tr 1 phụ thuộc: thực nhận', r.net, 22966250);
}

// --- Kiểm kỹ thuật: build chèn công thức bằng cách gỡ dòng export cuối.
// Đoạn mã sau khi gỡ phải còn phân tích được (không vỡ cú pháp).
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'money-formulas.js'), 'utf8');
  const stripped = src.replace(/^export \{[^}]*\};?\s*$/m, '');
  if (stripped === src || /^\s*export\s/m.test(stripped)) {
    failed++;
    failures.push('money-formulas: không gỡ được dòng export (định dạng dòng export đã đổi?)');
  } else {
    try {
      // Chỉ phân tích, không chạy.
      new Function(stripped); // eslint-disable-line no-new-func
      passed++;
    } catch (e) {
      failed++;
      failures.push(`money-formulas sau khi gỡ export không phân tích được: ${e.message}`);
    }
  }
}

if (failures.length) {
  console.error(`\n❌ Kiểm công cụ tiền: ${passed} đạt, ${failed} TRƯỢT — build dừng tại đây:`);
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}
console.log(`✅ Kiểm công cụ tiền: ${passed} đạt, 0 trượt.`);
