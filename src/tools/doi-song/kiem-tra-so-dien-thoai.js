// Kiểm tra số điện thoại Việt Nam — định dạng, đầu số, nhà mạng.
export const meta = {
  id: 'kiem-tra-so-dien-thoai',
  name: 'Kiểm tra số điện thoại: đầu số, nhà mạng',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập một số điện thoại để kiểm tra định dạng có đúng không, thuộc đầu số nào và nhà mạng nào (Viettel, Vinaphone, Mobifone, Vietnamobile…).',
  keywords: 'kiểm tra số điện thoại, đầu số viettel, đầu số vinaphone, đầu số mobifone, số điện thoại mạng nào, tra cứu đầu số',
  icon: '📱',
  seoTitle: 'Kiểm tra số điện thoại Việt Nam — Đầu số nào, mạng nào',
  seoDesc: 'Kiểm tra số điện thoại Việt Nam: định dạng đúng hay sai, đầu số nào, thuộc nhà mạng Viettel, Vinaphone, Mobifone hay mạng khác.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập số điện thoại (10 số, bắt đầu bằng 0 — hoặc dạng +84) để biết đầu số và nhà mạng phát hành.</p>
  </div>
  <div class="field">
    <label for="ktdt-num">Số điện thoại</label>
    <input id="ktdt-num" type="text" inputmode="tel" autocomplete="off" placeholder="Ví dụ: 0987654321 hoặc +84987654321">
    <p class="hint">Nhập cả số cố định (bắt đầu 02) để tra mã vùng. Số chỉ được xử lý trên trình duyệt của bạn.</p>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="ktdt-calc">Kiểm tra</button>
    <button type="button" class="btn btn-ghost" id="ktdt-example">Điền ví dụ</button>
  </div>
  <div id="ktdt-out"></div>
  <p class="note">Đầu số di động sau đợt chuyển đổi 11 số về 10 số (tháng 9/2018): Viettel 086, 096–098, 032–039; Vinaphone 088, 091, 094, 081–085; Mobifone 090, 093, 089, 070, 076–079; Vietnamobile 092, 052, 056, 058; Gmobile 099, 059; iTelecom 087; Wintel 055. Lưu ý: từ 2018 thuê bao được chuyển mạng giữ số, nên nhà mạng theo đầu số có thể khác nhà mạng thực tế nếu số đã chuyển mạng.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('ktdt-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Đầu số di động 3 chữ số -> nhà mạng (sau chuyển đổi 2018).
  const MOBILE = {};
  ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'].forEach(p => { MOBILE[p] = 'Viettel'; });
  ['088', '091', '094', '081', '082', '083', '084', '085'].forEach(p => { MOBILE[p] = 'Vinaphone'; });
  ['090', '093', '089', '070', '076', '077', '078', '079'].forEach(p => { MOBILE[p] = 'Mobifone'; });
  ['092', '052', '056', '058'].forEach(p => { MOBILE[p] = 'Vietnamobile'; });
  ['099', '059'].forEach(p => { MOBILE[p] = 'Gmobile'; });
  MOBILE['087'] = 'iTelecom';
  MOBILE['055'] = 'Wintel';
  // Mã vùng cố định chính (số bắt đầu 02).
  const AREAS = {
    '024': 'Hà Nội', '028': 'TP. Hồ Chí Minh', '0236': 'Đà Nẵng', '0225': 'Hải Phòng',
    '0292': 'Cần Thơ', '0234': 'Thừa Thiên Huế', '0251': 'Đồng Nai', '0274': 'Bình Dương',
    '0204': 'Bắc Giang', '0210': 'Phú Thọ', '0211': 'Vĩnh Phúc', '0222': 'Bắc Ninh',
    '0220': 'Hải Dương', '0221': 'Hưng Yên', '0227': 'Thái Bình', '0228': 'Nam Định',
    '0229': 'Ninh Bình', '0237': 'Thanh Hóa', '0238': 'Nghệ An', '0239': 'Hà Tĩnh',
    '0232': 'Quảng Bình', '0233': 'Quảng Trị', '0235': 'Quảng Nam', '0255': 'Quảng Ngãi',
    '0256': 'Bình Định', '0257': 'Phú Yên', '0258': 'Khánh Hòa', '0259': 'Ninh Thuận',
    '0252': 'Bình Thuận', '0260': 'Kon Tum', '0269': 'Gia Lai', '0262': 'Đắk Lắk',
    '0261': 'Đắk Nông', '0263': 'Lâm Đồng', '0271': 'Bình Phước', '0276': 'Tây Ninh',
    '0272': 'Long An', '0273': 'Tiền Giang', '0275': 'Bến Tre', '0294': 'Trà Vinh',
    '0270': 'Vĩnh Long', '0277': 'Đồng Tháp', '0296': 'An Giang', '0297': 'Kiên Giang',
    '0290': 'Cà Mau', '0291': 'Sóc Trăng', '0299': 'Bạc Liêu', '0293': 'Hậu Giang',
    '0203': 'Quảng Ninh', '0205': 'Cao Bằng', '0206': 'Lạng Sơn', '0207': 'Bắc Kạn',
    '0208': 'Tuyên Quang', '0213': 'Lai Châu', '0214': 'Lào Cai', '0215': 'Điện Biên',
    '0212': 'Sơn La', '0216': 'Yên Bái', '0218': 'Hòa Bình', '0209': 'Thái Nguyên',
    '0219': 'Hà Giang', '0226': 'Hà Nam', '0254': 'Bà Rịa – Vũng Tàu'
  };

  function check() {
    clearErrs(root);
    const out = $('ktdt-out');
    let raw = $('ktdt-num').value.trim().replace(/[\s.()-]/g, '');
    if (raw.charAt(0) === '+') raw = raw.slice(1);
    if (/^84/.test(raw) && raw.length >= 11) raw = '0' + raw.slice(2);
    if (!/^\d+$/.test(raw)) {
      markErr($('ktdt-num'), 'Ô Số điện thoại chưa đúng — chỉ nhập chữ số (có thể bắt đầu bằng +84), không nhập chữ cái.');
      focusEl($('ktdt-num'));
      out.innerHTML = '';
      return;
    }
    // Tổng đài 1800 (miễn phí) / 1900 (tính phí).
    if (/^(1800|1900)\d{4,6}$/.test(raw)) {
      const kind = raw.indexOf('1800') === 0 ? 'Tổng đài miễn phí (1800)' : 'Tổng đài tính phí (1900)';
      out.innerHTML = '<div class="result"><div class="result-hero"><p class="result-hero-label">Loại số</p>'
        + '<div class="result-hero-value">' + escHtml(kind) + '</div><p class="result-hero-sub">Số ' + escHtml(raw) + ' · ' + raw.length + ' chữ số</p></div>'
        + '<div class="result-row"><span>Đầu số</span><strong>' + raw.slice(0, 4) + '</strong></div>'
        + '<div class="result-row"><span>Định dạng</span><strong>Hợp lệ — số tổng đài doanh nghiệp, không gắn nhà mạng di động</strong></div></div>';
      return;
    }
    if (raw.charAt(0) !== '0') {
      markErr($('ktdt-num'), 'Ô Số điện thoại chưa đúng — số Việt Nam bắt đầu bằng 0 (hoặc +84).');
      focusEl($('ktdt-num'));
      out.innerHTML = '';
      return;
    }
    // Số cố định: bắt đầu 02.
    if (raw.slice(0, 2) === '02') {
      const area4 = AREAS[raw.slice(0, 4)];
      const area3 = AREAS[raw.slice(0, 3)];
      const area = area4 || area3 || null;
      const code = area4 ? raw.slice(0, 4) : raw.slice(0, 3);
      const okLen = raw.length === 10 || raw.length === 11;
      out.innerHTML = '<div class="result"><div class="result-hero"><p class="result-hero-label">Loại số</p>'
        + '<div class="result-hero-value">Số cố định' + (area ? ' — ' + escHtml(area) : '') + '</div>'
        + '<p class="result-hero-sub">Số ' + escHtml(raw) + ' · ' + raw.length + ' chữ số</p></div>'
        + '<div class="result-row"><span>Mã vùng</span><strong>' + code + (area ? ' (' + escHtml(area) + ')' : ' (chưa có trong bảng mã vùng)') + '</strong></div>'
        + '<div class="result-row"><span>Định dạng</span><strong>' + (okLen ? 'Hợp lệ — số cố định thường có 10–11 chữ số' : 'Độ dài bất thường — số cố định thường có 10–11 chữ số, số này có ' + raw.length + ' số') + '</strong></div></div>';
      return;
    }
    // Di động: phải 10 số.
    if (raw.length !== 10) {
      markErr($('ktdt-num'), 'Ô Số điện thoại chưa đúng — số di động Việt Nam có đúng 10 chữ số (số này có ' + raw.length + ' số). Số 11 số cũ đã chuyển về 10 số từ 2018.');
      focusEl($('ktdt-num'));
      out.innerHTML = '';
      return;
    }
    const prefix = raw.slice(0, 3);
    const carrier = MOBILE[prefix];
    if (!carrier) {
      out.innerHTML = '<div class="result"><div class="result-row"><span>Số điện thoại</span><strong>' + escHtml(raw) + '</strong></div>'
        + '<div class="result-row"><span>Đầu số</span><strong>' + prefix + '</strong></div>'
        + '<p class="error">Đầu số ' + prefix + ' không nằm trong bảng đầu số di động đang lưu hành — kiểm tra lại số. Có thể số này thuộc đầu số mới chưa cập nhật, hoặc bạn nhập sai.</p></div>';
      return;
    }
    const copyText = 'Số ' + raw + ' — Đầu số ' + prefix + ' · Nhà mạng: ' + carrier + ' · Số di động 10 số hợp lệ.';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Nhà mạng (theo đầu số ${prefix})</p>
    <div class="result-hero-value">${escHtml(carrier)}</div>
    <p class="result-hero-sub">Số ${escHtml(raw)} · Di động 10 số · Định dạng hợp lệ</p>
  </div>
  <div class="result-row"><span>Đầu số</span><strong>${prefix}</strong></div>
  <div class="result-row"><span>Loại thuê bao</span><strong>Di động</strong></div>
  <div class="result-row"><span>Dạng quốc tế</span><strong>+84${raw.slice(1)}</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả kiểm tra số">Chép kết quả</button></div>
</div>
<p class="note">Nhà mạng trên là nhà mạng phát hành đầu số. Nếu thuê bao đã chuyển mạng giữ số, nhà mạng thực tế có thể khác.</p>`;
    bindCopy(out);
  }

  function runCalc() { withBusy($('ktdt-calc'), check); }
  $('ktdt-calc').addEventListener('click', runCalc);
  $('ktdt-num').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: 0987654321 — đầu số 098, Viettel.
  $('ktdt-example').addEventListener('click', () => {
    fillEx(root, { 'ktdt-num': '0987654321' }, $('ktdt-calc'));
  });
}
