// Tách nền ảnh — xóa nền bằng mô hình AI U²-Net (bản nhỏ) chạy ngay
// trên trình duyệt qua onnxruntime-web. Ảnh không rời khỏi máy.
// Thư viện: onnxruntime-web 1.31.1 (MIT) + model u2netp.onnx
// (Apache-2.0, lấy từ release của danielgatis/rembg). KHÔNG dùng
// @imgly/background-removal (AGPL-3.0 — luật web cấm).
export const meta = {
  id: 'tach-nen-anh',
  name: 'Tách nền ảnh: xóa nền, giữ chủ thể',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Tách nền ảnh bằng mô hình AI chạy ngay trên trình duyệt: chọn ảnh, bấm tách nền, tải ảnh PNG nền trong suốt về. Ảnh không tải lên máy chủ nào.',
  keywords: 'tách nền ảnh, xóa nền ảnh, xóa phông nền, remove background, ảnh nền trong suốt, tách nền online, xóa nền sản phẩm',
  icon: '✂️',
  seoTitle: 'Tách nền ảnh online miễn phí — Xóa nền, giữ chủ thể',
  seoDesc: 'Tách nền ảnh bằng AI chạy ngay trên trình duyệt, tải ảnh PNG nền trong suốt về. Miễn phí, ảnh không rời khỏi máy bạn.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field">
          <label>Chọn ảnh (PNG, JPG, WebP…)</label>
          <input id="tna-file" type="file" accept="image/*" hidden>
          <div class="btn-row"><button type="button" class="btn btn-primary" id="tna-pick">Chọn ảnh</button></div>
          <p class="hint">Chưa chọn ảnh nào. Hoặc kéo-thả ảnh vào khung công cụ này.</p>
        </div>
        <div id="tna-info"></div>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="tna-go" disabled>Tách nền</button><button type="button" class="btn btn-ghost" id="tna-clear">Chọn ảnh khác</button></div>
        <div id="tna-progress-wrap" style="display:none"><p class="muted small" id="tna-status"></p><div class="progress-bar"><div class="progress-fill" id="tna-fill"></div></div></div>
        <div id="tna-status-err"></div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <p class="muted" id="tna-empty">Chọn ảnh rồi bấm Tách nền — ảnh đã tách nền sẽ hiện ở đây.</p>
      <div class="result" id="tna-orig-wrap" style="display:none"><p class="muted small">Ảnh gốc</p><img id="tna-orig-img" alt="Ảnh gốc"></div>
      <div class="result" id="tna-preview-wrap" style="display:none"><p class="muted small">Ảnh đã tách nền</p><canvas id="tna-preview"></canvas></div>
      <div id="tna-out"></div>
    </div>
  </div>
  <p class="note">Ảnh chỉ được xử lý trên máy của bạn (mô hình AI chạy trong trình duyệt), KHÔNG tải lên máy chủ nào. Lần đầu dùng: trình duyệt tải bộ xử lý AI khoảng 14,9 MB + mô hình khoảng 4,6 MB — chỉ tải 1 lần, những lần sau mở ra dùng ngay. Giới hạn: file tối đa 20 MB; ảnh quá lớn (cạnh dài trên 2000 px) thì kết quả thu về tối đa 2000 px.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 20 * 1024 * 1024;
  const MAX_DIM = 8000;
  const OUT_MAX = 2000; // cạnh dài tối đa của ảnh kết quả
  const MODEL_URL = '/assets/vendor/u2netp.onnx';
  const MODEL_BYTES = 4574861; // dung lượng thật của u2netp.onnx (đo lúc tải về)
  const WASM_MB = '14,9'; // dung lượng thật của ort-wasm-simd-threaded.wasm

  let img = null;         // HTMLImageElement đã tải
  let origName = 'anh';
  let origW = 0;
  let origH = 0;
  let sessionPromise = null; // cache InferenceSession đã tạo
  let resultCanvas = null;   // canvas trong suốt (để tải PNG)
  let resultURL = null;

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showError(msg) { $('tna-status-err').innerHTML = '<p class="error">' + msg + '</p>'; }
  function clearError() { $('tna-status-err').innerHTML = ''; }
  function setProgress(pct, text) {
    $('tna-progress-wrap').style.display = '';
    $('tna-fill').style.width = Math.max(0, Math.min(100, pct)) + '%';
    if (text != null) $('tna-status').textContent = text;
  }
  function hideProgress() { $('tna-progress-wrap').style.display = 'none'; }

  // Vẽ ảnh kết quả (trong suốt) lên canvas xem trước, có nền kẻ ô để
  // thấy rõ phần trong suốt. Canvas kết quả giữ nguyên để tải PNG.
  function drawPreview() {
    const cv = $('tna-preview');
    const w = resultCanvas.width, h = resultCanvas.height;
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const cell = Math.max(8, Math.round(Math.min(w, h) / 24));
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        ctx.fillStyle = ((x / cell + y / cell) % 2 === 0) ? '#ffffff' : '#d9dce1';
        ctx.fillRect(x, y, cell, cell);
      }
    }
    ctx.drawImage(resultCanvas, 0, 0);
  }

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
        $('tna-info').innerHTML = '<div class="result"><div class="result-row"><span>Ảnh gốc</span><strong>' +
          escHtml(file.name) + ' — ' + origW + ' × ' + origH + ' px, ' + fmtBytes(file.size) + '</strong></div></div>';
        $('tna-orig-img').src = reader.result;
        $('tna-orig-wrap').style.display = '';
        $('tna-empty').style.display = 'none';
        $('tna-preview-wrap').style.display = 'none';
        $('tna-out').innerHTML = '';
        $('tna-go').disabled = false;
      };
      im.onerror = function () { showError('Không đọc được file ảnh này — file có thể đã hỏng.'); };
      im.src = reader.result;
    };
    reader.onerror = function () { showError('Không đọc được file ảnh này.'); };
    reader.readAsDataURL(file);
  }

  // Nút "Chọn ảnh" mở hộp chọn file (ô input thật đã ẩn để khỏi hiện
  // nút mặc định của trình duyệt, vốn hiện bằng tiếng Anh).
  $('tna-pick').addEventListener('click', function () { $('tna-file').click(); });
  $('tna-file').addEventListener('change', function () {
    const f = ($('tna-file').files || [])[0];
    $('tna-file').value = '';
    loadFile(f);
  });
  // Kéo-thả ảnh vào khung công cụ.
  root.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  root.addEventListener('drop', function (ev) {
    ev.preventDefault();
    const f = ev.dataTransfer && ev.dataTransfer.files ? ev.dataTransfer.files[0] : null;
    loadFile(f);
  });

  $('tna-clear').addEventListener('click', function () {
    img = null; resultCanvas = null;
    if (resultURL) { URL.revokeObjectURL(resultURL); resultURL = null; }
    $('tna-info').innerHTML = '';
    $('tna-orig-wrap').style.display = 'none';
    $('tna-empty').style.display = '';
    $('tna-preview-wrap').style.display = 'none';
    $('tna-out').innerHTML = '';
    hideProgress();
    clearError();
    $('tna-go').disabled = true;
  });

  // Tải mô hình kèm tiến độ thật (fetch + đọc từng phần).
  async function fetchModelWithProgress() {
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error('Không tải được mô hình (mã ' + res.status + ').');
    const total = +res.headers.get('Content-Length') || MODEL_BYTES;
    if (!res.body || !res.body.getReader) {
      const buf = await res.arrayBuffer();
      setProgress(75, 'Đã tải mô hình (' + fmtBytes(buf.byteLength) + ') — đang chuẩn bị…');
      return buf;
    }
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
      const r = await reader.read();
      if (r.done) break;
      chunks.push(r.value);
      received += r.value.length;
      const pct = 35 + Math.round((received / total) * 40); // mô hình chiếm 35→75%
      setProgress(pct, 'Đang tải mô hình AI: ' + fmtBytes(received) + ' / ' + fmtBytes(total) + '…');
    }
    const all = new Uint8Array(received);
    let off = 0;
    chunks.forEach(function (c) { all.set(c, off); off += c.length; });
    return all.buffer;
  }

  function getSession() {
    if (sessionPromise) return sessionPromise;
    sessionPromise = (async function () {
      const ort = (typeof window !== 'undefined' && window.ort) || null;
      if (!ort || !ort.InferenceSession) throw new Error('Thư viện xử lý ảnh (onnxruntime-web) chưa tải được — kiểm tra mạng rồi tải lại trang.');
      ort.env.wasm.wasmPaths = '/assets/vendor/';
      ort.env.wasm.numThreads = 1;
      setProgress(10, 'Đang tải bộ xử lý AI (khoảng ' + WASM_MB + ' MB, chỉ tải 1 lần)…');
      // Lần tạo session đầu tiên sẽ tải file wasm — không có tiến độ
      // từng phần nên hiện trạng thái chờ; lần sau dùng lại ngay.
      const modelBuf = await fetchModelWithProgress();
      setProgress(80, 'Đang chuẩn bị mô hình…');
      const session = await ort.InferenceSession.create(modelBuf, { executionProviders: ['wasm'] });
      setProgress(88, 'Đã sẵn sàng — đang tách nền…');
      return session;
    })().catch(function (e) {
      sessionPromise = null; // lỗi thì lần sau bấm lại sẽ thử tải lại
      throw e;
    });
    return sessionPromise;
  }

  $('tna-go').addEventListener('click', async function () {
    if (!img) { showError('Hãy chọn ảnh trước.'); return; }
    clearError();
    $('tna-out').innerHTML = '';
    const btn = $('tna-go');
    const setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang tách nền…');
    btn.disabled = true;
    try {
      const ort = (typeof window !== 'undefined' && window.ort) || null;
      if (!ort) throw new Error('Thư viện xử lý ảnh (onnxruntime-web) chưa tải được — kiểm tra mạng rồi tải lại trang.');
      const session = await getSession();
      setProgress(90, 'Đang tách nền…');
      // Cắt ảnh về 320×320 (đầu vào của U²-Net), chuẩn hóa theo
      // mean/std mà mô hình dùng lúc huấn luyện.
      const S = 320;
      const small = document.createElement('canvas');
      small.width = S; small.height = S;
      const sctx = small.getContext('2d');
      sctx.drawImage(img, 0, 0, S, S);
      const px = sctx.getImageData(0, 0, S, S).data;
      const input = new Float32Array(3 * S * S);
      const mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
      for (let i = 0; i < S * S; i++) {
        input[i] = (px[i * 4] / 255 - mean[0]) / std[0];
        input[S * S + i] = (px[i * 4 + 1] / 255 - mean[1]) / std[1];
        input[2 * S * S + i] = (px[i * 4 + 2] / 255 - mean[2]) / std[2];
      }
      const tensor = new ort.Tensor('float32', input, [1, 3, S, S]);
      const feeds = {};
      feeds[session.inputNames[0]] = tensor;
      const results = await session.run(feeds);
      const mask = results[session.outputNames[0]].data; // 1×1×320×320
      // Chuẩn hóa mặt nạ về 0–1 theo min/max (như rembg làm).
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] < mn) mn = mask[i];
        if (mask[i] > mx) mx = mask[i];
      }
      const span = (mx - mn) || 1;
      // Ảnh kết quả: giữ nguyên ảnh gốc, chỉ thay kênh alpha theo mặt nạ.
      let outW = origW, outH = origH;
      const longest = Math.max(outW, outH);
      if (longest > OUT_MAX) {
        const k = OUT_MAX / longest;
        outW = Math.round(outW * k); outH = Math.round(outH * k);
      }
      resultCanvas = document.createElement('canvas');
      resultCanvas.width = outW; resultCanvas.height = outH;
      const rctx = resultCanvas.getContext('2d');
      rctx.drawImage(img, 0, 0, outW, outH);
      const out = rctx.getImageData(0, 0, outW, outH);
      for (let y = 0; y < outH; y++) {
        const my = Math.min(S - 1, Math.floor((y / outH) * S));
        for (let x = 0; x < outW; x++) {
          const mx2 = Math.min(S - 1, Math.floor((x / outW) * S));
          const m = (mask[my * S + mx2] - mn) / span;
          out.data[(y * outW + x) * 4 + 3] = Math.round(Math.max(0, Math.min(1, m)) * 255);
        }
      }
      rctx.putImageData(out, 0, 0);
      setProgress(100, 'Xong!');
      drawPreview();
      $('tna-preview-wrap').style.display = '';
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = null;
      const fname = origName + '-tach-nen.png';
      $('tna-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>Ảnh đã tách nền</span><strong>' + outW + ' × ' + outH + ' px — nền trong suốt (PNG)</strong></div></div>' +
        '<div class="m2-result-actions"><button type="button" class="btn btn-primary" id="tna-dl">Tải ảnh PNG (' + fname + ')</button><button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button><button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button><button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button></div>';
      $('tna-dl').addEventListener('click', function () {
        resultCanvas.toBlob(function (blob) {
          if (!blob) { toast('Không tạo được file PNG.'); return; }
          if (resultURL) URL.revokeObjectURL(resultURL);
          resultURL = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = resultURL; a.download = fname; a.click();
          toast('Đã tải ảnh PNG nền trong suốt.');
        }, 'image/png');
      });
      // Nút "Chép liên kết"/"Chia sẻ Zalo" trong thẻ kết quả: phải bắt
      // sự kiện tại đây, vì khối này chỉ sinh ra sau khi tách xong —
      // tool-state.js chạy trước lúc đó nên không bắt được (xem ghi chú
      // ở setupShareRow). Logic chép/chia sẻ giống hàng chia sẻ khung.
      const tnaCopy = root.querySelector('[data-uh-share-copy]');
      if (tnaCopy) tnaCopy.addEventListener('click', function () {
        const url = window.location.href;
        const p = (U.copyText) ? U.copyText(url) : null;
        if (p && p.then) p.then(function (ok) { toast(ok ? 'Đã chép liên kết' : 'Không chép được — hãy chép tay'); });
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('Đã chép liên kết'); }, function () { toast('Không chép được — hãy chép tay'); });
      });
      const tnaZalo = root.querySelector('[data-uh-share-zalo]');
      if (tnaZalo) tnaZalo.addEventListener('click', function () {
        const url = window.location.href;
        const title = document.title || '';
        if (typeof navigator !== 'undefined' && navigator.share) {
          navigator.share({ title: title, text: title, url: url }).catch(function () { /* người dùng hủy chia sẻ */ });
        } else if (typeof window !== 'undefined') {
          window.open('https://zalo.me/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
        }
      });
      hideProgress();
      toast('Đã tách nền xong.');
    } catch (e) {
      hideProgress();
      const msg = (e && e.message) ? e.message : 'Đã có lỗi xảy ra.';
      showError('Không tách nền được: ' + escHtml(msg) + ' Hãy thử tải lại trang hoặc dùng trình duyệt khác.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
