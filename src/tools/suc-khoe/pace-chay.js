// Tính pace chạy bộ (phút/km) và tốc độ, hai chiều.
export const meta = {
  id: 'pace-chay',
  name: 'Tính pace chạy bộ',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính pace chạy (phút/km) và tốc độ km/h từ cự ly và thời gian; hoặc tính thời gian dự kiến từ pace mục tiêu và cự ly.',
  keywords: 'tính pace chạy bộ, pace là gì, phút/km, tính tốc độ chạy, chạy 5km bao lâu',
  icon: '🏃',
  seoTitle: 'Tính pace chạy bộ — phút/km & tốc độ km/h',
  seoDesc: 'Tính pace chạy bộ miễn phí: nhập cự ly và thời gian để biết pace phút/km và tốc độ km/h, hoặc tính ngược thời gian từ pace mục tiêu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="pace-tab-1">Cự ly + thời gian → pace</button>
      <button type="button" class="tab" id="pace-tab-2">Pace mục tiêu → thời gian</button>
    </div>
  </div>
  <div id="pace-pane-1">
    <div class="grid-2">
      <div class="field">
        <label for="pace-dist">Cự ly (km)</label>
        <input id="pace-dist" type="number" min="0.1" step="0.1" value="5" placeholder="VD: 5">
      </div>
      <div class="field">
        <label>Thời gian hoàn thành</label>
        <div class="grid-3">
          <input id="pace-h" type="number" min="0" max="99" step="1" value="0" placeholder="Giờ" aria-label="Giờ">
          <input id="pace-m" type="number" min="0" max="59" step="1" value="25" placeholder="Phút" aria-label="Phút">
          <input id="pace-s" type="number" min="0" max="59" step="1" value="0" placeholder="Giây" aria-label="Giây">
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="pace-calc-1">Tính pace</button>
    <div id="pace-out-1"></div>
  </div>
  <div id="pace-pane-2" hidden>
    <div class="grid-2">
      <div class="field">
        <label>Pace mục tiêu (phút : giây / km)</label>
        <div class="grid-2">
          <input id="pace-pm" type="number" min="0" max="59" step="1" value="5" placeholder="Phút" aria-label="Phút pace">
          <input id="pace-ps" type="number" min="0" max="59" step="1" value="0" placeholder="Giây" aria-label="Giây pace">
        </div>
      </div>
      <div class="field">
        <label for="pace-dist2">Cự ly (km)</label>
        <input id="pace-dist2" type="number" min="0.1" step="0.1" value="10" placeholder="VD: 10">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="pace-calc-2">Tính thời gian</button>
    <div id="pace-out-2"></div>
  </div>
  <p class="note">Pace = thời gian chạy 1 km. Ví dụ pace 5:00/km nghĩa là bạn chạy mỗi km trong 5 phút. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế — hãy khởi động kỹ và lắng nghe cơ thể khi tập luyện.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; };
  const f1 = n => n.toFixed(1).replace('.', ',');
  const pad = n => String(n).padStart(2, '0');

  function fmtPace(secPerKm) {
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    if (s === 60) return (m + 1) + ':00';
    return m + ':' + pad(s);
  }

  function fmtDur(totalSec) {
    const total = Math.round(totalSec);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return h + ' giờ ' + pad(m) + ' phút ' + pad(s) + ' giây';
    return m + ' phút ' + pad(s) + ' giây';
  }

  function calcPace() {
    const dist = num($('pace-dist').value);
    const h = parseInt($('pace-h').value, 10) || 0;
    const m = parseInt($('pace-m').value, 10) || 0;
    const s = parseInt($('pace-s').value, 10) || 0;
    const totalSec = h * 3600 + m * 60 + s;
    const out = $('pace-out-1');
    if (!(dist > 0) || !(totalSec > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập cự ly và thời gian lớn hơn 0.</p>';
      return;
    }
    const secPerKm = totalSec / dist;
    const kmh = dist / (totalSec / 3600);
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtPace(secPerKm)} /km</div><div class="stat-label">Pace trung bình của bạn</div></div>
  <div class="result-row"><span>Tốc độ trung bình</span><strong>${f1(kmh)} km/h</strong></div>
  <div class="result-row"><span>Thời gian mỗi km</span><strong>${fmtPace(secPerKm)} phút/km</strong></div>
  <div class="result-row"><span>Thời gian 5 km ở pace này</span><strong>${fmtDur(secPerKm * 5)}</strong></div>
  <div class="result-row"><span>Thời gian 10 km ở pace này</span><strong>${fmtDur(secPerKm * 10)}</strong></div>
</div>`;
  }

  function calcTime() {
    const pm = parseInt($('pace-pm').value, 10) || 0;
    const ps = parseInt($('pace-ps').value, 10) || 0;
    const secPerKm = pm * 60 + ps;
    const dist = num($('pace-dist2').value);
    const out = $('pace-out-2');
    if (!(secPerKm > 0) || !(dist > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập pace và cự ly lớn hơn 0.</p>';
      return;
    }
    const totalSec = secPerKm * dist;
    const kmh = 3600 / secPerKm;
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtDur(totalSec)}</div><div class="stat-label">Thời gian dự kiến cho ${f1(dist)} km ở pace ${fmtPace(secPerKm)}/km</div></div>
  <div class="result-row"><span>Tốc độ tương ứng</span><strong>${f1(kmh)} km/h</strong></div>
  <div class="result-row"><span>Thời gian 5 km</span><strong>${fmtDur(secPerKm * 5)}</strong></div>
  <div class="result-row"><span>Thời gian 21,1 km (bán marathon)</span><strong>${fmtDur(secPerKm * 21.1)}</strong></div>
  <div class="result-row"><span>Thời gian 42,195 km (marathon)</span><strong>${fmtDur(secPerKm * 42.195)}</strong></div>
</div>`;
  }

  function showTab(n) {
    $('pace-tab-1').classList.toggle('tab-active', n === 1);
    $('pace-tab-2').classList.toggle('tab-active', n === 2);
    $('pace-pane-1').hidden = n !== 1;
    $('pace-pane-2').hidden = n !== 2;
  }

  $('pace-tab-1').addEventListener('click', () => showTab(1));
  $('pace-tab-2').addEventListener('click', () => showTab(2));
  $('pace-calc-1').addEventListener('click', calcPace);
  $('pace-calc-2').addEventListener('click', calcTime);
}
