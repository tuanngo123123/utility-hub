// Tính tuổi & đếm ngược sinh nhật — tuổi chính xác, số ngày đã sống, sinh nhật tới, con giáp.
export const meta = {
  id: 'tuoi-sinh-nhat',
  name: 'Tính tuổi & đếm ngược sinh nhật',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập ngày sinh để biết tuổi chính xác (năm/tháng/ngày), số ngày đã sống, còn bao nhiêu ngày tới sinh nhật, và tuổi con giáp.',
  keywords: 'tính tuổi, đếm ngược sinh nhật, bao nhiêu tuổi, ngày đã sống, con giáp',
  icon: '🎂',
  seoTitle: 'Tính tuổi & đếm ngược sinh nhật — Bao nhiêu ngày tới sinh nhật',
  seoDesc: 'Tính tuổi chính xác theo năm/tháng/ngày, số ngày đã sống và đếm ngược tới sinh nhật tiếp theo. Miễn phí, tính ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🎂</span><div><h2>Tính tuổi & đếm ngược sinh nhật</h2><p class="muted">Nhập ngày sinh, biết ngay tuổi chính xác và còn bao lâu tới sinh nhật.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="tsn-birth">Ngày sinh</label><input id="tsn-birth" type="date" value="2000-01-01"></div>
    <div class="field"><label for="tsn-today">Tính tới ngày (để trống = hôm nay)</label><input id="tsn-today" type="date"></div>
  </div>
  <button type="button" class="btn btn-primary" id="tsn-calc">Tính tuổi</button>
  <div id="tsn-out"></div>
  <p class="note">Tuổi tính theo dương lịch. Con giáp tính theo năm sinh dương lịch.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => n.toLocaleString('vi-VN'));
  const $ = id => root.querySelector('#' + id);
  const CHI = ['Tý (Chuột)', 'Sửu (Trâu)', 'Dần (Hổ)', 'Mão (Mèo)', 'Thìn (Rồng)', 'Tỵ (Rắn)', 'Ngọ (Ngựa)', 'Mùi (Dê)', 'Thân (Khỉ)', 'Dậu (Gà)', 'Tuất (Chó)', 'Hợi (Heo)'];

  function parseDate(v) {
    const p = v.split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    return new Date(p[0], p[1] - 1, p[2]);
  }

  $('tsn-calc').addEventListener('click', () => {
    const birth = parseDate($('tsn-birth').value);
    const today = $('tsn-today').value ? parseDate($('tsn-today').value) : new Date();
    if (!birth || isNaN(birth.getTime())) { $('tsn-out').innerHTML = '<p class="error">Vui lòng chọn ngày sinh hợp lệ.</p>'; return; }
    if (!today || isNaN(today.getTime())) { $('tsn-out').innerHTML = '<p class="error">Ngày tính tới không hợp lệ.</p>'; return; }
    today.setHours(0, 0, 0, 0);
    if (birth > today) { $('tsn-out').innerHTML = '<p class="error">Ngày sinh nằm sau ngày tính tới. Kiểm tra lại nhé.</p>'; return; }

    // Tuổi năm/tháng/ngày.
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years -= 1; months += 12; }

    const livedDays = Math.floor((today - birth) / 86400000);
    const livedHours = livedDays * 24;

    // Sinh nhật tiếp theo.
    let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    // Sinh 29/2: năm không nhuận thì tính là 28/2.
    if (birth.getMonth() === 1 && birth.getDate() === 29 && next.getMonth() !== 1) {
      next = new Date(next.getFullYear(), 1, 28);
    }
    const toNext = Math.ceil((next - today) / 86400000);
    const chi = CHI[((birth.getFullYear() + 8) % 12 + 12) % 12];
    const nextStr = next.getDate() + '/' + (next.getMonth() + 1) + '/' + next.getFullYear();

    $('tsn-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Tuổi chính xác</span><strong>${years} tuổi ${months} tháng ${days} ngày</strong></div>
      <div class="result-row"><span>Số ngày đã sống</span><strong>${fmtNum(livedDays)} ngày (${fmtNum(livedHours)} giờ)</strong></div>
      <div class="result-row"><span>Sinh nhật tiếp theo</span><strong>${nextStr} — còn ${fmtNum(toNext)} ngày nữa${toNext === 0 ? ' (hôm nay là sinh nhật! 🎉)' : ''}</strong></div>
      <div class="result-row"><span>Tuổi con giáp</span><strong>${chi}</strong></div>
    </div>`;
  });
}
