// ============================================================================
// build.mjs — Trình sinh trang tĩnh cho Tiện Ích Hub (tienichhub.io.vn)
//
//   npm run build          -> quét src/tools/*/*.js, sinh toàn bộ dist/
//
// Sinh ra: index.html, cong-cu/index.html, cong-cu/<slug>/index.html (mỗi
// công cụ 1 URL riêng), ung-ho/, dieu-khoan/, chinh-sach-bao-mat/,
// sitemap.xml, robots.txt; copy assets/ + data/ sang dist/.
//
// FAIL LOUDLY: build dừng ngay (exit 1) nếu module công cụ thiếu meta/body/
// init, body() không trả về chuỗi, slug sai định dạng/trùng, hạng mục không
// nằm trong 11 hạng mục, hoặc body() chứa thẻ <script>.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { shell } from './src/template.js';
import { CATEGORIES, categoryLabel, isCategorySlug } from './src/categories.js';
import { esc, keywordsText } from './src/tool-card.js';
import { TOOL_CONTENT } from './src/tool-content.js';
import { SYNONYMS } from './src/search-synonyms.js';
import * as homePage from './src/pages/home.js';
import * as catalogPage from './src/pages/cong-cu.js';
import * as codeMauPage from './src/pages/code-mau.js';
import * as ungHoPage from './src/pages/ung-ho.js';
import * as dieuKhoanPage from './src/pages/dieu-khoan.js';
import * as privacyPage from './src/pages/chinh-sach-bao-mat.js';
import * as lienHePage from './src/pages/lien-he.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const BASE_URL = 'https://tienichhub.io.vn';
const SITE_NAME = 'Tiện Ích Hub';

// Chỉ copy các file dữ liệu mà trang/công cụ thực sự đọc.
// (news-raw.json là dữ liệu thô của worker dữ liệu, không đưa lên dist.)
const DATA_FILES = ['news.json', 'trending.json', 'gold.json', 'fx.json', 'lottery.json', 'crypto.json', 'fng.json', 'dia-chi-cu-moi.json'];

function fail(msg) {
  console.error(`\n❌ BUILD LỖI: ${msg}\n`);
  process.exit(1);
}

function writeFile(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function copyFile(srcRel, distRel) {
  const src = path.join(SRC, srcRel);
  if (!fs.existsSync(src)) fail(`Thiếu file nguồn: src/${srcRel}`);
  const dst = path.join(DIST, distRel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

// ---------------------------------------------------------------------------
// Tìm kiếm thật (worker W11): chỉ mục dist/data/search-index.json
// ---------------------------------------------------------------------------
// Bỏ dấu tiếng Việt (giữ nguyên hoa/thường) — bản sao độc lập của hàm
// cùng tên trong src/app.js, KHÔNG import từ app.js (app.js là script
// trình duyệt, không phải module ES). đ/Đ không tách được bằng NFD nên thay tay.
function stripDiacritics(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Chuẩn hóa để tìm kiếm: bỏ dấu + viết thường.
function normKey(s) {
  return stripDiacritics(s).toLowerCase();
}

// Sinh chỉ mục tìm kiếm từ meta công cụ + bảng đồng nghĩa.
// Mỗi mục: {id, slug, name, keywords, desc, categorySlug, categoryLabel}
// + trường đã chuẩn hóa bỏ dấu (nameNorm/keywordsNorm/descNorm).
// Khóa đồng nghĩa cũng chuẩn hóa bỏ dấu; id không tồn tại thì dừng build.
function buildSearchIndex(tools) {
  const knownIds = new Set(tools.map((t) => t.slug));
  const synonyms = {};
  for (const [key, ids] of Object.entries(SYNONYMS)) {
    const norm = normKey(key);
    if (!norm) continue;
    if (!Array.isArray(ids)) fail(`search-synonyms.js: khóa "${key}" phải là mảng id công cụ.`);
    const list = synonyms[norm] || (synonyms[norm] = []);
    for (const id of ids) {
      if (!knownIds.has(id)) {
        fail(`search-synonyms.js: khóa "${key}" trỏ tới id không tồn tại: "${id}".`);
      }
      if (!list.includes(id)) list.push(id);
    }
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    count: tools.length,
    tools: tools.map((t) => ({
      id: t.slug,
      slug: t.slug,
      name: t.name,
      keywords: t.keywords,
      desc: t.desc,
      categorySlug: t.categorySlug,
      categoryLabel: t.categoryLabel,
      nameNorm: normKey(t.name),
      keywordsNorm: normKey(t.keywords),
      descNorm: normKey(t.desc),
    })),
    synonyms,
  };
}

// ---------------------------------------------------------------------------
// SSR trang chủ (worker W11): đọc JSON dữ liệu để render sẵn Điểm báo +
// bảng xếp hạng trong HTML lúc build. File lỗi/thiếu thì trả null và
// home.js render khung tải như cũ (app.js sẽ fetch lúc chạy).
// ---------------------------------------------------------------------------
function readJsonIfExists(srcRel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(SRC, srcRel), 'utf8'));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Quét + kiểm tra công cụ
// ---------------------------------------------------------------------------
async function loadTools() {
  const toolsDir = path.join(SRC, 'tools');
  if (!fs.existsSync(toolsDir)) fs.mkdirSync(toolsDir, { recursive: true });

  const tools = [];
  const seenSlugs = new Set();

  const categoryDirs = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const folder of categoryDirs) {
    const dir = path.join(toolsDir, folder);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const rel = path.relative(ROOT, fullPath);
      let mod;
      try {
        mod = await import(pathToFileURL(fullPath).href);
      } catch (e) {
        fail(`Không import được ${rel}:\n  ${e.message}`);
      }
      if (!mod.meta || typeof mod.meta !== 'object') {
        fail(`${rel}: thiếu export "meta" (object). Xem CONTRACT.md.`);
      }
      if (typeof mod.body !== 'function') {
        fail(`${rel}: thiếu export "body()" (function). Xem CONTRACT.md.`);
      }
      if (typeof mod.init !== 'function') {
        fail(`${rel}: thiếu export "init(root)" (function). Xem CONTRACT.md.`);
      }
      const { meta } = mod;

      // Slug: meta.id là chuẩn (worker công cụ dùng id); meta.slug là dự phòng.
      const slug = meta.id || meta.slug || file.replace(/\.js$/, '');
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        fail(`${rel}: slug "${slug}" không hợp lệ — chỉ dùng chữ thường a-z, số 0-9 và dấu gạch ngang.`);
      }
      if (seenSlugs.has(slug)) fail(`${rel}: slug "${slug}" bị trùng với công cụ khác.`);
      seenSlugs.add(slug);

      if (!meta.name || typeof meta.name !== 'string') {
        fail(`${rel}: meta.name thiếu hoặc không phải chuỗi.`);
      }
      if (!meta.desc || typeof meta.desc !== 'string') {
        fail(`${rel}: meta.desc thiếu hoặc không phải chuỗi.`);
      }
      // Hạng mục: meta.categorySlug là chuẩn; mặc định lấy tên thư mục.
      const categorySlug = meta.categorySlug || folder;
      if (!isCategorySlug(categorySlug)) {
        fail(`${rel}: hạng mục "${categorySlug}" không nằm trong 11 hạng mục (${CATEGORIES.map((c) => c.slug).join(', ')}).`);
      }

      let bodyHtml;
      try {
        bodyHtml = mod.body();
      } catch (e) {
        fail(`${rel}: body() lỗi khi chạy:\n  ${e.message}`);
      }
      if (typeof bodyHtml !== 'string') {
        fail(`${rel}: body() phải trả về chuỗi HTML, nhận được ${typeof bodyHtml}.`);
      }
      if (/<script[\s>]/i.test(bodyHtml)) {
        fail(`${rel}: body() chứa thẻ <script> — JavaScript của công cụ chỉ được đặt trong init(root).`);
      }

      tools.push({
        slug,
        name: meta.name,
        desc: meta.desc,
        categorySlug,
        categoryLabel: categoryLabel(categorySlug),
        keywords: keywordsText(meta),
        icon: meta.icon || '',
        seoTitle: meta.seoTitle || '',
        seoDesc: meta.seoDesc || '',
        bodyHtml,
        initSource: mod.init.toString(),
      });
    }
  }

  // Thứ tự catalog: theo thứ tự 11 hạng mục, rồi theo tên (tiếng Việt).
  const catOrder = new Map(CATEGORIES.map((c, i) => [c.slug, i]));
  tools.sort(
    (a, b) =>
      catOrder.get(a.categorySlug) - catOrder.get(b.categorySlug) ||
      a.name.localeCompare(b.name, 'vi')
  );
  return tools;
}

// ---------------------------------------------------------------------------
// Trang công cụ
// ---------------------------------------------------------------------------
// Thư viện vendor riêng theo trang (mở rộng chung của mẫu needsQR):
// slug công cụ -> mảng tên file trong src/vendor/ (được copy sang
// dist/assets/vendor/). Chỉ trang công cụ liệt kê ở đây mới nạp thư viện;
// trang chủ + các trang khác không nặng thêm.
const TOOL_VENDOR_SCRIPTS = {
  'pdf-sang-word': ['pdf.min.js'], // pdf.js — trích văn bản từ PDF
  'gop-pdf': ['pdf-lib.min.js'], // pdf-lib — gộp PDF
  'tach-trang-pdf': ['pdf-lib.min.js'], // pdf-lib — tách trang PDF
  // 'anh-sang-pdf' không cần thư viện: canvas + trình ghi PDF viết tay.
};

function toolPageHtml(tool, index, noscriptLinks) {
  // init() tự chứa hoàn toàn (không import) nên nhúng được bằng toString().
  // Escape </script> để mã nguồn init không phá vỡ thẻ script.
  const initSrc = tool.initSource.replace(/<\/script/gi, '<\\/script');
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
  const body = `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/cong-cu/">← Tất cả công cụ</a></nav>
  <header class="tool-page-head">
    <h1>${esc(tool.name)}</h1>
    <p class="muted">${esc(tool.desc)}</p>
    <span class="chip">${esc(tool.categoryLabel)}</span>
  </header>
  ${introHtml}
  <div id="tool-root">${tool.bodyHtml}</div>
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tool-root');
    (${initSrc})(root);
  });
  </script>
  <script src="/assets/tool-state.js" defer></script>
  ${faqHtml}
  ${disclaimerHtml}`;
  return shell({
    title: `${tool.seoTitle || tool.name} | ${SITE_NAME}`,
    desc: tool.seoDesc || tool.desc,
    keywords: tool.keywords,
    canonical: `${BASE_URL}/cong-cu/${tool.slug}/`,
    navActive: 'cong-cu',
    body,
    noscriptLinks,
    // Chỉ trang VietQR/WiFi QR cần thư viện qrcode-generator (vẽ mã QR).
    needsQR: tool.slug === 'vietqr-wifi-qr',
    // Thư viện vendor riêng theo trang (pdf.js / pdf-lib cho các công cụ PDF).
    vendorScripts: TOOL_VENDOR_SCRIPTS[tool.slug] || [],
  });
}

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

// ---------------------------------------------------------------------------
// Code mẫu (nhóm E, 18/11) — thư viện đoạn code sao chép-dán, KHÔNG phải
// công cụ: không tính vào số công cụ, không nằm trong src/tools/.
// Dữ liệu từ src/data/code-mau.json, đọc lúc build (không fetch lúc chạy).
// ---------------------------------------------------------------------------
function loadCodeSamples() {
  const data = readJsonIfExists('data/code-mau.json');
  if (!data || !Array.isArray(data.samples)) {
    fail('src/data/code-mau.json thiếu hoặc không có mảng "samples".');
  }
  const topics = Array.isArray(data.topics) ? data.topics : [];
  const topicSlugs = new Set(topics.map((t) => t.slug));
  const seenIds = new Set();
  for (const s of data.samples) {
    if (!s.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)) {
      fail(`code-mau.json: id "${s.id}" không hợp lệ — chỉ dùng chữ thường a-z, số 0-9 và dấu gạch ngang.`);
    }
    if (seenIds.has(s.id)) fail(`code-mau.json: id "${s.id}" bị trùng.`);
    seenIds.add(s.id);
    for (const f of ['title', 'desc', 'lang', 'code', 'prompt']) {
      if (!s[f] || typeof s[f] !== 'string') {
        fail(`code-mau.json: mẫu "${s.id}" thiếu trường "${f}".`);
      }
    }
    if (!topicSlugs.has(s.topic)) {
      fail(`code-mau.json: mẫu "${s.id}" có chủ đề "${s.topic}" không nằm trong danh sách chủ đề.`);
    }
  }
  return { samples: data.samples, topics };
}

function codeSamplePageHtml(sample, samples, topics) {
  const topic = topics.find((t) => t.slug === sample.topic);
  return shell({
    title: `${sample.title} — Code mẫu | ${SITE_NAME}`,
    desc: sample.desc,
    keywords: `code mẫu, ${sample.title}, ${sample.lang}${topic ? `, ${topic.label}` : ''}`,
    canonical: `${BASE_URL}/code-mau/${sample.id}/`,
    navActive: 'code-mau',
    body: codeMauPage.detailBody({ sample, samples, topics }),
  });
}

// ---------------------------------------------------------------------------
// Build chính
// ---------------------------------------------------------------------------
async function main() {
  const started = Date.now();
  const tools = await loadTools();
  const { samples: codeSamples, topics: codeTopics } = loadCodeSamples();
  // Dữ liệu SSR cho trang chủ (Điểm báo + bảng xếp hạng render sẵn lúc build).
  const newsData = readJsonIfExists('data/news.json');
  const trendingData = readJsonIfExists('data/trending.json');
  const ctx = { tools, categories: CATEGORIES, news: newsData, trending: trendingData };
  const today = new Date().toISOString().slice(0, 10);

  // Danh sách link tĩnh tới toàn bộ công cụ cho khối <noscript> (template.js).
  const noscriptLinks = tools
    .map((t) => `<a href="/cong-cu/${esc(t.slug)}/">${esc(t.name)}</a>`)
    .join('\n      ');

  // Dọn + tạo lại dist/
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const urls = []; // { loc, lastmod } cho sitemap
  const addPage = (relPath, html, loc) => {
    writeFile(relPath, html);
    urls.push({ loc, lastmod: today });
  };

  // Trang tĩnh
  addPage(
    'index.html',
    shell({
      title: `${SITE_NAME} — Công cụ miễn phí & Điểm báo hằng ngày`,
      desc: 'Tiện Ích Hub: công cụ miễn phí chạy ngay trên trình duyệt (không cần đăng nhập, không thu thập dữ liệu) kèm Điểm báo hằng ngày về AI, chứng khoán và crypto.',
      keywords: 'công cụ miễn phí, tiện ích online, điểm báo, tính phần trăm, đổi đơn vị, BMI',
      canonical: `${BASE_URL}/`,
      navActive: 'home',
      body: homePage.body(ctx),
      noscriptLinks,
    }),
    `${BASE_URL}/`
  );

  addPage(
    'cong-cu/index.html',
    shell({
      title: `Tất cả công cụ | ${SITE_NAME}`,
      desc: `Danh sách ${tools.length} công cụ miễn phí của Tiện Ích Hub: tài chính, văn phòng, sức khỏe, học tập, nhà & bếp, du lịch, mua sắm, đời sống, Dev & web, GitHub, hằng ngày.`,
      keywords: 'công cụ miễn phí, tiện ích online, tính toán, chuyển đổi',
      canonical: `${BASE_URL}/cong-cu/`,
      navActive: 'cong-cu',
      body: catalogPage.body(ctx),
      noscriptLinks,
    }),
    `${BASE_URL}/cong-cu/`
  );

  addPage(
    'ung-ho/index.html',
    shell({
      title: `Ủng hộ | ${SITE_NAME}`,
      desc: 'Ủng hộ tự nguyện để duy trì Tiện Ích Hub (tên miền, hosting) qua chuyển khoản VietQR — không phải quyên góp từ thiện, không có lợi ích đổi lại.',
      keywords: 'ủng hộ, donate, VietQR',
      canonical: `${BASE_URL}/ung-ho/`,
      navActive: 'ung-ho',
      body: ungHoPage.body(ctx),
      noscriptLinks,
      needsQR: true, // trang Ủng hộ vẽ mã VietQR
    }),
    `${BASE_URL}/ung-ho/`
  );

  addPage(
    'dieu-khoan/index.html',
    shell({
      title: `Điều khoản sử dụng | ${SITE_NAME}`,
      desc: 'Điều khoản sử dụng Tiện Ích Hub: sử dụng công cụ, Điểm báo, gỡ nội dung và khiếu nại bản quyền.',
      canonical: `${BASE_URL}/dieu-khoan/`,
      navActive: '',
      body: dieuKhoanPage.body(ctx),
      noscriptLinks,
    }),
    `${BASE_URL}/dieu-khoan/`
  );

  addPage(
    'chinh-sach-bao-mat/index.html',
    shell({
      title: `Chính sách bảo mật | ${SITE_NAME}`,
      desc: 'Chính sách bảo mật Tiện Ích Hub theo Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15: trang không có tài khoản, mọi tính toán chạy trên trình duyệt, không thu thập dữ liệu người dùng.',
      canonical: `${BASE_URL}/chinh-sach-bao-mat/`,
      navActive: '',
      body: privacyPage.body(ctx),
      noscriptLinks,
    }),
    `${BASE_URL}/chinh-sach-bao-mat/`
  );

  addPage(
    'lien-he/index.html',
    shell({
      title: `Liên hệ | ${SITE_NAME}`,
      desc: 'Liên hệ Tiện Ích Hub: Ngô Minh Tuấn, email ngotuantdmu97@gmail.com — kênh tiếp nhận góp ý, báo lỗi và khiếu nại bản quyền (xử lý trong 24–72 giờ).',
      canonical: `${BASE_URL}/lien-he/`,
      navActive: '',
      body: lienHePage.body(ctx),
      noscriptLinks,
    }),
    `${BASE_URL}/lien-he/`
  );

  // Trang từng công cụ
  tools.forEach((tool, i) => {
    addPage(
      `cong-cu/${tool.slug}/index.html`,
      toolPageHtml(tool, i, noscriptLinks),
      `${BASE_URL}/cong-cu/${tool.slug}/`
    );
  });

  // Trang Code mẫu: danh mục + trang riêng từng mẫu (đều vào sitemap).
  // Mẫu code KHÔNG tính vào số công cụ (câu "120 công cụ" không đổi).
  addPage(
    'code-mau/index.html',
    shell({
      title: `Code mẫu cho lập trình viên | ${SITE_NAME}`,
      desc: `${codeSamples.length} mẫu code sao chép-dán cho lập trình viên: VietQR, CRC16, kiểm tra SĐT/CCCD/mã số thuế, đọc số thành chữ, slug tiếng Việt, JWT, debounce — đã chạy thử, kèm prompt cho AI.`,
      keywords: 'code mẫu, snippet, VietQR, CRC16, JavaScript, Python',
      canonical: `${BASE_URL}/code-mau/`,
      navActive: 'code-mau',
      body: codeMauPage.body({ samples: codeSamples, topics: codeTopics }),
      noscriptLinks,
    }),
    `${BASE_URL}/code-mau/`
  );
  for (const sample of codeSamples) {
    addPage(
      `code-mau/${sample.id}/index.html`,
      codeSamplePageHtml(sample, codeSamples, codeTopics),
      `${BASE_URL}/code-mau/${sample.id}/`
    );
  }
  console.log(`   - Code mẫu: ${codeSamples.length} mẫu, ${codeSamples.length + 1} trang`);

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

  // Assets + dữ liệu
  // (effects.css đã gộp vào style.css, mascot.js đã gộp vào app.js — worker W11.)
  copyFile('style.css', 'assets/style.css');
  copyFile('app.js', 'assets/app.js');
  copyFile('tool-state.js', 'assets/tool-state.js');
  copyFile('vendor/qrcode-generator.js', 'assets/vendor/qrcode-generator.js');
  copyFile('vendor/pdf.min.js', 'assets/vendor/pdf.min.js');
  // File worker của pdf.js: pdf.js tự nạp lúc chạy (Web Worker) khi trích
  // văn bản — KHÔNG nạp qua thẻ <script>, chỉ cần copy ra dist. Thiếu file
  // này pdf.js báo lỗi "Setting up fake worker failed" (đã kiểm chứng thật).
  copyFile('vendor/pdf.worker.min.js', 'assets/vendor/pdf.worker.min.js');
  copyFile('vendor/pdf-lib.min.js', 'assets/vendor/pdf-lib.min.js');
  for (const f of DATA_FILES) copyFile(`data/${f}`, `data/${f}`);

  // Chỉ mục tìm kiếm (sinh từ meta công cụ + bảng đồng nghĩa).
  const searchIndex = buildSearchIndex(tools);
  writeFile('data/search-index.json', JSON.stringify(searchIndex));

  // robots.txt + sitemap.xml
  writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  writeFile('sitemap.xml', sitemap);

  // File xác minh Google Search Console (thêm 18/11/2026, tài sản URL prefix
  // https://tienichhub.io.vn/ — tài khoản ngotuanqb1997). Nội dung phải đúng
  // 53 byte, KHÔNG có ký tự xuống dòng ở cuối.
  writeFile('google81d07667a4750c6c.html', 'google-site-verification: google81d07667a4750c6c.html');

  console.log(`✅ Build xong trong ${Date.now() - started}ms:`);
  console.log(`   - ${tools.length} công cụ, ${urls.length} trang, sitemap ${urls.length} URL`);
  console.log(`   - dist/: index, cong-cu/, ung-ho/, dieu-khoan/, chinh-sach-bao-mat/, lien-he/, assets/, data/`);
  console.log(`   - search-index: ${searchIndex.count} công cụ, ${Object.keys(searchIndex.synonyms).length} từ đồng nghĩa`);
}

main().catch((e) => fail(e && e.message ? `${e.message}\n${e.stack || ''}` : String(e)));
