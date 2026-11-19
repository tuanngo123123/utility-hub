// Quyết toán thuế TNCN 2026 — tính thuế cả năm, xem được hoàn hay phải
// nộp thêm bao nhiêu, kèm hạn nộp và gợi ý nơi nộp hồ sơ.
// Bố cục MẪU 2 (trang công cụ chuẩn): 2 thẻ cạnh nhau — trái nhập,
// phải kết quả dính khi cuộn; không nút Tính (mở trang đã tính sẵn
// ví dụ: làm 8 tháng, lương 40 triệu/tháng, hoàn 7.220.000₫).
// Công thức ở src/money-formulas.js (quyetToanThue) — bộ kiểm tự động
// scripts/test-money-tools.mjs kiểm cùng file đó; thẻ kết quả, bảng
// từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'quyet-toan-thue-tncn-2026',
  name: 'Quyết toán thuế TNCN 2026',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính thuế thu nhập cá nhân phải nộp cả năm 2026, xem được hoàn hay phải nộp thêm bao nhiêu, kèm hạn nộp và nơi nộp hồ sơ quyết toán.',
  keywords: 'quyết toán thuế tncn 2026, hoàn thuế thu nhập cá nhân, tính thuế cả năm, quyết toán thuế, hạn nộp quyết toán thuế',
  icon: '🧾',
  seoTitle: 'Quyết toán thuế TNCN 2026 — tính thuế cả năm, hoàn hay nộp thêm',
  seoDesc: 'Tính thuế TNCN cả năm 2026 theo biểu lũy tiến năm: nhập thu nhập, bảo hiểm đã đóng, người phụ thuộc, thuế đã khấu trừ để biết được hoàn hay phải nộp thêm bao nhiêu. Hạn nộp 3/5/2027.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="qttt-income">Tổng thu nhập cả năm 2026</label>
          <span class="input-unit"><input id="qttt-income" class="m2-money" type="text" inputmode="decimal" value="320.000.000" placeholder="Ví dụ: 320.000.000"><span class="unit">₫</span></span>
          <p class="hint">Lương + thưởng + thu nhập vãng lai (nếu có). Xem trên chứng từ khấu trừ thuế của nơi trả thu nhập.</p>
        </div>
        <div class="field m2-field">
          <label for="qttt-insurance">Tổng bảo hiểm đã đóng trong năm</label>
          <span class="input-unit"><input id="qttt-insurance" class="m2-money" type="text" inputmode="decimal" value="33.600.000" placeholder="Ví dụ: 33.600.000"><span class="unit">₫</span></span>
          <p class="hint">BHXH + BHYT + BHTN đã đóng (xem trên phiếu lương hoặc app VssID). Không đóng bảo hiểm thì để 0.</p>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field">
            <label id="qttt-deps-label">Người phụ thuộc</label>
            <div class="m2-stepper" role="group" aria-labelledby="qttt-deps-label">
              <button type="button" class="m2-step-btn" id="qttt-deps-minus" aria-label="Giảm một người phụ thuộc">−</button>
              <input id="qttt-deps" class="m2-step-num" type="text" inputmode="none" readonly value="0" aria-label="Số người phụ thuộc">
              <button type="button" class="m2-step-btn" id="qttt-deps-plus" aria-label="Thêm một người phụ thuộc">+</button>
            </div>
            <p class="hint">Giảm trừ 6.200.000₫/người/tháng.</p>
          </div>
          <div class="field m2-field">
            <label id="qttt-dep-months-label">Số tháng giảm trừ phụ thuộc</label>
            <div class="m2-stepper" role="group" aria-labelledby="qttt-dep-months-label">
              <button type="button" class="m2-step-btn" id="qttt-dep-months-minus" aria-label="Giảm một tháng">−</button>
              <input id="qttt-dep-months" class="m2-step-num" type="text" inputmode="none" readonly value="12" aria-label="Số tháng giảm trừ phụ thuộc">
              <button type="button" class="m2-step-btn" id="qttt-dep-months-plus" aria-label="Thêm một tháng">+</button>
            </div>
            <p class="hint">Tính từ tháng phát sinh nghĩa vụ nuôi dưỡng (ví dụ con sinh tháng 7 thì tính 6 tháng).</p>
          </div>
        </div>
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="qttt-medical">Chi phí y tế tự trả <span class="m2-optional">(không bắt buộc)</span></label>
            <span class="input-unit"><input id="qttt-medical" class="m2-money" type="text" inputmode="decimal" value="" placeholder="Để trống nếu không có"><span class="unit">₫</span></span>
            <p class="hint">Tối đa 23.000.000₫/năm. Chỉ tính tiền khám chữa bệnh tự trả, có chứng từ.</p>
          </div>
          <div class="field m2-field">
            <label for="qttt-edu">Chi phí giáo dục tự trả <span class="m2-optional">(không bắt buộc)</span></label>
            <span class="input-unit"><input id="qttt-edu" class="m2-money" type="text" inputmode="decimal" value="" placeholder="Để trống nếu không có"><span class="unit">₫</span></span>
            <p class="hint">Tối đa 24.000.000₫/năm. Chỉ tính học phí, không tính tiền ăn, đồng phục, sách vở.</p>
          </div>
        </div>
        <div class="field m2-field">
          <label for="qttt-withheld">Thuế đã khấu trừ trong năm</label>
          <span class="input-unit"><input id="qttt-withheld" class="m2-money" type="text" inputmode="decimal" value="12.240.000" placeholder="Ví dụ: 12.240.000"><span class="unit">₫</span></span>
          <p class="hint">Tổng thuế đã trừ trên phiếu lương + chứng từ khấu trừ thuế của các nơi trả thu nhập.</p>
        </div>
        <div class="field m2-field">
          <label for="qttt-sources">Tình hình thu nhập trong năm</label>
          <select id="qttt-sources" class="m2-select">
            <option value="1">1 nơi — đang làm việc ở đó</option>
            <option value="2">2 nơi trở lên</option>
            <option value="0">Đã nghỉ việc, không còn làm ở đâu</option>
          </select>
          <p class="hint" id="qttt-sources-hint">Nộp hồ sơ tại cơ quan thuế quản lý trực tiếp nơi trả thu nhập của bạn.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="qttt-result-card">
      <div id="qttt-out"></div>
    </div>
  </div>
  <p class="note">Hạn nộp hồ sơ quyết toán năm 2026: cá nhân tự quyết toán — 3/5/2027 (thứ Hai, vì 30/4 là ngày lễ); tổ chức trả thu nhập quyết toán thay — 31/3/2027. Bạn có thể nộp hồ sơ online qua eTax Mobile hoặc Cổng dịch vụ công của Cục Thuế. Căn cứ: Luật Thuế TNCN 109/2025/QH15 (biểu thuế 5 bậc); NQ 110/2025/UBTVQH15 (giảm trừ bản thân 15.500.000₫, phụ thuộc 6.200.000₫); NĐ 253/2026/NĐ-CP (giảm trừ y tế 23 triệu, giáo dục 24 triệu; ủy quyền quyết toán); NĐ 373/2025/NĐ-CP (nơi nộp hồ sơ); TT 89/2026/TT-BTC (miễn quyết toán khi nộp thêm không quá 50.000₫).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const C = (typeof window !== 'undefined' && window.M2_CALC) || null;
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('qttt-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('qttt-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const SOURCES_HINTS = {
    '1': 'Nộp hồ sơ tại cơ quan thuế quản lý trực tiếp nơi trả thu nhập của bạn.',
    '2': 'Nộp hồ sơ tại cơ quan thuế quản lý trực tiếp tổ chức trả thu nhập lớn nhất trong năm (Nghị định 373/2025/NĐ-CP). Nếu hai nơi trả bằng nhau, bạn được chọn một trong hai. Nộp sai nơi thì cơ quan thuế tiếp nhận sẽ chuyển hồ sơ giúp bạn.',
    '0': 'Nộp hồ sơ tại cơ quan thuế nơi bạn cư trú.',
  };

  let lastResult = null;
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  // Thanh tóm tắt dính ở đáy (UH.m2): hiện khi thẻ kết quả cuộn khuất.
  const sticky = M2.setupSticky({
    root,
    resultEl: $('qttt-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả quyết toán thuế',
  });

  // Các bước tính — mọi số lấy từ kết quả thật (r), không hard-code.
  // Khoảng trắng trước ₫ trong dòng phụ dùng khoảng trắng không ngắt
  // (\u00A0) để "120.000.000 ₫" không bị tách đôi khi xuống dòng.
  function stepsRows(r) {
    const nb = s => s.replace(/ ₫/g, ' ₫');
    const taxDetail = r.taxRows.length
      ? r.taxRows.map(x => nb(fmtVND(x.base)) + ' × ' + x.rate + '% = ' + nb(fmtVND(x.tax))).join('; ')
      : 'Thu nhập tính thuế bằng 0 nên không phải nộp thuế.';
    const rows = [
      { label: 'Tổng thu nhập cả năm 2026', sub: '', amount: fmtVND(r.income) },
    ];
    if (r.insurance > 0) rows.push({ label: 'Bảo hiểm đã đóng (BHXH + BHYT + BHTN)', sub: '', amount: '− ' + fmtVND(r.insurance) });
    rows.push({ label: 'Giảm trừ bản thân (đủ 12 tháng)', sub: 'Kể cả làm việc chưa đủ 12 tháng — điểm b khoản 1 Điều 48 Nghị định 253/2026', amount: '− ' + fmtVND(r.selfDeduct) });
    if (r.depDeduct > 0) rows.push({ label: 'Giảm trừ ' + r.deps + ' người phụ thuộc × ' + r.depMonths + ' tháng', sub: '6.200.000₫/người/tháng', amount: '− ' + fmtVND(r.depDeduct) });
    if (r.medicalApplied > 0) rows.push({ label: 'Giảm trừ chi phí y tế', sub: r.medicalCapped ? 'Trần 23.000.000₫/năm — số bạn nhập đã vượt trần nên chỉ tính 23 triệu' : 'Trần 23.000.000₫/năm', amount: '− ' + fmtVND(r.medicalApplied) });
    if (r.eduApplied > 0) rows.push({ label: 'Giảm trừ chi phí giáo dục', sub: r.eduCapped ? 'Trần 24.000.000₫/năm — số bạn nhập đã vượt trần nên chỉ tính 24 triệu' : 'Trần 24.000.000₫/năm', amount: '− ' + fmtVND(r.eduApplied) });
    rows.push({ label: 'Thu nhập tính thuế ' + fmtVND(r.taxable) + ' → thuế TNCN cả năm', sub: taxDetail, amount: fmtVND(r.tax) });
    rows.push({ label: 'Thuế đã khấu trừ trong năm', sub: '', amount: '− ' + fmtVND(r.withheld) });
    if (r.diff < 0) rows.push({ label: 'Được hoàn thuế', sub: '', amount: fmtVND(r.refund) });
    else if (r.diff > 0) rows.push({ label: 'Cần nộp thêm', sub: '', amount: fmtVND(r.extraDue) });
    else rows.push({ label: 'Đã khớp, không chênh lệch', sub: '', amount: '0₫' });
    return rows;
  }

  function render(r) {
    lastResult = r;
    const hero = r.diff < 0
      ? { label: 'Được hoàn thuế', value: r.refund, sticky: 'Hoàn thuế' }
      : r.diff > 0
        ? { label: 'Cần nộp thêm', value: r.extraDue, sticky: 'Nộp thêm' }
        : { label: 'Đã khớp — không chênh lệch', value: 0, sticky: 'Đã khớp' };
    const outcomeText = r.diff < 0
      ? 'Được hoàn: ' + fmtVND(r.refund)
      : r.diff > 0
        ? 'Cần nộp thêm: ' + fmtVND(r.extraDue)
        : 'Đã khớp, không chênh lệch';
    lastCopyText = 'Quyết toán thuế TNCN 2026: thu nhập cả năm ' + fmtVND(r.income)
      + ' · bảo hiểm đã đóng ' + fmtVND(r.insurance)
      + ' · giảm trừ bản thân ' + fmtVND(r.selfDeduct)
      + (r.depDeduct > 0 ? ' · giảm trừ ' + r.deps + ' người phụ thuộc ' + fmtVND(r.depDeduct) : '')
      + (r.medicalApplied > 0 ? ' · giảm trừ y tế ' + fmtVND(r.medicalApplied) : '')
      + (r.eduApplied > 0 ? ' · giảm trừ giáo dục ' + fmtVND(r.eduApplied) : '')
      + ' · thu nhập tính thuế ' + fmtVND(r.taxable)
      + ' · thuế cả năm ' + fmtVND(r.tax)
      + ' · đã khấu trừ ' + fmtVND(r.withheld)
      + ' · ' + outcomeText + '.';
    let note;
    if (r.exempt) {
      note = 'Số thuế nộp thêm chỉ ' + fmtVND(r.extraDue) + ' (không quá 50.000₫) nên bạn được miễn — không phải nộp hồ sơ quyết toán (Điều 66 Thông tư 89/2026/TT-BTC).';
    } else if (r.diff < 0) {
      note = 'Bạn được hoàn ' + fmtVND(r.refund) + '. Nộp hồ sơ qua eTax Mobile sau 31/3/2027 — khi nơi trả thu nhập đã quyết toán xong — để hệ thống đủ dữ liệu; hồ sơ đủ điều kiện được hoàn tự động trong 3 ngày làm việc.';
    } else if (r.diff > 0) {
      note = 'Hạn nộp hồ sơ quyết toán: 3/5/2027 (thứ Hai). Nộp online qua eTax Mobile hoặc Cổng dịch vụ công của Cục Thuế.';
    } else {
      note = 'Thuế đã khấu trừ khớp với thuế phải nộp cả năm — bạn không phải nộp thêm hay làm hồ sơ hoàn.';
    }
    if (r.medicalApplied > 0 || r.eduApplied > 0) {
      note += ' Bạn đang giảm trừ chi phí y tế/giáo dục nên phải tự quyết toán, không được ủy quyền cho nơi trả thu nhập (khoản 3 Điều 51 Nghị định 253/2026/NĐ-CP).';
    }
    const totalDeduct = r.selfDeduct + r.depDeduct + r.medicalApplied + r.eduApplied;
    const deductLabel = (r.medicalApplied > 0 || r.eduApplied > 0)
      ? 'Giảm trừ (bản thân, phụ thuộc, y tế, giáo dục)'
      : 'Giảm trừ (bản thân, phụ thuộc)';
    M2.renderResult($('qttt-out'), {
      label: hero.label,
      value: fmtVND(hero.value),
      pctLine: 'Thuế phải nộp cả năm: ' + fmtVND(r.tax) + ' · Đã khấu trừ: ' + fmtVND(r.withheld),
      rows: [
        { label: 'Thu nhập tính thuế', value: fmtVND(r.taxable) },
        { label: 'Thuế phải nộp cả năm', value: fmtVND(r.tax) },
        { label: 'Thuế đã khấu trừ', value: fmtVND(r.withheld) },
      ],
      steps: stepsRows(r),
      note,
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả quyết toán thuế',
      shareTitle: 'Quyết toán thuế TNCN 2026',
      image: {
        title: 'QUYẾT TOÁN THUẾ TNCN 2026',
        file: 'quyet-toan-thue-tncn-2026.png',
        heroLabel: hero.label,
        heroValue: fmtVND(hero.value),
        pctLine: 'Thuế cả năm: ' + fmtVND(r.tax) + ' · Đã khấu trừ: ' + fmtVND(r.withheld),
        rows: [
          ['Tổng thu nhập cả năm', fmtVND(r.income), false],
          ['Bảo hiểm đã đóng', '− ' + fmtVND(r.insurance), false],
          [deductLabel, '− ' + fmtVND(totalDeduct), false],
          ['Thu nhập tính thuế', fmtVND(r.taxable), false],
          ['Thuế cả năm', fmtVND(r.tax), false],
          ['Đã khấu trừ', '− ' + fmtVND(r.withheld), false],
          [hero.label, fmtVND(hero.value), true],
        ],
      },
    }, stepsState);
    sticky.update(hero.sticky, fmtVND(hero.value));
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ — không spam lỗi).
  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const income = parseNum($('qttt-income').value);
    if (!(income > 0)) {
      if (showErrors) {
        markErr($('qttt-income'), 'Ô Tổng thu nhập cả năm chưa có số — nhập số lớn hơn 0, ví dụ 320.000.000.');
        focusEl($('qttt-income'));
      }
      M2.renderEmpty($('qttt-out'), 'Nhập thu nhập cả năm để xem kết quả quyết toán.');
      return false;
    }
    const insurance = Math.max(0, parseNum($('qttt-insurance').value) || 0);
    const deps = Math.max(0, parseInt($('qttt-deps').value, 10) || 0);
    const depMonths = Math.min(12, Math.max(0, parseInt($('qttt-dep-months').value, 10) || 0));
    const medical = Math.max(0, parseNum($('qttt-medical').value) || 0);
    const edu = Math.max(0, parseNum($('qttt-edu').value) || 0);
    const withheld = Math.max(0, parseNum($('qttt-withheld').value) || 0);
    render(C.quyetToanThue(income, insurance, deps, depMonths, medical, edu, withheld));
    return true;
  }

  // Tự thêm dấu chấm phân cách nghìn khi gõ và khi rời ô.
  ['qttt-income', 'qttt-insurance', 'qttt-medical', 'qttt-edu', 'qttt-withheld'].forEach(function (id) {
    M2.bindMoneyFormat($(id));
  });

  // Người phụ thuộc và số tháng giảm trừ dạng − số +.
  M2.bindStepper($('qttt-deps-minus'), $('qttt-deps'), $('qttt-deps-plus'), { min: 0 });
  M2.bindStepper($('qttt-dep-months-minus'), $('qttt-dep-months'), $('qttt-dep-months-plus'), { min: 0, max: 12 });

  // Gợi ý nơi nộp hồ sơ theo tình hình thu nhập đang chọn.
  function updateSourcesHint() {
    const hint = $('qttt-sources-hint');
    if (hint) hint.textContent = SOURCES_HINTS[$('qttt-sources').value] || SOURCES_HINTS['1'];
  }
  $('qttt-sources').addEventListener('change', updateSourcesHint);

  // Tính trực tiếp khi gõ: chỉ tính khi thu nhập đã có số > 0; chưa hợp
  // lệ thì hiện khung trống lặng lẽ, không hiện lỗi, không cướp focus.
  // Đợi 400ms sau lần gõ cuối để khỏi tính giữa chừng. Nghe cả 'change'
  // để tool-state.js điền từ URL (nó chỉ gửi 'change') cũng tính lại được.
  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['qttt-income', 'qttt-insurance', 'qttt-deps', 'qttt-dep-months', 'qttt-medical', 'qttt-edu', 'qttt-withheld', 'qttt-sources'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  updateSourcesHint();
  tryRender(true);
}
