// Tính TDEE & calo mỗi ngày (BMR theo Mifflin-St Jeor).
export const meta = {
  id: 'tdee-calo',
  name: 'Tính TDEE & calo mỗi ngày',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính BMR theo công thức Mifflin-St Jeor và TDEE theo mức vận động, kèm gợi ý lượng calo để giảm cân, giữ cân hoặc tăng cân.',
  keywords: 'tính tdee, tính bmr, calo mỗi ngày, mifflin st jeor, calo giảm cân, tdee là gì',
  icon: '🔥',
  seoTitle: 'Tính TDEE & calo mỗi ngày — BMR theo Mifflin-St Jeor',
  seoDesc: 'Tính BMR và TDEE miễn phí: nhập cân nặng, chiều cao, tuổi, giới tính và mức vận động để biết bạn cần bao nhiêu calo mỗi ngày.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Tính lượng calo cơ thể bạn đốt mỗi ngày (TDEE) để lên kế hoạch ăn uống giảm cân, giữ cân hay tăng cân.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="tdee-w">Cân nặng (kg)</label>
      <input id="tdee-w" type="number" min="1" max="500" step="0.1" value="70" placeholder="VD: 70">
    </div>
    <div class="field">
      <label for="tdee-h">Chiều cao (cm)</label>
      <input id="tdee-h" type="number" min="50" max="250" step="0.1" value="175" placeholder="VD: 175">
    </div>
    <div class="field">
      <label for="tdee-age">Tuổi</label>
      <input id="tdee-age" type="number" min="1" max="120" step="1" value="30" placeholder="VD: 30">
    </div>
    <div class="field">
      <label for="tdee-sex">Giới tính</label>
      <select id="tdee-sex">
        <option value="nam">Nam</option>
        <option value="nu">Nữ</option>
      </select>
    </div>
    <div class="field">
      <label for="tdee-act">Mức vận động</label>
      <select id="tdee-act">
        <option value="1.2">Ít vận động — ngồi nhiều, ít tập (×1,2)</option>
        <option value="1.375">Vận động nhẹ — tập nhẹ 1–3 ngày/tuần (×1,375)</option>
        <option value="1.55" selected>Vận động vừa — tập vừa 3–5 ngày/tuần (×1,55)</option>
        <option value="1.725">Vận động nhiều — tập nặng 6–7 ngày/tuần (×1,725)</option>
        <option value="1.9">Vận động rất nhiều — tập 2 buổi/ngày, lao động nặng (×1,9)</option>
      </select>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="tdee-calc">Tính TDEE</button>
  <div id="tdee-out"></div>
  <p class="note">BMR theo Mifflin-St Jeor — nam: 10×cân nặng + 6,25×chiều cao − 5×tuổi + 5; nữ: 10×cân nặng + 6,25×chiều cao − 5×tuổi − 161. TDEE = BMR × hệ số vận động. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế — nhu cầu calo thực tế còn tùy cơ địa và cường độ tập luyện.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; };

  function calc() {
    const w = num($('tdee-w').value);
    const h = num($('tdee-h').value);
    const age = num($('tdee-age').value);
    const sex = $('tdee-sex').value;
    const act = parseFloat($('tdee-act').value);
    const out = $('tdee-out');
    if (!(w > 0) || !(h > 0) || !(age > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập cân nặng, chiều cao và tuổi lớn hơn 0.</p>';
      return;
    }
    const bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'nam' ? 5 : -161);
    const tdee = bmr * act;
    const cut = Math.max(0, Math.round(tdee - 500));
    const bulk = Math.round(tdee + 500);
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtNum(tdee)} kcal</div><div class="stat-label">TDEE — calo bạn đốt mỗi ngày</div></div>
  <div class="result-row"><span>BMR (calo trao đổi chất cơ bản)</span><strong>${fmtNum(bmr)} kcal/ngày</strong></div>
  <div class="result-row"><span>Hệ số vận động</span><strong>× ${String(act).replace('.', ',')}</strong></div>
  <div class="result-row"><span>Để giảm cân (giảm ~0,5 kg/tuần)</span><strong>${fmtNum(cut)} kcal/ngày</strong></div>
  <div class="result-row"><span>Để giữ cân</span><strong>${fmtNum(tdee)} kcal/ngày</strong></div>
  <div class="result-row"><span>Để tăng cân</span><strong>${fmtNum(bulk)} kcal/ngày</strong></div>
</div>
<p class="muted">Giảm khoảng 500 kcal/ngày so với TDEE thường giúp giảm ~0,5 kg/tuần; tăng 500 kcal/ngày giúp tăng cân từ từ. Không nên ăn dưới 1.200 kcal/ngày (nữ) hoặc 1.500 kcal/ngày (nam) nếu không có chỉ định của bác sĩ.</p>`;
  }

  $('tdee-calc').addEventListener('click', calc);
  ['tdee-w', 'tdee-h', 'tdee-age'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
}
