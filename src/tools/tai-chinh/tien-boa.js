// Tính tiền boa & chia tiền boa — nút nhanh 5/10/15/20%.
export const meta = {
  id: 'tien-boa',
  name: 'Tính tiền boa & chia tiền boa',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính tiền boa theo phần trăm hóa đơn (nút nhanh 5/10/15/20%), tổng phải trả và mỗi người trả bao nhiêu khi chia đều.',
  keywords: 'tính tiền boa, tip bao nhiêu, chia tiền boa, tiền tip nhà hàng',
  icon: '💸',
  seoTitle: 'Tính tiền boa & chia tiền boa — nút nhanh 5/10/15/20%',
  seoDesc: 'Tính tiền boa theo % hóa đơn, tổng phải trả và số tiền mỗi người trả khi chia đều. Nút nhanh 5%, 10%, 15%, 20%.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="tb-total">Tổng hóa đơn (₫)</label>
      <input id="tb-total" type="text" inputmode="decimal" value="500.000" placeholder="Ví dụ: 500.000">
    </div>
    <div class="field">
      <label for="tb-people">Số người chia</label>
      <input id="tb-people" type="number" min="1" max="100" step="1" value="2">
    </div>
  </div>
  <div class="field">
    <label for="tb-pct">Tỷ lệ boa (%)</label>
    <input id="tb-pct" type="text" inputmode="decimal" value="10" placeholder="Ví dụ: 10">
    <div style="margin-top:8px">
      <button type="button" class="btn btn-ghost" data-pct="5">5%</button>
      <button type="button" class="btn btn-ghost" data-pct="10">10%</button>
      <button type="button" class="btn btn-ghost" data-pct="15">15%</button>
      <button type="button" class="btn btn-ghost" data-pct="20">20%</button>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="tb-calc">Tính tiền boa</button>
  <div id="tb-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  function calc() {
    const total = parseNum($('tb-total').value);
    const pct = parseNum($('tb-pct').value);
    const people = Math.max(1, Math.round(parseNum($('tb-people').value) || 1));
    if (!(total > 0)) { $('tb-out').innerHTML = '<p class="error">Vui lòng nhập tổng hóa đơn lớn hơn 0.</p>'; return; }
    if (pct < 0) { $('tb-out').innerHTML = '<p class="error">Tỷ lệ boa không được âm.</p>'; return; }
    const tip = total * pct / 100;
    const grand = total + tip;
    $('tb-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Tiền boa (${pct}%)</span><strong>${fmtVND(tip)}</strong></div>
      <div class="result-row"><span>Tổng phải trả</span><strong>${fmtVND(grand)}</strong></div>
      <div class="result-row"><span>Mỗi người trả (${people} người)</span><strong>${fmtVND(grand / people)}</strong></div>
      <div class="result-row"><span>Tiền boa mỗi người</span><strong>${fmtVND(tip / people)}</strong></div>
    </div>`;
  }

  root.querySelectorAll('button[data-pct]').forEach(btn => {
    btn.addEventListener('click', () => { $('tb-pct').value = btn.getAttribute('data-pct'); calc(); });
  });
  $('tb-calc').addEventListener('click', calc);
}
