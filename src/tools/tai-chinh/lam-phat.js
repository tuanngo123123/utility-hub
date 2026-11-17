// Tính lạm phát & giá trị tiền theo thời gian.
export const meta = {
  id: 'lam-phat',
  name: 'Tính lạm phát & giá trị tiền theo thời gian',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Xem lạm phát ăn mòn tiền ra sao: giá trị thực của một khoản tiền sau N năm và số tiền cần có để giữ nguyên sức mua.',
  keywords: 'tính lạm phát, giá trị tiền theo thời gian, sức mua, lạm phát Việt Nam, tiền mất giá',
  icon: '📉',
  seoTitle: 'Tính lạm phát & giá trị tiền theo thời gian — sức mua sau N năm',
  seoDesc: 'Tính giá trị thực của tiền sau N năm lạm phát và số tiền cần có để giữ nguyên sức mua, kèm bảng từng năm. Miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-3">
    <div class="field">
      <label for="lp-amount">Số tiền hiện tại (₫)</label>
      <input id="lp-amount" type="text" inputmode="decimal" value="100.000.000" placeholder="VD: 100.000.000">
    </div>
    <div class="field">
      <label for="lp-rate">Tỷ lệ lạm phát (%/năm)</label>
      <input id="lp-rate" type="text" inputmode="decimal" value="5" placeholder="VD: 5">
    </div>
    <div class="field">
      <label for="lp-years">Số năm</label>
      <input id="lp-years" type="number" min="1" max="50" step="1" value="10">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="lp-calc">Tính giá trị tiền</button>
  <div id="lp-out"></div>
  <p class="note">Giá trị thực sau N năm = số tiền ÷ (1 + lạm phát)^N. Số tiền cần có để giữ sức mua = số tiền × (1 + lạm phát)^N. Lạm phát trung bình của Việt Nam những năm gần đây khoảng 3–4%/năm.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  $('lp-calc').addEventListener('click', () => {
    const amount = parseNum($('lp-amount').value);
    const rate = parseNum($('lp-rate').value);
    const years = Math.max(1, Math.round(parseNum($('lp-years').value) || 0));
    if (!(amount > 0)) { $('lp-out').innerHTML = '<p class="error">Vui lòng nhập số tiền lớn hơn 0.</p>'; return; }
    if (rate < 0 || rate >= 100) { $('lp-out').innerHTML = '<p class="error">Tỷ lệ lạm phát phải từ 0% đến dưới 100%.</p>'; return; }
    const i = rate / 100;
    const factor = Math.pow(1 + i, years);
    const realValue = amount / factor;
    const needed = amount * factor;
    const lossPct = (1 - 1 / factor) * 100;
    const yearRows = [];
    for (let y = 1; y <= years; y++) {
      const f = Math.pow(1 + i, y);
      yearRows.push({ y, real: amount / f, need: amount * f });
    }
    $('lp-out').innerHTML = `
<div class="grid-3">
  <div class="stat"><div class="stat-num">${fmtVND(realValue)}</div><div class="stat-label">Giá trị thực sau ${years} năm</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(needed)}</div><div class="stat-label">Cần có sau ${years} năm để giữ sức mua</div></div>
  <div class="stat"><div class="stat-num">${(Math.round(lossPct * 10) / 10).toLocaleString('vi-VN')}%</div><div class="stat-label">Sức mua mất đi</div></div>
</div>
<div class="result">
  <div class="result-row"><span>${fmtVND(amount)} hôm nay, sau ${years} năm lạm phát ${rate}%/năm</span><strong>chỉ còn mua được như ${fmtVND(realValue)} hôm nay</strong></div>
</div>
<table class="tbl">
  <thead><tr><th>Năm</th><th>Giá trị thực còn lại</th><th>Cần có để giữ sức mua</th></tr></thead>
  <tbody>${yearRows.map(x => `<tr><td>${x.y}</td><td>${fmtVND(x.real)}</td><td>${fmtVND(x.need)}</td></tr>`).join('')}</tbody>
</table>`;
  });
}
