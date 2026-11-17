// Chia tiền hóa đơn nhóm — có tiền boa, phần riêng từng người, làm tròn nghìn.
export const meta = {
  id: 'chia-tien-hoa-don',
  name: 'Chia tiền hóa đơn nhóm',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Chia hóa đơn cho cả nhóm: cộng tiền boa, ai gọi thêm món riêng thì trả thêm, ai được bớt thì trả ít hơn. Làm tròn nghìn, chép kết quả gửi nhóm chat.',
  keywords: 'chia tiền hóa đơn, chia tiền nhóm, chia bill, split bill, chia tiền ăn chung',
  icon: '🧾',
  seoTitle: 'Chia tiền hóa đơn nhóm — có boa, phần riêng, làm tròn nghìn',
  seoDesc: 'Chia hóa đơn nhóm công bằng: cộng tiền boa, tính phần riêng từng người, làm tròn nghìn đồng, chép kết quả gửi nhóm chat. Miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="grid-3">
    <div class="field">
      <label for="cthd-total">Tổng hóa đơn (₫)</label>
      <input id="cthd-total" type="text" inputmode="decimal" value="1.000.000" placeholder="VD: 1.000.000">
    </div>
    <div class="field">
      <label for="cthd-tip">Tiền boa (%)</label>
      <input id="cthd-tip" type="text" inputmode="decimal" value="10" placeholder="VD: 10">
    </div>
    <div class="field">
      <label for="cthd-count">Số người</label>
      <input id="cthd-count" type="number" min="1" max="50" step="1" value="4">
    </div>
  </div>
  <div class="field">
    <label>Danh sách người (phần riêng: số dương = trả thêm, số âm = được bớt; để 0 nếu chia đều)</label>
    <div id="cthd-people"></div>
  </div>
  <button type="button" class="btn btn-primary" id="cthd-calc">Chia tiền</button>
  <div id="cthd-out"></div>
  <p class="note">Cách tính: phần chung = (tổng hóa đơn + tiền boa − tổng phần riêng) chia đều cho mọi người, rồi cộng phần riêng của từng người. Mỗi khoản làm tròn tới nghìn đồng gần nhất.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const toast = U.toast || function () {};
  const copyText = U.copyText || (t => { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve(); });
  const $ = id => root.querySelector('#' + id);

  function renderPeople() {
    const n = Math.max(1, Math.min(50, Math.round(parseNum($('cthd-count').value) || 1)));
    const existing = Array.from(root.querySelectorAll('[data-cthd-person]')).map(row => ({
      name: row.querySelector('[data-cthd-name]').value,
      extra: row.querySelector('[data-cthd-extra]').value,
    }));
    let html = '';
    for (let i = 0; i < n; i++) {
      const prev = existing[i] || {};
      html += `<div class="grid-2" data-cthd-person style="margin-bottom:6px">
        <input data-cthd-name type="text" value="${(prev.name || ('Người ' + (i + 1))).replace(/"/g, '&quot;')}" placeholder="Tên người ${i + 1}">
        <input data-cthd-extra type="text" inputmode="decimal" value="${prev.extra || '0'}" placeholder="Phần riêng (₫), VD: 50.000 hoặc -20.000">
      </div>`;
    }
    $('cthd-people').innerHTML = html;
  }

  function calc() {
    const total = parseNum($('cthd-total').value);
    const tipPct = parseNum($('cthd-tip').value);
    if (!(total > 0)) { $('cthd-out').innerHTML = '<p class="error">Vui lòng nhập tổng hóa đơn lớn hơn 0.</p>'; return; }
    if (tipPct < 0) { $('cthd-out').innerHTML = '<p class="error">Tiền boa không được âm.</p>'; return; }
    const people = Array.from(root.querySelectorAll('[data-cthd-person]')).map(row => ({
      name: row.querySelector('[data-cthd-name]').value.trim() || 'Người',
      extra: parseNum(row.querySelector('[data-cthd-extra]').value),
    }));
    if (!people.length) { $('cthd-out').innerHTML = '<p class="error">Chưa có người nào trong danh sách.</p>'; return; }
    const tip = total * tipPct / 100;
    const grand = total + tip;
    const sumExtra = people.reduce((s, p) => s + p.extra, 0);
    const shared = (grand - sumExtra) / people.length;
    const roundK = v => Math.round(v / 1000) * 1000;
    const results = people.map(p => ({ ...p, pay: roundK(shared + p.extra) }));
    const totalRounded = results.reduce((s, p) => s + p.pay, 0);
    const diff = totalRounded - grand;
    const lines = results.map(p => `${p.name}: ${fmtVND(p.pay)}`).join('\n');
    $('cthd-out').innerHTML = `
<div class="result">
  <div class="result-row"><span>Tổng hóa đơn</span><strong>${fmtVND(total)}</strong></div>
  <div class="result-row"><span>Tiền boa ${tipPct}%</span><strong>${fmtVND(tip)}</strong></div>
  <div class="result-row"><span>Tổng phải trả</span><strong>${fmtVND(grand)}</strong></div>
  <div class="result-row"><span>Phần chung mỗi người</span><strong>${fmtVND(shared)}</strong></div>
</div>
<table class="tbl">
  <thead><tr><th>Người</th><th>Phần riêng</th><th>Phải trả (làm tròn nghìn)</th></tr></thead>
  <tbody>${results.map(p => `<tr><td>${p.name.replace(/</g, '&lt;')}</td><td>${p.extra === 0 ? '—' : fmtVND(p.extra)}</td><td><strong>${fmtVND(p.pay)}</strong></td></tr>`).join('')}</tbody>
</table>
${diff !== 0 ? `<p class="note">Do làm tròn nghìn, tổng thu được ${fmtVND(totalRounded)} — ${diff > 0 ? 'dư' : 'thiếu'} ${fmtVND(Math.abs(diff))} so với hóa đơn.</p>` : ''}
<button type="button" class="btn btn-ghost copy-btn" id="cthd-copy">Chép kết quả gửi nhóm</button>`;
    $('cthd-copy').addEventListener('click', () => {
      copyText(`Chia tiền hóa đơn — tổng ${fmtVND(grand)} (gồm boa ${fmtPct(tipPct)}):\n${lines}`).then(() => toast('Đã chép kết quả'));
    });
    function fmtPct(n) { return (Math.round(n * 100) / 100).toLocaleString('vi-VN') + '%'; }
  }

  $('cthd-count').addEventListener('change', renderPeople);
  $('cthd-calc').addEventListener('click', calc);
  renderPeople();
}
