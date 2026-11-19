// Tạo văn bản mẫu Lorem Ipsum tiếng Việt — Utility Hub (Văn phòng)
export const meta = {
  id: 'lorem-ipsum-tieng-viet',
  name: 'Tạo văn bản mẫu Lorem Ipsum tiếng Việt',
  category: 'Văn phòng',
  categorySlug: 'van-phong',
  desc: 'Sinh văn bản mẫu tiếng Việt có nghĩa để lấp chỗ trong thiết kế, bản demo và bản nháp.',
  keywords: 'lorem ipsum tiếng Việt, văn bản mẫu, placeholder text, filler text',
  icon: '📝',
  seoTitle: 'Tạo văn bản mẫu Lorem Ipsum tiếng Việt — có nghĩa, dễ đọc',
  seoDesc: 'Sinh văn bản mẫu tiếng Việt theo số đoạn, câu hoặc từ để dùng trong thiết kế, demo và bản nháp.'
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>📝</span><div><h2>Tạo văn bản mẫu Lorem Ipsum tiếng Việt</h2><p class="muted">Văn bản mẫu có nghĩa, dùng để lấp chỗ khi thiết kế hoặc làm bản demo.</p></div></div>
  <div class="grid-3">
    <div class="field"><label for="li-paras">Số đoạn</label><input id="li-paras" type="number" min="1" max="20" step="1" value="3"></div>
    <div class="field"><label for="li-sentences">Số câu mỗi đoạn</label><input id="li-sentences" type="number" min="1" max="10" step="1" value="4"></div>
    <div class="field"><label for="li-words">Hoặc giới hạn tổng số từ (để trống = không giới hạn)</label><input id="li-words" type="number" min="1" step="1" placeholder="Ví dụ: 100"></div>
  </div>
  <p><button class="btn btn-primary" id="li-gen">Tạo văn bản mẫu</button>
  <button class="btn btn-ghost" id="li-shuffle">🔀 Xáo trộn câu</button></p>
  <div class="field" id="li-out-wrap" hidden><label for="li-output">Văn bản mẫu</label><textarea id="li-output" rows="10" readonly></textarea>
  <p><button class="btn copy-btn" id="li-copy">📋 Chép văn bản</button> <span class="chip" id="li-count"></span></p></div>
  <p class="note">Chỉ dùng làm văn bản mẫu lấp chỗ — không phải nội dung thật để đăng tải.</p>
</div>`;
}

export function init(root) {
  const UH = window.UH || {};
  const fmtNum = UH.fmtNum || (n => Number(n).toLocaleString('vi-VN'));
  const parseNum = UH.parseNum || (s => { const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')); return isNaN(v) ? 0 : v; });
  const toast = UH.toast || (m => alert(m));
  const copyText = UH.copyText || (t => { if (navigator.clipboard) navigator.clipboard.writeText(t); });
  const $ = id => root.querySelector('#' + id);
  const parasEl = $('li-paras'), sentEl = $('li-sentences'), wordsEl = $('li-words'),
    outWrap = $('li-out-wrap'), outEl = $('li-output'), countEl = $('li-count');
  const SENTENCES = [
    'Buổi sáng bắt đầu bằng ánh nắng nhẹ xuyên qua khung cửa sổ.',
    'Mọi người trong văn phòng chào nhau rồi bắt tay vào công việc.',
    'Con đường nhỏ dẫn ra bờ sông vẫn yên bình như mọi ngày.',
    'Tiếng chim hót vang lên từ những tán cây xanh ngoài vườn.',
    'Chiếc bàn gỗ cũ đã theo gia đình qua nhiều thế hệ.',
    'Mưa rào bất chợt khiến phố xá trở nên mát mẻ lạ thường.',
    'Người bán hàng rong đẩy xe qua từng con ngõ nhỏ.',
    'Cuốn sách trên kệ đã phủ một lớp bụi mỏng theo năm tháng.',
    'Đứa trẻ chạy tung tăng trên cánh đồng lúa vừa gặt xong.',
    'Hương cà phê thơm lừng lan tỏa khắp căn phòng nhỏ.',
    'Chuyến xe buýt buổi chiều đưa mọi người trở về nhà.',
    'Ngọn đèn đường bật sáng khi hoàng hôn vừa buông xuống.',
    'Bà cụ ngồi bên hiên nhà, kể chuyện ngày xưa cho cháu nghe.',
    'Dòng sông quê hương hiền hòa chảy qua bao mùa lúa chín.',
    'Tiếng chuông chùa ngân vang trong không gian tĩnh lặng.',
    'Anh kỹ sư trẻ miệt mài làm việc bên bản vẽ thiết kế.',
    'Khu chợ sáng nhộn nhịp người mua kẻ bán từ tờ mờ sáng.',
    'Cơn gió nhẹ thổi qua làm rung rinh những chùm hoa giấy.',
    'Chiếc thuyền nhỏ lững lờ trôi trên mặt hồ phẳng lặng.',
    'Mùa thu về mang theo hương cốm mới thơm ngát khắp phố.',
    'Người thợ mộc tỉ mỉ chạm khắc từng đường nét trên gỗ.',
    'Đêm khuya, thành phố vẫn sáng đèn ở những tòa nhà cao tầng.',
    'Cô giáo trẻ kiên nhẫn giảng bài cho học trò lớp một.',
    'Vườn rau sau nhà xanh mướt nhờ bàn tay chăm sóc mỗi ngày.',
    'Tiếng sóng biển vỗ rì rào vào bờ cát trắng mịn.',
    'Ông lão câu cá ngồi lặng lẽ bên bờ hồ từ sáng sớm.',
    'Chuyến tàu đêm rời ga, đưa hành khách về miền quê xa.',
    'Mùi bánh mì nóng hổi thơm phức từ lò bánh đầu ngõ.',
    'Những đám mây trắng trôi lững lờ trên bầu trời xanh thẳm.',
    'Cây đa đầu làng đã đứng đó chứng kiến bao đổi thay.'
  ];

  let pool = SENTENCES.slice();
  let offset = 0;

  function generate() {
    const paras = Math.min(20, Math.max(1, Math.floor(parseNum(parasEl.value) || 3)));
    const perPara = Math.min(10, Math.max(1, Math.floor(parseNum(sentEl.value) || 4)));
    const wordLimit = wordsEl.value.trim() ? Math.max(1, Math.floor(parseNum(wordsEl.value))) : 0;
    const parts = [];
    let totalWords = 0;
    for (let p = 0; p < paras; p++) {
      const sents = [];
      for (let s = 0; s < perPara; s++) {
        const sentence = pool[offset % pool.length];
        offset++;
        const w = sentence.split(' ').length;
        if (wordLimit && totalWords + w > wordLimit && (sents.length || parts.length)) break;
        sents.push(sentence);
        totalWords += w;
        if (wordLimit && totalWords >= wordLimit) break;
      }
      if (sents.length) parts.push(sents.join(' '));
      if (wordLimit && totalWords >= wordLimit) break;
    }
    outEl.value = parts.join('\n\n');
    outWrap.hidden = false;
    countEl.textContent = fmtNum(parts.length) + ' đoạn — ' + fmtNum(totalWords) + ' từ';
  }
  $('li-gen').addEventListener('click', generate);
  $('li-shuffle').addEventListener('click', () => {
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    offset = 0;
    generate();
  });
  $('li-copy').addEventListener('click', () => { copyText(outEl.value); toast('Đã chép văn bản mẫu.'); });
  generate();
}
