/* Màn chơi một chặng */
(function (App) {
  'use strict';
  const { h } = App.U;
  let session = null;

  function find(params) {
    // Ôn lại câu sai: chặng đặc biệt gồm các câu bé làm sai gần đây
    if (params.subject === 'review') return { sub: null, topic: null, stage: { id: 'review', make: () => App.Rewards.reviewQuestions() } };
    // Bài đọc tuần này (bố mẹ gõ trong Góc phụ huynh)
    if (params.subject === 'weektext') return { sub: null, topic: null, stage: App.WeekText.has() ? { id: 'weektext', make: () => App.WeekText.make() } : null };
    const sub = App.Curriculum[params.subject];
    const topic = sub && sub.topics.find((t) => t.id === params.topic);
    const stage = topic && topic.stages.find((s) => s.id === params.stage);
    return { sub, topic, stage };
  }

  async function askExit() {
    if (!session || session.finished || session.asking) return;
    session.asking = true;
    const ok = await App.UI.confirm('Dừng chơi à? 🥺', 'Nếu dừng bây giờ, lần sau bé sẽ chơi lại chặng này từ đầu.', 'Dừng chơi', 'Chơi tiếp');
    if (!session) return;
    session.asking = false;
    if (ok) { session.finished = true; App.Router.back(); }
  }

  // Trùm cuối của từng chủ đề (chọn theo thứ tự chủ đề để lần nào chơi cũng gặp cùng một trùm)
  const BOSSES = [['🐉', 'Rồng Lửa'], ['👾', 'Quái Vật Tí Hon'], ['🦖', 'Khủng Long Lém Lỉnh'], ['🐙', 'Bạch Tuộc Tinh Nghịch'], ['🧌', 'Yêu Tinh Đá'],
    ['🦈', 'Cá Mập Răng Cưa'], ['🕷️', 'Nhện Khổng Lồ'], ['🤖', 'Rô-bốt Bướng Bỉnh'], ['👻', 'Bóng Ma Hay Quên'], ['🦂', 'Bọ Cạp Cát']];
  const bossOf = (sub, topic) => BOSSES[(sub.topics.indexOf(topic) + sub.id.length) % BOSSES.length];

  App.Screens.play = {
    render(params) {
      const { sub, topic, stage } = find(params);
      const el = h('div.screen.play', { class: 'theme-' + params.subject });
      if (!stage) { setTimeout(() => App.Router.back(), 0); return el; }

      const bar = h('i');
      const combo = h('div.combo');
      const petMini = App.UI.pet(App.Store.state.pet, 3.4, { grow: false });
      el.appendChild(h('div.play-top',
        h('button.icon-btn', { 'aria-label': 'Dừng chơi', onclick: askExit }, '✖'),
        h('div.progress', bar),
        combo,
        petMini));
      const body = h('div.play-body');
      const review = params.subject === 'review' || params.subject === 'weektext';
      // Trùm cuối: chặng ôn tập cuối mỗi chủ đề – mỗi câu đúng ngay là một đòn đánh trùm
      const lastMain = topic && topic.stages.filter((s) => !s.bonus && App.Rewards.playable(s)).slice(-1)[0] === stage;
      const boss = !review && sub && stage.review && lastMain ? bossOf(sub, topic) : null;
      let bossEl = null, hp = 0, hpMax = 0;
      if (boss) {
        bossEl = h('div.boss', h('span.boss-ico', boss[0]), h('div.boss-info', h('b', boss[1]), h('div.boss-hp', h('i'))));
        el.appendChild(bossEl);
      }
      el.appendChild(body);

      const questions = App.makeQuestions(stage);
      if (!questions.length) { setTimeout(() => App.Router.back(), 0); return el; }
      if (!review) questions.forEach((q) => { q._sid = params.subject; }); // ghi nhớ câu thuộc môn nào
      session = { finished: false, asking: false };
      if (boss) {
        hp = hpMax = Math.max(3, Math.round(questions.length * 0.8));
        setTimeout(() => App.UI.toast(`${boss[0]} ${boss[1]} xuất hiện! Trả lời đúng ngay để hạ ${boss[1]} nhé!`, 3200), 400);
      }
      const onAnswer = boss ? (ok, first) => {
        const ico = bossEl.querySelector('.boss-ico');
        if (ok && first && hp > 0) {
          hp--;
          bossEl.querySelector('.boss-hp i').style.width = (hp / hpMax) * 100 + '%';
          App.UI.petAnim(ico, 'oops');
          App.UI.floatFrom(ico, '💥');
          if (hp === 0) { bossEl.classList.add('down'); ico.textContent = '😵'; App.UI.confetti(40); App.UI.toast(`🏆 Bé đã hạ ${boss[1]}!`, 2500); }
        } else if (!ok) App.UI.petAnim(ico, 'jump');
      } : null;
      session.engine = App.Engine.start(body, {
        questions, bar, pet: petMini, comboEl: combo, onAnswer,
        onFinish: ({ total, firstTry, advTotal, advFirstTry, sec }) => {
          if (!session) return;
          session.finished = true;
          const reward = review ? App.Rewards.completeReview({ total, firstTry, sec, sid: params.subject })
            : App.Rewards.completeStage({ subject: sub, topic, stage, total, firstTry, advTotal, advFirstTry, sec });
          App.Router.go('result', { ...params, total, firstTry, advTotal, advFirstTry, reward }, { replace: true });
        },
      });
      return el;
    },
    canLeave() { return !session || session.finished; },
    onBlockedBack() { askExit(); },
    leave() {
      if (session && session.engine) session.engine.destroy();
      session = null;
    },
  };
})(window.App);
