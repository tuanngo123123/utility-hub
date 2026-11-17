// Tính phân số: cộng trừ nhân chia, rút gọn, dạng thập phân, các bước giải.
export const meta = {
  id: 'phan-so',
  name: 'Tính phân số',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Cộng, trừ, nhân, chia hai phân số — kết quả rút gọn tối giản, dạng thập phân và các bước giải từng bước.',
  keywords: 'tính phân số, cộng phân số, trừ phân số, nhân chia phân số, rút gọn phân số, quy đồng mẫu số',
  icon: '➗',
  seoTitle: 'Tính phân số — cộng trừ nhân chia & rút gọn có bước giải',
  seoDesc: 'Tính phân số online: cộng, trừ, nhân, chia hai phân số với kết quả rút gọn, dạng thập phân và các bước giải chi tiết.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Nhập hai phân số và chọn phép tính để xem kết quả rút gọn, dạng thập phân và các bước giải.</p>
  </div>
  <div class="grid-3">
    <div class="field">
      <label>Phân số 1</label>
      <div class="grid-2">
        <input id="ps-a" type="number" step="1" value="1" placeholder="Tử số" aria-label="Tử số phân số 1">
        <input id="ps-b" type="number" step="1" value="2" placeholder="Mẫu số" aria-label="Mẫu số phân số 1">
      </div>
      <p class="muted">Tử số / mẫu số</p>
    </div>
    <div class="field">
      <label for="ps-op">Phép tính</label>
      <select id="ps-op">
        <option value="+">Cộng (+)</option>
        <option value="-">Trừ (−)</option>
        <option value="*">Nhân (×)</option>
        <option value="/">Chia (÷)</option>
      </select>
    </div>
    <div class="field">
      <label>Phân số 2</label>
      <div class="grid-2">
        <input id="ps-c" type="number" step="1" value="1" placeholder="Tử số" aria-label="Tử số phân số 2">
        <input id="ps-d" type="number" step="1" value="3" placeholder="Mẫu số" aria-label="Mẫu số phân số 2">
      </div>
      <p class="muted">Tử số / mẫu số</p>
    </div>
  </div>
  <button type="button" class="btn btn-primary" id="ps-calc">Tính phân số</button>
  <div id="ps-out"></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b !== 0) { const t = b; b = a % b; a = t; }
    return a || 1;
  }

  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

  function simplify(n, d) {
    const g = gcd(n, d);
    n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    return { n, d };
  }

  function fracStr(n, d) {
    if (d === 1) return String(n);
    return n + '/' + d;
  }

  function f4(n) {
    const s = n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    return s.replace('.', ',');
  }

  function calc() {
    const a = parseInt($('ps-a').value, 10);
    const b = parseInt($('ps-b').value, 10);
    const c = parseInt($('ps-c').value, 10);
    const d = parseInt($('ps-d').value, 10);
    const op = $('ps-op').value;
    const out = $('ps-out');
    if ([a, b, c, d].some(v => isNaN(v))) { out.innerHTML = '<p class="error">Vui lòng nhập đủ tử số và mẫu số của cả hai phân số.</p>'; return; }
    if (b === 0 || d === 0) { out.innerHTML = '<p class="error">Mẫu số không được bằng 0.</p>'; return; }
    if (op === '/' && c === 0) { out.innerHTML = '<p class="error">Không thể chia cho phân số bằng 0.</p>'; return; }

    const f1 = simplify(a, b);
    const f2 = simplify(c, d);
    let rn, rd, steps = '';
    const opSym = op === '+' ? '+' : op === '-' ? '−' : op === '*' ? '×' : '÷';
    if (op === '+' || op === '-') {
      const m = lcm(f1.d, f2.d);
      const n1 = f1.n * (m / f1.d);
      const n2 = f2.n * (m / f2.d);
      const res = op === '+' ? n1 + n2 : n1 - n2;
      steps = '<div class="result-row"><span>Bước 1 — Quy đồng mẫu số ' + m + '</span><strong>' + fracStr(f1.n, f1.d) + ' = ' + fracStr(n1, m) + '; ' + fracStr(f2.n, f2.d) + ' = ' + fracStr(n2, m) + '</strong></div>'
        + '<div class="result-row"><span>Bước 2 — ' + (op === '+' ? 'Cộng' : 'Trừ') + ' tử số, giữ nguyên mẫu số</span><strong>' + fracStr(n1, m) + ' ' + opSym + ' ' + fracStr(n2, m) + ' = ' + fracStr(res, m) + '</strong></div>';
      const s = simplify(res, m);
      rn = s.n; rd = s.d;
      if (s.n !== res || s.d !== m) steps += '<div class="result-row"><span>Bước 3 — Rút gọn</span><strong>' + fracStr(res, m) + ' = ' + fracStr(s.n, s.d) + '</strong></div>';
    } else if (op === '*') {
      const rn0 = f1.n * f2.n;
      const rd0 = f1.d * f2.d;
      steps = '<div class="result-row"><span>Bước 1 — Nhân tử với tử, mẫu với mẫu</span><strong>' + fracStr(f1.n, f1.d) + ' × ' + fracStr(f2.n, f2.d) + ' = ' + fracStr(rn0, rd0) + '</strong></div>';
      const s = simplify(rn0, rd0);
      rn = s.n; rd = s.d;
      if (s.n !== rn0 || s.d !== rd0) steps += '<div class="result-row"><span>Bước 2 — Rút gọn</span><strong>' + fracStr(rn0, rd0) + ' = ' + fracStr(s.n, s.d) + '</strong></div>';
    } else {
      const rn0 = f1.n * f2.d;
      const rd0 = f1.d * f2.n;
      steps = '<div class="result-row"><span>Bước 1 — Nhân với phân số nghịch đảo</span><strong>' + fracStr(f1.n, f1.d) + ' ÷ ' + fracStr(f2.n, f2.d) + ' = ' + fracStr(f1.n, f1.d) + ' × ' + fracStr(f2.d, f2.n) + ' = ' + fracStr(rn0, rd0) + '</strong></div>';
      const s = simplify(rn0, rd0);
      rn = s.n; rd = s.d;
      if (s.n !== rn0 || s.d !== rd0) steps += '<div class="result-row"><span>Bước 2 — Rút gọn</span><strong>' + fracStr(rn0, rd0) + ' = ' + fracStr(s.n, s.d) + '</strong></div>';
    }
    const dec = rn / rd;
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fracStr(rn, rd)}</div><div class="stat-label">${fracStr(f1.n, f1.d)} ${opSym} ${fracStr(f2.n, f2.d)} = ${fracStr(rn, rd)} ≈ ${f4(dec)}</div></div>
  <div class="result-row"><span>Kết quả rút gọn</span><strong>${fracStr(rn, rd)}</strong></div>
  <div class="result-row"><span>Dạng thập phân</span><strong>${f4(dec)}</strong></div>
  ${steps}
</div>`;
  }

  $('ps-calc').addEventListener('click', calc);
  ['ps-a', 'ps-b', 'ps-c', 'ps-d'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
}
