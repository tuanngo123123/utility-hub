// test-ma-tran.mjs — Bộ kiểm tra công cụ Ma trận và bản đặc tả đề
// kiểm tra (logic thuần trong src/ma-tran-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet):
// kiểm nào trượt thì build thất bại để không đăng công cụ tính
// điểm ma trận sai lên web.
//
// Mọi số trong file này đều tự tính tay (ghi rõ phép tính):
// - Ma trận mẫu (Toán, 3 chủ đề): TN 0,25đ × 20 câu = 5 điểm;
//   TL 1đ × 5 câu = 5 điểm; tổng 10 điểm, 25 câu.
// - Ma trận thứ hai (2 chủ đề, chỉ trắc nghiệm, 0,5đ/câu):
//   20 câu × 0,5 = 10 điểm.
import {
  LEVELS, TOTAL_POINTS, DEFAULT_PT_TN, DEFAULT_PT_TL,
  round2, round1, fmtNum, fmtPct, parseCount, parsePoints,
  emptyCell, emptyTopic, cellStats, computeMatrix, checkTotals,
  specRowId, buildSpec, matrixToTsv, specToTsv, sampleMatrix, cloneMatrix,
} from '../src/ma-tran-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; failures.push(`${name}:\n  được:    ${a}\n  kỳ vọng: ${e}`); }
}

// --- Hằng số ---
check('TOTAL_POINTS = 10', TOTAL_POINTS, 10);
check('DEFAULT_PT_TN = 0,25', DEFAULT_PT_TN, 0.25);
check('DEFAULT_PT_TL = 1', DEFAULT_PT_TL, 1);
check('LEVELS đủ 4 mức theo đúng thứ tự', LEVELS.map((l) => l.name), ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']);

// --- Làm tròn + định dạng (bẫy float) ---
check('round2(0,2 × 3) = 0,6 (không phải 0,6000000000000001)', round2(0.2 * 3), 0.6);
check('round2(0,1 + 0,2) = 0,3', round2(0.1 + 0.2), 0.3);
check('round1(27,55) = 27,6', round1(27.55), 27.6);
check("fmtNum(10) = '10' (không có ,0)", fmtNum(10), '10');
check("fmtNum(2,75) = '2,75'", fmtNum(2.75), '2,75');
check("fmtNum(0,25) = '0,25'", fmtNum(0.25), '0,25');
check("fmtPct(27,5) = '27,5%'", fmtPct(27.5), '27,5%');
check("fmtPct(100) = '100%'", fmtPct(100), '100%');

// --- Đọc số từ ô nhập ---
check("parseCount('3') = 3", parseCount('3'), 3);
check("parseCount('') = 0", parseCount(''), 0);
check("parseCount('-1') = 0", parseCount('-1'), 0);
check("parseCount('abc') = 0", parseCount('abc'), 0);
check("parseCount('150') chặn ở 99", parseCount('150'), 99);
check("parsePoints('0,5') = 0,5 (dấu phẩy)", parsePoints('0,5', 1), 0.5);
check("parsePoints('') dùng mặc định", parsePoints('', 1), 1);
check("parsePoints('12') chặn ở 10", parsePoints('12', 1), 10);

// --- Ô trống ---
check('emptyCell: 0 câu, TL 1đ', emptyCell(), { tn: 0, tl: 0, ptTL: 1 });
check('emptyTopic: đủ 4 mức', Object.keys(emptyTopic('X').cells), ['nhan-biet', 'thong-hieu', 'van-dung', 'van-dung-cao']);

// --- Điểm 1 ô ---
check('ô 4 TN × 0,25 + 1 TL × 1 = 2 điểm, 5 câu', cellStats({ tn: 4, tl: 1, ptTL: 1 }, 0.25), { tn: 4, tl: 1, questions: 5, points: 2 });
check('ô TL 2đ/câu: 2 TL = 4 điểm', cellStats({ tn: 0, tl: 2, ptTL: 2 }, 0.25), { tn: 0, tl: 2, questions: 2, points: 4 });

// --- Ma trận mẫu: tổng ---
const sample = sampleMatrix();
const c = computeMatrix(sample);
check('mẫu: tổng 25 câu (20 TN + 5 TL)', [c.total.questions, c.total.tn, c.total.tl], [25, 20, 5]);
check('mẫu: tổng 10 điểm', c.total.points, 10);
check('mẫu: tổng 100%', c.total.pct, 100);
check('mẫu: kiểm tổng đạt, lệch 0', checkTotals(c.total), { points: 10, diff: 0, ok: true, status: 'ok' });

// --- Ma trận mẫu: từng chủ đề (tính tay) ---
// CĐ1 Số hữu tỉ: TN 7 × 0,25 = 1,75 + TL 2 × 1 = 2 → 3,75 (37,5%), 9 câu.
// CĐ2 Số thực: TN 6 × 0,25 = 1,5 + TL 2 × 1 = 2 → 3,5 (35%), 8 câu.
// CĐ3 Hình học trực quan: TN 7 × 0,25 = 1,75 + TL 1 × 1 = 1 → 2,75 (27,5%), 8 câu.
check('mẫu CĐ1: 9 câu, 3,75 điểm, 37,5%', [c.topics[0].questions, c.topics[0].points, c.topics[0].pct], [9, 3.75, 37.5]);
check('mẫu CĐ2: 8 câu, 3,5 điểm, 35%', [c.topics[1].questions, c.topics[1].points, c.topics[1].pct], [8, 3.5, 35]);
check('mẫu CĐ3: 8 câu, 2,75 điểm, 27,5%', [c.topics[2].questions, c.topics[2].points, c.topics[2].pct], [8, 2.75, 27.5]);

// --- Ma trận mẫu: từng ô ---
check('mẫu CĐ1 NB: 4 câu, 1 điểm', [c.topics[0].cells['nhan-biet'].questions, c.topics[0].cells['nhan-biet'].points], [4, 1]);
check('mẫu CĐ1 TH: 3 câu, 1,5 điểm', [c.topics[0].cells['thong-hieu'].questions, c.topics[0].cells['thong-hieu'].points], [3, 1.5]);
check('mẫu CĐ1 VD: 2 câu, 1,25 điểm', [c.topics[0].cells['van-dung'].questions, c.topics[0].cells['van-dung'].points], [2, 1.25]);
check('mẫu CĐ1 VDC: 0 câu, 0 điểm', [c.topics[0].cells['van-dung-cao'].questions, c.topics[0].cells['van-dung-cao'].points], [0, 0]);
check('mẫu CĐ2 NB: 3 câu, 0,75 điểm', [c.topics[1].cells['nhan-biet'].questions, c.topics[1].cells['nhan-biet'].points], [3, 0.75]);
check('mẫu CĐ2 TH: 2 câu, 0,5 điểm', [c.topics[1].cells['thong-hieu'].questions, c.topics[1].cells['thong-hieu'].points], [2, 0.5]);
check('mẫu CĐ2 VD: 2 câu, 1,25 điểm', [c.topics[1].cells['van-dung'].questions, c.topics[1].cells['van-dung'].points], [2, 1.25]);
check('mẫu CĐ2 VDC: 1 câu, 1 điểm', [c.topics[1].cells['van-dung-cao'].questions, c.topics[1].cells['van-dung-cao'].points], [1, 1]);
check('mẫu CĐ3 NB: 4 câu, 1 điểm', [c.topics[2].cells['nhan-biet'].questions, c.topics[2].cells['nhan-biet'].points], [4, 1]);
check('mẫu CĐ3 TH: 3 câu, 1,5 điểm', [c.topics[2].cells['thong-hieu'].questions, c.topics[2].cells['thong-hieu'].points], [3, 1.5]);
check('mẫu CĐ3 VD: 1 câu, 0,25 điểm', [c.topics[2].cells['van-dung'].questions, c.topics[2].cells['van-dung'].points], [1, 0.25]);

// --- Ma trận mẫu: từng mức độ (tính tay) ---
// NB: TN 11 × 0,25 = 2,75 (27,5%). TH: TN 6 × 0,25 + TL 2 × 1 = 3,5 (35%).
// VD: TN 3 × 0,25 + TL 2 × 1 = 2,75 (27,5%). VDC: TL 1 × 1 = 1 (10%).
check('mẫu mức NB: 11 câu, 2,75 điểm, 27,5%', [c.levels[0].questions, c.levels[0].points, c.levels[0].pct], [11, 2.75, 27.5]);
check('mẫu mức TH: 8 câu, 3,5 điểm, 35%', [c.levels[1].questions, c.levels[1].points, c.levels[1].pct], [8, 3.5, 35]);
check('mẫu mức VD: 5 câu, 2,75 điểm, 27,5%', [c.levels[2].questions, c.levels[2].points, c.levels[2].pct], [5, 2.75, 27.5]);
check('mẫu mức VDC: 1 câu, 1 điểm, 10%', [c.levels[3].questions, c.levels[3].points, c.levels[3].pct], [1, 1, 10]);

// --- Bản đặc tả từ ma trận mẫu ---
const spec = buildSpec(sample, {});
check('đặc tả mẫu: 25 dòng = 25 câu', spec.length, 25);
check('đặc tả: 20 TN + 5 TL', [spec.filter((r) => r.form === 'TN').length, spec.filter((r) => r.form === 'TL').length], [20, 5]);
check('đặc tả Câu 1: CĐ1/NB/TN/0,25', [spec[0].n, spec[0].topic, spec[0].level, spec[0].form, spec[0].points], [1, 'Số hữu tỉ', 'Nhận biết', 'TN', 0.25]);
check('đặc tả Câu 7: CĐ1/TH/TL/1', [spec[6].n, spec[6].topic, spec[6].level, spec[6].form, spec[6].points], [7, 'Số hữu tỉ', 'Thông hiểu', 'TL', 1]);
check('đặc tả Câu 9: CĐ1/VD/TL/1', [spec[8].n, spec[8].topic, spec[8].level, spec[8].form, spec[8].points], [9, 'Số hữu tỉ', 'Vận dụng', 'TL', 1]);
check('đặc tả Câu 17: CĐ2/VDC/TL/1', [spec[16].n, spec[16].topic, spec[16].level, spec[16].form, spec[16].points], [17, 'Số thực', 'Vận dụng cao', 'TL', 1]);
check('đặc tả Câu 25: CĐ3/VD/TN/0,25', [spec[24].n, spec[24].topic, spec[24].level, spec[24].form, spec[24].points], [25, 'Hình học trực quan', 'Vận dụng', 'TN', 0.25]);
check('đặc tả: tổng điểm các câu = 10', round2(spec.reduce((a, r) => a + r.points, 0)), 10);
check('đặc tả: số câu từng chủ đề khớp ma trận', [spec.filter((r) => r.topicIdx === 0).length, spec.filter((r) => r.topicIdx === 1).length, spec.filter((r) => r.topicIdx === 2).length], [9, 8, 8]);
check('đặc tả: mã câu ổn định', specRowId(1, 'van-dung-cao', 'TL', 0), 't1-van-dung-cao-TL-0');

// Yêu cầu cần đạt đã gõ được giữ lại khi sinh lại đặc tả.
const withReq = buildSpec(sample, { 't0-nhan-biet-TN-0': 'Nhận biết được số hữu tỉ.' });
check('đặc tả giữ yêu cầu cần đạt theo mã câu', withReq[0].requirement, 'Nhận biết được số hữu tỉ.');
check('đặc tả câu khác không bị lây yêu cầu', withReq[1].requirement, '');

// --- Lệch tổng: báo đúng số lệch ---
const less = cloneMatrix(sample);
less.topics[0].cells['nhan-biet'].tn = 3; // bớt 1 câu TN 0,25đ
const cLess = computeMatrix(less);
check('bớt 1 TN: tổng 9,75', cLess.total.points, 9.75);
check('bớt 1 TN: thiếu 0,25', checkTotals(cLess.total), { points: 9.75, diff: -0.25, ok: false, status: 'thieu' });
const more = cloneMatrix(sample);
more.topics[0].cells['van-dung-cao'].tl = 1; // thêm 1 câu TL 1đ
const cMore = computeMatrix(more);
check('thêm 1 TL: tổng 11', cMore.total.points, 11);
check('thêm 1 TL: thừa 1', checkTotals(cMore.total), { points: 11, diff: 1, ok: false, status: 'thua' });

// --- Ma trận thứ hai: 2 chủ đề, chỉ trắc nghiệm, 0,5đ/câu (tính tay) ---
// "Phân số": NB 6, TH 4, VD 2 → 12 câu × 0,5 = 6 điểm (60%).
// "Số thập phân": NB 4, TH 2, VD 2 → 8 câu × 0,5 = 4 điểm (40%).
// Mức: NB 10 câu = 5 điểm (50%); TH 6 câu = 3 điểm (30%); VD 4 câu = 2 điểm (20%); VDC 0.
const m2 = {
  title: 'Kiểm tra 15 phút', subject: 'Toán', minutes: 15, ptTN: 0.5,
  topics: [
    { name: 'Phân số', periods: 10, cells: {
      'nhan-biet': { tn: 6, tl: 0, ptTL: 1 }, 'thong-hieu': { tn: 4, tl: 0, ptTL: 1 },
      'van-dung': { tn: 2, tl: 0, ptTL: 1 }, 'van-dung-cao': { tn: 0, tl: 0, ptTL: 1 } } },
    { name: 'Số thập phân', periods: 8, cells: {
      'nhan-biet': { tn: 4, tl: 0, ptTL: 1 }, 'thong-hieu': { tn: 2, tl: 0, ptTL: 1 },
      'van-dung': { tn: 2, tl: 0, ptTL: 1 }, 'van-dung-cao': { tn: 0, tl: 0, ptTL: 1 } } },
  ],
};
const c2 = computeMatrix(m2);
check('m2: 20 câu TN, 10 điểm, 100%', [c2.total.questions, c2.total.tn, c2.total.tl, c2.total.points, c2.total.pct], [20, 20, 0, 10, 100]);
check('m2 CĐ1: 12 câu, 6 điểm, 60%', [c2.topics[0].questions, c2.topics[0].points, c2.topics[0].pct], [12, 6, 60]);
check('m2 CĐ2: 8 câu, 4 điểm, 40%', [c2.topics[1].questions, c2.topics[1].points, c2.topics[1].pct], [8, 4, 40]);
check('m2 mức NB: 10 câu, 5 điểm, 50%', [c2.levels[0].questions, c2.levels[0].points, c2.levels[0].pct], [10, 5, 50]);
check('m2 mức TH: 6 câu, 3 điểm, 30%', [c2.levels[1].questions, c2.levels[1].points, c2.levels[1].pct], [6, 3, 30]);
check('m2 mức VD: 4 câu, 2 điểm, 20%', [c2.levels[2].questions, c2.levels[2].points, c2.levels[2].pct], [4, 2, 20]);
check('m2 mức VDC: 0 câu, 0 điểm', [c2.levels[3].questions, c2.levels[3].points, c2.levels[3].pct], [0, 0, 0]);
const spec2 = buildSpec(m2, {});
check('m2 đặc tả: 20 dòng, toàn TN', [spec2.length, spec2.filter((r) => r.form === 'TN').length], [20, 20]);
check('m2 đặc tả Câu 1: Phân số/NB/TN/0,5', [spec2[0].topic, spec2[0].level, spec2[0].form, spec2[0].points], ['Phân số', 'Nhận biết', 'TN', 0.5]);
check('m2 đặc tả Câu 20: Số thập phân/VD/TN/0,5', [spec2[19].topic, spec2[19].level, spec2[19].form, spec2[19].points], ['Số thập phân', 'Vận dụng', 'TN', 0.5]);

// --- Ma trận rỗng ---
const cEmpty = computeMatrix({ title: '', subject: '', minutes: '', ptTN: 0.25, topics: [] });
check('ma trận rỗng: tổng 0 câu 0 điểm', [cEmpty.total.questions, cEmpty.total.points], [0, 0]);
check('ma trận rỗng: thiếu 10 điểm', checkTotals(cEmpty.total).diff, -10);
check('ma trận rỗng: đặc tả 0 dòng', buildSpec({ topics: [] }, {}).length, 0);

// --- Sao chép sâu không sửa lẫn bản mẫu ---
const copy = cloneMatrix(sample);
copy.topics[0].cells['nhan-biet'].tn = 99;
check('cloneMatrix: sửa bản sao không đổi bản mẫu', sampleMatrix().topics[0].cells['nhan-biet'].tn, 4);

// --- Xuất văn bản tách tab ---
const tsv = matrixToTsv(sample, c);
check('TSV ma trận: có dòng tiêu đề', tsv.split('\n')[0].startsWith('Chủ đề\tSố tiết\tNhận biết'), true);
check('TSV ma trận: có chủ đề + điểm 3,75', tsv.includes('Số hữu tỉ') && tsv.includes('3,75'), true);
check('TSV ma trận: dòng tổng 25 câu, 10 điểm', tsv.includes('Tổng\t\t11 câu/2,75 điểm'), true);
const tsvSpec = specToTsv(spec);
check('TSV đặc tả: tiêu đề đủ 6 cột', tsvSpec.split('\n')[0], 'Câu\tChủ đề\tMức độ\tDạng câu\tĐiểm\tYêu cầu cần đạt');
check('TSV đặc tả: 26 dòng (tiêu đề + 25 câu)', tsvSpec.trim().split('\n').length, 26);
check('TSV đặc tả: dòng Câu 1 đúng', tsvSpec.split('\n')[1], '1\tSố hữu tỉ\tNhận biết\tTN\t0,25\t');

console.log(`test-ma-tran: ${passed} đạt, ${failed} trượt.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
