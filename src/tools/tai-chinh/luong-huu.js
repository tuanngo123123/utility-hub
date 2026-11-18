// Tính lương hưu — theo Điều 66, 68 Luật BHXH 2024 (41/2024/QH15, hiệu lực
// 01/7/2025) + Điều 13 Nghị định 158/2025/NĐ-CP (tháng lẻ, giảm trừ nghỉ
// hưu trước tuổi) + Nghị định 161/2026/NĐ-CP (trần đóng 50.600.000đ).
export const meta = {
  id: 'luong-huu',
  name: 'Tính lương hưu',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Ước tính lương hưu hằng tháng theo Luật BHXH 2024: tỷ lệ hưởng theo số năm đóng, trừ khi nghỉ hưu trước tuổi, cộng trợ cấp một lần khi đóng vượt 30/35 năm.',
  keywords: 'tính lương hưu, lương hưu 2026, cách tính lương hưu, tỷ lệ hưởng lương hưu, trợ cấp một lần khi nghỉ hưu, nghỉ hưu trước tuổi, luật BHXH 2024',
  icon: '🧓',
  seoTitle: 'Tính lương hưu 2026 — theo Luật BHXH 2024',
  seoDesc: 'Ước tính lương hưu hằng tháng theo Điều 66 Luật BHXH 2024: nữ 45% ở 15 năm, nam 40% ở 15 năm, tối đa 75%, trừ 2%/năm nghỉ sớm, trợ cấp một lần khi đóng vượt 30/35 năm.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🧓</span><div><h2>Tính lương hưu</h2><p class="muted">Lương hưu mỗi tháng = Tỷ lệ hưởng × Mức bình quân tiền lương tháng đóng BHXH.</p></div></div>
  <div class="field"><label for="lh-gender">Giới tính</label><select id="lh-gender"><option value="nu">Nữ</option><option value="nam">Nam</option></select><p class="hint">Tỷ lệ hưởng khác nhau giữa nam và nữ (Điều 66 Luật BHXH 2024).</p></div>
  <div class="grid-2">
    <div class="field"><label for="lh-years">Thời gian đã đóng BHXH — số năm</label><input id="lh-years" type="number" min="0" step="1" value="28"></div>
    <div class="field"><label for="lh-months">Thời gian đã đóng BHXH — số tháng lẻ</label><input id="lh-months" type="number" min="0" max="11" step="1" value="0"><p class="hint">Tháng lẻ 1–6 tháng tính là nửa năm, 7–11 tháng tính là 1 năm.</p></div>
  </div>
  <div class="field"><label for="lh-avg">Mức bình quân tiền lương tháng đóng BHXH (₫)</label><input id="lh-avg" type="text" inputmode="decimal" value="12.000.000"><p class="hint">Lương bình quân toàn bộ quá trình đóng (tra trên VssID). Trần đóng BHXH là 50.600.000đ/tháng — nhập cao hơn thì công cụ tính trên 50.600.000đ.</p></div>
  <div class="grid-2">
    <div class="field"><label for="lh-early-y">Nghỉ hưu trước tuổi — số năm</label><input id="lh-early-y" type="number" min="0" step="1" value="0"></div>
    <div class="field"><label for="lh-early-m">Nghỉ hưu trước tuổi — số tháng lẻ</label><input id="lh-early-m" type="number" min="0" max="11" step="1" value="0"><p class="hint">Trừ 2% tỷ lệ hưởng mỗi năm tròn nghỉ sớm; 6–11 tháng nghỉ sớm trừ 1%; dưới 6 tháng không trừ.</p></div>
  </div>
  <div class="field"><label for="lh-post">Số năm đóng thêm sau khi đã đủ tuổi nghỉ hưu</label><input id="lh-post" type="number" min="0" step="1" value="0"><p class="hint">Chỉ năm đóng thêm nào VƯỢT ngưỡng 30 năm (nữ) / 35 năm (nam) mới được tính trợ cấp một lần 2 lần mức bình quân mỗi năm (Điều 68). Để 0 nếu nghỉ đúng tuổi.</p></div>
  <div class="btn-row">
    <button class="btn btn-primary" id="lh-calc">Tính lương hưu</button>
    <button type="button" class="btn btn-ghost" id="lh-example">Điền ví dụ</button>
  </div>
  <div class="result" id="lh-result" hidden></div>
  <p class="note">Công thức (Điều 66 Luật BHXH 41/2024/QH15): nữ hưởng 45% ở 15 năm đóng, thêm mỗi năm +2%, tối đa 75% (30 năm); nam hưởng 40% ở 15 năm, thêm mỗi năm 16–19 +1%, 45% ở 20 năm, từ năm 21 trở đi +2% mỗi năm, tối đa 75% (35 năm). Tháng lẻ 1–6 tháng tính là nửa năm, 7–11 tháng tính là 1 năm. Nghỉ hưu trước tuổi: trừ 2% mỗi năm tròn, 6–11 tháng trừ 1%, dưới 6 tháng không trừ (Điều 13 Nghị định 158/2025/NĐ-CP). Trợ cấp một lần (Điều 68): năm đóng vượt 30 năm (nữ) / 35 năm (nam) tính tới tuổi nghỉ hưu được 0,5 lần mức bình quân mỗi năm; năm đóng thêm sau tuổi nghỉ hưu mà vượt ngưỡng 30/35 năm được 2 lần mức bình quân mỗi năm (năm đóng thêm chưa vượt ngưỡng thì không có trợ cấp một lần). Tuổi nghỉ hưu năm 2026: nam 61 tuổi 6 tháng, nữ 57 tuổi. Mức sàn 2.530.000đ/tháng chỉ áp dụng cho người tham gia BHXH bắt buộc từ đủ 20 năm trước 01/7/2025 (khoản 11 Điều 141) — công cụ không áp sàn chung. Kết quả ước tính theo số liệu bạn nhập — đối chiếu VssID hoặc cơ quan BHXH để biết chính xác.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + ' ₫');
  const parseNum = U.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = U.toast || (m => alert(m));
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const $ = id => root.querySelector('#' + id);
  const fmtNum = n => (Number.isInteger(n) ? String(n) : n.toLocaleString('vi-VN'));
  const fmtPct = n => fmtNum(n) + '%';
  const fmtYears = y => fmtNum(y) + ' năm';
  const CAP = 50600000;
  const FLOOR = 2530000;

  function calc() {
    const gender = $('lh-gender').value;
    const y = Math.max(0, Math.floor(parseNum($('lh-years').value)));
    const m = Math.min(11, Math.max(0, Math.floor(parseNum($('lh-months').value))));
    const avgInput = parseNum($('lh-avg').value);
    const ey = Math.max(0, Math.floor(parseNum($('lh-early-y').value)));
    const em = Math.min(11, Math.max(0, Math.floor(parseNum($('lh-early-m').value))));
    const postInput = Math.max(0, Math.floor(parseNum($('lh-post').value)));
    if (!(avgInput > 0)) { toast('Vui lòng nhập mức bình quân tiền lương tháng đóng BHXH.'); return; }
    const totalMonths = y * 12 + m;
    if (totalMonths <= 0) { toast('Vui lòng nhập thời gian đã đóng BHXH.'); return; }

    const avg = Math.min(avgInput, CAP);
    const capped = avgInput > CAP;
    const fullY = Math.floor(totalMonths / 12);
    const rem = totalMonths % 12;
    const frac = rem === 0 ? 0 : rem <= 6 ? 0.5 : 1;
    const effY = fullY + frac;
    const resEl = $('lh-result');
    resEl.hidden = false;

    // Chưa đủ 15 năm: không được hưởng lương hưu hằng tháng.
    if (effY < 15) {
      const need = 15 - effY;
      resEl.innerHTML =
        '<div class="result-row"><span>Tổng thời gian đóng (quy đổi)</span><span>' + fmtYears(effY) + '</span></div>' +
        '<div class="result-row"><span>Kết quả</span><strong>Chưa đủ điều kiện hưởng lương hưu hằng tháng</strong></div>' +
        '<div class="result-row"><span>Còn thiếu</span><span>' + fmtYears(need) + ' nữa mới đủ 15 năm tối thiểu.</span></div>' +
        '<div class="result-row"><span>Gợi ý</span><span>Đóng tiếp BHXH tự nguyện cho đủ 15 năm để được hưởng lương hưu, hoặc rút BHXH một lần nếu không muốn đóng tiếp — <a href="/cong-cu/bhxh-mot-lan/">tính BHXH một lần →</a> Ngoài ra, người đã đủ tuổi nghỉ hưu mà đóng chưa đủ 15 năm có thể được nhận trợ cấp hằng tháng từ quỹ BHXH — hỏi cơ quan BHXH nơi cư trú để biết mức cụ thể.</span></div>';
      return;
    }

    const threshold = gender === 'nu' ? 30 : 35;
    let rate;
    let rateExplain;
    if (gender === 'nu') {
      const raw = 45 + 2 * (effY - 15);
      rate = Math.min(75, raw);
      rateExplain = '45% + 2% × ' + fmtYears(effY - 15) + ' trên 15 năm' + (raw > 75 ? ' (vượt trần nên lấy tối đa 75%)' : '');
    } else if (effY <= 20) {
      rate = 40 + (effY - 15);
      rateExplain = '40% + 1% × ' + fmtYears(effY - 15) + ' trên 15 năm';
    } else {
      const raw = 45 + 2 * (effY - 20);
      rate = Math.min(75, raw);
      rateExplain = '45% + 2% × ' + fmtYears(effY - 20) + ' trên 20 năm' + (raw > 75 ? ' (vượt trần nên lấy tối đa 75%)' : '');
    }

    const earlyMonths = ey * 12 + em;
    const earlyFullY = Math.floor(earlyMonths / 12);
    const earlyRem = earlyMonths % 12;
    const reduction = 2 * earlyFullY + (earlyRem >= 6 ? 1 : 0);
    const rateFinal = Math.max(0, rate - reduction);
    const pension = rateFinal / 100 * avg;

    // Trợ cấp một lần (Điều 68): chỉ năm đóng VƯỢT ngưỡng 30/35 năm mới
    // được tính — 0,5 lần mức bình quân/năm cho phần vượt tính tới tuổi
    // nghỉ hưu, 2 lần/năm cho phần vượt đóng sau tuổi nghỉ hưu. Năm đóng
    // thêm sau tuổi nghỉ hưu mà chưa vượt ngưỡng thì KHÔNG có trợ cấp.
    const post = Math.min(postInput, Math.floor(effY));
    const yearsAtRetire = effY - post;
    const excessBefore = Math.max(0, yearsAtRetire - threshold);
    const excessAfter = Math.max(0, effY - Math.max(threshold, yearsAtRetire));
    const lumpExcess = excessBefore * 0.5 * avg;
    const lumpPost = excessAfter * 2 * avg;
    const lump = lumpExcess + lumpPost;

    let rows = '';
    rows += '<div class="result-row"><span>Tổng thời gian đóng (quy đổi)</span><span>' + fmtYears(effY) + (rem ? ' (gồm ' + rem + ' tháng lẻ tính là ' + (frac === 0.5 ? 'nửa năm' : '1 năm') + ')' : '') + '</span></div>';
    rows += '<div class="result-row"><span>Tỷ lệ hưởng cơ bản</span><span>' + fmtPct(rate) + ' — ' + rateExplain + '</span></div>';
    rows += '<div class="result-row"><span>Giảm do nghỉ hưu trước tuổi</span><span>' + (reduction > 0 ? '−' + fmtPct(reduction) + (earlyFullY ? ' (' + fmtYears(earlyFullY) + ' nghỉ sớm)' : '') + (earlyRem >= 6 ? ' (thêm ' + earlyRem + ' tháng lẻ nghỉ sớm)' : '') : '0% (nghỉ đúng tuổi)') + '</span></div>';
    rows += '<div class="result-row"><span>Tỷ lệ hưởng sau khi trừ</span><span>' + fmtPct(rateFinal) + '</span></div>';
    rows += '<div class="result-row"><span>Mức bình quân tiền lương tháng</span><span>' + fmtVND(avg) + (capped ? ' (đã áp trần đóng BHXH 50.600.000đ)' : '') + '</span></div>';
    rows += '<div class="result-row"><span>Lương hưu hằng tháng (ước tính)</span><strong>' + fmtVND(pension) + '</strong></div>';
    if (lump > 0) {
      const parts = [];
      if (lumpExcess > 0) parts.push('vượt ' + fmtYears(excessBefore) + ' trên ' + threshold + ' năm tính tới tuổi nghỉ hưu: ' + fmtVND(lumpExcess));
      if (lumpPost > 0) parts.push(fmtYears(excessAfter) + ' vượt ngưỡng đóng sau tuổi nghỉ hưu: ' + fmtVND(lumpPost));
      rows += '<div class="result-row"><span>Trợ cấp một lần khi nghỉ hưu</span><span><strong>' + fmtVND(lump) + '</strong> (' + parts.join('; ') + ')</span></div>';
    } else {
      rows += '<div class="result-row"><span>Trợ cấp một lần</span><span>Không có — tổng thời gian đóng chưa vượt ' + threshold + ' năm.</span></div>';
    }
    if (pension < FLOOR) {
      rows += '<div class="result-row"><span>Lưu ý mức sàn</span><span>Lương hưu tính ra dưới 2.530.000đ/tháng. Mức sàn 2.530.000đ chỉ áp dụng cho người tham gia BHXH bắt buộc từ đủ 20 năm trước 01/7/2025 — không phải ai cũng được áp sàn, công cụ không tự nâng mức này.</span></div>';
    }
    rows += '<div class="result-row"><span>Đối chiếu</span><span>Kết quả ước tính theo số liệu bạn nhập — đối chiếu VssID hoặc cơ quan BHXH để biết chính xác.</span></div>';
    resEl.innerHTML = rows;
  }

  $('lh-calc').addEventListener('click', calc);
  // Ví dụ: nữ, 28 năm, bình quân 12 triệu → 71% → 8.520.000đ/tháng.
  $('lh-example').addEventListener('click', () => {
    fillEx(root, { 'lh-gender': 'nu', 'lh-years': '28', 'lh-months': '0', 'lh-avg': '12.000.000', 'lh-early-y': '0', 'lh-early-m': '0', 'lh-post': '0' }, $('lh-calc'));
  });
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
