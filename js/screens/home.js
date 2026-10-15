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
        st.settings.level === 'nang-cao' ? h('span.pill.lv', { title: 'Trộn nhiều câu nâng cao' }, '🔥 Trộn nhiều') : null,
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

      // Tuần này ở lớp đang học bài nào (theo lịch năm học, bố mẹ chỉnh được) → bấm là vào đúng bài đó
      const wk = App.Report.schoolWeek();
      const today = SUBJECTS.map((sid) => ({ sid, sc: App.Report.school(sid, wk) })).filter((x) => x.sc.now);
      if (today.length) {
        worlds.prepend(h('div.today-card',
          h('div.tc-title', `📅 Tuần ${wk} ở lớp đang học`),
          h('div.tc-items', today.map(({ sid, sc }) => {
            const x = sc.now, done = R.done(x.key);
            return h('button.tc-item', { class: 'theme-' + sid, onclick: () => {
              App.Sound.play('tap');
              if (R.isUnlocked(App.Curriculum[sid], x.key)) App.Router.go('play', { subject: sid, topic: x.topic.id, stage: x.stage.id });
              else { App.UI.toast('🔒 Bé làm các chặng trước trên bản đồ để mở bài này nhé!'); App.Router.go('map', { subject: sid }); }
            } }, h('span.tc-ico', App.Curriculum[sid].icon), h('span.tc-txt', h('b', x.stage.short), h('small', x.stage.name)), h('span.tc-go', done ? '⭐' : '▶'));
          }))));
      }
      // Bài đọc tuần này (bố mẹ gõ trong Góc phụ huynh)
      if (App.WeekText && App.WeekText.has()) {
        worlds.appendChild(h('button.review-card.weektext', { onclick: () => { App.Sound.play('tap'); App.Router.go('play', { subject: 'weektext' }); } },
          h('span.rc-ico', '📖'), h('span.rc-text', h('b', 'Bài đọc tuần này'), h('small', `“${App.WeekText.title()}” · bố mẹ gửi cho bé luyện`)), h('span.rc-go', '▶')));
      }

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
      // Bố mẹ vừa chấm nhiệm vụ → khen bé
      const news = App.Tasks.takeNews();
      if (news.length) {
        const stars = news.reduce((s, t) => s + t.stars, 0);
        setTimeout(() => { App.UI.toast(`👨‍👩‍👧 Bố mẹ đã chấm bài của bé: ${'⭐'.repeat(Math.min(stars, 9))} (+${stars * 3} xu) 🎉`, 4000); App.UI.confetti(30); }, 600);
      }
      return el;
    },
  };
})(window.App);
