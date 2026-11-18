// Bảng điểm lớp: thêm đội/bạn, cộng/trừ điểm (+1/+5/−1), xếp hạng theo
// điểm, lưu trên trình duyệt (localStorage), tải bảng điểm về (.csv).
// Hạng 1–3 có huy hiệu vàng/bạc/đồng, số điểm rất to, thanh điểm tương
// đối, số "+5" bay lên khi cộng điểm. Có chế độ Chiếu lớp và âm thanh.
export const meta = {
  id: 'bang-diem-lop',
  name: 'Bảng điểm lớp',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Bảng điểm thi đua cho lớp: thêm đội hoặc tên bạn, cộng/trừ điểm nhanh, xếp hạng tự động, lưu lại trên trình duyệt, tải về file Excel.',
  keywords: 'bảng điểm lớp, điểm thi đua, cộng điểm học sinh, xếp hạng lớp, điểm đội',
  icon: '🏆',
  seoTitle: 'Bảng điểm lớp — cộng điểm, xếp hạng, tải về Excel',
  seoDesc: 'Thêm đội hoặc tên bạn, cộng/trừ điểm nhanh (+1/+5/−1), bảng tự xếp hạng theo điểm. Điểm lưu trên trình duyệt, tải về file CSV mở bằng Excel.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></span><div><h2>Bảng điểm lớp</h2><p class="muted">Thêm đội hoặc tên bạn, cộng/trừ điểm nhanh — bảng tự xếp hạng theo điểm. Điểm được lưu trên trình duyệt này, tải lại trang vẫn còn.</p></div></div>
  <div class="tabs" id="bd-mode-tabs" style="display:none">
    <button type="button" class="tab tab-active" id="bd-mode-class">Cá nhân</button>
    <button type="button" class="tab" id="bd-mode-team">Đội</button>
  </div>
  <div class="gv-app-noclass" id="bd-no-class" style="display:none">
    <p id="bd-no-class-text">Chưa có lớp nào — tạo lớp ở tab Lớp học để chấm điểm cá nhân.</p>
    <button type="button" class="btn btn-primary" id="bd-no-class-btn">Tạo lớp</button>
  </div>
  <div class="field"><label for="bd-name">Tên đội hoặc tên bạn</label>
    <div style="display:flex;gap:8px">
      <input id="bd-name" type="text" placeholder="Ví dụ: Tổ 1, Đội Sao Biển…" autocomplete="off" style="flex:1;min-width:0">
      <button type="button" class="btn btn-primary" id="bd-add">Thêm</button>
    </div>
  </div>
  <p class="note" id="bd-empty">Chưa có đội nào — gõ tên đội hoặc tên bạn rồi bấm "Thêm".</p>
  <div id="bd-list"></div>
  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn gv-dl" id="bd-download" style="display:none"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải bảng điểm (.csv)</button>
    <button type="button" class="btn" id="bd-stage">Chiếu lớp</button>
    <button type="button" class="btn btn-ghost gv-sound-btn" id="bd-sound">Âm thanh: Bật</button>
    <button type="button" class="btn btn-ghost" id="bd-clear" data-uh-reset="1">Xóa bảng điểm</button>
  </div>
  <p class="note" id="bd-msg" style="display:none"></p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Chế độ Bàn giáo viên: trang /giao-vien/lop-hoc/ nhúng công cụ này
  // với data-gv-app="1" — bảng có 2 chế độ: Cá nhân (điểm lấy từ lớp
  // đang chọn, DÙNG CHUNG cột Điểm ở tab Lớp học — một nguồn duy
  // nhất là bản ghi lớp) và Đội (danh sách đội riêng như trang rời).
  const IN_APP = !!(root && root.dataset && root.dataset.gvApp === '1');
  const KEY = 'uh_bangdiemlop';
  let mode = 'team'; // 'class' = Cá nhân (chỉ trong app), 'team' = Đội
  let entries = []; // {name, score, recIndex?} — recIndex là vị trí
  // trong bản ghi lớp (chế độ Cá nhân), để không nhầm 2 bạn trùng tên.
  let clearArmed = false;
  let clearTimer = null;
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
  function fanfare() { const s = gvSound(); if (s) s.fanfare(); }

  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  function activeClass() {
    const h = gvClasses();
    return (h && typeof h.active === 'function') ? h.active() : '';
  }

  // Chế độ Đội: danh sách riêng lưu ở uh_bangdiemlop (như trang rời).
  function loadTeam() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) { entries = []; return; }
      const data = JSON.parse(raw);
      entries = Array.isArray(data)
        ? data.filter(e => e && typeof e.name === 'string' && typeof e.score === 'number')
        : [];
    } catch (e) { entries = []; }
  }

  // Chế độ Cá nhân: điểm lấy thẳng từ bản ghi lớp đang chọn.
  function loadClass() {
    const h = gvClasses();
    const cls = activeClass();
    const recs = (h && cls && typeof h.getRecords === 'function') ? h.getRecords(cls) : [];
    entries = recs.map((r, i) => ({ name: r.name, score: r.points || 0, recIndex: i }));
  }

  function refresh() {
    if (IN_APP && mode === 'class') loadClass();
    else loadTeam();
    render();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (e) { /* bỏ qua */ }
  }

  function sorted() {
    return entries
      .map((e, i) => ({ e, i }))
      .sort((a, b) => (b.e.score - a.e.score) || (a.i - b.i));
  }

  function maxScore() {
    return entries.reduce((m, e) => Math.max(m, e.score), 0);
  }

  function rankBadge(rank) {
    if (rank <= 3) return '<span class="gv-rank gv-rank-' + rank + '">' + rank + '</span>';
    return '<span class="gv-rank">' + rank + '</span>';
  }

  function render() {
    const list = $('bd-list');
    // Chế độ Cá nhân: chưa có lớp (hoặc lớp chưa có bạn) thì hiện đúng
    // 1 nút dẫn về tab Lớp học, thay cho ô gõ tay của trang rời.
    const noClass = $('bd-no-class');
    if (IN_APP && mode === 'class') {
      const cls = activeClass();
      if (!cls) {
        $('bd-no-class-text').textContent = 'Chưa có lớp nào — tạo lớp ở tab Lớp học để chấm điểm cá nhân.';
        $('bd-no-class-btn').textContent = 'Tạo lớp';
        noClass.style.display = '';
      } else if (!entries.length) {
        $('bd-no-class-text').textContent = 'Lớp ' + cls + ' chưa có bạn nào — thêm bạn ở tab Lớp học.';
        $('bd-no-class-btn').textContent = 'Mở tab Lớp học';
        noClass.style.display = '';
      } else {
        noClass.style.display = 'none';
      }
    } else if (noClass) {
      noClass.style.display = 'none';
    }
    $('bd-empty').style.display = (entries.length || (IN_APP && mode === 'class')) ? 'none' : '';
    $('bd-download').style.display = entries.length ? '' : 'none';
    if (!entries.length) { list.innerHTML = ''; updateStage(); return; }
    const max = maxScore();
    list.innerHTML = sorted().map((row, rank) => {
      const neg = row.e.score < 0 ? ' gv-score-num-neg' : '';
      const pct = max > 0 ? Math.max(0, Math.round(row.e.score / max * 100)) : 0;
      return '<div class="gv-score-row" data-i="' + row.i + '">'
        + rankBadge(rank + 1)
        + '<span class="gv-score-name">' + esc(row.e.name) + '</span>'
        + '<span class="gv-score-num' + neg + '">' + row.e.score + '</span>'
        + '<span class="gv-score-btns">'
        + '<button type="button" class="btn gv-mini gv-btn-add" data-act="add" data-i="' + row.i + '" data-v="1">+1</button>'
        + '<button type="button" class="btn gv-mini gv-btn-add5" data-act="add" data-i="' + row.i + '" data-v="5">+5</button>'
        + '<button type="button" class="btn gv-mini gv-btn-sub" data-act="add" data-i="' + row.i + '" data-v="-1">−1</button>'
        // Chế độ Cá nhân: học sinh quản lý ở tab Lớp học, không xóa ở đây.
        + ((IN_APP && mode === 'class')
          ? ''
          : '<button type="button" class="btn btn-ghost gv-mini" data-act="del" data-i="' + row.i + '" aria-label="Xóa ' + esc(row.e.name) + '">✕</button>')
        + '</span>'
        + '<span class="gv-score-bar"><span class="gv-score-bar-fill" style="width:' + pct + '%"></span></span>'
        + '</div>';
    }).join('');
    updateStage();
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvCell(s) {
    const t = String(s);
    return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  }

  function setMsg(text) {
    const el = $('bd-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function floatNum(rowEl, v) {
    if (!rowEl) return;
    const s = document.createElement('span');
    s.className = 'gv-float' + (v < 0 ? ' gv-float-neg' : '');
    s.textContent = (v > 0 ? '+' : '') + v;
    rowEl.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }

  function addEntry() {
    const name = $('bd-name').value.trim();
    if (!name) { setMsg('Gõ tên đội hoặc tên bạn trước đã nhé.'); return; }
    if (entries.some(e => e.name.toLowerCase() === name.toLowerCase())) {
      setMsg('Tên này đã có trong bảng rồi.');
      return;
    }
    entries.push({ name, score: 0 });
    save();
    render();
    $('bd-name').value = '';
    $('bd-name').focus();
    setMsg('');
  }

  $('bd-add').addEventListener('click', addEntry);
  $('bd-name').addEventListener('keydown', e => { if (e.key === 'Enter') addEntry(); });

  $('bd-list').addEventListener('click', ev => {
    const btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    const i = parseInt(btn.getAttribute('data-i'), 10);
    if (isNaN(i) || !entries[i]) return;
    if (btn.getAttribute('data-act') === 'add') {
      const v = parseInt(btn.getAttribute('data-v'), 10) || 0;
      if (IN_APP && mode === 'class') {
        // Ghi thẳng vào bản ghi lớp (theo vị trí, không theo tên — để
        // không nhầm 2 bạn trùng tên); tab Lớp học thấy ngay lần mở sau.
        const h = gvClasses();
        const next = entries[i].score + v;
        if (h && typeof h.setPointsAt === 'function') h.setPointsAt(activeClass(), entries[i].recIndex, next);
        entries[i].score = next;
      } else {
        entries[i].score += v;
        save();
      }
      if (v === 5) fanfare(); else tick();
      render();
      // Hiệu ứng sau khi vẽ lại (vẽ lại thay toàn bộ HTML của hàng).
      const fresh = $('bd-list').querySelector('.gv-score-row[data-i="' + i + '"]');
      if (fresh) {
        const num = fresh.querySelector('.gv-score-num');
        if (num) {
          num.classList.remove('gv-pop');
          void num.offsetWidth;
          num.classList.add('gv-pop');
        }
        floatNum(fresh, v);
      }
      return;
    }
    entries.splice(i, 1);
    save();
    render();
  });

  $('bd-clear').addEventListener('click', () => {
    if (!entries.length) return;
    const btn = $('bd-clear');
    // Chế độ Cá nhân: không xóa học sinh, chỉ đặt lại điểm về 0.
    if (IN_APP && mode === 'class') {
      if (!clearArmed) {
        clearArmed = true;
        btn.textContent = 'Bấm lại để đặt lại về 0';
        clearTimer = setTimeout(() => {
          clearArmed = false;
          btn.textContent = 'Đặt lại điểm về 0';
        }, 3000);
        return;
      }
      clearTimeout(clearTimer);
      clearArmed = false;
      btn.textContent = 'Đặt lại điểm về 0';
      const h = gvClasses();
      if (h && typeof h.resetPoints === 'function') h.resetPoints(activeClass());
      refresh();
      setMsg('Đã đặt lại điểm của lớp về 0.');
      return;
    }
    if (!clearArmed) {
      clearArmed = true;
      btn.textContent = 'Bấm lại để xóa hết';
      clearTimer = setTimeout(() => {
        clearArmed = false;
        btn.textContent = 'Xóa bảng điểm';
      }, 3000);
      return;
    }
    clearTimeout(clearTimer);
    clearArmed = false;
    btn.textContent = 'Xóa bảng điểm';
    entries = [];
    save();
    render();
    setMsg('Đã xóa bảng điểm.');
  });

  $('bd-download').addEventListener('click', () => {
    let csv = '\uFEFFHạng,Tên,Điểm\n';
    sorted().forEach((row, rank) => {
      csv += (rank + 1) + ',' + csvCell(row.e.name) + ',' + row.e.score + '\n';
    });
    download('bang-diem-lop.csv', csv);
  });

  // Chế độ Chiếu lớp: bảng xếp hạng phóng to.
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="bd-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub">Bảng điểm lớp</div>'
      + '<div id="bd-stage-body" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:10px"></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#bd-stage-close').addEventListener('click', closeStage);
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const body = stageEl.querySelector('#bd-stage-body');
    if (!entries.length) {
      body.innerHTML = '<div class="gv-stage-big" style="font-size:2rem">Chưa có đội nào.</div>';
      return;
    }
    const max = maxScore();
    body.innerHTML = sorted().slice(0, 5).map((row, rank) => {
      const pct = max > 0 ? Math.max(0, Math.round(row.e.score / max * 100)) : 0;
      return '<div class="gv-score-row">'
        + rankBadge(rank + 1)
        + '<span class="gv-score-name">' + esc(row.e.name) + '</span>'
        + '<span class="gv-score-num">' + row.e.score + '</span>'
        + '<span class="gv-score-bar"><span class="gv-score-bar-fill" style="width:' + pct + '%"></span></span>'
        + '</div>';
    }).join('');
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

  $('bd-stage').addEventListener('click', openStage);

  (function initSoundBtn() {
    const btn = $('bd-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();

  // Chuyển chế độ Cá nhân / Đội (chỉ có trong Bàn giáo viên).
  function setMode(m) {
    mode = m;
    $('bd-mode-class').classList.toggle('tab-active', m === 'class');
    $('bd-mode-team').classList.toggle('tab-active', m === 'team');
    const addField = $('bd-name').closest('.field');
    if (addField) addField.style.display = m === 'class' ? 'none' : '';
    $('bd-clear').textContent = m === 'class' ? 'Đặt lại điểm về 0' : 'Xóa bảng điểm';
    clearArmed = false;
    setMsg('');
    refresh();
  }
  $('bd-mode-class').addEventListener('click', () => setMode('class'));
  $('bd-mode-team').addEventListener('click', () => setMode('team'));

  // Hook cho Bàn giáo viên: app gọi root._gvRefresh() mỗi lần mở lại
  // tab để nhận điểm vừa sửa ở tab Lớp học hay cộng từ Gọi tên.
  // Trang rời không gọi hook này nên không ảnh hưởng gì.
  root._gvRefresh = refresh;

  if (IN_APP) {
    // Mô tả của trang rời ("Thêm đội hoặc tên bạn...") không còn đúng
    // trong app — chế độ Cá nhân không thêm bạn ở đây.
    const desc = root.querySelector('.tool-head p');
    if (desc) desc.textContent = 'Chế độ Cá nhân chấm điểm từng bạn trong lớp đang chọn (chung với cột Điểm ở tab Lớp học); chế độ Đội chấm điểm theo đội riêng.';
    $('bd-mode-tabs').style.display = '';
    const noClassBtn = $('bd-no-class-btn');
    if (noClassBtn) noClassBtn.addEventListener('click', () => {
      const tab = document.getElementById('gv-tab-lop-hoc');
      if (tab) tab.click();
    });
    setMode('class');
  } else {
    loadTeam();
    render();
  }
}
