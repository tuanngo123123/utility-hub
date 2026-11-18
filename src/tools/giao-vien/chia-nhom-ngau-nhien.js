// Chia nhóm ngẫu nhiên trong lớp: theo số bạn mỗi nhóm hoặc số nhóm.
// Xáo trộn rồi chia đều — các nhóm lệch nhau tối đa 1 bạn. Sao chép
// và tải kết quả về (.txt) ngay trên trình duyệt.
export const meta = {
  id: 'chia-nhom-ngau-nhien',
  name: 'Chia nhóm ngẫu nhiên',
  category: 'Giáo viên',
  categorySlug: 'giao-vien',
  desc: 'Chia lớp thành nhóm ngẫu nhiên: theo số bạn mỗi nhóm hoặc số nhóm, các nhóm lệch nhau tối đa 1 bạn, sao chép và tải kết quả về.',
  keywords: 'chia nhóm ngẫu nhiên, chia nhóm học sinh, chia đội, chia nhóm lớp học',
  icon: '👥',
  seoTitle: 'Chia nhóm ngẫu nhiên — đều người, tải kết quả về',
  seoDesc: 'Dán danh sách lớp, chia nhóm ngẫu nhiên theo số bạn mỗi nhóm hoặc số nhóm — các nhóm lệch nhau tối đa 1 bạn. Sao chép và tải về miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><div><h2>Chia nhóm ngẫu nhiên</h2><p class="muted">Dán danh sách lớp, chọn cách chia — các nhóm được xáo trộn và chia đều, lệch nhau tối đa 1 bạn.</p></div></div>
  <div class="field"><label for="cn-names">Danh sách lớp (mỗi bạn một dòng)</label><textarea id="cn-names" rows="6" placeholder="Mai&#10;Nam&#10;Phương&#10;Tuấn">Mai
Nam
Phương
Tuấn
Hương
Đức
Linh
Khoa
Thảo
Bình
An
Chi</textarea></div>
  <div class="field"><label for="cn-mode">Chia theo</label><select id="cn-mode"><option value="size" selected>Số bạn mỗi nhóm</option><option value="count">Số nhóm</option></select></div>
  <div class="field"><label for="cn-num" id="cn-num-label">Số bạn mỗi nhóm</label><input id="cn-num" type="number" min="2" max="50" value="4"></div>
  <div>
    <button type="button" class="btn btn-primary" id="cn-divide">Chia nhóm</button>
  </div>
  <div class="result" id="cn-out" hidden></div>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  let groups = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function nameList() {
    const seen = {};
    const out = [];
    $('cn-names').value.split(/\n+/).forEach(s => {
      const t = s.trim();
      if (t && !seen[t]) { seen[t] = true; out.push(t); }
    });
    return out;
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function groupsText() {
    const today = new Date().toLocaleDateString('vi-VN');
    const total = groups.reduce((a, g) => a + g.length, 0);
    let text = 'Danh sách nhóm — ngày ' + today + '\nTổng: ' + total + ' bạn, ' + groups.length + ' nhóm\n\n';
    groups.forEach((g, i) => {
      text += 'Nhóm ' + (i + 1) + ' (' + g.length + ' bạn)\n';
      g.forEach(n => { text += '- ' + n + '\n'; });
      text += '\n';
    });
    return text;
  }

  function render() {
    const out = $('cn-out');
    const total = groups.reduce((a, g) => a + g.length, 0);
    out.innerHTML = '<p><strong>Đã chia thành ' + groups.length + ' nhóm · ' + total + ' bạn</strong></p>'
      + '<div class="gv-groups">'
      + groups.map((g, i) => '<div class="gv-group"><h3>Nhóm ' + (i + 1) + ' · ' + g.length + ' bạn</h3><ul>'
        + g.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul></div>').join('')
      + '</div>'
      + '<div class="btn-row" style="margin-top:14px">'
      + '<button type="button" class="btn" id="cn-reshuffle">Chia lại</button>'
      + '<button type="button" class="btn" id="cn-copy">Sao chép kết quả</button>'
      + '<button type="button" class="btn gv-dl" id="cn-download"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải danh sách (.txt)</button>'
      + '</div>';
    out.hidden = false;
    out.style.display = '';
    $('cn-reshuffle').addEventListener('click', divide);
    $('cn-copy').addEventListener('click', () => {
      const btn = $('cn-copy');
      const done = () => {
        btn.textContent = 'Đã sao chép!';
        setTimeout(() => { btn.textContent = 'Sao chép kết quả'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(groupsText()).then(done, () => fallbackCopy(done));
      } else {
        fallbackCopy(done);
      }
    });
    $('cn-download').addEventListener('click', () => download('chia-nhom.txt', groupsText()));
  }

  function fallbackCopy(done) {
    const ta = document.createElement('textarea');
    ta.value = groupsText();
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* bỏ qua */ }
    ta.remove();
    done();
  }

  function divide() {
    const list = nameList();
    const out = $('cn-out');
    if (list.length < 2) {
      out.innerHTML = '<p class="error">Cần ít nhất 2 bạn để chia nhóm.</p>';
      out.hidden = false;
      out.style.display = '';
      return;
    }
    const mode = $('cn-mode').value;
    const num = parseInt($('cn-num').value, 10);
    if (!num || num < 2) {
      out.innerHTML = '<p class="error">Nhập số từ 2 trở lên.</p>';
      out.hidden = false;
      out.style.display = '';
      return;
    }
    let groupCount;
    if (mode === 'count') {
      if (num > list.length) {
        out.innerHTML = '<p class="error">Số nhóm không được nhiều hơn số bạn (' + list.length + ' bạn).</p>';
        out.hidden = false;
        out.style.display = '';
        return;
      }
      groupCount = num;
    } else {
      groupCount = Math.ceil(list.length / num);
    }
    // Xáo trộn rồi chia vòng tròn — các nhóm lệch nhau tối đa 1 bạn.
    const shuffled = list.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    groups = [];
    for (let i = 0; i < groupCount; i++) groups.push([]);
    shuffled.forEach((n, i) => { groups[i % groupCount].push(n); });
    render();
  }

  $('cn-mode').addEventListener('change', () => {
    $('cn-num-label').textContent = $('cn-mode').value === 'count' ? 'Số nhóm' : 'Số bạn mỗi nhóm';
  });
  $('cn-divide').addEventListener('click', divide);
}
