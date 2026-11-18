// Khung HTML chung cho mọi trang (chỉ chạy lúc build).
// shell({title, desc, keywords, canonical, body, extraHead, navActive, noscriptLinks, needsQR, vendorScripts})
//  - title: tiêu đề đầy đủ cho <title> (đã gồm tên trang)
//  - desc: meta description + og:description
//  - keywords: meta keywords (có thể để trống)
//  - canonical: URL tuyệt đối của trang
//  - body: HTML nội dung trong <main>
//  - extraHead: HTML thêm vào <head> (nếu cần)
//  - navActive: 'home' | 'cong-cu' | 'sinh-vien' | 'huong-dan' | 'hoc-mien-phi' | 'giao-vien' | 'code-mau' | 'diem-bao' | 'ung-ho' | '' — tô sáng mục nav tương ứng
//    (Học miễn phí KHÔNG có trong nav chính: thêm mục thứ 8 làm header
//    tràn 57px ở 1280px — đã đo thật 18/11/2026; chỉ link từ trang chủ,
//    trang Sinh viên và chân trang.)
//  - noscriptLinks: HTML danh sách link công cụ cho khối <noscript> (build.mjs sinh;
//    để trống thì chỉ hiện thông báo, không có danh sách)
//  - needsQR: true thì nạp thêm /assets/vendor/qrcode-generator.js — chỉ trang
//    VietQR/WiFi QR và trang Ủng hộ cần (các trang khác không nạp, tiết kiệm ~57 KB)
//  - vendorScripts: mảng tên file thư viện trong /assets/vendor/ cần nạp riêng
//    cho trang này (VD: ['pdf-lib.min.js']) — mở rộng chung của mẫu needsQR:
//    mỗi trang công cụ chỉ nạp đúng thư viện nó dùng, trang chủ không nặng thêm.
//    File phải có trong src/vendor/ và được build.mjs copy sang dist/
//    (xem TOOL_VENDOR_SCRIPTS trong build.mjs).
// Không dùng CDN/font/thư viện ngoài: CSS + JS đều là file nội bộ trong /assets/.
// Ngân sách hiệu năng (worker W11): 1 CSS (style.css đã gộp effects.css) + 1 JS
// (app.js đã gộp mascot.js) trên mọi trang; trang từng công cụ nạp thêm
// tool-state.js (lưu trạng thái qua URL + nút Đặt lại); QR chỉ nạp khi needsQR.
import { CATEGORIES } from './categories.js';

const SITE_NAME = 'Tiện Ích Hub';
const CONTACT_EMAIL = 'ngotuantdmu97@gmail.com';

// 8 công cụ chính trong sơ đồ footer (slug + tên = meta.id/meta.name đã đối chiếu).
const FOOTER_TOOLS = [
  { slug: 'luong-gross-net', name: 'Tính lương Gross ⇄ Net' },
  { slug: 'tien-dien-bac-thang', name: 'Tính tiền điện bậc thang' },
  { slug: 'vietqr-wifi-qr', name: 'Tạo VietQR & WiFi QR' },
  { slug: 'lich-am', name: 'Lịch âm hôm nay & lịch tháng' },
  { slug: 'lai-vay', name: 'Tính lãi vay & lịch trả nợ' },
  { slug: 'phan-tram', name: 'Tính phần trăm & giá sau giảm' },
  { slug: 'bmi', name: 'Tính BMI & cân nặng lý tưởng' },
  { slug: 'doi-don-vi-nhanh', name: 'Đổi đơn vị nhanh' },
];

// Favicon là FILE thật (src/logo/) — Google Search không đọc được favicon
// dạng data URI nên trước đây kết quả tìm kiếm chỉ hiện quả cầu mặc định.
// build.mjs copy các file này ra dist (gốc + assets/).
const FAVICON_LINKS = `<link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
const OG_IMAGE = 'https://tienichhub.io.vn/assets/og-image.png';

// Script chống nháy giao diện tối: chạy trước CSS, đọc lựa chọn đã lưu.
const THEME_BOOT = `<script>try{var t=localStorage.getItem('uh-theme');if(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}</script>`;

export function shell({ title, desc, keywords = '', canonical, body, extraHead = '', navActive = '', noscriptLinks = '', needsQR = false, vendorScripts = [], hideChat = false }) {
  const active = (key) => (navActive === key ? ' nav-active' : '');
  const keywordsMeta = keywords ? `\n  <meta name="keywords" content="${keywords}">` : '';
  const categoryLinks = CATEGORIES.map((c) => `<a href="/cong-cu/?cat=${c.slug}">${c.label}</a>`).join('\n        ');
  const footerToolLinks = FOOTER_TOOLS.map((t) => `<a href="/cong-cu/${t.slug}/">${t.name}</a>`).join('\n        ');
  const qrScript = needsQR ? '\n  <script src="/assets/vendor/qrcode-generator.js" defer></script>' : '';
  // Thư viện vendor riêng theo trang (VD: pdf.js/pdf-lib chỉ cho trang PDF) —
  // defer như QR: chạy xong trước DOMContentLoaded nên init() dùng được ngay.
  const vendorTags = vendorScripts.map((f) => `\n  <script src="/assets/vendor/${f}" defer></script>`).join('');
  const noscriptBlock = `<noscript>
    <div class="wrap noscript-notice">
      <p><strong>Trang cần JavaScript để dùng đầy đủ công cụ</strong> — dưới đây là danh sách link tới toàn bộ công cụ.</p>
      ${noscriptLinks ? `<nav class="noscript-links" aria-label="Danh sách công cụ">\n      ${noscriptLinks}\n      </nav>` : ''}
    </div>
  </noscript>`;
  // Nút chat AI nổi (bong bóng Messenger): có ở mọi trang TRỪ trang
  // công cụ Trò chuyện AI (tránh 2 khung chat cùng lúc) và trang nào
  // đặt hideChat (Bàn giáo viên — máy chiếu không cần bong bóng chat).
  // app.js cũng kiểm tra pathname khi khởi tạo (phòng khi điều hướng
  // không qua build). hidden mặc định: chỉ hiện khi JS chạy (không JS
  // thì nút chết).
  const chatWidget = hideChat ? '' : /\/cong-cu\/tro-chuyen-ai\//.test(canonical || '') ? '' : `
  <div class="aiw" id="aiw" hidden>
    <button type="button" class="aiw-fab" id="aiw-fab" aria-label="Chat với AI" aria-expanded="false" aria-controls="aiw-panel"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>Chat AI</span></button>
    <section class="aiw-panel" id="aiw-panel" aria-label="Trò chuyện AI" hidden>
      <header class="aiw-head">
        <h2>Trò chuyện AI</h2>
        <button type="button" class="aiw-close" id="aiw-close" aria-label="Đóng khung chat">✕</button>
      </header>
      <div class="aiw-log" id="aiw-log" aria-live="polite"></div>
      <div class="aiw-suggest" id="aiw-suggest">
        <button type="button" class="chip" data-q="Giải thích lãi kép thật đơn giản, ví dụ cụ thể">Lãi kép là gì?</button>
        <button type="button" class="chip" data-q="Viết giúp tôi email xin nghỉ phép 2 ngày, lịch sự, ngắn gọn">Viết email xin nghỉ phép</button>
        <button type="button" class="chip" data-q="Cho tôi 3 ý tưởng tiết kiệm tiền mỗi tháng cho người đi làm">3 ý tưởng tiết kiệm tiền</button>
      </div>
      <div class="aiw-input-row">
        <input id="aiw-input" type="text" maxlength="500" placeholder="Nhập câu hỏi…" autocomplete="off">
        <button type="button" class="btn btn-primary" id="aiw-send">Gửi</button>
      </div>
      <p class="aiw-full"><a href="/cong-cu/tro-chuyen-ai/">Mở trang chat đầy đủ →</a></p>
    </section>
  </div>`;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">${keywordsMeta}
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:locale" content="vi_VN">
  <meta name="theme-color" content="#0033FF">
  ${FAVICON_LINKS}
  ${THEME_BOOT}
  <link rel="stylesheet" href="/assets/style.css">${qrScript}${vendorTags}
  <script src="/assets/app.js" defer></script>
  ${extraHead}
</head>
<body>
  <a class="skip-link" href="#main-content">Bỏ qua tới nội dung chính</a>
  <header class="site-header" id="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/" aria-label="Tiện Ích Hub — trang chủ"><span class="brand-logo-wrap"><img class="brand-logo" src="/favicon.svg" alt="" width="30" height="30"><span class="brand-dot" aria-hidden="true"></span></span><span class="brand-name">Tiện Ích <span>Hub</span></span></a>
      <nav class="site-nav" id="site-nav" aria-label="Điều hướng chính">
        <a href="/" class="${active('home') ? 'nav-active' : ''}">Trang chủ</a>
        <a href="/cong-cu/" class="${active('cong-cu') ? 'nav-active' : ''}">Công cụ</a>
        <a href="/sinh-vien/" class="${active('sinh-vien') ? 'nav-active' : ''}">Sinh viên</a>
        <a href="/huong-dan/" class="${active('huong-dan') ? 'nav-active' : ''}">Hướng dẫn</a>
        <a href="/hoc-mien-phi/" class="${active('hoc-mien-phi') ? 'nav-active' : ''}">Học miễn phí</a>
        <a href="/giao-vien/" class="${active('giao-vien') ? 'nav-active' : ''}">Giáo viên</a>
        <a href="/code-mau/" class="${active('code-mau') ? 'nav-active' : ''}">Code mẫu</a>
        <a href="/diem-bao/" class="${active('diem-bao') ? 'nav-active' : ''}">Điểm báo</a>
        <a href="/ung-ho/" class="${active('ung-ho') ? 'nav-active' : ''}">Ủng hộ</a>
        <button type="button" class="nav-sound" id="nav-sound-toggle" aria-pressed="true">Âm thanh: Bật</button>
      </nav>
      <div class="header-actions">
        <button type="button" class="header-search-btn" id="header-search-btn" aria-label="Tìm kiếm công cụ"><svg class="header-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span class="header-search-label">Tìm kiếm</span> <kbd>⌘K</kbd></button>
        <a class="btn btn-primary btn-header-cta" href="/cong-cu/">Dùng ngay</a>
        <button type="button" class="sound-toggle" id="sound-toggle" aria-label="Bật/tắt âm thanh" aria-pressed="true"><svg class="snd-on" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg><svg class="snd-off" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg></button>
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Đổi giao diện sáng/tối">🌙</button>
        <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Mở menu" aria-expanded="false" aria-controls="site-nav">☰</button>
      </div>
    </div>
  </header>
${noscriptBlock}

  <main class="wrap main" id="main-content">
${body}
  </main>

  <footer class="site-footer">
    <div class="wrap footer-inner">
      <p class="footer-brand">${SITE_NAME} — công cụ miễn phí, chạy ngay trên trình duyệt của bạn.</p>
      <div class="footer-cols">
        <div class="footer-col">
          <h3>Công cụ</h3>
          <a href="/">Trang chủ</a>
          <a href="/cong-cu/">Công cụ</a>
          <a href="/code-mau/">Code mẫu</a>
          <a href="/hoc-mien-phi/">Học miễn phí</a>
          <a href="/giao-vien/">Giáo viên</a>
        </div>
        <div class="footer-col">
          <h3>Hỗ trợ</h3>
          <a href="/ung-ho/">Ủng hộ</a>
          <a href="/lien-he/">Liên hệ</a>
        </div>
        <div class="footer-col">
          <h3>Chính sách</h3>
          <a href="/dieu-khoan/">Điều khoản sử dụng</a>
          <a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a>
        </div>
        <div class="footer-col">
          <h3>Hạng mục</h3>
          ${categoryLinks}
        </div>
        <div class="footer-col">
          <h3>Công cụ chính</h3>
          ${footerToolLinks}
        </div>
      </div>
      <p class="muted small">Liên hệ: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      <p class="muted small">© 2026 ${SITE_NAME} — Ngô Minh Tuấn. Mọi tính toán trong công cụ chạy trên trình duyệt và không gửi dữ liệu của bạn lên máy chủ.</p>
    </div>
  </footer>
  <nav class="bottom-nav" aria-label="Điều hướng dưới cùng">
    <a href="/" class="${navActive === 'home' ? 'bottom-nav-active' : ''}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></svg><span>Trang chủ</span></a>
    <a href="/cong-cu/" class="${navActive === 'cong-cu' ? 'bottom-nav-active' : ''}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>Công cụ</span></a>
    <a href="/sinh-vien/" class="${navActive === 'sinh-vien' ? 'bottom-nav-active' : ''}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 2 8.5 12 13l10-4.5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/></svg><span>Sinh viên</span></a>
    <a href="/diem-bao/" class="${navActive === 'diem-bao' ? 'bottom-nav-active' : ''}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h6M7 12h10M7 16h7"/></svg><span>Điểm báo</span></a>
  </nav>
${chatWidget}
  <!-- Cloudflare Web Analytics: ĐÃ BẬT (18/11/2026, site tienichhub.io.vn).
       (Chính sách bảo mật mục 11 đã mô tả dịch vụ này: không cookie, không thu thập
       thông tin nhận dạng cá nhân.) -->
  <!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "dd0aac1b776f42ec95763e59e4913fc9"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
`;
}
