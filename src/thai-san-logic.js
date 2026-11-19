// thai-san-logic.js — Logic thuần (KHÔNG DOM) cho công cụ Tính tiền
// thai sản BHXH.
//
// Căn cứ đã tra (ghi nguồn trong báo cáo + trang công cụ):
// - Luật Bảo hiểm xã hội 41/2024/QH15, hiệu lực 01/7/2025:
//   + Điều 50 khoản 2: lao động nữ sinh con phải đóng BHXH bắt buộc
//     từ đủ 6 tháng trở lên trong 12 tháng liền kề trước khi sinh.
//   + Điều 50 khoản 3: mang thai từ đủ 22 tuần tuổi, buộc phải nghỉ
//     việc để dưỡng thai theo chỉ định của cơ sở khám chữa bệnh thì
//     phải đã đóng BHXH từ đủ 12 tháng trở lên VÀ đóng đủ 3 tháng
//     trở lên trong 12 tháng liền kề trước khi sinh.
//   + Điều 53 khoản 2 (sửa bởi khoản 2 Điều 29 Luật Dân số 2025):
//     chồng nghỉ khi vợ sinh con — 5 ngày (sinh thường 1 con);
//     7 ngày (phẫu thuật hoặc sinh dưới 32 tuần); 10 ngày (vợ
//     sinh đôi HOẶC vợ sinh con thứ hai); 14 ngày (sinh đôi phẫu
//     thuật); sinh ba trở lên thêm 3 ngày cho mỗi con từ con thứ 3.
//     Vợ sinh con thứ hai mà sinh đôi vẫn chỉ 10 ngày; sinh đôi
//     phải phẫu thuật thì 14 ngày (thuvienphapluat.vn, 09/11/2026).
//     Tính theo ngày làm việc; ngày bắt đầu nghỉ trong 60 ngày kể
//     từ ngày vợ sinh (khoản 3 Điều 53).
//   + Điều 58: trợ cấp một lần khi sinh = 2 lần mức tham chiếu tại
//     tháng sinh, tính cho MỖI con (khoản 1, khoản 4).
//   + Điều 59: trợ cấp hằng tháng = 100% mức bình quân tiền lương
//     làm căn cứ đóng BHXH bắt buộc của 6 tháng gần nhất trước khi
//     nghỉ (khoản 1); mức theo ngày = mức một tháng chia 24 (khoản 2,
//     áp dụng cho chồng nghỉ khi vợ sinh con).
//   + Khoản 13 Điều 141: khi chưa bãi bỏ mức lương cơ sở thì mức
//     tham chiếu bằng mức lương cơ sở.
// - Bộ luật Lao động 2019 Điều 139 khoản 1 (sửa bởi khoản 1 Điều 29
//   Luật Dân số 2025, hiệu lực 01/7/2026): lao động nữ nghỉ thai sản
//   6 tháng (trước sinh tối đa 2 tháng); trường hợp sinh con thứ hai
//   thì nghỉ 7 tháng; sinh đôi trở lên thì từ con thứ 2 trở đi, mỗi
//   con mẹ được nghỉ thêm 1 tháng — sinh con thứ hai mà sinh đôi là
//   8 tháng (thuvienphapluat.vn, 09/11/2026). Điều kiện hưởng 7 tháng
//   (NĐ 168/2026): lúc sinh, người mẹ đang có 1 con đẻ còn sống.
// - Nghị định 161/2026/NĐ-CP: mức lương cơ sở 2.530.000₫/tháng từ
//   01/7/2026 (Điều 3) — nên trợ cấp một lần là 5.060.000₫ mỗi con.
//   Trần tiền lương làm căn cứ đóng BHXH = 20 × lương cơ sở =
//   50.600.000₫ (cùng số với CAP_BHXH trong money-formulas.js).
// - Luật Dân số 113/2025/QH15 + Nghị định 168/2026/NĐ-CP: từ
//   01/7/2026, mẹ sinh con thứ hai nghỉ 7 tháng; chồng được nghỉ
//   tối thiểu 10 ngày làm việc khi vợ sinh con thứ hai (vợ có 1 con
//   đẻ còn sống tại thời điểm sinh) — mức 10 ngày là sàn, không thay
//   mức 14 ngày khi vợ sinh đôi phải phẫu thuật.
//
// File này được dùng ở 2 nơi, cùng 1 nguồn sự thật duy nhất:
//   1. Node: scripts/test-thai-san.mjs import trực tiếp (ESM).
//   2. Trình duyệt: build.mjs chèn nguyên văn (trừ dòng export cuối)
//      vào trang công cụ; init() gọi qua window.UH_THAISAN.
// Dòng export cuối PHẢI giữ nguyên dạng 1 dòng `export { ... };`
// để build.mjs gỡ được bằng regex (xem THAISAN_LOGIC_EXPORT_RE).

// Mức tham chiếu = mức lương cơ sở (NĐ 161/2026, từ 01/7/2026).
const LUONG_CO_SO = 2530000;
// Trần tiền lương làm căn cứ đóng BHXH (20 × lương cơ sở).
// Tên nội bộ TS_CAP_BHXH (không dùng CAP_BHXH) vì money-formulas.js
// đã khai báo CAP_BHXH ở scope toàn cục cùng trang — khai báo lại
// sẽ lỗi cú pháp và cả script logic không chạy (lỗi tìm ra 20/11
// khi kiểm Playwright lần đầu); export ra ngoài vẫn giữ tên CAP_BHXH.
const TS_CAP_BHXH = 50600000;
// Điều kiện hưởng thai sản của mẹ: đủ 6 tháng trong 12 tháng.
const REQUIRED_MONTHS = 6;
// Trường hợp dưỡng thai: đủ 3 tháng trong 12 tháng + đã đóng
// tổng cộng từ đủ 12 tháng trở lên.
const REST_MONTHS = 3;
const REST_TOTAL_MONTHS = 12;
// Thời gian nghỉ thai sản cơ bản: 6 tháng; sinh con thứ hai 7 tháng
// (khoản 1 Điều 139 BLLĐ sửa bởi Luật Dân số 2025, từ 01/7/2026).
const LEAVE_MONTHS = 6;
const LEAVE_MONTHS_SECOND = 7;

// Số tháng nghỉ thai sản của mẹ theo số con sinh và con thứ mấy:
// nền 6 tháng (con thứ hai: 7 tháng) + 1 tháng cho mỗi con từ con
// thứ 2 (sinh đôi 7 tháng, sinh ba 8 tháng; sinh con thứ hai mà
// sinh đôi 8 tháng, sinh ba 9 tháng).
function leaveMonths(children, secondChild) {
  const n = Math.max(1, Math.floor(children) || 1);
  const base = secondChild ? LEAVE_MONTHS_SECOND : LEAVE_MONTHS;
  return base + (n - 1);
}

// Kiểm tra điều kiện hưởng thai sản của mẹ.
// months12: số tháng đã đóng BHXH trong 12 tháng trước khi sinh.
// restCase: có nghỉ dưỡng thai theo chỉ định của bác sĩ không.
// total12plus: đã đóng BHXH tổng cộng từ đủ 12 tháng trở lên không.
// Trả { eligible, required, missing, reason, needTotal12 }:
// - reason 'ok': đủ điều kiện.
// - reason 'thieu-thang': chưa đủ số tháng trong 12 tháng;
//   missing = số tháng còn thiếu.
// - reason 'thieu-tong-12-thang': trường hợp dưỡng thai nhưng chưa
//   đóng tổng cộng đủ 12 tháng (điều kiện riêng của khoản 3 Điều 50).
function checkEligibility(months12, restCase, total12plus) {
  const m = Math.max(0, Math.floor(months12) || 0);
  if (restCase) {
    if (!total12plus) {
      return { eligible: false, required: REST_MONTHS, missing: Math.max(0, REST_MONTHS - m), reason: 'thieu-tong-12-thang', needTotal12: true };
    }
    if (m >= REST_MONTHS) {
      return { eligible: true, required: REST_MONTHS, missing: 0, reason: 'ok', needTotal12: false };
    }
    return { eligible: false, required: REST_MONTHS, missing: REST_MONTHS - m, reason: 'thieu-thang', needTotal12: false };
  }
  if (m >= REQUIRED_MONTHS) {
    return { eligible: true, required: REQUIRED_MONTHS, missing: 0, reason: 'ok', needTotal12: false };
  }
  return { eligible: false, required: REQUIRED_MONTHS, missing: REQUIRED_MONTHS - m, reason: 'thieu-thang', needTotal12: false };
}

// Áp trần đóng BHXH cho mức bình quân tiền lương.
function capSalary(avgSalary) {
  const v = Math.max(0, avgSalary || 0);
  return { avg: Math.min(v, TS_CAP_BHXH), capped: v > TS_CAP_BHXH };
}

// Tính tiền thai sản cho mẹ sinh con.
// input: { avgSalary, children, months12, restCase, total12plus,
//   secondChild } — secondChild: đây có phải lần sinh con thứ hai
//   không (lúc sinh mẹ đang có 1 con đẻ còn sống).
// Trả { eligible, required, missing, reason, needTotal12, months12,
//   children, secondChild, baseMonths, avg, capped, months, monthly,
//   allowance, oneTime, total }.
// Chưa đủ điều kiện thì các khoản tiền = 0 (chưa hưởng được gì).
function computeMother(input) {
  const inp = input || {};
  const children = Math.max(1, Math.floor(inp.children) || 1);
  const secondChild = !!inp.secondChild;
  const baseMonths = secondChild ? LEAVE_MONTHS_SECOND : LEAVE_MONTHS;
  const e = checkEligibility(inp.months12, !!inp.restCase, !!inp.total12plus);
  const c = capSalary(inp.avgSalary);
  const months = leaveMonths(children, secondChild);
  const out = {
    eligible: e.eligible,
    required: e.required,
    missing: e.missing,
    reason: e.reason,
    needTotal12: e.needTotal12,
    months12: Math.max(0, Math.floor(inp.months12) || 0),
    children,
    secondChild,
    baseMonths,
    avg: c.avg,
    capped: c.capped,
    months,
    monthly: 0,
    allowance: 0,
    oneTime: 0,
    total: 0,
  };
  if (!e.eligible) return out;
  out.monthly = c.avg;
  out.allowance = c.avg * months;
  out.oneTime = 2 * LUONG_CO_SO * children;
  out.total = out.allowance + out.oneTime;
  return out;
}

// Số ngày nghỉ của chồng khi vợ sinh con (ngày làm việc).
// type: 'thuong' (sinh thường), 'mo' (phẫu thuật hoặc sinh dưới
// 32 tuần tuổi). secondChild: vợ sinh con thứ hai (vợ có 1 con đẻ
// còn sống) — mức 10 ngày là SÀN, lấy max với bảng theo số con và
// cách sinh (điểm c, d khoản 2 Điều 53 sửa bởi Luật Dân số 2025):
// - Sinh thường: 1 con 5 ngày; sinh đôi 10 ngày; sinh ba trở lên
//   thêm 3 ngày cho mỗi con từ con thứ 3.
// - Phẫu thuật: 1 con 7 ngày; sinh đôi 14 ngày; sinh ba trở lên
//   thêm 3 ngày cho mỗi con từ con thứ 3.
// - Vợ sinh con thứ hai: tối thiểu 10 ngày — con thứ hai + sinh
//   đôi vẫn 10 ngày; con thứ hai + sinh đôi phẫu thuật 14 ngày;
//   con thứ hai + sinh ba thường 13 ngày, sinh ba mổ 17 ngày.
function husbandDays(children, type, secondChild) {
  const n = Math.max(1, Math.floor(children) || 1);
  const base = type === 'mo'
    ? (n === 1 ? 7 : 14 + 3 * (n - 2))
    : (n === 1 ? 5 : 10 + 3 * (n - 2));
  return secondChild ? Math.max(base, 10) : base;
}

// Tính tiền trợ cấp cho chồng nghỉ khi vợ sinh con.
// Mức một ngày = bình quân lương đóng BHXH 6 tháng gần nhất ÷ 24
// (khoản 2 Điều 59). Nghỉ hưởng chế độ của chồng KHÔNG đặt điều
// kiện phải đóng đủ 6 tháng (chỉ trợ cấp một lần khi vợ không đủ
// điều kiện mới cần chồng đóng đủ 6 tháng trong 12 tháng).
// Trả { days, daily, total, avg, capped, children, type,
//   secondChild, floorApplied } — floorApplied cho biết mức 10 ngày
//   sàn vì vợ sinh con thứ hai có phải là lý do quyết định số ngày
//   hay không (để giao diện giải thích đúng trong bảng bước).
// daily/total làm tròn tới đồng (daily giữ số thực để bước tính
// hiện công thức đúng; total làm tròn).
function computeHusband(input) {
  const inp = input || {};
  const children = Math.max(1, Math.floor(inp.children) || 1);
  const type = inp.type === 'mo' ? 'mo' : 'thuong';
  const secondChild = !!inp.secondChild;
  const c = capSalary(inp.avgSalary);
  const days = husbandDays(children, type, secondChild);
  const daily = c.avg / 24;
  return {
    days,
    daily,
    total: Math.round(daily * days),
    avg: c.avg,
    capped: c.capped,
    children,
    type,
    secondChild,
    floorApplied: secondChild && husbandDays(children, type, false) < 10,
  };
}

// Đọc số tiền từ ô nhập: chấp nhận dấu chấm ngăn nghìn, khoảng
// trắng, dấu phẩy thập phân. Trả số >= 0, hoặc null khi ô trống,
// không phải số, hoặc âm (để giao diện báo lỗi thay vì đoán).
function parseMoney(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/[\s.]/g, '').replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

if (typeof window !== 'undefined') window.UH_THAISAN = { LUONG_CO_SO, CAP_BHXH: TS_CAP_BHXH, REQUIRED_MONTHS, REST_MONTHS, REST_TOTAL_MONTHS, LEAVE_MONTHS, LEAVE_MONTHS_SECOND, leaveMonths, checkEligibility, capSalary, computeMother, husbandDays, computeHusband, parseMoney };
export { LUONG_CO_SO, TS_CAP_BHXH as CAP_BHXH, REQUIRED_MONTHS, REST_MONTHS, REST_TOTAL_MONTHS, LEAVE_MONTHS, LEAVE_MONTHS_SECOND, leaveMonths, checkEligibility, capSalary, computeMother, husbandDays, computeHusband, parseMoney };
