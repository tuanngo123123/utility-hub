// money-formulas.js — Công thức thuần (KHÔNG DOM) cho 8 công cụ tiền/lương/thuế.
//
// File này được dùng ở 2 nơi, cùng 1 nguồn sự thật duy nhất:
//   1. Node: scripts/test-money-tools.mjs import trực tiếp (ESM) để kiểm
//      5–10 ví dụ tính tay cho mỗi công cụ; kiểm trượt thì build thất bại.
//   2. Trình duyệt: build.mjs chèn nguyên văn file này (trừ dòng export
//      cuối) vào trang MẪU 2 trước khi init() chạy; init() gọi công thức
//      qua window.M2_CALC. Cách này lách được hạn chế build chỉ nhúng
//      init() bằng toString() — hằng/hàm ngoài init() sẽ bị rớt nếu để
//      trong file công cụ.
//
// Quy tắc khi sửa file này:
//   - CHỈ hàm thuần + hằng số; không dùng window/document ở tầng trên
//     cùng (trừ khối gán window.M2_CALC được bảo vệ bằng typeof).
//   - Dòng export cuối PHẢI giữ nguyên dạng 1 dòng `export { ... };` để
//     build.mjs gỡ được bằng regex (xem M2_FORMULAS_EXPORT_RE).
//   - Mọi con số trong test đều tính tay độc lập (bằng Python) trước khi
//     ghi vào scripts/test-money-tools.mjs — không lấy số từ hàm này ra
//     làm kỳ vọng.

// --- Hằng số dùng chung (luật 2026) ---
const CAP_BHXH = 50600000; // Trần đóng BHXH/BHYT (NĐ 161/2026, từ 01/7/2026)
const DEDUCT_SELF = 15500000; // Giảm trừ bản thân (NQ 110/2025)
const DEDUCT_DEP = 6200000; // Giảm trừ mỗi người phụ thuộc (NQ 110/2025)
const TAX_BRACKETS = [
  { upTo: 10000000, rate: 0.05 },
  { upTo: 30000000, rate: 0.10 },
  { upTo: 60000000, rate: 0.20 },
  { upTo: 100000000, rate: 0.30 },
  { upTo: Infinity, rate: 0.35 },
]; // Biểu lũy tiến 5 bậc (Điều 9 Luật Thuế TNCN 109/2025/QH15)
const BHTN_CAPS = {
  // Trần đóng BHTN theo vùng = 20 × lương tối thiểu vùng 2026 (NĐ 293/2025).
  I: 106200000, II: 94600000, III: 82800000, IV: 74000000,
};
const MIN_WAGE_2026 = { I: 5310000, II: 4730000, III: 4140000, IV: 3700000 };
const ELECTRICITY_TIERS = [
  { label: 'Bậc 1 (0–100 kWh)', limit: 100, price: 1901 },
  { label: 'Bậc 2 (101–200 kWh)', limit: 100, price: 2289 },
  { label: 'Bậc 3 (201–400 kWh)', limit: 200, price: 2894 },
  { label: 'Bậc 4 (401–700 kWh)', limit: 300, price: 3456 },
  { label: 'Bậc 5 (trên 700 kWh)', limit: Infinity, price: 3844 },
]; // Biểu giá chưa VAT (QĐ 2892/QĐ-BCT, từ 01/11/2026)
const ELECTRICITY_VAT_DEFAULT = 8;

// Định dạng số gọn trong nhãn (vd '10–30 triệu') — không phụ thuộc UH.
function fmtShort(n) {
  return Number(n).toLocaleString('vi-VN');
}
function fmtYearsShort(y) {
  return (Number.isInteger(y) ? String(y) : y.toLocaleString('vi-VN')) + ' năm';
}

// Thuế TNCN theo biểu lũy tiến 5 bậc. Trả { tax, rows } — rows giữ đủ
// dữ kiện để vẽ bảng từng bậc (label/rate/base/tax).
function taxByBrackets(taxable) {
  let tax = 0;
  let prev = 0;
  const rows = [];
  for (const b of TAX_BRACKETS) {
    if (taxable <= prev) break;
    const part = Math.min(taxable, b.upTo) - prev;
    const t = part * b.rate;
    tax += t;
    rows.push({
      label: prev === 0
        ? 'Đến 10 triệu'
        : 'Trên ' + fmtShort(prev / 1000000) + '–' + (b.upTo === Infinity ? '…' : fmtShort(b.upTo / 1000000) + ' triệu'),
      rate: b.rate * 100,
      base: part,
      tax: t,
    });
    prev = b.upTo;
  }
  return { tax, rows };
}

// Lương Gross → Net. insSalary: lương đóng bảo hiểm (mặc định = gross,
// công cụ tự điền trước khi gọi). bhtnCap: trần BHTN theo vùng.
function grossNet(gross, insSalary, bhtnCap, deps) {
  const bhxhBase = Math.min(insSalary, CAP_BHXH);
  const bhtnBase = Math.min(insSalary, bhtnCap);
  const bhxh = bhxhBase * 0.08;
  const bhyt = bhxhBase * 0.015;
  const bhtn = bhtnBase * 0.01;
  const insurance = bhxh + bhyt + bhtn;
  const taxable = Math.max(0, gross - insurance - DEDUCT_SELF - deps * DEDUCT_DEP);
  const { tax, rows } = taxByBrackets(taxable);
  const net = gross - insurance - tax;
  return { gross, bhxh, bhyt, bhtn, insurance, taxable, tax, taxRows: rows, net, bhxhBase, bhtnBase, insSalary, deps };
}

// Lương Net → Gross: lặp nhị phân trên Gross (sai số dưới 500đ).
// insSalary: lương đóng bảo hiểm cố định, hoặc null = bằng Gross đang dò.
function netToGross(targetNet, insSalary, bhtnCap, deps) {
  let lo = targetNet;
  let hi = targetNet * 2 + 100000000;
  let best = grossNet(hi, insSalary == null ? hi : insSalary, bhtnCap, deps);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const r = grossNet(mid, insSalary == null ? mid : insSalary, bhtnCap, deps);
    best = r;
    if (Math.abs(r.net - targetNet) < 500) break;
    if (r.net < targetNet) lo = mid; else hi = mid;
  }
  return best;
}

// Thuế TNCN từ lương tháng (cùng mô hình với grossNet).
function thueTncnFromSalary(gross, insSalary, bhtnCap, deps) {
  const r = grossNet(gross, insSalary, bhtnCap, deps);
  return {
    fromSalary: true,
    gross, insSalary, bhxh: r.bhxh, bhyt: r.bhyt, bhtn: r.bhtn,
    insurance: r.insurance, deps, taxable: r.taxable, tax: r.tax, taxRows: r.taxRows,
  };
}

// Thuế TNCN từ thu nhập tính thuế đã biết.
function thueTncnFromTaxable(taxable) {
  const { tax, rows } = taxByBrackets(taxable);
  return { fromSalary: false, taxable, tax, taxRows: rows };
}

// BHXH một lần (khoản 3 Điều 70 Luật BHXH 41/2024/QH15).
// paidInput: tổng tiền đã đóng (chỉ dùng khi đóng chưa đủ 1 năm), 0 = ước tính.
function bhxhMotLan(avg, y1, m1, y2, m2, paidInput) {
  const months1 = y1 * 12 + m1;
  const months2 = y2 * 12 + m2;
  const totalMonths = months1 + months2;
  if (totalMonths < 12) {
    // Chưa đủ 1 năm: bằng số tiền đã đóng, tối đa 2 tháng mức bình quân.
    const paid = paidInput > 0 ? paidInput : 0.22 * avg * totalMonths;
    const cap = 2 * avg;
    return {
      totalMonths, underOneYear: true, paid, cap, amount: Math.min(paid, cap),
      t1: 0, odd1: 0, t2: 0, full2: 0, rem2: 0, frac2: 0, part1: 0, part2: 0,
    };
  }
  // Tháng lẻ trước 2014 chuyển sang giai đoạn từ 2014 (điểm a khoản 3 Điều 70).
  const t1 = Math.floor(months1 / 12);
  const odd1 = months1 % 12;
  const m2adj = months2 + odd1;
  const full2 = Math.floor(m2adj / 12);
  const rem2 = m2adj % 12;
  const frac2 = rem2 === 0 ? 0 : rem2 <= 6 ? 0.5 : 1;
  const t2 = full2 + frac2;
  const part1 = 1.5 * avg * t1;
  const part2 = 2 * avg * t2;
  return {
    totalMonths, underOneYear: false, paid: 0, cap: 0, amount: part1 + part2,
    t1, odd1, t2, full2, rem2, frac2, part1, part2,
  };
}

// Lương hưu (Điều 66, 68 Luật BHXH 41/2024 + Điều 13 NĐ 158/2025).
// postInput: số năm đóng thêm sau tuổi nghỉ hưu.
function luongHuu(gender, years, months, avgInput, earlyY, earlyM, postInput) {
  const totalMonths = years * 12 + months;
  const avg = Math.min(avgInput, CAP_BHXH);
  const capped = avgInput > CAP_BHXH;
  const fullY = Math.floor(totalMonths / 12);
  const rem = totalMonths % 12;
  const frac = rem === 0 ? 0 : rem <= 6 ? 0.5 : 1;
  const effY = fullY + frac;
  const threshold = gender === 'nu' ? 30 : 35;
  if (effY < 15) {
    return {
      eligible: false, effY, fullY, rem, frac, avg, capped, threshold,
      rate: 0, rateExplain: '', reduction: 0, rateFinal: 0, pension: 0,
      lump: 0, lumpExcess: 0, lumpPost: 0, excessBefore: 0, excessAfter: 0,
      needYears: 15 - effY,
    };
  }
  let rate;
  let rateExplain;
  if (gender === 'nu') {
    const raw = 45 + 2 * (effY - 15);
    rate = Math.min(75, raw);
    rateExplain = '45% + 2% × ' + fmtYearsShort(effY - 15) + ' trên 15 năm' + (raw > 75 ? ' (vượt trần nên lấy tối đa 75%)' : '');
  } else if (effY <= 20) {
    rate = 40 + (effY - 15);
    rateExplain = '40% + 1% × ' + fmtYearsShort(effY - 15) + ' trên 15 năm';
  } else {
    const raw = 45 + 2 * (effY - 20);
    rate = Math.min(75, raw);
    rateExplain = '45% + 2% × ' + fmtYearsShort(effY - 20) + ' trên 20 năm' + (raw > 75 ? ' (vượt trần nên lấy tối đa 75%)' : '');
  }
  const earlyMonths = earlyY * 12 + earlyM;
  const earlyFullY = Math.floor(earlyMonths / 12);
  const earlyRem = earlyMonths % 12;
  const reduction = 2 * earlyFullY + (earlyRem >= 6 ? 1 : 0);
  const rateFinal = Math.max(0, rate - reduction);
  const pension = (rateFinal / 100) * avg;
  // Trợ cấp một lần (Điều 68): chỉ năm đóng VƯỢT ngưỡng 30/35 năm mới
  // được tính — 0,5 lần mức bình quân/năm cho phần vượt tính tới tuổi
  // nghỉ hưu, 2 lần/năm cho phần vượt đóng sau tuổi nghỉ hưu.
  const post = Math.min(postInput, Math.floor(effY));
  const yearsAtRetire = effY - post;
  const excessBefore = Math.max(0, yearsAtRetire - threshold);
  const excessAfter = Math.max(0, effY - Math.max(threshold, yearsAtRetire));
  const lumpExcess = excessBefore * 0.5 * avg;
  const lumpPost = excessAfter * 2 * avg;
  return {
    eligible: true, effY, fullY, rem, frac, avg, capped, threshold,
    rate, rateExplain, reduction, earlyFullY, earlyRem, rateFinal, pension,
    lump: lumpExcess + lumpPost, lumpExcess, lumpPost, excessBefore, excessAfter,
    needYears: 0,
  };
}

// Tiền điện bậc thang (QĐ 2892/QĐ-BCT, từ 01/11/2026). VAT làm tròn đồng.
function tienDien(kwh, vatRate) {
  let remain = kwh;
  let subtotal = 0;
  const rows = [];
  for (const t of ELECTRICITY_TIERS) {
    const used = Math.min(remain, t.limit);
    if (used <= 0) continue;
    const amount = used * t.price;
    subtotal += amount;
    remain -= used;
    rows.push({ label: t.label, used, price: t.price, amount });
  }
  const vat = Math.round((subtotal * vatRate) / 100);
  const total = subtotal + vat;
  return { rows, subtotal, vat, total, avgPerKwh: kwh > 0 ? total / kwh : 0 };
}

// Lãi vay & lịch trả nợ. method: 'annuity' (trả đều) hoặc 'declining' (dư nợ giảm dần).
function laiVay(principal, annualRate, months, method) {
  const r = annualRate / 100 / 12;
  const schedule = [];
  let totalInterest = 0;
  let monthly = 0;
  if (method === 'annuity') {
    monthly = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      const interest = balance * r;
      let p = monthly - interest;
      if (i === months) p = balance;
      balance -= p;
      totalInterest += interest;
      schedule.push({ i, principal: p, interest, pay: p + interest, balance: Math.max(0, balance) });
    }
  } else {
    const principalEach = principal / months;
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      const interest = balance * r;
      const p = i === months ? balance : principalEach;
      balance -= p;
      totalInterest += interest;
      schedule.push({ i, principal: p, interest, pay: p + interest, balance: Math.max(0, balance) });
    }
    monthly = schedule.length ? schedule[0].pay : 0;
  }
  return {
    monthly, firstPay: schedule.length ? schedule[0].pay : 0,
    lastPay: schedule.length ? schedule[schedule.length - 1].pay : 0,
    totalInterest, totalPay: principal + totalInterest, schedule,
  };
}

// Lương tháng 13: thuế TNCN là phần thuế TĂNG THÊM do khoản thưởng gây ra
// trong tháng nhận thưởng (thuế cả tháng có thưởng trừ thuế tháng không thưởng).
function luongThang13(salary, months, dependents, insurance) {
  const bonus = (salary * months) / 12;
  const deduction = DEDUCT_SELF + dependents * DEDUCT_DEP + insurance;
  const taxableMonth = Math.max(0, salary + bonus - deduction);
  const taxableWithout = Math.max(0, salary - deduction);
  const taxWith = taxByBrackets(taxableMonth).tax;
  const taxWithout = taxByBrackets(taxableWithout).tax;
  const taxOnBonus = Math.max(0, taxWith - taxWithout);
  return { bonus, deduction, taxableMonth, taxableWithout, taxWith, taxWithout, taxOnBonus, net: bonus - taxOnBonus };
}

// Trợ cấp thất nghiệp BHTN + trợ cấp thôi việc (Điều 39 Luật Việc làm 74/2025).
// region: 'I' | 'II' | 'III' | 'IV'. pre2009: số năm làm việc trước 2009 chưa đóng BHTN.
function bhtn(salary, months, region, pre2009) {
  const minWage = MIN_WAGE_2026[region] || MIN_WAGE_2026.I;
  const cap = 5 * minWage;
  const eligible = months >= 12;
  const rawMonthly = eligible ? salary * 0.6 : 0;
  const capped = rawMonthly > cap;
  const monthly = Math.min(rawMonthly, cap);
  const benefitMonths = eligible ? Math.min(12, 3 + Math.max(0, Math.floor((months - 36) / 12))) : 0;
  return {
    eligible, rawMonthly, minWage, cap, capped, monthly, benefitMonths,
    totalBHTN: monthly * benefitMonths, severance: salary * 0.5 * pre2009,
  };
}

if (typeof window !== 'undefined') window.M2_CALC = { CAP_BHXH, DEDUCT_SELF, DEDUCT_DEP, TAX_BRACKETS, BHTN_CAPS, MIN_WAGE_2026, ELECTRICITY_TIERS, ELECTRICITY_VAT_DEFAULT, taxByBrackets, grossNet, netToGross, thueTncnFromSalary, thueTncnFromTaxable, bhxhMotLan, luongHuu, tienDien, laiVay, luongThang13, bhtn };
export { CAP_BHXH, DEDUCT_SELF, DEDUCT_DEP, TAX_BRACKETS, BHTN_CAPS, MIN_WAGE_2026, ELECTRICITY_TIERS, ELECTRICITY_VAT_DEFAULT, taxByBrackets, grossNet, netToGross, thueTncnFromSalary, thueTncnFromTaxable, bhxhMotLan, luongHuu, tienDien, laiVay, luongThang13, bhtn };
