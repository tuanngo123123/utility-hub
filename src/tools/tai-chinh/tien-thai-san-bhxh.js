// Tính tiền thai sản BHXH — mẹ sinh con (trợ cấp hằng tháng + trợ
// cấp một lần) và chồng nghỉ khi vợ sinh con (số ngày nghỉ + tiền
// trợ cấp theo ngày), theo Luật BHXH 41/2024.
// Bố cục MẪU 2 (trang công cụ chuẩn, Claude duyệt 14:32 19/11/2026): 2 thẻ
// cạnh nhau — trái nhập, phải kết quả dính khi cuộn; không còn nút Tính
// / Đặt lại / Điền ví dụ (mở trang đã tính sẵn ví dụ lương 10 triệu,
// sinh 1 con, đóng đủ 12 tháng → 65.060.000₫).
// Công thức ở src/thai-san-logic.js (UH_THAISAN) — bộ kiểm tự động
// scripts/test-thai-san.mjs kiểm cùng file đó; thẻ kết quả, bảng từng
// bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
// Chưa đủ điều kiện thì thẻ kết quả hiện "Chưa đủ điều kiện" + số
// tháng còn thiếu + cách khắc phục (cùng mẫu lương hưu khi chưa đủ
// 15 năm) — không hiện số tiền 0₫ gây hiểu lầm.
export const meta = {
  id: 'tien-thai-san-bhxh',
  name: 'Tính tiền thai sản BHXH',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính tiền thai sản theo Luật BHXH 2024: mẹ sinh con nhận 100% bình quân lương đóng BHXH 6 tháng gần nhất trong 6 tháng nghỉ (7 tháng khi sinh con thứ hai, sinh đôi trở lên mỗi con thêm 1 tháng) + trợ cấp một lần 5.060.000₫ mỗi con; chồng nghỉ 5–14 ngày khi vợ sinh con, tối thiểu 10 ngày khi vợ sinh con thứ hai.',
  keywords: 'tiền thai sản, tính tiền thai sản, trợ cấp thai sản, nghỉ thai sản 6 tháng, sinh con thứ hai nghỉ 7 tháng, trợ cấp một lần khi sinh, chồng nghỉ vợ sinh con, bhxh thai sản, sinh con được bao nhiêu tiền',
  icon: '👶',
  seoTitle: 'Tính tiền thai sản BHXH 2026 — mẹ sinh con, chồng nghỉ chăm vợ sinh',
  seoDesc: 'Tính tiền thai sản theo Luật BHXH 41/2024: trợ cấp 6 tháng nghỉ sinh (7 tháng khi sinh con thứ hai) + trợ cấp một lần 2 lần mức tham chiếu mỗi con, kiểm đủ điều kiện 6 tháng đóng BHXH, và tiền trợ cấp chồng nghỉ khi vợ sinh con.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="m2-toggle" role="group" aria-label="Chọn người hưởng chế độ thai sản">
          <button type="button" class="m2-toggle-btn m2-toggle-active" id="tss-tab-me">Mẹ sinh con</button>
          <button type="button" class="m2-toggle-btn" id="tss-tab-chong">Chồng nghỉ chăm vợ sinh</button>
        </div>
        <div id="tss-pane-me">
          <div class="field m2-field">
            <label for="tss-me-luong">Bình quân lương đóng BHXH 6 tháng gần nhất</label>
            <span class="input-unit"><input id="tss-me-luong" class="m2-money" type="text" inputmode="decimal" value="10.000.000" placeholder="Ví dụ: 10.000.000"><span class="unit">₫</span></span>
            <p class="hint">Bình quân tiền lương làm căn cứ đóng BHXH 6 tháng gần nhất trước khi nghỉ (tra trên VssID). Chưa đóng đủ 6 tháng thì tính bình quân các tháng đã đóng. Trần đóng BHXH: 50.600.000₫/tháng.</p>
          </div>
          <div class="m2-row2">
            <div class="field m2-field">
              <label id="tss-me-con-label">Số con sinh</label>
              <div class="m2-stepper" role="group" aria-labelledby="tss-me-con-label">
                <button type="button" class="m2-step-btn" id="tss-me-con-minus" aria-label="Giảm số con sinh">−</button>
                <input id="tss-me-con" class="m2-step-num" type="text" inputmode="none" readonly value="1" aria-label="Số con sinh">
                <button type="button" class="m2-step-btn" id="tss-me-con-plus" aria-label="Thêm số con sinh">+</button>
              </div>
              <p class="hint">Sinh đôi trở lên: từ con thứ 2, mỗi con mẹ được nghỉ thêm 1 tháng.</p>
            </div>
            <div class="field m2-field">
              <label id="tss-me-thang-label">Số tháng đã đóng BHXH trong 12 tháng trước khi sinh</label>
              <div class="m2-stepper" role="group" aria-labelledby="tss-me-thang-label">
                <button type="button" class="m2-step-btn" id="tss-me-thang-minus" aria-label="Giảm số tháng đã đóng">−</button>
                <input id="tss-me-thang" class="m2-step-num" type="text" inputmode="none" readonly value="12" aria-label="Số tháng đã đóng BHXH trong 12 tháng trước khi sinh">
                <button type="button" class="m2-step-btn" id="tss-me-thang-plus" aria-label="Thêm số tháng đã đóng">+</button>
              </div>
              <p class="hint">Cộng dồn cả thời gian đóng gián đoạn — chỉ cần đủ 6 tháng trong 12 tháng liền kề trước khi sinh.</p>
            </div>
          </div>
          <div class="field m2-field">
            <label for="tss-me-thu">Đây là con thứ mấy?</label>
            <select id="tss-me-thu" class="m2-select">
              <option value="dau" selected>Con đầu</option>
              <option value="hai">Con thứ hai</option>
              <option value="ba">Con thứ ba trở lên</option>
            </select>
            <p class="hint">Từ 01/7/2026, mẹ sinh con thứ hai (lúc sinh đã có 1 con đẻ còn sống) được nghỉ 7 tháng thay vì 6 tháng (Luật Dân số 2025); sinh con thứ ba trở lên vẫn nghỉ 6 tháng như con đầu.</p>
          </div>
          <div class="field m2-field">
            <label class="m2-check"><input type="checkbox" id="tss-rest"> Nghỉ dưỡng thai theo chỉ định của bác sĩ</label>
            <p class="hint">Chỉ chọn khi bạn mang thai từ đủ 22 tuần tuổi và buộc phải nghỉ việc để dưỡng thai theo chỉ định của cơ sở khám chữa bệnh — trường hợp này chỉ cần đóng đủ 3 tháng trong 12 tháng, nhưng phải đã đóng BHXH tổng cộng từ đủ 12 tháng trở lên.</p>
          </div>
          <div class="field m2-field" id="tss-rest-total-wrap" style="display:none">
            <label class="m2-check"><input type="checkbox" id="tss-rest-total"> Đã đóng BHXH tổng cộng từ đủ 12 tháng trở lên</label>
          </div>
        </div>
        <div id="tss-pane-chong" style="display:none">
          <div class="field m2-field">
            <label for="tss-chong-luong">Bình quân lương đóng BHXH 6 tháng gần nhất của chồng</label>
            <span class="input-unit"><input id="tss-chong-luong" class="m2-money" type="text" inputmode="decimal" value="10.000.000" placeholder="Ví dụ: 10.000.000"><span class="unit">₫</span></span>
            <p class="hint">Bình quân tiền lương làm căn cứ đóng BHXH 6 tháng gần nhất trước khi nghỉ của chồng (tra trên VssID). Trần đóng BHXH: 50.600.000₫/tháng.</p>
          </div>
          <div class="m2-row2">
            <div class="field m2-field">
              <label id="tss-chong-con-label">Số con sinh</label>
              <div class="m2-stepper" role="group" aria-labelledby="tss-chong-con-label">
                <button type="button" class="m2-step-btn" id="tss-chong-con-minus" aria-label="Giảm số con sinh">−</button>
                <input id="tss-chong-con" class="m2-step-num" type="text" inputmode="none" readonly value="1" aria-label="Số con sinh">
                <button type="button" class="m2-step-btn" id="tss-chong-con-plus" aria-label="Thêm số con sinh">+</button>
              </div>
              <p class="hint">Sinh đôi trở lên: chồng được nghỉ thêm 3 ngày cho mỗi con từ con thứ 3.</p>
            </div>
            <div class="field m2-field">
              <label for="tss-chong-loai">Trường hợp sinh</label>
              <select id="tss-chong-loai" class="m2-select">
                <option value="thuong" selected>Sinh thường</option>
                <option value="mo">Phẫu thuật hoặc sinh dưới 32 tuần tuổi</option>
              </select>
              <p class="hint">Số ngày tính theo ngày làm việc, không tính ngày nghỉ hằng tuần, lễ, Tết. Ngày bắt đầu nghỉ phải trong 60 ngày kể từ ngày vợ sinh.</p>
            </div>
          </div>
          <div class="field m2-field">
            <label class="m2-check"><input type="checkbox" id="tss-chong-con2"> Vợ sinh con thứ hai (đã có 1 con đẻ còn sống)</label>
            <p class="hint">Từ 01/7/2026, vợ sinh con thứ hai thì chồng được nghỉ tối thiểu 10 ngày làm việc (Luật Dân số 2025) — nếu vợ sinh đôi phải phẫu thuật thì vẫn nghỉ 14 ngày.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="tss-result-card">
      <div id="tss-out"></div>
    </div>
  </div>
  <p class="note">Căn cứ: Luật Bảo hiểm xã hội 41/2024/QH15 (hiệu lực 01/7/2025) — Điều 50 (điều kiện hưởng), Điều 53 (chồng nghỉ khi vợ sinh con), Điều 58 (trợ cấp một lần 2 lần mức tham chiếu mỗi con), Điều 59 (mức hưởng 100% bình quân lương đóng BHXH 6 tháng gần nhất); Bộ luật Lao động 2019 Điều 139 (nghỉ thai sản 6 tháng, sinh con thứ hai 7 tháng, sinh đôi trở lên mỗi con thêm 1 tháng); Nghị định 161/2026/NĐ-CP (mức lương cơ sở 2.530.000₫ từ 01/7/2026 — mức tham chiếu hiện bằng lương cơ sở); Luật Dân số 113/2025/QH15 + Nghị định 168/2026/NĐ-CP (mẹ sinh con thứ hai nghỉ 7 tháng; chồng nghỉ tối thiểu 10 ngày khi vợ sinh con thứ hai, từ 01/7/2026).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const D = (typeof window !== 'undefined' && window.UH_THAISAN) || null;
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tss-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !D) {
    $('tss-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  let mode = 'me';
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  // Thanh tóm tắt dính ở đáy (UH.m2): hiện khi thẻ kết quả cuộn khuất.
  const sticky = M2.setupSticky({
    root,
    resultEl: $('tss-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép tiền thai sản',
  });

  function childrenText(n) {
    return n === 1 ? '1 con' : n === 2 ? 'sinh đôi' : 'sinh ba';
  }

  function husbandCaseText(type, children, secondChild) {
    const base = type === 'mo'
      ? (children === 1 ? 'Vợ sinh phẫu thuật / dưới 32 tuần, 1 con'
        : children === 2 ? 'Vợ sinh đôi phải phẫu thuật' : 'Vợ sinh ba phải phẫu thuật')
      : (children === 1 ? 'Vợ sinh thường 1 con'
        : children === 2 ? 'Vợ sinh đôi' : 'Vợ sinh ba');
    if (!secondChild) return base;
    // Vợ sinh con thứ hai: ghi rõ cả thứ tự sinh lẫn cách sinh để
    // người đọc biết số ngày lấy theo mức nào.
    const extra = children === 1
      ? (type === 'mo' ? ', phải phẫu thuật' : '')
      : (type === 'mo' ? ' phải phẫu thuật' : '');
    const twins = children === 2 ? ', sinh đôi' : children === 3 ? ', sinh ba' : '';
    return 'Vợ sinh con thứ hai' + twins + extra;
  }

  // --- Kết quả mẹ sinh con ---
  function renderMother(r) {
    if (!r.eligible) {
      lastCopyText = '';
      const restTotal = r.reason === 'thieu-tong-12-thang';
      const rows = restTotal
        ? [
          { label: 'Số tháng đã đóng trong 12 tháng', value: r.months12 + ' tháng' },
          { label: 'Đã đóng BHXH tổng cộng', value: 'Chưa đủ 12 tháng' },
          { label: 'Điều kiện hưởng (dưỡng thai)', value: 'Đủ 3 tháng trong 12 tháng + tổng đủ 12 tháng' },
        ]
        : [
          { label: 'Số tháng đã đóng trong 12 tháng', value: r.months12 + ' tháng' },
          { label: 'Còn thiếu để đủ điều kiện', value: r.missing + ' tháng' },
          { label: 'Điều kiện hưởng', value: 'Đủ ' + r.required + ' tháng trong 12 tháng' },
        ];
      const steps = restTotal
        ? [
          { label: 'Số tháng đã đóng trong 12 tháng', sub: '', amount: r.months12 + ' tháng' },
          { label: 'Điều kiện dưỡng thai (khoản 3 Điều 50)', sub: 'Đã đóng BHXH từ đủ 12 tháng trở lên và đóng đủ 3 tháng trong 12 tháng trước khi sinh', amount: 'Chưa đủ' },
        ]
        : [
          { label: 'Số tháng đã đóng trong 12 tháng', sub: '', amount: r.months12 + ' tháng' },
          { label: 'Điều kiện hưởng (khoản 2 Điều 50)', sub: 'Đóng BHXH bắt buộc từ đủ 6 tháng trở lên trong 12 tháng liền kề trước khi sinh', amount: '6 tháng' },
          { label: 'Còn thiếu', sub: '', amount: r.missing + ' tháng' },
        ];
      const note = restTotal
        ? 'Bạn chưa đủ điều kiện hưởng thai sản theo diện dưỡng thai vì chưa đóng BHXH tổng cộng đủ 12 tháng — đối chiếu với cơ quan BHXH nơi bạn tham gia để biết thời gian đóng cụ thể của mình.'
        : 'Bạn còn thiếu ' + r.missing + ' tháng đóng BHXH trong 12 tháng trước khi sinh. Đóng thêm cho đủ ' + r.required + ' tháng trước khi sinh để đủ điều kiện hưởng — đối chiếu với cơ quan BHXH nơi bạn tham gia.';
      M2.renderResult($('tss-out'), {
        label: 'Tổng tiền thai sản nhận được',
        value: 'Chưa đủ điều kiện',
        pctLine: restTotal
          ? 'Đã đóng ' + r.months12 + ' tháng trong 12 tháng · chưa đủ 12 tháng đóng tổng cộng'
          : 'Đã đóng ' + r.months12 + ' tháng · còn thiếu ' + r.missing + ' tháng để đủ điều kiện',
        rows,
        steps,
        note,
        copyText: '',
        image: null,
      }, stepsState);
      sticky.hide();
      return;
    }
    const leaveText = r.months + ' tháng';
    const leaveSub = r.secondChild
      ? (r.children === 1
        ? 'Nghỉ 7 tháng vì sinh con thứ hai (Luật Dân số 2025)'
        : '7 tháng vì sinh con thứ hai (Luật Dân số 2025) + ' + (r.months - 7) + ' tháng vì ' + childrenText(r.children) + ' = ' + leaveText)
      : (r.children === 1
        ? 'Nghỉ 6 tháng theo Bộ luật Lao động Điều 139'
        : '6 tháng + ' + (r.months - 6) + ' tháng vì ' + childrenText(r.children) + ' = ' + leaveText);
    lastCopyText = 'Tiền thai sản (mẹ sinh ' + (r.secondChild ? 'con thứ hai, ' : '') + childrenText(r.children) + '): nghỉ ' + leaveText
      + ' × ' + fmtVND(r.monthly) + ' = ' + fmtVND(r.allowance)
      + ' + trợ cấp một lần ' + fmtVND(r.oneTime) + ' = ' + fmtVND(r.total) + '.';
    const pctLine = 'Nghỉ ' + leaveText + ' · mỗi tháng ' + fmtVND(r.monthly)
      + ' · trợ cấp một lần ' + fmtVND(r.oneTime);
    const rows = [
      { label: 'Trợ cấp thai sản hằng tháng', value: fmtVND(r.monthly) },
      { label: 'Tổng trợ cấp thai sản (' + leaveText + ')', value: fmtVND(r.allowance) },
      { label: 'Trợ cấp một lần khi sinh', value: fmtVND(r.oneTime) },
    ];
    const steps = [
      { label: 'Bình quân lương đóng BHXH' + (r.capped ? ' (đã áp trần 50.600.000₫)' : ''), sub: '6 tháng gần nhất trước khi nghỉ', amount: fmtVND(r.avg) },
      { label: 'Thời gian nghỉ thai sản', sub: leaveSub, amount: leaveText },
      { label: 'Tổng trợ cấp thai sản', sub: fmtVND(r.monthly) + ' × ' + leaveText, amount: fmtVND(r.allowance) },
      { label: 'Trợ cấp một lần khi sinh', sub: '2 × 2.530.000₫ × ' + r.children + ' con (mức tham chiếu tại tháng sinh)', amount: fmtVND(r.oneTime) },
      { label: 'Tổng tiền nhận được', sub: '', amount: fmtVND(r.total) },
    ];
    const imageRows = [
      ['Trợ cấp hằng tháng', fmtVND(r.monthly), false],
      ['Tổng trợ cấp thai sản', fmtVND(r.allowance), false],
      ['Trợ cấp một lần khi sinh', fmtVND(r.oneTime), false],
      ['Tổng tiền nhận được', fmtVND(r.total), true],
    ];
    M2.renderResult($('tss-out'), {
      label: 'Tổng tiền thai sản nhận được',
      value: fmtVND(r.total),
      pctLine,
      rows,
      steps,
      copyText: lastCopyText,
      copyMsg: 'Đã chép tiền thai sản',
      shareTitle: 'Tính tiền thai sản BHXH',
      image: {
        title: 'TIỀN THAI SẢN BHXH',
        file: 'tien-thai-san-bhxh.png',
        heroLabel: 'Tổng tiền nhận được',
        heroValue: fmtVND(r.total),
        pctLine,
        rows: imageRows,
      },
    }, stepsState);
    sticky.update('Tổng tiền thai sản', fmtVND(r.total));
  }

  // --- Kết quả chồng nghỉ khi vợ sinh con ---
  function renderHusband(r) {
    const dailyRounded = Math.round(r.daily);
    const caseText = husbandCaseText(r.type, r.children, r.secondChild);
    const daysSub = r.floorApplied
      ? '10 ngày vì vợ sinh con thứ hai (mức tối thiểu theo Luật Dân số 2025) — tính theo ngày làm việc, không tính ngày nghỉ hằng tuần, lễ, Tết'
      : 'Tính theo ngày làm việc, không tính ngày nghỉ hằng tuần, lễ, Tết';
    lastCopyText = 'Tiền thai sản cho chồng (' + caseText.toLowerCase() + '): nghỉ ' + r.days
      + ' ngày làm việc × ' + fmtVND(dailyRounded) + '/ngày = ' + fmtVND(r.total) + '.';
    const pctLine = caseText + ' · nghỉ ' + r.days + ' ngày làm việc · mỗi ngày ' + fmtVND(dailyRounded);
    const rows = [
      { label: 'Số ngày nghỉ', value: r.days + ' ngày làm việc' },
      { label: 'Trợ cấp mỗi ngày', value: fmtVND(dailyRounded) },
      { label: 'Bình quân lương đóng BHXH', value: fmtVND(r.avg) },
    ];
    const steps = [
      { label: 'Bình quân lương đóng BHXH' + (r.capped ? ' (đã áp trần 50.600.000₫)' : ''), sub: '6 tháng gần nhất trước khi nghỉ', amount: fmtVND(r.avg) },
      { label: 'Trợ cấp mỗi ngày nghỉ', sub: fmtVND(r.avg) + ' ÷ 24 ngày', amount: fmtVND(dailyRounded) },
      { label: 'Số ngày nghỉ (' + caseText.toLowerCase() + ')', sub: daysSub, amount: r.days + ' ngày' },
      { label: 'Tiền trợ cấp', sub: fmtVND(dailyRounded) + ' × ' + r.days + ' ngày', amount: fmtVND(r.total) },
    ];
    const imageRows = [
      ['Bình quân lương đóng BHXH', fmtVND(r.avg), false],
      ['Trợ cấp mỗi ngày', fmtVND(dailyRounded), false],
      ['Số ngày nghỉ', r.days + ' ngày làm việc', false],
      ['Tiền trợ cấp', fmtVND(r.total), true],
    ];
    M2.renderResult($('tss-out'), {
      label: 'Tiền trợ cấp những ngày nghỉ',
      value: fmtVND(r.total),
      pctLine,
      rows,
      steps,
      copyText: lastCopyText,
      copyMsg: 'Đã chép tiền trợ cấp',
      shareTitle: 'Tính tiền thai sản BHXH',
      image: {
        title: 'TIỀN THAI SẢN BHXH — CHỒNG NGHỈ CHĂM VỢ SINH',
        file: 'tien-thai-san-bhxh-chong.png',
        heroLabel: 'Tiền trợ cấp',
        heroValue: fmtVND(r.total),
        pctLine,
        rows: imageRows,
      },
    }, stepsState);
    sticky.update('Tiền trợ cấp', fmtVND(r.total));
  }

  function stepperValue(id) {
    const v = parseInt($(id).value, 10);
    return Number.isNaN(v) ? 0 : v;
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ / đổi tab — không spam lỗi).
  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    if (mode === 'me') {
      const salary = D.parseMoney($('tss-me-luong').value);
      if (salary === null) {
        if (showErrors) {
          markErr($('tss-me-luong'), 'Nhập bình quân lương đóng BHXH — số tiền từ 0₫ trở lên, ví dụ 10.000.000.');
          focusEl($('tss-me-luong'));
        }
        M2.renderEmpty($('tss-out'), 'Nhập bình quân lương đóng BHXH để xem tiền thai sản.');
        return false;
      }
      renderMother(D.computeMother({
        avgSalary: salary,
        children: stepperValue('tss-me-con'),
        months12: stepperValue('tss-me-thang'),
        restCase: $('tss-rest').checked,
        total12plus: $('tss-rest-total').checked,
        secondChild: $('tss-me-thu').value === 'hai',
      }));
      return true;
    }
    const salary = D.parseMoney($('tss-chong-luong').value);
    if (salary === null) {
      if (showErrors) {
        markErr($('tss-chong-luong'), 'Nhập bình quân lương đóng BHXH của chồng — số tiền từ 0₫ trở lên, ví dụ 10.000.000.');
        focusEl($('tss-chong-luong'));
      }
      M2.renderEmpty($('tss-out'), 'Nhập bình quân lương đóng BHXH của chồng để xem tiền trợ cấp.');
      return false;
    }
    renderHusband(D.computeHusband({
      avgSalary: salary,
      children: stepperValue('tss-chong-con'),
      type: $('tss-chong-loai').value,
      secondChild: $('tss-chong-con2').checked,
    }));
    return true;
  }

  // --- Công tắc Mẹ sinh con / Chồng nghỉ chăm vợ sinh: đổi chế độ
  // là tính lại ngay với số của chế độ đó (mỗi chế độ giữ số riêng).
  function setMode(m) {
    mode = m;
    $('tss-tab-me').classList.toggle('m2-toggle-active', m === 'me');
    $('tss-tab-chong').classList.toggle('m2-toggle-active', m === 'chong');
    $('tss-pane-me').style.display = m === 'me' ? '' : 'none';
    $('tss-pane-chong').style.display = m === 'chong' ? '' : 'none';
    clearErrs(root);
    tryRender(false);
  }
  $('tss-tab-me').addEventListener('click', function () { setMode('me'); });
  $('tss-tab-chong').addEventListener('click', function () { setMode('chong'); });

  // Ô "đã đóng tổng cộng từ đủ 12 tháng" chỉ hiện khi chọn dưỡng thai.
  $('tss-rest').addEventListener('change', function () {
    $('tss-rest-total-wrap').style.display = $('tss-rest').checked ? '' : 'none';
    tryRender(false);
  });
  $('tss-rest-total').addEventListener('change', function () { tryRender(false); });
  $('tss-chong-con2').addEventListener('change', function () { tryRender(false); });

  // Stepper: bấm −/+ đổi số trong khoảng cho phép rồi tính lại ngay.
  function wireStepper(minusId, plusId, inputId, min, max) {
    const input = $(inputId);
    function set(v) {
      const next = Math.min(max, Math.max(min, v));
      input.value = String(next);
      tryRender(false);
    }
    $(minusId).addEventListener('click', function () { set(stepperValue(inputId) - 1); });
    $(plusId).addEventListener('click', function () { set(stepperValue(inputId) + 1); });
  }
  wireStepper('tss-me-con-minus', 'tss-me-con-plus', 'tss-me-con', 1, 3);
  wireStepper('tss-me-thang-minus', 'tss-me-thang-plus', 'tss-me-thang', 0, 12);
  wireStepper('tss-chong-con-minus', 'tss-chong-con-plus', 'tss-chong-con', 1, 3);

  // Tính trực tiếp khi gõ: chỉ tính khi ô lương hợp lệ; chưa hợp lệ
  // thì hiện khung trống lặng lẽ, không hiện lỗi, không cướp focus.
  // Đợi 400ms sau lần gõ cuối để khỏi tính giữa chừng. Nghe cả
  // 'change' để tool-state.js điền từ URL (nó chỉ gửi 'change') cũng
  // tính lại được.
  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['tss-me-luong', 'tss-me-thu', 'tss-chong-luong', 'tss-chong-loai'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  tryRender(true);
}
