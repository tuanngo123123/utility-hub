// GitHub Trending — top 10 repo mới nổi 7 ngày gần nhất qua api.github.com (không key).
export const meta = {
  id: 'github-trending',
  name: 'GitHub Trending',
  category: 'GitHub',
  categorySlug: 'github',
  desc: 'Top 10 repo GitHub được sao nhiều nhất trong 7 ngày gần nhất, kèm ngôn ngữ, sao, fork và mô tả.',
  keywords: 'github trending, repo hot github, trending github hôm nay, repo nhiều sao nhất',
  icon: '🔥',
  seoTitle: 'GitHub Trending — Top 10 repo hot 7 ngày qua',
  seoDesc: 'Xem top 10 repo GitHub được sao nhiều nhất 7 ngày gần nhất: ngôn ngữ, số sao, fork và mô tả, cập nhật trực tiếp từ GitHub.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔥</span><div><h2>GitHub Trending</h2><p class="muted">Top 10 repo được tạo và được sao nhiều nhất trong 7 ngày gần nhất.</p></div></div>
  <div>
    <button type="button" class="btn btn-primary" id="ght-load">Tải danh sách trending</button>
    <button type="button" class="btn btn-ghost" id="ght-retry" style="display:none">Thử lại</button>
  </div>
  <div id="ght-out"><p class="note">Bấm "Tải danh sách trending" để xem top 10 repo hot nhất tuần qua.</p></div>
  <p class="note">Dữ liệu lấy trực tiếp từ api.github.com, không cần đăng nhập. GitHub giới hạn 60 lượt gọi/giờ cho người dùng không đăng nhập.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmtNum(n) { return (n || 0).toLocaleString('vi-VN'); }

  function load() {
    $('ght-out').innerHTML = '<p class="note">Đang tải từ GitHub…</p>';
    $('ght-retry').style.display = 'none';
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const since = d.toISOString().slice(0, 10);
    const url = 'https://api.github.com/search/repositories?q=created:%3E' + since + '&sort=stars&order=desc&per_page=10';
    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(res => {
        if (res.status === 403) throw new Error('rate');
        if (!res.ok) throw new Error('http' + res.status);
        return res.json();
      })
      .then(data => {
        const items = data.items || [];
        if (!items.length) {
          $('ght-out').innerHTML = '<p class="note">Không có repo nào trong 7 ngày qua. Thử lại sau nhé.</p>';
          return;
        }
        $('ght-out').innerHTML = items.map((r, i) => `<div class="result">
          <div class="result-row"><span><strong>${i + 1}. <a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.full_name)}</a></strong></span><strong>⭐ ${fmtNum(r.stargazers_count)}</strong></div>
          <div class="result-row"><span class="muted">${esc(r.description || 'Không có mô tả.')}</span><span class="muted">${esc(r.language || '—')} · 🍴 ${fmtNum(r.forks_count)} fork</span></div>
        </div>`).join('');
      })
      .catch(err => {
        if (err && err.message === 'rate') {
          $('ght-out').innerHTML = '<p class="error">GitHub giới hạn 60 lượt/giờ, thử lại sau.</p>';
        } else {
          $('ght-out').innerHTML = '<p class="error">Chưa tải được dữ liệu từ GitHub. Kiểm tra mạng hoặc thử lại sau vài phút.</p>';
        }
        $('ght-retry').style.display = '';
      });
  }

  $('ght-load').addEventListener('click', load);
  $('ght-retry').addEventListener('click', load);
}
