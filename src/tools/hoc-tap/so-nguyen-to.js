// Kiểm tra số nguyên tố + phân tích thừa số nguyên tố + liệt kê số nguyên tố trong khoảng.
export const meta = {
  id: 'so-nguyen-to',
  name: 'Kiểm tra số nguyên tố',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Kiểm tra một số có phải số nguyên tố không, phân tích thừa số nguyên tố nếu là hợp số, hoặc liệt kê số nguyên tố trong một khoảng.',
  keywords: 'kiểm tra số nguyên tố, phân tích thừa số nguyên tố, số nguyên tố là gì, liệt kê số nguyên tố, 97 có phải số nguyên tố',
  icon: '🔢',
  seoTitle: 'Kiểm tra số nguyên tố & phân tích thừa số nguyên tố',
  seoDesc: 'Kiểm tra số nguyên tố online: nhập một số để biết có phải số nguyên tố không, xem phân tích thừa số, hoặc liệt kê số nguyên tố trong khoảng.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="snt-tab-1">Kiểm tra 1 số</button>
      <button type="button" class="tab" id="snt-tab-2">Liệt kê trong khoảng</button>
    </div>
  </div>
  <div id="snt-pane-1">
    <div class="grid-2">
      <div class="field">
        <label for="snt-n">Nhập một số nguyên</label>
        <input id="snt-n" type="number" step="1" value="97" placeholder="VD: 97">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="snt-calc-1">Kiểm tra</button>
    <div id="snt-out-1"></div>
  </div>
  <div id="snt-pane-2" hidden>
    <div class="grid-2">
      <div class="field">
        <label for="snt-from">Từ số</label>
        <input id="snt-from" type="number" step="1" value="1" placeholder="VD: 1">
      </div>
      <div class="field">
        <label for="snt-to">Đến số</label>
        <input id="snt-to" type="number" step="1" value="100" placeholder="VD: 100">
      </div>
    </div>
    <button type="button" class="btn btn-primary" id="snt-calc-2">Liệt kê số nguyên tố</button>
    <div id="snt-out-2"></div>
  </div>
  <p class="note">Số nguyên tố là số nguyên lớn hơn 1 chỉ chia hết cho 1 và chính nó. Số 2 là số nguyên tố chẵn duy nhất; 1 không phải số nguyên tố cũng không phải hợp số. Danh sách hiển thị tối đa 10.000 số nguyên tố.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const $ = id => root.querySelector('#' + id);
  const SUPER = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const sup = n => String(n).split('').map(c => SUPER[c] || c).join('');

  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2 || n === 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  function factorize(n) {
    const factors = [];
    let rest = n;
    for (let p = 2; p * p <= rest; p += (p === 2 ? 1 : 2)) {
      if (rest % p !== 0) continue;
      let count = 0;
      while (rest % p === 0) { rest /= p; count++; }
      factors.push({ p, count });
    }
    if (rest > 1) factors.push({ p: rest, count: 1 });
    return factors;
  }

  function checkOne() {
    const n = parseInt($('snt-n').value, 10);
    const out = $('snt-out-1');
    if (isNaN(n)) { out.innerHTML = '<p class="error">Vui lòng nhập một số nguyên.</p>'; return; }
    if (n < 0) { out.innerHTML = '<p class="error">Số âm không được xét là số nguyên tố. Vui lòng nhập số nguyên không âm.</p>'; return; }
    if (n > 1000000000000) { out.innerHTML = '<p class="error">Số quá lớn — vui lòng nhập số nhỏ hơn 1.000.000.000.000 (10¹²).</p>'; return; }
    if (n < 2) {
      out.innerHTML = '<div class="result"><div class="result-row"><span>Kết quả</span><strong>' + n + ' không phải số nguyên tố (số nguyên tố phải lớn hơn 1).</strong></div></div>';
      return;
    }
    if (isPrime(n)) {
      out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtNum(n)} là số nguyên tố ✓</div><div class="stat-label">${fmtNum(n)} chỉ chia hết cho 1 và chính nó</div></div>
</div>`;
      return;
    }
    const factors = factorize(n);
    const expr = factors.map(f => f.count === 1 ? String(f.p) : f.p + sup(f.count)).join(' × ');
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtNum(n)} là hợp số</div><div class="stat-label">${fmtNum(n)} chia hết cho ${factors.map(f => f.p).join(', ')} (ngoài 1 và chính nó)</div></div>
  <div class="result-row"><span>Phân tích thừa số nguyên tố</span><strong>${fmtNum(n)} = ${expr}</strong></div>
</div>`;
  }

  function listRange() {
    const from = parseInt($('snt-from').value, 10);
    const to = parseInt($('snt-to').value, 10);
    const out = $('snt-out-2');
    if (isNaN(from) || isNaN(to)) { out.innerHTML = '<p class="error">Vui lòng nhập đủ hai đầu của khoảng.</p>'; return; }
    if (to < 2) { out.innerHTML = '<p class="error">Khoảng phải chứa số từ 2 trở lên mới có số nguyên tố.</p>'; return; }
    if (from > to) { out.innerHTML = '<p class="error">Số bắt đầu phải nhỏ hơn hoặc bằng số kết thúc.</p>'; return; }
    if (to > 10000000) { out.innerHTML = '<p class="error">Để trang chạy nhanh, giới hạn đến tối đa là 10.000.000.</p>'; return; }
    // Sàng Eratosthenes.
    const sieve = new Uint8Array(to + 1);
    sieve.fill(1);
    sieve[0] = 0;
    if (to >= 1) sieve[1] = 0;
    for (let i = 2; i * i <= to; i++) {
      if (!sieve[i]) continue;
      for (let j = i * i; j <= to; j += i) sieve[j] = 0;
    }
    const primes = [];
    for (let i = Math.max(2, from); i <= to; i++) {
      if (sieve[i]) primes.push(i);
    }
    const shown = primes.slice(0, 10000);
    const truncated = primes.length > 10000;
    out.innerHTML = `
<div class="result">
  <div class="stat"><div class="stat-num">${fmtNum(primes.length)} số</div><div class="stat-label">Số nguyên tố trong khoảng ${fmtNum(Math.max(2, from))} – ${fmtNum(to)}${truncated ? ' (hiển thị 10.000 số đầu tiên)' : ''}</div></div>
</div>
<p>${shown.join(', ')}</p>`;
  }

  function showTab(n) {
    $('snt-tab-1').classList.toggle('tab-active', n === 1);
    $('snt-tab-2').classList.toggle('tab-active', n === 2);
    $('snt-pane-1').hidden = n !== 1;
    $('snt-pane-2').hidden = n !== 2;
  }

  $('snt-tab-1').addEventListener('click', () => showTab(1));
  $('snt-tab-2').addEventListener('click', () => showTab(2));
  $('snt-calc-1').addEventListener('click', checkOne);
  $('snt-calc-2').addEventListener('click', listRange);
  $('snt-n').addEventListener('keydown', e => { if (e.key === 'Enter') checkOne(); });
}
