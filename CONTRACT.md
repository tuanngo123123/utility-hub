# Hợp đồng module công cụ — Tiện Ích Hub

Tài liệu này ghi lại hợp đồng giữa **khung trang (build)** và **module công cụ**
(`src/tools/*/*.js`). Người viết công cụ mới chỉ cần đọc file này.

## 1. Vị trí và tên file

- Mỗi công cụ là **một file** `src/tools/<slug-hang-muc>/<id>.js`.
- `<id>` = slug của công cụ, cũng là phần URL: `/cong-cu/<id>/`.
- 11 slug hạng mục (xem `src/categories.js`): `tai-chinh`, `van-phong`,
  `suc-khoe`, `hoc-tap`, `nha-bep`, `du-lich`, `mua-sam`, `doi-song`,
  `dev-web`, `github`, `hang-ngay`.

## 2. Module export đúng 3 thứ

```js
export const meta = { /* ... */ };
export function body() { /* trả về chuỗi HTML */ }
export function init(root) { /* gắn sự kiện vào root */ }
```

### `meta`

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `id` | Có | Slug, chỉ `a-z 0-9 -`, duy nhất toàn trang. (`meta.slug` được chấp nhận làm dự phòng.) |
| `name` | Có | Tên hiển thị, VD: `"Tính Phần Trăm & Giá Sau Giảm"` |
| `desc` | Có | Mô tả 1–2 câu, dùng cho thẻ catalog + meta description |
| `categorySlug` | Không | 1 trong 11 slug hạng mục; mặc định lấy tên thư mục chứa file |
| `category` | Không | Nhãn tiếng Việt, VD: `"Tài chính"` (chỉ để tham khảo; nhãn hiển thị lấy từ `src/categories.js`) |
| `keywords` | Không | Chuỗi `"a, b, c"` **hoặc** mảng `["a", "b"]` — dùng cho tìm kiếm + meta keywords |
| `icon` | Không | 1 emoji hiển thị trên thẻ catalog |
| `seoTitle` | Không | Tiêu đề `<title>` riêng (mặc định dùng `name`) |
| `seoDesc` | Không | Meta description riêng (mặc định dùng `desc`) |

### `body()`

- Trả về **chuỗi HTML** — nội dung đầy đủ của công cụ, **bao gồm cả
  `<div class="tool-panel">…</div>`** (khung trang KHÔNG bọc thêm panel).
- Không chứa thẻ `<script>` (build fail nếu có). JavaScript chỉ đặt trong `init()`.
- Chỉ dùng các class CSS trong mục 3 (không tự bịa class, không style inline
  trừ trường hợp ẩn/hiện `display:none`).
- Mọi `id` trong HTML phải có tiền tố riêng của công cụ (VD: `pt-1x`) để
  không đụng với công cụ khác hay khung trang.
- `body()` chạy **lúc build** (trên máy build, không có `window`/`document`):
  không gọi API trình duyệt trong `body()`.

### `init(root)`

- `root` là `<div id="tool-root">` chứa HTML của `body()`. Tìm phần tử bằng
  `root.querySelector(...)`, không dùng `document.getElementById` toàn cục
  (tránh đụng id nếu trang nhúng nhiều khối).
- **Tự chứa hoàn toàn, không import gì cả.** Build nhúng `init` bằng
  `init.toString()` vào trang, nên mọi biến dùng trong `init` phải khai báo
  trong chính hàm đó (hoặc dùng `window.UH.*`).
- Chạy sau `DOMContentLoaded`, khi `window.UH` đã sẵn sàng. Nên viết phòng thủ:
  `const U = (typeof window !== 'undefined' && window.UH) || {};` rồi dùng
  hàm dự phòng nếu `U.fmtNum`… thiếu.

## 3. Class CSS được dùng (design system — `src/style.css`)

Các class cho công cụ (không dùng class ngoài danh sách này):

`.tool-panel` `.tool-head` `.field` (kèm `label`, `input`, `select`,
`textarea`, `.hint`) `.btn` `.btn-primary` `.btn-ghost` `.result`
`.result-row` `.tbl` `.note` `.chip` (nút lọc: thêm `chip-active` khi bật)
`.grid-2` `.grid-3` `.error` `.muted` `.small` `.copy-btn` `.tabs` `.tab`
`.tab-active` `.stat` `.stat-num` `.stat-label`

- Tabs riêng trong công cụ: tự quản lý click + ẩn/hiện panel (xem
  `src/tools/tai-chinh/phan-tram.js`). **Đừng** đặt `data-tab-target` lên
  `.tab` của công cụ — thuộc tính đó chỉ dành cho tabs của khung trang
  (app.js sẽ can thiệp vào tab có `data-tab-target`).

## 4. `window.UH` — tiện ích dùng chung (định nghĩa trong `src/app.js`)

| Hàm | Dùng để làm gì |
|---|---|
| `UH.fmtVND(n)` | `1234567` → `"1.234.567 ₫"` |
| `UH.fmtNum(n, digits)` | `1234.567, 2` → `"1.234,57"` |
| `UH.parseNum(str)` | Hiểu cả `"30.000.000"` (chấm = nghìn) và `"30,5"` (phẩy = thập phân) |
| `UH.toast(msg)` | Hiện thông báo nhỏ ở cuối trang, tự ẩn sau ~2,6s |
| `UH.copyText(str)` | Chép vào clipboard, trả `Promise<boolean>` |
| `UH.todayISO()` | Ngày hôm nay dạng `"2026-11-17"` (giờ địa phương) |
| `UH.vietqrPayload(opts)` | Chuỗi EMV VietQR chuẩn (xem dưới) |
| `UH.renderQR(canvasEl, text)` | Vẽ mã QR lên `<canvas>` (thư viện qrcode-generator đã vendored). Cũng chấp nhận `renderQR(text, canvasEl)` |

### `vietqrPayload`

```js
UH.vietqrPayload({ bin: '970414', account: '883866666', amount: 20000, memo: 'NOI DUNG' })
// hoặc dạng tham số vị trí:
UH.vietqrPayload('970414', '883866666', 20000, 'NOI DUNG')
```

- Tên tham số khác cũng được chấp nhận: `bankBin`, `accountNumber`, `content`
  (thay cho `memo`).
- `amount` = 0 / rỗng / thiếu → mã QR **không** gắn số tiền (người quét tự nhập).
- Chuỗi tuân thủ EMVCo + NAPAS (MỌI độ dài TLV đều tính động từ dữ liệu
  thật, theo độ dài byte UTF-8): `00 "01"`, `01 "12"` nếu có số tiền
  (QR động) hoặc `"11"` nếu không có số tiền (QR tĩnh), `38 { 00 GUID
  A000000727, 01 { 00 BIN, 01 số TK }, 02 "QRIBFTTA" }`, `53 "704"`,
  `54` số tiền (chỉ khi có số tiền), `58 "VN"`, `62 { 08 nội dung }`
  (chỉ khi có memo), `63` + CRC16-CCITT-FALSE (poly `0x1021`, init
  `0xFFFF`). Chỉ có 1 BIN trong payload.
- Nội dung (`memo`) được hàm tự động **bỏ dấu tiếng Việt và viết hoa**
  trước khi đưa vào payload (chuẩn VietQR). Test vector bắt buộc:
  BIN `970414`, TK `883866666`, 50.000đ, không memo →
  `00020101021238530010A0000007270123000697041401098838666660208QRIBFTTA53037045405500005802VN630494B2`;
  tĩnh (không số tiền) →
  `00020101021138530010A0000007270123000697041401098838666660208QRIBFTTA53037045802VN6304A99A`.

## 5. Build kiểm tra gì (fail loudly)

`node build.mjs` dừng ngay (exit 1) khi module công cụ:

- thiếu `meta` / `body()` / `init()`;
- `body()` không trả về chuỗi, hoặc chạy lỗi, hoặc chứa `<script>`;
- thiếu `meta.name` / `meta.desc`;
- slug sai định dạng (`a-z 0-9 -`) hoặc trùng với công cụ khác;
- hạng mục không nằm trong 11 hạng mục.

## 6. Dữ liệu (`src/data/*.json`) — không thuộc hợp đồng này

Các file `news.json`, `trending.json`, `gold.json`, `fx.json`, `lottery.json`
do worker dữ liệu + GitHub Action làm mới. Công cụ chỉ **đọc** qua
`fetch('/data/<tên>.json')`, không ghi. Schema thực tế ghi trong `README.md`.
