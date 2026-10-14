/* Phòng thú cưng: cho ăn, mua và đeo phụ kiện */
(function (App) {
  'use strict';
  const { h } = App.U;
  const R = App.Rewards;
  let tab = 'food';

  App.Screens.pet = {
    render() {
      const st = App.Store.state;
      const pet = st.pet;
      R.petTick(pet);
      const el = h('div.screen.pet-room.theme-ta');

      el.appendChild(h('div.topbar',
        h('button.icon-btn', { 'aria-label': 'Về trang chủ', onclick: () => App.Router.home() }, '🏠'),
        h('div.title', `🐾 Nhà của ${pet.name}`),
        h('span.pill.js-coins', '🪙 ', h('b', st.coins))));

      // ---- Sân khấu thú cưng ----
      const stage = h('div.pet-stage');
      const bubble = h('div.bubble');
      const info = h('div.pet-info');
      let petEl = null;
      const drawPet = (msg) => {
        stage.innerHTML = '';
        petEl = App.UI.pet(pet, 9);
        petEl.addEventListener('click', () => {
          App.Sound.play('pop');
          App.UI.petAnim(petEl, 'jump');
          App.UI.hearts(petEl);
          R.petPat(pet);
          bubble.textContent = App.U.pick([R.petKind(pet).hello, 'Hihi, nhột quá! 😆', 'Thương bạn nhất! 💕']);
          drawInfo();
        });
        bubble.textContent = msg || R.petSays(pet);
        stage.append(h('div.window', '🪟'), h('div.plant', '🪴'), bubble, petEl, info);
        drawInfo();
      };
      const drawInfo = () => {
        info.innerHTML = '';
        info.append(
          h('div.pet-name', pet.name, h('small', `Cấp ${R.petLevel(pet)} · ${R.petTitle(pet)}`)),
          App.UI.meter('full', '🍖', pet.full),
          App.UI.meter('happy', '💖', pet.happy),
          App.UI.meter('xp', '⭐', R.petLevelProgress(pet) * 100));
      };

      // ---- Cửa hàng ----
      const grid = h('div.shop-grid');
      const tabs = h('div.tabs',
        h('button.tab', { dataset: { t: 'food' } }, '🍎 Đồ ăn'),
        h('button.tab', { dataset: { t: 'acc' } }, '🎀 Phụ kiện'));
      tabs.addEventListener('click', (e) => {
        const b = e.target.closest('.tab');
        if (!b) return;
        App.Sound.play('tap');
        tab = b.dataset.t;
        drawShop();
      });
      const drawShop = () => {
        tabs.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.t === tab));
        grid.innerHTML = '';
        if (tab === 'food') {
          const fav = R.petKind(pet).fav;
          App.Data.foods.forEach((f) => {
            const item = h('button.item', { class: (f.id === fav ? 'fav ' : '') + (st.coins < f.price ? 'poor' : '') },
              h('div.ie', f.emoji), h('div.in', f.name + (f.id === fav ? ' 😍' : '')), h('div.ip', `🪙 ${f.price}`));
            item.addEventListener('click', () => feed(f, item));
            grid.appendChild(item);
          });
        } else {
          App.Data.accessories.forEach((a) => {
            const owned = (pet.owned || []).includes(a.id);
            const worn = pet.wear && pet.wear[a.slot] === a.id;
            const item = h('button.item', { class: (worn ? 'worn ' : '') + (!owned && st.coins < a.price ? 'poor' : '') },
              h('div.ie', a.emoji), h('div.in', a.name),
              h('div.ip', { class: owned ? 'owned' : '' }, owned ? (worn ? '✅ Đang đeo' : 'Đeo thử') : `🪙 ${a.price}`));
            item.addEventListener('click', () => accessory(a));
            grid.appendChild(item);
          });
        }
      };

      async function feed(f, item) {
        const res = R.feed(f.id);
        if (!res.ok) {
          App.Sound.play('wrong');
          if (res.reason === 'coins') App.UI.toast(`Chưa đủ xu 🪙 – chơi thêm một chặng để có xu nhé!`);
          else if (res.reason === 'full') { bubble.textContent = 'Mình no căng bụng rồi! 😋'; App.UI.petAnim(petEl, 'oops'); }
          return;
        }
        App.Sound.play('coin');
        App.UI.refreshCoins();
        await App.UI.fly(item, petEl, f.emoji);
        App.Sound.play('eat');
        App.UI.petAnim(petEl, 'eat');
        App.UI.floatFrom(petEl, res.fav ? '😍' : '😋');
        bubble.textContent = res.fav ? 'Món khoái khẩu của mình! Ngon quá! 😍' : App.U.pick(['Ngon quá! Cảm ơn bạn! 😋', 'Măm măm… 😋', 'No bụng rồi, vui quá! 💕']);
        drawInfo();
        drawShop();
        if (res.levelUp) levelUp();
      }

      async function accessory(a) {
        const owned = (pet.owned || []).includes(a.id);
        if (!owned) {
          if (st.coins < a.price) { App.Sound.play('wrong'); App.UI.toast(`Cần ${a.price} xu 🪙 để mua ${a.name}. Cố lên nào!`); return; }
          const ok = await App.UI.confirm(`Mua ${a.name}?`, `${a.emoji}  Giá ${a.price} xu 🪙`, 'Mua luôn!', 'Thôi');
          if (!ok) return;
          const res = R.buyAccessory(a.id);
          if (!res.ok) return;
          App.Sound.play('gift');
          App.UI.confetti(30);
          App.UI.refreshCoins();
          drawPet(`Đẹp quá! Cảm ơn bạn nhé! ${a.emoji}`);
        } else {
          const on = R.toggleWear(a.id);
          App.Sound.play('pop');
          drawPet(on ? `Mình có đẹp không? ${a.emoji}` : 'Tháo ra cho mát nè!');
        }
        App.UI.petAnim(petEl, 'jump');
        drawShop();
      }

      function levelUp() {
        App.Sound.play('levelup');
        App.UI.confetti();
        App.UI.modal({ icon: '🎉', title: `${pet.name} lên cấp ${R.petLevel(pet)}!`, body: `Danh hiệu: ${R.petTitle(pet)}`, buttons: [{ label: 'Hoan hô!', value: 1, cls: 'green' }] });
        drawPet();
      }

      drawPet();
      drawShop();
      el.appendChild(h('div.pet-room-body', stage, h('div.shop', tabs, grid)));
      el.appendChild(App.UI.bottomNav('pet'));
      return el;
    },
  };
})(window.App);
