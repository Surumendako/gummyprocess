
const CACHE_NAME = 'popi-cache-v1';
const urlsToCache = [
'/gummyprocess/CHO122211/index.html',

'/gummyprocess/CHO122211/test-ser.html',
'/gummyprocess/CHO122211/test-ser.css',
'/gummyprocess/CHO122211/test-ser.js',

'/gummyprocess/CHO122211/test-ch.html',
'/gummyprocess/CHO122211/test-ch.css',
'/gummyprocess/CHO122211/test-ch.js',

'/gummyprocess/CHO122211/test-que.html',
'/gummyprocess/CHO122211/test-que.css',
'/gummyprocess/CHO122211/test-que.js',

'/gummyprocess/CHO122211/test-quemo.js',

'/gummyprocess/CHO122211/pic/stop.png',
'/gummyprocess/CHO122211/pic/retry.png',
'/gummyprocess/CHO122211/pic/start.png',
'/gummyprocess/CHO122211/pic/quemo-check.png',
'/gummyprocess/CHO122211/pic/back.png',
'/gummyprocess/CHO122211/pic/next.png',

'/gummyprocess/CHO122211/pic/buu.png',
'/gummyprocess/CHO122211/pic/poo.png',
'/gummyprocess/CHO122211/pic/TEST-rogo.png',

'/gummyprocess/CHO122211/pic/icon/TEST.png',

'/gummyprocess/CHO122211/pic/key/a.png',
'/gummyprocess/CHO122211/pic/key/b.png',
'/gummyprocess/CHO122211/pic/key/c.png',
'/gummyprocess/CHO122211/pic/key/d.png',
'/gummyprocess/CHO122211/pic/key/e.png',
'/gummyprocess/CHO122211/pic/key/f.png',
'/gummyprocess/CHO122211/pic/key/g.png',
'/gummyprocess/CHO122211/pic/key/h.png',
'/gummyprocess/CHO122211/pic/key/i.png',
'/gummyprocess/CHO122211/pic/key/j.png',
'/gummyprocess/CHO122211/pic/key/k.png',
'/gummyprocess/CHO122211/pic/key/l.png',
'/gummyprocess/CHO122211/pic/key/m.png',
'/gummyprocess/CHO122211/pic/key/n.png',
'/gummyprocess/CHO122211/pic/key/o.png',
'/gummyprocess/CHO122211/pic/key/p.png',
'/gummyprocess/CHO122211/pic/key/q.png',
'/gummyprocess/CHO122211/pic/key/r.png',
'/gummyprocess/CHO122211/pic/key/s.png',
'/gummyprocess/CHO122211/pic/key/t.png',
'/gummyprocess/CHO122211/pic/key/u.png',
'/gummyprocess/CHO122211/pic/key/v.png',
'/gummyprocess/CHO122211/pic/key/w.png',
'/gummyprocess/CHO122211/pic/key/x.png',
'/gummyprocess/CHO122211/pic/key/y.png',
'/gummyprocess/CHO122211/pic/key/z.png',
'/gummyprocess/CHO122211/pic/key/-.png',

'/gummyprocess/CHO122211/pic/key/delete.png',
'/gummyprocess/CHO122211/pic/key/ansewer.png'
];

self.addEventListener('install', event => {
  console.log('[SW] インストール中…');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] アクティブ化');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/TEST/THE-POPI-TEST/index.html');
        }
      })
  );
});
