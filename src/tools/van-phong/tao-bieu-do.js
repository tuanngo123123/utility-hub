// Tạo biểu đồ — cột / đường / tròn, vẽ bằng canvas thuần, tải về ảnh PNG.
export const meta = {
  id: 'tao-bieu-do',
  name: 'Tạo biểu đồ cột, đường, tròn',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Nhập số liệu theo từng dòng để vẽ biểu đồ cột, biểu đồ đường hoặc biểu đồ tròn, tải về ảnh PNG để chèn vào báo cáo, bài thuyết trình.',
  keywords: 'tạo biểu đồ, vẽ biểu đồ, biểu đồ cột, biểu đồ tròn, biểu đồ đường, chart maker, vẽ chart online, làm biểu đồ miễn phí',
  icon: '📊',
  seoTitle: 'Tạo biểu đồ cột, đường, tròn — Vẽ chart online, tải PNG',
  seoDesc: 'Nhập số liệu để vẽ biểu đồ cột, đường hoặc tròn ngay trên trình duyệt. Tải về ảnh PNG để dùng trong báo cáo và thuyết trình — miễn phí.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📊</span><div><h2>Tạo biểu đồ cột, đường, tròn</h2><p class="muted">Nhập số liệu, chọn kiểu biểu đồ, tải ảnh PNG về dùng ngay cho báo cáo, thuyết trình.</p></div></div>
  <div class="grid-2">
    <div class="field"><label for="tbd-title">Tiêu đề biểu đồ</label><input id="tbd-title" type="text" value="Doanh thu 6 tháng đầu năm (triệu đồng)"></div>
    <div class="field"><label for="tbd-type">Kiểu biểu đồ</label><select id="tbd-type"><option value="bar">Biểu đồ cột</option><option value="line">Biểu đồ đường</option><option value="pie">Biểu đồ tròn (%)</option></select></div>
  </div>
  <div class="field"><label for="tbd-data">Số liệu — mỗi dòng một mục: tên, giá trị (tối đa 12 mục)</label><textarea id="tbd-data" rows="6">Tháng 1, 120
Tháng 2, 150
Tháng 3, 135
Tháng 4, 180
Tháng 5, 210
Tháng 6, 195</textarea></div>
  <button type="button" class="btn btn-primary" id="tbd-go">Vẽ biểu đồ</button>
  <div id="tbd-out"></div>
  <canvas id="tbd-canvas" width="720" height="440" style="display:none"></canvas>
  <p class="note">Giá trị có thể là số thập phân (dùng dấu phẩy thập phân hoặc dấu chấm đều được). Tên mục chứa dấu phẩy vẫn tách đúng (ví dụ: Hà Nội, Việt Nam, 100). Biểu đồ tròn chỉ dùng khi mọi giá trị đều dương.</p>
</div>`;
}

export function init(root) {
  const U = (typeof window !== 'undefined' && window.UH) || {};
  const toast = U.toast || (() => {});
  const $ = id => root.querySelector('#' + id);

  const COLORS = ['#1a5276', '#148f77', '#e67e22', '#8e44ad', '#c0392b', '#2e86c1', '#27ae60', '#f1c40f', '#e91e63', '#795548', '#7f8c8d', '#16a085'];

  function fmtNum(n) {
    return n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  }
  // Hiểu số kiểu Việt Nam: "120" | "120,5" | "1.200,5" (= 1200,5) | "120.5".
  // Dấu phẩy là thập phân, dấu chấm trước dấu phẩy (hoặc dạng 1.200) là
  // phân cách nghìn — cùng quy ước với UH.parseNum. Trả NaN nếu không phải số.
  function parseVNNumber(s) {
    const t = String(s == null ? '' : s).trim().replace(/\s/g, '');
    if (!t) return NaN;
    if (t.indexOf(',') !== -1) {
      if (!/^-?\d{1,3}(\.\d{3})*,\d+$/.test(t) && !/^-?\d+,\d+$/.test(t)) return NaN;
      return parseFloat(t.replace(/\./g, '').replace(',', '.'));
    }
    if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) return parseFloat(t.replace(/\./g, ''));
    if (/^-?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
    return NaN;
  }
  // Tách một dòng thành { label, value } hoặc { error }.
  // - Dấu ';' hoặc tab làm dấu phân cách thì không mơ hồ: tên lấy hết phần
  //   trước dấu cuối cùng, giá trị là phần sau (cho phép "120,5").
  // - Dấu phẩy: token cuối là số và token trước nó KHÔNG phải số thì token
  //   cuối là giá trị ("Hà Nội, Việt Nam, 100" → tên "Hà Nội, Việt Nam").
  //   Ngược lại, ghép 2 token cuối thành số thập phân kiểu VN ("Mục A, 120, 5"
  //   → 120,5; "X, 1.200, 5" → 1200,5).
  function parseLine(line) {
    const sepIdx = Math.max(line.lastIndexOf(';'), line.lastIndexOf('\t'));
    if (sepIdx > 0) {
      const label = line.slice(0, sepIdx).trim();
      const val = parseVNNumber(line.slice(sepIdx + 1));
      if (!label) return { error: 'thiếu tên mục' };
      if (isNaN(val)) return { error: 'giá trị không phải số' };
      return { label, value: val };
    }
    const parts = line.split(',').map(s => s.trim());
    if (parts.length < 2) return { error: 'chưa đúng dạng "tên, giá trị"' };
    const last = parts[parts.length - 1];
    const prev = parts[parts.length - 2];
    const lastVal = parseVNNumber(last);
    if (!isNaN(lastVal) && (parts.length === 2 || isNaN(parseVNNumber(prev)))) {
      const label = parts.slice(0, -1).join(', ').trim();
      if (!label) return { error: 'thiếu tên mục' };
      return { label, value: lastVal };
    }
    // Ghép 2 token cuối: "120" + "5" → 120,5; "1.200" + "5" → 1200,5.
    if (/^-?\d{1,3}(\.\d{3})*$/.test(prev) && /^\d+$/.test(last)) {
      const val = parseVNNumber(prev + ',' + last);
      if (!isNaN(val)) {
        const label = parts.slice(0, -2).join(', ').trim();
        if (!label) return { error: 'thiếu tên mục' };
        return { label, value: val };
      }
    }
    return { error: 'giá trị không phải số' };
  }
  // Trả { rows, errors }: chỉ vẽ các dòng hợp lệ, liệt kê dòng lỗi để báo.
  function parseData() {
    const lines = $('tbd-data').value.split('\n').map(s => s.trim()).filter(Boolean);
    const rows = [];
    const errors = [];
    lines.forEach((line, i) => {
      const r = parseLine(line);
      if (r.error) errors.push('Dòng ' + (i + 1) + ': "' + line + '" — ' + r.error);
      else rows.push(r);
    });
    if (rows.length > 12) return { rows: [], errors: ['Tối đa 12 mục — hiện có ' + rows.length + ' dòng hợp lệ, hãy gộp bớt số liệu.'] };
    return { rows, errors };
  }

  function niceMax(max) {
    if (max <= 0) return 10;
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / pow;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return nice * pow;
  }

  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function draw() {
    const parsed = parseData();
    const canvas = $('tbd-canvas');
    if (!parsed.rows.length) {
      canvas.style.display = 'none';
      $('tbd-out').innerHTML = '<p class="error">' + (parsed.errors.length
        ? 'Không vẽ được biểu đồ — các dòng sau chưa đúng dạng "tên, giá trị":<br>' + parsed.errors.map(e => escHtml(e)).join('<br>')
        : 'Chưa có số liệu — nhập mỗi dòng một mục dạng "tên, giá trị", ví dụ: Tháng 1, 120') + '</p>';
      return;
    }
    const rows = parsed.rows;
    const type = $('tbd-type').value;
    if (type === 'pie' && rows.some(r => r.value <= 0)) {
      $('tbd-out').innerHTML = '<p class="error">Biểu đồ tròn cần mọi giá trị đều lớn hơn 0.</p>';
      return;
    }
    const title = $('tbd-title').value.trim();
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title || 'Biểu đồ', W / 2, 32);

    if (type === 'pie') {
      const total = rows.reduce((a, r) => a + r.value, 0);
      const cx = W / 2 - 90, cy = H / 2 + 20, R = Math.min(W, H) / 2 - 70;
      let angle = -Math.PI / 2;
      rows.forEach((r, i) => {
        const slice = (r.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, angle, angle + slice);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Nhãn % ở giữa lát cắt.
        const mid = angle + slice / 2;
        const lx = cx + Math.cos(mid) * R * 0.65, ly = cy + Math.sin(mid) * R * 0.65;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pct = (r.value / total * 100);
        if (pct >= 4) ctx.fillText(pct.toFixed(1).replace('.', ',') + '%', lx, ly);
        angle += slice;
      });
      // Chú thích bên phải.
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = '14px sans-serif';
      const lx0 = cx + R + 30;
      let ly = cy - R + 10;
      rows.forEach((r, i) => {
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fillRect(lx0, ly - 12, 14, 14);
        ctx.fillStyle = '#222222';
        ctx.fillText(r.label + ' — ' + fmtNum(r.value), lx0 + 22, ly);
        ly += 26;
      });
    } else {
      const max = niceMax(Math.max.apply(null, rows.map(r => r.value)));
      const min = Math.min(0, Math.min.apply(null, rows.map(r => r.value)));
      const plotL = 70, plotR = W - 30, plotT = 60, plotB = H - 70;
      const plotW = plotR - plotL, plotH = plotB - plotT;
      const span = max - min || 1;
      const yOf = v => plotB - ((v - min) / span) * plotH;
      // Lưới ngang + nhãn trục Y.
      ctx.strokeStyle = '#e0e0e0';
      ctx.fillStyle = '#666666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      for (let g = 0; g <= 5; g++) {
        const v = min + (span * g) / 5;
        const y = yOf(v);
        ctx.beginPath(); ctx.moveTo(plotL, y); ctx.lineTo(plotR, y); ctx.stroke();
        ctx.fillText(fmtNum(Math.round(v * 100) / 100), plotL - 8, y + 4);
      }
      // Trục X.
      ctx.strokeStyle = '#999999';
      ctx.beginPath(); ctx.moveTo(plotL, plotB); ctx.lineTo(plotR, plotB); ctx.stroke();
      const slot = plotW / rows.length;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#222222';
      ctx.font = '13px sans-serif';
      rows.forEach((r, i) => {
        const cx = plotL + slot * (i + 0.5);
        let label = r.label;
        if (label.length > 12) label = label.slice(0, 11) + '…';
        ctx.fillText(label, cx, plotB + 22);
      });
      if (type === 'bar') {
        const bw = Math.min(60, slot * 0.6);
        rows.forEach((r, i) => {
          const cx = plotL + slot * (i + 0.5);
          const y = yOf(r.value);
          const y0 = yOf(0);
          ctx.fillStyle = COLORS[i % COLORS.length];
          ctx.fillRect(cx - bw / 2, Math.min(y, y0), bw, Math.abs(y0 - y));
          ctx.fillStyle = '#222222';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(fmtNum(r.value), cx, Math.min(y, y0) - 6);
        });
      } else {
        // Đường + điểm.
        ctx.strokeStyle = COLORS[0];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        rows.forEach((r, i) => {
          const cx = plotL + slot * (i + 0.5);
          const y = yOf(r.value);
          if (i === 0) ctx.moveTo(cx, y); else ctx.lineTo(cx, y);
        });
        ctx.stroke();
        rows.forEach((r, i) => {
          const cx = plotL + slot * (i + 0.5);
          const y = yOf(r.value);
          ctx.beginPath();
          ctx.arc(cx, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = COLORS[0];
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#222222';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(fmtNum(r.value), cx, y - 12);
        });
      }
    }

    canvas.style.display = '';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    const warnHtml = parsed.errors.length
      ? '<p class="error">Đã bỏ qua ' + parsed.errors.length + ' dòng không phân tích được (chỉ vẽ ' + rows.length + ' dòng hợp lệ):<br>' + parsed.errors.map(e => escHtml(e)).join('<br>') + '</p>'
      : '';
    $('tbd-out').innerHTML = warnHtml + '<div class="result"><div class="result-row"><span>Biểu đồ</span><strong>' + rows.length + ' mục — ' +
      (type === 'bar' ? 'biểu đồ cột' : type === 'line' ? 'biểu đồ đường' : 'biểu đồ tròn') + '</strong></div></div>' +
      '<button type="button" class="btn btn-ghost" id="tbd-dl">Tải ảnh PNG</button>';
    $('tbd-dl').addEventListener('click', () => {
      try {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'bieu-do.png';
        a.click();
        toast('Đã tải ảnh biểu đồ.');
      } catch (e) {
        toast('Không tải được ảnh. Hãy chụp màn hình biểu đồ.');
      }
    });
  }

  $('tbd-go').addEventListener('click', draw);
  draw();
}
