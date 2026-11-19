// Ý nghĩa tên — phân tích từng chữ trong họ tên theo từ điển do tác giả tự soạn
// (150+ chữ tên tiếng Việt phổ biến, ý nghĩa tự viết, không copy từ điển có bản quyền).
// Chữ nào không có trong từ điển thì hiện "chưa có trong từ điển", không bịa.
export const meta = {
  id: 'y-nghia-ten',
  name: 'Ý nghĩa tên',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Tra ý nghĩa từng chữ trong họ tên: phân tích từng chữ theo từ điển tên tiếng Việt, tổng kết tính cách chung, chép và chia sẻ kết quả.',
  keywords: 'ý nghĩa tên, đặt tên, tên hay, giải nghĩa tên, tên con',
  icon: '📛',
  seoTitle: 'Ý nghĩa tên — Tra ý nghĩa từng chữ trong tên | Tiện Ích Hub',
  seoDesc: 'Nhập họ tên để xem ý nghĩa từng chữ, tổng kết tính cách chung theo tên. Từ điển 150+ chữ tên tiếng Việt phổ biến.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>📛 Ý nghĩa tên</h2><p class="muted">Nhập họ tên đầy đủ — công cụ phân tích ý nghĩa từng chữ và tổng kết nét tính cách chung của cái tên.</p></div>
    <div class="field"><label for="yt-name">Họ và tên</label><input id="yt-name" type="text" maxlength="60" placeholder="Ví dụ: Nguyễn Minh Tuấn"></div>
    <button id="yt-go" class="btn btn-primary" type="button">Xem ý nghĩa tên</button>
    <div id="yt-out" class="result"></div>
    <p class="note">Ý nghĩa mang tính tham khảo, giải trí. Chữ nào chưa có trong từ điển sẽ được ghi rõ, không tự suy diễn.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  // Từ điển chữ tên: khóa là chữ viết thường có dấu; ý nghĩa do tác giả tự viết.
  const DICT = {
    'an': 'Bình an, yên ổn — mong cuộc đời nhẹ nhàng, không sóng gió.',
    'anh': 'Người tài giỏi, sáng suốt; cũng là ánh sáng rực rỡ.',
    'ánh': 'Ánh sáng dịu dàng; người mang lại sự ấm áp cho xung quanh.',
    'băng': 'Băng giá trong trẻo; người thanh khiết, có khí chất lạnh lùng mà cuốn hút.',
    'bách': 'Cây bách vững chãi, sống lâu; mong con khỏe mạnh, trường thọ.',
    'bảo': 'Báu vật quý giá; đứa con là của báu của gia đình.',
    'bích': 'Ngọc bích xanh trong; người thanh cao, trong sáng.',
    'bình': 'Bình yên, hòa bình; người trầm ổn, biết giữ cân bằng.',
    'ca': 'Lời ca, tiếng hát; người vui vẻ, yêu đời, mang niềm vui đến cho người khác.',
    'cầm': 'Đàn cầm tao nhã; người có tâm hồn nghệ thuật, sống tinh tế.',
    'cát': 'Cát tường, may mắn; mong mọi việc thuận lợi, tốt lành.',
    'châu': 'Ngọc châu quý giá; người đẹp đẽ, được nâng niu.',
    'chi': 'Cành cây nhỏ vươn lên; người có chí, biết vươn tới mục tiêu.',
    'chiến': 'Chiến đấu kiên cường; người không ngại thử thách, càng khó càng mạnh.',
    'công': 'Công bằng, chính trực; người sống có nguyên tắc, được tin cậy.',
    'cúc': 'Hoa cúc thanh cao, nở muộn mà bền; người kiên nhẫn, sống thanh đạm.',
    'cường': 'Mạnh mẽ, cứng cỏi; người có ý chí và sức khỏe tốt.',
    'dao': 'Con dao sắc bén; người quyết đoán, nhanh nhạy trong mọi việc.',
    'diễm': 'Diễm lệ, xinh đẹp; người có nét đẹp nổi bật, duyên dáng.',
    'diệp': 'Lá cây xanh tươi; người tràn đầy sức sống, gần gũi thiên nhiên.',
    'diệu': 'Diệu kỳ, tuyệt vời; người có nét duyên đặc biệt, khó quên.',
    'doanh': 'Doanh nghiệp, kinh doanh; mong con giỏi làm ăn, sự nghiệp vững.',
    'duy': 'Duy nhất, độc đáo; người có cá tính riêng, suy nghĩ độc lập.',
    'duyên': 'Duyên dáng, có duyên; người dễ mến, gặp nhiều may mắn trong quan hệ.',
    'dũng': 'Dũng cảm, gan dạ; dám nghĩ dám làm, không ngại khó.',
    'dương': 'Ánh dương, mặt trời; người ấm áp, tích cực, tỏa năng lượng tốt.',
    'đan': 'Màu đỏ son, chân thành; người sống thật lòng, tình cảm sâu đậm.',
    'đạt': 'Đạt được mục tiêu; mong con thành công, toại nguyện trong đời.',
    'đăng': 'Ngọn đèn, ánh sáng; cũng là bước lên cao, thăng tiến.',
    'đào': 'Hoa đào mùa xuân; người xinh đẹp, mang không khí tươi mới.',
    'đức': 'Đạo đức, nhân hậu; người sống có nguyên tắc và được nể trọng.',
    'đông': 'Mùa đông lạnh giá; người trầm tĩnh, kiên cường qua gian khó.',
    'gia': 'Gia đình, nhà cửa; mong con là chỗ dựa ấm áp cho gia đình.',
    'giang': 'Dòng sông dài; người hiền hòa nhưng bền bỉ, đi xa.',
    'hà': 'Dòng sông; người dịu dàng, mềm mại mà sâu sắc.',
    'hải': 'Biển rộng mênh mông; người có tấm lòng bao dung, chí hướng lớn.',
    'hân': 'Hân hoan, vui mừng; người mang lại niềm vui cho mọi người.',
    'hạnh': 'Hạnh phúc, may mắn; mong đời sống đủ đầy, an vui.',
    'hằng': 'Mãi mãi, bền lâu; người chung thủy, kiên định.',
    'hậu': 'Hậu hĩnh, nhân hậu; người sống tốt bụng, có phúc về sau.',
    'hiền': 'Hiền lành, tốt bụng; người dễ gần, sống hòa nhã.',
    'hiếu': 'Hiếu thảo với cha mẹ; người sống có trước có sau, trọng tình nghĩa.',
    'hiệp': 'Hiệp nghĩa, đoàn kết; người biết kết nối mọi người, sống vì tập thể.',
    'hoa': 'Đóa hoa rực rỡ; người xinh đẹp, tươi tắn, mang niềm vui đến cho người khác.',
    'hoan': 'Hoan hỉ, vui vẻ; người lạc quan, luôn thấy mặt tốt của cuộc sống.',
    'hoàng': 'Màu vàng rực rỡ, vua chúa; người có khí chất cao quý, tài lãnh đạo.',
    'hòa': 'Hòa thuận, hòa hợp; người biết dung hòa, sống yên ấm với mọi người.',
    'hồng': 'Màu hồng tươi thắm; người trẻ trung, nồng ấm, đầy sức sống.',
    'huệ': 'Hoa huệ trắng tinh khôi; người thanh khiết, dịu dàng.',
    'hùng': 'Hùng mạnh, dũng cảm; người có chí lớn và bản lĩnh.',
    'hưng': 'Hưng thịnh, phát triển; mong sự nghiệp ngày càng đi lên.',
    'hương': 'Hương thơm dịu dàng; người nữ tính, được mọi người yêu mến.',
    'huy': 'Huy hoàng, rực rỡ; người có tài năng nổi bật.',
    'huỳnh': 'Ánh sáng vàng rực rỡ; người thông minh, tỏa sáng.',
    'hỷ': 'Niềm vui, hỷ sự; mong đời nhiều chuyện vui, may mắn.',
    'khang': 'Khỏe mạnh, an khang; mong thân thể tráng kiện, nhà cửa yên ấm.',
    'khanh': 'Khanh tướng, người tài; cũng là tiếng gọi thân thương, quý mến.',
    'khánh': 'Khánh tiết, niềm vui lớn; người mang lại tin vui cho gia đình.',
    'khải': 'Khải hoàn, chiến thắng; mong con thành công rực rỡ.',
    'khoa': 'Khoa bảng, học vấn; mong con học giỏi, đỗ đạt.',
    'khôi': 'Khôi ngô, tuấn tú; người có ngoại hình đẹp và phong thái đĩnh đạc.',
    'kiên': 'Kiên trì, bền bỉ; người không bỏ cuộc trước khó khăn.',
    'kiệt': 'Kiệt xuất, xuất sắc; người tài năng vượt trội trong đám đông.',
    'kim': 'Vàng, kim loại quý; người có giá trị, sáng chói và bền vững.',
    'kiều': 'Kiều diễm, xinh đẹp; người có vẻ đẹp mềm mại, duyên dáng.',
    'khuê': 'Khuê các, đoan trang; người nữ tính, nết na, được giáo dưỡng tốt.',
    'lam': 'Màu chàm dịu mát; người trầm lặng, sâu sắc.',
    'lan': 'Hoa lan thanh cao, quý phái; người có khí chất nhẹ nhàng mà sang trọng.',
    'lành': 'Lành lặn, tốt đẹp; mong đời bình an, gặp nhiều điều lành.',
    'liên': 'Hoa sen thanh khiết; người trong sáng, sống gần bùn mà không hôi tanh mùi bùn.',
    'liễu': 'Cây liễu mềm mại; người uyển chuyển, dịu dàng mà dẻo dai.',
    'linh': 'Linh hoạt, thông minh; người nhanh nhẹn, có trực giác tốt.',
    'loan': 'Chim loan cao quý; người sang trọng, có phúc khí.',
    'long': 'Rồng oai phong; người có khí phách, tham vọng và tài lãnh đạo.',
    'lộc': 'Lộc trời, tài lộc; mong làm ăn thuận lợi, sung túc.',
    'lực': 'Sức mạnh; người khỏe khoắn, làm việc gì cũng có sức bền.',
    'lương': 'Lương thiện, tốt lành; người sống tử tế, đáng tin.',
    'lý': 'Lý trí, lẽ phải; người suy nghĩ thấu đáo, sống có lý.',
    'lạc': 'Vui vẻ, an lạc; mong đời sống nhẹ nhàng, nhiều niềm vui.',
    'lâm': 'Rừng cây xanh tốt; người có sức sống mạnh, gần gũi thiên nhiên.',
    'lệ': 'Lệ, xinh đẹp diễm lệ; người giàu cảm xúc, tinh tế và sâu sắc.',
    'lễ': 'Lễ phép, lễ nghĩa; người biết kính trên nhường dưới.',
    'mai': 'Hoa mai thanh khiết, chịu lạnh giỏi; người kiên cường mà dịu dàng.',
    'mạnh': 'Mạnh mẽ, quyết liệt; người có bản lĩnh, dám đương đầu.',
    'minh': 'Sáng suốt, thông minh; như ánh nắng ban mai rõ ràng.',
    'my': 'Xinh đẹp (từ gốc "mỹ"); người có vẻ đẹp dịu dàng, đáng yêu.',
    'mỹ': 'Đẹp đẽ, mỹ miều; người có nhan sắc và tâm hồn đẹp.',
    'mộc': 'Cây cối, gỗ; người mộc mạc, chân thành, sống giản dị.',
    'na': 'Dịu dàng, nhỏ nhắn; người đáng yêu, được mọi người cưng chiều.',
    'nam': 'Phương nam ấm áp; người mạnh mẽ, thẳng thắn.',
    'nga': 'Chim nga thanh thoát; người duyên dáng, nhẹ nhàng.',
    'ngân': 'Ngân nga, bạc trắng; người trong trẻo, có giọng nói hay.',
    'nghĩa': 'Nghĩa khí, trọng tình nghĩa; người sống có trước có sau.',
    'ngọc': 'Viên ngọc quý; người trong sáng, có giá trị và được trân trọng.',
    'nguyên': 'Nguyên vẹn, ban đầu; người thuần khiết, giữ được bản chất tốt.',
    'nguyệt': 'Mặt trăng dịu dàng; người nữ tính, lãng mạn, sâu sắc.',
    'nha': 'Nha, mầm non; người trẻ trung, tràn đầy sức sống mới.',
    'nhan': 'Nhan sắc, gương mặt; người có vẻ ngoài ưa nhìn, duyên dáng.',
    'nhàn': 'Nhàn nhã, thảnh thơi; mong đời sống an nhàn, không bon chen.',
    'nhân': 'Nhân ái, yêu người; người sống có lòng thương, được yêu mến.',
    'nhật': 'Mặt trời; người rực rỡ, năng động, luôn hướng về phía trước.',
    'nhi': 'Nhỏ bé, đáng yêu; đứa con bé bỏng được cả nhà yêu thương.',
    'nhung': 'Nhung mềm mại; người dịu dàng, tinh tế, sống tình cảm.',
    'nhã': 'Nhã nhặn, thanh nhã; người có phong thái lịch sự, tinh tế.',
    'ninh': 'Yên ninh, bình yên; mong đời sống ổn định, không sóng gió.',
    'nữ': 'Người con gái; dịu dàng, đảm đang, là niềm tự hào của gia đình.',
    'oanh': 'Chim oanh hót hay; người có giọng nói ngọt ngào, vui vẻ.',
    'phong': 'Gió, phong độ; người phóng khoáng, tự do, có phong thái riêng.',
    'phú': 'Giàu có, sung túc; mong đời sống đủ đầy về vật chất.',
    'phúc': 'Phúc đức, may mắn; người mang phúc đến cho gia đình.',
    'phương': 'Phương hướng rõ ràng; người sống có mục tiêu, dịu dàng mà kiên định.',
    'phượng': 'Phượng hoàng cao quý; người sang trọng, tài hoa.',
    'quang': 'Ánh sáng; người thông minh, tỏa sáng và dẫn dắt người khác.',
    'quân': 'Quân tử, người lãnh đạo; người chính trực, có uy tín.',
    'quế': 'Cây quế thơm ngát; người có hương thơm riêng, được quý trọng.',
    'quyên': 'Chim quyên hót hay; người có tài ăn nói, duyên dáng.',
    'quý': 'Quý giá, sang trọng; người được trân trọng, có địa vị.',
    'quỳnh': 'Hoa quỳnh nở về đêm; người đẹp kín đáo, có chiều sâu.',
    'sang': 'Sang trọng, sáng sủa; người có khí chất cao quý.',
    'sen': 'Hoa sen thanh khiết; người sống trong sạch, giữ mình giữa đời xô bồ.',
    'son': 'Màu son đỏ tươi; người nồng nhiệt, chân thành, rực rỡ.',
    'sơn': 'Núi vững chãi; người kiên định, đáng tin cậy.',
    'sáng': 'Sáng sủa, thông minh; người có tư duy rõ ràng, lạc quan.',
    'sương': 'Sương mai trong trẻo; người mong manh mà tinh khiết.',
    'tâm': 'Tấm lòng, tâm hồn; người sống chân thành, coi trọng tình cảm.',
    'tài': 'Tài năng, tài lộc; người giỏi giang và có duyên với tiền bạc.',
    'thanh': 'Trong xanh, thanh khiết; người sống ngay thẳng, trong sáng.',
    'thành': 'Thành công, thành tựu; mong con đạt được những gì mong muốn.',
    'thảo': 'Cỏ thơm mềm mại; người hiền lành, gần gũi, sống chân thành.',
    'thi': 'Thơ ca; người lãng mạn, có tâm hồn nghệ sĩ.',
    'thiên': 'Trời cao rộng lớn; người có tầm nhìn xa, chí hướng lớn.',
    'thiện': 'Thiện lành, tốt bụng; người sống tử tế, hay giúp người.',
    'thịnh': 'Thịnh vượng, phát đạt; sự nghiệp ngày càng đi lên.',
    'thơ': 'Thơ mộng, lãng mạn; người giàu cảm xúc, yêu cái đẹp.',
    'thúy': 'Ngọc thúy xanh biếc; người trong sáng, dịu dàng.',
    'thu': 'Mùa thu dịu dàng; người trầm lắng, sâu sắc, lãng mạn.',
    'thư': 'Thư thái, thư thả; người sống nhẹ nhàng, không vội vã.',
    'thắng': 'Chiến thắng; mong con vượt qua mọi thử thách.',
    'thăng': 'Thăng tiến, đi lên; mong sự nghiệp ngày càng cao.',
    'thy': 'Cỏ thy thơm ngát; người nhỏ nhắn, dịu dàng mà cá tính.',
    'tiến': 'Tiến lên phía trước; người cầu tiến, không ngừng vươn lên.',
    'tin': 'Tin cậy, đáng tin; người giữ chữ tín, được mọi người tin tưởng.',
    'tinh': 'Ngôi sao, tinh túy; người tỏa sáng, có tài năng đặc biệt.',
    'tĩnh': 'Tĩnh lặng, bình yên; người trầm ổn, suy nghĩ sâu sắc.',
    'trinh': 'Trinh trắng, trong sạch; người sống ngay thẳng, giữ mình.',
    'tri': 'Trí tuệ; người thông minh, ham học hỏi (thường viết là Trí).',
    'trí': 'Trí tuệ, thông minh; người sáng suốt, ham học hỏi.',
    'trung': 'Trung thành, trung thực; người đáng tin, sống có trước có sau.',
    'trâm': 'Cây trâm cài tóc; người duyên dáng, quý phái.',
    'trang': 'Trang nhã, đoan trang; người có phong thái thanh lịch.',
    'trúc': 'Cây trúc thẳng thắn, kiên cường; người chính trực, không khuất phục.',
    'trầm': 'Trầm hương quý hiếm; người sâu sắc, càng tiếp xúc càng quý.',
    'tuân': 'Tuân thủ, nghe lời; người sống có kỷ luật, đáng tin.',
    'tuy': 'Tuyệt vời, tùy duyên; người sống nhẹ nhàng, biết thích nghi.',
    'tuyết': 'Tuyết trắng tinh khôi; người trong sáng, thanh cao.',
    'tuyền': 'Suối trong mát; người dịu dàng, trong trẻo, mang lại cảm giác yên bình.',
    'tuấn': 'Tuấn tú, tài giỏi; người có dáng vẻ khôi ngô, làm việc gọn gàng.',
    'tuệ': 'Tuệ giác, thông tuệ; người sáng suốt, hiểu biết sâu sắc.',
    'tùng': 'Cây tùng vững chãi giữa gió sương; người kiên cường, sống thọ.',
    'tường': 'Tường tận, tốt lành; mong mọi việc rõ ràng, thuận lợi.',
    'tân': 'Mới mẻ, tân tiến; người trẻ trung, luôn đổi mới.',
    'tín': 'Chữ tín, đáng tin cậy; người giữ lời hứa, được nể trọng.',
    'tú': 'Tú tài, đẹp đẽ; người tài hoa, có vẻ ngoài ưa nhìn.',
    'uyên': 'Uyên bác, sâu rộng; người học sâu hiểu rộng, trầm tĩnh.',
    'vinh': 'Vinh quang, vẻ vang; mong thành công rạng danh gia đình.',
    'việt': 'Việt Nam, vượt trội; người có chí vươn xa, làm rạng danh quê hương.',
    'vân': 'Mây trời nhẹ nhàng; người thanh thoát, lãng mạn.',
    'văn': 'Văn chương, học vấn; người ham học, có tài viết lách.',
    'vũ': 'Mưa rào tươi mát; cũng là võ nghệ mạnh mẽ, oai phong.',
    'vượng': 'Vượng phát, thịnh vượng; mong làm ăn phát đạt, gia đạo hưng thịnh.',
    'vy': 'Vy, dây leo xanh tốt; người nhỏ nhắn, dẻo dai, tràn đầy sức sống.',
    'võ': 'Võ nghệ, mạnh mẽ; người khỏe khoắn, dũng cảm.',
    'xuân': 'Mùa xuân tươi mới; người trẻ trung, tràn đầy sức sống.',
    'xuyên': 'Xuyên suốt, thông suốt; người suy nghĩ thấu đáo, làm việc trôi chảy.',
    'yên': 'Yên bình, yên ổn; mong đời sống nhẹ nhàng, không sóng gió.',
    'yến': 'Chim yến nhanh nhẹn; người duyên dáng, mang tin vui về nhà.',
    'đình': 'Đình, sân đình trang trọng; người đĩnh đạc, có uy.',
  };
  // Nhóm chủ đề để tổng kết tính cách chung.
  const THEMES = [
    { name: 'trí tuệ và ánh sáng', words: ['minh', 'quang', 'huy', 'trí', 'tuệ', 'sáng', 'anh', 'ánh', 'tinh', 'nhật', 'đăng', 'khoa', 'văn', 'uyên'] },
    { name: 'bình an và yên ấm', words: ['an', 'bình', 'yên', 'tĩnh', 'nhàn', 'hòa', 'ninh', 'lành', 'thư'] },
    { name: 'phú quý và thành công', words: ['phúc', 'lộc', 'tài', 'phú', 'quý', 'vinh', 'thịnh', 'đạt', 'thành', 'vượng', 'hưng', 'thăng', 'tiến', 'thắng'] },
    { name: 'thiên nhiên và vẻ đẹp', words: ['hoa', 'lan', 'mai', 'trúc', 'tùng', 'sơn', 'hải', 'giang', 'hồng', 'cúc', 'đào', 'sen', 'liên', 'huệ', 'quỳnh', 'trâm', 'vân', 'tuyết', 'sương', 'phượng', 'yến', 'xuân', 'thu', 'đông'] },
    { name: 'đức hạnh và tình nghĩa', words: ['đức', 'nhân', 'nghĩa', 'hiếu', 'tín', 'tâm', 'thiện', 'trung', 'lễ', 'hiền', 'hậu', 'lương'] },
    { name: 'mạnh mẽ và bản lĩnh', words: ['hùng', 'dũng', 'mạnh', 'kiên', 'cường', 'long', 'quân', 'chiến', 'võ', 'kiệt', 'khôi', 'lực'] },
  ];
  let lastShareText = '';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
  }
  function lookup(word, exactOnly) {
    const exact = DICT[word.toLowerCase()];
    if (exact) return exact;
    if (exactOnly) return null; // chữ họ: chỉ nhận khớp đúng dấu (tránh "Nguyễn" bị hiểu thành "nguyên")
    const n = norm(word);
    const keys = Object.keys(DICT);
    for (let i = 0; i < keys.length; i++) {
      if (norm(keys[i]) === n) return DICT[keys[i]];
    }
    return null;
  }

  function show() {
    const out = $('yt-out');
    const raw = $('yt-name').value.trim();
    if (!raw) { out.innerHTML = '<p class="error">Nhập họ tên rồi bấm xem nhé.</p>'; return; }
    const words = raw.split(/\s+/).filter(Boolean);
    if (words.length < 2) { out.innerHTML = '<p class="error">Nhập ít nhất họ và tên (2 chữ trở lên).</p>'; return; }
    let h = '';
    let found = 0;
    const themeCount = {};
    const lines = [];
    words.forEach((w, i) => {
      const meaning = lookup(w, i === 0);
      const role = i === 0 ? ' (họ)' : '';
      if (meaning) {
        found++;
        const n = norm(w);
        THEMES.forEach((t) => { if (t.words.indexOf(n) !== -1) themeCount[t.name] = (themeCount[t.name] || 0) + 1; });
        h += '<div class="result-row"><span><strong>' + esc(w) + '</strong>' + role + '</span><span>' + esc(meaning) + '</span></div>';
        lines.push(w + ': ' + meaning);
      } else {
        h += '<div class="result-row"><span><strong>' + esc(w) + '</strong>' + role + '</span><span class="muted">Chưa có trong từ điển.</span></div>';
        lines.push(w + ': chưa có trong từ điển');
      }
    });
    // Tổng kết theo chủ đề nổi bật nhất.
    const themes = Object.keys(themeCount).sort((a, b) => themeCount[b] - themeCount[a]);
    let summary = '';
    if (found === 0) {
      summary = 'Các chữ trong tên này chưa có trong từ điển nên chưa tổng kết được. Thử tên khác nhé!';
    } else if (themes.length === 0) {
      summary = 'Cái tên này mang nhiều nét riêng, khó gói gọn trong một nhóm tính cách — mỗi chữ đều có ý nghĩa đẹp riêng.';
    } else if (themes.length === 1) {
      summary = 'Nhìn chung, cái tên này nghiêng về ' + themes[0] + ' — đó là nét nổi bật nhất mà tên gửi gắm.';
    } else {
      summary = 'Nhìn chung, cái tên này hòa quyện ' + themes[0] + ' với ' + themes[1] + ' — vừa có chiều sâu vừa có sự cân bằng.';
    }
    h += '<p><strong>Tổng kết:</strong> ' + esc(summary) + '</p>';
    h += '<button id="yt-copy" class="btn btn-ghost copy-btn" type="button">Chép kết quả</button> '
      + '<button id="yt-share" class="btn btn-ghost" type="button">Chia sẻ</button>'
      + '<p id="yt-msg" class="muted"></p>';
    out.innerHTML = h;
    lastShareText = 'Ý nghĩa tên ' + raw + ':\n' + lines.join('\n') + '\n' + summary + '\n(Tra tại Tiện Ích Hub)';
    $('yt-copy').addEventListener('click', async () => {
      const msgEl = $('yt-msg');
      try { await navigator.clipboard.writeText(lastShareText); msgEl.textContent = 'Đã chép kết quả!'; }
      catch (e) { msgEl.textContent = 'Không chép được — hãy chọn và chép tay nhé.'; }
    });
    $('yt-share').addEventListener('click', async () => {
      const msgEl = $('yt-msg');
      if (navigator.share) {
        try { await navigator.share({ title: 'Ý nghĩa tên ' + raw, text: lastShareText }); msgEl.textContent = ''; }
        catch (e) { /* người dùng hủy */ }
      } else {
        try { await navigator.clipboard.writeText(lastShareText); msgEl.textContent = 'Máy này không có chia sẻ nhanh — đã chép kết quả để bạn dán!'; }
        catch (e) { msgEl.textContent = 'Không chia sẻ được — hãy chép tay kết quả nhé.'; }
      }
    });
  }

  $('yt-go').addEventListener('click', show);
}
