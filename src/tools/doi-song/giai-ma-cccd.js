// Giải mã số CCCD 12 số — tỉnh khai sinh, giới tính, năm sinh.
export const meta = {
  id: 'giai-ma-cccd',
  name: 'Giải mã số CCCD: tỉnh, giới tính, năm sinh',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập 12 số trên thẻ căn cước để biết nơi đăng ký khai sinh, giới tính và năm sinh được mã hóa trong đó — theo cấu trúc số định danh cá nhân.',
  keywords: 'giải mã cccd, ý nghĩa 12 số cccd, mã tỉnh cccd, tra mã tỉnh căn cước, số định danh cá nhân',
  icon: '🪪',
  seoTitle: 'Giải mã số CCCD — Biết tỉnh khai sinh, giới tính, năm sinh',
  seoDesc: '12 số CCCD mã hóa nơi khai sinh, giới tính và năm sinh. Nhập số CCCD để giải mã ngay trên trình duyệt, không gửi dữ liệu đi đâu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">12 số trên thẻ căn cước (số định danh cá nhân) mã hóa sẵn nơi khai sinh, giới tính và năm sinh của chủ thẻ. Nhập số để giải mã.</p>
  </div>
  <div class="field">
    <label for="gmcc-num">Số CCCD (12 chữ số)</label>
    <input id="gmcc-num" type="text" inputmode="numeric" autocomplete="off" placeholder="VD: 079200000001" maxlength="14">
    <p class="hint">Chỉ nhập số của chính bạn. Mọi xử lý chạy ngay trên trình duyệt, không gửi số đi đâu.</p>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="gmcc-calc">Giải mã</button>
    <button type="button" class="btn btn-ghost" id="gmcc-example">Điền ví dụ</button>
  </div>
  <div id="gmcc-out"></div>
  <p class="note">Cấu trúc 12 số (Nghị định 137/2015/NĐ-CP): 3 số đầu = mã tỉnh/thành nơi đăng ký khai sinh; số thứ 4 = mã thế kỷ + giới tính (0: nam 19xx, 1: nữ 19xx, 2: nam 20xx, 3: nữ 20xx, 4: nam 21xx, 5: nữ 21xx…); 2 số tiếp = 2 số cuối năm sinh; 6 số cuối = dãy ngẫu nhiên. Mã tỉnh là nơi khai sinh, không phải nơi ở hiện tại. Bảng mã tỉnh theo Thông tư 07/2016/TT-BCA (63 tỉnh, thành) — mã trên thẻ đã cấp không đổi sau sáp nhập 2025.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('gmcc-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Mã tỉnh/thành trên CCCD — Phụ lục 1, Thông tư 07/2016/TT-BCA.
  const PROVINCES = {
    '001': 'Hà Nội', '002': 'Hà Giang', '004': 'Cao Bằng', '006': 'Bắc Kạn',
    '008': 'Tuyên Quang', '010': 'Lào Cai', '011': 'Điện Biên', '012': 'Lai Châu',
    '014': 'Sơn La', '015': 'Yên Bái', '017': 'Hòa Bình', '019': 'Thái Nguyên',
    '020': 'Lạng Sơn', '022': 'Quảng Ninh', '024': 'Bắc Giang', '025': 'Phú Thọ',
    '026': 'Vĩnh Phúc', '027': 'Bắc Ninh', '030': 'Hải Dương', '031': 'Hải Phòng',
    '033': 'Hưng Yên', '034': 'Thái Bình', '035': 'Hà Nam', '036': 'Nam Định',
    '037': 'Ninh Bình', '038': 'Thanh Hóa', '040': 'Nghệ An', '042': 'Hà Tĩnh',
    '044': 'Quảng Bình', '045': 'Quảng Trị', '046': 'Thừa Thiên Huế', '048': 'Đà Nẵng',
    '049': 'Quảng Nam', '051': 'Quảng Ngãi', '052': 'Bình Định', '054': 'Phú Yên',
    '056': 'Khánh Hòa', '058': 'Ninh Thuận', '060': 'Bình Thuận', '062': 'Kon Tum',
    '064': 'Gia Lai', '066': 'Đắk Lắk', '067': 'Đắk Nông', '068': 'Lâm Đồng',
    '070': 'Bình Phước', '072': 'Tây Ninh', '074': 'Bình Dương', '075': 'Đồng Nai',
    '077': 'Bà Rịa – Vũng Tàu', '079': 'TP. Hồ Chí Minh', '080': 'Long An',
    '082': 'Tiền Giang', '083': 'Bến Tre', '084': 'Trà Vinh', '086': 'Vĩnh Long',
    '087': 'Đồng Tháp', '089': 'An Giang', '091': 'Kiên Giang', '092': 'Cần Thơ',
    '093': 'Hậu Giang', '094': 'Sóc Trăng', '095': 'Bạc Liêu', '096': 'Cà Mau'
  };

  function decode() {
    clearErrs(root);
    const out = $('gmcc-out');
    const raw = $('gmcc-num').value.replace(/[\s.-]/g, '');
    if (!/^\d+$/.test(raw)) {
      markErr($('gmcc-num'), 'Ô Số CCCD chưa đúng — chỉ nhập chữ số, không nhập chữ cái hay ký tự khác.');
      focusEl($('gmcc-num'));
      out.innerHTML = '';
      return;
    }
    if (raw.length === 9) {
      out.innerHTML = '<div class="result"><div class="result-row"><span>Định dạng</span><strong>CMND 9 số (loại cũ)</strong></div>'
        + '<p class="muted">CMND 9 số không dùng cùng cấu trúc mã hóa như CCCD 12 số, nên công cụ này không giải mã được tỉnh, giới tính và năm sinh từ số CMND. Hãy nhập số CCCD 12 số (số định danh cá nhân) để giải mã.</p></div>';
      return;
    }
    if (raw.length !== 12) {
      markErr($('gmcc-num'), 'Ô Số CCCD chưa đúng — cần đúng 12 chữ số (bạn đã nhập ' + raw.length + ' số).');
      focusEl($('gmcc-num'));
      out.innerHTML = '';
      return;
    }
    const provCode = raw.slice(0, 3);
    const province = PROVINCES[provCode];
    if (!province) {
      markErr($('gmcc-num'), 'Mã tỉnh ' + provCode + ' (3 số đầu) không có trong bảng 63 tỉnh, thành — kiểm tra lại số CCCD.');
      focusEl($('gmcc-num'));
      out.innerHTML = '';
      return;
    }
    const centuryDigit = parseInt(raw.charAt(3), 10);
    const gender = centuryDigit % 2 === 0 ? 'Nam' : 'Nữ';
    const century = 19 + Math.floor(centuryDigit / 2);
    const year = century * 100 + parseInt(raw.slice(4, 6), 10);
    const seq = raw.slice(6);
    const thisYear = new Date().getFullYear();
    const age = thisYear - year;
    const futureNote = year > thisYear
      ? '<p class="error">Lưu ý: năm sinh ' + year + ' nằm trong tương lai so với năm nay (' + thisYear + ') — có thể bạn nhập sai số. Kiểm tra lại 3 số giữa của CCCD.</p>'
      : '';
    const copyText = 'CCCD ' + raw.slice(0, 3) + ' ' + raw.slice(3, 6) + ' ' + raw.slice(6)
      + ' — Khai sinh tại: ' + province + ' (mã ' + provCode + ') · Giới tính: ' + gender + ' · Năm sinh: ' + year;
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Nơi đăng ký khai sinh (mã ${provCode})</p>
    <div class="result-hero-value">${escHtml(province)}</div>
    <p class="result-hero-sub">${gender} · Sinh năm ${year}${year <= thisYear ? ' · ' + age + ' tuổi trong năm ' + thisYear : ''}</p>
  </div>
  <div class="result-row"><span>3 số đầu (${provCode})</span><strong>${escHtml(province)}</strong></div>
  <div class="result-row"><span>Số thứ 4 (${centuryDigit})</span><strong>${gender} · thế kỷ ${century + 1} (${century}xx)</strong></div>
  <div class="result-row"><span>2 số tiếp (${raw.slice(4, 6)})</span><strong>Năm sinh ${year}</strong></div>
  <div class="result-row"><span>6 số cuối (${seq})</span><strong>Dãy số ngẫu nhiên, không mang thông tin</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả giải mã CCCD">Chép kết quả</button></div>
</div>${futureNote}`;
    bindCopy(out);
  }

  function runCalc() { withBusy($('gmcc-calc'), decode); }
  $('gmcc-calc').addEventListener('click', runCalc);
  $('gmcc-num').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: 079200000001 = TP.HCM, nam, sinh năm 2000.
  $('gmcc-example').addEventListener('click', () => {
    fillEx(root, { 'gmcc-num': '079200000001' }, $('gmcc-calc'));
  });
}
