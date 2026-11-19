// Tính lương hưu — theo Điều 66, 68 Luật BHXH 2024 (41/2024/QH15, hiệu lực
// 01/7/2025) + Điều 13 Nghị định 158/2025/NĐ-CP (tháng lẻ, giảm trừ nghỉ
// hưu trước tuổi) + Nghị định 161/2026/NĐ-CP (trần đóng 50.600.000đ).
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ. Công thức ở src/money-formulas.js (M2_CALC); thẻ
// kết quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
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
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="lh-gender">Giới tính</label>
          <select id="lh-gender" class="m2-select"><option value="nu">Nữ</option><option value="nam">Nam</option></select>
          <p class="hint">Tỷ lệ hưởng khác nhau giữa nam và nữ (Điều 66 Luật BHXH 2024).</p>
        </div>
        <div class="m2-row2">
          <div class="field m2-field"><label for="lh-years">Số năm đóng BHXH</label><input id="lh-years" class="m2-num" type="number" min="0" step="1" value="28"></div>
          <div class="field m2-field"><label for="lh-months">Tháng lẻ</label><input id="lh-months" class="m2-num" type="number" min="0" max="11" step="1" value="0"></div>
        </div>
        <p class="hint">Tháng lẻ 1–6 tháng tính là nửa năm, 7–11 tháng tính là 1 năm.</p>
        <div class="field m2-field">
          <label for="lh-avg">Mức bình quân tiền lương tháng đóng BHXH</label>
          <span class="input-unit"><input id="lh-avg" class="m2-salary" type="text" inputmode="decimal" value="12.000.000" placeholder="VD: 12.000.000"><span class="unit">₫</span></span>
          <p class="hint">Lương bình quân toàn bộ quá trình đóng (tra trên VssID). Trần tính lương hưu: 50.600.000₫ từ 01/7/2026 (NĐ 161/2026/NĐ-CP).</p>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức bình quân">
          <button type="button" class="m2-quick-btn" data-lh-quick="8000000">8 triệu</button>
          <button type="button" class="m2-quick-btn" data-lh-quick="12000000">12 triệu</button>
          <button type="button" class="m2-quick-btn" data-lh-quick="20000000">20 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field"><label for="lh-early-y">Nghỉ sớm — số năm</label><input id="lh-early-y" class="m2-num" type="number" min="0" step="1" value="0"></div>
          <div class="field m2-field"><label for="lh-early-m">Nghỉ sớm — tháng lẻ</label><input id="lh-early-m" class="m2-num" type="number" min="0" max="11" step="1" value="0"></div>
        </div>
        <p class="hint">Tuổi nghỉ hưu năm 2026: nam 61 tuổi 6 tháng, nữ 57 tuổi. Nghỉ sớm mỗi năm tròn trừ 2%; tháng lẻ 6–11 tháng trừ 1%, dưới 6 tháng không trừ.</p>
        <div class="field m2-field">
          <label for="lh-post">Số năm đóng thêm sau khi đã đủ tuổi nghỉ hưu</label>
          <input id="lh-post" class="m2-num" type="number" min="0" step="1" value="0">
          <p class="hint">Chỉ năm đóng thêm nào VƯỢT ngưỡng 30 năm (nữ) / 35 năm (nam) mới được tính trợ cấp một lần 2 lần mức bình quân mỗi năm (Điều 68). Để 0 nếu nghỉ đúng tuổi.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="lh-result-card">
      <div id="lh-out"></div>
    </div>
  </div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const C = (typeof window !== 'undefined' && window.M2_CALC) || null;
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('lh-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('lh-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const fmtYears = y => (Number.isInteger(y) ? String(y) : y.toLocaleString('vi-VN')) + ' năm';
  const fmtPct = r => r.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%';
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('lh-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả lương hưu',
  });

  function render(o, gender, avg, earlyY, earlyM) {
    const genderText = gender === 'nu' ? 'Nữ' : 'Nam';
    if (!o.eligible) {
      lastCopyText = '';
      M2.renderResult($('lh-out'), {
        label: 'Lương hưu hằng tháng (ước tính)',
        value: 'Chưa đủ 15 năm',
        pctLine: 'Đã đóng ' + fmtYears(o.effY) + ' · còn thiếu ' + fmtYears(o.needYears),
        rows: [
          { label: 'Tổng thời gian đóng', value: fmtYears(o.effY) },
          { label: 'Còn thiếu để hưởng lương hưu', value: fmtYears(o.needYears) },
          { label: 'Mức bình quân tiền lương', value: fmtVND(avg) },
        ],
        steps: [
          { label: 'Tổng thời gian đóng', sub: '', amount: fmtYears(o.effY) },
          { label: 'Điều kiện hưởng lương hưu hằng tháng', sub: 'Tối thiểu 15 năm đóng BHXH (Luật BHXH 2024)', amount: '15 năm' },
        ],
        note: 'Bạn chưa đủ 15 năm đóng nên chưa hưởng được lương hưu hằng tháng — có thể đóng BHXH tự nguyện thêm cho đủ 15 năm, hoặc rút BHXH một lần khi đủ điều kiện. Người đã đủ tuổi nghỉ hưu mà đóng chưa đủ 15 năm có thể được nhận trợ cấp hằng tháng từ quỹ BHXH — hỏi cơ quan BHXH nơi cư trú để biết mức cụ thể.',
        copyText: '',
        image: null,
      }, stepsState);
      sticky.hide();
      return;
    }
    const notes = [];
    if (earlyY > 0 || earlyM > 0) {
      notes.push('Về hưu trước tuổi: trừ 2% cho mỗi năm về sớm (tháng lẻ 6–11 tháng trừ 1%, dưới 6 tháng không trừ).');
    }
    if (o.pension < 2530000) {
      notes.push('Mức hưu bạn tính được thấp hơn 2.530.000₫ — mức sàn này chỉ áp dụng với người tham gia BHXH bắt buộc đủ 20 năm trở lên trước 01/7/2025, công cụ không tự nâng mức này.');
    }
    const steps = [
      { label: 'Tổng thời gian đóng', sub: o.rem ? 'Tháng lẻ 1–6 tháng tính nửa năm, 7–11 tháng tính 1 năm' : '', amount: fmtYears(o.effY) },
      { label: 'Tỷ lệ hưởng ban đầu (' + genderText + ', ' + fmtYears(o.effY) + ')', sub: o.rateExplain, amount: fmtPct(o.rate) },
    ];
    if (o.reduction > 0) {
      steps.push({ label: 'Trừ vì về hưu trước tuổi', sub: 'Về sớm ' + fmtYears(earlyY) + (earlyM ? ' ' + earlyM + ' tháng' : ''), amount: '− ' + fmtPct(o.reduction) });
      steps.push({ label: 'Tỷ lệ hưởng sau khi trừ', sub: '', amount: fmtPct(o.rateFinal) });
    }
    steps.push(
      { label: 'Mức bình quân tiền lương tháng' + (o.capped ? ' (đã áp trần 50.600.000₫)' : ''), sub: '', amount: fmtVND(o.avg) },
      { label: 'Lương hưu hằng tháng (ước tính)', sub: '', amount: fmtVND(o.pension) },
    );
    if (o.lump > 0) {
      const parts = [];
      if (o.lumpExcess > 0) parts.push('vượt ' + fmtYears(o.excessBefore) + ' trên ' + o.threshold + ' năm tính tới tuổi nghỉ hưu: ' + fmtVND(o.lumpExcess));
      if (o.lumpPost > 0) parts.push(fmtYears(o.excessAfter) + ' vượt ngưỡng đóng sau tuổi nghỉ hưu: ' + fmtVND(o.lumpPost));
      steps.push({ label: 'Trợ cấp một lần khi nghỉ hưu', sub: parts.join('; '), amount: fmtVND(o.lump) });
    }
    lastCopyText = 'Giới tính: ' + genderText
      + ' · Đóng: ' + fmtYears(o.effY)
      + ' · Tỷ lệ hưởng: ' + fmtPct(o.rateFinal)
      + ' · Lương hưu/tháng: ' + fmtVND(o.pension)
      + ' · Trợ cấp một lần: ' + fmtVND(o.lump);
    const pctLine = 'Tỷ lệ hưởng ' + fmtPct(o.rateFinal)
      + (o.reduction > 0 ? ' (đã trừ vì về sớm)' : '')
      + ' × mức bình quân ' + fmtVND(o.avg);
    M2.renderResult($('lh-out'), {
      label: 'Lương hưu hằng tháng (ước tính)',
      value: fmtVND(o.pension),
      pctLine,
      rows: [
        { label: 'Tỷ lệ hưởng', value: fmtPct(o.rateFinal) + (o.reduction > 0 ? ' (gốc ' + fmtPct(o.rate) + ')' : '') },
        { label: 'Trợ cấp một lần', value: fmtVND(o.lump) },
        { label: 'Tổng thời gian đóng', value: fmtYears(o.effY) },
      ],
      steps,
      note: notes.length ? notes.join(' ') : undefined,
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả lương hưu',
      shareTitle: 'Tính lương hưu BHXH',
      image: {
        title: 'LƯƠNG HƯU BHXH',
        file: 'luong-huu.png',
        heroLabel: 'Lương hưu hằng tháng (ước tính)',
        heroValue: fmtVND(o.pension),
        pctLine,
        rows: [
          ['Giới tính', genderText, false],
          ['Thời gian đóng', fmtYears(o.effY), false],
          ['Tỷ lệ hưởng', fmtPct(o.rateFinal), false],
          ['Lương hưu / tháng', fmtVND(o.pension), true],
          ['Trợ cấp một lần', fmtVND(o.lump), false],
        ],
      },
    }, stepsState);
    sticky.update('Lương hưu', fmtVND(o.pension));
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const gender = $('lh-gender').value;
    const years = Math.max(0, Math.floor(parseNum($('lh-years').value)));
    const months = Math.min(11, Math.max(0, Math.floor(parseNum($('lh-months').value))));
    const avg = parseNum($('lh-avg').value);
    const earlyY = Math.max(0, Math.floor(parseNum($('lh-early-y').value)));
    const earlyM = Math.min(11, Math.max(0, Math.floor(parseNum($('lh-early-m').value))));
    const post = Math.max(0, Math.floor(parseNum($('lh-post').value)));
    if (!(avg > 0)) {
      if (showErrors) {
        markErr($('lh-avg'), 'Ô Mức bình quân chưa có số — nhập số lớn hơn 0, ví dụ 12.000.000.');
        focusEl($('lh-avg'));
      }
      M2.renderEmpty($('lh-out'), 'Nhập mức bình quân để xem lương hưu.');
      return false;
    }
    if (years * 12 + months <= 0) {
      if (showErrors) {
        markErr($('lh-years'), 'Chưa nhập thời gian đóng BHXH — nhập số năm hoặc số tháng lẻ đã đóng.');
        focusEl($('lh-years'));
      }
      M2.renderEmpty($('lh-out'), 'Nhập thời gian đóng để xem lương hưu.');
      return false;
    }
    render(C.luongHuu(gender, years, months, avg, earlyY, earlyM, post), gender, avg, earlyY, earlyM);
    return true;
  }

  M2.bindMoneyFormat($('lh-avg'));

  root.querySelectorAll('[data-lh-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('lh-avg');
      el.value = fmtNum(parseInt(btn.getAttribute('data-lh-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['lh-gender', 'lh-years', 'lh-months', 'lh-avg', 'lh-early-y', 'lh-early-m', 'lh-post'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  tryRender(true);
}
