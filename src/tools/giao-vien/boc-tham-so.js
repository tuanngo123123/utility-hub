// Bốc thăm số ngẫu nhiên: nhập khoảng từ–đến, bốc 1 số (số nhảy nhanh
// rồi chốt), tùy chọn không lặp lại, hiện lịch sử các số đã bốc và
// tải lịch sử về (.txt).
export const meta = {
  id: 'boc-tham-so',
  name: 'Bốc thăm số ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Bốc thăm số ngẫu nhiên trong khoảng tùy chọn: không lặp lại, hiện lịch sử các số đã bốc, tải lịch sử về máy.',
  keywords: 'bốc thăm số, số ngẫu nhiên, quay số, chọn số ngẫu nhiên, bốc số lớp học',
  icon: '🔢',
  seoTitle: 'Bốc thăm số ngẫu nhiên — không lặp, tải lịch sử về',
  seoDesc: 'Nhập khoảng từ–đến, bốc số ngẫu nhiên không lặp lại, xem lịch sử các số đã bốc và tải về. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg></span><div><h2>Bốc thăm số ngẫu nhiên</h2><p class="muted">Nhập khoảng số, bấm bốc — số nhảy nhanh rồi chốt. Bật "không lặp lại" để mỗi số chỉ bốc một lần.</p></div></div>
  <div class="field"><label for="bs-from">Từ số</label><input id="bs-from" type="number" value="1"></div>
  <div class="field"><label for="bs-to">Đến số</label><input id="bs-to" type="number" value="100"></div>
  <div class="field"><label><input type="checkbox" id="bs-norepeat" checked> Không lặp lại (số đã bốc sẽ không bốc lại)</label></div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="bs-draw">Bốc số</button>
    <button type="button" class="btn btn-ghost" id="bs-reset" data-uh-reset="1">Bốc lại từ đầu</button>
  </div>
  <div class="gv-hero" id="bs-hero">
    <span class="gv-hero-label">Số được bốc</span>
    <div id="bs-big"><div class="gv-big">—</div></div>
    <span class="muted" id="bs-sub">Bấm "Bốc số" để bắt đầu</span>
  </div>
  <div id="bs-status"></div>
  <div class="btn-row" id="bs-dl-row" style="display:none">
    <button type="button" class="btn gv-dl" id="bs-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải lịch sử (.txt)</button>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  let drawn = [];
  let busy = false;

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
      + '<div class="gv-chips">' + drawn.map(n => '<span class="gv-chip">' + n + '</span>').join('') + '</div>';
    $('bs-dl-row').style.display = '';
  }

  function resetAll() {
    drawn = [];
    $('bs-big').innerHTML = '<div class="gv-big">—</div>';
    $('bs-sub').textContent = 'Bấm "Bốc số" để bắt đầu';
    updateStatus();
  }

  $('bs-draw').addEventListener('click', () => {
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
    const big = $('bs-big');
    big.classList.add('gv-cycling');
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      const show = r.from + Math.floor(Math.random() * total);
      big.innerHTML = '<div class="gv-big">' + show + '</div>';
      if (ticks >= 14) {
        clearInterval(timer);
        big.classList.remove('gv-cycling');
        big.classList.remove('gv-pop');
        void big.offsetWidth; // chạy lại hiệu ứng nảy
        big.classList.add('gv-pop');
        big.innerHTML = '<div class="gv-big">' + pick + '</div>';
        drawn.push(pick);
        $('bs-sub').textContent = noRepeat
          ? 'Còn ' + (total - drawn.length) + ' số chưa bốc trong khoảng'
          : 'Số vừa bốc: ' + pick;
        updateStatus();
        busy = false;
        $('bs-draw').disabled = false;
      }
    }, 70);
  });

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
}
