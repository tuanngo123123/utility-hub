// tool-state.js — Trạng thái công cụ qua URL, dùng chung cho mọi công cụ tính toán.
//
// Script THƯỜNG (không module, không import). Được nạp riêng trên trang từng
// công cụ bằng thẻ <script src="/assets/tool-state.js" defer> (xem
// TOOL-STATE-WIRING.md). KHÔNG cần sửa từng công cụ.
//
// Hành vi:
//  1. Khi tải trang (có .tool-panel): đọc location.search, điền giá trị vào
//     các input/select/textarea có id trùng tên tham số. Radio/checkbox thì
//     khớp theo value rồi đánh checked. Nếu có ít nhất 1 tham số khớp thì
//     sau 300ms tự bấm nút tính chính (nút .btn-primary đầu tiên trong panel).
//  2. Khi người dùng sửa input trong .tool-panel: cập nhật URL bằng
//     history.replaceState (debounce 300ms), chỉ ghi tham số có giá trị
//     (bỏ trống). KHÔNG reload trang.
//  3. Thêm nút "Đặt lại" vào mỗi .tool-panel (sau hàng nút hiện có):
//     đưa input về GIÁ TRỊ MẶC ĐỊNH trong HTML (defaultValue / option
//     defaultSelected / defaultChecked — Ví dụ: lương 30.000.000, 250 kWh),
//     xóa query string, xóa đánh dấu lỗi theo ô (.field-error/.field-msg)
//     và trạng thái bận (.is-busy), xóa vùng kết quả (.result — trừ khối
//     đánh dấu data-uh-keep="1", Ví dụ: "hôm nay" của Lịch âm), rồi cuộn
//     lên đầu panel.
//     (Trước 18/11 nút này xóa trắng input về rỗng, dù chú thích ghi
//     "về mặc định"; nay sửa cho khớp chú thích — worker C.)
//     Panel mang data-uh-no-reset (MẪU 2, vd Lương Gross⇄Net) thì
//     KHÔNG chèn nút Đặt lại.
// An toàn: không có .tool-panel thì không làm gì. Chỉ tác động lên
// input/select/textarea/button có sẵn trong panel; không ép bấm nút khi
// panel không có .btn-primary (Pomodoro/bấm giờ/quay số... không bị đụng).
// KHÔNG dùng localStorage.
(function () {
  'use strict';

  var DEBOUNCE_MS = 300;
  var AUTO_CLICK_MS = 300;

  // Loại input không đồng bộ qua URL.
  function isSyncable(el) {
    if (!el || !el.id) return false;
    var tag = (el.tagName || '').toLowerCase();
    if (tag === 'select' || tag === 'textarea') return true;
    if (tag !== 'input') return false;
    var t = (el.type || 'text').toLowerCase();
    return ['button', 'submit', 'reset', 'file', 'hidden', 'image'].indexOf(t) === -1;
  }

  function isCheckable(el) {
    var t = (el.type || '').toLowerCase();
    return t === 'checkbox' || t === 'radio';
  }

  // Giá trị hiện tại của một trường để ghi URL; null = bỏ tham số.
  function fieldValue(el) {
    if (isCheckable(el)) return el.checked ? (el.value || '1') : null;
    var v = el.value == null ? '' : String(el.value).trim();
    return v === '' ? null : v;
  }

  function fireChange(el) {
    try {
      if (typeof Event === 'function') {
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (e) { /* môi trường không hỗ trợ Event: bỏ qua */ }
  }

  function fillFromUrl(panel) {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return 0;
    }
    var matched = 0;
    var fields = panel.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (!isSyncable(el)) continue;
      if (!params.has(el.id)) continue;
      var val = params.get(el.id);
      if (isCheckable(el)) {
        // Radio/checkbox: chỉ check khi value khớp tham số.
        if (el.value === val || (val === '1' && !el.value)) {
          el.checked = true;
          matched++;
          fireChange(el);
        }
      } else if (el.tagName.toLowerCase() === 'select') {
        // Chỉ đặt khi option có thật (tránh select rơi về rỗng).
        var ok = false;
        for (var j = 0; j < el.options.length; j++) {
          if (el.options[j].value === val) { ok = true; break; }
        }
        if (ok) {
          el.value = val;
          matched++;
          fireChange(el);
        }
      } else {
        el.value = val;
        matched++;
        fireChange(el);
      }
    }
    return matched;
  }

  function syncUrlFromPanel(panel) {
    var params = new URLSearchParams();
    var fields = panel.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (!isSyncable(el)) continue;
      var v = fieldValue(el);
      if (v !== null) params.set(el.id, v);
    }
    var qs = params.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '') + (window.location.hash || '');
    try {
      window.history.replaceState(null, '', url);
    } catch (e) { /* replaceState bị chặn (vd file://): bỏ qua */ }
  }

  function resetPanel(panel) {
    var fields = panel.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      var tag = (el.tagName || '').toLowerCase();
      if (tag === 'select') {
        // Về option mặc định trong HTML (defaultSelected); không có thì
        // về option đầu tiên (hành vi cũ).
        var restored = false;
        for (var k = 0; k < el.options.length; k++) {
          if (el.options[k].defaultSelected) { el.selectedIndex = k; restored = true; break; }
        }
        if (!restored) el.selectedIndex = 0;
      } else if (isCheckable(el)) {
        el.checked = !!el.defaultChecked;
      } else if (tag === 'input' || tag === 'textarea') {
        var t = (el.type || '').toLowerCase();
        if (['button', 'submit', 'reset', 'file', 'hidden', 'image'].indexOf(t) === -1) {
          // Về giá trị mặc định trong HTML (defaultValue) thay vì xóa
          // trắng — Ví dụ: lương 30.000.000, 250 kWh.
          el.value = el.defaultValue == null ? '' : el.defaultValue;
        }
      }
      // Xóa đánh dấu lỗi theo ô (worker C: .field-error/.field-msg).
      if (el.classList) el.classList.remove('field-error');
      el.removeAttribute('aria-invalid');
    }
    // Xóa dòng chữ lỗi theo ô.
    var msgs = panel.querySelectorAll('.field-msg');
    for (var m = 0; m < msgs.length; m++) {
      if (msgs[m].parentNode) msgs[m].parentNode.removeChild(msgs[m]);
    }
    // Gỡ trạng thái bận của nút (nếu nút tính đang bị kẹt ở .is-busy).
    var busy = panel.querySelectorAll('.is-busy');
    for (var b = 0; b < busy.length; b++) {
      busy[b].classList.remove('is-busy');
      busy[b].disabled = false;
      busy[b].removeAttribute('data-uh-busy');
      var label = busy[b].getAttribute('data-uh-label');
      if (label != null) busy[b].textContent = label;
      busy[b].removeAttribute('data-uh-label');
    }
    // Xóa query string.
    try {
      window.history.replaceState(null, '', window.location.pathname + (window.location.hash || ''));
    } catch (e) { /* bỏ qua */ }
    // Xóa vùng kết quả — trừ khối đánh dấu data-uh-keep="1" (thông tin
    // tĩnh như "hôm nay" của Lịch âm, không phải kết quả tính).
    var results = panel.querySelectorAll('.result');
    for (var j = 0; j < results.length; j++) {
      if (results[j].getAttribute('data-uh-keep') === '1') continue;
      results[j].innerHTML = '';
      results[j].style.display = 'none';
    }
    // Cuộn lên đầu panel.
    if (typeof panel.scrollIntoView === 'function') {
      try { panel.scrollIntoView(); } catch (e) { /* bỏ qua */ }
    }
  }

  function addResetButton(panel) {
    // MẪU 2: trang không có nút "Đặt lại" (vd Lương Gross⇄Net) đánh dấu
    // data-uh-no-reset trên panel để khung không tự chèn nút.
    if (panel.hasAttribute('data-uh-no-reset')) return;
    if (panel.querySelector('[data-uh-reset]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost';
    btn.setAttribute('data-uh-reset', '1');
    btn.textContent = 'Đặt lại';
    btn.addEventListener('click', function () { resetPanel(panel); });
    // Chèn sau hàng nút hiện có: sau nút .btn-primary đầu tiên, nếu không có
    // thì sau nút cuối cùng trong panel, nếu không có nút nào thì cuối panel.
    var primary = panel.querySelector('.btn-primary');
    var anchor = primary || (function () {
      var btns = panel.querySelectorAll('button');
      return btns.length ? btns[btns.length - 1] : null;
    })();
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    } else {
      panel.appendChild(btn);
    }
  }

  function setupPanel(panel) {
    // Điền từ URL + tự bấm nút tính nếu có tham số khớp.
    var matched = fillFromUrl(panel);
    if (matched > 0) {
      var calcBtn = panel.querySelector('.btn-primary');
      if (calcBtn) {
        setTimeout(function () {
          try { calcBtn.click(); } catch (e) { /* bỏ qua */ }
        }, AUTO_CLICK_MS);
      }
    }

    // Cập nhật URL khi người dùng sửa (debounce).
    var timer = null;
    function scheduleSync() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { syncUrlFromPanel(panel); }, DEBOUNCE_MS);
    }
    panel.addEventListener('input', scheduleSync);
    panel.addEventListener('change', scheduleSync);

    addResetButton(panel);
  }

  function init() {
    var panels = document.querySelectorAll('.tool-panel');
    if (!panels || panels.length === 0) return;
    for (var i = 0; i < panels.length; i++) setupPanel(panels[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
