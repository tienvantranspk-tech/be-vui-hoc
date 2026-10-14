/* Tiến độ, sao, xu, thú cưng, sticker, huy hiệu và chuỗi ngày học */
(function (App) {
  'use strict';
  const U = App.U;
  const S = () => App.Store.state;
  const R = {};

  // ===== Tiến độ các chặng =====
  R.key = (subjectId, topicId, stageId) => `${subjectId}/${topicId}/${stageId}`;
  R.playable = (stage) => !!(stage.plan || stage.make);

  // Tất cả các chặng chơi được của một môn, theo đúng thứ tự trên bản đồ
  R.stages = (subject) => {
    const out = [];
    for (const t of subject.topics) {
      for (const s of t.stages) {
        if (R.playable(s)) out.push({ subject, topic: t, stage: s, key: R.key(subject.id, t.id, s.id) });
      }
    }
    return out;
  };
  R.done = (key) => !!S().progress[key];
  R.starsOf = (key) => (S().progress[key] ? S().progress[key].stars : 0);
  R.isUnlocked = (subject, key) => {
    if (S().settings.unlockAll) return true;
    const list = R.stages(subject);
    const i = list.findIndex((x) => x.key === key);
    if (i < 0) return false;
    return i === 0 || R.done(list[i - 1].key);
  };
  R.currentKey = (subject) => {
    const x = R.stages(subject).find((s) => !R.done(s.key));
    return x ? x.key : null;
  };
  R.nextStage = (subject, key) => {
    const list = R.stages(subject);
    const i = list.findIndex((x) => x.key === key);
    return i >= 0 ? list[i + 1] || null : null;
  };
  R.totalStars = (subjectId) => {
    let t = 0;
    for (const k in S().progress) if (!subjectId || k.startsWith(subjectId + '/')) t += S().progress[k].stars || 0;
    return t;
  };
  R.summary = (subject) => {
    const list = R.stages(subject);
    return { done: list.filter((x) => R.done(x.key)).length, total: list.length, stars: R.totalStars(subject.id) };
  };

  // Số sao theo tỉ lệ câu trả lời đúng ngay lần đầu
  R.starsFor = (total, firstTry) => {
    const r = total ? firstTry / total : 0;
    return r >= 0.85 ? 3 : r >= 0.6 ? 2 : 1;
  };

  // ===== Ghi nhận câu trả lời & thời gian học =====
  R.today = () => {
    const k = U.dayKey();
    const days = S().days;
    return days[k] || (days[k] = { sec: 0, q: 0, ok: 0, stages: 0 });
  };
  R.addTime = (sec) => { R.today().sec += sec; };
  R.recordAnswer = (q, ok) => {
    const st = S();
    const sk = q.skill || 'khac';
    const rec = st.skills[sk] || (st.skills[sk] = { n: 0, ok: 0 });
    rec.n++;
    if (ok) rec.ok++;
    const day = R.today();
    day.q++;
    if (ok) day.ok++;
    const key = R.mistakeKey(q);
    if (!ok) {
      // Ghi câu sai (mỗi câu chỉ giữ một bản, mới nhất lên đầu)
      const copy = JSON.parse(JSON.stringify(q));
      delete copy._review;
      delete copy._sid;
      st.mistakes = st.mistakes.filter((m) => R.mistakeKey(m.q) !== key);
      st.mistakes.unshift({ t: Date.now(), skill: sk, sid: q._sid || null, q: copy });
      if (st.mistakes.length > 60) st.mistakes.length = 60;
    } else if (q._review) {
      // Ôn lại và làm đúng ngay → bỏ khỏi danh sách câu sai
      st.mistakes = st.mistakes.filter((m) => R.mistakeKey(m.q) !== key);
    }
  };

  // ===== Ôn lại câu sai =====
  R.mistakeKey = (q) => {
    const ans = q.answer != null ? q.answer
      : q.pairs ? q.pairs.map((p) => (typeof p[0] === 'object' ? p[0].html : p[0])) : q.items || '';
    return [q.type, q.prompt, q.big || '', JSON.stringify(ans)].join('|');
  };
  R.mistakeCount = () => new Set(S().mistakes.map((m) => R.mistakeKey(m.q))).size;
  // Lấy tối đa max câu sai gần nhất (không trùng) để bé làm lại; các ô sắp xếp được xáo lại
  R.reviewQuestions = (max = 10) => {
    const seen = new Set();
    const out = [];
    for (const m of S().mistakes) {
      const key = R.mistakeKey(m.q);
      if (seen.has(key)) continue;
      seen.add(key);
      const q = JSON.parse(JSON.stringify(m.q));
      q._review = true;
      q._sid = m.sid;
      if (q.type === 'order' && q.items.length > 1) {
        let items;
        do { items = U.shuffle(q.items); } while (items.join('|') === q.answer.join('|') && new Set(q.items).size > 1);
        q.items = items;
      }
      if (q.type === 'sort') q.items = U.shuffle(q.items);
      out.push(q);
      if (out.length >= max) break;
    }
    return out;
  };
  // Ôn xong: thưởng xu (1 xu mỗi câu sửa đúng + 3 xu chăm chỉ), thú cưng vui hơn
  R.completeReview = function ({ total, firstTry }) {
    const st = S();
    const coins = firstTry + 3;
    st.coins += coins;
    R.touchStreak();
    let levelUp = false;
    const pet = st.pet;
    if (pet) {
      R.petTick(pet);
      const before = R.petLevel(pet);
      pet.xp += 5 + firstTry;
      pet.happy = U.clamp(pet.happy + 6, 0, 100);
      levelUp = R.petLevel(pet) > before;
    }
    App.Store.save();
    return { stars: R.starsFor(total, firstTry), coins, gifts: [], badges: [], levelUp, petLevel: pet ? R.petLevel(pet) : 0, left: R.mistakeCount() };
  };

  // ===== Giới hạn thời gian học mỗi ngày =====
  R.limitSec = () => {
    const lim = S().settings.dailyLimit || 0;
    return lim ? (lim + (R.today().extra || 0)) * 60 : Infinity;
  };
  R.timeLeft = () => R.limitSec() - R.today().sec;
  R.overLimit = () => R.timeLeft() <= 0;
  R.addExtraTime = (min) => { const d = R.today(); d.extra = (d.extra || 0) + min; App.Store.save(); };

  // ===== Chuỗi ngày học liên tiếp =====
  R.touchStreak = () => {
    const s = S().streak;
    const today = U.dayKey();
    if (s.last === today) return;
    s.cur = s.last && U.daysBetween(s.last, today) === 1 ? s.cur + 1 : 1;
    s.last = today;
    s.best = Math.max(s.best, s.cur);
  };
  R.streakNow = () => {
    const s = S().streak;
    if (!s.last) return 0;
    return U.daysBetween(s.last, U.dayKey()) <= 1 ? s.cur : 0;
  };

  // ===== Hoàn thành một chặng → tính phần thưởng =====
  R.completeStage = function ({ subject, topic, stage, total, firstTry }) {
    const st = S();
    const key = R.key(subject.id, topic.id, stage.id);
    const prev = st.progress[key];
    const stars = R.starsFor(total, firstTry);
    const prevStars = prev ? prev.stars : 0;
    const firstClear = !prev;
    st.progress[key] = {
      stars: Math.max(prevStars, stars),
      best: Math.max(prev ? prev.best : 0, firstTry),
      total,
      plays: (prev ? prev.plays : 0) + 1,
      last: Date.now(),
    };

    // Xu: 1 xu mỗi câu đúng ngay + 2 xu mỗi sao + 5 xu khi qua chặng lần đầu + 10 xu cho chặng đầu tiên trong ngày
    const day = R.today();
    const dailyBonus = day.stages === 0 ? 10 : 0;
    day.stages++;
    let coins = firstTry + stars * 2 + (firstClear ? 5 : 0) + dailyBonus;

    R.touchStreak();

    // Thú cưng vui hơn và lớn lên cùng bé
    let levelUp = false;
    const pet = st.pet;
    if (pet) {
      R.petTick(pet);
      const before = R.petLevel(pet);
      pet.xp += 10 + stars * 5;
      pet.happy = U.clamp(pet.happy + 8, 0, 100);
      levelUp = R.petLevel(pet) > before;
    }

    // Quà sticker: lần đầu qua chặng, và lần đầu đạt 3 sao (hết sticker thì tặng xu)
    const gifts = [];
    const n = (firstClear ? 1 : 0) + (stars === 3 && prevStars < 3 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const s = R.drawSticker();
      if (s) gifts.push(s); else coins += 10;
    }

    st.coins += coins;
    const badges = R.checkBadges(subject, topic);
    App.Store.save();
    return { stars, prevStars, coins, dailyBonus, firstClear, gifts, badges, levelUp, petLevel: pet ? R.petLevel(pet) : 0 };
  };

  // ===== Thú cưng =====
  R.xpForLevel = (lv) => 20 * (lv - 1) * lv; // cấp 2: 40 XP, cấp 3: 120, cấp 4: 240, cấp 5: 400…
  R.petLevel = (pet) => { let lv = 1; while (pet.xp >= R.xpForLevel(lv + 1)) lv++; return lv; };
  R.petLevelProgress = (pet) => {
    const lv = R.petLevel(pet);
    const a = R.xpForLevel(lv), b = R.xpForLevel(lv + 1);
    return (pet.xp - a) / (b - a);
  };
  R.petScale = (pet) => 0.85 + Math.min(R.petLevel(pet) - 1, 15) * 0.025; // lớn dần theo cấp
  R.petTitle = (pet) => {
    const lv = R.petLevel(pet);
    let t = '';
    for (const [l, name] of App.Data.petTitles) if (lv >= l) t = name;
    return t;
  };
  R.petKind = (pet) => App.Data.pets.find((p) => p.id === pet.kind) || App.Data.pets[0];

  // Độ no / độ vui giảm dần theo thời gian thật – nhẹ nhàng, không bao giờ xuống dưới 15
  R.petTick = (pet) => {
    if (!pet) return;
    const now = Date.now();
    const hours = (now - (pet.updatedAt || now)) / 3600000;
    if (hours > 0.02) {
      pet.full = Math.max(Math.min(pet.full, 15), pet.full - hours * 4);
      pet.happy = Math.max(Math.min(pet.happy, 15), pet.happy - hours * 3);
      pet.updatedAt = now;
    }
  };
  R.petMood = (pet) => (Math.min(pet.full, pet.happy) < 35 ? 'sad' : 'happy');
  R.petSays = (pet) => {
    const name = S().profile ? S().profile.name : 'bạn';
    if (pet.full < 35) return U.pick(['Mình đói bụng quá… 🥺', `${name} ơi, cho mình ăn với! 🍎`, 'Bụng mình kêu ọc ọc rồi 😋']);
    if (pet.happy < 35) return U.pick(['Chơi với mình đi! 🥺', `Mình nhớ ${name} quá!`]);
    return U.pick([
      `Chào ${name}! Hôm nay mình học gì nhỉ? 📚`, 'Cùng đi phiêu lưu nào! 🗺️', `${name} giỏi quá! 💕`,
      'Học xong mình được ăn bánh nha! 🧁', 'Thử một chặng mới nhé! ⭐', 'Mình thích học cùng bạn lắm! 🥰',
    ]);
  };
  R.petPat = (pet) => {
    R.petTick(pet);
    pet.happy = U.clamp(pet.happy + 2, 0, 100);
    App.Store.save();
  };
  R.feed = function (foodId) {
    const st = S(), pet = st.pet;
    const food = App.Data.foods.find((f) => f.id === foodId);
    if (!pet || !food) return { ok: false };
    if (st.coins < food.price) return { ok: false, reason: 'coins' };
    R.petTick(pet);
    const treat = food.happy >= 10;
    if (pet.full >= 98 && (!treat || pet.happy >= 98)) return { ok: false, reason: 'full' };
    const fav = R.petKind(pet).fav === food.id;
    st.coins -= food.price;
    pet.full = U.clamp(pet.full + food.full, 0, 100);
    pet.happy = U.clamp(pet.happy + food.happy + (fav ? 15 : 0), 0, 100);
    const before = R.petLevel(pet);
    pet.xp += fav ? 6 : 3;
    App.Store.save();
    return { ok: true, fav, food, levelUp: R.petLevel(pet) > before };
  };
  R.buyAccessory = function (id) {
    const st = S(), pet = st.pet;
    const item = App.Data.accessories.find((a) => a.id === id);
    if (!pet || !item) return { ok: false };
    pet.owned = pet.owned || [];
    pet.wear = pet.wear || {};
    if (pet.owned.includes(id)) return { ok: true, owned: true };
    if (st.coins < item.price) return { ok: false, reason: 'coins' };
    st.coins -= item.price;
    pet.owned.push(id);
    pet.wear[item.slot] = id;
    pet.happy = U.clamp(pet.happy + 10, 0, 100);
    App.Store.save();
    return { ok: true, bought: true, item };
  };
  R.toggleWear = function (id) {
    const pet = S().pet;
    const item = App.Data.accessories.find((a) => a.id === id);
    if (!pet || !item || !(pet.owned || []).includes(id)) return false;
    pet.wear = pet.wear || {};
    pet.wear[item.slot] = pet.wear[item.slot] === id ? null : id;
    App.Store.save();
    return pet.wear[item.slot] === id;
  };

  // ===== Sticker =====
  R.allStickers = () => App.Data.stickerSets.flatMap((set) =>
    set.items.map(([id, emoji, vi, en]) => ({ id, emoji, vi, en, set: set.id })));
  R.drawSticker = () => {
    const st = S();
    const left = R.allStickers().filter((s) => !st.stickers[s.id]);
    if (!left.length) return null;
    const s = U.pick(left);
    st.stickers[s.id] = Date.now();
    return s;
  };

  // ===== Huy hiệu =====
  R.topicBadgeId = (subject, topic) => `topic:${subject.id}/${topic.id}`;
  R.allBadges = () => {
    const list = App.Data.badges.slice();
    for (const sid of Object.keys(App.Curriculum || {})) {
      const sub = App.Curriculum[sid];
      for (const t of sub.topics) {
        if (t.stages.some(R.playable)) list.push(R.badgeInfo(R.topicBadgeId(sub, t)));
      }
    }
    return list;
  };
  R.badgeInfo = (id) => {
    if (id.startsWith('topic:')) {
      const [sid, tid] = id.slice(6).split('/');
      const sub = App.Curriculum[sid];
      const t = sub && sub.topics.find((x) => x.id === tid);
      return { id, emoji: t ? t.icon : '🏆', name: 'Chinh phục ' + (t ? t.short : 'chủ đề'), desc: t ? `${sub.name}: ${t.name}` : '' };
    }
    return App.Data.badges.find((b) => b.id === id) || { id, emoji: '🏅', name: id, desc: '' };
  };
  R.checkBadges = function (subject, topic) {
    const st = S();
    const earned = [];
    const give = (id) => {
      if (!st.badges[id]) { st.badges[id] = Date.now(); earned.push(R.badgeInfo(id)); }
    };
    const stars = R.totalStars();
    if (Object.keys(st.progress).length >= 1) give('first');
    if (st.streak.cur >= 3) give('streak3');
    if (st.streak.cur >= 7) give('streak7');
    if (stars >= 30) give('stars30');
    if (stars >= 100) give('stars100');
    if (Object.values(st.progress).filter((p) => p.stars === 3).length >= 5) give('perfect5');
    if (st.pet && R.petLevel(st.pet) >= 5) give('pet5');
    if (Object.keys(st.stickers).length >= 20) give('stickers20');
    if (subject && topic) {
      const all = topic.stages.filter(R.playable);
      if (all.length && all.every((s) => R.done(R.key(subject.id, topic.id, s.id)))) give(R.topicBadgeId(subject, topic));
    }
    return earned;
  };

  App.Rewards = R;
})(window.App);
