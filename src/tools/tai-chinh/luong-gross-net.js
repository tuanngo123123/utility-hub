// Tính lương Gross ⇄ Net — luật mới 2026 (NĐ 161/2026, NQ 110/2025, Luật 109/2025).
// Bố cục MẪU 2 (trang công cụ chuẩn, Claude duyệt 14:32 19/11/2026): 2 thẻ
// cạnh nhau — trái nhập, phải kết quả dính khi cuộn; không còn nút Tính
// lương / Đặt lại / Điền ví dụ (mở trang đã tính sẵn 30.000.000).
// Công thức ở src/money-formulas.js (M2_CALC) — bộ kiểm tự động
// scripts/test-money-tools.mjs kiểm cùng file đó; thẻ kết quả, bảng
// từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'luong-gross-net',
  name: 'Tính lương Gross ⇄ Net',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Đổi lương Gross sang Net và ngược lại theo luật thuế, bảo hiểm mới nhất 2026: bảo hiểm 10,5%, giảm trừ bản thân 15,5 triệu, biểu thuế 5 bậc.',
  keywords: 'lương gross net, tính lương net, thuế thu nhập cá nhân 2026, bảo hiểm xã hội, gross to net',
  icon: '💰',
  seoTitle: 'Tính lương Gross ⇄ Net 2026 — thuế TNCN & bảo hiểm mới nhất',
  seoDesc: 'Tính lương Net từ Gross và ngược lại theo luật 2026: BHXH 8%, BHYT 1,5%, BHTN 1%, giảm trừ 15,5 triệu, biểu thuế TNCN 5 bậc. Miễn phí, tính ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="m2-toggle" role="group" aria-label="Chiều đổi lương">
          <button type="button" class="m2-toggle-btn m2-toggle-active" id="lggn-tab-g2n">Gross → Net</button>
          <button type="button" class="m2-toggle-btn" id="lggn-tab-n2g">Net → Gross</button>
        </div>
        <div class="field m2-field">
          <label for="lggn-salary">Lương <span id="lggn-salary-label">Gross</span> mỗi tháng</label>
          <span class="input-unit"><input id="lggn-salary" class="m2-salary" type="text" inputmode="decimal" value="30.000.000" placeholder="VD: 30.000.000"><span class="unit">₫</span></span>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức lương">
          <button type="button" class="m2-quick-btn" data-lggn-quick="10000000">10 triệu</button>
          <button type="button" class="m2-quick-btn" data-lggn-quick="15000000">15 triệu</button>
          <button type="button" class="m2-quick-btn" data-lggn-quick="20000000">20 triệu</button>
          <button type="button" class="m2-quick-btn" data-lggn-quick="30000000">30 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="lggn-region">Vùng lương tối thiểu</label>
            <select id="lggn-region" class="m2-select">
              <option value="106200000">Vùng I</option>
              <option value="94600000">Vùng II</option>
              <option value="82800000">Vùng III</option>
              <option value="74000000">Vùng IV</option>
            </select>
            <p class="hint" id="lggn-region-hint">Trần đóng BHTN vùng này: 106.200.000₫/tháng.</p>
          </div>
          <div class="field m2-field">
            <label id="lggn-dep-label">Người phụ thuộc</label>
            <div class="m2-stepper" role="group" aria-labelledby="lggn-dep-label">
              <button type="button" class="m2-step-btn" id="lggn-dep-minus" aria-label="Giảm một người phụ thuộc">−</button>
              <input id="lggn-dep" class="m2-step-num" type="text" inputmode="none" readonly value="0" aria-label="Số người phụ thuộc">
              <button type="button" class="m2-step-btn" id="lggn-dep-plus" aria-label="Thêm một người phụ thuộc">+</button>
            </div>
            <p class="hint">Giảm trừ 6.200.000₫/người/tháng.</p>
          </div>
        </div>
        <div class="field m2-field">
          <label for="lggn-ins">Lương đóng bảo hiểm <span class="m2-optional">(không bắt buộc)</span></label>
          <span class="input-unit"><input id="lggn-ins" class="m2-money" type="text" inputmode="decimal" value="" placeholder="Bằng lương Gross"><span class="unit">₫</span></span>
          <p class="hint">Để trống nếu công ty đóng bảo hiểm trên toàn bộ lương.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="lggn-result-card">
      <div id="lggn-out"></div>
    </div>
  </div>
  <p class="note">Căn cứ: NĐ 161/2026/NĐ-CP (trần BHXH/BHYT 50.600.000₫ từ 01/7/2026); NQ 110/2025/UBTVQH15 (giảm trừ bản thân 15.500.000₫, phụ thuộc 6.200.000₫); Luật Thuế TNCN 109/2025/QH15 (biểu thuế 5 bậc: 5% / 10% / 20% / 30% / 35%). Người lao động đóng BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5%.</p>
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
  const markErr = U.markFieldError || function (el, msg) { $('lggn-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('lggn-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const REGION_CAPS = {
    '106200000': '106.200.000₫',
    '94600000': '94.600.000₫',
    '82800000': '82.800.000₫',
    '74000000': '74.000.000₫',
  };

  let direction = 'g2n';
  let lastResult = null;
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  // Thanh tóm tắt dính ở đáy (UH.m2): hiện khi thẻ kết quả cuộn khuất.
  const sticky = M2.setupSticky({
    root,
    resultEl: $('lggn-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả lương',
  });

  function pctOfGross(r) {
    if (!(r.gross > 0)) return '';
    return (r.net / r.gross * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  // 6 bước tính — mọi số lấy từ kết quả thật (r), không hard-code.
  // Khoảng trắng trước ₫ trong dòng phụ dùng khoảng trắng không ngắt
  // (\u00A0) để "450.000 ₫" không bị tách đôi khi xuống dòng.
  function stepsRows(r) {
    const depAmount = r.deps * C.DEDUCT_DEP;
    const nb = s => s.replace(/ ₫/g, ' ₫');
    const taxDetail = r.taxRows.length
      ? r.taxRows.map(x => nb(fmtVND(x.base)) + ' × ' + x.rate + '% = ' + nb(fmtVND(x.tax))).join('; ')
      : 'Thu nhập tính thuế bằng 0 nên không phải nộp thuế.';
    let insSub = 'BHXH ' + nb(fmtVND(r.bhxh)) + ' · BHYT ' + nb(fmtVND(r.bhyt)) + ' · BHTN ' + nb(fmtVND(r.bhtn));
    if (r.bhxhBase < r.insSalary) insSub += ' · BHXH/BHYT tính trên trần 50.600.000₫';
    if (r.bhtnBase < r.insSalary) insSub += ' · BHTN tính trên trần vùng ' + nb(fmtVND(r.bhtnBase));
    return [
      { label: 'Lương Gross', sub: '', amount: fmtVND(r.gross) },
      { label: 'Bảo hiểm (BHXH 8% + BHYT 1,5% + BHTN 1%)', sub: insSub, amount: '− ' + fmtVND(r.insurance) },
      { label: 'Giảm trừ bản thân', sub: '', amount: '− ' + fmtVND(C.DEDUCT_SELF) },
      { label: 'Giảm trừ ' + r.deps + ' người phụ thuộc', sub: '6.200.000₫/người/tháng', amount: '− ' + fmtVND(depAmount) },
      { label: 'Thu nhập tính thuế ' + fmtVND(r.taxable) + ' → thuế TNCN', sub: taxDetail, amount: '− ' + fmtVND(r.tax) },
      { label: 'Lương Net thực nhận', sub: '', amount: fmtVND(r.net) },
    ];
  }

  function render(r) {
    lastResult = r;
    lastCopyText = 'Lương Gross: ' + fmtVND(r.gross)
      + ' · BHXH 8%: ' + fmtVND(r.bhxh)
      + ' · BHYT 1,5%: ' + fmtVND(r.bhyt)
      + ' · BHTN 1%: ' + fmtVND(r.bhtn)
      + ' · Thuế TNCN: ' + fmtVND(r.tax)
      + ' · Lương Net: ' + fmtVND(r.net);
    const heroLabel = direction === 'g2n' ? 'Lương thực nhận (Net)' : 'Lương Gross tương ứng';
    const heroValue = direction === 'g2n' ? r.net : r.gross;
    const pct = pctOfGross(r);
    const pctLine = direction === 'g2n'
      ? 'Bằng ' + pct + '% lương Gross'
      : 'Lương Net bằng ' + pct + '% lương Gross';
    M2.renderResult($('lggn-out'), {
      label: heroLabel,
      value: fmtVND(heroValue),
      pctLine,
      rows: [
        { label: 'Bảo hiểm (10,5%)', value: '− ' + fmtVND(r.insurance) },
        { label: 'Thuế TNCN', value: '− ' + fmtVND(r.tax) },
        { label: 'Thu nhập tính thuế', value: fmtVND(r.taxable) },
      ],
      steps: stepsRows(r),
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả lương',
      shareTitle: 'Tính lương Gross ⇄ Net',
      image: {
        title: 'TÍNH LƯƠNG GROSS – NET',
        file: 'luong-gross-net.png',
        heroLabel,
        heroValue: fmtVND(heroValue),
        pctLine,
        rows: [
          ['Lương Gross', fmtVND(r.gross), false],
          ['Bảo hiểm (10,5%)', '− ' + fmtVND(r.insurance), false],
          ['Thu nhập tính thuế', fmtVND(r.taxable), false],
          ['Thuế TNCN', '− ' + fmtVND(r.tax), false],
          ['Lương Net thực nhận', fmtVND(r.net), true],
        ],
      },
    }, stepsState);
    sticky.update(direction === 'g2n' ? 'Net' : 'Gross', fmtVND(heroValue));
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ / đổi tab — không spam lỗi).
  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const salary = parseNum($('lggn-salary').value);
    const insRaw = $('lggn-ins').value.trim();
    const bhtnCap = parseNum($('lggn-region').value);
    const deps = Math.max(0, parseInt($('lggn-dep').value, 10) || 0);
    const salaryName = direction === 'g2n' ? 'Gross' : 'Net';
    if (!(salary > 0)) {
      if (showErrors) {
        markErr($('lggn-salary'), 'Ô Lương ' + salaryName + ' chưa có số — nhập số lớn hơn 0, ví dụ 30.000.000.');
        focusEl($('lggn-salary'));
      }
      M2.renderEmpty($('lggn-out'), 'Nhập lương để xem kết quả tính.');
      return false;
    }
    if (insRaw !== '' && !(parseNum(insRaw) > 0)) {
      if (showErrors) {
        markErr($('lggn-ins'), 'Ô Lương đóng bảo hiểm chưa đúng — để trống (mặc định bằng lương ' + salaryName + ') hoặc nhập số lớn hơn 0.');
        focusEl($('lggn-ins'));
      }
      M2.renderEmpty($('lggn-out'), 'Nhập lương để xem kết quả tính.');
      return false;
    }
    if (direction === 'g2n') {
      const insSalary = insRaw === '' ? salary : parseNum(insRaw);
      render(C.grossNet(salary, insSalary, bhtnCap, deps));
    } else {
      const insSalary = insRaw === '' ? null : parseNum(insRaw);
      render(C.netToGross(salary, insSalary, bhtnCap, deps));
    }
    return true;
  }

  // --- Công tắc chiều Gross ⇄ Net: đổi chiều là tính lại ngay với số
  // đang có (không xóa kết quả như bản cũ — bản cũ xóa vì còn nút Tính).
  function setDirection(dir) {
    direction = dir;
    $('lggn-tab-g2n').classList.toggle('m2-toggle-active', dir === 'g2n');
    $('lggn-tab-n2g').classList.toggle('m2-toggle-active', dir === 'n2g');
    $('lggn-salary-label').textContent = dir === 'g2n' ? 'Gross' : 'Net';
    clearErrs(root);
    tryRender(false);
  }
  $('lggn-tab-g2n').addEventListener('click', function () { setDirection('g2n'); });
  $('lggn-tab-n2g').addEventListener('click', function () { setDirection('n2g'); });

  // Tự thêm dấu chấm phân cách nghìn khi gõ và khi rời ô.
  M2.bindMoneyFormat($('lggn-salary'));
  M2.bindMoneyFormat($('lggn-ins'));

  // Nút chọn nhanh mức lương: điền số rồi tính trực tiếp (qua liveCalc).
  root.querySelectorAll('[data-lggn-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('lggn-salary');
      el.value = fmtNum(parseInt(btn.getAttribute('data-lggn-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  // Người phụ thuộc dạng − số +.
  M2.bindStepper($('lggn-dep-minus'), $('lggn-dep'), $('lggn-dep-plus'), { min: 0 });

  // Dòng gợi ý trần BHTN theo vùng đang chọn.
  function updateRegionHint() {
    const cap = REGION_CAPS[$('lggn-region').value] || '';
    const hint = $('lggn-region-hint');
    if (hint) hint.textContent = cap ? 'Trần đóng BHTN vùng này: ' + cap + '/tháng.' : '';
  }
  $('lggn-region').addEventListener('change', updateRegionHint);

  // Tính trực tiếp khi gõ: chỉ tính khi lương đã có số > 0 và lương đóng
  // bảo hiểm (nếu có) cũng hợp lệ; chưa hợp lệ thì hiện khung trống lặng
  // lẽ, không hiện lỗi, không cướp focus. Đợi 400ms sau lần gõ cuối để
  // khỏi tính giữa chừng. Nghe cả 'change' để tool-state.js điền từ URL
  // (nó chỉ gửi 'change') cũng tính lại được.
  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['lggn-salary', 'lggn-ins', 'lggn-dep', 'lggn-region'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  updateRegionHint();
  tryRender(true);
}
