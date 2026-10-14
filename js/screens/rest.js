/* Màn hình nghỉ ngơi: hiện khi bé đã học đủ số phút bố mẹ cho phép trong ngày */
(function (App) {
  'use strict';
  const { h } = App.U;
  const R = App.Rewards;

  App.Screens.rest = {
    render() {
      const st = App.Store.state;
      const min = Math.round(R.today().sec / 60);
      const petEl = App.UI.pet(st.pet, 8, { grow: false });
      petEl.classList.add('sleep');
      return h('div.screen.rest',
        h('div.rest-sky', h('span.moon', '🌙'), h('span.s1', '⭐'), h('span.s2', '✨'), h('span.s3', '⭐')),
        h('div.rest-pet', petEl, h('span.zzz', '💤')),
        h('div.rest-title', `${st.profile.name} ơi, mình nghỉ thôi!`),
        h('div.rest-sub', `Hôm nay bé đã học ${min} phút rồi. Mình cho đôi mắt nghỉ ngơi, chơi ngoài trời một chút, mai lại học tiếp nhé! 🌙`),
        h('div.result-actions',
          h('button.btn.white', { onclick: () => { App.Sound.play('tap'); App.Router.go('parent'); } }, '👨‍👩‍👧 Bố mẹ cho thêm giờ')));
    },
  };
})(window.App);
