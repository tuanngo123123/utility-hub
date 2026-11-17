// Giải phương trình bậc 1 (ax+b=0) và bậc 2 (ax²+bx+c=0) kèm các bước giải.
export const meta = {
  id: 'phuong-trinh',
  name: 'Giải phương trình',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Giải phương trình bậc nhất ax+b=0 và phương trình bậc hai ax²+bx+c=0 — hiển thị nghiệm, biệt thức delta và các bước giải chi tiết.',
  keywords: 'giải phương trình bậc 2, giải phương trình bậc 1, delta, nghiệm phương trình, ax2+bx+c=0',
  icon: '📐',
  seoTitle: 'Giải phương trình bậc 1 & bậc 2 — có bước giải chi tiết',
  seoDesc: 'Giải phương trình bậc nhất và bậc hai online: hiển thị nghiệm, biệt thức delta và từng bước giải.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="pt-tab-1">Bậc 1: ax + b = 0</button>
      <button type="button" class="tab" id="pt-tab-2">Bậc 2: ax² + bx + c = 0</button>
    </div>
  </div>
  <div id="pt-pane-1">
    <div class="grid-2">
      <div class="field">
        <label for="pt-a1">Hệ số a</label>
        <input id="pt-a1" type="number" step="any" value="2" placeholder="VD: 2">
      </div>
      <div class="field">
        <label for="pt-b1">Hệ số b</label>
        <input id="pt-b1" type="number" step="any" value="4" placeholder="VD: 4">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="pt-calc-1">Giải phương trình</button>
    <div id="pt-out-1"></div>
  </div>
  <div id="pt-pane-2" hidden>
    <div class="grid-3">
      <div class="field">
        <label for="pt-a2">Hệ số a</label>
        <input id="pt-a2" type="number" step="any" value="1" placeholder="VD: 1">
      </div>
      <div class="field">
        <label for="pt-b2">Hệ số b</label>
        <input id="pt-b2" type="number" step="any" value="-5" placeholder="VD: -5">
      </div>
      <div class="field">
        <label for="pt-c2">Hệ số c</label>
        <input id="pt-c2" type="number" step="any" value="6" placeholder="VD: 6">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="pt-calc-2">Giải phương trình</button>
    <div id="pt-out-2"></div>
  </div>
  <p class="note">Phương trình bậc 2 dùng biệt thức Δ = b² − 4ac: Δ &gt; 0 có 2 nghiệm phân biệt, Δ = 0 có nghiệm kép, Δ &lt; 0 vô nghiệm thực. Công cụ này chỉ giải nghiệm thực.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const num = v => { const n = parseFloat(String(v).trim().replace(',', '.')); return isNaN(n) ? NaN : n; };
  const f = n => {
    const r = Math.round(n * 10000) / 10000;
    return String(r).replace('.', ',');
  };
  const sgn = n => (n < 0 ? '− ' + f(Math.abs(n)) : '+ ' + f(n));

  function solveLinear() {
    const a = num($('pt-a1').value);
    const b = num($('pt-b1').value);
    const out = $('pt-out-1');
    if (isNaN(a) || isNaN(b)) { out.innerHTML = '<p class="error">Vui lòng nhập đủ hệ số a và b.</p>'; return; }
    const eq = f(a) + 'x ' + sgn(b) + ' = 0';
    if (a === 0) {
      out.innerHTML = b === 0
        ? '<div class="result"><div class="result-row"><span>Phương trình</span><strong>' + eq + '</strong></div><div class="result-row"><span>Kết luận</span><strong>Vô số nghiệm — mọi số thực x đều thỏa mãn (0 = 0).</strong></div></div>'
        : '<div class="result"><div class="result-row"><span>Phương trình</span><strong>' + eq + '</strong></div><div class="result-row"><span>Kết luận</span><strong>Vô nghiệm (' + f(b) + ' = 0 là sai).</strong></div></div>';
      return;
    }
    const x = -b / a;
    out.innerHTML = `
<div class="result">
  <div class="result-row"><span>Phương trình</span><strong>${eq}</strong></div>
  <div class="result-row"><span>Bước 1 — Chuyển vế</span><strong>${f(a)}x = ${f(-b)}</strong></div>
  <div class="result-row"><span>Bước 2 — Chia hai vế cho ${f(a)}</span><strong>x = ${f(-b)} ÷ ${f(a)}</strong></div>
  <div class="result-row"><span>Nghiệm</span><strong>x = ${f(x)}</strong></div>
</div>`;
  }

  function solveQuadratic() {
    const a = num($('pt-a2').value);
    const b = num($('pt-b2').value);
    const c = num($('pt-c2').value);
    const out = $('pt-out-2');
    if (isNaN(a) || isNaN(b) || isNaN(c)) { out.innerHTML = '<p class="error">Vui lòng nhập đủ hệ số a, b và c.</p>'; return; }
    const eq = f(a) + 'x² ' + sgn(b) + 'x ' + sgn(c) + ' = 0';
    if (a === 0) {
      out.innerHTML = '<div class="result"><div class="result-row"><span>Phương trình</span><strong>' + eq + '</strong></div><div class="result-row"><span>Lưu ý</span><strong>a = 0 nên đây là phương trình bậc 1: ' + f(b) + 'x ' + sgn(c) + ' = 0. Hãy dùng tab "Bậc 1" để giải.</strong></div></div>';
      return;
    }
    const delta = b * b - 4 * a * c;
    const head = '<div class="result-row"><span>Phương trình</span><strong>' + eq + '</strong></div>'
      + '<div class="result-row"><span>Biệt thức Δ = b² − 4ac</span><strong>Δ = ' + f(b) + '² − 4 × ' + f(a) + ' × ' + f(c) + ' = ' + f(delta) + '</strong></div>';
    if (delta > 0) {
      const sq = Math.sqrt(delta);
      const x1 = (-b + sq) / (2 * a);
      const x2 = (-b - sq) / (2 * a);
      out.innerHTML = '<div class="result">' + head
        + '<div class="result-row"><span>Kết luận</span><strong>Δ &gt; 0 — phương trình có 2 nghiệm phân biệt</strong></div>'
        + '<div class="result-row"><span>Nghiệm x₁ = (−b + √Δ) / 2a</span><strong>x₁ = ' + f(x1) + '</strong></div>'
        + '<div class="result-row"><span>Nghiệm x₂ = (−b − √Δ) / 2a</span><strong>x₂ = ' + f(x2) + '</strong></div></div>';
    } else if (delta === 0) {
      const x = -b / (2 * a);
      out.innerHTML = '<div class="result">' + head
        + '<div class="result-row"><span>Kết luận</span><strong>Δ = 0 — phương trình có nghiệm kép</strong></div>'
        + '<div class="result-row"><span>Nghiệm kép x = −b / 2a</span><strong>x = ' + f(x) + '</strong></div></div>';
    } else {
      out.innerHTML = '<div class="result">' + head
        + '<div class="result-row"><span>Kết luận</span><strong>Δ &lt; 0 — phương trình vô nghiệm thực (chỉ có nghiệm phức).</strong></div></div>';
    }
  }

  function showTab(n) {
    $('pt-tab-1').classList.toggle('tab-active', n === 1);
    $('pt-tab-2').classList.toggle('tab-active', n === 2);
    $('pt-pane-1').hidden = n !== 1;
    $('pt-pane-2').hidden = n !== 2;
  }

  $('pt-tab-1').addEventListener('click', () => showTab(1));
  $('pt-tab-2').addEventListener('click', () => showTab(2));
  $('pt-calc-1').addEventListener('click', solveLinear);
  $('pt-calc-2').addEventListener('click', solveQuadratic);
}
