// Tính điểm thi THPT — điểm xét tốt nghiệp (TT 24/2024/TT-BGDĐT, sửa đổi bởi
// TT 13/2026/TT-BGDĐT) + điểm xét tuyển đại học theo tổ hợp (TT 06/2026/TT-BGDĐT).
export const meta = {
  id: 'tinh-diem-thi-thpt',
  name: 'Tính điểm thi THPT',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Tính điểm xét tốt nghiệp THPT (50% điểm thi + 50% học bạ 3 năm) và điểm xét tuyển đại học theo tổ hợp 3 môn cộng điểm ưu tiên khu vực, đối tượng.',
  keywords: 'tính điểm thi THPT, điểm xét tốt nghiệp, ĐXTN, điểm xét tuyển đại học, tổ hợp xét tuyển, điểm ưu tiên KV1 KV2, điểm khuyến khích, học bạ 3 năm, đỗ tốt nghiệp bao nhiêu điểm',
  icon: '🎓',
  seoTitle: 'Tính điểm thi THPT 2026 — điểm xét tốt nghiệp & điểm xét tuyển đại học',
  seoDesc: 'Tính điểm xét tốt nghiệp THPT theo công thức mới (50% điểm thi + 50% học bạ lớp 10, 11, 12) và điểm xét tuyển đại học theo tổ hợp 3 môn cộng điểm ưu tiên, kèm công thức giảm dần từ 22,5 điểm.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="dt-tab-tn">Điểm xét tốt nghiệp</button>
      <button type="button" class="tab" id="dt-tab-dh">Điểm xét tuyển đại học</button>
    </div>
  </div>

  <div id="dt-pane-tn">
    <div class="grid-2">
      <div class="field"><label for="dt-van">Ngữ văn</label><input id="dt-van" type="text" inputmode="decimal" value="7,5"></div>
      <div class="field"><label for="dt-toan">Toán</label><input id="dt-toan" type="text" inputmode="decimal" value="7"></div>
      <div class="field"><label for="dt-tc1">Môn tự chọn 1</label><input id="dt-tc1" type="text" inputmode="decimal" value="6"></div>
      <div class="field"><label for="dt-tc2">Môn tự chọn 2</label><input id="dt-tc2" type="text" inputmode="decimal" value="6,5"></div>
    </div>
    <p class="hint">Điểm thi thang 10. Môn được miễn thi (VD: ngoại ngữ có chứng chỉ) thì bỏ trống — môn đó không tính vào trung bình điểm thi.</p>
    <div class="grid-3">
      <div class="field"><label for="dt-l10">ĐTB lớp 10</label><input id="dt-l10" type="text" inputmode="decimal" value="7,2"></div>
      <div class="field"><label for="dt-l11">ĐTB lớp 11</label><input id="dt-l11" type="text" inputmode="decimal" value="7,5"></div>
      <div class="field"><label for="dt-l12">ĐTB lớp 12</label><input id="dt-l12" type="text" inputmode="decimal" value="8,1"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label for="dt-kk">Điểm khuyến khích (giải cao nhất)</label><select id="dt-kk"><option value="0">Không có giải</option><option value="1">Giải ba cấp tỉnh — 1,0 điểm</option><option value="1.5">Giải khuyến khích quốc gia / giải nhì cấp tỉnh — 1,5 điểm</option><option value="2">Giải nhất, nhì, ba quốc gia / giải nhất cấp tỉnh — 2,0 điểm</option></select></div>
      <div class="field"><label for="dt-ut">Diện ưu tiên xét tốt nghiệp</label><select id="dt-ut"><option value="0">Diện 1 — không được cộng</option><option value="0.25">Diện 2 — cộng 0,25 điểm</option><option value="0.5">Diện 3 — cộng 0,5 điểm</option></select></div>
    </div>
    <button type="button" class="btn btn-primary" id="dt-tn-calc">Tính điểm xét tốt nghiệp</button>
    <div id="dt-tn-out"></div>
    <p class="note">Công thức (Điều 44 Quy chế thi tốt nghiệp THPT, TT 24/2024/TT-BGDĐT): ĐXTN = [(trung bình điểm thi + điểm khuyến khích ÷ 4) + ĐTB các năm học] ÷ 2 + điểm ưu tiên. ĐTB các năm học = (ĐTB lớp 10 × 1 + ĐTB lớp 11 × 2 + ĐTB lớp 12 × 3) ÷ 6. Điểm khuyến khích chia cho 4 (số cố định), không phải số môn dự thi; chỉ tính giải cao nhất, không còn cộng điểm chứng chỉ nghề. Diện ưu tiên (Điều 42): Diện 1 không cộng, Diện 2 cộng 0,25, Diện 3 cộng 0,5; có nhiều tiêu chuẩn chỉ hưởng mức cao nhất. Đỗ tốt nghiệp khi mọi môn thi đều trên 1,0 điểm và ĐXTN từ 5,0 trở lên (Điều 45). Kết quả chỉ mang tính tham khảo — kết quả chính thức do phần mềm của Bộ GD&amp;ĐT tính và sở GD&amp;ĐT công bố.</p>
  </div>

  <div id="dt-pane-dh" style="display:none">
    <div class="grid-3">
      <div class="field"><label for="dt-m1">Môn 1</label><input id="dt-m1" type="text" inputmode="decimal" value="8"></div>
      <div class="field"><label for="dt-m2">Môn 2</label><input id="dt-m2" type="text" inputmode="decimal" value="8"></div>
      <div class="field"><label for="dt-m3">Môn 3</label><input id="dt-m3" type="text" inputmode="decimal" value="8"></div>
    </div>
    <div class="grid-3">
      <div class="field"><label for="dt-hs">Môn nhân hệ số 2 (nếu có)</label><select id="dt-hs"><option value="0">Không nhân hệ số</option><option value="1">Môn 1 × 2</option><option value="2">Môn 2 × 2</option><option value="3">Môn 3 × 2</option></select></div>
      <div class="field"><label for="dt-kv">Ưu tiên khu vực</label><select id="dt-kv"><option value="0">KV3 — không cộng</option><option value="0.25">KV2 — 0,25 điểm</option><option value="0.5">KV2-NT — 0,5 điểm</option><option value="0.75" selected>KV1 — 0,75 điểm</option></select></div>
      <div class="field"><label for="dt-dt">Ưu tiên đối tượng</label><select id="dt-dt"><option value="0">Không thuộc đối tượng ưu tiên</option><option value="1">Nhóm ưu tiên 2 (UT2) — 1,0 điểm</option><option value="2">Nhóm ưu tiên 1 (UT1) — 2,0 điểm</option></select></div>
    </div>
    <button type="button" class="btn btn-primary" id="dt-dh-calc">Tính điểm xét tuyển</button>
    <div id="dt-dh-out"></div>
    <p class="note">Điểm xét tuyển = tổng điểm 3 môn tổ hợp (quy về thang 30) + điểm ưu tiên. Ưu tiên khu vực (Điều 7 Quy chế tuyển sinh, TT 06/2026/TT-BGDĐT): KV1 0,75; KV2-NT 0,5; KV2 0,25; KV3 0. Ưu tiên đối tượng: nhóm UT1 2,0 điểm, nhóm UT2 1,0 điểm (thuộc nhiều diện chỉ hưởng mức cao nhất). Từ tổng điểm 22,5 trở lên, điểm ưu tiên giảm dần theo công thức: điểm ưu tiên thực tế = [(30 − tổng điểm) ÷ 7,5] × mức ưu tiên ban đầu. Môn nhân hệ số 2: tổng điểm = (môn chính × 2 + 2 môn còn lại) × 3 ÷ 4 để quy về thang 30. Một số trường có cách tính riêng (điểm thưởng, quy đổi chứng chỉ) — đối chiếu đề án tuyển sinh của trường. Kết quả chỉ mang tính tham khảo.</p>
  </div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const parseNum = U.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const $ = id => root.querySelector('#' + id);
  const round2 = n => Math.round(n * 100) / 100;
  const fmtScore = n => n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Đọc điểm thi: ô bỏ trống = môn được miễn, không tính vào trung bình.
  function readExam(id) {
    const raw = String($('dt-' + id).value == null ? '' : $('dt-' + id).value).trim();
    if (raw === '') return null;
    return parseNum(raw);
  }

  ['tn', 'dh'].forEach(k => {
    $('dt-tab-' + k).addEventListener('click', () => {
      ['tn', 'dh'].forEach(j => {
        $('dt-tab-' + j).classList.toggle('tab-active', j === k);
        $('dt-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });

  $('dt-tn-calc').addEventListener('click', () => {
    const out = $('dt-tn-out');
    const scores = ['van', 'toan', 'tc1', 'tc2'].map(readExam).filter(s => s !== null);
    const l10 = parseNum($('dt-l10').value), l11 = parseNum($('dt-l11').value), l12 = parseNum($('dt-l12').value);
    const kk = parseFloat($('dt-kk').value) || 0;
    const ut = parseFloat($('dt-ut').value) || 0;
    if (!scores.length) { out.innerHTML = '<p class="error">Vui lòng nhập ít nhất 1 môn thi.</p>'; return; }
    const all = scores.concat([l10, l11, l12]);
    if (all.some(v => !(v >= 0 && v <= 10))) { out.innerHTML = '<p class="error">Điểm phải trong khoảng 0–10.</p>'; return; }
    const avgExam = scores.reduce((a, b) => a + b, 0) / scores.length;
    const dtbYears = round2((l10 + l11 * 2 + l12 * 3) / 6);
    const dxtn = round2((avgExam + kk / 4 + dtbYears) / 2 + ut);
    const liet = scores.some(s => s <= 1);
    const pass = !liet && dxtn >= 5;
    const verdict = liet
      ? 'Chưa đỗ — có môn thi từ 1,0 điểm trở xuống (điểm liệt).'
      : dxtn < 5
        ? 'Chưa đỗ — điểm xét tốt nghiệp dưới 5,0.'
        : 'Đủ điều kiện đỗ tốt nghiệp (mọi môn trên 1,0 và ĐXTN từ 5,0 trở lên).';
    out.innerHTML = '<div class="result">' +
      '<div class="result-row"><span>Trung bình điểm thi (' + scores.length + ' môn)</span><span>' + fmtScore(avgExam) + '</span></div>' +
      '<div class="result-row"><span>ĐTB các năm học (lớp 10 × 1, lớp 11 × 2, lớp 12 × 3)</span><span>' + fmtScore(dtbYears) + '</span></div>' +
      '<div class="result-row"><span>Điểm khuyến khích</span><span>' + fmtScore(kk) + ' ÷ 4 = ' + fmtScore(kk / 4) + '</span></div>' +
      '<div class="result-row"><span>Điểm ưu tiên</span><span>+' + fmtScore(ut) + '</span></div>' +
      '<div class="result-row"><span>Điểm xét tốt nghiệp (ĐXTN)</span><strong>' + fmtScore(dxtn) + '</strong></div>' +
      '<div class="result-row"><span>Kết luận</span><span>' + verdict + '</span></div>' +
      '</div>';
  });

  $('dt-dh-calc').addEventListener('click', () => {
    const out = $('dt-dh-out');
    const m = [parseNum($('dt-m1').value), parseNum($('dt-m2').value), parseNum($('dt-m3').value)];
    if (m.some(v => !(v >= 0 && v <= 10))) { out.innerHTML = '<p class="error">Vui lòng nhập đủ 3 môn, mỗi môn 0–10 điểm.</p>'; return; }
    const hs = parseInt($('dt-hs').value, 10) || 0;
    const kv = parseFloat($('dt-kv').value) || 0;
    const dt = parseFloat($('dt-dt').value) || 0;
    let total30 = m[0] + m[1] + m[2];
    let hsNote = '';
    if (hs >= 1 && hs <= 3) {
      total30 = (m[hs - 1] * 2 + m.filter((_, i) => i !== hs - 1).reduce((a, b) => a + b, 0)) * 3 / 4;
      hsNote = ' (môn ' + hs + ' nhân hệ số 2, quy về thang 30)';
    }
    const pri0 = round2(kv + dt);
    const scaled = total30 >= 22.5;
    const pri = scaled ? round2((30 - total30) / 7.5 * pri0) : pri0;
    const total = round2(total30 + pri);
    out.innerHTML = '<div class="result">' +
      '<div class="result-row"><span>Tổng điểm 3 môn (thang 30)' + hsNote + '</span><span>' + fmtScore(total30) + '</span></div>' +
      '<div class="result-row"><span>Điểm ưu tiên ban đầu (khu vực + đối tượng)</span><span>' + fmtScore(pri0) + '</span></div>' +
      '<div class="result-row"><span>Điểm ưu tiên thực tế</span><span>' + fmtScore(pri) + (scaled ? ' — giảm dần vì tổng điểm từ 22,5 trở lên' : ' — cộng đủ vì tổng điểm dưới 22,5') + '</span></div>' +
      '<div class="result-row"><span>Điểm xét tuyển</span><strong>' + fmtScore(total) + '</strong></div>' +
      '</div>';
  });
}
