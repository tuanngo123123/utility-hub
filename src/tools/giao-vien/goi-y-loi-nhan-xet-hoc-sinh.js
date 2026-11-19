// Gợi ý lời nhận xét học sinh: chọn học sinh + môn + mức kết quả
// + điểm mạnh/cần cải thiện → gợi ý 3–5 lời nhận xét từ ngân hàng
// viết sẵn theo TT22, bấm để ghép vào ô soạn, sửa trực tiếp rồi
// chép hoặc lưu theo từng học sinh. Ngân hàng lời ở
// src/nhan-xet-logic.js (build chèn vào trang qua window.UH_NHANXET;
// bộ kiểm scripts/test-nhan-xet.mjs kiểm cùng file đó nên lời trên
// trang và trong test là một).
export const meta = {
  id: 'goi-y-loi-nhan-xet-hoc-sinh',
  name: 'Gợi ý lời nhận xét học sinh',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Chọn môn, mức Tốt/Khá/Đạt/Chưa đạt và điểm mạnh — nhận 3–5 lời nhận xét để ghép, sửa và chép cho học bạ.',
  keywords: 'nhận xét học sinh, lời nhận xét, nhận xét học bạ, ghi học bạ, nhận xét cuối kỳ, phê học bạ, TT22, nhận xét theo môn',
  icon: '✍️',
  seoTitle: 'Gợi ý lời nhận xét học sinh — theo môn, mức Tốt/Khá/Đạt/Chưa đạt (TT22)',
  seoDesc: 'Gợi ý lời nhận xét học sinh THCS, THPT theo Thông tư 22: chọn môn Toán, Ngữ văn, Tiếng Anh, mức kết quả và phẩm chất — nhận lời nhận xét cụ thể, có hướng khắc phục, ghép câu không trùng nhau, chép hoặc lưu theo từng học sinh.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset>
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span><div><h2>Gợi ý lời nhận xét học sinh</h2><p class="muted">Chọn học sinh, môn và mức kết quả — công cụ gợi ý lời nhận xét cụ thể theo Thông tư 22. Bấm vào lời gợi ý để thêm vào ô soạn, sửa lại cho đúng với từng em rồi chép.</p></div></div>
  <div class="field"><label for="nx-name">Học sinh</label>
    <div class="btn-row" style="margin-bottom:8px">
      <select id="nx-class-select" aria-label="Chọn lớp từ Bàn giáo viên" style="min-width:180px"></select>
      <button type="button" class="btn" id="nx-load-class">Nạp lớp này</button>
    </div>
    <div class="btn-row">
      <select id="nx-student-select" aria-label="Chọn học sinh trong lớp" style="min-width:180px"><option value="">— Chọn học sinh —</option></select>
      <input id="nx-name" type="text" autocomplete="off" placeholder="Hoặc gõ tên học sinh" style="flex:1;min-width:160px">
    </div>
    <p class="hint">Nạp lớp từ Bàn giáo viên để chọn tên nhanh; không có lớp thì gõ tên trực tiếp.</p>
  </div>
  <div class="field"><label>Môn học</label>
    <div class="nx-chips" id="nx-subjects">
      <button type="button" class="nx-chip" data-subject="toan">Toán</button>
      <button type="button" class="nx-chip" data-subject="ngu-van">Ngữ văn</button>
      <button type="button" class="nx-chip" data-subject="tieng-anh">Tiếng Anh</button>
      <button type="button" class="nx-chip" data-subject="chung">Môn chung</button>
    </div>
  </div>
  <div class="field"><label>Mức kết quả</label>
    <div class="nx-chips" id="nx-levels">
      <button type="button" class="nx-chip" data-level="tot">Tốt</button>
      <button type="button" class="nx-chip" data-level="kha">Khá</button>
      <button type="button" class="nx-chip" data-level="dat">Đạt</button>
      <button type="button" class="nx-chip" data-level="chuadat">Chưa đạt</button>
    </div>
  </div>
  <div class="field"><label>Điểm mạnh (chọn tối đa 2)</label>
    <div class="nx-chips" id="nx-strengths">
      <button type="button" class="nx-chip" data-trait="cham-chi">Chăm chỉ</button>
      <button type="button" class="nx-chip" data-trait="hop-tac">Hợp tác</button>
      <button type="button" class="nx-chip" data-trait="tu-tin">Tự tin</button>
      <button type="button" class="nx-chip" data-trait="ky-luat">Kỷ luật</button>
    </div>
  </div>
  <div class="field"><label>Điểm cần cải thiện (chọn tối đa 2)</label>
    <div class="nx-chips" id="nx-improvements">
      <button type="button" class="nx-chip" data-trait="cham-chi">Chăm chỉ</button>
      <button type="button" class="nx-chip" data-trait="hop-tac">Hợp tác</button>
      <button type="button" class="nx-chip" data-trait="tu-tin">Tự tin</button>
      <button type="button" class="nx-chip" data-trait="ky-luat">Kỷ luật</button>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="nx-suggest">Gợi ý lời nhận xét</button>
    <button type="button" class="btn" id="nx-reshuffle">Đổi gợi ý khác</button>
  </div>
  <div id="nx-suggest-wrap"></div>
  <div class="field"><label for="nx-compose">Lời nhận xét đã soạn</label>
    <textarea id="nx-compose" rows="5" placeholder="Bấm vào lời gợi ý ở trên để thêm vào đây, rồi sửa lại cho đúng với từng em."></textarea>
    <p class="hint">Sửa trực tiếp trong ô này trước khi chép — lời gợi ý chỉ là khung, giáo viên là người chốt câu chữ cuối cùng.</p>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="nx-save">Lưu lời này cho em</button>
    <button type="button" class="btn" id="nx-copy">Chép lời nhận xét</button>
  </div>
  <p class="note" id="nx-msg" style="display:none"></p>
  <div class="field"><label>Lời đã soạn (lưu trên trình duyệt này)</label>
    <div id="nx-saved"></div>
    <div class="btn-row" style="margin-top:10px">
      <button type="button" class="btn" id="nx-copy-all">Chép tất cả đã chọn</button>
      <button type="button" class="btn btn-ghost" id="nx-forget-used">Quên các câu đã dùng</button>
    </div>
    <p class="hint">Đánh dấu vào ô vuông để chọn lời cần chép. Công cụ tránh gợi ý lại câu đã dùng cho học sinh khác để cả lớp không bị trùng câu; bấm "Quên các câu đã dùng" để gợi ý lại từ đầu.</p>
  </div>
  <p class="note">Lời nhận xét theo Thông tư 22/2021/TT-BGDĐT: nêu sự tiến bộ, ưu điểm nổi bật và hạn chế chủ yếu của học sinh; lời mức Chưa đạt luôn kèm hướng khắc phục cụ thể. Mức kết quả Tốt/Khá/Đạt/Chưa đạt theo khoản 2 Điều 9 Thông tư 22.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const S = (typeof window !== 'undefined' && window.UH_NHANXET) ? window.UH_NHANXET : null;
  const U = (typeof window !== 'undefined' && window.UH) ? window.UH : {};
  if (!S) {
    $('nx-suggest-wrap').innerHTML = '<p class="note">Công cụ chưa tải đủ — tải lại trang rồi thử lại.</p>';
    return;
  }
  const KEY = 'uh_nhanxet_hs';
  let subject = 'toan';
  let level = 'kha';
  let strengths = [];
  let improvements = [];
  let currentClass = '';
  let currentDisplay = '';
  let suggestions = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function toast(msg) {
    if (U.toast) U.toast(msg);
    else setMsg(msg);
  }
  function copyText(str) {
    if (U.copyText) return U.copyText(str);
    return new Promise((resolve) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        resolve(ok);
      } catch (e) { resolve(false); }
    });
  }
  function setMsg(text) {
    const el = $('nx-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }
  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  // --- Lưu trữ: lời đã soạn theo học sinh + câu đã dùng ---
  function loadStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { entries: {}, used: [] };
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return { entries: {}, used: [] };
      if (!data.entries || typeof data.entries !== 'object') data.entries = {};
      if (!Array.isArray(data.used)) data.used = [];
      return data;
    } catch (e) { return { entries: {}, used: [] }; }
  }
  function saveStore(store) {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* bỏ qua */ }
  }
  function entryKey(className, displayName) {
    return String(className || '') + '|' + String(displayName || '');
  }
  function studentName() {
    return $('nx-name').value.trim();
  }

  // --- Chip chọn môn/mức/phẩm chất ---
  function paintChips() {
    root.querySelectorAll('#nx-subjects .nx-chip').forEach((b) => {
      const on = b.getAttribute('data-subject') === subject;
      b.classList.toggle('nx-chip-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    root.querySelectorAll('#nx-levels .nx-chip').forEach((b) => {
      const on = b.getAttribute('data-level') === level;
      b.classList.toggle('nx-chip-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    root.querySelectorAll('#nx-strengths .nx-chip').forEach((b) => {
      const on = strengths.indexOf(b.getAttribute('data-trait')) >= 0;
      b.classList.toggle('nx-chip-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    root.querySelectorAll('#nx-improvements .nx-chip').forEach((b) => {
      const on = improvements.indexOf(b.getAttribute('data-trait')) >= 0;
      b.classList.toggle('nx-chip-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function toggleTrait(list, trait, label) {
    const i = list.indexOf(trait);
    if (i >= 0) list.splice(i, 1);
    else if (list.length >= 2) toast('Chỉ chọn tối đa 2 ' + label + '.');
    else list.push(trait);
  }

  // --- Gợi ý ---
  function runSuggest() {
    const store = loadStore();
    suggestions = S.suggest({
      subject, level, strengths, improvements,
      used: new Set(store.used || []),
    });
    renderSuggestions();
  }
  function renderSuggestions() {
    const wrap = $('nx-suggest-wrap');
    const name = studentName();
    if (!suggestions.length) {
      wrap.innerHTML = '';
      return;
    }
    wrap.innerHTML = '<div class="field"><label>Gợi ý cho em — bấm vào lời để thêm vào ô soạn</label>'
      + suggestions.map((s, i) => (
        '<button type="button" class="nx-sugg' + (s.added ? ' nx-sugg-added' : '') + '" data-idx="' + i + '">'
        + '<span class="nx-sugg-kind">' + esc(s.label) + '</span>'
        + '<span class="nx-sugg-text">' + esc(S.fillName(s.text, name)) + '</span>'
        + '<span class="nx-sugg-add">' + (s.added ? 'Đã thêm ✓' : '+ Thêm') + '</span>'
        + '</button>'
      )).join('')
      + '</div>';
    wrap.querySelectorAll('.nx-sugg').forEach((b) => {
      b.addEventListener('click', () => addSuggestion(Number(b.getAttribute('data-idx'))));
    });
  }
  function addSuggestion(idx) {
    const s = suggestions[idx];
    if (!s || s.added) return;
    const name = studentName();
    const filled = S.fillName(s.text, name);
    const box = $('nx-compose');
    const cur = box.value.trim();
    if (cur.indexOf(filled) >= 0) {
      toast('Lời này đã có trong ô soạn.');
      return;
    }
    box.value = cur ? cur + ' ' + filled : filled;
    s.added = true;
    // Đánh dấu câu đã dùng để lần gợi ý sau tránh lặp cho em khác.
    const store = loadStore();
    if (store.used.indexOf(s.text) < 0) {
      store.used.push(s.text);
      saveStore(store);
    }
    renderSuggestions();
    setMsg('');
  }

  // --- Lời đã soạn ---
  function renderSaved() {
    const store = loadStore();
    const keys = Object.keys(store.entries || {}).sort((a, b) => {
      const ea = store.entries[a];
      const eb = store.entries[b];
      return (eb.updatedAt || 0) - (ea.updatedAt || 0);
    });
    const box = $('nx-saved');
    if (!keys.length) {
      box.innerHTML = '<p class="muted" style="margin:0">Chưa lưu lời nào — soạn lời cho một em rồi bấm "Lưu lời này cho em".</p>';
      return;
    }
    box.innerHTML = keys.map((k) => {
      const e = store.entries[k];
      const preview = e.text.length > 90 ? e.text.slice(0, 90) + '…' : e.text;
      const levelName = S.LEVELS[S.LEVEL_IDS.indexOf(e.level)] || e.level;
      return '<div class="nx-saved-row" data-key="' + esc(k) + '">'
        + '<label class="nx-saved-check"><input type="checkbox" class="nx-saved-cb" checked> <span class="nx-saved-name">' + esc(e.name) + '</span>'
        + '<span class="nx-saved-meta">' + esc(e.subjectName || '') + ' · ' + esc(levelName) + '</span></label>'
        + '<p class="nx-saved-text">' + esc(preview) + '</p>'
        + '<span class="nx-saved-actions"><button type="button" class="btn nx-open">Mở</button>'
        + '<button type="button" class="btn btn-ghost nx-del">Xóa</button></span>'
        + '</div>';
    }).join('');
    box.querySelectorAll('.nx-saved-row').forEach((row) => {
      const key = row.getAttribute('data-key');
      row.querySelector('.nx-open').addEventListener('click', () => openEntry(key));
      row.querySelector('.nx-del').addEventListener('click', () => {
        const st = loadStore();
        delete st.entries[key];
        saveStore(st);
        renderSaved();
        toast('Đã xóa lời đã lưu.');
      });
    });
  }
  function subjectNameById(id) {
    const found = S.SUBJECTS.find((s) => s.id === id);
    return found ? found.name : id;
  }
  function openEntry(key) {
    const store = loadStore();
    const e = store.entries[key];
    if (!e) return;
    $('nx-name').value = e.name || '';
    currentClass = e.className || '';
    currentDisplay = e.name || '';
    subject = e.subject || 'toan';
    level = e.level || 'kha';
    strengths = Array.isArray(e.strengths) ? e.strengths.slice(0, 2) : [];
    improvements = Array.isArray(e.improvements) ? e.improvements.slice(0, 2) : [];
    $('nx-compose').value = e.text || '';
    paintChips();
    runSuggest();
    toast('Đã mở lời đã soạn cho ' + (e.name || 'em') + '.');
  }

  // --- Lớp từ Bàn giáo viên ---
  function refreshClassSelect() {
    const helper = gvClasses();
    const sel = $('nx-class-select');
    if (!helper) {
      sel.innerHTML = '<option value="">Chưa có lớp nào trong Bàn giáo viên</option>';
      sel.disabled = true;
      $('nx-load-class').disabled = true;
      return;
    }
    const map = helper.list() || {};
    const names = Object.keys(map);
    if (!names.length) {
      sel.innerHTML = '<option value="">Chưa có lớp nào trong Bàn giáo viên</option>';
      return;
    }
    sel.disabled = false;
    $('nx-load-class').disabled = false;
    sel.innerHTML = names.map((n) => '<option value="' + esc(n) + '">' + esc(n) + ' (' + (map[n] || []).length + ' bạn)</option>').join('');
  }
  function loadClass() {
    const helper = gvClasses();
    if (!helper) return;
    const className = $('nx-class-select').value;
    if (!className) return;
    const names = helper.get(className) || [];
    const display = S.displayNames(names);
    const sel = $('nx-student-select');
    sel.innerHTML = '<option value="">— Chọn học sinh —</option>'
      + names.map((n, i) => '<option value="' + i + '">' + esc(display[i]) + '</option>').join('');
    sel.dataset.names = JSON.stringify(names);
    sel.dataset.display = JSON.stringify(display);
    currentClass = className;
    toast('Đã nạp lớp ' + className + ' (' + names.length + ' bạn).');
  }

  // --- Sự kiện ---
  root.querySelectorAll('#nx-subjects .nx-chip').forEach((b) => {
    b.addEventListener('click', () => { subject = b.getAttribute('data-subject'); paintChips(); });
  });
  root.querySelectorAll('#nx-levels .nx-chip').forEach((b) => {
    b.addEventListener('click', () => { level = b.getAttribute('data-level'); paintChips(); });
  });
  root.querySelectorAll('#nx-strengths .nx-chip').forEach((b) => {
    b.addEventListener('click', () => { toggleTrait(strengths, b.getAttribute('data-trait'), 'điểm mạnh'); paintChips(); });
  });
  root.querySelectorAll('#nx-improvements .nx-chip').forEach((b) => {
    b.addEventListener('click', () => { toggleTrait(improvements, b.getAttribute('data-trait'), 'điểm cần cải thiện'); paintChips(); });
  });
  $('nx-suggest').addEventListener('click', runSuggest);
  $('nx-reshuffle').addEventListener('click', runSuggest);
  $('nx-name').addEventListener('input', () => {
    currentDisplay = '';
    renderSuggestions();
  });
  $('nx-load-class').addEventListener('click', loadClass);
  $('nx-student-select').addEventListener('change', () => {
    const sel = $('nx-student-select');
    if (sel.value === '') return;
    const names = JSON.parse(sel.dataset.names || '[]');
    const display = JSON.parse(sel.dataset.display || '[]');
    const i = Number(sel.value);
    const name = names[i] || '';
    $('nx-name').value = name;
    currentDisplay = display[i] || name;
    // Em này đã có lời soạn thì mở luôn.
    const store = loadStore();
    const e = store.entries[entryKey(currentClass, currentDisplay)];
    if (e) openEntry(entryKey(currentClass, currentDisplay));
    else renderSuggestions();
  });
  $('nx-save').addEventListener('click', () => {
    const name = studentName();
    const text = $('nx-compose').value.trim();
    if (!name) { toast('Gõ tên học sinh trước khi lưu.'); $('nx-name').focus(); return; }
    if (!text) { toast('Ô soạn còn trống — thêm lời gợi ý hoặc gõ lời nhận xét trước khi lưu.'); return; }
    const store = loadStore();
    const key = entryKey(currentClass, currentDisplay || name);
    store.entries[key] = {
      name, className: currentClass, subject, level,
      strengths: strengths.slice(), improvements: improvements.slice(),
      subjectName: subjectNameById(subject), text, updatedAt: Date.now(),
    };
    saveStore(store);
    renderSaved();
    toast('Đã lưu lời nhận xét cho ' + name + '.');
  });
  $('nx-copy').addEventListener('click', () => {
    const text = $('nx-compose').value.trim();
    if (!text) { toast('Ô soạn còn trống — chưa có gì để chép.'); return; }
    copyText(text).then((ok) => toast(ok ? 'Đã chép lời nhận xét.' : 'Không chép được — thử bôi đen rồi chép tay.'));
  });
  $('nx-copy-all').addEventListener('click', () => {
    const store = loadStore();
    const rows = [];
    root.querySelectorAll('.nx-saved-row').forEach((row) => {
      if (!row.querySelector('.nx-saved-cb').checked) return;
      const e = store.entries[row.getAttribute('data-key')];
      if (e) rows.push(e.name + ': ' + e.text);
    });
    if (!rows.length) { toast('Chưa chọn lời nào để chép.'); return; }
    copyText(rows.join('\n\n')).then((ok) => toast(ok ? 'Đã chép ' + rows.length + ' lời nhận xét.' : 'Không chép được — thử bôi đen rồi chép tay.'));
  });
  $('nx-forget-used').addEventListener('click', () => {
    const store = loadStore();
    store.used = [];
    saveStore(store);
    toast('Đã quên các câu đã dùng — lần gợi ý sau bắt đầu lại từ đầu.');
  });

  // --- Mở trang: điền sẵn học sinh mẫu + gợi ý ngay ---
  $('nx-name').value = S.SAMPLE_STUDENT;
  refreshClassSelect();
  paintChips();
  renderSaved();
  runSuggest();
}
