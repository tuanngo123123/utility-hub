// Tra cứu repo GitHub — nhập owner/repo → sao, fork, ngôn ngữ, giấy phép, cập nhật cuối.
export const meta = {
  id: 'tra-cuu-repo',
  name: 'Tra cứu repo GitHub',
  category: 'GitHub',
  categorySlug: 'github',
  desc: 'Nhập owner/repo (VD: facebook/react) để xem số sao, fork, ngôn ngữ chính, giấy phép và lần cập nhật cuối.',
  keywords: 'tra cứu repo github, xem sao github, thông tin repository, github repo info',
  icon: '🔍',
  seoTitle: 'Tra cứu repo GitHub — Xem sao, fork, ngôn ngữ',
  seoDesc: 'Nhập owner/repo để xem số sao, fork, ngôn ngữ chính, giấy phép và lần cập nhật cuối của bất kỳ repo GitHub công khai nào.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔍</span><div><h2>Tra cứu repo GitHub</h2><p class="muted">Nhập tên repo dạng owner/repo — VD: facebook/react, microsoft/vscode.</p></div></div>
  <div class="field"><label for="tcr-repo">Tên repo (owner/repo)</label><input id="tcr-repo" type="text" placeholder="VD: facebook/react" value="facebook/react"></div>
  <button type="button" class="btn btn-primary" id="tcr-go">Tra cứu</button>
  <div id="tcr-out"></div>
  <p class="note">Dữ liệu lấy trực tiếp từ api.github.com, không cần đăng nhập. Chỉ tra được repo công khai.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmtNum(n) { return (n || 0).toLocaleString('vi-VN'); }

  $('tcr-go').addEventListener('click', () => {
    const input = $('tcr-repo').value.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
    const m = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(input);
    if (!m) {
      $('tcr-out').innerHTML = '<p class="error">Nhập đúng dạng owner/repo — VD: facebook/react.</p>';
      return;
    }
    $('tcr-out').innerHTML = '<p class="note">Đang tra cứu…</p>';
    fetch('https://api.github.com/repos/' + m[1] + '/' + m[2], { headers: { Accept: 'application/vnd.github+json' } })
      .then(res => {
        if (res.status === 404) throw new Error('notfound');
        if (res.status === 403) throw new Error('rate');
        if (!res.ok) throw new Error('http' + res.status);
        return res.json();
      })
      .then(r => {
        const updated = r.updated_at ? new Date(r.updated_at).toLocaleString('vi-VN') : '—';
        const created = r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '—';
        $('tcr-out').innerHTML = `<div class="result">
          <div class="result-row"><span>Repo</span><strong><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.full_name)}</a></strong></div>
          <div class="result-row"><span>Mô tả</span><strong>${esc(r.description || 'Không có mô tả.')}</strong></div>
          <div class="result-row"><span>⭐ Sao</span><strong>${fmtNum(r.stargazers_count)}</strong></div>
          <div class="result-row"><span>🍴 Fork</span><strong>${fmtNum(r.forks_count)}</strong></div>
          <div class="result-row"><span>Ngôn ngữ chính</span><strong>${esc(r.language || '—')}</strong></div>
          <div class="result-row"><span>Giấy phép</span><strong>${esc((r.license && r.license.spdx_id) || 'Không rõ')}</strong></div>
          <div class="result-row"><span>Vấn đề đang mở</span><strong>${fmtNum(r.open_issues_count)}</strong></div>
          <div class="result-row"><span>Ngày tạo</span><strong>${created}</strong></div>
          <div class="result-row"><span>Cập nhật cuối</span><strong>${updated}</strong></div>
        </div>`;
      })
      .catch(err => {
        if (err && err.message === 'notfound') {
          $('tcr-out').innerHTML = '<p class="error">Không tìm thấy repo "' + esc(input) + '". Kiểm tra lại tên owner/repo nhé.</p>';
        } else if (err && err.message === 'rate') {
          $('tcr-out').innerHTML = '<p class="error">GitHub giới hạn 60 lượt/giờ, thử lại sau.</p>';
        } else {
          $('tcr-out').innerHTML = '<p class="error">Chưa tải được dữ liệu từ GitHub, thử lại sau.</p>';
        }
      });
  });
}
