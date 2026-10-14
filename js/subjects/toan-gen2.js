/* Toán 2 – câu hỏi cho Chủ đề 3–7 (học kì 1):
   khối lượng & dung tích, cộng trừ có nhớ, hình phẳng, đồng hồ & lịch.
   Các hàm được thêm vào cùng bộ App.Gen.toan để dùng trong toan.js. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle, chance } = U;
  const { NAMES, twoNames, ADD20, SUB20, noCarryAdd, noBorrowSub, sign, solution } = App.Gen.toanUtil;
  const S = App.Svg;
  const G = App.Gen.toan;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const NUMS = ['1', '2', '3', '4'];

  // Câu hỏi chọn hình: items là các hình (chuỗi SVG), target là chỉ số hình đúng
  function picChoice(base, figs, targetIndex, labelWord = 'Hình') {
    const order = shuffle(figs.map((f, i) => ({ f, i })));
    const values = NUMS.slice(0, order.length);
    const views = {};
    order.forEach((o, k) => { views[values[k]] = o.f; });
    const ans = values[order.findIndex((o) => o.i === targetIndex)];
    return { ...base, type: 'choice', options: values, views, answer: ans, answerLabel: `${labelWord} ${ans}` };
  }

  // ================= Chủ đề 3: Khối lượng, dung tích =================
  const THINGS_KG = [
    { e: '🍉', name: 'quả dưa hấu', kg: [3, 5] },
    { e: '🎃', name: 'quả bí ngô', kg: [2, 6] },
    { e: '🍍', name: 'quả dứa', kg: [1, 2] },
    { e: '🥥', name: 'quả dừa', kg: [1, 2] },
    { e: '🍈', name: 'quả dưa lưới', kg: [1, 3] },
    { e: '🐈', name: 'chú mèo', kg: [3, 5] },
    { e: '🦆', name: 'con vịt', kg: [2, 3] },
    { e: '🧸', name: 'con gấu bông', kg: [1, 2] },
    { e: '📦', name: 'thùng hàng', kg: [3, 9] },
    { e: '🎁', name: 'hộp quà', kg: [1, 4] },
  ];
  // Tách số ki-lô-gam thành các quả cân 5 kg, 2 kg, 1 kg
  function weightsFor(kg) {
    const out = [];
    for (const w of [5, 2, 1]) while (kg >= w) { out.push(w); kg -= w; }
    return out;
  }

  // Vật nào nặng hơn / nhẹ hơn (đọc cân đĩa)
  G.heavier = () => {
    const equal = chance(0.2);
    let x, y, wx, wy;
    do {
      [x, y] = U.sample(THINGS_KG, 2);
      wx = rand(...x.kg);
      wy = rand(...y.kg);
    } while (equal ? wx !== wy : wx === wy);
    const tilt = wx > wy ? -1 : wx < wy ? 1 : 0;
    const askHeavy = chance(0.6);
    const X = cap(x.name), Y = cap(y.name), EQ = 'Hai vật nặng bằng nhau';
    const ans = tilt === 0 ? EQ : (wx > wy) === askHeavy ? X : Y;
    const heavy = wx > wy ? x.name : y.name, light = wx > wy ? y.name : x.name;
    return { type: 'choice', skill: 'kl.nangnhe', prompt: `Nhìn cân, vật nào ${askHeavy ? 'nặng' : 'nhẹ'} hơn?`,
      visual: { kind: 'balance', left: [x.e], right: [y.e], tilt },
      options: [X, Y, EQ], answer: ans, optStyle: 'text',
      hint: 'Đĩa cân nào thấp xuống thì vật trên đĩa đó nặng hơn.',
      explain: tilt ? `Đĩa cân bên ${wx > wy ? 'trái' : 'phải'} thấp hơn, nên ${heavy} nặng hơn ${light}.` : 'Cân thăng bằng nên hai vật nặng bằng nhau.' };
  };

  // Suy luận qua hai cân: hộp nào nặng nhất / nhẹ nhất
  G.heaviestChain = () => {
    const o = shuffle(['A', 'B', 'C']); // o[0] nặng nhất … o[2] nhẹ nhất
    const scale = (heavy, light) => (chance(0.5)
      ? { left: [{ box: heavy }], right: [{ box: light }], tilt: -1 }
      : { left: [{ box: light }], right: [{ box: heavy }], tilt: 1 });
    const askMax = chance(0.5);
    return { type: 'choice', skill: 'kl.nangnhe', prompt: `Nhìn hai cân, hộp nào ${askMax ? 'nặng nhất' : 'nhẹ nhất'}?`,
      visual: { kind: 'balances', items: shuffle([scale(o[0], o[1]), scale(o[1], o[2])]) },
      options: ['Hộp A', 'Hộp B', 'Hộp C'], answer: 'Hộp ' + (askMax ? o[0] : o[2]), optStyle: 'text',
      hint: 'Xem từng cân: hộp nào nặng hơn hộp nào?',
      explain: `Hộp ${o[0]} nặng hơn hộp ${o[1]}, hộp ${o[1]} nặng hơn hộp ${o[2]}.\nVậy hộp ${o[0]} nặng nhất, hộp ${o[2]} nhẹ nhất.` };
  };

  // Cân thăng bằng: vật nặng mấy ki-lô-gam?
  G.balanceKg = () => {
    const x = pick(THINGS_KG);
    const w = rand(...x.kg);
    const ws = weightsFor(w);
    return { type: 'input', skill: 'kl.kg', prompt: `Cân thăng bằng. ${cap(x.name)} cân nặng mấy ki-lô-gam?`,
      visual: { kind: 'balance', left: [x.e], right: ws.map((k) => ({ kg: k })), tilt: 0 },
      big: '? {kg}', answer: w, unit: 'kg',
      hint: 'Cân thăng bằng thì vật nặng bằng tổng các quả cân ở đĩa bên kia.',
      explain: ws.length > 1 ? `${ws.join(' kg + ')} kg = ${w} kg.` : `Quả cân ${w} kg, nên ${x.name} nặng ${w} kg.` };
  };

  // Cân thăng bằng, có thêm quả cân cùng phía với vật
  G.balanceKg2 = () => {
    const x = pick(THINGS_KG.filter((t) => t.kg[1] >= 2));
    const w = rand(Math.max(2, x.kg[0]), Math.min(8, x.kg[1]));
    const extra = rand(1, 2);
    const total = w + extra;
    return { type: 'input', skill: 'kl.kg', prompt: `Cân thăng bằng. ${cap(x.name)} cân nặng mấy ki-lô-gam?`,
      visual: { kind: 'balance', left: [x.e, { kg: extra }], right: weightsFor(total).map((k) => ({ kg: k })), tilt: 0 },
      big: '? {kg}', answer: w, unit: 'kg',
      hint: `Đĩa bên phải nặng ${total} kg. Đĩa bên trái có thêm quả cân ${extra} kg.`,
      explain: `${cap(x.name)} và quả cân ${extra} kg nặng bằng ${total} kg.\n${total} kg − ${extra} kg = ${w} kg.` };
  };

  // Cộng, trừ số đo (kg hoặc l)
  function measureCalc(unit, skill) {
    const add = chance(0.5);
    let a, b;
    if (chance(0.5)) [a, b] = pick(add ? ADD20 : SUB20);
    else [a, b] = add ? noCarryAdd() : noBorrowSub();
    const res = add ? a + b : a - b, op = add ? '+' : '−';
    return { type: 'input', skill, prompt: 'Tính:', big: `${a} {${unit}} ${op} ${b} {${unit}} = ? {${unit}}`, answer: res, unit,
      hint: 'Tính như với các số, rồi viết thêm đơn vị.',
      explain: `${a} ${op} ${b} = ${res}, nên ${a} ${unit} ${op} ${b} ${unit} = ${res} ${unit}.` };
  }
  G.kgCalc = () => measureCalc('kg', 'kl.kg');
  G.literCalc = () => measureCalc('l', 'dt.lit');

  // Bài toán có lời văn với kg, l
  const KG_STORIES = [
    { add: true, t: (a, b) => `Bao gạo cân nặng ${a} kg, bao ngô cân nặng ${b} kg. Hỏi cả hai bao cân nặng bao nhiêu ki-lô-gam?`, line: 'Cả hai bao cân nặng là', ans: 'kg' },
    { add: true, t: (a, b) => `Bác An hái được ${a} kg cam, bác Bình hái được ${b} kg cam. Hỏi cả hai bác hái được bao nhiêu ki-lô-gam cam?`, line: 'Cả hai bác hái được số ki-lô-gam cam là', ans: 'kg cam' },
    { add: true, t: (a, b) => `Túi táo cân nặng ${a} kg, túi cam nặng hơn túi táo ${b} kg. Hỏi túi cam cân nặng bao nhiêu ki-lô-gam?`, line: 'Túi cam cân nặng là', ans: 'kg' },
    { add: false, t: (a, b) => `Cửa hàng có ${a} kg đường, đã bán ${b} kg đường. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam đường?`, line: 'Cửa hàng còn lại số ki-lô-gam đường là', ans: 'kg đường' },
    { add: false, t: (a, b) => `Bao gạo cân nặng ${a} kg, bao khoai nhẹ hơn bao gạo ${b} kg. Hỏi bao khoai cân nặng bao nhiêu ki-lô-gam?`, line: 'Bao khoai cân nặng là', ans: 'kg' },
  ];
  const L_STORIES = [
    { add: true, t: (a, b) => `Thùng thứ nhất có ${a} l nước, thùng thứ hai có ${b} l nước. Hỏi cả hai thùng có bao nhiêu lít nước?`, line: 'Cả hai thùng có số lít nước là', ans: 'l nước' },
    { add: true, t: (a, b) => `Bể cá có ${a} l nước, bố đổ thêm ${b} l nước. Hỏi bể cá có tất cả bao nhiêu lít nước?`, line: 'Bể cá có tất cả số lít nước là', ans: 'l nước' },
    { add: true, t: (a, b) => `Can bé đựng ${a} l dầu, can to đựng nhiều hơn can bé ${b} l dầu. Hỏi can to đựng bao nhiêu lít dầu?`, line: 'Can to đựng số lít dầu là', ans: 'l dầu' },
    { add: false, t: (a, b) => `Can to đựng ${a} l dầu, can bé đựng ít hơn can to ${b} l dầu. Hỏi can bé đựng bao nhiêu lít dầu?`, line: 'Can bé đựng số lít dầu là', ans: 'l dầu' },
    { add: false, t: (a, b) => `Cửa hàng có ${a} l sữa, đã bán ${b} l sữa. Hỏi cửa hàng còn lại bao nhiêu lít sữa?`, line: 'Cửa hàng còn lại số lít sữa là', ans: 'l sữa' },
  ];
  function measureStory(list, unit, word) {
    const s = pick(list);
    let a, b;
    if (chance(0.5)) [a, b] = pick(s.add ? ADD20 : SUB20);
    else [a, b] = s.add ? noCarryAdd() : noBorrowSub();
    const res = s.add ? a + b : a - b;
    const text = s.t(a, b);
    return { type: 'input', skill: 'loivan.kgl', prompt: text, big: `? {${unit}}`, answer: res, unit,
      speak: text.replace(/(\d+) kg/g, '$1 ki-lô-gam').replace(/(\d+) l /g, '$1 lít '),
      hint: s.add ? `Tìm "cả hai", "tất cả" hay "${word} hơn" thì làm phép cộng.` : 'Tìm "còn lại" hay "ít hơn, nhẹ hơn" thì làm phép trừ.',
      explain: solution(s.line, a, s.add ? '+' : '−', b, res, unit, s.ans) };
  }
  G.kgStory = () => measureStory(KG_STORIES, 'kg', 'nặng');
  G.literStory = () => measureStory(L_STORIES, 'l', 'nhiều');

  // Có bao nhiêu lít nước?
  G.literCount = () => {
    if (chance(0.5)) {
      const n = rand(2, 7);
      return { type: 'input', skill: 'dt.lit', prompt: 'Mỗi chai đựng đầy 1 l nước. Có tất cả bao nhiêu lít nước?',
        visual: { kind: 'bottles', items: Array.from({ length: n }, () => ({ cap: 1 })) }, big: '? {l}', answer: n, unit: 'l',
        speak: 'Mỗi chai đựng đầy 1 lít nước. Có tất cả bao nhiêu lít nước?', explain: `Có ${n} chai, mỗi chai 1 l, nên có ${n} l nước.` };
    }
    const caps = U.sample([1, 2, 5, 10], rand(2, 3)).sort((p, q) => q - p);
    const total = caps.reduce((s, c) => s + c, 0);
    return { type: 'input', skill: 'dt.lit', prompt: 'Các can đều đầy nước. Có tất cả bao nhiêu lít nước?',
      visual: { kind: 'bottles', items: caps.map((c) => ({ cap: c })) }, big: '? {l}', answer: total, unit: 'l',
      speak: 'Các can đều đầy nước. Có tất cả bao nhiêu lít nước?', explain: `${caps.join(' l + ')} l = ${total} l.` };
  };

  // Bình nào đựng nhiều / ít nước hơn?
  G.literMore = () => {
    if (chance(0.5)) {
      const a = rand(2, 7);
      let b;
      do { b = rand(2, 7); } while (b === a);
      const more = chance(0.6);
      const isA = more ? a > b : a < b;
      return { type: 'choice', skill: 'dt.lit', prompt: `Rót hết nước trong mỗi bình ra các cốc giống nhau. Bình nào đựng ${more ? 'nhiều' : 'ít'} nước hơn?`,
        visual: { kind: 'cups', rows: [{ label: 'Bình A', n: a }, { label: 'Bình B', n: b }] },
        options: ['Bình A', 'Bình B'], answer: isA ? 'Bình A' : 'Bình B', optStyle: 'text',
        hint: 'Bình rót ra được nhiều cốc hơn thì đựng nhiều nước hơn.',
        explain: `Bình A rót được ${a} cốc, bình B rót được ${b} cốc. ${a > b ? 'Bình A' : 'Bình B'} đựng nhiều nước hơn.` };
    }
    const levels = U.sample([0.3, 0.5, 0.7, 0.9], 3);
    const labels = ['A', 'B', 'C'];
    const most = chance(0.5);
    const k = levels.indexOf(most ? Math.max(...levels) : Math.min(...levels));
    return { type: 'choice', skill: 'dt.lit', prompt: `Ba bình giống nhau. Bình nào có ${most ? 'nhiều' : 'ít'} nước nhất?`,
      visual: { kind: 'jars', items: levels.map((f, i) => ({ fill: f, label: labels[i] })) },
      options: ['Bình A', 'Bình B', 'Bình C'], answer: 'Bình ' + labels[k], optStyle: 'text',
      explain: `Các bình giống nhau nên bình có mực nước ${most ? 'cao' : 'thấp'} nhất là bình ${labels[k]}.` };
  };

  // Đọc, viết số đo kg và l
  G.unitReadWrite = () => {
    const unit = pick(['kg', 'l']);
    const word = unit === 'kg' ? 'ki-lô-gam' : 'lít', other = unit === 'kg' ? 'lít' : 'ki-lô-gam';
    const n = rand(2, 60);
    const n2 = U.rev(n) !== n && U.rev(n) > 1 ? U.rev(n) : n + 10;
    if (chance(0.5)) {
      const ans = `${U.readNumber(n)} ${word}`;
      return { type: 'choice', skill: 'dl.donvi', prompt: 'Số đo dưới đây đọc là:', big: `${n} {${unit}}`,
        options: shuffle([ans, `${U.readNumber(n)} ${other}`, `${U.readNumber(n2)} ${word}`]), answer: ans, optStyle: 'text',
        speak: 'Số đo này đọc là gì?', explain: `${n} ${unit} đọc là ${ans}.` };
    }
    const ans = `${n} ${unit}`;
    return { type: 'choice', skill: 'dl.donvi', prompt: `“${cap(U.readNumber(n))} ${word}” viết là:`,
      options: shuffle([ans, `${n} ${unit === 'kg' ? 'l' : 'kg'}`, `${n2} ${unit}`]), answer: ans, optStyle: 'text',
      explain: `${cap(U.readNumber(n))} ${word} viết là ${ans}.` };
  };

  // Chọn đơn vị kg hay l
  const UNIT_ITEMS = [
    ['Bao gạo cân nặng 25 ?.', 'kg'], ['Quả dưa hấu nặng 3 ?.', 'kg'], ['Bạn Nam cân nặng 24 ?.', 'kg'],
    ['Túi táo cân nặng 2 ?.', 'kg'], ['Con ngỗng nặng 5 ?.', 'kg'], ['Thùng sách nặng 10 ?.', 'kg'],
    ['Cái xô đựng được 10 ? nước.', 'l'], ['Chai nước to đựng 1 ? nước.', 'l'], ['Can dầu đựng 5 ? dầu.', 'l'],
    ['Bể cá đựng được 40 ? nước.', 'l'], ['Hộp sữa to đựng 1 ? sữa.', 'l'], ['Nồi canh có khoảng 3 ? canh.', 'l'],
  ];
  G.chooseUnit = () => {
    const [t, u] = pick(UNIT_ITEMS);
    const opts = ['kg (ki-lô-gam)', 'l (lít)'];
    return { type: 'choice', skill: 'dl.uocluong', prompt: 'Chọn đơn vị thích hợp điền vào chỗ trống:', big: t, bigText: true,
      options: opts, answer: u === 'kg' ? opts[0] : opts[1], slotAnswer: u, optStyle: 'text',
      speak: 'Chọn ki-lô-gam hay lít để điền vào chỗ trống: ' + t.replace('?', '...'),
      explain: u === 'kg' ? 'Đo độ nặng của đồ vật thì dùng ki-lô-gam (kg).' : 'Đo lượng nước, dầu, sữa… thì dùng lít (l).' };
  };

  // Ước lượng
  const ESTIMATES = [
    ['Một bạn học sinh lớp 2 cân nặng khoảng:', '25 kg', ['2 kg', '90 kg']],
    ['Một quả dưa hấu cân nặng khoảng:', '4 kg', ['40 kg', '90 kg']],
    ['Một chú mèo cân nặng khoảng:', '3 kg', ['30 kg', '60 kg']],
    ['Một bao gạo to cân nặng khoảng:', '50 kg', ['5 kg', '1 kg']],
    ['Một cái xô đựng được khoảng:', '10 l', ['1 l', '90 l']],
    ['Một chai nước to đựng được khoảng:', '1 l', ['10 l', '50 l']],
    ['Một cái ca nhựa đựng được khoảng:', '1 l', ['20 l', '60 l']],
    ['Một bể cá cảnh đựng được khoảng:', '40 l', ['1 l', '2 l']],
  ];
  G.estimate = () => {
    const [t, a, w] = pick(ESTIMATES);
    return { type: 'choice', skill: 'dl.uocluong', prompt: t, options: shuffle([a, ...w]), answer: a, optStyle: 'text',
      hint: 'Hãy nghĩ tới đồ vật thật mà em đã từng nhấc lên hoặc rót nước.', explain: `${t.replace(':', '')} ${a}.` };
  };

  // ================= Chủ đề 4: Cộng, trừ có nhớ trong phạm vi 100 =================
  // a1: 36 + 7, a2: 36 + 27, s1: 32 − 5, s2: 52 − 28
  function carryPair(kind) {
    for (;;) {
      if (kind === 'a1') { const a = rand(11, 89), b = rand(2, 9); if ((a % 10) + b >= 10 && a + b <= 100) return [a, b]; }
      if (kind === 'a2') { const a = rand(11, 89), b = rand(11, 89); if ((a % 10) + (b % 10) >= 10 && a + b <= 100) return [a, b]; }
      if (kind === 's1') { const a = rand(20, 98), b = rand(2, 9); if (a % 10 < b) return [a, b]; }
      if (kind === 's2') { const a = rand(30, 98), b = rand(11, a - 1); if (a % 10 < b % 10) return [a, b]; }
    }
  }
  // Lời giải đặt tính có nhớ, theo cách nói trong sách
  function explainCarry(a, b, op) {
    const a1 = Math.floor(a / 10), a0 = a % 10, b1 = Math.floor(b / 10), b0 = b % 10;
    const lines = [];
    if (op === '+') {
      lines.push(`${a0} cộng ${b0} bằng ${a0 + b0}, viết ${a0 + b0 - 10}, nhớ 1.`);
      if (b < 10) lines.push(`${a1} thêm 1 bằng ${a1 + 1}, viết ${a1 + 1}.`);
      else lines.push(`${a1} cộng ${b1} bằng ${a1 + b1}, thêm 1 bằng ${a1 + b1 + 1}, viết ${a1 + b1 + 1}.`);
      lines.push(`Vậy ${a} + ${b} = ${a + b}.`);
    } else {
      lines.push(`${a0} không trừ được ${b0}, lấy ${a0 + 10} trừ ${b0} bằng ${a0 + 10 - b0}, viết ${a0 + 10 - b0}, nhớ 1.`);
      if (b < 10) {
        lines.push(a1 - 1 > 0 ? `${a1} trừ 1 bằng ${a1 - 1}, viết ${a1 - 1}.` : `${a1} trừ 1 bằng 0.`);
      } else {
        const t = a1 - b1 - 1;
        lines.push(`${b1} thêm 1 bằng ${b1 + 1}, ${a1} trừ ${b1 + 1} bằng ${t}${t > 0 ? `, viết ${t}` : ''}.`);
      }
      lines.push(`Vậy ${a} − ${b} = ${a - b}.`);
    }
    return lines.join('\n');
  }
  const HINT_ADD = 'Cộng hàng đơn vị trước. Được 10 trở lên thì viết chữ số hàng đơn vị và nhớ 1 sang hàng chục.';
  const HINT_SUB = 'Hàng đơn vị không trừ được thì lấy thêm 10 rồi trừ, sau đó nhớ 1 sang hàng chục.';
  function carryCalc(kind, vertical) {
    const [a, b] = carryPair(kind);
    const add = kind[0] === 'a', op = add ? '+' : '−', res = add ? a + b : a - b;
    const q = { type: 'input', skill: add ? 'pt.congnho' : 'pt.trunho', answer: res, hint: add ? HINT_ADD : HINT_SUB, explain: explainCarry(a, b, op) };
    if (vertical) return { ...q, prompt: 'Đặt tính rồi tính:', visual: { kind: 'vertical', a, b, op, res }, speak: `Đặt tính rồi tính: ${a} ${add ? 'cộng' : 'trừ'} ${b}.` };
    return { ...q, prompt: 'Tính:', big: `${a} ${op} ${b} = ?` };
  }
  G.addCarry1V = () => carryCalc('a1', true);
  G.addCarry1 = () => carryCalc('a1', false);
  G.addCarry2V = () => carryCalc('a2', true);
  G.addCarry2 = () => carryCalc('a2', false);
  G.subBorrow1V = () => carryCalc('s1', true);
  G.subBorrow1 = () => carryCalc('s1', false);
  G.subBorrow2V = () => carryCalc('s2', true);
  G.subBorrow2 = () => carryCalc('s2', false);
  G.addCarryMix = () => carryCalc(pick(['a1', 'a2']), chance(0.5));
  G.carryMix = () => carryCalc(pick(['a1', 'a2', 's1', 's2']), chance(0.5));

  // Cộng thành số tròn chục; tách số để cộng qua chục (38 + 5 = 38 + 2 + 3)
  G.addToTens = () => {
    for (;;) {
      const a = rand(11, 89);
      if (a % 10 === 0) continue;
      const r = 10 - (a % 10);
      if (chance(0.5)) {
        return { type: 'input', skill: 'pt.congnho', prompt: 'Tính nhẩm:', big: `${a} + ${r} = ?`, answer: a + r,
          hint: `${a % 10} + ${r} = 10.`, explain: `${a % 10} + ${r} = 10, nên ${a} + ${r} = ${a + r}.` };
      }
      if (r >= 9) continue;
      const b = rand(r + 1, 9);
      if (a + b > 100) continue;
      return { type: 'input', skill: 'pt.congnho', prompt: `Điền số thích hợp (tách ${b} để được số tròn chục):`,
        big: `${a} + ${b} = ${a} + ${r} + ?`, answer: b - r, speak: `${a} cộng ${b} bằng ${a} cộng ${r} cộng mấy?`,
        hint: `${b} gồm ${r} và mấy?`, explain: `${b} = ${r} + ${b - r}: ${a} + ${r} = ${a + r}, ${a + r} + ${b - r} = ${a + b}.` };
    }
  };
  // Trừ từ số tròn chục; tách số để trừ về số tròn chục (42 − 5 = 42 − 2 − 3)
  G.subFromTens = () => {
    for (;;) {
      if (chance(0.5)) {
        const a = rand(2, 9) * 10, b = rand(1, 9);
        return { type: 'input', skill: 'pt.trunho', prompt: 'Tính nhẩm:', big: `${a} − ${b} = ?`, answer: a - b,
          hint: `Lấy 10 − ${b} trước.`, explain: `10 − ${b} = ${10 - b}, nên ${a} − ${b} = ${a - 10} + ${10 - b} = ${a - b}.` };
      }
      const a = rand(21, 98), r = a % 10;
      if (r === 0 || r === 9) continue;
      const b = rand(r + 1, 9);
      return { type: 'input', skill: 'pt.trunho', prompt: `Điền số thích hợp (tách ${b} để trừ về số tròn chục):`,
        big: `${a} − ${b} = ${a} − ${r} − ?`, answer: b - r, speak: `${a} trừ ${b} bằng ${a} trừ ${r} trừ mấy?`,
        hint: `${b} gồm ${r} và mấy?`, explain: `${b} = ${r} + ${b - r}: ${a} − ${r} = ${a - r}, ${a - r} − ${b - r} = ${a - b}.` };
    }
  };

  // So sánh phép tính có nhớ với một số
  function carryCompare(kinds) {
    const kind = pick(kinds);
    const [a, b] = carryPair(kind);
    const add = kind[0] === 'a', op = add ? '+' : '−';
    const v = add ? a + b : a - b;
    let c = v + pick([-10, -2, -1, 0, 0, 1, 2, 10]);
    if (c < 0 || c > 100) c = v;
    const s = sign(v, c);
    return { type: 'choice', skill: add ? 'pt.congnho' : 'pt.trunho', prompt: 'Chọn dấu thích hợp:', big: `${a} ${op} ${b} ? ${c}`,
      options: ['>', '<', '='], answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${a} ${add ? 'cộng' : 'trừ'} ${b}, so với ${c}.`, explain: `${a} ${op} ${b} = ${v}, mà ${v} ${s} ${c}.` };
  }
  G.addCarryCompare = () => carryCompare(['a1', 'a2']);
  G.subBorrowCompare = () => carryCompare(['s1', 's2']);

  // Tìm số chưa biết (có nhớ)
  G.carryMissing = () => {
    const kind = pick(['a1', 'a2', 's1', 's2']);
    const [a, b] = carryPair(kind);
    const base = { type: 'input', skill: kind[0] === 'a' ? 'pt.congnho' : 'pt.trunho', prompt: 'Điền số thích hợp:' };
    if (kind[0] === 'a') {
      return chance(0.5)
        ? { ...base, big: `${a} + ? = ${a + b}`, answer: b, hint: `Lấy ${a + b} trừ ${a}.`, explain: `${a + b} − ${a} = ${b}, nên số cần điền là ${b}.` }
        : { ...base, big: `? + ${b} = ${a + b}`, answer: a, hint: `Lấy ${a + b} trừ ${b}.`, explain: `${a + b} − ${b} = ${a}, nên số cần điền là ${a}.` };
    }
    return chance(0.5)
      ? { ...base, big: `${a} − ? = ${a - b}`, answer: b, hint: `Lấy ${a} trừ ${a - b}.`, explain: `${a} − ${a - b} = ${b}, nên số cần điền là ${b}.` }
      : { ...base, big: `? − ${b} = ${a - b}`, answer: a, hint: `Lấy ${a - b} cộng ${b}.`, explain: `${a - b} + ${b} = ${a}, nên số cần điền là ${a}.` };
  };

  // Bài toán có lời văn (có nhớ)
  const NHO_STORIES = [
    { add: true, t: (a, b, n) => `Nhà ${n} nuôi ${a} con gà và ${b} con vịt. Hỏi nhà ${n} nuôi tất cả bao nhiêu con gà và vịt?`, line: (n) => `Nhà ${n} nuôi tất cả số con gà và vịt là`, cls: 'con', ans: 'con gà và vịt' },
    { add: true, t: (a, b) => `Thư viện có ${a} quyển truyện tranh, thư viện mua thêm ${b} quyển truyện tranh. Hỏi thư viện có tất cả bao nhiêu quyển truyện tranh?`, line: 'Thư viện có tất cả số quyển truyện tranh là', cls: 'quyển', ans: 'quyển truyện tranh' },
    { add: true, t: (a, b) => `Lớp 2A trồng được ${a} cây, lớp 2B trồng được ${b} cây. Hỏi cả hai lớp trồng được bao nhiêu cây?`, line: 'Cả hai lớp trồng được số cây là', cls: 'cây', ans: 'cây' },
    { add: true, t: (a, b, n, m) => `${n} gấp được ${a} con hạc giấy, ${m} gấp được nhiều hơn ${n} ${b} con hạc giấy. Hỏi ${m} gấp được bao nhiêu con hạc giấy?`, line: (n, m) => `${m} gấp được số con hạc giấy là`, cls: 'con', ans: 'con hạc giấy' },
    { add: false, t: (a, b) => `Cửa hàng có ${a} chiếc xe đạp, đã bán ${b} chiếc. Hỏi cửa hàng còn lại bao nhiêu chiếc xe đạp?`, line: 'Cửa hàng còn lại số chiếc xe đạp là', cls: 'chiếc', ans: 'chiếc xe đạp' },
    { add: false, t: (a, b) => `Trên xe buýt có ${a} hành khách, đến bến có ${b} người xuống xe. Hỏi trên xe buýt còn lại bao nhiêu hành khách?`, line: 'Trên xe buýt còn lại số hành khách là', cls: 'người', ans: 'hành khách' },
    { add: false, t: (a, b) => `Đội đồng diễn có ${a} bạn nam, số bạn nữ ít hơn số bạn nam ${b} bạn. Hỏi đội đồng diễn có bao nhiêu bạn nữ?`, line: 'Đội đồng diễn có số bạn nữ là', cls: 'bạn', ans: 'bạn nữ' },
  ];
  function storyCarry(kind) {
    const add = kind[0] === 'a';
    const s = pick(NHO_STORIES.filter((x) => x.add === add));
    const [a, b] = carryPair(kind);
    const [n, m] = twoNames();
    const res = add ? a + b : a - b;
    const text = s.t(a, b, n, m);
    return { type: 'input', skill: 'loivan.nho', prompt: text, big: '?', answer: res,
      hint: add ? 'Tìm "tất cả", "cả hai" hay "nhiều hơn" thì làm phép cộng.' : 'Tìm "còn lại" hay "ít hơn" thì làm phép trừ.',
      explain: solution(typeof s.line === 'function' ? s.line(n, m) : s.line, a, add ? '+' : '−', b, res, s.cls, s.ans) };
  }
  G.storyAddCarry1 = () => storyCarry('a1');
  G.storyAddCarry2 = () => storyCarry('a2');
  G.storySubBorrow1 = () => storyCarry('s1');
  G.storySubBorrow2 = () => storyCarry('s2');
  G.storyCarryMix = () => storyCarry(pick(['a1', 'a2', 's1', 's2']));

  // ================= Chủ đề 5: Hình phẳng =================
  const LINE_FIGS = {
    seg: () => S.geo({ w: 140, h: 84, pts: { A: [24, rand(30, 66)], B: [116, rand(30, 66)] }, segs: [['A', 'B']] }),
    line: () => S.geo({ w: 140, h: 84, pts: { A: [46, rand(34, 62)], B: [94, rand(34, 62)] }, lines: [['A', 'B']] }),
    curve: () => S.geo({ w: 140, h: 84, curves: [`M 14 ${rand(55, 70)} C 45 ${rand(-5, 20)}, 92 ${rand(70, 95)}, 126 ${rand(22, 40)}`] }),
    zigzag: () => S.geo({ w: 140, h: 84, pts: { A: [16, 66], B: [52, 28], C: [88, 66], D: [124, 28] }, path: ['A', 'B', 'C', 'D'] }),
  };
  const LINE_NAMES = { seg: 'đoạn thẳng', line: 'đường thẳng', curve: 'đường cong', zigzag: 'đường gấp khúc' };
  const LINE_EXPLAIN = {
    seg: 'Đoạn thẳng có hai đầu là hai điểm.',
    line: 'Đường thẳng là đường thẳng kéo dài về hai phía, không có hai đầu.',
    curve: 'Đường cong là đường uốn lượn, không thẳng.',
    zigzag: 'Đường gấp khúc gồm nhiều đoạn thẳng nối tiếp nhau.',
  };
  function identifyLine(kinds) {
    const target = pick(kinds);
    return picChoice({ skill: 'hh.duong', prompt: `Hình nào là ${LINE_NAMES[target]}?`, explain: LINE_EXPLAIN[target] },
      kinds.map((k) => LINE_FIGS[k]()), kinds.indexOf(target));
  }
  G.identifyLine = () => identifyLine(['seg', 'line', 'curve']);
  G.identifyLine4 = () => identifyLine(['seg', 'line', 'curve', 'zigzag']);

  // Ba điểm nào thẳng hàng?
  function collinearPoints() {
    const ang = (rand(-35, 35) * Math.PI) / 180, cx = 150, cy = 100;
    const ts = [-98, rand(-25, 25), 98];
    const onLine = ts.map((t) => [cx + t * Math.cos(ang), cy + t * Math.sin(ang)]);
    const off = (chance(0.5) ? 1 : -1) * rand(48, 60), t4 = rand(-45, 45);
    const outPt = [cx + t4 * Math.cos(ang) - off * Math.sin(ang), cy + t4 * Math.sin(ang) + off * Math.cos(ang)];
    return { onLine, outPt };
  }
  G.collinear = () => {
    const { onLine, outPt } = collinearPoints();
    const L = shuffle(['A', 'B', 'C', 'D']);
    const pts = {};
    onLine.forEach((p, i) => { pts[L[i]] = p; });
    pts[L[3]] = outPt;
    const ans = L.slice(0, 3).sort().join(', ');
    const options = ['A, B, C', 'A, B, D', 'A, C, D', 'B, C, D'];
    return { type: 'choice', skill: 'hh.thanghang', prompt: 'Ba điểm nào thẳng hàng?', visual: { kind: 'geo', w: 300, h: 200, pts },
      options, answer: ans, optStyle: 'text',
      hint: 'Ba điểm thẳng hàng cùng nằm trên một đường thẳng. Thử đặt cạnh thước kẻ qua ba điểm.',
      explain: `Ba điểm ${ans} cùng nằm trên một đường thẳng nên thẳng hàng.` };
  };
  G.collinearTF = () => {
    const { onLine, outPt } = collinearPoints();
    const yes = chance(0.5);
    const three = yes ? onLine : [onLine[0], outPt, onLine[2]];
    const pts = { A: three[0], B: three[1], C: three[2] };
    return { type: 'choice', skill: 'hh.thanghang', prompt: 'Ba điểm A, B, C có thẳng hàng không?', visual: { kind: 'geo', w: 300, h: 200, pts },
      options: ['Có', 'Không'], answer: yes ? 'Có' : 'Không', optStyle: 'text',
      hint: 'Ba điểm thẳng hàng cùng nằm trên một đường thẳng.',
      explain: yes ? 'Ba điểm A, B, C cùng nằm trên một đường thẳng nên thẳng hàng.' : 'Điểm B không nằm trên đường thẳng đi qua A và C nên ba điểm không thẳng hàng.' };
  };

  // Đếm đoạn thẳng
  const FIGS_NAMED = [
    { pts: { A: [150, 28], B: [60, 168], C: [240, 168] }, segs: [['A', 'B'], ['B', 'C'], ['C', 'A']] },
    { pts: { A: [70, 34], B: [232, 44], C: [252, 162], D: [48, 152] }, segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']] },
    { pts: { A: [70, 34], B: [232, 44], C: [252, 162], D: [48, 152] }, segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C']] },
    { pts: { O: [150, 168], A: [40, 52], B: [150, 26], C: [260, 52] }, segs: [['O', 'A'], ['O', 'B'], ['O', 'C']] },
    { pts: { O: [150, 168], A: [34, 90], B: [92, 30], C: [208, 30], D: [266, 90] }, segs: [['O', 'A'], ['O', 'B'], ['O', 'C'], ['O', 'D']] },
  ];
  G.countSegments = () => {
    if (chance(0.45)) {
      const n = rand(2, 5);
      const segs = U.sample([0, 1, 2, 3, 4, 5], n).map((c) => {
        const cx = 50 + (c % 3) * 100, cy = 50 + Math.floor(c / 3) * 100;
        const len = rand(26, 38), a = (rand(0, 179) * Math.PI) / 180;
        return [cx - len * Math.cos(a), cy - len * Math.sin(a), cx + len * Math.cos(a), cy + len * Math.sin(a)];
      });
      return { type: 'input', skill: 'hh.duong', prompt: 'Hình vẽ dưới đây có mấy đoạn thẳng?', visual: { kind: 'geo', w: 300, h: 200, rawSegs: segs },
        big: '?', answer: n, explain: `Đếm từng đoạn thẳng: có ${n} đoạn thẳng.` };
    }
    const f = pick(FIGS_NAMED);
    const names = f.segs.map(([a, b]) => a + b);
    return { type: 'input', skill: 'hh.duong', prompt: 'Hình vẽ dưới đây có mấy đoạn thẳng?', visual: { kind: 'geo', w: 300, h: 200, pts: f.pts, segs: f.segs },
      big: '?', answer: names.length, hint: 'Gọi tên từng đoạn thẳng bằng hai điểm ở hai đầu để khỏi đếm sót.',
      explain: `Các đoạn thẳng: ${names.join(', ')}. Có ${names.length} đoạn thẳng.` };
  };

  // Đường gấp khúc: độ dài các đoạn tỉ lệ với số đo
  function makePolyline(n) {
    const lens = Array.from({ length: n }, () => rand(2, 9));
    let x = 0, y = 0;
    const raw = [[0, 0]];
    lens.forEach((L, i) => {
      const ang = ((i % 2 ? 1 : -1) * rand(25, 55) * Math.PI) / 180;
      const d = L + 3; // đoạn dài hơn thì vẽ dài hơn, nhưng đoạn ngắn không quá ngắn (đủ chỗ ghi số đo)
      x += d * Math.cos(ang);
      y += d * Math.sin(ang);
      raw.push([x, y]);
    });
    const W = 320, H = 196, pad = 36;
    const xs = raw.map((p) => p[0]), ys = raw.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const k = Math.min((W - 2 * pad) / Math.max(1, maxX - minX), (H - 2 * pad) / Math.max(1, maxY - minY));
    const offX = pad + (W - 2 * pad - (maxX - minX) * k) / 2, offY = pad + (H - 2 * pad - (maxY - minY) * k) / 2;
    const P = raw.map(([px, py]) => [offX + (px - minX) * k, offY + (py - minY) * k]);
    const letters = 'ABCDEFG'.slice(0, n + 1).split('');
    const pts = {};
    letters.forEach((l, i) => { pts[l] = P[i]; });
    // số đo đặt ở giữa mỗi đoạn, lệch lên phía trên đoạn thẳng
    const lensLbl = lens.map((L, i) => {
      const [x1, y1] = P[i], [x2, y2] = P[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      let nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      if (ny > 0) { nx = -nx; ny = -ny; }
      return [(x1 + x2) / 2 + nx * 17, (y1 + y2) / 2 + ny * 17 + 5, L + ' cm'];
    });
    return { pts, letters, lens, lensLbl, W, H };
  }
  G.polylineLength = () => {
    const pl = makePolyline(rand(2, 4));
    const total = pl.lens.reduce((s, v) => s + v, 0);
    const name = pl.letters.join('');
    return { type: 'input', skill: 'hh.gapkhuc', prompt: `Tính độ dài đường gấp khúc ${name}.`,
      visual: { kind: 'geo', w: pl.W, h: pl.H, pts: pl.pts, path: pl.letters, lens: pl.lensLbl },
      big: '? {cm}', answer: total, unit: 'cm', speak: `Tính độ dài đường gấp khúc ${pl.letters.join(' ')}.`,
      hint: 'Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng của nó.',
      explain: `Độ dài đường gấp khúc ${name} là:\n${pl.lens.join(' + ')} = ${total} (cm)` };
  };
  G.polylineCount = () => {
    const n = rand(2, 5);
    const pl = makePolyline(n);
    const segs = pl.letters.slice(1).map((l, i) => pl.letters[i] + l);
    return { type: 'input', skill: 'hh.gapkhuc', prompt: `Đường gấp khúc ${pl.letters.join('')} gồm mấy đoạn thẳng?`,
      visual: { kind: 'geo', w: pl.W, h: pl.H, pts: pl.pts, path: pl.letters }, big: '?', answer: n,
      speak: `Đường gấp khúc ${pl.letters.join(' ')} gồm mấy đoạn thẳng?`,
      explain: `Các đoạn thẳng: ${segs.join(', ')}. Có ${n} đoạn thẳng.` };
  };

  // Hình tứ giác
  G.quadIdentify = () => {
    const not = chance(0.3);
    const names = not ? [pick(S.NONQUADS), ...U.sample(S.QUADS, 3)] : [pick(S.QUADS), ...U.sample(S.NONQUADS, 3)];
    const base = { skill: 'hh.tugiac', prompt: not ? 'Hình nào KHÔNG phải là hình tứ giác?' : 'Hình nào là hình tứ giác?',
      hint: 'Hình tứ giác có 4 cạnh và 4 đỉnh.',
      explain: not ? 'Các hình còn lại đều có 4 cạnh; hình này không có đúng 4 cạnh nên không phải hình tứ giác.' : 'Hình tứ giác là hình có 4 cạnh và 4 đỉnh.' };
    return picChoice(base, names.map((n, i) => S.shape(n, i)), 0);
  };
  G.quadCount = () => {
    const n = rand(5, 7), k = rand(1, Math.min(4, n - 1));
    const items = shuffle([...Array.from({ length: k }, () => pick(S.QUADS)), ...Array.from({ length: n - k }, () => pick(S.NONQUADS))]);
    return { type: 'input', skill: 'hh.tugiac', prompt: 'Có bao nhiêu hình tứ giác?', visual: { kind: 'shapes', items }, big: '?', answer: k,
      hint: 'Đếm những hình có 4 cạnh.', explain: `Có ${k} hình có 4 cạnh, nên có ${k} hình tứ giác.` };
  };

  // Đo đoạn thẳng bằng thước
  G.measureRuler = () => {
    const len = rand(2, 10);
    return { type: 'input', skill: 'hh.do', prompt: 'Đoạn thẳng AB dài mấy xăng-ti-mét?', visual: { kind: 'ruler', len, start: 0 },
      big: '? {cm}', answer: len, unit: 'cm', speak: 'Đoạn thẳng A B dài mấy xăng-ti-mét?',
      hint: 'Đầu A đặt ở vạch 0. Xem đầu B ở vạch số mấy.', explain: `Đầu A ở vạch 0, đầu B ở vạch ${len}, nên AB dài ${len} cm.` };
  };
  G.measureRuler2 = () => {
    const start = rand(1, 3), len = rand(2, 10 - start);
    return { type: 'input', skill: 'hh.do', prompt: 'Đoạn thẳng AB dài mấy xăng-ti-mét?', visual: { kind: 'ruler', len, start },
      big: '? {cm}', answer: len, unit: 'cm', speak: 'Đoạn thẳng A B dài mấy xăng-ti-mét? Chú ý đầu A không đặt ở vạch 0.',
      hint: 'Đầu A không ở vạch 0. Lấy số ở đầu B trừ số ở đầu A.', explain: `Đầu A ở vạch ${start}, đầu B ở vạch ${start + len}.\n${start + len} − ${start} = ${len} (cm)` };
  };

  // Ghép hình từ các ô vuông
  function polyomino(n) {
    const cells = [[0, 0]];
    const seen = new Set(['0,0']);
    while (cells.length < n) {
      const [x, y] = pick(cells);
      const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      const c = [x + dx, y + dy];
      if (Math.abs(c[0]) > 3 || Math.abs(c[1]) > 2 || seen.has(c.join(','))) continue;
      seen.add(c.join(','));
      cells.push(c);
    }
    return cells;
  }
  G.shapeCompose = () => {
    const n = rand(4, 9);
    return { type: 'input', skill: 'hh.ghephinh', prompt: 'Hình dưới đây được ghép từ mấy ô vuông?', visual: { kind: 'grid', cells: polyomino(n) },
      big: '?', answer: n, hint: 'Đếm lần lượt từng hàng ô vuông.', explain: `Đếm từng ô vuông: có ${n} ô vuông.` };
  };

  // ================= Chủ đề 6: Ngày – giờ, giờ – phút, ngày – tháng =================
  const MINS = [0, 15, 30];
  const tText = (h, m, ruoi = false) => (m === 0 ? `${h} giờ` : m === 30 && ruoi ? `${h} giờ rưỡi` : `${h} giờ ${m} phút`);
  const nextH = (h) => (h % 12) + 1;
  const prevH = (h) => ((h + 10) % 12) + 1;
  const HINT_CLOCK = 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 12: giờ đúng; chỉ số 3: 15 phút; chỉ số 6: 30 phút.';
  const explainClock = (h, m) => (m === 0 ? `Kim dài chỉ số 12, kim ngắn chỉ số ${h}: ${h} giờ.`
    : m === 15 ? `Kim dài chỉ số 3 (15 phút), kim ngắn vừa qua số ${h}: ${h} giờ 15 phút.`
      : `Kim dài chỉ số 6 (30 phút), kim ngắn ở giữa số ${h} và số ${nextH(h)}: ${h} giờ 30 phút (${h} giờ rưỡi).`);

  G.clockRead = () => {
    const h = rand(1, 12), m = pick(MINS);
    const ruoi = m === 30 && chance(0.3);
    const ans = tText(h, m, ruoi);
    const cands = [tText(nextH(h), m, ruoi), tText(prevH(h), m, ruoi), ...MINS.filter((x) => x !== m).map((x) => tText(h, x))];
    if (m === 15) cands.push(`${h} giờ 3 phút`);
    if (m === 30) cands.push(`${h} giờ 6 phút`);
    if (m === 0 && h !== 12) cands.push(`12 giờ ${h * 5} phút`);
    const wrong = U.sample(U.uniq(cands).filter((c) => c !== ans), 3);
    return { type: 'choice', skill: 'tg.dongho', prompt: 'Đồng hồ chỉ mấy giờ?', visual: { kind: 'clock', h, m },
      options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text', hint: HINT_CLOCK, explain: explainClock(h, m) };
  };

  function clockPickQ(h, m, prompt) {
    const set = [[h, m], [nextH(h), m], ...MINS.filter((x) => x !== m).map((x) => [h, x])];
    return picChoice({ skill: 'tg.dongho', prompt, hint: HINT_CLOCK, explain: explainClock(h, m) },
      set.map(([a, b]) => S.clock(a, b)), 0, 'Đồng hồ');
  }
  G.clockPick = () => {
    const h = rand(1, 12), m = pick(MINS);
    return clockPickQ(h, m, `Đồng hồ nào chỉ ${tText(h, m)}?`);
  };

  // Nối đồng hồ kim với đồng hồ điện tử
  G.digitalMatch = () => {
    const hours = U.sample(U.range(1, 11), 3);
    const pairs = hours.map((h) => {
      const m = pick(MINS), H = chance(0.5) ? h + 12 : h;
      return [{ html: S.clock(h, m) }, { html: S.digital(H, m) }];
    });
    return { type: 'match', skill: 'tg.dongho', prompt: 'Nối hai đồng hồ chỉ cùng giờ:', pairs,
      speak: 'Nối đồng hồ kim với đồng hồ điện tử chỉ cùng giờ. Ví dụ 15 giờ là 3 giờ chiều.' };
  };

  // Giờ theo buổi (sáng 1–10 giờ, trưa 11–12 giờ, chiều 13–18 giờ, tối 19–21 giờ, đêm 22–24 giờ)
  const buoiOf = (H) => (H <= 10 ? 'sáng' : H <= 12 ? 'trưa' : H <= 18 ? 'chiều' : H <= 21 ? 'tối' : 'đêm');
  G.dayParts = () => {
    const H = rand(13, 23), h = H - 12, b = buoiOf(H);
    if (chance(0.5)) {
      return { type: 'input', skill: 'tg.buoi', prompt: `${H} giờ còn gọi là mấy giờ ${b}?`, big: `${H} giờ = ? giờ ${b}`, answer: h,
        hint: `Lấy ${H} trừ 12.`, explain: `${H} − 12 = ${h}, nên ${H} giờ là ${h} giờ ${b}.` };
    }
    return { type: 'input', skill: 'tg.buoi', prompt: `${h} giờ ${b} còn gọi là mấy giờ?`, big: `${h} giờ ${b} = ? giờ`, answer: H,
      hint: `Lấy ${h} cộng 12.`, explain: `${h} + 12 = ${H}, nên ${h} giờ ${b} là ${H} giờ.` };
  };

  G.timeFacts = () => pick([
    () => ({ type: 'input', skill: 'tg.buoi', prompt: 'Điền số thích hợp:', big: '1 ngày = ? giờ', answer: 24, explain: 'Một ngày có 24 giờ.' }),
    () => ({ type: 'input', skill: 'tg.buoi', prompt: 'Điền số thích hợp:', big: '1 giờ = ? phút', answer: 60, explain: 'Một giờ có 60 phút.' }),
    () => ({ type: 'choice', skill: 'tg.dongho', prompt: 'Trên mặt đồng hồ, kim ngắn chỉ gì?', options: ['Chỉ giờ', 'Chỉ phút'], answer: 'Chỉ giờ', optStyle: 'text', explain: 'Kim ngắn là kim giờ, kim dài là kim phút.' }),
    () => ({ type: 'choice', skill: 'tg.dongho', prompt: 'Trên mặt đồng hồ, kim dài chỉ gì?', options: ['Chỉ giờ', 'Chỉ phút'], answer: 'Chỉ phút', optStyle: 'text', explain: 'Kim ngắn là kim giờ, kim dài là kim phút.' }),
  ])();

  // Giờ của các hoạt động trong ngày
  const ACTS = [
    { what: 'thức dậy', h: 6, m: 0, H: 6 }, { what: 'ăn sáng', h: 6, m: 15, H: 6 }, { what: 'đến trường', h: 7, m: 0, H: 7 },
    { what: 'ăn trưa', h: 11, m: 0, H: 11 }, { what: 'tan học', h: 4, m: 30, H: 16 }, { what: 'đá bóng', h: 5, m: 15, H: 17 },
    { what: 'ăn tối', h: 7, m: 0, H: 19 }, { what: 'đọc truyện', h: 8, m: 30, H: 20 }, { what: 'đi ngủ', h: 9, m: 0, H: 21 },
  ];
  G.timeActivity = () => {
    const a = pick(ACTS), n = pick(NAMES), b = buoiOf(a.H);
    const v = rand(0, 2);
    if (v === 0) return clockPickQ(a.h, a.m, `${n} ${a.what} lúc ${tText(a.h, a.m)} ${b}. Đồng hồ nào chỉ giờ đó?`);
    if (v === 1 && a.H > 12) {
      const mins = a.m ? ` ${a.m} phút` : '';
      return { type: 'input', skill: 'tg.buoi', prompt: `${n} ${a.what} lúc ${a.H} giờ${mins}. Đó là mấy giờ ${b}?`, big: `? giờ${mins} ${b}`, answer: a.h,
        hint: `Lấy ${a.H} trừ 12.`, explain: `${a.H} − 12 = ${a.h}, nên đó là ${tText(a.h, a.m)} ${b}.` };
    }
    const ans = `${tText(a.h, a.m)} ${b}`;
    const swapped = b === 'sáng' || b === 'trưa' ? 'tối' : 'sáng'; // "11 giờ sáng" cũng hay được nói, nên không dùng làm đáp án sai
    const wrong = [`${tText(a.h, a.m)} ${swapped}`, `${tText(nextH(a.h), a.m)} ${b}`, `${tText(a.h, a.m === 0 ? 30 : 0)} ${b}`];
    return { type: 'choice', skill: 'tg.dongho', prompt: `Đồng hồ chỉ giờ ${n} ${a.what} (buổi ${b}). Đó là mấy giờ?`, visual: { kind: 'clock', h: a.h, m: a.m },
      options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text', hint: HINT_CLOCK, explain: explainClock(a.h, a.m) };
  };

  // ---------- Lịch (các tháng của năm học 2026 – 2027) ----------
  const WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const wdMid = (i) => (i === 0 ? 'Chủ nhật' : 'thứ ' + WD[i].slice(4)); // viết giữa câu: "thứ Hai"
  const MONTHS = [[2026, 9], [2026, 10], [2026, 11], [2026, 12], [2027, 1], [2027, 2], [2027, 3], [2027, 4], [2027, 5]];
  const daysIn = (y, mo) => new Date(y, mo, 0).getDate();
  const wdOf = (y, mo, d) => new Date(y, mo - 1, d).getDay();
  const HOLIDAYS = [
    [2026, 9, 5, 'Ngày khai giảng năm học mới'], [2026, 10, 20, 'Ngày Phụ nữ Việt Nam'], [2026, 11, 20, 'Ngày Nhà giáo Việt Nam'],
    [2026, 12, 22, 'Ngày thành lập Quân đội nhân dân Việt Nam'], [2027, 1, 1, 'Tết Dương lịch'], [2027, 2, 27, 'Ngày Thầy thuốc Việt Nam'],
    [2027, 3, 8, 'Ngày Quốc tế Phụ nữ'], [2027, 4, 30, 'Ngày Giải phóng miền Nam'], [2027, 5, 1, 'Ngày Quốc tế Lao động'],
  ];
  const wdOptions = (ans) => shuffle([ans, ...U.sample(WD.filter((x) => x !== ans), 3)]);

  G.calWeekday = () => {
    const [y, mo] = pick(MONTHS);
    const d = rand(1, daysIn(y, mo));
    const ans = WD[wdOf(y, mo, d)];
    return { type: 'choice', skill: 'tg.lich', prompt: `Xem tờ lịch. Ngày ${d} tháng ${mo} là thứ mấy?`,
      visual: { kind: 'calendar', year: y, month: mo, mark: [d] }, options: wdOptions(ans), answer: ans, optStyle: 'text',
      hint: 'Tìm ngày được khoanh tròn, rồi nhìn lên đầu cột.', explain: `Ngày ${d} nằm ở cột ${ans}.` };
  };
  G.calDays = () => {
    const [y, mo] = pick(MONTHS);
    const n = daysIn(y, mo);
    return { type: 'input', skill: 'tg.lich', prompt: `Xem tờ lịch. Tháng ${mo} có bao nhiêu ngày?`, visual: { kind: 'calendar', year: y, month: mo },
      big: '? ngày', answer: n, hint: 'Xem ngày cuối cùng trong tờ lịch.', explain: `Ngày cuối cùng của tháng ${mo} là ngày ${n}, nên tháng ${mo} có ${n} ngày.` };
  };
  G.calNextWeek = () => {
    const [y, mo] = pick(MONTHS);
    const n = daysIn(y, mo), next = chance(0.6);
    const d = next ? rand(1, n - 7) : rand(8, n);
    const w = wdOf(y, mo, d), ans = next ? d + 7 : d - 7;
    return { type: 'input', skill: 'tg.lich', prompt: `${cap(wdMid(w))} tuần này là ngày ${d} tháng ${mo}. ${cap(wdMid(w))} tuần ${next ? 'sau' : 'trước'} là ngày mấy?`,
      visual: { kind: 'calendar', year: y, month: mo, mark: [d] }, big: 'Ngày ?', answer: ans,
      hint: 'Một tuần lễ có 7 ngày.', explain: next ? `${d} + 7 = ${ans}. Đó là ngày ${ans} tháng ${mo}.` : `${d} − 7 = ${ans}. Đó là ngày ${ans} tháng ${mo}.` };
  };
  G.calCountWeekday = () => {
    const [y, mo] = pick(MONTHS);
    const w = pick([0, 0, 1, 3, 6]);
    const list = U.range(1, daysIn(y, mo)).filter((d) => wdOf(y, mo, d) === w);
    return { type: 'input', skill: 'tg.lich', prompt: `Xem tờ lịch. Tháng ${mo} có mấy ngày ${wdMid(w)}?`, visual: { kind: 'calendar', year: y, month: mo },
      big: '? ngày', answer: list.length, hint: `Đếm các ngày trong cột ${WD[w]}.`, explain: `Các ngày ${wdMid(w)}: ${list.join(', ')}. Có ${list.length} ngày.` };
  };
  G.calHoliday = () => {
    const [y, mo, d, name] = pick(HOLIDAYS);
    const ans = WD[wdOf(y, mo, d)];
    return { type: 'choice', skill: 'tg.lich', prompt: `${name} là ngày ${d} tháng ${mo}. Năm học này, ngày đó là thứ mấy?`,
      visual: { kind: 'calendar', year: y, month: mo, mark: [d] }, options: wdOptions(ans), answer: ans, optStyle: 'text',
      hint: 'Tìm ngày được khoanh tròn, rồi nhìn lên đầu cột.', explain: `Ngày ${d} tháng ${mo} năm ${y} là ${wdMid(wdOf(y, mo, d))}.` };
  };
  G.calTomorrow = () => {
    const [y, mo] = pick(MONTHS);
    const d = rand(2, daysIn(y, mo) - 1), w = wdOf(y, mo, d);
    const tmr = chance(0.6);
    const d2 = tmr ? d + 1 : d - 1, w2 = (w + (tmr ? 1 : 6)) % 7;
    const ans = `${WD[w2]}, ngày ${d2}`;
    const wrong = [`${WD[(w + (tmr ? 6 : 1)) % 7]}, ngày ${d2}`, `${WD[w2]}, ngày ${tmr ? d - 1 : d + 1}`, `${WD[w]}, ngày ${d2}`];
    return { type: 'choice', skill: 'tg.lich', prompt: `Hôm nay là ${wdMid(w)}, ngày ${d} tháng ${mo}. ${tmr ? 'Ngày mai' : 'Hôm qua'} là thứ mấy, ngày nào?`,
      options: shuffle([ans, ...wrong]), answer: ans, optStyle: 'text',
      hint: tmr ? 'Ngày mai: thứ tiếp theo và ngày tiếp theo (thêm 1).' : 'Hôm qua: thứ trước đó và ngày trước đó (bớt 1).',
      explain: `${tmr ? 'Ngày mai' : 'Hôm qua'} là ${wdMid(w2)}, ngày ${d2} tháng ${mo}.` };
  };

  // Tên kỹ năng (hiện trong Góc phụ huynh)
  Object.assign(App.SkillNames, {
    'kl.nangnhe': 'So sánh nặng hơn, nhẹ hơn',
    'kl.kg': 'Ki-lô-gam (kg), cân thăng bằng',
    'dt.lit': 'Lít (l)',
    'dl.donvi': 'Đọc, viết số đo kg và l',
    'dl.uocluong': 'Ước lượng, chọn đơn vị đo',
    'loivan.kgl': 'Toán có lời văn với kg, l',
    'pt.congnho': 'Cộng có nhớ trong phạm vi 100',
    'pt.trunho': 'Trừ có nhớ trong phạm vi 100',
    'loivan.nho': 'Toán có lời văn (có nhớ)',
    'hh.duong': 'Điểm, đoạn thẳng, đường thẳng, đường cong',
    'hh.thanghang': 'Ba điểm thẳng hàng',
    'hh.gapkhuc': 'Đường gấp khúc',
    'hh.tugiac': 'Hình tứ giác',
    'hh.do': 'Đo độ dài đoạn thẳng',
    'hh.ghephinh': 'Ghép hình',
    'tg.dongho': 'Xem đồng hồ',
    'tg.buoi': 'Giờ, phút và các buổi trong ngày',
    'tg.lich': 'Xem lịch',
  });
})(window.App);
