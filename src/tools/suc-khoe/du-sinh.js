// Tính ngày dự sinh theo công thức Naegele (LMP + 280 ngày).
export const meta = {
  id: 'du-sinh',
  name: 'Tính ngày dự sinh',
  category: 'Sức khỏe',
  categorySlug: 'suc-khoe',
  desc: 'Tính ngày dự sinh từ ngày đầu kỳ kinh cuối (công thức Naegele: +280 ngày), tuần thai hiện tại và các mốc tam cá nguyệt.',
  keywords: 'tính ngày dự sinh, naegele, tuần thai, tam cá nguyệt, dự sinh khi nào, tính tuổi thai',
  icon: '🤰',
  seoTitle: 'Tính ngày dự sinh & tuần thai — công thức Naegele',
  seoDesc: 'Tính ngày dự sinh từ ngày đầu kỳ kinh cuối (+280 ngày), xem tuần thai hiện tại và các mốc tam cá nguyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập ngày đầu tiên của kỳ kinh cuối cùng (trước khi mang thai) để tính ngày dự sinh và tuần thai.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="ds-lmp">Ngày đầu kỳ kinh cuối (LMP)</label>
      <input id="ds-lmp" type="date">
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="ds-calc">Tính ngày dự sinh</button>
  <div id="ds-out"></div>
  <p class="note">Ngày dự sinh = ngày đầu kỳ kinh cuối + 280 ngày (40 tuần) theo công thức Naegele. Chỉ khoảng 5% em bé chào đời đúng ngày dự sinh — sinh trong khoảng 2 tuần trước/sau ngày này đều được coi là bình thường. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế — ngày dự sinh chính xác nhất dựa trên siêu âm trong 3 tháng đầu.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const todayISO = U.todayISO || (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const $ = id => root.querySelector('#' + id);

  function parseDate(v) {
    const d = new Date(v + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function addDays(d, n) {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    return x;
  }

  function fmt(d) {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  function calc() {
    const lmp = parseDate($('ds-lmp').value);
    const out = $('ds-out');
    if (!lmp) { out.innerHTML = '<p class="error">Vui lòng chọn ngày đầu kỳ kinh cuối.</p>'; return; }
    const today = parseDate(todayISO());
    const due = addDays(lmp, 280);
    const t1End = addDays(lmp, 13 * 7 + 6);
    const t2Start = addDays(lmp, 14 * 7);
    const t2End = addDays(lmp, 27 * 7 + 6);
    const t3Start = addDays(lmp, 28 * 7);
    const diffDays = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    let gest;
    if (diffDays < 0) gest = 'Ngày bạn chọn nằm trong tương lai — vui lòng kiểm tra lại.';
    else if (diffDays > 280) gest = 'Đã quá ngày dự sinh (' + Math.floor(diffDays / 7) + ' tuần ' + (diffDays % 7) + ' ngày). Hãy liên hệ bác sĩ để được theo dõi.';
    else gest = 'Tuần thứ ' + (Math.floor(diffDays / 7) + 1) + ' (đã mang thai ' + Math.floor(diffDays / 7) + ' tuần ' + (diffDays % 7) + ' ngày)';
    const remain = Math.max(0, Math.floor((due.getTime() - today.getTime()) / 86400000));
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmt(due)}</div><div class="stat-label">Ngày dự sinh (LMP + 280 ngày)</div></div>
  <div class="result-row"><span>Tuần thai hiện tại</span><strong>${gest}</strong></div>
  <div class="result-row"><span>Còn lại đến ngày dự sinh</span><strong>${remain} ngày</strong></div>
  <div class="result-row"><span>Tam cá nguyệt 1 (tuần 1–13)</span><strong>${fmt(lmp)} — ${fmt(t1End)}</strong></div>
  <div class="result-row"><span>Tam cá nguyệt 2 (tuần 14–27)</span><strong>${fmt(t2Start)} — ${fmt(t2End)}</strong></div>
  <div class="result-row"><span>Tam cá nguyệt 3 (tuần 28–40)</span><strong>${fmt(t3Start)} — ${fmt(due)}</strong></div>
</div>`;
  }

  $('ds-calc').addEventListener('click', calc);
}
