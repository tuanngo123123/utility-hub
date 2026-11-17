// Tính GPA theo tín chỉ (quy đổi điểm hệ 10 sang hệ 4).
export const meta = {
  id: 'gpa-tin-chi',
  name: 'Tính GPA theo tín chỉ',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Tính điểm trung bình GPA hệ 4 và hệ 10 theo tín chỉ từng môn, kèm xếp loại học lực: xuất sắc, giỏi, khá, trung bình.',
  keywords: 'tính gpa, tính điểm trung bình đại học, gpa theo tín chỉ, quy đổi điểm hệ 4, xếp loại học lực',
  icon: '🎓',
  seoTitle: 'Tính GPA theo tín chỉ — điểm trung bình hệ 4 & hệ 10',
  seoDesc: 'Tính GPA hệ 4 và điểm trung bình hệ 10 theo tín chỉ từng môn học, kèm xếp loại xuất sắc / giỏi / khá / trung bình.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập từng môn học: tên môn, số tín chỉ và điểm hệ 10. Bấm "Thêm môn" để nhập thêm môn khác.</p>
  </div>
  <div id="gpa-rows"></div>
  <button type="button" class="btn btn-ghost" id="gpa-add">+ Thêm môn</button>
  <button type="button" class="btn btn-primary" id="gpa-calc">Tính GPA</button>
  <div id="gpa-out"></div>
  <p class="note">Quy đổi hệ 10 sang hệ 4: 8,5–10 → 4,0; 7,0–8,4 → 3,0; 5,5–6,9 → 2,0; 4,0–5,4 → 1,0; dưới 4,0 → 0. Xếp loại theo GPA hệ 4: xuất sắc ≥ 3,6; giỏi ≥ 3,2; khá ≥ 2,5; trung bình ≥ 2,0; dưới 2,0 là yếu. Thang quy đổi có thể khác nhau giữa các trường — hãy đối chiếu quy chế đào tạo của trường bạn.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const f2 = n => n.toFixed(2).replace('.', ',');

  function toGPA4(score10) {
    if (score10 >= 8.5) return 4.0;
    if (score10 >= 7.0) return 3.0;
    if (score10 >= 5.5) return 2.0;
    if (score10 >= 4.0) return 1.0;
    return 0;
  }

  function rowHTML(name, credits, score) {
    return '<div class="grid-3" data-gpa-row="1">'
      + '<div class="field"><label>Tên môn</label><input type="text" data-gpa-f="name" value="' + (name || '') + '" placeholder="VD: Toán cao cấp"></div>'
      + '<div class="field"><label>Số tín chỉ</label><input type="number" data-gpa-f="credits" min="1" max="10" step="1" value="' + credits + '"></div>'
      + '<div class="field"><label>Điểm hệ 10</label><input type="number" data-gpa-f="score" min="0" max="10" step="0.1" value="' + score + '"></div>'
      + '</div>';
  }

  function addRow(name, credits, score) {
    const wrap = document.createElement('div');
    wrap.innerHTML = rowHTML(name, credits, score);
    $('gpa-rows').appendChild(wrap.firstElementChild);
  }

  function calc() {
    const rows = root.querySelectorAll('[data-gpa-row]');
    const out = $('gpa-out');
    let totalCredits = 0;
    let sum10 = 0;
    let sum4 = 0;
    let count = 0;
    const detail = [];
    for (const row of rows) {
      const name = row.querySelector('[data-gpa-f="name"]').value.trim() || ('Môn ' + (count + 1));
      const credits = parseInt(row.querySelector('[data-gpa-f="credits"]').value, 10);
      const score = parseFloat(String(row.querySelector('[data-gpa-f="score"]').value).replace(',', '.'));
      if (isNaN(credits) || isNaN(score)) continue;
      if (!(credits > 0) || score < 0 || score > 10) {
        out.innerHTML = '<p class="error">Môn "' + name + '" có số tín chỉ hoặc điểm không hợp lệ (tín chỉ &gt; 0, điểm 0–10).</p>';
        return;
      }
      const g4 = toGPA4(score);
      totalCredits += credits;
      sum10 += score * credits;
      sum4 += g4 * credits;
      count++;
      detail.push('<tr><td>' + name + '</td><td>' + credits + '</td><td>' + f2(score) + '</td><td>' + f2(g4) + '</td></tr>');
    }
    if (count === 0 || totalCredits === 0) {
      out.innerHTML = '<p class="error">Vui lòng nhập ít nhất 1 môn học với đầy đủ tín chỉ và điểm.</p>';
      return;
    }
    const avg10 = sum10 / totalCredits;
    const gpa = sum4 / totalCredits;
    let rank;
    if (gpa >= 3.6) rank = 'Xuất sắc';
    else if (gpa >= 3.2) rank = 'Giỏi';
    else if (gpa >= 2.5) rank = 'Khá';
    else if (gpa >= 2.0) rank = 'Trung bình';
    else rank = 'Yếu';
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${f2(gpa)}</div><div class="stat-label">GPA hệ 4 — xếp loại: ${rank}</div></div>
  <div class="result-row"><span>Điểm trung bình hệ 10</span><strong>${f2(avg10)}</strong></div>
  <div class="result-row"><span>Tổng số tín chỉ</span><strong>${totalCredits} tín chỉ (${count} môn)</strong></div>
</div>
<table class="tbl">
  <thead><tr><th>Môn</th><th>Tín chỉ</th><th>Điểm hệ 10</th><th>Điểm hệ 4</th></tr></thead>
  <tbody>${detail.join('')}</tbody>
</table>`;
  }

  addRow('Toán cao cấp', 3, '9');
  addRow('Vật lý đại cương', 2, '7.5');
  addRow('Ngữ văn', 2, '6');
  $('gpa-add').addEventListener('click', () => addRow('', 3, ''));
  $('gpa-calc').addEventListener('click', calc);
}
