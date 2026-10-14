/* Hình minh họa cho câu hỏi.
   - App.Visuals[kind](v) → phần tử giao diện để chèn vào câu hỏi
   - App.Svg.*            → hàm vẽ trả về chuỗi SVG/HTML (dùng cả cho đáp án dạng hình) */
(function (App) {
  'use strict';
  const U = App.U;
  const { h } = U;
  const V = {};
  const S = {};
  const r1 = (n) => Math.round(n * 10) / 10;
  const wrap = (cls, html) => h('div', { class: cls, html });

  V.render = (v) => (v && V[v.kind] ? V[v.kind](v) : null);

  // ================= Tiếng Anh =================
  // Nút nghe to + nút nghe chậm: { kind:'listen', text:'kite', lang:'en' }
  V.listen = function (v) {
    const lang = v.lang || 'en';
    const big = h('button.listen-btn', { 'aria-label': 'Nghe lại', onclick: () => {
      App.Speech.speak(v.text, lang);
      big.classList.remove('ping');
      void big.offsetWidth;
      big.classList.add('ping');
    } }, '🔊');
    const slow = h('button.listen-slow', { 'aria-label': 'Nghe chậm', onclick: () => App.Speech.speak(v.text, lang, { rate: 0.55 }) }, '🐢');
    return h('div.listen', big, slow);
  };
  // Hình minh họa dựng sẵn (emoji / SVG): { kind:'pic', html }
  V.pic = (v) => wrap('tpic', v.html);
  // Hình vẽ SVG dựng sẵn, khung trắng như hình học: { kind:'svg', svg }
  V.svg = (v) => wrap('vis-geo', v.svg);

  // ================= Số và phép tính =================

  // Nhóm đồ vật: { kind:'emoji', groups:[{ e:'🍎', n:8 }, { e:'🍎', n:5, cross:2 }], op:'+' }
  V.emoji = function (v) {
    const parts = [];
    v.groups.forEach((g, i) => {
      if (i > 0 && v.op) parts.push(h('span.eop', v.op));
      const box = h('div.egroup');
      for (let k = 0; k < g.n; k++) {
        box.appendChild(h('span', { class: g.cross && k >= g.n - g.cross ? 'crossed' : '' }, g.e));
      }
      parts.push(box);
    });
    return h('div.egroups', parts);
  };

  // So sánh hai hàng đồ vật: { kind:'rows', rows:[{ label:'Mai', e:'🍬', n:7 }, …] }
  V.rows = function (v) {
    return h('div.rows-cmp', v.rows.map((r) =>
      h('div.r', h('b', r.label), h('div.cells', Array.from({ length: r.n }, () => h('span', r.e))))));
  };

  // Khung 10 ô: { kind:'tenframe', a:8, b:5, op:'+' } hoặc { a:13, b:5, op:'−' }
  V.tenframe = function (v) {
    const cells = [];
    if (v.op === '+') {
      for (let i = 0; i < v.a; i++) cells.push('a');
      for (let i = 0; i < v.b; i++) cells.push('b');
    } else {
      for (let i = 0; i < v.a; i++) cells.push(i >= v.a - v.b ? 'a x' : 'a');
    }
    while (cells.length < 20) cells.push('');
    const frame = (list) => h('div.tenframe', list.map((c) => h('i', { class: c })));
    return h('div.tenframes', frame(cells.slice(0, 10)), frame(cells.slice(10, 20)));
  };

  // Khối trăm – chục – đơn vị: { kind:'blocks', hundreds:3, tens:4, ones:6 }
  const FLAT = (() => {
    let s = '<svg viewBox="0 0 102 102" class="flat"><rect class="fl-bg" x="1" y="1" width="100" height="100" rx="3"/>';
    for (let i = 1; i < 10; i++) {
      s += `<line class="fl-ln" x1="${1 + i * 10}" y1="1" x2="${1 + i * 10}" y2="101"/><line class="fl-ln" x1="1" y1="${1 + i * 10}" x2="101" y2="${1 + i * 10}"/>`;
    }
    return s + '</svg>';
  })();
  V.blocks = function (v) {
    const flats = Array.from({ length: v.hundreds || 0 }, () => h('div.flat-wrap', { html: FLAT }));
    const rods = Array.from({ length: v.tens || 0 }, () => h('div.rod', Array.from({ length: 10 }, () => h('i'))));
    const ones = v.ones ? h('div.ones', Array.from({ length: v.ones }, () => h('i'))) : null;
    return h('div.blocks', { class: v.hundreds ? 'compact' : '' }, flats, rods, ones);
  };

  // Một dãy đồ vật (emoji): { kind:'row', items:['⚽','🥫','❓'] }
  V.row = (v) => h('div.vis-row-emoji', v.items.map((e) => h('span', e)));

  // Đồ vật để đếm, xếp lộn xộn: { kind:'scatter', groups:[{ e:'🍎', n:5 }, …] }
  V.scatter = (v) => {
    const all = U.shuffle(v.groups.flatMap((g) => Array.from({ length: g.n }, () => g.e)));
    const rnd = U.seeded(all.length * 31 + 7);
    return h('div.vis-scatter', all.map((e) => h('span', { style: { transform: `rotate(${Math.round(rnd() * 40 - 20)}deg) translateY(${Math.round(rnd() * 10 - 5)}px)` } }, e)));
  };

  // Hộp đựng đồ vật (dùng cho chắc chắn – có thể – không thể): { kind:'bag', items:['🔴','🔵'] }
  V.bag = (v) => h('div.vis-bag', h('div.bag-box', v.items.map((e) => h('span', e))));

  // Biểu đồ tranh: { kind:'picto', title, rows:[{ icon:'🐱', label:'Mèo', n:4 }], note }
  V.picto = (v) => h('div.vis-picto',
    v.title && h('div.pc-title', v.title),
    h('table', v.rows.map((r) => h('tr', h('th', r.label), h('td', Array.from({ length: r.n }, () => h('span', r.icon)))))),
    v.note && h('div.pc-note', v.note));

  // Tờ tiền Việt Nam (vẽ đơn giản): 100, 200, 500, 1000 đồng
  const NOTE_COLORS = { 100: ['#e7d3a8', '#7a5a22'], 200: ['#f2b48a', '#8a4520'], 500: ['#f5b3cc', '#9a3561'], 1000: ['#c6b6ee', '#4f3f94'] };
  S.note = (val) => {
    const [bg, ink] = NOTE_COLORS[val] || ['#ddd', '#333'];
    return `<svg viewBox="0 0 160 78" class="note" role="img" aria-label="${val} đồng">` +
      `<rect x="2" y="2" width="156" height="74" rx="9" fill="${bg}" stroke="${ink}" stroke-width="3"/>` +
      `<rect x="10" y="10" width="140" height="58" rx="6" fill="none" stroke="${ink}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
      `<text class="nt-v" x="80" y="45" fill="${ink}">${val}</text><text class="nt-u" x="80" y="63" fill="${ink}">ĐỒNG</text></svg>`;
  };
  V.money = (v) => wrap('vis-money', v.notes.map(S.note).join(''));

  // Tia số: { kind:'numberline', start:30, step:1, count:11, hide:[3], mark:[0] }
  V.numberline = function (v) {
    const n = v.count, gap = 100;
    const W = gap * (n - 1) + 110, H = 125;
    const x = (i) => 45 + i * gap;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tia số">`;
    s += `<line class="nl-axis" x1="20" y1="45" x2="${W - 22}" y2="45"/>`;
    s += `<path class="nl-arrow" d="M ${W - 6} 45 l -22 -13 v 26 z"/>`;
    for (let i = 0; i < n; i++) {
      const val = v.start + i * v.step;
      s += `<line class="nl-tick" x1="${x(i)}" y1="31" x2="${x(i)}" y2="59"/>`;
      if (v.hide && v.hide.includes(i)) {
        s += `<rect class="nl-box" x="${x(i) - 38}" y="68" width="76" height="50" rx="12"/>`;
        s += `<text class="nl-q" x="${x(i)}" y="105">?</text>`;
      } else {
        s += `<text class="nl-num${v.mark && v.mark.includes(i) ? ' mark' : ''}" x="${x(i)}" y="104">${val}</text>`;
      }
    }
    return wrap('q-nline', s + '</svg>');
  };

  // Đặt tính theo cột: { kind:'vertical', a:45, b:23, op:'+', res:68 }
  V.vertical = function (v) {
    const w = Math.max(String(v.a).length, String(v.b).length, String(v.res).length);
    const digits = (num) => String(num).padStart(w, ' ').split('').map((c) => h('span.vd', c.trim()));
    return h('div.vcalc',
      h('span.vop', v.op),
      h('div.vnum', digits(v.a)),
      h('div.vnum', digits(v.b)),
      h('div.vline'),
      h('div.vnum.vres', String(v.res).padStart(w, ' ').split('').map((c) => h('span.vd.vq', c.trim() ? '?' : ''))));
  };

  // ================= Khối lượng: cân đĩa =================
  const BOX_COLORS = { A: '#ff6b6b', B: '#3d8bff', C: '#22b573', D: '#ff9f43' };

  // Một vật trên đĩa cân, đáy ở độ cao `base`. Vật là emoji, quả cân { kg } hoặc hộp có chữ { box }
  function balItem(x, base, it) {
    if (typeof it === 'string') return `<text class="bl-emoji" x="${r1(x)}" y="${r1(base - 5)}">${it}</text>`;
    if (it.kg) {
      const w = 12 + Math.min(it.kg, 5) * 1.3, hh = 19 + Math.min(it.kg, 5) * 1.8;
      return `<g class="bl-weight"><path d="M${r1(x - w)} ${r1(base)} L${r1(x + w)} ${r1(base)} L${r1(x + w * 0.7)} ${r1(base - hh)} L${r1(x - w * 0.7)} ${r1(base - hh)} Z"/>` +
        `<circle cx="${r1(x)}" cy="${r1(base - hh - 4)}" r="4.5"/><text x="${r1(x)}" y="${r1(base - hh / 2 + 4)}">${it.kg}kg</text></g>`;
    }
    if (it.box) {
      return `<g class="bl-box"><rect x="${r1(x - 19)}" y="${r1(base - 38)}" width="38" height="38" rx="7" fill="${BOX_COLORS[it.box] || '#8d99ae'}"/>` +
        `<text x="${r1(x)}" y="${r1(base - 11)}">${it.box}</text></g>`;
    }
    return '';
  }
  function balPan(x, y, items) {
    const py = y + 58;
    let s = `<line class="bl-string" x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x - 44)}" y2="${r1(py)}"/>` +
      `<line class="bl-string" x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x + 44)}" y2="${r1(py)}"/>`;
    const gap = items.some((i) => typeof i === 'string') ? 40 : 31;
    const start = x - ((items.length - 1) * gap) / 2;
    items.forEach((it, i) => { s += balItem(start + i * gap, py, it); });
    return s + `<path class="bl-pan" d="M${r1(x - 52)} ${r1(py)} Q ${r1(x)} ${r1(py + 30)} ${r1(x + 52)} ${r1(py)} Z"/>`;
  }
  // tilt: -1 bên trái nặng hơn (thấp xuống), 1 bên phải nặng hơn, 0 thăng bằng
  S.balance = ({ left = [], right = [], tilt = 0 }) => {
    const t = (tilt * 9 * Math.PI) / 180, px = 150, py = 64, L = 100;
    const lx = px - L * Math.cos(t), ly = py - L * Math.sin(t);
    const rx = px + L * Math.cos(t), ry = py + L * Math.sin(t);
    return '<svg viewBox="-8 0 316 222" class="balance" role="img" aria-label="Cân đĩa">' +
      '<path class="bl-base" d="M110 218 H190 L173 198 H127 Z"/><rect class="bl-post" x="145" y="64" width="10" height="136" rx="3"/>' +
      `<line class="bl-beam" x1="${r1(lx)}" y1="${r1(ly)}" x2="${r1(rx)}" y2="${r1(ry)}"/>` +
      balPan(lx, ly, left) + balPan(rx, ry, right) +
      `<circle class="bl-pivot" cx="${px}" cy="${py}" r="8"/></svg>`;
  };
  V.balance = (v) => wrap('vis-balance', S.balance(v));
  V.balances = (v) => wrap('vis-balances', v.items.map(S.balance).join(''));

  // ================= Dung tích: chai, can, cốc, bình =================
  // Can/chai có ghi dung tích, to nhỏ theo số lít
  S.can = (cap, { fill = 0.86, label = cap + ' l' } = {}) => {
    const sc = { 1: 0.62, 2: 0.76, 5: 0.95, 10: 1.12 }[cap] || 0.8;
    const w = Math.round(70 * sc), ht = Math.round(118 * sc);
    const bodyY = Math.round(ht * 0.22), bodyH = ht - bodyY - 2;
    const neck = Math.round(w * 0.36);
    const waterH = Math.round((bodyH - 8) * fill);
    const tagH = Math.max(15, Math.round(bodyH * 0.26)), tagY = Math.round(bodyY + bodyH * 0.3);
    return `<svg viewBox="0 0 ${w} ${ht}" class="can" style="width:${r1(w / 16)}em">` +
      `<rect class="cn-cap" x="${(w - neck) / 2 - 2}" y="1" width="${neck + 4}" height="${Math.round(bodyY * 0.45)}" rx="3"/>` +
      `<rect class="cn-neck" x="${(w - neck) / 2}" y="${Math.round(bodyY * 0.4)}" width="${neck}" height="${Math.round(bodyY * 0.7)}"/>` +
      `<rect class="cn-body" x="2" y="${bodyY}" width="${w - 4}" height="${bodyH}" rx="${Math.round(w * 0.18)}"/>` +
      `<rect class="cn-water" x="6" y="${bodyY + bodyH - 4 - waterH}" width="${w - 12}" height="${waterH}" rx="${Math.round(w * 0.14)}"/>` +
      (label ? `<rect class="cn-tag" x="${r1(w * 0.16)}" y="${tagY}" width="${r1(w * 0.68)}" height="${tagH}" rx="4"/>` +
        `<text class="cn-label" x="${w / 2}" y="${r1(tagY + tagH * 0.74)}" font-size="${r1(Math.max(10, w * 0.24))}">${label}</text>` : '') +
      '</svg>';
  };
  // { kind:'bottles', items:[{ cap:5 }, { cap:1 }] }
  V.bottles = (v) => wrap('vis-row', v.items.map((c) => S.can(c.cap, c)).join(''));

  S.cup = () => '<svg viewBox="0 0 30 34" class="cup"><path class="cp-glass" d="M3 3 H27 L23 31 H7 Z"/><path class="cp-water" d="M5.6 10 H24.4 L22.2 29 H7.8 Z"/></svg>';
  // Rót nước từ bình ra cốc: { kind:'cups', rows:[{ label:'Bình A', n:5 }, …] }
  V.cups = (v) => h('div.vis-cups', v.rows.map((r) => h('div.cup-row',
    h('b', r.label), h('span.cup-jar', { html: S.can(5, { label: '' }) }), h('span.cup-arrow', '→'),
    h('div.cups', { html: S.cup().repeat(r.n) }))));

  // Ba bình giống nhau, mực nước khác nhau: { kind:'jars', items:[{ fill:0.5, label:'A' }, …] }
  S.jar = (fill) => '<svg viewBox="0 0 60 90" class="jar">' +
    '<rect class="jr-body" x="5" y="9" width="50" height="78" rx="8"/>' +
    `<rect class="jr-water" x="9" y="${r1(83 - 70 * fill)}" width="42" height="${r1(70 * fill)}" rx="5"/>` +
    '<rect class="jr-rim" x="2" y="4" width="56" height="9" rx="4"/></svg>';
  V.jars = (v) => h('div.vis-jars', v.items.map((it) => h('figure', { html: S.jar(it.fill) }, h('figcaption', it.label))));

  // ================= Thời gian: đồng hồ, lịch =================
  S.clock = (hh, mm) => {
    let s = '<svg viewBox="0 0 200 200" class="clock" role="img" aria-label="Đồng hồ">' +
      '<circle class="ck-rim" cx="100" cy="100" r="97"/><circle class="ck-face" cx="100" cy="100" r="87"/>';
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0, ra = big ? 73 : 79;
      s += `<line class="${big ? 'ck-t5' : 'ck-t1'}" x1="${r1(100 + ra * Math.sin(a))}" y1="${r1(100 - ra * Math.cos(a))}" ` +
        `x2="${r1(100 + 85 * Math.sin(a))}" y2="${r1(100 - 85 * Math.cos(a))}"/>`;
    }
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      s += `<text class="ck-num" x="${r1(100 + 59 * Math.sin(a))}" y="${r1(100 - 59 * Math.cos(a) + 8)}">${n}</text>`;
    }
    const hand = (deg, len, cls) => {
      const a = (deg * Math.PI) / 180;
      return `<line class="${cls}" x1="100" y1="100" x2="${r1(100 + len * Math.sin(a))}" y2="${r1(100 - len * Math.cos(a))}"/>`;
    };
    s += hand(((hh % 12) + mm / 60) * 30, 42, 'ck-h') + hand(mm * 6, 67, 'ck-m');
    return s + '<circle class="ck-pin" cx="100" cy="100" r="6.5"/></svg>';
  };
  S.digital = (hh, mm) => `<div class="digital">${String(hh).padStart(2, '0')}<span>:</span>${String(mm).padStart(2, '0')}</div>`;
  V.clock = (v) => wrap('vis-clock', S.clock(v.h, v.m));
  V.digital = (v) => wrap('vis-digital', S.digital(v.h, v.m));

  // Tờ lịch tháng: { kind:'calendar', year:2026, month:10, mark:[20] } – tuần bắt đầu từ thứ Hai
  const WD_HEAD = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  V.calendar = (v) => {
    const days = new Date(v.year, v.month, 0).getDate();
    const start = (new Date(v.year, v.month - 1, 1).getDay() + 6) % 7;
    const mark = new Set(v.mark || []);
    let s = `<div class="cal"><div class="cal-title">Tháng ${v.month} năm ${v.year}</div><table><thead><tr>`;
    WD_HEAD.forEach((d, i) => { s += `<th class="${i === 6 ? 'sun' : ''}">${d}</th>`; });
    s += '</tr></thead><tbody><tr>';
    let col = 0;
    for (let i = 0; i < start; i++, col++) s += '<td></td>';
    for (let d = 1; d <= days; d++, col++) {
      if (col === 7) { s += '</tr><tr>'; col = 0; }
      s += `<td class="${col === 6 ? 'sun' : ''}${mark.has(d) ? ' mark' : ''}"><span>${d}</span></td>`;
    }
    for (; col < 7; col++) s += '<td></td>';
    return wrap('vis-cal', s + '</tr></tbody></table></div>');
  };

  // ================= Hình học =================
  // Bản vẽ: { kind:'geo', w, h, pts:{ A:[x,y] }, segs:[['A','B']], lines:[['A','B']], path:['A','B','C'],
  //           curves:['M…'], rawSegs:[[x1,y1,x2,y2]], lens:[[x,y,'3 cm']] }
  S.geo = (g) => {
    const P = g.pts || {};
    const names = Object.keys(P);
    const cx = names.reduce((s, n) => s + P[n][0], 0) / (names.length || 1);
    const cy = names.reduce((s, n) => s + P[n][1], 0) / (names.length || 1);
    let s = `<svg viewBox="0 0 ${g.w} ${g.h}" class="geo">`;
    (g.lines || []).forEach(([a, b]) => {
      const [x1, y1] = P[a], [x2, y2] = P[b], ex = (x2 - x1) * 0.45, ey = (y2 - y1) * 0.45;
      s += `<line class="geo-line" x1="${r1(x1 - ex)}" y1="${r1(y1 - ey)}" x2="${r1(x2 + ex)}" y2="${r1(y2 + ey)}"/>`;
    });
    (g.segs || []).forEach(([a, b]) => {
      s += `<line class="geo-seg" x1="${r1(P[a][0])}" y1="${r1(P[a][1])}" x2="${r1(P[b][0])}" y2="${r1(P[b][1])}"/>`;
    });
    if (g.path) s += `<polyline class="geo-seg" points="${g.path.map((n) => r1(P[n][0]) + ',' + r1(P[n][1])).join(' ')}"/>`;
    (g.curves || []).forEach((d) => { s += `<path class="geo-curve" d="${d}"/>`; });
    (g.rawSegs || []).forEach(([x1, y1, x2, y2]) => {
      s += `<line class="geo-seg" x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"/>` +
        `<circle class="geo-dot" cx="${r1(x1)}" cy="${r1(y1)}" r="4.5"/><circle class="geo-dot" cx="${r1(x2)}" cy="${r1(y2)}" r="4.5"/>`;
    });
    (g.lens || []).forEach(([x, y, t]) => { s += `<text class="geo-len" x="${r1(x)}" y="${r1(y)}">${t}</text>`; });
    names.forEach((n) => {
      const [x, y] = P[n];
      // nhãn đặt ra phía ngoài (xa tâm hình), không tràn khỏi khung
      let dx = x - cx, dy = y - cy;
      const len = Math.hypot(dx, dy);
      if (len < 1) { dx = 0; dy = -1; } else { dx /= len; dy /= len; }
      if (names.length <= 2) { dx = 0; dy = -1; }
      let lx = x + dx * 18, ly = y + dy * 18 + 6;
      lx = Math.min(g.w - 9, Math.max(9, lx));
      ly = Math.min(g.h - 4, Math.max(17, ly));
      s += `<circle class="geo-dot" cx="${r1(x)}" cy="${r1(y)}" r="4.5"/><text class="geo-lbl" x="${r1(lx)}" y="${r1(ly)}">${n}</text>`;
    });
    return s + '</svg>';
  };
  V.geo = (v) => wrap('vis-geo', S.geo(v));

  // Thước kẻ đo đoạn thẳng AB: { kind:'ruler', len:7, start:0 }
  S.ruler = (len, start = 0, max = 10) => {
    const u = 28, x0 = 20, W = x0 * 2 + max * u, H = 120;
    const ax = x0 + start * u, bx = x0 + (start + len) * u;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="ruler" role="img" aria-label="Thước kẻ">` +
      `<line class="rl-guide" x1="${ax}" y1="24" x2="${ax}" y2="46"/><line class="rl-guide" x1="${bx}" y1="24" x2="${bx}" y2="46"/>` +
      `<line class="geo-seg" x1="${ax}" y1="24" x2="${bx}" y2="24"/>` +
      `<circle class="geo-dot" cx="${ax}" cy="24" r="4.5"/><circle class="geo-dot" cx="${bx}" cy="24" r="4.5"/>` +
      `<text class="geo-lbl" x="${Math.max(10, ax - 13)}" y="20">A</text><text class="geo-lbl" x="${Math.min(W - 10, bx + 13)}" y="20">B</text>` +
      `<rect class="rl-body" x="4" y="46" width="${W - 8}" height="66" rx="6"/>`;
    for (let i = 0; i <= max * 2; i++) {
      const x = x0 + (i * u) / 2, big = i % 2 === 0;
      s += `<line class="rl-tick" x1="${x}" y1="46" x2="${x}" y2="${big ? 66 : 57}"/>`;
      if (big) s += `<text class="rl-num" x="${x}" y="88">${i / 2}</text>`;
    }
    return s + `<text class="rl-cm" x="${W - 24}" y="106">cm</text></svg>`;
  };
  V.ruler = (v) => wrap('vis-ruler', S.ruler(v.len, v.start || 0, v.max || 10));

  // Các hình phẳng (khung 100×100)
  const PASTEL = ['#ffd6a5', '#caffbf', '#9bf6ff', '#bdb2ff', '#ffc6ff', '#fdffb6', '#ffadad'];
  const regular = (n, r = 40, rot = -90) => Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return [r1(50 + r * Math.cos(a)), r1(52 + r * Math.sin(a))];
  });
  const SHAPES = {
    square: [[22, 22], [78, 22], [78, 78], [22, 78]],
    rect: [[10, 32], [90, 32], [90, 70], [10, 70]],
    rhombus: [[50, 10], [86, 50], [50, 90], [14, 50]],
    trapezoid: [[30, 24], [72, 24], [92, 78], [8, 78]],
    kite: [[50, 10], [80, 42], [50, 90], [20, 42]],
    quad: [[14, 30], [66, 14], [88, 72], [32, 86]],
    quad2: [[20, 18], [86, 36], [74, 86], [10, 68]],
    triangle: [[50, 12], [90, 86], [10, 86]],
    triangle2: [[14, 20], [88, 42], [30, 90]],
    triangle3: [[10, 82], [90, 82], [22, 18]],
    pentagon: regular(5),
    hexagon: regular(6, 40, 0),
  };
  S.QUADS = ['square', 'rect', 'rhombus', 'trapezoid', 'kite', 'quad', 'quad2'];
  S.NONQUADS = ['triangle', 'triangle2', 'triangle3', 'pentagon', 'hexagon', 'circle', 'semicircle'];
  S.shape = (name, colorIndex = 0) => {
    const fill = PASTEL[colorIndex % PASTEL.length];
    let body;
    if (name === 'circle') body = `<circle cx="50" cy="50" r="38" fill="${fill}"/>`;
    else if (name === 'semicircle') body = `<path d="M12 70 A38 38 0 0 1 88 70 Z" fill="${fill}"/>`;
    else body = `<polygon points="${SHAPES[name].map((p) => p.join(',')).join(' ')}" fill="${fill}"/>`;
    return `<svg viewBox="0 0 100 100" class="shape"><g class="shape-fill">${body}</g></svg>`;
  };
  // Một dãy hình: { kind:'shapes', items:['square','triangle',…] }
  V.shapes = (v) => wrap('vis-shapes', v.items.map((n, i) => S.shape(n, i)).join(''));

  // Hình ghép từ các ô vuông: { kind:'grid', cells:[[0,0],[1,0],…] }
  S.grid = (cells) => {
    const u = 34;
    const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const W = (Math.max(...xs) - minX + 1) * u + 8, H = (Math.max(...ys) - minY + 1) * u + 8;
    return `<svg viewBox="0 0 ${W} ${H}" width="${Math.round(W * 1.6)}" height="${Math.round(H * 1.6)}" class="grid-shape">` +
      cells.map(([x, y]) => `<rect class="gr-cell" x="${(x - minX) * u + 4}" y="${(y - minY) * u + 4}" width="${u}" height="${u}" rx="3"/>`).join('') +
      '</svg>';
  };
  V.grid = (v) => wrap('vis-grid', S.grid(v.cells));

  App.Visuals = V;
  App.Svg = S;
})(window.App);
