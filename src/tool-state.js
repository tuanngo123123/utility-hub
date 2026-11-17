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
//     xóa sạch input về mặc định + xóa query string + xóa vùng kết quả
//     (.result) + cuộn lên đầu panel.
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
        el.selectedIndex = 0;
      } else if (isCheckable(el)) {
        el.checked = false;
      } else if (tag === 'input' || tag === 'textarea') {
        var t = (el.type || '').toLowerCase();
        if (['button', 'submit', 'reset', 'file', 'hidden', 'image'].indexOf(t) === -1) {
          el.value = '';
        }
      }
    }
    // Xóa query string.
    try {
      window.history.replaceState(null, '', window.location.pathname + (window.location.hash || ''));
    } catch (e) { /* bỏ qua */ }
    // Xóa vùng kết quả.
    var results = panel.querySelectorAll('.result');
    for (var j = 0; j < results.length; j++) {
      results[j].innerHTML = '';
      results[j].style.display = 'none';
    }
    // Cuộn lên đầu panel.
    if (typeof panel.scrollIntoView === 'function') {
      try { panel.scrollIntoView(); } catch (e) { /* bỏ qua */ }
    }
  }

  function addResetButton(panel) {
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
