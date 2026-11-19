// Tính vùng nhịp tim theo tuổi (nhịp tim tối đa = 220 − tuổi), có Karvonen nếu có nhịp tim nghỉ.
export const meta = {
  id: 'vung-nhip-tim',
  name: 'Tính vùng nhịp tim',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính nhịp tim tối đa theo tuổi và 5 vùng nhịp tim tập luyện (Z1–Z5) kèm mô tả: đốt mỡ, sức bền, ngưỡng lactate, tốc độ tối đa.',
  keywords: 'vùng nhịp tim, heart rate zone, nhịp tim tối đa, zone 2, tập luyện theo nhịp tim, 220 trừ tuổi',
  icon: '❤️',
  seoTitle: 'Tính vùng nhịp tim Z1–Z5 — nhịp tim tối đa theo tuổi',
  seoDesc: 'Tính nhịp tim tối đa (220 − tuổi) và 5 vùng nhịp tim tập luyện Z1–Z5 kèm mô tả mục đích từng vùng. Hỗ trợ công thức Karvonen.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập tuổi để biết nhịp tim tối đa và 5 vùng nhịp tim khi tập luyện. Nhập thêm nhịp tim nghỉ (đo lúc mới ngủ dậy) để có vùng Karvonen chính xác hơn.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="hr-age">Tuổi</label>
      <input id="hr-age" type="number" min="5" max="120" step="1" value="30" placeholder="Ví dụ: 30">
    </div>
    <div class="field">
      <label for="hr-rest">Nhịp tim nghỉ (bpm) — không bắt buộc</label>
      <input id="hr-rest" type="number" min="30" max="120" step="1" placeholder="Ví dụ: 60">
      <p class="muted">Đo vào buổi sáng ngay khi thức dậy, trước khi ra khỏi giường.</p>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="hr-calc">Tính vùng nhịp tim</button>
  <div id="hr-out"></div>
  <p class="note">Nhịp tim tối đa (HRmax) = 220 − tuổi (công thức ước tính phổ biến). Vùng Karvonen = (HRmax − nhịp tim nghỉ) × % cường độ + nhịp tim nghỉ. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế — người có bệnh tim mạch nên hỏi bác sĩ trước khi tập ở cường độ cao.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  const ZONES = [
    { z: 'Z1', lo: 50, hi: 60, name: 'Khởi động / hồi phục', desc: 'Đi bộ nhẹ, khởi động, thả lỏng. Tăng tuần hoàn, giúp cơ thể hồi phục.' },
    { z: 'Z2', lo: 60, hi: 70, name: 'Đốt mỡ / sức bền nền', desc: 'Chạy chậm, đạp xe nhẹ. Cơ thể dùng mỡ làm năng lượng chính, xây nền tảng sức bền.' },
    { z: 'Z3', lo: 70, hi: 80, name: 'Sức bền tim mạch', desc: 'Chạy vừa, bơi vừa. Cải thiện khả năng vận chuyển oxy và sức bền tim phổi.' },
    { z: 'Z4', lo: 80, hi: 90, name: 'Ngưỡng lactate', desc: 'Chạy nhanh, interval. Nâng ngưỡng chịu đựng lactate, cải thiện tốc độ.' },
    { z: 'Z5', lo: 90, hi: 100, name: 'Tối đa', desc: 'Chạy nước rút, gắng sức tối đa. Chỉ giữ trong thời gian rất ngắn.' },
  ];

  function calc() {
    const age = parseInt($('hr-age').value, 10);
    const restRaw = $('hr-rest').value.trim();
    const rest = restRaw === '' ? NaN : parseInt(restRaw, 10);
    const out = $('hr-out');
    if (!(age > 0)) { out.innerHTML = '<p class="error">Vui lòng nhập tuổi lớn hơn 0.</p>'; return; }
    if (restRaw !== '' && !(rest >= 30 && rest <= 120)) { out.innerHTML = '<p class="error">Nhịp tim nghỉ thường từ 30 đến 120 bpm.</p>'; return; }
    const max = 220 - age;
    const useKarvonen = !isNaN(rest) && rest < max;
    const rows = ZONES.map(zone => {
      let lo, hi;
      if (useKarvonen) {
        lo = Math.round((max - rest) * (zone.lo / 100) + rest);
        hi = Math.round((max - rest) * (zone.hi / 100) + rest);
      } else {
        lo = Math.round(max * zone.lo / 100);
        hi = Math.round(max * zone.hi / 100);
      }
      return '<tr><td><strong>' + zone.z + '</strong> (' + zone.lo + '–' + zone.hi + '%)</td><td>' + lo + '–' + hi + ' bpm</td><td><strong>' + zone.name + '</strong><br><span class="muted">' + zone.desc + '</span></td></tr>';
    }).join('');
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${max} bpm</div><div class="stat-label">Nhịp tim tối đa ước tính (220 − ${age})</div></div>
  <div class="result-row"><span>Cách tính vùng</span><strong>${useKarvonen ? 'Karvonen (có nhịp tim nghỉ ' + rest + ' bpm)' : '% nhịp tim tối đa'}</strong></div>
</div>
<table class="tbl">
  <thead><tr><th>Vùng</th><th>Nhịp tim</th><th>Mục đích</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
  }

  $('hr-calc').addEventListener('click', calc);
  ['hr-age', 'hr-rest'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
}
