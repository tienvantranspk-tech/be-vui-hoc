/* Tiếng Việt 2 – bài dạng vở bài tập: gạch dưới từ ngữ trong câu, khoanh vào từ ngữ, điền chữ / vần / dấu câu / từ ngữ
   vào chỗ trống, Đ/S chính tả, xếp câu vào mẫu câu, đọc bài rồi chọn Đ/S.
   Các hàm được thêm vào bộ App.Gen.tv, dùng trong plan của tiengviet.js. */
(function (App) {
  'use strict';
  const U = App.U;
  const { pick, shuffle, chance } = U;
  const D = App.TVData;
  const T = App.Gen.tv;
  const CLASS = { sv: 'chỉ sự vật', hd: 'chỉ hoạt động', dd: 'chỉ đặc điểm' };
  const CLASS_SKILL = { sv: 'tv.tu.suvat', hd: 'tv.tu.hoatdong', dd: 'tv.tu.dacdiem' };
  const CLASS_HINT = {
    sv: 'Từ chỉ sự vật là tên gọi của người, con vật, đồ vật, cây cối…',
    hd: 'Từ chỉ hoạt động cho biết người, con vật đang làm gì.',
    dd: 'Từ chỉ đặc điểm cho biết màu sắc, hình dáng, tính nết… thế nào.',
  };
  const WORDS_KEY = { sv: 'suvat', hd: 'hoatdong', dd: 'dacdiem' };
  const plain = (s) => s.replace(/\{([^}|]+)\|\w+\}/g, '$1');

  // Tách câu có đánh dấu {từ|loại} thành các mục: { t, tag } (tag '' = từ khác, punct = dấu câu)
  function tokens(text) {
    const out = [];
    const re = /\{([^}|]+)\|(\w+)\}|([^\s{}]+)/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1]) { out.push({ t: m[1], tag: m[2] }); continue; }
      const mm = /^([“"(]*)(.*?)([.,!?:;…”")]*)$/.exec(m[3]);
      if (mm[1]) out.push({ t: mm[1], punct: true });
      if (mm[2]) out.push({ t: mm[2], tag: '' });
      if (mm[3]) out.push({ t: mm[3], punct: true });
    }
    return out;
  }

  // ================= Gạch dưới từ ngữ chỉ sự vật / hoạt động / đặc điểm trong câu =================
  T.underline = (...classes) => () => {
    const cls = pick(classes);
    const s = U.sample(D.tagged.filter((x) => x.includes('|' + cls + '}')), 2).join(' ');
    const tk = tokens(s);
    const items = tk.map((x) => (x.punct ? { t: x.t, ok: null } : { t: x.t, ok: x.tag === cls }));
    const ans = tk.filter((x) => x.tag === cls).map((x) => x.t);
    return { type: 'pick', mode: 'inline', items, answer: ans, skill: CLASS_SKILL[cls],
      prompt: `Gạch dưới các từ ngữ ${CLASS[cls]}.`, sub: 'Chạm vào từ ngữ để gạch dưới (có thể chọn nhiều), rồi bấm Kiểm tra.',
      speak: `Gạch dưới các từ ngữ ${CLASS[cls]} trong câu: ${plain(s)}`, hint: CLASS_HINT[cls],
      explain: `Từ ngữ ${CLASS[cls]}: ${ans.join(', ')}.` };
  };

  // ================= Gạch dưới bộ phận câu trả lời cho câu hỏi Ai? / Là gì? / Làm gì? / Thế nào? =================
  const ASK_SUBJ = { gt: 'Ai (cái gì, con gì)?', hd: 'Ai (con gì)?', dd: 'Ai (cái gì, con gì)?' };
  const ASK_PRED = { gt: 'Là gì?', hd: 'Làm gì?', dd: 'Thế nào?' };
  T.sentPart = (...types) => () => {
    const ty = pick(types);
    const s = pick(D.parts[ty]);
    const [subj, pred0] = s.split(' / ');
    const end = (pred0.match(/[.!?]$/) || ['.'])[0];
    const pred = pred0.replace(/[.!?]$/, '');
    const askSubj = chance(0.5);
    const items = [...subj.split('|').map((t) => ({ t, ok: askSubj })), ...pred.split('|').map((t) => ({ t, ok: !askSubj })), { t: end, ok: null }];
    const q = askSubj ? ASK_SUBJ[ty] : ASK_PRED[ty];
    const ans = items.filter((x) => x.ok).map((x) => x.t);
    return { type: 'pick', mode: 'inline', items, answer: [ans.join(' ')], skill: 'tv.cau.bophan',
      prompt: `Gạch dưới bộ phận câu trả lời cho câu hỏi “${q}”`, sub: 'Chạm vào các cụm từ để gạch dưới, rồi bấm Kiểm tra.',
      speak: `Gạch dưới bộ phận câu trả lời cho câu hỏi: ${q.replace('?', '')}. Câu: ${s.replace(' / ', ' ').split('|').join(' ')}`,
      hint: askSubj ? 'Bộ phận trả lời câu hỏi "Ai (cái gì, con gì)?" thường đứng ở đầu câu.' : 'Hỏi thử: "… ' + q.toLowerCase() + '" Phần trả lời đứng sau.',
      explain: `${q} → ${ans.join(' ')}` };
  };

  // ================= Khoanh vào các từ ngữ thuộc một nhóm =================
  T.wordFind = (cls) => () => {
    const n = U.rand(3, 4);
    const good = U.sample(D.words[WORDS_KEY[cls]], n);
    const bad = U.sample(Object.keys(WORDS_KEY).filter((k) => k !== cls).flatMap((k) => D.words[WORDS_KEY[k]]), 8 - n);
    const items = shuffle([...good.map((t) => ({ t, ok: true })), ...bad.map((t) => ({ t, ok: false }))]);
    return { type: 'pick', mode: 'tiles', items, answer: good, skill: CLASS_SKILL[cls],
      prompt: `Khoanh vào các từ ngữ ${CLASS[cls]}.`, sub: 'Chạm để chọn tất cả các từ ngữ đúng, rồi bấm Kiểm tra.', hint: CLASS_HINT[cls],
      explain: `Từ ngữ ${CLASS[cls]}: ${good.join(', ')}.` };
  };
  T.topicFind = (id, ...distractors) => () => {
    const tp = D.topics[id];
    const n = U.rand(3, 4);
    const good = U.sample(tp.words, n);
    const pool = U.uniq(distractors.flatMap((d) => D.topics[d].words)).filter((w) => !tp.words.includes(w));
    const items = shuffle([...good.map((t) => ({ t, ok: true })), ...U.sample(pool, 7 - n).map((t) => ({ t, ok: false }))]);
    return { type: 'pick', mode: 'tiles', items, answer: good, skill: 'tv.mrvt',
      prompt: `Khoanh vào các từ ngữ chỉ ${tp.name}.`, sub: 'Chạm để chọn tất cả các từ ngữ đúng, rồi bấm Kiểm tra.',
      explain: `Từ ngữ chỉ ${tp.name}: ${good.join(', ')}.` };
  };

  // ================= Chính tả: điền nhiều chỗ trống; Đ/S =================
  function spellItem(rule, it) {
    if (rule.pair) return { disp: it[0], ans: it[1], wrong: rule.pair.filter((x) => x !== it[1]), e: it[2] || '' };
    return { disp: it[0], ans: it[1], wrong: Array.isArray(it[2]) ? it[2] : [it[2]], e: it[3] || '' };
  }
  T.spellCloze = (...ids) => () => spellClozeOf(pick(ids), 4).q;
  function spellClozeOf(id, n) {
    const r = D.spell[id];
    let its;
    for (let t = 0; t < 12; t++) {
      its = U.sample(r.items, n).map((x) => spellItem(r, x));
      if (new Set(its.map((x) => x.ans)).size >= 2) break;
    }
    const parts = [];
    its.forEach((it, k) => {
      if (k) parts.push('    ');
      const [before, after] = it.disp.split('?');
      parts.push([(it.e ? it.e + ' ' : '') + before, { a: it.ans }, after]);
    });
    // Vần, dấu thanh: mỗi chỗ trống có một thẻ đúng riêng (có thể trùng nhau), thêm vài thẻ sai
    const answers = its.map((x) => x.ans);
    const bank = r.pair ? r.pair.slice()
      : shuffle([...answers, ...U.sample(U.uniq(its.flatMap((x) => x.wrong)).filter((w) => !answers.includes(w)), 3)]);
    const q = { type: 'cloze', parts, bank, reuse: !!r.pair, blank: 'letter', textClass: 'spell', skill: 'tv.ct.' + id,
      prompt: r.pair ? `Điền ${r.pair.join(' hay ')} vào chỗ trống.` : `Chọn ${r.name} để điền vào chỗ trống.`,
      sub: 'Chạm vào chỗ trống, rồi chạm vào chữ để điền.', speak: r.pair ? `Điền ${r.pair.join(' hay ')} vào chỗ trống.` : `Chọn ${r.name} để điền vào chỗ trống.`,
      hint: r.rule || 'Đọc cả từ ngữ, nhớ lại cách viết của từ đó.',
      explain: 'Viết đúng: ' + its.map((x) => x.disp.replace('?', x.ans)).join(', ') + '.' + (r.rule ? '\n' + r.rule : '') };
    q.answer = App.QTypes.cloze.collect(parts);
    return { q, words: its.map((x) => x.disp.replace('?', x.ans)) };
  }
  // Nghe – viết: máy đọc các từ ngữ, bé điền phần chữ / vần còn thiếu
  T.listenSpell = (...ids) => () => {
    const { q, words } = spellClozeOf(pick(ids), 3);
    const say = words.join(', ');
    return { ...q, prompt: 'Nghe – viết: nghe đọc rồi điền chữ còn thiếu.', sub: 'Bấm loa để nghe lại, bấm rùa để nghe chậm.',
      speak: 'Nghe đọc rồi điền chữ còn thiếu: ' + say, autoSay: say, visual: { kind: 'listen', text: say, lang: 'vi' } };
  };
  T.spellTF = (...ids) => () => {
    const id = pick(ids);
    const r = D.spell[id];
    const its = U.sample(r.items, 4).map((x) => spellItem(r, x));
    const wrong = new Set(U.sample([0, 1, 2, 3], U.rand(1, 2)));
    const items = its.map((it, k) => {
      const w = wrong.has(k) ? pick(it.wrong) : it.ans;
      return { t: (it.e ? it.e + '  ' : '') + it.disp.replace('?', w), a: w === it.ans ? 'Đ' : 'S' };
    });
    return { type: 'rows', items, answer: items.map((x) => x.a), skill: 'tv.ct.' + id,
      prompt: 'Đ, S?', sub: 'Từ ngữ viết đúng chính tả chọn Đ, viết sai chọn S.', hint: r.rule || 'Đọc kĩ từng từ, nhớ lại cách viết đúng.',
      explain: 'Viết đúng: ' + its.map((x) => x.disp.replace('?', x.ans)).join(', ') + '.' + (r.rule ? '\n' + r.rule : '') };
  };

  // ================= Bảng chữ cái: viết chữ cái còn thiếu =================
  T.alphaFill = (from = 'a', to = 'y') => () => {
    const A = D.alphabet;
    const i0 = A.indexOf(from), i1 = A.indexOf(to);
    const len = Math.min(7, i1 - i0 + 1);
    const k = U.rand(i0, i1 - len + 1);
    const seq = A.slice(k, k + len);
    const hide = new Set(U.sample(U.range(1, len - 1), 3));
    const parts = [];
    seq.forEach((c, j) => {
      if (j) parts.push(',  ');
      parts.push(hide.has(j) ? { a: c } : c);
    });
    const ans = seq.filter((_, j) => hide.has(j));
    const near = A.filter((c) => !seq.includes(c) && Math.abs(A.indexOf(c) - k) < 10);
    const q = { type: 'cloze', parts, bank: shuffle([...ans, ...U.sample(near, 2)]), blank: 'letter', textClass: 'spell', skill: 'tv.chucai',
      prompt: 'Viết chữ cái còn thiếu.', sub: 'Chạm vào chỗ trống, rồi chạm vào chữ cái đúng.', speak: 'Viết chữ cái còn thiếu trong dãy bảng chữ cái.',
      hint: 'Đọc thầm bảng chữ cái: a, ă, â, b, c, d, đ, e, ê, g, h, i, k…', explain: `Thứ tự đúng: ${seq.join(', ')}.` };
    q.answer = App.QTypes.cloze.collect(parts);
    return q;
  };

  // ================= Điền dấu câu vào đoạn văn =================
  function bracketParts(text, re) {
    const parts = [];
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push({ a: m[1] });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }
  T.punctPara = (...marks) => () => {
    const ok = D.punctParas.filter((p) => {
      const used = (p.match(/\[([.,?!])\]/g) || []).map((x) => x[1]);
      return used.every((m) => marks.includes(m) || (m === '.' && marks.includes(','))) && used.some((m) => marks.includes(m));
    });
    const text = pick(ok);
    // ô dấu câu dính liền với chữ đứng trước (không bị rơi xuống đầu dòng)
    const parts = [];
    bracketParts(text, /\[([.,?!])\]/g).forEach((x) => {
      const prev = parts[parts.length - 1];
      if (typeof x === 'object' && typeof prev === 'string') {
        const m = /^([\s\S]*?)(\S*)$/.exec(prev);
        parts[parts.length - 1] = m[1];
        parts.push([m[2], x]);
      } else parts.push(x);
    });
    const bank = marks.includes(',') ? U.uniq([',', '.', ...marks]) : marks.slice();
    const comma = marks.length === 1 && marks[0] === ',';
    const q = { type: 'cloze', parts, bank, reuse: true, blank: 'punct', skill: comma ? 'tv.dau.phay' : 'tv.dau.cau',
      prompt: 'Chọn dấu câu thích hợp cho mỗi ô trống.', sub: 'Chạm vào ô trống, rồi chạm vào dấu câu.',
      speak: 'Chọn dấu câu thích hợp cho mỗi ô trống trong đoạn văn.',
      hint: comma ? 'Dấu phẩy ngăn cách các từ ngữ cùng loại. Cuối câu kể dùng dấu chấm.'
        : 'Câu kể dùng dấu chấm. Câu hỏi dùng dấu chấm hỏi. Câu bộc lộ cảm xúc (ôi, quá…) dùng dấu chấm than.',
      explain: 'Viết đúng: ' + text.replace(/\[([.,?!])\]/g, '$1') };
    q.answer = App.QTypes.cloze.collect(parts);
    return q;
  };

  // ================= Điền từ ngữ vào đoạn văn =================
  T.clozeText = (...themes) => () => {
    const p = pick(D.clozes.filter((c) => themes.includes(c.th)));
    const parts = bracketParts(p.text, /\{([^}]+)\}/g);
    const ans = App.QTypes.cloze.collect(parts);
    return { type: 'cloze', parts, bank: shuffle([...ans, ...p.extra]), answer: ans, skill: 'tv.doan.dien',
      prompt: 'Chọn từ ngữ thích hợp điền vào chỗ trống.', sub: 'Chạm vào chỗ trống, rồi chạm vào từ ngữ. Có thẻ không dùng đến.',
      speak: 'Chọn từ ngữ thích hợp điền vào chỗ trống trong đoạn văn.', hint: 'Đọc cả câu, thử điền từng từ rồi đọc lại xem có hợp nghĩa không.',
      explain: p.text.replace(/\{([^}]+)\}/g, '$1') };
  };

  // ================= Xếp câu vào mẫu câu (nhiều dòng) =================
  const TYPE_ASK = { gioithieu: 'Ai là gì?', hoatdong: 'Ai làm gì?', dacdiem: 'Ai thế nào?' };
  T.sentTypeRows = (...types) => () => {
    const ts = shuffle(types.length >= 3 ? types.slice(0, 3) : [...types, pick(types)]);
    const used = new Set();
    const items = ts.map((t) => {
      let s;
      do { s = pick(D.sentences[t]); } while (used.has(s));
      used.add(s);
      return { t: s.split('|').join(' '), a: TYPE_ASK[t] };
    });
    return { type: 'rows', opts: types.map((t) => TYPE_ASK[t]), items, answer: items.map((x) => x.a), skill: 'tv.cau.kieu',
      prompt: 'Mỗi câu dưới đây được viết theo mẫu nào?', sub: 'Chọn mẫu câu cho từng dòng.',
      hint: 'Câu giới thiệu: Ai là gì? · Câu nêu hoạt động: Ai làm gì? · Câu nêu đặc điểm: Ai thế nào?',
      explain: items.map((x) => `${x.t} → ${x.a}`).join('\n') };
  };

  // ================= Đọc bài rồi chọn Đ/S =================
  T.readTF = (...ids) => () => {
    const id = pick(ids);
    const p = D.passages[id];
    const list = D.readTF[id];
    let picks;
    do { picks = U.sample(list, 3); } while (new Set(picks.map((x) => x[1])).size < 2);
    const items = picks.map(([t, a]) => ({ t, a }));
    return { type: 'rows', items, answer: items.map((x) => x.a), skill: 'tv.dochieu', passage: { title: p.title, text: p.text },
      prompt: 'Đọc bài, rồi chọn Đ (đúng) hoặc S (sai).', sub: 'Câu nào đúng với bài đọc thì chọn Đ.', speak: 'Đọc bài, rồi chọn đúng hoặc sai cho mỗi câu.',
      hint: 'Đọc lại bài, tìm câu văn nói đến điều đó.', explain: items.map((x) => `${x.t} → ${x.a}`).join('\n') };
  };

  // ================= Viết chữ hoa: tô theo nét chữ mờ =================
  T.trace = (...letters) => () => {
    const letter = pick(letters);
    const line = D.capLines[letter] || '';
    return { type: 'trace', letter, line, answer: letter, skill: 'tv.chuhoa',
      prompt: `Tô chữ hoa ${letter}.`, sub: 'Dùng ngón tay tô lên nét chữ mờ. Tô xong bấm Xong.', speak: `Tô chữ hoa ${letter}.`,
      explain: line ? 'Câu ứng dụng: ' + line : '' };
  };

  // ================= Nói và nghe =================
  // Xếp tranh theo thứ tự câu chuyện
  T.storyOrder = () => () => {
    const seq = pick(D.storySeq);
    let items;
    do { items = shuffle(seq); } while (items.join() === seq.join());
    return { type: 'order', items, answer: seq, tileClass: 'text sent', skill: 'tv.noinghe',
      prompt: 'Sắp xếp các tranh theo đúng thứ tự câu chuyện.', sub: 'Chạm lần lượt: tranh xảy ra trước chạm trước.',
      speak: 'Sắp xếp các tranh theo đúng thứ tự câu chuyện.', hint: 'Việc gì xảy ra trước thì xếp trước.', explain: seq.join('\n') };
  };
  // Nói và đáp lời trong tình huống
  T.reply = () => () => {
    const [s, right, wrong] = pick(D.replies);
    return { type: 'choice', skill: 'tv.noinghe', prompt: '💬 ' + s, options: shuffle([right, ...wrong]), answer: right, optStyle: 'text', optsClass: 'long', speak: s,
      hint: 'Được giúp thì cảm ơn, làm sai thì xin lỗi, bạn vui thì chúc mừng, bạn buồn thì an ủi.', explain: `Nên nói: ${right}` };
  };

  // ================= Luyện từ và câu: ghép thành câu =================
  T.sentMatch = (...types) => () => {
    const ty = pick(types);
    return { type: 'match', pairs: U.sample(D.sentPairs[ty], 4).map((p) => p.slice()), skill: 'tv.cau.kieu',
      prompt: 'Ghép từ ngữ ở cột trái với từ ngữ ở cột phải để tạo thành câu.', speak: 'Ghép từ ngữ ở cột trái với cột phải để tạo thành câu.' };
  };

  // ================= Luyện viết đoạn: sắp xếp câu thành đoạn văn =================
  T.paraOrder = (...keys) => () => {
    const seq = D.paras[pick(keys)];
    let items;
    do { items = shuffle(seq); } while (items.join() === seq.join());
    return { type: 'order', items, answer: seq, tileClass: 'text sent', skill: 'tv.vietdoan',
      prompt: 'Sắp xếp các câu thành đoạn văn.', sub: 'Chạm lần lượt từ câu mở đầu đến câu kết thúc.', speak: 'Sắp xếp các câu thành đoạn văn.',
      hint: 'Câu mở đầu giới thiệu điều sẽ kể. Các việc xảy ra trước kể trước. Câu cuối nói cảm nghĩ.', explain: seq.join(' ') };
  };

  // ================= Nhiệm vụ cùng bố mẹ (bố mẹ tắt được trong Góc phụ huynh) =================
  const tasksOn = () => { const st = App.Store.state; return !st || st.settings.parentTasks !== false; };
  // Đọc to bài đọc (có ghi âm cho bố mẹ nghe)
  T.taskRead = (...ids) => () => {
    if (!tasksOn()) return T.readTF(...ids)();
    const id = pick(ids), p = D.passages[id];
    return { type: 'task', noStat: true, answer: 'task:read:' + id, skill: 'tv.dochieu', passage: { title: p.title, text: p.text },
      task: { kind: 'read', title: `Đọc to bài “${p.title}”`, detail: 'Bé đọc to, rõ ràng cả bài. Bấm ⏺️ để ghi âm gửi bố mẹ nghe.' },
      prompt: '👨‍👩‍👧 Nhiệm vụ cùng bố mẹ: đọc to bài đọc.', speak: 'Nhiệm vụ cùng bố mẹ: bé đọc to bài đọc, ghi âm để bố mẹ nghe nhé.' };
  };
  // Viết đoạn văn vào vở (đề theo phần Luyện viết đoạn của bài)
  const WRITE = {
    gioithieu: 'Viết 2–3 câu tự giới thiệu về em (tên, lớp, sở thích).', viecnha: 'Viết 3–4 câu kể một việc em đã làm ở nhà.',
    dihoc: 'Viết 3–4 câu kể những việc em thường làm trước khi đi học.', thethao: 'Viết 3–4 câu kể về một trò chơi hoặc môn thể thao ở trường.',
    dodung: 'Viết 3–4 câu tả một đồ dùng học tập của em.', dochoi: 'Viết 3–4 câu giới thiệu một đồ chơi em thích.',
    nguoithan: 'Viết 3–4 câu kể về một người thân của em.', rachoi: 'Viết 3–4 câu kể về giờ ra chơi ở trường em.',
    tinnhan: 'Viết một tin nhắn ngắn cho người thân.', thiep: 'Viết một tấm thiệp chúc Tết ông bà.', chamcay: 'Viết 3–5 câu kể việc em chăm sóc cây.',
    convat: 'Viết 3–5 câu giới thiệu một con vật em thích.', xinloi: 'Viết lời xin lỗi khi em lỡ làm điều chưa đúng với bạn.',
    moitruong: 'Viết 4–5 câu kể việc em đã làm để bảo vệ môi trường.', camon: 'Viết 4–5 câu cảm ơn các chú bộ đội hải quân.',
    dichoi: 'Viết 4–5 câu kể về một buổi đi chơi.', congviec: 'Viết 4–5 câu kể về công việc của một người thân.',
    danhsach: 'Viết tên 4 bạn trong tổ em theo thứ tự bảng chữ cái.', luytre: 'Viết 3–4 câu tả một cây em thích.',
    maytre: 'Viết 4–5 câu giới thiệu một đồ vật làm bằng tre hoặc gỗ.',
  };
  T.taskWrite = (key) => () => {
    if (!tasksOn()) return D.paras[key] ? T.paraOrder(key)() : T.sentOrder('hoatdong')();
    return { type: 'task', noStat: true, answer: 'task:write:' + key, skill: 'tv.vietdoan',
      task: { kind: 'write', title: 'Viết vào vở', detail: WRITE[key] + ' Viết xong, bé đưa vở cho bố mẹ xem nhé!' },
      prompt: '👨‍👩‍👧 Nhiệm vụ cùng bố mẹ: viết đoạn văn vào vở.', speak: 'Nhiệm vụ cùng bố mẹ: ' + WRITE[key] };
  };

  // ================= Bài đọc tuần này (bố mẹ gõ đoạn văn trong sách của bé) =================
  const sentencesOf = (text) => (text.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+[”"»]?|[^.!?…]+$/g) || []).map((s) => s.trim()).filter((s) => s.split(' ').length >= 3);
  App.WeekText = {
    has() { const st = App.Store.state; return !!(st && st.weekText && sentencesOf(st.weekText.text).length >= 2); },
    title() { return App.Store.state.weekText.title; },
    make() {
      const { title, text } = App.Store.state.weekText;
      const sents = sentencesOf(text);
      const qs = [];
      // Điền từ còn thiếu (2 câu, mỗi câu khác đoạn)
      const cloze = (from) => {
        const part = sents.slice(from, from + 3);
        const toks = part.join(' ').split(' ');
        const okIdx = toks.map((t, i) => ({ t, i })).filter(({ t, i }) => i > 0 && /^\p{Ll}{2,}$/u.test(t.replace(/[.,!?…:;”"»]+$/, ''))).map((x) => x.i);
        if (okIdx.length < 3) return null;
        const hide = new Set(U.sample(okIdx, 3));
        const parts = [];
        let buf = '', sep = false; // sep: vừa có chỗ trống → chữ tiếp theo cần dấu cách
        toks.forEach((t, i) => {
          if (!hide.has(i)) { buf += (buf || sep ? ' ' : '') + t; sep = false; return; }
          const core = t.replace(/[.,!?…:;”"»]+$/, ''), tail = t.slice(core.length);
          parts.push(buf + (buf || sep ? ' ' : ''), { a: core });
          buf = tail;
          sep = true;
        });
        if (buf) parts.push(buf);
        const ans = App.QTypes.cloze.collect(parts);
        const pool = Object.values(D.words).flat().concat(Object.values(D.topics).flatMap((x) => x.words)).filter((w) => !w.includes(' ') && !ans.includes(w));
        return { type: 'cloze', parts, bank: shuffle([...ans, ...U.sample(pool, 2)]), answer: ans, skill: 'tv.doan.dien', _sid: 'tv',
          prompt: `Bài đọc “${title}”: chọn từ điền vào chỗ trống.`, sub: 'Nhớ lại bài đọc trên lớp nhé!', speak: 'Chọn từ điền vào chỗ trống trong bài đọc.',
          explain: part.join(' ') };
      };
      [0, 3].forEach((k) => { if (sents.length > k) { const q = cloze(k); if (q) qs.push(q); } });
      // Sắp xếp các câu theo đúng thứ tự trong bài
      if (sents.length >= 3) {
        const st = U.rand(0, Math.max(0, sents.length - 4));
        const seq = sents.slice(st, st + 4);
        let items;
        do { items = shuffle(seq); } while (items.join() === seq.join());
        qs.push({ type: 'order', items, answer: seq, tileClass: 'text sent', skill: 'tv.vietdoan', _sid: 'tv',
          prompt: `Bài đọc “${title}”: sắp xếp các câu theo đúng thứ tự trong bài.`, explain: seq.join(' ') });
      }
      // Sắp xếp các tiếng thành câu (câu ngắn)
      const short = sents.filter((s) => { const n = s.split(' ').length; return n >= 4 && n <= 8; });
      if (short.length) {
        const s = pick(short);
        const answer = s.split(' ');
        let items;
        do { items = shuffle(answer); } while (items.join(' ') === s && new Set(answer).size > 1);
        qs.push({ type: 'order', items, answer, tileClass: 'text', skill: 'tv.cau.sapxep', _sid: 'tv', prompt: 'Sắp xếp thành câu đúng trong bài đọc:', explain: s });
      }
      // Đọc to cho bố mẹ nghe
      if (tasksOn()) {
        qs.push({ type: 'task', noStat: true, answer: 'task:weektext', skill: 'tv.dochieu', _sid: 'tv', passage: { title, text },
          task: { kind: 'read', title: `Đọc to bài “${title}”`, detail: 'Bé đọc to, rõ ràng cả bài. Bấm ⏺️ để ghi âm gửi bố mẹ nghe.' },
          prompt: '👨‍👩‍👧 Nhiệm vụ cùng bố mẹ: đọc to bài đọc.' });
      }
      qs.forEach((q, i) => { q._no = i + 1; });
      return qs;
    },
  };

  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'tv.cau.bophan': 'Bộ phận câu (Ai? Là gì? Làm gì? Thế nào?)',
    'tv.doan.dien': 'Điền từ ngữ vào đoạn văn',
    'tv.chuhoa': 'Viết chữ hoa (tô theo nét)',
    'tv.noinghe': 'Nói và nghe (xếp tranh, đáp lời)',
    'tv.vietdoan': 'Luyện viết đoạn (sắp xếp câu)',
  });
})(window.App);
