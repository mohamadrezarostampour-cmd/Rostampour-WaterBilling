/* Rostampour Water Billing — Service Worker
   کش کردن پوسته برنامه برای دسترسی آفلاین به رابط کاربری.
   نکته: داده‌های زنده (مشترکین، قرائت‌ها و...) از طریق Firestore و فقط با اتصال اینترنت به‌روزرسانی می‌شوند؛
   این service worker فقط باعث می‌شود خود برنامه (HTML/CSS/JS) بدون اینترنت هم باز شود.
*/
const CACHE_NAME = 'rostampour-water-v1';
const APP_SHELL = ['./index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // شبکه اول، در صورت قطع بودن اینترنت از کش استفاده شود (برای خود پوسته برنامه)
  event.respondWith(
    fetch(req).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req))
  );
});
