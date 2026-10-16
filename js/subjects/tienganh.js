/* Tiếng Anh 2 – Global Success: bản đồ chặng.
   Mỗi Unit có 3 chặng như 3 Lesson trong sách, mỗi chặng chia các hoạt động như sách:
   - Lesson 1: 🎧 Listen and repeat · 👉 Point and say (từ mới, chữ cái – âm)
   - Lesson 2: 🎵 Listen and chant · ✔️ Listen and tick · ✏️ Look and write
   - Lesson 3: 🎧 Listen and repeat (mẫu câu) · 💬 Let's talk · 🎤 Let's sing
   Sau Unit 2, 6, 10, 14 có Fun time; sau Unit 4, 8, 12, 16 có Review – giống thứ tự trong sách. */
(function (App) {
  'use strict';
  const E = App.Gen.ta;
  const D = App.TAData;
  App.Curriculum = App.Curriculum || {};

  const ws = (...ns) => ns.flatMap((n) => D.units[n].words);
  const L = (id, short, name, icon, ...sections) => ({ id, short, name, icon, sections, plan: sections.flatMap((s) => s.plan) });
  const sec = (label) => (...plan) => ({ label, plan });
  const REP = sec('🎧 Listen and repeat'), POINT = sec('👉 Point and say'), CHANT = sec('🎵 Listen and chant'), TICK = sec('✔️ Listen and tick'),
    WRITE = sec('✏️ Look and write'), TALK = sec("💬 Let's talk"), SING = sec("🎤 Let's sing");

  // Mẫu câu Lesson 2 (vè, bài nghe) và Lesson 3 (mẫu câu chính, bài hát) của từng Unit
  const L2 = { 1: ['u1.like'], 2: ['u2.have'], 3: ['u3.see'], 4: ['u4.there'], 5: ['u5.doing'], 6: ['u6.see'], 7: ['u7.like'], 8: ['u8.this'],
    9: ['u9.want'], 10: ['u10.that'], 11: ['u11.she'], 12: ['u12.on'], 13: ['u13.num'], 14: ['u14.my'], 15: ['u15.look'], 16: ['u16.pos'] };
  const L3 = { 1: ['u1.yummy'], 2: ['u2.act'], 3: ['u3.look'], 4: ['u4.see'], 5: ['u5.doing'], 6: ['u6.see'], 7: ['u7.pass'], 8: ['u8.this'],
    9: ['u9.want'], 10: ['u10.that'], 11: ['u11.they'], 12: ['u12.on'], 13: ['u13.num'], 14: ['u14.my'], 15: ['u15.look'], 16: ['u16.pos'] };
  // Phần "Let's talk" (hỏi – đáp) riêng của từng Unit
  const TALKS = {
    1: [[E.tplPick('u1.yummy'), 1], [E.tplFill('u1.yummy', 'u1.like'), 1]],
    2: [[E.talkWrap(E.u2()), 2], [E.tplPick('u2.act'), 1]],
    3: [[E.tplPick('u3.look', 'u3.see'), 1], [E.tplFill('u3.look'), 1]],
    4: [[E.talk('u4.see'), 2], [E.qaPick('u4.see'), 1]],
    5: [[E.talkWrap(E.u5()), 2], [E.tplFill('u5.doing'), 1]],
    6: [[E.talkWrap(E.u6()), 2], [E.tplFill('u6.see'), 1]],
    7: [[E.tplPick('u7.pass'), 1], [E.answerPick(7), 1], [E.tplFill('u7.pass'), 1]],
    8: [[E.talkWrap(E.u8()), 2], [E.tplFill('u8.this'), 1]],
    9: [[E.talk('u9.want'), 1], [E.talkWrap(E.u9()), 1], [E.tplFill('u9.want'), 1]],
    10: [[E.talkWrap(E.u10()), 2], [E.tplPick('u10.that'), 1]],
    11: [[E.tplPick('u11.they', 'u11.she'), 1], [E.tplFill('u11.they', 'u11.she'), 1]],
    12: [[E.u12be(), 1], [E.tplPick('u12.on'), 1], [E.tplFill('u12.on'), 1]],
    13: [[E.talk('u13.num'), 2], [E.numWord(11, 15), 1], [E.answerPick(13), 1]],
    14: [[E.talkWrap(E.u14()), 2], [E.tplPick('u14.my'), 1]],
    15: [[E.answerPick(15), 1], [E.tplPick('u15.look'), 1], [E.tplFill('u15.look'), 1]],
    16: [[E.talkWrap(E.u16qa()), 2], [E.u16pick(), 1]],
  };

  function lesson1(n) {
    const u = D.units[n], w = ws(n);
    if (n === 13 || n === 14) {
      const [lo, hi] = n === 13 ? [11, 15] : [16, 20];
      return L(`u${n}a`, `Unit ${n} · Lesson 1`, `${u.title} – ${u.vi}`, u.icon,
        REP([E.numListen(lo, hi), 2], [n === 14 ? E.listenPick(...w) : E.numCount(lo, hi), 1]),
        POINT([E.say(...w), 2], [E.picWord(...w), 1], [E.numMatch(lo, hi), 1]));
    }
    return L(`u${n}a`, `Unit ${n} · Lesson 1`, `${u.title} – ${u.vi}`, u.icon,
      REP([E.listenPick(...w), 2], [E.listenLetter(...w), 1]),
      POINT([E.say(...w), 2], [E.picWord(...w), 1], [E.match('pic', ...w), 1]));
  }
  function lesson2(n) {
    const u = D.units[n], w = ws(n);
    return L(`u${n}m`, `Unit ${n} · Lesson 2`, `${u.title} – ${u.vi}`, '🎵',
      CHANT([E.chant(n, ...L2[n]), 1]),
      TICK([E.tplListen(...L2[n]), 1], [E.listenOrder(...w), 1], [n === 13 ? E.numMatch(11, 15) : E.soundPick(...w), 1]),
      WRITE([E.lookWrite(...w), 1], [E.spell(...w), 1], [n >= 13 && n <= 14 ? E.match('pic', ...w) : E.letter(...w), 1]));
  }
  function lesson3(n) {
    const u = D.units[n];
    return L(`u${n}b`, `Unit ${n} · Lesson 3`, `${u.title} – ${u.vi}`, u.icon2,
      REP([E.tplListen(...L3[n]), 1], [E.sayTpl(...L3[n]), 1]),
      TALK(...TALKS[n], [E.tplOrder(...L3[n], ...L2[n]), 1]),
      SING([E.song(...L3[n]), 1], [E.tplMeaning(...L3[n]), 1]));
  }
  const unit = (n) => [lesson1(n), lesson2(n), lesson3(n)];

  // Fun time: trò chơi ôn từ của hai Unit vừa học
  function fun(k, a, b) {
    const w = ws(a, b);
    return { id: `f${k}`, short: `Fun time ${k}`, name: `Vui học cùng Unit ${a} và Unit ${b}`, icon: ['🎈', '🎲', '🎯', '🎮'][k - 1], shuffle: true,
      plan: [[E.findWords(...w), 1], [E.listenPick(...w), 1], [E.match('pic', ...w), 1], [E.readTick(...L3[a], ...L3[b]), 1], [E.lookWrite(...w), 1],
        [E.spell(...w), 1], [E.soundPick(...w), 1], [E.listenOrder(...w), 1], [E.meaningRev(...w), 1]] };
  }
  // Review: ôn cả bốn Unit (có đọc câu và đánh dấu ✓ ✗ như phần Phil and Sue)
  function review(k, units, extra) {
    const w = ws(...units);
    return { id: `r${k}`, short: `Review ${k}`, name: `Ôn tập Unit ${units[0]}–${units[units.length - 1]}`, icon: ['🚩', '🏅', '🏆', '🎓'][k - 1],
      review: true, shuffle: true,
      plan: [[E.listenPick(...w), 1], [E.picWord(...w), 1], [E.findWords(...w), 1], [E.readTick(...units.flatMap((n) => L3[n])), 1], [E.soundPick(...w), 1], ...extra] };
  }

  App.Curriculum.ta = {
    id: 'ta',
    name: 'Tiếng Anh',
    world: 'Lâu Đài English',
    icon: '🏰',
    deco: ['🎈', '🌟', '🎠', '🎪', '🦄', '🎵', '🌈', '🎨'],
    topics: [
      // ======================= HỌC KÌ 1 =======================
      { id: 't1', short: 'Unit 1–4', name: 'Tiệc vui, sân nhà, biển xanh, đồng quê', icon: '🎈', stages: [
        ...unit(1), ...unit(2), fun(1, 1, 2), ...unit(3), ...unit(4),
        review(1, [1, 2, 3, 4], [[E.tplPick('u1.yummy', 'u3.look', 'u4.there'), 1], [E.talkWrap(E.u2()), 1], [E.talk('u4.see'), 1],
          [E.tplOrder('u1.like', 'u2.have', 'u3.see'), 1]]),
      ] },
      { id: 't2', short: 'Unit 5–8', name: 'Lớp học, nông trại, nhà bếp, làng quê', icon: '🏫', stages: [
        ...unit(5), ...unit(6), fun(2, 5, 6), ...unit(7), ...unit(8),
        review(2, [5, 6, 7, 8], [[E.talkWrap(E.u5()), 1], [E.talkWrap(E.u6()), 1], [E.u8(), 1], [E.tplPick('u7.pass', 'u8.this', 'u6.see'), 1], [E.answerPick(5, 6, 7, 8), 1]]),
      ] },

      // ======================= HỌC KÌ 2 =======================
      { id: 't3', short: 'Unit 9–12', name: 'Cửa hàng, sở thú, sân chơi, quán cà phê', icon: '🦁', stages: [
        ...unit(9), ...unit(10), fun(3, 9, 10), ...unit(11), ...unit(12),
        review(3, [9, 10, 11, 12], [[E.talk('u9.want'), 1], [E.talkWrap(E.u10()), 1], [E.tplListen('u11.they'), 1], [E.tplPick('u12.on', 'u10.that'), 1],
          [E.answerPick(9, 10), 1]]),
      ] },
      { id: 't4', short: 'Unit 13–16', name: 'Số đếm, gia đình, quần áo, cắm trại', icon: '🏕️', stages: [
        ...unit(13), ...unit(14),
        { id: 'f4', short: 'Fun time 4', name: 'Vui học cùng Unit 13 và Unit 14', icon: '🎮', shuffle: true,
          plan: [[E.numListen(11, 20), 1], [E.numMatch(11, 20), 1], [E.findWordsMore(ws(14), ws(13)), 1], [E.readTick('u13.num', 'u14.my'), 1], [E.lookWrite(...ws(13, 14)), 1],
            [E.numCount(11, 20), 1], [E.wordPic(...ws(14)), 1], [E.talkWrap(E.u14()), 1]] },
        ...unit(15), ...unit(16),
        review(4, [13, 14, 15, 16], [[E.talk('u13.num'), 1], [E.talkWrap(E.u14()), 1], [E.tplPick('u15.look', 'u14.my'), 1], [E.talkWrap(E.u16qa()), 1],
          [E.answerPick(13, 14, 15, 16), 1]]),
      ] },
    ],
  };
})(window.App);
