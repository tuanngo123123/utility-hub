// Quỹ dự phòng khẩn cấp — mục tiêu theo số tháng chi tiêu thiết yếu.
export const meta = {
  id: 'quy-du-phong',
  name: 'Quỹ dự phòng khẩn cấp',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính quỹ dự phòng khẩn cấp cần có theo chi tiêu thiết yếu hằng tháng và số tháng muốn dự phòng (3/6/12), kèm kế hoạch để dành mỗi tháng.',
  keywords: 'quỹ dự phòng, quỹ khẩn cấp, emergency fund, tiết kiệm dự phòng, chi tiêu thiết yếu',
  icon: '🛟',
  seoTitle: 'Quỹ dự phòng khẩn cấp — cần để dành bao nhiêu & trong bao lâu',
  seoDesc: 'Tính mục tiêu quỹ dự phòng khẩn cấp (3, 6 hoặc 12 tháng chi tiêu thiết yếu) và số tiền cần để dành mỗi tháng để đạt mục tiêu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="qdp-expense">Chi tiêu thiết yếu mỗi tháng (₫)</label>
      <input id="qdp-expense" type="text" inputmode="decimal" value="8.000.000" placeholder="Ví dụ: 8.000.000">
      <p class="muted">Chỉ tính khoản bắt buộc: ăn uống, nhà ở, đi lại, hóa đơn, bảo hiểm.</p>
    </div>
    <div class="field">
      <label for="qdp-have">Số tiền đã có trong quỹ (₫)</label>
      <input id="qdp-have" type="text" inputmode="decimal" value="0" placeholder="Ví dụ: 0">
    </div>
    <div class="field">
      <label for="qdp-months">Số tháng muốn dự phòng</label>
      <select id="qdp-months">
        <option value="3">3 tháng (tối thiểu)</option>
        <option value="6" selected>6 tháng (khuyên dùng)</option>
        <option value="12">12 tháng (an toàn cao)</option>
      </select>
    </div>
    <div class="field">
      <label for="qdp-horizon">Muốn đủ quỹ trong bao lâu (tháng)</label>
      <input id="qdp-horizon" type="number" min="1" max="120" step="1" value="12">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="qdp-calc">Tính quỹ dự phòng</button>
  <div id="qdp-out"></div>
  <p class="note">Quy tắc chung: quỹ khẩn cấp nên đủ chi tiêu thiết yếu 3–6 tháng (người làm tự do nên 6–12 tháng). Giữ quỹ ở nơi rút được ngay như tài khoản tiết kiệm không kỳ hạn, không đầu tư vào tài sản rủi ro.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  $('qdp-calc').addEventListener('click', () => {
    const expense = parseNum($('qdp-expense').value);
    const have = parseNum($('qdp-have').value);
    const months = Math.max(1, Math.round(parseNum($('qdp-months').value) || 6));
    const horizon = Math.max(1, Math.round(parseNum($('qdp-horizon').value) || 1));
    if (!(expense > 0)) { $('qdp-out').innerHTML = '<p class="error">Vui lòng nhập chi tiêu thiết yếu lớn hơn 0.</p>'; return; }
    if (have < 0) { $('qdp-out').innerHTML = '<p class="error">Số tiền đã có không được âm.</p>'; return; }
    const target = expense * months;
    const remaining = Math.max(0, target - have);
    const perMonth = remaining / horizon;
    const progress = Math.min(100, have / target * 100);
    $('qdp-out').innerHTML = `
<div class="grid-3">
  <div class="stat"><div class="stat-num">${fmtVND(target)}</div><div class="stat-label">Mục tiêu quỹ (${months} tháng)</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(remaining)}</div><div class="stat-label">Còn thiếu</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(perMonth)}</div><div class="stat-label">Để dành mỗi tháng (${horizon} tháng)</div></div>
</div>
<div class="result">
  <div class="result-row"><span>Đã có</span><strong>${fmtVND(have)} (${(Math.round(progress * 10) / 10).toLocaleString('vi-VN')}% mục tiêu)</strong></div>
  <div class="result-row"><span>Nếu để dành ${fmtVND(expense / 10)} mỗi tháng (10% chi tiêu)</span><strong>${remaining === 0 ? 'Đã đủ quỹ' : 'Đủ quỹ sau ' + Math.ceil(remaining / (expense / 10)) + ' tháng'}</strong></div>
</div>
<table class="tbl">
  <thead><tr><th>Mốc</th><th>Số tiền</th></tr></thead>
  <tbody>
    <tr><td>3 tháng chi tiêu</td><td>${fmtVND(expense * 3)}</td></tr>
    <tr><td>6 tháng chi tiêu</td><td>${fmtVND(expense * 6)}</td></tr>
    <tr><td>12 tháng chi tiêu</td><td>${fmtVND(expense * 12)}</td></tr>
  </tbody>
</table>`;
  });
}
