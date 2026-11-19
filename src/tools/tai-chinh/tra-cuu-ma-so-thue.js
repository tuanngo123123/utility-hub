// Tra cứu mã số thuế — trang hướng dẫn tra cứu trên cổng chính thức của cơ quan
// thuế (tracuunnt.gdt.gov.vn) + kiểm tra định dạng mã số thuế phía client.
// KHÔNG scrape cổng thuế (có captcha); không lưu hay gửi mã số thuế đi đâu.
export const meta = {
  id: 'tra-cuu-ma-so-thue',
  name: 'Tra cứu mã số thuế',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Hướng dẫn tra cứu mã số thuế cá nhân và doanh nghiệp trên cổng chính thức của cơ quan thuế (tracuunnt.gdt.gov.vn), kèm kiểm tra định dạng mã số thuế.',
  keywords: 'tra cứu mã số thuế, tra mã số thuế cá nhân, tra mã số thuế doanh nghiệp, tracuunnt, mã số thuế bằng CCCD',
  icon: '🔍',
  seoTitle: 'Tra cứu mã số thuế — hướng dẫn tra trên cổng cơ quan thuế',
  seoDesc: 'Tra cứu mã số thuế cá nhân bằng CCCD và mã số thuế doanh nghiệp trên cổng chính thức tracuunnt.gdt.gov.vn. Hướng dẫn từng bước + kiểm tra định dạng mã số thuế.',
};

export function body() {
  return `
<div class="tool-panel">
  <p class="note">Mã số thuế chỉ tra cứu được trên cổng của cơ quan thuế — trang này hướng dẫn bạn tra cứu trực tiếp ở đó (không cần tài khoản) và giúp kiểm tra nhanh định dạng của một mã số thuế. <strong>Chúng tôi không lưu, không gửi mã số thuế hay CCCD của bạn đi đâu</strong> — phần kiểm tra định dạng chạy hoàn toàn trên trình duyệt của bạn.</p>
  <div class="field">
    <label for="mst-code">Kiểm tra định dạng mã số thuế</label>
    <input id="mst-code" type="text" inputmode="text" value="" placeholder="Ví dụ: 0101234567 hoặc 0101234567-001">
    <p class="hint">Mã số thuế cá nhân và doanh nghiệp gồm 10 chữ số; chi nhánh, văn phòng đại diện thêm hậu tố “-001”, “-002”… thành 13 chữ số. Phần này chỉ kiểm tra định dạng — muốn biết mã số thuế có tồn tại và thuộc về ai, hãy tra trên cổng cơ quan thuế bên dưới.</p>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-primary" id="mst-check">Kiểm tra định dạng</button>
    <button type="button" class="btn btn-ghost" id="mst-example">Điền ví dụ</button>
  </div>
  <div id="mst-out"></div>
  <div class="result">
    <div class="result-row"><span>Cổng tra cứu chính thức</span><strong><a href="https://tracuunnt.gdt.gov.vn/" target="_blank" rel="noopener">tracuunnt.gdt.gov.vn</a></strong></div>
    <div class="result-row"><span>Cá nhân</span><strong>Tra bằng số CMND / CCCD</strong></div>
    <div class="result-row"><span>Doanh nghiệp</span><strong>Tra bằng mã số thuế hoặc tên doanh nghiệp</strong></div>
  </div>
  <p class="note"><strong>Các bước tra cứu mã số thuế cá nhân:</strong> 1) Mở cổng tracuunnt.gdt.gov.vn. 2) Chọn mục “Thông tin về người nộp thuế TNCN”. 3) Nhập số CMND/CCCD và mã xác nhận (captcha) rồi bấm “Tra cứu”. 4) Kết quả hiển thị mã số thuế, họ tên và cơ quan thuế quản lý.</p>
  <p class="note"><strong>Các bước tra cứu mã số thuế doanh nghiệp:</strong> 1) Mở cổng tracuunnt.gdt.gov.vn. 2) Chọn mục “Thông tin về người nộp thuế”. 3) Nhập mã số thuế (hoặc tên doanh nghiệp) và mã xác nhận rồi bấm “Tra cứu”. 4) Kết quả hiển thị tên, địa chỉ, tình trạng hoạt động và cơ quan thuế quản lý của doanh nghiệp.</p>
  <p class="note"><strong>Cách khác:</strong> ứng dụng eTax Mobile của cơ quan thuế (mục tra cứu) cũng tra được mã số thuế; doanh nghiệp có thể tra trên Cổng thông tin quốc gia về đăng ký doanh nghiệp (dangkykinhdoanh.gov.vn). <strong>Cảnh báo:</strong> chỉ nhập CMND/CCCD và mã số thuế trên cổng chính thức của cơ quan thuế — không nhập vào trang lạ, trang quảng cáo “tra mã số thuế” không rõ nguồn gốc. Nội dung trang này chỉ mang tính tham khảo, hướng dẫn.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const $ = id => root.querySelector('#' + id);
  const markErr = U.markFieldError || function (el, msg) { $('mst-out').innerHTML = '<p class="error">' + msg + '</p>'; };
  const clearErrs = U.clearFieldErrors || function () {};
  const focusEl = U.focusField || function (el) { if (el) el.focus(); };
  const withBusy = U.withBusy || function (btn, fn) { fn(); };
  const fillEx = U.fillExample || function (rootEl, values, btn) { Object.keys(values).forEach(function (id) { const el = rootEl.querySelector('#' + id); if (el) el.value = values[id]; }); if (btn) btn.click(); };

  function check() {
    clearErrs(root);
    const raw = $('mst-code').value.trim();
    const code = raw.replace(/[\s.]/g, '');
    if (code === '') {
      markErr($('mst-code'), 'Ô Mã số thuế đang trống — nhập 10 chữ số (Ví dụ: 0101234567) hoặc 13 chữ số dạng 0101234567-001.');
      focusEl($('mst-code'));
      $('mst-out').innerHTML = '';
      return;
    }
    const is10 = /^[0-9]{10}$/.test(code);
    const is13 = /^[0-9]{10}-[0-9]{3}$/.test(code);
    if (!is10 && !is13) {
      markErr($('mst-code'), 'Mã số thuế chưa đúng định dạng — cần đúng 10 chữ số (Ví dụ: 0101234567), hoặc 10 chữ số + dấu gạch ngang + 3 chữ số cho chi nhánh (Ví dụ: 0101234567-001).');
      focusEl($('mst-code'));
      $('mst-out').innerHTML = '';
      return;
    }
    const kind = is10 ? 'Mã số thuế 10 chữ số (cá nhân hoặc doanh nghiệp)' : 'Mã số thuế 13 chữ số (chi nhánh / văn phòng đại diện / địa điểm kinh doanh)';
    $('mst-out').innerHTML = `
<div class="result">
  <div class="result-hero">
    <p class="result-hero-label">Định dạng mã số thuế</p>
    <div class="result-hero-value">Đúng định dạng ✓</div>
    <p class="result-hero-sub">${kind}</p>
  </div>
  <div class="result-row"><span>Mã số thuế đã nhập</span><strong>${code}</strong></div>
  <div class="result-row"><span>Loại</span><strong>${kind}</strong></div>
  <p class="note">Đây mới chỉ là kiểm tra định dạng. Để biết mã số thuế này có tồn tại và thuộc về ai, hãy tra trên cổng chính thức <a href="https://tracuunnt.gdt.gov.vn/" target="_blank" rel="noopener">tracuunnt.gdt.gov.vn</a>.</p>
</div>`;
  }

  function runCheck() { withBusy($('mst-check'), check); }
  $('mst-check').addEventListener('click', runCheck);
  $('mst-code').addEventListener('keydown', e => { if (e.key === 'Enter') runCheck(); });
  $('mst-example').addEventListener('click', () => {
    fillEx(root, { 'mst-code': '0101234567-001' }, $('mst-check'));
  });
}
