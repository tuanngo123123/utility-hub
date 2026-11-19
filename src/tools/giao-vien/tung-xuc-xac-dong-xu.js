// Tung xúc xắc & đồng xu cho lớp học: xúc xắc vẽ bằng CSS (1–3 viên
// to để chiếu bảng, mặt đổi nhanh rồi dừng, hiện tổng rất to kèm dòng
// "Lần trước"), đồng xu to xoay lật rồi dừng ở Sấp/Ngửa kèm thống kê
// trong phiên. Kết quả nằm trên nút bấm; có chế độ Chiếu lớp và âm
// thanh.
export const meta = {
  id: 'tung-xuc-xac-dong-xu',
  name: 'Tung xúc xắc & đồng xu',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Tung xúc xắc 1–3 viên to để chiếu bảng, lắc rồi dừng, hiện tổng điểm rất to; tung đồng xu Sấp/Ngửa kèm thống kê số lần mỗi mặt.',
  keywords: 'tung xúc xắc, xúc xắc, tung đồng xu, sấp ngửa, xí ngầu, gieo xúc xắc',
  icon: '🎲',
  seoTitle: 'Tung xúc xắc & đồng xu — cho lớp học',
  seoDesc: 'Tung xúc xắc 1–3 viên, mặt đổi nhanh rồi dừng, hiện tổng điểm. Tung đồng xu Sấp/Ngửa kèm thống kê. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></span><div><h2>Tung xúc xắc &amp; đồng xu</h2><p class="muted">Xúc xắc lắc nhanh rồi dừng, hiện tổng điểm rất to. Đồng xu xoay lật rồi dừng ở Sấp hoặc Ngửa.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="xx-tab-dice">Xúc xắc</button>
    <button type="button" class="tab" id="xx-tab-coin">Đồng xu</button>
  </div>

  <div id="xx-pane-dice">
    <div class="gv-hero" id="xx-dice-hero">
      <div class="gv-dice-row" id="xx-dice"></div>
      <div class="gv-big" id="xx-total">Tổng: —</div>
      <span class="muted" id="xx-prev">Lần trước: chưa tung</span>
    </div>
    <div class="field gv-prep-only"><label for="xx-dice-count">Số viên xúc xắc</label><select id="xx-dice-count"><option value="1">1 viên</option><option value="2" selected>2 viên</option><option value="3">3 viên</option></select></div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="xx-roll">Tung xúc xắc</button>
      <button type="button" class="btn" id="xx-stage">Chiếu lớp</button>
      <button type="button" class="btn btn-ghost gv-sound-btn" id="xx-sound">Âm thanh: Bật</button>
    </div>
  </div>

  <div id="xx-pane-coin" style="display:none">
    <div class="gv-hero" id="xx-coin-hero">
      <div class="gv-coin" id="xx-coin">Sấp</div>
      <span class="gv-hero-label" id="xx-coin-note">Bấm "Tung đồng xu" để bắt đầu</span>
    </div>
    <div class="gv-chips" id="xx-coin-stats">
      <span class="gv-chip">Sấp: <strong id="xx-heads">0</strong></span>
      <span class="gv-chip">Ngửa: <strong id="xx-tails">0</strong></span>
    </div>
    <div class="btn-row" style="margin-top:12px">
      <button type="button" class="btn btn-primary" id="xx-flip">Tung đồng xu</button>
      <button type="button" class="btn" id="xx-stage-coin">Chiếu lớp</button>
      <button type="button" class="btn btn-ghost gv-sound-btn" id="xx-sound-coin">Âm thanh: Bật</button>
      <button type="button" class="btn btn-ghost" id="xx-coin-reset" data-uh-reset="1">Đặt lại thống kê</button>
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
  let tab = 'dice';
  let lastDice = null;
  let prevDice = null;
  let lastCoin = null;
  let stageOpen = false;
  let stageEl = null;

  function gvSound() {
    return (typeof window !== 'undefined' && window.UhGvSound) ? window.UhGvSound : null;
  }
  function tick() { const s = gvSound(); if (s) s.tick(); }
  function fanfare() { const s = gvSound(); if (s) s.fanfare(); }

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
      tab = k;
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
    // Đổi số viên thì lịch sử cũ không còn đúng nữa — đặt lại.
    lastDice = null;
    prevDice = null;
    $('xx-prev').textContent = 'Lần trước: chưa tung';
    updateStage();
  });

  function rollDice() {
    if (rolling) return;
    rolling = true;
    $('xx-roll').disabled = true;
    $('xx-total').textContent = 'Đang tung…';
    const n = diceCount();
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      tick();
      const vals = [];
      for (let i = 0; i < n; i++) vals.push(1 + Math.floor(Math.random() * 6));
      renderDice(vals, true);
      if (ticks >= 11) {
        clearInterval(timer);
        const final = [];
        for (let i = 0; i < n; i++) final.push(1 + Math.floor(Math.random() * 6));
        renderDice(final, false);
        const total = final.reduce((a, b) => a + b, 0);
        // Dòng "Lần trước" phải cập nhật ngay từ lần tung đầu tiên
        // (trước đây chỉ cập nhật từ lần thứ 2 vì lastDice ban đầu null).
        if (prevDice) {
          $('xx-prev').textContent = 'Lần trước: ' + prevDice.total + ' (' + prevDice.vals.join(' + ') + ')';
        } else {
          $('xx-prev').textContent = 'Vừa tung: ' + total + ' (' + final.join(' + ') + ')';
        }
        prevDice = { total: total, vals: final };
        lastDice = { total: total, vals: final };
        const totalEl = $('xx-total');
        totalEl.textContent = 'Tổng: ' + total + (n > 1 ? '  (' + final.join(' + ') + ')' : '');
        totalEl.classList.remove('gv-pop');
        void totalEl.offsetWidth;
        totalEl.classList.add('gv-pop');
        rolling = false;
        $('xx-roll').disabled = false;
        fanfare();
        updateStage();
      }
    }, 80);
  }

  function flipCoin() {
    if (flipping) return;
    flipping = true;
    $('xx-flip').disabled = true;
    $('xx-coin-note').textContent = 'Đang tung…';
    const coin = $('xx-coin');
    const isHeads = Math.random() < 0.5;
    coin.classList.remove('gv-flip');
    void coin.offsetWidth; // chạy lại hiệu ứng xoay
    coin.classList.add('gv-flip');
    tick();
    setTimeout(() => {
      coin.classList.remove('gv-flip');
      coin.textContent = isHeads ? 'Sấp' : 'Ngửa';
      lastCoin = isHeads ? 'Sấp' : 'Ngửa';
      if (isHeads) { heads++; $('xx-heads').textContent = String(heads); }
      else { tails++; $('xx-tails').textContent = String(tails); }
      $('xx-coin-note').textContent = 'Lần này: ' + (isHeads ? 'Sấp' : 'Ngửa') + ' · Sấp ' + heads + ' — Ngửa ' + tails;
      flipping = false;
      $('xx-flip').disabled = false;
      fanfare();
      updateStage();
    }, 900);
  }

  $('xx-roll').addEventListener('click', rollDice);
  $('xx-flip').addEventListener('click', flipCoin);

  $('xx-coin-reset').addEventListener('click', () => {
    heads = 0;
    tails = 0;
    $('xx-heads').textContent = '0';
    $('xx-tails').textContent = '0';
    $('xx-coin-note').textContent = 'Bấm "Tung đồng xu" để bắt đầu';
  });

  // Chế độ Chiếu lớp: kết quả hiện tại phóng to.
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="xx-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub" id="xx-stage-title">Tung xúc xắc</div>'
      + '<div class="gv-stage-big" id="xx-stage-big">—</div>'
      + '<div class="gv-stage-sub" id="xx-stage-sub"></div>'
      + '<div class="gv-stage-actions"><button type="button" class="btn btn-primary" id="xx-stage-act">Tung tiếp</button></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#xx-stage-close').addEventListener('click', closeStage);
    stageEl.querySelector('#xx-stage-act').addEventListener('click', () => {
      if (tab === 'coin') flipCoin(); else rollDice();
    });
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const title = stageEl.querySelector('#xx-stage-title');
    const big = stageEl.querySelector('#xx-stage-big');
    const sub = stageEl.querySelector('#xx-stage-sub');
    if (tab === 'coin') {
      title.textContent = 'Tung đồng xu';
      big.textContent = lastCoin || '—';
      sub.textContent = 'Sấp ' + heads + ' — Ngửa ' + tails;
    } else {
      title.textContent = 'Tung xúc xắc';
      if (lastDice) {
        big.textContent = String(lastDice.total);
        sub.textContent = lastDice.vals.join(' + ') + '  ·  ' + $('xx-prev').textContent;
      } else {
        big.textContent = '—';
        sub.textContent = 'Chưa tung lần nào';
      }
    }
  }

  function openStage() {
    ensureStage();
    updateStage();
    stageEl.style.display = 'flex';
    stageOpen = true;
  }

  function closeStage() {
    if (!stageEl) return;
    stageEl.style.display = 'none';
    stageOpen = false;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && stageOpen) closeStage();
  });

  $('xx-stage').addEventListener('click', openStage);
  $('xx-stage-coin').addEventListener('click', openStage);

  (function initSoundBtn() {
    const btns = [$('xx-sound'), $('xx-sound-coin')];
    const s = gvSound();
    if (!s) { btns.forEach(b => { b.style.display = 'none'; }); return; }
    const paint = () => { btns.forEach(b => { b.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); }); };
    btns.forEach(b => b.addEventListener('click', () => { s.toggle(); paint(); }));
    paint();
  })();
}
