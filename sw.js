/* Paint by Numbers — service worker: works offline, stays fresh when online.
   Bump CACHE whenever the artwork or app files change; the old cache is dropped
   on activate and everything is re-primed. */
const CACHE = 'pbn-v3';
const ASSETS = [
  './', './index.html', './characters.js', './manifest.webmanifest', './privacy.html',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/icon-180.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first so an update applies on the very next launch, but the network
   only gets 3 seconds — in a car a flaky signal must never out-wait the cache.
   Offline the fetch fails at once and the cache answers. */
const TIMEOUT = 3000;
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const resp = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('slow')), TIMEOUT);
        fetch(e.request).then(r => { clearTimeout(timer); resolve(r); },
                              err => { clearTimeout(timer); reject(err); });
      });
      if (resp && resp.ok){
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      }
      return resp;
    } catch (_) {
      return (await caches.match(e.request)) || (await caches.match('./index.html'));
    }
  })());
});
