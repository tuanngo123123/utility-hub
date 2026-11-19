// Sơ đồ chỗ ngồi: xếp học sinh vào lưới bàn (mặc định 6 dãy × 5
// bàn, chỉnh được), kéo-thả đổi chỗ (chuột) hoặc bấm tên rồi bấm bàn
// (cảm ứng), xếp ngẫu nhiên toàn lớp hoặc chỉ bàn trống, lưu sơ đồ
// theo lớp, in sơ đồ. Logic xếp chỗ ở src/lop-hoc-3-logic.js (dùng
// qua window.UH_LOPHOC3) — cùng mẫu sổ điểm + nhận xét + ma trận.
export const meta = {
  id: 'so-do-cho-ngoi',
  name: 'Sơ đồ chỗ ngồi',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Xếp chỗ ngồi cho cả lớp: kéo-thả đổi chỗ, xếp ngẫu nhiên toàn lớp hoặc chỉ bàn trống, lưu sơ đồ theo lớp, in ra dán lên bảng.',
  keywords: 'sơ đồ chỗ ngồi, xếp chỗ ngồi lớp học, đổi chỗ học sinh, sơ đồ lớp học',
  icon: '🪑',
  seoTitle: 'Sơ đồ chỗ ngồi lớp học — xếp ngẫu nhiên, kéo thả, in ra',
  seoDesc: 'Xếp chỗ ngồi cho cả lớp: lưới bàn chỉnh được, kéo-thả đổi chỗ, xếp ngẫu nhiên toàn lớp hoặc chỉ bàn trống, lưu sơ đồ theo lớp, in ra miễn phí.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset>
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="7" y1="20" x2="7" y2="16"/><line x1="17" y1="20" x2="17" y2="16"/></svg></span><div><h2>Sơ đồ chỗ ngồi</h2><p class="muted">Kéo bạn vào bàn để xếp chỗ, hoặc bấm "Xếp ngẫu nhiên" cho nhanh. Trên điện thoại: bấm tên bạn rồi bấm bàn muốn xếp.</p></div></div>
  <div class="field"><label for="sc-class-load">Nạp từ lớp đã lưu <span class="muted">(lưu lớp trong Bàn giáo viên)</span></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <select id="sc-class-load" style="flex:1;min-width:140px"><option value="">— Chọn lớp đã lưu —</option></select>
      <button type="button" class="btn" id="sc-class-load-btn">Nạp lớp</button>
      <button type="button" class="btn" id="sc-sample">Dùng lớp mẫu</button>
    </div>
  </div>
  <p class="note" id="sc-class-msg" style="display:none"></p>
  <div class="field"><label for="sc-names">Danh sách lớp (mỗi bạn một dòng)</label><textarea id="sc-names" rows="4" placeholder="Nguyễn Minh Anh&#10;Trần Thị Mai&#10;Lê Văn Hùng"></textarea></div>
  <div class="sc-size">
    <div class="field"><label for="sc-rows">Số dãy (hàng dọc)</label>
      <div class="sc-stepper"><button type="button" class="sc-step-btn" id="sc-rows-minus" aria-label="Giảm số dãy">−</button><span class="sc-count" id="sc-rows">6</span><button type="button" class="sc-step-btn" id="sc-rows-plus" aria-label="Tăng số dãy">+</button></div>
    </div>
    <div class="field"><label for="sc-cols">Số bàn mỗi dãy</label>
      <div class="sc-stepper"><button type="button" class="sc-step-btn" id="sc-cols-minus" aria-label="Giảm số bàn">−</button><span class="sc-count" id="sc-cols">5</span><button type="button" class="sc-step-btn" id="sc-cols-plus" aria-label="Tăng số bàn">+</button></div>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="sc-shuffle">Xếp ngẫu nhiên</button>
    <button type="button" class="btn" id="sc-shuffle-empty">Xáo trộn chỉ bàn trống</button>
    <button type="button" class="btn" id="sc-print">In sơ đồ</button>
    <button type="button" class="btn btn-ghost" id="sc-clear">Xóa sơ đồ</button>
  </div>
  <p class="note" id="sc-msg" style="display:none"></p>
  <p class="sc-status" id="sc-status"></p>
  <div class="sc-board-wrap">
    <div class="sc-blackboard">BẢNG</div>
    <div class="sc-grid" id="sc-grid" role="grid" aria-label="Sơ đồ chỗ ngồi"></div>
  </div>
  <div class="sc-unseated">
    <h3>Chưa xếp chỗ <span class="muted" id="sc-unseated-count"></span></h3>
    <p class="muted sc-hint" id="sc-unseated-hint">Kéo tên vào bàn trống, hoặc bấm tên rồi bấm bàn.</p>
    <div class="sc-chip-row" id="sc-unseated"></div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  var L = window.UH_LOPHOC3;
  var STORE_KEY = 'uh_gv_so_do_cho_ngoi';
  var MAX_DIM = 10;

  // Học sinh hiện tại: mảng tên (đã đánh số trùng tên khi hiển thị).
  var students = [];
  // Tên lớp đang xếp (để lưu theo lớp + in ra). 'danh-sach-tay' khi
  // giáo viên dán tên tay, 'lop-mau' khi dùng lớp mẫu.
  var className = '';
  var classKey = 'danh-sach-tay';
  var rows = 6;
  var cols = 5;
  var seats = []; // chỉ số học sinh hoặc null, dài rows*cols
  var unseated = []; // chỉ số học sinh chưa xếp
  var selected = null; // {kind: 'seat'|'pool', index} đang chọn (cảm ứng)
  var clearArmed = false;
  var clearTimer = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  function showMsg(text) {
    var el = $('sc-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function labels() {
    return L.displayNames(students);
  }

  function given() {
    return L.givenLabels(students);
  }

  // Sơ đồ lưu theo lớp: {students, rows, cols, seats, unseated}.
  function saveAll() {
    var all = {};
    try { all = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { all = {}; }
    all[classKey] = { className: className, students: students, rows: rows, cols: cols, seats: seats, unseated: unseated };
    L.saveState(localStorage, STORE_KEY, all);
  }

  function loadSaved(key) {
    var all = L.loadState(localStorage, STORE_KEY, {});
    return (all && all[key]) || null;
  }

  function setStudents(names, name, key) {
    students = (names || []).slice();
    className = name || '';
    classKey = key || 'danh-sach-tay';
    var saved = loadSaved(classKey);
    // Khôi phục sơ đồ đã lưu của đúng lớp này (cùng danh sách tên);
    // danh sách đổi thì xếp lại từ đầu để không gán nhầm tên.
    if (saved && saved.students && saved.students.join('\n') === students.join('\n')) {
      rows = saved.rows; cols = saved.cols;
      seats = saved.seats || [];
      unseated = saved.unseated || [];
    } else {
      seats = new Array(rows * cols).fill(null);
      unseated = students.map((_, i) => i);
    }
    selected = null;
    render();
  }

  function parseNames(text) {
    var helper = gvClasses();
    if (helper) return helper.parse(text);
    return String(text || '').split(/\r\n|\r|\n/).map((l) => l.trim()).filter(Boolean);
  }

  function render() {
    $('sc-rows').textContent = rows;
    $('sc-cols').textContent = cols;
    $('sc-rows-minus').disabled = rows <= 1;
    $('sc-rows-plus').disabled = rows >= MAX_DIM;
    $('sc-cols-minus').disabled = cols <= 1;
    $('sc-cols-plus').disabled = cols >= MAX_DIM;
    var total = rows * cols;
    var seatedCount = seats.filter((s) => s !== null && s !== undefined).length;
    $('sc-status').textContent = students.length
      ? 'Đã xếp ' + seatedCount + '/' + students.length + ' bạn · ' + (total - seatedCount) + ' bàn trống trong ' + total + ' bàn'
      : 'Chưa có bạn nào — nạp lớp, dán danh sách hoặc dùng lớp mẫu.';
    var giv = given();
    var lab = labels();
    var grid = $('sc-grid');
    grid.style.setProperty('--sc-cols', cols);
    grid.innerHTML = seats.map((s, i) => {
      var filled = s !== null && s !== undefined && students[s] !== undefined;
      var sel = selected && selected.kind === 'seat' && selected.index === i;
      return '<div class="sc-seat' + (filled ? ' sc-seat-filled' : '') + (sel ? ' sc-selected' : '') + '" data-seat="' + i + '" draggable="' + (filled ? 'true' : 'false') + '" role="gridcell" tabindex="0" aria-label="Bàn ' + (i + 1) + (filled ? ': ' + esc(lab[s]) : ' trống') + '">'
        + (filled ? '<span class="sc-seat-name">' + esc(giv[s]) + '</span>' + (students[s] !== giv[s] ? '<span class="sc-seat-full">' + esc(lab[s]) + '</span>' : '') : '<span class="sc-seat-empty">Trống</span>')
        + '</div>';
    }).join('');
    $('sc-unseated-count').textContent = unseated.length ? '(' + unseated.length + ' bạn)' : '';
    $('sc-unseated-hint').style.display = unseated.length ? '' : 'none';
    $('sc-unseated').innerHTML = unseated.map((s) => {
      var sel = selected && selected.kind === 'pool' && selected.index === s;
      return '<button type="button" class="sc-chip' + (sel ? ' sc-selected' : '') + '" data-pool="' + s + '" draggable="true">' + esc(giv[s]) + '</button>';
    }).join('') || '<span class="muted">Tất cả các bạn đã có chỗ ngồi.</span>';
  }

  // Đặt bạn (chỉ số) vào bàn: bàn trống thì ngồi, bàn có bạn thì đổi
  // chỗ cho nhau; bạn từ danh sách chưa xếp thì rời khỏi danh sách đó.
  function placeIntoSeat(studentIdx, seatIdx) {
    var fromSeat = seats.indexOf(studentIdx);
    var occupant = seats[seatIdx];
    if (fromSeat !== -1) {
      seats = L.swapSeats(seats, fromSeat, seatIdx);
    } else {
      seats[seatIdx] = studentIdx;
      unseated = unseated.filter((u) => u !== studentIdx);
      if (occupant !== null && occupant !== undefined) unseated.push(occupant);
    }
    selected = null;
    saveAll();
    render();
  }

  // Đưa bạn từ bàn ra danh sách chưa xếp.
  function unseat(seatIdx) {
    var s = seats[seatIdx];
    if (s === null || s === undefined) return;
    seats[seatIdx] = null;
    if (unseated.indexOf(s) === -1) unseated.push(s);
    selected = null;
    saveAll();
    render();
  }

  // Bấm chọn (cảm ứng): bấm tên/bàn để chọn, bấm đích để xếp/đổi.
  function tapSeat(i) {
    if (!selected) {
      if (seats[i] !== null && seats[i] !== undefined) { selected = { kind: 'seat', index: i }; render(); }
      return;
    }
    if (selected.kind === 'seat' && selected.index === i) { selected = null; render(); return; }
    if (selected.kind === 'seat') {
      seats = L.swapSeats(seats, selected.index, i);
      selected = null;
      saveAll();
      render();
      return;
    }
    placeIntoSeat(selected.index, i);
  }

  function tapPool(s) {
    if (selected && selected.kind === 'pool' && selected.index === s) { selected = null; render(); return; }
    selected = { kind: 'pool', index: s };
    render();
  }

  // Kéo-thả (chuột): từ bàn hoặc từ danh sách chưa xếp tới bàn hoặc
  // tới danh sách chưa xếp.
  var dragData = null;
  $('sc-grid').addEventListener('dragstart', (ev) => {
    var seat = ev.target.closest('[data-seat]');
    if (!seat) return;
    var i = parseInt(seat.getAttribute('data-seat'), 10);
    if (seats[i] === null || seats[i] === undefined) return;
    dragData = { kind: 'seat', index: i, student: seats[i] };
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', 'seat:' + i); } catch (e) { /* bỏ qua */ }
    seat.classList.add('sc-dragging');
  });
  $('sc-unseated').addEventListener('dragstart', (ev) => {
    var chip = ev.target.closest('[data-pool]');
    if (!chip) return;
    dragData = { kind: 'pool', index: parseInt(chip.getAttribute('data-pool'), 10) };
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', 'pool:' + dragData.index); } catch (e) { /* bỏ qua */ }
    chip.classList.add('sc-dragging');
  });
  function clearDropMarks() {
    root.querySelectorAll('.sc-drop').forEach((el) => el.classList.remove('sc-drop'));
    root.querySelectorAll('.sc-dragging').forEach((el) => el.classList.remove('sc-dragging'));
  }
  document.addEventListener('dragend', () => { dragData = null; clearDropMarks(); });
  $('sc-grid').addEventListener('dragover', (ev) => {
    var seat = ev.target.closest('[data-seat]');
    if (!seat || !dragData) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    seat.classList.add('sc-drop');
  });
  $('sc-grid').addEventListener('dragleave', (ev) => {
    var seat = ev.target.closest('[data-seat]');
    if (seat && !seat.contains(ev.relatedTarget)) seat.classList.remove('sc-drop');
  });
  $('sc-grid').addEventListener('drop', (ev) => {
    var seat = ev.target.closest('[data-seat]');
    if (!seat || !dragData) return;
    ev.preventDefault();
    var to = parseInt(seat.getAttribute('data-seat'), 10);
    if (dragData.kind === 'seat') {
      if (to !== dragData.index) {
        seats = L.swapSeats(seats, dragData.index, to);
        saveAll();
      }
    } else {
      placeIntoSeat(dragData.index, to);
      return;
    }
    dragData = null;
    clearDropMarks();
    render();
  });
  $('sc-unseated').addEventListener('dragover', (ev) => {
    if (!dragData || dragData.kind !== 'seat') return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    $('sc-unseated').classList.add('sc-drop');
  });
  $('sc-unseated').addEventListener('dragleave', () => $('sc-unseated').classList.remove('sc-drop'));
  $('sc-unseated').addEventListener('drop', (ev) => {
    if (!dragData || dragData.kind !== 'seat') return;
    ev.preventDefault();
    unseat(dragData.index);
    dragData = null;
    clearDropMarks();
  });
  $('sc-grid').addEventListener('click', (ev) => {
    var seat = ev.target.closest('[data-seat]');
    if (!seat) return;
    tapSeat(parseInt(seat.getAttribute('data-seat'), 10));
  });
  $('sc-grid').addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var seat = ev.target.closest('[data-seat]');
    if (!seat) return;
    ev.preventDefault();
    tapSeat(parseInt(seat.getAttribute('data-seat'), 10));
  });
  $('sc-unseated').addEventListener('click', (ev) => {
    var chip = ev.target.closest('[data-pool]');
    if (!chip) return;
    tapPool(parseInt(chip.getAttribute('data-pool'), 10));
  });

  function resize(newRows, newCols) {
    if (newRows < 1 || newRows > MAX_DIM || newCols < 1 || newCols > MAX_DIM) return;
    var r = L.resizeSeats(seats, unseated, newRows, newCols);
    rows = newRows; cols = newCols;
    seats = r.seats; unseated = r.unseated;
    selected = null;
    saveAll();
    render();
  }
  $('sc-rows-minus').addEventListener('click', () => resize(rows - 1, cols));
  $('sc-rows-plus').addEventListener('click', () => resize(rows + 1, cols));
  $('sc-cols-minus').addEventListener('click', () => resize(rows, cols - 1));
  $('sc-cols-plus').addEventListener('click', () => resize(rows, cols + 1));

  $('sc-shuffle').addEventListener('click', () => {
    if (!students.length) { showMsg('Chưa có bạn nào — nạp lớp, dán danh sách hoặc dùng lớp mẫu trước đã nhé.'); return; }
    var r = L.shuffleSeats(students.length, rows, cols);
    seats = r.seats; unseated = r.unseated;
    selected = null;
    saveAll();
    render();
    showMsg(unseated.length
      ? 'Đã xếp ngẫu nhiên ' + (students.length - unseated.length) + ' bạn, còn ' + unseated.length + ' bạn chưa có bàn — tăng số dãy hoặc số bàn để xếp hết.'
      : 'Đã xếp ngẫu nhiên cả lớp.');
  });

  $('sc-shuffle-empty').addEventListener('click', () => {
    if (!unseated.length) { showMsg('Không còn bạn nào chưa xếp chỗ.'); return; }
    var before = unseated.length;
    var r = L.shuffleEmptySeats(seats, unseated);
    seats = r.seats; unseated = r.unseated;
    selected = null;
    saveAll();
    render();
    showMsg(r.unseated.length
      ? 'Đã xếp thêm ' + (before - r.unseated.length) + ' bạn vào bàn trống, còn ' + r.unseated.length + ' bạn chưa có bàn.'
      : 'Đã xếp hết các bạn chưa có chỗ vào bàn trống.');
  });

  $('sc-clear').addEventListener('click', () => {
    if (!students.length) return;
    var btn = $('sc-clear');
    if (!clearArmed) {
      clearArmed = true;
      btn.textContent = 'Bấm lại để xóa hết';
      clearTimer = setTimeout(() => { clearArmed = false; btn.textContent = 'Xóa sơ đồ'; }, 3000);
      return;
    }
    clearTimeout(clearTimer);
    clearArmed = false;
    btn.textContent = 'Xóa sơ đồ';
    seats = new Array(rows * cols).fill(null);
    unseated = students.map((_, i) => i);
    selected = null;
    saveAll();
    render();
    showMsg('Đã xóa sơ đồ — tất cả các bạn về danh sách chưa xếp chỗ.');
  });

  // In sơ đồ: tờ in gọn (tên lớp + ngày + lưới bàn), ẩn phần còn lại.
  $('sc-print').addEventListener('click', () => {
    var sheet = document.getElementById('sc-print-sheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'sc-print-sheet';
      document.body.appendChild(sheet);
    }
    var giv = given();
    var lab = labels();
    var today = new Date().toLocaleDateString('vi-VN');
    var cells = '';
    for (var r = 0; r < rows; r++) {
      cells += '<tr>';
      for (var c = 0; c < cols; c++) {
        var s = seats[r * cols + c];
        cells += '<td>' + (s !== null && s !== undefined && students[s] !== undefined ? esc(lab[s]) : '') + '</td>';
      }
      cells += '</tr>';
    }
    var rest = unseated.length
      ? '<p>Chưa xếp chỗ: ' + unseated.map((s) => esc(giv[s])).join(', ') + '</p>'
      : '';
    sheet.innerHTML = '<h1>Sơ đồ chỗ ngồi' + (className ? ' — ' + esc(className) : '') + '</h1>'
      + '<p>Ngày ' + today + ' · ' + students.length + ' bạn · ' + rows + ' dãy × ' + cols + ' bàn</p>'
      + '<div class="sc-print-board">BẢNG</div>'
      + '<table>' + cells + '</table>' + rest;
    document.body.classList.add('sc-printing');
    function cleanup() {
      document.body.classList.remove('sc-printing');
      window.removeEventListener('afterprint', cleanup);
    }
    window.addEventListener('afterprint', cleanup);
    setTimeout(function () { if (document.body.classList.contains('sc-printing')) cleanup(); }, 60000);
    window.print();
  });

  // Nạp lớp đã lưu từ Bàn giáo viên (uh_gv_lop).
  (function initClassLoad() {
    var helper = gvClasses();
    var sel = $('sc-class-load');
    if (!helper) return;
    var map = helper.list();
    Object.keys(map).sort().forEach((n) => {
      var opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
    $('sc-class-load-btn').addEventListener('click', () => {
      var name = sel.value;
      var msg = $('sc-class-msg');
      if (!name) {
        msg.textContent = 'Chọn một lớp đã lưu trước đã nhé (lưu lớp trong Bàn giáo viên).';
        msg.style.display = '';
        return;
      }
      var recs = helper.getRecords(name);
      var names = recs.filter((r) => !r.absent).map((r) => r.name);
      if (!names.length) {
        msg.textContent = 'Lớp này không còn bạn nào (hoặc tất cả đều vắng).';
        msg.style.display = '';
        return;
      }
      $('sc-names').value = names.join('\n');
      setStudents(names, name, name);
      msg.textContent = 'Đã nạp lớp ' + name + ' (' + names.length + ' bạn' + (recs.length > names.length ? ', ' + (recs.length - names.length) + ' bạn vắng không xếp chỗ' : '') + ').';
      msg.style.display = '';
      showMsg('');
    });
  })();

  $('sc-sample').addEventListener('click', () => {
    var names = L.SAMPLE_CLASS.students.map((s) => s.name);
    $('sc-names').value = names.join('\n');
    setStudents(names, L.SAMPLE_CLASS.className, 'lop-mau');
    var msg = $('sc-class-msg');
    msg.textContent = 'Lớp mẫu 10A1 (12 bạn) — bấm "Xếp ngẫu nhiên" để thử ngay.';
    msg.style.display = '';
    showMsg('');
  });

  var typingTimer = null;
  $('sc-names').addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      var names = parseNames($('sc-names').value);
      if (names.join('\n') !== students.join('\n')) {
        setStudents(names, className, classKey);
        showMsg('');
        // Sửa tay danh sách thì thông báo "đã nạp lớp…" không còn đúng
        // (số bạn đã đổi) — ẩn đi để khỏi ghi sai số bạn.
        $('sc-class-msg').style.display = 'none';
      }
    }, 400);
  });

  // Mở trang: dùng lớp mẫu 12 bạn để thấy ngay sơ đồ có thể dùng được
  // (giáo viên có lớp thật thì nạp lớp đè lên).
  (function initDefault() {
    var names = L.SAMPLE_CLASS.students.map((s) => s.name);
    $('sc-names').value = names.join('\n');
    setStudents(names, L.SAMPLE_CLASS.className, 'lop-mau');
  })();
}
