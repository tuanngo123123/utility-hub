// Helper chỉ chạy lúc build: escape HTML + thẻ công cụ dùng chung
// cho trang chủ (nổi bật) và trang catalog (/cong-cu/).
import { categoryLabel, categoryColor, categoryColorDark } from './categories.js';
import { toolArt } from './tool-art.js';

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

// Nhóm mini-demo cho "thẻ sống" (hướng B đợt 1, ý 9 báo cáo sáng tạo):
// mỗi hạng mục thuộc 1 trong 4 nhóm — demo chạy khi rê chuột vào thẻ
// (desktop) hoặc khi thẻ lăn vào màn hình lần đầu (mobile, app.js gắn
// class .demo-on). Chỉ CSS transform/opacity; tắt hẳn khi
// prefers-reduced-motion. Nội dung demo chỉ là hình trang trí, không
// bịa số liệu của công cụ.
const DEMO_GROUP = {
  'tai-chinh': 'calc', 'suc-khoe': 'calc', 'nha-bep': 'calc', 'mua-sam': 'calc',
  'dev-web': 'code', 'github': 'code',
  'van-phong': 'file',
};
function demoGroup(slug) { return DEMO_GROUP[slug] || 'play'; }

function demoHtml(group) {
  if (group === 'calc') return '<span class="demo-bars" aria-hidden="true"><i></i><i></i><i></i></span>';
  if (group === 'code') return '<span class="demo-grid" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
  if (group === 'file') return '<span class="demo-shrink" aria-hidden="true"><i></i></span>';
  return '<span class="demo-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
}

// Thẻ công cụ trong catalog. Các thuộc tính data-* để app.js lọc/tìm kiếm lúc chạy
// (app.js tự chuẩn hóa không dấu lúc chạy, nên ở đây giữ nguyên văn bản gốc).
// (Đổi giao diện 18/11, phong cách 21st.dev: dải hình minh họa đầu thẻ
// 16:10 + tên + mô tả 1 dòng + nút "Dùng ngay" luôn hiện; GIỮ NGUYÊN class
// .catalog-card, href, aria-label, toàn bộ data-* và chip hạng mục .card-cat.)
// Hướng B đợt 1: BỎ badge "Miễn phí" (cả 129 công cụ đều miễn phí nên badge
// chỉ là nhiễu); thẻ mang biến --cat-color/--cat-color-dark của hạng mục
// (CSS dùng cho viền trái, chip, demo); mini-demo theo nhóm trong dải hình.
// Lưu ý: meta công cụ KHÔNG có trường đánh dấu "mới" (đã kiểm tra src/tools/
// + build — không có isNew/new/badge) nên thẻ không có badge "Mới".
export function toolCard(tool, index) {
  const group = demoGroup(tool.categorySlug);
  return `<a class="catalog-card" href="/cong-cu/${esc(tool.slug)}/" aria-label="Mở công cụ ${esc(tool.name)}" data-name="${esc(tool.name)}" data-desc="${esc(tool.desc)}" data-keywords="${esc(keywordsText(tool))}" data-category="${esc(tool.categorySlug)}" style="--cat-color: ${esc(categoryColor(tool.categorySlug))}; --cat-color-dark: ${esc(categoryColorDark(tool.categorySlug))}">
  <span class="card-art" aria-hidden="true">${toolArt(tool.slug, tool.categorySlug)}<span class="card-demo" data-demo="${group}">${demoHtml(group)}</span></span>
  <h3 class="card-title">${esc(tool.name)}</h3>
  <p class="card-desc">${esc(tool.desc)}</p>
  <span class="chip card-cat">${esc(categoryLabel(tool.categorySlug))}</span>
  <span class="card-cta">Dùng ngay →</span>
</a>`;
}
