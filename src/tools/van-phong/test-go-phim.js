// Kiểm tra tốc độ gõ phím — Utility Hub (Văn phòng)
export const meta = {
  id: 'test-go-phim',
  name: 'Kiểm tra tốc độ gõ phím',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Đo tốc độ gõ phím tiếng Việt: số từ mỗi phút (WPM), độ chính xác và số lỗi.',
  keywords: 'test gõ phím, kiểm tra tốc độ gõ phím, WPM, tốc độ đánh máy, typing test, độ chính xác',
  icon: '⌨️',
  seoTitle: 'Kiểm tra tốc độ gõ phím tiếng Việt — đo WPM & độ chính xác',
  seoDesc: 'Kiểm tra tốc độ gõ phím tiếng Việt của bạn: đo WPM, độ chính xác và số lỗi với 3 đoạn văn mẫu.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>⌨️</span><div><h2>Kiểm tra tốc độ gõ phím</h2><p class="muted">Gõ theo đoạn văn mẫu, xem bạn gõ được bao nhiêu từ mỗi phút.</p></div></div>
  <div class="field"><label for="tgp-sample">Chọn đoạn văn mẫu</label>
    <select id="tgp-sample">
      <option value="0">Đoạn 1 — Buổi sáng ở văn phòng</option>
      <option value="1">Đoạn 2 — Con sông quê hương</option>
      <option value="2">Đoạn 3 — Thành phố về đêm</option>
    </select>
  </div>
  <div class="field"><label>Đoạn văn cần gõ</label><p class="note" id="tgp-text"></p></div>
  <div class="field"><label for="tgp-input">Gõ vào đây</label><textarea id="tgp-input" rows="4" disabled placeholder="Bấm &quot;Bắt đầu&quot; rồi gõ theo đoạn văn phía trên..."></textarea></div>
  <p><button class="btn btn-primary" id="tgp-start">▶ Bắt đầu</button>
  <button class="btn btn-ghost" id="tgp-finish" disabled>Hoàn thành</button>
  <button class="btn btn-ghost" id="tgp-again">↺ Đoạn khác / Làm lại</button>
  <span class="chip" id="tgp-timer">00:00</span></p>
  <div class="result" id="tgp-result" hidden></div>
  <p class="note">WPM = (số ký tự gõ đúng ÷ 5) ÷ số phút. Bài test tự kết thúc khi bạn gõ đủ độ dài đoạn mẫu.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const sampleEl = $('tgp-sample'), textEl = $('tgp-text'), inputEl = $('tgp-input'),
    startBtn = $('tgp-start'), finishBtn = $('tgp-finish'), againBtn = $('tgp-again'),
    timerEl = $('tgp-timer'), resEl = $('tgp-result');
  let timer = null, startTime = 0, running = false;

  const SAMPLES = [
    'Buổi sáng ở văn phòng bắt đầu bằng tiếng máy in và mùi cà phê mới pha. Mọi người chào nhau rồi ngồi vào bàn, mở máy tính và xem lại công việc của ngày hôm nay.',
    'Con sông chảy qua làng mang theo phù sa màu mỡ cho những cánh đồng lúa xanh mướt. Người nông dân ra đồng từ sáng sớm, tiếng cười nói vang lên khắp xóm nhỏ yên bình.',
    'Thành phố về đêm lung linh ánh đèn từ những tòa nhà cao tầng. Dòng người vẫn hối hả trên phố, tiếng còi xe hòa cùng mùi thơm của hàng quán ven đường.'
  ];

  function showSample() { textEl.textContent = SAMPLES[+sampleEl.value] || SAMPLES[0]; }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function resetAll() {
    stopTimer(); running = false;
    inputEl.value = ''; inputEl.disabled = true;
    startBtn.disabled = false; finishBtn.disabled = true;
    timerEl.textContent = '00:00'; resEl.hidden = true;
  }
  sampleEl.addEventListener('change', () => { showSample(); resetAll(); });
  showSample();

  startBtn.addEventListener('click', () => {
    resetAll();
    inputEl.disabled = false; inputEl.focus();
    startBtn.disabled = true; finishBtn.disabled = false;
    running = true; startTime = Date.now();
    timer = setInterval(() => {
      const s = Math.floor((Date.now() - startTime) / 1000);
      timerEl.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 500);
  });

  function finish() {
    if (!running) return;
    running = false; stopTimer();
    inputEl.disabled = true; finishBtn.disabled = true; startBtn.disabled = false;
    const target = textEl.textContent;
    const typed = inputEl.value;
    const seconds = Math.max(1, (Date.now() - startTime) / 1000);
    let correct = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++;
    const errors = Math.max(0, typed.length - correct);
    const accuracy = typed.length ? (correct / typed.length) * 100 : 0;
    const wpm = (correct / 5) / (seconds / 60);
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Tốc độ gõ</span><strong>' + wpm.toFixed(1) + ' từ/phút (WPM)</strong></div>' +
      '<div class="result-row"><span>Độ chính xác</span><span>' + accuracy.toFixed(1) + '%</span></div>' +
      '<div class="result-row"><span>Số lỗi</span><span>' + fmtNum(errors) + ' ký tự</span></div>' +
      '<div class="result-row"><span>Thời gian</span><span>' + seconds.toFixed(1) + ' giây — ' + fmtNum(typed.length) + ' ký tự đã gõ</span></div>';
  }
  finishBtn.addEventListener('click', finish);
  inputEl.addEventListener('input', () => {
    if (running && inputEl.value.length >= textEl.textContent.length) finish();
  });
  againBtn.addEventListener('click', () => {
    sampleEl.value = String((+sampleEl.value + 1) % SAMPLES.length);
    showSample(); resetAll();
    toast('Đã đổi sang đoạn văn khác. Bấm "Bắt đầu" để gõ lại.');
  });
}
