// Quiz tính cách 8 câu — mỗi câu 4 lựa chọn, chấm theo 4 nhóm tính cách:
// Nhà Lãnh Đạo, Người Sáng Tạo, Người Hòa Giải, Người Phân Tích.
// Kết quả kèm điểm từng nhóm + nút chép/chia sẻ. Chỉ mang tính giải trí.
export const meta = {
  id: 'quiz-tinh-cach',
  name: 'Quiz tính cách 8 câu',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Trắc nghiệm vui 8 câu hỏi, khám phá bạn thuộc nhóm tính cách nào: Nhà Lãnh Đạo, Người Sáng Tạo, Người Hòa Giải hay Người Phân Tích.',
  keywords: 'quiz tính cách, trắc nghiệm tính cách, khám phá bản thân, quiz vui',
  icon: '🧩',
  seoTitle: 'Quiz tính cách 8 câu — Bạn thuộc nhóm tính cách nào? | Tiện Ích Hub',
  seoDesc: 'Làm quiz vui 8 câu hỏi để khám phá nhóm tính cách của bạn: Nhà Lãnh Đạo, Người Sáng Tạo, Người Hòa Giải hay Người Phân Tích.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>🧩 Quiz tính cách 8 câu</h2><p class="muted">Chọn đáp án đúng với bạn nhất — không có đáp án đúng hay sai, chỉ có đáp án giống bạn nhất!</p></div>
    <div id="qc-quiz"></div>
    <div id="qc-out" class="result"></div>
    <p class="note">Quiz vui, chỉ mang tính giải trí — không phải công cụ đánh giá tâm lý chuyên môn.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  // Nhóm: L = Nhà Lãnh Đạo, C = Người Sáng Tạo, H = Người Hòa Giải, A = Người Phân Tích.
  const GROUPS = {
    L: { name: 'Nhà Lãnh Đạo', desc: 'Bạn quyết đoán, thích dẫn dắt và chịu trách nhiệm. Người khác tin tưởng đi theo bạn vì bạn rõ ràng và dám quyết. Nhớ lắng nghe nhiều hơn một chút — một lãnh đạo giỏi là người biết nghe.' },
    C: { name: 'Người Sáng Tạo', desc: 'Bạn giàu trí tưởng tượng, thích cái mới và ghét khuôn mẫu. Ý tưởng của bạn thường đi trước người khác một bước. Chỉ cần thêm chút kỷ luật để biến ý tưởng thành thành quả.' },
    H: { name: 'Người Hòa Giải', desc: 'Bạn ấm áp, biết lắng nghe và là chất keo gắn kết mọi người. Ai cũng muốn tâm sự với bạn. Nhớ dành thời gian cho chính mình nữa — người hay chăm sóc người khác cũng cần được chăm sóc.' },
    A: { name: 'Người Phân Tích', desc: 'Bạn logic, tỉ mỉ và suy nghĩ thấu đáo trước khi quyết định. Mọi người tìm đến bạn khi cần một cái đầu lạnh. Đôi khi hãy tin vào trực giác — không phải chuyện gì cũng cần tính toán hết.' },
  };
  const QUESTIONS = [
    { q: 'Sáng cuối tuần rảnh rỗi, bạn thích làm gì nhất?', opts: [
      ['Lên kế hoạch cho cả tuần tới, sắp xếp mọi việc gọn gàng.', 'L'],
      ['Thử một món ăn mới, đi một nơi chưa từng đến.', 'C'],
      ['Gặp gỡ bạn bè, người thân, trò chuyện thoải mái.', 'H'],
      ['Đọc sách, nghiên cứu một chủ đề mình đang tò mò.', 'A'],
    ] },
    { q: 'Trong nhóm làm việc, bạn thường là người…', opts: [
      ['Đứng ra phân công, chốt hướng đi cho cả nhóm.', 'L'],
      ['Nảy ra ý tưởng lạ mà không ai nghĩ tới.', 'C'],
      ['Giữ không khí vui vẻ, giúp mọi người hòa hợp.', 'H'],
      ['Kiểm tra số liệu, phát hiện lỗi mà người khác bỏ sót.', 'A'],
    ] },
    { q: 'Khi gặp một vấn đề khó, bạn làm gì đầu tiên?', opts: [
      ['Quyết ngay một hướng đi rồi vừa làm vừa chỉnh.', 'L'],
      ['Nghĩ ra nhiều cách giải khác nhau, kể cả cách lạ.', 'C'],
      ['Hỏi ý kiến người xung quanh để có thêm góc nhìn.', 'H'],
      ['Thu thập thông tin, phân tích kỹ rồi mới quyết.', 'A'],
    ] },
    { q: 'Bạn bè thường khen bạn ở điểm nào nhất?', opts: [
      ['Quyết đoán, đáng tin, nói là làm.', 'L'],
      ['Sáng tạo, thú vị, luôn có ý tưởng hay.', 'C'],
      ['Tốt bụng, biết lắng nghe, dễ gần.', 'H'],
      ['Thông minh, tỉ mỉ, suy nghĩ thấu đáo.', 'A'],
    ] },
    { q: 'Nếu được chọn một kỳ nghỉ mơ ước, bạn chọn…', opts: [
      ['Chuyến đi có lịch trình rõ ràng, khám phá nhiều điểm nổi tiếng.', 'L'],
      ['Đi đâu cũng được, miễn là chỗ mới lạ, chưa ai đến.', 'C'],
      ['Đi cùng gia đình, bạn bè — vui là chính, đi đâu không quan trọng.', 'H'],
      ['Một nơi yên tĩnh để đọc sách, suy ngẫm, nạp lại năng lượng.', 'A'],
    ] },
    { q: 'Khi có mâu thuẫn với ai đó, bạn thường…', opts: [
      ['Nói thẳng vấn đề, cùng nhau tìm cách giải quyết nhanh.', 'L'],
      ['Tìm một cách giải quyết bất ngờ mà cả hai đều hài lòng.', 'C'],
      ['Nhường một bước để giữ hòa khí, chuyện gì rồi cũng qua.', 'H'],
      ['Im lặng suy nghĩ xem ai đúng ai sai rồi mới nói chuyện.', 'A'],
    ] },
    { q: 'Món đồ bạn hay mua sắm nhất là…', opts: [
      ['Đồ dùng chất lượng tốt, dùng được lâu, đáng đồng tiền.', 'L'],
      ['Đồ độc lạ, có thiết kế khác biệt, nhìn là thích.', 'C'],
      ['Quà tặng cho người thân, bạn bè.', 'H'],
      ['Sách, đồ công nghệ, đồ giúp làm việc hiệu quả hơn.', 'A'],
    ] },
    { q: 'Câu nói nào giống bạn nhất?', opts: [
      ['"Làm đi, đừng chờ đợi hoàn hảo."', 'L'],
      ['"Sao không thử một cách hoàn toàn khác?"', 'C'],
      ['"Mọi người vui là mình vui."', 'H'],
      ['"Hiểu rõ rồi hãy quyết định."', 'A'],
    ] },
  ];
  let lastShareText = '';
  const answers = new Array(QUESTIONS.length).fill(null);

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderQuiz() {
    let h = '';
    QUESTIONS.forEach((item, qi) => {
      h += '<div class="tool-panel"><p><strong>Câu ' + (qi + 1) + ':</strong> ' + esc(item.q) + '</p>';
      item.opts.forEach((opt, oi) => {
        const checked = answers[qi] === oi ? ' checked' : '';
        h += '<div class="field"><label><input type="radio" name="qc-q' + qi + '" value="' + oi + '"' + checked + '> ' + esc(opt[0]) + '</label></div>';
      });
      h += '</div>';
    });
    h += '<button id="qc-go" class="btn btn-primary" type="button">Xem kết quả</button>';
    $('qc-quiz').innerHTML = h;
    QUESTIONS.forEach((item, qi) => {
      const radios = root.querySelectorAll('input[name="qc-q' + qi + '"]');
      radios.forEach((radio) => {
        radio.addEventListener('change', () => { answers[qi] = parseInt(radio.value, 10); });
      });
    });
    $('qc-go').addEventListener('click', showResult);
  }

  function showResult() {
    const out = $('qc-out');
    const missing = [];
    answers.forEach((a, i) => { if (a === null) missing.push(i + 1); });
    if (missing.length) {
      out.innerHTML = '<p class="error">Bạn chưa trả lời câu ' + missing.join(', ') + '. Trả lời hết 8 câu rồi xem kết quả nhé!</p>';
      return;
    }
    const scores = { L: 0, C: 0, H: 0, A: 0 };
    QUESTIONS.forEach((item, qi) => { scores[item.opts[answers[qi]][1]]++; });
    const order = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const top = order[0];
    const g = GROUPS[top];
    let h = '<div class="result-row"><span>Bạn thuộc nhóm</span><strong>' + g.name + '</strong></div>'
      + '<p>' + g.desc + '</p>'
      + '<p><strong>Điểm từng nhóm (tối đa 8):</strong></p>';
    order.forEach((k) => {
      h += '<div class="result-row"><span>' + GROUPS[k].name + '</span><strong>' + scores[k] + '/8</strong></div>';
    });
    h += '<button id="qc-copy" class="btn btn-ghost copy-btn" type="button">Chép kết quả</button> '
      + '<button id="qc-share" class="btn btn-ghost" type="button">Chia sẻ</button>'
      + '<button id="qc-again" class="btn btn-ghost" type="button">Làm lại</button>'
      + '<p id="qc-msg" class="muted"></p>';
    out.innerHTML = h;
    lastShareText = 'Quiz tính cách: Mình thuộc nhóm ' + g.name + '! (Lãnh đạo ' + scores.L + '/8, Sáng tạo ' + scores.C + '/8, Hòa giải ' + scores.H + '/8, Phân tích ' + scores.A + '/8). Làm quiz tại Tiện Ích Hub.';
    $('qc-copy').addEventListener('click', async () => {
      const msgEl = $('qc-msg');
      try { await navigator.clipboard.writeText(lastShareText); msgEl.textContent = 'Đã chép kết quả!'; }
      catch (e) { msgEl.textContent = 'Không chép được — hãy chọn và chép tay nhé.'; }
    });
    $('qc-share').addEventListener('click', async () => {
      const msgEl = $('qc-msg');
      if (navigator.share) {
        try { await navigator.share({ title: 'Quiz tính cách', text: lastShareText }); msgEl.textContent = ''; }
        catch (e) { /* người dùng hủy */ }
      } else {
        try { await navigator.clipboard.writeText(lastShareText); msgEl.textContent = 'Máy này không có chia sẻ nhanh — đã chép kết quả để bạn dán!'; }
        catch (e) { msgEl.textContent = 'Không chia sẻ được — hãy chép tay kết quả nhé.'; }
      }
    });
    $('qc-again').addEventListener('click', () => {
      for (let i = 0; i < answers.length; i++) answers[i] = null;
      out.innerHTML = '';
      renderQuiz();
    });
  }

  renderQuiz();
}
