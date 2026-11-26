// Tạo mã vạch CODE128 / CODE39 / EAN-13 / UPC-A — dùng JsBarcode 3.11.6 (MIT, đã vendored).
// Vẽ trực tiếp khi gõ, không cần bấm nút; tải về PNG hoặc SVG.
export const meta = {
  id: 'tao-ma-vach',
  name: 'Tạo mã vạch (barcode)',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Nhập nội dung để vẽ mã vạch CODE128, CODE39, EAN-13 hoặc UPC-A ngay trên trình duyệt, tải về dạng ảnh PNG hoặc file SVG để in tem, dán nhãn.',
  keywords: 'tạo mã vạch, mã vạch barcode, code128, ean-13, upc-a, code39, tạo barcode miễn phí, in mã vạch',
  icon: '🏷️',
  seoTitle: 'Tạo mã vạch CODE128, EAN-13, UPC-A miễn phí — Tải PNG/SVG',
  seoDesc: 'Tạo mã vạch CODE128, CODE39, EAN-13 hoặc UPC-A miễn phí ngay trên trình duyệt: gõ tới đâu vẽ tới đó, tải về ảnh PNG hoặc file SVG để in tem, dán nhãn.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🏷️</span><div><h2>Tạo mã vạch (barcode)</h2><p class="muted">Gõ nội dung, mã vạch vẽ ngay — tải PNG hoặc SVG về in tem, dán nhãn.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="tmv-text">Nội dung mã vạch</label><input id="tmv-text" type="text" value="8938500000000" maxlength="200" autocomplete="off" placeholder="Ví dụ: 8938500000000"></div>
    <div class="field"><label for="tmv-format">Chuẩn mã vạch</label><select id="tmv-format"><option value="CODE128" selected>CODE128 — dùng chung</option><option value="CODE39">CODE39 — chữ hoa và số</option><option value="EAN13">EAN-13 — mã sản phẩm 13 số</option><option value="UPC">UPC-A — mã sản phẩm 12 số</option></select></div>
  </div>
  <p class="muted small" id="tmv-hint">Chữ và số bất kỳ (tối đa 200 ký tự).</p>
  <div class="field"><label for="tmv-height">Chiều cao mã vạch</label><select id="tmv-height"><option value="60">Thấp — 60 px</option><option value="100" selected>Vừa — 100 px</option><option value="150">Cao — 150 px</option></select></div>
  <div id="tmv-out"></div>
  <div class="result" id="tmv-wrap" hidden>
    <svg id="tmv-svg" role="img" aria-label="Mã vạch"></svg>
  </div>
  <div id="tmv-dl" hidden>
    <button type="button" class="btn btn-primary" id="tmv-dl-png">Tải ảnh PNG</button>
    <button type="button" class="btn btn-ghost" id="tmv-dl-svg">Tải file SVG</button>
  </div>
  <canvas id="tmv-canvas" style="display:none"></canvas>
  <p class="note">CODE128 dùng cho hầu hết mọi việc (mã hàng, mã đơn, mã kho). EAN-13 là chuẩn mã sản phẩm bán lẻ ở Việt Nam (đầu 893); UPC-A là chuẩn bán lẻ ở Mỹ. Mã vạch vẽ hoàn toàn trên máy của bạn, không gửi nội dung đi đâu.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  // Ghi chú: mọi hằng dùng trong init phải khai báo TRONG init, vì init
  // được nhúng qua init.toString() — hằng ngoài module sẽ không tồn tại.
  const FORMATS = {
    CODE128: 'Chữ và số bất kỳ (tối đa 200 ký tự).',
    CODE39: 'Chỉ chữ hoa A–Z, số 0–9, dấu cách và - . $ / + %.',
    EAN13: '12 hoặc 13 chữ số (nhập 12 số, máy tự tính số kiểm tra cuối).',
    UPC: '11 hoặc 12 chữ số (nhập 11 số, máy tự tính số kiểm tra cuối).',
  };
  const textEl = $('tmv-text'), fmtEl = $('tmv-format'), hEl = $('tmv-height');
  const outEl = $('tmv-out'), wrapEl = $('tmv-wrap'), dlEl = $('tmv-dl');
  const svgEl = $('tmv-svg'), canvasEl = $('tmv-canvas');

  function valid(text, fmt) {
    if (fmt === 'EAN13') return /^\d{12,13}$/.test(text) ? '' : 'EAN-13 chỉ gồm 12 hoặc 13 chữ số.';
    if (fmt === 'UPC') return /^\d{11,12}$/.test(text) ? '' : 'UPC-A chỉ gồm 11 hoặc 12 chữ số.';
    if (fmt === 'CODE39') return /^[0-9A-Z \-\.\$\/\+\%]*$/.test(text) ? '' : 'CODE39 chỉ dùng chữ hoa A–Z, số 0–9, dấu cách và các ký tự - . $ / + %.';
    // CODE128: ký tự ASCII in được, tối đa 200 ký tự (maxlength đã chặn).
    return /^[\x20-\x7E]*$/.test(text) ? '' : 'CODE128 chỉ dùng ký tự thường gặp trên bàn phím (không dùng dấu tiếng Việt).';
  }

  function draw() {
    const text = textEl.value.trim();
    const fmt = fmtEl.value;
    $('tmv-hint').textContent = FORMATS[fmt] || '';
    if (!text) {
      outEl.innerHTML = '<p class="muted">Hãy nhập nội dung mã vạch.</p>';
      wrapEl.hidden = true; dlEl.hidden = true;
      return;
    }
    const err = valid(text, fmt);
    if (err) {
      outEl.innerHTML = '<p class="error">' + err + '</p>';
      wrapEl.hidden = true; dlEl.hidden = true;
      return;
    }
    if (typeof window.JsBarcode === 'undefined') {
      outEl.innerHTML = '<p class="error">Bộ vẽ mã vạch chưa tải xong. Hãy tải lại trang.</p>';
      wrapEl.hidden = true; dlEl.hidden = true;
      return;
    }
    const opts = { format: fmt, width: 2, height: +hEl.value || 100, displayValue: true, fontSize: 16, margin: 10, background: '#ffffff', lineColor: '#000000' };
    try {
      window.JsBarcode(svgEl, text, opts);
    } catch (e) {
      outEl.innerHTML = '<p class="error">Không vẽ được mã vạch với nội dung này. Hãy kiểm tra lại chuẩn mã đã chọn.</p>';
      wrapEl.hidden = true; dlEl.hidden = true;
      return;
    }
    outEl.innerHTML = '';
    wrapEl.hidden = false; dlEl.hidden = false;
  }

  let t = null;
  textEl.addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 120); });
  fmtEl.addEventListener('change', draw);
  hEl.addEventListener('change', draw);
  draw();

  $('tmv-dl-png').addEventListener('click', () => {
    const text = textEl.value.trim();
    if (!text || typeof window.JsBarcode === 'undefined') return;
    try {
      window.JsBarcode(canvasEl, text, { format: fmtEl.value, width: 2, height: +hEl.value || 100, displayValue: true, fontSize: 16, margin: 10, background: '#ffffff', lineColor: '#000000' });
      canvasEl.toBlob(blob => {
        if (!blob) { toast('Không tạo được ảnh PNG. Hãy chụp màn hình mã vạch.'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ma-vach.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        toast('Đã tải ảnh mã vạch PNG.');
      }, 'image/png');
    } catch (e) {
      toast('Không tải được ảnh PNG. Hãy chụp màn hình mã vạch.');
    }
  });

  $('tmv-dl-svg').addEventListener('click', () => {
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ma-vach.svg';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Đã tải file mã vạch SVG.');
    } catch (e) {
      toast('Không tải được file SVG.');
    }
  });
}
