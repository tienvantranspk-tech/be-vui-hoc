/* Toán 2 – câu hỏi cho học kì 2 (Chủ đề 8–14):
   phép nhân – phép chia, hình khối, số trong phạm vi 1000, độ dài – tiền Việt Nam,
   cộng trừ trong phạm vi 1000, thống kê – xác suất. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle, chance, numberOptions } = U;
  const { twoNames, sign, solution } = App.Gen.toanUtil;
  const S = App.Svg;
  const G = App.Gen.toan;
  const NUMS = ['1', '2', '3', '4'];
  const times = (a, b) => Array.from({ length: b }, () => a).join(' + '); // a được lấy b lần

  // Đưa ra n phương án chữ khác nhau (đáp án đúng + các phương án sai)
  function textOptions(right, cands, n = 4) {
    return shuffle([right, ...U.sample(U.uniq(cands).filter((c) => c !== right), n - 1)]);
  }
  function picChoice(base, figs, targetIndex, word = 'Hình') {
    const order = shuffle(figs.map((f, i) => ({ f, i })));
    const values = NUMS.slice(0, order.length);
    const views = {};
    order.forEach((o, k) => { views[values[k]] = o.f; });
    const ans = values[order.findIndex((o) => o.i === targetIndex)];
    return { ...base, type: 'choice', options: values, views, answer: ans, answerLabel: `${word} ${ans}` };
  }

  // ================= Chủ đề 8: Phép nhân, phép chia =================
  const GROUP_OBJ = [
    { e: '🍊', n: 'quả cam', box: 'đĩa' }, { e: '🍎', n: 'quả táo', box: 'đĩa' }, { e: '🌸', n: 'bông hoa', box: 'lọ' },
    { e: '🍪', n: 'cái bánh', box: 'hộp' }, { e: '🐟', n: 'con cá', box: 'bể' }, { e: '🍬', n: 'cái kẹo', box: 'túi' },
    { e: '✏️', n: 'cái bút chì', box: 'hộp' }, { e: '🥚', n: 'quả trứng', box: 'giỏ' },
  ];

  // Nhóm bằng nhau → phép nhân (a được lấy b lần: a × b)
  G.mulGroups = () => {
    const o = pick(GROUP_OBJ);
    const a = rand(2, 5), b = rand(2, 5);
    const groups = Array.from({ length: b }, () => ({ e: o.e, n: a }));
    const base = `Mỗi ${o.box} có ${a} ${o.n}. Có ${b} ${o.box} như thế.`;
    if (chance(0.5)) {
      const right = `${a} × ${b}`;
      return { type: 'choice', skill: 'pt.nhan', prompt: `${base}\nPhép tính nào cho biết có tất cả bao nhiêu ${o.n}?`, visual: { kind: 'emoji', groups },
        options: textOptions(right, [`${a} + ${b}`, `${a} × ${a === b ? b + 1 : a}`, `${b} + ${b}`, `${a + 1} × ${b}`]), answer: right, optStyle: 'expr',
        hint: `Số ${a} được lấy ${b} lần.`, explain: `${a} được lấy ${b} lần: ${a} × ${b} = ${a * b}.` };
    }
    return { type: 'input', skill: 'pt.nhan', prompt: `${base}\nCó tất cả bao nhiêu ${o.n}?`, visual: { kind: 'emoji', groups },
      big: `${a} × ${b} = ?`, answer: a * b, hint: `${a} × ${b} = ${times(a, b)}.`, explain: `${a} × ${b} = ${times(a, b)} = ${a * b}.` };
  };
  // Viết tổng các số hạng bằng nhau thành phép nhân
  G.mulFromAdd = () => {
    const a = rand(2, 5), b = rand(2, 5);
    const sum = times(a, b);
    if (chance(0.5)) {
      return { type: 'input', skill: 'pt.nhan', prompt: 'Viết phép cộng thành phép nhân:', big: `${sum} = ${a} × ?`, answer: b,
        hint: `Số ${a} được lấy mấy lần?`, explain: `${a} được lấy ${b} lần nên ${sum} = ${a} × ${b}.` };
    }
    const right = `${a} × ${b}`;
    return { type: 'choice', skill: 'pt.nhan', prompt: `Phép cộng ${sum} viết thành phép nhân là:`,
      options: textOptions(right, [`${a} + ${b}`, `${a} × ${b + 1}`, `${a + 1} × ${b}`, `${b} + ${a}`]), answer: right, optStyle: 'expr',
      speak: `Phép cộng ${U.mathSpeak(sum)} viết thành phép nhân là gì?`, hint: `Số ${a} được lấy mấy lần?`, explain: `${a} được lấy ${b} lần: ${sum} = ${a} × ${b}.` };
  };
  // Tính tích bằng cách chuyển thành phép cộng
  G.mulAdd = () => {
    const a = rand(2, 5), b = rand(2, 5);
    return { type: 'input', skill: 'pt.nhan', prompt: 'Tính (chuyển thành phép cộng các số bằng nhau):', big: `${a} × ${b} = ?`, answer: a * b,
      hint: `${a} × ${b} = ${times(a, b)}`, explain: `${a} × ${b} = ${times(a, b)} = ${a * b}.` };
  };
  // Thừa số, tích
  G.mulTerms = () => {
    let a, b;
    do { a = pick([2, 5]); b = rand(3, 9); } while (a === b);
    const c = a * b, which = pick(['a', 'b', 'c']);
    return { type: 'choice', skill: 'pt.thuaso', prompt: `Trong phép nhân này, số ${{ a, b, c }[which]} được gọi là:`, big: `${a} × ${b} = ${c}`,
      options: shuffle(['Thừa số', 'Tích', 'Số hạng', 'Thương']), answer: which === 'c' ? 'Tích' : 'Thừa số', optStyle: 'text',
      explain: `${a} và ${b} là thừa số, ${c} là tích.` };
  };
  G.findProduct = () => {
    const a = pick([2, 5]), b = rand(2, 10);
    return { type: 'input', skill: 'pt.thuaso', prompt: `Tìm tích, biết hai thừa số là ${a} và ${b}.`, big: '?', answer: a * b,
      hint: 'Tích là kết quả của phép nhân.', explain: `Tích là: ${a} × ${b} = ${a * b}.` };
  };

  // Bảng nhân 2, 5 và bảng chia 2, 5
  function tableFact(k, div) {
    const n = rand(1, 10), p = k * n;
    if (!div) {
      const q = { skill: k === 2 ? 'pt.bang2' : 'pt.bang5', prompt: 'Tính nhẩm:', big: `${k} × ${n} = ?`, answer: p, hint: `Đếm thêm ${k}, ${n} lần.`, explain: `${k} × ${n} = ${p}.` };
      return chance(0.35) ? { ...q, type: 'choice', options: numberOptions(p, 4, { min: 0, max: 100, extra: [p + k, p - k, k + n] }) } : { ...q, type: 'input' };
    }
    const q = { skill: k === 2 ? 'pt.chia2' : 'pt.chia5', prompt: 'Tính nhẩm:', big: `${p} : ${k} = ?`, answer: n,
      hint: `Nhớ bảng nhân ${k}: ${k} nhân mấy bằng ${p}?`, explain: `${k} × ${n} = ${p}, nên ${p} : ${k} = ${n}.` };
    return chance(0.35) ? { ...q, type: 'choice', options: numberOptions(n, 4, { min: 1, max: 12, extra: [n + 1, n - 1] }) } : { ...q, type: 'input' };
  }
  G.table2 = () => tableFact(2, false);
  G.table5 = () => tableFact(5, false);
  G.div2 = () => tableFact(2, true);
  G.div5 = () => tableFact(5, true);
  G.tableMix = () => tableFact(pick([2, 5]), chance(0.5));
  function tableMissing(k) {
    const n = rand(1, 10);
    return { type: 'input', skill: k === 2 ? 'pt.bang2' : 'pt.bang5', prompt: 'Điền số thích hợp:', big: `${k} × ? = ${k * n}`, answer: n,
      hint: `Nhớ bảng nhân ${k}.`, explain: `${k} × ${n} = ${k * n}.` };
  }
  G.table2Missing = () => tableMissing(2);
  G.table5Missing = () => tableMissing(5);
  function skipCount(k) {
    const start = rand(1, 6);
    const seq = [0, 1, 2, 3, 4].map((i) => k * (start + i));
    const hide = rand(1, 3);
    return { type: 'input', skill: k === 2 ? 'pt.bang2' : 'pt.bang5', prompt: `Đếm thêm ${k}, điền số còn thiếu:`, big: seq.map((x, i) => (i === hide ? '?' : x)).join(', '),
      answer: seq[hide], speak: `Đếm thêm ${k}, điền số còn thiếu.`, hint: `Mỗi số sau hơn số trước ${k} đơn vị.`, explain: `${seq.join(', ')}.` };
  }
  G.skipCount2 = () => skipCount(2);
  G.skipCount5 = () => skipCount(5);

  // Bài toán có lời văn: nhân
  const MUL_STORIES = {
    2: [
      ['Mỗi con gà có 2 chân. Hỏi {n} con gà có bao nhiêu chân?', 'Số chân gà là', 'chân', 'chân'],
      ['Mỗi đôi đũa có 2 chiếc đũa. Hỏi {n} đôi đũa có bao nhiêu chiếc đũa?', 'Số chiếc đũa là', 'chiếc', 'chiếc đũa'],
      ['Mỗi bạn được phát 2 quyển vở. Hỏi {n} bạn được phát bao nhiêu quyển vở?', 'Số quyển vở là', 'quyển', 'quyển vở'],
      ['Mỗi chiếc xe đạp có 2 bánh xe. Hỏi {n} chiếc xe đạp có bao nhiêu bánh xe?', 'Số bánh xe là', 'bánh', 'bánh xe'],
    ],
    5: [
      ['Mỗi bàn tay có 5 ngón tay. Hỏi {n} bàn tay có bao nhiêu ngón tay?', 'Số ngón tay là', 'ngón', 'ngón tay'],
      ['Mỗi hộp có 5 cái bánh. Hỏi {n} hộp như thế có bao nhiêu cái bánh?', 'Số cái bánh là', 'cái', 'cái bánh'],
      ['Mỗi bó hoa có 5 bông hoa. Hỏi {n} bó hoa có bao nhiêu bông hoa?', 'Số bông hoa là', 'bông', 'bông hoa'],
      ['Mỗi nhóm có 5 bạn. Hỏi {n} nhóm có bao nhiêu bạn?', 'Số bạn là', 'bạn', 'bạn'],
    ],
  };
  function mulStory(k) {
    const [t, line, cls, ans] = pick(MUL_STORIES[k]);
    const n = rand(2, 9);
    const text = t.replace('{n}', n);
    return { type: 'input', skill: 'loivan.nhanchia', prompt: text, big: '?', answer: k * n, speak: text,
      hint: `${k} được lấy ${n} lần: làm phép nhân ${k} × ${n}.`, explain: solution(line, k, '×', n, k * n, cls, ans) };
  }
  G.mulStory2 = () => mulStory(2);
  G.mulStory5 = () => mulStory(5);
  G.mulStory = () => mulStory(pick([2, 5]));

  // Phép chia: chia đều và chia theo nhóm
  function divPair(tables = [2, 5]) {
    const k = pick(tables), n = rand(2, 9);
    return chance(0.5) ? [k * n, k, n] : [k * n, n, k]; // [số bị chia, số chia, thương]
  }
  G.divShare = () => {
    const o = pick(GROUP_OBJ.filter((x) => x.box !== 'bể'));
    const [p, k, n] = divPair();
    const share = chance(0.5);
    const text = share
      ? `Có ${p} ${o.n} chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy ${o.n}?`
      : `Có ${p} ${o.n}, xếp vào mỗi ${o.box} ${k} ${o.n}. Hỏi xếp được mấy ${o.box}?`;
    return { type: 'input', skill: 'pt.chia', prompt: text, visual: p <= 20 ? { kind: 'emoji', groups: [{ e: o.e, n: p }] } : undefined,
      big: '?', answer: n, speak: text, hint: share ? `Chia đều ${p} cho ${k}: làm phép chia ${p} : ${k}.` : `Mỗi ${o.box} ${k}: làm phép chia ${p} : ${k}.`,
      explain: `${p} : ${k} = ${n}.` };
  };
  G.divFromMul = () => {
    const a = pick([2, 5]), b = rand(2, 9), p = a * b;
    const first = chance(0.5);
    return { type: 'input', skill: 'pt.chia', prompt: `Biết ${a} × ${b} = ${p}. Tính:`, big: `${p} : ${first ? a : b} = ?`, answer: first ? b : a,
      speak: `Biết ${a} nhân ${b} bằng ${p}. Tính ${p} chia ${first ? a : b}.`, hint: `Từ một phép nhân, ta lập được hai phép chia.`,
      explain: `${a} × ${b} = ${p} nên ${p} : ${a} = ${b} và ${p} : ${b} = ${a}.` };
  };
  G.divTerms = () => {
    let p, k, n;
    do { [p, k, n] = divPair(); } while (k === n);
    const which = pick(['p', 'k', 'n']);
    return { type: 'choice', skill: 'pt.sobichia', prompt: `Trong phép chia này, số ${{ p, k, n }[which]} được gọi là:`, big: `${p} : ${k} = ${n}`,
      options: shuffle(['Số bị chia', 'Số chia', 'Thương', 'Tích']), answer: { p: 'Số bị chia', k: 'Số chia', n: 'Thương' }[which], optStyle: 'text',
      explain: `${p} là số bị chia, ${k} là số chia, ${n} là thương.` };
  };
  G.findQuotient = () => {
    const [p, k, n] = divPair();
    return { type: 'input', skill: 'pt.sobichia', prompt: `Tìm thương, biết số bị chia là ${p} và số chia là ${k}.`, big: '?', answer: n,
      hint: 'Thương là kết quả của phép chia.', explain: `Thương là: ${p} : ${k} = ${n}.` };
  };
  const DIV_STORIES = [
    ['Có {p} cái kẹo chia đều cho {k} bạn. Hỏi mỗi bạn được mấy cái kẹo?', 'Mỗi bạn được số cái kẹo là', 'cái', 'cái kẹo'],
    ['Có {p} quả cam xếp đều vào {k} đĩa. Hỏi mỗi đĩa có mấy quả cam?', 'Mỗi đĩa có số quả cam là', 'quả', 'quả cam'],
    ['Có {p} bạn xếp thành các hàng, mỗi hàng {k} bạn. Hỏi xếp được mấy hàng?', 'Số hàng xếp được là', 'hàng', 'hàng'],
    ['Có {p} l nước mắm rót đều vào {k} can. Hỏi mỗi can có mấy lít nước mắm?', 'Mỗi can có số lít nước mắm là', 'l', 'l nước mắm'],
  ];
  G.divStory = () => {
    const [t, line, cls, ans] = pick(DIV_STORIES);
    const [p, k, n] = divPair();
    const text = t.replace('{p}', p).replace('{k}', k);
    return { type: 'input', skill: 'loivan.nhanchia', prompt: text, big: '?', answer: n, speak: text.replace(/ l /g, ' lít '),
      hint: `Làm phép chia ${p} : ${k}.`, explain: solution(line, p, ':', k, n, cls, ans) };
  };
  G.mulDivCompare = () => {
    const k1 = pick([2, 5]), n1 = rand(1, 10), k2 = pick([2, 5]), n2 = rand(1, 10);
    const left = { s: `${k1} × ${n1}`, v: k1 * n1 }, right = chance(0.5) ? { s: `${k2} × ${n2}`, v: k2 * n2 } : { s: `${k2 * n2} : ${k2}`, v: n2 };
    const sgn = sign(left.v, right.v);
    return { type: 'choice', skill: 'pt.nhan', prompt: 'Chọn dấu thích hợp:', big: `${left.s} ? ${right.s}`, options: ['>', '<', '='], answer: sgn, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${U.mathSpeak(left.s)}, so với ${U.mathSpeak(right.s)}.`, explain: `${left.s} = ${left.v}, ${right.s} = ${right.v}, mà ${left.v} ${sgn} ${right.v}.` };
  };

  // ================= Chủ đề 9: Hình khối =================
  const SOLIDS = {
    cau: { name: 'khối cầu', items: ['⚽', '🏀', '🍊', '🎱', '🌐', '🔮'] },
    tru: { name: 'khối trụ', items: ['🥫', '🔋', '🥁', '🧻', '🕯️'] },
    hop: { name: 'khối hộp chữ nhật', items: ['📦', '🧱', '📕'] },
    lp: { name: 'khối lập phương', items: ['🎲', '🧊'] },
  };
  function solidPick(keys) {
    const key = pick(keys);
    const ans = pick(SOLIDS[key].items);
    const others = Object.keys(SOLIDS).filter((k) => k !== key).flatMap((k) => SOLIDS[k].items);
    return { type: 'choice', skill: 'hh.khoi', prompt: `Đồ vật nào có dạng ${SOLIDS[key].name}?`, options: shuffle([ans, ...U.sample(others, 3)]), answer: ans,
      optStyle: 'emoji', explain: `${ans} có dạng ${SOLIDS[key].name}.` };
  }
  G.solidPick = () => solidPick(['cau', 'tru']);
  G.solidPick4 = () => solidPick(['cau', 'tru', 'hop', 'lp']);
  G.solidCount = () => {
    const key = pick(['cau', 'tru']);
    const k = rand(2, 4), n = rand(6, 8);
    const others = Object.keys(SOLIDS).filter((x) => x !== key).flatMap((x) => SOLIDS[x].items);
    const items = shuffle([...Array.from({ length: k }, () => pick(SOLIDS[key].items)), ...Array.from({ length: n - k }, () => pick(others))]);
    return { type: 'input', skill: 'hh.khoi', prompt: `Có bao nhiêu đồ vật có dạng ${SOLIDS[key].name}?`, visual: { kind: 'row', items }, big: '?', answer: k,
      explain: `Có ${k} đồ vật có dạng ${SOLIDS[key].name}.` };
  };
  G.solidPattern = () => {
    const [ka, kb] = U.sample(['cau', 'tru', 'hop'], 2);
    const a = pick(SOLIDS[ka].items), b = pick(SOLIDS[kb].items);
    const unit = pick([[a, b], [a, a, b], [a, b, b]]);
    const seq = [];
    while (seq.length < 7) seq.push(...unit);
    const shown = seq.slice(0, 5 + (unit.length === 3 ? 1 : 0));
    const ans = seq[shown.length];
    const opts = U.uniq([ans, a, b, pick(SOLIDS.lp.items)]);
    return { type: 'choice', skill: 'hh.khoi', prompt: 'Đồ vật tiếp theo trong dãy là gì?', visual: { kind: 'row', items: [...shown, '❓'] },
      options: shuffle(opts), answer: ans, optStyle: 'emoji', hint: 'Tìm nhóm đồ vật được lặp lại.', explain: `Dãy lặp lại theo nhóm: ${unit.join(' ')}.` };
  };

  // ================= Chủ đề 10: Các số trong phạm vi 1000 =================
  G.placeUnits = () => {
    const [big, answer, explain] = pick([
      ['10 đơn vị = ? chục', 1, '10 đơn vị bằng 1 chục.'], ['10 chục = ? trăm', 1, '10 chục bằng 1 trăm.'], ['10 trăm = ? nghìn', 1, '10 trăm bằng 1 nghìn.'],
      ['1 chục = ? đơn vị', 10, '1 chục bằng 10 đơn vị.'], ['1 trăm = ? chục', 10, '1 trăm bằng 10 chục.'], ['1 nghìn = ? trăm', 10, '1 nghìn bằng 10 trăm.'],
    ]);
    return { type: 'input', skill: 'so.1000', prompt: 'Điền số thích hợp:', big, answer, explain };
  };
  G.countHundreds = () => {
    const hh = rand(1, 6);
    return { type: 'input', skill: 'so.1000', prompt: 'Mỗi tấm có 100 khối lập phương. Có tất cả bao nhiêu khối lập phương?', visual: { kind: 'blocks', hundreds: hh },
      big: '?', answer: hh * 100, explain: `${hh} trăm là ${hh * 100}.` };
  };
  G.count3Blocks = () => {
    const hh = rand(1, 4), t = rand(0, 6), u = rand(0, 9), n = hh * 100 + t * 10 + u;
    return { type: 'input', skill: 'so.1000', prompt: 'Có tất cả bao nhiêu khối lập phương?', visual: { kind: 'blocks', hundreds: hh, tens: t, ones: u },
      big: '?', answer: n, hint: 'Mỗi tấm là 1 trăm, mỗi thanh là 1 chục, mỗi khối lẻ là 1 đơn vị.', explain: `${hh} trăm, ${t} chục và ${u} đơn vị là ${n}.` };
  };
  const threeDigit = () => rand(101, 999);
  function readQ(n, skill) {
    const t = Math.floor((n % 100) / 10);
    const cands = [U.rev(n) >= 100 ? U.rev(n) : n + 10, n + 1, n - 1, n + 100, n - 100, n + 10, n - 10,
      Math.floor(n / 100) * 100 + (n % 10) * 10 + t].filter((x) => x >= 100 && x <= 999 && x !== n);
    return { type: 'choice', skill, prompt: 'Số dưới đây đọc là:', big: String(n), options: textOptions(U.readNumber(n), cands.map(U.readNumber)),
      answer: U.readNumber(n), optStyle: 'text', speak: 'Số này đọc là gì?', explain: `${n} đọc là ${U.readNumber(n)}.` };
  }
  function writeQ(n, skill) {
    const h = Math.floor(n / 100), rest = n % 100;
    const cands = [h * 1000 + rest, U.rev(n), n + 10, n - 10, n + 100, n - 1].filter((x) => x > 0 && x !== n);
    return { type: 'choice', skill, prompt: `Số “${U.readNumber(n)}” viết là:`, options: textOptions(n, cands).map(Number), answer: n,
      explain: `${U.readNumber(n)} viết là ${n}.` };
  }
  G.readRound = () => readQ(chance(0.5) ? rand(1, 9) * 100 : rand(11, 99) * 10, 'so.1000');
  G.writeRound = () => writeQ(chance(0.5) ? rand(1, 9) * 100 : rand(11, 99) * 10, 'so.1000');
  G.read3 = () => readQ(chance(0.25) ? rand(1, 9) * 100 + rand(1, 9) : threeDigit(), 'so.1000');
  G.write3 = () => writeQ(chance(0.25) ? rand(1, 9) * 100 + rand(1, 9) : threeDigit(), 'so.1000');
  G.roundLine = () => {
    const step = chance(0.5) ? 100 : 10;
    const start = step === 100 ? 0 : rand(10, 89) * 10;
    const k = rand(1, 9), ans = start + k * step;
    return { type: 'choice', skill: 'so.1000', prompt: 'Số thích hợp ở ô “?” trên tia số là:', visual: { kind: 'numberline', start, step, count: 11, hide: [k] },
      options: numberOptions(ans, 4, { min: 0, max: 1000, extra: [ans + step, ans - step, ans + (step === 100 ? 10 : 1)] }), answer: ans,
      explain: `Mỗi vạch tiếp theo thêm ${step}. Số ở ô “?” là ${ans}.` };
  };
  function explainCompare3(a, b) {
    if (a === b) return `Hai số bằng nhau: ${a} = ${b}.`;
    const s = sign(a, b), w = s === '>' ? 'lớn hơn' : 'bé hơn';
    const [a2, a1, a0] = [Math.floor(a / 100), Math.floor((a % 100) / 10), a % 10];
    const [b2, b1, b0] = [Math.floor(b / 100), Math.floor((b % 100) / 10), b % 10];
    if (a2 !== b2) return `${a} ${s} ${b} vì ${a2} trăm ${w} ${b2} trăm.`;
    if (a1 !== b1) return `${a} ${s} ${b} vì cùng ${a2} trăm, mà ${a1} chục ${w} ${b1} chục.`;
    return `${a} ${s} ${b} vì cùng ${a2} trăm ${a1} chục, mà ${a0} đơn vị ${w} ${b0} đơn vị.`;
  }
  function compareQ(a, b, skill) {
    return { type: 'choice', skill, prompt: 'Chọn dấu thích hợp:', big: `${a} ? ${b}`, options: ['>', '<', '='], answer: sign(a, b), optStyle: 'sign',
      speak: `Chọn dấu lớn hơn, bé hơn hoặc bằng để so sánh ${a} và ${b}.`, explain: explainCompare3(a, b) };
  }
  G.compareRound = () => {
    const step = chance(0.5) ? 100 : 10;
    const a = step === 100 ? rand(1, 10) * 100 : rand(10, 99) * 10;
    let b = step === 100 ? rand(1, 10) * 100 : rand(10, 99) * 10;
    if (chance(0.2)) b = a;
    else if (step === 10 && chance(0.4)) b = Math.floor(a / 100) * 100 + rand(0, 9) * 10;
    return compareQ(a, b, 'so.sosanh1000');
  };
  G.compare3 = () => {
    const a = threeDigit();
    const r = Math.random();
    let b;
    if (r < 0.15) b = a;
    else if (r < 0.45) b = Math.floor(a / 100) * 100 + rand(0, 99);
    else if (r < 0.65) b = Math.floor(a / 10) * 10 + rand(0, 9);
    else b = threeDigit();
    return compareQ(a, Math.max(100, b), 'so.sosanh1000');
  };
  G.compose3 = () => {
    const hh = rand(1, 9), t = chance(0.25) ? 0 : rand(0, 9), u = rand(0, 9), n = hh * 100 + t * 10 + u;
    const text = t === 0 && u > 0 ? `${hh} trăm và ${u} đơn vị` : `${hh} trăm, ${t} chục và ${u} đơn vị`;
    return { type: 'input', skill: 'so.1000', prompt: `Số gồm ${text} là:`, big: '?', answer: n, hint: 'Viết lần lượt chữ số hàng trăm, hàng chục, hàng đơn vị.',
      explain: `${text} viết là ${n}.` };
  };
  G.expand3 = () => {
    const hh = rand(1, 9), t = rand(1, 9), u = rand(1, 9), n = hh * 100 + t * 10 + u;
    const v = rand(0, 3);
    const explain = `${n} gồm ${hh} trăm, ${t} chục và ${u} đơn vị nên ${n} = ${hh * 100} + ${t * 10} + ${u}.`;
    if (v === 0) return { type: 'input', skill: 'so.1000', prompt: 'Điền số thích hợp:', big: `${n} = ${hh * 100} + ${t * 10} + ?`, answer: u, explain };
    if (v === 1) return { type: 'input', skill: 'so.1000', prompt: 'Điền số thích hợp:', big: `${n} = ${hh * 100} + ? + ${u}`, answer: t * 10, explain };
    if (v === 2) return { type: 'input', skill: 'so.1000', prompt: 'Điền số thích hợp:', big: `${n} = ? + ${t * 10} + ${u}`, answer: hh * 100, explain };
    return { type: 'input', skill: 'so.1000', prompt: 'Điền số thích hợp:', big: `? = ${hh * 100} + ${t * 10} + ${u}`, answer: n, explain };
  };
  G.maxMin3 = () => {
    const x = threeDigit();
    let nums = U.uniq([x, Math.floor(x / 100) * 100 + rand(0, 99), threeDigit(), threeDigit()]).filter((v) => v >= 100);
    while (nums.length < 4) { const z = threeDigit(); if (!nums.includes(z)) nums.push(z); }
    nums = shuffle(nums.slice(0, 4));
    const big = chance(0.5), ans = big ? Math.max(...nums) : Math.min(...nums);
    return { type: 'choice', skill: 'so.sosanh1000', prompt: `Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số dưới đây là:`, options: nums, answer: ans,
      explain: `So sánh hàng trăm trước, rồi đến hàng chục, hàng đơn vị. Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.` };
  };
  G.order3 = () => {
    const nums = [];
    while (nums.length < 4) { const z = threeDigit(); if (!nums.includes(z)) nums.push(z); }
    const asc = chance(0.6);
    const answer = nums.slice().sort((p, q) => (asc ? p - q : q - p));
    let items;
    do { items = shuffle(nums); } while (items.join() === answer.join());
    return { type: 'order', skill: 'so.sosanh1000', prompt: `Xếp các số theo thứ tự từ ${asc ? 'bé đến lớn' : 'lớn đến bé'}:`, items, answer };
  };
  G.nextPrev3 = () => {
    const after = chance(0.5);
    const n = chance(0.4) ? rand(1, 9) * 100 - (after ? 1 : 0) : rand(101, 998);
    const ans = after ? n + 1 : n - 1;
    return { type: 'input', skill: 'so.1000', prompt: `Số liền ${after ? 'sau' : 'trước'} của ${n} là:`, big: '?', answer: ans,
      explain: after ? `${n} + 1 = ${ans}.` : `${n} − 1 = ${ans}.` };
  };

  // ================= Chủ đề 11: Độ dài, tiền Việt Nam =================
  G.lengthConvert = () => {
    const k = rand(2, 9);
    const [big, answer, explain] = pick([
      ['1 {m} = ? {dm}', 10, '1 m = 10 dm.'], ['1 {dm} = ? {cm}', 10, '1 dm = 10 cm.'], ['1 {m} = ? {cm}', 100, '1 m = 100 cm.'],
      ['1 {km} = ? {m}', 1000, '1 km = 1000 m.'], [`${k} {dm} = ? {cm}`, k * 10, `1 dm = 10 cm, nên ${k} dm = ${k * 10} cm.`],
      [`${k} {m} = ? {dm}`, k * 10, `1 m = 10 dm, nên ${k} m = ${k * 10} dm.`], [`${k * 100} {cm} = ? {m}`, k, `100 cm = 1 m, nên ${k * 100} cm = ${k} m.`],
      [`${k * 10} {cm} = ? {dm}`, k, `10 cm = 1 dm, nên ${k * 10} cm = ${k} dm.`],
    ]);
    return { type: 'input', skill: 'dd.do', prompt: 'Điền số thích hợp:', big, answer, hint: '1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.', explain };
  };
  const LEN_ITEMS = [
    ['Cây bút chì dài khoảng 15 ?.', 'cm'], ['Ngón tay của em dài khoảng 5 ?.', 'cm'], ['Chiếc thước kẻ dài 20 ?.', 'cm'],
    ['Gang tay của em dài khoảng 1 ?.', 'dm'], ['Quyển sách dài khoảng 2 ?.', 'dm'],
    ['Cái bảng lớp học dài khoảng 3 ?.', 'm'], ['Cột cờ ở sân trường cao khoảng 10 ?.', 'm'], ['Cái giường dài khoảng 2 ?.', 'm'],
    ['Quãng đường từ nhà em đến chợ huyện dài khoảng 5 ?.', 'km'], ['Quãng đường từ Hà Nội đến Hải Phòng dài khoảng 100 ?.', 'km'],
  ];
  const LEN_OPTS = { cm: 'cm (xăng-ti-mét)', dm: 'dm (đề-xi-mét)', m: 'm (mét)', km: 'km (ki-lô-mét)' };
  G.lengthUnit = () => {
    const [t, u] = pick(LEN_ITEMS);
    return { type: 'choice', skill: 'dd.do', prompt: 'Chọn đơn vị đo thích hợp điền vào chỗ trống:', big: t, bigText: true,
      options: Object.values(LEN_OPTS), answer: LEN_OPTS[u], slotAnswer: u, optStyle: 'text', speak: 'Chọn đơn vị đo thích hợp: ' + t.replace('?', '...'),
      explain: `Viết đúng: ${t.replace('?', u)}` };
  };
  G.lengthCalc = () => {
    const unit = pick(['cm', 'dm', 'm', 'km']);
    const add = chance(0.5);
    let a = rand(12, 89), b = rand(11, 60);
    if (add && a + b > 100) b = 100 - a;
    if (!add && b >= a) [a, b] = [b + 10, a];
    const res = add ? a + b : a - b, op = add ? '+' : '−';
    return { type: 'input', skill: 'dd.do', prompt: 'Tính:', big: `${a} {${unit}} ${op} ${b} {${unit}} = ? {${unit}}`, answer: res, unit,
      hint: 'Tính như với các số, rồi viết thêm đơn vị đo.', explain: `${a} ${op} ${b} = ${res}, nên ${a} ${unit} ${op} ${b} ${unit} = ${res} ${unit}.` };
  };
  const toCm = { cm: 1, dm: 10, m: 100, km: 100000 };
  G.lengthCompare = () => {
    const [a, ua, b, ub] = pick([
      [1, 'm', 90, 'cm'], [1, 'm', 100, 'cm'], [1, 'm', 10, 'dm'], [5, 'dm', 50, 'cm'], [3, 'dm', 25, 'cm'], [2, 'm', 25, 'dm'],
      [1, 'km', 1000, 'm'], [1, 'km', 980, 'm'], [6, 'dm', 70, 'cm'], [4, 'm', 40, 'dm'], [8, 'dm', 75, 'cm'], [1, 'm', 9, 'dm'],
    ]);
    const s = sign(a * toCm[ua], b * toCm[ub]);
    return { type: 'choice', skill: 'dd.do', prompt: 'Chọn dấu thích hợp:', big: `${a} {${ua}} ? ${b} {${ub}}`, options: ['>', '<', '='], answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${U.mathSpeak(`${a} {${ua}}`)}, so với ${U.mathSpeak(`${b} {${ub}}`)}.`,
      hint: 'Đổi về cùng một đơn vị đo rồi so sánh.', explain: `Đổi về cùng đơn vị rồi so sánh: ${a} ${ua} ${s} ${b} ${ub}.` };
  };
  const LEN_STORIES = [
    { add: false, t: (a, b) => `Sợi dây dài ${a} cm, bạn Nam cắt đi ${b} cm. Hỏi sợi dây còn lại dài bao nhiêu xăng-ti-mét?`, line: 'Sợi dây còn lại dài là', u: 'cm' },
    { add: true, t: (a, b) => `Đoạn đường thứ nhất dài ${a} m, đoạn đường thứ hai dài ${b} m. Hỏi cả hai đoạn đường dài bao nhiêu mét?`, line: 'Cả hai đoạn đường dài là', u: 'm' },
    { add: true, t: (a, b) => `Nhà Mai cách trường ${a} km. Nhà bà ngoại xa trường hơn nhà Mai ${b} km. Hỏi nhà bà ngoại cách trường bao nhiêu ki-lô-mét?`, line: 'Nhà bà ngoại cách trường là', u: 'km' },
    { add: false, t: (a, b) => `Cây bàng cao ${a} dm, cây cau thấp hơn cây bàng ${b} dm. Hỏi cây cau cao bao nhiêu đề-xi-mét?`, line: 'Cây cau cao là', u: 'dm' },
  ];
  G.lengthStory = () => {
    const s = pick(LEN_STORIES);
    let a = rand(15, 80), b = rand(5, 40);
    if (!s.add && b >= a) b = Math.floor(a / 2);
    if (s.add && a + b > 100) b = 100 - a;
    const res = s.add ? a + b : a - b;
    const text = s.t(a, b);
    return { type: 'input', skill: 'loivan.1000', prompt: text, big: `? {${s.u}}`, answer: res, unit: s.u, speak: text,
      hint: s.add ? 'Tìm "cả hai" hay "xa hơn" thì làm phép cộng.' : 'Tìm "còn lại" hay "thấp hơn" thì làm phép trừ.',
      explain: solution(s.line, a, s.add ? '+' : '−', b, res, s.u, s.u) };
  };

  // Tiền Việt Nam (tờ 100, 200, 500, 1000 đồng)
  const NOTES = [100, 200, 500, 1000];
  G.moneyCount = () => {
    let notes, total;
    do {
      notes = Array.from({ length: rand(2, 4) }, () => pick(NOTES)).sort((p, q) => q - p);
      total = notes.reduce((s, v) => s + v, 0);
    } while (total > 1000);
    return { type: 'input', skill: 'tien.vn', prompt: 'Có tất cả bao nhiêu tiền?', visual: { kind: 'money', notes }, big: '? đồng', answer: total, unit: 'đồng',
      hint: 'Cộng giá trị của các tờ tiền.', explain: `${notes.join(' + ')} = ${total} (đồng).` };
  };
  G.moneyBiggest = () => {
    const most = chance(0.5);
    const values = NOTES.slice();
    const target = most ? 3 : 0;
    return picChoice({ skill: 'tien.vn', prompt: `Tờ tiền nào có giá trị ${most ? 'lớn nhất' : 'bé nhất'}?`, explain: `Tờ ${values[target]} đồng có giá trị ${most ? 'lớn nhất' : 'bé nhất'}.` },
      values.map(S.note), target, 'Tờ');
  };
  G.moneyExchange = () => {
    const [big, from, to] = pick([[1000, 1000, 500], [1000, 1000, 200], [1000, 1000, 100], [500, 500, 100]]);
    const n = from / to;
    return { type: 'input', skill: 'tien.vn', prompt: `Tờ ${big} đồng đổi được mấy tờ ${to} đồng?`, visual: { kind: 'money', notes: [big] }, big: '? tờ', answer: n,
      hint: `Đếm thêm ${to} cho đến ${from}.`, explain: `${Array.from({ length: n }, () => to).join(' + ')} = ${from}, nên đổi được ${n} tờ.` };
  };
  G.moneyChange = () => {
    const price = rand(1, 9) * 100;
    const items = ['chiếc bút chì', 'quyển vở', 'cái thước kẻ', 'gói kẹo', 'cục tẩy'];
    const it = pick(items);
    return { type: 'input', skill: 'tien.vn', prompt: `Một ${it} giá ${price} đồng. Em đưa cô bán hàng tờ 1000 đồng. Cô trả lại em bao nhiêu tiền?`,
      visual: { kind: 'money', notes: [1000] }, big: '? đồng', answer: 1000 - price, unit: 'đồng',
      hint: 'Lấy 1000 đồng trừ đi giá tiền.', explain: `1000 − ${price} = ${1000 - price} (đồng).` };
  };

  // ================= Chủ đề 12: Cộng, trừ trong phạm vi 1000 =================
  const dg = (n) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100)]; // đơn vị, chục, trăm
  // kind: add0 (không nhớ), add1 (nhớ một lượt), sub0 (không nhớ), sub1 (nhớ một lượt)
  function pair1000(kind) {
    for (;;) {
      const a = rand(100, 989), b = rand(10, 899);
      const A = dg(a), B = dg(b);
      if (kind[0] === 'a') {
        if (a + b > 999) continue;
        const c0 = A[0] + B[0] >= 10 ? 1 : 0;
        const c1 = A[1] + B[1] + c0 >= 10 ? 1 : 0;
        const carries = c0 + c1;
        if (kind === 'add0' && carries === 0) return [a, b];
        if (kind === 'add1' && carries === 1) return [a, b];
      } else {
        if (b >= a) continue;
        const b0 = A[0] < B[0] ? 1 : 0;
        const b1 = A[1] < B[1] + b0 ? 1 : 0;
        const borrows = b0 + b1;
        if (kind === 'sub0' && borrows === 0) return [a, b];
        if (kind === 'sub1' && borrows === 1) return [a, b];
      }
    }
  }
  // Lời giải đặt tính theo cột (số có ba chữ số), cách nói trong sách
  function explainColumn(a, b, op) {
    const A = String(a).split('').reverse().map(Number);
    const B = String(b).split('').reverse().map(Number);
    const n = A.length, lines = [];
    let carry = 0;
    for (let i = 0; i < n; i++) {
      const x = A[i], y = B[i], last = i === n - 1;
      if (op === '+') {
        if (y === undefined) {
          lines.push(carry ? `${x} thêm 1 bằng ${x + 1}, viết ${x + 1}.` : `Hạ ${x}, viết ${x}.`);
          carry = 0;
          continue;
        }
        const s = x + y + carry;
        const head = carry ? `${x} cộng ${y} bằng ${x + y}, thêm 1 bằng ${s}` : `${x} cộng ${y} bằng ${s}`;
        if (s >= 10 && !last) { lines.push(`${head}, viết ${s - 10}, nhớ 1.`); carry = 1; } else { lines.push(`${head}, viết ${s}.`); carry = 0; }
      } else {
        if (y === undefined && !carry) { lines.push(`Hạ ${x}, viết ${x}.`); continue; }
        const yy = (y || 0) + carry;
        const head = carry ? (y === undefined ? '' : `${y} thêm 1 bằng ${yy}, `) : '';
        if (x >= yy) {
          const d = x - yy;
          lines.push(`${head}${x} trừ ${yy} bằng ${d}${d === 0 && last ? '' : `, viết ${d}`}.`);
          carry = 0;
        } else {
          lines.push(`${head}${x} không trừ được ${yy}, lấy ${x + 10} trừ ${yy} bằng ${x + 10 - yy}, viết ${x + 10 - yy}, nhớ 1.`);
          carry = 1;
        }
      }
    }
    lines.push(`Vậy ${a} ${op} ${b} = ${op === '+' ? a + b : a - b}.`);
    return lines.join('\n');
  }
  App.Gen.toanUtil.explainColumn = explainColumn; // dùng lại cho bài đặt tính (toan-sach.js)
  function calc1000(kind, vertical) {
    const [a, b] = pair1000(kind);
    const add = kind[0] === 'a', op = add ? '+' : '−', res = add ? a + b : a - b;
    const q = { type: 'input', skill: add ? 'pt.cong1000' : 'pt.tru1000', answer: res, explain: explainColumn(a, b, op),
      hint: add ? 'Cộng từ phải sang trái: hàng đơn vị, hàng chục, rồi hàng trăm. Được 10 trở lên thì nhớ 1.'
        : 'Trừ từ phải sang trái: hàng đơn vị, hàng chục, rồi hàng trăm. Không trừ được thì lấy thêm 10 và nhớ 1.' };
    if (vertical) return { ...q, prompt: 'Đặt tính rồi tính:', visual: { kind: 'vertical', a, b, op, res }, speak: `Đặt tính rồi tính: ${a} ${add ? 'cộng' : 'trừ'} ${b}.` };
    return { ...q, prompt: 'Tính:', big: `${a} ${op} ${b} = ?` };
  }
  G.add1000V = () => calc1000('add0', true);
  G.add1000 = () => calc1000('add0', false);
  G.add1000CarryV = () => calc1000('add1', true);
  G.add1000Carry = () => calc1000('add1', false);
  G.sub1000V = () => calc1000('sub0', true);
  G.sub1000 = () => calc1000('sub0', false);
  G.sub1000BorrowV = () => calc1000('sub1', true);
  G.sub1000Borrow = () => calc1000('sub1', false);
  G.calc1000Mix = () => calc1000(pick(['add0', 'add1', 'sub0', 'sub1']), chance(0.6));
  // Cộng, trừ số tròn trăm, tròn chục
  G.round1000 = () => {
    const add = chance(0.5);
    let a, b;
    if (chance(0.5)) { // số tròn trăm
      if (add) { a = rand(1, 8) * 100; b = rand(1, 10 - a / 100) * 100; } else { a = rand(2, 10) * 100; b = rand(1, a / 100 - 1) * 100; }
    } else { // số tròn chục có ba chữ số, cộng / trừ số tròn chục (không nhớ)
      const hh = rand(1, 9), t = rand(1, 8);
      a = hh * 100 + t * 10;
      b = add ? rand(1, 9 - t) * 10 : rand(1, t) * 10;
    }
    const res = add ? a + b : a - b, op = add ? '+' : '−';
    return { type: 'input', skill: add ? 'pt.cong1000' : 'pt.tru1000', prompt: 'Tính nhẩm:', big: `${a} ${op} ${b} = ?`, answer: res,
      hint: 'Nhẩm theo trăm, theo chục: ví dụ 3 trăm + 2 trăm = 5 trăm.', explain: `${a} ${op} ${b} = ${res}.` };
  };
  const STORIES_1000 = [
    { add: true, t: (a, b) => `Trường em có ${a} học sinh nam và ${b} học sinh nữ. Hỏi trường em có tất cả bao nhiêu học sinh?`, line: 'Trường em có tất cả số học sinh là', cls: 'học sinh', ans: 'học sinh' },
    { add: false, t: (a, b) => `Một cửa hàng có ${a} kg gạo, đã bán ${b} kg gạo. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, line: 'Cửa hàng còn lại số ki-lô-gam gạo là', cls: 'kg', ans: 'kg gạo' },
    { add: true, t: (a, b) => `Đàn gà có ${a} con, đàn vịt có nhiều hơn đàn gà ${b} con. Hỏi đàn vịt có bao nhiêu con?`, line: 'Đàn vịt có số con là', cls: 'con', ans: 'con vịt' },
    { add: false, t: (a, b) => `Thư viện có ${a} quyển sách, đã cho mượn ${b} quyển. Hỏi thư viện còn lại bao nhiêu quyển sách?`, line: 'Thư viện còn lại số quyển sách là', cls: 'quyển', ans: 'quyển sách' },
  ];
  G.story1000 = () => {
    const s = pick(STORIES_1000);
    const [a, b] = pair1000(s.add ? pick(['add0', 'add1']) : pick(['sub0', 'sub1']));
    const res = s.add ? a + b : a - b;
    const text = s.t(a, b);
    return { type: 'input', skill: 'loivan.1000', prompt: text, big: '?', answer: res, speak: text.replace(/ kg/g, ' ki-lô-gam'),
      hint: s.add ? 'Tìm "tất cả" hay "nhiều hơn" thì làm phép cộng.' : 'Tìm "còn lại" thì làm phép trừ.',
      explain: solution(s.line, a, s.add ? '+' : '−', b, res, s.cls, s.ans) };
  };

  // ================= Chủ đề 13: Thống kê, xác suất =================
  const KINDS = [
    { e: '🍎', n: 'quả táo' }, { e: '🍌', n: 'quả chuối' }, { e: '🍊', n: 'quả cam' }, { e: '🍇', n: 'chùm nho' },
    { e: '🐱', n: 'con mèo' }, { e: '🐶', n: 'con chó' }, { e: '🐰', n: 'con thỏ' }, { e: '🐔', n: 'con gà' },
  ];
  G.countKinds = () => {
    const family = chance(0.5) ? KINDS.slice(0, 4) : KINDS.slice(4); // cùng là quả, hoặc cùng là con vật
    const ks = U.sample(family, 3);
    const groups = ks.map((k) => ({ e: k.e, n: rand(2, 6) }));
    if (chance(0.6)) {
      const g = pick(groups), k = ks[groups.indexOf(g)];
      return { type: 'input', skill: 'tk.kiemdem', prompt: `Có bao nhiêu ${k.n}?`, visual: { kind: 'scatter', groups }, big: '?', answer: g.n,
        hint: 'Đếm từng cái, đếm xong thì đánh dấu để không đếm lại.', explain: `Có ${g.n} ${k.n}.` };
    }
    const most = chance(0.5);
    const vals = groups.map((g) => g.n);
    const target = most ? Math.max(...vals) : Math.min(...vals);
    if (vals.filter((v) => v === target).length > 1) return G.countKinds();
    const k = ks[vals.indexOf(target)];
    return { type: 'choice', skill: 'tk.kiemdem', prompt: `Loại nào có số lượng ${most ? 'nhiều' : 'ít'} nhất?`, visual: { kind: 'scatter', groups },
      options: ks.map((x) => x.e), answer: k.e, optStyle: 'emoji', explain: ks.map((x, i) => `${x.e}: ${vals[i]}`).join(', ') + '.' };
  };
  // Biểu đồ tranh: mỗi biểu đồ có sẵn cách hỏi riêng cho tự nhiên
  const PICTO = [
    { title: 'Số bạn thích mỗi loại quả', note: 'Mỗi hình là 1 bạn', unit: 'bạn', rows: [['🍎', 'Táo'], ['🍌', 'Chuối'], ['🍊', 'Cam'], ['🍉', 'Dưa hấu']],
      count: (l) => `Có bao nhiêu bạn thích ăn ${l.toLowerCase()}?`, most: 'Loại quả nào được nhiều bạn thích nhất?',
      diff: (h, lo) => `Số bạn thích ${h.toLowerCase()} nhiều hơn số bạn thích ${lo.toLowerCase()} là mấy bạn?` },
    { title: 'Số con vật nhà bác An nuôi', note: 'Mỗi hình là 1 con', unit: 'con', rows: [['🐔', 'Gà'], ['🦆', 'Vịt'], ['🐷', 'Lợn'], ['🐄', 'Bò']],
      count: (l) => `Nhà bác An nuôi bao nhiêu con ${l.toLowerCase()}?`, most: 'Nhà bác An nuôi con vật nào nhiều nhất?',
      diff: (h, lo) => `Số con ${h.toLowerCase()} nhiều hơn số con ${lo.toLowerCase()} là mấy con?` },
    { title: 'Số bông hoa các tổ trồng được', note: 'Mỗi hình là 1 bông hoa', unit: 'bông', rows: [['🌸', 'Tổ Một'], ['🌸', 'Tổ Hai'], ['🌸', 'Tổ Ba']],
      count: (l) => `${l} trồng được bao nhiêu bông hoa?`, most: 'Tổ nào trồng được nhiều bông hoa nhất?',
      diff: (h, lo) => `${h} trồng được nhiều hơn ${lo} mấy bông hoa?` },
  ];
  G.pictoRead = () => {
    const p = pick(PICTO);
    let rows;
    do { rows = p.rows.map(([icon, label]) => ({ icon, label, n: rand(2, 7) })); }
    while (new Set(rows.map((r) => r.n)).size < rows.length); // số lượng các hàng khác nhau để câu hỏi rõ ràng
    const visual = { kind: 'picto', title: p.title, note: p.note, rows };
    const v = rand(0, 2);
    if (v === 0) {
      const r = pick(rows);
      return { type: 'input', skill: 'tk.bieudo', prompt: 'Xem biểu đồ tranh. ' + p.count(r.label), visual, big: '?', answer: r.n,
        hint: `Đếm số hình ở hàng ${r.label}.`, explain: `Hàng ${r.label} có ${r.n} hình, nên có ${r.n} ${p.unit}.` };
    }
    if (v === 1) {
      const r = rows.reduce((m, x) => (x.n > m.n ? x : m));
      return { type: 'choice', skill: 'tk.bieudo', prompt: 'Xem biểu đồ tranh. ' + p.most, visual, options: rows.map((x) => x.label), answer: r.label, optStyle: 'text',
        hint: 'Hàng nào có nhiều hình nhất?', explain: `Hàng ${r.label} có ${r.n} hình, nhiều nhất.` };
    }
    const [x, y] = U.sample(rows, 2);
    const [hi, lo] = x.n > y.n ? [x, y] : [y, x];
    return { type: 'input', skill: 'tk.bieudo', prompt: 'Xem biểu đồ tranh. ' + p.diff(hi.label, lo.label), visual, big: '?', answer: hi.n - lo.n,
      hint: 'Đếm số hình ở mỗi hàng, rồi lấy số lớn trừ số bé.', explain: `${hi.n} − ${lo.n} = ${hi.n - lo.n} (${p.unit}).` };
  };
  const CHANCE_WORDS = ['chắc chắn', 'có thể', 'không thể'];
  G.chanceBag = () => {
    const red = '🔴', blue = '🔵';
    const v = rand(0, 2);
    let items, colorAsk, ans, explain;
    if (v === 0) { items = Array.from({ length: rand(4, 6) }, () => red); colorAsk = pick(['đỏ', 'xanh']); ans = colorAsk === 'đỏ' ? 'chắc chắn' : 'không thể'; explain = colorAsk === 'đỏ' ? 'Trong hộp chỉ có bi đỏ nên chắc chắn lấy được bi đỏ.' : 'Trong hộp không có bi xanh nên không thể lấy được bi xanh.'; }
    else if (v === 1) { items = shuffle([...Array.from({ length: rand(2, 4) }, () => red), ...Array.from({ length: rand(2, 4) }, () => blue)]); colorAsk = pick(['đỏ', 'xanh']); ans = 'có thể'; explain = 'Trong hộp có cả bi đỏ và bi xanh nên có thể lấy được bi ' + colorAsk + '.'; }
    else { items = shuffle([...Array.from({ length: rand(2, 3) }, () => red), ...Array.from({ length: rand(2, 3) }, () => blue)]); colorAsk = 'vàng'; ans = 'không thể'; explain = 'Trong hộp không có bi vàng nên không thể lấy được bi vàng.'; }
    return { type: 'choice', skill: 'tk.khanang', prompt: 'Lấy ra 1 viên bi từ hộp (không nhìn vào hộp). Chọn từ thích hợp:', visual: { kind: 'bag', items },
      big: `Viên bi lấy ra ? là bi ${colorAsk}.`, bigText: true, options: CHANCE_WORDS, answer: ans, optStyle: 'text',
      speak: `Lấy ra 1 viên bi từ hộp. Viên bi lấy ra ... là bi ${colorAsk}. Chọn chắc chắn, có thể hay không thể.`, explain };
  };
  G.chanceDice = () => {
    const [t, ans, explain] = pick([
      ['Mặt xuất hiện ? có 7 chấm.', 'không thể', 'Xúc xắc chỉ có các mặt từ 1 đến 6 chấm.'],
      ['Mặt xuất hiện ? có 3 chấm.', 'có thể', 'Mặt 3 chấm có thể xuất hiện, cũng có thể không.'],
      ['Mặt xuất hiện ? có số chấm bé hơn 7.', 'chắc chắn', 'Mọi mặt của xúc xắc đều có số chấm bé hơn 7.'],
      ['Mặt xuất hiện ? có 6 chấm.', 'có thể', 'Mặt 6 chấm có thể xuất hiện, cũng có thể không.'],
      ['Mặt xuất hiện ? có 0 chấm.', 'không thể', 'Xúc xắc không có mặt nào 0 chấm.'],
    ]);
    return { type: 'choice', skill: 'tk.khanang', prompt: 'Gieo một con xúc xắc. Chọn từ thích hợp:', visual: { kind: 'row', items: ['🎲'] },
      big: t, bigText: true, options: CHANCE_WORDS, answer: ans, optStyle: 'text', speak: 'Gieo một con xúc xắc. ' + t.replace('?', '...'), explain };
  };

  // Tên kỹ năng
  Object.assign(App.SkillNames, {
    'pt.nhan': 'Phép nhân', 'pt.thuaso': 'Thừa số, tích', 'pt.bang2': 'Bảng nhân 2', 'pt.bang5': 'Bảng nhân 5', 'pt.chia': 'Phép chia',
    'pt.sobichia': 'Số bị chia, số chia, thương', 'pt.chia2': 'Bảng chia 2', 'pt.chia5': 'Bảng chia 5', 'loivan.nhanchia': 'Toán có lời văn (nhân, chia)',
    'hh.khoi': 'Khối trụ, khối cầu, khối hộp', 'so.1000': 'Các số trong phạm vi 1000', 'so.sosanh1000': 'So sánh, sắp xếp số có ba chữ số',
    'dd.do': 'Đề-xi-mét, mét, ki-lô-mét', 'tien.vn': 'Tiền Việt Nam', 'pt.cong1000': 'Cộng trong phạm vi 1000', 'pt.tru1000': 'Trừ trong phạm vi 1000',
    'loivan.1000': 'Toán có lời văn (phạm vi 1000)', 'tk.kiemdem': 'Kiểm đếm số liệu', 'tk.bieudo': 'Biểu đồ tranh', 'tk.khanang': 'Chắc chắn, có thể, không thể',
  });
})(window.App);
