// Vẽ sơ đồ / lưu đồ bằng Mermaid 11.17.2 (MIT, đã vendored).
// Gõ cú pháp, sơ đồ vẽ trực tiếp; tải về SVG hoặc PNG.
export const meta = {
  id: 've-so-do',
  name: 'Vẽ sơ đồ / lưu đồ (Mermaid)',
  category: 'Dev & web',
  categorySlug: 'dev-web',
  desc: 'Soạn cú pháp Mermaid để vẽ lưu đồ, sơ đồ tuần tự, sơ đồ Gantt hay sơ đồ trạng thái ngay trên trình duyệt, tải về dạng ảnh PNG hoặc file SVG.',
  keywords: 'vẽ sơ đồ, vẽ lưu đồ, flowchart, mermaid, sơ đồ tuần tự, gantt, sơ đồ trạng thái, vẽ diagram online',
  icon: '🔀',
  seoTitle: 'Vẽ sơ đồ, lưu đồ online miễn phí (Mermaid) — Tải SVG/PNG',
  seoDesc: 'Vẽ lưu đồ, sơ đồ tuần tự, sơ đồ Gantt và sơ đồ trạng thái bằng cú pháp Mermaid ngay trên trình duyệt — miễn phí, tải về ảnh PNG hoặc file SVG.',
};

const FLOWCHART = `flowchart TD
    A[Bắt đầu] --> B{Đã có tài khoản?}
    B -- Có --> C[Đăng nhập]
    B -- Không --> D[Đăng ký tài khoản]
    C --> E[Mở trang chính]
    D --> E
    E --> F[Kết thúc]`;

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔀</span><div><h2>Vẽ sơ đồ / lưu đồ (Mermaid)</h2><p class="muted">Gõ cú pháp Mermaid, sơ đồ vẽ ngay bên dưới — tải PNG hoặc SVG về dùng tiếp.</p></div></div>
  <div class="field"><label>Thử nhanh — bấm để điền mẫu</label><div>
    <button type="button" class="chip" data-vsd-ex="flowchart">Lưu đồ</button>
    <button type="button" class="chip" data-vsd-ex="sequence">Sơ đồ tuần tự</button>
    <button type="button" class="chip" data-vsd-ex="gantt">Sơ đồ Gantt</button>
    <button type="button" class="chip" data-vsd-ex="state">Sơ đồ trạng thái</button>
  </div></div>
  <div class="field"><label for="vsd-code">Cú pháp Mermaid</label><textarea id="vsd-code" rows="12" spellcheck="false">${FLOWCHART}</textarea></div>
  <div id="vsd-err"></div>
  <div class="result" id="vsd-out" aria-live="polite"></div>
  <div id="vsd-dl" hidden>
    <button type="button" class="btn btn-primary" id="vsd-dl-png">Tải ảnh PNG</button>
    <button type="button" class="btn btn-ghost" id="vsd-dl-svg">Tải file SVG</button>
    <button type="button" class="btn btn-ghost" id="vsd-copy">Chép cú pháp</button>
  </div>
  <p class="note">Thư viện vẽ sơ đồ khoảng 3,5 MB, chỉ tải khi bạn mở công cụ này. Sơ đồ vẽ hoàn toàn trên máy của bạn. Cần xem lại cú pháp? Tài liệu Mermaid có ví dụ cho từng loại sơ đồ — gõ "flowchart", "sequenceDiagram", "gantt" hoặc "stateDiagram-v2" ở dòng đầu.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => { try { navigator.clipboard.writeText(t); return true; } catch (e) { return false; } });
  const $ = id => root.querySelector('#' + id);
  // Mọi dữ liệu dùng trong init phải khai báo TRONG init (init nhúng qua init.toString()).
  const SAMPLES = {
    flowchart: `flowchart TD
    A[Bắt đầu] --> B{Đã có tài khoản?}
    B -- Có --> C[Đăng nhập]
    B -- Không --> D[Đăng ký tài khoản]
    C --> E[Mở trang chính]
    D --> E
    E --> F[Kết thúc]`,
    sequence: `sequenceDiagram
    participant K as Khách hàng
    participant W as Website
    participant S as Máy chủ
    K->>W: Mở trang đặt hàng
    W->>S: Gửi yêu cầu
    S-->>W: Trả kết quả
    W-->>K: Hiện trang xác nhận`,
    gantt: `gantt
    title Kế hoạch ra mắt sản phẩm
    dateFormat  YYYY-MM-DD
    section Chuẩn bị
    Nghiên cứu thị trường :a1, 2026-12-01, 10d
    Thiết kế mẫu         :a2, after a1, 7d
    section Sản xuất
    Làm mẫu thử          :b1, after a2, 14d
    Kiểm tra chất lượng  :b2, after b1, 5d`,
    state: `stateDiagram-v2
    [*] --> Chờ xử lý
    Chờ xử lý --> Đang giao : Xác nhận đơn
    Đang giao --> Đã giao : Giao thành công
    Đang giao --> Trả hàng : Khách từ chối
    Đã giao --> [*]
    Trả hàng --> [*]`,
  };

  const codeEl = $('vsd-code'), outEl = $('vsd-out'), errEl = $('vsd-err'), dlEl = $('vsd-dl');
  let n = 0, lastSvg = '', lastOk = false, renderToken = 0;

  async function render() {
    const code = codeEl.value;
    const token = ++renderToken;
    if (!code.trim()) {
      outEl.innerHTML = '<p class="muted">Hãy nhập cú pháp Mermaid để vẽ sơ đồ.</p>';
      errEl.innerHTML = ''; dlEl.hidden = true; lastOk = false;
      return;
    }
    if (typeof window.mermaid === 'undefined') {
      errEl.innerHTML = '<p class="error">Thư viện vẽ sơ đồ chưa tải xong (khoảng 3,5 MB). Hãy chờ vài giây rồi tải lại trang.</p>';
      return;
    }
    try {
      const { svg } = await window.mermaid.render('vsd-' + (++n), code);
      if (token !== renderToken) return; // có lần gõ mới hơn, bỏ kết quả cũ
      lastSvg = svg; lastOk = true;
      outEl.innerHTML = svg;
      errEl.innerHTML = '';
      dlEl.hidden = false;
    } catch (e) {
      if (token !== renderToken) return;
      lastOk = false;
      const msg = (e && e.message ? String(e.message) : 'Cú pháp chưa đúng.').split('\n')[0].slice(0, 300);
      errEl.innerHTML = '<p class="error">Không vẽ được sơ đồ: ' + msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>';
      dlEl.hidden = true;
    }
  }

  if (typeof window.mermaid !== 'undefined') {
    // htmlLabels:false (cấu hình TOÀN CỤC, v11 đã bỏ flowchart.htmlLabels)
    // — vẽ nhãn bằng chữ SVG thay vì khối HTML (foreignObject): nếu không,
    // ảnh SVG không nạp được vào thẻ <img> nên không xuất được PNG
    // (trình duyệt chặn vì lý do an toàn).
    try { window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'strict', htmlLabels: false }); } catch (e) {}
  }
  let t = null;
  codeEl.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 500); });
  root.querySelectorAll('[data-vsd-ex]').forEach(b => {
    b.addEventListener('click', () => {
      codeEl.value = SAMPLES[b.getAttribute('data-vsd-ex')] || '';
      render();
    });
  });
  render();

  $('vsd-copy').addEventListener('click', () => {
    const ok = copyText(codeEl.value);
    toast(ok === false ? 'Không chép được. Hãy bôi đen rồi chép tay.' : 'Đã chép cú pháp Mermaid.');
  });

  $('vsd-dl-svg').addEventListener('click', () => {
    if (!lastOk || !lastSvg) return;
    try {
      const blob = new Blob([lastSvg], { type: 'image/svg+xml;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'so-do.svg';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Đã tải file sơ đồ SVG.');
    } catch (e) { toast('Không tải được file SVG.'); }
  });

  $('vsd-dl-png').addEventListener('click', () => {
    if (!lastOk || !lastSvg) return;
    try {
      const doc = new DOMParser().parseFromString(lastSvg, 'image/svg+xml');
      const svgEl = doc.documentElement;
      const vb = (svgEl.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      let w = parseFloat(svgEl.getAttribute('width')) || 0;
      let h = parseFloat(svgEl.getAttribute('height')) || 0;
      if ((!w || !h) && vb.length === 4 && vb[2] > 0 && vb[3] > 0) { w = vb[2]; h = vb[3]; }
      if (!w || !h || w > 4000 || h > 4000) { toast('Sơ đồ quá lớn, không xuất được PNG. Hãy tải file SVG.'); return; }
      const scale = 2;
      const img = new Image();
      const url = URL.createObjectURL(new Blob([lastSvg], { type: 'image/svg+xml;charset=utf-8' }));
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = Math.round(w * scale); c.height = Math.round(h * scale);
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          c.toBlob(blob => {
            if (!blob) { toast('Không tạo được ảnh PNG. Hãy tải file SVG.'); return; }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'so-do.png';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            toast('Đã tải ảnh sơ đồ PNG.');
          }, 'image/png');
        } catch (e) { URL.revokeObjectURL(url); toast('Không tạo được ảnh PNG. Hãy tải file SVG.'); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); toast('Không tạo được ảnh PNG. Hãy tải file SVG.'); };
      img.src = url;
    } catch (e) { toast('Không tạo được ảnh PNG. Hãy tải file SVG.'); }
  });
}
