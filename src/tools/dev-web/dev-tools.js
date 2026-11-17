// Dev Tools tổng hợp — JWT decode, JSON, Base64, SHA hash, UUID + mật khẩu, đếm từ.
export const meta = {
  id: 'dev-tools',
  name: 'Dev Tools tổng hợp',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Giải mã JWT, định dạng JSON, mã hóa Base64 (tiếng Việt), băm SHA-256/SHA-1, tạo UUID và mật khẩu ngẫu nhiên, đếm từ.',
  keywords: 'jwt decode, json format, base64, sha-256, tạo uuid, tạo mật khẩu, đếm từ',
  icon: '🧰',
  seoTitle: 'Dev Tools tổng hợp — JWT, JSON, Base64, SHA, UUID',
  seoDesc: 'Giải mã JWT, định dạng và kiểm tra JSON, Base64 hỗ trợ tiếng Việt, băm SHA-256/SHA-1, tạo UUID và mật khẩu ngẫu nhiên. Tất cả chạy trên trình duyệt.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🧰</span><div><h2>Dev Tools tổng hợp</h2><p class="muted">JWT, JSON, Base64, SHA, UUID, mật khẩu, đếm từ — tất cả chạy ngay trên trình duyệt, không gửi dữ liệu đi đâu.</p></div></div>
  <div class="tabs">
    <button type="button" class="tab tab-active" id="dev-tab-jwt">JWT</button>
    <button type="button" class="tab" id="dev-tab-json">JSON</button>
    <button type="button" class="tab" id="dev-tab-b64">Base64</button>
    <button type="button" class="tab" id="dev-tab-hash">SHA Hash</button>
    <button type="button" class="tab" id="dev-tab-gen">UUID & Mật khẩu</button>
    <button type="button" class="tab" id="dev-tab-words">Đếm từ</button>
  </div>

  <div id="dev-pane-jwt">
    <div class="field"><label for="dev-jwt-in">Dán JWT token</label><textarea id="dev-jwt-in" rows="4" placeholder="eyJhbGciOi..."></textarea></div>
    <button type="button" class="btn btn-primary" id="dev-jwt-go">Giải mã</button>
    <div id="dev-jwt-out"></div>
    <p class="note">Chỉ giải mã phần header và payload để xem nội dung. Công cụ KHÔNG xác minh chữ ký — đừng dùng để kiểm tra token thật.</p>
  </div>

  <div id="dev-pane-json" style="display:none">
    <div class="field"><label for="dev-json-in">JSON</label><textarea id="dev-json-in" rows="6" placeholder='{"ten": "An", "tuoi": 26}'></textarea></div>
    <div>
      <button type="button" class="btn btn-primary" id="dev-json-pretty">Định dạng đẹp</button>
      <button type="button" class="btn btn-ghost" id="dev-json-min">Thu gọn (minify)</button>
      <button type="button" class="btn btn-ghost" id="dev-json-check">Kiểm tra lỗi</button>
    </div>
    <div id="dev-json-out"></div>
  </div>

  <div id="dev-pane-b64" style="display:none">
    <div class="field"><label for="dev-b64-in">Văn bản (hỗ trợ tiếng Việt có dấu)</label><textarea id="dev-b64-in" rows="3">xin chào</textarea></div>
    <div>
      <button type="button" class="btn btn-primary" id="dev-b64-enc">Mã hóa → Base64</button>
      <button type="button" class="btn btn-ghost" id="dev-b64-dec">Giải mã ← Base64</button>
    </div>
    <div id="dev-b64-out"></div>
  </div>

  <div id="dev-pane-hash" style="display:none">
    <div class="field"><label for="dev-hash-in">Văn bản cần băm</label><textarea id="dev-hash-in" rows="3">xin chào</textarea></div>
    <div class="field"><label for="dev-hash-algo">Thuật toán</label><select id="dev-hash-algo"><option value="SHA-256">SHA-256</option><option value="SHA-1">SHA-1</option><option value="SHA-512">SHA-512</option></select></div>
    <button type="button" class="btn btn-primary" id="dev-hash-go">Băm</button>
    <div id="dev-hash-out"></div>
  </div>

  <div id="dev-pane-gen" style="display:none">
    <button type="button" class="btn btn-primary" id="dev-uuid-go">Tạo UUID mới</button>
    <div id="dev-uuid-out"></div>
    <div class="grid-2">
      <div class="field"><label for="dev-pw-len">Độ dài mật khẩu</label><input id="dev-pw-len" type="number" min="6" max="64" value="16"></div>
      <div class="field"><label>Loại ký tự</label><div>
        <label class="chip"><input type="checkbox" id="dev-pw-upper" checked> A–Z</label>
        <label class="chip"><input type="checkbox" id="dev-pw-lower" checked> a–z</label>
        <label class="chip"><input type="checkbox" id="dev-pw-digit" checked> 0–9</label>
        <label class="chip"><input type="checkbox" id="dev-pw-sym" checked> !@#$…</label>
      </div></div>
    </div>
    <button type="button" class="btn btn-primary" id="dev-pw-go">Tạo mật khẩu</button>
    <div id="dev-pw-out"></div>
  </div>

  <div id="dev-pane-words" style="display:none">
    <div class="field"><label for="dev-words-in">Dán văn bản cần đếm</label><textarea id="dev-words-in" rows="6" placeholder="Dán văn bản vào đây…"></textarea></div>
    <div id="dev-words-out"></div>
    <p class="note">Thời gian đọc ước tính theo tốc độ 200 từ/phút.</p>
  </div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(t) : Promise.reject(new Error('no clipboard')));
  const $ = id => root.querySelector('#' + id);
  const panes = ['jwt', 'json', 'b64', 'hash', 'gen', 'words'];
  panes.forEach(k => {
    $('dev-tab-' + k).addEventListener('click', () => {
      panes.forEach(j => {
        $('dev-tab-' + j).classList.toggle('tab-active', j === k);
        $('dev-pane-' + j).style.display = j === k ? '' : 'none';
      });
    });
  });
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function outBox(el, rows) {
    el.innerHTML = '<div class="result">' + rows.map(r => '<div class="result-row"><span>' + r[0] + '</span><strong>' + r[1] + '</strong></div>').join('') + '</div>';
  }
  function copyBtn(el, text) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost copy-btn';
    b.textContent = 'Chép';
    b.addEventListener('click', () => copyText(text).then(() => toast('Đã chép.')).catch(() => toast('Không chép được, hãy chọn và chép tay.')));
    el.appendChild(b);
  }

  // JWT decode (không xác minh chữ ký).
  function b64urlDecode(seg) {
    let s = seg.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  $('dev-jwt-go').addEventListener('click', () => {
    const token = $('dev-jwt-in').value.trim();
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[0] || !parts[1]) {
      $('dev-jwt-out').innerHTML = '<p class="error">Token không đúng định dạng JWT (cần 3 phần ngăn cách bằng dấu chấm).</p>';
      return;
    }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      $('dev-jwt-out').innerHTML = `<div class="result">
        <div class="result-row"><span>Header</span><strong><pre>${esc(JSON.stringify(header, null, 2))}</pre></strong></div>
        <div class="result-row"><span>Payload</span><strong><pre>${esc(JSON.stringify(payload, null, 2))}</pre></strong></div>
        <div class="result-row"><span>Chữ ký</span><strong class="muted">Không xác minh (chỉ giải mã để xem)</strong></div>
      </div>`;
    } catch (e) {
      $('dev-jwt-out').innerHTML = '<p class="error">Không giải mã được token: ' + esc(e.message) + '</p>';
    }
  });

  // JSON.
  function jsonErrLine(text, err) {
    const m = /position (\d+)/i.exec(err.message || '');
    if (!m) return '';
    const pos = +m[1];
    const line = text.slice(0, pos).split('\n').length;
    return ' (khoảng dòng ' + line + ')';
  }
  $('dev-json-pretty').addEventListener('click', () => {
    try {
      const obj = JSON.parse($('dev-json-in').value);
      $('dev-json-in').value = JSON.stringify(obj, null, 2);
      $('dev-json-out').innerHTML = '<p class="note">JSON hợp lệ, đã định dạng đẹp.</p>';
    } catch (e) {
      $('dev-json-out').innerHTML = '<p class="error">JSON lỗi: ' + esc(e.message) + jsonErrLine($('dev-json-in').value, e) + '</p>';
    }
  });
  $('dev-json-min').addEventListener('click', () => {
    try {
      const obj = JSON.parse($('dev-json-in').value);
      $('dev-json-in').value = JSON.stringify(obj);
      $('dev-json-out').innerHTML = '<p class="note">JSON hợp lệ, đã thu gọn.</p>';
    } catch (e) {
      $('dev-json-out').innerHTML = '<p class="error">JSON lỗi: ' + esc(e.message) + jsonErrLine($('dev-json-in').value, e) + '</p>';
    }
  });
  $('dev-json-check').addEventListener('click', () => {
    try {
      JSON.parse($('dev-json-in').value);
      $('dev-json-out').innerHTML = '<p class="note">✓ JSON hợp lệ, không có lỗi.</p>';
    } catch (e) {
      $('dev-json-out').innerHTML = '<p class="error">JSON lỗi: ' + esc(e.message) + jsonErrLine($('dev-json-in').value, e) + '</p>';
    }
  });

  // Base64 Unicode.
  function b64EncodeUnicode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function b64DecodeUnicode(b64) {
    const bin = atob(b64.trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  $('dev-b64-enc').addEventListener('click', () => {
    try {
      const out = b64EncodeUnicode($('dev-b64-in').value);
      $('dev-b64-out').innerHTML = '<div class="result"><div class="result-row"><span>Base64</span><strong id="dev-b64-res">' + esc(out) + '</strong></div></div>';
      copyBtn($('dev-b64-out'), out);
    } catch (e) {
      $('dev-b64-out').innerHTML = '<p class="error">Không mã hóa được: ' + esc(e.message) + '</p>';
    }
  });
  $('dev-b64-dec').addEventListener('click', () => {
    try {
      const out = b64DecodeUnicode($('dev-b64-in').value);
      $('dev-b64-out').innerHTML = '<div class="result"><div class="result-row"><span>Văn bản</span><strong>' + esc(out) + '</strong></div></div>';
      copyBtn($('dev-b64-out'), out);
    } catch (e) {
      $('dev-b64-out').innerHTML = '<p class="error">Chuỗi Base64 không hợp lệ.</p>';
    }
  });

  // SHA hash (async, crypto.subtle).
  $('dev-hash-go').addEventListener('click', () => {
    const text = $('dev-hash-in').value;
    const algo = $('dev-hash-algo').value;
    if (!window.crypto || !window.crypto.subtle) {
      $('dev-hash-out').innerHTML = '<p class="error">Trình duyệt này không hỗ trợ crypto.subtle (cần chạy qua HTTPS hoặc localhost).</p>';
      return;
    }
    $('dev-hash-out').innerHTML = '<p class="note">Đang băm…</p>';
    window.crypto.subtle.digest(algo, new TextEncoder().encode(text)).then(buf => {
      const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      $('dev-hash-out').innerHTML = '<div class="result"><div class="result-row"><span>' + algo + '</span><strong style="word-break:break-all">' + hex + '</strong></div></div>';
      copyBtn($('dev-hash-out'), hex);
    }).catch(e => {
      $('dev-hash-out').innerHTML = '<p class="error">Không băm được: ' + esc(e.message) + '</p>';
    });
  });

  // UUID + mật khẩu.
  $('dev-uuid-go').addEventListener('click', () => {
    let uuid;
    if (window.crypto && window.crypto.randomUUID) {
      uuid = window.crypto.randomUUID();
    } else {
      // Dự phòng cho trình duyệt cũ: UUID v4 từ crypto.getRandomValues.
      const b = new Uint8Array(16);
      window.crypto.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
      uuid = h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
    }
    $('dev-uuid-out').innerHTML = '<div class="result"><div class="result-row"><span>UUID</span><strong>' + uuid + '</strong></div></div>';
    copyBtn($('dev-uuid-out'), uuid);
  });
  $('dev-pw-go').addEventListener('click', () => {
    const len = Math.max(6, Math.min(64, +$('dev-pw-len').value || 16));
    let pool = '';
    if ($('dev-pw-upper').checked) pool += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if ($('dev-pw-lower').checked) pool += 'abcdefghijkmnopqrstuvwxyz';
    if ($('dev-pw-digit').checked) pool += '23456789';
    if ($('dev-pw-sym').checked) pool += '!@#$%^&*()-_=+';
    if (!pool) { $('dev-pw-out').innerHTML = '<p class="error">Chọn ít nhất một loại ký tự.</p>'; return; }
    const rnd = new Uint32Array(len);
    window.crypto.getRandomValues(rnd);
    let pw = '';
    for (let i = 0; i < len; i++) pw += pool[rnd[i] % pool.length];
    $('dev-pw-out').innerHTML = '<div class="result"><div class="result-row"><span>Mật khẩu</span><strong style="word-break:break-all">' + esc(pw) + '</strong></div></div>';
    copyBtn($('dev-pw-out'), pw);
  });

  // Đếm từ.
  function countWords() {
    const text = $('dev-words-in').value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?…]+/).map(s => s.trim()).filter(Boolean).length;
    const minutes = words / 200;
    const readTime = minutes < 1 ? 'dưới 1 phút' : 'khoảng ' + (Math.round(minutes * 10) / 10).toLocaleString('vi-VN') + ' phút';
    outBox($('dev-words-out'), [
      ['Số từ', String(words)],
      ['Số ký tự (kể cả khoảng trắng)', String(chars)],
      ['Số ký tự (không khoảng trắng)', String(charsNoSpace)],
      ['Số câu', String(sentences)],
      ['Thời gian đọc ước tính', readTime],
    ]);
  }
  $('dev-words-in').addEventListener('input', countWords);
  countWords();
}
