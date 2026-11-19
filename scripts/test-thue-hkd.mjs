// test-thue-hkd.mjs — Bộ kiểm tra công cụ Tính thuế hộ kinh doanh +
// bán hàng online (logic thuần trong src/thue-hkd-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet,
// test-ma-tran, test-lop-hoc-3, test-chuyen-ma, test-anh-the,
// test-diem-dh, test-thai-san): kiểm nào trượt thì build thất bại
// để không đăng công cụ tính thuế sai lên web.
//
// Mọi số trong file này đều tự tính tay (ghi rõ phép tính):
// - Ngưỡng không chịu thuế năm 2026 = 1 tỷ đồng (NĐ 68/2026 sửa bởi
//   NĐ 141/2026, từ 01/01/2026); doanh thu năm từ 1 tỷ trở xuống → 0₫.
// - Thuế GTGT tính trên TOÀN BỘ doanh thu khi đã trên ngưỡng
//   (khoản 2 Điều 12 Luật 48/2024): phân phối 1%, dịch vụ 5%,
//   sản xuất/vận tải 3%, khác 2%.
// - Thuế TNCN theo doanh thu (khoản 3 Điều 7 Luật 109/2025): chỉ
//   phần VƯỢT ngưỡng chịu thuế — phân phối 0,5%, dịch vụ 2%,
//   sản xuất/vận tải 1,5%, khác 1%; chỉ được chọn khi doanh thu
//   trên 1 tỷ và từ 3 tỷ trở xuống.
// - Thuế TNCN theo thu nhập: (doanh thu − chi phí) × 15% (đến 3 tỷ)
//   / 17% (trên 3 đến 50 tỷ) / 20% (trên 50 tỷ); trên 3 tỷ bắt buộc
//   cách này; chi phí bằng hoặc hơn doanh thu thì TNCN bằng 0.
// - Giảm 30% thuế TNCN (NQ 43/2026 + NĐ 398/2026): doanh thu năm
//   từ 10 tỷ đồng trở xuống, kỳ tính thuế 2026–2027; không giảm GTGT.
// - Sàn khấu trừ thay (NĐ 117/2025): trên toàn bộ doanh thu — hàng
//   hóa GTGT 1% + TNCN 0,5%, dịch vụ 5% + 2%, vận tải 3% + 1,5%;
//   số đã khấu trừ là tiền nộp trước, quyết toán nộp thêm hoặc hoàn.
// - Điểm neo đối chiếu nguồn ngoài (hoidaptructuyen.vn): hộ bán lẻ
//   1,4 tỷ/năm, theo doanh thu: GTGT 1% × 1,4 tỷ = 14.000.000₫,
//   TNCN 0,5% × 400 triệu = 2.000.000₫; sau giảm 30% TNCN còn
//   1.400.000₫, tổng 15.400.000₫.
import {
  THRESHOLD, REVENUE_METHOD_MAX, REDUCTION_MAX_REVENUE,
  REDUCTION_RATE, GROUPS, groupOf, incomeRate,
  revenueMethodAllowed, annualize, computeTax, parseMoney,
} from '../src/thue-hkd-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}

// --- Hằng số (NĐ 68/2026 sửa bởi NĐ 141/2026; Điều 7 Luật 109/2025;
// NQ 43/2026 + NĐ 398/2026) ---
check('Ngưỡng không chịu thuế 2026 = 1 tỷ đồng', THRESHOLD, 1000000000);
check('Cách tính TNCN theo doanh thu tối đa 3 tỷ đồng', REVENUE_METHOD_MAX, 3000000000);
check('Giảm 30% TNCN: doanh thu tối đa 10 tỷ đồng', REDUCTION_MAX_REVENUE, 10000000000);
check('Mức giảm thuế TNCN = 30%', REDUCTION_RATE, 0.3);
check('Nhóm phân phối: GTGT 1%, TNCN 0,5%', [GROUPS['phan-phoi'].vat, GROUPS['phan-phoi'].pit], [0.01, 0.005]);
check('Nhóm dịch vụ: GTGT 5%, TNCN 2%', [GROUPS['dich-vu'].vat, GROUPS['dich-vu'].pit], [0.05, 0.02]);
check('Nhóm sản xuất/vận tải: GTGT 3%, TNCN 1,5%', [GROUPS['san-xuat'].vat, GROUPS['san-xuat'].pit], [0.03, 0.015]);
check('Nhóm khác: GTGT 2%, TNCN 1%', [GROUPS['khac'].vat, GROUPS['khac'].pit], [0.02, 0.01]);
check('Nhóm lạ → mặc định phân phối', groupOf('khong-co').label, 'Phân phối, cung cấp hàng hóa');

// --- Thuế suất TNCN theo thu nhập theo doanh thu năm ---
check('Thu nhập: đến 3 tỷ × 15%', incomeRate(3000000000), 0.15);
check('Thu nhập: trên 3 tỷ × 17%', incomeRate(3000000001), 0.17);
check('Thu nhập: đến 50 tỷ × 17%', incomeRate(50000000000), 0.17);
check('Thu nhập: trên 50 tỷ × 20%', incomeRate(50000000001), 0.2);

// --- Cách tính TNCN theo doanh thu: chỉ trên 1 tỷ đến 3 tỷ ---
check('Đúng ngưỡng 1 tỷ: không được chọn theo doanh thu', revenueMethodAllowed(1000000000), false);
check('Trên 1 tỷ: được chọn theo doanh thu', revenueMethodAllowed(1000000001), true);
check('Đúng 3 tỷ: được chọn theo doanh thu', revenueMethodAllowed(3000000000), true);
check('Trên 3 tỷ: không được chọn theo doanh thu', revenueMethodAllowed(3000000001), false);

// --- Quy tháng về năm ---
check('120 triệu/tháng = 1,44 tỷ/năm', annualize(120000000, 'thang'), 1440000000);
check('Doanh thu năm giữ nguyên', annualize(1400000000, 'nam'), 1400000000);

// --- Dưới ngưỡng → 0₫ (tự bán) ---
check('800 triệu phân phối tự bán → 0₫', (() => {
  const r = computeTax({ revenueAnnual: 800000000, group: 'phan-phoi', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.taxable, r.vat, r.pit, r.total, r.netTotal];
})(), [false, 0, 0, 0, 0]);

// --- Đúng ngưỡng → 0₫ (ngưỡng bao gồm cả 1 tỷ) ---
check('Đúng 1 tỷ dịch vụ tự bán → 0₫', (() => {
  const r = computeTax({ revenueAnnual: 1000000000, group: 'dich-vu', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.taxable, r.vat, r.pit, r.total];
})(), [false, 0, 0, 0]);

// --- Điểm neo nguồn ngoài: 1,4 tỷ phân phối, theo doanh thu ---
// GTGT 1% × 1,4 tỷ = 14.000.000; TNCN 0,5% × 400 triệu = 2.000.000
// → giảm 30% còn 1.400.000; tổng 15.400.000.
check('1,4 tỷ phân phối: GTGT 14 triệu, TNCN sau giảm 1,4 triệu, tổng 15,4 triệu', (() => {
  const r = computeTax({ revenueAnnual: 1400000000, group: 'phan-phoi', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.taxable, r.vat, r.pitBeforeReduction, r.reduction, r.pit, r.total, r.reductionApplied];
})(), [true, 14000000, 2000000, 600000, 1400000, 15400000, true]);

// --- Từng nhóm ngành, theo doanh thu ---
// 2 tỷ dịch vụ: GTGT 5% × 2 tỷ = 100 triệu; TNCN 2% × 1 tỷ = 20 triệu
// → giảm 30% còn 14 triệu; tổng 114 triệu.
check('2 tỷ dịch vụ: GTGT 100 triệu, TNCN sau giảm 14 triệu, tổng 114 triệu', (() => {
  const r = computeTax({ revenueAnnual: 2000000000, group: 'dich-vu', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.vat, r.pitBeforeReduction, r.pit, r.total];
})(), [100000000, 20000000, 14000000, 114000000]);
// 1,2 tỷ sản xuất: GTGT 3% × 1,2 tỷ = 36 triệu; TNCN 1,5% × 200 triệu
// = 3 triệu → giảm 30% còn 2,1 triệu; tổng 38,1 triệu.
check('1,2 tỷ sản xuất: GTGT 36 triệu, TNCN sau giảm 2,1 triệu, tổng 38,1 triệu', (() => {
  const r = computeTax({ revenueAnnual: 1200000000, group: 'san-xuat', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.vat, r.pitBeforeReduction, r.pit, r.total];
})(), [36000000, 3000000, 2100000, 38100000]);
// 1,5 tỷ khác: GTGT 2% × 1,5 tỷ = 30 triệu; TNCN 1% × 500 triệu
// = 5 triệu → giảm 30% còn 3,5 triệu; tổng 33,5 triệu.
check('1,5 tỷ khác: GTGT 30 triệu, TNCN sau giảm 3,5 triệu, tổng 33,5 triệu', (() => {
  const r = computeTax({ revenueAnnual: 1500000000, group: 'khac', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.vat, r.pitBeforeReduction, r.pit, r.total];
})(), [30000000, 5000000, 3500000, 33500000]);

// --- Theo thu nhập: 1,4 tỷ, chi phí 1 tỷ ---
// Thu nhập 400 triệu × 15% = 60 triệu → giảm 30% còn 42 triệu;
// GTGT 14 triệu; tổng 56 triệu.
check('1,4 tỷ, chi phí 1 tỷ, theo thu nhập: TNCN sau giảm 42 triệu, tổng 56 triệu', (() => {
  const r = computeTax({ revenueAnnual: 1400000000, group: 'phan-phoi', method: 'thu-nhap', costAnnual: 1000000000, channel: 'tu-ban' });
  return [r.method, r.profit, r.pitRate, r.pitBeforeReduction, r.pit, r.vat, r.total];
})(), ['thu-nhap', 400000000, 0.15, 60000000, 42000000, 14000000, 56000000]);

// --- Trên 3 tỷ: bắt buộc theo thu nhập (17%) ---
// 4 tỷ, chi phí 3 tỷ: thu nhập 1 tỷ × 17% = 170 triệu → giảm 30%
// còn 119 triệu; GTGT 1% × 4 tỷ = 40 triệu; tổng 159 triệu.
check('4 tỷ chọn theo doanh thu → bị ép theo thu nhập, tổng 159 triệu', (() => {
  const r = computeTax({ revenueAnnual: 4000000000, group: 'phan-phoi', method: 'doanh-thu', costAnnual: 3000000000, channel: 'tu-ban' });
  return [r.method, r.methodForced, r.pitRate, r.pitBeforeReduction, r.pit, r.vat, r.total];
})(), ['thu-nhap', true, 0.17, 170000000, 119000000, 40000000, 159000000]);

// --- Trên 50 tỷ: 20%, KHÔNG còn giảm 30% (vượt 10 tỷ) ---
// 60 tỷ, chi phí 50 tỷ: thu nhập 10 tỷ × 20% = 2 tỷ (không giảm);
// GTGT 1% × 60 tỷ = 600 triệu; tổng 2,6 tỷ.
check('60 tỷ, chi phí 50 tỷ: TNCN 2 tỷ không giảm, GTGT 600 triệu, tổng 2,6 tỷ', (() => {
  const r = computeTax({ revenueAnnual: 60000000000, group: 'phan-phoi', method: 'thu-nhap', costAnnual: 50000000000, channel: 'tu-ban' });
  return [r.pitRate, r.pitBeforeReduction, r.reductionApplied, r.reduction, r.pit, r.vat, r.total];
})(), [0.2, 2000000000, false, 0, 2000000000, 600000000, 2600000000]);

// --- Chi phí hơn doanh thu → TNCN 0, GTGT vẫn phải nộp ---
// 1,4 tỷ, chi phí 1,6 tỷ: thu nhập âm → TNCN 0; GTGT 14 triệu.
check('1,4 tỷ, chi phí 1,6 tỷ: TNCN 0, GTGT 14 triệu', (() => {
  const r = computeTax({ revenueAnnual: 1400000000, group: 'phan-phoi', method: 'thu-nhap', costAnnual: 1600000000, channel: 'tu-ban' });
  return [r.profit, r.pit, r.vat, r.total];
})(), [-200000000, 0, 14000000, 14000000]);

// --- Biên giảm 30%: đúng 10 tỷ được giảm, hơn 10 tỷ thì không ---
// 10 tỷ, chi phí 8 tỷ: thu nhập 2 tỷ × 17% = 340 triệu → giảm
// 102 triệu còn 238 triệu; GTGT 100 triệu; tổng 338 triệu.
check('Đúng 10 tỷ: vẫn giảm 30% TNCN', (() => {
  const r = computeTax({ revenueAnnual: 10000000000, group: 'phan-phoi', method: 'thu-nhap', costAnnual: 8000000000, channel: 'tu-ban' });
  return [r.reductionApplied, r.reduction, r.pit, r.total];
})(), [true, 102000000, 238000000, 338000000]);
// 10 tỷ + 1 đồng, chi phí 8 tỷ: thu nhập 2.000.000.001 × 17% =
// 340.000.000,17 → 340.000.000, không giảm; GTGT 100.000.000.
check('10 tỷ + 1 đồng: hết giảm 30% TNCN', (() => {
  const r = computeTax({ revenueAnnual: 10000000001, group: 'phan-phoi', method: 'thu-nhap', costAnnual: 8000000000, channel: 'tu-ban' });
  return [r.reductionApplied, r.reduction, r.pit, r.vat, r.total];
})(), [false, 0, 340000000, 100000000, 440000000]);

// --- Bán qua sàn: 1,4 tỷ phân phối ---
// Sàn trừ GTGT 1% × 1,4 tỷ = 14 triệu, TNCN 0,5% × 1,4 tỷ = 7 triệu;
// phải nộp GTGT 14 triệu, TNCN sau giảm 1,4 triệu;
// còn phải nộp GTGT 0, TNCN −5,6 triệu (được hoàn 5,6 triệu).
check('Sàn 1,4 tỷ phân phối: trừ 21 triệu, được hoàn 5,6 triệu', (() => {
  const r = computeTax({ revenueAnnual: 1400000000, group: 'phan-phoi', method: 'doanh-thu', channel: 'san' });
  return [r.withheldVat, r.withheldPit, r.withheldTotal, r.netVat, r.netPit, r.netTotal];
})(), [14000000, 7000000, 21000000, 0, -5600000, -5600000]);

// --- Bán qua sàn dưới ngưỡng: được hoàn toàn bộ ---
// 800 triệu phân phối: sàn trừ 1,5% × 800 triệu = 12 triệu; phải nộp 0.
check('Sàn 800 triệu: trừ 12 triệu, được hoàn 12 triệu', (() => {
  const r = computeTax({ revenueAnnual: 800000000, group: 'phan-phoi', method: 'doanh-thu', channel: 'san' });
  return [r.withheldTotal, r.total, r.netTotal];
})(), [12000000, 0, -12000000]);

// --- Bán qua sàn dịch vụ 2 tỷ ---
// Sàn trừ GTGT 5% × 2 tỷ = 100 triệu, TNCN 2% × 2 tỷ = 40 triệu;
// phải nộp GTGT 100 triệu, TNCN sau giảm 14 triệu; được hoàn 26 triệu.
check('Sàn 2 tỷ dịch vụ: trừ 140 triệu, được hoàn 26 triệu', (() => {
  const r = computeTax({ revenueAnnual: 2000000000, group: 'dich-vu', method: 'doanh-thu', channel: 'san' });
  return [r.withheldVat, r.withheldPit, r.netVat, r.netPit, r.netTotal];
})(), [100000000, 40000000, 0, -26000000, -26000000]);

// --- Doanh thu theo tháng: 120 triệu/tháng = 1,44 tỷ/năm ---
// GTGT 1% × 1,44 tỷ = 14,4 triệu; TNCN 0,5% × 440 triệu = 2,2 triệu
// → giảm 30% còn 1,54 triệu; tổng 15,94 triệu.
check('120 triệu/tháng phân phối: tổng 15,94 triệu', (() => {
  const r = computeTax({ revenueAnnual: annualize(120000000, 'thang'), group: 'phan-phoi', method: 'doanh-thu', channel: 'tu-ban' });
  return [r.revenue, r.vat, r.pit, r.total];
})(), [1440000000, 14400000, 1540000, 15940000]);

// --- parseMoney ---
check("parseMoney('1.400.000.000') = 1400000000", parseMoney('1.400.000.000'), 1400000000);
check("parseMoney(' 8.500.000 ') = 8500000 (khoảng trắng đầu/cuối)", parseMoney(' 8.500.000 '), 8500000);
check("parseMoney('0') = 0", parseMoney('0'), 0);
check("parseMoney('') = null (ô trống)", parseMoney(''), null);
check("parseMoney('abc') = null (không phải số)", parseMoney('abc'), null);
check("parseMoney('-5') = null (âm)", parseMoney('-5'), null);

if (failed) {
  console.error(`test-thue-hkd: ${passed} đạt, ${failed} trượt.\n` + failures.join('\n'));
  process.exit(1);
} else {
  console.log(`test-thue-hkd: ${passed} đạt, 0 trượt.`);
}
