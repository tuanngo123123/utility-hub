// Tính lương tháng 13 — Utility Hub (Văn phòng)
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ. Công thức ở src/money-formulas.js (M2_CALC); thẻ
// kết quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'luong-thang-13',
  name: 'Tính lương tháng 13',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Ước tính tiền thưởng lương tháng 13 theo số tháng làm việc và thuế TNCN phải nộp trên khoản đó.',
  keywords: 'lương tháng 13, thưởng tết, thuế TNCN tháng 13, 13th month salary',
  icon: '🧧',
  seoTitle: 'Tính lương tháng 13 & thuế TNCN phải nộp',
  seoDesc: 'Ước tính tiền thưởng lương tháng 13 theo tỷ lệ tháng làm việc trong năm và thuế thu nhập cá nhân trên khoản thưởng đó.'
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="lt13-salary">Lương tháng hiện tại</label>
          <span class="input-unit"><input id="lt13-salary" class="m2-salary" type="text" inputmode="decimal" value="15.000.000" placeholder="Ví dụ: 15.000.000"><span class="unit">₫</span></span>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức lương">
          <button type="button" class="m2-quick-btn" data-lt13-quick="10000000">10 triệu</button>
          <button type="button" class="m2-quick-btn" data-lt13-quick="15000000">15 triệu</button>
          <button type="button" class="m2-quick-btn" data-lt13-quick="30000000">30 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field"><label for="lt13-months">Số tháng làm việc trong năm</label><input id="lt13-months" class="m2-num" type="number" min="0" max="12" step="1" value="12"></div>
          <div class="field m2-field"><label for="lt13-dependents">Số người phụ thuộc</label><input id="lt13-dependents" class="m2-num" type="number" min="0" step="1" value="0"></div>
        </div>
        <p class="hint">Giảm trừ 6.200.000₫/người phụ thuộc/tháng.</p>
        <div class="field m2-field">
          <label for="lt13-insurance">Bảo hiểm bắt buộc đóng trong tháng nhận thưởng</label>
          <span class="input-unit"><input id="lt13-insurance" class="m2-money" type="text" inputmode="decimal" value="" placeholder="Ví dụ: 1.575.000"><span class="unit">₫</span></span>
          <p class="hint">Để trống thì tự tính 10,5% lương. Nhập 0 nếu tháng nhận thưởng không đóng bảo hiểm (ví dụ đã nghỉ việc); nhập số khác nếu lương đóng bảo hiểm khác lương gross.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="lt13-result-card">
      <div id="lt13-out"></div>
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
  const markErr = U.markFieldError || function (el, msg) { $('lt13-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('lt13-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('lt13-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả lương tháng 13',
  });

  function render(o, salary, months, dependents, insurance) {
    lastCopyText = 'Thưởng tháng 13 (gộp): ' + fmtVND(o.bonus)
      + ' · Thuế TNCN trên thưởng: ' + fmtVND(o.taxOnBonus)
      + ' · Thực nhận: ' + fmtVND(o.net)
      + ' · Thu nhập tính thuế tháng nhận thưởng: ' + fmtVND(o.taxableMonth);
    M2.renderResult($('lt13-out'), {
      label: 'Thực nhận ước tính',
      value: fmtVND(o.net),
      pctLine: 'Thưởng ' + fmtNum(months) + '/12 tháng · thuế trên thưởng ' + fmtVND(o.taxOnBonus),
      rows: [
        { label: 'Thưởng tháng 13 (gộp)', value: fmtVND(o.bonus) },
        { label: 'Thuế TNCN trên khoản thưởng', value: '− ' + fmtVND(o.taxOnBonus) },
        { label: 'Thu nhập tính thuế', value: fmtVND(o.taxableMonth) },
      ],
      steps: [
        { label: 'Lương tháng hiện tại', sub: '', amount: fmtVND(salary) },
        { label: 'Thưởng tháng 13 (' + fmtNum(months) + '/12 tháng)', sub: fmtVND(salary) + ' × ' + fmtNum(months) + ' ÷ 12', amount: fmtVND(o.bonus) },
        { label: 'Thu nhập tháng nhận thưởng', sub: 'Lương ' + fmtVND(salary) + ' + thưởng ' + fmtVND(o.bonus), amount: fmtVND(salary + o.bonus) },
        { label: 'Giảm trừ gia cảnh + bảo hiểm', sub: 'Bản thân 15.500.000₫' + (dependents ? ' + ' + dependents + ' người phụ thuộc × 6.200.000₫' : '') + (insurance ? ' + bảo hiểm ' + fmtVND(insurance) : ''), amount: '− ' + fmtVND(o.deduction) },
        { label: 'Thu nhập tính thuế tháng nhận thưởng', sub: '', amount: fmtVND(o.taxableMonth) },
        { label: 'Thuế của tháng có thưởng', sub: 'Theo biểu lũy tiến 5 bậc 2026', amount: fmtVND(o.taxWith) },
        { label: 'Thuế của tháng không có thưởng', sub: 'Thu nhập tính thuế ' + fmtVND(o.taxableWithout), amount: '− ' + fmtVND(o.taxWithout) },
        { label: 'Thuế TNCN trên khoản thưởng', sub: 'Phần chênh lệch thuế của tháng nhận thưởng', amount: fmtVND(o.taxOnBonus) },
        { label: 'Thực nhận ước tính', sub: '', amount: fmtVND(o.net) },
      ],
      note: 'Thuế TNCN tính theo biểu thuế lũy tiến 5 bậc năm 2026 (Luật 109/2025/QH15) trên thu nhập tính thuế của tháng nhận thưởng. Kết quả chỉ là ước tính — số thuế thực tế phụ thuộc vào cách tính của công ty và các khoản giảm trừ khác của bạn.',
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả lương tháng 13',
      shareTitle: 'Tính lương tháng 13',
      image: {
        title: 'LƯƠNG THÁNG 13',
        file: 'luong-thang-13.png',
        heroLabel: 'Thực nhận ước tính',
        heroValue: fmtVND(o.net),
        pctLine: 'Thưởng ' + fmtNum(months) + '/12 tháng · thuế trên thưởng ' + fmtVND(o.taxOnBonus),
        rows: [
          ['Thưởng tháng 13 (gộp)', fmtVND(o.bonus), false],
          ['Thuế TNCN trên thưởng', '− ' + fmtVND(o.taxOnBonus), false],
          ['Thực nhận', fmtVND(o.net), true],
        ],
      },
    }, stepsState);
    sticky.update('Thực nhận', fmtVND(o.net));
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const salary = parseNum($('lt13-salary').value);
    const months = Math.min(12, Math.max(0, Math.floor(parseNum($('lt13-months').value))));
    const dependents = Math.max(0, Math.floor(parseNum($('lt13-dependents').value)));
    // Ô bảo hiểm để trống thì tự lấy 10,5% lương (theo mẫu Gross-Net: trống =
    // tính theo lương); người dùng vẫn sửa tay khi lương đóng bảo hiểm khác
    // lương gross, hoặc nhập 0 khi tháng nhận thưởng không đóng bảo hiểm.
    const insRaw = $('lt13-insurance').value.trim();
    const insurance = insRaw === '' ? Math.round(salary * 0.105) : Math.max(0, parseNum(insRaw));
    if (!(salary > 0)) {
      if (showErrors) {
        markErr($('lt13-salary'), 'Ô Lương tháng chưa có số — nhập số lớn hơn 0, ví dụ 15.000.000.');
        focusEl($('lt13-salary'));
      }
      M2.renderEmpty($('lt13-out'), 'Nhập lương tháng để xem thưởng tháng 13.');
      return false;
    }
    render(C.luongThang13(salary, months, dependents, insurance), salary, months, dependents, insurance);
    return true;
  }

  M2.bindMoneyFormat($('lt13-salary'));
  M2.bindMoneyFormat($('lt13-insurance'));

  root.querySelectorAll('[data-lt13-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('lt13-salary');
      el.value = fmtNum(parseInt(btn.getAttribute('data-lt13-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['lt13-salary', 'lt13-months', 'lt13-dependents', 'lt13-insurance'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  tryRender(true);
}
