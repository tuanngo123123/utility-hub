// Chỉnh sửa ảnh — đổi kích thước, nén, đổi định dạng bằng canvas, 100% trên trình duyệt.
export const meta = {
  id: 'chinh-sua-anh',
  name: 'Chỉnh sửa ảnh: đổi cỡ, nén, đổi định dạng',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Đổi kích thước, nén nhẹ và đổi định dạng ảnh PNG/JPG/WebP ngay trên trình duyệt. Ảnh không tải lên máy chủ nào.',
  keywords: 'đổi kích thước ảnh, nén ảnh, giảm dung lượng ảnh, đổi định dạng ảnh, png sang jpg, jpg sang webp, resize ảnh, compress ảnh',
  icon: '🖼️',
  seoTitle: 'Chỉnh sửa ảnh online — Đổi cỡ, nén ảnh, PNG/JPG/WebP',
  seoDesc: 'Đổi kích thước ảnh, nén ảnh giảm dung lượng và đổi định dạng PNG, JPG, WebP miễn phí. Xử lý ngay trên trình duyệt, ảnh không rời khỏi máy bạn.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🖼️</span><div><h2>Chỉnh sửa ảnh: đổi cỡ, nén, đổi định dạng</h2><p class="muted">Chọn ảnh, chọn việc cần làm, tải ảnh mới về — tất cả xử lý ngay trên trình duyệt của bạn.</p></div></div>
  <p class="note">🔒 Ảnh chỉ được xử lý trên máy của bạn (FileReader + canvas), KHÔNG tải lên máy chủ nào. Giới hạn: file tối đa 20 MB, mỗi chiều tối đa 8.000 px.</p>
  <div class="field"><label for="csa-file">Chọn ảnh (PNG, JPG, WebP, GIF…)</label><input id="csa-file" type="file" accept="image/*"></div>
  <div id="csa-info"></div>
  <div id="csa-preview-wrap" style="display:none"><img id="csa-preview" alt="Ảnh gốc"></div>

  <div class="tabs">
    <button type="button" class="tab tab-active" id="csa-tab-resize">Đổi kích thước</button>
    <button type="button" class="tab" id="csa-tab-compress">Nén ảnh</button>
    <button type="button" class="tab" id="csa-tab-convert">Đổi định dạng</button>
  </div>

  <div id="csa-pane-resize">
    <div class="grid-2">
      <div class="field"><label for="csa-w">Chiều rộng mới (px)</label><input id="csa-w" type="number" min="1" max="8000" placeholder="Ví dụ: 1200"></div>
      <div class="field"><label for="csa-h">Chiều cao mới (px)</label><input id="csa-h" type="number" min="1" max="8000" placeholder="Ví dụ: 800"></div>
    </div>
    <div class="field"><label><input type="checkbox" id="csa-ratio" checked> Giữ đúng tỷ lệ ảnh gốc</label></div>
    <div class="field"><label for="csa-resize-fmt">Định dạng ảnh xuất</label><select id="csa-resize-fmt"><option value="">Giữ nguyên định dạng gốc</option><option value="image/jpeg">JPEG (.jpg)</option><option value="image/png">PNG (.png)</option><option value="image/webp">WebP (.webp)</option></select></div>
    <button type="button" class="btn btn-primary" id="csa-resize-go">Đổi kích thước</button>
  </div>

  <div id="csa-pane-compress" style="display:none">
    <div class="field"><label for="csa-quality">Chất lượng: <strong id="csa-quality-val">80%</strong> <span class="muted">(càng thấp càng nhẹ, càng mờ)</span></label><input id="csa-quality" type="range" min="10" max="100" value="80"></div>
    <div class="field"><label for="csa-compress-fmt">Định dạng ảnh xuất</label><select id="csa-compress-fmt"><option value="image/jpeg">JPEG (.jpg) — nén tốt nhất cho ảnh chụp</option><option value="image/webp">WebP (.webp) — nhẹ hơn JPEG, trình duyệt mới hỗ trợ</option></select></div>
    <button type="button" class="btn btn-primary" id="csa-compress-go">Nén ảnh</button>
    <p class="note">PNG không nén được bằng chất lượng nên tab này chỉ xuất JPEG/WebP. Muốn giữ PNG, dùng tab "Đổi kích thước" và thu nhỏ ảnh.</p>
  </div>

  <div id="csa-pane-convert" style="display:none">
    <div class="field"><label for="csa-convert-fmt">Đổi sang định dạng</label><select id="csa-convert-fmt"><option value="image/jpeg">JPEG (.jpg)</option><option value="image/png">PNG (.png)</option><option value="image/webp">WebP (.webp)</option></select></div>
    <div class="field"><label for="csa-convert-quality">Chất lượng JPEG/WebP: <strong id="csa-convert-quality-val">90%</strong></label><input id="csa-convert-quality" type="range" min="10" max="100" value="90"></div>
    <button type="button" class="btn btn-primary" id="csa-convert-go">Đổi định dạng</button>
    <p class="note">Đổi sang JPEG sẽ mất nền trong suốt (phần trong suốt thành nền trắng). Đổi sang PNG giữ được nền trong suốt.</p>
  </div>

  <div id="csa-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 20 * 1024 * 1024;
  const MAX_DIM = 8000;

  let img = null;       // HTMLImageElement đã tải
  let origName = 'anh';
  let origType = 'image/png';
  let origBytes = 0;
  let resultURL = null;

  const panes = ['resize', 'compress', 'convert'];
  panes.forEach(k => {
    $('csa-tab-' + k).addEventListener('click', () => {
      panes.forEach(j => {
        $('csa-tab-' + j).classList.toggle('tab-active', j === k);
        $('csa-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });

  $('csa-quality').addEventListener('input', () => { $('csa-quality-val').textContent = $('csa-quality').value + '%'; });
  $('csa-convert-quality').addEventListener('input', () => { $('csa-convert-quality-val').textContent = $('csa-convert-quality').value + '%'; });

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function extOf(mime) {
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/webp') return 'webp';
    return 'png';
  }
  function baseName(name) {
    const i = name.lastIndexOf('.');
    return i > 0 ? name.slice(0, i) : name;
  }
  function showError(msg) {
    $('csa-out').innerHTML = '<p class="error">' + msg + '</p>';
  }

  $('csa-file').addEventListener('change', () => {
    const file = $('csa-file').files && $('csa-file').files[0];
    $('csa-out').innerHTML = '';
    if (!file) return;
    if (!file.type || file.type.indexOf('image/') !== 0) {
      showError('File này không phải ảnh. Hãy chọn file ảnh (PNG, JPG, WebP…).');
      return;
    }
    if (file.size > MAX_BYTES) {
      showError('Ảnh quá lớn (' + fmtBytes(file.size) + '). Giới hạn 20 MB — hãy nén hoặc cắt ảnh trước rồi thử lại.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        if (im.naturalWidth > MAX_DIM || im.naturalHeight > MAX_DIM) {
          showError('Ảnh quá lớn (' + im.naturalWidth + ' × ' + im.naturalHeight + ' px). Mỗi chiều tối đa 8.000 px.');
          return;
        }
        img = im;
        origName = file.name || 'anh';
        origType = file.type || 'image/png';
        origBytes = file.size;
        $('csa-info').innerHTML = '<div class="result"><div class="result-row"><span>Ảnh gốc</span><strong>' + im.naturalWidth + ' × ' + im.naturalHeight + ' px — ' + fmtBytes(file.size) + '</strong></div></div>';
        const prev = $('csa-preview');
        prev.src = reader.result;
        prev.style.maxWidth = '100%';
        prev.style.height = 'auto';
        prev.style.borderRadius = '8px';
        $('csa-preview-wrap').style.display = '';
        $('csa-w').value = im.naturalWidth;
        $('csa-h').value = im.naturalHeight;
      };
      im.onerror = () => showError('Không đọc được ảnh này. File có thể đã hỏng hoặc định dạng lạ — thử ảnh khác.');
      im.src = reader.result;
    };
    reader.onerror = () => showError('Không đọc được file. Thử chọn lại ảnh khác.');
    reader.readAsDataURL(file);
  });

  // Giữ tỷ lệ khi đổi rộng/cao.
  $('csa-w').addEventListener('input', () => {
    if (!$('csa-ratio').checked || !img) return;
    const w = +$('csa-w').value;
    if (w > 0) $('csa-h').value = Math.max(1, Math.round(img.naturalHeight * w / img.naturalWidth));
  });
  $('csa-h').addEventListener('input', () => {
    if (!$('csa-ratio').checked || !img) return;
    const h = +$('csa-h').value;
    if (h > 0) $('csa-w').value = Math.max(1, Math.round(img.naturalWidth * h / img.naturalHeight));
  });

  function process(w, h, mime, quality, label) {
    if (!img) { showError('Hãy chọn ảnh trước đã.'); return; }
    if (!w || !h || w < 1 || h < 1 || w > MAX_DIM || h > MAX_DIM) {
      showError('Kích thước không hợp lệ (mỗi chiều từ 1 đến 8.000 px).');
      return;
    }
    let canvas;
    try {
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (mime === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);
    } catch (e) {
      showError('Không xử lý được ảnh này (ảnh quá lớn so với bộ nhớ trình duyệt).');
      return;
    }
    canvas.toBlob(blob => {
      if (!blob) {
        showError('Trình duyệt này không xuất được định dạng ' + mime.replace('image/', '').toUpperCase() + '. Hãy thử định dạng khác.');
        return;
      }
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = URL.createObjectURL(blob);
      const saved = origBytes > 0 ? Math.round((1 - blob.size / origBytes) * 100) : 0;
      const savedText = saved > 0 ? ' — nhẹ hơn ' + saved + '%' : (saved < 0 ? ' — nặng hơn ' + (-saved) + '%' : '');
      const fname = baseName(origName) + '-' + label + '.' + extOf(mime);
      $('csa-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>Ảnh mới</span><strong>' + w + ' × ' + h + ' px — ' + fmtBytes(blob.size) + savedText + '</strong></div>' +
        '<div class="result-row"><span>Định dạng</span><strong>' + mime.replace('image/', '').toUpperCase() + '</strong></div></div>' +
        '<div id="csa-result-img-wrap"></div>' +
        '<button type="button" class="btn btn-primary" id="csa-dl">Tải ảnh về (' + fname + ')</button>';
      const rim = document.createElement('img');
      rim.src = resultURL;
      rim.alt = 'Ảnh kết quả';
      rim.style.maxWidth = '100%';
      rim.style.height = 'auto';
      rim.style.borderRadius = '8px';
      $('csa-result-img-wrap').appendChild(rim);
      $('csa-dl').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = resultURL;
        a.download = fname;
        a.click();
        toast('Đã tải ảnh về.');
      });
    }, mime, quality);
  }

  $('csa-resize-go').addEventListener('click', () => {
    const w = Math.round(+$('csa-w').value);
    const h = Math.round(+$('csa-h').value);
    const mime = $('csa-resize-fmt').value || origType;
    process(w, h, mime, 0.92, 'resize');
  });
  $('csa-compress-go').addEventListener('click', () => {
    const q = (+$('csa-quality').value) / 100;
    process(img ? img.naturalWidth : 0, img ? img.naturalHeight : 0, $('csa-compress-fmt').value, q, 'nen');
  });
  $('csa-convert-go').addEventListener('click', () => {
    const q = (+$('csa-convert-quality').value) / 100;
    process(img ? img.naturalWidth : 0, img ? img.naturalHeight : 0, $('csa-convert-fmt').value, q, 'convert');
  });
}
