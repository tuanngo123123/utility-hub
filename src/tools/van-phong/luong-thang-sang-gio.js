// Lương tháng → lương giờ — Utility Hub (Văn phòng)
export const meta = {
  id: 'luong-thang-sang-gio',
  name: 'Lương tháng → lương giờ',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Đổi lương tháng ra lương giờ, lương ngày và lương phút theo số ngày làm việc thực tế.',
  keywords: 'lương giờ, lương tháng sang lương giờ, tính lương theo giờ, hourly wage',
  icon: '💰',
  seoTitle: 'Lương tháng → lương giờ | tính lương theo giờ, ngày, phút',
  seoDesc: 'Nhập lương tháng, số ngày làm việc và giờ làm mỗi ngày để biết bạn kiếm được bao nhiêu mỗi giờ, mỗi ngày, mỗi phút.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>💰</span><div><h2>Lương tháng → lương giờ</h2><p class="muted">Một giờ làm việc của bạn đáng giá bao nhiêu?</p></div></div>
  <div class="grid-3">
    <div class="field"><label for="ltg-month">Lương tháng (₫)</label><input id="ltg-month" type="number" min="0" step="100000" value="26000000"></div>
    <div class="field"><label for="ltg-days">Số ngày làm việc / tháng</label><input id="ltg-days" type="number" min="1" max="31" step="1" value="26"></div>
    <div class="field"><label for="ltg-hours">Số giờ làm việc / ngày</label><input id="ltg-hours" type="number" min="1" max="24" step="0.5" value="8"></div>
  </div>
  <button class="btn btn-primary" id="ltg-calc">Tính lương giờ</button>
  <div class="result" id="ltg-result" hidden></div>
  <p class="note">Ví dụ: lương 26.000.000₫/tháng, làm 26 ngày × 8 giờ → 125.000₫/giờ.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtVND = UH.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const monthEl = $('ltg-month'), daysEl = $('ltg-days'), hoursEl = $('ltg-hours'), resEl = $('ltg-result');

  $('ltg-calc').addEventListener('click', () => {
    const month = parseNum(monthEl.value);
    const days = parseNum(daysEl.value);
    const hours = parseNum(hoursEl.value);
    if (month <= 0) { toast('Vui lòng nhập lương tháng lớn hơn 0.'); return; }
    if (days <= 0 || hours <= 0) { toast('Số ngày và số giờ làm việc phải lớn hơn 0.'); return; }
    const perDay = month / days;
    const perHour = perDay / hours;
    const perMin = perHour / 60;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Lương mỗi giờ</span><strong>' + fmtVND(perHour) + '/giờ</strong></div>' +
      '<div class="result-row"><span>Lương mỗi ngày</span><span>' + fmtVND(perDay) + '/ngày</span></div>' +
      '<div class="result-row"><span>Lương mỗi phút</span><span>' + fmtVND(perMin) + '/phút</span></div>' +
      '<div class="result-row"><span>Tổng giờ làm / tháng</span><span>' + fmtNum(days * hours) + ' giờ</span></div>';
  });
}
