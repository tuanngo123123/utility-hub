// Gọi tên ngẫu nhiên trong lớp: vòng quay SVG quay giảm tốc hoặc chế
// độ chạy tên; không gọi lại người đã gọi cho tới khi hết danh sách.
// Kết quả là "sân khấu" to trên cùng; thẻ người thắng có nút cộng
// điểm sang Bảng điểm lớp; có chế độ Chiếu lớp toàn màn hình, âm
// thanh Web Audio, phím R để gọi nhanh.
export const meta = {
  id: 'goi-ten-ngau-nhien',
  name: 'Gọi tên ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Gọi tên học sinh ngẫu nhiên bằng vòng quay hoặc chạy tên: không gọi lại người đã gọi, gọi 1–5 bạn mỗi lần, cộng điểm sang bảng điểm, lưu được nhiều lớp dùng chung cho cả mục Giáo viên, tải danh sách đã gọi về máy.',
  keywords: 'gọi tên ngẫu nhiên, gọi tên học sinh, chọn tên ngẫu nhiên, gọi bài, điểm danh lớp, vòng quay tên, lưu danh sách lớp',
  icon: '🎯',
  seoTitle: 'Gọi tên ngẫu nhiên trong lớp — vòng quay, không gọi lại người đã gọi',
  seoDesc: 'Dán danh sách lớp, bấm gọi tên — vòng quay giảm tốc rồi dừng ở bạn được gọi, không gọi lại người đã gọi cho tới khi hết danh sách. Lưu được nhiều lớp, dùng chung cho cả mục Giáo viên. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><div><h2>Gọi tên ngẫu nhiên</h2><p class="muted">Vòng quay dừng ở bạn được gọi — không gọi lại người đã gọi cho tới khi hết danh sách. Bấm phím R để gọi nhanh.</p></div></div>
  <div class="gv-app-noclass" id="gt-no-class" style="display:none">
    <p id="gt-no-class-text">Chưa có lớp nào — tạo lớp ở tab Lớp học để gọi tên.</p>
    <button type="button" class="btn btn-primary" id="gt-no-class-btn">Tạo lớp</button>
  </div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="gt-tab-wheel">Vòng quay</button>
    <button type="button" class="tab" id="gt-tab-text">Chạy tên</button>
  </div>
  <p class="note" id="gt-big-hint" style="display:none">Lớp đông (trên 24 bạn) nên dùng chế độ chữ để đọc rõ tên — vòng quay vẫn chọn được tay ở trên, nhưng chữ trên vòng sẽ nhỏ.</p>
  <div id="gt-pane-wheel">
    <div class="gv-wheel-wrap" id="gt-wheel-wrap">
      <div class="gv-wheel-pointer" aria-hidden="true"></div>
      <div class="gv-wheel" id="gt-wheel"></div>
      <div class="gv-wheel-hub" aria-hidden="true"></div>
    </div>
  </div>
  <div id="gt-pane-text" style="display:none">
    <div class="gv-hero" id="gt-hero">
      <span class="gv-hero-label">Bạn được gọi</span>
      <div id="gt-big"><div class="gv-big">—</div></div>
      <span class="muted" id="gt-sub">Bấm "Gọi tên" để bắt đầu</span>
    </div>
  </div>
  <div class="gv-winner" id="gt-winner" style="display:none"></div>
  <p class="muted" id="gt-wheel-sub" style="text-align:center">Bấm "Gọi tên" để quay</p>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="gt-call">Gọi tên</button>
    <button type="button" class="btn" id="gt-stage">Chiếu lớp</button>
    <button type="button" class="btn btn-ghost gv-sound-btn" id="gt-sound">Âm thanh: Bật</button>
    <button type="button" class="btn btn-ghost" id="gt-reset" data-uh-reset="1">Gọi lại từ đầu</button>
  </div>
  <div id="gt-status"></div>
  <div class="btn-row" id="gt-dl-row" style="display:none">
    <button type="button" class="btn gv-dl" id="gt-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải danh sách đã gọi (.txt)</button>
  </div>
  <div class="field"><label for="gt-names">Danh sách lớp (mỗi bạn một dòng)</label><textarea id="gt-names" rows="6" placeholder="Mai&#10;Nam&#10;Phương&#10;Tuấn">Mai
Nam
Phương
Tuấn
Hương
Đức
Linh
Khoa</textarea></div>
  <div class="gv-class-box" id="gt-class-box">
    <h3>Lớp đã lưu</h3>
    <p class="muted">Lưu danh sách từng lớp một lần — Gọi tên, Chia nhóm, Điểm danh và Bốc câu hỏi đều dùng chung, không cần dán lại mỗi buổi. Dán từ Excel cũng được: cột số thứ tự sẽ tự bỏ.</p>
    <div class="field"><label for="gt-class-load">Nạp lớp đã lưu</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <select id="gt-class-load" style="flex:1;min-width:140px"><option value="">— Chọn lớp đã lưu —</option></select>
        <button type="button" class="btn" id="gt-class-load-btn">Nạp lớp</button>
        <button type="button" class="btn btn-ghost" id="gt-class-del-btn">Xóa lớp</button>
      </div>
    </div>
    <div class="field"><label for="gt-class-name">Lưu danh sách trên thành lớp mới</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="gt-class-name" type="text" placeholder="Ví dụ: 6A" autocomplete="off" style="flex:1;min-width:120px">
        <button type="button" class="btn" id="gt-class-save-btn">Lưu lớp</button>
      </div>
    </div>
    <div class="field"><label>Xuất / nhập lớp (.txt, mỗi bạn một dòng)</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button type="button" class="btn gv-dl" id="gt-class-export-btn">Tải lớp đã chọn (.txt)</button>
        <label class="btn" for="gt-class-import" style="cursor:pointer">Nhập lớp từ file .txt</label>
        <input id="gt-class-import" type="file" accept=".txt,text/plain" style="position:absolute;width:1px;height:1px;opacity:0">
      </div>
    </div>
    <p class="note" id="gt-class-msg" style="display:none"></p>
  </div>
  <div class="field"><label for="gt-count">Số bạn gọi mỗi lần</label><select id="gt-count"><option value="1" selected>1 bạn</option><option value="2">2 bạn</option><option value="3">3 bạn</option><option value="4">4 bạn</option><option value="5">5 bạn</option></select></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Chế độ Bàn giáo viên: trang /giao-vien/lop-hoc/ nhúng công cụ này
  // với data-gv-app="1" — danh sách lấy từ lớp đang chọn ở tab Lớp học
  // (bạn vắng không bị gọi), khung quản lý lớp + ô dán tên của trang
  // rời được ẩn đi vì tab Lớp học đã làm việc đó.
  const IN_APP = !!(root && root.dataset && root.dataset.gvApp === '1');
  const REDUCED = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WHEEL_COLORS = ['#2563eb', '#0d9488', '#f97316', '#db2777', '#7c3aed', '#059669', '#eab308', '#dc2626'];
  const CONFETTI_COLORS = ['#2563eb', '#f59e0b', '#dc2626', '#059669', '#7c3aed', '#ec4899'];
  // Đã gọi theo VỊ TRÍ trong danh sách (chỉ số), không theo tên — lớp
  // có 2 bạn trùng họ tên thì gọi 1 bạn không tính cả bạn kia là đã
  // gọi. roundPicks giữ tên để hiện thẻ người thắng; roundPickIdx giữ
  // chỉ số song song để nút +1 cộng đúng vào bạn được gọi.
  let called = [];
  let roundPicks = [];
  let roundPickIdx = [];
  let busy = false;
  let mode = 'wheel';
  let wheelRotation = 0;
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

  // Tách danh sách tên — nhận diện cột như helper dùng chung (dán
  // Excel 3 cột STT/Họ tên/Giới tính thì lấy đúng cột tên, không lấy
  // cột giới tính làm tên). Dùng helper khi có, dự phòng bằng logic
  // giống hệt khi app.js chưa nạp.
  function parseNames(text) {
    const helper = (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
    if (helper) return helper.parse(text);
    const isHead = c => /^(stt|số thứ tự|họ(\s*và)?\s*tên|họ tên( học sinh)?|tên( học sinh)?|tên gọi|họ đệm|giới tính|giới|nam\/nữ|ghi chú|ngày sinh|địa chỉ|nơi sinh|lớp)$/i.test(c);
    const rows = String(text == null ? '' : text).split(/\r\n|\r|\n/).map(l => String(l).split('\t').map(c => c.trim()));
    const data = rows.filter(r => r.some(c => c !== '') && !r.some(isHead));
    if (!data.length) return [];
    const maxCols = Math.max.apply(null, data.map(r => r.length));
    const isStt = [], isGender = [];
    for (let j = 0; j < maxCols; j++) {
      const vals = data.map(r => r[j]).filter(v => v !== undefined && v !== '');
      isStt[j] = vals.length > 0 && vals.every(v => /^\d{1,3}[.)]?$/.test(v));
      isGender[j] = vals.length > 0 && vals.every(v => /^(nam|nữ|nu|m|f|male|female)$/i.test(v));
    }
    const gCol = isGender.indexOf(true);
    let nameCols = [];
    for (let j = 0; j < maxCols; j++) {
      if (isStt[j] || isGender[j]) continue;
      if (gCol === -1 || j < gCol) nameCols.push(j);
    }
    if (!nameCols.length && gCol !== -1) {
      for (let j = gCol + 1; j < maxCols; j++) { if (!isStt[j] && !isGender[j]) nameCols.push(j); }
    }
    const out = [];
    data.forEach(r => {
      let name = nameCols.map(c => r[c] || '').filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      name = name.replace(/^\d+\s*[.)\-–:]?\s+/, '').trim();
      if (name && !isHead(name)) out.push(name);
    });
    return out;
  }

  function nameList() {
    return parseNames($('gt-names').value);
  }

  function remainingIdx() {
    const n = nameList().length;
    const out = [];
    for (let i = 0; i < n; i++) if (called.indexOf(i) === -1) out.push(i);
    return out;
  }

  function remainingNames() {
    const list = nameList();
    return remainingIdx().map(i => list[i]);
  }

  // Tên các bạn đã gọi, theo đúng thứ tự gọi (2 bạn trùng tên hiện 2 lần).
  function calledNames() {
    const list = nameList();
    return called.map(i => list[i]).filter(n => !!n);
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

  function confetti(container) {
    if (REDUCED || !container) return;
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.className = 'gv-confetti';
      s.style.left = (Math.random() * 100) + '%';
      s.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      s.style.animationDelay = (Math.random() * 0.3) + 's';
      container.appendChild(s);
      setTimeout(() => s.remove(), 2200);
    }
  }

  function updateStatus() {
    const list = nameList();
    if (!called.length) { $('gt-status').innerHTML = ''; $('gt-dl-row').style.display = 'none'; return; }
    $('gt-status').innerHTML = '<p><strong>Đã gọi: ' + called.length + '/' + list.length + ' bạn</strong></p>'
      + '<div class="gv-chips">' + calledNames().map(n => '<span class="gv-chip">' + esc(n) + '</span>').join('') + '</div>';
    $('gt-dl-row').style.display = '';
  }

  // Nhãn trên vành vòng quay: chỉ hiện TÊN GỌI (từ cuối của họ tên)
  // để không bị cắt giữa chữ khi lớp đông; 2 bạn trùng tên gọi thì
  // thêm chữ đệm (Quốc Dũng / Minh Dũng); trùng cả họ tên thì đánh số.
  // Lúc công bố, thẻ người thắng vẫn hiện đủ họ tên chữ thật to.
  function wheelLabels(names) {
    const words = names.map(n => String(n).trim().split(/\s+/));
    const given = words.map(w => w[w.length - 1]);
    const givenCount = {};
    given.forEach(g => { givenCount[g] = (givenCount[g] || 0) + 1; });
    const labels = given.map((g, i) => {
      if (givenCount[g] > 1 && words[i].length > 1) return words[i].slice(-2).join(' ');
      return g;
    });
    const labelCount = {};
    labels.forEach(l => { labelCount[l] = (labelCount[l] || 0) + 1; });
    const seenNum = {};
    return labels.map(l => {
      if (labelCount[l] > 1) {
        seenNum[l] = (seenNum[l] || 0) + 1;
        return l + ' (' + seenNum[l] + ')';
      }
      return l;
    });
  }

  // Cắt nhãn dài ở ranh giới từ (không cắt giữa chữ), thêm "…".
  function shortenLabel(label, maxLen) {
    if (label.length <= maxLen) return label;
    const cut = label.slice(0, maxLen - 1);
    const sp = cut.lastIndexOf(' ');
    return (sp > 0 ? cut.slice(0, sp) : cut) + '…';
  }

  // Vẽ vòng quay SVG từ danh sách tên còn lại.
  function drawWheel() {
    const names = remainingNames();
    const labels = wheelLabels(names);
    const n = names.length;
    const el = $('gt-wheel');
    el.style.transition = 'none';
    el.style.transform = 'rotate(0deg)';
    wheelRotation = 0;
    void el.offsetWidth;
    el.style.transition = '';
    if (!n) {
      el.innerHTML = '<svg viewBox="0 0 300 300" role="img" aria-label="Vòng quay trống"><circle cx="150" cy="150" r="145" fill="#e2e8f0"/><text x="150" y="150" fill="#64748b" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="middle">Đã gọi hết</text></svg>';
      return;
    }
    const fontSize = n <= 8 ? 14 : n <= 16 ? 11 : 9;
    const parts = ['<svg viewBox="0 0 300 300" role="img" aria-label="Vòng quay tên">'];
    if (n === 1) {
      parts.push('<circle cx="150" cy="150" r="145" fill="' + WHEEL_COLORS[0] + '"/>');
      parts.push('<text x="150" y="150" fill="#fff" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="middle">' + esc(shortenLabel(names[0], 14)) + '</text>');
    } else {
      for (let i = 0; i < n; i++) {
        const a0 = (i * 360 / n) * Math.PI / 180;
        const a1 = ((i + 1) * 360 / n) * Math.PI / 180;
        const x0 = 150 + 145 * Math.cos(a0), y0 = 150 + 145 * Math.sin(a0);
        const x1 = 150 + 145 * Math.cos(a1), y1 = 150 + 145 * Math.sin(a1);
        const large = (360 / n) > 180 ? 1 : 0;
        parts.push('<path d="M150,150 L' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' A145,145 0 ' + large + ' 1 ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Z" fill="' + WHEEL_COLORS[i % WHEEL_COLORS.length] + '" stroke="#fff" stroke-width="1.5"/>');
        const mid = (a0 + a1) / 2;
        const tx = 150 + 98 * Math.cos(mid), ty = 150 + 98 * Math.sin(mid);
        const deg = mid * 180 / Math.PI;
        const rot = (deg > 90 && deg < 270) ? deg + 180 : deg;
        parts.push('<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" fill="#fff" font-size="' + fontSize + '" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + rot.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')">' + esc(shortenLabel(labels[i], 14)) + '</text>');
      }
    }
    parts.push('<circle cx="150" cy="150" r="145" fill="none" stroke="#e2e8f0" stroke-width="2"/>');
    parts.push('</svg>');
    el.innerHTML = parts.join('');
  }

  // Chế độ chạy tên: khi đã có bạn được gọi thì chỉ hiện khối lớn (thẻ
  // người thắng), ẩn hộp chạy tên để không trùng 2 khối "Bạn được gọi".
  function syncHero() {
    $('gt-hero').style.display = (mode === 'text' && roundPicks.length) ? 'none' : '';
  }

  function renderWinner() {
    const w = $('gt-winner');
    if (!roundPicks.length) { w.style.display = 'none'; w.innerHTML = ''; syncHero(); return; }
    const cls = roundPicks.length > 1 ? 'gv-winner-name gv-winner-name-sm' : 'gv-winner-name';
    let html = '<p class="gv-hero-label">Bạn được gọi</p>';
    roundPicks.forEach(p => {
      html += '<div class="' + cls + '">' + esc(p) + '</div>';
    });
    html += '<div class="btn-row" style="justify-content:center;margin-top:10px">';
    roundPicks.forEach((p, i) => {
      // Nút mang cả tên (để hiện) và chỉ số (để cộng đúng bạn khi
      // trùng tên — tên thì không phân biệt được 2 bạn trùng họ tên).
      html += '<button type="button" class="btn" data-add-point="' + esc(p) + '" data-add-point-idx="' + roundPickIdx[i] + '">+1 điểm cho ' + esc(p) + '</button>';
    });
    html += '</div><p class="muted" id="gt-point-msg" style="margin-top:8px"></p>';
    w.innerHTML = html;
    w.style.display = '';
    w.classList.remove('gv-pop');
    void w.offsetWidth;
    w.classList.add('gv-pop');
    syncHero();
  }

  function addPoint(name, idx, btn) {
    // Trong Bàn giáo viên: điểm ghi thẳng vào bản ghi lớp (nguồn duy
    // nhất cho cột Điểm ở tab Lớp học và Bảng điểm chế độ Cá nhân).
    // Cộng theo CHỈ SỐ, không theo tên — 2 bạn trùng họ tên thì tên
    // không phân biệt được. Lưu ý: danh sách gọi chỉ gồm bạn không
    // vắng nên phải ánh xạ chỉ số đó sang vị trí trong bản ghi lớp.
    if (IN_APP) {
      const helper = gvClasses();
      const active = helper && typeof helper.active === 'function' ? helper.active() : '';
      if (helper && active && typeof helper.getRecords === 'function' && typeof helper.setPointsAt === 'function'
          && Number.isInteger(idx) && idx >= 0) {
        const recs = helper.getRecords(active) || [];
        let seen = -1, recIdx = -1;
        for (let i = 0; i < recs.length; i++) {
          if (recs[i].absent) continue;
          seen++;
          if (seen === idx) { recIdx = i; break; }
        }
        if (recIdx >= 0 && helper.setPointsAt(active, recIdx, (recs[recIdx].points || 0) + 1)) {
          btn.textContent = 'Đã cộng ✓';
          btn.disabled = true;
          const msg = $('gt-point-msg');
          if (msg) msg.innerHTML = 'Đã cộng 1 điểm cho ' + esc(name) + ' — xem ở <a href="/giao-vien/lop-hoc/?tab=bang-diem">Bảng điểm lớp</a>.';
          tick();
          return;
        }
      }
      // Dự phòng khi không ánh xạ được chỉ số: cộng theo tên như cũ.
      if (helper && typeof helper.addPoints === 'function' && active) {
        helper.addPoints(active, name, 1);
        btn.textContent = 'Đã cộng ✓';
        btn.disabled = true;
        const msg = $('gt-point-msg');
        if (msg) msg.innerHTML = 'Đã cộng 1 điểm cho ' + esc(name) + ' — xem ở <a href="/giao-vien/lop-hoc/?tab=bang-diem">Bảng điểm lớp</a>.';
        tick();
        return;
      }
    }
    let arr = [];
    try {
      arr = JSON.parse(localStorage.getItem('uh_bangdiemlop') || '[]');
      if (!Array.isArray(arr)) arr = [];
    } catch (e) { arr = []; }
    // Trang rời: bảng điểm lưu theo tên — tìm mục thứ k trùng tên
    // (k = lượt xuất hiện của bạn được gọi trong danh sách hiện tại)
    // để không cộng nhầm vào bạn trùng tên khác. Thiếu mục thì đệm
    // các mục 0 điểm cho các bạn trùng tên chưa có mục, để mục mới
    // nằm đúng lượt xuất hiện.
    let occ = 0;
    if (Number.isInteger(idx) && idx >= 0) {
      const list = nameList();
      for (let i = 0; i <= idx && i < list.length; i++) if (list[i] === name) occ++;
    }
    if (occ < 1) occ = 1;
    let seen = 0, target = null;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].name === name) {
        seen++;
        if (seen === occ) { target = arr[i]; break; }
      }
    }
    if (target) target.score = (target.score || 0) + 1;
    else {
      while (seen < occ - 1) { arr.push({ name: name, score: 0 }); seen++; }
      arr.push({ name: name, score: 1 });
    }
    try { localStorage.setItem('uh_bangdiemlop', JSON.stringify(arr)); } catch (e) { /* bỏ qua */ }
    btn.textContent = 'Đã cộng ✓';
    btn.disabled = true;
    const msg = $('gt-point-msg');
    const bdUrl = IN_APP ? '/giao-vien/lop-hoc/?tab=bang-diem' : '/cong-cu/bang-diem-lop/';
    if (msg) msg.innerHTML = 'Đã cộng 1 điểm cho ' + esc(name) + ' — xem ở <a href="' + bdUrl + '">Bảng điểm lớp</a>.';
    tick();
  }

  $('gt-winner').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-add-point]');
    if (!btn || btn.disabled) return;
    addPoint(btn.getAttribute('data-add-point'), parseInt(btn.getAttribute('data-add-point-idx'), 10), btn);
  });

  // Chế độ Chiếu lớp: lớp phủ toàn màn hình chỉ hiện kết quả.
  function ensureStage() {
    if (stageEl) return stageEl;
    stageEl = document.createElement('div');
    stageEl.className = 'gv-stage';
    stageEl.style.display = 'none';
    stageEl.innerHTML = '<button type="button" class="gv-stage-close" id="gt-stage-close">Đóng ✕</button>'
      + '<div class="gv-stage-sub">Gọi tên ngẫu nhiên</div>'
      + '<div class="gv-stage-big" id="gt-stage-big">—</div>'
      + '<div class="gv-stage-sub" id="gt-stage-sub"></div>'
      + '<div class="gv-stage-actions"><button type="button" class="btn btn-primary" id="gt-stage-call">Gọi tiếp</button></div>';
    document.body.appendChild(stageEl);
    stageEl.querySelector('#gt-stage-close').addEventListener('click', closeStage);
    stageEl.querySelector('#gt-stage-call').addEventListener('click', () => call());
    return stageEl;
  }

  function updateStage() {
    if (!stageEl) return;
    const big = stageEl.querySelector('#gt-stage-big');
    const sub = stageEl.querySelector('#gt-stage-sub');
    const list = nameList();
    big.textContent = roundPicks.length ? roundPicks.join(' · ') : '—';
    sub.textContent = 'Đã gọi ' + called.length + '/' + list.length + ' bạn';
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
    // Trong Bàn giáo viên, phím Space/Enter của app gọi tên thay phím R
    // (tránh gọi nhầm khi giáo viên đang ở tab khác).
    if (IN_APP) return;
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if ((e.key === 'r' || e.key === 'R') && !typing && !busy) { e.preventDefault(); call(); }
  });

  // Quay 1 lần, dừng ở bạn đã chọn trước (theo chỉ số trong danh sách
  // để 2 bạn trùng tên dừng đúng ô của mình). done() chạy khi dừng hẳn.
  function spinOnce(pickIdx, done) {
    const rem = remainingIdx();
    const idx = rem.indexOf(pickIdx);
    const n = rem.length;
    const el = $('gt-wheel');
    if (idx < 0 || n === 0) { done(); return; }
    const seg = 360 / n;
    const center = (idx + 0.5) * seg;
    let r = (270 - center + 360) % 360;
    r += (Math.random() - 0.5) * seg * 0.5;
    const total = wheelRotation + 360 * 5 + r;
    wheelRotation = total;
    $('gt-wheel-sub').textContent = 'Đang quay…';
    if (REDUCED) {
      el.style.transition = 'none';
      el.style.transform = 'rotate(' + total + 'deg)';
      setTimeout(done, 60);
      return;
    }
    el.style.transition = '';
    // Tiếng tick chậm dần theo vòng quay.
    let delay = 70;
    let ticking = true;
    (function tickLoop() {
      if (!ticking) return;
      tick();
      delay = Math.min(240, delay * 1.12);
      setTimeout(tickLoop, delay);
    })();
    requestAnimationFrame(() => {
      el.style.transform = 'rotate(' + total + 'deg)';
    });
    setTimeout(() => {
      ticking = false;
      done();
    }, 3700);
  }

  function announcePick(pickIdx) {
    called.push(pickIdx);
    roundPicks.push(nameList()[pickIdx]);
    roundPickIdx.push(pickIdx);
    renderWinner();
    updateStatus();
    updateStage();
    fanfare();
    // Pháo giấy rơi trên khung đang hiện (vòng quay hoặc thẻ người thắng
    // ở chế độ chạy tên — khung vòng quay đang ẩn thì không thấy gì).
    confetti(mode === 'text' ? $('gt-winner') : $('gt-wheel-wrap'));
    const left = remainingNames().length;
    $('gt-wheel-sub').textContent = left > 0
      ? 'Còn ' + left + ' bạn chưa được gọi'
      : 'Đã gọi hết danh sách — bấm "Gọi lại từ đầu" để gọi vòng mới.';
    $('gt-sub').textContent = $('gt-wheel-sub').textContent;
  }

  // Chế độ chạy tên cũ (lớp đông, tên dài).
  function callTextMode(picks, onDone) {
    const remaining = remainingNames();
    busy = true;
    $('gt-call').disabled = true;
    $('gt-sub').textContent = 'Đang chọn…';
    if (REDUCED) {
      picks.forEach(p => announcePick(p));
      busy = false;
      $('gt-call').disabled = false;
      onDone();
      return;
    }
    const big = $('gt-big');
    big.classList.add('gv-cycling');
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      tick();
      const show = remaining[Math.floor(Math.random() * remaining.length)];
      big.innerHTML = '<div class="gv-big">' + esc(show) + '</div>';
      if (ticks >= 18) {
        clearInterval(timer);
        big.classList.remove('gv-cycling');
        picks.forEach(p => announcePick(p));
        // Hộp chạy tên đã ẩn sau khi công bố (chỉ giữ thẻ người thắng
        // khổng lồ) nên không cần ghi tên vào hộp nữa.
        busy = false;
        $('gt-call').disabled = false;
        onDone();
      }
    }, 70);
  }

  function call() {
    if (busy) return;
    const list = nameList();
    const remaining = remainingIdx();
    if (!list.length) {
      $('gt-wheel-sub').textContent = 'Danh sách đang trống — dán tên các bạn vào ô dưới nhé.';
      $('gt-sub').textContent = $('gt-wheel-sub').textContent;
      return;
    }
    if (!remaining.length) {
      $('gt-wheel-sub').textContent = 'Đã gọi hết danh sách — bấm "Gọi lại từ đầu" để gọi vòng mới.';
      $('gt-sub').textContent = $('gt-wheel-sub').textContent;
      return;
    }
    const count = Math.min(parseInt($('gt-count').value, 10) || 1, remaining.length);
    const shuffled = remaining.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    const picks = shuffled.slice(0, count);
    roundPicks = [];
    roundPickIdx = [];
    $('gt-winner').style.display = 'none';
    syncHero();
    if (mode === 'text') {
      callTextMode(picks, () => {});
      return;
    }
    // Chế độ vòng quay: quay lần lượt từng bạn.
    busy = true;
    $('gt-call').disabled = true;
    let i = 0;
    (function next() {
      if (i >= picks.length) {
        busy = false;
        $('gt-call').disabled = false;
        drawWheel();
        return;
      }
      const pick = picks[i++];
      spinOnce(pick, () => {
        announcePick(pick);
        if (i < picks.length) {
          setTimeout(() => { drawWheel(); next(); }, 800);
        } else {
          next();
        }
      });
    })();
  }

  function resetAll() {
    called = [];
    roundPicks = [];
    roundPickIdx = [];
    $('gt-big').innerHTML = '<div class="gv-big">—</div>';
    $('gt-sub').textContent = 'Bấm "Gọi tên" để bắt đầu';
    $('gt-wheel-sub').textContent = 'Bấm "Gọi tên" để quay';
    $('gt-winner').style.display = 'none';
    $('gt-winner').innerHTML = '';
    updateStatus();
    updateStage();
    syncHero();
    drawWheel();
  }

  function setMode(m) {
    mode = m;
    $('gt-tab-wheel').classList.toggle('tab-active', m === 'wheel');
    $('gt-tab-text').classList.toggle('tab-active', m === 'text');
    $('gt-pane-wheel').style.display = m === 'wheel' ? '' : 'none';
    $('gt-pane-text').style.display = m === 'text' ? '' : 'none';
    syncHero();
    if (m === 'wheel') drawWheel();
  }

  // Lớp đông (trên 24 bạn): vòng quay không đọc được tên nên tự động
  // mở ở chế độ chạy tên + hiện gợi ý; giáo viên vẫn chọn vòng quay
  // được tay nếu muốn (gợi ý vẫn hiện khi danh sách còn đông).
  function checkBigClass() {
    const big = nameList().length > 24;
    $('gt-big-hint').style.display = big ? '' : 'none';
    if (big && mode === 'wheel') setMode('text');
  }

  $('gt-tab-wheel').addEventListener('click', () => setMode('wheel'));
  $('gt-tab-text').addEventListener('click', () => setMode('text'));
  $('gt-call').addEventListener('click', call);
  $('gt-stage').addEventListener('click', openStage);
  $('gt-reset').addEventListener('click', resetAll);
  $('gt-names').addEventListener('input', () => { resetAll(); checkBigClass(); });

  $('gt-download').addEventListener('click', () => {
    const list = nameList();
    const today = new Date().toLocaleDateString('vi-VN');
    let text = 'Danh sách đã gọi\nNgày xuất: ' + today + '\nTổng: ' + called.length + '/' + list.length + ' bạn\n\n';
    calledNames().forEach((n, i) => { text += (i + 1) + '. ' + n + '\n'; });
    download('danh-sach-da-goi.txt', text);
  });

  // Nút âm thanh dùng chung (helper trong app.js).
  (function initSoundBtn() {
    const btn = $('gt-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();

  // Quản lý lớp lưu sẵn (dùng chung cho cả mục Giáo viên qua helper
  // window.UhGvClasses trong app.js, khóa localStorage 'uh_gv_lop').
  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  function classMsg(text) {
    const el = $('gt-class-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  function refreshClassSelect() {
    const sel = $('gt-class-load');
    const helper = gvClasses();
    const map = helper ? helper.list() : {};
    const names = Object.keys(map).sort();
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Chọn lớp đã lưu —</option>'
      + names.map(n => '<option value="' + esc(n) + '">' + esc(n) + ' (' + map[n].length + ' bạn)</option>').join('');
    if (cur && map[cur]) sel.value = cur;
    $('gt-class-export-btn').disabled = !sel.value;
  }

  $('gt-class-load').addEventListener('change', () => {
    $('gt-class-export-btn').disabled = !$('gt-class-load').value;
  });

  $('gt-class-load-btn').addEventListener('click', () => {
    const helper = gvClasses();
    const name = $('gt-class-load').value;
    if (!helper || !name) { classMsg('Chọn một lớp đã lưu trước đã nhé.'); return; }
    const names = helper.get(name);
    if (!names.length) { classMsg('Lớp này không còn tên nào.'); return; }
    $('gt-names').value = names.join('\n');
    resetAll();
    checkBigClass();
    classMsg('Đã nạp lớp ' + name + ' (' + names.length + ' bạn).');
  });

  $('gt-class-save-btn').addEventListener('click', () => {
    const helper = gvClasses();
    const name = $('gt-class-name').value.trim();
    const names = nameList();
    if (!name) { classMsg('Gõ tên lớp trước đã nhé (ví dụ: 6A).'); return; }
    if (!names.length) { classMsg('Danh sách đang trống — dán tên các bạn vào ô trên trước đã nhé.'); return; }
    if (!helper) { classMsg('Trình duyệt chưa nạp xong phần lưu lớp — tải lại trang rồi thử lại nhé.'); return; }
    const existed = !!helper.list()[name];
    helper.save(name, names);
    refreshClassSelect();
    $('gt-class-load').value = name;
    $('gt-class-export-btn').disabled = false;
    classMsg(existed
      ? 'Đã cập nhật lớp ' + name + ' (' + names.length + ' bạn).'
      : 'Đã lưu lớp ' + name + ' (' + names.length + ' bạn) — Chia nhóm, Điểm danh và Bốc câu hỏi cũng dùng được lớp này.');
  });

  let delArmed = false;
  let delTimer = null;
  $('gt-class-del-btn').addEventListener('click', () => {
    const helper = gvClasses();
    const name = $('gt-class-load').value;
    const btn = $('gt-class-del-btn');
    if (!helper || !name) { classMsg('Chọn một lớp đã lưu trước đã nhé.'); return; }
    if (!delArmed) {
      delArmed = true;
      btn.textContent = 'Bấm lại để xóa ' + name;
      delTimer = setTimeout(() => {
        delArmed = false;
        btn.textContent = 'Xóa lớp';
      }, 3000);
      return;
    }
    clearTimeout(delTimer);
    delArmed = false;
    btn.textContent = 'Xóa lớp';
    helper.remove(name);
    refreshClassSelect();
    classMsg('Đã xóa lớp ' + name + '.');
  });

  $('gt-class-export-btn').addEventListener('click', () => {
    const helper = gvClasses();
    const name = $('gt-class-load').value;
    if (!helper || !name) { classMsg('Chọn một lớp đã lưu trước đã nhé.'); return; }
    const names = helper.get(name);
    download('lop-' + name + '.txt', names.join('\n') + '\n');
    classMsg('Đã tải danh sách lớp ' + name + ' (' + names.length + ' bạn).');
  });

  $('gt-class-import').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const names = parseNames(reader.result);
      if (!names.length) { classMsg('File không có tên nào đọc được — mỗi bạn một dòng nhé.'); return; }
      const helper = gvClasses();
      if (!helper) { classMsg('Trình duyệt chưa nạp xong phần lưu lớp — tải lại trang rồi thử lại nhé.'); return; }
      const fromInput = $('gt-class-name').value.trim();
      const fromFile = file.name.replace(/\.txt$/i, '').replace(/^lop-/i, '');
      const name = fromInput || fromFile || 'Lớp mới';
      helper.save(name, names);
      refreshClassSelect();
      $('gt-class-load').value = name;
      $('gt-class-export-btn').disabled = false;
      classMsg('Đã nhập lớp ' + name + ' (' + names.length + ' bạn) từ file.');
    };
    reader.readAsText(file);
    ev.target.value = '';
  });

  // --- Chế độ Bàn giáo viên: nạp tên từ lớp đang chọn (trừ bạn vắng).
  // App gọi root._gvRefresh() mỗi lần mở lại tab này; chỉ nạp lại khi
  // danh sách đổi (so chữ ký) để không mất danh sách đã gọi giữa buổi.
  let appSig = '';
  function loadFromActiveClass() {
    const helper = gvClasses();
    if (!helper || typeof helper.getRecords !== 'function' || typeof helper.active !== 'function') return;
    const active = helper.active();
    const recs = active ? helper.getRecords(active) : [];
    const names = recs.filter(r => !r.absent).map(r => r.name);
    const sig = active + '\n' + names.join('\n');
    if (sig === appSig) return;
    appSig = sig;
    // Chưa có lớp (hoặc lớp chưa có bạn nào để gọi): hiện đúng 1 nút
    // dẫn về tab Lớp học, thay cho ô dán danh sách của trang rời.
    const noClass = $('gt-no-class');
    if (noClass) {
      const show = names.length === 0;
      noClass.style.display = show ? '' : 'none';
      if (show) {
        $('gt-no-class-text').textContent = active
          ? 'Lớp ' + active + ' chưa có bạn nào để gọi — thêm bạn hoặc bỏ đánh dấu Vắng ở tab Lớp học.'
          : 'Chưa có lớp nào — tạo lớp ở tab Lớp học để gọi tên.';
        $('gt-no-class-btn').textContent = active ? 'Mở tab Lớp học' : 'Tạo lớp';
      }
    }
    // Danh sách đổi (đổi lớp / sửa tên / đánh vắng): giữ lại các bạn đã
    // gọi còn có mặt — khớp theo tên + lượt xuất hiện để 2 bạn trùng
    // tên không bị tính nhầm cho nhau (chỉ số cũ vô hiệu khi danh
    // sách đổi nên phải ánh xạ lại qua tên, trước khi ghi đè ô tên).
    const prevNames = nameList();
    const prevCalled = called.map(i => prevNames[i]).filter(n => !!n);
    const taken = {};
    called = [];
    prevCalled.forEach(n => {
      for (let j = 0; j < names.length; j++) {
        if (names[j] === n && !taken[j]) { taken[j] = true; called.push(j); break; }
      }
    });
    // Ánh xạ lại cả tên và chỉ số của vòng gọi qua tên + lượt xuất
    // hiện (giống called) để nút +1 vẫn trỏ đúng bạn sau khi danh
    // sách đổi; vẽ lại thẻ người thắng cho nút mang chỉ số mới.
    const prevPicks = roundPicks.slice();
    const taken2 = {};
    roundPicks = [];
    roundPickIdx = [];
    prevPicks.forEach(n => {
      for (let j = 0; j < names.length; j++) {
        if (names[j] === n && !taken2[j]) { taken2[j] = true; roundPicks.push(n); roundPickIdx.push(j); break; }
      }
    });
    $('gt-names').value = names.join('\n');
    if (!roundPicks.length) {
      $('gt-winner').style.display = 'none';
      $('gt-winner').innerHTML = '';
      $('gt-big').innerHTML = '<div class="gv-big">—</div>';
      $('gt-sub').textContent = names.length
        ? 'Bấm "Gọi tên" để bắt đầu'
        : 'Lớp này chưa có bạn nào để gọi — chọn lớp khác hoặc bỏ đánh dấu Vắng ở tab Lớp học.';
      $('gt-wheel-sub').textContent = names.length
        ? 'Bấm "Gọi tên" để quay'
        : 'Lớp này chưa có bạn nào để gọi.';
    } else {
      // Vòng gọi còn bạn sau khi ánh xạ lại: vẽ lại thẻ để nút +1
      // mang chỉ số mới (chỉ số cũ vô hiệu khi danh sách đổi).
      renderWinner();
    }
    updateStatus();
    drawWheel();
    checkBigClass();
    syncHero();
    updateStage();
  }

  if (IN_APP) {
    const namesField = $('gt-names').closest('.field');
    if (namesField) namesField.style.display = 'none';
    const box = $('gt-class-box');
    if (box) box.style.display = 'none';
    // Phím R tắt trong app (Space/Enter của app gọi tên thay) nên gợi
    // ý trong mô tả cũng đổi theo, tránh chỉ phím không còn tác dụng.
    const desc = root.querySelector('.tool-head p');
    if (desc) desc.textContent = desc.textContent.replace('Bấm phím R để gọi nhanh.', 'Bấm phím Space để gọi nhanh.');
    const noClassBtn = $('gt-no-class-btn');
    if (noClassBtn) noClassBtn.addEventListener('click', () => {
      const tab = document.getElementById('gv-tab-lop-hoc');
      if (tab) tab.click();
    });
    root._gvRefresh = loadFromActiveClass;
    loadFromActiveClass();
  } else {
    refreshClassSelect();
  }
  drawWheel();
  checkBigClass();
}
