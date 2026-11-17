// Trang catalog đầy đủ (/cong-cu/): ô tìm kiếm + 11 thẻ hạng mục đặc màu
// (phong cách TinyWow: mỗi hạng mục 1 màu, icon trắng, tên trắng đậm,
// pill số công cụ, công cụ tiêu biểu; bấm vào lọc lưới theo hạng mục) +
// chip lọc 11 hạng mục + lưới thẻ công cụ (mỗi thẻ link tới /cong-cu/<slug>/).
// Danh sách công cụ do build.mjs chèn vào lúc build (render sẵn, không cần JS
// để xem; JS chỉ phục vụ tìm kiếm/lọc).
// Trang này đọc tham số URL: ?q=<từ khóa> tự điền ô tìm kiếm + lọc ngay,
// ?cat=<slug> tự chọn chip hạng mục + lọc ngay (xem setupSearchFilter).
import { toolCard, esc } from '../tool-card.js';
import { CATEGORIES, CATEGORY_FEATURED } from '../categories.js';

export function body({ tools = [], categories = [] } = {}) {
  const cats = categories.length ? categories : CATEGORIES;
  const bySlug = new Map(tools.map((t) => [t.slug, t]));

  // Một thẻ đặc màu cho MỖI hạng mục (11 hạng mục — không bỏ hạng mục nào).
  // Màu nền lấy từ CATEGORIES (biến --cat-color), bấm vào lọc lưới.
  const categoryHtml = cats.map((c) => {
    const inCat = tools.filter((t) => t.categorySlug === c.slug);
    const featured = bySlug.get(CATEGORY_FEATURED[c.slug]) || inCat[0];
    return `<a class="cat-card" href="/cong-cu/?cat=${esc(c.slug)}" style="--cat-color: ${esc(c.color || '#2563eb')}">
  <span class="cat-icon" aria-hidden="true">${esc(c.icon || '🔧')}</span>
  <span class="cat-count">${inCat.length} công cụ</span>
  <h3 class="cat-name">${esc(c.label)}</h3>
  ${featured ? `<p class="cat-featured">Tiêu biểu: ${esc(featured.name)}</p>` : ''}
  <span class="cat-arrow" aria-hidden="true">→</span>
</a>`;
  }).join('\n');

  const chips = [`<button type="button" class="chip chip-active" data-filter="all" aria-pressed="true">Tất cả</button>`]
    .concat(cats.map((c) => `<button type="button" class="chip" data-filter="${c.slug}" aria-pressed="false">${esc(c.label)}</button>`))
    .join('\n      ');

  const grid = tools.length
    ? `<div class="grid-3" id="tool-grid">
${tools.map((tool, i) => toolCard(tool, i)).join('\n')}
</div>
<p id="tool-empty" class="muted" hidden>Không tìm thấy công cụ nào phù hợp — thử từ khóa khác hoặc chọn hạng mục khác.</p>`
    : `<p class="muted">Chưa có công cụ nào — đang cập nhật.</p>`;

  return `
  <section class="section">
    <h1>Tất cả công cụ</h1>
    <p class="muted" id="tool-count">${tools.length} công cụ — miễn phí, chạy ngay trên trình duyệt, không cần đăng nhập.</p>
    <label class="small muted" for="tool-search">Tìm công cụ</label>
    <input type="search" id="tool-search" class="search-input search-input-large" placeholder="VD: tính phần trăm, đổi đơn vị, BMI… (gõ không dấu cũng được)" autocomplete="off">
    <div class="hero-chips" aria-label="Từ khóa hay tìm">
      <a class="chip" href="/cong-cu/?q=t%C3%ADnh%20l%C6%B0%C6%A1ng%20net">Tính lương net</a>
      <a class="chip" href="/cong-cu/?q=ti%E1%BB%81n%20%C4%91i%E1%BB%87n">Tiền điện</a>
      <a class="chip" href="/cong-cu/?q=VietQR">VietQR</a>
      <a class="chip" href="/cong-cu/?q=l%E1%BB%8Bch%20%C3%A2m">Lịch âm</a>
    </div>
    <h2 class="cat-heading">Hạng mục công cụ</h2>
    <div class="cat-grid">
${categoryHtml}
    </div>
    <div class="chip-row" role="group" aria-label="Lọc theo hạng mục">
      ${chips}
    </div>
    ${grid}
  </section>`;
}
