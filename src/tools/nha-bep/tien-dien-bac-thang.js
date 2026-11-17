export const meta = {
  id: 'tien-dien-bac-thang',
  name: 'Tính tiền điện bậc thang',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Tính tiền điện sinh hoạt theo biểu giá bậc thang lũy tiến mới nhất, gồm VAT 8%, kèm bảng chi tiết từng bậc.',
  keywords: ['tiền điện', 'bậc thang', 'kWh', 'giá điện', 'tính tiền điện', 'VAT điện'],
  icon: '⚡',
  seoTitle: 'Tính tiền điện bậc thang 2026 — biểu giá mới nhất',
  seoDesc: 'Tính tiền điện sinh hoạt theo biểu giá bậc thang lũy tiến (QĐ 2892/QĐ-BCT, từ 01/11/2026) kèm VAT 8%, bảng chi tiết từng bậc.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>⚡ Tính tiền điện bậc thang</h2>
      <p class="muted">Nhập số kWh tiêu thụ trong tháng để tính tiền điện theo biểu giá bậc thang lũy tiến.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="tdbt-kwh">Số kWh tiêu thụ (tháng)</label>
        <input id="tdbt-kwh" type="number" min="0" step="1" value="250" inputmode="decimal">
      </div>
      <div class="field">
        <label for="tdbt-vat">Thuế VAT (%)</label>
        <input id="tdbt-vat" type="number" min="0" step="0.1" value="8">
      </div>
    </div>
    <button class="btn btn-primary" id="tdbt-calc">Tính tiền điện</button>
    <div id="tdbt-out" class="result" style="display:none"></div>
    <p class="note">Biểu giá chưa VAT theo Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026: bậc 1 (0–100 kWh) 1.901₫; bậc 2 (101–200) 2.289₫; bậc 3 (201–400) 2.894₫; bậc 4 (401–700) 3.456₫; bậc 5 (trên 700) 3.844₫. Điện sinh hoạt chịu VAT 8%.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var TIERS = [
    { label: 'Bậc 1 (0–100 kWh)', limit: 100, price: 1901 },
    { label: 'Bậc 2 (101–200 kWh)', limit: 100, price: 2289 },
    { label: 'Bậc 3 (201–400 kWh)', limit: 200, price: 2894 },
    { label: 'Bậc 4 (401–700 kWh)', limit: 300, price: 3456 },
    { label: 'Bậc 5 (trên 700 kWh)', limit: Infinity, price: 3844 }
  ];
  function calc() {
    var kwh = parseNum(root.querySelector('#tdbt-kwh').value);
    var vatRate = parseNum(root.querySelector('#tdbt-vat').value);
    var out = root.querySelector('#tdbt-out');
    if (isNaN(kwh) || kwh < 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập số kWh hợp lệ (≥ 0).</p>';
      return;
    }
    if (isNaN(vatRate) || vatRate < 0) vatRate = 8;
    var remain = kwh, subtotal = 0, rows = '';
    TIERS.forEach(function (t) {
      var used = Math.min(remain, t.limit);
      if (used <= 0) return;
      var amount = used * t.price;
      subtotal += amount;
      remain -= used;
      rows += '<tr><td>' + t.label + '</td><td>' + fmtNum(used, 0) + '</td><td>' + fmtVND(t.price) + '</td><td>' + fmtVND(amount) + '</td></tr>';
    });
    var vat = Math.round(subtotal * vatRate / 100);
    var total = subtotal + vat;
    out.style.display = 'block';
    out.innerHTML = '<table class="tbl"><thead><tr><th>Bậc</th><th>kWh</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="result-row"><span>Tổng trước thuế</span><strong>' + fmtVND(subtotal) + '</strong></div>'
      + '<div class="result-row"><span>VAT (' + fmtNum(vatRate) + '%)</span><strong>' + fmtVND(vat) + '</strong></div>'
      + '<div class="result-row"><span>Tổng thanh toán</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<p class="muted">Giá điện bình quân: ' + (kwh > 0 ? fmtVND(total / kwh) + '/kWh (đã gồm VAT)' : '—') + '.</p>'
      + '<p class="note">Nguồn biểu giá: Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026 (chưa VAT).</p>';
  }
  root.querySelector('#tdbt-calc').addEventListener('click', calc);
  calc();
}
