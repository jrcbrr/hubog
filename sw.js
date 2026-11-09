// Hubog service worker — caches the app so it works offline.
const VERSION = 'hubog-v1';
const APP = [
  './', './index.html', './css/style.css', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png',
  './js/app.js', './js/store.js', './js/calc.js', './js/foods.js', './js/off.js', './js/scan.js', './js/label.js',
  './js/workouts.js', './js/ui.js', './js/i18n.js', './js/theme.js',
  './js/views/onboarding.js', './js/views/today.js', './js/views/foodsheet.js', './js/views/add.js',
  './js/views/recipe.js', './js/views/workouts.js', './js/views/progress.js', './js/views/me.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Food database calls: always go to the network
  if (url.hostname.endsWith('openfoodfacts.org')) return;

  if (url.origin === location.origin) {
    // App files: network first (get updates), fall back to cache when offline
    e.respondWith(fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if (/unpkg\.com|jsdelivr\.net/.test(url.hostname)) {
    // Scanner/OCR libraries: cache after first use
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    })));
  }
});
