export const meta = {
  id: 'dat-dai',
  name: 'Đổi đơn vị đất đai',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Đổi m² ↔ sào Bắc Bộ, sào Trung Bộ, công/mẫu Nam Bộ, hecta; tính tổng giá trị lô đất theo giá tiền/m².',
  keywords: ['sào', 'mẫu', 'công đất', 'hecta', 'm2', 'đổi đơn vị đất', 'giá đất'],
  icon: '🌾',
  seoTitle: 'Đổi đơn vị đất đai — sào, mẫu, công, hecta sang m²',
  seoDesc: 'Đổi 1 sào Bắc Bộ (360 m²), sào Trung Bộ (500 m²), công/mẫu Nam Bộ, hecta sang m² và ngược lại; tính tổng giá trị lô đất.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🌾 Đổi đơn vị đất đai</h2>
      <p class="muted">Đổi qua lại giữa m², sào, mẫu, công, hecta — và tính giá trị lô đất theo giá tiền/m².</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="dd-so">Diện tích</label>
        <input id="dd-so" type="number" min="0" step="0.01" value="1" inputmode="decimal">
      </div>
      <div class="field">
        <label for="dd-donvi">Đơn vị của diện tích trên</label>
        <select id="dd-donvi">
          <option value="1">m²</option>
          <option value="360" selected>Sào Bắc Bộ (360 m²)</option>
          <option value="3600">Mẫu Bắc Bộ (3.600 m²)</option>
          <option value="500">Sào Trung Bộ (500 m²)</option>
          <option value="5000">Mẫu Trung Bộ (5.000 m²)</option>
          <option value="1000">Công Nam Bộ (1.000 m²)</option>
          <option value="10000">Mẫu Nam Bộ / hecta (10.000 m²)</option>
        </select>
      </div>
      <div class="field">
        <label for="dd-gia">Giá tiền mỗi m² (₫) — để trống nếu chỉ cần đổi đơn vị</label>
        <input id="dd-gia" type="number" min="0" step="1000" value="" placeholder="Ví dụ: 50000000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="dd-calc">Đổi đơn vị</button>
    <div id="dd-out" class="result" style="display:none"></div>
    <p class="note">Quy đổi chuẩn: 1 sào Bắc Bộ = 360 m²; 1 sào Trung Bộ = 500 m²; 1 công Nam Bộ = 1.000 m²; 1 mẫu = 10 sào (Bắc Bộ 3.600 m², Trung Bộ 5.000 m², Nam Bộ 10.000 m²); 1 hecta = 10.000 m². Giá đất thay đổi theo khu vực — sửa theo giá địa phương.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var UNITS = [
    { label: 'm²', m2: 1 },
    { label: 'Sào Bắc Bộ', m2: 360 },
    { label: 'Mẫu Bắc Bộ', m2: 3600 },
    { label: 'Sào Trung Bộ', m2: 500 },
    { label: 'Mẫu Trung Bộ', m2: 5000 },
    { label: 'Công Nam Bộ', m2: 1000 },
    { label: 'Mẫu Nam Bộ', m2: 10000 },
    { label: 'Hecta (ha)', m2: 10000 }
  ];
  function calc() {
    var val = parseNum(root.querySelector('#dd-so').value);
    var unit = parseNum(root.querySelector('#dd-donvi').value);
    var price = parseNum(root.querySelector('#dd-gia').value);
    var out = root.querySelector('#dd-out');
    if (isNaN(val) || val < 0 || isNaN(unit) || unit <= 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập diện tích hợp lệ (≥ 0).</p>';
      return;
    }
    var m2 = val * unit;
    var rows = '';
    UNITS.forEach(function (u) {
      rows += '<tr><td>' + u.label + '</td><td>' + fmtNum(m2 / u.m2, 4) + '</td></tr>';
    });
    var html = '<table class="tbl"><thead><tr><th>Đơn vị</th><th>Diện tích tương đương</th></tr></thead><tbody>' + rows + '</tbody></table>';
    if (!isNaN(price) && price > 0) {
      html += '<div class="result-row"><span>Tổng giá trị lô đất (' + fmtNum(m2) + ' m²)</span><strong>' + fmtVND(m2 * price) + '</strong></div>';
    }
    out.style.display = 'block';
    out.innerHTML = html;
  }
  root.querySelector('#dd-calc').addEventListener('click', calc);
  calc();
}
