// Tính tỉ lệ khung hình — rộng × cao → tỉ lệ rút gọn + tính chiều còn lại khi giữ tỉ lệ.
export const meta = {
  id: 'ti-le-khung-hinh',
  name: 'Tính tỉ lệ khung hình',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Nhập chiều rộng và chiều cao để ra tỉ lệ khung hình rút gọn (VD 1920×1080 = 16:9), và tính chiều còn lại khi đổi một chiều.',
  keywords: 'tỉ lệ khung hình, aspect ratio, 16:9, tính tỉ lệ ảnh, resize giữ tỉ lệ',
  icon: '🖼️',
  seoTitle: 'Tính tỉ lệ khung hình — 1920×1080 là 16:9',
  seoDesc: 'Tính tỉ lệ khung hình rút gọn từ chiều rộng × chiều cao, và tính chiều còn lại khi đổi kích thước mà vẫn giữ tỉ lệ.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🖼️</span><div><h2>Tính tỉ lệ khung hình</h2><p class="muted">1920×1080 là 16:9 — nhập kích thước bất kỳ để biết tỉ lệ rút gọn.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="tlk-w">Chiều rộng (px)</label><input id="tlk-w" type="number" min="1" value="1920"></div>
    <div class="field"><label for="tlk-h">Chiều cao (px)</label><input id="tlk-h" type="number" min="1" value="1080"></div>
  </div>
  <button type="button" class="btn btn-primary" id="tlk-calc">Tính tỉ lệ</button>
  <div id="tlk-out"></div>
  <div class="field"><label>Giữ tỉ lệ — đổi một chiều, tính chiều còn lại</label></div>
  <div class="grid-3">
    <div class="field"><label for="tlk-new-w">Rộng mới (px)</label><input id="tlk-new-w" type="number" min="1" placeholder="VD: 1280"></div>
    <div class="field"><label for="tlk-new-h">Cao mới (px)</label><input id="tlk-new-h" type="number" min="1" placeholder="VD: 720"></div>
    <div class="field"><label>&nbsp;</label><button type="button" class="btn btn-ghost" id="tlk-keep">Tính chiều còn lại</button></div>
  </div>
  <div id="tlk-keep-out"></div>
  <p class="note">Tỉ lệ rút gọn dùng ước chung lớn nhất (VD: 1920 và 1080 cùng chia hết cho 120 nên ra 16:9).</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  $('tlk-calc').addEventListener('click', () => {
    const w = Math.round(+$('tlk-w').value), h = Math.round(+$('tlk-h').value);
    if (!(w > 0) || !(h > 0)) { $('tlk-out').innerHTML = '<p class="error">Chiều rộng và chiều cao phải là số lớn hơn 0.</p>'; return; }
    const g = gcd(w, h);
    const rw = w / g, rh = h / g;
    const ratio = (w / h).toFixed(3).replace('.', ',');
    const common = { '16:9': 'chuẩn video Full HD / YouTube', '4:3': 'chuẩn ảnh/TV cũ', '1:1': 'ảnh vuông', '9:16': 'video dọc (Shorts/Reels/TikTok)', '21:9': 'màn hình siêu rộng', '3:2': 'chuẩn máy ảnh phổ biến' };
    const key = rw + ':' + rh;
    $('tlk-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Tỉ lệ rút gọn</span><strong>${rw}:${rh}</strong></div>
      <div class="result-row"><span>Tỉ lệ thập phân</span><strong>${ratio} : 1</strong></div>
      ${common[key] ? '<div class="result-row"><span>Hay dùng cho</span><strong>' + common[key] + '</strong></div>' : ''}
    </div>`;
  });

  $('tlk-keep').addEventListener('click', () => {
    const w = Math.round(+$('tlk-w').value), h = Math.round(+$('tlk-h').value);
    if (!(w > 0) || !(h > 0)) { $('tlk-keep-out').innerHTML = '<p class="error">Nhập chiều rộng và chiều cao gốc ở trên trước.</p>'; return; }
    const nw = +$('tlk-new-w').value, nh = +$('tlk-new-h').value;
    const g = gcd(w, h);
    if (nw > 0 && !(nh > 0)) {
      const newH = Math.round(nw * h / w);
      $('tlk-keep-out').innerHTML = `<div class="result"><div class="result-row"><span>Giữ tỉ lệ ${w / g}:${h / g}</span><strong>Rộng ${nw}px → cao ${newH}px</strong></div></div>`;
    } else if (nh > 0 && !(nw > 0)) {
      const newW = Math.round(nh * w / h);
      $('tlk-keep-out').innerHTML = `<div class="result"><div class="result-row"><span>Giữ tỉ lệ ${w / g}:${h / g}</span><strong>Cao ${nh}px → rộng ${newW}px</strong></div></div>`;
    } else {
      $('tlk-keep-out').innerHTML = '<p class="error">Chỉ nhập một trong hai ô (rộng mới hoặc cao mới) để tính chiều còn lại.</p>';
    }
  });
}
