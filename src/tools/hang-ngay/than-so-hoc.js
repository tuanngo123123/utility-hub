// Thần số học — số chủ đạo, số ngày sinh, số thái độ, số sứ mệnh từ tên.
export const meta = {
  id: 'than-so-hoc',
  name: 'Thần số học: số chủ đạo & ý nghĩa',
  category: 'Hàng ngày',
  categorySlug: 'hang-ngay',
  desc: 'Nhập ngày sinh và họ tên để tính số chủ đạo, số ngày sinh, số thái độ và số sứ mệnh theo thần số học Pythagoras, kèm giải nghĩa từng con số.',
  keywords: 'thần số học, số chủ đạo, tính số chủ đạo, numerology, số sứ mệnh, ý nghĩa số chủ đạo',
  icon: '🔮',
  seoTitle: 'Thần số học — Tính số chủ đạo, số sứ mệnh từ ngày sinh & tên',
  seoDesc: 'Tính số chủ đạo từ ngày sinh và số sứ mệnh từ họ tên theo thần số học Pythagoras, kèm giải nghĩa từng con số 1–9, 11, 22.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Thần số học Pythagoras rút gọn ngày sinh và họ tên thành các con số 1–9 (giữ lại số bậc thầy 11, 22) để luận tính cách và hướng đi.</p>
  </div>
  <div class="grid-2">
    <div class="field">
      <label for="tsh-birth">Ngày sinh</label>
      <input id="tsh-birth" type="date" value="1995-08-15">
    </div>
    <div class="field">
      <label for="tsh-name">Họ và tên đầy đủ</label>
      <input id="tsh-name" type="text" placeholder="VD: Nguyễn Văn An" maxlength="60">
      <p class="hint">Dùng tên khai sinh. Bỏ trống vẫn tính được các số theo ngày sinh.</p>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="tsh-calc">Tính các con số</button>
    <button type="button" class="btn btn-ghost" id="tsh-example">Điền ví dụ</button>
  </div>
  <div id="tsh-out"></div>
  <p class="note">Cách tính: cộng các chữ số rồi rút gọn về 1–9, riêng 11 và 22 giữ nguyên (số bậc thầy). Bảng chữ cái Pythagoras: A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9, J=1, K=2, L=3, M=4, N=5, O=6, P=7, Q=8, R=9, S=1, T=2, U=3, V=4, W=5, X=6, Y=7, Z=8. Tên tiếng Việt được bỏ dấu trước khi tính (Đ → D). Thần số học mang tính tham khảo và giải trí, không phải khoa học thực chứng.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('tsh-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };
  const bindCopy = U.bindCopyButtons || function () {};
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const MEANINGS = {
    1: 'Độc lập, tiên phong, thích dẫn đầu. Bài học: kiên nhẫn và lắng nghe người khác.',
    2: 'Nhạy cảm, hòa giải, giỏi hợp tác. Bài học: đừng để ý kiến người khác lấn át mình.',
    3: 'Sáng tạo, hoạt ngôn, lạc quan. Bài học: tập trung để biến ý tưởng thành việc xong.',
    4: 'Thực tế, kỷ luật, đáng tin cậy. Bài học: linh hoạt hơn, đừng cứng nhắc quá.',
    5: 'Tự do, thích thay đổi, nhiều trải nghiệm. Bài học: kiên định với điều đã chọn.',
    6: 'Trách nhiệm, yêu thương, lo cho gia đình. Bài học: quan tâm người khác mà không ôm đồm.',
    7: 'Suy ngẫm, phân tích, thích tìm hiểu sâu. Bài học: mở lòng và chia sẻ với người xung quanh.',
    8: 'Tham vọng, giỏi tổ chức và quản lý tiền bạc. Bài học: cân bằng vật chất và tình cảm.',
    9: 'Nhân ái, lý tưởng, sống vì người khác. Bài học: cho đi nhưng vẫn giữ ranh giới của mình.',
    11: 'Số bậc thầy: trực giác mạnh, truyền cảm hứng, có sức ảnh hưởng lớn. Bài học: giữ cân bằng để không kiệt sức.',
    22: 'Số bậc thầy: biến tầm nhìn lớn thành công trình thực tế. Bài học: đi từng bước vững chắc.'
  };
  const LETTER_VALUES = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9, S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8 };

  function digitSum(n) {
    let s = 0;
    String(n).split('').forEach(ch => { s += parseInt(ch, 10) || 0; });
    return s;
  }
  // Rút gọn về 1–9, giữ lại 11 và 22.
  function reduce(n) {
    let v = n;
    while (v > 9 && v !== 11 && v !== 22) v = digitSum(v);
    return v;
  }
  function stripMarks(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  function calc() {
    clearErrs(root);
    const out = $('tsh-out');
    const birthVal = $('tsh-birth').value.trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthVal);
    if (!m) {
      markErr($('tsh-birth'), 'Ô Ngày sinh chưa đúng — chọn một ngày sinh hợp lệ.');
      focusEl($('tsh-birth'));
      out.innerHTML = '';
      return;
    }
    const year = +m[1], month = +m[2], day = +m[3];
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      markErr($('tsh-birth'), 'Ô Ngày sinh chưa đúng — ngày này không tồn tại trong lịch, ví dụ 30/02.');
      focusEl($('tsh-birth'));
      out.innerHTML = '';
      return;
    }
    // Số chủ đạo: cộng tất cả chữ số ngày/tháng/năm.
    const lifeTotal = digitSum(day) + digitSum(month) + digitSum(year);
    const lifePath = reduce(lifeTotal);
    const birthNum = reduce(day);
    const attitude = reduce(digitSum(day) + digitSum(month));
    let nameRows = '';
    let destinyText = '';
    const nameRaw = $('tsh-name').value.trim();
    if (nameRaw) {
      const clean = stripMarks(nameRaw).toUpperCase().replace(/[^A-Z]/g, '');
      if (!clean) {
        markErr($('tsh-name'), 'Ô Họ và tên chưa đúng — nhập tên có chữ cái, ví dụ Nguyễn Văn An.');
        focusEl($('tsh-name'));
        out.innerHTML = '';
        return;
      }
      let total = 0;
      let soul = 0;
      let persona = 0;
      for (let i = 0; i < clean.length; i++) {
        const v = LETTER_VALUES[clean[i]] || 0;
        total += v;
        if ('AEIOU'.indexOf(clean[i]) >= 0) soul += v; else persona += v;
      }
      const destiny = reduce(total);
      const soulNum = reduce(soul);
      const personaNum = reduce(persona);
      destinyText = ' · Số sứ mệnh: ' + destiny;
      nameRows = '<div class="result-row"><span>Số sứ mệnh (từ họ tên)</span><strong>' + destiny + ' — ' + escHtml(MEANINGS[destiny]) + '</strong></div>'
        + '<div class="result-row"><span>Số linh hồn (nguyên âm trong tên)</span><strong>' + soulNum + ' — khát vọng bên trong</strong></div>'
        + '<div class="result-row"><span>Số nhân cách (phụ âm trong tên)</span><strong>' + personaNum + ' — ấn tượng với người ngoài</strong></div>'
        + '<p class="muted small">Tên bỏ dấu "' + escHtml(stripMarks(nameRaw)) + '" có tổng giá trị chữ cái ' + total + ' → rút gọn thành ' + destiny + '.</p>';
    }
    const birthStr = String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year;
    const copyText = 'Thần số học' + (nameRaw ? ' — ' + nameRaw : '') + ' (sinh ' + birthStr + '): Số chủ đạo ' + lifePath + ' · Số ngày sinh ' + birthNum + ' · Số thái độ ' + attitude + destinyText + '.';
    out.innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Số chủ đạo${nameRaw ? ' — ' + escHtml(nameRaw) : ''}</p>
    <div class="result-hero-value">${lifePath}</div>
    <p class="result-hero-sub">${escHtml(MEANINGS[lifePath])}</p>
  </div>
  <div class="result-row"><span>Cách tính số chủ đạo</span><strong>${day} + ${month} + ${year} → cộng các chữ số = ${lifeTotal} → ${lifePath}</strong></div>
  <div class="result-row"><span>Số ngày sinh</span><strong>${birthNum} — ${escHtml(MEANINGS[birthNum])}</strong></div>
  <div class="result-row"><span>Số thái độ (ngày + tháng sinh)</span><strong>${attitude} — cách bạn đón nhận việc mới</strong></div>
  ${nameRows}
  <div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="${escAttr(copyText)}" data-copy-msg="Đã chép kết quả thần số học">Chép kết quả</button></div>
</div>`;
    bindCopy(out);
  }

  function runCalc() { withBusy($('tsh-calc'), calc); }
  $('tsh-calc').addEventListener('click', runCalc);
  $('tsh-birth').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  $('tsh-name').addEventListener('keydown', e => { if (e.key === 'Enter') runCalc(); });
  // Ví dụ: Nguyễn Văn An, sinh 15/08/1995 — số chủ đạo 11.
  $('tsh-example').addEventListener('click', () => {
    fillEx(root, { 'tsh-birth': '1995-08-15', 'tsh-name': 'Nguyễn Văn An' }, $('tsh-calc'));
  });
  calc();
}
