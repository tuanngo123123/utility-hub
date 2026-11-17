// Lãi kép & tiết kiệm dài hạn — lãi kép tính theo tháng.
export const meta = {
  id: 'lai-kep',
  name: 'Lãi kép & tiết kiệm dài hạn',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính sức mạnh lãi kép: vốn ban đầu cộng gửi thêm hàng tháng, lãi kép tính theo tháng, xem tổng tài sản sau từng năm.',
  keywords: 'lãi kép, tiết kiệm dài hạn, lãi suất kép, gửi tiết kiệm hàng tháng, tính lãi kép',
  icon: '📈',
  seoTitle: 'Tính lãi kép & tiết kiệm dài hạn — lãi kép theo tháng',
  seoDesc: 'Tính lãi kép với vốn ban đầu và gửi thêm hàng tháng, lãi kép tính theo tháng. Xem tổng gốc đã gửi, lãi nhận được và tổng tài sản theo từng năm.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="lk-principal">Vốn ban đầu (₫)</label>
      <input id="lk-principal" type="text" inputmode="decimal" value="10.000.000" placeholder="VD: 10.000.000">
    </div>
    <div class="field">
      <label for="lk-monthly">Gửi thêm mỗi tháng (₫)</label>
      <input id="lk-monthly" type="text" inputmode="decimal" value="1.000.000" placeholder="VD: 1.000.000">
    </div>
    <div class="field">
      <label for="lk-rate">Lãi suất (%/năm)</label>
      <input id="lk-rate" type="text" inputmode="decimal" value="6" placeholder="VD: 6">
    </div>
    <div class="field">
      <label for="lk-years">Số năm gửi</label>
      <input id="lk-years" type="number" min="1" max="50" step="1" value="10">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="lk-calc">Tính lãi kép</button>
  <div id="lk-out"></div>
  <p class="note">Lãi kép tính theo tháng: mỗi tháng, lãi được cộng vào gốc rồi tháng sau tính lãi trên tổng mới. Khoản gửi thêm được cộng vào cuối mỗi tháng.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  function calc() {
    const P0 = parseNum($('lk-principal').value);
    const monthly = parseNum($('lk-monthly').value);
    const annual = parseNum($('lk-rate').value);
    const years = Math.max(1, Math.round(parseNum($('lk-years').value) || 0));
    if (P0 < 0 || monthly < 0 || annual < 0 || years < 1) { $('lk-out').innerHTML = '<p class="error">Vui lòng nhập các số hợp lệ (không âm, số năm từ 1 trở lên).</p>'; return; }
    if (P0 === 0 && monthly === 0) { $('lk-out').innerHTML = '<p class="error">Cần có vốn ban đầu hoặc khoản gửi thêm hàng tháng.</p>'; return; }
    const r = annual / 100 / 12;
    let balance = P0;
    let contributed = P0;
    const yearRows = [];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + r) + monthly;
        contributed += monthly;
      }
      yearRows.push({ y, contributed, interest: balance - contributed, total: balance });
    }
    const last = yearRows[yearRows.length - 1];
    $('lk-out').innerHTML = `
<div class="grid-3">
  <div class="stat"><div class="stat-num">${fmtVND(last.total)}</div><div class="stat-label">Tổng sau ${years} năm</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(last.contributed)}</div><div class="stat-label">Tổng gốc đã gửi</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(last.interest)}</div><div class="stat-label">Tổng lãi nhận được</div></div>
</div>
<table class="tbl">
  <thead><tr><th>Năm</th><th>Gốc đã gửi</th><th>Lãi tích lũy</th><th>Tổng tài sản</th></tr></thead>
  <tbody>${yearRows.map(x => `<tr><td>${x.y}</td><td>${fmtVND(x.contributed)}</td><td>${fmtVND(x.interest)}</td><td>${fmtVND(x.total)}</td></tr>`).join('')}</tbody>
</table>`;
  }

  $('lk-calc').addEventListener('click', calc);
}
