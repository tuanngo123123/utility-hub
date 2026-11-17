// Quay số & bốc thăm ngẫu nhiên — bốc thăm tên, xúc xắc, đồng xu.
export const meta = {
  id: 'quay-so-boc-tham',
  name: 'Quay số & bốc thăm ngẫu nhiên',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Bốc thăm tên ngẫu nhiên (không lặp), tung xúc xắc 1–3 viên, tung đồng xu sấp/ngửa kèm thống kê.',
  keywords: 'bốc thăm, quay số ngẫu nhiên, xúc xắc, tung đồng xu, chọn tên ngẫu nhiên',
  icon: '🎲',
  seoTitle: 'Quay số & bốc thăm ngẫu nhiên — Xúc xắc, đồng xu',
  seoDesc: 'Bốc thăm tên ngẫu nhiên không lặp, tung xúc xắc 1–3 viên, tung đồng xu sấp ngửa kèm thống kê. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🎲</span><div><h2>Quay số & bốc thăm ngẫu nhiên</h2><p class="muted">Bốc thăm tên, tung xúc xắc, tung đồng xu — tất cả ngẫu nhiên ngay trên trình duyệt.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="qs-tab-name">Bốc thăm tên</button>
    <button type="button" class="tab" id="qs-tab-dice">Xúc xắc</button>
    <button type="button" class="tab" id="qs-tab-coin">Đồng xu</button>
  </div>

  <div id="qs-pane-name">
    <div class="field"><label for="qs-names">Danh sách tên (mỗi tên một dòng)</label><textarea id="qs-names" rows="6" placeholder="An&#10;Bình&#10;Chi&#10;Dũng">An
Bình
Chi
Dũng
Hà
Lan
Minh
Ngọc</textarea></div>
    <div class="field"><label><input type="checkbox" id="qs-norepeat" checked> Bốc không lặp (tên đã trúng sẽ không bốc lại)</label></div>
    <div>
      <button type="button" class="btn btn-primary" id="qs-draw">Bốc một tên</button>
      <button type="button" class="btn btn-ghost" id="qs-reset">Bốc lại từ đầu</button>
    </div>
    <div id="qs-name-out"></div>
  </div>

  <div id="qs-pane-dice" style="display:none">
    <div class="field"><label for="qs-dice-count">Số viên xúc xắc</label><select id="qs-dice-count"><option value="1">1 viên</option><option value="2" selected>2 viên</option><option value="3">3 viên</option></select></div>
    <button type="button" class="btn btn-primary" id="qs-roll">Tung xúc xắc</button>
    <div id="qs-dice-out"></div>
  </div>

  <div id="qs-pane-coin" style="display:none">
    <button type="button" class="btn btn-primary" id="qs-flip">Tung đồng xu</button>
    <button type="button" class="btn btn-ghost" id="qs-coin-reset">Đặt lại thống kê</button>
    <div id="qs-coin-out"></div>
    <div class="result"><div class="result-row"><span>Sấp</span><strong id="qs-heads">0</strong></div><div class="result-row"><span>Ngửa</span><strong id="qs-tails">0</strong></div></div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const panes = ['name', 'dice', 'coin'];
  panes.forEach(k => {
    $('qs-tab-' + k).addEventListener('click', () => {
      panes.forEach(j => {
        $('qs-tab-' + j).classList.toggle('tab-active', j === k);
        $('qs-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });

  // Bốc thăm tên.
  let drawn = [];
  function nameList() {
    return $('qs-names').value.split(/\n+/).map(s => s.trim()).filter(Boolean);
  }
  $('qs-draw').addEventListener('click', () => {
    const list = nameList();
    if (!list.length) { $('qs-name-out').innerHTML = '<p class="error">Vui lòng nhập ít nhất một tên.</p>'; return; }
    let pool = list;
    if ($('qs-norepeat').checked) {
      pool = list.filter(n => drawn.indexOf(n) === -1);
      if (!pool.length) {
        $('qs-name-out').innerHTML = '<p class="note">Đã bốc hết danh sách. Bấm "Bốc lại từ đầu" để bốc vòng mới.</p>';
        return;
      }
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if ($('qs-norepeat').checked) drawn.push(pick);
    $('qs-name-out').innerHTML = `<div class="result">
      <div class="result-row"><span>🎉 Tên trúng thăm</span><strong>${pick}</strong></div>
      <div class="result-row"><span>Đã bốc</span><strong>${drawn.length} / ${list.length} tên</strong></div>
      ${drawn.length ? '<div class="result-row"><span>Các tên đã trúng</span><strong>' + drawn.join(', ') + '</strong></div>' : ''}
    </div>`;
  });
  $('qs-reset').addEventListener('click', () => {
    drawn = [];
    $('qs-name-out').innerHTML = '<p class="note">Đã đặt lại. Bốc thăm lại từ đầu danh sách.</p>';
  });
  $('qs-names').addEventListener('input', () => { drawn = []; });

  // Xúc xắc.
  const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  $('qs-roll').addEventListener('click', () => {
    const n = +$('qs-dice-count').value || 1;
    const vals = [];
    for (let i = 0; i < n; i++) vals.push(1 + Math.floor(Math.random() * 6));
    const total = vals.reduce((a, b) => a + b, 0);
    $('qs-dice-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Kết quả</span><strong style="font-size:2em">${vals.map(v => FACES[v - 1]).join(' ')}</strong></div>
      <div class="result-row"><span>Các mặt</span><strong>${vals.join(' + ')} = ${total}</strong></div>
    </div>`;
  });

  // Đồng xu.
  let heads = 0, tails = 0;
  $('qs-flip').addEventListener('click', () => {
    const isHeads = Math.random() < 0.5;
    if (isHeads) heads += 1; else tails += 1;
    $('qs-heads').textContent = String(heads);
    $('qs-tails').textContent = String(tails);
    $('qs-coin-out').innerHTML = `<div class="result"><div class="result-row"><span>Kết quả</span><strong>${isHeads ? '🪙 Sấp' : '🪙 Ngửa'}</strong></div></div>`;
  });
  $('qs-coin-reset').addEventListener('click', () => {
    heads = 0; tails = 0;
    $('qs-heads').textContent = '0';
    $('qs-tails').textContent = '0';
    $('qs-coin-out').innerHTML = '';
  });
}
