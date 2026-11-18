// Trang Giáo viên (/giao-vien/): công cụ miễn phí cho giờ học — gọi tên,
// chia nhóm, xúc xắc & đồng xu, bốc thăm số, bảng điểm. Theo mẫu trang
// Học miễn phí (sv-card/sv-grid có sẵn trong style.css). Mọi công cụ
// chạy ngay trên trình duyệt, không cần đăng ký; điểm lớp lưu trên
// trình duyệt của chính giáo viên.
import { esc } from '../tool-card.js';

const TOOLS = [
  {
    id: 'goi-ten-ngau-nhien',
    name: 'Gọi tên ngẫu nhiên',
    desc: 'Dán danh sách lớp, bấm gọi — tên chạy lướt rồi dừng ở bạn được gọi. Không gọi lại người đã gọi cho tới khi hết danh sách, tải được danh sách đã gọi về.',
  },
  {
    id: 'chia-nhom-ngau-nhien',
    name: 'Chia nhóm ngẫu nhiên',
    desc: 'Chia lớp thành nhóm theo số bạn mỗi nhóm hoặc số nhóm — các nhóm lệch nhau tối đa 1 bạn. Sao chép và tải danh sách nhóm về.',
  },
  {
    id: 'tung-xuc-xac-dong-xu',
    name: 'Tung xúc xắc & đồng xu',
    desc: 'Tung xúc xắc 1–3 viên, mặt lắc nhanh rồi dừng, hiện tổng điểm. Tung đồng xu Sấp/Ngửa kèm thống kê số lần mỗi mặt trong phiên.',
  },
  {
    id: 'boc-tham-so',
    name: 'Bốc thăm số ngẫu nhiên',
    desc: 'Bốc số ngẫu nhiên trong khoảng tùy chọn, không lặp lại, xem lịch sử các số đã bốc và tải lịch sử về máy.',
  },
  {
    id: 'bang-diem-lop',
    name: 'Bảng điểm lớp',
    desc: 'Thêm đội hoặc tên bạn, cộng/trừ điểm nhanh (+1/+5/−1), bảng tự xếp hạng theo điểm. Điểm lưu trên trình duyệt, tải về file mở bằng Excel.',
  },
];

export function body() {
  return `
  <header class="tool-page-head">
    <h1>Giáo viên</h1>
    <p class="muted">Công cụ miễn phí cho giờ học: gọi tên, chia nhóm, tung xúc xắc, bốc thăm số, ghi điểm thi đua — tất cả chạy ngay trên trình duyệt, không cần đăng ký, không cần cài đặt. Mở lên là dùng được ngay trước lớp.</p>
  </header>

  <section class="section" aria-label="Công cụ cho giáo viên">
    <div class="sv-grid">
${TOOLS.map((t) => `      <article class="sv-card">
        <h3 class="card-title">${esc(t.name)}</h3>
        <p class="card-desc">${esc(t.desc)}</p>
        <p class="sv-cta"><a class="btn btn-primary" href="/cong-cu/${esc(t.id)}/">Dùng ngay →</a></p>
      </article>`).join('\n')}
    </div>
  </section>

  <section class="section" aria-label="Ghi chú">
    <p class="note">Bảng điểm lớp được lưu trên trình duyệt của bạn (không gửi lên máy chủ nào) — đổi máy hoặc xóa dữ liệu trình duyệt thì điểm sẽ mất, nhớ tải bảng điểm về (.csv) để giữ lại. Các công cụ khác không lưu gì cả.</p>
  </section>`;
}
