/* Tiếng Việt 2 – các hàm tạo câu hỏi.
   Mỗi hàm T.xxx(...) trả về một "hàm tạo câu" để đặt vào plan của từng chặng trong tiengviet.js. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle } = U;
  const D = App.TVData;
  const T = {};
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ================= Chính tả =================
  function spellItem(rule, it) {
    if (rule.pair) return { disp: it[0], ans: it[1], wrong: rule.pair.filter((x) => x !== it[1]), e: it[2] || '' };
    return { disp: it[0], ans: it[1], wrong: Array.isArray(it[2]) ? it[2] : [it[2]], e: it[3] || '' };
  }
  // Điền chữ / vần / dấu thanh vào chỗ trống
  function spellFill(id) {
    const r = D.spell[id];
    const it = spellItem(r, pick(r.items));
    const full = it.disp.replace('?', it.ans);
    return { type: 'choice', skill: 'tv.ct.' + id, prompt: `Chọn ${r.name} để điền vào chỗ trống:`,
      big: (it.e ? it.e + ' ' : '') + it.disp, bigClass: 'tight', options: shuffle([it.ans, ...it.wrong]), answer: it.ans, optStyle: 'spell',
      speak: `Chọn chữ đúng để điền vào chỗ trống, tạo thành: ${full}.`,
      hint: r.rule || 'Đọc kĩ cả cụm từ, nhớ lại cách viết của từ đó.',
      explain: `Viết đúng là: ${full}.` + (r.rule ? '\n' + r.rule : '') };
  }
  // Chọn từ viết đúng chính tả
  function spellPick(id) {
    const r = D.spell[id];
    const it = spellItem(r, pick(r.items));
    const right = it.disp.replace('?', it.ans);
    const wrongs = it.wrong.map((w) => it.disp.replace('?', w));
    return { type: 'choice', skill: 'tv.ct.' + id, prompt: 'Từ ngữ nào viết đúng chính tả?', options: shuffle([right, ...wrongs]), answer: right,
      optStyle: 'text', speak: 'Từ ngữ nào viết đúng chính tả?', hint: r.rule || 'Đọc kĩ từng từ, nhớ lại cách viết đúng.',
      explain: `Viết đúng là: ${right}.` + (r.rule ? '\n' + r.rule : '') };
  }
  T.spell = (...ids) => () => spellFill(pick(ids));
  T.spellPick = (...ids) => () => spellPick(pick(ids));

  // ================= Bảng chữ cái =================
  const A = D.alphabet;
  const letterOptions = (ans) => {
    const i = A.indexOf(ans);
    const near = A.filter((x, k) => x !== ans && Math.abs(k - i) <= 4);
    return shuffle([ans, ...U.sample(near, 3)]);
  };
  // Chữ cái còn thiếu trong dãy (from, to: đoạn bảng chữ cái đang học)
  T.alphaMissing = (from = 'a', to = 'y') => () => {
    const i0 = A.indexOf(from), i1 = A.indexOf(to);
    const k = rand(i0, Math.max(i0, i1 - 3));
    const seq = A.slice(k, k + 4);
    const hide = rand(1, 2);
    return { type: 'choice', skill: 'tv.chucai', prompt: 'Chữ cái nào còn thiếu trong dãy?', big: seq.map((x, j) => (j === hide ? '?' : x)).join(', '),
      options: letterOptions(seq[hide]), answer: seq[hide], optStyle: 'spell', speak: 'Chữ cái nào còn thiếu trong dãy bảng chữ cái?',
      hint: 'Đọc thầm bảng chữ cái: a, ă, â, b, c, d, đ, e, ê, g, h…', explain: `Thứ tự đúng: ${seq.join(', ')}.` };
  };
  // Chữ cái đứng ngay sau
  T.alphaNext = (from = 'a', to = 'y') => () => {
    const i0 = A.indexOf(from), i1 = A.indexOf(to);
    const k = rand(i0, Math.max(i0, i1 - 1));
    const ans = A[k + 1];
    return { type: 'choice', skill: 'tv.chucai', prompt: `Trong bảng chữ cái, chữ nào đứng ngay sau chữ “${A[k]}”?`, options: letterOptions(ans), answer: ans,
      optStyle: 'spell', explain: `Thứ tự đúng: ${A[k]}, ${ans}.` };
  };
  // Tên chữ cái
  T.letterName = (from = 'a', to = 'y') => () => {
    const i0 = A.indexOf(from), i1 = A.indexOf(to);
    const letters = A.slice(i0, i1 + 1).filter((x) => D.letterNames[x]);
    const x = pick(letters.length ? letters : Object.keys(D.letterNames));
    const ans = D.letterNames[x];
    const wrong = U.sample(Object.values(D.letterNames).filter((n) => n !== ans), 3);
    return { type: 'choice', skill: 'tv.chucai', prompt: `Chữ cái “${x}” có tên là gì?`, big: x, options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text',
      speak: 'Chữ cái này có tên là gì?', explain: `Chữ cái “${x}” có tên là “${ans}”.` };
  };
  // Xếp chữ cái theo thứ tự
  T.alphaOrder = (from = 'a', to = 'y') => () => {
    const i0 = A.indexOf(from), i1 = A.indexOf(to);
    const answer = U.sample(A.slice(i0, i1 + 1), 4).sort((p, q) => A.indexOf(p) - A.indexOf(q));
    let items;
    do { items = shuffle(answer); } while (items.join() === answer.join());
    return { type: 'order', skill: 'tv.chucai', prompt: 'Xếp các chữ cái theo đúng thứ tự trong bảng chữ cái:', items, answer };
  };
  // Xếp tên các bạn theo thứ tự bảng chữ cái
  const firstLetterIndex = (name) => A.indexOf(name.charAt(0).toLowerCase());
  T.alphaNames = () => () => {
    const answer = U.sample(D.names, 4).sort((p, q) => firstLetterIndex(p) - firstLetterIndex(q));
    let items;
    do { items = shuffle(answer); } while (items.join() === answer.join());
    return { type: 'order', skill: 'tv.chucai', prompt: 'Xếp tên các bạn theo thứ tự bảng chữ cái (xem chữ cái đầu tiên):', items, answer,
      speak: 'Xếp tên các bạn theo thứ tự bảng chữ cái.' };
  };

  // ================= Từ ngữ chỉ sự vật, hoạt động, đặc điểm =================
  const CLASS = { suvat: 'chỉ sự vật', hoatdong: 'chỉ hoạt động', dacdiem: 'chỉ đặc điểm' };
  T.wordPick = (...classes) => () => {
    const t = pick(classes);
    const pool = (classes.length > 1 ? classes : Object.keys(CLASS)).filter((c) => c !== t);
    const ans = pick(D.words[t]);
    const wrong = U.sample(pool.flatMap((c) => D.words[c]), 3);
    return { type: 'choice', skill: 'tv.tu.' + t, prompt: `Từ ngữ nào là từ ngữ ${CLASS[t]}?`, options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text',
      hint: { suvat: 'Từ chỉ sự vật là tên gọi của người, đồ vật, con vật, cây cối…', hoatdong: 'Từ chỉ hoạt động cho biết người hay con vật đang làm gì.', dacdiem: 'Từ chỉ đặc điểm cho biết màu sắc, hình dáng, tính nết… thế nào.' }[t],
      explain: `“${ans}” là từ ngữ ${CLASS[t]}.` };
  };
  T.wordSort = (...classes) => () => {
    const per = classes.length === 3 ? 2 : 3;
    const items = shuffle(classes.flatMap((c, gi) => U.sample(D.words[c], per).map((w) => ({ t: w, g: gi }))));
    return { type: 'sort', skill: 'tv.tu.phanloai', prompt: 'Xếp các từ ngữ vào đúng nhóm:', groups: classes.map((c) => 'Từ ' + CLASS[c]), items,
      speak: 'Chạm vào một từ, rồi chạm vào nhóm đúng của từ đó.' };
  };

  // ================= Câu =================
  const TYPE = { gioithieu: 'Câu giới thiệu', hoatdong: 'Câu nêu hoạt động', dacdiem: 'Câu nêu đặc điểm' };
  const TYPE_HINT = {
    gioithieu: 'Câu giới thiệu trả lời câu hỏi: Ai (cái gì, con gì) là gì?',
    hoatdong: 'Câu nêu hoạt động trả lời câu hỏi: Ai (con gì) làm gì?',
    dacdiem: 'Câu nêu đặc điểm trả lời câu hỏi: Ai (cái gì, con gì) thế nào?',
  };
  const sentence = (t) => pick(D.sentences[t]);
  const plainS = (s) => s.split('|').join(' ');
  T.sentType = (...types) => () => {
    const t = pick(types);
    return { type: 'choice', skill: 'tv.cau.kieu', prompt: 'Câu dưới đây thuộc kiểu câu nào?', big: plainS(sentence(t)), bigText: true,
      options: types.length > 1 ? types.map((x) => TYPE[x]) : Object.values(TYPE), answer: TYPE[t], optStyle: 'text',
      hint: 'Câu giới thiệu: Ai là gì? · Câu nêu hoạt động: Ai làm gì? · Câu nêu đặc điểm: Ai thế nào?', explain: TYPE_HINT[t] };
  };
  T.sentPick = (t) => () => {
    const others = Object.keys(TYPE).filter((x) => x !== t);
    const right = plainS(sentence(t));
    return { type: 'choice', skill: 'tv.cau.kieu', prompt: `Câu nào là ${TYPE[t].toLowerCase()}?`, options: shuffle([right, ...others.map((o) => plainS(sentence(o)))]),
      answer: right, optStyle: 'text', hint: TYPE_HINT[t], explain: `“${right}” là ${TYPE[t].toLowerCase()}.\n${TYPE_HINT[t]}` };
  };
  T.sentOrder = (...types) => () => {
    const s = sentence(pick(types));
    const answer = s.split('|');
    let items;
    do { items = shuffle(answer); } while (items.join() === answer.join());
    return { type: 'order', skill: 'tv.cau.sapxep', prompt: 'Sắp xếp các từ ngữ thành câu đúng:', items, answer,
      speak: 'Sắp xếp các từ ngữ thành câu đúng.', hint: 'Câu bắt đầu bằng chữ viết hoa và kết thúc bằng dấu câu.' };
  };

  // ================= Dấu câu =================
  T.punct = (...marks) => () => {
    const m = pick(marks);
    const s = pick(D.punct[m]);
    const names = { '.': 'dấu chấm', '?': 'dấu chấm hỏi', '!': 'dấu chấm than' };
    return { type: 'choice', skill: 'tv.dau.cau', prompt: 'Chọn dấu câu thích hợp để đặt ở cuối câu:', big: s + ' ?', bigText: true, slotPlaceholder: ' ',
      options: marks.length >= 3 ? ['.', '?', '!'] : ['.', '?'], answer: m, optStyle: 'sign', speak: 'Chọn dấu câu thích hợp để đặt ở cuối câu: ' + s,
      hint: 'Câu kể dùng dấu chấm. Câu hỏi dùng dấu chấm hỏi. Câu bộc lộ cảm xúc (ôi, quá…) dùng dấu chấm than.',
      explain: `${s}${m} – dùng ${names[m]}.` };
  };
  T.comma = () => () => {
    const [S, list] = pick(D.commaLists);
    const [a, b, c] = U.sample(list, 3);
    const right = `${S} ${a}, ${b} và ${c}.`;
    const wrong = [`${S} ${a} ${b} và ${c}.`, `${S}, ${a} ${b} và ${c}.`, `${S} ${a} ${b}, và ${c}.`];
    return { type: 'choice', skill: 'tv.dau.phay', prompt: 'Câu nào dùng dấu phẩy đúng?', options: shuffle([right, ...wrong]), answer: right, optStyle: 'text',
      hint: 'Dấu phẩy dùng để ngăn cách các từ ngữ cùng loại đứng liền nhau.', explain: `Viết đúng: ${right}` };
  };

  // ================= Viết hoa tên riêng =================
  function capVariants(name) {
    const p = name.split(' ');
    const low = (i) => p.map((w, j) => (j === i ? w.toLowerCase() : w)).join(' ');
    return U.uniq([name.toLowerCase(), ...p.map((_, i) => low(i))]).filter((v) => v !== name);
  }
  T.capName = () => () => {
    const name = pick(D.people);
    return { type: 'choice', skill: 'tv.viethoa', prompt: 'Tên người nào được viết hoa đúng?', options: shuffle([name, ...U.sample(capVariants(name), 3)]), answer: name,
      optStyle: 'text', hint: 'Tên người: viết hoa chữ cái đầu của mỗi tiếng.', explain: `Viết đúng: ${name} (viết hoa chữ cái đầu của mỗi tiếng).` };
  };
  T.capPlace = () => () => {
    const name = pick(D.places);
    return { type: 'choice', skill: 'tv.viethoa', prompt: 'Tên địa danh nào được viết hoa đúng?', options: shuffle([name, ...U.sample(capVariants(name), 2)]), answer: name,
      optStyle: 'text', hint: 'Tên địa danh (tỉnh, thành phố…): viết hoa chữ cái đầu của mỗi tiếng.', explain: `Viết đúng: ${name}.` };
  };

  // ================= Mở rộng vốn từ =================
  T.topicPick = (id, ...distractors) => () => {
    const tp = D.topics[id];
    const ans = pick(tp.words);
    const pool = distractors.flatMap((d) => D.topics[d].words).filter((w) => !tp.words.includes(w));
    return { type: 'choice', skill: 'tv.mrvt', prompt: `Từ ngữ nào chỉ ${tp.name}?`, options: shuffle([ans, ...U.sample(pool, 3)]), answer: ans, optStyle: 'text',
      explain: `“${ans}” là từ ngữ chỉ ${tp.name}.` };
  };
  T.topicSort = (id1, id2) => () => {
    const t1 = D.topics[id1], t2 = D.topics[id2];
    const w2 = t2.words.filter((w) => !t1.words.includes(w));
    const items = shuffle([...U.sample(t1.words, 3).map((t) => ({ t, g: 0 })), ...U.sample(w2, 3).map((t) => ({ t, g: 1 }))]);
    return { type: 'sort', skill: 'tv.mrvt', prompt: 'Xếp các từ ngữ vào đúng nhóm:', groups: [cap(t1.name), cap(t2.name)], items,
      speak: 'Chạm vào một từ, rồi chạm vào nhóm đúng của từ đó.' };
  };
  T.seasonMatch = () => () => ({ type: 'match', skill: 'tv.mrvt', prompt: 'Nối mỗi mùa với đặc điểm của mùa đó:', pairs: D.seasons.map((s) => s.slice()),
    speak: 'Nối mỗi mùa với đặc điểm của mùa đó.' });

  // ================= Đọc hiểu =================
  T.reading = (...ids) => () => {
    const p = D.passages[pick(ids)];
    const [question, right, wrong] = pick(p.qs);
    return { type: 'choice', skill: 'tv.dochieu', prompt: question, passage: { title: p.title, text: p.text },
      options: shuffle([right, ...wrong]), answer: right, optStyle: 'text', speak: question,
      hint: 'Đọc lại bài, tìm câu có nói đến điều được hỏi.', explain: `Trong bài: ${right}.` };
  };

  App.Gen = App.Gen || {};
  App.Gen.tv = T;

  // Tên kỹ năng (Góc phụ huynh)
  const names = {
    'tv.chucai': 'Bảng chữ cái', 'tv.tu.suvat': 'Từ chỉ sự vật', 'tv.tu.hoatdong': 'Từ chỉ hoạt động', 'tv.tu.dacdiem': 'Từ chỉ đặc điểm',
    'tv.tu.phanloai': 'Phân loại từ ngữ', 'tv.cau.kieu': 'Kiểu câu (giới thiệu, hoạt động, đặc điểm)', 'tv.cau.sapxep': 'Sắp xếp từ thành câu',
    'tv.dau.cau': 'Dấu chấm, dấu chấm hỏi, dấu chấm than', 'tv.dau.phay': 'Dấu phẩy', 'tv.viethoa': 'Viết hoa tên riêng',
    'tv.mrvt': 'Mở rộng vốn từ theo chủ đề', 'tv.dochieu': 'Đọc hiểu',
  };
  Object.keys(D.spell).forEach((id) => { names['tv.ct.' + id] = 'Chính tả: ' + D.spell[id].name; });
  App.SkillNames = Object.assign(App.SkillNames || {}, names);
})(window.App);
