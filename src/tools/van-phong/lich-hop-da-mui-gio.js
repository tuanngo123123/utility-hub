// Lên lịch họp đa múi giờ — tìm khung giờ làm việc trùng nhau của 2–3 thành phố.
export const meta = {
  id: 'lich-hop-da-mui-gio',
  name: 'Lên lịch họp đa múi giờ',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Chọn 2–3 thành phố, xem ngay khung giờ làm việc trùng nhau trong ngày để đặt lịch họp quốc tế không ai phải thức đêm.',
  keywords: 'lịch họp đa múi giờ, giờ họp chung, họp quốc tế mấy giờ, múi giờ họp, tìm giờ họp chung, meeting time zone, world clock meeting',
  icon: '🌍',
  seoTitle: 'Lên lịch họp đa múi giờ — Tìm giờ họp chung nhiều thành phố',
  seoDesc: 'Chọn 2–3 thành phố để tìm khung giờ làm việc trùng nhau (mặc định 9h–17h giờ địa phương mỗi nơi) và đặt lịch họp quốc tế.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🌍</span><div><h2>Lên lịch họp đa múi giờ</h2><p class="muted">Họp với đối tác nước ngoài mà không ai phải thức đêm: chọn các thành phố, công cụ tìm giờ làm việc trùng nhau.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="lhg-city1">Thành phố 1</label><select id="lhg-city1"></select></div>
    <div class="field"><label for="lhg-city2">Thành phố 2</label><select id="lhg-city2"></select></div>
    <div class="field"><label for="lhg-city3">Thành phố 3 (tùy chọn)</label><select id="lhg-city3"></select></div>
    <div class="field"><label for="lhg-date">Ngày họp</label><input id="lhg-date" type="date"></div>
    <div class="field"><label for="lhg-start">Giờ làm việc bắt đầu (giờ địa phương mỗi nơi)</label><select id="lhg-start"></select></div>
    <div class="field"><label for="lhg-end">Giờ làm việc kết thúc</label><select id="lhg-end"></select></div>
  </div>
  <button type="button" class="btn btn-primary" id="lhg-go">Tìm giờ họp chung</button>
  <div id="lhg-out"></div>
  <p class="note">Giờ làm việc mặc định 9:00–17:00 giờ địa phương mỗi thành phố. Múi giờ tính theo ngày đã chọn nên đã tính cả giờ mùa hè (DST) nếu có.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const todayISO = U.todayISO || (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const $ = id => root.querySelector('#' + id);

  const CITIES = [
    ['Hà Nội', 'Asia/Ho_Chi_Minh'],
    ['Bangkok', 'Asia/Bangkok'],
    ['Singapore', 'Asia/Singapore'],
    ['Hồng Kông', 'Asia/Hong_Kong'],
    ['Tokyo', 'Asia/Tokyo'],
    ['Seoul', 'Asia/Seoul'],
    ['Sydney', 'Australia/Sydney'],
    ['Mumbai', 'Asia/Kolkata'],
    ['Dubai', 'Asia/Dubai'],
    ['London', 'Europe/London'],
    ['Paris', 'Europe/Paris'],
    ['Berlin', 'Europe/Berlin'],
    ['New York', 'America/New_York'],
    ['Chicago', 'America/Chicago'],
    ['Los Angeles', 'America/Los_Angeles'],
  ];

  function fillCities(sel, selected, withNone) {
    let html = '';
    if (withNone) html += '<option value="">— Không chọn —</option>';
    CITIES.forEach(c => {
      html += '<option value="' + c[1] + '"' + (c[1] === selected ? ' selected' : '') + '>' + c[0] + '</option>';
    });
    sel.innerHTML = html;
  }
  fillCities($('lhg-city1'), 'Asia/Ho_Chi_Minh', false);
  fillCities($('lhg-city2'), 'Asia/Singapore', false);
  fillCities($('lhg-city3'), 'Asia/Tokyo', true);

  let hoursHtml = '';
  for (let h = 0; h <= 23; h++) hoursHtml += '<option value="' + h + '">' + String(h).padStart(2, '0') + ':00</option>';
  $('lhg-start').innerHTML = hoursHtml;
  $('lhg-end').innerHTML = hoursHtml;
  $('lhg-start').value = '9';
  $('lhg-end').value = '17';
  $('lhg-date').value = todayISO();

  function cityName(tz) {
    const c = CITIES.filter(x => x[1] === tz)[0];
    return c ? c[0] : tz;
  }
  // Độ lệch múi giờ (phút) của tz so với UTC tại thời điểm date.
  function tzOffsetMin(date, tz) {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const p = {};
    fmt.formatToParts(date).forEach(x => { p[x.type] = x.value; });
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  }
  function fmtHM(totalMin) {
    const m = ((totalMin % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  function fmtUTC(totalMin) {
    return fmtHM(totalMin) + ' UTC';
  }

  function find() {
    const tzList = [$('lhg-city1').value, $('lhg-city2').value, $('lhg-city3').value].filter(Boolean);
    const seen = {};
    for (let i = 0; i < tzList.length; i++) {
      if (seen[tzList[i]]) { $('lhg-out').innerHTML = '<p class="error">Mỗi thành phố chỉ chọn một lần — hãy chọn các thành phố khác nhau.</p>'; return; }
      seen[tzList[i]] = true;
    }
    const startH = +$('lhg-start').value, endH = +$('lhg-end').value;
    if (endH <= startH) { $('lhg-out').innerHTML = '<p class="error">Giờ kết thúc phải sau giờ bắt đầu.</p>'; return; }
    const dateVal = $('lhg-date').value;
    if (!dateVal) { $('lhg-out').innerHTML = '<p class="error">Hãy chọn ngày họp.</p>'; return; }
    const parts = dateVal.split('-').map(Number);
    const dayStartUTC = Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
    const workStart = startH * 60, workEnd = endH * 60;

    // 48 khung nửa giờ trong ngày (giờ UTC).
    const slots = [];
    for (let s = 0; s < 48; s++) {
      const utcMin = s * 30;
      const locals = tzList.map(tz => {
        const off = tzOffsetMin(new Date(dayStartUTC + utcMin * 60000), tz);
        return utcMin + off;
      });
      const allWork = locals.every(lm => {
        const m = ((lm % 1440) + 1440) % 1440;
        return m >= workStart && m < workEnd;
      });
      slots.push({ utcMin, locals, allWork });
    }

    // Cửa sổ làm việc của từng thành phố (theo giờ UTC).
    const windows = tzList.map((tz, ci) => {
      const workSlots = slots.filter(s => {
        const m = ((s.locals[ci] % 1440) + 1440) % 1440;
        return m >= workStart && m < workEnd;
      });
      if (!workSlots.length) return null;
      return { name: cityName(tz), from: workSlots[0].utcMin, to: workSlots[workSlots.length - 1].utcMin + 30 };
    });

    // Gộp các khung trùng thành khoảng liên tục.
    const ranges = [];
    let cur = null;
    slots.forEach(s => {
      if (s.allWork) {
        if (!cur) cur = { from: s.utcMin, to: s.utcMin + 30 };
        else cur.to = s.utcMin + 30;
      } else if (cur) { ranges.push(cur); cur = null; }
    });
    if (cur) ranges.push(cur);

    let html = '<div class="result">';
    windows.forEach(w => {
      if (!w) return;
      html += '<div class="result-row"><span>Giờ làm việc ở ' + w.name + '</span><strong>' + fmtUTC(w.from) + ' – ' + fmtUTC(w.to) + '</strong></div>';
    });
    if (ranges.length) {
      ranges.forEach(r => {
        const localStr = tzList.map((tz, ci) => {
          const s0 = slots.filter(x => x.utcMin === r.from)[0];
          const s1 = slots.filter(x => x.utcMin === (r.to - 30 + 1440) % 1440)[0];
          const fromL = s0 ? fmtHM(s0.locals[ci]) : '';
          const toL = s1 ? fmtHM(s1.locals[ci] + 30) : '';
          return cityName(tz) + ' ' + fromL + '–' + toL;
        }).join(' · ');
        html += '<div class="result-row"><span>✅ Giờ họp chung</span><strong>' + fmtUTC(r.from) + ' – ' + fmtUTC(r.to) + '<br><span class="muted">' + localStr + '</span></strong></div>';
      });
    } else {
      html += '<div class="result-row"><span>Giờ họp chung</span><strong>Không có khung giờ làm việc chung trong ngày này.</strong></div>';
      html += '<div class="result-row"><span>Gợi ý</span><span>Thử nới giờ làm việc (Ví dụ: 8:00–18:00), bớt một thành phố, hoặc họp 2 ca riêng.</span></div>';
    }
    html += '</div>';

    // Bảng 24 giờ: giờ UTC + giờ địa phương từng nơi + đánh dấu khung chung.
    html += '<table class="tbl"><thead><tr><th>Giờ UTC</th>' + tzList.map(tz => '<th>' + cityName(tz) + '</th>').join('') + '<th>Chung?</th></tr></thead><tbody>';
    for (let h = 0; h < 24; h++) {
      const s0 = slots[h * 2], s1 = slots[h * 2 + 1];
      const mark = (s0.allWork && s1.allWork) ? '✅ Cả giờ' : (s0.allWork || s1.allWork) ? '◐ Nửa giờ' : '—';
      html += '<tr><td>' + String(h).padStart(2, '0') + ':00</td>' +
        s0.locals.map(lm => '<td>' + fmtHM(lm) + '</td>').join('') +
        '<td>' + mark + '</td></tr>';
    }
    html += '</tbody></table>';
    $('lhg-out').innerHTML = html;
  }

  $('lhg-go').addEventListener('click', find);
  find();
}
