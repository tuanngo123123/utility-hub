// Trang Tất cả công cụ (/cong-cu/) — MẪU 4 (19/11/2026).
// H1 32px + 1 dòng; ô tìm kiếm dính khi cuộn, chip nhóm cuộn theo
// trang (20/11: trước đây cả thanh lọc dính lại cao 168px, chắn mất
// 1/4 màn hình — Tuấn báo); công cụ chia theo nhóm, mỗi nhóm tiêu đề
// 20px + dòng gọn 64px (tên đậm + 1 dòng mô tả), không ảnh, không nhãn
// "Miễn phí".
// Không tìm thấy thì hiện "Chưa có công cụ …" + link gợi ý công cụ
// (app.js đếm ẩn danh từ khóa vào localStorage + soạn mail).
// Danh sách công cụ do build.mjs chèn vào lúc build (render sẵn, không
// cần JS để xem; JS chỉ phục vụ tìm kiếm/lọc).
// Trang này đọc tham số URL: ?q=<từ khóa> tự điền ô tìm kiếm + lọc ngay,
// ?cat=<slug> tự chọn chip nhóm + lọc ngay (xem setupSearchFilter).
import { toolRow, esc } from '../tool-card.js';
import { CATEGORIES } from '../categories.js';

export function body({ tools = [], categories = [] } = {}) {
  const cats = categories.length ? categories : CATEGORIES;
  const groups = cats.map((c) => ({
    cat: c,
    items: tools.filter((t) => t.categorySlug === c.slug),
  })).filter((g) => g.items.length > 0);

  // Chip nhóm: "Tất cả" + 1 chip mỗi nhóm, kèm số lượng. Chip đang chọn
  // nền xanh chữ trắng (CSS theo aria-pressed).
  const chips = [`<button type="button" class="cat-chip" data-filter="all" aria-pressed="true">Tất cả <span class="cat-chip-count">${tools.length}</span></button>`]
    .concat(groups.map((g) => `<button type="button" class="cat-chip" data-filter="${esc(g.cat.slug)}" aria-pressed="false">${esc(g.cat.label)} <span class="cat-chip-count">${g.items.length}</span></button>`))
    .join('\n      ');

  const groupsHtml = groups.map((g) => `
    <section class="cat-group" data-cat="${esc(g.cat.slug)}" id="cat-${esc(g.cat.slug)}" aria-label="${esc(g.cat.label)}">
      <h2 class="cat-group-title">${esc(g.cat.label)} <span class="cat-group-count">· ${g.items.length} công cụ</span></h2>
      <div class="cat-rows">
${g.items.map(toolRow).join('\n')}
      </div>
    </section>`).join('');

  const groupsSection = tools.length
    ? `<div id="tool-groups">
${groupsHtml}
    </div>
    <div id="tool-empty" class="cat-empty" hidden><p>Chưa có công cụ “<span id="tool-empty-q"></span>”. <a id="tool-suggest-link" href="mailto:ngotuantdmu97@gmail.com?subject=G%E1%BB%A3i%20%C3%BD%20c%C3%B4ng%20c%E1%BB%A5%20m%E1%BB%9Bi">Gợi ý công cụ này cho tụi mình →</a></p></div>`
    : `<p class="muted">Chưa có công cụ nào — đang cập nhật.</p>`;

  return `
  <section class="section">
    <h1 class="page-title">Tất cả công cụ</h1>
    <p class="muted">${tools.length} công cụ miễn phí, chia theo nhóm. Gõ để lọc ngay.</p>
    <div class="cat-filter-sticky">
      <div class="cat-filter-wrap">
        <svg class="cat-filter-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="search" id="tool-search" class="cat-filter-input" placeholder="Lọc công cụ… ví dụ: tính lương net" autocomplete="off" aria-label="Lọc công cụ">
      </div>
    </div>
    <div class="cat-chips" id="filter-chips" role="group" aria-label="Lọc theo nhóm">
      ${chips}
    </div>
    <p id="filter-status" class="cat-filter-status" hidden><span id="filter-status-text"></span> <button type="button" class="chip" id="filter-clear">✕ Xóa lọc</button></p>
    ${groupsSection}
  </section>`;
}
