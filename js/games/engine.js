/* Bộ máy chạy một lượt chơi: hiện câu hỏi → chấm → khen hoặc gợi ý → sang câu tiếp */
(function (App) {
  'use strict';
  const { h, pick } = App.U;

  const PRAISE = ['Đúng rồi!', 'Giỏi quá!', 'Tuyệt vời!', 'Chính xác!', 'Hoan hô!', 'Xuất sắc!', 'Siêu quá!'];
  const PRAISE_ICON = ['🎉', '🌟', '👏', '🥳', '💯', '✨'];
  const TRY_AGAIN = ['Chưa đúng rồi, bé thử lại nhé!', 'Gần đúng rồi, thử lần nữa nào!', 'Bình tĩnh nghĩ lại nhé!'];

  // Tạo bộ câu hỏi cho một chặng từ kế hoạch: plan = [[hàm tạo câu, số câu], …]
  // Trộn câu nâng cao (stage.adv) với câu cơ bản theo mức bố mẹ chọn: "tron" ≈ 3/10, "nang-cao" ≈ 5/10.
  // Câu nâng cao được đánh dấu lv = 'nc' để Góc phụ huynh đánh giá riêng.
  const ADV_RATIO = { tron: 0.3, 'nang-cao': 0.5 };
  App.makeQuestions = function (stage) {
    if (stage.make) return stage.make();
    let out = [];
    const seen = new Set();
    // Dấu hiệu nhận ra câu trùng (dạng sắp xếp: so theo đáp án, vì các ô đã bị xáo trộn)
    const sig = (q) => [q.type, q.prompt, q.big, JSON.stringify(q.answer == null ? '' : q.answer),
      JSON.stringify(q.type === 'order' ? '' : q.items || q.pairs || q.visual || '')].join('|');
    const make = (gen) => {
      let q, tries = 0;
      do { q = gen(); tries++; } while (seen.has(sig(q)) && tries < 30);
      seen.add(sig(q));
      return q;
    };
    const build = (plan) => { const a = []; for (const [gen, n] of plan) for (let k = 0; k < n; k++) a.push(make(gen)); return a; };
    if (stage.sections) {
      // Chặng theo một bài trong sách: các phần (Đọc, Viết, Chính tả…) lần lượt như trong sách, mỗi phần có nhãn riêng
      out = stage.sections.flatMap((sec) => App.spreadTypes(build(sec.plan)).map((q) => { q.part = sec.label; return q; }));
    } else {
      out = build(stage.plan);
      if (stage.shuffle) out = App.U.shuffle(out);
    }
    if (stage.bonus) out.forEach((q) => { q.tag = '🧠 Thử thách'; q.lv = 'nc'; });
    const st = App.Store.state;
    const ratio = (st && ADV_RATIO[st.settings.level]) || 0;
    const adv = !stage.bonus && ratio && stage.adv;
    if (adv && (adv.cur.length || adv.prev.length)) {
      // Chặng theo bài: thêm câu nâng cao ở cuối (không bỏ phần nào của bài); chặng thường: thay một số câu cơ bản
      const k = stage.sections ? Math.max(1, Math.round(out.length * ratio * 0.6)) : Math.max(2, Math.round(out.length * ratio));
      const drop = new Set(stage.sections ? [] : App.U.sample(out.map((_, i) => i), k));
      // ưu tiên dạng nâng cao của chủ đề đang học, không lặp một dạng khi còn dạng khác
      const cur = App.U.shuffle(adv.cur), prev = App.U.shuffle(adv.prev);
      out = out.filter((_, i) => !drop.has(i));
      for (let j = 0; j < k; j++) {
        const fromCur = cur.length && (!prev.length || Math.random() < 0.75);
        const list = fromCur ? cur : prev;
        const q = make(list[j % list.length]);
        q.tag = '🔥 Nâng cao';
        q.lv = 'nc';
        if (stage.sections) { q.part = '🔥 Thử sức'; out.push(q); }
        else out.splice(App.U.rand(1, out.length), 0, q); // xen vào giữa các câu cơ bản (câu đầu tiên luôn là câu cơ bản)
      }
    }
    if (!stage.sections) out = App.spreadTypes(out);
    // Trò chơi nhỏ: câu chọn đáp án ngắn (số, dấu, chữ) đôi khi hiện đáp án thành bóng bay, cá bơi, hộp quà
    const SKINS = ['balloon', 'fish', 'gift'];
    out.forEach((q) => {
      if (q.type === 'choice' && !q.views && !q.skin && q.optStyle !== 'text' && q.options.every((o) => String(o).length <= 6) && Math.random() < 0.35) q.skin = App.U.pick(SKINS);
    });
    out.forEach((q, k) => { q._no = k + 1; }); // số thứ tự bài tập, hiện như trong vở: 1, 2, 3…
    return out;
  };

  // "Kiểu" của câu theo cái bé nhìn thấy: dạng thao tác + hình minh họa + kiểu đáp án
  App.kindOf = (q) => [q.type, q.visual ? q.visual.kind : '', q.type === 'choice' ? q.optStyle || (q.views ? 'pic' : '') : '', q.mode || ''].join(':');
  // Trộn dạng bài: không để quá 2 câu cùng một kiểu đứng liền nhau (giữ gần đúng thứ tự cũ)
  App.spreadTypes = function (list) {
    const out = [], rest = list.slice();
    const K = App.kindOf;
    while (rest.length) {
      const n = out.length;
      const bad = (q) => n >= 2 && K(out[n - 1]) === K(q) && K(out[n - 2]) === K(q);
      let k = rest.findIndex((q) => !bad(q));
      if (k < 0) k = 0;
      out.push(rest.splice(k, 1)[0]);
    }
    return out;
  };

  // Gắn câu nâng cao vào các chặng của một môn và thêm chặng "🧠 Thử thách tư duy" ở cuối mỗi chủ đề.
  // pools: { idChủĐề: [[hàm tạo câu, idChặng bắt đầu dùng được], …] }
  // whole: { idChủĐề: [hàm tạo câu, …] } – chủ đề ôn tập: dùng được tất cả ngay từ chặng đầu
  App.attachAdvanced = function (subject, pools, whole = {}) {
    const prev = []; // các dạng nâng cao của những chủ đề đã học trước
    // Lấy lần lượt từng dạng (xáo trộn), hết lượt thì xáo lại → các câu trong chặng ít trùng dạng
    const mix = (list) => { let bag = []; return () => { if (!bag.length) bag = App.U.shuffle(list); return bag.pop()(); }; };
    subject.topics.forEach((topic) => {
      const list = pools[topic.id] || [];
      const all = whole[topic.id] || list.map(([g]) => g);
      const main = topic.stages.filter((s) => App.Rewards.playable(s) && !s.bonus);
      main.forEach((stage, i) => {
        const cur = whole[topic.id] ? all.slice()
          : list.filter(([, from]) => { const k = main.findIndex((s) => s.id === from); return k >= 0 && k <= i; }).map(([g]) => g);
        stage.adv = { cur, prev: prev.slice() };
      });
      let pool = all.slice();
      if (pool.length < 6) pool = pool.concat(App.U.sample(prev.filter((g) => !pool.includes(g)), 6 - pool.length));
      if (pool.length && main.length && !topic.stages.some((s) => s.bonus)) {
        topic.stages.push({ id: 'tt-' + topic.id, short: '🧠 Thử thách', name: `Thử thách tư duy: ${topic.name}`, icon: '🧠',
          bonus: true, shuffle: true, plan: [[mix(pool), 8]] });
      }
      if (!whole[topic.id]) list.forEach(([g]) => { if (!prev.includes(g)) prev.push(g); });
    });
  };

  // Đáp án điền vào ô "?" và đáp án để báo cho bé (có thể kèm đơn vị, hoặc tên hình "Hình 2")
  const slotText = (q) => String(q.slotAnswer != null ? q.slotAnswer : q.answer);
  const answerText = (q) => {
    if (q.answerLabel) return q.answerLabel;
    if (q.type === 'order') return q.answer.join(', ');
    if (q.type === 'match' || q.type === 'sort') return '';
    if (Array.isArray(q.answer)) return q.answer.join(' · ');
    return slotText(q) + (q.unit ? ' ' + q.unit : '');
  };
  const speakText = (q) => q.speak ||
    [q.prompt, q.big && q.big.trim() !== '?' ? App.U.mathSpeak(q.big) : ''].filter(Boolean).join('. ');
  // Lời đọc là một chuỗi (một thứ tiếng) hoặc danh sách [[câu, 'vi' | 'en'], …] đọc nối tiếp (bài Tiếng Anh)
  const talk = (x, lang) => (Array.isArray(x) ? App.Speech.say(x) : App.Speech.speak(x, lang));
  // Đọc lời giải: đổi kí hiệu sang lời ("5 kg" → "5 ki-lô-gam", "(l)" → "(lít)")
  const speakPlain = (t) => t
    .replace(/−/g, ' trừ ')
    .replace(/(\d|\()\s*kg(?!\p{L})/gu, '$1 ki-lô-gam')
    .replace(/(\d|\()\s*km(?!\p{L})/gu, '$1 ki-lô-mét')
    .replace(/(\d|\()\s*dm(?!\p{L})/gu, '$1 đề-xi-mét')
    .replace(/(\d|\()\s*cm(?!\p{L})/gu, '$1 xăng-ti-mét')
    .replace(/(\d|\()\s*m(?!\p{L})/gu, '$1 mét')
    .replace(/(\d|\()\s*l(?!\p{L})/gu, '$1 lít');
  // Những loại hình nên đặt bên trái, phần trả lời bên phải khi máy xoay ngang
  const SPLIT = new Set(['balance', 'balances', 'bottles', 'cups', 'jars', 'clock', 'digital', 'calendar',
    'geo', 'ruler', 'shapes', 'grid', 'vertical', 'blocks', 'tenframe', 'scatter', 'bag', 'picto', 'money', 'listen', 'pic', 'svg', 'chat']);

  App.Engine = {
    // root: vùng chơi; opts: { questions, bar, pet, comboEl, onFinish({ total, firstTry }) }
    start(root, opts) {
      const qs = opts.questions;
      const startedAt = Date.now();
      let i = 0, attempts = 0, firstTry = 0, combo = 0, advFirstTry = 0; // advFirstTry: câu nâng cao làm đúng ngay
      let ctrl = null, slot = null, timer = null, busy = false, finished = false, rightCol = null, placeholder = '?';
      const area = h('div.q-area');
      const fb = h('div.feedback');
      root.append(area, fb);

      function show() {
        const q = qs[i];
        attempts = 0;
        busy = false;
        q._t0 = Date.now(); // đo thời gian từ lúc hiện câu hỏi đến lần trả lời đầu tiên
        q._ms = null;
        if (ctrl && ctrl.destroy) ctrl.destroy();
        area.innerHTML = '';
        area.scrollTop = 0;
        opts.bar.style.width = (i / qs.length) * 100 + '%';
        const lang = q.lang || 'vi';
        area.appendChild(h('div.q-head',
          h('button.icon-btn', { 'aria-label': 'Đọc đề', onclick: () => talk(speakText(q), lang) }, '🔊'),
          q._no ? h('span.q-no', { 'aria-label': 'Bài ' + q._no }, String(q._no)) : null,
          h('div.q-prompt', q.part && !q.tag ? h('span.q-part', q.part) : null, q.tag ? h('span.q-tag', q.tag) : null, q.prompt, q.sub ? h('div.q-sub', q.sub) : null)));
        const left = h('div.q-left');
        rightCol = h('div.q-right');
        if (q.passage) {
          // Bài đọc ngắn (đọc hiểu)
          const read = () => App.Speech.speak(`${q.passage.title}. ${q.passage.text}`, 'vi');
          left.appendChild(h('div.passage',
            h('div.p-head', h('button.icon-btn', { 'aria-label': 'Đọc bài', onclick: read }, '🔊'), h('div.p-title', q.passage.title)),
            h('div.p-text', q.passage.text)));
        }
        if (q.visual) left.appendChild(h('div.q-visual', App.Visuals.render(q.visual)));
        slot = null;
        placeholder = q.slotPlaceholder || '?'; // câu hỏi về dấu câu: ô trống để trắng (vì "?" cũng là một đáp án)
        if (q.big) {
          const bigEl = renderBig(q.big, q.bigText, q.bigRaw);
          if (q.bigClass) bigEl.classList.add(...q.bigClass.split(' '));
          rightCol.appendChild(bigEl);
        }
        const answers = h('div.answers');
        rightCol.appendChild(answers);
        const split = q.passage || q.split || (q.visual && SPLIT.has(q.visual.kind));
        area.appendChild(h('div.q-body', { class: split ? 'split' : '' }, left, rightCol));
        ctrl = App.QTypes[q.type].render(q, answers, { submit, done, slot, card: area, left });
        // Tự đọc: cả đề (khi bật "Tự đọc đề bài"), hoặc chỉ phần cần nghe của bài nghe tiếng Anh
        const auto = App.Store.state.settings.autoRead || q.autoSpeak ? speakText(q) : q.autoSay;
        if (auto) setTimeout(() => { if (qs[i] === q && !finished) talk(auto, lang); }, 350);
      }

      // Biểu thức to: dấu "?" đầu tiên là ô trả lời, {kg} {l} {cm} là đơn vị (chữ nhỏ hơn).
      // raw: giữ nguyên chữ (câu hỏi tiếng Anh có dấu "?" thật)
      function renderBig(big, asText, raw) {
        const el = h('div.q-big', { class: asText ? 'text' : '' });
        if (raw) { el.textContent = big; return el; }
        const addText = (text) => text.split(/\{(\w+)\}/).forEach((t, j) => {
          if (!t) return;
          el.appendChild(j % 2 ? h('span.unit', t) : document.createTextNode(t));
        });
        String(big).split('?').forEach((part, k, arr) => {
          addText(part);
          if (k < arr.length - 1) {
            if (!slot) { slot = h('span.slot', placeholder); el.appendChild(slot); }
            else el.appendChild(document.createTextNode('?'));
          }
        });
        return el;
      }

      function submit(value) {
        if (busy || finished) return;
        const q = qs[i];
        if (q._ms == null) q._ms = Date.now() - q._t0;
        const ok = App.QTypes[q.type].check(q, value);
        ctrl.showResult(ok, value);
        if (ok) { success(attempts === 0); return; }
        attempts++;
        combo = 0;
        updateCombo();
        App.Sound.play('wrong');
        App.UI.petAnim(opts.pet, 'oops');
        busy = true;
        if (attempts < 2) {
          showHint(q);
          setTimeout(() => { busy = false; ctrl.retry(); }, 900);
        } else {
          ctrl.reveal();
          if (opts.onAnswer) opts.onAnswer(false, false);
          fillSlot(q);
          App.Rewards.recordAnswer(q, false);
          showFeedback(false, q, false);
          echo(q);
        }
      }

      // Bài Tiếng Anh: đọc lại từ / câu đúng để bé nghe và nhớ
      function echo(q) {
        if (q.echo) setTimeout(() => { if (qs[i] === q) App.Speech.speak(q.echo, 'en'); }, 250);
      }

      // Dạng tự chấm (nối cặp) báo đã xong
      function done(firstTryOk) {
        if (busy || finished) return;
        const q = qs[i];
        if (q._ms == null) q._ms = Date.now() - q._t0;
        success(firstTryOk);
      }

      function success(firstTryOk) {
        busy = true;
        const q = qs[i];
        if (firstTryOk) { firstTry++; combo++; if (q.lv === 'nc') advFirstTry++; } else combo = 0;
        updateCombo();
        App.Rewards.recordAnswer(q, firstTryOk);
        fillSlot(q);
        App.Sound.play('correct');
        App.UI.petAnim(opts.pet, 'jump');
        if (combo >= 3 && combo % 3 === 0) App.UI.confetti(25);
        if (opts.onAnswer) opts.onAnswer(true, firstTryOk);
        showFeedback(true, q, firstTryOk);
        echo(q);
      }

      function fillSlot(q) {
        if (!slot || (q.type !== 'choice' && q.type !== 'input')) return;
        slot.textContent = slotText(q);
        slot.classList.remove('typing', 'wrong');
        slot.classList.add('filled');
      }

      // Gợi ý hiện bên dưới phần trả lời (không đẩy các nút lên xuống làm bé bấm nhầm)
      function showHint(q) {
        let el = area.querySelector('.q-hint');
        if (!el) {
          el = h('div.q-hint');
          (rightCol || area).appendChild(el);
        }
        el.textContent = '💡 ' + (q.hint || pick(TRY_AGAIN));
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      function showFeedback(good, q, firstTryOk) {
        fb.className = 'feedback ' + (good ? 'good' : 'bad');
        fb.innerHTML = '';
        const title = good ? pick(PRAISE) : 'Chưa đúng rồi!';
        let sub = '';
        const ans = answerText(q);
        // Lời giải đã bắt đầu bằng đáp án (câu tiếng Anh) thì gộp lại, khỏi lặp hai lần
        if (!good) sub = ans && q.explain && ans.length > 2 && q.explain.startsWith(ans) ? 'Đáp án đúng: ' + q.explain
          : (ans ? 'Đáp án đúng: ' + ans : '') + (q.explain ? '\n' + q.explain : '');
        else if (!firstTryOk && q.explain) sub = q.explain;
        sub = sub.trim();
        fb.append(
          h('div.fb-ico', good ? pick(PRAISE_ICON) : '🤔'),
          h('div.fb-text', h('div.fb-title', title), sub && h('div.fb-sub', sub)),
          sub && h('button.icon-btn', { 'aria-label': 'Đọc lời giải', onclick: () => talk(q.sayExplain || speakPlain(sub), q.lang || 'vi') }, '🔊'),
          h('button.btn', { class: good ? 'green' : 'red', onclick: next }, 'Tiếp tục ▶'));
        void fb.offsetWidth; // ép trình duyệt vẽ lại để hiệu ứng trượt lên chạy được
        fb.classList.add('show');
        // Đúng ngay lần đầu → tự sang câu sau (chờ đọc xong từ / câu tiếng Anh)
        if (good && firstTryOk) timer = setTimeout(next, q.echo ? Math.min(4500, 1600 + q.echo.length * 55) : 1500);
      }

      function next() {
        if (finished) return;
        clearTimeout(timer);
        fb.classList.remove('show');
        App.Speech.stop();
        i++;
        if (i >= qs.length) {
          finished = true;
          opts.bar.style.width = '100%';
          if (ctrl && ctrl.destroy) ctrl.destroy();
          const advTotal = qs.filter((x) => x.lv === 'nc').length;
          const sec = Math.min(3600, Math.round((Date.now() - startedAt) / 1000)); // thời gian làm cả chặng
          setTimeout(() => opts.onFinish({ total: qs.length, firstTry, advTotal, advFirstTry, sec }), 350);
        } else {
          setTimeout(show, 120);
        }
      }

      function updateCombo() {
        if (opts.comboEl) opts.comboEl.textContent = combo >= 2 ? `🔥 ${combo}` : '';
      }

      // Bấm Enter để "Tiếp tục" khi dùng máy tính
      const onKey = (e) => { if (e.key === 'Enter' && fb.classList.contains('show')) next(); };
      document.addEventListener('keydown', onKey);

      show();
      const api = {
        question: () => qs[i], // câu hỏi đang hiện (dùng khi kiểm thử)
        destroy() {
          finished = true;
          clearTimeout(timer);
          document.removeEventListener('keydown', onKey);
          if (ctrl && ctrl.destroy) ctrl.destroy();
          if (App.Engine.active === api) App.Engine.active = null;
        },
      };
      App.Engine.active = api;
      return api;
    },
  };
})(window.App);
