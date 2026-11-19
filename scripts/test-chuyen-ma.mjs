// test-chuyen-ma.mjs — Bộ kiểm tra công cụ Chuyển mã tiếng Việt
// TCVN3/VNI ↔ Unicode (logic thuần trong src/chuyen-ma-logic.js).
//
// Chạy trong `npm run build` TRƯỚC build.mjs (cùng test-money-tools,
// test-gv-parser, test-tron-de, test-so-diem-tt22, test-nhan-xet,
// test-ma-tran, test-lop-hoc-3): kiểm nào trượt thì build thất bại
// để không đăng bảng mã sai lên web.
//
// Mọi giá trị kỳ vọng trong file này đều ghi độc lập từ nguồn chuẩn,
// KHÔNG suy ra từ bảng trong file logic (tránh kiểm vòng tròn):
// - Byte TCVN3 ghi lại từ file TCVN5712-3.TXT của Python (cài đặt
//   TCVN 5712:1993 VN3): à=B5, á=B8, ả=B6, ã=B7, ạ=B9, ă=A8, ằ=BB,
//   ắ=BE, ẳ=BC, ẵ=BD, ặ=C6, â=A9, ầ=C7, ấ=CA, ẩ=C8, ẫ=C9, ậ=CB,
//   è=CC, é=D0, ẻ=CE, ẽ=CF, ẹ=D1, ê=AA, ề=D2, ế=D5, ể=D3, ễ=D4,
//   ệ=D6, ì=D7, í=DD, ỉ=D8, ĩ=DC, ị=DE, ò=DF, ó=E3, ỏ=E1, õ=E2,
//   ọ=E4, ô=AB, ồ=E5, ố=E8, ổ=E6, ỗ=E7, ộ=E9, ơ=AC, ờ=EA, ớ=ED,
//   ở=EB, ỡ=EC, ợ=EE, ù=EF, ú=F3, ủ=F1, ũ=F2, ụ=F4, ư=AD, ừ=F5,
//   ứ=F8, ử=F6, ữ=F7, ự=F9, ỳ=FA, ý=FD, ỷ=FB, ỹ=FC, ỵ=FE, đ=AE;
//   chữ hoa mũ/đ: Ă=A1, Â=A2, Ê=A3, Ô=A4, Ơ=A5, Ư=A6, Đ=A7.
//   (Lưu ý: Đ = A7, không phải D0 — D0 là é.)
// - Câu TCVN3 thật: "Céng hßa x· héi chñ nghÜa ViÖt Nam" là câu
//   mẫu kinh điển của bảng TCVN3 (= "Cộng hòa xã hội chủ nghĩa
//   Việt Nam"); hai câu còn lại tự mã hóa tay từ bảng trên.
// - Câu VNI thật: "Tie61ng Vie65t" = "Tiếng Việt" (ví dụ chuẩn
//   trên Wikipedia tiếng Việt, bài "VNI"); các câu còn lại tự mã
//   hóa tay theo quy ước a6=â, a8=ă, d9=đ, dấu 1–5 sau nguyên âm.
import {
  TABLE, TCVN3_DECODE, TCVN3_ENCODE, VNI_DECODE, VNI_ENCODE,
  SAMPLE_TEXT, tcvn3ToUnicode, unicodeToTcvn3, vniToUnicode,
  unicodeToVni, convert, detectEncoding,
} from '../src/chuyen-ma-logic.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    failures.push(name + '\n  kỳ vọng: ' + JSON.stringify(expected) + '\n  thực tế: ' + JSON.stringify(actual));
  }
}

// --- 1. Bảng chủ đủ 67 chữ (17 a + 11 e + 5 i + 17 o + 11 u + 5 y + 1 đ)
check('bảng chủ có 67 mục', TABLE.length, 67);

// Bảng giải mã TCVN3: 67 byte thường + 7 byte hoa mũ/đ + NBSP = 75.
check('bảng giải mã TCVN3 có 75 mục', Object.keys(TCVN3_DECODE).length, 75);

// --- 2. Điểm neo TCVN3 (ghi độc lập từ bảng chuẩn, cả 2 chiều)
const TCVN3_ANCHORS = [
  ['à', '\u00B5'], ['á', '\u00B8'], ['ả', '\u00B6'], ['ã', '\u00B7'],
  ['ạ', '\u00B9'], ['ă', '\u00A8'], ['ằ', '\u00BB'], ['ắ', '\u00BE'],
  ['ẳ', '\u00BC'], ['ẵ', '\u00BD'], ['ặ', '\u00C6'], ['â', '\u00A9'],
  ['ầ', '\u00C7'], ['ấ', '\u00CA'], ['ẩ', '\u00C8'], ['ẫ', '\u00C9'],
  ['ậ', '\u00CB'], ['è', '\u00CC'], ['é', '\u00D0'], ['ẻ', '\u00CE'],
  ['ẽ', '\u00CF'], ['ẹ', '\u00D1'], ['ê', '\u00AA'], ['ề', '\u00D2'],
  ['ế', '\u00D5'], ['ể', '\u00D3'], ['ễ', '\u00D4'], ['ệ', '\u00D6'],
  ['ì', '\u00D7'], ['í', '\u00DD'], ['ỉ', '\u00D8'], ['ĩ', '\u00DC'],
  ['ị', '\u00DE'], ['ò', '\u00DF'], ['ó', '\u00E3'], ['ỏ', '\u00E1'],
  ['õ', '\u00E2'], ['ọ', '\u00E4'], ['ô', '\u00AB'], ['ồ', '\u00E5'],
  ['ố', '\u00E8'], ['ổ', '\u00E6'], ['ỗ', '\u00E7'], ['ộ', '\u00E9'],
  ['ơ', '\u00AC'], ['ờ', '\u00EA'], ['ớ', '\u00ED'], ['ở', '\u00EB'],
  ['ỡ', '\u00EC'], ['ợ', '\u00EE'], ['ù', '\u00EF'], ['ú', '\u00F3'],
  ['ủ', '\u00F1'], ['ũ', '\u00F2'], ['ụ', '\u00F4'], ['ư', '\u00AD'],
  ['ừ', '\u00F5'], ['ứ', '\u00F8'], ['ử', '\u00F6'], ['ữ', '\u00F7'],
  ['ự', '\u00F9'], ['ỳ', '\u00FA'], ['ý', '\u00FD'], ['ỷ', '\u00FB'],
  ['ỹ', '\u00FC'], ['ỵ', '\u00FE'], ['đ', '\u00AE'],
  ['Ă', '\u00A1'], ['Â', '\u00A2'], ['Ê', '\u00A3'], ['Ô', '\u00A4'],
  ['Ơ', '\u00A5'], ['Ư', '\u00A6'], ['Đ', '\u00A7'],
];
for (const [ch, byte] of TCVN3_ANCHORS) {
  check('TCVN3 mã hóa ' + ch, unicodeToTcvn3(ch).text, byte);
  check('TCVN3 giải mã ' + ch, tcvn3ToUnicode(byte).text, ch);
}

// --- 3. Chữ hoa có dấu thanh TCVN3 = dạng 2 byte (hoa ASCII + byte thường)
const TCVN3_UPPER_ANCHORS = [
  ['À', 'A\u00B5'], ['Á', 'A\u00B8'], ['Ả', 'A\u00B6'], ['Ã', 'A\u00B7'],
  ['Ạ', 'A\u00B9'], ['Ằ', 'A\u00BB'], ['Ắ', 'A\u00BE'], ['Ẳ', 'A\u00BC'],
  ['Ẵ', 'A\u00BD'], ['Ặ', 'A\u00C6'], ['Ầ', 'A\u00C7'], ['Ấ', 'A\u00CA'],
  ['Ẩ', 'A\u00C8'], ['Ẫ', 'A\u00C9'], ['Ậ', 'A\u00CB'],
  ['È', 'E\u00CC'], ['É', 'E\u00D0'], ['Ẻ', 'E\u00CE'], ['Ẽ', 'E\u00CF'],
  ['Ẹ', 'E\u00D1'], ['Ề', 'E\u00D2'], ['Ế', 'E\u00D5'], ['Ể', 'E\u00D3'],
  ['Ễ', 'E\u00D4'], ['Ệ', 'E\u00D6'],
  ['Ì', 'I\u00D7'], ['Í', 'I\u00DD'], ['Ỉ', 'I\u00D8'], ['Ĩ', 'I\u00DC'],
  ['Ị', 'I\u00DE'],
  ['Ò', 'O\u00DF'], ['Ó', 'O\u00E3'], ['Ỏ', 'O\u00E1'], ['Õ', 'O\u00E2'],
  ['Ọ', 'O\u00E4'], ['Ồ', 'O\u00E5'], ['Ố', 'O\u00E8'], ['Ổ', 'O\u00E6'],
  ['Ỗ', 'O\u00E7'], ['Ộ', 'O\u00E9'], ['Ờ', 'O\u00EA'], ['Ớ', 'O\u00ED'],
  ['Ở', 'O\u00EB'], ['Ỡ', 'O\u00EC'], ['Ợ', 'O\u00EE'],
  ['Ù', 'U\u00EF'], ['Ú', 'U\u00F3'], ['Ủ', 'U\u00F1'], ['Ũ', 'U\u00F2'],
  ['Ụ', 'U\u00F4'], ['Ừ', 'U\u00F5'], ['Ứ', 'U\u00F8'], ['Ử', 'U\u00F6'],
  ['Ữ', 'U\u00F7'], ['Ự', 'U\u00F9'],
  ['Ỳ', 'Y\u00FA'], ['Ý', 'Y\u00FD'], ['Ỷ', 'Y\u00FB'], ['Ỹ', 'Y\u00FC'],
  ['Ỵ', 'Y\u00FE'],
];
for (const [ch, two] of TCVN3_UPPER_ANCHORS) {
  check('TCVN3 mã hóa hoa ' + ch, unicodeToTcvn3(ch).text, two);
  check('TCVN3 giải mã hoa ' + ch, tcvn3ToUnicode(two).text, ch);
}
// Khác họ thì không ghép: 'A' + byte(è) giữ nguyên từng ký tự.
check('TCVN3 khác họ không ghép', tcvn3ToUnicode('A\u00CC').text, 'Aè');
// Chữ hoa + byte mũ không ghép (Â có byte riêng A2).
check('TCVN3 hoa + byte mũ không ghép', tcvn3ToUnicode('A\u00A9').text, 'Aâ');

// --- 4. Điểm neo VNI (cả 2 chiều, thường + hoa)
const VNI_ANCHORS = [
  ['à', 'a2'], ['á', 'a1'], ['ả', 'a3'], ['ã', 'a4'], ['ạ', 'a5'],
  ['ă', 'a8'], ['ằ', 'a82'], ['ắ', 'a81'], ['ẳ', 'a83'], ['ẵ', 'a84'],
  ['ặ', 'a85'], ['â', 'a6'], ['ầ', 'a62'], ['ấ', 'a61'], ['ẩ', 'a63'],
  ['ẫ', 'a64'], ['ậ', 'a65'],
  ['è', 'e2'], ['é', 'e1'], ['ẻ', 'e3'], ['ẽ', 'e4'], ['ẹ', 'e5'],
  ['ê', 'e6'], ['ề', 'e62'], ['ế', 'e61'], ['ể', 'e63'], ['ễ', 'e64'],
  ['ệ', 'e65'],
  ['ì', 'i2'], ['í', 'i1'], ['ỉ', 'i3'], ['ĩ', 'i4'], ['ị', 'i5'],
  ['ò', 'o2'], ['ó', 'o1'], ['ỏ', 'o3'], ['õ', 'o4'], ['ọ', 'o5'],
  ['ô', 'o6'], ['ồ', 'o62'], ['ố', 'o61'], ['ổ', 'o63'], ['ỗ', 'o64'],
  ['ộ', 'o65'], ['ơ', 'o7'], ['ờ', 'o72'], ['ớ', 'o71'], ['ở', 'o73'],
  ['ỡ', 'o74'], ['ợ', 'o75'],
  ['ù', 'u2'], ['ú', 'u1'], ['ủ', 'u3'], ['ũ', 'u4'], ['ụ', 'u5'],
  ['ư', 'u7'], ['ừ', 'u72'], ['ứ', 'u71'], ['ử', 'u73'], ['ữ', 'u74'],
  ['ự', 'u75'],
  ['ỳ', 'y2'], ['ý', 'y1'], ['ỷ', 'y3'], ['ỹ', 'y4'], ['ỵ', 'y5'],
  ['đ', 'd9'],
];
for (const [ch, code] of VNI_ANCHORS) {
  check('VNI mã hóa ' + ch, unicodeToVni(ch).text, code);
  check('VNI giải mã ' + ch, vniToUnicode(code).text, ch);
  const upper = ch.toUpperCase();
  const codeUpper = code.charAt(0).toUpperCase() + code.slice(1);
  check('VNI mã hóa hoa ' + upper, unicodeToVni(upper).text, codeUpper);
  check('VNI giải mã hoa ' + upper, vniToUnicode(codeUpper).text, upper);
}
// Khớp dài nhất: a61 = ấ (không phải â + số 1).
check('VNI khớp dài nhất a61', vniToUnicode('a61').text, 'ấ');
check('VNI khớp dài nhất o75', vniToUnicode('o75').text, 'ợ');
// Mã không hợp lệ giữ nguyên.
check('VNI i6 giữ nguyên', vniToUnicode('i6').text, 'i6');
check('VNI e8 giữ nguyên', vniToUnicode('e8').text, 'e8');
check('VNI a9 giữ nguyên', vniToUnicode('a9').text, 'a9');
check('VNI d1 giữ nguyên', vniToUnicode('d1').text, 'd1');
check('VNI b1 giữ nguyên', vniToUnicode('b1').text, 'b1');
check('VNI u6 giữ nguyên', vniToUnicode('u6').text, 'u6');
check('VNI o8 giữ nguyên', vniToUnicode('o8').text, 'o8');
check('VNI a7 giữ nguyên', vniToUnicode('a7').text, 'a7');

// --- 5. Câu TCVN3 thật → Unicode (từng chữ)
check(
  'TCVN3 câu kinh điển',
  tcvn3ToUnicode('C\u00E9ng h\u00DFa x\u00B7 h\u00E9i ch\u00F1 ngh\u00DCa Vi\u00D6t Nam').text,
  'Cộng hòa xã hội chủ nghĩa Việt Nam',
);
check(
  'TCVN3 Hà Nội mùa thu',
  tcvn3ToUnicode('H\u00B5 N\u00E9i m\u00EFa thu').text,
  'Hà Nội mùa thu',
);
check(
  'TCVN3 Việt Nam muôn năm',
  tcvn3ToUnicode('Vi\u00D6t Nam mu\u00ABn n\u00A8m').text,
  'Việt Nam muôn năm',
);
check(
  'TCVN3 chữ hoa 2 byte',
  tcvn3ToUnicode('O\u00EB H\u00B5 N\u00E9i').text,
  'Ở Hà Nội',
);

// --- 6. Câu VNI thật → Unicode (từng chữ)
check('VNI ví dụ Wikipedia', vniToUnicode('Tie61ng Vie65t').text, 'Tiếng Việt');
check(
  'VNI Cộng hòa xã hội chủ nghĩa Việt Nam',
  vniToUnicode('Co65ng ho2a xa4 ho65i chu3 nghi4a Vie65t Nam').text,
  'Cộng hòa xã hội chủ nghĩa Việt Nam',
);
check(
  'VNI Hà Nội mùa thu',
  vniToUnicode('Ha2 No65i mu2a thu').text,
  'Hà Nội mùa thu',
);
check('VNI chữ hoa', vniToUnicode('O73 Ha2 No65i').text, 'Ở Hà Nội');

// --- 7. Chuyển vòng đoạn mẫu dài về đúng gốc
const toTcvn3 = unicodeToTcvn3(SAMPLE_TEXT).text;
check('vòng Unicode→TCVN3→Unicode', tcvn3ToUnicode(toTcvn3).text, SAMPLE_TEXT);
const toVni = unicodeToVni(SAMPLE_TEXT).text;
check('vòng Unicode→VNI→Unicode', vniToUnicode(toVni).text, SAMPLE_TEXT);
// Qua trung gian: TCVN3 → VNI → TCVN3 về đúng bản TCVN3 ban đầu.
check(
  'vòng TCVN3→VNI→TCVN3',
  convert(convert(toTcvn3, 'tcvn3', 'vni').text, 'vni', 'tcvn3').text,
  toTcvn3,
);
check(
  'vòng VNI→TCVN3→VNI',
  convert(convert(toVni, 'vni', 'tcvn3').text, 'tcvn3', 'vni').text,
  toVni,
);
// Mã nguồn = mã đích thì giữ nguyên, đổi 0 ký tự.
check('cùng mã giữ nguyên', convert('Hà Nội', 'unicode', 'unicode').text, 'Hà Nội');
check('cùng mã đổi 0', convert('Hà Nội', 'unicode', 'unicode').changed, 0);

// --- 8. Ký tự ngoài bảng giữ nguyên
const PLAIN = 'abc XYZ 0123456789 !@#$%^&*()_+-=[]{};:\'",./<>?`~';
check('TCVN3 giữ nguyên ký tự lạ', tcvn3ToUnicode(PLAIN).text, PLAIN);
check('VNI giữ nguyên ký tự lạ', vniToUnicode(PLAIN).text, PLAIN);
check('Unicode→TCVN3 giữ nguyên ký tự lạ', unicodeToTcvn3(PLAIN).text, PLAIN);
check('Unicode→VNI giữ nguyên ký tự lạ', unicodeToVni(PLAIN).text, PLAIN);
// Byte TCVN3 không có trong bảng (FF, AF, B0, C0, CD, E0, F0) giữ nguyên.
check(
  'TCVN3 byte lạ giữ nguyên',
  tcvn3ToUnicode('\u00FF\u00AF\u00B0\u00C0\u00CD\u00E0\u00F0').text,
  '\u00FF\u00AF\u00B0\u00C0\u00CD\u00E0\u00F0',
);
// Dấu tổ hợp (a + sắc rời) vẫn chuyển đúng nhờ chuẩn hóa NFC.
check('dấu tổ hợp sang VNI', unicodeToVni('a\u0301').text, 'a1');
check('dấu tổ hợp sang TCVN3', unicodeToTcvn3('a\u0301').text, '\u00B8');

// --- 9. Đếm số ký tự đã đổi
check('đếm TCVN3→Unicode', tcvn3ToUnicode('H\u00B5 N\u00E9i').changed, 2);
check('đếm Unicode→TCVN3', unicodeToTcvn3('Hà Nội').changed, 2);
check('đếm VNI→Unicode', vniToUnicode('Ha2 No65i').changed, 2);
check('đếm Unicode→VNI', unicodeToVni('Hà Nội').changed, 2);
check('đếm chữ hoa 2 byte là 1', tcvn3ToUnicode('O\u00EB').changed, 1);
check('đếm không đổi', tcvn3ToUnicode('abc 123').changed, 0);
check('đếm qua trung gian', convert('Ha2 No65i', 'vni', 'tcvn3').changed, 2);

// --- 10. Đoán mã
check(
  'đoán TCVN3',
  detectEncoding('C\u00E9ng h\u00DFa x\u00B7 h\u00E9i ch\u00F1 ngh\u00DCa Vi\u00D6t Nam'),
  'tcvn3',
);
check('đoán VNI', detectEncoding('Co65ng ho2a xa4 ho65i chu3 nghi4a Vie65t Nam'), 'vni');
check('đoán Unicode', detectEncoding('Cộng hòa xã hội chủ nghĩa Việt Nam'), 'unicode');
check('đoán Unicode chữ ũ', detectEncoding('Mũ mới'), 'unicode');
check('đoán Unicode chữ ĩ', detectEncoding('Chĩ và nghĩa'), 'unicode');
check('đoán văn bản trơn', detectEncoding('Hello world 123'), null);
check('đoán rỗng', detectEncoding(''), null);
check('đoán banana1 không phải VNI', detectEncoding('banana1'), null);
check('đoán câu VNI ngắn', detectEncoding('Xin cha2o ca1c ba5n'), 'vni');

// --- 11. Tính đối xứng của bảng mã (mọi mục đều có 2 chiều)
for (const [ch] of TABLE) {
  check('TCVN3 có mã hóa ' + ch, TCVN3_ENCODE[ch] !== undefined, true);
  check('VNI có mã hóa ' + ch, VNI_ENCODE[ch] !== undefined, true);
}
for (const byte of Object.keys(TCVN3_DECODE)) {
  check('TCVN3 giải mã có mã hóa ngược ' + byte.charCodeAt(0).toString(16), TCVN3_ENCODE[TCVN3_DECODE[byte]] !== undefined, true);
}
for (const code of Object.keys(VNI_DECODE)) {
  check('VNI giải mã có mã hóa ngược ' + code, VNI_ENCODE[VNI_DECODE[code]] !== undefined, true);
}

console.log('test-chuyen-ma: ' + passed + ' đạt, ' + failed + ' trượt');
if (failures.length > 0) {
  console.log(failures.join('\n---\n'));
  process.exit(1);
}
