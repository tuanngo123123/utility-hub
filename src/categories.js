// 11 hạng mục công cụ — dùng chung cho build (catalog, trang chủ) và kiểm tra meta.
// Slug hạng mục = tên thư mục trong src/tools/<slug>/.
export const CATEGORIES = [
  { slug: 'tai-chinh', label: 'Tài chính' },
  { slug: 'van-phong', label: 'Văn phòng' },
  { slug: 'suc-khoe', label: 'Sức khỏe' },
  { slug: 'hoc-tap', label: 'Học tập' },
  { slug: 'nha-bep', label: 'Nhà & bếp' },
  { slug: 'du-lich', label: 'Du lịch' },
  { slug: 'mua-sam', label: 'Mua sắm' },
  { slug: 'doi-song', label: 'Đời sống' },
  { slug: 'dev-web', label: 'Dev & web' },
  { slug: 'github', label: 'GitHub' },
  { slug: 'hang-ngay', label: 'Hằng ngày' },
];

export function categoryLabel(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.label : slug;
}

export function isCategorySlug(slug) {
  return CATEGORIES.some((c) => c.slug === slug);
}
