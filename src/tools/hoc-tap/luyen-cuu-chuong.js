// Luyện cửu chương: 10 câu ngẫu nhiên, bấm giờ, lưu kỷ lục (localStorage).
export const meta = {
  id: 'luyen-cuu-chuong',
  name: 'Luyện cửu chương',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Luyện bảng cửu chương 2–9: 10 câu hỏi ngẫu nhiên, bấm giờ, chấm điểm và lưu kỷ lục tốt nhất của bạn.',
  keywords: 'luyện cửu chương, bảng cửu chương, học bảng nhân, luyện nhân online, cửu chương 2 đến 9',
  icon: '✖️',
  seoTitle: 'Luyện cửu chương 2–9 — 10 câu ngẫu nhiên, bấm giờ & kỷ lục',
  seoDesc: 'Luyện bảng cửu chương online: chọn bảng 2–9 hoặc trộn, trả lời 10 câu ngẫu nhiên có bấm giờ, chấm điểm và lưu kỷ lục.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Chọn bảng cửu chương rồi bấm "Bắt đầu" — bạn sẽ trả lời 10 câu hỏi ngẫu nhiên, có bấm giờ.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="cc-table">Bảng cửu chương</label>
      <select id="cc-table">
        <option value="2">Bảng 2</option>
        <option value="3">Bảng 3</option>
        <option value="4">Bảng 4</option>
        <option value="5">Bảng 5</option>
        <option value="6">Bảng 6</option>
        <option value="7">Bảng 7</option>
        <option value="8">Bảng 8</option>
        <option value="9">Bảng 9</option>
        <option value="mix" selected>Trộn tất cả (2–9)</option>
      </select>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="cc-start">Bắt đầu luyện tập</button>
  <div id="cc-best"></div>
  <div id="cc-quiz"></div>
  <div id="cc-out"></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const KEY = 'uh_cuuchuong_best';
  const TOTAL = 10;

  let questions = [];
  let idx = 0;
  let score = 0;
  let startTime = 0;
  let timerId = null;

  function loadBest() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveBest(rec) {
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { /* localStorage không khả dụng */ }
  }

  function fmtTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? m + ' phút ' + (s % 60) + ' giây' : s + ' giây';
  }

  function showBest() {
    const b = loadBest();
    $('cc-best').innerHTML = b
      ? '<p class="note">🏆 Kỷ lục của bạn: ' + b.dung + '/' + b.tong + ' câu đúng trong ' + fmtTime(b.ms) + ' (ngày ' + b.ngay + ', bảng ' + b.bang + ').</p>'
      : '<p class="note">Chưa có kỷ lục — làm xong 10 câu đầu tiên để lập kỷ lục nhé!</p>';
  }

  function genQuestions(table) {
    const qs = [];
    const seen = {};
    while (qs.length < TOTAL) {
      const a = table === 'mix' ? 2 + Math.floor(Math.random() * 8) : parseInt(table, 10);
      const b = 1 + Math.floor(Math.random() * 10);
      const key = a + 'x' + b;
      if (seen[key]) continue;
      seen[key] = true;
      qs.push({ a, b, ans: a * b });
    }
    return qs;
  }

  function tick() {
    const el = root.querySelector('#cc-timer');
    if (el) el.textContent = fmtTime(Date.now() - startTime);
  }

  function renderQuestion() {
    const q = questions[idx];
    $('cc-quiz').innerHTML = `
<div class="result">
  <div class="result-row"><span>Câu ${idx + 1}/${TOTAL} — Điểm: ${score}</span><strong>⏱ <span id="cc-timer">${fmtTime(Date.now() - startTime)}</span></strong></div>
  <div class="stat"><div class="stat-num">${q.a} × ${q.b} = ?</div><div class="stat-label">Nhập đáp án rồi bấm Enter hoặc nút "Trả lời"</div></div>
  <div class="field"><label for="cc-ans">Đáp án của bạn</label><input id="cc-ans" type="number" inputmode="numeric" placeholder="VD: 42" autocomplete="off"></div>
  <button type="button" class="btn btn-primary" id="cc-answer">Trả lời</button>
  <div id="cc-feedback"></div>
</div>`;
    $('cc-answer').addEventListener('click', answer);
    const input = $('cc-ans');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') answer(); });
    input.focus();
  }

  function answer() {
    const input = $('cc-ans');
    const v = parseInt(input.value, 10);
    if (isNaN(v)) { $('cc-feedback').innerHTML = '<p class="error">Vui lòng nhập đáp án (một số).</p>'; return; }
    const q = questions[idx];
    const ok = v === q.ans;
    if (ok) score++;
    $('cc-feedback').innerHTML = ok
      ? '<p>✓ Đúng rồi! ' + q.a + ' × ' + q.b + ' = ' + q.ans + '</p>'
      : '<p class="error">✗ Chưa đúng. ' + q.a + ' × ' + q.b + ' = ' + q.ans + '</p>';
    idx++;
    setTimeout(() => {
      if (idx >= TOTAL) finish();
      else renderQuestion();
    }, 900);
  }

  function finish() {
    clearInterval(timerId);
    timerId = null;
    const ms = Date.now() - startTime;
    const table = $('cc-table').value;
    const tableLabel = table === 'mix' ? 'trộn 2–9' : table;
    const prev = loadBest();
    let newRecord = false;
    if (!prev || score > prev.dung || (score === prev.dung && ms < prev.ms)) {
      saveBest({ dung: score, tong: TOTAL, ms, ngay: new Date().toLocaleDateString('vi-VN'), bang: tableLabel });
      newRecord = true;
    }
    let rank;
    if (score === 10) rank = 'Hoàn hảo! Bạn thuộc cửu chương rất chắc.';
    else if (score >= 8) rank = 'Rất tốt! Chỉ còn vài phép cần ôn lại.';
    else if (score >= 5) rank = 'Khá — luyện thêm vài lượt nữa nhé.';
    else rank = 'Cần luyện thêm — đừng nản, làm lại lượt nữa nhé!';
    $('cc-quiz').innerHTML = '';
    $('cc-out').innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${score}/${TOTAL}</div><div class="stat-label">${rank}</div></div>
  <div class="result-row"><span>Thời gian</span><strong>${fmtTime(ms)}</strong></div>
  <div class="result-row"><span>Bảng đã luyện</span><strong>${tableLabel}</strong></div>
  ${newRecord ? '<div class="result-row"><span>Kỷ lục</span><strong>🏆 Kỷ lục mới!</strong></div>' : ''}
</div>
<button type="button" class="btn btn-ghost" id="cc-again">Luyện lại lượt nữa</button>`;
    $('cc-again').addEventListener('click', start);
    showBest();
  }

  function start() {
    questions = genQuestions($('cc-table').value);
    idx = 0;
    score = 0;
    startTime = Date.now();
    $('cc-out').innerHTML = '';
    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 500);
    renderQuestion();
  }

  $('cc-start').addEventListener('click', start);
  showBest();
}
