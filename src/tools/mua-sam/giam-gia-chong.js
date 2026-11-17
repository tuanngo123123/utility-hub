export const meta = {
  id: 'giam-gia-chong',
  name: 'Tính giảm giá chồng',
  category: 'Mua sắm',
  categorySlug: 'mua-sam',
  desc: 'Tính giá cuối khi giảm giá nhiều lần liên tiếp (giảm % rồi thêm voucher): giảm chồng không cộng dồn phần trăm.',
  keywords: ['giảm giá', 'giảm chồng', 'voucher', 'sale', 'khuyến mãi', 'tính giá cuối'],
  icon: '🏷️',
  seoTitle: 'Tính giảm giá chồng — Giảm 30% rồi 10% không phải 40%',
  seoDesc: 'Tính giá cuối khi giảm giá nhiều lần liên tiếp: giảm 30% rồi thêm voucher 10% thì còn bao nhiêu? Giảm chồng không cộng dồn %.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🏷️ Tính giảm giá chồng</h2>
      <p class="muted">Giảm giá nhiều lần liên tiếp thì mỗi lần giảm tính trên giá đã giảm trước đó — <strong>không cộng dồn %</strong>.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="gg-gia">Giá gốc (₫)</label>
        <input id="gg-gia" type="number" min="0" step="1000" value="1000000" inputmode="numeric">
      </div>
    </div>
    <p class="muted">Các mức giảm liên tiếp (%):</p>
    <div id="gg-rows"></div>
    <button class="btn btn-ghost" id="gg-add">+ Thêm một lần giảm</button>
    <button class="btn btn-primary" id="gg-calc">Tính giá cuối</button>
    <div id="gg-out" class="result" style="display:none"></div>
    <p class="note">Ví dụ: giảm 30% rồi thêm voucher 10% thì tổng giảm là 37% (còn 63% giá gốc), không phải 40% — vì voucher 10% chỉ tính trên giá sau khi đã giảm 30%.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var rowsEl = root.querySelector('#gg-rows');
  function addRow(val) {
    var div = document.createElement('div');
    div.className = 'grid-2';
    div.setAttribute('data-gg-row', '');
    div.innerHTML = '<div class="field"><input type="number" data-gg-pct min="0" max="100" step="0.5" placeholder="VD: 30" value="' + (val == null ? '' : val) + '"></div>'
      + '<button class="btn btn-ghost" data-gg-xoa type="button">Xóa</button>';
    div.querySelector('[data-gg-xoa]').addEventListener('click', function () { div.remove(); });
    rowsEl.appendChild(div);
  }
  addRow(30);
  addRow(10);
  root.querySelector('#gg-add').addEventListener('click', function () { addRow(''); });
  root.querySelector('#gg-calc').addEventListener('click', function () {
    var price = parseNum(root.querySelector('#gg-gia').value);
    var out = root.querySelector('#gg-out');
    if (isNaN(price) || price < 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập giá gốc hợp lệ (≥ 0).</p>';
      return;
    }
    var pcts = [];
    var inputs = rowsEl.querySelectorAll('[data-gg-pct]');
    for (var i = 0; i < inputs.length; i++) {
      var p = parseNum(inputs[i].value);
      if (isNaN(p) || p < 0 || p > 100) {
        out.style.display = 'block';
        out.innerHTML = '<p class="error">Mỗi mức giảm phải từ 0% đến 100%.</p>';
        return;
      }
      pcts.push(p);
    }
    if (pcts.length === 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập ít nhất 1 mức giảm.</p>';
      return;
    }
    var current = price;
    var rows = '';
    pcts.forEach(function (p, idx) {
      var before = current;
      current = current * (1 - p / 100);
      rows += '<tr><td>Lần ' + (idx + 1) + ': giảm ' + fmtNum(p) + '%</td><td>' + fmtVND(before) + '</td><td><strong>' + fmtVND(current) + '</strong></td></tr>';
    });
    var saved = price - current;
    var effective = price > 0 ? saved / price * 100 : 0;
    var sumPct = 0;
    pcts.forEach(function (p) { sumPct += p; });
    out.style.display = 'block';
    out.innerHTML = '<table class="tbl"><thead><tr><th>Lần giảm</th><th>Giá trước</th><th>Giá sau</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="result-row"><span>Giá cuối phải trả</span><strong>' + fmtVND(current) + '</strong></div>'
      + '<div class="result-row"><span>Tổng số tiền đã giảm</span><strong>' + fmtVND(saved) + '</strong></div>'
      + '<div class="result-row"><span>Tỉ lệ giảm thực tế</span><strong>' + fmtNum(effective) + '%</strong></div>'
      + (sumPct !== effective ? '<p class="note">Lưu ý: cộng dồn các mức giảm được ' + fmtNum(sumPct) + '% nhưng thực tế chỉ giảm ' + fmtNum(effective) + '% — vì mỗi lần giảm tính trên giá đã giảm trước đó.</p>' : '');
  });
}
