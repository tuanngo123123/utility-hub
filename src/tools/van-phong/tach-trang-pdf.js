// Tach/lay mot vai trang tu PDF — dung pdf-lib (PDFDocument.copyPages).
// Moi xu ly chay tren trinh duyet, file khong roi may.
export const meta = {
  id: 'tach-trang-pdf',
  name: 'Tách trang PDF: lấy vài trang thành file mới',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Lấy một vài trang từ file PDF (Ví dụ: trang 1, 3, 5–7) thành file PDF mới, giữ nguyên nội dung trang. Chạy ngay trên trình duyệt, file không rời khỏi máy bạn.',
  keywords: 'tách trang pdf, lấy trang pdf, cắt trang pdf, split pdf, trích trang pdf',
  icon: '✂️',
  seoTitle: 'Tách trang PDF online miễn phí — Lấy vài trang thành file mới',
  seoDesc: 'Lấy một vài trang từ file PDF thành file PDF mới (Ví dụ: trang 1, 3, 5–7). Miễn phí, xử lý ngay trên trình duyệt, không tải file lên máy chủ.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>✂️</span><div><h2>Tách trang PDF: lấy vài trang thành file mới</h2><p class="muted">Chọn file PDF, nhập các trang muốn lấy rồi tải file PDF mới về.</p></div></div>
  <p class="note">🔒 File chỉ được xử lý trên máy của bạn (thư viện pdf-lib chạy trong trình duyệt), KHÔNG tải lên máy chủ nào.</p>
  <div class="field"><label for="ttp-file">Chọn file PDF</label><input id="ttp-file" type="file" accept=".pdf,application/pdf"><p class="hint">Tối đa 30 MB. PDF có mật khẩu chưa hỗ trợ.</p></div>
  <div id="ttp-info"></div>
  <div class="field"><label for="ttp-pages">Các trang muốn lấy</label><input id="ttp-pages" type="text" inputmode="text" placeholder="Ví dụ: 1, 3, 5-7" autocomplete="off"><p class="hint">Nhập số trang, cách nhau bằng dấu phẩy; dùng dấu gạch ngang cho khoảng trang (Ví dụ: 5-7 là trang 5, 6, 7). Trang trùng sẽ chỉ lấy một lần, theo thứ tự tăng dần.</p></div>
  <div class="btn-row"><button type="button" class="btn btn-ghost" id="ttp-odd">Chọn trang lẻ</button><button type="button" class="btn btn-ghost" id="ttp-even">Chọn trang chẵn</button></div>
  <div id="ttp-status"></div>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="ttp-go">Tách thành file PDF mới</button></div>
  <div id="ttp-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 30 * 1024 * 1024;

  var doc = null;       // PDFDocument da tai
  var numPages = 0;
  var baseName = 'tai-lieu';
  var resultURL = null;

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function showStatus(html) { $('ttp-status').innerHTML = html; }
  function showError(msg) { showStatus('<p class="error">' + msg + '</p>'); }

  // "1, 3, 5-7" -> [1,3,5,6,7] (da loai trung, tang dan). Tra {pages} hoac {error}.
  function parsePages(input, max) {
    var seen = {};
    var out = [];
    var tokens = (input || '').split(',');
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i].trim();
      if (!tok) continue;
      var m = tok.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        var a = +m[1], b = +m[2];
        if (a > b) return { error: 'Khoảng "' + tok + '" không hợp lệ — số đầu phải nhỏ hơn hoặc bằng số cuối.' };
        if (a < 1 || b > max) return { error: 'Khoảng "' + tok + '" vượt ngoài số trang (1–' + max + ').' };
        for (var p = a; p <= b; p++) { if (!seen[p]) { seen[p] = true; out.push(p); } }
      } else if (/^\d+$/.test(tok)) {
        var n = +tok;
        if (n < 1 || n > max) return { error: 'Trang ' + n + ' không tồn tại — file này chỉ có ' + max + ' trang.' };
        if (!seen[n]) { seen[n] = true; out.push(n); }
      } else {
        return { error: '"' + tok + '" không hiểu được — chỉ nhập số trang và dấu gạch ngang (Ví dụ: 1, 3, 5-7).' };
      }
    }
    if (!out.length) return { error: 'Hãy nhập ít nhất một trang muốn lấy (Ví dụ: 1, 3, 5-7).' };
    out.sort(function (x, y) { return x - y; });
    return { pages: out };
  }

  $('ttp-file').addEventListener('change', async function () {
    var file = $('ttp-file').files && $('ttp-file').files[0];
    $('ttp-out').innerHTML = '';
    showStatus('');
    doc = null;
    numPages = 0;
    if (!file) { $('ttp-info').innerHTML = ''; return; }
    if (file.size > MAX_BYTES) {
      $('ttp-info').innerHTML = '';
      showError('File quá lớn (' + fmtBytes(file.size) + '). Giới hạn 30 MB.');
      return;
    }
    var PDFLib = (typeof window !== 'undefined' && window.PDFLib) || null;
    if (!PDFLib || !PDFLib.PDFDocument) {
      showError('Thư viện xử lý PDF chưa tải được — kiểm tra mạng rồi tải lại trang.');
      return;
    }
    try {
      var bytes = new Uint8Array(await file.arrayBuffer());
      doc = await PDFLib.PDFDocument.load(bytes);
      numPages = doc.getPageCount();
      var i = file.name.lastIndexOf('.');
      baseName = i > 0 ? file.name.slice(0, i) : file.name;
      $('ttp-info').innerHTML = '<div class="result"><div class="result-row"><span>File PDF</span><strong>' + numPages + ' trang — ' + fmtBytes(file.size) + '</strong></div></div>';
    } catch (e) {
      doc = null;
      $('ttp-info').innerHTML = '';
      showError('Không đọc được file PDF này — file có thể đã hỏng, không đúng định dạng PDF, hoặc có mật khẩu.');
    }
  });

  function fillParity(odd) {
    if (!numPages) { toast('Hãy chọn file PDF trước đã.'); return; }
    var list = [];
    for (var p = odd ? 1 : 2; p <= numPages; p += 2) list.push(p);
    $('ttp-pages').value = list.join(', ');
  }
  $('ttp-odd').addEventListener('click', function () { fillParity(true); });
  $('ttp-even').addEventListener('click', function () { fillParity(false); });

  $('ttp-go').addEventListener('click', async function () {
    $('ttp-out').innerHTML = '';
    if (!doc) { showError('Hãy chọn file PDF trước đã.'); return; }
    var parsed = parsePages($('ttp-pages').value, numPages);
    if (parsed.error) { showError(parsed.error); return; }
    var PDFLib = (typeof window !== 'undefined' && window.PDFLib) || null;
    if (!PDFLib || !PDFLib.PDFDocument) {
      showError('Thư viện xử lý PDF chưa tải được — kiểm tra mạng rồi tải lại trang.');
      return;
    }
    var btn = $('ttp-go');
    var setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang tách…');
    btn.disabled = true;
    try {
      var out = await PDFLib.PDFDocument.create();
      var indices = parsed.pages.map(function (p) { return p - 1; });
      var pages = await out.copyPages(doc, indices);
      pages.forEach(function (p) { out.addPage(p); });
      var outBytes = await out.save();
      var blob = new Blob([outBytes], { type: 'application/pdf' });
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = URL.createObjectURL(blob);
      var fname = baseName + '-tach-' + parsed.pages.length + '-trang.pdf';
      $('ttp-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>File mới</span><strong>' + parsed.pages.length + ' trang (trang ' + parsed.pages.join(', ') + ') — ' + fmtBytes(blob.size) + '</strong></div></div>' +
        '<button type="button" class="btn btn-primary" id="ttp-dl">Tải file PDF mới (' + fname + ')</button>';
      $('ttp-dl').addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = resultURL;
        a.download = fname;
        a.click();
        toast('Đã tải file PDF mới.');
      });
      showStatus('');
      toast('Đã tách ' + parsed.pages.length + ' trang.');
    } catch (e) {
      showError('Không tách được file này. Hãy thử lại hoặc kiểm tra file PDF có bị hỏng không.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
