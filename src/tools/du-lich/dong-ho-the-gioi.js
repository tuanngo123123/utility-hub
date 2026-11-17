export const meta = {
  id: 'dong-ho-the-gioi',
  name: 'Đồng hồ thế giới trực tiếp',
  category: 'Du lịch',
  categorySlug: 'du-lich',
  desc: 'Đồng hồ chạy trực tiếp theo giây cho 8 thành phố lớn, kèm tra giờ bất kỳ thành phố nào theo múi giờ.',
  keywords: ['đồng hồ thế giới', 'giờ trực tiếp', 'giờ Tokyo', 'giờ London', 'giờ New York', 'múi giờ'],
  icon: '🌍',
  seoTitle: 'Đồng hồ thế giới trực tiếp — Giờ Hà Nội, Tokyo, London, New York',
  seoDesc: 'Xem giờ trực tiếp theo giây ở Hà Nội, Tokyo, Seoul, Singapore, London, Paris, New York, Sydney và tra giờ thành phố khác.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🌍 Đồng hồ thế giới trực tiếp</h2>
      <p class="muted">Giờ hiện tại ở các thành phố lớn, cập nhật mỗi giây.</p>
    </div>
    <div id="dhtg-clocks" class="grid-2"></div>
    <h3>Tra giờ một thành phố khác</h3>
    <div class="grid-2">
      <div class="field">
        <label for="dhtg-tz">Chọn thành phố / múi giờ</label>
        <select id="dhtg-tz">
          <option value="Asia/Ho_Chi_Minh">Hà Nội / TP.HCM</option>
          <option value="Asia/Bangkok">Bangkok</option>
          <option value="Asia/Singapore">Singapore</option>
          <option value="Asia/Kuala_Lumpur">Kuala Lumpur</option>
          <option value="Asia/Jakarta">Jakarta</option>
          <option value="Asia/Manila">Manila</option>
          <option value="Asia/Hong_Kong">Hồng Kông</option>
          <option value="Asia/Taipei">Đài Bắc</option>
          <option value="Asia/Shanghai">Thượng Hải</option>
          <option value="Asia/Tokyo" selected>Tokyo</option>
          <option value="Asia/Seoul">Seoul</option>
          <option value="Asia/Kolkata">New Delhi</option>
          <option value="Asia/Dubai">Dubai</option>
          <option value="Australia/Sydney">Sydney</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Europe/Berlin">Berlin</option>
          <option value="Europe/Moscow">Moscow</option>
          <option value="America/New_York">New York</option>
          <option value="America/Los_Angeles">Los Angeles</option>
          <option value="America/Toronto">Toronto</option>
          <option value="America/Sao_Paulo">São Paulo</option>
        </select>
      </div>
    </div>
    <div id="dhtg-lookup" class="result" style="display:none"></div>
    <p class="note">Giờ hiển thị theo đồng hồ của thiết bị bạn, chuyển sang từng múi giờ bằng chuẩn quốc tế (đã tính giờ mùa hè ở các nơi áp dụng).</p>
  </div>`;
}

export function init(root) {
  var CITIES = [
    { name: 'Hà Nội', tz: 'Asia/Ho_Chi_Minh' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
    { name: 'Seoul', tz: 'Asia/Seoul' },
    { name: 'Singapore', tz: 'Asia/Singapore' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Paris', tz: 'Europe/Paris' },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'Sydney', tz: 'Australia/Sydney' }
  ];
  var clocksEl = root.querySelector('#dhtg-clocks');
  var lookupEl = root.querySelector('#dhtg-lookup');
  var tzSel = root.querySelector('#dhtg-tz');
  function fmtTime(date, tz) {
    return new Intl.DateTimeFormat('vi-VN', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
  }
  function fmtDate(date, tz) {
    return new Intl.DateTimeFormat('vi-VN', { timeZone: tz, weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }
  function render() {
    var now = new Date();
    var html = '';
    CITIES.forEach(function (c) {
      html += '<div class="stat"><div class="stat-label">' + c.name + '</div><div class="stat-num">' + fmtTime(now, c.tz) + '</div><div class="muted">' + fmtDate(now, c.tz) + '</div></div>';
    });
    clocksEl.innerHTML = html;
    var tz = tzSel.value;
    var name = tzSel.options[tzSel.selectedIndex] ? tzSel.options[tzSel.selectedIndex].text : tz;
    lookupEl.style.display = 'block';
    lookupEl.innerHTML = '<div class="result-row"><span>Bây giờ ở ' + name + '</span><strong>' + fmtTime(now, tz) + ' — ' + fmtDate(now, tz) + '</strong></div>';
  }
  tzSel.addEventListener('change', render);
  if (root._uhClock) clearInterval(root._uhClock);
  render();
  root._uhClock = setInterval(render, 1000);
}
