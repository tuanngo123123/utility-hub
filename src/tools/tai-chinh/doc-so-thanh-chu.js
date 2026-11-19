// Đọc số thành chữ tiếng Việt — đúng quy tắc lẻ/linh, mươi/mười, mốt/lăm; tới hàng tỷ tỷ.
export const meta = {
  id: 'doc-so-thanh-chu',
  name: 'Đọc số thành chữ tiếng Việt',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Nhập số tiền, đọc thành chữ tiếng Việt đúng quy tắc (lẻ, mươi, mốt, lăm) — dùng viết hóa đơn, hợp đồng, phiếu thu.',
  keywords: 'đọc số thành chữ, số tiền bằng chữ, viết số tiền bằng chữ, đọc số tiền, số thành chữ tiếng việt, viết hóa đơn bằng chữ',
  icon: '🔢',
  seoTitle: 'Đọc số thành chữ tiếng Việt — Số tiền bằng chữ viết hóa đơn',
  seoDesc: 'Chuyển số thành chữ tiếng Việt đúng quy tắc: một trăm hai mươi ba nghìn, lẻ, mốt, lăm. Hỗ trợ tới hàng tỷ tỷ, thêm chữ "đồng" để viết hóa đơn.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔢</span><div><h2>Đọc số thành chữ tiếng Việt</h2><p class="muted">Nhập số tiền, nhận ngay cách đọc đúng quy tắc tiếng Việt — để viết hóa đơn, hợp đồng, phiếu thu.</p></div></div>
  <div class="field"><label for="dstc-num">Nhập số (tối đa 21 chữ số, phần thập phân sau dấu phẩy)</label><input id="dstc-num" type="text" inputmode="decimal" value="123456789" placeholder="Ví dụ: 123456789"></div>
  <div class="field"><label><input type="checkbox" id="dstc-dong" checked> Thêm chữ "đồng" ở cuối (đọc số tiền)</label></div>
  <div class="field"><label>Thử nhanh</label><div>
    <button type="button" class="chip" data-dstc-ex="0">0</button>
    <button type="button" class="chip" data-dstc-ex="5">5</button>
    <button type="button" class="chip" data-dstc-ex="15">15</button>
    <button type="button" class="chip" data-dstc-ex="105">105</button>
    <button type="button" class="chip" data-dstc-ex="1005">1.005</button>
    <button type="button" class="chip" data-dstc-ex="1000005">1.000.005</button>
    <button type="button" class="chip" data-dstc-ex="123456789">123.456.789</button>
    <button type="button" class="chip" data-dstc-ex="1000000000">1 tỉ</button>
  </div></div>
  <button type="button" class="btn btn-primary" id="dstc-go">Đọc thành chữ</button>
  <div id="dstc-out"></div>
  <p class="note">Quy tắc đọc: 21 đọc "hai mươi mốt", 15 đọc "mười lăm", 105 đọc "một trăm lẻ năm", 1.005 đọc "một nghìn không trăm lẻ năm". Phần thập phân đọc từng chữ số sau chữ "phẩy".</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(t) : Promise.reject(new Error('no clipboard')));
  const $ = id => root.querySelector('#' + id);

  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ'];

  function readInt(s) {
    s = s.replace(/^0+/, '');
    if (s === '') return 'không';
    const groups = [];
    while (s.length > 0) { groups.unshift(s.slice(-3)); s = s.slice(0, -3); }
    const n = groups.length;
    const parts = [];
    for (let i = 0; i < n; i++) {
      const v = parseInt(groups[i], 10);
      const unit = UNITS[n - 1 - i];
      const isFirst = i === 0;
      if (v === 0) {
        const hasLater = groups.slice(i + 1).some(g => parseInt(g, 10) > 0);
        if (!isFirst && hasLater) parts.push('không ' + unit);
        continue;
      }
      const h = Math.floor(v / 100), t = Math.floor((v % 100) / 10), u = v % 10;
      const w = [];
      if (h > 0) w.push(DIG[h] + ' trăm');
      else if (!isFirst) w.push('không trăm');
      if (t === 0) {
        if (u > 0 && (h > 0 || !isFirst)) w.push('lẻ');
      } else if (t === 1) w.push('mười');
      else w.push(DIG[t] + ' mươi');
      if (u > 0) {
        if (u === 1 && t > 1) w.push('mốt');
        else if (u === 5 && t > 0) w.push('lăm');
        else w.push(DIG[u]);
      }
      if (unit) w.push(unit);
      parts.push(w.join(' '));
    }
    return parts.join(' ');
  }

  function readNumber(raw) {
    let s = String(raw).replace(/[\s_]/g, '').replace(/\./g, '');
    if (!s) return { error: 'Hãy nhập một con số.' };
    if (/^-/.test(s)) return { error: 'Công cụ này chỉ đọc số dương (số tiền).' };
    const parts = s.split(',');
    if (parts.length > 2) return { error: 'Số không hợp lệ — chỉ được có một dấu phẩy thập phân.' };
    const intPart = parts[0];
    const fracPart = parts[1] || '';
    if (!/^\d+$/.test(intPart)) return { error: 'Phần nguyên chỉ được gồm chữ số 0–9.' };
    if (fracPart && !/^\d+$/.test(fracPart)) return { error: 'Phần thập phân chỉ được gồm chữ số 0–9.' };
    if (intPart.replace(/^0+/, '').length > 21) return { error: 'Số quá lớn — tối đa 21 chữ số (tới hàng tỷ tỷ).' };
    if (fracPart.length > 6) return { error: 'Phần thập phân tối đa 6 chữ số.' };
    let text = readInt(intPart);
    if (fracPart) {
      text += ' phẩy ' + fracPart.split('').map(d => DIG[+d]).join(' ');
    }
    return { text };
  }

  function render() {
    const res = readNumber($('dstc-num').value);
    if (res.error) {
      $('dstc-out').innerHTML = '<p class="error">' + res.error + '</p>';
      return;
    }
    let text = res.text;
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if ($('dstc-dong').checked) text += ' đồng';
    text += '.';
    $('dstc-out').innerHTML = '<div class="result"><div class="result-row"><span>Kết quả</span><strong>' + text + '</strong></div></div>' +
      '<button type="button" class="btn btn-ghost" id="dstc-copy">Chép kết quả</button>';
    $('dstc-copy').addEventListener('click', () => copyText(text).then(() => toast('Đã chép.')).catch(() => toast('Không chép được, hãy chọn và chép tay.')));
  }

  $('dstc-go').addEventListener('click', render);
  $('dstc-dong').addEventListener('change', render);
  $('dstc-num').addEventListener('input', render);
  root.querySelectorAll('[data-dstc-ex]').forEach(b => {
    b.addEventListener('click', () => { $('dstc-num').value = b.getAttribute('data-dstc-ex'); render(); });
  });
  render();
}
