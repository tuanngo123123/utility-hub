// Trang Giáo viên (/giao-vien/) — làm lại đợt V2 (19/11): khối đầu
// Bàn giáo viên (ảnh chụp V2 thật + 2 nút) rồi 2 nhóm công cụ.
// Nhóm "Chấm điểm & giấy tờ" chỉ hiện công cụ ĐÃ CHẠY ĐƯỢC (hiện có
// Bốc câu hỏi, Bảng điểm, Điểm danh, Trộn đề, Sổ điểm, Nhận xét) — công cụ mới thêm vào khi làm
// xong, KHÔNG hiện "Sắp có". Thẻ dòng gọn MẪU 4 (.tool-row), cả thẻ
// bấm được, không nút "Dùng ngay" từng thẻ. Mọi công cụ chạy ngay
// trên trình duyệt, không cần đăng ký; điểm lớp lưu trên trình duyệt
// của chính giáo viên.
import { esc } from '../tool-card.js';
import { iconSvg } from '../icons.js';

// Icon + màu hộp icon khớp cột tab Bàn giáo viên (TAB_ICONS).
const ON_CLASS = [
  {
    id: 'goi-ten-ngau-nhien',
    name: 'Gọi tên ngẫu nhiên',
    desc: 'Vòng quay, hộp quà, lật thẻ hoặc tên to — không gọi lại người đã gọi.',
    icon: 'megaphone', bg: '#FEF3C7', fg: '#D97706',
  },
  {
    id: 'chia-nhom-ngau-nhien',
    name: 'Chia nhóm ngẫu nhiên',
    desc: 'Chia nhóm thông minh: rải đều sao, nam/nữ, điểm thi đua; áp luật riêng.',
    icon: 'grid', bg: '#E0F2FE', fg: '#0284C7',
  },
  {
    id: 'tung-xuc-xac-dong-xu',
    name: 'Tung xúc xắc & đồng xu',
    desc: 'Tung xúc xắc 1–3 viên, hiện tổng điểm. Tung đồng xu Sấp/Ngửa kèm thống kê.',
    icon: 'dice', bg: '#CCFBF1', fg: '#0D9488',
  },
  {
    id: 'boc-tham-so',
    name: 'Bốc thăm số ngẫu nhiên',
    desc: 'Bốc số ngẫu nhiên trong khoảng tùy chọn, không lặp lại, xem lịch sử đã bốc.',
    icon: 'shuffle', bg: '#CCFBF1', fg: '#0D9488',
  },
  {
    id: 'am-thanh-lop-hoc',
    name: 'Âm thanh lớp học',
    desc: 'Chuông bắt đầu, kèn chiến thắng, tín hiệu chú ý, gõ nhịp, chuông kết thúc.',
    icon: 'volume', bg: '#DBEAFE', fg: '#1747E6',
  },
  {
    id: 'dem-nguoc-lop-hoc',
    name: 'Đếm ngược lớp học',
    desc: 'Đếm ngược màn hình lớn: 30 giây đến 15 phút, chuông khi hết giờ.',
    icon: 'clock', bg: '#DCFCE7', fg: '#16A34A',
  },
  {
    id: 'do-do-on-lop-hoc',
    name: 'Đo độ ồn lớp học',
    desc: 'Bóng nảy theo độ ồn của lớp, đèn Xanh/Vàng/Đỏ. Không ghi âm.',
    icon: 'mic', bg: '#FEE2E2', fg: '#DC2626',
  },
];

const GRADING = [
  {
    id: 'boc-cau-hoi',
    name: 'Bốc câu hỏi ôn tập',
    desc: 'Bốc câu hỏi ôn tập không lặp lại, hiện đáp án khi cần, bốc kèm tên bạn.',
    icon: 'help-circle', bg: '#EDE9FE', fg: '#7C3AED',
  },
  {
    id: 'bang-diem-lop',
    name: 'Bảng điểm lớp',
    desc: 'Cộng/trừ điểm nhanh (+1/+5/−1), bảng tự xếp hạng theo điểm, tải file Excel.',
    icon: 'trophy', bg: '#FCE7F3', fg: '#DB2777',
  },
  {
    id: 'diem-danh',
    name: 'Điểm danh nhanh',
    desc: 'Bấm vào tên để đánh dấu Vắng / Muộn, tổng kết ngay, tải file theo ngày.',
    icon: 'check-square', bg: '#FFEDD5', fg: '#EA580C',
  },
  {
    id: 'tron-de-trac-nghiem',
    name: 'Trộn đề trắc nghiệm',
    desc: 'Trộn câu hỏi và đáp án thành 2–8 mã đề, kèm bảng đáp án từng mã.',
    icon: 'file-text', bg: '#E0E7FF', fg: '#1747E6',
  },
  {
    id: 'so-diem-lop-tt22',
    name: 'Sổ điểm lớp theo TT22',
    desc: 'Nhập điểm dạng bảng, tự tính ĐTB môn và xếp loại chung theo Thông tư 22.',
    icon: 'book', bg: '#CCFBF1', fg: '#0D9488',
  },
  {
    id: 'goi-y-loi-nhan-xet-hoc-sinh',
    name: 'Gợi ý lời nhận xét học sinh',
    desc: 'Chọn môn, mức và phẩm chất — nhận lời nhận xét cụ thể để ghép cho học bạ.',
    icon: 'keyboard', bg: '#FEF3C7', fg: '#B45309',
  },
  {
    id: 'ma-tran-va-ban-dac-ta-de-kiem-tra',
    name: 'Ma trận và bản đặc tả đề kiểm tra',
    desc: 'Nhập số câu theo chủ đề × mức độ, kiểm tổng 10 điểm, tự sinh bản đặc tả từng câu.',
    icon: 'grid', bg: '#CCFBF1', fg: '#0D9488',
  },
];

function rowCard(t) {
  return `<a class="tool-row tool-row-icon" href="/cong-cu/${esc(t.id)}/" aria-label="Mở công cụ ${esc(t.name)}">
  <span class="tool-row-ico" style="background:${t.bg};color:${t.fg}">${iconSvg(t.icon, 20, 2)}</span>
  <span class="tool-row-text"><span class="tool-row-name">${esc(t.name)}</span><span class="tool-row-desc">${esc(t.desc)}</span></span>
</a>`;
}

export function body() {
  return `
  <header class="tool-page-head">
    <h1>Giáo viên</h1>
    <p class="muted">Công cụ miễn phí cho giờ học — chạy ngay trên trình duyệt, không cần đăng ký.</p>
  </header>

  <section class="gv-hero-block" aria-label="Bàn giáo viên">
    <div class="gv-hero-text">
      <h2>Bàn giáo viên</h2>
      <p>Gom 9 công cụ vào một trang dùng cả tiết trên máy chiếu: gọi tên 4 kiểu, chia nhóm thông minh, bảng điểm, điểm danh… kèm danh sách lớp đầy đủ (giới tính, sao, vắng, điểm) và sao lưu dữ liệu.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/giao-vien/lop-hoc/">Mở Bàn giáo viên</a>
        <a class="btn" href="/giao-vien/lop-hoc/?sample=1&amp;tab=goi-ten">Dùng thử với lớp mẫu</a>
      </div>
    </div>
    <div class="gv-hero-img"><img src="/assets/ban-giao-vien-v2.png" alt="Bàn giáo viên: vòng quay gọi tên, thẻ bạn được gọi và danh sách lớp" width="1366" height="768" loading="lazy"></div>
  </section>

  <section class="cat-group" aria-label="Công cụ trên lớp">
    <h2 class="cat-group-title">Trên lớp <span class="cat-group-count">· ${ON_CLASS.length} công cụ</span></h2>
    <div class="cat-rows">
${ON_CLASS.map((t) => `      ${rowCard(t)}`).join('\n')}
    </div>
  </section>

  <section class="cat-group" aria-label="Chấm điểm và giấy tờ">
    <h2 class="cat-group-title">Chấm điểm &amp; giấy tờ <span class="cat-group-count">· ${GRADING.length} công cụ</span></h2>
    <div class="cat-rows">
${GRADING.map((t) => `      ${rowCard(t)}`).join('\n')}
    </div>
  </section>

  <section class="section" aria-label="Ghi chú">
    <p class="note">Bảng điểm lớp, danh sách lớp đã lưu, điểm danh và bộ câu hỏi được lưu trên trình duyệt của bạn (không gửi lên máy chủ nào) — đổi máy hoặc xóa dữ liệu trình duyệt thì sẽ mất, nhớ tải về để giữ lại. Các công cụ khác không lưu gì cả.</p>
  </section>`;
}
