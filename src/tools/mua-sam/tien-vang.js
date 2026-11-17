export const meta = {
  id: 'tien-vang',
  name: 'Tính tiền vàng',
  category: 'Mua sắm',
  categorySlug: 'mua-sam',
  desc: 'Tính tiền vàng theo giá/lượng bạn nhập: đổi lượng ↔ chỉ ↔ phân, tính tiền mua vàng và số vàng mua được với số tiền có sẵn.',
  keywords: ['tiền vàng', 'giá vàng', 'lượng vàng', 'chỉ vàng', 'phân vàng', 'mua vàng'],
  icon: '🥇',
  seoTitle: 'Tính tiền vàng — 1 chỉ, 1 lượng vàng bao nhiêu tiền?',
  seoDesc: 'Tính tiền vàng theo giá/lượng bạn nhập: 1 lượng = 10 chỉ = 100 phân; tính tiền mua vàng và số vàng mua được với số tiền có sẵn.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🥇 Tính tiền vàng</h2>
      <p class="muted">Nhập giá vàng/lượng hiện tại để tính tiền mua vàng theo chỉ/phân/lượng, hoặc tính số vàng mua được với số tiền bạn có.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="tv-gia">Giá vàng 1 lượng (₫) — tự nhập giá hiện tại</label>
        <input id="tv-gia" type="number" min="0" step="1000" value="150000000" inputmode="numeric">
      </div>
    </div>
    <h3>Mua vàng: khối lượng → tiền</h3>
    <div class="grid-2">
      <div class="field">
        <label for="tv-luong">Khối lượng muốn mua</label>
        <input id="tv-luong" type="number" min="0" step="0.1" value="2" inputmode="decimal">
      </div>
      <div class="field">
        <label for="tv-donvi">Đơn vị</label>
        <select id="tv-donvi">
          <option value="luong">Lượng (cây)</option>
          <option value="chi" selected>Chỉ</option>
          <option value="phan">Phân</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" id="tv-calc1">Tính tiền mua vàng</button>
    <div id="tv-out1" class="result" style="display:none"></div>
    <h3>Có tiền: số tiền → mua được bao nhiêu vàng</h3>
    <div class="grid-2">
      <div class="field">
        <label for="tv-tien">Số tiền bạn có (₫)</label>
        <input id="tv-tien" type="number" min="0" step="1000" value="75000000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="tv-calc2">Tính số vàng mua được</button>
    <div id="tv-out2" class="result" style="display:none"></div>
    <p class="note">1 lượng (cây) vàng = 10 chỉ = 100 phân = 37,5 gam; 1 chỉ = 10 phân = 3,75 gam. Giá vàng tự nhập, chỉ mang tính tham khảo — xem giá vàng trực tiếp ở công cụ Giá vàng SJC &amp; tỉ giá trực tiếp. Giá mua vào và bán ra của tiệm vàng thường chênh nhau, nhớ hỏi rõ trước khi giao dịch.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function pricePerLuong() {
    return parseNum(root.querySelector('#tv-gia').value);
  }
  function show(id, html) {
    var el = root.querySelector(id);
    el.style.display = 'block';
    el.innerHTML = html;
  }
  function toLuong(amount, unit) {
    if (unit === 'luong') return amount;
    if (unit === 'chi') return amount / 10;
    return amount / 100;
  }
  root.querySelector('#tv-calc1').addEventListener('click', function () {
    var price = pricePerLuong();
    var amount = parseNum(root.querySelector('#tv-luong').value);
    var unit = root.querySelector('#tv-donvi').value;
    if (isNaN(price) || price <= 0) { show('#tv-out1', '<p class="error">Vui lòng nhập giá vàng 1 lượng (lớn hơn 0).</p>'); return; }
    if (isNaN(amount) || amount < 0) { show('#tv-out1', '<p class="error">Vui lòng nhập khối lượng vàng hợp lệ (≥ 0).</p>'); return; }
    var luong = toLuong(amount, unit);
    var total = luong * price;
    var unitLabel = unit === 'luong' ? 'lượng' : unit === 'chi' ? 'chỉ' : 'phân';
    show('#tv-out1', '<div class="result-row"><span>' + fmtNum(amount) + ' ' + unitLabel + ' vàng</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<div class="result-row"><span>Quy đổi</span><span>' + fmtNum(luong) + ' lượng = ' + fmtNum(luong * 10) + ' chỉ = ' + fmtNum(luong * 100) + ' phân (' + fmtNum(luong * 37.5) + ' gam)</span></div>'
      + '<div class="result-row"><span>Giá 1 chỉ</span><strong>' + fmtVND(price / 10) + '</strong></div>'
      + '<div class="result-row"><span>Giá 1 phân</span><strong>' + fmtVND(price / 100) + '</strong></div>');
  });
  root.querySelector('#tv-calc2').addEventListener('click', function () {
    var price = pricePerLuong();
    var money = parseNum(root.querySelector('#tv-tien').value);
    if (isNaN(price) || price <= 0) { show('#tv-out2', '<p class="error">Vui lòng nhập giá vàng 1 lượng (lớn hơn 0).</p>'); return; }
    if (isNaN(money) || money < 0) { show('#tv-out2', '<p class="error">Vui lòng nhập số tiền hợp lệ (≥ 0).</p>'); return; }
    var luong = money / price;
    show('#tv-out2', '<div class="result-row"><span>' + fmtVND(money) + ' mua được</span><strong>' + fmtNum(luong) + ' lượng</strong></div>'
      + '<div class="result-row"><span>Quy đổi</span><span>' + fmtNum(luong * 10) + ' chỉ = ' + fmtNum(luong * 100) + ' phân (' + fmtNum(luong * 37.5) + ' gam)</span></div>');
  });
}
