# Nối dây: lưu trữ Điểm báo + trạng thái công cụ qua URL + câu "why" (W13)

Ghi chú cho điều phối viên. Worker W13 chỉ tạo mới/sửa các file dưới đây,
KHÔNG sửa `build.mjs`, `src/app.js`, `src/template.js`, `src/pages/*`,
`scripts/fetch-data.mjs`. Các bước dưới đây là mọi thay đổi còn lại —
làm đúng thứ tự, rồi chạy `npm run build` để kiểm tra.

File W13 đã làm xong:
- `scripts/summarize-news.mjs` — prompt Gemini thêm câu "vì sao đáng đọc",
  schema `news.json` thêm trường `why` (không key thì `why: ""`).
- `src/tool-state.js` — script thường (không module, không import): trạng thái
  công cụ qua URL + nút "Đặt lại". Đã test bằng DOM giả lập: 28/28 PASS
  (xem `/tmp/test-tool-state.mjs`).
- `src/tools/hang-ngay/gia-vang-ty-gia.js`, `src/tools/nha-bep/tien-nuoc-bac-thang.js`
  — chỉ sửa nhãn hiển thị thêm đơn vị (5 nhãn, xem báo cáo W13).
- `TOOL-STATE-WIRING.md` — file này.

---

## 1. `build.mjs` — sinh trang lưu trữ Điểm báo theo ngày (mới)

### (a) Hàm render trang lưu trữ — đặt NGAY SAU hàm `toolPageHtml`

Tìm cuối hàm `toolPageHtml` (dòng ~158–186, kết thúc bằng `}` ngay trước
khối chú thích `// ----... Build chính`). Thêm ngay sau nó:

```js
// ---------------------------------------------------------------------------
// Trang lưu trữ Điểm báo theo ngày (/diem-bao/<YYYY-MM-DD>/)
// ---------------------------------------------------------------------------
const NEWS_GROUP_LABELS = { ai: 'AI', 'chung-khoan': 'Chứng khoán', crypto: 'Crypto' };

// Ngày theo giờ Việt Nam (độc giả ở VN) từ publishedAt dạng RFC 2822
// ("Mon, 16 Nov 2026 23:32:32 +0000"). Trả về "YYYY-MM-DD" hoặc "".
const VN_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
function newsDay(publishedAt) {
  if (!publishedAt) return '';
  const d = new Date(publishedAt);
  return isNaN(d.getTime()) ? '' : VN_DAY.format(d);
}

function newsArchiveHtml(date, items) {
  const [y, m, d] = date.split('-');
  const label = `${d}/${m}/${y}`;
  const cards = items.map((it) => `
    <article class="news-card">
      <h4><a href="${esc(it.link || '')}" target="_blank" rel="noopener">${esc(it.title || '(không có tiêu đề)')}</a></h4>
      ${it.summary ? `<p class="news-summary">${esc(it.summary)}</p>` : ''}
      ${it.why ? `<p class="news-why">${esc(it.why)}</p>` : ''}
      <p class="news-meta">${esc([NEWS_GROUP_LABELS[it.group] || it.group || '', it.source || ''].filter(Boolean).join(' · '))}</p>
    </article>`).join('\n');
  const body = `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">← Trang chủ</a></nav>
  <header class="tool-page-head">
    <h1>Điểm báo ngày ${esc(label)}</h1>
    <p class="muted">${items.length} tin về AI, chứng khoán và crypto. Tóm tắt ngắn bằng lời của mình, bấm tiêu đề để đọc bản gốc.</p>
  </header>
  <div class="news-list">${cards}</div>`;
  return shell({
    title: `Điểm báo ngày ${label} | ${SITE_NAME}`,
    desc: `Điểm báo ngày ${label}: ${items.length} tin về AI, chứng khoán và crypto, tóm tắt ngắn kèm lý do đáng đọc.`,
    keywords: 'điểm báo, tin tức, AI, chứng khoán, crypto',
    canonical: `${BASE_URL}/diem-bao/${date}/`,
    navActive: 'home',
    body,
  });
}

// Đọc news.json, gom tin theo ngày (giờ VN), trả về Map ngày -> [tin].
// Thiếu file hoặc lỗi parse thì trả Map rỗng (không fail build: Điểm báo
// là dữ liệu động, trang lưu trữ chỉ là phần thêm).
function loadNewsByDay() {
  const byDay = new Map();
  try {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'news.json'), 'utf8'));
    const groups = (data && data.groups && typeof data.groups === 'object') ? data.groups : {};
    for (const [group, arr] of Object.entries(groups)) {
      if (!Array.isArray(arr)) continue;
      for (const it of arr) {
        const day = newsDay(it.publishedAt);
        if (!day) continue;
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day).push({ ...it, group });
      }
    }
  } catch (e) {
    console.warn(`CẢNH BÁO: không đọc được src/data/news.json để sinh trang lưu trữ Điểm báo (${e.message}). Bỏ qua.`);
  }
  // Tin trong ngày: mới nhất trước.
  for (const items of byDay.values()) {
    items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }
  return byDay;
}
```

Ghi chú:
- `esc`, `shell`, `fs`, `path`, `SRC`, `BASE_URL`, `SITE_NAME` đều đã có
  sẵn trong `build.mjs` — không cần import thêm.
- Ngày dùng giờ `Asia/Ho_Chi_Minh` (không phải UTC): tin đăng 23:32 UTC
  ngày 16/11 là 06:32 ngày 17/11 giờ VN — độc giả VN thấy đúng ngày họ đọc.
- `it.why` chỉ render khi có nội dung (tin chưa tóm tắt có `why: ""`).

### (b) Vòng sinh trang lưu trữ — trong `main()`, SAU vòng trang công cụ

Tìm khối (dòng ~282–289):

```js
  // Trang từng công cụ
  tools.forEach((tool, i) => {
    addPage(
      `cong-cu/${tool.slug}/index.html`,
      toolPageHtml(tool, i),
      `${BASE_URL}/cong-cu/${tool.slug}/`
    );
  });
```

Thêm ngay sau khối đó, TRƯỚC dòng `// Assets + dữ liệu`:

```js
  // Trang lưu trữ Điểm báo theo ngày (mới nhất trước)
  const newsByDay = loadNewsByDay();
  const newsDays = [...newsByDay.keys()].sort().reverse();
  for (const day of newsDays) {
    addPage(
      `diem-bao/${day}/index.html`,
      newsArchiveHtml(day, newsByDay.get(day)),
      `${BASE_URL}/diem-bao/${day}/`
    );
  }
  if (newsDays.length) console.log(`   - Điểm báo lưu trữ: ${newsDays.length} ngày (${newsDays[newsDays.length - 1]} → ${newsDays[0]})`);
```

`addPage` tự thêm URL vào mảng `urls` nên các trang lưu trữ tự có mặt
trong `sitemap.xml` — không cần sửa thêm chỗ nào cho sitemap.

Kiểm tra sau khi áp dụng: `npm run build`, rồi xem
`dist/diem-bao/2026-11-17/index.html` có tồn tại không (hiện tại
`news.json` có 18 tin thuộc 2 ngày UTC 16–17/11/2026; theo giờ VN có thể
gộp khác đi 1 ngày — đó là đúng ý đồ) và `dist/sitemap.xml` có chứa
`/diem-bao/`.

---

## 2. `build.mjs` — nạp `tool-state.js` CHỈ trên trang từng công cụ

### (a) Copy file — trong `main()`, khối `// Assets + dữ liệu`

Tìm dòng (dòng ~295):

```js
  copyFile('mascot.js', 'assets/mascot.js');
```

Thêm ngay sau nó:

```js
  copyFile('tool-state.js', 'assets/tool-state.js');
```

### (b) Thẻ `<script>` — trong hàm `toolPageHtml`, SAU khối script inline

Tìm cuối biến `body` trong `toolPageHtml` (dòng ~167–176):

```js
  <div id="tool-root">${tool.bodyHtml}</div>
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tool-root');
    (${initSrc})(root);
  });
  </script>`;
```

Thêm thẻ script NGAY SAU khối `</script>` đó, vẫn trong template `body`:

```js
  <div id="tool-root">${tool.bodyHtml}</div>
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tool-root');
    (${initSrc})(root);
  });
  </script>
  <script src="/assets/tool-state.js" defer></script>`;
```

Lý do đặt ở đây, KHÔNG đặt trong `src/template.js` (`shell()`):
`shell()` nạp script chung cho MỌI trang (hiện tại: qrcode-generator,
app.js, mascot.js — dòng ~59–61 của `template.js`). `tool-state.js` chỉ
có ích trên trang từng công cụ; `toolPageHtml` là hàm duy nhất render
các trang đó nên đây là đúng vị trí "chỉ trang công cụ".

Lưu ý:
- `tool-state.js` tự kiểm tra `document.readyState` nên chạy đúng cả khi
  nạp bằng `defer` (DOMContentLoaded có thể đã chạy trước).
- Không có `.tool-panel` thì script không làm gì — an toàn nếu sau này
  có trang công cụ nào không dùng panel.
- Không đụng tới Pomodoro/bấm giờ/quay số: script chỉ tác động
  input/select/textarea/button có sẵn và chỉ tự bấm khi panel có
  `.btn-primary`.

Kiểm tra sau khi áp dụng: `npm run build`, rồi `grep` trong
`dist/cong-cu/luong-gross-net/index.html` phải thấy
`assets/tool-state.js`; trong `dist/index.html` KHÔNG thấy.

---

## 3. Render câu "why" trong thẻ tin Điểm báo — `src/app.js` (KHÔNG phải build.mjs)

**Kết luận sau khi đọc code: tin Điểm báo trên trang chủ KHÔNG được render
lúc build (SSR).** `src/pages/home.js` chỉ render khung rỗng
(`<div id="news-featured">`, `<div id="news-groups">`, dòng ~128–134);
`src/app.js` tải `/data/news.json` lúc chạy và render thẻ tin bằng 2 hàm:

- `newsCardHtml(item)` — `src/app.js` dòng ~955
- `newsFeaturedHtml(item)` — `src/app.js` dòng ~967

Nên phần này sửa trong `src/app.js` (ngoài phạm vi W13 — điều phối viên
áp dụng). Trong cả 2 hàm, tìm dòng:

```js
      (summary ? '<p class="news-summary">' + escHtml(summary) + '</p>' : '') +
```

Thêm ngay sau nó (giữ đúng chuỗi nối `+`):

```js
      (item.why ? '<p class="news-why">' + escHtml(item.why) + '</p>' : '') +
```

Ghi chú:
- Chỉ hiện khi `item.why` có nội dung — tin chưa tóm tắt (`why: ""`)
  không hiện gì thêm, tương thích ngược với `news.json` cũ (thiếu trường
  `why` thì `item.why` là `undefined`, cũng không hiện).
- Class `news-why` dùng chung với trang lưu trữ SSR ở mục 1 (đã dùng
  cùng tên class) — nếu muốn kẻ viền/đậm nhạt riêng cho câu "why" thì
  thêm 1 luật CSS cho `.news-why` trong `src/style.css` (tùy chọn,
  không bắt buộc).
- Khối "Tin nổi bật" trong Bảng xếp hạng (`app.js` dòng ~1035) chỉ hiện
  tiêu đề + nguồn + ngày, không hiện tóm tắt — không cần thêm `why`.

---

## Kiểm tra tổng sau khi áp dụng cả 3 mục

```bash
npm run build
ls dist/diem-bao/                                   # có thư mục theo ngày
grep -c "diem-bao" dist/sitemap.xml                 # > 0
grep -c "tool-state.js" dist/cong-cu/bmi/index.html # = 1
grep -c "tool-state.js" dist/index.html             # = 0
grep -n "news-why" dist/assets/app.js               # 2 chỗ (card + featured)
```
