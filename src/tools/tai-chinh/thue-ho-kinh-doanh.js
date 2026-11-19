export const meta = {
  id: 'thue-ho-kinh-doanh',
  name: 'Tính thuế hộ kinh doanh + bán hàng online',
  desc: 'Tính thuế GTGT và thuế TNCN hộ kinh doanh năm 2026 theo phương pháp kê khai — cả bán qua sàn thương mại điện tử, sàn đã khấu trừ bao nhiêu, còn phải nộp thêm hay được hoàn.',
  seoTitle: 'Tính thuế hộ kinh doanh 2026 — bán hàng online, sàn TMĐT khấu trừ bao nhiêu',
  seoDesc: 'Tính thuế hộ kinh doanh năm 2026: ngưỡng 1 tỷ đồng, thuế GTGT và thuế TNCN theo từng ngành, sàn Shopee/TikTok Shop khấu trừ bao nhiêu, còn phải nộp thêm hay được hoàn.',
  keywords: 'thuế hộ kinh doanh, thuế khoán, bán hàng online nộp thuế, thuế sàn thương mại điện tử, thuế shopee, ngưỡng 1 tỷ, kê khai thuế hộ kinh doanh, thuế tiktok shop, thuế hộ kinh doanh 2026',
  categorySlug: 'tai-chinh',
};

export function body() {
  return `<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="field m2-field">
          <label for="hkd-doanh-thu">Doanh thu</label>
          <span class="input-unit"><input id="hkd-doanh-thu" class="m2-money" type="text" inputmode="decimal" value="1.400.000.000" placeholder="Ví dụ: 1.400.000.000"><span class="unit">₫</span></span>
          <div class="m2-toggle" role="group" aria-label="Kỳ doanh thu">
            <button type="button" class="m2-toggle-btn m2-toggle-active" id="hkd-ky-nam">Theo năm</button>
            <button type="button" class="m2-toggle-btn" id="hkd-ky-thang">Theo tháng</button>
          </div>
          <p class="hint">Doanh thu cả kỳ — gồm tiền bán hàng qua mọi kênh: tại quầy, chuyển khoản, ví điện tử và sàn thương mại điện tử. Chọn "Theo tháng" nếu bạn nhập doanh thu bình quân mỗi tháng — công cụ nhân 12 ra doanh thu năm.</p>
        </div>
        <div class="field m2-field">
          <label for="hkd-nganh">Ngành nghề</label>
          <select id="hkd-nganh" class="m2-select">
            <option value="phan-phoi">Phân phối, cung cấp hàng hóa — GTGT 1%, TNCN 0,5%</option>
            <option value="dich-vu">Dịch vụ, xây dựng không bao thầu nguyên vật liệu — GTGT 5%, TNCN 2%</option>
            <option value="san-xuat">Sản xuất, vận tải, dịch vụ có gắn với hàng hóa — GTGT 3%, TNCN 1,5%</option>
            <option value="khac">Hoạt động kinh doanh khác — GTGT 2%, TNCN 1%</option>
          </select>
          <p class="hint">Hộ kinh doanh nhiều ngành thì tách riêng doanh thu từng ngành để tính. Cho thuê tài sản, đại lý bảo hiểm/xổ số/đa cấp và nội dung thông tin số chịu thuế TNCN 5% — chưa có trong công cụ, xem phần hỏi đáp bên dưới.</p>
        </div>
        <div class="field m2-field">
          <label id="hkd-cach-label">Cách tính thuế TNCN</label>
          <div class="m2-toggle" role="group" aria-labelledby="hkd-cach-label">
            <button type="button" class="m2-toggle-btn m2-toggle-active" id="hkd-cach-doanh-thu">Theo doanh thu</button>
            <button type="button" class="m2-toggle-btn" id="hkd-cach-thu-nhap">Theo thu nhập</button>
          </div>
          <p class="hint">Theo doanh thu: thuế suất nhân phần doanh thu vượt 1 tỷ đồng. Theo thu nhập: 15%/17%/20% nhân (doanh thu − chi phí). Doanh thu trên 3 tỷ đồng thì bắt buộc tính theo thu nhập.</p>
          <p class="hint" id="hkd-cach-note" style="display:none">Doanh thu trên 3 tỷ đồng: bắt buộc tính thuế TNCN theo thu nhập, không được chọn theo doanh thu (khoản 3 Điều 7 Luật Thuế TNCN 2025).</p>
        </div>
        <div class="field m2-field" id="hkd-chi-phi-wrap" style="display:none">
          <label for="hkd-chi-phi">Chi phí hợp lý (cùng kỳ với doanh thu)</label>
          <span class="input-unit"><input id="hkd-chi-phi" class="m2-money" type="text" inputmode="decimal" value="1.000.000.000" placeholder="Ví dụ: 1.000.000.000"><span class="unit">₫</span></span>
          <p class="hint">Chi phí thực tế liên quan đến kinh doanh, có hóa đơn chứng từ — tiền hàng, thuê mặt bằng, vận chuyển, lương nhân viên. Chỉ dùng khi tính thuế theo thu nhập.</p>
        </div>
        <div class="field m2-field">
          <label id="hkd-kenh-label">Kênh bán</label>
          <div class="m2-toggle" role="group" aria-labelledby="hkd-kenh-label">
            <button type="button" class="m2-toggle-btn m2-toggle-active" id="hkd-kenh-tu-ban">Tự bán</button>
            <button type="button" class="m2-toggle-btn" id="hkd-kenh-san">Qua sàn TMĐT</button>
          </div>
          <p class="hint">Sàn có chức năng thanh toán khấu trừ thuế thay bạn theo từng giao dịch (NĐ 117/2025): hàng hóa 1% GTGT + 0,5% TNCN; dịch vụ 5% + 2%; vận tải 3% + 1,5%.</p>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="hkd-result-card">
      <div id="hkd-out"></div>
    </div>
  </div>
  <p class="note">Từ 01/01/2026 bỏ thuế khoán, hộ kinh doanh kê khai theo doanh thu thực tế; lệ phí môn bài đã bãi bỏ nên công cụ không tính khoản này. Giảm 30% thuế TNCN năm 2026–2027 (doanh thu năm từ 10 tỷ đồng trở xuống) đã tính sẵn trong kết quả.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const D = window.UH_THUEHKD;
  const $ = function (id) { return root.querySelector('#' + id); };
  const fmtVND = U.fmtVND || (function (n) { return Math.round(n).toLocaleString('vi-VN') + ' ₫'; });
  const fmtPct = function (rate) {
    return String(rate * 100).replace('.', ',') + '%';
  };
  const focusEl = function (el) {
    if (el && typeof el.focus === 'function') el.focus();
  };
  const markErr = function (el, msg) {
    if (!el) return;
    el.classList.add('m2-input-error');
    const p = document.createElement('p');
    p.className = 'm2-error';
    p.textContent = msg;
    el.closest('.m2-field').appendChild(p);
  };
  const clearErrs = function (scope) {
    scope.querySelectorAll('.m2-input-error').forEach(function (el) { el.classList.remove('m2-input-error'); });
    scope.querySelectorAll('.m2-error').forEach(function (el) { el.remove(); });
  };
  const stepsState = { open: false };
  let lastCopyText = '';
  const sticky = M2.setupSticky({
    root,
    resultEl: $('hkd-out'),
    getCopyText: function () { return lastCopyText; },
    copyMsg: 'Đã chép kết quả thuế hộ kinh doanh',
  });

  // Trạng thái chọn: kỳ (năm/tháng), cách tính TNCN người dùng muốn,
  // kênh bán. Cách tính thực tế có thể bị ép sang "theo thu nhập"
  // khi doanh thu trên 3 tỷ — methodPref giữ lựa chọn của người dùng
  // để khi doanh thu hạ xuống dưới 3 tỷ thì quay lại đúng lựa chọn đó.
  let period = 'nam';
  let methodPref = 'doanh-thu';
  let channel = 'tu-ban';

  function render(r) {
    const group = D.GROUPS[r.groupId];
    const isSan = channel === 'san';
    let heroLabel;
    let heroValue;
    let stickyLabel;
    let note = '';
    if (!r.taxable && (!isSan || r.withheldTotal === 0)) {
      heroLabel = 'Tổng thuế phải nộp';
      heroValue = '0 ₫';
      stickyLabel = 'Thuế';
      note = 'Doanh thu năm từ 1 tỷ đồng trở xuống nên không phải nộp thuế GTGT và thuế TNCN — chỉ cần thông báo doanh thu với cơ quan thuế quản lý trước 31/1 năm sau.';
    } else if (!r.taxable && isSan) {
      heroLabel = 'Được hoàn lại khi quyết toán';
      heroValue = fmtVND(-r.netTotal);
      stickyLabel = 'Hoàn';
      note = 'Doanh thu dưới ngưỡng nên không phải nộp thuế — toàn bộ số sàn đã khấu trừ được hoàn khi quyết toán năm.';
    } else if (!isSan) {
      heroLabel = 'Tổng thuế phải nộp';
      heroValue = fmtVND(r.total);
      stickyLabel = 'Thuế';
    } else if (r.netTotal > 0) {
      heroLabel = 'Còn phải nộp thêm';
      heroValue = fmtVND(r.netTotal);
      stickyLabel = 'Nộp thêm';
      note = 'Sàn đã khấu trừ một phần — phần còn lại bạn nộp khi quyết toán năm.';
    } else if (r.netTotal < 0) {
      heroLabel = 'Được hoàn lại khi quyết toán';
      heroValue = fmtVND(-r.netTotal);
      stickyLabel = 'Hoàn';
      note = 'Sàn khấu trừ trên toàn bộ doanh thu nên số đã trừ nhiều hơn số phải nộp — phần thừa được hoàn khi quyết toán năm.';
    } else {
      heroLabel = 'Không phải nộp thêm';
      heroValue = '0 ₫';
      stickyLabel = 'Đã đủ';
      note = 'Sàn đã khấu trừ đúng bằng số thuế phải nộp.';
    }
    if (r.methodForced) {
      note = 'Doanh thu trên 3 tỷ đồng nên bắt buộc tính thuế TNCN theo thu nhập (khoản 3 Điều 7 Luật Thuế TNCN 2025).' + (note ? ' ' + note : '');
    }
    const pctLine = isSan
      ? 'Doanh thu năm ' + fmtVND(r.revenue) + ' · phải nộp ' + fmtVND(r.total) + ' · sàn đã trừ ' + fmtVND(r.withheldTotal)
      : 'Doanh thu năm ' + fmtVND(r.revenue) + ' · GTGT ' + fmtVND(r.vat) + ' · TNCN ' + fmtVND(r.pit) + (r.reductionApplied ? ' (sau giảm 30%)' : '');
    const rows = isSan
      ? [
        { label: 'Tổng thuế phải nộp', value: fmtVND(r.total) },
        { label: 'Sàn đã khấu trừ', value: fmtVND(r.withheldTotal) },
        { label: r.netTotal >= 0 ? 'Còn phải nộp thêm' : 'Được hoàn lại', value: fmtVND(Math.abs(r.netTotal)) },
      ]
      : [
        { label: 'Thuế GTGT', value: fmtVND(r.vat) },
        { label: 'Thuế TNCN' + (r.reductionApplied ? ' (sau giảm 30%)' : ''), value: fmtVND(r.pit) },
        { label: 'Lệ phí môn bài', value: '0 ₫ — đã bãi bỏ từ 2026' },
      ];
    const steps = [
      {
        label: 'Doanh thu năm',
        sub: period === 'thang' ? fmtVND(r.revenue / 12) + '/tháng × 12 tháng' : 'Doanh thu cả năm 2026',
        amount: fmtVND(r.revenue),
      },
    ];
    if (r.taxable) {
      steps.push({
        label: 'Phần doanh thu vượt ngưỡng 1 tỷ đồng',
        sub: fmtVND(r.revenue) + ' − 1.000.000.000 ₫',
        amount: fmtVND(r.excess),
      });
    }
    steps.push({
      label: 'Thuế GTGT (' + fmtPct(r.vatRate) + ') — ' + group.label,
      sub: r.taxable
        ? fmtPct(r.vatRate) + ' × ' + fmtVND(r.revenue) + ' — tính trên toàn bộ doanh thu, không trừ ngưỡng'
        : 'Không phải nộp vì doanh thu từ 1 tỷ đồng trở xuống',
      amount: fmtVND(r.vat),
    });
    if (r.taxable) {
      if (r.method === 'doanh-thu') {
        steps.push({
          label: 'Thuế TNCN theo doanh thu (' + fmtPct(r.pitRate) + ')',
          sub: fmtPct(r.pitRate) + ' × ' + fmtVND(r.excess) + ' — chỉ tính phần doanh thu vượt ngưỡng',
          amount: fmtVND(r.pitBeforeReduction),
        });
      } else {
        steps.push({
          label: 'Thuế TNCN theo thu nhập (' + fmtPct(r.pitRate) + ')',
          sub: '(' + fmtVND(r.revenue) + ' − ' + fmtVND(r.cost) + ') × ' + fmtPct(r.pitRate),
          amount: fmtVND(r.pitBeforeReduction),
        });
      }
      if (r.reductionApplied) {
        steps.push({
          label: 'Giảm 30% thuế TNCN',
          sub: 'NQ 43/2026 — doanh thu năm từ 10 tỷ đồng trở xuống, kỳ tính thuế 2026–2027',
          amount: '−' + fmtVND(r.reduction),
        });
      }
    } else {
      steps.push({
        label: 'Thuế TNCN',
        sub: 'Không phải nộp vì doanh thu từ 1 tỷ đồng trở xuống',
        amount: '0 ₫',
      });
    }
    steps.push({
      label: 'Lệ phí môn bài',
      sub: 'Đã bãi bỏ từ 01/01/2026 (NQ 198/2025, NĐ 362/2025)',
      amount: '0 ₫',
    });
    steps.push({
      label: 'Tổng thuế phải nộp',
      sub: 'Thuế GTGT + thuế TNCN sau giảm',
      amount: fmtVND(r.total),
    });
    if (isSan) {
      steps.push({
        label: 'Sàn đã khấu trừ thuế GTGT',
        sub: fmtPct(group.platVat) + ' × ' + fmtVND(r.revenue) + ' — khấu trừ theo từng giao dịch',
        amount: fmtVND(r.withheldVat),
      });
      steps.push({
        label: 'Sàn đã khấu trừ thuế TNCN',
        sub: fmtPct(group.platPit) + ' × ' + fmtVND(r.revenue) + ' — khấu trừ theo từng giao dịch',
        amount: fmtVND(r.withheldPit),
      });
      steps.push({
        label: r.netTotal >= 0 ? 'Còn phải nộp thêm' : 'Được hoàn lại khi quyết toán',
        sub: fmtVND(r.total) + ' − ' + fmtVND(r.withheldTotal),
        amount: fmtVND(Math.abs(r.netTotal)),
      });
    }
    let copyText;
    if (!r.taxable && (!isSan || r.withheldTotal === 0)) {
      copyText = 'Hộ kinh doanh ' + group.label.toLowerCase() + ', doanh thu năm ' + fmtVND(r.revenue) + ': từ 1 tỷ đồng trở xuống nên không phải nộp thuế GTGT và thuế TNCN năm 2026 — chỉ cần thông báo doanh thu với cơ quan thuế trước 31/1 năm sau.';
    } else if (!r.taxable && isSan) {
      copyText = 'Hộ kinh doanh ' + group.label.toLowerCase() + ', doanh thu năm ' + fmtVND(r.revenue) + ' bán qua sàn: không phải nộp thuế (dưới ngưỡng 1 tỷ đồng), sàn đã khấu trừ ' + fmtVND(r.withheldTotal) + ' được hoàn toàn bộ khi quyết toán.';
    } else if (!isSan) {
      copyText = 'Hộ kinh doanh ' + group.label.toLowerCase() + ', doanh thu năm ' + fmtVND(r.revenue) + ': thuế GTGT ' + fmtVND(r.vat) + ' + thuế TNCN ' + fmtVND(r.pit) + (r.reductionApplied ? ' (sau giảm 30%)' : '') + ' = tổng ' + fmtVND(r.total) + '. Lệ phí môn bài 0 ₫ (đã bãi bỏ từ 2026).';
    } else {
      copyText = 'Hộ kinh doanh ' + group.label.toLowerCase() + ', doanh thu năm ' + fmtVND(r.revenue) + ' bán qua sàn: phải nộp ' + fmtVND(r.total) + ' (GTGT ' + fmtVND(r.vat) + ' + TNCN ' + fmtVND(r.pit) + '), sàn đã khấu trừ ' + fmtVND(r.withheldTotal) + ', ' + (r.netTotal >= 0 ? 'còn phải nộp thêm ' + fmtVND(r.netTotal) : 'được hoàn ' + fmtVND(-r.netTotal)) + ' khi quyết toán.';
    }
    lastCopyText = copyText;
    const imageRows = isSan
      ? [
        ['Tổng thuế phải nộp', fmtVND(r.total), false],
        ['Sàn đã khấu trừ', fmtVND(r.withheldTotal), false],
        [r.netTotal >= 0 ? 'Còn phải nộp thêm' : 'Được hoàn lại', fmtVND(Math.abs(r.netTotal)), true],
      ]
      : [
        ['Thuế GTGT', fmtVND(r.vat), false],
        ['Thuế TNCN' + (r.reductionApplied ? ' (sau giảm 30%)' : ''), fmtVND(r.pit), false],
        ['Lệ phí môn bài', '0 ₫ (đã bãi bỏ)', false],
        ['Tổng thuế phải nộp', fmtVND(r.total), true],
      ];
    M2.renderResult($('hkd-out'), {
      label: heroLabel,
      value: heroValue,
      pctLine,
      note,
      rows,
      steps,
      copyText,
      copyMsg: 'Đã chép kết quả thuế hộ kinh doanh',
      shareTitle: 'Tính thuế hộ kinh doanh + bán hàng online',
      image: {
        title: 'THUẾ HỘ KINH DOANH 2026',
        file: 'thue-ho-kinh-doanh.png',
        heroLabel,
        heroValue,
        pctLine,
        rows: imageRows,
      },
    }, stepsState);
    // Thanh dính đáy: số tiền ĐẶT TRƯỚC nhãn ("15.400.000 ₫ Thuế")
    // để ở màn hình hẹp, nếu có cắt chữ thì chỉ cắt phần nhãn phía
    // sau, số tiền — thứ người dùng cần nhất — luôn hiện đủ.
    sticky.update(heroValue, stickyLabel);
  }

  // Cập nhật công tắc cách tính theo doanh thu hiện tại: trên 3 tỷ
  // thì khóa nút "Theo doanh thu" + hiện dòng ghi chú bắt buộc.
  function syncMethodToggle(revenueAnnual) {
    const forced = revenueAnnual > D.REVENUE_METHOD_MAX;
    const btnRev = $('hkd-cach-doanh-thu');
    const btnInc = $('hkd-cach-thu-nhap');
    btnRev.disabled = forced;
    $('hkd-cach-note').style.display = forced ? '' : 'none';
    const effective = forced ? 'thu-nhap' : methodPref;
    btnRev.classList.toggle('m2-toggle-active', effective === 'doanh-thu');
    btnInc.classList.toggle('m2-toggle-active', effective === 'thu-nhap');
    $('hkd-chi-phi-wrap').style.display = effective === 'thu-nhap' ? '' : 'none';
    return effective;
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ / đổi lựa chọn).
  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const revenueInput = D.parseMoney($('hkd-doanh-thu').value);
    if (revenueInput === null) {
      if (showErrors) {
        markErr($('hkd-doanh-thu'), 'Nhập doanh thu — số tiền từ 0 ₫ trở lên, ví dụ 1.400.000.000.');
        focusEl($('hkd-doanh-thu'));
      }
      M2.renderEmpty($('hkd-out'), 'Nhập doanh thu để xem thuế phải nộp.');
      return false;
    }
    const revenueAnnual = D.annualize(revenueInput, period);
    const method = syncMethodToggle(revenueAnnual);
    let costAnnual = 0;
    if (method === 'thu-nhap') {
      const costInput = D.parseMoney($('hkd-chi-phi').value);
      if (costInput === null) {
        if (showErrors) {
          markErr($('hkd-chi-phi'), 'Nhập chi phí hợp lý — số tiền từ 0 ₫ trở lên, ví dụ 1.000.000.000. Không có chi phí thì nhập 0.');
          focusEl($('hkd-chi-phi'));
        }
        M2.renderEmpty($('hkd-out'), 'Nhập chi phí hợp lý để tính thuế theo thu nhập.');
        return false;
      }
      costAnnual = D.annualize(costInput, period);
    }
    render(D.computeTax({
      revenueAnnual,
      group: $('hkd-nganh').value,
      // Đưa lựa chọn của người dùng vào logic để logic tự ép sang
      // "theo thu nhập" khi doanh thu trên 3 tỷ và báo methodForced
      // cho giao diện ghi chú — không đưa phương pháp đã ép sẵn.
      method: methodPref,
      costAnnual,
      channel,
    }));
    return true;
  }

  function setPeriod(p) {
    period = p;
    $('hkd-ky-nam').classList.toggle('m2-toggle-active', p === 'nam');
    $('hkd-ky-thang').classList.toggle('m2-toggle-active', p === 'thang');
    tryRender(false);
  }
  $('hkd-ky-nam').addEventListener('click', function () { setPeriod('nam'); });
  $('hkd-ky-thang').addEventListener('click', function () { setPeriod('thang'); });

  function setMethod(m) {
    methodPref = m;
    tryRender(false);
  }
  $('hkd-cach-doanh-thu').addEventListener('click', function () { setMethod('doanh-thu'); });
  $('hkd-cach-thu-nhap').addEventListener('click', function () { setMethod('thu-nhap'); });

  function setChannel(c) {
    channel = c;
    $('hkd-kenh-tu-ban').classList.toggle('m2-toggle-active', c === 'tu-ban');
    $('hkd-kenh-san').classList.toggle('m2-toggle-active', c === 'san');
    tryRender(false);
  }
  $('hkd-kenh-tu-ban').addEventListener('click', function () { setChannel('tu-ban'); });
  $('hkd-kenh-san').addEventListener('click', function () { setChannel('san'); });

  // Tính trực tiếp khi gõ: chỉ tính khi các ô hợp lệ; chưa hợp lệ
  // thì hiện khung trống lặng lẽ, không hiện lỗi, không cướp focus.
  // Đợi 400ms sau lần gõ cuối để khỏi tính giữa chừng. Nghe cả
  // 'change' để tool-state.js điền từ URL (nó chỉ gửi 'change') cũng
  // tính lại được.
  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['hkd-doanh-thu', 'hkd-nganh', 'hkd-chi-phi'].forEach(function (id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });

  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  tryRender(true);
}
