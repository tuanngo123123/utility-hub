// Calo món ăn Việt — tra calo từng món, cộng dồn cả bữa ăn.
export const meta = {
  id: 'calo-mon-an',
  name: 'Calo món ăn Việt: tra cứu & cộng bữa ăn',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tra calo của hơn 50 món ăn, đồ uống quen thuộc của người Việt — phở, bún, cơm tấm, bánh mì, trà sữa — rồi cộng dồn thành tổng calo cả bữa.',
  keywords: 'calo món ăn, phở bao nhiêu calo, bún bò bao nhiêu calo, bánh mì bao nhiêu calo, trà sữa bao nhiêu calo, tính calo bữa ăn',
  icon: '🍜',
  seoTitle: 'Calo món ăn Việt — Phở, bún bò, cơm tấm, trà sữa bao nhiêu calo',
  seoDesc: 'Tra cứu calo hơn 50 món ăn Việt quen thuộc và cộng dồn tổng calo cả bữa ăn để kiểm soát khẩu phần mỗi ngày.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Chọn món, nhập số khẩu phần rồi bấm "Thêm vào bữa" — bảng dưới sẽ cộng dồn tổng calo cả bữa của bạn.</p>
  </div>
  <div class="grid-3">
    <div class="field">
      <label for="cma-dish">Món ăn / đồ uống</label>
      <select id="cma-dish"></select>
    </div>
    <div class="field">
      <label for="cma-portion">Số khẩu phần</label>
      <input id="cma-portion" type="text" inputmode="decimal" value="1" placeholder="VD: 1">
    </div>
    <div class="field">
      <label>&nbsp;</label>
      <button type="button" class="btn btn-primary" id="cma-add">Thêm vào bữa</button>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-ghost" id="cma-example">Điền ví dụ (bữa trưa)</button>
    <button type="button" class="btn btn-ghost" id="cma-clear">Xóa bữa ăn</button>
  </div>
  <div id="cma-out"></div>
  <p class="note">Số liệu là calo ước tính theo khẩu phần chuẩn (1 tô, 1 đĩa, 1 ổ…), tham khảo Bảng thành phần dinh dưỡng thực phẩm Việt Nam và các bảng calo phổ biến. Calo thực tế dao động tùy quán, tùy lượng dầu mỡ và gia vị — dùng để ước lượng khẩu phần, không thay thế tư vấn dinh dưỡng. Nhu cầu tham khảo: người trưởng thành khoảng 1.800–2.200 kcal/ngày tùy giới tính và mức vận động.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => n.toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('cma-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Tên món, khẩu phần chuẩn, kcal ước tính. Nhóm: Món nước / Cơm & xôi /
  // Bánh & ăn vặt / Đồ uống & tráng miệng / Trái cây & khác.
  const DISHES = [
    ['Món nước', [
      ['Phở bò', '1 tô', 430], ['Phở gà', '1 tô', 350], ['Bún bò Huế', '1 tô', 450],
      ['Bún chả', '1 phần', 450], ['Bún thịt nướng', '1 tô', 480], ['Bún riêu', '1 tô', 400],
      ['Bún mắm', '1 tô', 480], ['Hủ tiếu', '1 tô', 350], ['Bánh canh', '1 tô', 350],
      ['Miến gà', '1 tô', 300], ['Cháo gà', '1 tô', 250], ['Cháo lòng', '1 tô', 300],
      ['Mì gói', '1 gói', 350], ['Mì xào giòn', '1 đĩa', 550]
    ]],
    ['Cơm, xôi & món mặn', [
      ['Cơm trắng', '1 chén (100g)', 130], ['Cơm tấm sườn bì chả', '1 đĩa', 550],
      ['Cơm gà', '1 đĩa', 550], ['Cơm rang thập cẩm', '1 đĩa', 600],
      ['Xôi gấc', '1 gói', 350], ['Xôi xéo', '1 gói', 400], ['Bò né', '1 phần', 450],
      ['Thịt kho trứng', '1 phần', 350], ['Cá kho tộ', '1 phần', 250],
      ['Canh chua cá', '1 tô', 150], ['Rau luộc', '1 đĩa', 50],
      ['Trứng ốp la', '1 quả', 90], ['Trứng luộc', '1 quả', 70], ['Hột vịt lộn', '1 quả', 180]
    ]],
    ['Bánh & ăn vặt', [
      ['Bánh mì thịt', '1 ổ', 400], ['Bánh mì trứng', '1 ổ', 340], ['Bánh mì pate', '1 ổ', 380],
      ['Bánh cuốn', '1 đĩa', 300], ['Bánh xèo', '1 cái lớn', 350], ['Bánh bèo', '1 đĩa', 250],
      ['Bánh bột lọc', '1 đĩa', 300], ['Gỏi cuốn', '1 cuốn', 60], ['Chả giò (nem rán)', '1 cái', 120],
      ['Bánh chưng', '1 khoanh (~100g)', 180], ['Bánh tét', '1 khoanh (~100g)', 200],
      ['Bánh bao', '1 cái', 350], ['Gà rán', '1 miếng', 300], ['Khoai tây chiên', '1 phần vừa', 350],
      ['Hamburger', '1 cái', 500], ['Pizza', '1 lát', 280]
    ]],
    ['Đồ uống, tráng miệng & khác', [
      ['Cà phê sữa đá', '1 ly', 110], ['Trà sữa trân châu', '1 ly', 350],
      ['Sữa đậu nành', '1 ly 200ml', 80], ['Nước cam', '1 ly', 90], ['Sinh tố bơ', '1 ly', 250],
      ['Bia', '1 lon 330ml', 150], ['Chè ba màu', '1 ly', 250], ['Bánh flan', '1 hộp', 150],
      ['Kem', '1 cây', 150], ['Chuối', '1 quả', 90], ['Táo', '1 quả', 80],
      ['Xoài', '1 quả vừa', 150], ['Dưa hấu', '1 miếng (~200g)', 60], ['Đậu phộng rang', '100g', 570]
    ]]
  ];

  let meal = [];
  const FLAT = {};
  DISHES.forEach(g => g[1].forEach(d => { FLAT[d[0]] = d; }));

  // Đổ danh sách món vào select, nhóm theo optgroup.
  $('cma-dish').innerHTML = DISHES.map(g => '<optgroup label="' + escAttr(g[0]) + '">'
    + g[1].map(d => '<option value="' + escAttr(d[0]) + '">' + escHtml(d[0]) + ' — ' + escHtml(d[1]) + ' (' + d[2] + ' kcal)</option>').join('')
    + '</optgroup>').join('');

  function render() {
    const out = $('cma-out');
    if (!meal.length) {
      out.innerHTML = '<p class="muted">Bữa ăn đang trống — chọn món ở trên và bấm "Thêm vào bữa".</p>';
      return;
    }
    const total = meal.reduce((s, m) => s + m.kcal, 0);
    const pct2000 = Math.round(total / 2000 * 100);
    const rows = meal.map((m, i) => '<tr><td>' + escHtml(m.name) + '</td><td>' + escHtml(m.portion) + '</td><td>' + fmtNum(m.kcal) + ' kcal</td>'
      + '<td><button type="button" class="btn btn-ghost" data-cma-del="' + i + '">Xóa</button></td></tr>').join('');
    const copyText = 'Bữa ăn: ' + meal.map(m => m.name + ' × ' + m.portion + ' (' + m.kcal + ' kcal)').join('; ') + ' — Tổng: ' + total + ' kcal (khoảng ' + pct2000 + '% nhu cầu 2.000 kcal/ngày).';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Tổng calo bữa ăn</p>
    <div class="result-hero-value">${fmtNum(total)} kcal</div>
    <p class="result-hero-sub">Khoảng ${pct2000}% nhu cầu tham khảo 2.000 kcal/ngày · ${meal.length} món</p>
  </div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép tổng calo bữa ăn">Chép kết quả</button></div>
</div>
<table class="tbl">
  <thead><tr><th>Món</th><th>Khẩu phần</th><th>Calo</th><th></th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
    bindCopy(out);
    out.querySelectorAll('[data-cma-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        meal.splice(parseInt(btn.getAttribute('data-cma-del'), 10), 1);
        render();
      });
    });
  }

  function addDish() {
    clearErrs(root);
    const name = $('cma-dish').value;
    const d = FLAT[name];
    const portion = parseNum($('cma-portion').value);
    if (isNaN(portion) || portion <= 0 || portion > 20) {
      markErr($('cma-portion'), 'Ô Số khẩu phần chưa đúng — nhập số từ 0,5 đến 20, ví dụ 1.');
      focusEl($('cma-portion'));
      return;
    }
    meal.push({ name: name + ' (' + d[1] + ')', portion: String(portion).replace('.', ','), kcal: Math.round(d[2] * portion) });
    render();
  }

  $('cma-add').addEventListener('click', addDish);
  $('cma-portion').addEventListener('keydown', e => { if (e.key === 'Enter') addDish(); });
  $('cma-clear').addEventListener('click', () => { meal = []; render(); });
  // Ví dụ: bữa trưa cơm tấm + canh chua + trà sữa = 550 + 150 + 350 = 1.050 kcal.
  $('cma-example').addEventListener('click', () => {
    meal = [
      { name: 'Cơm tấm sườn bì chả (1 đĩa)', portion: '1', kcal: 550 },
      { name: 'Canh chua cá (1 tô)', portion: '1', kcal: 150 },
      { name: 'Trà sữa trân châu (1 ly)', portion: '1', kcal: 350 }
    ];
    render();
  });
  render();
}
