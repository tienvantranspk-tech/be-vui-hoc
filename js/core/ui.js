/* Các thành phần giao diện dùng chung: cửa sổ, thông báo, pháo giấy, thú cưng, thanh điều hướng… */
(function (App) {
  'use strict';
  const { h } = App.U;
  const layer = () => document.getElementById('layer');
  const UI = {};

  // ---- Cửa sổ hộp thoại ----
  // buttons: [{ label, value, cls }] → trả về Promise với value của nút được bấm.
  // Promise có thêm .close(value) để tự đóng cửa sổ từ bên ngoài.
  UI.modal = function ({ icon, title, body, buttons = [], dismissable = true, cls = '' }) {
    let close = () => {};
    const p = new Promise((resolve) => {
      let closed = false;
      close = (v) => {
        if (closed) return;
        closed = true;
        bd.classList.add('closing');
        setTimeout(() => bd.remove(), 180);
        resolve(v);
      };
      const box = h('div.modal', { class: cls },
        icon && h('div.modal-icon', icon),
        title && h('div.modal-title', title),
        body && (typeof body === 'string' ? h('div.modal-body', body) : body),
        buttons.length > 0 && h('div.modal-actions', buttons.map((b) =>
          h('button.btn', { class: b.cls || '', onclick: () => { App.Sound.play('tap'); close(b.value); } }, b.label))));
      const bd = h('div.modal-backdrop', { onclick: (e) => { if (dismissable && e.target === bd) close(null); } }, box);
      layer().appendChild(bd);
    });
    p.close = (v) => close(v);
    return p;
  };
  UI.confirm = (title, body, yes = 'Đồng ý', no = 'Không') => UI.modal({
    title, body, buttons: [{ label: no, value: false, cls: 'white' }, { label: yes, value: true, cls: 'orange' }],
  });

  // ---- Thông báo nhỏ ----
  UI.toast = function (text, ms = 2200) {
    layer().querySelectorAll('.toast').forEach((t) => t.remove());
    const t = h('div.toast', text);
    layer().appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, ms);
  };

  // ---- Pháo giấy ----
  UI.confetti = function (n = 45) {
    const colors = ['#ff6b6b', '#ffc531', '#34c463', '#3d8bff', '#a259f0', '#ff7eb6', '#ff9f43'];
    const box = h('div.confetti');
    for (let i = 0; i < n; i++) {
      const p = h('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = App.U.pick(colors);
      p.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px');
      p.style.animationDelay = Math.random() * 0.35 + 's';
      p.style.animationDuration = 1.6 + Math.random() * 1.3 + 's';
      if (Math.random() < 0.5) p.style.borderRadius = '50%';
      box.appendChild(p);
    }
    layer().appendChild(box);
    setTimeout(() => box.remove(), 3400);
  };

  // ---- Chữ / emoji bay lên từ một phần tử ----
  UI.floatFrom = function (el, text, dx = 0) {
    if (!el || !el.isConnected) return;
    const r = el.getBoundingClientRect();
    const f = h('div.floater', text);
    f.style.left = r.left + r.width / 2 + dx + 'px';
    f.style.top = r.top + r.height * 0.3 + 'px';
    layer().appendChild(f);
    setTimeout(() => f.remove(), 1000);
  };
  UI.hearts = function (el) {
    [-30, 0, 30].forEach((dx, i) => setTimeout(() => UI.floatFrom(el, '💖', dx), i * 120));
  };

  // ---- Một món bay từ phần tử này sang phần tử kia (cho thú cưng ăn) ----
  UI.fly = function (fromEl, toEl, emoji) {
    return new Promise((resolve) => {
      const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      const f = h('div.fly', emoji);
      f.style.left = a.left + a.width / 2 - 20 + 'px';
      f.style.top = a.top + a.height / 2 - 20 + 'px';
      layer().appendChild(f);
      void f.offsetWidth; // vẽ vị trí đầu trước rồi mới bay
      f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.6)`;
      f.style.opacity = '0.2';
      setTimeout(() => { f.remove(); resolve(); }, 620);
    });
  };

  // ---- Các chỉ số trên cùng: sao, xu, chuỗi ngày ----
  UI.statPills = function () {
    const st = App.Store.state;
    return h('div.stat-pills',
      h('span.pill', { title: 'Ngôi sao' }, '⭐ ', h('b', App.Rewards.totalStars())),
      h('span.pill.js-coins', { title: 'Xu' }, '🪙 ', h('b', st.coins)),
      h('span.pill', { title: 'Số ngày học liên tiếp' }, '🔥 ', h('b', App.Rewards.streakNow())));
  };
  UI.refreshCoins = function () {
    document.querySelectorAll('.js-coins b').forEach((b) => { b.textContent = App.Store.state.coins; });
  };

  // ---- Vẽ thú cưng ----
  // sizeRem: kích thước (rem). Thú cưng lớn dần theo cấp độ.
  UI.pet = function (pet, sizeRem = 10, { grow = true } = {}) {
    const kind = App.Rewards.petKind(pet);
    const scale = grow ? App.Rewards.petScale(pet) : 1;
    const inner = h('div.pet-inner', h('span.pet-body', kind.emoji));
    for (const slot of ['head', 'face', 'neck']) {
      const id = pet.wear && pet.wear[slot];
      const item = id && App.Data.accessories.find((a) => a.id === id);
      if (item) inner.appendChild(h('span.acc', { class: slot }, item.emoji));
    }
    const el = h('div.pet', { style: { '--ps': (sizeRem * scale).toFixed(2) + 'rem' } }, h('div.pet-shadow'), inner);
    if (App.Rewards.petMood(pet) === 'sad') el.classList.add('sad');
    return el;
  };
  UI.petAnim = function (el, name) {
    if (!el) return;
    el.classList.remove('jump', 'oops', 'eat');
    void el.offsetWidth; // khởi động lại hiệu ứng
    el.classList.add(name);
    setTimeout(() => el.classList.remove(name), 900);
  };

  // ---- Thanh chỉ số (độ no, độ vui, kinh nghiệm) ----
  UI.meter = (cls, icon, value) => h('div.meter', { class: cls },
    h('span', icon), h('div.bar', h('i', { style: { width: Math.round(value) + '%' } })));

  // ---- Thanh điều hướng dưới cùng ----
  const TABS = [
    { id: 'home', ico: '🏠', label: 'Trang chủ' },
    { id: 'pet', ico: '🐾', label: 'Thú cưng' },
    { id: 'album', ico: '📒', label: 'Sticker' },
    { id: 'parent', ico: '👨‍👩‍👧', label: 'Phụ huynh' },
  ];
  UI.bottomNav = function (active) {
    return h('nav.bottomnav', TABS.map((t) =>
      h('button.nav-btn', {
        class: t.id === active ? 'active' : '',
        onclick: () => {
          if (t.id === active) return;
          App.Sound.play('tap');
          if (t.id === 'home') App.Router.home();
          else if (active === 'home') App.Router.go(t.id);
          else App.Router.go(t.id, {}, { replace: true });
        },
      }, h('span.ico', t.ico), t.label)));
  };

  // ---- Bàn phím số ----
  // onKey nhận '0'…'9', 'del', 'ok'
  UI.keypad = function (onKey) {
    const keys = ['1', '2', '3', '4', '5', 'del', '6', '7', '8', '9', '0', 'ok'];
    return h('div.keypad', keys.map((k) => h('button.key', {
      class: k === 'del' ? 'del' : k === 'ok' ? 'ok' : '',
      'aria-label': k === 'del' ? 'Xóa' : k === 'ok' ? 'Kiểm tra' : k,
      onclick: () => onKey(k),
    }, k === 'del' ? '⌫' : k === 'ok' ? '✓' : k)));
  };

  App.UI = UI;
})(window.App);
