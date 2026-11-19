// Anh -> PDF — canvas xuat JPEG roi nhung truc tiep vao file PDF viet tay
// (khong can thu vien PDF nao). Moi xu ly chay tren trinh duyet.
export const meta = {
  id: 'anh-sang-pdf',
  name: 'Ảnh → PDF: ghép nhiều ảnh thành file PDF',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Ghép nhiều ảnh (JPG, PNG, WebP…) thành một file PDF — mỗi ảnh một trang, chọn khổ vừa ảnh hoặc khổ A4. Chạy ngay trên trình duyệt, ảnh không rời khỏi máy bạn.',
  keywords: 'ảnh sang pdf, jpg sang pdf, png sang pdf, ghép ảnh thành pdf, image to pdf',
  icon: '🖼️',
  seoTitle: 'Ảnh → PDF online miễn phí — Ghép nhiều ảnh thành file PDF',
  seoDesc: 'Ghép nhiều ảnh JPG, PNG, WebP thành một file PDF — mỗi ảnh một trang, khổ vừa ảnh hoặc A4. Miễn phí, xử lý ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🖼️</span><div><h2>Ảnh → PDF: ghép nhiều ảnh thành file PDF</h2><p class="muted">Chọn nhiều ảnh, xếp thứ tự rồi ghép thành một file PDF — mỗi ảnh một trang.</p></div></div>
  <p class="note">🔒 Ảnh chỉ được xử lý trên máy của bạn (canvas + trình ghi PDF viết tay), KHÔNG tải lên máy chủ nào. Ảnh PNG nền trong suốt sẽ thành nền trắng trong PDF.</p>
  <div class="field"><label for="asp-file">Chọn các ảnh (giữ Ctrl/Cmd để chọn nhiều ảnh)</label><input id="asp-file" type="file" accept="image/*" multiple><p class="hint">Tối đa 20 ảnh, mỗi ảnh tối đa 20 MB, mỗi chiều tối đa 8.000 px.</p></div>
  <div id="asp-list"></div>
  <div class="grid-2">
    <div class="field"><label for="asp-size">Khổ trang PDF</label><select id="asp-size"><option value="fit">Vừa ảnh (trang bằng đúng tỷ lệ ảnh)</option><option value="a4">Khổ A4 (ảnh căn giữa, nền trắng)</option></select></div>
    <div class="field"><label for="asp-quality">Chất lượng ảnh trong PDF: <strong id="asp-quality-val">85%</strong></label><input id="asp-quality" type="range" min="50" max="100" value="85"></div>
  </div>
  <div id="asp-status"></div>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="asp-go">Ghép thành file PDF</button><button type="button" class="btn btn-ghost" id="asp-clear">Xóa hết</button></div>
  <div id="asp-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 20 * 1024 * 1024;
  const MAX_DIM = 8000;
  const MAX_FILES = 20;
  const MAX_PDF_DIM = 4000; // chieu anh toi da trong PDF (px) — anh lon hon se thu nho

  var images = []; // {name, img, w, h, url}
  var resultURL = null;

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showStatus(html) { $('asp-status').innerHTML = html; }
  function showError(msg) { showStatus('<p class="error">' + msg + '</p>'); }

  // Ghi file PDF toi gian: moi trang 1 anh JPEG (DCTDecode). Tu chua hoan
  // toan (khong phu thuoc DOM) de de kiem thu.
  // pages: [{jpeg: Uint8Array, w, h, pageW, pageH}] — w/h: px anh; pageW/pageH: diem (pt).
  function buildPdfFromJpegs(pages) {
    function fmt(n) {
      var s = n.toFixed(2);
      return s.replace(/\.?0+$/, '') || '0';
    }
    var enc = new TextEncoder();
    var parts = []; // Uint8Array
    var offsets = {};
    var len = 0;
    function pushBytes(bytes) { parts.push(bytes); len += bytes.length; }
    function pushStr(s) { pushBytes(enc.encode(s)); }
    function pushObj(id, bodyStr, streamBytes) {
      offsets[id] = len;
      pushStr(id + ' 0 obj\n' + bodyStr + '\n');
      if (streamBytes) {
        pushStr('stream\n');
        pushBytes(streamBytes);
        pushStr('\nendstream\n');
      }
      pushStr('endobj\n');
    }
    pushStr('%PDF-1.4\n');
    var kids = pages.map(function (_, i) { return (3 + 3 * i) + ' 0 R'; }).join(' ');
    pushObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    pushObj(2, '<< /Type /Pages /Kids [' + kids + '] /Count ' + pages.length + ' >>');
    pages.forEach(function (pg, i) {
      var pageId = 3 + 3 * i, imgId = 4 + 3 * i, contentId = 5 + 3 * i;
      pushObj(pageId, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + fmt(pg.pageW) + ' ' + fmt(pg.pageH) + ']' +
        ' /Resources << /XObject << /Im0 ' + imgId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>');
      pushObj(imgId, '<< /Type /XObject /Subtype /Image /Width ' + pg.w + ' /Height ' + pg.h +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.jpeg.length + ' >>', pg.jpeg);
      var scale = Math.min(pg.pageW / pg.w, pg.pageH / pg.h);
      var dw = pg.w * scale, dh = pg.h * scale;
      var x = (pg.pageW - dw) / 2, y = (pg.pageH - dh) / 2;
      var content = 'q ' + fmt(dw) + ' 0 0 ' + fmt(dh) + ' ' + fmt(x) + ' ' + fmt(y) + ' cm /Im0 Do Q';
      var contentBytes = enc.encode(content);
      pushObj(contentId, '<< /Length ' + contentBytes.length + ' >>', contentBytes);
    });
    var xrefPos = len;
    var maxId = 2 + 3 * pages.length;
    pushStr('xref\n0 ' + (maxId + 1) + '\n0000000000 65535 f \n');
    for (var id = 1; id <= maxId; id++) {
      var off = offsets[id];
      pushStr(('0000000000' + off).slice(-10) + ' 00000 n \n');
    }
    pushStr('trailer\n<< /Size ' + (maxId + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF\n');
    var out = new Uint8Array(len);
    var o = 0;
    parts.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }

  function renderList() {
    if (!images.length) { $('asp-list').innerHTML = ''; return; }
    var html = '<table class="tbl"><tr><th>#</th><th>Ảnh</th><th>Kích thước</th><th>Thứ tự</th></tr>';
    images.forEach(function (im, i) {
      html += '<tr><td>' + (i + 1) + '</td><td><span data-thumb="' + i + '"></span> ' + escHtml(im.name) + '</td><td>' + im.w + ' × ' + im.h + ' px</td><td>' +
        '<button type="button" class="btn btn-ghost" data-act="up" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + '>↑</button> ' +
        '<button type="button" class="btn btn-ghost" data-act="down" data-i="' + i + '"' + (i === images.length - 1 ? ' disabled' : '') + '>↓</button> ' +
        '<button type="button" class="btn btn-ghost" data-act="del" data-i="' + i + '">✕</button></td></tr>';
    });
    html += '</table><p class="muted small">' + images.length + ' ảnh — mỗi ảnh thành một trang PDF.</p>';
    $('asp-list').innerHTML = html;
    // Gan anh thu nho (thumb 64px) sau khi render bang.
    var thumbs = $('asp-list').querySelectorAll('[data-thumb]');
    thumbs.forEach(function (span) {
      var im = images[+span.getAttribute('data-thumb')];
      var t = document.createElement('img');
      t.src = im.url;
      t.alt = '';
      t.style.width = '64px';
      t.style.height = 'auto';
      t.style.verticalAlign = 'middle';
      t.style.borderRadius = '4px';
      span.appendChild(t);
    });
  }

  $('asp-list').addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('button[data-act]') : null;
    if (!btn) return;
    var i = +btn.getAttribute('data-i');
    var act = btn.getAttribute('data-act');
    if (act === 'del') { URL.revokeObjectURL(images[i].url); images.splice(i, 1); }
    else if (act === 'up' && i > 0) { var t = images[i - 1]; images[i - 1] = images[i]; images[i] = t; }
    else if (act === 'down' && i < images.length - 1) { var t2 = images[i + 1]; images[i + 1] = images[i]; images[i] = t2; }
    renderList();
  });

  $('asp-quality').addEventListener('input', function () {
    $('asp-quality-val').textContent = $('asp-quality').value + '%';
  });

  function loadImageFile(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var im = new Image();
        im.onload = function () {
          if (im.naturalWidth > MAX_DIM || im.naturalHeight > MAX_DIM) {
            showError('Ảnh "' + file.name + '" quá lớn (' + im.naturalWidth + ' × ' + im.naturalHeight + ' px). Mỗi chiều tối đa 8.000 px.');
            resolve(null);
            return;
          }
          resolve({ name: file.name, img: im, w: im.naturalWidth, h: im.naturalHeight, url: reader.result });
        };
        im.onerror = function () {
          showError('Không đọc được ảnh "' + file.name + '". File có thể đã hỏng hoặc định dạng lạ.');
          resolve(null);
        };
        im.src = reader.result;
      };
      reader.onerror = function () {
        showError('Không đọc được file "' + file.name + '".');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }

  $('asp-file').addEventListener('change', async function () {
    var picked = Array.prototype.slice.call($('asp-file').files || []);
    $('asp-file').value = '';
    if (!picked.length) return;
    for (var k = 0; k < picked.length; k++) {
      var file = picked[k];
      if (images.length >= MAX_FILES) { showError('Đã đủ ' + MAX_FILES + ' ảnh — xóa bớt ảnh rồi thêm tiếp.'); break; }
      if (!file.type || file.type.indexOf('image/') !== 0) {
        showError('File "' + file.name + '" không phải ảnh. Hãy chọn file ảnh (JPG, PNG, WebP…).');
        continue;
      }
      if (file.size > MAX_BYTES) {
        showError('Ảnh "' + file.name + '" quá lớn (' + fmtBytes(file.size) + '). Giới hạn 20 MB/ảnh.');
        continue;
      }
      var loaded = await loadImageFile(file);
      if (loaded) images.push(loaded);
    }
    renderList();
  });

  $('asp-clear').addEventListener('click', function () {
    images.forEach(function (im) { URL.revokeObjectURL(im.url); });
    images = [];
    $('asp-out').innerHTML = '';
    showStatus('');
    renderList();
  });

  function canvasToJpeg(img, w, h, quality) {
    return new Promise(function (resolve, reject) {
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h); // nen trang cho anh PNG trong suot
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('toBlob')); return; }
        blob.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); }).catch(reject);
      }, 'image/jpeg', quality);
    });
  }

  $('asp-go').addEventListener('click', async function () {
    $('asp-out').innerHTML = '';
    if (!images.length) { showError('Hãy chọn ít nhất 1 ảnh để ghép.'); return; }
    var btn = $('asp-go');
    var setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang ghép…');
    btn.disabled = true;
    try {
      var mode = $('asp-size').value;
      var quality = (+$('asp-quality').value) / 100;
      var pages = [];
      for (var i = 0; i < images.length; i++) {
        showStatus('<p class="muted">Đang xử lý ảnh ' + (i + 1) + '/' + images.length + '…</p>');
        var im = images[i];
        var scale = Math.min(1, MAX_PDF_DIM / Math.max(im.w, im.h));
        var w = Math.max(1, Math.round(im.w * scale));
        var h = Math.max(1, Math.round(im.h * scale));
        var jpeg = await canvasToJpeg(im.img, w, h, quality);
        var pageW, pageH;
        if (mode === 'a4') { pageW = 595; pageH = 842; }
        else {
          // Vua anh: 1 px = 0,75 pt (96 dpi), canh dai nhat toi da 842 pt.
          var s = Math.min(0.75, 842 / Math.max(w, h));
          pageW = w * s;
          pageH = h * s;
        }
        pages.push({ jpeg: jpeg, w: w, h: h, pageW: pageW, pageH: pageH });
      }
      var pdfBytes = buildPdfFromJpegs(pages);
      var blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = URL.createObjectURL(blob);
      var fname = 'anh-' + pages.length + '-trang.pdf';
      $('asp-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>File PDF</span><strong>' + pages.length + ' trang — ' + fmtBytes(blob.size) + '</strong></div></div>' +
        '<button type="button" class="btn btn-primary" id="asp-dl">Tải file PDF (' + fname + ')</button>';
      $('asp-dl').addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = resultURL;
        a.download = fname;
        a.click();
        toast('Đã tải file PDF.');
      });
      showStatus('');
      toast('Đã ghép ' + pages.length + ' ảnh thành file PDF.');
    } catch (e) {
      showError('Không ghép được ảnh này (ảnh quá lớn so với bộ nhớ trình duyệt, hoặc định dạng lạ). Hãy thử ảnh khác.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
