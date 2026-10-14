/* Màn hình làm quen lần đầu: tên bé → chọn thú cưng → đặt tên thú cưng */
(function (App) {
  'use strict';
  const { h } = App.U;

  App.Screens.setup = {
    render() {
      const data = { name: '', kind: null, petName: '' };
      let step = 0;
      const el = h('div.screen.setup');

      const go = (n) => { step = n; App.Sound.play('pop'); draw(); };
      const draw = () => { el.innerHTML = ''; el.appendChild(STEPS[step]()); };

      const STEPS = [
        // 1. Chào mừng
        () => h('div.setup-card.card',
          h('div.setup-logo', '🎒'),
          h('h1.setup-title', 'Bé Vui Học'),
          h('p.setup-sub', 'Vừa học vừa chơi · Lớp 2'),
          h('div', { style: { fontSize: '2.4rem', letterSpacing: '.4rem' } }, '🔢 📖 🔤'),
          h('button.btn.big.green', { onclick: () => go(1) }, 'Bắt đầu nào! 🚀')),

        // 2. Tên của bé
        () => {
          const input = h('input.text-input', { maxlength: 20, placeholder: 'Tên của bé', value: data.name, autocomplete: 'off' });
          const next = h('button.btn.big.green', { disabled: !data.name.trim() }, 'Tiếp tục ▶');
          input.addEventListener('input', () => { data.name = input.value; next.disabled = !input.value.trim(); });
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && data.name.trim()) go(2); });
          next.addEventListener('click', () => go(2));
          setTimeout(() => input.focus(), 300);
          return h('div.setup-card.card',
            h('div.setup-logo', '👋'),
            h('div.setup-q', 'Chào bạn nhỏ! Bé tên là gì?'),
            input,
            h('p.muted', 'Gõ tên hoặc biệt danh của bé (bố mẹ giúp bé nhé).'),
            next);
        },

        // 3. Chọn thú cưng
        () => {
          const next = h('button.btn.big.green', { disabled: !data.kind, onclick: () => go(3) }, 'Chọn bạn này ▶');
          const bubble = h('div.bubble', { style: { visibility: data.kind ? 'visible' : 'hidden' } }, '…');
          const grid = h('div.pet-grid', App.Data.pets.map((p) => {
            const b = h('button.pet-choice', { class: data.kind === p.id ? 'selected' : '' }, h('span.e', p.emoji), p.name);
            b.addEventListener('click', () => {
              App.Sound.play('pop');
              data.kind = p.id;
              data.petName = p.names[0];
              grid.querySelectorAll('.pet-choice').forEach((x) => x.classList.remove('selected'));
              b.classList.add('selected');
              bubble.textContent = p.hello;
              bubble.style.visibility = 'visible';
              next.disabled = false;
            });
            return b;
          }));
          return h('div.setup-card.card',
            h('div.setup-q', `${data.name.trim()} ơi, chọn một người bạn đồng hành nhé!`),
            h('p.muted', 'Bạn ấy sẽ cùng bé đi phiêu lưu và lớn lên khi bé học giỏi.'),
            bubble, grid, next);
        },

        // 4. Đặt tên thú cưng
        () => {
          const kind = App.Data.pets.find((p) => p.id === data.kind);
          const input = h('input.text-input', { maxlength: 16, value: data.petName, autocomplete: 'off' });
          const done = h('button.btn.big.green', 'Xong rồi! 🎉');
          input.addEventListener('input', () => { data.petName = input.value; done.disabled = !input.value.trim(); });
          const chips = h('div.chips', kind.names.map((n) => h('button.chip', { onclick: () => {
            App.Sound.play('tap');
            input.value = n;
            data.petName = n;
            done.disabled = false;
          } }, n)));
          done.addEventListener('click', finish);
          return h('div.setup-card.card',
            h('div', { style: { fontSize: '5.5rem', lineHeight: 1 } }, kind.emoji),
            h('div.setup-q', 'Đặt tên cho bạn ấy nào!'),
            input, chips, done);
        },
      ];

      function finish() {
        const st = App.Store.state;
        st.profile = { name: data.name.trim() };
        st.pet = {
          kind: data.kind, name: (data.petName || '').trim() || 'Bạn nhỏ',
          xp: 0, full: 70, happy: 80, updatedAt: Date.now(), wear: {}, owned: [],
        };
        st.coins = 20; // quà làm quen
        App.Store.save();
        App.Sound.play('win');
        App.UI.confetti();
        App.Router.go('home', {}, { replace: true });
        setTimeout(() => App.UI.modal({
          icon: '🎁',
          title: 'Quà làm quen!',
          body: `${st.profile.name} nhận được 20 xu 🪙\nHãy mua đồ ăn cho ${st.pet.name} trong mục Thú cưng nhé!\n\nChơi các chặng trên bản đồ để nhận thêm sao ⭐, xu 🪙 và sticker 🎁.`,
          buttons: [{ label: 'Tuyệt quá! 👍', value: true, cls: 'green' }],
        }), 400);
      }

      draw();
      return el;
    },
  };
})(window.App);
