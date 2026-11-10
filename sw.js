// Hubog service worker — caches the app so it works offline, and picks up new releases.
// VERSION is replaced with the commit id on every deploy (.github/workflows/deploy.yml), so each release
// installs a new service worker and the open app reloads itself (see js/app.js).
const VERSION = 'hubog-v11';
const APP = [
  './', './index.html', './css/style.css', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png',
  './js/app.js', './js/store.js', './js/calc.js', './js/foods.js', './js/off.js', './js/scan.js', './js/label.js',
  './js/workouts.js', './js/ui.js', './js/i18n.js', './js/theme.js', './js/backup.js', './js/icons.js', './js/creatine.js', './js/restaurants.js', './js/imageprep.js', './js/filters.js', './js/activities.js', './js/views/activitysheet.js', './fonts/poppins-medium.woff', './fonts/poppins-bold.woff',
  './js/views/onboarding.js', './js/views/today.js', './js/views/foodsheet.js', './js/views/add.js',
  './js/views/recipe.js', './js/views/workouts.js', './js/views/progress.js', './js/views/me.js',
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache so a new release never stores old files
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(APP.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.includes(self.registration.scope));
    return open ? open.focus() : self.clients.openWindow(e.notification.data?.url || './');
  }));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Food database calls: always go to the network
  if (url.hostname.endsWith('openfoodfacts.org')) return;

  if (url.origin === location.origin) {
    // App files: network first, asking the server if the file changed (GitHub Pages otherwise lets the
    // browser reuse old copies for 10 minutes). Falls back to the saved copy when offline.
    e.respondWith(fetch(e.request, { cache: 'no-cache' })
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if (/unpkg\.com|jsdelivr\.net/.test(url.hostname)) {
    // Scanner/OCR libraries: cache after first use
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    })));
  }
});
