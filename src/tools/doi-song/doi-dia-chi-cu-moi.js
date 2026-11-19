// Đổi địa chỉ cũ sang mới — tra tỉnh/thành và xã/phường mới sau sáp nhập
// 2025 (63 → 34 tỉnh; 10.035 xã/phường cũ → 3.321 xã/phường/đặc khu),
// theo Nghị quyết 202/2025/QH15 (cấp tỉnh) và các Nghị quyết
// 1654–1687/NQ-UBTVQH15 (cấp xã). Dữ liệu nạp lúc chạy từ
// /data/dia-chi-cu-moi.json (tỉnh) và /data/xa-cu-moi.json (xã — nguồn
// Atlas34, giấy phép MIT; xem src/data/xa-cu-moi-NGUON.md). Phần
// thôn/ấp/tổ/bản giữ nguyên như đã gõ (chưa có dữ liệu thôn toàn quốc).
export const meta = {
  id: 'doi-dia-chi-cu-moi',
  name: 'Đổi địa chỉ cũ sang mới (sáp nhập 2025)',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Tra tỉnh/thành và xã/phường mới của địa chỉ cũ sau đợt sáp nhập 2025: 63 tỉnh cũ thành 34 tỉnh, thành phố mới; 10.035 xã/phường cũ sắp xếp lại thành 3.321 xã/phường/đặc khu. Nhập địa chỉ đầy đủ để biết cả tên xã mới.',
  keywords: 'đổi địa chỉ cũ sang mới, sáp nhập tỉnh 2025, tỉnh cũ thuộc tỉnh nào, xã cũ thuộc xã nào, tra xã mới 2025, 63 tỉnh thành 34 tỉnh, địa chỉ mới sau sáp nhập, Nghị quyết 202/2025/QH15',
  icon: '🗺️',
  seoTitle: 'Đổi địa chỉ cũ sang mới — Tra tỉnh và xã mới sau sáp nhập 2025',
  seoDesc: 'Nhập tỉnh cũ và địa chỉ đầy đủ để biết tỉnh/thành và xã/phường mới sau đợt sắp xếp đơn vị hành chính 2025 (63 → 34 tỉnh; 10.035 → 3.321 xã/phường), hiệu lực từ 1/7/2025.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🗺️</span><div><h2>Đổi địa chỉ cũ sang mới</h2><p class="muted">Từ 1/7/2025, cả nước còn 34 tỉnh, thành phố và 3.321 xã, phường, đặc khu. Chọn tỉnh cũ để biết tỉnh mới; nhập địa chỉ đầy đủ để biết cả tên xã mới.</p></div></div>
  <p class="note">Tra cứu tới cấp xã/phường: nhập địa chỉ đầy đủ để biết tên xã/phường mới (10.035 xã/phường cũ sắp xếp lại thành 3.321 xã/phường/đặc khu từ 1/7/2025). Cấp huyện (quận/huyện/thị xã) đã bãi bỏ, địa chỉ mới chỉ còn 2 cấp: xã/phường + tỉnh/thành phố. Phần thôn/ấp/tổ/bản giữ nguyên như đã gõ — chưa có dữ liệu thôn toàn quốc.</p>
  <p class="muted" id="ddc-status">Đang tải dữ liệu đối chiếu…</p>
  <div class="error" id="ddc-error" style="display:none"></div>
  <div id="ddc-form" style="display:none">
    <div class="grid-2">
      <div class="field"><label for="ddc-tinh">Tỉnh/thành cũ (tính đến 30/6/2025)</label><select id="ddc-tinh"></select><p class="hint">Chọn tỉnh/thành ghi trên giấy tờ, địa chỉ cũ của bạn.</p></div>
      <div class="field"><label for="ddc-diachi">Địa chỉ cũ đầy đủ (không bắt buộc)</label><input id="ddc-diachi" type="text" placeholder="Ví dụ: Số 12, đường Lê Lợi, phường Phú Cường, TP Thủ Dầu Một, tỉnh Bình Dương"><p class="hint">Nếu nhập, công cụ gợi ý cách viết lại địa chỉ với tỉnh và xã mới (tự bỏ phần quận/huyện đã bãi bỏ).</p></div>
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
  <p class="note">Nguồn: Nghị quyết 202/2025/QH15 của Quốc hội (thông qua 12/6/2025, chính quyền mới hoạt động từ 1/7/2025); Luật Tổ chức chính quyền địa phương 65/2025/QH15 (mô hình 2 cấp, kết thúc cấp huyện); các Nghị quyết 1654–1687/NQ-UBTVQH15 về sắp xếp cấp xã. Dữ liệu xã cũ → xã mới: Atlas34 (github.com/gooduselabs/atlas34, giấy phép MIT). Giấy tờ ghi địa chỉ cũ vẫn có giá trị sử dụng, chỉ cần cập nhật khi làm thủ tục mới hoặc khi giấy tờ được cấp lại.</p>
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
  const XA_URL = '/data/xa-cu-moi.json';

  let data = null;
  let byOld = {};
  let xaData = null; // {rows, wards} hoặc null nếu tải dữ liệu xã lỗi
  let wardByName = {}; // tên xã chuẩn hóa (bỏ dấu, bỏ tiền tố) -> [row]
  let districtByProvince = {}; // tỉnh chuẩn hóa -> Set(huyện chuẩn hóa)
  let mergedByTarget = {}; // mã xã mới -> [{code, name, fraction}]

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

  // Chuẩn hóa để đối chiếu: viết thường, bỏ dấu, gộp khoảng trắng.
  // "đ" không tách dấu được bằng NFD nên thay riêng.
  function normLoose(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/\s+/g, ' ').trim();
  }
  // Bỏ tiền tố loại đơn vị ở đầu chuỗi đã chuẩn hóa (không dấu).
  function stripUnitPrefix(norm) {
    return norm.replace(/^(xa|phuong|thi tran|thi xa|quan|huyen|tinh|thanh pho|tp\.?|dac khu)\s+/, '');
  }
  // Các khóa tra cứu của một tên đơn vị, theo thứ tự ưu tiên: (1) bỏ
  // tiền tố trên văn bản gốc có dấu — chính xác nhất; (2) tên đầy đủ
  // chuẩn hóa — phòng tên xã tự nó bắt đầu bằng "Xa" (Xa Dung) hay
  // "Quán" (Quán Hàu) mà bước (3) sẽ cắt nhầm; (3) bỏ tiền tố trên
  // dạng không dấu — cho người gõ không dấu ("xa van ninh").
  function wardKeys(text) {
    const raw = String(text || '').trim();
    const keys = [];
    const add = (k) => { if (k && keys.indexOf(k) < 0) keys.push(k); };
    add(normLoose(raw.replace(/^(xã|phường|thị trấn|đặc khu|quận|huyện|thị xã|tỉnh|thành phố|tp\.?)\s+/i, '')));
    add(normLoose(raw));
    add(stripUnitPrefix(normLoose(raw)));
    return keys;
  }
  // Tên xã mới dạng trần (bỏ tiền tố) để giữ đúng kiểu viết của người
  // dùng khi họ gõ xã không kèm tiền tố: "Xã Trường Ninh" -> "Trường Ninh".
  function bareWardName(full) {
    return String(full || '').replace(/^(Xã|Phường|Thị trấn|Đặc khu)\s+/i, '');
  }

  // Kiểm tra dấu hiệu cấp trên văn bản gốc (có dấu) trước — chính xác
  // nhất ("Quán Hàu" không phải "quận", "Xa lộ" không phải "xã") — rồi
  // mới thử dạng không dấu. Khớp theo từ trọn vẹn để "son" không trúng
  // "so", "tap" không trúng "ap".
  function hasWardMark(raw) {
    if (/(^|\s)(xã|phường|thị trấn)(\s|$)/i.test(raw)) return true;
    const norm = normLoose(raw).replace(/(^|\s)xa lo(\s|$)/g, ' ');
    return /(^|\s)(xa|phuong|thi tran)(\s|$)/.test(norm);
  }
  function hasDistrictMark(raw) {
    if (/(^|\s)(quận|huyện|thị xã|thành phố|TP\.?)(\s|$)/i.test(raw)) return true;
    const norm = normLoose(raw);
    return /(^|\s)(huyen|thi xa|thanh pho|tp)(\s|$)/.test(norm) || /(^|\s)quan\s+\d+(\s|$)/.test(norm);
  }
  function hasStreetMark(raw) {
    if (/(^|\s)(số|đường|ngõ|hẻm|thôn|ấp|khu phố|tổ)(\s|$)/i.test(raw)) return true;
    const norm = normLoose(raw);
    return /(^|\s)(so|duong|ngo|hem|thon|ap|khu pho|to)(\s|$)/.test(norm);
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
  // Phần địa chỉ có phải phần tỉnh không: khớp mẫu linh hoạt cũ, hoặc
  // khớp đúng sau khi chuẩn hóa (để gõ không dấu "quang binh" vẫn nhận).
  function partMatchesProvince(part, entry) {
    if (namePattern(entry.old).test(part)) return true;
    return stripUnitPrefix(normLoose(part)) === stripUnitPrefix(normLoose(entry.old));
  }
  // Viết hoa chữ cái đầu mỗi từ trong phần địa chỉ người dùng gõ
  // (người dùng hay gõ thường hết: "vạn ninh" → "Vạn Ninh").
  function titleCaseVi(s) {
    return s.split(/\s+/).map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ');
  }

  // Lập chỉ mục dữ liệu xã sau khi tải: tra theo tên (bỏ dấu, bỏ tiền
  // tố), kèm tập huyện theo tỉnh để phân biệt phần huyện viết trần, và
  // bảng các xã cũ cùng nhập vào từng xã mới.
  function buildXaIndex() {
    wardByName = {};
    districtByProvince = {};
    mergedByTarget = {};
    if (!xaData || !Array.isArray(xaData.rows)) return;
    xaData.rows.forEach(r => {
      r._nk = wardKeys(r[1])[0];
      r._dk = wardKeys(r[2])[0];
      r._pk = wardKeys(r[3])[0];
      (wardByName[r._nk] = wardByName[r._nk] || []).push(r);
      if (!districtByProvince[r._pk]) districtByProvince[r._pk] = new Set();
      districtByProvince[r._pk].add(r._dk);
      (r[4] || []).forEach(t => {
        (mergedByTarget[t[0]] = mergedByTarget[t[0]] || []).push({ code: r[0], name: r[1], fraction: t[1] });
      });
    });
  }

  // Tách địa chỉ thành các phần, xác định phần tỉnh / huyện / xã.
  // Phần huyện viết trần (không ghi "huyện/quận/...") được phân biệt bằng
  // dữ liệu: tên đó là tên xã trong tỉnh thì là xã, là tên huyện trong
  // tỉnh thì là huyện; không xác định được thì giữ quy tắc cũ (phần ngay
  // trước tỉnh mà còn phần khác trước nó thì coi là huyện).
  function parseAddress(addr, entry) {
    const parts = addr.split(',').map(p => p.replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim()).filter(Boolean);
    let provIdx = -1;
    parts.forEach((p, i) => { if (partMatchesProvince(p, entry)) provIdx = i; });
    if (provIdx < 0) return { parts, provIdx: -1, districtIdx: -1, wardIdx: -1 };
    const provKey = wardKeys(entry.old)[0];
    let districtIdx = -1;
    if (provIdx >= 1) {
      const prev = parts[provIdx - 1];
      if (hasDistrictMark(prev)) {
        districtIdx = provIdx - 1;
      } else if (!hasWardMark(prev) && !hasStreetMark(prev)) {
        const prevKeys = wardKeys(prev);
        const isWard = prevKeys.some(k => (wardByName[k] || []).some(r => r._pk === provKey));
        const isDistrict = prevKeys.some(k => districtByProvince[provKey] && districtByProvince[provKey].has(k));
        if (isDistrict && !isWard) districtIdx = provIdx - 1; // chắc chắn là huyện
        else if (provIdx >= 2 && (!isWard || isDistrict)) districtIdx = provIdx - 1; // quy tắc cũ
        // (là xã, không phải huyện) -> giữ lại để phần xã xử lý.
      }
    }
    const limit = districtIdx >= 0 ? districtIdx : provIdx;
    let wardIdx = -1;
    for (let i = limit - 1; i >= 0; i--) {
      if (hasWardMark(parts[i])) { wardIdx = i; break; }
    }
    if (wardIdx < 0 && limit >= 1) {
      const cand = parts[limit - 1];
      if (!hasStreetMark(cand)) wardIdx = limit - 1;
    }
    return { parts, provIdx, districtIdx, wardIdx };
  }

  // Đối chiếu tên xã với dữ liệu. Thứ tự: tên + huyện + tỉnh → tên +
  // tỉnh. Nhiều hàng trùng thì trả về ứng viên để người dùng phân biệt,
  // KHÔNG tự chọn bừa.
  function resolveWard(wardText, districtText, entry) {
    if (!xaData) return { status: 'nodata' };
    const provKey = wardKeys(entry.old)[0];
    const keys = wardKeys(wardText);
    let cands = [];
    for (const k of keys) {
      const rows = wardByName[k];
      if (!rows) continue;
      const inProv = rows.filter(r => r._pk === provKey);
      if (inProv.length) { cands = inProv; break; }
    }
    if (!cands.length) return { status: 'notfound' };
    if (districtText) {
      const distKeys = wardKeys(districtText);
      const byDist = cands.filter(r => distKeys.indexOf(r._dk) >= 0);
      if (byDist.length) cands = byDist;
    }
    if (cands.length > 1) return { status: 'ambiguous', candidates: cands };
    const row = cands[0];
    const targets = row[4] || [];
    if (!targets.length) return { status: 'notfound', row };
    if (targets.length > 1) {
      return {
        status: 'split', row,
        targets: targets.map(t => (xaData.wards[t[0]] ? xaData.wards[t[0]].name : null)).filter(Boolean),
      };
    }
    const w = xaData.wards[targets[0][0]];
    if (!w) return { status: 'notfound', row };
    const newName = w.name;
    const same = wardKeys(newName)[0] === row._nk;
    const merged = (mergedByTarget[targets[0][0]] || []).filter(m => m.code !== row[0]);
    return { status: same ? 'unchanged' : 'ok', row, newName, merged };
  }

  // Dựng lại địa chỉ mới từ địa chỉ cũ: thay tên tỉnh, BỎ phần cấp
  // huyện (quận/huyện/thị xã/TP trực thuộc tỉnh đã bãi bỏ từ 1/7/2025),
  // đổi tên xã theo dữ liệu sắp xếp 2025, viết hoa lại các phần còn lại,
  // chuẩn hóa dấu phẩy. Trả về null nếu không tìm thấy tên tỉnh cũ.
  function analyzeAddress(addr, entry) {
    const parsed = parseAddress(addr, entry);
    if (parsed.provIdx < 0) return null;
    const parts = parsed.parts;
    let wardRes = null;
    if (parsed.wardIdx >= 0) {
      const districtText = parsed.districtIdx >= 0 ? parts[parsed.districtIdx] : '';
      wardRes = resolveWard(parts[parsed.wardIdx], districtText, entry);
    }
    const out = [];
    parts.forEach((p, i) => {
      if (i === parsed.provIdx) { out.push(fullName(entry.new, entry.newKind)); return; }
      if (i === parsed.districtIdx) return; // bỏ huyện
      if (i === parsed.wardIdx && wardRes && (wardRes.status === 'ok' || wardRes.status === 'unchanged')) {
        // Giữ đúng kiểu viết của người dùng: gõ trần thì ra trần, gõ kèm
        // tiền tố thì ra đủ tiền tố của đơn vị mới.
        out.push(hasWardMark(p) ? wardRes.newName : bareWardName(wardRes.newName));
        return;
      }
      out.push(titleCaseVi(p));
    });
    return { suggested: out.join(', '), wardRes };
  }

  function renderResult(entry, isLegacy) {
    const oldFull = fullName(entry.old, entry.oldKind);
    const newFull = fullName(entry.new, entry.newKind);
    const addr = $('ddc-diachi').value.trim();
    const analysis = addr ? analyzeAddress(addr, entry) : null;

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
      if (!analysis) {
        addrHtml = '<div class="result-row"><span>Địa chỉ cũ đã nhập</span><span class="muted">Không tìm thấy tên tỉnh cũ trong địa chỉ đã nhập nên chưa gợi ý được cách viết lại — hãy kiểm tra lại chính tả tên tỉnh.</span></div>';
      } else {
        const wardRes = analysis.wardRes;
        if (wardRes) {
          if (wardRes.status === 'ok' || wardRes.status === 'unchanged') {
            if (wardRes.status === 'ok') {
              addrHtml += '<div class="result-row"><span>Xã/phường cũ → mới</span><span><strong>' + esc(wardRes.row[1]) + ' → ' + esc(wardRes.newName) + '</strong></span></div>';
            } else {
              addrHtml += '<div class="result-row"><span>Xã/phường</span><span><strong>' + esc(wardRes.newName) + '</strong> <span class="muted">(giữ nguyên tên sau sắp xếp)</span></span></div>';
            }
            if (wardRes.merged && wardRes.merged.length) {
              const names = wardRes.merged.map(m => m.name + (m.fraction < 1 ? ' (một phần)' : ''));
              const shown = names.slice(0, 8);
              let txt = shown.join(', ');
              if (names.length > 8) txt += ' và ' + (names.length - 8) + ' xã/phường khác';
              addrHtml += '<div class="result-row"><span>Cùng nhập với</span><span class="muted">' + esc(txt) + '</span></div>';
            }
            copyText += '\nXã/phường: ' + wardRes.row[1] + ' → ' + wardRes.newName + '.';
          } else if (wardRes.status === 'split') {
            addrHtml += '<div class="result-row"><span>Xã/phường cũ</span><span><strong>' + esc(wardRes.row[1]) + '</strong> <span class="muted">bị chia cho nhiều xã/phường mới — cần số nhà/đường hoặc hỏi UBND xã để xác định đúng.</span></span></div>';
            if (wardRes.targets && wardRes.targets.length) {
              addrHtml += '<div class="result-row"><span>Các xã/phường mới</span><span>' + esc(wardRes.targets.join(', ')) + '</span></div>';
            }
          } else if (wardRes.status === 'ambiguous') {
            const opts = wardRes.candidates.map(r => r[1] + ' (' + r[2] + ')').join(', ');
            addrHtml += '<div class="result-row"><span>Xã/phường cũ</span><span class="muted">Tên xã này có ở nhiều huyện trong tỉnh — ghi thêm tên huyện cũ vào địa chỉ để tra đúng. Các ứng viên: ' + esc(opts) + '.</span></span></div>';
          } else if (wardRes.status === 'nodata') {
            addrHtml += '<div class="result-row"><span>Xã/phường</span><span class="muted">Chưa tải được dữ liệu xã nên chưa tra được tên xã mới — tên xã giữ nguyên như đã gõ.</span></span></div>';
          } else {
            addrHtml += '<div class="result-row"><span>Xã/phường</span><span class="muted">Không tìm thấy tên xã đã nhập trong dữ liệu — kiểm tra lại chính tả, hoặc tra riêng theo nghị quyết sắp xếp xã của tỉnh.</span></span></div>';
          }
        }
        addrHtml += '<div class="result-row"><span>Địa chỉ mới (gợi ý)</span><span><strong>' + esc(analysis.suggested) + '</strong></span></div>';
        copyText += '\nĐịa chỉ mới (gợi ý): ' + analysis.suggested;
        addrHtml += '<div class="result-row"><span class="muted">Lưu ý khi viết lại</span><span class="muted">Gợi ý đã bỏ phần quận/huyện/thị xã (cấp huyện đã bãi bỏ) và đổi tên xã/phường theo dữ liệu sắp xếp 2025. Phần thôn/ấp/tổ/bản giữ nguyên như đã gõ. Xã cũ bị chia cho nhiều xã mới thì cần số nhà/đường để xác định đúng.</span></div>';
      }
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
    const loadJson = (url) => fetch(url, { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    // Dữ liệu tỉnh bắt buộc; dữ liệu xã tải kèm — lỗi thì vẫn chạy chỉ
    // tới tỉnh (resolveWard trả 'nodata', gợi ý giữ nguyên tên xã).
    Promise.all([
      loadJson(DATA_URL),
      loadJson(XA_URL).catch(() => null),
    ]).then(([json, xaJson]) => {
      if (!json || !Array.isArray(json.provinces) || !json.provinces.length) throw new Error('bad data');
      data = json;
      byOld = {};
      json.provinces.forEach(p => { byOld[p.old] = p; });
      (json.legacy || []).forEach(p => { byOld[p.old] = Object.assign({}, p, { isLegacy: true }); });
      if (xaJson && Array.isArray(xaJson.rows) && xaJson.wards) {
        xaData = xaJson;
        buildXaIndex();
      } else {
        xaData = null;
      }
      buildForm();
    }).catch(() => showError());
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
