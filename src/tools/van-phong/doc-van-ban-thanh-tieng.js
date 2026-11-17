// Đọc văn bản thành tiếng — dùng SpeechSynthesis của trình duyệt, ưu tiên giọng tiếng Việt.
export const meta = {
  id: 'doc-van-ban-thanh-tieng',
  name: 'Đọc văn bản thành tiếng',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Dán văn bản tiếng Việt để trình duyệt đọc thành tiếng — chọn giọng Việt nếu có, chỉnh tốc độ và cao độ. Không cần tài khoản, không gửi văn bản đi đâu.',
  keywords: 'đọc văn bản thành tiếng, text to speech tiếng việt, đọc văn bản, giọng đọc tiếng việt, nghe văn bản, tts tiếng việt miễn phí',
  icon: '🔊',
  seoTitle: 'Đọc văn bản thành tiếng — Text to Speech tiếng Việt miễn phí',
  seoDesc: 'Dán văn bản để nghe đọc thành tiếng bằng giọng tiếng Việt của trình duyệt. Chỉnh tốc độ, cao độ, chọn giọng — miễn phí, không cần đăng ký.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔊</span><div><h2>Đọc văn bản thành tiếng</h2><p class="muted">Dán văn bản, bấm Đọc — trình duyệt đọc thành tiếng ngay, dùng giọng tiếng Việt nếu máy bạn có.</p></div></div>
  <div class="field"><label for="dvt-text">Văn bản cần đọc</label><textarea id="dvt-text" rows="6">Xin chào, đây là công cụ đọc văn bản thành tiếng. Bạn có thể dán bất kỳ đoạn văn bản tiếng Việt nào vào đây, chọn giọng đọc và tốc độ, rồi bấm nút Đọc để nghe.</textarea></div>
  <p class="muted small" id="dvt-count"></p>
  <div class="grid-2">
    <div class="field"><label for="dvt-voice">Giọng đọc</label><select id="dvt-voice"><option value="">Đang tải danh sách giọng…</option></select></div>
    <div class="field"><label for="dvt-rate">Tốc độ: <strong id="dvt-rate-val">1×</strong></label><input id="dvt-rate" type="range" min="0.5" max="2" step="0.1" value="1"></div>
    <div class="field"><label for="dvt-pitch">Cao độ: <strong id="dvt-pitch-val">1</strong></label><input id="dvt-pitch" type="range" min="0.5" max="2" step="0.1" value="1"></div>
  </div>
  <div id="dvt-voice-note"></div>
  <div>
    <button type="button" class="btn btn-primary" id="dvt-speak">▶ Đọc</button>
    <button type="button" class="btn btn-ghost" id="dvt-stop">⏹ Dừng</button>
  </div>
  <div id="dvt-out"></div>
  <p class="note">Giọng đọc do trình duyệt và hệ điều hành cung cấp. Chrome trên điện thoại Android/iPhone thường có sẵn giọng tiếng Việt; trên máy tính Windows/macOS có thể cần cài thêm giọng Việt trong Cài đặt hệ thống (Ngôn ngữ → Giọng nói).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const synth = (typeof window !== 'undefined' && window.speechSynthesis) || null;
  let voices = [];

  function updateCount() {
    const n = $('dvt-text').value.length;
    $('dvt-count').textContent = n.toLocaleString('vi-VN') + ' ký tự' + (n > 5000 ? ' — văn bản dài, một số trình duyệt có thể ngắt giữa chừng; nên chia nhỏ đoạn đọc.' : '');
  }
  $('dvt-text').addEventListener('input', updateCount);
  updateCount();

  $('dvt-rate').addEventListener('input', () => { $('dvt-rate-val').textContent = (+$('dvt-rate').value).toFixed(1).replace('.', ',') + '×'; });
  $('dvt-pitch').addEventListener('input', () => { $('dvt-pitch-val').textContent = (+$('dvt-pitch').value).toFixed(1).replace('.', ','); });

  function fillVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    if (!voices.length) return;
    const viVoices = voices.filter(v => (v.lang || '').toLowerCase().indexOf('vi') === 0);
    const sorted = viVoices.concat(voices.filter(v => (v.lang || '').toLowerCase().indexOf('vi') !== 0));
    $('dvt-voice').innerHTML = sorted.map((v, i) =>
      '<option value="' + i + '"' + (i === 0 ? ' selected' : '') + '>' +
      v.name + ' (' + v.lang + ')' + (v.default ? ' — mặc định' : '') + '</option>'
    ).join('');
    // Lưu lại thứ tự đã sắp để tra theo index.
    fillVoices.sorted = sorted;
    if (viVoices.length === 0) {
      $('dvt-voice-note').innerHTML = '<p class="note">⚠️ Trình duyệt này chưa có giọng tiếng Việt — giọng đọc có thể phát âm không chuẩn tiếng Việt. Để có giọng Việt: trên điện thoại dùng Chrome (Android/iOS thường có sẵn); trên máy tính, cài thêm giọng "Vietnamese" trong Cài đặt ngôn ngữ/giọng nói của hệ điều hành rồi mở lại trang.</p>';
    } else {
      $('dvt-voice-note').innerHTML = '<p class="note">✅ Đã tìm thấy ' + viVoices.length + ' giọng tiếng Việt trên trình duyệt này.</p>';
    }
  }

  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    $('dvt-out').innerHTML = '<p class="error">Trình duyệt này không hỗ trợ đọc thành tiếng (Web Speech API). Hãy thử Chrome, Edge hoặc Safari phiên bản mới.</p>';
    $('dvt-speak').disabled = true;
    $('dvt-voice').innerHTML = '<option value="">Không hỗ trợ</option>';
  } else {
    fillVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = fillVoices;
    // Một số trình duyệt tải giọng chậm — thử lại sau 1 giây.
    setTimeout(fillVoices, 1000);
  }

  $('dvt-speak').addEventListener('click', () => {
    if (!synth) return;
    const text = $('dvt-text').value.trim();
    if (!text) { $('dvt-out').innerHTML = '<p class="error">Hãy nhập văn bản cần đọc trước đã.</p>'; return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const sorted = fillVoices.sorted || voices;
    const vi = sorted && $('dvt-voice').value !== '' ? sorted[+$('dvt-voice').value] : null;
    if (vi) {
      u.voice = vi;
      u.lang = vi.lang;
    } else {
      u.lang = 'vi-VN';
    }
    u.rate = +$('dvt-rate').value || 1;
    u.pitch = +$('dvt-pitch').value || 1;
    u.onstart = () => { $('dvt-out').innerHTML = '<p class="note">🔊 Đang đọc… bấm "Dừng" để ngừng.</p>'; };
    u.onend = () => { $('dvt-out').innerHTML = '<p class="note">✅ Đã đọc xong.</p>'; };
    u.onerror = e => {
      if (e && e.error === 'canceled') return;
      $('dvt-out').innerHTML = '<p class="error">Không đọc được (lỗi: ' + (e && e.error ? e.error : 'không rõ') + '). Thử chọn giọng khác hoặc tải lại trang.</p>';
    };
    synth.speak(u);
  });

  $('dvt-stop').addEventListener('click', () => {
    if (!synth) return;
    synth.cancel();
    $('dvt-out').innerHTML = '<p class="note">Đã dừng đọc.</p>';
    toast('Đã dừng đọc.');
  });
}
