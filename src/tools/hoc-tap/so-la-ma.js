// Đổi số 1–3999 ↔ số La Mã hai chiều.
export const meta = {
  id: 'so-la-ma',
  name: 'Đổi số La Mã',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Chuyển đổi hai chiều giữa số Ả Rập (1–3999) và số La Mã, kèm bảng tra cứu số La Mã từ I đến XX.',
  keywords: 'đổi số la mã, số la mã 2026, roman numeral, XIV là số mấy, bảng số la mã',
  icon: '🏛️',
  seoTitle: 'Đổi số La Mã — số Ả Rập ↔ số La Mã 1–3999',
  seoDesc: 'Chuyển đổi số La Mã online hai chiều: số Ả Rập sang La Mã và ngược lại (1–3999), kèm bảng tra I–XX.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="lm-tab-1">Số → La Mã</button>
      <button type="button" class="tab" id="lm-tab-2">La Mã → số</button>
    </div>
  </div>
  <div id="lm-pane-1">
    <div class="grid-2">
      <div class="field">
        <label for="lm-num">Số Ả Rập (1–3999)</label>
        <input id="lm-num" type="number" min="1" max="3999" step="1" value="2026" placeholder="VD: 2026">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="lm-calc-1">Đổi sang số La Mã</button>
    <div id="lm-out-1"></div>
  </div>
  <div id="lm-pane-2" hidden>
    <div class="grid-2">
      <div class="field">
        <label for="lm-roman">Số La Mã</label>
        <input id="lm-roman" type="text" value="XIV" placeholder="VD: XIV">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="lm-calc-2">Đổi sang số Ả Rập</button>
    <div id="lm-out-2"></div>
  </div>
  <table class="tbl">
    <thead><tr><th>Số</th><th>La Mã</th><th>Số</th><th>La Mã</th><th>Số</th><th>La Mã</th><th>Số</th><th>La Mã</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>I</td><td>6</td><td>VI</td><td>11</td><td>XI</td><td>16</td><td>XVI</td></tr>
      <tr><td>2</td><td>II</td><td>7</td><td>VII</td><td>12</td><td>XII</td><td>17</td><td>XVII</td></tr>
      <tr><td>3</td><td>III</td><td>8</td><td>VIII</td><td>13</td><td>XIII</td><td>18</td><td>XVIII</td></tr>
      <tr><td>4</td><td>IV</td><td>9</td><td>IX</td><td>14</td><td>XIV</td><td>19</td><td>XIX</td></tr>
      <tr><td>5</td><td>V</td><td>10</td><td>X</td><td>15</td><td>XV</td><td>20</td><td>XX</td></tr>
    </tbody>
  </table>
  <p class="note">Ký hiệu: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Số La Mã dùng quy tắc trừ: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900. Hệ La Mã cổ điển chỉ biểu diễn được số 1–3999.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  const TABLE = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  const VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const ROMAN_RE = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

  function toRoman(n) {
    let out = '';
    for (const [v, s] of TABLE) {
      while (n >= v) { out += s; n -= v; }
    }
    return out;
  }

  function fromRoman(s) {
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = VALUES[s[i]];
      const next = i + 1 < s.length ? VALUES[s[i + 1]] : 0;
      total += cur < next ? -cur : cur;
    }
    return total;
  }

  function breakdown(n) {
    const parts = [];
    let rest = n;
    for (const [v, s] of TABLE) {
      while (rest >= v) { parts.push(s + ' = ' + v); rest -= v; }
    }
    return parts.join(' + ');
  }

  function calcToRoman() {
    const n = parseInt($('lm-num').value, 10);
    const out = $('lm-out-1');
    if (isNaN(n) || n < 1 || n > 3999) { out.innerHTML = '<p class="error">Vui lòng nhập số nguyên từ 1 đến 3999.</p>'; return; }
    const r = toRoman(n);
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${r}</div><div class="stat-label">${n} viết bằng số La Mã</div></div>
  <div class="result-row"><span>Cách tách</span><strong>${breakdown(n)}</strong></div>
</div>`;
  }

  function calcFromRoman() {
    const s = $('lm-roman').value.trim().toUpperCase();
    const out = $('lm-out-2');
    if (!s || !ROMAN_RE.test(s)) { out.innerHTML = '<p class="error">Số La Mã không hợp lệ. Chỉ dùng các ký tự I, V, X, L, C, D, M theo đúng quy tắc (ví dụ: XIV, MMXXVI).</p>'; return; }
    const n = fromRoman(s);
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${n}</div><div class="stat-label">${s} viết bằng số Ả Rập</div></div>
  <div class="result-row"><span>Kiểm tra ngược</span><strong>${n} → ${toRoman(n)}</strong></div>
</div>`;
  }

  function showTab(n) {
    $('lm-tab-1').classList.toggle('tab-active', n === 1);
    $('lm-tab-2').classList.toggle('tab-active', n === 2);
    $('lm-pane-1').hidden = n !== 1;
    $('lm-pane-2').hidden = n !== 2;
  }

  $('lm-tab-1').addEventListener('click', () => showTab(1));
  $('lm-tab-2').addEventListener('click', () => showTab(2));
  $('lm-calc-1').addEventListener('click', calcToRoman);
  $('lm-calc-2').addEventListener('click', calcFromRoman);
  $('lm-num').addEventListener('keydown', e => { if (e.key === 'Enter') calcToRoman(); });
  $('lm-roman').addEventListener('keydown', e => { if (e.key === 'Enter') calcFromRoman(); });
}
