/* ============================================================================
   Tiện Ích Hub — app.js
   Chạy trên mọi trang (script defer). Không phụ thuộc thư viện ngoài.
   - Nav mobile, toggle dark mode (lưu localStorage)
   - Tìm kiếm + lọc công cụ theo hạng mục (trang /cong-cu/, đọc ?q=/?cat=):
     dùng chỉ mục /data/search-index.json (build sinh) khi tải được, xếp
     hạng khớp tên > đồng nghĩa > từ khóa > mô tả; lỗi thì dự phòng lọc
     từ thẻ đã render sẵn
   - Tìm kiếm hero + lọc lưới trang chủ (trang chủ)
   - Modal tìm kiếm ⌘K toàn trang (đổi giao diện 18/11, phong cách 21st.dev):
     mở bằng Ctrl/Cmd+K hoặc nút #header-search-btn, dùng chung chỉ mục +
     xếp hạng với ô tìm kiếm hero, kết quả nhóm theo hạng mục
   - Tabs chung (chỉ các .tab có data-tab-target — không can thiệp tab riêng
     bên trong công cụ)
   - Trang chủ: dải dữ liệu hôm nay (crypto, vàng, tỷ giá, xổ số, lịch âm, tử vi),
     Điểm báo (tin nổi bật + tab chủ đề) + xếp hạng — SSR lúc build, JS chỉ
     render lại khi JSON mới hơn SSR, lỗi thì giữ SSR + nút thử lại
   - Trang Ủng hộ: mã VietQR + tải PNG + chép số tài khoản
   - Linh vật (gộp từ mascot.js vào cuối file): window.UHMascot
   - window.UH: tiện ích dùng chung cho mọi công cụ (xem CONTRACT.md)
     + trợ giúp trải nghiệm (worker C, 18/11): markFieldError /
     clearFieldErrors / focusField (lỗi theo từng ô), copyResult /
     bindCopyButtons (chép kết quả render động), setBusy / withBusy
     (trạng thái bận), fillExample (nút "Điền ví dụ")
   File này cũng chạy được dưới Node (để kiểm tra UH): khi đó phần DOM
   được bỏ qua, UH được export qua module.exports.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- Helpers ---------------- */

  // Chuẩn hóa chuỗi để tìm kiếm không dấu: "tính phần trăm" khớp "tinh phan tram".
  // Lưu ý: đ/Đ không tách được bằng NFD nên thay tay.
  function norm(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  function escHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------------- CRC16-CCITT (poly 0x1021, init 0xFFFF) ---------------- */
  // Vector kiểm tra chuẩn: CRC16-CCITT-FALSE("123456789") = 0x29B1.
  function crc16ccitt(str) {
    var crc = 0xffff;
    for (var i = 0; i < str.length; i++) {
      crc ^= (str.charCodeAt(i) << 8);
      for (var j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xffff;
      }
    }
    return crc;
  }

  // Độ dài theo chuẩn EMV tính bằng BYTE (UTF-8), không phải số ký tự.
  function byteLen(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      n += c < 0x80 ? 1 : c < 0x800 ? 2 : 3;
    }
    return n;
  }

  // Trường TLV: ID (2 ký tự) + độ dài (2 ký tự) + giá trị.
  function tlv(id, value) {
    return id + String(byteLen(value)).padStart(2, '0') + value;
  }

  // Bỏ dấu tiếng Việt nhưng GIỮ nguyên hoa/thường (dùng cho memo VietQR).
  function stripDiacritics(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  /* ---------------- VietQR (EMVCo + NAPAS) ---------------- */
  // Cấu trúc chuẩn (TLV lồng nhau, MỌI độ dài đều tính động từ dữ liệu thật):
  //   00 "01"
  //   01 "12" nếu có số tiền (QR động) | "11" nếu không có số tiền (QR tĩnh)
  //   38 { 00 "A000000727", 01 { 00 BIN, 01 số TK }, 02 "QRIBFTTA" }
  //   53 "704" (VND)
  //   54 số tiền (chỉ khi có số tiền)
  //   58 "VN"
  //   62 { 08 nội dung } (chỉ khi có memo; memo PHẢI bỏ dấu, viết hoa)
  //   63 CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF)
  // CHỈ CÓ 1 BIN trong payload — không có chuỗi cố định nào khác.
  // Test vector (xem /tmp/test-uh.cjs): BIN 970414, TK 883866666, 50000₫,
  // không memo -> ...630494B2; tĩnh (không số tiền) -> ...6304A99A.
  // Chấp nhận cả 2 cách gọi (tương thích công cụ đã viết):
  //   vietqrPayload({ bin, account, amount, memo })
  //   vietqrPayload(bin, account, amount, memo)
  //   — và các tên tham số khác: bankBin, accountNumber, content.
  function vietqrPayload(opts, accountArg, amountArg, memoArg) {
    var o = {};
    if (typeof opts === 'string') {
      o = { bin: opts, account: accountArg, amount: amountArg, memo: memoArg };
    } else if (opts && typeof opts === 'object') {
      o = opts;
    }
    var bin = String(o.bin || o.bankBin || '');
    var account = String(o.account || o.accountNumber || '');
    var memo = o.memo != null && o.memo !== '' ? String(o.memo) : (o.content != null ? String(o.content) : '');
    // Memo PHẢI bỏ dấu tiếng Việt trước khi đưa vào payload (chuẩn VietQR).
    memo = stripDiacritics(memo).toUpperCase().trim();
    var amount = '';
    if (o.amount != null && o.amount !== '' && Number(o.amount) > 0) {
      amount = String(o.amount).replace(/[^0-9]/g, '');
    }
    var inner = tlv('00', bin) + tlv('01', account);
    var merchantInfo = tlv('00', 'A000000727') + tlv('01', inner) + tlv('02', 'QRIBFTTA');
    var payload = tlv('00', '01') + tlv('01', amount ? '12' : '11') + tlv('38', merchantInfo) + tlv('53', '704');
    if (amount) payload += tlv('54', amount);
    payload += tlv('58', 'VN');
    if (memo) payload += tlv('62', tlv('08', memo));
    payload += '6304';
    payload += crc16ccitt(payload).toString(16).toUpperCase().padStart(4, '0');
    return payload;
  }

  /* ---------------- QR canvas (dùng qrcode-generator đã vendored) ---------------- */
  // renderQR(canvasEl, text) — cũng chấp nhận renderQR(text, canvasEl).
  function renderQR(a, b) {
    var canvasEl = a, text = b;
    if (typeof a === 'string' && b && typeof b === 'object') { canvasEl = b; text = a; }
    if (!canvasEl || typeof canvasEl.getContext !== 'function') return false;
    if (typeof qrcode !== 'function') return false;
    try {
      // Dùng bộ mã hóa UTF-8 để nội dung tiếng Việt (nếu có) không bị vỡ.
      if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
        qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      }
      var qr = qrcode(0, 'M');
      qr.addData(String(text));
      qr.make();
      var count = qr.getModuleCount();
      var quiet = 4; // vùng trống quanh mã (chuẩn QR)
      var scale = 8;
      var size = (count + quiet * 2) * scale;
      canvasEl.width = size;
      canvasEl.height = size;
      var ctx = canvasEl.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#12283e';
      for (var r = 0; r < count; r++) {
        for (var c = 0; c < count; c++) {
          if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------------- Định dạng số / ngày ---------------- */

  // fmtVND(1234567) -> "1.234.567 ₫"
  function fmtVND(n) {
    var num = Number(n);
    if (!isFinite(num)) return '';
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(num)) + ' ₫';
  }

  // fmtNum(1234.567, 2) -> "1.234,57"
  function fmtNum(n, digits) {
    var num = Number(n);
    if (!isFinite(num)) return '';
    var d = digits == null ? 0 : digits;
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }).format(num);
  }

  // Hiểu cả "30.000.000" (dấu chấm = phân cách nghìn) và "30,5" (dấu phẩy = thập phân).
  function parseNum(str) {
    if (typeof str === 'number') return str;
    var s = String(str == null ? '' : str).trim().replace(/[\s₫đ]/g, '');
    if (!s) return NaN;
    var hasDot = s.indexOf('.') !== -1;
    var hasComma = s.indexOf(',') !== -1;
    if (hasDot && hasComma) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (hasComma) {
      s = s.replace(',', '.');
    } else if (/^\d{1,3}(\.\d{3})+$/.test(s) || /^\d+\.\d{3}$/.test(s)) {
      s = s.replace(/\./g, '');
    }
    return Number(s);
  }

  // "2026-11-17" theo giờ địa phương.
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /* ---------------- Toast / copy ---------------- */

  var toastTimer = null;
  function toast(msg) {
    if (typeof document === 'undefined') return;
    var el = document.getElementById('uh-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'uh-toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  function fallbackCopy(str) {
    try {
      var ta = document.createElement('textarea');
      ta.value = str;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) {
      return false;
    }
  }

  // Trả về Promise<boolean>. Sao chép thành công thì kêu "ting" thương
  // hiệu (playTing — cùng hệ thống âm thanh với mục Giáo viên).
  function copyText(str) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(str)
        .then(function () { playTing(); return true; })
        .catch(function () { var ok = fallbackCopy(str); if (ok) playTing(); return ok; });
    }
    var ok = fallbackCopy(str);
    if (ok) playTing();
    return Promise.resolve(ok);
  }

  /* ---------------- Trợ giúp trải nghiệm công cụ (worker C, 18/11) ---------------- */
  // Chuẩn dùng chung cho mọi công cụ: lỗi nêu rõ từng ô, nút chép trong
  // kết quả render động, trạng thái bận, nút "Điền ví dụ". Các hàm này
  // chỉ chạy trong trình duyệt; dưới Node thì no-op an toàn.

  // Đánh dấu một ô nhập sai: viền đỏ (.field-error) + dòng chữ đỏ
  // (.field-msg, role=alert) ngay dưới ô. msg phải nêu rõ ô nào sai +
  // cần nhập thế nào, Ví dụ: "Ô Số kWh chưa đúng — nhập số từ 0 trở lên,
  // ví dụ 250." Trả về el (hoặc null nếu không có el).
  function markFieldError(el, msg) {
    if (!el || typeof document === 'undefined') return null;
    el.classList.add('field-error');
    el.setAttribute('aria-invalid', 'true');
    var field = el.closest ? el.closest('.field') : null;
    var scope = field || el.parentNode;
    if (!scope) return el;
    var existing = scope.querySelector('.field-msg');
    if (existing) { existing.textContent = msg || ''; return el; }
    var p = document.createElement('p');
    p.className = 'field-msg';
    p.setAttribute('role', 'alert');
    p.textContent = msg || '';
    // Ô nhập có đơn vị (.input-unit) thì đặt dòng lỗi sau cả cụm.
    var anchor = (el.parentNode && el.parentNode.classList && el.parentNode.classList.contains('input-unit'))
      ? el.parentNode : el;
    if (anchor.nextSibling) scope.insertBefore(p, anchor.nextSibling);
    else scope.appendChild(p);
    return el;
  }

  // Xóa mọi đánh dấu lỗi trong root — gọi đầu mỗi lần tính.
  function clearFieldErrors(root) {
    if (!root || !root.querySelectorAll) return;
    var els = root.querySelectorAll('.field-error');
    for (var i = 0; i < els.length; i++) {
      els[i].classList.remove('field-error');
      els[i].removeAttribute('aria-invalid');
    }
    var msgs = root.querySelectorAll('.field-msg');
    for (var j = 0; j < msgs.length; j++) {
      if (msgs[j].parentNode) msgs[j].parentNode.removeChild(msgs[j]);
    }
  }

  // Đưa con trỏ về ô đầu tiên sai (cuộn tới + focus).
  function focusField(el) {
    if (!el) return;
    try {
      if (el.scrollIntoView) el.scrollIntoView({ block: 'center' });
      el.focus({ preventScroll: true });
    } catch (e) {
      try { el.focus(); } catch (e2) { /* bỏ qua */ }
    }
  }

  // Chép văn bản rồi báo bằng toast. Trả về Promise<boolean>.
  function copyResult(text, doneMsg) {
    return copyText(text || '').then(function (ok) {
      toast(ok ? (doneMsg || 'Đã chép kết quả') : 'Không chép được — hãy chép tay');
      return ok;
    });
  }

  // Gắn nút chép [data-copy] trong root — dùng cho nút chép nằm trong
  // kết quả render ĐỘNG (setupCopyButtons chỉ gắn nút có sẵn lúc tải
  // trang). Nút đã gắn rồi thì bỏ qua (data-uh-copy-bound).
  function bindCopyButtons(root) {
    if (!root || !root.querySelectorAll) return;
    var btns = root.querySelectorAll('[data-copy]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        if (btn.getAttribute('data-uh-copy-bound') === '1') return;
        btn.setAttribute('data-uh-copy-bound', '1');
        btn.addEventListener('click', function () {
          var value = btn.getAttribute('data-copy') || '';
          var msg = btn.getAttribute('data-copy-msg') || 'Đã chép kết quả';
          copyResult(value, msg);
        });
      })(btns[i]);
    }
  }

  // Trạng thái bận cho nút tính: spinner (.is-busy) + chống bấm đúp.
  // busyLabel (tùy chọn) thay tạm chữ trên nút lúc bận.
  function setBusy(btn, busy, busyLabel) {
    if (!btn) return;
    if (busy) {
      if (btn.getAttribute('data-uh-busy') === '1') return;
      btn.setAttribute('data-uh-busy', '1');
      btn.setAttribute('data-uh-label', btn.textContent);
      btn.classList.add('is-busy');
      btn.disabled = true;
      if (busyLabel) btn.textContent = busyLabel;
    } else {
      if (btn.getAttribute('data-uh-busy') !== '1') return;
      btn.removeAttribute('data-uh-busy');
      btn.classList.remove('is-busy');
      btn.disabled = false;
      var label = btn.getAttribute('data-uh-label');
      if (label != null) btn.textContent = label;
      btn.removeAttribute('data-uh-label');
    }
  }

  // Chạy fn sau một nhịp vẽ, giữ trạng thái bận ít nhất minMs (mặc định
  // 150ms) để người dùng thấy nút đang xử lý — tính toán vốn tức thì,
  // không spinner thì bấm nút không có phản hồi gì. fn chạy đồng bộ.
  function withBusy(btn, fn, minMs) {
    if (typeof fn !== 'function') return;
    var min = minMs == null ? 150 : minMs;
    setBusy(btn, true);
    var start = Date.now();
    function done() {
      var wait = Math.max(0, min - (Date.now() - start));
      setTimeout(function () { setBusy(btn, false); }, wait);
    }
    function run() {
      try { fn(); } finally { done(); }
    }
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(function () { setTimeout(run, 0); });
    } else {
      setTimeout(run, 0);
    }
  }

  // Điền ví dụ: values = {id: giá trị} (checkbox: true/false), rồi bấm
  // nút tính (nếu truyền calcBtn). Gửi sự kiện input/change để
  // tool-state.js đồng bộ URL. Xóa đánh dấu lỗi cũ trước khi điền.
  function fillExample(root, values, calcBtn) {
    if (!root || !values) return;
    clearFieldErrors(root);
    Object.keys(values).forEach(function (id) {
      var el = root.querySelector('#' + id);
      if (!el) return;
      var v = values[id];
      if (el.type === 'checkbox') {
        el.checked = !!v;
      } else {
        el.value = v == null ? '' : String(v);
      }
      try {
        if (typeof Event === 'function') {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } catch (e) { /* bỏ qua */ }
    });
    if (calcBtn) {
      setTimeout(function () { try { calcBtn.click(); } catch (e) { /* bỏ qua */ } }, 30);
    }
  }

  /* ---------------- Thành phần dùng chung MẪU 2 (19/11/2026) ---------------- */
  // Build chỉ nhúng init() của mỗi công cụ (toString) nên thành phần dùng
  // chung KHÔNG được để trong file công cụ — đặt ở đây (window.UH.m2) để
  // init() gọi tới. Các hàm chỉ chạm DOM khi được gọi, không chạy lúc nạp.
  // Công cụ MẪU 2 chỉ cần khai báo: ô nhập (body) + công thức (M2_CALC) +
  // cấu hình thẻ kết quả (m2RenderResult) — không tự viết lại nút Chép /
  // Zalo / Tải ảnh, bảng từng bước hay thanh dính đáy.
  function m2Debounce(fn, ms) {
    var timer = null;
    return function () {
      var args = arguments;
      var self = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, ms == null ? 400 : ms);
    };
  }
  function m2Esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Ô tiền tự thêm dấu chấm phân cách nghìn khi gõ (gõ 45000000 →
  // 45.000.000), giữ nguyên vị trí con trỏ.
  function m2BindMoneyFormat(el) {
    if (!el) return;
    function format() {
      var digits = el.value.replace(/[^\d]/g, '');
      el.value = digits ? fmtNum(parseInt(digits, 10)) : '';
    }
    el.addEventListener('blur', format);
    el.addEventListener('input', function () {
      var pos = el.selectionStart == null ? el.value.length : el.selectionStart;
      var digitsBefore = el.value.slice(0, pos).replace(/[^\d]/g, '').length;
      format();
      var seen = 0, i = 0;
      while (i < el.value.length && seen < digitsBefore) { if (/\d/.test(el.value[i])) seen++; i++; }
      try { el.setSelectionRange(i, i); } catch (e) { /* bỏ qua */ }
    });
  }
  // Bộ tăng/giảm − số + (ô số chỉ đọc): gửi sự kiện input/change để
  // liveCalc + tool-state (đồng bộ URL) chạy như khi gõ tay.
  function m2BindStepper(minusBtn, input, plusBtn, opts) {
    if (!minusBtn || !input || !plusBtn) return;
    var o = opts || {};
    var min = o.min == null ? 0 : o.min;
    var max = o.max == null ? Infinity : o.max;
    function set(n) {
      var v = Math.max(min, Math.min(max, Math.floor(n) || 0));
      input.value = String(v);
      try {
        if (typeof Event === 'function') {
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } catch (e) { /* bỏ qua */ }
    }
    minusBtn.addEventListener('click', function () { set(parseInt(input.value, 10) - 1); });
    plusBtn.addEventListener('click', function () { set(parseInt(input.value, 10) + 1); });
  }
  // Vẽ thẻ kết quả MẪU 2: số chính + dòng %, 3 dòng chi tiết, bảng từng
  // bước (thu gọn), hàng 3 nút Chép / Chia sẻ Zalo / Tải ảnh.
  // cfg: { label, value, pctLine, rows: [{label, value, strong}],
  //   steps: [{label, sub, amount}] | null, note,
  //   copyText, copyMsg, shareTitle,
  //   image: { title, file, heroLabel, heroValue, pctLine,
  //     rows: [[label, value, strong]] } | null }
  // state: { stepsOpen } — công cụ giữ, để bảng bước không tự đóng khi render lại.
  function m2RenderResult(outEl, cfg, state) {
    if (!outEl) return;
    var st = state || {};
    var stepsHtml = '';
    if (cfg.steps && cfg.steps.length) {
      var rowsHtml = cfg.steps.map(function (s, i) {
        return '<tr><td class="m2-steps-no">' + (i + 1) + '</td><td>' + m2Esc(s.label) + (s.sub ? '<small>' + m2Esc(s.sub) + '</small>' : '') + '</td><td>' + m2Esc(s.amount) + '</td></tr>';
      }).join('');
      stepsHtml = '<button type="button" class="m2-steps-toggle" aria-expanded="' + (st.stepsOpen ? 'true' : 'false') + '">' + (st.stepsOpen ? 'Ẩn cách tính từng bước' : 'Xem cách tính từng bước') + '</button>'
        + '<div class="m2-steps"' + (st.stepsOpen ? '' : ' hidden') + '><table class="m2-steps-table"><tbody>' + rowsHtml + '</tbody></table></div>';
    }
    var detailHtml = (cfg.rows || []).map(function (r) {
      return '<div class="result-row"><span>' + m2Esc(r.label) + '</span>' + (r.strong ? '<strong>' + m2Esc(r.value) + '</strong>' : '<strong>' + m2Esc(r.value) + '</strong>') + '</div>';
    }).join('');
    outEl.innerHTML = '<div class="result m2-result">'
      + '<p class="m2-result-label">' + m2Esc(cfg.label) + '</p>'
      + '<div class="m2-result-value">' + m2Esc(cfg.value) + '</div>'
      + (cfg.pctLine ? '<p class="m2-result-pct">' + m2Esc(cfg.pctLine) + '</p>' : '')
      + (detailHtml ? '<div class="m2-result-rows">' + detailHtml + '</div>' : '')
      + stepsHtml
      + (cfg.note ? '<p class="m2-result-note">' + m2Esc(cfg.note) + '</p>' : '')
      + '<div class="m2-result-actions">'
      + '<button type="button" class="m2-action-btn m2-action-btn-copy">Chép</button>'
      + '<button type="button" class="m2-action-btn m2-action-btn-share">Chia sẻ Zalo</button>'
      + (cfg.image ? '<button type="button" class="m2-action-btn m2-action-btn-download">Tải ảnh</button>' : '')
      + '</div></div>';
    var stepsBtn = outEl.querySelector('.m2-steps-toggle');
    if (stepsBtn) stepsBtn.addEventListener('click', function () {
      st.stepsOpen = !st.stepsOpen;
      var box = outEl.querySelector('.m2-steps');
      if (box) box.hidden = !st.stepsOpen;
      stepsBtn.setAttribute('aria-expanded', st.stepsOpen ? 'true' : 'false');
      stepsBtn.textContent = st.stepsOpen ? 'Ẩn cách tính từng bước' : 'Xem cách tính từng bước';
    });
    var copyBtn = outEl.querySelector('.m2-action-btn-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      if (!cfg.copyText) return;
      var p = copyText(cfg.copyText);
      if (p && p.then) p.then(function (ok) { if (ok) toast(cfg.copyMsg || 'Đã chép kết quả'); });
    });
    var shareBtn = outEl.querySelector('.m2-action-btn-share');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      if (!cfg.copyText) return;
      var url = window.location.href;
      // Web Share API (điện thoại: mở bảng chia sẻ của máy, có Zalo nếu
      // đã cài); máy tính không có API thì mở link chia sẻ Zalo với URL
      // trang hiện tại (URL đã chứa số đang tính nhờ tool-state).
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: cfg.shareTitle || document.title, text: cfg.copyText, url: url }).catch(function () { /* người dùng hủy chia sẻ */ });
      } else if (typeof window !== 'undefined') {
        window.open('https://zalo.me/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
      }
    });
    var dlBtn = outEl.querySelector('.m2-action-btn-download');
    if (dlBtn && cfg.image) dlBtn.addEventListener('click', function () { m2DownloadImage(cfg.image); });
  }
  function m2RenderEmpty(outEl, text) {
    if (!outEl) return;
    outEl.innerHTML = '<div class="m2-result-empty"><p>' + m2Esc(text || 'Nhập số để xem kết quả tính.') + '</p></div>';
  }
  // Ảnh kết quả vẽ tay bằng canvas 880px (KHÔNG dùng html2canvas):
  // tiêu đề + số chính + dòng % + các dòng chi tiết + chân trang.
  function m2DownloadImage(cfg) {
    if (!cfg || typeof document === 'undefined') return;
    var rows = cfg.rows || [];
    var W = 880, H = 400 + rows.length * 48;
    function draw() {
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var x = c.getContext('2d');
      if (!x) return;
      x.fillStyle = '#FFFFFF';
      x.fillRect(0, 0, W, H);
      x.fillStyle = '#1747E6';
      x.fillRect(0, 0, W, 12);
      x.textBaseline = 'alphabetic';
      x.textAlign = 'left';
      x.fillStyle = '#64748B';
      x.font = '700 20px "Be Vietnam Pro", sans-serif';
      x.fillText(cfg.title || '', 48, 58);
      x.fillStyle = '#475569';
      x.font = '600 22px "Be Vietnam Pro", sans-serif';
      x.fillText(cfg.heroLabel || '', 48, 112);
      x.fillStyle = '#1747E6';
      x.font = '800 56px "Be Vietnam Pro", sans-serif';
      x.fillText(cfg.heroValue || '', 48, 178);
      if (cfg.pctLine) {
        x.fillStyle = '#64748B';
        x.font = '400 20px "Be Vietnam Pro", sans-serif';
        x.fillText(cfg.pctLine, 48, 214);
      }
      x.strokeStyle = '#DCE1EA';
      x.lineWidth = 1;
      x.beginPath(); x.moveTo(48, 244); x.lineTo(W - 48, 244); x.stroke();
      var y = 292;
      rows.forEach(function (row) {
        x.fillStyle = '#0F172A';
        x.font = (row[2] ? '800' : '600') + ' 20px "Be Vietnam Pro", sans-serif';
        x.textAlign = 'left';
        x.fillText(row[0], 48, y);
        x.fillStyle = row[2] ? '#1747E6' : '#0F172A';
        x.textAlign = 'right';
        x.fillText(row[1], W - 48, y);
        y += 48;
      });
      x.strokeStyle = '#DCE1EA';
      x.beginPath(); x.moveTo(48, y - 8); x.lineTo(W - 48, y - 8); x.stroke();
      x.fillStyle = '#64748B';
      x.font = '400 16px "Be Vietnam Pro", sans-serif';
      x.textAlign = 'left';
      x.fillText('tienichhub.io.vn  ·  Kết quả chỉ mang tính tham khảo', 48, y + 36);
      if (c.toBlob) {
        c.toBlob(function (blob) {
          if (!blob) return;
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = cfg.file || 'ket-qua.png';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
          toast('Đã tải ảnh kết quả');
        }, 'image/png');
      }
    }
    // Đợi phông Be Vietnam Pro tải xong để chữ trong ảnh đúng phông;
    // lỗi thì vẽ luôn bằng phông dự phòng.
    if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('700 20px "Be Vietnam Pro"'),
        document.fonts.load('800 56px "Be Vietnam Pro"'),
      ]).then(draw).catch(draw);
    } else {
      draw();
    }
  }
  // Thanh tóm tắt kết quả dính ở đáy (MẪU 2): hiện khi đã có kết quả mà
  // thẻ kết quả đã cuộn khuất; gồm số chính + nút Chép + nút Chi tiết
  // (cuộn lên kết quả). Ẩn khi lỗi, khi đang nhập vào ô trong công cụ
  // (để thanh không che ô đang gõ). opts: { root, resultEl, getCopyText,
  // copyMsg }. Trả { update(label, valueText), hide() }.
  function m2SetupSticky(opts) {
    var o = opts || {};
    if (typeof document === 'undefined') return { update: function () {}, hide: function () {} };
    var bar = document.createElement('div');
    bar.className = 'm2-sticky';
    bar.hidden = true;
    bar.innerHTML = '<span class="m2-sticky-value"></span>'
      + '<button type="button" class="m2-sticky-btn">Chép</button>'
      + '<button type="button" class="m2-sticky-btn m2-sticky-btn-primary">Chi tiết</button>';
    document.body.appendChild(bar);
    var valueEl = bar.querySelector('.m2-sticky-value');
    var copyBtn = bar.querySelector('.m2-sticky-btn');
    var detailBtn = bar.querySelector('.m2-sticky-btn-primary');
    var hasResult = false;
    var resultInView = true;
    var inputFocused = false;
    var lastBarGrowth = 0;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function refresh() {
      var visible = hasResult && !resultInView && !inputFocused;
      bar.hidden = !visible;
      // Đẩy nút Chat AI lên trên thanh khi thanh hiện: CSS
      // body.uh-netbar-on .aiw nâng nút lên để không đè lên thanh.
      if (document.body) {
        document.body.classList.toggle('uh-netbar-on', visible);
        // Chừa khoảng trống dưới trang khi thanh hiện để footer không bị
        // thanh che khi cuộn tận cuối: đo từ mép trên của thanh tới đáy
        // màn hình — bằng chiều cao thanh CỘNG khoảng hở dưới thanh
        // (24px desktop, 68px mobile vì thanh ngồi trên nav dưới).
        var gap = 0;
        if (visible && typeof window !== 'undefined') {
          gap = Math.ceil(window.innerHeight - bar.getBoundingClientRect().top);
        }
        var de = document.documentElement;
        var wasAtBottom = typeof window !== 'undefined' &&
          (window.scrollY + window.innerHeight >= de.scrollHeight - 10);
        var newPad = gap > 0 ? gap + 'px' : '';
        if (document.body.style.paddingBottom !== newPad) {
          var oldH = de.scrollHeight;
          document.body.style.paddingBottom = newPad;
          lastBarGrowth = Math.max(0, de.scrollHeight - oldH);
        }
        if (gap > 0 && wasAtBottom && typeof window !== 'undefined') {
          window.scrollTo(0, de.scrollHeight);
        }
      }
    }
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var text = typeof o.getCopyText === 'function' ? o.getCopyText() : '';
      if (!text) return;
      var p = copyText(text);
      if (p && p.then) p.then(function (ok) { if (ok) toast(o.copyMsg || 'Đã chép kết quả'); });
    });
    if (detailBtn) detailBtn.addEventListener('click', function () {
      var target = o.resultEl || o.scrollTarget;
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    if (o.resultEl && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        resultInView = entries[0].isIntersecting;
        refresh();
      }, { threshold: 0.1 });
      io.observe(o.resultEl);
    } else {
      resultInView = false;
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', refresh);
      // Kéo nốt tới đáy thật sau khi cuộn dừng: khi thanh hiện giữa lúc
      // đang cuộn, đích cuộn vẫn là đáy cũ, thiếu đúng khoảng trang dài
      // thêm khi thanh hiện — chờ cuộn dừng 150ms rồi kéo nốt.
      var scrollEndTimer = null;
      window.addEventListener('scroll', function () {
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(function () {
          if (bar.hidden) return;
          var de = document.documentElement;
          var shortfall = (de.scrollHeight - window.innerHeight) - window.scrollY;
          if (shortfall > 0 && Math.abs(shortfall - lastBarGrowth) <= 4) {
            window.scrollTo(0, de.scrollHeight);
          }
        }, 150);
      }, { passive: true });
    }
    // Đang nhập vào ô trong công cụ thì ẩn thanh (đừng che ô đang gõ).
    if (o.root) {
      o.root.addEventListener('focusin', function (e) {
        var t = e.target;
        if (t && t.tagName && /^(input|textarea|select)$/i.test(t.tagName)) {
          inputFocused = true;
          refresh();
        }
      });
      o.root.addEventListener('focusout', function (e) {
        var t = e.relatedTarget;
        if (t && t.tagName && /^(input|textarea|select)$/i.test(t.tagName)) return;
        inputFocused = false;
        refresh();
      });
    }
    return {
      update: function (label, valueText) {
        if (valueEl) valueEl.textContent = label + ' ' + valueText;
        hasResult = true;
        refresh();
      },
      hide: function () { hasResult = false; refresh(); },
    };
  }

  /* ---------------- Đối tượng toàn cục window.UH ---------------- */

  var UH = {
    fmtVND: fmtVND,
    fmtNum: fmtNum,
    parseNum: parseNum,
    toast: toast,
    copyText: copyText,
    todayISO: todayISO,
    vietqrPayload: vietqrPayload,
    renderQR: renderQR,
    markFieldError: markFieldError,
    clearFieldErrors: clearFieldErrors,
    focusField: focusField,
    copyResult: copyResult,
    bindCopyButtons: bindCopyButtons,
    setBusy: setBusy,
    withBusy: withBusy,
    fillExample: fillExample,
    // Thành phần dùng chung MẪU 2 (trang công cụ chuẩn, 19/11/2026):
    // thẻ kết quả + bảng từng bước + 3 nút + thanh dính đáy + ô tiền.
    m2: {
      debounce: m2Debounce,
      bindMoneyFormat: m2BindMoneyFormat,
      bindStepper: m2BindStepper,
      renderResult: m2RenderResult,
      renderEmpty: m2RenderEmpty,
      downloadImage: m2DownloadImage,
      setupSticky: m2SetupSticky,
    },
    // Hàm nội bộ, chỉ để kiểm tra (không dùng trong công cụ):
    _crc16ccitt: crc16ccitt,
    _norm: norm
  };
  if (typeof window !== 'undefined') window.UH = UH;
  if (typeof module !== 'undefined' && module.exports) module.exports = UH;

  /* ---------------- Phần DOM: chỉ chạy trong trình duyệt ---------------- */
  if (typeof document === 'undefined') return;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // Hằng số trang Ủng hộ — PHẢI khai báo TRƯỚC khối onReady bên dưới:
  // script nạp dạng defer nên onReady chạy ngay khi thực thi tới đây,
  // nếu để sau thì initSupport() vẽ mã QR với BIN/số tài khoản rỗng.
  var SUPPORT_BIN = '970414';
  var SUPPORT_ACCOUNT = '883866666';
  var SUPPORT_MEMO = 'UNG HO TIEN ICH HUB';

  // Hằng số lịch âm + tử vi — PHẢI khai báo TRƯỚC khối onReady bên dưới:
  // script nạp dạng defer nên onReady chạy ngay khi thực thi tới đây, và
  // initLunar()/initHoroscope() tính đồng bộ (không qua fetch) nên nếu
  // để sau thì các mảng này vẫn là undefined lúc dùng. (Các hàm la*/tv*
  // là function declaration nên được hoist, chỉ các var này cần dời lên.)
  var LA_PI = Math.PI;
  var LA_TZ = 7;
  var LA_STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var LA_BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var LA_MONTH_NAMES = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười một', 'Chạp'];
  var TV_NAMES = ['Tý — Chuột', 'Sửu — Trâu', 'Dần — Hổ', 'Mão — Mèo', 'Thìn — Rồng', 'Tỵ — Rắn', 'Ngọ — Ngựa', 'Mùi — Dê', 'Thân — Khỉ', 'Dậu — Gà', 'Tuất — Chó', 'Hợi — Heo'];

  // Khóa "Dùng gần đây" + xúc xắc — PHẢI khai báo TRƯỚC khối onReady
  // bên dưới, cùng lý do như mảng lịch âm: script nạp dạng defer nên
  // onReady chạy ngay khi thực thi tới đây, recordToolVisit() chạy
  // đồng bộ và đọc VISITED_KEY — để sau thì khóa vẫn là undefined lúc
  // dùng, localStorage bị ghi 1 khóa tên là 'undefined' (lỗi tìm ra
  // 19/11 khi sửa Bàn giáo viên). visitedMigrated cũng ở đây để lần
  // migration đầu tiên không bị var gán lại false sau đó.
  var VISITED_KEY = 'uh_visited_tools';
  var DICE_LAST_KEY = 'uh_dice_last';
  var visitedMigrated = false;

  onReady(function () {
    setupNav();
    setupTheme();
    setupSoundToggle();
    setupSearchFilter();
    setupCodeMauFilter();
    setupHeroSearch();
    initHeroH1();
    initHeroRotator();
    initDiceButtons();
    // Migration khóa 'Dùng gần đây' chạy ở MỌI trang (19/11): bản cũ ghi
    // lịch sử vào khóa tên 'undefined'; nếu chỉ chạy khi mở trang công
    // cụ thì khóa cũ còn mãi trên các trang khác (Bàn giáo viên...).
    readVisited();
    recordToolVisit();
    initRecentTools();
    initCardDemos();
    initToolSound();
    initEasterEgg();
    setupSearchModal();
    setupHomeFilter();
    setupTabs();
    setupCopyButtons();
    setupPrintButtons();
    setupExampleFill();
    initHomNayTitle();
    initCrypto();
    initGold();
    initFx();
    initLottery();
    initLunar();
    initHoroscope();
    initFearGreed();
    initNewsAndHot();
    initRail();
    initSupport();
    initAiChatWidget();
  });

  // Nút "Thử với số này" trong khối ví dụ tính sẵn (SEO lô 1): build.mjs
  // sinh nút kèm data-uh-example-fill='{"fills": {id: giá trị}, "tab":
  // "#selector-tab" hoặc null}'. Bấm nút thì mở tab (nếu có), điền số
  // ví dụ vào form công cụ bằng fillExample (gửi cả sự kiện input/change
  // để tool-state đồng bộ URL), bấm nút tính chính rồi cuộn tới kết quả.
  // withBusy chạy tính sau 1 nhịp vẽ nên đợi 500ms mới cuộn.
  function setupExampleFill() {
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-uh-example-fill]') : null;
      if (!btn) return;
      var data;
      try { data = JSON.parse(btn.getAttribute('data-uh-example-fill')); } catch (err) { return; }
      var root = document.getElementById('tool-root');
      if (!root) return;
      if (data.tab) {
        var tab = root.querySelector(data.tab);
        if (tab) tab.click();
      }
      var calcBtn = root.querySelector('.tool-panel .btn-primary');
      fillExample(root, data.fills || {}, calcBtn);
      setTimeout(function () {
        // Trang MẪU 2 không có .result — cuộn lên thẻ kết quả thay thế.
        var res = root.querySelector('.result') || root.querySelector('.m2-result-card') || root;
        if (res) {
          var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          res.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }, 500);
    });
  }

  /* Nav mobile */
  function setupNav() {
    var toggle = $('#nav-toggle');
    var header = $('#site-header');
    if (!toggle || !header) return;
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
    });
  }

  /* Dark mode — lưu localStorage ('uh-theme': 'dark' | 'light') */
  function setupTheme() {
    var btn = $('#theme-toggle');
    if (!btn) return;
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('uh-theme'); } catch (e) { /* bỏ qua */ }
    btn.textContent = (saved === 'dark' || (!saved && root.getAttribute('data-theme') === 'dark')) ? '☀️' : '🌙';
    btn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') !== 'dark';
      if (dark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem('uh-theme', dark ? 'dark' : 'light'); } catch (e) { /* bỏ qua */ }
      btn.textContent = dark ? '☀️' : '🌙';
    });
  }

  /* ---------------- Nút chat AI nổi (bong bóng Messenger) ----------------
     Bản thu nhỏ của công cụ Trò chuyện AI (src/tools/hoc-tap/
     tro-chuyen-ai.js): CÙNG endpoint Pollinations, CÙNG system prompt.
     Không giới hạn số tin — chỉ nghỉ 5 giây giữa 2 lần gửi. Lịch sử
     chat lưu sessionStorage (tối đa 20 tin) để chuyển trang không mất
     đoạn chat. Không hiện trên chính trang /cong-cu/tro-chuyen-ai/
     (template.js đã không render ở đó; đây là lớp phòng thủ thứ hai). */
  function initAiChatWidget() {
    var wrap = document.getElementById('aiw');
    if (!wrap) return;
    if (/^\/cong-cu\/tro-chuyen-ai\//.test(window.location.pathname || '')) {
      wrap.remove();
      return;
    }
    var fab = document.getElementById('aiw-fab');
    var panel = document.getElementById('aiw-panel');
    var log = document.getElementById('aiw-log');
    var input = document.getElementById('aiw-input');
    var sendBtn = document.getElementById('aiw-send');
    var closeBtn = document.getElementById('aiw-close');
    if (!fab || !panel || !log || !input || !sendBtn || !closeBtn) return;
    // Trang công cụ: nút nổi thu gọn thành hình tròn chỉ có icon (hướng B
    // đợt 1) — nút pill chữ "Chat AI" 119px che mép phải ô nhập liệu trên
    // mobile (đã thấy ở ảnh chụp 390px trang Tính lương).
    if (document.querySelector('.tool-try')) wrap.classList.add('aiw-compact');

    var URL = 'https://text.pollinations.ai/openai/v1/chat/completions';
    var MODEL = 'openai';
    var SYSTEM = 'Bạn là trợ lý AI thân thiện của trang web Tiện Ích Hub (tienichhub.io.vn). Trả lời bằng tiếng Việt, trừ khi người dùng hỏi bằng ngôn ngữ khác. Trả lời ngắn gọn, rõ ràng, dễ hiểu. Không bịa số liệu, ngày tháng hay thông tin không chắc chắn — nếu không biết thì nói là không biết. Không tự nhận mình là ChatGPT hay mô hình của công ty khác.';
    var MAX_LEN = 500;
    var MAX_CTX = 6;
    var TIMEOUT_MS = 90000;
    var MIN_GAP_MS = 5000;
    var HISTORY_KEY = 'uh_ai_chat_history';
    var MAX_HISTORY = 20;
    var WELCOME = 'Chào bạn! Tôi là trợ lý AI của Tiện Ích Hub. Hỏi tôi bất cứ điều gì nhé!';

    var history = [];
    var busy = false;
    var lastDoneAt = 0;

    // Dọn key quota cũ (đã bỏ giới hạn 20 tin/ngày từ 18/11/2026).
    try { localStorage.removeItem('uh_ai_chat_quota'); } catch (e) { /* bỏ qua */ }

    function loadHistory() {
      try {
        var raw = sessionStorage.getItem(HISTORY_KEY);
        if (!raw) return [];
        var arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr.filter(function (m) {
          return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
        }).slice(-MAX_HISTORY);
      } catch (e) { return []; }
    }

    function saveHistory() {
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
      } catch (e) { /* sessionStorage không khả dụng */ }
    }

    function escHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Render Markdown-lite (copy từ công cụ Trò chuyện AI): escape HTML
    // trước rồi mới đổi **đậm**, *nghiêng*, `code`, đầu dòng "- " thành •.
    function mdLite(s) {
      var t = escHtml(s);
      t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
      t = t.replace(/^[-*] (.+)$/gm, '• $1');
      return t;
    }

    function bubble(role, text, kind) {
      var div = document.createElement('div');
      // role 'assistant' (tin khôi phục từ sessionStorage) cũng là tin AI:
      // chỉ tin người dùng mới không render Markdown.
      var isUser = role === 'user';
      div.className = 'aiw-msg' + (isUser ? ' aiw-msg-user' : ' aiw-msg-ai') + (kind ? ' aiw-msg-' + kind : '');
      div.innerHTML = (!isUser && !kind) ? mdLite(text) : escHtml(text);
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      return div;
    }

    function updateInputState() {
      input.disabled = busy;
      sendBtn.disabled = busy;
      input.placeholder = 'Nhập câu hỏi…';
    }

    function setBusy(v) {
      busy = v;
      updateInputState();
    }

    function openPanel() {
      panel.hidden = false;
      wrap.classList.add('aiw-open');
      fab.setAttribute('aria-expanded', 'true');
      applyHidden();
      updateInputState();
      input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      wrap.classList.remove('aiw-open');
      fab.setAttribute('aria-expanded', 'false');
      applyHidden();
    }

    function send(text) {
      var msg = (text || '').trim();
      if (!msg || busy) return;
      if (msg.length > MAX_LEN) {
        bubble('ai', 'Câu hỏi dài quá 500 ký tự rồi, bạn rút ngắn lại nhé.', 'error');
        return;
      }
      if (Date.now() - lastDoneAt < MIN_GAP_MS) {
        bubble('ai', 'Từ từ đã — chờ vài giây rồi gửi tiếp nhé.', 'error');
        return;
      }
      bubble('user', msg);
      history.push({ role: 'user', content: msg });
      saveHistory();
      input.value = '';
      setBusy(true);
      var typing = bubble('ai', 'AI đang trả lời…', 'typing');
      var messages = [{ role: 'system', content: SYSTEM }].concat(history.slice(-MAX_CTX));
      // AbortSignal.timeout() không có trên trình duyệt cũ — không có thì
      // bỏ timeout chứ không để lỗi văng ra ngoài làm kẹt trạng thái bận.
      var signal = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout)
        ? AbortSignal.timeout(TIMEOUT_MS)
        : undefined;
      // AI miễn phí hay nghẽn (429/503) hoặc trả lời chậm: chờ 15 giây
      // rồi tự gửi lại 1 lần, người dùng không phải bấm lại.
      function trySend(attempt) {
        fetch(URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: MODEL, messages: messages, temperature: 0.3, max_tokens: 1024 }),
          signal: signal
        }).then(function (res) {
          if (!res.ok) throw new Error((res.status === 429 || res.status === 503) ? 'busy' : 'other');
          return res.json();
        }).then(function (data) {
          var reply = data && data.choices && data.choices[0] && data.choices[0].message
            ? (data.choices[0].message.content || '').trim()
            : '';
          if (!reply) throw new Error('other');
          typing.remove();
          setBusy(false);
          lastDoneAt = Date.now();
          bubble('ai', reply);
          history.push({ role: 'assistant', content: reply });
          saveHistory();
          updateInputState();
        }).catch(function (e) {
          var kind = (e && e.message) || '';
          if (attempt === 0 && kind !== 'other') {
            typing.textContent = 'AI đang bận, đang thử lại…';
            setTimeout(function () { trySend(1); }, 15000);
            return;
          }
          typing.remove();
          setBusy(false);
          lastDoneAt = Date.now();
          // Lần gửi lỗi: bỏ tin vừa gửi khỏi lịch sử.
          history.pop();
          saveHistory();
          var text = kind === 'busy'
            ? 'AI miễn phí đang đông người dùng, bạn chờ ít giây rồi gửi lại nhé.'
            : kind === 'other'
              ? 'AI trả lời lỗi, thử lại sau ít giây nhé.'
              : 'Không kết nối được, kiểm tra mạng rồi thử lại nhé.';
          bubble('ai', text, 'error');
        });
      }
      trySend(0);
    }

    fab.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });
    sendBtn.addEventListener('click', function () { send(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); send(input.value); }
    });
    wrap.querySelectorAll('#aiw-suggest .chip').forEach(function (btn) {
      btn.addEventListener('click', function () { send(btn.getAttribute('data-q')); });
    });

    // Nút nổi tự ẩn để khỏi đè nội dung (đợt sửa UX 18/11): ẩn trong lúc
    // cuộn (hiện lại sau khi dừng cuộn ~1 giây) và khi đang nhập vào ô
    // khác (input/textarea/select bên ngoài khung chat); không ẩn khi
    // khung chat đang mở. CSS .aiw-hidden làm mờ + vô hiệu bấm.
    var scrollTimer = null;
    var hiddenByScroll = false;
    var hiddenByFocus = false;
    function applyHidden() {
      var open = !panel.hidden;
      wrap.classList.toggle('aiw-hidden', !open && (hiddenByScroll || hiddenByFocus));
    }
    window.addEventListener('scroll', function () {
      if (panel.hidden) { hiddenByScroll = true; applyHidden(); }
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { hiddenByScroll = false; applyHidden(); }, 1000);
    }, { passive: true });
    document.addEventListener('focusin', function (e) {
      var t = e.target;
      if (!t || !t.tagName) return;
      if (wrap.contains(t)) return;
      var tag = t.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) {
        hiddenByFocus = true;
        applyHidden();
      }
    });
    document.addEventListener('focusout', function (e) {
      var t = e.relatedTarget;
      // Chuyển sang ô nhập khác thì vẫn ẩn; mọi trường hợp còn lại (kể cả
      // bấm vào chính nút chat) thì hiện lại.
      if (t && t.tagName && !wrap.contains(t)) {
        var tag = t.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return;
      }
      hiddenByFocus = false;
      applyHidden();
    });

    // Khôi phục đoạn chat đang dở (chuyển trang trong cùng phiên).
    history = loadHistory();
    if (history.length > 0) {
      history.forEach(function (m) { bubble(m.role, m.content); });
    } else {
      bubble('ai', WELCOME);
    }
    updateInputState();
    wrap.hidden = false;
  }

  /* ---------------- Tìm kiếm thật: chỉ mục /data/search-index.json ---------------- */
  // Chỉ mục do build.mjs sinh (meta các công cụ + bảng đồng nghĩa, đã chuẩn
  // hóa bỏ dấu). Nạp lười (lazy) ở lần gõ đầu tiên, cache trong 1 promise.
  // Nếu tải lỗi (mạng, file thiếu) thì trả null và các ô tìm kiếm dùng
  // dự phòng: lọc từ thẻ công cụ đã render sẵn trên trang (như trước).
  var searchIndexPromise = null;
  var searchIndexData = null; // { tools, synById } khi đã tải xong
  var searchIndexFailed = false;

  function loadSearchIndex() {
    if (searchIndexData) return Promise.resolve(searchIndexData);
    if (searchIndexFailed) return Promise.resolve(null);
    if (!searchIndexPromise) {
      searchIndexPromise = fetch('/data/search-index.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var tools = (data && Array.isArray(data.tools)) ? data.tools : [];
          if (!tools.length) throw new Error('Chỉ mục rỗng');
          // Đảo bảng đồng nghĩa {từ: [id]} -> {id: [từ]} để chấm điểm theo công cụ.
          var synById = {};
          var syn = (data && data.synonyms) || {};
          Object.keys(syn).forEach(function (word) {
            (syn[word] || []).forEach(function (id) {
              (synById[id] || (synById[id] = [])).push(word);
            });
          });
          searchIndexData = { tools: tools, synById: synById };
          return searchIndexData;
        })
        .catch(function () {
          searchIndexFailed = true;
          searchIndexPromise = null;
          return null;
        });
    }
    return searchIndexPromise;
  }

  // Chấm điểm một công cụ với một từ truy vấn (đã chuẩn hóa không dấu):
  // khớp đầu tên 100 > khớp tên 80 > khớp đồng nghĩa 60/55 > từ khóa 40 > mô tả 20.
  function searchWordScore(tool, synWords, w) {
    var name = tool.nameNorm || norm(tool.name);
    if (name === w || name.indexOf(w) === 0) return 100;
    if (name.indexOf(w) !== -1) return 80;
    if (synWords) {
      for (var i = 0; i < synWords.length; i++) {
        if (synWords[i] === w || synWords[i].indexOf(w) === 0) return 60;
      }
      for (var j = 0; j < synWords.length; j++) {
        if (synWords[j].indexOf(w) !== -1) return 55;
      }
    }
    var kw = tool.keywordsNorm || norm(tool.keywords);
    if (kw.indexOf(w) !== -1) return 40;
    var desc = tool.descNorm || norm(tool.desc);
    if (desc.indexOf(w) !== -1) return 20;
    return 0;
  }

  // Xếp hạng: mọi từ trong truy vấn đều phải khớp ở đâu đó (tên/đồng nghĩa/
  // từ khóa/mô tả); điểm = tổng điểm từng từ + thưởng khi cả cụm khớp tên.
  // Trả về mảng công cụ đã xếp hạng (điểm cao trước, hòa thì theo tên).
  //
  // Phân biệt đồng âm sau khi bỏ dấu (L11, 18/11): "lương" và "lượng"
  // chuẩn hóa thành cùng một từ "luong", nên khớp substring mù quáng kéo
  // "Tính tiền vàng" (đồng nghĩa/từ khóa "lượng vàng") và "Chỉnh sửa ảnh"
  // (từ khóa "dung lượng ảnh") vào kết quả tìm "lương". Bảng đồng nghĩa
  // là bản đồ ý định đã biên tập, nên dùng nó để phân biệt:
  //  - Từ truy vấn trùng đúng một khóa đồng nghĩa (vd "lương") thì chỉ
  //    tính khớp tên hoặc khớp đồng nghĩa đúng khóa đó — khớp từ khóa/
  //    mô tả bằng substring không tính. Công cụ khớp ở TÊN vẫn giữ
  //    (vd "Tính lượng nước cần uống", "Đếm từ & thời lượng đọc").
  //  - Truy vấn trùng đúng một khóa đồng nghĩa (vd "lượng vàng") thì
  //    công cụ được gán cho khóa đó luôn đủ điều kiện (chấm như cũ),
  //    để tìm "lượng vàng" vẫn ra "Tính tiền vàng".
  //  - Từ không phải khóa đồng nghĩa chấm như cũ, nên tìm kiếm chung
  //    không đổi (vd "nước", "ảnh", "đọc" vẫn ra như trước).
  function rankSearch(index, q) {
    var words = q.split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    // Tập hợp mọi khóa đồng nghĩa (đã chuẩn hóa) — cache trên index vì
    // rankSearch chạy mỗi lần gõ phím.
    var synKeys = index._synKeys;
    if (!synKeys) {
      synKeys = {};
      Object.keys(index.synById || {}).forEach(function (id) {
        (index.synById[id] || []).forEach(function (w) { synKeys[w] = true; });
      });
      index._synKeys = synKeys;
    }
    var wholeQueryIsKey = !!synKeys[q];
    // Điểm một từ truy vấn, có phân biệt đồng âm (xem ghi chú ở trên).
    function keyAwareScore(tool, synWords, name, w) {
      if (!synKeys[w]) return searchWordScore(tool, synWords, w);
      if (name === w || name.indexOf(w) === 0) return 100;
      if (name.indexOf(w) !== -1) return 80;
      if (synWords && synWords.indexOf(w) !== -1) return 60;
      return 0;
    }
    var scored = [];
    index.tools.forEach(function (tool) {
      var synWords = index.synById[tool.id];
      var name = tool.nameNorm || norm(tool.name);
      // Công cụ được gán cho đúng khóa đồng nghĩa trùng cả truy vấn
      // (vd "Tính tiền vàng" với khóa "lượng vàng") thì chấm như cũ —
      // khớp tiền tố đồng nghĩa vẫn tính, khỏi rơi khỏi kết quả.
      var mapped = wholeQueryIsKey && synWords && synWords.indexOf(q) !== -1;
      var score = 0;
      var matchedAll = true;
      words.forEach(function (w) {
        var s = mapped
          ? searchWordScore(tool, synWords, w)
          : keyAwareScore(tool, synWords, name, w);
        if (s === 0) matchedAll = false;
        score += s;
      });
      if (!matchedAll) return;
      if (name.indexOf(q) !== -1) score += 50; // cả cụm khớp tên
      scored.push({ tool: tool, score: score });
    });
    scored.sort(function (a, b) {
      return b.score - a.score || a.tool.name.localeCompare(b.tool.name, 'vi');
    });
    return scored.map(function (s) { return s.tool; });
  }

  /* Tìm kiếm + lọc công cụ (trang /cong-cu/) */
  function setupSearchFilter() {
    var input = $('#tool-search');
    var grid = $('#tool-grid');
    if (!input || !grid) return;
    var cards = $all('.catalog-card', grid);
    var empty = $('#tool-empty');
    var count = $('#tool-count');
    // Khối thẻ hạng mục + dòng trạng thái lọc: khi đang lọc (chọn hạng mục
    // hoặc gõ tìm) thì ẩn 11 thẻ hạng mục để kết quả nhảy lên ngay đầu
    // trang, khỏi bắt người dùng kéo qua cả dãy thẻ mới thấy thứ cần tìm.
    var catSection = $('#cat-section');
    var chipRow = $('#filter-chips');
    var statusLine = $('#filter-status');
    var statusText = $('#filter-status-text');
    var clearBtn = $('#filter-clear');
    var origCountText = count ? count.textContent : '';
    var activeCat = 'all';

    // Đồng bộ URL với trạng thái lọc hiện tại (replaceState, không thêm
    // lịch sử) để link lọc chia sẻ được và tải lại trang không bị lệch.
    function syncUrl() {
      try {
        if (!window.history || !window.history.replaceState) return;
        var p = new URLSearchParams();
        if (activeCat !== 'all') p.set('cat', activeCat);
        var qv = input.value.trim();
        if (qv) p.set('q', qv);
        var qs = p.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
      } catch (e) { /* trình duyệt cũ: bỏ qua */ }
    }

    // Chuẩn hóa trước văn bản của mỗi thẻ để gõ tìm được nhanh (dự phòng
    // khi không có chỉ mục) + nhớ slug/thứ tự gốc để xếp hạng/khôi phục.
    cards.forEach(function (card, i) {
      card._searchText = norm(
        (card.getAttribute('data-name') || '') + ' ' +
        (card.getAttribute('data-desc') || '') + ' ' +
        (card.getAttribute('data-keywords') || '')
      );
      card._origOrder = i;
      var m = (card.getAttribute('href') || '').match(/\/cong-cu\/([^/]+)\//);
      card._slug = m ? m[1] : '';
    });

    function applyFilter() {
      var q = norm(input.value.trim());
      var shown = 0;
      if (q && searchIndexData) {
        // Có chỉ mục: xếp hạng rồi hiện + sắp thẻ theo hạng.
        var ranked = rankSearch(searchIndexData, q);
        var order = {};
        ranked.forEach(function (t, i) { order[t.id] = i; });
        var visible = [];
        cards.forEach(function (card) {
          var okCat = activeCat === 'all' || card.getAttribute('data-category') === activeCat;
          var show = okCat && card._slug && order[card._slug] != null;
          card.style.display = show ? '' : 'none';
          if (show) { visible.push(card); shown++; }
        });
        visible.sort(function (a, b) { return order[a._slug] - order[b._slug]; });
        visible.forEach(function (card) { grid.appendChild(card); });
      } else {
        // Dự phòng (chưa có chỉ mục hoặc ô tìm trống): lọc chuỗi con.
        // Ô tìm trống thì khôi phục thứ tự gốc của lưới.
        if (!q) {
          cards.slice().sort(function (a, b) { return a._origOrder - b._origOrder; })
            .forEach(function (card) { grid.appendChild(card); });
        }
        cards.forEach(function (card) {
          var okCat = activeCat === 'all' || card.getAttribute('data-category') === activeCat;
          var okText = !q || card._searchText.indexOf(q) !== -1;
          var show = okCat && okText;
          card.style.display = show ? '' : 'none';
          if (show) shown++;
        });
      }
      if (empty) empty.hidden = shown !== 0;
      // Đang lọc thì ẩn dãy thẻ hạng mục (kết quả lên ngay đầu trang) và
      // hiện dòng trạng thái "Học tập — 9 công cụ" + nút Xóa lọc; hết lọc
      // thì trả lại câu đếm gốc + hiện lại thẻ hạng mục.
      var filterActive = activeCat !== 'all' || q !== '';
      if (catSection) catSection.hidden = filterActive;
      if (count) count.textContent = filterActive ? (shown + ' công cụ') : origCountText;
      if (statusLine && statusText) {
        if (filterActive) {
          var parts = [];
          if (activeCat !== 'all') {
            var activeChip = document.querySelector('.chip[data-filter="' + activeCat + '"]');
            if (activeChip) parts.push(activeChip.textContent.trim());
          }
          var qv = input.value.trim();
          if (qv) parts.push('“' + qv + '”');
          statusText.textContent = (parts.length ? parts.join(' · ') + ' — ' : '') + shown + ' công cụ';
          statusLine.hidden = false;
        } else {
          statusLine.hidden = true;
        }
      }
      syncUrl();
    }

    function onInput() {
      // Nạp lười chỉ mục ở lần gõ đầu tiên; tải xong thì lọc lại bằng
      // xếp hạng (nếu vẫn còn truy vấn).
      if (!searchIndexData && !searchIndexFailed) {
        loadSearchIndex().then(function () { applyFilter(); });
      }
      applyFilter();
    }

    input.addEventListener('input', onInput);
    $all('.chip[data-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCat = chip.getAttribute('data-filter');
        $all('.chip[data-filter]').forEach(function (c) {
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
          c.classList.toggle('chip-active', c === chip);
        });
        applyFilter();
      });
    });

    // Nút "Xóa lọc": về Tất cả + xóa ô tìm + hiện lại thẻ hạng mục.
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        activeCat = 'all';
        input.value = '';
        $all('.chip[data-filter]').forEach(function (c) {
          var isAll = c.getAttribute('data-filter') === 'all';
          c.setAttribute('aria-pressed', isAll ? 'true' : 'false');
          c.classList.toggle('chip-active', isAll);
        });
        applyFilter();
        window.scrollTo(0, 0);
      });
    }

    // Đọc tham số URL: ?q=<từ khóa> điền ô tìm kiếm + lọc ngay;
    // ?cat=<slug> chọn chip hạng mục + lọc ngay. Slug lạ thì bỏ qua.
    var fromUrlFilter = false;
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) { input.value = q; fromUrlFilter = true; }
      var cat = params.get('cat');
      if (cat) {
        var chip = document.querySelector('.chip[data-filter="' + cat + '"]');
        if (chip) {
          activeCat = cat;
          $all('.chip[data-filter]').forEach(function (c) {
            c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
            c.classList.toggle('chip-active', c === chip);
          });
          fromUrlFilter = true;
        }
      }
    } catch (e) { /* trình duyệt cũ không có URLSearchParams: bỏ qua */ }
    // Vào trang đã có ?q= thì nạp chỉ mục ngay để xếp hạng kết quả.
    if (input.value.trim() && !searchIndexData && !searchIndexFailed) {
      loadSearchIndex().then(function () { applyFilter(); });
    }
    applyFilter();
    // Vào trang đã lọc sẵn (?q=/?cat=): cuộn thẳng tới dãy chip + kết quả
    // để người dùng thấy ngay thứ mình tìm, khỏi kéo qua phần trên.
    if (fromUrlFilter && chipRow && chipRow.scrollIntoView) {
      chipRow.scrollIntoView();
    }
  }

  /* Tìm kiếm + lọc mẫu code (trang /code-mau/, nhóm E 18/11) — theo mẫu
     setupSearchFilter nhưng đơn giản hơn: không dùng chỉ mục tìm kiếm
     chung (mẫu code không nằm trong search-index.json — xem ghi chú cuối
     src/pages/code-mau.js), chỉ lọc chuỗi con không dấu trên thẻ đã render
     sẵn. Đọc ?topic=<slug> để lọc sẵn như ?cat= ở trang công cụ. */
  function setupCodeMauFilter() {
    var input = $('#code-mau-search');
    var grid = $('#code-mau-grid');
    if (!input || !grid) return;
    var cards = $all('.code-mau-card', grid);
    var empty = $('#code-mau-empty');
    var count = $('#code-mau-count');
    var statusLine = $('#code-mau-status');
    var statusText = $('#code-mau-status-text');
    var clearBtn = $('#code-mau-clear');
    var origCountText = count ? count.textContent : '';
    var activeTopic = 'all';

    cards.forEach(function (card) {
      card._searchText = norm(
        (card.getAttribute('data-name') || '') + ' ' +
        (card.getAttribute('data-desc') || '') + ' ' +
        (card.getAttribute('data-lang') || '')
      );
    });

    function syncUrl() {
      try {
        if (!window.history || !window.history.replaceState) return;
        var p = new URLSearchParams();
        if (activeTopic !== 'all') p.set('topic', activeTopic);
        var qv = input.value.trim();
        if (qv) p.set('q', qv);
        var qs = p.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
      } catch (e) { /* trình duyệt cũ: bỏ qua */ }
    }

    function applyFilter() {
      var q = norm(input.value.trim());
      var shown = 0;
      cards.forEach(function (card) {
        var okTopic = activeTopic === 'all' || card.getAttribute('data-topic') === activeTopic;
        var okText = !q || card._searchText.indexOf(q) !== -1;
        var show = okTopic && okText;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      var filterActive = activeTopic !== 'all' || q !== '';
      if (count) count.textContent = filterActive ? (shown + ' mẫu code') : origCountText;
      if (statusLine && statusText) {
        if (filterActive) {
          var parts = [];
          if (activeTopic !== 'all') {
            var activeChip = document.querySelector('.chip[data-code-filter="' + activeTopic + '"]');
            if (activeChip) parts.push(activeChip.textContent.trim());
          }
          var qv = input.value.trim();
          if (qv) parts.push('“' + qv + '”');
          statusText.textContent = (parts.length ? parts.join(' · ') + ' — ' : '') + shown + ' mẫu code';
          statusLine.hidden = false;
        } else {
          statusLine.hidden = true;
        }
      }
      syncUrl();
    }

    input.addEventListener('input', applyFilter);
    $all('.chip[data-code-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeTopic = chip.getAttribute('data-code-filter');
        $all('.chip[data-code-filter]').forEach(function (c) {
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
          c.classList.toggle('chip-active', c === chip);
        });
        applyFilter();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        activeTopic = 'all';
        input.value = '';
        $all('.chip[data-code-filter]').forEach(function (c) {
          var isAll = c.getAttribute('data-code-filter') === 'all';
          c.setAttribute('aria-pressed', isAll ? 'true' : 'false');
          c.classList.toggle('chip-active', isAll);
        });
        applyFilter();
        window.scrollTo(0, 0);
      });
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) input.value = q;
      var topic = params.get('topic');
      if (topic) {
        var chip = document.querySelector('.chip[data-code-filter="' + topic + '"]');
        if (chip) {
          activeTopic = topic;
          $all('.chip[data-code-filter]').forEach(function (c) {
            c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
            c.classList.toggle('chip-active', c === chip);
          });
        }
      }
    } catch (e) { /* trình duyệt cũ không có URLSearchParams: bỏ qua */ }
    applyFilter();
  }

  /* H1 hero — hiệu ứng hiện từng chữ (vòng 3, kiểu 21st.dev).
     An toàn: không JS → H1 là chữ thường, hiện bình thường; reduced-motion
     → bỏ qua hẳn; chỉ tách khi H1 là chữ thuần; chạy 1 lần khi tải trang.
     Tên riêng heroH1PrefersReducedMotion để không đụng prefersReducedMotion()
     trong IIFE mascot cuối file. */
  function heroH1PrefersReducedMotion() {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initHeroH1() {
    if (typeof document === 'undefined') return;
    var h1 = document.querySelector('.hero h1');
    if (!h1) return;
    if (h1.getAttribute('data-uh-h1-done') === '1') return;
    if (heroH1PrefersReducedMotion()) return;
    /* H1 có thể chứa <span class="hero-rotator"> (từ xoay, hướng B đợt 1):
       chỉ tách các text node thành chữ, GIỮ NGUYÊN các phần tử con (từ xoay
       do initHeroRotator quản lý, không được tách). Tách theo khoảng trắng
       THƯỜNG (' ') — không tách theo \s (vì \s gồm cả nbsp trong "miễn phí",
       cụm này phải giữ nguyên 1 từ để không gãy dòng thành "miễn / phí"). */
    var textNodes = [];
    Array.prototype.forEach.call(h1.childNodes, function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) textNodes.push(n);
    });
    if (!textNodes.length) return;

    /* Trình đọc màn hình: các span ký tự dưới đây là trang trí — ẩn hết
       khỏi cây trợ năng (aria-hidden trên từng span từ, con của nó theo
       luôn) và để h1 mang aria-label là câu đầy đủ, trình đọc nghe được
       "133 công cụ miễn phí" MỘT lần thay vì từng chữ rời (đợt sửa UX
       19/11). SSR đã ghi aria-label, đây là lớp dự phòng khi SSR đổi. */
    var fullLabel = textNodes.map(function (n) { return n.textContent; }).join('')
      .replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    if (fullLabel) h1.setAttribute('aria-label', fullLabel);

    var charIndex = 0;
    textNodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      /* Tách theo từ để không gãy giữa từ khi xuống dòng; khoảng trắng
         giữa các từ giữ dạng text node thường (không tách, không delay). */
      var words = node.textContent.split(' ');
      words.forEach(function (word, wi) {
        if (wi > 0) frag.appendChild(document.createTextNode(' '));
        if (!word) return;
        var wordEl = document.createElement('span');
        wordEl.className = 'h1-word';
        wordEl.setAttribute('aria-hidden', 'true');
        /* Array.from để không vỡ ký tự ngoài BMP; tiếng Việt có dấu là
           1 code point nên vẫn tách đúng từng chữ. */
        Array.from(word).forEach(function (ch) {
          var charEl = document.createElement('span');
          charEl.className = 'h1-char';
          charEl.textContent = ch;
          charEl.style.animationDelay = (charIndex * 60) + 'ms';
          charIndex++;
          wordEl.appendChild(charEl);
        });
        frag.appendChild(wordEl);
      });
      node.parentNode.replaceChild(frag, node);
    });

    /* Thêm class SAU khi đã tách xong — CSS chỉ ẩn chữ khi có class này
       nên không có khoảng trống nào H1 bị ẩn mà chưa có chữ. */
    h1.classList.add('h1-chars');
    h1.setAttribute('data-uh-h1-done', '1');
  }

  /* Chữ xoay trong H1 trang chủ (hướng B đợt 1, ý 8 báo cáo sáng tạo):
     từ sau "133 công cụ miễn phí" đổi mỗi 2,5 giây, màu từ đổi theo
     màu hạng mục tương ứng (bản đậm, đã đo tương phản ≥ 4,5:1). Từ đầu
     ("— tính lương") có sẵn trong HTML nên không JS vẫn thấy H1 đầy đủ.
     Span xoay là trang trí: H1 mang aria-hidden="true" (đợt sửa UX
     18/11) nên trình đọc màn hình chỉ nghe "133 công cụ miễn phí" —
     H1 đứng yên, đủ nghĩa cho Google. Dấu "—" nằm TRONG span xoay để
     H1 tĩnh không thừa dấu gạch ngang.
     prefers-reduced-motion: giữ từ đầu tiên, không xoay. */
  var HERO_ROTATOR_WORDS = [
    { t: 'tính lương', c: '#1d4ed8' },
    { t: 'tạo VietQR', c: '#4f46e5' },
    { t: 'xem lịch âm', c: '#92400e' },
    { t: 'nén ảnh', c: '#5546c0' },
    { t: 'đổi đơn vị', c: '#3f6212' },
  ];

  function initHeroRotator() {
    if (typeof document === 'undefined') return;
    var el = $('#hero-rotator');
    if (!el) return;
    if (heroH1PrefersReducedMotion()) return;
    var idx = 0;
    setInterval(function () {
      if (document.hidden) return;
      idx = (idx + 1) % HERO_ROTATOR_WORDS.length;
      var next = HERO_ROTATOR_WORDS[idx];
      el.classList.add('rot-out');
      setTimeout(function () {
        el.textContent = '— ' + next.t;
        el.style.color = next.c;
        el.classList.remove('rot-out');
      }, 250);
    }, 2500);
  }

  /* Lịch sử công cụ đã thăm (localStorage) — phục vụ nút xúc xắc ưu tiên
     mở công cụ CHƯA thử + hàng "Dùng gần đây" trên trang chủ. Chỉ lưu
     slug, tối đa 200 mục, không gửi đi đâu. Danh sách giữ theo THỨ TỰ
     DÙNG GẦN NHẤT (mới nhất ở cuối): mỗi lần mở lại một công cụ thì
     slug đó chuyển xuống cuối. */
  function readVisited() {
    try {
      // Migration 1 lần (19/11): bản cũ ghi lịch sử vào khóa tên là
      // 'undefined' (lỗi hoisting ở trên) — chuyển sang khóa đúng rồi
      // xóa khóa cũ. Gộp nếu cả 2 khóa đều có dữ liệu (cũ trước, mới
      // sau, không trùng), giữ tối đa 200 mục như recordToolVisit.
      if (!visitedMigrated) {
        visitedMigrated = true;
        var legacy = null;
        try { legacy = JSON.parse(localStorage.getItem('undefined') || 'null'); } catch (e) { legacy = null; }
        if (Array.isArray(legacy) && legacy.length) {
          var cur = [];
          try { cur = JSON.parse(localStorage.getItem(VISITED_KEY) || '[]'); } catch (e) { cur = []; }
          if (!Array.isArray(cur)) cur = [];
          var merged = legacy.concat(cur.filter(function (s) { return legacy.indexOf(s) === -1; }));
          try { localStorage.setItem(VISITED_KEY, JSON.stringify(merged.slice(-200))); } catch (e) { /* bỏ qua */ }
        }
        try { localStorage.removeItem('undefined'); } catch (e) { /* bỏ qua */ }
      }
      var arr = JSON.parse(localStorage.getItem(VISITED_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function recordToolVisit() {
    if (typeof document === 'undefined') return;
    var m = window.location.pathname.match(/^\/cong-cu\/([^\/]+)\/$/);
    if (!m) return;
    try {
      var arr = readVisited();
      var at = arr.indexOf(m[1]);
      if (at !== -1) arr.splice(at, 1);
      arr.push(m[1]);
      if (arr.length > 200) arr = arr.slice(arr.length - 200);
      localStorage.setItem(VISITED_KEY, JSON.stringify(arr));
    } catch (e) { /* bộ nhớ đầy/khóa: bỏ qua */ }
  }

  /* Hàng "Dùng gần đây" trên trang chủ (đợt sửa UX 18/11): lấy 6 công cụ
     mở gần nhất từ uh_visited_tools, nhân bản thẻ .catalog-card có sẵn
     trong lưới trang chủ (không cần fetch thêm dữ liệu). Không có lịch
     sử thì cả hàng giữ hidden. Chạy TRƯỚC initCardDemos để thẻ nhân bản
     cũng được gắn mini-demo khi lăn vào màn hình trên điện thoại. */
  function initRecentTools() {
    if (typeof document === 'undefined') return;
    var section = document.getElementById('recent-tools');
    var grid = document.getElementById('recent-grid');
    if (!section || !grid) return;
    var recent = readVisited().slice(-6).reverse();
    if (!recent.length) return;
    var made = 0;
    recent.forEach(function (slug) {
      var src = document.querySelector('.catalog-card[href="/cong-cu/' + slug + '/"]');
      if (!src || grid.querySelector('[href="/cong-cu/' + slug + '/"]')) return;
      var clone = src.cloneNode(true);
      clone.removeAttribute('id');
      grid.appendChild(clone);
      made++;
    });
    if (made) section.hidden = false;
  }

  /* Nút xúc xắc "Thử công cụ ngẫu nhiên" (hướng B đợt 1, ý 15 báo cáo
     sáng tạo): có ở trang chủ + /cong-cu/. Bấm → xúc xắc lắc 0,5s →
     mở 1 công cụ chưa thử (ưu tiên theo lịch sử localStorage), tránh mở
     cùng công cụ 2 lần liên tiếp. Danh sách lấy từ thẻ .catalog-card
     trên chính trang đó (đã render sẵn lúc build). */
  function initDiceButtons() {
    if (typeof document === 'undefined') return;
    $all('.dice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-rolling') === '1') return;
        var cards = $all('.catalog-card');
        if (!cards.length) return;
        btn.setAttribute('data-rolling', '1');
        btn.classList.add('dice-rolling');
        var visited = readVisited();
        var last = null;
        try { last = localStorage.getItem(DICE_LAST_KEY); } catch (e) { /* bỏ qua */ }
        var pool = cards.map(function (card) {
          var a = card.getAttribute('href') || '';
          var name = (card.querySelector('.card-title') || {}).textContent || '';
          var slug = (a.match(/^\/cong-cu\/([^\/]+)\/$/) || [])[1] || a;
          return { href: a, name: name, slug: slug };
        }).filter(function (c) { return c.href && c.slug !== last; });
        var fresh = pool.filter(function (c) { return visited.indexOf(c.slug) === -1; });
        var pickFrom = fresh.length ? fresh : pool;
        var pick = pickFrom[Math.floor(Math.random() * pickFrom.length)];
        if (!pick) {
          btn.removeAttribute('data-rolling');
          btn.classList.remove('dice-rolling');
          return;
        }
        var label = btn.querySelector('.dice-label');
        setTimeout(function () {
          if (label) label.textContent = 'Hôm nay thử: ' + pick.name;
          try { localStorage.setItem(DICE_LAST_KEY, pick.slug); } catch (e) { /* bỏ qua */ }
          window.location.href = pick.href;
        }, 550);
      });
    });
  }

  /* "Thẻ sống" trên mobile (hướng B đợt 1, ý 9): cảm ứng không có hover
     nên khi thẻ lăn vào màn hình lần đầu, gắn class .demo-on ~1,2 giây để
     mini-demo chạy 1 lần rồi tự tắt (tránh để demo hiện mãi gây rối).
     Desktop dùng :hover nên không cần. prefers-reduced-motion: bỏ qua. */
  function initCardDemos() {
    if (typeof document === 'undefined') return;
    if (heroH1PrefersReducedMotion()) return;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) return;
    var cards = $all('.catalog-card');
    if (!cards.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        io.unobserve(card);
        card.classList.add('demo-on');
        setTimeout(function () { card.classList.remove('demo-on'); }, 1300);
      });
    }, { threshold: 0.4 });
    cards.forEach(function (card) { io.observe(card); });
  }

  /* Âm thanh thương hiệu (hướng B đợt 1, ý 12): âm "ting" 2 nốt khi bấm
     nút tính trong công cụ (nút .btn-primary trong .tool-try) — nghe qua
     helper dùng chung window.UhGvSound.ting() (cùng 1 hệ thống âm thanh
     với mục Giáo viên, cùng khóa bật/tắt uh_gv_sound; xem cuối file).
     Sao chép thành công cũng ting (móc trong copyText bên dưới). */
  function playTing() {
    try {
      if (window.UhGvSound && typeof window.UhGvSound.ting === 'function') {
        window.UhGvSound.ting();
      }
    } catch (e) { /* âm thanh lỗi: bỏ qua, không phá luồng chính */ }
  }

  function initToolSound() {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('.btn-primary') : null;
      if (!btn) return;
      if (!btn.closest('.tool-try')) return;
      playTing();
    });
  }

  /* Nút bật/tắt âm thanh: 2 nút cùng 1 cài đặt uh_gv_sound — nút icon ở
     header (chỉ hiện từ 1280px) và mục văn bản "Âm thanh: Bật/Tắt" trong
     menu hamburger (dưới 1280px, đợt sửa UX 19/11 để header điện thoại
     đủ chỗ hiện tên web). Cả hai đồng bộ trạng thái qua sync(). */
  function setupSoundToggle() {
    var btn = $('#sound-toggle');
    var navBtn = $('#nav-sound-toggle');
    if (!btn && !navBtn) return;
    function sync() {
      var on = true;
      try {
        on = window.UhGvSound ? window.UhGvSound.enabled()
          : localStorage.getItem('uh_gv_sound') !== '0';
      } catch (e) { /* bỏ qua */ }
      if (btn) {
        btn.classList.toggle('sound-off', !on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.setAttribute('aria-label', on ? 'Tắt âm thanh' : 'Bật âm thanh');
      }
      if (navBtn) {
        navBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        navBtn.textContent = on ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
      }
    }
    function toggle() {
      try {
        if (window.UhGvSound) window.UhGvSound.toggle();
        else localStorage.setItem('uh_gv_sound', localStorage.getItem('uh_gv_sound') === '0' ? '1' : '0');
      } catch (e) { /* bỏ qua */ }
      sync();
    }
    sync();
    if (btn) btn.addEventListener('click', toggle);
    if (navBtn) navBtn.addEventListener('click', toggle);
  }

  /* Trứng phục sinh (hướng B đợt 1, ý 14): bấm chấm vàng của logo
     (vùng .brand-dot phủ lên chấm vàng) 5 lần trong 2,5 giây → blob nhảy
     múa 3 giây + pháo giấy mini 1 đợt ngắn. Không quảng cáo trong giao
     diện chính. prefers-reduced-motion: chỉ hiện blob tĩnh, không nhảy
     không pháo giấy. */
  function initEasterEgg() {
    if (typeof document === 'undefined') return;
    var dot = document.querySelector('.brand-dot');
    if (!dot) return;
    var clicks = [];
    dot.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      clicks = clicks.filter(function (t) { return now - t < 2500; });
      clicks.push(now);
      if (clicks.length < 5) return;
      clicks = [];
      var reduceMotion = heroH1PrefersReducedMotion();
      var wrap = document.createElement('div');
      wrap.className = 'egg-blob';
      wrap.setAttribute('aria-hidden', 'true');
      try {
        wrap.innerHTML = (window.UHMascot && window.UHMascot.mascotSVG) || '';
      } catch (err) { /* không có mascot: vẫn chạy pháo giấy */ }
      if (!reduceMotion) wrap.classList.add('egg-dance');
      document.body.appendChild(wrap);
      setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 3000);
      if (reduceMotion) return;
      var confetti = document.createElement('div');
      confetti.className = 'egg-confetti';
      confetti.setAttribute('aria-hidden', 'true');
      var colors = ['#2563eb', '#f97316', '#0f766e', '#d81b60', '#ffc800', '#6a5ae0'];
      for (var i = 0; i < 24; i++) {
        var p = document.createElement('i');
        p.style.left = (8 + Math.random() * 84) + '%';
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        p.style.animationDuration = (1 + Math.random() * 0.6) + 's';
        confetti.appendChild(p);
      }
      document.body.appendChild(confetti);
      setTimeout(function () { if (confetti.parentNode) confetti.parentNode.removeChild(confetti); }, 2000);
    });
  }

  /* Tìm kiếm hero (trang chủ): gõ thì hiện dropdown tối đa 8 kết quả,
     xếp hạng bằng chỉ mục /data/search-index.json (khớp tên > đồng nghĩa
     > từ khóa > mô tả, không phân biệt dấu); chưa tải được chỉ mục thì
     dự phòng lọc từ lưới công cụ trang chủ (như trước). Bấm vào đi thẳng
     tới trang công cụ; Enter thì sang /cong-cu/?q=<từ khóa>. */
  function setupHeroSearch() {
    var input = $('#hero-search');
    var box = $('#hero-search-results');
    var grid = $('#home-tool-grid');
    if (!input || !box || !grid) return;
    var cards = $all('.catalog-card', grid).map(function (card) {
      return {
        href: card.getAttribute('href'),
        name: card.getAttribute('data-name') || '',
        cat: (card.querySelector('.card-cat') || {}).textContent || '',
        searchText: norm(
          (card.getAttribute('data-name') || '') + ' ' +
          (card.getAttribute('data-desc') || '') + ' ' +
          (card.getAttribute('data-keywords') || '')
        )
      };
    });

    function close() {
      box.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
    function renderItems(items) {
      if (!items.length) {
        box.innerHTML = '<p class="hero-search-empty">Không thấy công cụ nào — thử tìm “tính lương” hoặc “VietQR”, hoặc nhấn Enter để tìm ở trang Công cụ.</p>';
      } else {
        box.innerHTML = items.map(function (c) {
          return '<a class="hero-search-item" href="' + escHtml(c.href) + '" role="option">' +
            '<span class="hero-search-name">' + escHtml(c.name) + '</span>' +
            (c.cat ? '<span class="hero-search-cat">' + escHtml(c.cat) + '</span>' : '') + '</a>';
        }).join('');
      }
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
    function render() {
      var q = norm(input.value.trim());
      if (!q) { close(); return; }
      if (searchIndexData) {
        var ranked = rankSearch(searchIndexData, q).slice(0, 8);
        renderItems(ranked.map(function (t) {
          return { href: '/cong-cu/' + t.slug + '/', name: t.name, cat: t.categoryLabel || '' };
        }));
      } else {
        // Dự phòng: lọc chuỗi con từ lưới đã render sẵn.
        var hits = cards.filter(function (c) { return c.searchText.indexOf(q) !== -1; }).slice(0, 8);
        renderItems(hits);
        // Nạp lười chỉ mục; tải xong thì render lại bằng xếp hạng
        // (chỉ khi truy vấn chưa đổi và dropdown vẫn mở).
        if (!searchIndexFailed) {
          loadSearchIndex().then(function () {
            if (searchIndexData && norm(input.value.trim()) === q && !box.hidden) render();
          });
        }
      }
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var q = input.value.trim();
        window.location.href = '/cong-cu/?q=' + encodeURIComponent(q);
      } else if (e.key === 'Escape') {
        close();
        input.blur();
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.hero-search-wrap')) close();
    });
    input.addEventListener('blur', function () {
      // Đợi một nhịp để bấm vào kết quả vẫn kịp chạy trước khi đóng.
      setTimeout(close, 150);
    });
  }

  /* Modal tìm kiếm ⌘K toàn trang (đổi giao diện 18/11, phong cách 21st.dev).
     Mở bằng Ctrl+K / Cmd+K hoặc nút #header-search-btn (nút do Worker B
     thêm vào header — kiểm tra tồn tại trước khi gắn sự kiện, vì lúc chạy
     thử nút có thể chưa có). Đóng bằng Esc, bấm nền mờ, nút đóng.
     Modal chèn vào DOM bằng JS lúc init (không sửa template.js).
     Dùng LẠI đúng chỉ mục + logic xếp hạng + chuẩn hóa của ô tìm kiếm hero
     (loadSearchIndex / rankSearch / norm) nên tìm đồng nghĩa vẫn đúng
     ("lương" ra Gross-Net, "điện" ra tiền điện). Kết quả nhóm theo hạng mục,
     tối đa 8. Hiển thị điều khiển bằng thuộc tính hidden + class .is-open
     + style.display inline (flex khi mở, none khi đóng) để không phụ thuộc
     vào cách CSS định nghĩa .search-modal. Kết quả đang chọn có thêm class
     .is-active + aria-selected (CSS cần định nghĩa .search-modal-item.is-active).
     Khi mở: khóa cuộn trang nền + autofocus ô nhập; khi đóng: trả focus
     về phần tử trước đó. */
  function setupSearchModal() {
    var MODAL_MAX_RESULTS = 8;
    var modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.id = 'search-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Tìm kiếm công cụ');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="search-modal-box">' +
        '<input type="search" class="search-modal-input" id="search-modal-input" placeholder="Tìm công cụ… Ví dụ: lương, tiền điện, BMI" autocomplete="off" aria-label="Tìm công cụ" role="combobox" aria-expanded="false" aria-controls="search-modal-results">' +
        '<button type="button" class="search-modal-close" aria-label="Đóng tìm kiếm">✕</button>' +
        '<div id="search-modal-results" role="listbox" aria-label="Kết quả tìm kiếm"></div>' +
        '<p class="search-modal-hint">↑↓ chọn · Enter mở · Esc đóng</p>' +
      '</div>';
    document.body.appendChild(modal);

    var input = $('#search-modal-input', modal);
    var resultsBox = $('#search-modal-results', modal);
    var closeBtn = $('.search-modal-close', modal);
    var isOpen = false;
    var lastFocus = null;
    var prevBodyOverflow = '';
    var activeIndex = -1;
    var currentItems = []; // [{href, name, cat}] đang hiển thị, theo thứ tự DOM

    // Chọn kết quả thứ index (quấn vòng: quá cuối về đầu, trước đầu về cuối).
    function setActive(index) {
      var items = $all('.search-modal-item', resultsBox);
      if (!items.length) {
        activeIndex = -1;
        input.removeAttribute('aria-activedescendant');
        return;
      }
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      activeIndex = index;
      items.forEach(function (item, i) {
        var on = i === activeIndex;
        item.classList.toggle('is-active', on);
        item.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      input.setAttribute('aria-activedescendant', items[activeIndex].id);
      if (items[activeIndex].scrollIntoView) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }

    function clearActive() {
      activeIndex = -1;
      $all('.search-modal-item', resultsBox).forEach(function (item) {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      });
      input.removeAttribute('aria-activedescendant');
    }

    function renderItems(items) {
      var ordered = []; // thứ tự DOM (đã nhóm theo hạng mục) — khác thứ tự
      // xếp hạng gốc khi các hạng mục xen kẽ nhau.
      if (!items.length) {
        var q = input.value.trim();
        resultsBox.innerHTML = q
          ? '<p class="search-modal-empty">Không thấy công cụ nào cho “' + escHtml(q) + '” — thử từ khóa khác, ví dụ “lương” hoặc “tiền điện”. <a href="/cong-cu/?q=' + encodeURIComponent(q) + '">Tìm ở trang Công cụ →</a></p>'
          : '<p class="search-modal-empty">Gõ từ khóa để tìm trong 120 công cụ — thử “lương”, “tiền điện” hay “BMI”.</p>';
      } else {
        // Nhóm theo hạng mục, giữ thứ tự xếp hạng: nhóm xuất hiện theo
        // hạng cao nhất của công cụ đầu tiên trong nhóm.
        var groups = [];
        var byCat = {};
        items.forEach(function (it) {
          var key = it.cat || 'Công cụ';
          if (!byCat[key]) { byCat[key] = []; groups.push(key); }
          byCat[key].push(it);
        });
        var n = 0;
        resultsBox.innerHTML = groups.map(function (cat) {
          var list = byCat[cat].map(function (it) {
            ordered.push(it);
            var id = 'search-modal-item-' + (n++);
            return '<a class="search-modal-item" id="' + id + '" href="' + escHtml(it.href) + '" role="option" aria-selected="false">' +
              '<span class="search-modal-item-name">' + escHtml(it.name) + '</span>' +
              '<span class="search-modal-item-cat">' + escHtml(it.cat) + '</span></a>';
          }).join('');
          return '<div class="search-modal-group" role="group" aria-label="' + escHtml(cat) + '">' +
            '<p class="search-modal-group-title">' + escHtml(cat) + '</p>' + list + '</div>';
        }).join('');
      }
      currentItems = ordered;
      input.setAttribute('aria-expanded', items.length ? 'true' : 'false');
      clearActive();
      // Di chuột qua kết quả thì chọn kết quả đó (đi kèm điều hướng phím).
      $all('.search-modal-item', resultsBox).forEach(function (item, i) {
        item.addEventListener('mouseenter', function () { setActive(i); });
      });
    }

    // Dự phòng khi chỉ mục tải lỗi: lọc chuỗi con từ thẻ công cụ đã
    // render sẵn trên trang (như ô tìm kiếm hero); trang không có lưới
    // thẻ thì trả về rỗng và renderItems hiện câu gợi ý thân thiện.
    function fallbackSearch(q) {
      return $all('.catalog-card').map(function (card) {
        return {
          href: card.getAttribute('href') || '#',
          name: card.getAttribute('data-name') || '',
          cat: (card.querySelector('.card-cat') || {}).textContent || '',
          searchText: norm(
            (card.getAttribute('data-name') || '') + ' ' +
            (card.getAttribute('data-desc') || '') + ' ' +
            (card.getAttribute('data-keywords') || '')
          )
        };
      }).filter(function (c) { return c.searchText.indexOf(q) !== -1; })
        .slice(0, MODAL_MAX_RESULTS);
    }

    function render() {
      var q = norm(input.value.trim());
      if (!q) { renderItems([]); return; }
      if (searchIndexData) {
        var ranked = rankSearch(searchIndexData, q).slice(0, MODAL_MAX_RESULTS);
        renderItems(ranked.map(function (t) {
          return { href: '/cong-cu/' + t.slug + '/', name: t.name, cat: t.categoryLabel || '' };
        }));
      } else if (searchIndexFailed) {
        renderItems(fallbackSearch(q));
      } else {
        // Đang tải chỉ mục: hiện gợi ý chờ, tải xong render lại
        // (chỉ khi truy vấn chưa đổi và modal vẫn mở).
        resultsBox.innerHTML = '<p class="search-modal-empty">Đang tìm…</p>';
        loadSearchIndex().then(function () {
          if (isOpen && norm(input.value.trim()) === q) render();
        });
      }
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocus = document.activeElement;
      prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      modal.hidden = false;
      modal.style.display = 'flex';
      modal.classList.add('is-open');
      input.value = '';
      renderItems([]);
      input.focus();
      // Nạp trước chỉ mục để gõ là có kết quả xếp hạng ngay.
      if (!searchIndexData && !searchIndexFailed) loadSearchIndex();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      modal.hidden = true;
      modal.style.display = 'none';
      modal.classList.remove('is-open');
      document.body.style.overflow = prevBodyOverflow;
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && currentItems[activeIndex]) {
          window.location.href = currentItems[activeIndex].href;
        } else {
          var q = input.value.trim();
          if (q) window.location.href = '/cong-cu/?q=' + encodeURIComponent(q);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      // Ctrl+K / Cmd+K: mở (hoặc đóng nếu đang mở). preventDefault để
      // trình duyệt không đưa focus về thanh địa chỉ (Chrome/Firefox).
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) close(); else open();
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    });

    // Bấm nền mờ (chính .search-modal, không phải hộp con) thì đóng.
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    closeBtn.addEventListener('click', close);

    // Nút tìm kiếm ở header (Worker B thêm vào template.js) — có thể
    // chưa tồn tại lúc chạy thử nên kiểm tra trước khi gắn sự kiện.
    var headerBtn = $('#header-search-btn');
    if (headerBtn) headerBtn.addEventListener('click', open);
  }

  /* Lọc lưới trang chủ theo chip hạng mục (chỉ lọc lưới trang chủ). */
  function setupHomeFilter() {
    var grid = $('#home-tool-grid');
    if (!grid) return;
    var cards = $all('.catalog-card', grid);
    var empty = $('#home-tool-empty');
    var count = $('#home-tool-count');
    var chips = $all('.chip[data-home-filter]');
    if (!chips.length) return;
    function apply(cat) {
      var shown = 0;
      cards.forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-category') === cat;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (count) count.textContent = shown + ' công cụ';
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
          c.classList.toggle('chip-active', c === chip);
        });
        apply(chip.getAttribute('data-home-filter'));
      });
    });
  }

  /* Tabs chung — chỉ các .tab có data-tab-target (tab riêng trong công cụ
     tự quản lý, không dùng thuộc tính này nên không bị can thiệp).
     Panel chỉ đổi trong cùng <section> với tab — trang chủ có 2 nhóm tab
     (Điểm báo + Bảng xếp hạng), bấm tab nhóm này không được ẩn panel nhóm kia. */
  function setupTabs() {
    $all('.tab[data-tab-target]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab-target');
        var container = tab.closest('.tabs');
        if (container) {
          $all('.tab', container).forEach(function (t) {
            t.classList.toggle('tab-active', t === tab);
          });
        }
        var scope = tab.closest('section') || document;
        $all('.tab-panel[data-tab-panel]', scope).forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-tab-panel') !== target;
        });
      });
    });
  }

  /* Nút chép chung: [data-copy="giá trị"] + [data-copy-msg] (tùy chọn) */
  function setupCopyButtons() {
    $all('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy') || '';
        var msg = btn.getAttribute('data-copy-msg') || 'Đã chép';
        copyText(value).then(function (ok) {
          toast(ok ? msg : 'Không chép được — hãy chép tay');
        });
      });
    });
  }

  /* Nút in chung: [data-print] — dùng cho nút "In mẫu" trên trang mẫu
     sinh viên (/sinh-vien/<mau>/). CSS @media print trong style.css ẩn
     header/footer/nav/nút khi in, chỉ in nội dung mẫu. */
  function setupPrintButtons() {
    $all('[data-print]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.print();
      });
    });
  }

  /* ---------------- Dải dữ liệu hôm nay (trang chủ) ---------------- */

  // "17/11/2026 09:46" — định dạng giờ cập nhật tiếng Việt dùng chung.
  function fmtDateTime(d) {
    var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() +
      ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
  }

  // Thẻ lỗi chung: không bịa số, chỉ báo + nút thử lại.
  // Câu chữ chuẩn cho MỌI khối dữ liệu (worker W11): "Không tải được, thử lại."
  // Nhãn khối giữ trong aria-label của nút (tiêu đề thẻ ngay trên đã nói rõ
  // khối nào); câu hiển thị giữ nguyên đúng câu chuẩn ở mọi khối.
  function todayErrorHtml(id, label) {
    return '<p>Không tải được, thử lại.</p>' +
      '<p><button type="button" class="btn btn-ghost" id="' + id +
      '" aria-label="Thử tải lại ' + escHtml(label) + '">Thử lại</button></p>';
  }

  // Dòng ngày trên khối dải dữ liệu: "Hôm nay, thứ ba 17/11/2026" (tính lúc tải trang).
  function initHomNayTitle() {
    var el = $('#hom-nay-title');
    if (!el) return;
    var days = ['Chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'];
    var d = new Date();
    el.textContent = 'Hôm nay, ' + days[d.getDay()] + ' ' +
      d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* Thẻ Crypto: giá BTC + đổi 24h, đọc /data/crypto.json (snapshot, làm mới mỗi 30 phút). */
  function initCrypto() {
    var strip = $('#crypto-strip');
    if (!strip) return;
    function load() {
      strip.innerHTML = '<p class="muted">Đang tải giá…</p>';
      fetch('/data/crypto.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var coins = (data && Array.isArray(data.coins)) ? data.coins : [];
          var d = null;
          for (var i = 0; i < coins.length; i++) {
            if (coins[i].id === 'bitcoin') { d = coins[i]; break; }
          }
          if (!d || d.priceUsd == null) throw new Error('Thiếu dữ liệu');
          var usd = '$' + Number(d.priceUsd).toLocaleString('en-US', { maximumFractionDigits: 2 });
          var change = d.change24h;
          var changeHtml = '';
          if (typeof change === 'number' && isFinite(change)) {
            var cls = change >= 0 ? 'up' : 'down';
            var sign = change >= 0 ? '+' : '';
            changeHtml = '<div class="coin-change ' + cls + '">' + sign + change.toFixed(2) + '% (24h)</div>';
          }
          var timeHtml = '';
          if (data.updatedAt) {
            var t = new Date(data.updatedAt);
            if (!isNaN(t.getTime())) timeHtml = ' · ' + escHtml(fmtDateTime(t));
          }
          strip.innerHTML =
            '<div class="today-value">' + escHtml(usd) + '</div>' +
            '<div class="coin-price-vnd">' + escHtml(fmtVND(d.priceVnd)) + '</div>' +
            changeHtml +
            '<p class="muted small today-source">Nguồn: ' + escHtml(data.source || 'CoinGecko') + timeHtml + '</p>';
        })
        .catch(function () {
          strip.innerHTML = todayErrorHtml('crypto-retry', 'giá crypto');
          var retry = $('#crypto-retry');
          if (retry) retry.addEventListener('click', load);
        });
    }
    load();
  }

  /* ---------------- Trang chủ: Giá vàng lúc này ---------------- */
  // Đọc /data/gold.json (file tĩnh, làm mới hằng ngày). Hiện giá mua/bán
  // SJC miếng + giờ cập nhật. Lỗi hoặc thiếu dữ liệu thì báo + nút thử lại,
  // KHÔNG bịa số.

  function initGold() {
    var box = $('#gold-content');
    if (!box) return;
    function load() {
      box.innerHTML = '<p class="muted">Đang tải giá vàng…</p>';
      fetch('/data/gold.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var items = (data && Array.isArray(data.items)) ? data.items : [];
          // Ưu tiên vàng miếng SJC ("SJC 9999 (vàng miếng)"), rồi tới mục SJC
          // bất kỳ, cuối cùng là mục đầu tiên.
          var item = null;
          for (var i = 0; i < items.length; i++) {
            if (items[i].name && items[i].name.indexOf('vàng miếng') !== -1) { item = items[i]; break; }
          }
          if (!item) {
            for (var j = 0; j < items.length; j++) {
              if (items[j].name && items[j].name.indexOf('SJC') !== -1) { item = items[j]; break; }
            }
          }
          if (!item) item = items[0];
          if (!item || item.buy == null || item.sell == null) throw new Error('Thiếu dữ liệu');
          var stamp = data.sourceTime || data.updatedAt;
          var timeHtml = '';
          if (stamp) {
            var d = new Date(stamp);
            if (!isNaN(d.getTime())) {
              timeHtml = '<p class="muted small today-source">Nguồn: ' +
                escHtml(data.source || 'vang.today') + ' · ' + escHtml(fmtDateTime(d)) + '</p>';
            }
          }
          box.innerHTML = '<div class="today-value">' + escHtml(fmtVND(item.sell)) + '</div>' +
            '<div class="gold-prices">' +
            '<div class="gold-price"><span>Mua vào</span><b>' + escHtml(fmtVND(item.buy)) + '</b></div>' +
            '<div class="gold-price"><span>Bán ra</span><b>' + escHtml(fmtVND(item.sell)) + '</b></div>' +
            '</div><p class="muted small" style="margin: 8px 0 0;">' + escHtml(item.name || 'Vàng SJC') + ' · đồng/lượng.</p>' +
            timeHtml;
        })
        .catch(function () {
          box.innerHTML = todayErrorHtml('gold-retry', 'giá vàng');
          var retry = $('#gold-retry');
          if (retry) retry.addEventListener('click', load);
        });
    }
    load();
  }

  /* ---------------- Thẻ Tỷ giá: /data/fx.json (snapshot, làm mới mỗi 30 phút).
     Hiện "1 USD = … VND". ---------------- */
  function initFx() {
    var box = $('#fx-content');
    if (!box) return;
    function render(rate, stamp, source) {
      var timeHtml = '';
      if (stamp) {
        var d = new Date(stamp);
        if (!isNaN(d.getTime())) timeHtml = ' · ' + escHtml(fmtDateTime(d));
      }
      box.innerHTML = '<div class="today-value">1 USD = ' + escHtml(fmtVND(rate)) + '</div>' +
        '<p class="muted small today-source">Nguồn: ' + escHtml(source || 'open.er-api.com') + timeHtml + '</p>';
    }
    function load() {
      box.innerHTML = '<p class="muted">Đang tải tỷ giá…</p>';
      fetch('/data/fx.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var rate = data && data.rates && data.rates.VND;
          if (rate == null || !isFinite(Number(rate))) throw new Error('Thiếu dữ liệu');
          render(Number(rate), data.timeLastUpdateUtc || data.updatedAt, data.source);
        })
        .catch(function () {
          box.innerHTML = todayErrorHtml('fx-retry', 'tỷ giá');
          var retry = $('#fx-retry');
          if (retry) retry.addEventListener('click', load);
        });
    }
    load();
  }

  /* ---------------- Thẻ Xổ số: giải đặc biệt XSMB mới nhất từ
     /data/lottery.json — regions.bac[0].stations[0].prizes.db[0]. ---------------- */
  function initLottery() {
    var box = $('#lottery-content');
    if (!box) return;
    function load() {
      box.innerHTML = '<p class="muted">Đang tải kết quả…</p>';
      fetch('/data/lottery.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var regions = data && data.regions;
          var bac = regions && regions.bac && regions.bac[0];
          var station = bac && bac.stations && bac.stations[0];
          var db = station && station.prizes && station.prizes.db && station.prizes.db[0];
          if (db == null || db === '') throw new Error('Thiếu dữ liệu');
          var dateHtml = '';
          if (bac.date) {
            var parts = String(bac.date).split('-');
            if (parts.length === 3) {
              dateHtml = ' · ngày ' + Number(parts[2]) + '/' + Number(parts[1]) + '/' + parts[0];
            }
          }
          var timeHtml = '';
          if (data.updatedAt) {
            var d = new Date(data.updatedAt);
            if (!isNaN(d.getTime())) timeHtml = ' · cập nhật ' + escHtml(fmtDateTime(d));
          }
          box.innerHTML = '<div class="today-value">' + escHtml(String(db)) + '</div>' +
            '<p class="muted small">Giải đặc biệt XSMB' + escHtml(dateHtml) + '</p>' +
            '<p class="muted small today-source">Nguồn: ' + escHtml(data.source || 'xskt.com.vn') + timeHtml + '</p>';
        })
        .catch(function () {
          box.innerHTML = todayErrorHtml('lottery-retry', 'kết quả xổ số');
          var retry = $('#lottery-retry');
          if (retry) retry.addEventListener('click', load);
        });
    }
    load();
  }

  /* ---------------- Thẻ Lịch âm: tính TRÊN MÁY, copy nguyên thuật toán
     từ src/tools/hang-ngay/lich-am.js (sóc/new moon + kinh độ Mặt Trời
     theo Jean Meeus; quy ước lịch Việt Nam: múi giờ +7, tháng 11 âm
     chứa Đông chí). Đối chiếu: 17/11/2026 = ngày 9 tháng 10 Bính Ngọ.
     (Các hằng LA_* khai báo trước onReady — xem ghi chú ở đó.) ---------------- */

  function laJdFromDate(dd, mm, yy) {
    var a = Math.floor((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }
  function laNewMoon(k) {
    var T = k / 1236.85;
    var T2 = T * T, T3 = T2 * T;
    var dr = LA_PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr) - 0.0004 * Math.sin(3 * dr * Mpr);
    C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr));
    C1 += 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (M + 2 * Mpr));
    return Jd1 + C1;
  }
  function laSunLongitude(jdn) {
    var T = (jdn - 2451545.0) / 36525;
    var T2 = T * T;
    var dr = LA_PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T2 * T;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) % 360;
    if (L < 0) L += 360;
    return L * dr;
  }
  function laNewMoonDay(k) { return Math.floor(laNewMoon(k) + 0.5 + LA_TZ / 24); }
  function laSunLongIndex(dayNumber) { return Math.floor(laSunLongitude(dayNumber - 0.5 - LA_TZ / 24) / (LA_PI / 6)); }
  function laLunarMonth11(yy) {
    var off = laJdFromDate(31, 12, yy) - 2415021;
    var k = Math.floor(off / 29.530588853);
    var nm = laNewMoonDay(k);
    if (laSunLongIndex(nm) >= 9) nm = laNewMoonDay(k - 1);
    return nm;
  }
  function laLeapMonthOffset(a11) {
    var k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last = 0, i = 1;
    var arc = laSunLongIndex(laNewMoonDay(k + i));
    while (arc !== last && i < 14) { last = arc; i++; arc = laSunLongIndex(laNewMoonDay(k + i)); }
    return i - 1;
  }
  function laSolar2lunar(dd, mm, yy) {
    var dayNumber = laJdFromDate(dd, mm, yy);
    var k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = laNewMoonDay(k + 1);
    if (monthStart > dayNumber) monthStart = laNewMoonDay(k);
    var a11 = laLunarMonth11(yy);
    var b11 = a11;
    var lunarYear = yy;
    if (a11 >= monthStart) { a11 = laLunarMonth11(yy - 1); } else { b11 = laLunarMonth11(yy + 1); }
    var lunarDay = dayNumber - monthStart + 1;
    var diff = Math.floor((monthStart - a11) / 29);
    var lunarLeap = 0;
    var lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      var leapDiff = laLeapMonthOffset(a11);
      if (diff >= leapDiff) { lunarMonth = diff + 10; if (diff === leapDiff) lunarLeap = 1; }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap === 1 };
  }
  function laCanChiYear(ly) {
    return LA_STEMS[(((ly - 4) % 10) + 10) % 10] + ' ' + LA_BRANCHES[(((ly - 4) % 12) + 12) % 12];
  }

  function initLunar() {
    var box = $('#lunar-content');
    if (!box) return;
    try {
      var now = new Date();
      var l = laSolar2lunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
      var text = 'Ngày ' + l.day + ' tháng ' + LA_MONTH_NAMES[l.month] +
        (l.leap ? ' nhuận' : '') + ' năm ' + laCanChiYear(l.year);
      box.innerHTML = '<div class="today-value">' + escHtml(text) + '</div>' +
        '<p class="muted small">Âm lịch ' + l.day + '/' + l.month + '/' + l.year +
        (l.leap ? ' nhuận' : '') + ' · tính trên máy của bạn.</p>';
    } catch (e) {
      box.innerHTML = '<p>Chưa tính được lịch âm.</p>';
    }
  }

  /* ---------------- Thẻ Tử vi: tuổi có điểm cao nhất hôm nay.
     Copy hàm băm xác định theo ngày (FNV-1a + mulberry32) từ
     src/tools/hang-ngay/tu-vi-12-con-giap.js — cùng ngày + cùng tuổi
     luôn ra cùng điểm như trong công cụ. Chỉ hiện tên tuổi + điểm tổng.
     (TV_NAMES khai báo trước onReady — xem ghi chú ở đó.) ---------------- */

  function tvHashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function tvRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tvFortuneTotal(zodiacIdx) {
    var n = new Date();
    var key = n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate();
    var r = tvRng(tvHashStr(key + '|' + zodiacIdx));
    // Điểm 1–5 sao, phân phối nghiêng về 3–4 sao — giống hệt công cụ.
    function star() { return Math.max(1, Math.min(5, Math.round(3 + (r() + r() + r() - 1.5) * 1.6))); }
    return star() + star() + star() + star();
  }

  function initHoroscope() {
    var box = $('#horoscope-content');
    if (!box) return;
    try {
      var bestIdx = 0, bestTotal = -1;
      for (var i = 0; i < 12; i++) {
        var total = tvFortuneTotal(i);
        if (total > bestTotal) { bestTotal = total; bestIdx = i; }
      }
      box.innerHTML = '<div class="today-value">Tuổi ' + escHtml(TV_NAMES[bestIdx]) + '</div>' +
        '<p class="muted small">Điểm cao nhất hôm nay: ' + bestTotal + '/20 · chỉ mang tính giải trí.</p>';
    } catch (e) {
      box.innerHTML = '<p>Chưa tính được tử vi.</p>';
    }
  }

  /* ---------------- Trang chủ: chỉ số Fear & Greed ---------------- */
  // Hiển thị trong dải Crypto (dòng #fng-line, nằm NGOÀI #crypto-strip
  // nên initCrypto thay innerHTML không xóa được).
  // Đọc /data/fng.json (snapshot cùng tên miền): giá trị + nhãn tiếng Việt
  // (FNG_LABELS) + giờ cập nhật. Lỗi/thiếu dữ liệu thì giữ dòng ẩn —
  // không làm hỏng thẻ Crypto.

  var FNG_LABELS = {
    'Extreme Fear': 'Sợ hãi cực độ',
    'Fear': 'Sợ hãi',
    'Neutral': 'Trung lập',
    'Greed': 'Tham lam',
    'Extreme Greed': 'Tham lam cực độ'
  };

  function initFearGreed() {
    var line = $('#fng-line');
    if (!line) return;
    fetch('/data/fng.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data || data.value == null) throw new Error('Thiếu dữ liệu');
        var value = Number(data.value);
        if (!isFinite(value)) throw new Error('Thiếu dữ liệu');
        var label = FNG_LABELS[data.label] || data.label || '';
        var text = 'Fear & Greed: ' + value + (label ? ' — ' + label : '');
        if (data.updatedAt) {
          var d = new Date(data.updatedAt);
          if (!isNaN(d.getTime())) text += ' · cập nhật ' + fmtDateTime(d);
        }
        line.textContent = text;
        line.hidden = false;
      })
      .catch(function () {
        // Lỗi thì giữ dòng ẩn (đã hidden sẵn) — thẻ Crypto không bị ảnh hưởng.
        line.hidden = true;
      });
  }

  /* ---------------- Trang chủ: Điểm báo + Tin hot ---------------- */

  var NEWS_GROUPS = [
    { id: 'ai', label: 'AI' },
    { id: 'chung-khoan', label: 'Chứng khoán' },
    { id: 'crypto', label: 'Crypto' }
  ];
  var NEWS_PER_GROUP = 2; // Đồng bộ với home.js (SSR): trang chủ chỉ hiện 2 tin/tab + 1 tin nổi bật.
  var HOT_COUNT = 6;

  // news.json có thể ở 1 trong 2 dạng: groups là mảng [{id,label,items}] hoặc
  // object {ai:[...], 'chung-khoan':[...], crypto:[...]}. Tin dùng `url` hoặc `link`.
  function normalizeNews(data) {
    var groups = [];
    if (!data) return groups;
    if (Array.isArray(data.groups)) {
      data.groups.forEach(function (g) {
        if (g && Array.isArray(g.items)) groups.push({ id: g.id, label: g.label || g.id, items: g.items });
      });
    } else if (data.groups && typeof data.groups === 'object') {
      NEWS_GROUPS.forEach(function (def) {
        var items = data.groups[def.id];
        if (Array.isArray(items)) groups.push({ id: def.id, label: def.label, items: items });
      });
    }
    return groups;
  }

  function newsItemUrl(item) { return item.url || item.link || ''; }
  // Tiêu đề hiển thị: ưu tiên tít tiếng Việt tự viết (titleVi), chưa có thì
  // fallback về tiêu đề gốc tiếng Anh (đợt sửa UX 19/11) — đồng bộ home.js.
  function newsTitle(item) { return item.titleVi || item.title; }
  function newsItemDate(item) {
    if (!item.publishedAt) return null;
    var d = new Date(item.publishedAt);
    return isNaN(d.getTime()) ? null : d;
  }
  function formatDate(d) {
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }
  // Tóm tắt tối đa 260 ký tự.
  function truncateSummary(s) {
    var t = String(s || '').trim();
    if (t.length <= 260) return t;
    return t.slice(0, 257) + '…';
  }

  function newsCardHtml(item) {
    var summary = truncateSummary(item.summary);
    var date = newsItemDate(item);
    var meta = [item.source || '', date ? formatDate(date) : ''].filter(Boolean).join(' · ');
    return '<article class="news-card">' +
      '<h4><a href="' + escHtml(newsItemUrl(item)) + '" target="_blank" rel="noopener">' +
      escHtml(newsTitle(item) || '(không có tiêu đề)') + '</a></h4>' +
      (summary ? '<p class="news-summary">' + escHtml(summary) + '</p>' : '') +
      (item.why ? '<p class="news-why">' + escHtml(item.why) + '</p>' : '') +
      (meta ? '<p class="news-meta">' + escHtml(meta) + '</p>' : '') +
      '</article>';
  }

  function newsFeaturedHtml(item) {
    var summary = truncateSummary(item.summary);
    var date = newsItemDate(item);
    var meta = [item.source || '', date ? formatDate(date) : ''].filter(Boolean).join(' · ');
    return '<article class="news-card news-featured">' +
      '<p class="news-featured-tag">Tin nổi bật</p>' +
      '<h3><a href="' + escHtml(newsItemUrl(item)) + '" target="_blank" rel="noopener">' +
      escHtml(newsTitle(item) || '(không có tiêu đề)') + '</a></h3>' +
      (summary ? '<p class="news-summary">' + escHtml(summary) + '</p>' : '') +
      (item.why ? '<p class="news-why">' + escHtml(item.why) + '</p>' : '') +
      (meta ? '<p class="news-meta">' + escHtml(meta) + '</p>' : '') +
      '</article>';
  }

  // SSR (worker W11): home.js đã render sẵn nội dung từ JSON lúc build
  // (data-ssr="1" + data-updated-at). Lúc tải trang chỉ fetch JSON để kiểm
  // tra mới hơn: JSON mới hơn SSR thì render lại, còn không thì giữ SSR
  // (tab/lọc đã gắn sẵn bởi setupTabs). Fetch lỗi thì giữ SSR + nút thử
  // lại nhỏ; không có SSR thì hiện lỗi chuẩn "Không tải được, thử lại."

  // Giờ SSR (ms) của một khối; 0 nếu không có SSR.
  function ssrTime(el) {
    if (!el || el.getAttribute('data-ssr') !== '1') return 0;
    var t = Date.parse(el.getAttribute('data-updated-at') || '');
    return isNaN(t) ? 0 : t;
  }

  // Nút thử lại nhỏ gắn cuối khối SSR khi fetch lỗi (chỉ gắn 1 lần).
  function appendSsrRetry(el, note, onRetry) {
    if (!el || el.querySelector('.ssr-retry')) return;
    var p = document.createElement('p');
    p.className = 'muted small ssr-retry';
    p.textContent = note + ' ';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost btn-small';
    btn.textContent = 'Thử lại';
    btn.addEventListener('click', function () {
      p.remove();
      onRetry();
    });
    p.appendChild(btn);
    el.appendChild(p);
  }

  // Lỗi khi không có SSR: câu chuẩn + nút thử lại.
  function renderFetchError(el, onRetry) {
    if (!el) return;
    el.innerHTML = '<p>Không tải được, thử lại.</p>' +
      '<p><button type="button" class="btn btn-ghost" data-retry>Thử lại</button></p>';
    var btn = el.querySelector('[data-retry]');
    if (btn) btn.addEventListener('click', onRetry);
  }

  function initNewsAndHot() {
    var featuredEl = $('#news-featured');
    var groupsEl = $('#news-groups');
    var hotEl = $('#rank-hot');
    if (!groupsEl && !hotEl && !featuredEl) return;

    function render(data) {
      var groups = normalizeNews(data);
      var allItems = [];
      groups.forEach(function (g) { g.items.forEach(function (it) { allItems.push(it); }); });
      // Tin nổi bật (V1): chỉ chọn tin CÓ tóm tắt tiếng Việt — ưu tiên tin
      // đầu tiên có tóm tắt trong nhóm AI, rồi tin đầu tiên có tóm tắt trong
      // toàn bộ tin; không có tin nào có tóm tắt thì không hiện thẻ nổi bật.
      // Đồng bộ với home.js (SSR).
      var hasSummary = function (it) { return String((it && it.summary) || '').trim() !== ''; };
      var aiGroup = null;
      groups.forEach(function (g) { if (g.id === 'ai') aiGroup = g; });
      var featuredItem = null;
      var k, pool = (aiGroup && aiGroup.items) || [];
      for (k = 0; k < pool.length; k++) { if (hasSummary(pool[k])) { featuredItem = pool[k]; break; } }
      if (!featuredItem) {
        for (k = 0; k < allItems.length; k++) { if (hasSummary(allItems[k])) { featuredItem = allItems[k]; break; } }
      }
      if (featuredEl) {
        featuredEl.innerHTML = featuredItem
          ? newsFeaturedHtml(featuredItem)
          : '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';
      }
      if (groupsEl) {
        if (allItems.length === 0) {
          groupsEl.innerHTML = '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';
        } else {
          // Mỗi nhóm một panel theo tab AI / Chứng khoán / Crypto;
          // cùng lúc chỉ hiện 1 nhóm (tối đa 2 tin) + 1 tin nổi bật.
          groupsEl.innerHTML = NEWS_GROUPS.map(function (def, idx) {
            var g = null;
            groups.forEach(function (x) { if (x.id === def.id) g = x; });
            // Loại tin nổi bật khỏi danh sách tab để tin không hiện 2 lần (V1).
            var items = g ? g.items.filter(function (it) { return it !== featuredItem; }).slice(0, NEWS_PER_GROUP) : [];
            return '<div class="tab-panel" data-tab-panel="news-' + def.id + '"' +
              (idx === 0 ? '' : ' hidden') + '>' +
              (items.length
                ? items.map(newsCardHtml).join('')
                : '<p class="muted">Chưa có tin ' + escHtml(def.label) + '.</p>') +
              '</div>';
          }).join('');
        }
      }
      if (hotEl) {
        if (allItems.length === 0) {
          hotEl.innerHTML = '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';
        } else {
          var hot = allItems.slice().sort(function (a, b) {
            var da = newsItemDate(a), db = newsItemDate(b);
            var ta = da ? da.getTime() : 0, tb = db ? db.getTime() : 0;
            return tb - ta;
          }).slice(0, HOT_COUNT);
          hotEl.innerHTML = hot.map(function (item, i) {
            // Tin hot cũng hiện tóm tắt tiếng Việt như thẻ Điểm báo (dùng lại
            // class .rank-desc của hàng GitHub) — đồng bộ với hotRowHtml SSR.
            var summary = truncateSummary(item.summary);
            return '<div class="rank-row rank-' + (i + 1) + '">' +
              '<div class="rank-num">' + (i + 1) + '</div>' +
              '<div class="rank-body"><h4><a href="' + escHtml(newsItemUrl(item)) +
              '" target="_blank" rel="noopener">' + escHtml(newsTitle(item) || '') + '</a></h4>' +
              (summary ? '<p class="rank-desc">' + escHtml(summary) + '</p>' : '') +
              '<p class="rank-meta">' + escHtml([item.source || '', (function () { var d = newsItemDate(item); return d ? formatDate(d) : ''; })()].filter(Boolean).join(' · ')) + '</p>' +
              '</div></div>';
          }).join('');
        }
      }
      // Ghi dấu nội dung mới để lần thử lại sau không render thừa.
      var stamp = (data && data.updatedAt) || '';
      [featuredEl, groupsEl, hotEl].forEach(function (el) {
        if (el && stamp) {
          el.setAttribute('data-ssr', '1');
          el.setAttribute('data-updated-at', stamp);
        }
      });
    }

    function load() {
      fetch('/data/news.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var fresh = Date.parse((data && data.updatedAt) || '') || 0;
          var ssr = Math.max(ssrTime(featuredEl), ssrTime(groupsEl), ssrTime(hotEl));
          // JSON không mới hơn SSR thì giữ SSR (nội dung như nhau).
          // Không có updatedAt để so (fresh = 0) thì render để chắc chắn.
          if (fresh > 0 && fresh <= ssr) return;
          render(data);
        })
        .catch(function () {
          // Giữ SSR + nút thử lại nhỏ; không có SSR thì hiện lỗi chuẩn.
          [featuredEl, groupsEl, hotEl].forEach(function (el) {
            if (!el) return;
            if (el.getAttribute('data-ssr') === '1') {
              appendSsrRetry(el, 'Không tải được tin mới — đang hiển thị tin đã lưu.', load);
            } else {
              renderFetchError(el, load);
            }
          });
        });
    }
    load();
  }
  /* ---------------- Rail video "Công cụ nổi bật" (trang chủ) ----------------
     Cơ chế đúng như trang chủ 21st.dev (đã đọc từ code JS của họ + Claude
     xác nhận 18/11/2026):
     - Mỗi thẻ có sẵn ảnh poster + <video preload="none"> chồng lên; video
       chỉ tải khi phát lần đầu.
     - Khi rail vào viewport (≥30%) thì vòng xoay tự chạy: mỗi 4 giây phát
       video của 1 trong 4 thẻ đầu, chỉ 1 video phát tại 1 thời điểm.
     - Rê chuột (chỉ chuột thật) lên thẻ nào thì video thẻ đó phát ngay và
       vòng xoay tạm dừng; rời chuột thì xoay tiếp từ thẻ kế tiếp.
     - Video ra khỏi/gần khỏi viewport thì pause (IntersectionObserver 100px).
     - prefers-reduced-motion: tắt cả xoay lẫn hover-phát, chỉ hiện poster.
     - Mobile (không hover): vòng xoay vẫn chạy (muted + playsInline cho
       phép autoplay); chạm vào thẻ thì mở trang công cụ như link thường. */
  function initRail() {
    var rail = document.getElementById('rail');
    if (!rail) return;
    var cards = Array.prototype.slice.call(rail.querySelectorAll('.rail-card'));
    if (!cards.length) return;
    var videos = cards.map(function (c) { return c.querySelector('video'); });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ROTATE_MS = 4000;
    var ROTATE_COUNT = Math.min(4, videos.length);
    var current = -1; // index video đang phát theo vòng xoay (-1 = chưa phát)
    var timer = null;
    var railVisible = false;
    var hovered = false;

    function pauseAll(except) {
      videos.forEach(function (v, i) { if (v && i !== except) v.pause(); });
    }
    function playAt(i) {
      var v = videos[i];
      if (!v) return;
      pauseAll(i);
      current = i;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    function startRotation() {
      if (timer || !railVisible || hovered) return;
      if (current < 0) playAt(0);
      timer = setInterval(function () {
        playAt((current + 1) % ROTATE_COUNT);
      }, ROTATE_MS);
    }
    function stopRotation() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    // Rail vào viewport thì bật xoay; ra khỏi thì dừng + pause hết.
    var railObserver = new IntersectionObserver(function (entries) {
      railVisible = entries[0].isIntersecting;
      if (railVisible) startRotation();
      else { stopRotation(); pauseAll(-1); }
    }, { threshold: 0.3 });
    railObserver.observe(rail);

    // Mỗi video ra khỏi vùng gần viewport thì pause.
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting) e.target.pause(); });
    }, { rootMargin: '100px' });
    videos.forEach(function (v) { if (v) videoObserver.observe(v); });

    // Hover (chỉ chuột): phát video thẻ đó + dừng xoay; rời chuột: xoay
    // tiếp từ thẻ kế tiếp sau thẻ vừa hover.
    cards.forEach(function (card, i) {
      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        hovered = true;
        stopRotation();
        playAt(i);
      });
      card.addEventListener('pointerleave', function () {
        if (!hovered) return;
        hovered = false;
        if (!railVisible) return;
        playAt((i + 1) % ROTATE_COUNT);
        startRotation();
      });
    });
  }

  /* ---------------- Trang Ủng hộ: VietQR ---------------- */

  function initSupport() {
    var canvas = $('#qr-canvas');
    if (!canvas) return;
    var label = $('#qr-amount-label');
    var errorEl = $('#qr-error');

    function draw(amount) {
      var payload = vietqrPayload({
        bin: SUPPORT_BIN,
        account: SUPPORT_ACCOUNT,
        amount: amount || undefined,
        memo: SUPPORT_MEMO
      });
      var ok = renderQR(canvas, payload);
      if (errorEl) errorEl.hidden = ok;
      if (label) {
        label.textContent = amount
          ? 'Quét mã để chuyển ' + fmtVND(amount) + ' — kiểm tra tên NGO MINH TUAN trước khi xác nhận.'
          : 'Quét mã để chuyển khoản — bạn tự nhập số tiền, kiểm tra tên NGO MINH TUAN trước khi xác nhận.';
      }
    }

    $all('.amount-btn[data-amount]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $all('.amount-btn[data-amount]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        draw(btn.getAttribute('data-amount'));
      });
    });

    var downloadBtn = $('#btn-download-qr');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        try {
          var a = document.createElement('a');
          a.download = 'vietqr-ung-ho-tienichhub.png';
          if (canvas.toBlob) {
            canvas.toBlob(function (blob) {
              if (!blob) { toast('Không tải được ảnh mã QR'); return; }
              a.href = URL.createObjectURL(blob);
              a.click();
              setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
            });
          } else {
            a.href = canvas.toDataURL('image/png');
            a.click();
          }
          toast('Đã tải mã QR');
        } catch (e) {
          toast('Không tải được ảnh mã QR');
        }
      });
    }

    draw('');
  }
})();

/* ============================================================================
   GỘP TỪ src/mascot.js (worker W11, 17/11/2026) — ngân sách hiệu năng:
   chỉ còn 1 file JS. Nội dung mascot.js giữ nguyên (IIFE riêng, chạy sau
   IIFE app.js), chỉ đổi 1 dòng: export Node thành module.exports.UHMascot
   để không ghi đè module.exports = UH. window.UHMascot giữ nguyên.
   ========================================================================== */
/* ============================================================================
   Tiện Ích Hub — mascot.js
   Linh vật SVG + hiệu ứng tương tác nhẹ. JS thuần, KHÔNG import, KHÔNG
   phụ thuộc thư viện ngoài, chạy được như script thường (defer) giống
   app.js — KHÔNG dùng cú pháp ES module để khỏi cần type="module".

   API công khai (window.UHMascot):
     - mascotSVG    : chuỗi SVG inline của linh vật
     - initMascot() : chèn linh vật vào mọi [data-mascot], gắn tương tác
     - initHeroGlow(): ánh sáng hero đi theo chuột (biến --mx/--my)
     - initTouchCards(): hiệu ứng chạm cho thẻ công cụ (.is-touched)

   Cả ba hàm tự chạy khi DOMContentLoaded nên không cần gọi thêm gì
   (đã gộp vào cuối app.js — không còn file mascot.js riêng).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- Linh vật: giọt nước tròn thân thiện ---------------- */
  /* Tự vẽ bằng SVG inline, viewBox 120x120. Tông trang: xanh biển
     #0891b2 / #0e7490, trắng, vàng nhạt #fde68a làm điểm nhấn (mũ).
     Mặt cười đơn giản: 2 mắt tròn + miệng cười. Tay phải vẫy được
     vẽ thành nhóm riêng <g class="mascot-arm"> để CSS làm động.
     Không ảnh ngoài, không emoji làm mặt. */

  var mascotSVG =
    '<svg viewBox="0 0 120 120" role="img" aria-label="Linh vat Tien Ich Hub" xmlns="http://www.w3.org/2000/svg">' +
    // Thân: giọt nước / blob tròn xanh biển, viền đậm hợp phong cách trang.
    '<path d="M60 10 C60 10 22 46 22 74 A38 38 0 0 0 98 74 C98 46 60 10 60 10 Z" fill="#0891b2" stroke="#0e7490" stroke-width="3" stroke-linejoin="round"/>' +
    // Vệt sáng trắng trên thân cho có chiều sâu.
    '<ellipse cx="44" cy="70" rx="9" ry="14" fill="#ffffff" opacity="0.35" transform="rotate(-18 44 70)"/>' +
    // Mũ nhỏ màu vàng nhạt trên đầu.
    '<path d="M42 30 Q60 12 78 30 L74 36 Q60 24 46 36 Z" fill="#fde68a" stroke="#0e7490" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<circle cx="60" cy="18" r="5" fill="#fde68a" stroke="#0e7490" stroke-width="2.5"/>' +
    // Tay trái (tĩnh): vươn nhẹ sang trái.
    '<path d="M26 82 Q12 78 12 66" fill="none" stroke="#0e7490" stroke-width="5" stroke-linecap="round"/>' +
    // Tay phải (vẫy): nhóm riêng để CSS xoay quanh vai.
    '<g class="mascot-arm">' +
    '<path d="M94 82 Q110 72 108 54" fill="none" stroke="#0e7490" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="108" cy="50" r="6" fill="#0891b2" stroke="#0e7490" stroke-width="2.5"/>' +
    '</g>' +
    // Mặt: 2 mắt tròn + miệng cười.
    '<circle cx="48" cy="72" r="5.5" fill="#12283e"/>' +
    '<circle cx="72" cy="72" r="5.5" fill="#12283e"/>' +
    '<circle cx="50" cy="70" r="1.8" fill="#ffffff"/>' +
    '<circle cx="74" cy="70" r="1.8" fill="#ffffff"/>' +
    '<path d="M50 86 Q60 94 70 86" fill="none" stroke="#12283e" stroke-width="3.5" stroke-linecap="round"/>' +
    // Má hồng nhẹ hai bên.
    '<circle cx="38" cy="82" r="4.5" fill="#fda4af" opacity="0.55"/>' +
    '<circle cx="82" cy="82" r="4.5" fill="#fda4af" opacity="0.55"/>' +
    '</svg>';

  function prefersReducedMotion() {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------------- initMascot ---------------- */
  /* Tìm mọi [data-mascot], chèn SVG vào. Tương tác: rê chuột qua
     (mouseenter) hoặc chạm (click) thì vẫy tay 0.9s + nhảy nhẹ 0.5s,
     mỗi lần tương tác chỉ chạy 1 lần, không lặp vô hạn.
     prefers-reduced-motion: chỉ hiện tĩnh, không làm động. */

  function initMascot() {
    if (typeof document === 'undefined') return;
    var reduceMotion = prefersReducedMotion();
    var slots = document.querySelectorAll('[data-mascot]');
    Array.prototype.forEach.call(slots, function (slot) {
      // Tránh chèn trùng nếu hàm chạy 2 lần.
      if (slot.getAttribute('data-mascot-done') === '1') return;
      slot.setAttribute('data-mascot-done', '1');
      slot.classList.add('mascot');
      if (slot.getAttribute('data-mascot') === 'corner') slot.classList.add('mascot-corner');
      if (slot.getAttribute('data-mascot') === 'hero') slot.classList.add('mascot-hero');
      slot.innerHTML = mascotSVG;

      if (reduceMotion) return; // chỉ hiện tĩnh

      var waving = false;
      var jumping = false;

      function play() {
        if (!waving) {
          waving = true;
          slot.classList.add('waving');
          setTimeout(function () {
            slot.classList.remove('waving');
            waving = false;
          }, 900);
        }
        if (!jumping) {
          jumping = true;
          slot.classList.add('jumping');
          setTimeout(function () {
            slot.classList.remove('jumping');
            jumping = false;
          }, 500);
        }
      }

      slot.addEventListener('mouseenter', play);
      // click bao cả chạm cảm ứng; không gắn thêm touchstart để tránh
      // chạy 2 lần (touchstart rồi click tổng hợp).
      slot.addEventListener('click', play);
    });
  }

  /* ---------------- initHeroGlow ---------------- */
  /* Ánh sáng hero đi theo chuột: cập nhật --mx/--my trên .hero.
     Dùng nội suy (lerp) qua requestAnimationFrame để ánh sáng trượt
     mượt theo chuột thay vì nhảy từng pixel. Chỉ chạy khi chuột di
     chuyển trong hero; không chạy trên cảm ứng (không có hover). */

  function initHeroGlow() {
    if (typeof document === 'undefined') return;
    if (prefersReducedMotion()) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (typeof window === 'undefined' || !window.requestAnimationFrame) return;

    var targetX = 50, targetY = 40; // % mặc định: giữa-trên hero
    var curX = 50, curY = 40;
    var rafId = null;

    function tick() {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      hero.style.setProperty('--mx', curX.toFixed(2) + '%');
      hero.style.setProperty('--my', curY.toFixed(2) + '%');
      // Dừng vòng lặp khi đã gần tới đích (sai số < 0.1%) để khỏi chạy nền.
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
      if (rafId === null) rafId = window.requestAnimationFrame(tick);
    });
  }

  /* ---------------- initTouchCards ---------------- */
  /* Trên cảm ứng không có :hover nên thêm/xóa class .is-touched khi
     chạm vào thẻ công cụ (.catalog-card) để vẫn có hiệu ứng nâng nhẹ.
     touchstart -> thêm; touchend/touchcancel -> xóa sau 150ms. */

  function initTouchCards() {
    if (typeof document === 'undefined') return;
    if (prefersReducedMotion()) return;
    var cards = document.querySelectorAll('.catalog-card');
    Array.prototype.forEach.call(cards, function (card) {
      var timer = null;
      function clear() {
        clearTimeout(timer);
        timer = setTimeout(function () {
          card.classList.remove('is-touched');
        }, 150);
      }
      card.addEventListener('touchstart', function () {
        clearTimeout(timer);
        card.classList.add('is-touched');
      }, { passive: true });
      card.addEventListener('touchend', clear, { passive: true });
      card.addEventListener('touchcancel', clear, { passive: true });
    });
  }

  /* ---------------- Âm thanh lớp học (UhGvSound) ----------------
     Helper dùng chung cho công cụ Giáo viên + âm thanh thương hiệu toàn
     trang: âm thanh tổng hợp bằng Web Audio API (0 file). Công cụ giáo
     viên gọi window.UhGvSound.tick() khi hiệu ứng đang chạy và .fanfare()
     khi có kết quả; app.js gọi .ting() (âm 2 nốt ngắn) khi bấm nút tính
     trong công cụ hoặc sao chép thành công. Bật/tắt lưu localStorage
     'uh_gv_sound' (mặc định BẬT) — 1 cài đặt cho cả web, nút tắt ở header
     + trong từng công cụ giáo viên. Chỉ phát sau thao tác bấm của người
     dùng (đúng luật autoplay). An toàn khi chạy dưới Node (kiểm tra
     typeof window / try-catch localStorage). */
  var GV_SOUND_KEY = 'uh_gv_sound';
  var gvAudioCtx = null;

  function gvSoundEnabled() {
    try { return localStorage.getItem(GV_SOUND_KEY) !== '0'; } catch (e) { return true; }
  }

  function gvSetSoundEnabled(v) {
    try { localStorage.setItem(GV_SOUND_KEY, v ? '1' : '0'); } catch (e) { /* bỏ qua */ }
  }

  function gvCtx() {
    if (typeof window === 'undefined') return null;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!gvAudioCtx) { try { gvAudioCtx = new AC(); } catch (e) { return null; } }
    if (gvAudioCtx.state === 'suspended') gvAudioCtx.resume();
    return gvAudioCtx;
  }

  function gvTone(freq, delay, dur, type, vol) {
    var ctx = gvCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    // Âm lượng chung cho cả web (thanh chỉnh trong công cụ Âm thanh lớp
    // học, khóa 'uh_gv_vol' 0–100, mặc định 80). Đọc mỗi lần phát để
    // thanh chỉnh có hiệu lực ngay mà không cần tải lại trang.
    var v = (vol || 0.15) * gvVolume();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.15));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + (dur || 0.15) + 0.05);
  }

  function gvVolume() {
    try {
      var raw = localStorage.getItem('uh_gv_vol');
      if (raw === null || raw === '') return 0.8;
      var n = parseInt(raw, 10);
      if (isNaN(n)) return 0.8;
      return Math.max(0, Math.min(100, n)) / 100;
    } catch (e) { return 0.8; }
  }

  function gvTick() {
    if (!gvSoundEnabled()) return;
    gvTone(1200, 0, 0.05, 'square', 0.05);
  }

  function gvFanfare() {
    if (!gvSoundEnabled()) return;
    gvTone(523.25, 0, 0.14, 'triangle', 0.15);
    gvTone(659.25, 0.12, 0.14, 'triangle', 0.15);
    gvTone(783.99, 0.24, 0.14, 'triangle', 0.15);
    gvTone(1046.5, 0.36, 0.35, 'triangle', 0.18);
  }

  /* Âm "ting" thương hiệu: 2 nốt ngắn (A5 → E6), âm lượng thấp. Giới hạn
     tối đa 1 lần / 1,2 giây để 1 thao tác không kêu 2 lần (vd nút Tính
     vừa là .btn-primary vừa sao chép kết quả). */
  var gvLastTingAt = 0;
  function gvTing() {
    if (!gvSoundEnabled()) return;
    var now = Date.now();
    if (now - gvLastTingAt < 1200) return;
    gvLastTingAt = now;
    gvTone(880, 0, 0.12, 'sine', 0.08);
    gvTone(1318.5, 0.09, 0.18, 'sine', 0.08);
  }

  /* Chuông hết giờ cho đếm ngược lớp học: 3 tiếng chuông ngân dài. */
  function gvBell() {
    if (!gvSoundEnabled()) return;
    gvTone(659.25, 0, 0.9, 'sine', 0.2);
    gvTone(659.25, 0.7, 0.9, 'sine', 0.2);
    gvTone(659.25, 1.4, 1.2, 'sine', 0.2);
  }

  if (typeof window !== 'undefined') {
    window.UhGvSound = {
      tick: gvTick,
      fanfare: gvFanfare,
      ting: gvTing,
      bell: gvBell,
      volume: gvVolume,
      enabled: gvSoundEnabled,
      toggle: function () {
        var v = !gvSoundEnabled();
        gvSetSoundEnabled(v);
        return v;
      }
    };
  }

  /* ---------------- Danh sách lớp lưu sẵn (UhGvClasses) ----------------
     Nền tảng dùng chung cho mục Giáo viên: giáo viên lưu danh sách từng
     lớp 1 lần (vd "6A", "7B"), các công cụ Gọi tên / Chia nhóm / Điểm
     danh / Bốc câu hỏi đều đọc chung — không dán lại mỗi buổi.
     1 key localStorage 'uh_gv_lop' dạng { "6A": [bản ghi], ... }, mỗi
     bản ghi là { id, name, gender ('nam'/'nữ'/''), star, absent,
     points }. id là mã cố định tạo lúc thêm bạn vào lớp (gvNewId),
     KHÔNG đổi khi sửa tên/di chuyển — mọi tab tra cứu theo id, không
     theo tên hay vị trí, để 2 bạn trùng họ tên không bao giờ nhầm
     nhau (19/11). Bản ghi cũ chưa có id thì gán id khi đọc lần đầu
     và lưu lại ngay.
     Dữ liệu CŨ (mảng tên thuần ["An", "Bình"]) được tự chuyển đổi sang
     bản ghi khi đọc lần đầu (không mất tên đã lưu); điểm ban đầu lấy
     từ bảng điểm uh_bangdiemlop nếu có. Các công cụ cũ vẫn dùng được:
     get() trả về mảng tên, save() nhận mảng tên và GIỮ nguyên thông
     tin bản ghi của tên đã có. Lớp đang dạy dùng chung cho Bàn giáo
     viên lưu ở key 'uh_gv_lop_active' (active()/setActive()).
     parseRows()/parseRecords() tách bảng lớp theo NHẬN DIỆN CỘT (dán
     Excel / CSV / XLSX dùng chung): cột toàn số = STT (bỏ), cột chỉ có
     Nam/Nữ/nam/nữ/M/F = giới tính, các cột còn lại trước cột giới tính
     = phần của họ tên (Họ đệm + Tên tách 2 cột thì gộp lại), cột sau
     giới tính (Ghi chú...) bỏ qua; bỏ dòng tiêu đề; KHÔNG gộp trùng
     tên (lớp hay có 2 bạn trùng họ tên — giữ cả hai). parse() trả về
     mảng tên (dùng cho công cụ cũ). An toàn khi chạy dưới Node. */
  var GV_CLASS_KEY = 'uh_gv_lop';
  var GV_ACTIVE_KEY = 'uh_gv_lop_active';

  function gvCellText(v) {
    return String(v == null ? '' : v).replace(/\u00A0/g, ' ').trim();
  }

  // Ô tiêu đề cột (khớp đúng cả ô): "STT", "Họ tên", "Giới tính"...
  // Hàng nào có 1 ô như vậy là hàng tiêu đề — tên học sinh thật không
  // bao giờ là đúng 1 từ này nên không sợ bỏ nhầm hàng dữ liệu.
  function gvIsHeaderCell(t) {
    return /^(stt|số thứ tự|họ(\s*và)?\s*tên|họ tên( học sinh)?|tên( học sinh)?|tên gọi|họ đệm|giới tính|giới|nam\/nữ|ghi chú|ngày sinh|địa chỉ|nơi sinh|lớp|mssv|mã( số| học sinh)?|số báo danh)$/i.test(t);
  }

  function gvIsHeaderRow(cells) {
    return cells.some(gvIsHeaderCell);
  }

  function gvNormGender(v) {
    var t = gvCellText(v).toLowerCase();
    if (t === 'nam' || t === 'm' || t === 'male') return 'nam';
    if (t === 'nữ' || t === 'nu' || t === 'f' || t === 'female') return 'nữ';
    return '';
  }

  function gvIsGenderValue(t) {
    return /^(nam|nữ|nu|m|f|male|female)$/i.test(t);
  }

  // Tách bảng lớp từ mảng hàng (mỗi hàng là mảng ô) thành bản ghi
  // {name, gender}. Dùng chung cho dán Excel, CSV và XLSX — chỉ khác
  // cách tách văn bản/file thành hàng.
  function gvParseRows(rows) {
    var data = [];
    (rows || []).forEach(function (row) {
      if (!row) return;
      var cells = (Array.isArray(row) ? row : [row]).map(gvCellText);
      if (!cells.some(function (c) { return c !== ''; })) return;
      if (gvIsHeaderRow(cells)) return;
      data.push(cells);
    });
    if (!data.length) return [];
    var maxCols = 0;
    data.forEach(function (r) { if (r.length > maxCols) maxCols = r.length; });
    // Vai trò từng cột trên toàn bộ hàng: STT (toàn số) / giới tính
    // (chỉ Nam/Nữ/...) / còn lại là phần của tên.
    var isStt = [];
    var isGender = [];
    for (var j = 0; j < maxCols; j++) {
      var vals = [];
      data.forEach(function (r) { if (r[j] !== undefined && r[j] !== '') vals.push(r[j]); });
      isStt[j] = vals.length > 0 && vals.every(function (v) { return /^\d{1,3}[.)]?$/.test(v); });
      isGender[j] = vals.length > 0 && vals.every(gvIsGenderValue);
    }
    var genderCol = -1;
    for (var g = 0; g < maxCols; g++) { if (isGender[g]) { genderCol = g; break; } }
    // Cột tên: các cột không phải STT/giới tính TRƯỚC cột giới tính
    // (cột sau giới tính thường là Ghi chú — bỏ qua). Không có cột
    // nào trước giới tính thì lấy các cột sau giới tính; không có cột
    // giới tính thì lấy mọi cột không phải STT.
    var nameCols = [];
    for (var k = 0; k < maxCols; k++) {
      if (isStt[k] || isGender[k]) continue;
      if (genderCol === -1 || k < genderCol) nameCols.push(k);
    }
    if (!nameCols.length && genderCol !== -1) {
      for (var k2 = genderCol + 1; k2 < maxCols; k2++) {
        if (!isStt[k2] && !isGender[k2]) nameCols.push(k2);
      }
    }
    if (!nameCols.length) return [];
    var out = [];
    data.forEach(function (r) {
      var parts = [];
      nameCols.forEach(function (c) {
        var v = r[c];
        if (v !== undefined && v !== '') parts.push(v);
      });
      var name = parts.join(' ').replace(/\s+/g, ' ').trim();
      // Dán 1 cột kiểu "1. Nguyễn Văn A": bỏ số thứ tự đầu dòng.
      name = name.replace(/^\d+\s*[.)\-–:]?\s+/, '').trim();
      if (!name || gvIsHeaderCell(name)) return;
      var gender = (genderCol !== -1 && r[genderCol]) ? gvNormGender(r[genderCol]) : '';
      out.push({ name: name, gender: gender });
    });
    return out;
  }

  function gvParseTable(text) {
    var rows = String(text == null ? '' : text).split(/\r\n|\r|\n/).map(function (line) {
      return String(line).split('\t');
    });
    return gvParseRows(rows);
  }

  function gvParseNames(text) {
    return gvParseTable(text).map(function (r) { return r.name; });
  }

  // Điểm đã lưu trong Bảng điểm lớp (mảng [{name, score}]) — dùng để
  // gieo điểm ban đầu khi chuyển dữ liệu cũ sang bản ghi.
  function gvScoreboard() {
    try {
      var raw = localStorage.getItem('uh_bangdiemlop');
      if (!raw) return {};
      var data = JSON.parse(raw);
      if (!Array.isArray(data)) return {};
      var map = {};
      data.forEach(function (e) {
        if (e && typeof e.name === 'string' && typeof e.score === 'number') map[e.name] = e.score;
      });
      return map;
    } catch (e) { return {}; }
  }

  // Mã cố định của 1 học sinh — tạo 1 lần lúc thêm vào lớp, không
  // đổi sau đó. Thời gian + ngẫu nhiên nên 2 bạn thêm cùng lúc cũng
  // không trùng.
  function gvNewId() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // Chuẩn hóa 1 phần tử thành bản ghi (chuỗi tên cũ -> bản ghi mới).
  // Bản ghi đã có id thì GIỮ id; chưa có thì gán id mới.
  function gvNormRecord(r, scores) {
    if (typeof r === 'string') {
      var n = r.trim();
      if (!n) return null;
      return { id: gvNewId(), name: n, gender: '', star: false, absent: false, points: (scores && typeof scores[n] === 'number') ? scores[n] : 0 };
    }
    if (r && typeof r === 'object' && typeof r.name === 'string' && r.name.trim()) {
      var name = r.name.trim();
      var pts = (typeof r.points === 'number') ? r.points : 0;
      if (typeof r.points !== 'number' && scores && typeof scores[name] === 'number') pts = scores[name];
      return {
        id: (typeof r.id === 'string' && r.id) ? r.id : gvNewId(),
        name: name,
        gender: (r.gender === 'nam' || r.gender === 'nữ') ? r.gender : '',
        star: !!r.star,
        absent: !!r.absent,
        points: pts
      };
    }
    return null;
  }

  function gvLoadClasses() {
    try {
      var raw = localStorage.getItem(GV_CLASS_KEY);
      if (!raw) return {};
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      var scores = gvScoreboard();
      var clean = {};
      var migrated = false;
      Object.keys(data).forEach(function (k) {
        if (!Array.isArray(data[k])) return;
        // Dạng cũ (mảng tên thuần) thì chuyển đổi + lưu lại ngay.
        if (data[k].some(function (n) { return typeof n === 'string'; })) migrated = true;
        var recs = [];
        var seenIds = {};
        // Không gộp trùng tên: lớp hay có 2 bạn trùng họ tên — giữ cả hai.
        data[k].forEach(function (r) {
          // Bản ghi cũ chưa có id thì gán id (trong gvNormRecord) và
          // lưu lại ngay để id ổn định, không đổi mỗi lần đọc.
          if (!r || typeof r !== 'object' || typeof r.id !== 'string' || !r.id) migrated = true;
          var rec = gvNormRecord(r, scores);
          if (!rec) return;
          // Phòng trường hợp 2 bản ghi trùng id (bản cũ nhân bản bản
          // ghi theo tên) — bản sau gán id mới.
          if (seenIds[rec.id]) { rec.id = gvNewId(); migrated = true; }
          seenIds[rec.id] = true;
          recs.push(rec);
        });
        // Giữ cả lớp rỗng (giáo viên vừa tạo lớp chưa kịp thêm bạn).
        if (k.trim()) clean[k.trim()] = recs;
      });
      if (migrated) gvSaveClasses(clean);
      return clean;
    } catch (e) { return {}; }
  }

  function gvSaveClasses(map) {
    try { localStorage.setItem(GV_CLASS_KEY, JSON.stringify(map)); return true; }
    catch (e) { return false; }
  }

  if (typeof window !== 'undefined') {
    window.UhGvClasses = {
      parse: gvParseNames,
      parseRecords: gvParseTable,
      parseRows: gvParseRows,
      list: gvLoadClasses,
      get: function (name) {
        var map = gvLoadClasses();
        return map[name] ? map[name].map(function (r) { return r.name; }) : [];
      },
      // Lưu mảng tên (công cụ cũ): giữ nguyên bản ghi của tên đã có
      // (giới tính/sao/vắng/điểm không bị mất), tên mới thành bản ghi mới.
      save: function (name, names) {
        var map = gvLoadClasses();
        var key = String(name).trim();
        var old = map[key] || [];
        // Hàng đợi theo tên: 2 bạn trùng tên lấy 2 bản ghi cũ khác
        // nhau (theo thứ tự xuất hiện) — không nhân bản 1 bản ghi cho
        // cả hai, nếu không cả hai sẽ trùng id.
        var byName = {};
        old.forEach(function (r) {
          if (!byName[r.name]) byName[r.name] = [];
          byName[r.name].push(r);
        });
        var recs = [];
        (names || []).forEach(function (n) {
          var t = String(n == null ? '' : n).trim();
          if (!t) return;
          // Không gộp trùng tên; nhân bản bản ghi cũ để 2 bạn trùng
          // tên không dùng chung 1 object trong mảng.
          var queue = byName[t];
          recs.push((queue && queue.length)
            ? gvNormRecord(queue.shift())
            : gvNormRecord({ name: t }));
        });
        map[key] = recs;
        return gvSaveClasses(map);
      },
      getRecords: function (name) {
        var map = gvLoadClasses();
        if (!map[name]) return [];
        return map[name].map(function (r) {
          return { id: r.id, name: r.name, gender: r.gender, star: r.star, absent: r.absent, points: r.points };
        });
      },
      // Mã mới cho 1 bạn vừa thêm vào lớp (tab Lớp học gán lúc tạo
      // bản ghi để mảng làm việc có id ngay, không đợi lần lưu sau).
      newId: gvNewId,
      // Tên hiển thị có đánh số trùng tên: 2 bạn cùng họ tên trong lớp
      // thì hiện "Bùi Ngọc Lan (1)" / "Bùi Ngọc Lan (2)" theo thứ tự
      // trong lớp; tên không trùng giữ nguyên. Trả mảng cùng thứ tự
      // với mảng bản ghi đầu vào.
      displayNames: function (records) {
        var counts = {};
        var seen = {};
        (records || []).forEach(function (r) { counts[r.name] = (counts[r.name] || 0) + 1; });
        return (records || []).map(function (r) {
          if (counts[r.name] <= 1) return r.name;
          seen[r.name] = (seen[r.name] || 0) + 1;
          return r.name + ' (' + seen[r.name] + ')';
        });
      },
      // 1 bản ghi theo id (bản sao; không có thì null).
      getRecordById: function (className, id) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return null;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].id === id) {
            var r = recs[i];
            return { id: r.id, name: r.name, gender: r.gender, star: r.star, absent: r.absent, points: r.points };
          }
        }
        return null;
      },
      // Cập nhật 1 bản ghi theo id (patch: {points, absent, star...}).
      updateRecord: function (className, id, patch) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].id === id) {
            Object.keys(patch || {}).forEach(function (k) { recs[i][k] = patch[k]; });
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      // Cộng/trừ điểm theo id (đường chính từ 19/11 — thay addPoints
      // theo tên và setPointsAt theo vị trí).
      addPointsById: function (className, id, delta) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].id === id) {
            recs[i].points = (recs[i].points || 0) + delta;
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      setPointsById: function (className, id, points) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].id === id) {
            recs[i].points = points;
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      // Đặt cờ vắng theo id (Điểm danh + ngăn lớp dùng từ 19/11).
      setAbsentById: function (className, id, absent) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].id === id) {
            recs[i].absent = !!absent;
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      // Đặt sao theo id (ngăn lớp + bảng lớp dùng từ 19/11).
      setStarById: function (className, id, star) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].id === id) {
            recs[i].star = !!star;
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      saveRecords: function (name, records) {
        var map = gvLoadClasses();
        var key = String(name).trim();
        var scores = gvScoreboard();
        var recs = [];
        // Không gộp trùng tên: lớp hay có 2 bạn trùng họ tên — giữ cả hai.
        (records || []).forEach(function (r) {
          var rec = gvNormRecord(r, scores);
          if (rec) recs.push(rec);
        });
        map[key] = recs;
        return gvSaveClasses(map);
      },
      remove: function (name) {
        var map = gvLoadClasses();
        delete map[name];
        return gvSaveClasses(map);
      },
      // Cộng/trừ điểm cho bạn đầu tiên trùng tên trong lớp (dự
      // phòng khi nút +1 ở Gọi tên không ánh xạ được chỉ số; đường
      // chính dùng setPointsAt theo vị trí để không nhầm trùng tên).
      addPoints: function (className, studentName, delta) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].name === studentName) {
            recs[i].points = (recs[i].points || 0) + delta;
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      // Đặt điểm theo vị trí trong lớp (Bảng điểm chế độ Cá nhân dùng
      // chỉ số để không nhầm 2 bạn trùng tên).
      setPointsAt: function (className, index, points) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs || !recs[index]) return false;
        recs[index].points = points;
        return gvSaveClasses(map);
      },
      // Đặt lại toàn bộ điểm của lớp về 0.
      resetPoints: function (className) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        recs.forEach(function (r) { r.points = 0; });
        return gvSaveClasses(map);
      },
      // Đặt cờ vắng cho bạn đầu tiên trùng tên (Điểm danh hôm nay —
      // cờ vắng trong bản ghi lớp là nguồn duy nhất cho cột Vắng và
      // trạng thái Vắng của Điểm danh trong ngày).
      setAbsent: function (className, studentName, absent) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].name === studentName) {
            recs[i].absent = !!absent;
            return gvSaveClasses(map);
          }
        }
        return false;
      },
      // Xóa cờ vắng của cả lớp (Điểm danh "tất cả có mặt" hôm nay).
      clearAbsent: function (className) {
        var map = gvLoadClasses();
        var recs = map[String(className || '').trim()];
        if (!recs) return false;
        recs.forEach(function (r) { r.absent = false; });
        return gvSaveClasses(map);
      },
      // Lớp đang dạy dùng chung cho Bàn giáo viên (tab Lớp học đặt,
      // các tab công cụ đọc).
      active: function () {
        try { return localStorage.getItem(GV_ACTIVE_KEY) || ''; }
        catch (e) { return ''; }
      },
      setActive: function (name) {
        try { localStorage.setItem(GV_ACTIVE_KEY, String(name || '')); return true; }
        catch (e) { return false; }
      }
    };
  }

  /* ---------------- Tự chạy khi DOM sẵn sàng ---------------- */

  function initAll() {
    initMascot();
    initHeroGlow();
    initTouchCards();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  /* ---------------- API công khai ---------------- */
  var api = {
    mascotSVG: mascotSVG,
    initMascot: initMascot,
    initHeroGlow: initHeroGlow,
    initTouchCards: initTouchCards
  };
  if (typeof window !== 'undefined') window.UHMascot = api;
  if (typeof module !== 'undefined' && module.exports) module.exports.UHMascot = api; // gộp vào app.js: không ghi đè module.exports = UH
})();
