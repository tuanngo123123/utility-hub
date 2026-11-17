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
        <label for="tdbt-kwh">Số kWh tiêu thụ trong tháng</label>
        <span class="input-unit"><input id="tdbt-kwh" type="text" inputmode="decimal" value="250" placeholder="VD: 250"><span class="unit">kWh</span></span>
        <p class="hint">Xem số kWh trên hóa đơn tiền điện hoặc công tơ tháng này.</p>
      </div>
      <div class="field">
        <label for="tdbt-vat">Thuế VAT (%)</label>
        <input id="tdbt-vat" type="number" min="0" step="0.1" value="8">
        <p class="hint">Điện sinh hoạt chịu VAT 8%.</p>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" id="tdbt-calc">Tính tiền điện</button>
      <button type="button" class="btn btn-ghost" id="tdbt-example">Điền ví dụ</button>
    </div>
    <div id="tdbt-out" class="result" style="display:none"></div>
    <p class="note">Biểu giá chưa VAT theo Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026: bậc 1 (0–100 kWh) 1.901₫; bậc 2 (101–200) 2.289₫; bậc 3 (201–400) 2.894₫; bậc 4 (401–700) 3.456₫; bậc 5 (trên 700) 3.844₫. Điện sinh hoạt chịu VAT 8%.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  // Trợ giúp trải nghiệm (window.UH) + dự phòng khi UH thiếu.
  var markErr = UH.markFieldError || function (el, msg) { var o = root.querySelector('#tdbt-out'); o.style.display = 'block'; o.innerHTML = '<p class="error">' + msg + '</p>'; };
  var clearErrs = UH.clearFieldErrors || function () {};
  var focusEl = UH.focusField || function (el) { if (el) el.focus(); };
  var withBusy = UH.withBusy || function (btn, fn) { fn(); };
  var fillEx = UH.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { var el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  var bindCopy = UH.bindCopyButtons || function () {};
  var escAttr = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); };
  var TIERS = [
    { label: 'Bậc 1 (0–100 kWh)', limit: 100, price: 1901 },
    { label: 'Bậc 2 (101–200 kWh)', limit: 100, price: 2289 },
    { label: 'Bậc 3 (201–400 kWh)', limit: 200, price: 2894 },
    { label: 'Bậc 4 (401–700 kWh)', limit: 300, price: 3456 },
    { label: 'Bậc 5 (trên 700 kWh)', limit: Infinity, price: 3844 }
  ];
  function calc() {
    clearErrs(root);
    var kwhEl = root.querySelector('#tdbt-kwh');
    var vatEl = root.querySelector('#tdbt-vat');
    var kwh = parseNum(kwhEl.value);
    var vatRaw = vatEl.value.trim();
    var out = root.querySelector('#tdbt-out');
    if (isNaN(kwh) || kwh < 0) {
      markErr(kwhEl, 'Ô Số kWh chưa đúng — nhập số từ 0 trở lên, ví dụ 250.');
      focusEl(kwhEl);
      out.style.display = 'none';
      out.innerHTML = '';
      return;
    }
    // VAT để trống thì mặc định 8% (như trước); nhập sai (chữ, số âm) thì báo rõ ô.
    var vatRate = vatRaw === '' ? 8 : parseNum(vatRaw);
    if (isNaN(vatRate) || vatRate < 0) {
      markErr(vatEl, 'Ô Thuế VAT chưa đúng — nhập số từ 0 trở lên, ví dụ 8, hoặc để trống.');
      focusEl(vatEl);
      out.style.display = 'none';
      out.innerHTML = '';
      return;
    }
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
    var copyText = 'Tiền điện ' + fmtNum(kwh, 0) + ' kWh'
      + ' · Trước thuế: ' + fmtVND(subtotal)
      + ' · VAT (' + fmtNum(vatRate) + '%): ' + fmtVND(vat)
      + ' · Tổng thanh toán: ' + fmtVND(total);
    out.style.display = 'block';
    out.innerHTML = '<div class="result-hero"><p class="result-hero-label">Tổng tiền điện phải trả</p>'
      + '<div class="result-hero-value">' + fmtVND(total) + '</div>'
      + '<p class="result-hero-sub">' + fmtNum(kwh, 0) + ' kWh · đã gồm VAT ' + fmtNum(vatRate) + '%</p></div>'
      + '<table class="tbl"><thead><tr><th>Bậc</th><th>kWh</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="result-row"><span>Tổng trước thuế</span><strong>' + fmtVND(subtotal) + '</strong></div>'
      + '<div class="result-row"><span>VAT (' + fmtNum(vatRate) + '%)</span><strong>' + fmtVND(vat) + '</strong></div>'
      + '<div class="result-row"><span>Tổng thanh toán</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<p class="muted">Giá điện bình quân: ' + (kwh > 0 ? fmtVND(total / kwh) + '/kWh (đã gồm VAT)' : '—') + '.</p>'
      + '<div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="' + escAttr(copyText) + '" data-copy-msg="Đã chép kết quả tiền điện">Chép kết quả</button></div>'
      + '<p class="note">Nguồn biểu giá: Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026 (chưa VAT).</p>';
    bindCopy(out);
  }
  function runCalc() { withBusy(root.querySelector('#tdbt-calc'), calc); }
  root.querySelector('#tdbt-calc').addEventListener('click', runCalc);
  root.querySelector('#tdbt-kwh').addEventListener('keydown', function (e) { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: 350 kWh — đi qua 3 bậc giá, thấy rõ cách tính lũy tiến.
  root.querySelector('#tdbt-example').addEventListener('click', function () {
    fillEx(root, { 'tdbt-kwh': '350', 'tdbt-vat': '8' }, root.querySelector('#tdbt-calc'));
  });
  calc();
}
