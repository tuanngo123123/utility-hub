// Trợ cấp thôi việc & BHTN — Utility Hub (Văn phòng)
// Công thức theo Điều 39 Luật Việc làm 74/2025/QH15 (hiệu lực 01/01/2026):
// 60% lương bình quân đóng BHTN 6 tháng gần nhất, tối đa 5 lần lương tối thiểu
// vùng tại tháng cuối cùng đóng BHTN (mức 2026 theo NĐ 293/2025/NĐ-CP).
export const meta = {
  id: 'tro-cap-thoi-viec-bhtn',
  name: 'Trợ cấp thôi việc & BHTN',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Ước tính trợ cấp thất nghiệp hàng tháng (60% lương đóng BHTN, tối đa 5 lần lương tối thiểu vùng 2026) và trợ cấp thôi việc.',
  keywords: 'trợ cấp thất nghiệp, BHTN, trợ cấp thôi việc, bảo hiểm thất nghiệp, tính BHTN 2026, lương tối thiểu vùng 2026, trần trợ cấp thất nghiệp, luật việc làm 2025',
  icon: '🛡️',
  seoTitle: 'Tính trợ cấp thất nghiệp (BHTN) 2026 & trợ cấp thôi việc',
  seoDesc: 'Ước tính mức hưởng trợ cấp thất nghiệp hàng tháng (60% lương đóng BHTN, áp trần 5 lần lương tối thiểu vùng 2026) và số tháng được hưởng, cộng trợ cấp thôi việc cho thời gian làm việc trước 2009.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🛡️</span><div><h2>Trợ cấp thôi việc &amp; BHTN</h2><p class="muted">Trợ cấp thất nghiệp = 60% lương bình quân đóng BHTN 6 tháng gần nhất, tối đa 5 lần lương tối thiểu vùng.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="tc-salary">Lương bình quân đóng BHTN 6 tháng gần nhất (₫)</label><input id="tc-salary" type="number" min="0" step="100000" value="12000000"></div>
    <div class="field"><label for="tc-months">Tổng thời gian đóng BHTN (tháng)</label><input id="tc-months" type="number" min="0" step="1" value="24"></div>
  </div>
  <div class="field"><label for="tc-region">Vùng lương tối thiểu nơi đóng BHTN tháng cuối cùng</label><select id="tc-region"><option value="I">Vùng I — 5.310.000 ₫/tháng</option><option value="II">Vùng II — 4.730.000 ₫/tháng</option><option value="III">Vùng III — 4.140.000 ₫/tháng</option><option value="IV">Vùng IV — 3.700.000 ₫/tháng</option></select><p class="hint">Mức lương tối thiểu vùng năm 2026 theo Nghị định 293/2025/NĐ-CP. Trần trợ cấp = 5 lần mức này.</p></div>
  <div class="field"><label for="tc-pre2009">Số năm làm việc trước 2009 chưa đóng BHTN (để tính trợ cấp thôi việc)</label><input id="tc-pre2009" type="number" min="0" step="0.5" value="0"></div>
  <button class="btn btn-primary" id="tc-calc">Tính trợ cấp</button>
  <div class="result" id="tc-result" hidden></div>
  <p class="note">Số tháng hưởng: đóng đủ 12–36 tháng → 3 tháng; cứ thêm đủ 12 tháng đóng → +1 tháng, tối đa 12 tháng. Chưa đóng đủ 12 tháng thì chưa đủ điều kiện hưởng. Điều kiện hưởng: đã đóng BHTN đủ 12 tháng trong 24 tháng trước khi chấm dứt hợp đồng (36 tháng với hợp đồng mùa vụ) và nộp hồ sơ trong 3 tháng kể từ ngày chấm dứt hợp đồng. Từ 01/01/2026 (Luật Việc làm 74/2025/QH15), mức hưởng tối đa thống nhất là 5 lần lương tối thiểu vùng cho mọi người lao động — trước đây khu vực nhà nước bị giới hạn theo 5 lần lương cơ sở. Trợ cấp thôi việc: 1/2 tháng lương cho mỗi năm làm việc trước 01/01/2009 chưa tham gia BHTN. Kết quả chỉ là ước tính — mức thực tế do cơ quan BHXH xác định.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + ' ₫');
  const fmtNum = U.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = U.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  // Lương tối thiểu vùng 2026 (NĐ 293/2025/NĐ-CP, hiệu lực 01/01/2026).
  const MIN_WAGE_2026 = { I: 5310000, II: 4730000, III: 4140000, IV: 3700000 };
  const salaryEl = $('tc-salary'), monthsEl = $('tc-months'), preEl = $('tc-pre2009'), regionEl = $('tc-region'), resEl = $('tc-result');

  $('tc-calc').addEventListener('click', () => {
    const salary = parseNum(salaryEl.value);
    const months = Math.max(0, Math.floor(parseNum(monthsEl.value)));
    const pre2009 = Math.max(0, parseNum(preEl.value));
    const region = regionEl.value in MIN_WAGE_2026 ? regionEl.value : 'I';
    if (salary <= 0) { toast('Vui lòng nhập lương bình quân đóng BHTN.'); return; }
    let benefitMonths = 0;
    if (months >= 12) benefitMonths = Math.min(12, 3 + Math.max(0, Math.floor((months - 36) / 12)));
    const rawMonthly = months >= 12 ? salary * 0.6 : 0;
    const cap = 5 * MIN_WAGE_2026[region];
    const capped = rawMonthly > cap;
    const monthly = Math.min(rawMonthly, cap);
    const totalBHTN = monthly * benefitMonths;
    const severance = salary * 0.5 * pre2009;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Đủ điều kiện hưởng BHTN</span><span>' + (months >= 12 ? 'Đủ (đã đóng ' + fmtNum(months) + ' tháng)' : 'Chưa đủ — cần đóng đủ 12 tháng') + '</span></div>' +
      '<div class="result-row"><span>60% lương bình quân 6 tháng</span><span>' + fmtVND(rawMonthly) + '</span></div>' +
      '<div class="result-row"><span>Mức trần 5 × lương tối thiểu vùng ' + region + ' (' + fmtVND(MIN_WAGE_2026[region]) + '/tháng)</span><span>' + fmtVND(cap) + '</span></div>' +
      '<div class="result-row"><span>Trợ cấp thất nghiệp / tháng</span><strong>' + fmtVND(monthly) + (capped ? ' (đã áp trần)' : '') + '</strong></div>' +
      '<div class="result-row"><span>Số tháng được hưởng</span><span>' + fmtNum(benefitMonths) + ' tháng</span></div>' +
      '<div class="result-row"><span>Tổng trợ cấp thất nghiệp ước tính</span><strong>' + fmtVND(totalBHTN) + '</strong></div>' +
      '<div class="result-row"><span>Trợ cấp thôi việc (trước 2009)</span><span>' + fmtVND(severance) + (pre2009 ? ' (' + fmtNum(pre2009) + ' năm × 1/2 tháng lương)' : '') + '</span></div>';
  });
}
