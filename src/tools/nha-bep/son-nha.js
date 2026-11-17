export const meta = {
  id: 'son-nha',
  name: 'Tính sơn nhà',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Tính lượng sơn cần mua theo diện tích tường và số lớp sơn, số thùng 18 lít và 5 lít, kèm chi phí ước tính.',
  keywords: ['sơn nhà', 'tính sơn', 'lít sơn', 'thùng sơn', 'diện tích sơn'],
  icon: '🎨',
  seoTitle: 'Tính sơn nhà — cần bao nhiêu lít sơn, bao nhiêu thùng?',
  seoDesc: 'Tính lượng sơn cần mua theo diện tích tường và số lớp: số lít, số thùng 18 lít và 5 lít, chi phí ước tính.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🎨 Tính sơn nhà</h2>
      <p class="muted">Nhập diện tích tường cần sơn để biết cần mua bao nhiêu sơn và hết khoảng bao nhiêu tiền.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="sn-dt">Diện tích tường cần sơn (m²)</label>
        <input id="sn-dt" type="number" min="0" step="0.1" value="100" inputmode="decimal">
      </div>
      <div class="field">
        <label for="sn-lop">Số lớp sơn</label>
        <input id="sn-lop" type="number" min="1" step="1" value="2" inputmode="numeric">
      </div>
      <div class="field">
        <label for="sn-phu">Độ phủ (m²/lít/lớp)</label>
        <input id="sn-phu" type="number" min="1" step="0.5" value="11" inputmode="decimal">
      </div>
      <div class="field">
        <label for="sn-gia18">Giá thùng sơn 18 lít (₫) — sửa theo giá địa phương</label>
        <input id="sn-gia18" type="number" min="0" step="1000" value="1200000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="sn-gia5">Giá thùng sơn 5 lít (₫) — sửa theo giá địa phương</label>
        <input id="sn-gia5" type="number" min="0" step="1000" value="450000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="sn-calc">Tính lượng sơn</button>
    <div id="sn-out" class="result" style="display:none"></div>
    <p class="note">Độ phủ sơn thường khoảng 10–12 m²/lít/lớp tùy hãng và bề mặt tường; tường hút sơn hoặc sơn màu đậm có thể cần nhiều hơn. Giá sơn thay đổi theo hãng và địa phương — sửa theo giá nơi bạn mua.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function calc() {
    var area = parseNum(root.querySelector('#sn-dt').value);
    var coats = parseNum(root.querySelector('#sn-lop').value);
    var cover = parseNum(root.querySelector('#sn-phu').value);
    var p18 = parseNum(root.querySelector('#sn-gia18').value);
    var p5 = parseNum(root.querySelector('#sn-gia5').value);
    var out = root.querySelector('#sn-out');
    if (isNaN(area) || area <= 0 || isNaN(coats) || coats < 1 || isNaN(cover) || cover <= 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập diện tích, số lớp và độ phủ hợp lệ (lớn hơn 0).</p>';
      return;
    }
    var liters = area * coats / cover;
    var n18 = Math.floor(liters / 18);
    var rem = liters - n18 * 18;
    var n5 = 0;
    if (rem > 0.01) {
      if (rem > 15) { n18 += 1; }
      else { n5 = Math.ceil(rem / 5); }
    }
    var totalLiters = n18 * 18 + n5 * 5;
    var html = '<div class="result-row"><span>Lượng sơn cần</span><strong>' + fmtNum(liters) + ' lít</strong></div>'
      + '<div class="result-row"><span>Nên mua</span><strong>' + (n18 > 0 ? n18 + ' thùng 18 lít' : '') + (n18 > 0 && n5 > 0 ? ' + ' : '') + (n5 > 0 ? n5 + ' thùng 5 lít' : '') + '</strong></div>'
      + '<div class="result-row"><span>Tổng sơn mua về</span><strong>' + fmtNum(totalLiters, 0) + ' lít (dư khoảng ' + fmtNum(totalLiters - liters) + ' lít để dặm vá)</strong></div>';
    if (!isNaN(p18) && !isNaN(p5) && (p18 > 0 || p5 > 0)) {
      var cost = n18 * (isNaN(p18) ? 0 : p18) + n5 * (isNaN(p5) ? 0 : p5);
      html += '<div class="result-row"><span>Chi phí sơn ước tính</span><strong>' + fmtVND(cost) + '</strong></div>';
    }
    html += '<p class="muted">Chưa tính sơn lót, bột trét và công thợ. Nên mua dư một ít để dặm vá sau này.</p>';
    out.style.display = 'block';
    out.innerHTML = html;
  }
  root.querySelector('#sn-calc').addEventListener('click', calc);
  calc();
}
