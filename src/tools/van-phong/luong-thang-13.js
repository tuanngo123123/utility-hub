// Tính lương tháng 13 — Utility Hub (Văn phòng)
export const meta = {
  id: 'luong-thang-13',
  name: 'Tính lương tháng 13',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Ước tính tiền thưởng lương tháng 13 theo số tháng làm việc và thuế TNCN phải nộp trên khoản đó.',
  keywords: 'lương tháng 13, thưởng tết, thuế TNCN tháng 13, 13th month salary',
  icon: '🧧',
  seoTitle: 'Tính lương tháng 13 & thuế TNCN phải nộp',
  seoDesc: 'Ước tính tiền thưởng lương tháng 13 theo tỷ lệ tháng làm việc trong năm và thuế thu nhập cá nhân trên khoản thưởng đó.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🧧</span><div><h2>Tính lương tháng 13</h2><p class="muted">Thưởng tháng 13 + thuế TNCN ước tính trên khoản thưởng.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="lt13-salary">Lương tháng hiện tại (₫)</label><input id="lt13-salary" type="number" min="0" step="100000" value="15000000"></div>
    <div class="field"><label for="lt13-months">Số tháng làm việc trong năm</label><input id="lt13-months" type="number" min="0" max="12" step="1" value="12"></div>
  </div>
  <div class="grid-2">
    <div class="field"><label for="lt13-dependents">Số người phụ thuộc (giảm trừ 6,2 triệu/người)</label><input id="lt13-dependents" type="number" min="0" step="1" value="0"></div>
    <div class="field"><label for="lt13-insurance">Bảo hiểm bắt buộc đóng trong tháng nhận thưởng (₫)</label><input id="lt13-insurance" type="number" min="0" step="100000" value="0"></div>
  </div>
  <button class="btn btn-primary" id="lt13-calc">Tính thưởng tháng 13</button>
  <div class="result" id="lt13-result" hidden></div>
  <p class="note">Thuế TNCN tính theo biểu thuế lũy tiến 5 bậc năm 2026 (Luật 109/2025/QH15) trên thu nhập tính thuế của tháng nhận thưởng (lương tháng + thưởng tháng 13, trừ giảm trừ gia cảnh 15,5 triệu cho bản thân và bảo hiểm bắt buộc). Kết quả chỉ là ước tính — số thuế thực tế phụ thuộc vào cách tính của công ty và các khoản giảm trừ khác của bạn.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtVND = UH.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const salaryEl = $('lt13-salary'), monthsEl = $('lt13-months'), depEl = $('lt13-dependents'), insEl = $('lt13-insurance'), resEl = $('lt13-result');

  // Biểu thuế lũy tiến 5 bậc năm 2026 (Luật 109/2025/QH15, thu nhập tính thuế / tháng)
  const BRACKETS = [
    [10000000, 0.05], [30000000, 0.10], [60000000, 0.20],
    [100000000, 0.30], [Infinity, 0.35]
  ];
  function pit(taxable) {
    if (taxable <= 0) return 0;
    let tax = 0, prev = 0;
    for (const [limit, rate] of BRACKETS) {
      if (taxable <= prev) break;
      tax += (Math.min(taxable, limit) - prev) * rate;
      prev = limit;
    }
    return tax;
  }

  $('lt13-calc').addEventListener('click', () => {
    const salary = parseNum(salaryEl.value);
    const months = Math.min(12, Math.max(0, parseNum(monthsEl.value)));
    const dependents = Math.max(0, Math.floor(parseNum(depEl.value)));
    const insurance = Math.max(0, parseNum(insEl.value));
    if (salary <= 0) { toast('Vui lòng nhập lương tháng lớn hơn 0.'); return; }
    const bonus = salary * months / 12;
    const deduction = 15500000 + dependents * 6200000 + insurance;
    const taxWith = pit(salary + bonus - deduction);
    const taxWithout = pit(salary - deduction);
    const taxOnBonus = Math.max(0, taxWith - taxWithout);
    const net = bonus - taxOnBonus;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Thưởng tháng 13 (gộp)</span><strong>' + fmtVND(bonus) + '</strong></div>' +
      '<div class="result-row"><span>Tỷ lệ hưởng</span><span>' + fmtNum(months) + '/12 tháng</span></div>' +
      '<div class="result-row"><span>Thuế TNCN ước tính trên khoản thưởng</span><span>' + fmtVND(taxOnBonus) + '</span></div>' +
      '<div class="result-row"><span>Thực nhận ước tính</span><strong>' + fmtVND(net) + '</strong></div>' +
      '<div class="result-row"><span>Thu nhập tính thuế tháng nhận thưởng</span><span>' + fmtVND(Math.max(0, salary + bonus - deduction)) + '</span></div>';
  });
}
