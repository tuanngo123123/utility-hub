// Dữ liệu mục Hướng dẫn (/huong-dan/): bài viết gốc do Tiện Ích Hub tự
// viết — hướng dẫn cách tính, cách làm gắn với công cụ trên web. KHÔNG
// đăng lại/dịch bài báo, KHÔNG viết kiểu tin tức, KHÔNG bình luận độc
// giả (ranh giới pháp lý: nội dung tổng hợp tin tức cần giấy phép ICP
// mà cá nhân không xin được — xem báo cáo pháp lý 17/11/2026).
// Số liệu trong bài đã kiểm chứng và khớp với công cụ trên web (thuế
// TNCN 2026, giá điện QĐ 2892/QĐ-BCT, lệ phí môn bài, BHXH một lần);
// mỗi bài ghi nguồn văn bản ở cuối + ngày đăng.
export const ARTICLES = [
  {
    slug: 'cach-tinh-luong-gross-net-2026',
    title: 'Cách tính lương Gross sang Net 2026',
    desc: 'Gross trừ bảo hiểm 10,5% rồi tính thuế TNCN 5 bậc — kèm 2 ví dụ tính sẵn: Gross 30 triệu → Net 26.215.000đ.',
    date: '18/11/2026',
    cta: {
      url: '/cong-cu/luong-gross-net/',
      label: 'Tính lương Gross – Net ngay →',
      text: 'Không cần tính tay — nhập lương Gross vào công cụ để ra lương Net ngay, đổi được cả chiều Net sang Gross.',
    },
    sources: 'Luật Thuế thu nhập cá nhân 109/2025/QH15 (Điều 9 — biểu thuế 5 bậc); Nghị quyết 110/2025/UBTVQH15 (mức giảm trừ gia cảnh); Nghị định 161/2026/NĐ-CP (trần đóng BHXH/BHYT 50.600.000đ từ 01/7/2026).',
    body: `
<p>Khi đi làm, con số ghi trong hợp đồng thường là lương Gross — lương trước khi trừ bảo hiểm và thuế. Số tiền thực nhận vào tài khoản là lương Net, luôn thấp hơn Gross. Bài này hướng dẫn cách tính lương Net từ lương Gross theo quy định 2026, kèm 2 ví dụ tính sẵn để bạn đối chiếu với bảng lương của mình.</p>
<nav class="hd-toc" aria-label="Trong bài này"><p><strong>Trong bài này</strong></p><ul>
<li><a href="#gross-net-la-gi">Lương Gross và lương Net khác nhau thế nào</a></li>
<li><a href="#ba-khoan-tru">Ba khoản trừ khỏi lương Gross</a></li>
<li><a href="#thue-tncn">Thuế thu nhập cá nhân tính thế nào</a></li>
<li><a href="#vi-du-30-trieu">Ví dụ 1 — Lương Gross 30 triệu, không người phụ thuộc</a></li>
<li><a href="#vi-du-45-trieu">Ví dụ 2 — Lương Gross 45 triệu, 1 người phụ thuộc</a></li>
<li><a href="#luu-y">Mấy lưu ý khi đối chiếu với bảng lương</a></li>
</ul></nav>
<h2 id="gross-net-la-gi">Lương Gross và lương Net khác nhau thế nào</h2>
<p><strong>Lương Gross</strong> là tổng lương công ty thỏa thuận trả cho bạn, chưa trừ khoản gì. <strong>Lương Net</strong> là số tiền bạn thực nhận sau khi trừ hai nhóm khoản: bảo hiểm bắt buộc và thuế thu nhập cá nhân (TNCN). Công thức ngắn gọn:</p>
<p><strong>Lương Net = Lương Gross − Bảo hiểm bắt buộc (10,5%) − Thuế TNCN</strong></p>
<p>Phần bảo hiểm công ty đóng thêm cho bạn (phần của người sử dụng lao động) không nằm trong lương Gross và không bị trừ vào lương của bạn, nên khi tính Net bạn chỉ trừ phần bảo hiểm của người lao động.</p>
<h2 id="ba-khoan-tru">Ba khoản trừ khỏi lương Gross</h2>
<p>Người lao động đóng 3 khoản bảo hiểm bắt buộc, tính trên lương Gross:</p>
<ul>
<li><strong>BHXH: 8%</strong> — bảo hiểm xã hội (hưu trí, tử tuất).</li>
<li><strong>BHYT: 1,5%</strong> — bảo hiểm y tế.</li>
<li><strong>BHTN: 1%</strong> — bảo hiểm thất nghiệp.</li>
</ul>
<p>Tổng cộng <strong>10,5% lương Gross</strong>. Ví dụ lương Gross 30 triệu đồng thì bảo hiểm là 3.150.000đ. Lưu ý: BHXH và BHYT có trần đóng là 50.600.000đ/tháng — lương cao hơn trần thì phần vượt trần không phải đóng BHXH/BHYT nữa. BHTN có trần riêng theo vùng lương tối thiểu.</p>
<h2 id="thue-tncn">Thuế thu nhập cá nhân tính thế nào</h2>
<p>Thuế TNCN không tính trên toàn bộ lương Gross mà tính trên <strong>thu nhập tính thuế</strong> — phần còn lại sau khi trừ bảo hiểm và các khoản giảm trừ:</p>
<p><strong>Thu nhập tính thuế = Lương Gross − Bảo hiểm (10,5%) − Giảm trừ bản thân 15.500.000đ − 6.200.000đ × số người phụ thuộc</strong></p>
<p>Từ kỳ tính thuế 2026, mức giảm trừ bản thân là 15,5 triệu đồng/tháng và mỗi người phụ thuộc được giảm trừ 6,2 triệu đồng/tháng. Thu nhập tính thuế sau đó áp biểu thuế lũy tiến từng phần 5 bậc:</p>
<table class="tbl">
<tr><th>Bậc</th><th>Thu nhập tính thuế/tháng</th><th>Thuế suất</th></tr>
<tr><td>1</td><td>Đến 10 triệu đồng</td><td>5%</td></tr>
<tr><td>2</td><td>Trên 10 đến 30 triệu đồng</td><td>10%</td></tr>
<tr><td>3</td><td>Trên 30 đến 60 triệu đồng</td><td>20%</td></tr>
<tr><td>4</td><td>Trên 60 đến 100 triệu đồng</td><td>30%</td></tr>
<tr><td>5</td><td>Trên 100 triệu đồng</td><td>35%</td></tr>
</table>
<p><strong>Lũy tiến từng phần</strong> nghĩa là mỗi phần thu nhập chỉ chịu thuế suất của bậc chứa nó, không phải toàn bộ thu nhập chịu mức cao nhất. Ví dụ thu nhập tính thuế 11.350.000đ thì 10 triệu đầu chịu 5%, chỉ 1.350.000đ còn lại chịu 10%.</p>
<h2 id="vi-du-30-trieu">Ví dụ 1 — Lương Gross 30 triệu, không người phụ thuộc</h2>
<ol>
<li><strong>Bảo hiểm:</strong> 30.000.000đ × 10,5% = 3.150.000đ.</li>
<li><strong>Thu nhập tính thuế:</strong> 30.000.000 − 3.150.000 − 15.500.000 = 11.350.000đ.</li>
<li><strong>Thuế TNCN:</strong> 10.000.000 × 5% = 500.000đ; 1.350.000 × 10% = 135.000đ. Tổng thuế: 635.000đ.</li>
<li><strong>Lương Net:</strong> 30.000.000 − 3.150.000 − 635.000 = <strong>26.215.000đ</strong>.</li>
</ol>
<h2 id="vi-du-45-trieu">Ví dụ 2 — Lương Gross 45 triệu, 1 người phụ thuộc</h2>
<ol>
<li><strong>Bảo hiểm:</strong> 45.000.000đ × 10,5% = 4.725.000đ.</li>
<li><strong>Thu nhập tính thuế:</strong> 45.000.000 − 4.725.000 − 15.500.000 − 6.200.000 = 18.575.000đ.</li>
<li><strong>Thuế TNCN:</strong> 10.000.000 × 5% = 500.000đ; 8.575.000 × 10% = 857.500đ. Tổng thuế: 1.357.500đ.</li>
<li><strong>Lương Net:</strong> 45.000.000 − 4.725.000 − 1.357.500 = <strong>38.917.500đ</strong>.</li>
</ol>
<h2 id="luu-y">Mấy lưu ý khi đối chiếu với bảng lương</h2>
<ul>
<li><strong>Lương thấp thì thuế rất ít, thậm chí bằng 0.</strong> Lương Gross khoảng 17,3 triệu đồng/tháng trở xuống (không người phụ thuộc) thì thu nhập tính thuế đã về 0 sau khi trừ bảo hiểm và giảm trừ bản thân — chưa phải đóng thuế TNCN. Mỗi người phụ thuộc nâng ngưỡng này thêm khoảng 6,9 triệu lương Gross.</li>
<li><strong>Phụ cấp không phải khoản nào cũng tính thuế.</strong> Một số khoản phụ cấp (ăn trưa trong mức quy định, trang phục…) không tính vào thu nhập chịu thuế, nên bảng lương thực tế có thể cho số thuế thấp hơn cách tính gọn trong bài này.</li>
<li><strong>Thuế tính theo tháng nhưng quyết toán theo năm.</strong> Số thuế khấu trừ hằng tháng là tạm tính; cuối năm quyết toán có thể được hoàn hoặc phải nộp thêm tùy thu nhập thực tế cả năm.</li>
<li>Kết quả trong bài chỉ mang tính tham khảo theo quy định chung — trường hợp cụ thể (người nước ngoài, thu nhập nhiều nguồn, giảm trừ khác) đối chiếu với cơ quan thuế hoặc bộ phận nhân sự của công ty bạn.</li>
</ul>`,
  },
  {
    slug: 'cach-tinh-tien-dien-bac-thang-2026',
    title: 'Cách tính tiền điện bậc thang 2026',
    desc: 'Biểu giá 5 bậc từ 01/11/2026 (QĐ 2892/QĐ-BCT) + VAT 8% — ví dụ 350 kWh hết 921.348đ.',
    date: '18/11/2026',
    cta: {
      url: '/cong-cu/tien-dien-bac-thang/',
      label: 'Tính tiền điện của bạn →',
      text: 'Nhập số kWh tháng này vào công cụ để ra tiền điện ngay, kèm bảng chi tiết từng bậc.',
    },
    sources: 'Quyết định 2892/QĐ-BCT (biểu giá điện sinh hoạt 5 bậc, hiệu lực 01/11/2026). Điện sinh hoạt chịu thuế VAT 8%.',
    body: `
<p>Từ 01/11/2026, giá điện sinh hoạt tính theo biểu giá 5 bậc, thay cho biểu 6 bậc cũ. Giá mỗi bậc tính theo lũy tiến từng phần: dùng càng nhiều, phần vượt càng chịu giá cao hơn — nhưng chỉ phần vượt mới chịu giá cao, không phải toàn bộ số điện nhà bạn. Bài này hướng dẫn cách tính kèm 2 ví dụ tính sẵn.</p>
<nav class="hd-toc" aria-label="Trong bài này"><p><strong>Trong bài này</strong></p><ul>
<li><a href="#bieu-gia-5-bac">Biểu giá 5 bậc từ 01/11/2026</a></li>
<li><a href="#cach-tinh">Cách tính tiền điện trong 3 bước</a></li>
<li><a href="#vi-du-350">Ví dụ 1 — Dùng 350 kWh</a></li>
<li><a href="#vi-du-500">Ví dụ 2 — Dùng 500 kWh</a></li>
<li><a href="#doc-hoa-don">Đọc hóa đơn tiền điện thế nào</a></li>
<li><a href="#vi-sao-cang-dat">Vì sao dùng càng nhiều, mỗi kWh thêm càng đắt</a></li>
</ul></nav>
<h2 id="bieu-gia-5-bac">Biểu giá 5 bậc từ 01/11/2026</h2>
<table class="tbl">
<tr><th>Bậc</th><th>Mức dùng</th><th>Giá (chưa VAT)</th></tr>
<tr><td>1</td><td>0 – 100 kWh</td><td>1.901 đ/kWh</td></tr>
<tr><td>2</td><td>101 – 200 kWh</td><td>2.289 đ/kWh</td></tr>
<tr><td>3</td><td>201 – 400 kWh</td><td>2.894 đ/kWh</td></tr>
<tr><td>4</td><td>401 – 700 kWh</td><td>3.456 đ/kWh</td></tr>
<tr><td>5</td><td>Trên 700 kWh</td><td>3.844 đ/kWh</td></tr>
</table>
<p>Giá trên chưa gồm thuế VAT. Điện sinh hoạt chịu VAT 8% — tiền điện cuối cùng bằng tiền điện chưa VAT nhân với 1,08.</p>
<h2 id="cach-tinh">Cách tính tiền điện trong 3 bước</h2>
<ol>
<li><strong>Chia số kWh vào từng bậc.</strong> 100 kWh đầu vào bậc 1, 100 kWh tiếp theo vào bậc 2, 200 kWh tiếp theo vào bậc 3, 300 kWh tiếp theo vào bậc 4, phần còn lại vào bậc 5.</li>
<li><strong>Nhân từng phần với giá của bậc đó rồi cộng lại.</strong> Đây là tiền điện chưa VAT.</li>
<li><strong>Cộng VAT 8%.</strong> Lấy tiền chưa VAT nhân 1,08 là ra số tiền phải trả.</li>
</ol>
<h2 id="vi-du-350">Ví dụ 1 — Dùng 350 kWh</h2>
<ol>
<li>100 kWh đầu × 1.901đ = 190.100đ (bậc 1).</li>
<li>100 kWh tiếp × 2.289đ = 228.900đ (bậc 2).</li>
<li>150 kWh còn lại × 2.894đ = 434.100đ (bậc 3).</li>
<li>Tiền chưa VAT: 190.100 + 228.900 + 434.100 = 853.100đ.</li>
<li>VAT 8%: 853.100 × 8% = 68.248đ.</li>
<li><strong>Tổng tiền điện: 853.100 + 68.248 = 921.348đ.</strong></li>
</ol>
<h2 id="vi-du-500">Ví dụ 2 — Dùng 500 kWh</h2>
<ol>
<li>100 kWh × 1.901đ = 190.100đ (bậc 1).</li>
<li>100 kWh × 2.289đ = 228.900đ (bậc 2).</li>
<li>200 kWh × 2.894đ = 578.800đ (bậc 3).</li>
<li>100 kWh còn lại × 3.456đ = 345.600đ (bậc 4).</li>
<li>Tiền chưa VAT: 190.100 + 228.900 + 578.800 + 345.600 = 1.343.400đ.</li>
<li>VAT 8%: 1.343.400 × 8% = 107.472đ.</li>
<li><strong>Tổng tiền điện: 1.343.400 + 107.472 = 1.450.872đ.</strong></li>
</ol>
<h2 id="doc-hoa-don">Đọc hóa đơn tiền điện thế nào</h2>
<p>Hóa đơn tiền điện hằng tháng ghi đủ các số liệu để bạn tự đối chiếu: chỉ số công tơ đầu kỳ và cuối kỳ, điện năng tiêu thụ trong tháng (kWh), bảng tiền điện chia theo từng bậc, tiền VAT và tổng số tiền phải trả. Cách đối chiếu nhanh nhất là lấy số kWh trên hóa đơn nhập vào công cụ tính tiền điện — nếu kết quả khớp với hóa đơn thì số tiền đúng.</p>
<p>Nếu một tháng tiền điện tăng đột biến, kiểm tra số kWh trước: thường nguyên nhân là dùng nhiều hơn (trời nắng nóng phải bật điều hòa nhiều, nhà thêm thiết bị mới) chứ không phải giá điện thay đổi. Giá điện chỉ thay đổi khi có quyết định điều chỉnh mới của cơ quan có thẩm quyền.</p>
<h2 id="vi-sao-cang-dat">Vì sao dùng càng nhiều, mỗi kWh thêm càng đắt</h2>
<p>Vì giá tính lũy tiến nên <strong>mỗi kWh thêm vào có giá bằng bậc cao nhất mà hộ bạn đang dùng tới</strong>. Hộ dùng 350 kWh đang ở bậc 3: mỗi kWh thêm tốn 2.894đ + VAT, tức khoảng 3.126đ. Hộ dùng trên 700 kWh: mỗi kWh thêm ở bậc 5, tốn 3.844đ + VAT, tức khoảng 4.152đ — đắt hơn gần một phần ba so với bậc 3.</p>
<p>Tính bình quân: 350 kWh hết 921.348đ, tức khoảng 2.632đ/kWh; 500 kWh hết 1.450.872đ, tức khoảng 2.902đ/kWh. Dùng thêm 150 kWh (từ 350 lên 500) làm tiền điện tăng 529.524đ — phần điện thêm này có giá bình quân khoảng 3.530đ/kWh, cao hơn hẳn giá bình quân chung.</p>
<p>Muốn giảm tiền điện, cách hiệu quả nhất là giảm số kWh ở các bậc cao — tức giảm tổng lượng dùng. Tắt thiết bị khi không dùng, để điều hòa ở 26–27°C và hạn chế dùng nhiều thiết bị công suất lớn cùng lúc là những cách đơn giản nhất, không tốn thêm chi phí.</p>`,
  },
  {
    slug: 'le-phi-mon-bai-2026-ho-kinh-doanh-duoc-mien',
    title: 'Lệ phí môn bài 2026: hộ kinh doanh được miễn',
    desc: 'Lệ phí môn bài bãi bỏ hoàn toàn từ 01/01/2026 — hộ kinh doanh nộp 0đ, không phải khai. Năm 2025 vẫn nộp, hạn 30/01/2026.',
    date: '18/11/2026',
    cta: {
      url: '/cong-cu/le-phi-mon-bai/',
      label: 'Kiểm tra lệ phí môn bài →',
      text: 'Chọn năm 2026 để thấy mức 0đ, hoặc chọn năm 2025 để tính mức cũ phải nộp.',
    },
    sources: 'Khoản 7 Điều 10 Nghị quyết 198/2025/QH15; Nghị định 362/2025/NĐ-CP (bãi bỏ NĐ 139/2016 và NĐ 22/2020, hiệu lực 01/01/2026); Công văn hỏa tốc 645/CT-CS của Cục Thuế. Mức cũ năm 2025: Điều 4 NĐ 139/2016/NĐ-CP (sửa đổi bởi NĐ 22/2020/NĐ-CP); hạn nộp 30/01/2026 theo NĐ 126/2020/NĐ-CP.',
    body: `
<p>Từ 01/01/2026, lệ phí môn bài được bãi bỏ hoàn toàn — hộ kinh doanh, cá nhân kinh doanh và doanh nghiệp đều không phải nộp lệ phí này nữa, cũng không phải nộp tờ khai lệ phí môn bài. Bài này nói rõ ai được miễn, năm 2025 còn phải nộp bao nhiêu, và hộ mới thành lập năm 2026 cần làm gì.</p>
<nav class="hd-toc" aria-label="Trong bài này"><p><strong>Trong bài này</strong></p><ul>
<li><a href="#bai-bo-tu-2026">Bãi bỏ hoàn toàn từ 01/01/2026</a></li>
<li><a href="#nam-2025-van-nop">Năm 2025 vẫn phải nộp — hạn chót 30/01/2026 đã qua</a></li>
<li><a href="#muc-cu-2025">Mức cũ năm 2025 để đối chiếu</a></li>
<li><a href="#ho-moi-2026">Hộ mới thành lập năm 2026 thì sao</a></li>
</ul></nav>
<h2 id="bai-bo-tu-2026">Bãi bỏ hoàn toàn từ 01/01/2026</h2>
<p>Căn cứ khoản 7 Điều 10 Nghị quyết 198/2025/QH15 và Nghị định 362/2025/NĐ-CP, lệ phí môn bài được bãi bỏ hoàn toàn từ ngày 01/01/2026. Cụ thể:</p>
<ul>
<li><strong>Không phải nộp tiền:</strong> lệ phí môn bài năm 2026 trở đi là 0đ cho mọi đối tượng — hộ kinh doanh, cá nhân kinh doanh, doanh nghiệp, chi nhánh.</li>
<li><strong>Không phải nộp tờ khai:</strong> người nộp thuế cũng không phải nộp tờ khai lệ phí môn bài nữa (Công văn hỏa tốc 645/CT-CS của Cục Thuế).</li>
<li><strong>Không cần làm đơn xin miễn:</strong> việc bãi bỏ áp dụng chung cho mọi người nộp thuế theo quy định của pháp luật, không cần đăng ký hay làm thủ tục gì thêm.</li>
</ul>
<p>Nói cách khác, từ năm 2026, lệ phí môn bài không còn là một khoản phải nộp hằng năm nữa — hộ kinh doanh bớt được một khoản chi phí cố định đầu năm.</p>
<h2 id="nam-2025-van-nop">Năm 2025 vẫn phải nộp — hạn chót 30/01/2026 đã qua</h2>
<p>Việc bãi bỏ chỉ áp dụng từ năm 2026. <strong>Lệ phí môn bài năm 2025 vẫn phải nộp</strong> — đây là năm cuối cùng phải nộp, hạn nộp chậm nhất là ngày 30/01/2026. <strong>Hạn này đã qua</strong> — hộ kinh doanh nào tới nay vẫn chưa nộp lệ phí năm 2025 thì đã quá hạn, cần nộp ngay số tiền còn nợ. Tiền chậm nộp có thể đã phát sinh — kiểm tra số tiền cụ thể với cơ quan thuế quản lý trực tiếp.</p>
<p>Nếu bạn đã nộp lệ phí năm 2025 rồi thì không cần làm gì thêm — không có chuyện được hoàn lại vì việc bãi bỏ chỉ có hiệu lực từ năm 2026.</p>
<h2 id="muc-cu-2025">Mức cũ năm 2025 để đối chiếu</h2>
<p>Bảng dưới đây là mức lệ phí của năm 2025 (năm cuối cùng phải nộp), để bạn đối chiếu xem mình đã nộp đúng chưa:</p>
<p><strong>Hộ kinh doanh, cá nhân kinh doanh</strong> — theo doanh thu năm trước liền kề:</p>
<table class="tbl">
<tr><th>Doanh thu năm trước</th><th>Lệ phí năm 2025</th></tr>
<tr><td>Trên 500 triệu đồng</td><td>1.000.000đ/năm</td></tr>
<tr><td>Trên 300 đến 500 triệu đồng</td><td>500.000đ/năm</td></tr>
<tr><td>Trên 100 đến 300 triệu đồng</td><td>300.000đ/năm</td></tr>
<tr><td>Từ 100 triệu đồng trở xuống</td><td>Miễn (0đ)</td></tr>
</table>
<p><strong>Doanh nghiệp</strong> — theo vốn điều lệ hoặc vốn đầu tư:</p>
<table class="tbl">
<tr><th>Đối tượng</th><th>Lệ phí năm 2025</th></tr>
<tr><td>Vốn điều lệ trên 10 tỷ đồng</td><td>3.000.000đ/năm</td></tr>
<tr><td>Vốn điều lệ từ 10 tỷ đồng trở xuống</td><td>2.000.000đ/năm</td></tr>
<tr><td>Chi nhánh, văn phòng đại diện, địa điểm kinh doanh</td><td>1.000.000đ/năm</td></tr>
</table>
<p><strong>Ra hoạt động trong 6 tháng cuối năm 2025 chỉ nộp 50% mức cả năm:</strong> hộ kinh doanh hoặc doanh nghiệp bắt đầu hoạt động từ tháng 7 đến tháng 12 năm 2025 thì mức phải nộp là một nửa mức trong bảng trên — ví dụ hộ doanh thu 420 triệu đồng thì nộp 250.000đ thay vì 500.000đ. Quy định này không áp dụng khi đã được miễn lệ phí trong năm đầu thành lập.</p>
<p>Một lưu ý cho năm 2025 trở về trước: hộ kinh doanh và doanh nghiệp mới thành lập được miễn lệ phí môn bài trong năm đầu tiên thành lập. Từ năm 2026 thì quy định này không còn ý nghĩa nữa vì lệ phí đã bãi bỏ với tất cả mọi người.</p>
<h2 id="ho-moi-2026">Hộ mới thành lập năm 2026 thì sao</h2>
<p>Hộ kinh doanh mới thành lập trong năm 2026 không phải nộp lệ phí môn bài và không phải khai lệ phí môn bài. Bạn chỉ cần thực hiện các nghĩa vụ thuế khác theo quy định (nếu có) như đăng ký thuế, kê khai và nộp thuế giá trị gia tăng, thuế thu nhập cá nhân tùy theo phương pháp tính thuế của hộ mình. Nghĩa vụ cụ thể của từng hộ đối chiếu với cơ quan thuế quản lý trực tiếp.</p>`,
  },
  {
    slug: 'cach-tinh-bhxh-mot-lan-2026',
    title: 'Cách tính BHXH một lần 2026',
    desc: '1,5 tháng lương bình quân/năm trước 2014 + 2 tháng/năm từ 2014 — kèm ví dụ và điều kiện rút theo Luật BHXH 2024.',
    date: '18/11/2026',
    cta: {
      url: '/cong-cu/bhxh-mot-lan/',
      label: 'Ước tính BHXH một lần →',
      text: 'Nhập số năm đã đóng trước và từ năm 2014 cùng lương bình quân để ước tính số tiền rút.',
    },
    sources: 'Điều 70 Luật Bảo hiểm xã hội 41/2024/QH15 (hiệu lực 01/7/2025). Mức thực tế do cơ quan BHXH xác định theo hồ sơ đóng của bạn.',
    body: `
<p>BHXH một lần là khoản tiền người lao động nhận một lần thay cho lương hưu, khi không còn tham gia BHXH và đủ điều kiện rút. Bài này hướng dẫn cách tính theo Điều 70 Luật BHXH 2024 (41/2024/QH15, hiệu lực 01/7/2025), kèm ví dụ tính sẵn và điều kiện rút mới nhất.</p>
<nav class="hd-toc" aria-label="Trong bài này"><p><strong>Trong bài này</strong></p><ul>
<li><a href="#bhxh-mot-lan-la-gi">BHXH một lần là gì</a></li>
<li><a href="#ai-duoc-rut">Ai được rút một lần</a></li>
<li><a href="#cong-thuc">Công thức tính</a></li>
<li><a href="#vi-du">Ví dụ tính sẵn</a></li>
<li><a href="#luu-y">Mấy lưu ý trước khi rút</a></li>
</ul></nav>
<h2 id="bhxh-mot-lan-la-gi">BHXH một lần là gì</h2>
<p>Khi đi làm, hằng tháng một phần lương của bạn (và phần công ty đóng thêm) đi vào quỹ bảo hiểm xã hội. Bình thường, số tiền này tích lũy thành thời gian đóng để sau này hưởng lương hưu hằng tháng. <strong>Rút BHXH một lần</strong> nghĩa là bạn nhận gộp toàn bộ quyền lợi đã tích lũy thành một khoản tiền duy nhất, thay vì chờ lương hưu.</p>
<p>Đổi lại, thời gian đóng đã hưởng một lần sẽ không còn được tính cho lương hưu sau này. Đây là quyết định không lấy lại được, nên cần cân nhắc kỹ — đặc biệt nếu bạn đã đóng nhiều năm và còn trẻ.</p>
<h2 id="ai-duoc-rut">Ai được rút một lần</h2>
<p>Luật BHXH 2024 chia người lao động thành hai nhóm, điều kiện rút khác nhau:</p>
<ul>
<li><strong>Đã tham gia BHXH trước ngày 01/7/2025:</strong> được rút sau 12 tháng không tham gia BHXH bắt buộc lẫn BHXH tự nguyện, nếu chưa đủ 20 năm đóng.</li>
<li><strong>Bắt đầu đóng từ ngày 01/7/2025 trở đi:</strong> chỉ được rút khi thuộc một trong các trường hợp: đủ tuổi nghỉ hưu mà chưa đủ 15 năm đóng; ra nước ngoài để định cư; mắc bệnh hiểm nghèo; hoặc suy giảm khả năng lao động từ 81% trở lên.</li>
</ul>
<p>Nói ngắn gọn: người đóng BHXH từ lâu vẫn giữ quyền rút sau 12 tháng nghỉ việc; người mới bắt đầu đóng từ giữa năm 2025 thì việc rút một lần bị siết chặt hơn nhiều.</p>
<h2 id="cong-thuc">Công thức tính</h2>
<p>Theo khoản 3 Điều 70 Luật BHXH 2024, mức hưởng BHXH một lần tính trên <strong>mức bình quân tiền lương tháng đóng BHXH</strong> của bạn:</p>
<ul>
<li><strong>Mỗi năm đóng trước năm 2014:</strong> 1,5 tháng mức bình quân.</li>
<li><strong>Mỗi năm đóng từ năm 2014 trở đi:</strong> 2 tháng mức bình quân.</li>
</ul>
<p>Cách tính tháng lẻ: tháng lẻ trước năm 2014 được chuyển sang giai đoạn từ năm 2014 để tính; tháng lẻ từ 1 đến 6 tháng tính là nửa năm, từ 7 đến 11 tháng tính là 1 năm. Trường hợp đóng chưa đủ 1 năm: mức hưởng bằng số tiền đã đóng vào quỹ hưu trí – tử tuất, nhưng không quá 2 tháng mức bình quân.</p>
<h2 id="vi-du">Ví dụ tính sẵn</h2>
<p>Bạn đóng BHXH 5 năm trước năm 2014 và 8 năm từ năm 2014 trở đi, mức bình quân tiền lương tháng đóng BHXH là 8.000.000đ:</p>
<ol>
<li><strong>Giai đoạn trước 2014:</strong> 5 năm × 1,5 tháng = 7,5 tháng.</li>
<li><strong>Giai đoạn từ 2014:</strong> 8 năm × 2 tháng = 16 tháng.</li>
<li><strong>Tổng:</strong> 7,5 + 16 = 23,5 tháng × 8.000.000đ = <strong>188.000.000đ</strong>.</li>
</ol>
<h2 id="luu-y">Mấy lưu ý trước khi rút</h2>
<ul>
<li><strong>Số tiền trên chỉ là ước tính.</strong> Mức bình quân tiền lương tháng đóng BHXH được tính từ lương đóng của toàn bộ thời gian tham gia, trong đó lương các năm trước còn được điều chỉnh theo hệ số trượt giá. Mức hưởng thực tế do cơ quan BHXH xác định theo hồ sơ đóng của bạn.</li>
<li><strong>Tra cứu trước khi tính.</strong> Bạn có thể xem thời gian đóng và mức đóng của mình trên ứng dụng VssID (Bảo hiểm xã hội số) rồi nhập đúng số liệu vào công cụ để ước tính sát hơn.</li>
<li><strong>Rút rồi thì thời gian đó mất.</strong> Thời gian đóng đã hưởng BHXH một lần không được tính lại cho lương hưu. Nếu sau này bạn đi làm và đóng BHXH trở lại thì thời gian đóng tính lại từ đầu.</li>
<li><strong>Cân nhắc giữ lại nếu gần đủ năm hưởng hưu.</strong> Người đã đóng gần đủ 15–20 năm thường thiệt hơn khi rút một lần so với việc giữ lại để hưởng lương hưu hằng tháng sau này.</li>
</ul>`,
  },
  {
    slug: 'cach-viet-cv-sinh-vien-moi-ra-truong',
    title: 'Cách viết CV sinh viên mới ra trường',
    desc: 'CV 1 trang cho người chưa có kinh nghiệm: 6 mục, viết cụ thể bằng số, kèm gợi ý theo 3 nhóm ngành.',
    date: '18/11/2026',
    cta: {
      url: '/sinh-vien/cv-sinh-vien-moi-ra-truong/',
      label: 'Xem mẫu CV sinh viên →',
      text: 'Mẫu CV 1 trang viết sẵn trong mục Sinh viên — cấu trúc 6 mục, gợi ý theo từng nhóm ngành và ví dụ CV hoàn chỉnh đã điền.',
    },
    sources: 'Nội dung do Tiện Ích Hub tự viết, theo mẫu CV sinh viên mới ra trường trong mục Sinh viên của web.',
    body: `
<p>Chưa có kinh nghiệm không có nghĩa là CV trống. Nhà tuyển dụng đọc CV sinh viên mới ra trường để xem bạn học gì, làm được gì và có nghiêm túc với công việc không. Bài này hướng dẫn cấu trúc CV 1 trang — đủ dùng cho thực tập và việc làm đầu tiên.</p>
<nav class="hd-toc" aria-label="Trong bài này"><p><strong>Trong bài này</strong></p><ul>
<li><a href="#nguyen-tac">Nguyên tắc chung: 1 trang, cụ thể bằng số</a></li>
<li><a href="#sau-muc">6 mục của CV 1 trang</a></li>
<li><a href="#viet-bang-so">Viết bằng số, không viết chung chung</a></li>
<li><a href="#goi-y-theo-nganh">Gợi ý theo ngành</a></li>
<li><a href="#truoc-khi-gui">Kiểm tra trước khi gửi</a></li>
</ul></nav>
<h2 id="nguyen-tac">Nguyên tắc chung: 1 trang, cụ thể bằng số</h2>
<p>CV xin thực tập hay việc làm đầu tiên không cần dài — <strong>1 trang, đủ 6 mục</strong> dưới đây là đủ. Nhà tuyển dụng chỉ dành khoảng nửa phút đọc lướt CV, nên mỗi dòng phải nói được điều gì đó cụ thể. Hai nguyên tắc quan trọng nhất:</p>
<ul>
<li><strong>Viết cụ thể bằng số thay vì chung chung.</strong> "Tổ chức chương trình cho 300 sinh viên" thuyết phục hơn nhiều so với "có kinh nghiệm tổ chức sự kiện".</li>
<li><strong>Đừng mở đầu bằng "chưa có kinh nghiệm".</strong> Nhà tuyển dụng đọc CV để thấy bạn làm được gì, không phải để thấy bạn thiếu gì. Thay vào đó, đưa học vấn, đồ án và hoạt động lên trước.</li>
</ul>
<h2 id="sau-muc">6 mục của CV 1 trang</h2>
<ol>
<li><strong>Thông tin liên hệ:</strong> họ tên, số điện thoại, email (địa chỉ nghiêm túc, dạng hoten@gmail.com), link LinkedIn hoặc GitHub nếu có. Không cần ghi ngày sinh, quê quán, số CCCD.</li>
<li><strong>Mục tiêu nghề nghiệp:</strong> 2–3 dòng, ghi rõ vị trí muốn ứng tuyển và điều bạn mang lại. Ví dụ: "Ứng tuyển vị trí thực tập sinh kế toán. Muốn áp dụng kiến thức kế toán tài chính đã học vào công việc thực tế và học hỏi quy trình kế toán doanh nghiệp."</li>
<li><strong>Học vấn:</strong> trường, ngành, năm học, GPA (ghi nếu từ 3.0/4.0 trở lên). Đồ án tốt nghiệp ghi ngay dưới mục này: tên đề tài + kết quả đạt được.</li>
<li><strong>Kỹ năng:</strong> chia 2 nhóm — chuyên môn (ví dụ: Excel, phân tích số liệu, AutoCAD, Python…) và ngoại ngữ/tin học (kèm chứng chỉ nếu có). Chỉ ghi kỹ năng bạn thực sự dùng được.</li>
<li><strong>Kinh nghiệm làm thêm:</strong> ghi cả việc không đúng ngành nếu nó rèn kỹ năng liên quan — bán hàng rèn giao tiếp và thuyết phục, gia sư rèn trình bày và kiên nhẫn.</li>
<li><strong>Hoạt động:</strong> 2–4 mục, mỗi mục 1–2 dòng, ghi KẾT QUẢ bằng số. Câu lạc bộ, cuộc thi, hoạt động tình nguyện đều tính — miễn là bạn nói được mình đã làm gì và đạt kết quả gì.</li>
</ol>
<p>Mẫu CV trong mục Sinh viên có sẵn một ví dụ CV hoàn chỉnh đã điền (bạn Nguyễn Thu Hà, sinh viên Marketing) để bạn tham khảo cách trình bày — xem tại <a href="/sinh-vien/cv-sinh-vien-moi-ra-truong/">mẫu CV sinh viên mới ra trường</a>.</p>
<h2 id="viet-bang-so">Viết bằng số, không viết chung chung</h2>
<p>Cùng một hoạt động, cách viết khác nhau tạo ấn tượng khác nhau:</p>
<ul>
<li><strong>Chung chung:</strong> "Tham gia hoạt động Đoàn, có tinh thần trách nhiệm."</li>
<li><strong>Cụ thể:</strong> "Tổ chức chương trình chào tân sinh viên cho 300 sinh viên, huy động 5 nhà tài trợ."</li>
</ul>
<p>Câu thứ hai cho nhà tuyển dụng thấy quy mô công việc và kết quả thật. Ngoài ra, dùng động từ mạnh khi mô tả: <strong>đạt, tổ chức, xây dựng, thiết kế, tiết kiệm</strong>… thay vì "tham gia", "được giao". Động từ mạnh đặt bạn vào vị trí người làm ra kết quả, không phải người đứng xem.</p>
<h2 id="goi-y-theo-nganh">Gợi ý theo ngành</h2>
<ul>
<li><strong>Kinh tế – quản trị:</strong> nhấn mạnh Excel (hàm, PivotTable), phân tích số liệu, kinh nghiệm thực tập hoặc bán hàng, chứng chỉ MOS và tiếng Anh.</li>
<li><strong>Kỹ thuật:</strong> đồ án môn học, phần mềm chuyên ngành (AutoCAD, SolidWorks, MATLAB…), thực tập nhà máy hoặc xưởng, khả năng đọc bản vẽ.</li>
<li><strong>Công nghệ thông tin:</strong> link GitHub và dự án cá nhân (ghi rõ công nghệ đã dùng, link demo nếu có), ngôn ngữ lập trình thành thạo, tham gia hackathon hoặc câu lạc bộ lập trình.</li>
</ul>
<h2 id="truoc-khi-gui">Kiểm tra trước khi gửi</h2>
<ul>
<li>Kiểm tra chính tả 2 lần, nhờ 1 người khác đọc lại trước khi gửi — lỗi chính tả trong CV là lỗi dễ tránh nhất nhưng cũng dễ bị loại nhất.</li>
<li>Lưu file PDF, đặt tên "CV-Ho-va-ten-Vi-tri-ung-tuyen.pdf" để nhà tuyển dụng tìm lại được file của bạn.</li>
<li>Viết riêng cho từng vị trí: lấy từ khóa trong tin tuyển dụng (tên kỹ năng, công cụ) đưa vào mục kỹ năng và kinh nghiệm một cách tự nhiên — nhiều công ty dùng phần mềm ATS lọc hồ sơ trước khi người đọc.</li>
<li>Trình bày đơn giản để ATS đọc được: 1 cột, không dùng bảng lồng nhau, text box, ảnh nền hay thanh kỹ năng phần trăm. Ghi mức độ bằng chữ (Thành thạo / Khá / Cơ bản).</li>
<li>Gửi kèm email ngắn giới thiệu bản thân — đừng gửi CV trống không. Trong email nói rõ bạn ứng tuyển vị trí nào và vì sao phù hợp trong 3–4 câu.</li>
<li>Nếu sau 1 tuần chưa có phản hồi, có thể gửi email hỏi lại lịch sự 1 lần — đừng nhắn dồn nhiều lần.</li>
</ul>`,
  },
];
