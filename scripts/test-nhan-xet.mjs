// test-nhan-xet.mjs — Bộ kiểm tra công cụ Gợi ý lời nhận xét học
// sinh (ngân hàng lời + logic chọn gợi ý trong
// src/nhan-xet-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22): kiểm nào trượt
// thì build thất bại để không đăng ngân hàng lời sai/thiếu lên web.
//
// Ngân hàng 84 lời do tớ tự viết mới (theo quy ước nhận xét TT22:
// cụ thể, có gợi ý khắc phục, không chung chung — xem ghi chú đầu
// file src/nhan-xet-logic.js). Bộ kiểm này bảo vệ các cam kết:
// mỗi ô đủ lời, không trùng câu, không từ cấm, lời Chưa đạt và lời
// "cần cải thiện" luôn có hướng khắc phục, gợi ý 3–5 lời và tránh
// lặp câu đã dùng.
import {
  LEVELS, LEVEL_IDS, SUBJECTS, TRAITS, BANNED_WORDS, REMEDY_WORDS,
  BANK, SAMPLE_STUDENT, fillName, allComments, pickFrom, suggest,
  displayNames,
} from '../src/nhan-xet-logic.js';

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

// Tách từ để kiểm từ trọn vẹn (không bắt nhầm âm tiết trong từ
// khác — ví dụ "hư" không được bắt "hướng", "ngu" không bắt "nguồn").
function tokens(text) {
  return String(text).toLowerCase().split(/[\s.,;:!?()[\]"'“”«»—–-]+/).filter(Boolean);
}
function hasWord(text, word) {
  return tokens(text).includes(word);
}
function hasRemedy(text) {
  const t = String(text).toLowerCase();
  return tokens(t).includes('cần') || tokens(t).includes('nên')
    || tokens(t).includes('hãy') || t.includes('tiếp tục');
}

// --- Cấu trúc ngân hàng: đủ ô, đủ lời, không trùng ---
check('4 môn học', SUBJECTS.map((s) => s.id), ['toan', 'ngu-van', 'tieng-anh', 'chung']);
check('4 mức', LEVEL_IDS, ['tot', 'kha', 'dat', 'chuadat']);
check('4 phẩm chất', TRAITS.map((t) => t.id), ['cham-chi', 'hop-tac', 'tu-tin', 'ky-luat']);

let subjectCells = 0;
Object.keys(BANK.subject).forEach((subject) => {
  LEVEL_IDS.forEach((level) => {
    const cell = BANK.subject[subject][level];
    subjectCells++;
    ok(`môn ${subject} mức ${level}: ≥3 lời`, Array.isArray(cell) && cell.length >= 3, `có ${cell ? cell.length : 0}`);
    ok(`môn ${subject} mức ${level}: lời khác nhau`, new Set(cell).size === cell.length);
  });
});
check('16 ô môn × mức', subjectCells, 16);

let traitCells = 0;
Object.keys(BANK.trait).forEach((trait) => {
  ['manh', 'cai-thien'].forEach((side) => {
    const cell = BANK.trait[trait][side];
    traitCells++;
    ok(`phẩm chất ${trait} phía ${side}: ≥3 lời`, Array.isArray(cell) && cell.length >= 3, `có ${cell ? cell.length : 0}`);
    ok(`phẩm chất ${trait} phía ${side}: lời khác nhau`, new Set(cell).size === cell.length);
  });
});
check('8 ô phẩm chất × phía', traitCells, 8);

LEVEL_IDS.forEach((level) => {
  const cell = BANK.general[level];
  ok(`chung mức ${level}: ≥3 lời`, Array.isArray(cell) && cell.length >= 3, `có ${cell ? cell.length : 0}`);
  ok(`chung mức ${level}: lời khác nhau`, new Set(cell).size === cell.length);
});

const all = allComments();
ok('tổng ≥ 60 lời', all.length >= 60, `có ${all.length}`);
check('tổng đúng 84 lời (48 môn + 24 phẩm chất + 12 chung)', all.length, 84);
ok('không trùng câu trong toàn ngân hàng', new Set(all.map((c) => c.text)).size === all.length);

// --- Chất lượng từng lời: câu chữ, chỗ trống, từ cấm ---
all.forEach((c, i) => {
  const where = `${c.group}${c.subject ? '/' + c.subject : ''}${c.trait ? '/' + c.trait : ''}${c.level ? '/' + c.level : ''}${c.side ? '/' + c.side : ''} #${i}`;
  const terms = (c.text.match(/[.!?]/g) || []).length;
  ok(`${where}: 1–2 câu`, terms >= 1 && terms <= 2, c.text);
  ok(`${where}: kết thúc bằng dấu chấm`, c.text.trim().endsWith('.'), c.text);
  ok(`${where}: không chứa "VD:"`, !c.text.includes('VD:'), c.text);
  // [tên] chỉ ở vị trí chủ ngữ đầu câu (đầu lời hoặc sau ". ").
  const slots = [...c.text.matchAll(/\[tên\]/g)].map((m) => m.index);
  slots.forEach((idx) => {
    ok(`${where}: [tên] ở đầu câu`, idx === 0 || c.text.slice(Math.max(0, idx - 2), idx) === '. ', c.text);
  });
  // Từ cấm: cụm từ kiểm theo chuỗi con; "hư"/"ngu" kiểm theo từ
  // trọn vẹn (tránh bắt "hướng"/"nguồn").
  BANNED_WORDS.forEach((w) => {
    const bad = (w === 'hư' || w === 'ngu')
      ? hasWord(c.text, w)
      : c.text.toLowerCase().includes(w);
    ok(`${where}: không chứa từ cấm "${w}"`, !bad, c.text);
  });
  // Lời Chưa đạt + lời cần cải thiện: luôn có hướng khắc phục.
  if ((c.group === 'subject' || c.group === 'general') && c.level === 'chuadat') {
    ok(`${where}: Chưa đạt có hướng khắc phục (cần/nên/hãy/tiếp tục)`, hasRemedy(c.text), c.text);
  }
  if (c.group === 'trait' && c.side === 'cai-thien') {
    ok(`${where}: cần cải thiện có hướng khắc phục`, hasRemedy(c.text), c.text);
  }
});

// --- Điền tên ---
check('fillName thay [tên] bằng tên học sinh',
  fillName('[tên] nắm vững kiến thức.', 'Nguyễn Văn An'),
  'Nguyễn Văn An nắm vững kiến thức.');
check('fillName thay hết mọi [tên]',
  fillName('[tên] học tốt. [tên] luôn giúp bạn.', 'Trần Thị Bình'),
  'Trần Thị Bình học tốt. Trần Thị Bình luôn giúp bạn.');
check('fillName chưa có tên thì dùng "Em"',
  fillName('[tên] nắm vững kiến thức.', ''), 'Em nắm vững kiến thức.');
check('fillName tên có khoảng trắng thừa thì gọn lại',
  fillName('[tên] học tốt.', '  Lê Văn Cường '), 'Lê Văn Cường học tốt.');
all.forEach((c) => {
  ok('fillName không để sót [tên]', !fillName(c.text, SAMPLE_STUDENT).includes('[tên]'), c.text);
  ok('fillName với tên trống không để sót [tên]', !fillName(c.text, '').includes('[tên]'), c.text);
});

// --- Chọn 1 lời trong ô ---
const seeded = (values) => { let i = 0; return () => values[i++ % values.length]; };
check('pickFrom ô rỗng trả null', pickFrom([], new Set(), () => 0), null);
check('pickFrom rand=0 lấy lời đầu ô chưa dùng',
  pickFrom(['a', 'b', 'c'], new Set(), () => 0), 'a');
check('pickFrom tránh lời đã dùng',
  pickFrom(['a', 'b', 'c'], new Set(['a', 'b']), () => 0), 'c');
check('pickFrom hết lời mới thì dùng lại từ đầu',
  pickFrom(['a', 'b'], new Set(['a', 'b']), () => 0), 'a');

// --- Gợi ý: số lượng, đúng ô, không trùng, tránh lặp ---
const s0 = suggest({ subject: 'toan', level: 'kha', strengths: [], improvements: [], used: new Set() }, seeded([0]));
check('không chọn phẩm chất: 3 lời', s0.length, 3);
check('không chọn phẩm chất: có 1 lời môn + 1 lời chung',
  [s0.some((x) => x.kind === 'mon'), s0.some((x) => x.kind === 'chung')], [true, true]);
ok('lời môn lấy đúng ô Toán/Khá',
  BANK.subject.toan.kha.includes(s0.find((x) => x.kind === 'mon').text));
ok('lời chung lấy đúng ô Khá',
  BANK.general.kha.includes(s0.find((x) => x.kind === 'chung').text));

const s1 = suggest(
  { subject: 'ngu-van', level: 'tot', strengths: ['cham-chi'], improvements: [], used: new Set() },
  seeded([0]),
);
check('1 điểm mạnh: 3 lời (1 môn + 1 phẩm chất + 1 chung)', s1.length, 3);
ok('lời điểm mạnh lấy đúng ô chăm chỉ/mạnh',
  BANK.trait['cham-chi'].manh.includes(s1.find((x) => x.kind === 'diem-manh').text));

const s1b = suggest(
  { subject: 'ngu-van', level: 'tot', strengths: ['cham-chi'], improvements: ['tu-tin'], used: new Set() },
  seeded([0]),
);
check('1 mạnh + 1 cải thiện: 4 lời', s1b.length, 4);

const s2 = suggest(
  { subject: 'tieng-anh', level: 'chuadat', strengths: ['cham-chi', 'hop-tac'], improvements: ['tu-tin', 'ky-luat'], used: new Set() },
  seeded([0]),
);
check('chọn đủ 2 mạnh + 2 cải thiện: tối đa 5 lời', s2.length, 5);
ok('5 lời không trùng nhau', new Set(s2.map((x) => x.text)).size === 5);
ok('lời môn Chưa đạt lấy đúng ô Tiếng Anh/Chưa đạt',
  BANK.subject['tieng-anh'].chuadat.includes(s2.find((x) => x.kind === 'mon').text));
// 4 phẩm chất đã chọn đều có lời, lời chung nhường chỗ (20/11).
check('4 phẩm chất đã chọn đều có lời',
  [s2.filter((x) => x.kind === 'diem-manh').length, s2.filter((x) => x.kind === 'can-cai-thien').length],
  [2, 2]);
ok('4 phẩm chất thì lời chung nhường chỗ', !s2.some((x) => x.kind === 'chung'));
ok('mọi lời Chưa đạt trong gợi ý đều có hướng khắc phục',
  s2.filter((x) => x.kind === 'mon' || x.kind === 'chung').every((x) => hasRemedy(x.text)));

// 3 phẩm chất thì lời chung vẫn có chỗ.
const s2b = suggest(
  { subject: 'tieng-anh', level: 'chuadat', strengths: ['cham-chi', 'hop-tac'], improvements: ['tu-tin'], used: new Set() },
  seeded([0]),
);
check('3 phẩm chất: 5 lời', s2b.length, 5);
ok('3 phẩm chất: lời chung vẫn có chỗ', s2b.some((x) => x.kind === 'chung'));
ok('lời chung Chưa đạt lấy đúng ô Chưa đạt',
  BANK.general.chuadat.includes(s2b.find((x) => x.kind === 'chung').text));

// Tránh lặp: 2 lời đầu ô Toán/Tốt đã dùng thì gợi ý lấy lời còn lại.
const s3 = suggest(
  { subject: 'toan', level: 'tot', strengths: [], improvements: [], used: new Set(BANK.subject.toan.tot.slice(0, 2)) },
  seeded([0]),
);
check('tránh lặp: lời môn là lời chưa dùng trong ô',
  s3.find((x) => x.kind === 'mon').text, BANK.subject.toan.tot[2]);

// Hồi quy 20/11: câu thêm vào cho đủ 3 lời cũng phải tránh câu đã
// dùng — dù câu đã dùng đứng đầu, giữa hay cuối ô. (Bản cũ chỉ lọc
// theo seen nên câu đứng đầu ô vẫn bị gợi lại.)
for (let usedIdx = 0; usedIdx < 3; usedIdx++) {
  for (const seed of [0, 0.34, 0.67, 0.99]) {
    const usedText = BANK.subject.toan.kha[usedIdx];
    const sx = suggest(
      { subject: 'toan', level: 'kha', strengths: [], improvements: [], used: new Set([usedText]) },
      seeded([seed]),
    );
    ok(`tránh lặp khi thêm đủ 3: không gợi lại câu đã dùng (ô ${usedIdx}, seed ${seed})`,
      sx.every((x) => x.text !== usedText));
    check(`tránh lặp khi thêm đủ 3: vẫn đủ 3 lời (ô ${usedIdx}, seed ${seed})`, sx.length, 3);
  }
}
// Cả ô đã dùng hết thì dùng lại (không vỡ, vẫn đủ 3 lời).
const s3b = suggest(
  { subject: 'toan', level: 'kha', strengths: [], improvements: [], used: new Set(BANK.subject.toan.kha) },
  seeded([0]),
);
check('cả ô đã dùng: vẫn gợi đủ 3 lời', s3b.length, 3);

// Môn/mức lạ thì về mặc định (Môn chung / Đạt), không vỡ.
const s4 = suggest({ subject: 'vat-ly', level: 'gioi', strengths: ['khong-co'], improvements: [], used: new Set() }, seeded([0]));
check('môn/mức lạ: vẫn gợi ý 3 lời', s4.length, 3);
ok('môn lạ thì dùng ô Môn chung/Đạt',
  BANK.subject.chung.dat.includes(s4.find((x) => x.kind === 'mon').text));

// --- Tên trùng ---
check('displayNames đánh số trùng tên',
  displayNames(['Nguyễn Văn An', 'Trần Thị Bình', 'Nguyễn Văn An']),
  ['Nguyễn Văn An (1)', 'Trần Thị Bình', 'Nguyễn Văn An (2)']);
check('displayNames không trùng thì giữ nguyên',
  displayNames(['An', 'Bình']), ['An', 'Bình']);

// --- Kết quả ---
console.log(`test-nhan-xet: ${passed} đạt, ${failed} trượt.`);
if (failed) {
  console.error(failures.join('\n---\n'));
  process.exit(1);
}
