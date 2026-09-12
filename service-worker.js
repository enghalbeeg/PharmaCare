/* ============================================================
   PharmaCare — Service Worker (PWA: installable + offline shell)
   ------------------------------------------------------------
   Caches the app shell so it loads offline. IMPORTANT: it never
   intercepts Firestore/Auth API traffic (googleapis.com), so
   realtime sync keeps working normally.
   ============================================================ */
const CACHE = 'pharmacare-v46';
// JS/CSS are versioned (?v=) in index.html and cached dynamically on first load,
// so they aren't precached here (avoids URL mismatch).
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()).catch(()=>{}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // never touch writes
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFirebaseSDK = url.origin === 'https://www.gstatic.com' && url.pathname.includes('/firebasejs/');

  // Let Firestore/Auth/Google APIs go straight to the network (no caching).
  if (!sameOrigin && !isFirebaseSDK) return;

  // SPA navigation → serve cached index.html when offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // App shell + Firebase SDK → cache-first, then network (and cache it).
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => cached))
  );
});
