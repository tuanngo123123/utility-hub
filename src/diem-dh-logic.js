// Điểm xét tuyển đại học — logic thuần. Một nguồn duy nhất cho cả
// trang công cụ (build.mjs chèn file này vào trang, trừ dòng export
// cuối, để init() gọi qua window.UH_DIEMDH) và bộ kiểm
// scripts/test-diem-dh.mjs — số trên trang và trong test là một,
// theo đúng mẫu src/ma-tran-logic.js và src/anh-the-logic.js.
//
// CĂN CỨ (đối chiếu 20/11/2026 — Quy chế hiện hành là Thông tư
// 06/2026/TT-BGDĐT ngày 15/02/2026, thay cho quy chế cũ 08/2022
// sửa đổi bởi 06/2025):
// - Điều 7 khoản 1 — ưu tiên khu vực: KV1 0,75; KV2-NT 0,50;
//   KV2 0,25; KV3 0. Chỉ hưởng trong năm tốt nghiệp THPT và một
//   năm kế tiếp; khu vực theo trường học lâu nhất cấp THPT.
// - Điều 7 khoản 2 — ưu tiên đối tượng: nhóm UT1 (đối tượng 01
//   đến 03) 2,00 điểm; nhóm UT2 (đối tượng 04 đến 06) 1,00 điểm.
//   Thuộc nhiều diện đối tượng chỉ hưởng mức cao nhất. Khu vực +
//   đối tượng được cộng cả hai.
// - Điều 7 khoản 4 — từ tổng điểm 22,50 trở lên, điểm ưu tiên
//   giảm dần, làm tròn đến hàng phần trăm:
//   Điểm ưu tiên = [(30 − Tổng điểm) ÷ 7,50] × Mức điểm ưu tiên.
//   Tổng điểm đúng 22,5 thì hệ số bằng 1 nên vẫn cộng đủ; tổng
//   30 thì ưu tiên về 0.
// - Điều 6 khoản 5 — xét học bạ: tổ hợp dùng điểm trung bình
//   chung kết quả học tập cả năm các lớp 10, 11, 12 (6 học kỳ)
//   của tối thiểu 03 môn học, thang 30; bắt buộc có môn Toán
//   hoặc Ngữ văn với trọng số tính điểm xét tối thiểu 1/3.
// - Điều 6 khoản 3 — nguồn tuyển: tổng điểm 03 môn thi tốt
//   nghiệp THPT theo tổ hợp (hoặc Toán, Ngữ văn và một môn khác)
//   đạt tối thiểu 15,00 điểm theo thang 30, áp dụng với thí sinh
//   thi tốt nghiệp từ năm 2026 (dự thảo ghi 16, văn bản chính
//   thức chốt 15).
// - Điểm cộng (điểm thưởng, điểm khuyến khích: chứng chỉ, giải
//   thưởng...) tối đa 3 điểm theo thang 30; không bị giảm dần
//   như điểm ưu tiên vì công thức khoản 4 Điều 7 chỉ áp cho điểm
//   ưu tiên.

// Điểm ưu tiên khu vực (Điều 7 khoản 1).
const KV_POINTS = {
  KV1: 0.75,
  'KV2-NT': 0.5,
  KV2: 0.25,
  KV3: 0,
};

// Điểm ưu tiên đối tượng (Điều 7 khoản 2).
const OBJ_POINTS = {
  UT1: 2,
  UT2: 1,
  NONE: 0,
};

// Ngưỡng bắt đầu giảm dần điểm ưu tiên + tổng điểm tối đa thang 30.
const SLIDE_FROM = 22.5;
const MAX_TOTAL = 30;

// Trần điểm cộng thêm (điểm thưởng, khuyến khích) theo thang 30.
const MAX_BONUS = 3;

// Làm tròn 2 chữ số thập phân, cộng epsilon để tránh bẫy float
// (0,225 lưu nhị phân hơi thiếu nên Math.round(0,225 × 100) = 22
// nếu không có epsilon — mà 0,225 làm tròn lên phải là 0,23).
function round2(x) {
  return Math.round(x * 100 + 1e-9) / 100;
}

// Hiển thị điểm kiểu Việt Nam: luôn 2 chữ số thập phân, dấu phẩy
// ("24,60", "30,00", "0,00") — điểm xét tuyển luôn viết đủ 2 số.
function fmtScore(x) {
  if (x == null || Number.isNaN(x)) return '';
  return round2(x).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Đọc điểm một môn: chấp nhận dấu phẩy hoặc dấu chấm thập phân,
// khoảng trắng đầu/cuối. Trả số 0–10, hoặc null khi ô trống, không
// phải số, hoặc ngoài khoảng (để giao diện báo lỗi thay vì đoán).
function parseScore(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0 || n > 10) return null;
  return n;
}

// Điểm ưu tiên từ tổng điểm 3 môn + khu vực + đối tượng.
// total: tổng điểm 3 môn đã làm tròn (thang 30).
// kvId: 'KV1' | 'KV2-NT' | 'KV2' | 'KV3'; objId: 'UT1' | 'UT2' | 'NONE'.
// Trả { kv, obj, pri0, pri, scaled }: kv/obj là mức từng loại,
// pri0 là tổng ưu tiên ban đầu, pri là ưu tiên thực tế sau điều
// chỉnh, scaled cho biết có áp công thức giảm dần hay không.
function priorityPoints(total, kvId, objId) {
  const kv = KV_POINTS[kvId] || 0;
  const obj = OBJ_POINTS[objId] || 0;
  const pri0 = round2(kv + obj);
  const scaled = total >= SLIDE_FROM && pri0 > 0;
  const pri = scaled ? round2(((MAX_TOTAL - total) / 7.5) * pri0) : pri0;
  return { kv, obj, pri0, pri, scaled };
}

// Tính điểm xét tuyển đầy đủ.
// input: { scores: [môn 1, môn 2, môn 3] (mỗi môn 0–10),
//   kv: mã khu vực, obj: mã đối tượng, bonus: điểm cộng thêm }.
// bonus vượt trần 3 thì chặn ở 3 (không cộng quá quy định).
// Điểm xét tuyển chặn ở 30: quy chế quy định không có thí sinh
// nào có điểm xét vượt quá 30 (bao gồm cả điểm cộng và điểm ưu
// tiên) — tổng 29 + ưu tiên 0,1 + cộng thêm 3 là 32,1 thì chỉ
// lấy 30. Giao diện tự nhận ra trường hợp này (tổng + ưu tiên
// + cộng thêm > 30) để ghi chú trong bảng bước.
// Trả { total, kv, obj, pri0, pri, scaled, bonus, final }.
function computeAdmission(input) {
  const inp = input || {};
  const scores = inp.scores || [0, 0, 0];
  const total = round2(scores[0] + scores[1] + scores[2]);
  const p = priorityPoints(total, inp.kv, inp.obj);
  let bonus = parseFloat(inp.bonus);
  if (Number.isNaN(bonus) || bonus < 0) bonus = 0;
  bonus = Math.min(MAX_BONUS, bonus);
  const final = Math.min(MAX_TOTAL, round2(total + p.pri + bonus));
  return {
    total,
    kv: p.kv, obj: p.obj, pri0: p.pri0, pri: p.pri, scaled: p.scaled,
    bonus: round2(bonus),
    final,
  };
}

// Ví dụ điền sẵn ở chế độ điểm thi THPT (đề bài): 8 + 8,5 + 7,5
// = 24; KV1 0,75 giảm dần: [(30 − 24) ÷ 7,5] × 0,75 = 0,6;
// điểm xét tuyển 24,6.
function sampleExam() {
  return { scores: [8, 8.5, 7.5], kv: 'KV1', obj: 'NONE', bonus: 0 };
}

// Ví dụ điền sẵn ở chế độ xét học bạ: ĐTB 6 học kỳ Toán 8,
// Ngữ văn 7,5, Tiếng Anh 8,5 = 24; KV1 0,75 giảm dần còn 0,6;
// điểm xét tuyển 24,6.
function sampleTranscript() {
  return { scores: [8, 7.5, 8.5], kv: 'KV1', obj: 'NONE', bonus: 0 };
}

if (typeof window !== 'undefined') window.UH_DIEMDH = { KV_POINTS, OBJ_POINTS, SLIDE_FROM, MAX_TOTAL, MAX_BONUS, round2, fmtScore, parseScore, priorityPoints, computeAdmission, sampleExam, sampleTranscript };
export { KV_POINTS, OBJ_POINTS, SLIDE_FROM, MAX_TOTAL, MAX_BONUS, round2, fmtScore, parseScore, priorityPoints, computeAdmission, sampleExam, sampleTranscript };
