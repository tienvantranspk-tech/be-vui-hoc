/* Tiếng Anh 2 – Global Success: bản đồ chặng.
   Mỗi Unit có 2 chặng: (1) Từ mới – nghe, nhận chữ cái và âm, xếp chữ (Lesson 1–2); (2) Mẫu câu – hỏi đáp theo hình (Lesson 3).
   Sau Unit 2, 6, 10, 14 có Fun time; sau Unit 4, 8, 12, 16 có Review – giống thứ tự trong sách. */
(function (App) {
  'use strict';
  const E = App.Gen.ta;
  const D = App.TAData;
  App.Curriculum = App.Curriculum || {};

  const ws = (...ns) => ns.flatMap((n) => D.units[n].words);

  // Chặng 1 của Unit: từ mới, chữ cái – âm
  function words(n, plan) {
    const u = D.units[n], w = ws(n);
    return { id: `u${n}a`, short: `Unit ${n} · Từ mới`, name: `${u.title} – ${u.vi}`, icon: u.icon,
      plan: plan || [[E.listenPick(...w), 2], [E.picWord(...w), 1], [E.meaning(...w), 1], [E.letter(...w), 2],
        [E.listenLetter(...w), 1], [E.spell(...w), 1], [E.match('pic', ...w), 1]] };
  }
  // Chặng 2 của Unit: mẫu câu
  function sents(n, plan) {
    const u = D.units[n];
    return { id: `u${n}b`, short: `Unit ${n} · Mẫu câu`, name: `${u.title} – ${u.vi}`, icon: u.icon2, plan };
  }
  // Fun time: trò chơi ôn từ của hai Unit vừa học
  function fun(k, a, b) {
    const w = ws(a, b);
    return { id: `f${k}`, short: `Fun time ${k}`, name: `Vui học cùng Unit ${a} và Unit ${b}`, icon: ['🎈', '🎲', '🎯', '🎮'][k - 1], shuffle: true,
      plan: [[E.listenPick(...w), 2], [E.match('pic', ...w), 1], [E.match('vi', ...w), 1], [E.spell(...w), 2], [E.soundPick(...w), 1],
        [E.wordPic(...w), 1], [E.meaningRev(...w), 1]] };
  }
  // Review: ôn cả bốn Unit
  function review(k, units, extra) {
    const w = ws(...units);
    return { id: `r${k}`, short: `Review ${k}`, name: `Ôn tập Unit ${units[0]}–${units[units.length - 1]}`, icon: ['🚩', '🏅', '🏆', '🎓'][k - 1],
      review: true, shuffle: true,
      plan: [[E.listenPick(...w), 2], [E.picWord(...w), 1], [E.letter(...w), 1], [E.soundPick(...w), 1], ...extra] };
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
        words(1),
        sents(1, [[E.tplPick('u1.yummy', 'u1.like'), 2], [E.tplFill('u1.yummy', 'u1.like'), 2], [E.tplListen('u1.yummy', 'u1.like'), 2],
          [E.tplOrder('u1.yummy', 'u1.like'), 2], [E.tplMeaning('u1.yummy', 'u1.like'), 1]]),
        words(2),
        sents(2, [[E.u2(), 3], [E.tplPick('u2.act', 'u2.have'), 1], [E.tplFill('u2.act'), 1], [E.tplListen('u2.act', 'u2.have'), 2],
          [E.tplOrder('u2.act', 'u2.have'), 1], [E.tplMeaning('u2.have', 'u2.act'), 1]]),
        fun(1, 1, 2),
        words(3),
        sents(3, [[E.tplPick('u3.look', 'u3.see'), 2], [E.tplFill('u3.look', 'u3.see'), 2], [E.tplListen('u3.look', 'u3.see'), 2],
          [E.tplOrder('u3.look', 'u3.see'), 2], [E.tplMeaning('u3.look', 'u3.see'), 1]]),
        words(4),
        sents(4, [[E.qaPick('u4.see'), 2], [E.tplPick('u4.there'), 1], [E.tplFill('u4.see', 'u4.there'), 2], [E.tplListen('u4.see', 'u4.there'), 2],
          [E.tplOrder('u4.see', 'u4.there'), 1], [E.tplMeaning('u4.see', 'u4.there'), 1]]),
        review(1, [1, 2, 3, 4], [[E.tplPick('u1.yummy', 'u3.look', 'u4.there'), 2], [E.u2(), 1], [E.qaPick('u4.see'), 1],
          [E.tplOrder('u1.like', 'u2.have', 'u3.see'), 1]]),
      ] },
      { id: 't2', short: 'Unit 5–8', name: 'Lớp học, nông trại, nhà bếp, làng quê', icon: '🏫', stages: [
        words(5),
        sents(5, [[E.u5(), 3], [E.tplPick('u5.doing'), 1], [E.tplFill('u5.doing'), 2], [E.tplListen('u5.doing'), 1], [E.tplOrder('u5.doing'), 1],
          [E.tplMeaning('u5.doing'), 1]]),
        words(6),
        sents(6, [[E.u6(), 3], [E.tplPick('u6.see'), 1], [E.tplFill('u6.see'), 2], [E.tplListen('u6.see'), 1], [E.tplOrder('u6.see'), 1],
          [E.tplMeaning('u6.see'), 1]]),
        fun(2, 5, 6),
        words(7),
        sents(7, [[E.tplPick('u7.pass', 'u7.like'), 2], [E.tplFill('u7.pass', 'u7.like'), 2], [E.tplListen('u7.pass', 'u7.like'), 2],
          [E.tplOrder('u7.pass', 'u7.like'), 1], [E.tplMeaning('u7.pass', 'u7.like'), 1], [E.answerPick(7), 1]]),
        words(8),
        sents(8, [[E.u8(), 3], [E.tplPick('u8.this'), 1], [E.tplFill('u8.this'), 2], [E.tplListen('u8.this'), 1], [E.tplOrder('u8.this'), 1],
          [E.tplMeaning('u8.this'), 1]]),
        review(2, [5, 6, 7, 8], [[E.u5(), 1], [E.u6(), 1], [E.u8(), 1], [E.tplPick('u7.pass', 'u8.this', 'u6.see'), 1], [E.answerPick(5, 6, 7, 8), 1]]),
      ] },

      // ======================= HỌC KÌ 2 =======================
      { id: 't3', short: 'Unit 9–12', name: 'Cửa hàng, sở thú, sân chơi, quán cà phê', icon: '🦁', stages: [
        words(9),
        sents(9, [[E.qaPick('u9.want'), 2], [E.u9(), 2], [E.tplFill('u9.want'), 2], [E.tplListen('u9.want'), 1], [E.tplOrder('u9.want'), 1],
          [E.tplMeaning('u9.want'), 1]]),
        words(10),
        sents(10, [[E.u10(), 2], [E.tplPick('u10.that'), 2], [E.tplFill('u10.that'), 1], [E.tplListen('u10.that'), 2], [E.tplOrder('u10.that'), 1],
          [E.tplMeaning('u10.that'), 1]]),
        fun(3, 9, 10),
        words(11),
        sents(11, [[E.tplPick('u11.they', 'u11.she'), 2], [E.tplFill('u11.they', 'u11.she'), 2], [E.tplListen('u11.they', 'u11.she'), 2],
          [E.tplOrder('u11.they', 'u11.she'), 2], [E.tplMeaning('u11.they', 'u11.she'), 1]]),
        words(12),
        sents(12, [[E.tplPick('u12.on'), 2], [E.u12be(), 2], [E.tplFill('u12.on'), 1], [E.tplListen('u12.on'), 2], [E.tplOrder('u12.on'), 1],
          [E.tplMeaning('u12.on'), 1]]),
        review(3, [9, 10, 11, 12], [[E.qaPick('u9.want'), 1], [E.u10(), 1], [E.tplListen('u11.they'), 1], [E.tplPick('u12.on', 'u10.that'), 1],
          [E.answerPick(9, 10), 1]]),
      ] },
      { id: 't4', short: 'Unit 13–16', name: 'Số đếm, gia đình, quần áo, cắm trại', icon: '🏕️', stages: [
        words(13, [[E.numListen(11, 15), 2], [E.picWord(...ws(13)), 1], [E.numCount(11, 15), 1], [E.meaning(...ws(13)), 1], [E.letter(...ws(13)), 1],
          [E.spell(...ws(13)), 1], [E.numMatch(11, 15), 1], [E.soundPick(...ws(13)), 1]]),
        sents(13, [[E.qaPick('u13.num'), 3], [E.tplFill('u13.num'), 1], [E.tplListen('u13.num'), 2], [E.tplOrder('u13.num'), 1], [E.numWord(11, 15), 1],
          [E.answerPick(13), 1]]),
        words(14, [[E.listenPick(...ws(14)), 1], [E.numListen(16, 20), 1], [E.picWord(...ws(14)), 1], [E.numWord(16, 20), 1], [E.letter(...ws(14)), 2],
          [E.spell(...ws(14)), 1], [E.match('pic', ...ws(14)), 1], [E.numCount(16, 20), 1]]),
        sents(14, [[E.u14(), 3], [E.tplPick('u14.my'), 2], [E.tplListen('u14.my'), 1], [E.tplOrder('u14.my'), 2], [E.tplMeaning('u14.my'), 1]]),
        { id: 'f4', short: 'Fun time 4', name: 'Vui học cùng Unit 13 và Unit 14', icon: '🎮', shuffle: true,
          plan: [[E.numListen(11, 20), 2], [E.numMatch(11, 20), 1], [E.match('pic', ...ws(14)), 1], [E.spell(...ws(13, 14)), 2], [E.numCount(11, 20), 1],
            [E.wordPic(...ws(14)), 1], [E.u14(), 1]] },
        words(15),
        sents(15, [[E.tplPick('u15.look'), 2], [E.tplFill('u15.look'), 1], [E.tplListen('u15.look'), 2], [E.answerPick(15), 2], [E.tplOrder('u15.look'), 1],
          [E.tplMeaning('u15.look'), 1]]),
        words(16),
        sents(16, [[E.u16pick(), 3], [E.u16qa(), 3], [E.tplListen('u16.pos'), 1], [E.tplOrder('u16.pos'), 1], [E.tplMeaning('u16.pos'), 1]]),
        review(4, [13, 14, 15, 16], [[E.qaPick('u13.num'), 1], [E.u14(), 1], [E.tplPick('u15.look', 'u14.my'), 1], [E.u16qa(), 1],
          [E.answerPick(13, 14, 15, 16), 1]]),
      ] },
    ],
  };
})(window.App);
