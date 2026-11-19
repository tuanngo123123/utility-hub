// Ảnh thẻ 3×4/4×6/2×3 + nén ảnh — Văn phòng.
// Kích thước/tỷ lệ/tờ in nằm trong src/anh-the-logic.js (build.mjs
// chèn vào trang); init() dưới đây chỉ nối giao diện với
// window.UH_ANHTHE. Mọi xử lý chạy trên trình duyệt (canvas +
// toBlob), không dùng thư viện ảnh nào, ảnh không rời khỏi máy.
export const meta = {
  id: 'anh-the-3x4-4x6',
  name: 'Ảnh thẻ 3×4/4×6/2×3 + nén ảnh',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Cắt ảnh thành ảnh thẻ 3×4, 4×6 hoặc 2×3 đúng chuẩn 300 DPI, in nhiều ảnh trên một tờ 10×15 để cắt ra, và nén ảnh JPG nhẹ đi.',
  keywords: ['ảnh thẻ', 'anh the', 'ảnh 3x4', 'ảnh 3×4', 'ảnh 4x6', 'ảnh 2x3', 'làm ảnh thẻ', 'cắt ảnh thẻ', 'in ảnh thẻ', 'nén ảnh', 'nen anh', 'giảm dung lượng ảnh', 'nén jpg'],
  icon: '🪪',
  seoTitle: 'Làm ảnh thẻ 3×4, 4×6 online miễn phí + nén ảnh | Tiện Ích Hub',
  seoDesc: 'Cắt ảnh thành ảnh thẻ 3×4, 4×6, 2×3 đúng chuẩn 300 DPI, tải tờ in 10×15 nhiều ảnh để in ra cắt, nén ảnh JPG nhẹ đi. Miễn phí, xử lý ngay trên trình duyệt, ảnh không rời khỏi máy bạn.',
};

export function body() {
  return `
<div class="tool-panel" data-uh-no-reset="1">
  <div class="tool-head"><span>🪪</span><div><h2>Ảnh thẻ 3×4 / 4×6 / 2×3</h2><p class="muted">Tải ảnh chân dung lên, kéo thả để căn khung, rồi tải ảnh thẻ hoặc tờ in 10×15.</p></div></div>
  <p class="note">🔒 Ảnh chỉ được xử lý trên máy của bạn (trình duyệt cắt và xuất ảnh), KHÔNG tải lên máy chủ nào.</p>
  <div class="field"><label for="at-file">Bước 1 — Chọn ảnh chân dung</label><input id="at-file" type="file" accept="image/jpeg,image/png,image/webp"><p class="hint">Ảnh JPG, PNG hoặc WebP, tối đa 20 MB, mỗi chiều tối đa 8.000 px. Chưa hỗ trợ ảnh HEIC của iPhone (xem câu hỏi bên dưới).</p></div>
  <div id="at-status"></div>
  <div class="grid-2">
    <div class="field"><label for="at-size">Bước 2 — Cỡ ảnh thẻ</label><select id="at-size"><option value="3x4" selected>3×4 cm — hồ sơ, xin việc</option><option value="4x6">4×6 cm — hộ chiếu, visa</option><option value="2x3">2×3 cm — thẻ học sinh</option></select></div>
    <div class="field"><label for="at-bg">Nền ảnh</label><select id="at-bg"><option value="#ffffff" selected>Trắng</option><option value="#4a90d9">Xanh dương</option></select><p class="hint">Chỉ tô nền khi ảnh PNG nền trong suốt — ảnh chụp thường đã có nền sẵn, công cụ không tách nền.</p></div>
  </div>
  <div class="field"><label>Bước 3 — Căn khung cắt (kéo ảnh để di chuyển, kéo thanh trượt để phóng to)</label>
    <div class="at-frame-wrap"><div class="at-frame" id="at-frame"><img id="at-img" alt="" draggable="false"><div class="at-empty" id="at-empty">Chưa có ảnh — chọn ảnh ở bước 1 để căn khung tại đây.</div></div></div>
    <div class="at-row"><label for="at-zoom">Phóng to</label><input id="at-zoom" class="at-zoom" type="range" min="100" max="300" value="100"><strong id="at-zoom-val">100%</strong><button type="button" class="btn btn-ghost" id="at-center">Căn giữa lại</button></div>
  </div>
  <p class="muted" id="at-info"></p>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="at-dl-photo" disabled>Tải ảnh thẻ (JPG)</button><button type="button" class="btn" id="at-dl-sheet" disabled>Tải tờ in 10×15 (JPG)</button><button type="button" class="btn btn-ghost" id="at-clear">Chọn ảnh khác</button></div>
  <div id="at-out"></div>
</div>
<div class="tool-panel" data-uh-no-reset="1">
  <div class="tool-head"><span>🗜️</span><div><h2>Nén ảnh</h2><p class="muted">Giảm dung lượng ảnh JPG để gửi Zalo, email hay tải lên hồ sơ — ảnh vẫn giữ nguyên kích thước.</p></div></div>
  <div class="field"><label for="at2-file">Chọn ảnh cần nén</label><input id="at2-file" type="file" accept="image/jpeg,image/png,image/webp"><p class="hint">Ảnh JPG, PNG hoặc WebP, tối đa 20 MB. Ảnh nén ra lưu dạng JPG; ảnh PNG nền trong suốt thành nền trắng.</p></div>
  <div id="at2-status"></div>
  <div class="field"><label>Mức nén</label>
    <div class="at-row" role="radiogroup" aria-label="Mức nén">
      <label><input type="radio" name="at2-quality" value="0.9"> Nhẹ (90% — gần như không đổi)</label>
      <label><input type="radio" name="at2-quality" value="0.7" checked> Vừa (70% — khuyên dùng)</label>
      <label><input type="radio" name="at2-quality" value="0.5"> Mạnh (50% — nhỏ nhất)</label>
    </div>
  </div>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="at2-go" disabled>Nén ảnh</button><button type="button" class="btn btn-ghost" id="at2-clear">Chọn ảnh khác</button></div>
  <div id="at2-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const L = (typeof window !== 'undefined' && window.UH_ANHTHE) || null;
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  if (!L) return;
  const MAX_BYTES = 20 * 1024 * 1024;
  const MAX_DIM = 8000;
  const MAX_COMPRESS_DIM = 4000; // chieu anh toi da khi nen — anh lon hon se thu nho

  var photo = null; // {img, w, h, name}
  var zoom = 1;
  var pan = { ox: 0, oy: 0 };
  var photoURL = null;
  var sheetURL = null;
  var comp = null; // {img, w, h, name, size}
  var compURL = null;

  var frame = $('at-frame');
  var cropImg = $('at-img');

  function showStatus(el, html) { el.innerHTML = html; }
  function showError(el, msg) { showStatus(el, '<p class="error">' + msg + '</p>'); }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isHeic(file) {
    var name = (file.name || '').toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif') ||
      file.type === 'image/heic' || file.type === 'image/heif';
  }
  function checkFile(file) {
    if (isHeic(file)) return 'Ảnh HEIC của iPhone chưa được hỗ trợ. Hãy đổi ảnh sang JPG trước (xem câu hỏi “Ảnh HEIC của iPhone thì làm sao?” bên dưới), rồi tải ảnh JPG lên.';
    if (!file.type || file.type.indexOf('image/') !== 0) return 'File "' + file.name + '" không phải ảnh. Hãy chọn file ảnh (JPG, PNG, WebP).';
    if (file.size > MAX_BYTES) return 'Ảnh "' + file.name + '" quá lớn (' + L.fmtBytes(file.size) + '). Giới hạn 20 MB/ảnh.';
    return null;
  }
  function loadImageFile(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var im = new Image();
        im.onload = function () {
          if (im.naturalWidth > MAX_DIM || im.naturalHeight > MAX_DIM) {
            resolve({ error: 'Ảnh "' + file.name + '" quá lớn (' + im.naturalWidth + ' × ' + im.naturalHeight + ' px). Mỗi chiều tối đa 8.000 px.' });
            return;
          }
          resolve({ img: im, w: im.naturalWidth, h: im.naturalHeight, name: file.name, size: file.size });
        };
        im.onerror = function () {
          resolve({ error: 'Không đọc được ảnh "' + file.name + '". File có thể đã hỏng hoặc định dạng lạ.' });
        };
        im.src = reader.result;
      };
      reader.onerror = function () {
        resolve({ error: 'Không đọc được file "' + file.name + '".' });
      };
      reader.readAsDataURL(file);
    });
  }
  function downloadBlob(blob, fname) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return url;
  }
  function canvasToJpegBlob(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('toBlob'));
      }, 'image/jpeg', quality);
    });
  }

  // ---------- Ảnh thẻ ----------
  function updateInfo() {
    var sizeId = $('at-size').value;
    var px = L.sizePx(sizeId);
    var layout = L.sheetLayout(sizeId);
    $('at-info').textContent = 'Ảnh thẻ ' + L.sizeById(sizeId).label + ' — ' + px.w + ' × ' + px.h + ' px (300 DPI) · Tờ in 10×15 chứa ' + layout.count + ' ảnh.';
  }

  function resetCrop() {
    zoom = 1;
    $('at-zoom').value = '100';
    $('at-zoom-val').textContent = '100%';
    if (!photo) return;
    var fw = frame.clientWidth;
    var fh = frame.clientHeight;
    var s = L.displayScale(fw, fh, photo.w, photo.h, 1);
    pan = L.defaultPan(fw, fh, photo.w * s, photo.h * s);
    renderCrop();
  }

  function renderCrop() {
    if (!photo) return;
    var fw = frame.clientWidth;
    var fh = frame.clientHeight;
    if (!fw || !fh) return;
    var s = L.displayScale(fw, fh, photo.w, photo.h, zoom);
    var dw = photo.w * s;
    var dh = photo.h * s;
    pan = L.clampPan(pan.ox, pan.oy, fw, fh, dw, dh);
    cropImg.style.width = dw + 'px';
    cropImg.style.height = dh + 'px';
    cropImg.style.transform = 'translate(' + pan.ox + 'px,' + pan.oy + 'px)';
  }

  function applySize() {
    var ratio = L.aspect($('at-size').value);
    frame.style.aspectRatio = ratio.toFixed(4) + ' / 1';
    updateInfo();
    resetCrop();
  }

  function buildPhotoCanvas() {
    var sizeId = $('at-size').value;
    var px = L.sizePx(sizeId);
    var fw = frame.clientWidth;
    var fh = frame.clientHeight;
    var src = L.frameToSourceRect(fw, fh, photo.w, photo.h, zoom, pan.ox, pan.oy);
    var canvas = document.createElement('canvas');
    canvas.width = px.w;
    canvas.height = px.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = $('at-bg').value;
    ctx.fillRect(0, 0, px.w, px.h);
    ctx.drawImage(photo.img, src.x, src.y, src.w, src.h, 0, 0, px.w, px.h);
    return canvas;
  }

  $('at-file').addEventListener('change', async function () {
    var file = ($('at-file').files || [])[0];
    $('at-file').value = '';
    if (!file) return;
    var err = checkFile(file);
    if (err) { showError($('at-status'), err); return; }
    showStatus($('at-status'), '<p class="muted">Đang đọc ảnh…</p>');
    var loaded = await loadImageFile(file);
    if (loaded.error) { showError($('at-status'), loaded.error); return; }
    photo = loaded;
    cropImg.src = photo.img.src;
    $('at-empty').style.display = 'none';
    cropImg.style.display = 'block';
    $('at-dl-photo').disabled = false;
    $('at-dl-sheet').disabled = false;
    showStatus($('at-status'), '');
    $('at-out').innerHTML = '';
    applySize();
  });

  $('at-size').addEventListener('change', function () { if (photo) applySize(); else updateInfo(); });
  $('at-center').addEventListener('click', resetCrop);
  $('at-zoom').addEventListener('input', function () {
    if (!photo) return;
    var z = (+$('at-zoom').value) / 100;
    $('at-zoom-val').textContent = $('at-zoom').value + '%';
    // Giữ điểm giữa khung không đổi khi phóng to/thu nhỏ.
    var fw = frame.clientWidth;
    var fh = frame.clientHeight;
    var s1 = L.displayScale(fw, fh, photo.w, photo.h, zoom);
    var cx = (fw / 2 - pan.ox) / s1;
    var cy = (fh / 2 - pan.oy) / s1;
    zoom = z;
    var s2 = L.displayScale(fw, fh, photo.w, photo.h, zoom);
    pan = L.clampPan(fw / 2 - cx * s2, fh / 2 - cy * s2, fw, fh, photo.w * s2, photo.h * s2);
    renderCrop();
  });

  // Kéo ảnh trong khung để căn vị trí (chuột + cảm ứng).
  var dragging = null;
  frame.addEventListener('pointerdown', function (ev) {
    if (!photo) return;
    dragging = { x: ev.clientX, y: ev.clientY, ox: pan.ox, oy: pan.oy };
    frame.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  frame.addEventListener('pointermove', function (ev) {
    if (!dragging) return;
    var fw = frame.clientWidth;
    var fh = frame.clientHeight;
    var s = L.displayScale(fw, fh, photo.w, photo.h, zoom);
    pan = L.clampPan(
      dragging.ox + (ev.clientX - dragging.x),
      dragging.oy + (ev.clientY - dragging.y),
      fw, fh, photo.w * s, photo.h * s
    );
    renderCrop();
  });
  function endDrag() { dragging = null; }
  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', renderCrop);

  $('at-dl-photo').addEventListener('click', async function () {
    if (!photo) return;
    try {
      var sizeId = $('at-size').value;
      var canvas = buildPhotoCanvas();
      var blob = await canvasToJpegBlob(canvas, 0.92);
      if (photoURL) URL.revokeObjectURL(photoURL);
      var fname = 'anh-the-' + sizeId + '.jpg';
      photoURL = downloadBlob(blob, fname);
      var px = L.sizePx(sizeId);
      $('at-out').innerHTML = '<div class="result"><div class="result-row"><span>Ảnh thẻ ' + L.sizeById(sizeId).label + '</span><strong>' + px.w + ' × ' + px.h + ' px — ' + L.fmtBytes(blob.size) + '</strong></div></div>';
      toast('Đã tải ảnh thẻ ' + L.sizeById(sizeId).label + '.');
    } catch (e) {
      showError($('at-status'), 'Không xuất được ảnh thẻ. Hãy thử ảnh khác hoặc tải lại trang.');
    }
  });

  $('at-dl-sheet').addEventListener('click', async function () {
    if (!photo) return;
    try {
      var sizeId = $('at-size').value;
      var layout = L.sheetLayout(sizeId);
      var photoCanvas = buildPhotoCanvas();
      var canvas = document.createElement('canvas');
      canvas.width = layout.sheetW;
      canvas.height = layout.sheetH;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, layout.sheetW, layout.sheetH);
      for (var r = 0; r < layout.rows; r++) {
        for (var c = 0; c < layout.cols; c++) {
          var x = layout.offsetX + c * (layout.cellW + layout.gap);
          var y = layout.offsetY + r * (layout.cellH + layout.gap);
          if (layout.rotated) {
            // Xoay ảnh 90° để vừa ô xếp: vẽ ảnh đúng cỡ gốc rồi
            // xoay quanh tâm ô — ảnh không bị kéo méo.
            ctx.save();
            ctx.translate(x + layout.cellW / 2, y + layout.cellH / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(photoCanvas, -layout.photoW / 2, -layout.photoH / 2);
            ctx.restore();
          } else {
            ctx.drawImage(photoCanvas, x, y);
          }
        }
      }
      var blob = await canvasToJpegBlob(canvas, 0.92);
      if (sheetURL) URL.revokeObjectURL(sheetURL);
      var fname = 'to-in-anh-the-' + sizeId + '.jpg';
      sheetURL = downloadBlob(blob, fname);
      $('at-out').innerHTML = '<div class="result"><div class="result-row"><span>Tờ in 10×15 cm</span><strong>' + layout.count + ' ảnh ' + L.sizeById(sizeId).label + ' — ' + L.fmtBytes(blob.size) + '</strong></div></div>';
      toast('Đã tải tờ in 10×15 (' + layout.count + ' ảnh).');
    } catch (e) {
      showError($('at-status'), 'Không xuất được tờ in. Hãy thử ảnh khác hoặc tải lại trang.');
    }
  });

  $('at-clear').addEventListener('click', function () {
    photo = null;
    cropImg.removeAttribute('src');
    cropImg.style.display = 'none';
    $('at-empty').style.display = '';
    $('at-dl-photo').disabled = true;
    $('at-dl-sheet').disabled = true;
    showStatus($('at-status'), '');
    $('at-out').innerHTML = '';
  });

  // ---------- Nén ảnh ----------
  $('at2-file').addEventListener('change', async function () {
    var file = ($('at2-file').files || [])[0];
    $('at2-file').value = '';
    if (!file) return;
    var err = checkFile(file);
    if (err) { showError($('at2-status'), err); return; }
    showStatus($('at2-status'), '<p class="muted">Đang đọc ảnh…</p>');
    var loaded = await loadImageFile(file);
    if (loaded.error) { showError($('at2-status'), loaded.error); return; }
    comp = loaded;
    $('at2-go').disabled = false;
    showStatus($('at2-status'), '<p class="muted">Đã chọn: ' + escHtml(comp.name) + ' — ' + comp.w + ' × ' + comp.h + ' px, ' + L.fmtBytes(comp.size) + '.</p>');
    $('at2-out').innerHTML = '';
  });

  $('at2-go').addEventListener('click', async function () {
    if (!comp) return;
    try {
      var q = parseFloat((root.querySelector('input[name="at2-quality"]:checked') || {}).value || '0.7');
      var scale = Math.min(1, MAX_COMPRESS_DIM / Math.max(comp.w, comp.h));
      var w = Math.max(1, Math.round(comp.w * scale));
      var h = Math.max(1, Math.round(comp.h * scale));
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h); // nen trang cho anh PNG trong suot
      ctx.drawImage(comp.img, 0, 0, w, h);
      var blob = await canvasToJpegBlob(canvas, q);
      if (compURL) URL.revokeObjectURL(compURL);
      compURL = URL.createObjectURL(blob);
      var saved = comp.size - blob.size;
      var pct = comp.size > 0 ? Math.round((saved / comp.size) * 100) : 0;
      var base = comp.name.replace(/\.[^.]*$/, '') || 'anh';
      var fname = base + '-nen.jpg';
      var resizedNote = scale < 1 ? ' Ảnh gốc quá lớn nên đã thu nhỏ còn ' + w + ' × ' + h + ' px.' : '';
      $('at2-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>Dung lượng gốc</span><strong>' + L.fmtBytes(comp.size) + '</strong></div>' +
        '<div class="result-row"><span>Sau khi nén</span><strong>' + L.fmtBytes(blob.size) + '</strong></div>' +
        '<div class="result-row"><span>Giảm được</span><strong>' + (saved >= 0 ? L.fmtBytes(saved) + ' (' + pct + '%)' : 'không giảm — ảnh gốc đã nhỏ') + '</strong></div></div>' +
        (resizedNote ? '<p class="muted">' + resizedNote + '</p>' : '') +
        '<p><img class="at-preview" src="' + compURL + '" alt="Ảnh sau khi nén"></p>' +
        '<button type="button" class="btn btn-primary" id="at2-dl">Tải ảnh đã nén (' + escHtml(fname) + ')</button>';
      $('at2-dl').addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = compURL;
        a.download = fname;
        a.click();
        toast('Đã tải ảnh đã nén.');
      });
      toast('Đã nén ảnh xong.');
    } catch (e) {
      showError($('at2-status'), 'Không nén được ảnh này. Hãy thử ảnh khác hoặc tải lại trang.');
    }
  });

  $('at2-clear').addEventListener('click', function () {
    comp = null;
    $('at2-go').disabled = true;
    showStatus($('at2-status'), '');
    $('at2-out').innerHTML = '';
  });

  // Trạng thái ban đầu: khung 3×4 trống, nút tải tắt.
  frame.style.aspectRatio = L.aspect('3x4').toFixed(4) + ' / 1';
  cropImg.style.display = 'none';
  updateInfo();
}
