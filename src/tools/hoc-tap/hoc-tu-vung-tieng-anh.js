// Học từ vựng tiếng Anh: 400 từ thông dụng nhất, nghĩa tiếng Việt.
// 3 chế độ: thẻ từ (flashcard + phát âm), gõ từ theo nghĩa, trắc nghiệm.
// Tiến độ (từ đã nhớ theo từng chế độ) lưu localStorage.
export const meta = {
  id: 'hoc-tu-vung-tieng-anh',
  name: 'Học từ vựng tiếng Anh',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Học 400 từ tiếng Anh thông dụng nhất với nghĩa tiếng Việt: thẻ từ có phát âm, gõ từ theo nghĩa, trắc nghiệm 4 lựa chọn. Tiến độ được lưu lại trên trình duyệt.',
  keywords: 'học từ vựng tiếng anh, học tiếng anh, từ vựng tiếng anh, flashcard tiếng anh, học từ mới, từ vựng ielts toefl',
  icon: '📖',
  seoTitle: 'Học từ vựng tiếng Anh — 400 từ thông dụng, thẻ từ & trắc nghiệm',
  seoDesc: 'Học 400 từ tiếng Anh thông dụng nhất ngay trên web: nghĩa tiếng Việt, ví dụ, phát âm, 3 chế độ thẻ từ, gõ từ và trắc nghiệm. Không cần cài đặt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">400 từ tiếng Anh thông dụng nhất, xếp theo tần suất dùng — từ hay gặp trước. Mỗi từ có nghĩa tiếng Việt, loại từ và ví dụ kèm dịch. Chọn bộ từ, chọn chế độ học, tiến độ được lưu lại trên trình duyệt của bạn.</p>
  </div>
  <div class="field">
    <label>Bộ từ học</label>
    <div class="tabs" id="tv-set-tabs">
      <button type="button" class="tab tab-active" data-set="100">100 từ đầu</button>
      <button type="button" class="tab" data-set="300">300 từ đầu</button>
      <button type="button" class="tab" data-set="0" id="tv-set-all">Tất cả</button>
    </div>
  </div>
  <div class="field tv-progress">
    <div class="tv-progress-top"><span id="tv-progress-text">Đã học 0/100 từ</span><span id="tv-progress-pct">0%</span></div>
    <div class="tv-bar"><div class="tv-bar-fill" id="tv-progress-fill"></div></div>
    <div class="tv-session" id="tv-session"><span class="tv-pill tv-pill-ok">✓ 0 đúng</span><span class="tv-pill tv-pill-bad">✗ 0 sai</span></div>
  </div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="tv-mode-flash">Thẻ từ</button>
    <button type="button" class="tab" id="tv-mode-type">Gõ từ</button>
    <button type="button" class="tab" id="tv-mode-quiz">Trắc nghiệm</button>
  </div>
  <div id="tv-loading"><p class="note">Đang tải bộ từ…</p></div>
  <div id="tv-panel-flash" class="tab-panel" hidden></div>
  <div id="tv-panel-type" class="tab-panel" hidden></div>
  <div id="tv-panel-quiz" class="tab-panel" hidden></div>
  <p class="note" id="tv-speak-note" hidden></p>
  <button type="button" class="btn btn-ghost" id="tv-reset" data-uh-reset="1">Đặt lại tiến độ</button>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const KEY = 'uh_tuvung_tiendo';

  let allWords = [];
  let setSize = 100; // 100 | 300 | 0 = tất cả
  let mode = 'flash';
  let remembered = { flash: new Set(), type: new Set(), quiz: new Set() };
  let session = { dung: 0, sai: 0 };
  let queues = { flash: [], type: [], quiz: [] };
  let qi = { flash: 0, type: 0, quiz: 0 };
  let current = { flash: null, type: null, quiz: null };
  let flashRevealed = false;
  let typeWrong = 0;
  let typeDone = false;
  let quizAnswered = false;
  let quizOptions = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.set === 100 || p.set === 300 || p.set === 0) setSize = p.set;
      if (p.remembered) {
        for (const m of ['flash', 'type', 'quiz']) {
          if (Array.isArray(p.remembered[m])) remembered[m] = new Set(p.remembered[m]);
        }
      }
    } catch (e) { /* localStorage không khả dụng — học bình thường, không lưu */ }
  }

  function saveProgress() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        set: setSize,
        remembered: {
          flash: Array.from(remembered.flash),
          type: Array.from(remembered.type),
          quiz: Array.from(remembered.quiz),
        },
      }));
    } catch (e) { /* bỏ qua */ }
  }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function currentSet() {
    return setSize === 0 ? allWords : allWords.slice(0, setSize);
  }

  function rebuildQueues() {
    const set = currentSet();
    queues = { flash: shuffled(set), type: shuffled(set), quiz: shuffled(set) };
    qi = { flash: 0, type: 0, quiz: 0 };
    current = { flash: null, type: null, quiz: null };
  }

  function advance(m) {
    if (qi[m] >= queues[m].length) {
      queues[m] = shuffled(currentSet());
      qi[m] = 0;
    }
    current[m] = queues[m][qi[m]];
    qi[m]++;
    return current[m];
  }

  function updateProgress() {
    const set = currentSet();
    let n = 0;
    for (const w of set) if (remembered[mode].has(w.w)) n++;
    const pct = set.length ? Math.round(n / set.length * 100) : 0;
    $('tv-progress-text').textContent = 'Đã học ' + n + '/' + set.length + ' từ';
    $('tv-progress-pct').textContent = pct + '%';
    $('tv-progress-fill').style.width = pct + '%';
    $('tv-session').innerHTML = '<span class="tv-pill tv-pill-ok">✓ ' + session.dung + ' đúng</span><span class="tv-pill tv-pill-bad">✗ ' + session.sai + ' sai</span>';
  }

  function speak(text) {
    const note = $('tv-speak-note');
    function noVoice() {
      note.textContent = 'Trình duyệt này chưa có giọng đọc tiếng Anh.';
      note.hidden = false;
    }
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) { noVoice(); return; }
      const synth = window.speechSynthesis;
      const voices = synth.getVoices ? synth.getVoices() : [];
      const en = voices.find(v => /^en/i.test(v.lang || ''));
      if (voices.length > 0 && !en) { noVoice(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      if (en) u.voice = en;
      synth.cancel();
      synth.speak(u);
      note.hidden = true;
    } catch (e) { noVoice(); }
  }

  // ---- Chế độ 1: Thẻ từ ----
  function renderFlash() {
    const w = current.flash;
    if (!w) return;
    flashRevealed = false;
    $('tv-panel-flash').innerHTML = `
<div class="result" data-uh-keep="1">
  <div class="stat"><div class="stat-num">${esc(w.w)}</div><div class="stat-label">Từ tiếng Anh — bấm "Xem nghĩa" để lật thẻ</div></div>
  <div class="btn-row">
    <button type="button" class="btn" id="tv-listen">🔊 Nghe phát âm</button>
    <button type="button" class="btn btn-primary" id="tv-reveal">Xem nghĩa</button>
  </div>
  <div id="tv-flash-meaning"></div>
</div>`;
    $('tv-listen').addEventListener('click', () => speak(w.w));
    $('tv-reveal').addEventListener('click', () => {
      if (flashRevealed) return;
      flashRevealed = true;
      $('tv-flash-meaning').innerHTML = `
  <div class="result-row"><span>Loại từ</span><strong>${esc(w.pos)}</strong></div>
  <div class="result-row"><span>Nghĩa</span><strong>${esc(w.vi)}</strong></div>
  ${w.ex ? `<p><em>${esc(w.ex)}</em>${w.exvi ? `<br><span class="muted">${esc(w.exvi)}</span>` : ''}</p>` : ''}
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="tv-remembered">Đã nhớ ✓</button>
    <button type="button" class="btn" id="tv-notyet">Chưa nhớ</button>
  </div>`;
      $('tv-remembered').addEventListener('click', () => {
        remembered.flash.add(w.w);
        saveProgress();
        advance('flash');
        renderFlash();
        updateProgress();
      });
      $('tv-notyet').addEventListener('click', () => {
        advance('flash');
        renderFlash();
        updateProgress();
      });
    });
  }

  // ---- Chế độ 2: Gõ từ ----
  function renderType() {
    const w = current.type;
    if (!w) return;
    typeWrong = 0;
    typeDone = false;
    const first = w.w.charAt(0);
    $('tv-panel-type').innerHTML = `
<div class="result" data-uh-keep="1">
  <div class="stat"><div class="stat-num" style="font-size:1.6rem">${esc(w.vi)}</div><div class="stat-label">Gõ từ tiếng Anh cho nghĩa này · Gợi ý: chữ cái đầu "${esc(first)}" · ${w.w.length} chữ cái</div></div>
  <div class="field"><label for="tv-type-input">Từ tiếng Anh</label><input id="tv-type-input" type="text" placeholder="Gõ từ tiếng Anh…" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
  <button type="button" class="btn btn-primary" id="tv-type-check">Kiểm tra</button>
  <div id="tv-type-feedback"></div>
</div>`;
    const input = $('tv-type-input');
    const feedback = $('tv-type-feedback');
    function check() {
      if (typeDone) return;
      const v = input.value.trim().toLowerCase();
      if (!v) { feedback.innerHTML = '<p class="error">Bạn chưa gõ gì cả — thử gõ từ tiếng Anh xem nào.</p>'; return; }
      if (v === w.w.toLowerCase()) {
        typeDone = true;
        session.dung++;
        remembered.type.add(w.w);
        saveProgress();
        feedback.innerHTML = '<p>✓ Đúng rồi! <strong>' + esc(w.w) + '</strong> — ' + esc(w.vi) + '</p>';
        input.disabled = true;
        $('tv-type-check').disabled = true;
        updateProgress();
        setTimeout(() => { advance('type'); renderType(); }, 800);
      } else {
        typeWrong++;
        session.sai++;
        updateProgress();
        if (typeWrong >= 2) {
          typeDone = true;
          feedback.innerHTML = '<p class="error">Chưa đúng. Đáp án là: <strong>' + esc(w.w) + '</strong> — ' + esc(w.vi) + '</p><p><button type="button" class="btn btn-primary" id="tv-type-next">Từ tiếp →</button></p>';
          input.disabled = true;
          $('tv-type-check').disabled = true;
          $('tv-type-next').addEventListener('click', () => { advance('type'); renderType(); });
        } else {
          feedback.innerHTML = '<p class="error">✗ Chưa đúng — thử lại lần nữa nhé (sai 2 lần sẽ hiện đáp án).</p>';
          input.select();
          input.focus();
        }
      }
    }
    $('tv-type-check').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    input.focus();
  }

  // ---- Chế độ 3: Trắc nghiệm ----
  function renderQuiz() {
    const w = current.quiz;
    if (!w) return;
    quizAnswered = false;
    const set = currentSet();
    const pool = [];
    const seenVi = {};
    seenVi[w.vi] = true;
    for (const o of set) {
      if (o.w === w.w) continue;
      if (seenVi[o.vi]) continue;
      seenVi[o.vi] = true;
      pool.push(o);
    }
    quizOptions = shuffled([w].concat(shuffled(pool).slice(0, 3)));
    $('tv-panel-quiz').innerHTML = `
<div class="result" data-uh-keep="1">
  <div class="stat"><div class="stat-num">${esc(w.w)}</div><div class="stat-label">Chọn nghĩa đúng của từ này</div></div>
  <div id="tv-quiz-options" style="display:grid;gap:10px"></div>
  <div id="tv-quiz-feedback"></div>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="tv-quiz-next" hidden>Câu tiếp →</button></div>
</div>`;
    const box = $('tv-quiz-options');
    const feedback = $('tv-quiz-feedback');
    quizOptions.forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.style.width = '100%';
      b.style.justifyContent = 'flex-start';
      b.style.textAlign = 'left';
      b.textContent = opt.vi;
      b.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;
        const ok = opt.w === w.w;
        if (ok) {
          session.dung++;
          remembered.quiz.add(w.w);
          saveProgress();
          feedback.innerHTML = '<p>✓ Đúng rồi!</p>';
        } else {
          session.sai++;
          feedback.innerHTML = '<p class="error">✗ Chưa đúng. Đáp án đúng là: <strong>' + esc(w.vi) + '</strong></p>';
        }
        updateProgress();
        const btns = box.querySelectorAll('button');
        btns.forEach((btn, j) => {
          btn.disabled = true;
          btn.style.opacity = '1'; // .btn:disabled mờ 0.55 làm mờ cả màu đúng/sai
          if (quizOptions[j].w === w.w) {
            btn.style.background = '#dcfce7';
            btn.style.borderColor = '#16a34a';
            btn.textContent = '✓ ' + quizOptions[j].vi;
          } else if (j === i && !ok) {
            btn.style.background = '#fee2e2';
            btn.style.borderColor = '#dc2626';
            btn.textContent = '✗ ' + quizOptions[j].vi;
          }
        });
        $('tv-quiz-next').hidden = false;
      });
      box.appendChild(b);
    });
    $('tv-quiz-next').addEventListener('click', () => { advance('quiz'); renderQuiz(); });
  }

  function renderMode() {
    if (mode === 'flash') { if (!current.flash) advance('flash'); renderFlash(); }
    if (mode === 'type') { if (!current.type) advance('type'); renderType(); }
    if (mode === 'quiz') { if (!current.quiz) advance('quiz'); renderQuiz(); }
    updateProgress();
  }

  function showMode(m) {
    mode = m;
    for (const k of ['flash', 'type', 'quiz']) {
      $('tv-mode-' + k).classList.toggle('tab-active', k === m);
      $('tv-panel-' + k).hidden = k !== m;
    }
    renderMode();
  }

  function setSetSize(n) {
    setSize = n;
    saveProgress();
    rebuildQueues();
    for (const btn of root.querySelectorAll('#tv-set-tabs .tab')) {
      btn.classList.toggle('tab-active', parseInt(btn.getAttribute('data-set'), 10) === n);
    }
    renderMode();
  }

  for (const btn of root.querySelectorAll('#tv-set-tabs .tab')) {
    btn.addEventListener('click', () => setSetSize(parseInt(btn.getAttribute('data-set'), 10)));
  }
  $('tv-mode-flash').addEventListener('click', () => showMode('flash'));
  $('tv-mode-type').addEventListener('click', () => showMode('type'));
  $('tv-mode-quiz').addEventListener('click', () => showMode('quiz'));
  $('tv-reset').addEventListener('click', () => {
    remembered = { flash: new Set(), type: new Set(), quiz: new Set() };
    session = { dung: 0, sai: 0 };
    saveProgress();
    rebuildQueues();
    renderMode();
  });

  loadProgress();
  for (const btn of root.querySelectorAll('#tv-set-tabs .tab')) {
    btn.classList.toggle('tab-active', parseInt(btn.getAttribute('data-set'), 10) === setSize);
  }

  fetch('/data/tu-vung-tieng-anh.json', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      allWords = Array.isArray(data) ? data : [];
      if (!allWords.length) throw new Error('empty');
      $('tv-set-all').textContent = 'Tất cả (' + allWords.length + ' từ)';
      $('tv-loading').hidden = true;
      $('tv-panel-flash').hidden = false;
      rebuildQueues();
      renderMode();
    })
    .catch(() => {
      $('tv-loading').innerHTML = '<p class="error">Không tải được bộ từ. Kiểm tra kết nối mạng rồi tải lại trang nhé.</p>';
    });
}
