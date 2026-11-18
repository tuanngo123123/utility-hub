// Luyện tính nhẩm — bài tập cộng trừ nhân chia có bấm giờ, chấm điểm.
export const meta = {
  id: 'luyen-tinh-nham',
  name: 'Luyện tính nhẩm: cộng trừ nhân chia',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Bài tập tính nhẩm có bấm giờ: chọn phép tính, độ khó và số câu, trả lời từng câu và xem điểm, tốc độ trả lời và các câu làm sai.',
  keywords: 'luyện tính nhẩm, bài tập tính nhẩm, cộng trừ nhân chia, toán tính nhanh, luyện toán cho trẻ',
  icon: '🧮',
  seoTitle: 'Luyện tính nhẩm — Bài tập cộng trừ nhân chia có bấm giờ',
  seoDesc: 'Luyện tính nhẩm cộng, trừ, nhân, chia với bài tập có bấm giờ và chấm điểm. Chọn độ khó theo lớp, xem lại các câu làm sai.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Chọn phép tính và độ khó, bấm Bắt đầu — trả lời càng nhanh càng tốt, Enter để sang câu tiếp theo.</p>
  </div>
  <div id="ltn-setup">
    <div class="grid-3">
      <div class="field">
        <label for="ltn-op">Phép tính</label>
        <select id="ltn-op">
          <option value="mixed">Hỗn hợp (cả 4 phép)</option>
          <option value="add">Cộng (+)</option>
          <option value="sub">Trừ (−)</option>
          <option value="mul">Nhân (×)</option>
          <option value="div">Chia (÷)</option>
        </select>
      </div>
      <div class="field">
        <label for="ltn-level">Độ khó</label>
        <select id="ltn-level">
          <option value="1">Dễ — số 1 chữ số</option>
          <option value="2" selected>Vừa — số 2 chữ số</option>
          <option value="3">Khó — số 3 chữ số</option>
        </select>
      </div>
      <div class="field">
        <label for="ltn-count">Số câu</label>
        <select id="ltn-count">
          <option value="5">5 câu</option>
          <option value="10" selected>10 câu</option>
          <option value="20">20 câu</option>
        </select>
      </div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="ltn-start">Bắt đầu</button>
    </div>
  </div>
  <div id="ltn-play" style="display:none">
    <div class="grid-3">
      <div class="stat"><div class="stat-num" id="ltn-progress">1/10</div><div class="stat-label">Câu hiện tại</div></div>
      <div class="stat"><div class="stat-num" id="ltn-score">0</div><div class="stat-label">Điểm</div></div>
      <div class="stat"><div class="stat-num" id="ltn-time">0:00</div><div class="stat-label">Thời gian</div></div>
    </div>
    <div class="result">
      <div class="result-hero">
        <p class="result-hero-label">Tính nhẩm</p>
        <div class="result-hero-value" id="ltn-question">7 + 8 = ?</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="ltn-answer">Đáp án của bạn</label>
        <input id="ltn-answer" type="text" inputmode="numeric" autocomplete="off" placeholder="Nhập đáp án rồi bấm Enter">
      </div>
      <div class="field">
        <label>&nbsp;</label>
        <button type="button" class="btn btn-primary" id="ltn-submit">Trả lời</button>
      </div>
    </div>
    <p id="ltn-feedback" class="muted"></p>
    <button type="button" class="btn btn-ghost" id="ltn-quit">Dừng bài tập</button>
  </div>
  <div id="ltn-out"></div>
  <p class="note">Mẹo tính nhẩm: cộng trừ thì tách số tròn chục (47 + 28 = 47 + 30 − 2); nhân 2 chữ số thì nhân từng phần (23 × 4 = 20 × 4 + 3 × 4); chia thì nhẩm ngược phép nhân.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const $ = id => root.querySelector('#' + id);
  const toast = U.toast || function () {};
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let questions = [];
  let idx = 0;
  let score = 0;
  let timer = null;
  let seconds = 0;
  let wrong = [];
  let locked = false;

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function makeQuestion(op, level) {
    const max = level === 1 ? 9 : level === 2 ? 99 : 999;
    const min = level === 1 ? 2 : 10;
    let useOp = op;
    if (op === 'mixed') useOp = ['add', 'sub', 'mul', 'div'][rand(0, 3)];
    let a, b, ans, text;
    if (useOp === 'add') {
      a = rand(min, max); b = rand(min, max);
      ans = a + b; text = a + ' + ' + b + ' = ?';
    } else if (useOp === 'sub') {
      a = rand(min, max); b = rand(min, a);
      ans = a - b; text = a + ' − ' + b + ' = ?';
    } else if (useOp === 'mul') {
      // Nhân: giữ một thừa số nhỏ để nhẩm được (2–12), thừa số còn lại theo độ khó.
      a = rand(min, max); b = rand(2, level === 3 ? 12 : 9);
      ans = a * b; text = a + ' × ' + b + ' = ?';
    } else {
      // Chia: sinh đáp án trước rồi nhân ngược để chia hết.
      b = rand(2, level === 3 ? 12 : 9);
      ans = rand(min, level === 1 ? 9 : 49);
      a = b * ans; text = a + ' ÷ ' + b + ' = ?';
    }
    return { text, ans };
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  function showQuestion() {
    locked = false;
    $('ltn-progress').textContent = (idx + 1) + '/' + questions.length;
    $('ltn-score').textContent = score;
    $('ltn-question').textContent = questions[idx].text;
    $('ltn-answer').value = '';
    $('ltn-feedback').textContent = '';
    $('ltn-answer').focus();
  }

  function finish() {
    if (timer) { clearInterval(timer); timer = null; }
    $('ltn-play').style.display = 'none';
    $('ltn-setup').style.display = '';
    const total = questions.length;
    const pct = Math.round(score / total * 100);
    const avg = (seconds / total).toFixed(1).replace('.', ',');
    let verdict;
    if (pct === 100) verdict = 'Xuất sắc! Không sai câu nào.';
    else if (pct >= 80) verdict = 'Rất tốt! Chỉ sai vài câu.';
    else if (pct >= 50) verdict = 'Khá rồi — luyện thêm để nhanh và chính xác hơn.';
    else verdict = 'Đừng nản — thử lại với độ khó dễ hơn để lấy lại nhịp.';
    const wrongHtml = wrong.length
      ? '<table class="tbl"><thead><tr><th>Câu hỏi</th><th>Bạn trả lời</th><th>Đáp án đúng</th></tr></thead><tbody>'
        + wrong.map(w => '<tr><td>' + escHtml(w.text) + '</td><td>' + escHtml(w.got) + '</td><td>' + escHtml(String(w.ans)) + '</td></tr>').join('')
        + '</tbody></table>'
      : '<p class="muted">Không có câu sai — làm lại một lượt khó hơn nhé!</p>';
    $('ltn-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Kết quả bài tập</p>
    <div class="result-hero-value">${score}/${total} câu đúng (${pct}%)</div>
    <p class="result-hero-sub">${escHtml(verdict)}</p>
  </div>
  <div class="result-row"><span>Thời gian</span><strong>${fmtTime(seconds)} (${avg} giây/câu)</strong></div>
  <div class="result-row"><span>Số câu sai</span><strong>${wrong.length} câu</strong></div>
</div>
${wrongHtml}`;
    toast('Hoàn thành! ' + score + '/' + total + ' câu đúng.');
  }

  function submit() {
    if (locked) return;
    const raw = $('ltn-answer').value.trim().replace(',', '.');
    const got = parseFloat(raw);
    if (raw === '' || isNaN(got)) {
      $('ltn-feedback').textContent = 'Nhập đáp án là một số trước khi trả lời.';
      $('ltn-answer').focus();
      return;
    }
    locked = true;
    const q = questions[idx];
    if (got === q.ans) {
      score += 1;
      $('ltn-feedback').textContent = 'Đúng rồi! ✓';
    } else {
      wrong.push({ text: q.text, got: String(got), ans: q.ans });
      $('ltn-feedback').textContent = 'Chưa đúng — đáp án là ' + q.ans + '.';
    }
    $('ltn-score').textContent = score;
    idx += 1;
    if (idx >= questions.length) {
      setTimeout(finish, 700);
    } else {
      setTimeout(showQuestion, 700);
    }
  }

  $('ltn-start').addEventListener('click', () => {
    const op = $('ltn-op').value;
    const level = parseInt($('ltn-level').value, 10);
    const count = parseInt($('ltn-count').value, 10);
    questions = [];
    for (let i = 0; i < count; i++) questions.push(makeQuestion(op, level));
    idx = 0; score = 0; seconds = 0; wrong = [];
    $('ltn-out').innerHTML = '';
    $('ltn-setup').style.display = 'none';
    $('ltn-play').style.display = '';
    $('ltn-time').textContent = '0:00';
    if (timer) clearInterval(timer);
    timer = setInterval(() => { seconds += 1; $('ltn-time').textContent = fmtTime(seconds); }, 1000);
    showQuestion();
  });
  $('ltn-submit').addEventListener('click', submit);
  $('ltn-answer').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  $('ltn-quit').addEventListener('click', () => {
    if (timer) { clearInterval(timer); timer = null; }
    $('ltn-play').style.display = 'none';
    $('ltn-setup').style.display = '';
    $('ltn-out').innerHTML = '<p class="muted">Đã dừng bài tập. Bấm Bắt đầu để luyện lượt mới.</p>';
  });
}
