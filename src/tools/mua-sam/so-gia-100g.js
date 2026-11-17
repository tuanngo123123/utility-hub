export const meta = {
  id: 'so-gia-100g',
  name: 'So sánh giá theo 100g',
  category: 'Mua sắm',
  categorySlug: 'mua-sam',
  desc: 'So sánh giá nhiều sản phẩm theo giá/100g (hoặc /100ml) để biết món nào thật sự rẻ nhất, không bị lừa bởi gói to.',
  keywords: ['so sánh giá', 'giá 100g', 'giá rẻ nhất', 'mua sắm', 'đơn giá'],
  icon: '⚖️',
  seoTitle: 'So sánh giá theo 100g — Món nào thật sự rẻ nhất?',
  seoDesc: 'Nhập giá và khối lượng nhiều sản phẩm để so sánh giá/100g (hoặc /100ml) — biết ngay món nào rẻ nhất, không bị gói to đánh lừa.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>⚖️ So sánh giá theo 100g</h2>
      <p class="muted">Gói to chưa chắc rẻ hơn — nhập giá và khối lượng từng món để so sánh theo giá/100g (hoặc /100ml).</p>
    </div>
    <p class="muted">Sản phẩm (thêm/bớt dòng tùy ý):</p>
    <div id="sg-rows"></div>
    <button class="btn btn-ghost" id="sg-add">+ Thêm sản phẩm</button>
    <button class="btn btn-primary" id="sg-calc">So sánh</button>
    <div id="sg-out" class="result" style="display:none"></div>
    <p class="note">Sản phẩm cân theo gam/kg so theo giá/100g; sản phẩm đong theo ml/lít so theo giá/100ml — hai nhóm so riêng với nhau.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var rowsEl = root.querySelector('#sg-rows');
  function unitOptions(selected) {
    return ['g', 'kg', 'ml', 'lít'].map(function (u) { return '<option value="' + u + '"' + (u === selected ? ' selected' : '') + '>' + u + '</option>'; }).join('');
  }
  function addRow(name, price, amount, unit) {
    var div = document.createElement('div');
    div.className = 'grid-3';
    div.setAttribute('data-sg-row', '');
    div.innerHTML = '<div class="field"><input type="text" data-sg-ten placeholder="Tên sản phẩm" value="' + (name || '') + '"></div>'
      + '<div class="field"><input type="number" data-sg-gia min="0" step="100" placeholder="Giá (₫)" value="' + (price == null ? '' : price) + '"></div>'
      + '<div class="field"><input type="number" data-sg-luong min="0" step="0.1" placeholder="Khối lượng" value="' + (amount == null ? '' : amount) + '"></div>'
      + '<div class="field"><select data-sg-donvi>' + unitOptions(unit || 'g') + '</select></div>'
      + '<button class="btn btn-ghost" data-sg-xoa type="button">Xóa</button>';
    div.querySelector('[data-sg-xoa]').addEventListener('click', function () { div.remove(); });
    rowsEl.appendChild(div);
  }
  addRow('Gạo A', 50000, 500, 'g');
  addRow('Gạo B', 90000, 1, 'kg');
  root.querySelector('#sg-add').addEventListener('click', function () { addRow('', '', '', 'g'); });
  root.querySelector('#sg-calc').addEventListener('click', function () {
    var out = root.querySelector('#sg-out');
    var items = [];
    var rowEls = rowsEl.querySelectorAll('[data-sg-row]');
    for (var i = 0; i < rowEls.length; i++) {
      var name = rowEls[i].querySelector('[data-sg-ten]').value.trim();
      var price = parseNum(rowEls[i].querySelector('[data-sg-gia]').value);
      var amount = parseNum(rowEls[i].querySelector('[data-sg-luong]').value);
      var unit = rowEls[i].querySelector('[data-sg-donvi]').value;
      if (!name || isNaN(price) || price < 0 || isNaN(amount) || amount <= 0) continue;
      var base = (unit === 'g' || unit === 'kg') ? 'g' : 'ml';
      var inBase = unit === 'kg' ? amount * 1000 : unit === 'lít' ? amount * 1000 : amount;
      items.push({ name: name, price: price, amount: amount, unit: unit, base: base, per100: price / inBase * 100 });
    }
    if (items.length < 2) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập ít nhất 2 sản phẩm có tên, giá và khối lượng hợp lệ.</p>';
      return;
    }
    var cheapest = { g: null, ml: null };
    items.forEach(function (it) {
      if (!cheapest[it.base] || it.per100 < cheapest[it.base].per100) cheapest[it.base] = it;
    });
    var rows = '';
    items.forEach(function (it) {
      var isBest = cheapest[it.base] === it;
      rows += '<tr><td>' + it.name + (isBest ? ' <span class="chip">Rẻ nhất</span>' : '') + '</td><td>' + fmtVND(it.price) + ' / ' + fmtNum(it.amount) + ' ' + it.unit + '</td><td><strong>' + fmtVND(it.per100) + ' / 100' + it.base + '</strong></td></tr>';
    });
    out.style.display = 'block';
    out.innerHTML = '<table class="tbl"><thead><tr><th>Sản phẩm</th><th>Giá / khối lượng</th><th>Giá mỗi 100g (100ml)</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<p class="muted">Món rẻ nhất được đánh dấu theo từng nhóm (nhóm cân gam/kg và nhóm đong ml/lít so riêng).</p>';
  });
}
