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
  "diem-xet-tuyen-dai-hoc": {
    intro: "Tính điểm xét tuyển đại học theo Quy chế tuyển sinh 2026: nhập điểm 3 môn thi tốt nghiệp THPT hoặc điểm trung bình 6 học kỳ, chọn khu vực và đối tượng ưu tiên để biết điểm xét tuyển sau khi cộng ưu tiên — kèm công thức giảm dần từ 22,5 điểm và bảng tính từng bước.",
    finance: true,
    legalBasis: "Cập nhật theo Quy chế tuyển sinh các ngành đào tạo trình độ đại học và ngành Giáo dục Mầm non trình độ cao đẳng ban hành kèm theo Thông tư 06/2026/TT-BGDĐT ngày 15/02/2026 (Điều 6 — phương thức xét tuyển, xét học bạ 6 học kỳ; Điều 7 — điểm ưu tiên khu vực và đối tượng, công thức giảm dần từ 22,5 điểm).",
    updatedAt: "20/11/2026",
    disclaimer: "Kết quả chỉ để tham khảo — điểm trúng tuyển và cách tính riêng (điểm thưởng, quy đổi chứng chỉ, môn nhân hệ số) theo đề án tuyển sinh của từng trường.",
    faqs: [
      {
        q: "Điểm ưu tiên khu vực được cộng bao nhiêu?",
        a: "Khu vực 1 (KV1) cộng 0,75 điểm; khu vực 2 nông thôn (KV2-NT) 0,5 điểm; khu vực 2 (KV2) 0,25 điểm; khu vực 3 (KV3) không cộng (Điều 7 Quy chế tuyển sinh, Thông tư 06/2026). Khu vực của bạn theo trường bạn học lâu nhất cấp THPT, và chỉ được hưởng trong năm tốt nghiệp THPT và một năm kế tiếp — thi lại từ năm thứ ba trở đi thì không còn ưu tiên khu vực."
      },
      {
        q: "Tại sao tổng điểm cao lại được cộng ít điểm ưu tiên hơn?",
        a: "Từ tổng điểm 22,5 trở lên, điểm ưu tiên giảm dần theo công thức: điểm ưu tiên thực tế = [(30 − tổng điểm) ÷ 7,5] × mức ưu tiên ban đầu (khoản 4 Điều 7). Ví dụ thí sinh KV1 (0,75 điểm): tổng 24 điểm được cộng 0,6; tổng 27 điểm còn 0,3; tổng 29 điểm còn 0,1; tổng 30 điểm thì không còn điểm ưu tiên. Tổng điểm đúng 22,5 thì hệ số bằng 1 nên vẫn cộng đủ."
      },
      {
        q: "Ưu tiên đối tượng UT1, UT2 là những ai?",
        a: "Nhóm UT1 (đối tượng 01 đến 03) được cộng 2,0 điểm; nhóm UT2 (đối tượng 04 đến 06) được cộng 1,0 điểm, theo Phụ lục II của Quy chế tuyển sinh. Thuộc nhiều diện đối tượng thì chỉ hưởng mức cao nhất, nhưng ưu tiên khu vực và ưu tiên đối tượng được cộng cả hai rồi mới áp công thức giảm dần. Ví dụ tổng 24 điểm, KV2-NT (0,5) + UT2 (1,0): ưu tiên ban đầu 1,5, thực tế 1,2, điểm xét tuyển 25,2."
      },
      {
        q: "Xét học bạ năm 2026 tính thế nào?",
        a: "Tổ hợp xét học bạ dùng điểm trung bình chung kết quả học tập cả năm các lớp 10, 11, 12 (6 học kỳ) của tối thiểu 3 môn học, thang 30; bắt buộc có môn Toán hoặc Ngữ văn với trọng số tính điểm xét tối thiểu 1/3 (khoản 5 Điều 6). Ngoài ra, để đủ điều kiện xét tuyển, tổng điểm 3 môn thi tốt nghiệp THPT của bạn phải đạt từ 15 điểm trở lên (khoản 3 Điều 6, áp dụng với thí sinh thi tốt nghiệp từ năm 2026)."
      },
      {
        q: "Điểm cộng thêm tối đa 3 điểm là gì?",
        a: "Điểm thưởng, điểm khuyến khích do từng trường quy định trong đề án tuyển sinh — ví dụ điểm chứng chỉ ngoại ngữ, giải thưởng học sinh giỏi — cộng tối đa 3 điểm theo thang 30. Khác với điểm ưu tiên, điểm cộng thêm không bị giảm dần khi tổng điểm cao. Bạn chỉ điền ô này khi trường bạn xét tuyển có quy định điểm thưởng và bạn đủ điều kiện nhận."
      }
    ]
  },
  "tien-thai-san-bhxh": {
    intro: "Tính tiền thai sản theo Luật BHXH 2024: nhập bình quân lương đóng BHXH 6 tháng gần nhất, số con sinh và số tháng đã đóng BHXH để biết tổng tiền thai sản nhận được — trợ cấp 6 tháng nghỉ sinh (7 tháng khi sinh con thứ hai) + trợ cấp một lần mỗi con — kèm kiểm đủ điều kiện và tiền trợ cấp chồng nghỉ khi vợ sinh con.",
    finance: true,
    legalBasis: "Cập nhật theo Luật Bảo hiểm xã hội 41/2024/QH15 (hiệu lực 01/7/2025) — Điều 50, 53, 58, 59; Bộ luật Lao động 2019 Điều 139; Luật Dân số 113/2025/QH15 (sinh con thứ hai: mẹ nghỉ 7 tháng, chồng nghỉ tối thiểu 10 ngày); mức tham chiếu 2.530.000₫/tháng từ 01/7/2026 (NĐ 161/2026/NĐ-CP).",
    updatedAt: "20/11/2026",
    disclaimer: "Kết quả chỉ để tham khảo — mức hưởng thực tế do cơ quan BHXH quyết định theo hồ sơ của bạn; đối chiếu với cơ quan BHXH nơi bạn tham gia trước khi làm thủ tục.",
    example: {
      text: "Ví dụ: chị Lan đóng BHXH với mức lương 10.000.000₫/tháng, sinh 1 con, đã đóng đủ 12 tháng trong 12 tháng trước khi sinh → nghỉ 6 tháng, nhận 60.000.000₫ trợ cấp thai sản + 5.060.000₫ trợ cấp một lần, tổng cộng 65.060.000₫.",
      fills: { "tss-me-luong": "10.000.000", "tss-me-con": "1", "tss-me-thang": "12" }
    },
    faqs: [
      {
        q: "Điều kiện hưởng tiền thai sản là gì?",
        a: "Lao động nữ sinh con phải đóng BHXH bắt buộc từ đủ 6 tháng trở lên trong 12 tháng liền kề trước khi sinh (khoản 2 Điều 50 Luật BHXH 2024) — thời gian đóng gián đoạn vẫn được cộng dồn. Trường hợp mang thai từ đủ 22 tuần tuổi, buộc phải nghỉ việc để dưỡng thai theo chỉ định của cơ sở khám chữa bệnh thì chỉ cần đóng đủ 3 tháng trong 12 tháng, nhưng phải đã đóng BHXH tổng cộng từ đủ 12 tháng trở lên (khoản 3 Điều 50)."
      },
      {
        q: "Tiền thai sản gồm những khoản nào?",
        a: "Hai khoản. Thứ nhất, trợ cấp thai sản hằng tháng bằng 100% mức bình quân tiền lương làm căn cứ đóng BHXH bắt buộc của 6 tháng gần nhất trước khi nghỉ, nhân với số tháng nghỉ (6 tháng khi sinh 1 con). Thứ hai, trợ cấp một lần khi sinh bằng 2 lần mức tham chiếu tại tháng sinh, tính cho mỗi con — mức tham chiếu hiện bằng lương cơ sở 2.530.000₫ (từ 01/7/2026 theo NĐ 161/2026), nên mỗi con được 5.060.000₫."
      },
      {
        q: "Sinh con thứ hai được nghỉ thai sản bao lâu?",
        a: "7 tháng. Từ 01/7/2026, Luật Dân số 2025 sửa khoản 1 Điều 139 Bộ luật Lao động 2019: lao động nữ sinh con thứ hai được nghỉ thai sản 7 tháng thay vì 6 tháng như con đầu (sinh con thứ ba trở lên vẫn nghỉ 6 tháng). Điều kiện: lúc sinh, người mẹ đang có 1 con đẻ còn sống (NĐ 168/2026). Sinh con thứ hai mà sinh đôi thì nghỉ 8 tháng (7 tháng + 1 tháng vì sinh đôi). Chồng cũng được nghỉ tối thiểu 10 ngày làm việc khi vợ sinh con thứ hai."
      },
      {
        q: "Sinh đôi, sinh ba được nghỉ bao lâu?",
        a: "Lao động nữ nghỉ thai sản 6 tháng (7 tháng nếu sinh con thứ hai); sinh đôi trở lên thì từ con thứ 2 trở đi, mỗi con mẹ được nghỉ thêm 1 tháng (Điều 139 Bộ luật Lao động 2019) — sinh đôi nghỉ 7 tháng, sinh ba nghỉ 8 tháng; sinh con thứ hai mà sinh đôi nghỉ 8 tháng. Thời gian nghỉ trước khi sinh tối đa 2 tháng. Trợ cấp một lần cũng tính cho mỗi con: sinh đôi được 10.120.000₫, sinh ba được 15.180.000₫."
      },
      {
        q: "Chồng được nghỉ bao nhiêu ngày khi vợ sinh con?",
        a: "Theo khoản 2 Điều 53 Luật BHXH 2024, tính theo ngày làm việc: vợ sinh thường 1 con nghỉ 5 ngày; vợ sinh phải phẫu thuật hoặc sinh con dưới 32 tuần tuổi nghỉ 7 ngày; vợ sinh đôi nghỉ 10 ngày; vợ sinh đôi phải phẫu thuật nghỉ 14 ngày; sinh ba trở lên thêm 3 ngày cho mỗi con từ con thứ 3. Từ 01/7/2026, vợ sinh con thứ hai (vợ có 1 con đẻ còn sống) thì chồng được nghỉ tối thiểu 10 ngày làm việc (Luật Dân số 2025) — mức 10 ngày là sàn: vợ sinh con thứ hai mà sinh đôi phải phẫu thuật thì chồng vẫn nghỉ 14 ngày, sinh ba thường thì nghỉ 13 ngày. Ngày bắt đầu nghỉ phải trong 60 ngày kể từ ngày vợ sinh. Chồng nghỉ hưởng chế độ không cần điều kiện đóng đủ 6 tháng."
      },
      {
        q: "Vợ không tham gia BHXH thì chồng có được hưởng gì không?",
        a: "Có. Nếu vợ không tham gia BHXH hoặc không đủ điều kiện hưởng thai sản, người chồng đang tham gia BHXH bắt buộc và đóng đủ 6 tháng trong 12 tháng trước khi vợ sinh sẽ được nhận trợ cấp một lần bằng 2 lần mức tham chiếu cho mỗi con (khoản 1 Điều 58) — hiện là 5.060.000₫ mỗi con. Chồng vẫn được nghỉ hưởng chế độ theo số ngày quy định và nhận tiền trợ cấp theo ngày nghỉ."
      },
      {
        q: "Đóng BHXH tự nguyện có được hưởng thai sản không?",
        a: "Có, từ 01/7/2025 Luật BHXH 2024 mở rộng chế độ thai sản cho người tham gia BHXH tự nguyện: lao động nữ đóng đủ 6 tháng trong 12 tháng trước khi sinh được hưởng trợ cấp 2.000.000₫ cho mỗi con sinh ra (Điều 95). Công cụ này tính cho BHXH bắt buộc; nếu bạn tham gia BHXH tự nguyện thì mức hưởng là 2.000.000₫/con, không theo lương đóng."
      }
    ]
  },
  "thue-ho-kinh-doanh": {
    intro: "Tính thuế hộ kinh doanh năm 2026 theo phương pháp kê khai: nhập doanh thu, ngành nghề, cách tính thuế TNCN (theo doanh thu hay theo thu nhập sau chi phí) và kênh bán — công cụ tính thuế GTGT, thuế TNCN (đã giảm 30% nếu đủ điều kiện), và nếu bán qua sàn thương mại điện tử thì tính luôn số sàn đã khấu trừ thay để biết còn phải nộp thêm hay được hoàn.",
    finance: true,
    legalBasis: "Cập nhật theo Luật Thuế GTGT 48/2024/QH15 (Điều 12 khoản 2), Luật Thuế TNCN 109/2025/QH15 (Điều 7), Nghị định 68/2026/NĐ-CP sửa bởi Nghị định 141/2026/NĐ-CP (ngưỡng không chịu thuế 1 tỷ đồng từ 01/01/2026), Nghị định 117/2025/NĐ-CP (sàn khấu trừ thuế thay từ 01/7/2025), nay là Nghị định 252/2026/NĐ-CP (từ 01/7/2026), Nghị quyết 43/2026/QH16 và Nghị định 398/2026/NĐ-CP (giảm 30% thuế TNCN kỳ tính thuế 2026–2027), Nghị quyết 198/2025/QH15 (bỏ thuế khoán và lệ phí môn bài từ 01/01/2026).",
    updatedAt: "20/11/2026",
    disclaimer: "Kết quả chỉ để tham khảo — đối chiếu với cơ quan thuế quản lý trước khi kê khai; ngưỡng và tỷ lệ thuế có thể thay đổi theo văn bản mới.",
    example: {
      text: "Ví dụ: hộ bán lẻ quần áo doanh thu năm 1.400.000.000₫, tính thuế theo doanh thu → thuế GTGT 1% × 1.400.000.000₫ = 14.000.000₫; thuế TNCN 0,5% × 400.000.000₫ (phần vượt ngưỡng 1 tỷ đồng) = 2.000.000₫, giảm 30% còn 1.400.000₫; tổng thuế phải nộp 15.400.000₫.",
      fills: { "hkd-doanh-thu": "1.400.000.000", "hkd-nganh": "phan-phoi" }
    },
    faqs: [
      {
        q: "Doanh thu bao nhiêu thì hộ kinh doanh phải nộp thuế năm 2026?",
        a: "Doanh thu năm trên 1 tỷ đồng. Ngưỡng không chịu thuế đã tăng nhiều lần: 100 triệu đồng (đến 30/6/2025) → 200 triệu đồng (Luật Thuế GTGT 48/2024, từ 01/7/2025) → 500 triệu đồng (Nghị định 68/2026, từ 01/01/2026) → 1 tỷ đồng (Nghị định 141/2026 ngày 29/4/2026, áp dụng từ 01/01/2026). Doanh thu năm từ 1 tỷ đồng trở xuống không phải nộp thuế GTGT và thuế TNCN, chỉ cần thông báo doanh thu với cơ quan thuế quản lý trước 31/1 năm sau. Doanh thu trên 1 tỷ đồng thì kê khai theo quý và phải dùng hóa đơn điện tử. Ngưỡng này vẫn có thể được điều chỉnh theo văn bản mới — đối chiếu với cơ quan thuế quản lý trước khi kê khai."
      },
      {
        q: "Thuế GTGT và thuế TNCN tính khác nhau thế nào?",
        a: "Thuế GTGT tính trên TOÀN BỘ doanh thu khi đã trên ngưỡng, không trừ ngưỡng (khoản 2 Điều 12 Luật Thuế GTGT 48/2024): phân phối hàng hóa 1%, dịch vụ 5%, sản xuất/vận tải 3%, hoạt động khác 2%. Thuế TNCN theo doanh thu chỉ tính trên PHẦN VƯỢT ngưỡng (khoản 3 Điều 7 Luật Thuế TNCN 109/2025): phân phối 0,5%, dịch vụ 2%, sản xuất/vận tải 1,5%, hoạt động khác 1%. Ví dụ hộ bán lẻ doanh thu 1,4 tỷ đồng: thuế GTGT 1% × 1,4 tỷ đồng = 14.000.000₫, thuế TNCN 0,5% × 400 triệu đồng (phần vượt 1 tỷ đồng) = 2.000.000₫."
      },
      {
        q: "Nên tính thuế TNCN theo doanh thu hay theo thu nhập?",
        a: "Doanh thu năm trên 1 tỷ đồng và từ 3 tỷ đồng trở xuống được chọn một trong hai cách. Theo doanh thu: thuế suất nhân phần doanh thu vượt ngưỡng 1 tỷ đồng. Theo thu nhập: (doanh thu − chi phí) × 15% (đến 3 tỷ đồng), 17% (trên 3 đến 50 tỷ đồng), 20% (trên 50 tỷ đồng); doanh thu trên 3 tỷ đồng thì BẮT BUỘC tính theo thu nhập. Ví dụ doanh thu 1,4 tỷ đồng, chi phí 1 tỷ đồng: theo doanh thu thuế TNCN là 2.000.000₫ (sau giảm 30% còn 1.400.000₫), theo thu nhập là 60.000.000₫ (sau giảm 30% còn 42.000.000₫) — thường theo doanh thu rẻ hơn, trừ khi lãi rất thấp; nếu chi phí bằng hoặc hơn doanh thu thì thuế TNCN theo thu nhập bằng 0. Chi phí tính theo thu nhập phải là chi phí thực tế liên quan đến kinh doanh, có hóa đơn chứng từ."
      },
      {
        q: "Bán hàng trên sàn thì sàn trừ thuế bao nhiêu?",
        a: "Từ 01/7/2025, sàn thương mại điện tử có chức năng thanh toán khấu trừ thuế thay người bán theo từng giao dịch (Nghị định 117/2025, nay là Nghị định 252/2026 từ 01/7/2026): hàng hóa 1% thuế GTGT + 0,5% thuế TNCN, dịch vụ 5% + 2%, vận tải 3% + 1,5% — tính trên toàn bộ doanh thu từng giao dịch, không trừ ngưỡng 1 tỷ đồng. Số sàn đã trừ là tiền nộp trước: cuối năm quyết toán, bạn nộp thêm phần thiếu hoặc được hoàn phần thừa; doanh thu cả năm dưới ngưỡng 1 tỷ đồng thì được hoàn toàn bộ số sàn đã trừ. Nhóm hoạt động kinh doanh khác không có tỷ lệ riêng trong nghị định về khấu trừ trên sàn nên công cụ dùng tỷ lệ của nhóm (GTGT 2%, TNCN 1%) — đối chiếu với sàn nếu sàn áp tỷ lệ khác."
      },
      {
        q: "Giảm 30% thuế TNCN năm 2026 là gì?",
        a: "Nghị quyết 43/2026/QH16 và Nghị định 398/2026 giảm 30% số thuế thu nhập cá nhân phải nộp của kỳ tính thuế 2026 và 2027 cho cá nhân, hộ kinh doanh có doanh thu năm từ 10 tỷ đồng trở xuống — áp dụng cho cả hai cách tính thuế TNCN (theo doanh thu và theo thu nhập), đã tính sẵn trong kết quả của công cụ. Mức giảm chỉ áp dụng cho thuế TNCN, không giảm thuế GTGT. Nếu doanh thu thực tế cả năm vượt 10 tỷ đồng thì phải nộp bổ sung phần thuế đã giảm."
      },
      {
        q: "Hộ kinh doanh còn phải nộp lệ phí môn bài không?",
        a: "Không. Lệ phí môn bài đã bãi bỏ từ 01/01/2026 (Nghị quyết 198/2025/QH15, Nghị định 362/2025) — công cụ luôn ghi 0₫ cho khoản này. Thuế khoán cũng bỏ từ 01/01/2026 (Điều 10 Nghị quyết 198/2025): hộ kinh doanh chuyển sang kê khai theo doanh thu thực tế, nộp thuế theo tỷ lệ từng ngành nghề như công cụ tính."
      }
    ]
  },
  "thue-phi-mua-ban-nha-dat": {
    intro: "Tính toàn bộ thuế phí phải nộp khi mua bán, sang tên nhà đất: thuế TNCN 2%, lệ phí trước bạ 0,5%, phí công chứng theo biểu phí, phí thẩm định hồ sơ và lệ phí cấp Giấy chứng nhận — kèm chia rõ bên bán, bên mua phải nộp theo thông lệ hoặc theo thỏa thuận. Nhập giá trên hợp đồng và (nếu biết) giá theo bảng giá tỉnh để công cụ lấy giá cao hơn làm giá tính.",
    finance: true,
    legalBasis: "Cập nhật theo Luật Thuế TNCN 109/2025/QH15 (Điều 4, Điều 14) và Nghị định 253/2026/NĐ-CP (từ 01/7/2026), Nghị định 10/2022/NĐ-CP sửa bởi Nghị định 175/2025/NĐ-CP (lệ phí trước bạ 0,5%), Nghị quyết 66.22/2026/NQ-CP và Thông tư 117/2026/TT-BTC (giảm 10% lệ phí trước bạ khi khai điện tử, đến 28/02/2027), Thông tư 257/2016/TT-BTC sửa bởi Thông tư 111/2017/TT-BTC (phí công chứng), Thông tư 85/2019/TT-BTC (phí thẩm định, lệ phí cấp Giấy chứng nhận do từng tỉnh quy định).",
    updatedAt: "20/11/2026",
    disclaimer: "Kết quả chỉ để tham khảo — đối chiếu với cơ quan thuế, văn phòng công chứng và cơ quan đăng ký đất đai địa phương trước khi giao dịch; phí thẩm định và lệ phí cấp Giấy chứng nhận khác nhau theo từng tỉnh.",
    example: {
      text: "Ví dụ: mua nhà ở giá 3.000.000.000₫, không thuộc diện miễn thuế → thuế TNCN 2% × 3.000.000.000₫ = 60.000.000₫; lệ phí trước bạ 0,5% × 3.000.000.000₫ = 15.000.000₫; phí công chứng 1.000.000₫ + 0,06% × 2.000.000.000₫ = 2.200.000₫; phí thẩm định 0,15% × 3.000.000.000₫ = 4.500.000₫; lệ phí cấp sổ 100.000₫; tổng chi phí sang tên 81.800.000₫ (bên bán nộp 60.000.000₫, bên mua nộp 21.800.000₫).",
      fills: { "tnnd-gia": "3.000.000.000", "tnnd-loai": "nha-o" }
    },
    faqs: [
      {
        q: "Thuế TNCN khi bán nhà đất tính thế nào?",
        a: "Thuế TNCN bằng 2% trên giá chuyển nhượng (Điều 14 Luật Thuế TNCN 109/2025, Điều 57 Nghị định 253/2026) — tính trên toàn bộ giá bán, không tính trên lãi. Ví dụ bán nhà 3 tỷ đồng thì thuế TNCN là 60.000.000₫. Chưa áp dụng cách tính theo thời gian nắm giữ hay theo lãi. Giá tính là giá hợp đồng, nhưng không thấp hơn giá theo bảng giá của tỉnh — xem câu hỏi về giá tính bên dưới."
      },
      {
        q: "Trường hợp nào được miễn thuế TNCN khi bán nhà đất?",
        a: "Theo Điều 4 Luật Thuế TNCN 109/2025, được miễn thuế TNCN khi: (1) chuyển nhượng, thừa kế, tặng cho nhà đất giữa vợ với chồng; cha mẹ đẻ, cha mẹ nuôi với con đẻ, con nuôi; cha mẹ chồng với con dâu; cha mẹ vợ với con rể; ông bà nội, ông bà ngoại với cháu nội, cháu ngoại; anh, chị, em ruột với nhau. (2) Bán nhà ở, đất ở duy nhất — phải đủ cả 3 điều kiện cùng lúc: chỉ có một nhà ở hoặc một thửa đất ở duy nhất tại Việt Nam tại thời điểm chuyển nhượng; đã sở hữu từ đủ 183 ngày tính từ ngày cấp Giấy chứng nhận; chuyển nhượng toàn bộ nhà, đất đó. Lưu ý: được miễn thuế TNCN không có nghĩa được miễn lệ phí trước bạ — lệ phí trước bạ chỉ miễn khi nhận thừa kế, quà tặng giữa người thân, còn mua bán thì vẫn nộp 0,5%."
      },
      {
        q: "Giá tính thuế lấy theo giá hợp đồng hay bảng giá đất của tỉnh?",
        a: "Lấy giá cao hơn trong hai giá. Nếu giá ghi trên hợp đồng thấp hơn giá theo bảng giá đất (đối với đất) và giá tính lệ phí trước bạ nhà (đối với nhà) do UBND cấp tỉnh ban hành thì cơ quan thuế tính theo bảng giá tỉnh; giá hợp đồng cao hơn thì tính theo hợp đồng (Điều 7 Nghị định 10/2022, sửa bởi Nghị định 175/2025). Ví dụ hợp đồng ghi 2 tỷ đồng nhưng giá theo bảng giá tỉnh là 2,5 tỷ đồng thì thuế TNCN tính trên 2,5 tỷ đồng, tức 50.000.000₫ thay vì 40.000.000₫. Giá theo bảng giá: đất lấy diện tích × giá 1 m² trong bảng giá đất; nhà lấy diện tích sàn × giá 1 m² × tỷ lệ chất lượng còn lại. Công cụ dùng giá tính này cho cả thuế TNCN, lệ phí trước bạ, phí công chứng và phí thẩm định."
      },
      {
        q: "Lệ phí trước bạ là bao nhiêu, có được giảm không?",
        a: "Lệ phí trước bạ khi sang tên nhà đất là 0,5% trên giá tính (khoản 1 Điều 8 Nghị định 10/2022, sửa bởi Nghị định 175/2025), bên mua nộp. Ví dụ nhà 3 tỷ đồng thì lệ phí trước bạ là 15.000.000₫. Từ 15/8/2026 đến 28/02/2027, khai và nộp lệ phí trước bạ hoàn toàn bằng phương thức điện tử (định danh mức 2 trên VNeID) được giảm 10% số lệ phí phải nộp, tối đa 5 lần lương cơ sở = 12.650.000₫ (Nghị quyết 66.22/2026/NQ-CP, Thông tư 117/2026/TT-BTC). Ví dụ nhà 3 tỷ đồng: lệ phí trước bạ 15.000.000₫, giảm 1.500.000₫, còn nộp 13.500.000₫. Công cụ có ô chọn để tính mức giảm này."
      },
      {
        q: "Phí công chứng hợp đồng mua bán nhà đất tính thế nào?",
        a: "Phí công chứng tính theo giá trị hợp đồng (khoản 2 Điều 4 Thông tư 257/2016/TT-BTC, sửa bởi Thông tư 111/2017): dưới 50 triệu đồng là 50.000₫; 50–100 triệu đồng là 100.000₫; trên 100 triệu đồng đến 1 tỷ đồng là 0,1%; trên 1–3 tỷ đồng là 1.000.000₫ + 0,06% phần vượt 1 tỷ đồng; trên 3–5 tỷ đồng là 2.200.000₫ + 0,05% phần vượt 3 tỷ đồng; trên 5–10 tỷ đồng là 3.200.000₫ + 0,04% phần vượt 5 tỷ đồng; trên 10–100 tỷ đồng là 5.200.000₫ + 0,03% phần vượt 10 tỷ đồng; trên 100 tỷ đồng là 32.200.000₫ + 0,02% phần vượt 100 tỷ đồng, tối đa 70.000.000₫ mỗi trường hợp. Ví dụ hợp đồng 1,5 tỷ đồng thì phí công chứng là 1.300.000₫; hợp đồng 4 tỷ đồng thì phí là 2.700.000₫. Nếu giá thỏa thuận thấp hơn giá Nhà nước thì tính theo giá Nhà nước. Chưa gồm thù lao soạn thảo, đánh máy hợp đồng (thu thêm theo mức trần của từng tỉnh) — công cụ không tính khoản này."
      },
      {
        q: "Phí thẩm định hồ sơ và lệ phí cấp sổ đỏ là bao nhiêu?",
        a: "Hai khoản này do HĐND từng tỉnh quyết định (Thông tư 85/2019/TT-BTC) nên mỗi địa phương một mức — công cụ dùng mức Hà Nội và mức phổ biến để bạn ước tính, cần đối chiếu với địa phương nơi có nhà đất. Phí thẩm định hồ sơ cấp Giấy chứng nhận ở Hà Nội là 0,15% giá trị chuyển nhượng, tối đa 5.000.000₫ mỗi hồ sơ (Nghị quyết 06/2020/NQ-HĐND): nhà 3 tỷ đồng thì phí thẩm định là 4.500.000₫, nhà 4 tỷ đồng thì chạm trần 5.000.000₫. Lệ phí cấp Giấy chứng nhận mới cho cá nhân, hộ gia đình thường từ 10.000₫ đến 100.000₫ tùy khu vực (Hà Nội) — công cụ dùng 100.000₫ làm mức phổ biến."
      },
      {
        q: "Bên bán và bên mua chịu khoản nào?",
        a: "Theo thông lệ: bên bán chịu thuế TNCN 2%; bên mua chịu lệ phí trước bạ 0,5%, phí công chứng, phí thẩm định hồ sơ và lệ phí cấp Giấy chứng nhận. Nhưng pháp luật không bắt buộc cách chia này — hai bên có thể thỏa thuận khác trong hợp đồng, ví dụ bên mua chịu cả thuế TNCN. Công cụ có nút chọn bên chịu thuế TNCN để chia lại; tổng chi phí không đổi. Ví dụ nhà 3 tỷ đồng không miễn thuế: tổng 81.800.000₫, theo thông lệ bên bán nộp 60.000.000₫, bên mua nộp 21.800.000₫; nếu bên mua chịu cả thuế TNCN thì bên mua nộp toàn bộ 81.800.000₫."
      },
      {
        q: "Ngoài các khoản trên còn phí nào khác không?",
        a: "Có thể có thêm: phí đo đạc lại thửa đất (chỉ khi cần đo lại, mức phí theo từng tỉnh), thù lao soạn thảo và đánh máy hợp đồng tại văn phòng công chứng (thu thêm ngoài phí công chứng, theo mức trần của UBND cấp tỉnh), phí đăng ký biến động và lệ phí cấp đổi Giấy chứng nhận nếu làm thủ tục đổi sổ mới. Ngoài ra, thay vì công chứng tại văn phòng công chứng, hai bên có thể chứng thực hợp đồng tại UBND cấp xã với mức phí 50.000₫ mỗi hợp đồng. Các khoản này không có trong công cụ vì khác nhau theo địa phương và theo từng trường hợp — hỏi trước tại văn phòng công chứng hoặc cơ quan đăng ký đất đai địa phương."
      }
    ]
  },
  "tao-bao-gia-nhanh": {
    intro: "Soạn báo giá trong 1 phút: nhập tên người bán, khách hàng, bảng hạng mục (tên hàng hóa/dịch vụ, số lượng, đơn giá), chiết khấu và thuế GTGT — công cụ tính ngay tạm tính, chiết khấu, VAT và tổng cộng, đọc số tiền bằng chữ, rồi tải file PDF trình bày sẵn để gửi khách hoặc in ra.",
    finance: true,
    legalBasis: "Thuế GTGT 10% là mức thông thường theo Luật Thuế GTGT 48/2024/QH15; mức giảm 8% áp dụng đến 31/12/2026 theo Nghị quyết 204/2025/QH15 và Nghị định 174/2025/NĐ-CP, từ 01/01/2027 về 10% nếu không được gia hạn. Báo giá không phải hóa đơn GTGT — hóa đơn điện tử thực hiện theo Nghị định 123/2020/NĐ-CP.",
    updatedAt: "20/11/2026",
    disclaimer: "Kết quả chỉ để tham khảo — đối chiếu hợp đồng thực tế và hỏi kế toán trước khi giao dịch, nhất là khi áp dụng mức VAT 8% vì không phải mặt hàng, dịch vụ nào cũng được giảm.",
    example: {
      text: "Ví dụ: 2 bàn làm việc gỗ × 1.250.000₫ + 2 ghế văn phòng × 750.000₫ = tạm tính 4.000.000₫; không chiết khấu; thuế GTGT 10% = 400.000₫; tổng cộng 4.400.000₫ (Bốn triệu bốn trăm nghìn đồng).",
      fills: { "bg-seller": "Công ty TNHH An Phát", "bg-contact": "12 Lê Lợi, Quận 1, TP. Hồ Chí Minh", "bg-customer": "Anh Nguyễn Văn Bình", "bg-item-0-name": "Bàn làm việc gỗ", "bg-item-0-qty": "2", "bg-item-0-price": "1.250.000", "bg-item-1-name": "Ghế văn phòng", "bg-item-1-qty": "2", "bg-item-1-price": "750.000", "bg-discount-type": "none", "bg-vat": "0.1", "bg-note": "Báo giá có hiệu lực 15 ngày kể từ ngày báo giá." }
    },
    faqs: [
      {
        q: "Thuế GTGT tính thế nào trong báo giá?",
        a: "Công cụ có 3 mức: 10% (mức thông thường), 8% (mức giảm áp dụng đến 31/12/2026 theo Nghị quyết 204/2025/QH15, từ 01/01/2027 về 10% nếu không được gia hạn) và 0% (không chịu thuế). Thuế GTGT tính trên số tiền sau chiết khấu. Lưu ý không phải mặt hàng, dịch vụ nào cũng được giảm 8% — viễn thông, tài chính, ngân hàng, chứng khoán, bảo hiểm, kinh doanh bất động sản, khai khoáng và một số nhóm khác vẫn chịu 10%; hỏi kế toán của bạn trước khi chọn 8%."
      },
      {
        q: "Chiết khấu tính trước hay sau thuế GTGT?",
        a: "Chiết khấu tính trước, thuế GTGT tính trên số tiền sau chiết khấu — đây là cách tính đúng theo quy định về giá tính thuế (giá bán đã trừ chiết khấu). Ví dụ tạm tính 3.000.000₫, chiết khấu 10% = 300.000₫, còn 2.700.000₫, thuế GTGT 8% = 216.000₫, tổng cộng 2.916.000₫. Chiết khấu tối đa 100% (theo %) hoặc bằng tạm tính (theo số tiền) — công cụ tự chặn để tổng cộng không âm."
      },
      {
        q: "Báo giá khác hóa đơn GTGT thế nào?",
        a: "Báo giá là văn bản thỏa thuận giá trước giao dịch — cho khách biết bạn bán gì, giá bao nhiêu, điều kiện ra sao; nó không có giá trị kê khai thuế và không thay thế hóa đơn. Hóa đơn GTGT là chứng từ thuế, phải xuất qua hệ thống hóa đơn điện tử theo Nghị định 123/2020/NĐ-CP khi bán hàng, cung cấp dịch vụ. File PDF của công cụ ghi rõ 'Đây là báo giá, không phải hóa đơn GTGT' ở cuối trang để tránh nhầm lẫn."
      },
      {
        q: "File PDF tải về có sửa được không?",
        a: "Không sửa trực tiếp được: file PDF chứa hình ảnh trang báo giá nên chữ trong đó không chọn hay cọp được văn bản (công cụ vẽ báo giá lên ảnh để chữ tiếng Việt hiện đúng mọi máy). Muốn sửa, sửa trong công cụ rồi bấm Tải file PDF lại — chỉ mất vài giây. Nếu cần cọp nội dung (dán vào Zalo, email), dùng nút Chép: bản văn bản đầy đủ hạng mục, các dòng tiền và tiền bằng chữ."
      },
      {
        q: "Báo giá nhiều hạng mục thì file PDF ra sao?",
        a: "Công cụ tự chia nhiều trang khổ A4: bảng hạng mục chảy sang trang sau, trang cuối có bảng tổng tiền, dòng tiền bằng chữ, ghi chú và 2 chỗ ký tên (người lập báo giá và khách hàng). Mỗi trang đều ghi 'Đây là báo giá, không phải hóa đơn GTGT' và số trang ở cuối. Tối đa 50 hạng mục mỗi báo giá."
      },
      {
        q: "Số lượng lẻ tính thế nào?",
        a: "Số lượng nhập được số lẻ, ví dụ 2,5 giờ công hoặc 1,5 kg — gõ dấu phẩy như cách viết Việt Nam. Thành tiền mỗi dòng làm tròn đến đồng (1,5 × 999₫ = 1.499₫). Dòng 0₫ (hàng tặng kèm, dịch vụ miễn phí) vẫn hiện trong bảng để khách thấy rõ, nhưng không làm tăng tổng tiền."
      },
      {
        q: "Báo giá có được lưu lại không?",
        a: "Có — bản nháp tự lưu trên trình duyệt này, đóng trang mở lại vẫn còn nguyên để sửa tiếp. Nhưng bản nháp chỉ nằm trên máy và trình duyệt bạn đang dùng; đổi máy, đổi trình duyệt hoặc xóa dữ liệu trình duyệt thì mất. Cần giữ bản cố định thì tải file PDF về hoặc chép bản văn bản lưu vào máy."
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
  "ma-tran-va-ban-dac-ta-de-kiem-tra": {
    intro: "Lập ma trận đề kiểm tra theo chủ đề × mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao): nhập số câu trắc nghiệm và tự luận từng ô, công cụ tính điểm từng ô, tổng điểm, tỷ lệ % theo mức độ, kiểm tổng đủ 10 điểm và tự sinh bản đặc tả từng câu (chủ đề, mức độ, dạng câu, điểm, yêu cầu cần đạt). Chép, in hoặc tải Excel 2 trang.",
    legalBasis: "Ma trận và bản đặc tả đề kiểm tra theo hướng dẫn xây dựng ma trận, đặc tả đề kiểm tra định kỳ của Bộ Giáo dục và Đào tạo (Công văn 5512/BGDĐT-GDTrH về xây dựng và tổ chức thực hiện kế hoạch giáo dục; Công văn 7991/BGDĐT-GDTrH ngày 17/12/2024 hướng dẫn THCS, THPT gộp còn 3 mức Biết, Hiểu, Vận dụng).",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "Ma trận đề kiểm tra là gì, đọc thế nào?",
        a: "Ma trận là bảng 2 chiều mô tả cấu trúc của đề kiểm tra: hàng là chủ đề (bài, chương), cột là mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao). Mỗi ô ghi số câu và số điểm của chủ đề đó ở mức độ đó. Đọc hàng ngang thấy chủ đề nào nặng nhất; đọc cột dọc thấy đề nghiêng về mức độ nào; hàng và cột tổng cho thấy tổng số câu, tổng điểm (10 điểm) và tỷ lệ %."
      },
      {
        q: "Bản đặc tả khác ma trận ở chỗ nào?",
        a: "Ma trận cho thấy cấu trúc chung của đề (bao nhiêu câu, bao nhiêu điểm ở đâu). Bản đặc tả đi sâu từng câu: Câu 1 thuộc chủ đề nào, mức độ nào, dạng trắc nghiệm hay tự luận, bao nhiêu điểm, và yêu cầu cần đạt là gì (học sinh phải làm được gì để trả lời đúng câu đó). Công cụ tự sinh bản đặc tả từ ma trận, giáo viên chỉ cần gõ yêu cầu cần đạt cho từng câu."
      },
      {
        q: "Yêu cầu cần đạt viết thế nào cho đúng?",
        a: "Viết bằng động từ đo được, gắn với mức độ của câu: Nhận biết dùng 'nhận biết được, nêu được, kể được'; Thông hiểu dùng 'giải thích được, so sánh được, phân biệt được'; Vận dụng dùng 'tính được, vận dụng được, giải quyết được'. Ví dụ: câu Nhận biết về số hữu tỉ thì ghi 'Nhận biết được số hữu tỉ.' Tránh động từ mơ hồ như 'hiểu' hay 'nắm được' vì khó đo khi chấm bài."
      },
      {
        q: "Đề của trường tôi dùng 3 mức Biết, Hiểu, Vận dụng thì sao?",
        a: "Công văn 7991/BGDĐT-GDTrH (17/12/2024) hướng dẫn THCS, THPT xây dựng ma trận, đặc tả theo 3 mức Biết, Hiểu, Vận dụng. Công cụ giữ 4 mức quen thuộc (thêm Vận dụng cao) vì nhiều trường vẫn dùng — giáo viên theo hướng dẫn mới thì gộp số câu Vận dụng cao vào cột Vận dụng, để cột Vận dụng cao bằng 0, ma trận vẫn tính đúng tổng 10 điểm."
      },
      {
        q: "Tổng điểm lệch 10 thì sửa thế nào?",
        a: "Công cụ báo đỏ rõ số lệch ('thiếu 0,25 điểm' hoặc 'thừa 1 điểm') ngay dưới bảng ma trận. Để sửa: thêm hoặc bớt 1 câu trắc nghiệm (thay đổi đúng bằng điểm mỗi câu trắc nghiệm), hoặc đổi điểm mỗi câu tự luận ở một ô. Mẹo hay dùng: chỉnh số câu trắc nghiệm trước vì mỗi câu chỉ 0,25 điểm nên dễ khớp đúng 10."
      },
      {
        q: "Ma trận đã làm lưu ở đâu, có mất khi tắt trình duyệt không?",
        a: "Ma trận, bản đặc tả và yêu cầu cần đạt đã gõ lưu trên trình duyệt của chính bạn (không gửi lên máy chủ), tắt trình duyệt rồi mở lại vẫn còn. Muốn lưu ra ngoài thì bấm 'Tải Excel (.xlsx)' để có file 2 trang (Ma trận + Đặc tả), hoặc 'Chép ma trận' / 'Chép bản đặc tả' rồi dán vào Excel hoặc Word."
      }
    ]
  },
  "so-do-cho-ngoi": {
    intro: "Xếp chỗ ngồi cho cả lớp theo lưới bàn (mặc định 6 dãy × 5 bàn, chỉnh được số dãy và số bàn mỗi dãy): kéo-thả đổi chỗ bằng chuột, hoặc bấm tên rồi bấm bàn trên điện thoại; xếp ngẫu nhiên toàn lớp hoặc chỉ xáo trộn bàn trống; sơ đồ lưu theo từng lớp, in ra dán lên bảng.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "Xếp chỗ ngồi bằng cách nào?",
        a: "Có 3 cách: kéo tên bạn từ danh sách 'Chưa xếp chỗ' thả vào bàn trống; kéo bạn từ bàn này sang bàn khác để đổi chỗ cho nhau; hoặc bấm 'Xếp ngẫu nhiên' để máy xếp hết cả lớp trong một lần. Trên điện thoại không kéo được thì bấm tên bạn rồi bấm bàn muốn xếp — bấm lần nữa để bỏ chọn."
      },
      {
        q: "'Xáo trộn chỉ bàn trống' khác 'Xếp ngẫu nhiên' ở chỗ nào?",
        a: "'Xếp ngẫu nhiên' xếp lại toàn bộ lớp từ đầu. 'Xáo trộn chỉ bàn trống' giữ nguyên các bạn đã ngồi đúng chỗ, chỉ xếp ngẫu nhiên các bạn chưa có chỗ vào bàn còn trống — dùng khi có bạn mới chuyển đến hoặc vài bạn nghỉ học dài ngày, không muốn xáo trộn cả lớp."
      },
      {
        q: "Lớp đông hơn số bàn thì sao?",
        a: "Số bạn thừa sẽ nằm ở danh sách 'Chưa xếp chỗ' bên dưới sơ đồ. Tăng số dãy hoặc số bàn mỗi dãy (nút +/−) để có thêm bàn rồi xếp tiếp. Giảm số bàn thì bạn ở bàn bị cắt sẽ tự về danh sách chưa xếp, không mất tên ai."
      },
      {
        q: "Sơ đồ lưu ở đâu, đổi lớp có mất không?",
        a: "Sơ đồ lưu trên trình duyệt của chính bạn, theo từng lớp — đổi sang lớp khác rồi quay lại thì sơ đồ lớp cũ vẫn còn nguyên. Đổi máy hoặc xóa dữ liệu trình duyệt thì sẽ mất, nên in ra hoặc chụp ảnh lại nếu cần giữ lâu."
      },
      {
        q: "In sơ đồ thế nào?",
        a: "Bấm nút 'In sơ đồ' — tờ in chỉ có tên lớp, ngày, bảng 'BẢNG' và lưới bàn với tên từng bạn, gọn một trang giấy để dán lên bảng hoặc kẹp vào sổ chủ nhiệm."
      }
    ]
  },
  "ghep-cap-thao-luan": {
    intro: "Chia lớp thành cặp thảo luận ngẫu nhiên: mỗi lần ghép là một cách chia mới, cặp đã ghép ở 2 lần gần nhất sẽ không lặp lại (trừ khi lớp quá ít bạn, không còn cách ghép khác). Lớp lẻ người thì có 1 nhóm 3. Chép danh sách cặp để dán lên bảng hoặc gửi vào nhóm lớp.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "Công cụ tránh lặp cặp như thế nào?",
        a: "Mỗi lần ghép, công cụ nhớ lại 2 lần ghép gần nhất của lớp đó và chọn cách chia không dùng lại cặp nào trong 2 lần ấy. Lớp 12 bạn có tới 66 cặp khả thi nên ghép nhiều lần vẫn tránh lặp được. Lớp chỉ có 2–4 bạn thì số cặp khả thi quá ít, tới một lúc sẽ hết cách ghép mới — khi đó công cụ báo rõ có mấy cặp bị lặp."
      },
      {
        q: "Lớp lẻ người thì bạn thừa ghép với ai?",
        a: "Bạn lẻ sẽ ghép vào cặp cuối cùng thành 1 nhóm 3 (ghi rõ 'nhóm 3' trên thẻ và trong danh sách chép). Lớp chỉ có 3 bạn thì cả 3 thành 1 nhóm. Không có bạn nào bị bỏ lại một mình."
      },
      {
        q: "Đổi danh sách lớp thì lịch sử tránh lặp còn đúng không?",
        a: "Lịch sử tránh lặp lưu theo vị trí của bạn trong danh sách, nên thêm/bớt bạn hoặc đổi thứ tự danh sách thì lịch sử cũ không còn chính xác — lần ghép sau đó có thể gặp lại cặp cũ. Muốn bắt đầu sạch thì bấm 'Quên lịch sử ghép cặp'."
      },
      {
        q: "Lịch sử ghép cặp lưu ở đâu?",
        a: "Lưu trên trình duyệt của chính bạn, theo từng lớp, chỉ giữ 2 lần gần nhất. Đổi máy hoặc xóa dữ liệu trình duyệt thì lịch sử mất, nhưng việc ghép cặp vẫn làm được bình thường."
      }
    ]
  },
  "bang-vinh-danh": {
    intro: "Vinh danh học sinh có điểm thi đua cao nhất lớp: top 3 lên bục vàng, bạc, đồng kèm huy chương và cấp độ thi đua (Lv.1 Mầm non, Lv.2 Chăm chỉ, Lv.3 Ngôi sao), các hạng tiếp theo xếp trong danh sách. Đồng điểm thì cùng hạng. In bảng ra để treo ở lớp hoặc dán ở bảng tin.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "Điểm vinh danh lấy từ đâu?",
        a: "Từ đúng cột Điểm của lớp trong Bàn giáo viên (cùng điểm với Bảng điểm lớp và điểm cộng khi gọi tên). Giáo viên chỉ cần ghi điểm một chỗ — cộng điểm ở Gọi tên hay Bảng điểm thì bảng này tự đọc điểm đó, không phải nhập lại."
      },
      {
        q: "Bảng vinh danh theo tuần hay theo tháng?",
        a: "Bảng điểm lớp hiện chưa lưu ngày cộng điểm nên bảng này xếp theo tổng điểm hiện tại của từng bạn (ghi rõ trên trang). Muốn vinh danh theo tuần/tháng thì đặt lại điểm về 0 ở đầu tuần/tháng trong Bảng điểm lớp, điểm cộng sau đó chính là điểm của kỳ đó."
      },
      {
        q: "Hai bạn đồng điểm thì hạng tính thế nào?",
        a: "Đồng điểm thì cùng hạng, hạng tiếp theo bỏ qua số đã dùng — ví dụ 2 bạn cùng hạng 2 thì bạn tiếp theo là hạng 4, không có hạng 3. Trên bục top 3, 2 bạn đồng hạng sẽ đứng cùng một bậc."
      },
      {
        q: "Lớp chưa có điểm nào thì bảng hiện gì?",
        a: "Bảng hiện hướng dẫn ngắn: ghi điểm ở Bảng điểm lớp trước (cộng điểm cho các bạn khi gọi tên đúng, làm bài tốt, giúp bạn…), rồi quay lại đây để xem bảng vinh danh. Lớp chưa có bạn nào thì chọn lớp khác hoặc dùng lớp mẫu để xem thử."
      }
    ]
  },
  "chuyen-ma-tieng-viet-tcvn3-vni-unicode": {
    intro: "Đổi văn bản tiếng Việt giữa 3 bảng mã: Unicode (chuẩn hiện nay), TCVN3 còn gọi là bảng mã ABC (dùng với font .VnTimes, .VnArial trong văn bản cũ) và VNI (quy ước gõ bằng số: a6 = â, a8 = ă, d9 = đ, dấu 1–5 sau nguyên âm). Dán văn bản, chọn mã nguồn và mã đích, kết quả hiện ngay — chữ không dấu, số và dấu câu giữ nguyên.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "TCVN3 (ABC) là gì, sao văn bản cũ mở ra toàn ký tự lạ?",
        a: "TCVN3 (tiêu chuẩn TCVN 5712:1993, còn gọi bảng mã ABC) là bảng mã tiếng Việt cũ, dùng với các font bắt đầu bằng .Vn (như .VnTimes, .VnArial). Trong bảng này, chữ có dấu được ghi bằng các ký tự Latin-1 khác — ví dụ 'Cộng' viết thành 'Céng'. Mở văn bản TCVN3 bằng font Unicode thì máy hiện đúng các ký tự Latin-1 đó nên đọc không ra tiếng Việt. Chuyển sang Unicode là đọc được ngay."
      },
      {
        q: "VNI là gì?",
        a: "VNI là quy ước gõ tiếng Việt bằng số, do kỹ sư Hồ Thành Việt sáng tạo năm 1987: gõ số ngay sau nguyên âm để thêm mũ và dấu — a6 = â, a8 = ă, e6 = ê, o6 = ô, o7 = ơ, u7 = ư, d9 = đ; dấu sắc/huyền/hỏi/ngã/nặng là 1/2/3/4/5 (a1 = á, a61 = ấ, e65 = ệ). Ví dụ: 'Tie61ng Vie65t' là 'Tiếng Việt'. Lưu ý đây là quy ước gõ VNI, khác với bảng mã 8-bit VNI-Windows (font VNI-Times) — công cụ này không xử lý VNI-Windows."
      },
      {
        q: "Chữ hoa có dấu trong TCVN3 viết thế nào?",
        a: "Bảng mã TCVN3 không có ký tự riêng cho chữ hoa có dấu (À, Ế, Ộ…). Quy ước của font ABC là ghi bằng 2 ký tự: chữ hoa không dấu + ký tự thường có dấu cùng họ — ví dụ À = 'A' + 'µ', Ế = 'E' + 'Õ', Ộ = 'O' + 'é'. Chỉ có 7 chữ hoa không dấu thanh có ký tự riêng: Ă, Â, Ê, Ô, Ơ, Ư, Đ. Khi chuyển sang Unicode, công cụ tự ghép cặp 2 ký tự thành chữ hoa có dấu; khi chuyển ngược lại cũng tự tách ra đúng quy ước."
      },
      {
        q: "Số đứng sau nguyên âm trong văn bản VNI thì sao?",
        a: "Trong mã VNI, số 1–5 đứng ngay sau nguyên âm được hiểu là dấu, nên 'a1' đọc thành 'á' chứ không phải chữ 'a' và số 1. Nếu văn bản của bạn có số thật đứng sau nguyên âm (ví dụ mã hàng 'a1'), hãy tách số ra khỏi nguyên âm bằng khoảng trắng trước khi chuyển. Số đứng sau phụ âm (như 'b1') hoặc sau khoảng trắng thì giữ nguyên."
      },
      {
        q: "Nút Đoán mã có chắc chắn không?",
        a: "Đoán mã chỉ là gợi ý dựa trên ký tự đặc trưng: văn bản TCVN3 có nhiều ký tự lạ như µ, ß, ·, ñ; văn bản VNI có mẫu nguyên âm + số (a61, o72, d9); văn bản Unicode có các chữ như ơ, ư, đ, ộ, ệ. Văn bản ngắn, không dấu hoặc lẫn nhiều mã có thể đoán sai hoặc không đoán được — khi đó bạn cứ chọn tay mã nguồn cho chắc."
      },
      {
        q: "Ký tự nào được giữ nguyên khi chuyển mã?",
        a: "Chữ không dấu, số, dấu câu, khoảng trắng và mọi ký tự không thuộc bảng mã đều giữ nguyên. Riêng với TCVN3, các byte không có trong bảng chuẩn (như ÿ, ¯, °) cũng giữ nguyên thay vì đoán bừa. Văn bản dùng dấu tổ hợp (chữ + dấu rời) vẫn chuyển đúng vì công cụ chuẩn hóa về dạng tổ hợp sẵn trước khi chuyển."
      }
    ]
  },
  "anh-the-3x4-4x6": {
    intro: "Cắt ảnh chân dung thành ảnh thẻ 3×4, 4×6 hoặc 2×3 đúng chuẩn 300 DPI (354×472 px, 472×709 px, 236×354 px), tải tờ in 10×15 chứa nhiều ảnh để in ra cắt, và nén ảnh JPG nhẹ đi để gửi Zalo hay email. Mọi xử lý chạy ngay trên trình duyệt, ảnh không rời khỏi máy bạn.",
    updatedAt: "20/11/2026",
    faqs: [
      {
        q: "Ảnh thẻ làm ra có đúng chuẩn nộp hồ sơ không?",
        a: "Ảnh đúng kích thước và độ phân giải chuẩn: 3×4 cm là 354×472 px, 4×6 cm là 472×709 px, 2×3 cm là 236×354 px, đều ở 300 DPI. Tuy nhiên mỗi nơi nộp hồ sơ có yêu cầu riêng về màu nền (trắng hay xanh dương), thời gian chụp (thường trong 6 tháng), trang phục và tư thế — bạn kiểm lại với nơi nộp trước khi in."
      },
      {
        q: "Tờ in 10×15 in ở đâu, in thế nào cho đúng cỡ?",
        a: "Đem file tờ in ra tiệm in ảnh, hoặc in bằng máy in màu tại nhà trên giấy ảnh khổ 10×15 cm. Khi in, chọn đúng khổ giấy 10×15 và in 100% (không chọn 'vừa trang' hay 'thu nhỏ cho vừa'), nếu không ảnh sẽ lệch cỡ. Tờ 3×4 có 9 ảnh, tờ 4×6 có 4 ảnh, tờ 2×3 có 21 ảnh (xếp xoay cho vừa nhiều), các ảnh cách nhau khoảng 1 mm để cắt cho dễ."
      },
      {
        q: "Chọn nền trắng hay xanh dương có tác dụng gì?",
        a: "Nền trắng/xanh dương chỉ tô nền khi ảnh của bạn là PNG nền trong suốt. Ảnh chụp thường đã có nền sẵn (tường, rèm, phông nền) nên chọn nền nào cũng không đổi gì — công cụ không tách nền, không thay được nền của ảnh chụp. Muốn ảnh thẻ nền trắng/xanh đúng chuẩn thì chụp trước phông nền trơn màu đó."
      },
      {
        q: "Ảnh HEIC của iPhone thì làm sao?",
        a: "Công cụ chưa hỗ trợ ảnh HEIC (định dạng mặc định của iPhone). Để ảnh chụp mới lưu dạng JPG: trên iPhone vào Cài đặt → Máy ảnh → Định dạng → chọn 'Tương thích nhất'. Với ảnh HEIC có sẵn, bạn đổi sang JPG bằng cách mở ảnh trong ứng dụng Ảnh rồi chia sẻ qua một ứng dụng nhắn tin (ảnh gửi đi thường tự đổi sang JPG), hoặc dùng một trang đổi HEIC sang JPG rồi tải ảnh JPG lên đây."
      },
      {
        q: "Nén ảnh có làm mờ ảnh không?",
        a: "Mức nhẹ (90%) gần như không thấy khác bằng mắt thường; mức vừa (70%) vẫn tốt cho gửi Zalo, email hay tải lên hồ sơ; mức mạnh (50%) cho file nhỏ nhất nhưng có thể thấy vỡ ở vùng nhiều chi tiết. Ảnh nén ra lưu dạng JPG và giữ nguyên kích thước (ảnh quá lớn thì thu nhỏ còn tối đa 4.000 px chiều dài nhất). Ảnh PNG nền trong suốt sau khi nén thành nền trắng vì JPG không có kênh trong suốt."
      },
      {
        q: "Ảnh của tôi có bị tải lên mạng không?",
        a: "Không. Mọi việc — đọc ảnh, cắt khung, xuất ảnh thẻ, in tờ 10×15, nén ảnh — đều chạy bằng trình duyệt trên máy của bạn, ảnh không gửi đi đâu cả. Tắt trang là ảnh biến mất khỏi bộ nhớ trình duyệt."
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
