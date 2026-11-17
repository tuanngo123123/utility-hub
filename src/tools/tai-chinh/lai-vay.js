// Tính lãi vay & lịch trả nợ — trả đều (annuity) hoặc dư nợ giảm dần.
export const meta = {
  id: 'lai-vay',
  name: 'Tính lãi vay & lịch trả nợ',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính tiền trả hàng tháng, tổng lãi và bảng lịch trả nợ chi tiết từng tháng theo hai cách: trả đều (annuity) hoặc dư nợ giảm dần.',
  keywords: 'tính lãi vay, lịch trả nợ, vay trả góp, annuity, dư nợ giảm dần, lãi suất vay',
  icon: '🏦',
  seoTitle: 'Tính lãi vay & lịch trả nợ — trả đều hoặc dư nợ giảm dần',
  seoDesc: 'Tính tiền trả mỗi tháng, tổng tiền lãi và lịch trả nợ từng kỳ cho khoản vay theo phương thức trả đều hoặc dư nợ giảm dần. Miễn phí, tính ngay.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="lv-principal">Số tiền vay (₫)</label>
      <input id="lv-principal" type="text" inputmode="decimal" value="100.000.000" placeholder="VD: 100.000.000">
    </div>
    <div class="field">
      <label for="lv-rate">Lãi suất (%/năm)</label>
      <input id="lv-rate" type="text" inputmode="decimal" value="12" placeholder="VD: 12">
    </div>
    <div class="field">
      <label for="lv-months">Kỳ hạn (tháng)</label>
      <input id="lv-months" type="number" min="1" max="600" step="1" value="12">
    </div>
    <div class="field">
      <label for="lv-method">Phương thức trả</label>
      <select id="lv-method">
        <option value="annuity">Trả đều mỗi tháng (annuity)</option>
        <option value="declining">Dư nợ giảm dần (gốc đều, lãi giảm dần)</option>
      </select>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="lv-calc">Tính lịch trả nợ</button>
  <div id="lv-out"></div>
  <p class="note">Trả đều: mỗi tháng trả một khoản bằng nhau (gốc tăng dần, lãi giảm dần). Dư nợ giảm dần: gốc chia đều mỗi tháng, lãi tính trên số dư còn lại nên tháng đầu trả nhiều nhất và giảm dần.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  function calc() {
    const P = parseNum($('lv-principal').value);
    const annual = parseNum($('lv-rate').value);
    const n = Math.max(1, Math.round(parseNum($('lv-months').value) || 0));
    const method = $('lv-method').value;
    if (!(P > 0)) { $('lv-out').innerHTML = '<p class="error">Vui lòng nhập số tiền vay lớn hơn 0.</p>'; return; }
    if (annual < 0 || n < 1) { $('lv-out').innerHTML = '<p class="error">Lãi suất và kỳ hạn chưa hợp lệ.</p>'; return; }
    const r = annual / 100 / 12;
    const schedule = [];
    let totalInterest = 0, monthly = 0;
    if (method === 'annuity') {
      monthly = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      let balance = P;
      for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        let principal = monthly - interest;
        if (i === n) principal = balance;
        balance -= principal;
        totalInterest += interest;
        schedule.push({ i, principal, interest, pay: principal + interest, balance: Math.max(0, balance) });
      }
    } else {
      const principalEach = P / n;
      let balance = P;
      for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const principal = i === n ? balance : principalEach;
        balance -= principal;
        totalInterest += interest;
        schedule.push({ i, principal, interest, pay: principal + interest, balance: Math.max(0, balance) });
      }
      monthly = schedule[0].pay;
    }
    const totalPay = P + totalInterest;
    $('lv-out').innerHTML = `
<div class="grid-3">
  <div class="stat"><div class="stat-num">${fmtVND(method === 'annuity' ? monthly : schedule[0].pay)}</div><div class="stat-label">${method === 'annuity' ? 'Trả mỗi tháng' : 'Trả tháng đầu (cao nhất)'}</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(totalInterest)}</div><div class="stat-label">Tổng tiền lãi</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(totalPay)}</div><div class="stat-label">Tổng phải trả</div></div>
</div>
<table class="tbl">
  <thead><tr><th>Kỳ</th><th>Tiền gốc</th><th>Tiền lãi</th><th>Trả trong tháng</th><th>Dư nợ còn lại</th></tr></thead>
  <tbody>${schedule.map(s => `<tr><td>${s.i}</td><td>${fmtVND(s.principal)}</td><td>${fmtVND(s.interest)}</td><td>${fmtVND(s.pay)}</td><td>${fmtVND(s.balance)}</td></tr>`).join('')}</tbody>
</table>`;
  }

  $('lv-calc').addEventListener('click', calc);
}
