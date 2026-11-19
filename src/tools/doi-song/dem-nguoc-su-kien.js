// Đếm ngược sự kiện — đặt tên + ngày giờ, đếm ngược trực tiếp, lưu nhiều sự kiện.
export const meta = {
  id: 'dem-nguoc-su-kien',
  name: 'Đếm ngược sự kiện',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Đếm ngược tới sinh nhật, kỳ thi, chuyến đi hay bất kỳ ngày quan trọng nào. Lưu nhiều sự kiện, đếm trực tiếp từng giây.',
  keywords: 'đếm ngược sự kiện, còn bao nhiêu ngày, đếm ngược sinh nhật, đếm ngược ngày thi',
  icon: '📅',
  seoTitle: 'Đếm ngược sự kiện — Còn bao nhiêu ngày tới ngày quan trọng',
  seoDesc: 'Đặt tên sự kiện và ngày giờ để đếm ngược trực tiếp theo ngày/giờ/phút/giây. Lưu nhiều sự kiện trên máy của bạn.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📅</span><div><h2>Đếm ngược sự kiện</h2><p class="muted">Còn bao lâu tới sinh nhật, kỳ thi, chuyến đi? Đặt sự kiện và xem đếm ngược từng giây.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="dns-name">Tên sự kiện</label><input id="dns-name" type="text" placeholder="Ví dụ: Sinh nhật mẹ" value="Sinh nhật"></div>
    <div class="field"><label for="dns-when">Ngày & giờ diễn ra</label><input id="dns-when" type="datetime-local"></div>
  </div>
  <button type="button" class="btn btn-primary" id="dns-add">Thêm sự kiện</button>
  <div id="dns-list"></div>
  <p class="note">Sự kiện được lưu trên máy của bạn, mở lại trang vẫn còn.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (msg => { try { alert(msg); } catch (e) {} });
  const copyText = U.copyText || (t => {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return Promise.reject(new Error('no clipboard'));
  });
  const $ = id => root.querySelector('#' + id);
  const KEY = 'uh_events_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtDiff(ms) {
    if (ms <= 0) return null;
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor(totalSec % 86400 / 3600);
    const m = Math.floor(totalSec % 3600 / 60);
    const s = totalSec % 60;
    return { d, h, m, s };
  }
  function render() {
    const list = load();
    if (!list.length) {
      $('dns-list').innerHTML = '<p class="note">Chưa có sự kiện nào. Thêm sự kiện đầu tiên ở trên nhé.</p>';
      return;
    }
    const now = Date.now();
    $('dns-list').innerHTML = list.map((ev, i) => {
      const diff = fmtDiff(new Date(ev.when).getTime() - now);
      const text = diff
        ? `<strong>${diff.d} ngày ${diff.h} giờ ${diff.m} phút ${diff.s} giây</strong>`
        : '<strong class="muted">Đã diễn ra</strong>';
      const whenStr = new Date(ev.when).toLocaleString('vi-VN');
      return `<div class="result" data-dns-item="${i}">
        <div class="result-row"><span>📌 ${esc(ev.name)}</span>${text}</div>
        <div class="result-row"><span class="muted">${whenStr}</span><span>
          <button type="button" class="btn btn-ghost copy-btn" data-dns-share="${i}">Chia sẻ</button>
          <button type="button" class="btn btn-ghost" data-dns-del="${i}">Xóa</button>
        </span></div>
      </div>`;
    }).join('');
    root.querySelectorAll('[data-dns-del]').forEach(b => {
      b.addEventListener('click', () => {
        const list2 = load();
        list2.splice(+b.getAttribute('data-dns-del'), 1);
        save(list2);
        render();
      });
    });
    root.querySelectorAll('[data-dns-share]').forEach(b => {
      b.addEventListener('click', () => {
        const ev = load()[+b.getAttribute('data-dns-share')];
        if (!ev) return;
        const diff = fmtDiff(new Date(ev.when).getTime() - Date.now());
        const msg = diff
          ? `Còn ${diff.d} ngày ${diff.h} giờ ${diff.m} phút nữa tới "${ev.name}"!`
          : `"${ev.name}" đã diễn ra.`;
        if (navigator.share) {
          navigator.share({ title: ev.name, text: msg }).catch(() => {});
        } else {
          copyText(msg).then(() => toast('Đã chép nội dung chia sẻ.')).catch(() => toast(msg));
        }
      });
    });
  }

  $('dns-add').addEventListener('click', () => {
    const name = $('dns-name').value.trim();
    const when = $('dns-when').value;
    if (!name) { toast('Vui lòng nhập tên sự kiện.'); return; }
    if (!when || isNaN(new Date(when).getTime())) { toast('Vui lòng chọn ngày giờ hợp lệ.'); return; }
    const list = load();
    list.push({ name, when });
    list.sort((a, b) => new Date(a.when) - new Date(b.when));
    save(list);
    render();
    toast('Đã thêm sự kiện "' + name + '".');
  });

  render();
  setInterval(render, 1000);
}
