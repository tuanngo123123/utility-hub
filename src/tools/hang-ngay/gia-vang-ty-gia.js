// Giá vàng SJC & tỉ giá trực tiếp — đọc /data/gold.json + /data/fx.json (Action làm mới
// mỗi 30 phút). Nguồn nào lỗi thì hiện rõ "chưa tải được" + giờ thử lại + nút thử lại,
// KHÔNG bịa số.
export const meta = {
  id: 'gia-vang-ty-gia',
  name: 'Giá vàng SJC & tỉ giá trực tiếp',
  category: 'Hằng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Giá vàng miếng SJC, nhẫn SJC, DOJI, PNJ và vàng thế giới; tỉ giá 9 ngoại tệ so với VND kèm ô đổi ngoại tệ nhanh.',
  keywords: 'giá vàng, SJC, DOJI, PNJ, vàng thế giới, tỉ giá, đổi ngoại tệ, USD, EUR',
  icon: '💰',
  seoTitle: 'Giá vàng SJC & tỉ giá trực tiếp hôm nay | Tiện Ích Hub',
  seoDesc: 'Xem giá vàng miếng SJC, nhẫn SJC, DOJI, PNJ, vàng thế giới và tỉ giá USD, EUR, JPY, KRW, CNY, GBP, AUD, SGD, THB so với VND, cập nhật mỗi 30 phút.',
};

export function body() {
  return `
  <div class="tool-panel">
    <div class="tool-head"><h2>💰 Giá vàng SJC &amp; tỉ giá trực tiếp</h2><p class="muted">Giá vàng và tỉ giá làm mới mỗi 30 phút.</p></div>
    <div id="gv-status" class="note">Đang tải dữ liệu…</div>
    <h3>Vàng trong nước (đồng/lượng)</h3>
    <div id="gv-gold"></div>
    <h3>Vàng thế giới</h3>
    <div id="gv-world"></div>
    <h3>Tỉ giá so với VND</h3>
    <div id="gv-fx"></div>
    <h3>Đổi ngoại tệ nhanh</h3>
    <div class="grid-3">
      <div class="field"><label for="gv-amount">Số tiền (ngoại tệ đã chọn)</label><input id="gv-amount" type="number" min="0" step="any" value="100" inputmode="decimal"></div>
      <div class="field"><label for="gv-cur">Ngoại tệ</label><select id="gv-cur">
        <option value="USD">USD — Đô la Mỹ</option>
        <option value="EUR">EUR — Euro</option>
        <option value="JPY">JPY — Yên Nhật</option>
        <option value="KRW">KRW — Won Hàn Quốc</option>
        <option value="CNY">CNY — Nhân dân tệ</option>
        <option value="GBP">GBP — Bảng Anh</option>
        <option value="AUD">AUD — Đô la Úc</option>
        <option value="SGD">SGD — Đô la Singapore</option>
        <option value="THB">THB — Baht Thái</option>
      </select></div>
      <div class="field"><label>&nbsp;</label><button id="gv-convert" class="btn btn-primary" type="button">Đổi sang VND</button></div>
    </div>
    <div id="gv-convert-out" class="result"></div>
    <p class="note">Nguồn: giá vàng vang.today; tỉ giá open.er-api.com. Số liệu chỉ để tham khảo, giá mua bán thực tế theo niêm yết tại cửa hàng/ngân hàng.</p>
  </div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const GOLD_ORDER = ['SJL1L10', 'SJ9999', 'DOHNL', 'DOHCML', 'PQHNVM', 'PQHN24NTT'];
  const FX_LIST = [
    ['USD', 'Đô la Mỹ'], ['EUR', 'Euro'], ['JPY', 'Yên Nhật'], ['KRW', 'Won Hàn Quốc'],
    ['CNY', 'Nhân dân tệ'], ['GBP', 'Bảng Anh'], ['AUD', 'Đô la Úc'], ['SGD', 'Đô la Singapore'], ['THB', 'Baht Thái'],
  ];
  let fxRates = null; // rates gốc USD của er-api
  let fxUpdated = '';

  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return n.toLocaleString('vi-VN', { maximumFractionDigits: n < 100 ? 2 : 0 });
  }
  function fmtTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const p2 = (n) => (n < 10 ? '0' : '') + n;
    return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
  }
  function failBox(el, label, when) {
    el.innerHTML = '<p class="error">' + label + ' chưa tải được. Thử lại lúc ' + when + '.</p>'
      + '<button class="btn btn-ghost" type="button" data-gv-retry="1">Thử lại</button>';
    const b = el.querySelector('[data-gv-retry]');
    if (b) b.addEventListener('click', loadAll);
  }
  function vndPerUnit(code) {
    if (!fxRates || !fxRates.VND || !fxRates[code]) return null;
    return fxRates.VND / fxRates[code];
  }

  function renderGold(j) {
    const box = $('gv-gold');
    const worldBox = $('gv-world');
    if (!j || !Array.isArray(j.items) || j.items.length === 0) {
      failBox(box, 'Giá vàng', new Date().toLocaleTimeString('vi-VN'));
      worldBox.innerHTML = '<p class="error">Vàng thế giới chưa tải được.</p>';
      return;
    }
    const byCode = {};
    j.items.forEach((it) => { byCode[it.code] = it; });
    const rows = GOLD_ORDER.filter((c) => byCode[c]).map((c) => byCode[c]);
    const extra = j.items.filter((it) => GOLD_ORDER.indexOf(it.code) === -1);
    const all = rows.concat(extra);
    let h = '<table class="tbl"><tr><th>Loại vàng</th><th>Mua vào</th><th>Bán ra</th></tr>';
    all.forEach((it) => {
      h += '<tr><td>' + it.name + '</td><td>' + fmt(it.buy) + '</td><td>' + fmt(it.sell) + '</td></tr>';
    });
    h += '</table><p class="muted">Cập nhật: ' + (fmtTime(j.updatedAt) || 'không rõ') + ' — đơn vị đồng/lượng.</p>';
    box.innerHTML = h;
    if (j.world && typeof j.world.priceUsdPerOz === 'number') {
      worldBox.innerHTML = '<div class="result"><div class="result-row"><span>Vàng thế giới (XAU/USD)</span><strong>'
        + fmt(j.world.priceUsdPerOz) + ' USD/oz</strong></div></div>';
    } else {
      worldBox.innerHTML = '<p class="error">Vàng thế giới chưa tải được.</p>';
    }
  }

  function renderFx() {
    const box = $('gv-fx');
    if (!fxRates || !fxRates.VND) {
      failBox(box, 'Tỉ giá', new Date().toLocaleTimeString('vi-VN'));
      return;
    }
    let h = '<table class="tbl"><tr><th>Ngoại tệ</th><th>1 đơn vị = VND</th></tr>';
    FX_LIST.forEach(([code, name]) => {
      const v = vndPerUnit(code);
      h += '<tr><td><strong>' + code + '</strong> — ' + name + '</td><td>' + (v === null ? '—' : fmt(v)) + '</td></tr>';
    });
    h += '</table><p class="muted">Cập nhật: ' + (fmtTime(fxUpdated) || 'không rõ') + '. Tỉ giá tính từ bảng USD của open.er-api.com.</p>';
    box.innerHTML = h;
  }

  async function loadGold() {
    try {
      const r = await fetch('/data/gold.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      renderGold(await r.json());
    } catch (e) {
      renderGold(null);
    }
  }

  async function loadFx() {
    // Chỉ đọc /data/fx.json (snapshot do Action làm mới mỗi 30 phút).
    try {
      const r = await fetch('/data/fx.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (!j.rates || !j.rates.VND) throw new Error('bản lưu trống');
      fxRates = j.rates;
      fxUpdated = j.updatedAt || '';
      renderFx();
    } catch (e) {
      fxRates = null;
      renderFx();
    }
  }

  async function loadAll() {
    $('gv-status').textContent = 'Đang tải dữ liệu…';
    await Promise.all([loadGold(), loadFx()]);
    const goldOk = $('gv-gold').querySelector('table') !== null;
    const fxOk = $('gv-fx').querySelector('table') !== null;
    $('gv-status').textContent = (goldOk && fxOk)
      ? 'Đã tải xong lúc ' + new Date().toLocaleTimeString('vi-VN') + '.'
      : 'Một số nguồn chưa tải được — bấm "Thử lại" ở từng phần để tải lại.';
  }

  $('gv-convert').addEventListener('click', () => {
    const out = $('gv-convert-out');
    const amt = parseFloat($('gv-amount').value);
    if (!isFinite(amt) || amt < 0) { out.innerHTML = '<p class="error">Nhập số tiền hợp lệ (số không âm).</p>'; return; }
    const code = $('gv-cur').value;
    const rate = vndPerUnit(code);
    if (rate === null) { out.innerHTML = '<p class="error">Chưa có tỉ giá để đổi — bấm "Thử lại" ở bảng tỉ giá rồi đổi lại.</p>'; return; }
    out.innerHTML = '<div class="result-row"><span>' + fmt(amt) + ' ' + code + '</span><strong>' + fmt(amt * rate) + ' VND</strong></div>'
      + '<p class="muted">Theo tỉ giá 1 ' + code + ' = ' + fmt(rate) + ' VND.</p>';
  });

  loadAll();
}
