/* Album sticker & huy hiệu */
(function (App) {
  'use strict';
  const { h } = App.U;
  const R = App.Rewards;
  let tab = 'animals';

  App.Screens.album = {
    render() {
      const st = App.Store.state;
      const all = R.allStickers();
      const owned = all.filter((s) => st.stickers[s.id]).length;
      const el = h('div.screen.album');

      el.appendChild(h('div.topbar',
        h('button.icon-btn', { 'aria-label': 'Về trang chủ', onclick: () => App.Router.home() }, '🏠'),
        h('div.title', '📒 Album của ' + st.profile.name),
        h('span.pill', '🎁 ', h('b', `${owned}/${all.length}`))));

      const tabs = h('div.tabs');
      const grid = h('div.sticker-grid');
      const count = h('div.album-count');
      const sets = App.Data.stickerSets;

      const draw = () => {
        tabs.innerHTML = '';
        sets.forEach((set) => tabs.appendChild(h('button.tab', { class: tab === set.id ? 'active' : '', onclick: () => { App.Sound.play('tap'); tab = set.id; draw(); } }, `${set.icon} ${set.name}`)));
        tabs.appendChild(h('button.tab', { class: tab === 'badges' ? 'active' : '', onclick: () => { App.Sound.play('tap'); tab = 'badges'; draw(); } }, '🏅 Huy hiệu'));
        tabs.appendChild(count);
        grid.innerHTML = '';

        if (tab === 'badges') {
          const badges = R.allBadges();
          count.textContent = `${badges.filter((b) => st.badges[b.id]).length}/${badges.length}`;
          badges.forEach((b) => {
            const has = !!st.badges[b.id];
            grid.appendChild(h('div.badge-card', { class: has ? '' : 'locked' },
              h('div.be', b.emoji), h('div.bn', b.name), h('div.bd', b.desc)));
          });
          return;
        }
        const set = sets.find((s) => s.id === tab);
        const items = all.filter((s) => s.set === set.id);
        count.textContent = `${items.filter((s) => st.stickers[s.id]).length}/${items.length}`;
        items.forEach((s) => {
          const has = !!st.stickers[s.id];
          const card = h('button.sticker', { class: has ? '' : 'locked' },
            h('div.se', s.emoji), h('div.sn', has ? s.vi : '???'));
          card.addEventListener('click', () => {
            if (!has) { App.Sound.play('tap'); App.UI.toast('Hoàn thành các chặng để mở sticker này nhé! 🎁'); return; }
            App.Sound.play('pop');
            App.Speech.speak(s.vi, 'vi');
            setTimeout(() => App.Speech.speak(s.en, 'en'), 1100);
            App.UI.modal({
              body: h('div', h('div.sticker-reveal', s.emoji), h('div.sticker-name', s.vi, h('small', s.en))),
              buttons: [{ label: 'Đóng', value: 1, cls: 'white' }],
            });
          });
          grid.appendChild(card);
        });
      };

      draw();
      el.appendChild(h('div.album-body', h('div.album-panel', tabs, grid)));
      el.appendChild(App.UI.bottomNav('album'));
      return el;
    },
  };
})(window.App);
