// Tính diện tích & thể tích — hình phẳng và khối thường gặp, kèm công thức.
export const meta = {
  id: 'dien-tich-the-tich',
  name: 'Tính diện tích & thể tích hình học',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Tính diện tích hình chữ nhật, tam giác, tròn, thang, thoi và thể tích hình hộp, trụ, cầu, nón, chóp — kèm công thức và từng bước tính.',
  keywords: 'tính diện tích, tính thể tích, diện tích hình tròn, thể tích hình trụ, diện tích hình thang, công thức hình học',
  icon: '📐',
  seoTitle: 'Tính diện tích & thể tích — Hình tròn, tam giác, trụ, cầu, nón',
  seoDesc: 'Tính diện tích và thể tích các hình thường gặp: chữ nhật, tam giác, tròn, thang, hộp, trụ, cầu, nón, chóp. Có công thức và từng bước tính.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs">
      <button type="button" class="tab tab-active" id="dtt-tab-area">Diện tích hình phẳng</button>
      <button type="button" class="tab" id="dtt-tab-vol">Thể tích khối</button>
    </div>
  </div>

  <div id="dtt-pane-area">
    <div class="grid-2">
      <div class="field">
        <label for="dtt-area-shape">Chọn hình</label>
        <select id="dtt-area-shape">
          <option value="rect">Hình chữ nhật</option>
          <option value="square">Hình vuông</option>
          <option value="triangle">Hình tam giác</option>
          <option value="circle">Hình tròn</option>
          <option value="trapezoid">Hình thang</option>
          <option value="parallelogram">Hình bình hành</option>
          <option value="rhombus">Hình thoi</option>
        </select>
      </div>
      <div class="field">
        <label for="dtt-area-unit">Đơn vị đo</label>
        <select id="dtt-area-unit">
          <option value="cm">cm (diện tích: cm²)</option>
          <option value="m">m (diện tích: m²)</option>
        </select>
      </div>
    </div>
    <div id="dtt-area-inputs" class="grid-2"></div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="dtt-area-calc">Tính diện tích</button>
      <button type="button" class="btn btn-ghost" id="dtt-area-example">Điền ví dụ</button>
    </div>
    <div id="dtt-area-out"></div>
  </div>

  <div id="dtt-pane-vol" style="display:none">
    <div class="grid-2">
      <div class="field">
        <label for="dtt-vol-shape">Chọn khối</label>
        <select id="dtt-vol-shape">
          <option value="box">Hình hộp chữ nhật</option>
          <option value="cube">Hình lập phương</option>
          <option value="cylinder">Hình trụ</option>
          <option value="sphere">Hình cầu</option>
          <option value="cone">Hình nón</option>
          <option value="pyramid">Hình chóp (đáy vuông)</option>
        </select>
      </div>
      <div class="field">
        <label for="dtt-vol-unit">Đơn vị đo</label>
        <select id="dtt-vol-unit">
          <option value="cm">cm (thể tích: cm³)</option>
          <option value="m">m (thể tích: m³)</option>
        </select>
      </div>
    </div>
    <div id="dtt-vol-inputs" class="grid-2"></div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="dtt-vol-calc">Tính thể tích</button>
      <button type="button" class="btn btn-ghost" id="dtt-vol-example">Điền ví dụ</button>
    </div>
    <div id="dtt-vol-out"></div>
  </div>
  <p class="note">π lấy ≈ 3,14159. Hình chóp ở đây là chóp có đáy hình vuông; chóp đáy khác thì tính diện tích đáy trước rồi dùng V = ⅓ × S<sub>đáy</sub> × chiều cao.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtNum = U.fmtNum || (n => n.toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { const o = el.closest('div').parentElement.querySelector('[id$="-out"]'); if (o) o.innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function fmtVal(n) {
    if (!isFinite(n)) return '—';
    const r = Math.round(n * 1000) / 1000;
    return r.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
  }

  // Mỗi hình: nhãn, các ô nhập [id, nhãn], ví dụ, công thức hiển thị, hàm tính.
  const AREA = {
    rect: { label: 'Hình chữ nhật', fields: [['a', 'Chiều dài'], ['b', 'Chiều rộng']], example: { a: '8', b: '5' }, formula: 'S = dài × rộng', solve: v => ({ value: v.a * v.b, steps: 'S = ' + fmtVal(v.a) + ' × ' + fmtVal(v.b) + ' = ' + fmtVal(v.a * v.b) }) },
    square: { label: 'Hình vuông', fields: [['a', 'Cạnh']], example: { a: '6' }, formula: 'S = cạnh × cạnh', solve: v => ({ value: v.a * v.a, steps: 'S = ' + fmtVal(v.a) + ' × ' + fmtVal(v.a) + ' = ' + fmtVal(v.a * v.a) }) },
    triangle: { label: 'Hình tam giác', fields: [['a', 'Đáy'], ['h', 'Chiều cao']], example: { a: '10', h: '6' }, formula: 'S = (đáy × chiều cao) ÷ 2', solve: v => ({ value: v.a * v.h / 2, steps: 'S = (' + fmtVal(v.a) + ' × ' + fmtVal(v.h) + ') ÷ 2 = ' + fmtVal(v.a * v.h / 2) }) },
    circle: { label: 'Hình tròn', fields: [['r', 'Bán kính']], example: { r: '7' }, formula: 'S = π × r²', solve: v => ({ value: Math.PI * v.r * v.r, steps: 'S = 3,14159 × ' + fmtVal(v.r) + '² = ' + fmtVal(Math.PI * v.r * v.r), extra: 'Chu vi: C = 2 × π × r = ' + fmtVal(2 * Math.PI * v.r) }) },
    trapezoid: { label: 'Hình thang', fields: [['a', 'Đáy lớn'], ['b', 'Đáy nhỏ'], ['h', 'Chiều cao']], example: { a: '10', b: '6', h: '4' }, formula: 'S = (đáy lớn + đáy nhỏ) × chiều cao ÷ 2', solve: v => ({ value: (v.a + v.b) * v.h / 2, steps: 'S = (' + fmtVal(v.a) + ' + ' + fmtVal(v.b) + ') × ' + fmtVal(v.h) + ' ÷ 2 = ' + fmtVal((v.a + v.b) * v.h / 2) }) },
    parallelogram: { label: 'Hình bình hành', fields: [['a', 'Đáy'], ['h', 'Chiều cao']], example: { a: '9', h: '5' }, formula: 'S = đáy × chiều cao', solve: v => ({ value: v.a * v.h, steps: 'S = ' + fmtVal(v.a) + ' × ' + fmtVal(v.h) + ' = ' + fmtVal(v.a * v.h) }) },
    rhombus: { label: 'Hình thoi', fields: [['d1', 'Đường chéo 1'], ['d2', 'Đường chéo 2']], example: { d1: '8', d2: '6' }, formula: 'S = (chéo 1 × chéo 2) ÷ 2', solve: v => ({ value: v.d1 * v.d2 / 2, steps: 'S = (' + fmtVal(v.d1) + ' × ' + fmtVal(v.d2) + ') ÷ 2 = ' + fmtVal(v.d1 * v.d2 / 2) }) }
  };
  const VOL = {
    box: { label: 'Hình hộp chữ nhật', fields: [['a', 'Chiều dài'], ['b', 'Chiều rộng'], ['c', 'Chiều cao']], example: { a: '10', b: '6', c: '4' }, formula: 'V = dài × rộng × cao', solve: v => ({ value: v.a * v.b * v.c, steps: 'V = ' + fmtVal(v.a) + ' × ' + fmtVal(v.b) + ' × ' + fmtVal(v.c) + ' = ' + fmtVal(v.a * v.b * v.c) }) },
    cube: { label: 'Hình lập phương', fields: [['a', 'Cạnh']], example: { a: '5' }, formula: 'V = cạnh³', solve: v => ({ value: v.a * v.a * v.a, steps: 'V = ' + fmtVal(v.a) + '³ = ' + fmtVal(v.a * v.a * v.a) }) },
    cylinder: { label: 'Hình trụ', fields: [['r', 'Bán kính đáy'], ['h', 'Chiều cao']], example: { r: '5', h: '12' }, formula: 'V = π × r² × h', solve: v => ({ value: Math.PI * v.r * v.r * v.h, steps: 'V = 3,14159 × ' + fmtVal(v.r) + '² × ' + fmtVal(v.h) + ' = ' + fmtVal(Math.PI * v.r * v.r * v.h) }) },
    sphere: { label: 'Hình cầu', fields: [['r', 'Bán kính']], example: { r: '6' }, formula: 'V = ⁴⁄₃ × π × r³', solve: v => ({ value: 4 / 3 * Math.PI * v.r * v.r * v.r, steps: 'V = ⁴⁄₃ × 3,14159 × ' + fmtVal(v.r) + '³ = ' + fmtVal(4 / 3 * Math.PI * v.r * v.r * v.r) }) },
    cone: { label: 'Hình nón', fields: [['r', 'Bán kính đáy'], ['h', 'Chiều cao']], example: { r: '4', h: '9' }, formula: 'V = ⅓ × π × r² × h', solve: v => ({ value: Math.PI * v.r * v.r * v.h / 3, steps: 'V = ⅓ × 3,14159 × ' + fmtVal(v.r) + '² × ' + fmtVal(v.h) + ' = ' + fmtVal(Math.PI * v.r * v.r * v.h / 3) }) },
    pyramid: { label: 'Hình chóp (đáy vuông)', fields: [['a', 'Cạnh đáy'], ['h', 'Chiều cao']], example: { a: '6', h: '9' }, formula: 'V = ⅓ × cạnh đáy² × chiều cao', solve: v => ({ value: v.a * v.a * v.h / 3, steps: 'V = ⅓ × ' + fmtVal(v.a) + '² × ' + fmtVal(v.h) + ' = ' + fmtVal(v.a * v.a * v.h / 3) }) }
  };

  function renderInputs(kind) {
    const defs = kind === 'area' ? AREA : VOL;
    const shape = $('dtt-' + kind + '-shape').value;
    const def = defs[shape];
    const unit = $('dtt-' + kind + '-unit').value;
    const wrap = $('dtt-' + kind + '-inputs');
    wrap.innerHTML = def.fields.map(f => '<div class="field"><label for="dtt-' + kind + '-' + f[0] + '">' + f[1] + ' (' + unit + ')</label>'
      + '<input id="dtt-' + kind + '-' + f[0] + '" type="text" inputmode="decimal" data-dtt-field="' + f[0] + '" placeholder="VD: ' + (def.example[f[0]] || '') + '"></div>').join('')
      + '<p class="note">Công thức: ' + escHtml(def.formula) + '</p>';
    // Gắn Enter cho các ô mới.
    wrap.querySelectorAll('input').forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(kind); }));
  }

  function calc(kind) {
    clearErrs(root);
    const defs = kind === 'area' ? AREA : VOL;
    const shape = $('dtt-' + kind + '-shape').value;
    const def = defs[shape];
    const unit = $('dtt-' + kind + '-unit').value;
    const out = $('dtt-' + kind + '-out');
    const vals = {};
    for (let i = 0; i < def.fields.length; i++) {
      const fid = def.fields[i][0];
      const label = def.fields[i][1];
      const el = $('dtt-' + kind + '-' + fid);
      const v = parseNum(el.value);
      if (!(v > 0)) {
        markErr(el, 'Ô ' + label + ' chưa đúng — nhập số lớn hơn 0, ví dụ ' + (def.example[fid] || '5') + '.');
        focusEl(el);
        out.innerHTML = '';
        return;
      }
      vals[fid] = v;
    }
    const res = def.solve(vals);
    const unitOut = kind === 'area' ? unit + '²' : unit + '³';
    const word = kind === 'area' ? 'Diện tích' : 'Thể tích';
    const extraRow = res.extra ? '<div class="result-row"><span>Thêm</span><strong>' + escHtml(res.extra) + '</strong></div>' : '';
    const copyText = word + ' ' + def.label + ': ' + fmtVal(res.value) + ' ' + unitOut + ' (' + res.steps + ').';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">${word} ${escHtml(def.label)}</p>
    <div class="result-hero-value">${fmtVal(res.value)} ${unitOut}</div>
    <p class="result-hero-sub">${escHtml(def.formula)}</p>
  </div>
  <div class="result-row"><span>Cách tính</span><strong>${escHtml(res.steps)}</strong></div>
  ${extraRow}
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả">Chép kết quả</button></div>
</div>`;
    bindCopy(out);
  }

  function runCalc(kind) { withBusy($('dtt-' + kind + '-calc'), () => calc(kind)); }
  function fillExample(kind) {
    const defs = kind === 'area' ? AREA : VOL;
    const def = defs[$('dtt-' + kind + '-shape').value];
    def.fields.forEach(f => { const el = $('dtt-' + kind + '-' + f[0]); if (el) el.value = def.example[f[0]]; });
    runCalc(kind);
  }

  ['area', 'vol'].forEach(k => {
    $('dtt-tab-' + k).addEventListener('click', () => {
      ['area', 'vol'].forEach(j => {
        $('dtt-tab-' + j).classList.toggle('tab-active', j === k);
        $('dtt-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
    $('dtt-' + k + '-shape').addEventListener('change', () => { renderInputs(k); $('dtt-' + k + '-out').innerHTML = ''; });
    $('dtt-' + k + '-unit').addEventListener('change', () => { renderInputs(k); $('dtt-' + k + '-out').innerHTML = ''; });
    $('dtt-' + k + '-calc').addEventListener('click', () => runCalc(k));
    $('dtt-' + k + '-example').addEventListener('click', () => fillExample(k));
    renderInputs(k);
  });
}
