// Ma trận và bản đặc tả đề kiểm tra — công cụ nhóm Giáo viên
// (mục "Chấm điểm & giấy tờ").
//
// Giáo viên nhập số câu trắc nghiệm + tự luận theo từng chủ đề ×
// mức độ (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao), công
// cụ tính điểm từng ô, tổng điểm, tỷ lệ %, kiểm tổng = 10 điểm và
// tự sinh bản đặc tả (Câu 1..N: chủ đề, mức độ, dạng câu, điểm,
// yêu cầu cần đạt để giáo viên tự điền). Xuất: chép ma trận, chép
// đặc tả, in, tải Excel (2 trang). Dữ liệu lưu localStorage.
//
// Logic thuần nằm ở src/ma-tran-logic.js (build.mjs chèn vào trang,
// dùng qua window.UH_MATRAN) — cùng mẫu sổ điểm + nhận xét.
export const meta = {
  id: 'ma-tran-va-ban-dac-ta-de-kiem-tra',
  name: 'Ma trận và bản đặc tả đề kiểm tra',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Nhập số câu theo chủ đề × mức độ, kiểm tổng 10 điểm, tự sinh bản đặc tả từng câu — chép, in hoặc tải Excel.',
  keywords: 'ma trận, ma tran, bản đặc tả, ban dac ta, đặc tả đề, đề kiểm tra, lập đề, mức độ nhận biết, thông hiểu, vận dụng, ma trận đề thi',
  icon: '▦',
  seoTitle: 'Ma trận và bản đặc tả đề kiểm tra — lập ma trận theo chủ đề × mức độ, kiểm tổng 10 điểm',
  seoDesc: 'Lập ma trận đề kiểm tra theo chủ đề × mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao): nhập số câu trắc nghiệm và tự luận từng ô, tính điểm từng ô, tổng điểm, tỷ lệ %, kiểm tổng đủ 10 điểm và tự sinh bản đặc tả từng câu. Chép, in hoặc tải Excel 2 trang.',
};

export function body() {
  return `
  <div class="tool-panel gv-tool" data-uh-no-reset>
    <div class="gv-intro">
      <h2 class="tool-h2">Lập ma trận đề kiểm tra</h2>
      <p class="gv-sub">Nhập số câu theo từng chủ đề và mức độ — điểm từng ô, tổng điểm, tỷ lệ % và bản đặc tả tự tính theo.</p>
    </div>

    <div class="mt-head">
      <label class="mt-field mt-field-wide">
        <span class="mt-label">Tên bài kiểm tra</span>
        <input id="mt-title" type="text" class="mt-input" placeholder="Ví dụ: Kiểm tra giữa học kỳ I" autocomplete="off">
      </label>
      <label class="mt-field">
        <span class="mt-label">Môn</span>
        <input id="mt-subject" type="text" class="mt-input" placeholder="Ví dụ: Toán" autocomplete="off">
      </label>
      <label class="mt-field mt-field-narrow">
        <span class="mt-label">Thời gian (phút)</span>
        <input id="mt-minutes" type="number" min="0" max="300" step="5" inputmode="numeric" class="mt-input" placeholder="45">
      </label>
      <label class="mt-field mt-field-narrow">
        <span class="mt-label">Điểm mỗi câu trắc nghiệm</span>
        <input id="mt-pt-tn" type="text" inputmode="decimal" class="mt-input" value="0,25">
      </label>
    </div>

    <h3 class="mt-section-title">Ma trận đề</h3>
    <p class="mt-hint">Mỗi ô nhập số câu trắc nghiệm (TN), số câu tự luận (TL) và điểm mỗi câu tự luận của ô đó. Điểm từng ô tự tính.</p>
    <div class="mt-table-wrap" id="mt-matrix-wrap"></div>
    <div class="mt-actions-row">
      <button type="button" class="btn btn-secondary" id="mt-add-topic">+ Thêm chủ đề</button>
    </div>

    <div id="mt-banner" class="mt-banner" role="status"></div>
    <p id="mt-summary" class="mt-summary"></p>

    <div class="mt-actions-row mt-actions-main">
      <button type="button" class="btn btn-primary" id="mt-copy-matrix">Chép ma trận</button>
      <button type="button" class="btn btn-secondary" id="mt-copy-spec">Chép bản đặc tả</button>
      <button type="button" class="btn btn-secondary" id="mt-print">In ma trận + đặc tả</button>
      <button type="button" class="btn btn-secondary" id="mt-excel">Tải Excel (.xlsx)</button>
      <button type="button" class="btn btn-secondary" id="mt-sample">Dùng ma trận mẫu</button>
      <button type="button" class="btn btn-secondary" id="mt-clear">Xóa hết</button>
    </div>

    <h3 class="mt-section-title">Bản đặc tả đề</h3>
    <p class="mt-hint">Tự sinh từ ma trận. Gõ yêu cầu cần đạt cho từng câu (dùng động từ đo được: "nhận biết được…", "giải thích được…", "tính được…").</p>
    <div class="mt-table-wrap" id="mt-spec-wrap"></div>

    <p class="mt-note">Ma trận dùng 4 mức độ Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao. Công văn 7991/BGDĐT-GDTrH (17/12/2024) hướng dẫn THCS, THPT gộp còn 3 mức Biết / Hiểu / Vận dụng — giáo viên theo hướng dẫn mới thì gộp cột Vận dụng cao vào cột Vận dụng.</p>
  </div>`;
}

export function init(root) {
  var M = window.UH_MATRAN;
  var U = window.UH && window.UH.m2 ? window.UH.m2 : null;
  var toast = U && U.toast ? U.toast : function (msg) { window.alert(msg); };
  var copyText = U && U.copyText ? U.copyText : function (text, ok, fail) {
    var done = function () { if (ok) ok(); };
    var bad = function () { if (fail) fail(); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(bad);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { bad(); }
      document.body.removeChild(ta);
    }
  };

  var LS_KEY = 'uh_ma_tran_v1';

  // Yêu cầu cần đạt mẫu cho ma trận mẫu (chỉ vài câu đầu để giáo
  // viên thấy cách viết bằng động từ đo được, còn lại tự điền).
  var SAMPLE_REQS = {
    't0-nhan-biet-TN-0': 'Nhận biết được số hữu tỉ.',
    't0-thong-hieu-TL-0': 'So sánh được hai số hữu tỉ.',
    't0-van-dung-TL-0': 'Vận dụng được quy tắc cộng, trừ số hữu tỉ để tính giá trị biểu thức.',
    't1-van-dung-cao-TL-0': 'Vận dụng được tính chất của số thực để giải bài toán thực tế.',
    't2-thong-hieu-TL-0': 'Giải thích được cách tính diện tích hình chữ nhật.',
  };

  function freshState() {
    return { matrix: M.sampleMatrix(), requirements: Object.assign({}, SAMPLE_REQS) };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return freshState();
      var s = JSON.parse(raw);
      if (!s || !s.matrix || !Array.isArray(s.matrix.topics)) return freshState();
      // Chuẩn hóa: chủ đề thiếu mức độ nào thì bù ô trống.
      s.matrix.topics.forEach(function (t) {
        if (!t.cells) t.cells = {};
        M.LEVELS.forEach(function (lv) {
          if (!t.cells[lv.id]) t.cells[lv.id] = M.emptyCell();
        });
      });
      if (!s.requirements) s.requirements = {};
      return s;
    } catch (e) {
      return freshState();
    }
  }

  var state = loadState();

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* bộ nhớ đầy thì bỏ qua */ }
  }

  var $ = function (id) { return root.querySelector('#' + id); };
  var matrixWrap = $('mt-matrix-wrap');
  var specWrap = $('mt-spec-wrap');
  var bannerEl = $('mt-banner');
  var summaryEl = $('mt-summary');

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Vẽ bảng ma trận (chỉ vẽ lại khi cấu trúc đổi: thêm/xóa chủ
  // đề, nạp mẫu, xóa hết — gõ số trong ô không vẽ lại để không mất
  // con trỏ, chỉ cập nhật các ô điểm qua updateComputed). ---
  function renderMatrix() {
    var topics = state.matrix.topics;
    var html = '<table class="mt-table"><thead><tr><th class="mt-th-topic">Chủ đề</th>';
    M.LEVELS.forEach(function (lv) {
      html += '<th class="mt-th-level">' + esc(lv.name) + '</th>';
    });
    html += '<th class="mt-th-total">Tổng</th></tr></thead><tbody>';
    topics.forEach(function (t, ti) {
      html += '<tr><td class="mt-topic-cell">'
        + '<input type="text" class="mt-input mt-topic-name" data-t="' + ti + '" data-f="name" value="' + esc(t.name) + '" placeholder="Tên chủ đề" autocomplete="off">'
        + '<div class="mt-topic-meta">'
        + '<label class="mt-periods"><span>Số tiết</span><input type="number" min="0" max="200" inputmode="numeric" class="mt-input mt-num" data-t="' + ti + '" data-f="periods" value="' + esc(t.periods === '' || t.periods == null ? '' : t.periods) + '" placeholder="—"></label>'
        + '<button type="button" class="mt-del-topic" data-t="' + ti + '" title="Xóa chủ đề này" aria-label="Xóa chủ đề ' + esc(t.name || ('số ' + (ti + 1))) + '">×</button>'
        + '</div></td>';
      M.LEVELS.forEach(function (lv) {
        var cell = t.cells[lv.id] || M.emptyCell();
        html += '<td class="mt-cell"><div class="mt-cell-inputs">'
          + '<label><span>TN</span><input type="number" min="0" max="99" inputmode="numeric" class="mt-input mt-num" data-t="' + ti + '" data-l="' + lv.id + '" data-f="tn" value="' + M.parseCount(cell.tn) + '"></label>'
          + '<label><span>TL</span><input type="number" min="0" max="99" inputmode="numeric" class="mt-input mt-num" data-t="' + ti + '" data-l="' + lv.id + '" data-f="tl" value="' + M.parseCount(cell.tl) + '"></label>'
          + '<label><span>đ/câu TL</span><input type="text" inputmode="decimal" class="mt-input mt-num" data-t="' + ti + '" data-l="' + lv.id + '" data-f="ptTL" value="' + esc(String(M.parsePoints(cell.ptTL, M.DEFAULT_PT_TL)).replace('.', ',')) + '"></label>'
          + '</div><div class="mt-cell-points" data-t="' + ti + '" data-l="' + lv.id + '"></div></td>';
      });
      html += '<td class="mt-topic-total" data-t="' + ti + '"></td></tr>';
    });
    html += '</tbody><tfoot><tr><td>Tổng</td>';
    M.LEVELS.forEach(function (lv) {
      html += '<td class="mt-level-total" data-l="' + lv.id + '"></td>';
    });
    html += '<td class="mt-grand-total"></td></tr></tfoot></table>';
    matrixWrap.innerHTML = html;
  }

  // --- Cập nhật mọi số đã tính (điểm ô, tổng chủ đề, tổng mức,
  // biểu ngữ kiểm tổng, tóm tắt, bản đặc tả). ---
  function updateComputed() {
    var computed = M.computeMatrix(state.matrix);
    computed.topics.forEach(function (t, ti) {
      M.LEVELS.forEach(function (lv) {
        var el = matrixWrap.querySelector('.mt-cell-points[data-t="' + ti + '"][data-l="' + lv.id + '"]');
        if (el) {
          var s = t.cells[lv.id];
          el.textContent = s.questions + ' câu · ' + M.fmtNum(s.points) + ' điểm';
        }
      });
      var tt = matrixWrap.querySelector('.mt-topic-total[data-t="' + ti + '"]');
      if (tt) tt.innerHTML = '<strong>' + M.fmtNum(t.points) + ' điểm</strong><span>' + t.questions + ' câu · ' + M.fmtPct(t.pct) + '</span>';
    });
    computed.levels.forEach(function (lv) {
      var el = matrixWrap.querySelector('.mt-level-total[data-l="' + lv.id + '"]');
      if (el) el.innerHTML = '<strong>' + M.fmtNum(lv.points) + ' điểm</strong><span>' + lv.questions + ' câu · ' + M.fmtPct(lv.pct) + '</span>';
    });
    var gt = matrixWrap.querySelector('.mt-grand-total');
    if (gt) gt.innerHTML = '<strong>' + M.fmtNum(computed.total.points) + ' điểm</strong><span>' + computed.total.questions + ' câu · ' + M.fmtPct(computed.total.pct) + '</span>';

    var chk = M.checkTotals(computed.total);
    bannerEl.className = 'mt-banner ' + (chk.ok ? 'mt-banner-ok' : 'mt-banner-bad');
    if (chk.ok) {
      bannerEl.textContent = 'Tổng điểm: 10 điểm · 100% — đủ điểm, ma trận dùng được.';
    } else if (chk.status === 'thieu') {
      bannerEl.textContent = 'Tổng điểm: ' + M.fmtNum(chk.points) + ' điểm — thiếu ' + M.fmtNum(Math.abs(chk.diff)) + ' điểm so với 10 điểm (' + M.fmtPct(computed.total.pct) + ').';
    } else {
      bannerEl.textContent = 'Tổng điểm: ' + M.fmtNum(chk.points) + ' điểm — thừa ' + M.fmtNum(chk.diff) + ' điểm so với 10 điểm (' + M.fmtPct(computed.total.pct) + ').';
    }
    summaryEl.textContent = computed.total.questions + ' câu ('
      + computed.total.tn + ' trắc nghiệm + ' + computed.total.tl + ' tự luận) · '
      + 'Nhận biết ' + M.fmtPct(computed.levels[0].pct) + ' · Thông hiểu ' + M.fmtPct(computed.levels[1].pct)
      + ' · Vận dụng ' + M.fmtPct(computed.levels[2].pct) + ' · Vận dụng cao ' + M.fmtPct(computed.levels[3].pct) + '.';

    renderSpec();
  }

  // --- Vẽ bản đặc tả (sinh lại mỗi khi ma trận đổi; yêu cầu cần
  // đạt giữ theo mã câu nên không mất khi số câu thay đổi). ---
  function renderSpec() {
    var rows = M.buildSpec(state.matrix, state.requirements);
    if (!rows.length) {
      specWrap.innerHTML = '<p class="mt-empty">Chưa có câu nào — nhập số câu vào ma trận ở trên, bản đặc tả sẽ tự hiện ở đây.</p>';
      return;
    }
    var html = '<table class="mt-table mt-spec"><thead><tr><th>Câu</th><th>Chủ đề</th><th>Mức độ</th><th>Dạng</th><th>Điểm</th><th>Yêu cầu cần đạt</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td class="mt-spec-n">' + r.n + '</td>'
        + '<td>' + esc(r.topic) + '</td>'
        + '<td>' + esc(r.level) + '</td>'
        + '<td><span class="mt-form mt-form-' + r.form + '">' + r.form + '</span></td>'
        + '<td class="mt-spec-points">' + M.fmtNum(r.points) + '</td>'
        + '<td><input type="text" class="mt-input mt-req" data-req="' + esc(r.id) + '" value="' + esc(r.requirement) + '" placeholder="Ví dụ: Nhận biết được…" autocomplete="off"></td></tr>';
    });
    html += '</tbody></table>';
    specWrap.innerHTML = html;
  }

  // --- Nhập liệu trong bảng ma trận (ủy quyền sự kiện trên tbody). ---
  matrixWrap.addEventListener('input', function (e) {
    var inp = e.target;
    if (!inp || inp.tagName !== 'INPUT') return;
    var ti = parseInt(inp.getAttribute('data-t'), 10);
    var topic = state.matrix.topics[ti];
    if (!topic) return;
    var f = inp.getAttribute('data-f');
    if (f === 'name') {
      topic.name = inp.value;
      save();
      updateComputed(); // tên chủ đề đổi thì bản đặc tả cũng đổi theo
      return;
    }
    if (f === 'periods') {
      topic.periods = inp.value === '' ? '' : M.parseCount(inp.value);
      save();
      return;
    }
    var lv = inp.getAttribute('data-l');
    if (!topic.cells[lv]) topic.cells[lv] = M.emptyCell();
    if (f === 'tn' || f === 'tl') topic.cells[lv][f] = M.parseCount(inp.value);
    if (f === 'ptTL') topic.cells[lv][f] = M.parsePoints(inp.value, M.DEFAULT_PT_TL);
    save();
    updateComputed();
  });

  // Xóa chủ đề: bấm 2 lần để xác nhận (tránh bấm nhầm mất cả chủ đề).
  matrixWrap.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.mt-del-topic') : null;
    if (!btn) return;
    var ti = parseInt(btn.getAttribute('data-t'), 10);
    if (btn.getAttribute('data-arm') === '1') {
      state.matrix.topics.splice(ti, 1);
      save();
      renderMatrix();
      updateComputed();
      toast('Đã xóa chủ đề.');
    } else {
      btn.setAttribute('data-arm', '1');
      btn.textContent = 'Xóa?';
      btn.classList.add('mt-del-armed');
      setTimeout(function () {
        btn.removeAttribute('data-arm');
        btn.textContent = '×';
        btn.classList.remove('mt-del-armed');
      }, 3000);
    }
  });

  // Gõ yêu cầu cần đạt trong bản đặc tả: chỉ lưu, không vẽ lại
  // (vẽ lại sẽ mất con trỏ đang gõ).
  specWrap.addEventListener('input', function (e) {
    var inp = e.target;
    if (!inp || inp.tagName !== 'INPUT') return;
    var id = inp.getAttribute('data-req');
    if (id) {
      state.requirements[id] = inp.value;
      save();
    }
  });

  // --- Đầu đề: tên bài, môn, thời gian, điểm TN. ---
  $('mt-title').addEventListener('input', function (e) { state.matrix.title = e.target.value; save(); });
  $('mt-subject').addEventListener('input', function (e) { state.matrix.subject = e.target.value; save(); });
  $('mt-minutes').addEventListener('input', function (e) { state.matrix.minutes = e.target.value === '' ? '' : M.parseCount(e.target.value); save(); });
  $('mt-pt-tn').addEventListener('input', function (e) {
    state.matrix.ptTN = M.parsePoints(e.target.value, M.DEFAULT_PT_TN);
    save();
    updateComputed();
  });

  $('mt-add-topic').addEventListener('click', function () {
    state.matrix.topics.push(M.emptyTopic('Chủ đề ' + (state.matrix.topics.length + 1)));
    save();
    renderMatrix();
    updateComputed();
    var names = matrixWrap.querySelectorAll('.mt-topic-name');
    var last = names[names.length - 1];
    if (last) { last.focus(); last.select(); }
  });

  // --- Nút 2 lần bấm (mẫu / xóa hết): lần 1 đổi chữ, lần 2 chạy. ---
  function armButton(btn, armedText, fn) {
    if (btn.getAttribute('data-arm') === '1') {
      btn.removeAttribute('data-arm');
      btn.textContent = btn.getAttribute('data-label');
      fn();
      return;
    }
    btn.setAttribute('data-arm', '1');
    btn.setAttribute('data-label', btn.textContent);
    btn.textContent = armedText;
    setTimeout(function () {
      if (btn.getAttribute('data-arm') === '1') {
        btn.removeAttribute('data-arm');
        btn.textContent = btn.getAttribute('data-label');
      }
    }, 3000);
  }

  $('mt-sample').addEventListener('click', function (e) {
    armButton(e.currentTarget, 'Bấm lại để nạp mẫu', function () {
      state = freshState();
      save();
      syncHeaderInputs();
      renderMatrix();
      updateComputed();
      toast('Đã nạp ma trận mẫu môn Toán.');
    });
  });

  $('mt-clear').addEventListener('click', function (e) {
    armButton(e.currentTarget, 'Bấm lại để xóa hết', function () {
      state = { matrix: { title: '', subject: '', minutes: '', ptTN: M.DEFAULT_PT_TN, topics: [M.emptyTopic('')] }, requirements: {} };
      save();
      syncHeaderInputs();
      renderMatrix();
      updateComputed();
      toast('Đã xóa hết, bắt đầu ma trận mới.');
    });
  });

  function syncHeaderInputs() {
    $('mt-title').value = state.matrix.title || '';
    $('mt-subject').value = state.matrix.subject || '';
    $('mt-minutes').value = state.matrix.minutes === '' || state.matrix.minutes == null ? '' : state.matrix.minutes;
    $('mt-pt-tn').value = String(M.parsePoints(state.matrix.ptTN, M.DEFAULT_PT_TN)).replace('.', ',');
  }

  // --- Chép ma trận / chép đặc tả (bảng tách tab). ---
  $('mt-copy-matrix').addEventListener('click', function () {
    var tsv = M.matrixToTsv(state.matrix, M.computeMatrix(state.matrix));
    copyText(tsv, function () { toast('Đã chép ma trận — dán vào Excel hoặc Word.'); }, function () { toast('Không chép được, bạn thử lại.'); });
  });

  $('mt-copy-spec').addEventListener('click', function () {
    var rows = M.buildSpec(state.matrix, state.requirements);
    if (!rows.length) { toast('Chưa có câu nào để chép.'); return; }
    copyText(M.specToTsv(rows), function () { toast('Đã chép bản đặc tả — dán vào Excel hoặc Word.'); }, function () { toast('Không chép được, bạn thử lại.'); });
  });

  // --- In: dựng tờ in riêng rồi gọi window.print (mẫu sổ điểm). ---
  $('mt-print').addEventListener('click', function () {
    var computed = M.computeMatrix(state.matrix);
    var rows = M.buildSpec(state.matrix, state.requirements);
    var old = document.getElementById('mt-print-sheet');
    if (old) old.remove();
    var sheet = document.createElement('div');
    sheet.id = 'mt-print-sheet';
    var head = '<h1>Ma trận và bản đặc tả đề kiểm tra</h1>';
    var metaLine = [state.matrix.title, state.matrix.subject ? 'Môn: ' + state.matrix.subject : '',
      state.matrix.minutes !== '' && state.matrix.minutes != null ? 'Thời gian: ' + state.matrix.minutes + ' phút' : '']
      .filter(Boolean).join(' · ');
    if (metaLine) head += '<p class="mt-print-meta">' + esc(metaLine) + '</p>';
    var mHtml = '<h2>Ma trận đề</h2><table class="mt-print-table"><thead><tr><th>Chủ đề</th>';
    M.LEVELS.forEach(function (lv) { mHtml += '<th>' + esc(lv.name) + '</th>'; });
    mHtml += '<th>Tổng</th></tr></thead><tbody>';
    computed.topics.forEach(function (t) {
      mHtml += '<tr><td>' + esc(t.name) + '</td>';
      M.LEVELS.forEach(function (lv) {
        var s = t.cells[lv.id];
        mHtml += '<td>' + s.questions + ' câu<br>' + M.fmtNum(s.points) + ' điểm</td>';
      });
      mHtml += '<td><strong>' + M.fmtNum(t.points) + ' điểm</strong><br>' + t.questions + ' câu · ' + M.fmtPct(t.pct) + '</td></tr>';
    });
    mHtml += '</tbody><tfoot><tr><td>Tổng</td>';
    computed.levels.forEach(function (lv) {
      mHtml += '<td><strong>' + M.fmtNum(lv.points) + ' điểm</strong><br>' + lv.questions + ' câu · ' + M.fmtPct(lv.pct) + '</td>';
    });
    mHtml += '<td><strong>' + M.fmtNum(computed.total.points) + ' điểm</strong><br>' + computed.total.questions + ' câu · ' + M.fmtPct(computed.total.pct) + '</td></tr></tfoot></table>';
    var sHtml = '<h2>Bản đặc tả đề</h2>';
    if (!rows.length) {
      sHtml += '<p>Chưa có câu nào.</p>';
    } else {
      sHtml += '<table class="mt-print-table"><thead><tr><th>Câu</th><th>Chủ đề</th><th>Mức độ</th><th>Dạng</th><th>Điểm</th><th>Yêu cầu cần đạt</th></tr></thead><tbody>';
      rows.forEach(function (r) {
        sHtml += '<tr><td>' + r.n + '</td><td>' + esc(r.topic) + '</td><td>' + esc(r.level) + '</td><td>' + r.form + '</td><td>' + M.fmtNum(r.points) + '</td><td>' + esc(r.requirement) + '</td></tr>';
      });
      sHtml += '</tbody></table>';
    }
    sheet.innerHTML = head + mHtml + sHtml;
    document.body.appendChild(sheet);
    document.body.classList.add('mt-printing');
    function cleanup() {
      document.body.classList.remove('mt-printing');
      sheet.remove();
      window.removeEventListener('afterprint', cleanup);
    }
    window.addEventListener('afterprint', cleanup);
    setTimeout(function () { if (document.body.classList.contains('mt-printing')) cleanup(); }, 60000);
    window.print();
  });

  // --- Tải Excel: 2 trang Ma trận + Đặc tả (SheetJS đã có sẵn). ---
  function loadXlsx(cb) {
    if (window.XLSX) { cb(); return; }
    var s = document.createElement('script');
    s.src = '/assets/vendor/xlsx.full.min.js';
    s.onload = cb;
    s.onerror = function () { toast('Không tải được thư viện Excel, bạn thử lại.'); };
    document.head.appendChild(s);
  }

  $('mt-excel').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    var computed = M.computeMatrix(state.matrix);
    var rows = M.buildSpec(state.matrix, state.requirements);
    btn.disabled = true;
    var oldText = btn.textContent;
    btn.textContent = 'Đang tạo file…';
    loadXlsx(function () {
      try {
        var wb = window.XLSX.utils.book_new();
        var mAoa = [];
        if (state.matrix.title) mAoa.push([state.matrix.title]);
        var metaParts = [];
        if (state.matrix.subject) metaParts.push('Môn: ' + state.matrix.subject);
        if (state.matrix.minutes !== '' && state.matrix.minutes != null) metaParts.push('Thời gian: ' + state.matrix.minutes + ' phút');
        if (metaParts.length) mAoa.push([metaParts.join(' · ')]);
        if (mAoa.length) mAoa.push([]);
        var header = ['Chủ đề', 'Số tiết'];
        M.LEVELS.forEach(function (lv) { header.push(lv.name + ' (câu)', lv.name + ' (điểm)'); });
        header.push('Tổng câu', 'Tổng điểm', 'Tỷ lệ (%)');
        mAoa.push(header);
        computed.topics.forEach(function (t) {
          var row = [t.name, t.periods === '' || t.periods == null ? '' : t.periods];
          M.LEVELS.forEach(function (lv) {
            var s = t.cells[lv.id];
            row.push(s.questions, s.points);
          });
          row.push(t.questions, t.points, t.pct);
          mAoa.push(row);
        });
        var totalRow = ['Tổng', ''];
        computed.levels.forEach(function (lv) { totalRow.push(lv.questions, lv.points); });
        totalRow.push(computed.total.questions, computed.total.points, computed.total.pct);
        mAoa.push(totalRow);
        var ws1 = window.XLSX.utils.aoa_to_sheet(mAoa);
        ws1['!cols'] = [{ wch: 24 }, { wch: 9 }].concat(M.LEVELS.map(function () { return { wch: 13 }; }).flatMap(function (c) { return [c, c]; })).concat([{ wch: 10 }, { wch: 11 }, { wch: 11 }]);
        window.XLSX.utils.book_append_sheet(wb, ws1, 'Ma trận');
        var sAoa = [['Câu', 'Chủ đề', 'Mức độ', 'Dạng câu', 'Điểm', 'Yêu cầu cần đạt']];
        rows.forEach(function (r) {
          sAoa.push([r.n, r.topic, r.level, r.form, r.points, r.requirement || '']);
        });
        var ws2 = window.XLSX.utils.aoa_to_sheet(sAoa);
        ws2['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 15 }, { wch: 9 }, { wch: 8 }, { wch: 60 }];
        window.XLSX.utils.book_append_sheet(wb, ws2, 'Đặc tả');
        window.XLSX.writeFile(wb, 'ma-tran-va-ban-dac-ta-de-kiem-tra.xlsx');
        toast('Đã tải file Excel (2 trang: Ma trận + Đặc tả).');
      } catch (err) {
        toast('Không tạo được file Excel, bạn thử lại.');
      }
      btn.disabled = false;
      btn.textContent = oldText;
    });
  });

  // --- Khởi động. ---
  syncHeaderInputs();
  renderMatrix();
  updateComputed();
}
