// Bấm giờ & đếm ngược có chuông — bấm giờ chạy lên (lap) + đếm ngược từ số phút nhập.
export const meta = {
  id: 'bam-gio-dem-nguoc',
  name: 'Bấm giờ & đếm ngược có chuông',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Bấm giờ chạy lên có ghi vòng (lap) và đếm ngược từ số phút bạn nhập, chuông báo khi hết giờ.',
  keywords: 'bấm giờ, đếm ngược, đồng hồ bấm giờ, hẹn giờ có chuông, lap',
  icon: '⏱️',
  seoTitle: 'Bấm giờ & đếm ngược có chuông — Trực tuyến miễn phí',
  seoDesc: 'Bấm giờ chạy lên có ghi vòng, đếm ngược từ số phút nhập và chuông báo khi hết giờ. Chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>⏱️</span><div><h2>Bấm giờ & đếm ngược có chuông</h2><p class="muted">Bấm giờ chạy lên để đo thời gian, đếm ngược để hẹn giờ có chuông báo.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="bg-tab-sw">Bấm giờ</button>
    <button type="button" class="tab" id="bg-tab-cd">Đếm ngược</button>
  </div>

  <div id="bg-pane-sw">
    <div class="stat"><div class="stat-num" id="bg-sw-time">00:00.00</div><div class="stat-label">Bấm giờ</div></div>
    <div>
      <button type="button" class="btn btn-primary" id="bg-sw-start">Bắt đầu</button>
      <button type="button" class="btn btn-ghost" id="bg-sw-lap">Ghi vòng</button>
      <button type="button" class="btn btn-ghost" id="bg-sw-reset">Đặt lại</button>
    </div>
    <div id="bg-sw-laps"></div>
  </div>

  <div id="bg-pane-cd" style="display:none">
    <div class="stat"><div class="stat-num" id="bg-cd-time">05:00</div><div class="stat-label">Đếm ngược</div></div>
    <div class="grid-2">
      <div class="field"><label for="bg-cd-min">Số phút</label><input id="bg-cd-min" type="number" min="0" max="1440" value="5"></div>
      <div class="field"><label for="bg-cd-sec">Số giây thêm</label><input id="bg-cd-sec" type="number" min="0" max="59" value="0"></div>
    </div>
    <div>
      <button type="button" class="btn btn-primary" id="bg-cd-start">Bắt đầu đếm ngược</button>
      <button type="button" class="btn btn-ghost" id="bg-cd-stop">Dừng</button>
      <button type="button" class="btn btn-ghost" id="bg-cd-reset">Đặt lại</button>
    </div>
    <p class="note" id="bg-cd-note">Hết giờ sẽ có chuông báo bằng âm thanh trên trình duyệt.</p>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  function beep() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      const ctx = new C();
      [0, 0.45, 0.9, 1.35].forEach(d => {
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

  // Tabs.
  $('bg-tab-sw').addEventListener('click', () => {
    $('bg-tab-sw').classList.add('tab-active'); $('bg-tab-cd').classList.remove('tab-active');
    $('bg-pane-sw').style.display = ''; $('bg-pane-cd').style.display = 'none';
  });
  $('bg-tab-cd').addEventListener('click', () => {
    $('bg-tab-cd').classList.add('tab-active'); $('bg-tab-sw').classList.remove('tab-active');
    $('bg-pane-cd').style.display = ''; $('bg-pane-sw').style.display = 'none';
  });

  // Bấm giờ chạy lên.
  let swStart = 0, swAccum = 0, swTimer = null, swRunning = false, laps = [];
  function fmtMs(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60), s = totalSec % 60, cs = Math.floor((ms % 1000) / 10);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s + '.' + (cs < 10 ? '0' : '') + cs;
  }
  function swElapsed() { return swRunning ? swAccum + (Date.now() - swStart) : swAccum; }
  function swRender() { $('bg-sw-time').textContent = fmtMs(swElapsed()); }
  $('bg-sw-start').addEventListener('click', () => {
    if (swRunning) {
      swAccum += Date.now() - swStart;
      clearInterval(swTimer); swTimer = null; swRunning = false;
      $('bg-sw-start').textContent = 'Tiếp tục';
    } else {
      swStart = Date.now(); swRunning = true;
      $('bg-sw-start').textContent = 'Dừng';
      swTimer = setInterval(swRender, 30);
    }
    swRender();
  });
  $('bg-sw-lap').addEventListener('click', () => {
    if (!swRunning && swAccum === 0) return;
    const cur = swElapsed();
    const prev = laps.length ? laps[laps.length - 1].total : 0;
    laps.push({ total: cur, split: cur - prev });
    $('bg-sw-laps').innerHTML = '<table class="tbl"><tr><th>Vòng</th><th>Thời gian vòng</th><th>Tổng thời gian</th></tr>' +
      laps.map((l, i) => '<tr><td>' + (i + 1) + '</td><td>' + fmtMs(l.split) + '</td><td>' + fmtMs(l.total) + '</td></tr>').join('') + '</table>';
  });
  $('bg-sw-reset').addEventListener('click', () => {
    if (swTimer) clearInterval(swTimer);
    swTimer = null; swRunning = false; swAccum = 0; laps = [];
    $('bg-sw-start').textContent = 'Bắt đầu';
    $('bg-sw-laps').innerHTML = '';
    swRender();
  });

  // Đếm ngược.
  let cdTotal = 5 * 60, cdRemain = cdTotal, cdTimer = null, cdRunning = false;
  function fmtSec(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }
  function cdRender() { $('bg-cd-time').textContent = fmtSec(cdRemain); }
  function cdStop() {
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = null; cdRunning = false;
    $('bg-cd-start').textContent = 'Bắt đầu đếm ngược';
  }
  $('bg-cd-start').addEventListener('click', () => {
    if (cdRunning) return;
    if (cdRemain <= 0) cdRemain = (+$('bg-cd-min').value || 0) * 60 + (+$('bg-cd-sec').value || 0);
    if (cdRemain <= 0) { $('bg-cd-note').textContent = 'Vui lòng nhập thời gian lớn hơn 0.'; return; }
    cdRunning = true;
    $('bg-cd-start').textContent = 'Đang đếm…';
    $('bg-cd-note').textContent = 'Hết giờ sẽ có chuông báo bằng âm thanh trên trình duyệt.';
    cdTimer = setInterval(() => {
      cdRemain -= 1;
      if (cdRemain <= 0) {
        cdRemain = 0; cdRender(); cdStop();
        beep();
        $('bg-cd-note').textContent = '⏰ Hết giờ rồi!';
        return;
      }
      cdRender();
    }, 1000);
  });
  $('bg-cd-stop').addEventListener('click', cdStop);
  $('bg-cd-reset').addEventListener('click', () => {
    cdStop();
    cdTotal = (+$('bg-cd-min').value || 0) * 60 + (+$('bg-cd-sec').value || 0);
    cdRemain = cdTotal;
    $('bg-cd-note').textContent = 'Hết giờ sẽ có chuông báo bằng âm thanh trên trình duyệt.';
    cdRender();
  });
  $('bg-cd-min').addEventListener('change', () => { if (!cdRunning) { cdRemain = (+$('bg-cd-min').value || 0) * 60 + (+$('bg-cd-sec').value || 0); cdRender(); } });
  $('bg-cd-sec').addEventListener('change', () => { if (!cdRunning) { cdRemain = (+$('bg-cd-min').value || 0) * 60 + (+$('bg-cd-sec').value || 0); cdRender(); } });
}
