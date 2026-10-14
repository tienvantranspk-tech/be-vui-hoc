/* Vẽ báo cáo tuần thành ảnh PNG để bố mẹ lưu lại hoặc gửi qua Zalo (vẽ trực tiếp bằng canvas, không cần mạng) */
(function (App) {
  'use strict';
  const W = 1080;
  const FUN = '"Baloo 2", "Andika", "Segoe UI", sans-serif';
  const TXT = '"Andika", "Segoe UI", Roboto, sans-serif';
  const C = { ink: '#2b2d42', soft: '#6a6d8c', line: '#e2e5ef', blue: '#3d8bff', good: '#22a157', ok: '#c98a00', low: '#d64545', none: '#9aa0b5',
    toan: '#3d8bff', tv: '#22b573', ta: '#a259f0', orange: '#ff9f43' };

  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  // Viết chữ tự xuống dòng, trả về vị trí y tiếp theo
  function wrapText(g, text, x, y, maxW, lh) {
    let line = '';
    for (const word of String(text).split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = word; } else line = t;
    }
    if (line) { g.fillText(line, x, y); y += lh; }
    return y;
  }
  const rateColor = (cls) => C[cls] || C.none;

  App.ReportImage = {
    async render(r) {
      const Rp = App.Report;
      try { await Promise.all([document.fonts.load(`800 40px ${FUN}`), document.fonts.load(`700 30px ${TXT}`)]); } catch (e) { /* dùng phông dự phòng */ }
      const c = document.createElement('canvas');
      c.width = W;
      c.height = 2600;
      const g = c.getContext('2d');
      g.fillStyle = '#eef5ff';
      g.fillRect(0, 0, W, c.height);
      g.textBaseline = 'alphabetic';

      // ---- Đầu trang ----
      g.fillStyle = C.blue;
      rr(g, 40, 40, W - 80, 190, 40);
      g.fill();
      g.fillStyle = '#fff';
      g.font = `800 58px ${FUN}`;
      g.fillText(`📒 Báo cáo học tập của ${r.name}`, 80, 128, W - 160);
      g.font = `700 34px ${TXT}`;
      g.fillText(`Tuần ${r.label} · Bé Vui Học – Lớp 2`, 80, 190, W - 160);
      let y = 270;

      // ---- Bốn ô số liệu ----
      const tiles = [[`${r.days}/7`, 'ngày có học'], [String(r.min), 'phút học'], [String(r.q), 'câu đã làm'], [r.p != null ? r.p + '%' : '–', 'đúng ngay']];
      const tw = (W - 80 - 3 * 20) / 4;
      tiles.forEach(([v, l], i) => {
        const x = 40 + i * (tw + 20);
        g.fillStyle = '#fff';
        rr(g, x, y, tw, 160, 28);
        g.fill();
        g.fillStyle = C.ink;
        g.font = `800 60px ${FUN}`;
        g.textAlign = 'center';
        g.fillText(v, x + tw / 2, y + 85);
        g.fillStyle = C.soft;
        g.font = `700 28px ${TXT}`;
        g.fillText(l, x + tw / 2, y + 130);
        g.textAlign = 'left';
      });
      y += 200;

      // ---- Mục tiêu tuần ----
      g.fillStyle = '#fff';
      rr(g, 40, y, W - 80, 170, 28);
      g.fill();
      g.fillStyle = C.ink;
      g.font = `800 36px ${FUN}`;
      g.fillText(`🎯 Mục tiêu ${r.goal.targetDays} ngày × ${r.goal.targetMin} phút – đạt ${r.goal.met}/${r.goal.targetDays} ngày`, 70, y + 55, W - 140);
      const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      r.goal.days.forEach((d, i) => {
        const x = 70 + i * 135;
        g.fillStyle = d.min >= r.goal.targetMin ? C.good : d.min > 0 ? '#ffc531' : C.line;
        rr(g, x, y + 80, 115, 64, 18);
        g.fill();
        g.fillStyle = d.min > 0 ? '#fff' : C.soft;
        g.font = `800 26px ${FUN}`;
        g.textAlign = 'center';
        g.fillText(`${names[i]} · ${d.min}′`, x + 57, y + 122);
        g.textAlign = 'left';
      });
      y += 210;

      // ---- Từng môn ----
      g.fillStyle = C.ink;
      g.font = `800 42px ${FUN}`;
      g.fillText('📚 Từng môn', 50, y + 10);
      y += 40;
      for (const s of r.subjects) {
        g.fillStyle = '#fff';
        rr(g, 40, y, W - 80, 150, 28);
        g.fill();
        g.fillStyle = C[s.sid];
        rr(g, 40, y, 16, 150, 8);
        g.fill();
        g.fillStyle = C.ink;
        g.font = `800 38px ${FUN}`;
        g.fillText(`${Rp.icon(s.sid)} ${Rp.name(s.sid)}`, 80, y + 55);
        g.fillStyle = C.soft;
        g.font = `700 28px ${TXT}`;
        g.fillText(`${s.min} phút · ${s.stages} chặng${s.newStages ? ` (${s.newStages} mới)` : ''}`, 80, y + 105);
        const lv = [['📗 Cơ bản', s.cb, 'cb'], ['🔥 Nâng cao', s.nc, 'nc']];
        lv.forEach(([label, o, l], i) => {
          const x = 520 + i * 260;
          const rt = Rp.rate(o, l);
          g.fillStyle = C.soft;
          g.font = `700 26px ${TXT}`;
          g.fillText(label, x, y + 50);
          g.fillStyle = rt ? rateColor(rt.cls) : C.none;
          g.font = `800 34px ${FUN}`;
          g.fillText(o.n ? `${Rp.pct(o.ok, o.n)}%` : '–', x, y + 95);
          g.font = `700 24px ${TXT}`;
          g.fillText(rt ? rt.label : (o.n ? 'chưa đủ câu' : 'chưa có câu'), x, y + 130, 240);
        });
        y += 170;
      }

      // ---- Thành tích, điểm mạnh, cần luyện, gợi ý ----
      const block = (title, lines) => {
        if (!lines.length) return;
        g.fillStyle = C.ink;
        g.font = `800 38px ${FUN}`;
        g.fillText(title, 50, y + 30);
        y += 70;
        g.font = `700 30px ${TXT}`;
        g.fillStyle = C.ink;
        for (const t of lines) y = wrapText(g, t, 70, y, W - 140, 44) + 6;
        y += 14;
      };
      const got = [];
      if (r.stickers) got.push(`${r.stickers} sticker mới`);
      if (r.badges.length) got.push(`huy hiệu ${r.badges.map((b) => b.name).join(', ')}`);
      block('🏅 Thành tích trong tuần', [
        `• Hoàn thành ${r.stages} chặng${r.newStages != null ? ` (${r.newStages} chặng mới)` : ''}${r.reviews ? `, ôn câu sai ${r.reviews} lần` : ''}.`,
        got.length ? `• Nhận ${got.join(' và ')}.` : '',
      ].filter(Boolean));
      block('💪 Điểm mạnh', Rp.strengths(3).map((s) => `• ${s.name} (đúng ngay ${s.p}%)`));
      block('🎯 Cần luyện', Rp.weaknesses(3).map((s) => `• ${s.name} (đúng ngay ${s.p}%)`));
      if (r.isCurrent) block('💡 Gợi ý tuần này', Rp.suggestions().map((x, i) => `${i + 1}. ${x.text}`));

      // ---- Chân trang ----
      y += 10;
      g.fillStyle = C.soft;
      g.font = `700 26px ${TXT}`;
      g.fillText(`Tạo ngày ${new Date().toLocaleDateString('vi-VN')} · Bé Vui Học – app vừa học vừa chơi lớp 2`, 50, y + 20);
      y += 60;

      // Cắt ảnh vừa nội dung
      const out = document.createElement('canvas');
      out.width = W;
      out.height = Math.min(c.height, Math.ceil(y));
      out.getContext('2d').drawImage(c, 0, 0);
      return new Promise((res) => out.toBlob(res, 'image/png'));
    },
  };
})(window.App);
