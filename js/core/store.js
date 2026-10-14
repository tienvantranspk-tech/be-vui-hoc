/* Lưu & đọc dữ liệu của bé trên máy (localStorage) */
(function (App) {
  'use strict';
  const KEY = 'bevuihoc.lop2';   // chỗ lưu trong trình duyệt

  const VERSION = 2;
  function defaults() {
    return {
      version: VERSION,
      createdAt: Date.now(),
      profile: null,      // { name }
      pet: null,          // { kind, name, xp, full, happy, updatedAt, wear: {head, face, neck}, owned: [] }
      coins: 0,
      progress: {},       // 'toan/c1/b1' → { stars, best, total, plays, last }
      stickers: {},       // id sticker → thời điểm nhận
      badges: {},         // id huy hiệu → thời điểm nhận
      skills: {},         // id kỹ năng → { n: số câu, ok: số câu đúng ngay lần đầu }
      mistakes: [],       // các câu bé làm sai gần đây (để ôn lại): { t, skill, sid, q }
      // '2026-10-13' → { sec, q, ok, stages, extra (phút bố mẹ cho thêm), lv: { 'toan.cb': [số câu, đúng ngay], 'toan.nc': … } }
      days: {},
      streak: { cur: 0, best: 0, last: null },
      // dailyLimit: số phút được học mỗi ngày (0 = không giới hạn)
      // level: 'co-ban' (chỉ câu theo sách giáo khoa) | 'tron' (xen khoảng 3/10 câu nâng cao) | 'nang-cao' (xen khoảng 5/10)
      settings: { sound: true, voice: true, autoRead: false, unlockAll: false, dailyLimit: 0, level: 'tron' },
    };
  }
  // Nâng cấp dữ liệu cũ: bản 1 mặc định "chỉ cơ bản" → bản 2 mặc định trộn câu cơ bản với câu nâng cao
  function migrate(st) {
    if ((st.version || 1) < 2) {
      if (st.settings.level === 'co-ban') st.settings.level = 'tron';
      st.version = 2;
    }
    return st;
  }
  const APP_ID = 'bevuihoc.lop2';

  // Gộp dữ liệu đã lưu vào khung mặc định, để khi app thêm tính năng mới thì dữ liệu cũ vẫn dùng được
  function merge(base, saved) {
    if (saved === undefined) return base;
    if (!isObj(base) || !isObj(saved)) return saved;
    const out = { ...base };
    for (const k of Object.keys(saved)) out[k] = merge(base[k], saved[k]);
    return out;
  }
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  const Store = {
    state: null,
    load() {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
      this.state = saved ? migrate(merge(defaults(), saved)) : defaults();
      this.prune();
      return this.state;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); }
      catch (e) { console.warn('Không lưu được dữ liệu', e); }
    },
    reset() {
      this.state = defaults();
      this.save();
    },
    // ---- Sao lưu & khôi phục ----
    exportText() {
      return JSON.stringify({ app: APP_ID, version: 1, exportedAt: new Date().toISOString(), state: this.state });
    },
    // Đọc tệp sao lưu → trả về dữ liệu của bé, hoặc null nếu không phải tệp của app
    parseBackup(text) {
      let obj;
      try { obj = JSON.parse(text); } catch (e) { return null; }
      const st = obj && obj.app === APP_ID ? obj.state : null;
      if (!isObj(st) || !isObj(st.profile) || !st.profile.name || !isObj(st.progress)) return null;
      return { state: st, exportedAt: obj.exportedAt || null };
    },
    replace(saved) {
      this.state = migrate(merge(defaults(), saved));
      this.prune();
      this.save();
    },
    // Chỉ giữ thống kê 90 ngày gần nhất
    prune() {
      const keys = Object.keys(this.state.days).sort();
      while (keys.length > 90) delete this.state.days[keys.shift()];
      if (this.state.mistakes.length > 60) this.state.mistakes.length = 60;
    },
  };

  App.Store = Store;
})(window.App);
