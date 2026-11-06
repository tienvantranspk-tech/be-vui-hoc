/* Đảo Lập Trình: bé xếp thẻ lệnh rồi bấm Chạy để thú cưng đi trên bàn ô.
   Mục tiêu chính là rèn tư duy logic: nhẩm chương trình trong đầu, đoán trước kết quả, tìm chỗ sai rồi tự sửa.
   Không phải câu hỏi đúng/sai: chạy thử bao nhiêu lần cũng được, giải xong mới sang màn sau.
   Ba sao dành cho lời giải gọn (ít thẻ nhất, không cần gợi ý).
   Ba kiểu màn: tự xếp thẻ · bug: sửa chương trình có lỗi · guess + prog: đoán ô bạn ấy sẽ dừng lại trước khi chạy.
   Kí hiệu bản đồ và thẻ lệnh: xem js/games/code-core.js. Thêm màn mới chỉ cần thêm dữ liệu ở đây.
   Mỗi màn được kiểm tra tự động: giải được, chương trình có lỗi thì chạy không tới đích. */
(function (App) {
  'use strict';
  const ALL = 'UDLR';

  // ===== Thế giới 1: Đi đúng thứ tự =====
  const W1 = [
    { id: 's1', short: 'Chặng 1', name: 'Những bước đầu tiên', icon: '👣', levels: [
      { id: 'a1', map: ['S.G'], cards: 'R', coach: true, say: 'Chạm thẻ ➡️ hai lần, rồi bấm ▶️ Chạy.' },
      { id: 'a2', map: ['S...G'], cards: 'R', say: 'Mỗi thẻ ➡️ đi một ô. Cần mấy thẻ để tới {food}?' },
      { id: 'a3', map: ['S..', '..G'], cards: 'RD', say: 'Có thêm thẻ ⬇️ rồi! Dẫn {pet} tới {food} nhé.' },
    ] },
    { id: 's2', short: 'Chặng 2', name: 'Đi đường vòng', icon: '🌳', levels: [
      { id: 'b1', map: ['S#G', '...'], cards: ALL, say: 'Có cây chắn đường! Tìm đường vòng cho {pet} nhé.' },
      { id: 'b2', map: ['G..', '~~.', 'S..'], cards: ALL },
      { id: 'b3', map: ['..G', '.##', '...', '##S'], cards: ALL },
    ] },
    { id: 's3', short: 'Chặng 3', name: 'Đoán xem bạn đi đâu', icon: '🧠', levels: [
      { id: 'i1', map: ['S...', '....', '...G'], cards: ALL, guess: true, prog: 'RRD',
        say: '🧠 Chưa chạy vội! Nhẩm từng thẻ trong đầu, rồi chạm vào ô {pet} sẽ dừng lại.' },
      { id: 'i2', map: ['S.#.', '..#.', '....', '...G'], cards: ALL, guess: true, prog: 'DDRR' },
      { id: 'i3', map: ['S..#', '.#..', '....', '#..G'], cards: ALL, guess: true, prog: 'RRDDL', say: '🧠 Năm thẻ liền! Chỉ tay vào bàn và đi theo từng thẻ nhé.' },
    ] },
    { id: 's4', short: 'Chặng 4', name: 'Nhặt xu trên đường', icon: '🪙', levels: [
      { id: 'c1', map: ['S.o.G'], cards: ALL, say: 'Đi qua ô có xu 🪙 là nhặt được xu. Nhặt xu rồi tới {food} nhé!' },
      { id: 'c2', map: ['S.o', '^.^', 'G..'], cards: ALL, say: 'Xu nằm ở ngõ cụt. Nhặt xu xong phải quay lại đó!' },
      { id: 'c3', map: ['.o.', 'S#G', '.o.'], cards: ALL, say: 'Có hai xu! {pet} chỉ chịu ăn khi đã nhặt hết xu.' },
    ] },
    { id: 's5', short: 'Chặng 5', name: 'Mê cung', icon: '🌀', review: true,
      task: { title: 'Trò chơi Rô-bốt', ico: '🤖', doneLabel: '✅ Con chơi xong rồi',
        detail: 'Bố mẹ làm rô-bốt, bé ra lệnh từng bước (tiến 1 bước, rẽ trái, rẽ phải) để dẫn rô-bốt từ bàn ra tới cửa. Lệnh sai thì rô-bốt đi sai, bé sửa lại lệnh.' },
      levels: [
        { id: 'd1', map: ['S.#..', '.##.#', '...oG'], cards: ALL },
        { id: 'd2', map: ['S^...', '.^.^.', '...^G'], cards: ALL },
        { id: 'd3', map: ['..o#G', '.#.#.', 'S#...'], cards: ALL },
      ] },
  ];

  // ===== Thế giới 2: Thám tử tìm lỗi (đã có sẵn chương trình bị lỗi, bé tìm và sửa) =====
  const W2 = [
    { id: 's1', short: 'Chặng 1', name: 'Thẻ đi sai', icon: '🔎', levels: [
      { id: 'e1', map: ['S..', '..G'], cards: ALL, bug: 'RRU',
        say: '🕵️ Chương trình này có lỗi! Bấm ▶️ Chạy xem sao. Chạm thẻ sai, bấm 🗑️ bỏ đi, rồi chọn thẻ đúng.' },
      { id: 'e2', map: ['S#G', '...'], cards: ALL, bug: 'DRRD' },
      { id: 'e3', map: ['G..', '##.', 'S..'], cards: ALL, bug: 'RRUURL' },
    ] },
    { id: 's2', short: 'Chặng 2', name: 'Thẻ thừa', icon: '✂️', levels: [
      { id: 'f1', map: ['S..', '~~.', 'G..'], cards: ALL, bug: 'RRRDDLL',
        say: '🕵️ Có một thẻ bị thừa. Chạm thẻ đó rồi bấm 🗑️ nhé!' },
      { id: 'f2', map: ['.#G', '.#.', 'S..'], cards: ALL, bug: 'RRDUU' },
      { id: 'f3', map: ['S...', '###.', 'G...'], cards: ALL, bug: 'RRRLDDLLL',
        say: '🕵️ Có khi {pet} đụng cây ở thẻ này, nhưng thẻ sai lại nằm trước đó. Nhìn kĩ nhé!' },
    ] },
    { id: 's3', short: 'Chặng 3', name: 'Thẻ thiếu', icon: '🧩', levels: [
      { id: 'g1', map: ['S..', '..#', '#.G'], cards: ALL, bug: 'RDR',
        say: '🕵️ Thiếu một thẻ. Chạm vào thẻ đứng trước chỗ thiếu, rồi chọn thẻ mới: thẻ mới sẽ chen vào ngay sau.' },
      { id: 'g2', map: ['S.#.G', '#.#.#', '#...#'], cards: ALL, bug: 'RDDRRUR' },
      { id: 'g3', map: ['S.o', '..#', 'G..'], cards: ALL, bug: 'RRLDD' },
    ] },
    { id: 's4', short: 'Chặng 4', name: 'Đoán chỗ dừng', icon: '🧠', levels: [
      { id: 'j1', map: ['S.#.', '...G'], cards: ALL, guess: true, prog: 'RRD',
        say: '🧠 Gặp vật cản là {pet} dừng luôn, các thẻ sau không chạy nữa. {pet} dừng ở ô nào?' },
      { id: 'j2', map: ['S..', '#..', 'G..'], cards: ALL, guess: true, prog: 'RDLLD' },
      { id: 'j3', map: ['S.o.', '.#..', '....', '..#G'], cards: ALL, guess: true, prog: 'RRRDDLD' },
    ] },
    { id: 's5', short: 'Chặng 5', name: 'Thám tử tài ba', icon: '🏆', review: true,
      task: { title: 'Thám tử trong nhà', ico: '🕵️', doneLabel: '✅ Con tìm ra lỗi rồi',
        detail: 'Bố mẹ viết các bước đánh răng ra giấy nhưng cố tình đảo sai một bước. Bé tìm bước sai và sắp lại cho đúng thứ tự.' },
      levels: [
        { id: 'h1', map: ['S#...', '.#.#.', '...#G'], cards: ALL, bug: 'DRRRUURRD', say: '🕵️ Khó rồi đây: chương trình này có tới hai lỗi!' },
        { id: 'h2', map: ['..o^G', '.^.^.', 'S^...'], cards: ALL, bug: 'UURDDRRU', say: '🕵️ Hai lỗi nữa! Sửa xong lỗi này thì chạy lại để tìm lỗi kia.' },
        { id: 'h3', map: ['.o.', 'S#G', '.o.'], cards: ALL, bug: 'URRDLRD', say: '🕵️ Màn cuối! {pet} chỉ chịu ăn khi đã nhặt hết xu.' },
      ] },
  ];

  const soon = (n) => App.U ? Array.from({ length: n }, (_, i) => ({ id: 'x' + (i + 1), short: `Chặng ${i + 1}`, name: 'Sắp có', icon: '🚧' })) : [];

  // Lời đề bài: thay tên thú cưng, món khoái khẩu; lời đọc thì đổi mũi tên thành chữ và bỏ biểu tượng
  const ARROW = { '⬆️': 'lên', '⬇️': 'xuống', '⬅️': 'trái', '➡️': 'phải' };
  const clean = (t) => t.replace(/[⬆⬇⬅➡]️/g, (m) => ARROW[m] || '')
    .replace(/\p{Extended_Pictographic}|️/gu, '').replace(/\s+/g, ' ').trim();
  function who() {
    const pet = App.Store.state.pet;
    const food = App.Data.foods.find((f) => f.id === App.Rewards.petKind(pet).fav) || App.Data.foods[0];
    return { pet: pet.name, food: food.name.toLowerCase(), goal: food.emoji };
  }
  function toQuestion(lv) {
    const w = who();
    const debug = !!lv.bug;
    const think = '🧠 Nhẩm từng thẻ trong đầu, rồi chạm vào ô {pet} sẽ dừng lại.';
    const coins = lv.map.join('').includes('o');
    const base = lv.say || (lv.guess ? think : debug ? '🕵️ Chương trình có lỗi. Bấm ▶️ Chạy xem sao, rồi sửa giúp {pet} nhé!'
      : coins ? 'Nhặt hết xu 🪙 rồi dẫn {pet} tới {food}!' : 'Dẫn {pet} tới {food} nhé!');
    const prompt = base.replace(/\{pet\}/g, w.pet).replace(/\{food\}/g, w.food);
    return { type: 'code', noStat: true, answer: 'code:' + lv.id, skill: lv.guess ? 'code.guess' : debug ? 'code.debug' : 'code.seq',
      level: lv, goal: w.goal, split: true, prompt, speak: clean(prompt), autoSpeak: true };
  }
  const tasksOn = () => App.Store.state.settings.parentTasks !== false;
  function toTask(task) {
    return { type: 'task', noStat: true, answer: 'task:code:' + task.title, skill: 'code.task', task: { kind: 'write', ...task },
      prompt: '👨‍👩‍👧 Nhiệm vụ cùng bố mẹ: chơi không cần máy!', speak: `Nhiệm vụ cùng bố mẹ: ${task.title}. ${task.detail}` };
  }
  const stageOf = (s) => ({ ...s,
    plan: s.levels.map((lv) => [() => toQuestion(lv), 1]), // để bản đồ đếm số màn
    make() {
      const qs = s.levels.map(toQuestion);
      if (s.task && tasksOn()) qs.push(toTask(s.task));
      qs.forEach((q, k) => { q._no = k + 1; });
      return qs;
    } });

  App.Curriculum = App.Curriculum || {};
  App.Curriculum.code = {
    id: 'code',
    name: 'Lập trình',
    world: 'Đảo Lập Trình',
    icon: '🤖',
    unit: 'màn',
    deco: ['⚙️', '🔧', '💡', '🧩', '🔋', '📡', '🛰️', '🔩'],
    topics: [
      { id: 't1', short: 'Thế giới 1', name: 'Đi đúng thứ tự', icon: '🧭', idea: 'Trình tự: nhẩm từng bước trong đầu, đoán trước kết quả.', stages: W1.map(stageOf) },
      { id: 't2', short: 'Thế giới 2', name: 'Thám tử tìm lỗi', icon: '🕵️', idea: 'Gỡ lỗi: lần theo từng bước để tìm chỗ sai và tự sửa.', stages: W2.map(stageOf) },
      { id: 't3', short: 'Thế giới 3', name: 'Quay hướng', icon: '🔄', stages: soon(3) },
      { id: 't4', short: 'Thế giới 4', name: 'Vòng lặp', icon: '🔁', stages: soon(3) },
      { id: 't5', short: 'Thế giới 5', name: 'Bút vẽ', icon: '✏️', stages: soon(3) },
    ],
  };
})(typeof window !== 'undefined' ? window.App : globalThis.App);
