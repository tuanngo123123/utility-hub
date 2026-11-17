// Xem ngày tốt xấu — dùng chung thuật toán lịch âm Việt Nam (tự chứa trong file này).
// Tính: ngày âm + can chi, giờ Hoàng đạo/Hắc đạo (bảng theo chi ngày), trực ngày,
// Tam Nương (3, 7, 13, 18, 22, 27 âm), Nguyệt Kỵ (5, 14, 23 âm) -> chấm điểm kèm lý do.
// Chỉ mang tính tham khảo dân gian.
export const meta = {
  id: 'ngay-tot-xau',
  name: 'Xem ngày tốt xấu',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Xem ngày tốt xấu theo lịch âm: giờ hoàng đạo, trực ngày, Tam Nương, Nguyệt Kỵ, chấm điểm kèm lý do từng điểm.',
  keywords: 'xem ngày tốt xấu, giờ hoàng đạo, trực ngày, tam nương, nguyệt kỵ, ngày hoàng đạo',
  icon: '📅',
  seoTitle: 'Xem ngày tốt xấu — Giờ hoàng đạo, trực ngày | Tiện Ích Hub',
  seoDesc: 'Xem ngày tốt xấu theo lịch âm Việt Nam: giờ hoàng đạo hắc đạo, trực ngày, Tam Nương, Nguyệt Kỵ, chấm điểm kèm lý do rõ ràng.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>📅 Xem ngày tốt xấu</h2><p class="muted">Nhập một ngày dương lịch để xem ngày âm, giờ hoàng đạo, trực ngày và các ngày kiêng theo dân gian.</p></div>
    <div class="grid-3">
      <div class="field"><label for="ntx-d">Ngày</label><input id="ntx-d" type="number" min="1" max="31" value="17"></div>
      <div class="field"><label for="ntx-m">Tháng</label><input id="ntx-m" type="number" min="1" max="12" value="11"></div>
      <div class="field"><label for="ntx-y">Năm</label><input id="ntx-y" type="number" min="1900" max="2100" value="2026"></div>
    </div>
    <button id="ntx-go" class="btn btn-primary" type="button">Xem ngày</button>
    <button id="ntx-today" class="btn btn-ghost" type="button">Hôm nay</button>
    <div id="ntx-out" class="result"></div>
    <p class="note">Thông tin chỉ mang tính tham khảo dân gian, không thay thế quyết định quan trọng trong đời sống. Giờ hoàng đạo tra theo bảng truyền thống ứng với địa chi của ngày.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const PI = Math.PI;
  const TZ = 7;
  const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const MONTH_NAMES = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười một', 'Chạp'];
  const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const TRUC = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];
  const TRUC_MEANING = {
    'Kiến': 'Ngày bắt đầu, hợp khởi sự nhưng nên tránh động thổ lớn.',
    'Trừ': 'Ngày trừ bỏ, hợp dọn dẹp, trừ tà; không hợp khai trương.',
    'Mãn': 'Ngày đầy đủ, hợp cầu tài, khai trương, cưới hỏi.',
    'Bình': 'Ngày bình hòa, mọi việc bình thường, không tốt không xấu.',
    'Định': 'Ngày ổn định, hợp ký kết, đính hôn, xây dựng.',
    'Chấp': 'Ngày nắm giữ, hợp thu hoạch, đòi nợ; tránh kiện tụng.',
    'Phá': 'Ngày phá vỡ, xấu cho cưới hỏi, khai trương, động thổ.',
    'Nguy': 'Ngày nguy hiểm, nên tránh đi xa, leo trèo, làm việc mạo hiểm.',
    'Thành': 'Ngày thành tựu, rất tốt cho khai trương, cưới hỏi, ký kết.',
    'Thu': 'Ngày thu hoạch, hợp thu tiền, gặt hái; tránh xuất hành xa.',
    'Khai': 'Ngày mở ra, rất tốt cho khai trương, mở hàng, bắt đầu việc mới.',
    'Bế': 'Ngày đóng lại, xấu cho khai trương, xuất hành; hợp mai táng.',
  };
  // Trực hoàng đạo (tốt) / hắc đạo (xấu) theo truyền thống.
  const TRUC_GOOD = { 'Kiến': 1, 'Mãn': 1, 'Bình': 1, 'Định': 1, 'Thành': 1, 'Khai': 1 };
  const TRUC_SCORE = { 'Thành': 15, 'Khai': 15, 'Định': 10, 'Mãn': 10, 'Bình': 5, 'Kiến': 5, 'Trừ': 0, 'Thu': -5, 'Chấp': -5, 'Nguy': -10, 'Phá': -15, 'Bế': -15 };
  // Giờ hoàng đạo theo địa chi ngày (6 giờ/ngày). Nhóm ngày có cùng bảng: Tý/Ngọ, Sửu/Mùi,
  // Dần/Thân, Mão/Dậu, Thìn/Tuất, Tỵ/Hợi.
  const HOANG_DAO = {
    'Tý': ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    'Ngọ': ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    'Sửu': ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    'Mùi': ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    'Dần': ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    'Thân': ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    'Mão': ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    'Dậu': ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    'Thìn': ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
    'Tuất': ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
    'Tỵ': ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
    'Hợi': ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
  };
  const HOUR_RANGE = {
    'Tý': '23–1h', 'Sửu': '1–3h', 'Dần': '3–5h', 'Mão': '5–7h', 'Thìn': '7–9h', 'Tỵ': '9–11h',
    'Ngọ': '11–13h', 'Mùi': '13–15h', 'Thân': '15–17h', 'Dậu': '17–19h', 'Tuất': '19–21h', 'Hợi': '21–23h',
  };
  const TAM_NUONG = [3, 7, 13, 18, 22, 27];
  const NGUYET_KY = [5, 14, 23];

  // --- Thuật toán lịch âm (bản rút gọn: chỉ cần dương -> âm + can chi) ---
  function jdFromDate(dd, mm, yy) {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
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
  function dayBranchIndex(dd, mm, yy) {
    const idx = (((jdFromDate(dd, mm, yy) + 49) % 60) + 60) % 60;
    return { stem: idx % 10, branch: idx % 12 };
  }
  function canChiDay(dd, mm, yy) {
    const c = dayBranchIndex(dd, mm, yy);
    return STEMS[c.stem] + ' ' + BRANCHES[c.branch];
  }
  function canChiYear(ly) { return STEMS[(((ly - 4) % 10) + 10) % 10] + ' ' + BRANCHES[(((ly - 4) % 12) + 12) % 12]; }
  function canChiMonth(lm, ly) {
    const yStem = (((ly - 4) % 10) + 10) % 10;
    return STEMS[(yStem * 2 + lm + 1) % 10] + ' ' + BRANCHES[(lm + 1) % 12];
  }

  function show(d, m, y) {
    const out = $('ntx-out');
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y) || y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) {
      out.innerHTML = '<p class="error">Ngày không hợp lệ. Nhập ngày có thật, năm 1900–2100.</p>'; return;
    }
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
      out.innerHTML = '<p class="error">Ngày không hợp lệ. Nhập ngày có thật, năm 1900–2100.</p>'; return;
    }
    const l = solar2lunar(d, m, y);
    const cc = dayBranchIndex(d, m, y);
    const dayBranch = BRANCHES[cc.branch];
    const monthBranch = (l.month + 1) % 12; // tháng 1 = Dần
    const truc = TRUC[((cc.branch - monthBranch) % 12 + 12) % 12];
    const isHoangDao = !!TRUC_GOOD[truc];
    const hd = HOANG_DAO[dayBranch] || [];
    const hacDao = BRANCHES.filter((b) => hd.indexOf(b) === -1);
    const isTamNuong = TAM_NUONG.indexOf(l.day) !== -1;
    const isNguyetKy = NGUYET_KY.indexOf(l.day) !== -1;

    // Chấm điểm: bắt đầu 50, cộng/trừ theo từng yếu tố, kẹp 0–100.
    let score = 50;
    const reasons = [];
    const tScore = TRUC_SCORE[truc] || 0;
    score += tScore;
    reasons.push({ text: 'Trực ' + truc + ' (' + (isHoangDao ? 'hoàng đạo' : 'hắc đạo') + '): ' + TRUC_MEANING[truc], pts: tScore });
    if (isTamNuong) { score -= 20; reasons.push({ text: 'Ngày Tam Nương (mùng ' + l.day + ' âm): dân gian kiêng khai trương, cưới hỏi, xuất hành.', pts: -20 }); }
    if (isNguyetKy) { score -= 15; reasons.push({ text: 'Ngày Nguyệt Kỵ (mùng ' + l.day + ' âm): dân gian cho là ngày nửa đời nửa đoạn, kiêng việc lớn.', pts: -15 }); }
    if (!isTamNuong && !isNguyetKy) { score += 5; reasons.push({ text: 'Không rơi vào Tam Nương hay Nguyệt Kỵ.', pts: 5 }); }
    if (l.day === 1 || l.day === 15) { score += 5; reasons.push({ text: l.day === 1 ? 'Mùng 1 âm: ngày đầu tháng, hợp cúng lễ, khởi đầu nhẹ nhàng.' : 'Rằm (15 âm): ngày trăng tròn, hợp cúng lễ, đoàn viên.', pts: 5 }); }
    score = Math.max(0, Math.min(100, score));
    const verdict = score >= 70 ? 'Ngày tốt' : score >= 45 ? 'Ngày bình thường' : 'Ngày xấu — nên tránh việc lớn';
    const wd = WEEKDAYS[dt.getDay()];

    let h = '<div class="result-row"><span>Dương lịch</span><strong>' + wd + ', ' + d + '/' + m + '/' + y + '</strong></div>'
      + '<div class="result-row"><span>Âm lịch</span><strong>ngày ' + l.day + ' tháng ' + MONTH_NAMES[l.month] + (l.leap ? ' nhuận' : '') + ' năm ' + canChiYear(l.year) + '</strong></div>'
      + '<div class="result-row"><span>Can chi</span><strong>Ngày ' + canChiDay(d, m, y) + ' · Tháng ' + canChiMonth(l.month, l.year) + ' · Năm ' + canChiYear(l.year) + '</strong></div>'
      + '<div class="result-row"><span>Trực ngày</span><strong>' + truc + ' — ' + (isHoangDao ? 'Hoàng đạo' : 'Hắc đạo') + '</strong></div>'
      + '<div class="result-row"><span>Giờ hoàng đạo</span><strong>' + hd.map((b) => b + ' (' + HOUR_RANGE[b] + ')').join(', ') + '</strong></div>'
      + '<div class="result-row"><span>Giờ hắc đạo</span><strong>' + hacDao.map((b) => b + ' (' + HOUR_RANGE[b] + ')').join(', ') + '</strong></div>';
    if (isTamNuong) h += '<div class="result-row"><span>Ngày kiêng</span><strong>Tam Nương</strong></div>';
    if (isNguyetKy) h += '<div class="result-row"><span>Ngày kiêng</span><strong>Nguyệt Kỵ</strong></div>';
    h += '<div class="result-row"><span>Điểm tổng</span><strong>' + score + '/100 — ' + verdict + '</strong></div>';
    h += '<p><strong>Lý do từng điểm:</strong></p>';
    reasons.forEach((r) => {
      h += '<div class="result-row"><span>' + r.text + '</span><strong>' + (r.pts > 0 ? '+' + r.pts : r.pts) + '</strong></div>';
    });
    out.innerHTML = h;
  }

  const now = new Date();
  $('ntx-d').value = now.getDate();
  $('ntx-m').value = now.getMonth() + 1;
  $('ntx-y').value = now.getFullYear();
  $('ntx-go').addEventListener('click', () => {
    show(parseInt($('ntx-d').value, 10), parseInt($('ntx-m').value, 10), parseInt($('ntx-y').value, 10));
  });
  $('ntx-today').addEventListener('click', () => {
    const t = new Date();
    $('ntx-d').value = t.getDate();
    $('ntx-m').value = t.getMonth() + 1;
    $('ntx-y').value = t.getFullYear();
    show(t.getDate(), t.getMonth() + 1, t.getFullYear());
  });
  show(now.getDate(), now.getMonth() + 1, now.getFullYear());
}
