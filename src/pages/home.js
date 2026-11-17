// Trang chủ — KHÔI PHỤC BỐ CỤC TRƯỚC ĐỢT 1 (Tuấn yêu cầu 18/11, thấy bản
// cũ đẹp hơn bản wave 1), phủ giao diện mới kiểu web nước ngoài
// (iLovePDF + TinyWow + Product Hunt).
// Thứ tự: hero (tìm kiếm) + BẢNG XẾP HẠNG nằm trong vùng hero ở đầu trang
// → dải dữ liệu hôm nay (crypto, vàng, tỉ giá, xổ số, lịch âm, tử vi) →
// Điểm báo (mục chính) → lưới đủ 101 công cụ → banner Ủng hộ.
// KHÔNG còn khối "Hôm nay" riêng, hàng "công cụ hay dùng" riêng, thẻ hạng
// mục riêng như wave 1 (thẻ hạng mục đặc màu chuyển sang trang /cong-cu/).
// SSR (worker W11): Điểm báo (tin nổi bật + cụm tin theo chủ đề) và bảng
// xếp hạng (top 6 repo GitHub + tin hot) được render SẴN trong HTML lúc
// build từ src/data/news.json + src/data/trending.json (build.mjs truyền
// qua ctx.news / ctx.trending), kèm data-updated-at. app.js lúc tải trang
// fetch JSON và CHỈ render lại nếu JSON mới hơn SSR; nếu fetch lỗi thì giữ
// SSR + hiện nút thử lại. Các dải dữ liệu do app.js điền lúc chạy, khung
// tải có skeleton (xám mờ) thay bằng nội dung khi tải xong.
// Lưới công cụ render sẵn lúc build từ danh sách build.mjs quét được.
import { toolCard, esc } from '../tool-card.js';
import { CATEGORIES } from '../categories.js';

// Dải dữ liệu hôm nay: nhãn + vùng dữ liệu (app.js điền lúc chạy) + link
// chi tiết. id crypto-strip / gold-content… giữ nguyên như trước, chỉ đặt
// vào trong dải; app.js không cần sửa.
// Khung tải có 2 thanh skeleton xám mờ; app.js thay toàn bộ innerHTML khi
// dữ liệu về nên skeleton tự biến mất, không cần sửa hàm dữ liệu.
// extraHtml (tùy chọn): HTML thêm giữa vùng dữ liệu và link chi tiết —
// dùng cho dòng Fear & Greed trong dải Crypto (nằm NGOÀI #crypto-strip
// nên initCrypto thay innerHTML không xóa được).
function stripCard(label, contentId, loadingText, detailHref, detailText, extraHtml) {
  return `<article class="strip-card">
  <h3 class="strip-label">${esc(label)}</h3>
  <div class="strip-body" id="${contentId}"><div class="skeleton skeleton-value" aria-hidden="true"></div><div class="skeleton skeleton-line" aria-hidden="true"></div><p class="muted">${esc(loadingText)}</p></div>
  ${extraHtml || ''}
  <p class="strip-link"><a href="${esc(detailHref)}">${esc(detailText)}</a></p>
</article>`;
}

// ---------------------------------------------------------------------------
// SSR Điểm báo + bảng xếp hạng — bản sao lúc build của logic render trong
// src/app.js (initNewsAndHot/initTrending): cùng markup, cùng quy tắc
// (tin nổi bật = tin AI đầu tiên; mỗi nhóm tối đa 6 tin; tin hot = 6 tin
// mới nhất mọi nhóm; repo = top 6). Giữ hai bên đồng bộ khi sửa một bên.
// ---------------------------------------------------------------------------
const NEWS_GROUPS = [
  { id: 'ai', label: 'AI' },
  { id: 'chung-khoan', label: 'Chứng khoán' },
  { id: 'crypto', label: 'Crypto' },
];
const NEWS_PER_GROUP = 6;
const HOT_COUNT = 6;

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
    esc(item.title || '(không có tiêu đề)') + '</a></h4>' +
    (summary ? '<p class="news-summary">' + esc(summary) + '</p>' : '') +
    (item.why ? '<p class="news-why">' + esc(item.why) + '</p>' : '') +
    (meta ? '<p class="news-meta">' + esc(meta) + '</p>' : '') +
    '</article>';
}

function newsFeaturedHtml(item) {
  const summary = truncateSummary(item.summary);
  const date = newsItemDate(item);
  const meta = [item.source || '', date ? formatDate(date) : ''].filter(Boolean).join(' · ');
  return '<article class="news-card news-featured">' +
    '<p class="news-featured-tag">Tin nổi bật</p>' +
    '<h3><a href="' + esc(newsItemUrl(item)) + '" target="_blank" rel="noopener">' +
    esc(item.title || '(không có tiêu đề)') + '</a></h3>' +
    (summary ? '<p class="news-summary">' + esc(summary) + '</p>' : '') +
    (item.why ? '<p class="news-why">' + esc(item.why) + '</p>' : '') +
    (meta ? '<p class="news-meta">' + esc(meta) + '</p>' : '') +
    '</article>';
}

function hotRowHtml(item, i) {
  const date = newsItemDate(item);
  const meta = [item.source || '', date ? formatDate(date) : ''].filter(Boolean).join(' · ');
  return '<div class="rank-row rank-' + (i + 1) + '">' +
    '<div class="rank-num">' + (i + 1) + '</div>' +
    '<div class="rank-body"><h4><a href="' + esc(newsItemUrl(item)) +
    '" target="_blank" rel="noopener">' + esc(item.title || '') + '</a></h4>' +
    (meta ? '<p class="rank-meta">' + esc(meta) + '</p>' : '') +
    '</div></div>';
}

// Hàng xếp hạng GitHub kiểu Product Hunt: số thứ hạng lớn + tên + mô tả +
// meta, nút pill ★ số sao ở cuối hàng bên phải (điểm xếp hạng trực quan).
// Số sao CHỈ hiện trong pill (không lặp lại trong meta).
function trendingRowHtml(item, i) {
  const rank = i + 1;
  const name = item.fullName || item.name || '';
  const desc = item.desc || item.description || '';
  const meta = [];
  if (item.language) meta.push(item.language);
  if (item.forks != null) meta.push('Fork ' + Number(item.forks).toLocaleString('en-US'));
  const starsPill = item.stars != null
    ? '<span class="rank-pill">★ ' + Number(item.stars).toLocaleString('en-US') + '</span>' : '';
  return '<div class="rank-row rank-' + rank + '">' +
    '<div class="rank-num">' + rank + '</div>' +
    '<div class="rank-body"><h4><a href="' + esc(item.url || '#') +
    '" target="_blank" rel="noopener">' + esc(name) + '</a>' +
    (rank === 1 ? '<span class="hot-chip">Hot</span>' : '') + '</h4>' +
    (desc ? '<p class="rank-desc">' + esc(desc) + '</p>' : '') +
    (meta.length ? '<p class="rank-meta">' + esc(meta.join(' · ')) + '</p>' : '') +
    '</div>' + starsPill + '</div>';
}

export function body({ tools = [], categories = [], news = null, trending = null } = {}) {
  const cats = categories.length ? categories : CATEGORIES;

  // Lưới đầy đủ 101 công cụ + chip lọc riêng cho trang chủ.
  const homeChips = [`<button type="button" class="chip chip-active" data-home-filter="all" aria-pressed="true">Tất cả</button>`]
    .concat(cats.map((c) => `<button type="button" class="chip" data-home-filter="${c.slug}" aria-pressed="false">${esc(c.label)}</button>`))
    .join('\n      ');
  const allGrid = tools.length
    ? `<div class="grid-3" id="home-tool-grid">
${tools.map((tool, i) => toolCard(tool, i)).join('\n')}
</div>
<p id="home-tool-empty" class="muted" hidden>Không tìm thấy công cụ nào trong hạng mục này.</p>`
    : `<p class="muted">Chưa có công cụ nào — đang cập nhật.</p>`;

  // (SSR) Điểm báo + bảng xếp hạng render sẵn từ JSON lúc build.
  // Mỗi khối có data-ssr="1" + data-updated-at để app.js so sánh với JSON
  // mới lúc tải trang; không có dữ liệu thì giữ khung tải như cũ.
  const newsGroups = normalizeNewsGroups(news);
  const allNewsItems = [];
  newsGroups.forEach((g) => g.items.forEach((it) => allNewsItems.push(it)));
  const newsUpdatedAt = (news && news.updatedAt) || '';
  const newsAttrs = newsUpdatedAt
    ? ` data-ssr="1" data-updated-at="${esc(newsUpdatedAt)}"` : '';
  const aiGroup = newsGroups.find((g) => g.id === 'ai');
  const featuredItem = (aiGroup && aiGroup.items[0]) || allNewsItems[0];
  const featuredHtml = featuredItem
    ? newsFeaturedHtml(featuredItem)
    : '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';
  const groupsHtml = allNewsItems.length === 0
    ? '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>'
    : NEWS_GROUPS.map((def, idx) => {
        const g = newsGroups.find((x) => x.id === def.id);
        const items = g ? g.items.slice(0, NEWS_PER_GROUP) : [];
        return '<div class="tab-panel" data-tab-panel="news-' + def.id + '"' +
          (idx === 0 ? '' : ' hidden') + '>' +
          (items.length
            ? items.map(newsCardHtml).join('')
            : '<p class="muted">Chưa có tin ' + esc(def.label) + '.</p>') +
          '</div>';
      }).join('');
  const hotItems = allNewsItems.slice().sort((a, b) => {
    const da = newsItemDate(a), db = newsItemDate(b);
    return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
  }).slice(0, HOT_COUNT);
  const hotHtml = hotItems.length
    ? hotItems.map(hotRowHtml).join('')
    : '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';

  const trendingItems = (trending && Array.isArray(trending.items)) ? trending.items : [];
  const trendingUpdatedAt = (trending && trending.updatedAt) || '';
  const trendingAttrs = trendingUpdatedAt
    ? ` data-ssr="1" data-updated-at="${esc(trendingUpdatedAt)}"` : '';
  const githubHtml = trendingItems.length
    ? trendingItems.slice(0, 6).map(trendingRowHtml).join('')
    : '<p class="muted">Chưa có dữ liệu — dữ liệu làm mới hằng ngày.</p>';

  return `
  <section class="hero">
    <h1>Tiện Ích Hub</h1>
    <p class="hero-sub">${tools.length} công cụ miễn phí, dùng ngay không cần đăng ký.</p>
    <div class="hero-search-wrap">
      <label class="small muted" for="hero-search">Tìm công cụ</label>
      <input type="search" id="hero-search" class="hero-search" placeholder="Tìm công cụ… ví dụ: tính lương net" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="hero-search-results">
      <div id="hero-search-results" class="hero-search-results" role="listbox" hidden></div>
    </div>
    <div class="hero-chips" aria-label="Từ khóa gợi ý">
      <a class="chip" href="/cong-cu/luong-gross-net/">Tính lương net</a>
      <a class="chip" href="/cong-cu/tien-dien-bac-thang/">Tiền điện</a>
      <a class="chip" href="/cong-cu/vietqr-wifi-qr/">VietQR</a>
      <a class="chip" href="/cong-cu/lich-am/">Lịch âm</a>
    </div>
    <div data-mascot="hero" aria-hidden="true"></div>
    <div class="hero-ranking" id="ranking" aria-label="Bảng xếp hạng">
      <h2>Bảng xếp hạng</h2>
      <div class="tabs" role="tablist">
        <button type="button" class="tab tab-active" data-tab-target="rank-github" role="tab">Xu hướng GitHub</button>
        <button type="button" class="tab" data-tab-target="rank-hot" role="tab">Tin hot</button>
      </div>
      <div class="tab-panel" data-tab-panel="rank-github" id="rank-github"${trendingItems.length ? trendingAttrs : ''}>${trendingItems.length ? githubHtml : '<p class="muted">Đang tải…</p>'}</div>
      <div class="tab-panel" data-tab-panel="rank-hot" id="rank-hot"${allNewsItems.length ? newsAttrs : ''} hidden>${allNewsItems.length ? hotHtml : '<p class="muted">Đang tải…</p>'}</div>
    </div>
  </section>

  <section class="section section-strips" aria-label="Dữ liệu hôm nay">
    <p class="strip-date muted" id="hom-nay-title">Hôm nay</p>
    <div class="strip-grid">
      ${stripCard('Crypto — Bitcoin', 'crypto-strip', 'Đang tải giá…', '/cong-cu/?cat=hang-ngay', 'Xem công cụ →', '<p class="muted small strip-fng" id="fng-line" hidden></p>')}
      ${stripCard('Giá vàng SJC', 'gold-content', 'Đang tải giá vàng…', '/cong-cu/gia-vang-ty-gia/', 'Xem chi tiết →')}
      ${stripCard('Tỉ giá USD', 'fx-content', 'Đang tải tỉ giá…', '/cong-cu/gia-vang-ty-gia/', 'Xem chi tiết →')}
      ${stripCard('Xổ số miền Bắc', 'lottery-content', 'Đang tải kết quả…', '/cong-cu/ket-qua-xo-so/', 'Xem chi tiết →')}
      ${stripCard('Lịch âm', 'lunar-content', 'Đang tính lịch âm…', '/cong-cu/lich-am/', 'Xem chi tiết →')}
      ${stripCard('Tử vi hôm nay', 'horoscope-content', 'Đang tính tử vi…', '/cong-cu/tu-vi-12-con-giap/', 'Xem chi tiết →')}
    </div>
  </section>

  <section class="section" id="diem-bao" aria-label="Điểm báo">
    <h2>Điểm báo</h2>
    <p class="note">Tin tóm tắt tham khảo, không phải lời khuyên đầu tư.</p>
    <div id="news-featured"${allNewsItems.length ? newsAttrs : ''}>${allNewsItems.length ? featuredHtml : '<p class="muted">Đang tải tin…</p>'}</div>
    <div class="tabs" role="tablist" aria-label="Lọc tin theo chủ đề">
      <button type="button" class="tab tab-active" data-tab-target="news-ai" role="tab">AI</button>
      <button type="button" class="tab" data-tab-target="news-chung-khoan" role="tab">Chứng khoán</button>
      <button type="button" class="tab" data-tab-target="news-crypto" role="tab">Crypto</button>
    </div>
    <div id="news-groups"${allNewsItems.length ? newsAttrs : ''}>${allNewsItems.length ? groupsHtml : '<p class="muted">Đang tải tin…</p>'}</div>
  </section>

  <section class="section" aria-label="Tất cả công cụ">
    <h2>Tất cả công cụ</h2>
    <p class="muted" id="home-tool-count">${tools.length} công cụ — miễn phí, chạy ngay trên trình duyệt, không cần đăng nhập.</p>
    <div class="chip-row" role="group" aria-label="Lọc theo hạng mục">
      ${homeChips}
    </div>
    ${allGrid}
  </section>

  <section class="support-banner" aria-label="Ủng hộ trang web">
    <p><strong>Trang này miễn phí và không có quảng cáo.</strong> Nếu thấy hữu ích, bạn có thể ủng hộ để duy trì tên miền và hosting.</p>
    <a class="btn" href="/ung-ho/">Ủng hộ</a>
  </section>`;
}
