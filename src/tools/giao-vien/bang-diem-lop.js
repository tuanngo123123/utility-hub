// Bảng điểm lớp: thêm đội/bạn, cộng/trừ điểm (+1/+5/−1), xếp hạng theo
// điểm, lưu trên trình duyệt (localStorage), tải bảng điểm về (.csv).
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
    <button type="button" class="btn btn-ghost" id="bd-clear" data-uh-reset="1">Xóa bảng điểm</button>
  </div>
  <p class="note" id="bd-msg" style="display:none"></p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const KEY = 'uh_bangdiemlop';
  let entries = [];
  let clearArmed = false;
  let clearTimer = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        entries = data.filter(e => e && typeof e.name === 'string' && typeof e.score === 'number');
      }
    } catch (e) { /* lưu trữ không khả dụng — dùng bảng trống */ }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (e) { /* bỏ qua */ }
  }

  function sorted() {
    return entries
      .map((e, i) => ({ e, i }))
      .sort((a, b) => (b.e.score - a.e.score) || (a.i - b.i));
  }

  function render() {
    const list = $('bd-list');
    $('bd-empty').style.display = entries.length ? 'none' : '';
    $('bd-download').style.display = entries.length ? '' : 'none';
    if (!entries.length) { list.innerHTML = ''; return; }
    list.innerHTML = sorted().map((row, rank) => {
      const neg = row.e.score < 0 ? ' gv-score-num-neg' : '';
      return '<div class="gv-score-row">'
        + '<span class="gv-rank">' + (rank + 1) + '</span>'
        + '<span class="gv-score-name">' + esc(row.e.name) + '</span>'
        + '<span class="gv-score-num' + neg + '">' + row.e.score + '</span>'
        + '<span class="gv-score-btns">'
        + '<button type="button" class="btn gv-mini" data-act="add" data-i="' + row.i + '" data-v="1">+1</button>'
        + '<button type="button" class="btn gv-mini" data-act="add" data-i="' + row.i + '" data-v="5">+5</button>'
        + '<button type="button" class="btn gv-mini" data-act="add" data-i="' + row.i + '" data-v="-1">−1</button>'
        + '<button type="button" class="btn btn-ghost gv-mini" data-act="del" data-i="' + row.i + '" aria-label="Xóa ' + esc(row.e.name) + '">✕</button>'
        + '</span></div>';
    }).join('');
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
      entries[i].score += parseInt(btn.getAttribute('data-v'), 10) || 0;
    } else {
      entries.splice(i, 1);
    }
    save();
    render();
  });

  $('bd-clear').addEventListener('click', () => {
    if (!entries.length) return;
    const btn = $('bd-clear');
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

  load();
  render();
}
