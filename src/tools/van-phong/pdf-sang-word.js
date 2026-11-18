// PDF -> Word (lay van ban) — trich van ban tu PDF bang pdf.js, xuat file .docx
// viet tay (ZIP + XML toi gian, khong can thu vien docx). Chi lay van ban,
// khong giu bo cuc/hinh anh/bang. Moi xu ly chay tren trinh duyet.
export const meta = {
  id: 'pdf-sang-word',
  name: 'PDF → Word: lấy văn bản thành file .docx',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Trích văn bản từ file PDF rồi xuất thành file Word (.docx) để sửa tiếp. Chỉ lấy văn bản — không giữ nguyên bố cục, hình ảnh hay bảng.',
  keywords: 'pdf sang word, pdf to word, trích văn bản pdf, chuyển pdf thành docx, lấy chữ từ pdf',
  icon: '📄',
  seoTitle: 'PDF → Word miễn phí — Lấy văn bản từ PDF thành file .docx',
  seoDesc: 'Trích văn bản từ file PDF rồi xuất thành file Word (.docx) miễn phí, xử lý ngay trên trình duyệt. Chỉ lấy văn bản, không giữ bố cục/hình ảnh/bảng.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📄</span><div><h2>PDF → Word: lấy văn bản thành file .docx</h2><p class="muted">Chọn file PDF, trích văn bản rồi tải về file Word để sửa tiếp.</p></div></div>
  <p class="note">🔒 File chỉ được xử lý trên máy của bạn (thư viện pdf.js chạy trong trình duyệt), KHÔNG tải lên máy chủ nào.</p>
  <p class="note">⚠️ Công cụ này <strong>chỉ lấy văn bản</strong> — không giữ nguyên bố cục, hình ảnh hay bảng trong PDF. PDF scan (ảnh chụp, không có lớp chữ) sẽ không trích được chữ.</p>
  <div class="field"><label for="psw-file">Chọn file PDF</label><input id="psw-file" type="file" accept=".pdf,application/pdf"><p class="hint">Tối đa 30 MB. PDF có mật khẩu chưa hỗ trợ.</p></div>
  <div class="btn-row"><button type="button" class="btn btn-primary" id="psw-go">Trích văn bản</button></div>
  <div id="psw-status"></div>
  <div id="psw-out" hidden>
    <div class="result" id="psw-info"></div>
    <div class="field"><label for="psw-text">Văn bản trích được — bạn có thể sửa trước khi xuất file Word</label><textarea id="psw-text" rows="12"></textarea></div>
    <div class="btn-row"><button type="button" class="btn btn-primary" id="psw-dl">Tải file .docx</button><button type="button" class="btn btn-ghost" id="psw-copy">Chép văn bản</button></div>
  </div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const MAX_BYTES = 30 * 1024 * 1024;

  let baseName = 'tai-lieu';

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function showStatus(html) { $('psw-status').innerHTML = html; }
  function showError(msg) { showStatus('<p class="error">' + msg + '</p>'); }

  // Tao file .docx toi gian (ZIP dang STORE + 3 file XML) tu van ban.
  // Tu chua hoan toan (khong phu thuoc DOM) de de kiem thu.
  function buildDocxBlob(text) {
    function escXml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    var CRC_TABLE = (function () {
      var t = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
      }
      return t;
    })();
    function crc32(bytes) {
      var c = 0xFFFFFFFF;
      for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
      return (c ^ 0xFFFFFFFF) >>> 0;
    }
    function u16(n) { return new Uint8Array([n & 0xFF, (n >> 8) & 0xFF]); }
    function u32(n) { return new Uint8Array([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]); }
    function concat(parts) {
      var len = 0;
      parts.forEach(function (p) { len += p.length; });
      var out = new Uint8Array(len);
      var off = 0;
      parts.forEach(function (p) { out.set(p, off); off += p.length; });
      return out;
    }
    // ZIP chi dung STORE (khong nen): don gian, Word/LibreOffice mo duoc.
    function zipStore(entries) {
      var enc = new TextEncoder();
      var localParts = [];
      var centralParts = [];
      var offset = 0;
      entries.forEach(function (e) {
        var nameBytes = enc.encode(e.name);
        var crc = crc32(e.data);
        var local = concat([
          u32(0x04034B50), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
          u32(crc), u32(e.data.length), u32(e.data.length),
          u16(nameBytes.length), u16(0), nameBytes, e.data
        ]);
        centralParts.push(concat([
          u32(0x02014B50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
          u32(crc), u32(e.data.length), u32(e.data.length),
          u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes
        ]));
        localParts.push(local);
        offset += local.length;
      });
      var central = concat(centralParts);
      var eocd = concat([
        u32(0x06054B50), u16(0), u16(0),
        u16(entries.length), u16(entries.length),
        u32(central.length), u32(offset), u16(0)
      ]);
      return concat(localParts.concat([central, eocd]));
    }

    var enc = new TextEncoder();
    var clean = (text || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // ky tu dieu khien XML khong chap nhan
    var paras = clean.split('\n').map(function (line) {
      if (!line) return '<w:p/>';
      return '<w:p><w:r><w:t xml:space="preserve">' + escXml(line) + '</w:t></w:r></w:p>';
    }).join('');
    var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main"/></Types>';
    var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
    var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      paras + '</w:body></w:document>';
    var zip = zipStore([
      { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
      { name: '_rels/.rels', data: enc.encode(rels) },
      { name: 'word/document.xml', data: enc.encode(documentXml) }
    ]);
    return new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  $('psw-go').addEventListener('click', async function () {
    var file = $('psw-file').files && $('psw-file').files[0];
    $('psw-out').hidden = true;
    if (!file) { showError('Hãy chọn file PDF trước đã.'); return; }
    if (file.size > MAX_BYTES) {
      showError('File quá lớn (' + fmtBytes(file.size) + '). Giới hạn 30 MB.');
      return;
    }
    var pdfjsLib = (typeof window !== 'undefined' && window.pdfjsLib) || null;
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
      showError('Thư viện đọc PDF chưa tải được — kiểm tra mạng rồi tải lại trang.');
      return;
    }
    // Chỉ rõ file worker (đã bundled sẵn): không đặt thì pdf.js đoán đường
    // dẫn từ vị trí pdf.min.js; đặt rõ để chắc chắn đúng mọi trường hợp.
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.js';
    }
    var btn = $('psw-go');
    var setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang trích…');
    btn.disabled = true;
    try {
      var data = await file.arrayBuffer();
      var pdf = await pdfjsLib.getDocument({ data: data }).promise;
      var pages = [];
      for (var i = 1; i <= pdf.numPages; i++) {
        showStatus('<p class="muted">Đang đọc trang ' + i + '/' + pdf.numPages + '…</p>');
        var page = await pdf.getPage(i);
        var tc = await page.getTextContent();
        var pageText = '';
        tc.items.forEach(function (item) {
          pageText += item.str + (item.hasEOL ? '\n' : ' ');
        });
        pages.push(pageText);
      }
      var text = pages.join('\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      var words = text ? (text.match(/\S+/g) || []).length : 0;
      var i2 = file.name.lastIndexOf('.');
      baseName = i2 > 0 ? file.name.slice(0, i2) : file.name;
      showStatus('');
      $('psw-info').innerHTML =
        '<div class="result-row"><span>Số trang</span><strong>' + pdf.numPages + '</strong></div>' +
        '<div class="result-row"><span>Số từ trích được</span><strong>' + words.toLocaleString('vi-VN') + '</strong></div>';
      $('psw-text').value = text;
      $('psw-out').hidden = false;
      if (!text) {
        showStatus('<p class="error">Không trích được chữ nào — file này có thể là PDF scan (ảnh chụp) nên không có lớp chữ để lấy.</p>');
      } else {
        toast('Đã trích xong ' + pdf.numPages + ' trang.');
      }
    } catch (e) {
      if (e && e.name === 'PasswordException') {
        showError('PDF này có mật khẩu — công cụ chưa hỗ trợ file PDF khóa mật khẩu.');
      } else {
        showError('Không đọc được file PDF này. File có thể đã hỏng hoặc không đúng định dạng PDF.');
      }
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });

  $('psw-dl').addEventListener('click', function () {
    var text = $('psw-text').value;
    if (!text.trim()) { toast('Chưa có văn bản để xuất — hãy trích văn bản trước.'); return; }
    try {
      var blob = buildDocxBlob(text);
      downloadBlob(blob, baseName + '.docx');
      toast('Đã tải file ' + baseName + '.docx');
    } catch (e) {
      showError('Không tạo được file Word. Hãy thử lại.');
    }
  });

  $('psw-copy').addEventListener('click', function () {
    var text = $('psw-text').value;
    if (!text.trim()) { toast('Chưa có văn bản để chép.'); return; }
    if (U.copyResult) U.copyResult(text, 'Đã chép văn bản');
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast('Đã chép văn bản'); });
  });
}
