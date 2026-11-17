// Lịch âm hôm nay & lịch tháng — tính TRÊN MÁY bằng thuật toán thiên văn công khai
// (chuỗi tính sóc/new moon + kinh độ Mặt Trời theo Jean Meeus; quy ước lịch Việt Nam:
// múi giờ +7, tháng 11 âm chứa Đông chí, tháng nhuận là tháng không có trung khí).
// Đã đối chiếu: 17/02/2026 = 1/1 Bính Ngọ; 17/11/2026 = 9/10 Bính Ngọ; 01/01/2026 = 13/11 Ất Tỵ.
export const meta = {
  id: 'lich-am',
  name: 'Lịch âm hôm nay & lịch tháng',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Đổi dương lịch sang âm lịch Việt Nam, xem can chi ngày/tháng/năm, lịch tháng và chuyển đổi ngày bất kỳ cả hai chiều.',
  keywords: 'lịch âm, âm lịch, đổi lịch âm dương, can chi, lịch tháng, mùng 1, ngày rằm',
  icon: '🌙',
  seoTitle: 'Lịch âm hôm nay — Đổi dương lịch sang âm lịch | Tiện Ích Hub',
  seoDesc: 'Xem lịch âm hôm nay, can chi ngày tháng năm, lịch tháng âm dương và chuyển đổi ngày bất kỳ giữa dương lịch và âm lịch Việt Nam.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>🌙 Lịch âm hôm nay &amp; lịch tháng</h2><p class="muted">Tính ngay trên máy của bạn theo quy ước lịch Việt Nam (múi giờ +7). Không cần mạng.</p></div>
    <div id="la-today" class="result"></div>
    <h3>Chuyển đổi ngày bất kỳ</h3>
    <div class="tabs">
      <button id="la-tab-s2l" class="tab tab-active" type="button">Dương → Âm</button>
      <button id="la-tab-l2s" class="tab" type="button">Âm → Dương</button>
    </div>
    <div id="la-pane-s2l">
      <div class="grid-3">
        <div class="field"><label for="la-sd">Ngày dương</label><input id="la-sd" type="number" min="1" max="31" value="17"></div>
        <div class="field"><label for="la-sm">Tháng dương</label><input id="la-sm" type="number" min="1" max="12" value="11"></div>
        <div class="field"><label for="la-sy">Năm dương</label><input id="la-sy" type="number" min="1900" max="2100" value="2026"></div>
      </div>
      <button id="la-go-s2l" class="btn btn-primary" type="button">Đổi sang âm lịch</button>
    </div>
    <div id="la-pane-l2s">
      <div class="grid-3">
        <div class="field"><label for="la-ld">Ngày âm</label><input id="la-ld" type="number" min="1" max="30" value="1"></div>
        <div class="field"><label for="la-lm">Tháng âm</label><input id="la-lm" type="number" min="1" max="12" value="1"></div>
        <div class="field"><label for="la-ly">Năm âm</label><input id="la-ly" type="number" min="1900" max="2100" value="2026"></div>
      </div>
      <div class="field"><label><input id="la-leap" type="checkbox"> Tháng nhuận</label></div>
      <button id="la-go-l2s" class="btn btn-primary" type="button">Đổi sang dương lịch</button>
    </div>
    <div id="la-convert-out" class="result"></div>
    <h3>Lịch tháng</h3>
    <div class="grid-3">
      <div class="field"><label for="la-cm">Tháng</label><input id="la-cm" type="number" min="1" max="12" value="11"></div>
      <div class="field"><label for="la-cy">Năm</label><input id="la-cy" type="number" min="1900" max="2100" value="2026"></div>
      <div class="field"><label>&nbsp;</label><button id="la-go-cal" class="btn btn-primary" type="button">Xem lịch tháng</button></div>
    </div>
    <div id="la-cal"></div>
    <p class="note">Âm lịch tính theo giờ Việt Nam. Ngày âm bắt đầu từ 0h (quy ước phổ biến trên lịch vạn niên). Can chi tháng/năm tính theo lịch âm.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const PI = Math.PI;
  const TZ = 7; // múi giờ Việt Nam
  const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const MONTH_NAMES = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười một', 'Chạp'];
  const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  function jdFromDate(dd, mm, yy) {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }
  function jdToDate(jd) {
    const j = jd + 1401 + Math.floor((Math.floor((4 * jd + 274277) / 146097) * 3) / 4) - 38;
    const e = 4 * j + 3;
    const g = Math.floor((e % 1461) / 4);
    const h = 5 * g + 2;
    const D = Math.floor((h % 153) / 5) + 1;
    const M = ((Math.floor(h / 153) + 2) % 12) + 1;
    const Y = Math.floor(e / 1461) - 4716 + Math.floor((14 - M) / 12);
    return { d: D, m: M, y: Y };
  }
  function newMoon(k) {
    const T = k / 1236.85;
    const T2 = T * T, T3 = T2 * T;
    const dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr) - 0.0004 * Math.sin(3 * dr * Mpr);
    C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr));
    C1 += 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (M + 2 * Mpr));
    return Jd1 + C1;
  }
  function sunLongitude(jdn) {
    const T = (jdn - 2451545.0) / 36525;
    const T2 = T * T;
    const dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T2 * T;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) % 360;
    if (L < 0) L += 360;
    return L * dr;
  }
  function newMoonDay(k) { return Math.floor(newMoon(k) + 0.5 + TZ / 24); }
  function sunLongIndex(dayNumber) { return Math.floor(sunLongitude(dayNumber - 0.5 - TZ / 24) / (PI / 6)); }
  function lunarMonth11(yy) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = newMoonDay(k);
    if (sunLongIndex(nm) >= 9) nm = newMoonDay(k - 1);
    return nm;
  }
  function leapMonthOffset(a11) {
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0, i = 1;
    let arc = sunLongIndex(newMoonDay(k + i));
    while (arc !== last && i < 14) { last = arc; i++; arc = sunLongIndex(newMoonDay(k + i)); }
    return i - 1;
  }
  function solar2lunar(dd, mm, yy) {
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = newMoonDay(k + 1);
    if (monthStart > dayNumber) monthStart = newMoonDay(k);
    let a11 = lunarMonth11(yy);
    let b11 = a11;
    let lunarYear = yy;
    if (a11 >= monthStart) { a11 = lunarMonth11(yy - 1); } else { b11 = lunarMonth11(yy + 1); }
    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = 0;
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      const leapDiff = leapMonthOffset(a11);
      if (diff >= leapDiff) { lunarMonth = diff + 10; if (diff === leapDiff) lunarLeap = 1; }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap === 1 };
  }
  function lunar2solar(lDay, lMonth, lYear, leap) {
    const a11 = lunarMonth11(lYear - 1);
    const b11 = lunarMonth11(lYear);
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let off = lMonth === 11 ? 12 : lMonth === 12 ? 13 : lMonth + 1;
    if (b11 - a11 > 365) {
      const leapDiff = leapMonthOffset(a11);
      if (leap) off = leapDiff;
      else if (off >= leapDiff) off += 1;
    }
    return jdToDate(newMoonDay(k + off) + lDay - 1);
  }
  function canChiDay(dd, mm, yy) {
    const idx = (((jdFromDate(dd, mm, yy) + 49) % 60) + 60) % 60;
    return STEMS[idx % 10] + ' ' + BRANCHES[idx % 12];
  }
  function canChiYear(ly) { return STEMS[(((ly - 4) % 10) + 10) % 10] + ' ' + BRANCHES[(((ly - 4) % 12) + 12) % 12]; }
  function canChiMonth(lm, ly) {
    const yStem = (((ly - 4) % 10) + 10) % 10;
    return STEMS[(yStem * 2 + lm + 1) % 10] + ' ' + BRANCHES[(lm + 1) % 12];
  }
  function lunarText(l) {
    return 'ngày ' + l.day + ' tháng ' + MONTH_NAMES[l.month] + (l.leap ? ' nhuận' : '') + ' năm ' + canChiYear(l.year);
  }
  function validSolar(d, m, y) {
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return false;
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return false;
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }
  function showSolar(dd, mm, yy, el) {
    const l = solar2lunar(dd, mm, yy);
    const wd = WEEKDAYS[new Date(yy, mm - 1, dd).getDay()];
    el.innerHTML = '<div class="result-row"><span>Dương lịch</span><strong>' + wd + ', ' + dd + '/' + mm + '/' + yy + '</strong></div>'
      + '<div class="result-row"><span>Âm lịch</span><strong>' + lunarText(l) + ' (' + l.day + '/' + l.month + '/' + l.year + (l.leap ? ' nhuận' : '') + ')</strong></div>'
      + '<div class="result-row"><span>Can chi ngày</span><strong>' + canChiDay(dd, mm, yy) + '</strong></div>'
      + '<div class="result-row"><span>Can chi tháng</span><strong>' + canChiMonth(l.month, l.year) + '</strong></div>'
      + '<div class="result-row"><span>Can chi năm</span><strong>' + canChiYear(l.year) + '</strong></div>';
  }

  // Hôm nay
  const now = new Date();
  $('la-sd').value = now.getDate();
  $('la-sm').value = now.getMonth() + 1;
  $('la-sy').value = now.getFullYear();
  $('la-cm').value = now.getMonth() + 1;
  $('la-cy').value = now.getFullYear();
  showSolar(now.getDate(), now.getMonth() + 1, now.getFullYear(), $('la-today'));

  // Tabs chuyển đổi
  function setTab(which) {
    $('la-tab-s2l').className = 'tab' + (which === 's2l' ? ' tab-active' : '');
    $('la-tab-l2s').className = 'tab' + (which === 'l2s' ? ' tab-active' : '');
    $('la-pane-s2l').toggleAttribute('hidden', which !== 's2l');
    $('la-pane-l2s').toggleAttribute('hidden', which !== 'l2s');
  }
  $('la-tab-s2l').addEventListener('click', () => setTab('s2l'));
  $('la-tab-l2s').addEventListener('click', () => setTab('l2s'));
  setTab('s2l');

  $('la-go-s2l').addEventListener('click', () => {
    const d = parseInt($('la-sd').value, 10), m = parseInt($('la-sm').value, 10), y = parseInt($('la-sy').value, 10);
    const out = $('la-convert-out');
    if (!validSolar(d, m, y)) { out.innerHTML = '<p class="error">Ngày dương không hợp lệ. Nhập ngày có thật, năm 1900–2100.</p>'; return; }
    showSolar(d, m, y, out);
  });

  $('la-go-l2s').addEventListener('click', () => {
    const d = parseInt($('la-ld').value, 10), m = parseInt($('la-lm').value, 10), y = parseInt($('la-ly').value, 10);
    const leap = $('la-leap').checked;
    const out = $('la-convert-out');
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y) || d < 1 || d > 30 || m < 1 || m > 12 || y < 1900 || y > 2100) {
      out.innerHTML = '<p class="error">Ngày âm không hợp lệ. Ngày 1–30, tháng 1–12, năm 1900–2100.</p>'; return;
    }
    const s = lunar2solar(d, m, y, leap);
    const check = solar2lunar(s.d, s.m, s.y);
    if (check.day !== d || check.month !== m || check.year !== y || check.leap !== leap) {
      out.innerHTML = '<p class="error">Ngày âm này không tồn tại (tháng thiếu chỉ có 29 ngày, hoặc năm ' + y + ' không có tháng ' + m + ' nhuận).</p>';
      return;
    }
    const wd = WEEKDAYS[new Date(s.y, s.m - 1, s.d).getDay()];
    out.innerHTML = '<div class="result-row"><span>Âm lịch</span><strong>ngày ' + d + ' tháng ' + MONTH_NAMES[m] + (leap ? ' nhuận' : '') + ' năm ' + canChiYear(y) + '</strong></div>'
      + '<div class="result-row"><span>Dương lịch</span><strong>' + wd + ', ' + s.d + '/' + s.m + '/' + s.y + '</strong></div>'
      + '<div class="result-row"><span>Can chi ngày</span><strong>' + canChiDay(s.d, s.m, s.y) + '</strong></div>';
  });

  function renderCalendar() {
    const m = parseInt($('la-cm').value, 10), y = parseInt($('la-cy').value, 10);
    const box = $('la-cal');
    if (!Number.isInteger(m) || !Number.isInteger(y) || m < 1 || m > 12 || y < 1900 || y > 2100) {
      box.innerHTML = '<p class="error">Tháng/năm không hợp lệ.</p>'; return;
    }
    const daysInMonth = new Date(y, m, 0).getDate();
    const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Thứ 2 = 0
    let h = '<table class="tbl"><tr><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th></tr><tr>';
    for (let i = 0; i < firstDow; i++) h += '<td></td>';
    for (let d = 1; d <= daysInMonth; d++) {
      const l = solar2lunar(d, m, y);
      const isToday = d === now.getDate() && m === now.getMonth() + 1 && y === now.getFullYear();
      const lunarLabel = (l.day === 1 ? '1/' + l.month : l.day) + (l.leap ? 'N' : '');
      h += '<td>' + (isToday ? '<strong>' + d + '</strong>' : d) + '<br><small>' + lunarLabel + '</small></td>';
      if ((firstDow + d) % 7 === 0 && d < daysInMonth) h += '</tr><tr>';
    }
    const filled = (firstDow + daysInMonth) % 7;
    if (filled !== 0) for (let i = filled; i < 7; i++) h += '<td></td>';
    h += '</tr></table><p class="muted">Số lớn: ngày dương. Số nhỏ: ngày âm (mùng 1 ghi kèm tháng, "N" = tháng nhuận). Ngày in đậm là hôm nay.</p>';
    box.innerHTML = h;
  }
  $('la-go-cal').addEventListener('click', renderCalendar);
  renderCalendar();
}
