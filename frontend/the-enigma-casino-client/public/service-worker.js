const CACHE_NAME = 'enigma-pwa-v1';

const OFFLINE_ROUTES = [
  '/',
  '/landing',
  '/about',
  '/policies',
  '/404',
  '/img/icono.webp',
];

self.addEventListener('install', (event) => {
  console.log('📦 [SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ROUTES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔁 [SW] Activado');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
