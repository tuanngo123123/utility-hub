// Đổi HbA1c sang đường huyết trung bình (eAG) — công thức chuẩn ADA, kèm bảng tham chiếu.
export const meta = {
  id: 'hba1c-duong-huyet',
  name: 'Đổi HbA1c sang đường huyết trung bình (eAG)',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Nhập chỉ số HbA1c (%) để ra đường huyết trung bình ước tính eAG (mg/dL và mmol/L) theo công thức chuẩn, kèm bảng tham chiếu và phân loại.',
  keywords: 'hba1c, đường huyết trung bình, eag, đổi hba1c sang đường huyết, chỉ số đường huyết, tiểu đường hba1c bao nhiêu, a1c to eag',
  icon: '🩸',
  seoTitle: 'Đổi HbA1c sang đường huyết trung bình (eAG) — Bảng tham chiếu',
  seoDesc: 'Chuyển HbA1c (%) sang đường huyết trung bình ước tính eAG theo công thức chuẩn eAG = 28,7 × HbA1c − 46,7, kèm phân loại bình thường / tiền tiểu đường / tiểu đường.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🩸</span><div><h2>Đổi HbA1c sang đường huyết trung bình (eAG)</h2><p class="muted">HbA1c phản ánh đường huyết trung bình 2–3 tháng qua. Công cụ đổi sang con số đường huyết quen thuộc để bạn dễ hình dung.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="hb-tab-a1c">HbA1c → eAG</button>
    <button type="button" class="tab" id="hb-tab-eag">eAG → HbA1c</button>
  </div>

  <div id="hb-pane-a1c">
    <div class="field"><label for="hb-a1c">HbA1c (%)</label><input id="hb-a1c" type="text" inputmode="decimal" value="6,5" placeholder="VD: 6,5"></div>
    <button type="button" class="btn btn-primary" id="hb-a1c-go">Tính đường huyết trung bình</button>
    <div id="hb-a1c-out"></div>
  </div>

  <div id="hb-pane-eag" style="display:none">
    <div class="field"><label for="hb-eag">Đường huyết trung bình eAG (mg/dL)</label><input id="hb-eag" type="text" inputmode="decimal" value="140" placeholder="VD: 140"></div>
    <button type="button" class="btn btn-primary" id="hb-eag-go">Tính HbA1c ước tính</button>
    <div id="hb-eag-out"></div>
  </div>

  <p class="note">⚠️ Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế. HbA1c có thể sai lệch khi thiếu máu, bệnh thận, bệnh hemoglobin… Hãy hỏi bác sĩ để hiểu đúng chỉ số của mình.</p>
  <div class="field"><label>Bảng tham chiếu (theo Hiệp hội Tiểu đường Hoa Kỳ — ADA)</label></div>
  <table class="tbl"><thead><tr><th>HbA1c</th><th>eAG (mg/dL)</th><th>eAG (mmol/L)</th><th>Phân loại</th></tr></thead><tbody>
    <tr><td>5,0%</td><td>97</td><td>5,4</td><td>Bình thường</td></tr>
    <tr><td>5,5%</td><td>111</td><td>6,2</td><td>Bình thường</td></tr>
    <tr><td>6,0%</td><td>126</td><td>7,0</td><td>Tiền tiểu đường</td></tr>
    <tr><td>6,5%</td><td>140</td><td>7,8</td><td>Tiểu đường</td></tr>
    <tr><td>7,0%</td><td>154</td><td>8,6</td><td>Tiểu đường</td></tr>
    <tr><td>8,0%</td><td>183</td><td>10,2</td><td>Tiểu đường</td></tr>
    <tr><td>9,0%</td><td>212</td><td>11,8</td><td>Tiểu đường</td></tr>
    <tr><td>10,0%</td><td>240</td><td>13,4</td><td>Tiểu đường</td></tr>
  </tbody></table>
  <p class="note">Công thức chuẩn (ADA): eAG (mg/dL) = 28,7 × HbA1c − 46,7. Đổi mg/dL sang mmol/L: chia cho 18. Phân loại theo ADA: dưới 5,7% bình thường; 5,7–6,4% tiền tiểu đường; từ 6,5% trở lên thuộc ngưỡng tiểu đường.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? NaN : n; });
  const $ = id => root.querySelector('#' + id);

  $('hb-tab-a1c').addEventListener('click', () => {
    $('hb-tab-a1c').classList.add('tab-active'); $('hb-tab-eag').classList.remove('tab-active');
    $('hb-pane-a1c').style.display = ''; $('hb-pane-eag').style.display = 'none';
  });
  $('hb-tab-eag').addEventListener('click', () => {
    $('hb-tab-eag').classList.add('tab-active'); $('hb-tab-a1c').classList.remove('tab-active');
    $('hb-pane-eag').style.display = ''; $('hb-pane-a1c').style.display = 'none';
  });

  function fmt(n, digits) {
    return n.toFixed(digits).replace('.', ',');
  }
  function classify(a1c) {
    if (a1c < 5.7) return 'Bình thường (dưới 5,7%)';
    if (a1c < 6.5) return 'Tiền tiểu đường (5,7–6,4%)';
    return 'Ngưỡng tiểu đường (từ 6,5% trở lên)';
  }

  $('hb-a1c-go').addEventListener('click', () => {
    const a1c = parseNum($('hb-a1c').value);
    if (isNaN(a1c) || a1c < 3 || a1c > 20) {
      $('hb-a1c-out').innerHTML = '<p class="error">Hãy nhập HbA1c từ 3% đến 20% (VD: 6,5).</p>';
      return;
    }
    const eag = (287 * a1c - 467) / 10; // = 28,7 × a1c − 46,7, viết dạng này để tránh sai số số thực ở biên .5 (VD: A1c 6,0% phải ra 126, không phải 125).
    const mmol = eag / 18;
    $('hb-a1c-out').innerHTML = '<div class="result">' +
      '<div class="result-row"><span>Đường huyết trung bình (eAG)</span><strong>' + fmt(eag, 0) + ' mg/dL (' + fmt(mmol, 1) + ' mmol/L)</strong></div>' +
      '<div class="result-row"><span>Phân loại (ADA)</span><strong>' + classify(a1c) + '</strong></div>' +
      '<div class="result-row"><span>Công thức</span><span>eAG = 28,7 × ' + fmt(a1c, 1) + ' − 46,7 = ' + fmt(eag, 1) + ' mg/dL</span></div></div>';
  });

  $('hb-eag-go').addEventListener('click', () => {
    const eag = parseNum($('hb-eag').value);
    if (isNaN(eag) || eag < 40 || eag > 530) {
      $('hb-eag-out').innerHTML = '<p class="error">Hãy nhập eAG từ 40 đến 530 mg/dL (VD: 140).</p>';
      return;
    }
    const a1c = (eag + 46.7) / 28.7;
    $('hb-eag-out').innerHTML = '<div class="result">' +
      '<div class="result-row"><span>HbA1c ước tính</span><strong>' + fmt(a1c, 1) + '%</strong></div>' +
      '<div class="result-row"><span>Đường huyết (mmol/L)</span><strong>' + fmt(eag / 18, 1) + ' mmol/L</strong></div>' +
      '<div class="result-row"><span>Phân loại (ADA)</span><strong>' + classify(a1c) + '</strong></div></div>';
  });
}
