// Tung xúc xắc & đồng xu cho lớp học: xúc xắc vẽ bằng CSS (1–3 viên,
// mặt đổi nhanh rồi dừng, hiện tổng), đồng xu xoay lật rồi dừng ở
// Sấp/Ngửa kèm thống kê trong phiên.
export const meta = {
  id: 'tung-xuc-xac-dong-xu',
  name: 'Tung xúc xắc & đồng xu',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Tung xúc xắc 1–3 viên có hiệu ứng lắc rồi dừng, hiện tổng điểm; tung đồng xu Sấp/Ngửa kèm thống kê số lần mỗi mặt.',
  keywords: 'tung xúc xắc, xúc xắc, tung đồng xu, sấp ngửa, xí ngầu, gieo xúc xắc',
  icon: '🎲',
  seoTitle: 'Tung xúc xắc & đồng xu — cho lớp học',
  seoDesc: 'Tung xúc xắc 1–3 viên, mặt đổi nhanh rồi dừng, hiện tổng điểm. Tung đồng xu Sấp/Ngửa kèm thống kê. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></span><div><h2>Tung xúc xắc &amp; đồng xu</h2><p class="muted">Xúc xắc lắc nhanh rồi dừng, hiện tổng điểm. Đồng xu xoay lật rồi dừng ở Sấp hoặc Ngửa.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="xx-tab-dice">Xúc xắc</button>
    <button type="button" class="tab" id="xx-tab-coin">Đồng xu</button>
  </div>

  <div id="xx-pane-dice">
    <div class="field"><label for="xx-dice-count">Số viên xúc xắc</label><select id="xx-dice-count"><option value="1">1 viên</option><option value="2" selected>2 viên</option><option value="3">3 viên</option></select></div>
    <div>
      <button type="button" class="btn btn-primary" id="xx-roll">Tung xúc xắc</button>
    </div>
    <div class="gv-hero" id="xx-dice-hero">
      <div class="gv-dice-row" id="xx-dice"></div>
      <span class="gv-hero-label" id="xx-total">Tổng: —</span>
    </div>
  </div>

  <div id="xx-pane-coin" style="display:none">
    <div>
      <button type="button" class="btn btn-primary" id="xx-flip">Tung đồng xu</button>
      <button type="button" class="btn btn-ghost" id="xx-coin-reset" data-uh-reset="1">Đặt lại thống kê</button>
    </div>
    <div class="gv-hero" id="xx-coin-hero">
      <div class="gv-coin" id="xx-coin">Sấp</div>
      <span class="gv-hero-label" id="xx-coin-note">Bấm "Tung đồng xu" để bắt đầu</span>
    </div>
    <div class="gv-chips" id="xx-coin-stats">
      <span class="gv-chip">Sấp: <strong id="xx-heads">0</strong></span>
      <span class="gv-chip">Ngửa: <strong id="xx-tails">0</strong></span>
    </div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Vị trí chấm trên mặt xúc xắc (lưới 3×3: hàng, cột).
  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  const CELL = { 1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 1], 5: [2, 2], 6: [2, 3], 7: [3, 1], 8: [3, 2], 9: [3, 3] };
  let rolling = false;
  let flipping = false;
  let heads = 0;
  let tails = 0;

  function dieHtml(v, shake) {
    return '<div class="gv-die' + (shake ? ' gv-shake' : '') + '">'
      + PIPS[v].map(c => '<span class="gv-pip" style="grid-row:' + CELL[c][0] + ';grid-column:' + CELL[c][1] + '"></span>').join('')
      + '</div>';
  }

  function renderDice(vals, shake) {
    $('xx-dice').innerHTML = vals.map(v => dieHtml(v, shake)).join('');
  }

  function diceCount() {
    return parseInt($('xx-dice-count').value, 10) || 2;
  }

  // Mặt ban đầu khi mở trang.
  renderDice([3, 5], false);

  ['dice', 'coin'].forEach(k => {
    $('xx-tab-' + k).addEventListener('click', () => {
      ['dice', 'coin'].forEach(j => {
        $('xx-tab-' + j).classList.toggle('tab-active', j === k);
        $('xx-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });

  $('xx-dice-count').addEventListener('change', () => {
    const n = diceCount();
    const vals = [];
    for (let i = 0; i < n; i++) vals.push(1 + Math.floor(Math.random() * 6));
    renderDice(vals, false);
    $('xx-total').textContent = 'Tổng: —';
  });

  $('xx-roll').addEventListener('click', () => {
    if (rolling) return;
    rolling = true;
    $('xx-roll').disabled = true;
    $('xx-total').textContent = 'Đang tung…';
    const n = diceCount();
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      const vals = [];
      for (let i = 0; i < n; i++) vals.push(1 + Math.floor(Math.random() * 6));
      renderDice(vals, true);
      if (ticks >= 11) {
        clearInterval(timer);
        const final = [];
        for (let i = 0; i < n; i++) final.push(1 + Math.floor(Math.random() * 6));
        renderDice(final, false);
        const total = final.reduce((a, b) => a + b, 0);
        const totalEl = $('xx-total');
        totalEl.textContent = 'Tổng: ' + total + (n > 1 ? '  (' + final.join(' + ') + ')' : '');
        totalEl.classList.remove('gv-pop');
        void totalEl.offsetWidth;
        totalEl.classList.add('gv-pop');
        rolling = false;
        $('xx-roll').disabled = false;
      }
    }, 80);
  });

  $('xx-flip').addEventListener('click', () => {
    if (flipping) return;
    flipping = true;
    $('xx-flip').disabled = true;
    $('xx-coin-note').textContent = 'Đang tung…';
    const coin = $('xx-coin');
    const isHeads = Math.random() < 0.5;
    coin.classList.remove('gv-flip');
    void coin.offsetWidth; // chạy lại hiệu ứng xoay
    coin.classList.add('gv-flip');
    setTimeout(() => {
      coin.classList.remove('gv-flip');
      coin.textContent = isHeads ? 'Sấp' : 'Ngửa';
      if (isHeads) { heads++; $('xx-heads').textContent = String(heads); }
      else { tails++; $('xx-tails').textContent = String(tails); }
      $('xx-coin-note').textContent = 'Lần này: ' + (isHeads ? 'Sấp' : 'Ngửa');
      flipping = false;
      $('xx-flip').disabled = false;
    }, 900);
  });

  $('xx-coin-reset').addEventListener('click', () => {
    heads = 0;
    tails = 0;
    $('xx-heads').textContent = '0';
    $('xx-tails').textContent = '0';
    $('xx-coin-note').textContent = 'Bấm "Tung đồng xu" để bắt đầu';
  });
}
