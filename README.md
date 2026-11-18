# Tiện Ích Hub — bản chính thức (tienichhub.io.vn)

Trang web tĩnh tiếng Việt: **công cụ miễn phí chạy trên trình duyệt** +
**Điểm báo hằng ngày** (AI / Chứng khoán / Crypto) + bảng xếp hạng
(Xu hướng GitHub / Tin hot). Không tài khoản, không theo dõi người dùng,
không CDN/font/thư viện ngoài — mọi thứ gói sẵn trong repo.

> Trang công khai v1 CHỈ gồm công cụ + Điểm báo + xếp hạng.
> Không có bảng tin cộng đồng, không có khung “Pháp lý ở Việt Nam”,
> không có mục “Trước khi gắn tên miền” (các tài liệu đó chỉ để chủ trang coi).

## Bố cục trang chủ + giao diện (đổi 18/11/2026)

Bố cục khôi phục bản trước đợt 1 (Tuấn thấy đẹp hơn bản wave 1):
hero (tìm kiếm) + **bảng xếp hạng nằm trong vùng hero ở đầu trang** →
dải dữ liệu hôm nay (crypto, vàng, tỉ giá, xổ số, lịch âm, tử vi) →
**Điểm báo** (mục chính) → lưới đủ 120 công cụ → banner Ủng hộ.
Không còn khối “Hôm nay” riêng, hàng “công cụ hay dùng”, thẻ hạng mục
riêng trên trang chủ (thẻ hạng mục đặc màu chuyển sang trang /cong-cu/).

Phong cách tổng hợp từ web công cụ nước ngoài: sạch tối giản kiểu
iLovePDF (nền trắng, thẻ trắng viền nhạt, bóng đổ rất nhẹ) + thẻ hạng
mục đặc màu kiểu TinyWow (mỗi hạng mục 1 màu, icon trắng, pill số
công cụ) + hàng xếp hạng kiểu Product Hunt (số thứ hạng lớn + tên +
mô tả + meta, pill ★ số sao bên phải). Nhấn xanh dương #1e8fe0,
CTA Ủng hộ cam #f59e0b. Không còn số thứ tự /01, /02… trên thẻ
công cụ và trang công cụ.

## Cấu trúc

```
.
├── package.json            # {"type": "module", "scripts": {"build": "node build.mjs"}}
├── build.mjs               # trình sinh trang tĩnh (quét src/tools, sinh dist/)
├── CONTRACT.md             # hợp đồng module công cụ (đọc trước khi viết công cụ mới)
├── src/
│   ├── template.js         # shell() — khung HTML chung mọi trang
│   ├── categories.js       # 11 hạng mục công cụ
│   ├── tool-card.js        # helper build: escape HTML + thẻ công cụ
│   ├── style.css           # design system (sạch kiểu iLovePDF + thẻ hạng mục đặc màu kiểu TinyWow + hàng xếp hạng kiểu Product Hunt)
│   ├── app.js              # JS chạy mọi trang + window.UH (đã gộp mascot.js)
│   ├── tool-state.js       # trạng thái công cụ qua URL + nút Đặt lại (chỉ trang công cụ)
│   ├── search-synonyms.js  # bảng đồng nghĩa cho tìm kiếm (build sinh search-index.json)
│   ├── tool-content.js     # intro + FAQ cho 12 công cụ chính
│   ├── vendor/
│   │   └── qrcode-generator.js   # vendored từ npm qrcode-generator@1.4.4 (MIT)
│   ├── pages/              # home, cong-cu, ung-ho, dieu-khoan, chinh-sach-bao-mat, lien-he
│   ├── tools/<hang-muc>/<id>.js  # mỗi công cụ 1 file (xem CONTRACT.md)
│   └── data/               # news/trending/gold/fx/lottery/crypto/fng.json (Action làm mới)
├── scripts/                # fetch-data.mjs, summarize-news.mjs (GitHub Action)
├── .github/workflows/      # refresh-live.yml (30 phút) + refresh-daily.yml (2 lần/ngày)
└── dist/                   # thư mục build sinh ra (không commit)
```

## Build & chạy thử

```bash
npm run build            # sinh dist/ (fail loudly nếu module công cụ sai hợp đồng)
python3 -m http.server -d dist 8321   # chạy thử local
# mở http://localhost:8321/
```

Build sinh: `index.html`, `cong-cu/index.html`,
`cong-cu/<slug>/index.html` (mỗi công cụ 1 URL riêng), `ung-ho/`,
`dieu-khoan/`, `chinh-sach-bao-mat/`, `lien-he/`,
`diem-bao/<ngày>/` (lưu trữ Điểm báo theo ngày),
`sitemap.xml`, `robots.txt`,
và copy `assets/` (style.css, app.js, tool-state.js, vendor) +
`data/` (7 file JSON + `search-index.json` sinh lúc build) sang `dist/`.

## Triển khai Cloudflare Pages

> KHÔNG triển khai trong nhiệm vụ dựng khung này — chỉ ghi chú để dùng sau.

- Kết nối repo này vào Cloudflare Pages.
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- Gắn tên miền riêng `tienichhub.io.vn` trong Pages → Custom domains.
- Mỗi lần push code hoặc data mới, Pages tự build lại.
- Không cần biến môi trường, không cần Node runtime phía server (trang tĩnh 100%).

## Schema dữ liệu (`src/data/`, file mẫu + file thật)

Các file này do worker dữ liệu + GitHub Action (`scripts/fetch-data.mjs`,
`.github/workflows/refresh-live.yml` + `refresh-daily.yml`) làm mới — **đừng sửa tay** trừ khi
đang sửa chính worker đó. Trang chủ và công cụ chỉ đọc.

### `news.json` — Điểm báo

```json
{
  "updatedAt": "2026-11-17T09:43:29.873Z",
  "groups": {
    "ai":         [{ "title": "...", "summary": "...", "why": "...", "link": "https://…",
                    "source": "TechCrunch", "publishedAt": "Mon, 16 Nov 2026 23:32:32 +0000" }],
    "chung-khoan": [ "..." ],
    "crypto":      [ "..." ]
  }
}
```

- `groups` là object với 3 khóa `ai` / `chung-khoan` / `crypto`
  (trang chủ cũng chấp nhận dạng mảng `[{id, label, items}]` để tương thích).
- Tin dùng trường `link` (trang chủ cũng chấp nhận `url`).
- `summary` tối đa 260 ký tự; có thể rỗng nếu tin chưa được tóm tắt
  (trang chủ khi đó chỉ hiện tiêu đề + nguồn, không bịa tóm tắt).
- `why` là câu "vì sao tin này đáng đọc" (tối đa 200 ký tự), cũng rỗng
  khi chưa tóm tắt; chỉ hiện khi có nội dung.
- Trang chủ hiện tối đa 6 tin/nhóm; tab “Tin hot” lấy 6 tin mới nhất mọi nhóm.

### `trending.json` — Xu hướng GitHub

```json
{ "updatedAt": "…", "source": "api.github.com",
  "items": [{ "name": "owner/repo", "url": "https://github.com/…",
              "description": "…", "stars": 4340, "language": "TypeScript" }] }
```

Trang chủ hiện top 6 (theo thứ tự trong file); hạng 1–2–3 nổi bật, hạng 1 gắn nhãn HOT.

### `gold.json` — Giá vàng

```json
{ "updatedAt": "…", "source": "vang.today",
  "world": { "priceUsdPerOz": 3865.45, "changeUsd": 2.88 },
  "items": [{ "code": "BTSJC", "name": "Bảo Tín SJC",
              "buy": 133500000, "sell": 137700000, "changeBuy": 0, "changeSell": 0 }] }
```

### `fx.json` — Tỷ giá (gốc USD)

```json
{ "updatedAt": "…", "base": "USD", "source": "open.er-api.com",
  "rates": { "USD": 1, "EUR": 0.908584, "VND": 26200.0 } }
```

### `lottery.json` — Xổ số 3 miền

```json
{ "updatedAt": "…", "source": "xskt.com.vn", "sourceUrls": ["…"],
  "regions": {
    "bac":   [{ "date": "2026-11-16", "weekday": "Thứ Hai",
                "link": "https://xskt.com.vn/xsmb/ngay-16-11-2026",
                "stations": [{ "name": null,
                               "prizes": { "db": ["97403"], "g1": ["48014"],
                                           "g2": ["…"], "g3": ["…"], "g4": ["…"],
                                           "g5": ["…"], "g6": ["…"], "g7": ["…"] } }] }],
    "trung": [{ "date": "2026-11-16", "weekday": "Thứ Hai",
                "link": "https://xskt.com.vn/xsmt/ngay-16-11-2026",
                "stations": [{ "name": "Phú Yên",
                               "prizes": { "db": ["…"], "g1": ["…"], "g2": ["…"],
                                           "g3": ["…"], "g4": ["…"], "g5": ["…"],
                                           "g6": ["…"], "g7": ["…"], "g8": ["…"] } },
                             { "name": "Thừa Thiên Huế", "prizes": { "…" : ["…"] } }] }],
    "nam":   [{ "date": "2026-11-17", "weekday": "Thứ Ba",
                "link": "https://xskt.com.vn/xsmn/ngay-17-11-2026",
                "stations": [{ "name": "Bạc Liêu", "prizes": { "…" : ["…"] } },
                             { "name": "Bến Tre",   "prizes": { "…" : ["…"] } }] }] } }
```

- Khóa miền là `bac` / `trung` / `nam`; mỗi miền là **danh sách ngày**,
  mỗi ngày có `date`, `weekday`, `link` và `stations`.
- `prizes` nằm trong **từng đài** (`stations[].prizes`), KHÔNG nằm trực
  tiếp trên ngày — dạng stations là bắt buộc vì miền Trung/Nam có nhiều
  đài mỗi ngày. Miền Bắc chỉ có 1 đài, `name` là `null`.
- Khóa giải: miền Bắc `db, g1–g7`; miền Trung/Nam `db, g1–g8`; mỗi giải
  là mảng chuỗi số trúng.

### `crypto.json` — Giá crypto (CoinGecko)

```json
{ "updatedAt": "…", "source": "CoinGecko",
  "coins": [{ "id": "bitcoin", "symbol": "BTC", "priceUsd": 64271,
              "priceVnd": 1654000000, "change24h": -1.2 }] }
```

5 coin: BTC, ETH, SOL, BNB, XRP. Dải Crypto hiện BTC
(gần nhất); dữ liệu làm mới mỗi 30 phút.

### `fng.json` — Chỉ số Sợ hãi & Tham lam (alternative.me)

```json
{ "updatedAt": "…", "source": "alternative.me", "value": 12, "label": "Extreme Fear" }
```

Giá trị 0–100; trang dịch nhãn sang tiếng Việt khi hiển thị
(dòng nhỏ trong dải Crypto). Làm mới mỗi 30 phút.

### Khi chưa có dữ liệu thật

Nếu file nào chưa có dữ liệu, giữ đúng schema trên với mảng rỗng và
`"updatedAt": null` — trang chủ sẽ hiện “chưa có tin — dữ liệu làm mới
hằng ngày” thay vì vỡ trang.

## Thêm công cụ mới

Đọc `CONTRACT.md`, tạo file `src/tools/<hang-muc>/<id>.js` đúng hợp đồng
(`meta` + `body()` + `init(root)`), rồi chạy `npm run build` để kiểm tra.
