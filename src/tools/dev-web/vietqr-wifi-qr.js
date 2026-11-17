// Tạo VietQR & WiFi QR — VietQR qua window.UH.vietqrPayload + renderQR; WiFi QR theo chuẩn WIFI:.
export const meta = {
  id: 'vietqr-wifi-qr',
  name: 'Tạo VietQR & WiFi QR',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Tạo mã VietQR chuyển khoản (ngân hàng, số tài khoản, số tiền, nội dung) và mã QR WiFi để khách quét là vào mạng.',
  keywords: 'vietqr, tạo mã qr chuyển khoản, qr ngân hàng, wifi qr, tạo qr wifi',
  icon: '📱',
  seoTitle: 'Tạo VietQR & WiFi QR — Mã QR chuyển khoản, QR WiFi',
  seoDesc: 'Tạo mã VietQR chuyển khoản theo ngân hàng và số tài khoản, và mã QR WiFi để chia sẻ mạng không cần đọc mật khẩu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📱</span><div><h2>Tạo VietQR & WiFi QR</h2><p class="muted">VietQR để nhận chuyển khoản, WiFi QR để chia sẻ mạng — quét là xong.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="vq-tab-viet">VietQR chuyển khoản</button>
    <button type="button" class="tab" id="vq-tab-wifi">WiFi QR</button>
  </div>

  <div id="vq-pane-viet">
    <div class="grid-2">
      <div class="field"><label for="vq-bank">Ngân hàng</label><select id="vq-bank">
        <option value="970436">Vietcombank (970436)</option>
        <option value="970415">VietinBank (970415)</option>
        <option value="970418">BIDV (970418)</option>
        <option value="970405">Agribank (970405)</option>
        <option value="970422">MB Bank (970422)</option>
        <option value="970407">Techcombank (970407)</option>
        <option value="970432">VPBank (970432)</option>
        <option value="970416">ACB (970416)</option>
        <option value="970414">MBV (970414)</option>
        <option value="970423">TPBank (970423)</option>
        <option value="970403">Sacombank (970403)</option>
        <option value="970443">SHB (970443)</option>
        <option value="970437">HDBank (970437)</option>
        <option value="970441">VIB (970441)</option>
      </select></div>
      <div class="field"><label for="vq-acct">Số tài khoản</label><input id="vq-acct" type="text" inputmode="numeric" placeholder="VD: 1234567890"><p class="hint">Chỉ nhập số, 4–20 chữ số, không khoảng trắng.</p></div>
      <div class="field"><label for="vq-name">Tên chủ tài khoản (không dấu, tùy chọn)</label><input id="vq-name" type="text" placeholder="VD: NGUYEN VAN AN"></div>
      <div class="field"><label for="vq-amount">Số tiền (để trống = người quét tự nhập)</label><span class="input-unit"><input id="vq-amount" type="text" inputmode="numeric" placeholder="VD: 50000"><span class="unit">₫</span></span></div>
      <div class="field"><label for="vq-content">Nội dung chuyển khoản (tùy chọn)</label><input id="vq-content" type="text" placeholder="VD: Thanh toan don hang"></div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="vq-go">Tạo mã VietQR</button>
      <button type="button" class="btn btn-ghost" id="vq-example">Điền ví dụ</button>
    </div>
    <div id="vq-out"></div>
    <div class="qr-wrap"><canvas id="vq-canvas" width="280" height="280" style="display:none"></canvas></div>
    <p class="note">Mã VietQR theo chuẩn NAPAS/EMVCo. Kiểm tra kỹ số tài khoản trước khi chia sẻ mã.</p>
  </div>

  <div id="vq-pane-wifi" style="display:none">
    <div class="grid-2">
      <div class="field"><label for="vq-ssid">Tên WiFi (SSID)</label><input id="vq-ssid" type="text" placeholder="VD: NhaAn_WiFi"></div>
      <div class="field"><label for="vq-wpass">Mật khẩu WiFi</label><input id="vq-wpass" type="text" placeholder="Để trống nếu mạng mở"></div>
      <div class="field"><label for="vq-sec">Loại bảo mật</label><select id="vq-sec"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Không mật khẩu</option></select></div>
      <div class="field"><label><input type="checkbox" id="vq-hidden"> Mạng ẩn (không phát tên)</label></div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="vq-wgo">Tạo mã WiFi QR</button>
      <button type="button" class="btn btn-ghost" id="vq-wexample">Điền ví dụ</button>
    </div>
    <div id="vq-wout"></div>
    <div class="qr-wrap"><canvas id="vq-wcanvas" width="280" height="280" style="display:none"></canvas></div>
    <p class="note">Quét mã bằng camera điện thoại là tự vào WiFi, không cần gõ mật khẩu.</p>
  </div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  // Trợ giúp trải nghiệm (window.UH) + dự phòng khi UH thiếu.
  const markErr = U.markFieldError || function (el, msg) {
    if (!el || typeof document === 'undefined') return;
    const p = document.createElement('p');
    p.className = 'error';
    p.textContent = msg;
    const field = el.closest ? el.closest('.field') : null;
    (field || el.parentNode).appendChild(p);
  };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};

  $('vq-tab-viet').addEventListener('click', () => {
    $('vq-tab-viet').classList.add('tab-active'); $('vq-tab-wifi').classList.remove('tab-active');
    $('vq-pane-viet').style.display = ''; $('vq-pane-wifi').style.display = 'none';
  });
  $('vq-tab-wifi').addEventListener('click', () => {
    $('vq-tab-wifi').classList.add('tab-active'); $('vq-tab-viet').classList.remove('tab-active');
    $('vq-pane-wifi').style.display = ''; $('vq-pane-viet').style.display = 'none';
  });

  // Vẽ mã QR lên canvas bằng window.UH.renderQR (thử cả hai thứ tự tham số).
  function drawQR(canvas, text) {
    if (typeof U.renderQR !== 'function') return false;
    try { U.renderQR(canvas, text); return true; }
    catch (e1) {
      try { U.renderQR(text, canvas); return true; }
      catch (e2) { return false; }
    }
  }
  function downloadPNG(canvas, filename) {
    try {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      a.click();
    } catch (e) {
      toast('Không tải được ảnh. Hãy chụp màn hình mã QR.');
    }
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }

  function makeViet() {
    clearErrs(root);
    // Ẩn mã QR cũ ngay từ đầu để khi nhập sai, mã cũ không còn hiện
    // gây nhầm với mã mới.
    $('vq-canvas').style.display = 'none';
    const bin = $('vq-bank').value;
    const acct = $('vq-acct').value.replace(/\s/g, '');
    const name = $('vq-name').value.trim();
    const amountRaw = $('vq-amount').value.trim();
    const amount = parseNum(amountRaw);
    const content = $('vq-content').value.trim();
    if (!/^\d{4,20}$/.test(acct)) {
      markErr($('vq-acct'), 'Ô Số tài khoản chưa đúng — nhập 4–20 chữ số, chỉ nhập số, không khoảng trắng.');
      focusEl($('vq-acct'));
      $('vq-out').innerHTML = '';
      return;
    }
    if (amountRaw !== '' && !(amount > 0)) {
      markErr($('vq-amount'), 'Ô Số tiền chưa đúng — nhập số lớn hơn 0, ví dụ 50000, hoặc để trống.');
      focusEl($('vq-amount'));
      $('vq-out').innerHTML = '';
      return;
    }
    if (typeof U.vietqrPayload !== 'function') {
      $('vq-out').innerHTML = '<p class="error">Chưa tải được bộ tạo VietQR, thử lại sau.</p>';
      return;
    }
    let payload = null;
    try {
      payload = U.vietqrPayload({ bankBin: bin, bin, account: acct, accountNumber: acct, name, accountName: name, amount: amount || 0, content, memo: content });
    } catch (e1) {
      try { payload = U.vietqrPayload(bin, acct, amount || 0, content); }
      catch (e2) { payload = null; }
    }
    if (!payload || typeof payload !== 'string') {
      $('vq-out').innerHTML = '<p class="error">Không tạo được mã VietQR. Kiểm tra lại thông tin và thử lại.</p>';
      return;
    }
    const canvas = $('vq-canvas');
    canvas.style.display = '';
    if (!drawQR(canvas, payload)) {
      $('vq-out').innerHTML = '<p class="error">Chưa tải được bộ vẽ mã QR, thử lại sau.</p>';
      canvas.style.display = 'none';
      return;
    }
    $('vq-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Ngân hàng</span><strong>${esc($('vq-bank').options[$('vq-bank').selectedIndex].text)}</strong></div>
      <div class="result-row"><span>Số tài khoản</span><strong>${esc(acct)}</strong></div>
      ${amount ? '<div class="result-row"><span>Số tiền</span><strong>' + amount.toLocaleString('vi-VN') + '₫</strong></div>' : ''}
      <div class="result-row"><span>Chuỗi VietQR</span><strong class="small">${esc(payload)}</strong></div>
      <div class="result-actions">
        <button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(payload)}" data-copy-msg="Đã chép chuỗi VietQR">Chép chuỗi VietQR</button>
        <button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(acct)}" data-copy-msg="Đã chép số tài khoản">Chép số tài khoản</button>
        <button type="button" class="btn btn-ghost" id="vq-dl">Tải ảnh PNG</button>
      </div>
    </div>`;
    bindCopy($('vq-out'));
    $('vq-dl').addEventListener('click', () => downloadPNG(canvas, 'vietqr-' + acct + '.png'));
    // Cuộn tới mã QR để người dùng thấy ngay trên điện thoại.
    try { canvas.scrollIntoView({ block: 'nearest' }); } catch (e) { /* bỏ qua */ }
  }

  function makeWifi() {
    clearErrs(root);
    // Ẩn mã QR cũ ngay từ đầu để khi nhập sai, mã cũ không còn hiện
    // gây nhầm với mã mới.
    $('vq-wcanvas').style.display = 'none';
    const ssid = $('vq-ssid').value.trim();
    const pass = $('vq-wpass').value;
    const sec = $('vq-sec').value;
    const hidden = $('vq-hidden').checked ? 'true' : 'false';
    if (!ssid) {
      markErr($('vq-ssid'), 'Ô Tên WiFi chưa có tên — nhập tên mạng, ví dụ NhaAn_WiFi.');
      focusEl($('vq-ssid'));
      $('vq-wout').innerHTML = '';
      return;
    }
    if (sec !== 'nopass' && !pass) {
      markErr($('vq-wpass'), 'Mạng có bảo mật thì cần mật khẩu — nhập mật khẩu hoặc chọn "Không mật khẩu".');
      focusEl($('vq-wpass'));
      $('vq-wout').innerHTML = '';
      return;
    }
    const q = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/:/g, '\\:').replace(/"/g, '\\"');
    const text = 'WIFI:T:' + sec + ';S:' + q(ssid) + ';P:' + (sec === 'nopass' ? '' : q(pass)) + ';H:' + hidden + ';;';
    const canvas = $('vq-wcanvas');
    canvas.style.display = '';
    if (!drawQR(canvas, text)) {
      $('vq-wout').innerHTML = '<p class="error">Chưa tải được bộ vẽ mã QR, thử lại sau.</p>';
      canvas.style.display = 'none';
      return;
    }
    $('vq-wout').innerHTML = `<div class="result">
      <div class="result-row"><span>WiFi</span><strong>${esc(ssid)} (${sec === 'nopass' ? 'mạng mở' : sec})</strong></div>
      <div class="result-row"><span>Chuỗi QR</span><strong class="small">${esc(text)}</strong></div>
      <div class="result-actions">
        <button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(text)}" data-copy-msg="Đã chép chuỗi WiFi QR">Chép chuỗi QR</button>
        <button type="button" class="btn btn-ghost" id="vq-wdl">Tải ảnh PNG</button>
      </div>
    </div>`;
    bindCopy($('vq-wout'));
    $('vq-wdl').addEventListener('click', () => downloadPNG(canvas, 'wifi-qr.png'));
    try { canvas.scrollIntoView({ block: 'nearest' }); } catch (e) { /* bỏ qua */ }
  }

  $('vq-go').addEventListener('click', () => withBusy($('vq-go'), makeViet));
  $('vq-wgo').addEventListener('click', () => withBusy($('vq-wgo'), makeWifi));
  // Ví dụ VietQR: Vietcombank, tài khoản mẫu, 50.000₫.
  $('vq-example').addEventListener('click', () => {
    fillEx(root, { 'vq-bank': '970436', 'vq-acct': '1234567890', 'vq-name': 'NGUYEN VAN AN', 'vq-amount': '50000', 'vq-content': 'Thanh toan don hang' }, $('vq-go'));
  });
  // Ví dụ WiFi: mạng nhà mẫu.
  $('vq-wexample').addEventListener('click', () => {
    fillEx(root, { 'vq-ssid': 'NhaAn_WiFi', 'vq-wpass': 'matkhau123', 'vq-sec': 'WPA' }, $('vq-wgo'));
  });
  // Nút "Đặt lại" (tool-state.js thêm sau) xóa kết quả — ẩn luôn mã QR
  // để không còn mã cũ sau khi đặt lại. Dùng ủy quyền click vì nút
  // Đặt lại chưa tồn tại lúc init() chạy.
  root.addEventListener('click', (e) => {
    if (e.target && e.target.closest && e.target.closest('[data-uh-reset]')) {
      $('vq-canvas').style.display = 'none';
      $('vq-wcanvas').style.display = 'none';
    }
  });
}
