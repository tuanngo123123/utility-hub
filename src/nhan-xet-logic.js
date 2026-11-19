// Gợi ý lời nhận xét học sinh — ngân hàng lời nhận xét viết sẵn +
// logic chọn gợi ý. Một nguồn duy nhất cho cả trang công cụ
// (build.mjs chèn file này vào trang, trừ dòng export cuối, để
// init() gọi qua window.UH_NHANXET) và bộ kiểm
// scripts/test-nhan-xet.mjs — lời trên trang và trong test là một,
// theo đúng mẫu src/so-diem-logic.js và src/tron-de-logic.js.
//
// KHUNG PHÁP LÝ + QUY ƯỚC (đối chiếu 20/11/2026):
// - Thông tư 22/2021/TT-BGDĐT, Điều 5: giáo viên nhận xét sự tiến
//   bộ, ưu điểm nổi bật, hạn chế chủ yếu của học sinh trong quá
//   trình rèn luyện và học tập; Điều 9: kết quả học tập xếp 4 mức
//   Tốt/Khá/Đạt/Chưa đạt; Điều 20 khoản 4: giáo viên chủ nhiệm ghi
//   nhận xét về kết quả rèn luyện, học tập vào sổ theo dõi và học
//   bạ; giáo viên môn học cung cấp nhận xét cho giáo viên chủ nhiệm.
// - Phẩm chất chủ yếu: yêu nước, nhân ái, chăm chỉ, trung thực,
//   trách nhiệm; năng lực chung: tự chủ và tự học, giao tiếp và
//   hợp tác, giải quyết vấn đề và sáng tạo (chương trình GDPT 2018).
// - Quy ước viết nhận xét (hoatieu.vn, tailieuhoctap.edu.vn,
//   latendoc.com — chỉ lấy QUY ƯỚC, mọi câu trong ngân hàng đều tự
//   viết mới): cụ thể (nêu việc làm được/chưa được), mang tính định
//   hướng phát triển, có gợi ý khắc phục, không chung chung.
// - Mọi lời nhận xét mức Chưa đạt và mọi lời "cần cải thiện" đều
//   mang tính xây dựng: nêu rõ điểm cần cải thiện + hướng khắc phục
//   cụ thể, KHÔNG chê bai, KHÔNG dán nhãn học sinh. Ngân hàng
//   không chứa các từ: "lười biếng", "kém cỏi", "dốt", "hư", "ngu"
//   (bộ kiểm quét toàn bộ ngân hàng).
//
// CẤU TRÚC NGÂN HÀNG (84 lời):
// - Theo môn (4 môn × 4 mức × 3 lời = 48): Toán, Ngữ văn, Tiếng
//   Anh, Môn chung (dùng cho mọi môn khác).
// - Theo phẩm chất/thái độ (4 phẩm chất × 2 phía × 3 lời = 24):
//   Chăm chỉ, Hợp tác, Tự tin, Kỷ luật; mỗi phẩm chất có lời khen
//   (điểm mạnh) và lời cần cải thiện.
// - Nhận xét chung cuối kỳ (4 mức × 3 lời = 12): giáo viên chủ
//   nhiệm dùng cho học bạ cuối kỳ/năm.
// - Mỗi lời 1–2 câu, tiếng Việt tự nhiên như giáo viên viết.
//   "[tên]" chỉ xuất hiện ở vị trí chủ ngữ đầu câu nên khi chưa
//   chọn học sinh, thay bằng "Em" vẫn đúng ngữ pháp.
//
// CÁCH GỢI Ý: mỗi lần gợi ý gồm 1 lời theo môn + tối đa 3 lời về
// phẩm chất (theo điểm mạnh/cần cải thiện đã chọn) + 1 lời chung
// cuối kỳ — tổng 3–5 lời. Lời đã dùng cho học sinh khác được ưu
// tiên tránh lặp (danh sách đã dùng lưu trên trình duyệt) để cả
// lớp không bị trùng câu; hết lời mới thì dùng lại từ đầu.

const LEVELS = ['Tốt', 'Khá', 'Đạt', 'Chưa đạt'];
const LEVEL_IDS = ['tot', 'kha', 'dat', 'chuadat'];

const SUBJECTS = [
  { id: 'toan', name: 'Toán' },
  { id: 'ngu-van', name: 'Ngữ văn' },
  { id: 'tieng-anh', name: 'Tiếng Anh' },
  { id: 'chung', name: 'Môn chung' },
];

const TRAITS = [
  { id: 'cham-chi', name: 'Chăm chỉ' },
  { id: 'hop-tac', name: 'Hợp tác' },
  { id: 'tu-tin', name: 'Tự tin' },
  { id: 'ky-luat', name: 'Kỷ luật' },
];

// Từ cấm trong ngân hàng (bộ kiểm quét toàn bộ; "hư"/"ngu" kiểm
// theo từ trọn vẹn để không bắt nhầm âm tiết trong từ khác).
const BANNED_WORDS = ['lười biếng', 'kém cỏi', 'dốt', 'hư', 'ngu'];

// Từ hướng khắc phục: mọi lời Chưa đạt và mọi lời "cần cải thiện"
// phải chứa ít nhất 1 từ trong danh sách này (bộ kiểm quét).
const REMEDY_WORDS = ['cần', 'nên', 'hãy', 'tiếp tục'];

const BANK = {
  subject: {
    toan: {
      tot: [
        '[tên] nắm vững kiến thức trọng tâm, giải bài tập nhanh và trình bày lời giải rõ ràng, mạch lạc.',
        'Em có tư duy toán học tốt, biết vận dụng kiến thức vào bài toán thực tế và sẵn sàng giúp bạn khi bạn chưa hiểu bài.',
        '[tên] làm bài cẩn thận, kiểm tra lại kết quả trước khi nộp và thường tìm được nhiều cách giải cho một bài toán.',
      ],
      kha: [
        'Em nắm được kiến thức cơ bản, giải đúng phần lớn bài tập trong sách giáo khoa; cần rèn thêm các bài toán vận dụng để điểm số ổn định hơn.',
        '[tên] học Toán đều tay, làm bài tập đầy đủ; cần cẩn thận hơn ở khâu tính toán vì em còn sai sót nhỏ khi làm bài kiểm tra.',
        'Em hiểu bài nhanh, biết áp dụng công thức vào bài tập; cần tập trình bày lời giải đầy đủ hơn thay vì chỉ ghi đáp số.',
      ],
      dat: [
        'Em nắm được kiến thức cơ bản của môn Toán, làm được các bài tập đơn giản; cần ôn lại các dạng bài đã học và làm thêm bài tập mỗi ngày để nhớ lâu hơn.',
        '[tên] đã cố gắng hoàn thành bài tập trên lớp; cần mạnh dạn hỏi thầy cô và bạn bè ngay khi chưa hiểu bài thay vì để dồn lại.',
        'Em biết vận dụng công thức vào bài tập quen thuộc; cần rèn thêm kỹ năng đọc đề và phân tích bài toán trước khi giải.',
      ],
      chuadat: [
        'Em mới nắm được một phần kiến thức cơ bản, còn lúng túng khi gặp bài tập mới; cần ôn lại từng dạng bài từ đầu, làm lại các bài đã chữa và nhờ thầy cô giảng lại phần nào em chưa rõ.',
        '[tên] cần dành thời gian mỗi ngày để làm lại bài tập cơ bản, bắt đầu từ các phép tính và công thức đã học; thầy cô và bạn bè luôn sẵn sàng giúp em.',
        'Em chưa hoàn thành đủ bài tập nên kiến thức còn rời rạc; cần lập thời gian biểu học Toán mỗi ngày và làm đủ bài tập về nhà để nắm chắc kiến thức cơ bản.',
      ],
    },
    'ngu-van': {
      tot: [
        '[tên] đọc hiểu văn bản tốt, nắm được ý chính và biết nêu cảm nhận riêng một cách rõ ràng, có lý.',
        'Em viết văn mạch lạc, câu chữ trong sáng, biết dùng dẫn chứng phù hợp để làm rõ ý của mình.',
        '[tên] có năng khiếu cảm thụ văn học, trình bày ý kiến tự tin trong giờ thảo luận và luôn hoàn thành bài viết đúng hạn.',
      ],
      kha: [
        'Em đọc hiểu văn bản khá tốt, viết được bài văn đúng dàn ý; cần rèn thêm cách mở bài và kết bài cho sinh động hơn.',
        '[tên] nắm được kiến thức văn học cơ bản, viết câu đúng ngữ pháp; cần đọc thêm sách để vốn từ phong phú hơn và diễn đạt tự nhiên hơn.',
        'Em có ý tưởng viết khá hay nhưng bài văn còn ngắn; cần triển khai ý đầy đủ hơn, thêm dẫn chứng và phân tích trước khi kết luận.',
      ],
      dat: [
        'Em hiểu được nội dung chính của văn bản, viết được đoạn văn đúng yêu cầu; cần tập viết thường xuyên hơn để câu văn mạch lạc và ít lỗi chính tả hơn.',
        '[tên] đã cố gắng hoàn thành các bài viết trên lớp; cần đọc kỹ yêu cầu đề và lập dàn ý trước khi viết để bài không bị lạc ý.',
        'Em nắm được kiến thức cơ bản của môn Ngữ văn; cần đọc lại văn bản mẫu và tập tóm tắt ý chính sau mỗi bài đọc.',
      ],
      chuadat: [
        'Em mới nắm được một phần nội dung bài học, bài viết còn ngắn và chưa đủ ý; cần đọc kỹ văn bản, ghi lại ý chính sau mỗi đoạn và tập viết từng đoạn văn ngắn mỗi tuần.',
        '[tên] cần dành thời gian đọc lại các văn bản đã học, tập trả lời câu hỏi đọc hiểu theo gợi ý trong sách giáo khoa và nhờ thầy cô chữa bài thường xuyên hơn.',
        'Em chưa hoàn thành đủ bài tập đọc hiểu và bài viết nên kỹ năng còn chưa vững; cần làm đủ bài tập về nhà và tập viết đoạn văn 5–7 câu mỗi ngày để tiến bộ dần.',
      ],
    },
    'tieng-anh': {
      tot: [
        '[tên] phát âm chuẩn, nói tiếng Anh lưu loát và tự tin, vốn từ vựng phong phú hơn yêu cầu của chương trình.',
        'Em đọc hiểu văn bản tiếng Anh tốt, viết đoạn văn đúng ngữ pháp và biết dùng từ nối để bài viết mạch lạc.',
        '[tên] nghe hiểu tốt, nắm được ý chính của bài nghe ngay lần đầu và luôn xung phong trả lời câu hỏi bằng tiếng Anh.',
      ],
      kha: [
        'Em nắm được từ vựng và ngữ pháp cơ bản, đọc hiểu được văn bản ngắn; cần luyện nghe thêm mỗi ngày để phản xạ nhanh hơn khi giao tiếp.',
        '[tên] viết được câu đúng ngữ pháp, làm bài tập đầy đủ; cần mạnh dạn nói tiếng Anh trong giờ học để phát âm tự nhiên hơn.',
        'Em có vốn từ khá, hiểu bài đọc nhanh; cần ôn lại các thì đã học vì em còn nhầm lẫn khi chia động từ trong bài viết.',
      ],
      dat: [
        'Em nhớ được từ vựng cơ bản, đọc được câu đơn giản; cần học thuộc từ mới mỗi ngày và tập đặt câu với từ vừa học để nhớ lâu hơn.',
        '[tên] đã cố gắng hoàn thành bài tập tiếng Anh; cần luyện phát âm theo băng mẫu và đọc to bài đọc sau mỗi buổi học.',
        'Em nắm được ngữ pháp cơ bản; cần làm thêm bài tập trắc nghiệm và nghe lại bài nghe nhiều lần để quen với tốc độ nói.',
      ],
      chuadat: [
        'Em mới nhớ được một số từ vựng cơ bản, còn khó khăn khi đọc và viết câu; cần học thuộc 5 từ mới mỗi ngày, tập đọc to và viết lại các câu mẫu trong sách giáo khoa.',
        '[tên] cần ôn lại từ vựng và ngữ pháp từ đầu học kỳ, làm lại các bài tập đã chữa và luyện nghe theo băng mẫu 10 phút mỗi ngày.',
        'Em chưa hoàn thành đủ bài tập nên vốn từ còn ít; cần làm đủ bài tập về nhà, ghi từ mới vào sổ và ôn lại mỗi tối để theo kịp các bạn.',
      ],
    },
    chung: {
      tot: [
        '[tên] nắm vững kiến thức môn học, hoàn thành tốt mọi nhiệm vụ được giao và luôn tích cực xây dựng bài.',
        'Em học tập chủ động, tìm tòi thêm tài liệu ngoài sách giáo khoa và biết vận dụng kiến thức vào thực tế.',
        '[tên] có kết quả học tập ổn định ở mức cao, làm việc nhóm hiệu quả và sẵn sàng hỗ trợ các bạn trong lớp.',
      ],
      kha: [
        'Em nắm được kiến thức trọng tâm của môn học, hoàn thành đầy đủ bài tập; cần chủ động hơn trong giờ thảo luận để phát huy hết khả năng.',
        '[tên] học tập nghiêm túc, kết quả khá ổn định; cần ôn tập đều đặn thay vì chỉ ôn trước kỳ kiểm tra để điểm số vững hơn.',
        'Em tiếp thu bài khá nhanh, làm bài tập đúng yêu cầu; cần rèn thêm kỹ năng trình bày để bài làm rõ ràng và đầy đủ hơn.',
      ],
      dat: [
        'Em nắm được kiến thức cơ bản của môn học, hoàn thành được các nhiệm vụ theo yêu cầu; cần ôn tập thường xuyên hơn để nhớ bài lâu và tự tin hơn khi làm kiểm tra.',
        '[tên] đã có nhiều cố gắng trong học tập; cần tập trung hơn trong giờ học và ghi chép đầy đủ để theo kịp tiến độ của lớp.',
        'Em hiểu được nội dung chính của bài học; cần làm đủ bài tập về nhà và mạnh dạn hỏi khi chưa hiểu để kết quả tốt hơn.',
      ],
      chuadat: [
        'Em mới nắm được một phần kiến thức cơ bản, còn gặp khó khăn khi làm bài tập; cần ôn lại từng bài từ đầu, làm đủ bài tập về nhà và nhờ thầy cô giảng lại ngay phần chưa hiểu.',
        '[tên] cần dành thời gian học lại các kiến thức trọng tâm, hoàn thành bài tập theo yêu cầu của thầy cô và nhờ bạn bè kèm cặp thêm sau giờ học.',
        'Em chưa hoàn thành đủ nhiệm vụ học tập nên kết quả còn thấp; cần lập kế hoạch ôn tập mỗi ngày, bắt đầu từ những phần cơ bản nhất và kiên trì thực hiện.',
      ],
    },
  },
  trait: {
    'cham-chi': {
      manh: [
        'Em rất chăm chỉ, đi học đầy đủ, làm bài tập về nhà nghiêm túc và luôn nộp bài đúng hạn.',
        '[tên] có ý thức tự học tốt, thường xuyên ôn bài và chuẩn bị bài mới trước khi đến lớp.',
        'Em kiên trì với bài khó, không bỏ cuộc khi gặp bài tập chưa làm được mà tìm cách hỏi và tự tìm hiểu thêm.',
      ],
      'cai-thien': [
        'Em cần rèn thói quen học bài và làm bài tập mỗi ngày thay vì chỉ học khi sắp kiểm tra.',
        '[tên] cần chuẩn bị bài trước khi đến lớp và hoàn thành bài tập về nhà đầy đủ hơn để theo kịp các bạn.',
        'Em cần dành thời gian ôn lại bài cũ mỗi tối, bắt đầu từ 15 phút mỗi ngày và tăng dần khi đã quen.',
      ],
    },
    'hop-tac': {
      manh: [
        'Em hợp tác tốt với bạn bè, biết lắng nghe ý kiến của nhóm và hoàn thành phần việc được giao đúng hạn.',
        '[tên] là thành viên tích cực của nhóm, thường giúp bạn hiểu bài và cùng nhóm hoàn thành sản phẩm đúng yêu cầu.',
        'Em biết chia sẻ tài liệu và hỗ trợ bạn khi làm việc nhóm, được các bạn tin tưởng và quý mến.',
      ],
      'cai-thien': [
        'Em cần tham gia tích cực hơn khi làm việc nhóm, mạnh dạn nêu ý kiến và hoàn thành phần việc của mình đúng hạn.',
        '[tên] cần lắng nghe ý kiến của bạn nhiều hơn và cùng nhóm thống nhất cách làm thay vì làm riêng một mình.',
        'Em cần chủ động trao đổi với bạn trong giờ thảo luận nhóm để học hỏi thêm cách làm bài của bạn.',
      ],
    },
    'tu-tin': {
      manh: [
        'Em tự tin phát biểu ý kiến trước lớp, trình bày rõ ràng và trả lời câu hỏi của thầy cô mạch lạc.',
        '[tên] mạnh dạn xung phong làm bài trên bảng và trình bày sản phẩm nhóm một cách tự tin, lưu loát.',
        'Em không ngại nêu quan điểm khác với bạn, biết bảo vệ ý kiến của mình bằng lý lẽ rõ ràng.',
      ],
      'cai-thien': [
        'Em cần mạnh dạn hơn khi phát biểu trước lớp, bắt đầu từ việc trả lời câu hỏi ngắn và trình bày ý kiến trong nhóm nhỏ.',
        '[tên] hiểu bài nhưng còn ngại nói trước lớp; cần tập trình bày trước nhóm bạn trước rồi mới trình bày trước cả lớp.',
        'Em cần tin tưởng vào bản thân hơn khi làm bài, đừng xóa đáp án đúng chỉ vì thấy bạn làm khác mình.',
      ],
    },
    'ky-luat': {
      manh: [
        'Em chấp hành tốt nội quy trường lớp, đi học đúng giờ, giữ trật tự trong giờ học và bảo quản đồ dùng chung cẩn thận.',
        '[tên] có ý thức kỷ luật tốt, ngồi học nghiêm túc, không làm việc riêng và luôn tôn trọng thầy cô, bạn bè.',
        'Em là tấm gương về nề nếp cho các bạn: đúng giờ, chuẩn bị đầy đủ đồ dùng học tập và giữ gìn vệ sinh lớp học.',
      ],
      'cai-thien': [
        'Em cần đi học đúng giờ hơn và chuẩn bị đầy đủ đồ dùng học tập trước khi đến lớp.',
        '[tên] cần tập trung hơn trong giờ học, hạn chế nói chuyện riêng và ghi chép đầy đủ nội dung bài học.',
        'Em cần rèn thói quen ngồi học nghiêm túc, làm việc đúng yêu cầu của thầy cô và hoàn thành nhiệm vụ đúng thời gian quy định.',
      ],
    },
  },
  general: {
    tot: [
      '[tên] có kết quả học tập và rèn luyện tốt trong học kỳ này, hoàn thành xuất sắc các nhiệm vụ được giao và luôn tích cực tham gia hoạt động của lớp.',
      'Em học tập nghiêm túc, tiến bộ rõ rệt trong học kỳ này, được thầy cô và bạn bè tin tưởng; cần tiếp tục phát huy để giữ vững phong độ.',
      '[tên] là học sinh gương mẫu của lớp: học giỏi, chăm ngoan, hòa đồng với bạn bè và có ý thức trách nhiệm cao trong mọi hoạt động.',
    ],
    kha: [
      '[tên] có kết quả học tập khá trong học kỳ này, hoàn thành đầy đủ nhiệm vụ học tập; cần rèn thêm các bài tập vận dụng và chủ động phát biểu hơn để đạt kết quả cao hơn ở học kỳ tới.',
      'Em học tập nghiêm túc và có tiến bộ trong học kỳ này; cần chủ động hơn trong giờ học và rèn thêm tính tự tin khi trình bày ý kiến.',
      '[tên] chấp hành tốt nội quy, hòa đồng với bạn bè và có ý thức vươn lên trong học tập; cần ôn tập đều đặn để kết quả ổn định hơn.',
    ],
    dat: [
      '[tên] đã hoàn thành các nhiệm vụ học tập ở mức đạt trong học kỳ này; cần dành thêm thời gian ôn tập những môn còn yếu và làm đủ bài tập về nhà mỗi ngày.',
      'Em có nhiều cố gắng trong học tập và rèn luyện, hoàn thành được yêu cầu cơ bản của chương trình; cần ôn tập thường xuyên và mạnh dạn hỏi khi chưa hiểu bài.',
      '[tên] chấp hành nội quy trường lớp, hòa thuận với bạn bè; cần tập trung hơn trong giờ học và làm đủ bài tập về nhà để tiến bộ hơn ở học kỳ tới.',
    ],
    chuadat: [
      '[tên] chưa hoàn thành được yêu cầu của một số môn học trong học kỳ này; cần ôn lại kiến thức cơ bản, làm đủ bài tập về nhà và tranh thủ sự giúp đỡ của thầy cô, bạn bè để theo kịp lớp.',
      'Em cần thay đổi cách học trong học kỳ tới: học bài và làm bài tập mỗi ngày, ghi chép đầy đủ và hỏi ngay khi chưa hiểu thay vì để dồn lại.',
      '[tên] đã có một số cố gắng nhưng kết quả chưa đạt yêu cầu; cần kiên trì ôn tập từ những phần cơ bản nhất, thầy cô và gia đình sẽ cùng hỗ trợ em.',
    ],
  },
};

const SAMPLE_STUDENT = 'Nguyễn Văn An';

// Điền tên học sinh vào chỗ trống [tên]. Chưa có tên thì dùng "Em"
// (chỗ trống chỉ nằm ở vị trí chủ ngữ đầu câu nên vẫn đúng ngữ pháp).
function fillName(text, name) {
  const n = String(name == null ? '' : name).trim();
  const who = n || 'Em';
  return String(text).split('[tên]').join(who);
}

// Toàn bộ lời trong ngân hàng kèm thông tin ô (dùng cho bộ kiểm).
function allComments() {
  const out = [];
  Object.keys(BANK.subject).forEach((subject) => {
    Object.keys(BANK.subject[subject]).forEach((level) => {
      BANK.subject[subject][level].forEach((text) => {
        out.push({ text, group: 'subject', subject, level });
      });
    });
  });
  Object.keys(BANK.trait).forEach((trait) => {
    Object.keys(BANK.trait[trait]).forEach((side) => {
      BANK.trait[trait][side].forEach((text) => {
        out.push({ text, group: 'trait', trait, side });
      });
    });
  });
  Object.keys(BANK.general).forEach((level) => {
    BANK.general[level].forEach((text) => {
      out.push({ text, group: 'general', level });
    });
  });
  return out;
}

// Chọn 1 lời trong ô: ưu tiên lời chưa dùng (không có trong used),
// hết lời mới thì dùng lại từ đầu. rand: hàm ngẫu nhiên (mặc định
// Math.random; test truyền hàm có hạt giống để kiểm lại được).
function pickFrom(cell, used, rand) {
  const r = typeof rand === 'function' ? rand : Math.random;
  const fresh = (cell || []).filter((t) => !(used && used.has(t)));
  const pool = fresh.length ? fresh : (cell || []);
  if (!pool.length) return null;
  return pool[Math.floor(r() * pool.length)];
}

// Gợi ý lời nhận xét cho 1 học sinh.
// opts: { subject, level, strengths: [traitId], improvements:
//   [traitId], used: Set lời đã dùng }.
// Trả 3–5 lời: 1 lời theo môn + tối đa 4 lời về phẩm chất (theo
// điểm mạnh/cần cải thiện đã chọn) + 1 lời chung cuối kỳ khi còn
// chỗ. Mọi phẩm chất đã chọn đều có lời — không lặng lẽ bỏ bớt.
// chọn phẩm chất nào thì thêm lời theo môn khác cho đủ 3 lời.
function suggest(opts, rand) {
  const o = opts || {};
  const subject = BANK.subject[o.subject] ? o.subject : 'chung';
  const level = LEVEL_IDS.indexOf(o.level) >= 0 ? o.level : 'dat';
  const used = o.used || new Set();
  const out = [];
  const seen = new Set();

  function add(text, kind, label) {
    if (!text || seen.has(text)) return;
    seen.add(text);
    out.push({ text, kind, label });
  }

  const subjectCell = BANK.subject[subject][level];
  add(pickFrom(subjectCell, used, rand), 'mon', 'Theo môn');
  // Lời về phẩm chất: điểm mạnh trước, rồi cần cải thiện, tối đa 3.
  const traitJobs = [];
  (o.strengths || []).slice(0, 2).forEach((t) => {
    if (BANK.trait[t]) traitJobs.push({ trait: t, side: 'manh', kind: 'diem-manh', label: 'Điểm mạnh' });
  });
  (o.improvements || []).slice(0, 2).forEach((t) => {
    if (BANK.trait[t]) traitJobs.push({ trait: t, side: 'cai-thien', kind: 'can-cai-thien', label: 'Cần cải thiện' });
  });
  traitJobs.slice(0, 4).forEach((job) => {
    add(pickFrom(BANK.trait[job.trait][job.side], used, rand), job.kind, job.label);
  });
  // Lời chung cuối kỳ chỉ thêm khi còn chỗ (tối đa 5 lời) — 4 phẩm
  // chất đã chọn thì nhường chỗ cho phẩm chất, không bỏ bớt lựa chọn.
  if (out.length < 5) add(pickFrom(BANK.general[level], used, rand), 'chung', 'Nhận xét chung');
  // Chưa đủ 3 lời (không chọn phẩm chất nào): thêm lời theo môn khác,
  // ưu tiên lời chưa dùng (lỗi 20/11: bản cũ chỉ lọc theo seen nên
  // vẫn gợi lại câu đã dùng khi câu đó đứng đầu ô).
  if (out.length < 3) {
    const rest = subjectCell.filter((t) => !seen.has(t) && !used.has(t));
    const restAll = subjectCell.filter((t) => !seen.has(t));
    (rest.length ? rest : restAll).forEach((t) => {
      if (out.length < 3) add(t, 'mon', 'Theo môn');
    });
  }
  return out;
}

// Tên hiển thị có đánh số trùng tên ("Bùi Ngọc Lan (1)" / "(2)") —
// cùng quy tắc với UhGvClasses.displayNames và Sổ điểm.
function displayNames(names) {
  const counts = {};
  (names || []).forEach((n) => { counts[n] = (counts[n] || 0) + 1; });
  const seen = {};
  return (names || []).map((n) => {
    if (counts[n] <= 1) return n;
    seen[n] = (seen[n] || 0) + 1;
    return n + ' (' + seen[n] + ')';
  });
}

if (typeof window !== 'undefined') window.UH_NHANXET = { LEVELS, LEVEL_IDS, SUBJECTS, TRAITS, BANNED_WORDS, REMEDY_WORDS, BANK, SAMPLE_STUDENT, fillName, allComments, pickFrom, suggest, displayNames };
export { LEVELS, LEVEL_IDS, SUBJECTS, TRAITS, BANNED_WORDS, REMEDY_WORDS, BANK, SAMPLE_STUDENT, fillName, allComments, pickFrom, suggest, displayNames };
