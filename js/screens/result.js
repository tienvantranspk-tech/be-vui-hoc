/* Màn kết quả sau mỗi chặng: sao, xu, quà sticker, huy hiệu, thú cưng lên cấp */
(function (App) {
  'use strict';
  const { h, sleep } = App.U;
  const R = App.Rewards;

  App.Screens.result = {
    render(p) {
      const { reward } = p;
      const review = p.subject === 'review'; // vừa ôn lại câu sai
      const sub = review ? null : App.Curriculum[p.subject];
      const st = App.Store.state;
      const titles = { 3: 'Xuất sắc! 🏆', 2: 'Giỏi lắm! 🎉', 1: 'Hoàn thành! 👍' };
      const subs = {
        3: p.firstTry === p.total ? `${st.profile.name} làm đúng hết luôn! 💯` : `${st.profile.name} làm đúng gần hết luôn!`,
        2: 'Bé làm tốt lắm, chơi lại để lấy đủ 3 sao nhé!',
        1: 'Bé đã cố gắng! Chơi lại để giỏi hơn nữa nào!',
      };
      const next = review ? null : R.nextStage(sub, R.key(p.subject, p.topic, p.stage));
      const title = review ? (reward.left ? 'Ôn tập xong! 💪' : 'Sửa hết lỗi rồi! 🏆') : titles[reward.stars];
      const subText = review
        ? `Bé sửa đúng ${p.firstTry}/${p.total} câu.` + (reward.left ? ` Còn ${reward.left} câu cần ôn thêm.` : ' Không còn câu sai nào nữa! 🎉')
        : subs[reward.stars];

      const el = h('div.screen.result', { class: 'theme-' + p.subject },
        h('div.result-stars', [1, 2, 3].map(() => h('span.st', '⭐'))),
        h('div.result-title', title),
        h('div.result-sub', subText),
        h('div.result-row',
          h('span.pill', `✅ Đúng ngay: ${p.firstTry}/${p.total}`),
          h('span.pill.js-gain', '🪙 +', h('b', '0'))),
        reward.dailyBonus ? h('div.muted', `(có +${reward.dailyBonus} xu thưởng chăm chỉ cho chặng đầu tiên hôm nay 🌞)`) : null,
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '.8rem' } },
          App.UI.pet(st.pet, 4.5),
          h('div.bubble', reward.levelUp ? `Mình lên cấp ${reward.petLevel} rồi! 🎉` : App.U.pick(['Vui quá đi! 💕', 'Bạn giỏi thật! 🌟', 'Mình lớn thêm rồi nè! 💪', 'Học tiếp nha! 📚']))),
        review
          ? h('div.result-actions',
            h('button.btn.white', { onclick: () => App.Router.home() }, '🏠 Trang chủ'),
            reward.left ? h('button.btn.orange', { onclick: () => App.Router.go('play', { subject: 'review' }, { replace: true }) }, '🔁 Ôn tiếp') : null)
          : h('div.result-actions',
            h('button.btn.white', { onclick: () => App.Router.go('play', pick(p), { replace: true }) }, '🔁 Chơi lại'),
            h('button.btn.orange', { onclick: () => toMap(p.subject) }, '🗺️ Bản đồ'),
            next ? h('button.btn.green', { onclick: () => App.Router.go('play', { subject: p.subject, topic: next.topic.id, stage: next.stage.id }, { replace: true }) }, 'Chặng tiếp ▶') : null));
      return el;
    },

    async mounted(el, p) {
      if (p.shown) { // đã xem rồi (quay lại màn này) → hiện ngay, không phát lại quà
        el.querySelectorAll('.st').forEach((s, i) => { if (i < p.reward.stars) s.classList.add('on'); });
        el.querySelector('.js-gain b').textContent = p.reward.coins;
        return;
      }
      p.shown = true;
      const { reward } = p;
      App.Sound.play('win');
      if (reward.stars === 3) App.UI.confetti(60);

      // Sao xuất hiện lần lượt
      const stars = el.querySelectorAll('.st');
      for (let i = 0; i < reward.stars; i++) {
        await sleep(350);
        if (!el.isConnected) return;
        stars[i].classList.add('on');
        App.Sound.play('star');
      }
      // Đếm xu
      const gain = el.querySelector('.js-gain b');
      const stepMs = Math.max(25, Math.min(70, 900 / Math.max(1, reward.coins)));
      for (let c = 1; c <= reward.coins; c++) {
        await sleep(stepMs);
        if (!el.isConnected) return;
        gain.textContent = c;
        if (c % 3 === 0 || c === reward.coins) App.Sound.play('coin');
      }

      // Quà sticker, huy hiệu, lên cấp
      for (const s of reward.gifts) { await sleep(300); if (!el.isConnected) return; await openGift(s); }
      for (const b of reward.badges) {
        if (!el.isConnected) return;
        App.Sound.play('levelup');
        App.UI.confetti(40);
        await App.UI.modal({ icon: b.emoji, title: 'Huy hiệu mới!', body: `${b.name}\n${b.desc}`, buttons: [{ label: 'Tuyệt vời! 🌟', value: 1, cls: 'gold' }] });
      }
      if (reward.levelUp && el.isConnected) {
        const st = App.Store.state;
        App.Sound.play('levelup');
        await App.UI.modal({
          body: h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem' } },
            App.UI.pet(st.pet, 7),
            h('div.modal-title', `${st.pet.name} lên cấp ${reward.petLevel}!`),
            h('div.modal-body', `Danh hiệu: ${R.petTitle(st.pet)}\nBạn ấy lớn thêm một chút rồi đó! 🎉`)),
          buttons: [{ label: 'Hoan hô! 🎉', value: 1, cls: 'green' }],
        });
      }
    },
  };

  const pick = (p) => ({ subject: p.subject, topic: p.topic, stage: p.stage });

  // Về bản đồ của môn: nếu màn trước là bản đồ thì quay lại, không thì mở bản đồ thay cho màn này
  function toMap(subject) {
    const stack = App.Router.stack;
    const prev = stack[stack.length - 2];
    if (prev && prev.name === 'map' && prev.params.subject === subject) App.Router.back();
    else App.Router.go('map', { subject }, { replace: true });
  }

  // Mở hộp quà → hiện sticker mới
  function openGift(s) {
    return new Promise((resolve) => {
      const box = h('button.gift-box', '🎁');
      const hint = h('div.modal-body', 'Chạm vào hộp quà để mở nhé!');
      const wrap = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem' } },
        h('div.modal-title', 'Bé nhận được quà!'), box, hint);
      let opened = false;
      const m = App.UI.modal({ body: wrap, dismissable: false });
      box.addEventListener('click', () => {
        if (opened) return;
        opened = true;
        App.Sound.play('gift');
        box.classList.add('opening');
        setTimeout(() => {
          wrap.innerHTML = '';
          wrap.append(
            h('div.modal-title', 'Sticker mới! ✨'),
            h('div.sticker-reveal', s.emoji),
            h('div.sticker-name', s.vi, h('small', s.en)),
            h('button.btn.green', { onclick: () => { App.Sound.play('tap'); m.close(true); } }, 'Cất vào album 📒'));
          App.UI.confetti(30);
          App.Speech.speak(s.vi, 'vi');
          setTimeout(() => App.Speech.speak(s.en, 'en'), 1200);
        }, 550);
      });
      m.then(resolve);
    });
  }
})(window.App);
