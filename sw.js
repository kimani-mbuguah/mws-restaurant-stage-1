let staticCacheName = 'restaurant-rev-static-cache-v7';
self.addEventListener('install', (event)=> {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        './',
        'index.html',
        'css/styles.css',
        'js/dbhelper.js',
        'js/main.js',
        'js/restaurant_info.js',
        'restaurant.html?id=1',
        'restaurant.html?id=2',
        'restaurant.html?id=3',
        'restaurant.html?id=4',
        'restaurant.html?id=5',
        'restaurant.html?id=6',
        'restaurant.html?id=7',
        'restaurant.html?id=8',
        'restaurant.html?id=9',
        'restaurant.html?id=10',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
        'https://api.mapbox.com/mapbox-gl-js/v0.47.0/mapbox-gl.css',
        'https://api.mapbox.com/mapbox-gl-js/v0.47.0/mapbox-gl.js',
        'https://api.tiles.mapbox.com/v4/mapbox.streets/',
        'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event)=> {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-rev') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event)=> {
  let requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === './') {
      event.respondWith(caches.match('./'));
      return;
    }
  }
  event.respondWith(
    caches.match(event.request).then((response)=> {
      return response || fetch(event.request);
    })
  );
});
