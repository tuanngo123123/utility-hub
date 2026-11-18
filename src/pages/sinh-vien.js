// Trang Sinh viên (/sinh-vien/ + /sinh-vien/<mau>/): mục riêng cho sinh
// viên — khóa học miễn phí, mẫu biểu tự viết, ưu đãi sinh viên, công cụ
// cho sinh viên (18/11/2026, theo báo cáo nghiên cứu
// ~/workspace/nghien-cuu-sinh-vien/bao-cao.md §2.8).
// Dữ liệu trong sinh-vien-data.js (chỉ chạy lúc build, không fetch lúc
// chạy). Nút "In mẫu" dùng [data-print] + setupPrintButtons trong app.js
// (theo mẫu [data-copy] của trang Code mẫu).
// Ranh giới pháp lý (§2.5): chỉ link nguồn miễn phí CHÍNH THỨC + nội dung
// gốc tự viết; không sách lậu/khóa lậu/tài khoản dùng chung.
import { esc, toolCard } from '../tool-card.js';
import { COURSES, DEALS, SEASONAL_DEAL, TEMPLATES, STUDENT_TOOL_SLUGS } from './sinh-vien-data.js';

// Link ngoài: luôn mở tab mới + rel noopener (mẫu newsCardHtml trong
// home.js). target="_blank" KHÔNG dùng cho link nội bộ.
function extBtn(url, label) {
  return `<a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

function courseCard(c) {
  return `<article class="sv-card">
  <h3 class="card-title">${esc(c.name)}</h3>
  <p class="card-desc">${esc(c.learn)}</p>
  <p class="sv-free"><strong>Miễn phí:</strong> ${esc(c.free)}</p>
  <p class="sv-cond"><strong>Điều kiện:</strong> ${esc(c.cond)}</p>
  <p class="sv-cta">${c.limited ? '<span class="chip sv-chip-warn">Có giới hạn — đọc kỹ mức miễn phí</span> ' : ''}${extBtn(c.url, 'Học ngay →')}</p>
</article>`;
}

function dealCard(d) {
  return `<article class="sv-card">
  <h3 class="card-title">${esc(d.name)}</h3>
  <p class="sv-free"><strong>Được gì:</strong> ${esc(d.get)}</p>
  <p class="sv-cond"><strong>Điều kiện:</strong> ${esc(d.cond)}</p>
  <p class="sv-cta">${extBtn(d.url, 'Đăng ký →')}</p>
</article>`;
}

function templateCard(t) {
  return `<article class="sv-card">
  <h3 class="card-title"><a href="/sinh-vien/${esc(t.slug)}/">${esc(t.title)}</a></h3>
  <p class="card-desc">${esc(t.desc)}</p>
  <p class="sv-cta"><a class="btn btn-ghost" href="/sinh-vien/${esc(t.slug)}/">Xem mẫu →</a></p>
</article>`;
}

// Trang chính /sinh-vien/: 5 khối theo đúng thứ tự §2.8 — (1) khóa học,
// (2) mẫu biểu, (3) ưu đãi (ưu đãi theo mùa lên đầu), (4) công cụ,
// (5) ghi chú pháp lý.
export function body({ tools = [] } = {}) {
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const missing = STUDENT_TOOL_SLUGS.filter((s) => !bySlug.has(s));
  if (missing.length) {
    throw new Error(`sinh-vien.js: công cụ sinh viên không tồn tại trong src/tools/: ${missing.join(', ')}`);
  }
  const studentTools = STUDENT_TOOL_SLUGS.map((s) => bySlug.get(s));

  return `
  <header class="tool-page-head">
    <h1>Dành cho sinh viên</h1>
    <p class="muted">Khóa học miễn phí, mẫu CV/báo cáo, ưu đãi phần mềm và công cụ học tập — gom một chỗ. Chỉ link tới nguồn miễn phí chính thức; mẫu biểu do Tiện Ích Hub tự viết.</p>
  </header>

  <section class="section" id="khoa-hoc" aria-label="Khóa học miễn phí">
    <h2>Khóa học miễn phí</h2>
    <p class="muted">Học online từ các nền tảng lớn — mức miễn phí ghi đúng như trang chính thức công bố (kể cả giới hạn, nếu có).</p>
    <div class="sv-grid">
${COURSES.map(courseCard).join('\n')}
    </div>
  </section>

  <section class="section" id="mau-bieu" aria-label="Mẫu biểu và tài liệu">
    <h2>Mẫu biểu &amp; tài liệu</h2>
    <p class="muted">8 mẫu do Tiện Ích Hub tự viết — đọc online, bấm "In mẫu" để in hoặc lưu PDF. Thay các phần trong [ngoặc vuông] bằng thông tin của bạn và đối chiếu quy định của trường mình.</p>
    <div class="sv-grid">
${TEMPLATES.map(templateCard).join('\n')}
    </div>
  </section>

  <section class="section" id="uu-dai" aria-label="Ưu đãi sinh viên">
    <h2>Ưu đãi sinh viên</h2>
    <div class="sv-seasonal" role="note">
      <p><span class="chip sv-chip-season">Ưu đãi theo mùa — ${esc(SEASONAL_DEAL.deadline)}</span></p>
      <h3>${esc(SEASONAL_DEAL.name)}</h3>
      <p>${esc(SEASONAL_DEAL.text)}</p>
      <p>${extBtn(SEASONAL_DEAL.url, 'Đăng ký tại Google →')}</p>
    </div>
    <p class="muted">Các ưu đãi dưới đây cần xác minh sinh viên — nhiều ưu đãi dùng SheerID: trường bạn phải có trong danh sách SheerID thì mới đăng ký được.</p>
    <div class="sv-grid">
${DEALS.map(dealCard).join('\n')}
    </div>
  </section>

  <section class="section" id="cong-cu" aria-label="Công cụ cho sinh viên">
    <h2>Công cụ cho sinh viên</h2>
    <p class="muted">Công cụ có sẵn trên web, hợp sinh viên nhất — tính điểm, quản lý thời gian, chia tiền, làm tài liệu.</p>
    <div class="grid-3">
${studentTools.map((tool, i) => toolCard(tool, i)).join('\n')}
    </div>
  </section>

  <section class="section" aria-label="Ghi chú">
    <p class="note">Trang này chỉ link tới nguồn miễn phí chính thức của nhà cung cấp — không có sách lậu, khóa học lậu hay tài khoản dùng chung. Mẫu biểu do Tiện Ích Hub tự viết, bạn tự do dùng và sửa cho phù hợp với quy định của trường mình. Mức miễn phí/điều kiện có thể thay đổi theo nhà cung cấp — kiểm tra lại trên trang chính thức trước khi đăng ký.</p>
  </section>`;
}

// Trang riêng từng mẫu /sinh-vien/<slug>/: nội dung mẫu + nút In + mẫu khác.
export function detailBody({ template, templates = [] } = {}) {
  const others = (templates.length ? templates : TEMPLATES).filter((t) => t.slug !== template.slug);
  return `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/sinh-vien/">← Mục sinh viên</a></nav>
  <header class="tool-page-head">
    <h1>${esc(template.title)}</h1>
    <p class="muted">${esc(template.desc)}</p>
    <p class="sv-actions"><button type="button" class="btn btn-primary" data-print>🖨 In mẫu</button></p>
  </header>
  <div class="sv-doc">
${template.body}
  </div>
  <p class="muted small">Mẫu do Tiện Ích Hub tự viết — bạn tự do dùng và sửa cho phù hợp với quy định của trường mình. Bấm "In mẫu" để in hoặc lưu thành PDF.</p>
  ${others.length ? `<section class="tool-related sv-related"><h2>Mẫu khác</h2><div class="sv-grid">${others.map(templateCard).join('\n')}</div></section>` : ''}`;
}
