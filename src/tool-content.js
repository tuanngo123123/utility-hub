// Nội dung giới thiệu + FAQ cho các công cụ chính của Tiện Ích Hub
// (17 mục: 15 mục có FAQ, 2 mục thuế TNCN + lương hưu chỉ có intro/
// legalBasis/example, chưa có FAQ).
//
// Ngoài intro/finance/disclaimer/faqs, mục SEO lô 1 (19/11/2026) có thêm:
//  - legalBasis: dòng "Cập nhật theo quy định áp dụng từ…" (căn cứ pháp
//    lý đã kiểm chứng trong code/bài hướng dẫn — không bịa số hiệu văn bản).
//  - example: { text, fills, tab? } — ví dụ đã tính sẵn BẰNG MÁY theo
//    đúng công thức của công cụ (text hiển thị + nút "Thử với số này"
//    điền fills vào form; tab là selector tab cần mở trước khi điền).
//    Mọi con số trong text phải khớp kết quả công cụ tính ra với fills đó.
//
// build.mjs nối dây (xem TOOL-CONTENT-WIRING.md): hiện intro phía trên khung
// công cụ, FAQ phía dưới, và dòng tham khảo khi finance = true.
// Khóa phải trùng meta.id của công cụ trong src/tools/*/*.js (đã kiểm tra).
// Nội dung viết tay, không chứa thẻ HTML; build.mjs escape khi chèn.
// Công cụ finance nhưng không thuộc thuế/ngân hàng (điện, nước, BHXH...)
// ghi thêm trường disclaimer để build dùng câu miễn trừ đúng ngữ cảnh.
//
// Mọi con số trong FAQ đã tính lại bằng máy theo đúng công thức của từng
// công cụ trên trang (xem báo cáo bàn giao W12). Số nào chưa chắc thì FAQ
// viết định tính, không bịa số.
export const TOOL_CONTENT = {
  "luong-gross-net": {
    intro: "Tính lương net từ lương gross theo luật thuế và bảo hiểm 2026: bảo hiểm 10,5%, giảm trừ bản thân 15,5 triệu đồng, biểu thuế thu nhập cá nhân 5 bậc. Nhập lương gross, số người phụ thuộc và vùng lương tối thiểu để biết lương thực nhận và từng khoản khấu trừ.",
    finance: true,
    legalBasis: "Cập nhật theo Luật Thuế TNCN 109/2025/QH15 (biểu thuế 5 bậc), Nghị quyết 110/2025/UBTVQH15 (giảm trừ bản thân 15,5 triệu đồng, người phụ thuộc 6,2 triệu đồng) và Nghị định 161/2026/NĐ-CP (trần đóng BHXH/BHYT 50.600.000₫ từ 01/7/2026).",
    updatedAt: "19/11/2026",
    example: {
      text: "Lương Gross 30.000.000₫, đóng bảo hiểm trên toàn bộ lương, 0 người phụ thuộc: bảo hiểm 3.150.000₫, thu nhập tính thuế 11.350.000₫, thuế TNCN 635.000₫ → lương Net 26.215.000₫/tháng.",
      fills: { 'lggn-salary': '30.000.000', 'lggn-ins': '30.000.000', 'lggn-dep': '0' },
      tab: '#lggn-tab-g2n',
    },
    faqs: [
      {
        q: "Lương 15 triệu đóng BHXH bao nhiêu?",
        a: "1.575.000₫ mỗi tháng: người lao động đóng 10,5% lương (8% BHXH cộng 1,5% BHYT cộng 1% BHTN), tức 15.000.000 nhân 10,5% bằng 1.575.000₫. Với lương này, sau khi trừ bảo hiểm và giảm trừ bản thân 15,5 triệu đồng thì thu nhập tính thuế bằng 0 nên không phải nộp thuế thu nhập cá nhân, lương net là 13.425.000₫."
      },
      {
        q: "Lương gross 30 triệu thì net được bao nhiêu?",
        a: "26.215.000₫ (0 người phụ thuộc, đóng bảo hiểm trên toàn bộ lương): bảo hiểm 3.150.000₫, thu nhập tính thuế 11.350.000₫, thuế thu nhập cá nhân 635.000₫ (10 triệu đầu chịu 5%, 1,35 triệu còn lại chịu 10%)."
      },
      {
        q: "Trần đóng BHXH năm 2026 là bao nhiêu?",
        a: "50.600.000₫ mỗi tháng (từ 01/7/2026 theo Nghị định 161/2026). Lương cao hơn trần thì BHXH và BHYT chỉ tính trên 50,6 triệu đồng; riêng BHTN có trần riêng theo vùng, vùng I là 106.200.000₫."
      },
      {
        q: "Giảm trừ người phụ thuộc là bao nhiêu?",
        a: "6.200.000₫ mỗi tháng cho mỗi người phụ thuộc, cộng thêm giảm trừ bản thân 15.500.000₫ mỗi tháng. Ví dụ lương gross 30 triệu, 1 người phụ thuộc: thu nhập tính thuế giảm từ 11.350.000 xuống 5.150.000₫, thuế chỉ còn 257.500₫."
      },
      {
        q: "Lương net 20 triệu thì gross là bao nhiêu?",
        a: "Dùng chiều Net sang Gross của công cụ: nhập lương thực nhận, số người phụ thuộc và lương đóng bảo hiểm, công cụ tính ngược ra lương gross tương ứng, đã gồm bảo hiểm và thuế. Kết quả phụ thuộc vào các số bạn nhập nên cần nhập đúng mới ra con số chính xác."
      }
    ]
  },
  "thue-thu-nhap-ca-nhan": {
    intro: "Tính thuế thu nhập cá nhân 2026 từ lương theo biểu lũy tiến 5 bậc: nhập lương Gross, lương đóng bảo hiểm và số người phụ thuộc để xem thu nhập tính thuế, thuế từng bậc và thuế cả năm.",
    finance: true,
    legalBasis: "Cập nhật theo Luật Thuế TNCN 109/2025/QH15 (Điều 9 — biểu thuế 5 bậc), Nghị quyết 110/2025/UBTVQH15 (giảm trừ bản thân 15,5 triệu đồng, người phụ thuộc 6,2 triệu đồng) và Nghị định 161/2026/NĐ-CP (trần đóng BHXH/BHYT 50.600.000₫ từ 01/7/2026).",
    updatedAt: "19/11/2026",
    example: {
      text: "Lương Gross 45.000.000₫, đóng bảo hiểm trên toàn bộ lương, 1 người phụ thuộc: bảo hiểm 4.725.000₫, thu nhập tính thuế 18.575.000₫ → thuế TNCN 1.357.500₫/tháng (cả năm 16.290.000₫).",
      fills: { 'tncn-gross': '45.000.000', 'tncn-ins': '45.000.000', 'tncn-dep': '1' },
      tab: '#tncn-tab-salary',
    },
    faqs: [],
  },
  "quyet-toan-thue-tncn-2026": {
    intro: "Tính thuế thu nhập cá nhân phải nộp cả năm 2026 theo biểu lũy tiến năm: nhập tổng thu nhập, bảo hiểm đã đóng, người phụ thuộc, chi phí y tế/giáo dục (nếu có) và thuế đã khấu trừ để biết được hoàn hay phải nộp thêm bao nhiêu, kèm hạn nộp và nơi nộp hồ sơ quyết toán.",
    finance: true,
    legalBasis: "Cập nhật theo Luật Thuế TNCN 109/2025/QH15 (Điều 9 — biểu thuế 5 bậc), Nghị quyết 110/2025/UBTVQH15 (giảm trừ bản thân 15,5 triệu đồng, người phụ thuộc 6,2 triệu đồng), Nghị định 253/2026/NĐ-CP (giảm trừ y tế 23 triệu đồng, giáo dục 24 triệu đồng; ủy quyền quyết toán), Nghị định 373/2025/NĐ-CP (nơi nộp hồ sơ) và Thông tư 89/2026/TT-BTC (miễn quyết toán khi nộp thêm không quá 50.000₫).",
    updatedAt: "19/11/2026",
    example: {
      text: "Làm 8 tháng trong năm, lương 40.000.000₫/tháng, 0 người phụ thuộc: thu nhập cả năm 320.000.000₫, bảo hiểm 33.600.000₫, giảm trừ bản thân đủ 12 tháng 186.000.000₫, thu nhập tính thuế 100.400.000₫ → thuế cả năm 5.020.000₫; đã khấu trừ 12.240.000₫ nên được hoàn 7.220.000₫.",
      fills: { 'qttt-income': '320.000.000', 'qttt-insurance': '33.600.000', 'qttt-deps': '0', 'qttt-dep-months': '12', 'qttt-medical': '', 'qttt-edu': '', 'qttt-withheld': '12.240.000' },
    },
    faqs: [
      {
        q: "Làm việc chưa đủ 12 tháng thì giảm trừ bản thân bao nhiêu?",
        a: "Đủ 12 tháng, tức 186.000.000₫, khi quyết toán (điểm b khoản 1 Điều 48 Nghị định 253/2026) — kể cả bạn chỉ làm vài tháng trong năm. Ví dụ làm 8 tháng, lương 40 triệu đồng/tháng: thu nhập cả năm 320.000.000₫, bảo hiểm 33.600.000₫, thu nhập tính thuế 100.400.000₫, thuế cả năm 5.020.000₫; đã khấu trừ 12.240.000₫ nên được hoàn 7.220.000₫."
      },
      {
        q: "Hạn quyết toán thuế TNCN 2026 là ngày nào?",
        a: "Cá nhân tự quyết toán: 3/5/2027 (thứ Hai) — hạn gốc 30/4/2027 rơi vào ngày lễ nên dời sang ngày làm việc tiếp theo. Tổ chức trả thu nhập quyết toán thay: 31/3/2027. Nếu bạn thuộc diện được hoàn thuế thì nộp hồ sơ hoàn trễ không bị phạt hành chính."
      },
      {
        q: "Được hoàn thuế thì bao lâu nhận được tiền?",
        a: "Nộp hồ sơ điện tử qua eTax Mobile, đủ điều kiện thì hệ thống hoàn tự động trong 3 ngày làm việc (Công văn 1296/CT-NVT). Bạn nên nộp sau khi nơi trả thu nhập đã quyết toán xong (sau 31/3/2027) để hệ thống đủ dữ liệu, và tài khoản ngân hàng nhận hoàn phải đã xác thực trên eTax Mobile."
      },
      {
        q: "Nộp thêm bao nhiêu thì được miễn quyết toán?",
        a: "Số thuế nộp thêm không quá 50.000₫ thì bạn được miễn, không phải nộp hồ sơ quyết toán (Điều 66 Thông tư 89/2026). Ví dụ thuế cả năm 5.020.000₫ mà đã khấu trừ 5.000.000₫ thì chỉ nộp thêm 20.000₫ nên được miễn."
      },
      {
        q: "Giảm trừ chi phí y tế, giáo dục tối đa bao nhiêu?",
        a: "Y tế tối đa 23.000.000₫/năm, giáo dục tối đa 24.000.000₫/năm (tổng 47 triệu đồng). Chỉ tính chi phí thực tế tự trả, có chứng từ hợp lệ — y tế là tiền khám chữa bệnh tại cơ sở trong nước thuộc danh mục BHYT chi trả; giáo dục chỉ tính học phí, không tính tiền ăn, đồng phục hay sách vở. Muốn giảm trừ hai khoản này thì bạn phải tự quyết toán, không được ủy quyền cho nơi trả thu nhập."
      }
    ]
  },
  "tron-de-trac-nghiem": {
    intro: "Trộn đề trắc nghiệm thành nhiều mã đề khác nhau để chống quay cóp: dán đề gốc hoặc tải file Word, đánh dấu đáp án đúng bằng *, chọn số mã đề rồi nhận đề đã trộn kèm bảng đáp án để in và chấm.",
    faqs: [
      {
        q: "Đánh dấu đáp án đúng thế nào?",
        a: "Thêm dấu * trước đáp án đúng trong đề gốc — ví dụ *B. Hà Nội (hoặc B. *Hà Nội). Mỗi câu chỉ được 1 đáp án đúng; câu nào thiếu dấu * hoặc có 2 dấu * sẽ bị báo lỗi và không được trộn."
      },
      {
        q: "Mã đề được đánh số ra sao?",
        a: "Mã đề chạy từ 101 trở đi theo thứ tự: chọn 4 mã đề thì có 101, 102, 103, 104; chọn 8 mã đề thì tới 108. Đây là cách đánh mã đề quen thuộc ở trường phổ thông."
      },
      {
        q: "Câu hỏi bị báo lỗi thì sao?",
        a: "Câu thiếu nội dung, thiếu đáp án đúng hoặc có ít hơn 2 đáp án sẽ bị loại khỏi đợt trộn và hiện rõ lý do trong khung xem trước. Bạn sửa lại câu đó trong ô đề gốc rồi bấm Trộn đề lần nữa."
      },
      {
        q: "In đề cho học sinh có lộ đáp án không?",
        a: "Không. Đề đã trộn chỉ in câu hỏi và các đáp án chưa đánh dấu; bảng đáp án nằm riêng và chỉ in khi bạn bấm nút In đáp án. File Word tải về có bảng đáp án ở cuối file — nhớ xóa phần đó trước khi in cho học sinh."
      },
      {
        q: "Tải file Word về sửa được không?",
        a: "Được. File tải về mở bằng Word hoặc LibreOffice, sửa như văn bản thường. Bạn có thể thêm tên trường, đổi phông chữ hoặc chèn hình rồi in."
      }
    ]
  },
  "so-diem-lop-tt22": {
    intro: "Sổ điểm lớp theo Thông tư 22/2021/TT-BGDĐT: nhập điểm thường xuyên, giữa kỳ, cuối kỳ dạng bảng như Excel, công cụ tự tính ĐTB môn học kỳ, ĐTB môn cả năm và xếp loại chung Tốt/Khá/Đạt/Chưa đạt kèm luật điều chỉnh 1 môn. Lấy danh sách lớp từ Bàn giáo viên hoặc dán danh sách, xuất Excel, in sổ điểm.",
    legalBasis: "Tính theo Thông tư 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo, áp dụng cho học sinh THCS và THPT.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "ĐTB môn học kỳ tính thế nào?",
        a: "ĐTB môn học kỳ = (tổng điểm thường xuyên + 2 × điểm giữa kỳ + 3 × điểm cuối kỳ) / (số điểm thường xuyên + 5), làm tròn 1 chữ số thập phân. Ví dụ: TX 8, 7, 9; GK 7,5; CK 8 thì (24 + 15 + 24) / 8 = 7,875 → 7,9. Chưa có đủ điểm giữa kỳ và cuối kỳ thì cột ĐTB để trống, tránh hiện số sai giữa kỳ."
      },
      {
        q: "ĐTB môn cả năm tính thế nào?",
        a: "ĐTB môn cả năm = (ĐTB học kỳ I + 2 × ĐTB học kỳ II) / 3, làm tròn 1 chữ số thập phân, tính từ ĐTB 2 học kỳ đã làm tròn. Học kỳ II nặng gấp đôi nên học sinh tiến bộ ở kỳ sau được lợi rõ rệt. Ví dụ: kỳ I 6,8; kỳ II 7,4 thì (6,8 + 14,8) / 3 = 7,2."
      },
      {
        q: "Xếp loại chung Tốt/Khá/Đạt/Chưa đạt theo quy tắc nào?",
        a: "Theo khoản 2 Điều 9 Thông tư 22: Tốt khi mọi môn nhận xét đều Đạt, mọi môn có điểm từ 6,5 trở lên, trong đó ít nhất 6 môn từ 8,0 trở lên; Khá khi mọi môn nhận xét đều Đạt, mọi môn có điểm từ 5,0 trở lên, trong đó ít nhất 6 môn từ 6,5 trở lên; Đạt khi tối đa 1 môn nhận xét Chưa đạt, ít nhất 6 môn có điểm từ 5,0 trở lên và không môn nào dưới 3,5; còn lại là Chưa đạt. Vì quy tắc cần ít nhất 6 môn có điểm nên lớp nhập dưới 6 môn sẽ hiện 'Cần thêm môn' thay vì xếp loại sai."
      },
      {
        q: "Luật điều chỉnh 1 môn là gì?",
        a: "Theo khoản 3 Điều 9 Thông tư 22: nếu mức xếp loại chung bị thấp xuống từ 2 mức trở lên so với mức Tốt/Khá chỉ do kết quả của duy nhất 1 môn thì được điều chỉnh lên mức liền kề. Ví dụ: 7 môn đều trên 8,0 nhưng 1 môn chỉ 3,0 khiến mức chung rơi từ Tốt xuống Chưa đạt thì được nâng lên Đạt. Công cụ tự áp dụng luật này và đánh dấu ↑ kèm tên môn gây ra mức thấp."
      },
      {
        q: "Mức Tốt/Khá/Đạt/Chưa đạt ở từng môn có phải quy định của Thông tư 22 không?",
        a: "Không. Thông tư 22 chỉ định nghĩa 4 mức cho kết quả học tập chung, không xếp mức từng môn. Cột Mức ở từng môn chỉ là nhãn tham khảo nhanh dùng chung ngưỡng của Thông tư 22 (từ 8,0 là Tốt, từ 6,5 là Khá, từ 5,0 là Đạt, dưới 5,0 là Chưa đạt) để giáo viên nhìn nhanh học sinh nào đang yếu môn nào."
      },
      {
        q: "Dán bảng điểm từ Excel vào được không?",
        a: "Được. Chép vùng điểm trong Excel (6 cột TX1–TX4, GK, CK), bấm vào ô đầu tiên trong bảng rồi dán — điểm tự chạy vào đúng ô, đúng bạn. Ô nào không phải số từ 0 đến 10 sẽ bị bỏ qua và báo lại. Điểm gõ tay chấp nhận cả dấu phẩy (7,5) lẫn dấu chấm (7.5)."
      }
    ]
  },
  "goi-y-loi-nhan-xet-hoc-sinh": {
    intro: "Gợi ý lời nhận xét học sinh THCS, THPT theo Thông tư 22/2021/TT-BGDĐT: chọn môn Toán, Ngữ văn, Tiếng Anh, mức kết quả Tốt/Khá/Đạt/Chưa đạt và điểm mạnh, điểm cần cải thiện — nhận 3–5 lời nhận xét cụ thể, có hướng khắc phục, ghép câu không trùng nhau, sửa trực tiếp rồi chép hoặc lưu theo từng học sinh.",
    legalBasis: "Lời nhận xét theo Thông tư 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo: nhận xét sự tiến bộ, ưu điểm nổi bật và hạn chế chủ yếu của học sinh (Điều 5); mức kết quả Tốt/Khá/Đạt/Chưa đạt theo khoản 2 Điều 9.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "Lời nhận xét lấy từ đâu, có phải do AI viết không?",
        a: "Không phải AI. Ngân hàng 84 lời nhận xét được viết sẵn tay theo quy ước nhận xét của Thông tư 22: cụ thể (nêu việc làm được hoặc chưa được), mang tính định hướng phát triển, luôn kèm hướng khắc phục ở mức Chưa đạt. Công cụ chỉ chọn và ghép lời phù hợp với môn, mức và phẩm chất bạn chọn — giáo viên vẫn là người sửa câu chữ cuối cùng cho đúng với từng em."
      },
      {
        q: "Làm sao để cả lớp không bị trùng câu nhận xét?",
        a: "Công cụ nhớ những câu đã dùng cho học sinh khác và ưu tiên gợi ý câu chưa dùng, tới khi hết câu mới trong ô đó mới dùng lại từ đầu. Nếu muốn bắt đầu lại (sang học kỳ mới chẳng hạn), bấm nút 'Quên các câu đã dùng' ở cuối trang."
      },
      {
        q: "Lời nhận xét mức Chưa đạt viết thế nào cho đúng?",
        a: "Theo Thông tư 22, nhận xét phải nêu hạn chế chủ yếu kèm hướng khắc phục, không chê bai hay dán nhãn học sinh. Ví dụ đúng: nêu rõ em mới nắm được phần nào, còn lúng túng ở đâu, rồi gợi ý việc cụ thể cần làm (ôn lại từng dạng bài, làm lại bài đã chữa, nhờ thầy cô giảng lại phần chưa rõ). Ngân hàng lời của công cụ đều viết theo cách này và không chứa từ ngữ chê bai."
      },
      {
        q: "Nhận xét theo môn khác nhận xét chung cuối kỳ thế nào?",
        a: "Nhận xét theo môn do giáo viên bộ môn viết, nói về năng lực đặc thù của môn đó (Toán: tư duy và lập luận; Ngữ văn: đọc hiểu và viết; Tiếng Anh: nghe, nói, đọc, viết). Nhận xét chung cuối kỳ do giáo viên chủ nhiệm ghi vào học bạ, tổng kết cả kết quả học tập lẫn rèn luyện của học sinh trong học kỳ. Công cụ gợi ý cả hai loại để bạn ghép thành lời hoàn chỉnh."
      },
      {
        q: "Lời đã soạn lưu ở đâu, có mất khi tắt trình duyệt không?",
        a: "Lời đã soạn lưu trên trình duyệt của chính bạn (không gửi lên máy chủ), tắt trình duyệt rồi mở lại vẫn còn. Mỗi học sinh lưu 1 lời; mở lại lời cũ bằng nút Mở trong danh sách 'Lời đã soạn'. Muốn chép nhiều lời cùng lúc thì đánh dấu vào ô vuông rồi bấm 'Chép tất cả đã chọn'."
      },
      {
        q: "Chọn học sinh từ Bàn giáo viên thế nào?",
        a: "Nếu bạn đã có danh sách lớp trong Bàn giáo viên, chọn lớp rồi bấm 'Nạp lớp này', sau đó chọn tên học sinh trong danh sách xổ xuống — tên sẽ tự điền vào ô học sinh. Không có lớp thì gõ tên trực tiếp vào ô, công cụ vẫn gợi ý và lưu bình thường."
      }
    ]
  },
  "bhxh-mot-lan": {
    intro: "Ước tính số tiền rút bảo hiểm xã hội một lần theo Điều 70 Luật BHXH 2024: 1,5 tháng lương bình quân cho mỗi năm đóng trước 2014, 2 tháng cho mỗi năm từ 2014 trở đi. Nhập lương bình quân, thời gian đóng từng giai đoạn và mốc bắt đầu đóng để xem số tiền ước tính và điều kiện rút.",
    finance: true,
    legalBasis: "Cập nhật theo Điều 70 Luật BHXH 41/2024/QH15, hiệu lực 01/7/2025.",
    updatedAt: "19/11/2026",
    example: {
      text: "Mức bình quân 10.000.000₫, đóng 5 năm 3 tháng trước 2014 và 8 năm từ 2014: phần trước 2014 là 75.000.000₫ (1,5 × 10.000.000 × 5 năm), phần từ 2014 là 170.000.000₫ (2 × 10.000.000 × 8,5 năm — 3 tháng lẻ chuyển sang) → rút một lần 245.000.000₫.",
      fills: { 'bhxh-avg': '10.000.000', 'bhxh-y1': '5', 'bhxh-m1': '3', 'bhxh-y2': '8', 'bhxh-m2': '0', 'bhxh-joined': 'before', 'bhxh-paid': '' },
    },
    disclaimer: "Kết quả chỉ mang tính tham khảo, không thay thế tư vấn của cơ quan BHXH — mức thực tế do cơ quan BHXH xác định theo hồ sơ đóng của bạn.",
    faqs: [
      {
        q: "Ai được rút BHXH một lần sau ngày 01/7/2025?",
        a: "Người bắt đầu đóng BHXH trước 01/7/2025 vẫn được rút sau 12 tháng không tham gia BHXH bắt buộc lẫn tự nguyện, nếu chưa đủ 20 năm đóng. Người bắt đầu đóng từ 01/7/2025 chỉ được rút khi đủ tuổi hưu mà chưa đủ 15 năm đóng, ra nước ngoài định cư, mắc bệnh hiểm nghèo hoặc suy giảm khả năng lao động từ 81% trở lên."
      },
      {
        q: "Tháng lẻ tính như thế nào khi rút BHXH một lần?",
        a: "Tháng lẻ trước năm 2014 được chuyển sang giai đoạn từ 2014 để tính; tháng lẻ 1-6 tháng tính là nửa năm, 7-11 tháng tính là 1 năm. Ví dụ đóng 5 năm 3 tháng trước 2014 và 8 năm từ 2014: 3 tháng lẻ chuyển sang thành 8 năm 3 tháng, tức 8,5 năm tính hệ số 2."
      },
      {
        q: "Đóng BHXH chưa đủ 1 năm thì rút được bao nhiêu?",
        a: "Bằng số tiền đã đóng vào quỹ hưu trí - tử tuất, nhưng không quá 2 tháng mức bình quân tiền lương tháng đóng BHXH. Ví dụ lương bình quân 10 triệu đồng, đóng 6 tháng: số tiền đã đóng ước tính 22% nhân 10.000.000 nhân 6 bằng 13.200.000₫, dưới mức tối đa 20.000.000₫ nên rút được 13.200.000₫."
      },
      {
        q: "Lương bình quân 10 triệu, đóng 5 năm 3 tháng trước 2014 và 8 năm từ 2014 thì rút được bao nhiêu?",
        a: "245.000.000₫. Phần trước 2014: 1,5 nhân 10.000.000 nhân 5 năm bằng 75.000.000₫; 3 tháng lẻ chuyển sang giai đoạn từ 2014 thành 8,5 năm, phần từ 2014: 2 nhân 10.000.000 nhân 8,5 bằng 170.000.000₫."
      },
      {
        q: "Rút BHXH một lần rồi có đóng lại được không?",
        a: "Được. Sau khi rút, nếu đi làm và tham gia BHXH trở lại thì thời gian đóng mới được tính từ đầu; thời gian đã rút một lần không còn cộng dồn vào thời gian hưởng lương hưu sau này, nên cân nhắc kỹ trước khi rút, nhất là khi đã đóng nhiều năm."
      }
    ]
  },
  "tien-dien-bac-thang": {
    intro: "Tính tiền điện sinh hoạt theo biểu giá bậc thang 5 bậc mới nhất (Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026), đã gồm VAT 8%. Nhập số kWh tiêu thụ trong tháng để xem tiền từng bậc và tổng thanh toán.",
    finance: true,
    legalBasis: "Cập nhật theo Quyết định 2892/QĐ-BCT, áp dụng từ 01/11/2026 (VAT 8%).",
    updatedAt: "19/11/2026",
    example: {
      text: "Dùng 500 kWh trong tháng: 100 kWh × 1.901₫ + 100 kWh × 2.289₫ + 200 kWh × 2.894₫ + 100 kWh × 3.456₫ = 1.343.400₫ chưa thuế, cộng VAT 8% (107.472₫) → tổng thanh toán 1.450.872₫.",
      fills: { 'tdbt-kwh': '500', 'tdbt-vat': '8' },
    },
    disclaimer: "Kết quả chỉ mang tính tham khảo, không thay thế tư vấn của cơ quan điện lực (EVN) — số tiền thực tế theo hóa đơn tiền điện của EVN.",
    faqs: [
      {
        q: "Tiền điện 500 số giá bao nhiêu?",
        a: "1.450.872₫ (đã gồm VAT 8%): 100 số đầu nhân 1.901 cộng 100 số nhân 2.289 cộng 200 số nhân 2.894 cộng 100 số nhân 3.456 bằng 1.343.400₫ chưa thuế, cộng VAT 107.472₫."
      },
      {
        q: "Giá điện bậc thang 2026 có mấy bậc?",
        a: "5 bậc, theo Quyết định 2892/QĐ-BCT từ 01/11/2026: bậc 1 (0-100 kWh) 1.901₫, bậc 2 (101-200) 2.289₫, bậc 3 (201-400) 2.894₫, bậc 4 (401-700) 3.456₫, bậc 5 (trên 700) 3.844₫, tất cả chưa VAT. Tiền điện tính lũy tiến: mỗi bậc chỉ áp cho số kWh trong bậc đó, không áp một giá cho toàn bộ."
      },
      {
        q: "Tiền điện 250 số giá bao nhiêu?",
        a: "608.796₫ đã gồm VAT 8%: 100 nhân 1.901 cộng 100 nhân 2.289 cộng 50 nhân 2.894 bằng 563.700₫ chưa thuế, cộng VAT 45.096₫."
      },
      {
        q: "VAT tiền điện là bao nhiêu phần trăm?",
        a: "8% trên tổng tiền điện chưa thuế. Công cụ mặc định 8% và cho sửa lại nếu thuế suất thay đổi."
      }
    ]
  },
  "lai-vay": {
    intro: "Tính lãi vay và lịch trả nợ hằng tháng theo hai cách: trả đều mỗi tháng hoặc dư nợ giảm dần. Nhập số tiền vay, lãi suất năm và kỳ hạn để xem tiền trả từng tháng, tổng lãi và bảng lịch trả nợ chi tiết.",
    finance: true,
    legalBasis: "Cách tính theo chuẩn ngân hàng: lãi tính trên dư nợ thực tế mỗi tháng — trả đều mỗi tháng hoặc dư nợ giảm dần (gốc chia đều, lãi giảm dần).",
    updatedAt: "19/11/2026",
    example: {
      text: "Vay 100.000.000₫, lãi suất 12%/năm, kỳ hạn 12 tháng, trả đều mỗi tháng: trả 8.884.879₫/tháng, tổng lãi 6.618.546₫, tổng phải trả 106.618.546₫.",
      fills: { 'lv-principal': '100.000.000', 'lv-rate': '12', 'lv-months': '12', 'lv-method': 'annuity' },
    },
    faqs: [
      {
        q: "Vay 100 triệu lãi 12% trả bao nhiêu mỗi tháng?",
        a: "Trả đều 12 tháng: 8.884.879₫ mỗi tháng, tổng lãi 6.618.546₫. Dư nợ giảm dần: tháng đầu 9.333.333₫ rồi giảm dần, tổng lãi 6.500.000₫."
      },
      {
        q: "Trả đều và dư nợ giảm dần khác nhau thế nào?",
        a: "Trả đều: mỗi tháng trả một khoản bằng nhau, đầu kỳ lãi nhiều gốc ít, cuối kỳ ngược lại. Dư nợ giảm dần: gốc chia đều mỗi tháng, lãi tính trên dư nợ còn lại nên tháng đầu trả nhiều nhất rồi giảm dần; tổng lãi thường thấp hơn trả đều với cùng lãi suất và kỳ hạn."
      },
      {
        q: "Lãi suất 12%/năm thì mỗi tháng tính bao nhiêu?",
        a: "1% mỗi tháng trên dư nợ: 12% chia 12 tháng. Ví dụ vay 100 triệu, lãi tháng đầu là 1.000.000₫."
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
    intro: "Giá vàng SJC và tỷ giá trực tiếp: vàng miếng SJC, nhẫn SJC, DOJI, PNJ, vàng thế giới và tỷ giá 9 ngoại tệ so với đồng Việt Nam, kèm ô đổi ngoại tệ nhanh. Dữ liệu làm mới 2 lần mỗi ngày.",
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
        a: "Tỷ giá USD/VND hiển thị ngay trong công cụ cùng 8 ngoại tệ khác (EUR, JPY, KRW, CNY, GBP, AUD, SGD, THB). Nhập số tiền vào ô đổi ngoại tệ để quy đổi nhanh."
      },
      {
        q: "Giá vàng trên trang có chính xác không?",
        a: "Số liệu lấy từ nguồn công khai (vang.today cho giá vàng, open.er-api.com cho tỷ giá) và chỉ để tham khảo. Giá vàng biến động liên tục trong ngày và mỗi cửa hàng niêm yết khác nhau, nên kiểm tra trực tiếp tại cửa hàng hoặc ngân hàng trước khi mua bán."
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
    disclaimer: "Kết quả chỉ mang tính tham khảo, không thay thế thông báo của công ty cấp nước tại địa phương — số tiền thực tế theo hóa đơn tiền nước.",
    faqs: [
      {
        q: "25m3 nước hết bao nhiêu tiền?",
        a: "303.600₫ theo giá Hà Nội mặc định: 10 m3 nhân 8.500 cộng 10 m3 nhân 9.900 cộng 5 m3 nhân 16.000 bằng 264.000₫, cộng VAT 5% (13.200₫) và phí bảo vệ môi trường 10% (26.400₫). Giá mỗi địa phương khác nhau, nhớ sửa lại theo hóa đơn của bạn."
      },
      {
        q: "Giá nước sinh hoạt tính theo bậc nào?",
        a: "Mặc định theo Hà Nội (Quyết định 3541/QĐ-UBND): bậc 1 (0-10 m3) 8.500₫, bậc 2 (trên 10-20 m3) 9.900₫, bậc 3 (trên 20-30 m3) 16.000₫, bậc 4 (trên 30 m3) 27.000₫ mỗi m3, chưa gồm thuế và phí. Mỗi địa phương có biểu giá riêng, công cụ cho sửa từng bậc."
      },
      {
        q: "Tiền nước gồm những khoản phí gì?",
        a: "Ngoài tiền nước theo bậc còn có VAT 5% và phí bảo vệ môi trường 10% với nước thải sinh hoạt (Nghị định 53/2020/NĐ-CP), cả hai tính trên tiền nước trước thuế. Công cụ hiển thị riêng từng khoản để bạn đối chiếu với hóa đơn."
      },
      {
        q: "Dùng 10m3 nước hết bao nhiêu tiền?",
        a: "97.750₫ theo giá Hà Nội: 10 nhân 8.500 bằng 85.000₫, cộng VAT 5% (4.250₫) và phí môi trường 10% (8.500₫). Hộ chính sách và hộ nghèo được giữ mức 5.973₫/m3 cho 10 m3 đầu."
      }
    ]
  },
  "lai-kep": {
    intro: "Tính lãi kép và tiết kiệm dài hạn: vốn ban đầu cộng gửi thêm hằng tháng, lãi cộng dồn vào gốc mỗi tháng. Xem tổng tài sản, tổng gốc đã gửi và tổng lãi nhận được sau từng năm.",
    finance: true,
    faqs: [
      {
        q: "Gửi 1 triệu mỗi tháng 10 năm được bao nhiêu?",
        a: "Với lãi suất 6%/năm, sau 10 năm có khoảng 163.879.347₫: gốc đã gửi 120.000.000₫, lãi 43.879.347₫. Lãi kép tính theo tháng, khoản gửi thêm cộng vào cuối mỗi tháng."
      },
      {
        q: "Lãi kép là gì?",
        a: "Lãi kép là lãi được cộng vào gốc, rồi kỳ sau tính lãi trên tổng mới (gốc cộng lãi cũ). Nhờ vậy tiền sinh lãi ngày càng nhanh theo thời gian, khác với lãi đơn chỉ tính trên gốc ban đầu."
      },
      {
        q: "Gửi 100 triệu lãi 6% 10 năm được bao nhiêu?",
        a: "Khoảng 181.939.673₫ nếu không rút lãi và lãi suất giữ nguyên 6%/năm, lãi kép theo tháng. Tiền lãi là 81.939.673₫, gần bằng số vốn ban đầu."
      },
      {
        q: "Gửi tiết kiệm bao lâu thì tiền tăng gấp đôi?",
        a: "Theo quy tắc 72: lấy 72 chia cho lãi suất năm sẽ ra số năm gần đúng để tiền tăng gấp đôi. Ví dụ lãi 6%/năm thì khoảng 12 năm (72 chia 6 bằng 12). Đây là ước tính nhanh; dùng công cụ để tính chính xác theo lãi kép từng tháng."
      }
    ]
  },
  "luong-huu": {
    intro: "Ước tính lương hưu hằng tháng theo Luật BHXH 2024: nhập giới tính, thời gian đóng và mức bình quân tiền lương đóng BHXH để xem tỷ lệ hưởng, lương hưu mỗi tháng và trợ cấp một lần (nếu đóng vượt 30/35 năm).",
    finance: true,
    legalBasis: "Cập nhật theo Điều 66, 68 Luật BHXH 41/2024/QH15 (hiệu lực 01/7/2025), Điều 13 Nghị định 158/2025/NĐ-CP (tháng lẻ, nghỉ hưu trước tuổi) và Nghị định 161/2026/NĐ-CP (trần đóng 50.600.000₫).",
    updatedAt: "19/11/2026",
    example: {
      text: "Nữ, đóng BHXH 28 năm, mức bình quân 12.000.000₫, nghỉ đúng tuổi: tỷ lệ hưởng 71% (45% + 2% × 13 năm trên 15 năm) → lương hưu 8.520.000₫/tháng.",
      fills: { 'lh-gender': 'nu', 'lh-years': '28', 'lh-months': '0', 'lh-avg': '12.000.000', 'lh-early-y': '0', 'lh-early-m': '0', 'lh-post': '0' },
    },
    faqs: [],
  },
  "tro-cap-thoi-viec-bhtn": {
    intro: "Tính trợ cấp thất nghiệp (BHTN) và trợ cấp thôi việc: mức hưởng hằng tháng bằng 60% lương bình quân đóng BHTN 6 tháng gần nhất, cộng số tháng được hưởng theo thời gian đã đóng. Nhập lương và số tháng đóng để ước tính.",
    finance: true,
    legalBasis: "Cập nhật theo Điều 39 Luật Việc làm 74/2025/QH15 (hiệu lực 01/01/2026) và Nghị định 293/2025/NĐ-CP (lương tối thiểu vùng 2026).",
    updatedAt: "19/11/2026",
    example: {
      text: "Lương bình quân đóng BHTN 12.000.000₫, đã đóng 24 tháng, Vùng I: trợ cấp thất nghiệp 7.200.000₫/tháng (60% lương, dưới trần 26.550.000₫), được hưởng 3 tháng → tổng 21.600.000₫.",
      fills: { 'tc-salary': '12000000', 'tc-months': '24', 'tc-region': 'I', 'tc-pre2009': '0' },
    },
    faqs: [
      {
        q: "Đóng BHTN 2 năm được hưởng mấy tháng trợ cấp?",
        a: "3 tháng. Đóng đủ 12-36 tháng được hưởng 3 tháng; cứ thêm đủ 12 tháng đóng thì cộng 1 tháng, tối đa 12 tháng."
      },
      {
        q: "Trợ cấp thất nghiệp được bao nhiêu một tháng?",
        a: "60% lương bình quân đóng BHTN 6 tháng gần nhất. Ví dụ lương bình quân 12 triệu đồng thì trợ cấp 7.200.000₫ mỗi tháng. Mức hưởng tối đa không quá 5 lần lương tối thiểu vùng."
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
        a: "1.100.000₫: tiền VAT là 100.000₫ (1.000.000 nhân 10%)."
      },
      {
        q: "Tách VAT 10% ra khỏi 1.100.000 như thế nào?",
        a: "Chia cho 1,1: tiền trước thuế là 1.000.000₫, tiền VAT là 100.000₫. Công thức chung: tiền trước thuế bằng giá đã có VAT chia cho (1 cộng thuế suất)."
      },
      {
        q: "VAT 8% áp dụng cho hàng hóa nào?",
        a: "Mức 8% là mức giảm áp dụng cho nhiều hàng hóa, dịch vụ theo chính sách giảm thuế từng thời kỳ, ví dụ tiền điện sinh hoạt hiện chịu VAT 8%. Mức phổ biến vẫn là 10%; một số mặt hàng chịu 5% hoặc 0%. Kiểm tra hóa đơn hoặc hỏi người bán để biết thuế suất đúng của mặt hàng."
      },
      {
        q: "Giá 1 triệu đã gồm VAT 8% thì VAT là bao nhiêu?",
        a: "Tiền trước thuế là 925.926₫ (1.000.000 chia 1,08), tiền VAT là 74.074₫."
      }
    ]
  },
  "luong-thang-13": {
    intro: "Tính lương tháng 13 và thuế thu nhập cá nhân phải nộp trên khoản thưởng: thưởng tính theo tỷ lệ tháng làm việc trong năm, thuế tính theo biểu thuế lũy tiến 5 bậc năm 2026 trên thu nhập của tháng nhận thưởng.",
    finance: true,
    legalBasis: "Thưởng tháng 13 theo thỏa thuận hoặc quy chế công ty (Điều 104 Bộ luật Lao động 2019 — thưởng không bắt buộc); thuế TNCN theo biểu lũy tiến 5 bậc năm 2026 (Luật 109/2025/QH15), giảm trừ bản thân 15,5 triệu đồng.",
    updatedAt: "19/11/2026",
    example: {
      text: "Lương tháng 15.000.000₫, làm đủ 12 tháng, 0 người phụ thuộc, bảo hiểm tháng nhận thưởng 1.575.000₫: thưởng tháng 13 là 15.000.000₫; thu nhập tính thuế tháng nhận thưởng 12.925.000₫ nên thuế TNCN trên khoản thưởng là 792.500₫ → thực nhận 14.207.500₫.",
      fills: { 'lt13-salary': '15000000', 'lt13-months': '12', 'lt13-dependents': '0', 'lt13-insurance': '1575000' },
    },
    faqs: [
      {
        q: "Lương tháng 13 là gì?",
        a: "Lương tháng 13 là khoản thưởng cuối năm, thường bằng một tháng lương cho người làm đủ 12 tháng trong năm. Đây là khoản thưởng theo thỏa thuận hoặc quy chế công ty, không phải khoản bắt buộc theo luật; mức cụ thể tùy từng doanh nghiệp."
      },
      {
        q: "Lương 15 triệu làm đủ 12 tháng thì tháng 13 được bao nhiêu?",
        a: "Thưởng 15.000.000₫, thuế thu nhập cá nhân trên khoản thưởng là 792.500₫ (0 người phụ thuộc, bảo hiểm tháng nhận thưởng 1.575.000₫), thực nhận 14.207.500₫. Thuế tính trên thu nhập tháng nhận thưởng (lương cộng thưởng) trừ bảo hiểm và giảm trừ gia cảnh."
      },
      {
        q: "Làm 6 tháng có được lương tháng 13 không?",
        a: "Thường được tính theo tỷ lệ: 6 tháng làm việc thì thưởng bằng nửa tháng lương, ví dụ lương 15 triệu thì thưởng 7.500.000₫. Mức cụ thể tùy quy chế công ty, có nơi yêu cầu làm đủ số tháng tối thiểu mới được thưởng."
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
