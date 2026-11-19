// Tạo báo giá nhanh xuất PDF — công cụ nhóm Văn phòng.
//
// Người dùng nhập người bán, khách hàng, ngày báo giá, bảng hạng
// mục (tên + số lượng + đơn giá), chiết khấu, VAT — công cụ tính
// ngay tạm tính / chiết khấu / VAT / tổng cộng + đọc số tiền bằng
// chữ. Nút Tải file PDF vẽ báo giá lên canvas khổ A4 (phông Be
// Vietnam Pro của trang nên chữ tiếng Việt hiện đúng) rồi nhúng
// vào file PDF bằng trình ghi viết tay trong src/bao-gia-logic.js
// (theo mẫu công cụ Ảnh → PDF) — không cần thư viện PDF nào.
// pdf-lib không dùng được ở đây vì phông chuẩn của nó không có
// dấu tiếng Việt, còn nhúng phông TTF thì cần fontkit (chưa có
// trong repo). Chữ trong PDF là ảnh (không chọn/cọp được văn bản)
// — ghi rõ trong FAQ; nút Chép báo giá cho bản văn bản đầy đủ.
//
// Logic thuần nằm ở src/bao-gia-logic.js (build.mjs chèn vào
// trang, dùng qua window.UH_BAOGIA) — cùng mẫu thuế nhà đất.
// Bản nháp tự lưu localStorage (khóa uh_baogia) để mở lại vẫn còn.
export const meta = {
  id: 'tao-bao-gia-nhanh',
  name: 'Tạo báo giá nhanh xuất PDF',
  desc: 'Soạn báo giá trong 1 phút: nhập hạng mục, chiết khấu, VAT rồi tải file PDF trình bày sẵn để gửi khách — kèm đọc số tiền bằng chữ.',
  icon: '🧾',
  categorySlug: 'van-phong',
};

export function body() {
  return `<div class="m2-tool">
  <div class="m2-layout">
    <div class="m2-inputs">
      <div class="m2-input-grid m2-input-grid-1col">
        <div class="field m2-field">
          <label for="bg-seller">Tên công ty / cá nhân bán</label>
          <input id="bg-seller" type="text" value="Công ty TNHH An Phát" placeholder="Ví dụ: Công ty TNHH An Phát" autocomplete="off">
        </div>
        <div class="field m2-field">
          <label for="bg-contact">Địa chỉ, số điện thoại người bán <span class="m2-opt">(không bắt buộc)</span></label>
          <input id="bg-contact" type="text" value="12 Lê Lợi, Quận 1, TP. Hồ Chí Minh" placeholder="Ví dụ: 12 Lê Lợi, Quận 1, TP. Hồ Chí Minh" autocomplete="off">
        </div>
        <div class="field m2-field">
          <label for="bg-customer">Khách hàng</label>
          <input id="bg-customer" type="text" value="Anh Nguyễn Văn Bình" placeholder="Ví dụ: Anh Nguyễn Văn Bình" autocomplete="off">
        </div>
        <div class="field m2-field">
          <label for="bg-date">Ngày báo giá</label>
          <input id="bg-date" type="date">
        </div>
        <div class="field m2-field">
          <span class="bg-section-label" id="bg-items-label">Hạng mục báo giá</span>
          <div id="bg-items" class="bg-items" role="group" aria-labelledby="bg-items-label"></div>
          <button type="button" class="btn btn-secondary" id="bg-add-item">＋ Thêm hạng mục</button>
          <p class="hint">Mỗi dòng: tên hàng hóa/dịch vụ, số lượng (lẻ được, ví dụ 2,5 giờ) và đơn giá. Thành tiền tự tính.</p>
        </div>
        <div class="field m2-field">
          <label for="bg-discount-type">Chiết khấu</label>
          <select id="bg-discount-type">
            <option value="none">Không chiết khấu</option>
            <option value="percent">Chiết khấu theo %</option>
            <option value="amount">Chiết khấu theo số tiền</option>
          </select>
        </div>
        <div class="field m2-field" id="bg-discount-wrap" hidden>
          <label for="bg-discount-value" id="bg-discount-label">Tỷ lệ chiết khấu</label>
          <span class="input-unit"><input id="bg-discount-value" type="text" inputmode="decimal" placeholder="Ví dụ: 10" autocomplete="off"><span class="unit" id="bg-discount-unit">%</span></span>
          <p class="hint">Chiết khấu tính trên tạm tính, tối đa 100% hoặc bằng tạm tính. Thuế GTGT tính trên số tiền sau chiết khấu.</p>
        </div>
        <div class="field m2-field">
          <label for="bg-vat">Thuế GTGT</label>
          <select id="bg-vat">
            <option value="0.1">10% — mức thông thường</option>
            <option value="0.08">8% — mức giảm đến 31/12/2026</option>
            <option value="0">0% — không chịu thuế</option>
          </select>
          <p class="hint">Mức giảm 8% áp dụng đến 31/12/2026 theo Nghị quyết 204/2025/QH15; từ 01/01/2027 về 10% nếu không được gia hạn. Không phải mặt hàng nào cũng được giảm 8% — đối chiếu với kế toán của bạn.</p>
        </div>
        <div class="field m2-field">
          <label for="bg-note">Ghi chú <span class="m2-opt">(không bắt buộc)</span></label>
          <textarea id="bg-note" rows="2" placeholder="Ví dụ: Báo giá có hiệu lực 15 ngày kể từ ngày báo giá.">Báo giá có hiệu lực 15 ngày kể từ ngày báo giá.</textarea>
        </div>
      </div>
    </div>
    <div class="m2-result-card" id="bg-result-card">
      <div id="bg-out"></div>
    </div>
  </div>
  <p class="note">Đây là báo giá, không phải hóa đơn GTGT. Số tiền chỉ để tham khảo — đối chiếu hợp đồng thực tế trước khi giao dịch.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const M2 = U.m2 || null;
  const D = window.UH_BAOGIA;
  const $ = function (id) { return root.querySelector('#' + id); };
  const toast = U.toast || (function () {});
  const setBusy = U.setBusy || (function () {});
  const fmtVND = U.fmtVND || (function (n) { return Math.round(n).toLocaleString('vi-VN') + ' ₫'; });
  const DRAFT_KEY = 'uh_baogia';
  const stepsState = { stepsOpen: false };
  let lastCopyText = '';
  let lastQuote = null;
  let lastMeta = null;
  // Đếm id dòng đơn điệu — không dùng số lượng dòng hiện có vì sau
  // khi xóa một dòng ở giữa, số lượng sẽ trùng id dòng còn lại.
  let nextItemId = 0;
  const sticky = M2.setupSticky({
    root,
    resultEl: $('bg-out'),
    getCopyText: function () { return lastCopyText; },
    copyMsg: 'Đã chép nội dung báo giá',
  });

  function todayIso() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Bảng hạng mục (đọc từ DOM lúc tính; chỉ vẽ lại khi thêm/xóa dòng) ---
  function itemRowHtml(i, it) {
    const qtyText = it.qty === '' || it.qty == null ? '' : String(it.qty);
    const priceText = it.price === '' || it.price == null ? '' : String(it.price);
    return '<div class="bg-item" data-i="' + i + '">'
      + '<input type="text" class="bg-item-name" id="bg-item-' + i + '-name" placeholder="Tên hàng hóa / dịch vụ" value="' + escHtml(it.name || '') + '" autocomplete="off">'
      + '<div class="bg-item-row">'
      + '<label class="bg-item-field"><span>Số lượng</span><input type="text" class="bg-item-qty" id="bg-item-' + i + '-qty" inputmode="decimal" value="' + escHtml(qtyText) + '" autocomplete="off"></label>'
      + '<label class="bg-item-field bg-item-field-price"><span>Đơn giá</span><span class="input-unit"><input type="text" class="bg-item-price" id="bg-item-' + i + '-price" inputmode="decimal" value="' + escHtml(priceText) + '" autocomplete="off"><span class="unit">₫</span></span></label>'
      + '<span class="bg-item-amount" aria-live="polite"></span>'
      + '<button type="button" class="bg-item-del" aria-label="Xóa hạng mục này">✕</button>'
      + '</div></div>';
  }

  function renderItems(items) {
    $('bg-items').innerHTML = items.map(function (it, i) { return itemRowHtml(i, it); }).join('');
    nextItemId = items.length;
    updateDelButtons();
  }

  function updateDelButtons() {
    const rows = $('bg-items').querySelectorAll('.bg-item');
    rows.forEach(function (row) {
      const btn = row.querySelector('.bg-item-del');
      if (btn) btn.disabled = rows.length <= 1;
    });
    $('bg-add-item').disabled = rows.length >= D.MAX_ITEMS;
  }

  function readItemsFromDom() {
    const rows = $('bg-items').querySelectorAll('.bg-item');
    const items = [];
    rows.forEach(function (row) {
      const nameEl = row.querySelector('.bg-item-name');
      const qtyEl = row.querySelector('.bg-item-qty');
      const priceEl = row.querySelector('.bg-item-price');
      const qty = D.parseQty(qtyEl.value);
      const price = D.parseMoney(priceEl.value);
      qtyEl.classList.toggle('bg-input-error', qtyEl.value.trim() !== '' && qty === null);
      priceEl.classList.toggle('bg-input-error', priceEl.value.trim() !== '' && price === null);
      items.push({ name: nameEl.value, qty: qty === null ? 0 : qty, price: price === null ? 0 : price });
    });
    return items;
  }

  function readMeta() {
    return {
      seller: $('bg-seller').value.trim(),
      contact: $('bg-contact').value.trim(),
      customer: $('bg-customer').value.trim(),
      date: $('bg-date').value,
      note: $('bg-note').value.trim(),
    };
  }

  function readDiscount() {
    const type = $('bg-discount-type').value;
    if (type === 'percent') {
      const v = D.parseMoney($('bg-discount-value').value);
      return { type: 'percent', value: v === null ? 0 : v };
    }
    if (type === 'amount') {
      const v = D.parseMoney($('bg-discount-value').value);
      return { type: 'amount', value: v === null ? 0 : v };
    }
    return { type: 'none', value: 0 };
  }

  function updateRowAmounts(quote) {
    const rows = $('bg-items').querySelectorAll('.bg-item');
    rows.forEach(function (row, i) {
      const el = row.querySelector('.bg-item-amount');
      const line = quote.lines[i];
      if (el && line) el.textContent = fmtVND(line.amount);
    });
  }

  // --- Lưu bản nháp ---
  const saveDraft = M2.debounce(function () {
    try {
      const items = [];
      $('bg-items').querySelectorAll('.bg-item').forEach(function (row) {
        items.push({
          name: row.querySelector('.bg-item-name').value,
          qty: row.querySelector('.bg-item-qty').value,
          price: row.querySelector('.bg-item-price').value,
        });
      });
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        meta: readMeta(),
        items: items,
        discountType: $('bg-discount-type').value,
        discountValue: $('bg-discount-value').value,
        vatRate: $('bg-vat').value,
      }));
    } catch (e) { /* bộ nhớ đầy hoặc chế độ riêng tư — bỏ qua */ }
  }, 500);

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.items) || !d.items.length) return null;
      return d;
    } catch (e) { return null; }
  }

  // --- Hiển thị chiết khấu ---
  function syncDiscountField() {
    const type = $('bg-discount-type').value;
    $('bg-discount-wrap').hidden = type === 'none';
    if (type === 'percent') {
      $('bg-discount-label').textContent = 'Tỷ lệ chiết khấu';
      $('bg-discount-unit').textContent = '%';
      $('bg-discount-value').placeholder = 'Ví dụ: 10';
    } else if (type === 'amount') {
      $('bg-discount-label').textContent = 'Số tiền chiết khấu';
      $('bg-discount-unit').textContent = '₫';
      $('bg-discount-value').placeholder = 'Ví dụ: 500.000';
    }
  }

  // --- Vẽ báo giá lên canvas khổ A4 rồi xuất PDF ---
  function wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach(function (w) {
      const trial = line ? line + ' ' + w : w;
      if (ctx.measureText(trial).width <= maxWidth || !line) {
        line = trial;
      } else {
        lines.push(line);
        line = w;
      }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  function drawQuotePage(ctx, W, H, page, totalPages, meta, quote, rows) {
    const M = 80;
    const CW = W - M * 2;
    const BLUE = '#1747E6';
    const INK = '#0F172A';
    const MUTED = '#64748B';
    const LINE = '#DCE1EA';
    const HEAD_BG = '#E8EEFF';
    const COLS = [
      { x: M, w: 70, align: 'center', label: 'STT' },
      { x: M + 70, w: 500, align: 'left', label: 'Hạng mục' },
      { x: M + 570, w: 100, align: 'right', label: 'SL' },
      { x: M + 670, w: 210, align: 'right', label: 'Đơn giá' },
      { x: M + 880, w: 200, align: 'right', label: 'Thành tiền' },
    ];
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    let y = 0;

    function drawTableHeader(top) {
      ctx.fillStyle = HEAD_BG;
      ctx.fillRect(M, top, CW, 52);
      ctx.fillStyle = INK;
      ctx.font = '700 24px "Be Vietnam Pro", sans-serif';
      COLS.forEach(function (c) {
        ctx.textAlign = c.align;
        const tx = c.align === 'left' ? c.x + 14 : c.align === 'right' ? c.x + c.w - 14 : c.x + c.w / 2;
        ctx.fillText(c.label, tx, top + 36);
      });
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(M, top + 52); ctx.lineTo(M + CW, top + 52); ctx.stroke();
      return top + 52;
    }

    function drawRow(row, top, height, nameLines) {
      ctx.font = '400 24px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.fillText(String(row.stt), COLS[0].x + COLS[0].w / 2, top + 36);
      ctx.textAlign = 'left';
      nameLines.forEach(function (ln, li) {
        ctx.fillText(ln, COLS[1].x + 14, top + 36 + li * 30);
      });
      ctx.textAlign = 'right';
      ctx.fillText(row.qtyText, COLS[2].x + COLS[2].w - 14, top + 36);
      ctx.fillText(row.priceText, COLS[3].x + COLS[3].w - 14, top + 36);
      ctx.font = '600 24px "Be Vietnam Pro", sans-serif';
      ctx.fillText(row.amountText, COLS[4].x + COLS[4].w - 14, top + 36);
      ctx.strokeStyle = LINE;
      ctx.beginPath(); ctx.moveTo(M, top + height); ctx.lineTo(M + CW, top + height); ctx.stroke();
      return top + height;
    }

    if (page.index === 0) {
      ctx.fillStyle = BLUE;
      ctx.font = '800 54px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BÁO GIÁ', W / 2, 128);
      ctx.fillStyle = INK;
      ctx.font = '700 30px "Be Vietnam Pro", sans-serif';
      ctx.fillText(meta.seller || 'Báo giá', W / 2, 182);
      if (meta.contact) {
        ctx.fillStyle = MUTED;
        ctx.font = '400 22px "Be Vietnam Pro", sans-serif';
        ctx.fillText(meta.contact, W / 2, 218);
      }
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(M, 248); ctx.lineTo(M + CW, 248); ctx.stroke();
      ctx.textAlign = 'left';
      ctx.font = '400 26px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = MUTED;
      // Đo chiều rộng nhãn rồi đặt giá trị sau đó — nhãn "Ngày báo giá:"
      // dài hơn "Khách hàng:", dùng chung một mốc x cố định sẽ chồng
      // chữ (bắt được khi xem ảnh PDF render, 20/11).
      const labelKhach = 'Khách hàng:';
      ctx.fillText(labelKhach, M, 296);
      const wKhach = ctx.measureText(labelKhach).width;
      ctx.fillStyle = INK;
      ctx.font = '600 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(meta.customer || '—', M + wKhach + 14, 296);
      ctx.fillStyle = MUTED;
      ctx.font = '400 26px "Be Vietnam Pro", sans-serif';
      const labelNgay = 'Ngày báo giá:';
      ctx.fillText(labelNgay, M, 338);
      const wNgay = ctx.measureText(labelNgay).width;
      ctx.fillStyle = INK;
      ctx.font = '600 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(meta.date ? D.formatDateVi(meta.date) : D.formatDateVi(todayIso()), M + wNgay + 14, 338);
      y = drawTableHeader(366);
    } else {
      ctx.fillStyle = MUTED;
      ctx.font = '600 24px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('BÁO GIÁ (tiếp theo)', M, 108);
      y = drawTableHeader(136);
    }

    page.rows.forEach(function (r) {
      y = drawRow(r.row, y, r.height, r.nameLines);
    });

    if (page.isLast) {
      y += 16;
      const totals = [
        { label: 'Tạm tính', value: fmtVND(quote.subtotal), big: false },
      ];
      if (quote.discount > 0) {
        const how = quote.discountType === 'percent'
          ? D.fmtQty(quote.discountValue) + '%'
          : D.fmtMoney(quote.discountValue);
        totals.push({ label: 'Chiết khấu (' + how + ')', value: '−' + fmtVND(quote.discount), big: false });
      }
      totals.push({ label: 'Thuế GTGT (' + D.fmtQty(quote.vatRate * 100) + '%)', value: fmtVND(quote.vat), big: false });
      ctx.font = '400 26px "Be Vietnam Pro", sans-serif';
      totals.forEach(function (t) {
        ctx.fillStyle = INK;
        ctx.textAlign = 'right';
        ctx.fillText(t.label, M + 700, y + 30);
        ctx.fillText(t.value, M + CW, y + 30);
        y += 44;
      });
      y += 8;
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(M + 520, y); ctx.lineTo(M + CW, y); ctx.stroke();
      y += 52;
      ctx.fillStyle = BLUE;
      ctx.font = '800 34px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('TỔNG CỘNG', M + 700, y);
      ctx.fillText(fmtVND(quote.total), M + CW, y);
      y += 48;
      ctx.fillStyle = INK;
      ctx.font = 'italic 400 24px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      wrapText(ctx, 'Bằng chữ: ' + quote.words, CW).forEach(function (ln) {
        ctx.fillText(ln, M, y);
        y += 34;
      });
      if (meta.note) {
        y += 12;
        ctx.font = '400 24px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = MUTED;
        wrapText(ctx, 'Ghi chú: ' + meta.note, CW).forEach(function (ln) {
          ctx.fillText(ln, M, y);
          y += 34;
        });
      }
      y += 40;
      ctx.fillStyle = INK;
      ctx.font = '600 26px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Người lập báo giá', M + CW / 4, y);
      ctx.fillText('Khách hàng', M + (CW * 3) / 4, y);
      ctx.fillStyle = MUTED;
      ctx.font = '400 22px "Be Vietnam Pro", sans-serif';
      ctx.fillText('(Ký và ghi rõ họ tên)', M + CW / 4, y + 34);
      ctx.fillText('(Ký và ghi rõ họ tên)', M + (CW * 3) / 4, y + 34);
    }

    ctx.fillStyle = MUTED;
    ctx.font = '400 20px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Đây là báo giá, không phải hóa đơn GTGT. · tienichhub.io.vn', W / 2, H - 56);
    if (totalPages > 1) {
      ctx.textAlign = 'right';
      ctx.fillText('Trang ' + (page.index + 1) + '/' + totalPages, M + CW, H - 56);
    }
  }

  function canvasToJpeg(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('toBlob')); return; }
        blob.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); }).catch(reject);
      }, 'image/jpeg', quality);
    });
  }

  async function exportPdf(btn) {
    if (!lastQuote || !lastMeta) return;
    const statusEl = $('bg-pdf-status');
    setBusy(btn, true, 'Đang tạo PDF…');
    btn.disabled = true;
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all([
          document.fonts.load('400 24px "Be Vietnam Pro"'),
          document.fonts.load('600 24px "Be Vietnam Pro"'),
          document.fonts.load('700 30px "Be Vietnam Pro"'),
          document.fonts.load('800 54px "Be Vietnam Pro"'),
        ]).catch(function () { /* phông chưa kịp tải vẫn vẽ bằng phông dự phòng */ });
      }
      const W = 1240;
      const H = 1754;
      const rows = D.quoteRows(lastQuote);
      // Đo chiều cao từng dòng (tên dài tự xuống dòng, tối đa 3 dòng).
      const meas = document.createElement('canvas').getContext('2d');
      meas.font = '400 24px "Be Vietnam Pro", sans-serif';
      const measured = rows.map(function (r) {
        let nameLines = wrapText(meas, r.name || '(chưa đặt tên)', 472);
        if (nameLines.length > 3) {
          nameLines = nameLines.slice(0, 3);
          nameLines[2] = nameLines[2].replace(/.$/, '…');
        }
        return { row: r, nameLines: nameLines, height: 30 + nameLines.length * 30 };
      });
      // Chia trang: trang đầu chừa chỗ cho đầu trang + bảng tổng ở cuối,
      // trang sau chỉ chừa chân trang. Ước lượng khối tổng ~430px.
      const ROW_TOP_P1 = 430;
      const ROW_TOP_NEXT = 200;
      const ROW_BOTTOM = 1640;
      const TOTALS_H = 470;
      const pages = [];
      let cur = [];
      let used = 0;
      let limit = ROW_BOTTOM - ROW_TOP_P1;
      measured.forEach(function (m) {
        if (cur.length && used + m.height > limit) {
          pages.push(cur);
          cur = [];
          used = 0;
          limit = ROW_BOTTOM - ROW_TOP_NEXT;
        }
        cur.push(m);
        used += m.height;
      });
      if (used + TOTALS_H > limit && cur.length) {
        pages.push(cur);
        cur = [];
      }
      pages.push(cur);
      const pageObjs = pages.map(function (rs, i) {
        return { index: i, rows: rs, isLast: i === pages.length - 1 };
      });
      const pdfPages = [];
      for (let i = 0; i < pageObjs.length; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        drawQuotePage(ctx, W, H, pageObjs[i], pageObjs.length, lastMeta, lastQuote, rows);
        const jpeg = await canvasToJpeg(canvas, 0.92);
        pdfPages.push({ jpeg: jpeg, w: W, h: H, pageW: 595, pageH: 842 });
      }
      const pdfBytes = D.buildPdfFromJpegs(pdfPages);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const fname = 'bao-gia-' + (lastMeta.date || todayIso()) + '.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = fname;
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      if (statusEl) statusEl.textContent = 'Đã tải file PDF ' + pageObjs.length + ' trang (' + fname + ').';
      toast('Đã tải file PDF báo giá.');
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Không tạo được file PDF — thử lại hoặc dùng nút Chép báo giá.';
    } finally {
      setBusy(btn, false);
      btn.disabled = false;
    }
  }

  // --- Tính + hiển thị ---
  function render() {
    const meta = readMeta();
    const disc = readDiscount();
    const quote = D.computeQuote({
      items: readItemsFromDom(),
      discountType: disc.type,
      discountValue: disc.value,
      vatRate: parseFloat($('bg-vat').value),
    });
    lastQuote = quote;
    lastMeta = meta;
    updateRowAmounts(quote);
    const copyText = D.quoteToText(meta, quote);
    lastCopyText = copyText;
    const discLabel = quote.discount > 0
      ? 'Chiết khấu' + (quote.discountType === 'percent' ? ' (' + D.fmtQty(quote.discountValue) + '%)' : '')
      : 'Chiết khấu';
    const steps = quote.lines.map(function (l, i) {
      return {
        label: (i + 1) + '. ' + (l.name || '(chưa đặt tên)'),
        sub: D.fmtQty(l.qty) + ' × ' + fmtVND(l.price),
        amount: fmtVND(l.amount),
      };
    });
    steps.push({ label: 'Tạm tính', sub: quote.lines.length + ' hạng mục', amount: fmtVND(quote.subtotal) });
    if (quote.discount > 0) {
      steps.push({
        label: 'Chiết khấu',
        sub: quote.discountType === 'percent'
          ? D.fmtQty(quote.discountValue) + '% × ' + fmtVND(quote.subtotal)
          : 'Giảm trực tiếp ' + fmtVND(quote.discount),
        amount: '−' + fmtVND(quote.discount),
      });
      steps.push({ label: 'Sau chiết khấu', amount: fmtVND(quote.afterDiscount) });
    }
    steps.push({
      label: 'Thuế GTGT (' + D.fmtQty(quote.vatRate * 100) + '%)',
      sub: D.fmtQty(quote.vatRate * 100) + '% × ' + fmtVND(quote.afterDiscount),
      amount: fmtVND(quote.vat),
    });
    steps.push({ label: 'Tổng cộng', sub: 'Sau chiết khấu + thuế GTGT', amount: fmtVND(quote.total) });
    M2.renderResult($('bg-out'), {
      label: 'Tổng cộng',
      value: fmtVND(quote.total),
      pctLine: 'Bằng chữ: ' + quote.words,
      note: (meta.customer ? 'Báo giá cho ' + meta.customer + ' · ' : '') + quote.lines.length + ' hạng mục. Đây là báo giá, không phải hóa đơn GTGT.',
      rows: [
        { label: 'Tạm tính', value: fmtVND(quote.subtotal) },
        { label: discLabel, value: quote.discount > 0 ? '−' + fmtVND(quote.discount) : fmtVND(0) },
        { label: 'Thuế GTGT (' + D.fmtQty(quote.vatRate * 100) + '%)', value: fmtVND(quote.vat) },
      ],
      steps,
      copyText,
      copyMsg: 'Đã chép nội dung báo giá',
      shareTitle: 'Báo giá',
      image: {
        title: 'BÁO GIÁ',
        file: 'bao-gia.png',
        heroLabel: 'Tổng cộng',
        heroValue: fmtVND(quote.total),
        pctLine: 'Bằng chữ: ' + quote.words,
        rows: [
          ['Tạm tính', fmtVND(quote.subtotal), false],
          ['Chiết khấu', quote.discount > 0 ? '−' + fmtVND(quote.discount) : fmtVND(0), false],
          ['Thuế GTGT (' + D.fmtQty(quote.vatRate * 100) + '%)', fmtVND(quote.vat), false],
          ['Tổng cộng', fmtVND(quote.total), true],
        ],
      },
    }, stepsState);
    // Nút tải PDF riêng của công cụ này (khung MẪU 2 chỉ có Chép /
    // Zalo / Tải ảnh) — gắn lại sau mỗi lần vẽ kết quả.
    const actions = $('bg-out').querySelector('.m2-result-actions');
    if (actions) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<button type="button" class="btn btn-primary bg-pdf-btn" id="bg-pdf">Tải file PDF</button>'
        + '<p class="hint bg-pdf-hint" id="bg-pdf-status"></p>';
      const pdfBtn = wrap.firstElementChild;
      const pdfStatus = wrap.lastElementChild;
      actions.insertAdjacentElement('afterend', pdfBtn);
      pdfBtn.insertAdjacentElement('afterend', pdfStatus);
      $('bg-pdf').addEventListener('click', function () { exportPdf($('bg-pdf')); });
    }
    sticky.update(fmtVND(quote.total), 'Tổng cộng');
    saveDraft();
  }

  const liveCalc = M2.debounce(function () { render(); }, 300);

  // --- Khởi tạo: bản nháp đã lưu, nếu không thì báo giá mẫu ---
  const draft = loadDraft();
  const sample = D.sampleQuote();
  if (draft && draft.meta) {
    $('bg-seller').value = draft.meta.seller || sample.meta.seller;
    $('bg-contact').value = draft.meta.contact || '';
    $('bg-customer').value = draft.meta.customer || '';
    $('bg-date').value = draft.meta.date || todayIso();
    $('bg-note').value = draft.meta.note || '';
    $('bg-discount-type').value = draft.discountType || 'none';
    $('bg-discount-value').value = draft.discountValue || '';
    $('bg-vat').value = draft.vatRate || '0.1';
    renderItems(draft.items.map(function (it) {
      return {
        name: it.name || '',
        qty: it.qty === '' || it.qty == null ? '' : String(it.qty),
        price: it.price === '' || it.price == null ? '' : String(it.price),
      };
    }));
  } else {
    $('bg-date').value = todayIso();
    renderItems(sample.items.map(function (it) {
      return { name: it.name, qty: String(it.qty), price: it.price.toLocaleString('vi-VN') };
    }));
  }
  syncDiscountField();

  // Sự kiện: gõ trong bảng hạng mục (ủy quyền trên khung chứa để
  // không mất focus khi vẽ lại), ô tĩnh, thêm/xóa dòng.
  $('bg-items').addEventListener('input', liveCalc);
  $('bg-items').addEventListener('click', function (ev) {
    const btn = ev.target.closest ? ev.target.closest('.bg-item-del') : null;
    if (!btn || btn.disabled) return;
    const row = btn.closest('.bg-item');
    if (row) row.remove();
    updateDelButtons();
    render();
  });
  $('bg-add-item').addEventListener('click', function () {
    const wrap = $('bg-items');
    const n = wrap.querySelectorAll('.bg-item').length;
    if (n >= D.MAX_ITEMS) return;
    const id = nextItemId;
    nextItemId += 1;
    const div = document.createElement('div');
    div.innerHTML = itemRowHtml(id, { name: '', qty: '1', price: '' });
    wrap.appendChild(div.firstElementChild);
    updateDelButtons();
    const nameEl = wrap.querySelector('#bg-item-' + id + '-name');
    if (nameEl) nameEl.focus();
    render();
  });
  ['bg-seller', 'bg-contact', 'bg-customer', 'bg-date', 'bg-note', 'bg-discount-value'].forEach(function (id) {
    const el = $(id);
    el.addEventListener('input', liveCalc);
    el.addEventListener('change', liveCalc);
  });
  $('bg-discount-type').addEventListener('change', function () {
    syncDiscountField();
    render();
  });
  $('bg-vat').addEventListener('change', function () { render(); });

  render();
}
