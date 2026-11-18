// 12 hạng mục công cụ — dùng chung cho build (catalog, trang chủ) và kiểm tra meta.
// Slug hạng mục = tên thư mục trong src/tools/<slug>/.
// icon: emoji hiển thị trên thẻ hạng mục đặc màu (phong cách TinyWow).
// color: màu nền đặc của thẻ hạng mục đó.
// colorDark: bản đậm của color, dùng cho CHỮ NHỎ trên nền nhạt (chip hạng mục,
// từ xoay trong H1) — đã đo tương phản 18/11/2026: chữ colorDark trên nền
// tint 12% và chữ trắng trên nền colorDark đều ≥ 4,5:1 (WCAG AA) ở cả 12 hạng mục.
export const CATEGORIES = [
  { slug: 'tai-chinh', label: 'Tài chính', icon: '💰', color: '#2563eb', colorDark: '#1d4ed8' },
  { slug: 'van-phong', label: 'Văn phòng', icon: '📄', color: '#6a5ae0', colorDark: '#5546c0' },
  { slug: 'suc-khoe', label: 'Sức khỏe', icon: '❤️', color: '#0f766e', colorDark: '#0f766e' },
  { slug: 'hoc-tap', label: 'Học tập', icon: '📚', color: '#d81b60', colorDark: '#be185d' },
  { slug: 'giao-vien', label: 'Giáo viên', icon: '👩‍🏫', color: '#0d9488', colorDark: '#0f766e' },
  { slug: 'nha-bep', label: 'Nhà & bếp', icon: '🏠', color: '#f97316', colorDark: '#c2410c' },
  { slug: 'du-lich', label: 'Du lịch', icon: '✈️', color: '#0891b2', colorDark: '#0e7490' },
  { slug: 'mua-sam', label: 'Mua sắm', icon: '🛍️', color: '#db2777', colorDark: '#be185d' },
  { slug: 'doi-song', label: 'Đời sống', icon: '🌿', color: '#65a30d', colorDark: '#3f6212' },
  { slug: 'dev-web', label: 'Dev & web', icon: '💻', color: '#4f46e5', colorDark: '#4f46e5' },
  { slug: 'github', label: 'GitHub', icon: '🐙', color: '#1f2937', colorDark: '#1f2937' },
  { slug: 'hang-ngay', label: 'Hằng ngày', icon: '📅', color: '#b45309', colorDark: '#92400e' },
];

// Công cụ tiêu biểu hiển thị trên mỗi thẻ hạng mục (id đã đối chiếu src/tools/).
export const CATEGORY_FEATURED = {
  'tai-chinh': 'luong-gross-net',
  'van-phong': 'dem-tu-thoi-luong-doc',
  'suc-khoe': 'bmi',
  'hoc-tap': 'may-tinh',
  'giao-vien': 'goi-ten-ngau-nhien',
  'nha-bep': 'tien-dien-bac-thang',
  'du-lich': 'ngoai-te-ty-gia',
  'mua-sam': 'giam-gia-chong',
  'doi-song': 'doi-don-vi-nhanh',
  'dev-web': 'vietqr-wifi-qr',
  'github': 'github-trending',
  'hang-ngay': 'lich-am',
};

export function categoryLabel(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.label : slug;
}

// Màu hạng mục (color) + bản đậm cho chữ (colorDark) — dùng cho chip,
// thẻ công cụ, khung trang công cụ (hướng B: màu theo hạng mục).
// Fallback xanh mặc định của web khi slug lạ (không fail build).
export function categoryColor(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.color : '#2563eb';
}

export function categoryColorDark(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? (found.colorDark || found.color) : '#1d4ed8';
}

export function isCategorySlug(slug) {
  return CATEGORIES.some((c) => c.slug === slug);
}
