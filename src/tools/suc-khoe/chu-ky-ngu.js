// Tính chu kỳ ngủ 90 phút: giờ dậy ↔ giờ đi ngủ lý tưởng.
export const meta = {
  id: 'chu-ky-ngu',
  name: 'Tính chu kỳ ngủ',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính giờ đi ngủ hoặc giờ dậy lý tưởng theo chu kỳ ngủ 90 phút để thức dậy tỉnh táo, không mệt mỏi.',
  keywords: 'tính chu kỳ ngủ, giờ ngủ lý tưởng, ngủ bao nhiêu tiếng, dậy lúc mấy giờ, sleep cycle',
  icon: '😴',
  seoTitle: 'Tính chu kỳ ngủ 90 phút — giờ ngủ & giờ dậy lý tưởng',
  seoDesc: 'Tính giờ đi ngủ và giờ dậy lý tưởng theo chu kỳ ngủ 90 phút: thức dậy đúng lúc hết chu kỳ để tỉnh táo cả ngày.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="ngu-tab-1">Tôi muốn dậy lúc…</button>
      <button type="button" class="tab" id="ngu-tab-2">Tôi đi ngủ lúc…</button>
    </div>
  </div>
  <div id="ngu-pane-1">
    <div class="grid-2">
      <div class="field">
        <label for="ngu-wake">Giờ bạn muốn dậy</label>
        <input id="ngu-wake" type="time" value="06:00">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="ngu-calc-1">Tính giờ đi ngủ</button>
    <div id="ngu-out-1"></div>
  </div>
  <div id="ngu-pane-2" hidden>
    <div class="grid-2">
      <div class="field">
        <label for="ngu-bed">Giờ bạn đi ngủ</label>
        <input id="ngu-bed" type="time" value="23:00">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="ngu-calc-2">Tính giờ dậy</button>
    <div id="ngu-out-2"></div>
  </div>
  <p class="note">Một chu kỳ ngủ kéo dài khoảng 90 phút. Thức dậy đúng lúc kết thúc một chu kỳ (thay vì giữa chu kỳ) giúp bạn tỉnh táo hơn. Công thức đã cộng thêm 15 phút ru ngủ — thời gian trung bình để chìm vào giấc ngủ. Người trưởng thành nên ngủ 5–6 chu kỳ (7,5–9 giờ) mỗi đêm. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const pad = n => String(n).padStart(2, '0');

  function parseTime(v) {
    const parts = String(v).split(':');
    if (parts.length < 2) return NaN;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return NaN;
    return h * 60 + m;
  }

  function fmt(mins) {
    const total = ((mins % 1440) + 1440) % 1440;
    return pad(Math.floor(total / 60)) + ':' + pad(total % 60);
  }

  function fmtHours(cycles) {
    const mins = cycles * 90;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? h + ' giờ' : h + ' giờ ' + m + ' phút';
  }

  function calcBed() {
    const wake = parseTime($('ngu-wake').value);
    const out = $('ngu-out-1');
    if (isNaN(wake)) { out.innerHTML = '<p class="error">Vui lòng chọn giờ dậy.</p>'; return; }
    const rows = [6, 5, 4, 3].map(n => {
      const bed = wake - n * 90 - 15;
      const rec = n === 6 || n === 5 ? ' <span class="chip">Khuyên dùng</span>' : '';
      return '<div class="result-row"><span>Ngủ ' + n + ' chu kỳ (' + fmtHours(n) + ')</span><strong>Đi ngủ lúc ' + fmt(bed) + rec + '</strong></div>';
    }).join('');
    out.innerHTML = `
<div class="result">
  <div class="result-row"><span>Giờ dậy mong muốn</span><strong>${fmt(wake)}</strong></div>
  ${rows}
</div>
<p class="muted">Ví dụ: dậy lúc ${fmt(wake)} mà ngủ 5 chu kỳ (7,5 giờ) thì nên lên giường lúc ${fmt(wake - 5 * 90 - 15)} (đã tính 15 phút ru ngủ).</p>`;
  }

  function calcWake() {
    const bed = parseTime($('ngu-bed').value);
    const out = $('ngu-out-2');
    if (isNaN(bed)) { out.innerHTML = '<p class="error">Vui lòng chọn giờ đi ngủ.</p>'; return; }
    const rows = [3, 4, 5, 6].map(n => {
      const wake = bed + 15 + n * 90;
      const rec = n === 6 || n === 5 ? ' <span class="chip">Khuyên dùng</span>' : '';
      return '<div class="result-row"><span>Ngủ ' + n + ' chu kỳ (' + fmtHours(n) + ')</span><strong>Dậy lúc ' + fmt(wake) + rec + '</strong></div>';
    }).join('');
    out.innerHTML = `
<div class="result">
  <div class="result-row"><span>Giờ đi ngủ</span><strong>${fmt(bed)}</strong></div>
  ${rows}
</div>
<p class="muted">Đặt báo thức vào một trong các giờ trên để thức dậy đúng cuối chu kỳ, tránh cảm giác mệt mỏi vì bị đánh thức giữa giấc ngủ sâu.</p>`;
  }

  function showTab(n) {
    $('ngu-tab-1').classList.toggle('tab-active', n === 1);
    $('ngu-tab-2').classList.toggle('tab-active', n === 2);
    $('ngu-pane-1').hidden = n !== 1;
    $('ngu-pane-2').hidden = n !== 2;
  }

  $('ngu-tab-1').addEventListener('click', () => showTab(1));
  $('ngu-tab-2').addEventListener('click', () => showTab(2));
  $('ngu-calc-1').addEventListener('click', calcBed);
  $('ngu-calc-2').addEventListener('click', calcWake);
}
