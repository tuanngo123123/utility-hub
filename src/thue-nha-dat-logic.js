// Thuế phí mua bán nhà đất — công thức thuần (năm tính thuế 2026).
// File này KHÔNG đụng DOM: build.mjs chèn vào trang công cụ, test
// chạy trực tiếp bằng node.
//
// Văn bản (đã tra, xem báo cáo đợt này):
// - Thuế TNCN chuyển nhượng bất động sản: 2% trên giá chuyển nhượng
//   (Điều 14 Luật Thuế TNCN 109/2025/QH15, hiệu lực 01/7/2026;
//   Điều 57 Nghị định 253/2026/NĐ-CP). Không tính trên lãi, chưa áp
//   dụng cách tính theo thời gian nắm giữ.
// - Miễn thuế TNCN (Điều 4 Luật 109/2025; Điều 18, 19, 20 NĐ 253/2026):
//   + Chuyển nhượng giữa vợ với chồng; cha mẹ đẻ/nuôi với con đẻ/nuôi;
//     cha mẹ chồng với con dâu; cha mẹ vợ với con rể; ông bà nội/ngoại
//     với cháu nội/ngoại; anh, chị, em ruột với nhau.
//   + Bán nhà ở, đất ở duy nhất: đủ cả 3 điều kiện — chỉ có một nhà ở
//     hoặc một thửa đất ở duy nhất tại Việt Nam; đã sở hữu từ đủ 183
//     ngày; chuyển nhượng toàn bộ. Không áp dụng cho nhà ở hình thành
//     trong tương lai.
// - Lệ phí trước bạ: 0,5% (khoản 1 Điều 8 Nghị định 10/2022/NĐ-CP,
//   sửa bởi Nghị định 175/2025/NĐ-CP). Giảm 10% khi khai và nộp hoàn
//   toàn bằng phương thức điện tử (VNeID mức 2), tối đa 5 lần lương
//   cơ sở = 12.650.000₫, từ 15/8/2026 đến 28/02/2027 (Nghị quyết
//   66.22/2026/NQ-CP, Thông tư 117/2026/TT-BTC).
// - Giá tính thuế TNCN và lệ phí trước bạ: giá hợp đồng, nhưng không
//   thấp hơn giá theo bảng giá đất và giá tính lệ phí trước bạ nhà do
//   UBND cấp tỉnh ban hành (Điều 7 NĐ 10/2022, sửa bởi NĐ 175/2025:
//   giá hợp đồng cao hơn thì lấy giá hợp đồng). Công cụ lấy giá cao
//   hơn trong hai giá làm giá tính cho cả 4 khoản (thuế TNCN, lệ phí
//   trước bạ, phí công chứng, phí thẩm định) — phí công chứng cũng
//   tính theo giá Nhà nước khi giá thỏa thuận thấp hơn (TT 257/2016).
// - Phí công chứng hợp đồng (khoản 2 Điều 4 Thông tư 257/2016/TT-BTC,
//   sửa bởi Thông tư 111/2017/TT-BTC): dưới 50 triệu 50.000₫; 50–100
//   triệu 100.000₫; trên 100 triệu–1 tỷ 0,1%; trên 1–3 tỷ 1.000.000₫
//   + 0,06% phần vượt 1 tỷ; trên 3–5 tỷ 2.200.000₫ + 0,05% phần vượt
//   3 tỷ; trên 5–10 tỷ 3.200.000₫ + 0,04% phần vượt 5 tỷ; trên 10–100
//   tỷ 5.200.000₫ + 0,03% phần vượt 10 tỷ; trên 100 tỷ 32.200.000₫ +
//   0,02% phần vượt 100 tỷ, tối đa 70.000.000₫. Chưa gồm thù lao soạn
//   thảo/đánh máy theo mức trần của UBND cấp tỉnh.
// - Phí thẩm định hồ sơ cấp Giấy chứng nhận + lệ phí cấp Giấy chứng
//   nhận do HĐND cấp tỉnh quyết (Thông tư 85/2019/TT-BTC) nên khác
//   nhau theo địa phương. Công cụ dùng mức Hà Nội làm mặc định cho
//   phí thẩm định (0,15% giá trị chuyển nhượng, tối đa 5.000.000₫/hồ
//   sơ — Nghị quyết 06/2020/NQ-HĐND) và mức phổ biến 100.000₫ cho lệ
//   phí cấp Giấy chứng nhận; trang công cụ ghi rõ đối chiếu địa phương.
// - Bên chịu theo thông lệ: bên bán chịu thuế TNCN; bên mua chịu lệ
//   phí trước bạ, phí công chứng, phí thẩm định, lệ phí cấp sổ. Hai
//   bên có thể thỏa thuận khác — công cụ cho chọn bên chịu thuế TNCN.

const PIT_RATE = 0.02;
const REG_FEE_RATE = 0.005;
const APPRAISAL_RATE = 0.0015;
const APPRAISAL_MAX = 5000000;
const CERT_FEE = 100000;
const VNEID_REDUCTION_RATE = 0.1;
const VNEID_REDUCTION_MAX = 12650000;
const NOTARY_MAX = 70000000;

// Biểu phí công chứng theo giá trị hợp đồng (TT 257/2016, sửa bởi
// TT 111/2017). Ranh giới theo đúng chữ trong biểu: "từ 50 triệu đến
// 100 triệu" (100 triệu vẫn 100.000₫), "trên 100 triệu đến 1 tỷ"
// (1 tỷ vẫn 0,1% = 1.000.000₫) — các nấc nối tiếp nhau liên tục.
function notaryFee(value) {
  if (!value || value <= 0) return 0;
  if (value < 50000000) return 50000;
  if (value <= 100000000) return 100000;
  if (value <= 1000000000) return Math.round(value * 0.001);
  if (value <= 3000000000) return Math.round(1000000 + (value - 1000000000) * 0.0006);
  if (value <= 5000000000) return Math.round(2200000 + (value - 3000000000) * 0.0005);
  if (value <= 10000000000) return Math.round(3200000 + (value - 5000000000) * 0.0004);
  if (value <= 100000000000) return Math.round(5200000 + (value - 10000000000) * 0.0003);
  return Math.min(NOTARY_MAX, Math.round(32200000 + (value - 100000000000) * 0.0002));
}

// Chi tiết phí công chứng để bảng từng bước giải thích được công thức:
// { fee, base, rate, excess, capped } — fee = base + rate × excess,
// capped = true khi chạm trần 70.000.000₫.
function notaryFeeBreakdown(value) {
  const fee = notaryFee(value);
  if (!value || value <= 0) return { fee: 0, base: 0, rate: 0, excess: 0, capped: false };
  if (value < 50000000) return { fee, base: 50000, rate: 0, excess: 0, capped: false };
  if (value <= 100000000) return { fee, base: 100000, rate: 0, excess: 0, capped: false };
  if (value <= 1000000000) return { fee, base: 0, rate: 0.001, excess: value, capped: false };
  if (value <= 3000000000) return { fee, base: 1000000, rate: 0.0006, excess: value - 1000000000, capped: false };
  if (value <= 5000000000) return { fee, base: 2200000, rate: 0.0005, excess: value - 3000000000, capped: false };
  if (value <= 10000000000) return { fee, base: 3200000, rate: 0.0004, excess: value - 5000000000, capped: false };
  if (value <= 100000000000) return { fee, base: 5200000, rate: 0.0003, excess: value - 10000000000, capped: false };
  const uncapped = Math.round(32200000 + (value - 100000000000) * 0.0002);
  return { fee, base: 32200000, rate: 0.0002, excess: value - 100000000000, capped: uncapped > NOTARY_MAX };
}

// Tính thuế phí phải nộp khi mua bán nhà đất.
// input: { contractPrice, tablePrice, type, exemption, pitPayer,
//   appraisal, vneid }
//   contractPrice: giá chuyển nhượng trên hợp đồng (bắt buộc).
//   tablePrice: giá theo bảng giá của tỉnh (0 hoặc để trống = không có).
//   type: 'nha-o' | 'dat-o' | 'nha-dat' (chỉ để ghi chú, tỷ lệ các
//     khoản không khác nhau theo loại).
//   exemption: 'none' | 'relative' | 'only-home' (miễn thuế TNCN).
//   pitPayer: 'seller' (thông lệ) | 'buyer' (theo thỏa thuận).
//   appraisal: tính phí thẩm định hồ sơ hay không.
//   vneid: khai nộp lệ phí trước bạ điện tử bằng VNeID mức 2
//     (giảm 10%, tối đa 12.650.000₫, đến 28/02/2027).
// Trả { contractPrice, tablePrice, base, baseFromTable, type,
//   exemption, pitExempt, pit, regFeeBeforeReduction, vneidApplied,
//   vneidReduction, regFee, notary, notaryCapped, appraisalApplied,
//   appraisalFee, certFee, total, sellerPays, buyerPays }.
// Mọi số tiền làm tròn tới đồng.
function computeFees(input) {
  const inp = input || {};
  const contractPrice = Math.max(0, inp.contractPrice || 0);
  const tablePrice = Math.max(0, inp.tablePrice || 0);
  // Giá tính: giá cao hơn trong hai giá (giá hợp đồng ghi thấp hơn
  // bảng giá tỉnh thì cơ quan thuế lấy bảng giá).
  const base = Math.max(contractPrice, tablePrice);
  const baseFromTable = tablePrice > contractPrice;
  const type = inp.type === 'dat-o' || inp.type === 'nha-dat' ? inp.type : 'nha-o';
  const exemption = inp.exemption === 'relative' || inp.exemption === 'only-home' ? inp.exemption : 'none';
  const pitExempt = exemption !== 'none';
  const pit = pitExempt ? 0 : Math.round(base * PIT_RATE);
  const regFeeBeforeReduction = Math.round(base * REG_FEE_RATE);
  const vneidApplied = !!inp.vneid && regFeeBeforeReduction > 0;
  const vneidReduction = vneidApplied
    ? Math.min(Math.round(regFeeBeforeReduction * VNEID_REDUCTION_RATE), VNEID_REDUCTION_MAX)
    : 0;
  const regFee = regFeeBeforeReduction - vneidReduction;
  const nb = notaryFeeBreakdown(base);
  const notary = nb.fee;
  const appraisalApplied = !!inp.appraisal;
  const appraisalFee = appraisalApplied
    ? Math.min(Math.round(base * APPRAISAL_RATE), APPRAISAL_MAX)
    : 0;
  const certFee = CERT_FEE;
  const total = pit + regFee + notary + appraisalFee + certFee;
  const pitPayer = inp.pitPayer === 'buyer' ? 'buyer' : 'seller';
  const sellerPays = pitPayer === 'seller' ? pit : 0;
  const buyerPays = total - sellerPays;
  return {
    contractPrice,
    tablePrice,
    base,
    baseFromTable,
    type,
    exemption,
    pitExempt,
    pit,
    regFeeBeforeReduction,
    vneidApplied,
    vneidReduction,
    regFee,
    notary,
    notaryCapped: nb.capped,
    appraisalApplied,
    appraisalFee,
    certFee,
    total,
    sellerPays,
    buyerPays,
  };
}

// Đọc số tiền từ ô nhập: chấp nhận dấu chấm ngăn nghìn, khoảng
// trắng, dấu phẩy thập phân. Trả số >= 0, hoặc null khi ô trống,
// không phải số, hoặc âm (để giao diện báo lỗi thay vì đoán).
function parseMoney(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/[\s.]/g, '').replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

if (typeof window !== 'undefined') window.UH_THUENHADAT = { PIT_RATE, REG_FEE_RATE, APPRAISAL_RATE, APPRAISAL_MAX, CERT_FEE, VNEID_REDUCTION_RATE, VNEID_REDUCTION_MAX, NOTARY_MAX, notaryFee, notaryFeeBreakdown, computeFees, parseMoney };
export { PIT_RATE, REG_FEE_RATE, APPRAISAL_RATE, APPRAISAL_MAX, CERT_FEE, VNEID_REDUCTION_RATE, VNEID_REDUCTION_MAX, NOTARY_MAX, notaryFee, notaryFeeBreakdown, computeFees, parseMoney };
