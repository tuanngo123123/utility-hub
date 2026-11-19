// Tra cứu biển số xe — 2 số đầu thuộc tỉnh/thành nào (và ngược lại).
export const meta = {
  id: 'tra-cuu-bien-so-xe',
  name: 'Tra cứu biển số xe các tỉnh thành',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập biển số xe để biết xe đăng ký ở tỉnh/thành nào, hoặc chọn tỉnh để xem ký hiệu biển số của tỉnh đó — theo bảng ký hiệu 63 tỉnh cũ (vẫn đang áp dụng).',
  keywords: 'tra cứu biển số xe, biển số xe các tỉnh, 59 ở đâu, 29 ở đâu, ký hiệu biển số, biển số 51 tỉnh nào',
  icon: '🚗',
  seoTitle: 'Tra cứu biển số xe — 2 số đầu thuộc tỉnh nào',
  seoDesc: 'Biển số 59, 29, 43 ở đâu? Tra cứu ký hiệu biển số xe của 63 tỉnh thành cũ (ký hiệu biển số vẫn đang dùng), hoặc chọn tỉnh để xem mã biển số.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="tbs-tab-plate">Tra theo biển số</button>
      <button type="button" class="tab" id="tbs-tab-prov">Tra theo tỉnh</button>
    </div>
  </div>

  <div id="tbs-pane-plate">
    <div class="field">
      <label for="tbs-plate">Biển số xe</label>
      <input id="tbs-plate" type="text" autocomplete="off" placeholder="Ví dụ: 59A-12345 hoặc chỉ nhập 59" maxlength="12">
      <p class="hint">Chỉ cần 2 số đầu là đủ — phần còn lại là ký tự series và số thứ tự đăng ký.</p>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="tbs-calc">Tra cứu</button>
      <button type="button" class="btn btn-ghost" id="tbs-example">Điền ví dụ</button>
    </div>
    <div id="tbs-out"></div>
  </div>

  <div id="tbs-pane-prov" style="display:none">
    <div class="field">
      <label for="tbs-prov">Chọn tỉnh / thành phố</label>
      <select id="tbs-prov"></select>
    </div>
    <div id="tbs-prov-out"></div>
  </div>
  <p class="note">Ký hiệu địa phương theo Phụ lục 02, Thông tư 24/2023/TT-BCA (giữ nguyên trong Thông tư 79/2024/TT-BCA). Từ 15/8/2023 biển số định danh theo chủ xe, nhưng 2 số đầu vẫn cho biết nơi đăng ký. Không có địa phương nào mang số 13. Công cụ chỉ tra địa phương đăng ký, không tra thông tin chủ xe hay phương tiện.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tbs-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Ký hiệu 2 số -> tỉnh/thành (Phụ lục 02, Thông tư 24/2023/TT-BCA).
  const CODES = {
    '11': 'Cao Bằng', '12': 'Lạng Sơn', '14': 'Quảng Ninh', '15': 'Hải Phòng', '16': 'Hải Phòng',
    '17': 'Thái Bình', '18': 'Nam Định', '19': 'Phú Thọ', '20': 'Thái Nguyên', '21': 'Yên Bái',
    '22': 'Tuyên Quang', '23': 'Hà Giang', '24': 'Lào Cai', '25': 'Lai Châu', '26': 'Sơn La',
    '27': 'Điện Biên', '28': 'Hòa Bình', '29': 'Hà Nội', '30': 'Hà Nội', '31': 'Hà Nội',
    '32': 'Hà Nội', '33': 'Hà Nội', '34': 'Hải Dương', '35': 'Ninh Bình', '36': 'Thanh Hóa',
    '37': 'Nghệ An', '38': 'Hà Tĩnh', '39': 'Đồng Nai', '40': 'Hà Nội', '41': 'TP. Hồ Chí Minh',
    '43': 'Đà Nẵng', '47': 'Đắk Lắk', '48': 'Đắk Nông', '49': 'Lâm Đồng', '50': 'TP. Hồ Chí Minh',
    '51': 'TP. Hồ Chí Minh', '52': 'TP. Hồ Chí Minh', '53': 'TP. Hồ Chí Minh', '54': 'TP. Hồ Chí Minh',
    '55': 'TP. Hồ Chí Minh', '56': 'TP. Hồ Chí Minh', '57': 'TP. Hồ Chí Minh', '58': 'TP. Hồ Chí Minh',
    '59': 'TP. Hồ Chí Minh', '60': 'Đồng Nai', '61': 'Bình Dương', '62': 'Long An', '63': 'Tiền Giang',
    '64': 'Vĩnh Long', '65': 'Cần Thơ', '66': 'Đồng Tháp', '67': 'An Giang', '68': 'Kiên Giang',
    '69': 'Cà Mau', '70': 'Tây Ninh', '71': 'Bến Tre', '72': 'Bà Rịa – Vũng Tàu', '73': 'Quảng Bình',
    '74': 'Quảng Trị', '75': 'Thừa Thiên Huế', '76': 'Quảng Ngãi', '77': 'Bình Định', '78': 'Phú Yên',
    '79': 'Khánh Hòa', '80': 'Cơ quan Trung ương', '81': 'Gia Lai', '82': 'Kon Tum', '83': 'Sóc Trăng',
    '84': 'Trà Vinh', '85': 'Ninh Thuận', '86': 'Bình Thuận', '88': 'Vĩnh Phúc', '89': 'Hưng Yên',
    '90': 'Hà Nam', '92': 'Quảng Nam', '93': 'Bình Phước', '94': 'Bạc Liêu', '95': 'Hậu Giang',
    '97': 'Bắc Kạn', '98': 'Bắc Giang', '99': 'Bắc Ninh'
  };
  // Tỉnh -> tất cả ký hiệu của tỉnh đó.
  const BY_PROVINCE = {};
  Object.keys(CODES).forEach(c => {
    const p = CODES[c];
    if (!BY_PROVINCE[p]) BY_PROVINCE[p] = [];
    BY_PROVINCE[p].push(c);
  });
  const PROVINCE_LIST = Object.keys(BY_PROVINCE).sort((a, b) => a.localeCompare(b, 'vi'));

  ['plate', 'prov'].forEach(k => {
    $('tbs-tab-' + k).addEventListener('click', () => {
      ['plate', 'prov'].forEach(j => {
        $('tbs-tab-' + j).classList.toggle('tab-active', j === k);
        $('tbs-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });

  function lookupPlate() {
    clearErrs(root);
    const out = $('tbs-out');
    const raw = $('tbs-plate').value.trim().toUpperCase().replace(/[\s.-]/g, '');
    if (!raw) {
      markErr($('tbs-plate'), 'Ô Biển số xe chưa đúng — nhập biển số, ví dụ 59A-12345 hoặc chỉ nhập 59.');
      focusEl($('tbs-plate'));
      out.innerHTML = '';
      return;
    }
    if (!/^\d{2}/.test(raw)) {
      markErr($('tbs-plate'), 'Ô Biển số xe chưa đúng — biển số bắt đầu bằng 2 chữ số ký hiệu địa phương (ví dụ 59, 29, 43).');
      focusEl($('tbs-plate'));
      out.innerHTML = '';
      return;
    }
    const code = raw.slice(0, 2);
    const prov = CODES[code];
    if (!prov) {
      out.innerHTML = '<div class="result"><div class="result-row"><span>Ký hiệu</span><strong>' + code + '</strong></div>'
        + '<p class="error">Mã ' + code + ' không gắn với tỉnh/thành nào trong bảng ký hiệu hiện hành'
        + (code === '13' ? ' — theo quy định, không có địa phương nào mang số 13.' : '.')
        + ' Kiểm tra lại biển số bạn nhập.</p></div>';
      return;
    }
    const siblings = BY_PROVINCE[prov].filter(c => c !== code);
    const sibNote = siblings.length
      ? '<div class="result-row"><span>Cùng địa phương</span><strong>' + escHtml(prov) + ' còn dùng ký hiệu: ' + siblings.join(', ') + '</strong></div>'
      : '';
    const centralNote = code === '80'
      ? '<p class="muted">Biển 80 cấp cho xe của các cơ quan, đơn vị thuộc Trung ương (bộ, ngành, Văn phòng Chủ tịch nước, Quốc hội, Chính phủ…), không phải biển của một tỉnh.</p>'
      : '';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Biển số ${escHtml(raw)} — đăng ký tại</p>
    <div class="result-hero-value">${escHtml(prov)}</div>
    <p class="result-hero-sub">Ký hiệu địa phương: ${code}</p>
  </div>
  ${sibNote}
</div>${centralNote}`;
  }

  function lookupProvince() {
    const prov = $('tbs-prov').value;
    const codes = BY_PROVINCE[prov] || [];
    $('tbs-prov-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Ký hiệu biển số của ${escHtml(prov)}</p>
    <div class="result-hero-value">${codes.join(', ')}</div>
    <p class="result-hero-sub">${codes.length > 1 ? codes.length + ' ký hiệu' : '1 ký hiệu duy nhất'}</p>
  </div>
</div>`;
  }

  // Đổ danh sách tỉnh vào select.
  $('tbs-prov').innerHTML = PROVINCE_LIST.map(p => '<option value="' + escHtml(p) + '">' + escHtml(p) + '</option>').join('');
  $('tbs-prov').value = 'TP. Hồ Chí Minh';
  $('tbs-prov').addEventListener('change', lookupProvince);
  lookupProvince();

  function runCalc() { withBusy($('tbs-calc'), lookupPlate); }
  $('tbs-calc').addEventListener('click', runCalc);
  $('tbs-plate').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: 59A-12345 — TP. Hồ Chí Minh.
  $('tbs-example').addEventListener('click', () => {
    fillEx(root, { 'tbs-plate': '59A-12345' }, $('tbs-calc'));
  });
}
