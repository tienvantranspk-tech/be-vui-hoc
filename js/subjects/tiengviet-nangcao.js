/* Tiếng Việt 2 – câu hỏi NÂNG CAO và THỬ THÁCH TƯ DUY.
   Từ khác loại, từ trái nghĩa – cùng nghĩa, hoàn thành tục ngữ, bộ phận câu trả lời câu hỏi (Ai? Làm gì? Thế nào? Ở đâu? Khi nào?),
   tìm từ viết sai chính tả, sắp xếp câu thành đoạn văn, giải câu đố, chọn từ tả âm thanh.
   Câu đố, đoạn văn, câu mẫu đều do app tự soạn; tục ngữ là tục ngữ dân gian quen thuộc. */
(function (App) {
  'use strict';
  const U = App.U;
  const { pick, shuffle, sample } = U;
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

  App.Gen.tvAdv = T;

  // ================= Gắn vào các chủ điểm =================
  // Các cặp chủ đề khác hẳn nhau (để chỉ có một từ khác loại)
  const OT = [['dodung', 'dochoi'], ['trochoi', 'dodung'], ['nguoithan', 'nghenghiep'], ['vatnuoi', 'duoibien'], ['muongthu', 'vatnuoi'],
    ['caycoi', 'dochoi'], ['tet', 'dodung'], ['nhanong', 'dochoi'], ['sanpham', 'duoibien']];
  const SP1 = ['c_k', 'ch_tr', 'v_d'], SP2 = [...SP1, 'g_gh', 's_x', 'hoi_nga'], SP3 = [...SP2, 'ng_ngh', 'r_d_gi', 'an_ang'], SP4 = [...SP3, 'l_n', 'ao_au', 'uon_uong'];
  const late = (from) => [[T.oddClass('suvat', 'hoatdong', 'dacdiem'), from], [T.antonym(), from], [T.synonym(), from], [T.misspell(...SP4), from],
    [T.paragraph(), from], [T.riddle(), from], [T.sound(), from], [T.questionPart(4), from], [T.oddTopic(...OT), from]];
  App.attachAdvanced(App.Curriculum.tv, {
    t1: [[T.oddClass('suvat', 'hoatdong'), 'b1'], [T.questionPart(1), 'b1'], [T.riddle(), 'b1'], [T.questionPart(2), 'b3'],
      [T.oddClass('suvat', 'hoatdong', 'dacdiem'), 'b5'], [T.questionPart(3), 'b5'], [T.antonym(), 'b5']],
    t2: [[T.misspell(...SP1), 'b9'], [T.proverb('truong'), 'b9'], [T.oddTopic(['dodung', 'dochoi'], ['trochoi', 'dodung']), 'b9'],
      [T.misspell(...SP2), 'b11'], [T.misspell(...SP3), 'b13'], [T.sound(), 'b13'], [T.misspell(...SP4), 'b15']],
    t3: [[T.paragraph(), 'b17'], [T.synonym(), 'b17'], [T.proverb('ban'), 'b17'], [T.oddTopic(...OT.slice(0, 3)), 'b17'], [T.misspell(...SP4), 'b17']],
    t4: [[T.proverb('nha'), 'b25'], [T.paragraph(), 'b25'], [T.antonym(), 'b25'], [T.synonym(), 'b27'], [T.misspell(...SP4), 'b25']],
    t5: [...late('c1'), [T.proverb('chamchi'), 'c1']],
    t6: [...late('c9'), [T.proverb('chamchi', 'on'), 'c9']],
    t7: [...late('c17'), [T.proverb('ban', 'on'), 'c17']],
    t8: [...late('c21'), [T.proverb('on', 'nha'), 'c21']],
    t9: [...late('c25'), [T.proverb(), 'c25']],
  });

  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'nc.tv.tu': 'Tiếng Việt nâng cao: Tìm từ khác loại', 'nc.tv.trainghia': 'Tiếng Việt nâng cao: Từ trái nghĩa',
    'nc.tv.dongnghia': 'Tiếng Việt nâng cao: Từ cùng nghĩa', 'nc.tv.tucngu': 'Tiếng Việt nâng cao: Tục ngữ',
    'nc.tv.caudo': 'Tiếng Việt nâng cao: Giải câu đố', 'nc.tv.cauhoi': 'Tiếng Việt nâng cao: Bộ phận câu (Ai? Làm gì? Thế nào?…)',
    'nc.tv.chinhta': 'Tiếng Việt nâng cao: Tìm từ viết sai chính tả', 'nc.tv.doanvan': 'Tiếng Việt nâng cao: Sắp xếp đoạn văn',
    'nc.tv.tuongthanh': 'Tiếng Việt nâng cao: Từ tả âm thanh, hình ảnh',
  });
})(window.App);
