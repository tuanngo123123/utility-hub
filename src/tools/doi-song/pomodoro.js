// Đồng hồ Pomodoro — hẹn giờ tập trung 25/5/15 phút, chuông báo, đếm phiên trong ngày.
export const meta = {
  id: 'pomodoro',
  name: 'Đồng hồ Pomodoro',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Hẹn giờ tập trung 25 phút, nghỉ ngắn 5 phút, nghỉ dài 15 phút. Chuông báo khi hết giờ, đếm số phiên đã xong trong ngày.',
  keywords: 'pomodoro, hẹn giờ tập trung, đếm ngược, làm việc tập trung, nghỉ ngơi',
  icon: '🍅',
  seoTitle: 'Đồng hồ Pomodoro — Hẹn giờ tập trung 25 phút',
  seoDesc: 'Đồng hồ Pomodoro trực tuyến: tập trung 25 phút, nghỉ 5 phút, nghỉ dài 15 phút. Chuông báo khi hết giờ, đếm phiên trong ngày, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🍅</span><div><h2>Đồng hồ Pomodoro</h2><p class="muted">Tập trung 25 phút, nghỉ 5 phút. Sau 4 phiên tập trung thì nghỉ dài 15 phút.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" data-pom-mode="focus">Tập trung</button>
    <button type="button" class="tab" data-pom-mode="short">Nghỉ ngắn</button>
    <button type="button" class="tab" data-pom-mode="long">Nghỉ dài</button>
  </div>
  <div class="stat"><div class="stat-num" id="pom-time">25:00</div><div class="stat-label" id="pom-mode-label">Đang tập trung</div></div>
  <div class="grid-3">
    <div class="field"><label for="pom-focus">Tập trung (phút)</label><input id="pom-focus" type="number" min="1" max="180" value="25"></div>
    <div class="field"><label for="pom-short">Nghỉ ngắn (phút)</label><input id="pom-short" type="number" min="1" max="60" value="5"></div>
    <div class="field"><label for="pom-long">Nghỉ dài (phút)</label><input id="pom-long" type="number" min="1" max="120" value="15"></div>
  </div>
  <div>
    <button type="button" class="btn btn-primary" id="pom-start">Bắt đầu</button>
    <button type="button" class="btn btn-ghost" id="pom-pause">Tạm dừng</button>
    <button type="button" class="btn btn-ghost" id="pom-reset">Đặt lại</button>
  </div>
  <div class="result"><div class="result-row"><span>Phiên tập trung đã xong hôm nay</span><strong id="pom-count">0</strong></div></div>
  <p class="note">Chuông báo dùng âm thanh trên trình duyệt, không cần tải file. Số phiên được lưu trên máy của bạn và tự đếm lại mỗi ngày mới.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  let mode = 'focus';
  let total = 25 * 60;
  let remain = total;
  let timer = null;
  let running = false;
  const todayKey = 'uh_pomodoro_' + new Date().toISOString().slice(0, 10);

  function getCount() { try { return parseInt(localStorage.getItem(todayKey) || '0', 10) || 0; } catch (e) { return 0; } }
  function setCount(n) { try { localStorage.setItem(todayKey, String(n)); } catch (e) {} }
  function fmt(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }
  function render() {
    $('pom-time').textContent = fmt(remain);
    $('pom-count').textContent = String(getCount());
    document.title = fmt(remain) + ' — Pomodoro';
  }
  function beep() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      const ctx = new C();
      [0, 0.45, 0.9].forEach(d => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d + 0.35);
        o.start(ctx.currentTime + d);
        o.stop(ctx.currentTime + d + 0.4);
      });
    } catch (e) {}
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    running = false;
    $('pom-start').textContent = 'Bắt đầu';
  }
  function setMode(m) {
    mode = m;
    const mins = m === 'focus' ? (+$('pom-focus').value || 25)
      : m === 'short' ? (+$('pom-short').value || 5) : (+$('pom-long').value || 15);
    total = mins * 60;
    remain = total;
    stop();
    $('pom-mode-label').textContent = m === 'focus' ? 'Đang tập trung' : m === 'short' ? 'Nghỉ ngắn' : 'Nghỉ dài';
    root.querySelectorAll('[data-pom-mode]').forEach(b => b.classList.toggle('tab-active', b.getAttribute('data-pom-mode') === m));
    render();
  }
  function finish() {
    stop();
    beep();
    if (mode === 'focus') {
      const n = getCount() + 1;
      setCount(n);
      // Sau 4 phiên tập trung thì nghỉ dài, còn không thì nghỉ ngắn.
      setMode(n % 4 === 0 ? 'long' : 'short');
    } else {
      setMode('focus');
    }
  }

  root.querySelectorAll('[data-pom-mode]').forEach(b => {
    b.addEventListener('click', () => setMode(b.getAttribute('data-pom-mode')));
  });
  ['pom-focus', 'pom-short', 'pom-long'].forEach(id => {
    $(id).addEventListener('change', () => { if (!running) setMode(mode); });
  });
  $('pom-start').addEventListener('click', () => {
    if (running) return;
    running = true;
    $('pom-start').textContent = 'Đang chạy…';
    timer = setInterval(() => {
      remain -= 1;
      if (remain <= 0) { remain = 0; render(); finish(); return; }
      render();
    }, 1000);
  });
  $('pom-pause').addEventListener('click', stop);
  $('pom-reset').addEventListener('click', () => setMode(mode));
  render();
}
