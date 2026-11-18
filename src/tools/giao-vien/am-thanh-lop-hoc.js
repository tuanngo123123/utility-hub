// Âm thanh lớp học: 6 âm báo tổng hợp bằng Web Audio API (không
// file âm thanh, không tải thêm gì) — chuông bắt đầu, kèn chiến
// thắng, tín hiệu chú ý, gõ nhịp suy nghĩ, chuông kết thúc, ting
// cộng điểm. Mỗi nút một giai điệu ngắn khác nhau, tự viết bằng
// oscillator. Có nút tắt/bật âm thanh chung (lưu localStorage,
// dùng chung khóa uh_gv_sound với các công cụ giáo viên khác).
export const meta = {
  id: 'am-thanh-lop-hoc',
  name: 'Âm thanh lớp học',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Âm báo cho giờ học: chuông bắt đầu, kèn chiến thắng, tín hiệu chú ý, gõ nhịp suy nghĩ, chuông kết thúc, ting cộng điểm — phát ngay trên trình duyệt, không cần file.',
  keywords: 'âm thanh lớp học, chuông lớp học, kèn chiến thắng, tín hiệu chú ý, chuông bắt đầu',
  icon: '🔊',
  seoTitle: 'Âm thanh lớp học — chuông, kèn, tín hiệu miễn phí',
  seoDesc: '6 âm báo cho giờ học: chuông bắt đầu, kèn chiến thắng, tín hiệu chú ý, gõ nhịp suy nghĩ, chuông kết thúc, ting cộng điểm. Phát ngay trên trình duyệt, không cần tải file.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span><div><h2>Âm thanh lớp học</h2><p class="muted">Bấm một nút là phát âm báo ngay — âm thanh tổng hợp trên trình duyệt, không cần tải file, không cần loa ngoài đặc biệt.</p></div></div>
  <div class="gv-sound-grid" id="at-grid">
    <button type="button" class="gv-snd" data-sound="start"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><strong>Chuông bắt đầu</strong><span>Vào tiết mới</span></button>
    <button type="button" class="gv-snd" data-sound="win"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><strong>Kèn chiến thắng</strong><span>Ăn mừng đội thắng</span></button>
    <button type="button" class="gv-snd" data-sound="attention"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><strong>Tín hiệu chú ý</strong><span>Cả lớp nghe này</span></button>
    <button type="button" class="gv-snd" data-sound="think"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><strong>Gõ nhịp suy nghĩ</strong><span>Cho thời gian nghĩ</span></button>
    <button type="button" class="gv-snd" data-sound="end"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="4" y1="4" x2="20" y2="20" opacity="0"/></svg><strong>Chuông kết thúc</strong><span>Hết giờ làm bài</span></button>
    <button type="button" class="gv-snd" data-sound="point"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg><strong>Ting cộng điểm</strong><span>Cộng điểm đúng lúc</span></button>
  </div>
  <div class="btn-row" style="margin-top:14px">
    <!-- data-uh-reset: công cụ không có ô nhập nên không cần nút Đặt lại của khung; thuộc tính này ngăn khung tự chèn nút thừa. -->
    <button type="button" class="btn btn-ghost gv-sound-btn" id="at-toggle" data-uh-reset="1">Âm thanh: Bật</button>
  </div>
  <p class="note" id="at-msg" style="display:none"></p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const KEY = 'uh_gv_sound';
  let ctx = null;

  // Mỗi âm là một danh sách nốt [tần số, trễ giây, dài giây, dạng sóng, độ to].
  const SOUNDS = {
    // Chuông bắt đầu: đinh-đong hai tông.
    start: [[659.25, 0, 0.5, 'sine', 0.2], [1318.5, 0, 0.3, 'sine', 0.05], [493.88, 0.45, 0.8, 'sine', 0.2]],
    // Kèn chiến thắng: hợp âm đi lên rồi giữ nốt cao.
    win: [[523.25, 0, 0.16, 'triangle', 0.18], [659.25, 0.14, 0.16, 'triangle', 0.18], [783.99, 0.28, 0.16, 'triangle', 0.18], [1046.5, 0.42, 0.5, 'triangle', 0.2]],
    // Tín hiệu chú ý: 3 tiếng bíp ngắn.
    attention: [[440, 0, 0.09, 'square', 0.08], [440, 0.16, 0.09, 'square', 0.08], [440, 0.32, 0.16, 'square', 0.08]],
    // Gõ nhịp suy nghĩ: 4 tiếng gõ trầm cách đều.
    think: [[220, 0, 0.07, 'sine', 0.2], [220, 0.5, 0.07, 'sine', 0.2], [220, 1.0, 0.07, 'sine', 0.2], [220, 1.5, 0.12, 'sine', 0.2]],
    // Chuông kết thúc: một tiếng chuông dài vang dần.
    end: [[523.25, 0, 1.2, 'sine', 0.2], [784, 0, 0.9, 'sine', 0.05]],
    // Ting cộng điểm: tiếng ting cao, sáng.
    point: [[1318.5, 0, 0.35, 'sine', 0.18], [1975.5, 0, 0.2, 'sine', 0.06]]
  };

  function enabled() {
    try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; }
  }

  function setEnabled(v) {
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* bỏ qua */ }
  }

  function audioCtx() {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) { try { ctx = new AC(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function play(name) {
    const notes = SOUNDS[name];
    if (!notes) return;
    const c = audioCtx();
    if (!c) return;
    notes.forEach(n => {
      const t0 = c.currentTime + n[1];
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = n[3];
      osc.frequency.setValueAtTime(n[0], t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(n[4], t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n[2]);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + n[2] + 0.05);
    });
  }

  function setMsg(text) {
    const el = $('at-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function paintToggle() {
    $('at-toggle').textContent = 'Âm thanh: ' + (enabled() ? 'Bật' : 'Tắt');
  }

  $('at-grid').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-sound]');
    if (!btn) return;
    if (!enabled()) {
      setMsg('Âm thanh đang tắt — bấm nút "Âm thanh: Bật" rồi thử lại nhé.');
      return;
    }
    setMsg('');
    btn.classList.add('gv-snd-playing');
    play(btn.getAttribute('data-sound'));
    setTimeout(() => btn.classList.remove('gv-snd-playing'), 1200);
  });

  $('at-toggle').addEventListener('click', () => {
    setEnabled(!enabled());
    paintToggle();
    if (enabled()) setMsg('');
  });

  paintToggle();
}
