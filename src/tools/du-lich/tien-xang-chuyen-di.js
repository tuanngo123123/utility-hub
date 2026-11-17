export const meta = {
  id: 'tien-xang-chuyen-di',
  name: 'Tính tiền xăng cho chuyến đi',
  category: 'Du lịch',
  categorySlug: 'du-lich',
  desc: 'Tính lượng xăng cần và tổng tiền xăng cho chuyến đi theo quãng đường, mức tiêu hao và giá xăng hiện tại.',
  keywords: ['tiền xăng', 'xăng xe', 'lít/100km', 'chi phí xăng', 'đi phượt', 'quãng đường'],
  icon: '⛽',
  seoTitle: 'Tính tiền xăng cho chuyến đi — Hết bao nhiêu lít, bao nhiêu tiền?',
  seoDesc: 'Tính tiền xăng cho chuyến đi: nhập quãng đường, mức tiêu hao (lít/100km hoặc km/lít) và giá xăng để biết hết bao nhiêu lít và bao nhiêu tiền.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>⛽ Tính tiền xăng cho chuyến đi</h2>
      <p class="muted">Nhập quãng đường và mức tiêu hao của xe để biết chuyến đi hết bao nhiêu xăng, bao nhiêu tiền.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="tx-km">Quãng đường (km)</label>
        <input id="tx-km" type="number" min="0" step="1" value="300" inputmode="decimal">
      </div>
      <div class="field">
        <label for="tx-chedo">Mức tiêu hao tính theo</label>
        <select id="tx-chedo">
          <option value="l100" selected>Lít / 100 km</option>
          <option value="kml">km/lít</option>
        </select>
      </div>
      <div class="field">
        <label for="tx-tieuhao">Mức tiêu hao</label>
        <input id="tx-tieuhao" type="number" min="0" step="0.1" value="7" inputmode="decimal">
      </div>
      <div class="field">
        <label for="tx-gia">Giá xăng (₫/lít) — nhập giá hiện tại nơi bạn đổ</label>
        <input id="tx-gia" type="number" min="0" step="100" value="" placeholder="VD: 24000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="tx-calc">Tính tiền xăng</button>
    <div id="tx-out" class="result" style="display:none"></div>
    <p class="note">Mức tiêu hao thực tế thay đổi theo đường đi (đèo, kẹt xe), tải trọng và cách chạy xe — số liệu trên là ước tính. Giá xăng thay đổi theo kỳ điều hành, nhớ nhập giá mới nhất.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function calc() {
    var km = parseNum(root.querySelector('#tx-km').value);
    var mode = root.querySelector('#tx-chedo').value;
    var use = parseNum(root.querySelector('#tx-tieuhao').value);
    var price = parseNum(root.querySelector('#tx-gia').value);
    var out = root.querySelector('#tx-out');
    if (isNaN(km) || km <= 0 || isNaN(use) || use <= 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập quãng đường và mức tiêu hao hợp lệ (lớn hơn 0).</p>';
      return;
    }
    if (isNaN(price) || price <= 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập giá xăng hiện tại (₫/lít).</p>';
      return;
    }
    var liters = mode === 'l100' ? km * use / 100 : km / use;
    var total = liters * price;
    out.style.display = 'block';
    out.innerHTML = '<div class="result-row"><span>Lượng xăng cần</span><strong>' + fmtNum(liters) + ' lít</strong></div>'
      + '<div class="result-row"><span>Tổng tiền xăng (1 chiều)</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<div class="result-row"><span>Chi phí mỗi km</span><strong>' + fmtVND(total / km) + '/km</strong></div>'
      + '<div class="result-row"><span>Cả đi và về (' + fmtNum(km * 2, 0) + ' km)</span><strong>' + fmtNum(liters * 2) + ' lít — ' + fmtVND(total * 2) + '</strong></div>';
  }
  root.querySelector('#tx-calc').addEventListener('click', calc);
}
