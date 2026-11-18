// Tính lương Gross ⇄ Net — luật mới 2026 (NĐ 161/2026, NQ 110/2025, Luật 109/2025).
export const meta = {
  id: 'luong-gross-net',
  name: 'Tính lương Gross ⇄ Net',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Đổi lương Gross sang Net và ngược lại theo luật thuế, bảo hiểm mới nhất 2026: bảo hiểm 10,5%, giảm trừ bản thân 15,5 triệu, biểu thuế 5 bậc.',
  keywords: 'lương gross net, tính lương net, thuế thu nhập cá nhân 2026, bảo hiểm xã hội, gross to net',
  icon: '💰',
  seoTitle: 'Tính lương Gross ⇄ Net 2026 — thuế TNCN & bảo hiểm mới nhất',
  seoDesc: 'Tính lương Net từ Gross và ngược lại theo luật 2026: BHXH 8%, BHYT 1,5%, BHTN 1%, giảm trừ 15,5 triệu, biểu thuế TNCN 5 bậc. Miễn phí, tính ngay trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <div class="tabs tabs-fill">
      <button type="button" class="tab tab-active" id="lggn-tab-g2n">Gross → Net</button>
      <button type="button" class="tab" id="lggn-tab-n2g">Net → Gross</button>
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="lggn-salary">Lương <span id="lggn-salary-label">Gross</span> mỗi tháng</label>
      <span class="input-unit"><input id="lggn-salary" type="text" inputmode="decimal" value="30.000.000" placeholder="VD: 30.000.000"><span class="unit">₫</span></span>
    </div>
    <div class="field">
      <label for="lggn-ins">Lương đóng bảo hiểm mỗi tháng</label>
      <span class="input-unit"><input id="lggn-ins" type="text" inputmode="decimal" value="30.000.000" placeholder="Mặc định = lương Gross"><span class="unit">₫</span></span>
      <p class="hint">Để trống hoặc bằng lương Gross nếu công ty đóng bảo hiểm trên toàn bộ lương.</p>
    </div>
    <div class="field">
      <label for="lggn-region">Vùng lương tối thiểu (tính trần BHTN)</label>
      <select id="lggn-region">
        <option value="106200000">Vùng I — trần BHTN 106.200.000₫</option>
        <option value="94600000">Vùng II — trần BHTN 94.600.000₫</option>
        <option value="82800000">Vùng III — trần BHTN 82.800.000₫</option>
        <option value="74000000">Vùng IV — trần BHTN 74.000.000₫</option>
      </select>
    </div>
    <div class="field">
      <label for="lggn-dep">Số người phụ thuộc</label>
      <input id="lggn-dep" type="number" min="0" step="1" value="0">
      <p class="hint">Mỗi người phụ thuộc giảm trừ 6.200.000₫/tháng.</p>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="lggn-calc">Tính lương</button>
    <button type="button" class="btn btn-ghost" id="lggn-example">Điền ví dụ</button>
  </div>
  <div id="lggn-out"></div>
  <p class="note">Căn cứ: NĐ 161/2026/NĐ-CP (trần BHXH/BHYT 50.600.000₫ từ 01/7/2026); NQ 110/2025/UBTVQH15 (giảm trừ bản thân 15.500.000₫, phụ thuộc 6.200.000₫); Luật Thuế TNCN 109/2025/QH15 (biểu thuế 5 bậc: 5% / 10% / 20% / 30% / 35%). Người lao động đóng BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5%.</p>
</div>
<button type="button" class="lggn-sticky" id="lggn-sticky" hidden>
  <span class="lggn-sticky-net" id="lggn-sticky-net"></span>
  <span class="lggn-sticky-gross" id="lggn-sticky-gross"></span>
  <span class="lggn-sticky-hint">Xem chi tiết ↑</span>
</button>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const fmtNum = U.fmtNum || (n => Math.round(n).toLocaleString('vi-VN'));
  const parseNum = U.parseNum || (v => { const n = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; });
  const toast = U.toast || function () {};
  // Trợ giúp trải nghiệm (window.UH) + dự phòng khi UH thiếu.
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('lggn-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const CAP_BHXH = 50600000;
  const DEDUCT_SELF = 15500000;
  const DEDUCT_DEP = 6200000;
  const BRACKETS = [
    { upTo: 10000000, rate: 0.05 },
    { upTo: 30000000, rate: 0.10 },
    { upTo: 60000000, rate: 0.20 },
    { upTo: 100000000, rate: 0.30 },
    { upTo: Infinity, rate: 0.35 },
  ];

  let direction = 'g2n';

  // --- Thanh tóm tắt Net dính ở đáy + tự cuộn kết quả (đợt sửa UX 18/11) ---
  // Thanh hiện khi đã có kết quả mà kết quả đang ngoài màn hình; bấm vào
  // thì cuộn xuống kết quả. Ẩn khi đổi tab, khi lỗi, khi Đặt lại, khi nút
  // "Tính lương" đang trong màn hình (để thanh không đè lên nút khi người
  // dùng cuộn tới chỗ bấm tính), và khi đang nhập vào ô trong công cụ
  // (để thanh không che ô đang gõ).
  let hasStickyResult = false;
  let resultInView = true;
  let calcBtnInView = false;
  let inputFocused = false;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function refreshSticky() {
    const bar = $('lggn-sticky');
    const visible = hasStickyResult && !resultInView && !calcBtnInView && !inputFocused;
    if (bar) bar.hidden = !visible;
    // Đẩy nút Chat AI lên trên thanh khi thanh hiện (đợt sửa UX 19/11):
    // CSS body.uh-netbar-on .aiw nâng nút lên để không đè chữ "Xem chi
    // tiết" — trước đây nút tròn 48px đè lên mép phải của thanh vì nội
    // dung thanh dài hơn chiều rộng thanh chừa lại (right 76px).
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('uh-netbar-on', visible);
      // Chừa khoảng trống dưới trang khi thanh hiện để footer không bị
      // thanh che khi cuộn tận cuối (đợt sửa UX 19/11, Claude bắt): đo từ
      // mép trên của thanh tới đáy màn hình — bằng chiều cao thanh CỘNG
      // khoảng hở dưới thanh (24px desktop, 68px mobile vì thanh ngồi
      // trên nav dưới). Chỉ chừa đúng chiều cao thanh thì chưa đủ: footer
      // vẫn bị che mất đúng khoảng hở đó. Đo bằng máy, không hard-code px
      // vì chiều cao thanh khác nhau theo màn hình; khi thanh ẩn thì trả
      // padding về rỗng để CSS gốc (vd padding-bottom 64px cho nav dưới
      // trên điện thoại) có hiệu lực trở lại.
      let gap = 0;
      if (visible && bar && typeof window !== 'undefined') {
        gap = Math.ceil(window.innerHeight - bar.getBoundingClientRect().top);
      }
      // Nếu người dùng đang ở tận cuối trang mà thanh vừa hiện (vd bấm
      // phím End nhảy xuống đáy khi thanh đang ẩn): padding mới làm trang
      // dài thêm, giữ người dùng ở đáy mới để footer lộ đủ ngay, khỏi
      // phải cuộn thêm một nhịp nữa mới thấy hết footer.
      const de = document.documentElement;
      const wasAtBottom = typeof window !== 'undefined' &&
        (window.scrollY + window.innerHeight >= de.scrollHeight - 2);
      document.body.style.paddingBottom = gap > 0 ? gap + 'px' : '';
      if (gap > 0 && wasAtBottom && typeof window !== 'undefined') {
        window.scrollTo(0, de.scrollHeight);
      }
    }
  }
  function updateSticky(net, gross) {
    $('lggn-sticky-net').textContent = 'Lương Net: ' + fmtVND(net);
    $('lggn-sticky-gross').textContent = 'Gross ' + fmtVND(gross);
    hasStickyResult = true;
    refreshSticky();
  }
  function hideSticky() {
    hasStickyResult = false;
    refreshSticky();
  }
  function scrollToResult() {
    const out = $('lggn-out');
    if (out) out.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function taxByBrackets(taxable) {
    let tax = 0, prev = 0;
    const rows = [];
    for (const b of BRACKETS) {
      if (taxable <= prev) break;
      const part = Math.min(taxable, b.upTo) - prev;
      const t = part * b.rate;
      tax += t;
      rows.push({ label: (prev === 0 ? 'Đến 10 triệu' : 'Trên ' + fmtNum(prev / 1000000) + '–' + (b.upTo === Infinity ? '…' : fmtNum(b.upTo / 1000000) + ' triệu')), rate: b.rate * 100, base: part, tax: t });
      prev = b.upTo;
    }
    return { tax, rows };
  }

  function calcFromGross(gross, insSalary, bhtnCap, deps) {
    const bhxhBase = Math.min(insSalary, CAP_BHXH);
    const bhtnBase = Math.min(insSalary, bhtnCap);
    const bhxh = bhxhBase * 0.08;
    const bhyt = bhxhBase * 0.015;
    const bhtn = bhtnBase * 0.01;
    const insurance = bhxh + bhyt + bhtn;
    const taxable = Math.max(0, gross - insurance - DEDUCT_SELF - deps * DEDUCT_DEP);
    const { tax, rows } = taxByBrackets(taxable);
    const net = gross - insurance - tax;
    return { gross, bhxh, bhyt, bhtn, insurance, taxable, tax, taxRows: rows, net, bhxhBase, bhtnBase };
  }

  function render(r) {
    const taxRows = r.taxRows.length
      ? r.taxRows.map(x => `<tr><td>Thuế bậc ${x.label} (${x.rate}%)</td><td>${fmtVND(x.base)}</td><td>${fmtVND(x.tax)}</td></tr>`).join('')
      : '<tr><td colspan="3">Không phải nộp thuế (thu nhập tính thuế bằng 0).</td></tr>';
    const copyText = 'Lương Gross: ' + fmtVND(r.gross)
      + ' · BHXH 8%: ' + fmtVND(r.bhxh)
      + ' · BHYT 1,5%: ' + fmtVND(r.bhyt)
      + ' · BHTN 1%: ' + fmtVND(r.bhtn)
      + ' · Thuế TNCN: ' + fmtVND(r.tax)
      + ' · Lương Net: ' + fmtVND(r.net);
    $('lggn-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Lương Net thực nhận mỗi tháng</p>
    <div class="result-hero-value">${fmtVND(r.net)}</div>
    <p class="result-hero-sub">Gross ${fmtVND(r.gross)} − bảo hiểm ${fmtVND(r.insurance)} − thuế ${fmtVND(r.tax)}</p>
  </div>
  <div class="result-row"><span>Lương Gross</span><strong>${fmtVND(r.gross)}</strong></div>
  <div class="result-row"><span>BHXH 8% (trên ${fmtVND(r.bhxhBase)})</span><strong>− ${fmtVND(r.bhxh)}</strong></div>
  <div class="result-row"><span>BHYT 1,5% (trên ${fmtVND(r.bhxhBase)})</span><strong>− ${fmtVND(r.bhyt)}</strong></div>
  <div class="result-row"><span>BHTN 1% (trên ${fmtVND(r.bhtnBase)})</span><strong>− ${fmtVND(r.bhtn)}</strong></div>
  <div class="result-row"><span>Tổng bảo hiểm (10,5%)</span><strong>− ${fmtVND(r.insurance)}</strong></div>
  <div class="result-row"><span>Thu nhập tính thuế</span><strong>${fmtVND(r.taxable)}</strong></div>
  <div class="result-row"><span>Thuế TNCN</span><strong>− ${fmtVND(r.tax)}</strong></div>
  <div class="result-row"><span>Lương Net (thực nhận)</span><strong>${fmtVND(r.net)}</strong></div>
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả lương">Chép kết quả</button></div>
</div>
<table class="tbl">
  <thead><tr><th>Khoản thuế theo bậc</th><th>Thu nhập tính thuế</th><th>Tiền thuế</th></tr></thead>
  <tbody>${taxRows}</tbody>
</table>`;
    bindCopy($('lggn-out'));
    updateSticky(r.net, r.gross);
  }

  // silent = true khi tính ngầm lúc gõ: không hiện thông báo "Đã quy đổi"
  // (tránh spam toast mỗi lần gõ ở chiều Net → Gross).
  function calc(silent) {
    clearErrs(root);
    hideSticky();
    const salary = parseNum($('lggn-salary').value);
    const insRaw = $('lggn-ins').value.trim();
    const bhtnCap = parseNum($('lggn-region').value);
    const deps = Math.max(0, parseInt($('lggn-dep').value, 10) || 0);
    const salaryName = direction === 'g2n' ? 'Gross' : 'Net';
    if (!(salary > 0)) {
      markErr($('lggn-salary'), 'Ô Lương ' + salaryName + ' chưa có số — nhập số lớn hơn 0, ví dụ 30.000.000.');
      focusEl($('lggn-salary'));
      $('lggn-out').innerHTML = '';
      return;
    }
    if (insRaw !== '' && !(parseNum(insRaw) > 0)) {
      markErr($('lggn-ins'), 'Ô Lương đóng bảo hiểm chưa đúng — để trống (mặc định bằng lương ' + salaryName + ') hoặc nhập số lớn hơn 0.');
      focusEl($('lggn-ins'));
      $('lggn-out').innerHTML = '';
      return;
    }
    if (direction === 'g2n') {
      const insSalary = insRaw === '' ? salary : parseNum(insRaw);
      render(calcFromGross(salary, insSalary, bhtnCap, deps));
    } else {
      // Net → Gross: lặp nhị phân trên Gross.
      const targetNet = salary;
      let lo = targetNet, hi = targetNet * 2 + 100000000;
      let best = calcFromGross(hi, hi, bhtnCap, deps);
      for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        const insSalary = insRaw === '' ? mid : parseNum(insRaw);
        const r = calcFromGross(mid, insSalary, bhtnCap, deps);
        best = r;
        if (Math.abs(r.net - targetNet) < 500) break;
        if (r.net < targetNet) lo = mid; else hi = mid;
      }
      render(best);
      if (!silent) toast('Đã quy đổi Net → Gross');
    }
  }

  $('lggn-tab-g2n').addEventListener('click', () => {
    direction = 'g2n';
    $('lggn-tab-g2n').classList.add('tab-active');
    $('lggn-tab-n2g').classList.remove('tab-active');
    $('lggn-salary-label').textContent = 'Gross';
    clearErrs(root);
    $('lggn-out').innerHTML = '';
    hideSticky();
  });
  $('lggn-tab-n2g').addEventListener('click', () => {
    direction = 'n2g';
    $('lggn-tab-n2g').classList.add('tab-active');
    $('lggn-tab-g2n').classList.remove('tab-active');
    $('lggn-salary-label').textContent = 'Net';
    clearErrs(root);
    $('lggn-out').innerHTML = '';
    hideSticky();
  });
  // Bấm "Tính lương" xong thì tự cuộn xuống kết quả (trước đây kết quả
  // nằm dưới màn hình trên điện thoại). withBusy chạy bất đồng bộ nên
  // phải cuộn trong callback, sau khi calc() đã render xong.
  function runCalc() {
    withBusy($('lggn-calc'), function () {
      calc();
      if ($('lggn-out').querySelector('.result')) scrollToResult();
    });
  }
  $('lggn-calc').addEventListener('click', runCalc);
  $('lggn-salary').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  $('lggn-ins').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Tự thêm dấu chấm phân cách nghìn khi gõ và khi rời ô (gõ 45000000 →
  // 45.000.000), áp cho cả hai ô tiền để nhất quán.
  function bindMoneyFormat(el) {
    if (!el) return;
    function format() {
      const digits = el.value.replace(/[^\d]/g, '');
      el.value = digits ? fmtNum(parseInt(digits, 10)) : '';
    }
    el.addEventListener('blur', format);
    el.addEventListener('input', () => {
      const pos = el.selectionStart == null ? el.value.length : el.selectionStart;
      const digitsBefore = el.value.slice(0, pos).replace(/[^\d]/g, '').length;
      format();
      let seen = 0, i = 0;
      while (i < el.value.length && seen < digitsBefore) { if (/\d/.test(el.value[i])) seen++; i++; }
      try { el.setSelectionRange(i, i); } catch (e) { /* bỏ qua */ }
    });
  }
  bindMoneyFormat($('lggn-salary'));
  bindMoneyFormat($('lggn-ins'));
  // Ví dụ: lương 45 triệu, 1 người phụ thuộc — thấy rõ cả bảo hiểm lẫn thuế theo bậc.
  $('lggn-example').addEventListener('click', () => {
    fillEx(root, { 'lggn-salary': '45.000.000', 'lggn-ins': '45.000.000', 'lggn-dep': '1' }, $('lggn-calc'));
  });
  // Tính luôn khi gõ (đợt sửa UX 18/11): chỉ tính khi lương đã có số > 0
  // và lương đóng bảo hiểm (nếu có) cũng hợp lệ; chưa hợp lệ thì xóa kết
  // quả lặng lẽ, không hiện lỗi, không cướp focus. Đợi 400ms sau lần gõ
  // cuối để khỏi tính giữa chừng.
  let liveTimer = null;
  function liveCalc() {
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      const salary = parseNum($('lggn-salary').value);
      const insRaw = $('lggn-ins').value.trim();
      if (salary > 0 && (insRaw === '' || parseNum(insRaw) > 0)) calc(true);
      else { $('lggn-out').innerHTML = ''; hideSticky(); }
    }, 400);
  }
  ['lggn-salary', 'lggn-ins', 'lggn-dep'].forEach(function (id) {
    const el = $(id);
    if (el) el.addEventListener('input', liveCalc);
  });
  $('lggn-region').addEventListener('change', liveCalc);
  // Theo dõi kết quả và nút "Tính lương" có trong màn hình không để
  // ẩn/hiện thanh tóm tắt (xem refreshSticky).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      resultInView = entries[0].isIntersecting;
      refreshSticky();
    }, { threshold: 0.1 });
    io.observe($('lggn-out'));
    const ioBtn = new IntersectionObserver(function (entries) {
      calcBtnInView = entries[0].isIntersecting;
      refreshSticky();
    }, { threshold: 0.5 });
    ioBtn.observe($('lggn-calc'));
  } else {
    resultInView = false; // không có IO: hiện thanh khi có kết quả
  }
  $('lggn-sticky').addEventListener('click', scrollToResult);
  // Đổi kích thước màn hình (xoay điện thoại, đổi cỡ cửa sổ) làm chiều
  // cao/khoảng hở của thanh đổi — đo lại khoảng trống dưới trang.
  if (typeof window !== 'undefined') window.addEventListener('resize', refreshSticky);
  // Kéo nốt tới đáy thật sau khi cuộn dừng: khi thanh hiện giữa lúc đang
  // cuộn (vd bấm phím End — trình duyệt cuộn có quán tính ~200ms, thanh
  // hiện giữa chừng nên đích cuộn vẫn là đáy cũ, thiếu đúng khoảng trống
  // vừa thêm), chờ cuộn dừng 150ms rồi kéo nốt tới đáy thật để footer lộ
  // đủ. Chỉ kéo khi thiếu đúng ~chiều cao khoảng trống (người dùng dừng
  // ở đáy cũ); không kéo khi họ chỉ cuộn lên vài px để đọc lại footer.
  let scrollEndTimer = null;
  if (typeof window !== 'undefined') window.addEventListener('scroll', function () {
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(function () {
      const bar = $('lggn-sticky');
      if (!bar || bar.hidden) return;
      const gap = Math.ceil(window.innerHeight - bar.getBoundingClientRect().top);
      const de = document.documentElement;
      const shortfall = (de.scrollHeight - window.innerHeight) - window.scrollY;
      if (shortfall > 0 && Math.abs(shortfall - gap) <= 4) {
        window.scrollTo(0, de.scrollHeight);
      }
    }, 150);
  }, { passive: true });
  // Đang nhập vào ô trong công cụ thì ẩn thanh (đừng che ô đang gõ);
  // rời ô thì hiện lại (nếu kết quả vẫn ngoài màn hình).
  root.addEventListener('focusin', function (e) {
    const t = e.target;
    if (t && t.tagName && /^(input|textarea|select)$/i.test(t.tagName)) {
      inputFocused = true;
      refreshSticky();
    }
  });
  root.addEventListener('focusout', function (e) {
    const t = e.relatedTarget;
    if (t && t.tagName && /^(input|textarea|select)$/i.test(t.tagName)) return;
    inputFocused = false;
    refreshSticky();
  });
  // Nút "Đặt lại" của khung (tool-state.js chèn sau .btn-primary, có thể
  // chèn sau khi init chạy nên phải nghe bằng ủy quyền): ẩn thanh tóm tắt.
  root.addEventListener('click', function (e) {
    const btn = e.target && e.target.closest ? e.target.closest('[data-uh-reset]') : null;
    if (btn) hideSticky();
  });
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  calc();
}
