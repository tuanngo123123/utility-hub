// fetch-data.mjs — Tải dữ liệu tươi cho Utility Hub (chạy bằng GitHub Action).
// Node 18+ (dùng fetch toàn cục), KHÔNG cần key, KHÔNG cài thêm gói.
// Ghi ra src/data/*.json. NGUYÊN TẮC SNAPSHOT: chỉ ghi file khi lấy thành công +
// dữ liệu hợp lệ; nguồn lỗi thì chỉ log, GIỮ NGUYÊN file cũ (không ghi đè rỗng/lỗi).
// Tham số: --only live|daily|all (mặc định all).
//   live  = crypto + gold + fx + fng (chạy mỗi 30 phút)
//   daily = news + lottery + trending (chạy 07:30 + 18:30 giờ VN)
// Nguồn (kiểm tra 17/11/2026, xem DATA-SOURCES.md):
//   - Tỷ giá: open.er-api.com/v6/latest/USD (200, miễn phí, không key)
//   - Giá vàng: vang.today/api/prices?action=current (200, JSON công khai của trang vang.today)
//   - Crypto: api.coingecko.com/v3/simple/price (miễn phí, không key)
//   - Fear & Greed: api.alternative.me/fng/ (miễn phí, không key)
//   - Xổ số: xskt.com.vn/rss-feed/mien-bac-xsmb.rss | mien-nam-xsmn.rss | mien-trung-xsmt.rss
//   - Trending GitHub: api.github.com/search/repositories (không key, giới hạn 60 req/giờ)
//   - Tin RSS: TechCrunch AI, Ars Technica, MIT Tech Review, Wired, CNBC, MarketWatch, CoinTelegraph, CoinDesk, Decrypt (CHỈ báo nước ngoài — không lấy báo Việt, Tuấn quyết 18/11)
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_DIR = join(ROOT, 'src', 'data');
const UA = { 'User-Agent': 'UtilityHub-DataBot/1.0 (+https://tienichhub.io.vn)' };
const FETCH_TIMEOUT_MS = 25000;

const results = {};
function log(section, ok, detail) {
  results[section] = { ok, detail };
  console.log(`[${ok ? 'OK ' : 'FAIL'}] ${section}: ${detail}`);
}

async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers: { ...UA, ...headers }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
async function fetchJson(url, headers = {}) {
  return JSON.parse(await fetchText(url, headers));
}
async function save(name, obj) {
  await writeFile(join(DATA_DIR, name), JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
const nowIso = () => new Date().toISOString();

// ---------- 1. Tỷ giá ----------
const FX_WANT = ['USD', 'EUR', 'JPY', 'KRW', 'CNY', 'GBP', 'AUD', 'SGD', 'THB', 'VND'];
async function fetchFx() {
  try {
    const j = await fetchJson('https://open.er-api.com/v6/latest/USD');
    if (j.result !== 'success' || !j.rates || !j.rates.VND) throw new Error('payload thiếu rates.VND');
    const rates = {};
    for (const c of FX_WANT) if (typeof j.rates[c] === 'number') rates[c] = j.rates[c];
    await save('fx.json', {
      updatedAt: nowIso(),
      source: 'open.er-api.com',
      sourceUrl: 'https://open.er-api.com/v6/latest/USD',
      base: 'USD',
      timeLastUpdateUtc: j.time_last_update_utc || null,
      rates,
    });
    log('fx', true, `1 USD = ${rates.VND} VND (${j.time_last_update_utc || 'n/a'})`);
  } catch (e) {
    // Lỗi: giữ nguyên file cũ, không ghi đè.
    log('fx', false, String(e.message || e) + ' — giữ file cũ');
  }
}

// ---------- 2. Giá vàng (vang.today) ----------
// Nhãn lấy đúng từ trang vang.today (data-code -> tên hiển thị trên trang).
const GOLD_LABELS = {
  XAUUSD: 'Vàng thế giới',
  SJL1L10: 'SJC 9999 (vàng miếng)',
  SJ9999: 'Nhẫn SJC 9999',
  BTSJC: 'Bảo Tín SJC',
  BT9999NTT: 'Bảo Tín 9999',
  DOHNL: 'DOJI Hà Nội',
  DOHCML: 'DOJI TP.HCM',
  DOJINHTV: 'DOJI nhẫn nữ trang',
  PQHNVM: 'PNJ Hà Nội',
  PQHN24NTT: 'PNJ 24K',
  VNGSJC: 'VN Gold SJC',
  VIETTINMSJC: 'ViettinBank SJC',
};
async function fetchGold() {
  try {
    const j = await fetchJson(`https://vang.today/api/prices?action=current&t=${Date.now()}`);
    if (!j || j.success !== true || !Array.isArray(j.data) || j.data.length === 0) throw new Error('payload vàng không hợp lệ');
    let world = null;
    const items = [];
    for (const d of j.data) {
      if (d.type_code === 'XAUUSD') {
        world = { priceUsdPerOz: d.buy, changeUsd: d.change_buy ?? null };
        continue;
      }
      items.push({
        code: d.type_code,
        name: GOLD_LABELS[d.type_code] || d.type_code,
        buy: d.buy,
        sell: d.sell,
        changeBuy: d.change_buy ?? null,
        changeSell: d.change_sell ?? null,
        unit: 'đồng/lượng',
      });
    }
    if (items.length === 0) throw new Error('không có mặt hàng vàng nào');
    await save('gold.json', {
      updatedAt: nowIso(),
      source: 'vang.today',
      sourceUrl: 'https://vang.today/api/prices?action=current',
      sourceTime: j.current_time ? new Date(j.current_time * 1000).toISOString() : null,
      world,
      items,
    });
    log('gold', true, `${items.length} mặt hàng + XAU/USD ${world ? world.priceUsdPerOz : 'n/a'}`);
  } catch (e) {
    // Lỗi: giữ nguyên file cũ, không ghi đè.
    log('gold', false, String(e.message || e) + ' — giữ file cũ');
  }
}

// ---------- 3. Xổ số (RSS xskt.com.vn) ----------
const LOTTERY_FEEDS = [
  { key: 'bac', name: 'Miền Bắc', url: 'https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss' },
  { key: 'trung', name: 'Miền Trung', url: 'https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss' },
  { key: 'nam', name: 'Miền Nam', url: 'https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss' },
];
const PRIZE_KEYS = { 'ĐB': 'db', '1': 'g1', '2': 'g2', '3': 'g3', '4': 'g4', '5': 'g5', '6': 'g6', '7': 'g7', '8': 'g8' };

function parseLotteryDescription(raw) {
  // Mô tả có dạng: "[Tên đài]\nĐB: ...\n1: ...\n...\n7: 658\n8: 52"
  // Lưu ý: feed đôi khi dính "7: 658" + "8: 52" thành "7: 6588: 52" — tách lại bằng regex.
  let text = decodeEntities(raw || '');
  text = text.replace(/7:\s*(\d{3})8:\s*/g, '7: $1\n8: ');
  const stations = [];
  // Tách theo khối [Tên đài]; nếu không có khối nào thì cả mô tả là 1 đài.
  const parts = text.split(/\[([^\]]+)\]/);
  const chunks = [];
  if (parts.length === 1) chunks.push({ name: null, body: parts[0] });
  else {
    for (let i = 1; i < parts.length; i += 2) chunks.push({ name: parts[i].trim(), body: parts[i + 1] || '' });
  }
  for (const c of chunks) {
    const prizes = {};
    const re = /(ĐB|[1-8]):\s*([0-9][0-9\s\-]*?)(?=\s*(?:ĐB|[1-8]):\s*|\s*$)/g;
    let m;
    while ((m = re.exec(c.body)) !== null) {
      const key = PRIZE_KEYS[m[1]];
      const nums = m[2].split('-').map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
      if (key && nums.length) prizes[key] = nums;
    }
    if (Object.keys(prizes).length) stations.push({ name: c.name, prizes });
  }
  return stations;
}

function parseLotteryDate(title, link) {
  // Ưu tiên link: .../ngay-16-11-2026 ; dự phòng title "NGÀY 16/11" + năm hiện tại.
  let m = /ngay-(\d{1,2})-(\d{1,2})-(\d{4})/.exec(link || '');
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = /NGÀY\s+(\d{1,2})\/(\d{1,2})/.exec(title || '');
  if (m) return `${new Date().getFullYear()}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

async function fetchLottery() {
  const regions = { bac: [], trung: [], nam: [] };
  const errors = [];
  const now = Date.now();
  for (const feed of LOTTERY_FEEDS) {
    try {
      const xml = await fetchText(feed.url);
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
      const days = [];
      for (const it of items) {
        const title = (/<title>([\s\S]*?)<\/title>/.exec(it)?.[1] || '').trim();
        const link = (/<link>([\s\S]*?)<\/link>/.exec(it)?.[1] || '').trim();
        const descRaw = /<description>([\s\S]*?)<\/description>/.exec(it)?.[1] || '';
        const desc = descRaw.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
        const date = parseLotteryDate(title, link);
        if (!date) continue;
        const t = Date.parse(date + 'T12:00:00+07:00');
        // Chỉ giữ kết quả trong 10 ngày gần nhất, bỏ mục cũ lạc (feed có mục 2021).
        if (Number.isNaN(t) || t > now + 86400000 || now - t > 10 * 86400000) continue;
        const stations = parseLotteryDescription(desc);
        if (!stations.length) continue;
        const weekday = /\(\s*([^)]+)\s*\)\s*$/.exec(title)?.[1] || '';
        days.push({ date, weekday, link, stations });
      }
      days.sort((a, b) => (a.date < b.date ? 1 : -1));
      regions[feed.key] = days.slice(0, 3);
      log(`lottery-${feed.key}`, true, `${regions[feed.key].length} ngày (${regions[feed.key].map((d) => d.date).join(', ') || 'trống'})`);
    } catch (e) {
      errors.push(`${feed.key}: ${e.message || e}`);
      log(`lottery-${feed.key}`, false, String(e.message || e));
    }
  }
  // Chỉ ghi khi ít nhất 1 miền có dữ liệu; cả 3 miền lỗi/trống thì giữ file cũ.
  if (!Object.values(regions).some((days) => days.length > 0)) {
    console.log('[GIỮ] lottery: cả 3 miền đều lỗi/trống — giữ file cũ.');
    return;
  }
  const out = {
    updatedAt: nowIso(),
    source: 'xskt.com.vn',
    sourceUrls: LOTTERY_FEEDS.map((f) => f.url),
    regions,
  };
  if (errors.length) out.error = errors.join(' | ');
  await save('lottery.json', out);
}

// ---------- 4. Trending GitHub ----------
// Repo bị loại khỏi bảng Xu hướng theo quyết định của Tuấn (18/11/2026):
// gylive/google-ultra khai thác gói dùng thử ẩn của Google, README của
// chính repo ghi "có thể vi phạm điều khoản Google". Thêm 19/11/2026:
// duwqijlk/muse-protocol (lách đăng ký/mã mời muse.ai) và hut-hzf/ung220z-tool
// (can thiệp modem nhà mạng) — cả hai từng tự hiện trên trang chủ qua dữ
// liệu thô, nên trang chủ đã gỡ khối trending và trang Trending chỉ hiện
// repo đã có mô tả tiếng Việt (xem src/tools/github/github-trending.js).
// Lấy dư (20) rồi lọc để bảng vẫn đủ 6 repo sau khi loại.
const TRENDING_BLOCKLIST = new Set([
  'gylive/google-ultra',
  'duwqijlk/muse-protocol',
  'hut-hzf/ung220z-tool',
]);
// Từ khóa chặn theo tên/mô tả repo — đồng bộ với bản sao trong
// src/tools/github/github-trending.js (giữ đồng bộ khi sửa một bên).
const TRENDING_BLOCK_KEYWORDS = [
  /\bcrack\b/i, /\bbypass\b/i, /\bkeygen\b/i, /\bhack\b/i, /\bhacking\b/i,
  /\bstealer\b/i, /\bphishing\b/i, /\bmalware\b/i, /\bransomware\b/i,
  /\bbotnet\b/i, /\bddos\b/i, /invite[- ]code/i, /free[- ]trial/i,
  /activation[- ]bypass/i, /license[- ]bypass/i, /carrier[- ]unlock/i,
  /modem[- ]unlock/i, /imei[- ]unlock/i, /frp[- ]bypass/i,
  /mã mời/i, /bẻ khóa/i, /phá khóa/i, /lách đăng ký/i,
  /邀请码/, /破解/, /绕过/, /激活码/, /盗版/, /注册机/,
];
function trendingBlocked(r) {
  if (TRENDING_BLOCKLIST.has(String(r.full_name).toLowerCase())) return true;
  const hay = [r.full_name, r.name, r.description].filter(Boolean).join(' ');
  return TRENDING_BLOCK_KEYWORDS.some((re) => re.test(hay));
}
async function fetchTrending() {
  try {
    const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const j = await fetchJson(
      `https://api.github.com/search/repositories?q=created:%3E${since}&sort=stars&order=desc&per_page=20`,
      { Accept: 'application/vnd.github+json' },
    );
    if (!Array.isArray(j.items)) throw new Error('payload GitHub không hợp lệ');
    const items = j.items
      .filter((r) => !trendingBlocked(r))
      .slice(0, 6)
      .map((r) => ({
        name: r.full_name,
        url: r.html_url,
        description: r.description || '',
        stars: r.stargazers_count,
        language: r.language || '',
      }));
    await save('trending.json', {
      updatedAt: nowIso(),
      source: 'api.github.com',
      sourceUrl: 'https://api.github.com/search/repositories',
      windowDays: 7,
      items,
    });
    log('trending', true, `${items.length} repo (từ ${since})`);
  } catch (e) {
    // Lỗi: giữ nguyên file cũ, không ghi đè.
    log('trending', false, String(e.message || e) + ' — giữ file cũ');
  }
}

// ---------- 5. Tin RSS (thô, để summarize-news.mjs tóm tắt) ----------
// Danh sách chặn tin Điểm báo (theo URL): tin đã bị Tuấn cấm đăng thì
// không bao giờ quay lại dù feed còn đẩy. Ghi rõ lý do + ngày.
// - roundtables-inside-the-quest-for-cognitive-immortality: Tuấn cấm
//   18/11 (tóm tắt gắn góc Việt Nam, dễ vi phạm).
const NEWS_BLOCKLIST = new Set([
  'https://www.technologyreview.com/2026/11/17/1148049/roundtables-inside-the-quest-for-cognitive-immortality/',
]);
// 9 nguồn báo nước ngoài, 36 tin tối đa. CHỈ dùng nguồn nước ngoài —
// Tuấn quyết 18/11: KHÔNG lấy tin báo Việt Nam (rủi ro pháp lý tổng
// hợp tin trong nước). Đừng thêm feed báo Việt vào đây.
// Cùng ngày Tuấn quyết thêm: KHÔNG đăng tin VỀ Việt Nam (kể cả tin
// nguồn nước ngoài nhắc tới Việt Nam) — dễ vi phạm. Lọc ở dưới.
const NEWS_FEEDS = [
  { group: 'ai', source: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', take: 8 },
  { group: 'ai', source: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', take: 4 },
  { group: 'ai', source: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', take: 3 },
  { group: 'ai', source: 'Wired', url: 'https://www.wired.com/feed/rss', take: 3 },
  { group: 'chung-khoan', source: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', take: 6 },
  { group: 'chung-khoan', source: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', take: 4 },
  { group: 'crypto', source: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', take: 3 },
  { group: 'crypto', source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', take: 3 },
  { group: 'crypto', source: 'Decrypt', url: 'https://decrypt.co/feed', take: 2 },
];
// Phân loại lại nhóm tin bằng từ khóa trong tiêu đề + mô tả (V4): nhóm theo
// NGUỒN RSS hay sai — vd CNBC đăng tin Starshield/sập hệ thống (công nghệ)
// nhưng bị gắn "chung-khoan", CoinDesk đăng tin Nvidia nhưng bị gắn "crypto".
// Ưu tiên: crypto (từ khóa rất đặc trưng) → AI/công nghệ → chứng khoán;
// không khớp từ khóa nào thì giữ nguyên nhóm theo nguồn RSS. AI đứng trước
// chứng khoán vì tin công nghệ hay nhắc "IPO"/"earnings" (vd "Amazon và
// Google sẽ sở hữu Anthropic sau IPO" là tin AI, không phải tin chứng khoán).
// Chỉ dùng 3 nhóm ai/chung-khoan/crypto (summarize-news.mjs lọc theo 3 nhóm).
// Từ khóa khớp theo từ trọn vẹn, không phân biệt hoa/thường (\b…\b) để "AI"
// không trúng "said", "eth" không trúng "Ethereum".
const GROUP_KEYWORDS = {
  crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'xrp', 'ripple', 'solana', 'sol', 'crypto', 'cryptocurrency', 'token', 'tokens', 'blockchain', 'coinbase', 'binance', 'stablecoin', 'stablecoins', 'defi', 'dogecoin', 'doge', 'cardano', 'ada', 'tether', 'usdt', 'usdc', 'nft', 'nfts', 'web3', 'altcoin', 'altcoins', 'memecoin', 'memecoins', 'satoshi', 'halving'],
  ai: ['artificial intelligence', 'machine learning', 'deep learning', 'data center', 'data centers', 'hugging face', 'chatgpt', 'openai', 'nvidia', 'anthropic', 'spacex', 'starshield', 'starlink', 'satellite', 'satellites', 'cyberattack', 'cyberattacks', 'cyber attack', 'outage', 'outages', 'apple', 'microsoft', 'google', 'amazon', 'meta', 'tesla', 'semiconductor', 'semiconductors', 'chip', 'chips', 'ai', 'llm', 'gemini', 'copilot', 'robot', 'robots', 'neural', 'quantum', 'android', 'iphone'],
  'chung-khoan': ['federal reserve', 'interest rate', 'interest rates', 'dow jones', 'vn-index', 's&p', 'nasdaq', 'chứng khoán', 'cổ phiếu', 'earnings', 'ipo', 'fed', 'stock', 'stocks', 'shares', 'dividend', 'dividends', 'treasury', 'securities', 'wall street'],
};
function keywordRegex(words) {
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b(?:' + words.map(escRe).join('|') + ')\\b', 'i');
}
const GROUP_PATTERNS = [
  { group: 'crypto', re: keywordRegex(GROUP_KEYWORDS.crypto) },
  { group: 'ai', re: keywordRegex(GROUP_KEYWORDS.ai) },
  { group: 'chung-khoan', re: keywordRegex(GROUP_KEYWORDS['chung-khoan']) },
];
function classifyNewsGroup(title, description, fallbackGroup) {
  const text = ((title || '') + ' ' + (description || '')).trim();
  if (!text) return fallbackGroup;
  for (const p of GROUP_PATTERNS) {
    if (p.re.test(text)) return p.group;
  }
  return fallbackGroup;
}
// Giải mã thực thể HTML trong RSS: số thập phân (&#8217;), số hex (&#x27;),
// tên (&apos; &rsquo; &mdash;…) và 4 thực thể cơ bản. &amp; giải mã CUỐI
// để không tạo thực thể mới từ văn bản đã giải mã.
const NAMED_ENTITIES = { apos: "'", rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', nbsp: ' ', copy: '©', reg: '®', trade: '™', laquo: '«', raquo: '»' };
function decodeEntities(s) {
  return (s || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => { const n = parseInt(h, 16); return n > 0 && n <= 0x10FFFF ? String.fromCodePoint(n) : ''; })
    .replace(/&#(\d+);/g, (_m, d) => { const n = parseInt(d, 10); return n > 0 && n <= 0x10FFFF ? String.fromCodePoint(n) : ''; })
    .replace(/&([a-zA-Z]+);/g, (m, name) => (NAMED_ENTITIES[name] !== undefined ? NAMED_ENTITIES[name] : m))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}
function stripHtml(s) {
  return decodeEntities((s || '')
    .replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}
async function fetchNewsRaw() {
  const items = [];
  const errors = [];
  for (const feed of NEWS_FEEDS) {
    try {
      const xml = await fetchText(feed.url);
      const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
      let n = 0;
      for (const b of blocks) {
        if (n >= feed.take) break;
        const title = stripHtml(/<title>([\s\S]*?)<\/title>/.exec(b)?.[1] || '');
        const link = stripHtml(/<link>([\s\S]*?)<\/link>/.exec(b)?.[1] || '');
        const pub = stripHtml(/<pubDate>([\s\S]*?)<\/pubDate>/.exec(b)?.[1] || '');
        const desc = stripHtml(/<description>([\s\S]*?)<\/description>/.exec(b)?.[1] || '').slice(0, 500);
        if (!title || !link) continue;
        // Chặn bền vững: URL trong NEWS_BLOCKLIST + tin nhắc tới Việt Nam
        // (Tuấn quyết 18/11: Điểm báo không đăng nội dung về Việt Nam).
        if (NEWS_BLOCKLIST.has(link)) continue;
        if (/viet\s?nam/i.test(title + ' ' + desc)) continue;
        // Bỏ tin mô tả quá ngắn để tóm tắt (đã xảy ra thật 19/11: tin MIT
        // Tech Review mô tả chỉ là "nhấp vào hình ảnh" nên tóm tắt rỗng
        // tuếch mà model không được bịa thêm — lọc ở đây để feed lấy tin khác).
        if (desc.replace(/\s+/g, ' ').trim().length < 40) continue;
        // Nhóm phân loại lại bằng từ khóa (V4), dự phòng là nhóm theo nguồn RSS.
        items.push({ title, link, source: feed.source, group: classifyNewsGroup(title, desc, feed.group), publishedAt: pub, description: desc });
        n++;
      }
      log(`news-${feed.source}`, true, `${n} tin`);
    } catch (e) {
      errors.push(`${feed.source}: ${e.message || e}`);
      log(`news-${feed.source}`, false, String(e.message || e));
    }
  }
  // Chỉ ghi khi có ít nhất 1 tin; tất cả feed lỗi/trống thì giữ file cũ.
  if (items.length === 0) {
    console.log('[GIỮ] news-raw: tất cả feed đều lỗi/trống — giữ file cũ.');
    return;
  }
  const out = { updatedAt: nowIso(), sources: NEWS_FEEDS.map((f) => ({ source: f.source, group: f.group, url: f.url })), items };
  if (errors.length) out.error = errors.join(' | ');
  await save('news-raw.json', out);
}

// ---------- 6. Crypto (CoinGecko, không key) ----------
const CRYPTO_WANT = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'ripple', symbol: 'XRP' },
];
async function fetchCrypto() {
  try {
    const ids = CRYPTO_WANT.map((c) => c.id).join(',');
    const j = await fetchJson(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,vnd&include_24hr_change=true`,
    );
    const coins = [];
    for (const c of CRYPTO_WANT) {
      const d = j && j[c.id];
      if (!d || typeof d.usd !== 'number' || typeof d.vnd !== 'number') {
        throw new Error(`thiếu giá ${c.symbol}`);
      }
      coins.push({
        id: c.id,
        symbol: c.symbol,
        priceUsd: d.usd,
        priceVnd: d.vnd,
        change24h: typeof d.usd_24h_change === 'number' ? d.usd_24h_change : null,
      });
    }
    await save('crypto.json', {
      updatedAt: nowIso(),
      source: 'CoinGecko',
      sourceUrl: 'https://api.coingecko.com/api/v3/simple/price',
      coins,
    });
    log('crypto', true, coins.map((c) => `${c.symbol} $${c.priceUsd}`).join(', '));
  } catch (e) {
    // Lỗi: giữ nguyên file cũ, không ghi đè.
    log('crypto', false, String(e.message || e) + ' — giữ file cũ');
  }
}

// ---------- 7. Fear & Greed (alternative.me, không key) ----------
async function fetchFng() {
  try {
    const j = await fetchJson('https://api.alternative.me/fng/?limit=1');
    const item = j && Array.isArray(j.data) && j.data[0];
    if (!item || item.value == null || !item.value_classification) throw new Error('payload FNG không hợp lệ');
    const value = Number(item.value);
    if (!isFinite(value) || value < 0 || value > 100) throw new Error('giá trị FNG ngoài 0–100');
    await save('fng.json', {
      updatedAt: nowIso(),
      source: 'alternative.me',
      sourceUrl: 'https://api.alternative.me/fng/',
      value,
      label: item.value_classification,
    });
    log('fng', true, `${value} (${item.value_classification})`);
  } catch (e) {
    // Lỗi: giữ nguyên file cũ, không ghi đè.
    log('fng', false, String(e.message || e) + ' — giữ file cũ');
  }
}

// ---------- main ----------
const ONLY_ARG = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]
  ?? (process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : undefined);
const ONLY = ONLY_ARG || 'all';
if (!['live', 'daily', 'all'].includes(ONLY)) {
  console.error(`--only không hợp lệ: "${ONLY}" (dùng live|daily|all).`);
  process.exit(2);
}
const LIVE_JOBS = [fetchFx, fetchGold, fetchCrypto, fetchFng];
const DAILY_JOBS = [fetchLottery, fetchTrending, fetchNewsRaw];
const JOBS = ONLY === 'live' ? LIVE_JOBS : ONLY === 'daily' ? DAILY_JOBS : [...LIVE_JOBS, ...DAILY_JOBS];
await mkdir(DATA_DIR, { recursive: true });
for (const job of JOBS) await job();
const failed = Object.values(results).filter((r) => !r.ok).length;
console.log(`\nXong (--only ${ONLY}): ${Object.keys(results).length - failed}/${Object.keys(results).length} nguồn OK.`);
if (failed) console.log('CẢNH BÁO: có nguồn lỗi — file cũ được giữ nguyên, trang web vẫn hiện dữ liệu lần trước kèm giờ cập nhật.');
