// Nén ảnh — giảm dung lượng ảnh JPG, PNG, WebP ngay trên trình duyệt.
// Thư viện: browser-image-compression 2.0.2 (MIT) — file
// src/vendor/browser-image-compression.js, chỉ tải khi mở trang này.
export const meta = {
  id: 'nen-anh',
  name: 'Nén ảnh: giảm dung lượng JPG, PNG, WebP',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Nén ảnh ngay trên trình duyệt: chọn chất lượng và kích thước tối đa, xem dung lượng trước/sau rồi tải ảnh đã nén về. Ảnh không rời khỏi máy bạn.',
  keywords: 'nén ảnh online, giảm dung lượng ảnh, nén jpg, nén png, nén ảnh gửi zalo, nén webp',
  icon: '🗜️',
  seoTitle: 'Nén ảnh online miễn phí — Giảm dung lượng JPG, PNG, WebP',
  seoDesc: 'Nén ảnh JPG, PNG, WebP ngay trên trình duyệt: chọn chất lượng, kích thước tối đa, xem dung lượng trước/sau rồi tải ảnh đã nén về. Miễn phí, ảnh không rời khỏi máy bạn.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field">
          <label>Chọn ảnh (JPG, PNG, WebP…)</label>
          <input id="na-file" type="file" accept="image/*" hidden>
          <div class="btn-row"><button type="button" class="btn btn-primary" id="na-pick">Chọn ảnh</button></div>
          <p class="hint">Chưa chọn ảnh nào. Hoặc kéo-thả ảnh vào khung công cụ này.</p>
        </div>
        <div id="na-info"></div>
        <div class="field">
          <label for="na-quality">Chất lượng nén: <span id="na-quality-val">80%</span></label>
          <input id="na-quality" type="range" min="10" max="100" value="80" step="5">
          <p class="hint">Chất lượng càng thấp, file càng nhẹ — 70–85% là vừa cho ảnh gửi Zalo, đăng web.</p>
        </div>
        <div class="field">
          <label for="na-maxdim">Kích thước tối đa (chiều dài nhất)</label>
          <select id="na-maxdim">
            <option value="0" selected>Giữ nguyên kích thước</option>
            <option value="800">800 px</option>
            <option value="1200">1200 px</option>
            <option value="1920">1920 px</option>
          </select>
        </div>
        <div class="field">
          <label for="na-format">Định dạng file ra</label>
          <select id="na-format">
            <option value="keep" selected>Giữ nguyên định dạng gốc</option>
            <option value="image/jpeg">JPG (nhẹ nhất, mất nền trong suốt)</option>
            <option value="image/webp">WebP (nhẹ, giữ nền trong suốt)</option>
            <option value="image/png">PNG (giữ nền trong suốt, file lớn hơn)</option>
          </select>
        </div>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="na-go" disabled>Nén ảnh</button><button type="button" class="btn btn-ghost" id="na-clear">Chọn ảnh khác</button></div>
        <div id="na-progress-wrap" style="display:none"><p class="muted small" id="na-status"></p><div class="progress-bar"><div class="progress-fill" id="na-fill"></div></div></div>
        <div id="na-status-err"></div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <p class="muted" id="na-empty">Chọn ảnh rồi bấm Nén ảnh — ảnh đã nén sẽ hiện ở đây.</p>
      <div class="result" id="na-preview-wrap" style="display:none"><p class="muted small">Ảnh đã nén</p><img id="na-preview" alt="Ảnh đã nén"></div>
      <div id="na-out"></div>
    </div>
  </div>
  <p class="note">Ảnh chỉ được xử lý trên máy của bạn, KHÔNG tải lên máy chủ nào. Thư viện nén ảnh (browser-image-compression 2.0.2, MIT) khoảng 57 KB, chỉ tải khi bạn mở công cụ này. Ảnh PNG có nền trong suốt nên giữ định dạng PNG hoặc WebP — chuyển sang JPG sẽ mất nền trong suốt.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 20 * 1024 * 1024;
  const MAX_DIM = 8000;

  let file = null;
  let fileName = 'anh';
  let fileType = 'image/jpeg';
  let origW = 0;
  let origH = 0;
  let resultBlob = null;
  let resultURL = null;
  let resultExt = 'jpg';

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showError(msg) { $('na-status-err').innerHTML = '<p class="error">' + msg + '</p>'; }
  function clearError() { $('na-status-err').innerHTML = ''; }
  function setProgress(pct, text) {
    $('na-progress-wrap').style.display = '';
    $('na-fill').style.width = Math.max(0, Math.min(100, pct)) + '%';
    if (text != null) $('na-status').textContent = text;
  }
  function hideProgress() { $('na-progress-wrap').style.display = 'none'; }

  // Nút "Chép liên kết"/"Chia sẻ Zalo" trong thẻ kết quả sinh ra động
  // sau khi nén xong — tool-state.js chạy trước lúc đó nên không bắt
  // được; bắt bằng lắng nghe trên khung công cụ (xem ghi chú ở
  // setupShareRow của tool-state.js). Nghe 1 lần ở đây, nút tạo lại
  // bao nhiêu lần vẫn chạy.
  root.addEventListener('click', function (ev) {
    const t = ev.target && ev.target.closest ? ev.target.closest('[data-uh-share-copy], [data-uh-share-zalo]') : null;
    if (!t) return;
    const url = window.location.href;
    if (t.hasAttribute('data-uh-share-copy')) {
      const p = (U.copyText) ? U.copyText(url) : null;
      if (p && p.then) p.then(function (ok) { toast(ok ? 'Đã chép liên kết' : 'Không chép được — hãy chép tay'); });
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('Đã chép liên kết'); }, function () { toast('Không chép được — hãy chép tay'); });
    } else {
      const title = document.title || '';
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: title, text: title, url: url }).catch(function () { /* người dùng hủy chia sẻ */ });
      } else if (typeof window !== 'undefined') {
        window.open('https://zalo.me/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
      }
    }
  });

  function loadFile(f) {
    clearError();
    if (!f || !f.type || f.type.indexOf('image/') !== 0) {
      showError('Hãy chọn một file ảnh (JPG, PNG, WebP…).');
      return;
    }
    if (f.size > MAX_BYTES) {
      showError('Ảnh quá lớn (' + fmtBytes(f.size) + '). Giới hạn 20 MB/file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      const im = new Image();
      im.onload = function () {
        if (im.naturalWidth > MAX_DIM || im.naturalHeight > MAX_DIM) {
          showError('Ảnh quá lớn (' + im.naturalWidth + ' × ' + im.naturalHeight + ' px). Giới hạn mỗi chiều 8000 px.');
          return;
        }
        file = f;
        fileName = (f.name || 'anh').replace(/\.[^.]+$/, '') || 'anh';
        fileType = f.type || 'image/jpeg';
        origW = im.naturalWidth; origH = im.naturalHeight;
        $('na-info').innerHTML = '<div class="result"><div class="result-row"><span>Ảnh gốc</span><strong>' +
          escHtml(f.name) + ' — ' + origW + ' × ' + origH + ' px, ' + fmtBytes(f.size) + '</strong></div></div>';
        $('na-empty').style.display = 'none';
        $('na-preview-wrap').style.display = 'none';
        $('na-out').innerHTML = '';
        $('na-go').disabled = false;
      };
      im.onerror = function () { showError('Không đọc được file ảnh này — file có thể đã hỏng.'); };
      im.src = reader.result;
    };
    reader.onerror = function () { showError('Không đọc được file ảnh này.'); };
    reader.readAsDataURL(f);
  }

  // Nút "Chọn ảnh" mở hộp chọn file (ô input thật đã ẩn để khỏi hiện
  // nút mặc định của trình duyệt, vốn hiện bằng tiếng Anh).
  $('na-pick').addEventListener('click', function () { $('na-file').click(); });
  $('na-file').addEventListener('change', function () {
    const f = ($('na-file').files || [])[0];
    $('na-file').value = '';
    loadFile(f);
  });
  // Kéo-thả ảnh vào khung công cụ.
  root.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  root.addEventListener('drop', function (ev) {
    ev.preventDefault();
    const f = ev.dataTransfer && ev.dataTransfer.files ? ev.dataTransfer.files[0] : null;
    loadFile(f);
  });

  $('na-clear').addEventListener('click', function () {
    file = null; resultBlob = null;
    if (resultURL) { URL.revokeObjectURL(resultURL); resultURL = null; }
    $('na-info').innerHTML = '';
    $('na-empty').style.display = '';
    $('na-preview-wrap').style.display = 'none';
    $('na-out').innerHTML = '';
    hideProgress();
    clearError();
    $('na-go').disabled = true;
  });

  $('na-quality').addEventListener('input', function () {
    $('na-quality-val').textContent = $('na-quality').value + '%';
  });

  $('na-go').addEventListener('click', async function () {
    if (!file) { showError('Hãy chọn ảnh trước.'); return; }
    clearError();
    $('na-out').innerHTML = '';
    const btn = $('na-go');
    const setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang nén…');
    btn.disabled = true;
    try {
      const imageCompression = (typeof window !== 'undefined' && window.imageCompression) || null;
      if (!imageCompression) throw new Error('Thư viện nén ảnh chưa tải được — kiểm tra mạng rồi tải lại trang.');
      const quality = (+$('na-quality').value || 80) / 100;
      const maxDim = +$('na-maxdim').value || 0;
      const fmt = $('na-format').value;
      const outType = fmt === 'keep' ? fileType : fmt;
      resultExt = outType === 'image/png' ? 'png' : (outType === 'image/webp' ? 'webp' : 'jpg');
      setProgress(15, 'Đang nén ảnh…');
      const options = {
        maxSizeMB: Math.max(0.05, (file.size / (1024 * 1024)) * 0.9),
        useWebWorker: true,
        initialQuality: quality,
        onProgress: function (p) { setProgress(15 + Math.round(p * 0.7), 'Đang nén ảnh… ' + p + '%'); },
      };
      if (maxDim > 0) options.maxWidthOrHeight = maxDim;
      if (fmt !== 'keep') options.fileType = fmt;
      const out = await imageCompression(file, options);
      resultBlob = out;
      setProgress(95, 'Xong — đang hiện ảnh đã nén…');
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = URL.createObjectURL(out);
      const im = new Image();
      await new Promise(function (resolve) { im.onload = resolve; im.onerror = resolve; im.src = resultURL; });
      const newW = im.naturalWidth || origW;
      const newH = im.naturalHeight || origH;
      const saved = file.size - out.size;
      const pct = file.size > 0 ? Math.round((saved / file.size) * 100) : 0;
      $('na-preview').src = resultURL;
      $('na-preview-wrap').style.display = '';
      const fname = fileName + '-nen.' + resultExt;
      $('na-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>Dung lượng gốc</span><strong>' + fmtBytes(file.size) + '</strong></div>' +
        '<div class="result-row"><span>Dung lượng sau nén</span><strong>' + fmtBytes(out.size) + '</strong></div>' +
        '<div class="result-row"><span>Nhẹ hơn</span><strong>' + (saved >= 0 ? fmtBytes(saved) + ' (' + pct + '%)' : 'không nhẹ hơn — ảnh gốc đã nhỏ') + '</strong></div>' +
        '<div class="result-row"><span>Kích thước</span><strong>' + newW + ' × ' + newH + ' px</strong></div></div>' +
        '<div class="m2-result-actions"><button type="button" class="btn btn-primary" id="na-dl">Tải ảnh đã nén (' + fname + ')</button><button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button><button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button><button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button></div>';
      $('na-dl').addEventListener('click', function () {
        const a = document.createElement('a');
        a.href = resultURL; a.download = fname; a.click();
        toast('Đã tải ảnh đã nén.');
      });
      hideProgress();
      toast('Đã nén xong.');
    } catch (e) {
      hideProgress();
      const msg = (e && e.message) ? e.message : 'Đã có lỗi xảy ra.';
      showError('Không nén được ảnh: ' + escHtml(msg) + ' Hãy thử ảnh khác hoặc tải lại trang.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
