// Quy đổi điểm hệ 10 ↔ hệ 4 ↔ điểm chữ theo thang VN phổ biến.
export const meta = {
  id: 'quy-doi-diem',
  name: 'Quy đổi điểm số',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Quy đổi điểm qua lại giữa hệ 10, hệ 4 và điểm chữ (A, B+, B, C+, C, D+, D, F) theo thang điểm Việt Nam phổ biến, kèm bảng tra cứu.',
  keywords: 'quy đổi điểm hệ 10 sang hệ 4, điểm chữ a b c, thang điểm đại học, đổi điểm gpa, điểm b+ là bao nhiêu',
  icon: '🔄',
  seoTitle: 'Quy đổi điểm hệ 10 ↔ hệ 4 ↔ điểm chữ (A, B+, B, C, D, F)',
  seoDesc: 'Quy đổi điểm số qua lại giữa hệ 10, hệ 4 và điểm chữ A/B+/B/C+/C/D+/D/F theo thang điểm Việt Nam phổ biến.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Chọn loại điểm bạn có rồi nhập điểm để quy đổi sang các hệ còn lại.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="qd-type">Tôi muốn quy đổi từ</label>
      <select id="qd-type">
        <option value="10">Điểm hệ 10</option>
        <option value="4">Điểm hệ 4</option>
        <option value="letter">Điểm chữ (A, B+, B…)</option>
      </select>
    </div>
    <div class="field" id="qd-num-wrap">
      <label for="qd-num">Điểm số</label>
      <input id="qd-num" type="number" min="0" max="10" step="0.1" value="8.5" placeholder="VD: 8.5">
    </div>
    <div class="field" id="qd-letter-wrap" hidden>
      <label for="qd-letter">Điểm chữ</label>
      <select id="qd-letter">
        <option value="A">A</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="C+">C+</option>
        <option value="C">C</option>
        <option value="D+">D+</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="qd-calc">Quy đổi</button>
  <div id="qd-out"></div>
  <table class="tbl">
    <thead><tr><th>Điểm hệ 10</th><th>Điểm hệ 4</th><th>Điểm chữ</th><th>Xếp loại</th></tr></thead>
    <tbody>
      <tr><td>8,5 – 10</td><td>4,0</td><td>A</td><td>Giỏi</td></tr>
      <tr><td>8,0 – 8,4</td><td>3,5</td><td>B+</td><td>Khá giỏi</td></tr>
      <tr><td>7,0 – 7,9</td><td>3,0</td><td>B</td><td>Khá</td></tr>
      <tr><td>6,5 – 6,9</td><td>2,5</td><td>C+</td><td>Trung bình khá</td></tr>
      <tr><td>5,5 – 6,4</td><td>2,0</td><td>C</td><td>Trung bình</td></tr>
      <tr><td>5,0 – 5,4</td><td>1,5</td><td>D+</td><td>Trung bình yếu</td></tr>
      <tr><td>4,0 – 4,9</td><td>1,0</td><td>D</td><td>Yếu</td></tr>
      <tr><td>Dưới 4,0</td><td>0</td><td>F</td><td>Kém (trượt)</td></tr>
    </tbody>
  </table>
  <p class="note">Thang quy đổi trên là thang phổ biến ở nhiều trường đại học Việt Nam. Một số trường dùng thang khác (ví dụ không có B+, C+, D+), hãy đối chiếu quy chế đào tạo của trường bạn.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  const SCALE = [
    { min10: 8.5, max10: 10, g4: 4.0, letter: 'A', rank: 'Giỏi' },
    { min10: 8.0, max10: 8.4, g4: 3.5, letter: 'B+', rank: 'Khá giỏi' },
    { min10: 7.0, max10: 7.9, g4: 3.0, letter: 'B', rank: 'Khá' },
    { min10: 6.5, max10: 6.9, g4: 2.5, letter: 'C+', rank: 'Trung bình khá' },
    { min10: 5.5, max10: 6.4, g4: 2.0, letter: 'C', rank: 'Trung bình' },
    { min10: 5.0, max10: 5.4, g4: 1.5, letter: 'D+', rank: 'Trung bình yếu' },
    { min10: 4.0, max10: 4.9, g4: 1.0, letter: 'D', rank: 'Yếu' },
    { min10: 0, max10: 3.9, g4: 0, letter: 'F', rank: 'Kém (trượt)' },
  ];

  const f1 = n => n.toFixed(1).replace('.', ',');

  function findBy10(v) { return SCALE.find(s => v >= s.min10 && v <= s.max10 + 0.049); }
  function findBy4(v) { return SCALE.find(s => Math.abs(s.g4 - v) < 0.01); }
  function findByLetter(l) { return SCALE.find(s => s.letter === l); }

  function toggleInputs() {
    const t = $('qd-type').value;
    $('qd-letter-wrap').hidden = t !== 'letter';
    $('qd-num-wrap').hidden = t === 'letter';
    const numInput = $('qd-num');
    if (t === '10') { numInput.max = '10'; numInput.value = '8.5'; }
    if (t === '4') { numInput.max = '4'; numInput.value = '3.5'; }
  }

  function renderRow(s, range10) {
    return `
<div class="result">
  <div class="stat"><div class="stat-num">${s.letter}</div><div class="stat-label">Điểm chữ — xếp loại: ${s.rank}</div></div>
  <div class="result-row"><span>Điểm hệ 10</span><strong>${range10}</strong></div>
  <div class="result-row"><span>Điểm hệ 4</span><strong>${f1(s.g4)}</strong></div>
  <div class="result-row"><span>Điểm chữ</span><strong>${s.letter}</strong></div>
</div>`;
  }

  function calc() {
    const t = $('qd-type').value;
    const out = $('qd-out');
    if (t === '10') {
      const v = parseFloat(String($('qd-num').value).replace(',', '.'));
      if (isNaN(v) || v < 0 || v > 10) { out.innerHTML = '<p class="error">Vui lòng nhập điểm hệ 10 từ 0 đến 10.</p>'; return; }
      const s = findBy10(v);
      out.innerHTML = renderRow(s, f1(v));
    } else if (t === '4') {
      const v = parseFloat(String($('qd-num').value).replace(',', '.'));
      if (isNaN(v) || v < 0 || v > 4) { out.innerHTML = '<p class="error">Vui lòng nhập điểm hệ 4 từ 0 đến 4.</p>'; return; }
      const s = findBy4(v);
      if (!s) { out.innerHTML = '<p class="error">Điểm hệ 4 hợp lệ là 0 — 1,0 — 1,5 — 2,0 — 2,5 — 3,0 — 3,5 — 4,0. Vui lòng nhập một trong các giá trị này.</p>'; return; }
      out.innerHTML = renderRow(s, s.min10 === 0 ? 'Dưới 4,0' : f1(s.min10) + ' – ' + f1(s.max10));
    } else {
      const s = findByLetter($('qd-letter').value);
      out.innerHTML = renderRow(s, s.min10 === 0 ? 'Dưới 4,0' : f1(s.min10) + ' – ' + f1(s.max10));
    }
  }

  $('qd-type').addEventListener('change', toggleInputs);
  $('qd-calc').addEventListener('click', calc);
  $('qd-num').addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });
  toggleInputs();
}
