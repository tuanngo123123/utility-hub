// Tính ngày tháng & hạn chót — Utility Hub (Văn phòng)
export const meta = {
  id: 'ngay-thang-han-chot',
  name: 'Tính ngày tháng & hạn chót',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Khoảng cách giữa hai ngày, cộng/trừ ngày vào một ngày, và đếm ngược tới hạn chót.',
  keywords: 'tính ngày, cộng ngày, đếm ngược hạn chót, khoảng cách ngày, date calculator',
  icon: '⏳',
  seoTitle: 'Tính ngày tháng & hạn chót — cộng ngày, đếm ngược deadline',
  seoDesc: 'Tính khoảng cách giữa hai ngày, cộng hoặc trừ N ngày vào một ngày (kèm thứ trong tuần), và đếm ngược tới hạn chót của bạn.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>⏳</span><div><h2>Tính ngày tháng &amp; hạn chót</h2><p class="muted">Ba việc trong một chỗ: khoảng cách, cộng/trừ ngày, đếm ngược.</p></div></div>
  <div class="tabs">
    <button class="tab tab-active" id="nt-tab-diff">Khoảng cách 2 ngày</button>
    <button class="tab" id="nt-tab-add">Cộng / trừ ngày</button>
    <button class="tab" id="nt-tab-count">Đếm ngược hạn chót</button>
  </div>

  <div id="nt-pane-diff">
    <div class="grid-2">
      <div class="field"><label for="nt-d1">Ngày thứ nhất</label><input id="nt-d1" type="date"></div>
      <div class="field"><label for="nt-d2">Ngày thứ hai</label><input id="nt-d2" type="date"></div>
    </div>
    <button class="btn btn-primary" id="nt-diff-calc">Tính khoảng cách</button>
    <div class="result" id="nt-diff-result" hidden></div>
  </div>

  <div id="nt-pane-add" hidden>
    <div class="grid-2">
      <div class="field"><label for="nt-base">Ngày gốc</label><input id="nt-base" type="date"></div>
      <div class="field"><label for="nt-n">Cộng / trừ bao nhiêu ngày (số âm = trừ)</label><input id="nt-n" type="number" step="1" value="30"></div>
    </div>
    <button class="btn btn-primary" id="nt-add-calc">Tính ngày kết quả</button>
    <div class="result" id="nt-add-result" hidden></div>
    <p class="note">Ví dụ: 01/01/2026 cộng 30 ngày = 31/01/2026, thứ bảy.</p>
  </div>

  <div id="nt-pane-count" hidden>
    <div class="field"><label for="nt-deadline">Hạn chót</label><input id="nt-deadline" type="date"></div>
    <button class="btn btn-primary" id="nt-count-calc">Đếm ngược</button>
    <div class="result" id="nt-count-result" hidden></div>
  </div>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const todayISO = UH.todayISO || (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const $ = id => root.querySelector('#' + id);
  const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  function parseISO(v) { if (!v) return null; const d = new Date(v + 'T00:00:00'); return isNaN(d) ? null : d; }
  function fmtDate(d) { return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); }
  function dayDiff(a, b) { return Math.round((b - a) / 86400000); }

  const today = todayISO();
  $('nt-d1').value = today;
  $('nt-d2').value = today;
  $('nt-base').value = today;
  $('nt-deadline').value = today;

  const tabs = [['nt-tab-diff', 'nt-pane-diff'], ['nt-tab-add', 'nt-pane-add'], ['nt-tab-count', 'nt-pane-count']];
  tabs.forEach(([tabId, paneId]) => {
    $(tabId).addEventListener('click', () => {
      tabs.forEach(([t, p]) => {
        $(t).classList.toggle('tab-active', t === tabId);
        $(p).hidden = p !== paneId;
      });
    });
  });

  $('nt-diff-calc').addEventListener('click', () => {
    const a = parseISO($('nt-d1').value), b = parseISO($('nt-d2').value);
    if (!a || !b) { toast('Vui lòng chọn đủ hai ngày.'); return; }
    const days = Math.abs(dayDiff(a, b));
    const weeks = Math.floor(days / 7), remDays = days % 7;
    const months = Math.abs((b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
    const res = $('nt-diff-result');
    res.hidden = false;
    res.innerHTML =
      '<div class="result-row"><span>Khoảng cách</span><strong>' + fmtNum(days) + ' ngày</strong></div>' +
      '<div class="result-row"><span>Quy ra tuần</span><span>' + fmtNum(weeks) + ' tuần' + (remDays ? ' ' + fmtNum(remDays) + ' ngày lẻ' : '') + ' (' + (days / 7).toFixed(1) + ' tuần)</span></div>' +
      '<div class="result-row"><span>Chênh lệch tháng dương lịch</span><span>' + fmtNum(months) + ' tháng</span></div>' +
      '<div class="result-row"><span>Ngày 1 là</span><span>' + fmtDate(a) + ', ' + WEEKDAYS[a.getDay()] + '</span></div>' +
      '<div class="result-row"><span>Ngày 2 là</span><span>' + fmtDate(b) + ', ' + WEEKDAYS[b.getDay()] + '</span></div>';
  });

  $('nt-add-calc').addEventListener('click', () => {
    const base = parseISO($('nt-base').value);
    if (!base) { toast('Vui lòng chọn ngày gốc.'); return; }
    const n = Math.floor(parseNum($('nt-n').value));
    const out = new Date(base);
    out.setDate(out.getDate() + n);
    const res = $('nt-add-result');
    res.hidden = false;
    res.innerHTML =
      '<div class="result-row"><span>Kết quả</span><strong>' + fmtDate(out) + ' — ' + WEEKDAYS[out.getDay()] + '</strong></div>' +
      '<div class="result-row"><span>Phép tính</span><span>' + fmtDate(base) + ' ' + (n >= 0 ? '+' : '−') + ' ' + fmtNum(Math.abs(n)) + ' ngày</span></div>';
  });

  $('nt-count-calc').addEventListener('click', () => {
    const dl = parseISO($('nt-deadline').value);
    if (!dl) { toast('Vui lòng chọn hạn chót.'); return; }
    const now = new Date();
    const todayD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const left = dayDiff(todayD, dl);
    const res = $('nt-count-result');
    res.hidden = false;
    if (left > 0) {
      res.innerHTML =
        '<div class="result-row"><span>Còn lại</span><strong>' + fmtNum(left) + ' ngày</strong></div>' +
        '<div class="result-row"><span>Hạn chót</span><span>' + fmtDate(dl) + ', ' + WEEKDAYS[dl.getDay()] + ' — tức ' + (left / 7).toFixed(1) + ' tuần nữa</span></div>';
    } else if (left === 0) {
      res.innerHTML = '<div class="result-row"><span>Hạn chót</span><strong>Hôm nay là hạn chót!</strong></div>';
    } else {
      res.innerHTML =
        '<div class="result-row"><span>Đã qua hạn</span><strong>' + fmtNum(-left) + ' ngày</strong></div>' +
        '<div class="result-row"><span>Hạn chót</span><span>' + fmtDate(dl) + ', ' + WEEKDAYS[dl.getDay()] + '</span></div>';
    }
  });
}
