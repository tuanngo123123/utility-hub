// Trang Bàn giáo viên (/giao-vien/lop-hoc/): MỘT trang ứng dụng gom
// 10 công cụ Giáo viên + quản lý lớp học — giáo viên mở lên là dùng
// cả tiết trên máy chiếu, không cần chuyển trang. KHÔNG phải công cụ
// mới (không tính vào số công cụ): trang này nhúng lại body()/init()
// của 10 công cụ giao-vien đã có, khởi tạo lười khi mở tab lần đầu.
// Tab Lớp học quản lý danh sách lớp dạng bản ghi
// {name, gender, star, absent, points} (xem UhGvClasses trong app.js).
// Công cụ trong app chạy ở "chế độ app" (root có data-gv-app="1"):
// chúng ẩn khung quản lý lớp riêng và lấy tên từ lớp đang chọn.
//
// BỐ CỤC MẪU 1 (Claude gửi 01:48 19/11, quyết bổ sung 02:06):
// thanh trên 64px (logo + lớp đang dạy + số có mặt + âm thanh +
// công tắc Chuẩn bị/Dạy), 3 cột (tab dọc trái 196px / sân khấu
// giữa / ngăn Danh sách lớp phải 300px), 9 tab đánh số 1–9
// (Xúc xắc + Bốc thăm gộp 1 tab; Âm thanh là nút nhỏ trên thanh
// trên; Trò chơi ôn tập + Màn chào lớp ẨN HẲN tới khi làm xong
// GĐ3/GĐ4). Chỉ học Ý TƯỞNG tổ chức (một app + tab + danh sách
// lớp chung) từ edutoolkit — không chép code, chữ hay hình của họ.
import { esc } from '../tool-card.js';
import { iconSvg } from '../icons.js';

// Icon mỗi tab (MẪU 5): SVG nét trong ô 32px nền pastel màu riêng —
// lấy từ bộ dùng chung src/icons.js (chung với 8 thẻ trang chủ).
// bg = nền ô icon, fg = màu nét vẽ.
const TAB_ICONS = {
  'lop-hoc': { icon: 'users', bg: '#DBEAFE', fg: '#1747E6' },
  'goi-ten': { icon: 'megaphone', bg: '#FEF3C7', fg: '#D97706' },
  'chia-nhom': { icon: 'grid', bg: '#E0F2FE', fg: '#0284C7' },
  'bang-diem': { icon: 'trophy', bg: '#FCE7F3', fg: '#DB2777' },
  'dem-nguoc': { icon: 'clock', bg: '#DCFCE7', fg: '#16A34A' },
  'boc-cau-hoi': { icon: 'help-circle', bg: '#EDE9FE', fg: '#7C3AED' },
  'diem-danh': { icon: 'check-square', bg: '#FFEDD5', fg: '#EA580C' },
  'xuc-xac-boc-so': { icon: 'shuffle', bg: '#CCFBF1', fg: '#0D9488' },
  'do-on': { icon: 'mic', bg: '#FEE2E2', fg: '#DC2626' },
};

// Thứ tự tab theo MẪU 1 (đánh số phím tắt liền nhau 1–9).
// tools: slug công cụ nhúng trong tab (tab gộp có 2 công cụ).
// hint: 1 dòng gợi ý dưới tiêu đề sân khấu.
const TABS = [
  { id: 'lop-hoc', label: 'Lớp học', tools: [], key: '1', hint: 'Chọn lớp đang dạy — mọi công cụ trong Bàn giáo viên đều dùng lớp này. Sửa trực tiếp trong bảng, thay đổi lưu ngay trên trình duyệt.' },
  { id: 'goi-ten', label: 'Gọi tên', tools: ['goi-ten-ngau-nhien'], key: '2', hint: 'Gọi tên bằng vòng quay, hộp quà, lật thẻ hay tên to — không gọi lại người đã gọi tới khi hết danh sách. Bấm phím Space để gọi nhanh.' },
  { id: 'chia-nhom', label: 'Chia nhóm', tools: ['chia-nhom-ngau-nhien'], key: '3', hint: 'Chia nhóm thông minh theo sao, giới tính và điểm thi đua — các nhóm lệch nhau tối đa 1 bạn, kéo thả để đổi bạn giữa các nhóm.' },
  { id: 'bang-diem', label: 'Bảng điểm', tools: ['bang-diem-lop'], key: '4', hint: 'Chế độ Cá nhân chấm điểm từng bạn (chung cột Điểm ở tab Lớp học); chế độ Đội chấm điểm theo đội riêng.' },
  { id: 'dem-nguoc', label: 'Đếm ngược', tools: ['dem-nguoc-lop-hoc'], key: '5', hint: 'Chọn thời gian rồi bấm bắt đầu — hết giờ sẽ có chuông, 5 giây cuối có tiếng bíp.' },
  { id: 'boc-cau-hoi', label: 'Bốc câu hỏi', tools: ['boc-cau-hoi'], key: '6', hint: 'Bốc câu hỏi ngẫu nhiên không lặp — bấm Hiện đáp án khi cần.' },
  { id: 'diem-danh', label: 'Điểm danh', tools: ['diem-danh'], key: '7', hint: 'Bấm vào tên để đánh dấu: 1 lần là Vắng, 2 lần là Muộn, 3 lần trở lại Có mặt. Điểm danh tự lưu theo ngày.' },
  { id: 'xuc-xac-boc-so', label: 'Xúc xắc & bốc số', short: 'Xúc xắc', tools: ['tung-xuc-xac-dong-xu', 'boc-tham-so'], key: '8', hint: 'Tung xúc xắc, đồng xu hoặc bốc số ngẫu nhiên cho lớp.' },
  { id: 'do-on', label: 'Đo độ ồn', tools: ['do-do-on-lop-hoc'], key: '9', hint: 'Bóng nảy càng mạnh khi lớp càng ồn — chỉ đo độ to, không ghi âm.' },
];

export function body(ctx) {
  const tools = (ctx.tools || []).filter((t) => t.categorySlug === 'giao-vien');
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  for (const t of TABS) {
    for (const slug of t.tools) {
      if (!bySlug.has(slug)) {
        throw new Error(`Bàn giáo viên: thiếu công cụ "${slug}" (hạng mục giao-vien).`);
      }
    }
  }
  if (!bySlug.has('am-thanh-lop-hoc')) {
    throw new Error('Bàn giáo viên: thiếu công cụ "am-thanh-lop-hoc" (nút âm thanh trên thanh trên).');
  }
  // init() tự chứa hoàn toàn nên nhúng được bằng toString() như trang
  // công cụ (build.mjs toolPageHtml) — escape </script> như ở đó.
  // GV_INITS khóa theo SLUG công cụ (tab gộp có 2 công cụ).
  const escScript = (s) => String(s).replace(/<\/script/gi, '<\\/script');
  const inits = tools
    .map((t) => `  '${t.slug}': (${escScript(t.initSource)})`)
    .join(',\n');

  const tabBtn = (t, i) => {
    const ti = TAB_ICONS[t.id] || TAB_ICONS['lop-hoc'];
    const icon = `<span class="gv-app-tab-ico" style="background:${ti.bg};color:${ti.fg}">${iconSvg(ti.icon, 18, 2.2)}</span>`;
    return `<button type="button" class="gv-app-tab${i === 0 ? ' gv-app-tab-active' : ''}" role="tab" id="gv-tab-${t.id}" data-tab="${t.id}" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="gv-panel-${t.id}" tabindex="${i === 0 ? '0' : '-1'}" title="${esc(t.label)}">${icon}<span class="gv-app-tab-label">${esc(t.short || t.label)}</span><kbd>${t.key}</kbd></button>`;
  };

  // Khung sân khấu của 1 tab: tiêu đề 28px + 1 dòng gợi ý + thẻ trắng
  // lớn chứa nội dung công cụ. tool-head riêng của từng công cụ bị
  // xóa hẳn khỏi DOM khi khởi tạo (tiêu đề + gợi ý đã ở đây) — CSS
  // chỉ ẩn nó trong khoảng trước khi khởi tạo.
  const stageHead = (t) => `<div class="gv-stage-head"><h2>${esc(t.label)}</h2><p>${esc(t.hint)}</p></div>`;

  const toolPanels = TABS.filter((t) => t.tools.length).map((t) => {
    let inner;
    if (t.id === 'xuc-xac-boc-so') {
      // Tab gộp: công tắc nhỏ chọn Xúc xắc/Bốc số; mỗi công cụ một
      // khung, chỉ khung đang chọn hiện (khởi tạo lười khi mở lần đầu).
      inner = `<div class="gv-merge-toggle" role="group" aria-label="Chọn công cụ">
      <button type="button" class="gv-merge-btn gv-merge-active" data-view="xuc-xac">Xúc xắc</button>
      <button type="button" class="gv-merge-btn" data-view="boc-so">Bốc số</button>
    </div>
    <div id="gv-tool-xuc-xac" data-gv-app="1" data-tool="tung-xuc-xac-dong-xu">${bySlug.get('tung-xuc-xac-dong-xu').bodyHtml}</div>
    <div id="gv-tool-boc-tham" data-gv-app="1" data-tool="boc-tham-so" hidden>${bySlug.get('boc-tham-so').bodyHtml}</div>`;
    } else {
      const tool = bySlug.get(t.tools[0]);
      inner = `<div id="gv-tool-${t.id}" data-gv-app="1" data-tool="${tool.slug}">${tool.bodyHtml}</div>`;
    }
    return `<section class="gv-app-panel" id="gv-panel-${t.id}" role="tabpanel" aria-labelledby="gv-tab-${t.id}" hidden>
      ${stageHead(t)}
      <div class="gv-stage-card">
${inner}
      </div>
    </section>`;
  }).join('\n');

  const soundTool = bySlug.get('am-thanh-lop-hoc');

  return `
  <div class="gv-app" id="gv-app">
    <header class="gv-topbar">
      <a class="gv-brand" href="/giao-vien/" aria-label="Về mục Giáo viên"><span class="gv-brand-mark"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18"/><path d="M12 5v14"/><path d="M8 19h8"/></svg></span><span>Bàn giáo viên</span></a>
      <div class="gv-topbar-class">
        <select id="gv-top-class" aria-label="Lớp đang dạy"><option value="">— Chưa có lớp nào —</option></select>
      </div>
      <span class="gv-top-chip" id="gv-attend-count">Chưa có lớp</span>
      <span class="gv-top-chip gv-top-chip-stats" id="gv-class-stats" hidden></span>
      <span class="gv-teach-class" id="gv-app-teach-class"></span>
      <span class="gv-clock" id="gv-clock" aria-label="Giờ hiện tại">--:--</span>
      <div class="gv-topbar-actions">
        <button type="button" class="gv-install-btn" id="gv-install-btn" hidden aria-label="Cài Bàn giáo viên lên màn hình chính"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="gv-install-label">Cài lên màn hình</span></button>
        <button type="button" class="gv-sound-btn" id="gv-sound-btn" aria-label="Âm thanh lớp học" aria-expanded="false" aria-controls="gv-sound-pop"><svg class="gv-snd-on" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg><svg class="gv-snd-off" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></button>
        <button type="button" class="gv-help-btn" id="gv-app-help-btn" aria-haspopup="dialog"><span class="gv-help-label">Phím tắt</span> <kbd>?</kbd></button>
        <button type="button" class="gv-mode-btn" id="gv-mode-teach" aria-pressed="false">Dạy <kbd>F</kbd></button>
      </div>
      <div class="gv-sound-pop" id="gv-sound-pop" hidden>
        <div id="gv-tool-am-thanh" data-gv-app="1" data-tool="am-thanh-lop-hoc">${soundTool.bodyHtml}</div>
      </div>
    </header>

    <div class="gv-layout">
      <nav class="gv-tabs" role="tablist" aria-label="Công cụ giáo viên" id="gv-app-tablist">
${TABS.map(tabBtn).join('\n')}
      </nav>

      <div class="gv-stage-col" id="gv-stage-col">
        <section class="gv-app-panel" id="gv-panel-lop-hoc" role="tabpanel" aria-labelledby="gv-tab-lop-hoc">
          ${stageHead(TABS[0])}
          <div class="gv-stage-card">
            <div class="tool-panel gv-app-class">
              <div class="gv-app-classbar gv-prep-only">
                <div class="field"><label for="lh-class">Lớp đang dạy</label><select id="lh-class"><option value="">— Chưa có lớp nào —</option></select></div>
                <div class="field"><label for="lh-new-name">Tạo lớp mới</label><div style="display:flex;gap:8px"><input id="lh-new-name" type="text" placeholder="Ví dụ: 6A" autocomplete="off" style="flex:1;min-width:0"><button type="button" class="btn btn-primary" id="lh-create">Tạo lớp</button></div></div>
                <button type="button" class="btn btn-ghost" id="lh-delete">Xóa lớp này</button>
              </div>
              <p class="note gv-prep-only" id="lh-msg" style="display:none"></p>
              <div class="gv-app-tablewrap" id="lh-table-wrap" style="display:none">
                <table class="gv-app-table">
                  <thead><tr><th scope="col">#</th><th scope="col">Tên học sinh</th><th scope="col">Giới tính</th><th scope="col">⭐</th><th scope="col">Vắng</th><th scope="col">Điểm</th><th scope="col"><span class="sr-only">Xóa</span></th></tr></thead>
                  <tbody id="lh-tbody"></tbody>
                </table>
              </div>
              <p class="muted" id="lh-empty">Chưa có lớp nào — tạo lớp mới rồi dán danh sách ở ô dưới.</p>
              <div class="btn-row gv-prep-only" id="lh-sample-row" style="display:none"><button type="button" class="btn btn-primary" id="lh-sample-class">Dùng thử với lớp mẫu</button><span class="muted">Lớp 30 bạn tên giả để thử mọi tab ngay — xóa được bất cứ lúc nào.</span></div>
              <div class="btn-row gv-prep-only"><button type="button" class="btn" id="lh-add-row">+ Thêm bạn</button></div>
              <div class="gv-class-box gv-prep-only" id="lh-import-box">
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
              <div class="gv-class-box gv-prep-only">
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
          </div>
        </section>

${toolPanels}
      </div>

      <aside class="gv-drawer" id="gv-drawer" aria-label="Danh sách lớp">
        <div class="gv-drawer-head">
          <h2 id="gv-drawer-title">Danh sách lớp</h2>
          <button type="button" class="gv-drawer-edit" id="gv-drawer-edit">Sửa lớp</button>
          <button type="button" class="gv-drawer-close" id="gv-drawer-close" aria-label="Đóng danh sách lớp">✕</button>
        </div>
        <button type="button" class="btn btn-primary gv-drawer-paste" id="gv-drawer-paste">+ Dán từ Excel</button>
        <div class="gv-drawer-list" id="gv-drawer-list"></div>
        <p class="muted gv-drawer-empty" id="gv-drawer-empty">Chưa có lớp nào — tạo lớp ở tab Lớp học rồi dán danh sách vào.</p>
        <button type="button" class="btn btn-primary gv-drawer-sample" id="gv-drawer-sample" style="display:none">Dùng thử với lớp mẫu</button>
      </aside>
    </div>

    <button type="button" class="gv-drawer-open" id="gv-drawer-open" aria-controls="gv-drawer" aria-expanded="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span id="gv-drawer-open-label">Danh sách lớp</span></button>
    <div class="gv-drawer-backdrop" id="gv-drawer-backdrop" hidden></div>
  </div>

  <div class="gv-app-help" id="gv-app-help-panel" hidden>
    <div class="gv-app-help-box" role="dialog" aria-modal="true" aria-labelledby="gv-app-help-title">
      <h2 id="gv-app-help-title">Phím tắt</h2>
      <table class="gv-app-keys">
        <tr><td><kbd>1</kbd>–<kbd>9</kbd></td><td>Chuyển tab: 1 Lớp học, 2 Gọi tên, 3 Chia nhóm, 4 Bảng điểm, 5 Đếm ngược, 6 Bốc câu hỏi, 7 Điểm danh, 8 Xúc xắc &amp; bốc số, 9 Đo độ ồn</td></tr>
        <tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Tab trước / tab sau</td></tr>
        <tr><td><kbd>Space</kbd> / <kbd>Enter</kbd></td><td>Hành động chính của tab đang mở (gọi tên, chia nhóm, tung, bốc…)</td></tr>
        <tr><td><kbd>F</kbd></td><td>Bật/tắt chế độ Dạy (ẩn cột tab và ngăn lớp, sân khấu chiếm trọn màn hình)</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Thoát chế độ Dạy / đóng bảng này / đóng khung âm thanh / đóng danh sách lớp</td></tr>
        <tr><td><kbd>?</kbd></td><td>Mở bảng phím tắt này</td></tr>
      </table>
      <p class="muted">Phím tắt không chạy khi đang gõ trong ô nhập — bấm ra ngoài rồi dùng phím.</p>
      <div class="btn-row"><button type="button" class="btn btn-primary" id="gv-app-help-close">Đóng</button></div>
    </div>
  </div>

  <div class="gv-app-help" id="gv-app-guide" hidden>
    <div class="gv-app-help-box" role="dialog" aria-modal="true" aria-labelledby="gv-app-guide-title">
      <h2 id="gv-app-guide-title">Bắt đầu trong 3 bước</h2>
      <ol class="gv-guide-steps">
        <li><strong>Dán danh sách lớp</strong> ở tab Lớp học.</li>
        <li><strong>Chọn công cụ bên trái</strong> — gọi tên, chia nhóm, bảng điểm…</li>
        <li><strong>Bấm Dạy (F)</strong> khi chiếu lên lớp.</li>
      </ol>
      <p class="muted">Chưa có danh sách? Bấm “Dùng thử với lớp mẫu” để thử mọi tab ngay, không cần dán gì cả.</p>
      <div class="btn-row"><button type="button" class="btn btn-primary" id="gv-app-guide-close">Đã hiểu</button></div>
    </div>
  </div>

  <script>
  // Script của Bàn giáo viên: tự chứa hoàn toàn (không import) — chạy
  // khi DOM sẵn sàng để app.js kịp định nghĩa window.UhGvClasses.
  // Chế độ Dạy: áp bố cục ẩn NGAY khi tải (trước DOMContentLoaded)
  // để không chớp cột tab/ngăn lớp nếu lần trước đang bật.
  try {
    if (localStorage.getItem('uh_gv_dayhoc') === '1') document.body.classList.add('gv-teach');
  } catch (e) { /* bỏ qua */ }
  // PWA (19/11): cài Bàn giáo viên như ứng dụng + dùng được khi mất
  // mạng. Chạy NGAY khi script được đọc (không chờ DOMContentLoaded)
  // để không bỏ lỡ sự kiện beforeinstallprompt của trình duyệt.
  // - Service worker chỉ đăng ký trên trang này, phạm vi mặc định là
  //   thư mục chứa file (/giao-vien/lop-hoc/) — không đụng trang khác.
  // - Nút "Cài lên màn hình" ẩn mặc định, chỉ hiện khi trình duyệt cho
  //   cài (beforeinstallprompt); đã cài rồi (standalone) thì không hiện.
  //   Không popup tự động, không banner.
  (function initPwa() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function (e) {
        console.warn('Không đăng ký được service worker', e);
      });
    }
    var btn = document.getElementById('gv-install-btn');
    if (!btn) return;
    var installed = false;
    try {
      installed = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
    } catch (e) { /* bỏ qua */ }
    if (installed) return;
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferred = e;
      btn.hidden = false;
    });
    window.addEventListener('appinstalled', function () {
      deferred = null;
      btn.hidden = true;
    });
    btn.addEventListener('click', function () {
      if (!deferred) return;
      var p = deferred.prompt();
      deferred = null;
      btn.hidden = true;
      if (p && p.catch) p.catch(function () { /* người dùng đóng hộp cài */ });
    });
  })();
  var GV_INITS = {
${inits}
  };
  (function () {
    function ready(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else fn();
    }
    ready(function () {
      var TABS = ['lop-hoc', 'goi-ten', 'chia-nhom', 'bang-diem', 'dem-nguoc', 'boc-cau-hoi', 'diem-danh', 'xuc-xac-boc-so', 'do-on'];
      var DIGITS = { '1': 'lop-hoc', '2': 'goi-ten', '3': 'chia-nhom', '4': 'bang-diem', '5': 'dem-nguoc', '6': 'boc-cau-hoi', '7': 'diem-danh', '8': 'xuc-xac-boc-so', '9': 'do-on' };
      // Deep-link chấp nhận cả id tab lẫn slug công cụ (?tab=bang-diem-lop).
      // Id tab cũ (trước MẪU 1) vẫn mở được: 'xuc-xac'/'boc-tham' → tab
      // gộp (boc-tham mở đúng ngăn Bốc số), 'am-thanh' → trang chính.
      var SLUG_TO_TAB = { 'goi-ten-ngau-nhien': 'goi-ten', 'chia-nhom-ngau-nhien': 'chia-nhom', 'tung-xuc-xac-dong-xu': 'xuc-xac-boc-so', 'boc-tham-so': 'xuc-xac-boc-so', 'bang-diem-lop': 'bang-diem', 'am-thanh-lop-hoc': 'lop-hoc', 'dem-nguoc-lop-hoc': 'dem-nguoc', 'do-do-on-lop-hoc': 'do-on', 'diem-danh': 'diem-danh', 'boc-cau-hoi': 'boc-cau-hoi', 'xuc-xac': 'xuc-xac-boc-so', 'boc-tham': 'xuc-xac-boc-so', 'am-thanh': 'lop-hoc' };
      var currentTab = 'lop-hoc';
      var mergeView = 'xuc-xac'; // ngăn đang chọn trong tab gộp
      var inited = {};
      var appEl = document.getElementById('gv-app');
      var tablist = document.getElementById('gv-app-tablist');
      var helpPanel = document.getElementById('gv-app-help-panel');

      function gvClasses() { return (typeof window !== 'undefined' && window.UhGvClasses) ? window.UhGvClasses : null; }
      // Tên lớp hiển thị ('Lớp 10A1', không 'Lớp Lớp mẫu') — qua helper
      // dùng chung, dự phòng khi app.js cũ chưa có classLabel.
      function classLabel(n) {
        var h = gvClasses();
        return (h && h.classLabel) ? h.classLabel(n) : 'Lớp ' + String(n || '').replace(/^Lớp\s+/, '');
      }

      function escHtml(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }

      // ---------- Ngăn Danh sách lớp + số Có mặt (đọc từ nguồn duy
      // nhất là bản ghi lớp trong UhGvClasses) ----------
      var drawerList = document.getElementById('gv-drawer-list');
      var drawerEmpty = document.getElementById('gv-drawer-empty');
      var calledId = ''; // id bạn đang được gọi (tô nền #FEF3C7)

      // Màu vòng tròn chữ cái đầu tên gọi (xoay 8 màu); bạn vắng → xám.
      var GV_AVATAR_COLORS = [
        ['#DBEAFE', '#1747E6'], ['#FCE7F3', '#DB2777'],
        ['#DCFCE7', '#16A34A'], ['#FEF3C7', '#D97706'],
        ['#E0F2FE', '#0284C7'], ['#EDE9FE', '#7C3AED'],
        ['#FFEDD5', '#EA580C'], ['#CCFBF1', '#0D9488']
      ];
      var GV_STAR_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>';
      var GV_STAR_OUTLINE_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>';
      function gvGivenName(full) {
        var parts = String(full || '').trim().split(/\s+/);
        return parts.length ? parts[parts.length - 1] : '';
      }
      function gvLevelShort(points) {
        var h = gvClasses();
        if (h && h.level) return h.level(points || 0).short;
        var p = points || 0;
        return p >= 5 ? 'Lv.3' : (p >= 2 ? 'Lv.2' : 'Lv.1');
      }

      function refreshSideUI() {
        var helper = gvClasses();
        var active = helper ? helper.active() : '';
        var recs = (helper && active) ? helper.getRecords(active) : [];
        // Nút "Dùng thử với lớp mẫu" ở ngăn lớp chỉ hiện khi chưa có
        // lớp nào (lớp đang dạy trống bạn thì chưa phải lúc hiện nó).
        var drawerSample = document.getElementById('gv-drawer-sample');
        if (drawerSample) {
          var hasClasses = helper && Object.keys(helper.list()).length > 0;
          drawerSample.style.display = hasClasses ? 'none' : '';
        }
        // Chip Có mặt + chip thống kê trên thanh trên.
        var present = recs.filter(function (r) { return !r.absent; }).length;
        var countEl = document.getElementById('gv-attend-count');
        countEl.textContent = active ? (present + '/' + recs.length + ' có mặt') : 'Chưa có lớp';
        var statsEl = document.getElementById('gv-class-stats');
        if (statsEl) {
          if (active && recs.length) {
            var boys = recs.filter(function (r) { return r.gender === 'nam'; }).length;
            var girls = recs.filter(function (r) { return r.gender === 'nữ'; }).length;
            var stars = recs.filter(function (r) { return r.star; }).length;
            statsEl.textContent = boys + ' nam · ' + girls + ' nữ · ' + stars + ' bạn có sao';
            statsEl.hidden = false;
          } else {
            statsEl.hidden = true;
          }
        }
        var chip = document.getElementById('gv-app-teach-class');
        if (chip) chip.textContent = active ? classLabel(active) : 'Chưa chọn lớp';
        // Đầu ngăn lớp + nút mở ngăn (màn hẹp).
        var drawerTitle = document.getElementById('gv-drawer-title');
        if (drawerTitle) drawerTitle.textContent = active ? (classLabel(active) + ' · ' + recs.length + ' bạn') : 'Danh sách lớp';
        var openLabel = document.getElementById('gv-drawer-open-label');
        if (openLabel) openLabel.textContent = 'Danh sách lớp (' + recs.length + ')';
        if (!recs.length) {
          drawerList.innerHTML = '';
          drawerList.style.display = 'none';
          drawerEmpty.style.display = '';
          drawerEmpty.textContent = active
            ? classLabel(active) + ' chưa có bạn nào — bấm "+ Dán từ Excel" để thêm.'
            : 'Chưa có lớp nào — tạo lớp ở tab Lớp học rồi dán danh sách vào.';
          return;
        }
        drawerEmpty.style.display = 'none';
        drawerList.style.display = '';
        // Tên hiển thị đánh số trùng tên ("Bùi Ngọc Lan (1)/(2)"); hàng
        // mang data-id để sửa sao/vắng đúng bạn, không theo tên/vị trí.
        var labels = (helper && helper.displayNames) ? helper.displayNames(recs) : recs.map(function (r) { return r.name; });
        drawerList.innerHTML = recs.map(function (r, i) {
          var label = labels[i] || r.name;
          var given = gvGivenName(label);
          var initial = given ? given.charAt(0).toUpperCase() : '?';
          var colors = r.absent ? ['#E2E8F0', '#64748B'] : GV_AVATAR_COLORS[i % GV_AVATAR_COLORS.length];
          var genderLabel = r.gender === 'nam' ? 'Nam' : (r.gender === 'nữ' ? 'Nữ' : '');
          var sub = (genderLabel ? genderLabel + ' · ' : '') + gvLevelShort(r.points);
          return '<div class="gv-drawer-row' + (r.id && r.id === calledId ? ' gv-drawer-row-called' : '') + '" data-id="' + escHtml(r.id || '') + '">'
            + '<span class="gv-drawer-avatar" style="background:' + colors[0] + ';color:' + colors[1] + '" aria-hidden="true">' + escHtml(initial) + '</span>'
            + '<span class="gv-drawer-namewrap"><span class="gv-drawer-name' + (r.absent ? ' gv-drawer-name-absent' : '') + '" title="' + escHtml(label) + '">' + escHtml(label) + '</span>'
            + '<span class="gv-drawer-sub">' + escHtml(sub) + '</span></span>'
            + '<button type="button" class="gv-drawer-star' + (r.star ? ' gv-drawer-star-on' : '') + '" aria-pressed="' + (r.star ? 'true' : 'false') + '" aria-label="Đánh dấu sao cho ' + escHtml(label) + '">' + (r.star ? GV_STAR_SVG : GV_STAR_OUTLINE_SVG) + '</button>'
            + '<span class="gv-drawer-points" title="' + (r.points || 0) + ' điểm">' + (r.points || 0) + '</span>'
            + '<button type="button" class="gv-drawer-absent' + (r.absent ? ' gv-drawer-absent-on' : '') + '" aria-pressed="' + (r.absent ? 'true' : 'false') + '" aria-label="' + (r.absent ? 'Đánh dấu có mặt: ' : 'Đánh dấu vắng: ') + escHtml(label) + '">' + (r.absent ? 'Vắng' : '✓') + '</button>'
            + '</div>';
        }).join('');
      }

      // Đồng hồ trên thanh trên (giờ:phút, cập nhật mỗi 10 giây).
      var clockEl = document.getElementById('gv-clock');
      function tickClock() {
        if (!clockEl) return;
        var d = new Date();
        var hh = String(d.getHours()).padStart(2, '0');
        var mm = String(d.getMinutes()).padStart(2, '0');
        clockEl.textContent = hh + ':' + mm;
      }
      tickClock();
      setInterval(tickClock, 10000);

      // Làm mới các công cụ đã khởi tạo (sửa sao/vắng/điểm ở ngăn lớp
      // phải thấy ngay ở Gọi tên/Chia nhóm/Bảng điểm/Điểm danh).
      function refreshAllTools() {
        document.querySelectorAll('[data-tool]').forEach(function (root) {
          if (typeof root._gvRefresh === 'function') {
            try { root._gvRefresh(); } catch (e) { /* bỏ qua */ }
          }
        });
      }

      // Công cụ gọi lại app khi dữ liệu lớp đổi (Gọi tên cộng điểm,
      // Bảng điểm cộng điểm, Điểm danh đánh vắng) để ngăn lớp + số
      // Có mặt cập nhật ngay mà không cần chuyển tab. Các công cụ gọi
      // có kiểm tra tồn tại nên trang rời (không có UhGvApp) vẫn chạy.
      window.UhGvApp = {
        refresh: refreshSideUI,
        setCalled: function (id) {
          calledId = (typeof id === 'string') ? id : '';
          refreshSideUI();
        },
        clearCalled: function () { calledId = ''; refreshSideUI(); }
      };

      // Sửa ở ngăn lớp (sao/vắng): đọc mới từ nguồn duy nhất, sửa theo
      // id (không theo tên/vị trí — 2 bạn trùng tên không nhầm nhau),
      // lưu lại, rồi đồng bộ cả bản ghi làm việc của tab Lớp học để
      // lần sửa bảng sau không ghi đè mất thay đổi ở ngăn này.
      drawerList.addEventListener('click', function (ev) {
        var row = ev.target.closest('.gv-drawer-row');
        if (!row) return;
        var id = row.getAttribute('data-id') || '';
        var helper = gvClasses();
        var active = helper ? helper.active() : '';
        if (!helper || !active || !id) return;
        var recs = helper.getRecords(active);
        var rec = null;
        for (var j = 0; j < recs.length; j++) { if (recs[j].id === id) { rec = recs[j]; break; } }
        if (!rec) return;
        var btn = ev.target.closest('button');
        if (!btn) return;
        if (btn.classList.contains('gv-drawer-star')) {
          rec.star = !rec.star;
        } else if (btn.classList.contains('gv-drawer-absent')) {
          rec.absent = !rec.absent;
        } else return;
        helper.saveRecords(active, recs);
        syncRecordsFromHelper();
        refreshSideUI();
        refreshAllTools();
      });

      // Nút "Sửa lớp" ở đầu ngăn lớp: mở tab Lớp học.
      document.getElementById('gv-drawer-edit').addEventListener('click', function () {
        activateTab('lop-hoc');
      });

      // Nút "+ Dán từ Excel" ở ngăn lớp: mở tab Lớp học rồi đưa con trỏ
      // vào ô dán (chưa có lớp thì đưa vào ô tạo lớp mới).
      document.getElementById('gv-drawer-paste').addEventListener('click', function () {
        var helper = gvClasses();
        var active = helper ? helper.active() : '';
        activateTab('lop-hoc');
        setTimeout(function () {
          var target = document.getElementById(active ? 'lh-paste' : 'lh-new-name');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.focus();
          }
        }, 60);
      });

      // Ngăn lớp ở màn hẹp (≤1100px): thu gọn thành nút mở, bấm mở ra
      // dạng trượt từ mép phải; bấm nền mờ / nút đóng / Esc để đóng.
      var drawer = document.getElementById('gv-drawer');
      var drawerOpenBtn = document.getElementById('gv-drawer-open');
      var drawerBackdrop = document.getElementById('gv-drawer-backdrop');
      function setDrawerOpen(on) {
        drawer.classList.toggle('gv-drawer-show', !!on);
        drawerBackdrop.hidden = !on;
        drawerOpenBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
      }
      drawerOpenBtn.addEventListener('click', function () { setDrawerOpen(true); });
      document.getElementById('gv-drawer-close').addEventListener('click', function () { setDrawerOpen(false); });
      drawerBackdrop.addEventListener('click', function () { setDrawerOpen(false); });

      // ---------- Khung âm thanh (nút nhỏ trên thanh trên) ----------
      var soundBtn = document.getElementById('gv-sound-btn');
      var soundPop = document.getElementById('gv-sound-pop');
      var soundInited = false;
      function paintSoundBtn() {
        var on = true;
        try {
          on = window.UhGvSound ? window.UhGvSound.enabled()
            : localStorage.getItem('uh_gv_sound') !== '0';
        } catch (e) { /* bỏ qua */ }
        soundBtn.classList.toggle('gv-sound-off', !on);
        soundBtn.setAttribute('aria-label', on ? 'Âm thanh lớp học (đang bật)' : 'Âm thanh lớp học (đang tắt)');
      }
      function setSoundPop(open) {
        soundPop.hidden = !open;
        soundBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          if (!soundInited) {
            var root = document.getElementById('gv-tool-am-thanh');
            try { GV_INITS['am-thanh-lop-hoc'](root); } catch (e) { console.error('Không khởi tạo được khung âm thanh', e); }
            dropToolHead(root);
            soundInited = true;
          }
          paintSoundBtn();
        }
      }
      soundBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        setSoundPop(soundPop.hidden);
      });
      // Bấm ra ngoài khung thì đóng; bấm nút Bật/Tắt trong khung thì
      // vẽ lại trạng thái icon loa trên thanh trên.
      document.addEventListener('click', function (ev) {
        if (soundPop.hidden) return;
        if (soundPop.contains(ev.target)) {
          if (ev.target.closest('#at-toggle')) setTimeout(paintSoundBtn, 0);
          return;
        }
        setSoundPop(false);
      });
      paintSoundBtn();

      // ---------- Chế độ Dạy (công tắc Chuẩn bị | Dạy, phím F) ----------
      // Bật: ẩn cột tab + ngăn lớp, sân khấu chiếm trọn chiều ngang;
      // vẫn giữ thanh trên mỏng (tên lớp + nút thoát); dùng Fullscreen
      // API để toàn màn hình thật. Nhớ trạng thái vào localStorage
      // (uh_gv_dayhoc): tải lại trang thì khôi phục bố cục đã ẩn; toàn
      // màn hình xin lại ở lần tương tác đầu tiên vì trình duyệt cấm
      // tự bật không có cử chỉ.
      var TEACH_KEY = 'uh_gv_dayhoc';
      var teachMode = false;

      function setTeachMode(on, opts) {
        opts = opts || {};
        teachMode = !!on;
        try { localStorage.setItem(TEACH_KEY, teachMode ? '1' : '0'); } catch (e) { /* bỏ qua */ }
        document.body.classList.toggle('gv-teach', teachMode);
        // V2: một nút duy nhất — "Dạy (F)" cam ở chế độ Chuẩn bị,
        // "Chuẩn bị" khi đang Dạy.
        var teach = document.getElementById('gv-mode-teach');
        if (teach) {
          teach.classList.toggle('gv-mode-active', teachMode);
          teach.setAttribute('aria-pressed', teachMode ? 'true' : 'false');
          teach.innerHTML = teachMode ? 'Chuẩn bị' : 'Dạy <kbd>F</kbd>';
        }
        if (teachMode) setDrawerOpen(false);
        if (teachMode && !soundPop.hidden) setSoundPop(false);
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
        // Báo cho các công cụ biết chế độ đã đổi (Gọi tên dùng để ẩn
        // khung vòng quay khi đã công bố người thắng ở chế độ Dạy).
        try { document.dispatchEvent(new CustomEvent('gv-teach', { detail: { teach: teachMode } })); } catch (e) { /* bỏ qua */ }
      }

      // ---------- Tab gộp Xúc xắc & bốc số ----------
      function setMergeView(view, opts) {
        opts = opts || {};
        mergeView = (view === 'boc-so') ? 'boc-so' : 'xuc-xac';
        var diceRoot = document.getElementById('gv-tool-xuc-xac');
        var lotRoot = document.getElementById('gv-tool-boc-tham');
        if (diceRoot) diceRoot.hidden = (mergeView !== 'xuc-xac');
        if (lotRoot) lotRoot.hidden = (mergeView !== 'boc-so');
        var panel = document.getElementById('gv-panel-xuc-xac-boc-so');
        if (panel) {
          panel.querySelectorAll('.gv-merge-btn').forEach(function (b) {
            b.classList.toggle('gv-merge-active', b.getAttribute('data-view') === mergeView);
          });
        }
        // Mở ngăn lần đầu thì khởi tạo công cụ của ngăn đó.
        var root = mergeView === 'boc-so' ? lotRoot : diceRoot;
        if (root && !inited[root.getAttribute('data-tool')]) initToolRoot(root);
        else if (root && typeof root._gvRefresh === 'function') {
          try { root._gvRefresh(); } catch (e) { /* bỏ qua */ }
        }
        if (!opts.silent && currentTab === 'xuc-xac-boc-so') {
          try {
            var url = new URL(window.location.href);
            url.searchParams.set('view', mergeView);
            history.replaceState(null, '', url.toString());
          } catch (e) { /* bỏ qua */ }
        }
      }
      document.querySelectorAll('.gv-merge-btn').forEach(function (b) {
        b.addEventListener('click', function () { setMergeView(b.getAttribute('data-view')); });
      });

      // ---------- Chuyển tab (khởi tạo lười + làm mới khi mở lại) ----------
      // Tiêu đề + mô tả riêng của trang rời (tool-head) đã ẩn bằng CSS
      // trong app — xóa hẳn khỏi DOM sau khi công cụ khởi tạo xong
      // (một số công cụ đổi chữ mô tả trong init nên không xóa trước).
      // Sân khấu đã có tiêu đề tab riêng; để lại thì chuỗi "Gọi tên
      // ngẫu nhiên" vẫn nằm trong DOM app.
      function dropToolHead(root) {
        var head = root.querySelector('.tool-head');
        if (head) head.remove();
      }

      function initToolRoot(root) {
        var slug = root.getAttribute('data-tool');
        if (!slug || inited[slug]) return;
        try { GV_INITS[slug](root); } catch (e) { console.error('Không khởi tạo được công cụ ' + slug, e); }
        dropToolHead(root);
        inited[slug] = true;
      }

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
        // Đồng bộ lớp đang dạy ở MỌI tab (trước khi khởi tạo/làm mới
        // công cụ của tab): 2 ô chọn lớp phải đọc cùng nguồn với ngăn
        // lớp. Bản cũ chỉ đồng bộ khi mở tab Lớp học nên mở trang bằng
        // deep-link (?tab=goi-ten...) ô chọn vẫn hiện "— Chưa có lớp
        // nào —" dù lớp đã lưu (lỗi nặng 19/11). loadClass chỉ xóa
        // lượt gọi/tô sáng khi lớp THỰC SỰ đổi nên chuyển tab không
        // làm mất lượt đang gọi.
        refreshClassTab();
        if (id === 'xuc-xac-boc-so') {
          setMergeView(mergeView, { silent: true });
        } else if (id !== 'lop-hoc') {
          var panel = document.getElementById('gv-panel-' + id);
          if (panel) {
            panel.querySelectorAll('[data-tool]').forEach(function (root) {
              if (!inited[root.getAttribute('data-tool')]) initToolRoot(root);
              else if (typeof root._gvRefresh === 'function') {
                try { root._gvRefresh(); } catch (e) { console.error('Không làm mới được tab ' + id, e); }
              }
            });
          }
        }
        try {
          var url = new URL(window.location.href);
          url.searchParams.set('tab', id);
          if (id === 'xuc-xac-boc-so') url.searchParams.set('view', mergeView);
          else url.searchParams.delete('view');
          history.replaceState(null, '', url.toString());
        } catch (e) { /* bỏ qua */ }
        refreshSideUI();
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

      // Điều hướng tab bằng phím mũi tên khi focus đang ở cột tab.
      tablist.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var btns = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
        var i = btns.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        var fwd = (e.key === 'ArrowDown' || e.key === 'ArrowRight');
        var n = fwd ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
        btns[n].focus();
        activateTab(btns[n].getAttribute('data-tab'));
      });

      // ---------- Hành động chính của tab (phím Space/Enter) ----------
      // 'primary' = nút xanh đầu tiên đang hiện trong tab (tab gộp có
      // 2 ngăn Xúc xắc/Bốc số, Đếm ngược có 2 ngăn Đếm ngược/Bấm giờ).
      var MAIN_ACTION = {
        'goi-ten': '#gt-call', 'chia-nhom': '#cn-divide', 'xuc-xac-boc-so': 'primary',
        'bang-diem': 'focus:#bd-name', 'dem-nguoc': 'primary', 'do-on': 'noise',
        'diem-danh': null, 'boc-cau-hoi': '#bq-draw', 'lop-hoc': null
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

      // ---------- Hộp hướng dẫn 3 bước (chỉ hiện lần đầu mở trang;
      // bấm "Đã hiểu" — hay Esc, hay bấm ra ngoài — thì ghi cờ và
      // không hiện lại nữa) ----------
      var guidePanel = document.getElementById('gv-app-guide');
      var GUIDE_KEY = 'uh_gv_huongdan';
      function dismissGuide() {
        try { localStorage.setItem(GUIDE_KEY, '1'); } catch (e) { /* bỏ qua */ }
        guidePanel.hidden = true;
      }
      function maybeShowGuide() {
        var done = false;
        try { done = localStorage.getItem(GUIDE_KEY) === '1'; } catch (e) { /* bỏ qua */ }
        if (done) return;
        guidePanel.hidden = false;
        document.getElementById('gv-app-guide-close').focus();
      }
      document.getElementById('gv-app-guide-close').addEventListener('click', dismissGuide);
      guidePanel.addEventListener('click', function (e) { if (e.target === guidePanel) dismissGuide(); });

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
          if (!guidePanel.hidden) dismissGuide();
          else if (!helpPanel.hidden) closeHelp();
          else if (!soundPop.hidden) setSoundPop(false);
          else if (drawer.classList.contains('gv-drawer-show')) setDrawerOpen(false);
          // Thoát chế độ Dạy khi không ở toàn màn hình (đang toàn màn
          // hình thì trình duyệt giữ Esc để thoát toàn màn hình, rồi
          // sự kiện fullscreenchange sẽ tắt chế độ Dạy).
          else if (teachMode && !document.fullscreenElement) setTeachMode(false);
          return; // đóng sân khấu Chiếu lớp do chính công cụ xử lý
        }
        if (!helpPanel.hidden || !guidePanel.hidden || anyStageOpen()) return;
        var t = e.target;
        var tag = t && t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
        // Phím số/mũi tên/? không có tác dụng gốc trên nút nên vẫn xử
        // lý khi nút đang focus (giáo viên vừa bấm nút xong vẫn chuyển
        // tab được); chỉ Space/Enter nhường cho nút/link (kích hoạt
        // gốc của trình duyệt) để không gọi 2 hành động cùng lúc.
        if (DIGITS[e.key]) { e.preventDefault(); activateTab(DIGITS[e.key]); return; }
        // Phím F bật/tắt chế độ Dạy — F không có tác dụng gốc trên
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

      // Nút Dạy/Chuẩn bị duy nhất trên thanh trên (bấm để đổi chế độ);
      // khôi phục trạng thái lần trước (bố cục ẩn đã áp ngay khi tải
      // trang); toàn màn hình xin lại ở lần chạm/phím đầu tiên; Esc
      // khỏi toàn màn hình thì tắt luôn chế độ Dạy.
      document.getElementById('gv-mode-teach').addEventListener('click', function () { setTeachMode(!teachMode); });
      document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement && teachMode) setTeachMode(false, { noFullscreen: true });
      });
      (function restoreTeachMode() {
        try { teachMode = localStorage.getItem(TEACH_KEY) === '1'; } catch (e) { teachMode = false; }
        if (!teachMode) return;
        var teach = document.getElementById('gv-mode-teach');
        if (teach) {
          teach.classList.add('gv-mode-active');
          teach.setAttribute('aria-pressed', 'true');
          teach.innerHTML = 'Chuẩn bị';
        }
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
      var topClassSel = document.getElementById('gv-top-class');
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

      // Ngăn lớp sửa trực tiếp vào nguồn duy nhất (không qua mảng
      // records của tab này) — sau đó đồng bộ lại mảng làm việc +
      // vẽ lại bảng để lần sửa bảng sau không ghi đè mất.
      function syncRecordsFromHelper() {
        var helper = gvClasses();
        records = (helper && activeClass) ? helper.getRecords(activeClass) : [];
        renderTable();
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
          lhEmpty.textContent = classLabel(activeClass) + ' chưa có bạn nào — dán danh sách ở ô dưới hoặc bấm "+ Thêm bạn".';
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

      // 2 ô chọn lớp (thanh trên + tab Lớp học) luôn hiện cùng danh
      // sách và cùng lớp đang chọn. Ô trên thanh trên chỉ hiện "Lớp X"
      // (dạng chip); ô trong tab Lớp học giữ số bạn.
      function refreshClassSelect() {
        var helper = gvClasses();
        var map = helper ? helper.list() : {};
        var names = Object.keys(map).sort();
        var html;
        var topHtml;
        if (!names.length) {
          html = '<option value="">— Chưa có lớp nào —</option>';
          topHtml = html;
        } else {
          html = names.map(function (n) {
            return '<option value="' + escHtml(n) + '">' + escHtml(n) + ' (' + map[n].length + ' bạn)</option>';
          }).join('');
          topHtml = names.map(function (n) {
            return '<option value="' + escHtml(n) + '">' + escHtml(classLabel(n)) + '</option>';
          }).join('');
        }
        lhClassSel.innerHTML = html;
        topClassSel.innerHTML = topHtml;
        var val = (activeClass && map[activeClass]) ? activeClass : (names.length ? names[0] : '');
        lhClassSel.value = val;
        topClassSel.value = val;
      }

      // Xóa lượt đang gọi ở tab Gọi tên khi danh sách lớp đổi giữa
      // chừng (thêm/xóa/sửa tên/đổi lớp): danh sách đã gọi + thẻ người
      // thắng biến mất nên nút +1 không mở lại được (lỗi 19/11).
      // Sửa sao/vắng/điểm KHÔNG xóa lượt (không đổi thành viên).
      function clearCallRound() {
        var root = document.getElementById('gv-tool-goi-ten');
        if (root && typeof root._gvClearRound === 'function') {
          try { root._gvClearRound(); } catch (e) { /* bỏ qua */ }
        }
        calledId = '';
        refreshSideUI();
      }

      function loadClass(name) {
        var helper = gvClasses();
        // Chỉ khi lớp THỰC SỰ đổi mới xóa lượt gọi/tô sáng: loadClass
        // giờ chạy mỗi lần chuyển tab (đồng bộ ô chọn lớp), không
        // được làm mất lượt đang gọi.
        var changed = (name || '') !== activeClass;
        activeClass = name || '';
        if (helper) helper.setActive(activeClass);
        records = (helper && activeClass) ? helper.getRecords(activeClass) : [];
        if (changed) clearCallRound();
        // Đồng bộ cả 2 ô chọn lớp (thanh trên + tab Lớp học) với lớp
        // vừa chọn — không thì ô chọn vẫn hiện lớp cũ sau khi tạo lớp
        // mới (tìm ra khi kiểm chứng MẪU 1, 19/11).
        refreshClassSelect();
        renderTable();
        refreshSideUI();
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
        // Nút "Dùng thử với lớp mẫu" chỉ hiện khi chưa có lớp nào.
        var sampleRow = document.getElementById('lh-sample-row');
        if (sampleRow) sampleRow.style.display = names.length ? 'none' : '';
        refreshClassSelect();
        loadClass(activeClass);
      }

      lhClassSel.addEventListener('change', function () {
        loadClass(lhClassSel.value);
        refreshClassSelect();
        showMsg(lhMsg, '');
      });
      topClassSel.addEventListener('change', function () {
        loadClass(topClassSel.value);
        refreshClassSelect();
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
          showMsg(lhMsg, classLabel(name) + ' đã có rồi — đã chọn lớp này.');
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

      // ---------- Lớp mẫu: 30 bạn tên giả để giáo viên thử ngay mọi
      // tab mà chưa cần dán danh sách thật. Dùng đúng cấu trúc bản ghi
      // như lớp thật (id cố định tạo lúc thêm, giới tính, sao, vắng,
      // điểm) nên mọi tab xử lý y hệt; 2 bạn trùng họ tên để thử luôn
      // trường hợp trùng tên. Lớp mẫu là 1 lớp bình thường trong
      // uh_gv_lop — tạo lớp thật không đụng tới nó (lớp mới thành lớp
      // đang dạy, lớp mẫu vẫn nằm trong danh sách cho tới khi giáo viên
      // chọn nó rồi bấm "Xóa lớp này").
      var SAMPLE_NAME = 'Lớp mẫu';
      var SAMPLE_STUDENTS = [
        ['Nguyễn Minh Anh', 'nam', true],
        ['Trần Thị Mai', 'nữ', false],
        ['Lê Văn Hùng', 'nam', false],
        ['Phạm Thu Hà', 'nữ', true],
        ['Hoàng Đức Anh', 'nam', false],
        ['Vũ Thị Lan', 'nữ', false],
        ['Đặng Quốc Bảo', 'nam', false],
        ['Bùi Thị Ngọc', 'nữ', false],
        ['Đỗ Văn Tuấn', 'nam', false],
        ['Hồ Thị Phương', 'nữ', false],
        ['Ngô Minh Quân', 'nam', true],
        ['Dương Thị Hoa', 'nữ', false],
        ['Nguyễn Minh Anh', 'nam', false],
        ['Lý Văn Nam', 'nam', false],
        ['Trần Quốc Anh', 'nam', false],
        ['Lê Thị Hồng', 'nữ', false],
        ['Phạm Văn Đức', 'nam', false],
        ['Hoàng Thị Linh', 'nữ', true],
        ['Vũ Minh Trí', 'nam', false],
        ['Đặng Thị Thu', 'nữ', false],
        ['Bùi Văn Sơn', 'nam', false],
        ['Đỗ Thị Hạnh', 'nữ', false],
        ['Hồ Văn Khánh', 'nam', false],
        ['Ngô Thị Trang', 'nữ', false],
        ['Dương Văn Phúc', 'nam', false],
        ['Lý Thị Mai Anh', 'nữ', false],
        ['Trần Văn Hải', 'nam', false],
        ['Lê Quốc Huy', 'nam', true],
        ['Phạm Thị Yến', 'nữ', false],
        ['Hoàng Văn Long', 'nam', false],
      ];
      function createSampleClass() {
        var helper = gvClasses();
        if (!helper) { showMsg(lhMsg, 'Trình duyệt chưa nạp xong phần lưu lớp — tải lại trang rồi thử lại nhé.'); return; }
        if (helper.list()[SAMPLE_NAME]) {
          // Đã có lớp mẫu rồi (giáo viên tạo trước đó): chỉ chọn nó,
          // không ghi đè — điểm/vắng đã thử vẫn còn nguyên.
          refreshClassSelect();
          loadClass(SAMPLE_NAME);
          return;
        }
        var recs = SAMPLE_STUDENTS.map(function (s) {
          return { id: helper.newId(), name: s[0], gender: s[1], star: !!s[2], absent: false, points: 0 };
        });
        helper.saveRecords(SAMPLE_NAME, recs);
        refreshClassSelect();
        loadClass(SAMPLE_NAME);
        refreshClassTab(); // ẩn nút lớp mẫu (đã có lớp) + đồng bộ 2 ô chọn
        showMsg(lhMsg, 'Đã tạo lớp mẫu 30 bạn — thử gọi tên, chia nhóm, điểm danh thoải mái. Khi có lớp thật, tạo lớp mới rồi chọn lớp mẫu và bấm "Xóa lớp này".');
      }
      document.getElementById('lh-sample-class').addEventListener('click', createSampleClass);
      document.getElementById('gv-drawer-sample').addEventListener('click', createSampleClass);

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
        var helper = gvClasses();
        var name = 'Bạn mới';
        var i = 2;
        while (records.some(function (r) { return r.name === name; })) { name = 'Bạn mới ' + i; i++; }
        // Gán id ngay lúc tạo để mảng làm việc có id trước khi lưu.
        records.push({ id: (helper && helper.newId) ? helper.newId() : '', name: name, gender: '', star: false, absent: false, points: 0 });
        saveRecords();
        clearCallRound(); // thêm thành viên giữa chừng → xóa lượt gọi
        renderTable();
        refreshSideUI();
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
          clearCallRound(); // sửa tên giữa chừng → xóa lượt gọi
          refreshSideUI();
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
          refreshSideUI();
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
          refreshSideUI();
          btn.classList.toggle('lh-star-on', rec.star);
          btn.setAttribute('aria-pressed', rec.star ? 'true' : 'false');
          btn.textContent = rec.star ? '★' : '☆';
          return;
        }
        if (btn.classList.contains('lh-absent')) {
          rec.absent = !rec.absent;
          saveRecords();
          refreshSideUI();
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
          refreshSideUI();
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
          clearCallRound(); // xóa thành viên giữa chừng → xóa lượt gọi
          renderTable();
          refreshSideUI();
          showMsg(lhMsg, 'Đã xóa ' + gone + ' khỏi lớp ' + activeClass + '.');
          return;
        }
      });

      // ---------- Nhập danh sách: dán Excel / file .csv / file mẫu ----------
      // Thêm danh sách vào lớp — KHÔNG gộp trùng tên (lớp hay có 2
      // bạn trùng họ tên, giữ cả hai); bước xem trước là chỗ giáo viên
      // kiểm tra trước khi thêm.
      function mergeStudents(list) {
        var helper = gvClasses();
        var added = 0;
        list.forEach(function (item) {
          // Mỗi bạn mới có id cố định riêng ngay lúc thêm (kể cả 2
          // bạn trùng họ tên — id khác nhau).
          records.push({ id: (helper && helper.newId) ? helper.newId() : '', name: item.name, gender: item.gender || '', star: false, absent: false, points: 0 });
          added++;
        });
        if (added) {
          saveRecords();
          clearCallRound(); // nhập thêm bạn giữa chừng → xóa lượt gọi
        }
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
        refreshSideUI();
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
      var BACKUP_KEYS = ['uh_gv_lop', 'uh_bangdiemlop', 'uh_gv_diemdanh', 'uh_gv_cauhoi', 'uh_gv_cauhoi_asked', 'uh_gv_sound', 'uh_gv_vol', 'uh_gv_lop_active', 'uh_gv_dayhoc', 'uh_gv_huongdan'];
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

      // ---------- Mở trang: deep-link ?tab= (+ ?view= cho tab gộp) ----------
      (function initTab() {
        var tab = 'lop-hoc';
        var view = '';
        var sample = false;
        try {
          var params = new URLSearchParams(window.location.search);
          var q = params.get('tab') || '';
          if (TABS.indexOf(q) !== -1) tab = q;
          else if (SLUG_TO_TAB[q]) tab = SLUG_TO_TAB[q];
          view = params.get('view') || '';
          // Link cũ ?tab=boc-tham (không có ?view=) vẫn mở đúng ngăn Bốc số.
          if ((q === 'boc-tham' || q === 'boc-tham-so') && !view) view = 'boc-so';
          sample = params.get('sample') === '1';
        } catch (e) { /* bỏ qua */ }
        // ?sample=1 (nút "Dùng thử với lớp mẫu" ở trang /giao-vien/):
        // tạo lớp mẫu 30 bạn (đã có thì chỉ chọn nó) rồi mở tab yêu cầu.
        if (sample) {
          try { createSampleClass(); } catch (e) { /* bỏ qua */ }
          try {
            var url = new URL(window.location.href);
            url.searchParams.delete('sample');
            history.replaceState(null, '', url.toString());
          } catch (e) { /* bỏ qua */ }
        }
        if (view === 'boc-so' || view === 'xuc-xac') mergeView = view;
        activateTab(tab);
      })();
      // Hộp hướng dẫn 3 bước chỉ hiện lần đầu mở trang.
      maybeShowGuide();
    });
  })();
  </script>`;
}
