# Nguồn dữ liệu xã cũ → xã mới

- **File:** `xa-cu-moi.json` — bảng đối chiếu 10.035 đơn vị hành chính cấp xã cũ (xã/phường/thị trấn trước 1/7/2025) sang 3.321 xã/phường/đặc khu mới sau đợt sắp xếp 2025.
- **Nguồn:** Atlas34 — https://github.com/gooduselabs/atlas34 — bản v5.2.0, dữ liệu gốc từ vietnamadminunits 1.0.4, file tạo ngày 20/9/2026.
- **Ngày lấy về:** 18/11/2026.
- **Giấy phép:** MIT (xem LICENSE trong repo Atlas34).
- **Cấu trúc:** `{rows: [[mã xã cũ, tên xã cũ, huyện cũ, tỉnh cũ, [[mã xã mới, tỉ lệ], ...]], ...], wards: {mã xã mới: {name, p}}}`. Một xã cũ có thể có nhiều đích (bị chia tách) hoặc tỉ lệ < 1 (chỉ một phần diện tích/dân số nhập vào xã mới đó).
- **Lưu ý:** KHÔNG dùng file provinces.json của Atlas34 (file đó có lỗi: ghi Quảng Ninh/Đồng Nai là thành phố). Bảng tỉnh dùng file `dia-chi-cu-moi.json` riêng của web.
