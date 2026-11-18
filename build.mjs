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
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { shell } from './src/template.js';
import { CATEGORIES, categoryLabel, isCategorySlug } from './src/categories.js';
import { esc, keywordsText, toolCard } from './src/tool-card.js';
import { TOOL_CONTENT } from './src/tool-content.js';
import { SYNONYMS } from './src/search-synonyms.js';
import * as homePage from './src/pages/home.js';
import * as catalogPage from './src/pages/cong-cu.js';
import * as codeMauPage from './src/pages/code-mau.js';
import * as sinhVienPage from './src/pages/sinh-vien.js';
import { TEMPLATES as SINH_VIEN_TEMPLATES } from './src/pages/sinh-vien-data.js';
import * as huongDanPage from './src/pages/huong-dan.js';
import { ARTICLES as HUONG_DAN_ARTICLES } from './src/pages/huong-dan-data.js';
import * as hocMienPhiPage from './src/pages/hoc-mien-phi.js';
import { GROUPS as HOC_MIEN_PHI_GROUPS } from './src/pages/hoc-mien-phi-data.js';
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

// Cache-busting (18/11/2026): Cloudflare đặt max-age=14400 (4 giờ) cho
// /assets/*.css|js. Trình duyệt giữ CSS cũ tới 4 giờ trong khi HTML mới đã
// về -> HTML mới + CSS cũ = bố cục vỡ (đã xảy ra thật với rail video: thẻ
// xếp dọc, tên công cụ thành link xanh ở góc, media cao 510px thay vì 360px
// vì <video> mặc định 150px rơi xuống dòng dưới ảnh). Gắn ?v=<8 ký tự đầu
// sha256 của nội dung file> vào URL style.css/app.js trong mọi trang HTML
// sau khi build: URL chỉ đổi khi nội dung file đổi, trình duyệt tự tải bản
// mới đúng lúc. Thay thế khớp cả dấu ngoặc kép nên chạy lại build cũng
// không gắn ?v= hai lần.
function contentHash(relPath) {
  const buf = fs.readFileSync(path.join(DIST, relPath));
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

function versionAssets() {
  const versions = [
    ['/assets/style.css', contentHash('assets/style.css')],
    ['/assets/app.js', contentHash('assets/app.js')],
  ];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        let html = fs.readFileSync(full, 'utf8');
        let changed = false;
        for (const [url, hash] of versions) {
          const next = html.split(`"${url}"`).join(`"${url}?v=${hash}"`);
          if (next !== html) { html = next; changed = true; }
        }
        if (changed) fs.writeFileSync(full, html, 'utf8');
      }
    }
  };
  walk(DIST);
  console.log(`   - cache-busting: ${versions.map(([u, h]) => `${u}?v=${h}`).join(', ')}`);
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
  // Dòng tham khảo khi finance = true; công cụ có disclaimer riêng (điện,
  // nước, BHXH...) thì dùng câu đó thay cho câu mặc định của trang tài chính.
  const disclaimerHtml = content && content.finance
    ? `<p class="note tool-disclaimer">${esc(content.disclaimer || 'Kết quả chỉ mang tính tham khảo, không thay thế tư vấn của cơ quan thuế/ngân hàng.')}</p>`
    : '';
  // 3 bước dùng nhanh (đổi giao diện 18/11, phong cách 21st.dev): câu chữ
  // theo nhóm hành vi của hạng mục, không bịa tính năng — nhóm tra cứu/
  // hiển thị dùng bước chung có "(nếu có)" vì có công cụ không có nút bấm
  // (đồng hồ, kết quả xổ số...). hoc-tap dùng bước chung vì có 3 công cụ
  // luyện tập/trắc nghiệm không nhập số liệu.
  const CALC_STEPS = ['Nhập số liệu vào các ô trong khung dùng thử', 'Bấm nút chính của công cụ để tính', 'Xem kết quả và thay số liệu để so sánh'];
  const FILE_STEPS = ['Nhập thông tin hoặc tải file lên trong khung dùng thử', 'Bấm nút chính của công cụ (nếu có)', 'Xem kết quả và tải xuống hoặc sao chép khi cần'];
  const GENERIC_STEPS = ['Nhập thông tin hoặc chọn mục cần xem trong khung dùng thử', 'Bấm nút chính của công cụ (nếu có)', 'Xem kết quả ngay trên trang'];
  const steps = ['tai-chinh', 'suc-khoe', 'nha-bep', 'mua-sam'].includes(tool.categorySlug)
    ? CALC_STEPS
    : ['van-phong', 'dev-web'].includes(tool.categorySlug)
      ? FILE_STEPS
      : GENERIC_STEPS;
  const stepsHtml = `<section class="tool-steps" aria-label="Cách dùng nhanh">${steps.map((s, i) => `<div class="tool-step"><span class="tool-step-num">${i + 1}</span><p>${esc(s)}</p></div>`).join('')}</section>`;
  // Công cụ liên quan (tối đa 4, cùng hạng mục): toolPageHtml không nhận
  // danh sách công cụ (chữ ký gọi ở main() giữ nguyên) nên đọc meta trực
  // tiếp từ file nguồn trong thư mục hạng mục — định dạng meta 1 dòng
  // (id/name/desc/icon) đã kiểm chứng đúng 120/120 file, cache theo hạng
  // mục để không quét lại mỗi lần gọi. Thẻ liên quan dùng chung toolCard
  // (src/tool-card.js) để đồng bộ giao diện với catalog.
  const relatedHtml = (() => {
    const cache = toolPageHtml._relatedCache || (toolPageHtml._relatedCache = new Map());
    let list = cache.get(tool.categorySlug);
    if (!list) {
      list = [];
      try {
        const dir = path.join(SRC, 'tools', tool.categorySlug);
        for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
          const src = fs.readFileSync(path.join(dir, file), 'utf8');
          const id = (src.match(/^\s*id:\s*'([^']+)',/m) || [])[1];
          const name = (src.match(/^\s*name:\s*'([^']+)',/m) || [])[1];
          const desc = (src.match(/^\s*desc:\s*'([^']+)',/m) || [])[1];
          const icon = (src.match(/^\s*icon:\s*'([^']+)',/m) || [])[1] || '';
          if (id && name && desc) list.push({ id, name, desc, icon });
        }
        list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      } catch (e) { /* thư mục hạng mục lỗi: bỏ khối liên quan, không fail build */ }
      cache.set(tool.categorySlug, list);
    }
    // Lọc công cụ hiện tại ở lúc render (KHÔNG lúc cache): cache theo hạng
    // mục dùng chung cho mọi công cụ trong hạng mục đó.
    const items = list.filter((r) => r.id !== tool.slug).slice(0, 4);
    if (!items.length) return '';
    return `<section class="tool-related"><h2>Công cụ liên quan</h2><div class="tool-related-grid">${items.map((r) => toolCard({ slug: r.id, name: r.name, desc: r.desc, icon: r.icon, categorySlug: tool.categorySlug, keywords: '' }, 0)).join('')}</div></section>`;
  })();
  // Link tới bài hướng dẫn (mục /huong-dan/) ở cuối trang công cụ —
  // 10 công cụ có bài hướng dẫn tương ứng. Slug bài phải khớp
  // huong-dan-data.js (kiểm tra bằng tay khi thêm bài mới).
  const GUIDE_LINKS = {
    'luong-gross-net': { url: '/huong-dan/cach-tinh-luong-gross-net-2026/', title: 'Cách tính lương Gross sang Net 2026' },
    'tien-dien-bac-thang': { url: '/huong-dan/cach-tinh-tien-dien-bac-thang-2026/', title: 'Cách tính tiền điện bậc thang 2026' },
    'le-phi-mon-bai': { url: '/huong-dan/le-phi-mon-bai-2026-ho-kinh-doanh-duoc-mien/', title: 'Lệ phí môn bài 2026: hộ kinh doanh được miễn' },
    'bhxh-mot-lan': { url: '/huong-dan/cach-tinh-bhxh-mot-lan-2026/', title: 'Cách tính BHXH một lần 2026' },
    'lai-vay': { url: '/huong-dan/cach-tinh-lai-vay-tra-gop-du-no-giam-dan/', title: 'Cách tính lãi vay trả góp theo dư nợ giảm dần' },
    'lai-kep': { url: '/huong-dan/cach-tinh-lai-suat-tiet-kiem-ngan-hang/', title: 'Cách tính lãi suất tiết kiệm ngân hàng' },
    'thue-thu-nhap-ca-nhan': { url: '/huong-dan/cach-tinh-thue-thu-nhap-ca-nhan-2026/', title: 'Cách tính thuế thu nhập cá nhân 2026' },
    'tien-nuoc-bac-thang': { url: '/huong-dan/cach-tinh-tien-nuoc-bac-thang-2026/', title: 'Cách tính tiền nước bậc thang 2026' },
    'luong-tang-ca': { url: '/huong-dan/cach-tinh-luong-tang-ca-2026/', title: 'Cách tính lương tăng ca 2026' },
    'luong-huu': { url: '/huong-dan/cach-tinh-luong-huu-bhxh-2026/', title: 'Cách tính lương hưu BHXH 2026' },
  };
  const guide = GUIDE_LINKS[tool.slug];
  const guideHtml = guide
    ? `<section class="tool-guide" aria-label="Đọc hướng dẫn"><h2>Đọc hướng dẫn</h2><p>Muốn hiểu cách tính từng bước, kèm ví dụ tính sẵn? Đọc bài <a href="${guide.url}">${esc(guide.title)} →</a></p></section>`
    : '';
  const body = `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/cong-cu/">← Tất cả công cụ</a></nav>
  <header class="tool-page-head">
    <h1>${esc(tool.name)}</h1>
    <p class="muted">${esc(tool.desc)}</p>
    <span class="chip">${esc(tool.categoryLabel)}</span>
  </header>
  ${introHtml}
  <div class="tool-try">
    <div id="tool-root">${tool.bodyHtml}</div>
  </div>
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tool-root');
    (${initSrc})(root);
  });
  </script>
  <script src="/assets/tool-state.js" defer></script>
  ${stepsHtml}
  ${faqHtml}
  ${disclaimerHtml}
  ${relatedHtml}
  ${guideHtml}`;
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
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/diem-bao/">← Điểm báo</a></nav>
  <header class="tool-page-head">
    <h1>Điểm báo ngày ${esc(label)}</h1>
    <p class="muted">${items.length} tin về AI, chứng khoán và crypto. Tóm tắt ngắn bằng lời của mình, bấm tiêu đề để đọc bản gốc.</p>
  </header>
  <p class="note">Tin tóm tắt tham khảo, không phải lời khuyên đầu tư.</p>
  <div class="news-list">${cards}</div>`;
  return shell({
    title: `Điểm báo ngày ${label} | ${SITE_NAME}`,
    desc: `Điểm báo ngày ${label}: ${items.length} tin về AI, chứng khoán và crypto, tóm tắt ngắn kèm lý do đáng đọc.`,
    keywords: 'điểm báo, tin tức, AI, chứng khoán, crypto',
    canonical: `${BASE_URL}/diem-bao/${date}/`,
    navActive: 'diem-bao',
    body,
  });
}

// Trang mục Điểm báo (/diem-bao/): liệt kê các ngày có lưu trữ (mới
// nhất trước), mỗi ngày kèm số tin + link tới trang lưu trữ ngày đó.
// Trang này là đích của mục "Điểm báo" trên header/footer (L7); khi
// chưa có ngày nào thì hiện câu báo trống thay vì danh sách rỗng.
function newsIndexHtml(newsByDay, newsDays) {
  const fmtDay = (date) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };
  const list = newsDays.length
    ? `<ul class="news-archive-list">${newsDays.map((day) => {
        const count = (newsByDay.get(day) || []).length;
        return `<li><a href="/diem-bao/${day}/">Ngày ${fmtDay(day)}</a> — ${count} tin</li>`;
      }).join('\n')}</ul>`
    : '<p class="muted">Chưa có ngày lưu trữ nào — Điểm báo sẽ xuất hiện ở đây sau bản tin đầu tiên.</p>';
  const body = `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">← Trang chủ</a></nav>
  <header class="tool-page-head">
    <h1>Điểm báo</h1>
    <p class="muted">Tin về AI, chứng khoán và crypto, tóm tắt ngắn bằng lời của mình. Bấm vào một ngày để đọc các tin của ngày đó, bấm tiêu đề tin để đọc bản gốc.</p>
  </header>
  <p class="note">Tin tóm tắt tham khảo, không phải lời khuyên đầu tư.</p>
  ${list}`;
  return shell({
    title: `Điểm báo — Lưu trữ theo ngày | ${SITE_NAME}`,
    desc: 'Điểm báo hằng ngày của Tiện Ích Hub: tin về AI, chứng khoán và crypto, tóm tắt ngắn kèm lý do đáng đọc — lưu trữ theo ngày.',
    keywords: 'điểm báo, tin tức, AI, chứng khoán, crypto',
    canonical: `${BASE_URL}/diem-bao/`,
    navActive: 'diem-bao',
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
      // Rail video trang chủ: preload 2 poster đầu (như 21st.dev preload
      // poster của thẻ nổi bật với fetchpriority cao); 6 poster còn lại lazy.
      extraHead: '<link rel="preload" as="image" href="/assets/rail/luong-gross-net.jpg" fetchpriority="high"><link rel="preload" as="image" href="/assets/rail/tien-dien-bac-thang.jpg">',
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

  // Trang Sinh viên: trang chính + 8 trang mẫu biểu tự viết (đều vào
  // sitemap). Dữ liệu từ src/pages/sinh-vien-data.js (theo báo cáo nghiên
  // cứu đã kiểm chứng 18/11/2026). Mẫu biểu KHÔNG phải công cụ.
  const sinhVienSlugs = new Set();
  for (const t of SINH_VIEN_TEMPLATES) {
    if (!t.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug)) {
      fail(`sinh-vien-data.js: slug mẫu "${t.slug}" không hợp lệ — chỉ dùng chữ thường a-z, số 0-9 và dấu gạch ngang.`);
    }
    if (sinhVienSlugs.has(t.slug)) fail(`sinh-vien-data.js: slug mẫu "${t.slug}" bị trùng.`);
    sinhVienSlugs.add(t.slug);
    for (const f of ['title', 'desc', 'body']) {
      if (!t[f] || typeof t[f] !== 'string') {
        fail(`sinh-vien-data.js: mẫu "${t.slug}" thiếu trường "${f}".`);
      }
    }
  }
  addPage(
    'sinh-vien/index.html',
    shell({
      title: `Dành cho sinh viên — Khóa học miễn phí, mẫu CV/báo cáo, ưu đãi phần mềm | ${SITE_NAME}`,
      desc: 'Dành cho sinh viên: khóa học miễn phí (freeCodeCamp, MIT OCW, Khan Academy, VMOOCs…), 8 mẫu CV/đơn/báo cáo tự viết, ưu đãi GitHub, JetBrains, Figma, Notion, Spotify Student và công cụ học tập.',
      keywords: 'sinh viên, khóa học miễn phí, mẫu CV, báo cáo thực tập, ưu đãi sinh viên, GitHub Student Pack',
      canonical: `${BASE_URL}/sinh-vien/`,
      navActive: 'sinh-vien',
      body: sinhVienPage.body(ctx),
      noscriptLinks,
    }),
    `${BASE_URL}/sinh-vien/`
  );
  for (const t of SINH_VIEN_TEMPLATES) {
    addPage(
      `sinh-vien/${t.slug}/index.html`,
      shell({
        title: `${t.title} — Dành cho sinh viên | ${SITE_NAME}`,
        desc: t.desc,
        keywords: `sinh viên, ${t.title}`,
        canonical: `${BASE_URL}/sinh-vien/${t.slug}/`,
        navActive: 'sinh-vien',
        body: sinhVienPage.detailBody({ template: t, templates: SINH_VIEN_TEMPLATES }),
        noscriptLinks,
      }),
      `${BASE_URL}/sinh-vien/${t.slug}/`
    );
  }
  console.log(`   - Sinh viên: ${SINH_VIEN_TEMPLATES.length} mẫu, ${SINH_VIEN_TEMPLATES.length + 1} trang`);

  // Trang Hướng dẫn: trang mục + 12 bài viết gốc tự viết (đều vào
  // sitemap). Dữ liệu từ src/pages/huong-dan-data.js. Bài viết KHÔNG
  // phải tin tức tổng hợp (ranh giới pháp lý: không đăng lại bài báo,
  // không bình luận độc giả).
  const huongDanSlugs = new Set();
  for (const a of HUONG_DAN_ARTICLES) {
    if (!a.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) {
      fail(`huong-dan-data.js: slug bài "${a.slug}" không hợp lệ — chỉ dùng chữ thường a-z, số 0-9 và dấu gạch ngang.`);
    }
    if (huongDanSlugs.has(a.slug)) fail(`huong-dan-data.js: slug bài "${a.slug}" bị trùng.`);
    huongDanSlugs.add(a.slug);
    for (const f of ['title', 'desc', 'date', 'sources', 'body']) {
      if (!a[f] || typeof a[f] !== 'string') {
        fail(`huong-dan-data.js: bài "${a.slug}" thiếu trường "${f}".`);
      }
    }
    if (!a.cta || !a.cta.url || !a.cta.label || !a.cta.text) {
      fail(`huong-dan-data.js: bài "${a.slug}" thiếu cta (url/label/text).`);
    }
  }
  addPage(
    'huong-dan/index.html',
    shell({
      title: `Hướng dẫn — Cách tính lương, thuế, lãi vay, tiết kiệm, tiền điện, tiền nước, lương hưu, phạt nguội | ${SITE_NAME}`,
      desc: 'Hướng dẫn cách tính lương Gross–Net, thuế TNCN 2026, lãi vay trả góp, lãi tiết kiệm, tiền điện và tiền nước bậc thang, lương hưu BHXH, tra cứu phạt nguội, BHXH một lần, lệ phí môn bài 2026 và cách viết CV sinh viên — tự viết, số liệu theo quy định hiện hành, kèm công cụ tính ngay.',
      keywords: 'hướng dẫn, cách tính lương gross net, cách tính thuế tncn 2026, cách tính lãi vay, cách tính lãi tiết kiệm, cách tính tiền điện, cách tính tiền nước, lương tăng ca, cách tính lương hưu, tra cứu phạt nguội, BHXH một lần, lệ phí môn bài 2026, cách viết CV',
      canonical: `${BASE_URL}/huong-dan/`,
      navActive: 'huong-dan',
      body: huongDanPage.body({ articles: HUONG_DAN_ARTICLES }),
      noscriptLinks,
    }),
    `${BASE_URL}/huong-dan/`
  );
  for (const a of HUONG_DAN_ARTICLES) {
    addPage(
      `huong-dan/${a.slug}/index.html`,
      shell({
        title: `${a.title} — Hướng dẫn | ${SITE_NAME}`,
        desc: a.desc,
        keywords: `hướng dẫn, ${a.title}`,
        canonical: `${BASE_URL}/huong-dan/${a.slug}/`,
        navActive: 'huong-dan',
        body: huongDanPage.detailBody({ article: a, articles: HUONG_DAN_ARTICLES }),
        noscriptLinks,
      }),
      `${BASE_URL}/huong-dan/${a.slug}/`
    );
  }
  console.log(`   - Hướng dẫn: ${HUONG_DAN_ARTICLES.length} bài, ${HUONG_DAN_ARTICLES.length + 1} trang`);

  // Trang Học miễn phí: 1 trang duy nhất (không trang con). Dữ liệu từ
  // src/pages/hoc-mien-phi-data.js — repo đã kiểm chứng thật qua GitHub
  // API 18/11/2026, mô tả tiếng Việt tự viết. Repo KHÔNG phải công cụ.
  const hocMienPhiRepos = new Set();
  let hocMienPhiCount = 0;
  for (const g of HOC_MIEN_PHI_GROUPS) {
    if (!g.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.id)) {
      fail(`hoc-mien-phi-data.js: id nhóm "${g.id}" không hợp lệ.`);
    }
    if (!g.title || !g.intro || !Array.isArray(g.repos) || !g.repos.length) {
      fail(`hoc-mien-phi-data.js: nhóm "${g.id}" thiếu title/intro/repos.`);
    }
    for (const r of g.repos) {
      if (!r.repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r.repo)) {
        fail(`hoc-mien-phi-data.js: repo "${r.repo}" không đúng dạng owner/repo.`);
      }
      if (hocMienPhiRepos.has(r.repo.toLowerCase())) fail(`hoc-mien-phi-data.js: repo "${r.repo}" bị trùng.`);
      hocMienPhiRepos.add(r.repo.toLowerCase());
      hocMienPhiCount += 1;
      for (const f of ['name', 'stars', 'desc']) {
        if (!r[f] || typeof r[f] !== 'string') {
          fail(`hoc-mien-phi-data.js: repo "${r.repo}" thiếu trường "${f}".`);
        }
      }
    }
  }
  addPage(
    'hoc-mien-phi/index.html',
    shell({
      title: `Học miễn phí — Repo GitHub học tiếng Anh, lập trình, thiết kế | ${SITE_NAME}`,
      desc: 'Repo GitHub học miễn phí, mô tả bằng tiếng Việt: học tiếng Anh (từ vựng, IELTS), lập trình (freeCodeCamp, sách miễn phí, lộ trình), thiết kế và bài báo khoa học — kèm số sao và link gốc.',
      keywords: 'học miễn phí, học tiếng anh miễn phí, repo github học lập trình, học lập trình miễn phí, tài liệu miễn phí',
      canonical: `${BASE_URL}/hoc-mien-phi/`,
      navActive: '', // Không có trong nav chính (header tràn ở 1280px nếu thêm mục thứ 8 — đã đo thật).
      body: hocMienPhiPage.body(),
      noscriptLinks,
    }),
    `${BASE_URL}/hoc-mien-phi/`
  );
  console.log(`   - Học miễn phí: ${hocMienPhiCount} repo, 1 trang`);

  // Trang mục Điểm báo (/diem-bao/) + trang lưu trữ theo ngày (mới nhất
  // trước). Trang mục vào sitemap như mọi trang khác (qua addPage).
  const newsByDay = loadNewsByDay();
  const newsDays = [...newsByDay.keys()].sort().reverse();
  addPage(
    'diem-bao/index.html',
    newsIndexHtml(newsByDay, newsDays),
    `${BASE_URL}/diem-bao/`
  );
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
  // Font Inter tự host (vòng 3): variable woff2, subset latin + vietnamese.
  // LICENSE.txt đi kèm để tuân thủ SIL OFL 1.1.
  copyFile('fonts/Inter-var-latin.woff2', 'assets/fonts/Inter-var-latin.woff2');
  copyFile('fonts/Inter-var-vietnamese.woff2', 'assets/fonts/Inter-var-vietnamese.woff2');
  copyFile('fonts/LICENSE.txt', 'assets/fonts/LICENSE.txt');
  copyFile('app.js', 'assets/app.js');
  // Logo + favicon (18/11): file thật để Google đọc được (data URI thì
  // kết quả tìm kiếm chỉ hiện quả cầu mặc định). favicon.ico ở gốc để
  // trình duyệt tự tìm; SVG/PNG để tham chiếu tường minh.
  copyFile('logo/favicon.svg', 'favicon.svg');
  copyFile('logo/favicon.ico', 'favicon.ico');
  copyFile('logo/apple-touch-icon.png', 'apple-touch-icon.png');
  copyFile('logo/favicon-48.png', 'assets/favicon-48.png');
  copyFile('logo/favicon-192.png', 'assets/favicon-192.png');
  copyFile('logo/og-image.png', 'assets/og-image.png');
  copyFile('tool-state.js', 'assets/tool-state.js');
  // Rail video trang chủ (18/11, theo cơ chế 21st.dev): 8 clip mp4 + 8
  // poster jpg trong src/rail/. Thiếu file nào thì build dừng ngay để
  // khỏi đăng rail thiếu video.
  const RAIL_FILES = ['luong-gross-net', 'tien-dien-bac-thang', 'vietqr-wifi-qr', 'lich-am', 'bhxh-mot-lan', 'lai-vay', 'doi-dia-chi-cu-moi', 'tao-bieu-do'];
  for (const slug of RAIL_FILES) {
    copyFile(`rail/${slug}.mp4`, `assets/rail/${slug}.mp4`);
    copyFile(`rail/${slug}.jpg`, `assets/rail/${slug}.jpg`);
  }
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

  // Gắn ?v=<hash nội dung> vào URL style.css/app.js trong mọi trang HTML
  // (chống trình duyệt giữ CSS/JS cũ sau mỗi lần triển khai — xem
  // versionAssets). Chạy cuối cùng, sau khi mọi HTML + asset đã ghi xong.
  versionAssets();

  console.log(`✅ Build xong trong ${Date.now() - started}ms:`);
  console.log(`   - ${tools.length} công cụ, ${urls.length} trang, sitemap ${urls.length} URL`);
  console.log(`   - dist/: index, cong-cu/, ung-ho/, dieu-khoan/, chinh-sach-bao-mat/, lien-he/, assets/, data/`);
  console.log(`   - search-index: ${searchIndex.count} công cụ, ${Object.keys(searchIndex.synonyms).length} từ đồng nghĩa`);
}

main().catch((e) => fail(e && e.message ? `${e.message}\n${e.stack || ''}` : String(e)));
