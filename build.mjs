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
import { CATEGORIES, categoryLabel, categoryColor, categoryColorDark, isCategorySlug } from './src/categories.js';
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
import { GROUPS as HOC_MIEN_PHI_GROUPS } from './src/pages/hoc-mien-phi-data.js';
import * as giaoVienPage from './src/pages/giao-vien.js';
import * as giaoVienLopHocPage from './src/pages/giao-vien-lop-hoc.js';
import * as ungHoPage from './src/pages/ung-ho.js';
import * as dieuKhoanPage from './src/pages/dieu-khoan.js';
import * as privacyPage from './src/pages/chinh-sach-bao-mat.js';
import * as lienHePage from './src/pages/lien-he.js';
import * as gioiThieuPage from './src/pages/gioi-thieu.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const BASE_URL = 'https://tienichhub.io.vn';
const SITE_NAME = 'Tiện Ích Hub';

// Chỉ copy các file dữ liệu mà trang/công cụ thực sự đọc.
// (news-raw.json là dữ liệu thô của worker dữ liệu, không đưa lên dist.)
const DATA_FILES = ['news.json', 'trending.json', 'gold.json', 'fx.json', 'lottery.json', 'crypto.json', 'fng.json', 'dia-chi-cu-moi.json', 'xa-cu-moi.json', 'tu-vung-tieng-anh.json'];

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

// JSON-LD cho schema.org (SEO lô 1, 19/11/2026): sinh tự động trong
// build từ meta/TOOL_CONTENT/bài hướng dẫn — KHÔNG viết tay từng trang.
// Escape "<" thành \u003c để chuỗi JSON không bao giờ phá vỡ thẻ script
// (FAQ/bài viết không chứa HTML nhưng vẫn phòng thủ).
function jsonLdScript(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

// '18/11/2026' -> '2026-11-18' (datePublished cho schema Article).
function toISODate(vnDate) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(vnDate || '');
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : '';
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

// MẪU 2 (19/11, Claude duyệt bản thí điểm Lương Gross⇄Net 14:32 19/11
// rồi nhân khuôn cho 8 công cụ tiền/lương/thuế): đầu trang chỉ có link
// về hạng mục, H1, 1 dòng mô tả ngắn + dòng căn cứ pháp lý + ngày cập
// nhật; intro (mô tả dài) chuyển xuống dưới công cụ; ví dụ dùng link
// chữ "Điền vào công cụ ↑" thay nút to; disclaimer riêng cho công cụ
// tiền ("Kết quả chỉ để tham khảo, không thay tư vấn thuế/pháp lý").
// Công thức thuần (src/money-formulas.js) được chèn nguyên văn vào
// trang MẪU 2 (trừ dòng export cuối) để init() gọi qua window.M2_CALC
// — build chỉ nhúng init() bằng toString nên không chèn thì công thức
// ngoài init() sẽ bị rớt. Test scripts/test-money-tools.mjs kiểm cùng
// file này nên công thức trên trang và trong test là một.
const M2_SLUGS = new Set([
  'luong-gross-net', 'thue-thu-nhap-ca-nhan', 'bhxh-mot-lan', 'luong-huu',
  'tien-dien-bac-thang', 'lai-vay', 'luong-thang-13', 'tro-cap-thoi-viec-bhtn',
]);
const M2_FORMULAS_EXPORT_RE = /^export \{[^}]*\};?\s*$/m;
let m2FormulasSrc = null;
function getM2FormulasSrc() {
  if (m2FormulasSrc !== null) return m2FormulasSrc;
  const src = fs.readFileSync(path.join(SRC, 'money-formulas.js'), 'utf8');
  const stripped = src.replace(M2_FORMULAS_EXPORT_RE, '');
  if (stripped === src) fail('money-formulas.js: không gỡ được dòng export cuối (định dạng dòng export đã đổi?).');
  m2FormulasSrc = stripped.replace(/<\/script/gi, '<\\/script');
  return m2FormulasSrc;
}

// Link tới bài viết (mục /huong-dan/) ở cuối trang công cụ — 11 công cụ
// có bài viết tương ứng. Slug bài phải khớp huong-dan-data.js (build
// kiểm tra ở main()). Đặt ở phạm vi module để main() đảo ngược thành
// (bài → công cụ) khi nhúng công cụ ở đầu bài viết (MẪU 3/4, 19/11).
const GUIDE_LINKS = {
  'luong-gross-net': { url: '/huong-dan/cach-tinh-luong-gross-net-2026/', title: 'Cách tính lương Gross sang Net 2026' },
  'tien-dien-bac-thang': { url: '/huong-dan/cach-tinh-tien-dien-bac-thang-2026/', title: 'Cách tính tiền điện bậc thang 2026' },
  'le-phi-mon-bai': { url: '/huong-dan/le-phi-mon-bai-2026-ho-kinh-doanh-duoc-mien/', title: 'Lệ phí môn bài bãi bỏ từ 2026: ai còn phải nộp?' },
  'bhxh-mot-lan': { url: '/huong-dan/cach-tinh-bhxh-mot-lan-2026/', title: 'Cách tính BHXH một lần 2026' },
  'lai-vay': { url: '/huong-dan/cach-tinh-lai-vay-tra-gop-du-no-giam-dan/', title: 'Cách tính lãi vay trả góp theo dư nợ giảm dần' },
  'lai-kep': { url: '/huong-dan/cach-tinh-lai-suat-tiet-kiem-ngan-hang/', title: 'Cách tính lãi suất tiết kiệm ngân hàng' },
  'thue-thu-nhap-ca-nhan': { url: '/huong-dan/cach-tinh-thue-thu-nhap-ca-nhan-2026/', title: 'Cách tính thuế thu nhập cá nhân 2026' },
  'tien-nuoc-bac-thang': { url: '/huong-dan/cach-tinh-tien-nuoc-bac-thang-2026/', title: 'Cách tính tiền nước bậc thang 2026' },
  'luong-tang-ca': { url: '/huong-dan/cach-tinh-luong-tang-ca-2026/', title: 'Cách tính lương tăng ca 2026' },
  'luong-huu': { url: '/huong-dan/cach-tinh-luong-huu-bhxh-2026/', title: 'Cách tính lương hưu BHXH 2026' },
  'luong-thang-13': { url: '/huong-dan/luong-thang-13-thuong-tet-2027/', title: 'Lương tháng 13 & thưởng Tết 2027: có bắt buộc không, tính thuế thế nào' },
};

// Khối nhúng công cụ ở đầu bài viết (MẪU 3/4, 19/11): cùng khung dùng
// thử + init() như trang công cụ, thêm tiêu đề + link tới trang riêng.
// Chỉ dùng cho 11 bài có GUIDE_LINKS; bài không có công cụ liên quan
// (phạt nguội, CV) thì không nhúng gì. tool-state.js nạp kèm để khung
// nhúng có đủ nút Đặt lại + lưu trạng thái qua URL như trang công cụ
// (an toàn trên trang bài: không có nút Báo sai nên logic hộp thoại
// trong tool-state.js tự bỏ qua). Công cụ MẪU 2 cần thêm class
// .m2-page trên <section> — mọi style MẪU 2 (biến --m2-*, nút Chép
// nền xanh, ô nhập 56px...) đều nằm dưới .m2-page; thiếu nó thì nút
// Chép mất nền (bắt được khi xem ảnh chụp bài nhúng, 19/11).
function toolEmbedHtml(tool) {
  const initSrc = tool.initSource.replace(/<\/script/gi, '<\\/script');
  const isM2 = M2_SLUGS.has(tool.slug);
  const catColor = categoryColor(tool.categorySlug);
  const catColorDark = categoryColorDark(tool.categorySlug);
  return `<section class="hd-tool${isM2 ? ' m2-page' : ''}" aria-label="Thử công cụ ngay">
  <h2>Thử ngay: ${esc(tool.name)}</h2>
  <div class="tool-try" style="--cat-color: ${esc(catColor)}; --cat-color-dark: ${esc(catColorDark)}">
    <div id="tool-root">${tool.bodyHtml}</div>
  </div>
  ${isM2 ? `<script>\n${getM2FormulasSrc()}\n</script>` : ''}
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tool-root');
    (${initSrc})(root);
  });
  </script>
  <script src="/assets/tool-state.js" defer></script>
  <p class="muted">Mở trang riêng của công cụ: <a href="/cong-cu/${esc(tool.slug)}/">${esc(tool.name)} →</a></p>
</section>`;
}

function toolPageHtml(tool, index, noscriptLinks) {
  // init() tự chứa hoàn toàn (không import) nên nhúng được bằng toString().
  // Escape </script> để mã nguồn init không phá vỡ thẻ script.
  const initSrc = tool.initSource.replace(/<\/script/gi, '<\\/script');
  // Nội dung giới thiệu + FAQ cho các công cụ chính (src/tool-content.js).
  // Công cụ không có trong TOOL_CONTENT thì các chuỗi dưới rỗng, trang giữ nguyên.
  const content = TOOL_CONTENT[tool.slug] || null;
  const isM2 = M2_SLUGS.has(tool.slug);
  const introHtml = content
    ? `<p class="tool-intro">${esc(content.intro)}</p>`
    : '';
  const faqHtml = content && content.faqs && content.faqs.length
    ? `<section class="tool-faq"><h2>Câu hỏi thường gặp</h2>${content.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>`
    : '';
  // Dòng căn cứ pháp lý (SEO lô 1): 1 dòng cho mỗi công cụ tài chính/luật.
  // MẪU 2: dòng này chuyển lên đầu trang (dưới H1) nên không lặp lại ở dưới.
  const legalHtml = content && content.legalBasis && !isM2
    ? `<p class="note tool-legal">${esc(content.legalBasis)}</p>`
    : '';
  // Dòng tham khảo khi finance = true; công cụ có disclaimer riêng (điện,
  // nước, BHXH...) thì dùng câu đó thay cho câu mặc định. Trang MẪU 2
  // không có câu riêng dùng câu chuẩn ngắn (Claude 15:01 19/11).
  const disclaimerHtml = content && content.finance
    ? `<p class="note tool-disclaimer">${esc(content.disclaimer || (isM2 ? 'Kết quả chỉ để tham khảo, không thay tư vấn thuế/pháp lý.' : 'Kết quả chỉ mang tính tham khảo, không thay thế tư vấn của cơ quan thuế/ngân hàng.'))}</p>`
    : '';
  // KHÔNG còn khối "3 bước dùng nhanh" (đợt sửa UX 19/11): khối rập khuôn
  // chung chung ("Nhập thông tin hoặc chọn mục cần xem…", "Bấm nút chính
  // của công cụ (nếu có)…") đọc lên chẳng chỉ gì cụ thể cho bất kỳ công cụ
  // nào — mỗi công cụ đã tự giải thích bằng nhãn/nút của mình. Đừng thêm
  // lại dạng hướng dẫn chung; công cụ nào thật sự cần hướng dẫn thì viết
  // hướng dẫn RIÊNG cho công cụ đó (như FAQ trong TOOL_CONTENT).
  // Công cụ liên quan (tối đa 4): bảng tay theo cụm chủ đề (SEO lô 1)
  // cho 8 công cụ tiền/lương/thuế — liên kết chéo qua hạng mục (VD lương
  // gross-net → thuế TNCN, BHXH một lần, lương tháng 13, lương tăng ca).
  // Công cụ không có trong bảng thì dùng cách cũ: cùng hạng mục, 4 cái
  // đầu theo tên. toolPageHtml không nhận danh sách công cụ (chữ ký gọi
  // ở main() giữ nguyên) nên đọc meta trực tiếp từ file nguồn — định dạng
  // meta 1 dòng (id/name/desc/icon) đã kiểm chứng đúng 120/120 file,
  // cache toàn cục để không quét lại mỗi lần gọi. Slug trong bảng tay
  // không tồn tại thì fail build (lỗi của người viết bảng, không giấu).
  const RELATED_TOOLS = {
    'luong-gross-net': ['thue-thu-nhap-ca-nhan', 'bhxh-mot-lan', 'luong-thang-13', 'luong-tang-ca'],
    'thue-thu-nhap-ca-nhan': ['luong-gross-net', 'luong-thang-13', 'bhxh-mot-lan', 'luong-tang-ca'],
    'bhxh-mot-lan': ['luong-huu', 'tro-cap-thoi-viec-bhtn', 'luong-gross-net', 'thue-thu-nhap-ca-nhan'],
    'luong-huu': ['bhxh-mot-lan', 'tro-cap-thoi-viec-bhtn', 'luong-gross-net', 'lai-kep'],
    'tien-dien-bac-thang': ['tien-nuoc-bac-thang', 'phan-tram', 'lai-vay', 'doc-so-thanh-chu'],
    'lai-vay': ['lai-kep', 'phan-tram', 'luong-gross-net', 'quy-du-phong'],
    'luong-thang-13': ['thue-thu-nhap-ca-nhan', 'luong-gross-net', 'luong-tang-ca', 'phep-nam'],
    'tro-cap-thoi-viec-bhtn': ['bhxh-mot-lan', 'luong-huu', 'luong-gross-net', 'thue-thu-nhap-ca-nhan'],
  };
  const relatedHtml = (() => {
    const cache = toolPageHtml._metaCache || (toolPageHtml._metaCache = (() => {
      const bySlug = new Map();
      const toolsDir = path.join(SRC, 'tools');
      for (const folder of fs.readdirSync(toolsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
        const dir = path.join(toolsDir, folder);
        for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
          const src = fs.readFileSync(path.join(dir, file), 'utf8');
          const id = (src.match(/^\s*id:\s*'([^']+)',/m) || [])[1];
          const name = (src.match(/^\s*name:\s*'([^']+)',/m) || [])[1];
          const desc = (src.match(/^\s*desc:\s*'([^']+)',/m) || [])[1];
          const icon = (src.match(/^\s*icon:\s*'([^']+)',/m) || [])[1] || '';
          const categorySlug = (src.match(/^\s*categorySlug:\s*'([^']+)',/m) || [])[1] || folder;
          if (id && name && desc) bySlug.set(id, { id, name, desc, icon, categorySlug });
        }
      }
      return bySlug;
    })());
    const hand = RELATED_TOOLS[tool.slug];
    let items;
    if (hand) {
      items = hand.map((slug) => {
        const m = cache.get(slug);
        if (!m) fail(`RELATED_TOOLS: "${tool.slug}" trỏ tới công cụ không tồn tại: "${slug}".`);
        return m;
      }).filter((r) => r.id !== tool.slug);
    } else {
      items = [...cache.values()]
        .filter((r) => r.categorySlug === tool.categorySlug && r.id !== tool.slug)
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
        .slice(0, 4);
    }
    if (!items.length) return '';
    return `<section class="tool-related"><h2>Công cụ liên quan</h2><div class="tool-related-grid">${items.map((r) => toolCard({ slug: r.id, name: r.name, desc: r.desc, icon: r.icon, categorySlug: r.categorySlug, keywords: '' }, 0)).join('')}</div></section>`;
  })();
  // Link tới bài viết ở cuối trang công cụ (GUIDE_LINKS ở phạm vi
  // module, dùng chung cho cả nhúng công cụ ở đầu bài viết).
  const guide = GUIDE_LINKS[tool.slug];
  const guideHtml = guide
    ? `<section class="tool-guide" aria-label="Đọc bài viết"><h2>Đọc bài viết</h2><p>Muốn hiểu cách tính từng bước, kèm ví dụ tính sẵn? Đọc bài <a href="${guide.url}">${esc(guide.title)} →</a></p></section>`
    : '';
  // Hướng B đợt 1: (1) CHỈ GIỮ 1 đoạn mô tả dưới H1 — công cụ có intro
  // (TOOL_CONTENT) thì bỏ dòng desc ngắn (2 đoạn lặp lại cùng thông tin,
  // vd trang Tính lương cùng nói "bảo hiểm 10,5%, giảm trừ 15,5 triệu");
  // công cụ không có intro thì giữ desc. Meta description (SEO) không đổi.
  // (2) Chip hạng mục + khung dùng thử mang màu hạng mục qua biến CSS
  // --cat-color/--cat-color-dark (CSS dùng cho chip, viền trên khung,
  // hộp kết quả nhuộm nhạt). Nút hành động vẫn xanh #0033FF duy nhất.
  // Công cụ Giáo viên: nút mở trong Bàn giáo viên (1 trang app gom cả
  // 10 công cụ + quản lý lớp, dùng cả tiết trên máy chiếu) — đặt nổi
  // bật ngay đầu khung công cụ, mở đúng tab của công cụ này.
  // MẪU 1 (19/11): Xúc xắc + Bốc thăm gộp thành 1 tab
  // 'xuc-xac-boc-so' (Bốc thăm mở đúng ngăn Bốc số qua ?view=boc-so);
  // Âm thanh không còn là tab (nút nhỏ trên thanh trên) nên nút ở
  // trang rời mở trang chính của app (tab Lớp học).
  const GV_APP_TABS = {
    'goi-ten-ngau-nhien': 'goi-ten',
    'chia-nhom-ngau-nhien': 'chia-nhom',
    'tung-xuc-xac-dong-xu': 'xuc-xac-boc-so',
    'boc-tham-so': 'xuc-xac-boc-so',
    'bang-diem-lop': 'bang-diem',
    'am-thanh-lop-hoc': '',
    'dem-nguoc-lop-hoc': 'dem-nguoc',
    'do-do-on-lop-hoc': 'do-on',
    'diem-danh': 'diem-danh',
    'boc-cau-hoi': 'boc-cau-hoi',
  };
  const GV_APP_VIEWS = { 'boc-tham-so': 'boc-so' };
  const gvAppTab = GV_APP_TABS[tool.slug];
  const gvAppView = GV_APP_VIEWS[tool.slug] || '';
  const gvAppHref = gvAppTab === undefined ? ''
    : gvAppTab === '' ? '/giao-vien/lop-hoc/'
    : `/giao-vien/lop-hoc/?tab=${gvAppTab}${gvAppView ? `&view=${gvAppView}` : ''}`;
  const gvAppHtml = gvAppHref
    ? `<p class="gv-app-link"><a class="btn btn-primary" href="${gvAppHref}">Mở trong Bàn giáo viên →</a> <span class="muted">Dùng cả tiết trên một trang: gọi tên, chia nhóm, chấm điểm… không cần chuyển trang.</span></p>`
    : '';
  const catColor = categoryColor(tool.categorySlug);
  const catColorDark = categoryColorDark(tool.categorySlug);
  // MẪU 2: đầu trang luôn có dòng mô tả ngắn (tool.desc) + dòng căn cứ
  // pháp lý lấy nguyên văn legalBasis của trang (không bịa ngày mới —
  // ngày duy nhất trang ghi là 01/7/2026 của trần BHXH, nằm trong câu
  // đó đúng ngữ cảnh) + ngày cập nhật (content.updatedAt, ngày rà lại
  // số liệu của công cụ). Trang thường giữ luật cũ (có intro thì bỏ desc).
  const headDescHtml = isM2
    ? `<p class="m2-head-desc">${esc(tool.desc)}</p>${content && content.legalBasis ? `<p class="m2-head-legal">${esc(content.legalBasis)}${content.updatedAt ? ` Cập nhật ${esc(content.updatedAt)}.` : ''}</p>` : ''}`
    : (content ? '' : `<p class="muted">${esc(tool.desc)}</p>`);
  // Ví dụ tính sẵn + nút "Thử với số này" (SEO lô 1): khối SSR để Google
  // đọc được, nút điền số ví dụ vào form qua data-uh-example-fill (app.js
  // xử lý: mở tab nếu cần, điền fills, bấm nút tính chính, cuộn tới kết
  // quả). Số trong text đã tính bằng máy theo đúng công thức công cụ.
  // MẪU 2 (quyết định 02:06 19/11): nút to đổi thành link chữ nhỏ
  // "Điền vào công cụ ↑" — cùng data-uh-example-fill nên app.js xử lý
  // y hệt (trang này không còn nút tính chính nên calcBtn = null, tính
  // trực tiếp khi điền sẽ tự chạy qua liveCalc).
  const exampleHtml = content && content.example
    ? (isM2
      ? `<section class="tool-example" style="--cat-color: ${esc(catColor)}; --cat-color-dark: ${esc(catColorDark)}"><h2>Ví dụ tính sẵn</h2><p>${esc(content.example.text)}</p><button type="button" class="m2-example-link" data-uh-example-fill="${esc(JSON.stringify({ fills: content.example.fills || {}, tab: content.example.tab || null }))}">Điền vào công cụ ↑</button></section>`
      : `<section class="tool-example" style="--cat-color: ${esc(catColor)}; --cat-color-dark: ${esc(catColorDark)}"><h2>Ví dụ tính sẵn</h2><p>${esc(content.example.text)}</p><button type="button" class="btn btn-primary" data-uh-example-fill="${esc(JSON.stringify({ fills: content.example.fills || {}, tab: content.example.tab || null }))}">Thử với số này</button></section>`)
    : '';
  // Schema JSON-LD (SEO lô 1): WebApplication cho mọi trang công cụ +
  // FAQPage cho công cụ có FAQ. Lưu ý: FAQPage KHÔNG còn cho rich result
  // trên Google (Google ngừng hiển thị hẳn từ 7/5/2026) — sinh kèm vì rẻ
  // và vô hại, có thể giúp công cụ trả lời AI hiểu nội dung, không kỳ vọng
  // nổi bật trên Google.
  const schemaGraph = [{
    '@type': 'WebApplication',
    name: tool.name,
    url: `${BASE_URL}/cong-cu/${tool.slug}/`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    inLanguage: 'vi',
    description: tool.seoDesc || tool.desc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
  }];
  if (content && content.faqs && content.faqs.length) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: content.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  const schemaHead = jsonLdScript({ '@context': 'https://schema.org', '@graph': schemaGraph });
  // Nút "Báo sai số liệu" (MẪU 3/4, 19/11) trên MỌI trang công cụ: mở
  // hộp thoại <dialog> — tên công cụ tự điền sẵn, ô ghi chú, ô chọn
  // "Gửi kèm số liệu tôi đã nhập" (mặc định KHÔNG chọn). Logic mở/đóng
  // + soạn mailto tới ngotuantdmu97@gmail.com nằm trong
  // src/tool-state.js (nạp kèm mọi trang công cụ).
  const reportHtml = `<p class="uh-report-wrap"><button type="button" class="uh-report-btn" data-uh-report>⚠ Báo sai số liệu</button></p>
  <dialog class="uh-report-dialog" data-uh-report-dialog data-uh-tool-name="${esc(tool.name)}" data-uh-tool-slug="${esc(tool.slug)}">
    <h2>Báo sai số liệu</h2>
    <p>Công cụ: <strong>${esc(tool.name)}</strong></p>
    <label class="uh-report-check"><input type="checkbox" data-uh-report-include> Gửi kèm số liệu tôi đã nhập</label>
    <div class="uh-report-field">
      <label for="uh-report-notes">Số liệu nào sai? (không bắt buộc)</label>
      <textarea id="uh-report-notes" data-uh-report-notes placeholder="Ví dụ: tôi nhập lương 30 triệu, kết quả thuế khác với bảng lương công ty."></textarea>
    </div>
    <div class="uh-report-actions">
      <button type="button" class="btn btn-ghost" data-uh-report-cancel>Đóng</button>
      <button type="button" class="btn btn-primary" data-uh-report-send>Soạn email</button>
    </div>
  </dialog>`;
  // Dòng Ủng hộ dưới kết quả MỌI công cụ (Tuấn chốt 19/11): chữ
  // 14px, nhẹ, không popup, không che nội dung. Chèn một lần ở đây
  // (ngay sau khung công cụ) nên cả trang MẪU 2 cũng có.
  const donateHtml = `<p class="uh-donate-line">Công cụ này có ích? <a href="/ung-ho/">Ủng hộ một ly cà phê →</a></p>`;
  const bodyInner = `
  <nav class="breadcrumb" aria-label="Đường dẫn">${isM2 ? `<a href="/cong-cu/?cat=${esc(tool.categorySlug)}">← ${esc(tool.categoryLabel)}</a>` : `<a href="/cong-cu/">← Tất cả công cụ</a>`}</nav>
  <header class="tool-page-head">
    <h1>${esc(tool.name)}</h1>
    ${headDescHtml}
    ${isM2 ? '' : `<span class="chip chip-cat" style="--cat-color: ${esc(catColor)}; --cat-color-dark: ${esc(catColorDark)}">${esc(tool.categoryLabel)}</span>`}
  </header>
  ${isM2 ? '' : introHtml}
  ${gvAppHtml}
  <div class="tool-try" style="--cat-color: ${esc(catColor)}; --cat-color-dark: ${esc(catColorDark)}">
    <div id="tool-root">${tool.bodyHtml}</div>
  </div>
  ${donateHtml}
  ${reportHtml}
  ${isM2 ? `<script>\n${getM2FormulasSrc()}\n</script>` : ''}
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tool-root');
    (${initSrc})(root);
  });
  </script>
  <script src="/assets/tool-state.js" defer></script>
  ${isM2 ? introHtml : ''}
  ${exampleHtml}
  ${legalHtml}
  ${faqHtml}
  ${disclaimerHtml}
  ${relatedHtml}
  ${guideHtml}`;
  const body = isM2 ? `<div class="m2-page">${bodyInner}</div>` : bodyInner;
  return shell({
    title: `${tool.seoTitle || tool.name} | ${SITE_NAME}`,
    desc: tool.seoDesc || tool.desc,
    keywords: tool.keywords,
    canonical: `${BASE_URL}/cong-cu/${tool.slug}/`,
    navActive: 'cong-cu',
    body,
    noscriptLinks,
    extraHead: schemaHead,
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

function newsCardItem(it) {
  return `
    <article class="news-card" data-news-group="${esc(it.group || '')}">
      <h4><a href="${esc(it.link || '')}" target="_blank" rel="noopener">${esc(it.titleVi || it.title || '(không có tiêu đề)')}</a></h4>
      ${it.summary ? `<p class="news-summary">${esc(it.summary)}</p>` : ''}
      ${it.why ? `<p class="news-why">${esc(it.why)}</p>` : ''}
      <p class="news-meta">${esc([NEWS_GROUP_LABELS[it.group] || it.group || '', it.source || ''].filter(Boolean).join(' · '))}</p>
    </article>`;
}

function newsArchiveHtml(date, items) {
  const [y, m, d] = date.split('-');
  const label = `${d}/${m}/${y}`;
  const cards = items.map(newsCardItem).join('\n');
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

// Trang mục Điểm báo (/diem-bao/) — làm lại đợt V2 (19/11): trang đầu
// hiện LUÔN tin của ngày mới nhất (thẻ tin như trang chủ, lọc theo
// AI / Chứng khoán / Crypto bằng chip), danh sách ngày cũ ở cột phải
// (xuống cuối trang trên điện thoại). Trước đây trang này chỉ có 2
// dòng ngày, trông trống. Trang này là đích của mục "Điểm báo" trên
// header/footer (L7); khi chưa có ngày nào thì hiện câu báo trống.
function newsIndexHtml(newsByDay, newsDays) {
  const fmtDay = (date) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };
  const newest = newsDays[0] || '';
  const items = newest ? (newsByDay.get(newest) || []) : [];
  const groups = ['ai', 'chung-khoan', 'crypto'];
  const counts = {};
  items.forEach((it) => { if (it.group) counts[it.group] = (counts[it.group] || 0) + 1; });
  const chips = [`<button type="button" class="hd-chip" data-news-chip="all" aria-pressed="true">Tất cả · ${items.length}</button>`]
    .concat(groups.map((g) => `<button type="button" class="hd-chip" data-news-chip="${g}" aria-pressed="false">${esc(NEWS_GROUP_LABELS[g])} · ${counts[g] || 0}</button>`))
    .join('\n      ');
  const cards = items.map(newsCardItem).join('\n');
  const older = newsDays.slice(1);
  const aside = older.length ? `
    <aside class="news-aside" aria-label="Ngày trước">
      <h2>Ngày trước</h2>
      <ul class="news-archive-list">${older.map((day) => {
        const count = (newsByDay.get(day) || []).length;
        return `<li><a href="/diem-bao/${day}/">Ngày ${fmtDay(day)}</a> <span class="muted">— ${count} tin</span></li>`;
      }).join('\n')}</ul>
    </aside>` : '';
  const body = newest ? `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">← Trang chủ</a></nav>
  <header class="tool-page-head">
    <h1>Điểm báo</h1>
    <p class="muted">Tin ngày ${fmtDay(newest)} — về AI, chứng khoán và crypto, tóm tắt ngắn bằng lời của mình. Bấm tiêu đề tin để đọc bản gốc.</p>
  </header>
  <p class="note">Tin tóm tắt tham khảo, không phải lời khuyên đầu tư.</p>
  <div class="news-index-layout">
    <div class="news-index-main">
      <div class="hd-chips" role="group" aria-label="Lọc theo nhóm tin">
      ${chips}
      </div>
      <div class="news-list">${cards}</div>
    </div>${aside}
  </div>
  <script>
  (function () {
    var chips = document.querySelectorAll('[data-news-chip]');
    var cards = document.querySelectorAll('[data-news-group]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var t = chip.getAttribute('data-news-chip');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        cards.forEach(function (card) {
          card.style.display = (t === 'all' || card.getAttribute('data-news-group') === t) ? '' : 'none';
        });
      });
    });
  })();
  </script>` : `
  <nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">← Trang chủ</a></nav>
  <header class="tool-page-head">
    <h1>Điểm báo</h1>
    <p class="muted">Tin về AI, chứng khoán và crypto, tóm tắt ngắn bằng lời của mình. Bấm tiêu đề tin để đọc bản gốc.</p>
  </header>
  <p class="note">Tin tóm tắt tham khảo, không phải lời khuyên đầu tư.</p>
  <p class="muted">Chưa có ngày lưu trữ nào — Điểm báo sẽ xuất hiện ở đây sau bản tin đầu tiên.</p>`;
  return shell({
    title: `Điểm báo — Tin mới nhất theo ngày | ${SITE_NAME}`,
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
    navActive: '',
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
      navActive: '',
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
      navActive: '',
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

  // Trang Hướng dẫn: trang mục + 13 bài viết gốc tự viết (đều vào
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
  // Nhúng công cụ liên quan ở đầu bài viết (MẪU 3/4, 19/11): đảo
  // GUIDE_LINKS (công cụ → bài) thành (bài → công cụ). Bài không có
  // công cụ liên quan (phạt nguội, CV) thì embedHtml rỗng, bài giữ
  // nguyên. GUIDE_LINKS trỏ tới bài không tồn tại thì fail build.
  const toolsBySlug = new Map(tools.map((t) => [t.slug, t]));
  const guideByArticle = new Map();
  for (const [toolSlug, g] of Object.entries(GUIDE_LINKS)) {
    const m = g.url.match(/^\/huong-dan\/([^/]+)\/$/);
    if (!m) fail(`GUIDE_LINKS: "${toolSlug}" có URL bài không đúng dạng /huong-dan/<slug>/: "${g.url}".`);
    guideByArticle.set(m[1], toolSlug);
  }
  for (const slug of guideByArticle.keys()) {
    if (!huongDanSlugs.has(slug)) fail(`GUIDE_LINKS: trỏ tới bài không tồn tại: "${slug}".`);
  }
  addPage(
    'huong-dan/index.html',
    shell({
      title: `Bài viết — Cách tính lương, thuế, lãi vay, tiết kiệm, tiền điện, tiền nước, lương hưu, lương tháng 13, phạt nguội | ${SITE_NAME}`,      desc: 'Bài viết hướng dẫn cách tính lương Gross–Net, thuế TNCN 2026, lãi vay trả góp, lãi tiết kiệm, tiền điện và tiền nước bậc thang, lương hưu BHXH, lương tháng 13 và thưởng Tết, tra cứu phạt nguội, BHXH một lần, lệ phí môn bài 2026 và cách viết CV sinh viên — tự viết, số liệu theo quy định hiện hành, kèm công cụ tính ngay.',      keywords: 'hướng dẫn, cách tính lương gross net, cách tính thuế tncn 2026, cách tính lãi vay, cách tính lãi tiết kiệm, cách tính tiền điện, cách tính tiền nước, lương tăng ca, cách tính lương hưu, lương tháng 13, thưởng Tết 2027, tra cứu phạt nguội, BHXH một lần, lệ phí môn bài 2026, cách viết CV',
      canonical: `${BASE_URL}/huong-dan/`,
      navActive: 'huong-dan',
      body: huongDanPage.body({ articles: HUONG_DAN_ARTICLES }),
      noscriptLinks,
    }),
    `${BASE_URL}/huong-dan/`
  );
  for (const a of HUONG_DAN_ARTICLES) {
    // Nhúng công cụ liên quan ở đầu bài (nếu có trong GUIDE_LINKS).
    const embedToolSlug = guideByArticle.get(a.slug);
    let embedHtml = '';
    if (embedToolSlug) {
      const embedTool = toolsBySlug.get(embedToolSlug);
      if (!embedTool) fail(`GUIDE_LINKS: bài "${a.slug}" trỏ tới công cụ không tồn tại: "${embedToolSlug}".`);
      embedHtml = toolEmbedHtml(embedTool);
    }
    // Schema Article (SEO lô 1): sinh tự động từ dữ liệu bài — headline,
    // ngày đăng (đổi sang ISO), tác giả/nhà xuất bản là Tiện Ích Hub.
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.desc,
      datePublished: toISODate(a.date),
      inLanguage: 'vi',
      author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/assets/favicon-192.png` },
      },
      mainEntityOfPage: `${BASE_URL}/huong-dan/${a.slug}/`,
    };
    addPage(
      `huong-dan/${a.slug}/index.html`,
      shell({
        title: `${a.title} — Bài viết | ${SITE_NAME}`,        desc: a.desc,
        keywords: `hướng dẫn, ${a.title}`,
        canonical: `${BASE_URL}/huong-dan/${a.slug}/`,
        navActive: 'huong-dan',
        body: huongDanPage.detailBody({ article: a, articles: HUONG_DAN_ARTICLES, embedHtml }),        noscriptLinks,
        extraHead: jsonLdScript(articleSchema),
      }),
      `${BASE_URL}/huong-dan/${a.slug}/`
    );
  }
  console.log(`   - Bài viết: ${HUONG_DAN_ARTICLES.length} bài (${guideByArticle.size} bài có nhúng công cụ), ${HUONG_DAN_ARTICLES.length + 1} trang`);
  // Tab Tài liệu học trong Sinh viên (gộp từ trang /hoc-mien-phi/ cũ,
  // đợt menu MẪU 3/4, 19/11): dữ liệu từ
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
      if (r.live && (typeof r.live !== 'string' || !r.live.startsWith('https://'))) {
        fail(`hoc-mien-phi-data.js: repo "${r.repo}" có trường "live" không phải URL https.`);
      }
    }
  }
  // Không còn trang riêng /hoc-mien-phi/ — nội dung hiện trong tab
  // Tài liệu học ở /sinh-vien/; địa chỉ cũ chuyển hướng 301 (xem
  // file _redirects ghi ở cuối main()).
  console.log(`   - Tài liệu học (trong Sinh viên): ${hocMienPhiCount} repo`);

  // Trang Giới thiệu: người làm, mục đích của web, mục Nguồn mở
  // (MẪU 3/4, 19/11). CHƯA có mục liên hệ — Tuấn chưa chọn ghi email
  // hay Zalo (TODO trong src/pages/gioi-thieu.js). Link từ footer.
  addPage(
    'gioi-thieu/index.html',
    shell({
      title: `Giới thiệu | ${SITE_NAME}`,
      desc: 'Tiện Ích Hub do Ngô Minh Tuấn làm — công cụ tính toán miễn phí chạy ngay trên trình duyệt, không cần đăng ký, không thu thập dữ liệu. Xem các thư viện nguồn mở web đang dùng.',
      keywords: 'giới thiệu, tiện ích hub, ngô minh tuấn, công cụ miễn phí, nguồn mở',
      canonical: `${BASE_URL}/gioi-thieu/`,
      navActive: '',
      body: gioiThieuPage.body(),
      noscriptLinks,
    }),
    `${BASE_URL}/gioi-thieu/`
  );
  console.log('   - Giới thiệu: 1 trang');

  // Trang mục Giáo viên: 1 trang duy nhất, liệt kê 10 công cụ hạng mục
  // giao-vien (danh sách trong src/pages/giao-vien.js).
  addPage(
    'giao-vien/index.html',
    shell({
      title: `Giáo viên — Gọi tên, chia nhóm, bốc thăm, bảng điểm | ${SITE_NAME}`,
      desc: 'Công cụ miễn phí cho giáo viên: gọi tên ngẫu nhiên, chia nhóm ngẫu nhiên, tung xúc xắc & đồng xu, bốc thăm số, bảng điểm lớp, đếm ngược, đo độ ồn, điểm danh, bốc câu hỏi — chạy ngay trên trình duyệt, không cần đăng ký.',
      keywords: 'công cụ giáo viên, gọi tên ngẫu nhiên, chia nhóm ngẫu nhiên, bảng điểm lớp, bốc thăm số, tung xúc xắc, đếm ngược lớp học, điểm danh',
      canonical: `${BASE_URL}/giao-vien/`,
      navActive: 'giao-vien',
      body: giaoVienPage.body(),
      noscriptLinks,
    }),
    `${BASE_URL}/giao-vien/`
  );
  console.log('   - Giáo viên: 10 công cụ, 1 trang');

  // Trang Bàn giáo viên: 1 trang ứng dụng gom cả 10 công cụ Giáo viên
  // + quản lý lớp học (KHÔNG phải công cụ mới — không tính vào số
  // công cụ). Nút Chat AI nổi được ẩn trên trang này (máy chiếu).
  addPage(
    'giao-vien/lop-hoc/index.html',
    shell({
      title: `Bàn giáo viên — Một trang dùng cả tiết: gọi tên, chia nhóm, bảng điểm | ${SITE_NAME}`,
      desc: 'Bàn giáo viên: gom 10 công cụ cho giờ học (gọi tên, chia nhóm, xúc xắc, bốc thăm, bảng điểm, âm thanh, đếm ngược, đo ồn, điểm danh, bốc câu hỏi) vào một trang dùng cả tiết trên máy chiếu, kèm danh sách lớp đầy đủ và sao lưu dữ liệu — miễn phí, không cần đăng ký.',
      keywords: 'bàn giáo viên, công cụ giáo viên, gọi tên ngẫu nhiên, chia nhóm, bảng điểm lớp, quản lý lớp học, dạy học',
      canonical: `${BASE_URL}/giao-vien/lop-hoc/`,
      navActive: 'giao-vien',
      body: giaoVienLopHocPage.body(ctx),
      noscriptLinks,
      hideChat: true,
      // MẪU 1 (19/11): trang ứng dụng toàn màn hình — không có
      // header/footer/thanh đáy của site, trang tự có thanh trên riêng.
      hideChrome: true,
      // PWA (19/11): chỉ trang này cài được như ứng dụng — manifest
      // + theme-color theo token Bàn giáo viên (#1747E6).
      themeColor: '#1747E6',
      extraHead: '<link rel="manifest" href="manifest.webmanifest">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="default">\n  <meta name="apple-mobile-web-app-title" content="Bàn giáo viên">',
    }),
    `${BASE_URL}/giao-vien/lop-hoc/`
  );
  console.log('   - Bàn giáo viên: 1 trang');

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
  // Font Be Vietnam Pro tự host (MẪU 1, 19/11/2026): woff2 tĩnh theo
  // trọng lượng 400/500/600/700/800, subset latin + vietnamese — phông
  // của bộ token chung, chỉ Bàn giáo viên dùng (xem @font-face trong
  // style.css). Trình duyệt chỉ tải file thực sự dùng trên trang.
  for (const w of [400, 500, 600, 700, 800]) {
    copyFile(`fonts/BeVietnamPro-${w}-latin.woff2`, `assets/fonts/BeVietnamPro-${w}-latin.woff2`);
    copyFile(`fonts/BeVietnamPro-${w}-vietnamese.woff2`, `assets/fonts/BeVietnamPro-${w}-vietnamese.woff2`);
  }
  copyFile('app.js', 'assets/app.js');
  // Logo + favicon (18/11): file thật để Google đọc được (data URI thì
  // kết quả tìm kiếm chỉ hiện quả cầu mặc định). favicon.ico ở gốc để
  // trình duyệt tự tìm; SVG/PNG để tham chiếu tường minh.
  copyFile('logo/favicon.svg', 'favicon.svg');
  copyFile('logo/favicon.ico', 'favicon.ico');
  copyFile('logo/apple-touch-icon.png', 'apple-touch-icon.png');
  copyFile('logo/favicon-48.png', 'assets/favicon-48.png');
  copyFile('logo/favicon-192.png', 'assets/favicon-192.png');
  // Icon 512 cho PWA Bàn giáo viên (vẽ từ đúng hình học logo SVG):
  // bản thường + bản maskable (nền xanh đầy khung, logo trong vùng
  // an toàn 80%) cho màn hình chính Android.
  copyFile('logo/favicon-512.png', 'assets/favicon-512.png');
  copyFile('logo/favicon-512-maskable.png', 'assets/favicon-512-maskable.png');
  copyFile('logo/og-image.png', 'assets/og-image.png');
  copyFile('logo/ban-giao-vien-v2.png', 'assets/ban-giao-vien-v2.png');
  copyFile('tool-state.js', 'assets/tool-state.js');
  // Rail video trang chủ đã gỡ đợt MẪU 3 (19/11) — không chép nữa;
  // file gốc vẫn giữ trong src/rail/ (không xóa, để sau này dùng lại).
  copyFile('vendor/qrcode-generator.js', 'assets/vendor/qrcode-generator.js');
  copyFile('vendor/pdf.min.js', 'assets/vendor/pdf.min.js');
  // File worker của pdf.js: pdf.js tự nạp lúc chạy (Web Worker) khi trích
  // văn bản — KHÔNG nạp qua thẻ <script>, chỉ cần copy ra dist. Thiếu file
  // này pdf.js báo lỗi "Setting up fake worker failed" (đã kiểm chứng thật).
  copyFile('vendor/pdf.worker.min.js', 'assets/vendor/pdf.worker.min.js');
  copyFile('vendor/pdf-lib.min.js', 'assets/vendor/pdf-lib.min.js');
  copyFile('vendor/xlsx.full.min.js', 'assets/vendor/xlsx.full.min.js');
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

  // PWA Bàn giáo viên (19/11): manifest + service worker, CHỈ cho
  // trang /giao-vien/lop-hoc/ (phạm vi SW = thư mục chứa file).
  copyFile('gv-manifest.webmanifest', 'giao-vien/lop-hoc/manifest.webmanifest');
  // SW sinh SAU versionAssets để danh sách cache trước dùng đúng URL
  // ?v=<hash> của style.css/app.js. Tên cache gồm hash của CSS + JS +
  // HTML trang: đổi bất cứ thứ nào thì cache cũ bị xóa ở lần kích hoạt
  // sau (xem activate trong src/sw-gv.js).
  const gvCssHash = contentHash('assets/style.css');
  const gvJsHash = contentHash('assets/app.js');
  const gvPageHash = contentHash('giao-vien/lop-hoc/index.html');
  const gvPrecache = [
    '/giao-vien/lop-hoc/',
    '/giao-vien/lop-hoc/manifest.webmanifest',
    `/assets/style.css?v=${gvCssHash}`,
    `/assets/app.js?v=${gvJsHash}`,
    '/favicon.svg',
    '/assets/favicon-192.png',
    '/assets/favicon-512.png',
    '/assets/favicon-512-maskable.png',
  ];
  for (const w of [400, 500, 600, 700, 800]) {
    gvPrecache.push(`/assets/fonts/BeVietnamPro-${w}-latin.woff2`);
    gvPrecache.push(`/assets/fonts/BeVietnamPro-${w}-vietnamese.woff2`);
  }
  const swTemplate = fs.readFileSync(path.join(SRC, 'sw-gv.js'), 'utf8');
  if (!swTemplate.includes('__CACHE_NAME__') || !swTemplate.includes('__PRECACHE_URLS__')) {
    fail('Mẫu service worker src/sw-gv.js thiếu chỗ giữ __CACHE_NAME__/__PRECACHE_URLS__.');
  }
  writeFile('giao-vien/lop-hoc/sw.js', swTemplate
    .replaceAll('__CACHE_NAME__', `gv-app-${gvCssHash}-${gvJsHash}-${gvPageHash}`)
    .replaceAll('__PRECACHE_URLS__', JSON.stringify(gvPrecache)));
  // Cloudflare Pages mặc định cache .js 4 giờ — SW mà bị cache lâu thì
  // bản mới lên chậm. File _headers ở gốc dist ép trình duyệt kiểm tra
  // lại SW mỗi lần mở trang (chỉ riêng file này, không đụng asset khác).
  writeFile('_headers', '/giao-vien/lop-hoc/sw.js\n  Cache-Control: no-cache\n');
  // Chuyển hướng 301: /hoc-mien-phi/ gộp vào tab Tài liệu học trong
  // Sinh viên (đợt menu MẪU 3/4, 19/11). Cloudflare Pages đọc file
  // _redirects ở gốc dist; fragment #tai-lieu-hoc giữ nguyên trong
  // Location để trình duyệt mở đúng tab (setupTabs mở tab theo hash).
  writeFile('_redirects', '/hoc-mien-phi/ /sinh-vien/#tai-lieu-hoc 301\n');
  console.log(`   - PWA Bàn giáo viên: manifest + SW (${gvPrecache.length} URL cache trước)`);

  console.log(`✅ Build xong trong ${Date.now() - started}ms:`);
  console.log(`   - ${tools.length} công cụ, ${urls.length} trang, sitemap ${urls.length} URL`);
  console.log(`   - dist/: index, cong-cu/, ung-ho/, dieu-khoan/, chinh-sach-bao-mat/, lien-he/, assets/, data/`);
  console.log(`   - search-index: ${searchIndex.count} công cụ, ${Object.keys(searchIndex.synonyms).length} từ đồng nghĩa`);
}

main().catch((e) => fail(e && e.message ? `${e.message}\n${e.stack || ''}` : String(e)));
