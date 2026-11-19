// Tính ngày rụng trứng và khoảng dễ thụ thai từ ngày đầu kỳ kinh gần nhất.
export const meta = {
  id: 'rung-trung',
  name: 'Tính ngày rụng trứng',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Dự đoán ngày rụng trứng, khoảng thời gian dễ thụ thai và ngày kinh tiếp theo từ ngày đầu kỳ kinh gần nhất và độ dài chu kỳ.',
  keywords: 'tính ngày rụng trứng, ngày dễ thụ thai, chu kỳ kinh nguyệt, ovulation, tính ngày kinh tiếp theo',
  icon: '🌸',
  seoTitle: 'Tính ngày rụng trứng & khoảng dễ thụ thai',
  seoDesc: 'Tính ngày rụng trứng dự kiến, khoảng dễ thụ thai và ngày kinh nguyệt tiếp theo từ chu kỳ của bạn. Miễn phí, tính ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập ngày đầu tiên của kỳ kinh gần nhất và độ dài chu kỳ trung bình của bạn.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="rt-lmp">Ngày đầu kỳ kinh gần nhất</label>
      <input id="rt-lmp" type="date">
    </div>
    <div class="field">
      <label for="rt-cycle">Độ dài chu kỳ (ngày)</label>
      <input id="rt-cycle" type="number" min="21" max="45" step="1" value="28" placeholder="Ví dụ: 28">
      <p class="muted">Chu kỳ bình thường là 21–35 ngày, phổ biến nhất là 28 ngày.</p>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="rt-calc">Tính ngày rụng trứng</button>
  <div id="rt-out"></div>
  <p class="note">Ngày rụng trứng dự kiến = ngày đầu kỳ kinh tiếp theo trừ 14 ngày. Khoảng dễ thụ thai gồm 5 ngày trước và 1 ngày sau ngày rụng trứng, vì tinh trùng có thể sống tới 5 ngày trong cơ thể. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế — chu kỳ thực tế có thể dao động, KHÔNG dùng kết quả này để tránh thai.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const todayISO = U.todayISO || (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const $ = id => root.querySelector('#' + id);

  function parseDate(v) {
    const d = new Date(v + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function addDays(d, n) {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    return x;
  }

  function fmt(d) {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  function calc() {
    const lmp = parseDate($('rt-lmp').value);
    const cycle = parseInt($('rt-cycle').value, 10);
    const out = $('rt-out');
    if (!lmp) { out.innerHTML = '<p class="error">Vui lòng chọn ngày đầu kỳ kinh gần nhất.</p>'; return; }
    if (!(cycle >= 21 && cycle <= 45)) { out.innerHTML = '<p class="error">Độ dài chu kỳ thường từ 21 đến 45 ngày.</p>'; return; }
    const nextPeriod = addDays(lmp, cycle);
    const ovulation = addDays(nextPeriod, -14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmt(ovulation)}</div><div class="stat-label">Ngày rụng trứng dự kiến</div></div>
  <div class="result-row"><span>Khoảng dễ thụ thai</span><strong>${fmt(fertileStart)} — ${fmt(fertileEnd)}</strong></div>
  <div class="result-row"><span>Ngày kinh tiếp theo</span><strong>${fmt(nextPeriod)}</strong></div>
  <div class="result-row"><span>Ngày rụng trứng của chu kỳ sau</span><strong>${fmt(addDays(ovulation, cycle))}</strong></div>
</div>
<p class="muted">Ngày rụng trứng là ngày có khả năng thụ thai cao nhất trong chu kỳ. Nếu chu kỳ của bạn không đều, ngày rụng trứng thực tế có thể lệch vài ngày so với dự đoán.</p>`;
  }

  $('rt-lmp').value = todayISO();
  $('rt-calc').addEventListener('click', calc);
}
