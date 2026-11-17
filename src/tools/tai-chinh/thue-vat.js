// Tính thuế VAT & tách hóa đơn — cộng VAT hoặc tách VAT khỏi giá đã có thuế.
export const meta = {
  id: 'thue-vat',
  name: 'Tính thuế VAT & tách hóa đơn',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Cộng VAT vào giá chưa thuế hoặc tách VAT ra khỏi giá đã có thuế: xem tiền trước thuế, tiền VAT và tổng thanh toán.',
  keywords: 'tính VAT, thuế giá trị gia tăng, tách VAT, giá chưa VAT, hóa đơn VAT 8% 10%',
  icon: '🧮',
  seoTitle: 'Tính thuế VAT & tách hóa đơn — VAT 8%, 10% hoặc tùy chọn',
  seoDesc: 'Cộng VAT vào giá chưa thuế hoặc tách VAT khỏi giá đã có thuế với thuế suất 8%, 10% hoặc tùy chọn. Tính ngay, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="tvat-tab-add">Chưa VAT → Có VAT</button>
      <button type="button" class="tab" id="tvat-tab-split">Có VAT → Tách ra</button>
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="tvat-amount">Số tiền (₫)</label>
      <input id="tvat-amount" type="text" inputmode="decimal" value="1.000.000" placeholder="VD: 1.000.000">
    </div>
    <div class="field">
      <label for="tvat-rate">Thuế suất VAT</label>
      <select id="tvat-rate">
        <option value="10">10% (mức phổ biến)</option>
        <option value="8">8% (mức giảm)</option>
        <option value="5">5%</option>
        <option value="0">0%</option>
        <option value="custom">Khác…</option>
      </select>
    </div>
  </div>
  <div class="field" id="tvat-custom-wrap" style="display:none">
    <label for="tvat-custom">Thuế suất tùy chọn (%)</label>
    <input id="tvat-custom" type="text" inputmode="decimal" value="10" placeholder="VD: 7,5">
  </div>
  <button type="button" class="btn btn-primary" id="tvat-calc">Tính VAT</button>
  <div id="tvat-out"></div>
  <p class="note">Tách VAT: tiền trước thuế = giá đã có VAT ÷ (1 + thuế suất). Ví dụ: 1.100.000₫ đã gồm VAT 10% → trước thuế 1.000.000₫, VAT 100.000₫.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  let direction = 'add';

  $('tvat-rate').addEventListener('change', () => {
    $('tvat-custom-wrap').style.display = $('tvat-rate').value === 'custom' ? '' : 'none';
  });
  $('tvat-tab-add').addEventListener('click', () => {
    direction = 'add';
    $('tvat-tab-add').classList.add('tab-active');
    $('tvat-tab-split').classList.remove('tab-active');
    $('tvat-out').innerHTML = '';
  });
  $('tvat-tab-split').addEventListener('click', () => {
    direction = 'split';
    $('tvat-tab-split').classList.add('tab-active');
    $('tvat-tab-add').classList.remove('tab-active');
    $('tvat-out').innerHTML = '';
  });

  $('tvat-calc').addEventListener('click', () => {
    const amount = parseNum($('tvat-amount').value);
    const rate = $('tvat-rate').value === 'custom' ? parseNum($('tvat-custom').value) : parseNum($('tvat-rate').value);
    if (!(amount > 0)) { $('tvat-out').innerHTML = '<p class="error">Vui lòng nhập số tiền lớn hơn 0.</p>'; return; }
    if (rate < 0 || rate > 100) { $('tvat-out').innerHTML = '<p class="error">Thuế suất phải từ 0% đến 100%.</p>'; return; }
    const r = rate / 100;
    let before, vat, total;
    if (direction === 'add') {
      before = amount;
      vat = amount * r;
      total = amount + vat;
    } else {
      total = amount;
      before = amount / (1 + r);
      vat = total - before;
    }
    $('tvat-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Tiền trước thuế</span><strong>${fmtVND(before)}</strong></div>
      <div class="result-row"><span>Tiền VAT (${rate}%)</span><strong>${fmtVND(vat)}</strong></div>
      <div class="result-row"><span>Tổng thanh toán</span><strong>${fmtVND(total)}</strong></div>
    </div>`;
  });
}
