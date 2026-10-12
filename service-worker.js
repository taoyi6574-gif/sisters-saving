const CACHE = 'sisters-saving-pwa-v7';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];
const XLSX_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('sisters-saving-pwa-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Prefer the current page online; retain the last successful page for offline use.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const fresh = await fetch(event.request, {cache:'no-store', signal:controller.signal});
        if (!fresh.ok) throw new Error('Page request failed');
        const cache = await caches.open(CACHE);
        await cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cached = await cache.match('./index.html');
        if (cached) return cached;
        throw error;
      } finally {
        clearTimeout(timer);
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      if (event.request.url.startsWith(self.location.origin) || event.request.url === XLSX_CDN) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, fresh.clone()).catch(()=>{});
      }
      return fresh;
    } catch (e) {
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      throw e;
    }
  })());
});
