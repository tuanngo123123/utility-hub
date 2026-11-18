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
    free: 'Miễn phí 100%: học + thi + chứng chỉ đều 0 đồng, thi lại miễn phí. Chứng chỉ Ads/Analytics hiệu lực 1 năm (điểm đạt 80%). Khóa Digital Marketing nay chỉ còn huy hiệu "award", không phải chứng chỉ chính thức.',
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
    get: 'All Products Pack miễn phí 1 năm, gia hạn hàng năm: IntelliJ IDEA Ultimate, PyCharm Pro, WebStorm, Rider, CLion, DataGrip… (trị giá khoảng $299/năm). AI Pro không kèm (chỉ AI Free + thử AI Pro 30 ngày). Sau tốt nghiệp giảm 40% trong 2 năm.',
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
    get: 'Premium Student: nghe không quảng cáo, tải offline, chất lượng cao — 33.000đ/tháng (giá gốc 65.000đ), tối đa 4 năm.',
    cond: 'Từ 18 tuổi, đang học CĐ/ĐH được công nhận. Xác minh qua SheerID (trường phải có trong danh sách SheerID), xác minh lại mỗi 12 tháng. Không thanh toán bằng cước di động.',
  },
  {
    name: 'Autodesk Education',
    url: 'https://www.autodesk.com/asean/support/account/education/students-educators/overview',
    get: 'Miễn phí 1 năm, gia hạn hàng năm: AutoCAD, Revit, Fusion, Inventor, 3ds Max, Maya… bản đầy đủ (kể cả 3 phiên bản cũ). Phù hợp sinh viên kiến trúc, xây dựng, cơ khí.',
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
    desc: 'Cấu trúc CV 1 trang cho người chưa có kinh nghiệm: thông tin, mục tiêu, học vấn, kỹ năng, đồ án, kinh nghiệm làm thêm — kèm gợi ý theo 3 nhóm ngành.',
    body: `
<p>CV xin thực tập hay việc làm đầu tiên không cần dài — 1 trang, đủ 6 mục dưới đây, viết cụ thể bằng số thay vì chung chung.</p>
<h2>Cấu trúc CV 1 trang</h2>
<ol>
<li><strong>Thông tin liên hệ:</strong> họ tên, số điện thoại, email (địa chỉ nghiêm túc, dạng hoten@gmail.com), link LinkedIn/GitHub nếu có. Không cần ghi ngày sinh, quê quán, số CCCD.</li>
<li><strong>Mục tiêu nghề nghiệp:</strong> 2–3 dòng, ghi rõ vị trí muốn ứng tuyển + điều bạn mang lại. Ví dụ: "Ứng tuyển vị trí thực tập sinh kế toán. Muốn áp dụng kiến thức kế toán tài chính đã học vào công việc thực tế và học hỏi quy trình kế toán doanh nghiệp."</li>
<li><strong>Học vấn:</strong> trường, ngành, năm học, GPA (ghi nếu từ 3.0/4.0 trở lên), 1–2 môn học hoặc đồ án liên quan tới vị trí ứng tuyển.</li>
<li><strong>Kỹ năng:</strong> chia 2 nhóm — chuyên môn (ví dụ: Excel, phân tích số liệu, AutoCAD, Python…) và ngoại ngữ/tin học (kèm chứng chỉ nếu có). Chỉ ghi kỹ năng bạn thực sự dùng được.</li>
<li><strong>Hoạt động &amp; đồ án:</strong> 2–4 mục, mỗi mục 1–2 dòng, ghi KẾT QUẢ bằng số. "Tổ chức chương trình chào tân sinh viên cho 300 sinh viên, huy động 5 nhà tài trợ" tốt hơn "Tham gia hoạt động Đoàn".</li>
<li><strong>Kinh nghiệm làm thêm:</strong> ghi cả việc không đúng ngành nếu nó rèn kỹ năng liên quan — bán hàng rèn giao tiếp và thuyết phục, gia sư rèn trình bày và kiên nhẫn.</li>
</ol>
<h2>Gợi ý theo ngành</h2>
<ul>
<li><strong>Kinh tế – quản trị:</strong> nhấn mạnh Excel (hàm, PivotTable), phân tích số liệu, kinh nghiệm thực tập/bán hàng, chứng chỉ MOS/tiếng Anh.</li>
<li><strong>Kỹ thuật:</strong> đồ án môn học, phần mềm chuyên ngành (AutoCAD, SolidWorks, MATLAB…), thực tập nhà máy/xưởng, khả năng đọc bản vẽ.</li>
<li><strong>CNTT:</strong> link GitHub + dự án cá nhân (ghi rõ công nghệ đã dùng, link demo nếu có), ngôn ngữ thành thạo, tham gia hackathon/câu lạc bộ lập trình.</li>
</ul>
<h2>Lưu ý trước khi gửi</h2>
<ul>
<li>Đừng mở đầu bằng "chưa có kinh nghiệm" — nhà tuyển dụng đọc CV để thấy bạn làm được gì, không phải để thấy bạn thiếu gì.</li>
<li>Dùng động từ: đạt, tổ chức, xây dựng, thiết kế, tiết kiệm… thay vì "tham gia", "được giao".</li>
<li>Kiểm tra chính tả 2 lần, nhờ 1 người khác đọc lại trước khi gửi.</li>
<li>Lưu file PDF, đặt tên "CV-Ho-va-ten-Vi-tri-ung-tuyen.pdf".</li>
<li>Gửi kèm email ngắn giới thiệu bản thân, đừng gửi CV trống không.</li>
</ul>`,
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
    desc: 'Khung mục lục chuẩn, mẫu bìa, cách trình bày số liệu và những lỗi thường gặp.',
    body: `
<p>Báo cáo thực tập thường dài 30–60 trang tùy quy định của trường. Khung dưới đây dùng được cho hầu hết các ngành — điều chỉnh tên chương theo yêu cầu của khoa bạn.</p>
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
<li>Để dồn viết vào tuần cuối — nên ghi nhật ký thực tập hàng tuần, viết dần theo đó.</li>
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
    title: 'Checklist nhập học năm nhất',
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
<li>Sổ hộ khẩu hoặc giấy xác nhận cư trú.</li>
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
<tr><td>Nhà trọ (ở ghép)</td><td>800.000đ</td><td>1.200.000đ</td><td>1.500.000đ</td></tr>
<tr><td>Điện + nước + wifi</td><td>250.000đ</td><td>350.000đ</td><td>450.000đ</td></tr>
<tr><td>Ăn uống (tự nấu nhiều)</td><td>1.200.000đ</td><td>1.500.000đ</td><td>1.800.000đ</td></tr>
<tr><td>Đi lại</td><td>200.000đ</td><td>300.000đ</td><td>400.000đ</td></tr>
<tr><td>Học tập</td><td>150.000đ</td><td>200.000đ</td><td>300.000đ</td></tr>
<tr><td>Cá nhân + giải trí</td><td>250.000đ</td><td>300.000đ</td><td>400.000đ</td></tr>
<tr><td>Dự phòng</td><td>150.000đ</td><td>150.000đ</td><td>150.000đ</td></tr>
</table>
<p class="muted small">Mức trên chưa gồm học phí (thường đóng theo học kỳ, không phải hàng tháng) và áp dụng cho sinh viên ở trọ tại thành phố lớn. Tự nấu ăn 4–5 bữa/tuần là cách tiết kiệm hiệu quả nhất — ăn ngoài mỗi ngày tốn gấp đôi.</p>
<h2>Mẹo giữ ngân sách</h2>
<ul>
<li>Rút tiền mặt theo tuần thay vì giữ cả tháng trong ví.</li>
<li>Mua đồ cũ (sách, xe đạp, đồ điện) từ sinh viên khóa trên.</li>
<li>Ghi chép mỗi ngày — dùng công cụ <a href="/cong-cu/ghi-chep-tai-chinh/">Ghi chép tài chính</a> trên Tiện Ích Hub để dán ghi chép và xem tổng.</li>
<li>Để riêng khoản dự phòng ngay khi nhận tiền, đừng đợi cuối tháng còn bao nhiêu mới để dành.</li>
</ul>`,
  },
  {
    slug: 'don-xin-hoc-bong',
    title: 'Đơn xin học bổng',
    desc: 'Mẫu đơn + cách viết thư động lực ngắn + danh sách giấy tờ thường kèm theo.',
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

