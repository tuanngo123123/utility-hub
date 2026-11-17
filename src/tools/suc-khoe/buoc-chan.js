// Đổi số bước chân sang km (sải chân ≈ 0,415 × chiều cao).
export const meta = {
  id: 'buoc-chan',
  name: 'Đổi bước chân sang km',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Quy đổi số bước chân thành quãng đường km theo sải chân ước tính từ chiều cao, kèm calo tiêu hao ước tính.',
  keywords: 'đổi bước chân sang km, 10000 bước bằng bao nhiêu km, tính km từ số bước, calo đi bộ',
  icon: '👟',
  seoTitle: 'Đổi bước chân sang km — 10.000 bước bằng bao nhiêu km?',
  seoDesc: 'Quy đổi số bước chân thành km theo chiều cao của bạn, kèm ước tính calo tiêu hao khi đi bộ.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập số bước và chiều cao để biết bạn đã đi được bao nhiêu km và đốt khoảng bao nhiêu calo.</p>
  </div>
  <div class="grid-3">
    <div class="field">
      <label for="bc-steps">Số bước chân</label>
      <input id="bc-steps" type="number" min="0" step="1" value="10000" placeholder="VD: 10000">
    </div>
    <div class="field">
      <label for="bc-h">Chiều cao (cm)</label>
      <input id="bc-h" type="number" min="50" max="250" step="0.1" value="170" placeholder="VD: 170">
    </div>
    <div class="field">
      <label for="bc-w">Cân nặng (kg) — để ước tính calo</label>
      <input id="bc-w" type="number" min="1" max="500" step="0.1" value="70" placeholder="VD: 70">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="bc-calc">Đổi sang km</button>
  <div id="bc-out"></div>
  <p class="note">Sải chân ước tính ≈ 0,415 × chiều cao. Calo tiêu hao ≈ 0,04 kcal mỗi bước (với người 70 kg), điều chỉnh theo cân nặng — con số này chỉ là ước tính, calo thực tế còn tùy tốc độ đi và địa hình. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; };
  const f2 = n => n.toFixed(2).replace('.', ',');

  function calc() {
    const steps = num($('bc-steps').value);
    const h = num($('bc-h').value);
    const w = num($('bc-w').value);
    const out = $('bc-out');
    if (!(steps >= 0) || !(h > 0) || !(w > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập số bước, chiều cao và cân nặng hợp lệ (lớn hơn 0).</p>';
      return;
    }
    const strideM = 0.415 * h / 100;
    const km = steps * strideM / 1000;
    const kcal = steps * 0.04 * (w / 70);
    const stepsPerKm = 1000 / strideM;
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${f2(km)} km</div><div class="stat-label">${fmtNum(steps)} bước chân ≈ ${f2(km)} km</div></div>
  <div class="result-row"><span>Sải chân ước tính</span><strong>${f2(strideM * 100)} cm/bước</strong></div>
  <div class="result-row"><span>Số bước để đi 1 km</span><strong>≈ ${fmtNum(stepsPerKm)} bước</strong></div>
  <div class="result-row"><span>Calo tiêu hao (ước tính)</span><strong>≈ ${fmtNum(kcal)} kcal</strong></div>
  <div class="result-row"><span>Thời gian đi bộ (tốc độ ~5 km/h)</span><strong>≈ ${Math.round(km / 5 * 60)} phút</strong></div>
</div>`;
  }

  $('bc-calc').addEventListener('click', calc);
  ['bc-steps', 'bc-h', 'bc-w'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
}
