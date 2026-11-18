// Tính BHXH một lần — theo Điều 70 Luật BHXH 2024 (41/2024/QH15, hiệu lực 01/7/2025).
export const meta = {
  id: 'bhxh-mot-lan',
  name: 'Tính BHXH một lần',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Ước tính số tiền rút bảo hiểm xã hội một lần: 1,5 tháng lương bình quân cho mỗi năm đóng trước 2014, 2 tháng cho mỗi năm từ 2014 trở đi.',
  keywords: 'BHXH một lần, rút BHXH một lần, tính BHXH 1 lần, bảo hiểm xã hội một lần, rút bảo hiểm xã hội, tiền BHXH một lần 2026, luật BHXH 2024',
  icon: '🏦',
  seoTitle: 'Tính BHXH một lần 2026 — theo Luật BHXH 2024',
  seoDesc: 'Ước tính tiền rút BHXH một lần theo Điều 70 Luật BHXH 2024: 1,5 tháng lương bình quân/năm trước 2014, 2 tháng/năm từ 2014. Kiểm tra điều kiện rút sau 01/7/2025.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🏦</span><div><h2>Tính BHXH một lần</h2><p class="muted">1,5 tháng lương bình quân × năm đóng trước 2014 + 2 tháng × năm đóng từ 2014 trở đi.</p></div></div>
  <div class="field"><label for="bhxh-avg">Mức bình quân tiền lương tháng đóng BHXH (₫)</label><input id="bhxh-avg" type="text" inputmode="decimal" value="10.000.000"><p class="hint">Lương bình quân toàn bộ quá trình đóng (tra trên VssID). Công cụ tính theo con số bạn nhập, chưa điều chỉnh hệ số trượt giá — nếu có mức bình quân đã điều chỉnh thì nhập mức đó.</p></div>
  <div class="grid-2">
    <div class="field"><label for="bhxh-y1">Thời gian đóng trước năm 2014 — số năm</label><input id="bhxh-y1" type="number" min="0" step="1" value="5"></div>
    <div class="field"><label for="bhxh-m1">Thời gian đóng trước năm 2014 — số tháng lẻ</label><input id="bhxh-m1" type="number" min="0" max="11" step="1" value="3"></div>
  </div>
  <div class="grid-2">
    <div class="field"><label for="bhxh-y2">Thời gian đóng từ năm 2014 trở đi — số năm</label><input id="bhxh-y2" type="number" min="0" step="1" value="8"></div>
    <div class="field"><label for="bhxh-m2">Thời gian đóng từ năm 2014 trở đi — số tháng lẻ</label><input id="bhxh-m2" type="number" min="0" max="11" step="1" value="0"></div>
  </div>
  <div class="field"><label for="bhxh-joined">Bạn bắt đầu đóng BHXH khi nào?</label><select id="bhxh-joined"><option value="before">Trước ngày 01/7/2025</option><option value="from">Từ ngày 01/7/2025 trở đi</option></select><p class="hint">Mốc này quyết định bạn có còn được rút một lần sau 12 tháng nghỉ việc hay không (Luật BHXH 2024).</p></div>
  <div class="field"><label for="bhxh-paid">Tổng số tiền đã đóng vào quỹ hưu trí – tử tuất (₫) — chỉ cần khi đóng chưa đủ 1 năm</label><input id="bhxh-paid" type="text" inputmode="decimal" value="" placeholder="Bỏ trống để ước tính"><p class="hint">Tra trên ứng dụng VssID. Bỏ trống thì công cụ ước tính ≈ 22% × lương bình quân × số tháng đóng (22% = 8% người lao động + 14% người sử dụng lao động đóng vào quỹ hưu trí – tử tuất).</p></div>
  <div class="btn-row">
    <button class="btn btn-primary" id="bhxh-calc">Tính BHXH một lần</button>
    <button type="button" class="btn btn-ghost" id="bhxh-example">Điền ví dụ</button>
  </div>
  <div class="result" id="bhxh-result" hidden></div>
  <p class="note">Công thức (khoản 3 Điều 70 Luật BHXH 41/2024/QH15): mỗi năm đóng trước năm 2014 = 1,5 tháng mức bình quân tiền lương tháng đóng BHXH; mỗi năm từ năm 2014 trở đi = 2 tháng. Tháng lẻ trước năm 2014 được chuyển sang giai đoạn từ 2014 để tính; tháng lẻ 1–6 tháng tính là nửa năm, 7–11 tháng tính là 1 năm. Đóng chưa đủ 1 năm: mức hưởng bằng số tiền đã đóng nhưng không quá 2 tháng mức bình quân. Điều kiện rút: người đã đóng trước 01/7/2025 được rút sau 12 tháng không tham gia BHXH bắt buộc lẫn tự nguyện nếu chưa đủ 20 năm đóng; người bắt đầu đóng từ 01/7/2025 chỉ được rút khi đủ tuổi hưu mà chưa đủ 15 năm đóng, ra nước ngoài định cư, mắc bệnh hiểm nghèo hoặc suy giảm khả năng lao động từ 81% trở lên. Kết quả chỉ mang tính tham khảo — mức thực tế do cơ quan BHXH xác định theo hồ sơ đóng của bạn (lương các năm trước còn được điều chỉnh theo hệ số trượt giá).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + ' ₫');
  const parseNum = U.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = U.toast || (m => alert(m));
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const $ = id => root.querySelector('#' + id);
  const fmtYears = y => (Number.isInteger(y) ? String(y) : y.toLocaleString('vi-VN')) + ' năm';

  function calc() {
    const avg = parseNum($('bhxh-avg').value);
    const y1 = Math.max(0, Math.floor(parseNum($('bhxh-y1').value)));
    const m1 = Math.min(11, Math.max(0, Math.floor(parseNum($('bhxh-m1').value))));
    const y2 = Math.max(0, Math.floor(parseNum($('bhxh-y2').value)));
    const m2 = Math.min(11, Math.max(0, Math.floor(parseNum($('bhxh-m2').value))));
    const joined = $('bhxh-joined').value;
    const months1 = y1 * 12 + m1;
    const months2 = y2 * 12 + m2;
    const total = months1 + months2;
    if (!(avg > 0)) { toast('Vui lòng nhập mức bình quân tiền lương tháng đóng BHXH.'); return; }
    if (total <= 0) { toast('Vui lòng nhập thời gian đã đóng BHXH.'); return; }

    let rows = '';
    let amount = 0;
    if (total < 12) {
      // Chưa đủ 1 năm: bằng số tiền đã đóng, tối đa 2 tháng mức bình quân.
      const paidInput = parseNum($('bhxh-paid').value);
      const paid = paidInput > 0 ? paidInput : 0.22 * avg * total;
      const cap = 2 * avg;
      amount = Math.min(paid, cap);
      rows += '<div class="result-row"><span>Tổng thời gian đóng</span><span>' + total + ' tháng (chưa đủ 1 năm)</span></div>';
      rows += '<div class="result-row"><span>Số tiền đã đóng' + (paidInput > 0 ? '' : ' (ước tính 22% × lương bình quân × số tháng)') + '</span><span>' + fmtVND(paid) + '</span></div>';
      rows += '<div class="result-row"><span>Mức tối đa (2 tháng mức bình quân)</span><span>' + fmtVND(cap) + '</span></div>';
    } else {
      // Tháng lẻ trước 2014 chuyển sang giai đoạn từ 2014 (điểm a khoản 3 Điều 70).
      const t1 = Math.floor(months1 / 12);
      const odd1 = months1 % 12;
      const m2adj = months2 + odd1;
      const full2 = Math.floor(m2adj / 12);
      const rem2 = m2adj % 12;
      const frac2 = rem2 === 0 ? 0 : rem2 <= 6 ? 0.5 : 1;
      const t2 = full2 + frac2;
      const part1 = 1.5 * avg * t1;
      const part2 = 2 * avg * t2;
      amount = part1 + part2;
      rows += '<div class="result-row"><span>Số năm đóng trước 2014 (hệ số 1,5)</span><span>' + fmtYears(t1) + (odd1 ? ' — ' + odd1 + ' tháng lẻ chuyển sang giai đoạn từ 2014' : '') + '</span></div>';
      rows += '<div class="result-row"><span>Số năm đóng từ 2014 trở đi (hệ số 2)</span><span>' + fmtYears(t2) + (rem2 ? ' (gồm ' + rem2 + ' tháng lẻ tính là ' + (frac2 === 0.5 ? 'nửa năm' : '1 năm') + ')' : '') + '</span></div>';
      rows += '<div class="result-row"><span>Phần trước 2014 (1,5 × ' + fmtVND(avg) + ' × ' + fmtYears(t1) + ')</span><span>' + fmtVND(part1) + '</span></div>';
      rows += '<div class="result-row"><span>Phần từ 2014 (2 × ' + fmtVND(avg) + ' × ' + fmtYears(t2) + ')</span><span>' + fmtVND(part2) + '</span></div>';
    }

    let elig = '';
    if (joined === 'from') {
      elig = 'Bạn bắt đầu đóng từ 01/7/2025 nên KHÔNG rút được chỉ vì nghỉ việc 12 tháng — chỉ rút được khi đủ tuổi hưu mà chưa đủ 15 năm đóng, định cư nước ngoài, bệnh hiểm nghèo hoặc suy giảm khả năng lao động từ 81% trở lên.';
    } else if (total >= 240) {
      elig = 'Bạn đã đóng đủ 20 năm nên không rút được theo diện nghỉ việc 12 tháng — thời gian này để hưởng lương hưu.';
    } else {
      elig = 'Bạn có thời gian đóng trước 01/7/2025 nên vẫn được rút sau 12 tháng không tham gia BHXH bắt buộc lẫn tự nguyện (chưa đủ 20 năm đóng).';
    }

    const resEl = $('bhxh-result');
    resEl.hidden = false;
    resEl.innerHTML =
      rows +
      '<div class="result-row"><span>Số tiền BHXH một lần ước tính</span><strong>' + fmtVND(amount) + '</strong></div>' +
      '<div class="result-row"><span>Điều kiện rút</span><span>' + elig + '</span></div>';
  }

  $('bhxh-calc').addEventListener('click', calc);
  // Ví dụ: lương bình quân 12 triệu, 3 năm 8 tháng trước 2014 + 6 năm 2 tháng
  // từ 2014 → 222.000.000đ (8 tháng lẻ chuyển sang, 10 tháng lẻ tính là 1 năm).
  $('bhxh-example').addEventListener('click', () => {
    fillEx(root, { 'bhxh-avg': '12.000.000', 'bhxh-y1': '3', 'bhxh-m1': '8', 'bhxh-y2': '6', 'bhxh-m2': '2', 'bhxh-joined': 'before', 'bhxh-paid': '' }, $('bhxh-calc'));
  });
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
