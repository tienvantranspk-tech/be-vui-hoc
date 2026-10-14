/* Tiếng Anh 2 – câu hỏi NÂNG CAO và THỬ THÁCH (gần với dạng bài thi tiếng Anh dành cho lớp 2):
   tìm từ khác loại, chọn từ viết đúng chính tả, ngữ pháp (is/are, a/an, can/do…), nghe câu rồi chọn câu đúng (không có hình),
   đọc câu rồi chọn hình có hai đồ vật, làm tính bằng tiếng Anh. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle, sample } = U;
  const D = App.TAData, W = D.words, E = App.Gen.ta;
  const X = {};
  const say = (vi, en) => (en ? [[vi, 'vi'], [en, 'en']] : [[vi, 'vi']]);
  const learned = (n) => Object.keys(W).filter((w) => W[w].u <= n);

  // ================= Nhóm từ (tìm từ khác loại) =================
  const CAT = {
    food: { vi: 'đồ ăn, đồ uống', ws: ['pasta', 'popcorn', 'pizza', 'juice', 'jelly', 'jam', 'yogurt', 'yams', 'grapes', 'cake', 'apple', 'bananas'] },
    animal: { vi: 'con vật', ws: ['kitten', 'fox', 'ox', 'zebu', 'zebra'] },
    place: { vi: 'cảnh vật, nơi chốn', ws: ['sea', 'sand', 'river', 'road', 'rainbow', 'village', 'zoo'] },
    thing: { vi: 'đồ vật, đồ chơi, xe cộ', ws: ['kite', 'bike', 'sail', 'box', 'volleyball', 'yo-yos', 'tent', 'teapot', 'blanket', 'table', 'van'] },
    clothes: { vi: 'quần áo, giày dép', ws: ['shirts', 'shorts', 'shoes'] },
    family: { vi: 'người trong gia đình', ws: ['sister', 'brother', 'grandmother'] },
    number: { vi: 'số đếm', ws: ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'] },
    action: { vi: 'hoạt động', ws: ['sliding', 'riding', 'driving'] },
  };
  X.oddOne = (n) => () => {
    const ok = learned(n);
    const avail = Object.keys(CAT).map((c) => [c, CAT[c].ws.filter((w) => ok.includes(w))]);
    const mains = avail.filter(([, ws]) => ws.length >= 3);
    const [c1, ws1] = pick(mains);
    const [c2, ws2] = pick(avail.filter(([c, ws]) => c !== c1 && ws.length));
    const three = sample(ws1, 3), x = pick(ws2);
    const opts = shuffle([...three, x]);
    const p = 'Từ nào khác loại với các từ còn lại?';
    return { type: 'choice', skill: 'nc.ta.khacloai', prompt: p, options: opts, answer: x, optStyle: 'en', speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])],
      echo: x, note: `${p} ${opts.join(', ')}`, hint: 'Nhớ nghĩa của từng từ: ba từ cùng một nhóm, một từ khác nhóm.',
      explain: `“${x}” (${W[x].vi}) là ${CAT[c2].vi}; các từ còn lại (${three.join(', ')}) là ${CAT[c1].vi}.` };
  };

  // ================= Chọn từ viết đúng chính tả =================
  const VOW = 'aeiou';
  function misspell(w) {
    const out = new Set();
    for (let t = 0; t < 120 && out.size < 6; t++) {
      const s = w.split(''), i = rand(0, s.length - 1), k = rand(0, 3);
      if (k === 0 && i < s.length - 1 && s[i] !== s[i + 1]) [s[i], s[i + 1]] = [s[i + 1], s[i]]; // đổi chỗ hai chữ cái
      else if (k === 1 && s.length > 3) s.splice(i, 1); // thiếu một chữ cái
      else if (k === 2 && VOW.includes(s[i])) s[i] = pick(VOW.replace(s[i], '').split('')); // nhầm nguyên âm
      else if (k === 3 && /[bcdfgklmnprstvz]/.test(s[i])) s.splice(i, 0, s[i]); // thừa một chữ cái
      else continue;
      const r = s.join('');
      if (r !== w && !W[r]) out.add(r);
    }
    return [...out];
  }
  X.spellPick = (...ws) => () => {
    const w = pick(ws.filter((x) => !x.includes('-')));
    const wrong = sample(misspell(w), 3);
    const p = 'Từ nào viết đúng tên của hình?';
    return { type: 'choice', skill: 'nc.ta.chinhta', prompt: p, visual: { kind: 'pic', html: E.wpic(w) }, options: shuffle([w, ...wrong]), answer: w, optStyle: 'en',
      speak: say(p, w), echo: w, note: `Viết đúng: ${w}`, hint: 'Bấm 🔊 để nghe từ, rồi nhìn thật kĩ từng chữ cái.',
      explain: `${w} = ${W[w].vi}`, sayExplain: [[w, 'en'], [W[w].vi, 'vi']] };
  };

  // ================= Ngữ pháp =================
  // ___ là chỗ trống; pic: hình kèm theo (khi cần nhìn hình mới biết đáp án)
  const GRAM = [
    { u: 1, s: 'The pizza ___ yummy.', a: 'is', w: ['are', 'am', 'do'] },
    { u: 1, s: 'I ___ popcorn.', a: 'like', w: ['likes', 'is', 'are'] },
    { u: 2, s: 'She ___ flying a kite.', a: 'is', w: ['are', 'am', 'do'] },
    { u: 2, s: 'Is he riding a bike? – Yes, he ___.', a: 'is', w: ['are', 'can', 'do'] },
    { u: 2, s: 'I have ___ kite.', a: 'a', w: ['an', 'is', 'are'] },
    { u: 3, s: '___ look at the sea.', a: "Let's", w: ['Is', 'Do', 'Can'] },
    { u: 4, s: 'There ___ a river.', a: 'is', w: ['are', 'am', 'do'] },
    { u: 4, s: 'What can you ___? – I can see a rainbow.', a: 'see', w: ['sees', 'is', 'are'] },
    { u: 5, s: "What's she doing? – She's ___ a quiz.", a: 'doing', w: ['do', 'does', 'is'] },
    { u: 6, s: 'Is there a fox? – Yes, there ___.', a: 'is', w: ['are', 'can', 'do'] },
    { u: 6, s: 'I can see ___ ox.', a: 'an', w: ['a', 'is', 'are'] },
    { u: 6, s: 'I can see ___ fox.', a: 'a', w: ['an', 'is', 'are'] },
    { u: 7, s: 'Pass me the jam, ___.', a: 'please', w: ['you', 'yes', 'is'] },
    { u: 7, s: 'Pass me the juice, please. – Here you ___.', a: 'are', w: ['is', 'am', 'do'] },
    { u: 8, s: '___ you draw a van? – Yes, I can.', a: 'Can', w: ['Do', 'Is', 'Are'] },
    { u: 8, s: 'This ___ a village.', a: 'is', w: ['are', 'am', 'do'] },
    { u: 9, s: 'What do you want? – I want ___ yams.', a: 'some', w: ['a', 'an', 'is'] },
    { u: 9, s: '___ do you want? – I want some yogurt.', a: 'What', w: ['Where', 'How', 'Who'] },
    { u: 10, s: '___ you like the zoo? – Yes, I do.', a: 'Do', w: ['Can', 'Is', 'Are'] },
    { u: 10, s: "That's ___ zebra.", a: 'a', w: ['an', 'is', 'are'] },
    { u: 11, s: 'They ___ sliding.', a: 'are', w: ['is', 'am', 'do'] },
    { u: 12, s: 'The grapes ___ on the table.', a: 'are', w: ['is', 'am', 'do'] },
    { u: 12, s: 'The cake ___ on the table.', a: 'is', w: ['are', 'am', 'do'] },
    { u: 13, s: "What number ___ it? – It's eleven.", a: 'is', w: ['are', 'am', 'do'] },
    { u: 14, s: "How ___ is your sister? – She's sixteen.", a: 'old', w: ['many', 'much', 'big'] },
    { u: 14, s: '___ is my sister.', a: 'She', w: ['He', 'It', 'They'] },
    { u: 15, s: 'Where ___ the shoes? – Over there.', a: 'are', w: ['is', 'am', 'do'] },
    { u: 15, s: '___ are the shirts? – Over there.', a: 'Where', w: ['What', 'How', 'Who'] },
    { u: 16, s: "Is the blanket near the tent? – No, it ___. It's in the tent.", a: "isn't", w: ["aren't", "can't", "don't"] },
    { u: 16, s: 'The teapot is ___ the table.', a: 'on', w: ['in', 'near', 'at'], pic: 'scene:table:on:teapot:w' },
  ];
  X.grammar = (n) => () => {
    const g = pick(GRAM.filter((x) => x.u <= n));
    const full = g.s.replace('___', g.a);
    const p = 'Chọn từ đúng để điền vào chỗ trống:';
    return { type: 'choice', skill: 'nc.ta.nguphap', prompt: p, big: g.s.replace('___', '____'), bigText: true, bigRaw: true, bigClass: 'en',
      visual: g.pic ? { kind: 'pic', html: E.pic([g.pic]) } : null, options: shuffle([g.a, ...g.w]), answer: g.a, optStyle: 'en',
      speak: say(p), echo: full, note: `Điền từ: ${g.s}`, hint: 'Đọc cả câu (và câu hỏi đi kèm) để chọn từ hợp nhất.',
      explain: full, sayExplain: [[full, 'en']] };
  };

  // ================= Nghe câu, chọn câu đúng (không có hình) =================
  X.listenText = (...ids) => () => {
    const vs = E.variants(pick(ids)), v = pick(vs);
    const opts = shuffle([v.en, ...sample(U.uniq(vs.map((x) => x.en).filter((e) => e !== v.en)), 3)]);
    const p = 'Nghe rồi chọn câu đúng với câu em nghe được:';
    return { type: 'choice', skill: 'nc.ta.nghecau', prompt: p, visual: { kind: 'listen', text: v.en }, options: opts, answer: v.en, optStyle: 'text',
      optsClass: 'en' + (opts.some((o) => o.length > 22) ? ' long' : ''), speak: say(p, v.en), autoSay: [[v.en, 'en']], note: 'Nghe câu: ' + v.en,
      hint: 'Bấm 🔊 để nghe lại, bấm 🐢 để nghe chậm. Chú ý từ khác nhau giữa các câu.', explain: `${v.en}\n(${v.vi})`, sayExplain: [[v.en, 'en'], [v.vi, 'vi']] };
  };

  // ================= Đọc câu, chọn hình có hai đồ vật =================
  const SINGULAR = ['kite', 'bike', 'kitten', 'sail', 'rainbow', 'river', 'road', 'box', 'fox', 'ox', 'van', 'volleyball', 'zebra', 'zebu', 'cake', 'apple', 'tent', 'teapot', 'blanket', 'table'];
  const aw = (w) => `${W[w].a || 'a'} ${w}`;
  const two = (a, b) => E.pic([...[].concat(W[a].pic), ...[].concat(W[b].pic)]);
  X.readPick = (n) => () => {
    const pool = SINGULAR.filter((w) => W[w].u <= n);
    const [a, b, c, d] = sample(pool, 4);
    const sentence = `I can see ${aw(a)} and ${aw(b)}.`;
    const sets = { ok: [a, b], x1: [a, c], x2: [c, b], x3: [c, d] };
    const keys = Object.keys(sets);
    const views = {};
    keys.forEach((k) => { views[k] = two(...sets[k]); });
    const p = 'Đọc câu rồi chọn hình đúng:';
    return { type: 'choice', skill: 'nc.ta.doc', prompt: p, big: sentence, bigText: true, bigRaw: true, bigClass: 'en', options: shuffle(keys), answer: 'ok',
      views, noCap: true, optsClass: 'tpics', speak: say(p, sentence), echo: sentence, answerLabel: `${a} và ${b}`, note: 'Đọc câu: ' + sentence,
      hint: 'Hình đúng phải có đủ cả hai đồ vật trong câu.', explain: `${sentence}\n(Tớ nhìn thấy ${W[a].vi} và ${W[b].vi}.)`, sayExplain: [[sentence, 'en']] };
  };

  // ================= Làm tính bằng tiếng Anh (Unit 13–16) =================
  const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const NUMW = (k) => (k <= 10 ? SMALL[k] : Object.keys(W).find((w) => W[w].num === k));
  X.mathWords = (n) => () => {
    const max = n >= 14 ? 20 : 15;
    const r = rand(11, max), plus = Math.random() < 0.6;
    const c = rand(1, 9), b = plus ? r - c : r + c;
    if (b < 1 || b > max) return X.mathWords(n)();
    const big = `${NUMW(b)} ${plus ? '+' : '−'} ${NUMW(c)} = ?`;
    const near = U.uniq([r - 1, r + 1, r - 2, r + 2, r + 10 > max ? r - 3 : r + 3].filter((x) => x >= 11 && x <= max && x !== r));
    const opts = shuffle([r, ...sample(near, 3)].map(NUMW));
    const p = 'Tính rồi chọn đáp án bằng tiếng Anh:';
    return { type: 'choice', skill: 'nc.ta.tinh', prompt: p, big, bigText: true, bigClass: 'en', options: opts, answer: NUMW(r), optStyle: 'en',
      speak: [[p, 'vi'], [`${NUMW(b)} ${plus ? 'plus' : 'minus'} ${NUMW(c)}`, 'en']], echo: `${NUMW(b)} ${plus ? 'plus' : 'minus'} ${NUMW(c)} is ${NUMW(r)}`,
      note: `${b} ${plus ? '+' : '−'} ${c} = ${r}`, hint: 'Đổi chữ ra số, tính, rồi đổi kết quả lại thành chữ.', explain: `${b} ${plus ? '+' : '−'} ${c} = ${r} → ${NUMW(r)}` };
  };

  App.Gen.taAdv = X;

  // ================= Gắn vào các Unit =================
  const pools = {};
  for (let n = 1; n <= 16; n++) {
    const t = 't' + Math.ceil(n / 4);
    const p = pools[t] || (pools[t] = []);
    const tpls = Object.keys(D.tpl).filter((id) => id.startsWith(`u${n}.`));
    p.push([X.spellPick(...D.units[n].words), `u${n}a`]);
    if (n >= 2) p.push([X.oddOne(n), `u${n}a`]);
    p.push([X.grammar(n), `u${n}b`]);
    if (n >= 3) p.push([X.readPick(n), `u${n}b`]); // cần ít nhất 4 đồ vật đã học
    if (tpls.length) p.push([X.listenText(...tpls), `u${n}b`]);
    if (n >= 5) p.push([E.answerPick(...U.range(2, n)), `u${n}b`]);
    if (n >= 13) p.push([X.mathWords(n), `u${n}b`]);
  }
  App.attachAdvanced(App.Curriculum.ta, pools);

  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'nc.ta.khacloai': 'Tiếng Anh nâng cao: Tìm từ khác loại', 'nc.ta.chinhta': 'Tiếng Anh nâng cao: Viết đúng chính tả',
    'nc.ta.nguphap': 'Tiếng Anh nâng cao: Ngữ pháp', 'nc.ta.nghecau': 'Tiếng Anh nâng cao: Nghe câu (không có hình)',
    'nc.ta.doc': 'Tiếng Anh nâng cao: Đọc câu, chọn hình', 'nc.ta.tinh': 'Tiếng Anh nâng cao: Làm tính bằng tiếng Anh',
  });
})(window.App);
