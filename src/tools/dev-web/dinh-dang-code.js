// Định dạng code bằng Prettier 3.10.1 (MIT, đã vendored).
// Bộ lõi nạp sẵn theo trang; plugin từng ngôn ngữ tải lười khi chọn
// ngôn ngữ đó. Nút "Định dạng" chạy Prettier thật, không phải xếp tay.
export const meta = {
  id: 'dinh-dang-code',
  name: 'Định dạng code (Prettier)',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Dán code JavaScript, TypeScript, JSON, CSS, HTML, Markdown hoặc YAML rồi bấm Định dạng — Prettier xếp lại đúng chuẩn từng ngôn ngữ, chép kết quả về dùng ngay.',
  keywords: 'định dạng code, format code, prettier, xếp đẹp code, format json, format javascript, format css, format html, làm đẹp code',
  icon: '🧹',
  seoTitle: 'Định dạng code online miễn phí (Prettier) — JS, TS, JSON, CSS, HTML',
  seoDesc: 'Định dạng code online miễn phí bằng Prettier: JavaScript, TypeScript, JSON, CSS, HTML, Markdown, YAML — dán code, bấm Định dạng, chép kết quả về dùng ngay.',
};

const EX_JS = `const  ten = "An";function chao(ten){return "Xin chào, "+ten+"!"}const ds=[1,2,3];ds.forEach((n)=>{console.log(chao(ten),n)});`;

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="grid-2">
          <div class="field"><label for="ddc-lang">Ngôn ngữ</label><select id="ddc-lang"><option value="javascript" selected>JavaScript</option><option value="typescript">TypeScript</option><option value="json">JSON</option><option value="css">CSS</option><option value="html">HTML</option><option value="markdown">Markdown</option><option value="yaml">YAML</option></select></div>
          <div class="field"><label>Thử nhanh</label><div><button type="button" class="btn btn-ghost" id="ddc-ex">Điền ví dụ</button></div></div>
        </div>
        <div class="field"><label for="ddc-in">Code cần định dạng</label><textarea id="ddc-in" rows="10" spellcheck="false" placeholder="Dán code vào đây…">${EX_JS}</textarea></div>
        <button type="button" class="btn btn-primary" id="ddc-go">Định dạng</button>
        <p class="muted small" id="ddc-status"></p>
        <div id="ddc-err"></div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <p class="muted" id="ddc-empty">Bấm Định dạng để xem code đã xếp đẹp.</p>
      <div class="result" id="ddc-wrap" hidden>
        <pre class="ddc-out" id="ddc-out"></pre>
        <div class="m2-result-actions">
          <button type="button" class="btn btn-ghost" id="ddc-copy">Chép kết quả</button>
          <button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button>
          <button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button>
          <button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button>
        </div>
      </div>
    </div>
  </div>
  <p class="note">Công cụ này dùng Prettier — bộ định dạng code chuẩn, xếp lại thụt lề, dấu cách, dấu chấm phẩy và xuống dòng đúng quy tắc từng ngôn ngữ. Khác với công cụ Dev Tools (chỉ xếp đẹp JSON nhanh), đây là định dạng thật cho cả 7 ngôn ngữ. Bộ định dạng từng ngôn ngữ chỉ tải khi bạn chọn ngôn ngữ đó (lần đầu chờ vài giây). Code chỉ xử lý trên máy của bạn.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => { try { navigator.clipboard.writeText(t); return Promise.resolve(true); } catch (e) { return Promise.resolve(false); } });
  const $ = id => root.querySelector('#' + id);
  // Mọi dữ liệu dùng trong init phải khai báo TRONG init (init nhúng qua init.toString()).
  const LANGS = {
    javascript: { label: 'JavaScript', parser: 'babel', plugins: ['babel', 'estree'] },
    typescript: { label: 'TypeScript', parser: 'typescript', plugins: ['typescript', 'estree'] },
    json: { label: 'JSON', parser: 'json', plugins: ['babel', 'estree'] },
    css: { label: 'CSS', parser: 'css', plugins: ['postcss'] },
    html: { label: 'HTML', parser: 'html', plugins: ['html'] },
    markdown: { label: 'Markdown', parser: 'markdown', plugins: ['markdown'] },
    yaml: { label: 'YAML', parser: 'yaml', plugins: ['yaml'] },
  };
  const EXAMPLES = {
    javascript: `const  ten = "An";function chao(ten){return "Xin chào, "+ten+"!"}const ds=[1,2,3];ds.forEach((n)=>{console.log(chao(ten),n)});`,
    typescript: `type Nguoi={ten:string;tuoi:number};const a:Nguoi={ten:"An",tuoi:26};function tang(n:number):number{return n+1;}`,
    json: `{"ten":"An","tuoi":26,"thich":["doc sach","chay bo"],"diaChi":{"thanhPho":"TP.HCM"}}`,
    css: `.hop{color:red;background:#fff;margin:0;padding:10px}.hop a{color:blue;text-decoration:none}`,
    html: `<div class="hop"><h1>Tieu de</h1><p>Doan van <b>dam</b> va <a href="#">lien ket</a>.</p></div>`,
    markdown: `# Tieu de\n\nDoan **dam** va *nghieng*.\n\n- muc 1\n- muc 2`,
    yaml: `ten: An\ntuoi: 26\nthich:\n- doc sach\n- chay bo\ndiaChi:\n  thanhPho: TP.HCM`,
  };

  const langEl = $('ddc-lang'), inEl = $('ddc-in'), goBtn = $('ddc-go');
  const statusEl = $('ddc-status'), errEl = $('ddc-err'), wrapEl = $('ddc-wrap'), outEl = $('ddc-out');
  const loaded = {};
  let lastOut = '';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Không tải được ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensurePlugins(lang) {
    const need = (LANGS[lang] || LANGS.javascript).plugins;
    for (const name of need) {
      if (loaded[name]) continue;
      await loadScript('/assets/vendor/prettier-plugin-' + name + '.js');
      loaded[name] = true;
    }
  }

  async function format() {
    const code = inEl.value;
    const lang = langEl.value;
    errEl.innerHTML = '';
    if (!code.trim()) {
      errEl.innerHTML = '<p class="error">Hãy dán code cần định dạng vào ô trên.</p>';
      wrapEl.hidden = true;
      $('ddc-empty').style.display = '';
      return;
    }
    if (typeof window.prettier === 'undefined' || typeof window.prettier.format !== 'function') {
      errEl.innerHTML = '<p class="error">Bộ định dạng chưa tải xong. Hãy tải lại trang.</p>';
      return;
    }
    goBtn.disabled = true;
    try {
      statusEl.textContent = 'Đang tải bộ định dạng ' + (LANGS[lang] || {}).label + '…';
      await ensurePlugins(lang);
      statusEl.textContent = 'Đang định dạng…';
      const out = await window.prettier.format(code, {
        parser: (LANGS[lang] || LANGS.javascript).parser,
        plugins: window.prettierPlugins,
      });
      lastOut = out;
      outEl.textContent = out;
      wrapEl.hidden = false;
      $('ddc-empty').style.display = 'none';
      statusEl.textContent = 'Đã định dạng xong (' + (LANGS[lang] || {}).label + ').';
      toast('Đã định dạng xong.');
    } catch (e) {
      wrapEl.hidden = true;
      $('ddc-empty').style.display = '';
      const msg = (e && e.message ? String(e.message) : 'Code chưa đúng cú pháp.').split('\n').slice(0, 2).join(' ').slice(0, 300);
      errEl.innerHTML = '<p class="error">Không định dạng được: ' + msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>';
      statusEl.textContent = '';
    } finally {
      goBtn.disabled = false;
      if (statusEl.textContent.indexOf('Đang tải') === 0 || statusEl.textContent.indexOf('Đang định dạng') === 0) statusEl.textContent = '';
    }
  }

  goBtn.addEventListener('click', format);
  $('ddc-ex').addEventListener('click', () => {
    inEl.value = EXAMPLES[langEl.value] || EXAMPLES.javascript;
    errEl.innerHTML = '';
    wrapEl.hidden = true;
    $('ddc-empty').style.display = '';
    statusEl.textContent = '';
  });
  langEl.addEventListener('change', () => {
    errEl.innerHTML = '';
    wrapEl.hidden = true;
    $('ddc-empty').style.display = '';
    statusEl.textContent = '';
  });
  $('ddc-copy').addEventListener('click', async () => {
    if (!lastOut) { toast('Chưa có kết quả để chép — hãy bấm Định dạng trước.'); return; }
    const ok = await copyText(lastOut);
    toast(ok === false ? 'Không chép được. Hãy bôi đen kết quả rồi chép tay.' : 'Đã chép code đã định dạng.');
  });
}
