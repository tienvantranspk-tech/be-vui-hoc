/* Tiếng Việt 2 – dữ liệu cho bài dạng vở bài tập (app tự soạn, không chép sách):
   câu có đánh dấu loại từ, câu chia bộ phận, đoạn văn có chỗ trống, đoạn văn cần điền dấu câu, câu Đ/S cho bài đọc. */
(function (App) {
  'use strict';
  const D = App.TVData;

  // Câu có đánh dấu từ ngữ: {từ|sv} chỉ sự vật, {từ|hd} chỉ hoạt động, {từ|dd} chỉ đặc điểm.
  // Chữ không đánh dấu là từ khác (rất, trên, và…) – bé chạm vào thì tính là chọn sai.
  D.tagged = [
    '{Mẹ|sv} {nấu|hd} {cơm|sv} trong {bếp|sv}.',
    '{Bố|sv} {tưới|hd} {cây|sv} ngoài {vườn|sv}.',
    '{Chú mèo|sv} {nằm|hd} {sưởi nắng|hd} trên {thềm|sv}.',
    '{Bầu trời|sv} {xanh|dd} và {cao|dd}.',
    '{Các bạn|sv} {đá bóng|hd} trên {sân trường|sv}.',
    '{Bông hoa|sv} {nở|hd} {đỏ thắm|dd}.',
    '{Cô giáo|sv} {giảng bài|hd} rất {hay|dd}.',
    '{Bé Na|sv} {đọc|hd} {truyện|sv} cho {bà|sv} {nghe|hd}.',
    '{Quả cam|sv} {chín|dd} {vàng|dd} trên {cành|sv}.',
    '{Đàn gà con|sv} {mổ|hd} {thóc|sv} ngoài {sân|sv}.',
    '{Chiếc cặp|sv} {mới|dd} rất {đẹp|dd}.',
    '{Bạn Nam|sv} {chăm chỉ|dd} {học bài|hd}.',
    '{Ông|sv} {kể|hd} {chuyện cổ tích|sv}.',
    '{Con chó|sv} {vẫy|hd} {đuôi|sv} {mừng|hd} {chủ|sv}.',
    '{Dòng sông|sv} {trong|dd} và {mát|dd}.',
    '{Những chú chim|sv} {hót|hd} {líu lo|dd} trên {cành cây|sv}.',
    '{Lan|sv} {quét|hd} {nhà|sv} rất {sạch|dd}.',
    '{Mùa thu|sv}, {trời|sv} {mát mẻ|dd} và {trong xanh|dd}.',
    '{Bà|sv} {trồng|hd} {rau|sv} và {nuôi|hd} {gà|sv}.',
    '{Chú bộ đội|sv} {canh giữ|hd} {biển đảo|sv}.',
    '{Cánh diều|sv} {bay|hd} {cao|dd} trên {bầu trời|sv}.',
    '{Bạn Hà|sv} {vẽ|hd} một {bức tranh|sv} rất {đẹp|dd}.',
    '{Chú voi|sv} {to|dd} {khỏe|dd} {kéo|hd} {gỗ|sv}.',
    '{Bác nông dân|sv} {chăm chỉ|dd} {cày|hd} {ruộng|sv}.',
    '{Mai|sv} {gấp|hd} {quần áo|sv} rất {gọn gàng|dd}.',
    '{Chú thỏ|sv} {trắng|dd} {gặm|hd} {cà rốt|sv}.',
    '{Em bé|sv} {cười|hd} rất {tươi|dd}.',
    '{Chị gió|sv} {thổi|hd} {mát rượi|dd}.',
    '{Đàn vịt|sv} {bơi|hd} {tung tăng|dd} dưới {ao|sv}.',
    '{Bạn Minh|sv} {nhanh nhẹn|dd} {nhặt|hd} {rác|sv} bỏ vào {thùng|sv}.',
  ];

  // Câu chia bộ phận: "Ai (cái gì, con gì) / là gì – làm gì – thế nào"; dấu | chia các cụm để chạm
  D.parts = {
    gt: ['Bạn Minh / là|lớp trưởng|lớp em.', 'Mẹ|của Lan / là|bác sĩ.', 'Cô Hoa / là|cô giáo|lớp 2A.', 'Con mèo / là|bạn thân|của bé Na.',
      'Hồ Gươm / là|cảnh đẹp|của Hà Nội.', 'Trường em / là|ngôi trường|rất đẹp.', 'Chú Tư / là|người lái xe buýt.', 'Ông|của Hùng / là|bộ đội.'],
    hd: ['Các bạn nhỏ / đang chơi|kéo co|trên sân.', 'Bà|của em / đang tưới|rau|ngoài vườn.', 'Chú chim sẻ / nhặt|hạt thóc|ngoài sân.',
      'Bạn Hùng / quét|lớp học|thật sạch.', 'Đàn vịt / bơi|tung tăng|dưới ao.', 'Mẹ / đang gấp|quần áo.', 'Cả lớp|em / tập|thể dục|mỗi sáng.',
      'Chú công nhân / đang xây|ngôi nhà|mới.'],
    dd: ['Mái tóc|của bà / bạc trắng|như cước.', 'Bạn Lan / rất|chăm chỉ|và ngoan ngoãn.', 'Bầu trời|mùa thu / trong xanh|và cao vời vợi.',
      'Chú mèo|nhà em / rất|đáng yêu.', 'Dòng sông / trong vắt|như gương.', 'Cánh đồng lúa / chín vàng|óng ả.', 'Chiếc áo|mới / rất|đẹp.', 'Con voi / to|và khỏe.'],
  };

  // Đoạn văn có chỗ trống {từ} theo chủ điểm (t1 … t9); extra: thẻ nhiễu
  D.clozes = [
    { th: 't1', text: 'Năm nay em {lên} lớp 2. Em có chiếc {cặp} mới màu xanh. Sáng nào em cũng {dậy} sớm để đi học.', extra: ['ngủ', 'bàn'] },
    { th: 't1', text: 'Em {giúp} mẹ quét nhà. Bố khen em {ngoan}. Em thấy mình đã {lớn} hơn rồi.', extra: ['bé', 'nghịch'] },
    { th: 't2', text: 'Trống trường {vang} lên. Các bạn {xếp hàng} vào lớp. Cô giáo mỉm cười chào cả {lớp}.', extra: ['nhà', 'chạy'] },
    { th: 't2', text: 'Trong giờ học, cô {giảng} bài rất hay. Chúng em chăm chú {lắng nghe}. Bạn Minh giơ tay {phát biểu}.', extra: ['ngủ gật', 'hát'] },
    { th: 't3', text: 'Chiều nay, em và các bạn {thả diều} trên bãi cỏ. Cánh diều {bay} cao giữa bầu trời {xanh}.', extra: ['đỏ', 'bơi'] },
    { th: 't3', text: 'Em có một con {gấu bông}. Nó có bộ lông {mềm} mại. Tối nào em cũng {ôm} gấu đi ngủ.', extra: ['cứng', 'ném'] },
    { th: 't4', text: 'Tối nào cả nhà em cũng {quây quần} bên mâm cơm. Mẹ {gắp} thức ăn cho em. Bữa cơm thật {ấm áp}.', extra: ['lạnh lẽo', 'chạy'] },
    { th: 't4', text: 'Ông em đã {già}. Tóc ông {bạc} trắng. Em thường {pha trà} mời ông.', extra: ['trẻ', 'đen'] },
    { th: 't5', text: 'Mùa xuân đến, cây cối {đâm chồi}. Hoa đào {nở} hồng khắp nơi. Chim én {bay lượn} trên bầu trời.', extra: ['rụng lá', 'ngủ'] },
    { th: 't5', text: 'Mùa hè, trời {nắng} chang chang. Ve {kêu} râm ran. Hoa phượng {đỏ} rực sân trường.', extra: ['lạnh', 'trắng'] },
    { th: 't6', text: 'Chú ong {chăm chỉ} bay đi tìm hoa. Ong {hút} mật rồi mang về {tổ}.', extra: ['lười biếng', 'hang'] },
    { th: 't6', text: 'Em cùng các bạn {nhặt} rác ở công viên. Chúng em bỏ rác vào {thùng}. Công viên trở nên {sạch sẽ}.', extra: ['bẩn', 'vứt'] },
    { th: 't7', text: 'Bà ở quê {gọi điện thoại} cho em. Em {kể} cho bà nghe chuyện ở trường. Bà {khen} em ngoan.', extra: ['mắng', 'viết'] },
    { th: 't7', text: 'Em {viết} thư cho bạn. Em dán {tem} lên phong bì. Mẹ giúp em gửi thư ở {bưu điện}.', extra: ['chợ', 'đọc'] },
    { th: 't8', text: 'Bố em là {bộ đội} hải quân. Bố {canh giữ} biển đảo quê hương. Em rất {tự hào} về bố.', extra: ['buồn', 'bác sĩ'] },
    { th: 't8', text: 'Bác nông dân {cày} ruộng từ sáng sớm. Bác rất {cần cù}. Nhờ có bác, chúng ta có hạt {gạo} để ăn.', extra: ['lười biếng', 'muối'] },
    { th: 't9', text: 'Quê em có dòng sông {hiền hòa}. Hai bên bờ là cánh đồng lúa {xanh mướt}. Chiều chiều, lũ trẻ {thả diều} trên đê.', extra: ['dữ dội', 'nấu cơm'] },
    { th: 't9', text: 'Hồ Gươm nằm giữa {thủ đô} Hà Nội. Mặt hồ {xanh} như một tấm gương. Hai bên bờ có nhiều {cây} cổ thụ.', extra: ['đỏ', 'nhà'] },
  ];

  // Đoạn văn cần điền dấu câu: [.] [?] [!] [,] là chỗ trống
  D.punctParas = [
    'Hôm nay là thứ Hai[.] Mai hỏi Nam: “Bạn đã làm bài tập chưa[?]” Nam đáp: “Mình làm xong rồi[.]”',
    'Lớp em có ba mươi bạn[.] Ai là lớp trưởng lớp em[?] Đó là bạn Hà[.]',
    'Bà hỏi em: “Hôm nay cháu học bài gì[?]” Em kể cho bà nghe về bài học mới[.]',
    'Em đi học lúc sáu giờ rưỡi[.] Mẹ đưa em đến cổng trường[.] Mẹ dặn: “Con nhớ ăn hết suất cơm trưa nhé[.]”',
    'Bạn tên là gì[?] Mình tên là Minh[.] Nhà bạn ở đâu[?]',
    'Ôi, bông hoa đẹp quá[!] Hoa này tên là gì hả mẹ[?] Đó là hoa hồng đấy con ạ[.]',
    'Hoan hô đội bóng lớp mình[!] Các bạn đã thắng trận chung kết[.] Ai đã ghi bàn thắng[?]',
    'A, mẹ về rồi[!] Mẹ mua cho em một quyển truyện tranh[.] Em cảm ơn mẹ[.]',
    'Chao ôi, biển rộng quá[!] Bố ơi, biển có sâu không[?] Biển sâu lắm con ạ[.]',
    'Trong vườn nhà em có cây cam[,] cây bưởi[,] cây nhãn và cây ổi[.]',
    'Em có bút chì[,] thước kẻ[,] cục tẩy và hộp bút[.]',
    'Mẹ đi chợ mua rau[,] thịt[,] cá và trứng[.]',
    'Vườn thú có hổ[,] voi[,] hươu cao cổ và khỉ[.]',
    'Các bạn nhỏ hát[,] múa và chơi trò chơi rất vui[.]',
    'Ông[,] bà[,] bố và mẹ đều rất yêu em[.]',
    'Mùa xuân có hoa đào[,] hoa mai[,] hoa mận nở rộ[.]',
  ];

  // Câu ứng dụng khi tô chữ hoa (app tự soạn, mỗi câu bắt đầu bằng chữ hoa đó)
  D.capLines = {
    A: 'Ai cũng chăm học.', Ă: 'Ăn chậm nhai kĩ.', Â: 'Ấm áp tình thân.', B: 'Bạn bè chia sẻ.', C: 'Chăm chỉ học hành.', D: 'Dạy bảo ân cần.',
    Đ: 'Đi học đúng giờ.', E: 'Em yêu trường em.', Ê: 'Êm ả làng quê.', G: 'Giữ gìn sách vở.', H: 'Học đi đôi với hành.', I: 'Im lặng lắng nghe.',
    K: 'Kính thầy yêu bạn.', L: 'Lá lành đùm lá rách.', M: 'Mẹ hiền như cô giáo.', N: 'Nói lời hay ý đẹp.', O: 'Ong chăm làm mật.',
    Ô: 'Ông bà vui khỏe.', Ơ: 'Ơn thầy nhớ mãi.', P: 'Phố phường sạch đẹp.', Q: 'Quê hương tươi đẹp.', R: 'Rừng xanh núi cao.',
    S: 'Sông sâu nước trong.', T: 'Thương người như thể thương thân.', U: 'Uống nước nhớ nguồn.', Ư: 'Ước mơ bay xa.', V: 'Vui đến trường.',
    X: 'Xanh tươi đồng lúa.', Y: 'Yêu nước, yêu nhà.',
  };

  // Nói và đáp lời trong tình huống: [tình huống, lời đúng, [lời chưa phù hợp]]
  D.replies = [
    ['Bạn cho em mượn bút chì. Em nói:', 'Cảm ơn bạn nhé!', ['Xin lỗi bạn nhé!', 'Chúc mừng bạn!']],
    ['Em lỡ làm rơi bút của bạn. Em nói:', 'Mình xin lỗi bạn nhé!', ['Cảm ơn bạn nhé!', 'Bạn giỏi quá!']],
    ['Bạn em được điểm 10. Em nói:', 'Chúc mừng bạn nhé!', ['Mình xin lỗi bạn!', 'Bạn cho mình mượn nhé!']],
    ['Bạn em bị ngã, đau chân. Em nói:', 'Bạn có đau lắm không? Để mình đỡ bạn dậy.', ['Ha ha, bạn ngã rồi!', 'Chúc mừng bạn!']],
    ['Cô giáo khen em vẽ đẹp. Em đáp:', 'Em cảm ơn cô ạ!', ['Em xin lỗi cô ạ!', 'Cô vẽ đi ạ!']],
    ['Bà tặng em quà sinh nhật. Em nói:', 'Cháu cảm ơn bà ạ!', ['Cháu chào bà ạ!', 'Cháu xin lỗi bà ạ!']],
    ['Em muốn mượn quyển truyện của bạn. Em nói:', 'Bạn cho mình mượn quyển truyện nhé!', ['Đưa truyện đây!', 'Mình cảm ơn bạn!']],
    ['Sáng sớm, em gặp cô giáo ở cổng trường. Em nói:', 'Em chào cô ạ!', ['Chào bạn!', 'Tạm biệt cô!']],
    ['Mẹ đi làm về rất mệt. Em nói:', 'Mẹ ngồi nghỉ đi ạ, con lấy nước cho mẹ.', ['Mẹ nấu cơm đi!', 'Mẹ ơi, con chơi tiếp nhé!']],
    ['Có bạn mới chuyển đến lớp. Em nói:', 'Chào bạn! Mình tên là Lan. Rất vui được làm quen với bạn.', ['Bạn là ai thế?', 'Bạn về chỗ đi.']],
    ['Đến nhà bạn chơi, bạn mời em ăn bánh. Em nói:', 'Mình cảm ơn bạn!', ['Bánh không ngon!', 'Mình xin lỗi!']],
    ['Ông bị ốm. Em nói với ông:', 'Ông ơi, ông mau khỏe nhé!', ['Ông ơi, chơi với cháu đi!', 'Chúc mừng ông!']],
    ['Em mời các bạn đến dự sinh nhật. Em nói:', 'Chủ nhật này, mời các bạn đến dự sinh nhật mình nhé!', ['Các bạn phải đến đấy!', 'Mình xin lỗi các bạn.']],
    ['Bạn nhặt được bút và trả lại em. Em nói:', 'Cảm ơn bạn nhiều!', ['Không sao đâu!', 'Chúc mừng bạn!']],
    ['Em đến lớp muộn. Em nói với cô:', 'Em xin lỗi cô vì đã đến muộn ạ.', ['Em chào cả lớp!', 'Cô ơi, em về đây!']],
    ['Bạn khen chiếc áo mới của em. Em đáp:', 'Cảm ơn bạn! Mẹ mua cho mình đấy.', ['Áo của bạn xấu lắm!', 'Mình xin lỗi!']],
    ['Ngày Tết, em chúc ông bà. Em nói:', 'Cháu chúc ông bà mạnh khỏe, sống lâu ạ!', ['Ông bà cho cháu lì xì đi!', 'Cháu xin lỗi ông bà!']],
    ['Bạn làm vỡ cốc của em và xin lỗi. Em đáp:', 'Không sao đâu, lần sau bạn cẩn thận nhé!', ['Bạn hư quá!', 'Chúc mừng bạn!']],
    ['Em muốn nhờ bạn giảng bài toán khó. Em nói:', 'Bạn giảng giúp mình bài toán này với!', ['Bạn làm hộ mình đi!', 'Bài này dễ ợt!']],
    ['Bố đưa em đi công viên chơi. Em nói:', 'Con cảm ơn bố ạ! Con vui lắm!', ['Con chào bố!', 'Con xin lỗi bố!']],
  ];

  // Ghép từ ngữ cột A với cột B để tạo câu (mỗi cặp chỉ ghép được một cách)
  D.sentPairs = {
    hd: [['Chú gà trống', 'gáy ò ó o.'], ['Chú mèo', 'kêu meo meo.'], ['Con chó', 'sủa gâu gâu.'], ['Con vịt', 'kêu cạp cạp.'], ['Chú ong', 'hút mật hoa.'],
      ['Đàn cá', 'bơi dưới nước.'], ['Con trâu', 'kéo cày.'], ['Bác sĩ', 'khám bệnh.'], ['Cô giáo', 'giảng bài.'], ['Chú phi công', 'lái máy bay.'],
      ['Bác thợ may', 'may quần áo.'], ['Chú đầu bếp', 'nấu ăn.']],
    dd: [['Bầu trời', 'xanh ngắt.'], ['Quả chanh', 'chua lè.'], ['Viên kẹo', 'ngọt lịm.'], ['Con voi', 'to khỏe.'], ['Con kiến', 'bé xíu.'],
      ['Cây tre', 'cao vút.'], ['Quả ớt', 'cay xè.'], ['Chiếc gối bông', 'mềm mại.'], ['Mặt trời', 'đỏ rực.'], ['Nước đá', 'lạnh buốt.']],
    gt: [['Bác sĩ', 'là người chữa bệnh.'], ['Cô giáo', 'là người dạy học.'], ['Bác nông dân', 'là người trồng lúa.'], ['Chú bộ đội', 'là người bảo vệ Tổ quốc.'],
      ['Hà Nội', 'là thủ đô của nước ta.'], ['Thư viện', 'là nơi để đọc sách.'], ['Bệnh viện', 'là nơi chữa bệnh.'], ['Bưu điện', 'là nơi gửi thư.']],
  };

  // Xếp tranh theo thứ tự câu chuyện (mỗi dãy 4 tranh, đúng thứ tự)
  D.storySeq = [
    ['🥚 Gà mẹ ấp trứng.', '🐣 Gà con mổ vỏ chui ra.', '🐥 Gà con theo mẹ đi kiếm mồi.', '🐔 Gà con lớn thành gà mẹ.'],
    ['🌰 Bé gieo hạt xuống đất.', '💧 Bé tưới nước cho hạt.', '🌱 Hạt nảy mầm.', '🌳 Cây lớn lên xanh tốt.'],
    ['⏰ Bé thức dậy.', '🪥 Bé đánh răng, rửa mặt.', '🥣 Bé ăn sáng.', '🎒 Bé đeo cặp đi học.'],
    ['✍️ Lan viết thư cho ông.', '✉️ Lan cho thư vào phong bì.', '📮 Mẹ gửi thư ở bưu điện.', '📬 Ông nhận được thư.'],
    ['🛒 Mẹ đi chợ mua thức ăn.', '🔪 Mẹ nhặt rau, thái thịt.', '🍳 Mẹ nấu cơm.', '🍚 Cả nhà ăn cơm.'],
    ['☁️ Mây đen kéo đến.', '🌧️ Trời đổ mưa to.', '🌤️ Mưa tạnh, trời hửng nắng.', '🌈 Cầu vồng hiện ra.'],
    ['🪁 Các bạn làm diều.', '🏃 Các bạn chạy ra bãi cỏ.', '🌬️ Gió thổi, diều bay lên cao.', '😄 Các bạn reo hò vui sướng.'],
    ['🐛 Sâu nhỏ ăn lá.', '🍃 Sâu nằm yên trong kén.', '🦋 Kén nở thành bướm.', '🌸 Bướm bay đi hút mật hoa.'],
    ['🧹 Bé quét nhà.', '🧺 Bé gấp quần áo.', '🪴 Bé tưới cây.', '😊 Mẹ khen bé ngoan.'],
    ['🎂 Mẹ làm bánh sinh nhật.', '🕯️ Bố cắm nến lên bánh.', '🎉 Cả nhà hát mừng sinh nhật bé.', '🍰 Bé cắt bánh mời mọi người.'],
  ];

  // Đoạn văn ngắn để sắp xếp câu (theo đề Luyện viết đoạn của từng bài)
  D.paras = {
    gioithieu: ['Mình tên là Minh Anh.', 'Năm nay mình học lớp 2A.', 'Mình thích vẽ tranh và đọc truyện.', 'Mình rất vui được làm quen với các bạn.'],
    viecnha: ['Hôm qua, em giúp mẹ dọn dẹp nhà cửa.', 'Đầu tiên, em quét nhà thật sạch.', 'Sau đó, em lau bàn ghế.', 'Mẹ khen em ngoan, em thấy rất vui.'],
    dihoc: ['Sáng nào em cũng dậy lúc sáu giờ.', 'Em đánh răng, rửa mặt.', 'Tiếp theo, em ăn sáng cùng cả nhà.', 'Cuối cùng, em đeo cặp và chào bố mẹ đi học.'],
    thethao: ['Giờ ra chơi, chúng em chơi đá cầu.', 'Các bạn đứng thành một vòng tròn.', 'Quả cầu bay qua bay lại rất vui mắt.', 'Chơi xong, ai cũng thấy khỏe khoắn.'],
    dodung: ['Em có một chiếc hộp bút màu xanh.', 'Hộp bút hình chữ nhật, có in hình chú gấu.', 'Mở hộp ra, em thấy bút chì, thước kẻ và cục tẩy.', 'Em giữ gìn hộp bút rất cẩn thận.'],
    dochoi: ['Đồ chơi em thích nhất là chú gấu bông.', 'Chú gấu có bộ lông màu nâu, mềm mại.', 'Tối nào em cũng ôm gấu đi ngủ.', 'Em sẽ giữ gìn chú gấu thật cẩn thận.'],
    nguoithan: ['Mẹ em là giáo viên.', 'Sáng sáng, mẹ đưa em đến trường.', 'Buổi tối, mẹ kèm em học bài.', 'Em rất yêu mẹ.'],
    rachoi: ['Trống báo giờ ra chơi vang lên.', 'Các bạn ùa ra sân trường.', 'Bạn thì nhảy dây, bạn thì đá cầu.', 'Hết giờ ra chơi, chúng em xếp hàng vào lớp.'],
    tinnhan: ['Mẹ ơi!', 'Con sang nhà bạn Lan học nhóm.', 'Năm giờ chiều con sẽ về ạ.', 'Con của mẹ, Minh.'],
    thiep: ['Ông bà kính yêu!', 'Nhân dịp năm mới, cháu kính chúc ông bà mạnh khỏe.', 'Cháu hứa sẽ chăm ngoan, học giỏi.', 'Cháu của ông bà, Minh Anh.'],
    chamcay: ['Nhà em có một cây hoa hồng.', 'Sáng nào em cũng tưới nước cho cây.', 'Thỉnh thoảng, em nhổ cỏ quanh gốc cây.', 'Nhờ em chăm sóc, cây ra nhiều hoa đẹp.'],
    convat: ['Nhà em nuôi một chú mèo.', 'Chú có bộ lông vàng óng.', 'Ban đêm, chú rình bắt chuột.', 'Em rất quý chú mèo.'],
    xinloi: ['Lan ơi!', 'Hôm qua mình lỡ làm rách quyển truyện của bạn.', 'Mình đã dán lại cẩn thận rồi.', 'Mình xin lỗi bạn nhé!'],
    moitruong: ['Chủ nhật vừa rồi, lớp em đi nhặt rác ở công viên.', 'Chúng em chia thành từng nhóm.', 'Mỗi nhóm nhặt rác ở một góc công viên.', 'Cuối buổi, công viên trở nên sạch đẹp.'],
    camon: ['Chúng cháu kính gửi các chú bộ đội hải quân!', 'Các chú ngày đêm canh giữ biển đảo quê hương.', 'Nhờ có các chú, chúng cháu được học tập yên vui.', 'Chúng cháu cảm ơn các chú rất nhiều!'],
    dichoi: ['Hè vừa rồi, cả nhà em đi biển.', 'Buổi sáng, em cùng bố tắm biển.', 'Buổi chiều, em xây lâu đài cát.', 'Em mong hè sau lại được đi biển.'],
    congviec: ['Bố em là bác sĩ.', 'Sáng sớm, bố đã đến bệnh viện.', 'Bố khám bệnh và chữa bệnh cho mọi người.', 'Em mong lớn lên sẽ giỏi giang như bố.'],
  };

  // Thêm bài đọc ngắn (tự soạn) để mỗi tuần có bài đọc cùng chủ điểm
  Object.assign(D.passages, {
    banmoi: { title: 'Bạn mới', text: 'Hôm nay, lớp em có một bạn mới tên là Hà. Hà từ quê ra thành phố học. Lúc đầu, Hà còn rụt rè. Giờ ra chơi, chúng em rủ Hà chơi nhảy dây. Hà cười rất tươi và cảm ơn các bạn.', qs: [
      ['Bạn mới của lớp em tên là gì?', 'Hà', ['Lan', 'Mai', 'Hoa']],
      ['Lúc đầu, Hà thế nào?', 'Còn rụt rè', ['Rất ồn ào', 'Rất nghịch ngợm', 'Rất buồn ngủ']],
      ['Giờ ra chơi, các bạn rủ Hà chơi gì?', 'Nhảy dây', ['Đá bóng', 'Trốn tìm', 'Kéo co']],
    ] },
    dochoi: { title: 'Chú rô-bốt', text: 'Sinh nhật em, bố tặng em một chú rô-bốt. Rô-bốt có thân màu bạc và đôi mắt xanh. Khi em bấm nút, rô-bốt biết đi và vẫy tay. Em đặt tên cho rô-bốt là Bin. Ngày nào em cũng chơi với Bin.', qs: [
      ['Ai tặng em chú rô-bốt?', 'Bố', ['Mẹ', 'Bà', 'Cô giáo']],
      ['Đôi mắt của rô-bốt màu gì?', 'Màu xanh', ['Màu đỏ', 'Màu vàng', 'Màu đen']],
      ['Em đặt tên cho rô-bốt là gì?', 'Bin', ['Bống', 'Bi', 'Na']],
    ] },
    ongem: { title: 'Ông của em', text: 'Ông em năm nay đã bảy mươi tuổi. Ông rất thích trồng cây. Sáng nào ông cũng ra vườn tưới cho những chậu hoa. Chiều chiều, ông dạy em chơi cờ. Em rất yêu ông.', qs: [
      ['Ông em năm nay bao nhiêu tuổi?', 'Bảy mươi tuổi', ['Sáu mươi tuổi', 'Tám mươi tuổi', 'Năm mươi tuổi']],
      ['Ông em thích làm gì?', 'Trồng cây', ['Đọc báo', 'Câu cá', 'Nấu ăn']],
      ['Chiều chiều, ông dạy em làm gì?', 'Chơi cờ', ['Đá bóng', 'Vẽ tranh', 'Bơi']],
    ] },
    tet: { title: 'Tết đến', text: 'Tết đến, nhà nào cũng sạch sẽ, gọn gàng. Bố treo câu đối đỏ trước cửa. Mẹ bày mâm ngũ quả. Em cùng chị gói bánh chưng với bà. Sáng mùng Một, em chúc Tết ông bà và được lì xì.', qs: [
      ['Bố treo gì trước cửa?', 'Câu đối đỏ', ['Đèn ông sao', 'Cờ hoa', 'Chuông gió']],
      ['Em cùng chị gói bánh gì với bà?', 'Bánh chưng', ['Bánh mì', 'Bánh trôi', 'Bánh xèo']],
      ['Sáng mùng Một, em làm gì?', 'Chúc Tết ông bà', ['Đi học', 'Đá bóng', 'Ngủ thật muộn']],
    ] },
    mualua: { title: 'Mùa lúa chín', text: 'Cuối hè, cánh đồng lúa chín vàng. Gió thổi, lúa gợn sóng như biển vàng. Các bác nông dân ra đồng gặt lúa từ sáng sớm. Lũ trẻ chạy theo nhặt những bông lúa rơi. Ai cũng vui vì được mùa.', qs: [
      ['Cuối hè, cánh đồng lúa thế nào?', 'Chín vàng', ['Xanh non', 'Khô héo', 'Ngập nước']],
      ['Các bác nông dân ra đồng làm gì?', 'Gặt lúa', ['Cấy lúa', 'Bắt cá', 'Thả diều']],
      ['Vì sao ai cũng vui?', 'Vì được mùa', ['Vì được nghỉ học', 'Vì trời mưa', 'Vì được đi chơi']],
    ] },
    dankien: { title: 'Đàn kiến', text: 'Dưới gốc cây có một đàn kiến đen. Những chú kiến xếp thành hàng dài. Chúng tha mồi về tổ để dành cho mùa đông. Gặp mồi to, cả đàn cùng nhau khiêng. Đàn kiến thật chăm chỉ và đoàn kết.', qs: [
      ['Đàn kiến ở đâu?', 'Dưới gốc cây', ['Trên mái nhà', 'Trong bếp', 'Bên bờ ao']],
      ['Đàn kiến tha mồi về tổ để làm gì?', 'Để dành cho mùa đông', ['Để chơi', 'Để cho chim ăn', 'Để vứt đi']],
      ['Gặp mồi to, đàn kiến làm thế nào?', 'Cả đàn cùng nhau khiêng', ['Bỏ đi chỗ khác', 'Gọi chim đến', 'Ngồi chờ']],
    ] },
    goidien: { title: 'Gọi điện cho bà', text: 'Bà nội của Nam ở quê. Tối thứ Bảy, Nam gọi điện thoại cho bà. Nam kể với bà rằng em được cô khen viết chữ đẹp. Bà rất vui và dặn Nam chăm ngoan. Nam hứa hè này sẽ về quê thăm bà.', qs: [
      ['Bà nội của Nam ở đâu?', 'Ở quê', ['Ở thành phố', 'Ở nước ngoài', 'Ở cùng nhà Nam']],
      ['Nam được cô khen điều gì?', 'Viết chữ đẹp', ['Hát hay', 'Vẽ đẹp', 'Chạy nhanh']],
      ['Nam hứa điều gì với bà?', 'Hè này về quê thăm bà', ['Gọi điện mỗi ngày', 'Đi chơi thật xa', 'Nuôi một chú mèo']],
    ] },
    bacsi: { title: 'Mẹ của Lan', text: 'Mẹ của Lan là bác sĩ ở bệnh viện. Mẹ thường đi làm từ sáng sớm. Mẹ khám bệnh và chăm sóc các bạn nhỏ bị ốm. Có hôm mẹ phải trực đêm ở bệnh viện. Lan rất tự hào về mẹ.', qs: [
      ['Mẹ của Lan làm nghề gì?', 'Bác sĩ', ['Giáo viên', 'Công nhân', 'Nông dân']],
      ['Mẹ chăm sóc cho ai?', 'Các bạn nhỏ bị ốm', ['Các chú bộ đội', 'Những chú mèo', 'Các bạn học sinh giỏi']],
      ['Lan cảm thấy thế nào về mẹ?', 'Rất tự hào', ['Rất buồn', 'Không vui', 'Rất sợ hãi']],
    ] },
    hoguom: { title: 'Hồ Gươm', text: 'Hồ Gươm nằm ở giữa Thủ đô Hà Nội. Mặt hồ rộng, nước xanh như ngọc. Giữa hồ có một ngôi tháp cổ. Quanh hồ có nhiều cây cổ thụ tỏa bóng mát. Sáng sớm, nhiều người ra hồ tập thể dục.', qs: [
      ['Hồ Gươm nằm ở đâu?', 'Giữa Thủ đô Hà Nội', ['Ở Huế', 'Ở Đà Nẵng', 'Ở Cần Thơ']],
      ['Nước hồ thế nào?', 'Xanh như ngọc', ['Đục ngầu', 'Đỏ như son', 'Đen sì']],
      ['Sáng sớm, nhiều người ra hồ làm gì?', 'Tập thể dục', ['Bơi thuyền', 'Câu cá', 'Bán hàng']],
    ] },
  });

  // Câu đúng (Đ) / sai (S) theo từng bài đọc ngắn (D.passages)
  D.readTF = {
    namhoc: [['Nam dậy thật sớm.', 'Đ'], ['Chiếc cặp của Nam màu đỏ.', 'S'], ['Cô giáo mỉm cười đón các bạn ở cổng trường.', 'Đ'], ['Hôm nay Nam vào học lớp 1.', 'S']],
    trongtruong: [['Chiếc trống ở góc sân trường.', 'Đ'], ['Cô giáo đánh trống báo giờ vào học.', 'S'], ['Nghe tiếng trống, các bạn xếp hàng vào lớp.', 'Đ'], ['Những ngày hè, chiếc trống kêu tùng tùng cả ngày.', 'S']],
    thuvien: [['Lớp em có một góc thư viện nhỏ.', 'Đ'], ['Trên giá chỉ có truyện tranh.', 'S'], ['Giờ ra chơi, em thường đến đây đọc truyện.', 'Đ'], ['Đọc xong, em mang sách về nhà.', 'S']],
    thadieu: [['Lũ trẻ thả diều vào một chiều hè.', 'Đ'], ['Cánh diều của Bin có hình con chim én.', 'S'], ['Diều bay lên cao giữa trời xanh.', 'Đ'], ['Cả bọn buồn bã đi về.', 'S']],
    buacom: [['Cả nhà em quây quần bên mâm cơm.', 'Đ'], ['Bố nấu canh rau.', 'S'], ['Em giúp bà xếp bát đũa.', 'Đ'], ['Bữa cơm gia đình rất buồn.', 'S']],
    baem: [['Bà em năm nay tám mươi tuổi.', 'Đ'], ['Tóc bà còn đen nhánh.', 'S'], ['Tối nào bà cũng kể chuyện cổ tích cho em nghe.', 'Đ'], ['Em không thích ở gần bà.', 'S']],
    muaxuan: [['Mùa xuân, cây cối đâm chồi nảy lộc.', 'Đ'], ['Hoa sen nở hồng khắp các ngõ phố.', 'S'], ['Chim én bay lượn trên bầu trời.', 'Đ'], ['Trời mùa xuân lạnh dần đi.', 'S']],
    chuong: [['Trong vườn có một chú ong vàng.', 'Đ'], ['Ong bay đi tìm hoa vào buổi tối.', 'S'], ['Ong mang mật hoa về tổ.', 'Đ'], ['Nhờ có ong, cây trong vườn bị héo.', 'S']],
    lathu: [['Ông nội của Lan sống ở quê.', 'Đ'], ['Lan vừa được điểm mười môn Tiếng Việt.', 'S'], ['Lan vẽ tặng ông bức tranh ngôi nhà.', 'Đ'], ['Bố giúp Lan gửi thư.', 'S']],
    haiquan: [['Bố của Hùng là bộ đội hải quân.', 'Đ'], ['Bố làm nhiệm vụ trên núi cao.', 'S'], ['Bố cùng đồng đội canh giữ biển đảo.', 'Đ'], ['Hùng không vui khi nghĩ về bố.', 'S']],
    queem: [['Quê em ở ven một dòng sông nhỏ.', 'Đ'], ['Hai bên bờ sông là những ngôi nhà cao tầng.', 'S'], ['Mùa gặt, lúa chín vàng óng.', 'Đ'], ['Chiều chiều, lũ trẻ đá bóng trên đê.', 'S']],
    daybien: [['Dưới đáy biển có rất nhiều loài vật.', 'Đ'], ['Cá nhỏ bơi lượn quanh chiếc thuyền.', 'S'], ['Sao biển nằm im trên cát.', 'Đ'], ['Cua bò thẳng về phía trước.', 'S']],
    banmoi: [['Hà từ quê ra thành phố học.', 'Đ'], ['Hà là bạn cũ của lớp.', 'S'], ['Các bạn rủ Hà chơi nhảy dây.', 'Đ'], ['Hà không thích chơi với các bạn.', 'S']],
    dochoi: [['Rô-bốt có thân màu bạc.', 'Đ'], ['Rô-bốt biết bay.', 'S'], ['Khi em bấm nút, rô-bốt vẫy tay.', 'Đ'], ['Mẹ tặng em chú rô-bốt.', 'S']],
    ongem: [['Sáng nào ông cũng tưới hoa.', 'Đ'], ['Ông không thích trồng cây.', 'S'], ['Ông dạy em chơi cờ.', 'Đ'], ['Ông em năm nay chín mươi tuổi.', 'S']],
    tet: [['Tết đến, nhà nào cũng sạch sẽ.', 'Đ'], ['Mẹ bày mâm ngũ quả.', 'Đ'], ['Em gói bánh chưng cùng ông.', 'S'], ['Sáng mùng Một, em không chúc Tết ai.', 'S']],
    mualua: [['Gió thổi, lúa gợn sóng.', 'Đ'], ['Các bác nông dân gặt lúa vào buổi tối.', 'S'], ['Lũ trẻ nhặt những bông lúa rơi.', 'Đ'], ['Năm nay mất mùa.', 'S']],
    dankien: [['Đàn kiến màu đen.', 'Đ'], ['Những chú kiến đi lộn xộn.', 'S'], ['Gặp mồi to, cả đàn cùng khiêng.', 'Đ'], ['Đàn kiến rất lười biếng.', 'S']],
    goidien: [['Nam gọi điện cho bà vào tối thứ Bảy.', 'Đ'], ['Nam viết thư cho bà.', 'S'], ['Bà dặn Nam chăm ngoan.', 'Đ'], ['Bà không vui khi nghe Nam kể.', 'S']],
    bacsi: [['Mẹ Lan làm việc ở bệnh viện.', 'Đ'], ['Mẹ đi làm lúc giữa trưa.', 'S'], ['Có hôm mẹ trực đêm ở bệnh viện.', 'Đ'], ['Lan không thích nghề của mẹ.', 'S']],
    hoguom: [['Giữa hồ có một ngôi tháp cổ.', 'Đ'], ['Quanh hồ không có cây nào.', 'S'], ['Mặt hồ rộng, nước xanh.', 'Đ'], ['Hồ Gươm ở thành phố Huế.', 'S']],
  };
})(window.App);
