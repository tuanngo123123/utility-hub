// Lệ phí môn bài — mức thu năm 2025 (năm cuối cùng phải nộp) theo NĐ 139/2016
// (sửa đổi NĐ 22/2020). Từ 01/01/2026 lệ phí môn bài đã bị bãi bỏ hoàn toàn
// (NQ 198/2025/QH15; NĐ 362/2025/NĐ-CP; Công văn 645/CT-CS của Cục Thuế).
export const meta = {
  id: 'le-phi-mon-bai',
  name: 'Lệ phí môn bài: đã bãi bỏ từ 2026 + tra mức cũ',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Từ 01/01/2026 lệ phí môn bài đã bãi bỏ hoàn toàn (0₫, không phải khai). Công cụ này tra mức cũ năm 2025 theo vốn điều lệ (doanh nghiệp) hoặc doanh thu (hộ kinh doanh).',
  keywords: 'lệ phí môn bài, thuế môn bài 2025, môn bài doanh nghiệp, môn bài hộ kinh doanh, bãi bỏ lệ phí môn bài 2026',
  icon: '🏛️',
  seoTitle: 'Lệ phí môn bài: đã bãi bỏ từ 2026 + tra mức cũ 2025',
  seoDesc: 'Từ 01/01/2026 lệ phí môn bài đã bãi bỏ hoàn toàn (0₫, không phải khai). Tra mức cũ năm 2025: doanh nghiệp 2–3 triệu/năm, hộ kinh doanh 300 nghìn–1 triệu/năm.',
};

export function body() {
  return `
<div class="tool-panel">
  <p class="note"><strong>Lưu ý quan trọng:</strong> từ ngày 01/01/2026, lệ phí môn bài đã được <strong>bãi bỏ hoàn toàn</strong> — người nộp thuế không phải nộp lệ phí môn bài cho năm 2026 và các năm tiếp theo, cũng không phải nộp tờ khai (NQ 198/2025/QH15; NĐ 362/2025/NĐ-CP; Công văn hỏa tốc 645/CT-CS của Cục Thuế). Công cụ này tính mức lệ phí của <strong>năm 2025</strong> (năm cuối cùng phải nộp, hạn nộp trước 30/01/2026).</p>
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="lpmb-tab-dn">Doanh nghiệp / tổ chức</button>
      <button type="button" class="tab" id="lpmb-tab-hkd">Hộ kinh doanh / cá nhân</button>
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="lpmb-year">Năm tính lệ phí</label>
      <select id="lpmb-year">
        <option value="2025">2025 — năm cuối cùng phải nộp</option>
        <option value="2026">2026 trở đi — đã bãi bỏ</option>
      </select>
    </div>
    <div class="field" id="lpmb-kind-wrap">
      <label for="lpmb-kind">Loại đơn vị</label>
      <select id="lpmb-kind">
        <option value="dn">Doanh nghiệp / tổ chức kinh tế</option>
        <option value="cn">Chi nhánh, văn phòng đại diện, địa điểm kinh doanh</option>
      </select>
    </div>
  </div>
  <div id="lpmb-panel-dn">
    <div class="field">
      <label for="lpmb-capital">Vốn điều lệ hoặc vốn đầu tư</label>
      <span class="input-unit"><input id="lpmb-capital" type="text" inputmode="decimal" value="8.000.000.000" placeholder="Ví dụ: 8.000.000.000"><span class="unit">₫</span></span>
      <p class="hint">Trên 10 tỷ đồng: 3.000.000₫/năm. Từ 10 tỷ đồng trở xuống: 2.000.000₫/năm. Chi nhánh, văn phòng đại diện, địa điểm kinh doanh: 1.000.000₫/năm.</p>
    </div>
  </div>
  <div id="lpmb-panel-hkd" style="display:none">
    <div class="field">
      <label for="lpmb-revenue">Doanh thu năm trước liền kề</label>
      <span class="input-unit"><input id="lpmb-revenue" type="text" inputmode="decimal" value="420.000.000" placeholder="Ví dụ: 420.000.000"><span class="unit">₫</span></span>
      <p class="hint">Trên 500 triệu/năm: 1.000.000₫. Trên 300–500 triệu: 500.000₫. Trên 100–300 triệu: 300.000₫. Từ 100 triệu trở xuống: được miễn.</p>
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="lpmb-first">Năm đầu thành lập / bắt đầu kinh doanh?</label>
      <select id="lpmb-first">
        <option value="no">Không — đã hoạt động từ năm trước</option>
        <option value="yes">Có — mới thành lập trong năm tính lệ phí</option>
      </select>
      <p class="hint">Tổ chức, cá nhân mới thành lập được miễn lệ phí môn bài trong năm đầu tiên.</p>
    </div>
    <div class="field">
      <label for="lpmb-half">Thời điểm bắt đầu hoạt động trong năm</label>
      <select id="lpmb-half">
        <option value="full">6 tháng đầu năm — nộp cả năm</option>
        <option value="half">6 tháng cuối năm — nộp 50%</option>
      </select>
      <p class="hint">Ra hoạt động trong 6 tháng cuối năm thì nộp 50% mức lệ phí cả năm (không áp dụng khi đã được miễn năm đầu).</p>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="lpmb-calc">Tính lệ phí môn bài</button>
    <button type="button" class="btn btn-ghost" id="lpmb-example">Điền ví dụ</button>
  </div>
  <div id="lpmb-out"></div>
  <p class="note">Căn cứ mức thu năm 2025: Điều 4 NĐ 139/2016/NĐ-CP (sửa đổi, bổ sung bởi NĐ 22/2020/NĐ-CP) và Thông tư 302/2016/TT-BTC (sửa đổi bởi Thông tư 65/2020/TT-BTC). Bãi bỏ từ 2026: khoản 7 Điều 10 NQ 198/2025/QH15; NĐ 362/2025/NĐ-CP (bãi bỏ NĐ 139/2016 và NĐ 22/2020, hiệu lực 01/01/2026); Công văn hỏa tốc 645/CT-CS của Cục Thuế. Thời hạn nộp lệ phí năm 2025: chậm nhất 30/01/2026 (NĐ 126/2020/NĐ-CP). Kết quả chỉ mang tính tham khảo — nghĩa vụ cụ thể đối chiếu với cơ quan thuế quản lý trực tiếp.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('lpmb-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  let mode = 'dn';

  function render(o) {
    const copyText = o.copyText;
    $('lpmb-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">${o.heroLabel}</p>
    <div class="result-hero-value">${fmtVND(o.amount)}</div>
    <p class="result-hero-sub">${o.heroSub}</p>
  </div>
  ${o.rows}
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả lệ phí môn bài">Chép kết quả</button></div>
</div>`;
    bindCopy($('lpmb-out'));
  }

  function calc() {
    clearErrs(root);
    const year = $('lpmb-year').value;
    if (year === '2026') {
      render({
        heroLabel: 'Lệ phí môn bài năm 2026 trở đi',
        amount: 0,
        heroSub: 'Đã bãi bỏ hoàn toàn từ 01/01/2026 — không phải nộp, không phải khai',
        rows: '<div class="result-row"><span>Quy định</span><strong>Bãi bỏ (NQ 198/2025/QH15; NĐ 362/2025/NĐ-CP)</strong></div>'
          + '<div class="result-row"><span>Tờ khai lệ phí môn bài</span><strong>Không phải nộp (Công văn 645/CT-CS)</strong></div>',
        copyText: 'Lệ phí môn bài năm 2026 trở đi: 0₫ — đã bãi bỏ hoàn toàn từ 01/01/2026 (NQ 198/2025/QH15; NĐ 362/2025/NĐ-CP).',
      });
      return;
    }
    const firstYear = $('lpmb-first').value === 'yes';
    const halfYear = $('lpmb-half').value === 'half';
    let base = 0, basis = '', basisValue = '';
    if (mode === 'dn') {
      const kind = $('lpmb-kind').value;
      if (kind === 'cn') {
        base = 1000000;
        basis = 'Chi nhánh / văn phòng đại diện / địa điểm kinh doanh';
        basisValue = 'Mức cố định 1.000.000₫/năm';
      } else {
        const capital = parseNum($('lpmb-capital').value);
        if (!(capital > 0)) {
          markErr($('lpmb-capital'), 'Ô Vốn điều lệ chưa có số — nhập số lớn hơn 0, ví dụ 8.000.000.000.');
          focusEl($('lpmb-capital'));
          $('lpmb-out').innerHTML = '';
          return;
        }
        basis = 'Vốn điều lệ / vốn đầu tư';
        basisValue = fmtVND(capital);
        base = capital > 10000000000 ? 3000000 : 2000000;
      }
    } else {
      const revenue = parseNum($('lpmb-revenue').value);
      if (!(revenue >= 0) || $('lpmb-revenue').value.trim() === '') {
        markErr($('lpmb-revenue'), 'Ô Doanh thu chưa có số — nhập doanh thu năm trước, ví dụ 420.000.000 (nhập 0 nếu không có doanh thu).');
        focusEl($('lpmb-revenue'));
        $('lpmb-out').innerHTML = '';
        return;
      }
      basis = 'Doanh thu năm trước liền kề';
      basisValue = fmtVND(revenue);
      if (revenue > 500000000) base = 1000000;
      else if (revenue > 300000000) base = 500000;
      else if (revenue > 100000000) base = 300000;
      else base = 0;
    }
    let amount = base, reason = '';
    if (firstYear) {
      amount = 0;
      reason = 'Được miễn lệ phí môn bài trong năm đầu thành lập / bắt đầu hoạt động (NĐ 22/2020/NĐ-CP).';
    } else if (base === 0) {
      reason = 'Doanh thu từ 100 triệu đồng/năm trở xuống nên được miễn lệ phí môn bài.';
    } else if (halfYear) {
      amount = base / 2;
      reason = 'Ra hoạt động trong 6 tháng cuối năm nên nộp 50% mức lệ phí cả năm.';
    } else {
      reason = 'Mức lệ phí cả năm 2025.';
    }
    render({
      heroLabel: 'Lệ phí môn bài phải nộp năm 2025',
      amount,
      heroSub: reason,
      rows: '<div class="result-row"><span>' + basis + '</span><strong>' + basisValue + '</strong></div>'
        + '<div class="result-row"><span>Mức lệ phí cả năm</span><strong>' + fmtVND(base) + '</strong></div>'
        + (halfYear && !firstYear && base > 0 ? '<div class="result-row"><span>Ra hoạt động 6 tháng cuối năm (50%)</span><strong>' + fmtVND(amount) + '</strong></div>' : '')
        + '<div class="result-row"><span>Hạn nộp</span><strong>Chậm nhất 30/01/2026</strong></div>',
      copyText: 'Lệ phí môn bài năm 2025 (' + basis + ' ' + basisValue + '): ' + fmtVND(amount) + ' — ' + reason,
    });
  }

  function setMode(m) {
    mode = m;
    $('lpmb-tab-dn').classList.toggle('tab-active', m === 'dn');
    $('lpmb-tab-hkd').classList.toggle('tab-active', m === 'hkd');
    $('lpmb-panel-dn').style.display = m === 'dn' ? '' : 'none';
    $('lpmb-panel-hkd').style.display = m === 'hkd' ? '' : 'none';
    $('lpmb-kind-wrap').style.display = m === 'dn' ? '' : 'none';
    clearErrs(root);
    $('lpmb-out').innerHTML = '';
  }
  $('lpmb-tab-dn').addEventListener('click', () => setMode('dn'));
  $('lpmb-tab-hkd').addEventListener('click', () => setMode('hkd'));
  function runCalc() { withBusy($('lpmb-calc'), calc); }
  $('lpmb-calc').addEventListener('click', runCalc);
  $('lpmb-capital').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  $('lpmb-revenue').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: doanh nghiệp vốn 8 tỷ → 2.000.000₫; hộ kinh doanh doanh thu 420 triệu → 500.000₫.
  $('lpmb-example').addEventListener('click', () => {
    if (mode === 'dn') {
      fillEx(root, { 'lpmb-year': '2025', 'lpmb-kind': 'dn', 'lpmb-capital': '8.000.000.000', 'lpmb-first': 'no', 'lpmb-half': 'full' }, $('lpmb-calc'));
    } else {
      fillEx(root, { 'lpmb-year': '2025', 'lpmb-revenue': '420.000.000', 'lpmb-first': 'no', 'lpmb-half': 'full' }, $('lpmb-calc'));
    }
  });
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
