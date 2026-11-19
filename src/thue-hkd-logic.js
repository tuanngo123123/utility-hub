// Thuế hộ kinh doanh + bán hàng online — công thức thuần (năm tính
// thuế 2026). File này KHÔNG đụng DOM: build.mjs chèn vào trang công
// cụ, test chạy trực tiếp bằng node.
//
// Văn bản (đã tra, xem báo cáo đợt này):
// - Ngưỡng không chịu thuế năm 2026: doanh thu năm từ 1 tỷ đồng trở
//   xuống (Nghị định 68/2026/NĐ-CP, sửa bởi Nghị định 141/2026/NĐ-CP
//   ngày 29/4/2026 — thay "500 triệu đồng" bằng "01 tỷ đồng" tại
//   Điều 3, Điều 4 và các điều liên quan, áp dụng từ 01/01/2026).
// - Bỏ thuế khoán từ 01/01/2026 (Điều 10 Nghị quyết 198/2025/QH15);
//   lệ phí môn bài bãi bỏ từ 01/01/2026 (NQ 198/2025, NĐ 362/2025).
// - Thuế GTGT (khoản 2 Điều 12 Luật Thuế GTGT 48/2024/QH15): tính
//   trên TOÀN BỘ doanh thu khi đã trên ngưỡng, KHÔNG trừ ngưỡng:
//   phân phối hàng hóa 1%; dịch vụ, xây dựng không bao thầu nguyên
//   vật liệu 5%; sản xuất, vận tải, dịch vụ có gắn với hàng hóa,
//   xây dựng có bao thầu nguyên vật liệu 3%; khác 2%.
// - Thuế TNCN (Điều 7 Luật Thuế TNCN 109/2025/QH15):
//   + Theo doanh thu: chỉ khi doanh thu năm trên ngưỡng và từ 3 tỷ
//     đồng trở xuống; thuế suất nhân PHẦN VƯỢT ngưỡng (khoản 3
//     Điều 7): phân phối 0,5%; dịch vụ 2%; sản xuất, vận tải 1,5%;
//     khác 1%. (Cho thuê tài sản / đại lý bảo hiểm, xổ số, đa cấp /
//     nội dung thông tin số 5% — không có trong công cụ, ghi ở FAQ.)
//   + Theo thu nhập: (doanh thu − chi phí) × 15% (đến 3 tỷ) / 17%
//     (trên 3 đến 50 tỷ) / 20% (trên 50 tỷ); trên 3 tỷ BẮT BUỘC
//     cách này. Chi phí bằng hoặc hơn doanh thu thì thuế TNCN bằng 0.
// - Giảm 30% thuế TNCN (NQ 43/2026/QH16, NĐ 398/2026/NĐ-CP):
//   kỳ tính thuế 2026–2027, hộ kinh doanh có doanh thu năm từ 10 tỷ
//   đồng trở xuống; cả hai cách tính; KHÔNG giảm thuế GTGT. Vượt
//   10 tỷ thì phải nộp bổ sung phần đã giảm.
// - Sàn thương mại điện tử khấu trừ thuế thay (NĐ 117/2025/NĐ-CP,
//   từ 01/7/2025; nay là NĐ 252/2026/NĐ-CP, từ 01/7/2026 — tỷ lệ
//   không đổi): sàn có chức năng thanh toán khấu trừ theo từng
//   giao dịch trên TOÀN BỘ doanh thu — hàng hóa GTGT 1% + TNCN 0,5%,
//   dịch vụ 5% + 2%, vận tải 3% + 1,5%. Số đã khấu trừ là tiền nộp
//   trước: cuối năm quyết toán, nộp thêm phần thiếu hoặc được hoàn
//   phần thừa; doanh thu dưới ngưỡng thì được hoàn toàn bộ.
//   Nhóm "hoạt động khác" không có tỷ lệ riêng trong nghị định về
//   khấu trừ trên sàn — công cụ dùng chính tỷ lệ của nhóm (GTGT 2%,
//   TNCN 1%), ghi chú ở FAQ.

const THRESHOLD = 1000000000;
const REVENUE_METHOD_MAX = 3000000000;
const REDUCTION_MAX_REVENUE = 10000000000;
const REDUCTION_RATE = 0.3;
const INCOME_RATE_1 = 0.15;
const INCOME_RATE_2 = 0.17;
const INCOME_RATE_3 = 0.2;
const INCOME_TIER_2 = 3000000000;
const INCOME_TIER_3 = 50000000000;

// Nhóm ngành: thuế suất GTGT và TNCN (theo doanh thu) + tỷ lệ sàn
// khấu trừ thay. Nhóm "khác" dùng chính tỷ lệ của nhóm cho phần sàn
// khấu trừ (xem chú thích ở đầu file).
const GROUPS = {
  'phan-phoi': { label: 'Phân phối, cung cấp hàng hóa', vat: 0.01, pit: 0.005, platVat: 0.01, platPit: 0.005 },
  'dich-vu': { label: 'Dịch vụ, xây dựng không bao thầu nguyên vật liệu', vat: 0.05, pit: 0.02, platVat: 0.05, platPit: 0.02 },
  'san-xuat': { label: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hóa', vat: 0.03, pit: 0.015, platVat: 0.03, platPit: 0.015 },
  'khac': { label: 'Hoạt động kinh doanh khác', vat: 0.02, pit: 0.01, platVat: 0.02, platPit: 0.01 },
};

function groupOf(id) {
  return GROUPS[id] || GROUPS['phan-phoi'];
}

function groupIdOf(id) {
  return GROUPS[id] ? id : 'phan-phoi';
}

// Thuế suất TNCN theo thu nhập theo doanh thu năm: 15% đến 3 tỷ,
// 17% trên 3 đến 50 tỷ, 20% trên 50 tỷ (khoản 2 Điều 7 Luật 109/2025).
function incomeRate(revenue) {
  if (revenue > INCOME_TIER_3) return INCOME_RATE_3;
  if (revenue > INCOME_TIER_2) return INCOME_RATE_2;
  return INCOME_RATE_1;
}

// Cách tính TNCN theo doanh thu chỉ được chọn khi doanh thu năm
// trên ngưỡng và từ 3 tỷ đồng trở xuống.
function revenueMethodAllowed(revenue) {
  return revenue > THRESHOLD && revenue <= REVENUE_METHOD_MAX;
}

// Quy doanh thu / chi phí theo tháng về theo năm.
function annualize(value, period) {
  return period === 'thang' ? value * 12 : value;
}

// Tính thuế phải nộp trong năm.
// input: { revenueAnnual, group, method, costAnnual, channel }
//   method: 'doanh-thu' | 'thu-nhap'; channel: 'tu-ban' | 'san'.
// Trả { revenue, groupId, method, methodForced, taxable, excess,
//   vatRate, pitRate, vat, pitBase, profit, cost,
//   pitBeforeReduction, reductionApplied, reduction, pit, total,
//   withheldVat, withheldPit, withheldTotal, netVat, netPit,
//   netTotal }. Mọi số tiền làm tròn tới đồng. Lệ phí môn bài luôn
// bãi bỏ từ 01/01/2026) nên không có trong kết quả.
function computeTax(input) {
  const inp = input || {};
  const revenue = Math.max(0, inp.revenueAnnual || 0);
  const groupId = groupIdOf(inp.group);
  const group = GROUPS[groupId];
  const channel = inp.channel === 'san' ? 'san' : 'tu-ban';
  const cost = Math.max(0, inp.costAnnual || 0);
  const taxable = revenue > THRESHOLD;
  const excess = taxable ? revenue - THRESHOLD : 0;
  let method = inp.method === 'thu-nhap' ? 'thu-nhap' : 'doanh-thu';
  let methodForced = false;
  if (taxable && method === 'doanh-thu' && revenue > REVENUE_METHOD_MAX) {
    method = 'thu-nhap';
    methodForced = true;
  }
  let vat = 0;
  let pitBase = 0;
  let pitRate = group.pit;
  let profit = 0;
  let pitBeforeReduction = 0;
  if (taxable) {
    // GTGT tính trên toàn bộ doanh thu, không trừ ngưỡng.
    vat = Math.round(revenue * group.vat);
    if (method === 'doanh-thu') {
      // TNCN theo doanh thu: chỉ phần vượt ngưỡng chịu thuế.
      pitBase = excess;
      pitRate = group.pit;
      pitBeforeReduction = Math.round(excess * group.pit);
    } else {
      // TNCN theo thu nhập: (doanh thu − chi phí) × thuế suất;
      // chi phí bằng hoặc hơn doanh thu thì không phải nộp TNCN.
      profit = revenue - cost;
      pitBase = Math.max(0, profit);
      pitRate = incomeRate(revenue);
      pitBeforeReduction = Math.round(pitBase * pitRate);
    }
  }
  // Giảm 30% thuế TNCN: doanh thu năm từ 10 tỷ đồng trở xuống.
  const reductionApplied = taxable && revenue <= REDUCTION_MAX_REVENUE && pitBeforeReduction > 0;
  const reduction = reductionApplied ? Math.round(pitBeforeReduction * REDUCTION_RATE) : 0;
  const pit = pitBeforeReduction - reduction;
  const total = vat + pit;
  // Sàn khấu trừ trên toàn bộ doanh thu, kể cả dưới ngưỡng.
  const withheldVat = channel === 'san' ? Math.round(revenue * group.platVat) : 0;
  const withheldPit = channel === 'san' ? Math.round(revenue * group.platPit) : 0;
  const withheldTotal = withheldVat + withheldPit;
  const netVat = vat - withheldVat;
  const netPit = pit - withheldPit;
  const netTotal = netVat + netPit;
  return {
    revenue,
    groupId,
    method,
    methodForced,
    taxable,
    excess,
    vatRate: group.vat,
    pitRate,
    vat,
    pitBase,
    profit,
    cost,
    pitBeforeReduction,
    reductionApplied,
    reduction,
    pit,
    total,
    withheldVat,
    withheldPit,
    withheldTotal,
    netVat,
    netPit,
    netTotal,
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

if (typeof window !== 'undefined') window.UH_THUEHKD = { THRESHOLD, REVENUE_METHOD_MAX, REDUCTION_MAX_REVENUE, REDUCTION_RATE, GROUPS, groupOf, incomeRate, revenueMethodAllowed, annualize, computeTax, parseMoney };
export { THRESHOLD, REVENUE_METHOD_MAX, REDUCTION_MAX_REVENUE, REDUCTION_RATE, GROUPS, groupOf, incomeRate, revenueMethodAllowed, annualize, computeTax, parseMoney };
