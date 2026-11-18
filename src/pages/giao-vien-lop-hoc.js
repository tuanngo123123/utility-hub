// Trang Bàn giáo viên (/giao-vien/lop-hoc/): MỘT trang ứng dụng gom
// 10 công cụ Giáo viên + quản lý lớp học — giáo viên mở lên là dùng
// cả tiết trên máy chiếu, không cần chuyển trang. KHÔNG phải công cụ
// mới (không tính vào số công cụ): trang này nhúng lại body()/init()
// của 10 công cụ giao-vien đã có, mỗi công cụ một tab, khởi tạo lười
// khi mở tab lần đầu. Tab Lớp học quản lý danh sách lớp dạng bản ghi
// {name, gender, star, absent, points} (xem UhGvClasses trong app.js).
// Công cụ trong app chạy ở "chế độ app" (root có data-gv-app="1"):
// chúng ẩn khung quản lý lớp riêng và lấy tên từ lớp đang chọn.
// Chỉ học Ý TƯỞNG tổ chức (một app + tab + danh sách lớp chung) từ
// edutoolkit — không chép code, chữ hay hình của họ.
import { esc } from '../tool-card.js';

// Thứ tự tab: Lớp học trước, rồi 10 công cụ theo thứ tự trang mục.
// key: phím tắt chuyển tab (1–9/0); Bốc câu hỏi không có phím số
// (hết phím) — chuyển bằng phím ← → hoặc bấm chuột.
const TABS = [
  { id: 'lop-hoc', label: 'Lớp học', tool: null, key: '1' },
  { id: 'goi-ten', label: 'Gọi tên', tool: 'goi-ten-ngau-nhien', key: '2' },
  { id: 'chia-nhom', label: 'Chia nhóm', tool: 'chia-nhom-ngau-nhien', key: '3' },
  { id: 'xuc-xac', label: 'Xúc xắc', tool: 'tung-xuc-xac-dong-xu', key: '4' },
  { id: 'boc-tham', label: 'Bốc thăm', tool: 'boc-tham-so', key: '5' },
  { id: 'bang-diem', label: 'Bảng điểm', tool: 'bang-diem-lop', key: '6' },
  { id: 'am-thanh', label: 'Âm thanh', tool: 'am-thanh-lop-hoc', key: '7' },
  { id: 'dem-nguoc', label: 'Đếm ngược', tool: 'dem-nguoc-lop-hoc', key: '8' },
  { id: 'do-on', label: 'Đo ồn', tool: 'do-do-on-lop-hoc', key: '9' },
  { id: 'diem-danh', label: 'Điểm danh', tool: 'diem-danh', key: '0' },
  { id: 'boc-cau-hoi', label: 'Bốc câu hỏi', tool: 'boc-cau-hoi', key: '' },
];

export function body(ctx) {
  const tools = (ctx.tools || []).filter((t) => t.categorySlug === 'giao-vien');
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  for (const t of TABS) {
    if (t.tool && !bySlug.has(t.tool)) {
      throw new Error(`Bàn giáo viên: thiếu công cụ "${t.tool}" (hạng mục giao-vien).`);
    }
  }
  // init() tự chứa hoàn toàn nên nhúng được bằng toString() như trang
  // công cụ (build.mjs toolPageHtml) — escape </script> như ở đó.
  const escScript = (s) => String(s).replace(/<\/script/gi, '<\\/script');
  const inits = TABS.filter((t) => t.tool)
    .map((t) => `  '${t.id}': (${escScript(bySlug.get(t.tool).initSource)})`)
    .join(',\n');

  const tabBar = TABS.map((t, i) => {
    const kbd = t.key ? ` <kbd>${t.key}</kbd>` : '';
    return `<button type="button" class="gv-app-tab${i === 0 ? ' gv-app-tab-active' : ''}" role="tab" id="gv-tab-${t.id}" data-tab="${t.id}" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="gv-panel-${t.id}" tabindex="${i === 0 ? '0' : '-1'}">${esc(t.label)}${kbd}</button>`;
  }).join('\n      ');

  const toolPanels = TABS.filter((t) => t.tool).map((t) => {
    const tool = bySlug.get(t.tool);
    return `<section class="gv-app-panel" id="gv-panel-${t.id}" role="tabpanel" aria-labelledby="gv-tab-${t.id}" hidden>
      <div id="gv-tool-${t.id}" data-gv-app="1">${tool.bodyHtml}</div>
    </section>`;
  }).join('\n');

  return `
  <div class="gv-app" id="gv-app">
    <div class="gv-app-head">
      <div>
        <h1>Bàn giáo viên</h1>
        <p class="muted">Một trang dùng cả tiết trên máy chiếu: gọi tên, chia nhóm, chấm điểm, đếm ngược… không cần chuyển trang. Lớp đang dạy: <strong id="gv-app-classname">chưa chọn lớp</strong></p>
      </div>
      <div class="gv-app-head-actions">
        <a class="btn" href="/giao-vien/">← Mục Giáo viên</a>
        <button type="button" class="btn" id="gv-app-help-btn" aria-haspopup="dialog">Phím tắt <kbd>?</kbd></button>
      </div>
    </div>

    <div class="gv-app-tabs" role="tablist" aria-label="Công cụ giáo viên" id="gv-app-tablist">
      ${tabBar}
      <span class="gv-app-teach-class" id="gv-app-teach-class"></span>
      <button type="button" class="btn gv-app-teach-btn" id="gv-app-teach-btn" aria-pressed="false" title="Chế độ Dạy học (phím F)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg> <span id="gv-app-teach-label">Dạy học</span> <kbd>F</kbd></button>
    </div>

    <section class="gv-app-panel" id="gv-panel-lop-hoc" role="tabpanel" aria-labelledby="gv-tab-lop-hoc">
      <div class="tool-panel gv-app-class">
        <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><div><h2>Lớp học</h2><p class="muted">Chọn lớp đang dạy — mọi công cụ trong Bàn giáo viên đều dùng lớp này. Sửa trực tiếp trong bảng, thay đổi lưu ngay trên trình duyệt. Bạn đánh dấu Vắng sẽ không bị gọi tên, chia nhóm hay bốc câu hỏi.</p></div></div>
        <div class="gv-app-classbar">
          <div class="field"><label for="lh-class">Lớp đang dạy</label><select id="lh-class"><option value="">— Chưa có lớp nào —</option></select></div>
          <div class="field"><label for="lh-new-name">Tạo lớp mới</label><div style="display:flex;gap:8px"><input id="lh-new-name" type="text" placeholder="Ví dụ: 6A" autocomplete="off" style="flex:1;min-width:0"><button type="button" class="btn btn-primary" id="lh-create">Tạo lớp</button></div></div>
          <button type="button" class="btn btn-ghost" id="lh-delete">Xóa lớp này</button>
        </div>
        <p class="note" id="lh-msg" style="display:none"></p>
        <div class="gv-app-tablewrap" id="lh-table-wrap" style="display:none">
          <table class="gv-app-table">
            <thead><tr><th scope="col">#</th><th scope="col">Tên học sinh</th><th scope="col">Giới tính</th><th scope="col">⭐</th><th scope="col">Vắng</th><th scope="col">Điểm</th><th scope="col"><span class="sr-only">Xóa</span></th></tr></thead>
            <tbody id="lh-tbody"></tbody>
          </table>
        </div>
        <p class="muted" id="lh-empty">Chưa có lớp nào — tạo lớp mới rồi dán danh sách ở ô dưới.</p>
        <div class="btn-row"><button type="button" class="btn" id="lh-add-row">+ Thêm bạn</button></div>
        <div class="gv-class-box">
          <h3>Nhập danh sách lớp</h3>
          <p class="muted">Dán từ Excel (cột STT tự bỏ, cột Giới tính tự nhận) hoặc tải file .csv / .xlsx có cột Tên, Giới tính. Đọc xong sẽ hiện xem trước — bấm xác nhận mới thêm vào lớp.</p>
          <div class="field"><label for="lh-paste">Dán danh sách (mỗi bạn một dòng)</label><textarea id="lh-paste" rows="5" placeholder="1. Nguyễn Văn A&#10;2. Trần Thị B"></textarea></div>
          <div class="btn-row">
            <button type="button" class="btn btn-primary" id="lh-paste-add">Thêm vào lớp</button>
            <label class="btn" for="lh-file" style="cursor:pointer">Tải file lên (.csv / .xlsx)</label>
            <input id="lh-file" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="position:absolute;width:1px;height:1px;opacity:0">
            <button type="button" class="btn" id="lh-sample">Tải file mẫu (.csv)</button>
          </div>
          <div class="gv-import-preview" id="lh-preview" style="display:none">
            <p id="lh-preview-text"></p>
            <div class="btn-row">
              <button type="button" class="btn btn-primary" id="lh-preview-confirm">Xác nhận thêm</button>
              <button type="button" class="btn" id="lh-preview-cancel">Hủy</button>
            </div>
          </div>
          <p class="note" id="lh-import-msg" style="display:none"></p>
        </div>
        <div class="gv-class-box">
          <h3>Sao lưu &amp; khôi phục</h3>
          <p class="muted">Dữ liệu chỉ nằm trên trình duyệt của bạn (lớp, điểm, điểm danh, bộ câu hỏi, cài đặt âm thanh) — không gửi lên máy chủ nào. Sao lưu ra 1 file để đổi máy hoặc phòng khi xóa dữ liệu trình duyệt.</p>
          <div class="btn-row">
            <button type="button" class="btn" id="lh-backup">Sao lưu dữ liệu (.json)</button>
            <label class="btn" for="lh-restore" style="cursor:pointer">Khôi phục từ file</label>
            <input id="lh-restore" type="file" accept=".json,application/json" style="position:absolute;width:1px;height:1px;opacity:0">
            <button type="button" class="btn btn-primary" id="lh-restore-confirm" style="display:none">Xác nhận khôi phục (ghi đè)</button>
          </div>
          <p class="note" id="lh-backup-msg" style="display:none"></p>
        </div>
      </div>
    </section>

${toolPanels}
  </div>

  <div class="gv-app-help" id="gv-app-help-panel" hidden>
    <div class="gv-app-help-box" role="dialog" aria-modal="true" aria-labelledby="gv-app-help-title">
      <h2 id="gv-app-help-title">Phím tắt</h2>
      <table class="gv-app-keys">
        <tr><td><kbd>1</kbd>–<kbd>9</kbd>, <kbd>0</kbd></td><td>Chuyển tab: 1 Lớp học, 2 Gọi tên, 3 Chia nhóm, 4 Xúc xắc, 5 Bốc thăm, 6 Bảng điểm, 7 Âm thanh, 8 Đếm ngược, 9 Đo ồn, 0 Điểm danh</td></tr>
        <tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Tab trước / tab sau (kể cả tab Bốc câu hỏi)</td></tr>
        <tr><td><kbd>Space</kbd> / <kbd>Enter</kbd></td><td>Hành động chính của tab đang mở (gọi tên, chia nhóm, tung, bốc…)</td></tr>
        <tr><td><kbd>F</kbd></td><td>Bật/tắt chế độ Dạy học (ẩn header, footer, thanh đáy — toàn màn hình)</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Thoát chế độ Dạy học / đóng bảng này / đóng lớp phủ Chiếu lớp</td></tr>
        <tr><td><kbd>?</kbd></td><td>Mở bảng phím tắt này</td></tr>
      </table>
      <p class="muted">Phím tắt không chạy khi đang gõ trong ô nhập — bấm ra ngoài rồi dùng phím.</p>
      <div class="btn-row"><button type="button" class="btn btn-primary" id="gv-app-help-close">Đóng</button></div>
    </div>
  </div>

  <script>
  // Script của Bàn giáo viên: tự chứa hoàn toàn (không import) — chạy
  // khi DOM sẵn sàng để app.js kịp định nghĩa window.UhGvClasses.
  // Chế độ Dạy học: áp bố cục ẩn NGAY khi tải (trước DOMContentLoaded)
  // để không chớp header/footer nếu lần trước đang bật.
  try {
    if (localStorage.getItem('uh_gv_dayhoc') === '1') document.body.classList.add('gv-teach');
  } catch (e) { /* bỏ qua */ }
  var GV_INITS = {
${inits}
  };
  (function () {
    function ready(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else fn();
    }
    ready(function () {
      var TABS = ['lop-hoc', 'goi-ten', 'chia-nhom', 'xuc-xac', 'boc-tham', 'bang-diem', 'am-thanh', 'dem-nguoc', 'do-on', 'diem-danh', 'boc-cau-hoi'];
      var DIGITS = { '1': 'lop-hoc', '2': 'goi-ten', '3': 'chia-nhom', '4': 'xuc-xac', '5': 'boc-tham', '6': 'bang-diem', '7': 'am-thanh', '8': 'dem-nguoc', '9': 'do-on', '0': 'diem-danh' };
      // Deep-link chấp nhận cả id tab lẫn slug công cụ (?tab=bang-diem-lop).
      var SLUG_TO_TAB = { 'goi-ten-ngau-nhien': 'goi-ten', 'chia-nhom-ngau-nhien': 'chia-nhom', 'tung-xuc-xac-dong-xu': 'xuc-xac', 'boc-tham-so': 'boc-tham', 'bang-diem-lop': 'bang-diem', 'am-thanh-lop-hoc': 'am-thanh', 'dem-nguoc-lop-hoc': 'dem-nguoc', 'do-do-on-lop-hoc': 'do-on', 'diem-danh': 'diem-danh', 'boc-cau-hoi': 'boc-cau-hoi' };
      var currentTab = 'lop-hoc';
      var inited = {};
      var appEl = document.getElementById('gv-app');
      var tablist = document.getElementById('gv-app-tablist');
      var helpPanel = document.getElementById('gv-app-help-panel');

      function gvClasses() { return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null; }

      function escHtml(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }

      function updateClassIndicator() {
        var el = document.getElementById('gv-app-classname');
        var helper = gvClasses();
        var active = helper ? helper.active() : '';
        el.textContent = active || 'chưa chọn lớp';
        updateTeachClass();
      }

      // ---------- Chế độ Dạy học (phím F / nút trên thanh tab) ----------
      // Bật: ẩn header site, footer, thanh đáy, tiêu đề + mô tả trang —
      // chỉ còn thanh tab + tên lớp đang dạy + khung công cụ chiếm trọn
      // màn hình; dùng Fullscreen API để toàn màn hình thật. Nhớ trạng
      // thái vào localStorage (uh_gv_dayhoc): tải lại trang thì khôi
      // phục bố cục đã ẩn; toàn màn hình xin lại ở lần tương tác đầu
      // tiên vì trình duyệt cấm tự bật không có cử chỉ.
      var TEACH_KEY = 'uh_gv_dayhoc';
      var teachMode = false;

      function updateTeachClass() {
        var chip = document.getElementById('gv-app-teach-class');
        if (!chip) return;
        var helper = gvClasses();
        var active = helper ? helper.active() : '';
        chip.textContent = active ? 'Lớp ' + active : 'Chưa chọn lớp';
      }

      function setTeachMode(on, opts) {
        opts = opts || {};
        teachMode = !!on;
        try { localStorage.setItem(TEACH_KEY, teachMode ? '1' : '0'); } catch (e) { /* bỏ qua */ }
        document.body.classList.toggle('gv-teach', teachMode);
        var btn = document.getElementById('gv-app-teach-btn');
        if (btn) {
          btn.setAttribute('aria-pressed', teachMode ? 'true' : 'false');
          var label = document.getElementById('gv-app-teach-label');
          if (label) label.textContent = teachMode ? 'Thoát dạy học' : 'Dạy học';
        }
        updateTeachClass();
        if (teachMode && !opts.noFullscreen) {
          var el = document.documentElement;
          if (el.requestFullscreen && !document.fullscreenElement) {
            try {
              var p = el.requestFullscreen();
              if (p && p.catch) p.catch(function () { /* từ chối — vẫn giữ bố cục ẩn */ });
            } catch (e) { /* bỏ qua */ }
          }
        } else if (!teachMode && !opts.noFullscreen && document.fullscreenElement && document.exitFullscreen) {
          try { document.exitFullscreen(); } catch (e) { /* bỏ qua */ }
        }
        // Bật/tắt chế độ Dạy học làm ẩn/hiện ~140px nội dung trên khung
        // (header site + tiêu đề trang + lề) trong khi vị trí cuộn giữ
        // nguyên — khung đang mở trượt lên dưới thanh tab dính và bị cắt
        // mất dòng đầu. Cuộn lại khung đang mở về đầu sau khi đổi chế độ;
        // scroll-margin-top trong CSS (90px ở chế độ Dạy học, 150px bình
        // thường) chừa đúng chỗ cho thanh tab dính.
        var panel = document.getElementById('gv-panel-' + currentTab);
        if (panel) panel.scrollIntoView({ behavior: 'auto', block: 'start' });
      }

      // ---------- Chuyển tab (khởi tạo lười + làm mới khi mở lại) ----------
      function activateTab(id) {
        if (TABS.indexOf(id) === -1) id = 'lop-hoc';
        currentTab = id;
        var btns = tablist.querySelectorAll('[role="tab"]');
        btns.forEach(function (b) {
          var on = b.getAttribute('data-tab') === id;
          b.classList.toggle('gv-app-tab-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
        });
        TABS.forEach(function (t) {
          var p = document.getElementById('gv-panel-' + t);
          if (p) p.hidden = (t !== id);
        });
        if (id === 'lop-hoc') {
          refreshClassTab();
        } else {
          var root = document.getElementById('gv-tool-' + id);
          if (root && !inited[id]) {
            try { GV_INITS[id](root); } catch (e) { console.error('Không khởi tạo được tab ' + id, e); }
            inited[id] = true;
          } else if (root && typeof root._gvRefresh === 'function') {
            try { root._gvRefresh(); } catch (e) { console.error('Không làm mới được tab ' + id, e); }
          }
        }
        try {
          var url = new URL(window.location.href);
          url.searchParams.set('tab', id);
          history.replaceState(null, '', url.toString());
        } catch (e) { /* bỏ qua */ }
        updateClassIndicator();
        // Cuộn về đầu khung công cụ — tab Lớp học dài, đang ở cuối bảng
        // mà bấm sang Gọi tên thì màn hình đứng ở footer, không thấy
        // vòng quay. scroll-margin-top trong CSS chừa chỗ thanh tab.
        var panel = document.getElementById('gv-panel-' + id);
        if (panel) {
          var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }

      tablist.querySelectorAll('[role="tab"]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          activateTab(btn.getAttribute('data-tab'));
          // Bấm chuột thì bỏ focus khỏi nút tab để phím Space chạy hành
          // động chính (không bấm lại nút tab); bấm bằng bàn phím
          // (e.detail = 0) thì giữ focus để điều hướng tiếp bằng phím.
          if (ev.detail !== 0) btn.blur();
        });
      });

      // Điều hướng tab bằng phím mũi tên khi focus đang ở thanh tab.
      tablist.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var btns = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
        var i = btns.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        var n = e.key === 'ArrowRight' ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
        btns[n].focus();
        activateTab(btns[n].getAttribute('data-tab'));
      });

      // ---------- Hành động chính của tab (phím Space/Enter) ----------
      // 'primary' = nút xanh đầu tiên đang hiện trong tab (Xúc xắc có 2
      // ngăn Xúc xắc/Đồng xu, Đếm ngược có 2 ngăn Đếm ngược/Bấm giờ).
      var MAIN_ACTION = {
        'goi-ten': '#gt-call', 'chia-nhom': '#cn-divide', 'xuc-xac': 'primary',
        'boc-tham': '#bs-draw', 'bang-diem': 'focus:#bd-name', 'am-thanh': null,
        'dem-nguoc': 'primary', 'do-on': 'noise', 'diem-danh': null,
        'boc-cau-hoi': '#bq-draw', 'lop-hoc': null
      };

      function visiblePrimary(panel) {
        var btns = panel.querySelectorAll('.btn-primary');
        for (var i = 0; i < btns.length; i++) {
          if (!btns[i].disabled && btns[i].offsetParent !== null) return btns[i];
        }
        return null;
      }

      function runMainAction() {
        var mode = MAIN_ACTION[currentTab];
        if (!mode) return;
        var panel = document.getElementById('gv-panel-' + currentTab);
        if (!panel) return;
        if (mode === 'primary') {
          var b = visiblePrimary(panel);
          if (b) b.click();
          return;
        }
        if (mode.indexOf('focus:') === 0) {
          var el = panel.querySelector(mode.slice(6));
          if (el) el.focus();
          return;
        }
        if (mode === 'noise') {
          var stop = panel.querySelector('#on-stop');
          if (stop && stop.style.display !== 'none') { stop.click(); return; }
          var start = panel.querySelector('#on-start');
          if (start && !start.disabled) start.click();
          return;
        }
        var btn = panel.querySelector(mode);
        if (btn && !btn.disabled) btn.click();
      }

      // ---------- Bảng phím tắt ----------
      function openHelp() { helpPanel.hidden = false; document.getElementById('gv-app-help-close').focus(); }
      function closeHelp() { helpPanel.hidden = true; document.getElementById('gv-app-help-btn').focus(); }
      document.getElementById('gv-app-help-btn').addEventListener('click', openHelp);
      document.getElementById('gv-app-help-close').addEventListener('click', closeHelp);
      helpPanel.addEventListener('click', function (e) { if (e.target === helpPanel) closeHelp(); });

      function anyStageOpen() {
        var stages = document.querySelectorAll('.gv-stage');
        for (var i = 0; i < stages.length; i++) {
          if (stages[i].style.display === 'flex') return true;
        }
        return false;
      }

      // ---------- Phím tắt toàn trang ----------
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (!helpPanel.hidden) closeHelp();
          // Thoát chế độ Dạy học khi không ở toàn màn hình (đang toàn
          // màn hình thì trình duyệt giữ Esc để thoát toàn màn hình,
          // rồi sự kiện fullscreenchange sẽ tắt chế độ Dạy học).
          else if (teachMode && !document.fullscreenElement) setTeachMode(false);
          return; // đóng sân khấu Chiếu lớp do chính công cụ xử lý
        }
        if (!helpPanel.hidden || anyStageOpen()) return;
        var t = e.target;
        var tag = t && t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
        // Phím số/mũi tên/? không có tác dụng gốc trên nút nên vẫn xử
        // lý khi nút đang focus (giáo viên vừa bấm nút xong vẫn chuyển
        // tab được); chỉ Space/Enter nhường cho nút/link (kích hoạt
        // gốc của trình duyệt) để không gọi 2 hành động cùng lúc.
        if (DIGITS[e.key]) { e.preventDefault(); activateTab(DIGITS[e.key]); return; }
        // Phím F bật/tắt chế độ Dạy học — F không có tác dụng gốc trên
        // nút nên vẫn chạy khi nút đang focus (như phím số).
        if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setTeachMode(!teachMode); return; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var i = TABS.indexOf(currentTab);
          var n = e.key === 'ArrowRight' ? (i + 1) % TABS.length : (i - 1 + TABS.length) % TABS.length;
          activateTab(TABS[n]);
          return;
        }
        if (e.key === '?') { e.preventDefault(); openHelp(); return; }
        if (tag === 'BUTTON' || tag === 'A') return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); runMainAction(); }
      });

      // Khởi tạo chế độ Dạy học: nút bấm; khôi phục trạng thái lần
      // trước (bố cục ẩn đã áp ngay khi tải trang); toàn màn hình xin
      // lại ở lần chạm/phím đầu tiên; Esc khỏi toàn màn hình thì tắt
      // luôn chế độ Dạy học.
      document.getElementById('gv-app-teach-btn').addEventListener('click', function () {
        setTeachMode(!teachMode);
      });
      document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement && teachMode) setTeachMode(false, { noFullscreen: true });
      });
      (function restoreTeachMode() {
        try { teachMode = localStorage.getItem(TEACH_KEY) === '1'; } catch (e) { teachMode = false; }
        if (!teachMode) return;
        var btn = document.getElementById('gv-app-teach-btn');
        if (btn) {
          btn.setAttribute('aria-pressed', 'true');
          var label = document.getElementById('gv-app-teach-label');
          if (label) label.textContent = 'Thoát dạy học';
        }
        updateTeachClass();
        var askFs = function () {
          if (teachMode && !document.fullscreenElement && document.documentElement.requestFullscreen) {
            try {
              var p = document.documentElement.requestFullscreen();
              if (p && p.catch) p.catch(function () { /* bỏ qua */ });
            } catch (e) { /* bỏ qua */ }
          }
          document.removeEventListener('pointerdown', askFs);
          document.removeEventListener('keydown', askFs);
        };
        document.addEventListener('pointerdown', askFs);
        document.addEventListener('keydown', askFs);
      })();

      // ================= TAB LỚP HỌC =================
      var lhClassSel = document.getElementById('lh-class');
      var lhNewName = document.getElementById('lh-new-name');
      var lhMsg = document.getElementById('lh-msg');
      var lhImportMsg = document.getElementById('lh-import-msg');
      var lhBackupMsg = document.getElementById('lh-backup-msg');
      var lhTbody = document.getElementById('lh-tbody');
      var lhTableWrap = document.getElementById('lh-table-wrap');
      var lhEmpty = document.getElementById('lh-empty');
      var records = []; // bản ghi của lớp đang chọn
      var activeClass = '';

      function showMsg(el, text) {
        el.textContent = text;
        el.style.display = text ? '' : 'none';
      }

      // Điểm chỉ lưu ở bản ghi lớp (một nguồn duy nhất) — tab Bảng
      // điểm chế độ Cá nhân đọc thẳng từ đây, không còn đồng bộ qua
      // uh_bangdiemlop (khóa đó chỉ còn dùng cho chế độ Đội + trang
      // Bảng điểm rời).
      function saveRecords() {
        var helper = gvClasses();
        if (!helper || !activeClass) return false;
        return helper.saveRecords(activeClass, records);
      }

      function renderTable() {
        if (!activeClass) {
          lhTbody.innerHTML = '';
          lhTableWrap.style.display = 'none';
          lhEmpty.style.display = '';
          lhEmpty.textContent = 'Chưa có lớp nào — tạo lớp mới rồi dán danh sách ở ô dưới.';
          return;
        }
        if (!records.length) {
          lhTbody.innerHTML = '';
          lhTableWrap.style.display = 'none';
          lhEmpty.style.display = '';
          lhEmpty.textContent = 'Lớp ' + activeClass + ' chưa có bạn nào — dán danh sách ở ô dưới hoặc bấm "+ Thêm bạn".';
          return;
        }
        lhTableWrap.style.display = '';
        lhEmpty.style.display = 'none';
        lhTbody.innerHTML = records.map(function (r, i) {
          return '<tr data-i="' + i + '">'
            + '<td class="gv-app-stt">' + (i + 1) + '</td>'
            + '<td><input type="text" class="lh-name" value="' + escHtml(r.name) + '" aria-label="Tên bạn thứ ' + (i + 1) + '" autocomplete="off"></td>'
            + '<td><select class="lh-gender" aria-label="Giới tính của ' + escHtml(r.name) + '">'
            + '<option value=""' + (r.gender === '' ? ' selected' : '') + '>—</option>'
            + '<option value="nam"' + (r.gender === 'nam' ? ' selected' : '') + '>Nam</option>'
            + '<option value="nữ"' + (r.gender === 'nữ' ? ' selected' : '') + '>Nữ</option></select></td>'
            + '<td><button type="button" class="lh-star' + (r.star ? ' lh-star-on' : '') + '" aria-pressed="' + (r.star ? 'true' : 'false') + '" aria-label="Đánh dấu sao cho ' + escHtml(r.name) + '">' + (r.star ? '★' : '☆') + '</button></td>'
            + '<td><button type="button" class="lh-absent' + (r.absent ? ' lh-absent-on' : '') + '" aria-pressed="' + (r.absent ? 'true' : 'false') + '">' + (r.absent ? 'Vắng' : 'Có mặt') + '</button></td>'
            + '<td><span class="lh-points"><button type="button" class="lh-pt-btn" data-d="-1" aria-label="Trừ 1 điểm">−</button>'
            + '<input type="number" class="lh-pt" value="' + r.points + '" aria-label="Điểm của ' + escHtml(r.name) + '">'
            + '<button type="button" class="lh-pt-btn" data-d="1" aria-label="Cộng 1 điểm">+</button></span></td>'
            + '<td><button type="button" class="lh-del" aria-label="Xóa ' + escHtml(r.name) + '">✕</button></td>'
            + '</tr>';
        }).join('');
      }

      function refreshClassSelect() {
        var helper = gvClasses();
        var map = helper ? helper.list() : {};
        var names = Object.keys(map).sort();
        if (!names.length) {
          lhClassSel.innerHTML = '<option value="">— Chưa có lớp nào —</option>';
          lhClassSel.value = '';
          return;
        }
        lhClassSel.innerHTML = names.map(function (n) {
          return '<option value="' + escHtml(n) + '">' + escHtml(n) + ' (' + map[n].length + ' bạn)</option>';
        }).join('');
        if (activeClass && map[activeClass]) lhClassSel.value = activeClass;
        else if (names.length) lhClassSel.value = names[0];
      }

      function loadClass(name) {
        var helper = gvClasses();
        activeClass = name || '';
        if (helper) helper.setActive(activeClass);
        records = (helper && activeClass) ? helper.getRecords(activeClass) : [];
        renderTable();
        updateClassIndicator();
      }

      // Mở lại tab Lớp học: lớp đang chọn có thể đã bị xóa/sửa ở nơi
      // khác (trang Gọi tên rời) — đồng bộ lại rồi mới vẽ bảng.
      function refreshClassTab() {
        var helper = gvClasses();
        var map = helper ? helper.list() : {};
        var names = Object.keys(map).sort();
        if (activeClass && !map[activeClass]) activeClass = '';
        if (!activeClass) {
          var saved = helper ? helper.active() : '';
          if (saved && map[saved]) activeClass = saved;
          else if (names.length) activeClass = names[0];
        }
        refreshClassSelect();
        loadClass(activeClass);
      }

      lhClassSel.addEventListener('change', function () {
        loadClass(lhClassSel.value);
        showMsg(lhMsg, '');
      });

      document.getElementById('lh-create').addEventListener('click', function () {
        var helper = gvClasses();
        var name = lhNewName.value.trim();
        if (!name) { showMsg(lhMsg, 'Gõ tên lớp trước đã nhé (ví dụ: 6A).'); return; }
        if (!helper) { showMsg(lhMsg, 'Trình duyệt chưa nạp xong phần lưu lớp — tải lại trang rồi thử lại nhé.'); return; }
        var map = helper.list();
        if (map[name]) {
          refreshClassSelect();
          loadClass(name);
          showMsg(lhMsg, 'Lớp ' + name + ' đã có rồi — đã chọn lớp này.');
          return;
        }
        helper.saveRecords(name, []);
        lhNewName.value = '';
        refreshClassSelect();
        loadClass(name);
        showMsg(lhMsg, 'Đã tạo lớp ' + name + ' — dán danh sách ở ô dưới để thêm bạn.');
      });
      lhNewName.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('lh-create').click(); }
      });

      var delClassArmed = false;
      var delClassTimer = null;
      document.getElementById('lh-delete').addEventListener('click', function () {
        var helper = gvClasses();
        var btn = document.getElementById('lh-delete');
        if (!helper || !activeClass) { showMsg(lhMsg, 'Chưa chọn lớp nào để xóa.'); return; }
        if (!delClassArmed) {
          delClassArmed = true;
          btn.textContent = 'Bấm lại để xóa lớp ' + activeClass;
          delClassTimer = setTimeout(function () {
            delClassArmed = false;
            btn.textContent = 'Xóa lớp này';
          }, 3000);
          return;
        }
        clearTimeout(delClassTimer);
        delClassArmed = false;
        btn.textContent = 'Xóa lớp này';
        var gone = activeClass;
        helper.remove(gone);
        activeClass = '';
        refreshClassTab();
        showMsg(lhMsg, 'Đã xóa lớp ' + gone + '.');
      });

      document.getElementById('lh-add-row').addEventListener('click', function () {
        if (!activeClass) { showMsg(lhMsg, 'Tạo lớp trước đã nhé.'); return; }
        var name = 'Bạn mới';
        var i = 2;
        while (records.some(function (r) { return r.name === name; })) { name = 'Bạn mới ' + i; i++; }
        records.push({ name: name, gender: '', star: false, absent: false, points: 0 });
        saveRecords();
        renderTable();
        var input = lhTbody.querySelector('tr:last-child .lh-name');
        if (input) { input.focus(); input.select(); }
      });

      // Sửa trực tiếp trong bảng: tên / giới tính / điểm lưu khi đổi ô.
      lhTbody.addEventListener('change', function (ev) {
        var tr = ev.target.closest('tr[data-i]');
        if (!tr) return;
        var i = parseInt(tr.getAttribute('data-i'), 10);
        if (isNaN(i) || !records[i]) return;
        var rec = records[i];
        if (ev.target.classList.contains('lh-name')) {
          var v = ev.target.value.trim();
          if (!v) {
            ev.target.value = rec.name;
            showMsg(lhMsg, 'Tên không được để trống.');
            return;
          }
          // Lớp hay có 2 bạn trùng họ tên — không chặn trùng tên nữa.
          rec.name = v;
          saveRecords();
          showMsg(lhMsg, '');
          return;
        }
        if (ev.target.classList.contains('lh-gender')) {
          rec.gender = ev.target.value;
          saveRecords();
          return;
        }
        if (ev.target.classList.contains('lh-pt')) {
          var n = parseInt(ev.target.value, 10);
          if (isNaN(n)) n = 0;
          ev.target.value = n;
          rec.points = n;
          saveRecords();
          return;
        }
      });

      lhTbody.addEventListener('click', function (ev) {
        var tr = ev.target.closest('tr[data-i]');
        if (!tr) return;
        var i = parseInt(tr.getAttribute('data-i'), 10);
        if (isNaN(i) || !records[i]) return;
        var rec = records[i];
        var btn = ev.target.closest('button');
        if (!btn) return;
        if (btn.classList.contains('lh-star')) {
          rec.star = !rec.star;
          saveRecords();
          btn.classList.toggle('lh-star-on', rec.star);
          btn.setAttribute('aria-pressed', rec.star ? 'true' : 'false');
          btn.textContent = rec.star ? '★' : '☆';
          return;
        }
        if (btn.classList.contains('lh-absent')) {
          rec.absent = !rec.absent;
          saveRecords();
          btn.classList.toggle('lh-absent-on', rec.absent);
          btn.setAttribute('aria-pressed', rec.absent ? 'true' : 'false');
          btn.textContent = rec.absent ? 'Vắng' : 'Có mặt';
          return;
        }
        if (btn.classList.contains('lh-pt-btn')) {
          var d = parseInt(btn.getAttribute('data-d'), 10) || 0;
          rec.points += d;
          var input = tr.querySelector('.lh-pt');
          if (input) input.value = rec.points;
          saveRecords();
          return;
        }
        if (btn.classList.contains('lh-del')) {
          if (btn.getAttribute('data-armed') !== '1') {
            btn.setAttribute('data-armed', '1');
            btn.textContent = 'Chắc chắn?';
            btn.classList.add('lh-del-armed');
            setTimeout(function () {
              btn.setAttribute('data-armed', '');
              btn.textContent = '✕';
              btn.classList.remove('lh-del-armed');
            }, 3000);
            return;
          }
          var gone = rec.name;
          records.splice(i, 1);
          saveRecords();
          renderTable();
          showMsg(lhMsg, 'Đã xóa ' + gone + ' khỏi lớp ' + activeClass + '.');
          return;
        }
      });

      // ---------- Nhập danh sách: dán Excel / file .csv / file mẫu ----------
      // Thêm danh sách vào lớp — KHÔNG gộp trùng tên (lớp hay có 2
      // bạn trùng họ tên, giữ cả hai); bước xem trước là chỗ giáo viên
      // kiểm tra trước khi thêm.
      function mergeStudents(list) {
        var added = 0;
        list.forEach(function (item) {
          records.push({ name: item.name, gender: item.gender || '', star: false, absent: false, points: 0 });
          added++;
        });
        if (added) saveRecords();
        return { added: added };
      }

      // Xem trước khi nhập: đọc xong hiện "Sẽ thêm N bạn: <tên...>"
      // để giáo viên kiểm tra (đặc biệt khi dán từ Excel 3 cột) rồi
      // bấm xác nhận mới thêm vào lớp.
      var pendingImport = null; // { list: [...], source: 'dán'|'file' }

      function showImportPreview(list, source) {
        pendingImport = { list: list, source: source };
        var names = list.map(function (r) { return r.name; });
        var shown = names.slice(0, 12).join(', ');
        var more = names.length > 12 ? '…' : '';
        var withGender = list.filter(function (r) { return r.gender; }).length;
        var gNote = withGender ? ' (' + withGender + ' bạn đã nhận được giới tính)' : '';
        document.getElementById('lh-preview-text').textContent =
          'Sẽ thêm ' + list.length + ' bạn vào lớp ' + activeClass + ': ' + shown + more + gNote;
        document.getElementById('lh-preview').style.display = '';
        showMsg(lhImportMsg, '');
      }

      function hideImportPreview() {
        pendingImport = null;
        document.getElementById('lh-preview').style.display = 'none';
      }

      document.getElementById('lh-preview-confirm').addEventListener('click', function () {
        if (!pendingImport) return;
        var res = mergeStudents(pendingImport.list);
        var source = pendingImport.source;
        hideImportPreview();
        document.getElementById('lh-paste').value = '';
        renderTable();
        refreshClassSelect();
        showMsg(lhImportMsg, 'Đã thêm ' + res.added + ' bạn vào lớp ' + activeClass + ' (' + source + ').');
      });

      document.getElementById('lh-preview-cancel').addEventListener('click', function () {
        hideImportPreview();
        showMsg(lhImportMsg, 'Đã hủy — chưa thêm bạn nào.');
      });

      document.getElementById('lh-paste-add').addEventListener('click', function () {
        var helper = gvClasses();
        if (!activeClass) { showMsg(lhImportMsg, 'Tạo lớp trước đã nhé.'); return; }
        var list = helper ? helper.parseRecords(document.getElementById('lh-paste').value) : [];
        if (!list.length) { showMsg(lhImportMsg, 'Không đọc được tên nào — mỗi bạn một dòng nhé.'); return; }
        showImportPreview(list, 'dán từ Excel');
      });

      // Đọc CSV: bộ tách ký tự xử lý ô trong dấu ngoặc kép, dấu
      // phẩy/chấm phẩy, BOM; nhận diện cột (STT/Giới tính/Tên) dùng
      // chung với bộ tách dán Excel trong app.js (helper.parseRows).
      function parseCsv(text) {
        var t = String(text || '').replace(/^\\uFEFF/, '');
        var delim = (t.indexOf(';') !== -1 && t.indexOf(',') === -1) ? ';' : ',';
        var rows = [];
        var row = [];
        var cur = '';
        var inQ = false;
        for (var i = 0; i < t.length; i++) {
          var c = t[i];
          if (inQ) {
            if (c === '"') {
              if (t[i + 1] === '"') { cur += '"'; i++; }
              else inQ = false;
            } else cur += c;
          } else if (c === '"') inQ = true;
          else if (c === delim) { row.push(cur); cur = ''; }
          else if (c === '\\n' || c === '\\r') {
            if (c === '\\r' && t[i + 1] === '\\n') i++;
            row.push(cur); cur = '';
            rows.push(row); row = [];
          } else cur += c;
        }
        if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
        var helper = gvClasses();
        if (!helper || typeof helper.parseRows !== 'function') return [];
        return helper.parseRows(rows);
      }

      // Thư viện đọc Excel (SheetJS, vendored trong src/vendor — không
      // CDN, không link ngoài) chỉ tải khi người dùng chọn file .xlsx,
      // để trang nhẹ.
      var xlsxPromise = null;
      function loadXlsx() {
        if (window.XLSX) return Promise.resolve(window.XLSX);
        if (xlsxPromise) return xlsxPromise;
        xlsxPromise = new Promise(function (resolve, reject) {
          var s = document.createElement('script');
          s.src = '/assets/vendor/xlsx.full.min.js';
          s.onload = function () { resolve(window.XLSX); };
          s.onerror = function () { xlsxPromise = null; reject(new Error('Không tải được thư viện đọc Excel.')); };
          document.head.appendChild(s);
        });
        return xlsxPromise;
      }

      document.getElementById('lh-file').addEventListener('change', function (ev) {
        var file = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!file) return;
        if (!activeClass) { showMsg(lhImportMsg, 'Tạo lớp trước đã nhé.'); return; }
        if (file.name.toLowerCase().endsWith('.xlsx')) {
          loadXlsx().then(function (XLSX) {
            var reader = new FileReader();
            reader.onload = function () {
              var list = [];
              try {
                var wb = XLSX.read(reader.result, { type: 'array' });
                var ws = wb.Sheets[wb.SheetNames[0]];
                var rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
                var helper = gvClasses();
                list = (helper && typeof helper.parseRows === 'function') ? helper.parseRows(rows) : [];
              } catch (e) { list = []; }
              if (!list.length) {
                showMsg(lhImportMsg, 'File không có tên nào đọc được — file .xlsx cần có cột Tên (xem file mẫu).');
                return;
              }
              showImportPreview(list, 'file ' + file.name);
            };
            reader.readAsArrayBuffer(file);
          }).catch(function () {
            showMsg(lhImportMsg, 'Không tải được thư viện đọc Excel — kiểm tra mạng rồi thử lại, hoặc dán danh sách vào ô trên.');
          });
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          var list = parseCsv(reader.result);
          if (!list.length) {
            showMsg(lhImportMsg, 'File không có tên nào đọc được — file .csv cần có cột Tên (xem file mẫu).');
            return;
          }
          showImportPreview(list, 'file ' + file.name);
        };
        reader.readAsText(file);
      });

      document.getElementById('lh-sample').addEventListener('click', function () {
        var csv = '\\uFEFFTên,Giới tính\\nNguyễn Văn A,Nam\\nTrần Thị B,Nữ\\nLê Văn C,Nam\\n';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'mau-danh-sach-lop.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });

      // ---------- Sao lưu / khôi phục ----------
      var BACKUP_KEYS = ['uh_gv_lop', 'uh_bangdiemlop', 'uh_gv_diemdanh', 'uh_gv_cauhoi', 'uh_gv_cauhoi_asked', 'uh_gv_sound', 'uh_gv_vol', 'uh_gv_lop_active', 'uh_gv_dayhoc'];
      var restorePayload = null;
      var restoreTimer = null;

      function downloadFile(filename, text, type) {
        var blob = new Blob([text], { type: type });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }

      document.getElementById('lh-backup').addEventListener('click', function () {
        var data = {};
        BACKUP_KEYS.forEach(function (k) {
          try { data[k] = localStorage.getItem(k); }
          catch (e) { data[k] = null; }
        });
        var d = new Date();
        var stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        downloadFile(
          'sao-luu-giao-vien-' + stamp + '.json',
          JSON.stringify({ app: 'tienichhub-giao-vien', version: 1, exportedAt: d.toISOString(), data: data }, null, 2),
          'application/json;charset=utf-8'
        );
        showMsg(lhBackupMsg, 'Đã tải file sao lưu — giữ file này để khôi phục khi đổi máy.');
      });

      document.getElementById('lh-restore').addEventListener('change', function (ev) {
        var file = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var payload = null;
          try { payload = JSON.parse(reader.result); } catch (e) { payload = null; }
          if (!payload || payload.app !== 'tienichhub-giao-vien' || !payload.data || typeof payload.data !== 'object') {
            showMsg(lhBackupMsg, 'File này không phải file sao lưu của Bàn giáo viên.');
            return;
          }
          var classes = 0;
          try {
            var raw = payload.data['uh_gv_lop'];
            if (raw) { var m = JSON.parse(raw); classes = m ? Object.keys(m).length : 0; }
          } catch (e) { classes = 0; }
          restorePayload = payload;
          document.getElementById('lh-restore-confirm').style.display = '';
          showMsg(lhBackupMsg, 'File có ' + classes + ' lớp. Khôi phục sẽ GHI ĐÈ toàn bộ dữ liệu giáo viên hiện tại — bấm "Xác nhận khôi phục" nếu chắc chắn.');
          clearTimeout(restoreTimer);
          restoreTimer = setTimeout(function () {
            restorePayload = null;
            document.getElementById('lh-restore-confirm').style.display = 'none';
          }, 30000);
        };
        reader.readAsText(file);
      });

      document.getElementById('lh-restore-confirm').addEventListener('click', function () {
        if (!restorePayload) return;
        clearTimeout(restoreTimer);
        BACKUP_KEYS.forEach(function (k) {
          var v = restorePayload.data[k];
          try {
            if (v === null || v === undefined) localStorage.removeItem(k);
            else localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
          } catch (e) { /* bỏ qua */ }
        });
        restorePayload = null;
        document.getElementById('lh-restore-confirm').style.display = 'none';
        showMsg(lhBackupMsg, 'Đã khôi phục — đang tải lại trang…');
        setTimeout(function () { location.reload(); }, 600);
      });

      // ---------- Mở trang: deep-link ?tab= ----------
      (function initTab() {
        var tab = 'lop-hoc';
        try {
          var params = new URLSearchParams(window.location.search);
          var q = params.get('tab') || '';
          if (TABS.indexOf(q) !== -1) tab = q;
          else if (SLUG_TO_TAB[q]) tab = SLUG_TO_TAB[q];
        } catch (e) { /* bỏ qua */ }
        activateTab(tab);
      })();
    });
  })();
  </script>`;
}
