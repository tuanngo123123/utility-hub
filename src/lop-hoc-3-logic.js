// Logic thuần cho 3 công cụ "Trên lớp" (20/11): Sơ đồ chỗ ngồi,
// Ghép cặp thảo luận, Bảng vinh danh. Không chạm DOM, không chạm
// localStorage trực tiếp — hàm lưu/tải nhận kho lưu trữ như tham số
// để bộ kiểm Node truyền kho giả. build.mjs chèn file này nguyên văn
// vào 3 trang công cụ (trừ dòng export cuối), init() gọi qua
// window.UH_LOPHOC3. Bộ kiểm scripts/test-lop-hoc-3.mjs kiểm cùng
// file này.

// Lớp mẫu 10A1 — 12 bạn đầu tiên của lớp mẫu Bàn giáo viên
// (src/pages/giao-vien-lop-hoc.js, SAMPLE_STUDENTS): 6 nam · 6 nữ ·
// 3 bạn có sao. Điểm mẫu cho Bảng vinh danh: có 1 cặp đồng điểm
// (9 điểm) để thấy 2 bạn cùng hạng.
const SAMPLE_CLASS = {
  className: 'Lớp mẫu 10A1',
  students: [
    { name: 'Nguyễn Minh Anh', gender: 'nam', star: true, points: 12 },
    { name: 'Trần Thị Mai', gender: 'nữ', star: false, points: 9 },
    { name: 'Lê Văn Hùng', gender: 'nam', star: false, points: 9 },
    { name: 'Phạm Thu Hà', gender: 'nữ', star: true, points: 7 },
    { name: 'Hoàng Đức Anh', gender: 'nam', star: false, points: 6 },
    { name: 'Vũ Thị Lan', gender: 'nữ', star: false, points: 5 },
    { name: 'Đặng Quốc Bảo', gender: 'nam', star: false, points: 4 },
    { name: 'Bùi Thị Ngọc', gender: 'nữ', star: false, points: 3 },
    { name: 'Đỗ Văn Tuấn', gender: 'nam', star: false, points: 3 },
    { name: 'Hồ Thị Phương', gender: 'nữ', star: false, points: 2 },
    { name: 'Ngô Minh Quân', gender: 'nam', star: true, points: 1 },
    { name: 'Dương Thị Hoa', gender: 'nữ', star: false, points: 0 },
  ],
};

// Tên hiển thị có đánh số trùng tên (cùng quy ước UhGvClasses.
// displayNames): 2 bạn cùng họ tên thì "(1)"/"(2)" theo thứ tự.
function displayNames(records) {
  const counts = {};
  const seen = {};
  (records || []).forEach((r) => {
    const n = typeof r === 'string' ? r : r.name;
    counts[n] = (counts[n] || 0) + 1;
  });
  return (records || []).map((r) => {
    const n = typeof r === 'string' ? r : r.name;
    if (counts[n] <= 1) return n;
    seen[n] = (seen[n] || 0) + 1;
    return n + ' (' + seen[n] + ')';
  });
}

// Tên gọi ngắn trong sơ đồ/cặp (từ cuối; trùng thì 2 từ cuối; vẫn
// trùng thì đánh số) — cùng thuật toán với givenLabels của Chia nhóm
// để cùng một bạn hiện một tên ở mọi công cụ.
function givenLabels(names) {
  const words = (names || []).map((n) => String(n).trim().split(/\s+/));
  const given = words.map((w) => w[w.length - 1]);
  const givenCount = {};
  given.forEach((g) => { givenCount[g] = (givenCount[g] || 0) + 1; });
  const labels = given.map((g, i) => {
    if (givenCount[g] > 1 && words[i].length > 1) return words[i].slice(-2).join(' ');
    return g;
  });
  const labelCount = {};
  labels.forEach((l) => { labelCount[l] = (labelCount[l] || 0) + 1; });
  const seenNum = {};
  return labels.map((l) => {
    if (labelCount[l] > 1) {
      seenNum[l] = (seenNum[l] || 0) + 1;
      return l + ' (' + seenNum[l] + ')';
    }
    return l;
  });
}

// Xáo trộn Fisher-Yates; rand là hàm () => [0,1) để test truyền hạt
// giống cố định (mặc định Math.random).
function shuffle(arr, rand) {
  const r = typeof rand === 'function' ? rand : Math.random;
  const a = (arr || []).slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32) — test dùng
// để kết quả xáo trộn/ghép cặp lặp lại được.
function seededRand(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Sơ đồ chỗ ngồi ----------
// Sơ đồ = mảng dài rows*cols, mỗi phần tử là chỉ số học sinh trong
// danh sách (0..n-1) hoặc null (bàn trống). Học sinh thừa (nhiều hơn
// số bàn) nằm trong danh sách "chưa xếp chỗ".

// Xếp ngẫu nhiên toàn lớp: xáo trộn rồi điền theo hàng, từ bàn đầu.
function shuffleSeats(count, rows, cols, rand) {
  const total = Math.max(0, rows) * Math.max(0, cols);
  const order = shuffle(Array.from({ length: count }, (_, i) => i), rand);
  const seats = new Array(total).fill(null);
  for (let i = 0; i < Math.min(order.length, total); i++) seats[i] = order[i];
  const unseated = order.slice(total);
  return { seats, unseated };
}

// Xáo trộn chỉ bàn trống: giữ nguyên bạn đã ngồi, xáo trộn bạn chưa
// xếp vào các bàn còn trống (thừa thì vẫn chưa xếp).
function shuffleEmptySeats(seats, unseated, rand) {
  const next = (seats || []).slice();
  const pool = shuffle(unseated || [], rand);
  let p = 0;
  for (let i = 0; i < next.length && p < pool.length; i++) {
    if (next[i] === null || next[i] === undefined) next[i] = pool[p++];
  }
  return { seats: next, unseated: pool.slice(p) };
}

// Đổi kích thước lưới: giữ bạn ở bàn còn tồn tại (theo vị trí tuyến
// tính), bạn ở bàn bị cắt ra ngoài về danh sách chưa xếp.
function resizeSeats(seats, unseated, rows, cols) {
  const total = Math.max(0, rows) * Math.max(0, cols);
  const next = new Array(total).fill(null);
  const spill = (unseated || []).slice();
  (seats || []).forEach((s, i) => {
    if (s === null || s === undefined) return;
    if (i < total) next[i] = s;
    else spill.push(s);
  });
  return { seats: next, unseated: spill };
}

// Đổi chỗ 2 bàn (kéo-thả): hoán đổi nội dung, bàn trống nhận bạn,
// bàn có bạn đổi cho nhau. Trả sơ đồ mới, không sửa mảng cũ.
function swapSeats(seats, from, to) {
  const next = (seats || []).slice();
  if (from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
  const t = next[from]; next[from] = next[to]; next[to] = t;
  return next;
}

// ---------- Ghép cặp thảo luận ----------
// Khóa chuẩn của 1 cặp: 2 tên sắp xếp để "A|B" và "B|A" là một cặp.
function pairKey(a, b) {
  const x = String(a); const y = String(b);
  return x < y ? x + '|' + y : y + '|' + x;
}

// Đếm số cặp trong lần ghép này đã xuất hiện ở lịch sử (mảng các lần
// ghép trước, mỗi lần là mảng khóa cặp).
function countRepeats(pairs, history) {
  const old = {};
  (history || []).forEach((round) => {
    (round || []).forEach((k) => { old[k] = true; });
  });
  let c = 0;
  (pairs || []).forEach((p) => {
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        if (old[pairKey(p[i], p[j])]) c++;
      }
    }
  });
  return c;
}

// Ghép cặp ngẫu nhiên, tránh lặp cặp ở 2 lần gần nhất (history).
// Lớp lẻ người: 1 nhóm 3 (nhóm cuối). Thuật toán: thử nhiều lần xáo
// trộn (tối đa 60 lần), giữ lần có ít cặp lặp nhất — lớp 12 bạn có
// 66 cặp khả thi nên lần ghép thứ 3 vẫn tránh lặp được hoàn toàn;
// lớp quá nhỏ (2–3 bạn) thì đành chấp nhận lặp tối thiểu và báo lại.
// Trả { pairs: [[tên...], ...], repeats }.
function pairUp(names, history, rand) {
  const list = (names || []).slice();
  const n = list.length;
  if (n < 2) return { pairs: n === 1 ? [[list[0]]] : [], repeats: 0 };
  function deal(order) {
    const out = [];
    for (let i = 0; i + 1 < order.length; i += 2) out.push([order[i], order[i + 1]]);
    if (order.length % 2 === 1) {
      // Nhóm 3: ghép bạn lẻ vào cặp cuối (lớp 3 bạn thì cặp đầu tiên
      // thành nhóm 3 ngay).
      if (out.length) out[out.length - 1].push(order[order.length - 1]);
      else out.push([order[0]]);
    }
    return out;
  }
  let best = deal(shuffle(list, rand));
  let bestRepeats = countRepeats(best, history);
  for (let t = 0; t < 60 && bestRepeats > 0; t++) {
    const cand = deal(shuffle(list, rand));
    const r = countRepeats(cand, history);
    if (r < bestRepeats) { best = cand; bestRepeats = r; }
  }
  return { pairs: best, repeats: bestRepeats };
}

// Khóa cặp của 1 lần ghép (để lưu lịch sử): mỗi cặp/nhóm 3 góp các
// khóa cặp con của nó.
function pairingKeys(pairs) {
  const keys = [];
  (pairs || []).forEach((p) => {
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) keys.push(pairKey(p[i], p[j]));
    }
  });
  return keys;
}

// ---------- Bảng vinh danh ----------
// Cấp độ thi đua theo điểm (cùng ngưỡng UhGvClasses.level).
function levelLabel(points) {
  const p = parseInt(points, 10);
  const v = isNaN(p) ? 0 : p;
  if (v >= 5) return 'Lv.3 · Ngôi sao';
  if (v >= 2) return 'Lv.2 · Chăm chỉ';
  return 'Lv.1 · Mầm non';
}

// Xếp hạng theo điểm giảm dần; đồng điểm cùng hạng (xếp hạng thi đấu
// chuẩn: 1, 2, 2, 4...). Thứ tự trong cùng 1 hạng giữ thứ tự lớp
// (ổn định, không xáo trộn khi điểm bằng nhau). Trả mảng {name,
// points, rank, level} đã xếp.
function rankStudents(entries) {
  const sorted = (entries || []).map((e, i) => ({
    name: e.name, points: (typeof e.points === 'number' && !isNaN(e.points)) ? e.points : 0, i,
  })).sort((a, b) => (b.points - a.points) || (a.i - b.i));
  let rank = 0;
  let prevPoints = null;
  return sorted.map((s, idx) => {
    if (prevPoints === null || s.points !== prevPoints) rank = idx + 1;
    prevPoints = s.points;
    return { name: s.name, points: s.points, rank, level: levelLabel(s.points) };
  });
}

// ---------- Lưu/tải (nhận kho như tham số để test được) ----------
// store: object có getItem(key)/setItem(key, value) như localStorage.
function saveState(store, key, value) {
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) { return false; }
}
function loadState(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) { return fallback; }
}

if (typeof window !== 'undefined') window.UH_LOPHOC3 = { SAMPLE_CLASS, displayNames, givenLabels, shuffle, seededRand, shuffleSeats, shuffleEmptySeats, resizeSeats, swapSeats, pairKey, countRepeats, pairUp, pairingKeys, levelLabel, rankStudents, saveState, loadState };
export { SAMPLE_CLASS, displayNames, givenLabels, shuffle, seededRand, shuffleSeats, shuffleEmptySeats, resizeSeats, swapSeats, pairKey, countRepeats, pairUp, pairingKeys, levelLabel, rankStudents, saveState, loadState };
