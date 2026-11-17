// Nội dung giới thiệu + FAQ cho 12 công cụ chính của Tiện Ích Hub.
//
// build.mjs nối dây (xem TOOL-CONTENT-WIRING.md): hiện intro phía trên khung
// công cụ, FAQ phía dưới, và dòng tham khảo khi finance = true.
// Khóa phải trùng meta.id của công cụ trong src/tools/*/*.js (đã kiểm tra).
// Nội dung viết tay, không chứa thẻ HTML; build.mjs escape khi chèn.
//
// Mọi con số trong FAQ đã tính lại bằng máy theo đúng công thức của từng
// công cụ trên trang (xem báo cáo bàn giao W12). Số nào chưa chắc thì FAQ
// viết định tính, không bịa số.
export const TOOL_CONTENT = {
  "luong-gross-net": {
    intro: "Tính lương net từ lương gross theo luật thuế và bảo hiểm 2026: bảo hiểm 10,5%, giảm trừ bản thân 15,5 triệu đồng, biểu thuế thu nhập cá nhân 5 bậc. Nhập lương gross, số người phụ thuộc và vùng lương tối thiểu để biết lương thực nhận và từng khoản khấu trừ.",
    finance: true,
    faqs: [
      {
        q: "Lương 15 triệu đóng BHXH bao nhiêu?",
        a: "1.575.000 đồng mỗi tháng: người lao động đóng 10,5% lương (8% BHXH cộng 1,5% BHYT cộng 1% BHTN), tức 15.000.000 nhân 10,5% bằng 1.575.000 đồng. Với lương này, sau khi trừ bảo hiểm và giảm trừ bản thân 15,5 triệu đồng thì thu nhập tính thuế bằng 0 nên không phải nộp thuế thu nhập cá nhân, lương net là 13.425.000 đồng."
      },
      {
        q: "Lương gross 30 triệu thì net được bao nhiêu?",
        a: "26.215.000 đồng (0 người phụ thuộc, đóng bảo hiểm trên toàn bộ lương): bảo hiểm 3.150.000 đồng, thu nhập tính thuế 11.350.000 đồng, thuế thu nhập cá nhân 635.000 đồng (10 triệu đầu chịu 5%, 1,35 triệu còn lại chịu 10%)."
      },
      {
        q: "Trần đóng BHXH năm 2026 là bao nhiêu?",
        a: "50.600.000 đồng mỗi tháng (từ 01/7/2026 theo Nghị định 161/2026). Lương cao hơn trần thì BHXH và BHYT chỉ tính trên 50,6 triệu đồng; riêng BHTN có trần riêng theo vùng, vùng I là 106.200.000 đồng."
      },
      {
        q: "Giảm trừ người phụ thuộc là bao nhiêu?",
        a: "6.200.000 đồng mỗi tháng cho mỗi người phụ thuộc, cộng thêm giảm trừ bản thân 15.500.000 đồng mỗi tháng. Ví dụ lương gross 30 triệu, 1 người phụ thuộc: thu nhập tính thuế giảm từ 11.350.000 xuống 5.150.000 đồng, thuế chỉ còn 257.500 đồng."
      },
      {
        q: "Lương net 20 triệu thì gross là bao nhiêu?",
        a: "Dùng chiều Net sang Gross của công cụ: nhập lương thực nhận, số người phụ thuộc và lương đóng bảo hiểm, công cụ tính ngược ra lương gross tương ứng, đã gồm bảo hiểm và thuế. Kết quả phụ thuộc vào các số bạn nhập nên cần nhập đúng mới ra con số chính xác."
      }
    ]
  },
  "tien-dien-bac-thang": {
    intro: "Tính tiền điện sinh hoạt theo biểu giá bậc thang 5 bậc mới nhất (Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026), đã gồm VAT 8%. Nhập số kWh tiêu thụ trong tháng để xem tiền từng bậc và tổng thanh toán.",
    finance: true,
    faqs: [
      {
        q: "Tiền điện 500 số giá bao nhiêu?",
        a: "1.450.872 đồng (đã gồm VAT 8%): 100 số đầu nhân 1.901 cộng 100 số nhân 2.289 cộng 200 số nhân 2.894 cộng 100 số nhân 3.456 bằng 1.343.400 đồng chưa thuế, cộng VAT 107.472 đồng."
      },
      {
        q: "Giá điện bậc thang 2026 có mấy bậc?",
        a: "5 bậc, theo Quyết định 2892/QĐ-BCT từ 01/11/2026: bậc 1 (0-100 kWh) 1.901 đồng, bậc 2 (101-200) 2.289 đồng, bậc 3 (201-400) 2.894 đồng, bậc 4 (401-700) 3.456 đồng, bậc 5 (trên 700) 3.844 đồng, tất cả chưa VAT. Tiền điện tính lũy tiến: mỗi bậc chỉ áp cho số kWh trong bậc đó, không áp một giá cho toàn bộ."
      },
      {
        q: "Tiền điện 250 số giá bao nhiêu?",
        a: "608.796 đồng đã gồm VAT 8%: 100 nhân 1.901 cộng 100 nhân 2.289 cộng 50 nhân 2.894 bằng 563.700 đồng chưa thuế, cộng VAT 45.096 đồng."
      },
      {
        q: "VAT tiền điện là bao nhiêu phần trăm?",
        a: "8% trên tổng tiền điện chưa thuế. Công cụ mặc định 8% và cho sửa lại nếu thuế suất thay đổi."
      }
    ]
  },
  "lai-vay": {
    intro: "Tính lãi vay và lịch trả nợ hàng tháng theo hai cách: trả đều mỗi tháng hoặc dư nợ giảm dần. Nhập số tiền vay, lãi suất năm và kỳ hạn để xem tiền trả từng tháng, tổng lãi và bảng lịch trả nợ chi tiết.",
    finance: true,
    faqs: [
      {
        q: "Vay 100 triệu lãi 12% trả bao nhiêu mỗi tháng?",
        a: "Trả đều 12 tháng: 8.884.879 đồng mỗi tháng, tổng lãi 6.618.546 đồng. Dư nợ giảm dần: tháng đầu 9.333.333 đồng rồi giảm dần, tổng lãi 6.500.000 đồng."
      },
      {
        q: "Trả đều và dư nợ giảm dần khác nhau thế nào?",
        a: "Trả đều: mỗi tháng trả một khoản bằng nhau, đầu kỳ lãi nhiều gốc ít, cuối kỳ ngược lại. Dư nợ giảm dần: gốc chia đều mỗi tháng, lãi tính trên dư nợ còn lại nên tháng đầu trả nhiều nhất rồi giảm dần; tổng lãi thường thấp hơn trả đều với cùng lãi suất và kỳ hạn."
      },
      {
        q: "Lãi suất 12%/năm thì mỗi tháng tính bao nhiêu?",
        a: "1% mỗi tháng trên dư nợ: 12% chia 12 tháng. Ví dụ vay 100 triệu, lãi tháng đầu là 1.000.000 đồng."
      },
      {
        q: "Vay càng dài hạn thì tổng lãi càng nhiều không?",
        a: "Đúng: cùng số tiền vay và lãi suất, kỳ hạn càng dài thì tổng lãi càng lớn, dù tiền trả mỗi tháng giảm. Dùng công cụ thử hai kỳ hạn để so sánh tổng lãi trước khi ký hợp đồng vay."
      }
    ]
  },
  "bmi": {
    intro: "Tính chỉ số BMI từ cân nặng và chiều cao để biết cơ thể đang thiếu cân, bình thường, thừa cân hay béo phì theo chuẩn WHO. Công cụ cũng gợi ý khoảng cân nặng lý tưởng cho chiều cao của bạn.",
    finance: false,
    faqs: [
      {
        q: "BMI bao nhiêu là bình thường?",
        a: "18,5-24,9 theo Tổ chức Y tế Thế giới (WHO). Dưới 18,5 là thiếu cân, 25-29,9 là thừa cân, từ 30 trở lên là béo phì."
      },
      {
        q: "BMI tính như thế nào?",
        a: "BMI bằng cân nặng (kg) chia cho bình phương chiều cao (m). Ví dụ 70 kg, cao 1,75 m: 70 chia cho (1,75 nhân 1,75) bằng 22,9, nằm trong khoảng bình thường."
      },
      {
        q: "Cao 1m75 nặng bao nhiêu là vừa?",
        a: "Khoảng 56,7-76,3 kg (BMI 18,5-24,9). Đây là khoảng tham khảo cho người trưởng thành; cân nặng hợp lý còn phụ thuộc vào tỷ lệ cơ, mỡ và thể trạng của mỗi người."
      },
      {
        q: "BMI có chính xác không?",
        a: "BMI là chỉ số sàng lọc nhanh, chưa phản ánh tỷ lệ cơ và mỡ. Người tập thể hình hoặc vận động viên có thể có BMI cao do cơ bắp chứ không phải mỡ thừa; trẻ em dưới 18 tuổi được đánh giá theo biểu đồ tăng trưởng theo tuổi, không dùng ngưỡng người lớn."
      }
    ]
  },
  "lich-am": {
    intro: "Lịch âm hôm nay và lịch tháng: đổi dương lịch sang âm lịch Việt Nam, xem can chi ngày, tháng, năm và chuyển đổi ngày bất kỳ cả hai chiều. Tính ngay trên trình duyệt theo múi giờ Việt Nam, không cần mạng.",
    finance: false,
    faqs: [
      {
        q: "Hôm nay là ngày bao nhiêu âm lịch?",
        a: "Mở công cụ là thấy ngay ngày âm hôm nay kèm can chi ngày, tháng, năm. Công cụ tính theo quy ước lịch Việt Nam (múi giờ cộng 7), ngày âm bắt đầu từ 0 giờ."
      },
      {
        q: "Đổi ngày dương sang ngày âm như thế nào?",
        a: "Nhập ngày dương bất kỳ vào ô chuyển đổi, công cụ trả về ngày âm tương ứng và ngược lại. Hữu ích khi tra ngày giỗ, ngày cúng hay sinh nhật âm lịch."
      },
      {
        q: "Tháng nhuận là gì?",
        a: "Tháng nhuận là tháng âm lịch dư ra để lịch âm khớp với năm dương lịch, khoảng 2-3 năm có một lần. Trong lịch Việt Nam, tháng nhuận là tháng không có trung khí. Công cụ tự tính đúng tháng nhuận theo quy tắc này."
      },
      {
        q: "Can chi là gì?",
        a: "Can chi là cách gọi năm, tháng, ngày bằng 10 thiên can (Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý) kết hợp với 12 địa chi (Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi), tạo thành chu kỳ 60 năm. Công cụ hiển thị can chi của ngày, tháng và năm hiện tại."
      }
    ]
  },
  "gia-vang-ty-gia": {
    intro: "Giá vàng SJC và tỉ giá trực tiếp: vàng miếng SJC, nhẫn SJC, DOJI, PNJ, vàng thế giới và tỉ giá 9 ngoại tệ so với đồng Việt Nam, kèm ô đổi ngoại tệ nhanh. Dữ liệu làm mới 2 lần mỗi ngày.",
    finance: true,
    faqs: [
      {
        q: "Giá vàng SJC hôm nay bao nhiêu?",
        a: "Mở công cụ để xem giá mua vào và bán ra mới nhất của vàng miếng SJC, nhẫn SJC, DOJI và PNJ. Giá làm mới 2 lần mỗi ngày (07:30 và 18:30), nguồn vang.today; giá mua bán thực tế theo niêm yết tại cửa hàng."
      },
      {
        q: "Giá vàng cập nhật mấy giờ?",
        a: "2 lần mỗi ngày, lúc 07:30 và 18:30 giờ Việt Nam. Trang ghi rõ giờ cập nhật của bảng giá đang hiển thị để bạn biết số liệu mới đến đâu."
      },
      {
        q: "1 USD bằng bao nhiêu tiền Việt?",
        a: "Tỉ giá USD/VND hiển thị ngay trong công cụ cùng 8 ngoại tệ khác (EUR, JPY, KRW, CNY, GBP, AUD, SGD, THB). Nhập số tiền vào ô đổi ngoại tệ để quy đổi nhanh."
      },
      {
        q: "Giá vàng trên trang có chính xác không?",
        a: "Số liệu lấy từ nguồn công khai (vang.today cho giá vàng, open.er-api.com cho tỉ giá) và chỉ để tham khảo. Giá vàng biến động liên tục trong ngày và mỗi cửa hàng niêm yết khác nhau, nên kiểm tra trực tiếp tại cửa hàng hoặc ngân hàng trước khi mua bán."
      }
    ]
  },
  "vietqr-wifi-qr": {
    intro: "Tạo mã VietQR chuyển khoản và mã QR WiFi miễn phí, ngay trên trình duyệt. VietQR chứa ngân hàng, số tài khoản, số tiền và nội dung chuyển khoản; khách quét mã là chuyển tiền đúng thông tin, không cần nhập tay.",
    finance: false,
    faqs: [
      {
        q: "VietQR là gì?",
        a: "VietQR là mã QR chuẩn của NAPAS cho chuyển khoản ngân hàng tại Việt Nam. Người quét mã bằng ứng dụng ngân hàng sẽ thấy sẵn ngân hàng nhận, số tài khoản, số tiền và nội dung, chỉ cần xác nhận là chuyển, không lo nhập nhầm số tài khoản."
      },
      {
        q: "Tạo VietQR có mất phí không?",
        a: "Không. Công cụ tạo mã miễn phí, không cần đăng nhập. Mã QR được tạo ngay trên trình duyệt của bạn, thông tin tài khoản không gửi lên máy chủ."
      },
      {
        q: "Mã QR WiFi dùng để làm gì?",
        a: "Khách quét mã là điện thoại tự kết nối WiFi, không cần gõ mật khẩu. Tiện cho quán cà phê, nhà hàng, văn phòng hoặc khi có khách đến nhà."
      },
      {
        q: "Quét VietQR có an toàn không?",
        a: "Mã QR chỉ chứa thông tin chuyển khoản bạn tự nhập (ngân hàng, số tài khoản, số tiền, nội dung). Việc chuyển tiền diễn ra trong ứng dụng ngân hàng của người quét; trang web không thấy và không lưu thông tin giao dịch. Luôn kiểm tra tên người nhận trong ứng dụng ngân hàng trước khi xác nhận."
      }
    ]
  },
  "tien-nuoc-bac-thang": {
    intro: "Tính tiền nước sinh hoạt theo bậc thang lũy tiến, gồm VAT 5% và phí bảo vệ môi trường 10%. Giá từng bậc sửa được theo địa phương, mặc định theo giá Hà Nội cho hộ dân cư.",
    finance: true,
    faqs: [
      {
        q: "25m3 nước hết bao nhiêu tiền?",
        a: "303.600 đồng theo giá Hà Nội mặc định: 10 m3 nhân 8.500 cộng 10 m3 nhân 9.900 cộng 5 m3 nhân 16.000 bằng 264.000 đồng, cộng VAT 5% (13.200 đồng) và phí bảo vệ môi trường 10% (26.400 đồng). Giá mỗi địa phương khác nhau, nhớ sửa lại theo hóa đơn của bạn."
      },
      {
        q: "Giá nước sinh hoạt tính theo bậc nào?",
        a: "Mặc định theo Hà Nội (Quyết định 3541/QĐ-UBND): bậc 1 (0-10 m3) 8.500 đồng, bậc 2 (trên 10-20 m3) 9.900 đồng, bậc 3 (trên 20-30 m3) 16.000 đồng, bậc 4 (trên 30 m3) 27.000 đồng mỗi m3, chưa gồm thuế và phí. Mỗi địa phương có biểu giá riêng, công cụ cho sửa từng bậc."
      },
      {
        q: "Tiền nước gồm những khoản phí gì?",
        a: "Ngoài tiền nước theo bậc còn có VAT 5% và phí bảo vệ môi trường 10% với nước thải sinh hoạt (Nghị định 53/2020/NĐ-CP), cả hai tính trên tiền nước trước thuế. Công cụ hiển thị riêng từng khoản để bạn đối chiếu với hóa đơn."
      },
      {
        q: "Dùng 10m3 nước hết bao nhiêu tiền?",
        a: "97.750 đồng theo giá Hà Nội: 10 nhân 8.500 bằng 85.000 đồng, cộng VAT 5% (4.250 đồng) và phí môi trường 10% (8.500 đồng). Hộ chính sách và hộ nghèo được giữ mức 5.973 đồng/m3 cho 10 m3 đầu."
      }
    ]
  },
  "lai-kep": {
    intro: "Tính lãi kép và tiết kiệm dài hạn: vốn ban đầu cộng gửi thêm hàng tháng, lãi cộng dồn vào gốc mỗi tháng. Xem tổng tài sản, tổng gốc đã gửi và tổng lãi nhận được sau từng năm.",
    finance: true,
    faqs: [
      {
        q: "Gửi 1 triệu mỗi tháng 10 năm được bao nhiêu?",
        a: "Với lãi suất 6%/năm, sau 10 năm có khoảng 163.879.347 đồng: gốc đã gửi 120.000.000 đồng, lãi 43.879.347 đồng. Lãi kép tính theo tháng, khoản gửi thêm cộng vào cuối mỗi tháng."
      },
      {
        q: "Lãi kép là gì?",
        a: "Lãi kép là lãi được cộng vào gốc, rồi kỳ sau tính lãi trên tổng mới (gốc cộng lãi cũ). Nhờ vậy tiền sinh lãi ngày càng nhanh theo thời gian, khác với lãi đơn chỉ tính trên gốc ban đầu."
      },
      {
        q: "Gửi 100 triệu lãi 6% 10 năm được bao nhiêu?",
        a: "Khoảng 181.939.673 đồng nếu không rút lãi và lãi suất giữ nguyên 6%/năm, lãi kép theo tháng. Tiền lãi là 81.939.673 đồng, gần bằng số vốn ban đầu."
      },
      {
        q: "Gửi tiết kiệm bao lâu thì tiền tăng gấp đôi?",
        a: "Theo quy tắc 72: lấy 72 chia cho lãi suất năm sẽ ra số năm gần đúng để tiền tăng gấp đôi. Ví dụ lãi 6%/năm thì khoảng 12 năm (72 chia 6 bằng 12). Đây là ước tính nhanh; dùng công cụ để tính chính xác theo lãi kép từng tháng."
      }
    ]
  },
  "tro-cap-thoi-viec-bhtn": {
    intro: "Tính trợ cấp thất nghiệp (BHTN) và trợ cấp thôi việc: mức hưởng hàng tháng bằng 60% lương bình quân đóng BHTN 6 tháng gần nhất, cộng số tháng được hưởng theo thời gian đã đóng. Nhập lương và số tháng đóng để ước tính.",
    finance: true,
    faqs: [
      {
        q: "Đóng BHTN 2 năm được hưởng mấy tháng trợ cấp?",
        a: "3 tháng. Đóng đủ 12-36 tháng được hưởng 3 tháng; cứ thêm đủ 12 tháng đóng thì cộng 1 tháng, tối đa 12 tháng."
      },
      {
        q: "Trợ cấp thất nghiệp được bao nhiêu một tháng?",
        a: "60% lương bình quân đóng BHTN 6 tháng gần nhất. Ví dụ lương bình quân 12 triệu đồng thì trợ cấp 7.200.000 đồng mỗi tháng. Mức hưởng tối đa không quá 5 lần lương tối thiểu vùng."
      },
      {
        q: "Nghỉ việc bao lâu thì được nhận trợ cấp thất nghiệp?",
        a: "Phải đóng BHTN đủ 12 tháng trở lên trong 24 tháng trước khi nghỉ việc mới đủ điều kiện. Sau khi nghỉ, nộp hồ sơ trong 3 tháng kể từ ngày chấm dứt hợp đồng lao động; quá hạn sẽ không được hưởng đợt đó."
      },
      {
        q: "Trợ cấp thôi việc khác gì trợ cấp thất nghiệp?",
        a: "Trợ cấp thất nghiệp do quỹ BHTN chi trả, tính theo 60% lương đóng BHTN. Trợ cấp thôi việc do người sử dụng lao động trả cho thời gian làm việc trước 01/01/2009 chưa tham gia BHTN: nửa tháng lương cho mỗi năm làm việc. Công cụ tính cả hai khoản."
      }
    ]
  },
  "thue-vat": {
    intro: "Tính thuế VAT và tách hóa đơn: cộng VAT vào giá chưa thuế hoặc tách VAT ra khỏi giá đã có thuế với thuế suất 8%, 10%, 5%, 0% hoặc tùy chọn. Xem rõ tiền trước thuế, tiền VAT và tổng thanh toán.",
    finance: true,
    faqs: [
      {
        q: "1 triệu chưa VAT cộng VAT 10% là bao nhiêu?",
        a: "1.100.000 đồng: tiền VAT là 100.000 đồng (1.000.000 nhân 10%)."
      },
      {
        q: "Tách VAT 10% ra khỏi 1.100.000 như thế nào?",
        a: "Chia cho 1,1: tiền trước thuế là 1.000.000 đồng, tiền VAT là 100.000 đồng. Công thức chung: tiền trước thuế bằng giá đã có VAT chia cho (1 cộng thuế suất)."
      },
      {
        q: "VAT 8% áp dụng cho hàng hóa nào?",
        a: "Mức 8% là mức giảm áp dụng cho nhiều hàng hóa, dịch vụ theo chính sách giảm thuế từng thời kỳ, ví dụ tiền điện sinh hoạt hiện chịu VAT 8%. Mức phổ biến vẫn là 10%; một số mặt hàng chịu 5% hoặc 0%. Kiểm tra hóa đơn hoặc hỏi người bán để biết thuế suất đúng của mặt hàng."
      },
      {
        q: "Giá 1 triệu đã gồm VAT 8% thì VAT là bao nhiêu?",
        a: "Tiền trước thuế là 925.926 đồng (1.000.000 chia 1,08), tiền VAT là 74.074 đồng."
      }
    ]
  },
  "luong-thang-13": {
    intro: "Tính lương tháng 13 và thuế thu nhập cá nhân phải nộp trên khoản thưởng: thưởng tính theo tỷ lệ tháng làm việc trong năm, thuế tính theo biểu thuế lũy tiến 5 bậc năm 2026 trên thu nhập của tháng nhận thưởng.",
    finance: true,
    faqs: [
      {
        q: "Lương tháng 13 là gì?",
        a: "Lương tháng 13 là khoản thưởng cuối năm, thường bằng một tháng lương cho người làm đủ 12 tháng trong năm. Đây là khoản thưởng theo thỏa thuận hoặc quy chế công ty, không phải khoản bắt buộc theo luật; mức cụ thể tùy từng doanh nghiệp."
      },
      {
        q: "Lương 15 triệu làm đủ 12 tháng thì tháng 13 được bao nhiêu?",
        a: "Thưởng 15.000.000 đồng, thuế thu nhập cá nhân trên khoản thưởng khoảng 950.000 đồng (0 người phụ thuộc, chưa tính bảo hiểm tháng nhận thưởng), thực nhận 14.050.000 đồng. Thuế tính trên thu nhập tháng nhận thưởng (lương cộng thưởng) trừ giảm trừ gia cảnh."
      },
      {
        q: "Làm 6 tháng có được lương tháng 13 không?",
        a: "Thường được tính theo tỷ lệ: 6 tháng làm việc thì thưởng bằng nửa tháng lương, ví dụ lương 15 triệu thì thưởng 7.500.000 đồng. Mức cụ thể tùy quy chế công ty, có nơi yêu cầu làm đủ số tháng tối thiểu mới được thưởng."
      },
      {
        q: "Lương tháng 13 có phải đóng thuế không?",
        a: "Có. Thưởng tháng 13 tính vào thu nhập chịu thuế của tháng nhận thưởng và chịu thuế thu nhập cá nhân theo biểu thuế lũy tiến 5 bậc năm 2026. Công cụ tính phần thuế tăng thêm do khoản thưởng gây ra, không phải thuế của cả tháng."
      },
      {
        q: "Lương tháng 13 có phải đóng BHXH không?",
        a: "Không. Thưởng tháng 13 không tính vào lương đóng bảo hiểm xã hội, chỉ chịu thuế thu nhập cá nhân. Công cụ chỉ trừ thuế trên khoản thưởng, không trừ bảo hiểm."
      }
    ]
  }
};
