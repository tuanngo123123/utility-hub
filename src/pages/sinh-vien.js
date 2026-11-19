// Trang Sinh viên (/sinh-vien/ + /sinh-vien/<mau>/): mục riêng cho sinh
// viên — công cụ, khóa học miễn phí, tài liệu học, sách giáo khoa, học
// bổng, luyện thi IELTS/TOEIC, mẫu biểu, việc làm thêm, ưu đãi sinh viên.
// Dữ liệu trong sinh-vien-data.js + hoc-mien-phi-data.js (chỉ chạy lúc
// build, không fetch lúc chạy). Nút "In mẫu" dùng [data-print] +
// setupPrintButtons trong app.js (theo mẫu [data-copy] của trang Code
// mẫu). Chia tab từ đợt menu MẪU 3/4 (19/11/2026): trang đã dài, tab
// giúp người đọc tới thẳng mục cần; tab mở theo hash (#tai-lieu-hoc...)
// nhờ setupTabs trong app.js — địa chỉ cũ /hoc-mien-phi/ chuyển hướng
// 301 tới /sinh-vien/#tai-lieu-hoc (xem _redirects trong build.mjs).
// Ranh giới pháp lý (§2.5): chỉ link nguồn miễn phí CHÍNH THỨC + nội dung
// gốc tự viết; không sách lậu/khóa lậu/tài khoản dùng chung.
import { esc } from '../tool-card.js';
import { iconSvg } from '../icons.js';
import { COURSES, DEALS, SEASONAL_DEAL, TEMPLATES, STUDENT_TOOL_SLUGS, SCHOLARSHIPS_DOMESTIC, SCHOLARSHIPS_ABROAD, BOOKS, EXAM_PREP, JOBS, JOB_SCAM } from './sinh-vien-data.js';
import { GROUPS } from './hoc-mien-phi-data.js';

// Icon + màu hộp icon cho 16 công cụ ở tab Công cụ (MẪU 4, 19/11) —
// mỗi công cụ một icon riêng, thay cho thẻ ảnh minh họa to cũ.
const TOOL_ICONS = {
  'gpa-tin-chi': { icon: 'trophy', bg: '#FEF3C7', fg: '#D97706' },
  'quy-doi-diem': { icon: 'percent', bg: '#E0F2FE', fg: '#0284C7' },
  'tinh-diem-thi-thpt': { icon: 'star', bg: '#FCE7F3', fg: '#DB2777' },
  'tinh-diem-ielts': { icon: 'globe', bg: '#DBEAFE', fg: '#1747E6' },
  'hoc-tu-vung-tieng-anh': { icon: 'book', bg: '#DCFCE7', fg: '#16A34A' },
  'pomodoro': { icon: 'clock', bg: '#FFEDD5', fg: '#EA580C' },
  'dem-nguoc-su-kien': { icon: 'timer', bg: '#EDE9FE', fg: '#7C3AED' },
  'test-go-phim': { icon: 'keyboard', bg: '#CCFBF1', fg: '#0D9488' },
  'doc-van-ban-thanh-tieng': { icon: 'volume', bg: '#DBEAFE', fg: '#1747E6' },
  'ghi-chep-tai-chinh': { icon: 'banknote', bg: '#DCFCE7', fg: '#16A34A' },
  'chia-tien-hoa-don': { icon: 'users', bg: '#FCE7F3', fg: '#DB2777' },
  'pdf-sang-word': { icon: 'file-text', bg: '#E0F2FE', fg: '#0284C7' },
  'gop-pdf': { icon: 'layers', bg: '#FEF3C7', fg: '#D97706' },
  'tach-trang-pdf': { icon: 'scissors', bg: '#FFEDD5', fg: '#EA580C' },
  'anh-sang-pdf': { icon: 'image', bg: '#EDE9FE', fg: '#7C3AED' },
  'tao-ma-qr': { icon: 'qr', bg: '#CCFBF1', fg: '#0D9488' },
};

// Mô tả ngắn (≤45 ký tự) cho 16 thẻ công cụ — mô tả gốc trong
// src/tools/* dài quá nên thẻ nào cũng bị cắt "…" (19/11). Theo mẫu
// MOST_USED_SHORT_DESC ở trang chủ: chỉ ghi đè ở trang này, không
// đổi mô tả gốc dùng chung cho trang /cong-cu/ và tìm kiếm.
const STUDENT_SHORT_DESC = {
  'gpa-tin-chi': 'Điểm trung bình GPA hệ 4 và hệ 10.',
  'quy-doi-diem': 'Đổi điểm hệ 10, hệ 4 và điểm chữ.',
  'tinh-diem-thi-thpt': 'Điểm tốt nghiệp THPT và xét tuyển ĐH.',
  'tinh-diem-ielts': 'Tính điểm IELTS từ 4 kỹ năng.',
  'hoc-tu-vung-tieng-anh': 'Học 400 từ tiếng Anh thông dụng nhất.',
  'pomodoro': 'Hẹn giờ tập trung 25 phút, nghỉ 5 phút.',
  'dem-nguoc-su-kien': 'Đếm ngược tới kỳ thi, sinh nhật, chuyến đi.',
  'test-go-phim': 'Đo tốc độ gõ phím tiếng Việt (WPM).',
  'doc-van-ban-thanh-tieng': 'Đọc văn bản tiếng Việt thành tiếng.',
  'ghi-chep-tai-chinh': 'Tổng hợp thu chi từ ghi chép hằng ngày.',
  'chia-tien-hoa-don': 'Chia hóa đơn cho cả nhóm, làm tròn nghìn.',
  'pdf-sang-word': 'Trích văn bản từ PDF ra file Word.',
  'gop-pdf': 'Gộp nhiều file PDF thành một file.',
  'tach-trang-pdf': 'Lấy vài trang từ PDF ra file mới.',
  'anh-sang-pdf': 'Ghép nhiều ảnh thành một file PDF.',
  'tao-ma-qr': 'Tạo mã QR từ link hoặc văn bản.',
};

// Thẻ dòng gọn MẪU 4 có icon SVG (cùng mẫu với trang /giao-vien/).
function toolRowIcon(tool) {
  const ic = TOOL_ICONS[tool.slug] || { icon: 'file-text', bg: '#E8EEFF', fg: '#1747E6' };
  return `<a class="tool-row tool-row-icon" href="/cong-cu/${esc(tool.slug)}/" aria-label="Mở công cụ ${esc(tool.name)}">
  <span class="tool-row-ico" style="background:${ic.bg};color:${ic.fg}">${iconSvg(ic.icon, 20, 2)}</span>
  <span class="tool-row-text"><span class="tool-row-name">${esc(tool.name)}</span><span class="tool-row-desc">${esc(STUDENT_SHORT_DESC[tool.slug] || tool.desc || '')}</span></span>
</a>`;
}

// Link ngoài: luôn mở tab mới + rel noopener (mẫu newsCardHtml trong
// home.js). target="_blank" KHÔNG dùng cho link nội bộ.
function extBtn(url, label) {
  return `<a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

function courseCard(c, fallbackCta) {
  // Không ghi nhãn "Miễn phí:" — văn bản c.free đa số đã mở đầu bằng
  // "Miễn phí" ("Miễn phí: Miễn phí 100%..." đọc thừa), và vài thẻ
  // (IIG, British Council VN) không phải tài liệu miễn phí nên nhãn
  // này còn mâu thuẫn với nội dung. Đoạn mô tả xám + đoạn chi tiết
  // đậm đã đủ phân biệt.
  return `<article class="sv-card">
  <h3 class="card-title">${esc(c.name)}</h3>
  <p class="card-desc">${esc(c.learn)}</p>
  <p class="sv-free">${esc(c.free)}</p>
  ${c.cond ? `<p class="sv-cond"><strong>Điều kiện:</strong> ${esc(c.cond)}</p>` : ''}
  <p class="sv-cta">${c.limited ? '<span class="chip sv-chip-warn">Có giới hạn — đọc kỹ mức miễn phí</span> ' : ''}${extBtn(c.url, c.cta || fallbackCta)}</p>
</article>`;
}

// Thẻ học bổng: mức hỗ trợ + hạn nộp (nếu có nguồn) + lưu ý.
// Chỉ 2 học bổng có chu kỳ hằng năm ghi trong dữ liệu (CSC, Taiwan
// MOE) — tách "Hạn hằng năm: ..." ra thành dòng riêng cho dễ thấy;
// các học bổng còn lại không bịa hạn, chỉ ghi "kiểm tra lịch mở hiện
// tại trên trang chính thức" ở đầu mục (xem body()).
function scholarshipCard(s) {
  let note = s.note;
  let deadline = '';
  const m = note.match(/Hạn hằng năm: (.+?)\.?$/);
  if (m) {
    deadline = m[1];
    note = note.slice(0, m.index).trim();
  }
  return `<article class="sv-card">
  <h3 class="card-title">${esc(s.name)}</h3>
  <p class="sv-free"><strong>Mức hỗ trợ:</strong> ${esc(s.support)}</p>
  ${deadline ? `<p class="sv-cond"><strong>Hạn nộp hằng năm:</strong> ${esc(deadline)}</p>` : ''}
  <p class="sv-cond">${esc(note)}</p>
  ${s.links && s.links.length ? `<p class="sv-cta">${s.links.map((l) => extBtn(l.url, l.label)).join(' ')}</p>` : ''}
</article>`;
}

// Thẻ repo học miễn phí (gộp từ trang /hoc-mien-phi/ cũ, 19/11): số
// sao cập nhật 18/11/2026; repo nào có trang web học trực tiếp thì
// nút chính là "Học ngay trên web", còn lại mở GitHub.
function repoCard(r) {
  const url = `https://github.com/${r.repo}`;
  const cta = r.live
    ? `<p class="sv-cta"><a class="btn btn-primary" href="${esc(r.live)}" target="_blank" rel="noopener">Học ngay trên web →</a></p>\n  <p class="sv-cond"><a href="${esc(url)}" target="_blank" rel="noopener">Xem mã nguồn trên GitHub</a></p>`
    : `<p class="sv-cta"><a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener">Mở trên GitHub →</a></p>`;
  return `<article class="sv-card">
  <h3 class="card-title">${esc(r.name)}</h3>
  <p class="sv-cond">⭐ ${esc(r.stars)} sao · <a href="${esc(url)}" target="_blank" rel="noopener">${esc(r.repo)}</a></p>
  <p class="card-desc">${esc(r.desc)}</p>
  ${cta}
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

// Trang chính /sinh-vien/: chia tab (đợt menu MẪU 3/4, 19/11) —
// (1) công cụ lên TRƯỚC (GPA, quy đổi điểm, điểm thi THPT, IELTS,
// học từ vựng...), (2) khóa học, (3) tài liệu học (gộp từ
// /hoc-mien-phi/ cũ), (4) sách giáo khoa miễn phí, (5) học bổng,
// (6) luyện thi IELTS/TOEIC, (7) mẫu biểu, (8) việc làm thêm &
// thực tập, (9) ưu đãi. Tab đầu mở sẵn; tab khác mở theo hash
// (#tai-lieu-hoc...) nhờ setupTabs trong app.js. Không JS thì tab
// đầu vẫn hiện (panel còn lại hidden) — nội dung vẫn đọc được phần
// công cụ; các mục khác cần JS (giới hạn đã biết, chấp nhận vì
// toàn bộ công cụ trên web đều cần JS).
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
    <p class="muted">Công cụ, khóa học, tài liệu, học bổng, mẫu biểu và việc làm thêm — gom một chỗ.</p>
  </header>

  <section class="section sv-tabs-section" aria-label="Các mục cho sinh viên">
    <div class="tabs sv-tabs" role="tablist" aria-label="Chọn mục">
      <button type="button" class="tab tab-active" data-tab-target="cong-cu" role="tab">Công cụ</button>
      <button type="button" class="tab" data-tab-target="khoa-hoc" role="tab">Khóa học</button>
      <button type="button" class="tab" data-tab-target="tai-lieu-hoc" role="tab">Tài liệu học</button>
      <button type="button" class="tab" data-tab-target="sach" role="tab">Sách miễn phí</button>
      <button type="button" class="tab" data-tab-target="hoc-bong" role="tab">Học bổng</button>
      <button type="button" class="tab" data-tab-target="luyen-thi" role="tab">IELTS/TOEIC</button>
      <button type="button" class="tab" data-tab-target="mau-bieu" role="tab">Mẫu biểu</button>
      <button type="button" class="tab" data-tab-target="viec-lam" role="tab">Việc làm thêm</button>
      <button type="button" class="tab" data-tab-target="uu-dai" role="tab">Ưu đãi</button>
    </div>

    <div class="tab-panel" data-tab-panel="cong-cu">
      <h2>Công cụ cho sinh viên</h2>
      <p class="muted">Công cụ có sẵn trên web, hợp sinh viên nhất — tính điểm, học từ vựng, quản lý thời gian, chia tiền, làm tài liệu.</p>
      <div class="cat-rows">
${studentTools.map((tool) => toolRowIcon(tool)).join('\n')}
      </div>
    </div>

    <div class="tab-panel" data-tab-panel="khoa-hoc" hidden>
      <h2>Khóa học miễn phí</h2>
      <p class="muted">Học online từ các nền tảng lớn — mức miễn phí ghi đúng như trang chính thức công bố (kể cả giới hạn, nếu có).</p>
      <div class="sv-grid">
${COURSES.map((c) => courseCard(c, 'Học ngay →')).join('\n')}
      </div>
      <p class="muted">Ngoài khóa học, GitHub còn rất nhiều kho tài liệu học miễn phí — xem tab <a href="#tai-lieu-hoc">Tài liệu học</a> trong trang này (repo học tiếng Anh, lập trình, thiết kế… kèm mô tả tiếng Việt và số sao).</p>
    </div>

    <div class="tab-panel" data-tab-panel="tai-lieu-hoc" hidden>
      <h2>Tài liệu học</h2>
      <p class="muted">Repo GitHub học miễn phí, mô tả bằng tiếng Việt — tiếng Anh, lập trình, thiết kế và hơn nữa. Tất cả đều miễn phí thật, không cần đăng ký tài khoản trả phí. Mục nào có nút <strong>Học ngay trên web</strong> thì mở ra học luôn trên trình duyệt, không cần cài đặt gì. Muốn xem chi tiết sao/fork/ngôn ngữ của repo nào, dùng <a href="/cong-cu/tra-cuu-github/">công cụ Tra cứu GitHub</a>.</p>
      <div class="result">
        <h3 style="margin-top:0">Học từ vựng tiếng Anh ngay trên web này</h3>
        <p class="muted">400 từ tiếng Anh thông dụng nhất, nghĩa tiếng Việt, ví dụ kèm dịch — học bằng thẻ từ có phát âm, gõ từ theo nghĩa hoặc trắc nghiệm. Không cần cài đặt gì, tiến độ được lưu lại trên trình duyệt của bạn.</p>
        <p><a class="btn btn-primary" href="/cong-cu/hoc-tu-vung-tieng-anh/">Học ngay trên web này →</a></p>
      </div>
${GROUPS.map((g) => `
      <h3 class="sv-sub">${esc(g.title)}</h3>
      <p class="muted">${esc(g.intro)}</p>
      <div class="sv-grid">
${g.repos.map(repoCard).join('\n')}
      </div>`).join('')}
      <p class="note">Số sao cập nhật ngày 18/11/2026 — số sao trên GitHub thay đổi theo thời gian, bấm vào repo để xem số mới nhất. Trang này chỉ giới thiệu repo, không sao chép nội dung của repo; mọi repo đều mở và miễn phí theo giấy phép của tác giả. Repo vi phạm điều khoản dịch vụ (hack trial, crack, lách luật) không bao giờ được đưa vào trang này.</p>
    </div>

    <div class="tab-panel" data-tab-panel="sach" hidden>
      <h2>Sách giáo khoa miễn phí</h2>
      <p class="muted">Sách giáo khoa và sách tham khảo miễn phí hợp pháp (giấy phép mở) — thay cho giáo trình photo. Sách tiếng Anh là chính.</p>
      <div class="sv-grid">
${BOOKS.map((c) => courseCard(c, 'Đọc sách →')).join('\n')}
      </div>
    </div>

    <div class="tab-panel" data-tab-panel="hoc-bong" hidden>
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
    </div>

    <div class="tab-panel" data-tab-panel="luyen-thi" hidden>
      <h2>Luyện thi IELTS/TOEIC miễn phí</h2>
      <p class="muted">Chỉ nguồn chính thức của đơn vị tổ chức thi (British Council, IELTS, ETS, IDP, IIG, Cambridge) — không có đề thi thật bị rò rỉ hay tài liệu lậu.</p>
      <div class="sv-grid">
${EXAM_PREP.map((c) => courseCard(c, 'Luyện ngay →')).join('\n')}
      </div>
    </div>

    <div class="tab-panel" data-tab-panel="mau-bieu" hidden>
      <h2>Mẫu biểu &amp; tài liệu</h2>
      <p class="muted">13 mẫu do Tiện Ích Hub tự viết — đọc online, bấm "In mẫu" để in hoặc lưu PDF. Thay các phần trong [ngoặc vuông] bằng thông tin của bạn và đối chiếu quy định của trường mình.</p>
      <div class="sv-grid">
${TEMPLATES.map(templateCard).join('\n')}
      </div>
    </div>

    <div class="tab-panel" data-tab-panel="viec-lam" hidden>
      <h2>Việc làm thêm &amp; thực tập</h2>
      <p class="muted">Kênh tìm việc làm thêm và thực tập uy tín — tất cả đều miễn phí cho người tìm việc.</p>
      <div class="sv-grid">
${JOBS.map(jobCard).join('\n')}
      </div>
      <p class="note">${esc(JOB_SCAM.text)} <a href="${esc(JOB_SCAM.sourceUrl)}" target="_blank" rel="noopener">${esc(JOB_SCAM.sourceLabel)} →</a></p>
    </div>

    <div class="tab-panel" data-tab-panel="uu-dai" hidden>
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
    </div>
  </section>

  <section class="section" aria-label="Ghi chú">
    <p class="note">Trang này chỉ link tới nguồn miễn phí chính thức của nhà cung cấp — không có sách lậu, khóa học lậu hay tài khoản dùng chung. Mẫu biểu do Tiện Ích Hub tự viết, bạn tự do dùng và sửa cho phù hợp với quy định của trường mình. Mức miễn phí/điều kiện có thể thay đổi theo nhà cung cấp — kiểm tra lại trên trang chính thức trước khi đăng ký. Học bổng chính phủ không thu phí hồ sơ — trang nào thu tiền là lừa đảo.</p>
  </section>`;
}

// Trang riêng từng mẫu /sinh-vien/<slug>/: nội dung mẫu + nút In + mẫu khác.
// Trang CV bọc thêm class cv-print-only để CSS in chỉ in tờ CV ví dụ
// (ẩn tiêu đề/mô tả trang + các khối .print-hide khi in — xem L12).
export function detailBody({ template, templates = [] } = {}) {
  const others = (templates.length ? templates : TEMPLATES).filter((t) => t.slug !== template.slug);
  const isCv = template.slug === 'cv-sinh-vien-moi-ra-truong';
  return `
  ${isCv ? '<div class="cv-print-only">' : ''}
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
  ${others.length ? `<section class="tool-related sv-related"><h2>Mẫu khác</h2><div class="sv-grid">${others.map(templateCard).join('\n')}</div></section>` : ''}
  ${isCv ? '</div>' : ''}`;
}
