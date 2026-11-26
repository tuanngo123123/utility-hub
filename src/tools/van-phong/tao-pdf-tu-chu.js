// Tạo file PDF từ chữ — gõ hoặc dán văn bản tiếng Việt rồi tạo file
// PDF khổ A4 để tải về. Thư viện: jsPDF 4.2.1 (MIT) — file
// src/vendor/jspdf.umd.min.js, chỉ tải khi mở trang này. Phông chữ
// Việt Be Vietnam Pro (SIL OFL 1.1) nạp lúc chạy lần đầu qua
// jsPDF addFont — phông mặc định của jsPDF không có dấu tiếng Việt.
export const meta = {
  id: 'tao-pdf-tu-chu',
  name: 'Tạo file PDF từ chữ',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Gõ hoặc dán văn bản tiếng Việt rồi tạo file PDF khổ A4 để tải về — chọn được cỡ chữ, có tiêu đề. Chữ Việt hiển thị đúng dấu, file làm ngay trên trình duyệt.',
  keywords: 'tạo pdf từ chữ, chuyển văn bản sang pdf, tạo pdf tiếng việt, văn bản sang pdf, gõ chữ ra pdf',
  icon: '📄',
  seoTitle: 'Tạo file PDF từ chữ online miễn phí — tiếng Việt đúng dấu',
  seoDesc: 'Gõ hoặc dán văn bản tiếng Việt rồi tạo file PDF khổ A4 để tải về. Chọn cỡ chữ, có tiêu đề, chữ Việt đúng dấu. Miễn phí, file làm ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field">
          <label for="tpc-title">Tiêu đề (không bắt buộc)</label>
          <input id="tpc-title" type="text" placeholder="Ví dụ: Đơn xin nghỉ phép" maxlength="120">
        </div>
        <div class="field">
          <label for="tpc-text">Nội dung văn bản</label>
          <textarea id="tpc-text" rows="12" placeholder="Gõ hoặc dán văn bản tiếng Việt vào đây…"></textarea>
          <p class="hint"><span id="tpc-count">0 ký tự</span> — giữ nguyên dòng trống giữa các đoạn.</p>
        </div>
        <div class="field">
          <label for="tpc-size">Cỡ chữ nội dung</label>
          <select id="tpc-size">
            <option value="12">12 — nhỏ gọn</option>
            <option value="14" selected>14 — vừa đọc</option>
            <option value="16">16 — chữ to</option>
            <option value="18">18 — rất to</option>
          </select>
        </div>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="tpc-go">Tạo file PDF</button><button type="button" class="btn btn-ghost" id="tpc-sample">Điền ví dụ</button></div>
        <div id="tpc-progress-wrap" style="display:none"><p class="muted small" id="tpc-status"></p><div class="progress-bar"><div class="progress-fill" id="tpc-fill"></div></div></div>
        <div id="tpc-status-err"></div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <p class="muted" id="tpc-empty">Gõ nội dung rồi bấm Tạo file PDF — thông tin file sẽ hiện ở đây.</p>
      <div id="tpc-out"></div>
    </div>
  </div>
  <p class="note">File PDF làm ngay trên trình duyệt, chữ của bạn không gửi lên máy chủ nào. Thư viện tạo PDF (jsPDF 4.2.1, MIT) khoảng 410 KB + phông chữ Việt (Be Vietnam Pro, SIL OFL 1.1) khoảng 270 KB, chỉ tải khi bạn mở công cụ này và bấm tạo file lần đầu. Khổ giấy A4, lề 20 mm.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);
  const FONT_FILES = [
    { url: '/assets/vendor/BeVietnamPro-Regular.ttf', name: 'BeVietnamPro-Regular.ttf', style: 'normal', bytes: 132948 },
    { url: '/assets/vendor/BeVietnamPro-Bold.ttf', name: 'BeVietnamPro-Bold.ttf', style: 'bold', bytes: 140300 },
  ];
  const TOTAL_FONT_BYTES = 132948 + 140300;

  let fontPromise = null; // cache phông đã nạp
  let resultBlob = null;
  let resultURL = null;

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (n / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showError(msg) { $('tpc-status-err').innerHTML = '<p class="error">' + msg + '</p>'; }
  function clearError() { $('tpc-status-err').innerHTML = ''; }
  function setProgress(pct, text) {
    $('tpc-progress-wrap').style.display = '';
    $('tpc-fill').style.width = Math.max(0, Math.min(100, pct)) + '%';
    if (text != null) $('tpc-status').textContent = text;
  }
  function hideProgress() { $('tpc-progress-wrap').style.display = 'none'; }
  // Bỏ dấu tiếng Việt để đặt tên file an toàn.
  function slugify(s) {
    const map = { 'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a', 'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a', 'đ': 'd', 'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e', 'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e', 'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i', 'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o', 'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o', 'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o', 'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u', 'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u', 'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y' };
    return String(s || '').toLowerCase().split('').map(function (ch) { return map[ch] || ch; }).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'van-ban';
  }

  // Nút "Chép liên kết"/"Chia sẻ Zalo" trong thẻ kết quả sinh ra động
  // sau khi tạo file xong — tool-state.js chạy trước lúc đó nên không
  // bắt được; bắt bằng lắng nghe trên khung công cụ (xem ghi chú ở
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

  // Tải phông chữ Việt kèm tiến độ thật (fetch + đọc từng phần, mẫu
  // của Tách nền ảnh) rồi đăng ký vào jsPDF bằng addFont. Phông mặc
  // định của jsPDF không có dấu tiếng Việt nên bước này bắt buộc.
  async function fetchFontWithProgress(f, basePct, spanPct, received0) {
    const res = await fetch(f.url);
    if (!res.ok) throw new Error('Không tải được phông chữ (' + f.name + ', mã ' + res.status + ').');
    const total = +res.headers.get('Content-Length') || f.bytes;
    if (!res.body || !res.body.getReader) {
      const buf = await res.arrayBuffer();
      setProgress(basePct + spanPct, 'Đã tải phông chữ (' + fmtBytes(buf.byteLength) + ')…');
      return { buf: buf, received: buf.byteLength };
    }
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
      const r = await reader.read();
      if (r.done) break;
      chunks.push(r.value);
      received += r.value.length;
      const allReceived = received0 + received;
      const pct = basePct + Math.round((allReceived / TOTAL_FONT_BYTES) * spanPct);
      setProgress(pct, 'Đang tải phông chữ Việt: ' + fmtBytes(allReceived) + ' / ' + fmtBytes(TOTAL_FONT_BYTES) + '…');
    }
    const all = new Uint8Array(received);
    let off = 0;
    chunks.forEach(function (c) { all.set(c, off); off += c.length; });
    return { buf: all.buffer, received: received };
  }
  function arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }
  function loadFonts(doc) {
    if (fontPromise) return fontPromise;
    fontPromise = (async function () {
      let received0 = 0;
      for (let i = 0; i < FONT_FILES.length; i++) {
        const f = FONT_FILES[i];
        const r = await fetchFontWithProgress(f, 10, 70, received0);
        received0 += r.received;
        doc.addFileToVFS(f.name, arrayBufferToBase64(r.buf));
        doc.addFont(f.name, 'BeVietnamPro', f.style);
      }
      setProgress(85, 'Đã tải phông chữ — đang tạo file PDF…');
    })().catch(function (e) {
      fontPromise = null; // lỗi thì lần sau bấm lại sẽ thử tải lại
      throw e;
    });
    return fontPromise;
  }

  $('tpc-text').addEventListener('input', function () {
    $('tpc-count').textContent = ($('tpc-text').value || '').length.toLocaleString('vi-VN') + ' ký tự';
  });
  $('tpc-sample').addEventListener('click', function () {
    $('tpc-title').value = 'Đơn xin nghỉ phép';
    $('tpc-text').value = 'Kính gửi: Ban giám đốc Công ty.\n\nTôi tên là Nguyễn Văn An, nhân viên Phòng Kinh doanh. Tôi viết đơn này xin nghỉ phép 2 ngày, từ ngày 01/12/2026 đến ngày 02/12/2026, vì việc gia đình.\n\nTrong thời gian nghỉ, tôi đã bàn giao công việc cho chị Trần Thị Bình. Tôi xin chịu trách nhiệm về các công việc đã bàn giao và sẽ trở lại làm việc vào ngày 03/12/2026.\n\nTôi rất mong Ban giám đốc xem xét và chấp thuận.\n\nNgười viết đơn\nNguyễn Văn An';
    $('tpc-count').textContent = $('tpc-text').value.length.toLocaleString('vi-VN') + ' ký tự';
    clearError();
    toast('Đã điền ví dụ — bấm Tạo file PDF để xem.');
  });

  $('tpc-go').addEventListener('click', async function () {
    const text = ($('tpc-text').value || '').trim();
    if (!text) { showError('Hãy gõ nội dung văn bản trước.'); return; }
    clearError();
    $('tpc-out').innerHTML = '';
    const btn = $('tpc-go');
    const setBusy = U.setBusy;
    if (setBusy) setBusy(btn, true, 'Đang tạo PDF…');
    btn.disabled = true;
    try {
      const jspdfNS = (typeof window !== 'undefined' && window.jspdf) || null;
      if (!jspdfNS || !jspdfNS.jsPDF) throw new Error('Thư viện tạo PDF (jsPDF) chưa tải được — kiểm tra mạng rồi tải lại trang.');
      const title = ($('tpc-title').value || '').trim();
      const fontSize = +$('tpc-size').value || 14;
      const doc = new jspdfNS.jsPDF({ unit: 'mm', format: 'a4' });
      setProgress(10, 'Đang tải phông chữ Việt (khoảng 270 KB, chỉ tải 1 lần)…');
      await loadFonts(doc);
      setProgress(88, 'Đang xếp chữ lên trang A4…');
      const MARGIN = 20;
      const PAGE_W = 210, PAGE_H = 297;
      const MAX_W = PAGE_W - MARGIN * 2;
      const BOTTOM = PAGE_H - MARGIN;
      let y = MARGIN + 4;
      if (title) {
        doc.setFont('BeVietnamPro', 'bold');
        doc.setFontSize(17);
        const titleLines = doc.splitTextToSize(title, MAX_W);
        doc.text(titleLines, PAGE_W / 2, y, { align: 'center' });
        y += titleLines.length * 7.5 + 6;
      }
      doc.setFont('BeVietnamPro', 'normal');
      doc.setFontSize(fontSize);
      doc.setLineHeightFactor(1.5);
      const lineH = fontSize * 1.5 * 0.3528; // mm
      const lines = doc.splitTextToSize(text, MAX_W);
      for (let i = 0; i < lines.length; i++) {
        if (y + lineH > BOTTOM) { doc.addPage(); y = MARGIN + 4; }
        doc.text(lines[i], MARGIN, y);
        y += lineH;
      }
      const pages = doc.getNumberOfPages();
      resultBlob = doc.output('blob');
      setProgress(100, 'Xong!');
      if (resultURL) URL.revokeObjectURL(resultURL);
      resultURL = URL.createObjectURL(resultBlob);
      const fname = (title ? slugify(title) : 'van-ban') + '.pdf';
      $('tpc-out').innerHTML = '<div class="result">' +
        '<div class="result-row"><span>Khổ giấy</span><strong>A4 — lề 20 mm</strong></div>' +
        '<div class="result-row"><span>Số trang</span><strong>' + pages + ' trang</strong></div>' +
        '<div class="result-row"><span>Dung lượng file</span><strong>' + fmtBytes(resultBlob.size) + '</strong></div></div>' +
        '<div class="m2-result-actions"><button type="button" class="btn btn-primary" id="tpc-dl">Tải file PDF (' + fname + ')</button><button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button><button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button><button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button></div>';
      $('tpc-dl').addEventListener('click', function () {
        const a = document.createElement('a');
        a.href = resultURL; a.download = fname; a.click();
        toast('Đã tải file PDF.');
      });
      hideProgress();
      toast('Đã tạo file PDF.');
    } catch (e) {
      hideProgress();
      const msg = (e && e.message) ? e.message : 'Đã có lỗi xảy ra.';
      showError('Không tạo được file PDF: ' + escHtml(msg) + ' Hãy thử lại hoặc tải lại trang.');
    } finally {
      if (setBusy) setBusy(btn, false);
      btn.disabled = false;
    }
  });
}
