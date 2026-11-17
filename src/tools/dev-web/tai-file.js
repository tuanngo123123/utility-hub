// Tải file từ link — dán URL file → nút tải về qua thẻ <a download>.
export const meta = {
  id: 'tai-file',
  name: 'Tải file từ link',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Dán link file (ảnh, tài liệu…) để tải về máy qua nút tải trực tiếp, kèm hướng dẫn khi file không cho tải.',
  keywords: 'tải file từ link, download file url, tải ảnh từ link, tải tài liệu',
  icon: '⬇️',
  seoTitle: 'Tải file từ link — Tải ảnh, tài liệu từ URL',
  seoDesc: 'Dán link file để tải về máy. Hỗ trợ ảnh và tài liệu cho phép tải trực tiếp, có hướng dẫn khi link bị chặn.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>⬇️</span><div><h2>Tải file từ link</h2><p class="muted">Dán link file (ảnh, PDF, tài liệu…) để tạo nút tải về máy.</p></div></div>
  <div class="field"><label for="tf-url">Link file (bắt đầu bằng https://)</label><input id="tf-url" type="url" placeholder="https://example.com/tai-lieu.pdf"></div>
  <div class="field"><label for="tf-name">Tên file khi lưu (tùy chọn)</label><input id="tf-name" type="text" placeholder="VD: tai-lieu.pdf — để trống thì lấy tên từ link"></div>
  <button type="button" class="btn btn-primary" id="tf-go">Tạo nút tải</button>
  <div id="tf-out"></div>
  <p class="note">Chỉ tải trực tiếp được file mà máy chủ cho phép (không chặn hotlink/CORS). Nếu bấm tải mà trình duyệt chỉ mở file, hãy bấm chuột phải vào file rồi chọn "Lưu hình ảnh/tệp dưới dạng…".</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  $('tf-go').addEventListener('click', () => {
    const url = $('tf-url').value.trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      $('tf-out').innerHTML = '<p class="error">Vui lòng dán link hợp lệ, bắt đầu bằng http:// hoặc https://.</p>';
      return;
    }
    let filename = $('tf-name').value.trim();
    if (!filename) {
      try {
        const path = new URL(url).pathname;
        filename = decodeURIComponent(path.split('/').filter(Boolean).pop() || 'file-tai-ve');
      } catch (e) {
        filename = 'file-tai-ve';
      }
    }
    $('tf-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Link</span><strong style="word-break:break-all">${esc(url)}</strong></div>
      <div class="result-row"><span>Tên file khi lưu</span><strong>${esc(filename)}</strong></div>
    </div>
    <p><a class="btn btn-primary" id="tf-dl" href="${esc(url)}" download="${esc(filename)}">Tải file về máy</a>
    <a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">Mở link gốc</a></p>
    <p class="note">Nếu bấm "Tải file về máy" mà trình duyệt chỉ mở file thay vì tải, nghĩa là máy chủ không cho tải trực tiếp — hãy dùng nút "Mở link gốc", rồi bấm chuột phải vào file và chọn lưu về máy.</p>`;
    $('tf-dl').addEventListener('click', () => {
      setTimeout(() => {
        $('tf-out').insertAdjacentHTML('beforeend', '<p class="note">Nếu file chưa tải xuống sau vài giây, máy chủ có thể đã chặn tải trực tiếp — hãy mở link gốc và lưu tay.</p>');
      }, 4000);
    });
  });
}
