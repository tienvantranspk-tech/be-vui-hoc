/* Bé Vui Học – các hàm tiện ích dùng chung */
window.App = window.App || {};
(function (App) {
  'use strict';
  const U = {};

  // ---- Ngẫu nhiên ----
  U.rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min; // số nguyên trong [min, max]
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.sample = (arr, n) => U.shuffle(arr).slice(0, n);
  // Bộ sinh số ngẫu nhiên cố định theo "hạt giống" (để hình trang trí không nhảy lung tung)
  U.seeded = (seed) => () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // ---- Mảng & số ----
  U.uniq = (arr) => [...new Set(arr)];
  U.range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  U.rev = (n) => Number(String(n).split('').reverse().join('')); // 45 → 54
  U.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---- Ngày tháng ----
  U.dayKey = (d = new Date()) => {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  // Tuần tính từ thứ Hai: trả về ngày thứ Hai của tuần chứa ngày d ('2026-10-12')
  U.weekKey = (d = new Date()) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return U.dayKey(x);
  };
  U.addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return U.dayKey(new Date(y, m - 1, d + n)); };
  U.daysBetween = (fromKey, toKey) => {
    const t = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
    return Math.round((t(toKey) - t(fromKey)) / 86400000);
  };

  // ---- Tạo phần tử giao diện ----
  // h('button.btn.green', { onclick: fn }, 'Chữ', phầnTửCon, [mảng con])
  U.h = function (sel, attrs, ...kids) {
    const m = /^([a-z][a-z0-9]*)?((?:[.#][\w-]+)*)$/i.exec(sel) || [];
    const el = document.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, (_, t, v) => {
      if (t === '.') el.classList.add(v); else el.id = v;
      return '';
    });
    if (attrs != null && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
      kids.unshift(attrs);
      attrs = null;
    }
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'class') String(v).split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
        else if (k === 'style') {
          if (typeof v === 'string') el.style.cssText = v;
          else for (const p in v) { if (p.startsWith('--')) el.style.setProperty(p, v[p]); else el.style[p] = v[p]; }
        }
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    return U.add(el, kids);
  };
  U.add = (el, kids) => {
    for (const c of [kids].flat(Infinity)) {
      if (c == null || c === false || c === '') continue;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  };

  // ---- Đọc số bằng chữ (0 – 1000), theo cách đọc trong sách giáo khoa ----
  const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function readUnder100(n) {
    const t = Math.floor(n / 10), u = n % 10;
    if (t === 0) return DIGITS[u];
    if (t === 1) return 'mười' + (u === 0 ? '' : ' ' + (u === 5 ? 'lăm' : DIGITS[u]));
    let s = DIGITS[t] + ' mươi';
    if (u === 1) s += ' mốt';
    else if (u === 4) s += ' tư';
    else if (u === 5) s += ' lăm';
    else if (u > 0) s += ' ' + DIGITS[u];
    return s;
  }
  U.readNumber = function (n) {
    if (n === 1000) return 'một nghìn';
    if (n < 100) return readUnder100(n);
    const h = Math.floor(n / 100), r = n % 100;
    const s = DIGITS[h] + ' trăm';
    if (r === 0) return s;
    if (r < 10) return s + ' linh ' + DIGITS[r];
    return s + ' ' + readUnder100(r);
  };

  // ---- Phương án nhiễu cho câu hỏi chọn số ----
  // extra: những đáp án sai "hay gặp" được ưu tiên đưa vào trước
  U.numberOptions = function (answer, count = 4, { min = 0, max = 1000, extra = [] } = {}) {
    const out = [answer];
    const add = (c) => {
      if (out.length < count && Number.isInteger(c) && c >= min && c <= max && !out.includes(c)) out.push(c);
    };
    U.shuffle(extra).forEach(add);
    const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10];
    if (answer > 10 && answer < 100 && answer % 10) near.push(U.rev(answer));
    U.shuffle(near).forEach(add);
    for (let i = 0; out.length < count && i < 60; i++) add(answer + U.rand(-9, 9));
    return U.shuffle(out);
  };

  // ---- Chuyển biểu thức toán thành lời đọc tiếng Việt ----
  // Đơn vị viết trong ngoặc nhọn: {kg} {l} {cm}
  U.mathSpeak = (s) => String(s)
    .replace(/\?/g, ' mấy ')
    .replace(/\+/g, ' cộng ')
    .replace(/−| - /g, ' trừ ')
    .replace(/×/g, ' nhân ')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 chia $2')
    .replace(/>/g, ' lớn hơn ')
    .replace(/</g, ' bé hơn ')
    .replace(/=/g, ' bằng ')
    .replace(/\{kg\}/g, ' ki-lô-gam')
    .replace(/\{l\}/g, ' lít')
    .replace(/\{cm\}/g, ' xăng-ti-mét')
    .replace(/\{dm\}/g, ' đề-xi-mét')
    .replace(/\{km\}/g, ' ki-lô-mét')
    .replace(/\{m\}/g, ' mét')
    .replace(/\{(\w+)\}/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim();
  // Bỏ ngoặc nhọn của đơn vị khi hiển thị chữ thường: "5 {kg}" → "5 kg"
  U.plain = (s) => String(s).replace(/\{(\w+)\}/g, '$1');
  // Tên không dấu để đặt tên tệp: "Bé Na" → "Be-Na"
  U.slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'be';

  App.U = U;
})(window.App);
