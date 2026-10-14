/* Tiếng Việt 2 – Kết nối tri thức với cuộc sống: bản đồ chủ điểm và chặng.
   Mỗi chặng ứng với một tuần học (một bài lẻ + một bài chẵn trong sách):
   luyện chính tả, từ và câu, dấu câu của tuần đó, kèm bài đọc ngắn tự soạn cùng chủ điểm. */
(function (App) {
  'use strict';
  const T = App.Gen.tv;
  App.Curriculum = App.Curriculum || {};

  App.Curriculum.tv = {
    id: 'tv',
    name: 'Tiếng Việt',
    world: 'Rừng Chữ',
    icon: '🌳',
    deco: ['🌳', '🍄', '🦋', '🌼', '🐞', '🌿', '🐝', '🌻'],
    topics: [
      // ======================= TẬP 1 =======================
      { id: 't1', short: 'Chủ điểm 1', name: 'Em lớn lên từng ngày', icon: '🌱', stages: [
        { id: 'b1', short: 'Bài 1–2', name: 'Tôi là học sinh lớp 2 · Ngày hôm qua đâu rồi?', icon: '🎒',
          plan: [[T.alphaMissing('a', 'ê'), 2], [T.letterName('a', 'ê'), 1], [T.alphaOrder('a', 'ê'), 1], [T.wordPick('suvat', 'hoatdong'), 2],
            [T.sentPick('gioithieu'), 1], [T.sentOrder('gioithieu'), 1]] },
        { id: 'b3', short: 'Bài 3–4', name: 'Niềm vui của Bi và Bống · Làm việc thật là vui', icon: '🧹',
          plan: [[T.alphaMissing('g', 'ơ'), 2], [T.letterName('g', 'ơ'), 1], [T.wordSort('suvat', 'hoatdong'), 2], [T.sentType('hoatdong', 'gioithieu'), 1],
            [T.sentOrder('hoatdong'), 1], [T.reading('namhoc'), 1]] },
        { id: 'b5', short: 'Bài 5–6', name: 'Em có xinh không? · Một giờ học', icon: '🐘',
          plan: [[T.alphaMissing('p', 'y'), 1], [T.letterName('p', 'y'), 1], [T.alphaNames(), 1], [T.wordPick('dacdiem'), 2],
            [T.sentPick('dacdiem'), 1], [T.sentOrder('dacdiem'), 1], [T.reading('namhoc'), 1]] },
        { id: 'b7', short: 'Bài 7–8', name: 'Cây xấu hổ · Cầu thủ dự bị', icon: '⚽',
          plan: [[T.capName(), 2], [T.alphaNames(), 1], [T.topicPick('trochoi', 'dodung', 'tet'), 2], [T.sentType('gioithieu', 'hoatdong', 'dacdiem'), 2],
            [T.alphaNext(), 1]] },
      ] },
      { id: 't2', short: 'Chủ điểm 2', name: 'Đi học vui sao', icon: '🏫', stages: [
        { id: 'b9', short: 'Bài 9–10', name: 'Cô giáo lớp em · Thời khóa biểu', icon: '🍎',
          plan: [[T.spell('c_k'), 3], [T.spell('ch_tr', 'v_d'), 2], [T.wordSort('suvat', 'hoatdong'), 1], [T.sentPick('hoatdong'), 1], [T.spellPick('c_k'), 1]] },
        { id: 'b11', short: 'Bài 11–12', name: 'Cái trống trường em · Danh sách học sinh', icon: '🥁',
          plan: [[T.spell('g_gh'), 3], [T.spell('s_x', 'hoi_nga'), 2], [T.wordPick('dacdiem', 'suvat'), 1], [T.sentPick('dacdiem'), 1], [T.alphaNames(), 1]] },
        { id: 'b13', short: 'Bài 13–14', name: 'Yêu lắm trường ơi! · Em học vẽ', icon: '🎨',
          plan: [[T.spell('ng_ngh'), 3], [T.spell('r_d_gi', 'an_ang'), 2], [T.topicPick('dodung', 'dochoi', 'nguoithan'), 1], [T.punct('.', '?'), 2]] },
        { id: 'b15', short: 'Bài 15–16', name: 'Cuốn sách của em · Khi trang sách mở ra', icon: '📖',
          plan: [[T.capName(), 1], [T.spell('l_n', 'an2_ang2', 'an3_ang3'), 3], [T.wordPick('dacdiem'), 1], [T.punct('.', '?'), 1], [T.reading('thuvien', 'trongtruong'), 2]] },
        { id: 'on1', short: 'Ôn tập', name: 'Ôn tập giữa học kì 1', icon: '🚩', review: true, shuffle: true,
          plan: [[T.spell('c_k', 'g_gh', 'ng_ngh'), 3], [T.wordSort('suvat', 'hoatdong'), 1], [T.sentType('gioithieu', 'hoatdong', 'dacdiem'), 2],
            [T.punct('.', '?'), 1], [T.capName(), 1], [T.reading('trongtruong', 'thuvien', 'namhoc'), 2]] },
      ] },
      { id: 't3', short: 'Chủ điểm 3', name: 'Niềm vui tuổi thơ', icon: '🪁', stages: [
        { id: 'b17', short: 'Bài 17–18', name: 'Gọi bạn · Tớ nhớ cậu', icon: '🐐',
          plan: [[T.spell('c_k'), 2], [T.spell('ieu_uou', 'en_eng'), 2], [T.topicPick('banbe', 'dochoi', 'caycoi'), 2], [T.punct('.', '?', '!'), 2]] },
        { id: 'b19', short: 'Bài 19–20', name: 'Chữ A và những người bạn · Nhím nâu kết bạn', icon: '🦔',
          plan: [[T.spell('g_gh'), 2], [T.spell('iu_uu', 'ien_ieng'), 2], [T.wordSort('dacdiem', 'hoatdong'), 2], [T.sentPick('hoatdong'), 1], [T.sentOrder('hoatdong'), 1]] },
        { id: 'b21', short: 'Bài 21–22', name: 'Thả diều · Tớ là lê-gô', icon: '🧱',
          plan: [[T.spell('ng_ngh'), 2], [T.spell('ch_tr', 'uon_uong'), 2], [T.topicPick('dochoi', 'dodung', 'vatnuoi'), 1], [T.topicSort('dochoi', 'dodung'), 1],
            [T.sentPick('dacdiem'), 1], [T.reading('thadieu'), 1]] },
        { id: 'b23', short: 'Bài 23–24', name: 'Rồng rắn lên mây · Nặn đồ chơi', icon: '🐉',
          plan: [[T.spell('r_d_gi'), 2], [T.spell('s_x', 'uon2_uong2'), 2], [T.topicPick('trochoi', 'dodung', 'nguoithan'), 1], [T.topicPick('dochoi', 'nghenghiep', 'caycoi'), 1],
            [T.comma(), 2]] },
      ] },
      { id: 't4', short: 'Chủ điểm 4', name: 'Mái ấm gia đình', icon: '🏡', stages: [
        { id: 'b25', short: 'Bài 25–26', name: 'Sự tích hoa tỉ muội · Em mang về yêu thương', icon: '🌸',
          plan: [[T.spell('ien_yen'), 3], [T.spell('r_d_gi', 'ai_ay'), 2], [T.topicPick('nguoithan', 'nghenghiep', 'dochoi'), 2], [T.sentPick('dacdiem'), 1]] },
        { id: 'b27', short: 'Bài 27–28', name: 'Mẹ · Trò chơi của bố', icon: '💞',
          plan: [[T.capPlace(), 2], [T.spell('l_n', 'ao_au'), 2], [T.topicPick('tinhcam', 'dochoi', 'nghenghiep'), 2], [T.punct('.', '?', '!'), 2]] },
        { id: 'b29', short: 'Bài 29–30', name: 'Cánh cửa nhớ bà · Thương ông', icon: '👵',
          plan: [[T.spell('ch_tr'), 2], [T.spell('ac_at'), 2], [T.wordSort('suvat', 'hoatdong'), 1], [T.sentPick('hoatdong'), 1], [T.reading('baem', 'buacom'), 2]] },
        { id: 'b31', short: 'Bài 31–32', name: 'Ánh sáng của yêu thương · Chơi chong chóng', icon: '🎡',
          plan: [[T.spell('iu_uu'), 2], [T.spell('ac2_at2'), 2], [T.topicPick('tinhcam', 'dodung', 'caycoi'), 1], [T.comma(), 2], [T.reading('buacom'), 1]] },
        { id: 'on2', short: 'Ôn tập', name: 'Ôn tập và đánh giá cuối học kì 1', icon: '🏆', review: true, shuffle: true,
          plan: [[T.spell('ien_yen', 'r_d_gi', 'ch_tr', 'iu_uu'), 3], [T.wordSort('suvat', 'hoatdong', 'dacdiem'), 1], [T.sentType('gioithieu', 'hoatdong', 'dacdiem'), 2],
            [T.punct('.', '?', '!'), 2], [T.reading('baem', 'buacom', 'thadieu'), 2]] },
      ] },

      // ======================= TẬP 2 =======================
      { id: 't5', short: 'Chủ điểm 5', name: 'Vẻ đẹp quanh em', icon: '🌺', stages: [
        { id: 'c1', short: 'Tập 2 · Bài 1–2', name: 'Chuyện bốn mùa · Mùa nước nổi', icon: '🍂',
          plan: [[T.spell('c_k'), 2], [T.spell('ch_tr', 'ac_at'), 2], [T.seasonMatch(), 1], [T.wordPick('dacdiem'), 1], [T.punct('.', '?'), 1], [T.reading('muaxuan'), 1]] },
        { id: 'c3', short: 'Bài 3–4', name: 'Họa mi hót · Tết đến rồi', icon: '🧧',
          plan: [[T.spell('g_gh'), 2], [T.spell('s_x', 'uc_ut'), 2], [T.topicPick('tet', 'dodung', 'vatnho'), 2], [T.sentPick('hoatdong'), 1], [T.sentOrder('hoatdong'), 1]] },
        { id: 'c5', short: 'Bài 5–6', name: 'Giọt nước và biển lớn · Mùa vàng', icon: '🌾',
          plan: [[T.spell('ng_ngh'), 2], [T.spell('r_d_gi', 'uc2_ut2'), 2], [T.topicPick('caycoi', 'dochoi', 'nghenghiep'), 1], [T.topicPick('chamsoc', 'dochoi', 'tet'), 1],
            [T.sentPick('hoatdong'), 1], [T.reading('muaxuan'), 1]] },
        { id: 'c7', short: 'Bài 7–8', name: 'Hạt thóc · Lũy tre', icon: '🎋',
          plan: [[T.spell('uynh_uych', 'iet_iec'), 2], [T.spell('l_n'), 2], [T.wordSort('suvat', 'dacdiem'), 2], [T.sentPick('dacdiem'), 1], [T.sentOrder('dacdiem'), 1]] },
      ] },
      { id: 't6', short: 'Chủ điểm 6', name: 'Hành tinh xanh của em', icon: '🌍', stages: [
        { id: 'c9', short: 'Bài 9–10', name: 'Vè chim · Khủng long', icon: '🦖',
          plan: [[T.spell('uya_uyu', 'ieu_uou'), 2], [T.spell('uot_uoc'), 2], [T.topicPick('muongthu', 'vatnuoi', 'duoibien'), 2], [T.punct('.', '?', '!'), 2]] },
        { id: 'c11', short: 'Bài 11–12', name: 'Sự tích cây thì là · Bờ tre đón khách', icon: '🐸',
          plan: [[T.spell('r_d_gi'), 2], [T.spell('iu_uu', 'uoc_uot'), 2], [T.topicSort('vatnuoi', 'muongthu'), 1], [T.topicPick('vatnuoi', 'muongthu', 'duoibien'), 1],
            [T.sentPick('dacdiem'), 1], [T.reading('chuong'), 1]] },
        { id: 'c13', short: 'Bài 13–14', name: 'Tiếng chổi tre · Cỏ non cười rồi', icon: '🧹',
          plan: [[T.spell('ng_ngh'), 2], [T.spell('ch_tr', 'et_ech'), 2], [T.topicSort('viectot', 'viecxau'), 2], [T.comma(), 2]] },
        { id: 'c15', short: 'Bài 15–16', name: 'Những con sao biển · Tạm biệt cánh cam', icon: '🐞',
          plan: [[T.spell('oanh_oach', 's_x'), 2], [T.spell('hoi_nga'), 2], [T.topicPick('vatnho', 'muongthu', 'vatnuoi'), 2], [T.punct('.', '?'), 1], [T.reading('chuong', 'daybien'), 1]] },
        { id: 'on3', short: 'Ôn tập', name: 'Ôn tập giữa học kì 2', icon: '🚩', review: true, shuffle: true,
          plan: [[T.spell('c_k', 'g_gh', 'ng_ngh', 'uot_uoc', 'hoi_nga'), 3], [T.wordSort('suvat', 'dacdiem'), 1], [T.topicPick('vatnuoi', 'muongthu', 'duoibien'), 1],
            [T.sentType('gioithieu', 'hoatdong', 'dacdiem'), 2], [T.comma(), 1], [T.reading('muaxuan', 'chuong'), 2]] },
      ] },
      { id: 't7', short: 'Chủ điểm 7', name: 'Giao tiếp và kết nối', icon: '💌', stages: [
        { id: 'c17', short: 'Bài 17–18', name: 'Những cách chào độc đáo · Thư viện biết đi', icon: '👋',
          plan: [[T.spell('r_d_gi'), 2], [T.spell('ch_tr', 'hoi_nga'), 2], [T.punct('.', '?', '!'), 2], [T.comma(), 1], [T.reading('lathu'), 1]] },
        { id: 'c19', short: 'Bài 19–20', name: 'Cảm ơn anh hà mã · Từ chú bồ câu đến in-tơ-nét', icon: '🕊️',
          plan: [[T.spell('eo_oe'), 2], [T.spell('l_n', 'en2_enh'), 2], [T.topicPick('giaotiep', 'dochoi', 'caycoi'), 2], [T.comma(), 1], [T.reading('lathu'), 1]] },
      ] },
      { id: 't8', short: 'Chủ điểm 8', name: 'Con người Việt Nam', icon: '🇻🇳', stages: [
        { id: 'c21', short: 'Bài 21–22', name: 'Mai An Tiêm · Thư gửi bố ngoài đảo', icon: '🍉',
          plan: [[T.spell('r_d_gi'), 2], [T.spell('s_x', 'ip_iep'), 2], [T.topicPick('nghenghiep', 'dochoi', 'vatnho'), 2], [T.sentPick('hoatdong'), 1], [T.reading('haiquan'), 1]] },
        { id: 'c23', short: 'Bài 23–24', name: 'Bóp nát quả cam · Chiếc rễ đa tròn', icon: '🌳',
          plan: [[T.capName(), 2], [T.spell('iu_uu', 'im_iem'), 2], [T.topicPick('phamchat', 'dochoi', 'vatnuoi'), 2], [T.sentPick('dacdiem'), 1], [T.sentOrder('dacdiem'), 1]] },
      ] },
      { id: 't9', short: 'Chủ điểm 9', name: 'Việt Nam quê hương em', icon: '🏞️', stages: [
        { id: 'c25', short: 'Bài 25–26', name: 'Đất nước chúng mình · Trên các miền đất nước', icon: '🗺️',
          plan: [[T.capPlace(), 2], [T.spell('ch_tr', 'iu_ieu'), 2], [T.topicPick('sanpham', 'dochoi', 'vatnho'), 2], [T.sentPick('gioithieu'), 1], [T.sentOrder('gioithieu'), 1]] },
        { id: 'c27', short: 'Bài 27–28', name: 'Chuyện quả bầu · Khám phá đáy biển ở Trường Sa', icon: '🐠',
          plan: [[T.spell('it_uyt'), 2], [T.spell('ieu_uou', 'in_inh'), 2], [T.topicPick('duoibien', 'muongthu', 'vatnuoi'), 2], [T.comma(), 1], [T.reading('daybien'), 1]] },
        { id: 'c29', short: 'Bài 29–30', name: 'Hồ Gươm · Cánh đồng quê em', icon: '🐢',
          plan: [[T.capPlace(), 2], [T.spell('r_d_gi', 'hoi_nga'), 2], [T.topicPick('nhanong', 'dochoi', 'giaotiep'), 2], [T.sentPick('hoatdong'), 1], [T.reading('queem'), 1]] },
        { id: 'on4', short: 'Ôn tập', name: 'Ôn tập và đánh giá cuối học kì 2', icon: '🎓', review: true, shuffle: true,
          plan: [[T.spell('r_d_gi', 'ch_tr', 'it_uyt', 'in_inh', 'hoi_nga'), 3], [T.wordSort('suvat', 'hoatdong', 'dacdiem'), 1], [T.sentType('gioithieu', 'hoatdong', 'dacdiem'), 2],
            [T.punct('.', '?', '!'), 1], [T.capPlace(), 1], [T.reading('queem', 'daybien', 'haiquan'), 2]] },
      ] },
    ],
  };
})(window.App);
