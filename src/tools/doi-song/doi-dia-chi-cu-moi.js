// Đổi địa chỉ cũ sang mới — tra tỉnh/thành mới sau sáp nhập 2025 (63 → 34),
// theo Nghị quyết 202/2025/QH15. Dữ liệu nạp lúc chạy từ /data/dia-chi-cu-moi.json.
// Phạm vi: chỉ tới cấp tỉnh/thành phố; cấp xã/phường chưa có trong bộ dữ liệu.
export const meta = {
  id: 'doi-dia-chi-cu-moi',
  name: 'Đổi địa chỉ cũ sang mới (sáp nhập 2025)',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Tra tỉnh/thành mới của địa chỉ cũ sau đợt sáp nhập 2025: 63 tỉnh, thành phố cũ thành 34 tỉnh, thành phố mới, theo Nghị quyết 202/2025/QH15. Hiện tra được tới cấp tỉnh/thành.',
  keywords: 'đổi địa chỉ cũ sang mới, sáp nhập tỉnh 2025, tỉnh cũ thuộc tỉnh nào, 63 tỉnh thành 34 tỉnh, địa chỉ mới sau sáp nhập, Nghị quyết 202/2025/QH15',
  icon: '🗺️',
  seoTitle: 'Đổi địa chỉ cũ sang mới — Tra tỉnh mới sau sáp nhập 2025',
  seoDesc: 'Nhập tỉnh cũ để biết tỉnh/thành mới sau đợt sắp xếp đơn vị hành chính 2025 (63 → 34), theo Nghị quyết 202/2025/QH15, hiệu lực từ 1/7/2025. Hiện tra được tới cấp tỉnh/thành.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🗺️</span><div><h2>Đổi địa chỉ cũ sang mới</h2><p class="muted">Từ 1/7/2025, cả nước còn 34 tỉnh, thành phố thay cho 63 tỉnh, thành phố trước đây. Chọn tỉnh cũ để biết tỉnh mới.</p></div></div>
  <p class="note">⚠️ <strong>Hiện tra được tới cấp tỉnh/thành phố.</strong> Tên xã/phường mới (10.035 xã/phường cũ sắp xếp lại thành 3.321 xã/phường/đặc khu) chưa có trong bộ dữ liệu — cần tra riêng theo nghị quyết sắp xếp xã của từng tỉnh. Cấp huyện (quận/huyện/thị xã) đã bãi bỏ từ 1/7/2025, địa chỉ mới chỉ còn 2 cấp: xã/phường + tỉnh/thành phố.</p>
  <p class="muted" id="ddc-status">Đang tải dữ liệu đối chiếu…</p>
  <div class="error" id="ddc-error" style="display:none"></div>
  <div id="ddc-form" style="display:none">
    <div class="grid-2">
      <div class="field"><label for="ddc-tinh">Tỉnh/thành cũ (tính đến 30/6/2025)</label><select id="ddc-tinh"></select><p class="hint">Chọn tỉnh/thành ghi trên giấy tờ, địa chỉ cũ của bạn.</p></div>
      <div class="field"><label for="ddc-diachi">Địa chỉ cũ đầy đủ (không bắt buộc)</label><input id="ddc-diachi" type="text" placeholder="VD: Số 12, đường Lê Lợi, phường Phú Cường, TP Thủ Dầu Một, tỉnh Bình Dương"><p class="hint">Nếu nhập, công cụ gợi ý cách viết lại địa chỉ với tỉnh mới.</p></div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-primary" id="ddc-tim">Tra cứu</button>
      <button type="button" class="btn btn-ghost" id="ddc-vidu">Điền ví dụ</button>
      <button type="button" class="btn btn-ghost" id="ddc-reset" data-uh-reset="1">Đặt lại</button>
    </div>
  </div>
  <div id="ddc-ketqua"></div>
  <div id="ddc-bang-khu" style="display:none">
    <button type="button" class="btn btn-ghost" id="ddc-bang-nut">Xem toàn bộ bảng đối chiếu 63 tỉnh cũ → 34 tỉnh mới</button>
    <div id="ddc-bang" style="display:none"></div>
  </div>
  <p class="note">Nguồn: Nghị quyết 202/2025/QH15 của Quốc hội (thông qua 12/6/2025, chính quyền mới hoạt động từ 1/7/2025); Luật Tổ chức chính quyền địa phương 65/2025/QH15 (mô hình 2 cấp, kết thúc cấp huyện); các Nghị quyết 1654–1687/NQ-UBTVQH15 về sắp xếp cấp xã. Giấy tờ ghi địa chỉ cũ vẫn có giá trị sử dụng, chỉ cần cập nhật khi làm thủ tục mới hoặc khi giấy tờ được cấp lại.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || function (msg) { try { alert(msg); } catch (e) {} };
  const markFieldError = U.markFieldError || function () {};
  const clearFieldErrors = U.clearFieldErrors || function () {};
  const focusField = U.focusField || function (el) { try { el.focus(); } catch (e) {} };
  const bindCopyButtons = U.bindCopyButtons || function () {};
  const fillEx = U.fillExample || function (rootEl, values, btn) {
    Object.keys(values).forEach(function (id) {
      const el = rootEl.querySelector('#' + id);
      if (el) el.value = values[id];
    });
    if (btn) btn.click();
  };
  const $ = id => root.querySelector('#' + id);
  const DATA_URL = '/data/dia-chi-cu-moi.json';

  let data = null;
  let byOld = {};

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fullName(name, kind) {
    if (name === 'TP Hồ Chí Minh') return 'Thành phố Hồ Chí Minh';
    return (kind === 'thành phố' ? 'Thành phố ' : 'Tỉnh ') + name;
  }
  function cmpVi(a, b) {
    try { return a.localeCompare(b, 'vi'); } catch (e) { return a < b ? -1 : a > b ? 1 : 0; }
  }

  // Mẫu tìm tên tỉnh trong địa chỉ người dùng gõ: chấp nhận khoảng trắng,
  // gạch nối/gạch ngang dài và dấu chấm sau "TP" viết linh hoạt.
  function namePattern(name) {
    const p = name
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+-\s+/g, '\\s*[-\\u2013\\u2014]\\s*')
      .replace(/\s+/g, '\\s+')
      .replace(/TP/g, 'TP\\.?');
    return new RegExp('(?:t[ỉi]nh|th[àa]nh\\s+ph[ốo]|TP\\.?)\\s+' + p + '|' + p, 'i');
  }
  function suggestAddress(addr, entry) {
    const re = namePattern(entry.old);
    if (!re.test(addr)) return null;
    const cleaned = addr.replace(/[\u2013\u2014]/g, '-');
    return cleaned.replace(namePattern(entry.old), fullName(entry.new, entry.newKind));
  }

  function renderResult(entry, isLegacy) {
    const oldFull = fullName(entry.old, entry.oldKind);
    const newFull = fullName(entry.new, entry.newKind);
    const addr = $('ddc-diachi').value.trim();
    const suggested = addr ? suggestAddress(addr, entry) : null;

    let hinhThuc;
    let canCu;
    let hieuLuc;
    if (isLegacy) {
      hinhThuc = 'Đã sáp nhập/đổi tên trước đợt 2025 — ' + esc(entry.note || '');
      canCu = esc(entry.legalBasis || '');
      hieuLuc = entry.effectiveFrom === '2008-08-01' ? 'Áp dụng từ 1/8/2008' : 'Áp dụng từ 1/1/2025';
    } else if (entry.unchanged) {
      hinhThuc = 'Giữ nguyên, không thực hiện sắp xếp trong đợt 2025.';
      canCu = 'Nghị quyết 202/2025/QH15, Điều 1 khoản 24 — 1 trong 11 tỉnh, thành phố không sắp xếp.';
      hieuLuc = 'Không đổi từ 1/7/2025';
    } else {
      const parts = entry.mergedFrom.map(n => {
        const e = byOld[n];
        return e ? fullName(n, e.oldKind) : n;
      });
      hinhThuc = 'Hợp nhất từ: ' + esc(parts.join(' + ')) + '.';
      canCu = 'Nghị quyết 202/2025/QH15 của Quốc hội, Điều 1.';
      hieuLuc = 'Áp dụng từ 1/7/2025';
    }

    let copyText = 'Địa chỉ cũ: ' + oldFull + ' → Địa chỉ mới: ' + newFull + ' (' + hieuLuc.toLowerCase() + ').';
    let addrHtml = '';
    if (addr) {
      if (suggested) {
        addrHtml = '<div class="result-row"><span>Địa chỉ mới (gợi ý)</span><span><strong>' + esc(suggested) + '</strong></span></div>';
        copyText += '\nĐịa chỉ mới (gợi ý): ' + suggested;
      } else {
        addrHtml = '<div class="result-row"><span>Địa chỉ cũ đã nhập</span><span class="muted">Không tìm thấy tên tỉnh cũ trong địa chỉ đã nhập nên chưa gợi ý được cách viết lại — hãy kiểm tra lại chính tả tên tỉnh.</span></div>';
      }
      addrHtml += '<div class="result-row"><span class="muted">Lưu ý khi viết lại</span><span class="muted">Bỏ phần quận/huyện/thị xã (cấp huyện đã bãi bỏ). Tên xã/phường mới cần tra riêng — xã/phường cũ có thể đã nhập với xã/phường khác hoặc đổi tên.</span></div>';
    }

    $('ddc-ketqua').innerHTML =
      '<div class="result">' +
        '<div class="result-hero"><div class="result-hero-label">Tỉnh/thành mới</div>' +
        '<div class="result-hero-value">' + esc(newFull) + '</div>' +
        '<div class="result-hero-sub">' + esc(hieuLuc) + '</div></div>' +
        '<div class="result-row"><span>Tỉnh/thành cũ</span><span>' + esc(oldFull) + '</span></div>' +
        '<div class="result-row"><span>Hình thức</span><span>' + hinhThuc + '</span></div>' +
        '<div class="result-row"><span>Căn cứ</span><span class="small">' + canCu + '</span></div>' +
        addrHtml +
      '<div class="result-actions"><button type="button" class="btn btn-ghost copy-btn" data-copy="' + esc(copyText) + '" data-copy-msg="Đã chép kết quả tra cứu">Chép kết quả</button></div>' +
      '</div>';
    bindCopyButtons(root);
  }

  function lookup() {
    clearFieldErrors(root);
    const sel = $('ddc-tinh');
    const val = sel.value;
    if (!val) {
      markFieldError(sel, 'Vui lòng chọn tỉnh/thành cũ để tra cứu.');
      focusField(sel);
      return;
    }
    const entry = byOld[val];
    if (!entry) {
      $('ddc-ketqua').innerHTML = '<p class="error">Không tìm thấy tỉnh/thành này trong dữ liệu đối chiếu.</p>';
      return;
    }
    renderResult(entry, !!entry.isLegacy);
  }

  function renderTable() {
    const rows = data.provinces.map(p => {
      const note = p.unchanged ? 'Giữ nguyên' : 'Hợp nhất từ ' + p.mergedFrom.length + ' tỉnh/thành cũ';
      return '<tr><td>' + esc(fullName(p.old, p.oldKind)) + '</td><td><strong>' + esc(fullName(p.new, p.newKind)) + '</strong></td><td>' + esc(note) + '</td></tr>';
    }).join('');
    const legacyRows = (data.legacy || []).map(p =>
      '<tr><td>' + esc(fullName(p.old, p.oldKind)) + ' <span class="muted">(trước 2025)</span></td><td><strong>' + esc(fullName(p.new, p.newKind)) + '</strong></td><td>' + esc(p.effectiveFrom === '2008-08-01' ? 'Nhập vào Hà Nội từ 1/8/2008' : 'Đổi tên từ 1/1/2025') + '</td></tr>'
    ).join('');
    $('ddc-bang').innerHTML =
      '<table class="tbl"><thead><tr><th>Tỉnh/thành cũ</th><th>Tỉnh/thành mới</th><th>Ghi chú</th></tr></thead><tbody>' +
      rows + legacyRows + '</tbody></table>' +
      '<p class="note small">Bảng sắp xếp theo thứ tự Bắc → Nam. Hai dòng cuối là trường hợp đổi tên/sáp nhập trước đợt 2025, đưa vào để tra cứu địa chỉ rất cũ.</p>';
  }

  function buildForm() {
    const sel = $('ddc-tinh');
    const provs = data.provinces.slice().sort((a, b) => cmpVi(a.old, b.old));
    let html = '<option value="">— Chọn tỉnh/thành cũ —</option><optgroup label="Tỉnh/thành cũ (tính đến 30/6/2025)">';
    provs.forEach(p => { html += '<option value="' + esc(p.old) + '">' + esc(fullName(p.old, p.oldKind)) + '</option>'; });
    html += '</optgroup>';
    const legacy = data.legacy || [];
    if (legacy.length) {
      html += '<optgroup label="Đã đổi tên/sáp nhập trước năm 2025">';
      legacy.forEach(p => { html += '<option value="' + esc(p.old) + '">' + esc(fullName(p.old, p.oldKind)) + '</option>'; });
      html += '</optgroup>';
    }
    sel.innerHTML = html;
    $('ddc-status').style.display = 'none';
    $('ddc-error').style.display = 'none';
    $('ddc-form').style.display = '';
    $('ddc-bang-khu').style.display = '';
  }

  function showError() {
    $('ddc-status').style.display = 'none';
    $('ddc-form').style.display = 'none';
    $('ddc-bang-khu').style.display = 'none';
    const err = $('ddc-error');
    err.style.display = '';
    err.innerHTML = 'Không tải được dữ liệu đối chiếu. Vui lòng kiểm tra kết nối mạng rồi <button type="button" class="btn btn-ghost" id="ddc-thulai">thử lại</button>.';
    const retry = $('ddc-thulai');
    if (retry) retry.addEventListener('click', loadData);
  }

  function loadData() {
    $('ddc-error').style.display = 'none';
    $('ddc-status').style.display = '';
    $('ddc-status').textContent = 'Đang tải dữ liệu đối chiếu…';
    fetch(DATA_URL, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(json => {
        if (!json || !Array.isArray(json.provinces) || !json.provinces.length) throw new Error('bad data');
        data = json;
        byOld = {};
        json.provinces.forEach(p => { byOld[p.old] = p; });
        (json.legacy || []).forEach(p => { byOld[p.old] = Object.assign({}, p, { isLegacy: true }); });
        buildForm();
      })
      .catch(() => showError());
  }

  $('ddc-tim').addEventListener('click', lookup);
  $('ddc-tinh').addEventListener('change', () => {
    if ($('ddc-tinh').value) lookup();
  });
  $('ddc-vidu').addEventListener('click', () => {
    fillEx(root, {
      'ddc-tinh': 'Bình Dương',
      'ddc-diachi': 'Số 12, đường Lê Lợi, phường Phú Cường, TP Thủ Dầu Một, tỉnh Bình Dương'
    }, $('ddc-tim'));
    toast('Ví dụ: địa chỉ cũ ở tỉnh Bình Dương.');
  });
  $('ddc-reset').addEventListener('click', () => {
    clearFieldErrors(root);
    $('ddc-tinh').value = '';
    $('ddc-diachi').value = '';
    $('ddc-ketqua').innerHTML = '';
    // Nút này có data-uh-reset nên khung không chèn thêm nút Đặt lại nữa;
    // tự xóa query string như resetPanel của khung.
    try { window.history.replaceState(null, '', window.location.pathname + (window.location.hash || '')); } catch (e) { /* bỏ qua */ }
  });
  $('ddc-bang-nut').addEventListener('click', () => {
    const wrap = $('ddc-bang');
    const open = wrap.style.display === 'none';
    if (open && !wrap.innerHTML) renderTable();
    wrap.style.display = open ? '' : 'none';
    $('ddc-bang-nut').textContent = open
      ? 'Ẩn bảng đối chiếu 63 tỉnh cũ → 34 tỉnh mới'
      : 'Xem toàn bộ bảng đối chiếu 63 tỉnh cũ → 34 tỉnh mới';
  });

  loadData();
}
