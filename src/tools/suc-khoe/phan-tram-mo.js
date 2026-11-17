// Tính % mỡ cơ thể theo công thức Hải quân Mỹ (US Navy).
export const meta = {
  id: 'phan-tram-mo',
  name: 'Tính % mỡ cơ thể (US Navy)',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Ước tính tỷ lệ mỡ cơ thể theo công thức Hải quân Mỹ từ chiều cao, vòng cổ, vòng eo (và vòng hông với nữ), kèm phân loại thể trạng.',
  keywords: 'tính phần trăm mỡ cơ thể, body fat percentage, công thức us navy, đo mỡ cơ thể, tỷ lệ mỡ bao nhiêu là tốt',
  icon: '📏',
  seoTitle: 'Tính % mỡ cơ thể theo công thức Hải quân Mỹ (US Navy)',
  seoDesc: 'Ước tính % mỡ cơ thể miễn phí bằng công thức US Navy: chỉ cần chiều cao, vòng cổ, vòng eo (và vòng hông với nữ).',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Ước tính % mỡ cơ thể bằng công thức Hải quân Mỹ — chỉ cần thước dây đo vài vòng cơ thể, không cần cân đo chuyên dụng.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="mo-sex">Giới tính</label>
      <select id="mo-sex">
        <option value="nam">Nam</option>
        <option value="nu">Nữ</option>
      </select>
    </div>
    <div class="field">
      <label for="mo-h">Chiều cao (cm)</label>
      <input id="mo-h" type="number" min="50" max="250" step="0.1" value="175" placeholder="VD: 175">
    </div>
    <div class="field">
      <label for="mo-neck">Vòng cổ (cm)</label>
      <input id="mo-neck" type="number" min="10" max="100" step="0.1" value="38" placeholder="VD: 38">
    </div>
    <div class="field">
      <label for="mo-waist">Vòng eo (cm)</label>
      <input id="mo-waist" type="number" min="30" max="250" step="0.1" value="85" placeholder="VD: 85">
    </div>
    <div class="field" id="mo-hip-wrap" hidden>
      <label for="mo-hip">Vòng hông (cm)</label>
      <input id="mo-hip" type="number" min="30" max="250" step="0.1" value="95" placeholder="VD: 95">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="mo-calc">Tính % mỡ cơ thể</button>
  <div id="mo-out"></div>
  <p class="note">Cách đo: vòng cổ đo ở chỗ nhỏ nhất dưới yết hầu; vòng eo đo ngang rốn, thở ra tự nhiên; vòng hông đo ở chỗ rộng nhất. Công thức US Navy: nam 495 ÷ (1,0324 − 0,19077×log₁₀(eo−cổ) + 0,15456×log₁₀(chiều cao)) − 450; nữ 495 ÷ (1,29579 − 0,35004×log₁₀(eo+hông−cổ) + 0,22100×log₁₀(chiều cao)) − 450 (công thức nữ dùng hệ số riêng của Hải quân Mỹ). Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế hay đo lường y khoa (DEXA, InBody).</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; };
  const f1 = n => n.toFixed(1).replace('.', ',');

  function toggleHip() {
    $('mo-hip-wrap').hidden = $('mo-sex').value !== 'nu';
  }

  function classify(sex, bf) {
    if (sex === 'nam') {
      if (bf < 6) return 'Mỡ thiết yếu — rất thấp, có thể ảnh hưởng sức khỏe nếu duy trì lâu.';
      if (bf <= 13) return 'Vận động viên — tỷ lệ mỡ rất thấp, thường gặp ở người tập luyện cường độ cao.';
      if (bf <= 17) return 'Khỏe mạnh (fitness) — tỷ lệ mỡ tốt, cơ thể săn chắc.';
      if (bf <= 24) return 'Trung bình — trong khoảng bình thường của đa số người trưởng thành.';
      return 'Cao — nên giảm mỡ bằng ăn uống và vận động để tốt cho sức khỏe.';
    }
    if (bf < 14) return 'Mỡ thiết yếu — rất thấp, có thể ảnh hưởng sức khỏe nếu duy trì lâu.';
    if (bf <= 20) return 'Vận động viên — tỷ lệ mỡ rất thấp, thường gặp ở người tập luyện cường độ cao.';
    if (bf <= 24) return 'Khỏe mạnh (fitness) — tỷ lệ mỡ tốt, cơ thể săn chắc.';
    if (bf <= 31) return 'Trung bình — trong khoảng bình thường của đa số người trưởng thành.';
    return 'Cao — nên giảm mỡ bằng ăn uống và vận động để tốt cho sức khỏe.';
  }

  function calc() {
    const sex = $('mo-sex').value;
    const h = num($('mo-h').value);
    const neck = num($('mo-neck').value);
    const waist = num($('mo-waist').value);
    const hip = num($('mo-hip').value);
    const out = $('mo-out');
    if (!(h > 0) || !(neck > 0) || !(waist > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập chiều cao, vòng cổ và vòng eo lớn hơn 0.</p>';
      return;
    }
    let bf;
    if (sex === 'nam') {
      if (!(waist > neck)) { out.innerHTML = '<p class="error">Vòng eo phải lớn hơn vòng cổ. Vui lòng kiểm tra lại số đo.</p>'; return; }
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
    } else {
      if (!(hip > 0)) { out.innerHTML = '<p class="error">Vui lòng nhập vòng hông.</p>'; return; }
      if (!(waist + hip > neck)) { out.innerHTML = '<p class="error">Vòng eo + vòng hông phải lớn hơn vòng cổ. Vui lòng kiểm tra lại số đo.</p>'; return; }
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
    }
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${f1(bf)}%</div><div class="stat-label">Tỷ lệ mỡ cơ thể ước tính</div></div>
  <div class="result-row"><span>Phân loại</span><strong>${classify(sex, bf)}</strong></div>
</div>
<p class="muted">Bảng tham khảo (${sex === 'nam' ? 'nam' : 'nữ'}): ${sex === 'nam' ? 'thiết yếu &lt; 6% · vận động viên 6–13% · khỏe mạnh 14–17% · trung bình 18–24% · cao &gt; 24%' : 'thiết yếu &lt; 14% · vận động viên 14–20% · khỏe mạnh 21–24% · trung bình 25–31% · cao &gt; 31%'}.</p>`;
  }

  $('mo-sex').addEventListener('change', toggleHip);
  $('mo-calc').addEventListener('click', calc);
  ['mo-h', 'mo-neck', 'mo-waist', 'mo-hip'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
  toggleHip();
}
