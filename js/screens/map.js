/* Bản đồ phiêu lưu của một môn: các chặng nối nhau theo đường đi zíc-zắc */
(function (App) {
  'use strict';
  const { h } = App.U;
  const R = App.Rewards;
  const GAP = 7.8;    // khoảng cách dọc giữa hai chặng (rem)
  const PAD = 3.4;    // khoảng trống phía trên chặng đầu (rem)
  const AMP = 26;     // độ lệch trái – phải (%)

  App.Screens.map = {
    render({ subject: sid }) {
      const sub = App.Curriculum[sid];
      const st = App.Store.state;
      const currentKey = R.currentKey(sub);
      const all = R.stages(sub);
      const petKey = currentKey || (all.length ? all[all.length - 1].key : null); // đã xong hết → đứng ở chặng cuối
      const el = h('div.screen.map', { class: 'theme-' + sid });

      el.appendChild(h('div.topbar',
        h('button.icon-btn', { 'aria-label': 'Quay lại', onclick: () => App.Router.back() }, '⬅️'),
        h('div.title', `${sub.icon} ${sub.world}`),
        h('span.pill', '⭐ ', h('b', R.totalStars(sid)))));

      const scroll = h('div.scroll.map-scroll');
      let g = 0; // chỉ số chặng trên toàn bản đồ (để đường đi uốn lượn liền mạch)

      sub.topics.forEach((topic) => {
        const playable = topic.stages.filter((s) => R.playable(s) && !s.bonus); // chặng thử thách không tính vào tiến độ
        const done = playable.filter((s) => R.done(R.key(sid, topic.id, s.id))).length;
        const tEl = h('section.topic');

        if (!playable.length) {
          // Chủ đề chưa làm: chỉ hiện biểu ngữ
          tEl.appendChild(h('div.topic-banner.soon',
            h('div.t-ico', topic.icon),
            h('div', h('div.t-small', topic.short), h('div.t-name', topic.name)),
            h('div.t-count', `🚧 ${topic.stages.length} bài`)));
          scroll.appendChild(tEl);
          return;
        }

        tEl.appendChild(h('div.topic-banner',
          h('div.t-ico', topic.icon),
          h('div', h('div.t-small', topic.short), h('div.t-name', topic.name)),
          h('div.t-count', `${done}/${playable.length} ✅`)));

        const n = topic.stages.length;
        const height = PAD + (n - 1) * GAP + 4.6;
        const path = h('div.path', { style: { height: height + 'rem' } });
        const pts = [];
        const rnd = App.U.seeded(sid.length * 100 + g + 7);

        topic.stages.forEach((stage, i) => {
          const x = 50 + AMP * Math.sin(g * 0.95 + 0.4);
          const y = PAD + i * GAP;
          pts.push([x, y]);
          g++;

          const key = R.key(sid, topic.id, stage.id);
          const canPlay = R.playable(stage);
          const unlocked = canPlay && R.isUnlocked(sub, key);
          const stars = R.starsOf(key);
          const isCurrent = key === currentKey;

          let cls = '';
          let face = stage.icon;
          if (!canPlay) { cls = 'soon'; face = '🚧'; }
          else if (!unlocked) { cls = 'locked'; face = '🔒'; }
          else if (R.done(key)) cls = 'done';
          if (isCurrent && unlocked) cls += ' current';
          if (stage.review) cls += ' review';
          if (stage.bonus) cls += ' bonus';

          const node = h('button.node', { class: cls, 'aria-label': `${stage.short}: ${stage.name}` }, face);
          node.addEventListener('click', () => openStage(sub, topic, stage, { canPlay, unlocked, stars }));
          path.appendChild(h('div.node-wrap', { style: { left: x + '%', top: y + 'rem' } },
            node,
            h('div.node-label', stage.short),
            h('div.node-stars', canPlay && R.done(key) ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '')));

          // Thú cưng đứng cạnh chặng hiện tại
          if (key === petKey && st.pet) {
            path.appendChild(h('div.map-pet', { style: { left: (x > 50 ? x - 21 : x + 21) + '%', top: y + 'rem' } },
              App.UI.pet(st.pet, 3.6, { grow: false })));
          }
          // Trang trí ở phía đối diện
          if (rnd() < 0.75) {
            const dx = x > 50 ? x - 30 - rnd() * 12 : x + 30 + rnd() * 12;
            path.appendChild(h('div.deco', { style: { left: dx + '%', top: y + GAP * (0.3 + rnd() * 0.4) + 'rem' } },
              sub.deco[Math.floor(rnd() * sub.deco.length)]));
          }
        });

        // Đường đi nối các chặng
        let d = `M ${pts[0][0]} ${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
          const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
          d += ` C ${x0} ${y0 + GAP / 2}, ${x1} ${y1 - GAP / 2}, ${x1} ${y1}`;
        }
        path.insertAdjacentHTML('afterbegin',
          `<svg viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">` +
          `<path class="path-edge" d="${d}"/><path class="path-line" d="${d}"/><path class="path-dash" d="${d}"/></svg>`);

        tEl.appendChild(path);
        scroll.appendChild(tEl);
      });

      el.appendChild(scroll);
      return el;
    },

    mounted(el) {
      const cur = el.querySelector('.node.current');
      if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
    },
  };

  function openStage(sub, topic, stage, { canPlay, unlocked, stars }) {
    if (!canPlay) {
      App.Sound.play('tap');
      App.UI.toast('🚧 Bài này đang được xây dựng, sắp có rồi!');
      return;
    }
    if (!unlocked) {
      App.Sound.play('wrong');
      App.UI.toast(stage.bonus ? '🔒 Bé làm xong các chặng của chủ đề này để mở Thử thách nhé!' : '🔒 Bé hoàn thành chặng trước để mở khóa nhé!');
      return;
    }
    App.Sound.play('pop');
    const count = stage.plan.reduce((s, [, n]) => s + n, 0);
    const advanced = App.Store.state.settings.level === 'nang-cao' && stage.adv && !stage.bonus;
    const body = h('div.stage-sheet',
      h('div.s-ico', stage.icon),
      h('div.s-short', `${topic.short} · ${stage.short}`),
      h('div.modal-title', stage.name),
      h('div.s-stars', stars ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '☆☆☆'),
      stage.bonus ? h('div.s-note', '🧠 Câu hỏi khó, cần suy nghĩ kĩ · Không bắt buộc · Xu thưởng gấp đôi') : null,
      advanced ? h('div.s-note', '🔥 Mức nâng cao: có thêm câu khó hơn sách giáo khoa') : null,
      h('div.modal-body', `${count} câu hỏi · khoảng ${Math.max(3, Math.round(count * 0.6))} phút`));
    App.UI.modal({
      body,
      buttons: [
        { label: 'Để sau', value: false, cls: 'white' },
        { label: stars ? '🔁 Chơi lại' : '▶ Chơi ngay', value: true, cls: 'green' },
      ],
    }).then((ok) => {
      if (ok) App.Router.go('play', { subject: sub.id, topic: topic.id, stage: stage.id });
    });
  }
})(window.App);
