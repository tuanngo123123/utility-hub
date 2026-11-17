// Đếm ngày làm việc — Utility Hub (Văn phòng)
export const meta = {
  id: 'dem-ngay-lam-viec',
  name: 'Đếm ngày làm việc',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Đếm số ngày làm việc giữa hai ngày, trừ cuối tuần và ngày nghỉ lễ bạn nhập thêm.',
  keywords: 'đếm ngày làm việc, ngày công, trừ cuối tuần, ngày nghỉ lễ, working days',
  icon: '📅',
  seoTitle: 'Đếm ngày làm việc — trừ thứ 7, chủ nhật & ngày lễ',
  seoDesc: 'Tính số ngày làm việc giữa hai ngày bất kỳ, tự trừ thứ 7, chủ nhật và các ngày nghỉ lễ bạn nhập thêm.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📅</span><div><h2>Đếm ngày làm việc</h2><p class="muted">Tính số ngày công giữa hai ngày, tự trừ cuối tuần và ngày lễ.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="dnl-start">Ngày bắt đầu</label><input id="dnl-start" type="date"></div>
    <div class="field"><label for="dnl-end">Ngày kết thúc</label><input id="dnl-end" type="date"></div>
  </div>
  <div class="field"><label><input id="dnl-sat" type="checkbox"> Thứ 7 vẫn tính là ngày làm việc (chỉ trừ chủ nhật)</label></div>
  <div class="field"><label for="dnl-holidays">Ngày nghỉ lễ cần trừ thêm (mỗi dòng 1 ngày, dạng 01/05/2026 hoặc 2026-05-01)</label><textarea id="dnl-holidays" rows="3" placeholder="01/05/2026&#10;02/09/2026"></textarea></div>
  <button class="btn btn-primary" id="dnl-calc">Đếm ngày làm việc</button>
  <div class="result" id="dnl-result" hidden></div>
  <p class="note">Ví dụ kiểm tra: từ 02/11/2026 (thứ hai) đến 06/11/2026 (thứ sáu) = 5 ngày làm việc.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const toast = UH.toast || (m => alert(m));
  const todayISO = UH.todayISO || (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const $ = id => root.querySelector('#' + id);
  const startEl = $('dnl-start'), endEl = $('dnl-end'), satEl = $('dnl-sat'), holEl = $('dnl-holidays'), resEl = $('dnl-result');
  startEl.value = todayISO();
  endEl.value = todayISO();

  function parseDay(s) {
    s = (s || '').trim();
    if (!s) return null;
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    return null;
  }
  function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  $('dnl-calc').addEventListener('click', () => {
    const start = parseDay(startEl.value), end = parseDay(endEl.value);
    if (!start || !end) { toast('Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.'); return; }
    if (end < start) { toast('Ngày kết thúc phải sau ngày bắt đầu.'); return; }
    const satCounts = satEl.checked;
    const holidays = new Set();
    holEl.value.split('\n').forEach(line => { const d = parseDay(line); if (d) holidays.add(key(d)); });
    let total = 0, weekend = 0, holidayHit = 0, work = 0;
    const cur = new Date(start);
    while (cur <= end) {
      total++;
      const dow = cur.getDay();
      const isWeekend = satCounts ? dow === 0 : (dow === 0 || dow === 6);
      if (isWeekend) weekend++;
      else if (holidays.has(key(cur))) holidayHit++;
      else work++;
      cur.setDate(cur.getDate() + 1);
    }
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Số ngày làm việc</span><strong>' + fmtNum(work) + ' ngày</strong></div>' +
      '<div class="result-row"><span>Tổng số ngày trong khoảng</span><span>' + fmtNum(total) + ' ngày</span></div>' +
      '<div class="result-row"><span>Ngày cuối tuần đã trừ</span><span>' + fmtNum(weekend) + ' ngày</span></div>' +
      '<div class="result-row"><span>Ngày lễ đã trừ</span><span>' + fmtNum(holidayHit) + ' ngày</span></div>';
  });
}
