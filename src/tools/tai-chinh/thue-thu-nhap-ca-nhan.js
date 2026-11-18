// Tính thuế thu nhập cá nhân 2026 — biểu lũy tiến 5 bậc (Luật 109/2025/QH15),
// giảm trừ bản thân 15,5 triệu + phụ thuộc 6,2 triệu/người (NQ 110/2025/UBTVQH15).
// Cùng mô hình thuế đã kiểm chứng trong công cụ lương Gross ⇄ Net.
export const meta = {
  id: 'thue-thu-nhap-ca-nhan',
  name: 'Tính thuế thu nhập cá nhân 2026',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Tính thuế TNCN từ lương theo biểu lũy tiến 5 bậc năm 2026 (5%–35%): nhập lương và số người phụ thuộc, xem thuế từng bậc, thuế tháng và thuế năm.',
  keywords: 'thuế thu nhập cá nhân 2026, tính thuế TNCN, biểu thuế 5 bậc, giảm trừ gia cảnh 15,5 triệu, thuế lương',
  icon: '🧾',
  seoTitle: 'Tính thuế thu nhập cá nhân 2026 — biểu thuế 5 bậc, giảm trừ 15,5 triệu',
  seoDesc: 'Tính thuế TNCN 2026 từ lương: giảm trừ bản thân 15,5 triệu/tháng, người phụ thuộc 6,2 triệu/người, biểu lũy tiến 5 bậc 5%–35%. Xem thuế từng bậc, miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="tncn-tab-salary">Từ lương tháng</button>
      <button type="button" class="tab" id="tncn-tab-taxable">Từ thu nhập tính thuế</button>
    </div>
  </div>
  <div id="tncn-panel-salary">
    <div class="grid-2">
      <div class="field">
        <label for="tncn-gross">Lương Gross mỗi tháng</label>
        <span class="input-unit"><input id="tncn-gross" type="text" inputmode="decimal" value="45.000.000" placeholder="VD: 45.000.000"><span class="unit">₫</span></span>
      </div>
      <div class="field">
        <label for="tncn-ins">Lương đóng bảo hiểm mỗi tháng</label>
        <span class="input-unit"><input id="tncn-ins" type="text" inputmode="decimal" value="45.000.000" placeholder="Mặc định = lương Gross"><span class="unit">₫</span></span>
        <p class="hint">Để trống hoặc bằng lương Gross nếu công ty đóng bảo hiểm trên toàn bộ lương. Người lao động đóng BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5%.</p>
      </div>
      <div class="field">
        <label for="tncn-region">Vùng lương tối thiểu (tính trần BHTN)</label>
        <select id="tncn-region">
          <option value="106200000">Vùng I — trần BHTN 106.200.000₫</option>
          <option value="94600000">Vùng II — trần BHTN 94.600.000₫</option>
          <option value="82800000">Vùng III — trần BHTN 82.800.000₫</option>
          <option value="74000000">Vùng IV — trần BHTN 74.000.000₫</option>
        </select>
      </div>
      <div class="field">
        <label for="tncn-dep">Số người phụ thuộc</label>
        <input id="tncn-dep" type="number" min="0" step="1" value="1">
        <p class="hint">Mỗi người phụ thuộc giảm trừ 6.200.000₫/tháng. Giảm trừ bản thân: 15.500.000₫/tháng.</p>
      </div>
    </div>
  </div>
  <div id="tncn-panel-taxable" style="display:none">
    <div class="field">
      <label for="tncn-taxable">Thu nhập tính thuế mỗi tháng</label>
      <span class="input-unit"><input id="tncn-taxable" type="text" inputmode="decimal" value="18.575.000" placeholder="VD: 18.575.000"><span class="unit">₫</span></span>
      <p class="hint">Thu nhập tính thuế = lương Gross − bảo hiểm bắt buộc − giảm trừ bản thân (15,5 triệu) − giảm trừ người phụ thuộc (6,2 triệu/người). Dùng ô này khi bạn đã tự tính được thu nhập tính thuế.</p>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="tncn-calc">Tính thuế TNCN</button>
    <button type="button" class="btn btn-ghost" id="tncn-example">Điền ví dụ</button>
  </div>
  <div id="tncn-out"></div>
  <p class="note">Căn cứ: Luật Thuế TNCN 109/2025/QH15, Điều 9 (biểu lũy tiến 5 bậc: 5% / 10% / 20% / 30% / 35%, áp dụng với thu nhập từ tiền lương từ kỳ tính thuế 2026); NQ 110/2025/UBTVQH15 (giảm trừ bản thân 15.500.000₫, phụ thuộc 6.200.000₫/người); NĐ 161/2026/NĐ-CP (trần BHXH/BHYT 50.600.000₫). Kết quả chỉ mang tính tham khảo — thuế thực nộp do cơ quan thuế và đơn vị chi trả xác định; trường hợp có nhiều nguồn thu nhập, thu nhập vãng lai hoặc quyết toán năm, hãy đối chiếu với cơ quan thuế.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tncn-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const CAP_BHXH = 50600000;
  const DEDUCT_SELF = 15500000;
  const DEDUCT_DEP = 6200000;
  const BRACKETS = [
    { upTo: 10000000, rate: 0.05 },
    { upTo: 30000000, rate: 0.10 },
    { upTo: 60000000, rate: 0.20 },
    { upTo: 100000000, rate: 0.30 },
    { upTo: Infinity, rate: 0.35 },
  ];

  let mode = 'salary';

  function taxByBrackets(taxable) {
    let tax = 0, prev = 0;
    const rows = [];
    for (const b of BRACKETS) {
      if (taxable <= prev) break;
      const part = Math.min(taxable, b.upTo) - prev;
      const t = part * b.rate;
      tax += t;
      rows.push({ label: (prev === 0 ? 'Đến 10 triệu' : 'Trên ' + fmtNum(prev / 1000000) + '–' + (b.upTo === Infinity ? '…' : fmtNum(b.upTo / 1000000) + ' triệu')), rate: b.rate * 100, base: part, tax: t });
      prev = b.upTo;
    }
    return { tax, rows };
  }

  function render(o) {
    const taxRows = o.taxRows.length
      ? o.taxRows.map(x => `<tr><td>Bậc ${x.label} (${x.rate}%)</td><td>${fmtVND(x.base)}</td><td>${fmtVND(x.tax)}</td></tr>`).join('')
      : '<tr><td colspan="3">Không phải nộp thuế (thu nhập tính thuế bằng 0).</td></tr>';
    const detailRows = o.fromSalary
      ? `<div class="result-row"><span>Lương Gross</span><strong>${fmtVND(o.gross)}</strong></div>
  <div class="result-row"><span>Bảo hiểm bắt buộc (10,5%)</span><strong>− ${fmtVND(o.insurance)}</strong></div>
  <div class="result-row"><span>Giảm trừ bản thân</span><strong>− ${fmtVND(DEDUCT_SELF)}</strong></div>
  <div class="result-row"><span>Giảm trừ ${o.deps} người phụ thuộc</span><strong>− ${fmtVND(o.deps * DEDUCT_DEP)}</strong></div>`
      : '';
    const copyText = 'Thu nhập tính thuế: ' + fmtVND(o.taxable)
      + ' · Thuế TNCN/tháng: ' + fmtVND(o.tax)
      + ' · Thuế TNCN/năm (ước tính × 12): ' + fmtVND(o.tax * 12);
    $('tncn-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Thuế TNCN phải nộp mỗi tháng</p>
    <div class="result-hero-value">${fmtVND(o.tax)}</div>
    <p class="result-hero-sub">Thu nhập tính thuế ${fmtVND(o.taxable)} · Thuế cả năm (ước tính) ${fmtVND(o.tax * 12)}</p>
  </div>
  ${detailRows}
  <div class="result-row"><span>Thu nhập tính thuế</span><strong>${fmtVND(o.taxable)}</strong></div>
  <div class="result-row"><span>Thuế TNCN mỗi tháng</span><strong>${fmtVND(o.tax)}</strong></div>
  <div class="result-row"><span>Thuế TNCN cả năm (ước tính × 12)</span><strong>${fmtVND(o.tax * 12)}</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả thuế TNCN">Chép kết quả</button></div>
</div>
<table class="tbl">
  <thead><tr><th>Bậc thuế</th><th>Thu nhập tính thuế</th><th>Tiền thuế</th></tr></thead>
  <tbody>${taxRows}</tbody>
</table>`;
    bindCopy($('tncn-out'));
  }

  function calc() {
    clearErrs(root);
    if (mode === 'salary') {
      const gross = parseNum($('tncn-gross').value);
      const insRaw = $('tncn-ins').value.trim();
      const bhtnCap = parseNum($('tncn-region').value);
      const deps = Math.max(0, parseInt($('tncn-dep').value, 10) || 0);
      if (!(gross > 0)) {
        markErr($('tncn-gross'), 'Ô Lương Gross chưa có số — nhập số lớn hơn 0, ví dụ 45.000.000.');
        focusEl($('tncn-gross'));
        $('tncn-out').innerHTML = '';
        return;
      }
      if (insRaw !== '' && !(parseNum(insRaw) > 0)) {
        markErr($('tncn-ins'), 'Ô Lương đóng bảo hiểm chưa đúng — để trống (mặc định bằng lương Gross) hoặc nhập số lớn hơn 0.');
        focusEl($('tncn-ins'));
        $('tncn-out').innerHTML = '';
        return;
      }
      const insSalary = insRaw === '' ? gross : parseNum(insRaw);
      const bhxhBase = Math.min(insSalary, CAP_BHXH);
      const bhtnBase = Math.min(insSalary, bhtnCap);
      const insurance = bhxhBase * 0.08 + bhxhBase * 0.015 + bhtnBase * 0.01;
      const taxable = Math.max(0, gross - insurance - DEDUCT_SELF - deps * DEDUCT_DEP);
      const { tax, rows } = taxByBrackets(taxable);
      render({ fromSalary: true, gross, insurance, deps, taxable, tax, taxRows: rows });
    } else {
      const taxable = parseNum($('tncn-taxable').value);
      if (!(taxable > 0)) {
        markErr($('tncn-taxable'), 'Ô Thu nhập tính thuế chưa có số — nhập số lớn hơn 0, ví dụ 18.575.000.');
        focusEl($('tncn-taxable'));
        $('tncn-out').innerHTML = '';
        return;
      }
      const { tax, rows } = taxByBrackets(taxable);
      render({ fromSalary: false, taxable, tax, taxRows: rows });
    }
  }

  function setMode(m) {
    mode = m;
    $('tncn-tab-salary').classList.toggle('tab-active', m === 'salary');
    $('tncn-tab-taxable').classList.toggle('tab-active', m === 'taxable');
    $('tncn-panel-salary').style.display = m === 'salary' ? '' : 'none';
    $('tncn-panel-taxable').style.display = m === 'taxable' ? '' : 'none';
    clearErrs(root);
    $('tncn-out').innerHTML = '';
  }
  $('tncn-tab-salary').addEventListener('click', () => setMode('salary'));
  $('tncn-tab-taxable').addEventListener('click', () => setMode('taxable'));
  function runCalc() { withBusy($('tncn-calc'), calc); }
  $('tncn-calc').addEventListener('click', runCalc);
  $('tncn-gross').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  $('tncn-ins').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  $('tncn-taxable').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: lương 45 triệu, 1 người phụ thuộc → TNTT 18.575.000₫, thuế 1.357.500₫/tháng.
  $('tncn-example').addEventListener('click', () => {
    if (mode === 'salary') {
      fillEx(root, { 'tncn-gross': '45.000.000', 'tncn-ins': '45.000.000', 'tncn-dep': '1' }, $('tncn-calc'));
    } else {
      fillEx(root, { 'tncn-taxable': '18.575.000' }, $('tncn-calc'));
    }
  });
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
