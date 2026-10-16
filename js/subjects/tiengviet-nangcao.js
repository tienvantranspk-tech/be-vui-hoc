/* Tiếng Việt 2 – câu hỏi NÂNG CAO và THỬ THÁCH TƯ DUY.
   Từ khác loại, từ trái nghĩa – cùng nghĩa, hoàn thành tục ngữ, bộ phận câu trả lời câu hỏi (Ai? Làm gì? Thế nào? Ở đâu? Khi nào?),
   tìm từ viết sai chính tả, sắp xếp câu thành đoạn văn, giải câu đố, chọn từ tả âm thanh.
   Dạng bài giống vở bài tập: gạch dưới từ ngữ trong đoạn văn, gạch dưới bộ phận câu, Đ/S chính tả, điền dấu câu, điền từ trái nghĩa,
   hoàn thành tục ngữ, nhận biết mẫu câu.
   Câu đố, đoạn văn, câu mẫu đều do app tự soạn; tục ngữ là tục ngữ dân gian quen thuộc. */
(function (App) {
  'use strict';
  const U = App.U;
  const { pick, shuffle, sample, chance } = U;
  const D = App.TVData;
  const T = {};
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ================= Dữ liệu =================
  const ANTONYMS = [
    ['cao', 'thấp'], ['to', 'nhỏ'], ['dài', 'ngắn'], ['nóng', 'lạnh'], ['nhanh', 'chậm'], ['sáng', 'tối'], ['vui', 'buồn'],
    ['sạch', 'bẩn'], ['mới', 'cũ'], ['đẹp', 'xấu'], ['nặng', 'nhẹ'], ['cứng', 'mềm'], ['khô', 'ướt'], ['xa', 'gần'],
    ['đầy', 'vơi'], ['trên', 'dưới'], ['mở', 'đóng'], ['khóc', 'cười'], ['thắng', 'thua'], ['chăm chỉ', 'lười biếng'],
    ['dũng cảm', 'nhút nhát'], ['ngày', 'đêm'], ['đen', 'trắng'], ['già', 'trẻ'], ['béo', 'gầy'], ['đông', 'vắng'],
    ['ồn ào', 'yên tĩnh'], ['ngọt', 'đắng'], ['rộng', 'hẹp'], ['trước', 'sau'],
  ];
  const SYNONYMS = [
    ['chăm chỉ', 'siêng năng', 'cần cù'], ['to lớn', 'khổng lồ', 'to tướng'], ['nhỏ bé', 'bé nhỏ', 'tí hon'],
    ['xinh đẹp', 'xinh xắn', 'đẹp đẽ'], ['vui vẻ', 'vui tươi', 'hớn hở'], ['hiền lành', 'hiền hậu', 'hiền từ'],
    ['nhanh nhẹn', 'nhanh nhảu', 'lanh lợi'], ['bố', 'ba', 'cha'], ['yêu thương', 'thương yêu', 'yêu quý'],
    ['đất nước', 'tổ quốc', 'non sông'], ['trẻ em', 'trẻ con', 'nhi đồng'], ['im lặng', 'lặng im', 'yên lặng'],
    ['dũng cảm', 'gan dạ', 'can đảm'], ['thật thà', 'trung thực'], ['cẩn thận', 'cẩn trọng'],
  ];
  // Tục ngữ dân gian: [câu có chỗ trống, từ đúng, từ sai, ý nghĩa, nhóm]
  const PROVERBS = [
    ['Không thầy đố mày làm ?', 'nên', ['được', 'xong', 'hay'], 'Thầy cô dạy dỗ giúp ta thành người có ích.', 'truong'],
    ['Học thầy không tày học ?', 'bạn', ['sách', 'chữ', 'em'], 'Học hỏi từ bạn bè cũng rất quý.', 'truong'],
    ['Tiên học lễ, hậu học ?', 'văn', ['toán', 'chữ', 'vẽ'], 'Trước hết học lễ phép, sau đó học chữ.', 'truong'],
    ['Lá lành đùm lá ?', 'rách', ['xanh', 'vàng', 'non'], 'Người có điều kiện giúp đỡ người gặp khó khăn.', 'ban'],
    ['Một con ngựa đau, cả tàu bỏ ?', 'cỏ', ['ăn', 'chạy', 'ngủ'], 'Một người gặp chuyện buồn, mọi người cùng lo lắng, thương xót.', 'ban'],
    ['Thương người như thể thương ?', 'thân', ['cây', 'nhà', 'bạn'], 'Yêu thương người khác như yêu thương chính mình.', 'ban'],
    ['Anh em như thể tay ?', 'chân', ['mắt', 'tai', 'đầu'], 'Anh chị em gắn bó, yêu thương nhau như tay với chân.', 'nha'],
    ['Chị ngã em ?', 'nâng', ['cười', 'chạy', 'khóc'], 'Anh chị em luôn giúp đỡ nhau khi gặp khó khăn.', 'nha'],
    ['Công cha như núi Thái Sơn, nghĩa mẹ như nước trong ? chảy ra', 'nguồn', ['sông', 'biển', 'mưa'], 'Công ơn cha mẹ rất to lớn.', 'nha'],
    ['Nước chảy đá ?', 'mòn', ['tan', 'trôi', 'vỡ'], 'Kiên trì mãi thì việc khó cũng làm được.', 'chamchi'],
    ['Kiến tha lâu cũng đầy ?', 'tổ', ['nhà', 'hang', 'bát'], 'Chăm chỉ góp nhặt từng chút, lâu dần sẽ được nhiều.', 'chamchi'],
    ['Có công mài sắt, có ngày nên ?', 'kim', ['dao', 'búa', 'đinh'], 'Kiên trì, chăm chỉ thì việc khó mấy cũng làm được.', 'chamchi'],
    ['Có chí thì ?', 'nên', ['được', 'vui', 'giàu'], 'Có quyết tâm thì sẽ làm được việc mình muốn.', 'chamchi'],
    ['Uống nước nhớ ?', 'nguồn', ['sông', 'biển', 'mưa'], 'Khi được hưởng điều tốt đẹp, phải nhớ ơn người đã làm ra nó.', 'on'],
    ['Ăn quả nhớ kẻ trồng ?', 'cây', ['hoa', 'rau', 'lúa'], 'Nhớ ơn người đã vất vả làm ra thành quả cho mình.', 'on'],
    ['Đi một ngày đàng, học một sàng ?', 'khôn', ['chữ', 'bài', 'hay'], 'Đi đây đi đó giúp ta học được nhiều điều hay.', 'on'],
    ['Ăn có nhai, nói có ?', 'nghĩ', ['nghe', 'nhìn', 'cười'], 'Phải suy nghĩ cẩn thận trước khi nói.', 'on'],
    ['Tốt gỗ hơn tốt nước ?', 'sơn', ['sông', 'mưa', 'chè'], 'Tấm lòng tốt quý hơn vẻ đẹp bên ngoài.', 'on'],
  ];
  // Câu đố (app tự soạn): [câu đố, lời giải, emoji]
  const RIDDLES = [
    ['Con gì có cái vòi rất dài, tai to như chiếc quạt, chân to như cột nhà?', 'con voi', '🐘'],
    ['Con gì sáng sớm gáy “ò ó o” gọi mọi người thức dậy?', 'con gà trống', '🐓'],
    ['Con gì có cổ rất dài, ăn lá trên ngọn cây cao?', 'con hươu cao cổ', '🦒'],
    ['Con gì sống dưới nước, thở bằng mang, bơi bằng vây?', 'con cá', '🐟'],
    ['Con gì bò chậm, mang cả ngôi nhà trên lưng?', 'con ốc sên', '🐌'],
    ['Con gì chăm chỉ hút mật hoa, làm ra mật ngọt?', 'con ong', '🐝'],
    ['Con gì nhảy giỏi, có chiếc túi trước bụng để địu con?', 'con chuột túi', '🦘'],
    ['Cái gì có kim mà không khâu, ngày đêm tích tắc báo giờ?', 'cái đồng hồ', '⏰'],
    ['Cái gì ruột bằng chì, càng gọt càng ngắn, giúp em viết bài?', 'cây bút chì', '✏️'],
    ['Cái gì mở ra che mưa che nắng, gấp lại thì nhỏ gọn như cây gậy?', 'cái ô', '☂️'],
    ['Cái gì có bốn chân mà không biết đi, ngày ngày em ngồi học bên nó?', 'cái bàn', '🪑'],
    ['Quả gì vỏ xanh, ruột đỏ, hạt đen, ăn vào mùa hè rất mát?', 'quả dưa hấu', '🍉'],
    ['Quả gì vỏ có nhiều mắt, trên đầu có chùm lá xanh như chiếc vương miện?', 'quả dứa', '🍍'],
    ['Cái gì ban ngày sáng rực trên bầu trời, sưởi ấm cho muôn loài?', 'mặt trời', '☀️'],
    ['Cái gì ban đêm lúc tròn lúc khuyết, tỏa ánh sáng dịu dàng?', 'mặt trăng', '🌙'],
    ['Cái gì có nhiều trang, chứa bao điều hay, em đọc mỗi ngày?', 'quyển sách', '📖'],
  ];
  // Câu mẫu để hỏi bộ phận câu. Hoạt động: [khi nào, ai/con gì, làm gì, ở đâu]
  const ACT = [
    ['buổi sáng', 'chú mèo mướp', 'nằm sưởi nắng', 'ngoài hiên'], ['sáng sớm', 'đàn chim sẻ', 'ríu rít gọi nhau', 'trên cành cây'],
    ['chiều nay', 'bạn Minh', 'tưới cây', 'trong vườn'], ['đầu giờ', 'cả lớp em', 'tập thể dục', 'trên sân trường'],
    ['buổi tối', 'mẹ', 'nấu cơm', 'trong bếp'], ['mỗi sáng', 'ông nội', 'đọc báo', 'bên cửa sổ'],
    ['lúc bình minh', 'chú gà trống', 'cất tiếng gáy', 'trên đống rơm'], ['buổi trưa', 'đàn cá nhỏ', 'bơi tung tăng', 'dưới ao'],
    ['giờ ra chơi', 'các bạn', 'chơi nhảy dây', 'dưới gốc phượng'], ['chủ nhật', 'cả nhà em', 'đi dạo', 'trong công viên'],
  ];
  // Đặc điểm: [ai/cái gì, thế nào]
  const FEAT = [
    ['Bầu trời mùa thu', 'cao và xanh ngắt'], ['Chú thỏ con', 'rất nhanh nhẹn'], ['Mái tóc của bà', 'bạc trắng'],
    ['Những quả cam', 'chín vàng và mọng nước'], ['Dòng sông quê em', 'xanh biếc'], ['Cô giáo em', 'rất hiền'],
    ['Đôi mắt bé Na', 'đen láy'], ['Chiếc áo mới', 'thơm mùi vải'],
  ];
  // Giới thiệu: [ai/cái gì, là gì]
  const INTRO = [
    ['Bố em', 'bác sĩ'], ['Hoa phượng', 'loài hoa của mùa hè'], ['Bạn Lan', 'lớp trưởng lớp em'],
    ['Con trâu', 'người bạn của nhà nông'], ['Thư viện', 'nơi em mượn sách'], ['Bà nội', 'người kể chuyện hay nhất nhà em'],
  ];
  const Q = { ai: 'Ai (con gì, cái gì)?', lamgi: 'Làm gì?', thenao: 'Thế nào?', lagi: 'Là gì?', odau: 'Ở đâu?', khinao: 'Khi nào?' };
  // Đoạn văn ngắn (app tự soạn) – các câu theo đúng thứ tự
  const STORIES = [
    ['Sáng sớm, Lan thức dậy.', 'Lan đánh răng, rửa mặt.', 'Ăn sáng xong, Lan cùng mẹ đến trường.'],
    ['Hạt đậu được gieo xuống đất.', 'Mấy hôm sau, hạt nảy mầm.', 'Cây lớn dần và ra những quả đậu xanh.'],
    ['Trời bỗng nổi gió.', 'Mây đen kéo đến kín trời.', 'Một lúc sau, mưa rơi lộp độp.'],
    ['Nam lấy giấy màu và kéo.', 'Nam cắt, dán thành một chiếc đèn ông sao.', 'Tối Trung thu, Nam rước đèn cùng các bạn.'],
    ['Chim mẹ tha rơm về làm tổ.', 'Ít lâu sau, trong tổ có ba quả trứng nhỏ.', 'Rồi những chú chim non chào đời.'],
    ['Bố mua về một cây bàng nhỏ.', 'Hai bố con trồng cây ở góc sân.', 'Ngày nào bé cũng tưới nước cho cây.'],
    ['Giờ ra chơi, các bạn ùa ra sân.', 'Bạn thì nhảy dây, bạn thì đá cầu.', 'Tiếng trống vang lên, cả lớp lại vào học.'],
    ['Mẹ vo gạo rồi cho vào nồi.', 'Mẹ bật bếp nấu cơm.', 'Một lúc sau, cơm chín thơm phức.'],
  ];
  // Từ tả âm thanh, hình ảnh: [câu có chỗ trống, từ đúng, từ sai]
  const SOUNDS = [
    ['Tiếng mưa rơi ? trên mái tôn.', 'lộp độp', ['ríu rít', 'meo meo', 'leng keng']],
    ['Đàn chim hót ? trên cành.', 'líu lo', ['ầm ầm', 'lộp độp', 'tích tắc']],
    ['Chiếc đồng hồ kêu ? suốt ngày đêm.', 'tích tắc', ['líu lo', 'râm ran', 'ụt ịt']],
    ['Tiếng ve kêu ? báo hiệu mùa hè đến.', 'râm ran', ['thì thầm', 'lách tách', 'leng keng']],
    ['Gió thổi, lá cây kêu ?.', 'xào xạc', ['khanh khách', 'meo meo', 'leng keng']],
    ['Em bé cười ? khi được mẹ bế.', 'khanh khách', ['lộp độp', 'tích tắc', 'xào xạc']],
    ['Tiếng chuông xe đạp kêu ?.', 'kính coong', ['ò ó o', 'râm ran', 'lộp độp']],
    ['Củi cháy ? trong bếp.', 'lách tách', ['líu lo', 'ủn ỉn', 'ò ó o']],
    ['Mặt trời ? chiếu sáng khắp cánh đồng.', 'rực rỡ', ['ồn ào', 'mềm mại', 'lạnh lẽo']],
    ['Cánh đồng lúa chín ? như một tấm thảm.', 'vàng óng', ['đen sì', 'tím ngắt', 'xám xịt']],
    ['Chiếc lá vàng ? rơi xuống mặt hồ.', 'nhẹ nhàng', ['ầm ầm', 'nặng nề', 'ồn ào']],
    ['Bạn Minh rất ?, gặp ai cũng chào hỏi lễ phép.', 'ngoan', ['lười', 'nghịch', 'chậm']],
  ];

  // ================= Các dạng câu hỏi =================
  const CLASS = { suvat: 'chỉ sự vật', hoatdong: 'chỉ hoạt động', dacdiem: 'chỉ đặc điểm' };
  // Tìm từ khác loại (sự vật / hoạt động / đặc điểm)
  T.oddClass = (...classes) => () => {
    const [main, odd] = sample(classes, 2);
    const three = sample(D.words[main], 3), x = pick(D.words[odd]);
    return { type: 'choice', skill: 'nc.tv.tu', prompt: 'Từ ngữ nào không cùng nhóm với các từ ngữ còn lại?', options: shuffle([...three, x]), answer: x, optStyle: 'text',
      hint: 'Xem mỗi từ chỉ sự vật, chỉ hoạt động hay chỉ đặc điểm.', explain: `“${x}” là từ ngữ ${CLASS[odd]}; các từ còn lại là từ ngữ ${CLASS[main]}.` };
  };
  // Tìm từ khác loại theo chủ đề
  T.oddTopic = (...pairs) => () => {
    const [a, b] = shuffle(pick(pairs));
    const ta = D.topics[a], tb = D.topics[b];
    const three = sample(ta.words.filter((w) => !tb.words.includes(w)), 3), x = pick(tb.words.filter((w) => !ta.words.includes(w)));
    return { type: 'choice', skill: 'nc.tv.tu', prompt: 'Từ ngữ nào không cùng nhóm với các từ ngữ còn lại?', options: shuffle([...three, x]), answer: x, optStyle: 'text',
      hint: 'Ba từ cùng chỉ một nhóm sự vật, một từ thuộc nhóm khác.', explain: `“${x}” chỉ ${tb.name}; các từ còn lại chỉ ${ta.name}.` };
  };
  T.antonym = () => () => {
    const pr = pick(ANTONYMS), flip = Math.random() < 0.5, w = flip ? pr[1] : pr[0], ans = flip ? pr[0] : pr[1];
    const wrong = sample(ANTONYMS.filter((p) => p !== pr).flat(), 3);
    return { type: 'choice', skill: 'nc.tv.trainghia', prompt: `Từ nào có nghĩa trái ngược với từ “${w}”?`, options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text',
      hint: 'Từ trái nghĩa có nghĩa ngược hẳn lại, ví dụ: to – nhỏ.', explain: `“${w}” và “${ans}” là hai từ có nghĩa trái ngược nhau.` };
  };
  T.synonym = () => () => {
    const g = pick(SYNONYMS), [w, ans] = sample(g, 2);
    const wrong = sample(SYNONYMS.filter((x) => x !== g).flat(), 3);
    return { type: 'choice', skill: 'nc.tv.dongnghia', prompt: `Từ nào có nghĩa giống với từ “${w}”?`, options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text',
      hint: 'Từ cùng nghĩa có nghĩa giống hoặc gần giống nhau, ví dụ: chăm chỉ – siêng năng.', explain: `“${w}” và “${ans}” là hai từ có nghĩa giống nhau.` };
  };
  T.proverb = (...groups) => () => {
    const [s, ans, wrong, mean] = pick(PROVERBS.filter((p) => !groups.length || groups.includes(p[4])));
    const full = s.replace('?', ans);
    return { type: 'choice', skill: 'nc.tv.tucngu', prompt: 'Chọn từ thích hợp để hoàn thành câu tục ngữ:', big: s, bigText: true, slotPlaceholder: ' ',
      options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text', speak: 'Chọn từ thích hợp để hoàn thành câu tục ngữ: ' + s.replace('?', '…'),
      hint: 'Đọc cả câu, nhớ lại câu tục ngữ mà ông bà, thầy cô hay nói.', explain: `${full}.\nÝ nói: ${mean}` };
  };
  T.riddle = () => () => {
    const r = pick(RIDDLES), wrong = sample(RIDDLES.filter((x) => x !== r), 3).map((x) => x[1]);
    return { type: 'choice', skill: 'nc.tv.caudo', prompt: `Giải câu đố: ${r[0]}`, options: shuffle([r[1], ...wrong]), answer: r[1], optStyle: 'text',
      hint: 'Đọc kĩ từng chi tiết trong câu đố và nghĩ xem con vật / đồ vật nào có đủ các chi tiết đó.', explain: `Đó là ${r[1]} ${r[2]}.` };
  };
  // Bộ phận in trong ngoặc trả lời câu hỏi nào? level: 1 giới thiệu, 2 + hoạt động, 3 + đặc điểm, 4 + ở đâu, khi nào
  T.questionPart = (level) => () => {
    const kinds = ['intro', 'act', 'feat'].slice(0, Math.min(level, 3));
    const kind = pick(kinds);
    let sentence, part, ans, opts;
    if (kind === 'intro') {
      const [s, n] = pick(INTRO);
      sentence = `${s} là ${n}.`;
      [part, ans] = Math.random() < 0.5 ? [s, Q.ai] : [n, Q.lagi];
      opts = [Q.ai, Q.lagi, Q.lamgi, Q.thenao];
    } else if (kind === 'feat') {
      const [s, a] = pick(FEAT);
      sentence = `${s} ${a}.`;
      [part, ans] = Math.random() < 0.5 ? [s, Q.ai] : [a, Q.thenao];
      opts = [Q.ai, Q.thenao, Q.lamgi, Q.lagi];
    } else {
      const [t, s, v, w] = pick(ACT);
      sentence = `${cap(t)}, ${s} ${v} ${w}.`;
      const parts = [[s, Q.ai], [v, Q.lamgi]];
      if (level >= 4) parts.push([w, Q.odau], [cap(t), Q.khinao]); // viết như trong câu (đứng đầu câu nên viết hoa)
      [part, ans] = pick(parts);
      opts = level >= 4 ? [Q.ai, Q.lamgi, Q.odau, Q.khinao] : [Q.ai, Q.lamgi, Q.thenao, Q.lagi];
    }
    return { type: 'choice', skill: 'nc.tv.cauhoi', prompt: `Trong câu dưới đây, bộ phận “${part}” trả lời cho câu hỏi nào?`, big: sentence, bigText: true, bigRaw: true,
      options: shuffle(opts), answer: ans, optStyle: 'text', hint: 'Thử đặt câu hỏi cho bộ phận đó: Ai? Làm gì? Thế nào? Là gì? Ở đâu? Khi nào?',
      explain: `“${part}” trả lời cho câu hỏi “${ans}”.` };
  };
  // Từ nào viết sai chính tả? (ba từ đúng, một từ sai)
  function spellWords(id) {
    const r = D.spell[id];
    return r.items.map((it) => {
      const wrong = r.pair ? r.pair.filter((x) => x !== it[1]) : [].concat(it[2]);
      return { right: it[0].replace('?', it[1]), wrongs: wrong.map((w) => it[0].replace('?', w)) };
    });
  }
  T.misspell = (...ids) => () => {
    const pool = ids.flatMap(spellWords);
    const rights = U.uniq(pool.map((x) => x.right)); // một từ có thể có mặt ở nhiều quy tắc chính tả
    let bad, wrongWord;
    do { bad = pick(pool); wrongWord = pick(bad.wrongs); } while (rights.includes(wrongWord));
    const goods = sample(rights.filter((w) => w !== bad.right), 3);
    return { type: 'choice', skill: 'nc.tv.chinhta', prompt: 'Từ ngữ nào viết sai chính tả?', options: shuffle([wrongWord, ...goods]), answer: wrongWord, optStyle: 'text',
      hint: 'Đọc thật kĩ từng chữ, nhớ các quy tắc chính tả đã học.', explain: `“${wrongWord}” viết sai. Viết đúng là: ${bad.right}.` };
  };
  // Sắp xếp các câu thành đoạn văn
  T.paragraph = () => () => {
    const s = pick(STORIES);
    let items;
    do { items = shuffle(s); } while (items.join('|') === s.join('|'));
    return { type: 'order', skill: 'nc.tv.doanvan', prompt: 'Sắp xếp các câu thành đoạn văn đúng thứ tự:', items, answer: s, tileClass: 'text',
      speak: 'Sắp xếp các câu thành đoạn văn đúng thứ tự.', hint: 'Việc gì xảy ra trước thì kể trước. Chú ý các từ: sáng sớm, sau đó, một lúc sau…',
      answerLabel: s.join(' '), explain: s.join(' ') };
  };
  T.sound = () => () => {
    const [s, ans, wrong] = pick(SOUNDS);
    return { type: 'choice', skill: 'nc.tv.tuongthanh', prompt: 'Chọn từ thích hợp điền vào chỗ trống:', big: s, bigText: true, slotPlaceholder: ' ',
      options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text', speak: 'Chọn từ thích hợp điền vào chỗ trống: ' + s.replace('?', '…'),
      hint: 'Đọc cả câu và tưởng tượng âm thanh, hình ảnh đó.', explain: s.replace('?', ans) };
  };

  // ================= Dạng bài giống vở bài tập (nâng cao) =================
  // Gạch dưới từ ngữ trong đoạn văn 2–3 câu, gạch dưới bộ phận câu trong câu có 4 bộ phận, Đ/S chính tả trộn nhiều cặp âm vần,
  // điền dấu câu (. , ? !), điền từ trái nghĩa vào câu, hoàn thành hai câu tục ngữ, nhận biết mẫu câu có "bẫy".
  // Đoạn văn, câu văn đều do app tự soạn.

  // Đoạn văn có đánh dấu từ ngữ: {từ|sv} chỉ sự vật, {từ|hd} chỉ hoạt động, {từ|dd} chỉ đặc điểm (mọi từ thuộc ba nhóm đều được đánh dấu)
  const NC_PARA = [
    '{Đàn gà con|sv} {lông|sv} {vàng óng|dd}. {Gà mẹ|sv} {dẫn|hd} {đàn con|sv} {đi|hd} {kiếm mồi|hd} ngoài {vườn|sv}.',
    '{Bà|sv} {trồng|hd} {cây cam|sv} ở {góc vườn|sv}. {Quả cam|sv} {chín|dd} {vàng|dd} và rất {ngọt|dd}. {Mẹ|sv} {hái|hd} {cam|sv} {biếu|hd} {hàng xóm|sv}.',
    '{Mặt trời|sv} {mọc|hd}. {Những tia nắng|sv} {ấm áp|dd} {chiếu|hd} xuống {cánh đồng|sv}. {Bác nông dân|sv} {ra|hd} {đồng|sv} {cấy lúa|hd}.',
    '{Dòng sông|sv} {hiền hòa|dd} {chảy|hd} qua {làng|sv}. {Mặt nước|sv} {trong xanh|dd}. {Lũ trẻ|sv} {thả|hd} {thuyền giấy|sv} trên {sông|sv}.',
    '{Các bạn|sv} {chăm chú|dd} {nghe|hd} {cô giáo|sv} {giảng bài|hd}. {Bạn Lan|sv} {giơ tay|hd} {phát biểu|hd}. {Cô|sv} {khen|hd} {Lan|sv} rất {giỏi|dd}.',
    '{Chú chim sâu|sv} {nhỏ xíu|dd} {nhảy|hd} trên {cành cây|sv}. {Tiếng hót|sv} của {chim|sv} {trong trẻo|dd} và {vui tai|dd}.',
    '{Bố|sv} {sửa|hd} {chiếc xe đạp|sv} {cũ|dd}. {Bé Na|sv} {đưa|hd} {cờ lê|sv} cho {bố|sv}. {Chiếc xe|sv} lại {chạy|hd} {êm|dd} như {mới|dd}.',
    '{Con trâu|sv} {to|dd} {khỏe|dd} {kéo|hd} {cày|sv} trên {ruộng|sv}. {Cậu bé|sv} {ngồi|hd} trên {lưng trâu|sv} {thổi sáo|hd}.',
    '{Gió|sv} {thổi|hd} {nhè nhẹ|dd}. {Những bông hoa|sv} {đỏ thắm|dd} {đung đưa|hd} trong {vườn|sv}. {Đàn bướm|sv} {bay|hd} {rập rờn|dd}.',
    '{Ông|sv} {đọc|hd} {báo|sv} bên {cửa sổ|sv}. {Mái tóc|sv} của {ông|sv} {bạc trắng|dd}. {Ông|sv} {cười|hd} rất {hiền|dd}.',
    '{Cây phượng|sv} {già|dd} {đứng|hd} ở {góc sân trường|sv}. {Hoa phượng|sv} {nở|hd} {đỏ rực|dd}. {Các bạn|sv} {nhặt|hd} {cánh hoa|sv} {ép|hd} vào {vở|sv}.',
    '{Chiếc diều|sv} {xanh|dd} {bay|hd} {cao|dd} trên {bầu trời|sv}. {Hai bạn nhỏ|sv} {reo hò|hd} {vui sướng|dd}.',
  ];
  const NC_CLASS = { sv: 'chỉ sự vật', hd: 'chỉ hoạt động', dd: 'chỉ đặc điểm' };
  const NC_CLASS_HINT = {
    sv: 'Từ chỉ sự vật là tên gọi của người, con vật, đồ vật, cây cối, cảnh vật…',
    hd: 'Từ chỉ hoạt động cho biết người, con vật, đồ vật đang làm gì.',
    dd: 'Từ chỉ đặc điểm cho biết màu sắc, hình dáng, tính nết… thế nào.',
  };
  // Tách đoạn văn thành các mục: từ được đánh dấu là một mục, chữ khác tách theo tiếng, dấu câu không chạm được
  function paraItems(text) {
    const out = [];
    const re = /\{([^}|]+)\|(\w+)\}|([^\s{}]+)/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1]) { out.push({ t: m[1], tag: m[2] }); continue; }
      const mm = /^(.*?)([.,!?:;…]*)$/.exec(m[3]);
      if (mm[1]) out.push({ t: mm[1], tag: '' });
      if (mm[2]) out.push({ t: mm[2], punct: true });
    }
    return out;
  }
  T.ncUnderline = (...classes) => () => {
    let text, cls, tk;
    do {
      text = pick(NC_PARA);
      cls = pick(classes);
      tk = paraItems(text);
    } while (tk.filter((x) => x.tag === cls).length < 2);
    const items = tk.map((x) => (x.punct ? { t: x.t, ok: null } : { t: x.t, ok: x.tag === cls }));
    const ans = tk.filter((x) => x.tag === cls).map((x) => x.t);
    const plainText = text.replace(/\{([^}|]+)\|\w+\}/g, '$1');
    return { type: 'pick', mode: 'inline', items, answer: ans, skill: 'nc.tv.tuloai',
      prompt: `Gạch dưới tất cả các từ ngữ ${NC_CLASS[cls]} trong đoạn văn.`, sub: `Đoạn văn có ${ans.length} từ ngữ ${NC_CLASS[cls]}. Chạm để gạch dưới, rồi bấm Kiểm tra.`,
      speak: `Gạch dưới tất cả các từ ngữ ${NC_CLASS[cls]} trong đoạn văn: ${plainText}`, hint: NC_CLASS_HINT[cls],
      explain: `Từ ngữ ${NC_CLASS[cls]}: ${ans.join(', ')}.` };
  };

  // Gạch dưới bộ phận câu trả lời cho câu hỏi Ai? Làm gì? Ở đâu? Khi nào? Thế nào? (bé chạm từng tiếng)
  // level 2: hỏi Ai?, Làm gì? · level 3: thêm Thế nào? · level 4: thêm Ở đâu?, Khi nào?
  T.ncPartPick = (level) => () => {
    const words = (s, ok) => s.split(' ').map((t) => ({ t, ok }));
    if (level >= 3 && chance(0.3)) {
      const [s, a] = pick(FEAT), askSubj = chance(0.5), q = askSubj ? Q.ai : Q.thenao;
      const items = [...words(s, askSubj), ...words(a, !askSubj), { t: '.', ok: null }];
      const part = askSubj ? s : a;
      return { type: 'pick', mode: 'inline', items, answer: [part], skill: 'nc.tv.cauhoi',
        prompt: `Gạch dưới bộ phận câu trả lời cho câu hỏi “${q}”`, sub: 'Chạm vào từng tiếng của bộ phận đó, rồi bấm Kiểm tra.',
        speak: `Gạch dưới bộ phận câu trả lời cho câu hỏi ${q.replace('?', '')}. Câu: ${s} ${a}.`,
        hint: askSubj ? 'Hỏi: “Cái gì (con gì, ai) thế nào?” – phần trả lời đứng đầu câu.' : `Hỏi: “${s} thế nào?” – phần trả lời đứng sau.`,
        explain: `${q} → ${part}` };
    }
    const [t, s, v, w] = pick(ACT);
    const asks = [[s, Q.ai], [v, Q.lamgi]];
    if (level >= 4) asks.push([w, Q.odau], [cap(t), Q.khinao]);
    const [part, q] = pick(asks);
    const items = [...words(cap(t), part === cap(t)), { t: ',', ok: null }, ...words(s, part === s), ...words(v, part === v), ...words(w, part === w), { t: '.', ok: null }];
    return { type: 'pick', mode: 'inline', items, answer: [part], skill: 'nc.tv.cauhoi',
      prompt: `Gạch dưới bộ phận câu trả lời cho câu hỏi “${q}”`, sub: 'Chạm vào từng tiếng của bộ phận đó, rồi bấm Kiểm tra.',
      speak: `Gạch dưới bộ phận câu trả lời cho câu hỏi ${q.replace('?', '')}. Câu: ${cap(t)}, ${s} ${v} ${w}.`,
      hint: 'Thử đặt câu hỏi rồi tìm phần trả lời: Ai? (người, con vật) – Làm gì? (hoạt động) – Ở đâu? (nơi chốn) – Khi nào? (thời gian).',
      explain: `${q} → ${part}` };
  };

  // Đ/S chính tả: mỗi dòng một cặp âm vần khác nhau (bỏ hình để bé phải đọc kĩ)
  function spellPool(ids) {
    return ids.flatMap((id) => {
      const r = D.spell[id];
      return r.items.map((it) => ({ id, right: it[0].replace('?', it[1]),
        wrongs: (r.pair ? r.pair.filter((x) => x !== it[1]) : [].concat(it[2])).map((w) => it[0].replace('?', w)) }));
    });
  }
  T.ncSpellRows = (...ids) => () => {
    const pool = spellPool(ids), rights = new Set(pool.map((x) => x.right));
    for (let t = 0; t < 40; t++) {
      const rules = sample(U.uniq(pool.map((x) => x.id)), Math.min(5, U.uniq(pool.map((x) => x.id)).length));
      const picks = rules.map((id) => pick(pool.filter((x) => x.id === id)));
      if (picks.length < 4) { while (picks.length < 4) { const x = pick(pool); if (!picks.includes(x)) picks.push(x); } }
      const wrong = new Set(sample(U.range(0, picks.length - 1), U.rand(2, 3)));
      const rows = picks.map((x, i) => {
        const w = wrong.has(i) ? pick(x.wrongs.filter((y) => !rights.has(y))) : null;
        return { t: w || x.right, a: w ? 'S' : 'Đ', right: x.right };
      });
      if (new Set(rows.map((r) => r.a)).size < 2 || new Set(rows.map((r) => r.t)).size < rows.length) continue;
      return { type: 'rows', items: rows.map(({ t: tt, a }) => ({ t: tt, a })), answer: rows.map((r) => r.a), skill: 'nc.tv.chinhta',
        prompt: 'Đ, S?', sub: 'Từ ngữ viết đúng chính tả chọn Đ, viết sai chọn S. Các dòng thuộc nhiều quy tắc chính tả khác nhau!',
        hint: 'Đọc chậm từng tiếng. Nhớ: k, gh, ngh đứng trước i, e, ê; phân biệt ch/tr, s/x, l/n, r/d/gi, dấu hỏi/dấu ngã…',
        explain: rows.map((r) => (r.a === 'Đ' ? `${r.t} → Đ` : `${r.t} → S (viết đúng: ${r.right})`)).join('\n') };
    }
    return T.misspell(...ids)();
  };

  // Điền dấu câu vào đoạn văn: [.] [,] [?] [!] là chỗ trống. Dấu phẩy chỉ dùng để ngăn cách các từ ngữ cùng loại.
  const NC_PUNCT4 = [
    'Chao ôi, vườn hoa đẹp quá[!] Trong vườn có hoa hồng[,] hoa cúc[,] hoa lan và hoa huệ[.] Bạn thích loài hoa nào nhất[?]',
    'Hôm nay là sinh nhật Lan[.] Lan được tặng búp bê[,] gấu bông[,] hộp màu và một quyển truyện[.] Ôi, quà nhiều quá[!] Ai đã tặng Lan quyển truyện[?]',
    'Mẹ hỏi: “Con muốn mang gì đi dã ngoại[?]” Em đáp: “Con mang bánh mì[,] sữa[,] nước cam và quả táo ạ[.]” Mẹ khen: “Con chuẩn bị giỏi quá[!]”',
    'Nhà bác Ba nuôi gà[,] vịt[,] ngan và ngỗng[.] Sáng nào gà trống cũng gáy vang[.] A, đàn vịt con xinh quá[!] Đàn vịt có bao nhiêu con nhỉ[?]',
    'Hoan hô đội bóng lớp 2A[!] Các bạn Minh[,] Hùng[,] Tú và Việt đã chơi rất hay[.] Bạn nào ghi bàn thắng đầu tiên[?] Đó là bạn Minh[.]',
    'Thư viện trường em có truyện cổ tích[,] truyện tranh[,] sách khoa học và báo thiếu nhi[.] Em hỏi cô: “Em mượn quyển sách này được không ạ[?]” Ôi, em vui quá[!]',
    'Mâm ngũ quả ngày Tết có chuối[,] bưởi[,] cam và quýt[.] Em hỏi mẹ: “Vì sao Tết lại bày mâm ngũ quả hả mẹ[?]” A, thì ra là vậy[!]',
    'Ôi, biển xanh quá[!] Trên bãi cát có còng[,] ốc[,] sao biển và vỏ sò[.] Bố ơi, sao biển có mấy cánh[?] Sao biển có năm cánh con ạ[.]',
    'Đồ dùng học tập của em gồm bút chì[,] thước kẻ[,] tẩy và bảng con[.] Bạn Hà hỏi em: “Cậu có bút màu đỏ không[?]” Em cho Hà mượn bút[.] Hà nói: “Cậu tốt quá[!]”',
    'Sở thú có voi[,] hổ[,] hươu cao cổ và khỉ[.] Chú khỉ đu cành rất giỏi[.] Ôi, chú khỉ nghịch quá[!] Con voi nặng bao nhiêu ki-lô-gam nhỉ[?]',
  ];
  const NC_PUNCT3 = [
    'Ôi, chiếc cặp mới đẹp quá[!] Ai mua cho em chiếc cặp này[?] Mẹ mua cho em đấy[.]',
    'Bạn Minh hỏi: “Nhà cậu có nuôi con gì không[?]” Lan đáp: “Nhà tớ nuôi một chú mèo[.]” Minh reo lên: “Thích quá[!]”',
    'Trời mưa to quá[!] Bố có mang áo mưa không[?] Bố đã mang áo mưa rồi[.]',
    'Hoan hô, đội em thắng rồi[!] Ai đã ghi bàn[?] Bạn Hùng ghi bàn đấy[.] Cả đội ôm nhau vui mừng[.]',
    'Ồ, cây xoài sai quả quá[!] Ai trồng cây xoài này[?] Ông nội trồng cây xoài từ ngày bố còn nhỏ[.]',
    'Chao ôi, ông trăng tròn quá[!] Ông trăng ở xa hay ở gần hả bố[?] Ông trăng ở rất xa con ạ[.]',
  ];
  T.ncPunct = (n) => () => {
    const text = pick(n === 4 ? NC_PUNCT4 : NC_PUNCT3);
    // ô dấu câu dính liền với chữ đứng trước (không bị rơi xuống đầu dòng)
    const parts = [];
    let last = 0, m;
    const re = /\[([.,?!])\]/g;
    while ((m = re.exec(text))) {
      const before = text.slice(last, m.index), mm = /^([\s\S]*?)(\S*)$/.exec(before);
      if (mm[1]) parts.push(mm[1]);
      parts.push([mm[2], { a: m[1] }]);
      last = re.lastIndex;
    }
    if (last < text.length) parts.push(text.slice(last));
    const q = { type: 'cloze', parts, bank: n === 4 ? ['.', ',', '?', '!'] : ['.', '?', '!'], reuse: true, blank: 'punct', skill: 'nc.tv.dau',
      prompt: n === 4 ? 'Điền dấu chấm, dấu phẩy, dấu chấm hỏi hay dấu chấm than vào mỗi ô trống?' : 'Điền dấu chấm, dấu chấm hỏi hay dấu chấm than vào mỗi ô trống?',
      sub: 'Chạm vào ô trống, rồi chạm vào dấu câu.', speak: 'Chọn dấu câu thích hợp cho mỗi ô trống trong đoạn văn.',
      hint: 'Câu kể: dấu chấm. Câu hỏi (ai, gì, nào, không, chưa, mấy…): dấu chấm hỏi. Câu khen, reo vui (ôi, quá…): dấu chấm than.'
        + (n === 4 ? ' Ngăn cách các từ ngữ cùng loại: dấu phẩy.' : ''),
      explain: 'Viết đúng: ' + text.replace(/\[([.,?!])\]/g, '$1') };
    q.answer = App.QTypes.cloze.collect(parts);
    return q;
  };

  // Điền từ trái nghĩa vào câu: [đầu câu, từ cần điền, cuối câu, nhóm nghĩa]. Mỗi bài lấy các câu thuộc nhóm nghĩa khác nhau
  // (và thẻ nhiễu cũng khác nhóm) để mỗi chỗ trống chỉ có một cách điền.
  const NC_ANTO = [
    ['Con voi thì to, con kiến thì ', 'nhỏ', '.', 'co'], ['Cây cau thì cao, cây ớt thì ', 'thấp', '.', 'co'], ['Mùa hè trời nóng, mùa đông trời ', 'lạnh', '.', 'troi'],
    ['Thỏ chạy nhanh, rùa bò ', 'chậm', '.', 'toc'], ['Ban ngày trời sáng, ban đêm trời ', 'tối', '.', 'troi'], ['Chiếc áo mới giặt thì sạch, chiếc áo dính bùn thì ', 'bẩn', '.', 'sach'],
    ['Nhà bạn Lan ở gần trường, nhà bạn Nam ở ', 'xa', ' trường.', 'xa'], ['Bông thì nhẹ, đá thì ', 'nặng', '.', 'nang'], ['Đá thì cứng, bông thì ', 'mềm', '.', 'cung'],
    ['Đường làng thì hẹp, đường phố thì ', 'rộng', '.', 'co'], ['Giờ ra chơi sân trường ồn ào, giờ học sân trường ', 'yên tĩnh', '.', 'on'],
    ['Được điểm mười, em rất vui. Làm mất bút, em rất ', 'buồn', '.', 'vui'], ['Sợi dây này dài, sợi dây kia ', 'ngắn', '.', 'co'], ['Viên kẹo thì ngọt, viên thuốc thì ', 'đắng', '.', 'vi'],
  ];
  T.ncAntonymCloze = () => () => {
    let pk;
    do { pk = sample(NC_ANTO, 3); } while (new Set(pk.map((x) => x[3])).size < 3);
    const fields = new Set(pk.map((x) => x[3]));
    const extra = sample(NC_ANTO.filter((x) => !fields.has(x[3])).map((x) => x[1]), 2);
    const parts = [];
    pk.forEach(([pre, a, post], i) => { if (i) parts.push('\n'); parts.push(pre, { a }, post); });
    const ans = pk.map((x) => x[1]);
    return { type: 'cloze', parts, bank: shuffle([...ans, ...extra]), answer: ans, textClass: 'lines', skill: 'nc.tv.trainghia',
      prompt: 'Điền từ có nghĩa trái ngược vào chỗ trống.', sub: 'Chạm vào chỗ trống, rồi chạm vào từ ngữ. Có thẻ không dùng đến.',
      speak: 'Điền từ có nghĩa trái ngược vào chỗ trống trong mỗi câu.', hint: 'Mỗi câu so sánh hai sự vật trái ngược nhau. Ví dụ: to – nhỏ, nóng – lạnh.',
      explain: pk.map(([pre, a, post]) => pre + a + post).join('\n') };
  };

  // Hoàn thành hai câu tục ngữ
  T.ncProverbCloze = (...groups) => () => {
    const pool = PROVERBS.filter((p) => !groups.length || groups.includes(p[4]));
    let two;
    do { two = sample(pool, 2); } while (two[0][1] === two[1][1]);
    const ans = two.map((p) => p[1]);
    const extra = sample(U.uniq(two.flatMap((p) => p[2])).filter((w) => !ans.includes(w)), 2);
    const parts = [];
    two.forEach(([s, a], i) => { if (i) parts.push('\n'); const [pre, post] = s.split('?'); parts.push('• ' + pre, { a }, post + '.'); });
    return { type: 'cloze', parts, bank: shuffle([...ans, ...extra]), answer: ans, textClass: 'lines', skill: 'nc.tv.tucngu',
      prompt: 'Chọn từ ngữ thích hợp để hoàn thành hai câu tục ngữ.', sub: 'Chạm vào chỗ trống, rồi chạm vào từ. Có thẻ không dùng đến.',
      speak: 'Chọn từ thích hợp để hoàn thành hai câu tục ngữ: ' + two.map((p) => p[0].replace('?', '…')).join('. '),
      hint: 'Đọc cả câu, nhớ lại câu tục ngữ mà ông bà, thầy cô hay nói.',
      explain: two.map(([s, a, , mean]) => `${s.replace('?', a)}. (${mean})`).join('\n') };
  };

  // Mẫu câu: có "bẫy" (câu giới thiệu có từ chỉ hoạt động, câu nêu hoạt động có từ chỉ đặc điểm…)
  const NC_SENT = {
    gt: ['Bạn Hùng là người chạy nhanh nhất lớp em.', 'Ông nội là người kể chuyện hay nhất nhà em.', 'Hoa mai là loài hoa của ngày Tết.',
      'Chú mèo mướp là bạn thân của bé Na.', 'Bác Tư là người lái xe buýt của tuyến phố này.', 'Thư viện là nơi các bạn đọc sách mỗi giờ ra chơi.'],
    hd: ['Bạn Lan chăm chỉ tưới cây mỗi sáng.', 'Bé Na vui vẻ chào cô giáo.', 'Đàn chim sẻ ríu rít gọi nhau trên cành.', 'Chú bộ đội đứng gác bên cột mốc.',
      'Mẹ cẩn thận gấp từng chiếc áo.', 'Các bạn nhỏ đang thả diều trên đê.'],
    dd: ['Chú mèo nhà em rất lười.', 'Mái tóc của bà bạc trắng như cước.', 'Cánh đồng lúa chín vàng óng ả.', 'Bạn Minh rất chăm chỉ và tốt bụng.',
      'Dòng sông quê em hiền hòa và trong xanh.', 'Con đường đến trường dài và rợp bóng cây.'],
  };
  const NC_TYPE = { gt: 'Ai là gì?', hd: 'Ai làm gì?', dd: 'Ai thế nào?' };
  T.ncSentRows = () => () => {
    let ts;
    do { ts = [0, 1, 2, 3].map(() => pick(['gt', 'hd', 'dd'])); } while (new Set(ts).size < 3);
    const used = new Set();
    const items = ts.map((ty) => {
      let s;
      do { s = pick(NC_SENT[ty]); } while (used.has(s));
      used.add(s);
      return { t: s, a: NC_TYPE[ty] };
    });
    return { type: 'rows', opts: ['Ai là gì?', 'Ai làm gì?', 'Ai thế nào?'], items, answer: items.map((x) => x.a), skill: 'nc.tv.maucau',
      prompt: 'Mỗi câu dưới đây được viết theo mẫu nào?', sub: 'Cẩn thận: có câu chứa từ chỉ hoạt động nhưng lại là câu giới thiệu!',
      hint: 'Tìm bộ phận đứng sau “Ai”: bắt đầu bằng “là” → Ai là gì?; chỉ việc làm → Ai làm gì?; chỉ đặc điểm, tính nết → Ai thế nào?',
      explain: items.map((x) => `${x.t} → ${x.a}`).join('\n') };
  };

  App.Gen.tvAdv = T;

  // ================= Gắn vào các chủ điểm =================
  // Các cặp chủ đề khác hẳn nhau (để chỉ có một từ khác loại)
  const OT = [['dodung', 'dochoi'], ['trochoi', 'dodung'], ['nguoithan', 'nghenghiep'], ['vatnuoi', 'duoibien'], ['muongthu', 'vatnuoi'],
    ['caycoi', 'dochoi'], ['tet', 'dodung'], ['nhanong', 'dochoi'], ['sanpham', 'duoibien']];
  const SP1 = ['c_k', 'ch_tr', 'v_d'], SP2 = [...SP1, 'g_gh', 's_x', 'hoi_nga'], SP3 = [...SP2, 'ng_ngh', 'r_d_gi', 'an_ang'], SP4 = [...SP3, 'l_n', 'ao_au', 'uon_uong'];
  const late = (from) => [[T.oddClass('suvat', 'hoatdong', 'dacdiem'), from], [T.antonym(), from], [T.synonym(), from], [T.misspell(...SP4), from],
    [T.paragraph(), from], [T.riddle(), from], [T.sound(), from], [T.questionPart(4), from], [T.oddTopic(...OT), from]];
  // Dạng bài giống vở bài tập: gạch dưới, Đ/S, điền dấu câu, điền từ (dấu phẩy học ở chủ điểm 6 nên từ đó mới điền đủ 4 dấu)
  const lateNew = (from, punct = 4, punctFrom = from) => [[T.ncUnderline('sv', 'hd', 'dd'), from], [T.ncPartPick(4), from], [T.ncSpellRows(...SP4), from],
    [T.ncSentRows(), from], [T.ncAntonymCloze(), from], [T.ncPunct(punct), punctFrom]];
  App.attachAdvanced(App.Curriculum.tv, {
    t1: [[T.oddClass('suvat', 'hoatdong'), 'b1'], [T.questionPart(1), 'b1'], [T.riddle(), 'b1'], [T.questionPart(2), 'b3'],
      [T.oddClass('suvat', 'hoatdong', 'dacdiem'), 'b5'], [T.questionPart(3), 'b5'], [T.antonym(), 'b5'],
      [T.ncUnderline('sv', 'hd'), 'b2'], [T.ncPartPick(2), 'b4'], [T.ncAntonymCloze(), 'b5'], [T.ncUnderline('sv', 'hd', 'dd'), 'b6'], [T.ncSentRows(), 'b8']],
    t2: [[T.misspell(...SP1), 'b9'], [T.proverb('truong'), 'b9'], [T.oddTopic(['dodung', 'dochoi'], ['trochoi', 'dodung']), 'b9'],
      [T.misspell(...SP2), 'b11'], [T.misspell(...SP3), 'b13'], [T.sound(), 'b13'], [T.misspell(...SP4), 'b15'],
      [T.ncSpellRows(...SP1), 'b9'], [T.ncUnderline('sv', 'hd', 'dd'), 'b9'], [T.ncProverbCloze('truong'), 'b9'], [T.ncSpellRows(...SP2), 'b11'],
      [T.ncPartPick(3), 'b12'], [T.ncSpellRows(...SP3), 'b13']],
    t3: [[T.paragraph(), 'b17'], [T.synonym(), 'b17'], [T.proverb('ban'), 'b17'], [T.oddTopic(...OT.slice(0, 3)), 'b17'], [T.misspell(...SP4), 'b17'],
      [T.ncUnderline('sv', 'hd', 'dd'), 'b17'], [T.ncSpellRows(...SP4), 'b17'], [T.ncSentRows(), 'b17'], [T.ncProverbCloze('ban', 'truong'), 'b17'], [T.ncPunct(3), 'b18']],
    t4: [[T.proverb('nha'), 'b25'], [T.paragraph(), 'b25'], [T.antonym(), 'b25'], [T.synonym(), 'b27'], [T.misspell(...SP4), 'b25'],
      [T.ncPartPick(3), 'b25'], [T.ncPunct(3), 'b25'], [T.ncAntonymCloze(), 'b25'], [T.ncSpellRows(...SP4), 'b25'], [T.ncProverbCloze('nha', 'ban'), 'b25']],
    t5: [...late('c1'), [T.proverb('chamchi'), 'c1'], ...lateNew('c1', 3), [T.ncProverbCloze('chamchi', 'on'), 'c1']],
    t6: [...late('c9'), [T.proverb('chamchi', 'on'), 'c9'], ...lateNew('c9', 4, 'c14'), [T.ncProverbCloze('chamchi', 'on'), 'c9']],
    t7: [...late('c17'), [T.proverb('ban', 'on'), 'c17'], ...lateNew('c17'), [T.ncProverbCloze('ban', 'on'), 'c17']],
    t8: [...late('c21'), [T.proverb('on', 'nha'), 'c21'], ...lateNew('c21'), [T.ncProverbCloze('on', 'nha'), 'c21']],
    t9: [...late('c25'), [T.proverb(), 'c25'], ...lateNew('c25'), [T.ncProverbCloze(), 'c25']],
  });

  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'nc.tv.tu': 'Tiếng Việt nâng cao: Tìm từ khác loại', 'nc.tv.trainghia': 'Tiếng Việt nâng cao: Từ trái nghĩa',
    'nc.tv.dongnghia': 'Tiếng Việt nâng cao: Từ cùng nghĩa', 'nc.tv.tucngu': 'Tiếng Việt nâng cao: Tục ngữ',
    'nc.tv.caudo': 'Tiếng Việt nâng cao: Giải câu đố', 'nc.tv.cauhoi': 'Tiếng Việt nâng cao: Bộ phận câu (Ai? Làm gì? Thế nào?…)',
    'nc.tv.chinhta': 'Tiếng Việt nâng cao: Tìm từ viết sai chính tả', 'nc.tv.doanvan': 'Tiếng Việt nâng cao: Sắp xếp đoạn văn',
    'nc.tv.tuongthanh': 'Tiếng Việt nâng cao: Từ tả âm thanh, hình ảnh',
    'nc.tv.tuloai': 'Tiếng Việt nâng cao: Gạch dưới từ ngữ trong đoạn văn', 'nc.tv.dau': 'Tiếng Việt nâng cao: Điền dấu câu (. , ? !)',
    'nc.tv.maucau': 'Tiếng Việt nâng cao: Nhận biết mẫu câu (Ai là gì? Ai làm gì? Ai thế nào?)',
  });
})(window.App);
