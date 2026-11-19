// Trợ cấp thôi việc & BHTN — Utility Hub (Văn phòng)
// Công thức theo Điều 39 Luật Việc làm 74/2025/QH15 (hiệu lực 01/01/2026):
// 60% lương bình quân đóng BHTN 6 tháng gần nhất, tối đa 5 lần lương tối thiểu
// vùng tại tháng cuối cùng đóng BHTN (mức 2026 theo NĐ 293/2025/NĐ-CP).
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ. Công thức ở src/money-formulas.js (M2_CALC); thẻ
// kết quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
export const meta = {
  id: 'tro-cap-thoi-viec-bhtn',
  name: 'Trợ cấp thôi việc & BHTN',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Ước tính trợ cấp thất nghiệp hằng tháng (60% lương đóng BHTN, tối đa 5 lần lương tối thiểu vùng 2026) và trợ cấp thôi việc.',
  keywords: 'trợ cấp thất nghiệp, BHTN, trợ cấp thôi việc, bảo hiểm thất nghiệp, tính BHTN 2026, lương tối thiểu vùng 2026, trần trợ cấp thất nghiệp, luật việc làm 2025',
  icon: '🛡️',
  seoTitle: 'Tính trợ cấp thất nghiệp (BHTN) 2026 & trợ cấp thôi việc',
  seoDesc: 'Ước tính mức hưởng trợ cấp thất nghiệp hằng tháng (60% lương đóng BHTN, áp trần 5 lần lương tối thiểu vùng 2026) và số tháng được hưởng, cộng trợ cấp thôi việc cho thời gian làm việc trước 2009.'
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="tc-salary">Lương bình quân đóng BHTN 6 tháng gần nhất</label>
          <span class="input-unit"><input id="tc-salary" class="m2-salary" type="text" inputmode="decimal" value="12.000.000" placeholder="Ví dụ: 12.000.000"><span class="unit">₫</span></span>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức lương bình quân">
          <button type="button" class="m2-quick-btn" data-tc-quick="8000000">8 triệu</button>
          <button type="button" class="m2-quick-btn" data-tc-quick="12000000">12 triệu</button>
          <button type="button" class="m2-quick-btn" data-tc-quick="20000000">20 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="tc-months">Tổng thời gian đóng BHTN (tháng)</label>
            <input id="tc-months" class="m2-num" type="number" min="0" step="1" value="24">
          </div>
          <div class="field m2-field">
            <label for="tc-pre2009">Số năm làm trước 2009</label>
            <input id="tc-pre2009" class="m2-num" type="number" min="0" step="0.5" value="0">
          </div>
        </div>
        <p class="hint">Số tháng hưởng: đóng đủ 12–36 tháng → 3 tháng; cứ thêm đủ 12 tháng đóng → +1 tháng, tối đa 12 tháng. Chưa đóng đủ 12 tháng thì chưa đủ điều kiện hưởng. Trợ cấp thôi việc: 1/2 tháng lương cho mỗi năm làm việc trước 01/01/2009 chưa tham gia BHTN.</p>
        <div class="field m2-field">
          <label for="tc-region">Vùng lương tối thiểu nơi đóng BHTN tháng cuối cùng</label>
          <select id="tc-region" class="m2-select">
            <option value="I">Vùng I</option>
            <option value="II">Vùng II</option>
            <option value="III">Vùng III</option>
            <option value="IV">Vùng IV</option>
          </select>
          <p class="hint" id="tc-region-hint">Lương tối thiểu vùng I năm 2026: 5.310.000₫/tháng — trần trợ cấp: 26.550.000₫/tháng.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="tc-result-card">
      <div id="tc-out"></div>
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
  const markErr = U.markFieldError || function (el, msg) { $('tc-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('tc-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const MIN_WAGE = C.MIN_WAGE_2026 || { I: 5310000, II: 4730000, III: 4140000, IV: 3700000 };
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('tc-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả trợ cấp thôi việc & BHTN',
  });

  function render(o, salary, months, region, pre2009) {
    const minWage = MIN_WAGE[region] || MIN_WAGE.I;
    if (!o.eligible) {
      lastCopyText = '';
      M2.renderResult($('tc-out'), {
        label: 'Trợ cấp thất nghiệp / tháng',
        value: 'Chưa đủ điều kiện',
        pctLine: 'Đã đóng ' + fmtNum(months) + ' tháng · cần đủ 12 tháng',
        rows: [
          { label: 'Tổng thời gian đóng BHTN', value: fmtNum(months) + ' tháng' },
          { label: 'Còn thiếu để đủ điều kiện', value: fmtNum(12 - months) + ' tháng' },
          { label: 'Trợ cấp thôi việc (trước 2009)', value: fmtVND(o.severance) },
        ],
        steps: [
          { label: 'Tổng thời gian đóng BHTN', sub: '', amount: fmtNum(months) + ' tháng' },
          { label: 'Điều kiện hưởng BHTN', sub: 'Đã đóng BHTN đủ 12 tháng trong 24 tháng trước khi chấm dứt hợp đồng (36 tháng với hợp đồng mùa vụ) và nộp hồ sơ trong 3 tháng kể từ ngày chấm dứt hợp đồng', amount: '12 tháng' },
        ],
        note: 'Bạn chưa đóng đủ 12 tháng nên chưa hưởng được trợ cấp thất nghiệp — thời gian đã đóng được bảo lưu cho lần hưởng sau. Trợ cấp thôi việc cho thời gian làm việc trước 2009 (nếu có) vẫn tính riêng.',
        copyText: '',
        image: null,
      }, stepsState);
      sticky.hide();
      return;
    }
    lastCopyText = 'Trợ cấp thất nghiệp/tháng: ' + fmtVND(o.monthly)
      + ' · Số tháng hưởng: ' + fmtNum(o.benefitMonths) + ' tháng'
      + ' · Tổng trợ cấp thất nghiệp: ' + fmtVND(o.totalBHTN)
      + ' · Trợ cấp thôi việc: ' + fmtVND(o.severance);
    const steps = [
      { label: '60% lương bình quân 6 tháng gần nhất', sub: fmtVND(salary) + ' × 60%', amount: fmtVND(o.rawMonthly) },
      { label: 'Mức trần (5 × lương tối thiểu vùng ' + region + ')', sub: 'Lương tối thiểu vùng ' + region + ' năm 2026: ' + fmtVND(minWage) + '/tháng', amount: fmtVND(o.cap) },
      { label: 'Trợ cấp thất nghiệp / tháng', sub: o.capped ? 'Đã áp trần (60% lương vượt trần)' : 'Chưa tới trần', amount: fmtVND(o.monthly) },
      { label: 'Số tháng được hưởng', sub: 'Đóng ' + fmtNum(months) + ' tháng — 12–36 tháng → 3 tháng, thêm đủ 12 tháng → +1 tháng, tối đa 12 tháng', amount: fmtNum(o.benefitMonths) + ' tháng' },
      { label: 'Tổng trợ cấp thất nghiệp', sub: fmtVND(o.monthly) + ' × ' + fmtNum(o.benefitMonths) + ' tháng', amount: fmtVND(o.totalBHTN) },
    ];
    if (pre2009 > 0) {
      steps.push({ label: 'Trợ cấp thôi việc (trước 2009)', sub: fmtNum(pre2009) + ' năm × 1/2 tháng lương', amount: fmtVND(o.severance) });
    }
    M2.renderResult($('tc-out'), {
      label: 'Trợ cấp thất nghiệp / tháng',
      value: fmtVND(o.monthly),
      pctLine: '60% lương bình quân' + (o.capped ? ' · đã áp trần ' + fmtVND(o.cap) : ' · dưới trần ' + fmtVND(o.cap)),
      rows: [
        { label: 'Số tháng được hưởng', value: fmtNum(o.benefitMonths) + ' tháng' },
        { label: 'Tổng trợ cấp thất nghiệp', value: fmtVND(o.totalBHTN) },
        { label: 'Trợ cấp thôi việc (trước 2009)', value: fmtVND(o.severance) },
      ],
      steps,
      note: 'Điều kiện hưởng: đã đóng BHTN đủ 12 tháng trong 24 tháng trước khi chấm dứt hợp đồng (36 tháng với hợp đồng mùa vụ) và nộp hồ sơ trong 3 tháng kể từ ngày chấm dứt hợp đồng. Kết quả chỉ là ước tính — mức thực tế do cơ quan BHXH xác định.',
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả trợ cấp thôi việc & BHTN',
      shareTitle: 'Tính trợ cấp thất nghiệp (BHTN) 2026 & trợ cấp thôi việc',
      image: {
        title: 'TRỢ CẤP THẤT NGHIỆP (BHTN)',
        file: 'tro-cap-bhtn.png',
        heroLabel: 'Trợ cấp thất nghiệp / tháng',
        heroValue: fmtVND(o.monthly),
        pctLine: '60% lương bình quân · ' + fmtNum(o.benefitMonths) + ' tháng hưởng',
        rows: [
          ['Lương bình quân', fmtVND(salary), false],
          ['Trần vùng ' + region, fmtVND(o.cap), false],
          ['Tổng trợ cấp thất nghiệp', fmtVND(o.totalBHTN), false],
          ['Trợ cấp / tháng', fmtVND(o.monthly), true],
        ],
      },
    }, stepsState);
    sticky.update('BHTN', fmtVND(o.monthly));
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const salary = parseNum($('tc-salary').value);
    const months = Math.max(0, Math.floor(parseNum($('tc-months').value)));
    const pre2009 = Math.max(0, parseNum($('tc-pre2009').value));
    const region = $('tc-region').value in MIN_WAGE ? $('tc-region').value : 'I';
    if (!(salary > 0)) {
      if (showErrors) {
        markErr($('tc-salary'), 'Ô Lương bình quân chưa có số — nhập số lớn hơn 0, ví dụ 12.000.000.');
        focusEl($('tc-salary'));
      }
      M2.renderEmpty($('tc-out'), 'Nhập lương bình quân để xem trợ cấp.');
      return false;
    }
    render(C.bhtn(salary, months, region, pre2009), salary, months, region, pre2009);
    return true;
  }

  M2.bindMoneyFormat($('tc-salary'));

  root.querySelectorAll('[data-tc-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('tc-salary');
      el.value = fmtNum(parseInt(btn.getAttribute('data-tc-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  function updateRegionHint() {
    const region = $('tc-region').value;
    const minWage = MIN_WAGE[region] || MIN_WAGE.I;
    const hint = $('tc-region-hint');
    if (hint) hint.textContent = 'Lương tối thiểu vùng ' + region + ' năm 2026: ' + fmtVND(minWage) + '/tháng — trần trợ cấp: ' + fmtVND(5 * minWage) + '/tháng.';
  }
  $('tc-region').addEventListener('change', updateRegionHint);

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['tc-salary', 'tc-months', 'tc-pre2009', 'tc-region'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  updateRegionHint();
  tryRender(true);
}
