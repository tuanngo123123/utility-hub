// Trộn đề trắc nghiệm — logic thuần (tách đề, trộn, bảng đáp án,
// xuất văn bản/Word). Một nguồn duy nhất cho cả trang công cụ
// (build.mjs chèn file này vào trang, trừ dòng export cuối, để
// init() gọi qua window.UH_TRONDE) và bộ kiểm
// scripts/test-tron-de.mjs — công thức trên trang và trong test là
// một, theo đúng mẫu src/money-formulas.js.
//
// QUY ƯỚC ĐỊNH DẠNG NHẬP (theo cách giáo viên soạn đề trắc nghiệm
// phổ thông ở VN: 4 lựa chọn A/B/C/D, mã đề 3 chữ số 101–108, bảng
// đáp án dạng Câu → chữ cái — đối chiếu đề mẫu trên soandethi.com
// và lib24.vn, 20/11/2026):
// - Mỗi câu hỏi là 1 khối: dòng câu hỏi, rồi các dòng đáp án.
// - Dòng câu hỏi có thể bắt đầu bằng "Câu 1." / "1." / "1)" —
//   tiền tố số được bỏ. Khối mới cũng bắt đầu khi gặp dòng "Câu N."
//   (kể cả không có dòng trống ngăn cách). Các khối không có tiền
//   tố thì cách nhau bằng dòng trống; dòng trống GIỮA các đáp án
//   của cùng 1 câu (văn bản từ Word thường cách mỗi đoạn 1 dòng
//   trống — mammoth trả về mỗi đoạn cách nhau \n\n) KHÔNG tách
//   khối: khối chỉ đóng khi dòng trống đứng sau đáp án mà dòng
//   tiếp theo không phải đáp án nữa.
// - Dòng đáp án: "A. ..." / "A) ..." / "A: ..." (chữ A–E).
// - Đáp án đúng đánh dấu * ở đầu dòng hoặc ngay sau chữ cái:
//   "*B. Hà Nội" hoặc "B. *Hà Nội" đều được.
// - Dòng thường (không phải câu hỏi, không phải đáp án) nối vào
//   câu hỏi nếu câu chưa có đáp án, nối vào đáp án cuối nếu đã có
//   đáp án — câu hỏi/đáp án nhiều dòng vẫn đọc đúng.
// - Câu hợp lệ: có nội dung + ít nhất 2 đáp án (tối đa 5) + đúng
//   1 đáp án đúng. Câu không hợp lệ bị loại khỏi đợt trộn và báo rõ
//   lý do; câu có số đáp án khác 4 chỉ bị cảnh báo (vẫn trộn được).

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const Q_START_RE = /^(?:Câu\s*\d+\s*[.:)]?|(\d{1,3})\s*[.)])\s+(.+)$/i;
// Đáp án: dấu * trước chữ cái, hoặc sau dấu chấm/ngoặc của chữ cái.
const OPT_RE = /^(\*)?\s*([A-Ea-e])\s*[.):]\s*(\*)?\s*(.+)$/;

function cleanLine(s) {
  return String(s == null ? '' : s).replace(/\u00a0/g, ' ').trim();
}

// Tách văn bản đề thành các khối câu hỏi. Mỗi câu trả về:
// { index, q, options: [{text, correct, letter}], correctIndex,
//   errors: [], warnings: [] }. Câu hợp lệ khi errors rỗng.
function parseExam(text) {
  const lines = String(text == null ? '' : text).split(/\r?\n/);
  const blocks = [];
  let cur = null;

  function flush() {
    if (cur && (cur.qLines.length || cur.options.length)) blocks.push(cur);
    cur = null;
  }
  function ensureBlock() {
    if (!cur) cur = { qLines: [], options: [] };
    return cur;
  }
  // Dòng không trống tiếp theo sau vị trí i (để quyết định dòng
  // trống có tách khối không) — null nếu hết văn bản.
  function nextNonBlank(i) {
    for (let j = i + 1; j < lines.length; j++) {
      const t = cleanLine(lines[j]);
      if (t) return t;
    }
    return null;
  }

  for (let li = 0; li < lines.length; li++) {
    const line = cleanLine(lines[li]);
    if (!line) {
      // Dòng trống chỉ đóng khối khi khối đã có đáp án VÀ dòng
      // tiếp theo không phải đáp án nữa (tức đã hết câu này).
      // Dòng trống giữa các đáp án của cùng 1 câu (văn bản từ
      // Word) thì bỏ qua — nếu đóng ở đây, mỗi đáp án thành 1 câu.
      if (cur && cur.options.length) {
        const next = nextNonBlank(li);
        if (next === null || !OPT_RE.test(next)) flush();
      }
      continue;
    }
    const qm = line.match(Q_START_RE);
    if (qm) {
      flush();
      ensureBlock().qLines.push(cleanLine(qm[2] || qm[1] || ''));
      continue;
    }
    const om = line.match(OPT_RE);
    if (om) {
      const b = ensureBlock();
      b.options.push({
        text: cleanLine(om[4]),
        correct: !!(om[1] || om[3]),
        letter: om[2].toUpperCase(),
      });
      continue;
    }
    // Dòng thường: nối vào câu hỏi (chưa có đáp án) hoặc đáp án
    // cuối (đã có đáp án) — câu hỏi/đáp án nhiều dòng.
    const b = ensureBlock();
    if (!b.options.length) b.qLines.push(line);
    else b.options[b.options.length - 1].text += ' ' + line;
  }
  flush();

  const questions = blocks.map((b, i) => {
    const q = b.qLines.join(' ').replace(/\s+/g, ' ').trim();
    const options = b.options.filter((o) => o.text);
    const correctCount = options.filter((o) => o.correct).length;
    const errors = [];
    const warnings = [];
    if (!q) errors.push('thiếu nội dung câu hỏi');
    if (options.length < 2) errors.push('chỉ có ' + options.length + ' đáp án (cần ít nhất 2)');
    if (options.length > 5) errors.push('có ' + options.length + ' đáp án (tối đa 5)');
    if (correctCount === 0) errors.push('chưa đánh dấu đáp án đúng (thêm * trước đáp án đúng)');
    if (correctCount > 1) errors.push('có ' + correctCount + ' đáp án đúng (chỉ được đánh dấu * 1 đáp án)');
    if (options.length >= 2 && options.length <= 5 && options.length !== 4) {
      warnings.push('câu này có ' + options.length + ' đáp án (đề chuẩn thường có 4) — vẫn trộn được');
    }
    const outOfOrder = options.some((o, j) => o.letter !== LETTERS[j]);
    if (outOfOrder && options.length) {
      warnings.push('đáp án chưa theo thứ tự A, B, C, D (đã xếp lại theo thứ tự viết)');
    }
    return {
      index: i + 1,
      q,
      options,
      correctIndex: options.findIndex((o) => o.correct),
      errors,
      warnings,
    };
  });
  return questions;
}

// Trộn Fisher-Yates với hàm ngẫu nhiên rand() cho trước (mặc định
// Math.random; test truyền hàm có hạt giống để kiểm lại được).
function shuffledCopy(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

// Trộn đề gốc thành nhiều mã đề. Chỉ trộn câu hợp lệ (errors rỗng).
// opts: { shuffleQuestions, shuffleOptions, codeCount, rand }.
// Trả về mảng mã đề: { code, questions: [{ q, options: [chuỗi],
// correctIndex, origIndex }] } — origIndex là vị trí câu trong đề
// gốc (0-based), để đối chiếu đáp án đúng sau khi trộn.
function shuffleExam(questions, opts) {
  const o = opts || {};
  const shuffleQuestions = o.shuffleQuestions !== false;
  const shuffleOptions = o.shuffleOptions !== false;
  const codeCount = Math.min(8, Math.max(1, o.codeCount || 4));
  const rand = typeof o.rand === 'function' ? o.rand : Math.random;
  const valid = [];
  questions.forEach((q, i) => {
    if (!q.errors || !q.errors.length) {
      valid.push({
        q: q.q,
        options: q.options.map((x) => x.text),
        correctIndex: q.correctIndex,
        origIndex: i,
      });
    }
  });
  const exams = [];
  for (let c = 0; c < codeCount; c++) {
    let qs = valid.map((x) => ({
      q: x.q,
      options: x.options.slice(),
      correctIndex: x.correctIndex,
      origIndex: x.origIndex,
    }));
    if (shuffleQuestions) qs = shuffledCopy(qs, rand);
    if (shuffleOptions) {
      qs = qs.map((item) => {
        const order = shuffledCopy(item.options.map((_, i) => i), rand);
        return {
          q: item.q,
          options: order.map((i) => item.options[i]),
          correctIndex: order.indexOf(item.correctIndex),
          origIndex: item.origIndex,
        };
      });
    }
    exams.push({ code: 101 + c, questions: qs });
  }
  return exams;
}

// Bảng đáp án của 1 mã đề: mảng chữ cái theo thứ tự câu đã trộn.
function answerKey(exam) {
  return exam.questions.map((q) => LETTERS[q.correctIndex] || '?');
}

// Đề mẫu 10 câu (hiện sẵn khi mở trang) — câu hỏi kiến thức chung,
// đáp án đúng đã kiểm: B B C A C D B B A B.
const SAMPLE_EXAM_TEXT = [
  'Câu 1. Thủ đô của Việt Nam là thành phố nào?',
  'A. Huế',
  '*B. Hà Nội',
  'C. Đà Nẵng',
  'D. Cần Thơ',
  '',
  'Câu 2. Con sông nào dài nhất thế giới?',
  'A. Sông Mê Kông',
  '*B. Sông Nin',
  'C. Sông A-ma-dôn',
  'D. Sông Trường Giang',
  '',
  'Câu 3. Kết quả của phép tính 15 × 8 là bao nhiêu?',
  'A. 100',
  'B. 110',
  '*C. 120',
  'D. 130',
  '',
  'Câu 4. "Truyện Kiều" là tác phẩm của ai?',
  '*A. Nguyễn Du',
  'B. Nguyễn Trãi',
  'C. Hồ Xuân Hương',
  'D. Nguyễn Đình Chiểu',
  '',
  'Câu 5. Nước Việt Nam Dân chủ Cộng hòa ra đời năm nào?',
  'A. 1930',
  'B. 1941',
  '*C. 1945',
  'D. 1954',
  '',
  'Câu 6. Hành tinh nào gần Mặt Trời nhất?',
  'A. Sao Kim',
  'B. Trái Đất',
  'C. Sao Hỏa',
  '*D. Sao Thủy',
  '',
  'Câu 7. 1 giờ 30 phút bằng bao nhiêu phút?',
  'A. 80 phút',
  '*B. 90 phút',
  'C. 100 phút',
  'D. 130 phút',
  '',
  'Câu 8. Tỉnh nào sau đây không giáp biển?',
  'A. Quảng Ninh',
  '*B. Lào Cai',
  'C. Nghệ An',
  'D. Bình Thuận',
  '',
  'Câu 9. Vị vua đầu tiên của nhà Lý là ai?',
  '*A. Lý Thái Tổ',
  'B. Lý Thái Tông',
  'C. Lý Thánh Tông',
  'D. Lý Nhân Tông',
  '',
  'Câu 10. Chất khí nào chiếm nhiều nhất trong không khí?',
  'A. Ô-xi',
  '*B. Ni-tơ',
  'C. Các-bon đi-ô-xít',
  'D. Hi-đrô',
].join('\n');

function examHeaderLines(meta, code) {
  const m = meta || {};
  const lines = [];
  if (m.school) lines.push(String(m.school).toUpperCase());
  lines.push(String(m.title || 'Bài kiểm tra trắc nghiệm').toUpperCase());
  if (m.duration) lines.push('Thời gian làm bài: ' + m.duration + ' phút (không kể thời gian phát đề)');
  lines.push('Mã đề: ' + code);
  lines.push('Họ, tên học sinh: ......................................................  Số báo danh: ................');
  return lines;
}

// Văn bản 1 mã đề (để chép / tải .txt).
function examToText(exam, meta) {
  const out = examHeaderLines(meta, exam.code);
  out.push('');
  exam.questions.forEach((q, i) => {
    out.push('Câu ' + (i + 1) + '. ' + q.q);
    q.options.forEach((opt, j) => out.push(LETTERS[j] + '. ' + opt));
    out.push('');
  });
  return out.join('\n').trim() + '\n';
}

// Bảng đáp án tất cả mã đề, tách bằng tab (dán thẳng vào Excel).
function answerKeyToText(exams) {
  const n = exams.length ? exams[0].questions.length : 0;
  const rows = [['Câu'].concat(exams.map((e) => 'Mã đề ' + e.code))];
  for (let i = 0; i < n; i++) {
    rows.push(['Câu ' + (i + 1)].concat(exams.map((e) => answerKey(e)[i])));
  }
  return rows.map((r) => r.join('\t')).join('\n') + '\n';
}

// Toàn bộ mã đề + bảng đáp án trong 1 file .txt.
function allExamsToText(exams, meta) {
  const parts = exams.map((e) => examToText(e, meta));
  parts.push('BẢNG ĐÁP ÁN\n' + answerKeyToText(exams));
  return parts.join('\n' + '-'.repeat(40) + '\n\n');
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// File Word (.doc mở được bằng Word/LibreOffice) cho 1 mã đề —
// HTML có khai báo Word, lưu đuôi .doc (không phải .docx gốc).
function examToWordHtml(exam, meta) {
  const m = meta || {};
  const head = examHeaderLines(meta, exam.code).map((l) => '<p style="margin:0 0 4pt 0">' + escHtml(l) + '</p>').join('\n');
  const body = exam.questions.map((q, i) => {
    const opts = q.options.map((opt, j) => '<p style="margin:0 0 2pt 18pt"><b>' + LETTERS[j] + '.</b> ' + escHtml(opt) + '</p>').join('\n');
    return '<p style="margin:12pt 0 4pt 0"><b>Câu ' + (i + 1) + '.</b> ' + escHtml(q.q) + '</p>\n' + opts;
  }).join('\n');
  const key = '<p style="margin:18pt 0 4pt 0"><b>Bảng đáp án mã đề ' + exam.code + ' (chỉ dành cho giáo viên):</b></p>'
    + '<p style="margin:0">' + answerKey(exam).map((k, i) => 'Câu ' + (i + 1) + ': ' + k).join(' &nbsp; ') + '</p>';
  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
    + '<head><meta charset="utf-8"><title>' + escHtml(m.title || 'Đề kiểm tra') + ' — Mã đề ' + exam.code + '</title></head>'
    + '<body style="font-family:Times New Roman,serif;font-size:13pt">' + head + body + key + '</body></html>';
}

if (typeof window !== 'undefined') window.UH_TRONDE = { LETTERS, parseExam, shuffleExam, answerKey, examToText, answerKeyToText, allExamsToText, examToWordHtml, SAMPLE_EXAM_TEXT };
export { LETTERS, parseExam, shuffleExam, answerKey, examToText, answerKeyToText, allExamsToText, examToWordHtml, SAMPLE_EXAM_TEXT };
