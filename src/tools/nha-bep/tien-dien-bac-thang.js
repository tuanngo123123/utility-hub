// Tính tiền điện bậc thang — biểu giá QĐ 2892/QĐ-BCT (từ 01/11/2026), VAT 8%.
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ. Công thức ở src/money-formulas.js (M2_CALC); thẻ
// kết quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'tien-dien-bac-thang',
  name: 'Tính tiền điện bậc thang',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Tính tiền điện sinh hoạt theo biểu giá bậc thang lũy tiến mới nhất, gồm VAT 8%, kèm bảng chi tiết từng bậc.',
  keywords: ['tiền điện', 'bậc thang', 'kWh', 'giá điện', 'tính tiền điện', 'VAT điện'],
  icon: '⚡',
  seoTitle: 'Tính tiền điện bậc thang 2026 — biểu giá mới nhất',
  seoDesc: 'Tính tiền điện sinh hoạt theo biểu giá bậc thang lũy tiến (QĐ 2892/QĐ-BCT, từ 01/11/2026) kèm VAT 8%, bảng chi tiết từng bậc.'
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="tdbt-kwh">Số kWh tiêu thụ trong tháng</label>
          <span class="input-unit"><input id="tdbt-kwh" class="m2-salary" type="text" inputmode="decimal" value="250" placeholder="Ví dụ: 250"><span class="unit">kWh</span></span>
          <p class="hint">Xem số kWh trên hóa đơn tiền điện hoặc công tơ tháng này.</p>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức tiêu thụ">
          <button type="button" class="m2-quick-btn" data-tdbt-quick="100">100 kWh</button>
          <button type="button" class="m2-quick-btn" data-tdbt-quick="250">250 kWh</button>
          <button type="button" class="m2-quick-btn" data-tdbt-quick="500">500 kWh</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="field m2-field">
          <label for="tdbt-vat">Thuế VAT (%)</label>
          <input id="tdbt-vat" class="m2-num" type="number" min="0" step="0.1" value="8">
          <p class="hint">Điện sinh hoạt chịu VAT 8%. Để trống thì mặc định 8%.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="tdbt-result-card">
      <div id="tdbt-out"></div>
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
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tdbt-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('tdbt-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  // parseNum của UH trả 0 khi không đọc được — không phân biệt được kWh = 0
  // (hợp lệ, tiền điện 0₫) với ô trống/chữ (không hợp lệ) nên tự đọc số ở đây.
  function parseLoose(v) {
    const s = String(v == null ? '' : v).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    if (s === '') return NaN;
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('tdbt-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả tiền điện',
  });

  function render(o, kwh, vatRate) {
    const avg = o.avgPerKwh;
    const steps = o.rows.map(t => ({
      label: t.label,
      sub: fmtNum(t.used, 0) + ' kWh × ' + fmtVND(t.price) + '/kWh',
      amount: fmtVND(t.amount),
    }));
    steps.push(
      { label: 'Tổng trước thuế', sub: '', amount: fmtVND(o.subtotal) },
      { label: 'VAT (' + fmtNum(vatRate) + '%)', sub: '', amount: fmtVND(o.vat) },
      { label: 'Tổng tiền điện phải trả', sub: '', amount: fmtVND(o.total) },
    );
    lastCopyText = 'Tiền điện ' + fmtNum(kwh, 0) + ' kWh'
      + ' · Trước thuế: ' + fmtVND(o.subtotal)
      + ' · VAT (' + fmtNum(vatRate) + '%): ' + fmtVND(o.vat)
      + ' · Tổng thanh toán: ' + fmtVND(o.total);
    M2.renderResult($('tdbt-out'), {
      label: 'Tổng tiền điện phải trả',
      value: fmtVND(o.total),
      pctLine: fmtNum(kwh, 0) + ' kWh · đã gồm VAT ' + fmtNum(vatRate) + '%'
        + (kwh > 0 ? ' · bình quân ' + fmtVND(avg) + '/kWh' : ''),
      rows: [
        { label: 'Tổng trước thuế', value: fmtVND(o.subtotal) },
        { label: 'VAT (' + fmtNum(vatRate) + '%)', value: fmtVND(o.vat) },
        { label: 'Giá điện bình quân', value: kwh > 0 ? fmtVND(avg) + '/kWh' : '—' },
      ],
      steps,
      note: 'Nguồn biểu giá: Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026 (chưa VAT).',
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả tiền điện',
      shareTitle: 'Tính tiền điện bậc thang',
      image: {
        title: 'TIỀN ĐIỆN BẬC THANG',
        file: 'tien-dien.png',
        heroLabel: 'Tổng tiền điện phải trả',
        heroValue: fmtVND(o.total),
        pctLine: fmtNum(kwh, 0) + ' kWh · đã gồm VAT ' + fmtNum(vatRate) + '%',
        rows: [
          ['Số kWh', fmtNum(kwh, 0) + ' kWh', false],
          ['Tổng trước thuế', fmtVND(o.subtotal), false],
          ['VAT (' + fmtNum(vatRate) + '%)', fmtVND(o.vat), false],
          ['Tổng thanh toán', fmtVND(o.total), true],
        ],
      },
    }, stepsState);
    sticky.update('Tiền điện', fmtVND(o.total));
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const kwh = parseLoose($('tdbt-kwh').value);
    const vatRaw = $('tdbt-vat').value.trim();
    const vatRate = vatRaw === '' ? 8 : parseLoose(vatRaw);
    if (isNaN(kwh) || kwh < 0) {
      if (showErrors) {
        markErr($('tdbt-kwh'), 'Ô Số kWh chưa đúng — nhập số từ 0 trở lên, ví dụ 250.');
        focusEl($('tdbt-kwh'));
      }
      M2.renderEmpty($('tdbt-out'), 'Nhập số kWh để xem tiền điện.');
      return false;
    }
    if (isNaN(vatRate) || vatRate < 0) {
      if (showErrors) {
        markErr($('tdbt-vat'), 'Ô Thuế VAT chưa đúng — nhập số từ 0 trở lên, ví dụ 8, hoặc để trống.');
        focusEl($('tdbt-vat'));
      }
      M2.renderEmpty($('tdbt-out'), 'Nhập số kWh để xem tiền điện.');
      return false;
    }
    render(C.tienDien(kwh, vatRate), kwh, vatRate);
    return true;
  }

  root.querySelectorAll('[data-tdbt-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('tdbt-kwh');
      el.value = btn.getAttribute('data-tdbt-quick');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['tdbt-kwh', 'tdbt-vat'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  tryRender(true);
}
