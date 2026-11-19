// Bốc thăm số ngẫu nhiên: nhập khoảng từ–đến, bốc 1 số (số nhảy
// nhanh rồi chậm dần như máy slot rồi chốt), tùy chọn không lặp lại,
// hiện lịch sử các số đã bốc và tải lịch sử về (.txt). Số trúng hiện
// khổng lồ màu đỏ trên cùng; có chế độ Chiếu lớp và âm thanh.
export const meta = {
  id: 'boc-tham-so',
  name: 'Bốc thăm số ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Bốc thăm số ngẫu nhiên trong khoảng tùy chọn: số trúng hiện thật to, không lặp lại, hiện lịch sử các số đã bốc, tải lịch sử về máy.',
  keywords: 'bốc thăm số, số ngẫu nhiên, quay số, chọn số ngẫu nhiên, bốc số lớp học',
  icon: '🔢',
  seoTitle: 'Bốc thăm số ngẫu nhiên — không lặp, tải lịch sử về',
  seoDesc: 'Nhập khoảng từ–đến, bốc số ngẫu nhiên không lặp lại, xem lịch sử các số đã bốc và tải về. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg></span><div><h2>Bốc thăm số ngẫu nhiên</h2><p class="muted">Nhập khoảng số, bấm bốc — số nhảy nhanh rồi chậm dần và chốt. Bật "không lặp lại" để mỗi số chỉ bốc một lần.</p></div></div>
  <div class="gv-hero" id="bs-hero">
    <span class="gv-hero-label">Số được bốc</span>
    <div id="bs-big"><div class="gv-big gv-big-xl gv-big-red">—</div></div>
    <span class="muted" id="bs-sub">Bấm "Bốc số" để bắt đầu</span>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="bs-draw">Bốc số</button>
    <button type="button" class="btn" id="bs-stage">Chiếu lớp</button>
    <button type="button" class="btn btn-ghost gv-sound-btn" id="bs-sound">Âm thanh: Bật</button>
    <button type="button" class="btn btn-ghost" id="bs-reset" data-uh-reset="1">Bốc lại từ đầu</button>
  </div>
  <div id="bs-status"></div>
  <div class="btn-row gv-prep-only" id="bs-dl-row" style="display:none">
    <button type="button" class="btn gv-dl" id="bs-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải lịch sử (.txt)</button>
  </div>
  <div class="field gv-prep-only"><label for="bs-from">Từ số</label><input id="bs-from" type="number" value="1"></div>
  <div class="field gv-prep-only"><label for="bs-to">Đến số</label><input id="bs-to" type="number" value="100"></div>
  <div class="field gv-prep-only"><label><input type="checkbox" id="bs-norepeat" checked> Không lặp lại (số đã bốc sẽ không bốc lại)</label></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const REDUCED = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let drawn = [];
  let busy = false;
  let stageOpen = false;
  let stageEl = null;

  function gvSound() {
    return (typeof window !== 'undefined' && window.UhGvSound) ? window.UhGvSound : null;
  }
  function tick() { const s = gvSound(); if (s) s.tick(); }
  function fanfare() { const s = gvSound(); if (s) s.fanfare(); }

  function range() {
    const from = parseInt($('bs-from').value, 10);
    const to = parseInt($('bs-to').value, 10);
    if (isNaN(from) || isNaN(to)) return null;
    return { from, to };
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function updateStatus() {
    if (!drawn.length) { $('bs-status').innerHTML = ''; $('bs-dl-row').style.display = 'none'; return; }
    $('bs-status').innerHTML = '<p><strong>Đã bốc: ' + drawn.length + ' số</strong></p>'
      + '<div class="gv-chips">' + drawn.map((n, i) => '<span class="gv-chip">' + (i + 1) + '. ' + n + '</span>').join('') + '</div>';
    $('bs-dl-row').style.display = '';
  }

  function resetAll() {
    drawn = [];
    $('bs-big').innerHTML = '<div class="gv-big gv-big-xl gv-big-red">—</div>';
    $('bs-sub').textContent = 'Bấm "Bốc số" để bắt đầu';
    updateStatus();
    updateStage();
  }

  function settle(pick, noRepeat, total) {
    drawn.push(pick);
    const big = $('bs-big');
    big.classList.remove('gv-pop');
    void big.offsetWidth;
    big.classList.add('gv-pop');
    big.innerHTML = '<div class="gv-big gv-big-xl gv-big-red">' + pick + '</div>';
    $('bs-sub').textContent = noRepeat
      ? 'Còn ' + (total - drawn.length) + ' số chưa bốc trong khoảng'
      : 'Số vừa bốc: ' + pick;
    updateStatus();
    updateStage();
    fanfare();
    busy = false;
    $('bs-draw').disabled = false;
  }

  function draw() {
    if (busy) return;
    const r = range();
    if (!r) {
      $('bs-sub').textContent = 'Nhập số vào cả hai ô "Từ số" và "Đến số" nhé.';
      return;
    }
    if (r.from > r.to) {
      $('bs-sub').textContent = '"Từ số" phải nhỏ hơn hoặc bằng "Đến số".';
      return;
    }
    const noRepeat = $('bs-norepeat').checked;
    const total = r.to - r.from + 1;
    if (noRepeat && drawn.length >= total) {
      $('bs-sub').textContent = 'Đã bốc hết các số trong khoảng — bấm "Bốc lại từ đầu" để bốc vòng mới.';
      return;
    }
    // Chọn số trúng trước, hiệu ứng chỉ để vui mắt.
    let pick;
    do {
      pick = r.from + Math.floor(Math.random() * total);
    } while (noRepeat && drawn.indexOf(pick) !== -1);
    busy = true;
    $('bs-draw').disabled = true;
    $('bs-sub').textContent = 'Đang bốc…';
    if (REDUCED) {
      settle(pick, noRepeat, total);
      return;
    }
    // Số nhảy nhanh rồi chậm dần như máy slot.
    const big = $('bs-big');
    big.classList.add('gv-cycling');
    let delay = 60;
    (function step() {
      const show = r.from + Math.floor(Math.random() * total);
      big.innerHTML = '<div class="gv-big gv-big-xl gv-big-red">' + show + '</div>';
      tick();
      delay = Math.min(240, delay * 1.18);
      if (delay >= 240) {
        big.classList.remove('gv-cycling');
        settle(pick, noRepeat, total);
      } else {
        setTimeout(step, delay);
      }
    })();
  }

  // Chế độ Chiếu lớp: số hiện tại phóng to.
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="bs-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub">Bốc thăm số ngẫu nhiên</div>'
      + '<div class="gv-stage-big" id="bs-stage-big" style="color:#f87171">—</div>'
      + '<div class="gv-stage-sub" id="bs-stage-sub"></div>'
      + '<div class="gv-stage-actions"><button type="button" class="btn btn-primary" id="bs-stage-draw">Bốc tiếp</button></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#bs-stage-close').addEventListener('click', closeStage);
    stageEl.querySelector('#bs-stage-draw').addEventListener('click', () => draw());
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const big = stageEl.querySelector('#bs-stage-big');
    const sub = stageEl.querySelector('#bs-stage-sub');
    big.textContent = drawn.length ? String(drawn[drawn.length - 1]) : '—';
    sub.textContent = drawn.length ? 'Đã bốc ' + drawn.length + ' số' : 'Chưa bốc số nào';
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

  $('bs-draw').addEventListener('click', draw);
  $('bs-stage').addEventListener('click', openStage);
  $('bs-reset').addEventListener('click', resetAll);
  ['bs-from', 'bs-to'].forEach(id => $(id).addEventListener('input', resetAll));
  $('bs-norepeat').addEventListener('change', resetAll);

  $('bs-download').addEventListener('click', () => {
    const r = range();
    const today = new Date().toLocaleDateString('vi-VN');
    let text = 'Lịch sử bốc thăm số — khoảng ' + r.from + '–' + r.to + '\nNgày xuất: ' + today + '\nTổng: ' + drawn.length + ' số\n\n';
    drawn.forEach((n, i) => { text += (i + 1) + '. ' + n + '\n'; });
    download('lich-su-boc-tham.txt', text);
  });

  (function initSoundBtn() {
    const btn = $('bs-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();
}
