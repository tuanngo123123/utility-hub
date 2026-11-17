// Kết quả xổ số 3 miền — đọc /data/lottery.json (Action cập nhật từ RSS xskt.com.vn).
// Hiện 3 ngày gần nhất, từng đài, dò nhanh 2 số cuối. CHỈ tra kết quả — không dự đoán, không soi cầu.
export const meta = {
  id: 'ket-qua-xo-so',
  name: 'Kết quả xổ số 3 miền',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Tra kết quả xổ số miền Bắc, miền Trung, miền Nam 3 ngày gần nhất, dò nhanh 2 số cuối. Chỉ tra kết quả — không dự đoán, không soi cầu.',
  keywords: 'xổ số, kết quả xổ số, XSMB, XSMN, XSMT, dò số, xổ số miền Bắc, xổ số miền Nam',
  icon: '🎲',
  seoTitle: 'Kết quả xổ số 3 miền hôm nay | Tiện Ích Hub',
  seoDesc: 'Tra kết quả xổ số miền Bắc, miền Trung, miền Nam 3 ngày gần nhất, dò nhanh 2 số cuối trong các giải.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>🎲 Kết quả xổ số 3 miền</h2><p class="muted">CHỈ tra kết quả — không dự đoán, không soi cầu. Dữ liệu làm mới 2 lần/ngày.</p></div>
    <div class="tabs">
      <button id="xs-tab-bac" class="tab tab-active" type="button">Miền Bắc</button>
      <button id="xs-tab-trung" class="tab" type="button">Miền Trung</button>
      <button id="xs-tab-nam" class="tab" type="button">Miền Nam</button>
    </div>
    <div class="grid-2">
      <div class="field"><label for="xs-two">Dò nhanh 2 số cuối</label><input id="xs-two" type="text" inputmode="numeric" maxlength="2" placeholder="VD: 47"></div>
      <div class="field"><label>&nbsp;</label><button id="xs-clear" class="btn btn-ghost" type="button">Xóa dò số</button></div>
    </div>
    <div id="xs-out"></div>
    <p class="note">Nguồn: xskt.com.vn. Kết quả chỉ để tham khảo — đối chiếu với vé số và đài phát hành khi lĩnh thưởng.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const REGIONS = { bac: 'Miền Bắc', trung: 'Miền Trung', nam: 'Miền Nam' };
  const PRIZE_LABELS = [['db', 'Đặc biệt'], ['g1', 'Giải 1'], ['g2', 'Giải 2'], ['g3', 'Giải 3'], ['g4', 'Giải 4'], ['g5', 'Giải 5'], ['g6', 'Giải 6'], ['g7', 'Giải 7'], ['g8', 'Giải 8']];
  let data = null;
  let region = 'bac';
  let two = '';

  function fmtDate(iso) {
    const parts = String(iso || '').split('-');
    if (parts.length !== 3) return iso || '';
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function fmtTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render() {
    const box = $('xs-out');
    if (!data || !data.regions || !Array.isArray(data.regions[region]) || data.regions[region].length === 0) {
      box.innerHTML = '<p class="error">Chưa có dữ liệu xổ số ' + REGIONS[region] + ' — thử tải lại trang sau ít phút.</p>'
        + '<button class="btn btn-ghost" type="button" id="xs-retry">Thử lại</button>';
      const b = $('xs-retry');
      if (b) b.addEventListener('click', load);
      return;
    }
    let h = '<p class="muted">Cập nhật: ' + (fmtTime(data.updatedAt) || 'không rõ') + '.</p>';
    data.regions[region].forEach((day) => {
      h += '<h3>Ngày ' + fmtDate(day.date) + (day.weekday ? ' (' + esc(day.weekday) + ')' : '') + '</h3>';
      day.stations.forEach((st) => {
        if (st.name) h += '<p><strong>' + esc(st.name) + '</strong></p>';
        h += '<table class="tbl">';
        PRIZE_LABELS.forEach(([key, label]) => {
          const nums = st.prizes[key];
          if (!nums || !nums.length) return;
          const cells = nums.map((n) => {
            const hit = two.length === 2 && String(n).slice(-2) === two;
            return hit ? '<span class="chip">' + esc(n) + '</span>' : esc(n);
          }).join(' &nbsp; ');
          h += '<tr><td>' + label + '</td><td>' + cells + '</td></tr>';
        });
        h += '</table>';
      });
      if (day.link) h += '<p class="muted"><a href="' + esc(day.link) + '" target="_blank" rel="noopener">Xem trên xskt.com.vn</a></p>';
    });
    if (two.length === 2) h += '<p class="note">Số <strong>' + esc(two) + '</strong> được tô sáng ở các giải có 2 số cuối trùng khớp.</p>';
    box.innerHTML = h;
  }

  function setRegion(r) {
    region = r;
    ['bac', 'trung', 'nam'].forEach((k) => {
      $('xs-tab-' + k).className = 'tab' + (k === r ? ' tab-active' : '');
    });
    render();
  }

  async function load() {
    const box = $('xs-out');
    box.innerHTML = '<p class="note">Đang tải kết quả…</p>';
    try {
      const res = await fetch('/data/lottery.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (e) {
      data = null;
    }
    render();
  }

  $('xs-tab-bac').addEventListener('click', () => setRegion('bac'));
  $('xs-tab-trung').addEventListener('click', () => setRegion('trung'));
  $('xs-tab-nam').addEventListener('click', () => setRegion('nam'));
  $('xs-two').addEventListener('input', () => {
    two = $('xs-two').value.replace(/[^0-9]/g, '').slice(0, 2);
    $('xs-two').value = two;
    render();
  });
  $('xs-clear').addEventListener('click', () => { two = ''; $('xs-two').value = ''; render(); });
  load();
}
