// Xem và sửa file Excel — mở file .xlsx/.xls/.csv ngay trên trình
// duyệt, sửa trực tiếp từng ô trên bảng rồi tải lại .xlsx hoặc .csv.
// Thư viện: SheetJS Community Edition 0.20.3 (Apache-2.0) — file
// src/vendor/xlsx.full.min.js đã có sẵn trong repo (dùng chung với
// các công cụ giáo viên xuất Excel), chỉ tải khi mở file lần đầu.
export const meta = {
  id: 'xem-sua-excel',
  name: 'Xem và sửa file Excel ngay trên trình duyệt',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Mở file Excel (.xlsx, .xls) hoặc CSV, sửa trực tiếp từng ô trên bảng rồi tải lại file .xlsx hoặc .csv — không cần cài phần mềm, file không rời khỏi máy bạn.',
  keywords: 'xem excel online, sửa excel online, mở file xlsx, sửa file csv, excel trên trình duyệt, chỉnh sửa bảng tính',
  icon: '📊',
  seoTitle: 'Xem và sửa file Excel online miễn phí — không cần cài đặt',
  seoDesc: 'Mở file Excel (.xlsx, .xls) hoặc CSV ngay trên trình duyệt, sửa từng ô rồi tải lại file .xlsx hoặc .csv. Miễn phí, file không rời khỏi máy bạn.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field">
          <label>Chọn file Excel hoặc CSV</label>
          <input id="xse-file" type="file" accept=".xlsx,.xls,.csv" hidden>
          <div class="btn-row"><button type="button" class="btn btn-primary" id="xse-pick">Chọn file</button><button type="button" class="btn btn-ghost" id="xse-sample">Dùng bảng mẫu</button></div>
          <p class="hint">Chưa chọn file nào. Chấp nhận .xlsx, .xls, .csv — tối đa 10 MB.</p>
        </div>
        <div id="xse-info"></div>
        <div class="field" id="xse-sheet-wrap" style="display:none">
          <label for="xse-sheet">Bảng tính (sheet)</label>
          <select id="xse-sheet"></select>
        </div>
        <div class="btn-row" id="xse-edit-row" style="display:none"><button type="button" class="btn btn-ghost" id="xse-add-row">Thêm dòng</button><button type="button" class="btn btn-ghost" id="xse-add-col">Thêm cột</button></div>
        <div id="xse-progress-wrap" style="display:none"><p class="muted small" id="xse-status"></p><div class="progress-bar"><div class="progress-fill" id="xse-fill"></div></div></div>
        <div id="xse-status-err"></div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <p class="muted" id="xse-empty">Chọn file Excel hoặc CSV — bảng sẽ hiện ở đây, bấm vào ô để sửa.</p>
      <div id="xse-out"></div>
    </div>
  </div>
  <div class="xse-table-wrap" id="xse-table-wrap" style="display:none"><table class="tbl" id="xse-table"></table></div>
  <p class="note">File chỉ được xử lý trên máy của bạn, KHÔNG tải lên máy chủ nào. Thư viện đọc/ghi Excel (SheetJS 0.20.3, Apache-2.0) khoảng 930 KB, chỉ tải khi bạn mở công cụ này. Dòng đầu của bảng được xem là tiêu đề cột. Chỉ hiện tối đa 500 dòng × 30 cột. Số và ngày trong file được giữ nguyên dạng chữ khi lưu lại; ô có công thức sẽ lưu lại dưới dạng giá trị đã tính (không giữ công thức).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 10 * 1024 * 1024;
  const MAX_ROWS = 500;
  const MAX_COLS = 30;
  const XLSX_URL = '/assets/vendor/xlsx.full.min.js';

  let wb = null;          // workbook SheetJS đã đọc
  let sheetName = '';
  let fileBase = 'bang';
  let xlsxPromise = null; // cache lần tải thư viện

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showError(msg) { $('xse-status-err').innerHTML = '<p class="error">' + msg + '</p>'; }
  function clearError() { $('xse-status-err').innerHTML = ''; }
  function setProgress(pct, text) {
    $('xse-progress-wrap').style.display = '';
    $('xse-fill').style.width = Math.max(0, Math.min(100, pct)) + '%';
    if (text != null) $('xse-status').textContent = text;
  }
  function hideProgress() { $('xse-progress-wrap').style.display = 'none'; }

  // Nạp thư viện SheetJS khi cần (mẫu nạp lúc chạy của các công cụ
  // giáo viên xuất Excel): chỉ tải khi mở file lần đầu, những lần
  // sau dùng lại ngay.
  function loadXlsx() {
    if (typeof window !== 'undefined' && window.XLSX) return Promise.resolve(window.XLSX);
    if (xlsxPromise) return xlsxPromise;
    setProgress(30, 'Đang tải thư viện Excel (khoảng 930 KB, chỉ tải 1 lần)…');
    xlsxPromise = new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = XLSX_URL;
      s.onload = function () { hideProgress(); resolve(window.XLSX); };
      s.onerror = function () { xlsxPromise = null; hideProgress(); reject(new Error('Không tải được thư viện Excel — kiểm tra mạng rồi thử lại.')); };
      document.head.appendChild(s);
    });
    return xlsxPromise;
  }

  // Nút "Chép liên kết"/"Chia sẻ Zalo" trong thẻ kết quả sinh ra động
  // sau khi mở file — tool-state.js chạy trước lúc đó nên không bắt
  // được; bắt bằng lắng nghe trên khung công cụ (xem ghi chú ở
  // setupShareRow của tool-state.js). Nghe 1 lần ở đây, nút tạo lại
  // bao nhiêu lần vẫn chạy.
  root.addEventListener('click', function (ev) {
    const t = ev.target && ev.target.closest ? ev.target.closest('[data-uh-share-copy], [data-uh-share-zalo]') : null;
    if (!t) return;
    const url = window.location.href;
    if (t.hasAttribute('data-uh-share-copy')) {
      const p = (U.copyText) ? U.copyText(url) : null;
      if (p && p.then) p.then(function (ok) { toast(ok ? 'Đã chép liên kết' : 'Không chép được — hãy chép tay'); });
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('Đã chép liên kết'); }, function () { toast('Không chép được — hãy chép tay'); });
    } else {
      const title = document.title || '';
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: title, text: title, url: url }).catch(function () { /* người dùng hủy chia sẻ */ });
      } else if (typeof window !== 'undefined') {
        window.open('https://zalo.me/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
      }
    }
  });

  function renderResult() {
    const tbl = $('xse-table');
    const rows = tbl ? tbl.rows.length : 0;
    const cols = (tbl && tbl.rows.length) ? tbl.rows[0].cells.length : 0;
    $('xse-out').innerHTML = '<div class="result">' +
      '<div class="result-row"><span>Sheet đang sửa</span><strong>' + escHtml(sheetName) + '</strong></div>' +
      '<div class="result-row"><span>Số dòng / số cột</span><strong>' + rows + ' / ' + cols + '</strong></div></div>' +
      '<div class="m2-result-actions"><button type="button" class="btn btn-primary" data-xse-export="xlsx">Tải file .xlsx</button><button type="button" class="btn btn-ghost" data-xse-export="csv">Tải file .csv</button><button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button><button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button><button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button></div>';
  }

  // Vẽ mảng 2 chiều thành bảng sửa được (dòng đầu làm tiêu đề cột).
  function renderTable(aoa) {
    const tbl = $('xse-table');
    const rows = Math.min(aoa.length, MAX_ROWS);
    const cols = Math.min(Math.max.apply(null, aoa.map(function (r) { return (r || []).length; }).concat([0])), MAX_COLS);
    let html = '';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        const v = (aoa[r] && aoa[r][c] != null) ? String(aoa[r][c]) : '';
        if (r === 0) html += '<th contenteditable="true" spellcheck="false">' + escHtml(v) + '</th>';
        else html += '<td contenteditable="true" spellcheck="false">' + escHtml(v) + '</td>';
      }
      html += '</tr>';
    }
    tbl.innerHTML = html;
    $('xse-table-wrap').style.display = '';
    $('xse-empty').style.display = 'none';
    $('xse-edit-row').style.display = '';
    renderResult();
  }

  // Đọc lại bảng trên màn hình thành mảng 2 chiều (cắt dòng/cột trống
  // ở cuối cho gọn).
  function readTable() {
    const tbl = $('xse-table');
    const aoa = [];
    for (let r = 0; r < tbl.rows.length; r++) {
      const row = [];
      for (let c = 0; c < tbl.rows[r].cells.length; c++) row.push(tbl.rows[r].cells[c].textContent);
      aoa.push(row);
    }
    while (aoa.length && aoa[aoa.length - 1].every(function (v) { return String(v).trim() === ''; })) aoa.pop();
    const maxC = Math.max.apply(null, aoa.map(function (r) { return r.length; }).concat([0]));
    let lastC = maxC;
    while (lastC > 0 && aoa.every(function (r) { return String(r[lastC - 1] || '').trim() === ''; })) lastC--;
    return aoa.map(function (r) { return r.slice(0, lastC); });
  }

  function renderSheet(name) {
    sheetName = name;
    const XLSX = window.XLSX;
    const ws = wb.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
    renderTable(aoa.length ? aoa : [['']]);
    $('xse-info').innerHTML = '<div class="result"><div class="result-row"><span>File</span><strong>' + escHtml(fileBase) + '</strong></div>' +
      '<div class="result-row"><span>Số sheet</span><strong>' + wb.SheetNames.length + '</strong></div></div>';
  }

  async function loadFile(file) {
    clearError();
    if (!file) return;
    const name = file.name || '';
    const isCsv = /\.csv$/i.test(name);
    const isXls = /\.(xlsx|xls)$/i.test(name);
    if (!isCsv && !isXls) { showError('Hãy chọn file .xlsx, .xls hoặc .csv.'); return; }
    if (file.size > MAX_BYTES) { showError('File quá lớn (' + fmtBytes(file.size) + '). Giới hạn 10 MB/file.'); return; }
    fileBase = name.replace(/\.[^.]+$/, '') || 'bang';
    try {
      const XLSX = await loadXlsx();
      const data = isCsv ? await file.text() : await file.arrayBuffer();
      wb = XLSX.read(data, { type: isCsv ? 'string' : 'array' });
      if (!wb.SheetNames.length) { showError('Không đọc được sheet nào trong file này.'); return; }
      const sel = $('xse-sheet');
      sel.innerHTML = wb.SheetNames.map(function (n) { return '<option value="' + escHtml(n) + '">' + escHtml(n) + '</option>'; }).join('');
      $('xse-sheet-wrap').style.display = '';
      renderSheet(wb.SheetNames[0]);
      toast('Đã mở file — bấm vào ô để sửa.');
    } catch (e) {
      hideProgress();
      showError('Không mở được file này: ' + escHtml((e && e.message) ? e.message : 'file có thể đã hỏng.') + ' Hãy thử file khác.');
    }
  }

  const SAMPLE = [
    ['Tên hàng', 'Số lượng', 'Đơn giá (đồng)', 'Thành tiền (đồng)'],
    ['Gạo ST25', '2', '32000', '64000'],
    ['Dầu ăn 1 lít', '1', '45000', '45000'],
    ['Đường trắng 1 kg', '3', '22000', '66000'],
    ['Muối i-ốt 500 g', '2', '8000', '16000'],
  ];

  $('xse-pick').addEventListener('click', function () { $('xse-file').click(); });
  $('xse-file').addEventListener('change', function () {
    const f = ($('xse-file').files || [])[0];
    $('xse-file').value = '';
    loadFile(f);
  });
  root.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  root.addEventListener('drop', function (ev) {
    ev.preventDefault();
    const f = ev.dataTransfer && ev.dataTransfer.files ? ev.dataTransfer.files[0] : null;
    loadFile(f);
  });
  $('xse-sample').addEventListener('click', function () {
    clearError();
    wb = null;
    sheetName = 'Bảng mẫu';
    fileBase = 'bang-mau';
    $('xse-sheet-wrap').style.display = 'none';
    $('xse-info').innerHTML = '<div class="result"><div class="result-row"><span>Bảng mẫu</span><strong>hàng hóa — sửa thử rồi tải về</strong></div></div>';
    renderTable(SAMPLE.map(function (r) { return r.slice(); }));
    toast('Đã mở bảng mẫu — sửa rồi tải về thử.');
  });
  $('xse-sheet').addEventListener('change', function () { renderSheet($('xse-sheet').value); });
  $('xse-add-row').addEventListener('click', function () {
    const tbl = $('xse-table');
    if (!tbl.rows.length) return;
    const cols = tbl.rows[0].cells.length;
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      td.contentEditable = 'true'; td.spellcheck = false; td.textContent = '';
      tr.appendChild(td);
    }
    tbl.appendChild(tr);
    renderResult();
  });
  $('xse-add-col').addEventListener('click', function () {
    const tbl = $('xse-table');
    for (let r = 0; r < tbl.rows.length; r++) {
      const cell = document.createElement(r === 0 ? 'th' : 'td');
      cell.contentEditable = 'true'; cell.spellcheck = false; cell.textContent = '';
      tbl.rows[r].appendChild(cell);
    }
    renderResult();
  });

  // Dán vào ô chỉ lấy chữ thuần (không mang theo định dạng, bảng
  // hay ảnh từ Excel/Word sang làm vỡ ô).
  $('xse-table').addEventListener('paste', function (ev) {
    const t = ev.target && ev.target.closest ? ev.target.closest('[contenteditable]') : null;
    if (!t) return;
    ev.preventDefault();
    const text = (ev.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  // Nút tải file (nằm trong thẻ kết quả sinh động) — nghe trên khung
  // chứa, bấm mới tải thư viện nếu chưa có (trường hợp dùng bảng mẫu).
  $('xse-out').addEventListener('click', async function (ev) {
    const btn = ev.target && ev.target.closest ? ev.target.closest('[data-xse-export]') : null;
    if (!btn) return;
    const kind = btn.getAttribute('data-xse-export');
    try {
      const XLSX = await loadXlsx();
      const aoa = readTable();
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const outWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outWb, ws, (sheetName || 'Bang').slice(0, 31));
      const outName = fileBase + '-da-sua.' + kind;
      if (kind === 'xlsx') {
        const buf = XLSX.write(outWb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = outName; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      } else {
        const csv = XLSX.write(outWb, { bookType: 'csv', type: 'string' });
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = outName; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      }
      toast('Đã tải file ' + outName + '.');
    } catch (e) {
      showError('Không xuất được file: ' + escHtml((e && e.message) ? e.message : 'đã có lỗi xảy ra.'));
    }
  });
}
