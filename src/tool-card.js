// Helper chỉ chạy lúc build: escape HTML + thẻ công cụ dùng chung
// cho trang chủ (nổi bật) và trang catalog (/cong-cu/).
import { categoryLabel } from './categories.js';

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
// (Đổi giao diện 18/11: bỏ số thứ tự /01, /02… kiểu catalog cũ; thẻ mới
// kiểu iLovePDF: icon ô vuông bo góc + tên + mô tả + nhãn hạng mục.)
export function toolCard(tool, index) {
  const icon = tool.icon ? `<span class="card-icon" aria-hidden="true">${esc(tool.icon)}</span>` : '';
  return `<a class="catalog-card" href="/cong-cu/${esc(tool.slug)}/" aria-label="Mở công cụ ${esc(tool.name)}" data-name="${esc(tool.name)}" data-desc="${esc(tool.desc)}" data-keywords="${esc(keywordsText(tool))}" data-category="${esc(tool.categorySlug)}">
  ${icon}
  <h3 class="card-title">${esc(tool.name)}</h3>
  <p class="card-desc">${esc(tool.desc)}</p>
  <span class="chip card-cat">${esc(categoryLabel(tool.categorySlug))}</span>
</a>`;
}
