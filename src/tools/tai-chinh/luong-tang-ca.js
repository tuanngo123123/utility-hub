// Tính lương tăng ca — hệ số 150/200/300% theo Bộ luật Lao động.
export const meta = {
  id: 'luong-tang-ca',
  name: 'Tính lương tăng ca',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính tiền làm thêm giờ theo luật: ngày thường 150%, ngày nghỉ tuần 200%, ngày lễ Tết 300% lương giờ. Giờ công chuẩn 26 ngày × 8 giờ, cho sửa.',
  keywords: 'tính lương tăng ca, làm thêm giờ, lương OT, hệ số tăng ca 150 200 300',
  icon: '⏰',
  seoTitle: 'Tính lương tăng ca — hệ số 150% / 200% / 300% theo luật',
  seoDesc: 'Tính tiền tăng ca ngày thường 150%, nghỉ tuần 200%, lễ Tết 300% theo Bộ luật Lao động. Giờ công chuẩn 26 ngày × 8 giờ, chỉnh được.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="ltc-salary">Lương tháng (₫)</label>
      <input id="ltc-salary" type="text" inputmode="decimal" value="10.400.000" placeholder="VD: 10.400.000">
    </div>
    <div class="field">
      <label for="ltc-days">Số ngày công chuẩn / tháng</label>
      <input id="ltc-days" type="number" min="1" max="31" step="1" value="26">
    </div>
    <div class="field">
      <label for="ltc-hours">Số giờ làm việc / ngày</label>
      <input id="ltc-hours" type="number" min="1" max="24" step="1" value="8">
    </div>
    <div class="field">
      <label for="ltc-normal">Giờ tăng ca ngày thường (150%)</label>
      <input id="ltc-normal" type="text" inputmode="decimal" value="10" placeholder="VD: 10">
    </div>
    <div class="field">
      <label for="ltc-weekend">Giờ tăng ca ngày nghỉ tuần (200%)</label>
      <input id="ltc-weekend" type="text" inputmode="decimal" value="8" placeholder="VD: 8">
    </div>
    <div class="field">
      <label for="ltc-holiday">Giờ tăng ca ngày lễ, Tết (300%)</label>
      <input id="ltc-holiday" type="text" inputmode="decimal" value="8" placeholder="VD: 8">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="ltc-calc">Tính lương tăng ca</button>
  <div id="ltc-out"></div>
  <p class="note">Căn cứ Điều 98 Bộ luật Lao động 2019: làm thêm ngày thường ít nhất 150%, ngày nghỉ hằng tuần 200%, ngày nghỉ lễ Tết 300% tiền lương giờ. Lương giờ = lương tháng ÷ (số ngày công chuẩn × số giờ/ngày). Mặc định 26 ngày × 8 giờ = 208 giờ/tháng.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  $('ltc-calc').addEventListener('click', () => {
    const salary = parseNum($('ltc-salary').value);
    const days = parseNum($('ltc-days').value);
    const hoursDay = parseNum($('ltc-hours').value);
    const hNormal = parseNum($('ltc-normal').value);
    const hWeekend = parseNum($('ltc-weekend').value);
    const hHoliday = parseNum($('ltc-holiday').value);
    if (!(salary > 0)) { $('ltc-out').innerHTML = '<p class="error">Vui lòng nhập lương tháng lớn hơn 0.</p>'; return; }
    if (!(days > 0) || !(hoursDay > 0)) { $('ltc-out').innerHTML = '<p class="error">Ngày công chuẩn và giờ/ngày phải lớn hơn 0.</p>'; return; }
    if (hNormal < 0 || hWeekend < 0 || hHoliday < 0) { $('ltc-out').innerHTML = '<p class="error">Số giờ tăng ca không được âm.</p>'; return; }
    const stdHours = days * hoursDay;
    const hourly = salary / stdHours;
    const payNormal = hNormal * hourly * 1.5;
    const payWeekend = hWeekend * hourly * 2;
    const payHoliday = hHoliday * hourly * 3;
    const total = payNormal + payWeekend + payHoliday;
    $('ltc-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Lương giờ (${fmtNum(stdHours)} giờ chuẩn/tháng)</span><strong>${fmtVND(hourly)}</strong></div>
      <div class="result-row"><span>Tăng ca ngày thường — ${hNormal} giờ × 150%</span><strong>${fmtVND(payNormal)}</strong></div>
      <div class="result-row"><span>Tăng ca nghỉ tuần — ${hWeekend} giờ × 200%</span><strong>${fmtVND(payWeekend)}</strong></div>
      <div class="result-row"><span>Tăng ca lễ, Tết — ${hHoliday} giờ × 300%</span><strong>${fmtVND(payHoliday)}</strong></div>
      <div class="result-row"><span>Tổng tiền tăng ca</span><strong>${fmtVND(total)}</strong></div>
      <div class="result-row"><span>Tổng thu nhập tháng (lương + tăng ca)</span><strong>${fmtVND(salary + total)}</strong></div>
    </div>`;
  });
}
