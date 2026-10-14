/* Màn chơi một chặng */
(function (App) {
  'use strict';
  const { h } = App.U;
  let session = null;

  function find(params) {
    // Ôn lại câu sai: chặng đặc biệt gồm các câu bé làm sai gần đây
    if (params.subject === 'review') return { sub: null, topic: null, stage: { id: 'review', make: () => App.Rewards.reviewQuestions() } };
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
      el.appendChild(body);

      const review = params.subject === 'review';
      const questions = App.makeQuestions(stage);
      if (!questions.length) { setTimeout(() => App.Router.back(), 0); return el; }
      if (!review) questions.forEach((q) => { q._sid = params.subject; }); // ghi nhớ câu thuộc môn nào
      session = { finished: false, asking: false };
      session.engine = App.Engine.start(body, {
        questions, bar, pet: petMini, comboEl: combo,
        onFinish: ({ total, firstTry }) => {
          if (!session) return;
          session.finished = true;
          const reward = review ? App.Rewards.completeReview({ total, firstTry })
            : App.Rewards.completeStage({ subject: sub, topic, stage, total, firstTry });
          App.Router.go('result', { ...params, total, firstTry, reward }, { replace: true });
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
