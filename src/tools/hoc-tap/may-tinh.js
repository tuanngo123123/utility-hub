// Máy tính bỏ túi: 4 phép + % √ x², bộ nhớ M+/M−/MR/MC, bàn phím màn hình + phím thật.
// Không dùng hàm eval — bộ phân tích biểu thức Shunting-yard tự viết.
export const meta = {
  id: 'may-tinh',
  name: 'Máy tính bỏ túi',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Máy tính bỏ túi online: cộng trừ nhân chia, phần trăm, căn bậc hai, bình phương, bộ nhớ M+/M−/MR/MC — bấm trên màn hình hoặc gõ phím thật.',
  keywords: 'máy tính bỏ túi, máy tính online, calculator, tính toán online, căn bậc hai, phần trăm',
  icon: '🧮',
  seoTitle: 'Máy tính bỏ túi online — 4 phép tính, %, √, x² & bộ nhớ',
  seoDesc: 'Máy tính bỏ túi miễn phí: 4 phép tính, phần trăm, căn bậc hai, bình phương, bộ nhớ M+/M−/MR/MC. Bấm trên màn hình hoặc gõ phím thật.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Bấm các nút bên dưới hoặc gõ phím trên bàn phím (Enter = bằng, Esc = xóa, Backspace = xóa 1 ký tự).</p>
  </div>
  <div class="result">
    <div class="result-row"><span>Biểu thức</span><strong id="calc-expr" class="muted"> </strong></div>
    <div class="stat"><div class="stat-num" id="calc-disp">0</div><div class="stat-label">Kết quả <span id="calc-mem"></span></div></div>
  </div>
  <div>
    <button type="button" class="btn" data-calc="mc">MC</button>
    <button type="button" class="btn" data-calc="mr">MR</button>
    <button type="button" class="btn" data-calc="m+">M+</button>
    <button type="button" class="btn" data-calc="m-">M−</button>
  </div>
  <div class="grid-3">
    <button type="button" class="btn" data-calc="sqrt">√</button>
    <button type="button" class="btn" data-calc="sq">x²</button>
    <button type="button" class="btn" data-calc="%">%</button>
    <button type="button" class="btn" data-calc="(">(</button>
    <button type="button" class="btn" data-calc=")">)</button>
    <button type="button" class="btn" data-calc="÷">÷</button>
    <button type="button" class="btn" data-calc="×">×</button>
    <button type="button" class="btn" data-calc="−">−</button>
    <button type="button" class="btn" data-calc="+">+</button>
  </div>
  <div class="grid-3">
    <button type="button" class="btn" data-calc="7">7</button>
    <button type="button" class="btn" data-calc="8">8</button>
    <button type="button" class="btn" data-calc="9">9</button>
    <button type="button" class="btn" data-calc="4">4</button>
    <button type="button" class="btn" data-calc="5">5</button>
    <button type="button" class="btn" data-calc="6">6</button>
    <button type="button" class="btn" data-calc="1">1</button>
    <button type="button" class="btn" data-calc="2">2</button>
    <button type="button" class="btn" data-calc="3">3</button>
    <button type="button" class="btn" data-calc="0">0</button>
    <button type="button" class="btn" data-calc=".">.</button>
    <button type="button" class="btn" data-calc="back">⌫</button>
  </div>
  <div>
    <button type="button" class="btn btn-ghost" data-calc="clear">C — Xóa hết</button>
    <button type="button" class="btn btn-primary" data-calc="=">= Bằng</button>
  </div>
  <p class="note">Thứ tự ưu tiên: ngoặc → % → nhân/chia → cộng/trừ. Nút % nghĩa là "chia cho 100" (ví dụ 50% = 0,5). √ và x² áp dụng cho kết quả của biểu thức hiện tại.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);

  let expr = '';
  let memory = 0;
  let justEvaluated = false;

  // --- Bộ phân tích biểu thức Shunting-yard (không dùng eval) ---
  function tokenize(s) {
    const tokens = [];
    let i = 0;
    let prev = null; // null | 'num' | 'op' | '(' | ')' | '%'
    while (i < s.length) {
      const ch = s[i];
      if (ch === ' ') { i++; continue; }
      if ((ch >= '0' && ch <= '9') || ch === '.') {
        let j = i;
        let dots = 0;
        while (j < s.length && ((s[j] >= '0' && s[j] <= '9') || s[j] === '.')) {
          if (s[j] === '.') dots++;
          j++;
        }
        if (dots > 1) throw new Error('Số có nhiều dấu chấm thập phân.');
        const v = parseFloat(s.slice(i, j));
        if (isNaN(v)) throw new Error('Số không hợp lệ.');
        tokens.push({ t: 'num', v });
        prev = 'num';
        i = j;
        continue;
      }
      if (ch === '(') { tokens.push({ t: '(' }); prev = '('; i++; continue; }
      if (ch === ')') { tokens.push({ t: ')' }); prev = ')'; i++; continue; }
      if (ch === '%') {
        if (prev !== 'num' && prev !== ')') throw new Error('Dấu % phải đứng sau một số.');
        tokens.push({ t: 'op', v: '%' });
        prev = '%';
        i++;
        continue;
      }
      if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
        if (ch === '-' && (prev === null || prev === '(' || prev === 'op')) {
          tokens.push({ t: 'op', v: 'neg' });
        } else if (ch === '+' && (prev === null || prev === '(' || prev === 'op')) {
          // Dấu + ở đầu hoặc sau toán tử: bỏ qua (dương).
        } else {
          tokens.push({ t: 'op', v: ch });
        }
        prev = 'op';
        i++;
        continue;
      }
      throw new Error('Ký tự không hợp lệ: "' + ch + '".');
    }
    return tokens;
  }

  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, '%': 4 };
  const RIGHT_ASSOC = { neg: true };

  function toRPN(tokens) {
    const out = [];
    const stack = [];
    for (const tok of tokens) {
      if (tok.t === 'num') { out.push(tok); continue; }
      if (tok.t === '(') { stack.push(tok); continue; }
      if (tok.t === ')') {
        let found = false;
        while (stack.length) {
          const top = stack.pop();
          if (top.t === '(') { found = true; break; }
          out.push(top);
        }
        if (!found) throw new Error('Thừa dấu đóng ngoặc.');
        continue;
      }
      // Toán tử.
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.t !== 'op') break;
        if (PREC[top.v] > PREC[tok.v] || (PREC[top.v] === PREC[tok.v] && !RIGHT_ASSOC[tok.v])) out.push(stack.pop());
        else break;
      }
      stack.push(tok);
    }
    while (stack.length) {
      const top = stack.pop();
      if (top.t === '(') throw new Error('Thiếu dấu đóng ngoặc.');
      out.push(top);
    }
    return out;
  }

  function evalRPN(rpn) {
    const st = [];
    for (const tok of rpn) {
      if (tok.t === 'num') { st.push(tok.v); continue; }
      if (tok.v === 'neg') {
        if (st.length < 1) throw new Error('Biểu thức chưa đủ số.');
        st.push(-st.pop());
        continue;
      }
      if (tok.v === '%') {
        if (st.length < 1) throw new Error('Biểu thức chưa đủ số.');
        st.push(st.pop() / 100);
        continue;
      }
      if (st.length < 2) throw new Error('Biểu thức chưa đủ số.');
      const b = st.pop();
      const a = st.pop();
      if (tok.v === '+') st.push(a + b);
      else if (tok.v === '-') st.push(a - b);
      else if (tok.v === '*') st.push(a * b);
      else if (tok.v === '/') {
        if (b === 0) throw new Error('Không chia được cho 0.');
        st.push(a / b);
      }
    }
    if (st.length !== 1) throw new Error('Biểu thức chưa hoàn chỉnh.');
    return st[0];
  }

  function evaluate(s) {
    if (!s.trim()) throw new Error('Chưa có biểu thức.');
    return evalRPN(toRPN(tokenize(s)));
  }

  // --- Giao diện ---
  function fmt(n) {
    if (!isFinite(n)) return 'Lỗi';
    const r = Math.round(n * 1e10) / 1e10;
    return String(r).replace('.', ',');
  }

  function refresh() {
    $('calc-expr').textContent = expr === '' ? ' ' : expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
    $('calc-mem').textContent = memory !== 0 ? '· Bộ nhớ: ' + fmt(memory) : '';
  }

  function showError(msg) {
    $('calc-disp').textContent = msg;
  }

  function append(ch) {
    if (justEvaluated && ((ch >= '0' && ch <= '9') || ch === '.' || ch === '(')) {
      expr = '';
      $('calc-disp').textContent = '0';
    }
    justEvaluated = false;
    const last = expr.slice(-1);
    // Không cho 2 toán tử nhị phân liên tiếp (trừ dấu − sau toán tử để nhập số âm).
    if ('+-*/'.includes(ch) && '+-*/'.includes(last) && !(ch === '-' && last !== '-')) {
      expr = expr.slice(0, -1) + ch;
    } else if (ch === '.' && /(?:^|[+\-*/(])[^+\-*/()]*\./.test(expr)) {
      return; // Số hiện tại đã có dấu chấm.
    } else {
      expr += ch;
    }
    refresh();
  }

  function doEquals() {
    try {
      const v = evaluate(expr);
      $('calc-disp').textContent = fmt(v);
      expr = String(Math.round(v * 1e10) / 1e10);
      justEvaluated = true;
      refresh();
    } catch (e) {
      showError(e.message);
    }
  }

  function applyUnary(kind) {
    try {
      const v = evaluate(expr);
      if (kind === 'sqrt') {
        if (v < 0) { showError('Không khai căn được số âm.'); return; }
        const r = Math.sqrt(v);
        expr = String(Math.round(r * 1e10) / 1e10);
        $('calc-disp').textContent = fmt(r);
      } else {
        const r = v * v;
        expr = String(Math.round(r * 1e10) / 1e10);
        $('calc-disp').textContent = fmt(r);
      }
      justEvaluated = true;
      refresh();
    } catch (e) {
      showError(e.message);
    }
  }

  function press(key) {
    if ((key >= '0' && key <= '9') || key === '.') { append(key); return; }
    if (key === '+') { append('+'); return; }
    if (key === '−' || key === '-') { append('-'); return; }
    if (key === '×' || key === '*') { append('*'); return; }
    if (key === '÷' || key === '/') { append('/'); return; }
    if (key === '(' || key === ')') { append(key); return; }
    if (key === '%') { append('%'); return; }
    if (key === '=') { doEquals(); return; }
    if (key === 'clear') { expr = ''; justEvaluated = false; $('calc-disp').textContent = '0'; refresh(); return; }
    if (key === 'back') {
      expr = expr.slice(0, -1);
      justEvaluated = false;
      refresh();
      return;
    }
    if (key === 'sqrt') { applyUnary('sqrt'); return; }
    if (key === 'sq') { applyUnary('sq'); return; }
    if (key === 'mc') { memory = 0; refresh(); return; }
    if (key === 'mr') {
      if (justEvaluated) { expr = ''; justEvaluated = false; }
      expr += String(Math.round(memory * 1e10) / 1e10);
      refresh();
      return;
    }
    if (key === 'm+' || key === 'm-') {
      try {
        const v = evaluate(expr);
        memory += (key === 'm+' ? v : -v);
        memory = Math.round(memory * 1e10) / 1e10;
        $('calc-disp').textContent = fmt(memory);
        refresh();
      } catch (e) {
        showError(e.message);
      }
    }
  }

  root.querySelectorAll('[data-calc]').forEach(btn => {
    btn.addEventListener('click', () => press(btn.getAttribute('data-calc')));
  });

  document.addEventListener('keydown', e => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') { press(e.key); e.preventDefault(); }
    else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '(' || e.key === ')' || e.key === '%') { press(e.key); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === '=') { press('='); e.preventDefault(); }
    else if (e.key === 'Backspace') { press('back'); e.preventDefault(); }
    else if (e.key === 'Escape') { press('clear'); e.preventDefault(); }
  });

  refresh();
}
