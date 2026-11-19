export const meta = {
  id: 'thue-phi-mua-ban-nha-dat',
  name: 'Thuế phí mua bán nhà đất',
  desc: 'Tính thuế TNCN 2%, lệ phí trước bạ 0,5%, phí công chứng, phí thẩm định và lệ phí cấp sổ khi sang tên nhà đất — chia rõ bên bán, bên mua phải nộp.',
  icon: '🏡',
  categorySlug: 'tai-chinh',
};

export function body() {
  return `<div class="m2-tool">
  <div class="m2-layout">
    <div class="m2-inputs">
      <div class="m2-input-grid m2-input-grid-1col">
        <div class="field m2-field">
          <label for="tnnd-gia">Giá chuyển nhượng trên hợp đồng</label>
          <span class="input-unit"><input id="tnnd-gia" class="m2-money" type="text" inputmode="decimal" value="3.000.000.000" placeholder="Ví dụ: 3.000.000.000" autocomplete="off"><span class="unit">₫</span></span>
          <p class="hint">Giá hai bên thỏa thuận và ghi trong hợp đồng mua bán.</p>
        </div>
        <div class="field m2-field">
          <label for="tnnd-loai">Loại tài sản</label>
          <select id="tnnd-loai">
            <option value="nha-o">Nhà ở</option>
            <option value="dat-o">Đất ở</option>
            <option value="nha-dat">Nhà + đất</option>
          </select>
          <p class="hint">Tỷ lệ các khoản thuế, phí như nhau với cả ba loại; loại tài sản chỉ để ghi chú trong kết quả.</p>
        </div>
        <div class="field m2-field">
          <label for="tnnd-bang-gia">Giá theo bảng giá của tỉnh <span class="m2-opt">(không bắt buộc)</span></label>
          <span class="input-unit"><input id="tnnd-bang-gia" class="m2-money" type="text" inputmode="decimal" placeholder="Để trống nếu không biết" autocomplete="off"><span class="unit">₫</span></span>
          <p class="hint">Nếu giá theo bảng giá tỉnh cao hơn giá hợp đồng thì cơ quan thuế tính theo bảng giá. Đất: diện tích × giá 1 m² trong bảng giá đất. Nhà: diện tích sàn × giá 1 m² × tỷ lệ chất lượng còn lại. Để trống nếu không biết — công cụ tính theo giá hợp đồng.</p>
        </div>
        <div class="field m2-field">
          <label for="tnnd-mien">Diện miễn thuế TNCN</label>
          <select id="tnnd-mien">
            <option value="none">Không thuộc diện miễn</option>
            <option value="relative">Chuyển nhượng giữa người thân</option>
            <option value="only-home">Bán nhà ở, đất ở duy nhất</option>
          </select>
          <p class="hint">Người thân theo Điều 4 Luật Thuế TNCN 109/2025: vợ với chồng, cha mẹ với con, ông bà với cháu, anh chị em ruột. Nhà ở, đất ở duy nhất phải đủ 3 điều kiện: chỉ có một nhà hoặc một thửa đất ở duy nhất, đã sở hữu từ đủ 183 ngày, bán toàn bộ.</p>
        </div>
        <div class="field m2-field">
          <label id="tnnd-pit-label">Thuế TNCN do bên nào chịu</label>
          <div class="m2-toggle" role="group" aria-labelledby="tnnd-pit-label">
            <button type="button" class="m2-toggle-btn m2-toggle-active" id="tnnd-pit-ban">Bên bán</button>
            <button type="button" class="m2-toggle-btn" id="tnnd-pit-mua">Bên mua</button>
          </div>
          <p class="hint">Thông lệ bên bán chịu thuế TNCN, bên mua chịu lệ phí trước bạ, phí công chứng, phí thẩm định và lệ phí cấp sổ. Hai bên có thể thỏa thuận khác — tổng chi phí không đổi.</p>
        </div>
        <label class="m2-check"><input type="checkbox" id="tnnd-tham-dinh" checked> <span>Tính phí thẩm định hồ sơ (0,15% giá trị chuyển nhượng, tối đa 5 triệu đồng — mức Hà Nội; tỉnh khác có thể khác)</span></label>
        <label class="m2-check"><input type="checkbox" id="tnnd-vneid"> <span>Khai và nộp lệ phí trước bạ hoàn toàn bằng điện tử (VNeID mức 2) — giảm 10% lệ phí trước bạ, tối đa 12.650.000 ₫, đến 28/02/2027</span></label>
      </div>
    </div>
    <div class="m2-result-card" id="tnnd-result-card">
      <div id="tnnd-out"></div>
    </div>
  </div>
  <p class="note">Phí thẩm định hồ sơ và lệ phí cấp Giấy chứng nhận do từng tỉnh quy định nên khác nhau theo địa phương — công cụ dùng mức Hà Nội và mức phổ biến. Đối chiếu với cơ quan thuế và văn phòng công chứng địa phương trước khi giao dịch.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const D = window.UH_THUENHADAT;
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
  const stepsState = { stepsOpen: false };
  let lastCopyText = '';
  const sticky = M2.setupSticky({
    root,
    resultEl: $('tnnd-out'),
    getCopyText: function () { return lastCopyText; },
    copyMsg: 'Đã chép kết quả thuế phí mua bán nhà đất',
  });

  let pitPayer = 'seller';
  const TYPE_WORDS = { 'nha-o': 'nhà ở', 'dat-o': 'đất ở', 'nha-dat': 'nhà và đất' };

  // Công thức phí công chứng theo nấc giá trị (bảng từng bước).
  function notaryFormula(r) {
    const nb = D.notaryFeeBreakdown(r.base);
    let sub;
    if (nb.rate === 0) {
      sub = 'Mức cố định theo biểu phí công chứng (giá trị '
        + (r.base < 50000000 ? 'dưới 50.000.000 ₫' : 'từ 50.000.000 ₫ đến 100.000.000 ₫') + ')';
    } else if (nb.base === 0) {
      sub = '0,1% × ' + fmtVND(r.base);
    } else {
      sub = fmtVND(nb.base) + ' + ' + fmtPct(nb.rate) + ' × ' + fmtVND(nb.excess);
    }
    if (nb.capped) sub += ' — đã chạm trần ' + fmtVND(D.NOTARY_MAX);
    return sub;
  }

  function render(r) {
    const heroLabel = 'Tổng chi phí sang tên';
    const heroValue = fmtVND(r.total);
    const pctStr = (r.total / r.base * 100).toFixed(2).replace('.', ',') + '%';
    const pctLine = 'Giá tính ' + fmtVND(r.base) + ' · tổng chi phí bằng ' + pctStr + ' giá tính';
    const rows = [
      { label: 'Thuế TNCN (2%)' + (r.pitExempt ? ' — được miễn' : ''), value: fmtVND(r.pit) },
      { label: 'Lệ phí trước bạ (0,5%)' + (r.vneidApplied ? ' — đã giảm 10%' : ''), value: fmtVND(r.regFee) },
      { label: 'Phí công chứng', value: fmtVND(r.notary) },
      { label: 'Phí thẩm định hồ sơ', value: r.appraisalApplied ? fmtVND(r.appraisalFee) : 'Không tính' },
      { label: 'Lệ phí cấp Giấy chứng nhận', value: fmtVND(r.certFee) },
    ];
    const steps = [
      {
        label: 'Giá chuyển nhượng trên hợp đồng',
        amount: fmtVND(r.contractPrice),
      },
      {
        label: 'Giá tính thuế, phí',
        sub: r.baseFromTable
          ? 'Giá theo bảng giá tỉnh cao hơn giá hợp đồng nên tính theo bảng giá'
          : (r.tablePrice > 0
            ? 'Giá hợp đồng cao hơn bảng giá nên tính theo hợp đồng'
            : 'Chưa nhập giá theo bảng giá nên tính theo giá hợp đồng'),
        amount: fmtVND(r.base),
      },
      {
        label: 'Thuế TNCN (2%)',
        sub: r.pitExempt
          ? (r.exemption === 'relative'
            ? 'Được miễn: chuyển nhượng giữa người thân (Điều 4 Luật Thuế TNCN 109/2025)'
            : 'Được miễn: bán nhà ở, đất ở duy nhất đủ 3 điều kiện (Điều 4 Luật Thuế TNCN 109/2025)')
          : '2% × ' + fmtVND(r.base) + ' — tính trên giá chuyển nhượng, không tính trên lãi',
        amount: fmtVND(r.pit),
      },
      {
        label: 'Lệ phí trước bạ (0,5%)',
        sub: '0,5% × ' + fmtVND(r.base),
        amount: fmtVND(r.regFeeBeforeReduction),
      },
    ];
    if (r.vneidApplied) {
      steps.push({
        label: 'Giảm 10% lệ phí trước bạ (khai điện tử bằng VNeID mức 2)',
        sub: r.vneidReduction >= D.VNEID_REDUCTION_MAX
          ? 'Đã chạm mức giảm tối đa ' + fmtVND(D.VNEID_REDUCTION_MAX) + ' (5 lần lương cơ sở)'
          : '10% × ' + fmtVND(r.regFeeBeforeReduction),
        amount: '−' + fmtVND(r.vneidReduction),
      });
    }
    steps.push({
      label: 'Phí công chứng',
      sub: notaryFormula(r),
      amount: fmtVND(r.notary),
    });
    steps.push({
      label: 'Phí thẩm định hồ sơ',
      sub: r.appraisalApplied
        ? '0,15% × ' + fmtVND(r.base) + (r.appraisalFee >= D.APPRAISAL_MAX ? ' — đã chạm trần ' + fmtVND(D.APPRAISAL_MAX) : '')
        : 'Không tính theo lựa chọn',
      amount: fmtVND(r.appraisalFee),
    });
    steps.push({
      label: 'Lệ phí cấp Giấy chứng nhận',
      sub: 'Mức phổ biến cho cá nhân; mỗi tỉnh quy định một mức',
      amount: fmtVND(r.certFee),
    });
    steps.push({
      label: 'Tổng chi phí sang tên',
      sub: 'Thuế TNCN + lệ phí trước bạ + phí công chứng + phí thẩm định + lệ phí cấp sổ',
      amount: fmtVND(r.total),
    });
    steps.push({
      label: 'Bên bán phải nộp',
      sub: pitPayer === 'seller' ? 'Thuế TNCN' : 'Không chịu khoản nào theo lựa chọn',
      amount: fmtVND(r.sellerPays),
    });
    steps.push({
      label: 'Bên mua phải nộp',
      sub: pitPayer === 'seller' ? 'Lệ phí trước bạ + phí công chứng + phí thẩm định + lệ phí cấp sổ' : 'Thuế TNCN + lệ phí trước bạ + phí công chứng + phí thẩm định + lệ phí cấp sổ',
      amount: fmtVND(r.buyerPays),
    });
    let note = 'Bên bán nộp ' + fmtVND(r.sellerPays) + ' · bên mua nộp ' + fmtVND(r.buyerPays)
      + '. Hai bên có thể thỏa thuận khác — tổng chi phí không đổi.';
    if (r.baseFromTable) {
      note = 'Giá theo bảng giá tỉnh (' + fmtVND(r.tablePrice) + ') cao hơn giá hợp đồng nên các khoản tính theo bảng giá. ' + note;
    }
    const copyText = 'Thuế phí mua bán ' + TYPE_WORDS[r.type] + ' giá ' + fmtVND(r.base)
      + ': thuế TNCN ' + fmtVND(r.pit)
      + ' + lệ phí trước bạ ' + fmtVND(r.regFee) + (r.vneidApplied ? ' (sau giảm 10% khi khai điện tử)' : '')
      + ' + phí công chứng ' + fmtVND(r.notary)
      + ' + phí thẩm định ' + (r.appraisalApplied ? fmtVND(r.appraisalFee) : 'không tính')
      + ' + lệ phí cấp sổ ' + fmtVND(r.certFee)
      + ' = ' + fmtVND(r.total) + ' (bên bán ' + fmtVND(r.sellerPays) + ', bên mua ' + fmtVND(r.buyerPays) + ').';
    lastCopyText = copyText;
    M2.renderResult($('tnnd-out'), {
      label: heroLabel,
      value: heroValue,
      pctLine,
      note,
      rows,
      steps,
      copyText,
      copyMsg: 'Đã chép kết quả thuế phí mua bán nhà đất',
      shareTitle: 'Tính thuế phí mua bán nhà đất',
      image: {
        title: 'THUẾ PHÍ MUA BÁN NHÀ ĐẤT',
        file: 'thue-phi-mua-ban-nha-dat.png',
        heroLabel,
        heroValue,
        pctLine,
        rows: [
          ['Thuế TNCN (2%)', fmtVND(r.pit), false],
          ['Lệ phí trước bạ (0,5%)', fmtVND(r.regFee), false],
          ['Phí công chứng', fmtVND(r.notary), false],
          ['Phí thẩm định', fmtVND(r.appraisalFee), false],
          ['Lệ phí cấp Giấy chứng nhận', fmtVND(r.certFee), false],
          ['Tổng chi phí', fmtVND(r.total), true],
        ],
      },
    }, stepsState);
    // Thanh dính đáy: số tiền ĐẶT TRƯỚC nhãn để ở màn hình hẹp, nếu
    // có cắt chữ thì chỉ cắt phần nhãn phía sau, số tiền luôn hiện đủ.
    sticky.update(heroValue, 'Tổng chi phí');
  }

  // showErrors = true: hiện lỗi dưới ô + cướp focus (lúc mở trang);
  // false: lặng lẽ hiện khung trống (lúc gõ / đổi lựa chọn).
  function tryRender(showErrors) {
    clearErrs(root);
    sticky.hide();
    const price = D.parseMoney($('tnnd-gia').value);
    if (price === null || price <= 0) {
      if (showErrors) {
        markErr($('tnnd-gia'), 'Nhập giá chuyển nhượng — số tiền lớn hơn 0 ₫, ví dụ 3.000.000.000.');
        focusEl($('tnnd-gia'));
      }
      M2.renderEmpty($('tnnd-out'), 'Nhập giá chuyển nhượng để xem thuế phí phải nộp.');
      return false;
    }
    // Giá theo bảng giá là ô không bắt buộc: để trống hoặc nhập sai
    // thì bỏ qua, tính theo giá hợp đồng.
    const tableRaw = D.parseMoney($('tnnd-bang-gia').value);
    const tablePrice = tableRaw === null ? 0 : tableRaw;
    render(D.computeFees({
      contractPrice: price,
      tablePrice,
      type: $('tnnd-loai').value,
      exemption: $('tnnd-mien').value,
      pitPayer,
      appraisal: $('tnnd-tham-dinh').checked,
      vneid: $('tnnd-vneid').checked,
    }));
    return true;
  }

  function setPitPayer(p) {
    pitPayer = p;
    $('tnnd-pit-ban').classList.toggle('m2-toggle-active', p === 'seller');
    $('tnnd-pit-mua').classList.toggle('m2-toggle-active', p === 'buyer');
    tryRender(false);
  }

  $('tnnd-pit-ban').addEventListener('click', function () { setPitPayer('seller'); });
  $('tnnd-pit-mua').addEventListener('click', function () { setPitPayer('buyer'); });

  const liveCalc = M2.debounce(function () { tryRender(false); }, 400);
  ['tnnd-gia', 'tnnd-bang-gia'].forEach(function (id) {
    const el = $(id);
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });
  ['tnnd-loai', 'tnnd-mien', 'tnnd-tham-dinh', 'tnnd-vneid'].forEach(function (id) {
    $(id).addEventListener('change', function () { tryRender(false); });
  });

  // Tính ngay với số mặc định để mở trang đã thấy kết quả.
  tryRender(true);
}
