// Chuyển đổi màu HEX — HEX ↔ RGB/HSL, xem màu, copy từng định dạng, bảng màu gợi ý.
export const meta = {
  id: 'mau-hex',
  name: 'Chuyển đổi màu HEX',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Nhập mã HEX để xem màu và đổi sang RGB, HSL; hoặc nhập RGB để đổi ngược sang HEX. Kèm bảng màu gợi ý.',
  keywords: 'hex sang rgb, rgb sang hex, chuyển đổi màu, mã màu, hex to rgb, hsl',
  icon: '🎨',
  seoTitle: 'Chuyển đổi màu HEX ↔ RGB, HSL — Xem màu trực tiếp',
  seoDesc: 'Nhập mã HEX để đổi sang RGB và HSL, xem màu trực tiếp, chép từng định dạng. Có chiều ngược RGB sang HEX và bảng màu gợi ý.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🎨</span><div><h2>Chuyển đổi màu HEX</h2><p class="muted">Nhập mã HEX để xem màu và đổi sang RGB/HSL — hoặc nhập RGB để đổi ngược.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="mh-hex">Mã HEX</label><input id="mh-hex" type="text" value="#1a5276" placeholder="#1a5276"></div>
    <div class="field"><label for="mh-picker">Chọn màu trực tiếp</label><input id="mh-picker" type="color" value="#1a5276"></div>
  </div>
  <button type="button" class="btn btn-primary" id="mh-go">Xem màu</button>
  <div id="mh-swatch" class="result" style="display:none"><div class="result-row"><span>Màu đã chọn</span><strong id="mh-preview" style="display:inline-block;width:120px;height:48px;border-radius:8px;border:1px solid #ccc"></strong></div></div>
  <div id="mh-out"></div>
  <div class="field"><label>RGB → HEX</label></div>
  <div class="grid-3">
    <div class="field"><label for="mh-r">R (0–255)</label><input id="mh-r" type="number" min="0" max="255" value="26"></div>
    <div class="field"><label for="mh-g">G (0–255)</label><input id="mh-g" type="number" min="0" max="255" value="82"></div>
    <div class="field"><label for="mh-b">B (0–255)</label><input id="mh-b" type="number" min="0" max="255" value="118"></div>
  </div>
  <button type="button" class="btn btn-ghost" id="mh-rgb-go">Đổi RGB → HEX</button>
  <div id="mh-rgb-out"></div>
  <div class="field"><label>Bảng màu gợi ý — bấm để dùng</label></div>
  <div id="mh-palette"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(t) : Promise.reject(new Error('no clipboard')));
  const $ = id => root.querySelector('#' + id);

  function hexToRgb(hex) {
    let h = hex.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), hex: '#' + h.toLowerCase() };
  }
  function rgbToHex(r, g, b) {
    const p = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return '#' + p(r) + p(g) + p(b);
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function copyButton(text) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost copy-btn';
    b.textContent = 'Chép';
    b.addEventListener('click', () => copyText(text).then(() => toast('Đã chép ' + text)).catch(() => toast('Không chép được.')));
    return b;
  }
  function show(c) {
    const hsl = rgbToHsl(c.r, c.g, c.b);
    const rgbStr = 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
    const hslStr = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
    $('mh-swatch').style.display = '';
    $('mh-preview').style.background = c.hex;
    $('mh-picker').value = c.hex;
    $('mh-r').value = c.r; $('mh-g').value = c.g; $('mh-b').value = c.b;
    $('mh-out').innerHTML = `<div class="result">
      <div class="result-row"><span>HEX</span><strong>${c.hex}</strong></div>
      <div class="result-row"><span>RGB</span><strong>${rgbStr}</strong></div>
      <div class="result-row"><span>HSL</span><strong>${hslStr}</strong></div>
    </div>`;
    const rows = $('mh-out').querySelectorAll('.result-row strong');
    [c.hex, rgbStr, hslStr].forEach((t, i) => {
      rows[i].appendChild(document.createTextNode(' '));
      rows[i].appendChild(copyButton(t));
    });
  }

  $('mh-go').addEventListener('click', () => {
    const c = hexToRgb($('mh-hex').value);
    if (!c) { $('mh-out').innerHTML = '<p class="error">Mã HEX không hợp lệ. Nhập dạng #RRGGBB, VD: #1a5276.</p>'; return; }
    show(c);
  });
  $('mh-picker').addEventListener('input', () => {
    const c = hexToRgb($('mh-picker').value);
    if (c) { $('mh-hex').value = c.hex; show(c); }
  });
  $('mh-rgb-go').addEventListener('click', () => {
    const r = +$('mh-r').value, g = +$('mh-g').value, b = +$('mh-b').value;
    if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) {
      $('mh-rgb-out').innerHTML = '<p class="error">R, G, B phải là số từ 0 đến 255.</p>';
      return;
    }
    const hex = rgbToHex(r, g, b);
    $('mh-hex').value = hex;
    $('mh-rgb-out').innerHTML = '';
    show(hexToRgb(hex));
  });

  // Bảng màu gợi ý.
  const PALETTE = [
    ['Navy', '#1a5276'], ['Teal', '#148f77'], ['Vàng', '#f1c40f'], ['Cam', '#e67e22'],
    ['Đỏ', '#c0392b'], ['Xanh lá', '#27ae60'], ['Tím', '#8e44ad'], ['Hồng', '#e91e63'],
    ['Nâu', '#795548'], ['Xám', '#7f8c8d'], ['Đen', '#222222'], ['Trắng', '#ffffff'],
  ];
  $('mh-palette').innerHTML = PALETTE.map(p =>
    `<button type="button" class="chip" data-mh-color="${p[1]}" style="background:${p[1]};color:${p[1] === '#ffffff' || p[1] === '#f1c40f' ? '#222' : '#fff'}">${p[0]} ${p[1]}</button>`
  ).join(' ');
  root.querySelectorAll('[data-mh-color]').forEach(b => {
    b.addEventListener('click', () => {
      $('mh-hex').value = b.getAttribute('data-mh-color');
      show(hexToRgb(b.getAttribute('data-mh-color')));
    });
  });
  show(hexToRgb('#1a5276'));
}
