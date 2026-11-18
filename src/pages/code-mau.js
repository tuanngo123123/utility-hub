// Trang Code mẫu (/code-mau/ + /code-mau/<id>/): thư viện đoạn code
// sao chép-dán cho lập trình viên, lấy cảm hứng từ 21st.dev thu nhỏ cho
// web tĩnh — không tài khoản, không backend. Dữ liệu từ
// src/data/code-mau.json, build import lúc build (không fetch lúc chạy).
// Mẫu code KHÔNG phải công cụ: không tính vào số 120 công cụ, không nằm
// trong src/tools/, không vào chỉ mục tìm kiếm chung (xem ghi chú cuối
// file về quyết định tìm kiếm).
// Nút "Sao chép" dùng [data-copy] + setupCopyButtons có sẵn trong app.js
// (UH.copyText + toast), không cần JS riêng.
import { esc } from '../tool-card.js';

function topicLabel(topics, slug) {
  const found = (topics || []).find((t) => t.slug === slug);
  return found ? found.label : slug;
}

function fileExt(lang) {
  return lang === 'Python' ? 'py' : 'js';
}

// 3 dòng đầu của code, để xem trước trên thẻ danh mục.
function previewLines(code) {
  return String(code || '').split('\n').slice(0, 3).join('\n');
}

// Thẻ mẫu trên trang danh mục: tiêu đề + mô tả + nhãn ngôn ngữ/chủ đề
// + xem trước 3 dòng code + link tới trang riêng.
function sampleCard(sample, topics) {
  return `<article class="code-mau-card" data-topic="${esc(sample.topic)}" data-name="${esc(sample.title)}" data-desc="${esc(sample.desc)}" data-lang="${esc(sample.lang)}">
  <h3 class="card-title"><a href="/code-mau/${esc(sample.id)}/">${esc(sample.title)}</a></h3>
  <p class="card-desc">${esc(sample.desc)}</p>
  <p class="code-mau-tags"><span class="chip code-lang">${esc(sample.lang)}</span> <span class="chip">${esc(topicLabel(topics, sample.topic))}</span></p>
  <pre class="code-preview" aria-hidden="true"><code>${esc(previewLines(sample.code))}</code></pre>
  <p><a href="/code-mau/${esc(sample.id)}/">Xem mẫu &amp; sao chép →</a></p>
</article>`;
}

// Trang danh mục /code-mau/: ô tìm kiếm + chip lọc theo chủ đề + lưới thẻ.
// Lọc chạy bằng setupCodeMauFilter trong app.js (theo mẫu setupSearchFilter),
// đọc ?topic=<slug> để lọc sẵn như ?cat= ở trang công cụ.
export function body({ samples = [], topics = [] } = {}) {
  const chips = [`<button type="button" class="chip chip-active" data-code-filter="all" aria-pressed="true">Tất cả</button>`]
    .concat(topics.map((t) => `<button type="button" class="chip" data-code-filter="${esc(t.slug)}" aria-pressed="false">${esc(t.label)}</button>`))
    .join('\n      ');

  const grid = samples.length
    ? `<div class="code-mau-grid" id="code-mau-grid">
${samples.map((s) => sampleCard(s, topics)).join('\n')}
</div>
<p id="code-mau-empty" class="muted" hidden>Không tìm thấy mẫu code nào phù hợp — thử từ khóa khác hoặc chọn chủ đề khác.</p>`
    : `<p class="muted">Chưa có mẫu code nào — đang cập nhật.</p>`;

  return `
  <section class="section">
    <h1>Code mẫu cho lập trình viên</h1>
    <p class="muted" id="code-mau-count">${samples.length} mẫu code — sao chép-dán là chạy, đã chạy thử trước khi đăng, không cần đăng nhập.</p>
    <p class="muted">Mỗi mẫu có sẵn một câu prompt ngắn để dán vào Claude Code/Cursor khi cần viết lại theo ý mình. Ưu tiên thứ gắn với Việt Nam: VietQR, SĐT/CCCD/mã số thuế, đọc số thành chữ, bỏ dấu, slug tiếng Việt.</p>
    <label class="small muted" for="code-mau-search">Tìm mẫu code</label>
    <input type="search" id="code-mau-search" class="search-input search-input-large" placeholder="VD: VietQR, CRC16, slug, JWT, debounce… (gõ không dấu cũng được)" autocomplete="off">
    <div class="chip-row" id="code-mau-chips" role="group" aria-label="Lọc theo chủ đề">
      ${chips}
    </div>
    <p id="code-mau-status" class="muted" hidden><span id="code-mau-status-text"></span> <button type="button" class="chip" id="code-mau-clear">✕ Xóa lọc</button></p>
    ${grid}
  </section>`;
}

// Trang riêng từng mẫu /code-mau/<id>/: khối code đầy đủ + nút Sao chép
// code + nút Sao chép prompt + công cụ liên quan + mẫu cùng chủ đề.
export function detailBody({ sample, samples = [], topics = [] } = {}) {
  const related = sample.relatedTool
    ? `<p class="note">Dùng trong công cụ: <a href="/cong-cu/${esc(sample.relatedTool.slug)}/">${esc(sample.relatedTool.name)}</a> — thử trực tiếp trên web mà không cần viết code.</p>`
    : '';
  const sameTopic = samples
    .filter((s) => s.topic === sample.topic && s.id !== sample.id)
    .slice(0, 4);
  const sameTopicHtml = sameTopic.length
    ? `<section class="section"><h2>Mẫu khác cùng chủ đề ${esc(topicLabel(topics, sample.topic))}</h2><ul>${sameTopic.map((s) => `<li><a href="/code-mau/${esc(s.id)}/">${esc(s.title)}</a> <span class="muted small">— ${esc(s.lang)}</span></li>`).join('')}</ul></section>`
    : '';
  return `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/code-mau/">← Tất cả code mẫu</a></nav>
  <header class="tool-page-head">
    <h1>${esc(sample.title)}</h1>
    <p class="muted">${esc(sample.desc)}</p>
    <p class="code-mau-tags"><span class="chip code-lang">${esc(sample.lang)}</span> <span class="chip">${esc(topicLabel(topics, sample.topic))}</span></p>
  </header>
  <div class="code-block-wrap">
    <div class="code-block-head">
      <span class="code-filename">${esc(sample.id)}.${fileExt(sample.lang)}</span>
      <span class="code-actions">
        <button type="button" class="btn btn-primary copy-btn" data-copy="${esc(sample.code)}" data-copy-msg="Đã chép code mẫu">📋 Sao chép</button>
        <button type="button" class="btn btn-ghost copy-btn" data-copy="${esc(sample.prompt)}" data-copy-msg="Đã chép prompt">✨ Sao chép prompt</button>
      </span>
    </div>
    <pre class="code-block"><code>${esc(sample.code)}</code></pre>
  </div>
  <section class="section prompt-box">
    <h2>Prompt cho AI</h2>
    <p>Dán câu này vào Claude Code/Cursor khi cần viết lại mẫu theo ý mình:</p>
    <p class="prompt-text">${esc(sample.prompt)}</p>
    <p><button type="button" class="btn btn-ghost copy-btn" data-copy="${esc(sample.prompt)}" data-copy-msg="Đã chép prompt">✨ Sao chép prompt</button></p>
  </section>
  ${related}
  <p class="muted small">Mọi mẫu code trên trang này đã chạy thử bằng Node/Python trước khi đăng — ví dụ trong code là kết quả thật, không viết tay.</p>
  ${sameTopicHtml}`;
}

// Ghi chú quyết định tìm kiếm chung (nhóm E, 18/11):
// Mẫu code KHÔNG đưa vào chỉ mục tìm kiếm chung (/data/search-index.json)
// vì: (1) hero search gắn cứng href '/cong-cu/' + slug nên mẫu code
// (/code-mau/<id>/) sẽ link sai; (2) buildSearchIndex + rankSearch +
// hero render đều giả định mọi mục là công cụ — sửa đúng cần đụng 3 chỗ
// ngoài phạm vi nhóm E (build.mjs chỉ được thêm trang code-mau, app.js
// chỉ được thêm 1 hàm lọc). Trang danh mục đã có ô tìm + lọc theo chủ đề
// riêng, đủ dùng. Nếu sau này muốn gộp, cần thêm trường "kind" vào chỉ
// mục và sửa hero search chọn href theo kind.
