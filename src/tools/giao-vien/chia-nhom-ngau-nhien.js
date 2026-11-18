// Chia nhóm ngẫu nhiên trong lớp: theo số bạn mỗi nhóm hoặc số nhóm.
// Xáo trộn rồi chia đều — các nhóm lệch nhau tối đa 1 bạn. Mỗi nhóm
// một màu pastel riêng, mỗi bạn có vai trò (Nhóm trưởng/Thư ký/Phản
// biện/Thuyết trình). Sao chép và tải kết quả về (.txt) ngay trên
// trình duyệt. Có chế độ Chiếu lớp và âm thanh.
export const meta = {
  id: 'chia-nhom-ngau-nhien',
  name: 'Chia nhóm ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Chia lớp thành nhóm ngẫu nhiên: theo số bạn mỗi nhóm hoặc số nhóm, các nhóm lệch nhau tối đa 1 bạn, mỗi nhóm một màu riêng kèm vai trò từng bạn, nạp được lớp đã lưu, sao chép và tải kết quả về.',
  keywords: 'chia nhóm ngẫu nhiên, chia nhóm học sinh, chia đội, chia nhóm lớp học',
  icon: '👥',
  seoTitle: 'Chia nhóm ngẫu nhiên — đều người, có vai trò, tải kết quả về',
  seoDesc: 'Dán danh sách lớp, chia nhóm ngẫu nhiên theo số bạn mỗi nhóm hoặc số nhóm — các nhóm lệch nhau tối đa 1 bạn, mỗi bạn có vai trò. Sao chép và tải về miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><div><h2>Chia nhóm ngẫu nhiên</h2><p class="muted">Dán danh sách lớp, chọn cách chia — các nhóm được xáo trộn và chia đều, lệch nhau tối đa 1 bạn, mỗi bạn có một vai trò.</p></div></div>
  <div class="field"><label for="cn-class-load">Nạp từ lớp đã lưu <span class="muted">(lưu lớp trong công cụ Gọi tên)</span></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <select id="cn-class-load" style="flex:1;min-width:140px"><option value="">— Chọn lớp đã lưu —</option></select>
      <button type="button" class="btn" id="cn-class-load-btn">Nạp lớp</button>
    </div>
  </div>
  <p class="note" id="cn-class-msg" style="display:none"></p>
  <div class="field"><label for="cn-names">Danh sách lớp (mỗi bạn một dòng)</label><textarea id="cn-names" rows="6" placeholder="Mai&#10;Nam&#10;Phương&#10;Tuấn">Mai
Nam
Phương
Tuấn
Hương
Đức
Linh
Khoa
Thảo
Bình
An
Chi</textarea></div>
  <div class="field"><label for="cn-mode">Chia theo</label><select id="cn-mode"><option value="size" selected>Số bạn mỗi nhóm</option><option value="count">Số nhóm</option></select></div>
  <div class="field"><label for="cn-num" id="cn-num-label">Số bạn mỗi nhóm</label><input id="cn-num" type="number" min="2" max="50" value="4"></div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="cn-divide">Chia nhóm</button>
    <button type="button" class="btn" id="cn-stage">Chiếu lớp</button>
    <button type="button" class="btn btn-ghost gv-sound-btn" id="cn-sound">Âm thanh: Bật</button>
  </div>
  <div class="result" id="cn-out" hidden></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const ROLES = ['Nhóm trưởng', 'Thư ký', 'Phản biện', 'Thuyết trình'];
  let groups = [];
  let stageOpen = false;
  let stageEl = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gvSound() {
    return (typeof window !== 'undefined' && window.UhGvSound) ? window.UhGvSound : null;
  }
  function tick() { const s = gvSound(); if (s) s.tick(); }
  function fanfare() { const s = gvSound(); if (s) s.fanfare(); }

  // Tách danh sách tên — xử lý cả khi dán từ Excel: dòng có tab thì lấy
  // phần sau tab cuối (bỏ cột STT), bỏ số thứ tự đầu dòng ("1. An" →
  // "An"), bỏ dòng tiêu đề. Dùng helper dùng chung khi có, dự phòng
  // bằng logic giống hệt khi app.js chưa nạp.
  function parseNames(text) {
    const helper = (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
    if (helper) return helper.parse(text);
    const seen = {};
    const out = [];
    String(text == null ? '' : text).split(/\n+/).forEach(line => {
      let t = String(line).trim();
      if (!t) return;
      if (t.indexOf('\t') !== -1) {
        const parts = t.split('\t');
        t = parts[parts.length - 1].trim();
        if (!t) return;
      }
      t = t.replace(/^\d+\s*[.)\-–:]?\s+/, '').trim();
      if (!t) return;
      if (/^(họ\s*(và\s*)?tên|họ tên học sinh|tên học sinh|tên|stt)$/i.test(t)) return;
      if (!seen[t]) { seen[t] = true; out.push(t); }
    });
    return out;
  }

  function nameList() {
    return parseNames($('cn-names').value);
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

  function roleOf(i) { return ROLES[i % ROLES.length]; }

  function groupsText() {
    const today = new Date().toLocaleDateString('vi-VN');
    const total = groups.reduce((a, g) => a + g.length, 0);
    let text = 'Danh sách nhóm — ngày ' + today + '\nTổng: ' + total + ' bạn, ' + groups.length + ' nhóm\n\n';
    groups.forEach((g, i) => {
      text += 'Nhóm ' + (i + 1) + ' (' + g.length + ' bạn)\n';
      g.forEach((n, j) => { text += '- ' + n + ' (' + roleOf(j) + ')\n'; });
      text += '\n';
    });
    return text;
  }

  function groupCardsHtml() {
    return '<div class="gv-groups">'
      + groups.map((g, i) => '<div class="gv-group gv-group-c' + (i % 6) + ' gv-group-in" style="animation-delay:' + (i * 80) + 'ms"><h3>Nhóm ' + (i + 1) + ' · ' + g.length + ' bạn</h3><ul>'
        + g.map((n, j) => '<li>' + esc(n) + ' <span class="gv-role">— ' + roleOf(j) + '</span></li>').join('') + '</ul></div>').join('')
      + '</div>';
  }

  function render() {
    const out = $('cn-out');
    const total = groups.reduce((a, g) => a + g.length, 0);
    out.innerHTML = '<p><strong>Đã chia thành ' + groups.length + ' nhóm · ' + total + ' bạn</strong></p>'
      + groupCardsHtml()
      + '<div class="btn-row" style="margin-top:14px">'
      + '<button type="button" class="btn" id="cn-reshuffle">Chia lại</button>'
      + '<button type="button" class="btn" id="cn-copy">Sao chép kết quả</button>'
      + '<button type="button" class="btn gv-dl" id="cn-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải danh sách (.txt)</button>'
      + '</div>';
    out.hidden = false;
    out.style.display = '';
    $('cn-reshuffle').addEventListener('click', divide);
    $('cn-copy').addEventListener('click', () => {
      const btn = $('cn-copy');
      const done = () => {
        btn.textContent = 'Đã sao chép!';
        setTimeout(() => { btn.textContent = 'Sao chép kết quả'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(groupsText()).then(done, () => fallbackCopy(done));
      } else {
        fallbackCopy(done);
      }
    });
    $('cn-download').addEventListener('click', () => download('chia-nhom.txt', groupsText()));
    updateStage();
  }

  function fallbackCopy(done) {
    const ta = document.createElement('textarea');
    ta.value = groupsText();
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* bỏ qua */ }
    ta.remove();
    done();
  }

  function divide() {
    const list = nameList();
    const out = $('cn-out');
    if (list.length < 2) {
      out.innerHTML = '<p class="error">Cần ít nhất 2 bạn để chia nhóm.</p>';
      out.hidden = false;
      out.style.display = '';
      return;
    }
    const mode = $('cn-mode').value;
    const num = parseInt($('cn-num').value, 10);
    if (!num || num < 2) {
      out.innerHTML = '<p class="error">Nhập số từ 2 trở lên.</p>';
      out.hidden = false;
      out.style.display = '';
      return;
    }
    let groupCount;
    if (mode === 'count') {
      if (num > list.length) {
        out.innerHTML = '<p class="error">Số nhóm không được nhiều hơn số bạn (' + list.length + ' bạn).</p>';
        out.hidden = false;
        out.style.display = '';
        return;
      }
      groupCount = num;
    } else {
      groupCount = Math.ceil(list.length / num);
    }
    // Xáo trộn rồi chia vòng tròn — các nhóm lệch nhau tối đa 1 bạn.
    const shuffled = list.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    groups = [];
    for (let i = 0; i < groupCount; i++) groups.push([]);
    shuffled.forEach((n, i) => { groups[i % groupCount].push(n); });
    tick();
    render();
    fanfare();
  }

  // Chế độ Chiếu lớp: các nhóm hiện to trên nền tối.
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="cn-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub">Chia nhóm ngẫu nhiên</div>'
      + '<div id="cn-stage-body" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px"></div>'
      + '<div class="gv-stage-actions"><button type="button" class="btn btn-primary" id="cn-stage-divide">Chia lại</button></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#cn-stage-close').addEventListener('click', closeStage);
    stageEl.querySelector('#cn-stage-divide').addEventListener('click', () => divide());
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const body = stageEl.querySelector('#cn-stage-body');
    if (!groups.length) {
      body.innerHTML = '<div class="gv-stage-big" style="font-size:2rem">Chưa chia nhóm — bấm "Chia lại" để chia ngay.</div>';
      return;
    }
    const total = groups.reduce((a, g) => a + g.length, 0);
    body.innerHTML = '<div class="gv-stage-sub">' + groups.length + ' nhóm · ' + total + ' bạn</div>' + groupCardsHtml();
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

  $('cn-mode').addEventListener('change', () => {
    $('cn-num-label').textContent = $('cn-mode').value === 'count' ? 'Số nhóm' : 'Số bạn mỗi nhóm';
  });
  $('cn-divide').addEventListener('click', divide);
  $('cn-stage').addEventListener('click', openStage);

  // Nạp lớp đã lưu (lưu trong công cụ Gọi tên, khóa 'uh_gv_lop').
  (function initClassLoad() {
    const helper = (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
    const sel = $('cn-class-load');
    const msg = $('cn-class-msg');
    if (!helper) return;
    const map = helper.list();
    Object.keys(map).sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' (' + map[n].length + ' bạn)';
      sel.appendChild(opt);
    });
    $('cn-class-load-btn').addEventListener('click', () => {
      const name = sel.value;
      if (!name) {
        msg.textContent = 'Chọn một lớp đã lưu trước đã nhé (lưu lớp trong công cụ Gọi tên).';
        msg.style.display = '';
        return;
      }
      const names = helper.get(name);
      if (!names.length) {
        msg.textContent = 'Lớp này không còn tên nào.';
        msg.style.display = '';
        return;
      }
      $('cn-names').value = names.join('\n');
      groups = [];
      $('cn-out').hidden = true;
      msg.textContent = 'Đã nạp lớp ' + name + ' (' + names.length + ' bạn) — bấm "Chia nhóm" để chia.';
      msg.style.display = '';
    });
  })();

  (function initSoundBtn() {
    const btn = $('cn-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();
}
