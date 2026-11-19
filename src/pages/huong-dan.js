// Trang Bài viết (/huong-dan/ + /huong-dan/<slug>/): bài viết gốc do
// Tiện Ích Hub tự viết — hướng dẫn cách tính, cách làm gắn với công cụ
// trên web (18/11/2026). Tên hiển thị đổi từ "Hướng dẫn" thành "Bài
// viết" đợt menu MẪU 3/4 (19/11); địa chỉ /huong-dan/ GIỮ NGUYÊN.
// Dữ liệu trong huong-dan-data.js (chỉ chạy lúc build, không fetch lúc
// chạy). Bố cục bài theo mẫu trang mẫu sinh viên
// (sinh-vien.js + class .sv-doc, max-width ~72ch).
// Làm lại trang mục đợt V2 (19/11): chip nhóm chủ đề lọc lúc chạy
// (script nhỏ cuối body), thẻ bài CẢ THẺ bấm được (bỏ nút "Đọc bài →"),
// bài mới nhất lên đầu, bài có ngày đăng mới nhất gắn nhãn "Mới".
// Bài có công cụ liên quan (12 bài trong GUIDE_LINKS ở build.mjs) thì
// nhúng công cụ ở đầu bài qua embedHtml (build sinh sẵn); bài không có
// công cụ liên quan (phạt nguội, CV) thì embedHtml rỗng.
import { esc } from '../tool-card.js';
import { ARTICLES } from './huong-dan-data.js';

// Nhóm chủ đề của từng bài (theo slug). Bài mới thêm vào sau mà chưa
// có trong bảng này thì chỉ hiện ở chip "Tất cả".
const TOPICS = {
  'cach-tinh-luong-gross-net-2026': 'luong-thue',
  'cach-tinh-thue-thu-nhap-ca-nhan-2026': 'luong-thue',
  'cach-tinh-luong-tang-ca-2026': 'luong-thue',
  'luong-thang-13-thuong-tet-2027': 'luong-thue',
  'quyet-toan-thue-tncn-2026': 'luong-thue',
  'le-phi-mon-bai-2026-ho-kinh-doanh-duoc-mien': 'luong-thue',
  'cach-tinh-bhxh-mot-lan-2026': 'bao-hiem',
  'cach-tinh-luong-huu-bhxh-2026': 'bao-hiem',
  'cach-tinh-tien-dien-bac-thang-2026': 'dien-nuoc',
  'cach-tinh-tien-nuoc-bac-thang-2026': 'dien-nuoc',
  'cach-tinh-lai-vay-tra-gop-du-no-giam-dan': 'vay-tiet-kiem',
  'cach-tinh-lai-suat-tiet-kiem-ngan-hang': 'vay-tiet-kiem',
  'cach-tra-cuu-phat-nguoi-2026': 'giay-to-giao-thong',
  'cach-viet-cv-sinh-vien-moi-ra-truong': 'sinh-vien',
};

const TOPIC_LABELS = {
  'luong-thue': 'Lương & thuế',
  'bao-hiem': 'Bảo hiểm',
  'dien-nuoc': 'Điện nước',
  'vay-tiet-kiem': 'Vay & tiết kiệm',
  'giay-to-giao-thong': 'Giấy tờ & giao thông',
  'sinh-vien': 'Sinh viên',
};

// Ngày đăng dạng DD/MM/YYYY → số để so sánh (YYYYMMDD).
function dateKey(d) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d || '');
  if (!m) return 0;
  return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
}

// Bài mới nhất lên đầu (ngày đăng giảm dần; cùng ngày giữ thứ tự gốc).
function sortedArticles(articles) {
  return articles.slice().sort((a, b) => dateKey(b.date) - dateKey(a.date));
}

function articleCard(a, isNew) {
  const topic = TOPICS[a.slug] || '';
  const label = TOPIC_LABELS[topic] || '';
  return `<a class="hd-card" href="/huong-dan/${esc(a.slug)}/" data-hd-topic="${esc(topic)}" aria-label="Đọc bài ${esc(a.title)}">
  <span class="hd-card-top">${label ? `<span class="chip hd-topic">${esc(label)}</span>` : ''}${isNew ? '<span class="hd-new">Mới</span>' : ''}</span>
  <span class="hd-card-title">${esc(a.title)}</span>
  <span class="hd-card-desc">${esc(a.desc)}</span>
  <span class="hd-card-date">Ngày đăng: ${esc(a.date)}</span>
</a>`;
}

// Trang mục /huong-dan/: chip chủ đề + tất cả bài, mới nhất lên đầu.
export function body({ articles = ARTICLES } = {}) {
  const sorted = sortedArticles(articles);
  const newest = sorted.length ? dateKey(sorted[0].date) : 0;
  const counts = {};
  sorted.forEach((a) => {
    const t = TOPICS[a.slug];
    if (t) counts[t] = (counts[t] || 0) + 1;
  });
  const chips = [`<button type="button" class="hd-chip" data-hd-chip="all" aria-pressed="true">Tất cả · ${sorted.length}</button>`]
    .concat(Object.keys(TOPIC_LABELS).map((k) => `<button type="button" class="hd-chip" data-hd-chip="${k}" aria-pressed="false">${esc(TOPIC_LABELS[k])} · ${counts[k] || 0}</button>`))
    .join('\n      ');
  return `
  <header class="tool-page-head">
    <h1>Bài viết</h1>
    <p class="muted">Cách tính lương, thuế, lãi vay, tiền điện, tiền nước — ngắn gọn, kèm công cụ tính ngay.</p>
  </header>

  <section class="section" aria-label="Tất cả bài viết">
    <div class="hd-chips" role="group" aria-label="Lọc theo chủ đề">
      ${chips}
    </div>
    <div class="cat-rows hd-rows">
${sorted.map((a) => `      ${articleCard(a, dateKey(a.date) === newest)}`).join('\n')}
    </div>
  </section>
  <script>
  (function () {
    var chips = document.querySelectorAll('[data-hd-chip]');
    var cards = document.querySelectorAll('[data-hd-topic]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var t = chip.getAttribute('data-hd-chip');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        cards.forEach(function (card) {
          card.style.display = (t === 'all' || card.getAttribute('data-hd-topic') === t) ? '' : 'none';
        });
      });
    });
  })();
  </script>`;
}

// Trang bài /huong-dan/<slug>/: công cụ nhúng ở đầu bài (nếu có) +
// nội dung + hộp CTA tới công cụ/mẫu liên quan + nguồn văn bản +
// ngày đăng + bài khác.
export function detailBody({ article, articles = ARTICLES, embedHtml = '' } = {}) {
  const sorted = sortedArticles(articles);
  const newest = sorted.length ? dateKey(sorted[0].date) : 0;
  const others = sorted.filter((a) => a.slug !== article.slug);
  return `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/huong-dan/">← Mục bài viết</a></nav>
  <header class="tool-page-head">
    <h1>${esc(article.title)}</h1>
    <p class="muted">${esc(article.desc)}</p>
    <p class="muted small">Ngày đăng: ${esc(article.date)}</p>
  </header>
  ${embedHtml}
  <div class="sv-doc">
${article.body}
  </div>
  <aside class="hd-cta" aria-label="Dùng công cụ liên quan">
    <p>${esc(article.cta.text)}</p>
    <p><a class="btn btn-primary" href="${esc(article.cta.url)}">${esc(article.cta.label)}</a></p>
  </aside>
  <p class="muted small hd-source">Nguồn: ${esc(article.sources)} Số liệu theo quy định hiện hành tại thời điểm viết. Nội dung chỉ mang tính tham khảo.</p>
  ${others.length ? `<section class="tool-related sv-related"><h2>Bài khác</h2><div class="cat-rows hd-rows">${others.map((a) => articleCard(a, dateKey(a.date) === newest)).join('\n')}</div></section>` : ''}`;
}
