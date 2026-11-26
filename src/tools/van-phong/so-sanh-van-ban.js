// So sánh 2 văn bản — dùng google/diff-match-patch (Apache-2.0, đã vendored).
// So sánh trực tiếp khi gõ (chống dồn 300ms); tô thêm xanh lá, xóa đỏ,
// giữ nguyên xám; đếm dòng thêm/xóa; chép kết quả dạng văn bản.
export const meta = {
  id: 'so-sanh-van-ban',
  name: 'So sánh 2 văn bản',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Dán văn bản cũ và văn bản mới để xem từng chữ khác nhau: chỗ thêm tô xanh lá, chỗ xóa tô đỏ gạch ngang, chỗ giữ nguyên màu xám — kèm số dòng thêm/xóa.',
  keywords: 'so sánh văn bản, so sánh 2 văn bản, diff text, tìm khác nhau, đối chiếu văn bản, so sánh bản thảo',
  icon: '📝',
  seoTitle: 'So sánh 2 văn bản online miễn phí — Tô khác nhau từng chữ',
  seoDesc: 'So sánh 2 văn bản online miễn phí: dán bản cũ và bản mới, xem ngay từng chữ thêm (xanh lá), xóa (đỏ) hay giữ nguyên (xám), kèm số dòng thêm/xóa.',
};

const EX_OLD = `Hôm nay trời nắng đẹp.
Tôi đi chợ mua rau và thịt.
Chiều về nhà nấu cơm.`;

const EX_NEW = `Hôm nay trời mưa to.
Tôi đi chợ mua rau, thịt và cá.
Chiều về nhà nấu cơm ngon.`;

export function body() {
  return `
<div class="tool-panel m2-tool" data-uh-no-reset>
  <div class="m2-layout">
    <div class="m2-input-card">
      <div class="m2-input-top">
        <div class="grid-2">
          <div class="field"><label for="ssvb-old">Văn bản cũ</label><textarea id="ssvb-old" rows="8" placeholder="Dán văn bản cũ vào đây…">${EX_OLD}</textarea></div>
          <div class="field"><label for="ssvb-new">Văn bản mới</label><textarea id="ssvb-new" rows="8" placeholder="Dán văn bản mới vào đây…">${EX_NEW}</textarea></div>
        </div>
      </div>
    </div>
    <div class="m2-result-card">
      <p class="m2-result-label">Kết quả</p>
      <div class="grid-3" id="ssvb-stats">
        <div class="stat"><div class="stat-num" id="ssvb-add-lines">0</div><div class="stat-label">Dòng thêm</div></div>
        <div class="stat"><div class="stat-num" id="ssvb-del-lines">0</div><div class="stat-label">Dòng xóa</div></div>
        <div class="stat"><div class="stat-num" id="ssvb-same-lines">0</div><div class="stat-label">Dòng giữ nguyên</div></div>
      </div>
      <div class="result"><div class="ssvb-diff" id="ssvb-out" aria-live="polite"></div></div>
      <div class="m2-result-actions">
        <button type="button" class="btn btn-primary" id="ssvb-copy">Chép kết quả</button>
        <button type="button" class="btn btn-ghost" id="ssvb-swap">Đổi chỗ 2 văn bản</button>
        <button type="button" class="btn btn-ghost" id="ssvb-clear">Xóa hết</button>
        <button type="button" class="btn btn-ghost" data-uh-share-copy>Chép liên kết</button>
        <button type="button" class="btn btn-ghost" data-uh-share-zalo>Chia sẻ Zalo</button>
        <button type="button" class="btn btn-ghost" data-uh-feedback-open>Góp ý / Báo lỗi</button>
      </div>
    </div>
  </div>
  <p class="note">Chỗ thêm tô nền xanh lá, chỗ xóa tô nền đỏ gạch ngang, chỗ giữ nguyên màu xám. Văn bản chỉ so sánh trên máy của bạn, không gửi đi đâu. Văn bản rất dài (trên 100.000 ký tự) có thể so sánh chậm hơn một chút.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const copyText = U.copyText || (t => { try { navigator.clipboard.writeText(t); return Promise.resolve(true); } catch (e) { return Promise.resolve(false); } });
  const $ = id => root.querySelector('#' + id);
  const oldEl = $('ssvb-old'), newEl = $('ssvb-new'), outEl = $('ssvb-out');
  let lastCopyText = '';

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  function compare() {
    const a = oldEl.value, b = newEl.value;
    if (typeof window.diff_match_patch === 'undefined') {
      outEl.innerHTML = '<p class="error">Bộ so sánh chưa tải xong. Hãy tải lại trang.</p>';
      return;
    }
    if (!a && !b) {
      outEl.innerHTML = '<p class="muted">Hãy nhập văn bản vào 2 ô trên.</p>';
      $('ssvb-add-lines').textContent = '0';
      $('ssvb-del-lines').textContent = '0';
      $('ssvb-same-lines').textContent = '0';
      lastCopyText = '';
      return;
    }
    let dmp;
    try { dmp = new window.diff_match_patch(); } catch (e) {
      outEl.innerHTML = '<p class="error">Không khởi động được bộ so sánh. Hãy tải lại trang.</p>';
      return;
    }
    dmp.Diff_Timeout = 1; // quá 1 giây thì trả kết quả tốt nhất đã có
    // So sánh từng chữ để tô màu.
    const charDiffs = dmp.diff_main(a, b);
    dmp.diff_cleanupSemantic(charDiffs);
    // So sánh từng dòng để đếm dòng thêm/xóa.
    // LƯU Ý: file diff_match_patch.js đã nén dùng tên hàm có gạch dưới
    // cuối (diff_linesToChars_, diff_charsToLines_) thay vì tên không gạch
    // dưới trong tài liệu gốc — gọi đúng tên trong file đã vendored.
    // KHÔNG dùng diff_lineMode_: nó gọi thêm diff_cleanupSemantic làm
    // vỡ dòng thành từng chữ, đếm dòng sẽ sai.
    let addLines = 0, delLines = 0, sameLines = 0;
    const copyParts = [];
    try {
      let lineDiffs = null;
      if (typeof dmp.diff_linesToChars_ === 'function') {
        const lc = dmp.diff_linesToChars_(a, b);
        lineDiffs = dmp.diff_main(lc.chars1, lc.chars2, false);
        dmp.diff_charsToLines_(lineDiffs, lc.lineArray);
      } else if (typeof dmp.diff_linesToChars === 'function') {
        const lc = dmp.diff_linesToChars(a, b);
        lineDiffs = dmp.diff_main(lc.chars1, lc.chars2, false);
        dmp.diff_charsToLines(lineDiffs, lc.lineArray);
      }
      (lineDiffs || []).forEach(d => {
        const op = d[0], text = d[1];
        if (!text) return;
        const n = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
        if (op === 1) { addLines += n; copyParts.push(text.split('\n').filter(x => x !== '').map(x => '+ ' + x).join('\n')); }
        else if (op === -1) { delLines += n; copyParts.push(text.split('\n').filter(x => x !== '').map(x => '- ' + x).join('\n')); }
        else { sameLines += n; copyParts.push(text.split('\n').filter(x => x !== '').map(x => '  ' + x).join('\n')); }
      });
    } catch (e) { /* đếm dòng lỗi thì vẫn hiện phần tô màu */ }
    $('ssvb-add-lines').textContent = String(addLines);
    $('ssvb-del-lines').textContent = String(delLines);
    $('ssvb-same-lines').textContent = String(sameLines);
    lastCopyText = copyParts.filter(x => x).join('\n');
    // Vẽ kết quả tô màu.
    if (a === b) {
      outEl.innerHTML = '<p class="muted">2 văn bản giống nhau hoàn toàn.</p>' + (a ? '<div>' + esc(a) + '</div>' : '');
      return;
    }
    let html = '';
    charDiffs.forEach(d => {
      const op = d[0], text = d[1];
      if (!text) return;
      if (op === 1) html += '<span class="ssvb-add">' + esc(text) + '</span>';
      else if (op === -1) html += '<span class="ssvb-del">' + esc(text) + '</span>';
      else html += '<span class="muted">' + esc(text) + '</span>';
    });
    outEl.innerHTML = html;
  }

  let t = null;
  function schedule() { clearTimeout(t); t = setTimeout(compare, 300); }
  oldEl.addEventListener('input', schedule);
  newEl.addEventListener('input', schedule);
  compare();

  $('ssvb-copy').addEventListener('click', async () => {
    if (!lastCopyText) { toast('Chưa có gì để chép — hãy nhập văn bản vào 2 ô.'); return; }
    const ok = await copyText(lastCopyText);
    toast(ok === false ? 'Không chép được. Hãy bôi đen kết quả rồi chép tay.' : 'Đã chép kết quả so sánh.');
  });
  $('ssvb-swap').addEventListener('click', () => {
    const tmp = oldEl.value;
    oldEl.value = newEl.value;
    newEl.value = tmp;
    compare();
    toast('Đã đổi chỗ 2 văn bản.');
  });
  $('ssvb-clear').addEventListener('click', () => {
    oldEl.value = '';
    newEl.value = '';
    compare();
    oldEl.focus();
  });
}
