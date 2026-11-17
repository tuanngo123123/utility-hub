// Nhóm máu của con — nhóm máu bố + mẹ → các nhóm máu con có thể có + tỉ lệ %.
export const meta = {
  id: 'nhom-mau-con',
  name: 'Nhóm máu của con',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập nhóm máu bố và mẹ (ABO + Rh) để xem con có thể mang nhóm máu nào và tỉ lệ từng nhóm.',
  keywords: 'nhóm máu con, di truyền nhóm máu, bố mẹ nhóm máu gì con nhóm máu gì, ABO Rh',
  icon: '🩸',
  seoTitle: 'Nhóm máu của con — Bố mẹ nhóm máu gì thì con nhóm máu gì',
  seoDesc: 'Tra cứu di truyền nhóm máu ABO và Rh: nhập nhóm máu bố mẹ, xem các nhóm máu con có thể có kèm tỉ lệ phần trăm.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🩸</span><div><h2>Nhóm máu của con</h2><p class="muted">Nhóm máu bố mẹ quyết định các nhóm máu con có thể có — xem bảng tỉ lệ di truyền.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="nmc-dad-abo">Nhóm máu bố (ABO)</label><select id="nmc-dad-abo"><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select></div>
    <div class="field"><label for="nmc-dad-rh">Rh của bố</label><select id="nmc-dad-rh"><option value="+">Rh+ (dương)</option><option value="-">Rh− (âm)</option></select></div>
    <div class="field"><label for="nmc-mom-abo">Nhóm máu mẹ (ABO)</label><select id="nmc-mom-abo"><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select></div>
    <div class="field"><label for="nmc-mom-rh">Rh của mẹ</label><select id="nmc-mom-rh"><option value="+">Rh+ (dương)</option><option value="-">Rh− (âm)</option></select></div>
  </div>
  <button type="button" class="btn btn-primary" id="nmc-calc">Xem nhóm máu con</button>
  <div id="nmc-out"></div>
  <p class="note">Kết quả chỉ là khả năng di truyền theo bảng ABO + Rh đơn giản (bố/mẹ Rh+ có thể mang gen lặn), không dùng để kết luận huyết thống. Muốn biết chính xác, cần xét nghiệm máu.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Bảng di truyền ABO: khóa là cặp bố/mẹ đã sắp xếp, giá trị là tỉ lệ % từng nhóm.
  const ABO = {
    'A+A': { A: 75, O: 25 },
    'A+AB': { A: 50, B: 25, AB: 25 },
    'A+B': { A: 25, B: 25, AB: 25, O: 25 },
    'A+O': { A: 50, O: 50 },
    'AB+AB': { A: 25, B: 25, AB: 50 },
    'AB+B': { A: 25, B: 50, AB: 25 },
    'AB+O': { A: 50, B: 50 },
    'B+B': { B: 75, O: 25 },
    'B+O': { B: 50, O: 50 },
    'O+O': { O: 100 },
  };

  $('nmc-calc').addEventListener('click', () => {
    const dadAbo = $('nmc-dad-abo').value, momAbo = $('nmc-mom-abo').value;
    const dadRh = $('nmc-dad-rh').value, momRh = $('nmc-mom-rh').value;
    const key = [dadAbo, momAbo].sort().join('+');
    const abo = ABO[key] || {};
    // Rh đơn giản: Rh+ có thể là DD hoặc Dd; Rh− là dd.
    let rh;
    if (dadRh === '+' && momRh === '+') rh = { '+': 75, '−': 25 };
    else if (dadRh === '-' && momRh === '-') rh = { '−': 100 };
    else rh = { '+': 50, '−': 50 };

    const rows = [];
    Object.keys(abo).forEach(g => {
      Object.keys(rh).forEach(r => {
        rows.push({ group: g + r, pct: abo[g] * rh[r] / 100 });
      });
    });
    rows.sort((a, b) => b.pct - a.pct);
    const rowsHtml = rows.map(r => `<div class="result-row"><span>Nhóm ${r.group}</span><strong>${(Math.round(r.pct * 10) / 10).toLocaleString('vi-VN')}%</strong></div>`).join('');
    $('nmc-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Bố ${dadAbo}${dadRh === '+' ? '+' : '−'} × Mẹ ${momAbo}${momRh === '+' ? '+' : '−'}</span><strong>Các nhóm máu con có thể có:</strong></div>
      ${rowsHtml}
    </div>`;
  });
}
