/* Toán 2 – bài tập dạng vở bài tập: mỗi câu là một "bài" có lệnh như trong vở
   ("Số?", "Tính nhẩm.", "Đ, S?", ">, <, = ?", "Khoanh vào…") gồm nhiều phép tính hoặc nhiều ô cần điền.
   Các hàm được thêm vào bộ App.Gen.toan, dùng trong plan của toan.js. Số liệu tạo ngẫu nhiên, không chép đề trong sách. */
(function (App) {
  'use strict';
  const U = App.U;
  const { rand, pick, shuffle, chance } = U;
  const { ADD20, SUB20, noCarryAdd, noBorrowSub, sign } = App.Gen.toanUtil;
  const G = App.Gen.toan;
  const Svg = App.Svg;
  const S = (a) => ({ a }); // ô trống
  const fillQ = (blocks, q) => ({ type: 'fill', fill: blocks, answer: App.QTypes.fill.collect(blocks), ...q });
  const OPW = { '+': 'cộng', '−': 'trừ', '×': 'nhân', ':': 'chia' };
  const SUB_FILL = 'Chạm vào từng ô trống rồi bấm số.';

  // ================= Các "họ" phép tính: mỗi họ trả về { a, op, b, r } =================
  const calc = (a, op, b) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);
  const mk = (a, op, b) => ({ a, op, b, r: calc(a, op, b) });
  // Có nhớ trong phạm vi 100: a1 (36 + 7), a2 (36 + 27), s1 (32 − 5), s2 (52 − 28)
  function carry2(kind) {
    for (;;) {
      if (kind === 'a1') { const a = rand(11, 89), b = rand(2, 9); if ((a % 10) + b >= 10 && a + b <= 100) return mk(a, '+', b); }
      if (kind === 'a2') { const a = rand(11, 89), b = rand(11, 89); if ((a % 10) + (b % 10) >= 10 && a + b <= 100) return mk(a, '+', b); }
      if (kind === 's1') { const a = rand(20, 98), b = rand(2, 9); if (a % 10 < b) return mk(a, '−', b); }
      if (kind === 's2') { const a = rand(30, 98), b = rand(11, a - 1); if (a % 10 < b % 10) return mk(a, '−', b); }
    }
  }
  // Trong phạm vi 1000: add0 / sub0 (không nhớ), add1 / sub1 (nhớ một lượt)
  const dg = (n) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100)];
  function pair1000(kind) {
    for (;;) {
      const a = rand(100, 989), b = rand(10, 899);
      const A = dg(a), B = dg(b);
      if (kind[0] === 'a') {
        if (a + b > 999) continue;
        const c0 = A[0] + B[0] >= 10 ? 1 : 0, c1 = A[1] + B[1] + c0 >= 10 ? 1 : 0;
        if ((kind === 'add0' && c0 + c1 === 0) || (kind === 'add1' && c0 + c1 === 1)) return mk(a, '+', b);
      } else {
        if (b >= a) continue;
        const b0 = A[0] < B[0] ? 1 : 0, b1 = A[1] < B[1] + b0 ? 1 : 0;
        if ((kind === 'sub0' && b0 + b1 === 0) || (kind === 'sub1' && b0 + b1 === 1)) return mk(a, '−', b);
      }
    }
  }
  const FAM = {
    tronchuc: () => {
      if (chance(0.5)) { const a = rand(1, 8); return mk(a * 10, '+', rand(1, 9 - a) * 10); }
      const a = rand(2, 9); return mk(a * 10, '−', rand(1, a - 1) * 10);
    },
    cong100: () => { const [a, b] = noCarryAdd(); return mk(a, '+', b); },
    tru100: () => { const [a, b] = noBorrowSub(); return mk(a, '−', b); },
    pt100: () => (chance(0.5) ? FAM.cong100() : FAM.tru100()),
    cong20: () => { const [a, b] = pick(ADD20); return mk(a, '+', b); },
    tru20: () => { const [a, b] = pick(SUB20); return mk(a, '−', b); },
    pt20: () => (chance(0.5) ? FAM.cong20() : FAM.tru20()),
    congnho1: () => carry2('a1'),
    congnho2: () => carry2('a2'),
    trunho1: () => carry2('s1'),
    trunho2: () => carry2('s2'),
    congnho: () => carry2(pick(['a1', 'a2'])),
    trunho: () => carry2(pick(['s1', 's2'])),
    nho: () => carry2(pick(['a1', 'a2', 's1', 's2'])),
    nhan2: () => mk(2, '×', rand(1, 10)),
    nhan5: () => mk(5, '×', rand(1, 10)),
    chia2: () => { const r = rand(1, 10); return mk(r * 2, ':', 2); },
    chia5: () => { const r = rand(1, 10); return mk(r * 5, ':', 5); },
    nhanchia: () => FAM[pick(['nhan2', 'nhan5', 'chia2', 'chia5'])](),
    tron1000: () => {
      const add = chance(0.5);
      if (chance(0.5)) {
        if (add) { const a = rand(1, 8); return mk(a * 100, '+', rand(1, 9 - a) * 100); }
        const a = rand(2, 10); return mk(a * 100, '−', rand(1, a - 1) * 100);
      }
      const hh = rand(1, 9), t = rand(1, 8);
      return mk(hh * 100 + t * 10, add ? '+' : '−', add ? rand(1, 9 - t) * 10 : rand(1, t) * 10);
    },
    cong1000: () => pair1000('add0'),
    cong1000n: () => pair1000('add1'),
    tru1000: () => pair1000('sub0'),
    tru1000n: () => pair1000('sub1'),
    pt1000: () => pair1000(pick(['add0', 'add1', 'sub0', 'sub1'])),
  };
  const MENTAL = new Set(['tronchuc', 'cong20', 'tru20', 'pt20', 'nhan2', 'nhan5', 'chia2', 'chia5', 'nhanchia', 'tron1000']);
  function skillOf(fam, f) {
    if (fam === 'tronchuc') return 'pt.tronchuc';
    if (/1000/.test(fam)) return f.op === '+' ? 'pt.cong1000' : 'pt.tru1000';
    if (/nho/.test(fam)) return f.op === '+' ? 'pt.congnho' : 'pt.trunho';
    if (/20$/.test(fam)) return f.op === '+' ? 'pt.cong20' : 'pt.tru20';
    if (/100$/.test(fam)) return f.op === '+' ? 'pt.cong100' : 'pt.tru100';
    if (f.op === '×') return f.a === 2 ? 'pt.bang2' : 'pt.bang5';
    if (f.op === ':') return f.b === 2 ? 'pt.chia2' : 'pt.chia5';
    return 'khac';
  }
  function hintOf(fam) {
    if (fam === 'cong20') return 'Tách số để làm tròn 10. Ví dụ: 9 + 5 = 9 + 1 + 4 = 14.';
    if (fam === 'tru20') return 'Tách số để trừ về 10. Ví dụ: 13 − 5 = 13 − 3 − 2 = 8.';
    if (fam === 'pt20') return 'Phép cộng: tách số để làm tròn 10. Phép trừ: tách số để trừ về 10.';
    if (fam === 'tronchuc') return 'Nhẩm theo chục. Ví dụ: 3 chục + 2 chục = 5 chục, nên 30 + 20 = 50.';
    if (/nho/.test(fam)) return 'Tính từ hàng đơn vị. Được 10 trở lên (hoặc không trừ được) thì nhớ 1 sang hàng chục.';
    if (/1000/.test(fam)) return 'Tính lần lượt từ phải sang trái: hàng đơn vị, hàng chục, hàng trăm.';
    if (/nhan|chia/.test(fam)) return 'Nhớ lại bảng nhân 2, bảng nhân 5. Ví dụ: 10 : 2 = 5 vì 2 × 5 = 10.';
    return 'Tính hàng đơn vị trước, rồi đến hàng chục.';
  }
  // n phép tính khác nhau của một họ (sameOp: cùng một dấu phép tính)
  function facts(fam, n, sameOp = false) {
    const out = [], seen = new Set();
    for (let t = 0; out.length < n && t < 300; t++) {
      const f = FAM[fam]();
      if (sameOp && out.length && f.op !== out[0].op) continue;
      const k = f.a + f.op + f.b;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(f);
    }
    return out;
  }
  const ex = (f, u = '') => `${f.a}${u} ${f.op} ${f.b}${u} = `;
  const line = (f, u = '') => `${f.a}${u} ${f.op} ${f.b}${u} = ${f.r}${u}`;
  const plainU = (s) => U.plain(s);

  // Đáp số sai "hay gặp" để làm câu Đ/S
  function carryErr(f) {
    const A = String(f.a).split('').reverse().map(Number), B = String(f.b).split('').reverse().map(Number);
    let c = 0;
    for (let i = 0; i < A.length - 1; i++) {
      if (f.op === '+') {
        const s = A[i] + (B[i] || 0) + c;
        if (s >= 10) return f.r - 10 ** (i + 1);
        c = 0;
      } else if (f.op === '−') {
        if (A[i] < (B[i] || 0)) return f.r + 10 ** (i + 1);
      }
    }
    return null;
  }
  function wrongOf(f) {
    const c = [f.r + 1, f.r - 1];
    const ce = carryErr(f);
    if (ce != null) c.push(ce, ce, ce);
    if (f.op === '−' && f.a < 100 && f.a % 10 < f.b % 10) c.push((Math.floor(f.a / 10) - Math.floor(f.b / 10)) * 10 + Math.abs((f.a % 10) - (f.b % 10)));
    if (f.op === '×') c.push(f.r + f.a, f.r - f.a, f.r + f.a);
    if (f.op === '+' && f.r > 10 && f.r < 20) c.push(f.r - 10 + 1);
    const ok = c.filter((x) => Number.isInteger(x) && x >= 0 && x !== f.r);
    return pick(ok);
  }

  // ================= 1. Tính nhẩm / Tính: 4 phép tính một lúc =================
  G.vbtCalc = (...fams) => () => {
    const fam = pick(fams);
    const fs = facts(fam, 4);
    const mental = MENTAL.has(fam);
    return fillQ([{ kind: 'list', items: fs.map((f) => [ex(f), S(f.r)]) }], {
      skill: skillOf(fam, fs[0]), prompt: mental ? 'Tính nhẩm.' : 'Tính.', sub: SUB_FILL,
      speak: (mental ? 'Tính nhẩm' : 'Tính') + ', rồi điền kết quả vào các ô trống.',
      hint: hintOf(fam), explain: fs.map((f) => line(f)).join('\n') });
  };

  // ================= 2. Bảng: Số hạng – Số hạng – Tổng … =================
  const LABELS = {
    '+': ['Số hạng', 'Số hạng', 'Tổng'], '−': ['Số bị trừ', 'Số trừ', 'Hiệu'],
    '×': ['Thừa số', 'Thừa số', 'Tích'], ':': ['Số bị chia', 'Số chia', 'Thương'],
  };
  G.vbtTable = (...fams) => () => {
    const fam = pick(fams);
    const fs = facts(fam, 3, true);
    const op = fs[0].op, L = LABELS[op];
    const rows = [[L[0]], [L[1]], [L[2]]];
    fs.forEach((f) => {
      const hide = chance(0.65) ? 2 : rand(0, 1);
      [f.a, f.b, f.r].forEach((v, k) => rows[k].push(k === hide ? S(v) : v));
    });
    return fillQ([{ kind: 'table', rows }], {
      skill: skillOf(fam, fs[0]), prompt: 'Số?', sub: 'Điền số thích hợp vào ô trống trong bảng.',
      speak: `Điền số thích hợp vào bảng: ${L.join(', ')}.`,
      hint: { '+': 'Tổng = số hạng + số hạng. Tìm số hạng thì lấy tổng trừ số hạng kia.', '−': 'Hiệu = số bị trừ − số trừ. Số bị trừ = hiệu + số trừ.',
        '×': 'Tích = thừa số × thừa số.', ':': 'Thương = số bị chia : số chia.' }[op],
      explain: fs.map((f) => line(f)).join('\n') });
  };

  // ================= 3. Chuỗi tính theo mũi tên =================
  // kind: '20' (qua 10), '100' (không nhớ), 'nho' (có nhớ), 'tron' (số tròn chục), '1000' (số tròn trăm)
  function stepFrom(kind, x) {
    for (let t = 0; t < 80; t++) {
      if (kind === '20') {
        const b = rand(2, 9);
        if (x <= 9 && x + b >= 11 && x + b <= 18) return ['+', b];
        if (x >= 11 && x - b <= 9 && x - b >= 2) return ['−', b];
      } else if (kind === '100') {
        const b = chance(0.5) ? rand(1, 9) : rand(11, 60);
        if (chance(0.5)) { if (x + b <= 99 && (x % 10) + (b % 10) < 10) return ['+', b]; } else if (b < x && x % 10 >= b % 10) return ['−', b];
      } else if (kind === 'nho') {
        const b = chance(0.5) ? rand(2, 9) : rand(11, 49);
        if (chance(0.5)) { if (x + b <= 100 && (x % 10) + (b % 10) >= 10) return ['+', b]; } else if (b < x && x % 10 < b % 10) return ['−', b];
      } else if (kind === 'nho+') {
        const b = chance(0.5) ? rand(2, 9) : rand(11, 29);
        if (x + b <= 100 && (x % 10) + (b % 10) >= 10) return ['+', b];
      } else if (kind === 'tron') {
        const b = rand(1, 5) * 10;
        if (chance(0.5)) { if (x + b <= 90) return ['+', b]; } else if (x - b >= 10) return ['−', b];
      } else if (kind === '1000') {
        const b = rand(1, 4) * 100;
        if (chance(0.5)) { if (x + b <= 900) return ['+', b]; } else if (x - b >= 100) return ['−', b];
      }
    }
    return null;
  }
  const CHAIN_START = { 20: () => rand(3, 9), 100: () => rand(21, 68), nho: () => rand(21, 68), 'nho+': () => rand(11, 39), tron: () => rand(2, 7) * 10, 1000: () => rand(2, 7) * 100 };
  const CHAIN_SKILL = { 20: 'pt.cong20', 100: 'pt.cong100', nho: 'pt.congnho', 'nho+': 'pt.congnho', tron: 'pt.tronchuc', 1000: 'pt.cong1000' };
  G.vbtChain = (...kinds) => () => {
    const kind = pick(kinds);
    for (;;) {
      let x = CHAIN_START[kind]();
      const items = [x], lines = [];
      const steps = chance(0.35) ? 3 : 2;
      let ok = true;
      for (let k = 0; k < steps; k++) {
        const st = stepFrom(kind, x);
        if (!st) { ok = false; break; }
        const y = calc(x, st[0], st[1]);
        items.push({ op: st[0] + st[1] }, S(y));
        lines.push(`${x} ${st[0]} ${st[1]} = ${y}`);
        x = y;
      }
      if (!ok) continue;
      let skill = CHAIN_SKILL[kind];
      if (kind === '20' && items[1].op[0] === '−') skill = 'pt.tru20';
      return fillQ([{ kind: 'chain', items }], {
        skill, prompt: 'Số?', sub: 'Tính lần lượt theo chiều mũi tên.', speak: 'Điền số. Tính lần lượt theo chiều mũi tên.',
        hint: 'Lấy số ở ô trước, làm phép tính ghi trên mũi tên, được số ở ô sau.', explain: lines.join('\n') });
    }
  };

  // ================= 4. Sơ đồ tách – gộp số =================
  G.vbtBond = (kind) => () => {
    if (kind === 'cong10') {
      const [a, b] = pick(ADD20.filter(([x]) => x >= 6));
      const r = 10 - a, s = b - r;
      return fillQ([{ kind: 'bond', top: b, left: r, right: S(s) }, { kind: 'list', items: [[`${a} + ${b} = `, S(a + b)]] }], {
        skill: 'pt.cong20', prompt: 'Số?', sub: `Tách ${b} thành ${r} và mấy, để ${a} + ${r} = 10.`,
        speak: `Tách ${b} thành ${r} và mấy, để ${a} cộng ${r} bằng 10. Rồi tính ${a} cộng ${b}.`,
        hint: `${b} gồm ${r} và mấy?`, explain: `${b} = ${r} + ${s}.\n${a} + ${r} = 10, 10 + ${s} = ${a + b}.` });
    }
    if (kind === 'tru10') {
      const [a, b] = pick(SUB20);
      const r = a - 10, s = b - r;
      if (r < 1 || s < 1) return G.vbtBond('tru10')();
      return fillQ([{ kind: 'bond', top: b, left: r, right: S(s) }, { kind: 'list', items: [[`${a} − ${b} = `, S(a - b)]] }], {
        skill: 'pt.tru20', prompt: 'Số?', sub: `Tách ${b} thành ${r} và mấy, để ${a} − ${r} = 10.`,
        speak: `Tách ${b} thành ${r} và mấy, để ${a} trừ ${r} bằng 10. Rồi tính ${a} trừ ${b}.`,
        hint: `${b} gồm ${r} và mấy?`, explain: `${b} = ${r} + ${s}.\n${a} − ${r} = 10, 10 − ${s} = ${a - b}.` });
    }
    // 'chuc': tách số có hai chữ số thành chục và đơn vị, và gộp lại
    const n1 = rand(2, 9) * 10 + rand(1, 9);
    let n2 = rand(2, 9) * 10 + rand(1, 9);
    while (n2 === n1) n2 = rand(2, 9) * 10 + rand(1, 9);
    const t2 = Math.floor(n2 / 10) * 10;
    return fillQ([{ kind: 'row', blocks: [
      { kind: 'bond', top: n1, left: S(Math.floor(n1 / 10) * 10), right: S(n1 % 10) },
      { kind: 'bond', top: S(n2), left: t2, right: n2 % 10 }] }], {
      skill: 'so.cautao', prompt: 'Số?', sub: 'Tách số thành chục và đơn vị, hoặc gộp lại thành số.',
      hint: 'Số có hai chữ số gồm số chục và số đơn vị. Ví dụ: 47 = 40 + 7.',
      explain: `${n1} = ${Math.floor(n1 / 10) * 10} + ${n1 % 10}\n${t2} + ${n2 % 10} = ${n2}` });
  };

  // ================= 5. Đ, S? =================
  G.vbtTF = (...fams) => () => {
    const fam = pick(fams);
    const fs = facts(fam, 4);
    const wrong = new Set(U.sample([0, 1, 2, 3], rand(1, 2)));
    const items = fs.map((f, i) => {
      const shown = wrong.has(i) ? wrongOf(f) : f.r;
      return { t: `${f.a} ${f.op} ${f.b} = ${shown}`, a: shown === f.r ? 'Đ' : 'S' };
    });
    return { type: 'rows', items, answer: items.map((x) => x.a), skill: skillOf(fam, fs[0]),
      prompt: 'Đ, S?', sub: 'Phép tính đúng chọn Đ, phép tính sai chọn S.', speak: 'Đúng chọn Đ, sai chọn S.',
      hint: 'Tự tính lại từng phép tính rồi so với kết quả đã viết.', explain: fs.map((f) => line(f)).join('\n') };
  };
  // Đ, S? với phép đặt tính (có nhớ, phạm vi 1000…)
  G.vbtTFV = (...fams) => () => {
    const fam = pick(fams);
    const fs = facts(fam, 3);
    const nWrong = rand(1, 2);
    const wrong = new Set(U.sample([0, 1, 2], nWrong));
    const items = fs.map((f, i) => {
      const v = { a: f.a, b: f.b, op: f.op, res: f.r };
      if (wrong.has(i)) {
        const ce = carryErr(f);
        if (f.b < 10 && chance(0.4) && f.op === '+' && f.a + f.b * 10 < 1000) { v.shift = 1; v.res = f.a + f.b * 10; }
        else if (f.b < 10 && chance(0.4) && f.op === '−' && f.a - f.b * 10 > 0) { v.shift = 1; v.res = f.a - f.b * 10; }
        else v.res = ce != null && chance(0.7) ? ce : wrongOf(f);
      }
      return { vcalc: v, a: v.res === f.r && !v.shift ? 'Đ' : 'S' };
    });
    return { type: 'rows', items, answer: items.map((x) => x.a), skill: skillOf(fam, fs[0]),
      prompt: 'Đ, S?', sub: 'Phép đặt tính và kết quả đúng chọn Đ, sai chọn S.', speak: 'Kiểm tra các phép đặt tính. Đúng chọn Đ, sai chọn S.',
      hint: 'Kiểm tra hai điều: các chữ số đã thẳng cột chưa, và đã nhớ 1 sang hàng bên trái chưa.',
      explain: fs.map((f, i) => line(f) + (items[i].vcalc.shift ? ' (phép đặt tính bị lệch cột)' : '')).join('\n') };
  };

  // ================= 6. >, <, = ? (nhiều dòng) =================
  G.vbtCompare = (...fams) => () => {
    const fam = pick(fams);
    const fs = facts(fam, 3);
    const big = fs.some((f) => f.r >= 100);
    const items = fs.map((f) => {
      let c = f.r + pick(big ? [-100, -10, -1, 0, 1, 10, 100] : [-2, -1, 0, 0, 1, 2]);
      if (c < 0) c = f.r;
      return { t: `${f.a} ${f.op} ${f.b}  …  ${c}`, a: sign(f.r, c), c };
    });
    return { type: 'rows', opts: ['>', '<', '='], items, answer: items.map((x) => x.a), skill: skillOf(fam, fs[0]),
      prompt: '>, <, = ?', sub: 'Tính kết quả rồi so sánh với số bên phải.', speak: 'Chọn dấu lớn hơn, bé hơn hoặc bằng cho mỗi dòng.',
      hint: 'Tính kết quả phép tính trước, rồi mới so sánh hai số.',
      explain: fs.map((f, i) => `${f.a} ${f.op} ${f.b} = ${f.r}, mà ${f.r} ${items[i].a} ${items[i].c}`).join('\n') };
  };

  // So sánh hai số (nhiều dòng): kind 2 (hai chữ số), 3 (ba chữ số), 'tron' (tròn trăm, tròn chục)
  G.vbtCompareNum = (kind) => () => {
    const gen = { 2: () => rand(10, 99), 3: () => rand(100, 999), tron: () => (chance(0.5) ? rand(1, 10) * 100 : rand(10, 99) * 10) }[kind];
    const items = [];
    while (items.length < 3) {
      const a = gen();
      let b;
      const r = Math.random();
      if (r < 0.2) b = a;
      else if (r < 0.65) {
        const k = kind === 2 ? pick([0, 1]) : kind === 3 ? pick([0, 1, 2]) : pick([1, 2]);
        b = a + pick([-1, 1]) * 10 ** k;
        if (kind === 2 && chance(0.4) && a % 10 && U.rev(a) !== a) b = U.rev(a);
      } else b = gen();
      if (b < (kind === 2 ? 10 : 100) || b > (kind === 2 ? 99 : 1000) || items.some((x) => x.x === a && x.y === b)) continue;
      items.push({ t: `${a}  …  ${b}`, a: sign(a, b), x: a, y: b });
    }
    return { type: 'rows', opts: ['>', '<', '='], items: items.map(({ t, a }) => ({ t, a })), answer: items.map((x) => x.a),
      skill: kind === 2 ? 'so.sosanh' : 'so.sosanh1000', prompt: '>, <, = ?', sub: 'So sánh hai số ở mỗi dòng.',
      hint: kind === 2 ? 'So sánh hàng chục trước, hàng chục bằng nhau thì so sánh hàng đơn vị.' : 'So sánh hàng trăm trước, rồi đến hàng chục, hàng đơn vị.',
      explain: items.map((x) => `${x.x} ${x.a} ${x.y}`).join('\n') };
  };

  // Chọn đơn vị đo thích hợp (nhiều dòng)
  const UNIT_SENT = {
    kgl: { opts: ['kg', 'l'], skill: 'dl.uocluong', items: [['Bao gạo cân nặng 25 …', 'kg'], ['Quả dưa hấu nặng 3 …', 'kg'], ['Bạn Nam cân nặng 24 …', 'kg'], ['Con ngỗng nặng 5 …', 'kg'],
      ['Thùng sách nặng 10 …', 'kg'], ['Cái xô đựng được 10 … nước', 'l'], ['Can dầu đựng 5 … dầu', 'l'], ['Bể cá đựng được 40 … nước', 'l'], ['Hộp sữa to đựng 1 … sữa', 'l'], ['Nồi canh có khoảng 3 … canh', 'l']] },
    len: { opts: ['cm', 'dm', 'm', 'km'], skill: 'dd.do', items: [['Cây bút chì dài khoảng 15 …', 'cm'], ['Quyển vở dài khoảng 24 …', 'cm'], ['Gang tay của em dài khoảng 1 …', 'dm'],
      ['Cái thước kẻ dài 2 …', 'dm'], ['Cái bảng lớp dài khoảng 3 …', 'm'], ['Cột cờ cao khoảng 10 …', 'm'], ['Quãng đường từ nhà bà đến thị trấn dài 5 …', 'km'],
      ['Ô tô chạy được 60 … trong một giờ', 'km'], ['Cái bàn học cao khoảng 7 …', 'dm'], ['Con kiến dài khoảng 1 …', 'cm']] },
  };
  G.vbtChooseUnit = (kind = 'kgl') => () => {
    const d = UNIT_SENT[kind];
    let picks;
    do { picks = U.sample(d.items, 3); } while (new Set(picks.map((p) => p[1])).size < 2);
    const items = picks.map(([t, a]) => ({ t, a }));
    return { type: 'rows', opts: d.opts, items, answer: items.map((x) => x.a), skill: d.skill,
      prompt: 'Chọn đơn vị thích hợp.', sub: 'Mỗi dòng chọn một đơn vị để điền vào chỗ chấm.',
      hint: kind === 'kgl' ? 'Đo độ nặng dùng ki-lô-gam (kg), đo lượng nước, dầu, sữa dùng lít (l).' : 'Vật nhỏ đo bằng cm, dm; vật to, cao đo bằng m; quãng đường dài đo bằng km.',
      explain: items.map((x) => x.t.replace('…', x.a)).join('\n') };
  };

  // ================= 7. Khoanh vào các phép tính có kết quả bằng … =================
  G.vbtPickEq = (...fams) => () => {
    const fam = pick(fams);
    for (let tries = 0; tries < 20; tries++) {
      const pool = facts(fam, 40);
      const groups = {};
      pool.forEach((f) => { (groups[f.r] = groups[f.r] || []).push(f); });
      const targets = Object.keys(groups).filter((r) => groups[r].length >= 2);
      if (!targets.length) continue;
      const R = Number(pick(targets));
      const good = U.sample(groups[R], Math.min(groups[R].length, rand(2, 3)));
      const bad = U.sample(pool.filter((f) => f.r !== R), 6 - good.length);
      if (bad.length < 6 - good.length) continue;
      const items = shuffle([...good.map((f) => ({ t: `${f.a} ${f.op} ${f.b}`, ok: true, f })), ...bad.map((f) => ({ t: `${f.a} ${f.op} ${f.b}`, ok: false, f }))]);
      return { type: 'pick', mode: 'tiles', items: items.map(({ t, ok }) => ({ t, ok })), answer: good.map((f) => `${f.a} ${f.op} ${f.b}`),
        skill: skillOf(fam, good[0]), prompt: `Khoanh vào các phép tính có kết quả bằng ${R}.`, sub: 'Chạm để chọn (có thể chọn nhiều), rồi bấm Kiểm tra.',
        speak: `Chọn tất cả các phép tính có kết quả bằng ${R}.`, hint: 'Tính từng phép tính. Có nhiều hơn một phép tính đúng đấy!',
        explain: items.map(({ f }) => line(f)).join('\n') };
    }
    return G.vbtCalc(fam)();
  };

  // ================= 8. Dãy số, đếm thêm =================
  G.vbtSeq = (step, lo, hi) => () => {
    const n = 6;
    const down = (step === 1 || step === 10 || step === 100) && chance(0.3);
    const start = Math.floor(rand(lo, hi - step * (n - 1)) / step) * step + (step === 1 ? 0 : 0);
    const seq = Array.from({ length: n }, (_, i) => start + i * step);
    if (down) seq.reverse();
    const hide = new Set(U.sample([2, 3, 4, 5], rand(2, 3)));
    if (chance(0.3)) hide.add(1);
    const items = seq.map((v, i) => (hide.has(i) ? S(v) : v));
    const skill = hi > 100 ? 'so.1000' : step === 2 ? 'pt.bang2' : step === 5 ? 'pt.bang5' : 'so.thutu';
    const how = step === 1 ? (down ? 'Mỗi số bớt đi 1.' : 'Mỗi số thêm 1.') : `${down ? 'Đếm bớt' : 'Đếm thêm'} ${step}.`;
    return fillQ([{ kind: 'chain', items }], {
      skill, prompt: 'Số?', sub: 'Điền số còn thiếu vào dãy số. ' + how, speak: 'Điền số còn thiếu vào dãy số. ' + how,
      hint: `Hai số đứng cạnh nhau hơn kém nhau ${step}.`, explain: seq.join(', ') });
  };

  // ================= 9. Bảng cấu tạo số (chục, đơn vị / trăm, chục, đơn vị) =================
  G.vbtPlace = (digits = 2) => () => {
    const nums = [];
    while (nums.length < 3) {
      const v = digits === 2 ? rand(1, 9) * 10 + rand(0, 9) : rand(1, 9) * 100 + rand(0, 9) * 10 + rand(0, 9);
      if (!nums.includes(v)) nums.push(v);
    }
    const names = digits === 2 ? ['Chục', 'Đơn vị'] : ['Trăm', 'Chục', 'Đơn vị'];
    const rows = [['Số'], ...names.map((x) => [x])];
    nums.forEach((v) => {
      const ds = String(v).split('').map(Number);
      const hideNum = chance(0.4);
      rows[0].push(hideNum ? S(v) : v);
      ds.forEach((d, k) => rows[k + 1].push(hideNum ? d : S(d)));
    });
    return fillQ([{ kind: 'table', rows }], {
      skill: digits === 2 ? 'so.cautao' : 'so.1000', prompt: 'Số?', sub: 'Viết số, hoặc viết chữ số ở mỗi hàng.',
      hint: digits === 2 ? 'Chữ số bên trái là hàng chục, bên phải là hàng đơn vị.' : 'Ba chữ số lần lượt là hàng trăm, hàng chục, hàng đơn vị.',
      explain: nums.map((v) => `${v}: ${String(v).split('').map((d, k) => `${d} ${names[k].toLowerCase()}`).join(', ')}`).join('\n') });
  };
  // Viết số thành tổng (456 = 400 + 50 + 6)
  G.vbtExpand = () => () => {
    const a = rand(1, 9) * 100 + rand(1, 9) * 10 + rand(1, 9);
    const b = rand(1, 9) * 100 + rand(0, 9) * 10 + rand(1, 9);
    const [a2, a1, a0] = String(a).split('').map(Number);
    const [b2, b1, b0] = String(b).split('').map(Number);
    const bParts = [b2 * 100, b1 * 10, b0].filter((x) => x > 0);
    return fillQ([{ kind: 'list', cols: 1, items: [[`${a} = `, S(a2 * 100), ' + ', S(a1 * 10), ' + ', S(a0)], [bParts.join(' + ') + ' = ', S(b)]] }], {
      skill: 'so.1000', prompt: 'Số?', sub: 'Viết số thành tổng các trăm, chục, đơn vị (và ngược lại).',
      hint: 'Ví dụ: 456 = 400 + 50 + 6.', explain: `${a} = ${a2 * 100} + ${a1 * 10} + ${a0}\n${bParts.join(' + ')} = ${b}` });
  };

  // ================= 10. Hoàn thành bảng cộng, trừ, nhân, chia =================
  G.vbtFactTable = (op, base) => () => {
    let rowsF = [];
    let title = '';
    if (op === '+') {
      const n = base || rand(5, 9); // từ 5 trở lên mới có đủ 4 dòng cộng qua 10
      const ks = U.range(2, 9).filter((k) => n + k > 10);
      rowsF = ks.map((k) => mk(n, '+', k));
      title = `bảng ${n} cộng với một số`;
    } else if (op === '−') {
      const n = base || rand(11, 15); // đến 15 mới có đủ 4 dòng trừ qua 10
      const ks = U.range(2, 9).filter((k) => n - k < 10);
      rowsF = ks.map((k) => mk(n, '−', k));
      title = `bảng ${n} trừ đi một số`;
    } else if (op === '×') {
      const n = base || pick([2, 5]);
      rowsF = U.range(1, 10).map((k) => mk(n, '×', k));
      title = `bảng nhân ${n}`;
    } else {
      const n = base || pick([2, 5]);
      rowsF = U.range(1, 10).map((k) => mk(n * k, ':', n));
      title = `bảng chia ${n}`;
    }
    const take = Math.min(6, rowsF.length);
    const st = rand(0, rowsF.length - take);
    const part = rowsF.slice(st, st + take);
    const hide = new Set(U.sample(part.map((_, i) => i), Math.min(4, take - 1)));
    const items = part.map((f, i) => (hide.has(i) ? [ex(f), S(f.r)] : [line(f)]));
    const skill = op === '+' ? 'pt.cong20' : op === '−' ? 'pt.tru20' : skillOf('', part[0]);
    return fillQ([{ kind: 'list', items }], {
      skill, prompt: 'Số?', sub: `Hoàn thành ${title}.`, speak: `Hoàn thành ${title}.`,
      hint: op === '×' ? 'Mỗi dòng sau hơn dòng trước ' + part[0].a + '.' : op === ':' ? 'Dùng bảng nhân để tìm kết quả phép chia.'
        : 'Nhìn các dòng đã có: kết quả tăng (hoặc giảm) dần đều.',
      explain: part.map((f) => line(f)).join('\n') });
  };

  // ================= 11. Phép tính với số đo (kg, l, cm, dm, m) =================
  G.vbtUnits = (unit) => () => {
    const fams = unit === 'm' || unit === 'dm' ? ['cong100', 'tru100'] : ['cong20', 'tru20', 'cong100', 'tru100'];
    const fs = [];
    for (let t = 0; fs.length < 4 && t < 50; t++) {
      const f = FAM[pick(fams)]();
      if (!fs.some((x) => x.a === f.a && x.b === f.b)) fs.push(f);
    }
    const u = ` {${unit}}`;
    const skill = unit === 'kg' ? 'kl.kg' : unit === 'l' ? 'dt.lit' : 'dd.do';
    return fillQ([{ kind: 'list', items: fs.map((f) => [ex(f, u), S(f.r), u]) }], {
      skill, prompt: 'Tính.', sub: SUB_FILL, hint: 'Tính như với các số, rồi viết thêm đơn vị.',
      explain: fs.map((f) => plainU(line(f, u))).join('\n') });
  };
  G.vbtUnitCompare = (unit) => () => {
    const fs = facts(pick(['cong20', 'tru20', 'cong100', 'tru100']), 3);
    const items = fs.map((f) => {
      let c = f.r + pick([-2, -1, 0, 1, 2]);
      if (c < 0) c = f.r;
      return { t: `${f.a} {${unit}} ${f.op} ${f.b} {${unit}}  …  ${c} {${unit}}`, a: sign(f.r, c), c };
    });
    return { type: 'rows', opts: ['>', '<', '='], items, answer: items.map((x) => x.a), skill: unit === 'kg' ? 'kl.kg' : 'dt.lit',
      prompt: '>, <, = ?', sub: 'Tính rồi so sánh.', hint: 'Tính phép tính bên trái trước (nhớ viết đơn vị), rồi so sánh.',
      explain: fs.map((f, i) => `${f.a} ${unit} ${f.op} ${f.b} ${unit} = ${f.r} ${unit}, mà ${f.r} ${items[i].a} ${items[i].c}`).join('\n') };
  };
  // Đổi đơn vị độ dài
  const CONV = [
    () => ['1 {dm} = ', S(10), ' {cm}'], () => ['1 {m} = ', S(10), ' {dm}'], () => ['1 {m} = ', S(100), ' {cm}'], () => ['1 {km} = ', S(1000), ' {m}'],
    () => { const k = rand(2, 9); return [`${k} {dm} = `, S(k * 10), ' {cm}']; },
    () => { const k = rand(2, 9); return [`${k * 10} {cm} = `, S(k), ' {dm}']; },
    () => { const k = rand(2, 9); return [`${k} {m} = `, S(k * 10), ' {dm}']; },
    () => { const k = rand(2, 9); return [`${k * 100} {cm} = `, S(k), ' {m}']; },
  ];
  G.vbtConvert = () => () => {
    const items = U.sample(CONV, 4).map((f) => f());
    return fillQ([{ kind: 'list', cols: 1, items }], {
      skill: 'dd.do', prompt: 'Số?', sub: SUB_FILL, hint: '1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.',
      explain: items.map((it) => plainU(it.map((c) => (typeof c === 'object' ? c.a : c)).join(''))).join('\n') });
  };

  // ================= 12. Thời gian: ngày, giờ, phút, tháng =================
  const MONTHS = [[1, 31], [3, 31], [4, 30], [5, 31], [6, 30], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31]];
  const TIMEF = [
    () => ['1 ngày = ', S(24), ' giờ'], () => ['1 giờ = ', S(60), ' phút'], () => ['1 tuần lễ có ', S(7), ' ngày'],
    () => { const h = rand(1, 6); return [`${h} giờ chiều = `, S(h + 12), ' giờ']; },
    () => { const h = rand(7, 10); return [`${h} giờ tối = `, S(h + 12), ' giờ']; },
    () => { const h = rand(13, 18); return [`${h} giờ = `, S(h - 12), ' giờ chiều']; },
    () => { const [m, d] = pick(MONTHS); return [`Tháng ${m} có `, S(d), ' ngày']; },
  ];
  G.vbtTimeFacts = () => () => {
    const items = U.sample(TIMEF, 4).map((f) => f());
    return fillQ([{ kind: 'list', cols: 1, items }], {
      skill: 'tg.buoi', prompt: 'Số?', sub: SUB_FILL,
      hint: '1 ngày có 24 giờ, 1 giờ có 60 phút. Buổi chiều: thêm 12 (2 giờ chiều là 14 giờ).',
      explain: items.map((it) => it.map((c) => (typeof c === 'object' ? c.a : c)).join('')).join('\n') });
  };
  // Đồng hồ chỉ mấy giờ? Đ/S
  const clockLabel = (hh, mm, alt) => (mm === 0 ? `${hh} giờ` : mm === 30 && alt ? `${hh} giờ rưỡi` : `${hh} giờ ${mm} phút`);
  G.vbtClockTF = () => () => {
    const items = [];
    const used = new Set();
    while (items.length < 3) {
      const hh = rand(1, 12), mm = pick([0, 15, 30]);
      if (used.has(hh * 100 + mm)) continue;
      used.add(hh * 100 + mm);
      const wrong = chance(0.45);
      let lh = hh, lm = mm;
      if (wrong) {
        if (chance(0.5)) lh = hh === 12 ? 11 : hh + 1;
        else lm = pick([0, 15, 30].filter((x) => x !== mm));
      }
      items.push({ html: `<div class="rw-pic">${Svg.clock(hh, mm)}<div class="rw-cap">${clockLabel(lh, lm, chance(0.3))}</div></div>`, a: wrong ? 'S' : 'Đ', hh, mm });
    }
    if (items.every((x) => x.a === 'Đ')) { const x = items[0]; x.a = 'S'; x.html = `<div class="rw-pic">${Svg.clock(x.hh, x.mm)}<div class="rw-cap">${clockLabel(x.hh === 12 ? 11 : x.hh + 1, x.mm)}</div></div>`; }
    return { type: 'rows', items: items.map(({ html, a }) => ({ html, a })), answer: items.map((x) => x.a), skill: 'tg.dongho',
      prompt: 'Đ, S?', sub: 'Đồng hồ chỉ đúng giờ ghi bên dưới thì chọn Đ, sai thì chọn S.',
      hint: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 3 là 15 phút, chỉ số 6 là 30 phút.',
      explain: items.map((x) => `Đồng hồ chỉ ${clockLabel(x.hh, x.mm)}.`).join('\n') };
  };

  // ================= 13. Hình học: khoanh vào / tô màu hình tứ giác; khối trụ, khối cầu =================
  G.vbtShapes = () => () => {
    const nQ = rand(2, 4);
    const quads = U.sample(Svg.QUADS, nQ), others = U.sample(Svg.NONQUADS, 6 - nQ);
    const items = shuffle([...quads.map((n) => ({ n, ok: true })), ...others.map((n) => ({ n, ok: false }))])
      .map((x) => ({ html: Svg.shape(x.n, 6), ok: x.ok }));
    const paint = chance(0.5); // "Tô màu" như trong vở: chọn hình nào thì hình đó được tô màu
    return { type: 'pick', mode: 'pics', paint, items, answer: [`${nQ} hình tứ giác`], answerLabel: `Có ${nQ} hình tứ giác`, skill: 'hh.tugiac',
      prompt: paint ? 'Tô màu các hình tứ giác.' : 'Khoanh vào các hình tứ giác.', sub: `Chạm để ${paint ? 'tô màu' : 'chọn'} tất cả các hình tứ giác, rồi bấm Kiểm tra.`,
      hint: 'Hình tứ giác có 4 cạnh và 4 đỉnh.', explain: `Có ${nQ} hình tứ giác (hình có 4 cạnh).` };
  };
  // Nối điểm, vẽ đoạn thẳng, chọn ba điểm thẳng hàng
  const farEnough = (p, list, d = 46) => list.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) >= d);
  const randPts = (n, w = 320, hgt = 210, pad = 30) => {
    const out = [];
    while (out.length < n) { const p = [rand(pad, w - pad), rand(pad + 10, hgt - pad)]; if (farEnough(p, out)) out.push(p); }
    return out;
  };
  G.vbtConnect = (...kinds) => () => {
    const kind = pick(kinds);
    if (kind === 'seg') {
      const len = rand(2, 9);
      const pts = {};
      for (let i = 0; i <= 10; i++) pts[String(i)] = [24 + i * 28, 40];
      return { type: 'connect', connect: { w: 328, h: 100, pts, mode: 'seg', len }, answer: `${len} cm`, skill: 'hh.do',
        prompt: `Vẽ đoạn thẳng dài ${len} cm.`, sub: 'Chạm vào hai chấm trên thước để vẽ đoạn thẳng.', speak: `Vẽ đoạn thẳng dài ${len} xăng-ti-mét trên thước.`,
        hint: `Bắt đầu từ vạch 0, đếm ${len} xăng-ti-mét.`, explain: `Ví dụ: nối chấm 0 với chấm ${len} được đoạn thẳng dài ${len} cm.` };
    }
    if (kind === 'pick3') {
      for (;;) {
        const [a, b] = randPts(2);
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 150) continue;
        const t = 0.35 + Math.random() * 0.3;
        const m = [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)];
        // điểm trên đường thẳng: tính lại cho thật thẳng hàng sau khi làm tròn
        const pts3 = [a, m, b];
        const others = randPts(6).filter((p) => farEnough(p, pts3, 40)).slice(0, 3);
        if (others.length < 3) continue;
        const all = [...pts3, ...others];
        const col = (p, q2, r) => Math.abs((q2[0] - p[0]) * (r[1] - p[1]) - (q2[1] - p[1]) * (r[0] - p[0]));
        if (Math.abs(col(a, m, b)) >= 1) { m[0] = a[0] + (b[0] - a[0]) / 2; m[1] = a[1] + (b[1] - a[1]) / 2; if (!Number.isInteger(m[0]) || !Number.isInteger(m[1])) continue; }
        // không được có bộ ba thẳng hàng nào khác
        let bad = false;
        for (let i = 0; i < 6 && !bad; i++) for (let j = i + 1; j < 6 && !bad; j++) for (let k = j + 1; k < 6 && !bad; k++) {
          if ([i, j, k].join() === '0,1,2') continue;
          if (col(all[i], all[j], all[k]) < 900) bad = true;
        }
        if (bad) continue;
        const names = shuffle(['A', 'B', 'C', 'D', 'E', 'G']);
        const pts = {};
        all.forEach((p, i) => { pts[names[i]] = p; });
        const target = names.slice(0, 3);
        return { type: 'connect', connect: { w: 320, h: 210, pts, mode: 'pick3', target }, answer: target.slice().sort().join(', '), skill: 'hh.thanghang',
          prompt: 'Chọn ba điểm thẳng hàng.', sub: 'Chạm vào ba điểm cùng nằm trên một đường thẳng, rồi bấm Kiểm tra.',
          hint: 'Ba điểm thẳng hàng khi đặt thước kẻ thì cả ba điểm đều nằm trên mép thước.', explain: `Ba điểm thẳng hàng là: ${target.slice().sort().join(', ')}.` };
      }
    }
    const quad = kind === 'quad';
    const n = quad ? 4 : 4;
    let pts0;
    for (;;) {
      pts0 = randPts(quad ? 4 : 5);
      if (!quad) break;
      // hình tứ giác: xếp 4 điểm theo vòng quanh tâm để nối thành hình không tự cắt
      const cx = pts0.reduce((s, p) => s + p[0], 0) / 4, cy = pts0.reduce((s, p) => s + p[1], 0) / 4;
      pts0.sort((p, q2) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q2[1] - cy, q2[0] - cx));
      break;
    }
    const names = quad ? ['M', 'N', 'P', 'Q'] : ['A', 'B', 'C', 'D', 'E'];
    const pts = {};
    pts0.forEach((p, i) => { pts[names[i]] = p; });
    const target = names.slice(0, n);
    const label = target.join('');
    return { type: 'connect', connect: { w: 320, h: 210, pts, mode: 'path', target, closed: quad }, answer: label, skill: quad ? 'hh.tugiac' : 'hh.gapkhuc',
      prompt: quad ? `Nối các điểm để được hình tứ giác ${label}.` : `Nối các điểm để được đường gấp khúc ${label}.`,
      sub: quad ? 'Chạm lần lượt M, N, P, Q rồi chạm lại M để khép kín hình.' : 'Chạm lần lượt vào các điểm theo đúng thứ tự tên đường gấp khúc.',
      hint: quad ? 'Nối M với N, N với P, P với Q, rồi Q với M.' : `Đường gấp khúc ${label} đi qua các điểm ${target.join(', ')} theo đúng thứ tự (điểm E không dùng).`,
      explain: quad ? `Hình tứ giác ${label} có 4 cạnh: MN, NP, PQ, QM.` : `Đường gấp khúc ${label} gồm các đoạn thẳng ${target.slice(0, -1).map((x, i) => x + target[i + 1]).join(', ')}.` };
  };
  // Quay kim đồng hồ
  G.vbtClockSet = () => () => {
    const hh = rand(1, 12), mm = pick([0, 0, 15, 30]);
    const afternoon = mm === 0 && hh >= 1 && hh <= 9 && chance(0.3);
    const label = afternoon ? `${hh + 12} giờ` : clockLabel(hh, mm, chance(0.3));
    return { type: 'clockset', clock: { h: hh, m: mm }, answer: `${hh}:${String(mm).padStart(2, '0')}`, answerLabel: label, skill: 'tg.dongho',
      prompt: `Quay kim đồng hồ để chỉ ${label}.`, sub: 'Chọn kim dài hay kim ngắn, rồi kéo kim đến đúng chỗ.',
      hint: 'Kim dài chỉ phút, kim ngắn chỉ giờ.',
      explain: (afternoon ? `${hh + 12} giờ là ${hh} giờ chiều. ` : '') + (mm === 0 ? `Kim dài chỉ số 12, kim ngắn chỉ số ${hh}.`
        : `Kim dài chỉ số ${mm / 5}, kim ngắn nằm giữa số ${hh} và số ${hh % 12 + 1}.`) };
  };
  const SOLIDS = {
    cau: { name: 'khối cầu', items: ['⚽', '🏀', '🎾', '🌍', '🍊', '🔮', '🎱', '🏐'] },
    tru: { name: 'khối trụ', items: ['🥫', '🧻', '🥁', '🕯️', '🔋', '🪵'] },
    hop: { name: 'khối hộp chữ nhật', items: ['📦', '🎁', '🧊', '🧃', '🧱'] },
  };
  G.vbtSolids = () => () => {
    const key = pick(['cau', 'tru']);
    const n = rand(2, 3);
    const good = U.sample(SOLIDS[key].items, n);
    const bad = U.sample(Object.keys(SOLIDS).filter((k) => k !== key).flatMap((k) => SOLIDS[k].items), 6 - n);
    const items = shuffle([...good.map((e) => ({ e, ok: true })), ...bad.map((e) => ({ e, ok: false }))])
      .map((x) => ({ html: `<span class="pk-emoji">${x.e}</span>`, ok: x.ok }));
    return { type: 'pick', mode: 'pics', items, answer: good, skill: 'hh.khoi',
      prompt: `Khoanh vào các đồ vật có dạng ${SOLIDS[key].name}.`, sub: 'Chạm để chọn tất cả, rồi bấm Kiểm tra.',
      hint: key === 'cau' ? 'Khối cầu tròn đều như quả bóng, lăn được về mọi phía.' : 'Khối trụ như cái lon: hai đáy là hình tròn.',
      explain: `Các đồ vật có dạng ${SOLIDS[key].name}: ${good.join(' ')}` };
  };

  // ================= 14. Tiền Việt Nam: chọn các tờ tiền để được … đồng =================
  G.vbtMoney = () => () => {
    for (;;) {
      const notes = shuffle([100, 200, 200, 500, 500, 1000, 100, 200]).slice(0, 6);
      const k = rand(2, 3);
      const idx = U.sample(notes.map((_, i) => i), k);
      const total = idx.reduce((s, i) => s + notes[i], 0);
      if (total > 1000) continue;
      const items = notes.map((v, i) => ({ html: Svg.note(v), v, ok: idx.includes(i) }));
      return { type: 'pick', mode: 'pics', items, sum: total, answer: idx.map((i) => notes[i] + ' đồng'), skill: 'tien.vn',
        prompt: `Khoanh vào các tờ tiền để được ${total} đồng.`, sub: 'Chạm để chọn các tờ tiền, rồi bấm Kiểm tra.',
        hint: 'Cộng giá trị các tờ tiền em chọn, xem có đúng bằng số tiền cần có không.',
        explain: `Ví dụ: ${idx.map((i) => notes[i]).join(' + ')} = ${total} (đồng).` };
    }
  };

  // ================= 15. Thống kê: kiểm đếm, biểu đồ tranh, khả năng =================
  const TALLY = [['🍎', 'Táo'], ['🍌', 'Chuối'], ['🍊', 'Cam'], ['🍇', 'Nho'], ['🐱', 'Mèo'], ['🐶', 'Chó'], ['🐰', 'Thỏ'], ['🐔', 'Gà'], ['🚗', 'Ô tô'], ['🚲', 'Xe đạp']];
  G.vbtTally = () => () => {
    const kinds = U.sample(TALLY, 3);
    const ns = kinds.map(() => rand(2, 7));
    return fillQ([{ kind: 'table', head: true, rows: [['Loại', ...kinds.map((k) => k[0])], ['Số lượng', ...ns.map(S)]] }], {
      skill: 'tk.kiemdem', prompt: 'Số?', sub: 'Đếm từng loại trong hình rồi ghi vào bảng.',
      visual: { kind: 'scatter', groups: kinds.map((k, i) => ({ e: k[0], n: ns[i] })) },
      hint: 'Đếm lần lượt từng loại, đếm xong loại nào thì ghi ngay loại đó.',
      explain: kinds.map((k, i) => `${k[1]}: ${ns[i]}`).join('\n') });
  };
  G.vbtPicto = () => () => {
    const kinds = U.sample(TALLY.slice(4, 8), 3);
    const ns = kinds.map(() => rand(2, 7));
    while (ns[0] === ns[1]) ns[1] = rand(2, 7);
    const d = Math.abs(ns[0] - ns[1]);
    const more = ns[0] > ns[1] ? 0 : 1;
    return fillQ([{ kind: 'list', cols: 1, items: [
      ...kinds.map((k, i) => [`Có `, S(ns[i]), ` con ${k[1].toLowerCase()}.`]),
      [`Số con ${kinds[more][1].toLowerCase()} nhiều hơn số con ${kinds[1 - more][1].toLowerCase()} là `, S(d), ' con.']] }], {
      skill: 'tk.bieudo', prompt: 'Số?', sub: 'Đọc biểu đồ tranh rồi điền số.',
      visual: { kind: 'picto', title: 'Các con vật trong vườn', rows: kinds.map((k, i) => ({ icon: k[0], label: k[1], n: ns[i] })), note: 'Mỗi hình chỉ 1 con.' },
      hint: 'Đếm số hình ở mỗi hàng. Muốn biết nhiều hơn bao nhiêu thì lấy số lớn trừ số bé.',
      explain: kinds.map((k, i) => `${k[1]}: ${ns[i]} con`).join('\n') + `\n${Math.max(ns[0], ns[1])} − ${Math.min(ns[0], ns[1])} = ${d}` });
  };
  const CHANCE = [
    ['Hộp chỉ có bi đỏ. Lấy ra 1 viên, được bi đỏ.', 'Chắc chắn'], ['Hộp chỉ có bi đỏ. Lấy ra 1 viên, được bi xanh.', 'Không thể'],
    ['Hộp có bi đỏ và bi xanh. Lấy ra 1 viên, được bi xanh.', 'Có thể'], ['Gieo xúc xắc, được mặt 7 chấm.', 'Không thể'],
    ['Gieo xúc xắc, được mặt 3 chấm.', 'Có thể'], ['Gieo xúc xắc, được mặt có ít hơn 7 chấm.', 'Chắc chắn'],
    ['Sau thứ Hai là thứ Ba.', 'Chắc chắn'], ['Một tuần lễ có 8 ngày.', 'Không thể'], ['Chiều nay trời mưa.', 'Có thể'],
    ['Tung đồng xu, được mặt sấp.', 'Có thể'], ['Túi chỉ có táo. Lấy ra 1 quả, được quả cam.', 'Không thể'],
    ['Bạn Nam sút bóng, bóng vào khung thành.', 'Có thể'], ['Con mèo biết bay.', 'Không thể'], ['Tháng 1 có 31 ngày.', 'Chắc chắn'],
  ];
  G.vbtChance = () => () => {
    const by = (k) => CHANCE.filter((c) => c[1] === k);
    const picks = shuffle([pick(by('Chắc chắn')), pick(by('Có thể')), pick(by('Không thể'))]);
    const items = picks.map(([t, a]) => ({ t, a }));
    return { type: 'rows', opts: ['Chắc chắn', 'Có thể', 'Không thể'], items, answer: items.map((x) => x.a), skill: 'tk.khanang',
      prompt: 'Chọn chắc chắn, có thể hay không thể.', sub: 'Đọc từng dòng rồi chọn khả năng xảy ra.',
      hint: '"Chắc chắn": luôn xảy ra. "Không thể": không bao giờ xảy ra. "Có thể": lúc xảy ra, lúc không.',
      explain: items.map((x) => `${x.t} → ${x.a.toLowerCase()}`).join('\n') };
  };

  // ================= 16. Phép nhân, phép chia =================
  G.vbtMulAdd = () => () => {
    const items = [];
    const used = new Set();
    while (items.length < 4) {
      const k = pick([2, 5]), n = rand(2, 5);
      if (used.has(k * 10 + n)) continue;
      used.add(k * 10 + n);
      const sum = Array(n).fill(k).join(' + ');
      items.push(chance(0.5) ? [`${sum} = ${k} × `, S(n)] : [`${k} × ${n} = `, S(k * n)]);
    }
    return fillQ([{ kind: 'list', cols: 1, items }], {
      skill: 'pt.nhan', prompt: 'Số?', sub: SUB_FILL, hint: '2 + 2 + 2 là 2 được lấy 3 lần, viết là 2 × 3.',
      explain: items.map((it) => it.map((c) => (typeof c === 'object' ? c.a : c)).join('')).join('\n') });
  };
  G.vbtDivFromMul = () => () => {
    const blocks = [];
    const lines = [];
    const used = new Set();
    while (blocks.length < 2) {
      const k = pick([2, 5]), n = rand(2, 9);
      if (n === k || used.has(k * 10 + n)) continue;
      used.add(k * 10 + n);
      blocks.push({ kind: 'list', cols: 1, items: [[`${k} × ${n} = ${k * n}`], [`${k * n} : ${k} = `, S(n)], [`${k * n} : ${n} = `, S(k)]] });
      lines.push(`${k} × ${n} = ${k * n} → ${k * n} : ${k} = ${n}; ${k * n} : ${n} = ${k}`);
    }
    return fillQ([{ kind: 'row', blocks }], {
      skill: 'pt.chia', prompt: 'Số?', sub: 'Từ một phép nhân, viết hai phép chia.', hint: 'Lấy tích chia cho thừa số này thì được thừa số kia.',
      explain: lines.join('\n') });
  };

  // ================= 17. Đặt tính rồi tính (bé tự đặt thẳng cột) =================
  G.vbtColumn = (...fams) => () => {
    const fam = pick(fams);
    const f = FAM[fam]();
    const ex = App.Gen.toanUtil.explainColumn;
    return { type: 'column', col: { a: f.a, b: f.b, op: f.op, res: f.r }, answer: f.r, skill: skillOf(fam, f),
      prompt: 'Đặt tính rồi tính.', big: `${f.a} ${f.op} ${f.b}`, speak: `Đặt tính rồi tính: ${f.a} ${OPW[f.op]} ${f.b}.`,
      hint: hintOf(fam), explain: ex ? ex(f.a, f.b, f.op) : line(f) };
  };

  // ================= 18. Bài giải 3 bước (bọc các bài toán có lời văn sẵn có) =================
  // Lời giải của các bài toán có lời văn đều viết theo mẫu: "Câu lời giải:\na + b = c (đơn vị)\nĐáp số: c tên đơn vị."
  const SOL_RE = /^([\s\S]+?):\n(\d+) ([+−×:]) (\d+) = (\d+) \(([^)]+)\)\nĐáp số: (\d+) (.+)\.$/;
  const flipLine = (s) => (s.includes('còn lại') ? s.replace('còn lại', 'có tất cả') : s.includes('có tất cả') ? s.replace('có tất cả', 'còn lại') : null);
  G.solve = (...gens) => () => {
    for (let t = 0; t < 6; t++) {
      const q = pick(gens)();
      const m = SOL_RE.exec(q.explain || '');
      if (!m) continue;
      const [, ln, a, op, b, res, cls, , ans] = m;
      const lines = [ln], units = [ans];
      const f = flipLine(ln);
      if (f) lines.push(f);
      for (let k = 0; k < 30 && (lines.length < 3 || units.length < 3); k++) {
        const o = SOL_RE.exec(pick(gens)().explain || '');
        if (!o) continue;
        if (lines.length < 3 && !lines.includes(o[1])) lines.push(o[1]);
        if (units.length < 3 && !units.includes(o[8])) units.push(o[8]);
      }
      if (lines.length < 3) continue;
      for (const u of ['cái', 'con', 'quả', 'bạn', 'quyển']) if (units.length < 3 && !units.includes(u)) units.push(u);
      return { type: 'solve', skill: q.skill, prompt: q.prompt.replace(/\nChọn phép tính đúng:$/, ''), speak: q.speak, visual: q.visual,
        sub: 'Làm bài giải như trong vở: câu lời giải, phép tính, đáp số.', hint: q.hint,
        solve: { a: +a, op, b: +b, res: +res, line: ln, lines, cls, ans, units, ops: op === '×' || op === ':' ? ['×', ':'] : ['+', '−'] },
        answer: +res, explain: q.explain };
    }
    return pick(gens)();
  };
})(window.App);
