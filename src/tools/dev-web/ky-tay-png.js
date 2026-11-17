// Ký tay → PNG trong suốt — vẽ chữ ký bằng chuột/cảm ứng, tải PNG nền trong suốt.
export const meta = {
  id: 'ky-tay-png',
  name: 'Ký tay → PNG trong suốt',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Vẽ chữ ký bằng chuột hoặc ngón tay trên khung vẽ, chọn màu và độ dày bút, tải về file PNG nền trong suốt để chèn vào tài liệu.',
  keywords: 'ký tay png, chữ ký điện tử, vẽ chữ ký, ký tên online, chữ ký trong suốt',
  icon: '✍️',
  seoTitle: 'Ký tay → PNG trong suốt — Vẽ chữ ký online',
  seoDesc: 'Vẽ chữ ký bằng chuột hoặc cảm ứng, chọn màu và độ dày bút, tải file PNG nền trong suốt để chèn vào Word, PDF.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>✍️</span><div><h2>Ký tay → PNG trong suốt</h2><p class="muted">Vẽ chữ ký vào khung dưới đây, rồi tải file PNG nền trong suốt để chèn vào tài liệu.</p></div></div>
  <div class="grid-3">
    <div class="field"><label for="kt-color">Màu mực</label><input id="kt-color" type="color" value="#1a1a2e"></div>
    <div class="field"><label for="kt-width">Độ dày bút (px)</label><input id="kt-width" type="number" min="1" max="12" value="3"></div>
    <div class="field"><label>&nbsp;</label><button type="button" class="btn btn-ghost" id="kt-clear">Xóa / vẽ lại</button></div>
  </div>
  <canvas id="kt-canvas" width="640" height="240" style="border:2px dashed #bbb;border-radius:8px;touch-action:none;max-width:100%;cursor:crosshair"></canvas>
  <div>
    <button type="button" class="btn btn-primary" id="kt-dl">Tải PNG trong suốt</button>
  </div>
  <p class="note">Nền khung vẽ trong suốt — file PNG tải về không có nền trắng, chèn thẳng vào Word/PDF là dùng được. Chữ ký chỉ nằm trên máy của bạn.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const canvas = $('kt-canvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let lastX = 0, lastY = 0;
  let hasInk = false;

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const t = e.touches && e.touches[0] ? e.touches[0] : e;
    return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
  }
  function start(e) {
    e.preventDefault();
    drawing = true;
    const p = pos(e);
    lastX = p.x; lastY = p.y;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = $('kt-color').value;
    ctx.lineWidth = +$('kt-width').value || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
    hasInk = true;
  }
  function end() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  $('kt-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
  });
  $('kt-dl').addEventListener('click', () => {
    if (!hasInk) { toast('Hãy vẽ chữ ký trước đã.'); return; }
    try {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'chu-ky.png';
      a.click();
      toast('Đã tải file chu-ky.png (nền trong suốt).');
    } catch (e) {
      toast('Không tải được ảnh, thử lại sau.');
    }
  });
}
