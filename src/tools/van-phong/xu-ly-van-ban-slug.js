// Xử lý văn bản & tạo slug — Utility Hub (Văn phòng)
export const meta = {
  id: 'xu-ly-van-ban-slug',
  name: 'Xử lý văn bản & tạo slug',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Đếm từ/ký tự, xóa dòng trùng, dọn khoảng trắng thừa, tạo slug bỏ dấu và đổi chữ hoa/thường.',
  keywords: 'tạo slug, bỏ dấu tiếng Việt, đếm từ, xóa dòng trùng, chuyển chữ hoa thường',
  icon: '🔤',
  seoTitle: 'Xử lý văn bản & tạo slug tiếng Việt — bỏ dấu, đếm từ',
  seoDesc: 'Dán văn bản để đếm từ, câu, ký tự; xóa dòng trùng và khoảng trắng thừa; tạo slug bỏ dấu tiếng Việt; chuyển chữ HOA/thường.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔤</span><div><h2>Xử lý văn bản &amp; tạo slug</h2><p class="muted">Dán văn bản, chọn thao tác — kết quả chép được ngay.</p></div></div>
  <div class="field"><label for="xlvb-input">Văn bản cần xử lý</label><textarea id="xlvb-input" rows="6" placeholder="Dán văn bản vào đây..."></textarea></div>
  <p>
    <button class="btn btn-primary" id="xlvb-count">Đếm từ &amp; ký tự</button>
    <button class="btn btn-ghost" id="xlvb-dedup">Xóa dòng trùng</button>
    <button class="btn btn-ghost" id="xlvb-trim">Dọn khoảng trắng thừa</button>
    <button class="btn btn-ghost" id="xlvb-slug">Tạo slug</button>
    <button class="btn btn-ghost" id="xlvb-upper">CHỮ HOA</button>
    <button class="btn btn-ghost" id="xlvb-lower">chữ thường</button>
  </p>
  <div class="result" id="xlvb-stats" hidden></div>
  <div class="field" id="xlvb-out-wrap" hidden><label for="xlvb-output">Kết quả</label><textarea id="xlvb-output" rows="5" readonly></textarea>
  <p><button class="btn copy-btn" id="xlvb-copy">📋 Chép kết quả</button></p></div>
  <p class="note">Ví dụ slug: "Tôi Yêu Việt Nam" → "toi-yeu-viet-nam".</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const toast = UH.toast || (m => alert(m));
  const copyText = UH.copyText || (t => { if (navigator.clipboard) navigator.clipboard.writeText(t); });
  const $ = id => root.querySelector('#' + id);
  const inputEl = $('xlvb-input'), statsEl = $('xlvb-stats'), outWrap = $('xlvb-out-wrap'), outEl = $('xlvb-output');

  function getText() { return inputEl.value; }
  function needText() { if (!getText().trim()) { toast('Vui lòng dán văn bản vào ô trên.'); return false; } return true; }
  function showOut(text) { outEl.value = text; outWrap.hidden = false; }

  function toSlug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  $('xlvb-count').addEventListener('click', () => {
    if (!needText()) return;
    const t = getText();
    const words = (t.trim().match(/\S+/g) || []).length;
    const sentences = (t.match(/[^.!?]+[.!?]+/g) || []).length;
    const lines = t.split('\n').filter(l => l.trim()).length;
    statsEl.hidden = false;
    statsEl.innerHTML =
      '<div class="result-row"><span>Số từ</span><strong>' + fmtNum(words) + '</strong></div>' +
      '<div class="result-row"><span>Số câu</span><span>' + fmtNum(sentences) + '</span></div>' +
      '<div class="result-row"><span>Số dòng có nội dung</span><span>' + fmtNum(lines) + '</span></div>' +
      '<div class="result-row"><span>Ký tự (kể cả khoảng trắng)</span><span>' + fmtNum(t.length) + '</span></div>' +
      '<div class="result-row"><span>Ký tự (không kể khoảng trắng)</span><span>' + fmtNum(t.replace(/\s/g, '').length) + '</span></div>';
  });
  $('xlvb-dedup').addEventListener('click', () => {
    if (!needText()) return;
    const seen = new Set();
    const out = getText().split('\n').filter(l => { if (seen.has(l)) return false; seen.add(l); return true; }).join('\n');
    showOut(out);
  });
  $('xlvb-trim').addEventListener('click', () => {
    if (!needText()) return;
    const out = getText().split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(l => l).join('\n');
    showOut(out);
  });
  $('xlvb-slug').addEventListener('click', () => {
    if (!needText()) return;
    showOut(getText().split('\n').map(l => toSlug(l)).filter(Boolean).join('\n'));
  });
  $('xlvb-upper').addEventListener('click', () => { if (!needText()) return; showOut(getText().toUpperCase()); });
  $('xlvb-lower').addEventListener('click', () => { if (!needText()) return; showOut(getText().toLowerCase()); });
  $('xlvb-copy').addEventListener('click', () => { copyText(outEl.value); toast('Đã chép kết quả.'); });
}
