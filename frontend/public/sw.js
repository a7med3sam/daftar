const CACHE_VERSION = 'daftar-pwa-v1';
const OFFLINE_URL = '/offline';
const OFFLINE_DOCUMENT = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <title>لا يوجد اتصال بالإنترنت</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 1rem;
        direction: rtl;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f4f6fb;
        color: #1a2235;
      }
      main {
        width: min(100%, 420px);
        padding: 2rem 1.5rem;
        border: 1px solid #e4e9f2;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
        text-align: center;
      }
      .mark {
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        margin: 0 auto 1.25rem;
        border-radius: 18px;
        background: rgba(217, 119, 6, 0.1);
        color: #d97706;
        font-size: 2rem;
        font-weight: 800;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.35rem;
        line-height: 1.4;
      }
      p {
        margin: 0 0 1.5rem;
        color: #5a6a85;
        font-size: 0.95rem;
        line-height: 1.8;
      }
      button {
        width: 100%;
        min-height: 48px;
        border: 0;
        border-radius: 9px;
        background: #5b52f0;
        color: white;
        cursor: pointer;
        font: inherit;
        font-weight: 800;
      }
      button:active { transform: scale(0.98); }
      @media (prefers-color-scheme: dark) {
        body { background: #0d1424; color: #e8eef8; }
        main { background: #1a2540; border-color: #263048; box-shadow: 0 4px 16px rgba(0,0,0,0.5); }
        p { color: #8fa0b8; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="mark" aria-hidden="true">!</div>
      <h1>لا يوجد اتصال بالإنترنت</h1>
      <p>تعذر تحميل الصفحة المطلوبة. تحقق من الاتصال ثم حاول مرة أخرى.</p>
      <button type="button" onclick="window.location.reload()">إعادة المحاولة</button>
    </main>
  </body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.put(
        OFFLINE_URL,
        new Response(OFFLINE_DOCUMENT, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_VERSION)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode !== 'navigate' || request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_VERSION);
      return cache.match(OFFLINE_URL);
    }),
  );
});
