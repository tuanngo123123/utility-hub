// Đổi đơn vị nhanh — độ dài, khối lượng (yến/tạ), diện tích (sào/mẫu), dung lượng, nhiệt độ, thể tích.
export const meta = {
  id: 'doi-don-vi-nhanh',
  name: 'Đổi đơn vị nhanh',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Đổi độ dài, khối lượng (cả yến, tạ), diện tích (sào, mẫu Bắc Bộ), dung lượng, nhiệt độ và thể tích.',
  keywords: 'đổi đơn vị, 1 yến bằng bao nhiêu kg, 1 sào bao nhiêu m², đổi độ F sang độ C, đổi inch sang cm',
  icon: '📏',
  seoTitle: 'Đổi đơn vị nhanh — Yến, tạ, sào, mẫu, độ F, inch',
  seoDesc: 'Đổi nhanh độ dài, khối lượng (yến, tạ, tấn), diện tích (sào, mẫu, hecta), dung lượng, nhiệt độ và thể tích.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📏</span><div><h2>Đổi đơn vị nhanh</h2><p class="muted">Đổi độ dài, khối lượng, diện tích, dung lượng, nhiệt độ, thể tích — có cả yến, tạ, sào, mẫu.</p></div></div>
  <div class="field"><label for="ddv-cat">Loại đơn vị</label><select id="ddv-cat">
    <option value="length">Độ dài</option>
    <option value="mass">Khối lượng</option>
    <option value="area">Diện tích</option>
    <option value="data">Dung lượng</option>
    <option value="temp">Nhiệt độ</option>
    <option value="volume">Thể tích</option>
  </select></div>
  <div class="grid-3">
    <div class="field"><label for="ddv-val">Giá trị</label><input id="ddv-val" type="text" inputmode="decimal" value="1"></div>
    <div class="field"><label for="ddv-from">Từ đơn vị</label><select id="ddv-from"></select></div>
    <div class="field"><label for="ddv-to">Sang đơn vị</label><select id="ddv-to"></select></div>
  </div>
  <div>
    <button type="button" class="btn btn-primary" id="ddv-calc">Đổi</button>
    <button type="button" class="btn btn-ghost" id="ddv-swap">Đổi chiều ⇄</button>
  </div>
  <div id="ddv-out"></div>
  <p class="note">Quy ước Việt Nam: 1 yến = 10 kg, 1 tạ = 100 kg, 1 sào Bắc Bộ = 360 m², 1 mẫu = 10 sào = 3.600 m².</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; });
  const $ = id => root.querySelector('#' + id);
  // Hệ số quy về đơn vị gốc của từng nhóm.
  const GROUPS = {
    length: { base: 'm', units: [['mm', 'Milimét (mm)', 0.001], ['cm', 'Xentimét (cm)', 0.01], ['m', 'Mét (m)', 1], ['km', 'Kilômét (km)', 1000], ['inch', 'Inch (in)', 0.0254], ['feet', 'Feet (ft)', 0.3048], ['mile', 'Dặm (mile)', 1609.344]] },
    mass: { base: 'kg', units: [['g', 'Gam (g)', 0.001], ['kg', 'Kilôgam (kg)', 1], ['yen', 'Yến (10 kg)', 10], ['ta', 'Tạ (100 kg)', 100], ['tan', 'Tấn', 1000]] },
    area: { base: 'm2', units: [['m2', 'Mét vuông (m²)', 1], ['sao', 'Sào Bắc Bộ (360 m²)', 360], ['mau', 'Mẫu (3.600 m²)', 3600], ['ha', 'Hecta (10.000 m²)', 10000]] },
    data: { base: 'MB', units: [['KB', 'Kilobyte (KB)', 1 / 1024], ['MB', 'Megabyte (MB)', 1], ['GB', 'Gigabyte (GB)', 1024], ['TB', 'Terabyte (TB)', 1024 * 1024]] },
    volume: { base: 'l', units: [['ml', 'Mililít (ml)', 0.001], ['l', 'Lít (l)', 1]] },
    temp: { base: 'C', units: [['C', 'Độ C (°C)', 0], ['F', 'Độ F (°F)', 0], ['K', 'Kelvin (K)', 0]] },
  };

  function fillSelects() {
    const g = GROUPS[$('ddv-cat').value];
    const opts = g.units.map(u => `<option value="${u[0]}">${u[1]}</option>`).join('');
    $('ddv-from').innerHTML = opts;
    $('ddv-to').innerHTML = opts;
    // Mặc định chọn cặp hay dùng.
    const def = { length: ['m', 'cm'], mass: ['yen', 'kg'], area: ['sao', 'm2'], data: ['GB', 'MB'], temp: ['F', 'C'], volume: ['l', 'ml'] };
    const d = def[$('ddv-cat').value];
    if (d) { $('ddv-from').value = d[0]; $('ddv-to').value = d[1]; }
    $('ddv-out').innerHTML = '';
  }

  function convertTemp(v, from, to) {
    let c;
    if (from === 'C') c = v;
    else if (from === 'F') c = (v - 32) * 5 / 9;
    else c = v - 273.15;
    if (to === 'C') return c;
    if (to === 'F') return c * 9 / 5 + 32;
    return c + 273.15;
  }
  function fmt(n) {
    if (Math.abs(n) >= 1e12 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4).replace('.', ',');
    const r = Math.round(n * 1000000) / 1000000;
    return r.toLocaleString('vi-VN', { maximumFractionDigits: 6 });
  }

  $('ddv-cat').addEventListener('change', fillSelects);
  $('ddv-swap').addEventListener('click', () => {
    const f = $('ddv-from').value;
    $('ddv-from').value = $('ddv-to').value;
    $('ddv-to').value = f;
    $('ddv-calc').click();
  });
  $('ddv-calc').addEventListener('click', () => {
    const cat = $('ddv-cat').value;
    const g = GROUPS[cat];
    const v = parseNum($('ddv-val').value);
    if (isNaN(v)) { $('ddv-out').innerHTML = '<p class="error">Vui lòng nhập giá trị là số.</p>'; return; }
    const from = $('ddv-from').value, to = $('ddv-to').value;
    let out;
    if (cat === 'temp') {
      out = convertTemp(v, from, to);
    } else {
      const fu = g.units.find(u => u[0] === from);
      const tu = g.units.find(u => u[0] === to);
      out = v * fu[2] / tu[2];
    }
    const fromLabel = g.units.find(u => u[0] === from)[1];
    const toLabel = g.units.find(u => u[0] === to)[1];
    $('ddv-out').innerHTML = `<div class="result"><div class="result-row"><span>${fmt(v)} ${fromLabel}</span><strong>= ${fmt(out)} ${toLabel}</strong></div></div>`;
  });

  fillSelects();
}
