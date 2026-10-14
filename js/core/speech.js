/* Giọng đọc – dùng giọng có sẵn trên máy (tiếng Việt & tiếng Anh) */
(function (App) {
  'use strict';
  const synth = window.speechSynthesis;
  let voices = [];

  function refresh() { voices = synth ? synth.getVoices() : []; }
  if (synth) {
    refresh();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', refresh);
    else synth.onvoiceschanged = refresh;
  }

  const norm = (lang) => (lang || '').toLowerCase().replace('_', '-');

  // Chọn giọng tốt nhất cho ngôn ngữ ('vi' hoặc 'en')
  function pickVoice(lang) {
    const list = voices.filter((v) => norm(v.lang).startsWith(lang));
    if (!list.length) return null;
    const score = (v) => {
      const n = v.name.toLowerCase();
      let s = 0;
      if (/natural|online|neural|premium|enhanced/.test(n)) s += 3;
      if (/google/.test(n)) s += 2;
      if (lang === 'en' && norm(v.lang) === 'en-us') s += 1;
      if (v.localService) s += 0.5;
      return s;
    };
    return list.slice().sort((a, b) => score(b) - score(a))[0];
  }

  function utter(text, lang, rate) {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.lang = v ? v.lang : (lang === 'vi' ? 'vi-VN' : 'en-US');
    u.rate = rate || (lang === 'en' ? 0.85 : 0.95);
    u.pitch = 1.05;
    return u;
  }
  const muted = () => { const st = App.Store.state; return !synth || (st && !st.settings.voice); };

  App.Speech = {
    supported: !!synth,
    has(lang) {
      if (!voices.length) refresh();
      return !!pickVoice(lang);
    },
    speak(text, lang = 'vi', { rate } = {}) {
      if (!text || muted()) return;
      if (!voices.length) refresh();
      synth.cancel();
      synth.speak(utter(text, lang, rate));
    },
    // Đọc nối tiếp nhiều đoạn khác thứ tiếng: [['Nghe và chọn hình đúng.', 'vi'], ['kite', 'en']]
    say(list) {
      if (!list || !list.length || muted()) return;
      if (!voices.length) refresh();
      synth.cancel();
      const hasEn = list.some(([, l]) => l === 'en');
      for (const [text, lang = 'vi', rate] of list) {
        if (!text) continue;
        // Máy chưa có giọng Việt: bỏ phần tiếng Việt, chỉ đọc phần tiếng Anh (khỏi đọc sai giọng)
        if (lang === 'vi' && hasEn && voices.length && !pickVoice('vi')) continue;
        synth.speak(utter(text, lang, rate));
      }
    },
    stop() { if (synth) synth.cancel(); },
  };
})(window.App);
