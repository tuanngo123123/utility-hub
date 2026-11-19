// Chuyển mã tiếng Việt TCVN3/VNI ↔ Unicode — Văn phòng.
// Bảng mã nằm trong src/chuyen-ma-logic.js (build.mjs chèn vào trang);
// init() dưới đây chỉ nối giao diện với window.UH_CHUYENMA.
export const meta = {
  id: 'chuyen-ma-tieng-viet-tcvn3-vni-unicode',
  name: 'Chuyển mã tiếng Việt TCVN3/VNI ↔ Unicode',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Đổi văn bản tiếng Việt giữa Unicode, TCVN3 (ABC) và VNI.',
  keywords: ['chuyển mã', 'tcvn3', 'vni', 'unicode', 'chuyển font', 'font abc', 'lỗi font', 'đổi mã', 'chuyen ma'],
  icon: '🔄',
  seoTitle: 'Chuyển mã tiếng Việt TCVN3/VNI sang Unicode trực tuyến | Tiện Ích Hub',
  seoDesc: 'Đổi văn bản tiếng Việt giữa Unicode, TCVN3 (ABC) và VNI ngay trên trình duyệt: dán văn bản, chọn mã nguồn và mã đích, kết quả hiện ngay. Chữ hoa có dấu, số và dấu câu giữ nguyên.',
};

export function body() {
  return `
  <div class="tool-panel" data-uh-no-reset="1">
    <div class="field">
      <label for="cm-input">Văn bản cần chuyển</label>
      <textarea id="cm-input" rows="7" spellcheck="false" placeholder="Dán văn bản tiếng Việt vào đây…"></textarea>
    </div>
    <div class="cm-row">
      <div class="field">
        <label for="cm-from">Mã nguồn</label>
        <select id="cm-from">
          <option value="unicode" selected>Unicode</option>
          <option value="tcvn3">TCVN3 (ABC)</option>
          <option value="vni">VNI</option>
        </select>
      </div>
      <button class="btn" id="cm-swap" type="button" aria-label="Đổi chiều chuyển mã">⇄</button>
      <div class="field">
        <label for="cm-to">Mã đích</label>
        <select id="cm-to">
          <option value="unicode">Unicode</option>
          <option value="tcvn3" selected>TCVN3 (ABC)</option>
          <option value="vni">VNI</option>
        </select>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn" id="cm-guess" type="button">Đoán mã</button>
      <button class="btn btn-ghost" id="cm-sample" type="button">Văn bản mẫu</button>
      <button class="btn btn-ghost" id="cm-clear" type="button">Xóa</button>
    </div>
    <p class="note" data-cm-guess hidden></p>
    <div class="field">
      <label>Kết quả</label>
      <textarea data-cm-output rows="7" readonly spellcheck="false" placeholder="Kết quả sẽ hiện ở đây…"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn copy-btn" id="cm-copy" type="button">Chép kết quả</button>
      <span class="cm-stats" data-cm-stats aria-live="polite"></span>
    </div>
    <div class="note">
      <p><strong>Chữ hoa có dấu trong TCVN3:</strong> bảng mã TCVN3 không có ký tự riêng cho chữ hoa có dấu (À, Ế, Ộ…) nên ghi bằng 2 ký tự: chữ hoa không dấu + ký tự thường có dấu (À = A + µ). Khi chuyển sang Unicode, công cụ tự ghép lại thành chữ hoa có dấu.</p>
      <p><strong>Số trong mã VNI:</strong> số 1–5 đứng ngay sau nguyên âm được hiểu là dấu (a1 = á, a61 = ấ). Muốn giữ lại số thật, tách số ra khỏi nguyên âm bằng khoảng trắng. Chữ không dấu, số và dấu câu luôn giữ nguyên.</p>
      <p><strong>Chữ ư trong TCVN3:</strong> ký tự ư của TCVN3 là dấu gạch nối mềm nên có thể không nhìn thấy trong ô kết quả (ví dụ “thường” hiện thành “thêng”) — ký tự vẫn nằm trong văn bản, chép ra dùng bình thường.</p>
    </div>
  </div>`;
}

export function init(root) {
  var L = window.UH_CHUYENMA;
  var input = root.querySelector('#cm-input');
  var output = root.querySelector('[data-cm-output]');
  var fromSel = root.querySelector('#cm-from');
  var toSel = root.querySelector('#cm-to');
  var stats = root.querySelector('[data-cm-stats]');
  var guessEl = root.querySelector('[data-cm-guess]');
  var swapBtn = root.querySelector('#cm-swap');
  var guessBtn = root.querySelector('#cm-guess');
  var sampleBtn = root.querySelector('#cm-sample');
  var clearBtn = root.querySelector('#cm-clear');
  var copyBtn = root.querySelector('#cm-copy');
  if (!L || !input || !output || !fromSel || !toSel) return;

  // Điền văn bản mẫu khi mở trang (khung đồng bộ URL chạy sau init
  // nên nếu đường dẫn có sẵn văn bản thì vẫn ghi đè mẫu bằng văn
  // bản đó — hành vi chuẩn của mọi công cụ).
  if (!input.value) input.value = L.SAMPLE_TEXT;

  function fireChange(el) {
    try {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) { /* bỏ qua */ }
  }

  function fireInput(el) {
    try {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (e) { /* bỏ qua */ }
  }

  function render() {
    var from = fromSel.value;
    var to = toSel.value;
    var res = L.convert(input.value, from, to);
    output.value = res.text;
    if (from === to) {
      stats.textContent = 'Mã nguồn và mã đích giống nhau — chọn mã đích khác để chuyển.';
    } else if (input.value === '') {
      stats.textContent = '';
    } else if (res.changed === 0) {
      stats.textContent = 'Không có ký tự nào đổi — văn bản có thể đã đúng mã đích hoặc không có dấu.';
    } else {
      stats.textContent = 'Đã đổi ' + res.changed + ' ký tự.';
    }
  }

  function hideGuess() {
    guessEl.hidden = true;
    guessEl.textContent = '';
  }

  input.addEventListener('input', function () { hideGuess(); render(); });
  fromSel.addEventListener('change', function () { hideGuess(); render(); });
  toSel.addEventListener('change', function () { hideGuess(); render(); });

  swapBtn.addEventListener('click', function () {
    var f = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = f;
    fireChange(fromSel);
    fireChange(toSel);
    render();
  });

  guessBtn.addEventListener('click', function () {
    var g = L.detectEncoding(input.value);
    guessEl.hidden = false;
    if (!g) {
      guessEl.textContent = 'Không đoán được mã — văn bản có thể không có dấu hoặc quá ngắn. Bạn cứ chọn tay mã nguồn.';
      return;
    }
    var names = { unicode: 'Unicode', tcvn3: 'TCVN3 (ABC)', vni: 'VNI' };
    fromSel.value = g;
    fireChange(fromSel);
    // Đặt lại ghi chú SAU fireChange vì listener 'change' đã ẩn
    // ghi chú cũ (tránh ghi chú đoán mã cũ còn nằm lại sau khi
    // người dùng sửa tay).
    guessEl.hidden = false;
    guessEl.textContent = 'Có vẻ văn bản đang dùng mã ' + names[g] + ' — đã chọn làm mã nguồn. Nếu sai, bạn chọn lại tay nhé.';
    render();
  });

  sampleBtn.addEventListener('click', function () {
    input.value = L.SAMPLE_TEXT;
    fireInput(input);
    render();
    input.focus();
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    fireInput(input);
    render();
    input.focus();
  });

  copyBtn.addEventListener('click', function () {
    if (!output.value) {
      window.UH.toast('Chưa có kết quả để chép');
      return;
    }
    window.UH.copyResult(output.value, 'Đã chép kết quả');
  });

  render();
}
