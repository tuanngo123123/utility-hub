// Khung HTML chung cho mọi trang (chỉ chạy lúc build).
// shell({title, desc, keywords, canonical, body, extraHead, navActive, noscriptLinks, needsQR, vendorScripts})
//  - title: tiêu đề đầy đủ cho <title> (đã gồm tên trang)
//  - desc: meta description + og:description
//  - keywords: meta keywords (có thể để trống)
//  - canonical: URL tuyệt đối của trang
//  - body: HTML nội dung trong <main>
//  - extraHead: HTML thêm vào <head> (nếu cần)
//  - navActive: 'home' | 'cong-cu' | 'giao-vien' | 'sinh-vien' | 'huong-dan' | 'diem-bao' | '' — tô sáng mục nav tương ứng
//    (MẪU 3, 19/11/2026: chỉ 5 mục menu — Công cụ · Giáo viên · Sinh viên ·
//    Bài viết · Điểm báo. Trang chủ không có mục riêng trong menu; các trang
//    Code mẫu / Ủng hộ / Liên hệ / Giới thiệu / chính sách nằm ở footer,
//    navActive = ''.)
//  - noscriptLinks: HTML danh sách link công cụ cho khối <noscript> (build.mjs sinh;
//    để trống thì chỉ hiện thông báo, không có danh sách)
//  - needsQR: true thì nạp thêm /assets/vendor/qrcode-generator.js — chỉ trang
//    VietQR/WiFi QR và trang Ủng hộ cần (các trang khác không nạp, tiết kiệm ~57 KB)
//  - vendorScripts: mảng tên file thư viện trong /assets/vendor/ cần nạp riêng
//    cho trang này (Ví dụ: ['pdf-lib.min.js']) — mở rộng chung của mẫu needsQR:
//    mỗi trang công cụ chỉ nạp đúng thư viện nó dùng, trang chủ không nặng thêm.
//    File phải có trong src/vendor/ và được build.mjs copy sang dist/
//    (xem TOOL_VENDOR_SCRIPTS trong build.mjs).
// Không dùng CDN/font/thư viện ngoài: CSS + JS đều là file nội bộ trong /assets/.
// Ngân sách hiệu năng (worker W11): 1 CSS (style.css đã gộp effects.css) + 1 JS
// (app.js đã gộp mascot.js) trên mọi trang; trang từng công cụ nạp thêm
// tool-state.js (lưu trạng thái qua URL + nút Đặt lại); QR chỉ nạp khi needsQR.

const SITE_NAME = 'Tiện Ích Hub';

// Favicon là FILE thật (src/logo/) — Google Search không đọc được favicon
// dạng data URI nên trước đây kết quả tìm kiếm chỉ hiện quả cầu mặc định.
// build.mjs copy các file này ra dist (gốc + assets/).
const FAVICON_LINKS = `<link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
const OG_IMAGE = 'https://tienichhub.io.vn/assets/og-image.png';

// Script chống nháy giao diện tối: chạy trước CSS, đọc lựa chọn đã lưu.
const THEME_BOOT = `<script>try{var t=localStorage.getItem('uh-theme');if(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}</script>`;

// 5 mục menu chính (MẪU 3) — dùng chung cho nav header (máy tính) và
// thanh đáy (điện thoại). Icon SVG nét 22px, stroke currentColor.
const NAV_ITEMS = [
  {
    key: 'cong-cu', href: '/cong-cu/', label: 'Công cụ',
    icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  },
  {
    key: 'giao-vien', href: '/giao-vien/', label: 'Giáo viên',
    icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 9h6"/><path d="M7 12.5h4"/><path d="M12 16v4"/><path d="M8 20h8"/>',
  },
  {
    key: 'sinh-vien', href: '/sinh-vien/', label: 'Sinh viên',
    icon: '<path d="M12 4 2 8.5 12 13l10-4.5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/>',
  },
  {
    key: 'huong-dan', href: '/huong-dan/', label: 'Bài viết',
    icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
  },
  {
    key: 'diem-bao', href: '/diem-bao/', label: 'Điểm báo',
    icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h6M7 12h10M7 16h7"/>',
  },
];

export function shell({ title, desc, keywords = '', canonical, body, extraHead = '', navActive = '', noscriptLinks = '', needsQR = false, vendorScripts = [], hideChat = false, hideChrome = false, themeColor = '#0033FF' }) {
  const active = (key) => (navActive === key ? 'nav-active' : '');
  const keywordsMeta = keywords ? `\n  <meta name="keywords" content="${keywords}">` : '';
  const qrScript = needsQR ? '\n  <script src="/assets/vendor/qrcode-generator.js" defer></script>' : '';
  // Thư viện vendor riêng theo trang (Ví dụ: pdf.js/pdf-lib chỉ cho trang PDF) —
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
  // Trang ứng dụng toàn màn hình (Bàn giáo viên, MẪU 1): không có
  // header/footer/thanh đáy của site — trang tự có thanh trên riêng.
  // Mặc định các trang khác vẫn có đủ khung site.
  // Header MẪU 3 (19/11/2026): logo + tên, 5 mục menu, nút sáng/tối.
  // Không còn nút Tìm kiếm (⌘K vẫn mở modal tìm kiếm bằng bàn phím),
  // không nút âm thanh (âm thanh lớp học nằm trong Bàn giáo viên),
  // không nút "Dùng ngay", không menu hamburger — điện thoại dùng
  // thanh đáy 5 mục.
  const headerNav = NAV_ITEMS.map((item) => `<a href="${item.href}" class="${active(item.key)}">${item.label}</a>`).join('\n        ');
  const siteHeader = hideChrome ? '' : `
  <header class="site-header" id="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/" aria-label="Tiện Ích Hub — trang chủ"><span class="brand-logo-wrap"><img class="brand-logo" src="/favicon.svg" alt="" width="30" height="30"><span class="brand-dot" aria-hidden="true"></span></span><span class="brand-name">Tiện Ích <span>Hub</span></span></a>
      <nav class="site-nav" id="site-nav" aria-label="Điều hướng chính">
        ${headerNav}
      </nav>
      <div class="header-actions">
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Đổi giao diện sáng/tối">🌙</button>
      </div>
    </div>
  </header>`;
  // Footer MẪU 3: 3 cột gọn — mô tả 1 câu; Khác; Chính sách.
  const bottomNav = NAV_ITEMS.map((item) => `<a href="${item.href}" class="${navActive === item.key ? 'bottom-nav-active' : ''}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${item.icon}</svg><span>${item.label}</span></a>`).join('\n    ');
  const siteFooter = hideChrome ? '' : `
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <div class="footer-cols">
        <div class="footer-col footer-brand-col">
          <p class="footer-brand">${SITE_NAME}</p>
          <p class="muted">133 công cụ tính toán miễn phí cho người Việt — chạy ngay trên trình duyệt, không cần đăng ký.</p>
        </div>
        <div class="footer-col">
          <h3>Khác</h3>
          <a href="/gioi-thieu/">Giới thiệu</a>
          <a href="/code-mau/">Code mẫu</a>
          <a href="/ung-ho/">Ủng hộ</a>
          <a href="/lien-he/">Liên hệ</a>
        </div>
        <div class="footer-col">
          <h3>Chính sách</h3>
          <a href="/dieu-khoan/">Điều khoản sử dụng</a>
          <a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a>
        </div>
      </div>
      <p class="muted small footer-copy">© 2026 ${SITE_NAME} — Ngô Minh Tuấn. Mọi tính toán trong công cụ chạy trên trình duyệt và không gửi dữ liệu của bạn lên máy chủ.</p>
    </div>
  </footer>
  <nav class="bottom-nav" aria-label="Điều hướng dưới cùng">
    ${bottomNav}
  </nav>`;
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
  <meta name="theme-color" content="${themeColor}">
  ${FAVICON_LINKS}
  ${THEME_BOOT}
  <link rel="stylesheet" href="/assets/style.css">${qrScript}${vendorTags}
  <script src="/assets/app.js" defer></script>
  ${extraHead}
</head>
<body>
  <a class="skip-link" href="#main-content">Bỏ qua tới nội dung chính</a>${siteHeader}
${noscriptBlock}

  <main class="wrap main" id="main-content">
${body}
  </main>
${siteFooter}
${chatWidget}
  <!-- Cloudflare Web Analytics: ĐÃ BẬT (18/11/2026, site tienichhub.io.vn).
       (Chính sách bảo mật mục 11 đã mô tả dịch vụ này: không cookie, không thu thập
       thông tin nhận dạng cá nhân.)
       Tách lượt kiểm thử nội bộ (19/11/2026): chỉ nạp beacon khi trình duyệt
       KHÔNG có cờ uh_internal=1 trong localStorage. Đặt cờ trên trình duyệt
       kiểm thử bằng cách mở console gõ: localStorage.setItem('uh_internal','1')
       — lượt xem từ trình duyệt đó không được tính vào báo cáo. -->
  <!-- Cloudflare Web Analytics --><script>(function(){try{if(localStorage.getItem('uh_internal')==='1')return;}catch(e){}var s=document.createElement('script');s.type='module';s.src='https://static.cloudflareinsights.com/beacon.min.js';s.setAttribute('data-cf-beacon','{"token": "dd0aac1b776f42ec95763e59e4913fc9"}');document.head.appendChild(s);})();</script><!-- End Cloudflare Web Analytics -->
</body>
</html>
`;
}
