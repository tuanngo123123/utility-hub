// Bốc câu hỏi ôn tập: giáo viên dán danh sách câu hỏi (mỗi dòng
// 1 câu, kèm đáp án sau dấu |), bấm bốc → câu hỏi hiện to; nút
// "Hiện đáp án" hé đáp án; không lặp câu đã hỏi; lưu được nhiều bộ
// câu hỏi theo tên; bốc câu hỏi + bốc tên cùng lúc ("Bạn Lan trả
// lời câu số 7") khi đã chọn lớp đã lưu.
export const meta = {
  id: 'boc-cau-hoi',
  name: 'Bốc câu hỏi ôn tập',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Bốc câu hỏi ôn tập, kiểm tra bài cũ: dán danh sách câu hỏi kèm đáp án sau dấu |, bốc ngẫu nhiên không lặp, hiện đáp án khi cần, lưu nhiều bộ câu hỏi, bốc kèm tên bạn trả lời.',
  keywords: 'bốc câu hỏi, ôn tập, kiểm tra bài cũ, câu hỏi ngẫu nhiên, bốc thăm câu hỏi, ôn bài',
  icon: '❓',
  seoTitle: 'Bốc câu hỏi ôn tập — kiểm tra bài cũ, không lặp câu hỏi',
  seoDesc: 'Bốc câu hỏi ôn tập ngẫu nhiên không lặp lại, hiện đáp án khi cần, lưu nhiều bộ câu hỏi theo tên, bốc kèm tên bạn trả lời. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span><div><h2>Bốc câu hỏi ôn tập</h2><p class="muted">Dán câu hỏi vào ô dưới (mỗi dòng 1 câu, đáp án sau dấu |), bấm bốc — câu nào đã hỏi sẽ không bốc lại trong buổi này.</p></div></div>
  <div class="gv-hero" id="bq-hero">
    <span class="gv-hero-label" id="bq-qnum">Câu —/—</span>
    <div class="gv-big" id="bq-big" style="font-size:1.8rem">Bấm "Bốc câu hỏi" để bắt đầu</div>
    <div class="gv-q-who" id="bq-who" style="display:none"></div>
    <div class="gv-q-answer" id="bq-answer" style="display:none"></div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="bq-draw">Bốc câu hỏi</button>
    <button type="button" class="btn" id="bq-show-answer" disabled>Hiện đáp án</button>
    <button type="button" class="btn" id="bq-stage">Chiếu lớp</button>
    <button type="button" class="btn btn-ghost gv-sound-btn" id="bq-sound">Âm thanh: Bật</button>
    <button type="button" class="btn btn-ghost" id="bq-reset" data-uh-reset="1">Hỏi lại từ đầu</button>
  </div>
  <div id="bq-status"></div>
  <div class="field"><label for="bq-questions">Danh sách câu hỏi (mỗi dòng 1 câu — đáp án sau dấu |)</label><textarea id="bq-questions" rows="6" placeholder="Thủ đô của Việt Nam là thành phố nào? | Hà Nội&#10;5 × 8 bằng bao nhiêu? | 40">Thủ đô của Việt Nam là thành phố nào? | Hà Nội
5 × 8 bằng bao nhiêu? | 40
Sông dài nhất Việt Nam là sông nào? | Sông Cửu Long (Mê Kông)
Từ "beautiful" trong tiếng Anh nghĩa là gì? | Đẹp
Năm 2026 là năm con gì? | Năm Bính Ngọ (ngựa)</textarea></div>
  <div class="gv-class-box">
    <h3>Bộ câu hỏi đã lưu</h3>
    <p class="muted">Lưu từng bộ theo tên ("Ôn tập chương 3", "Kiểm tra bài cũ tuần 12") để dùng lại nhiều buổi.</p>
    <div class="field"><label for="bq-set">Nạp bộ đã lưu</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <select id="bq-set" style="flex:1;min-width:140px"><option value="">— Chọn bộ câu hỏi —</option></select>
        <button type="button" class="btn" id="bq-set-load-btn">Nạp bộ</button>
        <button type="button" class="btn btn-ghost" id="bq-set-del-btn">Xóa bộ</button>
      </div>
    </div>
    <div class="field"><label for="bq-set-name">Lưu danh sách trên thành bộ mới</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="bq-set-name" type="text" placeholder="Ví dụ: Ôn tập chương 3" autocomplete="off" style="flex:1;min-width:140px">
        <button type="button" class="btn" id="bq-set-save-btn">Lưu bộ</button>
      </div>
    </div>
    <p class="note" id="bq-set-msg" style="display:none"></p>
  </div>
  <div class="field"><label for="bq-class">Bốc kèm tên bạn trả lời <span class="muted">(không bắt buộc — lớp lưu trong công cụ Gọi tên)</span></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <select id="bq-class" style="flex:1;min-width:140px"><option value="">— Không bốc tên —</option></select>
      <label style="display:flex;gap:6px;align-items:center;white-space:nowrap"><input type="checkbox" id="bq-with-name"> Bốc tên cùng lúc</label>
    </div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const SETS_KEY = 'uh_gv_cauhoi';
  const ASKED_KEY = 'uh_gv_cauhoi_asked';
  let asked = []; // chỉ số câu đã hỏi trong danh sách hiện tại
  let pickedNames = []; // tên đã bốc trong buổi này (không lặp)
  let currentSet = null; // tên bộ đang nạp (null = danh sách dán tay)
  let currentQ = -1;
  let stageOpen = false;
  let stageEl = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gvSound() {
    return (typeof window !== 'undefined' && window.UhGvSound) ? window.UhGvSound : null;
  }
  function tick() { const s = gvSound(); if (s) s.tick(); }

  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  // Mỗi dòng 1 câu; đáp án (nếu có) sau dấu | đầu tiên.
  function parseQuestions(text) {
    const seen = {};
    const out = [];
    String(text == null ? '' : text).split(/\n+/).forEach(line => {
      const t = String(line).trim();
      if (!t) return;
      const bar = t.indexOf('|');
      const q = (bar === -1 ? t : t.slice(0, bar)).trim();
      const a = bar === -1 ? '' : t.slice(bar + 1).trim();
      if (!q) return;
      if (seen[q]) return;
      seen[q] = true;
      out.push({ q, a });
    });
    return out;
  }

  function questions() {
    return parseQuestions($('bq-questions').value);
  }

  function loadSets() {
    try {
      const raw = localStorage.getItem(SETS_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      const clean = {};
      Object.keys(data).forEach(k => {
        if (!Array.isArray(data[k])) return;
        const list = data[k].filter(item => item && typeof item.q === 'string' && item.q.trim());
        if (k.trim() && list.length) clean[k.trim()] = list;
      });
      return clean;
    } catch (e) { return {}; }
  }

  function saveSets(map) {
    try { localStorage.setItem(SETS_KEY, JSON.stringify(map)); } catch (e) { /* bỏ qua */ }
  }

  function loadAsked() {
    try {
      const raw = localStorage.getItem(ASKED_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
    } catch (e) { return {}; }
  }

  function saveAsked(map) {
    try { localStorage.setItem(ASKED_KEY, JSON.stringify(map)); } catch (e) { /* bỏ qua */ }
  }

  function persistAsked() {
    if (!currentSet) return;
    const map = loadAsked();
    map[currentSet] = asked.slice();
    saveAsked(map);
  }

  function setMsg(text) {
    const el = $('bq-set-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function refreshSetSelect() {
    const sel = $('bq-set');
    const map = loadSets();
    const names = Object.keys(map).sort();
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Chọn bộ câu hỏi —</option>'
      + names.map(n => '<option value="' + esc(n) + '">' + esc(n) + ' (' + map[n].length + ' câu)</option>').join('');
    if (cur && map[cur]) sel.value = cur;
  }

  function updateStatus() {
    const list = questions();
    const el = $('bq-status');
    if (!list.length) { el.innerHTML = ''; return; }
    el.innerHTML = '<p><strong>Đã hỏi: ' + asked.length + '/' + list.length + ' câu</strong></p>'
      + (asked.length ? '<div class="gv-chips">' + asked.map(i => '<span class="gv-chip">Câu ' + (i + 1) + '</span>').join('') + '</div>' : '');
  }

  function resetAsked() {
    asked = [];
    pickedNames = [];
    currentQ = -1;
    $('bq-qnum').textContent = 'Câu —/—';
    $('bq-big').textContent = 'Bấm "Bốc câu hỏi" để bắt đầu';
    $('bq-big').style.fontSize = '1.8rem';
    $('bq-who').style.display = 'none';
    $('bq-answer').style.display = 'none';
    $('bq-show-answer').disabled = true;
    persistAsked();
    updateStatus();
    updateStage();
  }

  function pickName() {
    const helper = gvClasses();
    const cls = $('bq-class').value;
    if (!helper || !cls) return '';
    const names = helper.get(cls).filter(n => pickedNames.indexOf(n) === -1);
    const pool = names.length ? names : helper.get(cls);
    if (!pool.length) return '';
    if (!names.length) pickedNames = [];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    pickedNames.push(pick);
    return pick;
  }

  function draw() {
    const list = questions();
    if (!list.length) {
      $('bq-big').textContent = 'Danh sách đang trống — dán câu hỏi vào ô dưới nhé.';
      return;
    }
    const remaining = list.map((_, i) => i).filter(i => asked.indexOf(i) === -1);
    if (!remaining.length) {
      $('bq-big').textContent = 'Đã hỏi hết các câu — bấm "Hỏi lại từ đầu" để hỏi vòng mới.';
      return;
    }
    const idx = remaining[Math.floor(Math.random() * remaining.length)];
    asked.push(idx);
    currentQ = idx;
    persistAsked();
    $('bq-qnum').textContent = 'Câu ' + (idx + 1) + '/' + list.length + (currentSet ? ' · ' + currentSet : '');
    $('bq-big').textContent = list[idx].q;
    $('bq-big').style.fontSize = '';
    $('bq-answer').style.display = 'none';
    $('bq-show-answer').disabled = false;
    const who = $('bq-with-name').checked ? pickName() : '';
    if (who) {
      $('bq-who').textContent = 'Bạn ' + who + ' trả lời câu này';
      $('bq-who').style.display = '';
    } else {
      $('bq-who').style.display = 'none';
      if ($('bq-with-name').checked) setMsg('Chưa chọn lớp nên chỉ bốc câu hỏi — chọn lớp ở ô dưới để bốc kèm tên.');
    }
    tick();
    updateStatus();
    updateStage();
  }

  $('bq-draw').addEventListener('click', draw);

  $('bq-show-answer').addEventListener('click', () => {
    const list = questions();
    if (currentQ < 0 || !list[currentQ]) return;
    const a = list[currentQ].a;
    const box = $('bq-answer');
    box.innerHTML = '<strong>Đáp án:</strong> ' + (a ? esc(a) : 'Câu này không có đáp án kèm theo.');
    box.style.display = '';
    $('bq-show-answer').disabled = true;
    tick();
    updateStage();
  });

  $('bq-reset').addEventListener('click', resetAsked);

  $('bq-questions').addEventListener('input', () => {
    // Danh sách đổi thì vòng hỏi cũ không còn đúng nữa.
    currentSet = null;
    resetAsked();
  });

  $('bq-set-load-btn').addEventListener('click', () => {
    const name = $('bq-set').value;
    const map = loadSets();
    if (!name || !map[name]) { setMsg('Chọn một bộ câu hỏi đã lưu trước đã nhé.'); return; }
    $('bq-questions').value = map[name].map(item => item.q + (item.a ? ' | ' + item.a : '')).join('\n');
    currentSet = name;
    const saved = loadAsked()[name];
    asked = Array.isArray(saved) ? saved.filter(i => typeof i === 'number' && i < map[name].length) : [];
    pickedNames = [];
    currentQ = -1;
    $('bq-qnum').textContent = 'Câu —/—';
    $('bq-big').textContent = 'Bấm "Bốc câu hỏi" để bắt đầu';
    $('bq-who').style.display = 'none';
    $('bq-answer').style.display = 'none';
    $('bq-show-answer').disabled = true;
    updateStatus();
    updateStage();
    setMsg('Đã nạp bộ "' + name + '" (' + map[name].length + ' câu)' + (asked.length ? ' — đã hỏi ' + asked.length + ' câu trước đó, không bốc lại.' : '.'));
  });

  $('bq-set-save-btn').addEventListener('click', () => {
    const name = $('bq-set-name').value.trim();
    const list = questions();
    if (!name) { setMsg('Gõ tên bộ câu hỏi trước đã nhé (ví dụ: Ôn tập chương 3).'); return; }
    if (!list.length) { setMsg('Danh sách đang trống — dán câu hỏi vào ô trên trước đã nhé.'); return; }
    const map = loadSets();
    const existed = !!map[name];
    map[name] = list;
    saveSets(map);
    currentSet = name;
    refreshSetSelect();
    $('bq-set').value = name;
    setMsg(existed ? 'Đã cập nhật bộ "' + name + '" (' + list.length + ' câu).' : 'Đã lưu bộ "' + name + '" (' + list.length + ' câu).');
  });

  let delArmed = false;
  let delTimer = null;
  $('bq-set-del-btn').addEventListener('click', () => {
    const name = $('bq-set').value;
    const btn = $('bq-set-del-btn');
    if (!name) { setMsg('Chọn một bộ câu hỏi đã lưu trước đã nhé.'); return; }
    if (!delArmed) {
      delArmed = true;
      btn.textContent = 'Bấm lại để xóa';
      delTimer = setTimeout(() => {
        delArmed = false;
        btn.textContent = 'Xóa bộ';
      }, 3000);
      return;
    }
    clearTimeout(delTimer);
    delArmed = false;
    btn.textContent = 'Xóa bộ';
    const map = loadSets();
    delete map[name];
    saveSets(map);
    const askedMap = loadAsked();
    delete askedMap[name];
    saveAsked(askedMap);
    if (currentSet === name) currentSet = null;
    refreshSetSelect();
    setMsg('Đã xóa bộ "' + name + '".');
  });

  // Nạp danh sách lớp đã lưu cho ô bốc kèm tên.
  (function initClassSelect() {
    const helper = gvClasses();
    if (!helper) return;
    const map = helper.list();
    const sel = $('bq-class');
    Object.keys(map).sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
  })();

  // --- Chế độ Chiếu lớp ---
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="bq-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub">Bốc câu hỏi ôn tập</div>'
      + '<div class="gv-stage-sub" id="bq-stage-qnum"></div>'
      + '<div class="gv-stage-big" id="bq-stage-big" style="font-size:clamp(1.8rem,6vw,3.2rem)">—</div>'
      + '<div class="gv-stage-sub" id="bq-stage-who"></div>'
      + '<div class="gv-stage-sub" id="bq-stage-answer" style="color:#fde047"></div>'
      + '<div class="gv-stage-actions"><button type="button" class="btn btn-primary" id="bq-stage-draw">Bốc tiếp</button><button type="button" class="btn" id="bq-stage-answer-btn">Hiện đáp án</button></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#bq-stage-close').addEventListener('click', closeStage);
    stageEl.querySelector('#bq-stage-draw').addEventListener('click', () => draw());
    stageEl.querySelector('#bq-stage-answer-btn').addEventListener('click', () => {
      const btn = $('bq-show-answer');
      if (!btn.disabled) btn.click();
    });
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const list = questions();
    const qnum = stageEl.querySelector('#bq-stage-qnum');
    const big = stageEl.querySelector('#bq-stage-big');
    const who = stageEl.querySelector('#bq-stage-who');
    const ans = stageEl.querySelector('#bq-stage-answer');
    if (currentQ < 0 || !list[currentQ]) {
      qnum.textContent = '';
      big.textContent = '—';
      who.textContent = 'Chưa bốc câu hỏi nào';
      ans.textContent = '';
      return;
    }
    qnum.textContent = 'Câu ' + (currentQ + 1) + '/' + list.length;
    big.textContent = list[currentQ].q;
    const whoEl = $('bq-who');
    who.textContent = whoEl.style.display !== 'none' ? whoEl.textContent : '';
    const ansEl = $('bq-answer');
    ans.textContent = ansEl.style.display !== 'none' ? ansEl.textContent : '';
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

  $('bq-stage').addEventListener('click', openStage);

  (function initSoundBtn() {
    const btn = $('bq-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();

  refreshSetSelect();
  updateStatus();
}
