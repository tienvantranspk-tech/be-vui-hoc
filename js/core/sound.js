/* Âm thanh hiệu ứng – tạo bằng Web Audio, không cần file âm thanh */
(function (App) {
  'use strict';
  let ctx = null;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Phát một nốt: tần số (Hz), bắt đầu sau (giây), độ dài (giây), kiểu sóng, âm lượng, trượt tới tần số
  function tone(freq, start, dur, type = 'sine', vol = 0.18, slideTo = 0) {
    const c = audio();
    if (!c) return;
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568 };
  const SFX = {
    tap: () => tone(700, 0, 0.05, 'triangle', 0.07),
    pop: () => tone(800, 0, 0.08, 'sine', 0.14, 1300),
    correct: () => { tone(N.E5, 0, 0.12, 'triangle', 0.2); tone(N.C6, 0.1, 0.25, 'triangle', 0.2); },
    wrong: () => tone(320, 0, 0.28, 'sine', 0.16, 170),
    coin: () => { tone(N.B5, 0, 0.08, 'square', 0.06); tone(N.E6, 0.07, 0.25, 'square', 0.06); },
    star: () => { tone(N.G5, 0, 0.1, 'triangle', 0.15); tone(N.C6, 0.08, 0.1, 'triangle', 0.15); tone(N.E6, 0.16, 0.3, 'triangle', 0.15); },
    win: () => {
      [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle', 0.18));
      tone(N.E6, 0.5, 0.5, 'triangle', 0.16);
    },
    gift: () => [N.C5, N.D5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => tone(f, i * 0.07, 0.15, 'triangle', 0.15)),
    unlock: () => { tone(N.C5, 0, 0.1, 'square', 0.05); tone(N.G5, 0.1, 0.22, 'square', 0.05); },
    eat: () => [0, 0.13, 0.26].forEach((s, i) => tone(420 + i * 20, s, 0.08, 'square', 0.05, 260)),
    levelup: () => [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.16)),
  };

  App.Sound = {
    play(name) {
      const st = App.Store.state;
      if (st && !st.settings.sound) return;
      try { if (SFX[name]) SFX[name](); } catch (e) { /* bỏ qua */ }
    },
    unlock() { audio(); }, // trình duyệt chỉ cho phát âm thanh sau lần chạm đầu tiên
  };
})(window.App);
