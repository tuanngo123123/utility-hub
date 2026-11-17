// Đếm từ & thời lượng đọc — Utility Hub (Văn phòng)
export const meta = {
  id: 'dem-tu-thoi-luong-doc',
  name: 'Đếm từ & thời lượng đọc',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Đếm từ, ký tự, câu, đoạn; ước tính thời lượng đọc và nói; liệt kê 10 từ lặp nhiều nhất.',
  keywords: 'đếm từ, thời lượng đọc, word count, thời lượng nói, từ lặp',
  icon: '📖',
  seoTitle: 'Đếm từ & thời lượng đọc — ước tính thời gian đọc/nói',
  seoDesc: 'Dán văn bản để đếm từ, ký tự, câu, đoạn; ước tính thời gian đọc (200 từ/phút) và nói (150 từ/phút); xem 10 từ lặp nhiều nhất.'
};

const STOPWORDS = new Set(['và', 'là', 'của', 'cho', 'với', 'trong', 'đã', 'được', 'các', 'những', 'có', 'không', 'một', 'này', 'đó', 'khi', 'như', 'để', 'từ', 'ở', 'về', 'thì', 'mà', 'là', 'sẽ', 'cũng', 'đến', 'ra', 'nên', 'nếu', 'vì', 'do', 'tại', 'theo', 'sau', 'trước', 'giữa', 'trên', 'dưới', 'hơn', 'rất', 'chỉ', 'hay', 'hoặc', 'nhưng', 'tôi', 'bạn', 'anh', 'chị', 'em', 'ông', 'bà', 'nó', 'họ', 'mình', 'ai', 'gì', 'nào', 'đây', 'kia', 'ấy', 'còn', 'lại', 'đi', 'vào', 'lên', 'xuống', 'qua', 'là', 'bị', 'phải', 'cần', 'muốn', 'hãy', 'đang', 'vừa', 'mới', 'luôn', 'thường', 'mỗi', 'mọi', 'tất', 'cả']);

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📖</span><div><h2>Đếm từ &amp; thời lượng đọc</h2><p class="muted">Dán văn bản — đếm ngay, kèm thời lượng đọc và nói ước tính.</p></div></div>
  <div class="field"><label for="dtd-input">Văn bản cần đếm</label><textarea id="dtd-input" rows="8" placeholder="Dán văn bản, kịch bản video hoặc bài viết vào đây..."></textarea></div>
  <button class="btn btn-primary" id="dtd-count">Đếm &amp; phân tích</button>
  <div class="result" id="dtd-result" hidden></div>
  <div id="dtd-top" hidden></div>
  <p class="note">Thời lượng đọc ước tính theo tốc độ 200 từ/phút; thời lượng nói theo 150 từ/phút (tiện ước lượng độ dài kịch bản video). Bảng từ lặp đã bỏ qua các từ dừng tiếng Việt phổ biến (và, là, của, cho, với...).</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const inputEl = $('dtd-input'), resEl = $('dtd-result'), topEl = $('dtd-top');

  function fmtDur(mins) {
    if (mins < 1) return 'dưới 1 phút (khoảng ' + Math.max(1, Math.round(mins * 60)) + ' giây)';
    const m = Math.floor(mins), s = Math.round((mins - m) * 60);
    return s ? m + ' phút ' + s + ' giây' : m + ' phút';
  }

  $('dtd-count').addEventListener('click', () => {
    const t = inputEl.value;
    if (!t.trim()) { toast('Vui lòng dán văn bản vào ô trên.'); return; }
    const words = t.trim().match(/\S+/g) || [];
    const sentences = (t.match(/[^.!?]+[.!?]+/g) || []).length;
    const paragraphs = t.split(/\n\s*\n/).filter(p => p.trim()).length;
    const readMin = words.length / 200;
    const speakMin = words.length / 150;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Số từ</span><strong>' + fmtNum(words.length) + '</strong></div>' +
      '<div class="result-row"><span>Ký tự (kể cả khoảng trắng)</span><span>' + fmtNum(t.length) + '</span></div>' +
      '<div class="result-row"><span>Ký tự (không kể khoảng trắng)</span><span>' + fmtNum(t.replace(/\s/g, '').length) + '</span></div>' +
      '<div class="result-row"><span>Số câu</span><span>' + fmtNum(sentences) + '</span></div>' +
      '<div class="result-row"><span>Số đoạn</span><span>' + fmtNum(paragraphs) + '</span></div>' +
      '<div class="result-row"><span>Thời lượng đọc ước tính (200 từ/phút)</span><strong>' + fmtDur(readMin) + '</strong></div>' +
      '<div class="result-row"><span>Thời lượng nói ước tính (150 từ/phút)</span><strong>' + fmtDur(speakMin) + '</strong></div>';
    const freq = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/^[^a-zà-ỹ0-9]+|[^a-zà-ỹ0-9]+$/g, '');
      if (!clean || STOPWORDS.has(clean)) return;
      freq[clean] = (freq[clean] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (top.length) {
      let html = '<table class="tbl"><tr><th>#</th><th>Từ lặp nhiều nhất</th><th>Số lần</th></tr>';
      top.forEach((e, i) => { html += '<tr><td>' + (i + 1) + '</td><td>' + e[0] + '</td><td>' + fmtNum(e[1]) + '</td></tr>'; });
      html += '</table>';
      topEl.innerHTML = html;
      topEl.hidden = false;
    } else {
      topEl.hidden = true;
    }
  });
}
