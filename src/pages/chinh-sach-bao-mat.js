// Trang Chính sách bảo mật (/chinh-sach-bao-mat/) — viết theo Luật Bảo vệ
// dữ liệu cá nhân 91/2025/QH15 (hiệu lực 01/01/2026).
export function body() {
  return `
  <section class="section legal">
    <h1>Chính sách bảo mật</h1>
    <p class="muted">Cập nhật lần cuối: 17/11/2026 — Có hiệu lực từ 17/11/2026.</p>
    <p><strong>Tiện Ích Hub</strong> (tienichhub.io.vn) do <strong>Ngô Minh Tuấn</strong> vận hành. Email liên hệ: <a href="mailto:ngotuantdmu97@gmail.com">ngotuantdmu97@gmail.com</a>.</p>
    <p>Nguyên tắc của chúng tôi rất đơn giản: <strong>trang web này được thiết kế để không thu thập dữ liệu cá nhân của bạn</strong>. Chính sách dưới đây nói rõ chúng tôi (không) thu thập gì, dữ liệu nào nằm trên thiết bị của bạn, và quyền của bạn theo Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15.</p>

    <h2>1. Chúng tôi không thu thập dữ liệu cá nhân</h2>
    <ul>
      <li>Trang web <strong>không có tài khoản người dùng</strong>, không có form đăng ký, đăng nhập hay bình luận.</li>
      <li>Mọi tính toán trong công cụ <strong>chạy hoàn toàn trên trình duyệt của bạn</strong>. Dữ liệu bạn nhập vào công cụ (số tiền, ngày tháng, văn bản…) <strong>không được gửi lên máy chủ</strong> của chúng tôi.</li>
      <li>Trang web <strong>không theo dõi người dùng</strong>: không gắn mã theo dõi hành vi, không ghi lại lịch sử dùng công cụ của bạn, không bán hay chia sẻ dữ liệu cho bên thứ ba vì mục đích quảng cáo.</li>
      <li>Chúng tôi không đặt cookie theo dõi. Trang chỉ dùng bộ nhớ cục bộ của trình duyệt (xem mục 2).</li>
    </ul>

    <h2>2. Dữ liệu lưu trên thiết bị của bạn (localStorage)</h2>
    <p>Một số thông tin được lưu <strong>chỉ trên trình duyệt của chính bạn</strong>, không gửi đi đâu:</p>
    <ul>
      <li><strong>Lựa chọn giao diện sáng/tối</strong> (khóa <code>uh-theme</code>) để trang nhớ sở thích của bạn.</li>
      <li><strong>Dữ liệu bạn tự nhập vào một số công cụ</strong> (danh sách đồ mang theo, sự kiện đếm ngược, kỷ lục luyện cửu chương, số phiên Pomodoro — xem danh mục đầy đủ ở mục 9) để bạn mở lại vẫn còn. Các công cụ tính toán (lương, tiền điện, BMI…) không lưu nội dung bạn nhập.</li>
    </ul>
    <p>Bạn có thể xóa toàn bộ dữ liệu này bất cứ lúc nào qua mục xóa dữ liệu trang web trong cài đặt trình duyệt. Việc xóa không ảnh hưởng tới các công cụ khác.</p>

    <h2>3. Dữ liệu trực tiếp và bên thứ ba</h2>
    <p>Để hiển thị dữ liệu trực tiếp (giá vàng, tỉ giá, crypto, xổ số, tin tức, xu hướng GitHub), <strong>trình duyệt của bạn chỉ tải file dữ liệu tĩnh từ chính tên miền tienichhub.io.vn</strong>. Việc lấy dữ liệu gốc từ các nguồn công khai do máy chủ tự động thực hiện định kỳ — xem chi tiết ở mục 10, bao gồm cả ngoại lệ duy nhất (hai công cụ tra cứu GitHub gọi trực tiếp tới GitHub khi bạn bấm tra cứu).</p>

    <h2>4. Khi bạn liên hệ qua email</h2>
    <p>Nếu bạn gửi email tới <a href="mailto:ngotuantdmu97@gmail.com">ngotuantdmu97@gmail.com</a> (góp ý, khiếu nại bản quyền, báo lỗi…), chúng tôi nhận được địa chỉ email và nội dung bạn gửi. Thông tin này chỉ dùng để trả lời bạn và xử lý yêu cầu, không dùng cho mục đích khác, không chia sẻ cho bên thứ ba, và sẽ được xóa khi không còn cần thiết cho việc xử lý.</p>

    <h2>5. Quyền của bạn theo Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15</h2>
    <p>Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (hiệu lực từ 01/01/2026) trao cho chủ thể dữ liệu các quyền: được biết, đồng ý, truy cập, chỉnh sửa, xóa, hạn chế xử lý, phản đối và khiếu nại. Vì trang web không thu thập dữ liệu cá nhân của người dùng, chúng tôi không lưu trữ dữ liệu nào để cung cấp hay xóa theo yêu cầu truy cập/xóa dữ liệu. Nếu bạn cho rằng chúng tôi đang xử lý dữ liệu cá nhân của bạn trong trường hợp nào đó (ví dụ: qua email liên hệ ở mục 4), hãy gửi yêu cầu tới <a href="mailto:ngotuantdmu97@gmail.com">ngotuantdmu97@gmail.com</a> — chúng tôi sẽ phản hồi và xử lý theo quy định của Luật.</p>

    <h2>6. Bảo mật</h2>
    <p>Trang web được phân phối qua HTTPS. Vì không có máy chủ lưu dữ liệu người dùng, rủi ro rò rỉ dữ liệu cá nhân từ phía chúng tôi gần như không có. Dù vậy, bạn vẫn nên tự bảo vệ thiết bị của mình (không nhập thông tin nhạy cảm như mật khẩu, số thẻ vào bất kỳ công cụ trực tuyến nào, kể cả trang này).</p>

    <h2>7. Trẻ em</h2>
    <p>Trang web không hướng tới trẻ em dưới 16 tuổi và không cố ý thu thập dữ liệu của trẻ em. Phụ huynh có thể liên hệ email ở trên nếu có thắc mắc.</p>

    <h2>8. Thay đổi chính sách</h2>
    <p>Chúng tôi có thể cập nhật chính sách này khi có thay đổi về dịch vụ hoặc pháp luật; bản mới sẽ đăng tại trang này kèm ngày cập nhật. Nếu có thay đổi quan trọng (ví dụ: bắt đầu thu thập một loại dữ liệu nào đó), chúng tôi sẽ nêu rõ và chỉ áp dụng sau khi bạn đồng ý theo quy định.</p>

    <h2>9. Dữ liệu lưu trên thiết bị của bạn — danh mục chi tiết (localStorage)</h2>
    <p>Mục 2 đã nêu nguyên tắc chung; dưới đây là danh mục đầy đủ những gì trang web lưu trong bộ nhớ cục bộ của trình duyệt (localStorage), kiểm tra theo mã nguồn hiện tại. Tất cả đều <strong>chỉ nằm trên thiết bị của bạn</strong>, không gửi lên máy chủ của chúng tôi hay bất kỳ bên thứ ba nào:</p>
    <ul>
      <li><strong>Lựa chọn giao diện sáng/tối</strong> (khóa <code>uh-theme</code>, giá trị <code>dark</code> hoặc <code>light</code>) để trang nhớ sở thích của bạn.</li>
      <li><strong>Kỷ lục luyện cửu chương</strong> (khóa <code>uh_cuuchuong_best</code>): điểm cao nhất bạn đạt được trong công cụ luyện cửu chương.</li>
      <li><strong>Danh sách đồ mang theo</strong> (khóa <code>uh-checklist-vali</code>): các mục bạn đã tick trong công cụ checklist vali.</li>
      <li><strong>Số phiên Pomodoro trong ngày</strong> (khóa <code>uh_pomodoro_YYYY-MM-DD</code>, một khóa riêng cho mỗi ngày): số phiên tập trung bạn đã hoàn thành trong ngày đó.</li>
      <li><strong>Danh sách sự kiện đếm ngược</strong> (khóa <code>uh_events_v1</code>): các sự kiện bạn tự tạo trong công cụ đếm ngược sự kiện.</li>
    </ul>
    <p>Ngoài 5 mục trên, trang <strong>không lưu gì thêm</strong>: không có tính năng "dùng gần đây" hay "yêu thích", không lưu lịch sử công cụ bạn đã mở, và không lưu nội dung bạn nhập vào các công cụ tính toán (lương, tiền điện, BMI…). Để xóa toàn bộ dữ liệu trên, mở cài đặt trình duyệt và xóa dữ liệu trang web của tienichhub.io.vn; riêng giao diện sáng/tối, bạn cũng có thể đổi lại bằng nút chuyển giao diện trên trang. Việc xóa không ảnh hưởng tới hoạt động của các công cụ — lần mở sau, mọi thứ trở về mặc định.</p>

    <h2>10. Dữ liệu trực tiếp và bên thứ ba (kiến trúc snapshot)</h2>
    <p>Để hiển thị dữ liệu trực tiếp (giá vàng, tỉ giá, crypto, xổ số, tin tức, xu hướng GitHub), trang dùng kiến trúc snapshot: <strong>trình duyệt của bạn chỉ tải dữ liệu từ chính tên miền tienichhub.io.vn</strong>, dưới dạng file JSON tĩnh (ví dụ <code>/data/gold.json</code>, <code>/data/fx.json</code>, <code>/data/crypto.json</code>, <code>/data/lottery.json</code>, <code>/data/news.json</code>, <code>/data/trending.json</code>).</p>
    <p>Việc lấy dữ liệu gốc từ các nguồn (CoinGecko, open.er-api.com, vang.today, xskt.com.vn, api.github.com, alternative.me và các nguồn tin RSS) do <strong>máy chủ tự động (GitHub Actions)</strong> thực hiện định kỳ, rồi lưu thành file tĩnh nêu trên. Các API nguồn chỉ thấy địa chỉ IP của máy chủ, <strong>không thấy địa chỉ IP trình duyệt của bạn</strong>.</p>
    <p>Ngoại lệ: hai công cụ tra cứu GitHub tương tác (<strong>GitHub Trending</strong> và <strong>Tra cứu repo</strong>) vẫn gọi trực tiếp tới api.github.com từ trình duyệt của bạn khi bạn bấm tra cứu, vì kết quả phụ thuộc vào lựa chọn của bạn lúc đó. Khi đó, GitHub có thể thấy địa chỉ IP và thông tin trình duyệt của bạn như mọi lần bạn mở một trang web; việc xử lý dữ liệu đó tuân theo chính sách riêng của GitHub.</p>
    <p>Các bên thứ ba khác mà trình duyệt của bạn có thể chạm tới: <strong>Cloudflare</strong> (lưu trữ và phân phối trang web) và các trang ngoài khi bạn tự bấm link ra (nguồn tin, GitHub, ngân hàng…). Khi bạn bấm link ra ngoài, bạn chịu chính sách bảo mật của trang đích.</p>

    <h2>11. Phân tích lượt xem (Cloudflare Web Analytics)</h2>
    <p>Trang dùng <strong>Cloudflare Web Analytics</strong> để đếm lượt xem chung (trang nào, công cụ nào được dùng nhiều) nhằm cải thiện trang web. Dịch vụ này <strong>không dùng cookie, không thu thập thông tin nhận dạng cá nhân</strong> (không địa chỉ IP, không định danh thiết bị, không theo dõi hành vi từng người), nên không cần banner xin đồng ý. Chúng tôi chỉ xem số liệu tổng hợp, không xem và không lưu hành vi của từng người dùng.</p>

    <h2>12. VietQR và mã QR</h2>
    <p>Công cụ tạo VietQR và mã QR WiFi chạy hoàn toàn trên trình duyệt của bạn: mã QR được tạo ngay trên máy của bạn, thông tin bạn nhập <strong>không gửi lên máy chủ</strong> và không được lưu lại. Mã VietQR chỉ chứa thông tin chuyển khoản (ngân hàng nhận, số tài khoản nhận, số tiền, nội dung chuyển khoản). Khi quét mã, ứng dụng ngân hàng của người quét mở ra và xử lý giao dịch — trang web <strong>không thấy và không lưu</strong> số tài khoản người gửi hay bất kỳ thông tin giao dịch nào. Tương tự, mã QR WiFi chỉ chứa tên mạng và mật khẩu mà chính bạn nhập để chia sẻ; trang web không lưu mật khẩu đó.</p>

    <p>Mọi thắc mắc về bảo mật và dữ liệu cá nhân, xin liên hệ: <a href="mailto:ngotuantdmu97@gmail.com">ngotuantdmu97@gmail.com</a>.</p>
  </section>`;
}
