export const meta = {
  id: 'checklist-vali',
  name: 'Danh sách hành lý cần mang',
  category: 'Du lịch',
  categorySlug: 'du-lich',
  desc: 'Danh sách đồ mang theo khi đi du lịch theo loại chuyến đi: biển, núi, công tác, ngắn ngày, dài ngày. Đánh dấu, thêm đồ tự do, lưu tự động.',
  keywords: ['checklist', 'danh sách hành lý cần mang', 'hành lý', 'vali', 'đồ mang theo', 'du lịch', 'chuẩn bị đi chơi'],
  icon: '✅',
  seoTitle: 'Danh sách hành lý cần mang khi du lịch — Không sót đồ khi đi chơi',
  seoDesc: 'Danh sách đồ mang theo khi đi du lịch theo loại chuyến đi (biển, núi, công tác…): đánh dấu, thêm đồ tự do, lưu tự động, in hoặc chép danh sách.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>✅ Danh sách hành lý cần mang</h2>
      <p class="muted">Chọn loại chuyến đi để có danh sách gợi ý, đánh dấu đồ đã chuẩn bị xong. Danh sách được lưu tự động trên trình duyệt này.</p>
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="clvl-loai">Loại chuyến đi</label>
        <select id="clvl-loai">
          <option value="bien" selected>Đi biển</option>
          <option value="nui">Đi núi / trekking</option>
          <option value="congtac">Công tác</option>
          <option value="ngan">Ngắn ngày (1–2 ngày)</option>
          <option value="dai">Dài ngày (5+ ngày)</option>
          <option value="thanhpho">Du lịch thành phố</option>
        </select>
      </div>
      <div class="field">
        <label for="clvl-them">Thêm đồ của bạn</label>
        <input id="clvl-them" type="text" placeholder="Ví dụ: Thuốc dị ứng" maxlength="80">
      </div>
    </div>
    <button class="btn btn-ghost" id="clvl-add">+ Thêm đồ</button>
    <button class="btn btn-ghost" id="clvl-copy">Chép danh sách</button>
    <button class="btn btn-ghost" id="clvl-print">In danh sách</button>
    <button class="btn btn-ghost" id="clvl-reset" data-uh-reset="1">Đặt lại</button>
    <div id="clvl-tiendo" class="result" style="display:none"></div>
    <div id="clvl-list"></div>
    <p class="note">Danh sách lưu trong trình duyệt của bạn (localStorage) — đổi máy hoặc xóa dữ liệu trình duyệt sẽ mất danh sách đã tick.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var toast = UH.toast || function (m) { if (typeof alert !== 'undefined') alert(m); };
  var copyText = UH.copyText || function (t) { if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(t); };
  var KEY = 'uh-checklist-vali';
  var PRESETS = {
    bien: ['CCCD / hộ chiếu', 'Vé máy bay / vé xe', 'Tiền mặt + thẻ', 'Đồ bơi', 'Kem chống nắng', 'Kính râm', 'Mũ rộng vành', 'Dép lê / sandal', 'Khăn tắm', 'Quần áo mát (3–4 bộ)', 'Đồ lót + tất', 'Áo khoác nhẹ', 'Đồ vệ sinh cá nhân', 'Sạc điện thoại + pin dự phòng', 'Thuốc cá nhân', 'Túi chống nước cho điện thoại', 'Balo nhỏ đi chơi'],
    nui: ['CCCD / hộ chiếu', 'Giày trekking', 'Quần áo thể thao thấm mồ hôi', 'Áo khoác chống mưa gió', 'Mũ + găng tay', 'Balo trekking', 'Bình nước', 'Đồ ăn nhẹ / thanh năng lượng', 'Đèn pin', 'Kem chống nắng', 'Thuốc cá nhân + băng cá nhân', 'Sạc điện thoại + pin dự phòng', 'Gậy leo núi (nếu có)', 'Túi rác nhỏ', 'Đồ vệ sinh cá nhân'],
    congtac: ['CCCD / hộ chiếu', 'Vé máy bay / vé xe', 'Laptop + sạc', 'Trang phục lịch sự (2 bộ)', 'Giày tây / giày công sở', 'Cà vạt / phụ kiện', 'Danh thiếp', 'Tài liệu họp', 'Sạc điện thoại + pin dự phòng', 'Đồ vệ sinh cá nhân', 'Thuốc cá nhân', 'Ô gấp', 'Tiền mặt + thẻ'],
    ngan: ['CCCD / hộ chiếu', 'Tiền mặt + thẻ', '1–2 bộ quần áo', 'Đồ lót', 'Đồ vệ sinh cá nhân', 'Sạc điện thoại', 'Thuốc cá nhân', 'Ô gấp / áo mưa', 'Balo nhỏ'],
    dai: ['CCCD / hộ chiếu', 'Vé máy bay / vé xe', 'Tiền mặt + thẻ', 'Quần áo đủ 5–7 ngày', 'Đồ lót + tất', 'Giày đi bộ + dép', 'Áo khoác', 'Đồ vệ sinh cá nhân', 'Khăn tắm', 'Sạc điện thoại + pin dự phòng', 'Thuốc cá nhân', 'Túi giặt đồ bẩn', 'Ô gấp', 'Sách / tai nghe', 'Balo nhỏ đi chơi', 'Khóa vali'],
    thanhpho: ['CCCD / hộ chiếu', 'Vé máy bay / vé xe', 'Tiền mặt + thẻ', 'Quần áo (3–4 bộ)', 'Giày đi bộ thoải mái', 'Áo khoác nhẹ', 'Ô gấp', 'Sạc điện thoại + pin dự phòng', 'Đồ vệ sinh cá nhân', 'Thuốc cá nhân', 'Balo nhỏ / túi đeo chéo', 'Kem chống nắng']
  };
  function load() {
    try {
      if (typeof localStorage === 'undefined') return {};
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) { return {}; }
  }
  function save(state) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* bỏ qua nếu trình duyệt chặn lưu trữ */ }
  }
  var state = load();
  var typeSel = root.querySelector('#clvl-loai');
  var listEl = root.querySelector('#clvl-list');
  var progressEl = root.querySelector('#clvl-tiendo');
  function currentItems() {
    var type = typeSel.value;
    var base = PRESETS[type].slice();
    var extra = (state[type] && state[type].extra) || [];
    return base.concat(extra);
  }
  function isChecked(type, item) {
    return !!(state[type] && state[type].done && state[type].done[item]);
  }
  function render() {
    var type = typeSel.value;
    var items = currentItems();
    var done = 0;
    var html = '';
    items.forEach(function (item, idx) {
      var checked = isChecked(type, item);
      if (checked) done++;
      html += '<div class="field"><label><input type="checkbox" data-clvl-idx="' + idx + '"' + (checked ? ' checked' : '') + '> ' + item + '</label></div>';
    });
    listEl.innerHTML = html;
    progressEl.style.display = 'block';
    progressEl.innerHTML = '<div class="result-row"><span>Đã chuẩn bị</span><strong>' + done + ' / ' + items.length + ' món</strong></div>';
    var boxes = listEl.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].addEventListener('change', (function (idx, item) {
        return function (ev) {
          var t = typeSel.value;
          state[t] = state[t] || { done: {}, extra: [] };
          state[t].done = state[t].done || {};
          state[t].done[item] = ev.target.checked;
          save(state);
          render();
        };
      })(i, items[i]));
    }
  }
  typeSel.addEventListener('change', render);
  root.querySelector('#clvl-add').addEventListener('click', function () {
    var input = root.querySelector('#clvl-them');
    var name = (input.value || '').trim();
    if (!name) { toast('Nhập tên đồ cần thêm.'); return; }
    var t = typeSel.value;
    state[t] = state[t] || { done: {}, extra: [] };
    state[t].extra = state[t].extra || [];
    if (currentItems().indexOf(name) === -1) state[t].extra.push(name);
    save(state);
    input.value = '';
    render();
  });
  root.querySelector('#clvl-copy').addEventListener('click', function () {
    var type = typeSel.value;
    var items = currentItems();
    var text = 'Danh sách hành lý cần mang:\n' + items.map(function (it) { return (isChecked(type, it) ? '[x] ' : '[ ] ') + it; }).join('\n');
    copyText(text);
    toast('Đã chép danh sách.');
  });
  root.querySelector('#clvl-print').addEventListener('click', function () {
    if (typeof window !== 'undefined' && window.print) window.print();
  });
  root.querySelector('#clvl-reset').addEventListener('click', function () {
    var t = typeSel.value;
    delete state[t];
    save(state);
    render();
  });
  render();
}
