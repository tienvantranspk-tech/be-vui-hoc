/* Các dạng câu hỏi.
   Mỗi dạng có:
     render(q, area, api) → trả về bộ điều khiển { showResult(ok, value), retry(), reveal(), destroy?() }
       - api.submit(value): bé đã chọn/nhập xong, nhờ bộ máy chấm
       - api.done(firstTryOk): dạng tự chấm (nối cặp) báo đã làm xong
       - api.slot: ô "?" trong biểu thức to (nếu có)
     check(q, value) → đúng/sai
*/
(function (App) {
  'use strict';
  const { h } = App.U;
  const QT = {};
  const same = (a, b) => String(a) === String(b);

  // ===== 1. Chọn đáp án =====
  // q.options: mảng đáp án; q.answer: đáp án đúng; q.optStyle: 'sign' (dấu > < =) | 'text' (chữ) | 'expr'
  // q.views: { đáp án: 'chuỗi SVG/HTML' } → đáp án là hình (đồng hồ, hình học…), kèm số thứ tự
  QT.choice = {
    render(q, area, api) {
      const views = q.views || null;
      const isText = q.optStyle === 'text' || (!q.optStyle && q.options.some((o) => String(o).length > 5));
      const cls = views ? 'pic' : q.optStyle && q.optStyle !== 'text' ? q.optStyle : isText ? 'text' : '';
      let locked = false;
      const btns = q.options.map((o) => {
        const b = h('button.opt', { class: cls, onclick: () => {
          if (locked || b.disabled) return;
          App.Sound.play('tap');
          api.submit(o);
        } });
        if (views) {
          b.innerHTML = views[o];
          if (!q.noCap) b.appendChild(h('span.cap', String(o))); // noCap: hình không kèm chữ (bài nghe tiếng Anh)
        } else b.textContent = String(o);
        b.val = o;
        return b;
      });
      const optsCls = [views ? 'pics' : '', cls === 'text' ? 'texts' : '', 'n' + q.options.length, q.optsClass || '', q.skin ? 'skin skin-' + q.skin : ''].join(' ');
      area.appendChild(h('div.opts', { class: optsCls }, btns));
      return {
        showResult(ok, val) {
          locked = true;
          const b = btns.find((x) => same(x.val, val));
          if (b) b.classList.add(ok ? 'correct' : 'wrong');
          if (ok) btns.forEach((x) => { if (x !== b) x.classList.add('dim'); });
        },
        retry() {
          locked = false;
          btns.forEach((b) => {
            if (b.classList.contains('wrong')) { b.classList.remove('wrong'); b.classList.add('dim'); b.disabled = true; }
          });
        },
        reveal() {
          locked = true;
          btns.forEach((b) => b.classList.add(same(b.val, q.answer) ? 'correct' : 'dim'));
        },
      };
    },
    check: (q, v) => same(v, q.answer),
  };

  // ===== 2. Nhập số bằng bàn phím số =====
  QT.input = {
    render(q, area, api) {
      let val = '';
      let locked = false;
      // Nơi hiện số bé đang gõ: hàng kết quả của phép đặt tính, hoặc ô "?" trong biểu thức,
      // nếu không có thì tạo một ô riêng
      const vres = api.card && api.card.querySelector('.vcalc .vres');
      let slot = vres ? null : api.slot;
      if (!vres && !slot) {
        slot = h('span.slot', '?');
        area.appendChild(h('div.q-big', slot));
      }
      const box = vres || slot;
      const cells = vres ? [...vres.children] : [];
      const maxLen = vres ? cells.length : Math.max(3, String(q.answer).length + 1);
      // Đặt tính: điền từ phải sang trái (hàng đơn vị trước), ô sáng là chỗ gõ tiếp theo
      const show = (text) => {
        if (vres) {
          const s = text.padStart(cells.length, ' ');
          cells.forEach((c, i) => {
            c.textContent = s[i].trim() || '?';
            c.classList.toggle('cur', !locked && i === cells.length - 1 - text.length);
          });
        } else slot.textContent = text === '' ? '?' : text;
      };
      const update = () => {
        show(val);
        box.classList.toggle('typing', val !== '');
      };
      const press = (k) => {
        if (locked) return;
        App.Sound.play('tap');
        if (k === 'ok') { if (val !== '') api.submit(Number(val)); return; }
        if (vres) {
          if (k === 'del') val = val.slice(1);
          else if (val.length < maxLen) val = k + val;
        } else {
          if (k === 'del') val = val.slice(0, -1);
          else if (val.length < maxLen) val = (val === '0' ? '' : val) + k;
        }
        update();
      };
      if (vres) update();
      area.appendChild(App.UI.keypad(press));
      // Bàn phím thật (khi dùng máy tính)
      const onKey = (e) => {
        if (/^\d$/.test(e.key)) press(e.key);
        else if (e.key === 'Backspace') press('del');
        else if (e.key === 'Enter') press('ok');
      };
      document.addEventListener('keydown', onKey);
      return {
        showResult(ok) {
          locked = true;
          cells.forEach((c) => c.classList.remove('cur'));
          box.classList.remove('typing');
          if (!ok) box.classList.add('wrong');
          else if (vres) vres.classList.add('filled'); // ô "?" thường do bộ máy tự tô xanh
        },
        retry() {
          locked = false;
          box.classList.remove('wrong');
          val = '';
          update();
        },
        reveal() {
          locked = true;
          box.classList.remove('wrong');
          if (vres) { show(String(q.answer)); vres.classList.add('filled'); } // ô "?" thường do bộ máy tự điền
        },
        destroy() { document.removeEventListener('keydown', onKey); },
      };
    },
    check: (q, v) => Number(v) === Number(q.answer),
  };

  // ===== 3. Sắp xếp theo thứ tự =====
  // q.items: các ô (đã xáo trộn); q.answer: thứ tự đúng; q.tileClass: kiểu chữ của ô (tùy chọn)
  QT.order = {
    render(q, area, api) {
      let locked = false;
      const tcls = q.tileClass || (q.items.some((x) => String(x).length > 4) ? 'text' : '');
      const slots = h('div.order-slots');
      const pool = h('div.order-pool');
      const picked = []; // các ô đã chọn (theo thứ tự)
      const checkBtn = h('button.btn.green', { disabled: true, onclick: () => {
        if (!locked) api.submit(picked.map((p) => p.val));
      } }, 'Kiểm tra ✓');

      const refresh = () => { checkBtn.disabled = picked.length !== q.items.length; };
      q.items.forEach((it) => {
        const src = h('button.tile', { class: tcls }, String(it));
        src.addEventListener('click', () => {
          if (locked || src.classList.contains('used')) return;
          App.Sound.play('pop');
          src.classList.add('used');
          const copy = h('button.tile', { class: tcls }, String(it));
          const entry = { val: it, src, copy };
          copy.addEventListener('click', () => {
            if (locked) return;
            App.Sound.play('tap');
            picked.splice(picked.indexOf(entry), 1);
            copy.remove();
            src.classList.remove('used');
            refresh();
          });
          picked.push(entry);
          slots.appendChild(copy);
          refresh();
        });
        pool.appendChild(src);
      });
      area.append(slots, pool, checkBtn);

      const mark = () => picked.forEach((p, i) => p.copy.classList.add(same(p.val, q.answer[i]) ? 'correct' : 'wrong'));
      return {
        showResult(ok) {
          locked = true;
          if (ok) picked.forEach((p) => p.copy.classList.add('correct'));
          else mark();
        },
        retry() {
          locked = false;
          // giữ lại các ô đúng vị trí, trả các ô sai về chỗ cũ
          for (let i = picked.length - 1; i >= 0; i--) {
            const p = picked[i];
            p.copy.classList.remove('correct', 'wrong');
            if (!same(p.val, q.answer[i]) || picked.slice(0, i).some((x, j) => !same(x.val, q.answer[j]))) {
              p.copy.remove();
              p.src.classList.remove('used');
              picked.splice(i, 1);
            }
          }
          refresh();
        },
        reveal() {
          locked = true;
          slots.innerHTML = '';
          q.answer.forEach((a) => slots.appendChild(h('button.tile.correct', { class: tcls }, String(a))));
          pool.querySelectorAll('.tile').forEach((t) => t.classList.add('used'));
          checkBtn.remove();
        },
      };
    },
    check: (q, v) => v.length === q.answer.length && v.every((x, i) => same(x, q.answer[i])),
  };

  // ===== 4. Nối cặp (tự chấm) =====
  // q.pairs: [[trái, phải], …] – mỗi bên là chữ hoặc { html: 'hình SVG/HTML' }
  QT.match = {
    render(q, area, api) {
      const isPic = (x) => x && typeof x === 'object';
      const isText = q.pairs.some((p) => (!isPic(p[0]) && String(p[0]).length > 7) || (!isPic(p[1]) && String(p[1]).length > 7));
      const left = App.U.shuffle(q.pairs.map((p, i) => ({ i, label: p[0] })));
      const right = App.U.shuffle(q.pairs.map((p, i) => ({ i, label: p[1] })));
      let sel = null, mistakes = 0, matched = 0;
      const tap = (b) => {
        if (b.classList.contains('matched')) return;
        App.Sound.play('tap');
        // q.tapSay = 'en': chạm vào từ tiếng Anh (cột trái) thì máy đọc từ đó
        if (q.tapSay && b.side === 'L' && !isPic(b.label)) App.Speech.speak(String(b.label), q.tapSay);
        if (!sel || sel.side === b.side) {
          if (sel) sel.classList.remove('selected');
          sel = b;
          b.classList.add('selected');
          return;
        }
        const a = sel;
        sel = null;
        if (a.idx === b.idx) {
          const color = 'mc' + (matched % 6);
          [a, b].forEach((x) => { x.classList.remove('selected'); x.classList.add('matched', color); });
          matched++;
          App.Sound.play('pop');
          if (matched === q.pairs.length) setTimeout(() => api.done(mistakes === 0), 350);
        } else {
          mistakes++;
          App.Sound.play('wrong');
          [a, b].forEach((x) => { x.classList.remove('selected'); x.classList.add('wrong'); });
          setTimeout(() => [a, b].forEach((x) => x.classList.remove('wrong')), 450);
        }
      };
      const make = (it, side) => {
        const b = h('button.m-item', { class: isPic(it.label) ? 'pic' : isText ? 'text' : '' });
        if (isPic(it.label)) b.innerHTML = it.label.html; else b.textContent = String(it.label);
        b.idx = it.i;
        b.side = side;
        b.label = it.label;
        b.addEventListener('click', () => tap(b));
        return b;
      };
      area.appendChild(h('div.match',
        h('div.mcol', left.map((it) => make(it, 'L'))),
        h('div.mcol', right.map((it) => make(it, 'R')))));
      return { showResult() {}, retry() {}, reveal() {} };
    },
    check: () => true,
  };

  // ===== 5. Xếp vào nhóm (tự chấm) =====
  // q.groups: ['Từ chỉ sự vật', 'Từ chỉ hoạt động']; q.items: [{ t:'quyển vở', g:0 }, …]
  // Bé chạm một từ rồi chạm vào giỏ. Đúng thì từ nằm lại trong giỏ, sai thì từ quay về.
  QT.sort = {
    render(q, area, api) {
      let sel = null, mistakes = 0, placed = 0;
      const tiles = [];
      const drop = (gi, basket, zone) => {
        if (!sel) { App.UI.toast('Bé chạm vào một từ trước, rồi chạm vào giỏ nhé!'); return; }
        const t = sel;
        sel = null;
        t.classList.remove('selected');
        if (t.g === gi) {
          // để lại một ô ẩn ở chỗ cũ, các từ còn lại không bị xô lệch (bé khỏi bấm nhầm)
          t.replaceWith(h('button.tile.text.used', { 'aria-hidden': 'true', tabindex: -1 }, t.textContent));
          t.classList.add('placed');
          zone.appendChild(t);
          App.Sound.play('pop');
          placed++;
          if (placed === tiles.length) setTimeout(() => api.done(mistakes === 0), 350);
        } else {
          mistakes++;
          App.Sound.play('wrong');
          t.classList.add('wrong');
          basket.classList.add('shake');
          setTimeout(() => { t.classList.remove('wrong'); basket.classList.remove('shake'); }, 450);
        }
      };
      const baskets = q.groups.map((label, gi) => {
        const zone = h('div.bk-zone');
        const basket = h('div.basket', { class: 'bk' + gi, role: 'button', tabindex: 0 }, h('div.bk-label', label), zone);
        basket.addEventListener('click', () => drop(gi, basket, zone));
        return basket;
      });
      const pool = h('div.order-pool');
      q.items.forEach((it) => {
        const t = h('button.tile.text', it.t);
        t.g = it.g;
        t.addEventListener('click', (e) => {
          e.stopPropagation();
          if (t.classList.contains('placed')) return;
          App.Sound.play('tap');
          if (sel) sel.classList.remove('selected');
          sel = sel === t ? null : t;
          if (sel) sel.classList.add('selected');
        });
        tiles.push(t);
        pool.appendChild(t);
      });
      area.append(h('div.baskets', { class: 'n' + q.groups.length }, baskets), pool);
      return { showResult() {}, retry() {}, reveal() {} };
    },
    check: () => true,
  };

  App.QTypes = QT;
})(window.App);
