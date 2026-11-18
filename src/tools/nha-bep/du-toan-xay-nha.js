// Dự toán chi phí xây nhà — diện tích xây dựng × đơn giá theo mức hoàn thiện.
export const meta = {
  id: 'du-toan-xay-nha',
  name: 'Dự toán chi phí xây nhà',
  category: 'Nhà bếp',
  categorySlug: 'nha-bep',
  desc: 'Nhập diện tích, số tầng, loại móng và mái để ước tính diện tích xây dựng và tổng chi phí xây nhà theo từng mức hoàn thiện — xây thô hay trọn gói.',
  keywords: 'dự toán xây nhà, chi phí xây nhà, xây nhà hết bao nhiêu tiền, đơn giá xây dựng m2, xây nhà trọn gói bao nhiêu',
  icon: '🏠',
  seoTitle: 'Dự toán chi phí xây nhà — Tính theo m², số tầng, loại móng mái',
  seoDesc: 'Ước tính chi phí xây nhà: diện tích xây dựng (sàn + móng + mái) nhân đơn giá xây thô hoặc trọn gói theo mức hoàn thiện. Tính ngay, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Diện tích xây dựng tính theo cách nhà thầu thường tính: sàn các tầng + móng + mái (hệ số riêng từng loại). Nhân với đơn giá để ra khoảng chi phí.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="dtxn-area">Diện tích sàn 1 tầng (m²)</label>
      <input id="dtxn-area" type="text" inputmode="decimal" value="80" placeholder="VD: 80">
      <p class="hint">Nhà phố 5×16m = 80m²/tầng.</p>
    </div>
    <div class="field">
      <label for="dtxn-floors">Số tầng (kể cả trệt)</label>
      <input id="dtxn-floors" type="number" min="1" max="10" step="1" value="3">
    </div>
    <div class="field">
      <label for="dtxn-foundation">Loại móng</label>
      <select id="dtxn-foundation">
        <option value="0.3">Móng đơn — tính 30% diện tích tầng 1</option>
        <option value="0.5" selected>Móng băng — tính 50% diện tích tầng 1</option>
        <option value="0.4">Móng cọc — tính 40% diện tích tầng 1</option>
      </select>
    </div>
    <div class="field">
      <label for="dtxn-roof">Loại mái</label>
      <select id="dtxn-roof">
        <option value="0.3">Mái tôn — tính 30% diện tích mái</option>
        <option value="0.5" selected>Mái bằng bê tông — tính 50% diện tích mái</option>
        <option value="0.5">Mái ngói — tính 50% diện tích mái</option>
        <option value="0.7">Mái ngói kèo thép — tính 70% diện tích mái</option>
      </select>
    </div>
    <div class="field">
      <label for="dtxn-level">Mức hoàn thiện</label>
      <select id="dtxn-level">
        <option value="tho">Xây thô + nhân công hoàn thiện</option>
        <option value="coban">Trọn gói cơ bản</option>
        <option value="kha" selected>Trọn gói khá</option>
        <option value="caocap">Trọn gói cao cấp</option>
      </select>
    </div>
    <div class="field">
      <label for="dtxn-region">Khu vực xây dựng</label>
      <select id="dtxn-region">
        <option value="1">TP.HCM / Hà Nội (giá chuẩn)</option>
        <option value="0.9">Thành phố khác (rẻ hơn ~10%)</option>
        <option value="0.85">Nông thôn (rẻ hơn ~15%)</option>
      </select>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="dtxn-calc">Tính dự toán</button>
    <button type="button" class="btn btn-ghost" id="dtxn-example">Điền ví dụ</button>
  </div>
  <div id="dtxn-out"></div>
  <p class="note">Đơn giá tham khảo thị trường 2025–2026 (đồng/m² diện tích xây dựng): xây thô + nhân công hoàn thiện 3,5–4,5 triệu; trọn gói cơ bản 5,5–6,5 triệu; trọn gói khá 6,5–8 triệu; cao cấp 8–12 triệu. Dự toán chưa gồm nội thất, sân vườn, hàng rào, giấy phép xây dựng và chi phí phát sinh nền đất yếu. Đây là con số ước lượng để chuẩn bị ngân sách — báo giá chính xác cần nhà thầu khảo sát thực tế.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => n.toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('dtxn-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  // Đơn giá triệu đồng/m² (thấp – cao) theo mức hoàn thiện.
  const RATES = {
    tho: { label: 'Xây thô + nhân công hoàn thiện', low: 3.5, high: 4.5 },
    coban: { label: 'Trọn gói cơ bản', low: 5.5, high: 6.5 },
    kha: { label: 'Trọn gói khá', low: 6.5, high: 8 },
    caocap: { label: 'Trọn gói cao cấp', low: 8, high: 12 }
  };

  function fmtMoney(n) {
    // Tiền lớn: hiển thị dạng "2,08 tỷ" cho gọn, kèm số đầy đủ.
    if (n >= 1000000000) {
      const ty = n / 1000000000;
      return (Math.round(ty * 100) / 100).toLocaleString('vi-VN') + ' tỷ';
    }
    return fmtVND(n);
  }

  function calc() {
    clearErrs(root);
    const out = $('dtxn-out');
    const area = parseNum($('dtxn-area').value);
    if (!(area > 0) || area > 10000) {
      markErr($('dtxn-area'), 'Ô Diện tích sàn 1 tầng chưa đúng — nhập số m² lớn hơn 0, ví dụ 80.');
      focusEl($('dtxn-area'));
      out.innerHTML = '';
      return;
    }
    const floors = Math.round(parseNum($('dtxn-floors').value));
    if (isNaN(floors) || floors < 1 || floors > 10) {
      markErr($('dtxn-floors'), 'Ô Số tầng chưa đúng — nhập số tầng từ 1 đến 10, ví dụ 3.');
      focusEl($('dtxn-floors'));
      out.innerHTML = '';
      return;
    }
    const fFound = parseFloat($('dtxn-foundation').value);
    const fRoof = parseFloat($('dtxn-roof').value);
    const region = parseFloat($('dtxn-region').value);
    const rate = RATES[$('dtxn-level').value];
    const floorArea = area * floors;
    const foundArea = area * fFound;
    const roofArea = area * fRoof;
    const totalArea = floorArea + foundArea + roofArea;
    const low = totalArea * rate.low * 1000000 * region;
    const high = totalArea * rate.high * 1000000 * region;
    const mid = (low + high) / 2;
    // Chia giai đoạn tham khảo: móng 15%, phần thô 45%, hoàn thiện 40%.
    const stageFound = mid * 0.15;
    const stageRough = mid * 0.45;
    const stageFinish = mid * 0.40;
    const copyText = 'Dự toán xây nhà: ' + fmtNum(area) + ' m²/tầng × ' + floors + ' tầng · Diện tích xây dựng ' + fmtNum(Math.round(totalArea * 10) / 10) + ' m² · ' + rate.label + ' · Khoảng ' + fmtMoney(low) + ' – ' + fmtMoney(high) + ' (giữa khoảng: ' + fmtMoney(mid) + ').';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Tổng chi phí ước tính (${rate.label})</p>
    <div class="result-hero-value">${fmtMoney(low)} – ${fmtMoney(high)}</div>
    <p class="result-hero-sub">Diện tích xây dựng ${fmtNum(Math.round(totalArea * 10) / 10)} m² · Giữa khoảng: ${fmtMoney(mid)}</p>
  </div>
  <div class="result-row"><span>Diện tích sàn (${fmtNum(area)} m² × ${floors} tầng)</span><strong>${fmtNum(floorArea)} m²</strong></div>
  <div class="result-row"><span>Diện tích móng (${Math.round(fFound * 100)}% tầng 1)</span><strong>${fmtNum(Math.round(foundArea * 10) / 10)} m²</strong></div>
  <div class="result-row"><span>Diện tích mái (${Math.round(fRoof * 100)}% diện tích mái)</span><strong>${fmtNum(Math.round(roofArea * 10) / 10)} m²</strong></div>
  <div class="result-row"><span>Đơn giá tham khảo</span><strong>${rate.low.toLocaleString('vi-VN')} – ${rate.high.toLocaleString('vi-VN')} triệu/m²</strong></div>
  <div class="result-row"><span>Chia giai đoạn (theo giữa khoảng)</span><strong>Móng ${fmtMoney(stageFound)} · Phần thô ${fmtMoney(stageRough)} · Hoàn thiện ${fmtMoney(stageFinish)}</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép dự toán xây nhà">Chép kết quả</button></div>
</div>`;
    bindCopy(out);
  }

  function runCalc() { withBusy($('dtxn-calc'), calc); }
  $('dtxn-calc').addEventListener('click', runCalc);
  ['dtxn-area', 'dtxn-floors'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  });
  // Ví dụ: nhà phố 80m²/tầng × 3 tầng, móng băng, mái bằng, trọn gói khá.
  $('dtxn-example').addEventListener('click', () => {
    fillEx(root, { 'dtxn-area': '80', 'dtxn-floors': '3', 'dtxn-foundation': '0.5', 'dtxn-roof': '0.5', 'dtxn-level': 'kha', 'dtxn-region': '1' }, $('dtxn-calc'));
  });
  calc();
}
