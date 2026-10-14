/* Tiếng Việt 2 – kho từ ngữ, câu mẫu và bài đọc ngắn.
   Tất cả do app tự soạn theo các kĩ năng của sách (không chép bài đọc trong sách giáo khoa). */
(function (App) {
  'use strict';
  const D = {};

  // ================= Chính tả =================
  // Cặp phụ âm (có pair): mục = [cụm từ có dấu "?", chữ đúng, emoji]
  // Cặp vần / dấu thanh: mục = [cụm từ có dấu "?", phần đúng, phần sai (hoặc mảng), emoji]
  D.spell = {
    c_k: { name: 'c hay k', pair: ['c', 'k'], rule: 'Viết k trước i, e, ê; viết c trước các chữ cái khác.', items: [
      ['?ẹo dừa', 'k', '🍬'], ['con ?iến', 'k', '🐜'], ['cái ?éo', 'k', '✂️'], ['que ?em', 'k', '🍦'], ['thước ?ẻ', 'k', '📏'],
      ['?ể chuyện', 'k', '📖'], ['cái ?ính', 'k', '👓'], ['tiếng ?ẻng', 'k', '🔔'],
      ['con ?á', 'c', '🐟'], ['con ?ua', 'c', '🦀'], ['quả ?am', 'c', '🍊'], ['cái ?ốc', 'c', '🥛'], ['lá ?ờ', 'c', '🚩'],
      ['con ?ú mèo', 'c', '🦉'], ['?ặp sách', 'c', '🎒'], ['con ?ông', 'c', '🦚'], ['bát ?ơm', 'c', '🍚'],
    ] },
    g_gh: { name: 'g hay gh', pair: ['g', 'gh'], rule: 'Viết gh trước i, e, ê; viết g trước các chữ cái khác.', items: [
      ['cái ?ế', 'gh', '🪑'], ['con ?ẹ', 'gh', '🦀'], ['?ép hình', 'gh', '🧩'], ['?i bài', 'gh', '✏️'], ['bàn ?ế', 'gh', '🪑'], ['gồ ?ề', 'gh', ''],
      ['con ?à', 'g', '🐔'], ['con ?ấu', 'g', '🐻'], ['cái ?ối', 'g', '🛏️'], ['hạt ?ạo', 'g', '🍚'], ['?ọi bạn', 'g', '📣'],
      ['?õ cửa', 'g', '🚪'], ['cái ?ương', 'g', ''], ['đồ ?ỗ', 'g', ''],
    ] },
    ng_ngh: { name: 'ng hay ngh', pair: ['ng', 'ngh'], rule: 'Viết ngh trước i, e, ê; viết ng trước các chữ cái khác.', items: [
      ['con ?é', 'ngh', '🐃'], ['?ỉ hè', 'ngh', '🏖️'], ['?e nhạc', 'ngh', '🎧'], ['củ ?ệ', 'ngh', ''], ['suy ?ĩ', 'ngh', '🤔'], ['?ề nông', 'ngh', '🌾'],
      ['con ?ựa', 'ng', '🐴'], ['bắp ?ô', 'ng', '🌽'], ['đi ?ủ', 'ng', '😴'], ['?ón tay', 'ng', '☝️'], ['?ôi sao', 'ng', '⭐'],
      ['bé ?oan', 'ng', '😊'], ['con ?ỗng', 'ng', ''], ['?ày mai', 'ng', '📅'],
    ] },
    ch_tr: { name: 'ch hay tr', pair: ['ch', 'tr'], items: [
      ['cái ?ống', 'tr', '🥁'], ['?ường học', 'tr', '🏫'], ['ông ?ăng', 'tr', '🌙'], ['con ?âu', 'tr', '🐃'], ['cây ?e', 'tr', '🎋'],
      ['quả ?ứng', 'tr', '🥚'], ['bức ?anh', 'tr', '🖼️'], ['?ò chơi', 'tr', '🎲'], ['bầu ?ời', 'tr', '☁️'],
      ['con ?ó', 'ch', '🐶'], ['con ?im', 'ch', '🐦'], ['quả ?uối', 'ch', '🍌'], ['quả ?anh', 'ch', '🍋'], ['cái ?ổi', 'ch', '🧹'],
      ['cái ?ăn', 'ch', ''], ['vui ?ơi', 'ch', '🤸'], ['?ong chóng', 'ch', ''], ['cái ?én', 'ch', '🍵'],
    ] },
    s_x: { name: 's hay x', pair: ['s', 'x'], items: [
      ['ngôi ?ao', 's', '⭐'], ['quyển ?ách', 's', '📚'], ['con ?ư tử', 's', '🦁'], ['con ?óc', 's', '🐿️'], ['hộp ?ữa', 's', '🥛'],
      ['?ân trường', 's', '🏫'], ['dòng ?ông', 's', '🏞️'], ['hoa ?en', 's', ''],
      ['?e đạp', 'x', '🚲'], ['quả ?oài', 'x', '🥭'], ['đĩa ?ôi', 'x', '🍙'], ['màu ?anh', 'x', '💚'], ['?ếp hàng', 'x', ''],
      ['cái ?ẻng', 'x', ''], ['bánh ?à phòng', 'x', '🧼'], ['khúc ?ương', 'x', '🦴'],
    ] },
    l_n: { name: 'l hay n', pair: ['l', 'n'], items: [
      ['chiếc ?á', 'l', '🍃'], ['con ?ợn', 'l', '🐷'], ['ngọn ?ửa', 'l', '🔥'], ['quả ?ê', 'l', '🍐'], ['cây ?úa', 'l', '🌾'],
      ['cái ?ược', 'l', ''], ['?ớp học', 'l', '🏫'], ['?àm bài', 'l', '✏️'],
      ['cái ?ón', 'n', '👒'], ['giọt ?ước', 'n', '💧'], ['trời ?ắng', 'n', '☀️'], ['cái ?ồi', 'n', '🍲'], ['cây ?ến', 'n', '🕯️'],
      ['?ăm học', 'n', '🎒'], ['?ói chuyện', 'n', '💬'], ['quả ?a', 'n', ''],
    ] },
    r_d_gi: { name: 'r, d hay gi', pair: ['r', 'd', 'gi'], items: [
      ['mớ ?au', 'r', '🥬'], ['con ?ùa', 'r', '🐢'], ['con ?ắn', 'r', '🐍'], ['cái ?ổ', 'r', '🧺'], ['khu ?ừng', 'r', '🌳'],
      ['con ?ồng', 'r', '🐉'], ['?ửa tay', 'r', '🧼'],
      ['con ?ê', 'd', '🐐'], ['quả ?ưa hấu', 'd', '🍉'], ['con ?ao', 'd', '🔪'], ['đôi ?ép', 'd', ''], ['cái ?ù', 'd', '☂️'],
      ['quả ?ừa', 'd', '🥥'], ['cô ?ạy học', 'd', ''],
      ['đôi ?ày', 'gi', '👟'], ['tờ ?ấy', 'gi', '📄'], ['cái ?ường', 'gi', '🛏️'], ['cơn ?ó', 'gi', '🌬️'], ['?a đình', 'gi', ''],
      ['?ọt nước', 'gi', '💧'], ['cái ?ỏ', 'gi', '🧺'],
    ] },
    v_d: { name: 'v hay d', pair: ['v', 'd'], items: [
      ['con ?oi', 'v', '🐘'], ['con ?ịt', 'v', '🦆'], ['quyển ?ở', 'v', '📒'], ['cái ?í', 'v', '👛'], ['?ẽ tranh', 'v', '🎨'],
      ['?ui vẻ', 'v', '😄'], ['màu ?àng', 'v', '💛'], ['khu ?ườn', 'v', '🏡'],
      ['con ?ê', 'd', '🐐'], ['quả ?ưa hấu', 'd', '🍉'], ['quả ?ừa', 'd', '🥥'], ['cái ?ù', 'd', '☂️'], ['đôi ?ép', 'd', ''], ['con ?ao', 'd', '🔪'],
    ] },
    hoi_nga: { name: 'dấu hỏi hay dấu ngã', items: [
      ['quyển v?', 'ở', 'ỡ', '📒'], ['cái c?', 'ửa', 'ữa', '🚪'], ['nh? dây', 'ảy', 'ãy', ''], ['cái ch?', 'ổi', 'ỗi', '🧹'],
      ['cái b?', 'ảng', 'ãng', ''], ['con th?', 'ỏ', 'õ', '🐰'], ['m? cửa', 'ở', 'ỡ', '🚪'], ['con h?', 'ổ', 'ỗ', '🐯'], ['học gi?', 'ỏi', 'õi', '🏅'],
      ['v? tranh', 'ẽ', 'ẻ', '🎨'], ['bàn g?', 'ỗ', 'ổ', ''], ['hộp s?', 'ữa', 'ửa', '🥛'], ['cái m?', 'ũ', 'ủ', '🧢'], ['đôi đ?', 'ũa', 'ủa', '🥢'],
      ['con mu?', 'ỗi', 'ổi', '🦟'], ['suy ngh?', 'ĩ', 'ỉ', '🤔'], ['v? tay', 'ẫy', 'ẩy', '👋'], ['gi? gìn', 'ữ', 'ử', ''],
    ] },
    an_ang: { name: 'an hay ang', items: [
      ['cái b? học', 'àn', 'àng', ''], ['con ng?', 'an', 'ang', '🦆'], ['hoa l?', 'an', 'ang', ''], ['cây đ?', 'àn', 'àng', '🎸'], ['b? bè', 'ạn', 'ạng', ''],
      ['cây b?', 'àng', 'àn', '🌳'], ['cái th?', 'ang', 'an', ''], ['màu v?', 'àng', 'àn', '💛'], ['tr? sách', 'ang', 'an', '📖'],
      ['l? xóm', 'àng', 'àn', '🏘️'], ['xếp h?', 'àng', 'àn', ''],
    ] },
    an2_ang2: { name: 'ăn hay ăng', items: [
      ['cái kh?', 'ăn', 'ăng', '🧣'], ['cái ch?', 'ăn', 'ăng', ''], ['? cơm', 'ăn', 'ăng', '🍚'], ['con r?', 'ắn', 'ắng', '🐍'], ['thằn l?', 'ằn', 'ằng', '🦎'],
      ['ông tr?', 'ăng', 'ăn', '🌙'], ['búp m?', 'ăng', 'ăn', '🎋'], ['trời n?', 'ắng', 'ắn', '☀️'], ['hàm r?', 'ăng', 'ăn', '🦷'], ['màu tr?', 'ắng', 'ắn', '⚪'],
    ] },
    an3_ang3: { name: 'ân hay âng', items: [
      ['s? trường', 'ân', 'âng', '🏫'], ['bàn ch?', 'ân', 'âng', '🦶'], ['cái c?', 'ân', 'âng', '⚖️'], ['th? cây', 'ân', 'âng', '🌳'],
      ['n? niu', 'âng', 'ân', ''], ['t? hai', 'ầng', 'ần', '🏢'], ['v? lời', 'âng', 'ân', ''], ['t? bóng', 'âng', 'ân', '⚽'],
    ] },
    ieu_uou: { name: 'iêu hay ươu', items: [
      ['cái ch?', 'iếu', 'ướu', ''], ['thả d?', 'iều', 'ườu', '🪁'], ['h? bài', 'iểu', 'ưởu', '💡'], ['buổi ch?', 'iều', 'ườu', '🌇'], ['rất nh?', 'iều', 'ườu', ''],
      ['con h?', 'ươu', 'iêu', '🦌'], ['lạc đà có b?', 'ướu', 'iếu', '🐫'], ['con kh?', 'ướu', 'iếu', '🐦'], ['ốc b?', 'ươu', 'iêu', '🐌'],
    ] },
    en_eng: { name: 'en hay eng', items: [
      ['cái đ?', 'èn', 'èng', '💡'], ['lời kh?', 'en', 'eng', '👏'], ['cái k?', 'èn', 'èng', '🎺'], ['hoa s?', 'en', 'eng', ''], ['màu đ?', 'en', 'eng', '⚫'],
      ['cái x?', 'ẻng', 'ẻn', ''], ['tiếng k?', 'ẻng', 'ẻn', '🔔'], ['leng k?', 'eng', 'en', '🔔'],
    ] },
    iu_uu: { name: 'iu hay ưu', items: [
      ['cái r?', 'ìu', 'ừu', ''], ['nhỏ x?', 'íu', 'ứu', ''], ['nặng tr?', 'ĩu', 'ữu', '🍇'], ['chim hót l? lo', 'íu', 'ứu', '🐦'], ['d? dàng', 'ịu', 'ựu', ''],
      ['con c?', 'ừu', 'ìu', '🐑'], ['quả l?', 'ựu', 'ịu', ''], ['kêu c?', 'ứu', 'íu', '🆘'], ['b? điện', 'ưu', 'iu', '📮'],
    ] },
    ien_ieng: { name: 'iên hay iêng', items: [
      ['cô t?', 'iên', 'iêng', '🧚'], ['con k?', 'iến', 'iếng', '🐜'], ['b? cả', 'iển', 'iểng', '🌊'], ['đ? thoại', 'iện', 'iệng', '📱'], ['v? phấn', 'iên', 'iêng', ''],
      ['cái ch?', 'iêng', 'iên', ''], ['cái m?', 'iệng', 'iện', '👄'], ['t? hát', 'iếng', 'iến', '🎤'], ['s? năng', 'iêng', 'iên', ''],
    ] },
    uon_uong: { name: 'uôn hay uông', items: [
      ['c? chỉ', 'uộn', 'uộng', '🧶'], ['ch? chuồn', 'uồn', 'uồng', ''], ['b? ngủ', 'uồn', 'uồng', '😪'], ['m? ăn', 'uốn', 'uống', ''],
      ['cái ch?', 'uông', 'uôn', '🔔'], ['chiếc x?', 'uồng', 'uồn', '🛶'], ['rau m?', 'uống', 'uốn', '🥬'], ['? nước', 'uống', 'uốn', '🥤'], ['l? rau', 'uống', 'uốn', ''],
    ] },
    uon2_uong2: { name: 'ươn hay ương', items: [
      ['khu v?', 'ườn', 'ường', '🏡'], ['con l?', 'ươn', 'ương', ''], ['m? sách', 'ượn', 'ượng', '📚'], ['con v?', 'ượn', 'ượng', '🐒'],
      ['cái gi?', 'ường', 'ườn', '🛏️'], ['cái g?', 'ương', 'ươn', ''], ['khúc x?', 'ương', 'ươn', '🦴'], ['con đ?', 'ường', 'ườn', '🛣️'], ['tr? học', 'ường', 'ườn', '🏫'],
    ] },
    ai_ay: { name: 'ai hay ay', items: [
      ['cái t?', 'ai', 'ay', '👂'], ['cái ch?', 'ai', 'ay', '🍾'], ['con n?', 'ai', 'ay', '🦌'], ['đôi v?', 'ai', 'ay', ''], ['gà m?', 'ái', 'áy', '🐔'], ['số h?', 'ai', 'ay', '2️⃣'],
      ['bàn t?', 'ay', 'ai', '✋'], ['máy b?', 'ay', 'ai', '✈️'], ['đôi gi?', 'ày', 'ài', '👟'], ['chiếc v?', 'áy', 'ái', '👗'], ['ch? nhảy', 'ạy', 'ại', '🏃'],
    ] },
    ao_au: { name: 'ao hay au', items: [
      ['ngôi s?', 'ao', 'au', '⭐'], ['quả t?', 'áo', 'áu', '🍎'], ['cái ?', 'áo', 'áu', '👕'], ['cơn b?', 'ão', 'ãu', '🌀'], ['bát ch?', 'áo', 'áu', '🥣'], ['con d?', 'ao', 'au', '🔪'],
      ['cây c?', 'au', 'ao', '🌴'], ['mớ r?', 'au', 'ao', '🥬'], ['m? xanh', 'àu', 'ào', '🎨'], ['số s?', 'áu', 'áo', '6️⃣'], ['ch? bé', 'áu', 'áo', '👶'],
    ] },
    ac_at: { name: 'ac hay at', items: [
      ['b? sĩ', 'ác', 'át', '🩺'], ['âm nh?', 'ạc', 'ạt', '🎵'], ['th? nước', 'ác', 'át', ''], ['củ l?', 'ạc', 'ạt', '🥜'], ['con h?', 'ạc', 'ạt', ''],
      ['cái b?', 'át', 'ác', '🍚'], ['ca h?', 'át', 'ác', '🎤'], ['gió m?', 'át', 'ác', '🍃'], ['bãi c?', 'át', 'ác', '🏖️'],
    ] },
    ac2_at2: { name: 'ăt hay ăc, ât hay âc', items: [
      ['đôi m?', 'ắt', 'ắc', '👀'], ['c? giấy', 'ắt', 'ắc', '✂️'], ['b? bóng', 'ắt', 'ắc', '⚽'], ['g? lúa', 'ặt', 'ặc', '🌾'], ['m? áo', 'ặc', 'ặt', '👕'], ['ch? chắn', 'ắc', 'ắt', ''],
      ['m? ong', 'ật', 'ậc', '🍯'], ['mặt đ?', 'ất', 'ấc', '🌍'], ['đôi t?', 'ất', 'ấc', '🧦'], ['b? thang', 'ậc', 'ật', ''], ['quả g?', 'ấc', 'ất', ''], ['nh? bổng', 'ấc', 'ất', ''],
    ] },
    ien_yen: { name: 'iên, yên hay uyên', items: [
      ['cô t?', 'iên', ['yên', 'uyên'], '🧚'], ['con k?', 'iến', ['yến', 'uyến'], '🐜'], ['b? cả', 'iển', ['yển', 'uyển'], '🌊'],
      ['? xe đạp', 'yên', ['iên', 'uyên'], '🚲'], ['chim ?', 'yến', ['iến', 'uyến'], '🐦'], ['? lặng', 'yên', ['iên', 'uyên'], '🤫'],
      ['chiếc th?', 'uyền', ['iền', 'yền'], '⛵'], ['lời kh?', 'uyên', ['iên', 'yên'], ''], ['kể ch?', 'uyện', ['iện', 'yện'], '📖'], ['quyển tr?', 'uyện', ['iện', 'yện'], '📚'],
    ] },
    uc_ut: { name: 'uc hay ut', items: [
      ['hoa c?', 'úc', 'út', '🌼'], ['ch? mừng', 'úc', 'út', '🎉'], ['xanh l?', 'ục', 'ụt', '💚'], ['c? tẩy', 'ục', 'ụt', ''], ['cây tr?', 'úc', 'út', '🎋'],
      ['cái b?', 'út', 'úc', '✏️'], ['một ph?', 'út', 'úc', '⏱️'], ['s? bóng', 'út', 'úc', '⚽'], ['cái n? áo', 'út', 'úc', '🔘'],
    ] },
    uc2_ut2: { name: 'ưc hay ưt', items: [
      ['lọ m?', 'ực', 'ựt', ''], ['th? dậy', 'ức', 'ứt', '⏰'], ['b? tranh', 'ức', 'ứt', '🖼️'], ['l? sĩ', 'ực', 'ựt', '💪'], ['con m?', 'ực', 'ựt', '🦑'],
      ['dây đ?', 'ứt', 'ức', ''], ['vết n?', 'ứt', 'ức', ''], ['hộp m? Tết', 'ứt', 'ức', '🍬'], ['s? mẻ', 'ứt', 'ức', ''],
    ] },
    uynh_uych: { name: 'uynh hay uych', items: [
      ['phụ h?', 'uynh', 'uych', ''], ['ngã đánh h?', 'uỵch', 'uỵnh', ''], ['h? tay', 'uých', 'uýnh', ''], ['l? quýnh', 'uýnh', 'uých', ''], ['kh? tay', 'uỳnh', 'uỳch', ''],
    ] },
    iet_iec: { name: 'iêt hay iêc', items: [
      ['v? bài', 'iết', 'iếc', '✍️'], ['b? ơn', 'iết', 'iếc', '🙏'], ['t? học', 'iết', 'iếc', '🏫'], ['V? Nam', 'iệt', 'iệc', '🇻🇳'], ['thời t?', 'iết', 'iếc', '🌦️'],
      ['đáng t?', 'iếc', 'iết', '😢'], ['rạp x?', 'iếc', 'iết', '🎪'], ['công v?', 'iệc', 'iệt', ''], ['ch? lá', 'iếc', 'iết', '🍃'], ['bữa t?', 'iệc', 'iệt', '🎉'],
    ] },
    uya_uyu: { name: 'uya hay uyu', items: [
      ['đêm kh?', 'uya', 'uyu', '🌙'], ['kh? tay', 'uỷu', 'uỷa', '💪'], ['đường khúc kh?', 'uỷu', 'uỷa', ''], ['thức kh?', 'uya', 'uyu', '🦉'],
    ] },
    uot_uoc: { name: 'uôt hay uôc', items: [
      ['con ch?', 'uột', 'uộc', '🐭'], ['s? ngày', 'uốt', 'uốc', ''], ['n? cơm', 'uốt', 'uốc', ''], ['t? lúa', 'uốt', 'uốc', '🌾'],
      ['viên th?', 'uốc', 'uốt', '💊'], ['cái c?', 'uốc', 'uốt', ''], ['b? dây', 'uộc', 'uột', '🎀'], ['rau l?', 'uộc', 'uột', '🥬'], ['ngọn đ?', 'uốc', 'uốt', '🔥'],
    ] },
    uoc_uot: { name: 'ươc hay ươt', items: [
      ['giọt n?', 'ước', 'ướt', '💧'], ['cái th?', 'ước', 'ướt', '📏'], ['b? chân', 'ước', 'ướt', '👣'], ['cái l?', 'ược', 'ượt', ''],
      ['l? ván', 'ướt', 'ước', '🏄'], ['áo ?', 'ướt', 'ước', '🌧️'], ['v? qua', 'ượt', 'ược', ''], ['tóc m?', 'ượt', 'ược', ''], ['cầu tr?', 'ượt', 'ược', ''],
    ] },
    et_ech: { name: 'êt hay êch', items: [
      ['ngày T?', 'ết', 'ếch', '🧧'], ['d? vải', 'ệt', 'ệch', ''], ['m? mỏi', 'ệt', 'ệch', '😩'], ['h? giờ', 'ết', 'ếch', '⏰'], ['con r?', 'ết', 'ếch', ''],
      ['con ?', 'ếch', 'ết', '🐸'], ['mũi h?', 'ếch', 'ết', '👃'], ['l? sang một bên', 'ệch', 'ệt', ''],
    ] },
    oanh_oach: { name: 'oanh hay oach', items: [
      ['kh? tay', 'oanh', 'oach', ''], ['l? quanh', 'oanh', 'oach', ''], ['chim ?', 'oanh', 'oach', '🐦'],
      ['kế h?', 'oạch', 'oạnh', '📝'], ['thu h?', 'oạch', 'oạnh', '🌾'], ['ngã đánh ?', 'oạch', 'oạnh', ''],
    ] },
    eo_oe: { name: 'eo hay oe', items: [
      ['con m?', 'èo', 'òe', '🐱'], ['l? núi', 'eo', 'oe', '🧗'], ['cái k?', 'éo', 'óe', '✂️'], ['cánh b?', 'èo', 'òe', ''], ['kẹo d?', 'ẻo', 'ỏe', '🍬'],
      ['kh? áo mới', 'oe', 'eo', '👕'], ['mắt đỏ h?', 'oe', 'eo', ''], ['tròn x?', 'oe', 'eo', ''], ['cười t? toét', 'oe', 'eo', '😁'],
    ] },
    en2_enh: { name: 'ên hay ênh', items: [
      ['cây n?', 'ến', 'ếnh', '🕯️'], ['t? em', 'ên', 'ênh', '🏷️'], ['đ? trường', 'ến', 'ếnh', '🏫'], ['b? cạnh', 'ên', 'ênh', ''], ['đi l?', 'ên', 'ênh', '⬆️'],
      ['dòng k?', 'ênh', 'ên', '🏞️'], ['b? viện', 'ệnh', 'ện', '🏥'], ['biển m? mông', 'ênh', 'ên', '🌊'], ['thuyền l? đênh', 'ênh', 'ên', '⛵'],
    ] },
    ip_iep: { name: 'ip hay iêp', items: [
      ['nh? cầu', 'ịp', 'iệp', '🌉'], ['k? giờ', 'ịp', 'iệp', '⏰'], ['chim bìm b?', 'ịp', 'iệp', '🐦'], ['nhân d? sinh nhật', 'ịp', 'iệp', '🎂'],
      ['t? tục', 'iếp', 'íp', '▶️'], ['tấm th?', 'iếp', 'íp', '💌'], ['rau d?', 'iếp', 'íp', '🥬'],
    ] },
    im_iem: { name: 'im hay iêm', items: [
      ['con ch?', 'im', 'iêm', '🐦'], ['trái t?', 'im', 'iêm', '❤️'], ['bộ ph?', 'im', 'iêm', '🎬'], ['k? chỉ', 'im', 'iêm', '🧵'],
      ['thanh k?', 'iếm', 'ím', '🗡️'], ['t? phòng', 'iêm', 'im', '💉'], ['cái l?', 'iềm', 'ìm', ''], ['que d?', 'iêm', 'im', ''],
    ] },
    iu_ieu: { name: 'iu hay iêu', items: [
      ['cái r?', 'ìu', 'iều', ''], ['nhỏ x?', 'íu', 'iếu', ''], ['chim hót l? lo', 'íu', 'iếu', '🐦'], ['cành cây nặng tr?', 'ĩu', 'iễu', '🍇'],
      ['cánh d?', 'iều', 'ìu', '🪁'], ['buổi ch?', 'iều', 'ìu', '🌇'], ['hạt t?', 'iêu', 'iu', ''], ['rất nh?', 'iều', 'ìu', ''],
    ] },
    it_uyt: { name: 'it hay uyt', items: [
      ['con v?', 'ịt', 'uỵt', '🦆'], ['quả m?', 'ít', 'uýt', ''], ['th? gà', 'ịt', 'uỵt', '🍗'],
      ['xe b?', 'uýt', 'ít', '🚌'], ['h? sáo', 'uýt', 'ít', '😗'], ['s? ngã', 'uýt', 'ít', ''], ['quả q?', 'uýt', 'ít', '🍊'],
    ] },
    in_inh: { name: 'in hay inh', items: [
      ['cục p?', 'in', 'inh', '🔋'], ['x? lỗi', 'in', 'inh', '🙏'], ['bản t?', 'in', 'inh', '📰'], ['v? tay', 'ịn', 'ịnh', ''],
      ['cái k?', 'ính', 'ín', '👓'], ['x? đẹp', 'inh', 'in', '🌸'], ['h? vuông', 'ình', 'ìn', '⬜'], ['t? toán', 'ính', 'ín', '🧮'], ['cái b? hoa', 'ình', 'ìn', '🏺'],
    ] },
  };

  // ================= Bảng chữ cái =================
  D.alphabet = ['a', 'ă', 'â', 'b', 'c', 'd', 'đ', 'e', 'ê', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'ô', 'ơ', 'p', 'q', 'r', 's', 't', 'u', 'ư', 'v', 'x', 'y'];
  D.letterNames = {
    b: 'bê', c: 'xê', d: 'dê', 'đ': 'đê', g: 'giê', h: 'hát', k: 'ca', l: 'e-lờ', m: 'em-mờ', n: 'en-nờ',
    p: 'pê', q: 'quy', r: 'e-rờ', s: 'ét-xì', t: 'tê', v: 'vê', x: 'ích-xì', y: 'i dài',
  };
  // Tên để xếp theo bảng chữ cái (mỗi tên bắt đầu bằng một chữ cái khác nhau)
  D.names = ['An', 'Bình', 'Cường', 'Dũng', 'Đức', 'Giang', 'Hà', 'Khánh', 'Lan', 'Minh', 'Nam', 'Oanh', 'Phúc', 'Quân', 'Sơn', 'Thảo', 'Uyên', 'Vy', 'Xuân', 'Yến'];

  // ================= Từ ngữ chỉ sự vật, hoạt động, đặc điểm =================
  D.words = {
    suvat: ['học sinh', 'cô giáo', 'bác sĩ', 'cái bàn', 'cái ghế', 'quyển sách', 'quyển vở', 'cái bút', 'cặp sách', 'cái bảng', 'thước kẻ',
      'quả bóng', 'búp bê', 'con mèo', 'con chó', 'con gà', 'con voi', 'con chim', 'cây bàng', 'hoa hồng', 'cây tre', 'ngôi nhà', 'xe đạp', 'mặt trời'],
    hoatdong: ['đọc', 'viết', 'chạy', 'nhảy', 'hát', 'múa', 'vẽ', 'học bài', 'quét nhà', 'nấu cơm', 'tưới cây', 'đá bóng', 'bơi', 'đi học',
      'ăn', 'ngủ', 'cười', 'nghe', 'thả diều', 'gấp quần áo', 'rửa bát', 'leo núi', 'kể chuyện', 'nhảy dây'],
    dacdiem: ['xanh', 'đỏ', 'vàng', 'trắng', 'đen', 'cao', 'thấp', 'to', 'nhỏ', 'dài', 'ngắn', 'tròn', 'đẹp', 'xinh', 'ngoan', 'chăm chỉ',
      'hiền', 'dũng cảm', 'thông minh', 'nhanh nhẹn', 'vui vẻ', 'nóng', 'lạnh', 'ngọt', 'chua', 'thơm', 'mềm', 'cứng'],
  };

  // ================= Câu (dấu | chia các cụm từ để sắp xếp) =================
  D.sentences = {
    gioithieu: ['Em|là|học sinh lớp 2.', 'Mẹ em|là|bác sĩ.', 'Bố em|là|thầy giáo.', 'Đây|là|bạn Minh.', 'Cô Lan|là|cô giáo|của em.',
      'Đây|là|ngôi trường|của em.', 'Bạn Hà|là|lớp trưởng|lớp em.', 'Ông em|là|bộ đội.', 'Chú Nam|là|công nhân.'],
    hoatdong: ['Các bạn|đá bóng|trên sân trường.', 'Mẹ|nấu cơm|trong bếp.', 'Bố|tưới cây|ngoài vườn.', 'Chú mèo|bắt|chuột.', 'Bé|đọc|truyện tranh.',
      'Bà|kể|chuyện cổ tích.', 'Chim|hót|líu lo.', 'Anh trai em|đang vẽ|tranh.', 'Chúng em|tập thể dục|mỗi sáng.'],
    dacdiem: ['Bông hoa|rất|đẹp.', 'Bầu trời|xanh ngắt.', 'Bạn Lan|rất|chăm chỉ.', 'Con voi|rất|to.', 'Mái tóc|của bà|bạc trắng.',
      'Dòng sông|trong xanh.', 'Em bé|rất|đáng yêu.', 'Bộ lông|của chú mèo|trắng muốt.', 'Quả cam|chín vàng.'],
  };

  // ================= Dấu câu =================
  D.punct = {
    '.': ['Em đi học lúc 7 giờ', 'Mẹ mua cho em một quyển truyện', 'Chú chó nằm ngủ dưới gốc cây', 'Lớp em có 35 bạn', 'Bố em làm việc ở nhà máy', 'Sáng nào em cũng tập thể dục'],
    '?': ['Bạn tên là gì', 'Bạn học lớp mấy', 'Hôm nay là thứ mấy', 'Bạn có thích đọc truyện không', 'Ai là lớp trưởng lớp mình', 'Nhà bạn ở đâu'],
    '!': ['Ôi, bông hoa đẹp quá', 'Chao ôi, biển rộng quá', 'Hoan hô đội bóng lớp mình', 'A, mẹ về rồi', 'Bức tranh của bạn đẹp quá'],
  };
  D.commaLists = [
    ['Em có', ['bút chì', 'thước kẻ', 'cục tẩy', 'hộp bút']], ['Vườn nhà em có', ['cây cam', 'cây bưởi', 'cây nhãn', 'cây ổi']],
    ['Mẹ đi chợ mua', ['rau', 'thịt', 'cá', 'trứng']], ['Bé thích', ['búp bê', 'gấu bông', 'quả bóng', 'chong chóng']],
    ['Vườn thú có', ['hổ', 'voi', 'hươu cao cổ', 'khỉ']], ['Nhà em nuôi', ['chó', 'mèo', 'gà', 'vịt']],
  ];

  // ================= Tên riêng =================
  D.people = ['Nguyễn Minh An', 'Trần Thu Hà', 'Lê Văn Nam', 'Phạm Ngọc Lan', 'Hoàng Gia Bảo', 'Đỗ Khánh Linh', 'Vũ Đức Minh', 'Bùi Thanh Hương', 'Đặng Quốc Việt', 'Ngô Phương Anh'];
  D.places = ['Hà Nội', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Đà Lạt', 'Hạ Long', 'Sa Pa', 'Vũng Tàu', 'Phú Quốc', 'Cà Mau', 'Lào Cai', 'Nghệ An', 'Quảng Ninh', 'Kiên Giang'];

  // ================= Mở rộng vốn từ theo chủ đề =================
  D.topics = {
    dodung: { name: 'đồ dùng học tập', words: ['bút chì', 'thước kẻ', 'cục tẩy', 'cặp sách', 'quyển vở', 'hộp bút', 'bảng con', 'phấn', 'bút màu', 'sách giáo khoa'] },
    dochoi: { name: 'đồ chơi', words: ['búp bê', 'ô tô đồ chơi', 'quả bóng', 'con quay', 'cái diều', 'gấu bông', 'chong chóng', 'đèn ông sao', 'rô-bốt', 'bộ xếp hình'] },
    trochoi: { name: 'trò chơi dân gian', words: ['kéo co', 'nhảy dây', 'ô ăn quan', 'bịt mắt bắt dê', 'mèo đuổi chuột', 'rồng rắn lên mây', 'đá cầu', 'trốn tìm', 'nhảy lò cò'] },
    nguoithan: { name: 'người thân trong gia đình', words: ['ông', 'bà', 'bố', 'mẹ', 'anh', 'chị', 'cô', 'dì', 'chú', 'bác', 'cậu', 'mợ'] },
    tinhcam: { name: 'tình cảm gia đình', words: ['yêu thương', 'quan tâm', 'chăm sóc', 'kính trọng', 'nhường nhịn', 'vâng lời', 'hiếu thảo', 'đùm bọc'] },
    banbe: { name: 'tình cảm bạn bè', words: ['thân thiết', 'đoàn kết', 'giúp đỡ', 'quý mến', 'gắn bó', 'thân thiện', 'tin tưởng', 'chia sẻ'] },
    tet: { name: 'ngày Tết', words: ['bánh chưng', 'hoa đào', 'hoa mai', 'câu đối', 'lì xì', 'mứt Tết', 'chúc Tết', 'pháo hoa', 'mâm ngũ quả'] },
    caycoi: { name: 'cây cối', words: ['cây lúa', 'cây ngô', 'cây khoai', 'cây cam', 'cây xoài', 'cây bưởi', 'cây hoa hồng', 'cây bàng', 'cây phượng', 'cây đa'] },
    chamsoc: { name: 'việc chăm sóc cây', words: ['tưới nước', 'bón phân', 'nhổ cỏ', 'bắt sâu', 'tỉa cành', 'xới đất'] },
    muongthu: { name: 'muông thú sống trong rừng', words: ['hổ', 'báo', 'sư tử', 'voi', 'khỉ', 'hươu', 'gấu', 'sóc', 'cáo', 'chó sói'] },
    vatnuoi: { name: 'vật nuôi trong nhà', words: ['chó', 'mèo', 'gà', 'vịt', 'lợn', 'trâu', 'bò', 'ngan', 'ngỗng', 'thỏ', 'dê'] },
    vatnho: { name: 'loài vật nhỏ bé', words: ['kiến', 'ong', 'bướm', 'chuồn chuồn', 'cánh cam', 've sầu', 'dế mèn', 'ốc sên', 'đom đóm', 'bọ rùa'] },
    viectot: { name: 'việc làm bảo vệ môi trường', words: ['trồng cây', 'nhặt rác', 'tiết kiệm nước', 'phân loại rác', 'tắt điện khi ra khỏi phòng', 'chăm sóc cây xanh', 'bỏ rác vào thùng'] },
    viecxau: { name: 'việc làm có hại cho môi trường', words: ['xả rác bừa bãi', 'chặt phá rừng', 'bẻ cành cây', 'đốt rác', 'giẫm lên cỏ', 'để vòi nước chảy mãi'] },
    giaotiep: { name: 'phương tiện giao tiếp, kết nối', words: ['lá thư', 'điện thoại', 'máy tính', 'ti vi', 'in-tơ-nét', 'bưu thiếp', 'chiếc loa', 'đài phát thanh'] },
    nghenghiep: { name: 'nghề nghiệp', words: ['bác sĩ', 'giáo viên', 'nông dân', 'công nhân', 'bộ đội', 'ngư dân', 'thợ xây', 'đầu bếp', 'công an', 'người lái xe'] },
    phamchat: { name: 'phẩm chất tốt của con người Việt Nam', words: ['cần cù', 'dũng cảm', 'thân thiện', 'yêu nước', 'đoàn kết', 'hiếu học', 'thật thà', 'kiên trì'] },
    sanpham: { name: 'sản phẩm truyền thống', words: ['nón lá', 'gốm sứ', 'lụa tơ tằm', 'tranh Đông Hồ', 'chiếu cói', 'rổ rá tre', 'đồ mây tre đan'] },
    duoibien: { name: 'loài vật sống dưới biển', words: ['cá heo', 'cá voi', 'sao biển', 'cua', 'tôm', 'mực', 'sứa', 'rùa biển', 'bạch tuộc', 'cá mập'] },
    nhanong: { name: 'công việc của nhà nông', words: ['cày ruộng', 'cấy lúa', 'gặt lúa', 'bón phân', 'tưới rau', 'nhổ cỏ', 'chăn trâu', 'phơi thóc'] },
  };
  // Đặc điểm của các mùa (miền Bắc)
  D.seasons = [['Mùa xuân', 'ấm áp, cây cối đâm chồi'], ['Mùa hạ', 'nóng nực, ve kêu râm ran'], ['Mùa thu', 'mát mẻ, trời trong xanh'], ['Mùa đông', 'lạnh giá, gió bấc']];

  // ================= Bài đọc ngắn (tự soạn) =================
  // qs: [câu hỏi, đáp án đúng, [đáp án sai]]
  D.passages = {
    namhoc: { title: 'Ngày đầu năm học', text: 'Sáng nay, Nam dậy thật sớm. Bạn mặc bộ đồng phục mới và đeo chiếc cặp màu xanh. Hôm nay là ngày đầu tiên Nam học lớp 2. Ở cổng trường, cô giáo mỉm cười đón các bạn. Nam thấy mình đã lớn hơn năm ngoái rất nhiều.', qs: [
      ['Hôm nay là ngày gì của Nam?', 'Ngày đầu tiên học lớp 2', ['Ngày sinh nhật của Nam', 'Ngày Tết', 'Ngày đầu nghỉ hè']],
      ['Chiếc cặp của Nam màu gì?', 'Màu xanh', ['Màu đỏ', 'Màu vàng', 'Màu tím']],
      ['Ai đón các bạn ở cổng trường?', 'Cô giáo', ['Bố của Nam', 'Bác bảo vệ', 'Mẹ của Nam']],
    ] },
    trongtruong: { title: 'Chiếc trống trường', text: 'Ở góc sân trường em có một chiếc trống to. Mỗi sáng, bác bảo vệ đánh trống báo giờ vào học: "Tùng! Tùng! Tùng!". Nghe tiếng trống, các bạn nhỏ xếp hàng vào lớp. Những ngày hè, chiếc trống nằm im, như cũng đang nhớ các bạn học sinh.', qs: [
      ['Ai đánh trống mỗi sáng?', 'Bác bảo vệ', ['Cô giáo', 'Bạn lớp trưởng', 'Thầy hiệu trưởng']],
      ['Nghe tiếng trống, các bạn nhỏ làm gì?', 'Xếp hàng vào lớp', ['Chạy ra cổng trường', 'Đi ăn trưa', 'Ra về']],
      ['Những ngày hè, chiếc trống thế nào?', 'Nằm im như đang nhớ các bạn', ['Kêu tùng tùng cả ngày', 'Được mang về nhà', 'Bị hỏng']],
    ] },
    thuvien: { title: 'Góc thư viện', text: 'Lớp em có một góc thư viện nhỏ. Trên giá có truyện tranh, sách khoa học và báo thiếu nhi. Giờ ra chơi, em thường đến đây đọc truyện. Đọc xong, em luôn cất sách vào đúng chỗ.', qs: [
      ['Góc thư viện ở đâu?', 'Trong lớp em', ['Ở nhà em', 'Ở công viên', 'Ở nhà bà']],
      ['Giờ ra chơi, em thường làm gì?', 'Đến góc thư viện đọc truyện', ['Đá bóng', 'Ngủ trưa', 'Vẽ tranh']],
      ['Đọc xong, em làm gì?', 'Cất sách vào đúng chỗ', ['Mang sách về nhà', 'Để sách trên bàn', 'Cho bạn mượn sách']],
    ] },
    thadieu: { title: 'Thả diều', text: 'Chiều hè, gió thổi mát rượi. Lũ trẻ trong xóm rủ nhau ra bãi cỏ thả diều. Cánh diều của Bin có hình con cá vàng. Diều bay lên cao, cao mãi, chao nghiêng giữa trời xanh. Cả bọn reo hò vui sướng.', qs: [
      ['Lũ trẻ thả diều ở đâu?', 'Trên bãi cỏ', ['Trong sân trường', 'Trên sân thượng', 'Ngoài bãi biển']],
      ['Cánh diều của Bin có hình gì?', 'Con cá vàng', ['Con chim én', 'Con bướm', 'Con rồng']],
      ['Khi diều bay cao, cả bọn thế nào?', 'Reo hò vui sướng', ['Buồn bã đi về', 'Ngồi im lặng', 'Chạy đi chơi khác']],
    ] },
    buacom: { title: 'Bữa cơm tối', text: 'Tối nào, cả nhà em cũng quây quần bên mâm cơm. Mẹ nấu canh rau, bố rán cá. Em giúp bà xếp bát đũa. Vừa ăn, cả nhà vừa kể cho nhau nghe chuyện trong ngày. Em thấy bữa cơm gia đình thật ấm áp.', qs: [
      ['Bố làm món gì?', 'Rán cá', ['Nấu canh rau', 'Luộc gà', 'Làm nem']],
      ['Em giúp bà làm việc gì?', 'Xếp bát đũa', ['Quét nhà', 'Nấu cơm', 'Rửa rau']],
      ['Em thấy bữa cơm gia đình thế nào?', 'Thật ấm áp', ['Rất buồn', 'Rất vội vàng', 'Rất ồn ào']],
    ] },
    baem: { title: 'Bà của em', text: 'Bà em năm nay đã tám mươi tuổi. Tóc bà bạc trắng như cước. Tối nào bà cũng kể chuyện cổ tích cho em nghe. Em rất thương bà và thường đấm lưng cho bà.', qs: [
      ['Bà em năm nay bao nhiêu tuổi?', 'Tám mươi tuổi', ['Sáu mươi tuổi', 'Bảy mươi tuổi', 'Chín mươi tuổi']],
      ['Tối nào bà cũng làm gì?', 'Kể chuyện cổ tích cho em nghe', ['Đi chợ', 'Xem ti vi', 'Tưới cây']],
      ['Em làm gì để tỏ lòng thương bà?', 'Đấm lưng cho bà', ['Đi chơi với bạn', 'Xem hoạt hình', 'Đọc truyện một mình']],
    ] },
    muaxuan: { title: 'Mùa xuân về', text: 'Mùa xuân đến, cây cối đâm chồi nảy lộc. Hoa đào nở hồng khắp các ngõ phố. Những chú chim én bay lượn trên bầu trời. Trời ấm dần lên, mưa phùn lất phất bay.', qs: [
      ['Mùa xuân, cây cối thế nào?', 'Đâm chồi nảy lộc', ['Rụng hết lá', 'Khô héo', 'Đứng im lặng']],
      ['Hoa gì nở hồng khắp các ngõ phố?', 'Hoa đào', ['Hoa sen', 'Hoa cúc', 'Hoa phượng']],
      ['Loài chim nào bay lượn trên bầu trời?', 'Chim én', ['Chim cú', 'Chim cánh cụt', 'Chim công']],
    ] },
    chuong: { title: 'Chú ong chăm chỉ', text: 'Trong vườn có một chú ong vàng. Từ sáng sớm, ong đã bay đi tìm hoa. Ong hút mật hoa rồi mang về tổ. Nhờ có ong, cây trong vườn ra thật nhiều quả.', qs: [
      ['Từ sáng sớm, ong bay đi tìm gì?', 'Tìm hoa', ['Tìm nước', 'Tìm bạn', 'Tìm lá cây']],
      ['Ong mang mật hoa về đâu?', 'Về tổ', ['Về nhà em', 'Ra bờ suối', 'Lên ngọn núi']],
      ['Nhờ có ong, cây trong vườn thế nào?', 'Ra thật nhiều quả', ['Bị héo', 'Rụng hết lá', 'Không ra hoa']],
    ] },
    lathu: { title: 'Lá thư gửi ông', text: 'Ông nội của Lan sống ở quê. Lan viết một lá thư gửi ông. Trong thư, Lan kể em vừa được điểm mười môn Toán. Lan còn vẽ tặng ông một bức tranh ngôi nhà. Mẹ giúp Lan gửi thư ở bưu điện.', qs: [
      ['Ông nội của Lan sống ở đâu?', 'Ở quê', ['Ở thành phố', 'Ở nước ngoài', 'Ở cùng nhà Lan']],
      ['Lan vẽ tặng ông bức tranh gì?', 'Ngôi nhà', ['Con mèo', 'Dòng sông', 'Bông hoa']],
      ['Ai giúp Lan gửi thư?', 'Mẹ', ['Bố', 'Cô giáo', 'Bạn của Lan']],
    ] },
    haiquan: { title: 'Bố của Hùng', text: 'Bố của Hùng là bộ đội hải quân. Bố làm nhiệm vụ ở một hòn đảo xa giữa biển. Ngày ngày, bố cùng đồng đội canh giữ biển đảo quê hương. Hùng rất tự hào về bố.', qs: [
      ['Bố của Hùng làm nghề gì?', 'Bộ đội hải quân', ['Bác sĩ', 'Ngư dân', 'Thầy giáo']],
      ['Bố làm nhiệm vụ ở đâu?', 'Ở một hòn đảo xa giữa biển', ['Ở trên núi cao', 'Ở trong thành phố', 'Ở trường học']],
      ['Hùng cảm thấy thế nào về bố?', 'Rất tự hào', ['Rất sợ hãi', 'Không vui', 'Rất buồn']],
    ] },
    queem: { title: 'Quê em', text: 'Quê em ở ven một dòng sông nhỏ. Hai bên bờ là những cánh đồng lúa xanh mướt. Mùa gặt, lúa chín vàng óng như một tấm thảm khổng lồ. Chiều chiều, lũ trẻ chăn trâu thổi sáo trên đê.', qs: [
      ['Quê em ở đâu?', 'Ven một dòng sông nhỏ', ['Trên núi cao', 'Giữa thành phố', 'Bên bờ biển']],
      ['Mùa gặt, lúa thế nào?', 'Chín vàng óng', ['Xanh non', 'Héo khô', 'Đỏ rực']],
      ['Chiều chiều, lũ trẻ làm gì trên đê?', 'Chăn trâu, thổi sáo', ['Đá bóng', 'Đọc sách', 'Bơi thuyền']],
    ] },
    daybien: { title: 'Dưới đáy biển', text: 'Dưới đáy biển có rất nhiều loài vật. Những chú cá nhỏ đủ màu bơi lượn quanh rạn san hô. Sao biển nằm im trên cát. Cua bò ngang, còn mực thì phun mực đen để trốn kẻ thù.', qs: [
      ['Những chú cá nhỏ bơi lượn quanh đâu?', 'Quanh rạn san hô', ['Quanh chiếc thuyền', 'Quanh hòn đảo', 'Quanh cây cầu']],
      ['Sao biển nằm ở đâu?', 'Nằm im trên cát', ['Trên ngọn cây', 'Trên chiếc thuyền', 'Trên mặt nước']],
      ['Mực làm gì để trốn kẻ thù?', 'Phun mực đen', ['Bơi thật nhanh lên bờ', 'Nằm im trên cát', 'Chui vào vỏ ốc']],
    ] },
  };

  App.TVData = D;
})(window.App);
