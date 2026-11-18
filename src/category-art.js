// Hình minh họa SVG inline cho dải hình đầu thẻ công cụ (vòng 2 làm lại
// giao diện, thay đổi số 4 — thẻ kiểu gallery của 21st.dev, thay ô icon
// 48px). Mỗi hình: viewBox "0 0 320 200" (tỉ lệ 16:10), ≤ ~800 byte,
// không chữ, không tham chiếu ngoài. Nền pastel = đúng mã đang dùng cho
// .card-icon; hình khối = màu đậm của hạng mục (categories.js); 1 hình
// trắng/mờ tạo chiều sâu. Nền pastel giữ nguyên cả dark mode (hình sáng
// trên nền tối là có chủ ý, như ảnh preview sáng của 21st.dev).

const ART = {
  // Tài chính: cột tăng + đồng xu.
  'tai-chinh':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#dbeafe"/><circle cx="272" cy="36" r="44" fill="#fff" opacity=".55"/><rect x="52" y="112" width="28" height="52" rx="6" fill="#93c5fd"/><rect x="96" y="88" width="28" height="76" rx="6" fill="#60a5fa"/><rect x="140" y="62" width="28" height="102" rx="6" fill="#2563eb"/><circle cx="236" cy="112" r="32" fill="#fff"/><circle cx="236" cy="112" r="22" fill="none" stroke="#2563eb" stroke-width="6"/></svg>',
  // Văn phòng: tài liệu + dòng kẻ.
  'van-phong':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#ede9fe"/><circle cx="48" cy="40" r="40" fill="#fff" opacity=".5"/><rect x="104" y="34" width="112" height="134" rx="10" fill="#fff"/><rect x="124" y="62" width="72" height="9" rx="4.5" fill="#6a5ae0"/><rect x="124" y="86" width="72" height="9" rx="4.5" fill="#c4b5fd"/><rect x="124" y="110" width="48" height="9" rx="4.5" fill="#c4b5fd"/><rect x="124" y="134" width="26" height="20" rx="5" fill="#6a5ae0"/></svg>',
  // Sức khỏe: tim + đường nhịp.
  'suc-khoe':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#d1fae5"/><circle cx="268" cy="160" r="48" fill="#fff" opacity=".5"/><path d="M160 152C118 120 92 94 92 71c0-16 12-27 26-27 15 0 31 10 42 25 11-15 27-25 42-25 14 0 26 11 26 27 0 23-26 49-68 81z" fill="#0f766e"/><polyline points="56,128 96,128 112,102 132,152 148,128 264,128" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  // Học tập: sách mở (vòng 2, sửa sau kiểm mắt: thêm dòng chữ trắng
  // trên mỗi trang để đọc ra sách, không còn giống nơ bướm).
  'hoc-tap':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#fce7f3"/><circle cx="40" cy="160" r="44" fill="#fff" opacity=".5"/><path d="M160 72 96 54c-12-3-24 6-24 18v68c0 12 12 21 24 18l64-18z" fill="#d81b60"/><path d="M160 72l64-18c12-3 24 6 24 18v68c0 12-12 21-24 18l-64-18z" fill="#f472b6"/><g stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"><path d="M88 86h48" transform="rotate(-16 112 86)"/><path d="M88 104h48" transform="rotate(-16 112 104)"/><path d="M88 122h32" transform="rotate(-16 104 122)"/><path d="M184 86h48" transform="rotate(16 208 86)"/><path d="M184 104h48" transform="rotate(16 208 104)"/><path d="M184 122h32" transform="rotate(16 200 122)"/></g><rect x="157" y="72" width="6" height="68" fill="#fff" opacity=".85"/></svg>',
  // Nhà & bếp: nhà + mái.
  'nha-bep':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#ffedd5"/><circle cx="272" cy="40" r="40" fill="#fff" opacity=".55"/><path d="M80 102 160 48l80 54z" fill="#ea580c"/><rect x="96" y="98" width="128" height="70" rx="8" fill="#f97316"/><rect x="146" y="128" width="28" height="40" rx="4" fill="#fff" opacity=".92"/><circle cx="120" cy="122" r="9" fill="#fff" opacity=".92"/><circle cx="200" cy="122" r="9" fill="#fff" opacity=".92"/></svg>',
  // Du lịch: máy bay giấy + mặt trời + mây.
  'du-lich':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#cffafe"/><circle cx="262" cy="46" r="20" fill="#fff" opacity=".9"/><circle cx="76" cy="52" r="16" fill="#fff" opacity=".85"/><circle cx="102" cy="42" r="20" fill="#fff" opacity=".85"/><circle cx="128" cy="54" r="14" fill="#fff" opacity=".85"/><path d="M64 138 256 58l-58 100-40-28z" fill="#0891b2"/><path d="M158 130 256 58l-58 100z" fill="#22d3ee"/></svg>',
  // Mua sắm: túi + thẻ giá.
  'mua-sam':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#fee2e2"/><circle cx="44" cy="44" r="40" fill="#fff" opacity=".5"/><path d="M104 86h112l-9 82a8 8 0 0 1-8 7H121a8 8 0 0 1-8-7z" fill="#db2777"/><path d="M130 86v-6a30 30 0 0 1 60 0v6" fill="none" stroke="#db2777" stroke-width="8"/><rect x="214" y="42" width="56" height="34" rx="8" fill="#fff"/><circle cx="228" cy="59" r="4" fill="#db2777"/></svg>',
  // Đời sống: lá + mặt trời.
  'doi-song':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#ecfccb"/><circle cx="268" cy="156" r="46" fill="#fff" opacity=".5"/><circle cx="246" cy="48" r="20" fill="#a3e635"/><path d="M160 170C96 170 72 130 80 76c52 4 80 42 80 94z" fill="#65a30d"/><path d="M160 170c36 0 64-24 68-62-32 0-60 26-68 62z" fill="#84cc16"/></svg>',
  // Dev & web: dấu ngoặc code </>.
  'dev-web':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#e0e7ff"/><circle cx="48" cy="156" r="44" fill="#fff" opacity=".5"/><path d="M128 62 70 100l58 38" fill="none" stroke="#4f46e5" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M192 62l58 38-58 38" fill="none" stroke="#4f46e5" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><line x1="174" y1="54" x2="146" y2="146" stroke="#818cf8" stroke-width="14" stroke-linecap="round"/></svg>',
  // GitHub: nút nối rẽ nhánh (hình chung, không vẽ logo Octocat).
  'github':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#e5e7eb"/><circle cx="272" cy="44" r="40" fill="#fff" opacity=".6"/><path d="M96 40v128" fill="none" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/><path d="M96 104c0-28 56-40 112-40" fill="none" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/><circle cx="96" cy="40" r="13" fill="#1f2937"/><circle cx="96" cy="168" r="13" fill="#1f2937"/><circle cx="208" cy="64" r="13" fill="#1f2937"/></svg>',
  // Hằng ngày: lưới lịch.
  'hang-ngay':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#fef3c7"/><circle cx="44" cy="40" r="40" fill="#fff" opacity=".5"/><path d="M109 34v26M211 34v26" stroke="#92400e" stroke-width="10" stroke-linecap="round"/><rect x="72" y="46" width="176" height="122" rx="12" fill="#fff"/><path d="M84 46h152a12 12 0 0 1 12 12v18H72V58a12 12 0 0 1 12-12z" fill="#b45309"/><rect x="92" y="92" width="32" height="24" rx="5" fill="#f59e0b"/><rect x="196" y="128" width="32" height="24" rx="5" fill="#f59e0b"/><g fill="#fde68a"><rect x="144" y="92" width="32" height="24" rx="5"/><rect x="196" y="92" width="32" height="24" rx="5"/><rect x="92" y="128" width="32" height="24" rx="5"/><rect x="144" y="128" width="32" height="24" rx="5"/></g></svg>',
};

// Hình mặc định cho slug lạ: xanh dương + chấm tròn.
const DEFAULT_ART =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#dbeafe"/><circle cx="272" cy="40" r="40" fill="#fff" opacity=".55"/><circle cx="110" cy="100" r="26" fill="#2563eb"/><circle cx="170" cy="100" r="26" fill="#60a5fa"/><circle cx="230" cy="100" r="26" fill="#93c5fd"/></svg>';

export function categoryArt(slug) {
  return ART[slug] || DEFAULT_ART;
}
