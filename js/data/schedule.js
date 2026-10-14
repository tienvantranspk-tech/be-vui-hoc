/* Tiến độ ở trường theo tuần – năm học 2026–2027 (theo phân phối chương trình, xem tai-lieu/chuong-trinh-lop-2.md).
   Mỗi mảng có 35 phần tử: phần tử thứ n−1 là chặng mà lớp đã học XONG vào cuối tuần n
   (bài kéo dài sang tuần sau thì tính vào tuần sau). Lịch từng trường có thể lệch – bố mẹ chỉnh được trong Góc phụ huynh. */
(function (App) {
  'use strict';
  const toan = [2, 4, 6, 7, 9, 10, 12, 14, 16, 19, 20, 22, 23, 25, 28, 31, 33, 35,
    38, 40, 43, 44, 46, 49, 51, 53, 56, 58, 60, 61, 64, 68, 69, 71, 75].map((n) => 'b' + n);
  const tv = ['b1', 'b3', 'b5', 'b7', 'b9', 'b11', 'b13', 'b15', 'on1', 'b17', 'b19', 'b21', 'b23', 'b25', 'b27', 'b29', 'b31', 'on2',
    'c1', 'c3', 'c5', 'c7', 'c9', 'c11', 'c13', 'c15', 'on3', 'c17', 'c19', 'c21', 'c23', 'c25', 'c27', 'c29', 'on4'];
  const ta = ['u1a', 'u1b', 'u2b', 'f1', 'u3a', 'u3b', 'u4b', 'u4b', 'r1', 'u5b', 'u6a', 'u6b', 'f2', 'u7b', 'u8a', 'u8b', 'r2', 'r2',
    'u9a', 'u9b', 'u10b', 'f3', 'u11a', 'u11b', 'u12b', 'u12b', 'r3', 'u13b', 'u14a', 'u14b', 'f4', 'u15b', 'u16a', 'u16b', 'r4'];
  // start: thứ Hai của tuần học thứ nhất · tetAfter: sau ngày này lùi 1 tuần (nghỉ Tết, ước tính)
  App.Data.schedule = { start: '2026-09-07', tetAfter: '2027-02-15', weeks: 35, toan, tv, ta };
})(window.App);
