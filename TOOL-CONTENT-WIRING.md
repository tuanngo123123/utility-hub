# Nối dây nội dung công cụ (TOOL_CONTENT) vào build.mjs

> W12 chỉ viết file này — W12 KHÔNG sửa `build.mjs`. Điều phối viên áp dụng
> các bước dưới đây. Số dòng tham chiếu theo `build.mjs` lúc 17:30 ngày
> 17/11/2026 (hàm `toolPageHtml` ở dòng 230, khối import ở dòng 14–27);
> nếu file đã đổi, tìm theo tên hàm / đoạn code neo, không theo số dòng.

Nguồn nội dung: `src/tool-content.js` — export `TOOL_CONTENT`, khóa là
`meta.id` của công cụ (đã kiểm tra trùng khớp cả 12 id). Nội dung là văn bản
thuần, không chứa thẻ HTML; khi chèn phải qua `esc()` (đã import sẵn ở dòng 20
từ `./src/tool-card.js`).

## Bước 1 — Thêm import (khối import đầu file, sau dòng 20)

```js
import { TOOL_CONTENT } from './src/tool-content.js';
```

Đặt cạnh các import `src/` khác (ví dụ ngay sau dòng
`import { esc, keywordsText } from './src/tool-card.js';`).

## Bước 2 — Trong hàm `toolPageHtml(tool, index, noscriptLinks)`

Thêm đoạn dưới đây ngay sau dòng
`const initSrc = tool.initSource.replace(/<\/script/gi, '<\\/script');`
(và trước dòng `const body = \`...\`;`):

```js
  // Nội dung giới thiệu + FAQ cho 12 công cụ chính (src/tool-content.js).
  // Công cụ không có trong TOOL_CONTENT thì các chuỗi dưới rỗng, trang giữ nguyên.
  const content = TOOL_CONTENT[tool.slug] || null;
  const introHtml = content
    ? `<p class="tool-intro">${esc(content.intro)}</p>`
    : '';
  const faqHtml = content && content.faqs.length
    ? `<section class="tool-faq"><h2>Câu hỏi thường gặp</h2>${content.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>`
    : '';
  const disclaimerHtml = content && content.finance
    ? `<p class="note tool-disclaimer">Kết quả chỉ mang tính tham khảo, không thay thế tư vấn của cơ quan thuế/ngân hàng.</p>`
    : '';
```

## Bước 3 — Chèn intro vào template `body` (phía trên khung công cụ)

Tìm đoạn:

```html
  </header>
  <div id="tool-root">${tool.bodyHtml}</div>
```

Sửa thành:

```html
  </header>
  ${introHtml}
  <div id="tool-root">${tool.bodyHtml}</div>
```

## Bước 4 — Chèn FAQ + dòng tham khảo vào cuối template `body`

Tìm đoạn cuối template (sau khối `<script>` chạy `init`):

```html
  </script>`;
```

Sửa thành:

```html
  </script>
  ${faqHtml}
  ${disclaimerHtml}`;
```

Đặt sau `</script>` để không chạm vào DOM của công cụ (`#tool-root`) và
không ảnh hưởng `init(root)`.

## Kiểm tra sau khi nối dây

1. `npm run build` — build phải chạy xong, không lỗi (build dừng ngay nếu
   import lỗi).
2. Mở `dist/cong-cu/luong-gross-net/index.html`: phải có đoạn intro ngay
   dưới `</header>`, 5 khối `<details>` FAQ và dòng tham khảo cuối trang.
3. Mở một trang công cụ KHÔNG có nội dung (ví dụ
   `dist/cong-cu/may-tinh/index.html`): trang giữ nguyên, không có intro /
   FAQ / dòng tham khảo.
4. Kiểm tra 1 công cụ `finance: false` (ví dụ `dist/cong-cu/bmi/index.html`):
   có intro + FAQ nhưng KHÔNG có dòng tham khảo.

## Lưu ý

- `tool.slug` chính là `meta.id` (`loadTools()` lấy `meta.id` làm slug),
  nên tra `TOOL_CONTENT[tool.slug]` là đúng; đừng tra theo tên file.
- Class CSS mới: `.tool-intro`, `.tool-faq`, `.tool-disclaimer`.
  `<details>` hiển thị được ngay không cần CSS (trình duyệt vẽ sẵn mũi tên
  mở/đóng); `.note` là class đã có. Thêm CSS đẹp cho 3 class mới là việc
  riêng của điều phối viên, không bắt buộc để nội dung chạy.
- Nếu sau này đổi `meta.id` của một trong 12 công cụ, phải đổi khóa tương
  ứng trong `src/tool-content.js` (không thì nội dung của công cụ đó biến mất
  lặng lẽ — build không báo lỗi vì tra cứu có dự phòng `|| null`).
- Tùy chọn (không bắt buộc): sinh thêm JSON-LD `FAQPage` từ cùng dữ liệu
  `TOOL_CONTENT` để SEO — làm ở đợt sau nếu cần.
