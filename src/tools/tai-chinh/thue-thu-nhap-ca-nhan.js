// Tính thuế thu nhập cá nhân 2026 — biểu lũy tiến 5 bậc (Luật 109/2025/QH15),
// giảm trừ bản thân 15,5 triệu + phụ thuộc 6,2 triệu/người (NQ 110/2025/UBTVQH15).
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ. Công thức ở src/money-formulas.js (M2_CALC); thẻ
// kết quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'thue-thu-nhap-ca-nhan',
  name: 'Tính thuế thu nhập cá nhân 2026',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính thuế TNCN từ lương theo biểu lũy tiến 5 bậc năm 2026 (5%–35%): nhập lương và số người phụ thuộc, xem thuế từng bậc, thuế tháng và thuế năm.',
  keywords: 'thuế thu nhập cá nhân 2026, tính thuế TNCN, biểu thuế 5 bậc, giảm trừ gia cảnh 15,5 triệu, thuế lương',
  icon: '🧾',
  seoTitle: 'Tính thuế thu nhập cá nhân 2026 — biểu thuế 5 bậc, giảm trừ 15,5 triệu',
  seoDesc: 'Tính thuế TNCN 2026 từ lương: giảm trừ bản thân 15,5 triệu/tháng, người phụ thuộc 6,2 triệu/người, biểu lũy tiến 5 bậc 5%–35%. Xem thuế từng bậc, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="m2-toggle" role="group" aria-label="Cách tính thuế">
          <button type="button" class="m2-toggle-btn m2-toggle-active" id="tncn-tab-salary">Từ lương tháng</button>
          <button type="button" class="m2-toggle-btn" id="tncn-tab-taxable">Từ thu nhập tính thuế</button>
        </div>
        <div id="tncn-panel-salary-top">
          <div class="field m2-field">
            <label for="tncn-gross">Lương Gross mỗi tháng</label>
            <span class="input-unit"><input id="tncn-gross" class="m2-salary" type="text" inputmode="decimal" value="45.000.000" placeholder="Ví dụ: 45.000.000"><span class="unit">₫</span></span>
          </div>
          <div class="m2-quick" aria-label="Chọn nhanh mức lương">
            <button type="button" class="m2-quick-btn" data-tncn-quick="15000000">15 triệu</button>
            <button type="button" class="m2-quick-btn" data-tncn-quick="30000000">30 triệu</button>
            <button type="button" class="m2-quick-btn" data-tncn-quick="45000000">45 triệu</button>
          </div>
        </div>
        <div id="tncn-panel-taxable-top" hidden>
          <div class="field m2-field">
            <label for="tncn-taxable">Thu nhập tính thuế mỗi tháng</label>
            <span class="input-unit"><input id="tncn-taxable" class="m2-salary" type="text" inputmode="decimal" value="18.575.000" placeholder="Ví dụ: 18.575.000"><span class="unit">₫</span></span>
            <p class="hint">Thu nhập tính thuế = lương Gross − bảo hiểm bắt buộc − giảm trừ bản thân (15,5 triệu) − giảm trừ người phụ thuộc (6,2 triệu/người). Dùng ô này khi bạn đã tự tính được thu nhập tính thuế.</p>
          </div>
        </div>
      </div>
      <div class="m2-input-bottom" id="tncn-panel-salary-bottom">
        <div class="field m2-field">
          <label for="tncn-ins">Lương đóng bảo hiểm <span class="m2-optional">(không bắt buộc)</span></label>
          <span class="input-unit"><input id="tncn-ins" class="m2-money" type="text" inputmode="decimal" value="45.000.000" placeholder="Bằng lương Gross"><span class="unit">₫</span></span>
          <p class="hint">Để trống nếu công ty đóng bảo hiểm trên toàn bộ lương. Người lao động đóng BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5%.</p>
        </div>
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="tncn-region">Vùng lương tối thiểu</label>
            <select id="tncn-region" class="m2-select">
              <option value="106200000">Vùng I</option>
              <option value="94600000">Vùng II</option>
              <option value="82800000">Vùng III</option>
              <option value="74000000">Vùng IV</option>
            </select>
            <p class="hint" id="tncn-region-hint">Trần đóng BHTN vùng này: 106.200.000₫/tháng.</p>
          </div>
          <div class="field m2-field">
            <label id="tncn-dep-label">Người phụ thuộc</label>
            <div class="m2-stepper" role="group" aria-labelledby="tncn-dep-label">
              <button type="button" class="m2-step-btn" id="tncn-dep-minus" aria-label="Giảm một người phụ thuộc">−</button>
              <input id="tncn-dep" class="m2-step-num" type="text" inputmode="none" readonly value="1" aria-label="Số người phụ thuộc">
              <button type="button" class="m2-step-btn" id="tncn-dep-plus" aria-label="Thêm một người phụ thuộc">+</button>
            </div>
            <p class="hint">Giảm trừ 6.200.000₫/người/tháng.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="tncn-result-card">
      <div id="tncn-out"></div>
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
  const markErr = U.markFieldError || function (el, msg) { $('tncn-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('tncn-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const REGION_CAPS = {
    '106200000': '106.200.000₫',
    '94600000': '94.600.000₫',
    '82800000': '82.800.000₫',
    '74000000': '74.000.000₫',
  };

  let mode = 'salary';
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('tncn-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả thuế TNCN',
  });

  const nb = s => s.replace(/ ₫/g, ' ₫');
  function bracketDetail(rows) {
    return rows.length
      ? rows.map(x => nb(fmtVND(x.base)) + ' × ' + x.rate + '% = ' + nb(fmtVND(x.tax))).join('; ')
      : 'Thu nhập tính thuế bằng 0 nên không phải nộp thuế.';
  }
  function avgRate(o) {
    if (!(o.taxable > 0)) return '';
    return (o.tax / o.taxable * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function render(o) {
    lastCopyText = 'Thu nhập tính thuế: ' + fmtVND(o.taxable)
      + ' · Thuế TNCN/tháng: ' + fmtVND(o.tax)
      + ' · Thuế TNCN/năm (ước tính × 12): ' + fmtVND(o.tax * 12);
    const pctLine = o.fromSalary
      ? 'Bằng ' + (o.tax / o.gross * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '% lương Gross · thuế suất bình quân ' + avgRate(o) + '%'
      : 'Thuế suất bình quân ' + avgRate(o) + '% trên thu nhập tính thuế';
    const steps = o.fromSalary
      ? [
        { label: 'Lương Gross', sub: '', amount: fmtVND(o.gross) },
        { label: 'Bảo hiểm bắt buộc (10,5%)', sub: 'BHXH ' + nb(fmtVND(o.bhxh)) + ' · BHYT ' + nb(fmtVND(o.bhyt)) + ' · BHTN ' + nb(fmtVND(o.bhtn)), amount: '− ' + fmtVND(o.insurance) },
        { label: 'Giảm trừ bản thân', sub: '', amount: '− ' + fmtVND(C.DEDUCT_SELF) },
        { label: 'Giảm trừ ' + o.deps + ' người phụ thuộc', sub: '6.200.000₫/người/tháng', amount: '− ' + fmtVND(o.deps * C.DEDUCT_DEP) },
        { label: 'Thu nhập tính thuế ' + fmtVND(o.taxable) + ' → thuế TNCN', sub: bracketDetail(o.taxRows), amount: '− ' + fmtVND(o.tax) },
        { label: 'Thuế TNCN phải nộp mỗi tháng', sub: '', amount: fmtVND(o.tax) },
      ]
      : [
        { label: 'Thu nhập tính thuế', sub: '', amount: fmtVND(o.taxable) },
        { label: 'Thuế TNCN theo biểu lũy tiến 5 bậc', sub: bracketDetail(o.taxRows), amount: fmtVND(o.tax) },
      ];
    const rows = o.fromSalary
      ? [
        { label: 'Thu nhập tính thuế', value: fmtVND(o.taxable) },
        { label: 'Thuế TNCN cả năm (ước tính × 12)', value: fmtVND(o.tax * 12) },
        { label: 'Bảo hiểm bắt buộc (10,5%)', value: '− ' + fmtVND(o.insurance) },
      ]
      : [
        { label: 'Thu nhập tính thuế', value: fmtVND(o.taxable) },
        { label: 'Thuế TNCN cả năm (ước tính × 12)', value: fmtVND(o.tax * 12) },
        { label: 'Thuế suất bình quân', value: avgRate(o) + '%' },
      ];
    const imageRows = o.fromSalary
      ? [
        ['Lương Gross', fmtVND(o.gross), false],
        ['Bảo hiểm (10,5%)', '− ' + fmtVND(o.insurance), false],
        ['Thu nhập tính thuế', fmtVND(o.taxable), false],
        ['Thuế TNCN / tháng', fmtVND(o.tax), true],
        ['Thuế TNCN / năm (ước tính)', fmtVND(o.tax * 12), false],
      ]
      : [
        ['Thu nhập tính thuế', fmtVND(o.taxable), false],
        ['Thuế TNCN / tháng', fmtVND(o.tax), true],
        ['Thuế TNCN / năm (ước tính)', fmtVND(o.tax * 12), false],
      ];
    M2.renderResult($('tncn-out'), {
      label: 'Thuế TNCN phải nộp mỗi tháng',
      value: fmtVND(o.tax),
      pctLine,
      rows,
      steps,
      note: 'Thuế thực nộp do cơ quan thuế và đơn vị chi trả xác định; trường hợp có nhiều nguồn thu nhập, thu nhập vãng lai hoặc quyết toán năm, hãy đối chiếu với cơ quan thuế.',
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả thuế TNCN',
      shareTitle: 'Tính thuế thu nhập cá nhân 2026',
      image: {
        title: 'THUẾ THU NHẬP CÁ NHÂN 2026',
        file: 'thue-tncn.png',
        heroLabel: 'Thuế TNCN phải nộp mỗi tháng',
        heroValue: fmtVND(o.tax),
        pctLine,
        rows: imageRows,
      },
    }, stepsState);
    sticky.update('Thuế', fmtVND(o.tax));
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    if (mode === 'salary') {
      const gross = parseNum($('tncn-gross').value);
      const insRaw = $('tncn-ins').value.trim();
      const bhtnCap = parseNum($('tncn-region').value);
      const deps = Math.max(0, parseInt($('tncn-dep').value, 10) || 0);
      if (!(gross > 0)) {
        if (showErrors) {
          markErr($('tncn-gross'), 'Ô Lương Gross chưa có số — nhập số lớn hơn 0, ví dụ 45.000.000.');
          focusEl($('tncn-gross'));
        }
        M2.renderEmpty($('tncn-out'), 'Nhập lương để xem thuế phải nộp.');
        return false;
      }
      if (insRaw !== '' && !(parseNum(insRaw) > 0)) {
        if (showErrors) {
          markErr($('tncn-ins'), 'Ô Lương đóng bảo hiểm chưa đúng — để trống (mặc định bằng lương Gross) hoặc nhập số lớn hơn 0.');
          focusEl($('tncn-ins'));
        }
        M2.renderEmpty($('tncn-out'), 'Nhập lương để xem thuế phải nộp.');
        return false;
      }
      const insSalary = insRaw === '' ? gross : parseNum(insRaw);
      render(C.thueTncnFromSalary(gross, insSalary, bhtnCap, deps));
    } else {
      const taxable = parseNum($('tncn-taxable').value);
      if (!(taxable > 0)) {
        if (showErrors) {
          markErr($('tncn-taxable'), 'Ô Thu nhập tính thuế chưa có số — nhập số lớn hơn 0, ví dụ 18.575.000.');
          focusEl($('tncn-taxable'));
        }
        M2.renderEmpty($('tncn-out'), 'Nhập thu nhập tính thuế để xem thuế phải nộp.');
        return false;
      }
      render(C.thueTncnFromTaxable(taxable));
    }
    return true;
  }

  function setMode(m) {
    mode = m;
    $('tncn-tab-salary').classList.toggle('m2-toggle-active', m === 'salary');
    $('tncn-tab-taxable').classList.toggle('m2-toggle-active', m === 'taxable');
    $('tncn-panel-salary-top').hidden = m !== 'salary';
    $('tncn-panel-salary-bottom').hidden = m !== 'salary';
    $('tncn-panel-taxable-top').hidden = m !== 'taxable';
    clearErrs(root);
    tryRender(false);
  }
  $('tncn-tab-salary').addEventListener('click', () => setMode('salary'));
  $('tncn-tab-taxable').addEventListener('click', () => setMode('taxable'));

  M2.bindMoneyFormat($('tncn-gross'));
  M2.bindMoneyFormat($('tncn-ins'));
  M2.bindMoneyFormat($('tncn-taxable'));

  root.querySelectorAll('[data-tncn-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('tncn-gross');
      el.value = fmtNum(parseInt(btn.getAttribute('data-tncn-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  M2.bindStepper($('tncn-dep-minus'), $('tncn-dep'), $('tncn-dep-plus'), { min: 0 });

  function updateRegionHint() {
    const cap = REGION_CAPS[$('tncn-region').value] || '';
    const hint = $('tncn-region-hint');
    if (hint) hint.textContent = cap ? 'Trần đóng BHTN vùng này: ' + cap + '/tháng.' : '';
  }
  $('tncn-region').addEventListener('change', updateRegionHint);

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['tncn-gross', 'tncn-ins', 'tncn-dep', 'tncn-region', 'tncn-taxable'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  updateRegionHint();
  tryRender(true);
}
