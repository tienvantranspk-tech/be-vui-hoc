/* Các dạng bài làm theo từng bước (tự chấm, giống dạng nối cặp):
     solve  – Bài giải: chọn câu lời giải → ghép phép tính bằng thẻ, tính kết quả → đáp số kèm đơn vị
     column – Đặt tính rồi tính: bé tự đặt hai số thẳng cột, rồi tính từ hàng đơn vị
     trace  – Tô chữ hoa theo nét chữ mờ (bằng ngón tay)
   Mỗi bước sai được thử lại; sai hai lần thì app làm mẫu bước đó rồi đi tiếp. Xong hết gọi api.done(làm đúng ngay từ đầu). */
(function (App) {
  'use strict';
  const { h, shuffle } = App.U;
  const QT = App.QTypes;
  const noop = () => {};
  const shake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  // ===================================================================
  // 1. Bài giải
  // q.solve: { a, op, b, res, line, lines:[3 câu lời giải], cls (đơn vị trong phép tính), ans (đơn vị đáp số), units:[3 đơn vị], ops:['+','−'] }
  // Bài toán hai bước: q.solve.steps = [{ a, op, b, res, line, lines, cls, ops? }, …] – mỗi bước có câu lời giải và phép tính riêng,
  //   res là kết quả bước cuối; ans, units dùng cho đáp số như trên.
  // ===================================================================
  QT.solve = {
    render(q, area, api) {
      const S0 = q.solve;
      const steps = S0.steps || [S0];
      const many = steps.length > 1;
      let S = steps[0], si = 0; // si: bước đang làm
      let mistakes = 0, finished = false, onKey = null;
      const note = h('div.sv-hint');
      const hint = (t) => { note.textContent = '💡 ' + t; };
      const paper = h('div.sv-paper', h('div.sv-title', 'Bài giải'));
      const work = h('div.sv-work');
      area.append(paper, work, note); // gợi ý nằm dưới cùng: hiện ra không làm các nút xô lệch
      const tag = (t) => (many ? `Bước ${si + 1} – ${t}` : t);
      // Xong một bước tính: sang bước sau, hết bước thì viết đáp số
      const nextStep = () => {
        si++;
        if (si < steps.length) { S = steps[si]; step1(); } else step3();
      };

      // ---- Bước 1: câu lời giải ----
      function step1() {
        let wrong = 0;
        const row = h('div.sv-line.pending', '…');
        paper.appendChild(row);
        const btns = shuffle(S.lines).map((t) => {
          const b = h('button.opt.text.sv-opt', { type: 'button' }, t + ':');
          b.addEventListener('click', () => {
            if (b.disabled) return;
            App.Sound.play('tap');
            if (t === S.line) return ok1();
            wrong++; mistakes++;
            App.Sound.play('wrong');
            b.classList.add('wrong'); b.disabled = true;
            hint(many ? 'Câu lời giải phải nói đúng điều cần tìm ở bước này.' : 'Câu lời giải phải nói đúng điều bài toán hỏi.');
            if (wrong >= 2) setTimeout(ok1, 600);
          });
          return b;
        });
        work.innerHTML = '';
        work.append(h('div.sv-ask', tag('① Chọn câu lời giải:')), h('div.opts.texts.long', btns));
        function ok1() {
          App.Sound.play('pop');
          row.textContent = S.line + ':';
          row.classList.remove('pending');
          note.textContent = '';
          step2();
        }
      }

      // ---- Bước 2: phép tính ----
      function step2() {
        let wrong = 0;
        const slots = [h('button.sv-slot.num'), h('button.sv-slot.op'), h('button.sv-slot.num')];
        const res = h('span.fslot', '?');
        let resVal = '';
        const row = h('div.sv-line.calc', slots[0], ' ', slots[1], ' ', slots[2], ' = ', res, h('span.sv-unit', ` (${S.cls})`));
        paper.appendChild(row);
        const vals = [null, null, null];
        const numTiles = shuffle([S.a, S.b]).map((n) => tile(String(n), 'num'));
        const opTiles = (S.ops || S0.ops).map((o) => tile(o, 'op'));
        function tile(text, kind) {
          const t = h('button.tile.sv-tile', { type: 'button', class: kind }, text);
          t.addEventListener('click', () => {
            if (t.classList.contains('used') || expDone) return;
            const k = kind === 'op' ? 1 : vals[0] == null ? 0 : vals[2] == null ? 2 : -1;
            if (k < 0 || vals[k] != null) return;
            App.Sound.play('pop');
            vals[k] = text; slots[k].textContent = text; slots[k].classList.add('filled'); slots[k].tile = t;
            if (kind === 'num') t.classList.add('used');
            if (vals.every((v) => v != null)) checkExpr();
          });
          return t;
        }
        slots.forEach((s, k) => s.addEventListener('click', () => {
          if (expDone || vals[k] == null) return;
          if (s.tile && s.tile.classList.contains('num')) s.tile.classList.remove('used');
          vals[k] = null; s.textContent = ''; s.classList.remove('filled', 'bad');
        }));
        let expDone = false;
        const comm = S.op === '+' || S.op === '×';
        function checkExpr() {
          const x = Number(vals[0]), y = Number(vals[2]);
          const good = vals[1] === S.op && ((x === S.a && y === S.b) || (comm && x === S.b && y === S.a));
          if (good) { expDone = true; slots.forEach((s) => s.classList.add('ok')); App.Sound.play('pop'); note.textContent = ''; askResult(); return; }
          wrong++; mistakes++;
          App.Sound.play('wrong');
          shake(row);
          hint(vals[1] !== S.op ? (q.hint || 'Đọc lại câu hỏi để chọn phép tính cộng hay trừ.') : 'Số lớn hơn (số bị trừ, số bị chia) phải viết trước.');
          setTimeout(() => {
            if (wrong >= 2) {
              [String(S.a), S.op, String(S.b)].forEach((v, k) => { vals[k] = v; slots[k].textContent = v; slots[k].classList.add('filled', 'fixed'); });
              numTiles.forEach((t) => t.classList.add('used'));
              expDone = true; askResult();
            } else {
              slots.forEach((s, k) => { if (s.tile) s.tile.classList.remove('used'); vals[k] = null; s.textContent = ''; s.classList.remove('filled'); });
            }
          }, 650);
        }
        work.innerHTML = '';
        work.append(h('div.sv-ask', tag('② Chạm vào các thẻ để viết phép tính:')), h('div.sv-tiles', numTiles, h('span.sv-sep'), opTiles));

        function askResult() {
          let rw = 0;
          res.classList.add('active');
          const show = () => { res.textContent = resVal || '?'; res.classList.toggle('typing', !!resVal); };
          const press = (k) => {
            if (finished) return;
            App.Sound.play('tap');
            if (k === 'del') resVal = resVal.slice(0, -1);
            else if (k === 'ok') {
              if (!resVal) return;
              if (Number(resVal) === S.res) { res.classList.remove('active'); res.classList.add('ok'); document.removeEventListener('keydown', onKey); onKey = null; return nextStep(); }
              rw++; mistakes++;
              App.Sound.play('wrong');
              res.classList.add('bad'); shake(res);
              hint(q.calcHint || 'Tính lại thật cẩn thận nhé.');
              setTimeout(() => {
                res.classList.remove('bad');
                if (rw >= 2) { resVal = String(S.res); show(); res.classList.add('fixed'); document.removeEventListener('keydown', onKey); onKey = null; nextStep(); }
                else { resVal = ''; show(); }
              }, 650);
              return;
            } else if (resVal.length < 4) resVal = (resVal === '0' ? '' : resVal) + k;
            show();
          };
          onKey = (e) => {
            if (/^\d$/.test(e.key)) press(e.key);
            else if (e.key === 'Backspace') press('del');
            else if (e.key === 'Enter') press('ok');
          };
          document.addEventListener('keydown', onKey);
          work.innerHTML = '';
          work.append(h('div.sv-ask', `Tính: ${vals[0]} ${vals[1]} ${vals[2]} = ? (bấm số rồi bấm ✓)`), App.UI.keypad(press));
        }
      }

      // ---- Bước 3: đáp số ----
      function step3() {
        let wrong = 0;
        const unit = h('span.sv-slot.unit');
        const fin = steps[steps.length - 1].res;
        paper.appendChild(h('div.sv-line', 'Đáp số: ', h('b', String(fin)), ' ', unit, '.'));
        const btns = shuffle(S0.units).map((u) => {
          const b = h('button.tile.text', { type: 'button' }, u);
          b.addEventListener('click', () => {
            if (b.disabled || finished) return;
            if (u === S0.ans) return ok3();
            wrong++; mistakes++;
            App.Sound.play('wrong');
            b.classList.add('wrong'); b.disabled = true;
            hint('Đáp số viết kèm tên đơn vị mà bài toán hỏi.');
            if (wrong >= 2) setTimeout(ok3, 600);
          });
          return b;
        });
        work.innerHTML = '';
        work.append(h('div.sv-ask', (many ? '' : '③ ') + 'Chọn đơn vị cho đáp số:'), h('div.sv-tiles', btns));
        function ok3() {
          finished = true;
          unit.textContent = S0.ans;
          unit.classList.add('filled', 'ok');
          work.innerHTML = '';
          note.textContent = '';
          setTimeout(() => api.done(mistakes === 0), 400);
        }
      }

      step1();
      return { showResult: noop, retry: noop, reveal: noop, destroy() { if (onKey) document.removeEventListener('keydown', onKey); } };
    },
    check: () => true,
  };

  // ===================================================================
  // 2. Đặt tính rồi tính
  // q.col: { a, b, op, res } – bé chạm thẻ số rồi chạm vào ô để bắt đầu viết số (chữ số đầu tiên), sau đó tính
  // ===================================================================
  QT.column = {
    render(q, area, api) {
      const C = q.col;
      const sa = String(C.a), sb = String(C.b), sr = String(C.res);
      const W = Math.max(sa.length, sb.length, sr.length) + 1; // thêm một cột trống bên trái
      const names = ['Đơn vị', 'Chục', 'Trăm', 'Nghìn'];
      let mistakes = 0, phase = 1, finished = false, onKey = null;
      const note = h('div.sv-hint');
      const hint = (t) => { note.textContent = '💡 ' + t; };

      const mkRow = (cls) => Array.from({ length: W }, () => h('span.cg-cell', { class: cls }));
      const carry = mkRow('carry'), rowA = mkRow('a'), rowB = mkRow('b'), rowR = mkRow('r');
      const grid = h('div.cg', { style: { '--w': W } },
        h('span.cg-op'), ...Array.from({ length: W }, (_, i) => h('span.cg-head', W - 1 - i < sr.length || W - 1 - i < 2 ? names[W - 1 - i] : '')),
        h('span.cg-op'), ...carry,
        h('span.cg-op'), ...rowA,
        h('span.cg-op.sign', C.op), ...rowB,
        h('span.cg-op'), h('span.cg-line', { style: { gridColumn: `2 / span ${W}` } }),
        h('span.cg-op'), ...rowR);
      const work = h('div.sv-work');
      area.append(h('div.cg-wrap', grid), work, note);

      // Ô nhớ: chạm để ghi / xóa số 1 nhỏ (chỉ để bé tự nhắc mình, không chấm)
      carry.forEach((c, i) => c.addEventListener('click', () => {
        if (phase !== 2 || i === W - 1) return;
        c.textContent = c.textContent ? '' : '1';
        App.Sound.play('tap');
      }));

      // ---- Bước 1: đặt tính ----
      const placed = { a: null, b: null };
      let sel = null;
      const cards = [['a', sa], ['b', sb]].map(([k, s]) => {
        const t = h('button.tile.cg-card', { type: 'button' }, s);
        t.addEventListener('click', () => {
          if (phase !== 1) return;
          App.Sound.play('tap');
          sel = sel === k ? null : k;
          cards.forEach((c, j) => c.classList.toggle('selected', sel === ['a', 'b'][j]));
          grid.classList.toggle('pick-a', sel === 'a');
          grid.classList.toggle('pick-b', sel === 'b');
        });
        return t;
      });
      const put = (k, start) => {
        const row = k === 'a' ? rowA : rowB, s = k === 'a' ? sa : sb;
        row.forEach((c) => { c.textContent = ''; });
        if (start + s.length > W) start = W - s.length;
        s.split('').forEach((d, j) => { row[start + j].textContent = d; });
        placed[k] = start;
      };
      [[rowA, 'a'], [rowB, 'b']].forEach(([row, k]) => row.forEach((c, i) => c.addEventListener('click', () => {
        if (phase !== 1 || sel !== k) return;
        App.Sound.play('pop');
        put(k, i);
        sel = null;
        cards.forEach((c2) => c2.classList.remove('selected'));
        grid.classList.remove('pick-a', 'pick-b');
        cards[k === 'a' ? 0 : 1].classList.add('used');
        if (placed.a != null && placed.b != null) checkPlace();
      })));
      let wrong1 = 0;
      function checkPlace() {
        const okA = placed.a + sa.length === W, okB = placed.b + sb.length === W;
        if (okA && okB) { App.Sound.play('pop'); note.textContent = ''; return startCalc(); }
        wrong1++; mistakes++;
        App.Sound.play('wrong');
        shake(grid);
        hint('Viết các chữ số thẳng cột: hàng đơn vị thẳng hàng đơn vị, hàng chục thẳng hàng chục.');
        setTimeout(() => {
          if (wrong1 >= 2) { put('a', W - sa.length); put('b', W - sb.length); [...rowA, ...rowB].forEach((c) => c.classList.add('fixed')); return startCalc(); }
          if (!okA) { placed.a = null; rowA.forEach((c) => { c.textContent = ''; }); cards[0].classList.remove('used'); }
          if (!okB) { placed.b = null; rowB.forEach((c) => { c.textContent = ''; }); cards[1].classList.remove('used'); }
        }, 700);
      }
      work.append(h('div.sv-ask', '① Đặt tính: chạm vào một số, rồi chạm vào ô để bắt đầu viết số đó.'), h('div.sv-tiles', cards));

      // ---- Bước 2: tính từ phải sang trái ----
      function startCalc() {
        phase = 2;
        grid.classList.add('calc');
        let val = '', wrong2 = 0;
        const show = () => {
          const s = val.padStart(W, ' ');
          rowR.forEach((c, i) => {
            c.textContent = s[i].trim();
            c.classList.toggle('cur', !finished && i === W - 1 - val.length);
          });
        };
        const press = (k) => {
          if (finished) return;
          App.Sound.play('tap');
          if (k === 'del') val = val.slice(1);
          else if (k === 'ok') {
            if (!val) return;
            if (Number(val) === C.res) return done();
            wrong2++; mistakes++;
            App.Sound.play('wrong');
            shake(grid);
            hint(q.hint || 'Tính lần lượt từ hàng đơn vị. Nhớ cộng thêm (hoặc trừ thêm) số nhớ.');
            rowR.forEach((c) => c.classList.add('bad'));
            setTimeout(() => {
              rowR.forEach((c) => c.classList.remove('bad'));
              if (wrong2 >= 2) { val = sr; show(); rowR.forEach((c) => { if (c.textContent) c.classList.add('fixed'); }); return done(); }
              val = ''; show();
            }, 700);
            return;
          } else if (val.length < W) val = k + val;
          show();
        };
        function done() {
          finished = true;
          show();
          rowR.forEach((c) => { if (c.textContent) c.classList.add('ok'); });
          document.removeEventListener('keydown', onKey);
          onKey = null;
          work.innerHTML = '';
          note.textContent = '';
          setTimeout(() => api.done(mistakes === 0), 400);
        }
        onKey = (e) => {
          if (/^\d$/.test(e.key)) press(e.key);
          else if (e.key === 'Backspace') press('del');
          else if (e.key === 'Enter') press('ok');
        };
        document.addEventListener('keydown', onKey);
        work.innerHTML = '';
        work.append(h('div.sv-ask', '② Tính từ phải sang trái (bấm số, xong bấm ✓). Chạm ô nhỏ phía trên để ghi nhớ 1.'), App.UI.keypad(press));
        show();
      }
      return { showResult: noop, retry: noop, reveal: noop, destroy() { if (onKey) document.removeEventListener('keydown', onKey); } };
    },
    check: () => true,
  };

  // ===================================================================
  // 3. Tô chữ hoa
  // q.letter: 'Đ'; q.line: câu ứng dụng (hiện ra sau khi tô xong)
  // Chấm: phần nét chữ được tô kín (≥ 55%) và không tô ra ngoài quá nhiều (≤ 40%)
  // ===================================================================
  const FONT = '"Dancing Script", "Andika", cursive';
  QT.trace = {
    render(q, area, api) {
      const size = Math.round(Math.min(window.innerWidth * 0.8, window.innerHeight * 0.52, 460));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cv = h('canvas.tr-canvas', { width: size * dpr, height: size * dpr, style: { width: size + 'px', height: size + 'px' } });
      const ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);
      const brush = Math.max(16, size * 0.075);
      const strokes = [];
      let cur = null, tries = 0, mistakes = 0, finished = false;
      const note = h('div.sv-hint');
      const line = h('div.tr-line');
      const clearBtn = h('button.btn.white.small', { type: 'button' }, '🧽 Tô lại');
      const doneBtn = h('button.btn.green', { type: 'button' }, 'Xong ✓');
      area.append(h('div.tr-box', cv), h('div.tr-btns', clearBtn, doneBtn), note, line);

      const fontPx = Math.round(size * 0.72);
      const drawLetter = (c, style) => {
        c.save();
        c.font = `700 ${fontPx}px ${FONT}`;
        c.textAlign = 'center';
        c.textBaseline = 'alphabetic';
        style(c);
        c.restore();
      };
      const baseY = size * 0.8;
      function paint() {
        ctx.clearRect(0, 0, size, size);
        // dòng kẻ như vở ô li
        ctx.strokeStyle = '#d7defa';
        ctx.lineWidth = 1.5;
        for (let i = 1; i < 6; i++) { const y = Math.round(size * i / 6) + 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke(); }
        ctx.strokeStyle = '#b6c3f2';
        ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(size, baseY); ctx.stroke();
        drawLetter(ctx, (c) => {
          c.fillStyle = '#e4e8f3';
          c.fillText(q.letter, size / 2, baseY);
          c.setLineDash([6, 7]);
          c.lineWidth = 2;
          c.strokeStyle = '#9aa6c7';
          c.strokeText(q.letter, size / 2, baseY);
        });
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(34, 181, 115, .85)';
        ctx.lineWidth = brush;
        for (const s of strokes) {
          ctx.beginPath();
          s.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          if (s.length === 1) ctx.lineTo(s[0][0] + 0.1, s[0][1]);
          ctx.stroke();
        }
      }
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * size / r.width, (e.clientY - r.top) * size / r.height]; };
      cv.addEventListener('pointerdown', (e) => { if (finished) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = [pos(e)]; strokes.push(cur); paint(); });
      cv.addEventListener('pointermove', (e) => { if (!cur) return; cur.push(pos(e)); paint(); });
      const end = () => { cur = null; };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
      clearBtn.addEventListener('click', () => { if (finished) return; App.Sound.play('tap'); strokes.length = 0; paint(); });

      // Chấm điểm trên ảnh nhỏ (lưới 4px)
      function score() {
        const n = Math.round(size / 3);
        const k = n / size;
        const mk = () => { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); x.scale(k, k); return [c, x]; };
        const [, lx] = mk();
        drawLetter(lx, (c) => { c.fillStyle = '#000'; c.fillText(q.letter, size / 2, baseY); });
        const [, wx] = mk();
        drawLetter(wx, (c) => { c.fillStyle = '#000'; c.lineWidth = brush * 1.3; c.lineJoin = 'round'; c.strokeStyle = '#000'; c.fillText(q.letter, size / 2, baseY); c.strokeText(q.letter, size / 2, baseY); });
        const [, dx] = mk();
        dx.lineCap = 'round'; dx.lineJoin = 'round'; dx.lineWidth = brush; dx.strokeStyle = '#000';
        for (const s of strokes) { dx.beginPath(); s.forEach(([x, y], i) => (i ? dx.lineTo(x, y) : dx.moveTo(x, y))); if (s.length === 1) dx.lineTo(s[0][0] + 0.1, s[0][1]); dx.stroke(); }
        const L = lx.getImageData(0, 0, n, n).data, Wd = wx.getImageData(0, 0, n, n).data, Dd = dx.getImageData(0, 0, n, n).data;
        let letter = 0, covered = 0, drawn = 0, outside = 0;
        for (let i = 3; i < L.length; i += 4) {
          const isL = L[i] > 100, isD = Dd[i] > 100;
          if (isL) { letter++; if (isD) covered++; }
          if (isD) { drawn++; if (Wd[i] <= 100) outside++; }
        }
        return { cover: letter ? covered / letter : 0, out: drawn ? outside / drawn : 1 };
      }
      doneBtn.addEventListener('click', () => {
        if (finished) return;
        if (!strokes.length) { note.textContent = '💡 Bé dùng ngón tay tô lên nét chữ mờ nhé!'; return; }
        const s = score();
        tries++;
        if (s.cover >= 0.55 && s.out <= 0.4) return finish();
        mistakes++;
        App.Sound.play('wrong');
        shake(cv);
        note.textContent = s.cover < 0.55 ? '💡 Tô kín hết các nét của chữ mờ nhé!' : '💡 Cẩn thận, đừng tô ra ngoài nét chữ.';
        if (tries >= 3) setTimeout(finish, 900);
      });
      function finish() {
        finished = true;
        App.Sound.play('correct');
        note.textContent = '';
        clearBtn.remove(); doneBtn.remove();
        if (q.line) {
          line.append(h('div.tr-cap', 'Câu ứng dụng:'), h('div.tr-sent', q.line));
          App.Speech.speak(q.line, 'vi');
        }
        setTimeout(() => api.done(mistakes === 0), q.line ? 1600 : 500);
      }
      const ready = document.fonts && document.fonts.load ? document.fonts.load(`700 ${fontPx}px "Dancing Script"`).catch(noop) : Promise.resolve();
      paint();
      ready.then(() => { if (!finished) paint(); });
      return { showResult: noop, retry: noop, reveal: noop };
    },
    check: () => true,
  };
})(window.App);
