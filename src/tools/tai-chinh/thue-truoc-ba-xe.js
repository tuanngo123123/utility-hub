// Lệ phí trước bạ xe — NĐ 10/2022/NĐ-CP, sửa đổi bởi NĐ 175/2025/NĐ-CP
// (hiệu lực 01/07/2025): xe máy lần đầu 2% / lần 2+ 1%; ô tô ≤9 chỗ lần đầu 10%
// (HĐND tỉnh tăng tối đa +50%, Hà Nội 12%); pick-up/VAN 60% mức ô tô con;
// ô tô điện chạy pin lần đầu 0% đến 28/02/2027; ô tô khác và lần 2+ là 2%.
export const meta = {
  id: 'thue-truoc-ba-xe',
  name: 'Tính lệ phí trước bạ xe',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính lệ phí trước bạ ô tô, xe máy khi đăng ký lần đầu hoặc sang tên: ô tô con 10–12%, xe máy 2%, ô tô điện 0% đến 28/02/2027.',
  keywords: 'lệ phí trước bạ xe, thuế trước bạ ô tô, trước bạ xe máy, trước bạ Hà Nội 12%, ô tô điện miễn trước bạ',
  icon: '🚗',
  seoTitle: 'Tính lệ phí trước bạ xe 2026 — ô tô, xe máy, ô tô điện',
  seoDesc: 'Tính lệ phí trước bạ khi mua xe mới hoặc sang tên: ô tô con 10% (Hà Nội 12%), xe máy 2%, ô tô điện 0% đến 28/02/2027. Tính ngay, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-2">
    <div class="field">
      <label for="tb-type">Loại xe</label>
      <select id="tb-type">
        <option value="car9">Ô tô chở người đến 9 chỗ (xe con, SUV…)</option>
        <option value="pickup">Ô tô pick-up cabin kép / ô tô tải VAN</option>
        <option value="ev">Ô tô điện chạy pin (đến 9 chỗ)</option>
        <option value="truck">Ô tô tải, xe khách từ 10 chỗ, rơ moóc…</option>
        <option value="moto">Xe máy (mô tô, xe gắn máy)</option>
      </select>
    </div>
    <div class="field">
      <label for="tb-time">Lần nộp lệ phí</label>
      <select id="tb-time">
        <option value="first">Lần đầu (đăng ký xe mới)</option>
        <option value="second">Lần thứ 2 trở đi (sang tên, xe đã qua sử dụng)</option>
      </select>
    </div>
    <div class="field" id="tb-rate-wrap">
      <label for="tb-rate">Mức thu ô tô con lần đầu tại địa phương</label>
      <select id="tb-rate">
        <option value="10">10% — đa số tỉnh, thành (kể cả TP.HCM)</option>
        <option value="12">12% — Hà Nội, Hải Phòng, Quảng Ninh, Cần Thơ…</option>
        <option value="11">11% — Hà Tĩnh</option>
      </select>
      <p class="hint">Mức chung là 10%; HĐND tỉnh, thành phố được tăng tối đa 50% (tối đa 15%). Pick-up/VAN nộp bằng 60% mức này (6% / 6,6% / 7,2%).</p>
    </div>
    <div class="field">
      <label for="tb-price">Giá tính lệ phí trước bạ</label>
      <span class="input-unit"><input id="tb-price" type="text" inputmode="decimal" value="800.000.000" placeholder="VD: 800.000.000"><span class="unit">₫</span></span>
      <p class="hint">Là giá theo bảng giá tính lệ phí trước bạ do UBND tỉnh ban hành (từ 01/01/2026), thường gần với giá niêm yết xe mới. Với xe đã qua sử dụng, giá tính theo tỷ lệ % giá trị còn lại — nhập đúng giá tính của xe bạn.</p>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="tb-calc">Tính lệ phí trước bạ</button>
    <button type="button" class="btn btn-ghost" id="tb-example">Điền ví dụ</button>
  </div>
  <div id="tb-out"></div>
  <p class="note">Căn cứ: Điều 8 NĐ 10/2022/NĐ-CP, sửa đổi bởi NĐ 175/2025/NĐ-CP (hiệu lực 01/07/2025): xe máy lần đầu 2%, lần 2+ 1%; ô tô chở người đến 9 chỗ lần đầu 10% (HĐND tỉnh tăng tối đa không quá 50%); pick-up cabin kép/tải VAN bằng 60% mức ô tô con; ô tô điện chạy pin lần đầu 0% đến hết 28/02/2027; ô tô khác và nộp lần 2+ là 2%. Từ 01/01/2026, bảng giá tính lệ phí trước bạ do UBND tỉnh ban hành (NĐ 175/2025). Kết quả chỉ mang tính tham khảo, chưa gồm lệ phí cấp biển số và các phí đăng ký khác — mức thu thực tế do cơ quan thuế xác định theo bảng giá tại địa phương.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tb-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const fmtPct = n => String(Math.round(n * 100) / 100).replace('.', ',');

  const TYPE_LABELS = {
    car9: 'Ô tô chở người đến 9 chỗ',
    pickup: 'Ô tô pick-up cabin kép / tải VAN',
    ev: 'Ô tô điện chạy pin',
    truck: 'Ô tô tải / xe khách từ 10 chỗ / rơ moóc',
    moto: 'Xe máy',
  };

  function rateFor(type, time, localRate) {
    if (time === 'second') return { rate: type === 'moto' ? 0.01 : 0.02, note: type === 'moto' ? 'Xe máy nộp lần thứ 2 trở đi: 1%.' : 'Ô tô nộp lần thứ 2 trở đi: 2% thống nhất toàn quốc.' };
    if (type === 'moto') return { rate: 0.02, note: 'Xe máy đăng ký lần đầu: 2% (mức 5% tại thành phố lớn trước đây đã bỏ từ 01/07/2025).' };
    if (type === 'ev') return { rate: 0, note: 'Ô tô điện chạy pin đăng ký lần đầu: 0% đến hết 28/02/2027.' };
    if (type === 'truck') return { rate: 0.02, note: 'Ô tô tải, xe khách từ 10 chỗ, rơ moóc: 2% thống nhất toàn quốc.' };
    if (type === 'pickup') return { rate: localRate * 0.6 / 100, note: 'Pick-up/VAN bằng 60% mức thu ô tô con tại địa phương (' + fmtPct(localRate * 0.6) + '%).' };
    return { rate: localRate / 100, note: 'Ô tô chở người đến 9 chỗ đăng ký lần đầu tại địa phương: ' + fmtPct(localRate) + '% (mức chung 10%, HĐND tỉnh tăng tối đa 50%).' };
  }

  function syncRateWrap() {
    const type = $('tb-type').value;
    const time = $('tb-time').value;
    $('tb-rate-wrap').style.display = (time === 'first' && (type === 'car9' || type === 'pickup')) ? '' : 'none';
  }

  function calc() {
    clearErrs(root);
    const type = $('tb-type').value;
    const time = $('tb-time').value;
    const localRate = parseNum($('tb-rate').value);
    const price = parseNum($('tb-price').value);
    if (!(price > 0)) {
      markErr($('tb-price'), 'Ô Giá tính lệ phí trước bạ chưa có số — nhập số lớn hơn 0, ví dụ 800.000.000.');
      focusEl($('tb-price'));
      $('tb-out').innerHTML = '';
      return;
    }
    const { rate, note } = rateFor(type, time, localRate);
    const fee = price * rate;
    const copyText = 'Lệ phí trước bạ ' + TYPE_LABELS[type] + ' (' + (time === 'first' ? 'lần đầu' : 'lần thứ 2 trở đi') + ', giá tính ' + fmtVND(price) + ', mức ' + fmtPct(rate * 100) + '%): ' + fmtVND(fee);
    $('tb-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Lệ phí trước bạ phải nộp</p>
    <div class="result-hero-value">${fmtVND(fee)}</div>
    <p class="result-hero-sub">${note}</p>
  </div>
  <div class="result-row"><span>Loại xe</span><strong>${TYPE_LABELS[type]}</strong></div>
  <div class="result-row"><span>Lần nộp lệ phí</span><strong>${time === 'first' ? 'Lần đầu' : 'Lần thứ 2 trở đi'}</strong></div>
  <div class="result-row"><span>Giá tính lệ phí trước bạ</span><strong>${fmtVND(price)}</strong></div>
  <div class="result-row"><span>Mức thu</span><strong>${fmtPct(rate * 100)}%</strong></div>
  <div class="result-row"><span>Lệ phí trước bạ</span><strong>${fmtVND(fee)}</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả lệ phí trước bạ">Chép kết quả</button></div>
</div>`;
    bindCopy($('tb-out'));
  }

  $('tb-type').addEventListener('change', syncRateWrap);
  $('tb-time').addEventListener('change', syncRateWrap);
  function runCalc() { withBusy($('tb-calc'), calc); }
  $('tb-calc').addEventListener('click', runCalc);
  $('tb-price').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: ô tô 5 chỗ giá tính 800 triệu, đăng ký lần đầu tại Hà Nội (12%) → 96.000.000₫.
  $('tb-example').addEventListener('click', () => {
    fillEx(root, { 'tb-type': 'car9', 'tb-time': 'first', 'tb-rate': '12', 'tb-price': '800.000.000' }, $('tb-calc'));
    syncRateWrap();
  });
  syncRateWrap();
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
