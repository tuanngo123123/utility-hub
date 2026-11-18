// Gọi tên ngẫu nhiên trong lớp: dán danh sách, gọi 1–5 bạn mỗi lần,
// không gọi lại người đã gọi cho tới khi hết danh sách. Tên chạy lướt
// rồi dừng ở bạn được gọi; tải được danh sách đã gọi về (.txt).
export const meta = {
  id: 'goi-ten-ngau-nhien',
  name: 'Gọi tên ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Gọi tên học sinh ngẫu nhiên trong lớp: không gọi lại người đã gọi, gọi 1–5 bạn mỗi lần, tải danh sách đã gọi về máy.',
  keywords: 'gọi tên ngẫu nhiên, gọi tên học sinh, chọn tên ngẫu nhiên, gọi bài, điểm danh lớp',
  icon: '🎯',
  seoTitle: 'Gọi tên ngẫu nhiên trong lớp — không gọi lại người đã gọi',
  seoDesc: 'Dán danh sách lớp, bấm gọi tên — chọn ngẫu nhiên 1–5 bạn, không gọi lại người đã gọi cho tới khi hết danh sách. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><div><h2>Gọi tên ngẫu nhiên</h2><p class="muted">Dán danh sách lớp, bấm gọi — tên chạy lướt rồi dừng ở bạn được gọi. Không gọi lại người đã gọi cho tới khi hết danh sách.</p></div></div>
  <div class="field"><label for="gt-names">Danh sách lớp (mỗi bạn một dòng)</label><textarea id="gt-names" rows="6" placeholder="Mai&#10;Nam&#10;Phương&#10;Tuấn">Mai
Nam
Phương
Tuấn
Hương
Đức
Linh
Khoa</textarea></div>
  <div class="field"><label for="gt-count">Số bạn gọi mỗi lần</label><select id="gt-count"><option value="1" selected>1 bạn</option><option value="2">2 bạn</option><option value="3">3 bạn</option><option value="4">4 bạn</option><option value="5">5 bạn</option></select></div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="gt-call">Gọi tên</button>
    <button type="button" class="btn btn-ghost" id="gt-reset" data-uh-reset="1">Gọi lại từ đầu</button>
  </div>
  <div class="gv-hero" id="gt-hero">
    <span class="gv-hero-label">Bạn được gọi</span>
    <div id="gt-big"><div class="gv-big">—</div></div>
    <span class="muted" id="gt-sub">Bấm "Gọi tên" để bắt đầu</span>
  </div>
  <div id="gt-status"></div>
  <div class="btn-row" id="gt-dl-row" style="display:none">
    <button type="button" class="btn gv-dl" id="gt-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải danh sách đã gọi (.txt)</button>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  let called = [];
  let busy = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function nameList() {
    const seen = {};
    const out = [];
    $('gt-names').value.split(/\n+/).forEach(s => {
      const t = s.trim();
      if (t && !seen[t]) { seen[t] = true; out.push(t); }
    });
    return out;
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
    const list = nameList();
    if (!called.length) { $('gt-status').innerHTML = ''; $('gt-dl-row').style.display = 'none'; return; }
    $('gt-status').innerHTML = '<p><strong>Đã gọi: ' + called.length + '/' + list.length + ' bạn</strong></p>'
      + '<div class="gv-chips">' + called.map(n => '<span class="gv-chip">' + esc(n) + '</span>').join('') + '</div>';
    $('gt-dl-row').style.display = '';
  }

  function resetAll() {
    called = [];
    $('gt-big').innerHTML = '<div class="gv-big">—</div>';
    $('gt-sub').textContent = 'Bấm "Gọi tên" để bắt đầu';
    updateStatus();
  }

  $('gt-call').addEventListener('click', () => {
    if (busy) return;
    const list = nameList();
    if (!list.length) {
      $('gt-sub').textContent = 'Danh sách đang trống — dán tên các bạn vào ô trên nhé.';
      return;
    }
    const remaining = list.filter(n => called.indexOf(n) === -1);
    if (!remaining.length) {
      $('gt-sub').textContent = 'Đã gọi hết danh sách — bấm "Gọi lại từ đầu" để gọi vòng mới.';
      return;
    }
    const count = Math.min(parseInt($('gt-count').value, 10) || 1, remaining.length);
    const shuffled = remaining.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    const picks = shuffled.slice(0, count);
    busy = true;
    $('gt-call').disabled = true;
    $('gt-sub').textContent = 'Đang chọn…';
    // Tên chạy lướt nhanh rồi dừng ở bạn được gọi.
    const big = $('gt-big');
    big.classList.add('gv-cycling');
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      const show = remaining[Math.floor(Math.random() * remaining.length)];
      big.innerHTML = '<div class="gv-big">' + esc(show) + '</div>';
      if (ticks >= 18) {
        clearInterval(timer);
        big.classList.remove('gv-cycling');
        big.classList.remove('gv-pop');
        void big.offsetWidth; // chạy lại hiệu ứng nảy
        big.classList.add('gv-pop');
        const cls = picks.length > 1 ? 'gv-big gv-big-sm' : 'gv-big';
        big.innerHTML = picks.map(p => '<div class="' + cls + '">' + esc(p) + '</div>').join('');
        picks.forEach(p => called.push(p));
        $('gt-sub').textContent = remaining.length - picks.length > 0
          ? 'Còn ' + (remaining.length - picks.length) + ' bạn chưa được gọi'
          : 'Đã gọi hết danh sách — bấm "Gọi lại từ đầu" để gọi vòng mới.';
        updateStatus();
        busy = false;
        $('gt-call').disabled = false;
      }
    }, 70);
  });

  $('gt-reset').addEventListener('click', resetAll);
  $('gt-names').addEventListener('input', resetAll);

  $('gt-download').addEventListener('click', () => {
    const list = nameList();
    const today = new Date().toLocaleDateString('vi-VN');
    let text = 'Danh sách đã gọi\nNgày xuất: ' + today + '\nTổng: ' + called.length + '/' + list.length + ' bạn\n\n';
    called.forEach((n, i) => { text += (i + 1) + '. ' + n + '\n'; });
    download('danh-sach-da-goi.txt', text);
  });
}
