# Nguồn dữ liệu — Utility Hub

Tài liệu này liệt kê mọi nguồn dữ liệu động của trang, cách lấy, tần suất làm mới và
cách xử lý khi nguồn chết. Mọi nguồn đều miễn phí, không cần key — trừ Gemini
(tóm tắt tin, có gói miễn phí).

Quy tắc đứng: **nguồn chết thì hiện rõ "chưa tải được", KHÔNG bịa số.** Script
`fetch-data.mjs` **giữ nguyên file cũ** khi nguồn lỗi (không ghi đè bằng file rỗng),
chỉ ghi đè khi lấy được dữ liệu mới; với nguồn đa feed (tin, xổ số) thì chỉ ghi khi
có ít nhất 1 feed thành công. Trang hiển thị dữ liệu cũ kèm giờ cập nhật, hoặc
"chưa tải được" + nút thử lại khi chưa có dữ liệu nào.

## Tổng quan

| Dữ liệu | Nguồn | Cách lấy | File đích | Tần suất |
|---|---|---|---|---|
| Tỷ giá | open.er-api.com | JSON API công khai | `src/data/fx.json` | 30 phút/lần |
| Giá vàng | vang.today | JSON API công khai của trang | `src/data/gold.json` | 30 phút/lần |
| Crypto | CoinGecko | JSON API công khai | `src/data/crypto.json` | 30 phút/lần |
| Sợ hãi & Tham lam | alternative.me | JSON API công khai | `src/data/fng.json` | 30 phút/lần |
| Xổ số 3 miền | xskt.com.vn | RSS feed từng miền | `src/data/lottery.json` | 2 lần/ngày |
| Trending GitHub | api.github.com | Search API, không key | `src/data/trending.json` | 2 lần/ngày |
| Tin thô (RSS) | TechCrunch, CNBC, CoinTelegraph, CoinDesk | RSS | `src/data/news-raw.json` | 2 lần/ngày |
| Điểm báo (đã tóm tắt) | Gemini 2.5 Flash | REST API, cần key | `src/data/news.json` | 2 lần/ngày |

Làm mới bằng 2 GitHub Action:
- `.github/workflows/refresh-live.yml`: chạy **mỗi 30 phút**, tải dữ liệu live
  (tỷ giá, giá vàng, crypto, Sợ hãi & Tham lam) qua `fetch-data.mjs --only live`.
- `.github/workflows/refresh-daily.yml`: chạy lúc **00:30 và 11:30 UTC**
  (07:30 và 18:30 giờ VN), tải xổ số + trending + tin thô rồi chạy
  `summarize-news.mjs` (`fetch-data.mjs --only daily`).
Cả hai đều chạy tay được (`workflow_dispatch`) và chỉ commit + push khi file
thay đổi.

> Lưu ý build: công cụ trên trang fetch `/data/*.json` (cùng gốc). Khi build/deploy,
> build phải copy `src/data/*.json` ra thư mục `data/` của trang đã build.

## 1. Tỷ giá — open.er-api.com

- URL: `https://open.er-api.com/v6/latest/USD`
- Cách lấy: GET JSON, không key. `rates.VND` là VND/USD; tỷ giá tiền X so với VND
  = `rates.VND / rates[X]`.
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200**. Trình duyệt KHÔNG gọi trực
  tiếp API này — chỉ đọc file `/data/fx.json` cùng tên miền (kiến trúc snapshot).
- Khi chết: script giữ nguyên `fx.json` cũ; công cụ hiện dữ liệu cũ kèm giờ cập
  nhật, hoặc "Tỷ giá chưa tải được" + nút thử lại nếu chưa có dữ liệu nào. Dự phòng: thử `https://api.exchangerate-api.com/v4/latest/USD`
  (cùng nhà cung cấp) hoặc Vietcombank công bố tỷ giá (cần kiểm tra lại CORS).

## 2. Giá vàng — vang.today

- URL: `https://vang.today/api/prices?action=current` (JSON, không key)
- Cách lấy: GET JSON. Mỗi mục có `type_code`, `buy`, `sell` (đồng/lượng),
  `change_buy`, `change_sell`. `XAUUSD` là vàng thế giới (USD/oz).
- Nhãn tiếng Việt lấy đúng từ trang vang.today (`data-code` → tên hiển thị):
  SJL1L10 = SJC 9999 (vàng miếng), SJ9999 = Nhẫn SJC 9999, DOHNL = DOJI Hà Nội,
  DOHCML = DOJI TP.HCM, PQHNVM = PNJ Hà Nội, PQHN24NTT = PNJ 24K, BTSJC = Bảo Tín
  SJC, BT9999NTT = Bảo Tín 9999, VNGSJC = VN Gold SJC, VIETTINMSJC = ViettinBank SJC.
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200**, 12 mục. Đây là nguồn ổn định
  nhất trong các nguồn đã thử.
- Nguồn đã thử và LOẠI:
  - `sjc.com.vn` (trang + endpoint JSON): **HTTP 403** — chặn bot.
  - `api.vang.today`, `www.doji.vn/api/bang-gia-vang`, `api.pnj.vn/api/v1/gold/prices`:
    **không nối được** (lỗi kết nối/DNS).
- Khi chết: script giữ nguyên `gold.json` cũ; công cụ hiện dữ liệu cũ kèm giờ cập
  nhật, hoặc "Giá vàng chưa tải được" + nút thử lại nếu chưa có dữ liệu nào. Dự phòng: parse HTML trang `vang.today` (bảng giá nằm trong
  HTML kèm lịch sử), hoặc tìm API công khai khác của DOJI/PNJ rồi kiểm tra lại.

## 3. Xổ số — xskt.com.vn (RSS)

- URL (RSS thật, lấy từ trang liệt kê `https://xskt.com.vn/rss`):
  - Miền Bắc: `https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss`
  - Miền Trung: `https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss`
  - Miền Nam: `https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss`
- Cách lấy: GET RSS XML, parse bằng regex (không cài thêm gói). Mỗi `<item>` là
  một ngày; ngày lấy từ `<link>` (`.../ngay-16-11-2026`); mô tả chứa các giải
  `ĐB, 1–7` (miền Nam/Trung thêm giải 8). Script chỉ giữ 3 ngày gần nhất trong
  10 ngày trở lại (feed có lẫn mục cũ từ 2021 nên phải lọc theo ngày).
- Lưu ý parse: feed đôi khi dính "7: 658" + "8: 52" thành "7: 6588: 52" — script
  đã tách lại bằng regex trước khi parse.
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200**, cả 3 feed.
- Khi chết: script giữ nguyên `lottery.json` cũ; công cụ hiện dữ liệu cũ kèm giờ cập
  nhật, hoặc "Chưa có dữ liệu xổ số" + nút thử lại nếu chưa có dữ liệu nào. Dự phòng: RSS của `xoso.com.vn` hoặc `kqxs.vn`
  (chưa kiểm tra — cần curl thử trước khi dùng).

## 4. Trending GitHub — api.github.com

- URL: `https://api.github.com/search/repositories?q=created:>YYYY-MM-DD&sort=stars&order=desc&per_page=6`
  (YYYY-MM-DD = 7 ngày trước ngày chạy)
- Cách lấy: GET JSON, không key (giới hạn 60 request/giờ cho IP không xác thực —
  Action chạy 2 lần/ngày nên thoải mái).
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200**.
- Khi chết: script giữ nguyên `trending.json` cũ; trang chủ hiện dữ liệu cũ kèm
  giờ cập nhật, hoặc "chưa tải được" nếu chưa có dữ liệu nào.

## 5. Tin RSS — TechCrunch, CNBC, CoinTelegraph, CoinDesk

| Nhóm | Nguồn | URL RSS |
|---|---|---|
| ai | TechCrunch | `https://techcrunch.com/category/artificial-intelligence/feed/` |
| chung-khoan | CNBC | `https://www.cnbc.com/id/100003114/device/rss/rss.html` |
| crypto | CoinTelegraph | `https://cointelegraph.com/rss` |
| crypto | CoinDesk | `https://www.coindesk.com/arc/outboundfeeds/rss/` |

- Cách lấy: GET RSS XML, parse `<item>` (title, link, pubDate, description),
  lấy 6 tin nhóm ai, 6 tin chung-khoan, 3+3 tin crypto → `news-raw.json`.
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200**, cả 4 feed.
- Khi chết (từng feed): feed đó bị bỏ qua, các feed còn lại vẫn lấy; `news-raw.json`
  ghi `error` liệt kê feed lỗi. Khi tất cả chết: `items: []`, Điểm báo hiện
  "chưa tải được".

## 6. Tóm tắt tin — Gemini API (cần key miễn phí)

- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- Key lấy từ biến môi trường `GEMINI_API_KEY`. Key miễn phí lấy tại
  [Google AI Studio](https://aistudio.google.com/apikey) (gói miễn phí đủ cho
  ~18 tin × 2 lần/ngày).
- Prompt bắt buộc: tóm tắt 1–2 câu, tối đa 260 ký tự, bằng lời của mình (không
  dịch toàn văn), **cấm ngôn ngữ khuyến nghị đầu tư**. Mỗi tin thêm 1 câu "vì sao
  đáng đọc" (tối đa 200 ký tự, nói rõ tác động cụ thể với người đọc Việt Nam).
- Schema `news.json`: `{ updatedAt, summarized, model?, groups: { ai: [...],
  "chung-khoan": [...], crypto: [...] } }`, mỗi tin `{ title, summary, why, link,
  source, publishedAt }`.

### Thêm key vào GitHub Secrets

1. Vào repo trên GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Bấm **New repository secret**.
3. Name: `GEMINI_API_KEY`, Secret: dán key lấy từ Google AI Studio.
4. Bấm **Add secret**. Lần chạy Action tiếp theo sẽ tự tóm tắt.

### Khi chưa có key

`summarize-news.mjs` vẫn chạy bình thường: ghi `news.json` với `summarized: false`
và `summary: ""` cho mọi tin (trang chủ hiện tiêu đề + nguồn + link), đồng thời in
cảnh báo rõ ràng ra log. Action không fail vì thiếu key.

## 7. Crypto — CoinGecko

- URL: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd,vnd&include_24hr_change=true`
- Cách lấy: GET JSON, không key. 5 coin: BTC, ETH, SOL, BNB, XRP — mỗi coin có
  giá USD, giá VND và % đổi 24h.
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200** (BTC $64.271 tại thời điểm
  kiểm tra). Trình duyệt chỉ đọc `/data/crypto.json` cùng tên miền.
- Khi chết: script giữ nguyên `crypto.json` cũ; thẻ crypto hiện dữ liệu cũ kèm
  giờ cập nhật, hoặc "chưa tải được giá crypto" + nút thử lại.

## 8. Sợ hãi & Tham lam — alternative.me

- URL: `https://api.alternative.me/fng/`
- Cách lấy: GET JSON, không key. Trả về giá trị 0–100 + nhãn tiếng Anh
  (Extreme Fear…Extreme Greed); trang dịch nhãn sang tiếng Việt khi hiển thị.
- Trạng thái kiểm tra 17/11/2026: **sống, HTTP 200** (giá trị 12 — Sợ hãi cực độ).
  Trình duyệt chỉ đọc `/data/fng.json` cùng tên miền.
- Khi chết: script giữ nguyên `fng.json` cũ; dòng chỉ số ẩn đi nếu chưa có dữ
  liệu nào.

## Chạy thử ở máy local

```bash
node scripts/fetch-data.mjs              # tải tất cả dữ liệu tươi -> src/data/*.json
node scripts/fetch-data.mjs --only live  # chỉ dữ liệu live 30 phút (fx, gold, crypto, fng)
node scripts/fetch-data.mjs --only daily # chỉ dữ liệu ngày (lottery, trending, news-raw)
node scripts/summarize-news.mjs # tóm tắt (cần GEMINI_API_KEY, không có key thì summary rỗng)
GEMINI_API_KEY=... node scripts/summarize-news.mjs  # tóm tắt thật
```

Yêu cầu: Node.js 18+ (dùng fetch toàn cục). Không cần cài gói nào.
