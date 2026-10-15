/* Các dạng câu hỏi giống vở bài tập:
     fill  – "Số?": phép tính, bảng, chuỗi mũi tên, sơ đồ tách – gộp có nhiều ô trống; bé chạm ô rồi bấm số
     rows  – nhiều dòng, mỗi dòng chọn một đáp án: "Đ, S?", ">, <, = ?", xếp câu vào kiểu câu
     pick  – chạm chọn nhiều: khoanh vào hình / phép tính, gạch dưới từ ngữ trong câu
     cloze – điền từ ngữ, chữ cái, dấu câu vào chỗ trống trong đoạn văn
   Cách chấm giống các dạng cũ: sai lần đầu thì giữ lại phần đúng, bé sửa phần sai; sai lần hai thì hiện đáp án. */
(function (App) {
  'use strict';
  const { h } = App.U;
  const QT = App.QTypes;
  const same = (a, b) => String(a) === String(b);
  const isSlot = (c) => c != null && typeof c === 'object' && 'a' in c;

  // Chữ thường kèm đơn vị viết trong ngoặc nhọn: "5 {kg}" → 5 kg (chữ đơn vị nhỏ hơn)
  function addText(el, str) {
    String(str).split(/\{(\w+)\}/).forEach((t, j) => {
      if (!t) return;
      el.appendChild(j % 2 ? h('span.unit', t) : document.createTextNode(t));
    });
    return el;
  }
  const checkButton = (onclick) => h('button.btn.green.check-btn', { disabled: true, onclick }, 'Kiểm tra ✓');

  // Phép đặt tính làm sẵn (để bé kiểm tra Đ/S): { a, b, op, res, shift } – shift: số hạng thứ hai bị viết lệch sang trái
  function staticVertical(v) {
    const shift = v.shift || 0;
    const bs = String(v.b) + ' '.repeat(shift);
    const w = Math.max(String(v.a).length, bs.length, String(v.res).length);
    const digits = (s) => String(s).padStart(w, ' ').split('').map((c) => h('span.vd', c.trim()));
    return h('div.vcalc.mini', h('span.vop', v.op), h('div.vnum', digits(v.a)), h('div.vnum', digits(bs)), h('div.vline'), h('div.vnum.vres', digits(v.res)));
  }
  App.Visuals.staticVertical = staticVertical;

  // ===================================================================
  // 1. "Số?" – nhiều ô trống
  // q.fill: [khối, …]. Mỗi ô là chữ/số (có thể kèm {kg}), hoặc ô trống { a: đáp án }.
  //   { kind:'list', items:[['11 − 2 = ', { a:9 }], …], cols }   các phép tính
  //   { kind:'chain', items:[12, { op:'−3' }, { a:9 }, …] }        chuỗi tính theo mũi tên (không có op: dãy số)
  //   { kind:'table', rows:[['Số hạng', 9, 8], ['Tổng', { a:14 }, { a:15 }]], head:true }  bảng (cột đầu là tên hàng)
  //   { kind:'bond', top, left, right }                             sơ đồ tách – gộp số
  //   { kind:'text', t }                                            dòng chữ ghi chú
  //   { kind:'row', blocks:[…] }                                    vài khối đặt cạnh nhau
  // q.answer: số ở các ô theo thứ tự xuất hiện (dùng QT.fill.collect để tính)
  // q.split: true → máy xoay ngang thì hình bên trái, bàn phím bên phải
  // ===================================================================
  function eachCell(blocks, fn) {
    for (const b of blocks) {
      if (b.kind === 'list') b.items.forEach((it) => it.forEach(fn));
      else if (b.kind === 'chain') b.items.forEach(fn);
      else if (b.kind === 'table') b.rows.forEach((r) => r.forEach(fn));
      else if (b.kind === 'bond') [b.top, b.left, b.right].forEach(fn);
      else if (b.kind === 'row') eachCell(b.blocks, fn);
    }
  }
  QT.fill = {
    collect(blocks) {
      const out = [];
      eachCell(blocks, (c) => { if (isSlot(c)) out.push(c.a); });
      return out;
    },
    render(q, area, api) {
      const slots = [];
      let cur = -1, locked = false;
      const mkSlot = (ans) => {
        const el = h('button.fslot', { type: 'button', 'aria-label': 'Ô trống' }, '?');
        const s = { el, ans, val: '', done: false };
        el.addEventListener('click', () => {
          if (locked || s.done) return;
          App.Sound.play('tap');
          focus(slots.indexOf(s));
        });
        slots.push(s);
        return el;
      };
      const cell = (c, cls = 'span.fv') => (isSlot(c) ? mkSlot(c.a) : addText(h(cls), c));

      const block = (b) => {
        if (b.kind === 'list') {
          const cols = b.cols || (b.items.length > 3 ? 2 : 1);
          return h('div.fl-list', { class: 'c' + cols }, b.items.map((it) => h('div.fx', it.map((c) => cell(c)))));
        }
        if (b.kind === 'chain') {
          const row = h('div.fl-chain', { class: b.items.some((c) => c && c.op) ? '' : 'seq' });
          b.items.forEach((c) => {
            if (c && c.op) row.appendChild(h('span.fop', h('b', c.op), h('i', '➜')));
            else row.appendChild(h('span.fc', cell(c)));
          });
          return row;
        }
        if (b.kind === 'table') {
          return h('table.fl-table', { class: b.head ? 'head' : '' }, b.rows.map((r) =>
            h('tr', r.map((c, k) => (k === 0 ? h('th', addText(h('span'), c)) : h('td', cell(c)))))));
        }
        if (b.kind === 'bond') {
          return h('div.fl-bond',
            h('span.fb.top', cell(b.top)),
            h('div.fb-lines', { html: '<svg viewBox="0 0 100 30" preserveAspectRatio="none"><line x1="50" y1="0" x2="22" y2="30"/><line x1="50" y1="0" x2="78" y2="30"/></svg>' }),
            h('div.fb-row', h('span.fb', cell(b.left)), h('span.fb', cell(b.right))));
        }
        if (b.kind === 'row') return h('div.fills-row', b.blocks.map(block));
        if (b.kind === 'text') return addText(h('div.fl-note'), b.t);
        return null;
      };
      const fig = h('div.fill', q.fill.map(block));
      (q.split && api.left ? api.left : area).appendChild(fig);

      const checkBtn = checkButton(() => submitAll());
      function focus(i) {
        cur = i;
        slots.forEach((s, k) => s.el.classList.toggle('active', k === i && !locked));
      }
      const nextEmpty = (from) => {
        for (let k = 1; k <= slots.length; k++) {
          const j = (from + k + slots.length) % slots.length;
          if (!slots[j].done && slots[j].val === '') return j;
        }
        return -1;
      };
      const allFilled = () => slots.every((s) => s.val !== '');
      const refresh = () => { checkBtn.disabled = locked || !allFilled(); };
      const show = (s) => {
        s.el.textContent = s.val === '' ? '?' : s.val;
        s.el.classList.toggle('typing', s.val !== '');
      };
      function submitAll() { if (!locked && allFilled()) api.submit(slots.map((s) => Number(s.val))); }
      const press = (k) => {
        if (locked) return;
        App.Sound.play('tap');
        if (k === 'ok') {
          const j = nextEmpty(cur);
          if (j >= 0 && j !== cur) focus(j);
          else if (allFilled()) submitAll();
          return;
        }
        const s = slots[cur];
        if (!s || s.done) return;
        if (k === 'del') s.val = s.val.slice(0, -1);
        else if (s.val.length < 4) s.val = (s.val === '0' ? '' : s.val) + k;
        show(s);
        refresh();
      };
      area.appendChild(App.UI.keypad(press));
      area.appendChild(checkBtn);
      focus(0);
      const onKey = (e) => {
        if (/^\d$/.test(e.key)) press(e.key);
        else if (e.key === 'Backspace') press('del');
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); press('ok'); }
      };
      document.addEventListener('keydown', onKey);

      return {
        showResult(ok, v) {
          locked = true;
          focus(-1);
          slots.forEach((s, i) => { if (!s.done) s.el.classList.add(ok || same(v[i], s.ans) ? 'ok' : 'bad'); });
          refresh();
        },
        retry() {
          locked = false;
          slots.forEach((s) => {
            if (s.el.classList.contains('ok')) { s.done = true; s.el.disabled = true; return; }
            s.el.classList.remove('bad');
            s.val = '';
            show(s);
          });
          focus(nextEmpty(-1));
          refresh();
        },
        reveal() {
          locked = true;
          focus(-1);
          slots.forEach((s) => {
            if (s.el.classList.contains('bad')) s.el.classList.replace('bad', 'fixed');
            else s.el.classList.add('ok');
            s.val = String(s.ans);
            s.el.textContent = s.val;
          });
          checkBtn.remove();
        },
        destroy() { document.removeEventListener('keydown', onKey); },
      };
    },
    check: (q, v) => Array.isArray(v) && v.length === q.answer.length && v.every((x, i) => Number(x) === Number(q.answer[i])),
  };

  // ===================================================================
  // 2. Nhiều dòng, mỗi dòng chọn một đáp án ("Đ, S?", ">, <, = ?")
  // q.items: [{ t:'12 − 5 = 7' | vcalc:{ a, b, op, res } | html, a:'Đ' }]; q.opts: ['Đ', 'S'] (mặc định)
  // q.answer = q.items.map((x) => x.a)
  // ===================================================================
  const optClass = (o) => (o === 'Đ' || o === '✓' ? 'yes' : o === 'S' || o === '✗' ? 'no' : /^[<>=]$/.test(o) ? 'sign' : String(o).length <= 3 ? 'short' : 'text');
  QT.rows = {
    render(q, area, api) {
      const opts = q.opts || ['Đ', 'S'];
      let locked = false;
      const rows = q.items.map((it) => {
        const r = { it, val: null, done: false };
        const body = h('div.rw-body');
        if (it.vcalc) body.appendChild(staticVertical(it.vcalc));
        else if (it.html) body.innerHTML = it.html;
        else addText(body, it.t);
        r.btns = opts.map((o) => {
          const b = h('button.rw-opt', { class: optClass(o), type: 'button' }, o);
          b.addEventListener('click', () => {
            if (locked || r.done) return;
            App.Sound.play('tap');
            r.val = o;
            r.btns.forEach((x) => x.classList.toggle('sel', x === b));
            refresh();
          });
          return b;
        });
        r.el = h('div.rw', body, h('div.rw-opts', { class: 'n' + opts.length }, r.btns));
        return r;
      });
      const pics = q.items.some((it) => it.vcalc || it.html);
      const wordy = q.items.some((it) => it.t && it.t.length > 16 && /\p{L}{3,}/u.test(it.t)); // câu văn: chữ thường, không in đậm to
      area.appendChild(h('div.rws', { class: pics ? 'pics' : wordy ? 'wordy' : '' }, rows.map((r) => r.el)));
      const checkBtn = checkButton(() => { if (!locked) api.submit(rows.map((r) => r.val)); });
      area.appendChild(checkBtn);
      const refresh = () => { checkBtn.disabled = locked || rows.some((r) => r.val == null); };
      return {
        showResult(ok, v) {
          locked = true;
          checkBtn.disabled = true;
          rows.forEach((r, i) => { if (!r.done) r.el.classList.add(ok || same(v[i], r.it.a) ? 'ok' : 'bad'); });
        },
        retry() {
          locked = false;
          rows.forEach((r) => {
            if (r.el.classList.contains('ok')) { r.done = true; return; }
            r.el.classList.remove('bad');
            r.val = null;
            r.btns.forEach((b) => b.classList.remove('sel'));
          });
          refresh();
        },
        reveal() {
          locked = true;
          rows.forEach((r) => {
            if (r.el.classList.contains('bad')) r.el.classList.replace('bad', 'fixed');
            else r.el.classList.add('ok');
            r.btns.forEach((b) => b.classList.toggle('sel', same(b.textContent, r.it.a)));
          });
          checkBtn.remove();
        },
      };
    },
    check: (q, v) => Array.isArray(v) && v.length === q.items.length && v.every((x, i) => same(x, q.items[i].a)),
  };

  // ===================================================================
  // 3. Chạm chọn nhiều: khoanh vào, gạch dưới
  // q.items: [{ t, ok } | { html, ok }]
  // q.mode: 'tiles' (mặc định, các ô chữ) | 'pics' (hình to) | 'inline' (câu / đoạn văn: chạm vào từ ngữ để gạch dưới;
  //         mục có ok == null là chữ thường không chạm được)
  // q.sum: chọn các mục có tổng giá trị v bằng q.sum (có nhiều cách đúng – mục có ok là một cách đúng để hiện khi bé sai)
  // q.answer: chữ của các mục đúng (để báo đáp án và nhận ra câu trùng)
  // ===================================================================
  const NO_SPACE_BEFORE = /^[.,!?:;…)”"]/;
  QT.pick = {
    render(q, area, api) {
      let locked = false;
      const mode = q.mode || 'tiles';
      const els = [];
      const wrap = h('div.pk', { class: 'pk-' + mode + (q.paint ? ' paint' : '') });
      q.items.forEach((it, i) => {
        if (mode === 'inline') {
          if (i > 0 && !NO_SPACE_BEFORE.test(it.t || '')) wrap.appendChild(document.createTextNode(' '));
          if (it.ok == null) { wrap.appendChild(document.createTextNode(it.t)); return; }
        }
        const b = h(mode === 'inline' ? 'span.pk-w' : 'button.pk-it', { role: 'button', tabindex: 0 });
        if (it.html) b.innerHTML = it.html; else b.textContent = it.t;
        b.idx = i;
        b.addEventListener('click', () => {
          if (locked || b.classList.contains('lock')) return;
          App.Sound.play(b.classList.contains('sel') ? 'tap' : 'pop');
          b.classList.toggle('sel');
          refresh();
        });
        els.push(b);
        wrap.appendChild(b);
      });
      area.appendChild(wrap);
      const checkBtn = checkButton(() => { if (!locked) api.submit(els.filter((b) => b.classList.contains('sel')).map((b) => b.idx)); });
      area.appendChild(checkBtn);
      const refresh = () => { checkBtn.disabled = locked || !els.some((b) => b.classList.contains('sel')); };
      return {
        showResult(ok) {
          locked = true;
          checkBtn.disabled = true;
          els.forEach((b) => {
            if (!b.classList.contains('sel') || b.classList.contains('lock')) return;
            b.classList.add(ok || (!q.sum && q.items[b.idx].ok) ? 'ok' : 'bad');
          });
        },
        retry() {
          locked = false;
          els.forEach((b) => {
            if (b.classList.contains('ok')) { b.classList.add('lock'); return; }
            b.classList.remove('bad', 'sel');
          });
          refresh();
        },
        reveal() {
          locked = true;
          els.forEach((b) => {
            const good = !!q.items[b.idx].ok;
            b.classList.remove('bad', 'ok', 'lock');
            b.classList.toggle('sel', good);
            b.classList.add(good ? 'ok' : 'dim');
          });
          checkBtn.remove();
        },
      };
    },
    check(q, v) {
      if (!Array.isArray(v)) return false;
      if (q.sum != null) return v.reduce((s, i) => s + (q.items[i].v || 0), 0) === q.sum;
      const want = q.items.map((it, i) => (it.ok ? i : -1)).filter((i) => i >= 0);
      return v.length === want.length && want.every((i) => v.includes(i));
    },
  };

  // ===================================================================
  // 4. Điền vào chỗ trống trong đoạn văn
  // q.parts: ['Sáng nay, ', { a:'mẹ' }, ' đưa em đến trường', { a:'.' }] – chữ và chỗ trống
  // q.bank: các thẻ để chọn (gồm đáp án và vài thẻ nhiễu); q.reuse: true → một thẻ dùng được nhiều lần
  // q.blank: 'punct' (ô nhỏ cho dấu câu) | 'letter' (ô cho chữ cái, vần – nằm sát chữ) | mặc định ô cho từ ngữ
  // q.answer = các đáp án theo thứ tự
  // ===================================================================
  QT.cloze = {
    render(q, area, api) {
      let locked = false, cur = -1;
      const blanks = [];
      const text = h('div.cz-text', { class: q.textClass || '' });
      // Một mảng con trong q.parts là một cụm không bị ngắt dòng (ví dụ một từ có chỗ trống)
      const put1 = (box, p) => {
        if (Array.isArray(p)) { const g = h('span.cz-g'); p.forEach((x) => put1(g, x)); box.appendChild(g); return; }
        if (p != null && typeof p === 'object') {
          const el = h('button.cz-b', { class: q.blank || 'word', type: 'button', 'aria-label': 'Chỗ trống' });
          const b = { el, a: p.a, val: null, done: false, tile: null };
          el.addEventListener('click', () => {
            if (locked || b.done) return;
            App.Sound.play('tap');
            if (b.val != null) clear(b);
            focus(blanks.indexOf(b));
          });
          blanks.push(b);
          box.appendChild(el);
        } else addText(box, p);
      };
      q.parts.forEach((p) => put1(text, p));
      const sign = q.bank.every((w) => String(w).length <= 1);
      const tiles = q.bank.map((w) => {
        const t = h('button.tile.cz-tile', { class: sign ? 'sign' : q.blank === 'letter' ? 'letter' : 'text', type: 'button' }, String(w));
        t.val = w;
        t.addEventListener('click', () => put(t));
        return t;
      });
      const checkBtn = checkButton(() => { if (!locked) api.submit(blanks.map((b) => b.val)); });
      area.append(text, h('div.cz-bank', tiles), checkBtn);

      function focus(i) {
        cur = i;
        blanks.forEach((b, k) => b.el.classList.toggle('active', k === i && !locked));
      }
      const nextEmpty = (from) => {
        for (let k = 1; k <= blanks.length; k++) {
          const j = (from + k + blanks.length) % blanks.length;
          if (!blanks[j].done && blanks[j].val == null) return j;
        }
        return -1;
      };
      const refresh = () => { checkBtn.disabled = locked || blanks.some((b) => b.val == null); };
      function clear(b) {
        b.val = null;
        b.el.textContent = '';
        b.el.classList.remove('filled');
        if (b.tile) { b.tile.classList.remove('used'); b.tile = null; }
        refresh();
      }
      function put(t) {
        if (locked || t.classList.contains('used')) return;
        let b = blanks[cur];
        if (!b || b.done) { const j = nextEmpty(-1); b = blanks[j]; cur = j; }
        if (!b) return;
        App.Sound.play('pop');
        if (b.val != null) clear(b);
        b.val = t.val;
        b.el.textContent = String(t.val);
        b.el.classList.add('filled');
        if (!q.reuse) { t.classList.add('used'); b.tile = t; }
        focus(nextEmpty(cur));
        refresh();
      }
      focus(0);
      return {
        showResult(ok, v) {
          locked = true;
          checkBtn.disabled = true;
          focus(-1);
          blanks.forEach((b, i) => { if (!b.done) b.el.classList.add(ok || same(v[i], b.a) ? 'ok' : 'bad'); });
        },
        retry() {
          locked = false;
          blanks.forEach((b) => {
            if (b.el.classList.contains('ok')) { b.done = true; return; }
            b.el.classList.remove('bad');
            clear(b);
          });
          focus(nextEmpty(-1));
          refresh();
        },
        reveal() {
          locked = true;
          focus(-1);
          blanks.forEach((b) => {
            if (b.el.classList.contains('bad')) b.el.classList.replace('bad', 'fixed');
            else b.el.classList.add('ok');
            b.el.textContent = String(b.a);
          });
          checkBtn.remove();
        },
      };
    },
    check: (q, v) => Array.isArray(v) && v.length === q.answer.length && v.every((x, i) => same(x, q.answer[i])),
  };

  // Lấy đáp án của câu điền chỗ trống từ q.parts
  QT.cloze.collect = (parts) => parts.flat(Infinity).filter((p) => p != null && typeof p === 'object').map((p) => p.a);
})(window.App);
