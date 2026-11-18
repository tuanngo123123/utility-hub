// Helper chỉ chạy lúc build: escape HTML + thẻ công cụ dùng chung
// cho trang chủ (nổi bật) và trang catalog (/cong-cu/).
import { categoryLabel } from './categories.js';
import { categoryArt } from './category-art.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// keywords trong meta có thể là chuỗi ("a, b, c") hoặc mảng — chuẩn hóa về chuỗi.
export function keywordsText(meta) {
  if (Array.isArray(meta.keywords)) return meta.keywords.join(', ');
  return typeof meta.keywords === 'string' ? meta.keywords : '';
}

// Thẻ công cụ trong catalog. Các thuộc tính data-* để app.js lọc/tìm kiếm lúc chạy
// (app.js tự chuẩn hóa không dấu lúc chạy, nên ở đây giữ nguyên văn bản gốc).
// (Đổi giao diện 18/11, phong cách 21st.dev: dải hình minh họa đầu thẻ
// 16:10 + tên + mô tả 1 dòng + badge "Miễn phí" + nút "Dùng ngay" hiện
// khi hover; GIỮ NGUYÊN class .catalog-card, href, aria-label, toàn bộ
// data-* và chip hạng mục .card-cat.)
// Lưu ý: meta công cụ KHÔNG có trường đánh dấu "mới" (đã kiểm tra src/tools/
// + build — không có isNew/new/badge) nên thẻ chỉ có badge "Miễn phí",
// không bịa badge "Mới".
export function toolCard(tool, index) {
  return `<a class="catalog-card" href="/cong-cu/${esc(tool.slug)}/" aria-label="Mở công cụ ${esc(tool.name)}" data-name="${esc(tool.name)}" data-desc="${esc(tool.desc)}" data-keywords="${esc(keywordsText(tool))}" data-category="${esc(tool.categorySlug)}">
  <span class="card-art" aria-hidden="true">${categoryArt(tool.categorySlug)}</span>
  <span class="card-badge">Miễn phí</span>
  <h3 class="card-title">${esc(tool.name)}</h3>
  <p class="card-desc">${esc(tool.desc)}</p>
  <span class="chip card-cat">${esc(categoryLabel(tool.categorySlug))}</span>
  <span class="card-cta">Dùng ngay →</span>
</a>`;
}
