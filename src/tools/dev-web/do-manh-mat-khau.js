// Kiểm tra độ mạnh mật khẩu — điểm mạnh, thời gian bẻ khóa ước tính, gợi ý cải thiện.
export const meta = {
  id: 'do-manh-mat-khau',
  name: 'Kiểm tra độ mạnh mật khẩu',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Nhập mật khẩu để chấm điểm mạnh yếu, ước tính thời gian bẻ khóa và nhận gợi ý cải thiện. Mật khẩu chỉ xử lý trên trình duyệt.',
  keywords: 'kiểm tra mật khẩu mạnh, độ mạnh mật khẩu, password strength, thời gian bẻ khóa mật khẩu',
  icon: '🔐',
  seoTitle: 'Kiểm tra độ mạnh mật khẩu — Mật khẩu của bạn mạnh không',
  seoDesc: 'Chấm điểm mật khẩu theo độ dài, loại ký tự và từ phổ biến, ước tính thời gian bẻ khóa. Mật khẩu chỉ xử lý trên trình duyệt, không gửi đi đâu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔐</span><div><h2>Kiểm tra độ mạnh mật khẩu</h2><p class="muted">Mật khẩu của bạn mạnh tới đâu? Nhập để chấm điểm và xem thời gian bẻ khóa ước tính.</p></div></div>
  <div class="field"><label for="dmk-pw">Mật khẩu cần kiểm tra</label><input id="dmk-pw" type="password" placeholder="Nhập mật khẩu…" autocomplete="off"></div>
  <div class="field"><label><input type="checkbox" id="dmk-show"> Hiện mật khẩu</label></div>
  <div id="dmk-out"></div>
  <p class="note">🔒 Mật khẩu chỉ được xử lý ngay trên trình duyệt của bạn, không gửi đi đâu, không lưu lại.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const COMMON = ['123456', 'password', '123456789', '12345678', '12345', 'qwerty', 'abc123', '111111', '123123', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'iloveyou', '1234567', 'sunshine', 'master', '000000', '1234', 'vietnam', 'matkhau', 'anhyeuem'];

  function humanTime(seconds) {
    if (!isFinite(seconds)) return 'rất lâu (trên hàng trăm năm)';
    if (seconds < 1) return 'chưa tới 1 giây';
    if (seconds < 60) return 'khoảng ' + Math.round(seconds) + ' giây';
    if (seconds < 3600) return 'khoảng ' + Math.round(seconds / 60) + ' phút';
    if (seconds < 86400) return 'khoảng ' + Math.round(seconds / 3600) + ' giờ';
    if (seconds < 31536000) return 'khoảng ' + Math.round(seconds / 86400) + ' ngày';
    const years = seconds / 31536000;
    if (years < 1000) return 'khoảng ' + Math.round(years).toLocaleString('vi-VN') + ' năm';
    if (years < 1e6) return 'khoảng ' + Math.round(years / 1000).toLocaleString('vi-VN') + ' nghìn năm';
    if (years < 1e9) return 'khoảng ' + Math.round(years / 1e6).toLocaleString('vi-VN') + ' triệu năm';
    return 'hàng tỉ năm';
  }

  function check() {
    const pw = $('dmk-pw').value;
    if (!pw) { $('dmk-out').innerHTML = ''; return; }
    let score = 0;
    const tips = [];
    const len = pw.length;
    // Độ dài: tối đa 40 điểm.
    score += Math.min(40, len * 4);
    if (len < 8) tips.push('Tăng độ dài lên ít nhất 12 ký tự.');
    else if (len < 12) tips.push('Dài hơn nữa sẽ mạnh hơn — nên từ 12 ký tự trở lên.');
    // Loại ký tự: mỗi loại 10 điểm.
    const hasLower = /[a-z]/.test(pw), hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw), hasSym = /[^A-Za-z0-9]/.test(pw);
    if (hasLower) score += 10; else tips.push('Thêm chữ thường (a–z).');
    if (hasUpper) score += 10; else tips.push('Thêm chữ HOA (A–Z).');
    if (hasDigit) score += 10; else tips.push('Thêm chữ số (0–9).');
    if (hasSym) score += 10; else tips.push('Thêm ký tự đặc biệt (!@#$…).');
    // Trừ điểm: từ phổ biến, lặp ký tự, dãy số.
    const lower = pw.toLowerCase();
    let isCommon = false;
    COMMON.forEach(w => { if (lower.indexOf(w) !== -1) isCommon = true; });
    if (isCommon) { score -= 30; tips.push('Tránh dùng từ/mật khẩu phổ biến như 123456, password, qwerty.'); }
    if (/(.)\1\1/.test(pw)) { score -= 10; tips.push('Tránh lặp một ký tự 3 lần trở lên (VD: aaa, 111).'); }
    if (/012|123|234|345|456|567|678|789|890|abc|bcd|qwe/.test(lower)) { score -= 10; tips.push('Tránh dãy ký tự liên tiếp (VD: 123, abc).'); }
    score = Math.max(0, Math.min(100, score));

    let label, emoji;
    if (score < 30) { label = 'Rất yếu'; emoji = '🔴'; }
    else if (score < 50) { label = 'Yếu'; emoji = '🟠'; }
    else if (score < 70) { label = 'Trung bình'; emoji = '🟡'; }
    else if (score < 90) { label = 'Mạnh'; emoji = '🟢'; }
    else { label = 'Rất mạnh'; emoji = '🟢'; }

    // Thời gian bẻ khóa ước tính: số tổ hợp / 2, tốc độ 10 tỉ lần thử/giây.
    let charset = 0;
    if (hasLower) charset += 26;
    if (hasUpper) charset += 26;
    if (hasDigit) charset += 10;
    if (hasSym) charset += 32;
    const guesses = Math.pow(charset, len) / 2;
    const seconds = guesses / 1e10;

    $('dmk-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Điểm mạnh</span><strong>${emoji} ${score}/100 — ${label}</strong></div>
      <div class="result-row"><span>Độ dài</span><strong>${len} ký tự</strong></div>
      <div class="result-row"><span>Thời gian bẻ khóa ước tính</span><strong>${isCommon ? 'Gần như ngay lập tức (nằm trong danh sách mật khẩu phổ biến)' : humanTime(seconds)}</strong></div>
      ${tips.length ? '<div class="result-row"><span>Gợi ý cải thiện</span><strong>' + tips.join('<br>') + '</strong></div>' : '<div class="result-row"><span>Gợi ý</span><strong>Mật khẩu tốt. Nhớ dùng mật khẩu khác nhau cho mỗi tài khoản quan trọng.</strong></div>'}
    </div>
    <p class="note">Thời gian bẻ khóa ước tính theo tốc độ 10 tỉ lần thử/giây — chỉ để tham khảo, mật khẩu phổ biến bị bẻ gần như ngay lập tức dù dài.</p>`;
  }

  $('dmk-pw').addEventListener('input', check);
  $('dmk-show').addEventListener('change', () => {
    $('dmk-pw').type = $('dmk-show').checked ? 'text' : 'password';
  });
}
