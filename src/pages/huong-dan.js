// Trang Hướng dẫn (/huong-dan/ + /huong-dan/<slug>/): bài viết gốc do
// Tiện Ích Hub tự viết — hướng dẫn cách tính, cách làm gắn với công cụ
// trên web (18/11/2026). Dữ liệu trong huong-dan-data.js (chỉ chạy lúc
// build, không fetch lúc chạy). Bố cục bài theo mẫu trang mẫu sinh viên
// (sinh-vien.js + class .sv-doc, max-width ~72ch); thẻ bài dùng chung
// .sv-grid/.sv-card để đồng bộ giao diện với mục Sinh viên.
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
    <h1>Hướng dẫn</h1>
    <p class="muted">Cách tính lương, thuế TNCN, lãi vay, lãi tiết kiệm, tiền điện, tiền nước, lương tăng ca, lương hưu, BHXH một lần, lệ phí môn bài, tra cứu phạt nguội và cách viết CV — viết ngắn gọn, số liệu theo quy định hiện hành, kèm công cụ tính ngay. Tất cả bài do Tiện Ích Hub tự viết.</p>
  </header>

  <section class="section" aria-label="Tất cả bài hướng dẫn">
    <div class="sv-grid">
${articles.map(articleCard).join('\n')}
    </div>
  </section>`;
}

// Trang bài /huong-dan/<slug>/: nội dung + hộp CTA tới công cụ/mẫu liên
// quan + nguồn văn bản + ngày đăng + bài khác.
export function detailBody({ article, articles = ARTICLES } = {}) {
  const others = articles.filter((a) => a.slug !== article.slug);
  return `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/huong-dan/">← Mục hướng dẫn</a></nav>
  <header class="tool-page-head">
    <h1>${esc(article.title)}</h1>
    <p class="muted">${esc(article.desc)}</p>
    <p class="muted small">Ngày đăng: ${esc(article.date)}</p>
  </header>
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
