/* Bộ nhớ đệm của app (PWA): cất sẵn toàn bộ app trong máy để mở nhanh và chơi được khi không có mạng.
   MỖI LẦN SỬA APP: tăng VERSION (ví dụ ...-2) để máy tính bảng tự tải bản mới ở lần mở sau. */
const VERSION = 'bvh-2026-10-14-2';
const FONTS = 'bvh-fonts';

// Các tệp của app (thêm tệp mới vào index.html thì nhớ thêm vào đây)
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'js/core/util.js',
  'js/core/store.js',
  'js/core/sound.js',
  'js/core/speech.js',
  'js/core/router.js',
  'js/data/pets.js',
  'js/data/stickers.js',
  'js/core/rewards.js',
  'js/core/ui.js',
  'js/games/visuals.js',
  'js/games/qtypes.js',
  'js/games/engine.js',
  'js/subjects/toan-gen.js',
  'js/subjects/toan-gen2.js',
  'js/subjects/toan-gen3.js',
  'js/subjects/toan.js',
  'js/subjects/toan-nangcao.js',
  'js/subjects/tiengviet-data.js',
  'js/subjects/tiengviet-gen.js',
  'js/subjects/tiengviet.js',
  'js/subjects/tiengviet-nangcao.js',
  'js/subjects/tienganh-data.js',
  'js/subjects/tienganh-gen.js',
  'js/subjects/tienganh.js',
  'js/subjects/tienganh-nangcao.js',
  'js/screens/setup.js',
  'js/screens/home.js',
  'js/screens/map.js',
  'js/screens/play.js',
  'js/screens/result.js',
  'js/screens/pet.js',
  'js/screens/album.js',
  'js/screens/parent.js',
  'js/screens/rest.js',
  'js/app.js',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' → luôn lấy bản mới nhất trên mạng, không lấy bản cũ trong bộ nhớ trình duyệt
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('bvh-') && k !== VERSION && k !== FONTS).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Phông chữ Google: lần đầu tải trên mạng rồi cất lại, các lần sau dùng bản đã cất
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') c.put(req, res.clone());
        return res;
      } catch (err) {
        return Response.error();
      }
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Trang và mã của app: dùng bản đã cất (mở ngay, không cần mạng); chưa có thì tải trên mạng
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = req.mode === 'navigate'
      ? (await cache.match('index.html')) || (await cache.match('./'))
      : await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      return req.mode === 'navigate' ? (await cache.match('index.html')) || Response.error() : Response.error();
    }
  })());
});
