/* Toán 2 – các hàm tạo câu hỏi. Mỗi lần gọi sẽ tạo ra một câu hỏi mới ngẫu nhiên,
   nên bé chơi lại bao nhiêu lần cũng có bài mới để luyện. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle, chance, numberOptions } = U;
  const G = {};

  // ================= Dữ liệu & hàm hỗ trợ =================
  const NAMES = ['Mai', 'Nam', 'Lan', 'Hà', 'Minh', 'An', 'Bình', 'Hoa', 'Tú', 'Linh', 'Hùng', 'Ngọc', 'Việt', 'Khôi', 'Vy', 'Bảo', 'Quân', 'My'];
  const twoNames = () => U.sample(NAMES, 2);
  // Đồ vật để đếm: cls = từ chỉ đơn vị (con, quả, bông…)
  const THINGS = [
    { e: '🍬', cls: 'cái', noun: 'kẹo' }, { e: '🍎', cls: 'quả', noun: 'táo' }, { e: '🌸', cls: 'bông', noun: 'hoa' },
    { e: '🎈', cls: 'quả', noun: 'bóng bay' }, { e: '⭐', cls: 'ngôi sao', noun: '' }, { e: '🔵', cls: 'viên', noun: 'bi' },
    { e: '📘', cls: 'quyển', noun: 'vở' }, { e: '🐟', cls: 'con', noun: 'cá' }, { e: '🍊', cls: 'quả', noun: 'cam' },
  ];
  const full = (t) => (t.noun ? `${t.cls} ${t.noun}` : t.cls);

  const distinct2 = () => { let t, u; do { t = rand(1, 9); u = rand(1, 9); } while (t === u); return t * 10 + u; };
  // a + b không nhớ, tổng ≤ 99 (a có 2 chữ số)
  function noCarryAdd() {
    for (;;) {
      const a = rand(10, 89), b = rand(1, 99 - a);
      if ((a % 10) + (b % 10) < 10 && a !== b) return [a, b];
    }
  }
  // a − b không nhớ (a có 2 chữ số, minB ≤ b < a)
  function noBorrowSub(minB = 1) {
    for (;;) {
      const a = rand(Math.max(20, minB + 1), 99), b = rand(minB, a - 1);
      if (a % 10 >= b % 10) return [a, b];
    }
  }
  // Cặp số cộng qua 10 và trừ qua 10 trong phạm vi 20
  const ADD20 = [];
  for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) if (a + b > 10) ADD20.push([a, b]);
  const SUB20 = [];
  for (let a = 11; a <= 18; a++) for (let b = 2; b <= 9; b++) if (a - b < 10) SUB20.push([a, b]);

  const sign = (x, y) => (x > y ? '>' : x < y ? '<' : '=');
  const signWord = (s) => ({ '>': 'lớn hơn', '<': 'bé hơn', '=': 'bằng' })[s];

  function explainCompare(a, b) {
    if (a === b) return `Hai số bằng nhau: ${a} = ${b}.`;
    const ta = Math.floor(a / 10), tb = Math.floor(b / 10), s = sign(a, b);
    if (ta !== tb) return `${a} ${s} ${b} vì ${ta} chục ${signWord(s)} ${tb} chục.`;
    return `${a} ${s} ${b} vì cùng ${ta} chục, mà ${a % 10} đơn vị ${signWord(s)} ${b % 10} đơn vị.`;
  }
  // Lời giải đặt tính (cộng không nhớ / trừ không nhớ) theo cách nói trong sách
  function explainVertical(a, b, op) {
    const word = op === '+' ? 'cộng' : 'trừ';
    const calc = (x, y) => (op === '+' ? x + y : x - y);
    const [a1, a0] = [Math.floor(a / 10), a % 10];
    const [b1, b0] = [Math.floor(b / 10), b % 10];
    const lines = [`${a0} ${word} ${b0} bằng ${calc(a0, b0)}, viết ${calc(a0, b0)}.`];
    if (b < 10) lines.push(`Hạ ${a1}, viết ${a1}.`);
    else if (op === '−' && a1 === b1) lines.push(`${a1} trừ ${b1} bằng 0.`);
    else lines.push(`${a1} ${word} ${b1} bằng ${calc(a1, b1)}, viết ${calc(a1, b1)}.`);
    lines.push(`Vậy ${a} ${op} ${b} = ${calc(a, b)}.`);
    return lines.join('\n');
  }
  // Làm tròn 10 với phép cộng: tách b
  const explainMake10 = (a, b) => `Tách ${b} = ${10 - a} + ${b - (10 - a)}.\n${a} + ${10 - a} = 10, 10 + ${b - (10 - a)} = ${a + b}.`;
  // Bảng cộng: làm tròn 10 cho số lớn hơn
  const explainAdd20 = (a, b) => {
    const big = Math.max(a, b), small = Math.min(a, b), r = 10 - big;
    const pre = a < b ? `Đổi chỗ: ${a} + ${b} = ${b} + ${a}.\n` : '';
    return `${pre}Tách ${small} = ${r} + ${small - r}: ${big} + ${r} = 10, 10 + ${small - r} = ${a + b}.`;
  };
  // Trừ qua 10: tách b để trừ về 10 trước
  const explainSub20 = (a, b) => {
    const r = a - 10, s = b - r;
    return `Tách ${b} = ${r} + ${s}.\n${a} − ${r} = 10, 10 − ${s} = ${a - b}.`;
  };
  // Lời giải bài toán có lời văn (trình bày như trong vở)
  const solution = (line, a, op, b, res, cls, ans) =>
    `${line}:\n${a} ${op} ${b} = ${res} (${cls})\nĐáp số: ${res} ${ans}.`;

  // ================= Chủ đề 1: Ôn tập và bổ sung =================

  // Đọc số
  G.readNum = () => {
    const n = rand(11, 99);
    const wrong = U.uniq([U.rev(n), n + 1, n - 1, n + 10, n - 10, n + 2, n - 11])
      .filter((x) => x >= 10 && x <= 99 && x !== n);
    const opts = shuffle([n, ...U.sample(wrong, 3)]).map(U.readNumber);
    return { type: 'choice', skill: 'so.doc', prompt: 'Số dưới đây đọc là:', big: String(n), options: opts,
      answer: U.readNumber(n), optStyle: 'text', speak: 'Số này đọc là gì? Bé hãy chọn cách đọc đúng nhé.' };
  };

  // Viết số
  G.writeNum = () => {
    const n = rand(11, 99);
    const cands = U.uniq([U.rev(n), Math.floor(n / 10) * 100 + (n % 10), n + 1, n - 1, n + 10, n - 10])
      .filter((x) => x >= 1 && x !== n);
    return { type: 'choice', skill: 'so.viet', prompt: `Số “${U.readNumber(n)}” viết là:`,
      options: shuffle([n, ...U.sample(cands, 3)]), answer: n };
  };

  // Cấu tạo số: chục và đơn vị → số
  G.placeValue = () => {
    const t = rand(1, 9), u = rand(0, 9), n = t * 10 + u;
    return { type: 'input', skill: 'so.cautao', prompt: `Số gồm ${t} chục và ${u} đơn vị là:`, big: '?', answer: n,
      hint: `Viết ${t} ở hàng chục, ${u} ở hàng đơn vị.`, explain: `${t} chục và ${u} đơn vị viết là ${n}.` };
  };

  // Phân tích số thành chục và đơn vị
  G.decompose = () => {
    const n = distinct2(), t = Math.floor(n / 10), u = n % 10;
    const ans = `${t} chục và ${u} đơn vị`;
    const opts = [ans, `${u} chục và ${t} đơn vị`, `${t < 9 ? t + 1 : t - 1} chục và ${u} đơn vị`, `${t} chục và ${u < 9 ? u + 1 : u - 1} đơn vị`];
    return { type: 'choice', skill: 'so.cautao', prompt: `Số ${n} gồm:`, big: String(n), options: shuffle(opts), answer: ans,
      optStyle: 'text', explain: `${n} có ${t} ở hàng chục và ${u} ở hàng đơn vị.` };
  };

  // Viết số thành tổng chục và đơn vị (42 = 40 + 2)
  G.tensUnits = () => {
    const n = distinct2(), t = Math.floor(n / 10) * 10, u = n % 10;
    const explain = `${n} gồm ${t / 10} chục và ${u} đơn vị, nên ${n} = ${t} + ${u}.`;
    if (chance(0.5)) return { type: 'input', skill: 'so.cautao', prompt: 'Điền số thích hợp:', big: `${n} = ${t} + ?`, answer: u, explain };
    return { type: 'input', skill: 'so.cautao', prompt: 'Điền số thích hợp:', big: `${n} = ? + ${u}`, answer: t, explain };
  };

  // Đếm khối chục – đơn vị
  G.countBlocks = () => {
    const t = rand(1, 7), u = rand(0, 9), n = t * 10 + u;
    return { type: 'input', skill: 'so.cautao', prompt: 'Có tất cả bao nhiêu khối lập phương?',
      visual: { kind: 'blocks', tens: t, ones: u }, big: '?', answer: n,
      hint: 'Mỗi thanh có 10 khối. Đếm số thanh (số chục) rồi đếm khối lẻ (số đơn vị).',
      explain: `${t} thanh chục và ${u} khối lẻ: ${t} chục ${u} đơn vị là ${n}.` };
  };

  // So sánh hai số
  G.compare100 = () => {
    const a = rand(10, 99);
    let b;
    const r = Math.random();
    if (r < 0.15) b = a;
    else if (r < 0.45 && a % 10 !== 0 && U.rev(a) !== a) b = U.rev(a);
    else if (r < 0.7) b = Math.floor(a / 10) * 10 + rand(0, 9);
    else b = rand(10, 99);
    return { type: 'choice', skill: 'so.sosanh', prompt: 'Chọn dấu thích hợp:', big: `${a} ? ${b}`,
      options: ['>', '<', '='], answer: sign(a, b), optStyle: 'sign',
      speak: `Chọn dấu lớn hơn, bé hơn hoặc bằng để so sánh ${a} và ${b}.`, explain: explainCompare(a, b) };
  };

  // Số lớn nhất / bé nhất
  G.maxMin = () => {
    const x = distinct2(), y = distinct2();
    let nums = U.uniq([x, U.rev(x), y, U.rev(y)]);
    while (nums.length < 4) { const z = rand(10, 99); if (!nums.includes(z)) nums.push(z); }
    nums = shuffle(nums);
    const big = chance(0.5);
    const ans = big ? Math.max(...nums) : Math.min(...nums);
    return { type: 'choice', skill: 'so.sosanh', prompt: `Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số dưới đây là:`,
      options: nums, answer: ans, explain: `So sánh hàng chục trước, nếu hàng chục bằng nhau thì so sánh hàng đơn vị. Số ${big ? 'lớn nhất' : 'bé nhất'} là ${ans}.` };
  };

  // Sắp xếp thứ tự
  G.order100 = () => {
    const nums = U.sample(U.range(10, 99), 4);
    const asc = chance(0.6);
    const answer = nums.slice().sort((p, q) => (asc ? p - q : q - p));
    let items;
    do { items = shuffle(nums); } while (items.join() === answer.join());
    return { type: 'order', skill: 'so.thutu', prompt: `Xếp các số theo thứ tự từ ${asc ? 'bé đến lớn' : 'lớn đến bé'}:`, items, answer };
  };

  // Số tròn chục
  G.roundTens = () => {
    const ans = rand(1, 9) * 10;
    const pool = U.range(11, 99).filter((x) => x % 10 !== 0);
    return { type: 'choice', skill: 'so.tronchuc', prompt: 'Số nào là số tròn chục?',
      options: shuffle([ans, ...U.sample(pool, 3)]), answer: ans,
      explain: `${ans} là số tròn chục vì chữ số hàng đơn vị là 0.` };
  };

  // Số liền trước, số liền sau
  G.nextPrev = () => {
    const after = chance(0.5);
    const n = after ? rand(9, 99) : rand(1, 100);
    const ans = after ? n + 1 : n - 1;
    return { type: 'input', skill: 'so.lientruoc', prompt: `Số liền ${after ? 'sau' : 'trước'} của ${n} là:`, big: '?', answer: ans,
      hint: after ? 'Số liền sau thì thêm 1.' : 'Số liền trước thì bớt 1.',
      explain: after ? `${n} + 1 = ${ans}. Số liền sau của ${n} là ${ans}.` : `${n} − 1 = ${ans}. Số liền trước của ${n} là ${ans}.` };
  };

  // Số ở giữa hai số
  G.between = () => {
    const n = rand(10, 99);
    return { type: 'input', skill: 'so.lientruoc', prompt: `Số ở giữa ${n - 1} và ${n + 1} là:`, big: `${n - 1}, ?, ${n + 1}`, answer: n,
      speak: `Số ở giữa ${n - 1} và ${n + 1} là số nào?`, explain: `${n - 1}, ${n}, ${n + 1} là ba số liên tiếp.` };
  };

  // Tia số
  G.numberLine = () => {
    const step = chance(0.7) ? 1 : 10;
    const count = 11;
    const start = step === 1 ? (chance(0.6) ? rand(0, 9) * 10 : rand(1, 89)) : 0;
    const k = rand(1, count - 2);
    const ans = start + k * step;
    return { type: 'choice', skill: 'so.tiaso', prompt: 'Số thích hợp ở ô “?” trên tia số là:',
      visual: { kind: 'numberline', start, step, count, hide: [k] },
      options: numberOptions(ans, 4, { min: 0, max: 100, extra: [ans + step, ans - step, ans + 1, ans - 1] }), answer: ans,
      explain: `Trên tia số, mỗi vạch tiếp theo thêm ${step}. Số ở ô “?” là ${ans}.` };
  };

  // Tên gọi thành phần phép cộng
  G.termsAdd = () => {
    const [a, b] = noCarryAdd();
    const c = a + b;
    const which = pick(['a', 'b', 'c']);
    const num = { a, b, c }[which];
    return { type: 'choice', skill: 'pt.thanhphan', prompt: `Trong phép cộng này, số ${num} được gọi là:`, big: `${a} + ${b} = ${c}`,
      options: shuffle(['Số hạng', 'Tổng', 'Số trừ', 'Hiệu']), answer: which === 'c' ? 'Tổng' : 'Số hạng', optStyle: 'text',
      explain: `${a} và ${b} là số hạng, ${c} là tổng.` };
  };

  // Tên gọi thành phần phép trừ
  G.termsSub = () => {
    let a, b;
    do { [a, b] = noBorrowSub(); } while (b === a - b);
    const c = a - b;
    const which = pick(['a', 'b', 'c']);
    const num = { a, b, c }[which];
    return { type: 'choice', skill: 'pt.thanhphan', prompt: `Trong phép trừ này, số ${num} được gọi là:`, big: `${a} − ${b} = ${c}`,
      options: shuffle(['Số bị trừ', 'Số trừ', 'Hiệu', 'Tổng']), answer: { a: 'Số bị trừ', b: 'Số trừ', c: 'Hiệu' }[which], optStyle: 'text',
      explain: `${a} là số bị trừ, ${b} là số trừ, ${c} là hiệu.` };
  };

  // Tìm tổng / tìm hiệu
  G.findSum = () => {
    const [a, b] = noCarryAdd();
    return { type: 'input', skill: 'pt.thanhphan', prompt: `Tìm tổng, biết hai số hạng là ${a} và ${b}.`, big: '?', answer: a + b,
      hint: 'Tổng là kết quả của phép cộng.', explain: `Tổng là: ${a} + ${b} = ${a + b}.` };
  };
  G.findDiff = () => {
    const [a, b] = noBorrowSub();
    return { type: 'input', skill: 'pt.thanhphan', prompt: `Tìm hiệu, biết số bị trừ là ${a} và số trừ là ${b}.`, big: '?', answer: a - b,
      hint: 'Hiệu là kết quả của phép trừ: lấy số bị trừ trừ đi số trừ.', explain: `Hiệu là: ${a} − ${b} = ${a - b}.` };
  };

  // Hơn, kém nhau bao nhiêu (dạng số)
  G.moreLess = () => {
    let a, b;
    if (chance(0.6)) { a = rand(5, 10); b = rand(1, a - 1); } else { [a, b] = noBorrowSub(10); }
    const d = a - b;
    const more = chance(0.5);
    return { type: 'input', skill: 'pt.honkem', prompt: more ? `${a} hơn ${b} là bao nhiêu?` : `${b} kém ${a} là bao nhiêu?`, big: '?', answer: d,
      hint: 'Lấy số lớn trừ đi số bé.', explain: `${a} − ${b} = ${d}. Vậy ${more ? `${a} hơn ${b}` : `${b} kém ${a}`} là ${d}.` };
  };

  // Hơn, kém nhau bao nhiêu (có hình)
  G.moreLessStory = () => {
    const [n1, n2] = twoNames();
    const t = pick(THINGS);
    const a = rand(5, 9), b = rand(2, a - 1);
    const more = chance(0.5);
    const prompt = `${n1} có ${a} ${full(t)}, ${n2} có ${b} ${full(t)}.\n` +
      (more ? `${n1} có nhiều hơn ${n2} mấy ${full(t)}?` : `${n2} có ít hơn ${n1} mấy ${full(t)}?`);
    return { type: 'input', skill: 'pt.honkem', prompt,
      visual: { kind: 'rows', rows: [{ label: n1, e: t.e, n: a }, { label: n2, e: t.e, n: b }] }, big: '?', answer: a - b,
      hint: 'Mỗi hình ở hàng trên ghép với một hình ở hàng dưới, đếm số hình còn thừa ra.',
      explain: `${a} − ${b} = ${a - b} (${t.cls}).` };
  };

  // Tính nhẩm số tròn chục
  G.mentalTens = () => {
    if (chance(0.5)) {
      const a = rand(1, 8), b = rand(1, 9 - a);
      return { type: 'input', skill: 'pt.tronchuc', prompt: 'Tính nhẩm:', big: `${a * 10} + ${b * 10} = ?`, answer: (a + b) * 10,
        hint: `Nhẩm: ${a} chục + ${b} chục.`, explain: `${a} chục + ${b} chục = ${a + b} chục. Vậy ${a * 10} + ${b * 10} = ${(a + b) * 10}.` };
    }
    const a = rand(2, 9), b = rand(1, a - 1);
    return { type: 'input', skill: 'pt.tronchuc', prompt: 'Tính nhẩm:', big: `${a * 10} − ${b * 10} = ?`, answer: (a - b) * 10,
      hint: `Nhẩm: ${a} chục − ${b} chục.`, explain: `${a} chục − ${b} chục = ${a - b} chục. Vậy ${a * 10} − ${b * 10} = ${(a - b) * 10}.` };
  };

  // Cộng / trừ không nhớ trong phạm vi 100 (tính ngang hoặc đặt tính)
  G.addNoCarry = () => {
    const [a, b] = noCarryAdd();
    const vertical = chance(0.5);
    const q = { type: 'input', skill: 'pt.cong100', answer: a + b, hint: 'Tính từ phải sang trái: cộng hàng đơn vị trước, rồi cộng hàng chục.', explain: explainVertical(a, b, '+') };
    if (vertical) return { ...q, prompt: 'Đặt tính rồi tính:', visual: { kind: 'vertical', a, b, op: '+', res: a + b }, speak: `Đặt tính rồi tính: ${a} cộng ${b}.` };
    return { ...q, prompt: 'Tính:', big: `${a} + ${b} = ?` };
  };
  G.subNoBorrow = () => {
    const [a, b] = noBorrowSub();
    const vertical = chance(0.5);
    const q = { type: 'input', skill: 'pt.tru100', answer: a - b, hint: 'Tính từ phải sang trái: trừ hàng đơn vị trước, rồi trừ hàng chục.', explain: explainVertical(a, b, '−') };
    if (vertical) return { ...q, prompt: 'Đặt tính rồi tính:', visual: { kind: 'vertical', a, b, op: '−', res: a - b }, speak: `Đặt tính rồi tính: ${a} trừ ${b}.` };
    return { ...q, prompt: 'Tính:', big: `${a} − ${b} = ?` };
  };

  // So sánh một phép tính với một số
  G.compareExpr = () => {
    const add = chance(0.5);
    const [a, b] = add ? noCarryAdd() : noBorrowSub();
    const v = add ? a + b : a - b;
    let c = v + pick([-10, -2, -1, 0, 0, 1, 2, 10]);
    if (c < 0) c = v + 1;
    const s = sign(v, c);
    const op = add ? '+' : '−';
    return { type: 'choice', skill: add ? 'pt.cong100' : 'pt.tru100', prompt: 'Chọn dấu thích hợp:', big: `${a} ${op} ${b} ? ${c}`,
      options: ['>', '<', '='], answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${a} ${add ? 'cộng' : 'trừ'} ${b}, so với ${c}.`, explain: `${a} ${op} ${b} = ${v}, mà ${v} ${s} ${c}.` };
  };

  // Bài toán có lời văn trong phạm vi 100 (không nhớ)
  const STORY100 = [
    { add: true, e: '🧒', t: (a, b) => `Lớp 2A có ${a} bạn nam và ${b} bạn nữ. Hỏi lớp 2A có tất cả bao nhiêu bạn?`, line: 'Lớp 2A có tất cả số bạn là', cls: 'bạn', ans: 'bạn' },
    { add: true, e: '🍉', t: (a, b) => `Buổi sáng cửa hàng bán được ${a} quả dưa hấu, buổi chiều bán được ${b} quả dưa hấu. Hỏi cả ngày cửa hàng bán được bao nhiêu quả dưa hấu?`, line: 'Cả ngày cửa hàng bán được số quả dưa hấu là', cls: 'quả', ans: 'quả dưa hấu' },
    { add: true, e: '🌳', t: (a, b) => `Đội Một trồng được ${a} cây, đội Hai trồng được ${b} cây. Hỏi cả hai đội trồng được bao nhiêu cây?`, line: 'Cả hai đội trồng được số cây là', cls: 'cây', ans: 'cây' },
    { add: false, e: '📚', t: (a, b) => `Thư viện có ${a} quyển truyện, các bạn đã mượn ${b} quyển. Hỏi thư viện còn lại bao nhiêu quyển truyện?`, line: 'Thư viện còn lại số quyển truyện là', cls: 'quyển', ans: 'quyển truyện' },
    { add: false, e: '🥚', t: (a, b) => `Bà có ${a} quả trứng, bà đã bán ${b} quả. Hỏi bà còn lại bao nhiêu quả trứng?`, line: 'Bà còn lại số quả trứng là', cls: 'quả', ans: 'quả trứng' },
    { add: false, e: '🦆', t: (a, b) => `Đàn vịt có ${a} con, có ${b} con đã lên bờ. Hỏi dưới ao còn lại bao nhiêu con vịt?`, line: 'Dưới ao còn lại số con vịt là', cls: 'con', ans: 'con vịt' },
  ];
  G.story100 = () => {
    const s = pick(STORY100);
    const [a, b] = s.add ? noCarryAdd() : noBorrowSub();
    const res = s.add ? a + b : a - b;
    return { type: 'input', skill: 'loivan.100', prompt: `${s.e} ${s.t(a, b)}`, big: '?', answer: res,
      speak: s.t(a, b),
      hint: s.add ? 'Muốn tìm "tất cả" thì làm phép cộng.' : 'Muốn tìm số "còn lại" thì làm phép trừ.',
      explain: solution(s.line, a, s.add ? '+' : '−', b, res, s.cls, s.ans) };
  };

  // ================= Chủ đề 2: Phép cộng, phép trừ trong phạm vi 20 =================

  // Cộng qua 10, có khung 10 ô
  G.add20Frame = () => {
    const a = pick([9, 9, 8, 8, 7, 6]), b = rand(11 - a, 9);
    return { type: 'input', skill: 'pt.cong20', prompt: 'Tính (nhìn hình, làm tròn 10 trước):', visual: { kind: 'tenframe', a, b, op: '+' },
      big: `${a} + ${b} = ?`, answer: a + b, hint: `Lấy ${10 - a} chấm cam bù vào khung thứ nhất cho đủ 10 chấm.`, explain: explainMake10(a, b) };
  };

  // Tách số để làm tròn 10
  G.add20Split = () => {
    const a = pick([9, 8, 7, 6]), b = rand(11 - a, 9);
    const r = 10 - a, s = b - r;
    return { type: 'input', skill: 'pt.cong20', prompt: `Điền số thích hợp (tách ${b} để làm tròn 10):`,
      big: `${a} + ${b} = ${a} + ${r} + ?`, answer: s,
      speak: `${a} cộng ${b} bằng ${a} cộng ${r} cộng mấy?`, hint: `${b} gồm ${r} và mấy?`,
      explain: `${b} = ${r} + ${s}, nên ${a} + ${b} = ${a} + ${r} + ${s} = 10 + ${s} = ${a + b}.` };
  };

  // Bảng cộng qua 10
  G.add20Fact = () => {
    const [a, b] = pick(ADD20);
    const q = { skill: 'pt.cong20', prompt: 'Tính nhẩm:', big: `${a} + ${b} = ?`, answer: a + b, explain: explainAdd20(a, b) };
    if (chance(0.35)) return { ...q, type: 'choice', options: numberOptions(a + b, 4, { min: 10, max: 20, extra: [a + b - 1, a + b + 1, a + b - 10] }) };
    return { ...q, type: 'input' };
  };

  // Tìm số hạng chưa biết
  G.add20Missing = () => {
    const [a, b] = pick(ADD20);
    if (chance(0.5)) {
      return { type: 'input', skill: 'pt.cong20', prompt: 'Điền số thích hợp:', big: `${a} + ? = ${a + b}`, answer: b,
        hint: `${a} cộng mấy thì bằng ${a + b}?`, explain: `${a} + ${b} = ${a + b}, nên số cần điền là ${b}.` };
    }
    return { type: 'input', skill: 'pt.cong20', prompt: 'Điền số thích hợp:', big: `? + ${b} = ${a + b}`, answer: a,
      hint: `Mấy cộng ${b} thì bằng ${a + b}?`, explain: `${a} + ${b} = ${a + b}, nên số cần điền là ${a}.` };
  };

  // Phép tính nào có kết quả bằng …?
  G.add20Which = () => {
    const s = rand(11, 18);
    const [a, b] = pick(ADD20.filter(([x, y]) => x + y === s));
    const wrongs = U.sample(ADD20.filter(([x, y]) => x + y !== s && Math.abs(x + y - s) <= 2), 3).map(([x, y]) => `${x} + ${y}`);
    return { type: 'choice', skill: 'pt.cong20', prompt: `Phép tính nào có kết quả bằng ${s}?`, optStyle: 'expr',
      options: shuffle([`${a} + ${b}`, ...wrongs]), answer: `${a} + ${b}`, explain: `${a} + ${b} = ${s}.` };
  };

  // Nối phép cộng với kết quả
  G.add20Match = () => {
    const sums = U.sample(U.range(11, 18), 4);
    const pairs = sums.map((s) => { const [a, b] = pick(ADD20.filter(([x, y]) => x + y === s)); return [`${a} + ${b}`, String(s)]; });
    return { type: 'match', skill: 'pt.cong20', prompt: 'Nối mỗi phép tính với kết quả đúng:', pairs, speak: 'Nối mỗi phép tính với kết quả đúng.' };
  };

  // So sánh (cộng qua 10)
  G.add20Compare = () => {
    const [a, b] = pick(ADD20);
    const v = a + b, c = v + pick([-2, -1, 0, 1, 2]);
    const s = sign(v, c);
    return { type: 'choice', skill: 'pt.cong20', prompt: 'Chọn dấu thích hợp:', big: `${a} + ${b} ? ${c}`, options: ['>', '<', '='], answer: s,
      optStyle: 'sign', speak: `Chọn dấu thích hợp: ${a} cộng ${b}, so với ${c}.`, explain: `${a} + ${b} = ${v}, mà ${v} ${s} ${c}.` };
  };

  // Trừ qua 10, có khung 10 ô (gạch bớt)
  G.sub20Frame = () => {
    const [a, b] = pick(SUB20);
    return { type: 'input', skill: 'pt.tru20', prompt: 'Tính (nhìn hình, trừ về 10 trước):', visual: { kind: 'tenframe', a, b, op: '−' },
      big: `${a} − ${b} = ?`, answer: a - b, hint: `Bớt ${a - 10} chấm ở khung sau cho còn 10, rồi bớt tiếp ${b - (a - 10)} chấm.`, explain: explainSub20(a, b) };
  };

  // Tách số để trừ về 10
  G.sub20Split = () => {
    const [a, b] = pick(SUB20);
    const r = a - 10, s = b - r;
    return { type: 'input', skill: 'pt.tru20', prompt: `Điền số thích hợp (tách ${b} để trừ về 10):`,
      big: `${a} − ${b} = ${a} − ${r} − ?`, answer: s,
      speak: `${a} trừ ${b} bằng ${a} trừ ${r} trừ mấy?`, hint: `${b} gồm ${r} và mấy?`,
      explain: `${b} = ${r} + ${s}, nên ${a} − ${b} = ${a} − ${r} − ${s} = 10 − ${s} = ${a - b}.` };
  };

  // Bảng trừ qua 10
  G.sub20Fact = () => {
    const [a, b] = pick(SUB20);
    const q = { skill: 'pt.tru20', prompt: 'Tính nhẩm:', big: `${a} − ${b} = ?`, answer: a - b, explain: explainSub20(a, b) };
    if (chance(0.35)) return { ...q, type: 'choice', options: numberOptions(a - b, 4, { min: 1, max: 12, extra: [a - b + 1, a - b - 1, a - b + 10] }) };
    return { ...q, type: 'input' };
  };

  // Tìm số chưa biết trong phép trừ
  G.sub20Missing = () => {
    const [a, b] = pick(SUB20);
    if (chance(0.5)) {
      return { type: 'input', skill: 'pt.tru20', prompt: 'Điền số thích hợp:', big: `${a} − ? = ${a - b}`, answer: b,
        hint: `${a} trừ mấy thì còn ${a - b}?`, explain: `${a} − ${b} = ${a - b}, nên số cần điền là ${b}.` };
    }
    return { type: 'input', skill: 'pt.tru20', prompt: 'Điền số thích hợp:', big: `? − ${b} = ${a - b}`, answer: a,
      hint: `Lấy ${a - b} cộng ${b}.`, explain: `${a - b} + ${b} = ${a}, nên số cần điền là ${a}.` };
  };

  // Nối phép trừ với kết quả
  G.sub20Match = () => {
    const diffs = U.sample(U.range(2, 9), 4);
    const pairs = diffs.map((d) => { const [a, b] = pick(SUB20.filter(([x, y]) => x - y === d)); return [`${a} − ${b}`, String(d)]; });
    return { type: 'match', skill: 'pt.tru20', prompt: 'Nối mỗi phép tính với kết quả đúng:', pairs, speak: 'Nối mỗi phép tính với kết quả đúng.' };
  };

  // So sánh (trừ qua 10)
  G.sub20Compare = () => {
    const [a, b] = pick(SUB20);
    const v = a - b, c = v + pick([-2, -1, 0, 1, 2]);
    const s = sign(v, c);
    return { type: 'choice', skill: 'pt.tru20', prompt: 'Chọn dấu thích hợp:', big: `${a} − ${b} ? ${c}`, options: ['>', '<', '='], answer: s,
      optStyle: 'sign', speak: `Chọn dấu thích hợp: ${a} trừ ${b}, so với ${c}.`, explain: `${a} − ${b} = ${v}, mà ${v} ${s} ${c}.` };
  };

  // ---------- Bài toán thêm, bớt một số đơn vị ----------
  const THEM = [
    { e: '🐦', t: (a, b) => `Trên cành cây có ${a} con chim, có thêm ${b} con chim bay đến. Hỏi trên cành cây có tất cả bao nhiêu con chim?`, line: 'Trên cành cây có tất cả số con chim là', cls: 'con', ans: 'con chim' },
    { e: '🐟', t: (a, b) => `Trong bể có ${a} con cá, bố thả thêm ${b} con cá. Hỏi trong bể có tất cả bao nhiêu con cá?`, line: 'Trong bể có tất cả số con cá là', cls: 'con', ans: 'con cá' },
    { e: '🌸', t: (a, b, n) => `${n} có ${a} bông hoa, mẹ cho ${n} thêm ${b} bông hoa. Hỏi ${n} có tất cả bao nhiêu bông hoa?`, line: (n) => `${n} có tất cả số bông hoa là`, cls: 'bông', ans: 'bông hoa' },
    { e: '🎈', t: (a, b, n) => `${n} có ${a} quả bóng bay, bạn tặng ${n} thêm ${b} quả bóng bay. Hỏi ${n} có tất cả bao nhiêu quả bóng bay?`, line: (n) => `${n} có tất cả số quả bóng bay là`, cls: 'quả', ans: 'quả bóng bay' },
    { e: '📘', t: (a, b, n) => `${n} có ${a} quyển vở, mẹ mua thêm cho ${n} ${b} quyển vở. Hỏi ${n} có tất cả bao nhiêu quyển vở?`, line: (n) => `${n} có tất cả số quyển vở là`, cls: 'quyển', ans: 'quyển vở' },
    { e: '🐔', t: (a, b) => `Trong sân có ${a} con gà, có thêm ${b} con gà chạy vào. Hỏi trong sân có tất cả bao nhiêu con gà?`, line: 'Trong sân có tất cả số con gà là', cls: 'con', ans: 'con gà' },
    { e: '⛵', t: (a, b) => `Trên sông có ${a} chiếc thuyền, có thêm ${b} chiếc thuyền đi tới. Hỏi trên sông có tất cả bao nhiêu chiếc thuyền?`, line: 'Trên sông có tất cả số chiếc thuyền là', cls: 'chiếc', ans: 'chiếc thuyền' },
  ];
  const BOT = [
    { e: '🐦', t: (a, b) => `Trên cành cây có ${a} con chim, có ${b} con chim bay đi. Hỏi trên cành cây còn lại bao nhiêu con chim?`, line: 'Trên cành cây còn lại số con chim là', cls: 'con', ans: 'con chim' },
    { e: '🍬', t: (a, b, n) => `${n} có ${a} cái kẹo, ${n} cho em ${b} cái kẹo. Hỏi ${n} còn lại bao nhiêu cái kẹo?`, line: (n) => `${n} còn lại số cái kẹo là`, cls: 'cái', ans: 'cái kẹo' },
    { e: '✏️', t: (a, b, n) => `Trong hộp có ${a} cái bút chì, ${n} lấy ra ${b} cái bút chì. Hỏi trong hộp còn lại bao nhiêu cái bút chì?`, line: 'Trong hộp còn lại số cái bút chì là', cls: 'cái', ans: 'cái bút chì' },
    { e: '🎈', t: (a, b, n) => `${n} có ${a} quả bóng bay, bị gió thổi bay mất ${b} quả. Hỏi ${n} còn lại bao nhiêu quả bóng bay?`, line: (n) => `${n} còn lại số quả bóng bay là`, cls: 'quả', ans: 'quả bóng bay' },
    { e: '🍎', t: (a, b) => `Trên đĩa có ${a} quả táo, cả nhà đã ăn ${b} quả. Hỏi trên đĩa còn lại bao nhiêu quả táo?`, line: 'Trên đĩa còn lại số quả táo là', cls: 'quả', ans: 'quả táo' },
    { e: '🦆', t: (a, b) => `Dưới ao có ${a} con vịt, có ${b} con vịt lên bờ. Hỏi dưới ao còn lại bao nhiêu con vịt?`, line: 'Dưới ao còn lại số con vịt là', cls: 'con', ans: 'con vịt' },
  ];
  // Số cho bài toán: thêm (có thể qua 10), bớt (crossSub: có trừ qua 10 hay không)
  function themNums() {
    if (chance(0.7)) return pick(ADD20);
    const a = rand(3, 8);
    return [a, rand(1, 10 - a)];
  }
  function botNums(crossSub) {
    if (crossSub && chance(0.7)) return pick(SUB20);
    const a = rand(6, 19);
    const b = a > 10 ? rand(1, a % 10 || 1) : rand(1, a - 1);
    return [a, b];
  }
  function storyQ(add, crossSub, asOp) {
    const s = pick(add ? THEM : BOT);
    const n = pick(NAMES);
    const [a, b] = add ? themNums() : botNums(crossSub);
    const res = add ? a + b : a - b;
    const text = s.t(a, b, n);
    const line = typeof s.line === 'function' ? s.line(n) : s.line;
    const op = add ? '+' : '−';
    const base = { skill: 'loivan.thembot', prompt: `${s.e} ${text}`, speak: text,
      hint: add ? 'Có thêm vào thì số lượng nhiều lên: làm phép cộng.' : 'Bớt đi thì số lượng ít đi: làm phép trừ.',
      explain: solution(line, a, op, b, res, s.cls, s.ans) };
    if (asOp) {
      const right = `${a} ${op} ${b} = ${res}`;
      const wrong1 = add ? `${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.max(a, b) - Math.min(a, b)}` : `${a} + ${b} = ${a + b}`;
      const wrong2 = add ? `${a + b} − ${b} = ${a}` : `${res} + ${b} = ${a}`;
      return { ...base, type: 'choice', prompt: base.prompt + '\nChọn phép tính đúng:', optStyle: 'expr', options: shuffle([right, wrong1, wrong2]), answer: right };
    }
    return { ...base, type: 'input', big: '?', answer: res };
  }
  G.storyThem = () => storyQ(true, false, false);
  G.storyBot = () => storyQ(false, false, false);
  G.storyThemBotOp = () => storyQ(chance(0.5), false, true);
  G.storyThemBotMix = () => storyQ(chance(0.5), true, chance(0.3));

  // ---------- Bài toán nhiều hơn, ít hơn một số đơn vị ----------
  const NHIEU_IT = [
    { e: '🔵', t: (n1, n2, a, b, more) => `${n1} có ${a} viên bi, ${n2} có ${more ? 'nhiều' : 'ít'} hơn ${n1} ${b} viên bi. Hỏi ${n2} có bao nhiêu viên bi?`, line: (n1, n2) => `${n2} có số viên bi là`, cls: 'viên', ans: 'viên bi' },
    { e: '🌳', t: (n1, n2, a, b, more) => `Tổ Một trồng được ${a} cây, tổ Hai trồng được ${more ? 'nhiều' : 'ít'} hơn tổ Một ${b} cây. Hỏi tổ Hai trồng được bao nhiêu cây?`, line: () => 'Tổ Hai trồng được số cây là', cls: 'cây', ans: 'cây' },
    { e: '🌸', t: (n1, n2, a, b, more) => `Hàng trên có ${a} bông hoa, hàng dưới có ${more ? 'nhiều' : 'ít'} hơn hàng trên ${b} bông hoa. Hỏi hàng dưới có bao nhiêu bông hoa?`, line: () => 'Hàng dưới có số bông hoa là', cls: 'bông', ans: 'bông hoa' },
    { e: '⭐', t: (n1, n2, a, b, more) => `${n1} gấp được ${a} ngôi sao, ${n2} gấp được ${more ? 'nhiều' : 'ít'} hơn ${n1} ${b} ngôi sao. Hỏi ${n2} gấp được bao nhiêu ngôi sao?`, line: (n1, n2) => `${n2} gấp được số ngôi sao là`, cls: 'ngôi sao', ans: 'ngôi sao' },
    { e: '🐔', t: (n1, n2, a, b, more) => `Nhà ${n1} nuôi ${a} con gà, nhà ${n2} nuôi ${more ? 'nhiều' : 'ít'} hơn nhà ${n1} ${b} con gà. Hỏi nhà ${n2} nuôi bao nhiêu con gà?`, line: (n1, n2) => `Nhà ${n2} nuôi số con gà là`, cls: 'con', ans: 'con gà' },
  ];
  function nhieuItQ(asOp) {
    const s = pick(NHIEU_IT);
    const [n1, n2] = twoNames();
    const more = chance(0.5);
    const [a, b] = pick(more ? ADD20 : SUB20);
    const res = more ? a + b : a - b;
    const text = s.t(n1, n2, a, b, more);
    const op = more ? '+' : '−';
    const base = { skill: 'loivan.nhieuit', prompt: `${s.e} ${text}`, speak: text,
      hint: more ? '"Nhiều hơn" thì làm phép cộng.' : '"Ít hơn" thì làm phép trừ.',
      explain: solution(s.line(n1, n2), a, op, b, res, s.cls, s.ans) };
    if (asOp) {
      const right = `${a} ${op} ${b} = ${res}`;
      const wrong = more ? `${a} − ${b} = ${a - b}` : `${a} + ${b} = ${a + b}`;
      return { ...base, type: 'choice', prompt: base.prompt + '\nChọn phép tính đúng:', optStyle: 'expr', options: shuffle([right, wrong]), answer: right };
    }
    return { ...base, type: 'input', big: '?', answer: res };
  }
  G.storyNhieuIt = () => nhieuItQ(false);
  G.storyNhieuItOp = () => nhieuItQ(true);

  App.Gen = App.Gen || {};
  App.Gen.toan = G;
  // Các hàm hỗ trợ dùng chung cho những file câu hỏi Toán khác
  App.Gen.toanUtil = { NAMES, twoNames, ADD20, SUB20, noCarryAdd, noBorrowSub, sign, solution, explainVertical };

  // Tên kỹ năng (hiện trong Góc phụ huynh)
  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'so.doc': 'Đọc số có hai chữ số',
    'so.viet': 'Viết số có hai chữ số',
    'so.cautao': 'Cấu tạo số (chục, đơn vị)',
    'so.sosanh': 'So sánh số',
    'so.thutu': 'Sắp xếp thứ tự các số',
    'so.tronchuc': 'Số tròn chục',
    'so.lientruoc': 'Số liền trước, số liền sau',
    'so.tiaso': 'Tia số',
    'pt.thanhphan': 'Số hạng, tổng, số bị trừ, số trừ, hiệu',
    'pt.honkem': 'Hơn, kém nhau bao nhiêu',
    'pt.tronchuc': 'Cộng, trừ số tròn chục',
    'pt.cong100': 'Cộng (không nhớ) trong phạm vi 100',
    'pt.tru100': 'Trừ (không nhớ) trong phạm vi 100',
    'pt.cong20': 'Cộng qua 10 trong phạm vi 20',
    'pt.tru20': 'Trừ qua 10 trong phạm vi 20',
    'loivan.100': 'Toán có lời văn (phạm vi 100)',
    'loivan.thembot': 'Bài toán thêm, bớt',
    'loivan.nhieuit': 'Bài toán nhiều hơn, ít hơn',
  });
})(window.App);
