// Chuyển mã tiếng Việt: Unicode ↔ TCVN3 (ABC) ↔ VNI — logic thuần.
// Một nguồn duy nhất cho cả trang công cụ (build.mjs chèn file này
// vào trang, trừ dòng export cuối, để init() gọi qua window.UH_CHUYENMA)
// và bộ kiểm scripts/test-chuyen-ma.mjs — bảng mã trên trang và trong
// test là một, theo đúng mẫu src/ma-tran-logic.js.
//
// NGUỒN BẢNG MÃ (đối chiếu 20/11/2026):
// - TCVN3 (tên chuẩn: TCVN 5712:1993, mã VN3; còn gọi bảng mã ABC):
//   bảng ánh xạ byte→Unicode trong file TCVN5712-3.TXT của Python
//   (bugs.python.org/file37056, cài đặt TCVN 5712:1993 VN3, Jean
//   Christophe André, 2014-10-26), đối chiếu thêm với bảng VSCII
//   trên Wikipedia (en.wikipedia.org/wiki/VSCII) và bảng ABC của
//   vietunicode.sourceforge.net/charset/. Ba nguồn khớp nhau.
//   ĐIỂM QUAN TRỌNG: TCVN3 KHÔNG có ký tự riêng cho chữ HOA có dấu
//   (À, Ế, Ộ...). Quy ước của font ABC: chữ hoa có dấu = chữ hoa
//   ASCII không dấu + byte thường có dấu cùng họ (À = 'A' + 0xB5,
//   Ế = 'E' + 0xD5, Ộ = 'O' + 0xE9). Chỉ có 7 chữ hoa không dấu
//   thanh có byte riêng: Ă Â Ê Ô Ơ Ư Đ (0xA1–0xA7).
//   LƯU Ý: Đ = 0xA7, KHÔNG phải 0xD0 (0xD0 = é). Các byte không
//   có trong bảng (0x80–0x9F, 0xAF, 0xB0–0xB4, 0xBA, 0xBF,
//   0xC0–0xC5, 0xCD, 0xD9–0xDB, 0xE0, 0xF0, 0xFF) giữ nguyên khi
//   giải mã. Byte 0xA0 là khoảng trắng không ngắt (NBSP).
// - VNI (quy ước gõ bằng số, kỹ sư Hồ Thành Việt, 1987):
//   a6 = â, a8 = ă, e6 = ê, o6 = ô, o7 = ơ, u7 = ư, d9 = đ;
//   dấu sắc/huyền/hỏi/ngã/nặng = 1/2/3/4/5 đặt ngay sau nguyên âm
//   hoặc sau ký tự mũ (a1 = á, a61 = ấ, e65 = ệ). Nguồn: Wikipedia
//   tiếng Việt (vi.wikipedia.org/wiki/VNI) và
//   vietunicode.sourceforge.net/inputmethod.html. Ví dụ chuẩn:
//   "Tie61ng Vie65t" = "Tiếng Việt". Số 0 (xóa dấu) trong kiểu gõ
//   VNI không áp dụng khi chuyển mã văn bản có sẵn nên giữ nguyên
//   như ký tự thường. Chú ý: đây là QUY ƯỚC GÕ VNI, khác với bảng
//   mã 8-bit VNI-Windows (font VNI-Times) — công cụ này không xử
//   lý VNI-Windows.

// Bảng chủ: mỗi mục [chữ thường Unicode, mã VNI thường, byte TCVN3
// thường (dạng \u00XX), byte TCVN3 của chữ HOA (chỉ có với 7 chữ
// mũ/đ không dấu thanh; chữ hoa có dấu thanh dùng dạng 2 byte)].
// Thứ tự: a (5 dấu), ă (mũ + 5 dấu), â (mũ + 5 dấu), e, ê, i, o,
// ô, ơ, u, ư, y, đ — tổng 67 mục.
var TABLE = [
  ['à', 'a2', '\u00B5', null], ['á', 'a1', '\u00B8', null],
  ['ả', 'a3', '\u00B6', null], ['ã', 'a4', '\u00B7', null],
  ['ạ', 'a5', '\u00B9', null],
  ['ă', 'a8', '\u00A8', '\u00A1'],
  ['ằ', 'a82', '\u00BB', null], ['ắ', 'a81', '\u00BE', null],
  ['ẳ', 'a83', '\u00BC', null], ['ẵ', 'a84', '\u00BD', null],
  ['ặ', 'a85', '\u00C6', null],
  ['â', 'a6', '\u00A9', '\u00A2'],
  ['ầ', 'a62', '\u00C7', null], ['ấ', 'a61', '\u00CA', null],
  ['ẩ', 'a63', '\u00C8', null], ['ẫ', 'a64', '\u00C9', null],
  ['ậ', 'a65', '\u00CB', null],
  ['è', 'e2', '\u00CC', null], ['é', 'e1', '\u00D0', null],
  ['ẻ', 'e3', '\u00CE', null], ['ẽ', 'e4', '\u00CF', null],
  ['ẹ', 'e5', '\u00D1', null],
  ['ê', 'e6', '\u00AA', '\u00A3'],
  ['ề', 'e62', '\u00D2', null], ['ế', 'e61', '\u00D5', null],
  ['ể', 'e63', '\u00D3', null], ['ễ', 'e64', '\u00D4', null],
  ['ệ', 'e65', '\u00D6', null],
  ['ì', 'i2', '\u00D7', null], ['í', 'i1', '\u00DD', null],
  ['ỉ', 'i3', '\u00D8', null], ['ĩ', 'i4', '\u00DC', null],
  ['ị', 'i5', '\u00DE', null],
  ['ò', 'o2', '\u00DF', null], ['ó', 'o1', '\u00E3', null],
  ['ỏ', 'o3', '\u00E1', null], ['õ', 'o4', '\u00E2', null],
  ['ọ', 'o5', '\u00E4', null],
  ['ô', 'o6', '\u00AB', '\u00A4'],
  ['ồ', 'o62', '\u00E5', null], ['ố', 'o61', '\u00E8', null],
  ['ổ', 'o63', '\u00E6', null], ['ỗ', 'o64', '\u00E7', null],
  ['ộ', 'o65', '\u00E9', null],
  ['ơ', 'o7', '\u00AC', '\u00A5'],
  ['ờ', 'o72', '\u00EA', null], ['ớ', 'o71', '\u00ED', null],
  ['ở', 'o73', '\u00EB', null], ['ỡ', 'o74', '\u00EC', null],
  ['ợ', 'o75', '\u00EE', null],
  ['ù', 'u2', '\u00EF', null], ['ú', 'u1', '\u00F3', null],
  ['ủ', 'u3', '\u00F1', null], ['ũ', 'u4', '\u00F2', null],
  ['ụ', 'u5', '\u00F4', null],
  ['ư', 'u7', '\u00AD', '\u00A6'],
  ['ừ', 'u72', '\u00F5', null], ['ứ', 'u71', '\u00F8', null],
  ['ử', 'u73', '\u00F6', null], ['ữ', 'u74', '\u00F7', null],
  ['ự', 'u75', '\u00F9', null],
  ['ỳ', 'y2', '\u00FA', null], ['ý', 'y1', '\u00FD', null],
  ['ỷ', 'y3', '\u00FB', null], ['ỹ', 'y4', '\u00FC', null],
  ['ỵ', 'y5', '\u00FE', null],
  ['đ', 'd9', '\u00AE', '\u00A7'],
];

// Nguyên âm gốc của mỗi chữ thường có dấu thanh (để ghép dạng 2 byte
// khi giải mã TCVN3: 'A' + byte(à) → 'À'). Chữ mũ không dấu thanh
// (ă â ê ô ơ ư) KHÔNG có trong này — chúng có byte hoa riêng nên
// dạng 'A' + byte(â) không phải quy ước TCVN3, giữ nguyên từng ký tự.
var BASE_OF = {};
(function buildBase() {
  var groups = [
    ['a', 'àáảãạằắẳẵặầấẩẫậ'],
    ['e', 'èéẻẽẹềếểễệ'],
    ['i', 'ìíỉĩị'],
    ['o', 'òóỏõọồốổỗộờớởỡợ'],
    ['u', 'ùúủũụừứửữự'],
    ['y', 'ỳýỷỹỵ'],
  ];
  for (var g = 0; g < groups.length; g++) {
    var chars = groups[g][1];
    for (var i = 0; i < chars.length; i++) BASE_OF[chars[i]] = groups[g][0];
  }
})();

// Bảng tra cứu suy ra từ TABLE (xây một lần).
var TCVN3_DECODE = {}; // ký tự byte (U+00A0–U+00FE) → chữ Unicode thường
var TCVN3_ENCODE = {}; // chữ Unicode → ký tự byte (thường + hoa mũ/đ)
var VNI_DECODE = {};   // mã VNI (thường + hoa) → chữ Unicode
var VNI_ENCODE = {};   // chữ Unicode (thường + hoa) → mã VNI
(function buildMaps() {
  TCVN3_DECODE['\u00A0'] = '\u00A0'; // NBSP: có trong TCVN3, giữ nguyên
  TCVN3_ENCODE['\u00A0'] = '\u00A0';
  for (var i = 0; i < TABLE.length; i++) {
    var lower = TABLE[i][0];
    var vni = TABLE[i][1];
    var byte = TABLE[i][2];
    var byteUpper = TABLE[i][3];
    var upper = lower.toUpperCase();
    TCVN3_DECODE[byte] = lower;
    TCVN3_ENCODE[lower] = byte;
    VNI_DECODE[vni] = lower;
    VNI_ENCODE[lower] = vni;
    // VNI hoa: viết hoa chữ cái đầu của mã (a61 → A61, d9 → D9).
    var vniUpper = vni.charAt(0).toUpperCase() + vni.slice(1);
    VNI_DECODE[vniUpper] = upper;
    VNI_ENCODE[upper] = vniUpper;
    if (byteUpper) {
      TCVN3_DECODE[byteUpper] = upper;
      TCVN3_ENCODE[upper] = byteUpper;
    }
  }
})();

// Các ký tự Latin-1 vừa có trong bảng TCVN3 vừa KHÔNG phải chữ tiếng
// Việt trong Unicode — dấu hiệu chắc chắn của văn bản TCVN3 khi
// đoán mã (vd µ = à, ß = ò, · = ã). Các byte TCVN3 mà dạng Unicode
// trùng với chữ Việt (như é = ộ nhưng é cũng là chữ Việt Unicode)
// không dùng làm dấu hiệu vì mơ hồ.
var TCVN3_SIGNALS =
  '\u00A1\u00A2\u00A3\u00A4\u00A5\u00A6\u00A7\u00A8\u00A9\u00AA\u00AB\u00AC\u00AE' +
  '\u00B5\u00B6\u00B7\u00B8\u00B9\u00BB\u00BC\u00BD\u00BE' +
  '\u00C6\u00C7\u00CB\u00CE\u00CF\u00D0\u00D1\u00D6\u00D7\u00D8\u00DC\u00DE\u00DF' +
  '\u00E4\u00E5\u00E6\u00E7\u00EB\u00EE\u00EF\u00F1\u00F6\u00F7\u00F8\u00FB\u00FC\u00FE';

// Văn bản mẫu điền sẵn: câu thật + đủ mọi chữ có dấu (thường và hoa),
// số và dấu câu để thấy rõ ký tự nào giữ nguyên.
var SAMPLE_TEXT =
  'Cộng hòa Xã hội Chủ nghĩa Việt Nam — Độc lập, Tự do, Hạnh phúc.\n' +
  'Hà Nội, ngày 20 tháng 11 năm 2026.\n' +
  'Chữ thường: à á ả ã ạ, ằ ắ ẳ ẵ ặ, ầ ấ ẩ ẫ ậ, è é ẻ ẽ ẹ, ề ế ể ễ ệ, ì í ỉ ĩ ị, ò ó ỏ õ ọ, ồ ố ổ ỗ ộ, ờ ớ ở ỡ ợ, ù ú ủ ũ ụ, ừ ứ ử ữ ự, ỳ ý ỷ ỹ ỵ, ă â ê ô ơ ư, đ.\n' +
  'Chữ hoa: À Á Ả Ã Ạ, Ằ Ắ Ẳ Ẵ Ặ, Ầ Ấ Ẩ Ẫ Ậ, È É Ẻ Ẽ Ẹ, Ề Ế Ể Ễ Ệ, Ì Í Ỉ Ĩ Ị, Ò Ó Ỏ Õ Ọ, Ồ Ố Ổ Ỗ Ộ, Ờ Ớ Ở Ỡ Ợ, Ù Ú Ủ Ũ Ụ, Ừ Ứ Ử Ữ Ự, Ỳ Ý Ỷ Ỹ Ỵ, Ă Â Ê Ô Ơ Ư, Đ.';

// Đưa về dạng tổ hợp sẵn (NFC): văn bản dán vào có thể dùng dấu tổ
// hợp (a + dấu sắc rời) — chuẩn hóa trước để bảng tra khớp.
function nfc(text) {
  try {
    return String(text == null ? '' : text).normalize('NFC');
  } catch (e) {
    return String(text == null ? '' : text);
  }
}

// TCVN3 → Unicode. Trả { text, changed }: changed = số đơn vị đã đổi
// (một cặp 2 byte ghép thành chữ hoa tính là 1).
function tcvn3ToUnicode(text) {
  var src = String(text == null ? '' : text);
  var out = '';
  var changed = 0;
  for (var i = 0; i < src.length; i++) {
    var ch = src[i];
    // Chữ hoa có dấu dạng 2 byte: nguyên âm hoa ASCII + byte thường
    // có dấu thanh cùng họ ('A' + µ → 'À'). Khác họ thì giữ nguyên
    // từng ký tự ('A' + è → 'Aè').
    if (i + 1 < src.length && 'AEIOUY'.indexOf(ch) !== -1) {
      var low = TCVN3_DECODE[src[i + 1]];
      if (low !== undefined && BASE_OF[low] === ch.toLowerCase()) {
        out += low.toUpperCase();
        changed++;
        i++;
        continue;
      }
    }
    var mapped = TCVN3_DECODE[ch];
    if (mapped !== undefined && mapped !== ch) {
      out += mapped;
      changed++;
    } else {
      out += ch;
    }
  }
  return { text: out, changed: changed };
}

// Unicode → TCVN3. Chữ hoa có dấu thanh → 2 ký tự (chữ hoa ASCII +
// byte thường cùng họ); chữ hoa mũ/đ → 1 byte riêng.
function unicodeToTcvn3(text) {
  var src = nfc(text);
  var out = '';
  var changed = 0;
  for (var i = 0; i < src.length; i++) {
    var ch = src[i];
    var mapped = TCVN3_ENCODE[ch];
    if (mapped !== undefined) {
      out += mapped;
      if (mapped !== ch) changed++;
      continue;
    }
    var low = ch.toLowerCase();
    if (low !== ch && BASE_OF[low] !== undefined) {
      var byte = TCVN3_ENCODE[low];
      if (byte !== undefined) {
        out += BASE_OF[low].toUpperCase() + byte;
        changed++;
        continue;
      }
    }
    out += ch;
  }
  return { text: out, changed: changed };
}

// VNI → Unicode: khớp dài nhất (mã 3 ký tự như a61 trước, rồi 2 ký
// tự như a6/a1/d9). Mã không hợp lệ (i6, e8, a9, d1) giữ nguyên.
function vniToUnicode(text) {
  var src = String(text == null ? '' : text);
  var out = '';
  var changed = 0;
  for (var i = 0; i < src.length; i++) {
    var m3 = i + 2 < src.length ? VNI_DECODE[src.slice(i, i + 3)] : undefined;
    if (m3 !== undefined) {
      out += m3;
      changed++;
      i += 2;
      continue;
    }
    var m2 = i + 1 < src.length ? VNI_DECODE[src.slice(i, i + 2)] : undefined;
    if (m2 !== undefined) {
      out += m2;
      changed++;
      i += 1;
      continue;
    }
    out += src[i];
  }
  return { text: out, changed: changed };
}

// Unicode → VNI.
function unicodeToVni(text) {
  var src = nfc(text);
  var out = '';
  var changed = 0;
  for (var i = 0; i < src.length; i++) {
    var ch = src[i];
    var mapped = VNI_ENCODE[ch];
    if (mapped !== undefined) {
      out += mapped;
      changed++;
    } else {
      out += ch;
    }
  }
  return { text: out, changed: changed };
}

// Chuyển mã bất kỳ: qua Unicode làm trung gian. changed = số ký tự
// của văn bản GỐC đã đổi (khi qua trung gian thì đếm ở chặng đầu,
// vì mỗi ký tự gốc đổi đúng một lần).
function convert(text, from, to) {
  var src = text == null ? '' : String(text);
  if (from === to) return { text: src, changed: 0 };
  var first;
  if (from === 'unicode') {
    first = { text: nfc(src), changed: 0 };
  } else if (from === 'tcvn3') {
    first = tcvn3ToUnicode(src);
  } else {
    first = vniToUnicode(src);
  }
  if (to === 'unicode') return first;
  var second = to === 'tcvn3' ? unicodeToTcvn3(first.text) : unicodeToVni(first.text);
  return {
    text: second.text,
    changed: from === 'unicode' ? second.changed : first.changed,
  };
}

// Đoán mã nguồn: 'unicode' | 'tcvn3' | 'vni' | null (không đoán được).
// Chỉ là gợi ý — văn bản ngắn hoặc không dấu có thể không đủ dấu hiệu.
function detectEncoding(text) {
  var src = String(text == null ? '' : text);
  var tcvn = 0;
  var uni = 0;
  for (var i = 0; i < src.length; i++) {
    var ch = src[i];
    var code = src.charCodeAt(i);
    if (TCVN3_SIGNALS.indexOf(ch) !== -1) {
      tcvn++;
    } else if (
      (code >= 0x1EA0 && code <= 0x1EF9) ||
      code === 0x0102 || code === 0x0103 ||
      code === 0x0110 || code === 0x0111 ||
      code === 0x0128 || code === 0x0129 ||
      code === 0x0168 || code === 0x0169 ||
      code === 0x01A0 || code === 0x01A1 ||
      code === 0x01AF || code === 0x01B0
    ) {
      uni++;
    }
  }
  var tones = src.match(/[aeiouyAEIOUY][678]?[1-5]/g);
  var hats = src.match(/[aA][68]|[eEoO]6|[oO]7|[uU]7|[dD]9/g);
  var vni = (tones ? tones.length : 0) + (hats ? hats.length : 0);
  if (vni >= 2 && vni > tcvn) return 'vni';
  if (tcvn >= 2 && tcvn >= uni) return 'tcvn3';
  if (uni >= 1) return 'unicode';
  var weak = src.match(/[ÀÁÂÃÈÉÌÍÒÓÔÕÙÚÝàáâãèéìíòóôõùúý]/g);
  if (weak && weak.length >= 3) return 'unicode';
  return null;
}

if (typeof window !== 'undefined') window.UH_CHUYENMA = { TABLE, BASE_OF, TCVN3_DECODE, TCVN3_ENCODE, VNI_DECODE, VNI_ENCODE, TCVN3_SIGNALS, SAMPLE_TEXT, tcvn3ToUnicode, unicodeToTcvn3, vniToUnicode, unicodeToVni, convert, detectEncoding };
export { TABLE, BASE_OF, TCVN3_DECODE, TCVN3_ENCODE, VNI_DECODE, VNI_ENCODE, TCVN3_SIGNALS, SAMPLE_TEXT, tcvn3ToUnicode, unicodeToTcvn3, vniToUnicode, unicodeToVni, convert, detectEncoding };
