// Dự toán chi phí đám cưới — tiệc, chụp ảnh, váy cưới, trang trí + tiền mừng ước tính.
export const meta = {
  id: 'du-toan-dam-cuoi',
  name: 'Dự toán chi phí đám cưới',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập số khách, giá bàn tiệc và các khoản chụp ảnh, váy cưới, trang trí để ước tính tổng chi phí đám cưới, chi phí mỗi khách và tiền mừng thu về.',
  keywords: 'dự toán đám cưới, chi phí đám cưới, cưới hết bao nhiêu tiền, giá bàn tiệc cưới, tiền mừng cưới',
  icon: '💒',
  seoTitle: 'Dự toán chi phí đám cưới — Tiệc, chụp ảnh, váy cưới hết bao nhiêu',
  seoDesc: 'Ước tính tổng chi phí đám cưới từ số khách, giá bàn tiệc, chụp ảnh, váy cưới, trang trí; so với tiền mừng ước tính để biết cần chuẩn bị bao nhiêu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập các khoản chi chính của đám cưới để biết tổng ngân sách cần chuẩn bị — và tiền mừng ước tính bù được bao nhiêu.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="dtdc-guests">Số khách mời</label>
      <input id="dtdc-guests" type="text" inputmode="numeric" value="300" placeholder="Ví dụ: 300">
    </div>
    <div class="field">
      <label for="dtdc-tables">Số bàn tiệc</label>
      <input id="dtdc-tables" type="text" inputmode="numeric" value="30" placeholder="Ví dụ: 30">
      <p class="hint">Thường 10 khách/bàn. Để trống sẽ tự tính từ số khách.</p>
    </div>
    <div class="field">
      <label for="dtdc-table-price">Giá mỗi bàn tiệc</label>
      <span class="input-unit"><input id="dtdc-table-price" type="text" inputmode="decimal" value="5.000.000" placeholder="Ví dụ: 5.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="dtdc-photo">Chụp ảnh + quay phim</label>
      <span class="input-unit"><input id="dtdc-photo" type="text" inputmode="decimal" value="15.000.000" placeholder="Ví dụ: 15.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="dtdc-dress">Váy cưới + trang điểm</label>
      <span class="input-unit"><input id="dtdc-dress" type="text" inputmode="decimal" value="10.000.000" placeholder="Ví dụ: 10.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="dtdc-decor">Hoa + trang trí + âm thanh</label>
      <span class="input-unit"><input id="dtdc-decor" type="text" inputmode="decimal" value="20.000.000" placeholder="Ví dụ: 20.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="dtdc-invite">Thiệp mời + khác</label>
      <span class="input-unit"><input id="dtdc-invite" type="text" inputmode="decimal" value="5.000.000" placeholder="Ví dụ: 5.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="dtdc-gift">Tiền mừng trung bình mỗi khách (ước tính)</label>
      <span class="input-unit"><input id="dtdc-gift" type="text" inputmode="decimal" value="500.000" placeholder="Ví dụ: 500.000"><span class="unit">₫</span></span>
      <p class="hint">Để 0 nếu không muốn tính tiền mừng.</p>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="dtdc-calc">Tính dự toán</button>
    <button type="button" class="btn btn-ghost" id="dtdc-example">Điền ví dụ</button>
  </div>
  <div id="dtdc-out"></div>
  <p class="note">Giá bàn tiệc tham khảo: nhà hàng tỉnh 3–5 triệu/bàn, TP.HCM/Hà Nội 5–10 triệu/bàn. Tiền mừng chỉ là ước tính — thực tế tùy khách mời. Dự toán chưa gồm lễ ăn hỏi, nhẫn cưới, trăng mật.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => n.toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('dtdc-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  function moneyField(id, label) {
    const v = parseNum($(id).value);
    if (isNaN(v) || v < 0) {
      markErr($(id), 'Ô ' + label + ' chưa đúng — nhập số tiền từ 0 trở lên, ví dụ 5.000.000.');
      focusEl($(id));
      return null;
    }
    return v;
  }

  function calc() {
    clearErrs(root);
    const out = $('dtdc-out');
    const guests = Math.round(parseNum($('dtdc-guests').value));
    if (!($('dtdc-guests').value.trim()) || isNaN(guests) || guests < 10) {
      markErr($('dtdc-guests'), 'Ô Số khách mời chưa đúng — nhập số khách từ 10 trở lên, ví dụ 300.');
      focusEl($('dtdc-guests'));
      out.innerHTML = '';
      return;
    }
    let tables;
    const tablesRaw = $('dtdc-tables').value.trim();
    if (!tablesRaw) {
      tables = Math.ceil(guests / 10);
    } else {
      tables = Math.round(parseNum(tablesRaw));
      if (isNaN(tables) || tables < 1) {
        markErr($('dtdc-tables'), 'Ô Số bàn tiệc chưa đúng — nhập số bàn từ 1 trở lên, hoặc để trống để tự tính (10 khách/bàn).');
        focusEl($('dtdc-tables'));
        out.innerHTML = '';
        return;
      }
    }
    const tablePrice = moneyField('dtdc-table-price', 'Giá mỗi bàn tiệc');
    if (tablePrice === null) { out.innerHTML = ''; return; }
    const photo = moneyField('dtdc-photo', 'Chụp ảnh + quay phim');
    if (photo === null) { out.innerHTML = ''; return; }
    const dress = moneyField('dtdc-dress', 'Váy cưới + trang điểm');
    if (dress === null) { out.innerHTML = ''; return; }
    const decor = moneyField('dtdc-decor', 'Hoa + trang trí + âm thanh');
    if (decor === null) { out.innerHTML = ''; return; }
    const invite = moneyField('dtdc-invite', 'Thiệp mời + khác');
    if (invite === null) { out.innerHTML = ''; return; }
    const giftEach = moneyField('dtdc-gift', 'Tiền mừng trung bình mỗi khách');
    if (giftEach === null) { out.innerHTML = ''; return; }

    const banquet = tables * tablePrice;
    const total = banquet + photo + dress + decor + invite;
    const perGuest = total / guests;
    const giftTotal = guests * giftEach;
    const gap = total - giftTotal;
    const gapRow = giftEach > 0
      ? '<div class="result-row"><span>Tiền mừng ước tính (' + fmtNum(guests) + ' khách × ' + fmtVND(giftEach) + ')</span><strong>' + fmtVND(giftTotal) + '</strong></div>'
        + '<div class="result-row"><span>' + (gap > 0 ? 'Cần chuẩn bị thêm' : gap < 0 ? 'Tiền mừng dư ra' : 'Vừa đủ') + '</span><strong>' + fmtVND(Math.abs(gap)) + '</strong></div>'
      : '';
    const copyText = 'Dự toán đám cưới: ' + fmtNum(guests) + ' khách · ' + fmtNum(tables) + ' bàn × ' + fmtVND(tablePrice)
      + ' · Tiệc: ' + fmtVND(banquet) + ' · Chụp ảnh: ' + fmtVND(photo) + ' · Váy + trang điểm: ' + fmtVND(dress)
      + ' · Trang trí: ' + fmtVND(decor) + ' · Thiệp + khác: ' + fmtVND(invite)
      + ' · TỔNG: ' + fmtVND(total) + ' (' + fmtVND(perGuest) + '/khách)'
      + (giftEach > 0 ? ' · Tiền mừng ước tính: ' + fmtVND(giftTotal) : '');
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Tổng chi phí dự toán</p>
    <div class="result-hero-value">${fmtVND(total)}</div>
    <p class="result-hero-sub">${fmtNum(guests)} khách · ${fmtNum(tables)} bàn · ${fmtVND(perGuest)}/khách</p>
  </div>
  <div class="result-row"><span>Tiệc cưới (${fmtNum(tables)} bàn × ${fmtVND(tablePrice)})</span><strong>${fmtVND(banquet)}</strong></div>
  <div class="result-row"><span>Chụp ảnh + quay phim</span><strong>${fmtVND(photo)}</strong></div>
  <div class="result-row"><span>Váy cưới + trang điểm</span><strong>${fmtVND(dress)}</strong></div>
  <div class="result-row"><span>Hoa + trang trí + âm thanh</span><strong>${fmtVND(decor)}</strong></div>
  <div class="result-row"><span>Thiệp mời + khác</span><strong>${fmtVND(invite)}</strong></div>
  ${gapRow}
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép dự toán đám cưới">Chép kết quả</button></div>
</div>`;
    bindCopy(out);
  }

  function runCalc() { withBusy($('dtdc-calc'), calc); }
  $('dtdc-calc').addEventListener('click', runCalc);
  ['dtdc-guests', 'dtdc-tables', 'dtdc-table-price', 'dtdc-photo', 'dtdc-dress', 'dtdc-decor', 'dtdc-invite', 'dtdc-gift'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  });
  // Ví dụ: 300 khách, 30 bàn × 5 triệu, chụp 15tr, váy 10tr, trang trí 20tr, thiệp 5tr, mừng 500k/khách.
  $('dtdc-example').addEventListener('click', () => {
    fillEx(root, { 'dtdc-guests': '300', 'dtdc-tables': '30', 'dtdc-table-price': '5.000.000', 'dtdc-photo': '15.000.000', 'dtdc-dress': '10.000.000', 'dtdc-decor': '20.000.000', 'dtdc-invite': '5.000.000', 'dtdc-gift': '500.000' }, $('dtdc-calc'));
  });
  calc();
}
