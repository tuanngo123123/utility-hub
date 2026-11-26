// Đọc chữ trong ảnh (OCR tiếng Việt) — nhận diện chữ tiếng Việt
// trong ảnh thành văn bản, chạy ngay trên trình duyệt qua Tesseract.js.
// Ảnh không rời khỏi máy.
// Thư viện: Tesseract.js 7.0.0 (Apache-2.0) + lõi tesseract.js-core
// 7.0.0 (Apache-2.0) + dữ liệu tiếng Việt 'vie' (tessdata_fast,
// Apache-2.0). Tất cả tự host trong src/vendor/tesseract/ —
// KHÔNG nạp gì từ CDN: tesseract.min.js qua thẻ <script> của trang,
// worker/core/dữ liệu ngôn ngữ nạp lúc chạy khi bấm "Đọc chữ".
export const meta = {
  id: 'doc-chu-trong-anh',
  name: 'Đọc chữ trong ảnh (OCR tiếng Việt)',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Chụp hoặc tải ảnh có chữ tiếng Việt lên, công cụ đọc chữ trong ảnh thành văn bản để sao chép hoặc tải file .txt về. Chữ được đọc ngay trên trình duyệt, ảnh không rời khỏi máy bạn.',
  keywords: 'đọc chữ trong ảnh, OCR tiếng Việt, nhận diện chữ, ảnh thành văn bản, trích xuất văn bản từ ảnh, ocr online, đọc chữ từ ảnh chụp',
  icon: '🔍',
  seoTitle: 'Đọc chữ trong ảnh tiếng Việt online miễn phí (OCR)',
  seoDesc: 'Đọc chữ tiếng Việt trong ảnh thành văn bản để sao chép hoặc tải file .txt về. Chạy ngay trên trình duyệt, ảnh không tải lên máy chủ.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field">
          <label>Chọn ảnh có chữ (PNG, JPG, WebP…)</label>
          <input id="dca-file" type="file" accept="image/*" hidden>
          <div class="btn-row"><button type="button" class="btn btn-primary" id="dca-pick">Chọn ảnh</button></div>
          <p class="hint">Chưa chọn ảnh nào. Hoặc kéo-thả ảnh vào khung công cụ này, hoặc dán ảnh đã sao chép (Ctrl+V).</p>
        </div>
        <div id="dca-info"></div>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="dca-go" disabled>Đọc chữ</button><button type="button" class="btn btn-ghost" id="dca-clear">Chọn ảnh khác</button></div>
        <div id="dca-progress-wrap" style="display:none"><p class="muted small" id="dca-status"></p><div class="progress-bar"><div class="progress-fill" id="dca-fill"></div></div></div>
        <div id="dca-status-err"></div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <p class="muted" id="dca-empty">Chọn ảnh rồi bấm Đọc chữ — văn bản nhận được sẽ hiện ở đây.</p>
      <div class="result" id="dca-preview-wrap" style="display:none"><p class="muted small">Ảnh đã chọn</p><img id="dca-preview-img" alt="Ảnh đã chọn"></div>
      <div id="dca-out"></div>
    </div>
  </div>
  <p class="note">Ảnh chỉ được xử lý trên máy của bạn (bộ nhận diện chạy trong trình duyệt), KHÔNG tải lên máy chủ nào. Lần đầu dùng: trình duyệt tải bộ nhận diện khoảng 3,9 MB + dữ liệu tiếng Việt khoảng 0,4 MB — chỉ tải 1 lần, những lần sau mở ra dùng ngay (dữ liệu đã lưu trên trình duyệt). Giới hạn: file tối đa 20 MB; ảnh quá lớn (cạnh dài trên 2000 px) thì thu về tối đa 2000 px trước khi đọc. Ảnh chụp chữ rõ, thẳng, đủ sáng cho kết quả tốt nhất; chữ viết tay không nhận diện được.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 20 * 1024 * 1024;
  const MAX_DIM = 8000;
  const OCR_MAX = 2000; // cạnh dài tối đa của ảnh đưa vào bộ nhận diện
  const WORKER_URL = '/assets/vendor/tesseract/worker.min.js';
  const CORE_URL = '/assets/vendor/tesseract/core';
  const LANG_URL = '/assets/vendor/tesseract/tessdata';

  let img = null;         // HTMLImageElement đã tải
  let ocrCanvas = null;   // canvas đã thu nhỏ (đưa vào bộ nhận diện)
  let origName = 'anh';
  let origW = 0;
  let origH = 0;
  let workerPromise = null; // cache worker đã tạo

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showError(msg) { $('dca-status-err').innerHTML = '<p class="error">' + msg + '</p>'; }
  function clearError() { $('dca-status-err').innerHTML = ''; }
  function setProgress(pct, text) {
    $('dca-progress-wrap').style.display = '';
    $('dca-fill').style.width = Math.max(0, Math.min(100, pct)) + '%';
    if (text != null) $('dca-status').textContent = text;
  }
  function hideProgress() { $('dca-progress-wrap').style.display = 'none'; }

  function loadFile(file) {
    clearError();
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      showError('Hãy chọn một file ảnh (PNG, JPG, WebP…).');
      return;
    }
    if (file.size > MAX_BYTES) {
      showError('Ảnh quá lớn (' + fmtBytes(file.size) + '). Giới hạn 20 MB/file.');
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
        img = im;
        origName = (file.name || 'anh').replace(/\.[^.]+$/, '') || 'anh';
        origW = im.naturalWidth; origH = im.naturalHeight;
        // Thu ảnh về tối đa 2000 px cạnh dài để đọc nhanh trên điện thoại yếu.
        let w = origW, h = origH;
        const longest = Math.max(w, h);
        if (longest > OCR_MAX) {
          const k = OCR_MAX / longest;
          w = Math.round(w * k); h = Math.round(h * k);
        }
        ocrCanvas = document.createElement('canvas');
        ocrCanvas.width = w; ocrCanvas.height = h;
        ocrCanvas.getContext('2d').drawImage(im, 0, 0, w, h);
        $('dca-info').innerHTML = '<div class="result"><div class="result-row"><span>Ảnh gốc</span><strong>' +
          escHtml(file.name) + ' — ' + origW + ' × ' + origH + ' px, ' + fmtBytes(file.size) + '</strong></div></div>';
        $('dca-preview-img').src = reader.result;
        $('dca-preview-wrap').style.display = '';
        $('dca-empty').style.display = 'none';
        $('dca-out').innerHTML = '';
        $('dca-go').disabled = false;
      };
      im.onerror = function () { showError('Không đọc được file ảnh này — file có thể đã hỏng.'); };
      im.src = reader.result;
    };
    reader.onerror = function () { showError('Không đọc được file ảnh này.'); };
    reader.readAsDataURL(file);
  }

  // Nút "Chọn ảnh" mở hộp chọn file (ô input thật đã ẩn để khỏi hiện
  // nút mặc định của trình duyệt, vốn hiện bằng tiếng Anh).
  $('dca-pick').addEventListener('click', function () { $('dca-file').click(); });
  $('dca-file').addEventListener('change', function () {
    const f = ($('dca-file').files || [])[0];
    $('dca-file').value = '';
    loadFile(f);
  });
  // Kéo-thả ảnh vào khung công cụ.
  root.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  root.addEventListener('drop', function (ev) {
    ev.preventDefault();
    const f = ev.dataTransfer && ev.dataTransfer.files ? ev.dataTransfer.files[0] : null;
    loadFile(f);
  });
  // Dán ảnh đã sao chép (Ctrl+V): chỉ nhận khi clipboard có file ảnh,
  // còn dán chữ thì để mặc định (không chặn).
  document.addEventListener('paste', function (ev) {
    const items = (ev.clipboardData && ev.clipboardData.items) || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it && it.kind === 'file' && it.type && it.type.indexOf('image/') === 0) {
        const f = it.getAsFile();
        if (f) { ev.preventDefault(); loadFile(f); return; }
      }
    }
  });

  $('dca-clear').addEventListener('click', function () {
    img = null; ocrCanvas = null;
    $('dca-info').innerHTML = '';
    $('dca-preview-wrap').style.display = 'none';
    $('dca-empty').style.display = '';
    $('dca-out').innerHTML = '';
    hideProgress();
    clearError();
    $('dca-go').disabled = true;
  });

  // Tiến độ của Tesseract.js (logger): mỗi trạng thái có progress 0–1
  // riêng — gộp thành một thanh 0–100% cho cả quá trình.
  function onLogger(m) {
    if (!m || typeof m.progress !== 'number') return;
    const p = m.progress;
    let pct = 0, text = '';
    if (m.status === 'loading tesseract core') {
      pct = 5 + Math.round(p * 30);
      text = 'Đang tải bộ nhận diện (khoảng 3,9 MB, chỉ tải 1 lần)…';
    } else if (m.status === 'initializing tesseract') {
      pct = 35 + Math.round(p * 5);
      text = 'Đang khởi động bộ nhận diện…';
    } else if (m.status === 'loading language traineddata') {
      pct = 40 + Math.round(p * 20);
      text = 'Đang tải dữ liệu tiếng Việt (khoảng 0,4 MB, chỉ tải 1 lần)…';
    } else if (m.status === 'initializing api') {
      pct = 60 + Math.round(p * 5);
      text = 'Đang chuẩn bị…';
    } else if (m.status === 'recognizing text') {
      pct = 65 + Math.round(p * 35);
      text = 'Đang đọc chữ trong ảnh…';
    } else {
      return;
    }
    setProgress(pct, text + ' ' + pct + '%');
  }

  function getWorker() {
    if (workerPromise) return workerPromise;
    workerPromise = (async function () {
      const T = (typeof window !== 'undefined' && window.Tesseract) || null;
      if (!T || !T.createWorker) throw new Error('Thư viện nhận diện chữ (Tesseract.js) chưa tải được — kiểm tra mạng rồi tải lại trang.');
      // Tesseract.js 7.0.0: createWorker(ngôn ngữ, OEM, tùy chọn);
      // OEM 1 = chỉ dùng mô hình LSTM. workerPath/corePath/langPath
      // trỏ về file tự host trên web mình (không dùng CDN mặc định).
      setProgress(5, 'Đang tải bộ nhận diện (khoảng 3,9 MB, chỉ tải 1 lần)…');
      const worker = await T.createWorker('vie', 1, {
        workerPath: WORKER_URL,
        corePath: CORE_URL,
        langPath: LANG_URL,
        logger: onLogger,
      });
      setProgress(65, 'Đang đọc chữ trong ảnh…');
      return worker;
    })().catch(function (e) {
      workerPromise = null; // lỗi thì lần sau bấm lại sẽ thử tạo lại
      throw e;
    });
    return workerPromise;
  }

  $('dca-go').addEventListener('click', async function () {
    if (!img || !ocrCanvas) { showError('Hãy chọn ảnh trước.'); return; }
    clearError();
    $('dca-out').innerHTML = '';
    const btn = $('dca-go');
    const setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang đọc chữ…');
    btn.disabled = true;
    try {
      const worker = await getWorker();
      setProgress(75, 'Đang đọc chữ trong ảnh…');
      const ret = await worker.recognize(ocrCanvas);
      const text = ((ret && ret.data && ret.data.text) || '').replace(/\s+$/g, '');
      const conf = (ret && ret.data && typeof ret.data.confidence === 'number') ? Math.round(ret.data.confidence) : null;
      setProgress(100, 'Xong!');
      if (!text) {
        hideProgress();
        showError('Không nhận ra chữ nào trong ảnh — thử ảnh chụp chữ rõ hơn, to hơn, đủ sáng.');
        return;
      }
      const words = text.split(/\s+/).filter(Boolean).length;
      const fname = origName + '-ocr.txt';
      $('dca-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>Số ký tự</span><strong>' + text.length + '</strong></div>' +
        '<div class="result-row"><span>Số từ</span><strong>' + words + '</strong></div>' +
        (conf !== null ? '<div class="result-row"><span>Độ tin cậy</span><strong>khoảng ' + conf + '%</strong></div>' : '') +
        '</div>' +
        '<div class="field"><label for="dca-text">Văn bản nhận được (bấm vào để sửa nếu có chữ sai)</label>' +
        '<textarea id="dca-text" rows="10">' + escHtml(text) + '</textarea></div>' +
        '<div class="m2-result-actions"><button type="button" class="btn btn-primary" id="dca-copy">Sao chép văn bản</button><button type="button" class="btn btn-ghost" id="dca-dl">Tải file .txt</button><button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button><button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button><button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button></div>';
      $('dca-copy').addEventListener('click', function () {
        const t = $('dca-text').value;
        if (!t) { toast('Chưa có văn bản để chép.'); return; }
        const p = (U.copyText) ? U.copyText(t) : null;
        if (p && p.then) p.then(function (ok) { toast(ok ? 'Đã chép văn bản.' : 'Không chép được — hãy chép tay'); });
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { toast('Đã chép văn bản.'); }, function () { toast('Không chép được — hãy chép tay'); });
      });
      $('dca-dl').addEventListener('click', function () {
        const t = $('dca-text').value;
        if (!t) { toast('Chưa có văn bản để tải.'); return; }
        const blob = new Blob([t], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fname; a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        toast('Đã tải file .txt.');
      });
      // Nút "Chép liên kết"/"Chia sẻ Zalo" trong thẻ kết quả: phải bắt
      // sự kiện tại đây, vì khối này chỉ sinh ra sau khi đọc xong —
      // tool-state.js chạy trước lúc đó nên không bắt được (xem ghi chú
      // ở setupShareRow). Logic chép/chia sẻ giống hàng chia sẻ khung.
      const dcaCopy = root.querySelector('[data-uh-share-copy]');
      if (dcaCopy) dcaCopy.addEventListener('click', function () {
        const url = window.location.href;
        const p = (U.copyText) ? U.copyText(url) : null;
        if (p && p.then) p.then(function (ok) { toast(ok ? 'Đã chép liên kết' : 'Không chép được — hãy chép tay'); });
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('Đã chép liên kết'); }, function () { toast('Không chép được — hãy chép tay'); });
      });
      const dcaZalo = root.querySelector('[data-uh-share-zalo]');
      if (dcaZalo) dcaZalo.addEventListener('click', function () {
        const url = window.location.href;
        const title = document.title || '';
        if (typeof navigator !== 'undefined' && navigator.share) {
          navigator.share({ title: title, text: title, url: url }).catch(function () { /* người dùng hủy chia sẻ */ });
        } else if (typeof window !== 'undefined') {
          window.open('https://zalo.me/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
        }
      });
      hideProgress();
      toast('Đã đọc xong.');
    } catch (e) {
      hideProgress();
      const msg = (e && e.message) ? e.message : 'Đã có lỗi xảy ra.';
      showError('Không đọc được chữ: ' + escHtml(msg) + ' Hãy thử tải lại trang hoặc dùng trình duyệt khác.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
