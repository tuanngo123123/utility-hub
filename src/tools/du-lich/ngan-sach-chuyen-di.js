export const meta = {
  id: 'ngan-sach-chuyen-di',
  name: 'Tính ngân sách chuyến đi',
  category: 'Du lịch',
  categorySlug: 'du-lich',
  desc: 'Tính tổng ngân sách chuyến đi theo số ngày, số người và từng khoản chi: vé, ở, ăn, đi lại, vui chơi, dự phòng.',
  keywords: ['ngân sách du lịch', 'chi phí chuyến đi', 'du lịch bao nhiêu tiền', 'ngân sách', 'tiền đi chơi'],
  icon: '🧳',
  seoTitle: 'Tính ngân sách chuyến đi — Đi chơi hết bao nhiêu tiền?',
  seoDesc: 'Tính tổng ngân sách chuyến đi theo số ngày và số người: vé, chỗ ở, ăn uống, đi lại, vui chơi, dự phòng — kèm chi phí mỗi người mỗi ngày.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🧳 Tính ngân sách chuyến đi</h2>
      <p class="muted">Nhập số ngày, số người và từng khoản chi dự kiến (cho cả đoàn) để biết tổng ngân sách cần chuẩn bị.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="ns-ngay">Số ngày đi</label>
        <input id="ns-ngay" type="number" min="1" step="1" value="3" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-nguoi">Số người</label>
        <input id="ns-nguoi" type="number" min="1" step="1" value="2" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-ve">Vé di chuyển (máy bay/tàu/xe) — cả đoàn (₫)</label>
        <input id="ns-ve" type="number" min="0" step="1000" value="4000000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-o">Chỗ ở — cả đoàn (₫)</label>
        <input id="ns-o" type="number" min="0" step="1000" value="3000000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-an">Ăn uống — cả đoàn (₫)</label>
        <input id="ns-an" type="number" min="0" step="1000" value="3000000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-dilai">Đi lại tại điểm đến — cả đoàn (₫)</label>
        <input id="ns-dilai" type="number" min="0" step="1000" value="1000000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-choi">Vui chơi, tham quan, mua sắm — cả đoàn (₫)</label>
        <input id="ns-choi" type="number" min="0" step="1000" value="1000000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="ns-duphong">Quỹ dự phòng (%)</label>
        <input id="ns-duphong" type="number" min="0" step="1" value="10" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="ns-calc">Tính ngân sách</button>
    <div id="ns-out" class="result" style="display:none"></div>
    <p class="note">Quỹ dự phòng nên để 10–15% để lo phát sinh (vé tăng giá, ốm đau, đổi lịch). Giá cả thay đổi theo mùa và địa điểm — sửa theo giá bạn tra được.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function calc() {
    var days = parseNum(root.querySelector('#ns-ngay').value);
    var people = parseNum(root.querySelector('#ns-nguoi').value);
    var reserveRate = parseNum(root.querySelector('#ns-duphong').value);
    var out = root.querySelector('#ns-out');
    var items = [
      { label: 'Vé di chuyển', val: parseNum(root.querySelector('#ns-ve').value) },
      { label: 'Chỗ ở', val: parseNum(root.querySelector('#ns-o').value) },
      { label: 'Ăn uống', val: parseNum(root.querySelector('#ns-an').value) },
      { label: 'Đi lại tại điểm đến', val: parseNum(root.querySelector('#ns-dilai').value) },
      { label: 'Vui chơi, tham quan, mua sắm', val: parseNum(root.querySelector('#ns-choi').value) }
    ];
    if (isNaN(days) || days < 1 || isNaN(people) || people < 1 || items.some(function (it) { return isNaN(it.val) || it.val < 0; })) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập số ngày, số người và các khoản chi hợp lệ (≥ 0).</p>';
      return;
    }
    if (isNaN(reserveRate) || reserveRate < 0) reserveRate = 0;
    var base = 0;
    items.forEach(function (it) { base += it.val; });
    var reserve = Math.round(base * reserveRate / 100);
    var total = base + reserve;
    var rows = '';
    items.forEach(function (it) {
      rows += '<tr><td>' + it.label + '</td><td>' + fmtVND(it.val) + '</td><td>' + (total > 0 ? fmtNum(it.val / total * 100) + '%' : '—') + '</td></tr>';
    });
    rows += '<tr><td>Dự phòng (' + fmtNum(reserveRate) + '%)</td><td>' + fmtVND(reserve) + '</td><td>' + (total > 0 ? fmtNum(reserve / total * 100) + '%' : '—') + '</td></tr>';
    var perPerson = total / people;
    var perDay = perPerson / days;
    var cash = Math.round(total * 0.3 / 1000) * 1000;
    out.style.display = 'block';
    out.innerHTML = '<table class="tbl"><thead><tr><th>Khoản chi</th><th>Số tiền</th><th>Tỉ trọng</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="result-row"><span>Tổng ngân sách cần chuẩn bị</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<div class="result-row"><span>Chi phí mỗi người</span><strong>' + fmtVND(perPerson) + '</strong></div>'
      + '<div class="result-row"><span>Chi phí mỗi người mỗi ngày</span><strong>' + fmtVND(perDay) + '</strong></div>'
      + '<p class="muted">Gợi ý mang tiền mặt khoảng ' + fmtVND(cash) + ' (30% tổng ngân sách) để trả những nơi không nhận thẻ; phần còn lại để trong thẻ/tài khoản cho an toàn. Đổi ngoại tệ trước khi đi nếu ra nước ngoài.</p>';
  }
  root.querySelector('#ns-calc').addEventListener('click', calc);
  calc();
}
