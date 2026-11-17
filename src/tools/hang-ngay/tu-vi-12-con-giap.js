// Tử vi hằng ngày 12 con giáp — điểm ỔN ĐỊNH TRONG NGÀY: hàm băm xác định từ
// (ngày + con giáp) làm seed cho bộ sinh số giả ngẫu nhiên. Cùng ngày + cùng tuổi
// luôn ra cùng kết quả. Chỉ mang tính giải trí.
export const meta = {
  id: 'tu-vi-12-con-giap',
  name: 'Tử vi hằng ngày 12 con giáp',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Xem tử vi hằng ngày theo 12 con giáp: điểm tài lộc, công việc, tình cảm, sức khỏe, màu và số may mắn, kèm bảng xếp hạng 12 tuổi trong ngày.',
  keywords: 'tử vi, 12 con giáp, tử vi hằng ngày, tuổi Tý, tuổi Sửu, tài lộc, số may mắn',
  icon: '🐉',
  seoTitle: 'Tử vi hằng ngày 12 con giáp | Tiện Ích Hub',
  seoDesc: 'Xem tử vi hôm nay theo 12 con giáp: tài lộc, công việc, tình cảm, sức khỏe, màu may mắn và số may mắn, kèm bảng xếp hạng 12 tuổi trong ngày.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>🐉 Tử vi hằng ngày 12 con giáp</h2><p class="muted">Chọn con giáp của bạn để xem vận trình hôm nay. Kết quả cố định trong ngày — mở lại lúc nào cũng như nhau.</p></div>
    <div class="field"><label for="tv-zodiac">Con giáp của bạn</label><select id="tv-zodiac">
      <option value="0">Tý — Chuột</option>
      <option value="1">Sửu — Trâu</option>
      <option value="2">Dần — Hổ</option>
      <option value="3">Mão — Mèo</option>
      <option value="4">Thìn — Rồng</option>
      <option value="5">Tỵ — Rắn</option>
      <option value="6">Ngọ — Ngựa</option>
      <option value="7">Mùi — Dê</option>
      <option value="8">Thân — Khỉ</option>
      <option value="9">Dậu — Gà</option>
      <option value="10">Tuất — Chó</option>
      <option value="11">Hợi — Heo</option>
    </select></div>
    <button id="tv-go" class="btn btn-primary" type="button">Xem tử vi hôm nay</button>
    <div id="tv-out" class="result"></div>
    <h3>Bảng xếp hạng 12 tuổi hôm nay</h3>
    <div id="tv-rank"></div>
    <p class="note">Nội dung chỉ mang tính giải trí, không có cơ sở khoa học. Đừng dựa vào đây để quyết định tiền bạc hay sức khỏe.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const NAMES = ['Tý — Chuột', 'Sửu — Trâu', 'Dần — Hổ', 'Mão — Mèo', 'Thìn — Rồng', 'Tỵ — Rắn', 'Ngọ — Ngựa', 'Mùi — Dê', 'Thân — Khỉ', 'Dậu — Gà', 'Tuất — Chó', 'Hợi — Heo'];
  const COLORS = ['đỏ', 'vàng', 'xanh lá', 'xanh dương', 'tím', 'cam', 'hồng', 'trắng', 'nâu', 'xám bạc', 'xanh ngọc', 'vàng gold'];
  const ADVICE_HIGH = [
    'Ngày thuận lợi — cứ mạnh dạn làm việc quan trọng, nhớ giữ nhịp nghỉ ngơi.',
    'Vận khí đang lên. Nói ít, làm nhiều, cuối ngày sẽ thấy kết quả.',
    'Hôm nay hợp gặp gỡ, thương lượng. Một lời khen đúng lúc mở ra nhiều cửa.',
  ];
  const ADVICE_MID = [
    'Ngày bình thường nhưng ổn. Làm chắc từng việc nhỏ, đừng vội vàng.',
    'Có vài việc lặt vặt làm phiền — xử lý từng cái một, đừng để dồn.',
    'Giữ tâm thế thoải mái, chuyện khó rồi cũng có hướng gỡ.',
  ];
  const ADVICE_LOW = [
    'Ngày hơi chùng — nên chậm lại, tránh quyết định lớn, ưu tiên nghỉ ngơi.',
    'Đừng ép mình hôm nay. Làm việc nhẹ, uống đủ nước, ngủ sớm.',
    'Nếu gặp chuyện bực mình, hít thở sâu rồi hãy trả lời — mai sẽ khác.',
  ];

  // Băm chuỗi xác định (FNV-1a) -> seed số nguyên 32-bit.
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // Bộ sinh số giả ngẫu nhiên mulberry32 từ seed.
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function todayKey() {
    const n = new Date();
    return n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate();
  }
  function fortune(zodiacIdx) {
    const r = rng(hashStr(todayKey() + '|' + zodiacIdx));
    // Điểm 1–5 sao, phân phối nghiêng về 3–4 sao cho tự nhiên.
    const star = () => Math.max(1, Math.min(5, Math.round(3 + (r() + r() + r() - 1.5) * 1.6)));
    const wealth = star(), work = star(), love = star(), health = star();
    const total = wealth + work + love + health;
    const color = COLORS[Math.floor(r() * COLORS.length)];
    const lucky = 1 + Math.floor(r() * 99);
    const pool = total >= 16 ? ADVICE_HIGH : total >= 12 ? ADVICE_MID : ADVICE_LOW;
    const advice = pool[Math.floor(r() * pool.length)];
    return { wealth, work, love, health, total, color, lucky, advice };
  }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  function show() {
    const idx = parseInt($('tv-zodiac').value, 10);
    const f = fortune(idx);
    const n = new Date();
    const dateStr = n.getDate() + '/' + (n.getMonth() + 1) + '/' + n.getFullYear();
    $('tv-out').innerHTML = '<div class="result-row"><span>Tuổi ' + NAMES[idx] + ' — ngày ' + dateStr + '</span><strong>Tổng ' + f.total + '/20</strong></div>'
      + '<div class="result-row"><span>💰 Tài lộc</span><strong>' + stars(f.wealth) + ' (' + f.wealth + '/5)</strong></div>'
      + '<div class="result-row"><span>💼 Công việc</span><strong>' + stars(f.work) + ' (' + f.work + '/5)</strong></div>'
      + '<div class="result-row"><span>💗 Tình cảm</span><strong>' + stars(f.love) + ' (' + f.love + '/5)</strong></div>'
      + '<div class="result-row"><span>💪 Sức khỏe</span><strong>' + stars(f.health) + ' (' + f.health + '/5)</strong></div>'
      + '<div class="result-row"><span>🎨 Màu may mắn</span><strong>' + f.color + '</strong></div>'
      + '<div class="result-row"><span>🔢 Số may mắn</span><strong>' + f.lucky + '</strong></div>'
      + '<p>' + f.advice + '</p>';
    renderRank(idx);
  }

  function renderRank(highlightIdx) {
    const rows = [];
    for (let i = 0; i < 12; i++) rows.push({ idx: i, total: fortune(i).total });
    rows.sort((a, b) => b.total - a.total);
    let h = '<table class="tbl"><tr><th>Hạng</th><th>Tuổi</th><th>Tổng điểm</th></tr>';
    rows.forEach((row, rank) => {
      const medal = rank === 0 ? ' 🥇' : rank === 1 ? ' 🥈' : rank === 2 ? ' 🥉' : '';
      const name = NAMES[row.idx] + medal;
      h += '<tr><td>' + (rank + 1) + '</td><td>' + (row.idx === highlightIdx ? '<strong>' + name + '</strong>' : name) + '</td><td>' + row.total + '/20</td></tr>';
    });
    h += '</table>';
    $('tv-rank').innerHTML = h;
  }

  $('tv-go').addEventListener('click', show);
  $('tv-zodiac').addEventListener('change', show);
  renderRank(-1);
}
