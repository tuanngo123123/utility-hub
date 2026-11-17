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
      <label for="lv-principal">Số tiền vay</label>
      <span class="input-unit"><input id="lv-principal" type="text" inputmode="decimal" value="100.000.000" placeholder="VD: 100.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="lv-rate">Lãi suất</label>
      <span class="input-unit"><input id="lv-rate" type="text" inputmode="decimal" value="12" placeholder="VD: 12"><span class="unit">%/năm</span></span>
      <p class="hint">Lãi suất vay ngân hàng thường 8–15%/năm.</p>
    </div>
    <div class="field">
      <label for="lv-months">Kỳ hạn (tháng)</label>
      <input id="lv-months" type="number" min="1" max="600" step="1" value="12">
      <p class="hint">Ví dụ: 12 tháng = 1 năm, 60 tháng = 5 năm.</p>
    </div>
    <div class="field">
      <label for="lv-method">Phương thức trả</label>
      <select id="lv-method">
        <option value="annuity">Trả đều mỗi tháng (annuity)</option>
        <option value="declining">Dư nợ giảm dần (gốc đều, lãi giảm dần)</option>
      </select>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="lv-calc">Tính lịch trả nợ</button>
    <button type="button" class="btn btn-ghost" id="lv-example">Điền ví dụ</button>
  </div>
  <div id="lv-out"></div>
  <p class="note">Trả đều: mỗi tháng trả một khoản bằng nhau (gốc tăng dần, lãi giảm dần). Dư nợ giảm dần: gốc chia đều mỗi tháng, lãi tính trên số dư còn lại nên tháng đầu trả nhiều nhất và giảm dần.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  // Trợ giúp trải nghiệm (window.UH) + dự phòng khi UH thiếu.
  const markErr = U.markFieldError || function (el, msg) { $('lv-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  function calc() {
    clearErrs(root);
    const P = parseNum($('lv-principal').value);
    const annual = parseNum($('lv-rate').value);
    const monthsRaw = $('lv-months').value.trim();
    const n = Math.round(parseNum(monthsRaw));
    const method = $('lv-method').value;
    if (!(P > 0)) {
      markErr($('lv-principal'), 'Ô Số tiền vay chưa đúng — nhập số lớn hơn 0, ví dụ 100.000.000.');
      focusEl($('lv-principal'));
      $('lv-out').innerHTML = '';
      return;
    }
    if (isNaN(annual) || annual < 0) {
      markErr($('lv-rate'), 'Ô Lãi suất chưa đúng — nhập số từ 0 trở lên, ví dụ 12.');
      focusEl($('lv-rate'));
      $('lv-out').innerHTML = '';
      return;
    }
    if (!monthsRaw || isNaN(n) || n < 1 || n > 600) {
      markErr($('lv-months'), 'Ô Kỳ hạn chưa đúng — nhập số tháng từ 1 đến 600, ví dụ 12.');
      focusEl($('lv-months'));
      $('lv-out').innerHTML = '';
      return;
    }
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
    const firstPay = method === 'annuity' ? monthly : schedule[0].pay;
    const methodLabel = method === 'annuity' ? 'trả đều mỗi tháng' : 'dư nợ giảm dần';
    const copyText = 'Vay ' + fmtVND(P) + ' · Lãi suất ' + annual + '%/năm · Kỳ hạn ' + n + ' tháng (' + methodLabel + ')'
      + ' · ' + (method === 'annuity' ? 'Trả mỗi tháng: ' : 'Trả tháng đầu: ') + fmtVND(firstPay)
      + ' · Tổng tiền lãi: ' + fmtVND(totalInterest)
      + ' · Tổng phải trả: ' + fmtVND(totalPay);
    // Kỳ hạn dài (> 60 tháng): chỉ hiện 12 kỳ đầu + 3 kỳ cuối, kèm dòng
    // ghi chú — bảng 600 dòng không đọc được trên điện thoại. Công thức
    // và các con số tổng không đổi.
    const rowHtml = s => `<tr><td>${s.i}</td><td>${fmtVND(s.principal)}</td><td>${fmtVND(s.interest)}</td><td>${fmtVND(s.pay)}</td><td>${fmtVND(s.balance)}</td></tr>`;
    let scheduleRows;
    let scheduleNote = '';
    if (schedule.length > 60) {
      scheduleRows = schedule.slice(0, 12).map(rowHtml).join('')
        + `<tr><td colspan="5" class="muted">… còn ${schedule.length - 15} kỳ ở giữa (kỳ 13–${schedule.length - 3}) — bảng rút gọn để dễ đọc.</td></tr>`
        + schedule.slice(-3).map(rowHtml).join('');
      scheduleNote = '<p class="muted small">Bảng trên rút gọn 12 kỳ đầu + 3 kỳ cuối. Tổng tiền lãi và tổng phải trả vẫn tính đủ ' + n + ' kỳ.</p>';
    } else {
      scheduleRows = schedule.map(rowHtml).join('');
    }
    $('lv-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">${method === 'annuity' ? 'Trả mỗi tháng' : 'Trả tháng đầu (cao nhất)'}</p>
    <div class="result-hero-value">${fmtVND(firstPay)}</div>
    <p class="result-hero-sub">Vay ${fmtVND(P)} · ${annual}%/năm · ${n} tháng · ${methodLabel}</p>
  </div>
  <div class="result-row"><span>Tổng tiền lãi</span><strong>${fmtVND(totalInterest)}</strong></div>
  <div class="result-row"><span>Tổng phải trả</span><strong>${fmtVND(totalPay)}</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả lãi vay">Chép kết quả</button></div>
</div>
<table class="tbl">
  <thead><tr><th>Kỳ</th><th>Tiền gốc</th><th>Tiền lãi</th><th>Trả trong tháng</th><th>Dư nợ còn lại</th></tr></thead>
  <tbody>${scheduleRows}</tbody>
</table>${scheduleNote}`;
    bindCopy($('lv-out'));
  }

  function runCalc() { withBusy($('lv-calc'), calc); }
  $('lv-calc').addEventListener('click', runCalc);
  ['lv-principal', 'lv-rate', 'lv-months'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  });
  // Ví dụ: vay 300 triệu, 10,5%/năm, 24 tháng, trả đều.
  $('lv-example').addEventListener('click', () => {
    fillEx(root, { 'lv-principal': '300.000.000', 'lv-rate': '10,5', 'lv-months': '24', 'lv-method': 'annuity' }, $('lv-calc'));
  });
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
