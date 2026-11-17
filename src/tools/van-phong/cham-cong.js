// Tính giờ chấm công — Utility Hub (Văn phòng)
export const meta = {
  id: 'cham-cong',
  name: 'Tính giờ chấm công',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Cộng giờ làm từ bảng chấm công nhiều ngày, trừ giờ nghỉ trưa, so với chuẩn 8 giờ/ngày.',
  keywords: 'chấm công, tính giờ làm, giờ công, timesheet, giờ thiếu thừa',
  icon: '🕐',
  seoTitle: 'Tính giờ chấm công — tổng giờ làm & giờ thiếu/thừa',
  seoDesc: 'Nhập giờ vào — giờ ra nhiều ngày, tự trừ giờ nghỉ trưa và tính tổng giờ làm, giờ thiếu hoặc thừa so với chuẩn 8 giờ/ngày.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🕐</span><div><h2>Tính giờ chấm công</h2><p class="muted">Mỗi dòng một ngày, dạng giờ vào-giờ ra, ví dụ 08:00-17:30.</p></div></div>
  <div class="field"><label for="cc-lines">Bảng chấm công (mỗi dòng 1 ngày: giờ vào-giờ ra)</label><textarea id="cc-lines" rows="6" placeholder="08:00-17:30&#10;08:05-17:45&#10;08:00-12:00"></textarea></div>
  <div class="grid-2">
    <div class="field"><label for="cc-lunch">Trừ giờ nghỉ trưa mỗi ngày (giờ)</label><input id="cc-lunch" type="number" min="0" max="4" step="0.5" value="1"></div>
    <div class="field"><label for="cc-standard">Chuẩn giờ làm / ngày (giờ)</label><input id="cc-standard" type="number" min="1" max="12" step="0.5" value="8"></div>
  </div>
  <button class="btn btn-primary" id="cc-calc">Tính giờ công</button>
  <div class="result" id="cc-result" hidden></div>
  <div id="cc-table" hidden></div>
  <p class="note">Ngày làm dưới 5 giờ (ví dụ chỉ làm buổi sáng) sẽ không bị trừ giờ nghỉ trưa.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const $ = id => root.querySelector('#' + id);
  const linesEl = $('cc-lines'), lunchEl = $('cc-lunch'), stdEl = $('cc-standard'), resEl = $('cc-result'), tableEl = $('cc-table');

  function toMin(t) {
    const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  }
  function fmtH(mins) {
    const sign = mins < 0 ? '-' : '';
    const a = Math.abs(mins);
    return sign + Math.floor(a / 60) + ' giờ ' + String(Math.round(a % 60)).padStart(2, '0') + ' phút';
  }

  $('cc-calc').addEventListener('click', () => {
    const lunch = Math.max(0, parseNum(lunchEl.value)) * 60;
    const standard = Math.max(0, parseNum(stdEl.value)) * 60;
    const lines = linesEl.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) { toast('Vui lòng nhập ít nhất 1 dòng chấm công.'); return; }
    const rows = [];
    let bad = 0, totalWork = 0;
    lines.forEach((line, i) => {
      const parts = line.split(/[-–—~]/);
      if (parts.length !== 2) { bad++; return; }
      const a = toMin(parts[0]), b = toMin(parts[1]);
      if (a === null || b === null || b <= a) { bad++; return; }
      const gross = b - a;
      const lunchCut = gross >= 300 ? lunch : 0;
      const work = gross - lunchCut;
      totalWork += work;
      rows.push({ day: i + 1, line, gross, lunchCut, work, diff: work - standard });
    });
    if (!rows.length) { toast('Không có dòng nào hợp lệ. Mỗi dòng dạng 08:00-17:30.'); return; }
    const expected = standard * rows.length;
    const diff = totalWork - expected;
    resEl.hidden = false;
    resEl.innerHTML =
      '<div class="result-row"><span>Tổng giờ làm thực tế</span><strong>' + fmtH(totalWork) + ' (' + (totalWork / 60).toFixed(2) + ' giờ)</strong></div>' +
      '<div class="result-row"><span>Chuẩn ' + fmtNum(rows.length) + ' ngày × ' + (standard / 60) + ' giờ</span><span>' + fmtH(expected) + '</span></div>' +
      '<div class="result-row"><span>' + (diff >= 0 ? 'Thừa' : 'Thiếu') + ' so với chuẩn</span><strong>' + fmtH(Math.abs(diff)) + '</strong></div>' +
      (bad ? '<div class="result-row"><span class="error">Dòng không đọc được (đã bỏ qua)</span><span>' + fmtNum(bad) + ' dòng</span></div>' : '');
    let html = '<table class="tbl"><tr><th>Ngày</th><th>Giờ vào — ra</th><th>Giờ làm</th><th>Thừa / thiếu</th></tr>';
    rows.forEach(r => {
      html += '<tr><td>Ngày ' + r.day + '</td><td>' + r.line + '</td><td>' + fmtH(r.work) + '</td><td>' + (r.diff >= 0 ? '+' : '−') + fmtH(Math.abs(r.diff)) + '</td></tr>';
    });
    html += '</table>';
    tableEl.innerHTML = html;
    tableEl.hidden = false;
  });
}
