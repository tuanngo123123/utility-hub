// Dữ liệu mục Học miễn phí (/hoc-mien-phi/) — repo GitHub học miễn
// phí, chia 3 nhóm (tiếng Anh đầu tiên, nhiều mục nhất). Mọi repo đã
// KIỂM CHỨNG THẬT qua api.github.com ngày 18/11/2026: repo tồn tại,
// số sao ghi đúng lúc kiểm chứng, còn cập nhật gần đây, miễn phí
// thật, không vi phạm điều khoản dịch vụ. Mô tả TIẾNG VIỆT tự viết —
// không sao chép README. Số sao thay đổi theo thời gian; trang ghi
// rõ "Số sao cập nhật ngày 18/11/2026".
//
// LOẠI RA (đã kiểm, không đưa vào): repo link sách lậu (awesome-IELTS
// link PDF sách Cambridge lậu; EthanLin-TWer/ielts chứa đề Cambridge),
// repo giao diện/đọc hiểu toàn tiếng Trung (người Việt không dùng
// được), repo kiếm tiền AI/không phải tài liệu học, repo chính trị.
// Qwerty Learner (RealKai42/qwerty-learner) TỪNG có trong trang nhưng
// ĐÃ GỠ 18/11 15:52: app của tác giả Trung Quốc, giao diện và nghĩa của
// từ đều bằng tiếng Trung — Tuấn bấm vào thấy toàn chữ Trung, người
// Việt học từ vựng không dùng được. Đừng đưa lại.
// developer-roadmap đã chuyển nhà: kamranahmedse/developer-roadmap
// → nilbuild/developer-roadmap (đã đối chiếu qua API).
// Trường `live` (không bắt buộc): trang web học trực tiếp của repo đó
// — đã kiểm HTTP 200 ngày 18/11/2026. Repo có `live` thì nút chính dẫn
// tới trang học (không cần cài đặt), link GitHub lùi thành link phụ.
export const GROUPS = [
  {
    id: 'tieng-anh',
    title: 'Tiếng Anh',
    intro: 'Từ vựng, luyện nghe/nói/đọc/viết, IELTS — học theo thứ tự từ hay gặp nhất trước.',
    repos: [
      {
        repo: 'dwyl/english-words',
        name: 'English Words (dwyl)',
        stars: '12.338',
        desc: 'Danh sách 479.000 từ tiếng Anh dạng file text — dùng để tra cứu, làm flashcard, hoặc làm dữ liệu cho app học từ của riêng bạn.',
      },
      {
        repo: 'first20hours/google-10000-english',
        name: 'Google 10.000 English Words',
        stars: '4.508',
        desc: '10.000 từ tiếng Anh thông dụng nhất, xếp theo tần suất xuất hiện — học theo thứ tự này thì từ nào hay gặp cũng quen mặt trước.',
      },
      {
        repo: 'interaminense/learning-english',
        name: 'Learning English',
        stars: '812',
        desc: 'Danh sách link học tiếng Anh do người học tự sưu tầm: blog, khóa học, podcast, game, radio, video — đủ 4 kỹ năng nghe, nói, đọc, viết.',
      },
      {
        repo: 'jnoodle/English-Vocabulary-Word-List',
        name: 'English Vocabulary Word List',
        stars: '438',
        desc: 'Danh sách từ vựng tiếng Anh thông dụng, gọn nhẹ — mở ra là học được ngay, hợp làm tài liệu ôn từ mỗi ngày.',
      },
      {
        repo: 'Ecattea/COCA-English-Anki-Deck',
        name: 'COCA English Anki Deck',
        stars: '196',
        desc: 'Bộ thẻ Anki 5.000 từ tiếng Anh hay gặp nhất theo kho ngữ liệu COCA — tải về Anki là ôn được theo phương pháp lặp lại ngắt quãng.',
      },
    ],
  },
  {
    id: 'lap-trinh',
    title: 'Lập trình',
    intro: 'Khóa học, sách và lộ trình lập trình miễn phí nổi tiếng nhất GitHub — từ người mới tới ôn phỏng vấn.',
    repos: [
      {
        repo: 'freeCodeCamp/freeCodeCamp',
        name: 'freeCodeCamp',
        stars: '459.279',
        live: 'https://www.freecodecamp.org/',
        desc: 'Khóa học lập trình miễn phí nổi tiếng nhất: làm web, JavaScript, Python, khoa học dữ liệu — học bằng bài tập thực hành và dự án thật, có chứng chỉ miễn phí. Học trực tiếp trên web, không cần cài đặt.',
      },
      {
        repo: 'EbookFoundation/free-programming-books',
        name: 'Free Programming Books',
        stars: '401.800',
        desc: 'Kho sách lập trình miễn phí lớn nhất GitHub: đủ mọi ngôn ngữ và chủ đề, từ nhập môn tới chuyên sâu.',
      },
      {
        repo: 'nilbuild/developer-roadmap',
        name: 'Developer Roadmap',
        stars: '372.268',
        live: 'https://roadmap.sh/',
        desc: 'Bản đồ lộ trình học cho từng nghề lập trình: frontend, backend, DevOps, AI… — mở ra là biết nên học gì trước, gì sau. Xem trực tiếp trên web, không cần cài đặt.',
      },
      {
        repo: 'jwasham/coding-interview-university',
        name: 'Coding Interview University',
        stars: '364.493',
        desc: 'Lộ trình tự học khoa học máy tính trong vài tháng để ôn phỏng vấn lập trình — từ cấu trúc dữ liệu tới thiết kế hệ thống, kèm tài liệu từng bước.',
      },
      {
        repo: 'ossu/computer-science',
        name: 'OSSU Computer Science',
        stars: '211.255',
        desc: 'Chương trình cử nhân khoa học máy tính tự học miễn phí, ghép từ khóa học của các trường lớn — học đủ là tương đương 4 năm đại học.',
      },
      {
        repo: 'Microsoft/Web-Dev-For-Beginners',
        name: 'Web Dev For Beginners (Microsoft)',
        stars: '97.124',
        desc: 'Khóa học làm web cho người mới của Microsoft: 24 bài trong 12 tuần, từ HTML/CSS tới JavaScript, có bài tập và quiz từng bài.',
      },
    ],
  },
  {
    id: 'ky-nang-khac',
    title: 'Kỹ năng khác',
    intro: 'Tài liệu miễn phí ngoài lập trình: danh sách tổng hợp, thiết kế, bài báo khoa học.',
    repos: [
      {
        repo: 'sindresorhus/awesome',
        name: 'Awesome',
        stars: '538.699',
        desc: 'Danh sách tổng hợp các "awesome list" đủ mọi lĩnh vực — cần tài liệu hay về chủ đề gì, vào đây tìm là có.',
      },
      {
        repo: 'papers-we-love/papers-we-love',
        name: 'Papers We Love',
        stars: '111.626',
        desc: 'Tuyển tập bài báo khoa học máy tính đáng đọc nhất — đọc để hiểu sâu thay vì chỉ học vẹt công cụ.',
      },
      {
        repo: 'bradtraversy/design-resources-for-developers',
        name: 'Design Resources for Developers',
        stars: '67.421',
        desc: 'Tài nguyên thiết kế miễn phí cho dân làm web: ảnh, font, icon, màu sắc, template — không cần biết vẽ vẫn làm giao diện đẹp được.',
      },
    ],
  },
];
