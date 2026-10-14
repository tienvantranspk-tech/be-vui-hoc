# Bé Vui Học – Lớp 2

App "vừa học vừa chơi" cho bé lớp 2, bám theo bộ sách **Kết nối tri thức với cuộc sống**:
Toán 2, Tiếng Việt 2 và Tiếng Anh 2 (Global Success). Thiết kế cho máy tính bảng Android (chạm tay), dùng được cả khi xoay ngang lẫn xoay dọc.
Cài được lên màn hình chính như một app thật và chơi được cả khi không có mạng.

## Cách mở app

**Trên máy tính:** nháy đúp vào file `index.html` để mở bằng Chrome hoặc Edge. Lần đầu cần có mạng để tải phông chữ.

**Trên máy tính bảng – thử nhanh qua Wi-Fi (chưa cài được như app):**
1. Trên máy tính, mở PowerShell trong thư mục này rồi chạy: `py -m http.server 5500`
   (nếu Windows hỏi quyền tường lửa thì chọn cho phép ở mạng riêng – *Private*).
2. Chạy `ipconfig` để xem địa chỉ IPv4 của máy tính, ví dụ `192.168.1.5`.
3. Trên máy tính bảng, mở Chrome và vào `http://192.168.1.5:5500`.

**Trên máy tính bảng – cài như app thật:** xem mục [Đưa app lên máy tính bảng](#đưa-app-lên-máy-tính-bảng) bên dưới.

Dữ liệu của bé (sao, xu, thú cưng, sticker, thống kê) được lưu ngay trong trình duyệt của máy đang dùng.
Muốn chuyển sang máy khác thì dùng **Sao lưu dữ liệu** trong Góc phụ huynh.

## Lộ trình

- [x] **Bước 1 – Khung app:** làm quen (tên bé, chọn thú cưng), trang chủ, bản đồ phiêu lưu, màn chơi với 4 dạng câu hỏi
      (chọn đáp án, nhập số, sắp xếp, nối cặp), sao – xu – sticker – huy hiệu, phòng thú cưng, album, góc phụ huynh.
      Toán **Chủ đề 1 và 2** (Bài 1–14) đã chơi được.
- [x] **Bước 2 – Toán học kì 1:** Chủ đề 3–7 (Bài 15–36) – cân đĩa và ki-lô-gam, lít, cộng trừ có nhớ (đặt tính, tính nhẩm),
      điểm – đoạn thẳng – đường gấp khúc – hình tứ giác, đo bằng thước, xem đồng hồ, xem lịch, ôn tập học kì 1.
- [x] **Toán học kì 2:** Chủ đề 8–14 (Bài 37–75) – phép nhân, phép chia, bảng nhân/chia 2 và 5, khối trụ – khối cầu,
      số đến 1000, dm – m – km, tiền Việt Nam, cộng trừ trong phạm vi 1000, biểu đồ tranh, chắc chắn – có thể – không thể.
      → Toán đủ cả năm: 75/75 bài.
- [x] **Bước 3 – Tiếng Việt cả năm:** 35 chặng (mỗi chặng = 1 tuần = 2 bài trong sách, kèm 4 bài ôn tập): bảng chữ cái,
      chính tả theo đúng cặp âm/vần từng bài, từ chỉ sự vật – hoạt động – đặc điểm, kiểu câu, dấu câu, viết hoa tên riêng,
      mở rộng vốn từ theo chủ điểm, đọc hiểu bài ngắn (bài đọc do app tự soạn, không chép sách).
- [x] **Bước 4 – Tiếng Anh cả năm:** 40 chặng cho 16 Unit, 4 Fun time, 4 Review. Mỗi Unit có 2 chặng:
      *Từ mới* (nghe và chọn hình, nhìn hình chọn từ, nghĩa của từ, chữ còn thiếu, âm đầu, xếp chữ thành từ, nối từ với hình)
      và *Mẫu câu* (câu đúng với hình, điền từ, nghe câu chọn hình, sắp xếp câu, hỏi – đáp theo hình như
      “Is she flying a kite? – Yes, she is.”). Từ và câu tiếng Anh được máy đọc bằng giọng Anh (nút 🔊, nút 🐢 để nghe chậm).
- [x] **Bước 5 – Góc phụ huynh nâng cao:** giới hạn thời gian học mỗi ngày (hết giờ hiện màn hình nghỉ ngơi, bố mẹ cho thêm giờ được),
      ôn lại câu sai (nút “🔁 Ôn lại câu sai” ở trang chủ), sao lưu / khôi phục dữ liệu ra tệp.
- [x] **Bước 6 – Đưa lên máy tính bảng:** cài như app thật (PWA) – có biểu tượng riêng, mở toàn màn hình, chơi được khi không có mạng.
- [x] **Nâng cao:** nút chọn mức độ **Cơ bản / Nâng cao** trong Góc phụ huynh, và chặng **🧠 Thử thách tư duy** ở cuối mỗi chủ đề
      (27 chặng: Toán 14, Tiếng Việt 9, Tiếng Anh 4) – xem mục [Mức độ câu hỏi](#mức-độ-câu-hỏi).

## Mức độ câu hỏi

- **Cơ bản (mặc định):** đúng mức sách giáo khoa – chủ yếu nhận biết, hiểu và vận dụng trực tiếp (mức 1–2 theo cách đánh giá của Bộ).
- **🔥 Nâng cao** (bật trong Góc phụ huynh → 🎚️ Mức độ câu hỏi): mỗi chặng thay khoảng 4/10 câu bằng câu khó hơn sách, có nhãn 🔥.
  - Toán: tìm số chưa biết, bài toán hai bước, bài toán ngược, điền dấu + −, so sánh hai biểu thức, tính nhanh, dãy số quy luật,
    lập số từ thẻ chữ số, câu đố "hình thay số", đếm hình tam giác – tứ giác, giờ và lịch, bài toán về tuổi, chắc chắn – có thể – không thể…
  - Tiếng Việt: tìm từ khác loại, từ trái nghĩa – cùng nghĩa, hoàn thành tục ngữ, bộ phận câu trả lời câu hỏi Ai? Làm gì? Thế nào? Ở đâu? Khi nào?,
    tìm từ viết sai chính tả, sắp xếp câu thành đoạn văn, giải câu đố, từ tả âm thanh.
  - Tiếng Anh: tìm từ khác loại, chọn từ viết đúng, ngữ pháp (is/are, a/an, can/do…), nghe câu chọn câu đúng (không có hình),
    đọc câu chọn hình, hỏi – đáp của nhiều Unit, làm tính bằng tiếng Anh.
- **🧠 Thử thách tư duy:** chặng cuối mỗi chủ đề, toàn câu nâng cao. Không bắt buộc (không chặn chặng sau), xu thưởng gấp đôi,
  có huy hiệu “Nhà thám hiểm trí tuệ” và “Cú mèo thông thái”.

## Đưa app lên máy tính bảng

Để cài được như app thật, app cần nằm trên một địa chỉ **https** trên mạng. Cách miễn phí và lâu dài là **GitHub Pages**.

### Cách 1 – GitHub Pages (khuyên dùng)
1. Tạo tài khoản GitHub miễn phí ở https://github.com (nếu chưa có).
2. Tạo kho mới (*New repository*), đặt tên ví dụ `be-vui-hoc`, chọn **Public**.
3. Bấm *uploading an existing file*, kéo thả các thư mục `css`, `js`, `icons` và các tệp `index.html`,
   `manifest.webmanifest`, `sw.js` (tệp `.nojekyll`, `README.md`, thư mục `tai-lieu` có thể thêm hoặc không;
   **không** cần thư mục `.claude`), rồi bấm *Commit changes*.
4. Vào *Settings → Pages*, mục *Branch* chọn `main` và thư mục `/ (root)`, bấm *Save*.
5. Đợi 1–2 phút, app sẽ có địa chỉ dạng `https://<tên-tài-khoản>.github.io/be-vui-hoc/`.

(Nếu máy tính đã cài Git và GitHub CLI thì có thể làm nhanh bằng lệnh `gh repo create be-vui-hoc --public --source . --push`,
rồi bật Pages như bước 4.)

### Cách 2 – Netlify Drop
Vào https://app.netlify.com/drop, đăng nhập rồi kéo thả cả thư mục này vào trang. Netlify cho ngay một địa chỉ https.

### Cài lên máy tính bảng Android
1. Trên máy tính bảng, mở **Chrome** và vào địa chỉ của app.
2. Bấm **⋮** (góc trên bên phải) → **Thêm vào màn hình chính** (hoặc **Cài đặt ứng dụng**) → **Cài đặt**.
   Cũng có thể vào **Góc phụ huynh → Cài đặt → 📲 Cài như app** và bấm **Cài đặt**.
3. Biểu tượng ngôi sao **Bé Vui Học** xuất hiện ở màn hình chính. Mở lần đầu khi có mạng; sau đó chơi được cả khi không có mạng.

### Khi sửa hoặc thêm nội dung
1. Sửa tệp trong thư mục này, rồi mở `sw.js` và **tăng số phiên bản** ở dòng `const VERSION = 'bvh-…'`
   (ví dụ `bvh-2026-10-14-1` → `bvh-2026-10-14-2`). Nếu thêm tệp `.js` mới vào `index.html` thì thêm cả vào danh sách trong `sw.js`.
2. Tải các tệp đã sửa lên lại GitHub (hoặc Netlify).
3. Trên máy tính bảng: mở app một lần khi có mạng để app tự tải bản mới. Bản mới được dùng từ lần mở tiếp theo.

Dữ liệu của bé không mất khi cập nhật app. Nên **sao lưu** định kỳ (Góc phụ huynh → 💾 Sao lưu dữ liệu) và cất tệp vào Zalo hoặc Google Drive.

## Góc phụ huynh

Vào bằng nút **Phụ huynh** ở thanh dưới cùng, trả lời một phép nhân để mở khóa.
- **Theo dõi:** thời gian học hôm nay và 7 ngày qua, tiến độ từng môn, kỹ năng bé cần luyện thêm, các câu bé làm sai gần đây.
- **🎚️ Mức độ câu hỏi:** Cơ bản (theo SGK) hoặc Nâng cao (thêm câu khó hơn vào mỗi chặng).
- **⏰ Giới hạn thời gian:** chọn 15 / 20 / 30 / 45 / 60 phút mỗi ngày. Hết giờ, app hiện màn hình nghỉ ngơi
  (chặng đang chơi dở vẫn được làm nốt). Bấm **Cho thêm 15 phút hôm nay** nếu muốn bé học thêm.
- **🔁 Ôn lại câu sai:** các câu bé làm sai được lưu lại; ở trang chủ có nút “Ôn lại câu sai” để bé làm lại.
  Làm đúng thì câu đó được xóa khỏi danh sách, bé được thưởng xu.
- **💾 Sao lưu dữ liệu:** tạo tệp `.json` (tải về máy hoặc gửi qua Zalo / Google Drive), và **khôi phục** từ tệp khi đổi máy.
- **Cài đặt:** âm thanh, giọng đọc, tự đọc đề bài, mở khóa tất cả các chặng, cài như app, đổi tên, xóa dữ liệu.

Mẹo cho bố mẹ: bật "Mở khóa tất cả các chặng" để bé chơi ngay bài đang học trên lớp.

## Cấu trúc thư mục

```
index.html              Trang chính
manifest.webmanifest    Thông tin để cài như app (tên, biểu tượng, màu)
sw.js                   Bộ nhớ đệm để chơi khi không có mạng (nhớ tăng VERSION khi sửa app)
icons/                  Biểu tượng app
css/style.css           Giao diện (màu sắc, bố cục, hiệu ứng)
js/core/                Lõi: lưu dữ liệu, âm thanh, giọng đọc, chuyển màn hình, phần thưởng
js/data/                Thú cưng, đồ ăn, phụ kiện, sticker, huy hiệu
js/games/               Bộ máy chơi: các dạng câu hỏi và hình minh họa
js/subjects/            Nội dung từng môn (Toán, Tiếng Việt, Tiếng Anh)
js/screens/             Các màn hình (trang chủ, bản đồ, chơi, kết quả, thú cưng, album, phụ huynh, nghỉ ngơi)
tai-lieu/               Bản đồ chương trình lớp 2 (mục lục 3 môn, từ vựng tiếng Anh, tiến độ theo tuần)
```

## Muốn chỉnh nội dung Toán?

- `js/subjects/toan.js`: danh sách chủ đề, bài, và mỗi bài gồm những dạng câu nào, bao nhiêu câu.
- `js/subjects/toan-gen.js` (Chủ đề 1–2) và `js/subjects/toan-gen2.js` (Chủ đề 3–7): cách tạo từng dạng câu hỏi.
  Mỗi lần chơi, câu hỏi được tạo ngẫu nhiên nên bé luyện bao nhiêu lần cũng có bài mới.
- `js/subjects/toan-gen3.js` (Chủ đề 8–14): câu hỏi học kì 2.
- `js/subjects/toan-nangcao.js`: câu hỏi nâng cao và chặng Thử thách của từng chủ đề
  (tương tự: `tiengviet-nangcao.js`, `tienganh-nangcao.js`).
- `js/games/visuals.js`: các hình minh họa (khung 10 ô, tia số, cân đĩa, can nước, đồng hồ, tờ lịch, thước kẻ, hình học,
  khối trăm, tờ tiền, biểu đồ tranh…).

## Muốn chỉnh nội dung Tiếng Việt?

- `js/subjects/tiengviet.js`: danh sách chủ điểm, chặng (theo tuần) và các dạng câu của từng chặng.
- `js/subjects/tiengviet-data.js`: kho từ chính tả, từ ngữ theo chủ đề, câu mẫu và các bài đọc ngắn — thêm từ mới vào đây là app tự dùng.

## Muốn chỉnh nội dung Tiếng Anh?

- `js/subjects/tienganh-data.js`: từ vựng của 16 Unit (nghĩa tiếng Việt, hình emoji hoặc hình vẽ, chữ/âm trọng tâm),
  các mẫu câu (`tpl`) và các cặp hỏi – đáp để ôn. Thêm một từ: thêm một dòng vào `words` và tên từ vào `units` của Unit đó.
- `js/subjects/tienganh-gen.js`: cách tạo từng dạng câu hỏi tiếng Anh.
- `js/subjects/tienganh.js`: danh sách chặng (2 chặng mỗi Unit, Fun time, Review) và số câu mỗi dạng.
- Giọng đọc tiếng Anh dùng giọng có sẵn trên máy. Trên máy tính bảng Android, nếu giọng đọc nghe chưa rõ thì vào
  *Cài đặt → Hệ thống → Ngôn ngữ → Đầu ra chuyển văn bản thành lời nói* và tải giọng *English (United States)* của Google.
