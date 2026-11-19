// Thuế vãng lai & khấu trừ 10% — thu nhập không có hợp đồng lao động.
export const meta = {
  id: 'thue-vang-lai',
  name: 'Thuế vãng lai & khấu trừ 10%',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính thuế khấu trừ 10% cho thu nhập vãng lai (không hợp đồng lao động): chi trả từ 2.000.000₫/lần trở lên thì khấu trừ 10%, dưới 2 triệu thì không.',
  keywords: 'thuế vãng lai, khấu trừ 10%, thuế thu nhập vãng lai, không hợp đồng lao động, thuế 10% freelancer',
  icon: '📝',
  seoTitle: 'Thuế vãng lai & khấu trừ 10% — thu nhập không hợp đồng lao động',
  seoDesc: 'Tính thuế khấu trừ 10% cho thu nhập vãng lai: từ 2.000.000₫/lần trở lên khấu trừ 10%, dưới 2 triệu không khấu trừ. Ghi chú quyết toán cuối năm.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="tvl-income">Thu nhập mỗi lần chi trả (₫)</label>
      <input id="tvl-income" type="text" inputmode="decimal" value="5.000.000" placeholder="Ví dụ: 5.000.000">
    </div>
    <div class="field">
      <label for="tvl-times">Số lần chi trả trong năm (để ước tính cả năm)</label>
      <input id="tvl-times" type="number" min="1" max="365" step="1" value="1">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="tvl-calc">Tính thuế khấu trừ</button>
  <div id="tvl-out"></div>
  <p class="note">Theo quy định khấu trừ thuế TNCN: tổ chức, cá nhân chi trả thu nhập cho người không có hợp đồng lao động phải khấu trừ 10% nếu mỗi lần chi trả từ 2.000.000₫ trở lên; dưới 2.000.000₫/lần thì không khấu trừ. Đây là thuế tạm khấu trừ khi chi trả — cuối năm, cá nhân quyết toán theo biểu thuế lũy tiến từng phần và có thể được hoàn thuế nếu số thuế phải nộp ít hơn số đã khấu trừ. Người có thu nhập vãng lai dưới 100 triệu đồng/năm và chỉ có một nguồn thu nhập có thể làm cam kết để tạm thời không bị khấu trừ (theo mẫu quy định).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);

  $('tvl-calc').addEventListener('click', () => {
    const income = parseNum($('tvl-income').value);
    const times = Math.max(1, Math.round(parseNum($('tvl-times').value) || 1));
    if (!(income > 0)) { $('tvl-out').innerHTML = '<p class="error">Vui lòng nhập thu nhập lớn hơn 0.</p>'; return; }
    const THRESHOLD = 2000000;
    const mustWithhold = income >= THRESHOLD;
    const tax = mustWithhold ? income * 0.10 : 0;
    const net = income - tax;
    $('tvl-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Thu nhập mỗi lần chi trả</span><strong>${fmtVND(income)}</strong></div>
      <div class="result-row"><span>Ngưỡng khấu trừ</span><strong>${fmtVND(THRESHOLD)}/lần</strong></div>
      <div class="result-row"><span>Thuế khấu trừ 10%</span><strong>${mustWithhold ? fmtVND(tax) : '0₫ (dưới ngưỡng, không khấu trừ)'}</strong></div>
      <div class="result-row"><span>Thực nhận mỗi lần</span><strong>${fmtVND(net)}</strong></div>
      ${times > 1 ? `<div class="result-row"><span>Ước tính cả năm — tổng thu nhập (${times} lần)</span><strong>${fmtVND(income * times)}</strong></div>
      <div class="result-row"><span>Ước tính cả năm — tổng thuế đã khấu trừ</span><strong>${fmtVND(tax * times)}</strong></div>` : ''}
    </div>
    ${!mustWithhold ? '<p class="note">Thu nhập dưới 2.000.000₫/lần nên bên chi trả không khấu trừ thuế. Tuy nhiên, nếu tổng thu nhập cả năm vượt mức phải nộp thuế, bạn vẫn cần quyết toán và nộp thuế theo biểu lũy tiến.</p>' : ''}`;
  });
}
