// Bói tình yêu — % hợp nhau xác định từ hàm băm tên (cùng cặp tên luôn ra cùng kết
// quả) + lời nhận xét vui theo khoảng điểm + nút chép/chia sẻ. Chỉ mang tính giải trí.
export const meta = {
  id: 'boi-tinh-yeu',
  name: 'Bói tình yêu',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Bói độ hợp nhau của hai người theo tên (và ngày sinh nếu có): % hợp nhau, lời nhận xét vui, nút chép và chia sẻ kết quả.',
  keywords: 'bói tình yêu, độ hợp nhau, bói tên, tình yêu, cặp đôi',
  icon: '💘',
  seoTitle: 'Bói tình yêu — Xem độ hợp nhau của hai người | Tiện Ích Hub',
  seoDesc: 'Nhập tên hai người để xem % hợp nhau kèm lời nhận xét vui. Kết quả cố định theo tên, có nút chép và chia sẻ.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>💘 Bói tình yêu</h2><p class="muted">Nhập tên hai người — kết quả chỉ để vui, đừng tin quá nhé!</p></div>
    <div class="grid-2">
      <div class="field"><label for="bt-name1">Tên người thứ nhất</label><input id="bt-name1" type="text" maxlength="50" placeholder="VD: Minh Tuấn"></div>
      <div class="field"><label for="bt-name2">Tên người thứ hai</label><input id="bt-name2" type="text" maxlength="50" placeholder="VD: Thu Hương"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label for="bt-dob1">Ngày sinh người 1 (không bắt buộc)</label><input id="bt-dob1" type="date"></div>
      <div class="field"><label for="bt-dob2">Ngày sinh người 2 (không bắt buộc)</label><input id="bt-dob2" type="date"></div>
    </div>
    <button id="bt-go" class="btn btn-primary" type="button">Xem độ hợp nhau</button>
    <div id="bt-out" class="result"></div>
    <p class="note">Chỉ mang tính giải trí. Tình cảm thật do hai người vun đắp, không do con số quyết định.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const MESSAGES = [
    { min: 90, text: 'Trời sinh một cặp! Hai bạn hiểu nhau như đã quen từ kiếp trước — giữ lấy nhau nhé.' },
    { min: 75, text: 'Hợp nhau lắm đấy! Có vài khác biệt nhỏ nhưng chính khác biệt đó làm hai bạn thú vị hơn.' },
    { min: 60, text: 'Khá hợp! Hai bạn có nền tảng tốt — chịu khó lắng nghe nhau một chút là tình cảm càng bền.' },
    { min: 45, text: 'Ở mức vừa phải. Hai bạn cần kiên nhẫn và chia sẻ nhiều hơn để hiểu nhau.' },
    { min: 30, text: 'Hơi khắc một chút — nhưng khắc khẩu cũng là một kiểu duyên. Cười nhiều hơn, giận ít đi nhé!' },
    { min: 0, text: 'Hai bạn là hai thái cực! Nếu vượt qua được khác biệt thì tình cảm sẽ rất đặc biệt đấy.' },
  ];
  let lastShareText = '';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function normalizeName(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z ]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function hearts(pct) {
    const n = Math.max(1, Math.round(pct / 20));
    return '❤️'.repeat(n) + '🤍'.repeat(5 - n);
  }

  function show() {
    const out = $('bt-out');
    const n1 = $('bt-name1').value.trim();
    const n2 = $('bt-name2').value.trim();
    if (!n1 || !n2) { out.innerHTML = '<p class="error">Nhập tên cả hai người rồi bấm xem nhé.</p>'; return; }
    const a = normalizeName(n1);
    const b = normalizeName(n2);
    if (!a || !b) { out.innerHTML = '<p class="error">Tên cần có ít nhất một chữ cái.</p>'; return; }
    // Sắp xếp để "A + B" và "B + A" cho cùng kết quả.
    const pair = [a, b].sort().join('|');
    const dob = [$('bt-dob1').value || '', $('bt-dob2').value || ''].sort().join('|');
    const seed = hashStr(pair + '#' + dob);
    const pct = 35 + (seed % 63); // 35–97%
    const msg = MESSAGES.find((m) => pct >= m.min).text;
    lastShareText = n1 + ' ❤️ ' + n2 + ': ' + pct + '% hợp nhau! ' + msg + ' (Bói vui tại Tiện Ích Hub)';
    out.innerHTML = '<div class="result-row"><span>' + esc(n1) + ' ❤️ ' + esc(n2) + '</span><strong>' + pct + '% hợp nhau</strong></div>'
      + '<p>' + hearts(pct) + '</p>'
      + '<p>' + msg + '</p>'
      + '<button id="bt-copy" class="btn btn-ghost copy-btn" type="button">Chép kết quả</button> '
      + '<button id="bt-share" class="btn btn-ghost" type="button">Chia sẻ</button>'
      + '<p id="bt-msg" class="muted"></p>';
    $('bt-copy').addEventListener('click', async () => {
      const msgEl = $('bt-msg');
      try {
        await navigator.clipboard.writeText(lastShareText);
        msgEl.textContent = 'Đã chép kết quả!';
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = lastShareText;
        root.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); msgEl.textContent = 'Đã chép kết quả!'; }
        catch (e2) { msgEl.textContent = 'Không chép được — hãy chọn và chép tay nhé.'; }
        root.removeChild(ta);
      }
    });
    $('bt-share').addEventListener('click', async () => {
      const msgEl = $('bt-msg');
      if (navigator.share) {
        try { await navigator.share({ title: 'Bói tình yêu', text: lastShareText }); msgEl.textContent = ''; }
        catch (e) { /* người dùng hủy chia sẻ */ }
      } else {
        try { await navigator.clipboard.writeText(lastShareText); msgEl.textContent = 'Máy này không có chia sẻ nhanh — đã chép kết quả để bạn dán!'; }
        catch (e) { msgEl.textContent = 'Không chia sẻ được — hãy chép tay kết quả nhé.'; }
      }
    });
  }

  $('bt-go').addEventListener('click', show);
}
