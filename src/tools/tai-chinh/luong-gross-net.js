// Tính lương Gross ⇄ Net — luật mới 2026 (NĐ 161/2026, NQ 110/2025, Luật 109/2025).
// Bố cục MẪU 2 (trang công cụ chuẩn, Claude gửi 01:48 19/11/2026): 2 thẻ
// cạnh nhau — trái nhập, phải kết quả dính khi cuộn; không còn nút Tính
// lương / Đặt lại / Điền ví dụ (mở trang đã tính sẵn 30.000.000).
// Công thức giữ nguyên tuyệt đối — chỉ đổi bố cục.
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
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="m2-toggle" role="group" aria-label="Chiều đổi lương">
          <button type="button" class="m2-toggle-btn m2-toggle-active" id="lggn-tab-g2n">Gross → Net</button>
          <button type="button" class="m2-toggle-btn" id="lggn-tab-n2g">Net → Gross</button>
        </div>
        <div class="field m2-field">
          <label for="lggn-salary">Lương <span id="lggn-salary-label">Gross</span> mỗi tháng</label>
          <span class="input-unit"><input id="lggn-salary" class="m2-salary" type="text" inputmode="decimal" value="30.000.000" placeholder="VD: 30.000.000"><span class="unit">₫</span></span>
        </div>
        <div class="m2-quick" aria-label="Chọn nhanh mức lương">
          <button type="button" class="m2-quick-btn" data-lggn-quick="10000000">10 triệu</button>
          <button type="button" class="m2-quick-btn" data-lggn-quick="15000000">15 triệu</button>
          <button type="button" class="m2-quick-btn" data-lggn-quick="20000000">20 triệu</button>
          <button type="button" class="m2-quick-btn" data-lggn-quick="30000000">30 triệu</button>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="lggn-region">Vùng lương tối thiểu</label>
            <select id="lggn-region" class="m2-select">
              <option value="106200000">Vùng I</option>
              <option value="94600000">Vùng II</option>
              <option value="82800000">Vùng III</option>
              <option value="74000000">Vùng IV</option>
            </select>
            <p class="hint" id="lggn-region-hint">Trần đóng BHTN vùng này: 106.200.000₫/tháng.</p>
          </div>
          <div class="field m2-field">
            <label id="lggn-dep-label">Người phụ thuộc</label>
            <div class="m2-stepper" role="group" aria-labelledby="lggn-dep-label">
              <button type="button" class="m2-step-btn" id="lggn-dep-minus" aria-label="Giảm một người phụ thuộc">−</button>
              <input id="lggn-dep" class="m2-step-num" type="text" inputmode="none" readonly value="0" aria-label="Số người phụ thuộc">
              <button type="button" class="m2-step-btn" id="lggn-dep-plus" aria-label="Thêm một người phụ thuộc">+</button>
            </div>
            <p class="hint">Giảm trừ 6.200.000₫/người/tháng.</p>
          </div>
        </div>
        <div class="field m2-field">
          <label for="lggn-ins">Lương đóng bảo hiểm <span class="m2-optional">(không bắt buộc)</span></label>
          <span class="input-unit"><input id="lggn-ins" class="m2-money" type="text" inputmode="decimal" value="" placeholder="Bằng lương Gross"><span class="unit">₫</span></span>
          <p class="hint">Để trống nếu công ty đóng bảo hiểm trên toàn bộ lương.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="lggn-result-card">
      <div id="lggn-out"></div>
    </div>
  </div>
  <p class="note">Căn cứ: NĐ 161/2026/NĐ-CP (trần BHXH/BHYT 50.600.000₫ từ 01/7/2026); NQ 110/2025/UBTVQH15 (giảm trừ bản thân 15.500.000₫, phụ thuộc 6.200.000₫); Luật Thuế TNCN 109/2025/QH15 (biểu thuế 5 bậc: 5% / 10% / 20% / 30% / 35%). Người lao động đóng BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5%.</p>
</div>
<div class="lggn-sticky" id="lggn-sticky" hidden>
  <span class="lggn-sticky-net" id="lggn-sticky-net"></span>
  <button type="button" class="lggn-sticky-btn" id="lggn-sticky-copy">Chép</button>
  <button type="button" class="lggn-sticky-btn lggn-sticky-btn-primary" id="lggn-sticky-detail">Chi tiết</button>
</div>`;
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

  // --- Công thức (giữ nguyên tuyệt đối, đã kiểm chứng) ---
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
  const REGION_CAPS = {
    '106200000': '106.200.000₫',
    '94600000': '94.600.000₫',
    '82800000': '82.800.000₫',
    '74000000': '74.000.000₫',
  };

  let direction = 'g2n';
  let lastResult = null;
  let lastCopyText = '';
  let stepsOpen = false;

  // --- Thanh tóm tắt Net dính ở đáy (đợt sửa UX 18/11 + MẪU 2) ---
  // Thanh hiện khi đã có kết quả mà thẻ kết quả đã cuộn khuất; gồm số
  // Net + nút Chép + nút Chi tiết (cuộn lên kết quả). Ẩn khi lỗi, khi
  // đang nhập vào ô trong công cụ (để thanh không che ô đang gõ).
  let hasStickyResult = false;
  let resultInView = true;
  let inputFocused = false;
  // Trang dài thêm bao nhiêu khi thanh hiện (đo thật — trên điện thoại
  // padding mới 130px THAY padding 64px của nav dưới nên trang chỉ dài
  // thêm 66px, không phải 130px; dùng số này cho nhịp kéo nốt ở dưới).
  let lastBarGrowth = 0;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function refreshSticky() {
    const bar = $('lggn-sticky');
    const visible = hasStickyResult && !resultInView && !inputFocused;
    if (bar) bar.hidden = !visible;
    // Đẩy nút Chat AI lên trên thanh khi thanh hiện (đợt sửa UX 19/11):
    // CSS body.uh-netbar-on .aiw nâng nút lên để không đè lên thanh.
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
      // phải cuộn thêm một nhịp nữa mới thấy hết footer. Dung sai 10px
      // (không phải 2px): nhịp cuộn mượt tới kết quả có thể còn dư vài
      // px khi người dùng nhảy xuống đáy, thiếu 3px cũng đủ làm lỡ nhịp.
      const de = document.documentElement;
      const wasAtBottom = typeof window !== 'undefined' &&
        (window.scrollY + window.innerHeight >= de.scrollHeight - 10);
      const newPad = gap > 0 ? gap + 'px' : '';
      if (document.body.style.paddingBottom !== newPad) {
        const oldH = de.scrollHeight;
        document.body.style.paddingBottom = newPad;
        lastBarGrowth = Math.max(0, de.scrollHeight - oldH);
      }
      if (gap > 0 && wasAtBottom && typeof window !== 'undefined') {
        window.scrollTo(0, de.scrollHeight);
      }
    }
  }
  function updateSticky(label, value) {
    $('lggn-sticky-net').textContent = label + ' ' + fmtVND(value);
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
    return { gross, bhxh, bhyt, bhtn, insurance, taxable, tax, taxRows: rows, net, bhxhBase, bhtnBase, insSalary, deps };
  }

  function pctOfGross(r) {
    if (!(r.gross > 0)) return '';
    return (r.net / r.gross * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  // 6 bước tính — mọi số lấy từ kết quả thật (r), không hard-code.
  // Khoảng trắng trước ₫ trong dòng phụ dùng khoảng trắng không ngắt
  // (\u00A0) để "450.000 ₫" không bị tách đôi khi xuống dòng.
  function stepsRows(r) {
    const depAmount = r.deps * DEDUCT_DEP;
    const nb = s => s.replace(/ ₫/g, ' ₫');
    const taxDetail = r.taxRows.length
      ? r.taxRows.map(x => nb(fmtVND(x.base)) + ' × ' + x.rate + '% = ' + nb(fmtVND(x.tax))).join('; ')
      : 'Thu nhập tính thuế bằng 0 nên không phải nộp thuế.';
    let insSub = 'BHXH ' + nb(fmtVND(r.bhxh)) + ' · BHYT ' + nb(fmtVND(r.bhyt)) + ' · BHTN ' + nb(fmtVND(r.bhtn));
    if (r.bhxhBase < r.insSalary) insSub += ' · BHXH/BHYT tính trên trần 50.600.000₫';
    if (r.bhtnBase < r.insSalary) insSub += ' · BHTN tính trên trần vùng ' + nb(fmtVND(r.bhtnBase));
    return [
      { label: 'Lương Gross', sub: '', amount: fmtVND(r.gross) },
      { label: 'Bảo hiểm (BHXH 8% + BHYT 1,5% + BHTN 1%)', sub: insSub, amount: '− ' + fmtVND(r.insurance) },
      { label: 'Giảm trừ bản thân', sub: '', amount: '− ' + fmtVND(DEDUCT_SELF) },
      { label: 'Giảm trừ ' + r.deps + ' người phụ thuộc', sub: '6.200.000₫/người/tháng', amount: '− ' + fmtVND(depAmount) },
      { label: 'Thu nhập tính thuế ' + fmtVND(r.taxable) + ' → thuế TNCN', sub: taxDetail, amount: '− ' + fmtVND(r.tax) },
      { label: 'Lương Net thực nhận', sub: '', amount: fmtVND(r.net) },
    ];
  }

  function render(r) {
    lastResult = r;
    lastCopyText = 'Lương Gross: ' + fmtVND(r.gross)
      + ' · BHXH 8%: ' + fmtVND(r.bhxh)
      + ' · BHYT 1,5%: ' + fmtVND(r.bhyt)
      + ' · BHTN 1%: ' + fmtVND(r.bhtn)
      + ' · Thuế TNCN: ' + fmtVND(r.tax)
      + ' · Lương Net: ' + fmtVND(r.net);
    const heroLabel = direction === 'g2n' ? 'Lương thực nhận (Net)' : 'Lương Gross tương ứng';
    const heroValue = direction === 'g2n' ? r.net : r.gross;
    const pct = pctOfGross(r);
    const pctLine = direction === 'g2n'
      ? 'Bằng ' + pct + '% lương Gross'
      : 'Lương Net bằng ' + pct + '% lương Gross';
    const steps = stepsRows(r).map((s, i) => `<tr><td class="m2-steps-no">${i + 1}</td><td>${s.label}${s.sub ? `<small>${s.sub}</small>` : ''}</td><td>${s.amount}</td></tr>`).join('');
    $('lggn-out').innerHTML = `
<div class="result m2-result">
  <p class="m2-result-label">${heroLabel}</p>
  <div class="m2-result-value">${fmtVND(heroValue)}</div>
  <p class="m2-result-pct">${pctLine}</p>
  <div class="m2-result-rows">
    <div class="result-row"><span>Bảo hiểm (10,5%)</span><strong>− ${fmtVND(r.insurance)}</strong></div>
    <div class="result-row"><span>Thuế TNCN</span><strong>− ${fmtVND(r.tax)}</strong></div>
    <div class="result-row"><span>Thu nhập tính thuế</span><strong>${fmtVND(r.taxable)}</strong></div>
  </div>
  <button type="button" class="m2-steps-toggle" id="lggn-steps-toggle" aria-expanded="${stepsOpen ? 'true' : 'false'}">${stepsOpen ? 'Ẩn cách tính từng bước' : 'Xem cách tính từng bước'}</button>
  <div class="m2-steps" id="lggn-steps"${stepsOpen ? '' : ' hidden'}>
    <table class="m2-steps-table"><tbody>${steps}</tbody></table>
  </div>
  <div class="m2-result-actions">
    <button type="button" class="m2-action-btn m2-action-btn-copy" id="lggn-copy">Chép</button>
    <button type="button" class="m2-action-btn m2-action-btn-share" id="lggn-share">Chia sẻ Zalo</button>
    <button type="button" class="m2-action-btn m2-action-btn-download" id="lggn-download">Tải ảnh</button>
  </div>
</div>`;
    const stepsBtn = $('lggn-steps-toggle');
    if (stepsBtn) stepsBtn.addEventListener('click', function () {
      stepsOpen = !stepsOpen;
      const box = $('lggn-steps');
      if (box) box.hidden = !stepsOpen;
      stepsBtn.setAttribute('aria-expanded', stepsOpen ? 'true' : 'false');
      stepsBtn.textContent = stepsOpen ? 'Ẩn cách tính từng bước' : 'Xem cách tính từng bước';
    });
    const copyBtn = $('lggn-copy');
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    const shareBtn = $('lggn-share');
    if (shareBtn) shareBtn.addEventListener('click', shareResult);
    const dlBtn = $('lggn-download');
    if (dlBtn) dlBtn.addEventListener('click', downloadImage);
    updateSticky(direction === 'g2n' ? 'Net' : 'Gross', heroValue);
  }

  function renderEmpty() {
    lastResult = null;
    lastCopyText = '';
    $('lggn-out').innerHTML = '<div class="m2-result-empty"><p>Nhập lương để xem kết quả tính.</p></div>';
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ / đổi tab — không spam lỗi).
  function tryRender(showErrors) {
    clearErrs(root);
    hideSticky();
    const salary = parseNum($('lggn-salary').value);
    const insRaw = $('lggn-ins').value.trim();
    const bhtnCap = parseNum($('lggn-region').value);
    const deps = Math.max(0, parseInt($('lggn-dep').value, 10) || 0);
    const salaryName = direction === 'g2n' ? 'Gross' : 'Net';
    if (!(salary > 0)) {
      if (showErrors) {
        markErr($('lggn-salary'), 'Ô Lương ' + salaryName + ' chưa có số — nhập số lớn hơn 0, ví dụ 30.000.000.');
        focusEl($('lggn-salary'));
      }
      renderEmpty();
      return false;
    }
    if (insRaw !== '' && !(parseNum(insRaw) > 0)) {
      if (showErrors) {
        markErr($('lggn-ins'), 'Ô Lương đóng bảo hiểm chưa đúng — để trống (mặc định bằng lương ' + salaryName + ') hoặc nhập số lớn hơn 0.');
        focusEl($('lggn-ins'));
      }
      renderEmpty();
      return false;
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
    }
    return true;
  }

  // --- Chép / Chia sẻ / Tải ảnh kết quả (MẪU 2) ---
  function copyResult() {
    if (!lastCopyText) return;
    function done(ok) { if (ok) toast('Đã chép kết quả lương'); }
    if (U.copyText) {
      const p = U.copyText(lastCopyText);
      if (p && p.then) p.then(done);
      else done(!!p);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastCopyText).then(function () { done(true); }).catch(function () { done(false); });
    }
  }
  function shareResult() {
    if (!lastCopyText) return;
    const url = window.location.href;
    // Web Share API (điện thoại: mở bảng chia sẻ của máy, có Zalo nếu
    // đã cài); máy tính không có API thì mở link chia sẻ Zalo với URL
    // trang hiện tại (URL đã chứa số đang tính nhờ tool-state).
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Tính lương Gross ⇄ Net', text: lastCopyText, url: url }).catch(function () { /* người dùng hủy chia sẻ */ });
    } else if (typeof window !== 'undefined') {
      window.open('https://zalo.me/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
    }
  }
  function downloadImage() {
    if (!lastResult) return;
    const r = lastResult;
    const W = 880, H = 640;
    function draw() {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d');
      if (!x) return;
      x.fillStyle = '#FFFFFF';
      x.fillRect(0, 0, W, H);
      x.fillStyle = '#1747E6';
      x.fillRect(0, 0, W, 12);
      x.textBaseline = 'alphabetic';
      x.textAlign = 'left';
      x.fillStyle = '#64748B';
      x.font = '700 20px "Be Vietnam Pro", sans-serif';
      x.fillText('TÍNH LƯƠNG GROSS – NET', 48, 58);
      const heroLabel = direction === 'g2n' ? 'Lương thực nhận (Net)' : 'Lương Gross tương ứng';
      const heroValue = direction === 'g2n' ? r.net : r.gross;
      x.fillStyle = '#475569';
      x.font = '600 22px "Be Vietnam Pro", sans-serif';
      x.fillText(heroLabel, 48, 112);
      x.fillStyle = '#1747E6';
      x.font = '800 56px "Be Vietnam Pro", sans-serif';
      x.fillText(fmtVND(heroValue), 48, 178);
      x.fillStyle = '#64748B';
      x.font = '400 20px "Be Vietnam Pro", sans-serif';
      const p = pctOfGross(r);
      x.fillText(direction === 'g2n' ? 'Bằng ' + p + '% lương Gross' : 'Lương Net bằng ' + p + '% lương Gross', 48, 214);
      x.strokeStyle = '#DCE1EA';
      x.lineWidth = 1;
      x.beginPath(); x.moveTo(48, 244); x.lineTo(W - 48, 244); x.stroke();
      const rows = [
        ['Lương Gross', fmtVND(r.gross), false],
        ['Bảo hiểm (10,5%)', '− ' + fmtVND(r.insurance), false],
        ['Thu nhập tính thuế', fmtVND(r.taxable), false],
        ['Thuế TNCN', '− ' + fmtVND(r.tax), false],
        ['Lương Net thực nhận', fmtVND(r.net), true],
      ];
      let y = 292;
      rows.forEach(function (row) {
        x.fillStyle = '#0F172A';
        x.font = (row[2] ? '800' : '600') + ' 20px "Be Vietnam Pro", sans-serif';
        x.textAlign = 'left';
        x.fillText(row[0], 48, y);
        x.fillStyle = row[2] ? '#1747E6' : '#0F172A';
        x.textAlign = 'right';
        x.fillText(row[1], W - 48, y);
        y += 48;
      });
      x.strokeStyle = '#DCE1EA';
      x.beginPath(); x.moveTo(48, y - 8); x.lineTo(W - 48, y - 8); x.stroke();
      x.fillStyle = '#64748B';
      x.font = '400 16px "Be Vietnam Pro", sans-serif';
      x.textAlign = 'left';
      x.fillText('tienichhub.io.vn  ·  Kết quả chỉ mang tính tham khảo', 48, y + 36);
      if (c.toBlob) {
        c.toBlob(function (blob) {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'luong-gross-net.png';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
          toast('Đã tải ảnh kết quả');
        }, 'image/png');
      }
    }
    // Đợi phông Be Vietnam Pro tải xong để chữ trong ảnh đúng phông;
    // lỗi thì vẽ luôn bằng phông dự phòng.
    if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('700 20px "Be Vietnam Pro"'),
        document.fonts.load('800 56px "Be Vietnam Pro"'),
      ]).then(draw).catch(draw);
    } else {
      draw();
    }
  }

  // --- Công tắc chiều Gross ⇄ Net: đổi chiều là tính lại ngay với số
  // đang có (không xóa kết quả như bản cũ — bản cũ xóa vì còn nút Tính).
  function setDirection(dir) {
    direction = dir;
    $('lggn-tab-g2n').classList.toggle('m2-toggle-active', dir === 'g2n');
    $('lggn-tab-n2g').classList.toggle('m2-toggle-active', dir === 'n2g');
    $('lggn-salary-label').textContent = dir === 'g2n' ? 'Gross' : 'Net';
    clearErrs(root);
    tryRender(false);
  }
  $('lggn-tab-g2n').addEventListener('click', function () { setDirection('g2n'); });
  $('lggn-tab-n2g').addEventListener('click', function () { setDirection('n2g'); });

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

  // Nút chọn nhanh mức lương: điền số rồi tính trực tiếp (qua liveCalc).
  root.querySelectorAll('[data-lggn-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const el = $('lggn-salary');
      el.value = fmtNum(parseInt(btn.getAttribute('data-lggn-quick'), 10));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  // Người phụ thuộc dạng − số + (không dùng ô gõ): ô số chỉ đọc, hai
  // nút tăng/giảm gửi sự kiện input/change để liveCalc + tool-state
  // (đồng bộ URL) chạy như khi gõ tay. fillExample của khung ví dụ vẫn
  // điền được vì nó đặt el.value trực tiếp.
  function setDeps(n) {
    const el = $('lggn-dep');
    el.value = String(Math.max(0, Math.floor(n) || 0));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  $('lggn-dep-minus').addEventListener('click', function () { setDeps(parseInt($('lggn-dep').value, 10) - 1); });
  $('lggn-dep-plus').addEventListener('click', function () { setDeps(parseInt($('lggn-dep').value, 10) + 1); });

  // Dòng gợi ý trần BHTN theo vùng đang chọn (tên vùng trong ô chọn rút
  // gọn còn "Vùng I…" cho vừa hàng 2 cột — trần ghi ở đây để khỏi mất
  // thông tin so với bản cũ).
  function updateRegionHint() {
    const cap = REGION_CAPS[$('lggn-region').value] || '';
    const hint = $('lggn-region-hint');
    if (hint) hint.textContent = cap ? 'Trần đóng BHTN vùng này: ' + cap + '/tháng.' : '';
  }
  $('lggn-region').addEventListener('change', updateRegionHint);

  // Tính trực tiếp khi gõ (đợt sửa UX 18/11): chỉ tính khi lương đã có
  // số > 0 và lương đóng bảo hiểm (nếu có) cũng hợp lệ; chưa hợp lệ thì
  // hiện khung trống lặng lẽ, không hiện lỗi, không cướp focus. Đợi
  // 400ms sau lần gõ cuối để khỏi tính giữa chừng. Nghe cả 'change' để
  // tool-state.js điền từ URL (nó chỉ gửi 'change') cũng tính lại được
  // — bản cũ dựa vào nút Tính để bấm lại, nay không còn nút đó.
  let liveTimer = null;
  function liveCalc() {
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { tryRender(false); }, 400);
  }
  ['lggn-salary', 'lggn-ins', 'lggn-dep', 'lggn-region'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  // Thanh tóm tắt: bấm Chép thì chép kết quả, bấm Chi tiết thì cuộn lên
  // thẻ kết quả.
  $('lggn-sticky-copy').addEventListener('click', copyResult);
  $('lggn-sticky-detail').addEventListener('click', scrollToResult);

  // Theo dõi thẻ kết quả có trong màn hình không để ẩn/hiện thanh tóm
  // tắt (xem refreshSticky).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      resultInView = entries[0].isIntersecting;
      refreshSticky();
    }, { threshold: 0.1 });
    io.observe($('lggn-out'));
  } else {
    resultInView = false; // không có IO: hiện thanh khi có kết quả
  }
  // Đổi kích thước màn hình (xoay điện thoại, đổi cỡ cửa sổ) làm chiều
  // cao/khoảng hở của thanh đổi — đo lại khoảng trống dưới trang.
  if (typeof window !== 'undefined') window.addEventListener('resize', refreshSticky);
  // Kéo nốt tới đáy thật sau khi cuộn dừng: khi thanh hiện giữa lúc đang
  // cuộn (vd bấm phím End — trình duyệt cuộn có quán tính ~200ms, thanh
  // hiện giữa chừng nên đích cuộn vẫn là đáy cũ, thiếu đúng khoảng trang
  // dài thêm khi thanh hiện), chờ cuộn dừng 150ms rồi kéo nốt tới đáy
  // thật để footer lộ đủ. Chỉ kéo khi thiếu đúng ~khoảng dài thêm đó
  // (người dùng dừng ở đáy cũ); không kéo khi họ chỉ cuộn lên vài px để
  // đọc lại footer. So với lastBarGrowth (độ dài thêm ĐO THẬT) chứ không
  // so với gap — trên điện thoại padding mới thay padding cũ nên trang
  // chỉ dài thêm 66px trong khi gap là 130px.
  let scrollEndTimer = null;
  if (typeof window !== 'undefined') window.addEventListener('scroll', function () {
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(function () {
      const bar = $('lggn-sticky');
      if (!bar || bar.hidden) return;
      const de = document.documentElement;
      const shortfall = (de.scrollHeight - window.innerHeight) - window.scrollY;
      if (shortfall > 0 && Math.abs(shortfall - lastBarGrowth) <= 4) {
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
  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  updateRegionHint();
  tryRender(true);
}
