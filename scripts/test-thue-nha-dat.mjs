// Kiểm thuế phí mua bán nhà đất (src/thue-nha-dat-logic.js).
// Công cụ: thue-phi-mua-ban-nha-dat — mọi điểm neo tính tay từ văn bản
// (xem đầu file logic). Gắn vào `npm run build`: build dừng nếu test
// này lỗi. Chạy riêng: node scripts/test-thue-nha-dat.mjs
import { PIT_RATE, REG_FEE_RATE, APPRAISAL_RATE, APPRAISAL_MAX, CERT_FEE, VNEID_REDUCTION_RATE, VNEID_REDUCTION_MAX, NOTARY_MAX, notaryFee, notaryFeeBreakdown, computeFees, parseMoney } from '../src/thue-nha-dat-logic.js';

let passed = 0;
let failed = 0;
const failures = [];
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { passed += 1; return; }
  failed += 1;
  failures.push(`${name}\n  kỳ vọng: ${e}\n  thực tế: ${a}`);
}
function checkFees(name, actual, expected) {
  const pick = (o) => ({ pit: o.pit, regFee: o.regFee, notary: o.notary, appraisalFee: o.appraisalFee, certFee: o.certFee, total: o.total, sellerPays: o.sellerPays, buyerPays: o.buyerPays });
  check(name, pick(actual), expected);
}

// --- Tỷ lệ, trần, mức phí ---
check('hằng số', { PIT_RATE, REG_FEE_RATE, APPRAISAL_RATE, APPRAISAL_MAX, CERT_FEE, VNEID_REDUCTION_RATE, VNEID_REDUCTION_MAX, NOTARY_MAX },
  { PIT_RATE: 0.02, REG_FEE_RATE: 0.005, APPRAISAL_RATE: 0.0015, APPRAISAL_MAX: 5000000, CERT_FEE: 100000, VNEID_REDUCTION_RATE: 0.1, VNEID_REDUCTION_MAX: 12650000, NOTARY_MAX: 70000000 });

// --- Phí công chứng từng nấc (TT 257/2016, sửa bởi TT 111/2017) ---
check('công chứng 40tr', notaryFee(40000000), 50000);
check('công chứng 50tr (ranh dưới)', notaryFee(50000000), 100000);
check('công chứng 80tr', notaryFee(80000000), 100000);
check('công chứng 100tr (ranh)', notaryFee(100000000), 100000);
check('công chứng 500tr', notaryFee(500000000), 500000);
check('công chứng 1 tỷ (ranh 0,1%)', notaryFee(1000000000), 1000000);
check('công chứng 1,5 tỷ', notaryFee(1500000000), 1300000);
check('công chứng 3 tỷ (ranh)', notaryFee(3000000000), 2200000);
check('công chứng 4 tỷ', notaryFee(4000000000), 2700000);
check('công chứng 5,5 tỷ', notaryFee(5500000000), 3400000);
check('công chứng 8 tỷ', notaryFee(8000000000), 4400000);
check('công chứng 20 tỷ', notaryFee(20000000000), 8200000);
check('công chứng 150 tỷ', notaryFee(150000000000), 42200000);
check('công chứng 500 tỷ (chạm trần 70tr)', notaryFee(500000000000), 70000000);
check('công chứng chi tiết 3 tỷ', notaryFeeBreakdown(3000000000), { fee: 2200000, base: 1000000, rate: 0.0006, excess: 2000000000, capped: false });
check('công chứng chi tiết 500 tỷ (capped)', notaryFeeBreakdown(500000000000).capped, true);

// --- Nhà 3 tỷ thông thường ---
// TNCN 2%×3 tỷ=60tr; LPTB 0,5%×3 tỷ=15tr; công chứng 1tr+0,06%×2 tỷ=
// 2,2tr; thẩm định 0,15%×3 tỷ=4,5tr; cấp sổ 100k. Tổng 81,8tr.
checkFees('nhà 3 tỷ thông thường',
  computeFees({ contractPrice: 3000000000, tablePrice: 0, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 60000000, regFee: 15000000, notary: 2200000, appraisalFee: 4500000, certFee: 100000, total: 81800000, sellerPays: 60000000, buyerPays: 21800000 });

// --- Đất 1 tỷ ---
// TNCN 20tr; LPTB 5tr; công chứng 0,1%×1 tỷ=1tr; thẩm định 1,5tr;
// cấp sổ 100k. Tổng 27,6tr.
checkFees('đất 1 tỷ',
  computeFees({ contractPrice: 1000000000, tablePrice: 0, type: 'dat-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 20000000, regFee: 5000000, notary: 1000000, appraisalFee: 1500000, certFee: 100000, total: 27600000, sellerPays: 20000000, buyerPays: 7600000 });

// --- Miễn thuế TNCN: chuyển nhượng giữa người thân, nhà 3 tỷ ---
checkFees('miễn TNCN người thân, nhà 3 tỷ',
  computeFees({ contractPrice: 3000000000, tablePrice: 0, type: 'nha-o', exemption: 'relative', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 0, regFee: 15000000, notary: 2200000, appraisalFee: 4500000, certFee: 100000, total: 21800000, sellerPays: 0, buyerPays: 21800000 });

// --- Miễn thuế TNCN: nhà ở, đất ở duy nhất, đất 1 tỷ ---
checkFees('miễn TNCN nhà duy nhất, đất 1 tỷ',
  computeFees({ contractPrice: 1000000000, tablePrice: 0, type: 'dat-o', exemption: 'only-home', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 0, regFee: 5000000, notary: 1000000, appraisalFee: 1500000, certFee: 100000, total: 7600000, sellerPays: 0, buyerPays: 7600000 });

// --- Giá hợp đồng thấp hơn bảng giá: tính theo bảng giá ---
// Hợp đồng 2 tỷ, bảng giá 2,5 tỷ → giá tính 2,5 tỷ: TNCN 50tr; LPTB
// 12,5tr; công chứng 1tr+0,06%×1,5 tỷ=1,9tr; thẩm định 3,75tr;
// cấp sổ 100k. Tổng 68,25tr.
check('bảng giá cao hơn: giá tính + cờ',
  (() => { const r = computeFees({ contractPrice: 2000000000, tablePrice: 2500000000, type: 'nha-dat', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }); return { base: r.base, baseFromTable: r.baseFromTable }; })(),
  { base: 2500000000, baseFromTable: true });
checkFees('bảng giá cao hơn: các khoản',
  computeFees({ contractPrice: 2000000000, tablePrice: 2500000000, type: 'nha-dat', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 50000000, regFee: 12500000, notary: 1900000, appraisalFee: 3750000, certFee: 100000, total: 68250000, sellerPays: 50000000, buyerPays: 18250000 });

// --- Giá hợp đồng cao hơn bảng giá: tính theo hợp đồng ---
// Hợp đồng 2 tỷ, bảng giá 1,5 tỷ → giá tính 2 tỷ: TNCN 40tr; LPTB
// 10tr; công chứng 1tr+0,06%×1 tỷ=1,6tr; thẩm định 3tr; cấp sổ 100k.
// Tổng 54,7tr.
check('bảng giá thấp hơn: giá tính + cờ',
  (() => { const r = computeFees({ contractPrice: 2000000000, tablePrice: 1500000000, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }); return { base: r.base, baseFromTable: r.baseFromTable }; })(),
  { base: 2000000000, baseFromTable: false });
checkFees('bảng giá thấp hơn: các khoản',
  computeFees({ contractPrice: 2000000000, tablePrice: 1500000000, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 40000000, regFee: 10000000, notary: 1600000, appraisalFee: 3000000, certFee: 100000, total: 54700000, sellerPays: 40000000, buyerPays: 14700000 });

// --- Giảm 10% lệ phí trước bạ khi khai điện tử bằng VNeID ---
// Nhà 3 tỷ: LPTB 15tr, giảm 1,5tr còn 13,5tr. Tổng 80,3tr.
check('VNeID nhà 3 tỷ: giảm + LPTB sau giảm',
  (() => { const r = computeFees({ contractPrice: 3000000000, tablePrice: 0, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: true }); return { vneidApplied: r.vneidApplied, vneidReduction: r.vneidReduction, regFee: r.regFee, total: r.total }; })(),
  { vneidApplied: true, vneidReduction: 1500000, regFee: 13500000, total: 80300000 });
// Nhà 30 tỷ: LPTB 150tr, 10% là 15tr nhưng chạm trần 12,65tr →
// LPTB còn 137,35tr. Tổng = 600tr + 137,35tr + 11,2tr + 5tr + 100k.
check('VNeID nhà 30 tỷ: chạm trần 12,65tr',
  (() => { const r = computeFees({ contractPrice: 30000000000, tablePrice: 0, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: true }); return { vneidReduction: r.vneidReduction, regFee: r.regFee, total: r.total }; })(),
  { vneidReduction: 12650000, regFee: 137350000, total: 753650000 });

// --- Phí thẩm định chạm trần 5tr: giá 4 tỷ (0,15% = 6tr → 5tr) ---
// TNCN 80tr; LPTB 20tr; công chứng 2,7tr; thẩm định 5tr; cấp sổ 100k.
// Tổng 107,8tr.
checkFees('thẩm định chạm trần, giá 4 tỷ',
  computeFees({ contractPrice: 4000000000, tablePrice: 0, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: true, vneid: false }),
  { pit: 80000000, regFee: 20000000, notary: 2700000, appraisalFee: 5000000, certFee: 100000, total: 107800000, sellerPays: 80000000, buyerPays: 27800000 });

// --- Không tính phí thẩm định: nhà 3 tỷ ---
checkFees('không tính thẩm định, nhà 3 tỷ',
  computeFees({ contractPrice: 3000000000, tablePrice: 0, type: 'nha-o', exemption: 'none', pitPayer: 'seller', appraisal: false, vneid: false }),
  { pit: 60000000, regFee: 15000000, notary: 2200000, appraisalFee: 0, certFee: 100000, total: 77300000, sellerPays: 60000000, buyerPays: 17300000 });

// --- Thuế TNCN do bên mua chịu (theo thỏa thuận): tổng không đổi,
// chỉ chia lại bên chịu.
checkFees('TNCN do bên mua chịu, nhà 3 tỷ',
  computeFees({ contractPrice: 3000000000, tablePrice: 0, type: 'nha-o', exemption: 'none', pitPayer: 'buyer', appraisal: true, vneid: false }),
  { pit: 60000000, regFee: 15000000, notary: 2200000, appraisalFee: 4500000, certFee: 100000, total: 81800000, sellerPays: 0, buyerPays: 81800000 });

// --- parseMoney ---
check('parseMoney: dấu chấm', parseMoney('3.000.000.000'), 3000000000);
check('parseMoney: khoảng trắng', parseMoney('  2 500 000 000 '), 2500000000);
check('parseMoney: trống', parseMoney(''), null);
check('parseMoney: chữ', parseMoney('ba tỷ'), null);
check('parseMoney: âm', parseMoney('-1000'), null);

console.log(`test-thue-nha-dat: ${passed} đạt, ${failed} lỗi`);
if (failed > 0) {
  console.error(failures.join('\n---\n'));
  process.exit(1);
}
