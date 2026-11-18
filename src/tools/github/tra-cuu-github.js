// Tra cứu GitHub — tra cứu tài khoản hoặc repo công khai qua API
// công khai của GitHub, trực tiếp từ trình duyệt (không cần key,
// không cần đăng nhập). GitHub giới hạn 60 lượt/giờ cho mỗi địa chỉ
// IP khi không đăng nhập — đủ cho tra cứu lẻ.
export const meta = {
  id: 'tra-cuu-github',
  name: 'Tra cứu GitHub',
  category: 'GitHub',
  categorySlug: 'github',
  desc: 'Nhập tên tài khoản GitHub để xem hồ sơ + 5 repo nhiều sao nhất, hoặc nhập owner/repo để xem sao, fork, ngôn ngữ, giấy phép.',
  keywords: 'tra cứu github, xem hồ sơ github, tra cứu tài khoản github, tra cứu repo github, xem sao github',
  icon: '🐙',
  seoTitle: 'Tra cứu GitHub — Xem hồ sơ tài khoản và repo',
  seoDesc: 'Tra cứu tài khoản GitHub (hồ sơ, followers, 5 repo nhiều sao nhất) hoặc repo công khai (sao, fork, ngôn ngữ, giấy phép, cập nhật cuối) — miễn phí, không cần đăng nhập.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🐙</span><div><h2>Tra cứu GitHub</h2><p class="muted">Xem hồ sơ tài khoản hoặc thông tin repo công khai — dữ liệu trực tiếp từ GitHub.</p></div></div>
  <div class="field"><label for="tcg-mode">Tra cứu gì</label><select id="tcg-mode"><option value="user">Người dùng — hồ sơ tài khoản</option><option value="repo">Repo — thông tin owner/repo</option></select></div>
  <div class="field"><label for="tcg-input" id="tcg-label">Tên tài khoản</label><input id="tcg-input" type="text" placeholder="VD: torvalds" value="torvalds" autocomplete="off" spellcheck="false"></div>
  <button type="button" class="btn btn-primary" id="tcg-go">Tra cứu</button>
  <div id="tcg-out"></div>
  <p class="note">Dữ liệu lấy trực tiếp từ api.github.com, không cần đăng nhập. Chỉ tra được tài khoản và repo công khai. GitHub giới hạn 60 lượt tra cứu/giờ cho mỗi địa chỉ IP khi không đăng nhập.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmtNum(n) { return (n || 0).toLocaleString('vi-VN'); }
  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('vi-VN');
  }
  function blogUrl(b) {
    if (!b) return '';
    return /^https?:\/\//i.test(b) ? b : 'https://' + b;
  }
  function fail(res) {
    if (res.status === 404) throw new Error('notfound');
    if (res.status === 403) throw new Error('rate');
    throw new Error('http' + res.status);
  }

  const LABELS = {
    user: { label: 'Tên tài khoản', placeholder: 'VD: torvalds', sample: 'torvalds' },
    repo: { label: 'Tên repo (owner/repo)', placeholder: 'VD: facebook/react', sample: 'facebook/react' },
  };
  $('tcg-mode').addEventListener('change', () => {
    const m = LABELS[$('tcg-mode').value];
    $('tcg-label').textContent = m.label;
    $('tcg-input').placeholder = m.placeholder;
    $('tcg-input').value = m.sample;
    $('tcg-out').innerHTML = '';
  });

  function showError(kind, what) {
    if (kind === 'notfound') {
      $('tcg-out').innerHTML = '<p class="error">Không tìm thấy ' + what + ' này — kiểm tra lại tên rồi thử lại nhé.</p>';
    } else if (kind === 'rate') {
      $('tcg-out').innerHTML = '<p class="error">GitHub giới hạn 60 lượt tra cứu/giờ — bạn đã tra nhiều quá, thử lại sau ít phút nhé.</p>';
    } else {
      $('tcg-out').innerHTML = '<p class="error">Không kết nối được tới GitHub — kiểm tra mạng rồi thử lại nhé.</p>';
    }
  }

  function renderUser(u, topRepos) {
    let rows = `<div class="result">
      <div class="result-row"><span>Ảnh đại diện</span><strong><img src="${esc(u.avatar_url)}" alt="Ảnh đại diện của ${esc(u.login)}" width="72" height="72" style="border-radius:50%" loading="lazy"></strong></div>
      <div class="result-row"><span>Tài khoản</span><strong><a href="${esc(u.html_url)}" target="_blank" rel="noopener">${esc(u.login)}</a></strong></div>
      <div class="result-row"><span>Tên hiển thị</span><strong>${esc(u.name || '—')}</strong></div>
      <div class="result-row"><span>Giới thiệu</span><strong>${esc(u.bio || 'Không có giới thiệu.')}</strong></div>
      <div class="result-row"><span>Repo công khai</span><strong>${fmtNum(u.public_repos)}</strong></div>
      <div class="result-row"><span>Người theo dõi</span><strong>${fmtNum(u.followers)}</strong></div>
      <div class="result-row"><span>Đang theo dõi</span><strong>${fmtNum(u.following)}</strong></div>
      <div class="result-row"><span>Vị trí</span><strong>${esc(u.location || '—')}</strong></div>
      <div class="result-row"><span>Trang web</span><strong>${u.blog ? `<a href="${esc(blogUrl(u.blog))}" target="_blank" rel="noopener">${esc(u.blog)}</a>` : '—'}</strong></div>
      <div class="result-row"><span>Tài khoản tạo ngày</span><strong>${fmtDate(u.created_at)}</strong></div>`;
    if (topRepos && topRepos.length) {
      rows += '<div class="result-row"><span>5 repo nhiều sao nhất</span><strong>' +
        topRepos.map(r => `<a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a> — ⭐ ${fmtNum(r.stargazers_count)}${r.description ? '<br><span class="muted">' + esc(r.description) + '</span>' : ''}`).join('<br><br>') +
        '</strong></div>';
    }
    rows += '</div>';
    $('tcg-out').innerHTML = rows;
  }

  function renderRepo(r) {
    $('tcg-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Repo</span><strong><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.full_name)}</a></strong></div>
      <div class="result-row"><span>Mô tả</span><strong>${esc(r.description || 'Không có mô tả.')}</strong></div>
      <div class="result-row"><span>⭐ Sao</span><strong>${fmtNum(r.stargazers_count)}</strong></div>
      <div class="result-row"><span>🍴 Fork</span><strong>${fmtNum(r.forks_count)}</strong></div>
      <div class="result-row"><span>Ngôn ngữ chính</span><strong>${esc(r.language || '—')}</strong></div>
      <div class="result-row"><span>Giấy phép</span><strong>${esc((r.license && r.license.spdx_id) || 'Không rõ')}</strong></div>
      <div class="result-row"><span>Vấn đề đang mở</span><strong>${fmtNum(r.open_issues_count)}</strong></div>
      <div class="result-row"><span>Ngày tạo</span><strong>${fmtDate(r.created_at)}</strong></div>
      <div class="result-row"><span>Cập nhật cuối</span><strong>${r.updated_at ? new Date(r.updated_at).toLocaleString('vi-VN') : '—'}</strong></div>
    </div>`;
  }

  $('tcg-go').addEventListener('click', () => {
    const mode = $('tcg-mode').value;
    const raw = $('tcg-input').value.trim();
    if (!raw) {
      $('tcg-out').innerHTML = '<p class="error">Nhập tên tài khoản hoặc tên repo trước khi tra cứu nhé.</p>';
      return;
    }
    if (mode === 'user') {
      const username = raw.replace(/^https?:\/\/github\.com\//i, '').replace(/^@/, '').replace(/\/$/, '');
      if (!/^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?$/.test(username) || username.length > 39) {
        $('tcg-out').innerHTML = '<p class="error">Tên tài khoản GitHub chỉ gồm chữ, số và dấu gạch ngang — VD: torvalds.</p>';
        return;
      }
      $('tcg-out').innerHTML = '<p class="note">Đang tra cứu…</p>';
      fetch('https://api.github.com/users/' + encodeURIComponent(username), { headers: { Accept: 'application/vnd.github+json' } })
        .then(res => { if (!res.ok) fail(res); return res.json(); })
        .then(u => {
          // Lấy 5 repo nhiều sao nhất qua Search API — endpoint liệt kê
          // repo (/users/:u/repos) KHÔNG hỗ trợ sort=stars (đã kiểm
          // chứng: tham số bị bỏ qua, trả về không theo sao).
          fetch('https://api.github.com/search/repositories?q=user:' + encodeURIComponent(username) + '&sort=stars&per_page=5', { headers: { Accept: 'application/vnd.github+json' } })
            .then(res => { if (!res.ok) throw new Error('repos'); return res.json(); })
            .then(data => renderUser(u, data.items || []))
            .catch(() => renderUser(u, null));
        })
        .catch(err => showError(err && err.message, 'tài khoản'));
    } else {
      const input = raw.replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
      const m = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(input);
      if (!m) {
        $('tcg-out').innerHTML = '<p class="error">Nhập đúng dạng owner/repo — VD: facebook/react.</p>';
        return;
      }
      $('tcg-out').innerHTML = '<p class="note">Đang tra cứu…</p>';
      fetch('https://api.github.com/repos/' + m[1] + '/' + m[2], { headers: { Accept: 'application/vnd.github+json' } })
        .then(res => { if (!res.ok) fail(res); return res.json(); })
        .then(r => renderRepo(r))
        .catch(err => showError(err && err.message, 'repo'));
    }
  });
}
