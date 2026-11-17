export const meta = {
  id: 'doi-gio-quoc-te',
  name: 'Đổi giờ quốc tế',
  category: 'Du lịch',
  categorySlug: 'du-lich',
  desc: 'Chọn giờ ở một thành phố để xem giờ tương ứng cùng lúc ở ~20 thành phố khác trên thế giới.',
  keywords: ['đổi giờ', 'múi giờ', 'giờ quốc tế', 'giờ thế giới', 'chênh lệch giờ'],
  icon: '🕐',
  seoTitle: 'Đổi giờ quốc tế — Giờ ở các thành phố trên thế giới',
  seoDesc: 'Chọn giờ ở một thành phố, xem ngay giờ tương ứng ở Hà Nội, Tokyo, London, New York và ~20 thành phố khác.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🕐 Đổi giờ quốc tế</h2>
      <p class="muted">Chọn ngày giờ ở một thành phố để xem cùng lúc đó là mấy giờ ở các thành phố khác.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="dgqt-ngay">Ngày giờ</label>
        <input id="dgqt-ngay" type="datetime-local" value="2026-11-17T12:00">
      </div>
      <div class="field">
        <label for="dgqt-goc">Giờ này là giờ ở thành phố</label>
        <select id="dgqt-goc">
          <option value="Asia/Ho_Chi_Minh" selected>Hà Nội / TP.HCM (Việt Nam)</option>
          <option value="Asia/Bangkok">Bangkok (Thái Lan)</option>
          <option value="Asia/Singapore">Singapore</option>
          <option value="Asia/Kuala_Lumpur">Kuala Lumpur (Malaysia)</option>
          <option value="Asia/Jakarta">Jakarta (Indonesia)</option>
          <option value="Asia/Manila">Manila (Philippines)</option>
          <option value="Asia/Hong_Kong">Hồng Kông</option>
          <option value="Asia/Taipei">Đài Bắc (Đài Loan)</option>
          <option value="Asia/Shanghai">Thượng Hải (Trung Quốc)</option>
          <option value="Asia/Tokyo">Tokyo (Nhật Bản)</option>
          <option value="Asia/Seoul">Seoul (Hàn Quốc)</option>
          <option value="Asia/Kolkata">New Delhi (Ấn Độ)</option>
          <option value="Asia/Dubai">Dubai (UAE)</option>
          <option value="Australia/Sydney">Sydney (Úc)</option>
          <option value="Europe/London">London (Anh)</option>
          <option value="Europe/Paris">Paris (Pháp)</option>
          <option value="Europe/Berlin">Berlin (Đức)</option>
          <option value="Europe/Moscow">Moscow (Nga)</option>
          <option value="America/New_York">New York (Mỹ)</option>
          <option value="America/Los_Angeles">Los Angeles (Mỹ)</option>
          <option value="America/Toronto">Toronto (Canada)</option>
          <option value="America/Sao_Paulo">São Paulo (Brazil)</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" id="dgqt-calc">Đổi giờ</button>
    <div id="dgqt-out" class="result" style="display:none"></div>
    <p class="note">Giờ hiển thị đã tính giờ mùa hè (DST) tại các nơi áp dụng. Kết quả dựa trên múi giờ chuẩn của trình duyệt.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var CITIES = [
    { name: 'Hà Nội / TP.HCM', tz: 'Asia/Ho_Chi_Minh' },
    { name: 'Bangkok', tz: 'Asia/Bangkok' },
    { name: 'Singapore', tz: 'Asia/Singapore' },
    { name: 'Kuala Lumpur', tz: 'Asia/Kuala_Lumpur' },
    { name: 'Jakarta', tz: 'Asia/Jakarta' },
    { name: 'Manila', tz: 'Asia/Manila' },
    { name: 'Hồng Kông', tz: 'Asia/Hong_Kong' },
    { name: 'Đài Bắc', tz: 'Asia/Taipei' },
    { name: 'Thượng Hải', tz: 'Asia/Shanghai' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
    { name: 'Seoul', tz: 'Asia/Seoul' },
    { name: 'New Delhi', tz: 'Asia/Kolkata' },
    { name: 'Dubai', tz: 'Asia/Dubai' },
    { name: 'Sydney', tz: 'Australia/Sydney' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Paris', tz: 'Europe/Paris' },
    { name: 'Berlin', tz: 'Europe/Berlin' },
    { name: 'Moscow', tz: 'Europe/Moscow' },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'Los Angeles', tz: 'America/Los_Angeles' },
    { name: 'Toronto', tz: 'America/Toronto' },
    { name: 'São Paulo', tz: 'America/Sao_Paulo' }
  ];
  function tzOffsetMinutes(date, tz) {
    var dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var map = {};
    dtf.formatToParts(date).forEach(function (p) { map[p.type] = p.value; });
    var asUTC = Date.UTC(+map.year, +map.month - 1, +map.day, (+map.hour) % 24, +map.minute, +map.second);
    return (asUTC - date.getTime()) / 60000;
  }
  function zonedToUtc(y, mo, d, h, mi, tz) {
    var guess = new Date(Date.UTC(y, mo - 1, d, h, mi));
    var off = tzOffsetMinutes(guess, tz);
    var utc = new Date(guess.getTime() - off * 60000);
    var off2 = tzOffsetMinutes(utc, tz);
    if (off2 !== off) utc = new Date(guess.getTime() - off2 * 60000);
    return utc;
  }
  function fmtInZone(date, tz) {
    return new Intl.DateTimeFormat('vi-VN', { timeZone: tz, hour12: false, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }
  function calc() {
    var val = root.querySelector('#dgqt-ngay').value;
    var srcTz = root.querySelector('#dgqt-goc').value;
    var out = root.querySelector('#dgqt-out');
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(val || '');
    if (!m) {
      out.style.display = 'block';
      out.innerHTML = '<p class="error">Vui lòng chọn ngày và giờ.</p>';
      return;
    }
    var utc = zonedToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], srcTz);
    var srcName = '';
    CITIES.forEach(function (c) { if (c.tz === srcTz) srcName = c.name; });
    var rows = '';
    CITIES.forEach(function (c) {
      rows += '<tr' + (c.tz === srcTz ? ' class="tab-active"' : '') + '><td>' + c.name + (c.tz === srcTz ? ' ★' : '') + '</td><td>' + fmtInZone(utc, c.tz) + '</td></tr>';
    });
    out.style.display = 'block';
    out.innerHTML = '<p><strong>' + m[4] + ':' + m[5] + ' ngày ' + m[3] + '/' + m[2] + '/' + m[1] + ' ở ' + srcName + '</strong> tương ứng với:</p>'
      + '<table class="tbl"><thead><tr><th>Thành phố</th><th>Giờ tương ứng</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  root.querySelector('#dgqt-calc').addEventListener('click', calc);
  calc();
}
