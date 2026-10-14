/* Góc phụ huynh: câu hỏi khóa → Bảng đánh giá 5 thẻ
   📊 Tổng quan · 📚 Theo môn · 📈 Tiến bộ · 📒 Báo cáo tuần · ⚙️ Cài đặt */
(function (App) {
  'use strict';
  const { h, rand } = App.U;
  const R = App.Rewards;
  const P = () => App.Report;
  let passedAt = 0;          // đã mở khóa trong 10 phút gần đây thì không hỏi lại
  let tab = 'tongquan';      // thẻ đang xem
  let subj = 'toan';         // môn đang xem ở thẻ "Theo môn"
  let reportWk = null;       // tuần đang xem ở thẻ "Báo cáo tuần"

  const TABS = [['tongquan', '📊 Tổng quan'], ['theomon', '📚 Theo môn'], ['tienbo', '📈 Tiến bộ'], ['baocao', '📒 Báo cáo tuần'], ['caidat', '⚙️ Cài đặt']];

  App.Screens.parent = {
    render() {
      const el = h('div.screen.parent');
      el.appendChild(h('div.topbar',
        h('button.icon-btn', { 'aria-label': 'Về trang chủ', onclick: () => App.Router.home() }, '🏠'),
        h('div.title', '👨‍👩‍👧 Góc phụ huynh')));
      const body = h('div.scroll');
      el.appendChild(body);
      el.appendChild(App.UI.bottomNav('parent'));
      if (Date.now() - passedAt < 10 * 60 * 1000) body.appendChild(shell(body));
      else body.appendChild(gate(() => { passedAt = Date.now(); body.innerHTML = ''; body.appendChild(shell(body)); }));
      return el;
    },
  };

  // ---- Câu hỏi khóa (phép nhân mà bé lớp 2 chưa học) ----
  function gate(onPass) {
    let a, b, val = '';
    const slot = h('span.slot', '?');
    const q = h('div.gate-q');
    const newQ = () => { a = rand(6, 9); b = rand(3, 9); val = ''; q.innerHTML = ''; q.append(`${a} × ${b} = `, slot); slot.textContent = '?'; };
    newQ();
    const pad = App.UI.keypad((k) => {
      App.Sound.play('tap');
      if (k === 'del') val = val.slice(0, -1);
      else if (k === 'ok') {
        if (Number(val) === a * b) { App.Sound.play('unlock'); onPass(); return; }
        slot.classList.add('wrong');
        App.Sound.play('wrong');
        setTimeout(() => { slot.classList.remove('wrong'); newQ(); }, 600);
        return;
      } else if (val.length < 3) val += k;
      slot.textContent = val || '?';
    });
    return h('div.center', { style: { padding: '1rem' } },
      h('div.card.gate', { style: { padding: '1.6rem', textAlign: 'center', width: 'min(100%, 34rem)' } },
        h('div.modal-icon', '🔐'),
        h('div.modal-title', 'Dành cho bố mẹ'),
        h('div.modal-body', 'Vui lòng trả lời phép tính để vào Góc phụ huynh:'),
        q, pad));
  }

  // ---- Khung có thanh thẻ ----
  function shell(scroller) {
    const bar = h('div.p-tabs');
    const content = h('div.parent-body');
    const draw = () => {
      bar.innerHTML = '';
      TABS.forEach(([id, label]) => bar.appendChild(h('button.p-tab', {
        class: id === tab ? 'on' : '',
        onclick: () => { if (tab === id) return; App.Sound.play('tap'); tab = id; draw(); scroller.scrollTop = 0; },
      }, label)));
      content.innerHTML = '';
      App.U.add(content, VIEWS[tab](draw));
    };
    draw();
    return h('div', bar, content);
  }

  // ================= Các mảnh giao diện dùng chung =================
  const chip = (label, cls) => h('span.ab-rate', { class: cls || 'none' }, label);
  const rateChip = (o, l) => {
    const r = P().rate(o, l);
    return r ? chip(`${r.icon} ${r.label} · ${r.p}%`, r.cls) : chip(o.n ? `cần thêm ${P().RATE[l].min - o.n} câu` : 'chưa có câu', 'none');
  };
  // Số liệu một tuần thường ít câu: chưa đủ để xếp loại thì vẫn hiện tỉ lệ đúng và số câu
  const weekChip = (o, l) => {
    const r = P().rate(o, l);
    return r ? chip(`${r.icon} ${r.label} · ${r.p}%`, r.cls) : chip(o.n ? `${P().pct(o.ok, o.n)}% · ${o.n} câu` : 'chưa có câu', 'none');
  };
  const bar = (p, color) => h('div.p-bar', h('i', { style: { width: (p || 0) + '%', background: color } }));
  // Chênh lệch so với tuần trước
  const delta = (cur, prev, unit = '') => {
    if (cur == null || prev == null || (!cur && !prev)) return h('small.dl', '');
    const d = cur - prev;
    if (!d) return h('small.dl', 'bằng tuần trước');
    return h('small.dl', { class: d > 0 ? 'up' : 'down' }, `${d > 0 ? '+' : '−'}${Math.abs(d)}${unit} so với tuần trước`);
  };
  const tile = (value, label, sub) => h('div.p-stat', h('b', value), h('span', label), sub || null);
  const card = (title, ...kids) => h('div.p-card', h('h3', title), ...kids);
  const wide = (title, ...kids) => h('div.p-card.wide', h('h3', title), ...kids);
  const empty = (text) => h('p.muted', text);
  const enoughSkills = () => P().skills().some((s) => s.n >= 3); // đã có kỹ năng đủ câu để nói "không yếu"

  // Hàng xếp loại của một môn (cơ bản / nâng cao)
  function levelRow(label, o, l, extra) {
    const p = P().pct(o.ok, o.n);
    return h('div.ab-row',
      h('div.ab-lbl', label, h('small', o.n ? `${p}% đúng ngay · ${o.n} câu${extra || ''}` : 'Chưa có câu nào')),
      bar(p, P().color(p, l)),
      rateChip(o, l));
  }

  // Dãy 7 ngày của mục tiêu tuần
  function goalDots(g) {
    const today = App.U.dayKey();
    return h('div.goal-days', g.days.map((d) => h('div.gd', {
      class: d.k > today ? 'future' : d.min >= g.targetMin ? 'met' : d.min > 0 ? 'some' : 'none',
      title: `${P().dayLabel(d.k)}: ${d.min} phút`,
    }, h('b', ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][g.days.indexOf(d)]), h('small', d.k > today ? '' : `${d.min}′`))));
  }

  // ================= 📊 Tổng quan =================
  function viewOverview() {
    const Rp = P();
    const r = Rp.weekReport();
    const A = R.ability();
    const today = R.today();
    const st = App.Store.state;
    const g = r.goal;
    // Câu hôm nay: chỉ tính câu làm lần đầu trong chặng (giống các ô tuần này), không tính câu ôn lại
    const tl = today.lv ? Rp.sumStat(Object.values(today.lv).map((a) => ({ n: a[0] || 0, ok: a[1] || 0, ms: 0, fast: 0 }))) : { n: today.q, ok: today.ok };
    const cards = [];

    cards.push(wide(`📅 Tuần này (${r.label})`,
      h('div.p-stats.four',
        tile(`${r.days}/7`, 'ngày có học', delta(r.days, r.daysPrev, ' ngày')),
        tile(r.min, 'phút học', delta(r.min, r.minPrev, ' phút')),
        tile(r.q, 'câu đã làm', delta(r.q, r.qPrev, ' câu')),
        tile(r.p != null ? r.p + '%' : '–', 'đúng ngay lần đầu', delta(r.p, r.pPrev, '%'))),
      h('div.goal-row',
        h('div.goal-lbl', `🎯 Mục tiêu: ${g.targetDays} ngày/tuần, mỗi ngày ${g.targetMin} phút`, h('small', g.met >= g.targetDays ? 'Đã đạt mục tiêu tuần này! 🎉' : `Đã đạt ${g.met}/${g.targetDays} ngày`)),
        goalDots(g)),
      h('p.muted', { style: { marginTop: '.5rem' } },
        `Hôm nay: ${Math.round(today.sec / 60)} phút · ${tl.n} câu${tl.n ? ` · đúng ngay ${Rp.pct(tl.ok, tl.n)}%` : ''} · 🔥 chuỗi ${R.streakNow()} ngày (dài nhất ${st.streak.best} ngày)`)));

    cards.push(card('🏅 Xếp loại theo môn',
      Rp.SUBJ.map((sid) => h('div.sub-rate',
        h('div.sr-name', `${Rp.icon(sid)} ${Rp.name(sid)}`),
        h('div.sr-chips', h('small', '📗 Cơ bản'), rateChip(A[sid].cb, 'cb'), h('small', '🔥 Nâng cao'), rateChip(A[sid].nc, 'nc')))),
      h('p.muted.ab-legend', 'Tính theo câu làm đúng ngay lần đầu, không tính câu ôn lại. Xem chi tiết ở thẻ “Theo môn”.')));

    cards.push(card('🎓 Năng lực, phẩm chất',
      Rp.qualities().map((x) => h('div.p-row', h('div.lbl', x.name, h('small', x.note)), chip(x.label, x.cls))),
      h('p.muted.ab-legend', 'Ghi theo cách nhận xét ở trường: Tốt · Đạt · Cần cố gắng.')));

    const sts = Rp.strengths(3), wks = Rp.weaknesses(3);
    const skillLine = (s) => h('div.p-row', h('div.lbl', `${Rp.icon(s.sid)} ${s.name}`, h('small', `${s.lv === 'nc' ? '🔥 nâng cao · ' : ''}${s.n} câu · đúng ngay ${s.p}%`)), bar(s.p, Rp.color(s.p, s.lv)));
    cards.push(card('💪 Điểm mạnh – 🎯 Cần luyện',
      h('h4', '💪 Điểm mạnh'), sts.length ? sts.map(skillLine) : empty('Chưa đủ dữ liệu (cần ít nhất 5 câu mỗi kỹ năng).'),
      h('h4', '🎯 Cần luyện'), wks.length ? wks.map(skillLine) : empty(enoughSkills() ? 'Chưa thấy kỹ năng nào yếu. Giỏi quá! 🎉' : 'Chưa đủ dữ liệu.')));

    const wkNo = Rp.schoolWeek();
    cards.push(card(`🏫 So với tiến độ ở lớp (tuần ${wkNo})`,
      Rp.SUBJ.map((sid) => {
        const sc = Rp.school(sid, wkNo);
        const st2 = sc.status === 'cham' ? chip(`còn ${sc.missing.length} chặng chưa làm`, 'low')
          : sc.status === 'truoc' ? chip(`đi trước ${sc.ahead} chặng`, 'good') : chip('đúng tiến độ', 'ok');
        return h('div.p-row', h('div.lbl', `${Rp.icon(sid)} ${Rp.name(sid)}`, h('small', sc.now ? `Tuần này lớp học: ${sc.now.stage.short}` : '')), st2);
      }),
      h('p.muted.ab-legend', 'Theo lịch dạy phổ biến của năm học 2026–2027; trường của bé có thể lệch. Chỉnh tuần học ở thẻ ⚙️ Cài đặt.')));

    cards.push(wide('💡 Gợi ý tuần này', h('ol.sugg', Rp.suggestions().map((x) => h('li', h('span.si', x.icon), x.text)))));
    return cards;
  }

  // ================= 📚 Theo môn =================
  function viewSubject(redraw) {
    const Rp = P();
    const A = R.ability();
    const a = A[subj];
    const cards = [];
    cards.push(h('div.subj-pick.wide', Rp.SUBJ.map((sid) => h('button.chip', {
      class: sid === subj ? 'on' : '',
      onclick: () => { App.Sound.play('tap'); subj = sid; redraw(); },
    }, `${Rp.icon(sid)} ${Rp.name(sid)}`))));

    const sp = Rp.speed(subj);
    cards.push(wide(`📊 Xếp loại ${Rp.name(subj)}`,
      levelRow('📗 Cơ bản (theo sách giáo khoa)', a.cb, 'cb', a.cb.n7 ? ` · 7 ngày qua: ${Rp.pct(a.cb.ok7, a.cb.n7)}%` : ''),
      levelRow('🔥 Nâng cao', a.nc, 'nc', a.nc.n7 ? ` · 7 ngày qua: ${Rp.pct(a.nc.ok7, a.nc.n7)}%` : ''),
      h('p.ab-note', Rp.comment(a.cb, a.nc)),
      h('p.muted', { style: { marginTop: '.4rem' } }, sp.n
        ? `⏱️ 4 tuần gần đây: trung bình ${String(sp.avgSec).replace('.', ',')} giây mỗi câu${sp.guess != null ? ` · ${sp.guess}% câu sai được trả lời rất nhanh (dưới 3 giây – có thể bé đoán mò)` : ''}.`
        : '⏱️ Tốc độ làm bài sẽ có sau khi bé làm thêm vài chặng.')));

    const LV = { chac: ['Chắc', 'good'], dang: ['Đang học', 'ok'], chua: ['Chưa học', 'none'] };
    cards.push(wide('🗂️ Các chủ đề',
      h('div.topic-grid', Rp.topics(subj).map((t) => h('div.topic-row',
        h('div.lbl', `${t.topic.icon} ${t.topic.short}: ${t.topic.name}`,
          h('small', `${t.done}/${t.total} chặng${t.done ? ` · trung bình ${String(Math.round(t.avg * 10) / 10).replace('.', ',')} ⭐` : ''}${t.bonus ? (t.challengeDone ? ' · 🧠 đã vượt thử thách' : ' · 🧠 chưa làm thử thách') : ''}`)),
        bar(t.total ? (t.done / t.total) * 100 : 0, `var(--${subj})`),
        chip(LV[t.level][0], LV[t.level][1]))))));

    const sc = Rp.school(subj);
    cards.push(card(`🏫 Tiến độ so với lớp (tuần ${sc.week})`,
      h('p', sc.now ? `Tuần này ở lớp học đến: ${sc.now.stage.short} – ${sc.now.stage.name}.` : ''),
      sc.missing.length
        ? [h('p', { style: { margin: '.4rem 0 .2rem', fontWeight: 700, color: 'var(--bad-dark)' } }, `Còn ${sc.missing.length} chặng của các tuần trước bé chưa làm:`),
          sc.missing.slice(0, 5).map((x) => h('div.p-row', h('div.lbl', x.stage.short, h('small', x.stage.name))))]
        : h('p', { style: { color: 'var(--good-dark)', fontWeight: 700, marginTop: '.4rem' } }, sc.ahead ? `Bé đã làm hết bài các tuần trước và đi trước ${sc.ahead} chặng. 🎉` : 'Bé đã làm hết bài của các tuần trước. 👍'),
      h('p.muted.ab-legend', 'Lịch lệch so với lớp của bé? Chỉnh “Tuần học hiện tại” ở thẻ ⚙️ Cài đặt.')));

    const rp = Rp.replayList(subj, 6);
    cards.push(card('⭐ Nên chơi lại (dưới 3 sao)',
      rp.length ? rp.map((x) => h('div.p-row', h('div.lbl', x.stage.short, h('small', x.stage.name)), chip('⭐'.repeat(x.stars) + '☆'.repeat(3 - x.stars), 'ok')))
        : empty('Không có chặng nào dưới 3 sao. Tuyệt vời! 🎉')));

    const skillRows = (l) => {
      const list = Rp.skills(subj, l).filter((s) => s.n >= 3).sort((x, y) => x.p - y.p).slice(0, 5);
      return list.length ? list.map((s) => h('div.p-row', h('div.lbl', s.name, h('small', `${s.n} câu · đúng ngay ${s.p}%`)), bar(s.p, Rp.color(s.p, l))))
        : empty(l === 'cb' ? 'Chưa đủ dữ liệu.' : 'Chưa có đủ câu nâng cao.');
    };
    cards.push(card('🎯 Kỹ năng (từ cần luyện nhất)', h('h4', '📗 Cơ bản'), skillRows('cb'), h('h4', '🔥 Nâng cao'), skillRows('nc')));

    const mk = App.Store.state.mistakes.filter((m) => m.sid === subj).slice(0, 5);
    cards.push(wide(`📝 Câu sai gần đây – ${Rp.name(subj)}`,
      mk.length ? mk.map(mistakeRow) : empty('Không có câu sai nào đang chờ ôn. 🎉'),
      mk.length ? h('p.muted', { style: { marginTop: '.5rem' } }, 'Bé làm lại ở nút “🔁 Ôn lại câu sai” trên trang chủ.') : null));
    return cards;
  }
  const mistakeRow = (m) => h('div.p-row',
    h('div.lbl', (m.q.note || [m.q.prompt, m.q.big && App.U.plain(m.q.big)].filter(Boolean).join('  ')).replace(/\n/g, ' '),
      h('small', 'Đáp án: ' + answerOf(m.q))));

  // ================= 📈 Tiến bộ =================
  const CATS = [['toan', 'Toán', 'var(--toan)'], ['tv', 'Tiếng Việt', 'var(--tv)'], ['ta', 'Tiếng Anh', 'var(--ta)'],
    ['review', 'Ôn câu sai', 'var(--orange)'], ['pet', 'Thú cưng, sticker', 'var(--pink)'], ['other', 'Khác', '#c3c8d8']];
  const legend = (items) => h('div.legend', items.map(([, label, color]) => h('span', h('i', { style: { background: color } }), label)));
  function viewProgress() {
    const Rp = P();
    const T = Rp.trend(8);
    const cards = [];
    const maxMin = Math.max(20, ...T.map((x) => Math.round(x.w.sec / 60)));
    cards.push(wide('⏱️ Thời gian học 8 tuần gần đây (phút)',
      h('div.chart', T.map((x) => {
        const total = Math.round(x.w.sec / 60);
        const known = CATS.reduce((s, [id]) => s + (x.w.sub[id] || 0), 0);
        const segs = CATS.map(([id, , color]) => [Math.round((x.w.sub[id] || 0) / 60), color]);
        if (x.w.sec > known) segs.push([Math.round((x.w.sec - known) / 60), '#c3c8d8']); // số liệu cũ chưa chia theo môn
        return h('div.col',
          h('em', total || ''),
          h('div.stack', { style: { height: '9rem' } }, segs.filter(([m]) => m > 0).map(([m, color]) => h('i', { style: { height: (m / maxMin) * 100 + '%', background: color } }))),
          h('small', x.label));
      })),
      legend(CATS)));

    cards.push(wide('✅ Tỉ lệ đúng ngay theo tuần',
      h('div.chart', T.map((x) => {
        const pc = Rp.pct(x.cb.ok, x.cb.n), pn = Rp.pct(x.nc.ok, x.nc.n);
        return h('div.col',
          h('em', [pc, pn].filter((v) => v != null).map((v) => v + '%').join(' · ')),
          h('div.pair', { style: { height: '9rem' } },
            h('i', { style: { height: (pc || 0) + '%', background: 'var(--toan)' }, title: pc != null ? `Cơ bản ${pc}%` : 'Chưa có câu' }),
            h('i', { style: { height: (pn || 0) + '%', background: 'var(--orange)' }, title: pn != null ? `Nâng cao ${pn}%` : 'Chưa có câu' })),
          h('small', x.label));
      })),
      legend([[0, '📗 Câu cơ bản', 'var(--toan)'], [0, '🔥 Câu nâng cao', 'var(--orange)']])));

    const maxSt = Math.max(3, ...T.map((x) => x.w.stages));
    cards.push(card('🗺️ Số chặng hoàn thành mỗi tuần',
      h('div.chart.small', T.map((x) => h('div.col',
        h('em', x.w.stages || ''),
        h('div.stack', { style: { height: '6rem' } }, x.w.stages ? h('i', { style: { height: (x.w.stages / maxSt) * 100 + '%', background: 'var(--good)' } }) : null),
        h('small', x.label))))));

    const heat = Rp.heat(12);
    const gm = App.Store.state.settings.goalMin || 20;
    const lvl = (d) => (d.future ? 'f' : !d.min ? '0' : d.min < gm / 2 ? '1' : d.min < gm ? '2' : '3');
    const studied = heat.flat().filter((d) => d.min > 0).length;
    cards.push(card('📆 Lịch học 12 tuần',
      h('p.muted', { style: { marginBottom: '.5rem' } }, `Từ ${Rp.dayLabel(heat[0][0].k)} đến nay: ${studied} ngày có học.`),
      h('div.heat',
        h('div.heat-days', ['T2', '', 'T4', '', 'T6', '', 'CN'].map((d) => h('small', d))),
        heat.map((week) => h('div.heat-col', week.map((d) => h('i', { class: 'h' + lvl(d), title: `${Rp.dayLabel(d.k)}: ${d.min} phút` }))))),
      h('div.legend', h('span', h('i.h0'), 'Không học'), h('span', h('i.h1'), `Dưới ${Math.round(gm / 2)} phút`), h('span', h('i.h2'), `Dưới ${gm} phút`), h('span', h('i.h3'), `Đủ ${gm} phút`))));

    cards.push(card('⚡ Tốc độ làm bài (4 tuần gần đây)',
      Rp.SUBJ.map((sid) => {
        const s = Rp.speed(sid);
        return h('div.p-row', h('div.lbl', `${Rp.icon(sid)} ${Rp.name(sid)}`, h('small', s.n
          ? `${s.n} câu · trung bình ${String(s.avgSec).replace('.', ',')} giây/câu${s.guess != null ? ` · ${s.guess}% câu sai trả lời dưới 3 giây` : ''}` : 'chưa có số liệu')));
      }),
      h('p.muted.ab-legend', 'Nhiều câu sai được trả lời rất nhanh nghĩa là bé có thể đang bấm đoán. Bố mẹ nhắc bé đọc kĩ đề trước khi chọn nhé.')));
    return cards;
  }

  // ================= 📒 Báo cáo tuần =================
  function viewReport(redraw) {
    const Rp = P();
    const cur = Rp.weekKey();
    const first = Object.keys(App.Store.state.weeks).sort()[0] || cur; // tuần đầu tiên có số liệu
    reportWk = reportWk || cur;
    const r = Rp.weekReport(reportWk);
    const cards = [];
    cards.push(h('div.week-nav.wide',
      h('button.btn.small.white', { disabled: reportWk <= first, onclick: () => { reportWk = Rp.shiftWeek(reportWk, -1); redraw(); } }, '◀ Tuần trước'),
      h('b', `Tuần ${r.label}${r.isCurrent ? ' (tuần này)' : ''}`),
      h('button.btn.small.white', { disabled: reportWk >= cur, onclick: () => { reportWk = Rp.shiftWeek(reportWk, 1); redraw(); } }, 'Tuần sau ▶')));

    const head = h('div.rp-head', h('div.rp-title', `📒 Báo cáo học tập của ${r.name}`), h('div.rp-sub', `Tuần ${r.label} · Bé Vui Học – Lớp 2`));
    if (!r.days && !r.q) {
      cards.push(h('div.p-card.wide.report', head,
        empty(r.isCurrent ? 'Tuần này bé chưa học bài nào. Báo cáo sẽ có ngay sau khi bé chơi chặng đầu tiên.' : 'Tuần này bé không học trong app.')));
      return cards;
    }
    const sts = Rp.strengths(3), wks = Rp.weaknesses(3);
    cards.push(h('div.p-card.wide.report', head,
      h('div.p-stats.four',
        tile(`${r.days}/7`, 'ngày có học'), tile(r.min, 'phút học'), tile(r.q, 'câu đã làm'), tile(r.p != null ? r.p + '%' : '–', 'đúng ngay lần đầu')),
      h('div.goal-row', h('div.goal-lbl', `🎯 Mục tiêu ${r.goal.targetDays} ngày × ${r.goal.targetMin} phút`, h('small', `Đạt ${r.goal.met}/${r.goal.targetDays} ngày`)), goalDots(r.goal)),
      h('h4', '📚 Từng môn'),
      r.subjects.map((s) => h('div.rp-sub-row',
        h('div.lbl', `${Rp.icon(s.sid)} ${Rp.name(s.sid)}`, h('small', `${s.min} phút · ${s.stages} chặng${s.newStages ? ` (${s.newStages} chặng mới)` : ''}`)),
        h('div.sr-chips', h('small', '📗 Cơ bản'), weekChip(s.cb, 'cb'), h('small', '🔥 Nâng cao'), weekChip(s.nc, 'nc')))),
      h('p.muted', { style: { marginTop: '.5rem' } },
        `🗺️ Hoàn thành ${r.stages} chặng${r.newStages != null ? ` (${r.newStages} chặng mới)` : ''}` + (r.reviews ? ` · 🔁 ôn câu sai ${r.reviews} lần` : '') +
        (r.stickers ? ` · 🌟 ${r.stickers} sticker mới` : '') + (r.badges.length ? ` · 🏅 huy hiệu: ${r.badges.map((b) => b.name).join(', ')}` : '') +
        (r.petMin ? ` · 🐾 chơi với thú cưng, sticker ${r.petMin} phút` : '')),
      h('h4', '💪 Điểm mạnh'), sts.length ? h('p', sts.map((s) => s.name).join(' · ')) : empty('Chưa đủ dữ liệu.'),
      h('h4', '🎯 Cần luyện'), wks.length ? h('p', wks.map((s) => s.name).join(' · ')) : empty(enoughSkills() ? 'Chưa thấy kỹ năng nào yếu.' : 'Chưa đủ dữ liệu.'),
      r.isCurrent ? [h('h4', '💡 Gợi ý tuần này'), h('ol.sugg', Rp.suggestions().map((x) => h('li', h('span.si', x.icon), x.text)))] : null));

    cards.push(h('div.p-actions.wide',
      h('button.btn.small.green', { onclick: () => shareReport(r, 'image') }, '📷 Lưu ảnh báo cáo'),
      h('button.btn.small.white', { onclick: () => shareReport(r, 'share') }, '📤 Gửi báo cáo (Zalo…)'),
      h('button.btn.small.white', { onclick: () => shareReport(r, 'copy') }, '📋 Chép nội dung')));
    return cards;
  }

  // Chép chữ vào bộ nhớ tạm: cách mới (cần https), không được thì dùng cách cũ
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* thử cách cũ */ }
    const ta = h('textarea', { style: { position: 'fixed', top: '0', left: '0', opacity: '0' } });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  async function shareReport(r, how) {
    const text = P().reportText(r);
    const fname = `bao-cao-${App.U.slug(r.name)}-tuan-${r.wk}.png`;
    if (how === 'copy') {
      if (await copyText(text)) { App.UI.toast('📋 Đã chép báo cáo, dán vào Zalo hoặc tin nhắn nhé'); return; }
      // Máy không cho chép tự động: hiện nội dung để bố mẹ tự bôi đen và chép
      const box = h('textarea.text-input.report-text', { readonly: true });
      box.value = text;
      App.UI.modal({ title: '📋 Nội dung báo cáo', body: h('div', h('p.modal-body', 'Bố mẹ giữ tay vào ô dưới để chọn và chép nhé:'), box),
        buttons: [{ label: 'Đóng', value: true, cls: 'green' }] });
      return;
    }
    try {
      const blob = await App.ReportImage.render(r);
      const file = new File([blob], fname, { type: 'image/png' });
      if (how === 'share' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Báo cáo học tập', text });
        return;
      }
      if (how === 'share' && navigator.share) { await navigator.share({ title: 'Báo cáo học tập', text }); return; }
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: fname });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      App.UI.toast('📷 Đã lưu ảnh báo cáo (thư mục Tải xuống / Download)', 3500);
    } catch (e) {
      if (e && e.name === 'AbortError') return; // bố mẹ bấm hủy
      App.UI.toast('⚠️ Chưa gửi được. Bố mẹ thử “Chép nội dung” nhé', 3500);
    }
  }

  // ================= ⚙️ Cài đặt =================
  function viewSettings() {
    const st = App.Store.state;
    const cards = [levelCard(), goalCard(), schoolWeekCard(), limitCard()];
    const all = st.mistakes.slice(0, 6);
    cards.push(card(`📝 Câu sai đang chờ ôn${st.mistakes.length ? ` (${R.mistakeCount()} câu)` : ''}`,
      all.length ? all.map((m) => { const row = mistakeRow(m); row.firstChild.prepend(P().icon(m.sid) + ' '); return row; }) : empty('Chưa có câu sai nào. Giỏi quá! 🎉'),
      all.length ? h('p.muted', { style: { marginTop: '.6rem' } }, 'Ở trang chủ có nút “🔁 Ôn lại câu sai”: bé làm lại các câu này, làm đúng thì câu đó được xóa khỏi danh sách.') : null));
    cards.push(card('💾 Sao lưu dữ liệu',
      h('p.muted', 'Lưu tiến độ, sao, xu, thú cưng, sticker và số liệu đánh giá của bé ra một tệp. Dùng khi đổi máy, cài lại app, hoặc để phòng lỡ tay xóa.'),
      h('div.p-actions',
        h('button.btn.small.green', { onclick: backup }, '⬇️ Tạo tệp sao lưu'),
        h('button.btn.small.white', { onclick: restore }, '⬆️ Khôi phục từ tệp'))));
    const toggle = (key, label, note) => {
      const sw = h('button.switch', { class: st.settings[key] ? 'on' : '', 'aria-label': label });
      sw.addEventListener('click', () => {
        st.settings[key] = !st.settings[key];
        sw.classList.toggle('on', st.settings[key]);
        App.Store.save();
        App.Sound.play('tap');
      });
      return h('div.p-row', h('div.lbl', label, note && h('small', note)), sw);
    };
    const viVoice = App.Speech.has('vi'), enVoice = App.Speech.has('en');
    cards.push(card('⚙️ Cài đặt khác',
      toggle('sound', 'Âm thanh hiệu ứng'),
      toggle('voice', 'Giọng đọc', `Giọng Việt: ${viVoice ? 'có ✅' : 'chưa có ⚠️'} · Giọng Anh: ${enVoice ? 'có ✅' : 'chưa có ⚠️'}`),
      toggle('autoRead', 'Tự đọc đề bài', 'Máy tự đọc mỗi câu hỏi (hợp với bé đọc còn chậm)'),
      toggle('unlockAll', 'Mở khóa tất cả các chặng', 'Cho bé chọn bài bất kỳ (ví dụ bài đang học trên lớp)'),
      installRow(),
      h('div.p-row', h('div.lbl', 'Tên của bé', h('small', st.profile.name)), h('button.btn.small.white', { onclick: rename }, 'Đổi tên')),
      h('div.p-row', h('div.lbl', 'Xóa toàn bộ dữ liệu', h('small', 'Sao, xu, thú cưng, sticker sẽ mất hết')), h('button.btn.small.red', { onclick: resetAll }, 'Xóa'))));
    return cards;
  }

  const VIEWS = { tongquan: viewOverview, theomon: viewSubject, tienbo: viewProgress, baocao: viewReport, caidat: viewSettings };

  // Thẻ có thể tự vẽ lại (bấm chip chọn)
  function liveCard(drawFn) {
    const c = h('div.p-card');
    const draw = () => { c.innerHTML = ''; App.U.add(c, drawFn(draw)); };
    draw();
    return c;
  }
  const chips = (items, current, onPick) => h('div.chips', items.map(([id, label]) => h('button.chip', {
    class: id === current ? 'on' : '', onclick: () => { App.Sound.play('tap'); onPick(id); },
  }, label)));

  // ---- Mục tiêu tuần ----
  function goalCard() {
    const st = App.Store.state;
    return liveCard((draw) => [
      h('h3', '🎯 Mục tiêu mỗi tuần'),
      h('p.muted', 'Số ngày học trong tuần:'),
      chips([3, 4, 5, 6, 7].map((n) => [n, `${n} ngày`]), st.settings.goalDays, (n) => { st.settings.goalDays = n; App.Store.save(); draw(); }),
      h('p.muted', { style: { marginTop: '.6rem' } }, 'Mỗi ngày học ít nhất:'),
      chips([10, 15, 20, 30, 45].map((n) => [n, `${n} phút`]), st.settings.goalMin, (n) => { st.settings.goalMin = n; App.Store.save(); draw(); }),
      h('p.muted', { style: { marginTop: '.6rem' } }, 'Thẻ Tổng quan và Báo cáo tuần sẽ cho biết bé đạt mục tiêu được mấy ngày.'),
    ]);
  }

  // ---- Tuần học hiện tại ở lớp ----
  function schoolWeekCard() {
    const st = App.Store.state;
    return liveCard((draw) => {
      const w = P().schoolWeek();
      const shift = (d) => { st.settings.weekShift = (st.settings.weekShift || 0) + d; App.Store.save(); draw(); };
      return [
        h('h3', '🏫 Tuần học hiện tại ở lớp'),
        h('p', h('b', `Tuần ${w}`), st.settings.weekShift ? ` (đã chỉnh ${st.settings.weekShift > 0 ? '+' : ''}${st.settings.weekShift} tuần so với lịch)` : ' (ước tính theo lịch năm học 2026–2027)'),
        h('div.p-actions',
          h('button.btn.small.white', { onclick: () => shift(-1) }, '− 1 tuần'),
          h('button.btn.small.white', { onclick: () => shift(1) }, '+ 1 tuần'),
          st.settings.weekShift ? h('button.btn.small.white', { onclick: () => { st.settings.weekShift = 0; App.Store.save(); draw(); } }, 'Về ước tính') : null),
        h('p.muted', { style: { marginTop: '.6rem' } }, 'Dùng để so tiến độ của bé với lớp. Nếu lớp của bé học nhanh hoặc chậm hơn (hoặc nghỉ lễ, nghỉ Tết khác lịch), bố mẹ chỉnh lại ở đây.'),
      ];
    });
  }

  // ---- Cài app lên màn hình chính (PWA) ----
  function installRow() {
    const installed = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if (installed) return h('div.p-row', h('div.lbl', '📲 Cài như app', h('small', 'Đã cài trên máy này ✅ – chơi được cả khi không có mạng.')));
    if (App.installPrompt) {
      return h('div.p-row',
        h('div.lbl', '📲 Cài như app', h('small', 'Thêm biểu tượng Bé Vui Học ra màn hình chính, chơi được khi không có mạng.')),
        h('button.btn.small.green', { onclick: async (e) => {
          const p = App.installPrompt;
          if (!p) return;
          p.prompt();
          const r = await p.userChoice.catch(() => null);
          App.installPrompt = null;
          if (r && r.outcome === 'accepted') e.target.closest('.p-row').querySelector('small').textContent = 'Đang cài… xem biểu tượng ở màn hình chính nhé!';
        } }, 'Cài đặt'));
    }
    const online = location.protocol === 'https:';
    return h('div.p-row', h('div.lbl', '📲 Cài như app', h('small', online
      ? 'Trong Chrome: bấm ⋮ (góc trên bên phải) → “Thêm vào màn hình chính” hoặc “Cài đặt ứng dụng”.'
      : 'Cần mở app từ địa chỉ https trên mạng (xem hướng dẫn trong README) thì mới cài được.')));
  }

  // ---- Mức độ câu hỏi ----
  function levelCard() {
    const st = App.Store.state;
    const NOTE = {
      'co-ban': 'Chỉ cơ bản: câu hỏi đúng mức sách giáo khoa, không xen câu nâng cao.',
      tron: 'Trộn vừa (nên dùng): mỗi chặng xen khoảng 3/10 câu nâng cao vào giữa các câu cơ bản, có nhãn 🔥.',
      'nang-cao': 'Trộn nhiều: mỗi chặng xen khoảng 5/10 câu nâng cao. Hợp khi bé đã làm tốt cả câu cơ bản lẫn câu nâng cao.',
    };
    return liveCard((draw) => {
      const lv = st.settings.level || 'tron';
      const ch = R.challengeSummary();
      return [
        h('h3', '🎚️ Mức độ câu hỏi'),
        chips([['co-ban', '📗 Chỉ cơ bản'], ['tron', '🔀 Trộn vừa'], ['nang-cao', '🔥 Trộn nhiều']], lv, (id) => { st.settings.level = id; App.Store.save(); draw(); }),
        h('p.muted', { style: { marginTop: '.6rem' } }, NOTE[lv] || NOTE.tron),
        h('p.muted', { style: { marginTop: '.4rem' } }, 'Câu nâng cao: Toán có tìm số chưa biết, bài toán hai bước, điền dấu, đếm hình…; Tiếng Việt có từ trái nghĩa, tục ngữ, tìm từ viết sai…; Tiếng Anh có chính tả, ngữ pháp, nghe câu không có hình. Số sao chỉ tính theo câu cơ bản; câu nâng cao làm đúng được thêm xu.'),
        h('p.muted', { style: { marginTop: '.4rem' } }, `🧠 Cuối mỗi chủ đề có chặng “Thử thách tư duy” (không bắt buộc, xu thưởng gấp đôi). Bé đã vượt ${ch.done}/${ch.total} chặng thử thách.`),
      ];
    });
  }

  // ---- Giới hạn thời gian học mỗi ngày ----
  function limitCard() {
    const st = App.Store.state;
    return liveCard((draw) => {
      const lim = st.settings.dailyLimit || 0;
      const used = Math.round(R.today().sec / 60);
      const extra = R.today().extra || 0;
      return [
        h('h3', '⏰ Giới hạn thời gian mỗi ngày'),
        chips([0, 15, 20, 30, 45, 60].map((m) => [m, m ? `${m} phút` : 'Không giới hạn']), lim, (m) => { st.settings.dailyLimit = m; App.Store.save(); draw(); }),
        h('p.muted', { style: { marginTop: '.6rem' } }, lim
          ? `Hôm nay bé đã học ${used} / ${lim + extra} phút${extra ? ` (đã cho thêm ${extra} phút)` : ''}. Hết giờ, app hiện màn hình nghỉ ngơi; chặng đang chơi dở vẫn được làm nốt.`
          : 'App không giới hạn thời gian. Chọn số phút để bé không ngồi quá lâu.'),
        lim ? h('div.p-actions', h('button.btn.small.orange', {
          onclick: () => { R.addExtraTime(15); App.Sound.play('coin'); App.UI.toast('✅ Đã cho bé thêm 15 phút hôm nay'); draw(); },
        }, '➕ Cho thêm 15 phút hôm nay')) : null,
      ];
    });
  }

  // ---- Sao lưu: tạo tệp .json (tải về máy hoặc gửi qua Zalo, Google Drive…) ----
  async function backup() {
    const st = App.Store.state;
    const name = `be-vui-hoc_${App.U.slug(st.profile.name)}_${App.U.dayKey()}.json`;
    const text = App.Store.exportText();
    const file = new File([text], name, { type: 'application/json' });
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
    const how = canShare ? await App.UI.modal({
      icon: '💾', title: 'Tạo tệp sao lưu',
      body: `Tệp “${name}”.\nBố mẹ có thể tải về máy, hoặc gửi vào Zalo / Google Drive để cất giữ.`,
      buttons: [{ label: 'Gửi đi…', value: 'share', cls: 'white' }, { label: 'Tải về máy', value: 'save', cls: 'green' }],
    }) : 'save';
    if (how === 'share') {
      try { await navigator.share({ files: [file], title: 'Sao lưu Bé Vui Học' }); } catch (e) { /* bố mẹ bấm hủy */ }
    } else if (how === 'save') {
      const url = URL.createObjectURL(file);
      const a = h('a', { href: url, download: name });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      App.UI.toast('💾 Đã tạo tệp sao lưu (xem trong thư mục Tải xuống / Download)', 3500);
    }
  }

  // ---- Khôi phục từ tệp sao lưu ----
  function restore() {
    const input = h('input', { type: 'file', accept: '.json,application/json' });
    input.addEventListener('change', async () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const data = App.Store.parseBackup(await f.text());
      if (!data) { App.Sound.play('wrong'); App.UI.toast('⚠️ Tệp này không phải tệp sao lưu của Bé Vui Học', 3500); return; }
      const s = data.state;
      const stars = Object.values(s.progress).reduce((t, x) => t + ((x && x.stars) || 0), 0);
      const when = data.exportedAt ? new Date(data.exportedAt).toLocaleDateString('vi-VN') : 'không rõ ngày';
      const ok = await App.UI.confirm('Khôi phục dữ liệu?',
        `Tệp của bé ${s.profile.name} (lưu ngày ${when}): ${Object.keys(s.progress).length} chặng đã qua, ⭐ ${stars}, 🪙 ${s.coins || 0} xu.\n` +
        'Dữ liệu hiện có trên máy này sẽ được thay bằng dữ liệu trong tệp.', 'Khôi phục', 'Hủy');
      if (!ok) return;
      App.Store.replace(s);
      location.reload();
    });
    input.click();
  }

  function answerOf(q) {
    if (q.answerLabel) return q.answerLabel;
    if (q.type === 'order' && q.tileClass === 'letter') return q.answer.join('');
    if (Array.isArray(q.answer)) return q.answer.join(', ');
    return q.answer != null ? String(q.answer) + (q.unit ? ' ' + q.unit : '') : '(nối cặp)';
  }

  async function rename() {
    const st = App.Store.state;
    const input = h('input.text-input', { value: st.profile.name, maxlength: 20 });
    const ok = await App.UI.modal({
      title: 'Đổi tên của bé', body: input,
      buttons: [{ label: 'Hủy', value: false, cls: 'white' }, { label: 'Lưu', value: true, cls: 'green' }],
    });
    if (ok && input.value.trim()) {
      st.profile.name = input.value.trim();
      App.Store.save();
      App.Router.render();
    }
  }

  async function resetAll() {
    const ok = await App.UI.confirm('Xóa toàn bộ dữ liệu?', 'Mọi tiến độ, sao, xu, thú cưng và sticker của bé sẽ bị xóa và không lấy lại được.', 'Xóa hết', 'Không xóa');
    if (!ok) return;
    App.Store.reset();
    passedAt = 0;
    tab = 'tongquan';
    App.Router.stack = [{ name: 'setup', params: {} }];
    history.replaceState({ i: 0 }, '');
    App.Router.render();
  }
})(window.App);
