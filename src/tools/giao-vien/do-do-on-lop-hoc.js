// Đo độ ồn lớp học kiểu Bouncy Balls: dùng micro đo ĐỘ TO của tiếng
// ồn (getUserMedia + AnalyserNode) — KHÔNG ghi âm, không nghe nội
// dung, âm thanh không rời khỏi máy. Bóng nảy theo độ ồn + thanh
// mức ồn + đèn giao thông 3 mức theo ngưỡng chỉnh được + độ nhạy
// theo hoạt động. Có chế độ xem thử không cần micro.
export const meta = {
  id: 'do-do-on-lop-hoc',
  name: 'Đo độ ồn lớp học',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Đo độ ồn lớp bằng micro: bóng nảy theo độ ồn, thanh mức ồn và đèn giao thông Xanh/Vàng/Đỏ theo ngưỡng chỉnh được. Chỉ đo độ to, không ghi âm, âm thanh không rời khỏi máy.',
  keywords: 'đo độ ồn lớp học, đo ồn, bouncy balls, quản lý tiếng ồn lớp, đèn giao thông lớp học, noise meter',
  icon: '🔊',
  seoTitle: 'Đo độ ồn lớp học — bóng nảy, đèn giao thông, không ghi âm',
  seoDesc: 'Dùng micro đo độ ồn lớp học: bóng nảy càng mạnh khi lớp càng ồn, đèn giao thông báo mức ồn theo ngưỡng chỉnh được. Chỉ đo độ to, không ghi âm, không gửi đi đâu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span><div><h2>Đo độ ồn lớp học</h2><p class="muted">Bóng nảy càng mạnh khi lớp càng ồn — cả lớp tự nhìn thấy mình đang ồn mà không cần cô nhắc.</p></div></div>
  <p class="note gv-prep-only"><strong>Chỉ đo ĐỘ TO, không ghi âm:</strong> công cụ chỉ tính mức độ to của tiếng ồn qua micro — không nghe nội dung, không lưu lại, âm thanh không rời khỏi máy của bạn.</p>
  <div class="gv-noise-stage" id="on-stage">
    <span class="gv-ball gv-ball-b0" id="on-ball-0"></span>
    <span class="gv-ball gv-ball-b1" id="on-ball-1"></span>
    <span class="gv-ball gv-ball-b2" id="on-ball-2"></span>
    <span class="gv-ball gv-ball-b3" id="on-ball-3"></span>
    <span class="gv-ball gv-ball-b4" id="on-ball-4"></span>
  </div>
  <div class="gv-noise-meter" style="margin-top:10px"><span class="gv-noise-meter-fill" id="on-meter"></span></div>
  <p class="muted" id="on-level" style="text-align:center;margin-top:6px">Độ ồn: —</p>
  <div class="gv-traffic" id="on-traffic">
    <span class="gv-light" id="on-light-green">Tốt</span>
    <span class="gv-light" id="on-light-yellow">Ồn</span>
    <span class="gv-light" id="on-light-red">Quá ồn</span>
  </div>
  <p class="gv-noise-state" id="on-state">Chưa đo — bấm "Bật micro để đo".</p>
  <p class="note" id="on-msg" style="display:none"></p>
  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn btn-primary" id="on-start">Bật micro để đo</button>
    <button type="button" class="btn" id="on-demo">Xem thử giao diện (không cần micro)</button>
    <button type="button" class="btn btn-ghost" id="on-stop" data-uh-reset="1" style="display:none">Dừng đo</button>
  </div>
  <div class="field gv-prep-only"><label for="on-activity">Hoạt động đang diễn ra (đặt ngưỡng ồn phù hợp)</label>
    <select id="on-activity">
      <option value="quiet" selected>Đọc thầm / làm bài cá nhân</option>
      <option value="pair">Thảo luận cặp đôi</option>
      <option value="group">Thảo luận nhóm</option>
      <option value="custom">Tùy chỉnh (chỉnh ngưỡng tay)</option>
    </select>
  </div>
  <div class="field gv-prep-only"><label for="on-thr-yellow">Ngưỡng "Hơi ồn" (đèn vàng): <span id="on-thr-yellow-val">35%</span></label>
    <input type="range" id="on-thr-yellow" min="10" max="90" value="35" step="5" style="width:100%">
  </div>
  <div class="field gv-prep-only"><label for="on-thr-red">Ngưỡng "Quá ồn" (đèn đỏ): <span id="on-thr-red-val">55%</span></label>
    <input type="range" id="on-thr-red" min="20" max="95" value="55" step="5" style="width:100%">
  </div>
  <div class="field gv-prep-only"><label for="on-sens">Độ nhạy micro: <span id="on-sens-val">100%</span></label>
    <input type="range" id="on-sens" min="50" max="200" value="100" step="10" style="width:100%">
    <p class="muted">Micro xa lớp thì tăng độ nhạy; micro gần loa thì giảm.</p>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const REDUCED = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PRESETS = {
    quiet: { yellow: 35, red: 55 },
    pair: { yellow: 50, red: 70 },
    group: { yellow: 65, red: 85 }
  };
  let running = false;
  let demo = false;
  let stream = null;
  let audioCtx = null;
  let analyser = null;
  let dataArr = null;
  let rafId = null;
  let level = 0;
  let demoLevel = 0.2;
  let demoDir = 1;
  let startTime = 0;

  function setMsg(text) {
    const el = $('on-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function thresholds() {
    let y = parseInt($('on-thr-yellow').value, 10);
    let r = parseInt($('on-thr-red').value, 10);
    if (isNaN(y)) y = 35;
    if (isNaN(r)) r = 55;
    if (r <= y) r = y + 5;
    return { yellow: y / 100, red: r / 100 };
  }

  function sensitivity() {
    const v = parseInt($('on-sens').value, 10);
    return (isNaN(v) ? 100 : v) / 100;
  }

  function paintButtons() {
    $('on-start').style.display = running ? 'none' : '';
    $('on-demo').style.display = running ? 'none' : '';
    $('on-stop').style.display = running ? '' : 'none';
  }

  function updateUI(lvl) {
    const t = thresholds();
    const pct = Math.round(lvl * 100);
    const meter = $('on-meter');
    meter.style.width = pct + '%';
    meter.classList.toggle('gv-noise-warn', lvl >= t.yellow && lvl < t.red);
    meter.classList.toggle('gv-noise-loud', lvl >= t.red);
    $('on-level').textContent = 'Độ ồn: ' + pct + '%' + (demo ? ' (đang xem thử)' : '');
    const g = $('on-light-green');
    const y = $('on-light-yellow');
    const r = $('on-light-red');
    g.classList.remove('gv-light-on-green');
    y.classList.remove('gv-light-on-yellow');
    r.classList.remove('gv-light-on-red');
    const state = $('on-state');
    if (lvl >= t.red) {
      r.classList.add('gv-light-on-red');
      state.textContent = 'Quá ồn! Cả lớp nhỏ tiếng lại nhé.';
      state.style.color = '#dc2626';
    } else if (lvl >= t.yellow) {
      y.classList.add('gv-light-on-yellow');
      state.textContent = 'Hơi ồn rồi.';
      state.style.color = '#b45309';
    } else {
      g.classList.add('gv-light-on-green');
      state.textContent = 'Đang yên tĩnh — tốt lắm!';
      state.style.color = '#15803d';
    }
    // Bóng nảy: càng ồn càng nảy cao và nhanh.
    if (!REDUCED) {
      const now = (Date.now() - startTime) / 1000;
      for (let i = 0; i < 5; i++) {
        const ball = $('on-ball-' + i);
        const maxH = 60 + i * 18;
        const speed = 2 + lvl * 7 + i * 0.7;
        const h = lvl * maxH * Math.abs(Math.sin(now * speed + i * 1.3));
        ball.style.transform = 'translateY(' + (-h).toFixed(1) + 'px)';
      }
    }
  }

  function loop() {
    if (!running) return;
    if (demo) {
      // Xem thử: mức ồn đi lang thang lên xuống để thấy bóng nảy.
      demoLevel += demoDir * (0.01 + Math.random() * 0.02);
      if (demoLevel > 0.9) { demoLevel = 0.9; demoDir = -1; }
      if (demoLevel < 0.08) { demoLevel = 0.08; demoDir = 1; }
      level = demoLevel;
    } else if (analyser && dataArr) {
      analyser.getByteTimeDomainData(dataArr);
      let sum = 0;
      for (let i = 0; i < dataArr.length; i++) {
        const v = (dataArr[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArr.length);
      const target = Math.min(1, rms * 3 * sensitivity());
      // Làm mượt để kim không nhảy loạn.
      level = level * 0.65 + target * 0.35;
    }
    updateUI(level);
    rafId = requestAnimationFrame(loop);
  }

  function beginLoop() {
    running = true;
    startTime = Date.now();
    paintButtons();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function stopAll() {
    running = false;
    demo = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stream) {
      stream.getTracks().forEach(tr => { try { tr.stop(); } catch (e) { /* bỏ qua */ } });
      stream = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch (e) { /* bỏ qua */ }
      audioCtx = null;
      analyser = null;
      dataArr = null;
    }
    level = 0;
    paintButtons();
    $('on-meter').style.width = '0%';
    $('on-meter').classList.remove('gv-noise-warn', 'gv-noise-loud');
    $('on-level').textContent = 'Độ ồn: —';
    $('on-light-green').classList.remove('gv-light-on-green');
    $('on-light-yellow').classList.remove('gv-light-on-yellow');
    $('on-light-red').classList.remove('gv-light-on-red');
    const state = $('on-state');
    state.textContent = 'Đã dừng đo.';
    state.style.color = '';
    for (let i = 0; i < 5; i++) $('on-ball-' + i).style.transform = '';
  }

  $('on-start').addEventListener('click', async () => {
    setMsg('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg('Trình duyệt hoặc thiết bị này không hỗ trợ micro (cần trình duyệt mới + mở bằng HTTPS). Bấm "Xem thử giao diện" để xem công cụ hoạt động ra sao.');
      return;
    }
    $('on-start').disabled = true;
    $('on-start').textContent = 'Đang xin quyền micro…';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('no-audio-context');
      audioCtx = new AC();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      dataArr = new Uint8Array(analyser.fftSize);
      src.connect(analyser);
      demo = false;
      level = 0;
      beginLoop();
      $('on-state').textContent = 'Đang đo…';
    } catch (e) {
      stream = null;
      setMsg('Không bật được micro — có thể bạn đã bấm "Không cho phép", hoặc máy không có micro. Kiểm tra quyền micro trong cài đặt trình duyệt rồi thử lại, hoặc bấm "Xem thử giao diện" để xem công cụ hoạt động ra sao.');
    } finally {
      $('on-start').disabled = false;
      $('on-start').textContent = 'Bật micro để đo';
    }
  });

  $('on-demo').addEventListener('click', () => {
    setMsg('Đang xem thử: mức ồn tự chạy lên xuống để bạn thấy bóng nảy, thanh mức ồn và đèn giao thông hoạt động ra sao. Bấm "Dừng đo" rồi "Bật micro để đo" để đo thật.');
    demo = true;
    demoLevel = 0.2;
    demoDir = 1;
    level = 0.2;
    beginLoop();
  });

  $('on-stop').addEventListener('click', () => {
    setMsg('');
    stopAll();
  });

  $('on-activity').addEventListener('change', () => {
    const v = $('on-activity').value;
    if (v === 'custom') return;
    const p = PRESETS[v];
    $('on-thr-yellow').value = String(p.yellow);
    $('on-thr-red').value = String(p.red);
    $('on-thr-yellow-val').textContent = p.yellow + '%';
    $('on-thr-red-val').textContent = p.red + '%';
  });

  function bindSlider(id, labelId) {
    $(id).addEventListener('input', () => {
      $(labelId).textContent = $(id).value + '%';
      if ($('on-activity').value !== 'custom' && (id === 'on-thr-yellow' || id === 'on-thr-red')) {
        $('on-activity').value = 'custom';
      }
    });
  }
  bindSlider('on-thr-yellow', 'on-thr-yellow-val');
  bindSlider('on-thr-red', 'on-thr-red-val');
  bindSlider('on-sens', 'on-sens-val');

  // Đổi ngưỡng thì đèn cập nhật ngay cả khi chưa đo (dùng mức hiện tại).
  ['on-thr-yellow', 'on-thr-red'].forEach(id => {
    $(id).addEventListener('input', () => { if (running) updateUI(level); });
  });
}
