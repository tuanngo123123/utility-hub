// Danh sách repo chọn lọc — ~15 repo mã nguồn mở nổi tiếng, lọc theo chủ đề.
export const meta = {
  id: 'repo-chon-loc',
  name: 'Danh sách repo chọn lọc',
  category: 'GitHub',
  categorySlug: 'github',
  desc: 'Danh sách các repo mã nguồn mở nổi tiếng đáng học hỏi: React, VS Code, Linux, Node.js… kèm số sao và lọc theo chủ đề.',
  keywords: 'repo hay github, mã nguồn mở nổi tiếng, học lập trình github, repo đáng sao',
  icon: '⭐',
  seoTitle: 'Danh sách repo chọn lọc — Repo mã nguồn mở hay nhất',
  seoDesc: 'Tuyển chọn repo mã nguồn mở nổi tiếng: React, VS Code, Linux, Node.js, TypeScript… kèm mô tả, số sao và link GitHub.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>⭐</span><div><h2>Danh sách repo chọn lọc</h2><p class="muted">Những repo mã nguồn mở nổi tiếng, đáng đọc code và học hỏi — lọc theo chủ đề bạn quan tâm.</p></div></div>
  <div class="tabs" id="rcl-tabs">
    <button type="button" class="tab tab-active" data-rcl-topic="all">Tất cả</button>
    <button type="button" class="tab" data-rcl-topic="web">Web</button>
    <button type="button" class="tab" data-rcl-topic="ngon-ngu">Ngôn ngữ</button>
    <button type="button" class="tab" data-rcl-topic="ai">AI & Dữ liệu</button>
    <button type="button" class="tab" data-rcl-topic="he-thong">Hệ thống</button>
    <button type="button" class="tab" data-rcl-topic="mobile">Mobile</button>
  </div>
  <div id="rcl-list"></div>
  <p class="note">Số sao là ước tính tại thời điểm viết (tháng 11/2026), có thể đã đổi. Bấm vào tên repo để mở trên GitHub.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  // Chỉ ghi repo chắc chắn tồn tại. Số sao ước tính tại thời điểm viết.
  const REPOS = [
    { r: 'facebook/react', t: 'web', s: '~240.000', d: 'Thư viện JavaScript xây giao diện người dùng, dùng khắp nơi từ web tới app.' },
    { r: 'microsoft/vscode', t: 'he-thong', s: '~170.000', d: 'Trình soạn thảo code miễn phí phổ biến nhất, viết bằng TypeScript.' },
    { r: 'torvalds/linux', t: 'he-thong', s: '~200.000', d: 'Nhân hệ điều hành Linux — nền tảng của máy chủ, Android và vô số thiết bị.' },
    { r: 'nodejs/node', t: 'web', s: '~110.000', d: 'Môi trường chạy JavaScript phía máy chủ, nền tảng của hệ sinh thái npm.' },
    { r: 'python/cpython', t: 'ngon-ngu', s: '~70.000', d: 'Bộ thông dịch chuẩn của Python — đọc code để hiểu ngôn ngữ từ gốc.' },
    { r: 'tensorflow/tensorflow', t: 'ai', s: '~190.000', d: 'Thư viện học máy mã nguồn mở của Google, từ nghiên cứu tới sản phẩm.' },
    { r: 'kubernetes/kubernetes', t: 'he-thong', s: '~115.000', d: 'Hệ thống điều phối container, chuẩn mực chạy ứng dụng trên cloud.' },
    { r: 'flutter/flutter', t: 'mobile', s: '~170.000', d: 'Framework của Google để viết một bộ code chạy cả iOS, Android, web.' },
    { r: 'vuejs/vue', t: 'web', s: '~210.000', d: 'Framework JavaScript gọn nhẹ, dễ học, rất phổ biến để làm giao diện web.' },
    { r: 'twbs/bootstrap', t: 'web', s: '~170.000', d: 'Framework CSS lâu đời nhất, giúp làm giao diện đẹp nhanh mà không viết CSS từ đầu.' },
    { r: 'microsoft/TypeScript', t: 'ngon-ngu', s: '~105.000', d: 'Ngôn ngữ TypeScript — JavaScript cộng thêm kiểu tĩnh, chuẩn cho dự án lớn.' },
    { r: 'rust-lang/rust', t: 'ngon-ngu', s: '~105.000', d: 'Ngôn ngữ Rust — nhanh như C/C++ mà an toàn bộ nhớ, được yêu thích nhất nhiều năm.' },
    { r: 'golang/go', t: 'ngon-ngu', s: '~130.000', d: 'Ngôn ngữ Go của Google — đơn giản, chạy nhanh, mạnh về lập trình đồng thời.' },
    { r: 'apache/spark', t: 'ai', s: '~40.000', d: 'Nền tảng xử lý dữ liệu lớn phân tán của Apache, dùng trong nhiều công ty lớn.' },
    { r: 'elastic/elasticsearch', t: 'ai', s: '~70.000', d: 'Công cụ tìm kiếm và phân tích dữ liệu phân tán, nền tảng của nhiều hệ thống tìm kiếm.' },
    { r: 'vercel/next.js', t: 'web', s: '~130.000', d: 'Framework React của Vercel cho web hiện đại: SSR, SSG và API trong một chỗ.' },
  ];
  let topic = 'all';

  function render() {
    const list = topic === 'all' ? REPOS : REPOS.filter(x => x.t === topic);
    $('rcl-list').innerHTML = list.map(x => `<div class="result">
      <div class="result-row"><span><strong><a href="https://github.com/${x.r}" target="_blank" rel="noopener">${x.r}</a></strong></span><strong>⭐ ${x.s} sao</strong></div>
      <div class="result-row"><span class="muted">${x.d}</span><span class="chip">${topicLabel(x.t)}</span></div>
    </div>`).join('') || '<p class="note">Không có repo nào trong chủ đề này.</p>';
  }
  function topicLabel(t) {
    return { web: 'Web', 'ngon-ngu': 'Ngôn ngữ', ai: 'AI & Dữ liệu', 'he-thong': 'Hệ thống', mobile: 'Mobile' }[t] || t;
  }

  root.querySelectorAll('[data-rcl-topic]').forEach(b => {
    b.addEventListener('click', () => {
      topic = b.getAttribute('data-rcl-topic');
      root.querySelectorAll('[data-rcl-topic]').forEach(x => x.classList.toggle('tab-active', x === b));
      render();
    });
  });
  render();
}
