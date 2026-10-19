// Service Worker – Ronda de Salas
// Estratégia: network-first para arquivos do app (atualização imediata a cada deploy),
//             cache-first para ícones estáticos.

const CACHE_NAME = 'ronda-salas-v3';

// Arquivos do app – network-first (tenta rede, fallback p/ cache)
const APP_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-config.js',
  './vendor/firebase-bundle.js',
  './manifest.json',
];

// Assets estáticos – cache-first (quase nunca mudam)
const STATIC_ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

// ---------- Install ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Falhas nos arquivos essenciais impedem a instalação.
      await cache.addAll(APP_ASSETS);
      // Falhas nos ícones não impedem o funcionamento offline do app.
      return Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset)));
    })
  );
  self.skipWaiting();
});

// ---------- Activate ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name.startsWith('ronda-salas-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora requisições que não sejam GET (ex.: POST do webhook do Discord)
  if (event.request.method !== 'GET') return;

  // Só intercepta requisições do mesmo origin
  if (url.origin !== location.origin) return;

  // Decide a estratégia com base no caminho
  const isStatic = STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset.replace('./', '')));

  const offlineFallback = async () => {
    if (event.request.mode === 'navigate') {
      return (await caches.match(event.request, { ignoreSearch: true }))
        || (await caches.match('./index.html'))
        || new Response('Offline', { status: 503 });
    }
    return (await caches.match(event.request))
      || new Response('Offline', { status: 503 });
  };

  if (isStatic) {
    // Cache-first: ícones raramente mudam
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, clone))
                .catch(() => {})
            );
          }
          return response;
        });
      }).catch(offlineFallback)
    );
  } else {
    // Network-first: app assets – sempre tenta buscar a versão mais recente
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, clone))
                .catch(() => {})
            );
          }
          return response;
        })
        .catch(offlineFallback)
    );
  }
});
