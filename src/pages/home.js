// Trang chủ — MẪU 3 (19/11/2026).
// Thứ tự: hero (H1 + 1 dòng phụ + ô tìm kiếm + 6 chip từ khóa hot)
// → Dùng gần đây (đọc localStorage uh_visited_tools, trống thì ẩn)
// → Được dùng nhiều nhất (8 thẻ đều nhau) → Dành cho bạn (4 ô lớn)
// → Hôm nay (4 ô nhỏ: vàng, USD, âm lịch, xổ số) → Điểm báo (3 tin).
// Đã bỏ: chữ chạy trong H1, mascot giọt nước, nút "Chọn công cụ, dùng
// ngay", rail video, hàng mục nổi bật, dải crypto/tử vi, lưới đủ 133
// công cụ, Tin hot, banner Ủng hộ, khối Xu hướng GitHub (đã gỡ 19/11).
// SSR (worker W11): Điểm báo render SẴN trong HTML lúc build từ
// src/data/news.json (build.mjs truyền qua ctx.news), kèm
// data-updated-at. app.js lúc tải trang fetch JSON và CHỈ render lại
// nếu JSON mới hơn SSR; nếu fetch lỗi thì giữ SSR. Các ô "Hôm nay" do
// app.js điền lúc chạy, khung tải có skeleton (xám mờ) thay bằng nội
// dung khi tải xong.
import { esc } from '../tool-card.js';
import { iconSvg } from '../icons.js';

// "Được dùng nhiều nhất" — THỨ TỰ MẶC ĐỊNH, chưa phải số liệu thật.
// Báo cáo tuần 17–19/11/2026 (bao-cao-tuan.json): 91 lượt thăm, phần
// lớn là lượt tự kiểm thử của đội làm web, chưa đủ tin để xếp hạng
// công cụ theo lượt dùng thật. Khi có số liệu thật (Cloudflare +
// tách lượt nội bộ bằng cờ uh_internal), thay danh sách này bằng
// top 8 theo lượt dùng và xóa ghi chú này. Đừng bịa số lượt dùng.
const MOST_USED_SLUGS = [
  'luong-gross-net',
  'tien-dien-bac-thang',
  'vietqr-wifi-qr',
  'lich-am',
  'bhxh-mot-lan',
  'lai-vay',
  'doi-dia-chi-cu-moi',
  'thue-thu-nhap-ca-nhan',
];

// 6 từ khóa hot trong hero (link thẳng tới công cụ). File mẫu ghi
// "Ảnh thẻ 3×4" nhưng công cụ đó chưa có nên thay bằng Lương hưu.
const HOT_CHIPS = [
  { label: 'Lương net', href: '/cong-cu/luong-gross-net/' },
  { label: 'Tiền điện', href: '/cong-cu/tien-dien-bac-thang/' },
  { label: 'VietQR', href: '/cong-cu/vietqr-wifi-qr/' },
  { label: 'Lịch âm', href: '/cong-cu/lich-am/' },
  { label: 'BHXH một lần', href: '/cong-cu/bhxh-mot-lan/' },
  { label: 'Lương hưu', href: '/cong-cu/luong-huu/' },
];

// Icon SVG nét riêng cho từng thẻ "Được dùng nhiều nhất" (MẪU 3,
// Claude 19/11 ~22:35): không dùng icon hạng mục nữa — BHXH, lãi vay,
// thuế TNCN trước đây đều hiện túi tiền. Icon lấy từ bộ dùng chung
// src/icons.js (chung với cột tab Bàn giáo viên V2).
const MOST_USED_ICONS = {
  'luong-gross-net': 'banknote',
  'tien-dien-bac-thang': 'zap',
  'vietqr-wifi-qr': 'qr',
  'lich-am': 'moon',
  'bhxh-mot-lan': 'shield',
  'lai-vay': 'percent',
  'doi-dia-chi-cu-moi': 'map-pin',
  'thue-thu-nhap-ca-nhan': 'file-text',
};

// Mô tả NGẮN riêng cho thẻ (≤ 45 ký tự, Claude 19/11 ~22:35): viết
// lại thay vì cắt mô tả dài của trang công cụ (bị "…" ở dòng 2).
const MOST_USED_SHORT_DESC = {
  'luong-gross-net': 'Lương thực nhận sau bảo hiểm và thuế.',
  'tien-dien-bac-thang': 'Tiền điện theo bậc thang, có thuế VAT.',
  'vietqr-wifi-qr': 'Tạo mã QR chuyển khoản và WiFi.',
  'lich-am': 'Đổi dương lịch sang âm lịch, xem ngày tốt.',
  'bhxh-mot-lan': 'Rút BHXH một lần được bao nhiêu tiền?',
  'lai-vay': 'Trả góp hằng tháng hết bao nhiêu?',
  'doi-dia-chi-cu-moi': 'Đổi địa chỉ cũ sang phường/xã mới.',
  'thue-thu-nhap-ca-nhan': 'Thuế phải nộp mỗi tháng là bao nhiêu?',
};

// Ô "Hôm nay": nhãn + vùng dữ liệu (app.js điền lúc chạy) + link chi
// tiết. id gold-content / fx-content / lunar-content / lottery-content
// giữ nguyên như trước để app.js không cần đổi id — chỉ rút gọn nội
// dung app.js chèn vào cho vừa ô nhỏ (giá + nguồn/giờ, không thêm hộp
// mua/bán).
function todayCard(label, contentId, loadingText, detailHref, detailText) {
  return `<article class="today-card">
  <h3 class="today-label">${esc(label)}</h3>
  <div id="${contentId}"><div class="skeleton skeleton-value" aria-hidden="true"></div><p class="muted small">${esc(loadingText)}</p></div>
  <p class="today-link"><a href="${esc(detailHref)}">${esc(detailText)}</a></p>
</article>`;
}

// ---------------------------------------------------------------------------
// SSR Điểm báo — bản sao lúc build của logic render trong src/app.js
// (initHomeNews): cùng markup, cùng quy tắc (3 tin mới nhất mọi nhóm).
// Giữ hai bên đồng bộ khi sửa một bên.
// ---------------------------------------------------------------------------
const NEWS_GROUPS = [
  { id: 'ai', label: 'AI' },
  { id: 'chung-khoan', label: 'Chứng khoán' },
  { id: 'crypto', label: 'Crypto' },
];
const HOME_NEWS_COUNT = 3;

// news.json có thể ở 1 trong 2 dạng: groups là mảng [{id,label,items}] hoặc
// object {ai:[...], 'chung-khoan':[...], crypto:[...]}. Tin dùng `url` hoặc `link`.
function normalizeNewsGroups(data) {
  const groups = [];
  if (!data) return groups;
  if (Array.isArray(data.groups)) {
    data.groups.forEach((g) => {
      if (g && Array.isArray(g.items)) groups.push({ id: g.id, label: g.label || g.id, items: g.items });
    });
  } else if (data.groups && typeof data.groups === 'object') {
    NEWS_GROUPS.forEach((def) => {
      const items = data.groups[def.id];
      if (Array.isArray(items)) groups.push({ id: def.id, label: def.label, items });
    });
  }
  return groups;
}

function newsItemUrl(item) { return item.url || item.link || ''; }
// Tiêu đề hiển thị: ưu tiên tít tiếng Việt tự viết (titleVi), chưa có thì
// fallback về tiêu đề gốc tiếng Anh (đợt sửa UX 19/11).
function newsTitle(item) { return item.titleVi || item.title; }
function newsItemDate(item) {
  if (!item.publishedAt) return null;
  const d = new Date(item.publishedAt);
  return isNaN(d.getTime()) ? null : d;
}
function formatDate(d) {
  return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}
// Tóm tắt tối đa 260 ký tự.
function truncateSummary(s) {
  const t = String(s || '').trim();
  if (t.length <= 260) return t;
  return t.slice(0, 257) + '…';
}

function newsCardHtml(item) {
  const summary = truncateSummary(item.summary);
  const date = newsItemDate(item);
  const meta = [item.source || '', date ? formatDate(date) : ''].filter(Boolean).join(' · ');
  return '<article class="news-card">' +
    '<h4><a href="' + esc(newsItemUrl(item)) + '" target="_blank" rel="noopener">' +
    esc(newsTitle(item) || '(không có tiêu đề)') + '</a></h4>' +
    (summary ? '<p class="news-summary">' + esc(summary) + '</p>' : '') +
    (item.why ? '<p class="news-why">' + esc(item.why) + '</p>' : '') +
    (meta ? '<p class="news-meta">' + esc(meta) + '</p>' : '') +
    '</article>';
}

export function body({ tools = [], news = null } = {}) {
  // (SSR) Điểm báo: 3 tin mới nhất mọi nhóm, render sẵn từ JSON lúc build.
  // Khối có data-ssr="1" + data-updated-at để app.js so sánh với JSON mới
  // lúc tải trang; không có dữ liệu thì giữ khung tải như cũ.
  const newsGroups = normalizeNewsGroups(news);
  const allNewsItems = [];
  newsGroups.forEach((g) => g.items.forEach((it) => allNewsItems.push(it)));
  const newsUpdatedAt = (news && news.updatedAt) || '';
  const newsAttrs = newsUpdatedAt
    ? ` data-ssr="1" data-updated-at="${esc(newsUpdatedAt)}"` : '';
  const homeNewsItems = allNewsItems.slice().sort((a, b) => {
    const da = newsItemDate(a), db = newsItemDate(b);
    return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
  }).slice(0, HOME_NEWS_COUNT);
  const newsHtml = homeNewsItems.length
    ? homeNewsItems.map(newsCardHtml).join('')
    : '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';

  // Được dùng nhiều nhất: 8 thẻ (icon SVG riêng + tên đậm + mô tả ngắn).
  const mostUsedTools = MOST_USED_SLUGS
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter(Boolean);
  const mostUsedHtml = mostUsedTools.map((tool) => `
    <a class="most-used-card" href="/cong-cu/${esc(tool.slug)}/">
      <span class="most-used-icon" aria-hidden="true">${iconSvg(MOST_USED_ICONS[tool.slug] || 'banknote', 22, 2)}</span>
      <span class="most-used-body">
        <span class="most-used-name">${esc(tool.name)}</span>
        <span class="most-used-desc">${esc(MOST_USED_SHORT_DESC[tool.slug] || tool.desc || '')}</span>
      </span>
    </a>`).join('');

  const hotChipsHtml = HOT_CHIPS.map((c) =>
    `<a class="hero-chip" href="${esc(c.href)}">${esc(c.label)}</a>`).join('\n      ');

  return `
  <section class="hero">
    <div class="hero-inner">
    <h1>Công cụ tính toán miễn phí cho người Việt</h1>
    <p class="hero-sub">Tính lương, tiền điện, VietQR, lịch âm… tất cả chạy ngay trên trình duyệt, không cần đăng ký.</p>
    <div class="hero-search-wrap">
      <svg class="hero-search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input type="search" id="hero-search" class="hero-search" placeholder="Tìm công cụ… ví dụ: tính lương net" autocomplete="off" role="combobox" aria-label="Tìm công cụ" aria-expanded="false" aria-controls="hero-search-results">
      <div id="hero-search-results" class="hero-search-results" role="listbox" hidden></div>
    </div>
    <div class="hero-chips" aria-label="Từ khóa gợi ý">
      ${hotChipsHtml}
    </div>
    </div>
  </section>

  <section class="home-section" id="recent-tools" aria-label="Công cụ dùng gần đây" hidden>
    <div class="home-section-head">
      <h2>Dùng gần đây</h2>
      <button type="button" class="recent-clear" id="recent-clear">Xóa lịch sử</button>
    </div>
    <div class="recent-row" id="recent-grid"></div>
  </section>

  <section class="home-section" aria-label="Được dùng nhiều nhất">
    <div class="home-section-head">
      <h2>Được dùng nhiều nhất</h2>
      <a href="/cong-cu/">Xem tất cả ${tools.length} công cụ →</a>
    </div>
    <div class="most-used-grid">
${mostUsedHtml}
    </div>
  </section>

  <section class="home-section" aria-label="Dành cho bạn">
    <h2>Dành cho bạn</h2>
    <div class="audience-grid">
      <a class="audience-card audience-work" href="/cong-cu/?cat=van-phong">
        <h3>Người đi làm</h3>
        <p>Lương, thuế, bảo hiểm, chấm công, phép năm, PDF.</p>
        <span class="audience-link">Xem công cụ văn phòng →</span>
      </a>
      <a class="audience-card audience-teacher" href="/giao-vien/lop-hoc/">
        <h3>Giáo viên</h3>
        <p>Bàn giáo viên trên lớp + chấm điểm, trộn đề, nhận xét.</p>
        <span class="audience-link">Mở Bàn giáo viên →</span>
      </a>
      <a class="audience-card audience-student" href="/sinh-vien/">
        <h3>Sinh viên</h3>
        <p>GPA, quy đổi điểm, điểm xét tuyển, tài liệu học miễn phí.</p>
        <span class="audience-link">Xem góc sinh viên →</span>
      </a>
      <a class="audience-card audience-family" href="/cong-cu/?cat=doi-song">
        <h3>Gia đình</h3>
        <p>Tiền điện nước, vàng, đi chợ, du lịch, sức khỏe.</p>
        <span class="audience-link">Xem công cụ đời sống →</span>
      </a>
    </div>
  </section>

  <section class="home-section" aria-label="Hôm nay">
    <h2>Hôm nay</h2>
    <div class="today-grid">
      ${todayCard('Vàng SJC', 'gold-content', 'Đang tải giá vàng…', '/cong-cu/gia-vang-ty-gia/', 'Xem chi tiết →')}
      ${todayCard('USD', 'fx-content', 'Đang tải tỷ giá…', '/cong-cu/gia-vang-ty-gia/', 'Xem chi tiết →')}
      ${todayCard('Âm lịch', 'lunar-content', 'Đang tính lịch âm…', '/cong-cu/lich-am/', 'Xem chi tiết →')}
      ${todayCard('Xổ số miền Bắc', 'lottery-content', 'Đang tải kết quả…', '/cong-cu/ket-qua-xo-so/', 'Xem chi tiết →')}
    </div>
  </section>

  <section class="home-section" id="diem-bao" aria-label="Điểm báo">
    <div class="home-section-head">
      <h2>Điểm báo</h2>
      <a href="/diem-bao/">Xem thêm →</a>
    </div>
    <p class="muted small">Tin tóm tắt tham khảo, không phải lời khuyên đầu tư.</p>
    <div class="home-news-list" id="home-news-list"${allNewsItems.length ? newsAttrs : ''}>${allNewsItems.length ? newsHtml : '<p class="muted">Đang tải tin…</p>'}</div>
  </section>`;
}
