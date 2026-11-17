// Tính phần trăm & giá sau giảm — 4 phép tính.
export const meta = {
  id: 'phan-tram',
  name: 'Tính phần trăm & giá sau giảm',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Bốn phép tính phần trăm thường dùng: X là bao nhiêu % của Y, X% của Y là bao nhiêu, tăng/giảm bao nhiêu %, và giá sau khi giảm nhiều lần.',
  keywords: 'tính phần trăm, phần trăm của, tăng bao nhiêu phần trăm, giá sau giảm, giảm giá nhiều lần',
  icon: '🔢',
  seoTitle: 'Tính phần trăm & giá sau giảm — 4 phép tính thường dùng',
  seoDesc: 'Tính X là bao nhiêu % của Y, X% của Y, phần trăm tăng/giảm, và giá sau khi giảm giá nhiều lần. Tính ngay, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="pt-tab-1">X là bao nhiêu % của Y</button>
      <button type="button" class="tab" id="pt-tab-2">X% của Y</button>
      <button type="button" class="tab" id="pt-tab-3">Tăng/giảm %</button>
      <button type="button" class="tab" id="pt-tab-4">Giá sau giảm</button>
    </div>
  </div>

  <div id="pt-pane-1">
    <div class="grid-2">
      <div class="field"><label for="pt-1x">X</label><input id="pt-1x" type="text" inputmode="decimal" value="25"></div>
      <div class="field"><label for="pt-1y">Y</label><input id="pt-1y" type="text" inputmode="decimal" value="200"></div>
    </div>
    <button type="button" class="btn btn-primary" id="pt-1calc">Tính</button>
    <div id="pt-1out"></div>
  </div>

  <div id="pt-pane-2" style="display:none">
    <div class="grid-2">
      <div class="field"><label for="pt-2x">X (%)</label><input id="pt-2x" type="text" inputmode="decimal" value="15"></div>
      <div class="field"><label for="pt-2y">Y</label><input id="pt-2y" type="text" inputmode="decimal" value="200.000"></div>
    </div>
    <button type="button" class="btn btn-primary" id="pt-2calc">Tính</button>
    <div id="pt-2out"></div>
  </div>

  <div id="pt-pane-3" style="display:none">
    <div class="grid-2">
      <div class="field"><label for="pt-3a">Giá trị ban đầu (A)</label><input id="pt-3a" type="text" inputmode="decimal" value="100"></div>
      <div class="field"><label for="pt-3b">Giá trị sau (B)</label><input id="pt-3b" type="text" inputmode="decimal" value="120"></div>
    </div>
    <button type="button" class="btn btn-primary" id="pt-3calc">Tính</button>
    <div id="pt-3out"></div>
  </div>

  <div id="pt-pane-4" style="display:none">
    <div class="grid-2">
      <div class="field"><label for="pt-4price">Giá gốc (₫)</label><input id="pt-4price" type="text" inputmode="decimal" value="500.000"></div>
      <div class="field"><label for="pt-4disc">Các lần giảm (%) — cách nhau bằng dấu phẩy</label><input id="pt-4disc" type="text" inputmode="decimal" value="20, 10" placeholder="VD: 20, 10"></div>
    </div>
    <button type="button" class="btn btn-primary" id="pt-4calc">Tính</button>
    <div id="pt-4out"></div>
    <p class="note">Giảm nhiều lần tính nối tiếp: giảm 20% rồi giảm 10% trên giá đã giảm (không phải giảm 30% một lúc).</p>
  </div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  function fmtPct(n) {
    // Hiển thị % gọn: 12,5 thay vì 12.5000000001
    return (Math.round(n * 100) / 100).toLocaleString('vi-VN');
  }
  function fmtVal(n) {
    return Number.isInteger(n) ? fmtNum(n) : n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  }

  ['1', '2', '3', '4'].forEach(k => {
    $('pt-tab-' + k).addEventListener('click', () => {
      ['1', '2', '3', '4'].forEach(j => {
        $('pt-tab-' + j).classList.toggle('tab-active', j === k);
        $('pt-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });

  $('pt-1calc').addEventListener('click', () => {
    const x = parseNum($('pt-1x').value), y = parseNum($('pt-1y').value);
    if (y === 0) { $('pt-1out').innerHTML = '<p class="error">Y phải khác 0.</p>'; return; }
    $('pt-1out').innerHTML = `<div class="result"><div class="result-row"><span>${fmtVal(x)} là</span><strong>${fmtPct(x / y * 100)}% của ${fmtVal(y)}</strong></div></div>`;
  });

  $('pt-2calc').addEventListener('click', () => {
    const x = parseNum($('pt-2x').value), y = parseNum($('pt-2y').value);
    $('pt-2out').innerHTML = `<div class="result"><div class="result-row"><span>${fmtPct(x)}% của ${fmtVal(y)} là</span><strong>${fmtVal(x / 100 * y)}</strong></div></div>`;
  });

  $('pt-3calc').addEventListener('click', () => {
    const a = parseNum($('pt-3a').value), b = parseNum($('pt-3b').value);
    if (a === 0) { $('pt-3out').innerHTML = '<p class="error">Giá trị ban đầu phải khác 0.</p>'; return; }
    const pct = (b - a) / Math.abs(a) * 100;
    const dir = pct > 0 ? 'Tăng' : pct < 0 ? 'Giảm' : 'Không đổi';
    $('pt-3out').innerHTML = `<div class="result">
      <div class="result-row"><span>Thay đổi</span><strong>${dir} ${fmtPct(Math.abs(pct))}%</strong></div>
      <div class="result-row"><span>Chênh lệch tuyệt đối</span><strong>${fmtVal(b - a)}</strong></div>
    </div>`;
  });

  $('pt-4calc').addEventListener('click', () => {
    const price = parseNum($('pt-4price').value);
    const discs = $('pt-4disc').value.split(',').map(s => parseFloat(s.trim().replace('%', ''))).filter(n => !isNaN(n) && n >= 0 && n <= 100);
    if (!(price > 0)) { $('pt-4out').innerHTML = '<p class="error">Vui lòng nhập giá gốc lớn hơn 0.</p>'; return; }
    if (!discs.length) { $('pt-4out').innerHTML = '<p class="error">Vui lòng nhập ít nhất một mức giảm (0–100%).</p>'; return; }
    let cur = price;
    const steps = discs.map(d => { const before = cur; cur = cur * (1 - d / 100); return { d, before, after: cur }; });
    $('pt-4out').innerHTML = `<div class="result">
      <div class="result-row"><span>Giá gốc</span><strong>${fmtVND(price)}</strong></div>
      ${steps.map(s => `<div class="result-row"><span>Giảm ${fmtPct(s.d)}% (từ ${fmtVND(s.before)})</span><strong>${fmtVND(s.after)}</strong></div>`).join('')}
      <div class="result-row"><span>Giá sau cùng</span><strong>${fmtVND(cur)}</strong></div>
      <div class="result-row"><span>Tổng tiết kiệm</span><strong>${fmtVND(price - cur)} (${fmtPct((price - cur) / price * 100)}%)</strong></div>
    </div>`;
  });
}
