// GitHub Trending — top repo mới nổi 7 ngày gần nhất, lấy từ dữ liệu do
// chính Tiện Ích Hub tổng hợp (/data/trending.json, làm mới mỗi ngày qua
// GitHub Action). CHỈ hiện repo đã có mô tả tiếng Việt (trường `purpose`
// do scripts/summarize-trending.mjs viết) + lọc bỏ repo dạng crack /
// bypass / hack / mã mời — đồng bộ với bộ lọc trong scripts/fetch-data.mjs
// (TRENDING_BLOCKLIST + TRENDING_BLOCK_KEYWORDS). Không gọi api.github.com
// trực tiếp nữa: trang chủ từng tự hiện mô tả tiếng Trung chưa dịch và repo
// lách đăng ký/mã mời qua dữ liệu thô (19/11/2026).
export const meta = {
  id: 'github-trending',
  name: 'GitHub Trending',
  category: 'GitHub',
  categorySlug: 'github',
  desc: 'Top repo GitHub mới nổi trong 7 ngày gần nhất, đã có mô tả tiếng Việt — kèm ngôn ngữ và số sao.',
  keywords: 'github trending, repo hot github, trending github hôm nay, repo nhiều sao nhất',
  icon: '🔥',
  seoTitle: 'GitHub Trending — repo hot 7 ngày qua, mô tả tiếng Việt',
  seoDesc: 'Top repo GitHub mới nổi trong 7 ngày gần nhất, chỉ hiện repo đã có mô tả tiếng Việt: ngôn ngữ, số sao và mô tả, dữ liệu làm mới hằng ngày.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔥</span><div><h2>GitHub Trending</h2><p class="muted">Top repo được tạo và được sao nhiều nhất trong 7 ngày gần nhất — chỉ hiện repo đã có mô tả tiếng Việt.</p></div></div>
  <div id="ght-out"><p class="note">Đang tải danh sách trending…</p></div>
  <div><button type="button" class="btn btn-ghost" id="ght-retry" style="display:none">Thử lại</button></div>
  <p class="note" id="ght-updated"></p>
  <p class="note">Dữ liệu do Tiện Ích Hub tổng hợp từ GitHub, làm mới hằng ngày. Repo dạng crack, bypass, hack hoặc lách đăng ký/mã mời không hiện ở đây.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmtNum(n) { return (n || 0).toLocaleString('vi-VN'); }

  // Lọc an toàn phía trình duyệt — bản sao của bộ lọc trong
  // scripts/fetch-data.mjs (giữ đồng bộ khi sửa một bên). Repo lọt qua
  // Action vẫn bị chặn ở đây trước khi hiện.
  const BLOCKED_REPOS = ['gylive/google-ultra', 'duwqijlk/muse-protocol', 'hut-hzf/ung220z-tool'];
  const BLOCK_KEYWORDS = [
    /\bcrack\b/i, /\bbypass\b/i, /\bkeygen\b/i, /\bhack\b/i, /\bhacking\b/i,
    /\bstealer\b/i, /\bphishing\b/i, /\bmalware\b/i, /\bransomware\b/i,
    /\bbotnet\b/i, /\bddos\b/i, /invite[- ]code/i, /free[- ]trial/i,
    /activation[- ]bypass/i, /license[- ]bypass/i, /carrier[- ]unlock/i,
    /modem[- ]unlock/i, /imei[- ]unlock/i, /frp[- ]bypass/i,
    /mã mời/i, /bẻ khóa/i, /phá khóa/i, /lách đăng ký/i,
    /邀请码/, /破解/, /绕过/, /激活码/, /盗版/, /注册机/,
  ];
  function isBlocked(item) {
    const name = String(item.name || item.fullName || '').toLowerCase();
    if (BLOCKED_REPOS.indexOf(name) !== -1) return true;
    const hay = [item.name, item.fullName, item.purpose, item.desc, item.description]
      .filter(Boolean).join(' ');
    return BLOCK_KEYWORDS.some(function (re) { return re.test(hay); });
  }

  function load() {
    $('ght-out').innerHTML = '<p class="note">Đang tải danh sách trending…</p>';
    $('ght-retry').style.display = 'none';
    fetch('/data/trending.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('http' + res.status);
        return res.json();
      })
      .then(function (data) {
        const items = (data && Array.isArray(data.items) ? data.items : [])
          // Chỉ hiện repo đã có mô tả tiếng Việt (purpose) + đã qua bộ lọc.
          .filter(function (it) { return it && String(it.purpose || '').trim() && !isBlocked(it); })
          .slice(0, 6);
        if (data && data.updatedAt) {
          const d = new Date(data.updatedAt);
          $('ght-updated').textContent = 'Dữ liệu cập nhật: '
            + (isNaN(d) ? data.updatedAt : d.toLocaleString('vi-VN'));
        }
        if (!items.length) {
          $('ght-out').innerHTML = '<p class="note">Chưa có repo nào có mô tả tiếng Việt — dữ liệu làm mới hằng ngày, quay lại sau nhé.</p>';
          return;
        }
        $('ght-out').innerHTML = items.map(function (r, i) {
          const name = r.fullName || r.name || '';
          const desc = r.purpose || '';
          return `<div class="result">
          <div class="result-row"><span><strong>${i + 1}. <a href="${esc(r.url || '#')}" target="_blank" rel="noopener">${esc(name)}</a></strong></span><strong>⭐ ${fmtNum(r.stars)}</strong></div>
          <div class="result-row"><span class="muted">${esc(desc)}</span><span class="muted">${esc(r.language || '—')}</span></div>
        </div>`;
        }).join('');
      })
      .catch(function () {
        $('ght-out').innerHTML = '<p class="error">Chưa tải được dữ liệu trending. Kiểm tra mạng hoặc thử lại sau vài phút.</p>';
        $('ght-retry').style.display = '';
      });
  }

  $('ght-retry').addEventListener('click', load);
  load();
}
