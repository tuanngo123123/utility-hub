export const meta = {
  id: 'nhan-chia-khau-phan',
  name: 'Nhân chia khẩu phần nấu ăn',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Nhân/chia công thức nấu ăn theo số người: nhập nguyên liệu gốc và số người mới để có lượng nguyên liệu mới theo tỷ lệ.',
  keywords: ['khẩu phần', 'nhân công thức', 'chia công thức', 'số người', 'nguyên liệu', 'nấu ăn'],
  icon: '🍲',
  seoTitle: 'Nhân chia khẩu phần nấu ăn theo số người',
  seoDesc: 'Công thức 4 người mà nấu cho 6 người thì cần bao nhiêu nguyên liệu? Nhập công thức gốc, đổi số người là có lượng mới theo tỷ lệ.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🍲 Nhân chia khẩu phần nấu ăn</h2>
      <p class="muted">Nhập công thức gốc (số người + từng nguyên liệu), đổi sang số người mới — lượng nguyên liệu tự tính theo tỷ lệ.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="nckp-cu">Số người của công thức gốc</label>
        <input id="nckp-cu" type="number" min="1" step="1" value="4" inputmode="numeric">
      </div>
      <div class="field">
        <label for="nckp-moi">Số người muốn nấu</label>
        <input id="nckp-moi" type="number" min="1" step="1" value="6" inputmode="numeric">
      </div>
    </div>
    <p class="muted">Nguyên liệu (thêm/bớt dòng tùy ý):</p>
    <div id="nckp-rows"></div>
    <button class="btn btn-ghost" id="nckp-add">+ Thêm nguyên liệu</button>
    <button class="btn btn-primary" id="nckp-calc">Tính khẩu phần mới</button>
    <div id="nckp-out" class="result" style="display:none"></div>
    <p class="note">Gia vị (muối, đường, nước mắm…) nên nêm nếm lại theo khẩu vị sau khi nhân tỷ lệ — không nên nhân đúng 100% với món nêm nếm đậm. Số lượng đếm theo cái/quả làm tròn theo thực tế khi mua.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var rowsEl = root.querySelector('#nckp-rows');
  var UNITS = ['g', 'kg', 'ml', 'lít', 'cái', 'quả', 'muỗng canh', 'muỗng cà phê', 'cup', 'nhúm'];
  function unitOptions(selected) {
    return UNITS.map(function (u) { return '<option value="' + u + '"' + (u === selected ? ' selected' : '') + '>' + u + '</option>'; }).join('');
  }
  function addRow(name, amount, unit) {
    var div = document.createElement('div');
    div.className = 'grid-3';
    div.setAttribute('data-nckp-row', '');
    div.innerHTML = '<div class="field"><input type="text" data-nckp-ten placeholder="Tên nguyên liệu" value="' + (name || '') + '"></div>'
      + '<div class="field"><input type="number" data-nckp-luong min="0" step="0.1" placeholder="Lượng" value="' + (amount == null ? '' : amount) + '"></div>'
      + '<div class="field"><select data-nckp-donvi>' + unitOptions(unit || 'g') + '</select></div>'
      + '<button class="btn btn-ghost" data-nckp-xoa type="button">Xóa</button>';
    div.querySelector('[data-nckp-xoa]').addEventListener('click', function () { div.remove(); });
    rowsEl.appendChild(div);
  }
  addRow('Gạo', 400, 'g');
  addRow('Thịt', 300, 'g');
  addRow('Rau', 200, 'g');
  addRow('Nước mắm', 3, 'muỗng canh');
  root.querySelector('#nckp-add').addEventListener('click', function () { addRow('', '', 'g'); });
  function fmtAmount(n) {
    var r = Math.round(n * 10) / 10;
    return fmtNum(r, 1);
  }
  root.querySelector('#nckp-calc').addEventListener('click', function () {
    var oldP = parseNum(root.querySelector('#nckp-cu').value);
    var newP = parseNum(root.querySelector('#nckp-moi').value);
    var out = root.querySelector('#nckp-out');
    if (isNaN(oldP) || oldP < 1 || isNaN(newP) || newP < 1) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập số người hợp lệ (≥ 1).</p>';
      return;
    }
    var ratio = newP / oldP;
    var rows = '';
    var count = 0;
    var rowEls = rowsEl.querySelectorAll('[data-nckp-row]');
    for (var i = 0; i < rowEls.length; i++) {
      var name = rowEls[i].querySelector('[data-nckp-ten]').value.trim();
      var amount = parseNum(rowEls[i].querySelector('[data-nckp-luong]').value);
      var unit = rowEls[i].querySelector('[data-nckp-donvi]').value;
      if (!name || isNaN(amount) || amount < 0) continue;
      count++;
      rows += '<tr><td>' + name + '</td><td>' + fmtAmount(amount) + ' ' + unit + '</td><td><strong>' + fmtAmount(amount * ratio) + ' ' + unit + '</strong></td></tr>';
    }
    if (count === 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập ít nhất 1 nguyên liệu có tên và lượng hợp lệ.</p>';
      return;
    }
    out.style.display = 'block';
    out.innerHTML = '<p>Tỷ lệ nhân: <strong>' + fmtNum(ratio) + '×</strong> (' + fmtNum(oldP, 0) + ' người → ' + fmtNum(newP, 0) + ' người)</p>'
      + '<table class="tbl"><thead><tr><th>Nguyên liệu</th><th>Công thức gốc</th><th>Khẩu phần mới</th></tr></thead><tbody>' + rows + '</tbody></table>';
  });
}
