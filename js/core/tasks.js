/* Nhiệm vụ cùng bố mẹ: bé ghi âm lúc đọc bài hoặc viết vào vở → bố mẹ nghe / xem và chấm sao trong Góc phụ huynh.
   Danh sách nhiệm vụ lưu cùng dữ liệu của bé (st.tasks); tệp ghi âm lưu riêng trong IndexedDB của trình duyệt
   (không đưa vào tệp sao lưu vì khá nặng). */
(function (App) {
  'use strict';
  const S = () => App.Store.state;
  const DB = 'bevuihoc-audio', STORE = 'rec';
  const KEEP = 30; // giữ 30 nhiệm vụ gần nhất

  function db() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('no idb')); return; }
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function put(id, blob) {
    const d = await db();
    await new Promise((res, rej) => { const tx = d.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(blob, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  }
  async function get(id) {
    const d = await db();
    return new Promise((res) => { const r = d.transaction(STORE).objectStore(STORE).get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); });
  }
  async function del(id) {
    try { const d = await db(); d.transaction(STORE, 'readwrite').objectStore(STORE).delete(id); } catch (e) { /* không có gì để xóa */ }
  }

  const T = {
    list: () => S().tasks || (S().tasks = []),
    pending: () => T.list().filter((t) => t.stars == null),
    // task: { kind:'read'|'write', title, detail, sid }; blob: tệp ghi âm (nếu có)
    async add(task, blob) {
      const id = 't' + Date.now().toString(36);
      let audio = false;
      if (blob && blob.size) { try { await put(id, blob); audio = true; } catch (e) { audio = false; } }
      const list = T.list();
      list.unshift({ id, t: Date.now(), ...task, audio, stars: null, seen: false });
      while (list.length > KEEP) { const old = list.pop(); if (old.audio) del(old.id); }
      App.Store.save();
      return id;
    },
    audioUrl: async (id) => { try { const b = await get(id); return b ? URL.createObjectURL(b) : null; } catch (e) { return null; } },
    // Bố mẹ chấm 1–3 sao: bé được 3 xu mỗi sao, thú cưng vui hơn
    grade(id, stars) {
      const t = T.list().find((x) => x.id === id);
      if (!t || t.stars != null) return 0;
      t.stars = stars;
      t.gradedAt = Date.now();
      const coins = stars * 3;
      S().coins += coins;
      if (S().pet) S().pet.happy = Math.min(100, S().pet.happy + 5 * stars);
      App.Store.save();
      return coins;
    },
    // Các nhiệm vụ bố mẹ vừa chấm mà bé chưa xem (hiện lời khen ở trang chủ)
    takeNews() {
      const news = T.list().filter((t) => t.stars != null && !t.seen);
      news.forEach((t) => { t.seen = true; });
      if (news.length) App.Store.save();
      return news;
    },
  };
  App.Tasks = T;
})(window.App);
