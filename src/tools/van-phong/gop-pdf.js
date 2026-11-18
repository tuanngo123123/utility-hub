// Gop nhieu PDF thanh 1 file — dung pdf-lib (PDFDocument.copyPages).
// Moi xu ly chay tren trinh duyet, file khong roi may.
export const meta = {
  id: 'gop-pdf',
  name: 'Gộp nhiều PDF thành 1 file',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Gộp nhiều file PDF thành một file duy nhất, xếp thứ tự tùy ý bằng nút lên/xuống. Chạy ngay trên trình duyệt, file không rời khỏi máy bạn.',
  keywords: 'gộp pdf, nối pdf, merge pdf, hợp nhất pdf, ghép file pdf',
  icon: '📑',
  seoTitle: 'Gộp PDF online miễn phí — Nối nhiều file PDF thành 1',
  seoDesc: 'Gộp nhiều file PDF thành một file duy nhất, sắp xếp thứ tự tùy ý. Miễn phí, xử lý ngay trên trình duyệt, không tải file lên máy chủ.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📑</span><div><h2>Gộp nhiều PDF thành 1 file</h2><p class="muted">Chọn nhiều file PDF, xếp thứ tự rồi gộp thành một file duy nhất.</p></div></div>
  <p class="note">🔒 File chỉ được xử lý trên máy của bạn (thư viện pdf-lib chạy trong trình duyệt), KHÔNG tải lên máy chủ nào.</p>
  <div class="field"><label for="gp-file">Chọn các file PDF (giữ Ctrl/Cmd để chọn nhiều file)</label><input id="gp-file" type="file" accept=".pdf,application/pdf" multiple><p class="hint">Tối đa 20 file, mỗi file tối đa 30 MB. PDF có mật khẩu chưa hỗ trợ.</p></div>
  <div id="gp-list"></div>
  <div id="gp-status"></div>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="gp-go">Gộp thành 1 file PDF</button><button type="button" class="btn btn-ghost" id="gp-clear">Xóa hết</button></div>
  <div id="gp-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 30 * 1024 * 1024;
  const MAX_FILES = 20;

  var files = []; // {name, doc, pages}
  var resultURL = null;

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showStatus(html) { $('gp-status').innerHTML = html; }
  function showError(msg) { showStatus('<p class="error">' + msg + '</p>'); }

  function renderList() {
    if (!files.length) { $('gp-list').innerHTML = ''; return; }
    var total = 0;
    files.forEach(function (f) { total += f.pages; });
    var html = '<table class="tbl"><tr><th>#</th><th>Tên file</th><th>Số trang</th><th>Thứ tự</th></tr>';
    files.forEach(function (f, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + escHtml(f.name) + '</td><td>' + f.pages + '</td><td>' +
        '<button type="button" class="btn btn-ghost" data-act="up" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + '>↑</button> ' +
        '<button type="button" class="btn btn-ghost" data-act="down" data-i="' + i + '"' + (i === files.length - 1 ? ' disabled' : '') + '>↓</button> ' +
        '<button type="button" class="btn btn-ghost" data-act="del" data-i="' + i + '">✕</button></td></tr>';
    });
    html += '</table><p class="muted small">' + files.length + ' file — tổng ' + total + ' trang.</p>';
    $('gp-list').innerHTML = html;
  }

  $('gp-list').addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('button[data-act]') : null;
    if (!btn) return;
    var i = +btn.getAttribute('data-i');
    var act = btn.getAttribute('data-act');
    if (act === 'del') files.splice(i, 1);
    else if (act === 'up' && i > 0) { var t = files[i - 1]; files[i - 1] = files[i]; files[i] = t; }
    else if (act === 'down' && i < files.length - 1) { var t2 = files[i + 1]; files[i + 1] = files[i]; files[i] = t2; }
    renderList();
  });

  $('gp-file').addEventListener('change', async function () {
    var picked = Array.prototype.slice.call($('gp-file').files || []);
    $('gp-file').value = '';
    if (!picked.length) return;
    var PDFLib = (typeof window !== 'undefined' && window.PDFLib) || null;
    if (!PDFLib || !PDFLib.PDFDocument) {
      showError('Thư viện xử lý PDF chưa tải được — kiểm tra mạng rồi tải lại trang.');
      return;
    }
    for (var k = 0; k < picked.length; k++) {
      var file = picked[k];
      if (files.length >= MAX_FILES) { showError('Đã đủ ' + MAX_FILES + ' file — xóa bớt file rồi thêm tiếp.'); break; }
      if (file.size > MAX_BYTES) { showError('File "' + file.name + '" quá lớn (' + fmtBytes(file.size) + '). Giới hạn 30 MB/file.'); continue; }
      try {
        var bytes = new Uint8Array(await file.arrayBuffer());
        var doc = await PDFLib.PDFDocument.load(bytes);
        files.push({ name: file.name, doc: doc, pages: doc.getPageCount() });
      } catch (e) {
        showError('Không đọc được file "' + file.name + '" — file có thể đã hỏng, không đúng định dạng PDF, hoặc có mật khẩu.');
      }
    }
    renderList();
  });

  $('gp-clear').addEventListener('click', function () {
    files = [];
    $('gp-out').innerHTML = '';
    showStatus('');
    renderList();
  });

  $('gp-go').addEventListener('click', async function () {
    $('gp-out').innerHTML = '';
    if (files.length < 2) { showError('Hãy chọn ít nhất 2 file PDF để gộp.'); return; }
    var PDFLib = (typeof window !== 'undefined' && window.PDFLib) || null;
    if (!PDFLib || !PDFLib.PDFDocument) {
      showError('Thư viện xử lý PDF chưa tải được — kiểm tra mạng rồi tải lại trang.');
      return;
    }
    var btn = $('gp-go');
    var setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang gộp…');
    btn.disabled = true;
    try {
      var merged = await PDFLib.PDFDocument.create();
      for (var i = 0; i < files.length; i++) {
        var src = files[i].doc;
        var pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(function (p) { merged.addPage(p); });
      }
      var outBytes = await merged.save();
      var blob = new Blob([outBytes], { type: 'application/pdf' });
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = URL.createObjectURL(blob);
      var totalPages = merged.getPageCount();
      var fname = 'da-gop-' + files.length + '-file.pdf';
      $('gp-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>File đã gộp</span><strong>' + totalPages + ' trang — ' + fmtBytes(blob.size) + '</strong></div></div>' +
        '<button type="button" class="btn btn-primary" id="gp-dl">Tải file PDF đã gộp (' + fname + ')</button>';
      $('gp-dl').addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = resultURL;
        a.download = fname;
        a.click();
        toast('Đã tải file PDF đã gộp.');
      });
      showStatus('');
      toast('Đã gộp ' + files.length + ' file thành ' + totalPages + ' trang.');
    } catch (e) {
      showError('Không gộp được các file này. Hãy thử lại hoặc kiểm tra file PDF có bị hỏng không.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
