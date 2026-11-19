// Ma trận và bản đặc tả đề kiểm tra — logic thuần. Một nguồn duy
// nhất cho cả trang công cụ (build.mjs chèn file này vào trang, trừ
// dòng export cuối, để init() gọi qua window.UH_MATRAN) và bộ kiểm
// scripts/test-ma-tran.mjs — số trên trang và trong test là một,
// theo đúng mẫu src/nhan-xet-logic.js và src/so-diem-logic.js.
//
// QUY ƯỚC MA TRẬN + BẢN ĐẶC TẢ (đối chiếu 20/11/2026):
// - Ma trận là bảng 2 chiều: hàng = chủ đề, cột = mức độ; mỗi ô ghi
//   số câu + số điểm (Tài liệu tập huấn của Bộ GD&ĐT về xây dựng ma
//   trận, đặc tả đề kiểm tra định kỳ môn Toán THPT 2023 + môn Lịch
//   sử và Địa lí THCS 2022; Công văn 5512/BGDĐT-GDTrH về xây dựng
//   và tổ chức thực hiện kế hoạch giáo dục).
// - Bản đặc tả: với mỗi câu trong ma trận ghi rõ chủ đề, mức độ,
//   dạng câu hỏi (trắc nghiệm/tự luận), số điểm và yêu cầu cần đạt
//   (viết bằng động từ đo được: Nhận biết dùng "nhận biết được,
//   nêu được"; Thông hiểu dùng "giải thích được, so sánh được";
//   Vận dụng dùng "tính được, vận dụng được").
// - Công cụ dùng 4 mức độ quen thuộc: Nhận biết / Thông hiểu / Vận
//   dụng / Vận dụng cao (nhiều trường vẫn dùng theo hướng dẫn cũ).
//   Công văn 7991/BGDĐT-GDTrH ngày 17/12/2024 hướng dẫn THCS, THPT
//   gộp còn 3 mức Biết / Hiểu / Vận dụng — giáo viên theo hướng dẫn
//   mới thì gộp cột Vận dụng cao vào cột Vận dụng (ghi rõ ở FAQ).
// - Tổng điểm toàn đề = 10 điểm, tổng tỷ lệ = 100%. Điểm mỗi câu
//   trắc nghiệm chung cho cả đề (mặc định 0,25); điểm mỗi câu tự
//   luận chỉnh được theo từng ô (mặc định 1) vì câu tự luận các mức
//   thường khác điểm nhau.
// - Tỷ lệ % tính trên thang 10 điểm (điểm ô / 10 × 100) nên khi
//   tổng điểm lệch 10 thì tổng tỷ lệ cũng lệch 100% đúng bằng đó —
//   hai cách kiểm là một, hiện cả hai để giáo viên thấy ngay.

// 4 mức độ đánh giá (thứ tự cố định trong ma trận + bản đặc tả).
const LEVELS = [
  { id: 'nhan-biet', name: 'Nhận biết', short: 'NB' },
  { id: 'thong-hieu', name: 'Thông hiểu', short: 'TH' },
  { id: 'van-dung', name: 'Vận dụng', short: 'VD' },
  { id: 'van-dung-cao', name: 'Vận dụng cao', short: 'VDC' },
];

// Tổng điểm chuẩn của đề kiểm tra + điểm mặc định mỗi câu.
const TOTAL_POINTS = 10;
const DEFAULT_PT_TN = 0.25;
const DEFAULT_PT_TL = 1;

// Làm tròn 2 chữ số thập phân, cộng epsilon để tránh bẫy float
// (0,2 × 3 = 0,6000000000000001 trong số thực nhị phân).
function round2(x) {
  return Math.round(x * 100 + 1e-9) / 100;
}

// Làm tròn 1 chữ số thập phân (dùng cho tỷ lệ %).
function round1(x) {
  return Math.round(x * 10 + 1e-9) / 10;
}

// Hiển thị số điểm theo kiểu Việt Nam: số nguyên không có phần thập
// phân ("10", "5"), còn lại tối đa 2 chữ số, dấu phẩy ("2,75").
function fmtNum(x) {
  if (x == null || Number.isNaN(x)) return '';
  const r = round2(x);
  if (Number.isInteger(r)) return String(r);
  return String(r).replace('.', ',');
}

// Hiển thị tỷ lệ %: 1 chữ số thập phân, dấu phẩy ("27,5%").
function fmtPct(x) {
  if (x == null || Number.isNaN(x)) return '';
  const r = round1(x);
  const s = Number.isInteger(r) ? String(r) : String(r).replace('.', ',');
  return s + '%';
}

// Số câu: số nguyên không âm, tối đa 99; ô trống/chữ thì tính là 0.
function parseCount(v) {
  const n = parseInt(String(v == null ? '' : v).replace(',', '.'), 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(99, n);
}

// Điểm mỗi câu: số 0–10; ô trống/chữ thì dùng giá trị mặc định.
function parsePoints(v, fallback) {
  const n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
  if (Number.isNaN(n) || n < 0) return fallback;
  return Math.min(10, n);
}

// Ô ma trận trống: chưa có câu nào, điểm tự luận mặc định 1.
function emptyCell() {
  return { tn: 0, tl: 0, ptTL: DEFAULT_PT_TL };
}

// Chủ đề trống: đủ 4 mức độ.
function emptyTopic(name) {
  const cells = {};
  LEVELS.forEach((lv) => { cells[lv.id] = emptyCell(); });
  return { name: name || '', periods: '', cells };
}

// Điểm của 1 ô = số câu TN × điểm TN + số câu TL × điểm TL của ô.
function cellStats(cell, ptTN) {
  const tn = parseCount(cell ? cell.tn : 0);
  const tl = parseCount(cell ? cell.tl : 0);
  const ptTL = parsePoints(cell ? cell.ptTL : null, DEFAULT_PT_TL);
  return { tn, tl, questions: tn + tl, points: round2(tn * ptTN + tl * ptTL) };
}

// Tính toàn bộ ma trận: từng ô, từng chủ đề, từng mức độ, tổng đề.
// matrix: { title, subject, minutes, ptTN, topics: [{ name, periods,
//   cells: { levelId: { tn, tl, ptTL } } }] }.
// Tỷ lệ % tính trên thang 10 điểm.
function computeMatrix(matrix) {
  const m = matrix || {};
  const ptTN = parsePoints(m.ptTN, DEFAULT_PT_TN);
  const topics = (m.topics || []).map((t) => {
    const cells = {};
    let questions = 0;
    let tn = 0;
    let tl = 0;
    let points = 0;
    LEVELS.forEach((lv) => {
      const s = cellStats(t && t.cells ? t.cells[lv.id] : null, ptTN);
      cells[lv.id] = s;
      questions += s.questions;
      tn += s.tn;
      tl += s.tl;
      points = round2(points + s.points);
    });
    return {
      name: t ? String(t.name || '') : '',
      periods: t ? t.periods : '',
      cells, questions, tn, tl, points,
      pct: round1((points / TOTAL_POINTS) * 100),
    };
  });
  const levels = LEVELS.map((lv) => {
    let questions = 0;
    let tn = 0;
    let tl = 0;
    let points = 0;
    topics.forEach((t) => {
      const s = t.cells[lv.id];
      questions += s.questions;
      tn += s.tn;
      tl += s.tl;
      points = round2(points + s.points);
    });
    return {
      id: lv.id, name: lv.name, short: lv.short,
      questions, tn, tl, points,
      pct: round1((points / TOTAL_POINTS) * 100),
    };
  });
  const total = { questions: 0, tn: 0, tl: 0, points: 0 };
  topics.forEach((t) => {
    total.questions += t.questions;
    total.tn += t.tn;
    total.tl += t.tl;
    total.points = round2(total.points + t.points);
  });
  total.pct = round1((total.points / TOTAL_POINTS) * 100);
  return { ptTN, topics, levels, total };
}

// Kiểm tổng điểm so với 10: diff âm = thiếu, dương = thừa.
function checkTotals(total) {
  const points = total ? round2(total.points || 0) : 0;
  const diff = round2(points - TOTAL_POINTS);
  return {
    points, diff,
    ok: diff === 0,
    status: diff === 0 ? 'ok' : diff < 0 ? 'thieu' : 'thua',
  };
}

// Mã ổn định cho 1 câu trong bản đặc tả (giữ yêu cầu cần đạt đã gõ
// khi số câu thay đổi): chủ đề + mức độ + dạng + thứ tự trong ô.
function specRowId(topicIdx, levelId, form, idxInCell) {
  return 't' + topicIdx + '-' + levelId + '-' + form + '-' + idxInCell;
}

// Sinh bản đặc tả từ ma trận: Câu 1..N theo thứ tự chủ đề → mức độ
// (Nhận biết → Vận dụng cao) → trắc nghiệm trước, tự luận sau trong
// mỗi ô. requirements: { id: 'yêu cầu cần đạt đã gõ' } để giữ lại
// nội dung khi ma trận đổi số câu.
function buildSpec(matrix, requirements) {
  const m = matrix || {};
  const ptTN = parsePoints(m.ptTN, DEFAULT_PT_TN);
  const req = requirements || {};
  const rows = [];
  (m.topics || []).forEach((t, ti) => {
    LEVELS.forEach((lv) => {
      const cell = t && t.cells ? t.cells[lv.id] : null;
      const tn = parseCount(cell ? cell.tn : 0);
      const tl = parseCount(cell ? cell.tl : 0);
      const ptTL = parsePoints(cell ? cell.ptTL : null, DEFAULT_PT_TL);
      for (let i = 0; i < tn; i++) {
        const id = specRowId(ti, lv.id, 'TN', i);
        rows.push({
          n: rows.length + 1, id,
          topic: t ? String(t.name || '') : '', topicIdx: ti,
          level: lv.name, levelId: lv.id, form: 'TN',
          points: round2(ptTN), requirement: req[id] || '',
        });
      }
      for (let i = 0; i < tl; i++) {
        const id = specRowId(ti, lv.id, 'TL', i);
        rows.push({
          n: rows.length + 1, id,
          topic: t ? String(t.name || '') : '', topicIdx: ti,
          level: lv.name, levelId: lv.id, form: 'TL',
          points: round2(ptTL), requirement: req[id] || '',
        });
      }
    });
  });
  return rows;
}

// Chép ma trận dạng bảng tách tab (dán vào Excel/Word).
function matrixToTsv(matrix, computed) {
  const c = computed || computeMatrix(matrix);
  const lines = [];
  lines.push('Chủ đề\tSố tiết\tNhận biết (câu/điểm)\tThông hiểu (câu/điểm)\tVận dụng (câu/điểm)\tVận dụng cao (câu/điểm)\tTổng câu\tTổng điểm\tTỷ lệ');
  c.topics.forEach((t) => {
    const cells = LEVELS.map((lv) => {
      const s = t.cells[lv.id];
      return s.questions + ' câu/' + fmtNum(s.points) + ' điểm';
    });
    lines.push([t.name, t.periods === '' || t.periods == null ? '' : t.periods]
      .concat(cells).concat([t.questions, fmtNum(t.points), fmtPct(t.pct)]).join('\t'));
  });
  const lvCells = c.levels.map((lv) => lv.questions + ' câu/' + fmtNum(lv.points) + ' điểm');
  lines.push(['Tổng', ''].concat(lvCells).concat([c.total.questions, fmtNum(c.total.points), fmtPct(c.total.pct)]).join('\t'));
  return lines.join('\n') + '\n';
}

// Chép bản đặc tả dạng bảng tách tab.
function specToTsv(rows) {
  const lines = ['Câu\tChủ đề\tMức độ\tDạng câu\tĐiểm\tYêu cầu cần đạt'];
  (rows || []).forEach((r) => {
    lines.push([r.n, r.topic, r.level, r.form, fmtNum(r.points), (r.requirement || '').replace(/\t/g, ' ').replace(/\n/g, ' ')].join('\t'));
  });
  return lines.join('\n') + '\n';
}

// Ma trận mẫu: Toán, kiểm tra giữa học kỳ I, 45 phút, 3 chủ đề,
// tổng 10 điểm. Đã tính tay từng số (ghi trong bộ kiểm):
// - TN 0,25 điểm/câu × 20 câu = 5 điểm; TL 1 điểm/câu × 5 câu = 5 điểm.
// - Theo mức: Nhận biết 2,75 (27,5%); Thông hiểu 3,5 (35%);
//   Vận dụng 2,75 (27,5%); Vận dụng cao 1 (10%).
// - Theo chủ đề: Số hữu tỉ 3,75 (37,5%); Số thực 3,5 (35%);
//   Hình học trực quan 2,75 (27,5%). Tổng 25 câu.
function sampleMatrix() {
  return {
    title: 'Kiểm tra giữa học kỳ I',
    subject: 'Toán',
    minutes: 45,
    ptTN: DEFAULT_PT_TN,
    topics: [
      {
        name: 'Số hữu tỉ', periods: 8,
        cells: {
          'nhan-biet': { tn: 4, tl: 0, ptTL: 1 },
          'thong-hieu': { tn: 2, tl: 1, ptTL: 1 },
          'van-dung': { tn: 1, tl: 1, ptTL: 1 },
          'van-dung-cao': { tn: 0, tl: 0, ptTL: 1 },
        },
      },
      {
        name: 'Số thực', periods: 6,
        cells: {
          'nhan-biet': { tn: 3, tl: 0, ptTL: 1 },
          'thong-hieu': { tn: 2, tl: 0, ptTL: 1 },
          'van-dung': { tn: 1, tl: 1, ptTL: 1 },
          'van-dung-cao': { tn: 0, tl: 1, ptTL: 1 },
        },
      },
      {
        name: 'Hình học trực quan', periods: 6,
        cells: {
          'nhan-biet': { tn: 4, tl: 0, ptTL: 1 },
          'thong-hieu': { tn: 2, tl: 1, ptTL: 1 },
          'van-dung': { tn: 1, tl: 0, ptTL: 1 },
          'van-dung-cao': { tn: 0, tl: 0, ptTL: 1 },
        },
      },
    ],
  };
}

// Sao chép sâu ma trận (tránh sửa lẫn bản mẫu).
function cloneMatrix(m) {
  return JSON.parse(JSON.stringify(m || sampleMatrix()));
}

if (typeof window !== 'undefined') window.UH_MATRAN = { LEVELS, TOTAL_POINTS, DEFAULT_PT_TN, DEFAULT_PT_TL, round2, round1, fmtNum, fmtPct, parseCount, parsePoints, emptyCell, emptyTopic, cellStats, computeMatrix, checkTotals, specRowId, buildSpec, matrixToTsv, specToTsv, sampleMatrix, cloneMatrix };
export { LEVELS, TOTAL_POINTS, DEFAULT_PT_TN, DEFAULT_PT_TL, round2, round1, fmtNum, fmtPct, parseCount, parsePoints, emptyCell, emptyTopic, cellStats, computeMatrix, checkTotals, specRowId, buildSpec, matrixToTsv, specToTsv, sampleMatrix, cloneMatrix };
