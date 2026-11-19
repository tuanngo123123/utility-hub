// Tính BMI & cân nặng lý tưởng.
export const meta = {
  id: 'bmi',
  name: 'Tính BMI & cân nặng lý tưởng',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính chỉ số BMI từ cân nặng và chiều cao, phân loại thiếu cân / bình thường / thừa cân / béo phì, và gợi ý khoảng cân nặng lý tưởng.',
  keywords: 'tính bmi, chỉ số bmi, cân nặng lý tưởng, bmi bao nhiêu là bình thường, tính bmi online',
  icon: '⚖️',
  seoTitle: 'Tính BMI & cân nặng lý tưởng — chỉ số khối cơ thể online',
  seoDesc: 'Tính BMI miễn phí: nhập cân nặng, chiều cao để biết chỉ số BMI, phân loại thể trạng và khoảng cân nặng lý tưởng của bạn.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập cân nặng và chiều cao để tính chỉ số khối cơ thể (BMI) và khoảng cân nặng lý tưởng.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="bmi-w">Cân nặng (kg)</label>
      <input id="bmi-w" type="number" min="1" max="500" step="0.1" value="70" placeholder="Ví dụ: 70">
    </div>
    <div class="field">
      <label for="bmi-h">Chiều cao (cm)</label>
      <input id="bmi-h" type="number" min="50" max="250" step="0.1" value="175" placeholder="Ví dụ: 175">
    </div>
    <div class="field">
      <label for="bmi-age">Tuổi</label>
      <input id="bmi-age" type="number" min="1" max="120" step="1" value="30" placeholder="Ví dụ: 30">
    </div>
    <div class="field">
      <label for="bmi-sex">Giới tính</label>
      <select id="bmi-sex">
        <option value="nam">Nam</option>
        <option value="nu">Nữ</option>
      </select>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="bmi-calc">Tính BMI</button>
  <div id="bmi-out"></div>
  <p class="note">BMI = cân nặng (kg) ÷ chiều cao (m)². Phân loại theo WHO: thiếu cân &lt; 18,5; bình thường 18,5–24,9; thừa cân 25–29,9; béo phì ≥ 30. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế. BMI chưa phản ánh tỷ lệ cơ/mỡ — người tập thể hình, vận động viên nên tham khảo thêm chỉ số khác.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; };
  const f1 = n => n.toFixed(1).replace('.', ',');

  function calc() {
    const w = num($('bmi-w').value);
    const hCm = num($('bmi-h').value);
    const age = parseInt($('bmi-age').value, 10);
    const out = $('bmi-out');
    if (!(w > 0) || !(hCm > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập cân nặng và chiều cao lớn hơn 0.</p>';
      return;
    }
    const h = hCm / 100;
    const bmi = w / (h * h);
    let cls, advice;
    if (bmi < 18.5) { cls = 'Thiếu cân'; advice = 'Bạn đang nhẹ cân so với chiều cao. Hãy ăn đủ chất và theo dõi sức khỏe định kỳ.'; }
    else if (bmi < 25) { cls = 'Bình thường'; advice = 'Cân nặng của bạn đang trong khoảng khỏe mạnh. Hãy duy trì chế độ ăn và vận động hiện tại.'; }
    else if (bmi < 30) { cls = 'Thừa cân'; advice = 'Bạn đang thừa cân nhẹ. Giảm vài kg bằng ăn uống hợp lý và vận động đều sẽ tốt cho sức khỏe.'; }
    else { cls = 'Béo phì'; advice = 'BMI của bạn ở mức béo phì. Nên tham khảo ý kiến bác sĩ hoặc chuyên gia dinh dưỡng để có kế hoạch giảm cân an toàn.'; }
    const minW = 18.5 * h * h;
    const maxW = 24.9 * h * h;
    let delta;
    if (w < minW) delta = 'Bạn cần tăng khoảng <strong>' + f1(minW - w) + ' kg</strong> để vào khoảng lý tưởng.';
    else if (w > maxW) delta = 'Bạn cần giảm khoảng <strong>' + f1(w - maxW) + ' kg</strong> để vào khoảng lý tưởng.';
    else delta = 'Cân nặng của bạn đang nằm trong khoảng lý tưởng.';
    const ageNote = (age > 0 && age < 18)
      ? '<p class="note">Lưu ý: với trẻ em và thanh thiếu niên dưới 18 tuổi, BMI được đánh giá theo biểu đồ tăng trưởng theo tuổi, không dùng ngưỡng người lớn ở trên.</p>'
      : '';
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${f1(bmi)}</div><div class="stat-label">Chỉ số BMI của bạn</div></div>
  <div class="result-row"><span>Phân loại</span><strong><span class="chip">${cls}</span></strong></div>
  <div class="result-row"><span>Cân nặng lý tưởng</span><strong>${f1(minW)} – ${f1(maxW)} kg</strong></div>
  <div class="result-row"><span>Nhận xét</span><strong>${delta}</strong></div>
</div>
<p class="muted">${advice}</p>
${ageNote}`;
  }

  $('bmi-calc').addEventListener('click', calc);
  ['bmi-w', 'bmi-h', 'bmi-age'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
}
