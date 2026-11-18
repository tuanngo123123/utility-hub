// 11 hạng mục công cụ — dùng chung cho build (catalog, trang chủ) và kiểm tra meta.
// Slug hạng mục = tên thư mục trong src/tools/<slug>/.
// icon: emoji hiển thị trên thẻ hạng mục đặc màu (phong cách TinyWow).
// color: màu nền đặc của thẻ hạng mục đó.
export const CATEGORIES = [
  { slug: 'tai-chinh', label: 'Tài chính', icon: '💰', color: '#2563eb' },
  { slug: 'van-phong', label: 'Văn phòng', icon: '📄', color: '#6a5ae0' },
  { slug: 'suc-khoe', label: 'Sức khỏe', icon: '❤️', color: '#0f766e' },
  { slug: 'hoc-tap', label: 'Học tập', icon: '📚', color: '#d81b60' },
  { slug: 'giao-vien', label: 'Giáo viên', icon: '👩‍🏫', color: '#0d9488' },
  { slug: 'nha-bep', label: 'Nhà & bếp', icon: '🏠', color: '#f97316' },
  { slug: 'du-lich', label: 'Du lịch', icon: '✈️', color: '#0891b2' },
  { slug: 'mua-sam', label: 'Mua sắm', icon: '🛍️', color: '#db2777' },
  { slug: 'doi-song', label: 'Đời sống', icon: '🌿', color: '#65a30d' },
  { slug: 'dev-web', label: 'Dev & web', icon: '💻', color: '#4f46e5' },
  { slug: 'github', label: 'GitHub', icon: '🐙', color: '#1f2937' },
  { slug: 'hang-ngay', label: 'Hằng ngày', icon: '📅', color: '#b45309' },
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

export function isCategorySlug(slug) {
  return CATEGORIES.some((c) => c.slug === slug);
}
