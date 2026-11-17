export const meta = {
  id: 'don-vi-nau-an',
  name: 'Đổi đơn vị nấu ăn',
  category: 'Nhà & bếp',
  categorySlug: 'nha-bep',
  desc: 'Đổi cup ↔ ml ↔ gram theo từng nguyên liệu, muỗng canh/muỗng cà phê ↔ ml, và độ F ↔ độ C cho lò nướng.',
  keywords: ['đổi đơn vị', 'cup', 'gram', 'ml', 'muỗng canh', 'độ F', 'độ C', 'nấu ăn'],
  icon: '🥄',
  seoTitle: 'Đổi đơn vị nấu ăn — cup, gram, ml, độ F/C',
  seoDesc: 'Đổi cup sang gram/ml theo từng nguyên liệu (bột mì, đường, gạo…), muỗng canh/muỗng cà phê sang ml, độ F sang độ C cho lò nướng.'
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head">
      <h2>🥄 Đổi đơn vị nấu ăn</h2>
      <p class="muted">Đổi cup, gram, ml, muỗng và nhiệt độ lò nướng — theo đúng nguyên liệu bạn dùng.</p>
    </div>
    <h3>Cup ↔ gram / ml (theo nguyên liệu)</h3>
    <div class="grid-3">
      <div class="field">
        <label for="dvna-nl">Nguyên liệu</label>
        <select id="dvna-nl">
          <option value="nuoc">Nước (1 cup = 240 ml = 240 g)</option>
          <option value="botmi" selected>Bột mì (1 cup ≈ 120 g)</option>
          <option value="duongcat">Đường cát (1 cup ≈ 200 g)</option>
          <option value="duongbot">Đường bột (1 cup ≈ 120 g)</option>
          <option value="gao">Gạo (1 cup ≈ 185 g)</option>
          <option value="bo">Bơ (1 cup ≈ 227 g)</option>
          <option value="sua">Sữa tươi (1 cup ≈ 245 g)</option>
          <option value="dauan">Dầu ăn (1 cup ≈ 218 g)</option>
          <option value="matong">Mật ong (1 cup ≈ 340 g)</option>
          <option value="cacao">Bột cacao (1 cup ≈ 85 g)</option>
        </select>
      </div>
      <div class="field">
        <label for="dvna-so">Số lượng</label>
        <input id="dvna-so" type="number" min="0" step="0.25" value="2" inputmode="decimal">
      </div>
      <div class="field">
        <label for="dvna-huong">Đổi từ</label>
        <select id="dvna-huong">
          <option value="cup-g" selected>Cup → gram</option>
          <option value="g-cup">Gram → cup</option>
          <option value="cup-ml">Cup → ml</option>
          <option value="ml-cup">ml → cup</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" id="dvna-calc1">Đổi cup / gram / ml</button>
    <div id="dvna-out1" class="result" style="display:none"></div>
    <h3>Muỗng ↔ ml</h3>
    <div class="grid-3">
      <div class="field">
        <label for="dvna-muong">Số lượng</label>
        <input id="dvna-muong" type="number" min="0" step="0.5" value="3" inputmode="decimal">
      </div>
      <div class="field">
        <label for="dvna-loai">Đơn vị</label>
        <select id="dvna-loai">
          <option value="tbsp" selected>Muỗng canh (tbsp, 15 ml)</option>
          <option value="tsp">Muỗng cà phê (tsp, 5 ml)</option>
        </select>
      </div>
      <div class="field">
        <label for="dvna-huong2">Đổi thành</label>
        <select id="dvna-huong2">
          <option value="to-ml" selected>Sang ml</option>
          <option value="to-tsp">Sang muỗng cà phê</option>
          <option value="to-tbsp">Sang muỗng canh</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" id="dvna-calc2">Đổi muỗng</button>
    <div id="dvna-out2" class="result" style="display:none"></div>
    <h3>Nhiệt độ lò nướng (°F ↔ °C)</h3>
    <div class="grid-3">
      <div class="field">
        <label for="dvna-do">Nhiệt độ</label>
        <input id="dvna-do" type="number" step="1" value="180" inputmode="decimal">
      </div>
      <div class="field">
        <label for="dvna-huong3">Đổi từ</label>
        <select id="dvna-huong3">
          <option value="c-f" selected>°C → °F</option>
          <option value="f-c">°F → °C</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" id="dvna-calc3">Đổi nhiệt độ</button>
    <div id="dvna-out3" class="result" style="display:none"></div>
    <p class="note">1 cup chuẩn Mỹ = 240 ml. Khối lượng 1 cup khác nhau theo nguyên liệu vì tỉ trọng khác nhau; số liệu trên là giá trị phổ biến, làm tròn — với bột mì nên cân cho chính xác khi làm bánh.</p>
  </div>`;
}

export function init(root) {
  var UH = (typeof window !== 'undefined' && window.UH) || {};
  var fmtNum = UH.fmtNum || function (n, d) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: (d == null ? 2 : d) }).format(n); };
  var parseNum = UH.parseNum || function (v) { var s = String(v == null ? '' : v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? NaN : n; };
  var GRAMS_PER_CUP = {
    nuoc: 240, botmi: 120, duongcat: 200, duongbot: 120, gao: 185,
    bo: 227, sua: 245, dauan: 218, matong: 340, cacao: 85
  };
  var NAMES = {
    nuoc: 'nước', botmi: 'bột mì', duongcat: 'đường cát', duongbot: 'đường bột', gao: 'gạo',
    bo: 'bơ', sua: 'sữa tươi', dauan: 'dầu ăn', matong: 'mật ong', cacao: 'bột cacao'
  };
  function show(id, html) {
    var el = root.querySelector(id);
    el.style.display = 'block';
    el.innerHTML = html;
  }
  root.querySelector('#dvna-calc1').addEventListener('click', function () {
    var key = root.querySelector('#dvna-nl').value;
    var val = parseNum(root.querySelector('#dvna-so').value);
    var dir = root.querySelector('#dvna-huong').value;
    if (isNaN(val) || val < 0) { show('#dvna-out1', '<p class="error">Vui lòng nhập số lượng hợp lệ (≥ 0).</p>'); return; }
    var g = GRAMS_PER_CUP[key];
    var res = '';
    if (dir === 'cup-g') res = fmtNum(val) + ' cup ' + NAMES[key] + ' ≈ <strong>' + fmtNum(val * g) + ' g</strong>';
    else if (dir === 'g-cup') res = fmtNum(val) + ' g ' + NAMES[key] + ' ≈ <strong>' + fmtNum(val / g) + ' cup</strong>';
    else if (dir === 'cup-ml') res = fmtNum(val) + ' cup ≈ <strong>' + fmtNum(val * 240) + ' ml</strong>';
    else res = fmtNum(val) + ' ml ≈ <strong>' + fmtNum(val / 240) + ' cup</strong>';
    show('#dvna-out1', '<div class="result-row"><span>Kết quả</span><span>' + res + '</span></div>');
  });
  root.querySelector('#dvna-calc2').addEventListener('click', function () {
    var val = parseNum(root.querySelector('#dvna-muong').value);
    var kind = root.querySelector('#dvna-loai').value;
    var dir = root.querySelector('#dvna-huong2').value;
    if (isNaN(val) || val < 0) { show('#dvna-out2', '<p class="error">Vui lòng nhập số lượng hợp lệ (≥ 0).</p>'); return; }
    var ml = val * (kind === 'tbsp' ? 15 : 5);
    var label = fmtNum(val) + ' ' + (kind === 'tbsp' ? 'muỗng canh' : 'muỗng cà phê');
    var res = '';
    if (dir === 'to-ml') res = label + ' = <strong>' + fmtNum(ml) + ' ml</strong>';
    else if (dir === 'to-tsp') res = label + ' = <strong>' + fmtNum(ml / 5) + ' muỗng cà phê</strong>';
    else res = label + ' = <strong>' + fmtNum(ml / 15) + ' muỗng canh</strong>';
    show('#dvna-out2', '<div class="result-row"><span>Kết quả</span><span>' + res + '</span></div>');
  });
  root.querySelector('#dvna-calc3').addEventListener('click', function () {
    var val = parseNum(root.querySelector('#dvna-do').value);
    var dir = root.querySelector('#dvna-huong3').value;
    if (isNaN(val)) { show('#dvna-out3', '<p class="error">Vui lòng nhập nhiệt độ hợp lệ.</p>'); return; }
    var res = '';
    if (dir === 'c-f') res = fmtNum(val, 0) + '°C = <strong>' + fmtNum(val * 9 / 5 + 32, 0) + '°F</strong>';
    else res = fmtNum(val, 0) + '°F = <strong>' + fmtNum((val - 32) * 5 / 9, 0) + '°C</strong>';
    show('#dvna-out3', '<div class="result-row"><span>Kết quả</span><span>' + res + '</span></div>');
  });
}
