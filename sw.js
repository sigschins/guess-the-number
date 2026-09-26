// Offline support for guess-the-number — precaches every asset, network-first for the page itself.
const CACHE = 'guess-the-number-DkJeuW07';
const ASSETS = [
  "/guess-the-number/",
  "/guess-the-number/index.html",
  "/guess-the-number/manifest.webmanifest",
  "/guess-the-number/icon-192.png",
  "/guess-the-number/icon-512.png",
  "/guess-the-number/assets/index-26zieAuL.js",
  "/guess-the-number/assets/index-BVIPMIHE.css",
  "/guess-the-number/assets/number-game-DkJeuW07.png"
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put('/guess-the-number/index.html', copy));
                    return res;
                })
                .catch(() => caches.match('/guess-the-number/index.html'))
        );
        return;
    }
    event.respondWith(
        caches.match(req).then((hit) => hit || fetch(req).then((res) => {
            if (res.ok && req.url.includes('/guess-the-number/')) {
                const copy = res.clone();
                caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
        }))
    );
});
