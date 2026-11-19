// Tạo README & badge — nhập tên dự án + mô tả + giấy phép + tính năng → sinh README.md mẫu.
export const meta = {
  id: 'tao-readme-badge',
  name: 'Tạo README & badge',
  category: 'GitHub',
  categorySlug: 'github',
  desc: 'Nhập tên dự án, mô tả, giấy phép và tính năng để sinh file README.md mẫu có badge shields.io, kèm nút chép và tải file.',
  keywords: 'tạo readme, readme mẫu, badge shields.io, github readme generator, viết readme',
  icon: '📝',
  seoTitle: 'Tạo README & badge — Sinh README.md cho dự án GitHub',
  seoDesc: 'Sinh file README.md mẫu với badge shields.io, phần cài đặt và sử dụng. Chép hoặc tải file .md về dùng ngay.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📝</span><div><h2>Tạo README & badge</h2><p class="muted">Điền thông tin dự án để sinh README.md mẫu có badge, cài đặt và hướng dẫn sử dụng.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="trb-name">Tên dự án</label><input id="trb-name" type="text" placeholder="Ví dụ: tien-ich-hub" value="du-an-cua-toi"></div>
    <div class="field"><label for="trb-owner">Tên GitHub (owner, để làm badge)</label><input id="trb-owner" type="text" placeholder="Ví dụ: nguyenan"></div>
    <div class="field"><label for="trb-license">Giấy phép</label><select id="trb-license"><option value="MIT">MIT</option><option value="Apache-2.0">Apache 2.0</option><option value="GPL-3.0">GPL 3.0</option><option value="BSD-3-Clause">BSD 3-Clause</option><option value="">Không ghi giấy phép</option></select></div>
    <div class="field"><label for="trb-lang">Ngôn ngữ chính</label><input id="trb-lang" type="text" placeholder="Ví dụ: JavaScript" value="JavaScript"></div>
  </div>
  <div class="field"><label for="trb-desc">Mô tả ngắn (1–2 câu)</label><textarea id="trb-desc" rows="2" placeholder="Ví dụ: Bộ công cụ tiện ích trực tuyến chạy hoàn toàn trên trình duyệt."></textarea></div>
  <div class="field"><label for="trb-features">Tính năng chính (mỗi tính năng một dòng)</label><textarea id="trb-features" rows="4" placeholder="Chạy hoàn toàn trên trình duyệt&#10;Không cần đăng nhập&#10;Giao diện tiếng Việt">Chạy hoàn toàn trên trình duyệt
Không cần đăng nhập
Giao diện tiếng Việt</textarea></div>
  <div class="field"><label for="trb-install">Lệnh cài đặt (tùy chọn)</label><input id="trb-install" type="text" placeholder="Ví dụ: npm install" value="npm install"></div>
  <div class="field"><label for="trb-usage">Lệnh chạy / sử dụng (tùy chọn)</label><input id="trb-usage" type="text" placeholder="Ví dụ: npm start" value="npm start"></div>
  <button type="button" class="btn btn-primary" id="trb-go">Sinh README.md</button>
  <div id="trb-out"></div>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(t) : Promise.reject(new Error('no clipboard')));
  const $ = id => root.querySelector('#' + id);
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  let lastMd = '';

  $('trb-go').addEventListener('click', () => {
    const name = $('trb-name').value.trim() || 'du-an-cua-toi';
    const owner = $('trb-owner').value.trim();
    const license = $('trb-license').value;
    const lang = $('trb-lang').value.trim();
    const desc = $('trb-desc').value.trim();
    const features = $('trb-features').value.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const install = $('trb-install').value.trim();
    const usage = $('trb-usage').value.trim();
    const repo = owner ? owner + '/' + name : name;

    const badges = [];
    if (license) badges.push(`[![License](https://img.shields.io/badge/license-${encodeURIComponent(license)}-blue.svg)](LICENSE)`);
    if (owner) {
      badges.push(`[![GitHub stars](https://img.shields.io/github/stars/${repo}.svg)](https://github.com/${repo}/stargazers)`);
      badges.push(`[![GitHub forks](https://img.shields.io/github/forks/${repo}.svg)](https://github.com/${repo}/network)`);
    }
    if (lang) badges.push(`[![${lang}](https://img.shields.io/badge/made%20with-${encodeURIComponent(lang)}-brightgreen.svg)]()`);

    let md = '# ' + name + '\n\n';
    if (badges.length) md += badges.join(' ') + '\n\n';
    if (desc) md += desc + '\n\n';
    if (features.length) {
      md += '## Tính năng\n\n';
      features.forEach(f => { md += '- ' + f + '\n'; });
      md += '\n';
    }
    md += '## Cài đặt\n\n```bash\n' + (install || '# Chưa có lệnh cài đặt') + '\n```\n\n';
    md += '## Sử dụng\n\n```bash\n' + (usage || '# Chưa có lệnh chạy') + '\n```\n\n';
    if (license) md += '## Giấy phép\n\nDự án này được phát hành theo giấy phép ' + license + '. Xem file `LICENSE` để biết chi tiết.\n';
    lastMd = md;

    $('trb-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Xem trước README.md</span><strong><pre style="white-space:pre-wrap;word-break:break-word;text-align:left">${esc(md)}</pre></strong></div>
    </div>
    <p><button type="button" class="btn btn-primary" id="trb-copy">Chép README.md</button>
    <button type="button" class="btn btn-ghost" id="trb-dl">Tải file README.md</button></p>`;
    $('trb-copy').addEventListener('click', () => copyText(lastMd).then(() => toast('Đã chép README.md.')).catch(() => toast('Không chép được, hãy chọn và chép tay.')));
    $('trb-dl').addEventListener('click', () => {
      try {
        const blob = new Blob([lastMd], { type: 'text/markdown;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'README.md';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      } catch (e) {
        toast('Không tải được file, thử lại sau.');
      }
    });
  });
}
