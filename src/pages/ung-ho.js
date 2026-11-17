// Trang Ủng hộ (/ung-ho/): ủng hộ tự nguyện để duy trì trang web.
// Mã VietQR do src/app.js vẽ lúc chạy (window.UH.vietqrPayload + renderQR).
export function body() {
  return `
  <section class="section">
    <h1>Ủng hộ Tiện Ích Hub</h1>
    <p>Tiện Ích Hub miễn phí và không có quảng cáo. Nếu bạn thấy trang hữu ích, bạn có thể ủng hộ một khoản nhỏ để duy trì tên miền và hosting — hoàn toàn <strong>tự nguyện</strong>.</p>
    <p class="note">Đây là khoản ủng hộ tự nguyện để duy trì trang web, <strong>không phải quyên góp từ thiện</strong>, và không có lợi ích hay đặc quyền đổi lại. Bạn ủng hộ hay không thì vẫn dùng đầy đủ mọi công cụ như nhau.</p>

    <div class="tool-panel">
      <div class="tool-head"><h2>Chuyển khoản qua VietQR</h2></div>
      <p>Chọn số tiền (hoặc để “Tùy tâm” rồi tự nhập số tiền khi chuyển):</p>
      <div class="amount-row" role="group" aria-label="Chọn số tiền ủng hộ">
        <button type="button" class="btn amount-btn" data-amount="" aria-pressed="true">Tùy tâm</button>
        <button type="button" class="btn amount-btn" data-amount="20000" aria-pressed="false">20.000₫</button>
        <button type="button" class="btn amount-btn" data-amount="50000" aria-pressed="false">50.000₫</button>
        <button type="button" class="btn amount-btn" data-amount="100000" aria-pressed="false">100.000₫</button>
      </div>
      <div class="qr-wrap">
        <canvas id="qr-canvas" width="296" height="296" aria-label="Mã VietQR chuyển khoản ủng hộ"></canvas>
        <p id="qr-amount-label" class="muted">Quét mã để chuyển khoản — bạn tự nhập số tiền, kiểm tra tên NGO MINH TUAN trước khi xác nhận.</p>
        <p id="qr-error" class="error" hidden>Không vẽ được mã QR trên trình duyệt này — bạn vẫn có thể chuyển khoản bằng số tài khoản bên dưới.</p>
        <div class="hero-actions" style="justify-content: center;">
          <button type="button" class="btn btn-primary" id="btn-download-qr">Tải mã QR (PNG)</button>
          <button type="button" class="btn btn-ghost copy-btn" data-copy="883866666" data-copy-msg="Đã chép số tài khoản 883866666">Chép số tài khoản</button>
        </div>
      </div>
      <table class="tbl">
        <tbody>
          <tr><th scope="row">Ngân hàng</th><td>MBV — Ngân hàng TNHH MTV Việt Nam Hiện Đại (tên cũ: OceanBank)</td></tr>
          <tr><th scope="row">Số tài khoản</th><td><strong>883866666</strong></td></tr>
          <tr><th scope="row">Chủ tài khoản</th><td><strong>NGO MINH TUAN</strong></td></tr>
          <tr><th scope="row">Nội dung</th><td>UNG HO TIEN ICH HUB</td></tr>
        </tbody>
      </table>
      <p class="muted small">Trước khi xác nhận chuyển khoản, hãy kiểm tra tên người nhận hiển thị là <strong>NGO MINH TUAN</strong>. Trang web không lưu thông tin chuyển khoản của bạn.</p>
    </div>

    <p class="muted">Cảm ơn bạn đã dùng Tiện Ích Hub. Mọi thắc mắc xin gửi về <a href="mailto:ngotuantdmu97@gmail.com">ngotuantdmu97@gmail.com</a>.</p>
  </section>`;
}
