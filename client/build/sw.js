/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'crud-react';
const DATA_TO_CACHE = [
  '/',
];
if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js',
  );

  let versionServiceWorker = '0.5.0';

  /* global workbox */
  if (workbox) {

    console.log('Workbox is loaded');
    /* workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "ac1c8d8e1615deee0e65c679fe70af20"
  },
  {
    "url": "logo192.png",
    "revision": "33dbdd0177549353eeeb785d02c294af"
  },
  {
    "url": "logo512.png",
    "revision": "917515db74ea8d1aee6a246cfbcc0b45"
  },
  {
    "url": "static/css/main.22953c42.css",
    "revision": "ab79442b4930bbae8c61f1aee5d5ae4c"
  },
  {
    "url": "static/js/453.ff44c0d5.chunk.js",
    "revision": "66bd984dc3308b8662635a7f287d1fc0"
  },
  {
    "url": "static/js/main.7b3f86d7.js",
    "revision": "9524404c390d30ff4f23b38cb7a3c9dc"
  }
]); */

    /* custom cache rules */
    workbox.routing.registerNavigationRoute('/', {
      cacheName: CACHE_NAME,
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/,/^\/api/],
    });

    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg|svg)$/,
      workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 600,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      }),
    );
    workbox.routing.registerRoute(
      /\.(?:woff2|ttf|woff|ico)$/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'fonts',
        plugins: [new workbox.broadcastUpdate.Plugin('api-updates')],
      }),
    );

    workbox.routing.registerRoute(
      /\.(?:js|json)$/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'scripts',
        plugins: [new workbox.broadcastUpdate.Plugin('api-updates')],
      }),
    );
    workbox.routing.registerRoute(
      /\.(?:css)$/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'css',
        plugins: [new workbox.broadcastUpdate.Plugin('api-updates')],
      }),
    );
  } else {
    console.log('Workbox could not be loaded. No Offline support');
  }
}


self.addEventListener('install', async (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(async (cache) => {
    let ok = null;

    try {
      ok = await cache.addAll(DATA_TO_CACHE);
    } catch (err) {
      for (let i of DATA_TO_CACHE) {
        try {
          ok = await cache.add(i);
        } catch (err) {
        }
      }
    }

    return self.skipWaiting();
  }));
});

    
self.addEventListener('fetch', (event) => {
  if ( event.request.url.indexOf( 'css' ) || event.request.url.indexOf( '/api/' ) !== -1 || event.request.url.indexOf( '/cloudflare/' ) !== -1
  
  ) {
    return false;
  }
  event.respondWith(
    caches.match(event.request, {cacheName:CACHE_NAME,ignoreVary:true}).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(responseOne => {
          caches.open(CACHE_NAME).then(cache => {
            if (
              event.request.method !== 'POST'
              &&
              event.request.method !== 'PUT'
            ) {
              cache.put(event.request, responseOne);
              
            }
            return null;
          })
          return responseOne.clone()
        })



    }),
  );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
      caches.keys().then((cacheNames) => {
          return Promise.all(
              cacheNames.map((cache) => {
                  if (cache !== CACHE_NAME) {
                      return caches.delete(cache); //Deleting the old cache (cache v1)
                  }
              })
          );
      })
          .then(function () {
              console.info("Old caches are cleared!");
              return self.clients.claim();
          })
  );
});







addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    skipWaiting().then(() => {
      console.log('version 2.1');

    });
  }
});
