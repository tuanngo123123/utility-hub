/* ============================================================================
   Tiện Ích Hub — app.js
   Chạy trên mọi trang (script defer). Không phụ thuộc thư viện ngoài.
   - Nav mobile, toggle dark mode (lưu localStorage)
   - Tìm kiếm + lọc công cụ theo hạng mục (trang /cong-cu/, đọc ?q=/?cat=):
     dùng chỉ mục /data/search-index.json (build sinh) khi tải được, xếp
     hạng khớp tên > đồng nghĩa > từ khóa > mô tả; lỗi thì dự phòng lọc
     từ thẻ đã render sẵn
   - Tìm kiếm hero + lọc lưới trang chủ (trang chủ)
   - Tabs chung (chỉ các .tab có data-tab-target — không can thiệp tab riêng
     bên trong công cụ)
   - Trang chủ: dải dữ liệu hôm nay (crypto, vàng, tỉ giá, xổ số, lịch âm, tử vi),
     Điểm báo (tin nổi bật + tab chủ đề) + xếp hạng — SSR lúc build, JS chỉ
     render lại khi JSON mới hơn SSR, lỗi thì giữ SSR + nút thử lại
   - Trang Ủng hộ: mã VietQR + tải PNG + chép số tài khoản
   - Linh vật (gộp từ mascot.js vào cuối file): window.UHMascot
   - window.UH: tiện ích dùng chung cho mọi công cụ (xem CONTRACT.md)
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
  // Test vector (xem /tmp/test-uh.cjs): BIN 970414, TK 883866666, 50000đ,
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

  // Trả về Promise<boolean>.
  function copyText(str) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(str)
        .then(function () { return true; })
        .catch(function () { return fallbackCopy(str); });
    }
    return Promise.resolve(fallbackCopy(str));
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

  onReady(function () {
    setupNav();
    setupTheme();
    setupSearchFilter();
    setupHeroSearch();
    setupHomeFilter();
    setupTabs();
    setupCopyButtons();
    initHomNayTitle();
    initCrypto();
    initGold();
    initFx();
    initLottery();
    initLunar();
    initHoroscope();
    initFearGreed();
    initNewsAndHot();
    initTrending();
    initSupport();
  });

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

  /* ---------------- Tìm kiếm thật: chỉ mục /data/search-index.json ---------------- */
  // Chỉ mục do build.mjs sinh (meta 91 công cụ + bảng đồng nghĩa, đã chuẩn
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
  function rankSearch(index, q) {
    var words = q.split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    var scored = [];
    index.tools.forEach(function (tool) {
      var score = 0;
      var matchedAll = true;
      words.forEach(function (w) {
        var s = searchWordScore(tool, index.synById[tool.id], w);
        if (s === 0) matchedAll = false;
        score += s;
      });
      if (!matchedAll) return;
      var name = tool.nameNorm || norm(tool.name);
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
    var activeCat = 'all';

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
      if (count) count.textContent = shown + ' công cụ';
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

    // Đọc tham số URL: ?q=<từ khóa> điền ô tìm kiếm + lọc ngay;
    // ?cat=<slug> chọn chip hạng mục + lọc ngay. Slug lạ thì bỏ qua.
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) input.value = q;
      var cat = params.get('cat');
      if (cat) {
        var chip = document.querySelector('.chip[data-filter="' + cat + '"]');
        if (chip) {
          activeCat = cat;
          $all('.chip[data-filter]').forEach(function (c) {
            c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
            c.classList.toggle('chip-active', c === chip);
          });
        }
      }
    } catch (e) { /* trình duyệt cũ không có URLSearchParams: bỏ qua */ }
    // Vào trang đã có ?q= thì nạp chỉ mục ngay để xếp hạng kết quả.
    if (input.value.trim() && !searchIndexData && !searchIndexFailed) {
      loadSearchIndex().then(function () { applyFilter(); });
    }
    applyFilter();
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
        box.innerHTML = '<p class="hero-search-empty">Không thấy công cụ nào — nhấn Enter để tìm ở trang Công cụ.</p>';
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

  /* ---------------- Thẻ Tỉ giá: /data/fx.json (snapshot, làm mới mỗi 30 phút).
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
      box.innerHTML = '<p class="muted">Đang tải tỉ giá…</p>';
      fetch('/data/fx.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var rate = data && data.rates && data.rates.VND;
          if (rate == null || !isFinite(Number(rate))) throw new Error('Thiếu dữ liệu');
          render(Number(rate), data.timeLastUpdateUtc || data.updatedAt, data.source);
        })
        .catch(function () {
          box.innerHTML = todayErrorHtml('fx-retry', 'tỉ giá');
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
  var NEWS_PER_GROUP = 6;
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
      escHtml(item.title || '(không có tiêu đề)') + '</a></h4>' +
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
      escHtml(item.title || '(không có tiêu đề)') + '</a></h3>' +
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
      // Tin nổi bật: tin đầu tiên trong nhóm AI (dự phòng: tin đầu tiên có được).
      if (featuredEl) {
        var aiGroup = null;
        groups.forEach(function (g) { if (g.id === 'ai') aiGroup = g; });
        var first = (aiGroup && aiGroup.items[0]) || allItems[0];
        featuredEl.innerHTML = first
          ? newsFeaturedHtml(first)
          : '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';
      }
      if (groupsEl) {
        if (allItems.length === 0) {
          groupsEl.innerHTML = '<p class="muted">Chưa có tin — dữ liệu làm mới hằng ngày.</p>';
        } else {
          // Mỗi nhóm một panel theo tab AI / Chứng khoán / Crypto;
          // cùng lúc chỉ hiện 1 nhóm (tối đa 6 tin) + 1 tin nổi bật.
          groupsEl.innerHTML = NEWS_GROUPS.map(function (def, idx) {
            var g = null;
            groups.forEach(function (x) { if (x.id === def.id) g = x; });
            var items = g ? g.items.slice(0, NEWS_PER_GROUP) : [];
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
            return '<div class="rank-row rank-' + (i + 1) + '">' +
              '<div class="rank-num">' + (i + 1) + '</div>' +
              '<div class="rank-body"><h4><a href="' + escHtml(newsItemUrl(item)) +
              '" target="_blank" rel="noopener">' + escHtml(item.title || '') + '</a></h4>' +
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

  /* ---------------- Trang chủ: Xu hướng GitHub ---------------- */

  function initTrending() {
    var el = $('#rank-github');
    if (!el) return;

    function render(data) {
      var items = (data && Array.isArray(data.items)) ? data.items : [];
      if (!items.length) {
        el.innerHTML = '<p class="muted">Chưa có dữ liệu — dữ liệu làm mới hằng ngày.</p>';
        return;
      }
      el.innerHTML = items.slice(0, 6).map(function (item, i) {
        var rank = i + 1;
        var name = item.fullName || item.name || '';
        var desc = item.desc || item.description || '';
        // Số sao CHỈ hiện trong pill ★ bên phải (kiểu Product Hunt),
        // không lặp lại trong meta — đồng bộ với home.js trendingRowHtml.
        var meta = [];
        if (item.language) meta.push(item.language);
        if (item.forks != null) meta.push('Fork ' + Number(item.forks).toLocaleString('en-US'));
        var starsPill = item.stars != null
          ? '<span class="rank-pill">★ ' + Number(item.stars).toLocaleString('en-US') + '</span>' : '';
        return '<div class="rank-row rank-' + rank + '">' +
          '<div class="rank-num">' + rank + '</div>' +
          '<div class="rank-body"><h4><a href="' + escHtml(item.url || '#') +
          '" target="_blank" rel="noopener">' + escHtml(name) + '</a>' +
          (rank === 1 ? '<span class="hot-chip">Hot</span>' : '') + '</h4>' +
          (desc ? '<p class="rank-desc">' + escHtml(desc) + '</p>' : '') +
          (meta.length ? '<p class="rank-meta">' + escHtml(meta.join(' · ')) + '</p>' : '') +
          '</div>' + starsPill + '</div>';
      }).join('');
      // Ghi dấu nội dung mới để lần thử lại sau không render thừa.
      if (data.updatedAt) {
        el.setAttribute('data-ssr', '1');
        el.setAttribute('data-updated-at', data.updatedAt);
      }
    }

    function load() {
      fetch('/data/trending.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var fresh = Date.parse((data && data.updatedAt) || '') || 0;
          // JSON không mới hơn SSR thì giữ SSR; không có updatedAt thì render.
          if (fresh > 0 && fresh <= ssrTime(el)) return;
          render(data);
        })
        .catch(function () {
          // Giữ SSR + nút thử lại nhỏ; không có SSR thì hiện lỗi chuẩn.
          if (el.getAttribute('data-ssr') === '1') {
            appendSsrRetry(el, 'Không tải được dữ liệu mới — đang hiển thị dữ liệu đã lưu.', load);
          } else {
            renderFetchError(el, load);
          }
        });
    }
    load();
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
