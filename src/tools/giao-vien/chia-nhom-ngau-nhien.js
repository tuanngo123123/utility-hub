// Chia nhóm thông minh trong lớp (MẪU 5, 19/11): 4 cách chia —
// Thông minh (rải rắn: sao trước, rồi nam, rồi nữ, mỗi tầng xếp theo
// điểm; áp luật riêng; tránh trùng 2 lần chia trước), Đều năng lực
// (xếp theo điểm thi đua, rải rắn), Ngẫu nhiên, Theo danh sách.
// Tên nhóm theo chủ đề (Số / Con vật / Danh nhân VN / Màu), công bố
// từng nhóm 0,7s/nhóm, kéo thả học sinh giữa các nhóm, đưa nhóm vào
// Bảng điểm, chép danh sách, tải Excel (.xlsx) và .txt. Có chế độ
// Chiếu lớp và âm thanh.
export const meta = {
  id: 'chia-nhom-ngau-nhien',
  name: 'Chia nhóm ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Chia lớp thành nhóm thông minh: rải đều bạn có sao, nam/nữ và điểm thi đua, áp luật riêng từng bạn, tránh trùng lần chia trước, tên nhóm theo chủ đề, công bố từng nhóm, kéo thả đổi nhóm, đưa vào bảng điểm, tải Excel.',
  keywords: 'chia nhóm ngẫu nhiên, chia nhóm học sinh, chia đội, chia nhóm lớp học, chia nhóm thông minh',
  icon: '👥',
  seoTitle: 'Chia nhóm ngẫu nhiên — thông minh, đều năng lực, tải Excel',
  seoDesc: 'Dán danh sách lớp, chia nhóm thông minh — rải đều sao, nam/nữ, điểm thi đua, áp luật riêng, tránh trùng lần trước. Tên nhóm theo chủ đề, công bố từng nhóm, tải Excel miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><div><h2>Chia nhóm ngẫu nhiên</h2><p class="muted">Chọn số nhóm và cách chia — các nhóm được rải đều sao, nam/nữ và điểm thi đua, áp luật riêng từng bạn, mỗi bạn có một vai trò.</p></div></div>
  <div class="gv-app-noclass" id="cn-no-class" style="display:none">
    <p id="cn-no-class-text">Chưa có lớp nào — tạo lớp ở tab Lớp học để chia nhóm.</p>
    <button type="button" class="btn btn-primary" id="cn-no-class-btn">Tạo lớp</button>
  </div>
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
  <div class="cn-v2">
    <div class="cn-settings">
      <button type="button" class="cn-settings-toggle" id="cn-settings-toggle" aria-expanded="true">Cài đặt <span class="cn-settings-caret" aria-hidden="true">▴</span></button>
      <h3>Số nhóm</h3>
      <div class="cn-stepper">
        <button type="button" class="cn-step-btn" id="cn-minus" aria-label="Giảm số nhóm">−</button>
        <span class="cn-count" id="cn-group-count">4</span>
        <button type="button" class="cn-step-btn" id="cn-plus" aria-label="Tăng số nhóm">+</button>
        <span class="cn-per-group" id="cn-per-group">3 bạn/nhóm</span>
      </div>
      <h3>Cách chia</h3>
      <div class="cn-modes" role="radiogroup" aria-label="Cách chia nhóm">
        <button type="button" class="cn-mode-card cn-mode-active" data-divide-mode="smart" role="radio" aria-checked="true"><strong>Thông minh</strong><span>Rải đều sao, nam/nữ, điểm</span></button>
        <button type="button" class="cn-mode-card" data-divide-mode="balanced" role="radio" aria-checked="false"><strong>Đều năng lực</strong><span>Xếp theo điểm thi đua</span></button>
        <button type="button" class="cn-mode-card" data-divide-mode="random" role="radio" aria-checked="false"><strong>Ngẫu nhiên</strong><span>Xáo trộn rồi chia đều</span></button>
        <button type="button" class="cn-mode-card" data-divide-mode="list" role="radio" aria-checked="false"><strong>Theo danh sách</strong><span>Chia theo thứ tự lớp</span></button>
      </div>
      <h3>Cân bằng <span class="muted cn-balance-note">(chỉ chế độ Thông minh)</span></h3>
      <div class="cn-balance">
        <button type="button" class="cn-bal-chip cn-bal-on" data-bal="gender" aria-pressed="true">Nam/nữ</button>
        <button type="button" class="cn-bal-chip cn-bal-on" data-bal="star" aria-pressed="true">Rải bạn có sao</button>
        <button type="button" class="cn-bal-chip cn-bal-on" data-bal="points" aria-pressed="true">Theo điểm thi đua</button>
        <button type="button" class="cn-bal-chip cn-bal-on" data-bal="avoid" aria-pressed="true">Tránh trùng 2 lần trước</button>
      </div>
      <h3>Luật riêng</h3>
      <div class="cn-rules" id="cn-rules"></div>
      <div class="cn-rule-form">
        <select id="cn-rule-a" aria-label="Bạn thứ nhất"></select>
        <select id="cn-rule-type" aria-label="Loại luật"><option value="apart">KHÔNG cùng nhóm với</option><option value="together">Cùng nhóm với</option></select>
        <select id="cn-rule-b" aria-label="Bạn thứ hai"></select>
        <input id="cn-rule-note" type="text" placeholder="Ghi chú (không bắt buộc)" autocomplete="off">
        <button type="button" class="btn" id="cn-rule-add">Thêm luật</button>
      </div>
      <h3>Tên nhóm</h3>
      <div class="cn-themes" role="radiogroup" aria-label="Tên nhóm theo chủ đề">
        <button type="button" class="cn-theme-btn" data-theme="num" role="radio" aria-checked="false">Số</button>
        <button type="button" class="cn-theme-btn cn-theme-active" data-theme="animal" role="radio" aria-checked="true">Con vật</button>
        <button type="button" class="cn-theme-btn" data-theme="hero" role="radio" aria-checked="false">Danh nhân VN</button>
        <button type="button" class="cn-theme-btn" data-theme="color" role="radio" aria-checked="false">Màu</button>
      </div>
      <label class="cn-toggle"><input type="checkbox" id="cn-roles" checked> Hiện vai trò từng bạn (Nhóm trưởng, Thư ký…)</label>
    </div>
    <div class="cn-results">
      <div class="btn-row cn-actions">
        <button type="button" class="btn btn-primary btn-lg" id="cn-divide">Chia nhóm</button>
        <button type="button" class="btn" id="cn-reveal" disabled>Công bố từng nhóm</button>
        <button type="button" class="btn" id="cn-stage">Chiếu lớp</button>
        <button type="button" class="btn btn-ghost gv-sound-btn" id="cn-sound">Âm thanh: Bật</button>
      </div>
      <p class="note" id="cn-msg" style="display:none"></p>
      <div class="result" id="cn-out" hidden></div>
      <div class="btn-row cn-result-actions gv-prep-only" id="cn-result-actions" style="display:none">
        <button type="button" class="btn btn-primary" id="cn-to-scoreboard">Đưa các nhóm vào Bảng điểm</button>
        <button type="button" class="btn" id="cn-copy">Chép danh sách</button>
        <button type="button" class="btn gv-dl" id="cn-excel">Tải Excel</button>
        <button type="button" class="btn gv-dl" id="cn-download">Tải danh sách (.txt)</button>
      </div>
    </div>
  </div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Chế độ Bàn giáo viên: trang /giao-vien/lop-hoc/ nhúng công cụ này
  // với data-gv-app="1" — danh sách lấy từ lớp đang chọn ở tab Lớp học
  // (bạn vắng không bị chia nhóm), khung nạp lớp + ô dán tên của trang
  // rời được ẩn đi vì tab Lớp học đã làm việc đó.
  const IN_APP = !!(root && root.dataset && root.dataset.gvApp === '1');
  const ROLES = ['Nhóm trưởng', 'Thư ký', 'Phản biện', 'Thuyết trình'];
  const ANIMALS = ['Hổ', 'Voi', 'Cáo', 'Gấu', 'Sói', 'Cú', 'Ong', 'Rùa'];
  const HEROES = ['Lý Thường Kiệt', 'Trần Hưng Đạo', 'Quang Trung', 'Hai Bà Trưng', 'Ngô Quyền', 'Lê Lợi', 'Nguyễn Trãi', 'Đinh Bộ Lĩnh'];
  const COLORS = ['Xanh dương', 'Đỏ', 'Vàng', 'Xanh lá', 'Tím', 'Cam', 'Hồng', 'Nâu'];
  const GROUP_COLORS = [
    { bg: '#DBEAFE', fg: '#1747E6', border: '#93C5FD' },
    { bg: '#FCE7F3', fg: '#DB2777', border: '#F9A8D4' },
    { bg: '#DCFCE7', fg: '#16A34A', border: '#86EFAC' },
    { bg: '#FEF3C7', fg: '#D97706', border: '#FCD34D' },
    { bg: '#E0F2FE', fg: '#0284C7', border: '#7DD3FC' },
    { bg: '#EDE9FE', fg: '#7C3AED', border: '#C4B5FD' },
    { bg: '#FFEDD5', fg: '#EA580C', border: '#FDBA74' },
    { bg: '#CCFBF1', fg: '#0D9488', border: '#5EEAD4' }
  ];
  // Nhóm lưu theo MỤC {id, name, label, gender, star, points}: id là
  // mã cố định của bản ghi lớp (chế độ app; trang rời id = null),
  // label là tên hiển thị có đánh số trùng tên ("Bùi Ngọc Lan (1)") —
  // 2 bạn trùng tên vẫn là 2 mục riêng trong nhóm.
  let groups = [];
  // Nhóm nào đã công bố (mở thẻ) — công bố từng nhóm mở dần, chạm
  // vào thẻ "?" mở ngay nhóm đó.
  let revealed = [];
  let revealTimer = null;
  // Chế độ app: danh sách chia là bản ghi lớp (chỉ bạn không vắng).
  // Trang rời: null, danh sách đọc từ ô cn-names.
  let appEntries = null;
  let groupCount = 4;
  let divideMode = 'smart';
  let balance = { gender: true, star: true, points: true, avoid: true };
  let theme = 'animal';
  let showRoles = true;
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
  function gvClasses() {
    return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null;
  }

  // Tên lớp hiển thị ('Lớp 10A1', không 'Lớp Lớp mẫu').
  function classLabel(n) {
    const h = gvClasses();
    return (h && h.classLabel) ? h.classLabel(n) : 'Lớp ' + String(n || '').replace(/^Lớp\s+/, '');
  }

  function showMsg(text) {
    const el = $('cn-msg');
    el.textContent = text;
    el.style.display = text ? '' : 'none';
  }

  // Tách danh sách tên — nhận diện cột như helper dùng chung (dán
  // Excel 3 cột STT/Họ tên/Giới tính thì lấy đúng cột tên, không lấy
  // cột giới tính làm tên). Dùng helper khi có, dự phòng bằng logic
  // giống hệt khi app.js chưa nạp.
  function parseNames(text) {
    const helper = gvClasses();
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

  // Tên gọi hiển thị trong thẻ nhóm (cùng thuật toán với wheelLabels
  // của Gọi tên để cùng một bạn hiện một tên ở mọi công cụ): từ cuối;
  // trùng tên gọi thì lấy 2 từ cuối; vẫn trùng thì đánh số (1)/(2).
  // Tính trên TOÀN BỘ lớp (kể cả bạn vắng) để tên không đổi khi bạn
  // vắng quay lại giữa tiết.
  function givenLabels(names) {
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

  function nameList() {
    // Chế độ app: ô cn-names đã bị xóa khỏi DOM, danh sách đọc từ
    // appEntries — chưa nạp xong thì rỗng.
    if (IN_APP) return appEntries ? appEntries.map(e => e.name) : [];
    return parseNames($('cn-names').value);
  }

  // Danh sách chia dạng mục {id, name, label, given, gender, star,
  // points} (app: từ bản ghi lớp; trang rời: từ ô dán tên, id = null).
  function entryList() {
    if (IN_APP) return appEntries ? appEntries.slice() : [];
    const names = nameList();
    const givens = givenLabels(names);
    return names.map((n, i) => ({ id: null, name: n, label: n, given: givens[i] || n, gender: '', star: false, points: 0 }));
  }

  // Khóa định danh 1 bạn trong luật/lịch sử: id cố định ở chế độ app,
  // tên ở trang rời (không có bản ghi lớp).
  function keyOf(e) {
    return (IN_APP && e.id) ? e.id : e.name;
  }
  function entryByKey(key) {
    const list = entryList();
    for (let i = 0; i < list.length; i++) if (keyOf(list[i]) === key) return list[i];
    return null;
  }

  // Luật riêng + lịch sử chia theo từng lớp (trang rời: 1 khóa chung
  // 'standalone').
  function classKey() {
    if (!IN_APP) return 'standalone';
    const helper = gvClasses();
    const active = helper && typeof helper.active === 'function' ? helper.active() : '';
    return active || 'standalone';
  }
  function loadRules() {
    try {
      const all = JSON.parse(localStorage.getItem('uh_gv_chia_nhom_luat') || '{}');
      const arr = all[classKey()];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveRules(rules) {
    try {
      const all = JSON.parse(localStorage.getItem('uh_gv_chia_nhom_luat') || '{}');
      all[classKey()] = rules;
      localStorage.setItem('uh_gv_chia_nhom_luat', JSON.stringify(all));
    } catch (e) { /* bỏ qua */ }
  }
  function loadHistory() {
    try {
      const all = JSON.parse(localStorage.getItem('uh_gv_chia_nhom_lich_su') || '{}');
      const arr = all[classKey()];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveHistory() {
    try {
      const all = JSON.parse(localStorage.getItem('uh_gv_chia_nhom_lich_su') || '{}');
      const key = classKey();
      const list = Array.isArray(all[key]) ? all[key] : [];
      list.unshift(groups.map(g => g.map(e => keyOf(e))));
      all[key] = list.slice(0, 2);
      localStorage.setItem('uh_gv_chia_nhom_lich_su', JSON.stringify(all));
    } catch (e) { /* bỏ qua */ }
  }
  // Luật còn áp được: cả 2 bạn vẫn có trong danh sách hiện tại.
  function currentRules() {
    return loadRules().filter(r => entryByKey(r.a) && entryByKey(r.b));
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

  // Thư viện Excel (SheetJS, vendored trong src/vendor — không CDN,
  // không link ngoài) chỉ tải khi bấm Tải Excel, để trang nhẹ.
  var xlsxPromise = null;
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (xlsxPromise) return xlsxPromise;
    xlsxPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = '/assets/vendor/xlsx.full.min.js';
      s.onload = function () { resolve(window.XLSX); };
      s.onerror = function () { xlsxPromise = null; reject(new Error('Không tải được thư viện Excel.')); };
      document.head.appendChild(s);
    });
    return xlsxPromise;
  }

  function roleOf(i) { return ROLES[i % ROLES.length]; }

  function groupName(i) {
    if (theme === 'animal') return 'Nhóm ' + ANIMALS[i % ANIMALS.length];
    if (theme === 'hero') return 'Nhóm ' + HEROES[i % HEROES.length];
    if (theme === 'color') return 'Nhóm ' + COLORS[i % COLORS.length];
    return 'Nhóm ' + (i + 1);
  }

  // Số cột thẻ nhóm tự tính để mọi nhóm nằm gọn 1 màn, không để 1 thẻ
  // lẻ hàng dưới còn trống (Claude dặn, 19/11): 2 nhóm → 2 cột,
  // 3 → 3, 4 → 2×2, 5–6 → 3, 7–8 → 4.
  function groupCols(k) {
    if (k <= 2) return 2;
    if (k === 3) return 3;
    if (k === 4) return 2;
    if (k <= 6) return 3;
    return 4;
  }

  function groupCountsText(g) {
    const boys = g.filter(e => e.gender === 'nam').length;
    const girls = g.filter(e => e.gender === 'nữ').length;
    if (!boys && !girls) return '';
    const parts = [];
    if (boys) parts.push(boys + ' nam');
    if (girls) parts.push(girls + ' nữ');
    return parts.join(' ');
  }

  function groupsText() {
    const today = new Date().toLocaleDateString('vi-VN');
    const total = groups.reduce((a, g) => a + g.length, 0);
    let text = 'Danh sách nhóm — ngày ' + today + '\nTổng: ' + total + ' bạn, ' + groups.length + ' nhóm\n\n';
    groups.forEach((g, i) => {
      text += groupName(i) + ' (' + g.length + ' bạn)\n';
      g.forEach((e, j) => { text += '- ' + (e.label || e.name) + (showRoles ? ' (' + roleOf(j) + ')' : '') + '\n'; });
      text += '\n';
    });
    return text;
  }

  function groupCardsHtml() {
    const cols = groupCols(groups.length);
    let html = '<div class="gv-groups" data-cols="' + cols + '">';
    groups.forEach((g, i) => {
      const c = GROUP_COLORS[i % GROUP_COLORS.length];
      const style = ' style="--gc-bg:' + c.bg + ';--gc-fg:' + c.fg + ';--gc-border:' + c.border + ';animation-delay:' + (i * 80) + 'ms"';
      // Đầu thẻ hiện tên ngắn kiểu bản phác ("Hổ", không phải "Nhóm
      // Hổ") để tên + số bạn vừa 1 dòng, 4 nhóm 2 hàng vừa màn hình
      // 768px; chủ đề Số giữ "Nhóm 1" (chỉ "1" thì khó hiểu). Tên đầy
      // đủ vẫn dùng ở bản sao/lưu Excel và nút công bố.
      const short = groupName(i).replace(/^Nhóm /, '');
      const headName = /^\d+$/.test(short) ? groupName(i) : short;
      if (!revealed[i]) {
        html += '<div class="gv-group gv-group-hidden" data-group="' + i + '"' + style + '><h3><span class="gv-group-name">' + esc(headName) + '</span><span class="gv-group-counts">' + g.length + ' bạn</span></h3>'
          + '<button type="button" class="gv-group-q" data-reveal="' + i + '" aria-label="Công bố ' + esc(groupName(i)) + '">?</button></div>';
      } else {
        const counts = groupCountsText(g);
        html += '<div class="gv-group gv-group-in" data-group="' + i + '"' + style + '><h3><span class="gv-group-name">' + esc(headName) + '</span><span class="gv-group-counts">' + g.length + ' bạn' + (counts ? ' · ' + counts : '') + '</span></h3><ul>'
          + g.map((e, j) => {
            // Tên gọi trong thẻ nhóm (theo bản phác đã duyệt): e.given
            // đã tính trên toàn bộ lớp, khớp với Gọi tên.
            const label = e.given || e.name;
            return '<li draggable="true" data-g="' + i + '" data-m="' + j + '" title="' + esc(e.label || e.name) + '"><span class="gv-member-name">' + esc(label) + (e.star ? ' <span class="gv-member-star" aria-label="Bạn có sao">★</span>' : '') + '</span>' + (showRoles ? ' <span class="gv-role">' + roleOf(j) + '</span>' : '') + '</li>';
          }).join('') + '</ul></div>';
      }
    });
    return html + '</div>';
  }

  // Dải gập Cài đặt: chia xong thì thu cột cài đặt thành 1 dải ngang
  // trên cùng để thẻ nhóm dùng hết bề ngang; bấm dải mở lại đầy đủ
  // để chỉnh rồi chia lại. Dải chỉ hiện khi đã có kết quả chia.
  function setSettingsCollapsed(collapsed) {
    const v2 = root.querySelector('.cn-v2');
    const btn = $('cn-settings-toggle');
    if (!v2 || !btn) return;
    v2.classList.toggle('cn-collapsed', collapsed);
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    const caret = btn.querySelector('.cn-settings-caret');
    if (caret) caret.textContent = collapsed ? '▾' : '▴';
  }
  function clearSettingsStrip() {
    const v2 = root.querySelector('.cn-v2');
    if (v2) v2.classList.remove('cn-has-results', 'cn-collapsed');
  }

  function render() {
    const out = $('cn-out');
    if (!groups.length) {
      out.hidden = true;
      out.innerHTML = '';
      $('cn-result-actions').style.display = 'none';
      clearSettingsStrip();
      return;
    }
    const total = groups.reduce((a, g) => a + g.length, 0);
    const allRevealed = revealed.length > 0 && revealed.every(Boolean);
    out.innerHTML = '<p class="cn-result-head"><strong>Đã chia thành ' + groups.length + ' nhóm · ' + total + ' bạn</strong>'
      + (allRevealed ? '' : ' — bấm "Công bố từng nhóm" hoặc chạm vào thẻ "?" để mở từng nhóm.') + '</p>'
      + groupCardsHtml();
    out.hidden = false;
    out.style.display = '';
    $('cn-result-actions').style.display = '';
    const rb = $('cn-reveal');
    if (rb) rb.disabled = allRevealed;
    const db = $('cn-divide');
    if (db) db.textContent = 'Chia lại';
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

  // ---------- Thuật toán chia ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Rải rắn 1→k→1→k… — các nhóm lệch nhau tối đa 1 bạn, và thứ tự
  // đầu danh sách (sao / điểm cao) được rải đều các nhóm.
  function snakeDeal(ordered, k) {
    const gs = [];
    for (let i = 0; i < k; i++) gs.push([]);
    let dir = 1, gi = 0;
    ordered.forEach(e => {
      gs[gi].push(e);
      if (k > 1) {
        gi += dir;
        if (gi === k) { gi = k - 1; dir = -1; }
        else if (gi < 0) { gi = 0; dir = 1; }
      }
    });
    return gs;
  }

  function groupOf(gs, key) {
    for (let i = 0; i < gs.length; i++) {
      for (let j = 0; j < gs[i].length; j++) if (keyOf(gs[i][j]) === key) return i;
    }
    return -1;
  }

  // Đưa bạn (key) vào nhóm gIdx có vi phạm luật KHÔNG cùng nhóm không.
  function violatesApart(gs, key, gIdx, rules) {
    const g = gs[gIdx];
    for (let r = 0; r < rules.length; r++) {
      const rule = rules[r];
      if (rule.type !== 'apart') continue;
      if (rule.a === key && g.some(e => keyOf(e) === rule.b)) return true;
      if (rule.b === key && g.some(e => keyOf(e) === rule.a)) return true;
    }
    return false;
  }

  function rulesSatisfied(gs, rules) {
    for (let r = 0; r < rules.length; r++) {
      const rule = rules[r];
      const ga = groupOf(gs, rule.a), gb = groupOf(gs, rule.b);
      if (ga < 0 || gb < 0) continue;
      if (rule.type === 'apart' && ga === gb) return false;
      if (rule.type === 'together' && ga !== gb) return false;
    }
    return true;
  }

  // Sửa luật riêng bằng hoán đổi 1–1 (giữ nguyên sĩ số mỗi nhóm):
  // cặp KHÔNG cùng nhóm mà chung nhóm thì đổi 1 bạn sang nhóm khác;
  // cặp cùng nhóm mà khác nhóm thì đổi để gom lại. Giới hạn 30 lượt
  // để không xoay mãi khi luật mâu thuẫn nhau.
  function applyRules(gs, rules) {
    if (!rules.length) return;
    for (let pass = 0; pass < 30; pass++) {
      let fixed = false;
      for (let r = 0; r < rules.length; r++) {
        const rule = rules[r];
        const ga = groupOf(gs, rule.a), gb = groupOf(gs, rule.b);
        if (ga < 0 || gb < 0) continue;
        if (rule.type === 'apart' && ga === gb) {
          // Đổi B sang nhóm khác: tìm bạn X ở nhóm khác để hoán đổi
          // mà không tạo vi phạm mới cho cả 2 bên.
          const bIdx = gs[ga].findIndex(e => keyOf(e) === rule.b);
          if (bIdx < 0) continue;
          for (let h = 0; h < gs.length && !fixed; h++) {
            if (h === ga) continue;
            for (let j = 0; j < gs[h].length; j++) {
              const xKey = keyOf(gs[h][j]);
              if (violatesApart(gs, rule.b, h, rules) || violatesApart(gs, xKey, ga, rules)) continue;
              const t = gs[ga][bIdx]; gs[ga][bIdx] = gs[h][j]; gs[h][j] = t;
              fixed = true;
              break;
            }
          }
        } else if (rule.type === 'together' && ga !== gb) {
          // Đổi B vào nhóm của A: hoán đổi B với 1 bạn X trong nhóm A
          // (X sang nhóm B) mà không tạo vi phạm mới.
          const bIdx = gs[gb].findIndex(e => keyOf(e) === rule.b);
          if (bIdx < 0) continue;
          for (let j = 0; j < gs[ga].length; j++) {
            const xKey = keyOf(gs[ga][j]);
            if (violatesApart(gs, rule.b, ga, rules) || violatesApart(gs, xKey, gb, rules)) continue;
            const t = gs[gb][bIdx]; gs[gb][bIdx] = gs[ga][j]; gs[ga][j] = t;
            fixed = true;
            break;
          }
        }
      }
      if (!fixed) break;
    }
  }

  // Tránh lặp 2 lần chia trước: hoán đổi cuối để phá các cặp từng
  // chung nhóm ở 1 trong 2 lần trước, không phá luật riêng.
  function avoidRepeat(gs, rules) {
    const hist = loadHistory();
    if (!hist.length) return;
    const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
    const oldPairs = {};
    hist.forEach(grouping => {
      grouping.forEach(g => {
        for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) oldPairs[pairKey(g[i], g[j])] = true;
      });
    });
    const countRepeats = () => {
      let c = 0;
      gs.forEach(g => {
        for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
          if (oldPairs[pairKey(keyOf(g[i]), keyOf(g[j]))]) c++;
        }
      });
      return c;
    };
    for (let pass = 0; pass < 40; pass++) {
      const before = countRepeats();
      if (before === 0) return;
      let improved = false;
      outer: for (let a = 0; a < gs.length; a++) {
        for (let i = 0; i < gs[a].length; i++) {
          for (let b = a + 1; b < gs.length; b++) {
            for (let j = 0; j < gs[b].length; j++) {
              const t = gs[a][i]; gs[a][i] = gs[b][j]; gs[b][j] = t;
              if (countRepeats() < before && rulesSatisfied(gs, rules)) { improved = true; break outer; }
              const t2 = gs[a][i]; gs[a][i] = gs[b][j]; gs[b][j] = t2;
            }
          }
        }
      }
      if (!improved) return;
    }
  }

  // Thông minh: sao trước, rồi nam, rồi nữ (mỗi tầng xếp theo điểm
  // giảm dần) — rải rắn; áp luật riêng; tránh trùng 2 lần trước.
  // Chip cân bằng nào tắt thì bỏ tầng đó (giữ thứ tự lớp).
  function divideSmart(list, k) {
    const rules = currentRules();
    const byPoints = balance.points
      ? ((a, b) => (b.points || 0) - (a.points || 0))
      : null;
    const sortTier = arr => {
      const a = arr.slice();
      if (byPoints) a.sort(byPoints);
      if (!balance.gender) return a;
      const boys = a.filter(e => e.gender === 'nam');
      const girls = a.filter(e => e.gender === 'nữ');
      const other = a.filter(e => e.gender !== 'nam' && e.gender !== 'nữ');
      return boys.concat(girls).concat(other);
    };
    let ordered;
    if (balance.star) {
      ordered = sortTier(list.filter(e => e.star)).concat(sortTier(list.filter(e => !e.star)));
    } else {
      ordered = sortTier(list);
    }
    const gs = snakeDeal(ordered, k);
    applyRules(gs, rules);
    if (balance.avoid) avoidRepeat(gs, rules);
    return gs;
  }

  // Đều năng lực: xếp theo điểm thi đua, rải rắn.
  function divideBalanced(list, k) {
    const ordered = list.slice().sort((a, b) => (b.points || 0) - (a.points || 0));
    return snakeDeal(ordered, k);
  }

  // Ngẫu nhiên: xáo trộn rồi chia vòng tròn.
  function divideRandom(list, k) {
    const gs = [];
    for (let i = 0; i < k; i++) gs.push([]);
    shuffle(list).forEach((e, i) => { gs[i % k].push(e); });
    return gs;
  }

  // Theo danh sách: cắt liên tiếp theo thứ tự lớp, lệch nhau ≤1 bạn.
  function divideList(list, k) {
    const gs = [];
    const base = Math.floor(list.length / k);
    const rem = list.length % k;
    let at = 0;
    for (let i = 0; i < k; i++) {
      const size = base + (i < rem ? 1 : 0);
      gs.push(list.slice(at, at + size));
      at += size;
    }
    return gs;
  }

  function divide() {
    const list = entryList();
    const out = $('cn-out');
    if (list.length < 2) {
      out.innerHTML = '<p class="error">Cần ít nhất 2 bạn để chia nhóm.</p>';
      out.hidden = false;
      out.style.display = '';
      return;
    }
    const k = Math.max(2, Math.min(groupCount, list.length, 8));
    let result;
    if (divideMode === 'smart') result = divideSmart(list, k);
    else if (divideMode === 'balanced') result = divideBalanced(list, k);
    else if (divideMode === 'list') result = divideList(list, k);
    else result = divideRandom(list, k);
    groups = result;
    revealed = groups.map(() => false);
    if (revealTimer) { clearInterval(revealTimer); revealTimer = null; }
    saveHistory();
    showMsg('');
    tick();
    render();
    // Chia xong: thu cài đặt thành dải gập để thẻ nhóm dùng hết bề ngang.
    const v2 = root.querySelector('.cn-v2');
    if (v2) v2.classList.add('cn-has-results');
    setSettingsCollapsed(true);
    fanfare();
  }

  // ---------- Công bố từng nhóm ----------
  function revealNext() {
    const idx = revealed.indexOf(false);
    if (idx === -1) return false;
    revealed[idx] = true;
    render();
    tick();
    return true;
  }

  function revealAllSequentially() {
    const btn = $('cn-reveal');
    if (btn) btn.disabled = true;
    if (revealTimer) clearInterval(revealTimer);
    revealNext(); // mở nhóm đầu ngay, không đợi 0,7s
    revealTimer = setInterval(() => {
      if (!revealNext()) {
        clearInterval(revealTimer);
        revealTimer = null;
        fanfare();
      }
    }, 700);
  }

  // ---------- Đưa vào Bảng điểm / Chép / Tải ----------
  function toScoreboard() {
    if (!groups.length) return;
    let arr = [];
    try {
      arr = JSON.parse(localStorage.getItem('uh_bangdiemlop') || '[]');
      if (!Array.isArray(arr)) arr = [];
    } catch (e) { arr = []; }
    const have = {};
    arr.forEach(m => { if (m && m.name) have[m.name] = true; });
    let added = 0, skipped = 0;
    groups.forEach(g => g.forEach(e => {
      const nm = e.label || e.name;
      if (have[nm]) skipped++;
      else { arr.push({ name: nm, score: 0 }); have[nm] = true; added++; }
    }));
    try { localStorage.setItem('uh_bangdiemlop', JSON.stringify(arr)); } catch (e) { /* bỏ qua */ }
    showMsg('Đã đưa ' + added + ' bạn vào Bảng điểm' + (skipped ? ' (' + skipped + ' bạn đã có sẵn nên giữ nguyên điểm).' : '.'));
    tick();
  }

  function exportExcel() {
    if (!groups.length) return;
    const btn = $('cn-excel');
    btn.disabled = true;
    btn.textContent = 'Đang tạo file…';
    loadXlsx().then(XLSX => {
      const rows = [['Nhóm', 'STT', 'Họ tên', 'Vai trò']];
      groups.forEach((g, i) => {
        g.forEach((e, j) => rows.push([groupName(i), j + 1, e.label || e.name, showRoles ? roleOf(j) : '']));
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 22 }, { wch: 6 }, { wch: 28 }, { wch: 14 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Nhóm');
      XLSX.writeFile(wb, 'chia-nhom.xlsx');
      showMsg('Đã tải file chia-nhom.xlsx.');
    }).catch(() => {
      showMsg('Không tải được thư viện Excel — kiểm tra mạng rồi thử lại nhé.');
    }).then(() => {
      btn.disabled = false;
      btn.textContent = 'Tải Excel';
    });
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

  // ---------- Cột cài đặt ----------
  function updateStepper() {
    const n = entryList().length;
    const max = Math.max(2, Math.min(8, n));
    if (groupCount > max) groupCount = max;
    if (groupCount < 2) groupCount = 2;
    $('cn-group-count').textContent = groupCount;
    $('cn-minus').disabled = groupCount <= 2;
    $('cn-plus').disabled = groupCount >= max;
    if (n < 2) {
      $('cn-per-group').textContent = '—';
      return;
    }
    const base = Math.floor(n / groupCount);
    const rem = n % groupCount;
    $('cn-per-group').textContent = rem === 0
      ? base + ' bạn/nhóm'
      : base + '–' + (base + 1) + ' bạn/nhóm';
  }

  $('cn-minus').addEventListener('click', () => { groupCount--; updateStepper(); });
  $('cn-plus').addEventListener('click', () => { groupCount++; updateStepper(); });

  function paintBalanceChips() {
    const smart = divideMode === 'smart';
    root.querySelectorAll('.cn-bal-chip').forEach(chip => {
      const key = chip.getAttribute('data-bal');
      const on = !!balance[key];
      chip.classList.toggle('cn-bal-on', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      chip.disabled = !smart;
    });
  }

  root.querySelectorAll('.cn-mode-card').forEach(card => {
    card.addEventListener('click', () => {
      divideMode = card.getAttribute('data-divide-mode');
      root.querySelectorAll('.cn-mode-card').forEach(c => {
        const on = c === card;
        c.classList.toggle('cn-mode-active', on);
        c.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      paintBalanceChips();
    });
  });

  root.querySelectorAll('.cn-bal-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-bal');
      balance[key] = !balance[key];
      paintBalanceChips();
    });
  });

  root.querySelectorAll('.cn-theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      theme = btn.getAttribute('data-theme');
      root.querySelectorAll('.cn-theme-btn').forEach(b => {
        const on = b === btn;
        b.classList.toggle('cn-theme-active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      if (groups.length) render();
    });
  });

  $('cn-roles').addEventListener('change', () => {
    showRoles = $('cn-roles').checked;
    if (groups.length) render();
  });

  // ---------- Luật riêng ----------
  function refreshRuleSelects() {
    const list = entryList();
    const opts = list.map(e => '<option value="' + esc(keyOf(e)) + '">' + esc(e.label || e.name) + '</option>').join('');
    const a = $('cn-rule-a'), b = $('cn-rule-b');
    const curA = a.value, curB = b.value;
    a.innerHTML = opts || '<option value="">— Chưa có bạn nào —</option>';
    b.innerHTML = opts || '<option value="">— Chưa có bạn nào —</option>';
    if (curA && entryByKey(curA)) a.value = curA;
    if (curB && entryByKey(curB)) b.value = curB;
    else if (list.length > 1) b.value = keyOf(list[1]);
  }

  function renderRules() {
    const box = $('cn-rules');
    const rules = loadRules();
    if (!rules.length) {
      box.innerHTML = '<p class="muted cn-rules-empty">Chưa có luật nào — ví dụ: 2 bạn hay trêu nhau thì cho khác nhóm.</p>';
      return;
    }
    box.innerHTML = rules.map((r, i) => {
      const ea = entryByKey(r.a), eb = entryByKey(r.b);
      const na = ea ? (ea.label || ea.name) : r.a;
      const nb = eb ? (eb.label || eb.name) : r.b;
      const missing = !ea || !eb;
      const mid = r.type === 'apart' ? '✕' : '+';
      const tag = r.type === 'apart' ? 'không cùng nhóm' : 'cùng nhóm';
      return '<div class="cn-rule cn-rule-' + r.type + (missing ? ' cn-rule-missing' : '') + '">'
        + '<span class="cn-rule-names">' + esc(na) + ' <b>' + mid + '</b> ' + esc(nb) + '</span>'
        + '<span class="cn-rule-tag">' + tag + '</span>'
        + (r.note ? '<span class="cn-rule-note">' + esc(r.note) + '</span>' : '')
        + (missing ? '<span class="cn-rule-note">Bạn này không còn trong lớp — luật tạm không áp.</span>' : '')
        + '<button type="button" class="cn-rule-del" data-del-rule="' + i + '" aria-label="Xóa luật ' + esc(na) + ' ' + tag + ' ' + esc(nb) + '">✕</button>'
        + '</div>';
    }).join('');
  }

  $('cn-rule-add').addEventListener('click', () => {
    const a = $('cn-rule-a').value, b = $('cn-rule-b').value;
    const type = $('cn-rule-type').value;
    const note = $('cn-rule-note').value.trim();
    if (!a || !b) { showMsg('Chọn đủ 2 bạn để thêm luật.'); return; }
    if (a === b) { showMsg('Chọn 2 bạn khác nhau nhé.'); return; }
    const rules = loadRules();
    const dup = rules.some(r => ((r.a === a && r.b === b) || (r.a === b && r.b === a)) && r.type === type);
    if (dup) { showMsg('Luật này đã có rồi.'); return; }
    rules.push({ a, b, type, note });
    saveRules(rules);
    $('cn-rule-note').value = '';
    renderRules();
    showMsg('Đã thêm luật — luật áp dụng từ lần chia tới.');
  });

  $('cn-rules').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-del-rule]');
    if (!btn) return;
    const i = parseInt(btn.getAttribute('data-del-rule'), 10);
    const rules = loadRules();
    if (isNaN(i) || i < 0 || i >= rules.length) return;
    rules.splice(i, 1);
    saveRules(rules);
    renderRules();
  });

  // ---------- Nút chính + kết quả ----------
  $('cn-divide').addEventListener('click', divide);
  $('cn-reveal').addEventListener('click', revealAllSequentially);
  $('cn-stage').addEventListener('click', openStage);
  $('cn-to-scoreboard').addEventListener('click', toScoreboard);
  $('cn-excel').addEventListener('click', exportExcel);
  $('cn-download').addEventListener('click', () => download('chia-nhom.txt', groupsText()));
  $('cn-copy').addEventListener('click', () => {
    const btn = $('cn-copy');
    const done = () => {
      btn.textContent = 'Đã chép!';
      setTimeout(() => { btn.textContent = 'Chép danh sách'; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(groupsText()).then(done, () => fallbackCopy(done));
    } else {
      fallbackCopy(done);
    }
  });

  // Chạm vào thẻ "?" để công bố ngay nhóm đó.
  $('cn-out').addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-reveal]');
    if (!q) return;
    const idx = parseInt(q.getAttribute('data-reveal'), 10);
    if (isNaN(idx) || revealed[idx]) return;
    revealed[idx] = true;
    render();
    tick();
  });

  // Kéo thả học sinh giữa các nhóm (HTML5 drag-drop).
  let dragFrom = null;
  $('cn-out').addEventListener('dragstart', (ev) => {
    const li = ev.target.closest('li[draggable]');
    if (!li) return;
    dragFrom = { g: parseInt(li.getAttribute('data-g'), 10), m: parseInt(li.getAttribute('data-m'), 10) };
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', dragFrom.g + ':' + dragFrom.m); } catch (e) { /* bỏ qua */ }
    li.classList.add('gv-dragging');
  });
  $('cn-out').addEventListener('dragend', () => {
    dragFrom = null;
    root.querySelectorAll('.gv-group-drop').forEach(el => el.classList.remove('gv-group-drop'));
    root.querySelectorAll('.gv-dragging').forEach(el => el.classList.remove('gv-dragging'));
  });
  $('cn-out').addEventListener('dragover', (ev) => {
    const card = ev.target.closest('.gv-group');
    if (!card || !card.querySelector('ul')) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    card.classList.add('gv-group-drop');
  });
  $('cn-out').addEventListener('dragleave', (ev) => {
    const card = ev.target.closest('.gv-group');
    if (card && !card.contains(ev.relatedTarget)) card.classList.remove('gv-group-drop');
  });
  $('cn-out').addEventListener('drop', (ev) => {
    const card = ev.target.closest('.gv-group');
    if (!card || !dragFrom) return;
    ev.preventDefault();
    const to = parseInt(card.getAttribute('data-group'), 10);
    if (isNaN(to) || to === dragFrom.g) return;
    const moved = groups[dragFrom.g].splice(dragFrom.m, 1)[0];
    if (moved) groups[to].push(moved);
    render();
    tick();
  });

  // Đọc lớp đã lưu từ khóa 'uh_gv_lop' (trang rời).
  (function initClassLoad() {
    const helper = gvClasses();
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
      revealed = [];
      $('cn-out').hidden = true;
      $('cn-result-actions').style.display = 'none';
      clearSettingsStrip();
      updateStepper();
      refreshRuleSelects();
      msg.textContent = 'Đã nạp lớp ' + name + ' (' + names.length + ' bạn) — bấm "Chia nhóm" để chia.';
      msg.style.display = '';
    });
  })();

  // Sửa danh sách tay thì kết quả cũ không còn đúng — xóa để chia lại.
  $('cn-names').addEventListener('input', () => {
    groups = [];
    revealed = [];
    $('cn-out').hidden = true;
    $('cn-result-actions').style.display = 'none';
    clearSettingsStrip();
    updateStepper();
    refreshRuleSelects();
  });

  // Bấm dải "Cài đặt ▾" mở lại đầy đủ cài đặt để chỉnh rồi chia lại.
  $('cn-settings-toggle').addEventListener('click', () => {
    const v2 = root.querySelector('.cn-v2');
    if (v2) setSettingsCollapsed(!v2.classList.contains('cn-collapsed'));
  });

  (function initSoundBtn() {
    const btn = $('cn-sound');
    const s = gvSound();
    if (!s) { btn.style.display = 'none'; return; }
    const paint = () => { btn.textContent = 'Âm thanh: ' + (s.enabled() ? 'Bật' : 'Tắt'); };
    btn.addEventListener('click', () => { s.toggle(); paint(); });
    paint();
  })();

  // --- Chế độ Bàn giáo viên: nạp tên từ lớp đang chọn (trừ bạn vắng).
  // App gọi root._gvRefresh() mỗi lần mở lại tab này; chỉ nạp lại khi
  // danh sách đổi (so chữ ký) để không mất kết quả chia vừa rồi. Điểm
  // thi đua KHÔNG nằm trong chữ ký — đổi điểm không xóa kết quả chia.
  let appSig = '';
  function loadFromActiveClass() {
    const helper = gvClasses();
    if (!helper || typeof helper.getRecords !== 'function' || typeof helper.active !== 'function') return;
    const active = helper.active();
    const recs = active ? helper.getRecords(active) : [];
    // Tên hiển thị tính trên TOÀN BỘ lớp (kể cả bạn vắng) để số
    // (1)/(2) khớp với ngăn lớp/Bảng điểm.
    const labels = (typeof helper.displayNames === 'function') ? helper.displayNames(recs) : recs.map(r => r.name);
    const givens = givenLabels(recs.map(r => r.name));
    const entries = [];
    recs.forEach((r, i) => {
      if (r.absent) return;
      entries.push({ id: r.id, name: r.name, label: labels[i] || r.name, given: givens[i] || r.name, gender: r.gender || '', star: !!r.star, points: r.points || 0 });
    });
    const names = entries.map(e => e.name);
    const sig = active + '\n' + entries.map(e => e.id + '|' + e.name + '|' + (e.gender || '') + '|' + (e.star ? 1 : 0)).join('\n');
    if (sig === appSig) return;
    appSig = sig;
    // Chưa có lớp (hoặc lớp chưa có bạn nào để chia): hiện đúng 1 nút
    // dẫn về tab Lớp học, thay cho ô nhập tay của trang rời.
    const noClass = $('cn-no-class');
    if (noClass) {
      const show = names.length === 0;
      noClass.style.display = show ? '' : 'none';
      if (show) {
        $('cn-no-class-text').textContent = active
          ? classLabel(active) + ' chưa có bạn nào để chia — thêm bạn hoặc bỏ đánh dấu Vắng ở tab Lớp học.'
          : 'Chưa có lớp nào — tạo lớp ở tab Lớp học để chia nhóm.';
        $('cn-no-class-btn').textContent = active ? 'Mở tab Lớp học' : 'Tạo lớp';
      }
    }
    appEntries = entries;
    groups = [];
    revealed = [];
    $('cn-out').hidden = true;
    $('cn-result-actions').style.display = 'none';
    clearSettingsStrip();
    $('cn-divide').textContent = 'Chia nhóm';
    updateStepper();
    refreshRuleSelects();
    renderRules();
    updateStage();
  }

  if (IN_APP) {
    // Xóa hẳn khỏi DOM (không chỉ ẩn): khung nạp lớp + câu "(lưu lớp
    // trong công cụ Gọi tên)" + ô dán tên của trang rời không có chỗ
    // trong Bàn giáo viên — tab Lớp học đã làm việc đó.
    const loadField = $('cn-class-load').closest('.field');
    if (loadField) loadField.remove();
    const msg = $('cn-class-msg');
    if (msg) msg.remove();
    const namesField = $('cn-names').closest('.field');
    if (namesField) namesField.remove();
    // Trong app, danh sách lấy từ tab Lớp học — mô tả của trang rời
    // ("Dán danh sách lớp...") không còn đúng nữa nên đổi theo.
    const desc = root.querySelector('.tool-head p');
    if (desc) desc.textContent = 'Danh sách lấy từ lớp đang chọn ở tab Lớp học — các nhóm được rải đều sao, nam/nữ và điểm thi đua, áp luật riêng từng bạn, mỗi bạn có một vai trò.';
    const noClassBtn = $('cn-no-class-btn');
    if (noClassBtn) noClassBtn.addEventListener('click', () => {
      const tab = document.getElementById('gv-tab-lop-hoc');
      if (tab) tab.click();
    });
    root._gvRefresh = loadFromActiveClass;
    loadFromActiveClass();
  } else {
    updateStepper();
    refreshRuleSelects();
    renderRules();
  }
  paintBalanceChips();
}
