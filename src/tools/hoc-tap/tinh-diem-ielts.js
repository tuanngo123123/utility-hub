// Tính điểm IELTS trung bình — theo quy tắc làm tròn chính thức (.25 lên .5, .75 lên band nguyên).
export const meta = {
  id: 'tinh-diem-ielts',
  name: 'Tính điểm IELTS trung bình',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Nhập điểm 4 kỹ năng Nghe, Đọc, Viết, Nói để tính điểm Overall theo quy tắc làm tròn chính thức của IELTS, kèm gợi ý cần bao nhiêu điểm để đạt band mục tiêu.',
  keywords: 'tính điểm ielts, ielts overall, tính điểm trung bình ielts, ielts band score calculator, quy tắc làm tròn ielts, ielts 6.5 cần bao nhiêu điểm',
  icon: '🎓',
  seoTitle: 'Tính điểm IELTS Overall — Quy tắc làm tròn chính thức',
  seoDesc: 'Tính điểm IELTS Overall từ 4 kỹ năng theo quy tắc làm tròn chính thức: trung bình .25 lên .5, .75 lên band nguyên. Xem cần thêm bao nhiêu để đạt band mục tiêu.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🎓</span><div><h2>Tính điểm IELTS trung bình</h2><p class="muted">Điểm Overall = trung bình 4 kỹ năng, làm tròn theo quy tắc chính thức của IELTS.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="ielts-l">Listening (Nghe)</label><select id="ielts-l"></select></div>
    <div class="field"><label for="ielts-r">Reading (Đọc)</label><select id="ielts-r"></select></div>
    <div class="field"><label for="ielts-w">Writing (Viết)</label><select id="ielts-w"></select></div>
    <div class="field"><label for="ielts-s">Speaking (Nói)</label><select id="ielts-s"></select></div>
  </div>
  <div class="field"><label for="ielts-target">Band mục tiêu của bạn</label><select id="ielts-target"></select></div>
  <button type="button" class="btn btn-primary" id="ielts-go">Tính điểm Overall</button>
  <div id="ielts-out"></div>
  <p class="note">Quy tắc làm tròn chính thức (IELTS): trung bình kết thúc bằng .25 làm tròn LÊN nửa band (6.25 → 6.5); kết thúc bằng .75 làm tròn LÊN band nguyên (6.75 → 7.0); còn lại làm tròn tới nửa band gần nhất (6.125 → 6.0; 6.375 → 6.5).</p>
  <div class="field"><label>Thang điểm IELTS (0–9)</label></div>
  <table class="tbl"><thead><tr><th>Band</th><th>Mức độ</th></tr></thead><tbody>
    <tr><td>9.0</td><td>Expert user — thành thạo hoàn toàn</td></tr>
    <tr><td>8.0</td><td>Very good user — rất tốt, chỉ sai sót nhỏ</td></tr>
    <tr><td>7.0</td><td>Good user — tốt, thỉnh thoảng sai</td></tr>
    <tr><td>6.0</td><td>Competent user — khá, dùng được dù còn lỗi</td></tr>
    <tr><td>5.0</td><td>Modest user — trung bình, hiểu ý chính</td></tr>
    <tr><td>4.0</td><td>Limited user — hạn chế, chỉ giao tiếp cơ bản</td></tr>
    <tr><td>3.0 trở xuống</td><td>Rất hạn chế trở xuống</td></tr>
  </tbody></table>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  function bandOptions() {
    let html = '';
    for (let v = 0; v <= 18; v++) {
      const band = (v / 2).toFixed(1);
      html += '<option value="' + band + '">' + band + '</option>';
    }
    return html;
  }
  ['ielts-l', 'ielts-r', 'ielts-w', 'ielts-s'].forEach(id => { $(id).innerHTML = bandOptions(); });
  // Ví dụ chính thức của IELTS: 6.5 + 6.5 + 5.0 + 7.0 = 25 → 6.25 → 6.5.
  $('ielts-l').value = '6.5';
  $('ielts-r').value = '6.5';
  $('ielts-w').value = '5.0';
  $('ielts-s').value = '7.0';

  let targetHtml = '';
  for (let v = 10; v <= 18; v++) {
    const band = (v / 2).toFixed(1);
    targetHtml += '<option value="' + band + '"' + (band === '7.0' ? ' selected' : '') + '>' + band + '</option>';
  }
  $('ielts-target').innerHTML = targetHtml;

  function fmtBand(n) { return n.toFixed(1); }
  function fmtAvg(n) {
    // Trung bình của 4 số bước 0.5 luôn là bội số của 0.125 — hiển thị tối đa 3 số lẻ.
    return (Math.round(n * 1000) / 1000).toString().replace('.', ',');
  }

  // Làm tròn IELTS bằng số nguyên (tránh lỗi số thực): tổng ×2 là số nguyên.
  // Overall = floor(tổng/2 + 0.5) / 2.
  function overallBand(sum) {
    const s2 = Math.round(sum * 2);
    return Math.floor((s2 + 2) / 4) / 2;
  }
  function roundingNote(avg, overall) {
    const frac = Math.round((avg - Math.floor(avg)) * 1000) / 1000;
    if (frac === 0.25) return 'Trung bình kết thúc bằng ,25 nên làm tròn LÊN nửa band theo quy tắc chính thức.';
    if (frac === 0.75) return 'Trung bình kết thúc bằng ,75 nên làm tròn LÊN band nguyên theo quy tắc chính thức.';
    if (frac === 0 || frac === 0.5) return 'Trung bình đã đúng band (nguyên hoặc nửa band), không cần làm tròn.';
    return 'Trung bình làm tròn tới nửa band gần nhất.';
  }

  function calc() {
    const l = +$('ielts-l').value, r = +$('ielts-r').value;
    const w = +$('ielts-w').value, s = +$('ielts-s').value;
    const sum = l + r + w + s;
    const avg = sum / 4;
    const overall = overallBand(sum);
    const target = +$('ielts-target').value;

    // Tổng tối thiểu để đạt band mục tiêu T: trung bình ≥ T − 0.25 → tổng ≥ 4T − 1.
    const minSum = 4 * target - 1;
    let targetRow;
    if (overall >= target) {
      targetRow = '<div class="result-row"><span>Mục tiêu ' + fmtBand(target) + '</span><strong>✅ Bạn đã đạt (Overall ' + fmtBand(overall) + ' ≥ ' + fmtBand(target) + ').</strong></div>';
    } else {
      const need = Math.round((minSum - sum) * 10) / 10;
      const steps = Math.round(need / 0.5);
      targetRow = '<div class="result-row"><span>Để đạt Overall ' + fmtBand(target) + '</span><strong>Cần tổng ít nhất ' + fmtAvg(minSum) + ' (hiện ' + fmtAvg(sum) + ' — thiếu ' + fmtAvg(need) + ' điểm, tương đương tăng 0.5 ở ' + steps + ' kỹ năng).</strong></div>';
    }

    $('ielts-out').innerHTML = '<div class="result">' +
      '<div class="result-row"><span>Tổng 4 kỹ năng</span><strong>' + fmtAvg(sum) + '</strong></div>' +
      '<div class="result-row"><span>Trung bình (tổng ÷ 4)</span><strong>' + fmtAvg(avg) + '</strong></div>' +
      '<div class="result-row"><span>Điểm Overall</span><strong>🎯 ' + fmtBand(overall) + '</strong></div>' +
      '<div class="result-row"><span>Cách làm tròn</span><span>' + roundingNote(avg, overall) + '</span></div>' +
      targetRow + '</div>';
  }

  $('ielts-go').addEventListener('click', calc);
  ['ielts-l', 'ielts-r', 'ielts-w', 'ielts-s', 'ielts-target'].forEach(id => $(id).addEventListener('change', calc));
  calc();
}
