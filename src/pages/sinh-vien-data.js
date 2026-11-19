// Dữ liệu mục Sinh viên (/sinh-vien/) — NỘI DUNG LẤY TỪ BÁO CÁO NGHIÊN
// CỨU ĐÃ KIỂM CHỨNG (~/workspace/nghien-cuu-sinh-vien/bao-cao.md,
// 18/11/2026). KHÔNG tự thêm khóa học hay ưu đãi ngoài báo cáo.
// Ranh giới pháp lý (§2.5): chỉ link nguồn miễn phí CHÍNH THỨC + nội
// dung gốc tự viết; TUYỆT ĐỐI KHÔNG: "Coursera audit toàn khóa" (đã bỏ
// từ 8/8/2025), Google Digital Garage (đã đóng 2025), Canva for
// Education (chỉ K-12), FUNiX/Kyna/Unica, sách lậu, khóa lậu, tài khoản
// dùng chung, bài mẫu sao chép để nộp.

// ---------------------------------------------------------------------------
// Khóa học miễn phí (§2.2): 7 nền tảng nên đưa nhất + edX/Coursera ghi
// đúng giới hạn (limited: true → thẻ hiện chip "Có giới hạn").
// ---------------------------------------------------------------------------
export const COURSES = [
  {
    name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org',
    learn: 'Lập trình: web, JavaScript, Python, khoa học dữ liệu, ML; tiếng Anh cho dev.',
    free: 'Miễn phí 100% cả chứng chỉ — tổ chức từ thiện, không có gói trả phí. Học tương tác + 5 dự án + thi miễn phí, chứng chỉ có URL công khai để đưa vào CV.',
    cond: 'Tài khoản miễn phí (email bất kỳ) để lưu tiến độ.',
  },
  {
    name: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu',
    learn: '2.585 khóa của MIT: CNTT, kỹ thuật, toán, lý, kinh tế, quản trị, tâm lý…',
    free: 'Miễn phí 100%: giáo trình, bài giảng, bài tập, đề thi (nhiều khóa có video đầy đủ). Không tín chỉ, không chứng chỉ, không chấm bài.',
    cond: 'Không cần tài khoản, không cần đăng ký.',
  },
  {
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    learn: '840+ khóa: toán, lý, hóa, sinh, kinh tế – tài chính, lịch sử, lập trình; luyện thi SAT/LSAT/MCAT.',
    free: 'Miễn phí 100%, không quảng cáo (phi lợi nhuận). Video + bài tập đầy đủ. Không có chứng chỉ. Chỉ trợ lý AI Khanmigo trả phí ($4/tháng).',
    cond: 'Không cần tài khoản để xem; tài khoản miễn phí để lưu tiến độ.',
  },
  {
    name: 'VMOOCs',
    url: 'https://vmoocs.vn',
    learn: '40+ khóa TIẾNG VIỆT của ĐH Mở TP.HCM: quản trị kinh doanh, tài chính – ngân hàng, luật, ngoại ngữ, kế toán, xây dựng…',
    free: 'Miễn phí thật 100%. Cấp chứng nhận hoàn thành miễn phí khi hoàn thành trên 70%. Khóa 3–7 tuần, tự học.',
    cond: 'Đăng ký tài khoản miễn phí trên web. Không cần là sinh viên ĐH Mở.',
  },
  {
    name: 'Microsoft Learn',
    url: 'https://learn.microsoft.com',
    learn: 'Azure, AI/Copilot, C#/.NET, Power BI, Excel, Power Platform, bảo mật, dữ liệu.',
    free: 'Nội dung học miễn phí 100%: module, learning path, kiểm tra, huy hiệu kỹ năng. Thi lấy chứng chỉ chính thức trả phí riêng. Lưu ý: sandbox Azure miễn phí trong bài thực hành đã bị gỡ từ 2026.',
    cond: 'Không cần tài khoản để đọc; tài khoản Microsoft miễn phí để lưu tiến độ.',
  },
  {
    name: 'Google Skillshop',
    url: 'https://skillshop.withgoogle.com',
    learn: 'Chứng chỉ Google Ads (Search, Display, Video…), Google Analytics 4, Gemini cho Workspace; khóa Digital Marketing cơ bản 40 giờ.',
    free: 'Miễn phí 100%: học + thi + chứng chỉ đều 0₫, thi lại miễn phí. Chứng chỉ Ads/Analytics hiệu lực 1 năm (điểm đạt 80%). Khóa Digital Marketing nay chỉ còn huy hiệu "award", không phải chứng chỉ chính thức.',
    cond: 'Chỉ cần tài khoản Google/Gmail bất kỳ.',
  },
  {
    name: 'Duolingo',
    url: 'https://www.duolingo.com',
    learn: 'Tiếng Anh + 40 ngôn ngữ, toán, nhạc — bài học ngắn dạng game.',
    free: 'Toàn bộ bài học miễn phí (có quảng cáo, giới hạn "tim"). Gói Super trả phí chỉ để gỡ quảng cáo + tim vô hạn. Không cấp chứng chỉ (bài thi Duolingo English Test là dịch vụ riêng, $70).',
    cond: 'Tài khoản miễn phí; bài đầu tiên học được không cần đăng ký.',
  },
  {
    name: 'Saylor University',
    url: 'https://saylor.org',
    learn: 'Khóa học + sách miễn phí nhiều ngành, tự học theo tốc độ riêng — kể cả chương trình thạc sĩ 0₫ học phí.',
    free: 'Miễn phí 100% học trực tuyến và tự học ("100% Online, Self-Paced, and Tuition Free!"). Chứng chỉ hoàn thành miễn phí khi đạt từ 70%.',
    cond: 'Thi lấy tín chỉ ĐH Mỹ (nếu muốn công nhận tín chỉ) có phí giám thị khoảng $5–25.',
  },
  {
    name: 'edX',
    url: 'https://www.edx.org',
    learn: 'Khóa ĐH Harvard, MIT, Berkeley: CS50, dữ liệu, kinh doanh, kỹ thuật.',
    free: 'Chế độ xem miễn phí (audit) vẫn còn: xem toàn bộ video, bài đọc, bài tập không chấm điểm — nhưng giới hạn thời gian (tính từ lúc đăng ký). Không bài chấm điểm, không chứng chỉ (chứng chỉ khoảng $50–300). Ngoại lệ: CS50 của Harvard cấp chứng chỉ MIỄN PHÍ qua cs50.harvard.edu.',
    cond: 'Tài khoản (email bất kỳ). Khóa Boot Camp/Executive Education không có chế độ xem miễn phí.',
    limited: true,
  },
  {
    name: 'Coursera',
    url: 'https://www.coursera.org',
    learn: 'Khóa ĐH Stanford, Yale…: lập trình, thuật toán, tiếng Anh, tâm lý, kinh doanh.',
    free: 'Chế độ audit toàn khóa đã bỏ từ 8/8/2025. Hiện chỉ còn: xem thử miễn phí module 1 (kèm bài tập chấm điểm module đó, giữ tối đa 6 tháng); khoảng 29 khóa "Full Course, No Certificate" miễn phí toàn bộ (ví dụ: Learning How to Learn; Algorithms I & II của Princeton; English for Career Development). Không khóa nào cho chứng chỉ miễn phí. Vẫn có Financial Aid: xin miễn phí từng khóa (kèm chứng chỉ), duyệt khoảng 15 ngày.',
    cond: 'Tài khoản (email bất kỳ). Khi ghi danh, chọn "Full Course, No Certificate".',
    limited: true,
  },
];

// ---------------------------------------------------------------------------
// Học bổng (báo cáo bổ sung đợt 2, Ưu tiên 1 — 24 chương trình, kiểm
// chứng 18/11/2026). CHỈ ghi chu kỳ hằng năm, KHÔNG ghi hạn cố định
// (hầu hết đợt 2026–27 đã đóng). links: [] = không có trang nộp đơn cố
// định (ghi rõ cách theo dõi trong note). Các con số lấy từ báo cáo;
// riêng mức tiền Eiffel (EUR) và CSC (CNY) đã BỎ vì báo cáo §4 yêu cầu
// kiểm lại trang chính thức trước khi đăng số tiền.
// ---------------------------------------------------------------------------
export const SCHOLARSHIPS_DOMESTIC = [
  {
    name: 'Học bổng khuyến khích học tập (Nhà nước)',
    links: [{ url: 'https://tuyensinh.hnue.edu.vn/tin-tuc/488?page=8', label: 'Trang giải thích (ĐH Sư phạm Hà Nội) →' }],
    support: '3 loại Khá/Giỏi/Xuất sắc, từ mức trần học phí trở lên; cấp theo học kỳ.',
    note: 'Theo Nghị định 84/2020/NĐ-CP. Học bổng phổ biến nhất — sinh viên học Khá trở lên đều có thể được. Trường tự xét cuối học kỳ, sinh viên không nộp đơn.',
  },
  {
    name: 'VietSeeds Foundation',
    links: [{ url: 'https://vietseeds.org/become-our-student', label: 'Trang chính thức →' }],
    support: 'Tới 1.500 USD/năm (Hà Nội/TP.HCM), 1.200 USD/năm (Huế) + mentoring 1–1 + đào tạo kỹ năng.',
    note: 'Cho sinh viên khó khăn học giỏi — vừa tiền vừa người dẫn dắt. Tuyển sinh tại Hà Nội, Huế, TP.HCM; xem đợt tuyển hiện tại trên trang chính thức.',
  },
  {
    name: 'Học bổng Đinh Thiện Lý / Lawrence S. Ting (Quỹ LSTF)',
    links: [{ url: 'https://www.lstf.org.vn/vi/linh-vuc/giao-duc/hoc-bong-dinh-thien-ly/', label: 'Trang chính thức →' }],
    support: '100% học phí chương trình chính quy (từ 2025) + đào tạo kỹ năng, thực tập.',
    note: 'Học bổng lớn, uy tín lâu năm. Chỉ 12 trường ĐH đối tác; tân sinh viên top 10% đầu vào, sinh viên năm cuối top 10% hoặc hoàn cảnh đặc biệt.',
  },
  {
    name: 'Học bổng Vallet (Odon Vallet — Gặp gỡ Việt Nam)',
    links: [{ url: 'https://rvn-vallet.org/', label: 'Trang chính thức →' }],
    support: '34 triệu đồng/suất (sinh viên ĐH + sau ĐH).',
    note: 'Học bổng khoa học lớn nhất Việt Nam. Khối KHTN/Công nghệ/Khoa học sự sống/Y Dược/Môi trường; xét theo khu vực Bắc/Trung/Nam.',
  },
  {
    name: 'Học bổng Panasonic Việt Nam',
    links: [],
    support: '30 triệu đồng/suất/năm học + thực tập, đào tạo; 20 suất toàn quốc.',
    note: 'Sinh viên từ năm 2, GPA từ 8.0 (hoặc từ 7.0 nếu hoàn cảnh khó khăn). Không có trang học bổng cố định — theo dõi qua phòng Công tác sinh viên của trường hoặc fanpage Panasonic Vietnam.',
  },
  {
    name: 'Học bổng Toyota Việt Nam',
    links: [{ url: 'https://dsa.ctu.edu.vn/images/upload/vbanply/2026/HBTaiTro/F_-_CV_6818_-_Hoc_bong_Toyota_2026.pdf', label: 'Công văn Bộ GD&ĐT (PDF) →' }],
    support: '98 suất: Tiếp sức 6 triệu đồng/suất; Đồng hành 25 triệu đồng/suất.',
    note: 'Chương trình của Bộ GD&ĐT + Toyota Việt Nam, cho sinh viên 2 năm cuối khối kỹ thuật; 12 trường đối tác, nộp qua trường. Có thêm học bổng dạy nghề Toyota: 100% học phí 2 năm + ký túc xá miễn phí (CĐ Cơ điện Hà Nội).',
  },
  {
    name: 'Học bổng ĐH Fulbright Việt Nam',
    links: [{ url: 'https://fulbright.edu.vn/undergraduate-scholarships', label: 'Trang chính thức →' }],
    support: '10%–100% học phí 4 năm; có suất Nguyễn–Phương Family 100% × 4 năm (1 suất/năm) và Vietcombank–Fulbright 60 triệu đồng/sinh viên.',
    note: 'Học bổng của trường, học trong nước. Tuyển sinh theo 2 đợt mỗi năm (Fall Cycle và Spring Cycle) — xem lịch trên trang chính thức.',
  },
  {
    name: 'Quỹ Khuyến học Việt Nam / Hội Khuyến học VN',
    links: [{ url: 'https://hoikhuyenhoc.vn/', label: 'Trang chính thức →' }],
    support: 'Học bổng Nguyễn Trường Tộ 7,5 triệu đồng/suất (thường niên).',
    note: 'Quỹ nhà nước còn hoạt động, trao qua trường/hội khuyến học địa phương — không có cổng nộp đơn trực tuyến.',
  },
];

export const SCHOLARSHIPS_ABROAD = [
  {
    name: 'Australia Awards (Chính phủ Úc)',
    links: [{ url: 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships-opening-and-closing-dates', label: 'Trang chính thức →' }],
    support: 'Toàn phần: học phí, sinh hoạt, vé máy bay, bảo hiểm.',
    note: 'Chỉ bậc Thạc sĩ (đối với Việt Nam). Cần từ 24 tháng kinh nghiệm làm việc tại Việt Nam.',
  },
  {
    name: 'Chevening (Chính phủ Anh)',
    links: [{ url: 'https://www.chevening.org/scholarship/vietnam/', label: 'Trang chính thức →' }],
    support: 'Toàn phần: học phí + sinh hoạt + vé khứ hồi + trợ cấp + phí visa.',
    note: 'Thạc sĩ 1 năm. Cần từ 2 năm kinh nghiệm (2.800 giờ) + cam kết về Việt Nam từ 2 năm; khoảng 20 suất/năm cho Việt Nam.',
  },
  {
    name: 'Fulbright — Chương trình Sinh viên Việt Nam (Chính phủ Mỹ)',
    links: [{ url: 'https://vn.usembassy.gov/fulbright-vietnamese-student-program/', label: 'Trang chính thức (ĐSQ Mỹ) →' }],
    support: 'Toàn phần: học phí + sinh hoạt + bảo hiểm + vé khứ hồi.',
    note: 'Bậc Thạc sĩ. Cần từ 2 năm kinh nghiệm sau ĐH, TOEFL iBT từ 80 / IELTS từ 6.5; khoảng 20 suất/năm. Có thêm chương trình Visiting Student Researcher (nghiên cứu sinh sang Mỹ 6–10 tháng).',
  },
  {
    name: 'Erasmus Mundus Joint Masters (EU)',
    links: [{ url: 'https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters', label: 'Trang chính thức →' }],
    support: 'Toàn phần: học phí + đi lại + visa + sinh hoạt.',
    note: 'Thạc sĩ liên kết 1–2 năm, học tại từ 2–3 nước châu Âu. Mở hằng năm, thường tháng 10 – tháng 1 cho khóa nhập học tháng 9 năm sau. Tối đa 3 chương trình/năm.',
  },
  {
    name: 'MEXT (Chính phủ Nhật Bản)',
    links: [{ url: 'https://studyinjapan.go.jp/', label: 'Cổng Study in Japan →' }],
    support: 'Toàn phần: 100% học phí + sinh hoạt + vé khứ hồi + khóa tiếng Nhật dự bị.',
    note: 'Bậc ĐH, CĐ kỹ thuật, trung cấp chuyên nghiệp, nghiên cứu sinh. Nộp hồ sơ qua Đại sứ quán/Tổng Lãnh sự quán Nhật Bản theo hộ khẩu.',
  },
  {
    name: 'JASSO — Học bổng Danh dự Monbukagakusho (Nhật)',
    links: [{ url: 'https://www.jasso.go.jp/en/ryugaku/scholarship_j/shoreihi/about.html', label: 'Trang chính thức →' }],
    support: '48.000 yên/tháng (ĐH/sau ĐH), 30.000 yên/tháng (trường tiếng), 12 tháng.',
    note: 'Chỉ dành cho sinh viên ĐÃ đang học tại Nhật (ĐH, sau ĐH, CĐ, trường tiếng) — trường đang học đề cử. Đây không phải học bổng để đi du học từ Việt Nam.',
  },
  {
    name: 'Global Korea Scholarship — GKS (Hàn Quốc)',
    links: [{ url: 'https://studyinkorea.go.kr/', label: 'Cổng Study in Korea →' }],
    support: 'Toàn phần: học phí + sinh hoạt + vé khứ hồi + bảo hiểm + 1 năm tiếng Hàn.',
    note: 'Chính phủ Hàn Quốc (NIIED). Bậc ĐH (GKS-U) + Thạc sĩ/Tiến sĩ (GKS-G). Nộp qua Đại sứ quán hoặc trường ĐH — chỉ chọn 1 tuyến.',
  },
  {
    name: 'DAAD (Đức)',
    links: [{ url: 'https://www.daad-vietnam.org/', label: 'Trang chính thức (DAAD Việt Nam) →' }],
    support: '992 EUR/tháng (thạc sĩ), 1.400 EUR/tháng (tiến sĩ) + vé + bảo hiểm.',
    note: 'Thạc sĩ + Tiến sĩ + nghiên cứu sau Tiến sĩ (không có bậc ĐH cho sinh viên Việt Nam). Chương trình chính: STEM, EPOS (cần từ 2 năm kinh nghiệm), Helmut-Schmidt. Có thêm DAAD VORsprung — khóa dự bị STEM trực tuyến miễn phí.',
  },
  {
    name: 'Eiffel Excellence (Pháp — Campus France)',
    links: [{ url: 'https://www.campusfrance.org/en/eiffel-excellence-scholarship-programme', label: 'Trang chính thức →' }],
    support: 'Trợ cấp sinh hoạt hằng tháng + vé + bảo hiểm — KHÔNG bao học phí.',
    note: 'Thạc sĩ + Tiến sĩ (không có bậc ĐH). Sinh viên không tự nộp — trường ĐH Pháp nộp thay. Xem mức trợ cấp cụ thể trên trang chính thức.',
  },
  {
    name: 'CSC — Học bổng Chính phủ Trung Quốc',
    links: [{ url: 'https://campuschina.org/', label: 'Cổng Campus China →' }],
    support: 'Toàn phần: học phí + chỗ ở + trợ cấp sinh hoạt hằng tháng + bảo hiểm; Type B không bao vé máy bay.',
    note: 'Bậc ĐH + Thạc sĩ + Tiến sĩ. MỚI từ 2026: bậc ĐH bắt buộc thi CSCA trước khi nộp. Hạn hằng năm: tháng 1 – đầu tháng 4.',
  },
  {
    name: 'Taiwan MOE Scholarship (Đài Loan)',
    links: [{ url: 'https://taiwanscholarship.moe.gov.tw/', label: 'Trang chính thức →' }],
    support: 'Học phí tới 40.000 TWD/học kỳ + sinh hoạt 15.000 TWD/tháng (ĐH) / 20.000 TWD/tháng (thạc sĩ/tiến sĩ).',
    note: 'ĐH (tối đa 4 năm) + Thạc sĩ (tối đa 2 năm) + Tiến sĩ (tối đa 4 năm). Nộp qua Văn phòng Kinh tế Văn hóa Đài Bắc (TECO) tại Việt Nam + nộp riêng hồ sơ nhập học vào trường. Hạn hằng năm: 1/2 – 31/3.',
  },
  {
    name: 'Manaaki New Zealand Scholarships (NZ)',
    links: [{ url: 'https://nzscholarships.govt.nz/', label: 'Trang chính thức →' }],
    support: 'Toàn phần: học phí + sinh hoạt hằng tuần + trợ cấp ổn định 3.000 NZD + bảo hiểm + vé khứ hồi.',
    note: 'Chính phủ New Zealand. Sau ĐH (chứng chỉ/văn bằng sau ĐH, thạc sĩ, tiến sĩ) — sinh viên Việt Nam không được nộp bậc ĐH. Mở đầu năm (khoảng tháng 2–4).',
  },
  {
    name: 'SINGA — Singapore International Graduate Award',
    links: [{ url: 'https://a-star.edu.sg/', label: 'Trang chính thức (A*STAR) →' }],
    support: 'Toàn phần 4 năm: 100% học phí + 2.700 SGD/tháng (3.200 sau kỳ thi Qualifying) + 1.000 SGD ổn định + tới 1.500 SGD vé máy bay; không ràng buộc.',
    note: 'Tiến sĩ/EngD trực tiếp sau ĐH (không bắt buộc thạc sĩ). Mở hằng năm cho khóa nhập học tháng 8 — kiểm tra lịch mở hiện tại trên trang chính thức.',
  },
  {
    name: 'Học bổng ĐH Singapore — NUS + NTU (bậc ĐH)',
    links: [
      { url: 'https://nus.edu.sg/oam/scholarships/scholarships-for-freshmen-international-students/the-association-of-banks-in-singapore---goh-keng-swee-scholarship', label: 'Học bổng NUS →' },
      { url: 'https://www.ntu.edu.sg/admissions/undergraduate/scholarships-and-awards/scholarship-opportunities/detail/asean-undergraduate-scholarship', label: 'Học bổng NTU →' },
    ],
    support: '100% học phí sau MOE Tuition Grant + sinh hoạt 5.800–6.000 SGD/năm + chỗ ở + máy tính 1.750 SGD.',
    note: 'BẮT BUỘC: cam kết làm việc 3 năm cho công ty đăng ký tại Singapore sau tốt nghiệp (do nhận MOE Tuition Grant). Duy trì GPA từ 3.5. NTU phải nộp đơn học bổng riêng.',
  },
  {
    name: 'Ireland Fellows Programme – Asia (Chính phủ Ireland)',
    links: [{ url: 'https://ireland.ie/IrelandFellowsProgramme', label: 'Trang chính thức →' }],
    support: 'Toàn phần: học phí + sinh hoạt + vé + bảo hiểm.',
    note: 'Thạc sĩ 1 năm. Chỉ Việt Nam, Campuchia, Lào (nhóm châu Á); cần từ 2 năm kinh nghiệm, GPA từ 3.0/4.0, chưa có bằng thạc sĩ.',
  },
  {
    name: 'Học bổng Khoa học & Công nghệ Vingroup',
    links: [{ url: 'https://scholarships.vinuni.edu.vn/', label: 'Trang chính thức →' }],
    support: 'Toàn phần: học phí + sinh hoạt + vé khứ hồi + bảo hiểm.',
    note: 'Du học sau ĐH. Từ khóa 2026 chỉ bậc Tiến sĩ (không còn thạc sĩ, trừ liên kết riêng). Ngành khoa học công nghệ ưu tiên, 13 nước; tối đa 35 tuổi; sau tốt nghiệp về Việt Nam làm việc cho ĐH/viện công lập hoặc hệ sinh thái Vingroup. Có thêm Vingroup Graduate Scholarship tại NTU Singapore (tiến sĩ 2.200–2.700 SGD/tháng).',
  },
];

// ---------------------------------------------------------------------------
// Sách giáo khoa miễn phí (báo cáo bổ sung đợt 2, Ưu tiên 2 — 6 nguồn
// trong khối sách; Saylor Academy đặt trong COURSES theo ghi chú báo cáo).
// Dùng chung mẫu thẻ khóa học: learn / free / cond.
// ---------------------------------------------------------------------------
export const BOOKS = [
  {
    name: 'OpenStax (Đại học Rice)',
    url: 'https://openstax.org',
    learn: 'Sách giáo khoa ĐH chuẩn Mỹ: Kinh tế, Calculus, Statistics, Vật lý, Sinh học, Hóa học, Kế toán, Tâm lý — thay cho giáo trình photo.',
    free: 'Miễn phí hoàn toàn — đọc online + tải PDF, giấy phép mở (CC). Sách tiếng Anh.',
    cond: 'Công cụ "Assignable" thu phí $15/sinh viên/kỳ chỉ dành cho giảng viên — sinh viên đọc sách không cần.',
  },
  {
    name: 'Open Textbook Library (Đại học Minnesota)',
    url: 'https://open.umn.edu/opentextbooks',
    learn: 'Kho sách mở lớn (1.915 sách), nhiều ngành, có đánh giá của giảng viên.',
    free: 'Tải, chỉnh sửa và chia sẻ miễn phí.',
    cond: 'Là thư mục tổng hợp — link tải dẫn về nơi xuất bản gốc; khoảng 70% sách có đánh giá.',
  },
  {
    name: 'LibreTexts',
    url: 'https://libretexts.org',
    learn: '2.000+ sách theo 17 ngành.',
    free: 'Đọc sách miễn phí.',
    cond: 'Bài tập ADAPT thu phí $15/6 tháng — chỉ đọc sách thì không mất tiền; giao diện hơi học thuật.',
  },
  {
    name: 'B.C. Open Collection — BCcampus (Canada)',
    url: 'https://collection.bccampus.ca',
    learn: 'Sách mở theo mã môn học.',
    free: 'Miễn phí, giấy phép mở, ai cũng dùng được.',
    cond: 'Sách xếp theo mã môn của tỉnh British Columbia nên sinh viên Việt Nam tìm hơi khó — ưu tiên thấp hơn 3 nguồn trên.',
  },
  {
    name: 'Project Gutenberg',
    url: 'https://www.gutenberg.org',
    learn: 'Sách kinh điển hết bản quyền — hợp sinh viên văn học, ngoại ngữ.',
    free: 'Miễn phí 100%, không cần đăng ký; tải EPUB/Kindle/PDF.',
    cond: 'Chỉ sách cũ hết bản quyền, không có giáo trình hiện đại. Trang đang xây dựng lại cơ sở dữ liệu, bản hiện tại thiếu một số sách mới nhất.',
  },
  {
    name: 'Thư viện Quốc gia Việt Nam',
    url: 'https://nlv.gov.vn/dich-vu-thu-vien/dich-vu-mien-phi.html',
    learn: 'Tra cứu OPAC, tóm tắt luận án tiến sĩ, báo/tạp chí Đông Dương, sách Hán Nôm toàn văn.',
    free: 'Đọc trực tuyến miễn phí các mục trên.',
    cond: 'Toàn văn luận án + cơ sở dữ liệu ProQuest/Springer/SAGE chỉ đọc trong mạng LAN tại thư viện (31 Tràng Thi, Hà Nội).',
  },
];

// ---------------------------------------------------------------------------
// Luyện thi IELTS/TOEIC miễn phí (báo cáo bổ sung đợt 2, Ưu tiên 3 —
// 8 nguồn chính thức). cta: nhãn nút riêng (IIG là nơi đăng ký thi, không
// phải tài liệu miễn phí). courseCard hiển thị cond chỉ khi có.
// ---------------------------------------------------------------------------
export const EXAM_PREP = [
  {
    name: 'British Council — LearnEnglish',
    url: 'https://learnenglish.britishcouncil.org',
    learn: 'Tài liệu tự học tiếng Anh: 10.000+ bài tập ngữ pháp, từ vựng, đọc/nghe/viết, mẹo thi.',
    free: 'Phần tự học miễn phí; tài khoản miễn phí để kiểm tra trình độ.',
    cond: 'Lớp trực tiếp với giáo viên và khóa IELTS có giáo viên là trả phí.',
  },
  {
    name: 'British Council — IELTS Ready',
    url: 'https://takeielts.britishcouncil.org',
    learn: 'Đề thi thử IELTS chính thức của British Council.',
    free: 'IELTS Ready miễn phí bất cứ lúc nào. IELTS Ready Premium (40+ đề thi thử, khóa học, video) miễn phí khi đặt thi IELTS với British Council.',
  },
  {
    name: 'British Council Việt Nam',
    url: 'https://www.britishcouncil.vn',
    learn: 'Cổng Việt Nam: đăng ký thi IELTS, lịch thi, trung tâm thi.',
    free: 'Cổng thông tin — dùng để tìm trang IELTS Việt Nam và đăng ký thi.',
    cond: 'Trang chủ không liệt kê trực tiếp tài liệu luyện thi.',
    cta: 'Đăng ký thi →',
  },
  {
    name: 'IELTS.org (trang chính thức của kỳ thi)',
    url: 'https://ielts.org/take-a-test/preparation-resources',
    learn: 'Đề mẫu chính thức cho cả 4 kỹ năng (Academic + General Training), có đáp án, transcript nghe, bài mẫu Writing kèm nhận xét giám khảo.',
    free: 'Đề mẫu miễn phí.',
    cond: 'Đề mẫu là câu hỏi mẫu theo dạng bài, không phải đề thi thử đầy đủ có tính giờ.',
  },
  {
    name: 'IDP IELTS Việt Nam — thi thử miễn phí',
    url: 'https://ielts.idp.com/vietnam/about/news-and-articles/article-ielts-computer-trial-at-home/en-gb',
    learn: 'Thi thử IELTS trên máy tính tại trung tâm IDP (Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng…), 15–20 phút/kỹ năng Nghe/Đọc/Viết + đề mẫu làm tại nhà cả 4 kỹ năng.',
    free: 'Hoàn toàn miễn phí. Thi thử xong được giảm 500.000₫ lệ phí thi thật nếu đăng ký thi với IDP.',
    cond: 'Cần đăng ký trước, số chỗ có hạn; kết quả trả chậm (vài tuần), không cấp bảng điểm chính thức; không có kỹ năng Nói trong thi thử tại trung tâm.',
  },
  {
    name: 'ETS TOEIC — đề mẫu chính thức',
    url: 'https://www.ets.org/toeic',
    learn: 'Đề thi mẫu TOEIC Listening & Reading đầy đủ (Form ST-05, 200 câu) + đề mẫu Speaking & Writing — nguồn duy nhất chính thức của ETS.',
    free: 'Đề mẫu tải miễn phí trực tiếp từ ets.org.',
    cond: 'Chỉ 1–2 đề mẫu, không phải ngân hàng đề lớn; file audio lấy kèm từ trang ETS.',
  },
  {
    name: 'Cambridge Write & Improve',
    url: 'https://writeandimprove.com',
    learn: 'Chấm bài viết tiếng Anh miễn phí bằng AI của Cambridge — rất hợp luyện IELTS Writing.',
    free: 'Miễn phí, dùng được không cần đăng ký; chấm tự động theo chuẩn CEFR.',
    cond: 'Chấm tự động bằng AI, không thay giáo viên; bản "+Class View" cho giáo viên/tổ chức có thể trả phí.',
  },
  {
    name: 'IIG Việt Nam (đại diện của ETS tại VN)',
    url: 'https://www.iigvietnam.com',
    learn: 'Nơi đăng ký thi TOEIC/TOEFL chính thức tại Việt Nam — xem lịch thi, lệ phí.',
    free: 'Đây là nơi đăng ký thi, không phải tài liệu luyện thi miễn phí.',
    cond: 'Khóa luyện trên nền tảng IIG là trả phí.',
    cta: 'Đăng ký thi →',
  },
];

// ---------------------------------------------------------------------------
// Việc làm thêm & thực tập (báo cáo bổ sung đợt 2, Ưu tiên 4 — 7 kênh).
// Kênh #7 Sàn vieclam.gov.vn ĐÃ BỎ (báo cáo dặn kiểm lại link bằng trình
// duyệt thật trước khi đăng). TopCV chỉ link trang chủ (đường dẫn
// viec-lam-them trả 404). Việc Làm Tốt đúng tên miền vieclamtot.com.
// ---------------------------------------------------------------------------
export const JOBS = [
  {
    name: 'YBOX',
    url: 'https://ybox.vn',
    desc: 'Kênh việc làm/học bổng chuyên cho sinh viên, cập nhật hằng ngày: thực tập, việc làm thêm, học bổng — có cả khóa học miễn phí.',
    note: 'Miễn phí xem + ứng tuyển. Lưu ý: ngay trên YBOX cũng có tin kiểu "không cần kinh nghiệm, thu nhập 20–30tr/tháng" — đọc hộp cảnh báo bên dưới.',
  },
  {
    name: 'TopCV',
    url: 'https://www.topcv.vn',
    desc: 'Nền tảng tuyển dụng lớn nhất Việt Nam, có lọc thực tập/bán thời gian.',
    note: 'Miễn phí tìm việc + tạo CV (TopCV Pro trả phí là tính năng thêm). Dùng bộ lọc "Cấp bậc: Thực tập sinh" + "Loại hình: Bán thời gian" để tìm việc thực tập/bán thời gian. Tin thực tập có phụ cấp 2–3,3 triệu đồng/tháng.',
  },
  {
    name: 'VietnamWorks',
    url: 'https://www.vietnamworks.com',
    desc: 'Việc thực tập từ công ty lớn.',
    note: 'Miễn phí cho người tìm việc. Lọc "Mới tốt nghiệp / Thực tập", cấp bậc "Thực tập sinh / Sinh viên".',
  },
  {
    name: 'CareerViet',
    url: 'https://careerviet.vn',
    desc: 'Chuyên mục riêng "Việc làm Sinh viên / Thực tập sinh" + lọc việc bán thời gian.',
    note: 'Miễn phí cho người tìm việc.',
  },
  {
    name: 'LinkedIn Jobs',
    url: 'https://www.linkedin.com/jobs/search/?keywords=intern&location=Vietnam',
    desc: 'Việc thực tập tại công ty đa quốc gia (TikTok, Amazon, Xiaomi, Michelin…). Hơn 1.000 việc thực tập tại Việt Nam đang mở.',
    note: 'Miễn phí; cần tài khoản LinkedIn miễn phí để ứng tuyển (xem tin không cần đăng nhập). Lọc Internship / Part-time.',
  },
  {
    name: 'Việc Làm Tốt (Chợ Tốt Jobs)',
    url: 'https://www.vieclamtot.com',
    desc: 'Việc làm thêm theo ca gần nhà: phục vụ, bán hàng, gia sư, shipper.',
    note: 'Miễn phí cho người tìm việc. Lương theo giờ khoảng 18–25k.',
  },
  {
    name: 'Chương trình thực tập doanh nghiệp lớn',
    url: 'https://www.samsungcareers.com.vn',
    desc: 'Sinh viên năm cuối săn thực tập tại tập đoàn lớn — ví dụ Samsung Việt Nam: Fresh Staff + Intern, thực tập 2–3 tháng.',
    note: 'Miễn phí ứng tuyển. Có học bổng SEMV 3.000 USD. Xem đợt tuyển hiện tại trên trang tuyển dụng chung — không ghi hạn cố định vì hạn sẽ qua.',
  },
];

// Hộp cảnh báo lừa đảo việc làm (nguồn chính thức: Công an tỉnh Ninh
// Bình + chiến dịch của Văn phòng Bộ Công an tại ĐH Huế, 8–10/11/2026).
export const JOB_SCAM = {
  text: 'Cảnh giác lừa đảo việc làm — sinh viên là đối tượng bị nhắm tới nhiều nhất. Dấu hiệu lừa đảo: "việc nhẹ lương cao", cộng tác viên online phải đóng phí giữ chỗ, người tự xưng công an/viện kiểm sát yêu cầu chuyển tiền. Tuyệt đối không đóng phí trước khi làm việc và không đưa mã OTP cho bất kỳ ai.',
  sourceUrl: 'https://congan.ninhbinh.gov.vn/canh-giac-voi-thu-doan-lua-dao-chiem-doat-tai-san-doi-voi-hoc-sinh-sinh-vien-nguoi-dan-trong-dip-nghi-he',
  sourceLabel: 'Cảnh báo của Công an tỉnh Ninh Bình',
};

// ---------------------------------------------------------------------------
// Ưu đãi sinh viên (§2.4): 7 ưu đãi + 1 ưu đãi theo mùa đưa lên đầu khối.
// URL Google AI Plus (one.google.com/ai-student) là trang đăng ký chính
// thức của Google — kiểm chứng từ trang hỗ trợ Google One (support.google.
// com/googleone/answer/17422238) ngày 18/11/2026.
// ---------------------------------------------------------------------------
export const SEASONAL_DEAL = {
  name: 'Google AI Plus — 1 năm miễn phí cho sinh viên',
  url: 'https://one.google.com/ai-student',
  deadline: 'Hạn đăng ký: 31/12/2026',
  text: 'Sinh viên đại học từ 18 tuổi được 1 năm Google AI Plus miễn phí. Cần tài khoản Google cá nhân (không phải tài khoản trường), xác minh sinh viên qua SheerID và thêm một phương thức thanh toán. Hết năm đầu, gói tự gia hạn có phí nếu bạn không hủy.',
};

export const DEALS = [
  {
    name: 'GitHub Student Developer Pack',
    url: 'https://education.github.com/pack',
    get: '70+ ưu đãi: GitHub Pro miễn phí suốt thời gian là sinh viên; Copilot Student; JetBrains miễn phí; Azure $100 credit + 25+ dịch vụ miễn phí (từ 18 tuổi); tên miền .me/.tech miễn phí 1 năm; 1Password 2 năm; DataCamp 3 tháng. Xác minh hiệu lực 2 năm.',
    cond: 'Từ 13 tuổi, đang học chương trình cấp bằng/chứng chỉ. Sinh viên Việt Nam dùng được: xác minh bằng email trường HOẶC giấy tờ có ngày (thẻ sinh viên, thời khóa biểu, bảng điểm, thư nhập học). Không bắt buộc email .edu.',
  },
  {
    name: 'JetBrains',
    url: 'https://www.jetbrains.com/community/education/',
    get: 'All Products Pack miễn phí 1 năm, gia hạn hằng năm: IntelliJ IDEA Ultimate, PyCharm Pro, WebStorm, Rider, CLion, DataGrip… (trị giá khoảng $299/năm). AI Pro không kèm (chỉ AI Free + thử AI Pro 30 ngày). Sau tốt nghiệp giảm 40% trong 2 năm.',
    cond: 'Sinh viên chính quy chương trình từ 1 năm trở lên. Xác minh: email trường, thẻ ISIC, tài khoản GitHub Student Pack, hoặc thẻ sinh viên. Chỉ dùng phi thương mại.',
  },
  {
    name: 'Figma for Education',
    url: 'https://www.figma.com/education/apply',
    get: 'Gói Professional miễn phí 1 năm, gia hạn được: file/dự án không giới hạn, FigJam, Dev Mode, Figma Slides; 3.000 AI credits/tháng + Figma Make (chỉ sinh viên ĐH/bootcamp).',
    cond: 'Sinh viên trong lớp học có cấu trúc (ĐH, CĐ, trường nghề, bootcamp), từ 13 tuổi. Xác minh: email trường + SheerID. Đổi email sau khi xác minh sẽ mất quyền.',
  },
  {
    name: 'Notion for Education',
    url: 'https://www.notion.com/education',
    get: 'Gói Plus miễn phí (workspace 1 người): trang/block không giới hạn, upload file không giới hạn, lịch sử trang 30 ngày, tối đa 100 khách. AI chỉ có bản dùng thử giới hạn.',
    cond: 'Bắt buộc email trường là email chính của tài khoản, trường phải nằm trong cơ sở dữ liệu WHED (hầu hết ĐH Việt Nam đều có). Không chấp nhận thẻ sinh viên hay giấy tờ thay thế. Xác minh lại mỗi năm.',
  },
  {
    name: 'Microsoft 365 Education',
    url: 'https://www.microsoft.com/en-us/education/products/office',
    get: 'Office 365 A1 miễn phí: Word, Excel, PowerPoint, OneNote, Outlook, Teams (bản web + mobile), OneDrive (dung lượng tùy trường). Trường mua A3/A5 thì sinh viên được cả bản cài desktop. Thêm ưu đãi giới hạn: 12 tháng Microsoft 365 Premium miễn phí cho sinh viên ĐH đăng ký bằng email trường.',
    cond: 'Phụ thuộc trường: trường phải đăng ký chương trình Microsoft Education thì email trường mới kích hoạt được. Nhập email trường tại trang đăng ký để kiểm tra ngay.',
  },
  {
    name: 'Spotify Student',
    url: 'https://www.spotify.com/vn-en/student/',
    get: 'Premium Student: nghe không quảng cáo, tải offline, chất lượng cao — 33.000₫/tháng (giá gốc 65.000₫), tối đa 4 năm.',
    cond: 'Từ 18 tuổi, đang học CĐ/ĐH được công nhận. Xác minh qua SheerID (trường phải có trong danh sách SheerID), xác minh lại mỗi 12 tháng. Không thanh toán bằng cước di động.',
  },
  {
    name: 'Autodesk Education',
    url: 'https://www.autodesk.com/asean/support/account/education/students-educators/overview',
    get: 'Miễn phí 1 năm, gia hạn hằng năm: AutoCAD, Revit, Fusion, Inventor, 3ds Max, Maya… bản đầy đủ (kể cả 3 phiên bản cũ). Phù hợp sinh viên kiến trúc, xây dựng, cơ khí.',
    cond: 'Sinh viên/giảng viên tại trường đủ điều kiện. Xác minh qua SheerID bằng giấy tờ (thư xác nhận của trường, biên lai học phí, thẻ sinh viên có ngày) — email trường không đủ và cũng không bắt buộc. Cấm dùng thương mại; file xuất có watermark "PRODUCED BY AN AUTODESK STUDENT VERSION".',
  },
];

// ---------------------------------------------------------------------------
// Mẫu biểu & tài liệu (§2.3): 8 mẫu TỰ VIẾT, nội dung gốc tiếng Việt,
// không sao chép mẫu của ai. Mỗi mẫu là 1 trang con /sinh-vien/<slug>/
// đọc online + nút In (window.print qua [data-print] trong app.js).
// ---------------------------------------------------------------------------
export const TEMPLATES = [
  {
    slug: 'cv-sinh-vien-moi-ra-truong',
    title: 'CV sinh viên mới ra trường',
    desc: 'Cấu trúc CV 1 trang cho người chưa có kinh nghiệm: thông tin, mục tiêu, học vấn, kỹ năng, kinh nghiệm làm thêm, hoạt động — kèm gợi ý theo 3 nhóm ngành và ví dụ CV hoàn chỉnh.',
    body: `
<div class="print-hide">
<p>CV xin thực tập hay việc làm đầu tiên không cần dài — 1 trang, đủ 6 mục dưới đây, viết cụ thể bằng số thay vì chung chung. Chưa hình dung CV hoàn chỉnh trông như thế nào? Xem ví dụ CV đã điền đầy đủ ở bên dưới, rồi thay bằng thông tin của bạn.</p>
</div>
<div class="print-hide">
<h2>Cấu trúc CV 1 trang</h2>
<ol>
<li><strong>Thông tin liên hệ:</strong> họ tên, số điện thoại, email (địa chỉ nghiêm túc, dạng hoten@gmail.com), link LinkedIn/GitHub nếu có. Không cần ghi ngày sinh, quê quán, số CCCD.</li>
<li><strong>Mục tiêu nghề nghiệp:</strong> 2–3 dòng, ghi rõ vị trí muốn ứng tuyển + điều bạn mang lại. Ví dụ: "Ứng tuyển vị trí thực tập sinh kế toán. Muốn áp dụng kiến thức kế toán tài chính đã học vào công việc thực tế và học hỏi quy trình kế toán doanh nghiệp."</li>
<li><strong>Học vấn:</strong> trường, ngành, năm học, GPA (ghi nếu từ 3.0/4.0 trở lên). Đồ án tốt nghiệp ghi ngay dưới mục này: tên đề tài + kết quả đạt được.</li>
<li><strong>Kỹ năng:</strong> chia 2 nhóm — chuyên môn (ví dụ: Excel, phân tích số liệu, AutoCAD, Python…) và ngoại ngữ/tin học (kèm chứng chỉ nếu có). Chỉ ghi kỹ năng bạn thực sự dùng được.</li>
<li><strong>Kinh nghiệm làm thêm:</strong> ghi cả việc không đúng ngành nếu nó rèn kỹ năng liên quan — bán hàng rèn giao tiếp và thuyết phục, gia sư rèn trình bày và kiên nhẫn.</li>
<li><strong>Hoạt động:</strong> 2–4 mục, mỗi mục 1–2 dòng, ghi KẾT QUẢ bằng số. "Tổ chức chương trình chào tân sinh viên cho 300 sinh viên, huy động 5 nhà tài trợ" tốt hơn "Tham gia hoạt động Đoàn".</li>
</ol>
</div>
<h2>Ví dụ CV hoàn chỉnh</h2>
<p class="note">Ví dụ minh họa — thông tin trong CV này là hư cấu, chỉ để bạn thấy một CV hoàn chỉnh trông như thế nào. Thay toàn bộ bằng thông tin thật của bạn trước khi gửi.</p>
<div class="sv-letter sv-cv">
<p class="sv-cv-name"><strong>NGUYỄN THU HÀ</strong></p>
<p class="sv-cv-contact">090 123 45 67 · thuha.nguyen@gmail.com · TP. Hồ Chí Minh<br>linkedin.com/in/nguyenthuha-marketing</p>
<h3>Mục tiêu nghề nghiệp</h3>
<p>Ứng tuyển vị trí Thực tập sinh Marketing. Muốn vận dụng kinh nghiệm quản lý fanpage và viết nội dung đã làm thêm 1 năm để hỗ trợ đội Marketing, đồng thời học quy trình làm nội dung và đo lường hiệu quả chiến dịch.</p>
<h3>Học vấn</h3>
<p><strong>Cử nhân Marketing — Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH)</strong> · 2022–2026 · GPA 3.4/4.0<br>Đồ án tốt nghiệp: kế hoạch truyền thông ra mắt sản phẩm cho một thương hiệu trà sữa địa phương — đạt 9.0/10.</p>
<h3>Kỹ năng</h3>
<ul>
<li>Viết nội dung, quản lý fanpage Facebook và TikTok — thành thạo; Canva, CapCut — khá.</li>
<li>Google Sheets (hàm cơ bản, PivotTable), MOS Excel (Microsoft 365).</li>
<li>Tiếng Anh: TOEIC 750 (2025).</li>
</ul>
<h3>Kinh nghiệm làm thêm</h3>
<p><strong>Cộng tác viên nội dung — Cửa hàng thời trang tại TP. Hồ Chí Minh</strong> · 06/2025–nay</p>
<ul>
<li>Viết 3 bài/tuần cho fanpage 12.000 người theo dõi; 1 video TikTok đạt 150.000 lượt xem.</li>
<li>Doanh số bán online tăng 20% trong 3 tháng làm việc.</li>
</ul>
<p><strong>Nhân viên bán hàng bán thời gian — Cửa hàng tiện lợi</strong> · 2024</p>
<ul>
<li>Phục vụ khoảng 100 khách/ngày, thu ngân và kiểm kho cuối ca.</li>
</ul>
<h3>Hoạt động</h3>
<ul>
<li>Thành viên CLB Marketing UEH (2023–2025): tổ chức workshop "Viết content cho người mới" cho 200 sinh viên.</li>
<li>Trưởng ban truyền thông Ngày hội việc làm 2025: fanpage sự kiện tăng 3.000 lượt thích trong 1 tháng.</li>
</ul>
</div>
<div class="print-hide">
<h2>Gợi ý theo ngành</h2>
<ul>
<li><strong>Kinh tế – quản trị:</strong> nhấn mạnh Excel (hàm, PivotTable), phân tích số liệu, kinh nghiệm thực tập/bán hàng, chứng chỉ MOS/tiếng Anh.</li>
<li><strong>Kỹ thuật:</strong> đồ án môn học, phần mềm chuyên ngành (AutoCAD, SolidWorks, MATLAB…), thực tập nhà máy/xưởng, khả năng đọc bản vẽ.</li>
<li><strong>CNTT:</strong> link GitHub + dự án cá nhân (ghi rõ công nghệ đã dùng, link demo nếu có), ngôn ngữ thành thạo, tham gia hackathon/câu lạc bộ lập trình.</li>
</ul>
</div>
<div class="print-hide">
<h2>Lưu ý trước khi gửi</h2>
<ul>
<li>Đừng mở đầu bằng "chưa có kinh nghiệm" — nhà tuyển dụng đọc CV để thấy bạn làm được gì, không phải để thấy bạn thiếu gì.</li>
<li>Dùng động từ: đạt, tổ chức, xây dựng, thiết kế, tiết kiệm… thay vì "tham gia", "được giao".</li>
<li>Viết riêng cho từng vị trí: lấy từ khóa trong tin tuyển dụng (tên kỹ năng, công cụ) đưa vào mục kỹ năng và kinh nghiệm một cách tự nhiên — nhiều công ty dùng phần mềm ATS lọc hồ sơ trước khi người đọc.</li>
<li>Trình bày đơn giản để ATS đọc được: 1 cột, không dùng bảng lồng nhau, text box, ảnh nền hay thanh kỹ năng phần trăm. Ghi mức độ bằng chữ (Thành thạo / Khá / Cơ bản).</li>
<li>Kiểm tra chính tả 2 lần, nhờ 1 người khác đọc lại trước khi gửi.</li>
<li>Lưu file PDF, đặt tên "CV-Ho-va-ten-Vi-tri-ung-tuyen.pdf".</li>
<li>Gửi kèm email ngắn giới thiệu bản thân, đừng gửi CV trống không.</li>
</ul>
</div>`,
  },
  {
    slug: 'don-xin-thuc-tap',
    title: 'Đơn xin thực tập',
    desc: 'Mẫu đơn xin thực tập đầy đủ + hướng dẫn ghi từng mục: thông tin công ty, thời gian, cam kết.',
    body: `
<p>Đơn xin thực tập dùng khi công ty yêu cầu nộp đơn giấy, hoặc khi bạn chủ động liên hệ một công ty chưa đăng tuyển thực tập sinh. Thay các phần trong [ngoặc vuông] bằng thông tin của bạn.</p>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN THỰC TẬP</strong></p>
<p>Kính gửi: Ban Giám đốc Công ty [Tên công ty] / Phòng Nhân sự</p>
<p>Tôi tên là: [Họ và tên] — Ngày sinh: [ngày/tháng/năm]<br>
Sinh viên năm [thứ mấy], ngành [tên ngành], khoa [tên khoa], Trường [tên trường]<br>
Mã số sinh viên: [MSSV] — Điện thoại: [SĐT] — Email: [email]</p>
<p>Nay tôi viết đơn này kính mong Quý công ty cho phép tôi được thực tập tại [phòng/bộ phận, nếu biết] trong thời gian từ ngày [dd/mm/yyyy] đến ngày [dd/mm/yyyy] ([số] tuần).</p>
<p>Lý do tôi chọn thực tập tại Quý công ty: [1–2 câu — nêu điều cụ thể ở công ty khiến bạn muốn vào: lĩnh vực, dự án, môi trường… đừng viết chung chung "công ty uy tín"].</p>
<p>Trong thời gian thực tập, tôi xin cam kết chấp hành nghiêm nội quy của công ty, bảo mật thông tin và hoàn thành các công việc được giao.</p>
<p>Tôi xin chân thành cảm ơn và mong nhận được sự chấp thuận của Quý công ty.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Hướng dẫn gửi đơn</h2>
<ul>
<li><strong>Gửi kèm:</strong> CV + giấy giới thiệu thực tập của trường (nếu trường cấp).</li>
<li><strong>Thời điểm:</strong> gửi trước ngày muốn bắt đầu 2–4 tuần — công ty cần thời gian xét và sắp xếp người hướng dẫn.</li>
<li>Nếu công ty có mẫu đơn riêng hoặc form đăng ký online, dùng mẫu của họ thay vì mẫu này.</li>
<li>Sau 1 tuần chưa có phản hồi, có thể gọi điện hoặc gửi email hỏi lại lịch sự 1 lần — đừng nhắn dồn nhiều lần.</li>
</ul>`,
  },
  {
    slug: 'bao-cao-thuc-tap',
    title: 'Báo cáo thực tập',
    desc: 'Khung mục lục chuẩn, mẫu bìa, cách trình bày số liệu và những lỗi thường gặp — kèm ví dụ đã điền: bảng nhật ký tuần, lời cảm ơn và đoạn mở đầu chương mẫu.',
    body: `
<p>Báo cáo thực tập thường dài 30–60 trang tùy quy định của trường. Khung dưới đây dùng được cho hầu hết các ngành — điều chỉnh tên chương theo yêu cầu của khoa bạn. Chưa hình dung báo cáo đã viết trông như thế nào? Xem ví dụ đã điền ở bên dưới — bảng nhật ký tuần, lời cảm ơn và đoạn mở đầu chương mẫu.</p>
<h2>Mẫu bìa</h2>
<div class="sv-letter">
<p class="sv-letter-center">TRƯỜNG ĐẠI HỌC [tên trường]<br>KHOA [tên khoa]</p>
<p class="sv-letter-center"><strong>BÁO CÁO THỰC TẬP</strong><br>Đề tài: [tên đề tài]<br>Đơn vị thực tập: [tên công ty]</p>
<p>Sinh viên thực hiện: [họ tên] — MSSV: [MSSV] — Lớp: [lớp]<br>
Giảng viên hướng dẫn: [họ tên, học hàm/học vị]</p>
<p class="sv-letter-center">[Địa điểm], tháng [mm] năm [yyyy]</p>
</div>
<h2>Khung mục lục chuẩn</h2>
<ol>
<li><strong>Lời cảm ơn</strong> — cảm ơn giảng viên hướng dẫn, đơn vị thực tập và người hướng dẫn trực tiếp. Ngắn gọn, chân thành.</li>
<li><strong>Chương 1: Mở đầu</strong> — lý do chọn đơn vị thực tập; mục tiêu; phạm vi và phương pháp thực hiện.</li>
<li><strong>Chương 2: Giới thiệu đơn vị thực tập</strong> — lịch sử hình thành, lĩnh vực hoạt động, cơ cấu tổ chức, quy mô. Chỉ ghi thông tin công khai hoặc đã được phép chia sẻ.</li>
<li><strong>Chương 3: Công việc thực hiện</strong> — mô tả theo tuần bằng bảng: tuần – công việc – kết quả. Nêu rõ việc gì bạn tự làm, việc gì làm cùng người khác.</li>
<li><strong>Chương 4: Bài học và đề xuất</strong> — bài học rút ra, kiến thức đã áp dụng được, đề xuất cải tiến cho đơn vị nếu có.</li>
<li><strong>Kết luận</strong> — tóm tắt 1 trang: đạt được gì, còn hạn chế gì.</li>
<li><strong>Tài liệu tham khảo</strong> — chỉ liệt kê tài liệu đã dùng thật.</li>
<li><strong>Phụ lục</strong> — hình ảnh, biểu mẫu, giấy xác nhận thực tập.</li>
</ol>
<h2>Ví dụ đã điền — nhật ký tuần, lời cảm ơn và mở đầu chương</h2>
<p class="note">Ví dụ minh họa — thông tin dưới đây là hư cấu: một sinh viên ngành Marketing thực tập 8 tuần tại một công ty thương mại. Dùng để tham khảo cách trình bày, thay bằng công việc thật của bạn.</p>
<h3>Bảng nhật ký tuần mẫu</h3>
<div class="sv-letter">
<table class="tbl">
<tr><th>Tuần</th><th>Công việc</th><th>Kết quả</th></tr>
<tr><td>Tuần 1<br>(02–06/6)</td><td>Làm quen quy trình làm việc của phòng Marketing; đọc tài liệu giới thiệu 12 dòng sản phẩm chính; học cách dùng phần mềm quản lý fanpage.</td><td>Nắm được danh mục sản phẩm; viết thử 2 bài đăng, cả 2 đều được người hướng dẫn duyệt.</td></tr>
<tr><td>Tuần 2<br>(09–13/6)</td><td>Viết 6 bài đăng cho fanpage; chụp ảnh sản phẩm cùng nhân viên marketing; trả lời bình luận của khách hàng.</td><td>5/6 bài được đăng; bài cao nhất đạt 8.000 lượt tiếp cận; trả lời 40 bình luận trong tuần.</td></tr>
<tr><td>Tuần 3<br>(16–20/6)</td><td>Tổng hợp bình luận và tin nhắn của khách hàng trong tháng; lập bảng thống kê 120 phản hồi theo nhóm nội dung.</td><td>Báo cáo 3 nhóm góp ý phổ biến nhất; đề xuất 2 ý cải thiện nội dung, 1 ý được phòng áp dụng ngay.</td></tr>
</table>
</div>
<h3>Lời cảm ơn mẫu</h3>
<div class="sv-letter">
<p>Em xin chân thành cảm ơn thầy Nguyễn Văn Hùng, giảng viên hướng dẫn, đã góp ý từng chương và nhắc em ghi lại công việc hằng tuần ngay từ khi bắt đầu thực tập. Em cảm ơn chị Trần Thu Trang, chuyên viên Marketing của công ty, đã dành thời gian hướng dẫn em từng việc nhỏ — từ cách viết một bài đăng đến cách trả lời khách hàng. Em cũng cảm ơn phòng Marketing đã cho em tham gia vào công việc thật thay vì chỉ quan sát. Những góp ý của thầy, chị và các anh chị trong phòng là điều em học được nhiều nhất trong 8 tuần thực tập.</p>
</div>
<h3>Mở đầu chương "Giới thiệu về công ty thực tập" — mẫu</h3>
<div class="sv-letter">
<p>Công ty TNHH Thương mại An Phát thành lập năm 2018 tại TP. Hồ Chí Minh, kinh doanh đồ gia dụng và đồ dùng nhà bếp. Công ty có 45 nhân viên và 3 cửa hàng tại TP. Hồ Chí Minh, doanh thu chủ yếu đến từ bán lẻ tại cửa hàng và bán hàng qua fanpage. Phòng Marketing — nơi em thực tập — có 6 người, phụ trách nội dung fanpage, quảng cáo và chăm sóc khách hàng. Chương này giới thiệu khái quát về công ty và phòng Marketing để làm bối cảnh cho các công việc em đã thực hiện trong 8 tuần.</p>
</div>
<h2>Cách trình bày số liệu</h2>
<ul>
<li>Mỗi bảng/hình đều có số thứ tự + tiêu đề + nguồn. Ví dụ: "Bảng 3.1. Doanh thu quý 1/2026 — Nguồn: Phòng Kế toán, Công ty X".</li>
<li>Không đưa số liệu mật của công ty khi chưa được phép — hỏi người hướng dẫn trước khi ghi.</li>
<li>Số liệu trong bảng phải khớp với số liệu nhắc trong văn bản.</li>
</ul>
<h2>Lỗi thường gặp</h2>
<ul>
<li>Sao chép báo cáo của khóa trước — trường kiểm tra đạo văn, bị phát hiện là trượt.</li>
<li>Mô tả chung chung ("được học hỏi nhiều") mà không có việc cụ thể, số liệu cụ thể.</li>
<li>Không ghi nguồn số liệu; hình ảnh lấy từ mạng không ghi nguồn.</li>
<li>Để dồn viết vào tuần cuối — nên ghi nhật ký thực tập hằng tuần, viết dần theo đó.</li>
</ul>
<p class="note">Quy định trình bày (font, cỡ chữ, giãn dòng, lề) theo quy định riêng của từng trường — mẫu này chỉ gợi ý nội dung. Phổ biến nhất: font Times New Roman, cỡ 13–14, giãn dòng 1.5, đánh số trang ở giữa hoặc góc phải phía dưới.</p>`,
  },
  {
    slug: 'tieu-luan-bai-tap-lon',
    title: 'Tiểu luận / bài tập lớn',
    desc: 'Cấu trúc bài, cách trích dẫn APA cơ bản, làm mục lục tự động và tránh đạo văn.',
    body: `
<p>Tiểu luận tốt không nằm ở độ dài mà ở mạch lập luận rõ: mở đầu đặt vấn đề, thân bài triển khai từng luận điểm có bằng chứng, kết luận trả lời đúng mục tiêu đã đặt.</p>
<h2>Cấu trúc bài</h2>
<ol>
<li><strong>Trang bìa</strong> — tên trường, khoa, tên học phần, tên đề tài, tên sinh viên, MSSV, lớp, giảng viên, năm học.</li>
<li><strong>Mục lục</strong> — làm tự động (xem bên dưới), đừng gõ tay.</li>
<li><strong>Mở đầu</strong> — đặt vấn đề: vì sao đề tài này đáng làm; mục tiêu; phạm vi; phương pháp. Khoảng 1 trang.</li>
<li><strong>Thân bài</strong> — chia 2–3 chương theo luận điểm. Mỗi chương mở đầu bằng câu chủ đề, kết thúc bằng câu kết nối sang chương sau.</li>
<li><strong>Kết luận</strong> — trả lời lại mục tiêu đã đặt ở mở đầu, nêu hạn chế và hướng mở rộng. Không đưa ý mới ở kết luận.</li>
<li><strong>Danh mục tài liệu tham khảo</strong> — chỉ liệt kê tài liệu đã trích dẫn thật trong bài.</li>
</ol>
<h2>Trích dẫn APA cơ bản</h2>
<ul>
<li><strong>Trong văn bản:</strong> (Nguyễn Văn A, 2023) — hoặc: Nguyễn Văn A (2023) cho rằng…</li>
<li><strong>Trích nguyên văn dưới 40 từ:</strong> đặt trong dấu ngoặc kép + ghi số trang: (Nguyễn Văn A, 2023, tr. 45).</li>
<li><strong>Sách (danh mục tham khảo):</strong> Nguyễn Văn A. (2023). <em>Tên sách</em>. Nhà xuất bản.</li>
<li><strong>Bài báo:</strong> Trần Thị B. (2024). Tên bài báo. <em>Tên tạp chí, 12</em>(3), 45–60.</li>
<li><strong>Trang web:</strong> Tác giả. (Năm). Tiêu đề trang. Tên trang web. URL</li>
</ul>
<h2>Làm mục lục tự động trong Word</h2>
<ol>
<li>Đánh dấu tiêu đề bằng Heading 1/Heading 2 (thẻ Home → Styles).</li>
<li>Đặt con trỏ ở trang mục lục → References → Table of Contents → chọn kiểu.</li>
<li>Khi sửa bài, bấm chuột phải vào mục lục → Update Field → Update entire table.</li>
</ol>
<h2>Tránh đạo văn</h2>
<ul>
<li>Diễn đạt lại bằng lời của mình rồi vẫn ghi nguồn — đổi vài từ rồi không ghi nguồn vẫn là đạo văn.</li>
<li>Trích nguyên văn thì để trong ngoặc kép + ghi số trang.</li>
<li>Không dùng bài của người khác, không mua bài — trường kiểm tra bằng phần mềm và có thể hủy kết quả học phần.</li>
<li>Ghi nguồn ngay lúc đọc tài liệu, đừng để cuối bài mới nhớ lại.</li>
</ul>`,
  },
  {
    slug: 'checklist-nhap-hoc-nam-nhat',
    title: 'Danh sách việc cần làm khi nhập học năm nhất',
    desc: 'Giấy tờ cần mang, thủ tục nhập học, đồ dùng ký túc xá/trọ — kiểm tra từng mục trước ngày lên trường.',
    body: `
<p>Chuẩn bị trước 1 tuần, đừng để tới ngày nhập học mới lo giấy tờ. Đánh dấu từng mục khi đã xong.</p>
<h2>Giấy tờ cần mang</h2>
<ul>
<li>Giấy báo trúng tuyển (bản gốc + 2 bản photo).</li>
<li>CCCD (bản gốc + 2 bản photo công chứng).</li>
<li>Học bạ THPT (bản sao có công chứng).</li>
<li>Giấy chứng nhận tốt nghiệp THPT tạm thời (hoặc bằng tốt nghiệp nếu đã có).</li>
<li>Giấy khai sinh (bản sao).</li>
<li>Ảnh thẻ 3×4 (4–6 tấm, nền trắng hoặc xanh theo yêu cầu của trường).</li>
<li>Giấy xác nhận thông tin cư trú (hoặc thông tin cư trú trên VNeID) nếu trường yêu cầu.</li>
<li>Giấy chuyển sinh hoạt Đoàn (nếu là đoàn viên).</li>
<li>Giấy khám sức khỏe (nếu trường yêu cầu).</li>
<li>Hồ sơ ưu tiên (con thương binh, hộ nghèo…) nếu thuộc diện.</li>
</ul>
<h2>Thủ tục nhập học</h2>
<ol>
<li>Nộp hồ sơ đúng hạn ghi trong giấy báo — trễ hạn có thể mất suất.</li>
<li>Đóng học phí học kỳ 1, giữ lại biên lai.</li>
<li>Đăng ký ký túc xá sớm nếu muốn ở — KTX thường hết chỗ nhanh.</li>
<li>Làm thẻ sinh viên theo lịch của trường.</li>
<li>Đăng ký tạm trú tại công an phường nơi ở trọ (chủ trọ thường làm giúp — hỏi rõ).</li>
<li>Mở tài khoản ngân hàng (trường thường chỉ định ngân hàng để nhận học bổng, trợ cấp).</li>
<li>Mua bảo hiểm y tế — bắt buộc với sinh viên, trường thu cùng học phí hoặc hướng dẫn mua riêng.</li>
<li>Đăng ký môn học học kỳ 1 theo lịch của khoa.</li>
</ol>
<h2>Đồ dùng ký túc xá/trọ</h2>
<ul>
<li>Chăn, gối, chiếu; đồ vệ sinh cá nhân.</li>
<li>Ổ cắm điện, đèn bàn; móc treo, giá phơi.</li>
<li>Nồi cơm mini, ấm đun (kiểm tra KTX có cho dùng không).</li>
<li>Thuốc cơ bản: cảm, đau bụng, dầu gió.</li>
<li>Khóa cửa/khóa tủ chắc chắn.</li>
</ul>
<h2>Lưu ý</h2>
<ul>
<li>Photo + scan sẵn mọi giấy tờ quan trọng, lưu 1 bản trên điện thoại/Drive.</li>
<li>Cảnh giác các lời mời "việc làm thêm lương cao, không cần kinh nghiệm" hay bán hàng đa cấp quanh trường.</li>
<li>Không đưa CCCD/thẻ sinh viên cho người lạ giữ.</li>
<li>Ghi lại số điện thoại của cố vấn học tập và phòng công tác sinh viên.</li>
</ul>`,
  },
  {
    slug: 'bang-chi-tieu-sinh-vien',
    title: 'Bảng chi tiêu sinh viên',
    desc: 'Bảng mẫu theo dõi thu/chi tháng + gợi ý ngân sách 3 mức: 3, 4 và 5 triệu đồng/tháng.',
    body: `
<p>Ghi chép 5 phút mỗi tối giúp bạn biết tiền đi đâu — đa số sinh viên hụt tiền cuối tháng không phải vì thiếu tiền mà vì không biết mình đã tiêu vào đâu.</p>
<h2>Bảng mẫu thu – chi tháng</h2>
<table class="tbl">
<tr><th>Hạng mục</th><th>Dự kiến</th><th>Thực tế</th><th>Chênh lệch</th></tr>
<tr><td colspan="4"><strong>THU</strong></td></tr>
<tr><td>Tiền gia đình gửi</td><td></td><td></td><td></td></tr>
<tr><td>Học bổng/trợ cấp</td><td></td><td></td><td></td></tr>
<tr><td>Làm thêm</td><td></td><td></td><td></td></tr>
<tr><td><strong>Tổng thu</strong></td><td></td><td></td><td></td></tr>
<tr><td colspan="4"><strong>CHI CỐ ĐỊNH</strong></td></tr>
<tr><td>Tiền nhà/trọ</td><td></td><td></td><td></td></tr>
<tr><td>Điện</td><td></td><td></td><td></td></tr>
<tr><td>Nước</td><td></td><td></td><td></td></tr>
<tr><td>Wifi/4G</td><td></td><td></td><td></td></tr>
<tr><td>Học phí (chia theo tháng)</td><td></td><td></td><td></td></tr>
<tr><td colspan="4"><strong>CHI ĂN UỐNG &amp; ĐI LẠI</strong></td></tr>
<tr><td>Ăn sáng/trưa/tối</td><td></td><td></td><td></td></tr>
<tr><td>Ăn vặt, cà phê</td><td></td><td></td><td></td></tr>
<tr><td>Xăng xe/xe bus</td><td></td><td></td><td></td></tr>
<tr><td colspan="4"><strong>CHI KHÁC</strong></td></tr>
<tr><td>Sách, photo, in ấn</td><td></td><td></td><td></td></tr>
<tr><td>Quần áo, đồ vệ sinh</td><td></td><td></td><td></td></tr>
<tr><td>Giải trí (xem phim, đi chơi)</td><td></td><td></td><td></td></tr>
<tr><td>Quỹ dự phòng (nên để 5–10%)</td><td></td><td></td><td></td></tr>
<tr><td><strong>Tổng chi</strong></td><td></td><td></td><td></td></tr>
<tr><td><strong>Còn lại</strong></td><td></td><td></td><td></td></tr>
</table>
<h2>Gợi ý ngân sách theo 3 mức (ví dụ tham khảo)</h2>
<table class="tbl">
<tr><th>Hạng mục</th><th>3 triệu (tiết kiệm)</th><th>4 triệu (vừa)</th><th>5 triệu (thoải mái)</th></tr>
<tr><td>Nhà trọ (ở ghép)</td><td>800.000₫</td><td>1.200.000₫</td><td>1.500.000₫</td></tr>
<tr><td>Điện + nước + wifi</td><td>250.000₫</td><td>350.000₫</td><td>450.000₫</td></tr>
<tr><td>Ăn uống (tự nấu nhiều)</td><td>1.200.000₫</td><td>1.500.000₫</td><td>1.800.000₫</td></tr>
<tr><td>Đi lại</td><td>200.000₫</td><td>300.000₫</td><td>400.000₫</td></tr>
<tr><td>Học tập</td><td>150.000₫</td><td>200.000₫</td><td>300.000₫</td></tr>
<tr><td>Cá nhân + giải trí</td><td>250.000₫</td><td>300.000₫</td><td>400.000₫</td></tr>
<tr><td>Dự phòng</td><td>150.000₫</td><td>150.000₫</td><td>150.000₫</td></tr>
</table>
<p class="muted small">Mức trên chưa gồm học phí (thường đóng theo học kỳ, không phải hằng tháng) và áp dụng cho sinh viên ở trọ tại thành phố lớn. Tự nấu ăn 4–5 bữa/tuần là cách tiết kiệm hiệu quả nhất — ăn ngoài mỗi ngày tốn gấp đôi.</p>
<h2>Mẹo giữ ngân sách</h2>
<ul>
<li>Rút tiền mặt theo tuần thay vì giữ cả tháng trong ví.</li>
<li>Mua đồ cũ (sách, xe đạp, đồ điện) từ sinh viên khóa trên.</li>
<li>Ghi chép mỗi ngày — dùng công cụ <a href="/cong-cu/ghi-chep-tai-chinh/">Sổ thu chi nhanh</a> trên Tiện Ích Hub để dán ghi chép và xem tổng.</li>
<li>Để riêng khoản dự phòng ngay khi nhận tiền, đừng đợi cuối tháng còn bao nhiêu mới để dành.</li>
</ul>`,
  },
  {
    slug: 'don-xin-hoc-bong',
    title: 'Đơn xin học bổng',
    desc: 'Mẫu đơn + cách viết thư động lực ngắn + danh sách giấy tờ thường kèm theo — kèm ví dụ đã điền: đoạn thành tích, đoạn hoàn cảnh và thư động lực mẫu.',
    body: `
<p>Học bổng xét 2 thứ: thành tích (điểm số, hoạt động) và lý do (vì sao bạn xứng đáng). Đơn viết rõ 2 thứ đó, ngắn gọn, thật — đừng kể khổ quá mức, cũng đừng khoe quá mức.</p>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN XÉT HỌC BỔNG [tên học bổng]</strong></p>
<p>Kính gửi: [Hội đồng xét học bổng / Phòng Công tác sinh viên, Trường …]</p>
<p>Tôi tên là: [Họ và tên] — Ngày sinh: [ngày/tháng/năm]<br>
Sinh viên lớp [lớp], ngành [ngành], khoa [khoa], Trường [tên trường]<br>
Mã số sinh viên: [MSSV] — Điện thoại: [SĐT] — Email: [email]<br>
Điểm trung bình học kỳ [kỳ/năm học]: [điểm hệ 10 / hệ 4] — Điểm rèn luyện: [điểm/xếp loại]</p>
<p>Nay tôi viết đơn này kính mong Hội đồng xét cho tôi được nhận học bổng [tên học bổng] học kỳ [kỳ] năm học [năm].</p>
<p>[1 đoạn ngắn — thành tích nổi bật: điểm số, nghiên cứu, hoạt động, giải thưởng — ghi cụ thể bằng số.]</p>
<p>[1 đoạn ngắn — hoàn cảnh (nếu học bổng xét hoàn cảnh) hoặc kế hoạch học tập nếu nhận được học bổng.]</p>
<p>Tôi xin cam đoan những thông tin trên là đúng sự thật và xin chịu trách nhiệm trước Hội đồng.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Cách viết thư động lực ngắn (kèm theo đơn, nếu học bổng yêu cầu)</h2>
<ul>
<li><strong>Đoạn 1 — Giới thiệu:</strong> bạn là ai, đang học gì, xin học bổng nào (3–4 câu).</li>
<li><strong>Đoạn 2 — Vì sao bạn xứng đáng:</strong> 2–3 thành tích cụ thể nhất, gắn với tiêu chí của học bổng.</li>
<li><strong>Đoạn 3 — Kế hoạch:</strong> bạn sẽ dùng học bổng để làm gì (học tiếp, nghiên cứu, thi chứng chỉ…) và cam kết duy trì thành tích.</li>
</ul>
<p>Độ dài: nửa trang đến 1 trang. Viết bằng giọng của chính bạn — hội đồng đọc hàng trăm thư, thư sao chép mẫu trên mạng rất dễ nhận ra.</p>
<h2>Ví dụ đã điền — đoạn thành tích, đoạn hoàn cảnh và thư động lực mẫu</h2>
<p class="note">Ví dụ minh họa — thông tin dưới đây là hư cấu: một sinh viên năm 3 ngành Kế toán xin học bổng khuyến khích học tập. Dùng để tham khảo cách viết, thay bằng thành tích và hoàn cảnh thật của bạn.</p>
<h3>Đoạn thành tích mẫu (điền vào đơn)</h3>
<div class="sv-letter">
<p>Trong 2 học kỳ gần nhất, điểm trung bình của tôi đạt 3.6/4.0, thuộc nhóm 10 sinh viên có điểm cao nhất lớp 60 người. Tôi đã nhận học bổng khuyến khích học tập của trường 2 học kỳ liên tiếp, đạt giải Ba cuộc thi "Sinh viên với ý tưởng kinh doanh" cấp trường năm 2025 với đề án kế toán chi phí cho cửa hàng nhỏ, và làm trưởng nhóm dự án thực hành môn Kế toán quản trị — nhóm tôi đạt 9.2/10, cao nhất trong 8 nhóm. Ngoài ra tôi là thành viên Ban chấp hành Đoàn khoa, tổ chức 2 buổi hướng dẫn sinh viên năm nhất làm quen với phần mềm kế toán, mỗi buổi có khoảng 80 sinh viên tham gia.</p>
</div>
<h3>Đoạn hoàn cảnh và kế hoạch mẫu (điền vào đơn)</h3>
<div class="sv-letter">
<p>Gia đình tôi ở quê, thu nhập chính từ 2 sào ruộng và việc làm thuê thời vụ của bố mẹ. Tôi vừa học vừa làm thêm 3 buổi/tuần tại một cửa hàng văn phòng phẩm để trang trải tiền trọ và sinh hoạt, nhưng vẫn giữ điểm trung bình trên 3.5. Nếu nhận được học bổng, tôi sẽ giảm giờ làm thêm để dành thời gian ôn thi chứng chỉ MOS Excel và chuẩn bị đồ án tốt nghiệp vào học kỳ tới. Tôi cam kết duy trì kết quả học tập và tham gia đầy đủ các hoạt động của khoa.</p>
</div>
<h3>Thư động lực mẫu (3 đoạn theo khung trên)</h3>
<div class="sv-letter">
<p>Em là Phạm Minh Anh, sinh viên năm 3 ngành Kế toán, khoa Kế toán – Kiểm toán, Trường Đại học Tài chính – Marketing. Em viết thư này để xin học bổng khuyến khích học tập học kỳ 2, năm học 2025–2026 — học bổng dành cho sinh viên có kết quả học tập và rèn luyện tốt.</p>
<p>Trong 2 học kỳ gần nhất, điểm trung bình của em đạt 3.6/4.0, và em đã nhận học bổng khuyến khích học tập 2 học kỳ liên tiếp. Điều em tự hào nhất là giải Ba cuộc thi "Sinh viên với ý tưởng kinh doanh" cấp trường năm 2025: đề án của em đưa ra cách theo dõi chi phí đơn giản cho cửa hàng nhỏ, dùng bảng tính mà chủ cửa hàng tự làm được, không cần phần mềm đắt tiền. Ngoài giờ học, em tổ chức 2 buổi hướng dẫn sinh viên năm nhất làm quen với phần mềm kế toán — mỗi buổi khoảng 80 bạn tham gia — vì em nhớ mình năm nhất đã lúng túng thế nào khi lần đầu mở phần mềm.</p>
<p>Nếu nhận được học bổng, em sẽ giảm giờ làm thêm để ôn thi chứng chỉ MOS Excel và chuẩn bị đồ án tốt nghiệp vào học kỳ tới. Em cũng muốn tiếp tục hướng dẫn sinh viên năm nhất, vì đó là cách em trả lại những gì mình đã nhận được từ thầy cô và anh chị khóa trên. Em xin chân thành cảm ơn Hội đồng đã xét hồ sơ của em.</p>
<p class="sv-letter-right">TP. Hồ Chí Minh, ngày 15 tháng 9 năm 2026<br>Phạm Minh Anh</p>
</div>
<h2>Giấy tờ thường kèm theo</h2>
<ul>
<li>Bảng điểm có xác nhận của trường.</li>
<li>Giấy xác nhận hoàn cảnh gia đình (nếu học bổng xét hoàn cảnh khó khăn).</li>
<li>Chứng chỉ ngoại ngữ, tin học (bản sao).</li>
<li>Giấy chứng nhận hoạt động, giải thưởng (bản sao).</li>
<li>Thư giới thiệu của giảng viên (nếu học bổng yêu cầu).</li>
<li>CV ngắn (1 trang).</li>
</ul>
<h2>Lưu ý</h2>
<ul>
<li>Đọc kỹ tiêu chí + hạn nộp của từng học bổng — mỗi học bổng xét khác nhau.</li>
<li>Nộp sớm 2–3 ngày, giữ lại biên nhận và bản photo hồ sơ.</li>
</ul>`,
  },
  {
    slug: 'don-xin-nghi-hoc-bao-luu',
    title: 'Đơn xin nghỉ học / bảo lưu kết quả',
    desc: 'Mẫu đơn xin nghỉ phép ngắn ngày, mẫu đơn xin bảo lưu học kỳ + quy trình nộp ở phòng đào tạo.',
    body: `
<p>Nghỉ học có 2 loại — nghỉ phép ngắn ngày (vài buổi, có lý do) và bảo lưu kết quả (tạm dừng cả học kỳ, thường vì sức khỏe, gia đình hoặc việc riêng). Mỗi loại một mẫu đơn, một quy trình.</p>
<h2>Mẫu đơn xin nghỉ phép (ngắn ngày)</h2>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN NGHỈ HỌC</strong></p>
<p>Kính gửi: [Thầy/Cô giảng viên môn … / Ban chủ nhiệm khoa …]</p>
<p>Tôi tên là: [Họ và tên] — Sinh viên lớp [lớp], ngành [ngành]<br>
Mã số sinh viên: [MSSV] — Điện thoại: [SĐT]</p>
<p>Nay tôi viết đơn này xin phép được nghỉ học môn [tên môn] vào ngày [ngày/tháng/năm] (buổi [sáng/chiều], tiết [..–..]) với lý do: [lý do cụ thể — ốm, việc gia đình…].</p>
<p>[Nếu có: Tôi xin gửi kèm giấy tờ chứng minh: giấy khám bệnh / giấy xác nhận …]</p>
<p>Tôi xin cam kết tự học bù phần kiến thức đã nghỉ và nộp bài đúng hạn.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Mẫu đơn xin bảo lưu kết quả học tập</h2>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN BẢO LƯU KẾT QUẢ HỌC TẬP</strong></p>
<p>Kính gửi: Ban Giám hiệu Trường [tên trường] / Phòng Đào tạo</p>
<p>Tôi tên là: [Họ và tên] — Ngày sinh: [ngày/tháng/năm]<br>
Sinh viên lớp [lớp], ngành [ngành], khoa [khoa] — Mã số sinh viên: [MSSV]</p>
<p>Nay tôi viết đơn này xin phép được bảo lưu kết quả học tập từ học kỳ [kỳ] năm học [năm] đến hết học kỳ [kỳ] năm học [năm] với lý do: [lý do cụ thể — sức khỏe, gia đình, việc riêng…].</p>
<p>[Nếu có: Tôi xin gửi kèm giấy tờ chứng minh: giấy xác nhận của bệnh viện / giấy tờ liên quan …]</p>
<p>Tôi xin cam kết quay lại học đúng thời hạn bảo lưu và chấp hành quy định của nhà trường.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Quy trình nộp (tham khảo chung — mỗi trường có thể khác đôi chút)</h2>
<ol>
<li>Viết đơn theo mẫu trên, kèm giấy tờ chứng minh lý do (nếu có).</li>
<li>Xin ý kiến/xác nhận của cố vấn học tập và ban chủ nhiệm khoa.</li>
<li>Nộp đơn tại phòng đào tạo (hoặc nộp online qua cổng sinh viên nếu trường có).</li>
<li>Nhận giấy hẹn/kết quả — giữ lại biên nhận.</li>
<li>Khi hết thời gian bảo lưu, làm đơn xin học lại trước khi học kỳ mới bắt đầu.</li>
</ol>
<h2>Lưu ý</h2>
<ul>
<li>Thời gian bảo lưu tối đa thường 1–2 học kỳ tùy quy chế đào tạo của trường — đọc quy chế trước khi viết đơn.</li>
<li>Nghỉ quá số buổi quy định (thường 20–30% số buổi của môn) có thể bị cấm thi — xin nghỉ phép không tự động miễn điểm danh, hỏi rõ giảng viên.</li>
<li>Bảo lưu không làm mất kết quả các môn đã học xong.</li>
<li>Trong thời gian bảo lưu, thẻ sinh viên/BHYT có thể tạm dừng theo quy định của trường — hỏi phòng đào tạo khi nộp đơn.</li>
</ul>`,
  },
  {
    slug: 'email-xin-viec-xin-thuc-tap',
    title: 'Email xin việc / xin thực tập',
    desc: 'Cấu trúc email 6 phần, 2 mẫu cho 2 tình huống (ứng tuyển tin có sẵn / gửi chủ động) + danh sách kiểm tra lỗi thường gặp.',
    body: `
<p>Email xin việc là ấn tượng đầu tiên của bạn với nhà tuyển dụng — nhiều email bị bỏ qua chỉ vì tiêu đề chung chung hoặc quên đính kèm CV. Mẫu dưới đây dùng cho cả xin thực tập và xin việc làm thêm.</p>
<h2>Cấu trúc email 6 phần</h2>
<ol>
<li><strong>Tiêu đề:</strong> <code>[Vị trí] – Họ tên – Trường</code>. Ví dụ: "[Thực tập sinh Marketing] – Nguyễn Văn A – ĐH Kinh tế TP.HCM". Tiêu đề rõ giúp email không bị nhầm là thư rác.</li>
<li><strong>Lời chào:</strong> "Kính gửi Phòng Nhân sự Công ty [tên công ty]," — nếu biết tên người nhận thì chào tên. Tránh "Gửi anh/chị" chung chung.</li>
<li><strong>Giới thiệu:</strong> bạn là ai — trường, ngành, năm mấy — và khung thời gian thực tập/làm việc từ–đến. 2–3 câu.</li>
<li><strong>Lý do chọn công ty + điểm mạnh:</strong> 1 đoạn ngắn — nêu điều cụ thể ở công ty khiến bạn muốn vào (lĩnh vực, dự án, sản phẩm) và 1–2 điểm mạnh liên quan (môn học, đồ án, kỹ năng). Đừng viết "công ty uy tín, môi trường chuyên nghiệp" chung chung.</li>
<li><strong>File đính kèm:</strong> liệt kê rõ: "Em xin gửi kèm CV và bảng điểm (file PDF đính kèm email này)."</li>
<li><strong>Chữ ký:</strong> họ tên, số điện thoại, email. Có thể thêm link LinkedIn/GitHub nếu có.</li>
</ol>
<h2>Tình huống 1: Ứng tuyển tin tuyển dụng có sẵn</h2>
<div class="sv-letter">
<p><strong>Tiêu đề:</strong> [Thực tập sinh Kế toán] – Trần Thị B – ĐH Tài chính – Marketing</p>
<p>Kính gửi Phòng Nhân sự Công ty [tên công ty],</p>
<p>Em là Trần Thị B, sinh viên năm 3 ngành Kế toán, Trường ĐH Tài chính – Marketing. Em viết email này để ứng tuyển vị trí Thực tập sinh Kế toán theo thông báo tuyển dụng trên [TopCV/website công ty] ngày [ngày/tháng]. Em có thể thực tập toàn thời gian từ [ngày] đến [ngày].</p>
<p>Em đã học xong các môn Kế toán tài chính, Kế toán quản trị và thành thạo Excel (hàm, PivotTable). Trong đồ án môn học, em đã lập bộ báo cáo tài chính mẫu cho một doanh nghiệp thương mại và đạt điểm 9. Em mong được áp dụng những kiến thức này vào công việc thực tế tại Quý công ty.</p>
<p>Em xin gửi kèm CV và bảng điểm (file PDF đính kèm email này). Em rất mong nhận được phản hồi từ Quý công ty.</p>
<p>Trân trọng,<br>Trần Thị B — SĐT: [số] — Email: [email]</p>
</div>
<h2>Tình huống 2: Gửi chủ động khi công ty chưa đăng tuyển</h2>
<div class="sv-letter">
<p><strong>Tiêu đề:</strong> [Xin thực tập – Thiết kế đồ họa] – Lê Văn C – ĐH Kiến trúc TP.HCM</p>
<p>Kính gửi Phòng Nhân sự Công ty [tên công ty],</p>
<p>Em là Lê Văn C, sinh viên năm 3 ngành Thiết kế đồ họa, Trường ĐH Kiến trúc TP.HCM. Em theo dõi các sản phẩm của Quý công ty đã lâu và rất ấn tượng với [bộ nhận diện/dự án cụ thể]. Em viết email này để hỏi về cơ hội thực tập tại phòng Thiết kế trong học kỳ tới (từ [tháng] đến [tháng]).</p>
<p>Em thành thạo Photoshop, Illustrator và Figma; đã thiết kế bộ poster cho 2 sự kiện của trường (xem trong portfolio đính kèm). Em sẵn sàng thực tập bán thời gian 3 buổi/tuần theo lịch học của em.</p>
<p>Em xin gửi kèm CV và portfolio (file PDF đính kèm email này). Dù Quý công ty chưa có vị trí trống, em vẫn rất mong nhận được phản hồi để em có thể chuẩn bị cho đợt tuyển sau.</p>
<p>Trân trọng,<br>Lê Văn C — SĐT: [số] — Email: [email]</p>
</div>
<h2>Danh sách kiểm tra lỗi thường gặp</h2>
<ul>
<li><strong>Quên đính kèm file</strong> — đính kèm CV trước khi viết nội dung email.</li>
<li><strong>Gửi CC cho nhiều công ty cùng lúc</strong> — mỗi công ty một email riêng, ghi tên công ty đúng.</li>
<li><strong>File Word lỗi font</strong> — xuất CV sang PDF trước khi gửi.</li>
<li><strong>Tên file lộn xộn</strong> — đặt tên dạng <code>CV_NguyenVanA_ThucTapMarketing.pdf</code>, đừng để "CV-final-v2-ok.pdf".</li>
<li><strong>Email không nghiêm túc</strong> — dùng địa chỉ dạng hoten@gmail.com, đừng dùng nickname.</li>
<li><strong>Gửi rồi không kiểm tra</strong> — đọc lại 1 lần trước khi bấm gửi: tên công ty, vị trí, ngày tháng có đúng không.</li>
<li><strong>Chờ 1 tuần chưa thấy trả lời</strong> — có thể gửi email nhắc lịch sự 1 lần, đừng nhắn dồn nhiều lần.</li>
</ul>`,
  },
  {
    slug: 'don-phuc-khao-diem-thi',
    title: 'Đơn phúc khảo điểm thi',
    desc: 'Mẫu đơn phúc khảo điểm thi + lưu ý quan trọng: thời hạn ngắn, trường có thể có mẫu riêng, có thể mất lệ phí.',
    body: `
<p>Phúc khảo là yêu cầu chấm lại bài thi khi bạn thấy điểm công bố không đúng với bài làm của mình. Thời hạn phúc khảo rất ngắn — thường chỉ 5–7 ngày sau khi công bố điểm — nên viết đơn ngay khi phát hiện, đừng chần chừ.</p>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN PHÚC KHẢO ĐIỂM THI</strong></p>
<p>Kính gửi: [Phòng Đào tạo / Phòng Khảo thí, Trường …]</p>
<p>Tôi tên là: [Họ và tên] — Ngày sinh: [ngày/tháng/năm]<br>
Sinh viên lớp [lớp], ngành [ngành], khoa [khoa] — Mã số sinh viên: [MSSV]<br>
Điện thoại: [SĐT] — Email: [email]</p>
<p>Nay tôi viết đơn này đề nghị phúc khảo bài thi môn [tên môn], mã học phần [mã], thi ngày [ngày/tháng/năm], học kỳ [kỳ] năm học [năm].</p>
<p>Điểm đã công bố: [điểm] — Đề nghị chấm lại: [toàn bài / câu …].</p>
<p>Lý do: [1–2 câu ngắn, cụ thể — ví dụ: "Tôi đã làm đầy đủ các câu hỏi theo đề thi và tự tin bài làm của mình, nhưng điểm công bố thấp bất thường so với bài làm" — tránh viết dài dòng, cảm tính.]</p>
<p>Tôi xin cam đoan những thông tin trên là đúng sự thật và chấp hành kết quả phúc khảo của nhà trường.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Lưu ý quan trọng</h2>
<ul>
<li><strong>Nhiều trường có mẫu đơn riêng</strong> — hỏi phòng đào tạo hoặc tải mẫu trên cổng sinh viên trước khi dùng mẫu này.</li>
<li><strong>Thời hạn rất ngắn</strong> — thường 5–7 ngày sau ngày công bố điểm; quá hạn là không được xét.</li>
<li><strong>Có thể mất lệ phí</strong> — một số trường thu lệ phí phúc khảo mỗi môn; nếu điểm thay đổi, trường thường hoàn lại lệ phí.</li>
<li><strong>Kết quả phúc khảo là kết quả cuối cùng</strong> — điểm có thể tăng, giữ nguyên hoặc giảm.</li>
<li>Giữ lại biên nhận nộp đơn và ghi lại ngày hẹn trả kết quả.</li>
</ul>
<h2>Phân biệt: phúc khảo thi tốt nghiệp THPT</h2>
<p>Phúc khảo kỳ thi tốt nghiệp THPT khác với phúc khảo ở đại học: thí sinh nộp đơn theo <strong>mẫu chính thức tại Phụ lục IV, Thông tư 24/2024/TT-BGDĐT</strong>, nộp tại nơi đăng ký dự thi, trong thời hạn do Bộ GD&ĐT quy định từng năm. Phúc khảo ở đại học theo mẫu và quy định riêng của từng trường.</p>`,
  },
  {
    slug: 'don-xin-giay-xac-nhan-sinh-vien-bang-diem',
    title: 'Đơn xin giấy xác nhận sinh viên / xin bảng điểm',
    desc: 'Gộp 2 mẫu trong 1 bài: đơn xin giấy xác nhận đang học + đơn xin cấp bảng điểm — kèm nơi nộp và lưu ý.',
    body: `
<p>Hai loại giấy này sinh viên cần rất thường xuyên — làm visa, xin học bổng, hoãn nghĩa vụ quân sự, vay vốn, xin việc làm thêm, làm thẻ xe buýt sinh viên. Dưới đây là 2 mẫu riêng; dùng mẫu nào thì viết mẫu đó.</p>
<h2>Mẫu 1: Đơn xin giấy xác nhận sinh viên (xác nhận đang học)</h2>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN GIẤY XÁC NHẬN SINH VIÊN</strong></p>
<p>Kính gửi: [Phòng Đào tạo / Phòng Công tác sinh viên, Trường …]</p>
<p>Tôi tên là: [Họ và tên] — Ngày sinh: [ngày/tháng/năm]<br>
Sinh viên lớp [lớp], ngành [ngành], khoa [khoa] — Mã số sinh viên: [MSSV]<br>
Điện thoại: [SĐT] — Email: [email]</p>
<p>Nay tôi viết đơn này xin nhà trường cấp cho tôi giấy xác nhận sinh viên đang học tại trường, với mục đích: [ghi rõ mục đích — ví dụ: làm hồ sơ xin visa / xin học bổng / hoãn nghĩa vụ quân sự / làm thẻ xe buýt sinh viên].</p>
<p>Số bản cần cấp: [số] bản. Ngôn ngữ: [tiếng Việt / song ngữ Việt – Anh — ghi rõ nếu cần bản tiếng Anh].</p>
<p>Tôi xin chân thành cảm ơn.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Mẫu 2: Đơn xin cấp bảng điểm</h2>
<div class="sv-letter">
<p class="sv-letter-center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>
<p class="sv-letter-center"><strong>ĐƠN XIN CẤP BẢNG ĐIỂM</strong></p>
<p>Kính gửi: [Phòng Đào tạo, Trường …]</p>
<p>Tôi tên là: [Họ và tên] — Ngày sinh: [ngày/tháng/năm]<br>
Sinh viên lớp [lớp], ngành [ngành], khoa [khoa] — Mã số sinh viên: [MSSV]<br>
Điện thoại: [SĐT] — Email: [email]</p>
<p>Nay tôi viết đơn này xin nhà trường cấp cho tôi bảng điểm học tập, cụ thể:</p>
<p>Bảng điểm: [toàn khóa tới thời điểm hiện tại / học kỳ … năm học …]<br>
Số bản cần cấp: [số] bản. Ngôn ngữ: [tiếng Việt / song ngữ Việt – Anh].<br>
Mục đích: [xin học bổng / xin việc / xin học tiếp / …].</p>
<p>Tôi xin chân thành cảm ơn.</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>Người viết đơn<br>(Ký và ghi rõ họ tên)<br><br>[Họ và tên]</p>
</div>
<h2>Nơi nộp và lưu ý</h2>
<ul>
<li><strong>Nơi nộp:</strong> Phòng Đào tạo hoặc Phòng Công tác sinh viên — tùy trường; hỏi cố vấn học tập nếu không rõ.</li>
<li><strong>Nhiều trường nay đăng ký online</strong> qua cổng sinh viên — kiểm tra cổng sinh viên của trường trước khi viết đơn giấy.</li>
<li>Ghi rõ <strong>mục đích + số bản cần</strong> ngay trong đơn để khỏi phải đi lại nhiều lần.</li>
<li>Bảng điểm song ngữ (nếu trường cấp) thường mất nhiều ngày hơn bản tiếng Việt — xin sớm nếu cần gấp.</li>
<li>Một số trường thu phí cấp bản sao/bản dịch — hỏi trước mức phí tại phòng đào tạo.</li>
<li>Kiểm tra lại bảng điểm ngay khi nhận: họ tên, MSSV, điểm các môn có đúng không — sai thì báo ngay để sửa.</li>
</ul>`,
  },
  {
    slug: 'slide-thuyet-trinh',
    title: 'Slide thuyết trình — cấu trúc + mẹo trình bày',
    desc: 'Cấu trúc 3 phần, số slide theo thời lượng, quy tắc 1 slide = 1 ý + danh sách việc cần làm trước giờ thuyết trình.',
    body: `
<p>Bài này không phải file tải về — đây là khung cấu trúc và mẹo trình bày để bạn tự làm slide thuyết trình cho môn học. Slide tốt không phải slide đẹp nhất, mà là slide giúp người nghe theo kịp ý của bạn.</p>
<h2>Cấu trúc 3 phần</h2>
<ol>
<li><strong>Mở đầu (1–2 slide):</strong> tiêu đề + tên nhóm/thành viên; đặt vấn đề bằng 1 câu hỏi hoặc 1 con số gây chú ý; nói rõ bài thuyết trình sẽ trả lời câu hỏi gì.</li>
<li><strong>Thân bài (phần lớn số slide):</strong> chia thành 2–3 ý lớn, mỗi ý 2–3 slide. Mỗi ý mở đầu bằng câu chủ đề, có ví dụ hoặc số liệu, kết thúc bằng câu kết nối sang ý tiếp theo.</li>
<li><strong>Kết luận (1–2 slide):</strong> tóm tắt 3 ý chính trong 3 dòng; trả lời lại câu hỏi đã đặt ở mở đầu; cảm ơn + mời câu hỏi.</li>
</ol>
<h2>Số slide gợi ý theo thời lượng</h2>
<ul>
<li><strong>5 phút:</strong> 4–5 slide.</li>
<li><strong>10 phút:</strong> 8–10 slide.</li>
<li><strong>15 phút:</strong> 12–14 slide.</li>
<li><strong>20 phút:</strong> 15–18 slide.</li>
</ul>
<p>Nguyên tắc: khoảng 1 phút/slide. Quá nhiều slide thì bạn phải nói vội; quá ít slide thì người nghe không theo kịp ý.</p>
<h2>Quy tắc trình bày trên slide</h2>
<ul>
<li><strong>1 slide = 1 ý.</strong> Slide nào có 2 ý thì tách làm 2 slide.</li>
<li><strong>Tối đa khoảng 6 dòng/slide</strong> — mỗi dòng 1 ý ngắn, không chép đoạn văn dài lên slide.</li>
<li><strong>Cỡ chữ từ 24pt trở lên</strong> cho nội dung — người ngồi cuối lớp vẫn đọc được.</li>
<li>Số liệu quan trọng thì làm biểu đồ thay vì bảng dài; 1 biểu đồ/slide.</li>
<li>Hình ảnh rõ nét, ghi nguồn nếu lấy từ mạng.</li>
<li>Một mẫu màu nhất quán cho cả bài — đừng mỗi slide một màu.</li>
</ul>
<h2>Mẹo trình bày</h2>
<ul>
<li><strong>Nói với khán giả, không đọc slide</strong> — slide chỉ là gợi ý; người nghe đọc slide nhanh hơn bạn nói.</li>
<li><strong>Chia phần nói đều</strong> cho các thành viên — mỗi người nói phần mình chuẩn bị.</li>
<li><strong>Chuẩn bị 3 câu hỏi khó nhất</strong> mà giảng viên/bạn bè có thể hỏi — và câu trả lời ngắn cho mỗi câu.</li>
<li>Nói chậm, rõ, nhìn khán giả; đứng thẳng, không quay lưng vào lớp.</li>
<li>Tập dượt ít nhất 1 lần với đồng hồ — bài dài hơn thời gian cho phép là lỗi phổ biến nhất.</li>
</ul>
<h2>Phân công nhóm (mục nhỏ)</h2>
<p>Trước khi làm slide, nhóm nên chốt phân công bằng văn bản ngắn trong nhóm chat: ai làm phần nào, hạn nộp phần của mình là khi nào, ai tổng hợp slide, ai thuyết trình phần nào. Ghi rõ ngày giờ — phân công miệng rất dễ quên và đổ lỗi cho nhau khi gần đến hạn.</p>
<h2>Danh sách việc cần làm trước giờ thuyết trình</h2>
<ul>
<li>Thử slide trên máy chiếu/máy tính của phòng học trước giờ (font, video, âm thanh có chạy không).</li>
<li>Chuẩn bị file dự phòng: 1 bản PDF + 1 bản trên USB + 1 bản trên Drive/email.</li>
<li>Sạc đầy pin laptop, mang theo sạc và đầu chuyển HDMI/VGA nếu cần.</li>
<li>In sẵn dàn ý 1 trang để cầm tay khi nói (không in cả slide).</li>
<li>Đến sớm 10 phút để chuẩn bị và thử micro.</li>
</ul>`,
  },
  {
    slug: 'thu-gioi-thieu',
    title: 'Thư giới thiệu',
    desc: 'Cách nhờ giảng viên viết thư giới thiệu + khung thư mẫu để soạn sẵn cho giảng viên tham khảo — kèm một bức thư mẫu hoàn chỉnh đã điền.',
    body: `
<p>Thư giới thiệu cần cho học bổng, du học, xin việc — và sinh viên thường lúng túng ở 2 chỗ: ngại xin giảng viên, và không biết "nhờ thầy cô viết gì". Bài này giải quyết cả 2: mẫu câu nhờ lịch sự + khung thư để bạn soạn sẵn cho giảng viên tham khảo.</p>
<h2>Phần 1: Email/mẫu câu nhờ giảng viên viết thư</h2>
<p>Nhờ trực tiếp sau giờ học hoặc qua email đều được. Email nên ngắn, lịch sự, ghi rõ hạn nộp và gửi kèm tài liệu để giảng viên viết dễ hơn.</p>
<div class="sv-letter">
<p><strong>Tiêu đề:</strong> Em [Họ tên] – Nhờ thầy/cô viết thư giới thiệu cho hồ sơ [học bổng/đơn vị]</p>
<p>Kính gửi Thầy/Cô [họ tên giảng viên],</p>
<p>Em là [Họ tên], sinh viên lớp [lớp], đã học môn [tên môn] với Thầy/Cô ở học kỳ [kỳ]. Em đang chuẩn bị hồ sơ [xin học bổng … / ứng tuyển …] và rất mong Thầy/Cô viết giúp em một thư giới thiệu.</p>
<p>Hạn nộp hồ sơ là ngày [ngày/tháng/năm]. Em xin gửi kèm CV và bảng điểm để Thầy/Cô tiện tham khảo. Nếu Thầy/Cô cần thêm thông tin gì, em sẵn sàng gửi thêm.</p>
<p>Em xin chân thành cảm ơn Thầy/Cô đã dành thời gian.</p>
<p>Trân trọng,<br>[Họ tên] — SĐT: [số] — Email: [email]</p>
</div>
<h2>Phần 2: Khung thư giới thiệu mẫu (soạn sẵn cho giảng viên tham khảo)</h2>
<p>Nhiều giảng viên bận và sẽ hỏi bạn "em muốn thầy/cô viết gì" — hoặc nhờ bạn soạn nháp để thầy/cô sửa và ký. Khung dưới đây giúp bạn soạn nháp đúng ý; giảng viên vẫn là người quyết định nội dung cuối cùng và ký tên.</p>
<div class="sv-letter">
<p class="sv-letter-center"><strong>THƯ GIỚI THIỆU</strong></p>
<p>Kính gửi: [Hội đồng xét học bổng / Ban tuyển sinh / Phòng Nhân sự …]</p>
<p>Tôi là [họ tên giảng viên], [chức danh], khoa [tên khoa], Trường [tên trường]. Tôi viết thư này để giới thiệu sinh viên [họ tên sinh viên], người đã học môn [tên môn] với tôi ở học kỳ [kỳ] năm học [năm] và đạt điểm [điểm].</p>
<p>[Điểm mạnh 1 — cụ thể, có ví dụ: "Trong đồ án môn học, em đã … và đạt kết quả …"]</p>
<p>[Điểm mạnh 2 — cụ thể, có ví dụ: "Em luôn … (chủ động đặt câu hỏi, giúp đỡ bạn cùng lớp, hoàn thành bài trước hạn…)"]</p>
<p>[So sánh với sinh viên cùng khóa, nếu có: "Trong số các sinh viên tôi đã giảng dạy, em thuộc nhóm …"]</p>
<p>Tôi tin rằng [họ tên sinh viên] xứng đáng nhận [học bổng/vị trí …] và sẽ hoàn thành tốt [chương trình/công việc …]. Mọi thắc mắc xin liên hệ với tôi qua email [email giảng viên] hoặc số điện thoại [số].</p>
<p class="sv-letter-right">[Địa điểm], ngày … tháng … năm …<br>[Chữ ký]<br>[Họ tên giảng viên]<br>[Chức danh, khoa, trường]</p>
</div>
<h2>Phần 3: Một bức thư giới thiệu hoàn chỉnh đã điền</h2>
<p class="note">Ví dụ minh họa — thông tin trong thư này là hư cấu: một giảng viên viết thư cho sinh viên của mình để xin học bổng. Dùng để tham khảo giọng văn và độ dài từng đoạn, thay bằng thông tin thật của bạn và giảng viên của bạn.</p>
<div class="sv-letter">
<p class="sv-letter-center"><strong>THƯ GIỚI THIỆU</strong></p>
<p>Kính gửi: Hội đồng xét học bổng khuyến khích học tập, Trường Đại học Kinh tế TP. Hồ Chí Minh,</p>
<p>Tôi là Phạm Hồng Nhung, Thạc sĩ, giảng viên khoa Quản trị kinh doanh, Trường Đại học Kinh tế TP. Hồ Chí Minh. Tôi viết thư này để giới thiệu sinh viên Lê Minh Khoa, người đã học môn Quản trị Marketing với tôi ở học kỳ 1 năm học 2025–2026 và đạt điểm 9.2/10 — điểm cao nhất lớp 55 sinh viên.</p>
<p>Điểm mạnh đầu tiên của Khoa là khả năng biến lý thuyết thành việc làm được. Trong đồ án môn học, Khoa chọn một quán cà phê nhỏ gần trường làm đối tượng nghiên cứu, tự đến quán phỏng vấn chủ quán 3 buổi, rồi lập kế hoạch quảng bá chỉ dùng ngân sách 2 triệu đồng/tháng — kế hoạch chi tiết tới từng tuần, từng bài đăng. Chủ quán đã áp dụng thử 2 ý trong kế hoạch và lượng khách buổi tối tăng khoảng 20% sau 1 tháng. Trong 8 năm giảng dạy, tôi hiếm gặp sinh viên năm 3 nào chịu xuống thực tế kỹ như vậy thay vì chỉ viết trên lý thuyết.</p>
<p>Điểm mạnh thứ hai là tinh thần làm việc nhóm. Khoa làm trưởng nhóm 5 người trong đồ án, chia việc rõ ràng theo thế mạnh từng bạn, và khi một thành viên ốm phải nghỉ 1 tuần, Khoa tự nhận thêm phần việc của bạn đó thay vì để nhóm nộp muộn. Nhóm của Khoa nộp bài trước hạn 3 ngày và đạt 9.4/10 — cao nhất trong 10 nhóm của lớp. Các bạn trong nhóm đều nói Khoa là người giữ nhịp cho cả nhóm, không phải người chỉ huy.</p>
<p>Trong số khoảng 300 sinh viên tôi đã giảng dạy 3 năm gần đây, Khoa thuộc nhóm 5% sinh viên tôi ấn tượng nhất — không chỉ vì điểm số, mà vì cách em làm việc: cẩn thận, chủ động và biết nghĩ cho người khác. Tôi tin rằng Lê Minh Khoa xứng đáng nhận học bổng khuyến khích học tập và sẽ tiếp tục giữ phong độ này trong các học kỳ tới. Mọi thắc mắc xin liên hệ với tôi qua email nhung.pham@ueh.edu.vn hoặc số điện thoại 090 234 56 78.</p>
<p class="sv-letter-right">TP. Hồ Chí Minh, ngày 10 tháng 9 năm 2026<br>(Chữ ký)<br><strong>Phạm Hồng Nhung</strong><br>Thạc sĩ, Giảng viên khoa Quản trị kinh doanh<br>Trường Đại học Kinh tế TP. Hồ Chí Minh</p>
</div>
<h2>Lưu ý khi xin thư giới thiệu</h2>
<ul>
<li><strong>Xin trước ít nhất 2–3 tuần</strong> so với hạn nộp — giảng viên cần thời gian viết; xin gấp 2–3 ngày là thiếu lịch sự.</li>
<li>Chọn giảng viên <strong>biết rõ bạn</strong> (đã dạy bạn, đã hướng dẫn đồ án) thay vì giảng viên có chức danh cao nhưng không biết bạn là ai.</li>
<li>Gửi kèm CV + bảng điểm + thông tin về học bổng/vị trí để giảng viên viết đúng ý.</li>
<li>Một thư giới thiệu tốt nói về <strong>2–3 điểm mạnh cụ thể có ví dụ</strong> — thư chỉ toàn lời khen chung chung không có giá trị.</li>
<li>Sau khi nộp hồ sơ, nhắn cảm ơn giảng viên. Nếu trúng tuyển/nhận được học bổng, báo tin cho giảng viên — đó là phép lịch sự và giữ quan hệ tốt.</li>
<li>Không tự viết thư rồi giả chữ ký giảng viên — bị phát hiện là hủy hồ sơ và ảnh hưởng uy tín của bạn với trường.</li>
</ul>`,
  },
];

// ---------------------------------------------------------------------------
// Công cụ cho sinh viên (§2.6): 15 công cụ đã có, hợp sinh viên nhất.
// Slug phải tồn tại trong src/tools/ — build.mjs kiểm tra và dừng build
// nếu thiếu (xem sinh-vien.js).
// ---------------------------------------------------------------------------
export const STUDENT_TOOL_SLUGS = [
  'gpa-tin-chi',
  'quy-doi-diem',
  'tinh-diem-thi-thpt',
  'tinh-diem-ielts',
  'pomodoro',
  'dem-nguoc-su-kien',
  'test-go-phim',
  'doc-van-ban-thanh-tieng',
  'ghi-chep-tai-chinh',
  'chia-tien-hoa-don',
  'pdf-sang-word',
  'gop-pdf',
  'tach-trang-pdf',
  'anh-sang-pdf',
  'tao-ma-qr',
];

