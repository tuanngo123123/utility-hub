// test-lop-hoc-3.mjs — Bộ kiểm tra 3 công cụ "Trên lớp" (logic thuần
// trong src/lop-hoc-3-logic.js): Sơ đồ chỗ ngồi, Ghép cặp thảo luận,
// Bảng vinh danh.
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet,
// test-ma-tran): kiểm nào trượt thì build thất bại để không đăng
// công cụ xếp chỗ/ghép cặp/xếp hạng sai lên web.
import {
  SAMPLE_CLASS, displayNames, givenLabels, shuffle, seededRand,
  shuffleSeats, shuffleEmptySeats, resizeSeats, swapSeats,
  pairKey, countRepeats, pairUp, pairingKeys,
  levelLabel, rankStudents, saveState, loadState,
} from '../src/lop-hoc-3-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}

// Kho lưu trữ giả (như localStorage) để kiểm lưu/tải.
function fakeStore() {
  const data = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

// --- Lớp mẫu ---
check('Lớp mẫu có 12 bạn', SAMPLE_CLASS.students.length, 12);
check('Lớp mẫu: 6 nam · 6 nữ', [SAMPLE_CLASS.students.filter((s) => s.gender === 'nam').length, SAMPLE_CLASS.students.filter((s) => s.gender === 'nữ').length], [6, 6]);
check('Lớp mẫu: 3 bạn có sao', SAMPLE_CLASS.students.filter((s) => s.star).length, 3);
check('Lớp mẫu tên đúng', SAMPLE_CLASS.className, 'Lớp mẫu 10A1');

// --- Tên hiển thị ---
check('displayNames: không trùng thì giữ nguyên', displayNames(['An', 'Bình']), ['An', 'Bình']);
check('displayNames: trùng tên đánh số (1)/(2)', displayNames(['Nguyễn Minh Anh', 'Lê Văn Hùng', 'Nguyễn Minh Anh']), ['Nguyễn Minh Anh (1)', 'Lê Văn Hùng', 'Nguyễn Minh Anh (2)']);
check('givenLabels: lấy từ cuối', givenLabels(['Nguyễn Văn An', 'Trần Thị Bình']), ['An', 'Bình']);
check('givenLabels: trùng tên gọi lấy 2 từ cuối', givenLabels(['Nguyễn Minh Anh', 'Trần Thị Mai', 'Hoàng Đức Anh']), ['Minh Anh', 'Mai', 'Đức Anh']);

// --- Xáo trộn ---
const r1 = seededRand(7);
const s1 = shuffle([1, 2, 3, 4, 5, 6], r1);
check('shuffle giữ đủ phần tử, không trùng/mất', s1.slice().sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);
check('shuffle có hạt giống lặp lại được', shuffle([1, 2, 3, 4, 5, 6], seededRand(7)), s1);
check('shuffle không sửa mảng gốc', [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]);

// --- Sơ đồ chỗ ngồi ---
{
  const { seats, unseated } = shuffleSeats(12, 6, 5, seededRand(11));
  check('Xếp 12 bạn vào 6×5=30 bàn: đủ 30 ô', seats.length, 30);
  const seated = seats.filter((s) => s !== null).sort((a, b) => a - b);
  check('Xếp ngẫu nhiên: đủ 12 bạn, không trùng/mất', seated, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  check('Xếp ngẫu nhiên: không ai chưa xếp khi đủ bàn', unseated, []);
  check('Xếp ngẫu nhiên: 18 bàn trống', seats.filter((s) => s === null).length, 18);
}
{
  const { seats, unseated } = shuffleSeats(35, 6, 5, seededRand(3));
  check('35 bạn vào 30 bàn: đủ 30 bàn có người', seats.filter((s) => s !== null).length, 30);
  check('35 bạn vào 30 bàn: 5 bạn chưa xếp', unseated.length, 5);
  const all = seats.filter((s) => s !== null).concat(unseated).sort((a, b) => a - b);
  check('35 bạn: không trùng/mất ai', all, Array.from({ length: 35 }, (_, i) => i));
}
{
  // Xáo trộn chỉ bàn trống: bạn đã ngồi giữ nguyên chỗ.
  const seats = [0, null, 2, null, 4, null];
  const { seats: next, unseated } = shuffleEmptySeats(seats, [1, 3], seededRand(5));
  check('Xáo bàn trống: bạn đã ngồi giữ nguyên', [next[0], next[2], next[4]], [0, 2, 4]);
  check('Xáo bàn trống: 2 bạn mới vào đủ 2 trong 3 bàn trống', next.filter((s) => s !== null).sort((a, b) => a - b), [0, 1, 2, 3, 4]);
  check('Xáo bàn trống: không ai thừa', unseated, []);
  check('Xáo bàn trống: không sửa mảng cũ', seats, [0, null, 2, null, 4, null]);
}
{
  const { seats: next, unseated } = shuffleEmptySeats([0, 1], [2, 3, 4], seededRand(1));
  check('Hết bàn trống: sơ đồ giữ nguyên', next, [0, 1]);
  check('Hết bàn trống: cả 3 bạn vẫn chưa xếp', unseated.slice().sort((a, b) => a - b), [2, 3, 4]);
}
{
  // Thu lưới 6 ô còn 4 ô: bạn ở ô 4, 5 ra ngoài.
  const { seats, unseated } = resizeSeats([0, 1, 2, 3, 4, 5], [], 2, 2);
  check('Thu lưới: giữ 4 bạn đầu', seats, [0, 1, 2, 3]);
  check('Thu lưới: 2 bạn bị cắt ra chưa xếp', unseated, [4, 5]);
  const grown = resizeSeats([0, null, 2], [3], 2, 3);
  check('Mở rộng lưới: giữ bạn cũ, thêm ô trống', grown.seats, [0, null, 2, null, null, null]);
  check('Mở rộng lưới: bạn chưa xếp vẫn chưa xếp', grown.unseated, [3]);
}
{
  check('Đổi chỗ 2 bàn có bạn', swapSeats([0, 1, 2], 0, 2), [2, 1, 0]);
  check('Đổi chỗ bạn với bàn trống', swapSeats([0, null, 2], 0, 1), [null, 0, 2]);
  check('Đổi chỗ ngoài phạm vi thì giữ nguyên', swapSeats([0, 1], 0, 5), [0, 1]);
}

// --- Ghép cặp ---
check("pairKey('B','A') = pairKey('A','B')", pairKey('B', 'A'), pairKey('A', 'B'));
check("pairKey('An','Bình') = 'An|Bình'", pairKey('An', 'Bình'), 'An|Bình');
{
  const hist = [['An|Bình', 'Chi|Dũng']];
  check('countRepeats đếm đúng cặp lặp', countRepeats([['An', 'Bình'], ['Chi', 'Em']], hist), 1);
  check('countRepeats: nhóm 3 có 3 cặp con', countRepeats([['An', 'Bình', 'Chi']], [['An|Bình', 'An|Chi', 'Bình|Chi']]), 3);
}
{
  // Lớp 12 bạn, 3 lần ghép liên tiếp với hạt giống khác nhau: mỗi
  // lần đủ 6 cặp, không trùng người, không cặp nào lặp 2 lần trước.
  const names = SAMPLE_CLASS.students.map((s) => s.name);
  let history = [];
  for (let round = 0; round < 3; round++) {
    const { pairs, repeats } = pairUp(names, history, seededRand(100 + round));
    check(`Ghép lần ${round + 1}: đủ 6 cặp`, pairs.length, 6);
    check(`Ghép lần ${round + 1}: mỗi cặp đúng 2 bạn`, pairs.every((p) => p.length === 2), true);
    const flat = pairs.flat().sort();
    check(`Ghép lần ${round + 1}: đủ 12 bạn, không trùng/mất`, flat, names.slice().sort());
    check(`Ghép lần ${round + 1}: không cặp nào lặp 2 lần trước`, repeats, 0);
    history = [pairingKeys(pairs)].concat(history).slice(0, 2);
  }
}
{
  // Lớp lẻ 11 bạn: 4 cặp + 1 nhóm 3 (4×2 + 3 = 11).
  const names = SAMPLE_CLASS.students.slice(0, 11).map((s) => s.name);
  const { pairs, repeats } = pairUp(names, [], seededRand(42));
  check('Lớp 11 bạn: 4 cặp + 1 nhóm 3', [pairs.filter((p) => p.length === 2).length, pairs.filter((p) => p.length === 3).length], [4, 1]);
  check('Lớp 11 bạn: đủ 11 bạn', pairs.flat().length, 11);
  check('Lớp 11 bạn lần đầu: không lặp', repeats, 0);
}
{
  // Lớp 3 bạn: 1 nhóm 3.
  const { pairs } = pairUp(['An', 'Bình', 'Chi'], [], seededRand(1));
  check('Lớp 3 bạn: đúng 1 nhóm, nhóm có 3 bạn', [pairs.length, pairs[0].length], [1, 3]);
  check('Lớp 3 bạn: đủ 3 bạn trong nhóm', pairs[0].slice().sort(), ['An', 'Bình', 'Chi']);
}
{
  // Lớp 2 bạn: chỉ có 1 cặp khả thi — lần 2 đành lặp, báo đúng 1.
  const names = ['An', 'Bình'];
  const first = pairUp(names, [], seededRand(1));
  const second = pairUp(names, [pairingKeys(first.pairs)], seededRand(2));
  check('Lớp 2 bạn lần 2: lặp đúng 1 cặp (không còn cách khác)', second.repeats, 1);
  check('pairingKeys của 1 cặp', pairingKeys([['An', 'Bình']]), ['An|Bình']);
  check('pairingKeys của nhóm 3 = 3 khóa', pairingKeys([['An', 'Bình', 'Chi']]).sort(), ['An|Bình', 'An|Chi', 'Bình|Chi']);
}
{
  // Lớp 4 bạn, 4 lần ghép: 6 cặp khả thi, mỗi lần dùng 2 cặp — lần 4
  // vẫn tránh lặp được (còn 2 cặp chưa dùng sau 3 lần).
  const names = ['An', 'Bình', 'Chi', 'Dũng'];
  let history = [];
  let allOk = true;
  for (let round = 0; round < 4; round++) {
    const { pairs, repeats } = pairUp(names, history, seededRand(200 + round));
    if (repeats !== 0) allOk = false;
    history = [pairingKeys(pairs)].concat(history).slice(0, 2);
  }
  check('Lớp 4 bạn ghép 4 lần: không lần nào lặp', allOk, true);
}

// --- Bảng vinh danh ---
check('levelLabel(0) = Lv.1', levelLabel(0), 'Lv.1 · Mầm non');
check('levelLabel(1) = Lv.1', levelLabel(1), 'Lv.1 · Mầm non');
check('levelLabel(2) = Lv.2', levelLabel(2), 'Lv.2 · Chăm chỉ');
check('levelLabel(4) = Lv.2', levelLabel(4), 'Lv.2 · Chăm chỉ');
check('levelLabel(5) = Lv.3', levelLabel(5), 'Lv.3 · Ngôi sao');
check('levelLabel(12) = Lv.3', levelLabel(12), 'Lv.3 · Ngôi sao');
{
  const ranked = rankStudents(SAMPLE_CLASS.students);
  check('Xếp hạng lớp mẫu: đủ 12 bạn', ranked.length, 12);
  check('Hạng 1: Nguyễn Minh Anh 12 điểm', [ranked[0].name, ranked[0].points, ranked[0].rank], ['Nguyễn Minh Anh', 12, 1]);
  check('Đồng điểm 9: cùng hạng 2', [ranked[1].rank, ranked[2].rank], [2, 2]);
  check('Sau 2 bạn hạng 2: hạng tiếp là 4 (không có hạng 3)', ranked[3].rank, 4);
  check('Đồng điểm 3: cùng hạng 8', [ranked[7].rank, ranked[8].rank], [8, 8]);
  check('Hạng cuối: Dương Thị Hoa 0 điểm hạng 12', [ranked[11].name, ranked[11].points, ranked[11].rank], ['Dương Thị Hoa', 0, 12]);
  check('Điểm giảm dần đúng thứ tự', ranked.map((r) => r.points), [12, 9, 9, 7, 6, 5, 4, 3, 3, 2, 1, 0]);
  check('Cấp độ hạng 1 là Lv.3', ranked[0].level, 'Lv.3 · Ngôi sao');
}
{
  // Đồng điểm giữ thứ tự lớp (ổn định).
  const ranked = rankStudents([{ name: 'Bình', points: 5 }, { name: 'An', points: 5 }, { name: 'Chi', points: 5 }]);
  check('Đồng điểm 3 bạn: cùng hạng 1, giữ thứ tự lớp', ranked.map((r) => r.name + ':' + r.rank), ['Bình:1', 'An:1', 'Chi:1']);
}
check('rankStudents: lớp rỗng', rankStudents([]), []);

// --- Lưu/tải ---
{
  const store = fakeStore();
  const seatsState = { className: 'Lớp mẫu 10A1', rows: 6, cols: 5, seats: [0, null, 2], unseated: [1] };
  check('Lưu sơ đồ thành công', saveState(store, 'uh_gv_so_do', seatsState), true);
  check('Tải sơ đồ giữ nguyên dữ liệu', loadState(store, 'uh_gv_so_do', null), seatsState);
  check('Tải khóa chưa có thì trả mặc định', loadState(store, 'chua-co', 'mac-dinh'), 'mac-dinh');
  const histState = { 'Lớp mẫu 10A1': [['An|Bình', 'Chi|Dũng']] };
  saveState(store, 'uh_gv_ghep_cap', histState);
  check('Tải lịch sử ghép cặp giữ nguyên', loadState(store, 'uh_gv_ghep_cap', {}), histState);
  store.setItem('hong', '{không phải json');
  check('Dữ liệu hỏng thì trả mặc định', loadState(store, 'hong', []), []);
}

if (failed) {
  console.error(`test-lop-hoc-3: ${passed} đạt, ${failed} trượt.`);
  failures.forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
} else {
  console.log(`test-lop-hoc-3: ${passed} đạt, 0 trượt.`);
}
