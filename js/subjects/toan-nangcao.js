/* Toán 2 – câu hỏi NÂNG CAO và THỬ THÁCH TƯ DUY (khó hơn sách giáo khoa).
   - Mức "Nâng cao" (chọn trong Góc phụ huynh): mỗi chặng thay khoảng 4/10 câu bằng câu nâng cao của chủ đề.
   - Chặng "🧠 Thử thách" ở cuối mỗi chủ đề: toàn câu nâng cao, không bắt buộc, xu thưởng gấp đôi.
   Các dạng: tìm số chưa biết, bài toán hai bước, bài toán ngược, điền dấu, so sánh biểu thức, tính nhanh,
   dãy số quy luật, lập số từ thẻ chữ số, đếm hình, suy luận về thời gian, lịch, khả năng…
   Dạng giống vở bài tập (cuối tệp): chuỗi mũi tên ô đầu để trống, bảng thiếu số ở hàng giữa, Đ/S tìm lỗi sai, so sánh hai vế,
   bài giải hai bước, quay kim đồng hồ, vẽ đoạn thẳng, khoanh chọn (nhiều cách đúng), đặt tính số có ba chữ số với số có hai chữ số. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle, chance } = U;
  const { NAMES, twoNames, ADD20, SUB20, sign } = App.Gen.toanUtil;
  const A = {};
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const SIGNS = ['>', '<', '='];
  // Đọc đề: đổi đơn vị viết tắt sang lời
  const sayUnits = (s) => s.replace(/(\d)\s*kg\b/g, '$1 ki-lô-gam').replace(/(\d)\s*l\b/g, '$1 lít')
    .replace(/(\d)\s*cm\b/g, '$1 xăng-ti-mét').replace(/(\d)\s*dm\b/g, '$1 đề-xi-mét').replace(/(\d)\s*km\b/g, '$1 ki-lô-mét')
    .replace(/(\d)\s*m\b/g, '$1 mét').replace(/×/g, ' nhân ').replace(/:/g, ' chia ');
  const cards = (ds) => `<div class="ncards">${ds.map((d) => `<span>${d}</span>`).join('')}</div>`;
  const eqs = (lines) => `<div class="eqs">${lines.map((l) => `<div>${l}</div>`).join('')}</div>`;
  const ITEMS = [
    { noun: 'viên bi', cls: 'viên' }, { noun: 'quyển truyện', cls: 'quyển' }, { noun: 'bông hoa', cls: 'bông' },
    { noun: 'con tem', cls: 'con' }, { noun: 'nhãn vở', cls: 'cái' }, { noun: 'ngôi sao giấy', cls: 'ngôi sao' },
  ];
  const SYMS = [['🍎', '🍌'], ['⭐', '🌙'], ['🐱', '🐶'], ['🍓', '🍇'], ['⚽', '🏀']];

  // Cặp số có nhớ / có nhớ khi trừ trong phạm vi 100
  const carryAdd = () => { for (;;) { const a = rand(11, 87), b = rand(11, 99 - a); if ((a % 10) + (b % 10) >= 10) return [a, b]; } };
  const borrowSub = () => { for (;;) { const a = rand(21, 99), b = rand(11, a - 5); if (a % 10 < b % 10) return [a, b]; } };
  // Cặp số không nhớ trong phạm vi 100
  const plainAdd = () => { for (;;) { const a = rand(10, 88), b = rand(1, 99 - a); if ((a % 10) + (b % 10) < 10) return [a, b]; } };
  const plainSub = () => { for (;;) { const a = rand(20, 99), b = rand(1, a - 1); if (a % 10 >= b % 10) return [a, b]; } };

  // ======================= Chủ đề 1: Ôn tập và bổ sung =======================

  // Lập số lớn nhất / bé nhất từ ba tấm thẻ chữ số
  A.digitCards = () => {
    let d;
    do { d = U.sample(U.range(0, 9), 3); } while (d.filter((x) => x > 0).length < 2);
    const big = chance(0.5);
    let ans, why;
    if (big) {
      const s = d.slice().sort((x, y) => y - x);
      ans = s[0] * 10 + s[1];
      why = `Hàng chục là chữ số lớn nhất: ${s[0]}. Hàng đơn vị là chữ số lớn nhất còn lại: ${s[1]}. Vậy số lớn nhất là ${ans}.`;
    } else {
      const s = d.slice().sort((x, y) => x - y);
      const t = s.find((x) => x > 0), u = s.find((x) => x !== t);
      ans = t * 10 + u;
      why = `Hàng chục là chữ số bé nhất khác 0: ${t}. Hàng đơn vị là chữ số bé nhất còn lại: ${u}. Vậy số bé nhất là ${ans}.`;
    }
    return { type: 'input', skill: 'nc.so', prompt: `Dùng hai trong ba tấm thẻ, lập số có hai chữ số ${big ? 'lớn' : 'bé'} nhất. Đó là số nào?`,
      visual: { kind: 'pic', html: cards(d) }, big: '?', answer: ans,
      hint: big ? 'Đặt chữ số lớn nhất ở hàng chục.' : 'Hàng chục phải là chữ số bé nhất nhưng khác 0.', explain: why };
  };
  // Số lớn nhất / bé nhất có hai chữ số khi biết tổng hai chữ số
  A.digitSum = () => {
    const S = rand(3, 16), big = chance(0.5);
    const t = big ? Math.min(9, S) : Math.max(1, S - 9), u = S - t, n = t * 10 + u;
    return { type: 'input', skill: 'nc.so', prompt: `Tìm số ${big ? 'lớn' : 'bé'} nhất có hai chữ số mà tổng hai chữ số của nó bằng ${S}.`, big: '?', answer: n,
      hint: big ? 'Muốn số lớn nhất thì chữ số hàng chục phải lớn nhất có thể.' : 'Muốn số bé nhất thì chữ số hàng chục phải bé nhất có thể (khác 0).',
      explain: `${t} + ${u} = ${S}. Chữ số hàng chục ${big ? 'lớn' : 'bé'} nhất có thể là ${t}, nên số cần tìm là ${n}.` };
  };
  // Đếm số các số thỏa mãn điều kiện
  A.countNum = () => {
    const v = rand(0, 3);
    const base = { type: 'input', skill: 'nc.so', big: '? số' };
    if (v === 0) {
      const d = rand(1, 9);
      return { ...base, prompt: `Có bao nhiêu số có hai chữ số mà chữ số hàng chục là ${d}?`, answer: 10,
        hint: `Viết thử: ${d}0, ${d}1, ${d}2, …`, explain: `Đó là các số ${d}0, ${d}1, ${d}2, …, ${d}9: có 10 số.` };
    }
    if (v === 1) {
      const d = rand(1, 9);
      return { ...base, prompt: `Có bao nhiêu số có hai chữ số mà chữ số hàng đơn vị là ${d}?`, answer: 9,
        hint: `Viết thử: 1${d}, 2${d}, 3${d}, … Hàng chục không thể là 0.`, explain: `Đó là các số 1${d}, 2${d}, …, 9${d}: có 9 số (chữ số hàng chục phải khác 0).` };
    }
    if (v === 2) {
      const a = rand(10, 70), b = a + rand(6, 20);
      return { ...base, prompt: `Từ ${a} đến ${b} có tất cả bao nhiêu số?`, answer: b - a + 1,
        hint: 'Nhớ tính cả số đầu và số cuối.', explain: `${b} − ${a} = ${b - a}. Tính thêm cả số ${a} nữa: ${b - a} + 1 = ${b - a + 1} số.` };
    }
    return { ...base, prompt: 'Có bao nhiêu số có hai chữ số mà hai chữ số giống nhau?', answer: 9,
      hint: 'Ví dụ: 11, 22, …', explain: 'Đó là các số 11, 22, 33, 44, 55, 66, 77, 88, 99: có 9 số.' };
  };
  // Dãy số có quy luật
  A.seqPattern = () => {
    const v = rand(0, 2);
    let seq, rule;
    if (v === 0) {
      const step = pick([2, 3, 4, 5, 10, 11]), down = chance(0.35);
      const start = down ? rand(step * 4 + 1, 99) : rand(0, 99 - step * 4);
      seq = U.range(0, 4).map((i) => start + (down ? -i : i) * step);
      rule = `Mỗi số ${down ? 'kém' : 'hơn'} số đứng ngay trước nó ${step} đơn vị.`;
    } else if (v === 1) {
      const [p, q] = pick([[1, 2], [2, 3], [1, 3], [2, 4], [3, 2], [5, 1]]);
      seq = [rand(1, 40)];
      for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? p : q));
      rule = `Các số lần lượt thêm ${p}, rồi thêm ${q}, rồi lại thêm ${p}, thêm ${q}…`;
    } else {
      const a = rand(1, 5), b = pick([10, 20]);
      seq = [a, b, a + 1, b + 10, a + 2, b + 20];
      rule = `Có hai dãy xen kẽ nhau: ${a}, ${a + 1}, ${a + 2} (mỗi lần thêm 1) và ${b}, ${b + 10}, ${b + 20} (mỗi lần thêm 10).`;
    }
    const hide = rand(v === 0 ? 1 : 2, seq.length - 1);
    return { type: 'input', skill: 'nc.dayso', prompt: 'Tìm số thích hợp thay cho dấu “?” trong dãy số:',
      big: seq.map((x, i) => (i === hide ? '?' : x)).join(', '), answer: seq[hide],
      hint: 'Xem mỗi số hơn hoặc kém số đứng trước nó bao nhiêu.', explain: `${rule} Số cần tìm là ${seq[hide]}.` };
  };
  // Tìm số chưa biết (không nhớ)
  A.missing100 = () => {
    const kind = rand(0, 3);
    const base = { type: 'input', skill: 'nc.timso', prompt: 'Tìm số thích hợp thay cho dấu “?”:' };
    if (kind < 2) {
      const [a, b] = plainAdd();
      return kind === 0
        ? { ...base, big: `? + ${b} = ${a + b}`, answer: a, hint: `Lấy ${a + b} trừ ${b}.`, explain: `${a + b} − ${b} = ${a}, nên số cần tìm là ${a}.` }
        : { ...base, big: `${a} + ? = ${a + b}`, answer: b, hint: `Lấy ${a + b} trừ ${a}.`, explain: `${a + b} − ${a} = ${b}, nên số cần tìm là ${b}.` };
    }
    const [a, b] = plainSub();
    return kind === 2
      ? { ...base, big: `${a} − ? = ${a - b}`, answer: b, hint: `Lấy ${a} trừ ${a - b}.`, explain: `${a} − ${a - b} = ${b}, nên số cần tìm là ${b}.` }
      : { ...base, big: `? − ${b} = ${a - b}`, answer: a, hint: `Lấy ${a - b} cộng ${b}.`, explain: `${a - b} + ${b} = ${a}, nên số cần tìm là ${a}.` };
  };
  // Bài toán hai bước (không nhớ): nhiều hơn / ít hơn rồi tính cả hai
  A.twoStep100 = () => {
    for (;;) {
      const a = rand(11, 48), d = rand(2, 30), more = chance(0.6);
      const b = more ? a + d : a - d;
      if (b < 5 || b > 99) continue;
      if (more ? (a % 10) + (d % 10) >= 10 : a % 10 < d % 10) continue;
      if ((a % 10) + (b % 10) >= 10 || a + b > 99) continue;
      const [n1, n2] = twoNames(), it = pick(ITEMS);
      return { type: 'input', skill: 'nc.loivan',
        prompt: `${n1} có ${a} ${it.noun}, ${n2} có ${more ? 'nhiều' : 'ít'} hơn ${n1} ${d} ${it.noun}. Hỏi cả hai bạn có tất cả bao nhiêu ${it.noun}?`,
        big: '?', answer: a + b, hint: `Bài này có hai bước: tìm số ${it.noun} của ${n2} trước, rồi mới tính cả hai bạn.`,
        explain: `Số ${it.noun} của ${n2} là:\n${a} ${more ? '+' : '−'} ${d} = ${b} (${it.cls})\nCả hai bạn có số ${it.noun} là:\n${a} + ${b} = ${a + b} (${it.cls})\nĐáp số: ${a + b} ${it.noun}.` };
    }
  };
  // Mỗi hình thay cho một số: 🍎 + 🍎 = 20, 🍎 + 🍌 = 26 → 🍌 = ?
  A.symbolSum = () => {
    const [x, y] = pick(SYMS);
    const a = chance(0.5) ? rand(2, 5) : pick([10, 20, 30, 40]);
    let b;
    do { b = rand(1, 50); } while ((a % 10) + (b % 10) >= 10 || a + b > 99 || b === a);
    return { type: 'input', skill: 'nc.timso', prompt: 'Mỗi hình thay cho một số, hình giống nhau là số giống nhau. Tìm số của hình:',
      visual: { kind: 'pic', html: eqs([`${x} + ${x} = ${2 * a}`, `${x} + ${y} = ${a + b}`]) }, big: `${y} = ?`, answer: b,
      speak: 'Mỗi hình thay cho một số, hình giống nhau là số giống nhau. Tìm số của hình thứ hai.',
      hint: `Tìm số của ${x} trước: số nào cộng với chính nó bằng ${2 * a}?`,
      explain: `${x} + ${x} = ${2 * a}, mà ${a} + ${a} = ${2 * a}, nên ${x} = ${a}.\n${a} + ${y} = ${a + b}, nên ${y} = ${a + b} − ${a} = ${b}.` };
  };
  // So sánh hai biểu thức (không nhớ)
  A.compareTwo100 = () => {
    const [a, b] = plainAdd(), v = a + b;
    for (let t = 0; t < 300; t++) {
      const target = v + pick([-2, -1, 0, 0, 1, 2]);
      if (target < 1 || target > 98) continue;
      const c = rand(target + 1, 99), d = c - target;
      if (c % 10 < d % 10) continue;
      const s = sign(v, target);
      return { type: 'choice', skill: 'nc.dau', prompt: 'Chọn dấu thích hợp:', big: `${a} + ${b} ? ${c} − ${d}`, options: SIGNS, answer: s, optStyle: 'sign',
        speak: `Chọn dấu thích hợp: ${a} cộng ${b}, so với ${c} trừ ${d}.`, hint: 'Tính kết quả của từng vế rồi mới so sánh.',
        explain: `${a} + ${b} = ${v}, ${c} − ${d} = ${target}, mà ${v} ${s} ${target}.` };
    }
    return A.compareTwo100();
  };

  // ======================= Chủ đề 2: Cộng, trừ trong phạm vi 20 =======================

  // Ba số cộng liên tiếp (qua 10)
  A.chainAdd20 = () => {
    for (;;) {
      const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9), s = a + b + c;
      if (s > 20 || s <= 10) continue;
      return { type: 'input', skill: 'nc.tinh', prompt: 'Tính:', big: `${a} + ${b} + ${c} = ?`, answer: s,
        hint: 'Tính lần lượt từ trái sang phải.', explain: `${a} + ${b} = ${a + b}, ${a + b} + ${c} = ${s}.` };
    }
  };
  // Hình giống nhau là số giống nhau: ⭐ + ⭐ = 14, ⭐ + ⭐ + 3 = 15
  A.symbol20 = () => {
    const [x] = pick(SYMS), a = rand(4, 9);
    const base = { type: 'input', skill: 'nc.timso', prompt: 'Hình giống nhau là số giống nhau. Tìm số của hình:', big: `${x} = ?`, answer: a,
      speak: 'Hình giống nhau là số giống nhau. Tìm số của hình.' };
    if (chance(0.5)) {
      return { ...base, visual: { kind: 'pic', html: eqs([`${x} + ${x} = ${2 * a}`]) }, hint: `Số nào cộng với chính nó bằng ${2 * a}?`,
        explain: `${a} + ${a} = ${2 * a}, nên ${x} = ${a}.` };
    }
    const c = rand(1, 20 - 2 * a);
    return { ...base, visual: { kind: 'pic', html: eqs([`${x} + ${x} + ${c} = ${2 * a + c}`]) }, hint: `Bỏ số ${c} đi trước: ${x} + ${x} bằng bao nhiêu?`,
      explain: `${x} + ${x} = ${2 * a + c} − ${c} = ${2 * a}, mà ${a} + ${a} = ${2 * a}, nên ${x} = ${a}.` };
  };
  // Hai bên bằng nhau: 8 + ? = 6 + 9
  A.balanceAdd20 = () => {
    const [a, b] = pick(ADD20), s = a + b;
    const others = ADD20.filter(([x, y]) => x + y === s && x !== a && x !== b);
    if (!others.length) return A.balanceAdd20();
    const [c, d] = pick(others);
    return { type: 'input', skill: 'nc.timso', prompt: 'Điền số thích hợp để hai bên bằng nhau:', big: `${c} + ? = ${a} + ${b}`, answer: d,
      hint: `Tính vế bên phải trước: ${a} + ${b} = ?`, explain: `${a} + ${b} = ${s}. Mà ${c} + ${d} = ${s}, nên số cần điền là ${d}.` };
  };
  A.balanceSub20 = () => {
    const [a, b] = pick(SUB20), r = a - b;
    const others = SUB20.filter(([x, y]) => x - y === r && x !== a);
    if (!others.length) return A.balanceSub20();
    const [c, d] = pick(others);
    return { type: 'input', skill: 'nc.timso', prompt: 'Điền số thích hợp để hai bên bằng nhau:', big: `${c} − ? = ${a} − ${b}`, answer: d,
      hint: `Tính vế bên phải trước: ${a} − ${b} = ?`, explain: `${a} − ${b} = ${r}. Mà ${c} − ${d} = ${r}, nên số cần điền là ${d}.` };
  };
  // So sánh hai phép tính trong phạm vi 20
  A.compareAdd20 = () => {
    const [a, b] = pick(ADD20);
    let c, d;
    do { [c, d] = pick(ADD20); } while ((c === a && d === b) || Math.abs(c + d - a - b) > 2);
    const s = sign(a + b, c + d);
    return { type: 'choice', skill: 'nc.dau', prompt: 'Chọn dấu thích hợp:', big: `${a} + ${b} ? ${c} + ${d}`, options: SIGNS, answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${a} cộng ${b}, so với ${c} cộng ${d}.`, hint: 'Tính kết quả của từng vế rồi mới so sánh.',
      explain: `${a} + ${b} = ${a + b}, ${c} + ${d} = ${c + d}, mà ${a + b} ${s} ${c + d}.` };
  };
  A.compareSub20 = () => {
    const [a, b] = pick(SUB20);
    let c, d;
    do { [c, d] = pick(SUB20); } while ((c === a && d === b) || Math.abs(c - d - (a - b)) > 2);
    const s = sign(a - b, c - d);
    return { type: 'choice', skill: 'nc.dau', prompt: 'Chọn dấu thích hợp:', big: `${a} − ${b} ? ${c} − ${d}`, options: SIGNS, answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${a} trừ ${b}, so với ${c} trừ ${d}.`, hint: 'Tính kết quả của từng vế rồi mới so sánh.',
      explain: `${a} − ${b} = ${a - b}, ${c} − ${d} = ${c - d}, mà ${a - b} ${s} ${c - d}.` };
  };
  // Cộng rồi trừ / trừ rồi cộng trong phạm vi 20
  A.chainMix20 = () => {
    for (;;) {
      const plusFirst = chance(0.5);
      const a = plusFirst ? rand(3, 9) : rand(11, 18), b = rand(2, 9), c = rand(2, 9);
      const m = plusFirst ? a + b : a - b, r = plusFirst ? m - c : m + c;
      if (m < 0 || m > 20 || r < 0 || r > 20 || r === m) continue;
      if (plusFirst ? m <= 10 : a - b >= 10) continue; // có ít nhất một bước qua 10
      const o1 = plusFirst ? '+' : '−', o2 = plusFirst ? '−' : '+';
      return { type: 'input', skill: 'nc.tinh', prompt: 'Tính:', big: `${a} ${o1} ${b} ${o2} ${c} = ?`, answer: r,
        hint: 'Tính lần lượt từ trái sang phải.', explain: `${a} ${o1} ${b} = ${m}, ${m} ${o2} ${c} = ${r}.` };
    }
  };
  // Điền dấu + hoặc − để có kết quả đúng
  A.signFill20 = () => {
    const calc = (x, o, y) => (o === '+' ? x + y : x - y);
    for (;;) {
      const a = rand(8, 18), b = rand(2, 9), c = rand(2, 9);
      const all = [['+', '+'], ['+', '−'], ['−', '+'], ['−', '−']]
        .map(([o1, o2]) => { const m = calc(a, o1, b); return { o1, o2, m, v: calc(m, o2, c) }; })
        .filter((x) => x.m >= 0 && x.m <= 20 && x.v >= 0 && x.v <= 20);
      if (all.length < 3) continue;
      const pk = pick(all);
      if (all.filter((x) => x.v === pk.v).length !== 1) continue;
      const expr = (x) => `${a} ${x.o1} ${b} ${x.o2} ${c}`;
      return { type: 'choice', skill: 'nc.dau', prompt: `Điền dấu + hoặc − vào chỗ ○ để được kết quả đúng. Chọn phép tính đúng:`,
        big: `${a} ○ ${b} ○ ${c} = ${pk.v}`, bigRaw: true, options: shuffle(all.map(expr)), answer: expr(pk), optStyle: 'expr',
        speak: `Điền dấu cộng hoặc trừ để được kết quả bằng ${pk.v}. Chọn phép tính đúng.`,
        hint: 'Thử tính từng phép tính xem phép nào ra đúng kết quả.', explain: `${a} ${pk.o1} ${b} = ${pk.m}, ${pk.m} ${pk.o2} ${c} = ${pk.v}.` };
    }
  };
  // Bài toán hai bước trong phạm vi 20
  A.story20Two = () => {
    if (chance(0.5)) {
      for (;;) {
        const a = rand(4, 9), d = rand(2, 6), b = a + d, tot = a + b;
        if (tot > 20 || tot <= 10) continue;
        const [n1, n2] = twoNames(), it = pick(ITEMS);
        return { type: 'input', skill: 'nc.loivan', prompt: `${n1} có ${a} ${it.noun}, ${n2} có nhiều hơn ${n1} ${d} ${it.noun}. Hỏi cả hai bạn có tất cả bao nhiêu ${it.noun}?`,
          big: '?', answer: tot, hint: `Tìm số ${it.noun} của ${n2} trước, rồi cộng với số ${it.noun} của ${n1}.`,
          explain: `Số ${it.noun} của ${n2} là:\n${a} + ${d} = ${b} (${it.cls})\nCả hai bạn có số ${it.noun} là:\n${a} + ${b} = ${tot} (${it.cls})\nĐáp số: ${tot} ${it.noun}.` };
      }
    }
    for (;;) {
      const a = rand(11, 18), b = rand(3, 9), c = rand(2, 9), m = a - b, r = m + c;
      if (m >= 10 || r > 20) continue;
      return { type: 'input', skill: 'nc.loivan', prompt: `Trên cây có ${a} con chim. Có ${b} con bay đi, sau đó có ${c} con bay đến. Hỏi lúc này trên cây có bao nhiêu con chim?`,
        big: '?', answer: r, hint: 'Tính số chim còn lại sau khi bay đi, rồi cộng thêm số chim bay đến.',
        explain: `Sau khi ${b} con bay đi, trên cây còn:\n${a} − ${b} = ${m} (con)\nSau khi ${c} con bay đến, trên cây có:\n${m} + ${c} = ${r} (con)\nĐáp số: ${r} con chim.` };
    }
  };
  // Bài toán về tuổi
  A.age20 = () => {
    for (;;) {
      const em = rand(5, 9), hon = rand(2, 6), anh = em + hon, k = rand(1, 4), later = chance(0.6);
      const q = later ? anh + k : anh - k;
      if (q > 20 || anh > 18) continue;
      return { type: 'input', skill: 'nc.loivan', prompt: `Năm nay em ${em} tuổi, anh hơn em ${hon} tuổi. Hỏi ${k} năm ${later ? 'nữa' : 'trước'} anh bao nhiêu tuổi?`,
        big: '? tuổi', answer: q, hint: `Tìm tuổi anh năm nay trước. Mỗi năm, ai cũng ${later ? 'thêm' : 'bớt'} 1 tuổi.`,
        explain: `Năm nay anh: ${em} + ${hon} = ${anh} (tuổi)\n${k} năm ${later ? 'nữa' : 'trước'} anh: ${anh} ${later ? '+' : '−'} ${k} = ${q} (tuổi)\nĐáp số: ${q} tuổi.` };
    }
  };

  // ======================= Chủ đề 3: Ki-lô-gam, lít =======================
  const KG2 = [['con ngỗng', 'con vịt', [4, 7], [1, 3]], ['quả dưa hấu', 'quả bưởi', [4, 8], [1, 3]],
    ['bao gạo to', 'bao gạo nhỏ', [7, 11], [2, 5]], ['con chó', 'con mèo', [7, 11], [3, 6]]];
  A.kgTwoStep = () => {
    const [big, small, rB, rD] = pick(KG2);
    const a = rand(...rB), d = rand(...rD), b = a - d, tot = a + b;
    if (tot > 20) return A.kgTwoStep();
    const prompt = `${cap(big)} nặng ${a} kg, ${small} nhẹ hơn ${big} ${d} kg. Hỏi cả hai nặng bao nhiêu ki-lô-gam?`;
    return { type: 'input', skill: 'nc.doluong', prompt, speak: sayUnits(prompt), big: '? {kg}', answer: tot, unit: 'kg',
      hint: `Tìm cân nặng của ${small} trước.`, explain: `${cap(small)} nặng: ${a} − ${d} = ${b} (kg)\nCả hai nặng: ${a} + ${b} = ${tot} (kg)\nĐáp số: ${tot} kg.` };
  };
  const FRUITS = [{ e: '🍉', name: 'quả dưa hấu' }, { e: '🎃', name: 'quả bí ngô' }, { e: '🍍', name: 'quả dứa' }, { e: '🥥', name: 'quả dừa' }, { e: '🍈', name: 'quả dưa lưới' }];
  A.balanceChain = () => {
    const [big, small] = U.sample(FRUITS, 2);
    const s = rand(1, 4), k = rand(1, 3), b = s + k;
    const prompt = `Cân thăng bằng. ${cap(small.name)} nặng ${s} kg. Hỏi ${big.name} nặng bao nhiêu ki-lô-gam?`;
    return { type: 'input', skill: 'nc.doluong', prompt, speak: sayUnits(prompt),
      visual: { kind: 'balance', left: [big.e], right: [small.e, { kg: k }], tilt: 0 }, big: '? {kg}', answer: b, unit: 'kg',
      hint: `${cap(big.name)} nặng bằng ${small.name} cộng với quả cân ${k} kg.`, explain: `${cap(big.name)} nặng: ${s} kg + ${k} kg = ${b} kg.` };
  };
  A.literPour = () => {
    const b = rand(1, 6), diff = pick([2, 4, 6, 8]), a = b + diff, x = diff / 2;
    const prompt = `Can thứ nhất có ${a} l nước, can thứ hai có ${b} l nước. Phải rót từ can thứ nhất sang can thứ hai bao nhiêu lít để hai can có số nước bằng nhau?`;
    return { type: 'input', skill: 'nc.doluong', prompt, speak: sayUnits(prompt), big: '? {l}', answer: x, unit: 'l',
      hint: `Can thứ nhất nhiều hơn can thứ hai ${diff} l. Thử rót 1 l, 2 l, 3 l… xem lúc nào hai can bằng nhau.`,
      explain: `Rót ${x} l thì can thứ nhất còn ${a} − ${x} = ${a - x} (l), can thứ hai có ${b} + ${x} = ${b + x} (l). Hai can bằng nhau.` };
  };
  A.literTwoStep = () => {
    const a = rand(2, 6), b = rand(2, 6), cp = rand(a + b + 2, 18);
    const prompt = `Bình thứ nhất có ${a} l nước, bình thứ hai có ${b} l nước. Đổ cả hai bình vào một cái xô chứa được ${cp} l. Hỏi phải đổ thêm bao nhiêu lít nữa thì đầy xô?`;
    return { type: 'input', skill: 'nc.doluong', prompt, speak: sayUnits(prompt), big: '? {l}', answer: cp - a - b, unit: 'l',
      hint: 'Tính số nước đã đổ vào xô trước.', explain: `Đã đổ vào xô: ${a} + ${b} = ${a + b} (l)\nCần đổ thêm: ${cp} − ${a + b} = ${cp - a - b} (l)\nĐáp số: ${cp - a - b} l.` };
  };

  // ======================= Chủ đề 4: Cộng, trừ có nhớ trong phạm vi 100 =======================
  A.chainAdd100 = () => {
    for (;;) {
      const a = rand(15, 70), b = rand(3, 9), c = rand(3, 9), s = a + b + c;
      if (s > 99 || (a % 10) + b < 10) continue;
      return { type: 'input', skill: 'nc.tinh', prompt: 'Tính:', big: `${a} + ${b} + ${c} = ?`, answer: s,
        hint: 'Tính lần lượt từ trái sang phải.', explain: `${a} + ${b} = ${a + b}, ${a + b} + ${c} = ${s}.` };
    }
  };
  // Tính nhanh: ghép thành số tròn chục
  A.quickSum = () => {
    for (;;) {
      const p = rand(11, 38), q = rand(11, 48);
      if (p % 10 === 0 || q % 10 === 0 || p === q) continue;
      const pp = 10 - (p % 10), qq = 10 - (q % 10), P = p + pp, Q = q + qq;
      if (P + Q > 100 || pp === qq) continue;
      return { type: 'input', skill: 'nc.tinhnhanh', prompt: 'Tính nhanh (ghép các số thành số tròn chục):', big: `${p} + ${q} + ${pp} + ${qq} = ?`, answer: P + Q,
        hint: `Ghép ${p} với ${pp}, ghép ${q} với ${qq} trước.`,
        explain: `${p} + ${q} + ${pp} + ${qq} = (${p} + ${pp}) + (${q} + ${qq}) = ${P} + ${Q} = ${P + Q}.` };
    }
  };
  // Tìm chữ số bị che: 3? + 25 = 61
  A.digitBox = () => {
    const [a, b] = carryAdd(), s = a + b;
    const which = rand(0, 3), pos = which % 2 === 0 ? 1 : 0;
    const A1 = String(a), B1 = String(b), target = which < 2 ? A1 : B1;
    const masked = target.slice(0, pos) + '?' + target.slice(pos + 1);
    return { type: 'input', skill: 'nc.timso', prompt: 'Tìm chữ số thích hợp thay cho dấu “?”:',
      big: which < 2 ? `${masked} + ${B1} = ${s}` : `${A1} + ${masked} = ${s}`, answer: Number(target[pos]),
      hint: 'Thử từng chữ số, hoặc lấy tổng trừ đi số hạng đã biết.', explain: `${a} + ${b} = ${s}, nên chữ số cần tìm là ${target[pos]}.` };
  };
  // Hai bên bằng nhau: ? + 28 = 45 + 19
  A.balanceEq100 = () => {
    const [c, d] = carryAdd(), s = c + d;
    for (let t = 0; t < 100; t++) {
      if (s < 25) break;
      const b = rand(11, s - 10), a = s - b;
      if (b === c || b === d || s % 10 >= b % 10) continue;
      return { type: 'input', skill: 'nc.timso', prompt: 'Điền số thích hợp để hai bên bằng nhau:', big: `? + ${b} = ${c} + ${d}`, answer: a,
        hint: `Tính vế bên phải trước, rồi lấy kết quả trừ đi ${b}.`, explain: `${c} + ${d} = ${s}.\n? + ${b} = ${s}, nên số cần điền là ${s} − ${b} = ${a}.` };
    }
    return A.balanceEq100();
  };
  A.chainCarry = () => {
    for (;;) {
      const a = rand(15, 60), b = rand(11, 39), m = a + b;
      if (m > 99 || (a % 10) + (b % 10) < 10) continue;
      const c = rand(11, m - 11), r = m - c;
      return { type: 'input', skill: 'nc.tinh', prompt: 'Tính:', big: `${a} + ${b} − ${c} = ?`, answer: r,
        hint: 'Tính lần lượt từ trái sang phải.', explain: `${a} + ${b} = ${m}, ${m} − ${c} = ${r}.` };
    }
  };
  A.compareCarry = () => {
    const [a, b] = carryAdd(), v = a + b;
    for (let t = 0; t < 300; t++) {
      const target = v + pick([-2, -1, 0, 0, 1, 2]);
      if (target < 5 || target > 88) continue;
      const c = rand(target + 6, 99), d = c - target;
      if (!(c % 10 < d % 10 && d >= 6)) continue;
      const s = sign(v, target);
      return { type: 'choice', skill: 'nc.dau', prompt: 'Chọn dấu thích hợp:', big: `${a} + ${b} ? ${c} − ${d}`, options: SIGNS, answer: s, optStyle: 'sign',
        speak: `Chọn dấu thích hợp: ${a} cộng ${b}, so với ${c} trừ ${d}.`, hint: 'Tính kết quả của từng vế rồi mới so sánh.',
        explain: `${a} + ${b} = ${v}, ${c} − ${d} = ${target}, mà ${v} ${s} ${target}.` };
    }
    return A.compareCarry();
  };
  const SCENES2 = [
    { t: (a, w, d) => `Thùng thứ nhất có ${a} l dầu, thùng thứ hai ${w} hơn thùng thứ nhất ${d} l. Hỏi cả hai thùng có bao nhiêu lít dầu?`,
      l1: 'Thùng thứ hai có số lít dầu là', l2: 'Cả hai thùng có số lít dầu là', cls: 'l', ans: 'l dầu', more: 'nhiều', less: 'ít' },
    { t: (a, w, d) => `Lớp 2A gấp được ${a} con hạc giấy, lớp 2B gấp được ${w} hơn lớp 2A ${d} con. Hỏi cả hai lớp gấp được bao nhiêu con hạc giấy?`,
      l1: 'Lớp 2B gấp được số con hạc giấy là', l2: 'Cả hai lớp gấp được số con hạc giấy là', cls: 'con', ans: 'con hạc giấy', more: 'nhiều', less: 'ít' },
    { t: (a, w, d) => `Buổi sáng cửa hàng bán được ${a} kg gạo, buổi chiều bán được ${w} hơn buổi sáng ${d} kg. Hỏi cả ngày cửa hàng bán được bao nhiêu ki-lô-gam gạo?`,
      l1: 'Buổi chiều cửa hàng bán được số ki-lô-gam gạo là', l2: 'Cả ngày cửa hàng bán được số ki-lô-gam gạo là', cls: 'kg', ans: 'kg gạo', more: 'nhiều', less: 'ít' },
  ];
  A.twoStepCarry = () => {
    for (;;) {
      const a = rand(25, 60), d = rand(11, 29), more = chance(0.5), b = more ? a + d : a - d;
      if (b < 10 || b > 99 || a + b > 99) continue;
      const s = pick(SCENES2);
      const prompt = s.t(a, more ? s.more : s.less, d);
      return { type: 'input', skill: 'nc.loivan', prompt, speak: sayUnits(prompt), big: '?', answer: a + b,
        hint: 'Bài này có hai bước: tìm số thứ hai trước, rồi tính cả hai.',
        explain: `${s.l1}:\n${a} ${more ? '+' : '−'} ${d} = ${b} (${s.cls})\n${s.l2}:\n${a} + ${b} = ${a + b} (${s.cls})\nĐáp số: ${a + b} ${s.ans}.` };
    }
  };
  // Bài toán ngược: biết số còn lại, tìm số lúc đầu
  A.reverseStory = () => {
    const n = pick(NAMES);
    if (chance(0.5)) {
      const [a, b] = carryAdd();
      return { type: 'input', skill: 'nc.loivan', prompt: `Sau khi cho bạn ${b} viên bi, ${n} còn lại ${a} viên bi. Hỏi lúc đầu ${n} có bao nhiêu viên bi?`,
        big: '?', answer: a + b, hint: 'Lúc đầu = số còn lại + số đã cho đi.',
        explain: `Lúc đầu ${n} có số viên bi là:\n${a} + ${b} = ${a + b} (viên)\nĐáp số: ${a + b} viên bi.` };
    }
    const [a, b] = borrowSub();
    return { type: 'input', skill: 'nc.loivan', prompt: `Mẹ mua thêm ${b} quả trứng thì trong tủ lạnh có ${a} quả trứng. Hỏi lúc đầu trong tủ lạnh có bao nhiêu quả trứng?`,
      big: '?', answer: a - b, hint: 'Lúc đầu = số bây giờ − số mua thêm.',
      explain: `Lúc đầu trong tủ lạnh có số quả trứng là:\n${a} − ${b} = ${a - b} (quả)\nĐáp số: ${a - b} quả trứng.` };
  };

  // ======================= Chủ đề 5: Hình phẳng =======================
  const P = (x, y) => `${Math.round(x)},${Math.round(y)}`;
  const seg = (a, b) => `<line class="geo-seg" x1="${Math.round(a[0])}" y1="${Math.round(a[1])}" x2="${Math.round(b[0])}" y2="${Math.round(b[1])}"/>`;
  const dot = (p) => `<circle class="geo-dot" cx="${Math.round(p[0])}" cy="${Math.round(p[1])}" r="4.5"/>`;
  const lbl = (t, x, y, cls = 'geo-lbl') => `<text class="${cls}" x="${Math.round(x)}" y="${Math.round(y)}">${t}</text>`;
  // Tam giác chia thành m phần bởi các đoạn thẳng đi từ đỉnh
  function triFig(m) {
    const top = [160, 26], base = U.range(0, m).map((i) => [30 + (260 * i) / m, 186]);
    let s = `<svg viewBox="0 0 320 214" class="geo"><polygon points="${P(...top)} ${P(...base[0])} ${P(...base[m])}" fill="#fff5d6"/>`;
    s += seg(top, base[0]) + seg(top, base[m]) + seg(base[0], base[m]);
    base.slice(1, -1).forEach((p) => { s += seg(top, p); });
    for (let i = 0; i < m; i++) s += lbl(i + 1, (top[0] + base[i][0] + base[i + 1][0]) / 3, (top[1] + 2 * 186) / 3 + 8, 'fig-part');
    return s + dot(top) + base.map(dot).join('') + '</svg>';
  }
  // Hình chữ nhật chia thành m phần bởi các đoạn thẳng dọc
  function rectFig(m) {
    const x0 = 30, x1 = 290, y0 = 36, y1 = 170, xs = U.range(0, m).map((i) => x0 + ((x1 - x0) * i) / m);
    let s = `<svg viewBox="0 0 320 206" class="geo"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#e3f9ea"/>`;
    s += seg([x0, y0], [x1, y0]) + seg([x0, y1], [x1, y1]) + xs.map((x) => seg([x, y0], [x, y1])).join('');
    for (let i = 0; i < m; i++) s += lbl(i + 1, (xs[i] + xs[i + 1]) / 2, (y0 + y1) / 2 + 8, 'fig-part');
    return s + '</svg>';
  }
  // Hình vuông chia thành 4 hình vuông nhỏ
  function gridFig() {
    const x0 = 70, y0 = 20, w = 180, h = w / 2;
    let s = `<svg viewBox="0 0 320 222" class="geo"><rect x="${x0}" y="${y0}" width="${w}" height="${w}" fill="#e3eeff"/>`;
    s += seg([x0, y0], [x0 + w, y0]) + seg([x0, y0 + h], [x0 + w, y0 + h]) + seg([x0, y0 + w], [x0 + w, y0 + w]);
    s += seg([x0, y0], [x0, y0 + w]) + seg([x0 + h, y0], [x0 + h, y0 + w]) + seg([x0 + w, y0], [x0 + w, y0 + w]);
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j], k) => { s += lbl(k + 1, x0 + h / 2 + i * h, y0 + h / 2 + j * h + 8, 'fig-part'); });
    return s + '</svg>';
  }
  A.countFig = () => {
    const kind = pick(['tri', 'tri', 'rect', 'square']);
    if (kind === 'square') {
      return { type: 'input', skill: 'nc.hinh', prompt: 'Hình bên có tất cả bao nhiêu hình vuông?', visual: { kind: 'svg', svg: gridFig() }, big: '? hình', answer: 5,
        hint: 'Đừng quên hình vuông to bao quanh cả 4 hình nhỏ.', explain: 'Có 4 hình vuông nhỏ (1, 2, 3, 4) và 1 hình vuông to gồm cả 4 hình: 4 + 1 = 5 hình vuông.' };
    }
    const m = pick([2, 3, 3]), n = (m * (m + 1)) / 2;
    const name = kind === 'tri' ? 'hình tam giác' : 'hình tứ giác';
    const parts = m === 3 ? 'Hình 1 phần: 1, 2, 3 (3 hình). Ghép 2 phần liền nhau: 1 và 2, 2 và 3 (2 hình). Ghép cả 3 phần: 1 hình. Tất cả: 3 + 2 + 1 = 6'
      : 'Hình 1 phần: 1, 2 (2 hình). Ghép cả 2 phần: 1 hình. Tất cả: 2 + 1 = 3';
    return { type: 'input', skill: 'nc.hinh', prompt: `Hình bên có tất cả bao nhiêu ${name}?`, visual: { kind: 'svg', svg: kind === 'tri' ? triFig(m) : rectFig(m) },
      big: '? hình', answer: n, hint: 'Đếm các hình nhỏ trước, rồi đếm các hình ghép từ những hình nhỏ liền nhau.', explain: `${parts} ${name}.` };
  };
  // Đếm đoạn thẳng có các điểm nằm trên một đường thẳng
  A.segmentsOnLine = () => {
    const n = pick([3, 4, 4, 5]), names = 'ABCDE'.slice(0, n).split('');
    const xs = [30];
    for (let i = 1; i < n; i++) xs.push(xs[i - 1] + rand(48, 66));
    const k = 290 / xs[n - 1];
    const pts = xs.map((x) => [15 + x * k * 0.95, 70]);
    let s = '<svg viewBox="0 0 320 110" class="geo">' + seg(pts[0], pts[n - 1]);
    pts.forEach((p, i) => { s += dot(p) + lbl(names[i], p[0], 48); });
    const list = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) list.push(names[i] + names[j]);
    return { type: 'input', skill: 'nc.hinh', prompt: 'Trên hình vẽ có tất cả bao nhiêu đoạn thẳng?', visual: { kind: 'svg', svg: s + '</svg>' },
      big: '? đoạn', answer: list.length, hint: `Bắt đầu từ điểm A: AB, AC, … rồi tới điểm B: BC, …`,
      explain: `Các đoạn thẳng: ${list.join(', ')}. Có ${list.length} đoạn thẳng.` };
  };
  A.polylineMissing = () => {
    const a = rand(5, 19), b = rand(5, 19), c = rand(5, 19), tot = a + b + c;
    const prompt = `Đường gấp khúc ABCD dài ${tot} cm. Đoạn thẳng AB dài ${a} cm, đoạn thẳng BC dài ${b} cm. Hỏi đoạn thẳng CD dài bao nhiêu xăng-ti-mét?`;
    return { type: 'input', skill: 'nc.hinh', prompt, speak: sayUnits(prompt), big: '? {cm}', answer: c, unit: 'cm',
      hint: 'Độ dài đường gấp khúc ABCD = AB + BC + CD.', explain: `AB + BC = ${a} + ${b} = ${a + b} (cm)\nCD = ${tot} − ${a + b} = ${c} (cm)\nĐáp số: ${c} cm.` };
  };
  A.polylineEqual = () => {
    const n = rand(3, 4), l = rand(4, 9);
    const prompt = `Một đường gấp khúc gồm ${n} đoạn thẳng, mỗi đoạn dài ${l} cm. Hỏi đường gấp khúc đó dài bao nhiêu xăng-ti-mét?`;
    return { type: 'input', skill: 'nc.hinh', prompt, speak: sayUnits(prompt), big: '? {cm}', answer: n * l, unit: 'cm',
      hint: `Cộng độ dài của ${n} đoạn thẳng.`, explain: `${Array(n).fill(l).join(' + ')} = ${n * l} (cm).` };
  };

  // ======================= Chủ đề 6: Thời gian =======================
  const WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const wdLow = (i) => (i === 0 ? 'chủ nhật' : 'thứ ' + WD[i].slice(4));
  const wdOpts = (ans) => {
    const i = WD.indexOf(ans);
    return shuffle([ans, ...U.sample([1, 2, 3, 4, 5, 6].map((k) => WD[(i + k) % 7]), 3)]);
  };
  const buoi = (h) => (h < 11 ? 'sáng' : h < 13 ? 'trưa' : h < 18 ? 'chiều' : 'tối');
  A.timeAfter = () => {
    const h = rand(6, 15), k = rand(2, 7), h2 = h + k;
    if (h2 > 21) return A.timeAfter();
    const opts = shuffle(U.uniq([h2, h2 - 1, h2 + 1, h2 > 12 ? h2 - 12 : h - k > 0 ? h - k : h2 + 2])).map((x) => `${x} giờ`);
    return { type: 'choice', skill: 'nc.thoigian', prompt: `Bây giờ là ${h} giờ ${buoi(h)}. Hỏi ${k} giờ nữa là mấy giờ?`, options: opts, answer: `${h2} giờ`, optStyle: 'text',
      hint: 'Đếm thêm từng giờ. Nhớ: 1 giờ chiều còn gọi là 13 giờ, 2 giờ chiều là 14 giờ…',
      explain: `${h} + ${k} = ${h2}. Vậy lúc đó là ${h2} giờ${h2 > 12 ? ` (tức ${h2 - 12} giờ ${buoi(h2)})` : ''}.` };
  };
  const ACTS = [
    { m: true, a: 'vào học', b: 'tan học', c: 'ở trường', s: [7, 8], e: [10, 11] },
    { m: true, a: 'bắt đầu đi tham quan', b: 'trở về', c: 'đi tham quan', s: [6, 8], e: [10, 11] },
    { m: false, a: 'bắt đầu đá bóng', b: 'nghỉ', c: 'đá bóng', s: [14, 15], e: [16, 17] },
    { m: false, a: 'đến thư viện', b: 'ra về', c: 'ở thư viện', s: [13, 15], e: [16, 17] },
  ];
  A.duration = () => {
    const x = pick(ACTS), s = rand(...x.s), e = rand(...x.e), n = pick(NAMES);
    return { type: 'input', skill: 'nc.thoigian', prompt: `${n} ${x.a} lúc ${s} giờ, ${x.b} lúc ${e} giờ. Hỏi ${n} ${x.c} trong bao nhiêu giờ?`,
      big: '? giờ', answer: e - s, hint: `Đếm từ ${s} giờ đến ${e} giờ.`, explain: `Từ ${s} giờ đến ${e} giờ là: ${e} − ${s} = ${e - s} (giờ).` };
  };
  A.calendarJump = () => {
    const w = rand(0, 6), d = rand(1, 10), jump = pick([7, 14, rand(8, 12), rand(2, 6)]), d2 = d + jump, w2 = (w + jump) % 7;
    const full = Math.floor(jump / 7), rest = jump % 7;
    const mid = d + 7 * full;
    const steps = U.range(1, rest).map((i) => `ngày ${mid + i} là ${wdLow((w + i) % 7)}`).join(', ');
    return { type: 'choice', skill: 'nc.thoigian', prompt: `Trong một tháng, ngày ${d} là ${wdLow(w)}. Hỏi ngày ${d2} của tháng đó là thứ mấy?`,
      options: wdOpts(WD[w2]), answer: WD[w2], optStyle: 'text', hint: 'Một tuần có 7 ngày: cứ thêm 7 ngày lại đến đúng thứ đó.',
      explain: full ? `Ngày ${d}${full === 2 ? `, ${d + 7}` : ''} và ngày ${mid} đều là ${wdLow(w)}.${rest ? ` Đếm tiếp: ${steps}.` : ''}`
        : `Đếm tiếp từ ngày ${d}: ${steps}.` };
  };
  A.weekLogic = () => {
    const today = rand(0, 6), v = rand(0, 3);
    const W = (k) => WD[(today + k + 70) % 7];
    const q = [
      [`Hôm qua là ${W(-1).toLowerCase()}. Hỏi ngày mai là thứ mấy?`, W(1), `Hôm qua là ${W(-1).toLowerCase()} thì hôm nay là ${W(0).toLowerCase()}, ngày mai là ${W(1).toLowerCase()}.`],
      [`Ngày mai là ${W(1).toLowerCase()}. Hỏi hôm qua là thứ mấy?`, W(-1), `Ngày mai là ${W(1).toLowerCase()} thì hôm nay là ${W(0).toLowerCase()}, hôm qua là ${W(-1).toLowerCase()}.`],
      [`Hôm kia là ${W(-2).toLowerCase()}. Hỏi hôm nay là thứ mấy?`, W(0), `Hôm kia là trước hôm nay 2 ngày. ${W(-2)} thêm 2 ngày là ${W(0).toLowerCase()}.`],
      [`Ngày kia là ${W(2).toLowerCase()}. Hỏi hôm nay là thứ mấy?`, W(0), `Ngày kia là sau hôm nay 2 ngày. ${W(2)} lùi lại 2 ngày là ${W(0).toLowerCase()}.`],
    ][v];
    return { type: 'choice', skill: 'nc.thoigian', prompt: q[0], options: wdOpts(q[1]), answer: q[1], optStyle: 'text',
      hint: 'Hôm kia: trước hôm nay 2 ngày. Ngày kia: sau hôm nay 2 ngày.', explain: q[2] };
  };

  // ======================= Chủ đề 8: Phép nhân, phép chia =======================
  // Theo sách: "2 × 3" nghĩa là 2 được lấy 3 lần.
  A.legs = () => {
    const v = rand(0, 2);
    if (v === 0) {
      const n = rand(3, 10);
      return { type: 'input', skill: 'nc.nhanchia', prompt: `Có ${n} con gà. Hỏi ${n} con gà có tất cả bao nhiêu cái chân?`, big: '? cái chân', answer: 2 * n,
        hint: 'Mỗi con gà có 2 chân.', explain: `Mỗi con gà có 2 chân, ${n} con gà: 2 × ${n} = ${2 * n} (cái chân).` };
    }
    if (v === 1) {
      const n = rand(2, 8);
      return { type: 'input', skill: 'nc.nhanchia', prompt: `Có ${n} bạn, mỗi bạn giơ một bàn tay. Hỏi có tất cả bao nhiêu ngón tay?`, big: '? ngón tay', answer: 5 * n,
        hint: 'Mỗi bàn tay có 5 ngón.', explain: `Mỗi bàn tay có 5 ngón, ${n} bàn tay: 5 × ${n} = ${5 * n} (ngón tay).` };
    }
    let g, d;
    do { g = rand(2, 6); d = rand(2, 6); } while (g + d > 10);
    return { type: 'input', skill: 'nc.nhanchia', prompt: `Trong sân có ${g} con gà và ${d} con vịt. Hỏi có tất cả bao nhiêu cái chân?`, big: '? cái chân', answer: 2 * (g + d),
      hint: 'Gà và vịt đều có 2 chân. Tính số con trước.', explain: `Có tất cả: ${g} + ${d} = ${g + d} (con)\nMỗi con có 2 chân: 2 × ${g + d} = ${2 * (g + d)} (cái chân)\nĐáp số: ${2 * (g + d)} cái chân.` };
  };
  A.mulExpr = () => {
    const t = pick([2, 5]), k = rand(2, 10), p = t * k, plus = chance(0.5);
    const c = plus ? rand(2, 30) : rand(1, p - 1), r = plus ? p + c : p - c;
    return { type: 'input', skill: 'nc.nhanchia', prompt: 'Tính (làm phép nhân trước):', big: `${t} × ${k} ${plus ? '+' : '−'} ${c} = ?`, answer: r,
      hint: `Tính ${t} × ${k} trước.`, explain: `${t} × ${k} = ${p}.\n${p} ${plus ? '+' : '−'} ${c} = ${r}.` };
  };
  A.factorEq = () => {
    const t = pick([2, 5]), k = rand(2, 10), p = t * k, c = rand(1, p - 1);
    return { type: 'input', skill: 'nc.nhanchia', prompt: 'Điền số thích hợp:', big: `${t} × ? = ${c} + ${p - c}`, answer: k,
      hint: `Tính vế bên phải trước, rồi nhớ lại bảng nhân ${t}.`, explain: `${c} + ${p - c} = ${p}. Mà ${t} × ${k} = ${p}, nên số cần điền là ${k}.` };
  };
  const MUL = [];
  for (const t of [2, 5]) for (let k = 2; k <= 10; k++) MUL.push([t, k]);
  A.mulCompare = () => {
    let t1, k1, near;
    do {
      [t1, k1] = pick(MUL);
      near = MUL.filter(([t, k]) => !(t === t1 && k === k1) && Math.abs(t * k - t1 * k1) <= 4); // tích gần nhau cho khó
    } while (!near.length);
    const [t2, k2] = pick(near);
    const s = sign(t1 * k1, t2 * k2);
    return { type: 'choice', skill: 'nc.nhanchia', prompt: 'Chọn dấu thích hợp:', big: `${t1} × ${k1} ? ${t2} × ${k2}`, options: SIGNS, answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${t1} nhân ${k1}, so với ${t2} nhân ${k2}.`, hint: 'Tính tích của từng vế rồi so sánh.',
      explain: `${t1} × ${k1} = ${t1 * k1}, ${t2} × ${k2} = ${t2 * k2}, mà ${t1 * k1} ${s} ${t2 * k2}.` };
  };
  A.mulTwoStep = () => {
    if (chance(0.5)) {
      const k = rand(3, 8), have = 5 * k, eat = rand(2, have - 2);
      return { type: 'input', skill: 'nc.loivan', prompt: `Mỗi hộp có 5 cái bánh. Mẹ mua ${k} hộp, cả nhà đã ăn ${eat} cái bánh. Hỏi còn lại bao nhiêu cái bánh?`,
        big: '?', answer: have - eat, hint: 'Tính số bánh mẹ mua trước (phép nhân), rồi mới tính số bánh còn lại.',
        explain: `Số bánh mẹ mua là:\n5 × ${k} = ${have} (cái)\nSố bánh còn lại là:\n${have} − ${eat} = ${have - eat} (cái)\nĐáp số: ${have - eat} cái bánh.` };
    }
    const k = rand(3, 9), need = 2 * k, total = need + rand(1, 15);
    return { type: 'input', skill: 'nc.loivan', prompt: `Cô giáo có ${total} quyển vở. Cô thưởng cho ${k} bạn, mỗi bạn 2 quyển. Hỏi cô còn lại bao nhiêu quyển vở?`,
      big: '?', answer: total - need, hint: 'Tính số vở cô đã thưởng trước.',
      explain: `Số vở cô đã thưởng là:\n2 × ${k} = ${need} (quyển)\nSố vở cô còn lại là:\n${total} − ${need} = ${total - need} (quyển)\nĐáp số: ${total - need} quyển vở.` };
  };
  A.seqMul = () => {
    const t = pick([2, 5]), down = chance(0.5);
    const k0 = down ? rand(6, 10) : rand(1, 6);
    const seq = U.range(0, 4).map((i) => t * (down ? k0 - i : k0 + i));
    const hide = rand(1, 4);
    return { type: 'input', skill: 'nc.dayso', prompt: 'Tìm số thích hợp thay cho dấu “?” trong dãy số:', big: seq.map((x, i) => (i === hide ? '?' : x)).join(', '),
      answer: seq[hide], hint: 'Xem mỗi số hơn hoặc kém số đứng trước bao nhiêu.',
      explain: `Mỗi số ${down ? 'kém' : 'hơn'} số đứng trước nó ${t} đơn vị. Số cần tìm là ${seq[hide]}.` };
  };
  A.divTwoStep = () => {
    if (chance(0.5)) {
      const p = pick([2, 5]), q = rand(3, 10), total = p * q, eat = rand(1, q - 1);
      return { type: 'input', skill: 'nc.loivan', prompt: `Có ${total} cái kẹo chia đều cho ${p} bạn. Mỗi bạn ăn ${eat} cái. Hỏi mỗi bạn còn lại mấy cái kẹo?`,
        big: '?', answer: q - eat, hint: 'Tìm số kẹo mỗi bạn được chia trước.',
        explain: `Mỗi bạn được chia số kẹo là:\n${total} : ${p} = ${q} (cái)\nMỗi bạn còn lại số kẹo là:\n${q} − ${eat} = ${q - eat} (cái)\nĐáp số: ${q - eat} cái kẹo.` };
    }
    const q = rand(4, 10), total = 2 * q, take = rand(1, q - 1);
    return { type: 'input', skill: 'nc.loivan', prompt: `Có ${total} quả cam xếp đều vào các đĩa, mỗi đĩa 2 quả. Mẹ mang đi ${take} đĩa. Hỏi còn lại mấy đĩa cam?`,
      big: '?', answer: q - take, hint: 'Tìm số đĩa cam lúc đầu trước.',
      explain: `Số đĩa cam lúc đầu là:\n${total} : 2 = ${q} (đĩa)\nSố đĩa cam còn lại là:\n${q} − ${take} = ${q - take} (đĩa)\nĐáp số: ${q - take} đĩa cam.` };
  };
  A.divCompare = () => {
    const mk = () => { const d = pick([2, 5]), q = rand(1, 10); return [d * q, d, q]; };
    const [a, b, x] = mk();
    let c, d, y;
    do { [c, d, y] = mk(); } while (Math.abs(x - y) > 2 || (a === c && b === d));
    const s = sign(x, y);
    return { type: 'choice', skill: 'nc.nhanchia', prompt: 'Chọn dấu thích hợp:', big: `${a} : ${b} ? ${c} : ${d}`, options: SIGNS, answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${a} chia ${b}, so với ${c} chia ${d}.`, hint: 'Tính thương của từng vế rồi so sánh.',
      explain: `${a} : ${b} = ${x}, ${c} : ${d} = ${y}, mà ${x} ${s} ${y}.` };
  };

  // ======================= Chủ đề 9: Hình khối =======================
  A.solidRows = () => {
    const per = pick([2, 5]), rows = rand(2, 6), [e, name] = pick([['⚽', 'quả bóng (khối cầu)'], ['🥫', 'hộp sữa (khối trụ)']]);
    return { type: 'input', skill: 'nc.nhanchia', prompt: `Bạn Nam xếp ${rows} hàng, mỗi hàng ${per} ${name}. Hỏi bạn Nam xếp tất cả bao nhiêu ${name.split(' (')[0]}?`,
      visual: { kind: 'emoji', groups: Array.from({ length: rows }, () => ({ e, n: per })) }, big: '?', answer: per * rows,
      hint: `Mỗi hàng có ${per}, có ${rows} hàng như thế.`, explain: `${per} được lấy ${rows} lần: ${per} × ${rows} = ${per * rows}.` };
  };
  A.solidLogic = () => {
    const tru = rand(3, 9), cau = rand(2, 9), tot = tru + cau;
    return { type: 'input', skill: 'nc.loivan', prompt: `Trong hộp có ${tot} đồ vật, gồm ${tru} đồ vật có dạng khối trụ, còn lại có dạng khối cầu. Hỏi có mấy đồ vật dạng khối cầu?`,
      big: '?', answer: cau, hint: 'Lấy tổng số đồ vật trừ đi số khối trụ.', explain: `${tot} − ${tru} = ${cau} (đồ vật dạng khối cầu).` };
  };

  // ======================= Chủ đề 10: Các số trong phạm vi 1000 =======================
  A.digitCards3 = () => {
    let d;
    do { d = U.sample(U.range(0, 9), 3); } while (d.filter((x) => x > 0).length < 2);
    const big = chance(0.5);
    let ans, why;
    if (big) {
      const s = d.slice().sort((x, y) => y - x);
      ans = s[0] * 100 + s[1] * 10 + s[2];
      why = `Xếp các chữ số từ lớn đến bé: ${s.join(', ')}. Số lớn nhất là ${ans}.`;
    } else {
      const s = d.slice().sort((x, y) => x - y), h = s.find((x) => x > 0), r = s.filter((x, i) => i !== s.indexOf(h));
      ans = h * 100 + r[0] * 10 + r[1];
      why = `Hàng trăm là chữ số bé nhất khác 0: ${h}. Hai chữ số còn lại xếp từ bé đến lớn: ${r.join(', ')}. Số bé nhất là ${ans}.`;
    }
    return { type: 'input', skill: 'nc.so', prompt: `Dùng cả ba tấm thẻ, lập số có ba chữ số ${big ? 'lớn' : 'bé'} nhất. Đó là số nào?`,
      visual: { kind: 'pic', html: cards(d) }, big: '?', answer: ans,
      hint: big ? 'Chữ số lớn nhất đặt ở hàng trăm.' : 'Hàng trăm phải là chữ số bé nhất nhưng khác 0.', explain: why };
  };
  A.number3Cond = () => {
    const v = rand(0, 2);
    if (v === 0) {
      const h = rand(1, 7), k = rand(1, 9 - h), u = h + k;
      return { type: 'input', skill: 'nc.so', prompt: `Tìm số có ba chữ số, biết chữ số hàng trăm là ${h}, chữ số hàng chục là 0 và chữ số hàng đơn vị hơn chữ số hàng trăm ${k}.`,
        big: '?', answer: h * 100 + u, hint: `Chữ số hàng đơn vị là ${h} + ${k}.`, explain: `Hàng trăm: ${h}, hàng chục: 0, hàng đơn vị: ${h} + ${k} = ${u}. Số cần tìm là ${h * 100 + u}.` };
    }
    if (v === 1) {
      const h = rand(2, 9), k = rand(1, h - 1), u = h - k;
      return { type: 'input', skill: 'nc.so', prompt: `Tìm số có ba chữ số, biết chữ số hàng trăm là ${h}, chữ số hàng chục bằng chữ số hàng trăm, chữ số hàng đơn vị kém chữ số hàng chục ${k}.`,
        big: '?', answer: h * 111 - k, hint: `Chữ số hàng chục là ${h}, chữ số hàng đơn vị là ${h} − ${k}.`,
        explain: `Hàng trăm: ${h}, hàng chục: ${h}, hàng đơn vị: ${h} − ${k} = ${u}. Số cần tìm là ${h * 110 + u}.` };
    }
    const h = rand(1, 7), n = h * 100 + (h + 1) * 10 + (h + 2);
    return { type: 'input', skill: 'nc.so', prompt: `Tìm số có ba chữ số, biết chữ số hàng trăm là ${h}, mỗi chữ số đứng sau hơn chữ số đứng ngay trước nó 1 đơn vị.`,
      big: '?', answer: n, hint: `Các chữ số lần lượt là ${h}, ${h} + 1, ${h} + 2.`, explain: `Các chữ số là ${h}, ${h + 1}, ${h + 2}. Số cần tìm là ${n}.` };
  };
  A.seq1000 = () => {
    const step = pick([10, 20, 50, 100]), down = chance(0.4);
    const start = down ? step * rand(5, Math.floor(1000 / step)) : step * rand(0, Math.floor(1000 / step) - 5);
    const seq = U.range(0, 4).map((i) => start + (down ? -i : i) * step);
    const hide = rand(1, 4);
    return { type: 'input', skill: 'nc.dayso', prompt: 'Tìm số thích hợp thay cho dấu “?” trong dãy số:', big: seq.map((x, i) => (i === hide ? '?' : x)).join(', '),
      answer: seq[hide], hint: 'Xem mỗi số hơn hoặc kém số đứng trước bao nhiêu.',
      explain: `Mỗi số ${down ? 'kém' : 'hơn'} số đứng trước nó ${step} đơn vị. Số cần tìm là ${seq[hide]}.` };
  };
  const EXTREMES = [
    ['Số lớn nhất có ba chữ số là số nào?', 999, 'Ba chữ số đều là chữ số lớn nhất: 9. Đó là số 999.'],
    ['Số bé nhất có ba chữ số là số nào?', 100, 'Hàng trăm bé nhất là 1, hàng chục và hàng đơn vị là 0. Đó là số 100.'],
    ['Số lớn nhất có ba chữ số khác nhau là số nào?', 987, 'Chọn ba chữ số lớn nhất khác nhau: 9, 8, 7. Đó là số 987.'],
    ['Số bé nhất có ba chữ số khác nhau là số nào?', 102, 'Hàng trăm là 1 (bé nhất khác 0), hàng chục là 0, hàng đơn vị là 2 (khác 1 và 0). Đó là số 102.'],
    ['Số tròn chục lớn nhất có ba chữ số là số nào?', 990, 'Số tròn chục có hàng đơn vị là 0. Lớn nhất là 990.'],
    ['Số tròn trăm lớn nhất có ba chữ số là số nào?', 900, 'Số tròn trăm có hàng chục và hàng đơn vị là 0. Lớn nhất là 900.'],
    ['Số liền sau của số lớn nhất có hai chữ số là số nào?', 100, 'Số lớn nhất có hai chữ số là 99. Số liền sau của 99 là 100.'],
    ['Số liền trước của số bé nhất có ba chữ số là số nào?', 99, 'Số bé nhất có ba chữ số là 100. Số liền trước của 100 là 99.'],
  ];
  A.extremes3 = () => {
    const [q, a, e] = pick(EXTREMES);
    return { type: 'input', skill: 'nc.so', prompt: q, big: '?', answer: a, hint: 'Nghĩ xem mỗi hàng (trăm, chục, đơn vị) nên là chữ số nào.', explain: e };
  };
  A.countRange3 = () => {
    if (chance(0.5)) {
      const a = rand(100, 900), b = a + rand(8, 25);
      return { type: 'input', skill: 'nc.so', prompt: `Từ ${a} đến ${b} có tất cả bao nhiêu số?`, big: '? số', answer: b - a + 1,
        hint: 'Nhớ tính cả số đầu và số cuối.', explain: `${b} − ${a} = ${b - a}. Tính thêm cả số ${a}: ${b - a} + 1 = ${b - a + 1} số.` };
    }
    const h = rand(1, 8);
    return { type: 'input', skill: 'nc.so', prompt: `Từ ${h * 100} đến ${(h + 1) * 100} có bao nhiêu số tròn chục?`, big: '? số', answer: 11,
      hint: `Viết ra: ${h * 100}, ${h * 100 + 10}, ${h * 100 + 20}, …`, explain: `Đó là các số ${h * 100}, ${h * 100 + 10}, …, ${h * 100 + 90}, ${(h + 1) * 100}: có 11 số.` };
  };
  A.compareForm3 = () => {
    const h = rand(1, 9), t = rand(0, 9), u = rand(0, 9), n = h * 100 + t * 10 + u;
    const others = U.uniq([h * 100 + u * 10 + t, n + pick([-10, -1, 1, 10]), n]).filter((x) => x >= 100 && x <= 999);
    const m = pick(others);
    const s = sign(n, m);
    const form = chance(0.5) ? `${h} trăm ${t} chục ${u} đơn vị` : `${h * 100} + ${t * 10} + ${u}`;
    return { type: 'choice', skill: 'nc.dau', prompt: 'Chọn dấu thích hợp:', big: `${form} ? ${m}`, bigText: true, options: SIGNS, answer: s, optStyle: 'sign',
      speak: `Chọn dấu thích hợp: ${form.replace(/\+/g, 'cộng')}, so với ${m}.`, hint: 'Viết vế bên trái thành số có ba chữ số trước.',
      explain: `${form} là ${n}, mà ${n} ${s} ${m}.` };
  };

  // ======================= Chủ đề 11: Độ dài, tiền Việt Nam =======================
  A.lengthMixed = () => {
    const v = rand(0, 2);
    let L, R, l, r, why;
    if (v === 0) { const a = rand(2, 9); l = a * 10; r = l + pick([-5, 0, 5, -10, 10]); L = `${a} dm`; R = `${r} cm`; why = `${a} dm = ${l} cm`; }
    else if (v === 1) { const a = rand(1, 9); l = a * 10; r = l + pick([-3, 0, 2, -1]); L = `${a} m`; R = `${r} dm`; why = `${a} m = ${l} dm`; }
    else { l = 100; r = pick([90, 95, 100, 105, 110]); L = '1 m'; R = `${r} cm`; why = '1 m = 100 cm'; }
    const s = sign(l, r);
    return { type: 'choice', skill: 'nc.doluong', prompt: 'Chọn dấu thích hợp:', big: `${L} ? ${R}`, options: SIGNS, answer: s, optStyle: 'sign',
      speak: sayUnits(`Chọn dấu thích hợp: ${L}, so với ${R}.`), hint: 'Đổi về cùng một đơn vị rồi mới so sánh.',
      explain: `${why}, mà ${l} ${s} ${r}. Vậy ${L} ${s} ${R}.` };
  };
  A.lengthTwoStep = () => {
    if (chance(0.5)) {
      const c = rand(15, 85);
      const prompt = `Sợi dây dài 1 m. Bố cắt đi ${c} cm. Hỏi sợi dây còn lại dài bao nhiêu xăng-ti-mét?`;
      return { type: 'input', skill: 'nc.doluong', prompt, speak: sayUnits(prompt), big: '? {cm}', answer: 100 - c, unit: 'cm',
        hint: 'Đổi 1 m ra xăng-ti-mét trước: 1 m = 100 cm.', explain: `1 m = 100 cm.\n100 − ${c} = ${100 - c} (cm)\nĐáp số: ${100 - c} cm.` };
    }
    const a = rand(1, 6), b = rand(5, 35);
    const prompt = `Con kiến bò được ${a} dm, rồi bò tiếp ${b} cm. Hỏi con kiến bò được tất cả bao nhiêu xăng-ti-mét?`;
    return { type: 'input', skill: 'nc.doluong', prompt, speak: sayUnits(prompt), big: '? {cm}', answer: a * 10 + b, unit: 'cm',
      hint: 'Đổi đề-xi-mét ra xăng-ti-mét trước: 1 dm = 10 cm.', explain: `${a} dm = ${a * 10} cm.\n${a * 10} + ${b} = ${a * 10 + b} (cm)\nĐáp số: ${a * 10 + b} cm.` };
  };
  const SHOP = [['một gói kẹo', 'một cái bút chì'], ['một quyển vở', 'một cái thước'], ['một gói bim bim', 'một hộp sữa'], ['một bông hoa', 'một tấm thiệp']];
  A.moneyLeft = () => {
    const [x, y] = pick(SHOP);
    let p, q;
    do { p = rand(1, 5) * 100; q = rand(1, 5) * 100; } while (p + q >= 1000);
    return { type: 'input', skill: 'nc.doluong', prompt: `Mẹ có 1000 đồng. Mẹ mua ${x} hết ${p} đồng và ${y} hết ${q} đồng. Hỏi mẹ còn lại bao nhiêu tiền?`,
      big: '? đồng', answer: 1000 - p - q, hint: 'Tính số tiền mẹ đã tiêu trước.',
      explain: `Mẹ đã tiêu: ${p} + ${q} = ${p + q} (đồng)\nMẹ còn lại: 1000 − ${p + q} = ${1000 - p - q} (đồng)\nĐáp số: ${1000 - p - q} đồng.` };
  };
  A.moneyFewest = () => {
    const target = pick([300, 400, 600, 700, 800, 900]);
    const notes = [];
    let left = target;
    for (const n of [500, 200, 100]) while (left >= n) { notes.push(n); left -= n; }
    return { type: 'input', skill: 'nc.doluong', prompt: `Có các tờ tiền loại 100 đồng, 200 đồng và 500 đồng (mỗi loại có nhiều tờ). Cần ít nhất mấy tờ để được đúng ${target} đồng?`,
      visual: { kind: 'money', notes: [100, 200, 500] }, big: '? tờ', answer: notes.length, hint: 'Dùng tờ có mệnh giá lớn trước.',
      explain: `${notes.join(' + ')} = ${target} (đồng). Cần ít nhất ${notes.length} tờ.` };
  };

  // ======================= Chủ đề 12: Cộng, trừ trong phạm vi 1000 =======================
  const pairAdd1000 = () => { for (;;) { const a = rand(105, 789), b = rand(105, 999 - a); if (b >= 105 && a + b <= 999) return [a, b]; } };
  A.missing1000 = () => {
    const [a, b] = pairAdd1000(), s = a + b, kind = rand(0, 2);
    const base = { type: 'input', skill: 'nc.timso', prompt: 'Tìm số thích hợp thay cho dấu “?”:' };
    if (kind === 0) return { ...base, big: `? + ${b} = ${s}`, answer: a, hint: `Lấy ${s} trừ ${b}.`, explain: `${s} − ${b} = ${a}, nên số cần tìm là ${a}.` };
    if (kind === 1) return { ...base, big: `${s} − ? = ${a}`, answer: b, hint: `Lấy ${s} trừ ${a}.`, explain: `${s} − ${a} = ${b}, nên số cần tìm là ${b}.` };
    return { ...base, big: `? − ${b} = ${a}`, answer: s, hint: `Lấy ${a} cộng ${b}.`, explain: `${a} + ${b} = ${s}, nên số cần tìm là ${s}.` };
  };
  A.digitBox3 = () => {
    const [a, b] = pairAdd1000(), s = a + b;
    const inA = chance(0.5), target = String(inA ? a : b), pos = rand(0, 2);
    const masked = target.slice(0, pos) + '?' + target.slice(pos + 1);
    return { type: 'input', skill: 'nc.timso', prompt: 'Tìm chữ số thích hợp thay cho dấu “?”:', big: inA ? `${masked} + ${b} = ${s}` : `${a} + ${masked} = ${s}`,
      answer: Number(target[pos]), hint: 'Lấy tổng trừ đi số hạng đã biết để tìm số hạng còn lại.',
      explain: `${s} − ${inA ? b : a} = ${inA ? a : b}, nên chữ số cần tìm là ${target[pos]}.` };
  };
  A.compare1000 = () => {
    const [a, b] = pairAdd1000(), v = a + b;
    for (let t = 0; t < 300; t++) {
      const target = v + pick([-10, -1, 0, 0, 1, 10]);
      if (target < 100 || target > 990) continue;
      const c = rand(target + 5, 999), d = c - target;
      if (d < 5) continue;
      const s = sign(v, target);
      return { type: 'choice', skill: 'nc.dau', prompt: 'Chọn dấu thích hợp:', big: `${a} + ${b} ? ${c} − ${d}`, options: SIGNS, answer: s, optStyle: 'sign',
        speak: `Chọn dấu thích hợp: ${a} cộng ${b}, so với ${c} trừ ${d}.`, hint: 'Tính kết quả của từng vế rồi mới so sánh.',
        explain: `${a} + ${b} = ${v}, ${c} − ${d} = ${target}, mà ${v} ${s} ${target}.` };
    }
    return A.compare1000();
  };
  A.chain1000 = () => {
    for (;;) {
      const a = rand(120, 600), b = rand(105, 380), m = a + b;
      if (m > 999) continue;
      const c = rand(105, m - 50), r = m - c;
      return { type: 'input', skill: 'nc.tinh', prompt: 'Tính:', big: `${a} + ${b} − ${c} = ?`, answer: r,
        hint: 'Tính lần lượt từ trái sang phải.', explain: `${a} + ${b} = ${m}, ${m} − ${c} = ${r}.` };
    }
  };
  A.twoStep1000 = () => {
    for (;;) {
      const a = rand(25, 60) * 10, d = rand(2, 15) * 10, more = chance(0.5), b = more ? a + d : a - d;
      if (b < 100 || a + b > 999) continue;
      return { type: 'input', skill: 'nc.loivan',
        prompt: `Trường em có ${a} học sinh nam, số học sinh nữ ${more ? 'nhiều' : 'ít'} hơn số học sinh nam ${d} em. Hỏi trường em có tất cả bao nhiêu học sinh?`,
        big: '?', answer: a + b, hint: 'Tìm số học sinh nữ trước, rồi tính cả trường.',
        explain: `Số học sinh nữ là:\n${a} ${more ? '+' : '−'} ${d} = ${b} (học sinh)\nTrường em có tất cả số học sinh là:\n${a} + ${b} = ${a + b} (học sinh)\nĐáp số: ${a + b} học sinh.` };
    }
  };

  // ======================= Chủ đề 13: Thống kê, khả năng =======================
  const CHANCE = ['chắc chắn', 'có thể', 'không thể'];
  A.chancePigeon = () => {
    for (;;) {
      const r = rand(1, 4), b = rand(1, 4), k = rand(2, r + b), v = rand(0, 2);
      let ask, ans, why;
      if (v === 0) {
        ask = 'có ít nhất 1 viên bi đỏ';
        ans = k > b ? 'chắc chắn' : 'có thể';
        why = k > b ? `Chỉ có ${b} viên bi xanh, mà lấy ra ${k} viên nên chắc chắn có ít nhất 1 viên bi đỏ.` : `Có thể lấy được bi đỏ, nhưng cũng có thể lấy ra toàn bi xanh (vì có ${b} viên bi xanh).`;
      } else if (v === 1) {
        ask = `cả ${k} viên đều là bi xanh`;
        ans = k > b ? 'không thể' : 'có thể';
        why = k > b ? `Chỉ có ${b} viên bi xanh nên không thể lấy được ${k} viên bi xanh.` : `Có ${b} viên bi xanh nên có thể lấy được ${k} viên bi xanh, nhưng cũng có thể lấy phải bi đỏ.`;
      } else {
        ask = 'có viên bi màu vàng';
        ans = 'không thể';
        why = 'Trong hộp không có bi vàng nên không thể lấy được bi vàng.';
      }
      if (k === r + b && v === 0 && ans !== 'chắc chắn') continue;
      const items = shuffle([...Array(r).fill('🔴'), ...Array(b).fill('🔵')]);
      return { type: 'choice', skill: 'nc.khanang', prompt: `Trong hộp có ${r} viên bi đỏ và ${b} viên bi xanh. Không nhìn vào hộp, lấy ra ${k} viên bi. Chọn từ thích hợp:`,
        visual: { kind: 'bag', items }, big: `Trong ${k} viên lấy ra, ? ${ask}.`, bigText: true, options: CHANCE, answer: ans, optStyle: 'text',
        speak: `Trong hộp có ${r} viên bi đỏ và ${b} viên bi xanh. Lấy ra ${k} viên bi. Trong ${k} viên lấy ra, ... ${ask}.`,
        hint: 'Thử nghĩ trường hợp xấu nhất: nếu lấy được toàn bi xanh thì sao?', explain: why };
    }
  };
  const ORDER = [['cao hơn', 'thấp nhất', 'cao nhất', 'từ cao đến thấp'], ['nặng hơn', 'nhẹ nhất', 'nặng nhất', 'từ nặng đến nhẹ'],
    ['chạy nhanh hơn', 'chạy chậm nhất', 'chạy nhanh nhất', 'từ nhanh đến chậm']];
  A.logicOrder = () => {
    const [x, y, z] = U.sample(NAMES, 3), [rel, low, high, dir] = pick(ORDER), askLow = chance(0.5);
    const facts = shuffle([`${x} ${rel} ${y}.`, `${y} ${rel} ${z}.`]).join(' ');
    return { type: 'choice', skill: 'nc.logic', prompt: `${facts} Hỏi bạn nào ${askLow ? low : high}?`, options: shuffle([x, y, z]), answer: askLow ? z : x, optStyle: 'text',
      hint: 'Xếp ba bạn theo thứ tự dựa vào hai câu đã cho.', explain: `Xếp ${dir}: ${x}, ${y}, ${z}. Vậy bạn ${askLow ? low : high} là ${askLow ? z : x}.` };
  };
  const PICTO2 = [
    { title: 'Các bạn lớp 2A thích ăn quả gì?', unit: 'bạn', rows: [['🍎', 'Táo'], ['🍊', 'Cam'], ['🍌', 'Chuối']] },
    { title: 'Số con vật ở trang trại', unit: 'con', rows: [['🐔', 'Gà'], ['🦆', 'Vịt'], ['🐖', 'Lợn']] },
    { title: 'Số cây các tổ đã trồng', unit: 'cây', rows: [['🌳', 'Tổ Một'], ['🌲', 'Tổ Hai'], ['🌴', 'Tổ Ba']] },
  ];
  A.pictoSum = () => {
    const p = pick(PICTO2);
    let rows;
    do { rows = p.rows.map(([icon, label]) => ({ icon, label, n: rand(2, 8) })); } while (new Set(rows.map((r) => r.n)).size < 3);
    const visual = { kind: 'picto', title: p.title, note: `Mỗi hình là 1 ${p.unit}`, rows };
    const tot = rows.reduce((s, r) => s + r.n, 0);
    if (chance(0.5)) {
      return { type: 'input', skill: 'nc.thongke', prompt: `Xem biểu đồ tranh. Cả ba hàng có tất cả bao nhiêu ${p.unit}?`, visual, big: '?', answer: tot,
        hint: 'Đếm số hình ở từng hàng rồi cộng lại.', explain: `${rows.map((r) => r.n).join(' + ')} = ${tot} (${p.unit}).` };
    }
    const [x, y, z] = shuffle(rows);
    const two = x.n + y.n;
    if (two === z.n) return A.pictoSum();
    const more = two > z.n;
    return { type: 'input', skill: 'nc.thongke', prompt: `Xem biểu đồ tranh. Hàng ${x.label} và hàng ${y.label} gộp lại ${more ? 'nhiều' : 'ít'} hơn hàng ${z.label} bao nhiêu ${p.unit}?`,
      visual, big: '?', answer: Math.abs(two - z.n), hint: `Cộng số ${p.unit} của hai hàng trước, rồi so sánh với hàng còn lại.`,
      explain: `${x.label} và ${y.label}: ${x.n} + ${y.n} = ${two} (${p.unit}).\n${more ? `${two} − ${z.n}` : `${z.n} − ${two}`} = ${Math.abs(two - z.n)} (${p.unit}).` };
  };

  // ======================= Dạng bài giống vở bài tập (nâng cao) =======================
  // Chuỗi mũi tên có ô đầu để trống, bảng thiếu số ở hàng giữa, Đ/S với lỗi sai khó nhận ra, so sánh hai vế,
  // bài giải hai bước, quay kim đồng hồ, vẽ đoạn thẳng, khoanh chọn… Số liệu tạo ngẫu nhiên, không chép đề trong sách.
  const S = (a) => ({ a }); // ô trống
  const fillQ = (blocks, q) => ({ type: 'fill', fill: blocks, answer: App.QTypes.fill.collect(blocks), ...q });
  const rowsQ = (items, q) => ({ type: 'rows', items, answer: items.map((x) => x.a), ...q });
  const SUB_FILL = 'Chạm vào từng ô trống rồi bấm số.';
  const calc = (a, op, b) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);
  const UNDO = { '+': '−', '−': '+', '×': ':', ':': '×' };
  const cellText = (c) => (c != null && typeof c === 'object' ? String(c.a) : String(c));
  const lineOf = (cells) => U.plain(cells.map(cellText).join(''));
  const noCarry = (x, op, y) => (op === '+' ? (x % 10) + (y % 10) < 10 : x % 10 >= y % 10);
  // Câu Đ/S: lấy n mẫu khác nhau, có cả câu đúng lẫn câu sai. Mỗi mẫu trả về [câu, 'Đ' | 'S', câu viết đúng (khi sai)]
  const tfRows = (makers, n) => {
    for (let t = 0; t < 30; t++) {
      const rows = U.sample(makers, n).map((f) => f());
      if (new Set(rows.map((r) => r[1])).size === 2) return rows;
    }
    return U.sample(makers, n).map((f) => f());
  };
  const tfExplain = (rows) => rows.map(([t, a, fix]) => (a === 'Đ' ? `${t} → Đ` : `${t} → S${fix ? ` (đúng là: ${fix})` : ''}`)).join('\n');

  // ---------- Chuỗi tính theo mũi tên, ô đầu để trống ----------
  // kind: '20' (qua 10), '100' (không nhớ), 'nho' (có nhớ), 'nhan' (có ×, :), '1000' (thêm, bớt chục, trăm)
  function chainStep(kind, x) {
    for (let t = 0; t < 60; t++) {
      const plus = chance(0.5);
      if (kind === '20') {
        const b = rand(2, 9);
        if (plus ? x + b <= 20 : x - b >= 1) return [plus ? '+' : '−', b];
      } else if (kind === '100' || kind === 'nho') {
        const b = chance(0.5) ? rand(2, 9) : rand(11, 49);
        if (noCarry(x, plus ? '+' : '−', b) === (kind === 'nho')) continue;
        if (plus ? x + b <= (kind === 'nho' ? 100 : 99) : b < x) return [plus ? '+' : '−', b];
      } else if (kind === 'nhan') {
        const r = Math.random(), k = pick([2, 5]);
        if (r < 0.3) { if (x <= 10) return ['×', k]; continue; }
        if (r < 0.6) { if (x % k === 0) return [':', k]; continue; }
        const b = rand(1, 9);
        if (plus ? x + b <= 50 : x - b >= 1) return [plus ? '+' : '−', b];
      } else {
        const big = chance(0.4), k = rand(1, big ? 4 : 9), b = k * (big ? 100 : 10), tens = Math.floor(x / 10) % 10;
        if (big ? (plus ? x + b <= 999 : x - b >= 100) : (plus ? tens + k <= 9 : tens >= k)) return [plus ? '+' : '−', b];
      }
    }
    return null;
  }
  const CH_START = { 20: () => rand(3, 18), 100: () => rand(15, 80), nho: () => rand(15, 80), nhan: () => rand(2, 10),
    1000: () => rand(1, 8) * 100 + rand(0, 9) * 10 + rand(0, 9) };
  A.ncChain = (kind) => () => {
    for (let t = 0; t < 300; t++) {
      const xs = [CH_START[kind]()], ops = [];
      for (let k = 0; k < 3; k++) {
        const st = chainStep(kind, xs[k]);
        if (!st) break;
        ops.push(st);
        xs.push(calc(xs[k], st[0], st[1]));
      }
      if (xs.length < 4 || new Set(xs).size < 4) continue;
      if (kind === '20' && !xs.some((x, i) => i && (x - 10) * (xs[i - 1] - 10) < 0)) continue; // có bước qua 10
      if (kind === 'nhan' && !ops.some(([o]) => o === '×' || o === ':')) continue;
      const known = pick([2, 3]); // chỉ biết số ở ô thứ ba hoặc ô cuối
      const items = [];
      xs.forEach((x, i) => {
        if (i) items.push({ op: ops[i - 1][0] + ops[i - 1][1] });
        items.push(i === known ? x : S(x));
      });
      const lines = [];
      for (let i = known - 1; i >= 0; i--) { const [o, b] = ops[i]; lines.push(`${xs[i + 1]} ${UNDO[o]} ${b} = ${xs[i]} (vì ${xs[i]} ${o} ${b} = ${xs[i + 1]})`); }
      for (let i = known; i < 3; i++) { const [o, b] = ops[i]; lines.push(`${xs[i]} ${o} ${b} = ${xs[i + 1]}`); }
      return fillQ([{ kind: 'chain', items }], {
        skill: kind === 'nhan' ? 'nc.nhanchia' : 'nc.timso', prompt: 'Số?', sub: 'Ô đầu tiên để trống: tính ngược từ số đã biết, rồi tính tiếp theo mũi tên.',
        speak: `Điền số vào các ô trống. Đã biết số ${xs[known]}. Tính ngược lại để tìm số ở ô đầu tiên.`,
        hint: 'Đi ngược mũi tên thì làm phép tính ngược lại: “+” thành “−”, “−” thành “+”' + (kind === 'nhan' ? ', “×” thành “:”, “:” thành “×”.' : '.'),
        explain: lines.join('\n') });
    }
    return A.missing100();
  };

  // ---------- Bảng thiếu số ở hàng giữa (số hạng, số trừ, thừa số) ----------
  const TBL = { '+': ['Số hạng', 'Số hạng', 'Tổng'], '−': ['Số bị trừ', 'Số trừ', 'Hiệu'], '×': ['Thừa số', 'Thừa số', 'Tích'] };
  const TBL_HINT = {
    '+': 'Tìm số hạng: lấy tổng trừ đi số hạng kia.',
    '−': 'Tìm số trừ: lấy số bị trừ trừ đi hiệu. Tìm số bị trừ: lấy hiệu cộng với số trừ.',
    '×': 'Nhớ lại bảng nhân 2, bảng nhân 5: thừa số nào nhân với thừa số kia thì được tích?',
  };
  function famPair(kind, op) {
    if (kind === '20') return pick(op === '+' ? ADD20 : SUB20);
    if (kind === '100') return op === '+' ? plainAdd() : plainSub();
    if (kind === 'nho') return op === '+' ? carryAdd() : borrowSub();
    if (kind === 'nhan') return [pick([2, 5]), rand(2, 10)];
    const [a, b] = pairAdd1000();
    return op === '+' ? [a, b] : [a + b, b];
  }
  A.ncTable = (kind) => () => {
    const op = kind === 'nhan' ? '×' : pick(['+', '−']), L = TBL[op];
    const rows = [[L[0]], [L[1]], [L[2]]], facts = [], seen = new Set();
    for (let t = 0; facts.length < 4 && t < 200; t++) {
      const [a, b] = famPair(kind, op), r = calc(a, op, b);
      if (seen.has(`${a}${op}${b}`)) continue;
      seen.add(`${a}${op}${b}`);
      const hide = facts.length < 2 ? 1 : pick([1, 0, 2]); // hai cột đầu: thiếu số ở hàng giữa
      [a, b, r].forEach((v, k) => rows[k].push(k === hide ? S(v) : v));
      facts.push(`${a} ${op} ${b} = ${r}`);
    }
    return fillQ([{ kind: 'table', rows }], {
      skill: kind === 'nhan' ? 'nc.nhanchia' : 'nc.timso', prompt: 'Số?', sub: 'Điền số còn thiếu vào bảng (có ô ở hàng giữa, có ô ở hàng trên).',
      speak: `Điền số còn thiếu vào bảng: ${L.join(', ')}.`, hint: TBL_HINT[op], explain: facts.join('\n') });
  };

  // ---------- Đ, S? – phép tính hai dấu (lỗi tính từ phải sang trái, sai hàng chục) ----------
  function expr3(kind) {
    for (;;) {
      const o1 = pick(['+', '−']), o2 = pick(['+', '−']);
      const a = kind === '20' ? rand(5, 18) : rand(3, 9) * 10 + rand(0, 9);
      const b = kind === '20' ? rand(2, 9) : chance(0.5) ? rand(1, 5) * 10 : rand(11, 45);
      const c = kind === '20' ? rand(2, 9) : chance(0.5) ? rand(1, 4) * 10 : rand(2, 9);
      const m = calc(a, o1, b), r = calc(m, o2, c), lim = kind === '20' ? 20 : 99;
      if (m < 0 || m > lim || r < 0 || r > lim || (o1 === '+' && o2 === '+')) continue;
      if (kind !== '20' && (!noCarry(a, o1, b) || !noCarry(m, o2, c))) continue;
      if (kind === '20' && !((a - 10) * (m - 10) < 0 || (m - 10) * (r - 10) < 0)) continue; // có bước qua 10
      return { a, o1, b, o2, c, m, r };
    }
  }
  function expr3Wrong(e, kind) {
    const c = [];
    // tính phép sau trước (từ phải sang trái)
    if (e.o1 === '−' && (e.o2 === '+' || e.b >= e.c)) { const w = e.a - calc(e.b, e.o2, e.c); c.push(w, w, w); }
    if (kind === '20') c.push(e.r + 1, e.r - 1, e.r + 2); else c.push(e.r + 10, e.r - 10, e.r + 1);
    return pick(c.filter((x) => Number.isInteger(x) && x >= 0 && x !== e.r));
  }
  A.ncTFExpr = (kind) => () => {
    const items = [], lines = [];
    const wrong = new Set(U.sample([0, 1, 2, 3], rand(1, 2)));
    for (let i = 0; i < 4; i++) {
      const e = expr3(kind);
      const shown = wrong.has(i) ? expr3Wrong(e, kind) : e.r;
      items.push({ t: `${e.a} ${e.o1} ${e.b} ${e.o2} ${e.c} = ${shown}`, a: shown === e.r ? 'Đ' : 'S' });
      lines.push(`${e.a} ${e.o1} ${e.b} = ${e.m}; ${e.m} ${e.o2} ${e.c} = ${e.r}` + (shown === e.r ? ' → Đ' : ` → S (đã viết ${shown})`));
    }
    return rowsQ(items, { skill: 'nc.timloi', prompt: 'Đ, S?', sub: 'Tính lần lượt từ trái sang phải rồi kiểm tra kết quả đã viết.',
      speak: 'Tính lần lượt từ trái sang phải, rồi chọn đúng hoặc sai cho mỗi phép tính.',
      hint: 'Phải tính lần lượt từ trái sang phải. Ví dụ: 50 − 20 + 10 = 30 + 10 = 40 (không tính 20 + 10 trước).', explain: lines.join('\n') });
  };

  // ---------- Đ, S? – phép đặt tính có lỗi sai khó nhận ra ----------
  const digs = (n) => String(n).split('').reverse().map(Number); // hàng đơn vị đứng đầu
  const fromDigs = (ds) => ds.reduce((s, d, i) => s + d * 10 ** i, 0);
  function vWrongs(a, op, b) {
    const A1 = digs(a), B1 = digs(b), r = calc(a, op, b), out = [];
    const n = Math.max(A1.length, B1.length), dg = (X, i) => X[i] || 0;
    if (op === '+') {
      out.push({ res: fromDigs(U.range(0, n - 1).map((i) => (dg(A1, i) + dg(B1, i)) % 10)), why: 'quên nhớ 1 sang hàng bên trái' });
      if (dg(A1, 0) + dg(B1, 0) < 10) out.push({ res: r + 10, why: 'nhớ 1 khi không cần nhớ' });
    } else {
      out.push({ res: fromDigs(U.range(0, n - 1).map((i) => Math.abs(dg(A1, i) - dg(B1, i)))), why: 'lấy chữ số bé trừ ngược cho chữ số lớn' });
      const i = U.range(0, n - 1).find((k) => dg(A1, k) < dg(B1, k));
      if (i != null) out.push({ res: r + 10 ** (i + 1), why: 'quên trả 1 ở hàng bên trái' });
    }
    if (B1.length < A1.length) out.push({ res: op === '+' ? a + b * 10 : a - b * 10, shift: 1, why: 'viết lệch cột' });
    return out.filter((x) => x.res !== r && x.res >= 0 && x.res <= 999);
  }
  function vPair(kind) {
    const op = pick(['+', '−']);
    for (;;) {
      if (kind === 'nho') {
        const one = chance(0.4), a = one ? rand(11, 98) : rand(11, 89), b = one ? rand(2, 9) : rand(11, 89);
        if (op === '+' ? a + b > 100 || noCarry(a, '+', b) : b >= a || noCarry(a, '−', b)) continue;
        return { a, op, b, r: calc(a, op, b) };
      }
      const a = rand(120, 899), b = chance(0.5) ? rand(12, 98) : rand(105, 799);
      if (op === '+' ? a + b > 999 : b >= a) continue;
      const carries = U.range(0, 1).filter((i) => (op === '+' ? (digs(a)[i] || 0) + (digs(b)[i] || 0) >= 10 : (digs(a)[i] || 0) < (digs(b)[i] || 0))).length;
      if (carries !== 1) continue;
      return { a, op, b, r: calc(a, op, b) };
    }
  }
  A.ncTFV = (kind) => () => {
    for (let t = 0; t < 30; t++) {
      const fs = [], seen = new Set();
      while (fs.length < 4) { const f = vPair(kind); if (!seen.has(f.a + f.op + f.b)) { seen.add(f.a + f.op + f.b); fs.push(f); } }
      const wrong = new Set(U.sample([0, 1, 2, 3], rand(2, 3)));
      const rows = fs.map((f, i) => {
        const v = { a: f.a, b: f.b, op: f.op, res: f.r };
        const w = wrong.has(i) ? pick(vWrongs(f.a, f.op, f.b)) : null;
        if (w) { v.res = w.res; if (w.shift) v.shift = 1; }
        return { f, v, why: w ? w.why : '', a: w ? 'S' : 'Đ' };
      });
      if (new Set(rows.map((x) => x.a)).size < 2) continue;
      return rowsQ(rows.map(({ v, a }) => ({ vcalc: v, a })), { skill: 'nc.timloi', prompt: 'Đ, S?',
        sub: 'Kiểm tra thật kĩ từng phép đặt tính: đúng chọn Đ, sai chọn S.', speak: 'Kiểm tra thật kĩ từng phép đặt tính. Đúng chọn Đ, sai chọn S.',
        hint: 'Kiểm tra: các chữ số đã thẳng cột chưa? Có nhớ 1 (khi cộng) hoặc trả 1 (khi trừ) chưa? Có lấy chữ số dưới trừ ngược chữ số trên không?',
        explain: rows.map((x) => `${x.f.a} ${x.f.op} ${x.f.b} = ${x.f.r}` + (x.a === 'S' ? ` (bài sai: ${x.why})` : '')).join('\n') });
    }
    return A.ncTFExpr('100')();
  };

  // ---------- Đ, S? – hiểu biết về số (có bẫy) ----------
  const NUM2 = [
    () => { const n = rand(1, 8) * 10 + 9; return chance(0.5) ? [`Số liền sau của ${n} là ${n + 1}.`, 'Đ'] : [`Số liền sau của ${n} là ${n - 1}.`, 'S', `số liền sau của ${n} là ${n + 1}`]; },
    () => { const n = rand(2, 9) * 10; return chance(0.5) ? [`Số liền trước của ${n} là ${n - 1}.`, 'Đ'] : [`Số liền trước của ${n} là ${n - 10}.`, 'S', `số liền trước của ${n} là ${n - 1}`]; },
    () => { let t, u; do { t = rand(1, 9); u = rand(1, 9); } while (t === u); const n = t * 10 + u;
      return chance(0.5) ? [`Số ${n} gồm ${t} chục và ${u} đơn vị.`, 'Đ'] : [`Số ${n} gồm ${u} chục và ${t} đơn vị.`, 'S', `${n} gồm ${t} chục và ${u} đơn vị`]; },
    () => { const [a, b] = plainSub(); return chance(0.5) ? [`${b} kém ${a} là ${a - b} đơn vị.`, 'Đ'] : [`${a} kém ${b} là ${a - b} đơn vị.`, 'S', `${a} hơn ${b} là ${a - b} đơn vị`]; },
    () => { const [a, b] = plainAdd(); return chance(0.5) ? [`Tổng của ${a} và ${b} là ${a + b}.`, 'Đ'] : [`Tổng của ${a + b} và ${b} là ${a}.`, 'S', `hiệu của ${a + b} và ${b} là ${a}`]; },
    () => pick([['Số bé nhất có hai chữ số là 10.', 'Đ'], ['Số bé nhất có hai chữ số là 11.', 'S', 'số bé nhất có hai chữ số là 10'],
      ['Số lớn nhất có hai chữ số khác nhau là 99.', 'S', 'đó là số 98'], ['Số lớn nhất có hai chữ số khác nhau là 98.', 'Đ'],
      ['Số tròn chục lớn nhất có hai chữ số là 90.', 'Đ'], ['Có 9 số tròn chục có hai chữ số.', 'Đ'], ['Số 100 là số có hai chữ số.', 'S', '100 là số có ba chữ số']]),
  ];
  const NUM3 = [
    () => { const h = rand(1, 9), t = rand(0, 9), u = rand(1, 9), n = h * 100 + t * 10 + u;
      return t !== u && chance(0.5) ? [`Số ${n} gồm ${h} trăm, ${u} chục và ${t} đơn vị.`, 'S', `${n} gồm ${h} trăm, ${t} chục và ${u} đơn vị`]
        : [`Số ${n} gồm ${h} trăm, ${t} chục và ${u} đơn vị.`, 'Đ']; },
    () => { const h = rand(1, 9), t = rand(1, 9), u = rand(0, 9), n = h * 100 + t * 10 + u, ok = chance(0.5) || t === u || u === 0;
      return ok ? [`${n} = ${h * 100} + ${t * 10}${u ? ` + ${u}` : ''}`, 'Đ'] : [`${n} = ${h * 100} + ${u * 10} + ${t}`, 'S', `${n} = ${h * 100} + ${t * 10} + ${u}`]; },
    () => { const h = rand(2, 9); return chance(0.5) ? [`Số liền trước của ${h}00 là ${h - 1}99.`, 'Đ'] : [`Số liền trước của ${h}00 là ${h}99.`, 'S', `số liền trước của ${h}00 là ${h - 1}99`]; },
    () => { let h, t, u; do { h = rand(1, 9); t = rand(1, 9); u = rand(1, 9); } while (t === u); const n = h * 100 + t * 10 + u, m = h * 100 + u * 10 + t;
      return chance(0.5) ? [`Số ${n} đọc là “${U.readNumber(n)}”.`, 'Đ'] : [`Số ${n} đọc là “${U.readNumber(m)}”.`, 'S', `${n} đọc là “${U.readNumber(n)}”`]; },
    () => { let h, t, u; do { h = rand(1, 9); t = rand(0, 9); u = rand(0, 9); } while (t === u); const n = h * 100 + t * 10 + u, m = h * 100 + u * 10 + t, s = sign(n, m);
      const show = chance(0.5) ? s : s === '>' ? '<' : '>';
      return [`${n} ${show} ${m}`, show === s ? 'Đ' : 'S', `${n} ${s} ${m}`]; },
    () => pick([['Số lớn nhất có ba chữ số là 999.', 'Đ'], ['Số bé nhất có ba chữ số là 101.', 'S', 'đó là số 100'], ['Số bé nhất có ba chữ số khác nhau là 123.', 'S', 'đó là số 102'],
      ['Số lớn nhất có ba chữ số khác nhau là 987.', 'Đ'], ['Số 1000 là số có ba chữ số.', 'S', '1000 là số có bốn chữ số'], ['10 trăm bằng 1 nghìn.', 'Đ'],
      ['1 trăm bằng 10 đơn vị.', 'S', '1 trăm bằng 10 chục, bằng 100 đơn vị'], ['Số tròn trăm lớn nhất có ba chữ số là 900.', 'Đ']]),
  ];
  A.ncTFNum = (d) => () => {
    const rows = tfRows(d === 3 ? NUM3 : NUM2, 4);
    return rowsQ(rows.map(([t, a]) => ({ t, a })), { skill: 'nc.so', prompt: 'Đ, S?', sub: 'Đọc kĩ từng câu: đúng chọn Đ, sai chọn S.',
      hint: d === 3 ? 'Đọc kĩ hàng trăm, hàng chục, hàng đơn vị của mỗi số.' : 'Đọc kĩ từng chữ: liền trước – liền sau, hơn – kém, chục – đơn vị.',
      explain: tfExplain(rows) });
  };

  // ---------- >, <, = ? – so sánh hai vế (nhiều dòng) ----------
  function cmpSide(kind, near) {
    if (kind === '20') {
      const add = chance(0.5), [a, b] = pick(add ? ADD20 : SUB20);
      return [`${a} ${add ? '+' : '−'} ${b}`, add ? a + b : a - b];
    }
    if (kind === 'nhan') {
      const t = pick([2, 5]), k = rand(1, 10);
      return chance(0.6) ? [`${t} × ${k}`, t * k] : [`${t * k} : ${t}`, k];
    }
    if (kind === 'kgl') {
      const add = chance(0.5), [a, b] = pick(add ? ADD20 : SUB20), u = near.u;
      return [`${a} {${u}} ${add ? '+' : '−'} ${b} {${u}}`, add ? a + b : a - b];
    }
    // len: viết độ dài theo nhiều cách (đổi ra xăng-ti-mét để so sánh)
    const v = near.v + (near.side ? pick([-2, -1, 0, 0, 1, 2]) * (near.big ? 10 : 1) : 0);
    const forms = [];
    if (v % 10 === 0 && v >= 10 && v <= 90) forms.push(`${v / 10} {dm}`);
    if (v % 10 && v > 10 && v < 100) forms.push(`${Math.floor(v / 10)} {dm} ${v % 10} {cm}`);
    if (v === 100) forms.push('1 {m}');
    if (v > 20 && v <= 100) { const a = rand(1, Math.floor(v / 10) - 1) * 10; forms.push(`${a} {cm} + ${v - a} {cm}`); }
    // vế trái viết bằng dm, m hoặc tổng; vế phải thường viết bằng xăng-ti-mét để bé phải đổi đơn vị
    if (!forms.length || (near.side && chance(0.6))) return [`${v} {cm}`, v];
    return [pick(forms), v];
  }
  A.ncCmpRows = (kind) => () => {
    for (let t = 0; t < 50; t++) {
      const items = [], lines = [];
      for (let i = 0; i < 4; i++) {
        let L, R;
        for (let k = 0; k < 100; k++) {
          const near = { u: pick(['kg', 'l']), v: pick([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, rand(11, 99)]), big: false, side: false };
          near.big = near.v % 10 === 0 && chance(0.4);
          L = cmpSide(kind, near);
          R = cmpSide(kind, { ...near, side: true });
          if (kind !== 'len' && Math.abs(L[1] - R[1]) > (kind === 'nhan' ? 3 : 2)) continue;
          if (L[0] === R[0] || items.some((x) => x.t.startsWith(L[0]))) continue;
          if (kind === 'len' && (R[1] <= 0 || R[1] > 100 || L[0] === `${L[1]} {cm}`)) continue;
          break;
        }
        const s = sign(L[1], R[1]), unit = kind === 'kgl' ? ' ' + (L[0].match(/\{(\w+)\}/) || ['', ''])[1] : kind === 'len' ? ' cm' : '';
        items.push({ t: `${L[0]}  …  ${R[0]}`, a: s });
        lines.push(`${U.plain(L[0])} = ${L[1]}${unit}, ${U.plain(R[0])} = ${R[1]}${unit} → ${s}`);
      }
      if (new Set(items.map((x) => x.a)).size < 2) continue;
      return rowsQ(items, { opts: ['>', '<', '='], skill: kind === '20' ? 'nc.dau' : kind === 'nhan' ? 'nc.nhanchia' : 'nc.doluong',
        prompt: '>, <, = ?', sub: kind === 'len' ? 'Đổi hai bên ra xăng-ti-mét rồi so sánh.' : 'Tính kết quả từng bên rồi so sánh.',
        speak: 'Chọn dấu lớn hơn, bé hơn hoặc bằng cho mỗi dòng.',
        hint: kind === 'len' ? '1 dm = 10 cm, 1 m = 100 cm. Ví dụ: 3 dm 5 cm = 35 cm.' : 'Tính kết quả của cả hai bên trước, rồi mới so sánh.',
        explain: lines.join('\n') });
    }
    return A.compareAdd20();
  };

  // ---------- Bài giải hai bước ----------
  // s1, s2: [câu lời giải, số thứ nhất, dấu, số thứ hai, kết quả]; f1, f2: hai câu lời giải nhiễu của mỗi bước
  const solve2 = ({ skill = 'nc.loivan', prompt, hint, s1, s2, f1, f2, cls, ans, units, ops = ['+', '−'] }) => {
    const step = ([line, a, op, b, res], fakes) => ({ line, a, op, b, res, cls, lines: [line, ...fakes] });
    const explain = [s1, s2].map(([l, a, op, b, r]) => `${l}:\n${a} ${op} ${b} = ${r} (${cls})`).join('\n') + `\nĐáp số: ${s2[4]} ${ans}.`;
    return { type: 'solve', skill, prompt, speak: sayUnits(prompt), sub: 'Bài toán hai bước: giải lần lượt từng bước như trong vở.', hint,
      solve: { steps: [step(s1, f1), step(s2, f2)], ans, units: units.slice(0, 3), ops }, answer: s2[4], explain };
  };
  const otherNouns = (noun) => U.sample(ITEMS.map((x) => x.noun).filter((x) => x !== noun), 2);
  A.ncSolve = (kind) => () => {
    if (kind === '100' || kind === 'nho') {
      for (;;) {
        const carry = kind === 'nho', a = carry ? rand(25, 60) : rand(11, 48), d = carry ? rand(11, 29) : rand(2, 30), more = chance(0.6);
        const b = more ? a + d : a - d;
        if (b < 5 || b > 99 || a + b > 99) continue;
        if (!carry && (!noCarry(a, more ? '+' : '−', d) || !noCarry(a, '+', b))) continue;
        if (carry && noCarry(a, more ? '+' : '−', d) && noCarry(a, '+', b)) continue;
        const [n1, n2] = twoNames(), it = pick(ITEMS), w = more ? 'nhiều' : 'ít';
        return solve2({ prompt: `${n1} có ${a} ${it.noun}, ${n2} có ${w} hơn ${n1} ${d} ${it.noun}. Hỏi cả hai bạn có tất cả bao nhiêu ${it.noun}?`,
          hint: `Bước 1: tìm số ${it.noun} của ${n2} (${w} hơn thì ${more ? 'cộng' : 'trừ'}). Bước 2: tính số ${it.noun} của cả hai bạn.`,
          s1: [`Số ${it.noun} của ${n2} là`, a, more ? '+' : '−', d, b], f1: [`Cả hai bạn có số ${it.noun} là`, `Số ${it.noun} của ${n1} là`],
          s2: [`Cả hai bạn có số ${it.noun} là`, a, '+', b, a + b], f2: [`Số ${it.noun} của ${n2} là`, `${n2} có ${w} hơn ${n1} số ${it.noun} là`],
          cls: it.cls, ans: it.noun, units: [it.noun, ...otherNouns(it.noun)] });
      }
    }
    if (kind === '20') {
      if (chance(0.5)) {
        for (;;) {
          const a = rand(11, 18), b = rand(3, 9), c = rand(2, 9), m = a - b, r = m + c;
          if (m >= 10 || r > 20 || r <= 10) continue;
          return solve2({ prompt: `Trên cành cây có ${a} con chim đậu. Có ${b} con bay đi, sau đó có ${c} con khác bay đến. Hỏi lúc này trên cành có bao nhiêu con chim?`,
            hint: 'Bước 1: tính số chim còn lại sau khi bay đi (trừ). Bước 2: thêm số chim bay đến (cộng).',
            s1: ['Sau khi bay đi, trên cành còn lại số con chim là', a, '−', b, m], f1: ['Lúc này trên cành có số con chim là', 'Có số con chim bay đến là'],
            s2: ['Lúc này trên cành có số con chim là', m, '+', c, r], f2: ['Sau khi bay đi, trên cành còn lại số con chim là', 'Lúc đầu trên cành có số con chim là'],
            cls: 'con', ans: 'con chim', units: ['con chim', 'cành cây', 'quả'] });
        }
      }
      for (;;) {
        const em = rand(5, 9), hon = rand(2, 6), anh = em + hon, k = rand(2, 5), later = chance(0.6), q = later ? anh + k : anh - k;
        if (q > 20 || anh > 18 || (anh <= 10 && q <= 10)) continue;
        const when = `${k} năm ${later ? 'nữa' : 'trước'}`;
        return solve2({ prompt: `Năm nay em ${em} tuổi, anh hơn em ${hon} tuổi. Hỏi ${when} anh bao nhiêu tuổi?`,
          hint: `Bước 1: tìm tuổi anh năm nay. Bước 2: ${later ? 'mỗi năm trôi qua, anh thêm 1 tuổi' : 'lùi lại mỗi năm, anh bớt 1 tuổi'}.`,
          s1: ['Năm nay anh có số tuổi là', em, '+', hon, anh], f1: [`${cap(when)} anh có số tuổi là`, 'Năm nay em có số tuổi là'],
          s2: [`${cap(when)} anh có số tuổi là`, anh, later ? '+' : '−', k, q], f2: ['Năm nay anh có số tuổi là', `${cap(when)} em có số tuổi là`],
          cls: 'tuổi', ans: 'tuổi', units: ['tuổi', 'năm', 'ngày'] });
      }
    }
    if (kind === 'kgl') {
      if (chance(0.5)) {
        const [big, small, rB, rD] = pick(KG2);
        for (;;) {
          const a = rand(...rB), d = rand(...rD), b = a - d, tot = a + b;
          if (tot > 20 || b < 1) continue;
          return solve2({ prompt: `${cap(big)} nặng ${a} kg, ${small} nhẹ hơn ${big} ${d} kg. Hỏi cả hai nặng bao nhiêu ki-lô-gam?`,
            hint: `Bước 1: tìm cân nặng của ${small} (nhẹ hơn thì trừ). Bước 2: tính cả hai.`,
            s1: [`${cap(small)} nặng là`, a, '−', d, b], f1: ['Cả hai nặng là', `${cap(big)} nặng là`],
            s2: ['Cả hai nặng là', a, '+', b, tot], f2: [`${cap(small)} nặng là`, `${cap(big)} nặng hơn ${small} là`],
            cls: 'kg', ans: 'kg', units: ['kg', 'l', 'quả'] });
        }
      }
      for (;;) {
        const a = rand(2, 7), b = rand(2, 7), cp = rand(a + b + 2, 19);
        if (cp > 20) continue;
        return solve2({ prompt: `Bình thứ nhất có ${a} l nước, bình thứ hai có ${b} l nước. Đổ cả hai bình vào một cái xô chứa được ${cp} l. Hỏi phải đổ thêm bao nhiêu lít nữa thì đầy xô?`,
          hint: 'Bước 1: tính số nước đã đổ vào xô. Bước 2: lấy số nước xô chứa được trừ đi số nước đã có.',
          s1: ['Đã đổ vào xô số lít nước là', a, '+', b, a + b], f1: ['Cần đổ thêm số lít nước là', 'Cái xô chứa được số lít nước là'],
          s2: ['Cần đổ thêm số lít nước là', cp, '−', a + b, cp - a - b], f2: ['Đã đổ vào xô số lít nước là', 'Bình thứ nhất có số lít nước là'],
          cls: 'l', ans: 'l', units: ['l', 'kg', 'cái xô'] });
      }
    }
    if (kind === 'nhan') {
      const v = rand(0, 3), ops = ['+', '−', '×', ':'];
      if (v === 0) {
        const k = rand(3, 8), have = 5 * k, eat = rand(2, have - 2);
        return solve2({ prompt: `Mỗi hộp có 5 cái bánh. Mẹ mua ${k} hộp, cả nhà đã ăn ${eat} cái bánh. Hỏi còn lại bao nhiêu cái bánh?`, ops,
          hint: 'Bước 1: tính số bánh mẹ mua (5 được lấy mấy lần?). Bước 2: tính số bánh còn lại.',
          s1: ['Mẹ mua tất cả số cái bánh là', 5, '×', k, have], f1: ['Còn lại số cái bánh là', 'Cả nhà đã ăn số cái bánh là'],
          s2: ['Còn lại số cái bánh là', have, '−', eat, have - eat], f2: ['Mẹ mua tất cả số cái bánh là', 'Mỗi hộp có số cái bánh là'],
          cls: 'cái', ans: 'cái bánh', units: ['cái bánh', 'hộp', 'người'] });
      }
      if (v === 1) {
        const k = rand(3, 9), need = 2 * k, total = need + rand(1, 15);
        return solve2({ prompt: `Cô giáo có ${total} quyển vở. Cô thưởng cho ${k} bạn, mỗi bạn 2 quyển. Hỏi cô còn lại bao nhiêu quyển vở?`, ops,
          hint: 'Bước 1: tính số vở cô đã thưởng (2 được lấy mấy lần?). Bước 2: tính số vở còn lại.',
          s1: ['Cô đã thưởng số quyển vở là', 2, '×', k, need], f1: ['Cô còn lại số quyển vở là', 'Có số bạn được thưởng là'],
          s2: ['Cô còn lại số quyển vở là', total, '−', need, total - need], f2: ['Cô đã thưởng số quyển vở là', 'Lúc đầu cô có số quyển vở là'],
          cls: 'quyển', ans: 'quyển vở', units: ['quyển vở', 'bạn', 'cái'] });
      }
      if (v === 2) {
        const p = pick([2, 5]), q = rand(3, 10), total = p * q, eat = rand(1, q - 1);
        return solve2({ prompt: `Có ${total} cái kẹo chia đều cho ${p} bạn. Mỗi bạn ăn ${eat} cái. Hỏi mỗi bạn còn lại mấy cái kẹo?`, ops,
          hint: 'Bước 1: tìm số kẹo mỗi bạn được chia (chia đều). Bước 2: trừ đi số kẹo mỗi bạn đã ăn.',
          s1: ['Mỗi bạn được chia số cái kẹo là', total, ':', p, q], f1: ['Mỗi bạn còn lại số cái kẹo là', 'Có tất cả số cái kẹo là'],
          s2: ['Mỗi bạn còn lại số cái kẹo là', q, '−', eat, q - eat], f2: ['Mỗi bạn được chia số cái kẹo là', 'Các bạn đã ăn số cái kẹo là'],
          cls: 'cái', ans: 'cái kẹo', units: ['cái kẹo', 'bạn', 'hộp'] });
      }
      let g, d;
      do { g = rand(2, 6); d = rand(2, 6); } while (g + d > 10);
      return solve2({ prompt: `Trong sân có ${g} con gà và ${d} con vịt. Hỏi có tất cả bao nhiêu cái chân?`, ops,
        hint: 'Bước 1: tính số con gà và vịt. Bước 2: mỗi con có 2 chân, 2 được lấy mấy lần?',
        s1: ['Có tất cả số con gà và vịt là', g, '+', d, g + d], f1: ['Có tất cả số cái chân là', 'Số con gà nhiều hơn số con vịt là'],
        s2: ['Có tất cả số cái chân là', 2, '×', g + d, 2 * (g + d)], f2: ['Có tất cả số con gà và vịt là', 'Mỗi con có số cái chân là'],
        cls: 'cái chân', ans: 'cái chân', units: ['cái chân', 'con', 'con gà'] });
    }
    if (kind === 'doDai') {
      if (chance(0.5)) {
        const [x, y] = pick(SHOP);
        let p, q;
        do { p = rand(1, 5) * 100; q = rand(1, 5) * 100; } while (p + q >= 1000);
        return solve2({ prompt: `Mẹ có 1000 đồng. Mẹ mua ${x} hết ${p} đồng và ${y} hết ${q} đồng. Hỏi mẹ còn lại bao nhiêu tiền?`,
          hint: 'Bước 1: tính số tiền mẹ đã mua hết. Bước 2: lấy 1000 đồng trừ đi số tiền đó.',
          s1: ['Mẹ đã mua hết số tiền là', p, '+', q, p + q], f1: ['Mẹ còn lại số tiền là', 'Mẹ có số tiền là'],
          s2: ['Mẹ còn lại số tiền là', 1000, '−', p + q, 1000 - p - q], f2: ['Mẹ đã mua hết số tiền là', 'Mẹ mua hai thứ hết số tiền là'],
          cls: 'đồng', ans: 'đồng', units: ['đồng', 'cái', 'quyển'] });
      }
      let a, b;
      do { a = rand(1, 4) * 10 + rand(0, 9); b = rand(1, 4) * 10 + rand(0, 9); } while (a + b >= 95 || !noCarry(a, '+', b));
      return solve2({ prompt: `Sợi dây dài 1 m. Bố cắt lần thứ nhất ${a} cm, lần thứ hai ${b} cm. Hỏi sợi dây còn lại dài bao nhiêu xăng-ti-mét?`,
        hint: 'Bước 1: tính cả hai lần bố đã cắt đi. Bước 2: đổi 1 m = 100 cm rồi trừ.',
        s1: ['Bố đã cắt đi số xăng-ti-mét là', a, '+', b, a + b], f1: ['Sợi dây còn lại dài là', 'Lần thứ hai bố cắt dài hơn lần thứ nhất là'],
        s2: ['Sợi dây còn lại dài là', 100, '−', a + b, 100 - a - b], f2: ['Bố đã cắt đi số xăng-ti-mét là', 'Sợi dây lúc đầu dài là'],
        cls: 'cm', ans: 'cm', units: ['cm', 'dm', 'm'] });
    }
    // 1000
    if (chance(0.5)) {
      for (;;) {
        const a = rand(25, 60) * 10, d = rand(2, 15) * 10, more = chance(0.5), b = more ? a + d : a - d;
        if (b < 100 || a + b > 999) continue;
        const w = more ? 'nhiều' : 'ít';
        return solve2({ prompt: `Trường em có ${a} học sinh nam, số học sinh nữ ${w} hơn số học sinh nam ${d} em. Hỏi trường em có tất cả bao nhiêu học sinh?`,
          hint: 'Bước 1: tìm số học sinh nữ. Bước 2: tính số học sinh cả trường.',
          s1: ['Số học sinh nữ là', a, more ? '+' : '−', d, b], f1: ['Trường em có tất cả số học sinh là', 'Số học sinh nam là'],
          s2: ['Trường em có tất cả số học sinh là', a, '+', b, a + b], f2: ['Số học sinh nữ là', `Số học sinh nữ ${w} hơn số học sinh nam là`],
          cls: 'học sinh', ans: 'học sinh', units: ['học sinh', 'lớp', 'trường'] });
      }
    }
    for (;;) {
      const tot = rand(40, 90) * 10, s = rand(10, 30) * 10, c = rand(10, 30) * 10;
      if (s + c >= tot) continue;
      return solve2({ prompt: `Cửa hàng có ${tot} kg gạo. Buổi sáng bán được ${s} kg, buổi chiều bán được ${c} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`,
        hint: 'Bước 1: tính số gạo cả ngày đã bán. Bước 2: tính số gạo còn lại.',
        s1: ['Cả ngày cửa hàng bán được số ki-lô-gam gạo là', s, '+', c, s + c], f1: ['Cửa hàng còn lại số ki-lô-gam gạo là', 'Buổi chiều bán nhiều hơn buổi sáng là'],
        s2: ['Cửa hàng còn lại số ki-lô-gam gạo là', tot, '−', s + c, tot - s - c], f2: ['Cả ngày cửa hàng bán được số ki-lô-gam gạo là', 'Lúc đầu cửa hàng có số ki-lô-gam gạo là'],
        cls: 'kg', ans: 'kg gạo', units: ['kg gạo', 'l', 'bao'] });
    }
  };

  // ---------- Khoanh vào các số có tổng bằng … (nhiều cách đúng) ----------
  A.ncSumPick = () => {
    for (;;) {
      const vs = U.sample(U.range(2, 9), 6), idx = U.sample(U.range(0, 5), rand(2, 3)), T = idx.reduce((s, i) => s + vs[i], 0);
      if (T <= 10 || T > 20 || vs.includes(T)) continue;
      const items = vs.map((v, i) => ({ t: String(v), v, ok: idx.includes(i) }));
      return { type: 'pick', mode: 'tiles', items, sum: T, answer: [`các số có tổng bằng ${T}`], answerLabel: idx.map((i) => vs[i]).join(' + ') + ` = ${T}`,
        skill: 'nc.tinh', prompt: `Khoanh vào các số có tổng bằng ${T}.`, sub: 'Chọn hai hoặc ba số, rồi bấm Kiểm tra. Có thể có nhiều cách đúng!',
        hint: `Thử cộng hai số trước. Chưa đủ ${T} thì thêm một số nữa.`, explain: `Ví dụ: ${idx.map((i) => vs[i]).join(' + ')} = ${T}.` };
    }
  };

  // ---------- Ki-lô-gam, lít: điền số, chọn quả cân ----------
  A.ncUnitFill = () => {
    const un = () => pick(['kg', 'l']);
    const makers = [
      () => { const x = un(), [a, b] = pick(ADD20); return [[S(a), ` {${x}} + ${b} {${x}} = ${a + b} {${x}}`], `${a + b} − ${b} = ${a} (${x})`]; },
      () => { const x = un(), [a, b] = pick(SUB20); return [[`${a} {${x}} − `, S(b), ` {${x}} = ${a - b} {${x}}`], `${a} − ${a - b} = ${b} (${x})`]; },
      () => { const x = un(); for (;;) { const a = rand(3, 9), b = rand(2, 9), c = rand(2, 9), m = a + b, r = m - c;
        if (m > 10 && m <= 20 && r > 0 && r < 10) return [[`${a} {${x}} + ${b} {${x}} − ${c} {${x}} = `, S(r), ` {${x}}`], `${a} + ${b} = ${m}, ${m} − ${c} = ${r} (${x})`]; } },
      () => { const x = un(); for (;;) { const [a, b] = pick(ADD20), others = ADD20.filter(([p, q]) => p + q === a + b && p !== a && p !== b);
        if (!others.length) continue; const [c, d] = pick(others);
        return [[`${c} {${x}} + `, S(d), ` {${x}} = ${a} {${x}} + ${b} {${x}}`], `${a} + ${b} = ${a + b}, ${a + b} − ${c} = ${d} (${x})`]; } },
    ];
    const got = shuffle(makers).map((f) => f());
    return fillQ([{ kind: 'list', cols: 1, items: got.map((g) => g[0]) }], {
      skill: 'nc.doluong', prompt: 'Số?', sub: SUB_FILL, hint: 'Tính như với các số, nhớ: tìm số hạng thì lấy tổng trừ số hạng kia.',
      explain: got.map((g) => g[1]).join('\n') });
  };
  A.ncWeightPick = () => {
    for (;;) {
      const ws = [rand(1, 2), rand(2, 3), rand(3, 4), 5, rand(5, 6), pick([1, 2, 10])], idx = U.sample(U.range(0, 5), rand(2, 3));
      const T = idx.reduce((s, i) => s + ws[i], 0);
      if (T < 6 || T > 20 || ws.includes(T)) continue;
      const fruit = pick(FRUITS), prompt = `${cap(fruit.name)} nặng ${T} kg. Chọn các quả cân để đặt lên đĩa bên phải cho cân thăng bằng.`;
      return { type: 'pick', mode: 'tiles', items: ws.map((w, i) => ({ t: `${w} kg`, v: w, ok: idx.includes(i) })), sum: T,
        answer: [`các quả cân nặng tất cả ${T} kg`], answerLabel: idx.map((i) => ws[i] + ' kg').join(' + ') + ` = ${T} kg`, skill: 'nc.doluong', prompt,
        speak: sayUnits(prompt), sub: 'Chạm để chọn các quả cân (chọn nhiều quả), rồi bấm Kiểm tra.',
        visual: { kind: 'balance', left: [fruit.e], right: [], tilt: -1 }, hint: `Cộng số ki-lô-gam của các quả cân em chọn: phải đúng bằng ${T} kg.`,
        explain: `Ví dụ: ${idx.map((i) => ws[i] + ' kg').join(' + ')} = ${T} kg.` };
    }
  };

  // ---------- Hình phẳng: vẽ đoạn thẳng theo độ dài tính được, đường gấp khúc ----------
  const RULER = {};
  for (let i = 0; i <= 10; i++) RULER[String(i)] = [24 + i * 28, 40];
  A.ncSeg = (unit) => () => {
    let len, prompt, why;
    const v = rand(0, 2);
    if (unit === 'dm') {
      if (v === 0) { len = 10; prompt = 'Vẽ đoạn thẳng dài 1 dm.'; why = '1 dm = 10 cm. Nối chấm 0 với chấm 10.'; }
      else { const d = rand(2, 6); len = 10 - d; prompt = v === 1 ? `Vẽ đoạn thẳng ngắn hơn 1 dm là ${d} cm.` : `Cây bút chì dài 1 dm, cục tẩy ngắn hơn bút chì ${d} cm. Vẽ đoạn thẳng dài bằng cục tẩy.`;
        why = `1 dm = 10 cm; 10 − ${d} = ${len} (cm). Nối chấm 0 với chấm ${len}.`; }
    } else if (v === 0) { const a = rand(2, 6), d = rand(1, 3); len = a + d; prompt = `Vẽ đoạn thẳng dài hơn đoạn thẳng ${a} cm là ${d} cm.`; why = `${a} + ${d} = ${len} (cm). Nối chấm 0 với chấm ${len}.`; }
    else if (v === 1) { const a = rand(6, 10), d = rand(2, a - 2); len = a - d; prompt = `Vẽ đoạn thẳng ngắn hơn đoạn thẳng ${a} cm là ${d} cm.`; why = `${a} − ${d} = ${len} (cm). Nối chấm 0 với chấm ${len}.`; }
    else { const a = rand(2, 5), b = rand(2, 10 - a); len = a + b; prompt = `Một đường gấp khúc gồm hai đoạn thẳng dài ${a} cm và ${b} cm. Vẽ một đoạn thẳng dài bằng đường gấp khúc đó.`; why = `${a} + ${b} = ${len} (cm). Nối chấm 0 với chấm ${len}.`; }
    return { type: 'connect', connect: { w: 328, h: 100, pts: RULER, mode: 'seg', len }, answer: `${len} cm`, skill: unit === 'dm' ? 'nc.doluong' : 'nc.hinh',
      prompt, speak: sayUnits(prompt), sub: 'Tính độ dài trước, rồi chạm vào hai chấm trên thước để vẽ đoạn thẳng.',
      hint: 'Tính xem đoạn thẳng dài mấy xăng-ti-mét, rồi đếm từ vạch 0.', explain: why };
  };
  // Đường gấp khúc ABCD có ghi độ dài các đoạn
  function polyFig() {
    const ls = [rand(2, 9), rand(2, 9), rand(2, 9)];
    const pts = [[30, rand(130, 160)], [rand(90, 120), rand(30, 60)], [rand(180, 210), rand(120, 160)], [290, rand(30, 70)]];
    let s = '<svg viewBox="0 0 320 190" class="geo">';
    for (let i = 0; i < 3; i++) s += seg(pts[i], pts[i + 1]);
    for (let i = 0; i < 3; i++) {
      // ghi độ dài ở giữa đoạn thẳng, lệch lên phía trên đoạn
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1);
      let nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
      if (ny > 0) { nx = -nx; ny = -ny; }
      s += lbl(`${ls[i]} cm`, (x1 + x2) / 2 + nx * 22, (y1 + y2) / 2 + ny * 22 + 5, 'geo-len');
    }
    pts.forEach((p, i) => { s += dot(p) + lbl('ABCD'[i], p[0], p[1] < 100 ? p[1] - 12 : p[1] + 26); });
    return { ls, svg: s + '</svg>' };
  }
  A.ncPolyRows = () => {
    const { ls, svg } = polyFig(), [ab, bc, cd] = ls, tot = ab + bc + cd;
    const mk = [
      () => (chance(0.5) ? ['Đường gấp khúc ABCD gồm 3 đoạn thẳng.', 'Đ'] : ['Đường gấp khúc ABCD gồm 4 đoạn thẳng.', 'S', 'gồm 3 đoạn thẳng: AB, BC, CD']),
      () => (chance(0.5) ? [`Đường gấp khúc ABCD dài ${tot} cm.`, 'Đ'] : [`Đường gấp khúc ABCD dài ${tot + pick([-2, -1, 1, 2])} cm.`, 'S', `dài ${ab} + ${bc} + ${cd} = ${tot} (cm)`]),
      () => { const v = ab + bc + (chance(0.5) ? 0 : pick([-1, 1])); return [`Đường gấp khúc ABC dài ${v} cm.`, v === ab + bc ? 'Đ' : 'S', `ABC dài ${ab} + ${bc} = ${ab + bc} (cm)`]; },
      () => { const d = Math.abs(ab - cd); return ab === cd ? ['Đoạn thẳng AB dài bằng đoạn thẳng CD.', 'Đ'] : chance(0.5)
        ? [`Đoạn thẳng ${ab > cd ? 'AB' : 'CD'} dài hơn đoạn thẳng ${ab > cd ? 'CD' : 'AB'} ${d} cm.`, 'Đ']
        : [`Đoạn thẳng ${ab > cd ? 'CD' : 'AB'} dài hơn đoạn thẳng ${ab > cd ? 'AB' : 'CD'} ${d} cm.`, 'S', `${ab > cd ? 'AB' : 'CD'} dài hơn ${ab > cd ? 'CD' : 'AB'} ${d} cm`]; },
      () => ['Ba điểm A, B, C thẳng hàng.', 'S', 'A, B, C không cùng nằm trên một đường thẳng'],
    ];
    const rows = tfRows(mk, 4);
    return rowsQ(rows.map(([t, a]) => ({ t, a })), { skill: 'nc.hinh', prompt: 'Đ, S?', sub: 'Nhìn hình vẽ, đọc từng câu: đúng chọn Đ, sai chọn S.',
      visual: { kind: 'svg', svg }, split: true, hint: 'Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng của nó.', explain: tfExplain(rows) });
  };
  A.ncPolyFill = () => {
    const { ls, svg } = polyFig(), [ab, bc, cd] = ls;
    const items = [['Đường gấp khúc ABCD dài ', S(ab + bc + cd), ' cm.'], ['Đường gấp khúc BCD dài ', S(bc + cd), ' cm.']];
    if (ab !== bc) items.push([`Đoạn thẳng ${ab > bc ? 'AB' : 'BC'} dài hơn đoạn thẳng ${ab > bc ? 'BC' : 'AB'} `, S(Math.abs(ab - bc)), ' cm.']);
    else items.push(['Đường gấp khúc ABC dài ', S(ab + bc), ' cm.']);
    return fillQ([{ kind: 'list', cols: 1, items }], { skill: 'nc.hinh', prompt: 'Số?', sub: 'Nhìn hình vẽ rồi điền số.', visual: { kind: 'svg', svg }, split: true,
      hint: 'Đường gấp khúc ABCD gồm ba đoạn AB, BC, CD. Cộng độ dài các đoạn lại.', explain: items.map(lineOf).join('\n') });
  };

  // ---------- Giờ và lịch ----------
  A.ncClockSet = () => {
    const v = rand(0, 3);
    let hh, mm = 0, prompt, why;
    if (v === 0) { const h = rand(6, 10), k = rand(2, 5); hh = h + k; prompt = `Bây giờ là ${h} giờ sáng. Quay kim đồng hồ để chỉ thời gian ${k} giờ sau.`;
      why = `${h} + ${k} = ${hh}.${hh > 12 ? ` ${hh} giờ là ${hh - 12} giờ ${buoi(hh)}.` : ''} Kim ngắn chỉ số ${hh % 12 || 12}, kim dài chỉ số 12.`; }
    else if (v === 1) { hh = rand(13, 21); prompt = `Chương trình ca nhạc bắt đầu lúc ${hh} giờ. Quay kim đồng hồ để chỉ giờ đó.`;
      why = `${hh} giờ là ${hh - 12} giờ ${buoi(hh)}. Kim ngắn chỉ số ${hh - 12}, kim dài chỉ số 12.`; }
    else if (v === 2) { const h = rand(1, 11); hh = h + 1; prompt = `Đồng hồ đang chỉ ${h} giờ 30 phút. Quay kim đồng hồ để chỉ thời gian 30 phút sau.`;
      why = `${h} giờ 30 phút thêm 30 phút là ${hh} giờ. Kim ngắn chỉ số ${hh}, kim dài chỉ số 12.`; }
    else { const h = rand(7, 10), n = pick(NAMES); hh = h; mm = 30; prompt = `${n} bắt đầu làm bài lúc ${h} giờ 15 phút và làm trong 15 phút. Quay kim đồng hồ để chỉ lúc ${n} làm xong.`;
      why = `15 phút + 15 phút = 30 phút. ${n} làm xong lúc ${h} giờ 30 phút: kim dài chỉ số 6, kim ngắn nằm giữa số ${h} và số ${h + 1}.`; }
    const label = mm ? `${hh} giờ ${mm} phút` : hh > 12 ? `${hh} giờ (${hh - 12} giờ ${buoi(hh)})` : `${hh} giờ`;
    return { type: 'clockset', clock: { h: hh, m: mm }, answer: `${hh}:${String(mm).padStart(2, '0')}`, answerLabel: label, skill: 'nc.thoigian',
      prompt, sub: 'Tính giờ trước, rồi chọn kim dài hay kim ngắn và kéo kim đến đúng chỗ.', hint: 'Kim dài chỉ phút, kim ngắn chỉ giờ. 13 giờ là 1 giờ chiều, 14 giờ là 2 giờ chiều…', explain: why };
  };
  A.ncCalFill = () => {
    const first = rand(0, 6), m = pick([1, 3, 5, 7, 8, 10, 12]); // tháng có 31 ngày; first: thứ của ngày 1
    const [w1, w2] = U.sample(U.range(0, 6), 2);
    const datesOf = (w) => { const d = 1 + ((w - first + 7) % 7); return [d, d + 7, d + 14, d + 21]; };
    const r1 = datesOf(w1), r2 = datesOf(w2), h1 = new Set(U.sample([1, 2, 3], 2)), keep = rand(0, 3);
    const rows = [[WD[w1], ...r1.map((d, i) => (h1.has(i) ? S(d) : d))], [WD[w2], ...r2.map((d, i) => (i === keep ? d : S(d)))]];
    return fillQ([{ kind: 'table', rows }], { skill: 'nc.thoigian', prompt: 'Số?', sub: `Trong tháng ${m}, ngày 1 là ${wdLow(first)}. Điền các ngày còn thiếu vào tờ lịch.`,
      speak: `Trong tháng ${m}, ngày 1 là ${wdLow(first)}. Điền các ngày còn thiếu vào tờ lịch.`,
      hint: 'Cứ thêm 7 ngày lại đến đúng thứ đó. Đếm từ ngày 1 để tìm ngày đầu tiên của mỗi thứ.',
      explain: `${WD[w1]}: ${r1.join(', ')}\n${WD[w2]}: ${r2.join(', ')}` });
  };
  const MONTH_DAYS = [[1, 31], [3, 31], [4, 30], [5, 31], [6, 30], [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31]];
  const TIME_TF = [
    () => { const h = rand(13, 21), ok = chance(0.5), g = ok ? h - 12 : h - 10; return [`${h} giờ còn gọi là ${g} giờ ${buoi(h)}.`, ok ? 'Đ' : 'S', `${h} giờ là ${h - 12} giờ ${buoi(h)}`]; },
    () => { const s = rand(7, 14), e = s + rand(2, 5), d = e - s + (chance(0.5) ? 0 : pick([-1, 1])); return [`Từ ${s} giờ đến ${e} giờ là ${d} giờ.`, d === e - s ? 'Đ' : 'S', `${e} − ${s} = ${e - s} (giờ)`]; },
    () => pick([['1 ngày có 24 giờ.', 'Đ'], ['1 ngày có 12 giờ.', 'S', '1 ngày có 24 giờ'], ['1 giờ có 60 phút.', 'Đ'], ['1 giờ có 100 phút.', 'S', '1 giờ có 60 phút'],
      ['1 tuần lễ có 7 ngày.', 'Đ']]),
    () => { const [mo, d] = pick(MONTH_DAYS), ok = chance(0.5), x = ok ? d : 61 - d; return [`Tháng ${mo} có ${x} ngày.`, ok ? 'Đ' : 'S', `tháng ${mo} có ${d} ngày`]; },
    () => { const w = rand(0, 6), d = rand(1, 15), k = pick([7, 14]), ok = chance(0.5), w2 = ok ? w : (w + 1) % 7;
      return [`Ngày ${d} là ${wdLow(w)} thì ngày ${d + k} cùng tháng là ${wdLow(w2)}.`, ok ? 'Đ' : 'S', `ngày ${d + k} cũng là ${wdLow(w)}`]; },
    () => { const h = rand(1, 11); return pick([[`Kim ngắn chỉ số ${h}, kim dài chỉ số 12 thì đồng hồ chỉ ${h} giờ.`, 'Đ'],
      [`Kim ngắn chỉ số 12, kim dài chỉ số ${h} thì đồng hồ chỉ ${h} giờ.`, 'S', 'kim ngắn mới chỉ giờ']]); },
  ];
  A.ncTimeRows = () => {
    const rows = tfRows(TIME_TF, 4);
    return rowsQ(rows.map(([t, a]) => ({ t, a })), { skill: 'nc.thoigian', prompt: 'Đ, S?', sub: 'Đọc kĩ từng câu: đúng chọn Đ, sai chọn S.',
      hint: '1 ngày có 24 giờ. 13 giờ là 1 giờ chiều. Cứ 7 ngày lại đến cùng một thứ.', explain: tfExplain(rows) });
  };

  // ---------- Hình khối ----------
  const SOLID = { cau: ['⚽', '🏀', '🎾', '🌍', '🍊', '🎱', '🏐'], tru: ['🥫', '🧻', '🥁', '🕯️', '🔋'], hop: ['📦', '🎁', '🧊', '🧱'] };
  A.ncSolidPick = () => {
    const v = rand(0, 1);
    const good = v === 0 ? [...U.sample(SOLID.cau, 2), ...U.sample(SOLID.tru, rand(1, 2))] : U.sample(SOLID.tru, rand(2, 3));
    const bad = v === 0 ? U.sample(SOLID.hop, 7 - good.length > 4 ? 4 : 7 - good.length) : [...U.sample(SOLID.cau, 2), ...U.sample(SOLID.hop, 2)];
    const items = shuffle([...good.map((e) => ({ e, ok: true })), ...bad.map((e) => ({ e, ok: false }))]).map((x) => ({ html: `<span class="pk-emoji">${x.e}</span>`, ok: x.ok }));
    return { type: 'pick', mode: 'pics', items, answer: good, skill: 'nc.khoi',
      prompt: v === 0 ? 'Khoanh vào tất cả các đồ vật lăn được.' : 'Khoanh vào các đồ vật có hai mặt đáy là hình tròn.', sub: 'Chạm để chọn tất cả, rồi bấm Kiểm tra.',
      hint: v === 0 ? 'Đồ vật dạng khối cầu và khối trụ đều lăn được. Khối hộp không lăn được.' : 'Khối trụ có hai mặt đáy là hình tròn (như cái lon). Khối cầu không có mặt đáy.',
      explain: v === 0 ? `Lăn được: ${good.join(' ')} (khối cầu, khối trụ).` : `Có hai mặt đáy hình tròn (khối trụ): ${good.join(' ')}.` };
  };
  const SOLID_TF = [
    ['Khối cầu lăn được về mọi phía.', 'Đ'], ['Khối trụ có hai mặt đáy là hình tròn.', 'Đ'], ['Quả bóng đá có dạng khối trụ.', 'S', 'quả bóng có dạng khối cầu'],
    ['Lon sữa có dạng khối cầu.', 'S', 'lon sữa có dạng khối trụ'], ['Khối cầu có hai mặt đáy là hình tròn.', 'S', 'khối trụ mới có hai mặt đáy'],
    ['Đặt nằm xuống, khối trụ lăn được.', 'Đ'], ['Hộp quà hình hộp lăn được như quả bóng.', 'S', 'khối hộp không lăn được'], ['Quả cam có dạng khối cầu.', 'Đ'],
    ['Cây nến có dạng khối trụ.', 'Đ'], ['Viên gạch có dạng khối trụ.', 'S', 'viên gạch có dạng khối hộp chữ nhật'],
  ];
  A.ncSolidRows = () => {
    const rows = tfRows(SOLID_TF.map((r) => () => r), 4);
    return rowsQ(rows.map(([t, a]) => ({ t, a })), { skill: 'nc.khoi', prompt: 'Đ, S?', sub: 'Đọc kĩ từng câu: đúng chọn Đ, sai chọn S.',
      hint: 'Khối cầu tròn đều, lăn về mọi phía. Khối trụ có hai mặt đáy hình tròn.', explain: tfExplain(rows) });
  };
  A.ncSolidFill = () => {
    const nc = rand(3, 7), nt = rand(2, 6), nh = rand(1, 3);
    const groups = [], split = (pool, n) => { const es = U.sample(pool, Math.min(3, n)); const cnt = es.map(() => 1); for (let k = es.length; k < n; k++) cnt[rand(0, es.length - 1)]++; es.forEach((e, i) => groups.push({ e, n: cnt[i] })); };
    split(SOLID.cau, nc); split(SOLID.tru, nt); split(SOLID.hop, nh);
    const items = [['Khối cầu: ', S(nc), ' đồ vật.'], ['Khối trụ: ', S(nt), ' đồ vật.'], ['Khối cầu nhiều hơn khối trụ ', S(Math.abs(nc - nt)), ' đồ vật.']];
    if (nc <= nt) items[2] = ['Có tất cả ', S(nc + nt), ' đồ vật dạng khối cầu hoặc khối trụ.'];
    return fillQ([{ kind: 'list', cols: 1, items }], { skill: 'nc.khoi', prompt: 'Số?', sub: 'Đếm các đồ vật theo dạng khối (có cả đồ vật khối hộp), rồi điền số.',
      visual: { kind: 'scatter', groups }, split: true, hint: 'Quả bóng, quả cam có dạng khối cầu; lon, cuộn giấy, cây nến có dạng khối trụ; hộp quà là khối hộp.',
      explain: items.map(lineOf).join('\n') });
  };

  // ---------- Các số trong phạm vi 1000 ----------
  A.ncNumFill = () => {
    const mk = [
      () => { const h = rand(1, 9), t = rand(0, 9), u = rand(1, 9); return [[S(h * 100 + t * 10 + u), ` = ${h * 100}${t ? ` + ${t * 10}` : ''} + ${u}`]]; },
      () => { const h = rand(1, 9), u = rand(1, 9), n = h * 100 + u; return [[`${n} = `, S(h), ' trăm + ', S(u), ' đơn vị']]; },
      () => { const h = rand(1, 8), x = rand(10, 19), n = h * 100 + x; return [[`${h} trăm ${x} đơn vị = `, S(n)]]; },
      () => { const h = rand(1, 7), x = rand(11, 19); return [[`${h} trăm ${x} chục = `, S(h * 100 + x * 10)]]; },
      () => { const n = rand(1, 8) * 100 + 99; return [[`Số liền sau của ${n} là `, S(n + 1)]]; },
      () => { const n = rand(2, 9) * 100 + rand(0, 9) * 10; return [['Số liền trước của ' + n + ' là ', S(n - 1)]]; },
    ];
    const items = shuffle(mk).slice(0, 4).map((f) => f()[0]);
    return fillQ([{ kind: 'list', cols: 1, items }], { skill: 'nc.so', prompt: 'Số?', sub: SUB_FILL,
      hint: '1 trăm = 10 chục = 100 đơn vị. Ví dụ: 3 trăm 12 đơn vị = 300 + 12 = 312; 2 trăm 15 chục = 200 + 150 = 350.',
      explain: items.map(lineOf).join('\n') });
  };
  A.ncSeqFill = () => {
    const step = pick([5, 20, 25, 50, 110]), down = chance(0.35);
    const n = 6, lo = 100, start = down ? rand(lo + step * (n - 1), 999) : rand(lo, 999 - step * (n - 1));
    const seq = U.range(0, n - 1).map((i) => start + (down ? -i : i) * step);
    let hide;
    do { // ô đầu (hoặc ô thứ hai) để trống, và vẫn có hai số liền nhau đã biết để tìm quy luật
      hide = new Set([chance(0.6) ? 0 : 1, ...U.sample([2, 3, 4, 5], 2)]);
    } while (!U.range(0, n - 2).some((i) => !hide.has(i) && !hide.has(i + 1)));
    return fillQ([{ kind: 'chain', items: seq.map((v, i) => (hide.has(i) ? S(v) : v)) }], {
      skill: 'nc.dayso', prompt: 'Số?', sub: 'Tìm quy luật của dãy số rồi điền các số còn thiếu (kể cả ô đầu tiên).',
      hint: 'Lấy hai số đứng cạnh nhau đã biết, xem số sau hơn (hoặc kém) số trước bao nhiêu.',
      explain: `Mỗi số ${down ? 'kém' : 'hơn'} số đứng trước nó ${step} đơn vị: ${seq.join(', ')}.` });
  };
  A.ncDigitPick = () => {
    const pos = pick([0, 1, 2]), d = rand(1, 9), name = ['trăm', 'chục', 'đơn vị'][pos];
    const nums = new Set();
    const mkWith = (p) => { const ds = [rand(1, 9), rand(0, 9), rand(0, 9)]; ds[p] = d; return ds; };
    const good = [], bad = [];
    while (good.length < 3) { const ds = mkWith(pos); const n = Number(ds.join('')); if (!nums.has(n)) { nums.add(n); good.push(n); } }
    while (bad.length < 4) {
      const p = pick([0, 1, 2].filter((x) => x !== pos)), ds = mkWith(p);
      if (ds[pos] === d) continue;
      const n = Number(ds.join(''));
      if (!nums.has(n)) { nums.add(n); bad.push(n); }
    }
    const items = shuffle([...good.map((n) => ({ t: String(n), ok: true })), ...bad.map((n) => ({ t: String(n), ok: false }))]);
    return { type: 'pick', mode: 'tiles', items, answer: good.map(String), skill: 'nc.so', prompt: `Khoanh vào các số có chữ số hàng ${name} là ${d}.`,
      sub: 'Chạm để chọn tất cả các số đúng, rồi bấm Kiểm tra.', hint: 'Số có ba chữ số: chữ số đầu là hàng trăm, giữa là hàng chục, cuối là hàng đơn vị.',
      explain: `Các số có chữ số hàng ${name} là ${d}: ${good.join(', ')}.` };
  };

  // ---------- Độ dài, tiền Việt Nam ----------
  A.ncConvertFill = () => {
    const mk = [
      () => { const a = rand(1, 9), b = rand(1, 9); return [`${a} {dm} ${b} {cm} = `, S(a * 10 + b), ' {cm}']; },
      () => { const a = rand(2, 9); return [`${a} {m} = `, S(a * 100), ' {cm}']; },
      () => { const a = rand(2, 9); return [`${a * 10} {dm} = `, S(a), ' {m}']; },
      () => { const a = rand(1, 9), b = rand(1, 9); return [`${a * 10 + b} {cm} = `, S(a), ' {dm} ', S(b), ' {cm}']; },
      () => { const a = rand(1, 9); return [`1 {m} − ${a * 10} {cm} = `, S(100 - a * 10), ' {cm}']; },
      () => ['1 {km} = ', S(1000), ' {m}'],
    ];
    const items = shuffle(mk).slice(0, 4).map((f) => f());
    return fillQ([{ kind: 'list', cols: 1, items }], { skill: 'nc.doluong', prompt: 'Số?', sub: SUB_FILL,
      hint: '1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m. Ví dụ: 4 dm 5 cm = 40 cm + 5 cm = 45 cm.', explain: items.map(lineOf).join('\n') });
  };
  A.ncMoneyPick = () => {
    for (;;) {
      const [x, y] = pick(SHOP), p = rand(1, 6) * 100, q = rand(1, 4) * 100, T = p + q;
      if (T > 1000) continue;
      const notes = shuffle([100, 200, 200, 500, 500, 1000, 100]).slice(0, 6);
      // phải có ít nhất một cách chọn được đúng T đồng (và không có tờ nào đúng bằng T)
      let way = null;
      for (let m = 1; m < 64 && !way; m++) { const idx = U.range(0, 5).filter((i) => m & (1 << i)); if (idx.length >= 2 && idx.reduce((s, i) => s + notes[i], 0) === T) way = idx; }
      if (!way || notes.includes(T)) continue;
      return { type: 'pick', mode: 'pics', items: notes.map((v, i) => ({ html: App.Svg.note(v), v, ok: way.includes(i) })), sum: T,
        answer: [`các tờ tiền tổng cộng ${T} đồng`], answerLabel: way.map((i) => notes[i]).join(' + ') + ` = ${T} (đồng)`, skill: 'nc.doluong',
        prompt: `Lan mua ${x} giá ${p} đồng và ${y} giá ${q} đồng. Chọn các tờ tiền để trả vừa đủ.`, sub: 'Chạm để chọn các tờ tiền, rồi bấm Kiểm tra.',
        hint: `Tính tổng số tiền phải trả trước: ${p} + ${q} = ?`, explain: `${p} + ${q} = ${T} (đồng). Ví dụ: ${way.map((i) => notes[i]).join(' + ')} = ${T} (đồng).` };
    }
  };

  // ---------- Đặt tính: số có ba chữ số với số có hai chữ số ----------
  A.ncColumn = () => {
    for (;;) {
      const op = pick(['+', '−']), a = rand(120, 950), b = rand(12, 98);
      if (op === '+' ? a + b > 999 : b >= a) continue;
      const carries = U.range(0, 1).filter((i) => (op === '+' ? (digs(a)[i] || 0) + (digs(b)[i] || 0) >= 10 : (digs(a)[i] || 0) < (digs(b)[i] || 0))).length;
      if (carries !== 1) continue;
      const r = calc(a, op, b);
      return { type: 'column', col: { a, b, op, res: r }, answer: r, skill: 'nc.datinh', prompt: 'Đặt tính rồi tính.', big: `${a} ${op} ${b}`,
        speak: `Đặt tính rồi tính: ${a} ${op === '+' ? 'cộng' : 'trừ'} ${b}.`,
        hint: 'Số có hai chữ số viết thẳng cột với hai hàng bên phải (chục, đơn vị) của số trên. Tính từ hàng đơn vị, nhớ 1 (hoặc trả 1) cho hàng bên trái.',
        explain: `Viết ${b} thẳng cột với hàng chục và hàng đơn vị của ${a}.\n${a} ${op} ${b} = ${r}` };
    }
  };

  // ---------- Thống kê, khả năng ----------
  A.ncPictoFill = () => {
    const p = pick(PICTO2);
    let rows;
    do { rows = p.rows.map(([icon, label]) => ({ icon, label, n: rand(2, 8) })); } while (new Set(rows.map((r) => r.n)).size < 3);
    const sorted = rows.slice().sort((x, y) => y.n - x.n), [hi, mid, lo] = sorted;
    const items = [[`Cả ba hàng có tất cả `, S(hi.n + mid.n + lo.n), ` ${p.unit}.`], [`Hàng ${hi.label} nhiều hơn hàng ${lo.label} `, S(hi.n - lo.n), ` ${p.unit}.`],
      [`Cần thêm `, S(hi.n - mid.n), ` ${p.unit} nữa thì hàng ${mid.label} bằng hàng ${hi.label}.`]];
    return fillQ([{ kind: 'list', cols: 1, items }], { skill: 'nc.thongke', prompt: 'Số?', sub: 'Đọc biểu đồ tranh rồi điền số.',
      visual: { kind: 'picto', title: p.title, note: `Mỗi hình là 1 ${p.unit}`, rows }, split: true,
      hint: 'Đếm số hình ở mỗi hàng. Nhiều hơn bao nhiêu, cần thêm bao nhiêu: lấy số lớn trừ số bé.', explain: items.map(lineOf).join('\n') });
  };
  A.ncChanceRows = () => {
    for (;;) {
      const r = rand(1, 4), b = rand(1, 4), k = rand(2, Math.min(4, r + b));
      const cand = [
        [`Có ít nhất 1 viên bi đỏ.`, k > b ? 'Chắc chắn' : 'Có thể', k > b ? `chỉ có ${b} viên bi xanh nên chắc chắn có bi đỏ` : `có thể lấy ra toàn bi xanh`],
        [`Cả ${k} viên đều là bi xanh.`, k > b ? 'Không thể' : 'Có thể', k > b ? `chỉ có ${b} viên bi xanh` : `có ${b} viên bi xanh nên có thể`],
        [`Cả ${k} viên đều là bi đỏ.`, k > r ? 'Không thể' : 'Có thể', k > r ? `chỉ có ${r} viên bi đỏ` : `có ${r} viên bi đỏ nên có thể`],
        ['Có viên bi màu vàng.', 'Không thể', 'trong hộp không có bi vàng'],
        [`Có ít nhất 1 viên bi xanh.`, k > r ? 'Chắc chắn' : 'Có thể', k > r ? `chỉ có ${r} viên bi đỏ nên chắc chắn có bi xanh` : 'có thể lấy ra toàn bi đỏ'],
      ];
      const rows = U.sample(cand, 3);
      if (new Set(rows.map((x) => x[1])).size < 2) continue;
      return rowsQ(rows.map(([t, a]) => ({ t, a })), { opts: ['Chắc chắn', 'Có thể', 'Không thể'], skill: 'nc.khanang',
        prompt: `Trong hộp có ${r} viên bi đỏ và ${b} viên bi xanh. Không nhìn, lấy ra ${k} viên bi. Chọn chắc chắn, có thể hay không thể cho mỗi câu.`,
        visual: { kind: 'bag', items: shuffle([...Array(r).fill('🔴'), ...Array(b).fill('🔵')]) },
        hint: 'Thử nghĩ trường hợp xấu nhất: nếu lấy được toàn bi một màu thì sao?', explain: rows.map(([t, a, why]) => `${t} → ${a.toLowerCase()} (${why})`).join('\n') });
    }
  };

  App.Gen = App.Gen || {};
  App.Gen.toanAdv = A;

  // ======================= Gắn câu nâng cao vào từng chủ đề =======================
  // [hàm tạo câu, chặng bắt đầu dùng được]
  // Dòng thứ hai của mỗi chủ đề: các dạng bài giống vở bài tập (điền ô trống, Đ/S, bài giải hai bước, quay kim, vẽ đoạn thẳng…)
  const POOLS = {
    c1: [[A.digitCards, 'b1'], [A.digitSum, 'b1'], [A.countNum, 'b1'], [A.seqPattern, 'b2'], [A.missing100, 'b3'], [A.twoStep100, 'b4'],
      [A.symbolSum, 'b5'], [A.compareTwo100, 'b5'],
      [A.ncTFNum(2), 'b2'], [A.ncTable('100'), 'b3'], [A.ncSolve('100'), 'b4'], [A.ncChain('100'), 'b5'], [A.ncTFExpr('100'), 'b5']],
    c2: [[A.chainAdd20, 'b7'], [A.symbol20, 'b7'], [A.balanceAdd20, 'b8'], [A.compareAdd20, 'b8'], [A.story20Two, 'b9'], [A.chainMix20, 'b11'],
      [A.signFill20, 'b11'], [A.balanceSub20, 'b12'], [A.compareSub20, 'b12'], [A.age20, 'b13'],
      [A.ncChain('20'), 'b7'], [A.ncSumPick, 'b8'], [A.ncTable('20'), 'b11'], [A.ncCmpRows('20'), 'b11'], [A.ncTFExpr('20'), 'b11'], [A.ncSolve('20'), 'b13']],
    c3: [[A.kgTwoStep, 'b15'], [A.balanceChain, 'b15'], [A.literPour, 'b16'], [A.literTwoStep, 'b16'],
      [A.ncWeightPick, 'b15'], [A.ncUnitFill, 'b16'], [A.ncCmpRows('kgl'), 'b16'], [A.ncSolve('kgl'), 'b16']],
    c4: [[A.chainAdd100, 'b19'], [A.quickSum, 'b20'], [A.digitBox, 'b20'], [A.balanceEq100, 'b23'], [A.chainCarry, 'b23'], [A.compareCarry, 'b23'],
      [A.twoStepCarry, 'b23'], [A.reverseStory, 'b23'],
      [A.ncChain('nho'), 'b23'], [A.ncTable('nho'), 'b23'], [A.ncTFV('nho'), 'b23'], [A.ncSolve('nho'), 'b23']],
    c5: [[A.segmentsOnLine, 'b25'], [A.countFig, 'b26'], [A.polylineMissing, 'b26'], [A.polylineEqual, 'b26'],
      [A.ncSeg('cm'), 'b25'], [A.ncPolyRows, 'b26'], [A.ncPolyFill, 'b26']],
    c6: [[A.timeAfter, 'b29'], [A.duration, 'b29'], [A.calendarJump, 'b30'], [A.weekLogic, 'b30'],
      [A.ncClockSet, 'b29'], [A.ncTimeRows, 'b30'], [A.ncCalFill, 'b30']],
    c8: [[A.legs, 'b37'], [A.mulExpr, 'b39'], [A.factorEq, 'b40'], [A.mulCompare, 'b40'], [A.mulTwoStep, 'b40'], [A.seqMul, 'b40'],
      [A.divTwoStep, 'b43'], [A.divCompare, 'b44'],
      [A.ncTable('nhan'), 'b40'], [A.ncChain('nhan'), 'b44'], [A.ncCmpRows('nhan'), 'b44'], [A.ncSolve('nhan'), 'b44']],
    c9: [[A.solidRows, 'b46'], [A.solidLogic, 'b46'],
      [A.ncSolidPick, 'b46'], [A.ncSolidRows, 'b46'], [A.ncSolidFill, 'b46']],
    c10: [[A.seq1000, 'b49'], [A.digitCards3, 'b51'], [A.number3Cond, 'b51'], [A.countRange3, 'b51'], [A.compareForm3, 'b52'], [A.extremes3, 'b53'],
      [A.ncNumFill, 'b51'], [A.ncSeqFill, 'b51'], [A.ncDigitPick, 'b51'], [A.ncTFNum(3), 'b53']],
    c11: [[A.lengthMixed, 'b55'], [A.lengthTwoStep, 'b55'], [A.moneyLeft, 'b56'], [A.moneyFewest, 'b56'],
      [A.ncConvertFill, 'b55'], [A.ncCmpRows('len'), 'b55'], [A.ncSeg('dm'), 'b55'], [A.ncMoneyPick, 'b56'], [A.ncSolve('doDai'), 'b56']],
    c12: [[A.missing1000, 'b60'], [A.digitBox3, 'b60'], [A.compare1000, 'b60'], [A.chain1000, 'b62'], [A.twoStep1000, 'b62'],
      [A.ncChain('1000'), 'b61'], [A.ncColumn, 'b62'], [A.ncTable('1000'), 'b62'], [A.ncTFV('1000'), 'b62'], [A.ncSolve('1000'), 'b62']],
    c13: [[A.logicOrder, 'b64'], [A.pictoSum, 'b65'], [A.chancePigeon, 'b66'],
      [A.ncPictoFill, 'b65'], [A.ncChanceRows, 'b66']],
  };
  // Hai chủ đề ôn tập dùng câu nâng cao của các chủ đề trước
  const all = (ids) => ids.flatMap((id) => POOLS[id].map(([g]) => g));
  App.attachAdvanced(App.Curriculum.toan, POOLS, { c7: all(['c1', 'c2', 'c3', 'c4', 'c5', 'c6']), c14: all(['c8', 'c10', 'c11', 'c12', 'c13']) });

  App.SkillNames = Object.assign(App.SkillNames || {}, {
    'nc.so': 'Toán nâng cao: Số và chữ số', 'nc.dayso': 'Toán nâng cao: Dãy số theo quy luật', 'nc.timso': 'Toán nâng cao: Tìm số chưa biết',
    'nc.tinh': 'Toán nâng cao: Tính nhiều bước', 'nc.tinhnhanh': 'Toán nâng cao: Tính nhanh', 'nc.dau': 'Toán nâng cao: Điền dấu, so sánh biểu thức',
    'nc.loivan': 'Toán nâng cao: Bài toán hai bước', 'nc.doluong': 'Toán nâng cao: Đo lường', 'nc.hinh': 'Toán nâng cao: Đếm hình, đường gấp khúc',
    'nc.thoigian': 'Toán nâng cao: Giờ và lịch', 'nc.nhanchia': 'Toán nâng cao: Nhân, chia', 'nc.logic': 'Toán nâng cao: Suy luận',
    'nc.thongke': 'Toán nâng cao: Biểu đồ tranh', 'nc.khanang': 'Toán nâng cao: Chắc chắn, có thể, không thể',
    'nc.timloi': 'Toán nâng cao: Tìm phép tính sai (Đ, S)', 'nc.khoi': 'Toán nâng cao: Khối trụ, khối cầu',
    'nc.datinh': 'Toán nâng cao: Đặt tính số có ba chữ số với số có hai chữ số',
  });
})(window.App);
