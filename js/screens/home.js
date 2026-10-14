/* Trang chủ: thú cưng + ba "thế giới" môn học */
(function (App) {
  'use strict';
  const { h } = App.U;
  const R = App.Rewards;
  const SUBJECTS = ['toan', 'tv', 'ta'];

  App.Screens.home = {
    render() {
      // Hết giờ học hôm nay → màn hình nghỉ ngơi
      if (R.overLimit()) return App.Screens.rest.render();
      const st = App.Store.state;
      const pet = st.pet;
      R.petTick(pet);
      App.Store.save();

      const el = h('div.screen.home');
      el.appendChild(h('div.topbar',
        h('div.hello', h('span.wave', '👋'), ' Chào ', st.profile.name, '!'),
        h('div.spacer'),
        App.UI.statPills()));

      // ---- Thú cưng ----
      const bubble = h('div.bubble', R.petSays(pet));
      const petEl = App.UI.pet(pet, 9);
      petEl.addEventListener('click', () => {
        App.Sound.play('pop');
        App.UI.petAnim(petEl, 'jump');
        App.UI.hearts(petEl);
        R.petPat(pet);
        bubble.textContent = App.U.pick([R.petKind(pet).hello, 'Hihi, nhột quá! 😆', 'Mình thương bạn! 💕', R.petSays(pet)]);
      });
      const petBox = h('div.home-pet',
        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem' } }, bubble, petEl),
        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' } },
          h('div.pet-name', pet.name, h('small', `Cấp ${R.petLevel(pet)} · ${R.petTitle(pet)}`)),
          h('div.meters',
            App.UI.meter('full', '🍖', pet.full),
            App.UI.meter('happy', '💖', pet.happy)),
          h('button.btn.small.pink', { onclick: () => App.Router.go('pet') }, '🍎 Cho ăn')));

      // ---- Các thế giới môn học ----
      const worlds = h('div.worlds', SUBJECTS.map((sid) => {
        const sub = App.Curriculum[sid];
        const sum = R.summary(sub);
        const soon = sum.total === 0;
        const pct = sum.total ? Math.round((sum.done / sum.total) * 100) : 0;
        return h('button.world-card', {
          class: `theme-${sid}${soon ? ' soon' : ''}`,
          onclick: () => {
            App.Sound.play('tap');
            if (soon) { App.UI.toast(`🚧 ${sub.world} đang được xây dựng, sắp mở rồi!`); return; }
            App.Router.go('map', { subject: sid });
          },
        },
        h('div.w-emoji', sub.icon),
        h('div.w-info',
          h('div.w-name', sub.world),
          h('div.w-sub', soon ? `${sub.name} · Sắp mở 🚧` : `${sub.name} · ${sum.done}/${sum.total} chặng · ⭐ ${sum.stars}`),
          h('div.w-progress', h('i', { style: { width: pct + '%' } }))),
        h('div.w-go', soon ? '🔒' : '▶'));
      }));

      // Ôn lại các câu bé làm sai gần đây
      const nMistakes = R.mistakeCount();
      if (nMistakes) {
        worlds.appendChild(h('button.review-card', {
          onclick: () => { App.Sound.play('tap'); App.Router.go('play', { subject: 'review' }); },
        },
        h('span.rc-ico', '🔁'),
        h('span.rc-text', h('b', 'Ôn lại câu sai'), h('small', `${nMistakes} câu bé làm chưa đúng · làm lại để nhận xu nhé!`)),
        h('span.rc-go', '▶')));
      }

      el.appendChild(h('div.home-body', petBox, worlds));
      el.appendChild(App.UI.bottomNav('home'));
      return el;
    },
  };
})(window.App);
