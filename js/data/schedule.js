/* Tiến độ ở trường theo tuần – năm học 2026–2027 (theo phân phối chương trình, xem tai-lieu/chuong-trinh-lop-2.md).
   Mỗi mảng có 35 phần tử: phần tử thứ n−1 là chặng mà lớp đã học XONG vào cuối tuần n
   (bài kéo dài sang tuần sau thì tính vào tuần sau). Lịch từng trường có thể lệch – bố mẹ chỉnh được trong Góc phụ huynh. */
(function (App) {
  'use strict';
  const toan = [2, 4, 6, 7, 9, 10, 12, 14, 16, 19, 20, 22, 23, 25, 28, 31, 33, 35,
    38, 40, 43, 44, 46, 49, 51, 53, 56, 58, 60, 61, 64, 68, 69, 71, 75].map((n) => 'b' + n);
  // Tiếng Việt: mỗi tuần học một bài lẻ và một bài chẵn → cuối tuần đã xong đến bài chẵn
  const tv = ['b2', 'b4', 'b6', 'b8', 'b10', 'b12', 'b14', 'b16', 'on1', 'b18', 'b20', 'b22', 'b24', 'b26', 'b28', 'b30', 'b32', 'on2',
    'c2', 'c4', 'c6', 'c8', 'c10', 'c12', 'c14', 'c16', 'on3', 'c18', 'c20', 'c22', 'c24', 'c26', 'c28', 'c30', 'on4'];
  const ta = ['u1a', 'u1b', 'u2b', 'f1', 'u3a', 'u3b', 'u4b', 'u4b', 'r1', 'u5b', 'u6a', 'u6b', 'f2', 'u7b', 'u8a', 'u8b', 'r2', 'r2',
    'u9a', 'u9b', 'u10b', 'f3', 'u11a', 'u11b', 'u12b', 'u12b', 'r3', 'u13b', 'u14a', 'u14b', 'f4', 'u15b', 'u16a', 'u16b', 'r4'];
  // start: thứ Hai của tuần học thứ nhất · tetAfter: sau ngày này lùi 1 tuần (nghỉ Tết, ước tính)
  App.Data.schedule = { start: '2026-09-07', tetAfter: '2027-02-15', weeks: 35, toan, tv, ta };
})(window.App);
