// Trợ cấp thôi việc & BHTN — Utility Hub (Văn phòng)
export const meta = {
  id: 'tro-cap-thoi-viec-bhtn',
  name: 'Trợ cấp thôi việc & BHTN',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Ước tính trợ cấp thất nghiệp hàng tháng (60% lương đóng BHTN) và trợ cấp thôi việc.',
  keywords: 'trợ cấp thất nghiệp, BHTN, trợ cấp thôi việc, bảo hiểm thất nghiệp',
  icon: '🛡️',
  seoTitle: 'Tính trợ cấp thất nghiệp (BHTN) & trợ cấp thôi việc',
  seoDesc: 'Ước tính mức hưởng trợ cấp thất nghiệp hàng tháng và số tháng được hưởng, cộng trợ cấp thôi việc cho thời gian làm việc trước 2009.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🛡️</span><div><h2>Trợ cấp thôi việc &amp; BHTN</h2><p class="muted">Trợ cấp thất nghiệp = 60% lương bình quân đóng BHTN 6 tháng gần nhất.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="tc-salary">Lương bình quân đóng BHTN 6 tháng gần nhất (₫)</label><input id="tc-salary" type="number" min="0" step="100000" value="12000000"></div>
    <div class="field"><label for="tc-months">Tổng thời gian đóng BHTN (tháng)</label><input id="tc-months" type="number" min="0" step="1" value="24"></div>
  </div>
  <div class="field"><label for="tc-pre2009">Số năm làm việc trước 2009 chưa đóng BHTN (để tính trợ cấp thôi việc)</label><input id="tc-pre2009" type="number" min="0" step="0.5" value="0"></div>
  <button class="btn btn-primary" id="tc-calc">Tính trợ cấp</button>
  <div class="result" id="tc-result" hidden></div>
  <p class="note">Số tháng hưởng: đóng đủ 12–36 tháng → 3 tháng; cứ thêm đủ 12 tháng đóng → +1 tháng, tối đa 12 tháng. Chưa đóng đủ 12 tháng thì chưa đủ điều kiện hưởng. Mức hưởng tối đa không quá 5 lần lương tối thiểu vùng. Trợ cấp thôi việc: 1/2 tháng lương cho mỗi năm làm việc trước 01/01/2009 chưa tham gia BHTN. Kết quả chỉ là ước tính — mức thực tế do cơ quan BHXH xác định.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtVND = UH.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const salaryEl = $('tc-salary'), monthsEl = $('tc-months'), preEl = $('tc-pre2009'), resEl = $('tc-result');

  $('tc-calc').addEventListener('click', () => {
    const salary = parseNum(salaryEl.value);
    const months = Math.max(0, Math.floor(parseNum(monthsEl.value)));
    const pre2009 = Math.max(0, parseNum(preEl.value));
    if (salary <= 0) { toast('Vui lòng nhập lương bình quân đóng BHTN.'); return; }
    let benefitMonths = 0;
    if (months >= 12) benefitMonths = Math.min(12, 3 + Math.max(0, Math.floor((months - 36) / 12)));
    const monthly = months >= 12 ? salary * 0.6 : 0;
    const totalBHTN = monthly * benefitMonths;
    const severance = salary * 0.5 * pre2009;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Đủ điều kiện hưởng BHTN</span><span>' + (months >= 12 ? 'Đủ (đã đóng ' + fmtNum(months) + ' tháng)' : 'Chưa đủ — cần đóng đủ 12 tháng') + '</span></div>' +
      '<div class="result-row"><span>Trợ cấp thất nghiệp / tháng</span><strong>' + fmtVND(monthly) + '</strong></div>' +
      '<div class="result-row"><span>Số tháng được hưởng</span><span>' + fmtNum(benefitMonths) + ' tháng</span></div>' +
      '<div class="result-row"><span>Tổng trợ cấp thất nghiệp ước tính</span><strong>' + fmtVND(totalBHTN) + '</strong></div>' +
      '<div class="result-row"><span>Trợ cấp thôi việc (trước 2009)</span><span>' + fmtVND(severance) + (pre2009 ? ' (' + fmtNum(pre2009) + ' năm × 1/2 tháng lương)' : '') + '</span></div>';
  });
}
