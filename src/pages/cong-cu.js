// Trang catalog đầy đủ (/cong-cu/): ô tìm kiếm + 11 thẻ hạng mục
// (đổi giao diện 18/11, phong cách 21st.dev: bề mặt trắng + ô icon màu
// thay cho thẻ đặc màu toàn thẻ kiểu cũ; màu riêng từng hạng mục vẫn qua
// biến --cat-color, bấm vào lọc lưới theo hạng mục) +
// chip lọc 11 hạng mục + lưới thẻ công cụ (mỗi thẻ link tới /cong-cu/<slug>/).
// Danh sách công cụ do build.mjs chèn vào lúc build (render sẵn, không cần JS
// để xem; JS chỉ phục vụ tìm kiếm/lọc).
// Trang này đọc tham số URL: ?q=<từ khóa> tự điền ô tìm kiếm + lọc ngay,
// ?cat=<slug> tự chọn chip hạng mục + lọc ngay (xem setupSearchFilter).
import { toolCard, esc } from '../tool-card.js';
import { CATEGORIES, CATEGORY_FEATURED, categoryColor, categoryColorDark } from '../categories.js';

export function body({ tools = [], categories = [] } = {}) {
  const cats = categories.length ? categories : CATEGORIES;
  const bySlug = new Map(tools.map((t) => [t.slug, t]));

  // Một thẻ đặc màu cho MỖI hạng mục (11 hạng mục — không bỏ hạng mục nào).
  // Nền thẻ dùng màu hạng mục (--cat-color); ô icon nền trắng mờ trên nền
  // màu. Hàng đầu (.cat-head) gom ô icon + pill số công cụ để CSS xếp ngang.
  const categoryHtml = cats.map((c) => {
    const inCat = tools.filter((t) => t.categorySlug === c.slug);
    const featured = bySlug.get(CATEGORY_FEATURED[c.slug]) || inCat[0];
    return `<a class="cat-card" href="/cong-cu/?cat=${esc(c.slug)}" style="--cat-color: ${esc(c.color || '#2563eb')}">
  <span class="cat-head">
    <span class="cat-icon" aria-hidden="true">${esc(c.icon || '🔧')}</span>
    <span class="cat-count">${inCat.length} công cụ</span>
  </span>
  <h3 class="cat-name">${esc(c.label)}</h3>
  ${featured ? `<p class="cat-featured">Tiêu biểu: ${esc(featured.name)}</p>` : ''}
  <span class="cat-arrow" aria-hidden="true">→</span>
</a>`;
  }).join('\n');

  // Chip lọc tô màu hạng mục (hướng B): biến --cat-color đặt inline theo
  // từng chip; chip "Tất cả" giữ xanh mặc định của web.
  const chips = [`<button type="button" class="chip chip-active" data-filter="all" aria-pressed="true">Tất cả</button>`]
    .concat(cats.map((c) => `<button type="button" class="chip chip-cat" data-filter="${c.slug}" aria-pressed="false" style="--cat-color: ${esc(categoryColor(c.slug))}; --cat-color-dark: ${esc(categoryColorDark(c.slug))}">${esc(c.label)}</button>`))
    .join('\n      ');

  const grid = tools.length
    ? `<div class="grid-3" id="tool-grid">
${tools.map((tool, i) => toolCard(tool, i)).join('\n')}
</div>
<div id="tool-empty" class="empty-state" hidden><div data-mascot="empty" aria-hidden="true"></div><p><strong>Không tìm thấy công cụ nào phù hợp.</strong></p><p class="muted">Thử từ khóa khác — ví dụ <a href="/cong-cu/?q=t%C3%ADnh%20l%C6%B0%C6%A1ng%20net">tính lương net</a> — hoặc chọn một hạng mục ở trên.</p></div>`
    : `<p class="muted">Chưa có công cụ nào — đang cập nhật.</p>`;

  return `
  <section class="section">
    <h1 class="page-title">Tất cả công cụ</h1>
    <p class="muted" id="tool-count">${tools.length} công cụ — miễn phí, chạy ngay trên trình duyệt, không cần đăng nhập.</p>
    <label class="small muted" for="tool-search">Tìm công cụ</label>
    <input type="search" id="tool-search" class="search-input search-input-large" placeholder="VD: tính phần trăm, đổi đơn vị, BMI… (gõ không dấu cũng được)" autocomplete="off">
    <div class="hero-chips" aria-label="Từ khóa hay tìm">
      <a class="chip" href="/cong-cu/?q=t%C3%ADnh%20l%C6%B0%C6%A1ng%20net">Tính lương net</a>
      <a class="chip" href="/cong-cu/?q=ti%E1%BB%81n%20%C4%91i%E1%BB%87n">Tiền điện</a>
      <a class="chip" href="/cong-cu/?q=VietQR">VietQR</a>
      <a class="chip" href="/cong-cu/?q=l%E1%BB%8Bch%20%C3%A2m">Lịch âm</a>
    </div>
    <div id="cat-section">
    <h2 class="cat-heading">Hạng mục công cụ</h2>
    <div class="cat-grid">
${categoryHtml}
    </div>
    </div>
    <p><button type="button" class="btn dice-btn" id="dice-catalog"><svg class="dice-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.4" fill="currentColor" stroke="none"/></svg><span class="dice-label">Thử công cụ ngẫu nhiên</span></button></p>
    <div class="chip-row" id="filter-chips" role="group" aria-label="Lọc theo hạng mục">
      ${chips}
    </div>
    <p id="filter-status" class="muted" hidden><span id="filter-status-text"></span> <button type="button" class="chip" id="filter-clear">✕ Xóa lọc</button></p>
    ${grid}
  </section>`;
}
