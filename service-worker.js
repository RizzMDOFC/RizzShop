self.addEventListener('install', event => {
    console.log('Service Worker installed');
    event.waitUntil(
      caches.open('rizzshop-cache-v1').then(cache => {
        return cache.addAll([
          '/',
          '/dashboard.html',
          '/index.html',
          '/style.css',
          '/script.js',
          '/dashboard.js',
          '/img/rizzshop-logo.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  