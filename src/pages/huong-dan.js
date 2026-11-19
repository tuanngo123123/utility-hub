// Trang Bài viết (/huong-dan/ + /huong-dan/<slug>/): bài viết gốc do
// Tiện Ích Hub tự viết — hướng dẫn cách tính, cách làm gắn với công cụ
// trên web (18/11/2026). Tên hiển thị đổi từ "Hướng dẫn" thành "Bài
// viết" đợt menu MẪU 3/4 (19/11); địa chỉ /huong-dan/ GIỮ NGUYÊN.
// Dữ liệu trong huong-dan-data.js (chỉ chạy lúc build, không fetch lúc
// chạy). Bố cục bài theo mẫu trang mẫu sinh viên
// (sinh-vien.js + class .sv-doc, max-width ~72ch); thẻ bài dùng chung
// .sv-grid/.sv-card để đồng bộ giao diện với mục Sinh viên.
// Bài có công cụ liên quan (11 bài trong GUIDE_LINKS ở build.mjs) thì
// nhúng công cụ ở đầu bài qua embedHtml (build sinh sẵn); bài không có
// công cụ liên quan (phạt nguội, CV) thì embedHtml rỗng.
import { esc } from '../tool-card.js';
import { ARTICLES } from './huong-dan-data.js';

function articleCard(a) {
  return `<article class="sv-card">
  <h3 class="card-title"><a href="/huong-dan/${esc(a.slug)}/">${esc(a.title)}</a></h3>
  <p class="card-desc">${esc(a.desc)}</p>
  <p class="sv-cond">Ngày đăng: ${esc(a.date)}</p>
  <p class="sv-cta"><a class="btn btn-ghost" href="/huong-dan/${esc(a.slug)}/">Đọc bài →</a></p>
</article>`;
}

// Trang mục /huong-dan/: liệt kê tất cả bài.
export function body({ articles = ARTICLES } = {}) {
  return `
  <header class="tool-page-head">
    <h1>Bài viết</h1>
    <p class="muted">Cách tính lương, thuế TNCN, lãi vay, lãi tiết kiệm, tiền điện, tiền nước, lương tăng ca, lương hưu, lương tháng 13 và thưởng Tết, BHXH một lần, lệ phí môn bài, tra cứu phạt nguội và cách viết CV — viết ngắn gọn, số liệu theo quy định hiện hành, kèm công cụ tính ngay. Tất cả bài do Tiện Ích Hub tự viết.</p>
  </header>

  <section class="section" aria-label="Tất cả bài viết">
    <div class="sv-grid">
${articles.map(articleCard).join('\n')}
    </div>
  </section>`;
}

// Trang bài /huong-dan/<slug>/: công cụ nhúng ở đầu bài (nếu có) +
// nội dung + hộp CTA tới công cụ/mẫu liên quan + nguồn văn bản +
// ngày đăng + bài khác.
export function detailBody({ article, articles = ARTICLES, embedHtml = '' } = {}) {
  const others = articles.filter((a) => a.slug !== article.slug);
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
  ${others.length ? `<section class="tool-related sv-related"><h2>Bài khác</h2><div class="sv-grid">${others.map(articleCard).join('\n')}</div></section>` : ''}`;
}
