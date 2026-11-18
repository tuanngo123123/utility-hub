// Điểm danh nhanh: chọn lớp đã lưu (lưu trong công cụ Gọi tên) →
// danh sách hiện dạng lưới tên; bấm vào tên để đánh dấu Vắng / Muộn
// (bấm lần nữa để bỏ). Thanh tổng kết "Có mặt X/Y · Vắng A · Muộn
// B"; tải file điểm danh .txt theo ngày; lịch sử điểm danh lưu theo
// ngày trong localStorage (khóa 'uh_gv_diemdanh').
export const meta = {
  id: 'diem-danh',
  name: 'Điểm danh nhanh',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Điểm danh đầu giờ: chọn lớp đã lưu, bấm vào tên để đánh dấu Vắng / Muộn, xem tổng kết có mặt — vắng — muộn ngay, tải file điểm danh theo ngày về máy.',
  keywords: 'điểm danh, điểm danh lớp, điểm danh học sinh, vắng mặt, đi muộn, sổ điểm danh',
  icon: '✅',
  seoTitle: 'Điểm danh nhanh — bấm tên đánh dấu vắng, muộn, tải file theo ngày',
  seoDesc: 'Điểm danh đầu giờ cho lớp học: chọn lớp đã lưu, bấm vào tên để đánh dấu Vắng hoặc Muộn, tổng kết ngay, tải file điểm danh theo ngày. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span><div><h2>Điểm danh nhanh</h2><p class="muted">Bấm vào tên để đánh dấu: bấm 1 lần là Vắng, bấm 2 lần là Muộn, bấm 3 lần trở lại Có mặt. Điểm danh tự lưu theo ngày trên trình duyệt này.</p></div></div>
  <div class="field"><label for="dd-class">Lớp</label><select id="dd-class"><option value="">— Chọn lớp —</option></select></div>
  <div class="field"><label for="dd-date">Ngày điểm danh</label><input id="dd-date" type="date"></div>
  <p class="note" id="dd-no-class" style="display:none">Chưa lưu lớp nào — vào <a href="/cong-cu/goi-ten-ngau-nhien/">Gọi tên ngẫu nhiên</a>, dán danh sách lớp rồi bấm "Lưu lớp" trước đã nhé.</p>
  <p class="muted" id="dd-saved" style="display:none"></p>
  <div class="gv-att-summary" id="dd-summary" style="display:none"></div>
  <div class="gv-att-grid" id="dd-grid"></div>
  <div class="btn-row" id="dd-actions" style="display:none">
    <button type="button" class="btn gv-dl" id="dd-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải điểm danh (.txt)</button>
    <button type="button" class="btn btn-ghost" id="dd-clear" data-uh-reset="1">Đánh dấu tất cả có mặt</button>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Chế độ Bàn giáo viên: trang /giao-vien/lop-hoc/ nhúng công cụ này
  // với data-gv-app="1" — lớp lấy từ lớp đang chọn ở tab Lớp học, ô
  // chọn lớp của trang rời được ẩn đi.
  const IN_APP = !!(root && root.dataset && root.dataset.gvApp === '1');
  const KEY = 'uh_gv_diemdanh';
  let marks = {}; // tên → 'vang' | 'muon' (không có trong marks = có mặt)
  let names = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  function todayLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function fmtDate(iso) {
    const parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
    } catch (e) { return {}; }
  }

  function saveAll(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* bỏ qua */ }
  }

  function currentClass() { return $('dd-class').value; }
  function currentDate() { return $('dd-date').value || todayLocal(); }

  function loadMarks() {
    const all = loadAll();
    const cls = all[currentClass()];
    marks = (cls && cls[currentDate()] && typeof cls[currentDate()] === 'object')
      ? Object.assign({}, cls[currentDate()])
      : {};
  }

  function saveMarks() {
    const all = loadAll();
    if (!all[currentClass()]) all[currentClass()] = {};
    all[currentClass()][currentDate()] = marks;
    saveAll(all);
    renderSavedDates();
  }

  function renderSavedDates() {
    const all = loadAll();
    const cls = all[currentClass()] || {};
    const dates = Object.keys(cls).sort().reverse();
    const el = $('dd-saved');
    if (!dates.length) { el.style.display = 'none'; el.textContent = ''; return; }
    el.textContent = 'Đã lưu điểm danh lớp ' + currentClass() + ' các ngày: '
      + dates.map(fmtDate).join(', ') + '.';
    el.style.display = '';
  }

  function counts() {
    let vang = 0;
    let muon = 0;
    names.forEach(n => {
      if (marks[n] === 'vang') vang++;
      else if (marks[n] === 'muon') muon++;
    });
    return { total: names.length, vang, muon, ok: names.length - vang - muon };
  }

  function render() {
    const cls = currentClass();
    const helper = gvClasses();
    names = (helper && cls) ? helper.get(cls) : [];
    const grid = $('dd-grid');
    const sum = $('dd-summary');
    if (!cls || !names.length) {
      grid.innerHTML = '';
      sum.style.display = 'none';
      $('dd-actions').style.display = 'none';
      $('dd-saved').style.display = 'none';
      return;
    }
    const c = counts();
    sum.innerHTML = '<span class="gv-sum-ok">Có mặt ' + c.ok + '/' + c.total + '</span>'
      + '<span class="gv-sum-vang">Vắng ' + c.vang + '</span>'
      + '<span class="gv-sum-muon">Muộn ' + c.muon + '</span>';
    sum.style.display = '';
    $('dd-actions').style.display = '';
    grid.innerHTML = names.map(n => {
      const m = marks[n];
      const clsName = m === 'vang' ? 'gv-att gv-att-vang' : m === 'muon' ? 'gv-att gv-att-muon' : 'gv-att';
      const label = m === 'vang' ? 'Vắng' : m === 'muon' ? 'Muộn' : 'Có mặt';
      return '<button type="button" class="' + clsName + '" data-name="' + esc(n) + '">' + esc(n) + '<small>' + label + '</small></button>';
    }).join('');
    renderSavedDates();
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $('dd-grid').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-name]');
    if (!btn) return;
    const name = btn.getAttribute('data-name');
    // Có mặt → Vắng → Muộn → Có mặt…
    if (!marks[name]) marks[name] = 'vang';
    else if (marks[name] === 'vang') marks[name] = 'muon';
    else delete marks[name];
    saveMarks();
    render();
  });

  $('dd-class').addEventListener('change', () => { loadMarks(); render(); });
  $('dd-date').addEventListener('change', () => { loadMarks(); render(); });

  $('dd-clear').addEventListener('click', () => {
    marks = {};
    saveMarks();
    render();
  });

  $('dd-download').addEventListener('click', () => {
    const cls = currentClass();
    const date = currentDate();
    const c = counts();
    const vang = names.filter(n => marks[n] === 'vang');
    const muon = names.filter(n => marks[n] === 'muon');
    const ok = names.filter(n => !marks[n]);
    let text = 'Điểm danh lớp ' + cls + ' — ngày ' + fmtDate(date) + '\n'
      + 'Tổng: ' + c.total + ' bạn · Có mặt ' + c.ok + ' · Vắng ' + c.vang + ' · Muộn ' + c.muon + '\n\n';
    text += 'Vắng (' + vang.length + '):\n' + (vang.length ? vang.map(n => '- ' + n + '\n').join('') : 'Không có.\n') + '\n';
    text += 'Muộn (' + muon.length + '):\n' + (muon.length ? muon.map(n => '- ' + n + '\n').join('') : 'Không có.\n') + '\n';
    text += 'Có mặt (' + ok.length + '):\n' + ok.map(n => '- ' + n + '\n').join('');
    download('diem-danh-' + cls + '-' + date + '.txt', text);
  });

  // Khởi tạo: nạp danh sách lớp đã lưu, ngày mặc định là hôm nay.
  // Trong Bàn giáo viên: lớp mặc định là lớp đang chọn ở tab Lớp học;
  // app gọi root._gvRefresh() mỗi lần mở lại tab để nhận lớp mới/sửa.
  function refreshFromActiveClass() {
    const helper = gvClasses();
    if (!helper) return;
    const map = helper.list();
    const sel = $('dd-class');
    const classNames = Object.keys(map).sort();
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Chọn lớp —</option>';
    classNames.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
    const active = (typeof helper.active === 'function') ? helper.active() : '';
    if (active && map[active]) sel.value = active;
    else if (cur && map[cur]) sel.value = cur;
    else if (classNames.length) sel.value = classNames[0];
    $('dd-no-class').style.display = classNames.length ? 'none' : '';
    loadMarks();
    render();
  }

  (function setup() {
    $('dd-date').value = todayLocal();
    const helper = gvClasses();
    const map = helper ? helper.list() : {};
    const sel = $('dd-class');
    const classNames = Object.keys(map).sort();
    classNames.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
    if (!classNames.length) {
      if (IN_APP) {
        $('dd-no-class').innerHTML = 'Chưa lưu lớp nào — vào tab Lớp học, tạo lớp rồi dán danh sách trước đã nhé.';
        // Vẫn gắn hook để khi giáo viên tạo lớp ở tab Lớp học rồi quay
        // lại, tab này tự nạp lớp mới.
        root._gvRefresh = refreshFromActiveClass;
      }
      $('dd-no-class').style.display = '';
      return;
    }
    if (IN_APP) {
      const active = (helper && typeof helper.active === 'function') ? helper.active() : '';
      sel.value = (active && map[active]) ? active : classNames[0];
      const field = sel.closest('.field');
      if (field) field.style.display = 'none';
      root._gvRefresh = refreshFromActiveClass;
    } else {
      sel.value = classNames[0];
    }
    loadMarks();
    render();
  })();
}
