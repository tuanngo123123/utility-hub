// Tính ngày kỷ niệm — đã bên nhau bao lâu, mốc tiếp theo là khi nào.
export const meta = {
  id: 'tinh-ngay-ky-niem',
  name: 'Tính ngày kỷ niệm: đã bên nhau bao lâu',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập ngày bắt đầu (ngày cưới, ngày yêu nhau, ngày thành lập…) để biết đã qua bao nhiêu ngày, và mốc kỷ niệm tiếp theo — 100 ngày, 1.000 ngày, kỷ niệm năm — rơi vào ngày nào.',
  keywords: 'tính ngày kỷ niệm, đã yêu nhau bao nhiêu ngày, kỷ niệm 100 ngày, kỷ niệm ngày cưới, đếm ngày yêu nhau',
  icon: '💞',
  seoTitle: 'Tính ngày kỷ niệm — Đã bên nhau bao nhiêu ngày, mốc tiếp theo',
  seoDesc: 'Tính đã bên nhau bao nhiêu ngày/tuần/tháng, mốc 100 ngày, 1.000 ngày và kỷ niệm năm tiếp theo rơi vào ngày nào, còn bao nhiêu ngày nữa.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Ngày cưới, ngày yêu nhau, ngày công ty thành lập — nhập ngày bắt đầu để đếm hành trình và đón mốc tiếp theo.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="tkn-start">Ngày bắt đầu</label>
      <input id="tkn-start" type="date" value="2020-02-14">
    </div>
    <div class="field">
      <label for="tkn-today">Tính tới ngày (để trống = hôm nay)</label>
      <input id="tkn-today" type="date">
    </div>
  </div>
  <div class="field">
    <label for="tkn-name">Tên dịp (không bắt buộc)</label>
    <input id="tkn-name" type="text" placeholder="Ví dụ: Ngày cưới, Ngày yêu nhau" maxlength="40">
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="tkn-calc">Tính kỷ niệm</button>
    <button type="button" class="btn btn-ghost" id="tkn-example">Điền ví dụ</button>
  </div>
  <div id="tkn-out"></div>
  <p class="note">Tên gọi kỷ niệm năm cưới theo lệ thường: 1 năm đám cưới Giấy, 5 năm Gỗ, 10 năm Thiếc, 15 năm Pha lê, 20 năm Sứ, 25 năm Bạc, 30 năm Ngọc trai, 40 năm Hồng ngọc, 50 năm Vàng, 60 năm Kim cương.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => n.toLocaleString('vi-VN'));
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tkn-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const YEAR_NAMES = { 1: 'Giấy', 2: 'Bông', 3: 'Da', 4: 'Lanh', 5: 'Gỗ', 6: 'Sắt', 7: 'Len', 8: 'Đồng', 9: 'Gốm', 10: 'Thiếc', 11: 'Thép', 12: 'Tơ lụa', 13: 'Ren', 14: 'Ngà', 15: 'Pha lê', 20: 'Sứ', 25: 'Bạc', 30: 'Ngọc trai', 35: 'San hô', 40: 'Hồng ngọc', 45: 'Sapphire', 50: 'Vàng', 55: 'Lục bảo', 60: 'Kim cương', 70: 'Bạch kim' };
  const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  function parseDate(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  function fmtDate(d) {
    return WEEKDAYS[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }
  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function dayDiff(a, b) { return Math.round((b - a) / 86400000); }

  function calc() {
    clearErrs(root);
    const out = $('tkn-out');
    const start = parseDate($('tkn-start').value);
    if (!start) {
      markErr($('tkn-start'), 'Ô Ngày bắt đầu chưa đúng — chọn một ngày hợp lệ.');
      focusEl($('tkn-start'));
      out.innerHTML = '';
      return;
    }
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const toVal = $('tkn-today').value.trim();
    if (toVal) {
      const parsed = parseDate(toVal);
      if (!parsed) {
        markErr($('tkn-today'), 'Ô Tính tới ngày chưa đúng — chọn một ngày hợp lệ hoặc để trống.');
        focusEl($('tkn-today'));
        out.innerHTML = '';
        return;
      }
      today = parsed;
    }
    if (start > today) {
      markErr($('tkn-start'), 'Ngày bắt đầu nằm sau ngày tính tới — chọn ngày bắt đầu trong quá khứ.');
      focusEl($('tkn-start'));
      out.innerHTML = '';
      return;
    }
    const name = $('tkn-name').value.trim();
    const title = name ? escHtml(name) : 'Hành trình';
    const days = dayDiff(start, today);
    const weeks = Math.floor(days / 7);
    // Chia năm/tháng/ngày theo lịch.
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let dLeft = today.getDate() - start.getDate();
    if (dLeft < 0) { months -= 1; const prev = new Date(today.getFullYear(), today.getMonth(), 0); dLeft += prev.getDate(); }
    if (months < 0) { years -= 1; months += 12; }
    const ymd = (years ? years + ' năm ' : '') + (months ? months + ' tháng ' : '') + dLeft + ' ngày';
    // Mốc ngày tiếp theo: 100, 200, ... 1000, 2000, ...
    const milestones = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 3000, 4000, 5000, 10000];
    let nextMilestone = null;
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i] > days) { nextMilestone = milestones[i]; break; }
    }
    if (nextMilestone === null) nextMilestone = (Math.floor(days / 1000) + 1) * 1000;
    const milestoneDate = addDays(start, nextMilestone);
    const milestoneLeft = nextMilestone - days;
    // Kỷ niệm năm tiếp theo.
    const nextYearCount = years + 1;
    let anniDate = new Date(start.getFullYear() + nextYearCount, start.getMonth(), start.getDate());
    if (anniDate < today) { anniDate = new Date(start.getFullYear() + nextYearCount + 1, start.getMonth(), start.getDate()); }
    const anniYears = anniDate.getFullYear() - start.getFullYear();
    const anniLeft = dayDiff(today, anniDate);
    const anniName = YEAR_NAMES[anniYears] ? ' — đám cưới ' + YEAR_NAMES[anniYears] : '';
    const copyText = (name || 'Kỷ niệm') + ': từ ' + fmtDate(start) + ' đến ' + fmtDate(today) + ' là ' + days + ' ngày (' + ymd.trim() + '). Mốc ' + nextMilestone + ' ngày vào ' + fmtDate(milestoneDate) + ' (còn ' + milestoneLeft + ' ngày). Kỷ niệm ' + anniYears + ' năm vào ' + fmtDate(anniDate) + ' (còn ' + anniLeft + ' ngày).';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">${title} — đã qua</p>
    <div class="result-hero-value">${fmtNum(days)} ngày</div>
    <p class="result-hero-sub">Tức ${ymd.trim()} · ${fmtNum(weeks)} tuần · Từ ${fmtDate(start)}</p>
  </div>
  <div class="result-row"><span>Mốc ngày tiếp theo</span><strong>${fmtNum(nextMilestone)} ngày — ${fmtDate(milestoneDate)} (còn ${fmtNum(milestoneLeft)} ngày)</strong></div>
  <div class="result-row"><span>Kỷ niệm năm tiếp theo</span><strong>${anniYears} năm${anniName} — ${fmtDate(anniDate)} (còn ${fmtNum(anniLeft)} ngày)</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả kỷ niệm">Chép kết quả</button></div>
</div>`;
    bindCopy(out);
  }

  function runCalc() { withBusy($('tkn-calc'), calc); }
  $('tkn-calc').addEventListener('click', runCalc);
  $('tkn-start').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: yêu nhau từ Valentine 2020.
  $('tkn-example').addEventListener('click', () => {
    fillEx(root, { 'tkn-start': '2020-02-14', 'tkn-today': '', 'tkn-name': 'Ngày yêu nhau' }, $('tkn-calc'));
  });
  calc();
}
