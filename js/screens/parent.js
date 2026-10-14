/* Góc phụ huynh: câu hỏi khóa → thống kê học tập & cài đặt */
(function (App) {
  'use strict';
  const { h, rand } = App.U;
  const R = App.Rewards;
  let passedAt = 0; // đã mở khóa trong 10 phút gần đây thì không hỏi lại

  App.Screens.parent = {
    render() {
      const el = h('div.screen.parent');
      el.appendChild(h('div.topbar',
        h('button.icon-btn', { 'aria-label': 'Về trang chủ', onclick: () => App.Router.home() }, '🏠'),
        h('div.title', '👨‍👩‍👧 Góc phụ huynh')));
      const body = h('div.scroll');
      el.appendChild(body);
      el.appendChild(App.UI.bottomNav('parent'));
      if (Date.now() - passedAt < 10 * 60 * 1000) body.appendChild(dashboard());
      else body.appendChild(gate(() => { passedAt = Date.now(); body.innerHTML = ''; body.appendChild(dashboard()); }));
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

  // ---- Bảng theo dõi ----
  function dashboard() {
    const st = App.Store.state;
    const today = R.today();
    const pct = (ok, n) => (n ? Math.round((ok / n) * 100) : 0);
    const wrap = h('div.parent-body');

    // Hôm nay
    wrap.appendChild(h('div.p-card',
      h('h3', '📅 Hôm nay'),
      h('div.p-stats',
        h('div.p-stat', h('b', Math.round(today.sec / 60)), h('span', 'phút học')),
        h('div.p-stat', h('b', today.q), h('span', 'câu đã làm')),
        h('div.p-stat', h('b', today.q ? pct(today.ok, today.q) + '%' : '–'), h('span', 'đúng ngay lần đầu'))),
      h('p.muted', { style: { marginTop: '.7rem' } }, `🔥 Chuỗi ngày học: ${R.streakNow()} ngày (dài nhất: ${st.streak.best} ngày)`)));

    // Đánh giá năng lực: câu cơ bản và câu nâng cao tách riêng
    wrap.appendChild(abilityCard());

    // 7 ngày qua
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = App.U.dayKey(d);
      days.push({ k, label: i === 0 ? 'Nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()], min: Math.round(((st.days[k] || {}).sec || 0) / 60) });
    }
    const maxMin = Math.max(10, ...days.map((d) => d.min));
    wrap.appendChild(h('div.p-card',
      h('h3', '📈 Thời gian học 7 ngày qua (phút)'),
      h('div.week', days.map((d, i) => h('div.day', { class: i === 6 ? 'today' : '' },
        h('em', d.min || ''), h('i', { style: { height: (d.min / maxMin) * 100 + '%' } }), h('small', d.label))))));

    // Tiến độ từng môn
    wrap.appendChild(h('div.p-card',
      h('h3', '🗺️ Tiến độ các môn'),
      ['toan', 'tv', 'ta'].map((sid) => {
        const sub = App.Curriculum[sid];
        const s = R.summary(sub);
        return h('div.p-row',
          h('div.lbl', `${sub.icon} ${sub.name}`, h('small', s.total ? `${s.done}/${s.total} chặng · ⭐ ${s.stars}` : 'Đang xây dựng')),
          h('div.p-bar', h('i', { style: { width: (s.total ? (s.done / s.total) * 100 : 0) + '%', background: `var(--${sid})` } })));
      })));

    // Kỹ năng cần luyện thêm – tách kỹ năng cơ bản và kỹ năng nâng cao
    const skills = Object.entries(st.skills)
      .filter(([id, v]) => v.n >= 3 && R.skillLevel(id))
      .map(([id, v]) => ({ id, n: v.n, p: pct(v.ok, v.n), lv: R.skillLevel(id)[1] }))
      .sort((x, y) => x.p - y.p);
    const skillRows = (lv) => {
      const list = skills.filter((s) => s.lv === lv).slice(0, 5);
      return list.length ? list.map((s) => h('div.p-row',
        h('div.lbl', `${subjectIcon(R.skillLevel(s.id)[0])} ${shortSkill(s.id)}`, h('small', `${s.n} câu · đúng ngay ${s.p}%`)),
        h('div.p-bar', h('i', { style: { width: s.p + '%', background: barColor(s.p, lv) } }))))
        : h('p.muted', lv === 'cb' ? 'Chưa đủ dữ liệu. Bé làm thêm vài chặng nhé!' : 'Chưa có đủ câu nâng cao để đánh giá.');
    };
    wrap.appendChild(h('div.p-card',
      h('h3', '🎯 Kỹ năng cần luyện thêm'),
      h('h4', '📗 Cơ bản (theo sách giáo khoa)'), skillRows('cb'),
      h('h4', '🔥 Nâng cao'), skillRows('nc')));

    // Mức độ câu hỏi
    wrap.appendChild(levelCard());

    // Giới hạn thời gian mỗi ngày
    wrap.appendChild(limitCard());

    // Câu sai gần đây
    const recent = st.mistakes.slice(0, 6);
    const icon = (sid) => (sid && App.Curriculum[sid] ? App.Curriculum[sid].icon + ' ' : '');
    wrap.appendChild(h('div.p-card',
      h('h3', `📝 Câu bé làm sai gần đây${st.mistakes.length ? ` (${R.mistakeCount()} câu)` : ''}`),
      recent.length ? recent.map((m) => h('div.p-row',
        h('div.lbl', icon(m.sid) + (m.q.note || [m.q.prompt, m.q.big && App.U.plain(m.q.big)].filter(Boolean).join('  ')).replace(/\n/g, ' '),
          h('small', 'Đáp án: ' + answerOf(m.q)))))
        : h('p.muted', 'Chưa có câu sai nào. Giỏi quá! 🎉'),
      recent.length ? h('p.muted', { style: { marginTop: '.6rem' } }, 'Ở trang chủ có nút “🔁 Ôn lại câu sai”: bé làm lại các câu này, làm đúng thì câu đó được xóa khỏi danh sách.') : null));

    // Sao lưu & khôi phục
    wrap.appendChild(h('div.p-card',
      h('h3', '💾 Sao lưu dữ liệu'),
      h('p.muted', 'Lưu tiến độ, sao, xu, thú cưng và sticker của bé ra một tệp. Dùng khi đổi máy, cài lại app, hoặc để phòng lỡ tay xóa.'),
      h('div.p-actions',
        h('button.btn.small.green', { onclick: backup }, '⬇️ Tạo tệp sao lưu'),
        h('button.btn.small.white', { onclick: restore }, '⬆️ Khôi phục từ tệp'))));

    // Cài đặt
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
    wrap.appendChild(h('div.p-card',
      h('h3', '⚙️ Cài đặt'),
      toggle('sound', 'Âm thanh hiệu ứng'),
      toggle('voice', 'Giọng đọc', `Giọng Việt: ${viVoice ? 'có ✅' : 'chưa có ⚠️'} · Giọng Anh: ${enVoice ? 'có ✅' : 'chưa có ⚠️'}`),
      toggle('autoRead', 'Tự đọc đề bài', 'Máy tự đọc mỗi câu hỏi (hợp với bé đọc còn chậm)'),
      toggle('unlockAll', 'Mở khóa tất cả các chặng', 'Cho bé chọn bài bất kỳ (ví dụ bài đang học trên lớp)'),
      installRow(),
      h('div.p-row',
        h('div.lbl', 'Tên của bé', h('small', st.profile.name)),
        h('button.btn.small.white', { onclick: rename }, 'Đổi tên')),
      h('div.p-row',
        h('div.lbl', 'Xóa toàn bộ dữ liệu', h('small', 'Sao, xu, thú cưng, sticker sẽ mất hết')),
        h('button.btn.small.red', { onclick: resetAll }, 'Xóa'))));
    return wrap;
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

  // ---- Đánh giá năng lực ----
  const pctOf = (o, k = '') => (o['n' + k] ? Math.round((o['ok' + k] / o['n' + k]) * 100) : 0);
  const subjectIcon = (sid) => (App.Curriculum[sid] ? App.Curriculum[sid].icon : '');
  // Tên kỹ năng ngắn gọn (bỏ phần "Toán nâng cao: ", "Tiếng Anh: "…)
  const shortSkill = (id) => ((App.SkillNames && App.SkillNames[id]) || id).replace(/^(Toán nâng cao|Tiếng Việt nâng cao|Tiếng Anh nâng cao|Tiếng Anh): /, '');
  // Câu cơ bản: thang giống cách nhận xét ở trường (Hoàn thành tốt / Hoàn thành / Cần cố gắng).
  // Câu nâng cao khó hơn nên mốc thấp hơn.
  const RATE = {
    cb: { min: 10, cuts: [[85, 'Hoàn thành tốt', 'good', '🌟'], [65, 'Hoàn thành', 'ok', '✅'], [0, 'Cần cố gắng', 'low', '💪']] },
    nc: { min: 6, cuts: [[70, 'Xuất sắc', 'good', '🏆'], [45, 'Khá', 'ok', '👍'], [0, 'Đang làm quen', 'low', '🌱']] },
  };
  const rateOf = (o, lv) => (o.n < RATE[lv].min ? null : RATE[lv].cuts.find(([c]) => pctOf(o) >= c));
  const barColor = (p, lv) => (p >= RATE[lv].cuts[0][0] ? 'var(--good)' : p >= RATE[lv].cuts[1][0] ? 'var(--gold)' : 'var(--bad)');
  // Kỹ năng yếu nhất (ít nhất 3 câu, dưới 80% đúng)
  const weakest = (o, k = 2) => o.skills.filter((s) => s.n >= 3 && s.ok / s.n < 0.8).sort((a, b) => a.ok / a.n - b.ok / b.n).slice(0, k).map((s) => shortSkill(s.id).toLowerCase());

  function comment(cb, nc) {
    if (cb.n < RATE.cb.min) return 'Chưa đủ dữ liệu để nhận xét. Cho bé làm thêm vài chặng nhé.';
    const parts = [], pc = pctOf(cb), pn = pctOf(nc), wc = weakest(cb), wn = weakest(nc);
    if (pc >= 85) parts.push('Bé nắm chắc kiến thức cơ bản.');
    else if (pc >= 65) parts.push('Bé nắm được kiến thức cơ bản, đôi chỗ còn nhầm.' + (wc.length ? ` Nên luyện thêm: ${wc.join(', ')}.` : ''));
    else parts.push('Bé cần ôn lại kiến thức cơ bản.' + (wc.length ? ` Yếu nhất: ${wc.join(', ')}.` : '') + ' Có thể tạm chọn “Chỉ cơ bản” và dùng nút 🔁 Ôn lại câu sai.');
    if (nc.n < RATE.nc.min) parts.push('Chưa đủ câu nâng cao để nhận xét.');
    else if (pn >= 70) parts.push('Câu nâng cao bé làm rất tốt – có thể chọn “Trộn nhiều” và cho bé làm chặng 🧠 Thử thách.');
    else if (pn >= 45) parts.push('Câu nâng cao bé làm khá.' + (wn.length ? ` Dạng còn khó: ${wn.join(', ')}.` : ''));
    else parts.push('Câu nâng cao còn mới với bé' + (wn.length ? ` (khó nhất: ${wn.join(', ')})` : '') + '. Bố mẹ cùng bé đọc lời giải sau mỗi câu sai nhé.');
    return parts.join(' ');
  }

  function abilityCard() {
    const A = R.ability();
    const row = (label, o, lv) => {
      const r = rateOf(o, lv), p = pctOf(o);
      const sub = o.n ? `${p}% đúng ngay · ${o.n} câu` + (o.n7 ? ` · 7 ngày qua: ${pctOf(o, '7')}%` : '') : 'Chưa có câu nào';
      return h('div.ab-row',
        h('div.ab-lbl', label, h('small', sub)),
        h('div.p-bar', h('i', { style: { width: p + '%', background: barColor(p, lv) } })),
        r ? h('span.ab-rate', { class: r[2] }, `${r[3]} ${r[1]}`) : h('span.ab-rate.none', o.n ? `cần thêm ${RATE[lv].min - o.n} câu` : '—'));
    };
    return h('div.p-card.wide',
      h('h3', '📊 Đánh giá năng lực'),
      h('p.muted', 'Câu cơ bản (theo sách giáo khoa) và câu nâng cao được trộn lẫn khi bé chơi, nhưng được chấm riêng ở đây. Tính theo số câu làm đúng ngay lần đầu; không tính các câu ôn lại.'),
      ['toan', 'tv', 'ta'].map((sid) => {
        const sub = App.Curriculum[sid], a = A[sid];
        return h('div.ab-sub',
          h('div.ab-title', `${sub.icon} ${sub.name}`),
          row('📗 Cơ bản', a.cb, 'cb'),
          row('🔥 Nâng cao', a.nc, 'nc'),
          h('p.ab-note', comment(a.cb, a.nc)));
      }),
      h('p.muted.ab-legend', 'Cơ bản: từ 85% Hoàn thành tốt · 65–84% Hoàn thành · dưới 65% Cần cố gắng. Nâng cao: từ 70% Xuất sắc · 45–69% Khá · dưới 45% Đang làm quen.'));
  }

  // ---- Mức độ câu hỏi: Cơ bản (theo SGK) / Nâng cao ----
  function levelCard() {
    const st = App.Store.state;
    const card = h('div.p-card');
    const draw = () => {
      const lv = st.settings.level || 'tron';
      const ch = R.challengeSummary();
      const NOTE = {
        'co-ban': 'Chỉ cơ bản: câu hỏi đúng mức sách giáo khoa, không xen câu nâng cao.',
        tron: 'Trộn vừa (nên dùng): mỗi chặng xen khoảng 3/10 câu nâng cao vào giữa các câu cơ bản, có nhãn 🔥.',
        'nang-cao': 'Trộn nhiều: mỗi chặng xen khoảng 5/10 câu nâng cao. Hợp khi bé đã làm tốt cả câu cơ bản lẫn câu nâng cao.',
      };
      card.innerHTML = '';
      App.U.add(card, [
        h('h3', '🎚️ Mức độ câu hỏi'),
        h('div.chips', [['co-ban', '📗 Chỉ cơ bản'], ['tron', '🔀 Trộn vừa'], ['nang-cao', '🔥 Trộn nhiều']].map(([id, label]) => h('button.chip', {
          class: id === lv ? 'on' : '',
          onclick: () => { App.Sound.play('tap'); st.settings.level = id; App.Store.save(); draw(); },
        }, label))),
        h('p.muted', { style: { marginTop: '.6rem' } }, NOTE[lv] || NOTE.tron),
        h('p.muted', { style: { marginTop: '.4rem' } }, 'Câu nâng cao: Toán có tìm số chưa biết, bài toán hai bước, điền dấu, đếm hình…; Tiếng Việt có từ trái nghĩa, tục ngữ, tìm từ viết sai…; Tiếng Anh có chính tả, ngữ pháp, nghe câu không có hình. Số sao chỉ tính theo câu cơ bản; câu nâng cao làm đúng được thêm xu.'),
        h('p.muted', { style: { marginTop: '.4rem' } },
          `🧠 Cuối mỗi chủ đề có chặng “Thử thách tư duy” (không bắt buộc, xu thưởng gấp đôi). Bé đã vượt ${ch.done}/${ch.total} chặng thử thách.`)]);
    };
    draw();
    return card;
  }

  // ---- Giới hạn thời gian học mỗi ngày ----
  function limitCard() {
    const st = App.Store.state;
    const card = h('div.p-card');
    const draw = () => {
      const lim = st.settings.dailyLimit || 0;
      const used = Math.round(R.today().sec / 60);
      const extra = R.today().extra || 0;
      card.innerHTML = '';
      App.U.add(card, [
        h('h3', '⏰ Giới hạn thời gian mỗi ngày'),
        h('div.chips', [0, 15, 20, 30, 45, 60].map((m) => h('button.chip', {
          class: m === lim ? 'on' : '',
          onclick: () => { App.Sound.play('tap'); st.settings.dailyLimit = m; App.Store.save(); draw(); },
        }, m ? `${m} phút` : 'Không giới hạn'))),
        h('p.muted', { style: { marginTop: '.6rem' } }, lim
          ? `Hôm nay bé đã học ${used} / ${lim + extra} phút${extra ? ` (đã cho thêm ${extra} phút)` : ''}. Hết giờ, app hiện màn hình nghỉ ngơi; chặng đang chơi dở vẫn được làm nốt.`
          : 'App không giới hạn thời gian. Chọn số phút để bé không ngồi quá lâu.'),
        lim ? h('div.p-actions', h('button.btn.small.orange', {
          onclick: () => { R.addExtraTime(15); App.Sound.play('coin'); App.UI.toast('✅ Đã cho bé thêm 15 phút hôm nay'); draw(); },
        }, '➕ Cho thêm 15 phút hôm nay')) : null]); // App.U.add bỏ qua null
    };
    draw();
    return card;
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
    App.Router.stack = [{ name: 'setup', params: {} }];
    history.replaceState({ i: 0 }, '');
    App.Router.render();
  }
})(window.App);
