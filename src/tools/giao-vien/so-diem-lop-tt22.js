// Sổ điểm lớp theo TT22: nhập điểm thường xuyên/giữa kỳ/cuối kỳ dạng
// bảng như Excel, tự tính ĐTB môn học kỳ + cả năm và xếp loại chung
// theo Thông tư 22/2021/TT-BGDĐT (kèm luật điều chỉnh 1 môn). Lấy
// danh sách lớp từ Bàn giáo viên hoặc dán danh sách; xuất Excel, in,
// chép bảng. Công thức ở src/so-diem-logic.js (build chèn vào trang
// qua window.UH_SODIEM; bộ kiểm scripts/test-so-diem-tt22.mjs kiểm
// cùng file đó nên điểm trên trang và trong test là một).
export const meta = {
  id: 'so-diem-lop-tt22',
  name: 'Sổ điểm lớp theo TT22',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Nhập điểm TX/GK/CK dạng bảng, tự tính ĐTB môn học kỳ + cả năm và xếp loại Tốt/Khá/Đạt/Chưa đạt theo Thông tư 22. Xuất Excel, in sổ điểm.',
  keywords: 'sổ điểm lớp, điểm trung bình môn, ĐTB, TT22, xếp loại học sinh, tính điểm trung bình, điểm học kỳ, sổ điểm TT22',
  icon: '📒',
  seoTitle: 'Sổ điểm lớp theo TT22 — tính ĐTB môn, xếp loại Tốt/Khá/Đạt/Chưa đạt',
  seoDesc: 'Sổ điểm lớp theo Thông tư 22/2021/TT-BGDĐT: nhập điểm thường xuyên, giữa kỳ, cuối kỳ dạng bảng như Excel; tự tính ĐTB môn học kỳ, cả năm và xếp loại chung kèm luật điều chỉnh 1 môn. Xuất Excel, in sổ điểm, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset>
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span><div><h2>Sổ điểm lớp theo TT22</h2><p class="muted">Nhập điểm vào bảng — ĐTB môn và xếp loại tự tính theo Thông tư 22. Điểm lưu trên trình duyệt này, tải lại trang vẫn còn.</p></div></div>
  <div class="field"><label for="sd-class-name">Tên lớp</label>
    <input id="sd-class-name" type="text" autocomplete="off" placeholder="Ví dụ: 10A1">
  </div>
  <div class="field"><label>Danh sách học sinh</label>
    <p class="muted" id="sd-class-info" style="margin:0 0 8px"></p>
    <div class="btn-row">
      <select id="sd-class-select" aria-label="Chọn lớp từ Bàn giáo viên" style="min-width:180px"></select>
      <button type="button" class="btn" id="sd-load-class">Nạp lớp này</button>
      <button type="button" class="btn" id="sd-paste-toggle">Dán danh sách học sinh</button>
      <button type="button" class="btn" id="sd-sample">Dùng lớp mẫu</button>
    </div>
    <div id="sd-paste-box" style="display:none;margin-top:10px">
      <textarea id="sd-paste" rows="6" placeholder="Mỗi dòng 1 tên học sinh.&#10;Nguyễn Văn An&#10;Trần Thị Bình&#10;…"></textarea>
      <div class="btn-row" style="margin-top:8px">
        <button type="button" class="btn btn-primary" id="sd-paste-load">Nạp danh sách đã dán</button>
      </div>
      <p class="hint">Nạp danh sách mới sẽ thay danh sách hiện tại; điểm của bạn trùng tên được giữ lại.</p>
    </div>
  </div>
  <div class="field"><label>Môn học</label>
    <div id="sd-subjects" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input id="sd-subject-name" type="text" placeholder="Tên môn, ví dụ: Tiếng Anh" autocomplete="off" style="flex:1;min-width:160px">
      <select id="sd-subject-type" aria-label="Loại môn học">
        <option value="diem">Có điểm số</option>
        <option value="nhanxet">Chỉ nhận xét</option>
      </select>
      <button type="button" class="btn btn-primary" id="sd-add-subject">Thêm môn</button>
    </div>
    <p class="hint">Môn có điểm: nhập điểm TX/GK/CK, công cụ tự tính ĐTB. Môn chỉ nhận xét (Thể dục, Nghệ thuật…): chọn Đạt/Chưa đạt từng học kỳ.</p>
  </div>
  <div class="tabs" id="sd-sem-tabs">
    <button type="button" class="tab tab-active" data-sem="h1">Học kỳ I</button>
    <button type="button" class="tab" data-sem="h2">Học kỳ II</button>
    <button type="button" class="tab" data-sem="nam">Cả năm</button>
  </div>
  <div class="field" id="sd-subject-picker"><label for="sd-subject-select">Môn đang nhập điểm</label>
    <select id="sd-subject-select"></select>
    <p class="hint" id="sd-paste-hint">Mẹo: chép bảng điểm từ Excel rồi dán vào ô đầu tiên của bảng — điểm tự chạy vào đúng ô.</p>
  </div>
  <div id="sd-grid-wrap"></div>
  <div id="sd-summary"></div>
  <div class="btn-row">
    <button type="button" class="btn" id="sd-copy">Chép bảng đang xem</button>
    <button type="button" class="btn" id="sd-print">In sổ điểm</button>
    <button type="button" class="btn" id="sd-excel">Tải Excel (.xlsx)</button>
    <button type="button" class="btn btn-ghost" id="sd-clear">Xóa hết</button>
  </div>
  <p class="note" id="sd-msg" style="display:none"></p>
  <p class="note">ĐTB môn học kỳ = (tổng điểm TX + 2 × GK + 3 × CK) / (số điểm TX + 5); ĐTB cả năm = (ĐTB kỳ I + 2 × ĐTB kỳ II) / 3; làm tròn 1 chữ số thập phân. Xếp loại chung và luật điều chỉnh 1 môn theo Điều 9 Thông tư 22/2021/TT-BGDĐT.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const S = (typeof window !== 'undefined' && window.UH_SODIEM) ? window.UH_SODIEM : null;
  const U = (typeof window !== 'undefined' && window.UH) ? window.UH : {};
  if (!S) {
    $('sd-grid-wrap').innerHTML = '<p class="note">Công cụ chưa tải đủ — tải lại trang rồi thử lại.</p>';
    return;
  }
  const KEY = 'uh_sodiem_tt22';
  const SCORE_FIELDS = ['tx0', 'tx1', 'tx2', 'tx3', 'gk', 'ck'];
  const FIELD_LABELS = { tx0: 'TX1', tx1: 'TX2', tx2: 'TX3', tx3: 'TX4', gk: 'GK', ck: 'CK' };
  let state = null;
  let activeSem = 'h1'; // 'h1' | 'h2' | 'nam'
  let activeSubjectId = null;
  let xlsxPromise = null;
  let saveTimer = null;

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
    const el = $('sd-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }
  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  // --- Trạng thái: nạp/lưu + lớp mẫu ---
  let idCounter = 0;
  function nextId(prefix) {
    idCounter += 1;
    return prefix + Date.now().toString(36) + '-' + idCounter;
  }
  function emptyCell(type) {
    return type === 'nhanxet' ? { nx: null } : { tx: [null, null, null, null], gk: null, ck: null };
  }
  function sampleState() {
    const students = S.SAMPLE.students.map((name, i) => ({ id: 's' + (i + 1), name }));
    const subjects = S.SAMPLE.subjects.map((s, i) => ({ id: 'm' + (i + 1), name: s.name, type: s.type }));
    const scores = {};
    students.forEach((st, i) => {
      scores[st.id] = {};
      subjects.forEach((sub, j) => {
        const src = S.SAMPLE.scores[i][j];
        scores[st.id][sub.id] = {
          h1: JSON.parse(JSON.stringify(src.h1)),
          h2: JSON.parse(JSON.stringify(src.h2)),
        };
      });
    });
    return { className: S.SAMPLE.className, students, subjects, scores };
  }
  function validState(v) {
    return v && Array.isArray(v.students) && Array.isArray(v.subjects)
      && v.students.every((s) => s && typeof s.id === 'string' && typeof s.name === 'string')
      && v.subjects.every((s) => s && typeof s.id === 'string' && typeof s.name === 'string' && (s.type === 'diem' || s.type === 'nhanxet'));
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return sampleState();
      const data = JSON.parse(raw);
      if (!validState(data)) return sampleState();
      if (!data.scores || typeof data.scores !== 'object') data.scores = {};
      if (typeof data.className !== 'string') data.className = '';
      return data;
    } catch (e) { return sampleState(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* bỏ qua */ }
  }
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }

  // --- Truy vấn điểm ---
  function subjectById(id) {
    return state.subjects.find((s) => s.id === id) || null;
  }
  function getCell(studentId, subjectId, sem) {
    const sub = subjectById(subjectId);
    if (!sub) return null;
    if (!state.scores[studentId]) state.scores[studentId] = {};
    if (!state.scores[studentId][subjectId]) {
      state.scores[studentId][subjectId] = { h1: emptyCell(sub.type), h2: emptyCell(sub.type) };
    }
    const holder = state.scores[studentId][subjectId];
    if (!holder[sem]) holder[sem] = emptyCell(sub.type);
    return holder[sem];
  }
  // ĐTB 1 môn 1 học kỳ của 1 bạn (null = chưa đủ điểm).
  function dtbOf(studentId, subjectId, sem) {
    const sub = subjectById(subjectId);
    if (!sub || sub.type !== 'diem') return null;
    const c = getCell(studentId, subjectId, sem);
    if (!c) return null;
    return S.dtbHocKy(c.tx || [], c.gk, c.ck);
  }
  function dtbYearOf(studentId, subjectId) {
    return S.dtbCaNam(dtbOf(studentId, subjectId, 'h1'), dtbOf(studentId, subjectId, 'h2'));
  }
  // Kết quả môn nhận xét 1 học kỳ / cả năm (cả năm Đạt nếu kỳ II Đạt).
  function nxOf(studentId, subjectId, sem) {
    const sub = subjectById(subjectId);
    if (!sub || sub.type !== 'nhanxet') return null;
    if (sem === 'nam') {
      const c2 = getCell(studentId, subjectId, 'h2');
      return c2 ? c2.nx : null;
    }
    const c = getCell(studentId, subjectId, sem);
    return c ? c.nx : null;
  }
  // Xếp loại chung của 1 bạn ở 1 kỳ ('h1' | 'h2' | 'nam').
  function levelOf(studentId, sem) {
    const subs = state.subjects.map((sub) => {
      if (sub.type === 'nhanxet') return { name: sub.name, type: 'nhanxet', dtb: null, nx: nxOf(studentId, sub.id, sem) };
      const dtb = sem === 'nam' ? dtbYearOf(studentId, sub.id) : dtbOf(studentId, sub.id, sem);
      return { name: sub.name, type: 'diem', dtb, nx: null };
    });
    return S.xepLoaiChung(subs);
  }
  function levelLabel(res) {
    if (!res) return '—';
    if (res.state === 'thieu') return 'Thiếu điểm';
    if (res.state === 'chua-du-mon') return 'Cần thêm ' + Math.max(0, 6 - state.subjects.filter((s) => s.type === 'diem').length) + ' môn có điểm';
    return S.LEVELS[res.level];
  }
  function mucChip(muc) {
    if (!muc) return '<span class="muted">—</span>';
    const cls = muc === 'Tốt' ? 'sd-muc-tot' : muc === 'Khá' ? 'sd-muc-kha' : muc === 'Đạt' ? 'sd-muc-dat' : 'sd-muc-chua-dat';
    return '<span class="sd-muc ' + cls + '">' + muc + '</span>';
  }
  function displayNameList() {
    return S.displayNames(state.students.map((s) => s.name));
  }

  // --- Vẽ: thông tin lớp + chip môn học + ô chọn môn ---
  function renderClassInfo() {
    const n = state.students.length;
    $('sd-class-info').textContent = n
      ? 'Đang có ' + n + ' học sinh' + (state.className ? ' — ' + state.className : '') + '.'
      : 'Chưa có học sinh nào — nạp lớp từ Bàn giáo viên, dán danh sách, hoặc dùng lớp mẫu.';
    $('sd-class-name').value = state.className || '';
    const h = gvClasses();
    const sel = $('sd-class-select');
    let names = [];
    if (h && typeof h.list === 'function') {
      try { names = Object.keys(h.list() || {}); } catch (e) { names = []; }
    }
    if (!names.length) {
      sel.innerHTML = '<option value="">Chưa có lớp nào trong Bàn giáo viên</option>';
      $('sd-load-class').disabled = true;
    } else {
      $('sd-load-class').disabled = false;
      const active = (h && typeof h.active === 'function') ? h.active() : '';
      sel.innerHTML = names.map((nm) => '<option value="' + esc(nm) + '"' + (nm === active ? ' selected' : '') + '>' + esc((h && h.classLabel) ? h.classLabel(nm) : nm) + '</option>').join('');
    }
  }
  function renderSubjects() {
    const box = $('sd-subjects');
    if (!state.subjects.length) {
      box.innerHTML = '<p class="muted" style="margin:0">Chưa có môn nào — thêm môn ở dưới để bắt đầu nhập điểm.</p>';
    } else {
      box.innerHTML = state.subjects.map((sub) => '<span class="sd-subject-chip" data-id="' + esc(sub.id) + '">' + esc(sub.name)
        + ' <span class="muted">(' + (sub.type === 'diem' ? 'có điểm' : 'nhận xét') + ')</span>'
        + ' <button type="button" class="sd-chip-x" data-remove="' + esc(sub.id) + '" aria-label="Xóa môn ' + esc(sub.name) + '">✕</button></span>').join(' ');
    }
    const sel = $('sd-subject-select');
    sel.innerHTML = state.subjects.map((sub) => '<option value="' + esc(sub.id) + '">' + esc(sub.name) + '</option>').join('');
    if (activeSubjectId && subjectById(activeSubjectId)) sel.value = activeSubjectId;
    else if (state.subjects.length) { activeSubjectId = state.subjects[0].id; sel.value = activeSubjectId; }
    $('sd-subject-picker').style.display = (activeSem === 'nam' || !state.subjects.length) ? 'none' : '';
    $('sd-paste-hint').style.display = (activeSem === 'nam') ? 'none' : '';
  }

  // --- Vẽ: bảng điểm ---
  function rowDtbCells(studentId, subjectId, sem) {
    const dtb = dtbOf(studentId, subjectId, sem);
    return '<td class="sd-dtb" data-dtb="' + esc(studentId) + '">' + (dtb == null ? '<span class="muted">—</span>' : '<strong>' + S.fmtScore(dtb) + '</strong>') + '</td>'
      + '<td data-muc="' + esc(studentId) + '">' + mucChip(S.mucMon(dtb)) + '</td>';
  }
  function semesterGridHtml() {
    const sub = subjectById(activeSubjectId);
    if (!state.students.length) return '<p class="note">Chưa có học sinh nào — nạp lớp từ Bàn giáo viên, dán danh sách, hoặc dùng lớp mẫu ở trên.</p>';
    if (!sub) return '<p class="note">Chưa có môn nào — thêm môn ở trên để bắt đầu nhập điểm.</p>';
    const names = displayNameList();
    let html = '<div class="sd-wrap"><table class="tbl sd-grid"><thead><tr><th>STT</th><th>Họ tên</th>';
    if (sub.type === 'nhanxet') {
      html += '<th>Kết quả ' + (activeSem === 'h1' ? 'học kỳ I' : 'học kỳ II') + '</th></tr></thead><tbody>';
      state.students.forEach((st, i) => {
        const v = nxOf(st.id, sub.id, activeSem);
        html += '<tr data-student="' + esc(st.id) + '"><td>' + (i + 1) + '</td><td>' + esc(names[i]) + '</td>'
          + '<td><select class="sd-nx" data-field="nx" data-student="' + esc(st.id) + '" aria-label="Kết quả ' + esc(sub.name) + ' của ' + esc(names[i]) + '">'
          + '<option value=""' + (v == null ? ' selected' : '') + '>Chưa đánh giá</option>'
          + '<option value="dat"' + (v === 'dat' ? ' selected' : '') + '>Đạt</option>'
          + '<option value="chuadat"' + (v === 'chuadat' ? ' selected' : '') + '>Chưa đạt</option>'
          + '</select></td></tr>';
      });
    } else {
      html += '<th>TX1</th><th>TX2</th><th>TX3</th><th>TX4</th><th>GK</th><th>CK</th><th>ĐTB</th><th>Mức</th></tr></thead><tbody>';
      state.students.forEach((st, i) => {
        const c = getCell(st.id, sub.id, activeSem);
        html += '<tr data-student="' + esc(st.id) + '"><td>' + (i + 1) + '</td><td>' + esc(names[i]) + '</td>';
        SCORE_FIELDS.forEach((f) => {
          const val = f === 'gk' ? c.gk : f === 'ck' ? c.ck : (c.tx || [])[parseInt(f.slice(2), 10)];
          const bad = val != null && isNaN(val) ? ' sd-bad' : '';
          html += '<td><input class="sd-score' + bad + '" type="text" inputmode="decimal" data-field="' + f + '" data-student="' + esc(st.id) + '" value="' + esc(S.fmtScore(val)) + '" aria-label="Điểm ' + FIELD_LABELS[f] + ' môn ' + esc(sub.name) + ' của ' + esc(names[i]) + '"></td>';
        });
        html += rowDtbCells(st.id, sub.id, activeSem) + '</tr>';
      });
    }
    html += '</tbody></table></div>';
    return html;
  }
  function yearGridHtml() {
    if (!state.students.length) return '<p class="note">Chưa có học sinh nào — nạp lớp từ Bàn giáo viên, dán danh sách, hoặc dùng lớp mẫu ở trên.</p>';
    if (!state.subjects.length) return '<p class="note">Chưa có môn nào — thêm môn ở trên để bắt đầu nhập điểm.</p>';
    const names = displayNameList();
    let html = '<div class="sd-wrap"><table class="tbl sd-grid"><thead><tr><th>STT</th><th>Họ tên</th>';
    state.subjects.forEach((sub) => {
      html += '<th>' + esc(sub.name) + '<br><span class="muted" style="font-weight:400">' + (sub.type === 'diem' ? 'ĐTB cả năm' : 'Cả năm') + '</span></th>';
    });
    html += '<th>Xếp loại chung</th></tr></thead><tbody>';
    state.students.forEach((st, i) => {
      html += '<tr data-student="' + esc(st.id) + '"><td>' + (i + 1) + '</td><td>' + esc(names[i]) + '</td>';
      state.subjects.forEach((sub) => {
        if (sub.type === 'nhanxet') {
          const v = nxOf(st.id, sub.id, 'nam');
          html += '<td>' + (v == null ? '<span class="muted">—</span>' : v === 'dat' ? 'Đạt' : '<strong class="sd-bad-text">Chưa đạt</strong>') + '</td>';
        } else {
          const dtb = dtbYearOf(st.id, sub.id);
          html += '<td>' + (dtb == null ? '<span class="muted">—</span>' : '<strong>' + S.fmtScore(dtb) + '</strong> ' + mucChip(S.mucMon(dtb))) + '</td>';
        }
      });
      const lv = levelOf(st.id, 'nam');
      let cell = levelLabel(lv);
      if (lv.state === 'ok') {
        cell = '<strong>' + S.LEVELS[lv.level] + '</strong>';
        if (lv.adjusted) cell += ' <span class="sd-adjust" title="Được điều chỉnh lên 1 mức theo khoản 3 Điều 9 TT22: mức thô ' + S.LEVELS[lv.rawLevel] + ', chỉ do môn ' + esc(lv.adjustedBy) + ' kéo xuống.">↑</span>';
      } else if (lv.state === 'thieu') {
        cell = '<span class="muted">Thiếu điểm</span>';
      } else {
        cell = '<span class="muted">Cần thêm môn</span>';
      }
      html += '<td>' + cell + '</td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }
  function renderGrid() {
    $('sd-grid-wrap').innerHTML = activeSem === 'nam' ? yearGridHtml() : semesterGridHtml();
  }
  // Cập nhật ĐTB + mức của 1 dòng sau khi gõ (không vẽ lại cả bảng
  // để không mất chỗ gõ).
  function updateRowCells(studentId) {
    const sub = subjectById(activeSubjectId);
    if (!sub || sub.type !== 'diem' || activeSem === 'nam') return;
    const dtb = dtbOf(studentId, sub.id, activeSem);
    const dtbEl = root.querySelector('[data-dtb="' + studentId + '"]');
    const mucEl = root.querySelector('[data-muc="' + studentId + '"]');
    if (dtbEl) dtbEl.innerHTML = dtb == null ? '<span class="muted">—</span>' : '<strong>' + S.fmtScore(dtb) + '</strong>';
    if (mucEl) mucEl.innerHTML = mucChip(S.mucMon(dtb));
  }

  // --- Vẽ: tổng kết + cảnh báo ---
  function renderSummary() {
    const box = $('sd-summary');
    if (!state.students.length || !state.subjects.length) { box.innerHTML = ''; return; }
    const semName = activeSem === 'h1' ? 'Học kỳ I' : activeSem === 'h2' ? 'Học kỳ II' : 'Cả năm';
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, thieu: 0, 'chua-du-mon': 0 };
    const warn = [];
    state.students.forEach((st, i) => {
      const lv = levelOf(st.id, activeSem);
      if (lv.state === 'ok') counts[lv.level] += 1;
      else counts[lv.state] += 1;
      const name = displayNameList()[i];
      if (lv.state === 'ok' && lv.level === 0) warn.push(name + ' — xếp loại chung Chưa đạt.');
      state.subjects.forEach((sub) => {
        if (sub.type !== 'diem') return;
        const dtb = activeSem === 'nam' ? dtbYearOf(st.id, sub.id) : dtbOf(st.id, sub.id, activeSem);
        if (dtb != null && dtb < 5) warn.push(name + ' — ' + sub.name + ' ' + S.fmtScore(dtb) + ' (Chưa đạt).');
      });
    });
    let html = '<div class="sd-summary"><p><strong>' + semName + ':</strong> Tốt ' + counts[3] + ' · Khá ' + counts[2] + ' · Đạt ' + counts[1] + ' · Chưa đạt ' + counts[0];
    if (counts.thieu) html += ' · Thiếu điểm ' + counts.thieu;
    if (counts['chua-du-mon']) html += ' · Chưa đủ môn ' + counts['chua-du-mon'];
    html += '</p>';
    if (counts['chua-du-mon']) {
      const nDiem = state.subjects.filter((s) => s.type === 'diem').length;
      html += '<p class="muted">Xếp loại chung theo TT22 cần ít nhất 6 môn có điểm (lớp đang có ' + nDiem + ' môn) — thêm môn ở trên để thấy xếp loại. ĐTB từng môn vẫn tính đủ.</p>';
    }
    if (warn.length) {
      html += '<div class="sd-warn"><p><strong>Cần lưu ý (' + warn.length + '):</strong></p><ul>' + warn.map((w) => '<li>' + esc(w) + '</li>').join('') + '</ul></div>';
    }
    html += '</div>';
    box.innerHTML = html;
  }
  function renderAll() {
    renderClassInfo();
    renderSubjects();
    renderGrid();
    renderSummary();
  }

  // --- Bảng đang xem (dạng chữ) — dùng chung cho Chép + In ---
  function currentViewTable() {
    const semName = activeSem === 'h1' ? 'Học kỳ I' : activeSem === 'h2' ? 'Học kỳ II' : 'Cả năm';
    const names = displayNameList();
    if (activeSem === 'nam') {
      const headers = ['STT', 'Họ tên'].concat(state.subjects.map((s) => s.name + (s.type === 'diem' ? ' (ĐTB cả năm)' : ' (cả năm)'))).concat(['Xếp loại chung']);
      const rows = state.students.map((st, i) => {
        const cells = [String(i + 1), names[i]];
        state.subjects.forEach((sub) => {
          if (sub.type === 'nhanxet') {
            const v = nxOf(st.id, sub.id, 'nam');
            cells.push(v == null ? '' : v === 'dat' ? 'Đạt' : 'Chưa đạt');
          } else {
            const dtb = dtbYearOf(st.id, sub.id);
            cells.push(dtb == null ? '' : S.fmtScore(dtb) + ' (' + (S.mucMon(dtb) || '') + ')');
          }
        });
        const lv = levelOf(st.id, 'nam');
        cells.push(lv.state === 'ok' ? S.LEVELS[lv.level] + (lv.adjusted ? ' (điều chỉnh từ ' + S.LEVELS[lv.rawLevel] + ' do môn ' + lv.adjustedBy + ')' : '') : lv.state === 'thieu' ? 'Thiếu điểm' : 'Chưa đủ môn');
        return cells;
      });
      return { title: 'Sổ điểm cả năm', semName, headers, rows };
    }
    const sub = subjectById(activeSubjectId);
    if (!sub) return { title: '', semName, headers: [], rows: [] };
    if (sub.type === 'nhanxet') {
      const headers = ['STT', 'Họ tên', 'Kết quả ' + semName];
      const rows = state.students.map((st, i) => {
        const v = nxOf(st.id, sub.id, activeSem);
        return [String(i + 1), names[i], v == null ? '' : v === 'dat' ? 'Đạt' : 'Chưa đạt'];
      });
      return { title: 'Sổ điểm môn ' + sub.name, semName, headers, rows };
    }
    const headers = ['STT', 'Họ tên', 'TX1', 'TX2', 'TX3', 'TX4', 'GK', 'CK', 'ĐTB', 'Mức'];
    const rows = state.students.map((st, i) => {
      const c = getCell(st.id, sub.id, activeSem);
      const dtb = dtbOf(st.id, sub.id, activeSem);
      return [String(i + 1), names[i],
        S.fmtScore((c.tx || [])[0]), S.fmtScore((c.tx || [])[1]), S.fmtScore((c.tx || [])[2]), S.fmtScore((c.tx || [])[3]),
        S.fmtScore(c.gk), S.fmtScore(c.ck),
        dtb == null ? '' : S.fmtScore(dtb), S.mucMon(dtb) || ''];
    });
    return { title: 'Sổ điểm môn ' + sub.name, semName, headers, rows };
  }

  function printView() {
    const view = currentViewTable();
    if (!view.headers.length || !view.rows.length) { toast('Chưa có bảng nào để in — thêm học sinh và môn học trước đã.'); return; }
    const old = document.getElementById('sd-print-sheet');
    if (old) old.remove();
    const div = document.createElement('div');
    div.id = 'sd-print-sheet';
    let html = '<div class="sd-sheet"><div class="sd-sheet-head"><h4>' + esc(view.title.toUpperCase()) + '</h4>'
      + '<p>' + esc(state.className || 'Sổ điểm lớp') + ' — ' + esc(view.semName) + '</p></div>'
      + '<table class="tbl"><thead><tr>' + view.headers.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>';
    view.rows.forEach((row) => {
      html += '<tr>' + row.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>';
    });
    html += '</tbody></table></div>';
    div.innerHTML = html;
    document.body.appendChild(div);
    document.body.classList.add('sd-printing');
    function cleanup() {
      div.remove();
      document.body.classList.remove('sd-printing');
      window.removeEventListener('afterprint', cleanup);
    }
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  // --- Xuất Excel (SheetJS vendored, chỉ tải khi bấm nút) ---
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (xlsxPromise) return xlsxPromise;
    xlsxPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/assets/vendor/xlsx.full.min.js';
      s.onload = () => resolve(window.XLSX);
      s.onerror = () => { xlsxPromise = null; reject(new Error('Không tải được thư viện Excel.')); };
      document.head.appendChild(s);
    });
    return xlsxPromise;
  }
  function levelText(res) {
    if (!res) return '';
    if (res.state === 'thieu') return 'Thiếu điểm';
    if (res.state === 'chua-du-mon') return 'Chưa đủ môn';
    return S.LEVELS[res.level] + (res.adjusted ? ' (điều chỉnh từ ' + S.LEVELS[res.rawLevel] + ')' : '');
  }
  function exportExcel() {
    if (!state.students.length || !state.subjects.length) { toast('Chưa có bảng nào để tải — thêm học sinh và môn học trước đã.'); return; }
    const btn = $('sd-excel');
    const btnHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Đang tạo file…';
    loadXlsx().then((XLSX) => {
      const wb = XLSX.utils.book_new();
      const names = displayNameList();
      // Trang Tổng hợp: ĐTB từng môn (HKI/HKII/CN) + xếp loại 3 kỳ.
      const totalHeaders = ['STT', 'Họ tên'];
      state.subjects.forEach((sub) => {
        if (sub.type === 'diem') totalHeaders.push(sub.name + ' HKI', sub.name + ' HKII', sub.name + ' CN');
        else totalHeaders.push(sub.name + ' HKI', sub.name + ' HKII', sub.name + ' CN');
      });
      totalHeaders.push('Xếp loại HKI', 'Xếp loại HKII', 'Xếp loại CN');
      const totalRows = [totalHeaders];
      state.students.forEach((st, i) => {
        const row = [i + 1, names[i]];
        state.subjects.forEach((sub) => {
          if (sub.type === 'diem') {
            row.push(dtbOf(st.id, sub.id, 'h1'), dtbOf(st.id, sub.id, 'h2'), dtbYearOf(st.id, sub.id));
          } else {
            const nxText = (v) => (v == null ? '' : v === 'dat' ? 'Đạt' : 'Chưa đạt');
            row.push(nxText(nxOf(st.id, sub.id, 'h1')), nxText(nxOf(st.id, sub.id, 'h2')), nxText(nxOf(st.id, sub.id, 'nam')));
          }
        });
        row.push(levelText(levelOf(st.id, 'h1')), levelText(levelOf(st.id, 'h2')), levelText(levelOf(st.id, 'nam')));
        totalRows.push(row);
      });
      const wsTotal = XLSX.utils.aoa_to_sheet(totalRows);
      wsTotal['!cols'] = [{ wch: 6 }, { wch: 26 }].concat(totalHeaders.slice(2).map(() => ({ wch: 12 })));
      XLSX.utils.book_append_sheet(wb, wsTotal, 'Tổng hợp');
      // Trang riêng từng môn: bảng điểm chi tiết 2 kỳ + ĐTB cả năm.
      state.subjects.forEach((sub) => {
        let rows;
        if (sub.type === 'nhanxet') {
          rows = [['STT', 'Họ tên', 'Học kỳ I', 'Học kỳ II', 'Cả năm']];
          state.students.forEach((st, i) => {
            const nxText = (v) => (v == null ? '' : v === 'dat' ? 'Đạt' : 'Chưa đạt');
            rows.push([i + 1, names[i], nxText(nxOf(st.id, sub.id, 'h1')), nxText(nxOf(st.id, sub.id, 'h2')), nxText(nxOf(st.id, sub.id, 'nam'))]);
          });
        } else {
          rows = [['STT', 'Họ tên', 'TX1', 'TX2', 'TX3', 'TX4', 'GK', 'CK', 'ĐTB HKI', 'TX1', 'TX2', 'TX3', 'TX4', 'GK', 'CK', 'ĐTB HKII', 'ĐTB CN']];
          state.students.forEach((st, i) => {
            const c1 = getCell(st.id, sub.id, 'h1');
            const c2 = getCell(st.id, sub.id, 'h2');
            const row = [i + 1, names[i]];
            [c1, c2].forEach((c) => {
              row.push((c.tx || [])[0], (c.tx || [])[1], (c.tx || [])[2], (c.tx || [])[3], c.gk, c.ck, S.dtbHocKy(c.tx || [], c.gk, c.ck));
            });
            row.push(dtbYearOf(st.id, sub.id));
            rows.push(row);
          });
        }
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 6 }, { wch: 26 }].concat(rows[0].slice(2).map(() => ({ wch: 10 })));
        XLSX.utils.book_append_sheet(wb, ws, sub.name.slice(0, 31));
      });
      XLSX.writeFile(wb, 'so-diem-lop.xlsx');
      toast('Đã tải file so-diem-lop.xlsx.');
    }).catch(() => {
      toast('Không tải được thư viện Excel — kiểm tra mạng rồi thử lại nhé.');
    }).then(() => {
      btn.disabled = false;
      btn.innerHTML = btnHtml;
    });
  }

  // --- Nạp danh sách: từ Bàn giáo viên / dán tay / lớp mẫu ---
  // Giữ điểm của bạn trùng tên khi thay danh sách: ghép tên cũ → id
  // cũ (theo thứ tự xuất hiện, 2 bạn trùng tên lấy 2 id khác nhau).
  function reuseIds(names) {
    const byName = {};
    state.students.forEach((s) => {
      if (!byName[s.name]) byName[s.name] = [];
      byName[s.name].push(s.id);
    });
    return names.map((name) => {
      const queue = byName[name];
      return { id: (queue && queue.length) ? queue.shift() : nextId('p'), name };
    });
  }
  function loadClassStudents() {
    const h = gvClasses();
    const sel = $('sd-class-select');
    const name = sel.value;
    if (!name || !h || typeof h.getRecords !== 'function') return;
    const recs = h.getRecords(name) || [];
    if (!recs.length) { toast('Lớp này chưa có bạn nào — thêm bạn ở Bàn giáo viên trước đã.'); return; }
    const names = recs.map((r) => r.name);
    // Ưu tiên giữ id bản ghi lớp (để nạp lại lớp vẫn giữ điểm).
    const byName = {};
    state.students.forEach((s) => {
      if (!byName[s.name]) byName[s.name] = [];
      byName[s.name].push(s.id);
    });
    const students = recs.map((r) => {
      const queue = byName[r.name];
      return { id: (queue && queue.length) ? queue.shift() : ('gv-' + String(r.id || nextId('r'))), name: r.name };
    });
    state.students = students;
    state.className = (h.classLabel ? h.classLabel(name) : name).replace(/^Lớp\s+/, '');
    save();
    renderAll();
    toast('Đã nạp ' + students.length + ' học sinh từ ' + (h.classLabel ? h.classLabel(name) : name) + '.');
  }
  function loadPastedStudents() {
    const names = S.parseStudentNames($('sd-paste').value);
    if (!names.length) { toast('Chưa có tên nào — mỗi dòng 1 tên học sinh.'); return; }
    state.students = reuseIds(names);
    $('sd-paste-box').style.display = 'none';
    $('sd-paste').value = '';
    save();
    renderAll();
    toast('Đã nạp ' + names.length + ' học sinh.');
  }

  // --- Nút 2 lần bấm (mẫu Trộn đề): tránh thay/xóa dữ liệu vô tình ---
  function armConfirm(btn, label) {
    let armed = false;
    let timer = null;
    btn.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        btn.textContent = 'Bấm lại để xác nhận';
        timer = setTimeout(() => { armed = false; btn.textContent = label; }, 3000);
        return;
      }
      clearTimeout(timer);
      armed = false;
      btn.textContent = label;
      btn.dispatchEvent(new CustomEvent('sd-confirmed'));
    });
  }

  // --- Dán từ Excel vào bảng điểm ---
  $('sd-grid-wrap').addEventListener('paste', (ev) => {
    const target = ev.target;
    if (!target || target.tagName !== 'INPUT' || !target.classList.contains('sd-score')) return;
    const sub = subjectById(activeSubjectId);
    if (!sub || sub.type !== 'diem' || activeSem === 'nam') return;
    const text = (ev.clipboardData || window.clipboardData || {}).getData
      ? (ev.clipboardData || window.clipboardData).getData('text')
      : '';
    if (!text || text.indexOf('\t') === -1 && text.indexOf('\n') === -1) return;
    ev.preventDefault();
    const startStudent = target.getAttribute('data-student');
    const startField = target.getAttribute('data-field');
    const row0 = state.students.findIndex((s) => s.id === startStudent);
    const col0 = SCORE_FIELDS.indexOf(startField);
    if (row0 < 0 || col0 < 0) return;
    const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
    let filled = 0;
    let skipped = 0;
    lines.forEach((line, ri) => {
      const st = state.students[row0 + ri];
      if (!st) return;
      const cells = line.split('\t');
      cells.forEach((raw, ci) => {
        const field = SCORE_FIELDS[col0 + ci];
        if (!field) return;
        const v = S.parseScore(raw);
        const cell = getCell(st.id, sub.id, activeSem);
        if (v == null) return; // ô trống trong bảng dán: để nguyên
        if (isNaN(v)) { skipped += 1; return; }
        if (field === 'gk') cell.gk = v;
        else if (field === 'ck') cell.ck = v;
        else cell.tx[parseInt(field.slice(2), 10)] = v;
        filled += 1;
      });
    });
    save();
    renderGrid();
    renderSummary();
    toast('Đã dán ' + filled + ' ô điểm.' + (skipped ? ' (' + skipped + ' ô không phải số 0–10 nên bỏ qua.)' : ''));
  });

  // --- Gõ điểm: cập nhật trực tiếp, lưu sau 400ms ---
  $('sd-grid-wrap').addEventListener('input', (ev) => {
    const target = ev.target;
    if (!target || target.tagName !== 'INPUT' || !target.classList.contains('sd-score')) return;
    const sub = subjectById(activeSubjectId);
    if (!sub || sub.type !== 'diem') return;
    const studentId = target.getAttribute('data-student');
    const field = target.getAttribute('data-field');
    const v = S.parseScore(target.value);
    const cell = getCell(studentId, sub.id, activeSem);
    if (field === 'gk') cell.gk = v;
    else if (field === 'ck') cell.ck = v;
    else cell.tx[parseInt(field.slice(2), 10)] = v;
    target.classList.toggle('sd-bad', v != null && isNaN(v));
    updateRowCells(studentId);
    setMsg((v != null && isNaN(v)) ? 'Có ô điểm chưa đúng — chỉ nhập số từ 0 đến 10 (ví dụ 7,5).' : '');
    saveSoon();
  });
  $('sd-grid-wrap').addEventListener('change', (ev) => {
    const target = ev.target;
    if (!target) return;
    if (target.tagName === 'INPUT' && target.classList.contains('sd-score')) {
      // Chuẩn hóa cách viết sau khi gõ xong (7.5 → 7,5).
      const v = S.parseScore(target.value);
      if (v != null && !isNaN(v)) target.value = S.fmtScore(v);
      save();
      renderSummary();
      return;
    }
    if (target.tagName === 'SELECT' && target.classList.contains('sd-nx')) {
      const sub = subjectById(activeSubjectId);
      if (!sub || sub.type !== 'nhanxet') return;
      const cell = getCell(target.getAttribute('data-student'), sub.id, activeSem);
      cell.nx = target.value || null;
      save();
      renderSummary();
    }
  });

  // --- Sự kiện ---
  $('sd-sem-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sem]');
    if (!btn) return;
    activeSem = btn.getAttribute('data-sem');
    root.querySelectorAll('#sd-sem-tabs .tab').forEach((t) => t.classList.toggle('tab-active', t === btn));
    renderSubjects();
    renderGrid();
    renderSummary();
  });
  $('sd-subject-select').addEventListener('change', (e) => {
    activeSubjectId = e.target.value;
    renderGrid();
  });
  $('sd-class-name').addEventListener('change', (e) => {
    state.className = e.target.value.trim();
    save();
    renderClassInfo();
  });
  $('sd-load-class').addEventListener('click', loadClassStudents);
  $('sd-paste-toggle').addEventListener('click', () => {
    const box = $('sd-paste-box');
    box.style.display = box.style.display === 'none' ? '' : 'none';
    if (box.style.display !== 'none') $('sd-paste').focus();
  });
  $('sd-paste-load').addEventListener('click', loadPastedStudents);
  $('sd-add-subject').addEventListener('click', () => {
    const name = $('sd-subject-name').value.trim();
    if (!name) { toast('Gõ tên môn trước đã nhé.'); $('sd-subject-name').focus(); return; }
    if (state.subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast('Môn này đã có trong sổ rồi.');
      return;
    }
    const sub = { id: nextId('m'), name, type: $('sd-subject-type').value };
    state.subjects.push(sub);
    activeSubjectId = sub.id;
    $('sd-subject-name').value = '';
    save();
    renderAll();
    toast('Đã thêm môn ' + name + '.');
  });
  $('sd-subject-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('sd-add-subject').click();
  });
  // Xóa môn: bấm × lần 1 hiện "Xóa?", bấm lại trong 3 giây mới xóa.
  $('sd-subjects').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    const id = btn.getAttribute('data-remove');
    const sub = subjectById(id);
    if (!sub) return;
    if (btn.textContent !== 'Xóa?') {
      btn.textContent = 'Xóa?';
      setTimeout(() => { if (btn.isConnected) btn.textContent = '✕'; }, 3000);
      return;
    }
    state.subjects = state.subjects.filter((s) => s.id !== id);
    Object.keys(state.scores).forEach((sid) => { if (state.scores[sid]) delete state.scores[sid][id]; });
    if (activeSubjectId === id) activeSubjectId = state.subjects.length ? state.subjects[0].id : null;
    save();
    renderAll();
    toast('Đã xóa môn ' + sub.name + '.');
  });
  armConfirm($('sd-sample'), 'Dùng lớp mẫu');
  armConfirm($('sd-clear'), 'Xóa hết');
  $('sd-sample').addEventListener('sd-confirmed', () => {
    state = sampleState();
    activeSubjectId = state.subjects.length ? state.subjects[0].id : null;
    save();
    renderAll();
    toast('Đã nạp lớp mẫu 10A1 (5 bạn, 2 môn, đủ điểm 2 học kỳ).');
  });
  $('sd-clear').addEventListener('sd-confirmed', () => {
    state = { className: '', students: [], subjects: [], scores: {} };
    activeSubjectId = null;
    save();
    renderAll();
    toast('Đã xóa hết — nạp lớp, dán danh sách hoặc dùng lớp mẫu để bắt đầu lại.');
  });
  $('sd-copy').addEventListener('click', () => {
    const view = currentViewTable();
    if (!view.headers.length || !view.rows.length) { toast('Chưa có bảng nào để chép — thêm học sinh và môn học trước đã.'); return; }
    copyText(S.toTsv([view.headers].concat(view.rows))).then((ok) => toast(ok ? 'Đã chép bảng (dán thẳng vào Excel được).' : 'Không chép được — thử bôi đen bảng rồi chép tay.'));
  });
  $('sd-print').addEventListener('click', printView);
  $('sd-excel').addEventListener('click', exportExcel);

  // --- Khởi động ---
  state = loadState();
  activeSubjectId = state.subjects.length ? state.subjects[0].id : null;
  renderAll();
}
