export const meta = {
  id: 'size-giay-quan-ao',
  name: 'Tra size giày & quần áo',
  category: 'Mua sắm',
  categorySlug: 'mua-sam',
  desc: 'Tra size giày VN/EU/US/UK theo chiều dài bàn chân và size áo/quần S/M/L/XL theo số đo cơ thể, theo bảng phổ biến ở Việt Nam.',
  keywords: ['size giày', 'size áo', 'size quần', 'EU', 'US', 'UK', 'bảng size', 'S M L XL'],
  icon: '👟',
  seoTitle: 'Tra size giày & quần áo — Bảng quy đổi size VN, EU, US, UK',
  seoDesc: 'Tra size giày VN/EU/US/UK theo chiều dài bàn chân (cm) và size áo/quần S/M/L/XL theo vòng ngực, eo, mông.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>👟 Tra size giày &amp; quần áo</h2>
      <p class="muted">Nhập số đo của bạn để tra size theo bảng phổ biến ở Việt Nam. Mỗi hãng có thể lệch — nên đối chiếu bảng size của hãng trước khi đặt.</p>
    </div>
    <h3>Size giày</h3>
    <div class="grid-2">
      <div class="field">
        <label for="sz-chan">Chiều dài bàn chân (cm) — đo từ gót đến ngón dài nhất</label>
        <input id="sz-chan" type="number" min="15" max="35" step="0.1" value="25" inputmode="decimal">
      </div>
    </div>
    <button class="btn btn-primary" id="sz-calc1">Tra size giày</button>
    <div id="sz-out1" class="result" style="display:none"></div>
    <h3>Size áo / quần</h3>
    <div class="grid-3">
      <div class="field">
        <label for="sz-nguc">Vòng ngực (cm)</label>
        <input id="sz-nguc" type="number" min="50" max="150" step="0.5" value="95" inputmode="decimal">
      </div>
      <div class="field">
        <label for="sz-eo">Vòng eo (cm)</label>
        <input id="sz-eo" type="number" min="40" max="150" step="0.5" value="80" inputmode="decimal">
      </div>
      <div class="field">
        <label for="sz-mong">Vòng mông (cm)</label>
        <input id="sz-mong" type="number" min="50" max="160" step="0.5" value="98" inputmode="decimal">
      </div>
    </div>
    <button class="btn btn-primary" id="sz-calc2">Tra size áo / quần</button>
    <div id="sz-out2" class="result" style="display:none"></div>
    <p class="note">Bảng tham khảo phổ biến ở Việt Nam. Size giày VN thường trùng size EU. Size áo/quần mỗi hãng lệch nhau 1–2 cm — khi số đo nằm giữa hai size, nên chọn size lớn hơn nếu thích mặc thoải mái.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var SHOES = [
    { cm: 22.5, eu: 35, usM: '3.5', usW: '5', uk: '2.5' },
    { cm: 23, eu: 36, usM: '4', usW: '5.5', uk: '3' },
    { cm: 23.5, eu: 37, usM: '4.5', usW: '6', uk: '3.5' },
    { cm: 24, eu: 38, usM: '5.5', usW: '7', uk: '4.5' },
    { cm: 24.5, eu: 39, usM: '6', usW: '7.5', uk: '5' },
    { cm: 25, eu: 40, usM: '7', usW: '8.5', uk: '6' },
    { cm: 25.5, eu: 41, usM: '7.5', usW: '9', uk: '6.5' },
    { cm: 26, eu: 42, usM: '8.5', usW: '10', uk: '7.5' },
    { cm: 26.5, eu: 43, usM: '9', usW: '10.5', uk: '8' },
    { cm: 27, eu: 44, usM: '10', usW: '11.5', uk: '9' },
    { cm: 27.5, eu: 45, usM: '10.5', usW: '12', uk: '9.5' },
    { cm: 28, eu: 46, usM: '11.5', usW: '13', uk: '10.5' }
  ];
  var CLOTHES = [
    { size: 'S', chest: [84, 88], waist: [68, 72], hip: [88, 92] },
    { size: 'M', chest: [88, 92], waist: [72, 76], hip: [92, 96] },
    { size: 'L', chest: [92, 97], waist: [76, 82], hip: [96, 101] },
    { size: 'XL', chest: [97, 102], waist: [82, 88], hip: [101, 106] },
    { size: 'XXL', chest: [102, 107], waist: [88, 94], hip: [106, 111] }
  ];
  function show(id, html) {
    var el = root.querySelector(id);
    el.style.display = 'block';
    el.innerHTML = html;
  }
  root.querySelector('#sz-calc1').addEventListener('click', function () {
    var cm = parseNum(root.querySelector('#sz-chan').value);
    if (isNaN(cm) || cm < 15 || cm > 35) {
      show('#sz-out1', '<p class="error">Vui lòng nhập chiều dài bàn chân từ 15 đến 35 cm.</p>');
      return;
    }
    var pick = null;
    for (var i = 0; i < SHOES.length; i++) {
      if (SHOES[i].cm >= cm - 0.05) { pick = SHOES[i]; break; }
    }
    if (!pick) pick = SHOES[SHOES.length - 1];
    var rows = SHOES.map(function (s) {
      return '<tr' + (s === pick ? ' class="tab-active"' : '') + '><td>' + fmtNum(s.cm, 1) + ' cm</td><td>' + s.eu + '</td><td>' + s.usM + '</td><td>' + s.usW + '</td><td>' + s.uk + '</td></tr>';
    }).join('');
    show('#sz-out1', '<div class="result-row"><span>Chân dài ' + fmtNum(cm, 1) + ' cm</span><strong>VN/EU ' + pick.eu + ' — US nam ' + pick.usM + ' — US nữ ' + pick.usW + ' — UK ' + pick.uk + '</strong></div>'
      + '<table class="tbl"><thead><tr><th>Chân (cm)</th><th>VN / EU</th><th>US nam</th><th>US nữ</th><th>UK</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<p class="muted">Nên đo chân vào buổi chiều (chân nở to nhất trong ngày) và cộng thêm khoảng 0,5 cm cho tất và khoảng cử động.</p>');
  });
  function sizeFor(val, key) {
    for (var i = 0; i < CLOTHES.length; i++) {
      if (val <= CLOTHES[i][key][1]) return i;
    }
    return CLOTHES.length - 1;
  }
  root.querySelector('#sz-calc2').addEventListener('click', function () {
    var chest = parseNum(root.querySelector('#sz-nguc').value);
    var waist = parseNum(root.querySelector('#sz-eo').value);
    var hip = parseNum(root.querySelector('#sz-mong').value);
    if (isNaN(chest) || isNaN(waist) || isNaN(hip)) {
      show('#sz-out2', '<p class="error">Vui lòng nhập đủ 3 số đo: ngực, eo, mông.</p>');
      return;
    }
    var sChest = sizeFor(chest, 'chest');
    var sWaist = sizeFor(waist, 'waist');
    var sHip = sizeFor(hip, 'hip');
    var shirtIdx = sChest;
    var pantsIdx = Math.max(sWaist, sHip);
    var rows = CLOTHES.map(function (c) {
      return '<tr><td>' + c.size + '</td><td>' + c.chest[0] + '–' + c.chest[1] + '</td><td>' + c.waist[0] + '–' + c.waist[1] + '</td><td>' + c.hip[0] + '–' + c.hip[1] + '</td></tr>';
    }).join('');
    show('#sz-out2', '<div class="result-row"><span>Size áo gợi ý (theo vòng ngực)</span><strong>' + CLOTHES[shirtIdx].size + '</strong></div>'
      + '<div class="result-row"><span>Size quần gợi ý (theo eo/mông, lấy size lớn hơn)</span><strong>' + CLOTHES[pantsIdx].size + '</strong></div>'
      + '<table class="tbl"><thead><tr><th>Size</th><th>Ngực (cm)</th><th>Eo (cm)</th><th>Mông (cm)</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + (sChest !== sWaist || sWaist !== sHip ? '<p class="muted">Ba số đo rơi vào các size khác nhau — nên chọn theo số đo lớn nhất để mặc vừa, hoặc thử trực tiếp nếu mua tại cửa hàng.</p>' : ''));
  });
}
