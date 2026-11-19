// test-tron-de.mjs — Bộ kiểm tra công cụ Trộn đề trắc nghiệm
// (logic thuần trong src/tron-de-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools
// và test-gv-parser): kiểm nào trượt thì build thất bại để không
// đăng công cụ trộn sai đáp án lên web.
//
// Lõi phải đúng tuyệt đối: đáp án đúng sau khi trộn phải khớp đúng
// vị trí mới — kiểm bằng 100 lần trộn ngẫu nhiên, đối chiếu NỘI
// DUNG đáp án đúng (không chỉ chữ cái).
import {
  parseExam, shuffleExam, answerKey, examToText, answerKeyToText,
  allExamsToText, examToWordHtml, SAMPLE_EXAM_TEXT,
} from '../src/tron-de-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}
function ok(name, cond, extra) {
  if (cond) passed++;
  else { failed++; failures.push(`${name}${extra ? ' — ' + extra : ''}`); }
}

// Hàm ngẫu nhiên có hạt giống (mulberry32) để kiểm lại được.
function seededRand(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Đề mẫu 10 câu: đọc đúng, đủ, đáp án đúng đã kiểm ---
const sample = parseExam(SAMPLE_EXAM_TEXT);
check('mẫu: 10 câu', sample.length, 10);
check('mẫu: 10 câu hợp lệ', sample.filter((q) => !q.errors.length).length, 10);
check('mẫu: mỗi câu 4 đáp án', sample.map((q) => q.options.length), [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
check('mẫu: đáp án đúng B B C A C D B B A B',
  sample.map((q) => 'ABCDE'[q.correctIndex]),
  ['B', 'B', 'C', 'A', 'C', 'D', 'B', 'B', 'A', 'B']);
check('mẫu: câu 1 không còn tiền tố "Câu 1."', sample[0].q, 'Thủ đô của Việt Nam là thành phố nào?');
check('mẫu: đáp án không còn chữ cái đầu', sample[0].options[1].text, 'Hà Nội');
check('mẫu: 0 cảnh báo', sample.reduce((n, q) => n + q.warnings.length, 0), 0);

// --- Định dạng tiền tố câu hỏi ---
check('tiền tố "1)" + đáp án "a)" thường: đọc đúng', (() => {
  const qs = parseExam('1) Hai cộng hai bằng mấy?\na) 3\n*b) 4\nc) 5\nd) 6');
  return qs.length === 1 && !qs[0].errors.length && qs[0].q === 'Hai cộng hai bằng mấy?' && 'ABCDE'[qs[0].correctIndex] === 'B';
})(), true);
check('dấu * sau chữ cái "B. *Hà Nội": nhận đúng', (() => {
  const qs = parseExam('Thủ đô nước ta?\nA. Huế\nB. *Hà Nội\nC. Đà Nẵng\nD. Cần Thơ');
  return qs.length === 1 && 'ABCDE'[qs[0].correctIndex] === 'B';
})(), true);
check('không có dòng trống giữa các câu: vẫn tách đúng', (() => {
  const qs = parseExam('Câu 1. Một cộng một?\nA. 1\n*B. 2\nC. 3\nD. 4\nCâu 2. Hai cộng hai?\nA. 3\n*B. 4\nC. 5\nD. 6');
  return qs.length === 2 && qs.every((q) => !q.errors.length);
})(), true);

// --- Câu hỏi / đáp án nhiều dòng ---
check('câu hỏi 2 dòng: nối thành 1 câu', (() => {
  const qs = parseExam('Câu 1. Cho tam giác ABC vuông tại A,\nAB = 3, AC = 4. Tính BC.\nA. 5\nB. 6\n*C. 7\nD. 8');
  return qs.length === 1 && qs[0].q === 'Cho tam giác ABC vuông tại A, AB = 3, AC = 4. Tính BC.';
})(), true);
check('đáp án 2 dòng: nối vào đáp án cuối', (() => {
  const qs = parseExam('Câu 1. Chọn câu đúng.\nA. Một\nB. Hai\nphần còn lại của đáp án B\n*C. Ba\nD. Bốn');
  return qs.length === 1 && qs[0].options[1].text === 'Hai phần còn lại của đáp án B';
})(), true);

// --- Câu lỗi: phát hiện + nêu đúng lý do ---
check('thiếu dấu *: lỗi "chưa đánh dấu đáp án đúng"', (() => {
  const qs = parseExam('Câu 1. Một cộng một?\nA. 1\nB. 2\nC. 3\nD. 4');
  return qs[0].errors.some((e) => e.includes('chưa đánh dấu'));
})(), true);
check('2 dấu *: lỗi "2 đáp án đúng"', (() => {
  const qs = parseExam('Câu 1. Một cộng một?\n*A. 1\n*B. 2\nC. 3\nD. 4');
  return qs[0].errors.some((e) => e.includes('2 đáp án đúng'));
})(), true);
check('chỉ 3 đáp án: hợp lệ nhưng cảnh báo', (() => {
  const qs = parseExam('Câu 1. Một cộng một?\nA. 1\n*B. 2\nC. 3');
  return qs[0].errors.length === 0 && qs[0].warnings.some((w) => w.includes('3 đáp án'));
})(), true);
check('chỉ 1 đáp án: lỗi', (() => {
  const qs = parseExam('Câu 1. Một cộng một?\n*A. 2');
  return qs[0].errors.some((e) => e.includes('1 đáp án'));
})(), true);
check('đáp án không theo thứ tự A B C D: cảnh báo', (() => {
  const qs = parseExam('Câu 1. Một cộng một?\nA. 1\nC. 3\n*B. 2\nD. 4');
  return qs[0].warnings.some((w) => w.includes('thứ tự'));
})(), true);
check('văn bản rỗng: 0 câu', parseExam('').length, 0);
check('chỉ có dòng trống: 0 câu', parseExam('\n\n  \n').length, 0);

// --- Dòng trống giữa các đáp án (văn bản từ Word / mammoth) ---
check('mammoth: dòng trống sau MỖI dòng vẫn tách đúng 3 câu', (() => {
  const qs = parseExam(
    'Câu 1. Hai cộng ba bằng mấy?\n\nA. 4\n\n*B. 5\n\nC. 6\n\nD. 7\n\n\n\n'
    + 'Câu 2. Màu của lá cây là màu gì?\n\nA. Đỏ\n\nB. Vàng\n\n*C. Xanh lá\n\nD. Tím\n\n\n\n'
    + 'Câu 3. Con gì kêu "meo meo"?\n\n*A. Mèo\n\nB. Chó\n\nC. Gà\n\nD. Vịt\n\n');
  return qs.length === 3
    && qs.every((q) => !q.errors.length)
    && qs.map((q) => 'ABCDE'[q.correctIndex]).join('') === 'BCA';
})(), true);
check('không có tiền tố "Câu N.": dòng trống tách khối đúng', (() => {
  const qs = parseExam(
    'Một cộng một bằng mấy?\nA. 1\n*B. 2\nC. 3\nD. 4\n\nHai cộng hai bằng mấy?\nA. 3\n*B. 4\nC. 5\nD. 6');
  return qs.length === 2 && qs.every((q) => !q.errors.length) && qs[1].q === 'Hai cộng hai bằng mấy?';
})(), true);
check('câu 3 đáp án, không tiền tố, tách bằng dòng trống: đúng 2 câu', (() => {
  const qs = parseExam(
    'Một cộng một?\nA. 1\n*B. 2\nC. 3\n\nHai cộng hai?\nA. 3\n*B. 4\nC. 5');
  return qs.length === 2 && qs.every((q) => !q.errors.length);
})(), true);

// --- Trộn: số mã đề + mã 101–108 ---
check('4 mã đề: 101–104', shuffleExam(sample, { codeCount: 4 }).map((e) => e.code), [101, 102, 103, 104]);
check('2 mã đề: 101–102', shuffleExam(sample, { codeCount: 2 }).map((e) => e.code), [101, 102]);
check('8 mã đề: 101–108', shuffleExam(sample, { codeCount: 8 }).map((e) => e.code), [101, 102, 103, 104, 105, 106, 107, 108]);

// --- Trộn: tắt cả 2 công tắc thì đề giữ nguyên ---
check('không trộn gì: thứ tự + đáp án giữ nguyên', (() => {
  const exams = shuffleExam(sample, { shuffleQuestions: false, shuffleOptions: false, codeCount: 1 });
  const e = exams[0];
  return e.questions.every((q, i) =>
    q.q === sample[i].q
    && JSON.stringify(q.options) === JSON.stringify(sample[i].options.map((o) => o.text))
    && q.correctIndex === sample[i].correctIndex);
})(), true);

// --- Trộn: hạt giống giống nhau thì kết quả giống nhau ---
check('cùng hạt giống: trộn giống hệt', (() => {
  const a = shuffleExam(sample, { codeCount: 2, rand: seededRand(42) });
  const b = shuffleExam(sample, { codeCount: 2, rand: seededRand(42) });
  return JSON.stringify(a) === JSON.stringify(b);
})(), true);

// --- LÕI: 100 lần trộn ngẫu nhiên — đáp án đúng luôn khớp nội dung ---
let invariantFails = 0;
for (let t = 0; t < 100; t++) {
  const exams = shuffleExam(sample, { codeCount: 4, rand: seededRand(1000 + t) });
  for (const exam of exams) {
    // Đủ 10 câu, không trùng, không mất câu nào.
    const origs = exam.questions.map((q) => q.origIndex).sort((a, b) => a - b);
    if (JSON.stringify(origs) !== JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])) { invariantFails++; break; }
    for (const q of exam.questions) {
      const orig = sample[q.origIndex];
      const origCorrectText = orig.options[orig.correctIndex].text;
      // Nội dung đáp án đúng sau trộn phải là đáp án đúng gốc.
      if (q.options[q.correctIndex] !== origCorrectText) { invariantFails++; break; }
      // Bộ đáp án sau trộn là hoán vị của bộ gốc.
      if (JSON.stringify(q.options.slice().sort()) !== JSON.stringify(orig.options.map((o) => o.text).sort())) { invariantFails++; break; }
    }
    // Bảng đáp án khớp vị trí đã trộn.
    const key = answerKey(exam);
    if (!key.every((letter, i) => 'ABCDE'[exam.questions[i].correctIndex] === letter)) { invariantFails++; break; }
  }
}
ok('100 lần trộn: đáp án đúng luôn khớp nội dung + đủ câu + bảng đáp án khớp', invariantFails === 0, invariantFails + ' lần sai');

// --- Câu lỗi bị loại khỏi đợt trộn ---
check('câu lỗi không vào đề đã trộn', (() => {
  const qs = parseExam(SAMPLE_EXAM_TEXT + '\n\nCâu 11. Câu này không có dấu sao.\nA. 1\nB. 2\nC. 3\nD. 4');
  const exams = shuffleExam(qs, { codeCount: 1, shuffleQuestions: false, shuffleOptions: false });
  return exams[0].questions.length === 10;
})(), true);

// --- Xuất văn bản ---
check('examToText: có mã đề + đủ 10 câu + không lộ dấu *', (() => {
  const exams = shuffleExam(sample, { codeCount: 1, shuffleQuestions: false, shuffleOptions: false });
  const txt = examToText(exams[0], { title: 'Kiểm tra 15 phút', duration: 15 });
  return txt.includes('Mã đề: 101')
    && txt.includes('Kiểm tra 15 phút'.toUpperCase())
    && (txt.match(/Câu \d+\./g) || []).length === 10
    && !txt.includes('*');
})(), true);
check('answerKeyToText: bảng tab, 10 dòng + dòng đầu', (() => {
  const exams = shuffleExam(sample, { codeCount: 2, shuffleQuestions: false, shuffleOptions: false });
  const txt = answerKeyToText(exams);
  const rows = txt.trim().split('\n');
  return rows.length === 11
    && rows[0] === 'Câu\tMã đề 101\tMã đề 102'
    && rows[1] === 'Câu 1\tB\tB'
    && rows[3] === 'Câu 3\tC\tC';
})(), true);
check('allExamsToText: có cả 2 mã đề + bảng đáp án', (() => {
  const exams = shuffleExam(sample, { codeCount: 2, shuffleQuestions: false, shuffleOptions: false });
  const txt = allExamsToText(exams, { title: 'Kiểm tra' });
  return txt.includes('Mã đề: 101') && txt.includes('Mã đề: 102') && txt.includes('BẢNG ĐÁP ÁN');
})(), true);
check('examToWordHtml: có mã đề + bảng đáp án, không lộ dấu *', (() => {
  const exams = shuffleExam(sample, { codeCount: 1, shuffleQuestions: false, shuffleOptions: false });
  const html = examToWordHtml(exams[0], { title: 'Kiểm tra' });
  return html.includes('Mã đề 101') && html.includes('Bảng đáp án mã đề 101') && !html.includes('*');
})(), true);

console.log(`test-tron-de: ${passed} đạt, ${failed} trượt.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
