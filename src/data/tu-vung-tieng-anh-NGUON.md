# Nguồn dữ liệu từ vựng tiếng Anh

- **File:** `tu-vung-tieng-anh.json` — 400 từ tiếng Anh thông dụng nhất, xếp theo tần suất dùng (từ hay gặp trước). Mỗi từ có loại từ, nghĩa tiếng Việt, ví dụ tiếng Anh kèm dịch tiếng Việt.
- **Nghĩa tiếng Việt:** từ điển Anh–Việt `TudienAnhVietBeta.tab` trong repo catusf/tudien — https://github.com/catusf/tudien (file `dict/TudienAnhVietBeta.tab`, ~106.000 mục từ). Repo gốc catusphan/dictionary cấp phép MIT; bản catusf/tudien cấp phép CC0-1.0.
- **Danh sách từ (chọn từ nào đưa vào):** các bộ từ của Qwerty Learner — https://github.com/RealKai42/qwerty-learner (GPL-3.0), thư mục `public/dicts/`: `coca20000.json` (thứ tự tần suất COCA), `Oxford3000.json`, `IELTS_3_T.json`, `TOEFL_3_T.json`, `Top1000VerbWords.json`, `Top1500NounWords.json`, `Top500AdjectiveWords.json`, `Top250AdverbWords.json`, `Top50Prepositions.json`, `Top60Pronouns.json`. Chỉ dùng TÊN từ tiếng Anh (dữ liệu trung tính theo ngôn ngữ); bản dịch tiếng Trung trong các file đó KHÔNG dùng.
- **Ngày lấy về:** 18/11/2026.
- **Biên soạn:** Muse rà soát tay toàn bộ 400 từ ngày 18/11/2026 — chọn nghĩa phổ biến nhất cho người học (từ điển thường liệt kê nghĩa hiếm trước), sửa nghĩa sai/lỗi chính tả trong từ điển gốc, viết tay ví dụ khi từ điển không có ví dụ dùng được. Tổng ~270 chỗ sửa + ~150 ví dụ viết tay.
- **Cấu trúc:** `[{w: "apple", pos: "danh từ", vi: "quả táo", ex: "I eat an apple.", exvi: "Tôi ăn một quả táo."}]`. Trường `exvi` là bản dịch tiếng Việt của ví dụ, hiển thị kèm ví dụ trong công cụ.
- **Lưu ý:** từ điển gốc có lỗi nhãn loại từ ở một số từ chức năng (giới từ/đại từ bị ghi là "danh từ") và lỗi chính tả rải rác trong ví dụ — đã sửa tay trong quá trình rà soát, không sửa file từ điển gốc.
