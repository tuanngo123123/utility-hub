// Khung HTML chung cho mọi trang (chỉ chạy lúc build).
// shell({title, desc, keywords, canonical, body, extraHead, navActive, noscriptLinks, needsQR, vendorScripts})
//  - title: tiêu đề đầy đủ cho <title> (đã gồm tên trang)
//  - desc: meta description + og:description
//  - keywords: meta keywords (có thể để trống)
//  - canonical: URL tuyệt đối của trang
//  - body: HTML nội dung trong <main>
//  - extraHead: HTML thêm vào <head> (nếu cần)
//  - navActive: 'home' | 'cong-cu' | 'sinh-vien' | 'code-mau' | 'ung-ho' | '' — tô sáng mục nav tương ứng
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

// Favicon nội tuyến (SVG data URI) — không cần file riêng.
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='%230033FF'/%3E%3Ctext x='32' y='45' font-size='32' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold'%3ETH%3C/text%3E%3C/svg%3E";

// Script chống nháy giao diện tối: chạy trước CSS, đọc lựa chọn đã lưu.
const THEME_BOOT = `<script>try{var t=localStorage.getItem('uh-theme');if(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}</script>`;

export function shell({ title, desc, keywords = '', canonical, body, extraHead = '', navActive = '', noscriptLinks = '', needsQR = false, vendorScripts = [] }) {
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
  <meta property="og:locale" content="vi_VN">
  <meta name="theme-color" content="#0033FF">
  <link rel="icon" href="${FAVICON}">
  ${THEME_BOOT}
  <link rel="stylesheet" href="/assets/style.css">${qrScript}${vendorTags}
  <script src="/assets/app.js" defer></script>
  ${extraHead}
</head>
<body>
  <a class="skip-link" href="#main-content">Bỏ qua tới nội dung chính</a>
  <header class="site-header" id="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/">Tiện Ích <span>Hub</span></a>
      <nav class="site-nav" id="site-nav" aria-label="Điều hướng chính">
        <a href="/" class="${active('home') ? 'nav-active' : ''}">Trang chủ</a>
        <a href="/cong-cu/" class="${active('cong-cu') ? 'nav-active' : ''}">Công cụ</a>
        <a href="/sinh-vien/" class="${active('sinh-vien') ? 'nav-active' : ''}">Sinh viên</a>
        <a href="/code-mau/" class="${active('code-mau') ? 'nav-active' : ''}">Code mẫu</a>
        <a href="/#diem-bao">Điểm báo</a>
        <a href="/ung-ho/" class="${active('ung-ho') ? 'nav-active' : ''}">Ủng hộ</a>
      </nav>
      <div class="header-actions">
        <button type="button" class="header-search-btn" id="header-search-btn" aria-label="Tìm kiếm công cụ">Tìm kiếm <kbd>⌘K</kbd></button>
        <a class="btn btn-primary btn-header-cta" href="/cong-cu/">Dùng ngay</a>
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
          <h3>Hạng mục</h3>
          ${categoryLinks}
          <h3>Công cụ chính</h3>
          ${footerToolLinks}
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
      </div>
      <p class="muted small">Liên hệ: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      <p class="muted small">© 2026 ${SITE_NAME} — Ngô Minh Tuấn. Mọi tính toán trong công cụ chạy trên trình duyệt và không gửi dữ liệu của bạn lên máy chủ.</p>
    </div>
  </footer>
  <nav class="bottom-nav" aria-label="Điều hướng dưới cùng">
    <a href="/" class="${navActive === 'home' ? 'bottom-nav-active' : ''}">Trang chủ</a>
    <a href="/cong-cu/" class="${navActive === 'cong-cu' ? 'bottom-nav-active' : ''}">Công cụ</a>
    <a href="/sinh-vien/" class="${navActive === 'sinh-vien' ? 'bottom-nav-active' : ''}">Sinh viên</a>
    <a href="/code-mau/" class="${navActive === 'code-mau' ? 'bottom-nav-active' : ''}">Code mẫu</a>
    <a href="/#diem-bao">Điểm báo</a>
    <a href="/ung-ho/" class="${navActive === 'ung-ho' ? 'bottom-nav-active' : ''}">Ủng hộ</a>
  </nav>
  <!-- Cloudflare Web Analytics: ĐÃ BẬT (18/11/2026, site tienichhub.io.vn).
       (Chính sách bảo mật mục 11 đã mô tả dịch vụ này: không cookie, không thu thập
       thông tin nhận dạng cá nhân.) -->
  <!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "dd0aac1b776f42ec95763e59e4913fc9"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
`;
}
