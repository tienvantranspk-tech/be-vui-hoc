/* Các dạng bài thao tác tay và luyện nói (tự chấm):
     clockset   – quay kim đồng hồ cho đúng giờ
     connect    – nối điểm: vẽ đường gấp khúc / hình tứ giác, vẽ đoạn thẳng trên thước, chọn ba điểm thẳng hàng
     say        – nghe mẫu rồi nói (máy nghe giọng bé; máy không nghe được thì bé tự bấm "Con đã nói")
     wordsearch – tìm và khoanh từ trong bảng chữ (Find and circle)
     task       – nhiệm vụ cùng bố mẹ: ghi âm đọc bài, viết vào vở (bố mẹ chấm trong Góc phụ huynh)
   Giống bài giải: sai thì thử lại, sai nhiều thì app làm mẫu rồi đi tiếp; xong gọi api.done(làm đúng ngay từ đầu). */
(function (App) {
  'use strict';
  const { h } = App.U;
  const QT = App.QTypes;
  const noop = () => {};
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const shake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const hintEl = () => h('div.sv-hint');

  // ===================================================================
  // 1. Quay kim đồng hồ. q.clock: { h, m }
  // ===================================================================
  QT.clockset = {
    render(q, area, api) {
      const T = q.clock;
      const box = h('div.cs-box', { html: App.Svg.clock(12, 0) });
      const svg = box.querySelector('svg');
      const hh = svg.querySelector('.ck-h'), mm = svg.querySelector('.ck-m');
      let ang = { h: 0, m: 0 }, sel = 'm', mistakes = 0, finished = false;
      const set = (line, deg, len) => { const a = (deg * Math.PI) / 180; line.setAttribute('x2', (100 + len * Math.sin(a)).toFixed(1)); line.setAttribute('y2', (100 - len * Math.cos(a)).toFixed(1)); };
      const draw = () => { set(hh, ang.h, 42); set(mm, ang.m, 67); hh.classList.toggle('on', sel === 'h'); mm.classList.toggle('on', sel === 'm'); };
      const bM = h('button.btn.small', { type: 'button', class: 'white' }, '🔴 Kim dài (phút)');
      const bH = h('button.btn.small', { type: 'button', class: 'white' }, '⚫ Kim ngắn (giờ)');
      const pickHand = (k) => {
        sel = k;
        [[bM, 'm'], [bH, 'h']].forEach(([b, x]) => { b.classList.toggle('orange', k === x); b.classList.toggle('white', k !== x); });
        draw();
      };
      bM.addEventListener('click', () => { App.Sound.play('tap'); pickHand('m'); });
      bH.addEventListener('click', () => { App.Sound.play('tap'); pickHand('h'); });
      const angleAt = (e) => {
        const r = svg.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        return ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
      };
      let dragging = false;
      const move = (e) => {
        if (!dragging || finished) return;
        const a = angleAt(e);
        // kim phút nhảy theo 5 phút, kim giờ nhảy theo 1/4 khoảng giữa hai số
        if (sel === 'm') ang.m = (Math.round(a / 30) * 30) % 360; else ang.h = (Math.round(a / 7.5) * 7.5) % 360;
        draw();
      };
      svg.addEventListener('pointerdown', (e) => { if (finished) return; e.preventDefault(); svg.setPointerCapture(e.pointerId); dragging = true; move(e); });
      svg.addEventListener('pointermove', move);
      svg.addEventListener('pointerup', () => { dragging = false; });
      svg.addEventListener('pointercancel', () => { dragging = false; });
      const note = hintEl();
      const check = h('button.btn.green.check-btn', { type: 'button' }, 'Kiểm tra ✓');
      area.append(box, h('div.tr-btns', bM, bH), check, note);
      const tH = ((T.h % 12) + T.m / 60) * 30, tM = T.m * 6;
      const diff = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
      check.addEventListener('click', () => {
        if (finished) return;
        const okM = diff(ang.m, tM) < 1, okH = diff(ang.h, tH) <= 12;
        if (okM && okH) return finish();
        mistakes++;
        App.Sound.play('wrong');
        shake(box);
        note.textContent = '💡 ' + (!okM ? `Kim dài chỉ phút: ${T.m === 0 ? 'chỉ vào số 12' : T.m === 15 ? 'chỉ vào số 3' : T.m === 30 ? 'chỉ vào số 6' : `chỉ vào số ${T.m / 5}`}.`
          : `Kim ngắn chỉ giờ: ${T.m === 0 ? `chỉ vào số ${T.h % 12 || 12}` : `nằm giữa số ${T.h % 12 || 12} và số ${(T.h % 12) + 1}`}.`);
        if (mistakes >= 3) { ang = { h: tH, m: tM }; draw(); svg.classList.add('fixed'); setTimeout(finish, 900); }
      });
      function finish() {
        finished = true;
        sel = '';
        draw();
        check.remove(); bM.remove(); bH.remove();
        note.textContent = '';
        api.done(mistakes === 0);
      }
      pickHand('m');
      return { showResult: noop, retry: noop, reveal: noop };
    },
    check: () => true,
  };

  // ===================================================================
  // 2. Nối điểm
  // q.connect: { w, h, pts:{ A:[x,y] }, mode:'path'|'seg'|'pick3', target:['A','B','C'] (path), closed (hình kín), len (seg) }
  // ===================================================================
  QT.connect = {
    render(q, area, api) {
      const C = q.connect;
      const svg = svgEl('svg', { viewBox: `0 0 ${C.w} ${C.h}`, class: 'cn-svg' });
      const lines = svgEl('g', {}), dots = svgEl('g', {});
      svg.append(lines, dots);
      if (C.mode === 'seg') {
        // thước có chấm ở mỗi vạch xăng-ti-mét
        svg.insertBefore(svgEl('rect', { x: 8, y: C.h - 46, width: C.w - 16, height: 40, rx: 6, class: 'rl-body' }), lines);
      }
      const names = Object.keys(C.pts);
      const seq = [];
      const els = {};
      let mistakes = 0, finished = false;
      names.forEach((n) => {
        const [x, y] = C.pts[n];
        const g = svgEl('g', { class: 'cn-pt' });
        g.append(svgEl('circle', { cx: x, cy: y, r: 16, class: 'cn-hit' }), svgEl('circle', { cx: x, cy: y, r: 6.5, class: 'cn-dot' }));
        const lbl = svgEl('text', { x, y: C.mode === 'seg' ? y + 30 : y - 14, class: C.mode === 'seg' ? 'rl-num' : 'geo-lbl' });
        lbl.textContent = C.mode === 'seg' ? n : n;
        g.appendChild(lbl);
        g.addEventListener('click', () => tap(n));
        els[n] = g;
        dots.appendChild(g);
      });
      const redraw = () => {
        lines.innerHTML = '';
        for (let i = 1; i < seq.length; i++) {
          const [x1, y1] = C.pts[seq[i - 1]], [x2, y2] = C.pts[seq[i]];
          lines.appendChild(svgEl('line', { x1, y1, x2, y2, class: 'cn-line' }));
        }
        names.forEach((n) => els[n].classList.toggle('on', seq.includes(n)));
        if (C.mode === 'pick3') lines.innerHTML = '';
      };
      function tap(n) {
        if (finished) return;
        App.Sound.play('pop');
        if (C.mode === 'pick3') {
          const i = seq.indexOf(n);
          if (i >= 0) seq.splice(i, 1); else if (seq.length < 3) seq.push(n);
        } else if (C.mode === 'seg') {
          if (seq.length >= 2) seq.length = 0;
          if (!seq.includes(n)) seq.push(n);
        } else {
          if (seq[seq.length - 1] === n) seq.pop();                 // chạm lại điểm cuối: bỏ nét vừa nối
          else if (!seq.includes(n) || (C.closed && n === seq[0] && seq.length >= 3)) seq.push(n);
        }
        redraw();
      }
      const note = hintEl();
      const clear = h('button.btn.white.small', { type: 'button', onclick: () => { if (finished) return; seq.length = 0; redraw(); App.Sound.play('tap'); } }, '🧽 Làm lại');
      const check = h('button.btn.green', { type: 'button' }, 'Kiểm tra ✓');
      area.append(h('div.cn-box', svg), h('div.tr-btns', clear, check), note);
      const good = () => {
        if (C.mode === 'seg') return seq.length === 2 && Math.abs(Number(seq[0]) - Number(seq[1])) === C.len;
        if (C.mode === 'pick3') {
          if (seq.length !== 3) return false;
          const [a, b, c] = seq.map((n) => C.pts[n]);
          return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) < 1;
        }
        const t = C.closed ? [...C.target, C.target[0]] : C.target;
        const s = seq.join('');
        if (!C.closed) return s === t.join('') || s === t.slice().reverse().join('');
        // hình kín: bắt đầu ở đỉnh nào, đi chiều nào cũng được, miễn là đi hết các đỉnh theo đúng thứ tự rồi về chỗ cũ
        if (seq.length !== t.length || seq[0] !== seq[seq.length - 1]) return false;
        const ring = C.target.join(''), rev = C.target.slice().reverse().join(''), body = seq.slice(0, -1).join('');
        return (ring + ring).includes(body) || (rev + rev).includes(body);
      };
      check.addEventListener('click', () => {
        if (finished) return;
        if (good()) return finish();
        mistakes++;
        App.Sound.play('wrong');
        shake(svg);
        note.textContent = '💡 ' + (q.hint || 'Thử lại nhé!');
        if (mistakes >= 3) {
          if (C.mode === 'seg') { seq.length = 0; seq.push('0', String(C.len)); }
          else if (C.mode === 'pick3') { seq.length = 0; seq.push(...C.target); }
          else { seq.length = 0; seq.push(...C.target); if (C.closed) seq.push(C.target[0]); }
          redraw();
          svg.classList.add('fixed');
          setTimeout(finish, 900);
        }
      });
      function finish() {
        finished = true;
        svg.classList.add('done');
        clear.remove(); check.remove();
        note.textContent = '';
        api.done(mistakes === 0);
      }
      return { showResult: noop, retry: noop, reveal: noop };
    },
    check: () => true,
  };

  // ===================================================================
  // 3. Luyện nói. q.say: { text, lang:'en-US' } – nói đúng (máy nghe thấy đủ các từ) là xong
  // ===================================================================
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  App.Listen = { supported: !!Rec };
  QT.say = {
    render(q, area, api) {
      const S = q.say;
      const lang = S.lang || 'en-US';
      let tries = 0, finished = false, rec = null, busy = false;
      const heard = h('div.say-heard');
      const note = hintEl();
      const model = () => App.Speech.speak(S.text, lang.startsWith('en') ? 'en' : 'vi');
      const slow = () => App.Speech.speak(S.text, lang.startsWith('en') ? 'en' : 'vi', { rate: 0.55 });
      const mic = h('button.say-mic', { type: 'button', 'aria-label': 'Bấm rồi nói' }, '🎤');
      const done = (ok) => { finished = true; mic.disabled = true; mic.classList.remove('rec'); api.done(ok); };
      area.append(h('div.say-text', S.text),
        h('div.tr-btns', h('button.btn.white.small', { type: 'button', onclick: model }, '🔊 Nghe mẫu'), h('button.btn.white.small', { type: 'button', onclick: slow }, '🐢 Nghe chậm')),
        mic, heard, note);
      const want = norm(S.text).split(' ');
      const match = (alts) => alts.some((t) => {
        const got = norm(t).split(' ');
        const hit = want.filter((w) => got.includes(w)).length;
        return hit >= Math.max(1, Math.ceil(want.length * 0.7));
      });
      const fallback = (why) => {
        mic.remove();
        note.textContent = why;
        area.appendChild(h('button.btn.green', { type: 'button', onclick: () => { if (!finished) done(true); } }, '✅ Con đã nói theo'));
      };
      if (!Rec) { fallback('Máy này chưa nghe được giọng nói. Bé bấm 🔊 nghe mẫu, nói to theo, rồi bấm nút bên dưới nhé!'); return { showResult: noop, retry: noop, reveal: noop }; }
      mic.addEventListener('click', () => {
        if (finished || busy) return;
        App.Speech.stop();
        busy = true;
        mic.classList.add('rec');
        heard.textContent = '👂 Đang nghe… bé nói đi!';
        rec = new Rec();
        rec.lang = lang;
        rec.interimResults = false;
        rec.maxAlternatives = 5;
        let got = false;
        rec.onresult = (e) => {
          got = true;
          const alts = Array.from(e.results[0]).map((r) => r.transcript);
          heard.textContent = `Máy nghe được: “${alts[0]}”`;
          if (match(alts)) { App.Sound.play('correct'); return done(tries === 0); }
          tries++;
          App.Sound.play('wrong');
          note.textContent = '💡 Bấm 🔊 nghe mẫu, rồi nói lại thật rõ nhé!';
          if (tries >= 3) { note.textContent = 'Giỏi lắm! Lần sau bé nói to, rõ hơn nữa nhé.'; setTimeout(() => done(false), 900); }
        };
        rec.onerror = (e) => {
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') fallback('Chưa được dùng micrô. Bé bấm 🔊 nghe mẫu, nói to theo, rồi bấm nút bên dưới nhé!');
          else if (e.error === 'network') fallback('Cần có mạng để máy nghe giọng nói. Bé nói theo mẫu rồi bấm nút bên dưới nhé!');
        };
        rec.onend = () => { busy = false; mic.classList.remove('rec'); if (!got && !finished) heard.textContent = 'Máy chưa nghe rõ. Bấm 🎤 rồi nói lại nhé!'; };
        try { rec.start(); } catch (err) { busy = false; fallback('Bé bấm 🔊 nghe mẫu, nói to theo, rồi bấm nút bên dưới nhé!'); }
      });
      return { showResult: noop, retry: noop, reveal: noop, destroy() { try { if (rec) rec.abort(); } catch (e) { /* đã dừng */ } } };
    },
    check: () => true,
  };

  // ===================================================================
  // 4. Tìm từ trong bảng chữ. q.grid: ['kitexb', …]; q.place: [{ w, r, c, d:'h'|'v' }]; q.pics: { từ: html }
  // Bé chạm chữ đầu rồi chạm chữ cuối của từ (hàng ngang hoặc cột dọc)
  // ===================================================================
  QT.wordsearch = {
    render(q, area, api) {
      const N = q.grid.length;
      const cells = [];
      const grid = h('div.ws-grid', { style: { '--n': N } });
      q.grid.forEach((row, r) => row.split('').forEach((ch, c) => {
        const b = h('button.ws-cell', { type: 'button' }, ch);
        b.addEventListener('click', () => tap(r, c));
        cells.push(b);
        grid.appendChild(b);
      }));
      const cell = (r, c) => cells[r * N + c];
      const found = new Set();
      const list = h('div.ws-list', q.place.map((p) => h('div.ws-word', { 'data-w': p.w }, h('span.ws-pic', { html: (q.pics && q.pics[p.w]) || '' }), h('span.ws-w', p.w))));
      const note = hintEl();
      area.append(h('div.ws-wrap', grid, list), note);
      let start = null, mistakes = 0, finished = false;
      const COLORS = ['mc0', 'mc1', 'mc2', 'mc3', 'mc4'];
      function tap(r, c) {
        if (finished) return;
        App.Sound.play('tap');
        if (!start) { start = [r, c]; cell(r, c).classList.add('sel'); return; }
        const [r0, c0] = start;
        cell(r0, c0).classList.remove('sel');
        start = null;
        if (r0 === r && c0 === c) return;
        const hit = q.place.find((p) => !found.has(p.w) && ((p.d === 'h' && p.r === r0 && r0 === r && Math.min(c0, c) === p.c && Math.abs(c - c0) === p.w.length - 1)
          || (p.d === 'v' && p.c === c0 && c0 === c && Math.min(r0, r) === p.r && Math.abs(r - r0) === p.w.length - 1)));
        if (!hit) {
          mistakes++;
          App.Sound.play('wrong');
          note.textContent = '💡 Chạm vào chữ cái đầu tiên, rồi chạm vào chữ cái cuối cùng của từ (theo hàng ngang hoặc cột dọc).';
          return;
        }
        found.add(hit.w);
        App.Sound.play('pop');
        const col = COLORS[(found.size - 1) % COLORS.length];
        for (let k = 0; k < hit.w.length; k++) cell(hit.d === 'h' ? hit.r : hit.r + k, hit.d === 'h' ? hit.c + k : hit.c).classList.add('got', col);
        list.querySelector(`[data-w="${hit.w}"]`).classList.add('got');
        App.Speech.speak(hit.w, 'en');
        note.textContent = '';
        if (found.size === q.place.length) { finished = true; setTimeout(() => api.done(mistakes <= 1), 500); }
      }
      return { showResult: noop, retry: noop, reveal: noop };
    },
    check: () => true,
  };

  // ===================================================================
  // 5. Nhiệm vụ cùng bố mẹ. q.task: { kind:'read'|'write', title, detail }
  // read: bé ghi âm lúc đọc bài (nếu máy cho dùng micrô); write: bé viết vào vở. Bố mẹ xem và chấm sao trong Góc phụ huynh.
  // ===================================================================
  QT.task = {
    render(q, area, api) {
      const T = q.task;
      let finished = false, recorder = null, chunks = [], blob = null, url = null, stream = null;
      const status = h('div.tk-status');
      const card = h('div.tk-card', h('div.tk-ico', T.kind === 'read' ? '🎙️' : '✍️'), h('div.tk-body', h('b', T.title), h('p', T.detail)));
      const send = h('button.btn.green', { type: 'button' }, T.kind === 'read' ? '📨 Gửi cho bố mẹ nghe' : '✅ Con viết xong rồi');
      const later = h('button.btn.white.small', { type: 'button' }, 'Để lúc khác');
      const finish = (added) => {
        if (finished) return;
        finished = true;
        if (stream) stream.getTracks().forEach((t) => t.stop());
        status.textContent = added ? '🎉 Đã gửi! Bố mẹ sẽ xem và chấm sao cho bé.' : 'Không sao, lúc khác bé làm nhé!';
        send.remove(); later.remove();
        if (recBtn) recBtn.remove();
        api.done(true);
      };
      later.addEventListener('click', () => finish(false));
      let recBtn = null;
      const canRec = T.kind === 'read' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder;
      if (canRec) {
        recBtn = h('button.say-mic', { type: 'button', 'aria-label': 'Ghi âm' }, '⏺️');
        send.disabled = true;
        recBtn.addEventListener('click', async () => {
          if (finished) return;
          if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
          try {
            stream = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
            chunks = [];
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
            recorder.onstop = () => {
              blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
              if (url) URL.revokeObjectURL(url);
              url = URL.createObjectURL(blob);
              recBtn.classList.remove('rec');
              recBtn.textContent = '🔁';
              status.innerHTML = '';
              status.append('Nghe lại: ', h('audio', { controls: true, src: url }), h('small', ' (bấm 🔁 để ghi âm lại)'));
              send.disabled = false;
            };
            recorder.start();
            recBtn.classList.add('rec');
            recBtn.textContent = '⏹️';
            status.textContent = '🔴 Đang ghi âm… bé đọc to bài đọc, đọc xong bấm ⏹️.';
          } catch (err) {
            recBtn.remove(); recBtn = null;
            send.disabled = false;
            send.textContent = '✅ Con đã đọc cho bố mẹ nghe';
            status.textContent = 'Máy chưa cho dùng micrô. Bé đọc to cho bố mẹ nghe trực tiếp nhé!';
          }
        });
        status.textContent = 'Bấm ⏺️ để ghi âm, bé đọc to bài đọc, đọc xong bấm ⏹️.';
      }
      send.addEventListener('click', async () => {
        if (finished || send.disabled) return;
        send.disabled = true;
        await App.Tasks.add({ kind: T.kind, title: T.title, detail: T.detail, sid: q._sid || 'tv' }, blob);
        App.Sound.play('coin');
        finish(true);
      });
      area.append(...[card, recBtn, status, h('div.tr-btns', later, send)].filter(Boolean));
      return { showResult: noop, retry: noop, reveal: noop, destroy() { if (stream) stream.getTracks().forEach((t) => t.stop()); if (recorder && recorder.state === 'recording') recorder.stop(); } };
    },
    check: () => true,
  };

  // ===================================================================
  // Hình minh họa hội thoại: { kind:'chat', lines:[['👧', 'What can you see?'], ['🧒', '…']] }
  // ===================================================================
  App.Visuals.chat = (v) => h('div.chat', v.pic ? h('div.tpic.mini', { html: v.pic }) : null, v.lines.map(([who, text], i) => h('div.chat-row', { class: i % 2 ? 'r' : 'l' },
    h('span.chat-who', who), h('span.chat-bub', { class: text === '…' ? 'wait' : '' }, text))));
})(window.App);
