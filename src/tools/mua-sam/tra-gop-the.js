export const meta = {
  id: 'tra-gop-the',
  name: 'Tính trả góp thẻ tín dụng',
  category: 'Mua sắm',
  categorySlug: 'mua-sam',
  desc: 'Tính tiền trả góp thẻ tín dụng theo kỳ hạn: tiền trả mỗi tháng, tổng lãi hoặc phí chuyển đổi, bảng từng kỳ.',
  keywords: ['trả góp', 'thẻ tín dụng', 'trả góp 0%', 'phí chuyển đổi', 'lãi suất', 'kỳ hạn'],
  icon: '💳',
  seoTitle: 'Tính trả góp thẻ tín dụng — Trả mỗi tháng bao nhiêu?',
  seoDesc: 'Tính trả góp thẻ tín dụng 3/6/9/12 tháng: tiền trả mỗi tháng, tổng lãi hoặc phí chuyển đổi, bảng chi tiết từng kỳ.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>💳 Tính trả góp thẻ tín dụng</h2>
      <p class="muted">Nhập giá trị trả góp và kỳ hạn để biết mỗi tháng trả bao nhiêu, tổng cộng hết bao nhiêu tiền lãi/phí.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="tgt-tien">Giá trị trả góp (₫)</label>
        <input id="tgt-tien" type="number" min="0" step="1000" value="12000000" inputmode="numeric">
      </div>
      <div class="field">
        <label for="tgt-ky">Kỳ hạn</label>
        <select id="tgt-ky">
          <option value="3">3 tháng</option>
          <option value="6">6 tháng</option>
          <option value="9">9 tháng</option>
          <option value="12" selected>12 tháng</option>
        </select>
      </div>
      <div class="field">
        <label for="tgt-chedo">Cách tính lãi/phí</label>
        <select id="tgt-chedo">
          <option value="phi" selected>Phí chuyển đổi trả góp % (trả 1 lần)</option>
          <option value="lai">Lãi suất %/tháng (tính trên dư nợ gốc)</option>
        </select>
      </div>
      <div class="field">
        <label for="tgt-tyle">Phí chuyển đổi (%) hoặc lãi suất (%/tháng)</label>
        <input id="tgt-tyle" type="number" min="0" step="0.1" value="3" inputmode="decimal">
      </div>
    </div>
    <button class="btn btn-primary" id="tgt-calc">Tính trả góp</button>
    <div id="tgt-out" class="result" style="display:none"></div>
    <p class="note">Phí chuyển đổi trả góp thường 2–6% giá trị giao dịch tùy ngân hàng và kỳ hạn; nhiều chương trình "0% lãi suất" vẫn thu phí chuyển đổi. Lãi suất %/tháng ở đây tính trên dư nợ gốc (lãi phẳng) — ngân hàng của bạn có thể tính trên dư nợ giảm dần, nên đối chiếu sao kê.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtVND = UH.fmtVND || function (n) { return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫'; };
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  function calc() {
    var amount = parseNum(root.querySelector('#tgt-tien').value);
    var term = parseNum(root.querySelector('#tgt-ky').value);
    var mode = root.querySelector('#tgt-chedo').value;
    var rate = parseNum(root.querySelector('#tgt-tyle').value);
    var out = root.querySelector('#tgt-out');
    if (isNaN(amount) || amount <= 0 || isNaN(term) || term < 1 || isNaN(rate) || rate < 0) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng nhập giá trị trả góp, kỳ hạn và lãi/phí hợp lệ.</p>';
      return;
    }
    var principalPerMonth = amount / term;
    var feeTotal = 0;
    var interestPerMonth = 0;
    if (mode === 'phi') feeTotal = amount * rate / 100;
    else interestPerMonth = amount * rate / 100;
    var monthly = mode === 'phi' ? (amount + feeTotal) / term : principalPerMonth + interestPerMonth;
    var totalInterest = mode === 'phi' ? feeTotal : interestPerMonth * term;
    var total = amount + totalInterest;
    var rows = '';
    for (var i = 1; i <= term; i++) {
      var feeCell = mode === 'phi' ? (i === 1 ? fmtVND(feeTotal) + ' (trả cùng kỳ 1)' : '—') : fmtVND(interestPerMonth);
      rows += '<tr><td>Kỳ ' + i + '</td><td>' + fmtVND(principalPerMonth) + '</td><td>' + feeCell + '</td><td><strong>' + fmtVND(monthly) + '</strong></td></tr>';
    }
    out.style.display = 'block';
    out.innerHTML = '<div class="result-row"><span>Tiền gốc mỗi tháng</span><strong>' + fmtVND(principalPerMonth) + '</strong></div>'
      + '<div class="result-row"><span>' + (mode === 'phi' ? 'Phí chuyển đổi (' + fmtNum(rate) + '% — 1 lần)' : 'Lãi mỗi tháng (' + fmtNum(rate) + '%/tháng)') + '</span><strong>' + fmtVND(mode === 'phi' ? feeTotal : interestPerMonth) + '</strong></div>'
      + '<div class="result-row"><span>Tiền trả mỗi tháng</span><strong>' + fmtVND(monthly) + '</strong></div>'
      + '<div class="result-row"><span>Tổng tiền phải trả (' + fmtNum(term, 0) + ' tháng)</span><strong>' + fmtVND(total) + '</strong></div>'
      + '<div class="result-row"><span>Tổng lãi/phí phải chịu</span><strong>' + fmtVND(totalInterest) + '</strong></div>'
      + '<table class="tbl"><thead><tr><th>Kỳ</th><th>Gốc</th><th>' + (mode === 'phi' ? 'Phí' : 'Lãi') + '</th><th>Phải trả</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  root.querySelector('#tgt-calc').addEventListener('click', calc);
  calc();
}
