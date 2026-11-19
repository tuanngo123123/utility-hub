// Tạo mã QR cho link/văn bản — dùng UH.renderQR (qrcode-generator đã vendored).
export const meta = {
  id: 'tao-ma-qr',
  name: 'Tạo mã QR cho link & văn bản',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Nhập link hoặc bất kỳ văn bản nào để tạo mã QR, tải về dạng ảnh PNG. Quét bằng camera điện thoại là mở được link.',
  keywords: 'tạo mã qr, tạo qr code, qr link, qr code generator, tạo mã qr miễn phí, mã qr website, quét qr',
  icon: '🔳',
  seoTitle: 'Tạo mã QR cho link & văn bản — Miễn phí, tải ảnh PNG',
  seoDesc: 'Tạo mã QR cho đường link, văn bản, số điện thoại hay email. Tải về ảnh PNG để in hoặc chia sẻ — miễn phí, không cần đăng ký.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔳</span><div><h2>Tạo mã QR cho link &amp; văn bản</h2><p class="muted">Nhập link hoặc văn bản, bấm tạo mã — quét bằng camera điện thoại là mở được ngay.</p></div></div>
  <div class="field"><label for="tmq-text">Link hoặc văn bản</label><textarea id="tmq-text" rows="3" placeholder="Ví dụ: https://tienichhub.io.vn">https://tienichhub.io.vn</textarea></div>
  <p class="muted small" id="tmq-count"></p>
  <div class="grid-2">
    <div class="field"><label for="tmq-size">Kích thước ảnh</label><select id="tmq-size"><option value="256">256 × 256 px — vừa chia sẻ</option><option value="512" selected>512 × 512 px — in ấn nhỏ</option><option value="1024">1024 × 1024 px — in ấn lớn</option></select></div>
    <div class="field"><label>Thử nhanh</label><div>
      <button type="button" class="chip" data-tmq-ex="https://tienichhub.io.vn">Trang chủ Hub</button>
      <button type="button" class="chip" data-tmq-ex="https://www.youtube.com">YouTube</button>
      <button type="button" class="chip" data-tmq-ex="Xin chào từ Tiện Ích Hub!">Văn bản mẫu</button>
    </div></div>
  </div>
  <button type="button" class="btn btn-primary" id="tmq-go">Tạo mã QR</button>
  <div id="tmq-out"></div>
  <canvas id="tmq-canvas" width="512" height="512" style="display:none"></canvas>
  <p class="note">Mã QR chứa tối đa khoảng 2.900 ký tự. Văn bản càng dài, mã càng dày và càng khó quét — link ngắn quét dễ nhất. Cần QR chuyển khoản hay QR WiFi? Dùng công cụ "Tạo VietQR &amp; WiFi QR".</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);

  function updateCount() {
    const n = $('tmq-text').value.length;
    $('tmq-count').textContent = n.toLocaleString('vi-VN') + ' ký tự' + (n > 2000 ? ' — văn bản rất dài, mã QR có thể quá dày và khó quét.' : '');
  }
  $('tmq-text').addEventListener('input', updateCount);
  updateCount();

  root.querySelectorAll('[data-tmq-ex]').forEach(b => {
    b.addEventListener('click', () => { $('tmq-text').value = b.getAttribute('data-tmq-ex'); updateCount(); });
  });

  function drawQR(canvas, text) {
    if (typeof U.renderQR !== 'function') return false;
    try { U.renderQR(canvas, text); return true; }
    catch (e1) {
      try { U.renderQR(text, canvas); return true; }
      catch (e2) { return false; }
    }
  }

  $('tmq-go').addEventListener('click', () => {
    const text = $('tmq-text').value.trim();
    if (!text) { $('tmq-out').innerHTML = '<p class="error">Hãy nhập link hoặc văn bản cần tạo mã QR.</p>'; return; }
    if (text.length > 2900) { $('tmq-out').innerHTML = '<p class="error">Văn bản quá dài (' + text.length.toLocaleString('vi-VN') + ' ký tự). Mã QR chứa tối đa khoảng 2.900 ký tự — hãy rút ngắn nội dung.</p>'; return; }
    const size = +$('tmq-size').value || 512;
    const canvas = $('tmq-canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.display = '';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    if (!drawQR(canvas, text)) {
      $('tmq-out').innerHTML = '<p class="error">Không tạo được mã QR (nội dung có thể quá dài hoặc bộ vẽ QR chưa tải xong). Thử rút ngắn nội dung hoặc tải lại trang.</p>';
      canvas.style.display = 'none';
      return;
    }
    $('tmq-out').innerHTML = '<div class="result"><div class="result-row"><span>Nội dung mã QR</span><strong style="word-break:break-all">' +
      text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
      '</strong></div></div>' +
      '<button type="button" class="btn btn-ghost" id="tmq-dl">Tải ảnh PNG (' + size + ' × ' + size + ')</button>';
    $('tmq-dl').addEventListener('click', () => {
      try {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'ma-qr.png';
        a.click();
        toast('Đã tải ảnh mã QR.');
      } catch (e) {
        toast('Không tải được ảnh. Hãy chụp màn hình mã QR.');
      }
    });
  });
}
