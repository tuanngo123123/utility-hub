// Trộn đề trắc nghiệm: giáo viên dán đề gốc (mỗi câu 1 khối:
// dòng câu hỏi + 4 dòng đáp án A–D, đáp án đúng đánh dấu *) hoặc
// tải file .txt/.docx → trộn thành 2–8 mã đề 101–108, kèm bảng
// đáp án từng mã để in và chấm. Logic tách/trộn ở
// src/tron-de-logic.js (build chèn vào trang qua window.UH_TRONDE;
// bộ kiểm scripts/test-tron-de.mjs kiểm cùng file đó nên đáp án
// đúng sau trộn luôn khớp vị trí mới).
// File .docx đọc bằng mammoth (BSD-2-Clause, đã tải về
// src/vendor/) — chỉ tải khi người dùng chọn file .docx.
// Tải Word xuất file .doc (HTML tương thích Word, mở được bằng
// Word/LibreOffice) — không phải .docx gốc.
export const meta = {
  id: 'tron-de-trac-nghiem',
  name: 'Trộn đề trắc nghiệm',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Trộn câu hỏi và đáp án thành nhiều mã đề 101–108, kèm bảng đáp án từng mã để in và chấm. Dán đề hoặc tải file Word, đáp án đúng đánh dấu *.',
  keywords: 'trộn đề, đảo đề, xáo đề trắc nghiệm, mã đề, bảng đáp án, đề kiểm tra trắc nghiệm, trộn câu hỏi',
  icon: '🔀',
  seoTitle: 'Trộn đề trắc nghiệm — nhiều mã đề 101–108 kèm bảng đáp án',
  seoDesc: 'Trộn đề trắc nghiệm thành 2–8 mã đề: dán đề hoặc tải file Word, đánh dấu đáp án đúng bằng *, nhận đề đã trộn kèm bảng đáp án để in và chấm. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset>
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg></span><div><h2>Trộn đề trắc nghiệm</h2><p class="muted">Dán đề gốc vào ô dưới, bấm "Trộn đề" — nhận nhiều mã đề khác nhau kèm bảng đáp án để in và chấm.</p></div></div>
  <div class="field"><label for="td-input">Đề gốc</label>
    <textarea id="td-input" rows="12" placeholder="Câu 1. Thủ đô của Việt Nam là thành phố nào?&#10;A. Huế&#10;*B. Hà Nội&#10;C. Đà Nẵng&#10;D. Cần Thơ&#10;&#10;Câu 2. ..."></textarea>
    <p class="hint">Mỗi câu 1 khối: dòng câu hỏi, rồi 4 dòng đáp án A–D. Đáp án đúng đánh dấu * ở đầu dòng (ví dụ: *B. Hà Nội). Câu hỏi có thể bắt đầu bằng "Câu 1." hoặc "1." — tiền tố số tự bỏ.</p>
  </div>
  <div class="btn-row">
    <label class="btn" for="td-file" style="cursor:pointer">Tải file đề (.txt / .docx)</label>
    <input id="td-file" type="file" accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="position:absolute;width:1px;height:1px;opacity:0">
    <button type="button" class="btn" id="td-sample">Dùng đề mẫu 10 câu</button>
    <button type="button" class="btn btn-ghost" id="td-clear">Xóa hết</button>
  </div>
  <p class="note" id="td-file-msg" style="display:none"></p>
  <div id="td-preview"></div>
  <div class="grid-2">
    <div class="field"><label for="td-title">Tên bài kiểm tra <span class="muted">(hiện trên đầu mỗi mã đề)</span></label>
      <input id="td-title" type="text" value="Bài kiểm tra trắc nghiệm" autocomplete="off">
    </div>
    <div class="field"><label for="td-duration">Thời gian làm bài (phút)</label>
      <input id="td-duration" type="number" min="5" max="300" value="45" inputmode="numeric">
    </div>
  </div>
  <div class="grid-2">
    <div class="field"><label for="td-codes">Số mã đề</label>
      <select id="td-codes">
        <option value="2">2 mã đề (101–102)</option>
        <option value="3">3 mã đề (101–103)</option>
        <option value="4" selected>4 mã đề (101–104)</option>
        <option value="5">5 mã đề (101–105)</option>
        <option value="6">6 mã đề (101–106)</option>
        <option value="7">7 mã đề (101–107)</option>
        <option value="8">8 mã đề (101–108)</option>
      </select>
    </div>
    <div class="field"><label>Trộn những gì</label>
      <label style="display:flex;gap:8px;align-items:center;font-weight:400;margin-bottom:8px"><input type="checkbox" id="td-shuffle-q" checked> Trộn thứ tự câu hỏi</label>
      <label style="display:flex;gap:8px;align-items:center;font-weight:400"><input type="checkbox" id="td-shuffle-a" checked> Trộn thứ tự đáp án trong mỗi câu</label>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="td-shuffle">Trộn đề</button>
  </div>
  <div id="td-result" style="display:none">
    <h3>Kết quả trộn</h3>
    <div class="tabs" id="td-tabs"></div>
    <div id="td-sheet"></div>
    <h3>Bảng đáp án</h3>
    <p class="muted">Bảng này chỉ dành cho giáo viên chấm bài — không in chung với đề (bấm "In đáp án" để in riêng).</p>
    <div id="td-key"></div>
    <div class="btn-row">
      <button type="button" class="btn" id="td-copy-exam">Chép đề đang xem</button>
      <button type="button" class="btn" id="td-copy-key">Chép bảng đáp án</button>
      <button type="button" class="btn" id="td-print-exam">In đề đang xem</button>
      <button type="button" class="btn" id="td-print-key">In đáp án</button>
      <button type="button" class="btn" id="td-download-doc">Tải file Word (.doc)</button>
      <button type="button" class="btn" id="td-download-txt">Tải tất cả (.txt)</button>
    </div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const T = (typeof window !== 'undefined' && window.UH_TRONDE) ? window.UH_TRONDE : null;
  const U = (typeof window !== 'undefined' && window.UH) ? window.UH : {};
  if (!T) {
    $('td-preview').innerHTML = '<p class="note">Công cụ chưa tải đủ — tải lại trang rồi thử lại.</p>';
    return;
  }
  const INPUT_KEY = 'uh_tronde_input';
  const OPTS_KEY = 'uh_tronde_opts';
  let exams = null;
  let activeCode = 101;
  let mammothPromise = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function toast(msg) {
    if (U.toast) U.toast(msg);
    else {
      const el = $('td-file-msg');
      el.textContent = msg;
      el.style.display = '';
    }
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
  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* bỏ qua */ }
  }
  function meta() {
    return {
      title: $('td-title').value.trim() || 'Bài kiểm tra trắc nghiệm',
      duration: parseInt($('td-duration').value, 10) || 0,
    };
  }
  function saveOpts() {
    save(OPTS_KEY, JSON.stringify({
      title: $('td-title').value,
      duration: $('td-duration').value,
      codes: $('td-codes').value,
      sq: $('td-shuffle-q').checked,
      sa: $('td-shuffle-a').checked,
    }));
  }
  let saveTimer = null;
  function saveInputSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(INPUT_KEY, $('td-input').value), 500);
  }

  function parseAndPreview() {
    const text = $('td-input').value;
    const questions = T.parseExam(text);
    const valid = questions.filter((q) => !q.errors.length);
    const box = $('td-preview');
    if (!questions.length) {
      box.innerHTML = '<p class="note">Chưa có câu hỏi nào — dán đề vào ô trên, hoặc bấm "Dùng đề mẫu 10 câu" để thử ngay.</p>';
      return questions;
    }
    const bad = questions.filter((q) => q.errors.length);
    const warned = questions.filter((q) => !q.errors.length && q.warnings.length);
    let html = '<div class="note"><p><strong>Đọc được ' + questions.length + ' câu — ' + valid.length + ' câu hợp lệ'
      + (bad.length ? ', ' + bad.length + ' câu lỗi (không trộn)' : '') + '.</strong></p>';
    if (bad.length) {
      html += '<ul>' + bad.map((q) => '<li><span class="error">Câu ' + q.index + ':</span> ' + esc(q.errors.join('; ')) + '</li>').join('') + '</ul>';
    }
    if (warned.length) {
      html += '<ul>' + warned.map((q) => '<li>Câu ' + q.index + ': ' + esc(q.warnings.join('; ')) + '</li>').join('') + '</ul>';
    }
    html += '</div>';
    box.innerHTML = html;
    return questions;
  }

  function activeExam() {
    return exams ? exams.find((e) => e.code === activeCode) || exams[0] : null;
  }

  function sheetHtml(exam) {
    const m = meta();
    let html = '<div class="td-sheet"><div class="td-sheet-head"><h4>' + esc(m.title.toUpperCase()) + '</h4>'
      + (m.duration ? '<p>Thời gian làm bài: ' + m.duration + ' phút (không kể thời gian phát đề)</p>' : '')
      + '<p><strong>Mã đề: ' + exam.code + '</strong></p>'
      + '<p class="muted">Họ, tên học sinh: ...................................................... &nbsp; Số báo danh: ................</p></div>';
    exam.questions.forEach((q, i) => {
      html += '<div class="td-q"><p><strong>Câu ' + (i + 1) + '.</strong> ' + esc(q.q) + '</p>'
        + q.options.map((opt, j) => '<p class="td-opt"><strong>' + T.LETTERS[j] + '.</strong> ' + esc(opt) + '</p>').join('')
        + '</div>';
    });
    html += '</div>';
    return html;
  }

  function keyHtml() {
    let html = '<table class="tbl"><thead><tr><th>Câu</th>'
      + exams.map((e) => '<th>Mã đề ' + e.code + '</th>').join('') + '</tr></thead><tbody>';
    const n = exams[0].questions.length;
    for (let i = 0; i < n; i++) {
      html += '<tr><td>Câu ' + (i + 1) + '</td>'
        + exams.map((e) => '<td><strong>' + T.answerKey(e)[i] + '</strong></td>').join('') + '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function renderTabs() {
    $('td-tabs').innerHTML = exams.map((e) => '<button type="button" class="tab' + (e.code === activeCode ? ' tab-active' : '') + '" data-code="' + e.code + '">Mã đề ' + e.code + '</button>').join('');
  }

  function renderResult() {
    renderTabs();
    $('td-sheet').innerHTML = sheetHtml(activeExam());
    $('td-key').innerHTML = keyHtml();
    $('td-result').style.display = '';
  }

  function doShuffle() {
    const questions = parseAndPreview();
    const valid = questions.filter((q) => !q.errors.length);
    if (!valid.length) {
      toast('Chưa có câu hỏi hợp lệ nào để trộn — kiểm tra lại đề gốc ở ô trên.');
      $('td-input').focus();
      return;
    }
    exams = T.shuffleExam(questions, {
      shuffleQuestions: $('td-shuffle-q').checked,
      shuffleOptions: $('td-shuffle-a').checked,
      codeCount: parseInt($('td-codes').value, 10) || 4,
    });
    activeCode = exams[0].code;
    renderResult();
    toast('Đã trộn thành ' + exams.length + ' mã đề (' + valid.length + ' câu mỗi đề).');
    $('td-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function download(filename, content, mime) {
    const blob = new Blob(['\ufeff' + content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function printHtml(html) {
    const old = document.getElementById('td-print-sheet');
    if (old) old.remove();
    const div = document.createElement('div');
    div.id = 'td-print-sheet';
    div.innerHTML = html;
    document.body.appendChild(div);
    document.body.classList.add('td-printing');
    function cleanup() {
      div.remove();
      document.body.classList.remove('td-printing');
      window.removeEventListener('afterprint', cleanup);
    }
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  function loadMammoth() {
    if (typeof window !== 'undefined' && window.mammoth) return Promise.resolve(window.mammoth);
    if (mammothPromise) return mammothPromise;
    mammothPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/assets/vendor/mammoth.browser.min.js';
      s.onload = () => resolve(window.mammoth);
      s.onerror = () => { mammothPromise = null; reject(new Error('Không tải được bộ đọc Word.')); };
      document.head.appendChild(s);
    });
    return mammothPromise;
  }

  function fileMsg(text) {
    const el = $('td-file-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function setInputText(text, source) {
    $('td-input').value = text;
    save(INPUT_KEY, text);
    const questions = parseAndPreview();
    const valid = questions.filter((q) => !q.errors.length);
    fileMsg('Đã đọc ' + source + ': ' + questions.length + ' câu, ' + valid.length + ' câu hợp lệ.');
  }

  $('td-input').addEventListener('input', () => {
    saveInputSoon();
    parseAndPreview();
  });
  ['td-title', 'td-duration', 'td-codes', 'td-shuffle-q', 'td-shuffle-a'].forEach((id) => {
    $(id).addEventListener('change', saveOpts);
  });
  $('td-title').addEventListener('input', saveOpts);
  $('td-shuffle').addEventListener('click', doShuffle);

  $('td-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-code]');
    if (!btn) return;
    activeCode = parseInt(btn.getAttribute('data-code'), 10);
    renderResult();
  });

  $('td-copy-exam').addEventListener('click', () => {
    if (!exams) return;
    copyText(T.examToText(activeExam(), meta())).then((ok) => toast(ok ? 'Đã chép đề mã ' + activeExam().code + '.' : 'Không chép được — thử bôi đen đề rồi chép tay.'));
  });
  $('td-copy-key').addEventListener('click', () => {
    if (!exams) return;
    copyText(T.answerKeyToText(exams)).then((ok) => toast(ok ? 'Đã chép bảng đáp án (dán thẳng vào Excel được).' : 'Không chép được — thử bôi đen bảng rồi chép tay.'));
  });
  $('td-print-exam').addEventListener('click', () => {
    if (!exams) return;
    printHtml(sheetHtml(activeExam()));
  });
  $('td-print-key').addEventListener('click', () => {
    if (!exams) return;
    printHtml('<div class="td-sheet"><div class="td-sheet-head"><h4>Bảng đáp án — ' + esc(meta().title) + '</h4><p class="muted">Chỉ dành cho giáo viên chấm bài.</p></div>' + keyHtml() + '</div>');
  });
  $('td-download-doc').addEventListener('click', () => {
    if (!exams) return;
    download('de-trac-nghiem-ma-' + activeExam().code + '.doc', T.examToWordHtml(activeExam(), meta()), 'application/msword');
    toast('Đã tải file Word mã đề ' + activeExam().code + ' (mở bằng Word, bảng đáp án ở cuối file).');
  });
  $('td-download-txt').addEventListener('click', () => {
    if (!exams) return;
    download('de-trac-nghiem-tat-ca-ma-de.txt', T.allExamsToText(exams, meta()), 'text/plain');
    toast('Đã tải file văn bản tất cả mã đề + bảng đáp án.');
  });

  // Nút 2 lần bấm (mẫu xóa bộ câu hỏi ở Bốc câu hỏi): tránh thay/xóa
  // đề gốc vô tình.
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
      btn.dispatchEvent(new CustomEvent('td-confirmed'));
    });
  }
  armConfirm($('td-sample'), 'Dùng đề mẫu 10 câu');
  armConfirm($('td-clear'), 'Xóa hết');
  $('td-sample').addEventListener('td-confirmed', () => {
    setInputText(T.SAMPLE_EXAM_TEXT, 'đề mẫu');
  });
  $('td-clear').addEventListener('td-confirmed', () => {
    setInputText('', 'đề trống');
    fileMsg('');
  });

  $('td-file').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.txt')) {
      fileMsg('Đang đọc file ' + file.name + '…');
      file.text().then(
        (text) => setInputText(text, 'file ' + file.name),
        () => fileMsg('Không đọc được file ' + file.name + ' — thử lại hoặc dán văn bản vào ô trên.'),
      );
      return;
    }
    if (name.endsWith('.docx')) {
      fileMsg('Đang tải bộ đọc Word (khoảng 620 KB, chỉ tải 1 lần)…');
      loadMammoth().then(
        (mammoth) => {
          fileMsg('Đang đọc file ' + file.name + '…');
          return file.arrayBuffer().then(
            (buf) => mammoth.extractRawText({ arrayBuffer: buf }).then(
              (res) => setInputText(res.value || '', 'file ' + file.name),
              () => fileMsg('Không đọc được nội dung file ' + file.name + ' — file có thể không phải Word chuẩn.'),
            ),
            () => fileMsg('Không đọc được file ' + file.name + '.'),
          );
        },
        () => fileMsg('Không tải được bộ đọc Word — kiểm tra mạng rồi thử lại, hoặc dán văn bản vào ô trên.'),
      );
      return;
    }
    fileMsg('Chỉ nhận file .txt hoặc .docx — file ' + file.name + ' không đọc được.');
  });

  // Khôi phục lần nhập trước; chưa có thì điền đề mẫu 10 câu.
  (function restore() {
    const savedInput = load(INPUT_KEY);
    $('td-input').value = savedInput != null ? savedInput : T.SAMPLE_EXAM_TEXT;
    try {
      const opts = JSON.parse(load(OPTS_KEY) || '{}');
      if (opts.title) $('td-title').value = opts.title;
      if (opts.duration) $('td-duration').value = opts.duration;
      if (opts.codes) $('td-codes').value = opts.codes;
      if (typeof opts.sq === 'boolean') $('td-shuffle-q').checked = opts.sq;
      if (typeof opts.sa === 'boolean') $('td-shuffle-a').checked = opts.sa;
    } catch (e) { /* bỏ qua */ }
  })();

  parseAndPreview();
}
