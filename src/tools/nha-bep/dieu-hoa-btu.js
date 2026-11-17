export const meta = {
  id: 'dieu-hoa-btu',
  name: 'Tính công suất điều hòa (BTU)',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Tính công suất điều hòa (BTU) phù hợp theo diện tích phòng, hướng nắng, số người, kèm điện tiêu thụ ước tính mỗi tháng.',
  keywords: ['điều hòa', 'BTU', 'công suất điều hòa', 'máy lạnh', '9000 BTU', '12000 BTU'],
  icon: '❄️',
  seoTitle: 'Tính công suất điều hòa (BTU) theo diện tích phòng',
  seoDesc: 'Phòng bao nhiêu m² thì dùng máy lạnh bao nhiêu BTU? Tính BTU gợi ý theo diện tích, hướng nắng, số người và điện tiêu thụ mỗi tháng.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>❄️ Tính công suất điều hòa (BTU)</h2>
      <p class="muted">Nhập thông tin phòng để biết nên mua máy lạnh công suất bao nhiêu BTU.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="dh-dt">Diện tích phòng (m²)</label>
        <input id="dh-dt" type="number" min="1" step="0.5" value="20" inputmode="decimal">
      </div>
      <div class="field">
        <label for="dh-nang">Hướng nắng / vị trí phòng</label>
        <select id="dh-nang">
          <option value="600" selected>Phòng thường, ít nắng trực tiếp (~600 BTU/m²)</option>
          <option value="700">Nắng nhiều, hướng Tây, nhiều kính (~700 BTU/m²)</option>
          <option value="800">Phòng áp mái, trần thấp, rất nóng (~800 BTU/m²)</option>
        </select>
      </div>
      <div class="field">
        <label for="dh-nguoi">Số người thường xuyên trong phòng</label>
        <input id="dh-nguoi" type="number" min="1" step="1" value="2" inputmode="numeric">
      </div>
      <div class="field">
        <label for="dh-nhiet">Thiết bị tỏa nhiệt nhiều (bếp, máy tính, tủ lạnh…)</label>
        <select id="dh-nhiet">
          <option value="0" selected>Không / ít</option>
          <option value="1000">Có (+1.000 BTU)</option>
        </select>
      </div>
      <div class="field">
        <label for="dh-gio">Số giờ bật máy mỗi ngày (để ước tính tiền điện)</label>
        <input id="dh-gio" type="number" min="0" step="0.5" value="8" inputmode="decimal">
      </div>
      <div class="field">
        <label for="dh-giadien">Giá điện (₫/kWh) — sửa theo giá địa phương</label>
        <input id="dh-giadien" type="number" min="0" step="100" value="3000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="dh-calc">Tính công suất</button>
    <div id="dh-out" class="result" style="display:none"></div>
    <p class="note">Quy tắc tham khảo: phòng thường ~600 BTU/m², phòng nắng nhiều ~700 BTU/m²; mỗi người thêm (từ người thứ 3) cộng ~500 BTU. Điện tiêu thụ ước tính theo máy Inverter chạy trung bình 70% công suất danh định.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var SIZES = [
    { btu: 9000, kw: 0.85, label: '9.000 BTU (1 HP)' },
    { btu: 12000, kw: 1.1, label: '12.000 BTU (1,5 HP)' },
    { btu: 18000, kw: 1.7, label: '18.000 BTU (2 HP)' },
    { btu: 24000, kw: 2.3, label: '24.000 BTU (2,5 HP)' }
  ];
  function calc() {
    var area = parseNum(root.querySelector('#dh-dt').value);
    var rate = parseNum(root.querySelector('#dh-nang').value);
    var people = parseNum(root.querySelector('#dh-nguoi').value);
    var heat = parseNum(root.querySelector('#dh-nhiet').value);
    var hours = parseNum(root.querySelector('#dh-gio').value);
    var price = parseNum(root.querySelector('#dh-giadien').value);
    var out = root.querySelector('#dh-out');
    if (isNaN(area) || area <= 0 || isNaN(people) || people < 1) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập diện tích phòng và số người hợp lệ.</p>';
      return;
    }
    var extraPeople = Math.max(0, people - 2) * 500;
    var needed = area * rate + extraPeople + (isNaN(heat) ? 0 : heat);
    var pick = null;
    for (var i = 0; i < SIZES.length; i++) {
      if (SIZES[i].btu >= needed) { pick = SIZES[i]; break; }
    }
    var html = '<div class="result-row"><span>BTU cần thiết (ước tính)</span><strong>' + fmtNum(needed, 0) + ' BTU</strong></div>';
    if (pick) {
      html += '<div class="result-row"><span>Máy gợi ý</span><strong>' + pick.label + '</strong></div>';
      if (!isNaN(hours) && hours > 0) {
        var kwhMonth = pick.kw * hours * 30 * 0.7;
        html += '<div class="result-row"><span>Điện tiêu thụ ước tính</span><strong>' + fmtNum(kwhMonth) + ' kWh/tháng (' + fmtNum(hours) + ' giờ/ngày)</strong></div>';
        if (!isNaN(price) && price > 0) {
          html += '<div class="result-row"><span>Tiền điện ước tính</span><strong>' + fmtVND(kwhMonth * price) + '/tháng</strong></div>';
        }
      }
      html += '<p class="muted">Máy công suất vừa đủ làm lạnh nhanh và tiết kiệm điện hơn máy quá nhỏ (chạy hết công suất liên tục) hay quá lớn (bật/tắt liên tục).</p>';
    } else {
      html += '<div class="result-row"><span>Máy gợi ý</span><strong>Trên 24.000 BTU — nên dùng 2 máy hoặc máy công suất lớn, hỏi thêm thợ lắp đặt</strong></div>';
    }
    out.style.display = 'block';
    out.innerHTML = html;
  }
  root.querySelector('#dh-calc').addEventListener('click', calc);
  calc();
}
