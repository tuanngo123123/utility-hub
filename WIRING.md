# Hiệu ứng + linh vật — trạng thái hiện tại

> Tài liệu này đã cập nhật sau worker W11 (17/11/2026). Bản gốc của W8 mô tả
> `effects.css`/`mascot.js` riêng lẻ và linh vật góc trang — cả hai đã thay đổi:
> file đã gộp vào `style.css`/`app.js`, linh vật góc đã bỏ theo kế hoạch bố cục
> Đợt 1 (chỉ còn linh vật hero).

## File hiện tại

- **Hiệu ứng** nằm ở cuối `src/style.css` (đoạn gộp từ `effects.css` cũ):
  thẻ `.catalog-card` nâng nhẹ + bóng đổ khi hover, ánh sáng hero đi theo
  chuột (`--mx`/`--my`), chuyển động 0,2–0,25s, `prefers-reduced-motion`
  tắt toàn bộ, hiệu ứng chạm cho mobile (`:active` + `.is-touched`).
- **Linh vật** nằm ở cuối `src/app.js` (IIFE gộp từ `mascot.js` cũ):
  SVG giọt nước thân thiện tông xanh nước biển, API ở `window.UHMascot`
  (`mascotSVG`, `initMascot`, `initHeroGlow`, `initTouchCards`).
  `initMascot()` tự chèn SVG vào mọi `<div data-mascot>` khi tải trang.

## Vị trí linh vật

- **Hero trang chủ duy nhất**: `<div data-mascot="hero">` trong
  `src/pages/home.js` (dưới hàng nút hành động, ~96px; 64px trên mobile).
- **Không còn linh vật góc cố định** — đã bỏ ở Đợt 1 (không đè nội dung nào).

## Hành vi

- Rê chuột/chạm vào linh vật: vẫy tay (±15°, 0,9s) + nhảy nhẹ (6px, 0,5s),
  1 lần mỗi lần tương tác. Không có chuyển động lặp vô hạn, không nhấp nháy.
- `prefers-reduced-motion`: linh vật hiện tĩnh.

## Kiểm tra (bằng trình duyệt)

- Trang chủ: linh vật hero hiện; rê chuột qua thì vẫy tay + nhảy nhẹ.
- Rê chuột qua thẻ công cụ: thẻ nâng nhẹ, không đổi màu nền.
- Rê chuột trong hero: ánh sáng mờ trượt theo chuột, không chớp.
- Bật `prefers-reduced-motion`: mọi hiệu ứng tắt, linh vật tĩnh.
- Mobile (390px): không có linh vật góc che nút/toast; chạm thẻ vẫn nâng.
- Dark mode: thẻ hover vẫn đúng bóng.
