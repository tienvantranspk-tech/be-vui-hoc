/* Đảo Lập Trình: phần logic (không vẽ giao diện, chạy được cả ngoài trình duyệt để kiểm tra các màn chơi).
   Một màn chơi: { id, map: ['S..', '..G'], cards: 'RD', bug: 'RRU' (chương trình có lỗi, nếu có) }
   Kí hiệu bản đồ: S chỗ xuất phát · G đích · o xu · . đường đi · # cây · ^ đá · ~ nước
   Thẻ lệnh: U lên · D xuống · L trái · R phải */
(function (App) {
  'use strict';
  const DIR = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  const BLOCK = { '#': 'tree', '^': 'rock', '~': 'water' };

  function parse(lv) {
    const rows = lv.map;
    const g = { w: rows[0].length, h: rows.length, rows, coins: [], cards: lv.cards.split(''), start: null, goal: null };
    rows.forEach((row, y) => row.split('').forEach((ch, x) => {
      if (ch === 'S') g.start = { x, y };
      else if (ch === 'G') g.goal = { x, y };
      else if (ch === 'o') g.coins.push({ x, y });
    }));
    g.allCoins = (1 << g.coins.length) - 1;
    return g;
  }
  const begin = (g) => ({ x: g.start.x, y: g.start.y, mask: 0 });
  const isWin = (g, s) => s.x === g.goal.x && s.y === g.goal.y && s.mask === g.allCoins;
  const skey = (s) => `${s.x},${s.y},${s.mask}`;

  // Đi một thẻ: trả về vị trí mới. Đụng vật cản hoặc ra ngoài bàn thì có thêm bump
  function move(g, s, card) {
    const [dx, dy] = DIR[card];
    const x = s.x + dx, y = s.y + dy;
    if (x < 0 || y < 0 || x >= g.w || y >= g.h) return { ...s, bump: 'edge' };
    const hit = BLOCK[g.rows[y][x]];
    if (hit) return { ...s, bump: hit };
    const coin = g.coins.findIndex((c) => c.x === x && c.y === y);
    const mask = coin >= 0 ? s.mask | (1 << coin) : s.mask;
    return { x, y, mask, coin: coin >= 0 && !(s.mask & (1 << coin)) ? coin : -1 };
  }

  // Đường ngắn nhất từ vị trí s tới đích (đã nhặt đủ xu), chỉ dùng các thẻ có trong màn. null nếu không tới được
  function solve(g, s = begin(g)) {
    if (isWin(g, s)) return [];
    const seen = new Set([skey(s)]);
    let layer = [{ s, path: [] }];
    while (layer.length) {
      const next = [];
      for (const { s: cur, path } of layer) {
        for (const c of g.cards) {
          const n = move(g, cur, c);
          if (n.bump || seen.has(skey(n))) continue;
          const p = path.concat(c);
          if (isWin(g, n)) return p;
          seen.add(skey(n));
          next.push({ s: n, path: p });
        }
      }
      layer = next;
    }
    return null;
  }
  const dist = (g, s) => { const p = solve(g, s); return p ? p.length : Infinity; };

  // Số thẻ của lời giải gọn nhất, và số ô lệnh tối đa của màn
  const par = (lv) => solve(parse(lv)).length;
  const maxCards = (lv) => Math.min(18, Math.max(par(lv) + 4, (lv.bug || '').length + 3, 7));

  // Chạy chương trình: trả về từng bước để giao diện diễn lại, và kết quả
  // outcome: 'win' tới đích · 'bump' đụng vật cản · 'coins' tới đích mà còn thiếu xu · 'short' hết thẻ mà chưa tới
  function run(lv, prog) {
    const g = parse(lv);
    let s = begin(g);
    const steps = [];
    for (let i = 0; i < prog.length; i++) {
      const n = move(g, s, prog[i]);
      if (n.bump) {
        steps.push({ i, x: s.x, y: s.y, bump: n.bump, card: prog[i] });
        return { outcome: 'bump', at: i, steps, bump: n.bump };
      }
      s = n;
      const win = isWin(g, s);
      steps.push({ i, x: s.x, y: s.y, coin: n.coin, win });
      if (win) return { outcome: 'win', at: i, steps };
    }
    const atGoal = s.x === g.goal.x && s.y === g.goal.y;
    const missing = g.coins.length - steps.filter((x) => x.coin >= 0).length;
    return { outcome: atGoal ? 'coins' : 'short', at: prog.length - 1, steps, missing };
  }

  // Số thẻ đầu tiên của chương trình đi đúng theo một đường ngắn nhất, và vị trí sau các thẻ đó
  function onTrack(g, prog) {
    let s = begin(g), k = 0;
    for (const c of prog) {
      if (isWin(g, s)) break;
      const n = move(g, s, c);
      if (n.bump || dist(g, n) !== dist(g, s) - 1) break;
      s = n;
      k++;
    }
    return { k, s };
  }

  // Gợi ý một việc cần làm tiếp theo: tìm thẻ đầu tiên làm bạn đi lệch khỏi đường ngắn nhất,
  // thử đổi, bỏ hoặc chèn thẻ tại đó, chọn cách giữ được nhiều thẻ đúng nhất ở phía sau.
  // { kind: 'change' đổi thẻ i thành card · 'remove' bỏ thẻ i · 'insert' thêm card vào trước thẻ i · 'add' thêm card vào cuối }
  function hint(lv, prog) {
    const g = parse(lv);
    const { k: i, s } = onTrack(g, prog);
    if (i >= prog.length) return isWin(g, s) ? null : { kind: 'add', card: solve(g, s)[0] };
    if (isWin(g, s)) return { kind: 'remove', i }; // đã tới đích, các thẻ sau là thừa
    const d = dist(g, s);
    const best = g.cards.filter((c) => { const n = move(g, s, c); return !n.bump && dist(g, n) === d - 1; });
    const edit = (cut, add) => [...prog.slice(0, i), ...add, ...prog.slice(i + cut)];
    const options = best.map((card) => ({ kind: 'change', i, card, p: edit(1, [card]) }));
    options.push({ kind: 'remove', i, p: edit(1, []) });
    if (prog.length < maxCards(lv)) best.forEach((card) => options.push({ kind: 'insert', i, card, p: edit(0, [card]) }));
    const score = (o) => 2 * onTrack(g, o.p).k - o.p.length;
    const top = options.reduce((a, b) => (score(b) > score(a) ? b : a));
    return { kind: top.kind, i, card: top.card };
  }

  App.Code = { DIR, parse, begin, move, solve, par, maxCards, run, hint };
})(typeof window !== 'undefined' ? (window.App = window.App || {}) : globalThis.App);
