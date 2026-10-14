/* Tiếng Anh 2 – các hàm tạo câu hỏi.
   Mỗi hàm E.xxx(...) trả về một "hàm tạo câu" để đặt vào plan của từng chặng trong tienganh.js.
   Đề bài viết bằng tiếng Việt; từ và câu tiếng Anh được đọc bằng giọng Anh (🔊 nghe lại, 🐢 nghe chậm). */
(function (App) {
  'use strict';
  const U = App.U;
  const { pick, shuffle, sample, chance } = U;
  const D = App.TAData;
  const W = D.words;
  const E = {};
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ================= Hình minh họa =================
  const PLACE = { in: 'ở trong', on: 'ở trên', near: 'ở gần' };
  const REF_VI = { tent: 'lều', table: 'bàn' };
  // Đồ vật ở trong / trên / gần cái lều hoặc cái bàn. wide: chừa chỗ bên phải cho vị trí "gần"
  function scene(ref, place, item, wide) {
    const it = [].concat(W[item].pic)[0];
    // Cảnh hẹp (Unit 12 – đồ ăn trên bàn): bàn thấp xuống, đồ ăn vẽ to cho dễ nhận ra
    const big = !wide && place === 'on';
    const [x, y, s] = big ? [20, 0, 60] : { in: [32, 52, 36], on: [30, 4, 40], near: [106, 46, 48] }[place];
    const thing = it.startsWith('svg:')
      ? `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 100 100">${D.svg[it.slice(4)]}</svg>`
      : `<text x="${x + s / 2}" y="${y + s * 0.84}" font-size="${s * 0.8}" text-anchor="middle">${it}</text>`;
    return `<svg class="ts${wide ? ' wide' : ''}" viewBox="0 0 ${wide ? 160 : 100} 100">` +
      (wide ? '<rect x="2" y="88" width="156" height="3" rx="1.5" fill="#7fd18b"/>' : '') +
      `<svg x="0" y="${big ? 22 : 0}" width="100" height="${big ? 78 : 100}" viewBox="0 0 100 100">${D.svg[ref]}</svg>${thing}</svg>`;
  }
  // Một phần của hình: emoji · 'svg:tên' · 'num:13' (thẻ số) · 'scene:bàn/lều:vị trí:đồ vật[:w]'
  function tok(t) {
    if (t.startsWith('svg:')) return `<svg class="ts" viewBox="0 0 100 100">${D.svg[t.slice(4)]}</svg>`;
    if (t.startsWith('num:')) return `<span class="tn">${t.slice(4)}</span>`;
    if (t.startsWith('scene:')) { const [, ref, place, item, w] = t.split(':'); return scene(ref, place, item, w === 'w'); }
    return `<span class="te">${t}</span>`;
  }
  const pic = (tokens, cls = '') => `<span class="tp n${Math.min(tokens.length, 3)}${cls ? ' ' + cls : ''}">${tokens.map(tok).join('')}</span>`;
  const wordTokens = (w) => (W[w].num ? ['num:' + W[w].num] : [].concat(W[w].pic));
  const wpic = (w) => pic(wordTokens(w));
  const views = (keys, toHtml) => { const v = {}; keys.forEach((k) => { v[k] = toHtml(k); }); return v; };

  // ================= Chọn từ gây nhiễu =================
  const maxU = (ws) => Math.max(...ws.map((w) => W[w].u));
  // Các từ đã học tính đến Unit lớn nhất của danh sách (từ thêm chỉ dùng khi có trong danh sách)
  const poolFor = (ws) => { const m = maxU(ws); return Object.keys(W).filter((w) => W[w].u <= m && (!W[w].extra || ws.includes(w))); };
  // Ưu tiên từ cùng bài, rồi tới từ đã học; không lấy hình dễ nhầm (con bò – bò u), số đi với số
  function distract(target, ws, n, ok, mixNum) {
    const t = W[target];
    const bad = (w) => w === target || (t.grp && W[w].grp === t.grp) || (!mixNum && !!W[w].num !== !!t.num) || (ok && !ok(w));
    const first = shuffle(ws.filter((w) => !bad(w)));
    const rest = shuffle(poolFor(ws).filter((w) => !bad(w) && !first.includes(w)));
    return first.concat(rest).slice(0, n);
  }

  // ================= Lời đọc =================
  const say = (vi, en) => (en ? [[vi, 'vi'], [en, 'en']] : [[vi, 'vi']]);
  const aboutWord = (w) => ({ explain: `${w} = ${W[w].vi}`, sayExplain: [[w, 'en'], [W[w].vi, 'vi']] });
  const LISTEN_HINT = 'Bấm 🔊 để nghe lại, bấm 🐢 để nghe chậm nhé!';
  // Đáp án là câu tiếng Anh; câu dài thì xếp mỗi câu một dòng cho dễ đọc
  const enCls = (opts) => 'en' + (opts.some((o) => o.length > 22) ? ' long' : '');

  // ================= Từ vựng =================
  // Nghe và chọn hình (Listen and tick)
  E.listenPick = (...ws) => () => {
    const w = pick(ws);
    const opts = shuffle([w, ...distract(w, ws, 3)]);
    const p = W[w].num ? 'Nghe và chọn số đúng:' : 'Nghe và chọn hình đúng:';
    return { type: 'choice', skill: 'ta.nghe', prompt: p, visual: { kind: 'listen', text: w }, options: opts, answer: w, views: views(opts, wpic),
      noCap: true, optsClass: 'tpics', speak: say(p, w), autoSay: [[w, 'en']], echo: w, note: 'Nghe từ: ' + w,
      hint: LISTEN_HINT, ...aboutWord(w) };
  };
  // Nhìn hình, chọn từ
  E.picWord = (...ws) => () => {
    const w = pick(ws);
    const opts = shuffle([w, ...distract(w, ws, 3)]);
    const p = W[w].num ? 'Đây là số mấy? Chọn từ tiếng Anh đúng:' : 'Đây là gì? Chọn từ tiếng Anh đúng:';
    return { type: 'choice', skill: 'ta.tuvung', prompt: p, visual: { kind: 'pic', html: wpic(w) }, options: opts, answer: w, optStyle: 'en',
      speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])], echo: w, note: `Hình “${W[w].vi}” → ${w}`, ...aboutWord(w) };
  };
  // Đọc từ, chọn hình
  E.wordPic = (...ws) => () => {
    const w = pick(ws);
    const opts = shuffle([w, ...distract(w, ws, 3)]);
    const p = 'Chọn hình đúng với từ:';
    return { type: 'choice', skill: 'ta.doc', prompt: p, big: w, bigRaw: true, bigClass: 'en', options: opts, answer: w, views: views(opts, wpic),
      noCap: true, optsClass: 'tpics', speak: say(p, w), echo: w, note: 'Đọc từ: ' + w, ...aboutWord(w) };
  };
  // Từ tiếng Anh → nghĩa tiếng Việt
  E.meaning = (...ws) => () => {
    const w = pick(ws);
    const opts = shuffle([W[w].vi, ...distract(w, ws, 3).map((x) => W[x].vi)]);
    const p = 'Từ này có nghĩa là gì?';
    return { type: 'choice', skill: 'ta.nghia', prompt: p, big: w, bigRaw: true, bigClass: 'en', options: opts, answer: W[w].vi, optStyle: 'text',
      speak: say(p, w), autoSay: [[w, 'en']], note: 'Nghĩa của từ: ' + w, ...aboutWord(w) };
  };
  // Nghĩa tiếng Việt → từ tiếng Anh
  E.meaningRev = (...ws) => () => {
    const w = pick(ws);
    const opts = shuffle([w, ...distract(w, ws, 3)]);
    const p = `Từ tiếng Anh nào có nghĩa là “${W[w].vi}”?`;
    return { type: 'choice', skill: 'ta.nghia', prompt: p, options: opts, answer: w, optStyle: 'en',
      speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])], echo: w, note: p, ...aboutWord(w) };
  };
  // Nối từ với hình (mode 'pic') hoặc với nghĩa (mode 'vi')
  E.match = (mode, ...ws) => () => {
    const chosen = sample(ws, Math.min(4, ws.length));
    const p = mode === 'vi' ? 'Nối từ tiếng Anh với nghĩa tiếng Việt:' : 'Nối từ với hình đúng:';
    return { type: 'match', skill: mode === 'vi' ? 'ta.nghia' : 'ta.tuvung', prompt: p,
      pairs: chosen.map((w) => [w, mode === 'vi' ? W[w].vi : { html: wpic(w) }]), tapSay: 'en',
      speak: say(p + ' Chạm vào một từ tiếng Anh để nghe đọc.'), note: p + ' ' + chosen.join(', ') };
  };

  // ================= Chữ cái và âm =================
  const parsePh = (w) => { const m = /^(.*)\[(.+)\](.*)$/.exec(W[w].ph); return { pre: m[1], f: m[2], post: m[3] }; };
  // Chữ gây nhiễu cho từng chữ / âm trọng tâm (dễ nhầm về hình dạng hoặc cách đọc)
  const PH_WRONG = {
    p: ['b', 'd', 'k', 's'], k: ['c', 'p', 't', 'h'], s: ['z', 'c', 'x', 'r'], r: ['l', 'w', 'n', 's'], qu: ['k', 'c', 'w', 'q'],
    x: ['s', 'z', 'k', 'ks'], j: ['g', 'y', 'd', 'ch'], v: ['w', 'f', 'b', 'u'], y: ['j', 'u', 'i', 'w'], z: ['s', 'x', 'j', 'c'],
    i: ['e', 'a', 'o', 'y'], a: ['e', 'i', 'o', 'u'], n: ['m', 'r', 'l', 't'], er: ['ar', 'or', 'ir', 'a'], sh: ['s', 'ch', 'th', 'h'],
    t: ['d', 'p', 'k', 'f'],
  };
  // Chọn chữ còn thiếu trong từ (Look and write)
  E.letter = (...ws) => () => {
    const w = pick(ws.filter((x) => W[x].ph));
    const { pre, f, post } = parsePh(w);
    const p = 'Chọn chữ còn thiếu trong từ:';
    return { type: 'choice', skill: 'ta.am', prompt: p, visual: { kind: 'pic', html: wpic(w) }, big: `${pre}?${post}`, bigClass: 'tight en',
      options: shuffle([f, ...sample(PH_WRONG[f], 3)]), answer: f, optStyle: 'spell', speak: say(p, w), echo: w,
      note: `Chữ còn thiếu: ${pre}_${post} (${w})`, hint: 'Bấm 🔊 để nghe đọc từ này, chú ý âm còn thiếu nhé!', ...aboutWord(w) };
  };
  // Hình có tên bắt đầu bằng / chứa chữ trọng tâm
  E.soundPick = (...ws) => () => {
    const w = pick(ws.filter((x) => W[x].ph));
    const { pre, f } = parsePh(w);
    const first = pre === '';
    const opts = shuffle([w, ...distract(w, ws, 3, (x) => !x.toLowerCase().includes(f), true)]);
    const lead = first ? 'Chọn hình có tên bắt đầu bằng chữ' : 'Chọn hình có tên chứa chữ';
    return { type: 'choice', skill: 'ta.am', prompt: `${lead} “${f}”:`, big: f.length === 1 ? `${f.toUpperCase()} ${f}` : f, bigRaw: true, bigClass: 'en',
      options: opts, answer: w, views: views(opts, wpic), noCap: true, optsClass: 'tpics', speak: [[lead, 'vi'], [f, 'en']], echo: w,
      note: `${lead} “${f}”`, hint: 'Đọc thầm tên tiếng Anh của từng hình nhé!',
      explain: `${w} (${W[w].vi}) có chữ “${f}”.`, sayExplain: [[w, 'en'], [W[w].vi, 'vi']] };
  };
  // Nghe từ, chọn chữ đứng đầu (Listen and circle)
  const FALLBACK = ['m', 'h', 'l', 'f', 'n', 'g'];
  E.listenLetter = (...ws) => {
    const cand = ws.filter((x) => W[x].ph && W[x].ph.startsWith('['));
    if (!cand.length) return E.soundPick(...ws);
    return () => {
      const w = pick(cand);
      const { f } = parsePh(w);
      const m = maxU(ws);
      const taught = U.uniq(Object.keys(W).filter((x) => W[x].u <= m && W[x].ph && W[x].ph.startsWith('[')).map((x) => parsePh(x).f));
      let wrong = sample(taught.filter((x) => x !== f), 3);
      if (wrong.length < 3) wrong = wrong.concat(sample(FALLBACK.filter((x) => x !== f && !wrong.includes(x)), 3 - wrong.length));
      const p = 'Nghe từ rồi chọn chữ đứng đầu của từ đó:';
      return { type: 'choice', skill: 'ta.am', prompt: p, visual: { kind: 'listen', text: w }, options: shuffle([f, ...wrong]), answer: f, optStyle: 'spell',
        speak: say(p, w), autoSay: [[w, 'en']], echo: w, note: `Nghe từ “${w}”, chọn chữ đầu`, hint: 'Bấm 🐢 để nghe chậm, chú ý âm đầu tiên nhé!',
        explain: `${w} (${W[w].vi}) bắt đầu bằng “${f}”.`, sayExplain: [[w, 'en'], [W[w].vi, 'vi']] };
    };
  };
  // Xếp chữ cái (từ ngắn) hoặc các phần (từ dài) thành từ
  E.spell = (...ws) => () => {
    const w = pick(ws.filter((x) => !x.includes('-')));
    const parts = w.length <= 6 || !W[w].syl ? w.split('') : W[w].syl.split('-');
    let items;
    do { items = shuffle(parts); } while (items.join('|') === parts.join('|'));
    const p = parts.length === w.length ? 'Xếp các chữ cái thành từ đúng với hình:' : 'Xếp các phần thành từ đúng với hình:';
    return { type: 'order', skill: 'ta.viet', prompt: p, visual: { kind: 'pic', html: wpic(w) }, items, answer: parts, tileClass: 'letter',
      speak: say(p, w), echo: w, answerLabel: w, note: 'Xếp chữ thành từ: ' + w, ...aboutWord(w) };
  };

  // ================= Số đếm 11–20 =================
  const NUMS = Object.keys(W).filter((w) => W[w].num).sort((a, b) => W[a].num - W[b].num);
  const numsIn = (lo, hi) => NUMS.filter((w) => W[w].num >= lo && W[w].num <= hi);
  // Số gần với số đang hỏi, chỉ lấy các số đã học (Unit 13: 11–15, Unit 14: đến 20)
  const nearNums = (w, n) => sample(NUMS.filter((x) => x !== w && W[x].u <= W[w].u && Math.abs(W[x].num - W[w].num) <= 4), n);
  E.numWord = (lo, hi) => () => {
    const w = pick(numsIn(lo, hi));
    const opts = shuffle([w, ...nearNums(w, 3)]);
    const p = 'Số này đọc bằng tiếng Anh là gì?';
    return { type: 'choice', skill: 'ta.so', prompt: p, visual: { kind: 'pic', html: wpic(w) }, options: opts, answer: w, optStyle: 'en',
      speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])], echo: w, note: `Số ${W[w].num} → ${w}`,
      explain: `${W[w].num} = ${w}`, sayExplain: [[w, 'en']] };
  };
  E.numListen = (lo, hi) => E.listenPick(...numsIn(lo, hi));
  E.numCount = (lo, hi) => () => {
    const w = pick(numsIn(lo, hi));
    const opts = shuffle([w, ...nearNums(w, 3)]);
    const p = 'Đếm số chấm tròn rồi chọn số đúng bằng tiếng Anh:';
    return { type: 'choice', skill: 'ta.so', prompt: p, visual: { kind: 'tenframe', a: W[w].num, b: 0, op: '+' }, options: opts, answer: w, optStyle: 'en',
      speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])], echo: w, note: `Đếm ${W[w].num} chấm → ${w}`,
      hint: 'Mỗi khung có 10 ô. Một khung đầy là 10, rồi đếm tiếp khung thứ hai.', explain: `${W[w].num} = ${w}`, sayExplain: [[w, 'en']] };
  };
  E.numMatch = (lo, hi) => () => {
    const chosen = sample(numsIn(lo, hi), 4);
    const p = 'Nối số với cách đọc tiếng Anh:';
    return { type: 'match', skill: 'ta.so', prompt: p, pairs: chosen.map((w) => [w, { html: wpic(w) }]), tapSay: 'en',
      speak: say(p + ' Chạm vào một từ tiếng Anh để nghe đọc.'), note: p + ' ' + chosen.join(', ') };
  };

  // ================= Mẫu câu =================
  // Cái chăn / ấm trà ở trong, gần cái lều; ở trên, gần cái bàn (Unit 16)
  const POS = [['tent', 'in'], ['tent', 'near'], ['table', 'on'], ['table', 'near']];
  D.tpl['u16.pos'] = { u: 16, list: ['blanket', 'teapot'].flatMap((it) => POS.map(([ref, p]) => ({
    key: `${it}-${p}-${ref}`, en: `The ${it} is ${p} the ${ref}.`, vi: `${cap(W[it].vi)} ${PLACE[p]} ${REF_VI[ref]}.`,
    pic: [`scene:${ref}:${p}:${it}:w`], blank: `${p} the ${ref}`,
  }))) };

  // Các câu của một mẫu: { key, en, vi, pic, blank, q, qvi }
  function variants(id) {
    const t = D.tpl[id];
    if (t._v) return t._v;
    t._v = t.list ? t.list.map((v) => ({ q: t.q, qvi: t.qvi, ...v })) : t.ws.map((w) => {
      const x = W[w];
      const aw = (x.a || 'a') + ' ' + w;
      const vi = x.vs || x.vi;
      const fill = (s) => s.replace(/\{(\w+)\}/g, (m, k) => ({ w, aw, be: x.pl ? 'are' : 'is', P: x.pr || '', vi, Vi: cap(vi) })[k]);
      const pics = (t.pic || ['{w}']).flatMap((p) => (p === '{w}' ? wordTokens(w) : [p.replace('{w}', w)]));
      return { key: w, en: fill(t.en), vi: fill(t.vi), pic: pics, blank: t.en.includes('{aw}') ? aw : w, q: t.q, qvi: t.qvi };
    });
    return t._v;
  }
  const others = (vs, v, f) => U.uniq(vs.map((x) => x[f]).filter((x) => x !== v[f]));
  const sayEnVi = (en, vi) => [[en, 'en'], [vi, 'vi']];

  // Câu nào đúng với hình?
  E.tplPick = (...ids) => () => {
    const vs = variants(pick(ids)), v = pick(vs);
    const opts = shuffle([v.en, ...sample(others(vs, v, 'en'), 3)]);
    const p = 'Câu nào đúng với hình?';
    return { type: 'choice', skill: 'ta.cau', prompt: p, visual: { kind: 'pic', html: pic(v.pic) }, options: opts, answer: v.en, optStyle: 'text', optsClass: enCls(opts),
      speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])], echo: v.en, note: 'Câu đúng với hình: ' + v.en,
      explain: `${v.en}\n(${v.vi})`, sayExplain: sayEnVi(v.en, v.vi) };
  };
  // Điền từ vào chỗ trống cho đúng với hình
  E.tplFill = (...ids) => () => {
    const vs = variants(pick(ids)), v = pick(vs);
    const opts = shuffle([v.blank, ...sample(others(vs, v, 'blank'), 3)]);
    const big = v.en.replace(v.blank, '?');
    const p = 'Chọn từ điền vào chỗ trống cho đúng với hình:';
    return { type: 'choice', skill: 'ta.cau', prompt: p, visual: { kind: 'pic', html: pic(v.pic) }, big, bigText: true, bigClass: 'en',
      options: opts, answer: v.blank, optStyle: opts.some((o) => o.length > 9) ? 'text' : 'en', speak: say(p), echo: v.en,
      note: 'Điền vào chỗ trống: ' + big, explain: `${v.en}\n(${v.vi})`, sayExplain: sayEnVi(v.en, v.vi) };
  };
  // Nghe câu, chọn hình
  E.tplListen = (...ids) => () => {
    const vs = variants(pick(ids)), v = pick(vs);
    const chosen = [v, ...sample(vs.filter((x) => x.key !== v.key && x.en !== v.en), 3)];
    const p = 'Nghe câu rồi chọn hình đúng:';
    const byKey = {};
    chosen.forEach((x) => { byKey[x.key] = pic(x.pic); });
    return { type: 'choice', skill: 'ta.nghecau', prompt: p, visual: { kind: 'listen', text: v.en }, options: shuffle(chosen.map((x) => x.key)), answer: v.key,
      views: byKey, noCap: true, optsClass: 'tpics', speak: say(p, v.en), autoSay: [[v.en, 'en']], echo: v.en, answerLabel: v.en,
      note: 'Nghe câu: ' + v.en, hint: LISTEN_HINT, explain: `${v.en}\n(${v.vi})`, sayExplain: sayEnVi(v.en, v.vi) };
  };
  // Sắp xếp các từ thành câu (có khi là câu hỏi của mẫu)
  E.tplOrder = (...ids) => () => {
    const vs = variants(pick(ids)), v = pick(vs);
    const useQ = !!v.q && chance(0.4);
    const s = useQ ? v.q : v.en, vi = useQ ? v.qvi : v.vi;
    const answer = s.split(' ');
    let items;
    do { items = shuffle(answer); } while (items.join(' ') === s);
    const p = 'Sắp xếp các từ thành câu đúng:';
    return { type: 'order', skill: 'ta.sapxep', prompt: p, visual: useQ ? null : { kind: 'pic', html: pic(v.pic) }, items, answer, tileClass: 'text en',
      speak: say(p), echo: s, answerLabel: s, note: 'Sắp xếp câu: ' + s,
      hint: 'Câu bắt đầu bằng chữ viết hoa và kết thúc bằng dấu chấm (.) hoặc dấu chấm hỏi (?).', explain: `${s}\n(${vi})`, sayExplain: sayEnVi(s, vi) };
  };
  // Câu tiếng Anh → nghĩa tiếng Việt
  E.tplMeaning = (...ids) => () => {
    const vs = variants(pick(ids)), v = pick(vs);
    const opts = shuffle([v.vi, ...sample(others(vs, v, 'vi'), 3)]);
    const p = 'Câu này có nghĩa là gì?';
    return { type: 'choice', skill: 'ta.nghia', prompt: p, big: v.en, bigText: true, bigRaw: true, bigClass: 'en', options: opts, answer: v.vi, optStyle: 'text',
      speak: say(p, v.en), autoSay: [[v.en, 'en']], note: 'Nghĩa của câu: ' + v.en, explain: `${v.en} = ${v.vi}`, sayExplain: sayEnVi(v.en, v.vi) };
  };

  // ================= Hỏi – đáp =================
  // Câu hỏi bằng tiếng Anh + hình → chọn câu trả lời
  function qaPic({ q, a, opts, html, why, hint, prompt = 'Nhìn hình và chọn câu trả lời đúng:' }) {
    return { type: 'choice', skill: 'ta.hoidap', prompt, visual: { kind: 'pic', html }, big: q, bigText: true, bigRaw: true, bigClass: 'en',
      options: opts, answer: a, optStyle: 'text', optsClass: enCls(opts), speak: [[prompt, 'vi'], [q, 'en']], autoSay: [[q, 'en']], echo: `${q} ${a}`,
      note: `${q} → ${a}`, hint, explain: why, sayExplain: [[`${q} ${a}`, 'en'], [why, 'vi']] };
  }
  // Mẫu có câu hỏi: What can you see? – I can see a ___. …
  E.qaPick = (...ids) => () => {
    const vs = variants(pick(ids)), v = pick(vs);
    const opts = shuffle([v.en, ...sample(others(vs, v, 'en'), 3)]);
    return qaPic({ q: v.q, a: v.en, opts, html: pic(v.pic), why: `(${v.qvi} – ${v.vi})`, hint: 'Nhìn hình rồi chọn câu trả lời nói đúng về hình.' });
  };

  // Unit 2: Is she flying a kite? – Yes, she is. / No, she isn't.
  const ACT2 = { kite: ['flying a kite', '🪁', 'thả diều'], bike: ['riding a bike', '🚲', 'đạp xe'], kitten: ['playing with a kitten', '🐱', 'chơi với mèo con'] };
  E.u2 = () => () => {
    const girl = chance(0.5), p = girl ? 'she' : 'he';
    const keys = Object.keys(ACT2);
    const shown = pick(keys);
    const asked = chance(0.5) ? shown : pick(keys.filter((k) => k !== shown));
    const q = `Is ${p} ${ACT2[asked][0]}?`;
    const a = shown === asked ? `Yes, ${p} is.` : `No, ${p} isn't.`;
    return qaPic({ q, a, opts: ['Yes, she is.', "No, she isn't.", 'Yes, he is.', "No, he isn't."], html: pic([girl ? '👧' : '👦', ACT2[shown][1]]),
      why: `Trong hình, ${girl ? 'bạn gái' : 'bạn trai'} đang ${ACT2[shown][2]}.`, hint: 'Bạn gái là “she”, bạn trai là “he”. Xem bạn ấy đang làm gì nhé!' });
  };
  // Unit 5: What's she doing? – She's colouring a square.
  const ACT5 = { square: ['colouring a square', ['🖍️', 'svg:square'], 'tô màu hình vuông'], quiz: ['doing a quiz', ['📝'], 'làm bài đố'],
    question: ['answering a question', ['✋', '❓'], 'trả lời câu hỏi'] };
  E.u5 = () => () => {
    const girl = chance(0.5), P = girl ? 'She' : 'He', P2 = girl ? 'He' : 'She';
    const keys = Object.keys(ACT5), act = pick(keys);
    const q = `What's ${P.toLowerCase()} doing?`;
    const a = `${P}'s ${ACT5[act][0]}.`;
    const opts = shuffle([a, ...keys.filter((k) => k !== act).map((k) => `${P}'s ${ACT5[k][0]}.`), `${P2}'s ${ACT5[act][0]}.`]);
    return qaPic({ q, a, opts, html: pic([girl ? '👧' : '👦', ...ACT5[act][1]]), why: `Trong hình, ${girl ? 'bạn gái' : 'bạn trai'} đang ${ACT5[act][2]}.`,
      hint: 'Bạn gái dùng “She’s…”, bạn trai dùng “He’s…”. Xem bạn ấy đang làm gì nhé!' });
  };
  // Unit 6: Is there a fox? – Yes, there is. / No, there isn't.
  E.u6 = () => () => {
    const all = ['box', 'fox', 'ox'], shown = sample(all, 2), yes = chance(0.5);
    const asked = yes ? pick(shown) : all.find((w) => !shown.includes(w));
    const q = `Is there ${W[asked].a || 'a'} ${asked}?`;
    const a = yes ? 'Yes, there is.' : "No, there isn't.";
    return qaPic({ q, a, opts: ['Yes, there is.', "No, there isn't.", 'Yes, she is.', "No, she isn't."],
      html: pic(shuffle([...shown.flatMap(wordTokens), pick(['🐔', '🐖', '🐑'])]), 'scene'),
      why: `Trong hình ${yes ? 'có' : 'không có'} ${W[asked].vi}.`, hint: 'Nhìn kĩ xem trong hình có con vật / đồ vật đó không nhé!' });
  };
  // Unit 8: Can you draw a van? – Yes, I can. / No, I can't.
  E.u8 = () => () => {
    const w = pick(['village', 'van', 'volleyball']), yes = chance(0.5);
    const q = `Can you draw a ${w}?`;
    const a = yes ? 'Yes, I can.' : "No, I can't.";
    return qaPic({ q, a, opts: ['Yes, I can.', "No, I can't.", 'Yes, there is.', "No, there isn't."], html: pic(['🖍️', ...wordTokens(w), yes ? '👍' : '👎']),
      prompt: 'Nhìn hình (👍 là có, 👎 là không) rồi chọn câu trả lời đúng:', why: yes ? 'Hình có 👍: tớ vẽ được.' : 'Hình có 👎: tớ không vẽ được.',
      hint: 'Hỏi “Can you…?” thì trả lời “Yes, I can.” hoặc “No, I can’t.”' });
  };
  // Unit 9: Can you see the yo-yos? – Yes, I can. / No, I can't.
  E.u9 = () => () => {
    const all = ['yogurt', 'yams', 'yo-yos'], shown = sample(all, 2), yes = chance(0.5);
    const asked = yes ? pick(shown) : all.find((w) => !shown.includes(w));
    const q = `Can you see the ${asked}?`;
    const a = yes ? 'Yes, I can.' : "No, I can't.";
    return qaPic({ q, a, opts: ['Yes, I can.', "No, I can't.", 'Yes, there is.', "No, there isn't."],
      html: pic(shuffle([...shown.flatMap(wordTokens), pick(['🍞', '🧀', '🥕'])]), 'scene'),
      why: `Trong hình ${yes ? 'có' : 'không có'} ${W[asked].vi}.`, hint: 'Nhìn kĩ xem trong hình có món đó không nhé!' });
  };
  // Unit 10: Do you like the zoo? – Yes, I do. / No, I don't.
  E.u10 = () => () => {
    const zoo = chance(0.6), like = chance(0.5);
    const q = zoo ? 'Do you like the zoo?' : 'Do you like zebras?';
    const a = like ? 'Yes, I do.' : "No, I don't.";
    return qaPic({ q, a, opts: ['Yes, I do.', "No, I don't.", 'Yes, I can.', "No, I can't."], html: pic([zoo ? 'svg:zoo' : '🦓', like ? '👍' : '👎']),
      prompt: 'Nhìn hình (👍 là thích, 👎 là không thích) rồi chọn câu trả lời đúng:', why: like ? 'Hình có 👍: tớ thích.' : 'Hình có 👎: tớ không thích.',
      hint: 'Hỏi “Do you…?” thì trả lời “Yes, I do.” hoặc “No, I don’t.”' });
  };
  // Unit 12: is hay are? – The grapes are on the table.
  E.u12be = () => () => {
    const v = pick(variants('u12.on'));
    const be = W[v.key].pl ? 'are' : 'is';
    const big = v.en.replace(` ${be} `, ' ? ');
    const p = 'Chọn “is” hoặc “are” để điền vào chỗ trống:';
    return { type: 'choice', skill: 'ta.cau', prompt: p, visual: { kind: 'pic', html: pic(v.pic) }, big, bigText: true, bigClass: 'en',
      options: ['is', 'are'], answer: be, optStyle: 'en', speak: [['Chọn', 'vi'], ['is', 'en'], ['hoặc', 'vi'], ['are', 'en'], ['để điền vào chỗ trống.', 'vi']],
      echo: v.en, note: 'Điền is / are: ' + big, hint: 'Một thứ thì dùng “is”; nhiều thứ (grapes, bananas) thì dùng “are”.',
      explain: `${v.en}\n(${v.vi})`, sayExplain: sayEnVi(v.en, v.vi) };
  };
  // Unit 14: How old is your brother? – He's nineteen.
  E.u14 = () => () => {
    const w = pick(['brother', 'sister']), P = W[w].pr, P2 = P === 'He' ? 'She' : 'He';
    const n = pick(NUMS);
    const q = `How old is your ${w}?`;
    const a = `${P}'s ${n}.`;
    const opts = shuffle([a, ...nearNums(n, 2).map((x) => `${P}'s ${x}.`), `${P2}'s ${n}.`]);
    return qaPic({ q, a, opts, html: pic([W[w].pic, 'num:' + W[n].num]), why: `${P === 'He' ? 'Anh ấy' : 'Chị ấy'} ${W[n].vi} tuổi.`,
      hint: 'Anh trai (brother) dùng “He’s”, chị gái (sister) dùng “She’s”. Đọc số trên thẻ nhé!' });
  };
  // Unit 16: The teapot is on the table. / Is the blanket near the tent? – No, it isn't. It's in the tent.
  const at = ([ref, p]) => `${p} the ${ref}`;
  E.u16pick = () => () => {
    const it = pick(['blanket', 'teapot']), where = pick(POS);
    const s = (x) => `The ${it} is ${at(x)}.`;
    const opts = shuffle(POS.map(s));
    const vi = `${cap(W[it].vi)} ${PLACE[where[1]]} ${REF_VI[where[0]]}.`;
    const p = 'Câu nào đúng với hình?';
    return { type: 'choice', skill: 'ta.cau', prompt: p, visual: { kind: 'pic', html: pic([`scene:${where[0]}:${where[1]}:${it}:w`]) },
      options: opts, answer: s(where), optStyle: 'text', optsClass: enCls(opts), speak: [[p, 'vi'], ...opts.map((o) => [o, 'en'])], echo: s(where),
      note: 'Câu đúng với hình: ' + s(where), hint: 'in: ở trong · on: ở trên · near: ở gần', explain: `${s(where)}\n(${vi})`, sayExplain: sayEnVi(s(where), vi) };
  };
  E.u16qa = () => () => {
    const it = pick(['blanket', 'teapot']), where = pick(POS);
    const asked = chance(0.45) ? where : pick(POS.filter((x) => x !== where));
    const q = `Is the ${it} ${at(asked)}?`;
    const no = (x) => `No, it isn't. It's ${at(x)}.`;
    const yes = asked === where;
    const a = yes ? 'Yes, it is.' : no(where);
    const opts = yes ? ['Yes, it is.', ...sample(POS.filter((x) => x !== where), 2).map(no)]
      : ['Yes, it is.', a, ...sample(POS.filter((x) => x !== where && x !== asked), 1).map(no)];
    return qaPic({ q, a, opts: shuffle(opts), html: pic([`scene:${where[0]}:${where[1]}:${it}:w`]),
      why: `${cap(W[it].vi)} ${PLACE[where[1]]} ${REF_VI[where[0]]}.`, hint: 'in: ở trong · on: ở trên · near: ở gần' });
  };

  // Chọn câu trả lời đúng cho câu hỏi (ôn các kiểu hỏi – đáp, không cần hình).
  // Đáp án nhiễu lấy từ kiểu câu hỏi khác, nên không có hai câu cùng đúng.
  let pairList = null;
  function qaPairs() {
    if (pairList) return pairList;
    pairList = D.pairs.slice();
    Object.keys(D.tpl).forEach((id) => {
      const t = D.tpl[id];
      if (t.q) variants(id).forEach((v) => pairList.push({ u: t.u, form: id, q: v.q, a: v.en, qvi: v.qvi, avi: v.vi }));
    });
    return pairList;
  }
  E.answerPick = (...units) => () => {
    const all = qaPairs();
    const m = Math.max(...units);
    const pr = pick(all.filter((x) => units.includes(x.u)));
    const opts = shuffle([pr.a, ...sample(U.uniq(all.filter((x) => x.u <= m && x.form !== pr.form && x.a !== pr.a).map((x) => x.a)), 3)]);
    const p = 'Chọn câu trả lời đúng:';
    return { type: 'choice', skill: 'ta.hoidap', prompt: p, big: pr.q, bigText: true, bigRaw: true, bigClass: 'en', options: opts, answer: pr.a,
      optStyle: 'text', optsClass: enCls(opts), speak: [[p, 'vi'], [pr.q, 'en']], autoSay: [[pr.q, 'en']], echo: `${pr.q} ${pr.a}`, note: `${pr.q} → ${pr.a}`,
      hint: 'Nhìn từ đầu câu hỏi: Is…? Can…? Do…? What…? How old…? Where…?',
      explain: `(${pr.qvi} – ${pr.avi})`, sayExplain: [[`${pr.q} ${pr.a}`, 'en'], [`${pr.qvi} ${pr.avi}`, 'vi']] };
  };

  E.variants = variants;
  E.pic = pic;
  E.wpic = wpic;
  App.Gen = App.Gen || {};
  App.Gen.ta = E;

  // Tên kỹ năng (Góc phụ huynh)
  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'ta.nghe': 'Tiếng Anh: Nghe từ', 'ta.tuvung': 'Tiếng Anh: Từ vựng theo hình', 'ta.doc': 'Tiếng Anh: Đọc từ',
    'ta.nghia': 'Tiếng Anh: Nghĩa của từ và câu', 'ta.am': 'Tiếng Anh: Chữ cái và âm', 'ta.viet': 'Tiếng Anh: Đánh vần (xếp chữ)',
    'ta.cau': 'Tiếng Anh: Mẫu câu', 'ta.nghecau': 'Tiếng Anh: Nghe câu', 'ta.sapxep': 'Tiếng Anh: Sắp xếp câu',
    'ta.hoidap': 'Tiếng Anh: Hỏi – đáp', 'ta.so': 'Tiếng Anh: Số đếm 11–20',
  });
})(window.App);
