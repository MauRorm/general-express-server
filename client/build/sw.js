/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'orion-fms-v3';
const DATA_TO_CACHE = [
  '/',
  '/static/js/',
  '/manifest.json',
  '/asset-manifest.json',
  '/favicon.ico',
  '/static/js/',
  '/precache-manifest.0171df4de4bac7e7c69bcf914520d719.js',
  '/static/',
  '/assets/',
  '/public/',
  '/build/',
  '/service-worker.js',
];
if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js',
  );

  let versionServiceWorker = 'v.3.6.12';

  /* global workbox */
  if (workbox) {

    console.log('Workbox is loaded');
    /* workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "df442419d61d1ff0dcfaace32acf2374"
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
    "url": "static/css/main.e34975f4.css",
    "revision": "a8ae0582b26a2938860b682ee68bac5f"
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



/*
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }) 
  );
});
*/


    
self.addEventListener('fetch', (event) => {
 console.log("dojedoijeoijd -0 ", event)
  if ( event.request.url.indexOf( '/api/' ) !== -1 || event.request.url.indexOf( '/cloudflare/' ) !== -1
  ||
  event.request.url.indexOf('/api/whitebox/transaction/psp/chargeback/')
  
  ) {
    return false;
  }
  event.respondWith(
    caches.match(event.request, {cacheName:CACHE_NAME,ignoreVary:true}).then((response) => {
      console.log("dojedoijeoijd 0 ", response)
      if (response) {
        return response;
      }
      console.log("dojedoijeoijd 1 ", event.request.url)
      if (/*event.request.url.indexOf('/api/') <= -1*/true === true) {
        return fetch(event.request).then(responseOne => {
         console.log("dojedoijeoijd 2 ", responseOne)
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
      } else {
        return response;
      }



    }),
  );
});


/*
self.addEventListener('activate', (event) => {

  console.log('sw activate');
  clients.claim();
  self.clients.claim();
  
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            return caches.delete(key);
          }),
        ),
      )
      .then(() => {
        console.log('V1 now ready to handle fetches!');
      }),
  );
  
  
});
*/

self.addEventListener('activate', (event) => {
  //clients.claim();
  //self.clients.claim();
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
