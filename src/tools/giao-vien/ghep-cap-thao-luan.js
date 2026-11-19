// Ghép cặp thảo luận: chia lớp thành cặp ngẫu nhiên (lớp lẻ người
// thì 1 nhóm 3), tránh lặp cặp đã ghép ở 2 lần gần nhất, lưu lịch sử
// theo lớp, chép danh sách cặp. Logic ghép cặp ở
// src/lop-hoc-3-logic.js (dùng qua window.UH_LOPHOC3) — cùng mẫu
// sổ điểm + nhận xét + ma trận.
export const meta = {
  id: 'ghep-cap-thao-luan',
  name: 'Ghép cặp thảo luận',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Chia lớp thành cặp thảo luận ngẫu nhiên, tránh lặp cặp đã ghép ở 2 lần gần nhất; lớp lẻ người thì có 1 nhóm 3. Chép danh sách cặp để dán lên bảng.',
  keywords: 'ghép cặp thảo luận, chia cặp học sinh, ghép đôi lớp học, pair work',
  icon: '👥',
  seoTitle: 'Ghép cặp thảo luận — chia cặp ngẫu nhiên, tránh lặp cặp cũ',
  seoDesc: 'Chia lớp thành cặp thảo luận ngẫu nhiên — tránh lặp cặp đã ghép ở 2 lần gần nhất, lớp lẻ người có 1 nhóm 3, chép danh sách cặp miễn phí.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset>
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><div><h2>Ghép cặp thảo luận</h2><p class="muted">Chia lớp thành cặp ngẫu nhiên để thảo luận theo đôi — cặp đã ghép ở 2 lần gần nhất sẽ không lặp lại (trừ khi lớp quá ít bạn, không còn cách ghép khác).</p></div></div>
  <div class="field"><label for="gc-class-load">Nạp từ lớp đã lưu <span class="muted">(lưu lớp trong Bàn giáo viên)</span></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <select id="gc-class-load" style="flex:1;min-width:140px"><option value="">— Chọn lớp đã lưu —</option></select>
      <button type="button" class="btn" id="gc-class-load-btn">Nạp lớp</button>
      <button type="button" class="btn" id="gc-sample">Dùng lớp mẫu</button>
    </div>
  </div>
  <p class="note" id="gc-class-msg" style="display:none"></p>
  <div class="field"><label for="gc-names">Danh sách lớp (mỗi bạn một dòng)</label><textarea id="gc-names" rows="4" placeholder="Nguyễn Minh Anh&#10;Trần Thị Mai&#10;Lê Văn Hùng"></textarea></div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary btn-lg" id="gc-pair">Ghép cặp</button>
    <button type="button" class="btn" id="gc-copy" style="display:none">Chép danh sách cặp</button>
    <button type="button" class="btn btn-ghost" id="gc-forget">Quên lịch sử ghép cặp</button>
  </div>
  <p class="note" id="gc-msg" style="display:none"></p>
  <div class="result" id="gc-out" hidden></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  var L = window.UH_LOPHOC3;
  var STORE_KEY = 'uh_gv_ghep_cap_lich_su';

  var students = [];
  var className = '';
  var classKey = 'danh-sach-tay';
  // Cặp lưu theo CHỈ SỐ học sinh trong danh sách (không theo tên) để
  // 2 bạn trùng họ tên vẫn ghép đúng người; lịch sử tránh lặp cũng
  // lưu theo chỉ số — đổi thứ tự danh sách thì lịch sử cũ không còn
  // chính xác (chỉ là gợi ý tránh lặp, không ảnh hưởng kết quả ghép).
  var pairs = [];
  var repeats = 0;
  var forgetArmed = false;
  var forgetTimer = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  function showMsg(text) {
    var el = $('gc-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  // Lịch sử ghép theo lớp: map classKey -> mảng tối đa 2 lần ghép
  // gần nhất (mỗi lần là mảng khóa cặp).
  function loadHistory() {
    var all = L.loadState(localStorage, STORE_KEY, {});
    var arr = all && all[classKey];
    return Array.isArray(arr) ? arr : [];
  }
  function saveHistory(roundKeys) {
    var all = L.loadState(localStorage, STORE_KEY, {});
    if (!all || typeof all !== 'object') all = {};
    var list = Array.isArray(all[classKey]) ? all[classKey] : [];
    list.unshift(roundKeys);
    all[classKey] = list.slice(0, 2);
    L.saveState(localStorage, STORE_KEY, all);
  }
  function forgetHistory() {
    var all = L.loadState(localStorage, STORE_KEY, {});
    if (all && typeof all === 'object') {
      delete all[classKey];
      L.saveState(localStorage, STORE_KEY, all);
    }
  }

  function parseNames(text) {
    var helper = gvClasses();
    if (helper) return helper.parse(text);
    return String(text || '').split(/\r\n|\r|\n/).map((l) => l.trim()).filter(Boolean);
  }

  function setStudents(names, name, key) {
    students = (names || []).slice();
    className = name || '';
    classKey = key || 'danh-sach-tay';
    pairs = [];
    repeats = 0;
    render();
  }

  function pairsText() {
    var today = new Date().toLocaleDateString('vi-VN');
    var lab = L.displayNames(students);
    var text = 'Danh sách cặp thảo luận' + (className ? ' — ' + className : '') + ' — ngày ' + today + '\n';
    text += 'Tổng: ' + students.length + ' bạn, ' + pairs.length + ' cặp/nhóm\n\n';
    pairs.forEach((p, i) => {
      text += 'Cặp ' + (i + 1) + (p.length === 3 ? ' (nhóm 3)' : '') + ': ' + p.map((idx) => lab[idx]).join(' — ') + '\n';
    });
    return text;
  }

  function render() {
    var out = $('gc-out');
    var btn = $('gc-pair');
    btn.textContent = pairs.length ? 'Ghép lại' : 'Ghép cặp';
    $('gc-copy').style.display = pairs.length ? '' : 'none';
    if (!pairs.length) {
      out.hidden = true;
      out.innerHTML = '';
      return;
    }
    var giv = L.givenLabels(students);
    var lab = L.displayNames(students);
    var trio = pairs.filter((p) => p.length === 3).length;
    var head = '<p class="gc-result-head"><strong>Đã ghép ' + pairs.length + ' cặp' + (trio ? ' (trong đó 1 nhóm 3 vì lớp lẻ người)' : '') + ' · ' + students.length + ' bạn</strong>'
      + (repeats
        ? ' — có ' + repeats + ' cặp lặp lại lần gần nhất vì lớp quá ít bạn, không còn cách ghép khác.'
        : ' — không cặp nào trùng 2 lần gần nhất.')
      + '</p>';
    out.innerHTML = head + '<div class="gc-pairs">'
      + pairs.map((p, i) => {
        var names = p.map((idx) => '<span class="gc-name" title="' + esc(lab[idx]) + '">' + esc(giv[idx]) + '</span>').join('<span class="gc-sep" aria-hidden="true">—</span>');
        return '<div class="gc-pair' + (p.length === 3 ? ' gc-pair-trio' : '') + '"><span class="gc-pair-no">Cặp ' + (i + 1) + (p.length === 3 ? ' · nhóm 3' : '') + '</span><div class="gc-pair-names">' + names + '</div></div>';
      }).join('')
      + '</div>';
    out.hidden = false;
    out.style.display = '';
  }

  function doPair() {
    if (students.length < 2) {
      showMsg('Cần ít nhất 2 bạn để ghép cặp.');
      return;
    }
    var history = loadHistory();
    // Ghép theo chỉ số (dạng chuỗi) để trùng tên không nhầm người.
    var res = L.pairUp(students.map((_, i) => String(i)), history);
    pairs = res.pairs.map((p) => p.map((s) => parseInt(s, 10)));
    repeats = res.repeats;
    saveHistory(L.pairingKeys(res.pairs));
    showMsg('');
    render();
  }

  $('gc-pair').addEventListener('click', doPair);

  function fallbackCopy(done) {
    var ta = document.createElement('textarea');
    ta.value = pairsText();
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* bỏ qua */ }
    ta.remove();
    done();
  }

  $('gc-copy').addEventListener('click', () => {
    if (!pairs.length) return;
    var btn = $('gc-copy');
    var done = () => {
      btn.textContent = 'Đã chép!';
      setTimeout(() => { btn.textContent = 'Chép danh sách cặp'; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pairsText()).then(done, () => fallbackCopy(done));
    } else {
      fallbackCopy(done);
    }
  });

  $('gc-forget').addEventListener('click', () => {
    var btn = $('gc-forget');
    if (!forgetArmed) {
      forgetArmed = true;
      btn.textContent = 'Bấm lại để quên lịch sử';
      forgetTimer = setTimeout(() => { forgetArmed = false; btn.textContent = 'Quên lịch sử ghép cặp'; }, 3000);
      return;
    }
    clearTimeout(forgetTimer);
    forgetArmed = false;
    btn.textContent = 'Quên lịch sử ghép cặp';
    forgetHistory();
    showMsg('Đã quên lịch sử ghép cặp của lớp này — lần ghép tới có thể gặp lại cặp cũ.');
  });

  (function initClassLoad() {
    var helper = gvClasses();
    var sel = $('gc-class-load');
    if (!helper) return;
    var map = helper.list();
    Object.keys(map).sort().forEach((n) => {
      var opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
    $('gc-class-load-btn').addEventListener('click', () => {
      var name = sel.value;
      var msg = $('gc-class-msg');
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
      $('gc-names').value = names.join('\n');
      setStudents(names, name, name);
      msg.textContent = 'Đã nạp lớp ' + name + ' (' + names.length + ' bạn' + (recs.length > names.length ? ', ' + (recs.length - names.length) + ' bạn vắng không ghép' : '') + ') — bấm "Ghép cặp" để chia.';
      msg.style.display = '';
      showMsg('');
    });
  })();

  $('gc-sample').addEventListener('click', () => {
    var names = L.SAMPLE_CLASS.students.map((s) => s.name);
    $('gc-names').value = names.join('\n');
    setStudents(names, L.SAMPLE_CLASS.className, 'lop-mau');
    var msg = $('gc-class-msg');
    msg.textContent = 'Lớp mẫu 10A1 (12 bạn) — bấm "Ghép cặp" để thử ngay.';
    msg.style.display = '';
    showMsg('');
  });

  var typingTimer = null;
  $('gc-names').addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      var names = parseNames($('gc-names').value);
      if (names.join('\n') !== students.join('\n')) {
        setStudents(names, className, classKey);
        showMsg('');
        // Sửa tay danh sách thì thông báo "đã nạp lớp…" không còn đúng
        // (số bạn đã đổi) — ẩn đi để khỏi ghi sai số bạn.
        $('gc-class-msg').style.display = 'none';
      }
    }, 400);
  });

  (function initDefault() {
    var names = L.SAMPLE_CLASS.students.map((s) => s.name);
    $('gc-names').value = names.join('\n');
    setStudents(names, L.SAMPLE_CLASS.className, 'lop-mau');
  })();
}
