// Tính lượng nước cần uống mỗi ngày (cơ bản 35 ml/kg cân nặng).
export const meta = {
  id: 'nuoc-uong',
  name: 'Tính lượng nước cần uống',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính lượng nước nên uống mỗi ngày theo cân nặng, mức vận động và thời tiết — quy đổi ra số ly nước 250 ml.',
  keywords: 'uống bao nhiêu nước mỗi ngày, tính lượng nước cần uống, 1 ngày uống bao nhiêu lít nước',
  icon: '💧',
  seoTitle: 'Tính lượng nước cần uống mỗi ngày — theo cân nặng & vận động',
  seoDesc: 'Tính lượng nước nên uống mỗi ngày theo cân nặng, mức vận động và thời tiết. Quy đổi ra số ly 250 ml dễ theo dõi.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Tính lượng nước nên uống mỗi ngày theo cân nặng của bạn, có điều chỉnh theo vận động và thời tiết.</p>
  </div>
  <div class="grid-3">
    <div class="field">
      <label for="nuoc-w">Cân nặng (kg)</label>
      <input id="nuoc-w" type="number" min="1" max="500" step="0.1" value="60" placeholder="VD: 60">
    </div>
    <div class="field">
      <label for="nuoc-act">Mức vận động</label>
      <select id="nuoc-act">
        <option value="0">Ít vận động</option>
        <option value="300">Vận động vừa (+300 ml)</option>
        <option value="500">Vận động nhiều / tập nặng (+500 ml)</option>
      </select>
    </div>
    <div class="field">
      <label for="nuoc-weather">Thời tiết</label>
      <select id="nuoc-weather">
        <option value="0">Bình thường</option>
        <option value="500">Nóng / oi bức (+500 ml)</option>
      </select>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="nuoc-calc">Tính lượng nước</button>
  <div id="nuoc-out"></div>
  <p class="note">Lượng cơ bản: 35 ml nước cho mỗi kg cân nặng. Vận động nhiều và trời nóng làm cơ thể mất nước qua mồ hôi nên cần uống thêm. Lượng này bao gồm cả nước trong thức ăn (canh, trái cây...). Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế — người có bệnh thận, tim mạch nên hỏi bác sĩ về lượng nước phù hợp.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; };
  const f1 = n => n.toFixed(1).replace('.', ',');

  function calc() {
    const w = num($('nuoc-w').value);
    const act = parseFloat($('nuoc-act').value) || 0;
    const weather = parseFloat($('nuoc-weather').value) || 0;
    const out = $('nuoc-out');
    if (!(w > 0)) {
      out.innerHTML = '<p class="error">Vui lòng nhập cân nặng lớn hơn 0.</p>';
      return;
    }
    const base = 35 * w;
    const total = base + act + weather;
    const glasses = total / 250;
    const litres = total / 1000;
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtNum(total)} ml</div><div class="stat-label">≈ ${f1(litres)} lít — khoảng ${f1(glasses)} ly 250 ml mỗi ngày</div></div>
  <div class="result-row"><span>Lượng cơ bản (35 ml × ${f1(w)} kg)</span><strong>${fmtNum(base)} ml</strong></div>
  <div class="result-row"><span>Cộng thêm do vận động</span><strong>+ ${fmtNum(act)} ml</strong></div>
  <div class="result-row"><span>Cộng thêm do thời tiết</span><strong>+ ${fmtNum(weather)} ml</strong></div>
  <div class="result-row"><span>Số ly 250 ml</span><strong>${f1(glasses)} ly (≈ ${Math.ceil(glasses)} ly)</strong></div>
</div>
<p class="muted">Mẹo: chia đều lượng nước trong ngày, đừng đợi khát mới uống. Nước tiểu màu vàng nhạt là dấu hiệu bạn đang uống đủ nước.</p>`;
  }

  $('nuoc-calc').addEventListener('click', calc);
  $('nuoc-w').addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });
}
