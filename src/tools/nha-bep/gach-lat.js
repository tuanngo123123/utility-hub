export const meta = {
  id: 'gach-lat',
  name: 'Tính gạch lát nền',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Tính số viên gạch lát nền cần mua theo diện tích sàn và kích thước gạch, đã cộng 5% hao hụt, kèm số thùng và chi phí.',
  keywords: ['gạch lát', 'gạch nền', 'tính gạch', 'lát sàn', 'viên gạch'],
  icon: '🧱',
  seoTitle: 'Tính gạch lát nền — cần bao nhiêu viên, bao nhiêu thùng?',
  seoDesc: 'Tính số viên gạch lát nền cần mua theo diện tích sàn và kích thước viên gạch, đã cộng 5% hao hụt, kèm số thùng và chi phí ước tính.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🧱 Tính gạch lát nền</h2>
      <p class="muted">Nhập diện tích sàn và kích thước gạch để biết cần mua bao nhiêu viên, bao nhiêu thùng.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="gl-dt">Diện tích sàn (m²)</label>
        <input id="gl-dt" type="number" min="0" step="0.1" value="20" inputmode="decimal">
      </div>
      <div class="field">
        <label for="gl-size">Kích thước viên gạch</label>
        <select id="gl-size">
          <option value="60x60" selected>60 × 60 cm</option>
          <option value="80x80">80 × 80 cm</option>
          <option value="30x60">30 × 60 cm</option>
          <option value="40x40">40 × 40 cm</option>
          <option value="30x30">30 × 30 cm</option>
          <option value="50x50">50 × 50 cm</option>
          <option value="custom">Kích thước khác…</option>
        </select>
      </div>
      <div class="field" id="gl-custom" style="display:none">
        <label for="gl-rong">Chiều rộng viên gạch (cm)</label>
        <input id="gl-rong" type="number" min="1" step="0.5" value="60" inputmode="decimal">
      </div>
      <div class="field" id="gl-custom2" style="display:none">
        <label for="gl-dai">Chiều dài viên gạch (cm)</label>
        <input id="gl-dai" type="number" min="1" step="0.5" value="60" inputmode="decimal">
      </div>
      <div class="field">
        <label for="gl-thung">Số viên mỗi thùng</label>
        <input id="gl-thung" type="number" min="1" step="1" value="4" inputmode="numeric">
      </div>
      <div class="field">
        <label for="gl-gia">Giá mỗi thùng (₫) — sửa theo giá địa phương</label>
        <input id="gl-gia" type="number" min="0" step="1000" value="350000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="gl-calc">Tính số gạch</button>
    <div id="gl-out" class="result" style="display:none"></div>
    <p class="note">Đã cộng sẵn 5% hao hụt do cắt gạch và vỡ. Phòng nhiều góc cạnh hoặc lát xéo nên cộng 7–10%. Giá gạch thay đổi theo hãng và địa phương — sửa theo giá nơi bạn mua.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function toggleCustom() {
    var isCustom = root.querySelector('#gl-size').value === 'custom';
    root.querySelector('#gl-custom').style.display = isCustom ? 'block' : 'none';
    root.querySelector('#gl-custom2').style.display = isCustom ? 'block' : 'none';
  }
  root.querySelector('#gl-size').addEventListener('change', toggleCustom);
  function calc() {
    var area = parseNum(root.querySelector('#gl-dt').value);
    var perBox = parseNum(root.querySelector('#gl-thung').value);
    var price = parseNum(root.querySelector('#gl-gia').value);
    var out = root.querySelector('#gl-out');
    var w, h;
    if (root.querySelector('#gl-size').value === 'custom') {
      w = parseNum(root.querySelector('#gl-rong').value);
      h = parseNum(root.querySelector('#gl-dai').value);
    } else {
      var parts = root.querySelector('#gl-size').value.split('x');
      w = parseFloat(parts[0]); h = parseFloat(parts[1]);
    }
    if (isNaN(area) || area <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0 || isNaN(perBox) || perBox < 1) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập diện tích, kích thước gạch và số viên/thùng hợp lệ.</p>';
      return;
    }
    var tileArea = (w / 100) * (h / 100);
    var exact = area / tileArea;
    var tiles = Math.ceil(exact * 1.05);
    var boxes = Math.ceil(tiles / perBox);
    var html = '<div class="result-row"><span>Diện tích 1 viên gạch</span><strong>' + fmtNum(tileArea) + ' m²</strong></div>'
      + '<div class="result-row"><span>Số viên vừa đủ (chưa hao hụt)</span><strong>' + fmtNum(exact) + ' viên</strong></div>'
      + '<div class="result-row"><span>Số viên cần mua (+5% hao hụt)</span><strong>' + fmtNum(tiles, 0) + ' viên</strong></div>'
      + '<div class="result-row"><span>Số thùng cần mua</span><strong>' + fmtNum(boxes, 0) + ' thùng (' + fmtNum(perBox, 0) + ' viên/thùng)</strong></div>';
    if (!isNaN(price) && price > 0) {
      html += '<div class="result-row"><span>Chi phí gạch ước tính</span><strong>' + fmtVND(boxes * price) + '</strong></div>';
    }
    html += '<p class="muted">Chưa tính keo dán/xi măng, ron gạch và công thợ.</p>';
    out.style.display = 'block';
    out.innerHTML = html;
  }
  root.querySelector('#gl-calc').addEventListener('click', calc);
  calc();
}
