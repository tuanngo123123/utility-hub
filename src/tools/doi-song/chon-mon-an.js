// Chọn món ăn ngẫu nhiên — kho ~60 món Việt, lọc theo buổi + món chay.
export const meta = {
  id: 'chon-mon-an',
  name: 'Chọn món ăn ngẫu nhiên',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Hôm nay ăn gì? Bấm để chọn ngẫu nhiên một món Việt trong kho 60 món, lọc theo buổi sáng/trưa/tối và món chay.',
  keywords: 'hôm nay ăn gì, chọn món ăn, món ăn ngẫu nhiên, ăn gì hôm nay, món việt',
  icon: '🍜',
  seoTitle: 'Hôm nay ăn gì? — Chọn món ăn ngẫu nhiên',
  seoDesc: 'Không biết ăn gì? Chọn ngẫu nhiên một món Việt trong kho 60 món, lọc theo buổi sáng/trưa/tối và món chay.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🍜</span><div><h2>Chọn món ăn ngẫu nhiên</h2><p class="muted">Hôm nay ăn gì? Để công cụ chọn giúp bạn một món Việt ngon.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="cma-meal">Buổi ăn</label><select id="cma-meal"><option value="all">Cả ngày</option><option value="sang">Sáng</option><option value="trua">Trưa</option><option value="toi">Tối</option></select></div>
    <div class="field"><label for="cma-veg">Kiểu món</label><select id="cma-veg"><option value="all">Tất cả</option><option value="chay">Chỉ món chay</option><option value="man">Chỉ món mặn</option></select></div>
  </div>
  <div>
    <button type="button" class="btn btn-primary" id="cma-pick">Hôm nay ăn gì?</button>
    <button type="button" class="btn btn-ghost" id="cma-again">Món khác</button>
  </div>
  <div id="cma-out"></div>
  <p class="note">Kho món có 60 món Việt quen thuộc. Bấm "Món khác" nếu chưa ưng món vừa chọn.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Kho món: m = buổi (sang/trua/toi), c = chay (true/false).
  const DISHES = [
    { n: 'Phở bò', m: ['sang', 'trua', 'toi'], c: false },
    { n: 'Phở gà', m: ['sang', 'trua'], c: false },
    { n: 'Bún bò Huế', m: ['sang', 'trua'], c: false },
    { n: 'Bún riêu cua', m: ['sang', 'trua'], c: false },
    { n: 'Bún chả Hà Nội', m: ['trua', 'toi'], c: false },
    { n: 'Bún thịt nướng', m: ['trua', 'toi'], c: false },
    { n: 'Bún cá', m: ['sang', 'trua'], c: false },
    { n: 'Bún ốc', m: ['sang', 'trua'], c: false },
    { n: 'Bún mắm', m: ['trua', 'toi'], c: false },
    { n: 'Bún mọc', m: ['sang', 'trua'], c: false },
    { n: 'Mì Quảng', m: ['sang', 'trua'], c: false },
    { n: 'Cao lầu', m: ['trua', 'toi'], c: false },
    { n: 'Hủ tiếu Nam Vang', m: ['sang', 'trua', 'toi'], c: false },
    { n: 'Hủ tiếu gõ', m: ['sang', 'toi'], c: false },
    { n: 'Bánh mì thịt', m: ['sang', 'trua'], c: false },
    { n: 'Bánh mì trứng', m: ['sang'], c: false },
    { n: 'Bánh mì chả cá', m: ['sang', 'trua'], c: false },
    { n: 'Cơm tấm sườn bì chả', m: ['sang', 'trua', 'toi'], c: false },
    { n: 'Cơm gà xối mỡ', m: ['trua', 'toi'], c: false },
    { n: 'Cơm gà Hải Nam', m: ['trua', 'toi'], c: false },
    { n: 'Cơm rang dưa bò', m: ['trua', 'toi'], c: false },
    { n: 'Cơm sườn nướng', m: ['trua', 'toi'], c: false },
    { n: 'Cơm cá kho tộ', m: ['trua', 'toi'], c: false },
    { n: 'Cơm thịt kho trứng', m: ['trua', 'toi'], c: false },
    { n: 'Cơm canh chua cá', m: ['trua', 'toi'], c: false },
    { n: 'Cháo gà', m: ['sang', 'toi'], c: false },
    { n: 'Cháo sườn', m: ['sang', 'toi'], c: false },
    { n: 'Cháo cá', m: ['sang', 'trua'], c: false },
    { n: 'Cháo vịt', m: ['trua', 'toi'], c: false },
    { n: 'Bánh cuốn', m: ['sang', 'trua'], c: false },
    { n: 'Bánh bèo', m: ['trua', 'toi'], c: false },
    { n: 'Bánh xèo', m: ['trua', 'toi'], c: false },
    { n: 'Bánh căn', m: ['sang', 'trua'], c: false },
    { n: 'Bánh ướt lòng gà', m: ['sang', 'trua'], c: false },
    { n: 'Gỏi cuốn', m: ['trua', 'toi'], c: false },
    { n: 'Nem nướng Nha Trang', m: ['trua', 'toi'], c: false },
    { n: 'Chả giò', m: ['trua', 'toi'], c: false },
    { n: 'Bò né', m: ['sang', 'trua'], c: false },
    { n: 'Bò lúc lắc', m: ['trua', 'toi'], c: false },
    { n: 'Lẩu Thái hải sản', m: ['toi'], c: false },
    { n: 'Lẩu gà lá é', m: ['toi'], c: false },
    { n: 'Lẩu mắm', m: ['toi'], c: false },
    { n: 'Mì Ý sốt bò bằm', m: ['trua', 'toi'], c: false },
    { n: 'Mì xào giòn', m: ['trua', 'toi'], c: false },
    { n: 'Mì tôm trứng', m: ['sang', 'toi'], c: false },
    { n: 'Xôi xéo', m: ['sang'], c: false },
    { n: 'Xôi gà', m: ['sang'], c: false },
    { n: 'Xôi mặn', m: ['sang'], c: false },
    { n: 'Bánh canh cua', m: ['sang', 'trua'], c: false },
    { n: 'Bánh canh giò heo', m: ['sang', 'trua'], c: false },
    { n: 'Phở chay', m: ['sang', 'trua'], c: true },
    { n: 'Bún riêu chay', m: ['sang', 'trua'], c: true },
    { n: 'Hủ tiếu chay', m: ['sang', 'trua'], c: true },
    { n: 'Cơm chay thập cẩm', m: ['trua', 'toi'], c: true },
    { n: 'Mì xào chay', m: ['trua', 'toi'], c: true },
    { n: 'Đậu hũ kho nấm', m: ['trua', 'toi'], c: true },
    { n: 'Canh khổ qua chay', m: ['trua', 'toi'], c: true },
    { n: 'Gỏi cuốn chay', m: ['trua', 'toi'], c: true },
    { n: 'Lẩu nấm chay', m: ['toi'], c: true },
    { n: 'Cháo nấm chay', m: ['sang', 'toi'], c: true },
  ];
  let lastPick = '';

  function pick() {
    const meal = $('cma-meal').value;
    const veg = $('cma-veg').value;
    let pool = DISHES.filter(d => (meal === 'all' || d.m.indexOf(meal) !== -1));
    if (veg === 'chay') pool = pool.filter(d => d.c);
    if (veg === 'man') pool = pool.filter(d => !d.c);
    if (!pool.length) { $('cma-out').innerHTML = '<p class="error">Không có món nào khớp bộ lọc. Thử nới bộ lọc nhé.</p>'; return; }
    let candidates = pool.filter(d => d.n !== lastPick);
    if (!candidates.length) candidates = pool;
    const dish = candidates[Math.floor(Math.random() * candidates.length)];
    lastPick = dish.n;
    const mealLabel = { sang: 'Sáng', trua: 'Trưa', toi: 'Tối' };
    $('cma-out').innerHTML = `<div class="result">
      <div class="result-row"><span>🍽️ Hôm nay ăn</span><strong>${dish.n}</strong></div>
      <div class="result-row"><span>Hợp buổi</span><strong>${dish.m.map(x => mealLabel[x]).join(', ')}</strong></div>
      <div class="result-row"><span>Kiểu món</span><strong>${dish.c ? 'Món chay 🥬' : 'Món mặn'}</strong></div>
      <div class="result-row"><span>Kho món</span><strong>${pool.length} món khớp bộ lọc (tổng ${DISHES.length} món)</strong></div>
    </div>`;
  }

  $('cma-pick').addEventListener('click', pick);
  $('cma-again').addEventListener('click', pick);
  $('cma-meal').addEventListener('change', () => { lastPick = ''; });
  $('cma-veg').addEventListener('change', () => { lastPick = ''; });
}
