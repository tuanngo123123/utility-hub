// Tính điểm xét tuyển đại học — điểm thi THPT + xét học bạ, cộng điểm
// ưu tiên khu vực, đối tượng (TT 06/2026/TT-BGDĐT).
// Bố cục MẪU 2 (trang công cụ chuẩn, Claude duyệt 14:32 19/11/2026): 2 thẻ
// cạnh nhau — trái nhập, phải kết quả dính khi cuộn; không còn nút Tính
// / Đặt lại / Điền ví dụ (mở trang đã tính sẵn ví dụ 8 + 8,5 + 7,5, KV1).
// Công thức ở src/diem-dh-logic.js (UH_DIEMDH) — bộ kiểm tự động
// scripts/test-diem-dh.mjs kiểm cùng file đó; thẻ kết quả, bảng từng
// bước, 3 nút, thanh dính đáy dùng chung qua UH.m2.
// Khác công cụ Tính điểm thi THPT (tab Điểm xét tuyển đại học): công cụ
// này thêm chế độ xét học bạ 6 học kỳ theo Điều 6 khoản 5, điểm cộng
// thêm tối đa 3, và khung MẪU 2 tính ngay khi gõ. Môn nhân hệ số 2
// không có ở đây — dùng công cụ Tính điểm thi THPT cho trường hợp đó
// (ghi rõ trong ghi chú cuối khung công cụ).
export const meta = {
  id: 'diem-xet-tuyen-dai-hoc',
  name: 'Tính điểm xét tuyển đại học',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Tính điểm xét tuyển đại học theo Quy chế tuyển sinh 2026: điểm thi tốt nghiệp THPT hoặc điểm học bạ 6 học kỳ, cộng điểm ưu tiên khu vực, đối tượng với công thức giảm dần từ 22,5 điểm.',
  keywords: 'điểm xét tuyển đại học, tính điểm xét tuyển, điểm ưu tiên KV1 KV2, xét học bạ 6 học kỳ, điểm ưu tiên 22,5, UT1 UT2, cộng điểm ưu tiên đại học',
  icon: '🎓',
  seoTitle: 'Tính điểm xét tuyển đại học 2026 — cộng điểm ưu tiên, xét học bạ',
  seoDesc: 'Tính điểm xét tuyển đại học theo Thông tư 06/2026: điểm thi THPT hoặc học bạ 6 học kỳ, cộng ưu tiên khu vực KV1/KV2-NT/KV2 và đối tượng UT1/UT2, kèm công thức giảm dần từ 22,5 điểm.',
};

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="m2-toggle" role="group" aria-label="Cách tính điểm xét tuyển">
          <button type="button" class="m2-toggle-btn m2-toggle-active" id="ddh-tab-thi">Điểm thi THPT</button>
          <button type="button" class="m2-toggle-btn" id="ddh-tab-hb">Xét học bạ</button>
        </div>
        <div id="ddh-pane-thi">
          <div class="grid-3">
            <div class="field m2-field"><label for="ddh-tn-m1">Môn 1</label><input id="ddh-tn-m1" type="text" inputmode="decimal" value="8"></div>
            <div class="field m2-field"><label for="ddh-tn-m2">Môn 2</label><input id="ddh-tn-m2" type="text" inputmode="decimal" value="8,5"></div>
            <div class="field m2-field"><label for="ddh-tn-m3">Môn 3</label><input id="ddh-tn-m3" type="text" inputmode="decimal" value="7,5"></div>
          </div>
          <p class="hint">Điểm thi tốt nghiệp THPT của 3 môn trong tổ hợp xét tuyển, thang 10.</p>
        </div>
        <div id="ddh-pane-hb" style="display:none">
          <div class="grid-3">
            <div class="field m2-field"><label for="ddh-hb-m1">Môn 1 — Toán hoặc Ngữ văn</label><input id="ddh-hb-m1" type="text" inputmode="decimal" value="8"></div>
            <div class="field m2-field"><label for="ddh-hb-m2">Môn 2</label><input id="ddh-hb-m2" type="text" inputmode="decimal" value="7,5"></div>
            <div class="field m2-field"><label for="ddh-hb-m3">Môn 3</label><input id="ddh-hb-m3" type="text" inputmode="decimal" value="8,5"></div>
          </div>
          <p class="hint">Điểm trung bình chung 6 học kỳ (cả năm lớp 10, 11, 12) của từng môn. Tổ hợp xét học bạ bắt buộc có môn Toán hoặc Ngữ văn. Để đủ điều kiện xét tuyển, tổng điểm 3 môn thi tốt nghiệp THPT của bạn phải đạt từ 15 điểm trở lên.</p>
        </div>
      </div>
      <div class="m2-input-bottom">
        <div class="m2-row2">
          <div class="field m2-field">
            <label for="ddh-kv">Ưu tiên khu vực</label>
            <select id="ddh-kv" class="m2-select">
              <option value="KV3">KV3 — không cộng</option>
              <option value="KV2">KV2 — 0,25 điểm</option>
              <option value="KV2-NT">KV2-NT — 0,5 điểm</option>
              <option value="KV1" selected>KV1 — 0,75 điểm</option>
            </select>
            <p class="hint">Khu vực theo trường bạn học lâu nhất cấp THPT; chỉ hưởng trong năm tốt nghiệp và một năm kế tiếp.</p>
          </div>
          <div class="field m2-field">
            <label for="ddh-dt">Ưu tiên đối tượng</label>
            <select id="ddh-dt" class="m2-select">
              <option value="NONE">Không thuộc đối tượng ưu tiên</option>
              <option value="UT2">Nhóm UT2 — 1,0 điểm</option>
              <option value="UT1">Nhóm UT1 — 2,0 điểm</option>
            </select>
            <p class="hint">Thuộc nhiều diện đối tượng thì chỉ hưởng mức cao nhất; khu vực và đối tượng được cộng cả hai.</p>
          </div>
        </div>
        <div class="field m2-field">
          <label for="ddh-bonus">Điểm cộng thêm <span class="m2-optional">(không bắt buộc)</span></label>
          <input id="ddh-bonus" class="m2-money" type="text" inputmode="decimal" value="" placeholder="0">
          <p class="hint">Điểm thưởng, điểm khuyến khích (chứng chỉ, giải thưởng) theo đề án từng trường — tối đa 3 điểm theo thang 30. Để trống nếu không có.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="ddh-result-card">
      <div id="ddh-out"></div>
    </div>
  </div>
  <p class="note">Căn cứ: Quy chế tuyển sinh ban hành kèm theo Thông tư 06/2026/TT-BGDĐT ngày 15/02/2026 — Điều 7 (điểm ưu tiên khu vực, đối tượng; công thức giảm dần từ 22,5 điểm), Điều 6 khoản 3 và khoản 5 (xét học bạ 6 học kỳ, bắt buộc Toán hoặc Ngữ văn; tổng điểm 3 môn thi tốt nghiệp tối thiểu 15 điểm). Một số trường nhân hệ số 2 cho môn chính hoặc quy đổi chứng chỉ ngoại ngữ — đối chiếu đề án tuyển sinh của trường; trường hợp môn nhân hệ số 2, bạn dùng <a href="/cong-cu/tinh-diem-thi-thpt/">công cụ Tính điểm thi THPT</a> (tab Điểm xét tuyển đại học).</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const D = (typeof window !== 'undefined' && window.UH_DIEMDH) || null;
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('ddh-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  if (!M2 || !D) {
    $('ddh-out').innerHTML = '<p class="error">Công cụ chưa tải đủ — bạn tải lại trang nhé.</p>';
    return;
  }

  const KV_LABEL = { KV1: 'KV1', 'KV2-NT': 'KV2-NT', KV2: 'KV2', KV3: 'KV3' };
  const OBJ_LABEL = { UT1: 'UT1', UT2: 'UT2', NONE: 'không thuộc đối tượng ưu tiên' };

  let mode = 'thi';
  let lastCopyText = '';
  const stepsState = { stepsOpen: false };

  // Thanh tóm tắt dính ở đáy (UH.m2): hiện khi thẻ kết quả cuộn khuất.
  const sticky = M2.setupSticky({
    root,
    resultEl: $('ddh-result-card'),
    getCopyText: () => lastCopyText,
    copyMsg: 'Đã chép điểm xét tuyển',
  });

  function modeName() {
    return mode === 'thi' ? 'Điểm thi THPT' : 'Xét học bạ';
  }

  // Các bước tính — mọi số lấy từ kết quả thật (r), không hard-code.
  function stepsRows(r, scoreText) {
    const rows = [];
    rows.push({
      label: 'Tổng điểm 3 môn',
      sub: mode === 'thi' ? scoreText : 'ĐTB 6 học kỳ: ' + scoreText,
      amount: D.fmtScore(r.total),
    });
    rows.push({
      label: 'Điểm ưu tiên khu vực (' + KV_LABEL[$('ddh-kv').value] + ')',
      sub: r.kv === 0 ? 'Khu vực 3 không được cộng điểm ưu tiên.' : '',
      amount: '+ ' + D.fmtScore(r.kv),
    });
    rows.push({
      label: 'Điểm ưu tiên đối tượng' + (r.obj > 0 ? ' (' + OBJ_LABEL[$('ddh-dt').value] + ')' : ''),
      sub: r.obj === 0 ? 'Không thuộc đối tượng ưu tiên.' : '',
      amount: '+ ' + D.fmtScore(r.obj),
    });
    if (r.pri0 > 0 && r.scaled && r.pri < r.pri0) {
      rows.push({
        label: 'Điều chỉnh giảm dần',
        sub: '[(30 − ' + D.fmtScore(r.total) + ') ÷ 7,5] × ' + D.fmtScore(r.pri0) + ' = ' + D.fmtScore(r.pri) + ' — tổng điểm từ 22,5 trở lên',
        amount: D.fmtScore(r.pri),
      });
    } else if (r.pri0 > 0) {
      rows.push({
        label: 'Điểm ưu tiên thực tế',
        sub: r.scaled
          ? 'Tổng điểm đúng 22,5 nên hệ số giảm dần bằng 1 — vẫn cộng đủ.'
          : 'Tổng điểm dưới 22,5 nên cộng đủ điểm ưu tiên.',
        amount: D.fmtScore(r.pri),
      });
    } else {
      rows.push({
        label: 'Điểm ưu tiên thực tế',
        sub: 'Không thuộc diện ưu tiên khu vực hay đối tượng.',
        amount: '0,00',
      });
    }
    if (r.bonus > 0) {
      rows.push({
        label: 'Điểm cộng thêm',
        sub: 'Điểm thưởng, khuyến khích (tối đa 3) — không bị giảm dần.',
        amount: '+ ' + D.fmtScore(r.bonus),
      });
    }
    const uncapped = D.round2(r.total + r.pri + r.bonus);
    if (uncapped > 30) {
      rows.push({
        label: 'Chặn ở thang 30',
        sub: 'Tổng chưa chặn là ' + D.fmtScore(uncapped) + ' — theo quy chế, điểm xét tuyển không vượt quá 30.',
        amount: '30,00',
      });
    }
    rows.push({ label: 'Điểm xét tuyển', sub: '', amount: D.fmtScore(r.final) });
    return rows;
  }

  function render(r, scoreText) {
    const modeLabel = modeName();
    const uncapped = D.round2(r.total + r.pri + r.bonus);
    const capped = uncapped > 30;
    lastCopyText = 'Điểm xét tuyển đại học (' + modeLabel + '): tổng 3 môn ' + D.fmtScore(r.total)
      + ' + ưu tiên ' + D.fmtScore(r.pri)
      + (r.bonus > 0 ? ' + cộng thêm ' + D.fmtScore(r.bonus) : '')
      + ' = ' + D.fmtScore(r.final)
      + (capped ? ' (chặn ở thang 30, tổng chưa chặn ' + D.fmtScore(uncapped) + ')' : '');
    let pctLine = modeLabel + ' · tổng điểm 3 môn ' + D.fmtScore(r.total);
    if (r.pri0 > 0 && r.scaled && r.pri < r.pri0) {
      pctLine += ' · ưu tiên giảm dần còn ' + D.fmtScore(r.pri) + ' (ban đầu ' + D.fmtScore(r.pri0) + ')';
    } else if (r.pri0 > 0) {
      pctLine += ' · ưu tiên cộng đủ ' + D.fmtScore(r.pri);
    }
    if (capped) pctLine += ' · chặn ở thang 30';
    const rows = [
      { label: 'Tổng điểm 3 môn (thang 30)', value: D.fmtScore(r.total) },
      { label: 'Điểm ưu tiên thực tế', value: D.fmtScore(r.pri) },
      { label: 'Điểm cộng thêm', value: D.fmtScore(r.bonus) },
    ];
    const imageRows = [
      ['Tổng điểm 3 môn', D.fmtScore(r.total), false],
      ['Điểm ưu tiên khu vực', D.fmtScore(r.kv), false],
      ['Điểm ưu tiên đối tượng', D.fmtScore(r.obj), false],
      ['Điểm ưu tiên thực tế', D.fmtScore(r.pri), false],
    ];
    if (r.bonus > 0) imageRows.push(['Điểm cộng thêm', D.fmtScore(r.bonus), false]);
    imageRows.push(['Điểm xét tuyển', D.fmtScore(r.final), true]);
    M2.renderResult($('ddh-out'), {
      label: 'Điểm xét tuyển',
      value: D.fmtScore(r.final),
      pctLine,
      rows,
      steps: stepsRows(r, scoreText),
      copyText: lastCopyText,
      copyMsg: 'Đã chép điểm xét tuyển',
      shareTitle: 'Tính điểm xét tuyển đại học',
      image: {
        title: 'ĐIỂM XÉT TUYỂN ĐẠI HỌC',
        file: 'diem-xet-tuyen-dai-hoc.png',
        heroLabel: 'Điểm xét tuyển',
        heroValue: D.fmtScore(r.final),
        pctLine,
        rows: imageRows,
      },
    }, stepsState);
    sticky.update('Điểm xét tuyển', D.fmtScore(r.final));
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ / đổi tab — không spam lỗi).
  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const prefix = mode === 'thi' ? 'ddh-tn-m' : 'ddh-hb-m';
    const labels = mode === 'thi'
      ? ['Môn 1', 'Môn 2', 'Môn 3']
      : ['Môn 1 — Toán hoặc Ngữ văn', 'Môn 2', 'Môn 3'];
    const scores = [];
    const entered = [];
    for (let i = 0; i < 3; i++) {
      const el = $(prefix + (i + 1));
      const raw = String(el.value == null ? '' : el.value).trim();
      entered.push(raw === '' ? '—' : raw);
      const v = D.parseScore(el.value);
      if (v === null) {
        if (showErrors) {
          markErr(el, 'Ô ' + labels[i] + ' chưa đúng — nhập điểm từ 0 đến 10, ví dụ 8,5.');
          focusEl(el);
        }
        M2.renderEmpty($('ddh-out'), 'Nhập đủ điểm 3 môn để xem điểm xét tuyển.');
        return false;
      }
      scores.push(v);
    }
    const bonusRaw = String($('ddh-bonus').value == null ? '' : $('ddh-bonus').value).trim();
    let bonus = 0;
    if (bonusRaw !== '') {
      const b = parseFloat(bonusRaw.replace(',', '.'));
      if (Number.isNaN(b) || b < 0 || b > 3) {
        if (showErrors) {
          markErr($('ddh-bonus'), 'Điểm cộng thêm từ 0 đến 3 điểm — để trống nếu bạn không có điểm thưởng.');
          focusEl($('ddh-bonus'));
        }
        M2.renderEmpty($('ddh-out'), 'Nhập đủ điểm 3 môn để xem điểm xét tuyển.');
        return false;
      }
      bonus = b;
    }
    const r = D.computeAdmission({
      scores,
      kv: $('ddh-kv').value,
      obj: $('ddh-dt').value,
      bonus,
    });
    render(r, entered.join(' + '));
    return true;
  }

  // --- Công tắc Điểm thi THPT / Xét học bạ: đổi chế độ là tính lại
  // ngay với số của chế độ đó (mỗi chế độ giữ số riêng của mình).
  function setMode(m) {
    mode = m;
    $('ddh-tab-thi').classList.toggle('m2-toggle-active', m === 'thi');
    $('ddh-tab-hb').classList.toggle('m2-toggle-active', m === 'hb');
    $('ddh-pane-thi').style.display = m === 'thi' ? '' : 'none';
    $('ddh-pane-hb').style.display = m === 'hb' ? '' : 'none';
    clearErrs(root);
    tryRender(false);
  }
  $('ddh-tab-thi').addEventListener('click', function () { setMode('thi'); });
  $('ddh-tab-hb').addEventListener('click', function () { setMode('hb'); });

  // Tính trực tiếp khi gõ: chỉ tính khi cả 3 môn và điểm cộng thêm
  // (nếu có) đều hợp lệ; chưa hợp lệ thì hiện khung trống lặng lẽ,
  // không hiện lỗi, không cướp focus. Đợi 400ms sau lần gõ cuối để
  // khỏi tính giữa chừng. Nghe cả 'change' để tool-state.js điền từ
  // URL (nó chỉ gửi 'change') cũng tính lại được.
  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['ddh-tn-m1', 'ddh-tn-m2', 'ddh-tn-m3', 'ddh-hb-m1', 'ddh-hb-m2', 'ddh-hb-m3',
   'ddh-kv', 'ddh-dt', 'ddh-bonus'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  tryRender(true);
}
