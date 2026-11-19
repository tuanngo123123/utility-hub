// Bảng vinh danh: xếp hạng học sinh theo điểm thi đua (lấy từ Bảng
// điểm lớp / bản ghi lớp Bàn giáo viên), top 3 dạng bục vinh danh,
// các hạng tiếp theo dạng danh sách, in ra được. Đồng điểm thì cùng
// hạng. Bảng điểm lớp chưa lưu ngày cộng điểm nên bảng này xếp theo
// tổng điểm hiện tại (ghi rõ trên trang). Logic xếp hạng ở
// src/lop-hoc-3-logic.js (dùng qua window.UH_LOPHOC3) — cùng mẫu
// sổ điểm + nhận xét + ma trận.
export const meta = {
  id: 'bang-vinh-danh',
  name: 'Bảng vinh danh',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Vinh danh học sinh có điểm thi đua cao nhất lớp: bục top 3 vàng/bạc/đồng, danh sách các hạng tiếp theo, in ra treo ở lớp.',
  keywords: 'bảng vinh danh, vinh danh học sinh, xếp hạng điểm thi đua, học sinh xuất sắc',
  icon: '🏅',
  seoTitle: 'Bảng vinh danh lớp học — bục top 3, xếp hạng theo điểm',
  seoDesc: 'Vinh danh học sinh có điểm thi đua cao nhất: bục top 3 vàng/bạc/đồng, đồng điểm cùng hạng, danh sách các hạng tiếp theo, in ra miễn phí.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset>
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></span><div><h2>Bảng vinh danh</h2><p class="muted">Xếp hạng học sinh theo điểm thi đua — top 3 lên bục vàng, bạc, đồng. Điểm lấy từ Bảng điểm lớp (chung với cột Điểm ở Bàn giáo viên).</p></div></div>
  <div class="field"><label for="vd-class-load">Chọn lớp <span class="muted">(điểm lấy từ lớp đã lưu trong Bàn giáo viên)</span></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <select id="vd-class-load" style="flex:1;min-width:140px"><option value="">— Chọn lớp đã lưu —</option></select>
      <button type="button" class="btn" id="vd-class-load-btn">Xem bảng</button>
      <button type="button" class="btn" id="vd-sample">Dùng lớp mẫu</button>
    </div>
  </div>
  <p class="note" id="vd-class-msg" style="display:none"></p>
  <p class="note" id="vd-scope">Bảng điểm lớp chưa lưu ngày cộng điểm, nên bảng này xếp theo tổng điểm hiện tại của từng bạn.</p>
  <div class="btn-row" id="vd-actions" style="display:none">
    <button type="button" class="btn" id="vd-print">In bảng vinh danh</button>
  </div>
  <div class="result" id="vd-out" hidden></div>
  <div class="vd-empty" id="vd-empty">
    <p><strong>Chưa có lớp nào để vinh danh.</strong></p>
    <p>Chọn một lớp đã lưu ở trên, hoặc bấm "Dùng lớp mẫu" để xem thử bảng vinh danh với lớp mẫu 12 bạn.</p>
    <p class="muted">Điểm thi đua ghi ở <a href="/cong-cu/bang-diem-lop/">Bảng điểm lớp</a> hoặc cộng trực tiếp trong <a href="/giao-vien/lop-hoc/">Bàn giáo viên</a> (tab Gọi tên, Bảng điểm) — bảng này đọc đúng điểm đó, không cần ghi lại.</p>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  var L = window.UH_LOPHOC3;

  var entries = []; // {name, points} của lớp đang xem
  var className = '';
  var ranked = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  function showMsg(text) {
    var el = $('vd-class-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function setEntries(list, name) {
    entries = (list || []).slice();
    className = name || '';
    ranked = L.rankStudents(entries);
    render();
  }

  function medal(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }

  function render() {
    var out = $('vd-out');
    var empty = $('vd-empty');
    var actions = $('vd-actions');
    var hasPoints = ranked.some((r) => r.points > 0);
    if (!ranked.length || !hasPoints) {
      out.hidden = true;
      out.innerHTML = '';
      actions.style.display = 'none';
      empty.style.display = '';
      if (ranked.length && !hasPoints) {
        empty.innerHTML = '<p><strong>' + (className ? esc(className) + ' ' : '') + 'chưa có điểm nào.</strong></p>'
          + '<p>Ghi điểm ở <a href="/cong-cu/bang-diem-lop/">Bảng điểm lớp</a> trước — cộng điểm cho các bạn (gọi tên đúng, làm bài tốt, giúp bạn…), rồi quay lại đây để xem bảng vinh danh.</p>';
      } else if (!ranked.length) {
        empty.innerHTML = '<p><strong>Chưa có lớp nào để vinh danh.</strong></p>'
          + '<p>Chọn một lớp đã lưu ở trên, hoặc bấm "Dùng lớp mẫu" để xem thử bảng vinh danh với lớp mẫu 12 bạn.</p>'
          + '<p class="muted">Điểm thi đua ghi ở <a href="/cong-cu/bang-diem-lop/">Bảng điểm lớp</a> hoặc cộng trực tiếp trong <a href="/giao-vien/lop-hoc/">Bàn giáo viên</a> (tab Gọi tên, Bảng điểm) — bảng này đọc đúng điểm đó, không cần ghi lại.</p>';
      }
      return;
    }
    empty.style.display = 'none';
    actions.style.display = '';
    var top = ranked.slice(0, 3);
    var rest = ranked.slice(3);
    // Tên gọi (Minh Anh, Mai…) để hiện to trên bục — tên đầy đủ hiện
    // nhỏ bên dưới; ở điện thoại tên đầy đủ dài sẽ gãy giữa chữ.
    var givenByName = {};
    L.givenLabels(ranked.map((r) => r.name)).forEach((g, i) => { givenByName[ranked[i].name] = g; });
    // Bục: hạng 2 bên trái, hạng 1 ở giữa cao nhất, hạng 3 bên phải.
    var order = [top[1], top[0], top[2]].filter(Boolean);
    var podium = '<div class="vd-podium" role="list" aria-label="Top 3">'
      + order.map((r) => {
        var cls = r.rank === 1 ? 'vd-podium-1' : r.rank === 2 ? 'vd-podium-2' : 'vd-podium-3';
        return '<div class="vd-podium-col ' + cls + '" role="listitem">'
          + '<div class="vd-medal" aria-hidden="true">' + medal(r.rank) + '</div>'
          + '<div class="vd-podium-name">' + esc(givenByName[r.name] || r.name) + '</div>'
          + '<div class="vd-podium-full">' + esc(r.name) + '</div>'
          + '<div class="vd-podium-points">' + r.points + ' điểm</div>'
          + '<div class="vd-podium-level">' + esc(r.level) + '</div>'
          + '<div class="vd-podium-rank">Hạng ' + r.rank + '</div>'
          + '</div>';
      }).join('')
      + '</div>';
    var listHtml = rest.length
      ? '<div class="vd-list">'
        + rest.map((r) => '<div class="vd-row"><span class="vd-rank">Hạng ' + r.rank + '</span><span class="vd-name">' + esc(r.name) + '</span><span class="vd-level">' + esc(r.level) + '</span><span class="vd-points">' + r.points + ' điểm</span></div>').join('')
        + '</div>'
      : '';
    out.innerHTML = '<p class="vd-head"><strong>Bảng vinh danh' + (className ? ' — ' + esc(className) : '') + '</strong> · ' + ranked.length + ' bạn · theo tổng điểm hiện tại</p>'
      + podium + listHtml;
    out.hidden = false;
    out.style.display = '';
  }

  $('vd-print').addEventListener('click', () => {
    if (!ranked.length) return;
    var sheet = document.getElementById('vd-print-sheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'vd-print-sheet';
      document.body.appendChild(sheet);
    }
    var today = new Date().toLocaleDateString('vi-VN');
    var rows = ranked.map((r) => '<tr><td>' + r.rank + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.level) + '</td><td>' + r.points + '</td></tr>').join('');
    sheet.innerHTML = '<h1>Bảng vinh danh' + (className ? ' — ' + esc(className) : '') + '</h1>'
      + '<p>Ngày ' + today + ' · Xếp theo tổng điểm thi đua hiện tại · ' + ranked.length + ' bạn</p>'
      + '<table><thead><tr><th>Hạng</th><th>Họ tên</th><th>Cấp độ</th><th>Điểm</th></tr></thead><tbody>' + rows + '</tbody></table>';
    document.body.classList.add('vd-printing');
    function cleanup() {
      document.body.classList.remove('vd-printing');
      window.removeEventListener('afterprint', cleanup);
    }
    window.addEventListener('afterprint', cleanup);
    setTimeout(function () { if (document.body.classList.contains('vd-printing')) cleanup(); }, 60000);
    window.print();
  });

  (function initClassLoad() {
    var helper = gvClasses();
    var sel = $('vd-class-load');
    if (!helper) return;
    var map = helper.list();
    Object.keys(map).sort().forEach((n) => {
      var opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
    $('vd-class-load-btn').addEventListener('click', () => {
      var name = sel.value;
      if (!name) {
        showMsg('Chọn một lớp đã lưu trước đã nhé (lưu lớp trong Bàn giáo viên).');
        return;
      }
      var recs = helper.getRecords(name);
      if (!recs.length) {
        showMsg('Lớp này chưa có bạn nào.');
        return;
      }
      var labels = helper.displayNames(recs);
      setEntries(recs.map((r, i) => ({ name: labels[i] || r.name, points: r.points || 0 })), name);
      showMsg('Bảng vinh danh của lớp ' + name + ' (' + recs.length + ' bạn).');
    });
  })();

  $('vd-sample').addEventListener('click', () => {
    setEntries(L.SAMPLE_CLASS.students.map((s) => ({ name: s.name, points: s.points })), L.SAMPLE_CLASS.className);
    showMsg('Lớp mẫu 10A1 (12 bạn) — điểm mẫu để xem thử bảng vinh danh.');
  });
}
