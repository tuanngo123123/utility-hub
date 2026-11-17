// Tính chi phí cuộc họp — Utility Hub (Văn phòng)
export const meta = {
  id: 'chi-phi-cuoc-hop',
  name: 'Tính chi phí cuộc họp',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Tính cuộc họp tốn bao nhiêu tiền theo số người, lương giờ và thời lượng — có đồng hồ chạy trực tiếp.',
  keywords: 'chi phí cuộc họp, meeting cost, tính tiền họp, lương giờ',
  icon: '⏱️',
  seoTitle: 'Tính chi phí cuộc họp — đồng hồ chạy trực tiếp',
  seoDesc: 'Cuộc họp của bạn tốn bao nhiêu tiền? Nhập số người, lương giờ trung bình và thời lượng để tính ngay, kèm đồng hồ đếm chi phí theo thời gian thực.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>⏱️</span><div><h2>Tính chi phí cuộc họp</h2><p class="muted">Mỗi phút họp đều có giá — tính thử để họp ngắn lại.</p></div></div>
  <div class="grid-3">
    <div class="field"><label for="cph-people">Số người tham gia</label><input id="cph-people" type="number" min="1" step="1" value="5"></div>
    <div class="field"><label for="cph-wage">Lương trung bình / giờ / người (₫)</label><input id="cph-wage" type="number" min="0" step="1000" value="100000"></div>
    <div class="field"><label for="cph-minutes">Thời lượng dự kiến (phút)</label><input id="cph-minutes" type="number" min="1" step="1" value="60"></div>
  </div>
  <button class="btn btn-primary" id="cph-calc">Tính chi phí dự kiến</button>
  <div class="result" id="cph-result" hidden></div>
  <div class="field" style="margin-top:16px"><label>Đồng hồ chạy trực tiếp</label>
    <p class="muted">Bấm bắt đầu khi cuộc họp diễn ra, đồng hồ sẽ đếm chi phí tăng theo từng giây.</p>
    <p><span class="stat"><span class="stat-num" id="cph-clock">00:00</span><span class="stat-label">thời gian đã họp</span></span>
    <span class="stat"><span class="stat-num" id="cph-live">0₫</span><span class="stat-label">chi phí đến giờ</span></span></p>
    <p><button class="btn btn-primary" id="cph-start">▶ Bắt đầu</button>
    <button class="btn btn-ghost" id="cph-stop">⏸ Dừng</button>
    <button class="btn btn-ghost" id="cph-reset">↺ Đặt lại</button></p>
  </div>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtVND = UH.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const peopleEl = $('cph-people'), wageEl = $('cph-wage'), minEl = $('cph-minutes'), resEl = $('cph-result');
  const clockEl = $('cph-clock'), liveEl = $('cph-live');

  function inputs() {
    return { people: Math.max(1, Math.floor(parseNum(peopleEl.value))), wage: Math.max(0, parseNum(wageEl.value)), minutes: Math.max(0, parseNum(minEl.value)) };
  }
  $('cph-calc').addEventListener('click', () => {
    const v = inputs();
    if (v.wage <= 0) { toast('Vui lòng nhập lương trung bình theo giờ.'); return; }
    const total = v.people * v.wage * (v.minutes / 60);
    const perMin = v.people * v.wage / 60;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Tổng chi phí cuộc họp</span><strong>' + fmtVND(total) + '</strong></div>' +
      '<div class="result-row"><span>Chi phí mỗi phút</span><span>' + fmtVND(perMin) + '/phút</span></div>' +
      '<div class="result-row"><span>Chi phí mỗi người</span><span>' + fmtVND(v.wage * (v.minutes / 60)) + '</span></div>' +
      '<div class="result-row"><span>Quy mô</span><span>' + fmtNum(v.people) + ' người × ' + fmtNum(v.minutes) + ' phút</span></div>';
  });

  let timer = null, elapsed = 0, lastTick = 0;
  function renderLive() {
    const v = inputs();
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    clockEl.textContent = mm + ':' + ss;
    liveEl.textContent = fmtVND(v.people * v.wage * (elapsed / 3600));
  }
  $('cph-start').addEventListener('click', () => {
    if (timer) return;
    if (inputs().wage <= 0) { toast('Vui lòng nhập lương trung bình theo giờ trước.'); return; }
    lastTick = Date.now();
    timer = setInterval(() => { elapsed += Math.round((Date.now() - lastTick) / 1000); lastTick = Date.now(); renderLive(); }, 1000);
  });
  $('cph-stop').addEventListener('click', () => { if (timer) { clearInterval(timer); timer = null; } });
  $('cph-reset').addEventListener('click', () => { if (timer) { clearInterval(timer); timer = null; } elapsed = 0; renderLive(); });
  renderLive();
}
