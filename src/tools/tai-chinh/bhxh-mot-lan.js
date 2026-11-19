// Tính BHXH một lần — theo Điều 70 Luật BHXH 2024 (41/2024/QH15, hiệu lực 01/7/2025).
// Bố cục MẪU 2: 2 thẻ cạnh nhau, tính trực tiếp khi nhập, không nút Tính /
// Đặt lại / Điền ví dụ. Công thức ở src/money-formulas.js (M2_CALC); thẻ
// kết quả, bảng từng bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
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
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="bhxh-avg">Mức bình quân tiền lương tháng đóng BHXH</label>
          <span class="input-unit"><input id="bhxh-avg" class="m2-salary" type="text" inputmode="decimal" value="10.000.000" placeholder="Ví dụ: 10.000.000"><span class="unit">₫</span></span>
          <p class="hint">Lương bình quân toàn bộ quá trình đóng (tra trên VssID). Công cụ tính theo con số bạn nhập, chưa điều chỉnh hệ số trượt giá — nếu có mức bình quân đã điều chỉnh thì nhập mức đó.</p>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức bình quân">
          <button type="button" class="m2-quick-btn" data-bhxh-quick="8000000">8 triệu</button>
          <button type="button" class="m2-quick-btn" data-bhxh-quick="10000000">10 triệu</button>
          <button type="button" class="m2-quick-btn" data-bhxh-quick="15000000">15 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field"><label for="bhxh-y1">Đóng trước 2014 — số năm</label><input id="bhxh-y1" class="m2-num" type="number" min="0" step="1" value="5"></div>
          <div class="field m2-field"><label for="bhxh-m1">Đóng trước 2014 — tháng lẻ</label><input id="bhxh-m1" class="m2-num" type="number" min="0" max="11" step="1" value="3"></div>
        </div>
        <div class="m2-row2">
          <div class="field m2-field"><label for="bhxh-y2">Đóng từ 2014 — số năm</label><input id="bhxh-y2" class="m2-num" type="number" min="0" step="1" value="8"></div>
          <div class="field m2-field"><label for="bhxh-m2">Đóng từ 2014 — tháng lẻ</label><input id="bhxh-m2" class="m2-num" type="number" min="0" max="11" step="1" value="0"></div>
        </div>
        <p class="hint">Tháng lẻ trước 2014 được chuyển sang giai đoạn từ 2014 để tính; tháng lẻ 1–6 tháng tính là nửa năm, 7–11 tháng tính là 1 năm.</p>
        <div class="field m2-field">
          <label for="bhxh-joined">Bạn bắt đầu đóng BHXH khi nào?</label>
          <select id="bhxh-joined" class="m2-select"><option value="before">Trước ngày 01/7/2025</option><option value="from">Từ ngày 01/7/2025 trở đi</option></select>
          <p class="hint">Mốc này quyết định bạn có còn được rút một lần sau 12 tháng nghỉ việc hay không (Luật BHXH 2024).</p>
        </div>
        <div class="field m2-field">
          <label for="bhxh-paid">Tổng tiền đã đóng vào quỹ hưu trí – tử tuất <span class="m2-optional">(chỉ cần khi đóng chưa đủ 1 năm)</span></label>
          <span class="input-unit"><input id="bhxh-paid" class="m2-money" type="text" inputmode="decimal" value="" placeholder="Bỏ trống để ước tính"><span class="unit">₫</span></span>
          <p class="hint">Tra trên ứng dụng VssID. Bỏ trống thì công cụ ước tính ≈ 22% × lương bình quân × số tháng đóng (22% = 8% người lao động + 14% người sử dụng lao động đóng vào quỹ hưu trí – tử tuất).</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="bhxh-result-card">
      <div id="bhxh-out"></div>
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
  const markErr = U.markFieldError || function (el, msg) { $('bhxh-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !C) {
    $('bhxh-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const fmtYears = y => (Number.isInteger(y) ? String(y) : y.toLocaleString('vi-VN')) + ' năm';
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  const sticky = M2.setupSticky({
    root,
    resultEl: $('bhxh-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép kết quả BHXH một lần',
  });

  function eligibility(joined, totalMonths) {
    if (joined === 'from') {
      return 'Bạn bắt đầu đóng từ 01/7/2025 nên KHÔNG rút được chỉ vì nghỉ việc 12 tháng — chỉ rút được khi đủ tuổi hưu mà chưa đủ 15 năm đóng, định cư nước ngoài, bệnh hiểm nghèo hoặc suy giảm khả năng lao động từ 81% trở lên.';
    }
    if (totalMonths >= 240) {
      return 'Bạn đã đóng đủ 20 năm nên không rút được theo diện nghỉ việc 12 tháng — thời gian này để hưởng lương hưu.';
    }
    return 'Bạn có thời gian đóng trước 01/7/2025 nên vẫn được rút sau 12 tháng không tham gia BHXH bắt buộc lẫn tự nguyện (chưa đủ 20 năm đóng).';
  }

  function render(o, avg, joined, paidInput) {
    const totalText = o.totalMonths < 12
      ? o.totalMonths + ' tháng (chưa đủ 1 năm)'
      : fmtYears(Math.floor(o.totalMonths / 12)) + (o.totalMonths % 12 ? ' ' + (o.totalMonths % 12) + ' tháng' : '');
    const mult = avg > 0 ? (o.amount / avg).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '';
    const pctLine = o.underOneYear
      ? 'Đóng ' + totalText
      : totalText + ' · bằng ' + mult + ' tháng lương bình quân';
    let steps;
    let rows;
    let imageRows;
    if (o.underOneYear) {
      steps = [
        { label: 'Số tiền đã đóng vào quỹ hưu trí – tử tuất', sub: paidInput > 0 ? 'Theo số bạn nhập (tra trên VssID)' : 'Ước tính 22% × lương bình quân × số tháng đóng', amount: fmtVND(o.paid) },
        { label: 'Mức tối đa (2 tháng mức bình quân)', sub: '', amount: fmtVND(o.cap) },
        { label: 'Số tiền BHXH một lần (lấy số nhỏ hơn)', sub: '', amount: fmtVND(o.amount) },
      ];
      rows = [
        { label: 'Số tiền đã đóng', value: fmtVND(o.paid) },
        { label: 'Mức tối đa (2 tháng mức bình quân)', value: fmtVND(o.cap) },
        { label: 'Tổng thời gian đóng', value: totalText },
      ];
      imageRows = [
        ['Số tiền đã đóng', fmtVND(o.paid), false],
        ['Mức tối đa', fmtVND(o.cap), false],
        ['Số tiền BHXH một lần', fmtVND(o.amount), true],
      ];
      lastCopyText = 'Đóng ' + totalText + ' · Số tiền đã đóng: ' + fmtVND(o.paid)
        + ' · Mức tối đa: ' + fmtVND(o.cap)
        + ' · BHXH một lần: ' + fmtVND(o.amount);
    } else {
      steps = [
        { label: 'Mức bình quân tiền lương tháng', sub: '', amount: fmtVND(avg) },
        { label: 'Trước 2014: ' + fmtYears(o.t1) + ' × 1,5', sub: o.odd1 ? o.odd1 + ' tháng lẻ chuyển sang giai đoạn từ 2014' : '', amount: fmtVND(o.part1) },
        { label: 'Từ 2014: ' + fmtYears(o.t2) + ' × 2', sub: o.rem2 ? 'Gồm ' + o.rem2 + ' tháng lẻ tính là ' + (o.frac2 === 0.5 ? 'nửa năm' : '1 năm') : '', amount: fmtVND(o.part2) },
        { label: 'Số tiền BHXH một lần', sub: '', amount: fmtVND(o.amount) },
      ];
      rows = [
        { label: 'Phần trước 2014 (hệ số 1,5)', value: fmtVND(o.part1) },
        { label: 'Phần từ 2014 (hệ số 2)', value: fmtVND(o.part2) },
        { label: 'Tổng thời gian đóng', value: totalText },
      ];
      imageRows = [
        ['Mức bình quân', fmtVND(avg), false],
        ['Phần trước 2014', fmtVND(o.part1), false],
        ['Phần từ 2014', fmtVND(o.part2), false],
        ['Số tiền BHXH một lần', fmtVND(o.amount), true],
      ];
      lastCopyText = 'Mức bình quân: ' + fmtVND(avg)
        + ' · Trước 2014: ' + fmtYears(o.t1) + ' → ' + fmtVND(o.part1)
        + ' · Từ 2014: ' + fmtYears(o.t2) + ' → ' + fmtVND(o.part2)
        + ' · BHXH một lần: ' + fmtVND(o.amount);
    }
    M2.renderResult($('bhxh-out'), {
      label: 'Số tiền BHXH một lần ước tính',
      value: fmtVND(o.amount),
      pctLine,
      rows,
      steps,
      note: eligibility(joined, o.totalMonths),
      copyText: lastCopyText,
      copyMsg: 'Đã chép kết quả BHXH một lần',
      shareTitle: 'Tính BHXH một lần',
      image: {
        title: 'BHXH MỘT LẦN',
        file: 'bhxh-mot-lan.png',
        heroLabel: 'Số tiền BHXH một lần ước tính',
        heroValue: fmtVND(o.amount),
        pctLine,
        rows: imageRows,
      },
    }, stepsState);
    sticky.update('BHXH', fmtVND(o.amount));
  }

  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const avg = parseNum($('bhxh-avg').value);
    const y1 = Math.max(0, Math.floor(parseNum($('bhxh-y1').value)));
    const m1 = Math.min(11, Math.max(0, Math.floor(parseNum($('bhxh-m1').value))));
    const y2 = Math.max(0, Math.floor(parseNum($('bhxh-y2').value)));
    const m2 = Math.min(11, Math.max(0, Math.floor(parseNum($('bhxh-m2').value))));
    const joined = $('bhxh-joined').value;
    const paidInput = parseNum($('bhxh-paid').value);
    const total = (y1 * 12 + m1) + (y2 * 12 + m2);
    if (!(avg > 0)) {
      if (showErrors) {
        markErr($('bhxh-avg'), 'Ô Mức bình quân chưa có số — nhập số lớn hơn 0, ví dụ 10.000.000.');
        focusEl($('bhxh-avg'));
      }
      M2.renderEmpty($('bhxh-out'), 'Nhập mức bình quân để xem số tiền rút được.');
      return false;
    }
    if (total <= 0) {
      if (showErrors) {
        markErr($('bhxh-y1'), 'Chưa nhập thời gian đóng BHXH — nhập số năm hoặc số tháng lẻ đã đóng.');
        focusEl($('bhxh-y1'));
      }
      M2.renderEmpty($('bhxh-out'), 'Nhập thời gian đóng để xem số tiền rút được.');
      return false;
    }
    render(C.bhxhMotLan(avg, y1, m1, y2, m2, paidInput), avg, joined, paidInput);
    return true;
  }

  M2.bindMoneyFormat($('bhxh-avg'));
  M2.bindMoneyFormat($('bhxh-paid'));

  root.querySelectorAll('[data-bhxh-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('bhxh-avg');
      el.value = fmtNum(parseInt(btn.getAttribute('data-bhxh-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['bhxh-avg', 'bhxh-y1', 'bhxh-m1', 'bhxh-y2', 'bhxh-m2', 'bhxh-joined', 'bhxh-paid'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  tryRender(true);
}
