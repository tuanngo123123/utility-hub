// Tính phép năm — Utility Hub (Văn phòng)
export const meta = {
  id: 'phep-nam',
  name: 'Tính phép năm',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Tính số ngày phép năm theo Bộ luật Lao động 2019: theo thâm niên và tính chất công việc.',
  keywords: 'phép năm, ngày nghỉ phép, Bộ luật Lao động 2019, thâm niên, annual leave',
  icon: '🏖️',
  seoTitle: 'Tính phép năm 2026 — theo Bộ luật Lao động 2019',
  seoDesc: 'Tính số ngày nghỉ phép năm của bạn theo thâm niên và tính chất công việc, kèm số ngày phép còn lại sau khi trừ ngày đã nghỉ.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🏖️</span><div><h2>Tính phép năm</h2><p class="muted">Theo Bộ luật Lao động 2019 — Điều 113, 114.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="pn-start">Ngày vào làm</label><input id="pn-start" type="date"></div>
    <div class="field"><label for="pn-type">Tính chất công việc</label>
      <select id="pn-type">
        <option value="12">Bình thường — 12 ngày/năm</option>
        <option value="14">Nặng nhọc, độc hại, nguy hiểm — 14 ngày/năm</option>
        <option value="16">Đặc biệt nặng nhọc, độc hại, nguy hiểm — 16 ngày/năm</option>
      </select>
    </div>
  </div>
  <div class="grid-2">
    <div class="field"><label for="pn-years">Số năm thâm niên (để trống = tự tính từ ngày vào làm)</label><input id="pn-years" type="number" min="0" step="1" placeholder="VD: 7"></div>
    <div class="field"><label for="pn-taken">Số ngày phép đã nghỉ trong năm</label><input id="pn-taken" type="number" min="0" step="0.5" value="0"></div>
  </div>
  <button class="btn btn-primary" id="pn-calc">Tính phép năm</button>
  <div class="result" id="pn-result" hidden></div>
  <p class="note">Quy định: đủ 12 tháng làm việc được hưởng đủ phép năm; cứ đủ 5 năm làm việc cho cùng người sử dụng lao động thì được tăng thêm 1 ngày phép. Người làm chưa đủ 12 tháng được hưởng phép theo tỷ lệ số tháng đã làm.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const startEl = $('pn-start'), typeEl = $('pn-type'), yearsEl = $('pn-years'), takenEl = $('pn-taken'), resEl = $('pn-result');

  $('pn-calc').addEventListener('click', () => {
    const base = +typeEl.value;
    const taken = Math.max(0, parseNum(takenEl.value));
    let years = parseNum(yearsEl.value);
    let monthsWorked = null;
    if (!yearsEl.value.trim() && startEl.value) {
      const start = new Date(startEl.value + 'T00:00:00');
      const now = new Date();
      monthsWorked = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if (now.getDate() < start.getDate()) monthsWorked--;
      if (monthsWorked < 0) { toast('Ngày vào làm không thể ở tương lai.'); return; }
      years = Math.floor(monthsWorked / 12);
    }
    if (!startEl.value && !yearsEl.value.trim()) { toast('Vui lòng nhập ngày vào làm hoặc số năm thâm niên.'); return; }
    const bonus = Math.floor(years / 5);
    let total = base + bonus;
    let prorated = false;
    if (monthsWorked !== null && monthsWorked < 12) {
      total = Math.round(((base + bonus) * monthsWorked / 12) * 10) / 10;
      prorated = true;
    }
    const remain = Math.max(0, total - taken);
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Thâm niên</span><span>' + fmtNum(years) + ' năm' + (monthsWorked !== null ? ' (' + fmtNum(monthsWorked) + ' tháng)' : '') + '</span></div>' +
      '<div class="result-row"><span>Phép cơ bản theo công việc</span><span>' + fmtNum(base) + ' ngày</span></div>' +
      '<div class="result-row"><span>Cộng thêm do thâm niên (+1 ngày / 5 năm)</span><span>+' + fmtNum(bonus) + ' ngày</span></div>' +
      '<div class="result-row"><span>Tổng phép năm' + (prorated ? ' (tính theo tỷ lệ tháng đã làm)' : '') + '</span><strong>' + fmtNum(total) + ' ngày</strong></div>' +
      '<div class="result-row"><span>Đã nghỉ</span><span>' + fmtNum(taken) + ' ngày</span></div>' +
      '<div class="result-row"><span>Còn lại</span><strong>' + fmtNum(remain) + ' ngày</strong></div>';
  });
}
