export const meta = {
  id: 'ngoai-te-ty-gia',
  name: 'Đổi ngoại tệ (tỷ giá tự nhập)',
  category: 'Du lịch',
  categorySlug: 'du-lich',
  desc: 'Quy đổi ngoại tệ sang VND và ngược lại theo tỷ giá bạn tự nhập — dùng khi đi du lịch, mua hàng nước ngoài.',
  keywords: ['đổi ngoại tệ', 'tỷ giá', 'USD', 'VND', 'đổi tiền', 'du lịch'],
  icon: '💱',
  seoTitle: 'Đổi ngoại tệ sang VND theo tỷ giá tự nhập',
  seoDesc: 'Quy đổi USD, EUR, JPY, KRW… sang VND và ngược lại theo tỷ giá bạn tự nhập. Tỷ giá tham khảo, không phải tỷ giá ngân hàng.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>💱 Đổi ngoại tệ (tỷ giá tự nhập)</h2>
      <p class="muted">Nhập tỷ giá bạn tra được (Ví dụ: 1 USD = 26.000₫), nhập số tiền để quy đổi 2 chiều.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="nt-ngoai">Ngoại tệ</label>
        <select id="nt-ngoai">
          <option value="USD" selected>USD — Đô la Mỹ</option>
          <option value="EUR">EUR — Euro</option>
          <option value="JPY">JPY — Yên Nhật</option>
          <option value="KRW">KRW — Won Hàn Quốc</option>
          <option value="CNY">CNY — Nhân dân tệ</option>
          <option value="THB">THB — Baht Thái</option>
          <option value="SGD">SGD — Đô la Singapore</option>
          <option value="HKD">HKD — Đô la Hồng Kông</option>
          <option value="AUD">AUD — Đô la Úc</option>
          <option value="GBP">GBP — Bảng Anh</option>
        </select>
      </div>
      <div class="field">
        <label for="nt-tygia">Tỷ giá: 1 đơn vị ngoại tệ = bao nhiêu VND</label>
        <input id="nt-tygia" type="number" min="0" step="0.01" value="26000" inputmode="decimal">
      </div>
      <div class="field">
        <label for="nt-tien-ngoai">Số tiền ngoại tệ → VND</label>
        <input id="nt-tien-ngoai" type="number" min="0" step="0.01" value="100" inputmode="decimal">
      </div>
      <div class="field">
        <label for="nt-tien-vnd">Số tiền VND → ngoại tệ</label>
        <input id="nt-tien-vnd" type="number" min="0" step="1000" value="2600000" inputmode="numeric">
      </div>
    </div>
    <button class="btn btn-primary" id="nt-calc">Quy đổi</button>
    <div id="nt-out" class="result" style="display:none"></div>
    <p class="note">Tỷ giá do bạn tự nhập, chỉ mang tính tham khảo — tỷ giá mua/bán thực tế tại ngân hàng và tiệm vàng có thể chênh lệch. Xem tỷ giá trực tiếp ở công cụ Giá vàng SJC &amp; tỷ giá trực tiếp.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function calc() {
    var cur = root.querySelector('#nt-ngoai').value;
    var rate = parseNum(root.querySelector('#nt-tygia').value);
    var foreign = parseNum(root.querySelector('#nt-tien-ngoai').value);
    var vnd = parseNum(root.querySelector('#nt-tien-vnd').value);
    var out = root.querySelector('#nt-out');
    if (isNaN(rate) || rate <= 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập tỷ giá hợp lệ (lớn hơn 0).</p>';
      return;
    }
    var html = '';
    if (!isNaN(foreign) && foreign >= 0) {
      html += '<div class="result-row"><span>' + fmtNum(foreign) + ' ' + cur + '</span><strong>' + fmtVND(foreign * rate) + '</strong></div>';
    }
    if (!isNaN(vnd) && vnd >= 0) {
      html += '<div class="result-row"><span>' + fmtVND(vnd) + '</span><strong>' + fmtNum(vnd / rate) + ' ' + cur + '</strong></div>';
    }
    if (!html) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập ít nhất một số tiền để quy đổi.</p>';
      return;
    }
    html += '<p class="muted">Tỷ giá áp dụng: 1 ' + cur + ' = ' + fmtVND(rate) + ' (do bạn tự nhập).</p>';
    out.style.display = 'block';
    out.innerHTML = html;
  }
  root.querySelector('#nt-calc').addEventListener('click', calc);
  calc();
}
