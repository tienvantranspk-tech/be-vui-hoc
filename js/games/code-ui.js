/* Đảo Lập Trình: dạng bài xếp thẻ lệnh (giao diện). Mục tiêu chính là rèn tư duy logic: nghĩ trước khi chạy.
   Bàn ô bên trái, dải thẻ lệnh bên phải. Bé chạm thẻ để xếp chương trình rồi bấm Chạy, thú cưng đi theo từng thẻ.
   Màn "đoán trước" (lv.guess): chương trình có sẵn, bé nhẩm trong đầu rồi chọn ô bạn ấy sẽ dừng lại, sau đó mới chạy.
   Gợi ý chỉ mở sau hai lần chạy chưa được, để bé tự nghĩ trước.
   Chạy thử không bị trừ gì. Lỗi thì bạn ấy dừng ngay chỗ đó, thẻ đang chạy được đánh dấu để bé tự sửa.
   Giải xong gọi api.done(gọn): gọn = dùng ít thẻ nhất và không cần gợi ý (tính vào số sao của chặng).
   Thẻ mới luôn chen vào ngay sau thẻ đang chọn, 🚩 là vị trí đầu chương trình. */
(function (App) {
  'use strict';
  const { h } = App.U;
  const C = App.Code;
  const QT = App.QTypes;
  const noop = () => {};
  const STEP = 380; // thời gian đi một ô (mili giây)
  const CARD = {
    U: { ico: '⬆️', name: 'lên' }, D: { ico: '⬇️', name: 'xuống' },
    L: { ico: '⬅️', name: 'trái' }, R: { ico: '➡️', name: 'phải' },
  };
  const TILE = { '#': '🌳', '^': '🪨', '~': '🌊' };
  const KIND = { '#': 'tree', '^': 'rock', '~': 'water' };
  const BUMP = { tree: 'đụng cây', rock: 'đụng đá', water: 'gặp nước', edge: 'ra ngoài mép bàn' };
  const shake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const strip = (t) => t.replace(/\p{Extended_Pictographic}|️/gu, '').replace(/\s+/g, ' ').trim();

  // Ghi lại cách bé giải (để bố mẹ xem), không ảnh hưởng tới điểm các môn khác
  function record(id, { runs, fails, hints, tidy, first }) {
    const st = App.Store.state;
    const levels = st.code.levels;
    const o = levels[id] || (levels[id] = { n: 0, tidy: 0, first: 0, runs: 0, fails: 0, hints: 0, selfFix: 0, t: 0 });
    o.n++;
    if (tidy) o.tidy++;
    if (first) o.first = (o.first || 0) + 1; // đúng ngay lần chạy đầu: bé đã nghĩ xong trong đầu
    o.runs += runs;
    o.fails += fails;
    o.hints += hints;
    if (fails && !hints) o.selfFix++; // chạy lỗi rồi tự sửa được, không cần gợi ý
    o.t = Date.now();
  }

  QT.code = {
    render(q, area, api) {
      const lv = q.level;
      const g = C.parse(lv);
      const par = C.par(lv), max = C.maxCards(lv);
      const guessing = !!lv.guess;
      const init = (lv.bug || lv.prog || '').split('');
      const st = App.Store.state;
      let prog = init.slice(), cur = guessing ? -2 : prog.length - 1; // -1 là 🚩, -2 là không chọn gì
      let guess = null; // ô bé đoán bạn ấy sẽ dừng lại
      let runs = 0, fails = 0, hints = 0;
      let running = false, solved = false, alive = true, token = 0;
      let dirty = false; // bạn ấy đang đứng ở chỗ vừa chạy tới, cần quay về đầu

      api.card.classList.add('cd-area');

      // ---- Bàn ô ----
      const cells = [];
      const board = h('div.cd-board', { class: guessing ? 'guessing' : '', style: { '--cols': g.w, '--rows': g.h } });
      lv.map.forEach((row, y) => row.split('').forEach((ch, x) => {
        const cell = h('div.cd-cell', { class: `${(x + y) % 2 ? 'alt' : ''} ${KIND[ch] || ''}` }, h('span', TILE[ch] || (ch === 'G' ? q.goal : ch === 'o' ? '🪙' : '')));
        if (ch === 'G') cell.classList.add('goal');
        if (guessing && !KIND[ch]) cell.addEventListener('click', () => pickCell(x, y));
        cells.push(cell);
        board.appendChild(cell);
      }));
      const cellAt = (x, y) => cells[y * g.w + x];
      const petEl = App.UI.pet(st.pet, 4, { grow: false });
      petEl.style.setProperty('--ps', 'calc(var(--cell) * .8)');
      const walker = h('div.cd-pet', petEl);
      board.appendChild(walker);
      const place = (x, y) => { walker.style.setProperty('--x', x); walker.style.setProperty('--y', y); };
      place(g.start.x, g.start.y);
      api.left.appendChild(h('div.q-visual', board));

      // ---- Dải thẻ, khay thẻ, nút ----
      const msg = h('div.cd-msg');
      const ribbon = h('div.cd-ribbon');
      const start = h('button.cd-start', { type: 'button', 'aria-label': 'Đầu chương trình', onclick: () => { if (running || guessing) return; App.Sound.play('tap'); cur = -1; draw(); } }, '🚩');
      const count = h('div.cd-count');
      const tray = h('div.cd-tray', g.cards.map((c) => h('button.cd-card', { type: 'button', 'aria-label': 'Thẻ ' + CARD[c].name, dataset: { c }, onclick: () => add(c) }, CARD[c].ico)));
      const bDel = h('button.btn.white.cd-tool', { type: 'button', 'aria-label': 'Bỏ thẻ đang chọn', onclick: remove }, '🗑️');
      const bReset = h('button.btn.white.cd-tool', { type: 'button', 'aria-label': 'Làm lại từ đầu', onclick: reset }, '↩️');
      const bHint = h('button.btn.white.cd-tool', { type: 'button', 'aria-label': 'Gợi ý', onclick: showHint }, '💡');
      const bRun = h('button.btn.green.cd-run', { type: 'button', onclick: play }, '▶️ Chạy');
      if (guessing) area.append(msg, ribbon, h('div.cd-tools', bRun));
      else area.append(msg, ribbon, count, tray, h('div.cd-tools', bDel, bReset, bHint, bRun));

      function say(text, warn, voice) {
        msg.textContent = text;
        msg.classList.toggle('warn', !!warn);
        if (voice) App.Speech.speak(strip(text), 'vi');
      }
      function clearMarks() {
        ribbon.querySelectorAll('.err,.hinted,.run').forEach((e) => e.classList.remove('err', 'hinted', 'run'));
        tray.querySelectorAll('.hinted').forEach((e) => e.classList.remove('hinted'));
      }
      function draw() {
        ribbon.innerHTML = '';
        start.classList.toggle('sel', cur === -1);
        ribbon.appendChild(start);
        prog.forEach((c, i) => {
          ribbon.appendChild(h('button.cd-slot', {
            type: 'button', class: i === cur ? 'sel' : '', 'aria-label': `Thẻ số ${i + 1}: ${CARD[c].name}`,
            onclick: () => { if (running || guessing) return; App.Sound.play('tap'); cur = i; rewind(); draw(); },
          }, h('small', String(i + 1)), CARD[c].ico));
        });
        count.textContent = `🧩 ${prog.length}/${max} thẻ · 🎯 Gọn nhất: ${par} thẻ`;
        bDel.disabled = running || cur < 0;
        bReset.disabled = running;
        bHint.disabled = running;
        tray.querySelectorAll('button').forEach((b) => { b.disabled = running; });
        coach();
      }
      // Màn đầu tiên: bàn tay nhỏ chỉ việc cần làm tiếp theo
      function coach() {
        if (!lv.coach) return;
        const ready = prog.length >= par;
        tray.firstChild.classList.toggle('cd-pulse', !ready && !running);
        bRun.classList.toggle('cd-pulse', ready && !running);
      }
      const slotAt = (i) => ribbon.querySelectorAll('.cd-slot')[i];

      // Đưa bạn ấy về chỗ xuất phát (xu trở lại, xóa vết đi)
      function rewind() {
        if (!dirty) return;
        dirty = false;
        place(g.start.x, g.start.y);
        cells.forEach((c) => c.classList.remove('trail', 'taken'));
        clearMarks();
      }
      function add(c) {
        if (running || solved) return;
        rewind();
        if (prog.length >= max) { App.Sound.play('wrong'); shake(ribbon); say(`Hết chỗ rồi! Bỏ bớt thẻ bằng nút 🗑️ nhé.`, true, true); return; }
        App.Sound.play('tap');
        clearMarks();
        prog.splice(cur + 1, 0, c);
        cur++;
        draw();
        calm();
      }
      function remove() {
        if (running || cur < 0) return;
        rewind();
        App.Sound.play('pop');
        clearMarks();
        prog.splice(cur, 1);
        cur = Math.min(cur, prog.length) - 1;
        draw();
        calm();
      }
      // Bé vừa sửa thẻ: bỏ lời nhắc lỗi cũ (lời gợi ý thì giữ lại để bé làm theo)
      function calm() {
        if (msg.classList.contains('warn')) say('Sửa xong thì bấm ▶️ Chạy nhé!');
      }
      function reset() {
        if (running) return;
        App.Sound.play('tap');
        prog = init.slice();
        cur = prog.length - 1;
        dirty = true;
        rewind();
        clearMarks();
        draw();
        say(lv.bug ? 'Chương trình đã về như lúc đầu.' : 'Dải thẻ đã trống, xếp lại nhé!');
      }

      function stop() {
        token++;
        running = false;
        bRun.textContent = '▶️ Chạy';
        rewind();
        clearMarks();
        draw();
        say(guessing ? 'Đã dừng. Bấm ▶️ Chạy khi bé sẵn sàng nhé!' : 'Đã dừng. Sửa thẻ rồi chạy lại nhé!');
      }

      async function play() {
        if (solved) return;
        if (running) { App.Sound.play('tap'); stop(); return; }
        if (guessing && !guess) { App.Sound.play('wrong'); say('Chạm vào một ô trên bàn trước đã nhé!', true, true); return; }
        if (!prog.length) { App.Sound.play('wrong'); shake(tray); say('Chọn thẻ trước đã nhé!', true, true); return; }
        const away = dirty; // đang đứng ở chỗ khác: chờ bạn ấy về đầu rồi mới chạy
        dirty = true;
        rewind();
        clearMarks();
        App.Speech.stop();
        App.Sound.play('pop');
        runs++;
        running = true;
        const me = ++token;
        bRun.textContent = '⏹️ Dừng';
        draw();
        say(prog.length === 1 ? 'Đang chạy thẻ…' : 'Đang chạy từng thẻ…');
        const r = C.run(lv, prog);
        dirty = true;
        await App.U.sleep(away ? 450 : 200);
        for (const s of r.steps) {
          if (me !== token || !alive) return;
          ribbon.querySelectorAll('.run').forEach((e) => e.classList.remove('run'));
          slotAt(s.i).classList.add('run');
          if (s.bump) { await bump(s, me); break; }
          place(s.x, s.y);
          App.Sound.play('tap');
          await App.U.sleep(STEP);
          if (me !== token || !alive) return;
          cellAt(s.x, s.y).classList.add('trail');
          if (s.coin >= 0) { App.Sound.play('coin'); cellAt(s.x, s.y).classList.add('taken'); }
        }
        if (me !== token || !alive) return;
        running = false;
        bRun.textContent = '▶️ Chạy';
        finish(r);
      }

      // Húc nhẹ vào vật cản rồi lùi lại
      async function bump(s, me) {
        const [dx, dy] = C.DIR[s.card];
        place(s.x + dx * 0.3, s.y + dy * 0.3);
        App.Sound.play('wrong');
        App.UI.petAnim(petEl, 'oops');
        await App.U.sleep(220);
        if (me !== token || !alive) return;
        place(s.x, s.y);
        await App.U.sleep(260);
      }

      // Màn đoán trước: chọn ô rồi mới được chạy
      function pickCell(x, y) {
        if (running || solved) return;
        rewind();
        App.Sound.play('tap');
        cells.forEach((c) => c.classList.remove('guess'));
        guess = { x, y };
        cellAt(x, y).classList.add('guess');
        say('Bé chọn ô này à? Bấm ▶️ Chạy xem có đúng không!');
      }
      function finishGuess(r) {
        const end = r.steps[r.steps.length - 1];
        if (end.x === guess.x && end.y === guess.y) {
          solved = true;
          const tidy = fails === 0;
          App.UI.petAnim(petEl, 'jump');
          say(tidy ? '🧠 Đúng rồi! Bé nhẩm trong đầu giỏi quá!' : '🎯 Đúng ô rồi!');
          bRun.disabled = true;
          record(lv.id, { runs, fails: 0, hints: 0, tidy, first: tidy });
          if (!tidy) q.explain = 'Bé đã tìm ra đúng ô! Lần sau chỉ tay vào bàn, đi theo từng thẻ, mỗi thẻ một ô nhé.';
          setTimeout(() => { if (alive) api.done(tidy); }, 750);
          return;
        }
        fails++;
        cells.forEach((c) => c.classList.remove('guess'));
        guess = null;
        if (r.outcome === 'bump') slotAt(r.at).classList.add('err');
        say(`Chưa đúng ô. ${st.pet.name} dừng ở chỗ này. Xem lại đường đi, rồi chọn lại ô đúng nhé!`, true, true);
      }

      function finish(r) {
        draw();
        if (guessing) { finishGuess(r); return; }
        if (r.outcome === 'win') {
          solved = true;
          const tidy = hints === 0 && prog.length <= par;
          const first = runs === 1 && hints === 0; // chưa cần chạy thử: đã nghĩ xong trong đầu
          cellAt(g.goal.x, g.goal.y).classList.add('eaten');
          App.Sound.play('eat');
          App.UI.petAnim(petEl, 'jump');
          say(first ? '🧠 Nghĩ kĩ nên đúng ngay lần chạy đầu!' : `🎉 ${st.pet.name} tới nơi rồi!`);
          [bDel, bReset, bHint, bRun].forEach((b) => { b.disabled = true; });
          tray.querySelectorAll('button').forEach((b) => { b.disabled = true; });
          record(lv.id, { runs, fails, hints, tidy, first });
          if (!tidy) {
            q.explain = prog.length > par ? `Bé giải được rồi! Bé dùng ${prog.length} thẻ, thử tìm cách chỉ cần ${par} thẻ nhé.`
              : `Bé giải được rồi! Lần sau thử tự làm không cần gợi ý nhé.`;
          }
          setTimeout(() => { if (alive) api.done(tidy); }, 750);
          return;
        }
        fails++;
        cur = r.outcome === 'bump' ? r.at : prog.length - 1;
        draw();
        if (r.outcome === 'bump') slotAt(r.at).classList.add('err');
        const nearly = fails >= 2 ? ' Bấm 💡 nếu cần gợi ý.' : '';
        if (r.outcome === 'bump') say(`Ối! Tới thẻ số ${r.at + 1} thì ${st.pet.name} ${BUMP[r.bump]}.${nearly}`, true, true);
        else if (r.outcome === 'coins') say(`Tới nơi rồi nhưng còn ${r.missing} xu chưa nhặt!${nearly}`, true, true);
        else say(`Hết thẻ rồi mà chưa tới nơi. Thêm thẻ nữa nhé!${nearly}`, true, true);
        bHint.classList.toggle('cd-pulse', fails >= 3);
      }

      function showHint() {
        if (running) return;
        if (fails < 2) {
          App.Sound.play('tap');
          say(fails ? 'Bé tự nghĩ thêm chút nữa nhé! Chỉ tay vào bàn, đi theo từng thẻ xem lệch ở đâu.' : 'Bấm ▶️ Chạy thử trước đã, xem bạn ấy đi đến đâu nhé!', true, true);
          return;
        }
        const t = C.hint(lv, prog);
        if (!t) return;
        rewind();
        clearMarks();
        hints++;
        bHint.classList.remove('cd-pulse');
        App.Sound.play('pop');
        if (t.kind === 'add') cur = prog.length - 1;
        else cur = t.kind === 'insert' ? t.i - 1 : t.i;
        draw();
        const n = t.i + 1;
        if (t.card) tray.querySelector(`[data-c="${t.card}"]`).classList.add('hinted');
        if (t.kind !== 'add') slotAt(t.i).classList.add('hinted');
        const ico = t.card ? CARD[t.card].ico : '';
        if (t.kind === 'change') say(`💡 Thẻ số ${n} nên là ${ico}. Bấm 🗑️ bỏ thẻ đó, rồi chọn ${ico}.`, false, true);
        else if (t.kind === 'remove') say(`💡 Thẻ số ${n} bị thừa. Bấm 🗑️ để bỏ.`, false, true);
        else if (t.kind === 'insert') say(`💡 Còn thiếu ${ico} ngay trước thẻ số ${n}. Chạm ${ico} để chen vào.`, false, true);
        else say(`💡 Thêm thẻ ${ico} vào cuối nhé.`, false, true);
      }

      draw();
      say(guessing ? 'Chạm vào ô trên bàn mà bé nghĩ bạn ấy sẽ dừng lại.'
        : lv.bug ? 'Nhìn kĩ các thẻ trước, rồi bấm ▶️ Chạy để kiểm tra.' : 'Nghĩ đường đi trong đầu, xếp thẻ, rồi bấm ▶️ Chạy.');

      return {
        showResult: noop, retry: noop, reveal: noop,
        destroy() { alive = false; token++; api.card.classList.remove('cd-area'); },
      };
    },
    check: () => true,
  };

  // Tổng hợp cho Góc phụ huynh
  C.summary = () => {
    const sub = App.Curriculum.code;
    const levels = (App.Store.state.code || {}).levels || {};
    const out = { solved: 0, total: 0, tidy: 0, first: 0, runs: 0, fails: 0, hints: 0, selfFix: 0, topics: [] };
    for (const t of sub.topics) {
      const list = t.stages.flatMap((s) => s.levels || []);
      if (!list.length) continue;
      const o = { topic: t, total: list.length, solved: 0 };
      for (const lv of list) {
        out.total++;
        const r = levels[lv.id];
        if (!r) continue;
        o.solved++;
        out.solved++;
        if (r.tidy) out.tidy++;
        if (r.first) out.first++;
        out.runs += r.runs;
        out.fails += r.fails;
        out.hints += r.hints;
        out.selfFix += r.selfFix;
      }
      out.topics.push(o);
    }
    return out;
  };
})(window.App);
