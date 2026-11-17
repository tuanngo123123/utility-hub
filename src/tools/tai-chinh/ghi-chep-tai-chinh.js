// Ghi chép tài chính — dán ghi chép dạng "12/11 ăn trưa -50k" rồi tổng hợp thu/chi.
export const meta = {
  id: 'ghi-chep-tai-chinh',
  name: 'Ghi chép tài chính',
  category: 'Tài chính',
  categorySlug: 'tai-chinh',
  desc: 'Dán ghi chép thu chi dạng "12/11 ăn trưa -50k" (mỗi dòng một khoản) để tự động tổng hợp tổng thu, tổng chi, số dư và xuất file CSV/JSON.',
  keywords: 'ghi chép chi tiêu, quản lý thu chi, sổ thu chi, tổng hợp chi tiêu, xuất csv chi tiêu',
  icon: '📒',
  seoTitle: 'Ghi chép tài chính — tổng hợp thu chi từ ghi chép tay',
  seoDesc: 'Dán ghi chép thu chi "12/11 ăn trưa -50k" để tự động tổng hợp tổng thu, tổng chi, số dư; sửa/xóa từng dòng, xuất CSV và JSON miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="field">
    <label for="gctc-input">Dán ghi chép (mỗi dòng một khoản)</label>
    <textarea id="gctc-input" rows="6" placeholder="12/11 ăn trưa -50k&#10;12/11 lương +15tr&#10;13/11 cà phê -25k&#10;14/11 bán đồ cũ thu 300k"></textarea>
    <p class="muted">Hiểu "k" = nghìn, "tr" = triệu. Dấu "-" hoặc từ "chi" là khoản chi; dấu "+" hoặc từ "thu" là khoản thu. Không ghi dấu thì tính là chi.</p>
  </div>
  <div class="grid-3">
    <button type="button" class="btn btn-primary" id="gctc-parse">Tổng hợp</button>
    <button type="button" class="btn btn-ghost" id="gctc-csv">Tải CSV</button>
    <button type="button" class="btn btn-ghost" id="gctc-json">Tải JSON</button>
  </div>
  <div id="gctc-summary"></div>
  <div id="gctc-out"></div>
  <p class="note">Dữ liệu chỉ lưu trong trình duyệt của bạn, không gửi đi đâu. Nhấn "Sửa" để đổi nội dung một dòng, "Xóa" để bỏ khoản đó.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const fmtVND = U.fmtVND || (n => Math.round(n).toLocaleString('vi-VN') + '₫');
  const toast = U.toast || function () {};
  const $ = id => root.querySelector('#' + id);

  let rows = []; // { date, desc, amount, type: 'thu' | 'chi' }

  function parseAmountToken(tok) {
    // tok như "50k", "15tr", "300.000", "1,5tr", "-50k"
    let s = tok.replace(/\s/g, '').replace(/,/g, '.').replace(/[đ₫]$/i, '');
    let mult = 1;
    if (/tr$/i.test(s)) { mult = 1000000; s = s.replace(/tr$/i, ''); }
    else if (/k$/i.test(s)) { mult = 1000; s = s.replace(/k$/i, ''); }
    // "300.000" / "1.500.000": dấu chấm phân tách nhóm 3 số -> bỏ chấm.
    // "1.5": số thập phân -> giữ chấm.
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s);
    if (isNaN(n)) return null;
    return n * mult;
  }

  function parseLine(line) {
    const raw = line.trim();
    if (!raw) return null;
    let date = '';
    let rest = raw;
    const dm = raw.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\s+/);
    if (dm) { date = dm[1].padStart(2, '0') + '/' + dm[2].padStart(2, '0') + (dm[3] ? '/' + dm[3] : ''); rest = raw.slice(dm[0].length); }
    // Tìm token số tiền cuối cùng trong dòng.
    const tokens = rest.split(/\s+/);
    let amount = null, amountIdx = -1;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const v = parseAmountToken(tokens[i]);
      if (v !== null) { amount = v; amountIdx = i; break; }
    }
    if (amount === null) return { date, desc: rest, amount: 0, type: 'chi', unparsed: true };
    let type = 'chi';
    const low = rest.toLowerCase();
    if (amount < 0) type = 'chi';
    else if (/^\s*\+/.test(tokens[amountIdx]) || /(^|\s)(thu|nhận|được|lương|bán)\b/.test(low)) type = 'thu';
    else if (/(^|\s)(chi|mua|trả|đóng|ăn|uống)\b/.test(low)) type = 'chi';
    const descTokens = tokens.slice();
    descTokens.splice(amountIdx, 1);
    let desc = descTokens.join(' ').replace(/^(thu|chi)\s+/i, '').replace(/\s+(thu|chi)$/i, '').trim();
    if (!desc) desc = type === 'thu' ? 'Khoản thu' : 'Khoản chi';
    return { date, desc, amount: Math.abs(amount), type };
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render() {
    const thu = rows.reduce((s, r) => s + (r.type === 'thu' ? r.amount : 0), 0);
    const chi = rows.reduce((s, r) => s + (r.type === 'chi' ? r.amount : 0), 0);
    $('gctc-summary').innerHTML = `
<div class="grid-3">
  <div class="stat"><div class="stat-num">${fmtVND(thu)}</div><div class="stat-label">Tổng thu</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(chi)}</div><div class="stat-label">Tổng chi</div></div>
  <div class="stat"><div class="stat-num">${fmtVND(thu - chi)}</div><div class="stat-label">Số dư</div></div>
</div>`;
    if (!rows.length) { $('gctc-out').innerHTML = '<p class="muted">Chưa có khoản nào. Dán ghi chép rồi nhấn "Tổng hợp".</p>'; return; }
    $('gctc-out').innerHTML = `
<table class="tbl">
  <thead><tr><th>Ngày</th><th>Nội dung</th><th>Loại</th><th>Số tiền</th><th></th></tr></thead>
  <tbody>${rows.map((r, i) => `
    <tr data-i="${i}">
      <td>${esc(r.date || '—')}</td>
      <td>${esc(r.desc)}${r.unparsed ? ' <span class="chip">chưa rõ số tiền</span>' : ''}</td>
      <td><span class="chip">${r.type === 'thu' ? 'Thu' : 'Chi'}</span></td>
      <td>${r.type === 'thu' ? '+' : '−'}${fmtVND(r.amount)}</td>
      <td><button type="button" class="btn btn-ghost" data-act="edit">Sửa</button> <button type="button" class="btn btn-ghost" data-act="del">Xóa</button></td>
    </tr>`).join('')}
  </tbody>
</table>`;
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  $('gctc-parse').addEventListener('click', () => {
    const lines = $('gctc-input').value.split('\n');
    const parsed = [];
    let skipped = 0;
    for (const line of lines) {
      if (!line.trim()) continue;
      const r = parseLine(line);
      if (!r) { skipped++; continue; }
      parsed.push(r);
    }
    rows = parsed;
    render();
    toast('Đã tổng hợp ' + rows.length + ' khoản' + (skipped ? ', bỏ qua ' + skipped + ' dòng trống' : ''));
  });

  $('gctc-out').addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const tr = btn.closest('tr[data-i]');
    const i = parseInt(tr.getAttribute('data-i'), 10);
    if (btn.getAttribute('data-act') === 'del') {
      rows.splice(i, 1);
      render();
      return;
    }
    // Sửa inline: thay hàng bằng các ô nhập.
    const r = rows[i];
    tr.innerHTML = `
      <td><input id="gctc-e-date" type="text" value="${esc(r.date)}" style="width:90px"></td>
      <td><input id="gctc-e-desc" type="text" value="${esc(r.desc)}"></td>
      <td><select id="gctc-e-type"><option value="thu"${r.type === 'thu' ? ' selected' : ''}>Thu</option><option value="chi"${r.type === 'chi' ? ' selected' : ''}>Chi</option></select></td>
      <td><input id="gctc-e-amt" type="text" value="${r.amount}" style="width:120px"></td>
      <td><button type="button" class="btn btn-primary" data-act="save">Lưu</button> <button type="button" class="btn btn-ghost" data-act="cancel">Hủy</button></td>`;
    tr.querySelector('[data-act="save"]').addEventListener('click', () => {
      const amt = parseFloat(String(tr.querySelector('#gctc-e-amt').value).replace(/[\s.]/g, '').replace(',', '.')) || 0;
      rows[i] = {
        date: tr.querySelector('#gctc-e-date').value.trim(),
        desc: tr.querySelector('#gctc-e-desc').value.trim() || r.desc,
        type: tr.querySelector('#gctc-e-type').value,
        amount: Math.abs(amt),
      };
      render();
    });
    tr.querySelector('[data-act="cancel"]').addEventListener('click', render);
  });

  $('gctc-csv').addEventListener('click', () => {
    if (!rows.length) { toast('Chưa có khoản nào để xuất'); return; }
    const head = 'Ngày,Nội dung,Loại,Số tiền (₫)\n';
    const bodyCsv = rows.map(r => [r.date, '"' + r.desc.replace(/"/g, '""') + '"', r.type === 'thu' ? 'Thu' : 'Chi', r.amount].join(',')).join('\n');
    download('ghi-chep-tai-chinh.csv', '﻿' + head + bodyCsv, 'text/csv;charset=utf-8');
    toast('Đã tải file CSV');
  });

  $('gctc-json').addEventListener('click', () => {
    if (!rows.length) { toast('Chưa có khoản nào để xuất'); return; }
    download('ghi-chep-tai-chinh.json', JSON.stringify(rows, null, 2), 'application/json;charset=utf-8');
    toast('Đã tải file JSON');
  });

  render();
}
