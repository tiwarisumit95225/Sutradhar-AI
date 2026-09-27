const CACHE_NAME = 'sutradhar-app-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/precache-manifest.json', '/pwa-icon.svg', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const manifest = await fetch('/precache-manifest.json').then((response) => response.json());
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([...APP_SHELL, ...manifest]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('sutradhar-app-shell-') && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(async (response) => {
      if (response.ok) await (await caches.open(CACHE_NAME)).put('/index.html', response.clone());
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/index.html')) || (await caches.match('/'))));
    return;
  }

  event.respondWith((async () => {
    // Vite emits content-hashed assets, so an installed copy is safe to serve first offline.
    if (url.pathname.startsWith('/assets/')) {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
