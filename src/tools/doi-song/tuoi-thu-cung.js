// Tính tuổi thú cưng — chó/mèo: tuổi thật → tuổi tương đương người + giai đoạn đời.
export const meta = {
  id: 'tuoi-thu-cung',
  name: 'Tính tuổi thú cưng',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Chó mèo bao nhiêu tuổi theo tuổi người? Năm đầu = 15 tuổi người, năm hai thêm 9, mỗi năm sau chó +5, mèo +4.',
  keywords: 'tuổi chó, tuổi mèo, chó bao nhiêu tuổi người, tuổi thú cưng',
  icon: '🐶',
  seoTitle: 'Tính tuổi thú cưng — Chó mèo bao nhiêu tuổi người',
  seoDesc: 'Đổi tuổi chó, tuổi mèo sang tuổi tương đương người và xem giai đoạn đời: con non, trưởng thành hay tuổi già.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🐶</span><div><h2>Tính tuổi thú cưng</h2><p class="muted">Chó mèo già nhanh hơn người nhiều — năm đầu đời đã bằng 15 tuổi người.</p></div></div>
  <div class="grid-3">
    <div class="field"><label for="ttc-species">Loài</label><select id="ttc-species"><option value="dog">Chó</option><option value="cat">Mèo</option></select></div>
    <div class="field"><label for="ttc-years">Tuổi (năm)</label><input id="ttc-years" type="number" min="0" max="30" value="2"></div>
    <div class="field"><label for="ttc-months">Thêm (tháng)</label><input id="ttc-months" type="number" min="0" max="11" value="0"></div>
  </div>
  <button type="button" class="btn btn-primary" id="ttc-calc">Tính tuổi người</button>
  <div id="ttc-out"></div>
  <p class="note">Cách tính: năm đầu = 15 tuổi người, năm hai thêm 9, mỗi năm sau chó cộng 5, mèo cộng 4. Đây là quy đổi ước tính phổ biến, không phải chẩn đoán thú y.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  function humanAge(species, age) {
    // age: số năm thực (có thể lẻ). Năm 1 = 15, năm 2 = +9, sau đó chó +5/năm, mèo +4/năm.
    const perYear = species === 'dog' ? 5 : 4;
    if (age <= 0) return 0;
    if (age <= 1) return 15 * age;
    if (age <= 2) return 15 + 9 * (age - 1);
    return 24 + perYear * (age - 2);
  }

  $('ttc-calc').addEventListener('click', () => {
    const species = $('ttc-species').value;
    const years = +$('ttc-years').value || 0;
    const months = +$('ttc-months').value || 0;
    const age = years + months / 12;
    if (age <= 0) { $('ttc-out').innerHTML = '<p class="error">Vui lòng nhập tuổi lớn hơn 0.</p>'; return; }
    const human = humanAge(species, age);
    const name = species === 'dog' ? 'chó' : 'mèo';
    let stage, note;
    if (age < 1) { stage = 'Con non'; note = 'Đang lớn rất nhanh, cần tiêm phòng và dinh dưỡng đầy đủ.'; }
    else if (species === 'dog' && age <= 7) { stage = 'Trưởng thành'; note = 'Đang ở độ tuổi khỏe mạnh nhất, vận động đều mỗi ngày.'; }
    else if (species === 'cat' && age <= 10) { stage = 'Trưởng thành'; note = 'Đang ở độ tuổi khỏe mạnh nhất, vận động đều mỗi ngày.'; }
    else { stage = 'Tuổi già'; note = 'Cần khám sức khỏe định kỳ, chú ý xương khớp và răng miệng.'; }
    const humanStr = (Math.round(human * 10) / 10).toLocaleString('vi-VN');
    $('ttc-out').innerHTML = `<div class="result">
      <div class="result-row"><span>${species === 'dog' ? 'Chó' : 'Mèo'} ${years} năm ${months} tháng tuổi</span><strong>≈ ${humanStr} tuổi người</strong></div>
      <div class="result-row"><span>Giai đoạn đời</span><strong>${stage}</strong></div>
      <div class="result-row"><span>Lưu ý</span><strong>${note}</strong></div>
    </div>`;
  });
}
