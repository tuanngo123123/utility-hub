// Trang Học miễn phí (/hoc-mien-phi/): repo GitHub học miễn phí,
// chia 3 nhóm (tiếng Anh / lập trình / kỹ năng khác). Theo mẫu mục
// Sinh viên (sv-card/sv-grid/sv-toc có sẵn trong style.css). Dữ liệu
// trong hoc-mien-phi-data.js — đã kiểm chứng thật qua GitHub API
// ngày 18/11/2026; mô tả tiếng Việt tự viết, không sao chép README.
import { esc } from '../tool-card.js';
import { GROUPS } from './hoc-mien-phi-data.js';

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

export function body() {
  return `
  <header class="tool-page-head">
    <h1>Học miễn phí</h1>
    <p class="muted">Repo GitHub học miễn phí, mô tả bằng tiếng Việt — tiếng Anh, lập trình, thiết kế và hơn nữa. Tất cả đều miễn phí thật, không cần đăng ký tài khoản trả phí. Mục nào có nút <strong>Học ngay trên web</strong> thì mở ra học luôn trên trình duyệt, không cần cài đặt gì. Muốn xem chi tiết sao/fork/ngôn ngữ của repo nào, dùng <a href="/cong-cu/tra-cuu-github/">công cụ Tra cứu GitHub</a>.</p>
    <nav class="sv-toc" aria-label="Mục lục trang">
${GROUPS.map((g) => `      <a class="chip" href="#${esc(g.id)}">${esc(g.title)}</a>`).join('\n')}
    </nav>
  </header>

  <section class="section" aria-label="Học từ vựng tiếng Anh trên web này">
    <div class="result">
      <h2 style="margin-top:0">Học từ vựng tiếng Anh ngay trên web này</h2>
      <p class="muted">400 từ tiếng Anh thông dụng nhất, nghĩa tiếng Việt, ví dụ kèm dịch — học bằng thẻ từ có phát âm, gõ từ theo nghĩa hoặc trắc nghiệm. Không cần cài đặt gì, tiến độ được lưu lại trên trình duyệt của bạn.</p>
      <p><a class="btn btn-primary" href="/cong-cu/hoc-tu-vung-tieng-anh/">Học ngay trên web này →</a></p>
    </div>
  </section>
${GROUPS.map((g) => `
  <section class="section" id="${esc(g.id)}" aria-label="${esc(g.title)}">
    <h2>${esc(g.title)}</h2>
    <p class="muted">${esc(g.intro)}</p>
    <div class="sv-grid">
${g.repos.map(repoCard).join('\n')}
    </div>
  </section>`).join('')}

  <section class="section" aria-label="Ghi chú">
    <p class="note">Số sao cập nhật ngày 18/11/2026 — số sao trên GitHub thay đổi theo thời gian, bấm vào repo để xem số mới nhất. Trang này chỉ giới thiệu repo, không sao chép nội dung của repo; mọi repo đều mở và miễn phí theo giấy phép của tác giả. Repo vi phạm điều khoản dịch vụ (hack trial, crack, lách luật) không bao giờ được đưa vào trang này.</p>
  </section>`;
}
