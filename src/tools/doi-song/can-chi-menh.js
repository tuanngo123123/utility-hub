// Tra can chi & mệnh — năm sinh → can chi, mệnh ngũ hành (60 hoa giáp), con giáp, hợp/kỵ.
export const meta = {
  id: 'can-chi-menh',
  name: 'Tra can chi & mệnh',
  category: 'Đời sống',
  categorySlug: 'doi-song',
  desc: 'Nhập năm sinh dương lịch để tra can chi, mệnh ngũ hành theo bảng lục thập hoa giáp, con giáp và tuổi hợp/kỵ.',
  keywords: 'tra can chi, mệnh ngũ hành, lục thập hoa giáp, tuổi hợp kỵ, tam hợp tứ hành xung',
  icon: '🔮',
  seoTitle: 'Tra can chi & mệnh — Năm sinh mệnh gì, tuổi gì',
  seoDesc: 'Tra can chi và mệnh ngũ hành theo bảng 60 hoa giáp: nhập năm sinh là biết can chi, mệnh, con giáp, tuổi tam hợp và tứ hành xung.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head"><span>🔮</span><div><h2>Tra can chi & mệnh</h2><p class="muted">Nhập năm sinh dương lịch để tra can chi, mệnh ngũ hành và tuổi hợp/kỵ.</p></div></div>
  <div class="field"><label for="ccm-year">Năm sinh (dương lịch)</label><input id="ccm-year" type="number" min="1900" max="2100" value="1997" placeholder="Ví dụ: 1997"></div>
  <button type="button" class="btn btn-primary" id="ccm-calc">Tra cứu</button>
  <div id="ccm-out"></div>
  <p class="note">Can chi tính theo công thức: can = (năm + 6) % 10, chi = (năm + 8) % 12. Mệnh theo bảng lục thập hoa giáp chuẩn. Kết quả mang tính tham khảo văn hóa dân gian.</p>
</div>`;
}

export function init(root) {
  const $ = id => root.querySelector('#' + id);
  const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Heo'];
  // Bảng lục thập hoa giáp: chỉ số 0 = Giáp Tý (năm 1984). Mỗi cặp [tên mệnh, hành].
  // Kiểm tra: 1997 → chỉ số 13 → Đinh Sửu, Giản Hạ Thủy; 2026 → chỉ số 42 → Bính Ngọ, Thiên Hà Thủy.
  const MENH = [
    ['Hải Trung Kim', 'Kim'],   // 0  Giáp Tý
    ['Hải Trung Kim', 'Kim'],   // 1  Ất Sửu
    ['Lư Trung Hỏa', 'Hỏa'],    // 2  Bính Dần
    ['Lư Trung Hỏa', 'Hỏa'],    // 3  Đinh Mão
    ['Đại Lâm Mộc', 'Mộc'],     // 4  Mậu Thìn
    ['Đại Lâm Mộc', 'Mộc'],     // 5  Kỷ Tỵ
    ['Lộ Bàng Thổ', 'Thổ'],     // 6  Canh Ngọ
    ['Lộ Bàng Thổ', 'Thổ'],     // 7  Tân Mùi
    ['Kiếm Phong Kim', 'Kim'],  // 8  Nhâm Thân
    ['Kiếm Phong Kim', 'Kim'],  // 9  Quý Dậu
    ['Sơn Đầu Hỏa', 'Hỏa'],     // 10 Giáp Tuất
    ['Sơn Đầu Hỏa', 'Hỏa'],     // 11 Ất Hợi
    ['Giản Hạ Thủy', 'Thủy'],   // 12 Bính Tý
    ['Giản Hạ Thủy', 'Thủy'],   // 13 Đinh Sửu
    ['Thành Đầu Thổ', 'Thổ'],   // 14 Mậu Dần
    ['Thành Đầu Thổ', 'Thổ'],   // 15 Kỷ Mão
    ['Bạch Lạp Kim', 'Kim'],    // 16 Canh Thìn
    ['Bạch Lạp Kim', 'Kim'],    // 17 Tân Tỵ
    ['Dương Liễu Mộc', 'Mộc'],  // 18 Nhâm Ngọ
    ['Dương Liễu Mộc', 'Mộc'],  // 19 Quý Mùi
    ['Tuyền Trung Thủy', 'Thủy'], // 20 Giáp Thân
    ['Tuyền Trung Thủy', 'Thủy'], // 21 Ất Dậu
    ['Ốc Thượng Thổ', 'Thổ'],   // 22 Bính Tuất
    ['Ốc Thượng Thổ', 'Thổ'],   // 23 Đinh Hợi
    ['Tích Lịch Hỏa', 'Hỏa'],   // 24 Mậu Tý
    ['Tích Lịch Hỏa', 'Hỏa'],   // 25 Kỷ Sửu
    ['Tùng Bách Mộc', 'Mộc'],   // 26 Canh Dần
    ['Tùng Bách Mộc', 'Mộc'],   // 27 Tân Mão
    ['Trường Lưu Thủy', 'Thủy'], // 28 Nhâm Thìn
    ['Trường Lưu Thủy', 'Thủy'], // 29 Quý Tỵ
    ['Sa Trung Kim', 'Kim'],    // 30 Giáp Ngọ
    ['Sa Trung Kim', 'Kim'],    // 31 Ất Mùi
    ['Sơn Hạ Hỏa', 'Hỏa'],      // 32 Bính Thân
    ['Sơn Hạ Hỏa', 'Hỏa'],      // 33 Đinh Dậu
    ['Bình Địa Mộc', 'Mộc'],    // 34 Mậu Tuất
    ['Bình Địa Mộc', 'Mộc'],    // 35 Kỷ Hợi
    ['Bích Thượng Thổ', 'Thổ'], // 36 Canh Tý
    ['Bích Thượng Thổ', 'Thổ'], // 37 Tân Sửu
    ['Kim Bạch Kim', 'Kim'],    // 38 Nhâm Dần
    ['Kim Bạch Kim', 'Kim'],    // 39 Quý Mão
    ['Phúc Đăng Hỏa', 'Hỏa'],   // 40 Giáp Thìn
    ['Phúc Đăng Hỏa', 'Hỏa'],   // 41 Ất Tỵ
    ['Thiên Hà Thủy', 'Thủy'],  // 42 Bính Ngọ
    ['Thiên Hà Thủy', 'Thủy'],  // 43 Đinh Mùi
    ['Đại Trạch Thổ', 'Thổ'],   // 44 Mậu Thân
    ['Đại Trạch Thổ', 'Thổ'],   // 45 Kỷ Dậu
    ['Thoa Xuyến Kim', 'Kim'],  // 46 Canh Tuất
    ['Thoa Xuyến Kim', 'Kim'],  // 47 Tân Hợi
    ['Tang Đố Mộc', 'Mộc'],     // 48 Nhâm Tý
    ['Tang Đố Mộc', 'Mộc'],     // 49 Quý Sửu
    ['Đại Khê Thủy', 'Thủy'],   // 50 Giáp Dần
    ['Đại Khê Thủy', 'Thủy'],   // 51 Ất Mão
    ['Sa Trung Thổ', 'Thổ'],    // 52 Bính Thìn
    ['Sa Trung Thổ', 'Thổ'],    // 53 Đinh Tỵ
    ['Thiên Thượng Hỏa', 'Hỏa'], // 54 Mậu Ngọ
    ['Thiên Thượng Hỏa', 'Hỏa'], // 55 Kỷ Mùi
    ['Thạch Lựu Mộc', 'Mộc'],   // 56 Canh Thân
    ['Thạch Lựu Mộc', 'Mộc'],   // 57 Tân Dậu
    ['Đại Hải Thủy', 'Thủy'],   // 58 Nhâm Tuất
    ['Đại Hải Thủy', 'Thủy'],   // 59 Quý Hợi
  ];
  const TAM_HOP = {
    Tý: 'Thân – Thìn', Sửu: 'Tỵ – Dậu', Dần: 'Ngọ – Tuất', Mão: 'Mùi – Hợi',
    Thìn: 'Tý – Thân', Tỵ: 'Sửu – Dậu', Ngọ: 'Dần – Tuất', Mùi: 'Mão – Hợi',
    Thân: 'Tý – Thìn', Dậu: 'Sửu – Tỵ', Tuất: 'Dần – Ngọ', Hợi: 'Mão – Mùi',
  };
  const TU_XUNG = {
    Tý: 'Ngọ – Mão – Dậu', Sửu: 'Mùi – Thìn – Tuất', Dần: 'Thân – Tỵ – Hợi', Mão: 'Dậu – Tý – Ngọ',
    Thìn: 'Tuất – Sửu – Mùi', Tỵ: 'Hợi – Dần – Thân', Ngọ: 'Tý – Mão – Dậu', Mùi: 'Sửu – Thìn – Tuất',
    Thân: 'Dần – Tỵ – Hợi', Dậu: 'Mão – Tý – Ngọ', Tuất: 'Thìn – Sửu – Mùi', Hợi: 'Tỵ – Dần – Thân',
  };

  $('ccm-calc').addEventListener('click', () => {
    const year = parseInt($('ccm-year').value, 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      $('ccm-out').innerHTML = '<p class="error">Vui lòng nhập năm sinh từ 1900 đến 2100.</p>';
      return;
    }
    const canIdx = (((year + 6) % 10) + 10) % 10;
    const chiIdx = (((year + 8) % 12) + 12) % 12;
    const canChi = CAN[canIdx] + ' ' + CHI[chiIdx];
    // Giáp Tý = 1984 → chỉ số trong vòng 60 năm.
    const idx = (((year - 1984) % 60) + 60) % 60;
    const menh = MENH[idx];
    const chi = CHI[chiIdx];
    $('ccm-out').innerHTML = `<div class="result">
      <div class="result-row"><span>Can chi năm ${year}</span><strong>${canChi}</strong></div>
      <div class="result-row"><span>Mệnh ngũ hành</span><strong>${menh[0]} (mệnh ${menh[1]})</strong></div>
      <div class="result-row"><span>Con giáp</span><strong>Tuổi ${chi} (${CON_GIAP[chiIdx]})</strong></div>
      <div class="result-row"><span>Tam hợp (hợp)</span><strong>${chi} hợp với ${TAM_HOP[chi]}</strong></div>
      <div class="result-row"><span>Tứ hành xung (kỵ)</span><strong>${chi} xung với ${TU_XUNG[chi]}</strong></div>
    </div>`;
  });
}
