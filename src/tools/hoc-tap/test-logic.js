// Test logic 10 câu trắc nghiệm, xáo trộn thứ tự, chấm điểm + giải thích.
export const meta = {
  id: 'test-logic',
  name: 'Test logic 10 câu',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Bài test logic 10 câu hỏi trắc nghiệm ngắn: dãy số, suy luận, đố mẹo toán học — chấm điểm ngay kèm đáp án và giải thích từng câu.',
  keywords: 'test logic, test iq, câu đố logic, trắc nghiệm logic, bài test tư duy, đố vui toán học',
  icon: '🧠',
  seoTitle: 'Test logic 10 câu — trắc nghiệm tư duy có đáp án & giải thích',
  seoDesc: 'Làm bài test logic 10 câu miễn phí: dãy số, suy luận, đố mẹo. Chấm điểm ngay, xem đáp án và giải thích chi tiết từng câu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">10 câu đố logic ngắn — chọn 1 đáp án cho mỗi câu rồi bấm "Chấm điểm" để xem kết quả và giải thích.</p>
  </div>
  <div id="logic-quiz"></div>
  <button type="button" class="btn btn-primary" id="logic-submit">Chấm điểm</button>
  <button type="button" class="btn btn-ghost" id="logic-retry">Làm lại (xáo trộn câu hỏi)</button>
  <div id="logic-out"></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  const QUESTIONS = [
    { q: 'Dãy số: 2, 6, 12, 20, 30, … Số tiếp theo là số nào?', opts: ['36', '40', '42', '44'], a: 2, why: 'Hiệu giữa các số tăng dần: 4, 6, 8, 10, rồi 12. Vậy số tiếp theo là 30 + 12 = 42.' },
    { q: 'Tất cả mèo đều là động vật. Mướp là một con mèo. Kết luận nào chắc chắn đúng?', opts: ['Mướp là động vật', 'Mọi động vật đều là mèo', 'Mướp không phải động vật', 'Không kết luận được gì'], a: 0, why: 'Mướp thuộc nhóm "mèo", mà mọi con mèo đều thuộc nhóm "động vật" — nên Mướp là động vật. Chiều ngược lại (mọi động vật là mèo) thì sai.' },
    { q: 'An chạy nhanh hơn Bình. Bình chạy nhanh hơn Cường. Ai chạy chậm nhất?', opts: ['An', 'Bình', 'Cường', 'Không xác định được'], a: 2, why: 'Thứ tự tốc độ: An > Bình > Cường, nên Cường chạy chậm nhất.' },
    { q: 'Hôm nay là thứ tư. 10 ngày nữa là thứ mấy?', opts: ['Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'], a: 2, why: '10 ngày = 1 tuần (7 ngày) + 3 ngày. Sau 1 tuần vẫn là thứ tư, cộng thêm 3 ngày nữa là thứ bảy.' },
    { q: 'Có 8 quả bóng giống hệt nhau, trong đó 1 quả nặng hơn 7 quả còn lại. Dùng cân thăng bằng, cần ít nhất mấy lần cân để tìm ra quả nặng?', opts: ['1 lần', '2 lần', '3 lần', '4 lần'], a: 1, why: 'Lần 1: cân 3 quả với 3 quả. Nếu cân bằng, quả nặng nằm trong 2 quả còn lại — cân 1 lần nữa là xong. Nếu lệch, cân 2 trong 3 quả ở đĩa nặng hơn là tìm ra. Tổng cộng 2 lần.' },
    { q: '5 máy làm 5 sản phẩm trong 5 phút. 100 máy làm 100 sản phẩm trong bao lâu?', opts: ['5 phút', '20 phút', '100 phút', '500 phút'], a: 0, why: 'Mỗi máy làm 1 sản phẩm trong 5 phút. 100 máy làm song song thì 100 sản phẩm vẫn chỉ mất 5 phút.' },
    { q: 'Số nào KHÔNG thuộc nhóm: 2, 3, 5, 7, 9, 11?', opts: ['2', '7', '9', '11'], a: 2, why: '2, 3, 5, 7, 11 đều là số nguyên tố; chỉ có 9 là hợp số (9 = 3 × 3).' },
    { q: 'Một con ốc sên leo giếng sâu 10 m. Ban ngày nó leo lên 3 m, ban đêm tụt xuống 2 m. Sau mấy ngày nó lên tới miệng giếng?', opts: ['5 ngày', '8 ngày', '10 ngày', '12 ngày'], a: 1, why: 'Mỗi ngày ốc tiến thực 1 m, nhưng ngày cuối không bị tụt nữa. Sau 7 ngày ốc ở độ cao 7 m; ngày thứ 8 leo thêm 3 m là tới miệng giếng (10 m).' },
    { q: 'Anh hơn em 4 tuổi. 5 năm nữa, anh hơn em mấy tuổi?', opts: ['4 tuổi', '5 tuổi', '9 tuổi', '1 tuổi'], a: 0, why: 'Cả hai cùng già thêm 5 tuổi nên hiệu số tuổi không đổi — vẫn hơn 4 tuổi.' },
    { q: 'Dãy chữ: A, C, F, J, O, … Chữ tiếp theo là chữ nào?', opts: ['S', 'T', 'U', 'V'], a: 2, why: 'Bước nhảy tăng dần: A → C (+2), C → F (+3), F → J (+4), J → O (+5), O → U (+6).' },
  ];

  let order = [];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function render() {
    order = shuffle(QUESTIONS.map((_, i) => i));
    const html = order.map((qi, pos) => {
      const q = QUESTIONS[qi];
      const opts = q.opts.map((o, oi) =>
        '<div class="field"><label><input type="radio" name="logic-q' + pos + '" value="' + oi + '"> ' + o + '</label></div>'
      ).join('');
      return '<div class="tool-panel"><p><strong>Câu ' + (pos + 1) + ':</strong> ' + q.q + '</p>' + opts + '</div>';
    }).join('');
    $('logic-quiz').innerHTML = html;
    $('logic-out').innerHTML = '';
  }

  function grade() {
    let score = 0;
    let unanswered = 0;
    const details = order.map((qi, pos) => {
      const q = QUESTIONS[qi];
      const checked = root.querySelector('input[name="logic-q' + pos + '"]:checked');
      if (!checked) { unanswered++; return '<div class="result-row"><span>Câu ' + (pos + 1) + ': ' + q.q + '</span><strong>Chưa trả lời — đáp án: ' + q.opts[q.a] + '</strong></div><p class="muted">' + q.why + '</p>'; }
      const chosen = parseInt(checked.value, 10);
      const ok = chosen === q.a;
      if (ok) score++;
      return '<div class="result-row"><span>Câu ' + (pos + 1) + ': ' + q.q + '</span><strong>' + (ok ? '✓ Đúng' : '✗ Sai — bạn chọn "' + q.opts[chosen] + '", đáp án: "' + q.opts[q.a] + '"') + '</strong></div><p class="muted">' + q.why + '</p>';
    }).join('');
    let rank;
    if (score >= 9) rank = 'Xuất sắc — tư duy logic rất tốt!';
    else if (score >= 7) rank = 'Rất tốt — bạn suy luận nhanh và chính xác.';
    else if (score >= 5) rank = 'Khá — nắm được phần lớn dạng suy luận cơ bản.';
    else if (score >= 3) rank = 'Trung bình — luyện thêm các dạng dãy số và đố mẹo nhé.';
    else rank = 'Cần luyện thêm — đọc kỹ giải thích từng câu rồi làm lại nhé.';
    $('logic-out').innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${score}/10</div><div class="stat-label">${rank}</div></div>
  ${unanswered > 0 ? '<p class="error">Bạn còn ' + unanswered + ' câu chưa trả lời.</p>' : ''}
  ${details}
</div>`;
    $('logic-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('logic-submit').addEventListener('click', grade);
  $('logic-retry').addEventListener('click', render);
  render();
}
