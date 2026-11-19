// scan-content.mjs — Bộ quét chính tả + câu chữ toàn web.
//
// Chạy trong `npm run build` SAU build.mjs: vi phạm nào thì build thất bại
// (exit 1) để không đăng chữ sai lên web. Quét 2 nơi:
//   1. src/**/*.js (trừ src/vendor/) — chuỗi nguồn.
//   2. dist/**/*.html — trang đã build (sự thật người dùng thấy, kể cả mã
//      công cụ đã chèn vào trang).
// Không quét src/data/*.json (dữ liệu do Action tạo — mô tả gốc tiếng nước
// ngoài trong trending.json/news.json không hiển thị trực tiếp) và không
// quét scripts/ (chính file này chứa danh sách từ sai).
//
// LƯU Ý về tiền tệ: quy tắc ₫ ([0-9]đ, [0-9] đồng) chỉ quét ở src/ —
// chuỗi tiền đều bắt nguồn từ src/*.js; tóm tắt Điểm báo (do AI viết,
// Action tạo) không được để làm vỡ build vì một con số.
//
// Danh sách cho phép (ALLOWLIST) bên dưới: mỗi mục có file + mẫu dòng +
// lý do. Thêm mục mới chỉ khi thật sự cố ý (từ khóa tìm kiếm, slug/URL giữ
// nguyên, danh sách lọc trong mã nguồn) — không dùng để lấp vi phạm.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Mỗi mục: [regex, gợi ý sửa]. Regex phân biệt hoa/thường trừ khi ghi /i.
const BANNED = [
  [/hàng tháng|hàng năm|hàng ngày|hàng tuần/, "dùng 'hằng tháng/hằng năm/hằng ngày/hằng tuần'"],
  [/Hàng tháng|Hàng năm|Hàng ngày|Hàng tuần/, "dùng 'Hằng tháng/Hằng năm/Hằng ngày/Hằng tuần'"],
  [/tỉ giá|tỉ lệ/, "dùng 'tỷ giá/tỷ lệ'"],
  [/Tỉ giá|Tỉ lệ/, "dùng 'Tỷ giá/Tỷ lệ'"],
  [/VD:/, "dùng 'Ví dụ:'"],
  [/Tick chọn|tick chọn/, "dùng 'Đánh dấu/đánh dấu'"],
  [/tick vào/i, "dùng 'đánh dấu'"],
  [/\bpreset\b/i, "dùng 'mốc có sẵn' (trừ tên class/id gv-timer-presets, dn-presets)"],
  [/Dev Tools tổng hợp/, "dùng 'Công cụ lập trình tổng hợp'"],
  [/Test gõ phím/, "dùng 'Kiểm tra tốc độ gõ phím'"],
  [/Test logic 10 câu/, "dùng 'Bài đố logic 10 câu'"],
  [/Quiz tính cách/, "dùng 'Trắc nghiệm tính cách'"],
  [/Checklist hành lý/, "dùng 'Danh sách hành lý cần mang'"],
  [/Checklist nhập học/, "dùng 'Danh sách việc cần làm khi nhập học'"],
  [/checklist lỗi thường gặp|checklist trước giờ thuyết trình/, "dùng 'danh sách kiểm tra/việc cần làm'"],
  [/Chat thử với AI/, "dùng 'Trò chuyện thử với AI'"],
  [/Tính sức mạnh lãi kép/, "dùng 'Xem lãi kép làm tiền lớn lên thế nào'"],
  [/số trúng hiện khổng lồ/, "dùng 'số trúng hiện thật to'"],
  [/Ghi chép tài chính/, "dùng 'Sổ thu chi nhanh'"],
  [/không giới hạn số tin/, 'bỏ câu này — viết đúng sự thật (chờ ~5 giây, lúc đông có thể phải chờ)'],
  [/Sổ hộ khẩu/, "dùng 'Giấy xác nhận thông tin cư trú (hoặc thông tin cư trú trên VNeID)'"],
  [/MOS Excel 2025/, "dùng 'MOS Excel (Microsoft 365)'"],
  [/\bsetup\b/i, "dùng 'chuẩn bị'"],
  [/part-time/i, "dùng 'bán thời gian'"],
  [/Lệ phí môn bài 2026: hộ kinh doanh được miễn/, "dùng tên mới 'Lệ phí môn bài bãi bỏ từ 2026: ai còn phải nộp?'"],
  [/chưa tính bảo hiểm tháng nhận thưởng/, 'ví dụ tháng 13 cũ (sai) — phải trừ bảo hiểm 1.575.000₫'],
  [/Điểm tôi đề nghị xem lại/, "dùng 'Đề nghị chấm lại: [toàn bài / câu …]'"],
  [/14\.050\.000/, 'số cũ sai của bài tháng 13 — đúng là 14.207.500₫'],
  // Chỉ quét ở src/ (xem đầu file): tiền viết số dùng ₫ thống nhất.
  [/[0-9]đ/, "tiền viết số dùng '₫' (vd 15.000.000₫), không dùng 'đ'"],
  [/[0-9] đồng/, "tiền viết số dùng '₫' (vd 15.000.000₫); trong câu văn viết 'nghìn đồng/triệu đồng'"],
];
const SRC_ONLY = new Set([BANNED.length - 2, BANNED.length - 1]);

// Ký tự Trung/Nhật trong nội dung hiển thị (trừ chỗ cố ý trong ALLOWLIST).
const CJK = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g;

// Danh sách cho phép: { file: chuỗi con trong đường dẫn (null = mọi file),
// line: regex khớp DÒNG chứa vi phạm, reason: lý do cố ý }.
const ALLOWLIST = [
  { file: 'search-synonyms.js', line: /'tỉ giá'|'tỉ lệ ảnh'/, reason: 'khóa tìm kiếm — người dùng vẫn gõ "tỉ", giữ song song với khóa "tỷ"' },
  { file: 'checklist-vali.js', line: /keywords:/, reason: "từ khóa tìm kiếm 'checklist', không phải chữ hiển thị" },
  { file: 'test-logic.js', line: /keywords:/, reason: 'từ khóa tìm kiếm (test logic/test iq), không phải chữ hiển thị' },
  { file: 'test-go-phim.js', line: /keywords:/, reason: 'từ khóa tìm kiếm (test gõ phím/typing test), không phải chữ hiển thị' },
  { file: 'quiz-tinh-cach.js', line: /keywords:/, reason: "từ khóa tìm kiếm (quiz tính cách/quiz vui), không phải chữ hiển thị" },
  { file: 'github-trending', line: /邀请码|破解|绕过|激活码|盗版|注册机/, reason: 'từ khóa trong danh sách LỌC repo (mã nguồn), không hiển thị' },
  { file: 'search-synonyms.js', line: /'test logic'|'quiz'/, reason: 'khóa tìm kiếm tiếng Anh, không phải chữ hiển thị' },
  { file: null, line: /Lọc Internship \/ Part-time/, reason: 'tên bộ lọc gốc trên LinkedIn — giữ nguyên để người dùng bấm đúng' },
  { file: null, line: /function setup\(\)/, reason: 'tên hàm trong mã nguồn, không phải chữ hiển thị' },
  { file: null, line: /ltn-setup/, reason: 'id phần tử trong mã nguồn, không phải chữ hiển thị' },
];

function isAllowed(relPath, line) {
  return ALLOWLIST.find((a) => (a.file == null || relPath.includes(a.file)) && a.line.test(line));
}

function walk(dir, ext) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'vendor') continue;
      out.push(...walk(p, ext));
    } else if (e.isFile() && p.endsWith(ext)) {
      out.push(p);
    }
  }
  return out;
}

const violations = [];
const allowedHits = [];
let srcFiles = 0;
let distFiles = 0;

function scanFile(absPath, isDist) {
  const rel = path.relative(ROOT, absPath);
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    BANNED.forEach(([re, hint], idx) => {
      if (isDist && SRC_ONLY.has(idx)) return;
      if (!re.test(line)) return;
      const allow = isAllowed(rel, line);
      if (allow) {
        allowedHits.push(`${rel}:${i + 1} (cho phép: ${allow.reason})`);
        return;
      }
      violations.push(`${rel}:${i + 1}: ${re} — ${hint}\n      ${line.trim().slice(0, 160)}`);
    });
    // Ký tự Trung/Nhật.
    const cjk = line.match(CJK);
    if (cjk) {
      const allow = isAllowed(rel, line);
      if (allow) {
        allowedHits.push(`${rel}:${i + 1} (cho phép: ${allow.reason})`);
        return;
      }
      violations.push(`${rel}:${i + 1}: ký tự Trung/Nhật ${[...new Set(cjk)].slice(0, 8).join(' ')} — nội dung hiển thị phải là tiếng Việt\n      ${line.trim().slice(0, 160)}`);
    }
  });
}

if (!fs.existsSync(DIST)) {
  console.error('❌ Quét nội dung: thư mục dist/ chưa có — chạy build.mjs trước.');
  process.exit(1);
}
for (const f of walk(SRC, '.js')) { scanFile(f, false); srcFiles++; }
for (const f of walk(DIST, '.html')) { scanFile(f, true); distFiles++; }

if (violations.length) {
  console.error(`\n❌ Quét nội dung: ${violations.length} vi phạm — build dừng tại đây:`);
  for (const v of violations) console.error(`   - ${v}`);
  process.exit(1);
}
console.log(`✅ Quét nội dung: 0 vi phạm (${srcFiles} file src, ${distFiles} file dist; ${allowedHits.length} chỗ trong danh sách cho phép).`);
