// Trang Giới thiệu (/gioi-thieu/): người làm, mục đích của web, mục
// Nguồn mở (đợt menu MẪU 3/4, 19/11), mục Liên hệ (Tuấn chọn email
// 19/11 ~22:39: ngotuantdmu97@gmail.com, link mailto tiêu đề "Góp ý
// Tiện Ích Hub"). Link từ footer.
//
// Giấy phép trong mục Nguồn mở đã tra đúng từng thư viện trong
// src/vendor/ (19/11): pdf.js Apache-2.0, pdf-lib MIT,
// qrcode-generator MIT, SheetJS Community Edition Apache-2.0 (ghi kèm
// tên tác giả theo yêu cầu ghi công của SheetJS), phông Inter +
// Be Vietnam Pro SIL OFL 1.1. Không liệt kê thư viện web không dùng
// (heic2any, thư viện nén ảnh, thư viện docx — đã grep xác nhận không
// có trong src/).

export function body() {
  return `
  <div class="about-page">
    <header class="tool-page-head">
      <h1>Giới thiệu</h1>
      <p class="muted">Tiện Ích Hub là web công cụ tính toán miễn phí cho người Việt — làm để gom các phép tính hay dùng hằng ngày vào một chỗ, số liệu theo quy định hiện hành, ai cũng mở ra dùng được ngay.</p>
    </header>

    <section class="section" aria-label="Người làm">
      <h2>Người làm</h2>
      <p>Web này do <strong>Ngô Minh Tuấn</strong> làm — một mình, từ viết công cụ tới viết bài. Tuấn làm Tiện Ích Hub vì thấy nhiều phép tính đời thường (lương về tay bao nhiêu, tiền điện tháng này bao nhiêu, đóng BHXH bao lâu thì được hưởng lương hưu) tra trên mạng thì mỗi nơi nói một kiểu, khó biết chỗ nào đúng. Web này chỉ làm một việc: tính đúng theo quy định hiện hành, giải thích rõ từng bước, và miễn phí.</p>
    </section>

    <section class="section" aria-label="Cách web hoạt động">
      <h2>Cách web hoạt động</h2>
      <p>Mọi tính toán chạy ngay trên trình duyệt của bạn — số bạn nhập không gửi lên máy chủ nào, web cũng không yêu cầu đăng ký tài khoản. Lịch sử "Dùng gần đây" trên trang chủ chỉ lưu trên trình duyệt của bạn, bấm "Xóa lịch sử" là hết. Giá vàng, tỷ giá, xổ số lấy từ nguồn công khai và làm mới hằng ngày; nguồn và giờ cập nhật ghi ngay dưới mỗi con số.</p>
      <p>Thấy số liệu nào sai, bấm nút "Báo sai số liệu" ở dưới mỗi công cụ — thư sẽ tới hộp thư của Tuấn.</p>
    </section>

    <section class="section" aria-label="Nguồn mở">
      <h2>Nguồn mở</h2>
      <p>Web dùng các thư viện nguồn mở dưới đây (đã tải về máy chủ của web, không nạp từ bên ngoài). Cảm ơn tác giả của từng thư viện.</p>
      <div class="about-lib">
        <h3>pdf.js</h3>
        <p>Trích văn bản từ file PDF (công cụ PDF sang Word).</p>
        <span class="about-license">Apache-2.0</span>
      </div>
      <div class="about-lib">
        <h3>pdf-lib</h3>
        <p>Gộp nhiều file PDF thành một file, tách trang PDF.</p>
        <span class="about-license">MIT</span>
      </div>
      <div class="about-lib">
        <h3>qrcode-generator</h3>
        <p>Vẽ mã QR (mã VietQR, mã QR cho link và văn bản).</p>
        <span class="about-license">MIT</span>
      </div>
      <div class="about-lib">
        <h3>SheetJS Community Edition</h3>
        <p>Đọc file Excel (.xlsx) khi nhập danh sách lớp ở Bàn giáo viên — chỉ tải về khi bạn chọn file .xlsx.</p>
        <p>© SheetJS LLC.</p>
        <span class="about-license">Apache-2.0</span>
      </div>
      <div class="about-lib">
        <h3>Phông chữ Inter và Be Vietnam Pro</h3>
        <p>Phông chữ hiển thị toàn web.</p>
        <span class="about-license">SIL Open Font License 1.1</span>
      </div>
    </section>

    <section class="section" aria-label="Liên hệ">
      <h2>Liên hệ</h2>
      <p>Góp ý, báo lỗi hay hợp tác — gửi email cho Tuấn: <a href="mailto:ngotuantdmu97@gmail.com?subject=G%C3%B3p%20%C3%BD%20Ti%E1%BB%87n%20%C3%8Dch%20Hub">ngotuantdmu97@gmail.com</a>. Tuấn đọc và trả lời mọi email.</p>
    </section>
  </div>`;
}
