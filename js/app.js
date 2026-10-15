/* Khởi động app */
(function (App) {
  'use strict';

  function boot() {
    App.Store.load();
    const st = App.Store.state;
    if (st.pet) App.Rewards.petTick(st.pet);
    App.Store.save();

    // Trình duyệt chỉ cho phát âm thanh sau lần chạm đầu tiên
    document.addEventListener('pointerdown', () => App.Sound.unlock(), { once: true });

    // Đếm thời gian học: chỉ tính khi màn hình đang mở và bé có thao tác trong 90 giây gần nhất
    let lastTouch = Date.now();
    ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => { lastTouch = Date.now(); }, { passive: true }));
    const warned = {}; // nhắc giờ: mỗi mốc chỉ nhắc một lần
    // Thời gian được tính vào môn bé đang học (bản đồ, chặng chơi, kết quả), ôn câu sai, thú cưng – sticker, hoặc mục khác
    const timeCategory = () => {
      const top = App.Router.top();
      if (!top) return 'other';
      const sid = top.params && top.params.subject;
      if (['play', 'result', 'map'].includes(top.name) && ['toan', 'tv', 'ta', 'review'].includes(sid)) return sid;
      if (sid === 'weektext') return 'tv';
      if (top.name === 'pet' || top.name === 'album') return 'pet';
      return 'other';
    };
    // Bố mẹ xem Góc phụ huynh, hoặc màn hình nghỉ khi hết giờ: không tính là thời gian bé học
    const notCounted = () => { const top = App.Router.top(); return !!top && ['parent', 'rest', 'setup'].includes(top.name); };
    setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastTouch < 90000 && App.Store.state.profile && !notCounted()) {
        App.Rewards.addTime(15, timeCategory());
        App.Store.save();
        checkLimit();
      }
    }, 15000);

    // Giới hạn thời gian mỗi ngày (bố mẹ đặt trong Góc phụ huynh)
    function checkLimit() {
      const left = App.Rewards.timeLeft();
      if (left === Infinity) return;
      const mark = App.U.dayKey() + ':' + App.Rewards.limitSec();
      const cur = App.Router.top() ? App.Router.top().name : '';
      if (left <= 120 && left > 0 && warned.soon !== mark) {
        warned.soon = mark;
        App.UI.toast('⏰ Còn khoảng 2 phút nữa là hết giờ học hôm nay nhé!', 3500);
      } else if (left <= 0 && warned.over !== mark) {
        warned.over = mark;
        if (cur === 'play') App.UI.toast('🌙 Hết giờ học hôm nay rồi! Bé làm nốt chặng này nhé.', 4000);
        else if (cur !== 'parent' && cur !== 'result') App.Router.home();
      }
    }
    // Hết giờ thì không mở bản đồ, chặng chơi, phòng thú cưng, album nữa
    App.Router.guard = (name) => (['map', 'play', 'pet', 'album'].includes(name) && App.Rewards.overLimit() ? 'rest' : null);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') App.Store.save(); });

    // Xin trình duyệt giữ dữ liệu lâu dài (không tự xóa khi máy đầy bộ nhớ)
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

    // Cài như app (PWA): cất app vào bộ nhớ để chơi được khi không có mạng.
    // Chỉ chạy khi mở qua https (đã đưa lên mạng); trên máy tính thử bằng http://localhost:5500/?pwa
    const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http') && (!local || /pwa/.test(location.search))) {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Không cài được bộ nhớ đệm', e));
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) App.UI.toast('✨ App vừa được cập nhật bản mới!', 3000);
      });
    }
    // Nút "Cài app" trong Góc phụ huynh (Chrome trên Android báo khi app cài được)
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); App.installPrompt = e; });
    window.addEventListener('appinstalled', () => { App.installPrompt = null; App.UI.toast('🎉 Đã cài Bé Vui Học lên màn hình chính!', 3000); });

    App.Router.init(st.profile ? 'home' : 'setup');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.App);
