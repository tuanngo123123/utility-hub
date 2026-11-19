// Đếm ngược lớp học: preset theo hoạt động dạy học (30 giây–15 phút)
// + nhập tay, 3 kiểu hiển thị (số lớn, vòng tròn, bảng LED), chuông
// Web Audio khi hết giờ + bíp 5 giây cuối, nút +30 giây, bấm giờ
// (stopwatch) trong cùng công cụ, chế độ Chiếu lớp. Khác bấm giờ ở
// mục Đời sống ở chỗ chữ khổng lồ, preset theo phút, chuông và chế
// độ chiếu.
export const meta = {
  id: 'dem-nguoc-lop-hoc',
  name: 'Đếm ngược lớp học',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Đếm ngược cho giờ học: preset 30 giây đến 15 phút, hiển thị số lớn, vòng tròn hoặc bảng LED, chuông khi hết giờ, bíp 5 giây cuối, nút +30 giây, có bấm giờ và chế độ chiếu lớp.',
  keywords: 'đếm ngược lớp học, đồng hồ đếm ngược, hẹn giờ dạy học, timer lớp học, bấm giờ lớp học, chuông hết giờ',
  icon: '⏱️',
  seoTitle: 'Đếm ngược lớp học — preset theo tiết học, chuông hết giờ',
  seoDesc: 'Đếm ngược màn hình lớn cho lớp học: preset 30 giây đến 15 phút, 3 kiểu hiển thị, chuông khi hết giờ, bíp 5 giây cuối, bấm giờ trong cùng công cụ. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span><div><h2>Đếm ngược lớp học</h2><p class="muted">Chọn thời gian rồi bấm bắt đầu — hết giờ sẽ có chuông, 5 giây cuối có tiếng bíp. Bấm "Chiếu lớp" để cả lớp cùng nhìn đồng hồ.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="dn-tab-timer">Đếm ngược</button>
    <button type="button" class="tab" id="dn-tab-sw">Bấm giờ</button>
  </div>

  <div id="dn-pane-timer">
    <div id="dn-display" style="text-align:center"></div>
    <p class="muted" id="dn-status" style="text-align:center">Chọn thời gian rồi bấm Bắt đầu.</p>
    <div class="field gv-prep-only"><label for="dn-view">Kiểu hiển thị</label><select id="dn-view"><option value="big" selected>Số lớn</option><option value="ring">Vòng tròn tiến độ</option><option value="led">Bảng LED (nền đen, số neon)</option></select></div>
    <div class="field"><label>Thời gian có sẵn (bấm là chạy ngay)</label>
      <div class="gv-timer-presets" id="dn-presets">
        <button type="button" class="btn" data-sec="30">30 giây</button>
        <button type="button" class="btn" data-sec="60">1 phút</button>
        <button type="button" class="btn" data-sec="120">2 phút</button>
        <button type="button" class="btn" data-sec="180">3 phút</button>
        <button type="button" class="btn" data-sec="300">5 phút</button>
        <button type="button" class="btn" data-sec="600">10 phút</button>
        <button type="button" class="btn" data-sec="900">15 phút</button>
      </div>
    </div>
    <div class="field gv-prep-only"><label for="dn-custom-min">Hoặc nhập tay</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input id="dn-custom-min" type="number" min="0" max="180" value="" placeholder="Phút" style="width:110px">
        <input id="dn-custom-sec" type="number" min="0" max="59" value="" placeholder="Giây" style="width:110px">
        <button type="button" class="btn" id="dn-custom-set">Đặt giờ</button>
      </div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="dn-start">Bắt đầu</button>
      <button type="button" class="btn" id="dn-plus30">+30 giây</button>
      <button type="button" class="btn" id="dn-stage">Chiếu lớp</button>
      <button type="button" class="btn btn-ghost gv-sound-btn" id="dn-sound">Âm thanh: Bật</button>
      <button type="button" class="btn btn-ghost" id="dn-reset" data-uh-reset="1">Đặt lại</button>
    </div>
  </div>

  <div id="dn-pane-sw" style="display:none">
    <div style="text-align:center;padding:18px 0 6px">
      <div class="gv-timer-big" id="sw-display">00:00.0</div>
      <p class="muted" id="sw-status">Bấm giờ tính từ 0 — dùng khi làm bài không giới hạn thời gian.</p>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="sw-start">Bắt đầu</button>
      <button type="button" class="btn" id="sw-stage">Chiếu lớp</button>
      <button type="button" class="btn btn-ghost" id="sw-reset">Đặt lại</button>
    </div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  let tab = 'timer';
  let stageOpen = false;
  let stageEl = null;

  // --- Đếm ngược ---
  let totalMs = 0;
  let remainingMs = 0;
  let endAt = 0;
  let running = false;
  let done = false;
  let timerId = null;
  let lastBeepSec = -1;

  // --- Bấm giờ ---
  let swElapsed = 0;
  let swStartAt = 0;
  let swRunning = false;
  let swId = null;

  function gvSound() {
    return (typeof window !== 'undefined' && window.UhGvSound) ? window.UhGvSound : null;
  }
  function tick() { const s = gvSound(); if (s) s.tick(); }
  function bell() {
    const s = gvSound();
    if (s && s.bell) s.bell();
    else if (s) s.fanfare();
  }

  function fmt(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }

  function fmtSw(ms) {
    const total = Math.max(0, ms);
    const m = Math.floor(total / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const t = Math.floor((total % 1000) / 100);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + t;
  }

  function renderDisplay() {
    const box = $('dn-display');
    const view = $('dn-view').value;
    const text = done ? 'Hết giờ!' : fmt(remainingMs);
    const cls = done ? 'gv-timer-big gv-timer-done' : 'gv-timer-big';
    if (view === 'led') {
      box.innerHTML = '<div class="gv-led"><div class="gv-led-num">' + text + '</div>'
        + '<div class="gv-led-sub">' + (done ? 'Đã hết giờ' : 'còn lại') + '</div></div>';
      return;
    }
    if (view === 'ring') {
      const frac = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
      const C = 2 * Math.PI * 120;
      const off = C * (1 - frac);
      box.innerHTML = '<div class="gv-timer-ring"><svg viewBox="0 0 260 260" role="img" aria-label="Vòng tròn đếm ngược">'
        + '<circle cx="130" cy="130" r="120" fill="none" stroke="#e2e8f0" stroke-width="14"/>'
        + '<circle cx="130" cy="130" r="120" fill="none" stroke="' + (done ? '#dc2626' : '#0d9488') + '" stroke-width="14" stroke-linecap="round" '
        + 'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 130 130)"/>'
        + '</svg><div class="gv-timer-ring-num ' + (done ? 'gv-timer-done' : '') + '">' + text + '</div></div>';
      return;
    }
    box.innerHTML = '<div class="' + cls + '">' + text + '</div>';
  }

  function paintStartBtn() {
    $('dn-start').textContent = running ? 'Tạm dừng' : (remainingMs > 0 && remainingMs < totalMs ? 'Tiếp tục' : 'Bắt đầu');
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    running = false;
    paintStartBtn();
  }

  function timerTick() {
    if (!running) return;
    remainingMs = endAt - Date.now();
    if (remainingMs <= 5000 && remainingMs > 0) {
      // Bíp mỗi giây trong 5 giây cuối.
      const sec = Math.ceil(remainingMs / 1000);
      if (sec !== lastBeepSec) { lastBeepSec = sec; tick(); }
    }
    if (remainingMs <= 0) {
      remainingMs = 0;
      done = true;
      stopTimer();
      renderDisplay();
      $('dn-status').textContent = 'Hết giờ! Bấm "Đặt lại" để đếm lại từ đầu.';
      bell();
      updateStage();
      return;
    }
    renderDisplay();
    updateStage();
  }

  function startTimer() {
    if (totalMs <= 0) {
      $('dn-status').textContent = 'Chọn thời gian trước đã nhé (preset hoặc nhập tay).';
      return;
    }
    if (done || remainingMs <= 0) {
      remainingMs = totalMs;
      done = false;
    }
    endAt = Date.now() + remainingMs;
    running = true;
    lastBeepSec = -1;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(timerTick, 100);
    $('dn-status').textContent = 'Đang đếm ngược — còn ' + fmt(remainingMs) + '.';
    paintStartBtn();
    renderDisplay();
  }

  function pauseTimer() {
    remainingMs = Math.max(0, endAt - Date.now());
    stopTimer();
    $('dn-status').textContent = 'Đã tạm dừng — còn ' + fmt(remainingMs) + '.';
    renderDisplay();
  }

  function setDuration(ms, autostart) {
    stopTimer();
    totalMs = ms;
    remainingMs = ms;
    done = false;
    lastBeepSec = -1;
    renderDisplay();
    paintStartBtn();
    updateStage();
    if (autostart) {
      startTimer();
    } else {
      $('dn-status').textContent = 'Đã đặt ' + fmt(ms) + ' — bấm Bắt đầu để chạy.';
    }
  }

  $('dn-presets').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-sec]');
    if (!btn) return;
    setDuration(parseInt(btn.getAttribute('data-sec'), 10) * 1000, true);
  });

  $('dn-custom-set').addEventListener('click', () => {
    const min = parseInt($('dn-custom-min').value, 10) || 0;
    const sec = parseInt($('dn-custom-sec').value, 10) || 0;
    const ms = (min * 60 + sec) * 1000;
    if (ms <= 0) {
      $('dn-status').textContent = 'Nhập thời gian lớn hơn 0 rồi bấm "Đặt giờ" nhé.';
      return;
    }
    setDuration(ms, true);
  });

  $('dn-start').addEventListener('click', () => {
    if (running) pauseTimer();
    else startTimer();
  });

  $('dn-plus30').addEventListener('click', () => {
    if (totalMs <= 0) {
      $('dn-status').textContent = 'Chọn thời gian trước đã nhé.';
      return;
    }
    if (done) {
      // Hết giờ rồi mà cộng thêm thì chạy tiếp 30 giây.
      done = false;
      remainingMs = 30000;
      totalMs = 30000;
      startTimer();
      return;
    }
    totalMs += 30000;
    if (running) endAt += 30000;
    else remainingMs += 30000;
    renderDisplay();
    updateStage();
    $('dn-status').textContent = 'Đã cộng 30 giây — còn ' + fmt(running ? endAt - Date.now() : remainingMs) + '.';
  });

  $('dn-reset').addEventListener('click', () => {
    stopTimer();
    remainingMs = totalMs;
    done = false;
    renderDisplay();
    paintStartBtn();
    updateStage();
    $('dn-status').textContent = totalMs > 0 ? 'Đã đặt lại — bấm Bắt đầu để chạy lại ' + fmt(totalMs) + '.' : 'Chọn thời gian rồi bấm Bắt đầu.';
  });

  $('dn-view').addEventListener('change', renderDisplay);

  // --- Bấm giờ ---
  function renderSw() {
    const ms = swRunning ? swElapsed + (Date.now() - swStartAt) : swElapsed;
    $('sw-display').textContent = fmtSw(ms);
    updateStage();
  }

  $('sw-start').addEventListener('click', () => {
    if (swRunning) {
      swElapsed += Date.now() - swStartAt;
      swRunning = false;
      if (swId) { clearInterval(swId); swId = null; }
      $('sw-start').textContent = 'Tiếp tục';
      $('sw-status').textContent = 'Đã tạm dừng ở ' + fmtSw(swElapsed) + '.';
    } else {
      swStartAt = Date.now();
      swRunning = true;
      if (swId) clearInterval(swId);
      swId = setInterval(renderSw, 100);
      $('sw-start').textContent = 'Tạm dừng';
      $('sw-status').textContent = 'Đang bấm giờ…';
    }
    renderSw();
  });

  $('sw-reset').addEventListener('click', () => {
    swElapsed = 0;
    swRunning = false;
    if (swId) { clearInterval(swId); swId = null; }
    $('sw-start').textContent = 'Bắt đầu';
    $('sw-status').textContent = 'Đã đặt lại về 0.';
    renderSw();
  });

  // --- Chuyển tab ---
  ['timer', 'sw'].forEach(k => {
    $('dn-tab-' + k).addEventListener('click', () => {
      tab = k;
      ['timer', 'sw'].forEach(j => {
        $('dn-tab-' + j).classList.toggle('tab-active', j === k);
        $('dn-pane-' + j).style.display = j === k ? '' : 'none';
      });
      updateStage();
    });
  });

  // --- Chế độ Chiếu lớp ---
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="dn-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub" id="dn-stage-title">Đếm ngược lớp học</div>'
      + '<div class="gv-stage-big" id="dn-stage-big">—</div>'
      + '<div class="gv-stage-sub" id="dn-stage-sub"></div>'
      + '<div class="gv-stage-actions"><button type="button" class="btn btn-primary" id="dn-stage-act">Bắt đầu / Tạm dừng</button></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#dn-stage-close').addEventListener('click', closeStage);
    stageEl.querySelector('#dn-stage-act').addEventListener('click', () => {
      if (tab === 'sw') $('sw-start').click();
      else if (running) pauseTimer();
      else startTimer();
    });
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const title = stageEl.querySelector('#dn-stage-title');
    const big = stageEl.querySelector('#dn-stage-big');
    const sub = stageEl.querySelector('#dn-stage-sub');
    if (tab === 'sw') {
      title.textContent = 'Bấm giờ';
      const ms = swRunning ? swElapsed + (Date.now() - swStartAt) : swElapsed;
      big.textContent = fmtSw(ms);
      sub.textContent = swRunning ? 'Đang bấm giờ…' : 'Đã tạm dừng';
    } else {
      title.textContent = 'Đếm ngược lớp học';
      big.textContent = done ? 'Hết giờ!' : fmt(remainingMs);
      big.style.color = done ? '#f87171' : '';
      sub.textContent = done ? 'Đã hết giờ' : (running ? 'Đang đếm ngược' : (totalMs > 0 ? 'Đã tạm dừng' : 'Chưa đặt giờ'));
    }
  }

  function openStage() {
    ensureStage();
    updateStage();
    stageEl.style.display = 'flex';
    stageOpen = true;
  }

  function closeStage() {
    if (!stageEl) return;
    stageEl.style.display = 'none';
    stageOpen = false;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && stageOpen) closeStage();
  });

  $('dn-stage').addEventListener('click', openStage);
  $('sw-stage').addEventListener('click', openStage);

  (function initSoundBtn() {
    const btn = $('dn-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();

  renderDisplay();
}
