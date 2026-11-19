// Gọi tên ngẫu nhiên trong lớp (MẪU 5, 19/11): 4 kiểu gọi — Vòng
// quay (6 màu, viền đen, nút QUAY tròn ở giữa), Hộp quà, Lật thẻ số,
// Tên to. Không gọi lại người đã gọi cho tới khi hết danh sách; lát
// vừa trúng giữ dưới kim tới lần quay sau mới bỏ khỏi vòng; còn 1 bạn
// thì gọi luôn không quay; hết lượt thì hỏi "Gọi lại từ đầu?".
// Thẻ người được gọi có chip cấp độ (Lv.1–3) + nút −1/+1/+2 điểm.
// Kết quả là "sân khấu" to bên trái, thẻ đã gọi ở cột phải; có chế độ
// Chiếu lớp toàn màn hình, âm thanh Web Audio, phím R gọi nhanh
// (trang rời) / Space (trong app), phím +/− cộng trừ điểm (trong app).
export const meta = {
  id: 'goi-ten-ngau-nhien',
  name: 'Gọi tên ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Gọi tên học sinh ngẫu nhiên bằng vòng quay, hộp quà, lật thẻ hoặc tên to: không gọi lại người đã gọi, gọi 1–5 bạn mỗi lần, cộng điểm sang bảng điểm, lưu được nhiều lớp dùng chung cho cả mục Giáo viên, tải danh sách đã gọi về máy.',
  keywords: 'gọi tên ngẫu nhiên, gọi tên học sinh, chọn tên ngẫu nhiên, gọi bài, điểm danh lớp, vòng quay tên, lưu danh sách lớp',
  icon: '🎯',
  seoTitle: 'Gọi tên ngẫu nhiên trong lớp — vòng quay, hộp quà, lật thẻ, tên to',
  seoDesc: 'Dán danh sách lớp, bấm gọi tên — vòng quay giảm tốc rồi dừng ở bạn được gọi, hoặc mở hộp quà, lật thẻ, chạy tên to. Không gọi lại người đã gọi cho tới khi hết danh sách. Lưu được nhiều lớp, dùng chung cho cả mục Giáo viên. Miễn phí, chạy ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><div><h2>Gọi tên ngẫu nhiên</h2><p class="muted">Bốn kiểu gọi tên — vòng quay, hộp quà, lật thẻ, tên to — không gọi lại người đã gọi cho tới khi hết danh sách. Bấm phím R để gọi nhanh.</p></div></div>
  <div class="gv-app-noclass" id="gt-no-class" style="display:none">
    <p id="gt-no-class-text">Chưa có lớp nào — tạo lớp ở tab Lớp học để gọi tên.</p>
    <button type="button" class="btn btn-primary" id="gt-no-class-btn">Tạo lớp</button>
  </div>
  <div class="gt-v2-bar">
    <div class="gt-modes" role="tablist" aria-label="Kiểu gọi tên">
      <button type="button" class="gt-mode gt-mode-active" data-mode="wheel" role="tab" aria-selected="true">Vòng quay</button>
      <button type="button" class="gt-mode" data-mode="gift" role="tab" aria-selected="false">Hộp quà</button>
      <button type="button" class="gt-mode" data-mode="cards" role="tab" aria-selected="false">Lật thẻ</button>
      <button type="button" class="gt-mode" data-mode="big" role="tab" aria-selected="false">Tên to</button>
    </div>
    <div class="gt-scope" id="gt-scope">
      <span class="gt-scope-label">Phạm vi:</span>
      <label><input type="radio" name="gt-scope" value="all" checked> Cả lớp</label>
      <label><input type="radio" name="gt-scope" value="star"> Chỉ bạn có sao</label>
    </div>
    <div class="field gt-count-field"><label for="gt-count">Số bạn gọi mỗi lần</label><select id="gt-count"><option value="1" selected>1 bạn</option><option value="2">2 bạn</option><option value="3">3 bạn</option><option value="4">4 bạn</option><option value="5">5 bạn</option></select></div>
  </div>
  <p class="note" id="gt-big-hint" style="display:none">Lớp đông (trên 24 bạn) — chế độ Tên to đọc rõ tên hơn vòng quay.</p>
  <div class="gt-stage">
    <div class="gt-view">
      <div id="gt-pane-wheel">
        <div class="gv-wheel-wrap" id="gt-wheel-wrap">
          <div class="gv-wheel-pointer" aria-hidden="true"></div>
          <div class="gv-wheel" id="gt-wheel"></div>
          <button type="button" class="gv-wheel-hub" id="gt-call" aria-label="Quay vòng gọi tên">QUAY</button>
        </div>
      </div>
      <div id="gt-pane-gift" style="display:none">
        <div class="gt-grid" id="gt-gift-grid" role="list" aria-label="Hộp quà chưa mở"></div>
      </div>
      <div id="gt-pane-cards" style="display:none">
        <div class="gt-grid" id="gt-card-grid" role="list" aria-label="Thẻ chưa lật"></div>
      </div>
      <div id="gt-pane-big" style="display:none">
        <div class="gv-hero" id="gt-hero">
          <span class="gv-hero-label">Bạn được gọi</span>
          <div id="gt-big"><div class="gv-big">—</div></div>
          <span class="muted" id="gt-sub">Bấm "Gọi tên" để bắt đầu</span>
        </div>
        <div class="btn-row" style="justify-content:center"><button type="button" class="btn btn-primary btn-lg" id="gt-call-big">Gọi tên</button></div>
      </div>
      <p class="muted" id="gt-wheel-sub" style="text-align:center">Bấm "Quay" để bắt đầu</p>
      <div class="gt-exhausted" id="gt-exhausted" style="display:none">
        <p><strong>Đã gọi hết cả lớp!</strong></p>
        <button type="button" class="btn btn-primary" id="gt-exhausted-reset">Gọi lại từ đầu?</button>
      </div>
    </div>
    <div class="gt-called-col">
      <div class="gv-winner" id="gt-winner" style="display:none"></div>
      <div id="gt-status"></div>
      <div class="btn-row" id="gt-dl-row" style="display:none">
        <button type="button" class="btn gv-dl" id="gt-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải danh sách đã gọi (.txt)</button>
      </div>
    </div>
  </div>
  <div class="btn-row gt-actions">
    <button type="button" class="btn" id="gt-stage">Chiếu lớp</button>
    <button type="button" class="btn btn-ghost gv-sound-btn" id="gt-sound">Âm thanh: Bật</button>
    <button type="button" class="btn btn-ghost" id="gt-reset" data-uh-reset="1">Gọi lại từ đầu</button>
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
  // Vòng quay MẪU 5: 6 màu cố định; lát cam chữ đậm, các lát còn lại
  // chữ trắng.
  const WHEEL_COLORS = ['#F59E0B', '#1747E6', '#16A34A', '#DB2777', '#0891B2', '#7C3AED'];
  const CONFETTI_COLORS = ['#2563eb', '#f59e0b', '#dc2626', '#059669', '#7c3aed', '#ec4899'];
  const GIFT_SVG = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';
  // Đã gọi theo ID CỐ ĐỊNH của học sinh (chế độ app) hoặc theo vị trí
  // (trang rời không có bản ghi lớp) — lớp có 2 bạn trùng họ tên thì
  // gọi 1 bạn không tính cả bạn kia là đã gọi. roundPicks giữ tên để
  // hiện thẻ người thắng; roundPickIdx giữ chỉ số trong danh sách gọi
  // song song; roundPickIds giữ id song song để nút +1 cộng đúng bạn.
  let called = [];
  let roundPicks = [];
  let roundPickIdx = [];
  let roundPickIds = [];
  // Chế độ app: danh sách gọi là bản ghi lớp (chỉ bạn không vắng),
  // mỗi mục {id, name, label, given, star}: label = tên hiển thị có
  // đánh số trùng tên ("Bùi Ngọc Lan (1)"), given = tên gọi hiển thị
  // trên vòng quay/thẻ thắng. Trang rời: null, danh sách đọc từ ô
  // gt-names. Phạm vi "Chỉ bạn có sao" lọc appEntries ngay khi nạp.
  let appEntries = null;
  let scope = 'all';
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
    // Dán mỗi-ô-một-dòng (không tab): dòng giới tính đứng sau dòng tên
    // thì bỏ dòng giới tính, chỉ giữ tên — đồng bộ gvPairNameGenderLines
    // trong app.js (kiểm xen kẽ toàn bộ để tên thuần có bạn tên "Nam"
    // không bị ghép sai).
    const rawText = String(text == null ? '' : text);
    if (rawText.indexOf('\t') === -1) {
      const isGenderVal = v => /^(nam|nữ|nu|m|f|male|female)$/i.test(v);
      const lines = rawText.split(/\r\n|\r|\n/).map(l => l.trim()).filter(l => l !== '' && !isHead(l));
      let paired = lines.length >= 4 && lines.length % 2 === 0;
      for (let i = 0; paired && i < lines.length; i += 2) {
        if (isGenderVal(lines[i]) || !isGenderVal(lines[i + 1])) paired = false;
      }
      if (paired) return lines.filter((_, i) => i % 2 === 0).map(n => n.replace(/^\d+\s*[.)\-–:]?\s+/, '').trim()).filter(Boolean);
    }
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
    // Chế độ app: ô gt-names đã bị xóa khỏi DOM (tab Lớp học quản lý
    // danh sách), danh sách đọc từ appEntries — chưa nạp xong thì rỗng.
    if (IN_APP) return appEntries ? appEntries.map(e => e.name) : [];
    return parseNames($('gt-names').value);
  }

  // Định danh 1 bạn trong danh sách gọi: app dùng id cố định của bản
  // ghi lớp, trang rời dùng vị trí (không có bản ghi lớp).
  function entryIdAt(idx) {
    if (IN_APP && appEntries && appEntries[idx]) return appEntries[idx].id;
    return idx;
  }
  function entryIdxForId(id) {
    if (IN_APP && appEntries) {
      for (let i = 0; i < appEntries.length; i++) if (appEntries[i].id === id) return i;
      return -1;
    }
    return (typeof id === 'number') ? id : -1;
  }
  // Tên hiển thị của 1 bạn trong danh sách gọi (app: có đánh số trùng
  // tên; trang rời: tên thường).
  function entryLabelAt(idx) {
    if (IN_APP && appEntries && appEntries[idx]) return appEntries[idx].label;
    const list = nameList();
    return list[idx] || '';
  }
  // Tên gọi hiển thị trên vòng quay/thẻ thắng (app: tính trên toàn bộ
  // lớp nên số (1)/(2) khớp với ngăn lớp; trang rời: tính trên danh
  // sách hiện tại).
  function entryGivenAt(idx) {
    if (IN_APP && appEntries && appEntries[idx]) return appEntries[idx].given;
    return displayGivenName(idx);
  }

  function remainingIdx() {
    const n = nameList().length;
    const out = [];
    for (let i = 0; i < n; i++) if (called.indexOf(entryIdAt(i)) === -1) out.push(i);
    return out;
  }

  function remainingNames() {
    const list = nameList();
    return remainingIdx().map(i => list[i]);
  }

  // Tên các bạn đã gọi, theo đúng thứ tự gọi (2 bạn trùng tên hiện 2
  // lần, có đánh số (1)/(2) ở chế độ app).
  function calledNames() {
    const list = nameList();
    return called.map(id => {
      const i = entryIdxForId(id);
      if (i < 0) return '';
      return (IN_APP && appEntries) ? entryLabelAt(i) : list[i];
    }).filter(n => !!n);
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

  // Vẽ vòng quay SVG từ danh sách tên còn lại. Lát vừa trúng GIỮ
  // NGUYÊN dưới kim sau khi công bố — chỉ vẽ lại ở ĐẦU lần quay sau
  // (trong spinOnce) rồi mới bỏ lát đó khỏi vòng (Claude dặn, 19/11).
  function drawWheel() {
    const remIdx = remainingIdx();
    // Nhãn lát cắt lấy từ tên gọi đã tính trên TOÀN BỘ lớp (như thẻ
    // người thắng, hộp quà, tên to) — KHÔNG tính lại trên số còn lại,
    // nếu không cùng một bạn hiện "Anh" trên vòng nhưng "Minh Anh" ở
    // thẻ đã gọi khi bạn trùng tên gọi đã vắng/bị gọi (bắt khi chụp
    // ảnh kiểm chứng 19/11).
    const labels = remIdx.map(i => entryGivenAt(i));
    const n = remIdx.length;
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
      parts.push('<text x="150" y="150" fill="#1F1300" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="middle">' + esc(shortenLabel(labels[0], 14)) + '</text>');
    } else {
      for (let i = 0; i < n; i++) {
        const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
        const a0 = (i * 360 / n) * Math.PI / 180;
        const a1 = ((i + 1) * 360 / n) * Math.PI / 180;
        const x0 = 150 + 145 * Math.cos(a0), y0 = 150 + 145 * Math.sin(a0);
        const x1 = 150 + 145 * Math.cos(a1), y1 = 150 + 145 * Math.sin(a1);
        const large = (360 / n) > 180 ? 1 : 0;
        parts.push('<path d="M150,150 L' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' A145,145 0 ' + large + ' 1 ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Z" fill="' + color + '" stroke="#fff" stroke-width="1.5"/>');
        const mid = (a0 + a1) / 2;
        const tx = 150 + 98 * Math.cos(mid), ty = 150 + 98 * Math.sin(mid);
        const deg = mid * 180 / Math.PI;
        const rot = (deg > 90 && deg < 270) ? deg + 180 : deg;
        const textColor = color === '#F59E0B' ? '#1F1300' : '#fff';
        parts.push('<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" fill="' + textColor + '" font-size="' + fontSize + '" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + rot.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')">' + esc(shortenLabel(labels[i], 14)) + '</text>');
      }
    }
    // Viền đen 10px quanh vòng (7 đơn vị viewBox ≈ 10px ở cỡ 440px).
    parts.push('<circle cx="150" cy="150" r="145" fill="none" stroke="#111827" stroke-width="7"/>');
    parts.push('</svg>');
    el.innerHTML = parts.join('');
  }

  // Tên gọi dài (vd "Ngọc Lan (2)") ở cỡ chữ lớn có thể rộng hơn thẻ
  // và quấn thành 2 dòng — thu nhỏ từng nấc tới khi vừa 1 dòng, không
  // dưới 64px (vẫn đọc rõ từ cuối lớp). Chỉ chạy trong app (trang rời
  // cuộn trang bình thường, tên dài cứ quấn dòng).
  function fitWinnerNames() {
    if (!IN_APP) return;
    root.querySelectorAll('.gv-winner-given').forEach(function (el) {
      el.style.fontSize = '';
      var size = parseFloat(getComputedStyle(el).fontSize);
      var guard = 0;
      while (el.scrollWidth > el.clientWidth && size > 64 && guard < 40) {
        size -= 8;
        el.style.fontSize = size + 'px';
        guard++;
      }
    });
  }

  // Vòng quay vừa 1 màn (1366×768): đo chiều cao còn lại của sân khấu
  // (viewport − vị trí đầu vòng − dòng trạng thái dưới vòng) rồi đặt
  // đường kính vòng = min(CSS max-width, chiều cao còn lại). Chỉ chạy
  // trong app (trang rời cuộn trang bình thường). Chạy lúc mở tab (qua
  // _gvRefresh) + khi đổi chế độ về Vòng quay + khi đổi cỡ cửa sổ.
  // Ở 1024 CSS đã giới hạn 360px nên không thu thêm quá mức đó.
  function fitWheel() {
    if (!IN_APP || mode !== 'wheel') return;
    const wrap = $('gt-wheel-wrap');
    const sub = $('gt-wheel-sub');
    if (!wrap || !sub) return;
    // Xóa cỡ cũ để đo đúng CSS (440px, hoặc 360px ở ≤1100px).
    wrap.style.maxWidth = '';
    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0) return; // tab chưa hiện
    const avail = window.innerHeight - rect.top - sub.offsetHeight - 24;
    const d = Math.min(rect.width, avail);
    // Không thu dưới 240px (nút QUAY 104px + nhãn sẽ chật).
    if (d < rect.width && d >= 240) wrap.style.maxWidth = Math.floor(d) + 'px';
  }

  // id bản ghi lớp của 1 bạn trong danh sách gọi — dùng cho +1/−1 điểm
  // và tô dòng đang gọi ở ngăn Danh sách lớp (theo id, không theo
  // tên/vị trí, để 2 bạn trùng họ tên không nhầm nhau). Trang rời: ''.
  function recIdForCallIdx(idx) {
    if (!IN_APP || !appEntries || !Number.isInteger(idx) || idx < 0 || !appEntries[idx]) return '';
    return appEntries[idx].id;
  }

  // Điểm hiện tại của bạn được gọi (chế độ app: đọc từ bản ghi lớp
  // theo id).
  function currentPoints(idx) {
    const helper = gvClasses();
    const active = helper && typeof helper.active === 'function' ? helper.active() : '';
    const id = recIdForCallIdx(idx);
    if (!helper || !active || !id || typeof helper.getRecordById !== 'function') return 0;
    const rec = helper.getRecordById(active, id);
    return rec ? (rec.points || 0) : 0;
  }

  // Cấp độ thi đua theo điểm (dùng helper dùng chung, dự phòng giống
  // hệt khi app.js chưa nạp): Lv.1 Mầm non (0–1 điểm), Lv.2 Chăm chỉ
  // (2–4 điểm), Lv.3 Ngôi sao (5 điểm trở lên).
  function levelOf(points) {
    const h = gvClasses();
    if (h && typeof h.level === 'function') return h.level(points || 0);
    const p = points || 0;
    if (p >= 5) return { n: 3, name: 'Ngôi sao', label: 'Lv.3 · Ngôi sao', short: 'Lv.3' };
    if (p >= 2) return { n: 2, name: 'Chăm chỉ', label: 'Lv.2 · Chăm chỉ', short: 'Lv.2' };
    return { n: 1, name: 'Mầm non', label: 'Lv.1 · Mầm non', short: 'Lv.1' };
  }

  // Tên gọi hiển thị trên sân khấu: tên gọi (từ cuối); trùng tên gọi
  // thì 2 chữ cuối; trùng cả họ tên thì đánh số (1)/(2) — cùng logic
  // nhãn vòng quay, tính trên toàn bộ danh sách lớp.
  function displayGivenName(idx) {
    const list = nameList();
    if (!list[idx]) return '';
    return wheelLabels(list)[idx] || list[idx];
  }

  // Nhãn 2 nút gọi chính theo trạng thái: nút QUAY ở giữa vòng quay
  // và nút Gọi tên ở chế độ Tên to.
  function paintCallButtons() {
    const hub = $('gt-call');
    if (hub) hub.textContent = roundPicks.length ? 'QUAY TIẾP' : 'QUAY';
    const bigBtn = $('gt-call-big');
    if (bigBtn) bigBtn.textContent = roundPicks.length ? 'Gọi bạn tiếp theo' : 'Gọi tên';
  }

  function setCallDisabled(dis) {
    const hub = $('gt-call');
    if (hub) hub.disabled = dis;
    const bigBtn = $('gt-call-big');
    if (bigBtn) bigBtn.disabled = dis;
  }

  // Khung hỏi "Gọi lại từ đầu?" khi đã gọi hết cả lớp.
  function showExhausted() {
    const el = $('gt-exhausted');
    if (el) el.style.display = '';
  }
  function hideExhausted() {
    const el = $('gt-exhausted');
    if (el) el.style.display = 'none';
  }

  function renderWinner() {
    const w = $('gt-winner');
    if (!roundPicks.length) {
      w.style.display = 'none';
      w.innerHTML = '';
      paintCallButtons();
      return;
    }
    paintCallButtons();
    if (IN_APP) {
      // MẪU 5: nền #FEF3C7, viền cam 3px, tên gọi 88px đậm, đủ họ tên,
      // chip cấp độ + chip điểm, 3 nút 56px −1/+1/+2. Gọi nhiều bạn
      // một lần thì mỗi bạn một thẻ nhỏ xếp chồng.
      const multi = roundPicks.length > 1;
      let html = '<p class="gv-hero-label">' + (multi ? 'Mời các bạn' : 'Mời bạn') + '</p>';
      roundPicks.forEach((p, i) => {
        const idx = roundPickIdx[i];
        const label = entryLabelAt(idx);
        const id = recIdForCallIdx(idx);
        const pts = currentPoints(idx);
        const lv = levelOf(pts);
        html += '<div class="gv-winner-card' + (multi ? ' gv-winner-card-sm' : '') + '">'
          + '<div class="gv-winner-given' + (multi ? ' gv-winner-name-sm' : '') + '">' + esc(entryGivenAt(idx)) + '</div>'
          + '<div class="gv-winner-full' + (multi ? ' gv-winner-full-sm' : '') + '">' + esc(label) + '</div>'
          + '<div class="gv-winner-chips"><span class="gv-level-chip" data-lv-for="' + esc(id) + '">' + esc(lv.label) + '</span>'
          + '<span class="gv-points-chip" data-pts-for="' + esc(id) + '">' + pts + ' điểm</span></div>'
          + '<div class="gv-points-row" data-points-id="' + esc(id) + '">'
          + '<button type="button" class="gv-points-btn" data-point-delta="-1" aria-label="Trừ 1 điểm cho ' + esc(label) + '">−1</button>'
          + '<button type="button" class="gv-points-btn gv-points-plus" data-point-delta="1" aria-label="Cộng 1 điểm cho ' + esc(label) + '">+1</button>'
          + '<button type="button" class="gv-points-btn gv-points-plus2" data-point-delta="2" aria-label="Cộng 2 điểm cho ' + esc(label) + '">+2</button>'
          + '</div></div>';
      });
      html += '<p class="muted" id="gt-point-msg" style="margin-top:8px"></p>';
      w.innerHTML = html;
      w.style.display = '';
      w.classList.remove('gv-pop');
      void w.offsetWidth;
      w.classList.add('gv-pop');
      fitWinnerNames();
      return;
    }
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
  }

  // Cộng/trừ điểm ngay trên thẻ người thắng (chế độ app): ghi theo
  // id trong bản ghi lớp, cập nhật chip điểm + chip cấp độ + ngăn lớp.
  function changePoint(id, delta) {
    const helper = gvClasses();
    const active = helper && typeof helper.active === 'function' ? helper.active() : '';
    if (!helper || !active || !id || typeof helper.addPointsById !== 'function') return;
    if (!helper.addPointsById(active, id, delta)) return;
    const rec = (typeof helper.getRecordById === 'function') ? helper.getRecordById(active, id) : null;
    if (rec) {
      const ptsEl = root.querySelector('[data-pts-for="' + id + '"]');
      if (ptsEl) ptsEl.textContent = rec.points + ' điểm';
      const lvEl = root.querySelector('[data-lv-for="' + id + '"]');
      if (lvEl) lvEl.textContent = levelOf(rec.points).label;
    }
    tick();
    if (typeof window !== 'undefined' && window.UhGvApp && typeof window.UhGvApp.refresh === 'function') {
      window.UhGvApp.refresh();
    }
  }

  function addPoint(name, idx, btn) {
    // Trong Bàn giáo viên: điểm ghi thẳng vào bản ghi lớp (nguồn duy
    // nhất cho cột Điểm ở tab Lớp học và Bảng điểm chế độ Cá nhân).
    // Cộng theo ID, không theo tên — 2 bạn trùng họ tên thì tên không
    // phân biệt được.
    if (IN_APP) {
      const helper = gvClasses();
      const active = helper && typeof helper.active === 'function' ? helper.active() : '';
      const id = recIdForCallIdx(idx);
      if (helper && active && id && typeof helper.addPointsById === 'function'
          && helper.addPointsById(active, id, 1)) {
        btn.textContent = 'Đã cộng ✓';
        btn.disabled = true;
        const msg = $('gt-point-msg');
        if (msg) msg.innerHTML = 'Đã cộng 1 điểm cho ' + esc(name) + ' — xem ở <a href="/giao-vien/lop-hoc/?tab=bang-diem">Bảng điểm lớp</a>.';
        tick();
        return;
      }
      // Dự phòng khi không ánh xạ được id: cộng theo tên như cũ.
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
    // Hàng chấm điểm −1/+1/+2 trong app (MẪU 5): ghi theo id trong
    // bản ghi lớp, không khóa nút (cộng/trừ nhiều lần được).
    const dp = ev.target.closest('button[data-point-delta]');
    if (dp) {
      const row = dp.closest('.gv-points-row');
      const id = row ? row.getAttribute('data-points-id') : '';
      if (id) changePoint(id, parseInt(dp.getAttribute('data-point-delta'), 10) || 0);
      return;
    }
    const btn = ev.target.closest('button[data-add-point]');
    if (!btn || btn.disabled) return;
    addPoint(btn.getAttribute('data-add-point'), parseInt(btn.getAttribute('data-add-point-idx'), 10), btn);
  });

  // ---------- Hộp quà / Lật thẻ: lưới ô úp, chạm để mở ----------
  // Mỗi bạn chưa gọi được xáo trộn rồi gán vào 1 ô úp khi mở chế độ
  // (hoặc khi danh sách đổi); bạn đã gọi giữ ô mở, mờ đi. Chạm 1 ô
  // là gọi bạn trong ô đó. Số bạn mỗi lần chỉ áp cho nút Quay/Gọi
  // tên, không áp cho chạm tay.
  function currentGrid() {
    if (mode === 'gift') return $('gt-gift-grid');
    if (mode === 'cards') return $('gt-card-grid');
    return null;
  }

  function buildRevealGrid(m) {
    const grid = (m === 'gift') ? $('gt-gift-grid') : $('gt-card-grid');
    if (!grid) return;
    const list = nameList();
    const rem = remainingIdx();
    const shuffled = rem.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    let next = 0;
    const cells = [];
    for (let i = 0; i < list.length; i++) {
      const isCalled = called.indexOf(entryIdAt(i)) !== -1;
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
      if (isCalled) {
        cells.push('<button type="button" class="gt-cell gt-cell-open" data-idx="' + i + '" disabled title="' + esc(entryLabelAt(i)) + '" aria-label="Đã gọi: ' + esc(entryLabelAt(i)) + '"><span class="gt-cell-name">' + esc(entryGivenAt(i)) + '</span></button>');
      } else {
        const assigned = shuffled[next++];
        const face = (m === 'gift')
          ? GIFT_SVG
          : '<span class="gt-cell-num">' + (i + 1) + '</span>';
        cells.push('<button type="button" class="gt-cell gt-cell-down" data-idx="' + assigned + '" style="background:' + color + '" aria-label="' + (m === 'gift' ? 'Hộp quà chưa mở' : 'Thẻ số ' + (i + 1) + ' chưa lật') + '">' + face + '</button>');
      }
    }
    grid.innerHTML = cells.join('');
  }

  function revealCell(cell, idx) {
    cell.classList.remove('gt-cell-down');
    cell.classList.add('gt-cell-open', 'gv-pop');
    cell.style.background = '';
    cell.disabled = true;
    cell.innerHTML = '<span class="gt-cell-name">' + esc(entryGivenAt(idx)) + '</span>';
    cell.setAttribute('aria-label', 'Đã gọi: ' + esc(entryLabelAt(idx)));
    cell.title = entryLabelAt(idx);
    announcePick(idx);
  }

  function onGridClick(ev) {
    const cell = ev.target.closest('.gt-cell-down');
    if (!cell || busy) return;
    const idx = parseInt(cell.getAttribute('data-idx'), 10);
    if (isNaN(idx)) return;
    roundPicks = [];
    roundPickIdx = [];
    roundPickIds = [];
    $('gt-winner').style.display = 'none';
    hideExhausted();
    revealCell(cell, idx);
  }

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
    // (tránh gọi nhầm khi giáo viên đang ở tab khác); phím +/− cộng
    // trừ điểm cho bạn vừa gọi.
    if (IN_APP) {
      if ((e.key === '+' || e.key === '-') && !e.ctrlKey && !e.metaKey && !e.altKey && roundPickIds.length) {
        const t = e.target;
        const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
        if (!typing) {
          const id = roundPickIds[roundPickIds.length - 1];
          if (id) changePoint(id, e.key === '+' ? 1 : -1);
        }
      }
      return;
    }
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if ((e.key === 'r' || e.key === 'R') && !typing && !busy) { e.preventDefault(); call(); }
  });

  // Quay 1 lần, dừng ở bạn đã chọn trước (theo chỉ số trong danh sách
  // để 2 bạn trùng tên dừng đúng ô của mình). Vẽ lại vòng ở ĐẦU lần
  // quay này — lát vừa trúng ở lần trước giờ mới bị bỏ khỏi vòng.
  // done() chạy khi dừng hẳn. Quay 3,2s giảm dần.
  function spinOnce(pickIdx, done) {
    drawWheel();
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
    }, 3200);
  }

  function announcePick(pickIdx) {
    called.push(entryIdAt(pickIdx));
    roundPicks.push(nameList()[pickIdx]);
    roundPickIdx.push(pickIdx);
    roundPickIds.push(entryIdAt(pickIdx));
    renderWinner();
    // Chế độ Tên to: khung tên to giữ nguyên, hiện tên vừa gọi.
    if (mode === 'big') {
      const big = $('gt-big');
      if (big) big.innerHTML = '<div class="gv-big">' + esc(entryGivenAt(pickIdx)) + '</div>';
    }
    // Chế độ app: tô dòng bạn đang gọi ở ngăn Danh sách lớp (theo id).
    if (IN_APP && typeof window !== 'undefined' && window.UhGvApp && typeof window.UhGvApp.setCalled === 'function') {
      const id = recIdForCallIdx(pickIdx);
      if (id) window.UhGvApp.setCalled(id);
    }
    updateStatus();
    updateStage();
    fanfare();
    // Pháo giấy rơi trên khung đang hiện.
    const pane = mode === 'wheel' ? $('gt-wheel-wrap') : (mode === 'big' ? $('gt-hero') : currentGrid());
    confetti(pane || $('gt-winner'));
    const left = remainingNames().length;
    const msg = left > 0
      ? 'Còn ' + left + ' bạn chưa được gọi'
      : 'Đã gọi hết danh sách.';
    $('gt-wheel-sub').textContent = msg;
    $('gt-sub').textContent = msg;
    if (left === 0) showExhausted();
  }

  // Chế độ Tên to: tên chạy nhanh rồi dừng ở bạn được chọn.
  function callBigMode(picks, onDone) {
    const remaining = remainingNames();
    busy = true;
    setCallDisabled(true);
    $('gt-sub').textContent = 'Đang chọn…';
    if (REDUCED) {
      picks.forEach(p => announcePick(p));
      busy = false;
      setCallDisabled(false);
      onDone();
      return;
    }
    const big = $('gt-big');
    big.classList.add('gv-cycling');
    // Trong app, tên chạy là tên gọi hiển thị (tên gọi, hoặc 2 chữ
    // cuối khi trùng) để vừa khung 120px — đủ họ tên dài sẽ tràn.
    // Nhãn lấy từ appEntries (tính trên toàn bộ lớp) để số (1)/(2)
    // khớp với thẻ người thắng và ngăn lớp.
    const labels = IN_APP ? (appEntries ? appEntries.map(e => e.given) : wheelLabels(nameList())) : null;
    const remIdx = remainingIdx();
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      tick();
      const ri = remIdx[Math.floor(Math.random() * remIdx.length)];
      const show = labels ? labels[ri] : nameList()[ri];
      big.innerHTML = '<div class="gv-big">' + esc(show) + '</div>';
      if (ticks >= 18) {
        clearInterval(timer);
        big.classList.remove('gv-cycling');
        picks.forEach(p => announcePick(p));
        busy = false;
        setCallDisabled(false);
        onDone();
      }
    }, 70);
  }

  // Hộp quà / Lật thẻ qua nút Quay (Space): mở ngẫu nhiên từng ô,
  // cách nhau một nhịp để thấy rõ từng bạn.
  function callRevealMode(picks, onDone) {
    busy = true;
    setCallDisabled(true);
    let i = 0;
    (function next() {
      if (i >= picks.length) {
        busy = false;
        setCallDisabled(false);
        onDone();
        return;
      }
      const pick = picks[i++];
      const grid = currentGrid();
      const cell = grid ? grid.querySelector('[data-idx="' + pick + '"]') : null;
      if (cell && cell.classList.contains('gt-cell-down')) revealCell(cell, pick);
      else announcePick(pick);
      if (i < picks.length) setTimeout(next, 450);
      else next();
    })();
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
      $('gt-wheel-sub').textContent = 'Đã gọi hết danh sách.';
      $('gt-sub').textContent = $('gt-wheel-sub').textContent;
      showExhausted();
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
    roundPickIds = [];
    $('gt-winner').style.display = 'none';
    hideExhausted();
    // Còn đúng 1 bạn: gọi luôn, không cần quay/chạy tên/mở ô.
    if (remaining.length === 1) {
      if (mode === 'gift' || mode === 'cards') {
        const grid = currentGrid();
        const cell = grid ? grid.querySelector('[data-idx="' + picks[0] + '"]') : null;
        if (cell && cell.classList.contains('gt-cell-down')) { revealCell(cell, picks[0]); return; }
      }
      announcePick(picks[0]);
      return;
    }
    if (mode === 'big') {
      callBigMode(picks, () => {});
      return;
    }
    if (mode === 'gift' || mode === 'cards') {
      callRevealMode(picks, () => {});
      return;
    }
    // Chế độ vòng quay: quay lần lượt từng bạn.
    busy = true;
    setCallDisabled(true);
    let i = 0;
    (function next() {
      if (i >= picks.length) {
        busy = false;
        setCallDisabled(false);
        return;
      }
      const pick = picks[i++];
      spinOnce(pick, () => {
        announcePick(pick);
        if (i < picks.length) {
          setTimeout(next, 800);
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
    roundPickIds = [];
    $('gt-big').innerHTML = '<div class="gv-big">' + (IN_APP ? '?' : '—') + '</div>';
    $('gt-sub').textContent = 'Bấm "Gọi tên" để bắt đầu';
    $('gt-wheel-sub').textContent = 'Bấm "Quay" để bắt đầu';
    $('gt-winner').style.display = 'none';
    $('gt-winner').innerHTML = '';
    hideExhausted();
    if (IN_APP) {
      if (typeof window !== 'undefined' && window.UhGvApp && typeof window.UhGvApp.clearCalled === 'function') {
        window.UhGvApp.clearCalled();
      }
    }
    paintCallButtons();
    updateStatus();
    updateStage();
    drawWheel();
    if (mode === 'gift' || mode === 'cards') buildRevealGrid(mode);
  }

  function setMode(m) {
    mode = m;
    root.querySelectorAll('.gt-mode').forEach(b => {
      const on = b.getAttribute('data-mode') === m;
      b.classList.toggle('gt-mode-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('gt-pane-wheel').style.display = m === 'wheel' ? '' : 'none';
    $('gt-pane-gift').style.display = m === 'gift' ? '' : 'none';
    $('gt-pane-cards').style.display = m === 'cards' ? '' : 'none';
    $('gt-pane-big').style.display = m === 'big' ? '' : 'none';
    if (m === 'wheel') { drawWheel(); fitWheel(); }
    if (m === 'gift' || m === 'cards') buildRevealGrid(m);
  }

  // Lớp đông (trên 24 bạn): vòng quay không đọc được tên nên tự động
  // mở ở chế độ Tên to + hiện gợi ý; giáo viên vẫn chọn vòng quay
  // được tay nếu muốn (gợi ý vẫn hiện khi danh sách còn đông).
  function checkBigClass() {
    const big = nameList().length > 24;
    $('gt-big-hint').style.display = big ? '' : 'none';
    if (big && mode === 'wheel') setMode('big');
  }

  root.querySelectorAll('.gt-mode').forEach(b => {
    b.addEventListener('click', () => setMode(b.getAttribute('data-mode')));
  });
  $('gt-call').addEventListener('click', call);
  $('gt-call-big').addEventListener('click', call);
  $('gt-stage').addEventListener('click', openStage);
  $('gt-reset').addEventListener('click', resetAll);
  $('gt-exhausted-reset').addEventListener('click', resetAll);
  $('gt-gift-grid').addEventListener('click', onGridClick);
  $('gt-card-grid').addEventListener('click', onGridClick);
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

  // Tên lớp hiển thị ('Lớp 10A1', không 'Lớp Lớp mẫu').
  function classLabel(n) {
    const h = gvClasses();
    return (h && h.classLabel) ? h.classLabel(n) : 'Lớp ' + String(n || '').replace(/^Lớp\s+/, '');
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
    // Tên hiển thị + tên gọi tính trên TOÀN BỘ lớp (kể cả bạn vắng)
    // để số (1)/(2) khớp với ngăn lớp/Bảng điểm, không đổi khi 1 bạn
    // trong cặp trùng tên bị đánh vắng.
    const labels = (typeof helper.displayNames === 'function') ? helper.displayNames(recs) : recs.map(r => r.name);
    const givens = wheelLabels(recs.map(r => r.name));
    const entries = [];
    recs.forEach((r, i) => {
      if (r.absent) return;
      entries.push({ id: r.id, name: r.name, label: labels[i] || r.name, given: givens[i] || r.name, star: !!r.star, gender: r.gender || '' });
    });
    // Phạm vi "Chỉ bạn có sao": chỉ giữ bạn có sao trong danh sách gọi.
    const pool = (scope === 'star') ? entries.filter(e => e.star) : entries;
    const names = pool.map(e => e.name);
    const sig = active + '|' + scope + '\n' + pool.map(e => e.id + '|' + e.name + '|' + (e.star ? 1 : 0)).join('\n');
    if (sig === appSig) return;
    appSig = sig;
    // Chưa có lớp (hoặc lớp chưa có bạn nào để gọi): hiện đúng 1 nút
    // dẫn về tab Lớp học, thay cho ô nhập tay của trang rời.
    const noClass = $('gt-no-class');
    if (noClass) {
      const show = names.length === 0;
      noClass.style.display = show ? '' : 'none';
      if (show) {
        $('gt-no-class-text').textContent = active
          ? (scope === 'star'
              ? classLabel(active) + ' chưa có bạn nào có sao — đánh dấu sao ở ngăn Danh sách lớp hoặc tab Lớp học.'
              : classLabel(active) + ' chưa có bạn nào để gọi — thêm bạn hoặc bỏ đánh dấu Vắng ở tab Lớp học.')
          : 'Chưa có lớp nào — tạo lớp ở tab Lớp học để gọi tên.';
        $('gt-no-class-btn').textContent = active ? 'Mở tab Lớp học' : 'Tạo lớp';
      }
    }
    // Danh sách đổi (đánh vắng — thêm/xóa/sửa tên đã xóa lượt gọi ở
    // app): giữ lại các bạn đã gọi còn có mặt — khớp theo ID CỐ ĐỊNH,
    // không theo tên/vị trí: sửa tên không làm mất lượt đã gọi, 2 bạn
    // trùng tên không bị tính nhầm cho nhau.
    const prevCalled = called.slice();
    const prevPickIds = roundPickIds.slice();
    const prevPicks = roundPicks.slice();
    appEntries = pool;
    const idSet = {};
    pool.forEach(e => { idSet[e.id] = true; });
    called = prevCalled.filter(id => idSet[id]);
    roundPicks = [];
    roundPickIdx = [];
    roundPickIds = [];
    prevPickIds.forEach((id, k) => {
      const ni = entryIdxForId(id);
      if (ni >= 0) { roundPickIds.push(id); roundPickIdx.push(ni); roundPicks.push(prevPicks[k]); }
    });
    if (!roundPicks.length) {
      $('gt-winner').style.display = 'none';
      $('gt-winner').innerHTML = '';
      // Lúc chờ trong app hiện "?" thay cho gạch "—" (gạch ở cỡ 120px
      // trông như một thanh màu, dễ tưởng lỗi hiển thị).
      $('gt-big').innerHTML = '<div class="gv-big">' + (IN_APP ? '?' : '—') + '</div>';
      $('gt-sub').textContent = names.length
        ? 'Bấm "Gọi tên" để bắt đầu'
        : 'Lớp này chưa có bạn nào để gọi — chọn lớp khác hoặc bỏ đánh dấu Vắng ở tab Lớp học.';
      $('gt-wheel-sub').textContent = names.length
        ? 'Bấm "Quay" để bắt đầu'
        : 'Lớp này chưa có bạn nào để gọi.';
      paintCallButtons();
    } else {
      // Vòng gọi còn bạn sau khi ánh xạ lại theo id: vẽ lại thẻ để
      // nút +1 mang id mới (chỉ số cũ vô hiệu khi danh sách đổi).
      renderWinner();
    }
    updateStatus();
    drawWheel();
    if (mode === 'gift' || mode === 'cards') buildRevealGrid(mode);
    checkBigClass();
    updateStage();
  }

  // Đổi phạm vi gọi (chế độ app): gọi lại từ đầu vì danh sách gọi đã
  // đổi hẳn (không giữ lượt đã gọi của phạm vi cũ).
  root.querySelectorAll('input[name="gt-scope"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      scope = r.value;
      appSig = '';
      resetAll();
      loadFromActiveClass();
    });
  });

  if (IN_APP) {
    // Xóa hẳn khỏi DOM (không chỉ ẩn): ô dán tên + khung quản lý lớp
    // của trang rời không có chỗ trong Bàn giáo viên — tab Lớp học đã
    // làm việc đó. Danh sách gọi lấy từ appEntries, không đọc ô tên.
    const namesField = $('gt-names').closest('.field');
    if (namesField) namesField.remove();
    const box = $('gt-class-box');
    if (box) box.remove();
    const heroLabel = root.querySelector('#gt-hero .gv-hero-label');
    if (heroLabel) heroLabel.textContent = 'Mời bạn';
    // Lúc chờ hiện "?" thay cho gạch "—" (gạch ở cỡ 120px trông như
    // một thanh màu, dễ tưởng lỗi hiển thị).
    $('gt-big').innerHTML = '<div class="gv-big">?</div>';
    const bigHint = $('gt-big-hint');
    if (bigHint) bigHint.textContent = 'Lớp đông (trên 24 bạn) — chế độ Tên to đọc rõ tên hơn vòng quay.';
    // Phím R tắt trong app (Space/Enter của app gọi tên thay) nên gợi
    // ý trong mô tả cũng đổi theo, tránh chỉ phím không còn tác dụng.
    const desc = root.querySelector('.tool-head p');
    if (desc) desc.textContent = desc.textContent.replace('Bấm phím R để gọi nhanh.', 'Bấm phím Space để gọi nhanh.');
    const noClassBtn = $('gt-no-class-btn');
    if (noClassBtn) noClassBtn.addEventListener('click', () => {
      const tab = document.getElementById('gv-tab-lop-hoc');
      if (tab) tab.click();
    });
    // App gọi root._gvRefresh() mỗi lần mở lại tab này (panel đã hiện
    // nên đo được): nạp lại lớp + vừa vòng quay theo chiều cao màn.
    root._gvRefresh = function () { loadFromActiveClass(); fitWheel(); };
    // App gọi để xóa lượt đang gọi khi danh sách lớp đổi giữa chừng
    // (thêm/xóa/sửa tên/đổi lớp) — nút +1 không mở lại được.
    root._gvClearRound = resetAll;
    // Đổi cỡ cửa sổ (vd chuyển máy chiếu): vừa lại tên gọi theo thẻ
    // và vừa lại vòng quay theo chiều cao màn.
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { fitWinnerNames(); fitWheel(); }, 150);
    });
    loadFromActiveClass();
    // Lần đầu mở tab (deep-link ?tab=goi-ten) không qua _gvRefresh nên
    // vừa vòng ngay tại đây; mở lại tab sau thì _gvRefresh lo.
    fitWheel();
  } else {
    // Trang rời không có dữ liệu sao nên ẩn chọn phạm vi.
    const scopeEl = $('gt-scope');
    if (scopeEl) scopeEl.style.display = 'none';
    refreshClassSelect();
  }
  drawWheel();
  checkBigClass();
}
