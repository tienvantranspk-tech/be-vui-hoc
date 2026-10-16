/* Tiếng Anh 2 – bài theo các hoạt động trong sách Global Success:
   Point and say (bé nói), Listen and chant (vè), Listen and number (nghe và đánh số), Look and write (điền chữ),
   Let's talk (hội thoại), Let's sing (bài hát), Read and tick (đọc và đánh dấu ✓ ✗), Find and circle (tìm từ trong bảng chữ).
   Các hàm được thêm vào bộ App.Gen.ta, dùng trong tienganh.js. Câu vè, câu hát app tự ghép từ từ vựng và mẫu câu của Unit. */
(function (App) {
  'use strict';
  const U = App.U;
  const { pick, shuffle, sample, chance } = U;
  const D = App.TAData;
  const W = D.words;
  const E = App.Gen.ta;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const emojiOnly = (w) => !W[w].num && [].concat(W[w].pic).every((p) => !String(p).startsWith('svg:') && !String(p).startsWith('scene:'));
  const PEOPLE = ['👧', '👦', '🧒', '👩', '🧑', '👨'];
  // Hình (emoji) của từ để đặt cạnh câu vè, câu hát – nghe và nhìn hình là biết điền từ nào
  const emo = (w) => { const p = W[w] && [].concat(W[w].pic)[0]; return p && !/^(svg|num|scene):/.test(p) ? '  ' + p : ''; };

  // ================= Point and say / Listen and repeat: bé nói =================
  E.say = (...ws) => () => {
    const w = pick(ws);
    return { type: 'say', skill: 'ta.noi', prompt: 'Point and say: nhìn hình, nghe mẫu rồi nói to.', visual: { kind: 'pic', html: E.wpic(w) },
      say: { text: w, lang: 'en-US' }, answer: w, autoSay: [[w, 'en']], speak: [['Nhìn hình, nghe mẫu rồi nói to.', 'vi'], [w, 'en']],
      explain: `${w} = ${W[w].vi}`, sayExplain: [[w, 'en'], [W[w].vi, 'vi']] };
  };
  E.sayTpl = (...ids) => () => {
    const v = pick(E.variants(pick(ids)));
    return { type: 'say', skill: 'ta.noi', prompt: 'Listen and repeat: nghe rồi nói to cả câu.', visual: { kind: 'pic', html: E.pic(v.pic) },
      say: { text: v.en, lang: 'en-US' }, answer: v.en, autoSay: [[v.en, 'en']], speak: [['Nghe rồi nói to cả câu.', 'vi'], [v.en, 'en']],
      explain: `${v.en}\n(${v.vi})`, sayExplain: [[v.en, 'en'], [v.vi, 'vi']] };
  };

  // ================= Listen and chant: nghe vè, điền từ =================
  // Câu vè: "P, p, pizza!" … và một câu theo mẫu của Lesson 2 (nếu có)
  function clozeLines(lines, extraPool) {
    const parts = [];
    lines.forEach((ln, i) => { if (i) parts.push('\n'); parts.push(...ln); });
    const answers = App.QTypes.cloze.collect(parts);
    const extra = sample(U.uniq(extraPool).filter((x) => !answers.includes(x)), 2);
    return { parts, bank: shuffle([...answers, ...extra]), answer: answers };
  }
  E.chant = (n, ...ids) => () => {
    const u = D.units[n];
    const L = u.ph;
    const words = u.words.filter((w) => W[w]);
    const two = sample(words, 2);
    const lines = two.map((w) => [`${cap(L)}, ${L}, `, { a: w }, '!' + emo(w)]);
    if (ids.length) {
      const v = pick(E.variants(pick(ids)));
      const [pre, post] = v.en.split(v.blank);
      lines.push([pre, { a: v.blank }, post + emo(v.key)]);
    }
    const text = lines.map((ln) => ln.map((x) => (typeof x === 'object' ? x.a : x)).join('')).join(' ');
    const c = clozeLines(lines, Object.keys(W).filter((w) => W[w].u === n || W[w].u === n - 1));
    return { type: 'cloze', ...c, textClass: 'chant en', skill: 'ta.nghe',
      prompt: 'Listen and chant: nghe bài vè rồi điền từ còn thiếu.', sub: 'Bấm loa để nghe lại. Đọc theo nhịp vè nhé!',
      visual: { kind: 'listen', text, lang: 'en' }, autoSay: [[text, 'en']], speak: [['Nghe bài vè rồi điền từ còn thiếu.', 'vi'], [text, 'en']],
      explain: text, sayExplain: [[text, 'en']] };
  };

  // ================= Let's sing: hai câu hát theo mẫu câu, điền từ =================
  E.song = (...ids) => () => {
    const id = pick(ids);
    const vs = E.variants(id);
    const two = sample(vs, Math.min(2, vs.length));
    const lines = [];
    two.forEach((v) => {
      const [pre, post] = v.en.split(v.blank);
      lines.push([pre, { a: v.blank }, post + emo(v.key)], ['La la la, la la la! 🎵']);
    });
    const text = two.map((v) => v.en + ' La la la, la la la!').join(' ');
    const c = clozeLines(lines, vs.map((v) => v.blank).concat(Object.keys(W).filter((w) => W[w].u === D.tpl[id].u)));
    return { type: 'cloze', ...c, textClass: 'chant en', skill: 'ta.cau',
      prompt: "Let's sing: nghe bài hát rồi điền từ còn thiếu.", sub: 'Bấm loa để nghe lại, hát theo nhé!',
      visual: { kind: 'listen', text, lang: 'en' }, autoSay: [[text, 'en']], speak: [['Nghe bài hát rồi điền từ còn thiếu.', 'vi'], [text, 'en']],
      explain: two.map((v) => `${v.en} (${v.vi})`).join('\n'), sayExplain: [[two.map((v) => v.en).join(' '), 'en']] };
  };

  // ================= Listen and number: nghe rồi xếp hình theo thứ tự =================
  E.listenOrder = (...ws) => () => {
    const pool = ws.filter(emojiOnly);
    if (pool.length < 3) return E.listenPick(...ws)();
    const seq = sample(pool, 3);
    const tiles = seq.map((w) => [].concat(W[w].pic).join(''));
    let items;
    do { items = shuffle(tiles); } while (items.join() === tiles.join());
    const say = [['One.', 'en'], [seq[0], 'en'], ['Two.', 'en'], [seq[1], 'en'], ['Three.', 'en'], [seq[2], 'en']];
    return { type: 'order', skill: 'ta.nghe', prompt: 'Listen and number: nghe rồi chạm các hình theo đúng thứ tự.', items, answer: tiles, tileClass: 'emoji',
      visual: { kind: 'listen', text: `One, ${seq[0]}. Two, ${seq[1]}. Three, ${seq[2]}.`, lang: 'en' }, autoSay: say,
      speak: [['Nghe rồi chạm các hình theo đúng thứ tự.', 'vi'], ...say], answerLabel: seq.join(' → '), hint: 'Bấm 🐢 để nghe chậm nhé!',
      explain: seq.map((w, i) => `${i + 1}. ${w} (${W[w].vi})`).join('\n'), sayExplain: [[seq.join(', '), 'en']] };
  };

  // ================= Look and write: điền chữ cái còn thiếu =================
  E.lookWrite = (...ws) => () => {
    const w = pick(ws.filter((x) => /^[a-z]+$/.test(x) && x.length >= 3));
    const k = w.length >= 6 ? 3 : 2;
    const hide = new Set(sample(U.range(0, w.length - 1), k));
    const group = w.split('').map((ch, i) => (hide.has(i) ? { a: ch } : ch));
    const answers = w.split('').filter((_, i) => hide.has(i));
    const extra = sample('abcdefghijklmnoprstuvwy'.split('').filter((x) => !answers.includes(x)), 2);
    return { type: 'cloze', parts: [group], bank: shuffle([...answers, ...extra]), answer: answers, blank: 'letter', textClass: 'spell en big',
      skill: 'ta.viet', prompt: 'Look and write: nhìn hình, điền chữ cái còn thiếu.', visual: { kind: 'pic', html: E.wpic(w) },
      speak: [['Nhìn hình, điền chữ cái còn thiếu.', 'vi'], [w, 'en']], echo: w, answerLabel: w, explain: `${w} = ${W[w].vi}`, sayExplain: [[w, 'en']] };
  };

  // ================= Let's talk: hội thoại =================
  const chat = (html, q) => { const [a, b] = sample(PEOPLE, 2); return { kind: 'chat', pic: html, lines: [[a, q], [b, '…']] }; };
  E.talk = (...ids) => () => {
    const id = pick(ids);
    const vs = E.variants(id), v = pick(vs);
    if (!v.q) return E.tplPick(id)();
    const opts = shuffle([v.en, ...sample(U.uniq(vs.map((x) => x.en).filter((x) => x !== v.en)), 2)]);
    const p = "Let's talk: bạn nhỏ sẽ trả lời thế nào?";
    return { type: 'choice', skill: 'ta.hoidap', prompt: p, visual: chat(E.pic(v.pic), v.q), options: opts, answer: v.en, optStyle: 'text', optsClass: 'en long',
      speak: [[p, 'vi'], [v.q, 'en']], autoSay: [[v.q, 'en']], echo: `${v.q} ${v.en}`,
      explain: `${v.q} – ${v.en}\n(${v.qvi} – ${v.vi})`, sayExplain: [[`${v.q} ${v.en}`, 'en']] };
  };
  // Biến câu hỏi – đáp có hình (Unit 2, 5, 6, 8, 9, 10, 14, 16) thành hội thoại
  E.talkWrap = (gen) => () => {
    const q = gen();
    if (!q.big || !q.visual || q.visual.kind !== 'pic') return q;
    const p = "Let's talk: bạn nhỏ sẽ trả lời thế nào?";
    return { ...q, prompt: q.prompt.includes('👍') ? "Let's talk: " + q.prompt : p, visual: chat(q.visual.html, q.big), big: undefined, optsClass: 'en long' };
  };

  // ================= Read and tick: câu đúng với hình chọn ✓, sai chọn ✗ =================
  E.readTick = (...ids) => () => {
    const vs = U.uniq(ids).flatMap((id) => E.variants(id));
    const chosen = sample(vs, Math.min(3, vs.length));
    let items;
    for (let t = 0; t < 10; t++) {
      items = chosen.map((v) => {
        const right = chance(0.5);
        const other = vs.filter((x) => x.en !== v.en && x.key !== v.key);
        const s = right || !other.length ? v.en : pick(other).en;
        return { v, s, a: s === v.en ? '✓' : '✗' };
      });
      if (new Set(items.map((x) => x.a)).size === 2) break;
    }
    return { type: 'rows', opts: ['✓', '✗'], skill: 'ta.doc', items: items.map((x) => ({ html: `<div class="rw-pic"><div class="tpic mini">${E.pic(x.v.pic)}</div><div class="rw-cap en">${x.s}</div></div>`, a: x.a })),
      answer: items.map((x) => x.a), prompt: 'Read and tick: câu đúng với hình chọn ✓, sai chọn ✗.', speak: [['Câu đúng với hình chọn đúng, sai chọn sai.', 'vi']],
      hint: 'Đọc từng câu, nhìn kĩ hình bên trên.', explain: items.map((x) => `${x.v.en} (${x.v.vi})`).join('\n') };
  };

  // ================= Find and circle: tìm từ trong bảng chữ (mỗi từ chỉ xuất hiện đúng một lần) =================
  const AZ = 'abcdefghijklmnopqrstuvwxyz';
  // Số lần từ w xuất hiện trong bảng (hàng ngang + cột dọc)
  const countIn = (grid, w) => {
    let k = 0;
    const N = grid.length;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (c + w.length <= N && grid[r].slice(c, c + w.length) === w) k++;
      if (r + w.length <= N && U.range(0, w.length - 1).map((i) => grid[r + i][c]).join('') === w) k++;
    }
    return k;
  };
  // ws: từ của bài · more: từ ôn thêm khi ws chưa đủ 3 từ · maxLen: từ dài nhất được lấy (bảng 6×6, to ra cho vừa từ dài)
  const findWords = (ws, more, maxLen) => () => {
    const fit = (w) => /^[a-z]+$/.test(w) && w.length >= 2 && w.length <= maxLen;
    const cand = U.uniq(ws).filter(fit), extra = U.uniq(more).filter((w) => fit(w) && !cand.includes(w));
    for (let tries = 0; tries < 50; tries++) {
      // luôn có ít nhất một từ của bài; không lấy cùng lúc từ nằm trong từ khác (ox – box, fox)
      const [first, ...rest] = shuffle(cand);
      const words = [];
      [first, ...shuffle([...rest, ...extra])].filter(Boolean)
        .forEach((w) => { if (words.length < 3 && !words.some((x) => x.includes(w) || w.includes(x))) words.push(w); });
      const N = Math.max(6, ...words.map((w) => w.length));
      const g = Array.from({ length: N }, () => Array(N).fill(''));
      const place = [];
      let ok = true;
      for (const w of words) {
        let put = false;
        for (let t = 0; t < 60 && !put; t++) {
          const d = chance(0.5) ? 'h' : 'v';
          const r = U.rand(0, d === 'v' ? N - w.length : N - 1), c = U.rand(0, d === 'h' ? N - w.length : N - 1);
          const cells = w.split('').map((ch, k) => [d === 'v' ? r + k : r, d === 'h' ? c + k : c, ch]);
          if (cells.every(([rr, cc, ch]) => !g[rr][cc] || g[rr][cc] === ch)) {
            cells.forEach(([rr, cc, ch]) => { g[rr][cc] = ch; });
            place.push({ w, r, c, d });
            put = true;
          }
        }
        if (!put) { ok = false; break; }
      }
      if (!ok) continue;
      // chữ điền ngẫu nhiên có thể tạo thêm một bản của từ (vd. "ox") → điền lại
      for (let fillTry = 0; fillTry < 20; fillTry++) {
        const grid = g.map((row) => row.map((ch) => ch || AZ[U.rand(0, 25)]).join(''));
        if (words.some((w) => countIn(grid, w) !== 1)) continue;
        const pics = {};
        words.forEach((w) => { pics[w] = E.wpic(w); });
        return { type: 'wordsearch', grid, place, pics, answer: words, skill: 'ta.tuvung',
          prompt: 'Find and circle: tìm các từ trong bảng chữ.', sub: 'Chạm chữ cái đầu, rồi chạm chữ cái cuối của mỗi từ (hàng ngang hoặc cột dọc).',
          speak: [['Tìm các từ trong bảng chữ:', 'vi'], ...words.map((w) => [w, 'en'])], explain: words.map((w) => `${w} = ${W[w].vi}`).join('\n') };
      }
    }
    return E.spell(...ws)();
  };
  E.findWords = (...ws) => findWords(ws, [], 6);
  // Bài ít từ ngắn (Unit 14: sister, brother, grandmother): thêm từ ôn của Unit khác, nhận từ đến 8 chữ (bảng đến 8×8)
  E.findWordsMore = (ws, more) => findWords(ws, more, 8);

  App.SkillNames = Object.assign(App.SkillNames || {}, { 'ta.noi': 'Nói (nghe mẫu rồi nói theo)' });
})(window.App);
