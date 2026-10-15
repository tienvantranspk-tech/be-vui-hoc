/* Tính toán cho Bảng đánh giá của phụ huynh (không vẽ giao diện):
   tuần này – tuần trước, xếp loại môn học, năng lực – phẩm chất, điểm mạnh – cần luyện,
   so với tiến độ ở lớp, gợi ý tuần này, mục tiêu tuần, xu hướng nhiều tuần, báo cáo tuần. */
(function (App) {
  'use strict';
  const U = App.U;
  const R = App.Rewards;
  const S = () => App.Store.state;
  const SUBJ = ['toan', 'tv', 'ta'];
  const P = {};
  P.SUBJ = SUBJ;
  P.name = (sid) => (App.Curriculum[sid] ? App.Curriculum[sid].name : sid);
  P.icon = (sid) => (App.Curriculum[sid] ? App.Curriculum[sid].icon : '');
  P.pct = (ok, n) => (n ? Math.round((ok / n) * 100) : null);
  const EMPTY_WEEK = () => ({ sec: 0, q: 0, ok: 0, stages: 0, dset: {}, sub: {}, lv: {} });

  // ================= Tuần =================
  P.weekKey = (d) => U.weekKey(d);
  P.shiftWeek = (wk, n) => U.addDays(wk, 7 * n);
  P.weekDays = (wk) => U.range(0, 6).map((i) => U.addDays(wk, i));
  const dm = (k) => { const [, m, d] = k.split('-').map(Number); return `${d}/${m}`; };
  P.weekLabel = (wk) => `${dm(wk)} – ${dm(U.addDays(wk, 6))}`;
  P.dayLabel = dm;
  // Số liệu một tuần + số ngày có học
  P.week = (wk) => {
    const w = S().weeks[wk] || EMPTY_WEEK();
    return { ...EMPTY_WEEK(), ...w, days: Object.keys(w.dset || {}).length };
  };
  // [số câu, đúng ngay, ms, đoán nhanh] của một môn ở một mức ('cb' | 'nc') trong bảng lv
  P.lvStat = (lv, sid, l) => {
    const a = (lv || {})[`${sid}.${l}`] || [];
    return { n: a[0] || 0, ok: a[1] || 0, ms: a[2] || 0, fast: a[3] || 0 };
  };
  P.sumStat = (list) => list.reduce((s, x) => ({ n: s.n + x.n, ok: s.ok + x.ok, ms: s.ms + x.ms, fast: s.fast + x.fast }), { n: 0, ok: 0, ms: 0, fast: 0 });
  // Gộp nhiều tuần
  P.weeksStat = (wks, sid, l) => P.sumStat(wks.map((wk) => P.lvStat(P.week(wk).lv, sid, l)));
  P.lastWeeks = (n, from = P.weekKey()) => U.range(0, n - 1).map((i) => P.shiftWeek(from, -i)).reverse();

  // ================= Xếp loại =================
  // Câu cơ bản: Hoàn thành tốt / Hoàn thành / Cần cố gắng · Câu nâng cao: Xuất sắc / Khá / Đang làm quen
  P.RATE = {
    cb: { min: 10, cuts: [[85, 'Hoàn thành tốt', 'good', '🌟'], [65, 'Hoàn thành', 'ok', '✅'], [0, 'Cần cố gắng', 'low', '💪']] },
    nc: { min: 6, cuts: [[70, 'Xuất sắc', 'good', '🏆'], [45, 'Khá', 'ok', '👍'], [0, 'Đang làm quen', 'low', '🌱']] },
  };
  P.rate = (o, l) => {
    if (!o || o.n < P.RATE[l].min) return null;
    const p = P.pct(o.ok, o.n);
    const [, label, cls, icon] = P.RATE[l].cuts.find(([c]) => p >= c);
    return { label, cls, icon, p };
  };
  P.color = (p, l) => (p == null ? 'var(--line)' : p >= P.RATE[l].cuts[0][0] ? 'var(--good)' : p >= P.RATE[l].cuts[1][0] ? 'var(--gold)' : 'var(--bad)');
  P.shortSkill = (id) => ((App.SkillNames && App.SkillNames[id]) || id).replace(/^(Toán nâng cao|Tiếng Việt nâng cao|Tiếng Anh nâng cao|Tiếng Anh): /, '');
  const weakest = (o, k = 2) => o.skills.filter((s) => App.SkillNames && App.SkillNames[s.id] && s.n >= 3 && s.ok / s.n < 0.8).sort((a, b) => a.ok / a.n - b.ok / b.n).slice(0, k)
    .map((s) => P.shortSkill(s.id).toLowerCase());
  // Nhận xét một môn (từ số liệu cộng dồn)
  P.comment = (cb, nc) => {
    if (cb.n < P.RATE.cb.min) return 'Chưa đủ dữ liệu để nhận xét. Cho bé làm thêm vài chặng nhé.';
    const parts = [], pc = P.pct(cb.ok, cb.n), pn = P.pct(nc.ok, nc.n), wc = weakest(cb), wn = weakest(nc);
    if (pc >= 85) parts.push('Bé nắm chắc kiến thức cơ bản.');
    else if (pc >= 65) parts.push('Bé nắm được kiến thức cơ bản, đôi chỗ còn nhầm.' + (wc.length ? ` Nên luyện thêm: ${wc.join(', ')}.` : ''));
    else parts.push('Bé cần ôn lại kiến thức cơ bản.' + (wc.length ? ` Yếu nhất: ${wc.join(', ')}.` : '') + ' Có thể tạm chọn “Chỉ cơ bản” và dùng nút 🔁 Ôn lại câu sai.');
    if (nc.n < P.RATE.nc.min) parts.push('Chưa đủ câu nâng cao để nhận xét.');
    else if (pn >= 70) parts.push('Câu nâng cao bé làm rất tốt – có thể chọn “Trộn nhiều” và cho bé làm chặng 🧠 Thử thách.');
    else if (pn >= 45) parts.push('Câu nâng cao bé làm khá.' + (wn.length ? ` Dạng còn khó: ${wn.join(', ')}.` : ''));
    else parts.push('Câu nâng cao còn mới với bé' + (wn.length ? ` (khó nhất: ${wn.join(', ')})` : '') + '. Bố mẹ cùng bé đọc lời giải sau mỗi câu sai nhé.');
    return parts.join(' ');
  };

  // ================= Năng lực, phẩm chất (Tốt / Đạt / Cần cố gắng) =================
  const Q3 = { tot: ['Tốt', 'good'], dat: ['Đạt', 'ok'], ccg: ['Cần cố gắng', 'low'] };
  P.studyDays = (n) => {
    const st = S();
    let c = 0;
    for (let i = 0; i < n; i++) {
      const d = st.days[U.addDays(U.dayKey(), -i)];
      if (d && ((d.sec || 0) >= 60 || (d.q || 0) > 0)) c++;
    }
    return c;
  };
  P.qualities = () => {
    const A = R.ability();
    const tot = (l, sids = SUBJ) => P.sumStat(sids.map((sid) => ({ n: A[sid][l].n, ok: A[sid][l].ok, ms: 0, fast: 0 })));
    const byPct = (o, min, good, ok) => (o.n < min ? null : P.pct(o.ok, o.n) >= good ? 'tot' : P.pct(o.ok, o.n) >= ok ? 'dat' : 'ccg');
    const d14 = P.studyDays(14);
    const fixed = S().counters.fixed || 0, pending = R.mistakeCount(), ch = R.challengeSummary().done;
    const answered = tot('cb').n + tot('nc').n;
    const selfScore = (fixed + pending >= 3 && fixed / (fixed + pending) >= 0.5 ? 1 : 0) + (ch >= 1 ? 1 : 0) + (d14 >= 6 ? 1 : 0);
    const math = tot('cb', ['toan']), lang = tot('cb', ['tv', 'ta']), adv = tot('nc');
    const list = [
      { id: 'chamchi', name: 'Chăm chỉ', note: `${d14}/14 ngày gần đây có học`, r: answered ? (d14 >= 8 ? 'tot' : d14 >= 4 ? 'dat' : 'ccg') : null },
      { id: 'tuhoc', name: 'Tự học', note: `tự sửa ${fixed} câu sai, vượt ${ch} chặng thử thách`, r: answered ? (selfScore >= 2 ? 'tot' : selfScore === 1 ? 'dat' : 'ccg') : null },
      { id: 'tuduy', name: 'Tư duy, giải quyết vấn đề', note: adv.n ? `câu nâng cao đúng ${P.pct(adv.ok, adv.n)}%` : 'chưa có câu nâng cao', r: byPct(adv, 10, 70, 45) },
      { id: 'tinhtoan', name: 'Tính toán', note: math.n ? `Toán cơ bản đúng ${P.pct(math.ok, math.n)}%` : 'chưa có câu Toán', r: byPct(math, 10, 85, 65) },
      { id: 'ngonngu', name: 'Ngôn ngữ', note: lang.n ? `Tiếng Việt, Tiếng Anh cơ bản đúng ${P.pct(lang.ok, lang.n)}%` : 'chưa có câu Tiếng Việt, Tiếng Anh', r: byPct(lang, 10, 85, 65) },
    ];
    return list.map((x) => ({ ...x, label: x.r ? Q3[x.r][0] : 'Chưa đủ dữ liệu', cls: x.r ? Q3[x.r][1] : 'none' }));
  };

  // ================= Điểm mạnh – cần luyện =================
  // Chỉ lấy kỹ năng có tên (bỏ mã cũ không còn dùng, để báo cáo không hiện mã khó hiểu)
  const skillList = () => Object.entries(S().skills).filter(([id]) => App.SkillNames && App.SkillNames[id] && R.skillLevel(id))
    .map(([id, v]) => ({ id, n: v.n, ok: v.ok, p: P.pct(v.ok, v.n), sid: R.skillLevel(id)[0], lv: R.skillLevel(id)[1], name: P.shortSkill(id) }));
  P.skills = (sid, lv) => skillList().filter((s) => (!sid || s.sid === sid) && (!lv || s.lv === lv));
  P.strengths = (k = 3) => skillList().filter((s) => s.n >= 5 && s.p >= 85).sort((a, b) => b.p - a.p || b.n - a.n).slice(0, k);
  P.weaknesses = (k = 3) => skillList().filter((s) => s.n >= 3 && s.p < 75).sort((a, b) => a.p - b.p || b.n - a.n).slice(0, k);

  // ================= Tiến độ từng chủ đề =================
  P.topics = (sid) => App.Curriculum[sid].topics.map((t) => {
    const main = t.stages.filter((s) => R.playable(s) && !s.bonus);
    const done = main.filter((s) => R.done(R.key(sid, t.id, s.id)));
    const stars = done.reduce((s, x) => s + R.starsOf(R.key(sid, t.id, x.id)), 0);
    const avg = done.length ? stars / done.length : 0;
    const bonus = t.stages.find((s) => s.bonus);
    const level = !done.length ? 'chua' : done.length === main.length && avg >= 2.5 ? 'chac' : 'dang';
    return { topic: t, total: main.length, done: done.length, avg, level, bonus, challengeDone: bonus ? R.done(R.key(sid, t.id, bonus.id)) : false };
  });
  // Các chặng đã chơi nhưng ít sao (nên chơi lại), ít sao nhất trước
  P.replayList = (sid, k = 5) => {
    const out = [];
    for (const x of R.stages(App.Curriculum[sid])) {
      const p = S().progress[x.key];
      if (p && p.stars <= 2) out.push({ sid, topic: x.topic, stage: x.stage, stars: p.stars, last: p.last || 0 });
    }
    return out.sort((a, b) => a.stars - b.stars || a.last - b.last).slice(0, k);
  };

  // ================= So với tiến độ ở lớp =================
  // Tuần học hiện tại (1–35), ước tính theo lịch năm học và chỉnh thêm theo bố mẹ (weekShift)
  P.schoolWeek = (date = new Date()) => {
    const sc = App.Data.schedule;
    const days = U.daysBetween(sc.start, U.dayKey(date));
    let w = Math.floor(days / 7) + 1;
    if (U.dayKey(date) >= sc.tetAfter) w -= 1;
    w += S().settings.weekShift || 0;
    return U.clamp(w, 1, sc.weeks);
  };
  P.school = (sid, week = P.schoolWeek()) => {
    const list = R.stages(App.Curriculum[sid]);
    const sched = App.Data.schedule[sid];
    const idxOf = (id) => list.findIndex((x) => x.stage.id === id);
    const doneTo = week >= 2 ? idxOf(sched[week - 2]) : -1; // tuần trước đã học xong đến đây
    const now = list[idxOf(sched[week - 1])] || null;        // tuần này lớp học tới đây
    const missing = list.filter((x, i) => i <= doneTo && !R.done(x.key) && !x.stage.extra); // chặng Luyện tập thêm không tính là chậm
    const ahead = list.filter((x, i) => i > idxOf(sched[week - 1]) && R.done(x.key)).length;
    return { week, now, missing, ahead, status: missing.length ? 'cham' : ahead ? 'truoc' : 'dung' };
  };

  // ================= Mục tiêu tuần =================
  P.goal = (wk = P.weekKey()) => {
    const st = S();
    const gd = st.settings.goalDays || 5, gm = st.settings.goalMin || 20;
    const days = P.weekDays(wk).map((k) => ({ k, min: Math.round(((st.days[k] || {}).sec || 0) / 60) }));
    const met = days.filter((d) => d.min >= gm).length;
    return { targetDays: gd, targetMin: gm, days, met, left: Math.max(0, gd - met) };
  };

  // ================= Gợi ý tuần này (tối đa 3 việc) =================
  P.suggestions = () => {
    const out = [];
    const behind = SUBJ.map((sid) => ({ sid, sc: P.school(sid) })).filter((x) => x.sc.missing.length).sort((a, b) => b.sc.missing.length - a.sc.missing.length)[0];
    if (behind) {
      const x = behind.sc.missing[0];
      out.push({ icon: '📚', text: `${P.name(behind.sid)}: làm ${x.stage.short} (${x.stage.name}) để theo kịp lớp – còn ${behind.sc.missing.length} chặng của các tuần trước.` });
    }
    const m = R.mistakeCount();
    if (m >= 3) out.push({ icon: '🔁', text: `Cùng bé ôn ${m} câu sai đang chờ (nút “Ôn lại câu sai” ở trang chủ).` });
    const rp = SUBJ.flatMap((sid) => P.replayList(sid, 2)).sort((a, b) => a.stars - b.stars)[0];
    if (rp) out.push({ icon: '⭐', text: `Chơi lại ${P.name(rp.sid)} – ${rp.stage.short} (mới được ${rp.stars} sao).` });
    const ch = SUBJ.flatMap((sid) => P.topics(sid).filter((t) => t.level === 'chac' && t.bonus && !t.challengeDone).map((t) => ({ sid, t })))[0];
    if (ch) out.push({ icon: '🧠', text: `Thử chặng Thử thách tư duy của ${P.name(ch.sid)} – ${ch.t.topic.short}: bé đã nắm chắc chủ đề này.` });
    const g = P.goal();
    const remain = g.days.filter((d) => d.k >= U.dayKey() && d.min < g.targetMin).length; // số ngày còn có thể học đủ trong tuần
    if (g.left > 0 && remain > 0) {
      out.push({ icon: '🎯', text: g.left <= remain
        ? `Còn ${g.left} ngày học nữa là đạt mục tiêu tuần (${g.targetDays} ngày, mỗi ngày ${g.targetMin} phút).`
        : `Tuần này còn ${remain} ngày – cho bé học đều mỗi ngày ${g.targetMin} phút để gần đạt mục tiêu ${g.targetDays} ngày/tuần nhé.` });
    }
    const A = R.ability();
    if (S().settings.level === 'co-ban' && SUBJ.every((sid) => { const r = P.rate(A[sid].cb, 'cb'); return r && r.cls === 'good'; })) {
      out.push({ icon: '🔥', text: 'Bé làm tốt câu cơ bản cả ba môn – có thể chọn “Trộn vừa” để thêm câu nâng cao.' });
    }
    if (!out.length) out.push({ icon: '🌟', text: 'Bé đang học rất đều. Bố mẹ tiếp tục khen ngợi và cho bé chơi chặng mới nhé!' });
    return out.slice(0, 3);
  };

  // ================= Báo cáo một tuần =================
  P.weekReport = (wk = P.weekKey()) => {
    const st = S(), w = P.week(wk), prev = P.week(P.shiftWeek(wk, -1));
    const inWeek = (t) => t && P.weekKey(new Date(t)) === wk;
    const plays = st.history.filter((x) => inWeek(x.t));
    const stagePlays = plays.filter((x) => x.sid !== 'review');
    const subjects = SUBJ.map((sid) => {
      const cb = P.lvStat(w.lv, sid, 'cb'), nc = P.lvStat(w.lv, sid, 'nc');
      return { sid, min: Math.round((w.sub[sid] || 0) / 60), cb, nc, stages: stagePlays.filter((x) => x.sid === sid).length,
        newStages: stagePlays.filter((x) => x.sid === sid && x.nw).length };
    });
    // Số câu, đúng ngay của cả tuần. Tuần trước khi cập nhật app chưa chia cơ bản/nâng cao → dùng số tổng đã lưu
    const total = (x) => (Object.keys(x.lv || {}).length
      ? P.sumStat(SUBJ.flatMap((sid) => [P.lvStat(x.lv, sid, 'cb'), P.lvStat(x.lv, sid, 'nc')]))
      : { n: x.q || 0, ok: x.ok || 0 });
    const all = total(w), allPrev = total(prev);
    const legacy = !plays.length && w.stages > 0; // tuần cũ chưa có lịch sử từng lượt chơi
    return {
      wk, label: P.weekLabel(wk), isCurrent: wk === P.weekKey(), name: st.profile ? st.profile.name : '',
      min: Math.round(w.sec / 60), minPrev: Math.round(prev.sec / 60), days: w.days, daysPrev: prev.days,
      q: all.n, qPrev: allPrev.n, p: P.pct(all.ok, all.n), pPrev: P.pct(allPrev.ok, allPrev.n),
      stages: legacy ? w.stages : stagePlays.length, newStages: legacy ? null : stagePlays.filter((x) => x.nw).length,
      reviews: plays.filter((x) => x.sid === 'review').length,
      subjects, goal: P.goal(wk),
      stickers: Object.values(st.stickers).filter(inWeek).length,
      badges: Object.entries(st.badges).filter(([, t]) => inWeek(t)).map(([id]) => R.badgeInfo(id)),
      reviewMin: Math.round((w.sub.review || 0) / 60), petMin: Math.round((w.sub.pet || 0) / 60),
    };
  };
  // Báo cáo dạng chữ (để gửi qua Zalo, tin nhắn)
  P.reportText = (r) => {
    const lines = [`📒 Báo cáo học tập của ${r.name} – tuần ${r.label}`, ''];
    lines.push(`• Học ${r.days}/7 ngày, ${r.min} phút, ${r.q} câu${r.p != null ? `, đúng ngay ${r.p}%` : ''}.`);
    lines.push(`• Hoàn thành ${r.stages} chặng${r.newStages != null ? ` (${r.newStages} chặng mới)` : ''}${r.reviews ? `, ôn câu sai ${r.reviews} lần` : ''}.`);
    lines.push(`• Mục tiêu tuần: ${r.goal.met}/${r.goal.targetDays} ngày học đủ ${r.goal.targetMin} phút.`);
    for (const s of r.subjects) {
      if (!s.cb.n && !s.nc.n && !s.min) continue;
      const cb = s.cb.n ? `cơ bản ${P.pct(s.cb.ok, s.cb.n)}%` : '', nc = s.nc.n ? `nâng cao ${P.pct(s.nc.ok, s.nc.n)}%` : '';
      lines.push(`• ${P.name(s.sid)}: ${s.min} phút, ${s.stages} chặng${cb || nc ? ', đúng ngay ' + [cb, nc].filter(Boolean).join(', ') : ''}.`);
    }
    const st = P.strengths(2), wk = P.weaknesses(2);
    if (st.length) lines.push(`👍 Điểm mạnh: ${st.map((x) => x.name).join(', ')}.`);
    if (wk.length) lines.push(`🎯 Cần luyện: ${wk.map((x) => x.name).join(', ')}.`);
    if (r.isCurrent) P.suggestions().forEach((g) => lines.push(`${g.icon} ${g.text}`));
    lines.push('', '— Bé Vui Học · Lớp 2');
    return lines.join('\n');
  };

  // ================= Xu hướng nhiều tuần =================
  P.trend = (n = 8) => P.lastWeeks(n).map((wk) => {
    const w = P.week(wk);
    const cb = P.sumStat(SUBJ.map((sid) => P.lvStat(w.lv, sid, 'cb'))), nc = P.sumStat(SUBJ.map((sid) => P.lvStat(w.lv, sid, 'nc')));
    return { wk, label: P.dayLabel(wk), w, cb, nc };
  });
  // Lịch học: các tuần × 7 ngày, số phút mỗi ngày
  P.heat = (n = 12) => P.lastWeeks(n).map((wk) => P.weekDays(wk).map((k) => {
    const d = S().days[k];
    const studied = d ? Math.round((d.sec || 0) / 60) : (P.week(wk).dset[k] ? 1 : 0);
    return { k, min: studied, future: k > U.dayKey() };
  }));
  // Tốc độ làm bài 4 tuần gần nhất: giây trung bình mỗi câu, tỉ lệ câu sai trả lời quá nhanh
  P.speed = (sid) => {
    const wks = P.lastWeeks(4);
    const s = P.sumStat(['cb', 'nc'].map((l) => P.weeksStat(wks, sid, l)));
    const wrong = s.n - s.ok;
    return { n: s.n, avgSec: s.n ? Math.round(s.ms / s.n / 100) / 10 : null, guess: wrong ? Math.round((s.fast / wrong) * 100) : null };
  };

  App.Report = P;
})(window.App);
