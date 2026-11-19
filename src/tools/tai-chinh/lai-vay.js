// Tính lãi vay & lịch trả nợ — trả đều (annuity) hoặc dư nợ giảm dần.
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ; bảng lịch trả nợ đặt dưới bố cục 2 cột (rộng hết
// khung 1120px). Công thức ở src/money-formulas.js (M2_CALC); thẻ kết
// quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'lai-vay',
  name: 'Tính lãi vay & lịch trả nợ',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính tiền trả hằng tháng, tổng lãi và bảng lịch trả nợ chi tiết từng tháng theo hai cách: trả đều (annuity) hoặc dư nợ giảm dần.',
  keywords: 'tính lãi vay, lịch trả nợ, vay trả góp, annuity, dư nợ giảm dần, lãi suất vay',
  icon: '🏦',
  seoTitle: 'Tính lãi vay & lịch trả nợ — trả đều hoặc dư nợ giảm dần',
  seoDesc: 'Tính tiền trả mỗi tháng, tổng tiền lãi và lịch trả nợ từng kỳ cho khoản vay theo phương thức trả đều hoặc dư nợ giảm dần. Miễn phí, tính ngay.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="lv-principal">Số tiền vay</label>
          <span class="input-unit"><input id="lv-principal" class="m2-salary" type="text" inputmode="decimal" value="100.000.000" placeholder="Ví dụ: 100.000.000"><span class="unit">₫</span></span>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh số tiền vay">
          <button type="button" class="m2-quick-btn" data-lv-quick="50000000">50 triệu</button>
          <button type="button" class="m2-quick-btn" data-lv-quick="100000000">100 triệu</button>
          <button type="button" class="m2-quick-btn" data-lv-quick="300000000">300 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="lv-rate">Lãi suất</label>
            <span class="input-unit"><input id="lv-rate" class="m2-num" type="text" inputmode="decimal" value="12" placeholder="Ví dụ: 12"><span class="unit">%/năm</span></span>
            <p class="hint">Lãi suất vay ngân hàng thường 8–15%/năm.</p>
          </div>
          <div class="field m2-field">
            <label for="lv-months">Kỳ hạn (tháng)</label>
            <input id="lv-months" class="m2-num" type="number" min="1" max="600" step="1" value="12">
            <p class="hint">Ví dụ: 12 tháng = 1 năm, 60 tháng = 5 năm.</p>
          </div>
        </div>
        <div class="field m2-field">
          <label for="lv-method">Phương thức trả</label>
          <select id="lv-method" class="m2-select">
            <option value="annuity">Trả đều mỗi tháng (annuity)</option>
            <option value="declining">Dư nợ giảm dần (gốc đều, lãi giảm dần)</option>
          </select>
          <p class="hint">Trả đều: mỗi tháng trả một khoản bằng nhau (gốc tăng dần, lãi giảm dần). Dư nợ giảm dần: gốc chia đều mỗi tháng, lãi tính trên số dư còn lại nên tháng đầu trả nhiều nhất và giảm dần.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="lv-result-card">
      <div id="lv-out"></div>
    </div>
  </div>
  <div id="lv-schedule"></div>
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
  const markErr = U.markFieldError || function (el, msg) { $('lv-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('lv-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('lv-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả lãi vay',
  });

  function render(o, P, annual, n, method) {
    const methodLabel = method === 'annuity' ? 'trả đều mỗi tháng' : 'dư nợ giảm dần';
    const monthlyRate = (annual / 12).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    const firstPay = method === 'annuity' ? o.monthly : o.schedule[0].pay;
    const lastPay = o.schedule[o.schedule.length - 1].pay;
    const steps = method === 'annuity'
      ? [
        { label: 'Số tiền vay', sub: '', amount: fmtVND(P) },
        { label: 'Lãi suất tháng', sub: fmtNum(annual) + '%/năm ÷ 12', amount: monthlyRate + '%/tháng' },
        { label: 'Tiền trả mỗi tháng (trả đều)', sub: 'P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1)', amount: fmtVND(o.monthly) },
        { label: 'Tổng tiền lãi (' + n + ' tháng)', sub: '', amount: fmtVND(o.totalInterest) },
        { label: 'Tổng phải trả', sub: '', amount: fmtVND(o.totalPay) },
      ]
      : [
        { label: 'Số tiền vay', sub: '', amount: fmtVND(P) },
        { label: 'Lãi suất tháng', sub: fmtNum(annual) + '%/năm ÷ 12', amount: monthlyRate + '%/tháng' },
        { label: 'Tiền gốc trả mỗi tháng', sub: fmtVND(P) + ' ÷ ' + n + ' tháng', amount: fmtVND(P / n) },
        { label: 'Trả tháng đầu (cao nhất)', sub: 'Gốc ' + fmtVND(o.schedule[0].principal) + ' + lãi tháng đầu ' + fmtVND(o.schedule[0].interest), amount: fmtVND(firstPay) },
        { label: 'Trả tháng cuối (thấp nhất)', sub: 'Gốc ' + fmtVND(o.schedule[o.schedule.length - 1].principal) + ' + lãi tháng cuối ' + fmtVND(o.schedule[o.schedule.length - 1].interest), amount: fmtVND(lastPay) },
        { label: 'Tổng tiền lãi (' + n + ' tháng)', sub: '', amount: fmtVND(o.totalInterest) },
        { label: 'Tổng phải trả', sub: '', amount: fmtVND(o.totalPay) },
      ];
    lastCopyText = 'Vay ' + fmtVND(P) + ' · Lãi suất ' + annual + '%/năm · Kỳ hạn ' + n + ' tháng (' + methodLabel + ')'
      + ' · ' + (method === 'annuity' ? 'Trả mỗi tháng: ' : 'Trả tháng đầu: ') + fmtVND(firstPay)
      + ' · Tổng tiền lãi: ' + fmtVND(o.totalInterest)
      + ' · Tổng phải trả: ' + fmtVND(o.totalPay);
    M2.renderResult($('lv-out'), {
      label: method === 'annuity' ? 'Trả mỗi tháng' : 'Trả tháng đầu (cao nhất)',
      value: fmtVND(firstPay),
      pctLine: 'Vay ' + fmtVND(P) + ' · ' + fmtNum(annual) + '%/năm · ' + n + ' tháng · ' + methodLabel,
      rows: [
        { label: 'Tổng tiền lãi', value: fmtVND(o.totalInterest) },
        { label: 'Tổng phải trả', value: fmtVND(o.totalPay) },
        { label: 'Tiền gốc', value: fmtVND(P) },
      ],
      steps,
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả lãi vay',
      shareTitle: 'Tính lãi vay & lịch trả nợ',
      image: {
        title: 'LÃI VAY & LỊCH TRẢ NỢ',
        file: 'lai-vay.png',
        heroLabel: method === 'annuity' ? 'Trả mỗi tháng' : 'Trả tháng đầu (cao nhất)',
        heroValue: fmtVND(firstPay),
        pctLine: 'Vay ' + fmtVND(P) + ' · ' + fmtNum(annual) + '%/năm · ' + n + ' tháng · ' + methodLabel,
        rows: [
          ['Số tiền vay', fmtVND(P), false],
          ['Tổng tiền lãi', fmtVND(o.totalInterest), false],
          ['Tổng phải trả', fmtVND(o.totalPay), false],
          [method === 'annuity' ? 'Trả mỗi tháng' : 'Trả tháng đầu', fmtVND(firstPay), true],
        ],
      },
    }, stepsState);
    sticky.update(method === 'annuity' ? 'Trả/tháng' : 'Trả đầu', fmtVND(firstPay));
    // Bảng lịch trả nợ: kỳ hạn dài (> 60 tháng) chỉ hiện 12 kỳ đầu + 3 kỳ
    // cuối, kèm dòng ghi chú — bảng 600 dòng không đọc được trên điện thoại.
    const rowHtml = s => '<tr><td>' + s.i + '</td><td>' + fmtVND(s.principal) + '</td><td>' + fmtVND(s.interest) + '</td><td>' + fmtVND(s.pay) + '</td><td>' + fmtVND(s.balance) + '</td></tr>';
    let scheduleRows;
    let scheduleNote = '';
    if (o.schedule.length > 60) {
      scheduleRows = o.schedule.slice(0, 12).map(rowHtml).join('')
        + '<tr><td colspan="5" class="muted">… còn ' + (o.schedule.length - 15) + ' kỳ ở giữa (kỳ 13–' + (o.schedule.length - 3) + ') — bảng rút gọn để dễ đọc.</td></tr>'
        + o.schedule.slice(-3).map(rowHtml).join('');
      scheduleNote = '<p class="muted small">Bảng trên rút gọn 12 kỳ đầu + 3 kỳ cuối. Tổng tiền lãi và tổng phải trả vẫn tính đủ ' + n + ' kỳ.</p>';
    } else {
      scheduleRows = o.schedule.map(rowHtml).join('');
    }
    $('lv-schedule').innerHTML = '<h3 class="m2-schedule-title">Lịch trả nợ từng tháng</h3>'
      + '<p class="m2-schedule-hint">Bảng có 5 cột — vuốt ngang để xem đủ.</p>'
      + '<table class="tbl"><thead><tr><th>Kỳ</th><th>Tiền gốc</th><th>Tiền lãi</th><th>Trả trong tháng</th><th>Dư nợ còn lại</th></tr></thead><tbody>'
      + scheduleRows + '</tbody></table>' + scheduleNote;
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const P = parseNum($('lv-principal').value);
    const annual = parseNum($('lv-rate').value);
    const monthsRaw = $('lv-months').value.trim();
    const n = Math.round(parseNum(monthsRaw));
    const method = $('lv-method').value;
    if (!(P > 0)) {
      if (showErrors) {
        markErr($('lv-principal'), 'Ô Số tiền vay chưa đúng — nhập số lớn hơn 0, ví dụ 100.000.000.');
        focusEl($('lv-principal'));
      }
      M2.renderEmpty($('lv-out'), 'Nhập số tiền vay để xem lịch trả nợ.');
      $('lv-schedule').innerHTML = '';
      return false;
    }
    if (isNaN(annual) || annual < 0) {
      if (showErrors) {
        markErr($('lv-rate'), 'Ô Lãi suất chưa đúng — nhập số từ 0 trở lên, ví dụ 12.');
        focusEl($('lv-rate'));
      }
      M2.renderEmpty($('lv-out'), 'Nhập số tiền vay để xem lịch trả nợ.');
      $('lv-schedule').innerHTML = '';
      return false;
    }
    if (!monthsRaw || isNaN(n) || n < 1 || n > 600) {
      if (showErrors) {
        markErr($('lv-months'), 'Ô Kỳ hạn chưa đúng — nhập số tháng từ 1 đến 600, ví dụ 12.');
        focusEl($('lv-months'));
      }
      M2.renderEmpty($('lv-out'), 'Nhập số tiền vay để xem lịch trả nợ.');
      $('lv-schedule').innerHTML = '';
      return false;
    }
    render(C.laiVay(P, annual, n, method), P, annual, n, method);
    return true;
  }

  M2.bindMoneyFormat($('lv-principal'));

  root.querySelectorAll('[data-lv-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('lv-principal');
      el.value = fmtNum(parseInt(btn.getAttribute('data-lv-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['lv-principal', 'lv-rate', 'lv-months', 'lv-method'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  tryRender(true);
}
