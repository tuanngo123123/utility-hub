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
import { COURSES, DEALS, SEASONAL_DEAL, TEMPLATES, STUDENT_TOOL_SLUGS, SCHOLARSHIPS_DOMESTIC, SCHOLARSHIPS_ABROAD, BOOKS, EXAM_PREP, JOBS, JOB_SCAM } from './sinh-vien-data.js';

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
  ${c.cond ? `<p class="sv-cond"><strong>Điều kiện:</strong> ${esc(c.cond)}</p>` : ''}
  <p class="sv-cta">${c.limited ? '<span class="chip sv-chip-warn">Có giới hạn — đọc kỹ mức miễn phí</span> ' : ''}${extBtn(c.url, c.cta || 'Học ngay →')}</p>
</article>`;
}

// Thẻ học bổng: mức hỗ trợ + lưu ý (chu kỳ, điều kiện, cảnh báo).
// links rỗng = không có trang nộp đơn cố định (ghi rõ cách theo dõi
// trong note, ví dụ Panasonic); 2 links = NUS + NTU trong 1 thẻ.
function scholarshipCard(s) {
  return `<article class="sv-card">
  <h3 class="card-title">${esc(s.name)}</h3>
  <p class="sv-free"><strong>Mức hỗ trợ:</strong> ${esc(s.support)}</p>
  <p class="sv-cond">${esc(s.note)}</p>
  ${s.links && s.links.length ? `<p class="sv-cta">${s.links.map((l) => extBtn(l.url, l.label)).join(' ')}</p>` : ''}
</article>`;
}

function jobCard(j) {
  return `<article class="sv-card">
  <h3 class="card-title">${esc(j.name)}</h3>
  <p class="card-desc">${esc(j.desc)}</p>
  <p class="sv-cond">${esc(j.note)}</p>
  <p class="sv-cta">${extBtn(j.url, 'Xem việc →')}</p>
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

// Trang chính /sinh-vien/: thứ tự khối theo báo cáo bổ sung đợt 2 §5 —
// (1) khóa học (10, thêm Saylor), (2) sách giáo khoa miễn phí ★,
// (3) học bổng ★, (4) luyện thi IELTS/TOEIC ★, (5) mẫu biểu (13),
// (6) việc làm thêm & thực tập ★, (7) ưu đãi, (8) công cụ,
// (9) ghi chú pháp lý. Mục lục neo ở đầu trang vì trang đã dài.
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
    <p class="muted">Khóa học miễn phí, sách giáo khoa, học bổng, luyện thi IELTS/TOEIC, mẫu CV/báo cáo, việc làm thêm, ưu đãi phần mềm và công cụ học tập — gom một chỗ. Chỉ link tới nguồn miễn phí chính thức; mẫu biểu do Tiện Ích Hub tự viết.</p>
    <nav class="sv-toc" aria-label="Mục lục trang">
      <a class="chip" href="#khoa-hoc">Khóa học</a>
      <a class="chip" href="#sach">Sách miễn phí</a>
      <a class="chip" href="#hoc-bong">Học bổng</a>
      <a class="chip" href="#luyen-thi">IELTS/TOEIC</a>
      <a class="chip" href="#mau-bieu">Mẫu biểu</a>
      <a class="chip" href="#viec-lam">Việc làm thêm</a>
      <a class="chip" href="#uu-dai">Ưu đãi</a>
      <a class="chip" href="#cong-cu">Công cụ</a>
    </nav>
  </header>

  <section class="section" id="khoa-hoc" aria-label="Khóa học miễn phí">
    <h2>Khóa học miễn phí</h2>
    <p class="muted">Học online từ các nền tảng lớn — mức miễn phí ghi đúng như trang chính thức công bố (kể cả giới hạn, nếu có).</p>
    <div class="sv-grid">
${COURSES.map(courseCard).join('\n')}
    </div>
  </section>

  <section class="section" id="sach" aria-label="Sách giáo khoa miễn phí">
    <h2>Sách giáo khoa miễn phí</h2>
    <p class="muted">Sách giáo khoa và sách tham khảo miễn phí hợp pháp (giấy phép mở) — thay cho giáo trình photo. Sách tiếng Anh là chính.</p>
    <div class="sv-grid">
${BOOKS.map(courseCard).join('\n')}
    </div>
  </section>

  <section class="section" id="hoc-bong" aria-label="Học bổng">
    <h2>Học bổng</h2>
    <p class="muted">Hầu hết các đợt 2026–27 đã đóng — dưới đây chỉ ghi chu kỳ hằng năm; kiểm tra lịch mở hiện tại trên trang chính thức của từng chương trình.</p>
    <p class="muted">Phân biệt đối tượng: nhiều học bổng du học yêu cầu đã tốt nghiệp ĐH + 2 năm kinh nghiệm (Chevening, Fulbright, Australia Awards, Ireland Fellows, DAAD EPOS) — không dành cho sinh viên năm 1–2. Nhóm dành cho sinh viên đang học ĐH: học bổng trong nước + bậc ĐH ở nước ngoài (MEXT ĐH, GKS-U, Taiwan MOE ĐH, NUS/NTU, CSC ĐH).</p>
    <p class="note">⚠ Học bổng chính phủ không thu phí hồ sơ — trang nào thu tiền là lừa đảo.</p>
    <h3 class="sv-sub">Trong nước</h3>
    <div class="sv-grid">
${SCHOLARSHIPS_DOMESTIC.map(scholarshipCard).join('\n')}
    </div>
    <h3 class="sv-sub">Du học</h3>
    <div class="sv-grid">
${SCHOLARSHIPS_ABROAD.map(scholarshipCard).join('\n')}
    </div>
  </section>

  <section class="section" id="luyen-thi" aria-label="Luyện thi IELTS và TOEIC miễn phí">
    <h2>Luyện thi IELTS/TOEIC miễn phí</h2>
    <p class="muted">Chỉ nguồn chính thức của đơn vị tổ chức thi (British Council, IELTS, ETS, IDP, IIG, Cambridge) — không có đề thi thật bị rò rỉ hay tài liệu lậu.</p>
    <div class="sv-grid">
${EXAM_PREP.map(courseCard).join('\n')}
    </div>
  </section>

  <section class="section" id="mau-bieu" aria-label="Mẫu biểu và tài liệu">
    <h2>Mẫu biểu &amp; tài liệu</h2>
    <p class="muted">13 mẫu do Tiện Ích Hub tự viết — đọc online, bấm "In mẫu" để in hoặc lưu PDF. Thay các phần trong [ngoặc vuông] bằng thông tin của bạn và đối chiếu quy định của trường mình.</p>
    <div class="sv-grid">
${TEMPLATES.map(templateCard).join('\n')}
    </div>
  </section>

  <section class="section" id="viec-lam" aria-label="Việc làm thêm và thực tập">
    <h2>Việc làm thêm &amp; thực tập</h2>
    <p class="muted">Kênh tìm việc làm thêm và thực tập uy tín — tất cả đều miễn phí cho người tìm việc.</p>
    <div class="sv-grid">
${JOBS.map(jobCard).join('\n')}
    </div>
    <p class="note">${esc(JOB_SCAM.text)} <a href="${esc(JOB_SCAM.sourceUrl)}" target="_blank" rel="noopener">${esc(JOB_SCAM.sourceLabel)} →</a></p>
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
    <p class="note">Trang này chỉ link tới nguồn miễn phí chính thức của nhà cung cấp — không có sách lậu, khóa học lậu hay tài khoản dùng chung. Mẫu biểu do Tiện Ích Hub tự viết, bạn tự do dùng và sửa cho phù hợp với quy định của trường mình. Mức miễn phí/điều kiện có thể thay đổi theo nhà cung cấp — kiểm tra lại trên trang chính thức trước khi đăng ký. Học bổng chính phủ không thu phí hồ sơ — trang nào thu tiền là lừa đảo.</p>
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
