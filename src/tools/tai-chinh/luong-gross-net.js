// Tính lương Gross ⇄ Net — luật mới 2026 (NĐ 161/2026, NQ 110/2025, Luật 109/2025).
export const meta = {
  id: 'luong-gross-net',
  name: 'Tính lương Gross ⇄ Net',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Đổi lương Gross sang Net và ngược lại theo luật thuế, bảo hiểm mới nhất 2026: bảo hiểm 10,5%, giảm trừ bản thân 15,5 triệu, biểu thuế 5 bậc.',
  keywords: 'lương gross net, tính lương net, thuế thu nhập cá nhân 2026, bảo hiểm xã hội, gross to net',
  icon: '💰',
  seoTitle: 'Tính lương Gross ⇄ Net 2026 — thuế TNCN & bảo hiểm mới nhất',
  seoDesc: 'Tính lương Net từ Gross và ngược lại theo luật 2026: BHXH 8%, BHYT 1,5%, BHTN 1%, giảm trừ 15,5 triệu, biểu thuế TNCN 5 bậc. Miễn phí, tính ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="lggn-tab-g2n">Gross → Net</button>
      <button type="button" class="tab" id="lggn-tab-n2g">Net → Gross</button>
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="lggn-salary">Lương <span id="lggn-salary-label">Gross</span> (₫/tháng)</label>
      <input id="lggn-salary" type="text" inputmode="decimal" value="30.000.000" placeholder="VD: 30.000.000">
    </div>
    <div class="field">
      <label for="lggn-ins">Lương đóng bảo hiểm (₫/tháng)</label>
      <input id="lggn-ins" type="text" inputmode="decimal" value="30.000.000" placeholder="Mặc định = lương Gross">
      <p class="muted">Để trống hoặc bằng lương Gross nếu công ty đóng bảo hiểm trên toàn bộ lương.</p>
    </div>
    <div class="field">
      <label for="lggn-region">Vùng lương tối thiểu (tính trần BHTN)</label>
      <select id="lggn-region">
        <option value="106200000">Vùng I — trần BHTN 106.200.000₫</option>
        <option value="94600000">Vùng II — trần BHTN 94.600.000₫</option>
        <option value="82800000">Vùng III — trần BHTN 82.800.000₫</option>
        <option value="74000000">Vùng IV — trần BHTN 74.000.000₫</option>
      </select>
    </div>
    <div class="field">
      <label for="lggn-dep">Số người phụ thuộc</label>
      <input id="lggn-dep" type="number" min="0" step="1" value="0">
      <p class="muted">Mỗi người phụ thuộc giảm trừ 6.200.000₫/tháng.</p>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="lggn-calc">Tính lương</button>
  <div id="lggn-out"></div>
  <p class="note">Căn cứ: NĐ 161/2026/NĐ-CP (trần BHXH/BHYT 50.600.000₫ từ 01/7/2026); NQ 110/2025/UBTVQH15 (giảm trừ bản thân 15.500.000₫, phụ thuộc 6.200.000₫); Luật Thuế TNCN 109/2025/QH15 (biểu thuế 5 bậc: 5% / 10% / 20% / 30% / 35%). Người lao động đóng BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5%.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const toast = U.toast || function () {};

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

  let direction = 'g2n';
  const $ = id => root.querySelector('#' + id);

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

  function calcFromGross(gross, insSalary, bhtnCap, deps) {
    const bhxhBase = Math.min(insSalary, CAP_BHXH);
    const bhtnBase = Math.min(insSalary, bhtnCap);
    const bhxh = bhxhBase * 0.08;
    const bhyt = bhxhBase * 0.015;
    const bhtn = bhtnBase * 0.01;
    const insurance = bhxh + bhyt + bhtn;
    const taxable = Math.max(0, gross - insurance - DEDUCT_SELF - deps * DEDUCT_DEP);
    const { tax, rows } = taxByBrackets(taxable);
    const net = gross - insurance - tax;
    return { gross, bhxh, bhyt, bhtn, insurance, taxable, tax, taxRows: rows, net, bhxhBase, bhtnBase };
  }

  function render(r) {
    const taxRows = r.taxRows.length
      ? r.taxRows.map(x => `<tr><td>Thuế bậc ${x.label} (${x.rate}%)</td><td>${fmtVND(x.base)}</td><td>${fmtVND(x.tax)}</td></tr>`).join('')
      : '<tr><td colspan="3">Không phải nộp thuế (thu nhập tính thuế bằng 0).</td></tr>';
    $('lggn-out').innerHTML = `
<div class="result">
  <div class="result-row"><span>Lương Gross</span><strong>${fmtVND(r.gross)}</strong></div>
  <div class="result-row"><span>BHXH 8% (trên ${fmtVND(r.bhxhBase)})</span><strong>− ${fmtVND(r.bhxh)}</strong></div>
  <div class="result-row"><span>BHYT 1,5% (trên ${fmtVND(r.bhxhBase)})</span><strong>− ${fmtVND(r.bhyt)}</strong></div>
  <div class="result-row"><span>BHTN 1% (trên ${fmtVND(r.bhtnBase)})</span><strong>− ${fmtVND(r.bhtn)}</strong></div>
  <div class="result-row"><span>Tổng bảo hiểm (10,5%)</span><strong>− ${fmtVND(r.insurance)}</strong></div>
  <div class="result-row"><span>Thu nhập tính thuế</span><strong>${fmtVND(r.taxable)}</strong></div>
  <div class="result-row"><span>Thuế TNCN</span><strong>− ${fmtVND(r.tax)}</strong></div>
  <div class="result-row"><span>Lương Net (thực nhận)</span><strong>${fmtVND(r.net)}</strong></div>
</div>
<table class="tbl">
  <thead><tr><th>Khoản thuế theo bậc</th><th>Thu nhập tính thuế</th><th>Tiền thuế</th></tr></thead>
  <tbody>${taxRows}</tbody>
</table>`;
  }

  function calc() {
    const salary = parseNum($('lggn-salary').value);
    const insRaw = $('lggn-ins').value.trim();
    const bhtnCap = parseNum($('lggn-region').value);
    const deps = Math.max(0, parseInt($('lggn-dep').value, 10) || 0);
    if (!(salary > 0)) { $('lggn-out').innerHTML = '<p class="error">Vui lòng nhập lương lớn hơn 0.</p>'; return; }
    if (direction === 'g2n') {
      const insSalary = insRaw === '' ? salary : parseNum(insRaw);
      render(calcFromGross(salary, insSalary, bhtnCap, deps));
    } else {
      // Net → Gross: lặp nhị phân trên Gross.
      const targetNet = salary;
      let lo = targetNet, hi = targetNet * 2 + 100000000;
      let best = calcFromGross(hi, hi, bhtnCap, deps);
      for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        const insSalary = insRaw === '' ? mid : parseNum(insRaw);
        const r = calcFromGross(mid, insSalary, bhtnCap, deps);
        best = r;
        if (Math.abs(r.net - targetNet) < 500) break;
        if (r.net < targetNet) lo = mid; else hi = mid;
      }
      render(best);
      toast('Đã quy đổi Net → Gross');
    }
  }

  $('lggn-tab-g2n').addEventListener('click', () => {
    direction = 'g2n';
    $('lggn-tab-g2n').classList.add('tab-active');
    $('lggn-tab-n2g').classList.remove('tab-active');
    $('lggn-salary-label').textContent = 'Gross';
    $('lggn-out').innerHTML = '';
  });
  $('lggn-tab-n2g').addEventListener('click', () => {
    direction = 'n2g';
    $('lggn-tab-n2g').classList.add('tab-active');
    $('lggn-tab-g2n').classList.remove('tab-active');
    $('lggn-salary-label').textContent = 'Net';
    $('lggn-out').innerHTML = '';
  });
  $('lggn-calc').addEventListener('click', calc);
  $('lggn-salary').addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });
}
