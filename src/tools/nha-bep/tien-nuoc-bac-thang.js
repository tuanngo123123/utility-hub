export const meta = {
  id: 'tien-nuoc-bac-thang',
  name: 'Tính tiền nước bậc thang',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Tính tiền nước sinh hoạt theo bậc thang lũy tiến, giá từng bậc sửa được theo địa phương, gồm VAT và phí bảo vệ môi trường.',
  keywords: ['tiền nước', 'giá nước', 'bậc thang', 'm3 nước', 'tính tiền nước', 'phí môi trường'],
  icon: '💧',
  seoTitle: 'Tính tiền nước bậc thang — giá nước sinh hoạt theo m³',
  seoDesc: 'Tính tiền nước sinh hoạt theo bậc thang lũy tiến: nhập số m³, sửa giá từng bậc theo địa phương, gồm VAT và phí bảo vệ môi trường.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>💧 Tính tiền nước bậc thang</h2>
      <p class="muted">Nhập số m³ nước đã dùng trong tháng. Giá từng bậc sửa được — mặc định theo giá Hà Nội cho hộ dân cư.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="tn-m3">Số m³ nước đã dùng (tháng)</label>
        <input id="tn-m3" type="number" min="0" step="0.5" value="25" inputmode="decimal">
      </div>
      <div class="field">
        <label for="tn-vat">Thuế VAT (%)</label>
        <input id="tn-vat" type="number" min="0" step="0.1" value="5" inputmode="decimal">
      </div>
      <div class="field">
        <label for="tn-bvmt">Phí bảo vệ môi trường (%)</label>
        <input id="tn-bvmt" type="number" min="0" step="0.1" value="10" inputmode="decimal">
      </div>
    </div>
    <p class="muted">Giá nước từng bậc (₫/m³, chưa VAT và phí môi trường) — sửa theo giá địa phương:</p>
    <div class="grid-2">
      <div class="field">
        <label for="tn-g1">Bậc 1: 0–10 m³ (₫/m³)</label>
        <input id="tn-g1" type="number" min="0" step="1" value="8500" inputmode="numeric">
      </div>
      <div class="field">
        <label for="tn-g2">Bậc 2: trên 10–20 m³ (₫/m³)</label>
        <input id="tn-g2" type="number" min="0" step="1" value="9900" inputmode="numeric">
      </div>
      <div class="field">
        <label for="tn-g3">Bậc 3: trên 20–30 m³ (₫/m³)</label>
        <input id="tn-g3" type="number" min="0" step="1" value="16000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="tn-g4">Bậc 4: trên 30 m³ (₫/m³)</label>
        <input id="tn-g4" type="number" min="0" step="1" value="27000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="tn-calc">Tính tiền nước</button>
    <div id="tn-out" class="result" style="display:none"></div>
    <p class="note">Giá mặc định theo Quyết định 3541/QĐ-UBND của UBND TP Hà Nội (áp dụng từ 01/01/2024 cho hộ dân cư thường; hộ chính sách/hộ nghèo giữ mức 5.973₫/m³ cho 10 m³ đầu). VAT nước sinh hoạt 5%, phí bảo vệ môi trường với nước thải sinh hoạt 10% (Nghị định 53/2020/NĐ-CP). Giá nước mỗi địa phương khác nhau — đối chiếu hóa đơn của bạn và sửa lại cho đúng.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function calc() {
    var m3 = parseNum(root.querySelector('#tn-m3').value);
    var vatRate = parseNum(root.querySelector('#tn-vat').value);
    var bvmtRate = parseNum(root.querySelector('#tn-bvmt').value);
    var out = root.querySelector('#tn-out');
    var prices = [1, 2, 3, 4].map(function (i) { return parseNum(root.querySelector('#tn-g' + i).value); });
    if (isNaN(m3) || m3 < 0 || prices.some(function (p) { return isNaN(p) || p < 0; })) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập số m³ và giá từng bậc hợp lệ (≥ 0).</p>';
      return;
    }
    if (isNaN(vatRate) || vatRate < 0) vatRate = 5;
    if (isNaN(bvmtRate) || bvmtRate < 0) bvmtRate = 10;
    var limits = [10, 10, 10, Infinity];
    var labels = ['Bậc 1 (0–10 m³)', 'Bậc 2 (trên 10–20 m³)', 'Bậc 3 (trên 20–30 m³)', 'Bậc 4 (trên 30 m³)'];
    var remain = m3, subtotal = 0, rows = '';
    for (var i = 0; i < 4; i++) {
      var used = Math.min(remain, limits[i]);
      if (used <= 0) continue;
      var amount = used * prices[i];
      subtotal += amount;
      remain -= used;
      rows += '<tr><td>' + labels[i] + '</td><td>' + fmtNum(used) + '</td><td>' + fmtVND(prices[i]) + '</td><td>' + fmtVND(amount) + '</td></tr>';
    }
    var vat = Math.round(subtotal * vatRate / 100);
    var bvmt = Math.round(subtotal * bvmtRate / 100);
    var total = subtotal + vat + bvmt;
    out.style.display = 'block';
    out.innerHTML = '<table class="tbl"><thead><tr><th>Bậc</th><th>m³</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="result-row"><span>Tiền nước trước thuế, phí</span><strong>' + fmtVND(subtotal) + '</strong></div>'
      + '<div class="result-row"><span>VAT (' + fmtNum(vatRate) + '%)</span><strong>' + fmtVND(vat) + '</strong></div>'
      + '<div class="result-row"><span>Phí bảo vệ môi trường (' + fmtNum(bvmtRate) + '%)</span><strong>' + fmtVND(bvmt) + '</strong></div>'
      + '<div class="result-row"><span>Tổng thanh toán</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<p class="muted">Giá nước bình quân: ' + (m3 > 0 ? fmtVND(total / m3) + '/m³ (đã gồm thuế, phí)' : '—') + '.</p>';
  }
  root.querySelector('#tn-calc').addEventListener('click', calc);
  calc();
}
