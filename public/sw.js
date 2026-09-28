const CACHE_NAME = 'kashcmd-portfolio-dev-v1';
const STATIC_CACHE = 'kashcmd-static-dev-v1';
const DYNAMIC_CACHE = 'kashcmd-dynamic-dev-v1';

// The worker is served from the Vite base, so its own location is the source of
// truth for it. Deriving the prefix here keeps the site working on any base
// without a build step rewriting this file.
const BASE = new URL('./', self.location).pathname;

// Assets to cache immediately
const STATIC_ASSETS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}favicon.svg`,
  `${BASE}apple-touch-icon.png`
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (CDNs, APIs, etc.)
  if (url.origin !== location.origin) {
    // For CDNs, use network-first strategy
    if (url.hostname.includes('cloudfront.net') || 
        url.hostname.includes('unsplash.com') ||
        url.hostname.includes('github.com')) {
      event.respondWith(
        fetch(request).catch(() => {
          // Return a fallback for failed CDN requests
          return new Response('Offline - Content unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
      );
      return;
    }
    return;
  }

  // For HTML pages, use network-first, then cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback page
            return caches.match(BASE).then((cached) => {
              return cached || new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images), use cache-first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        fetch(request).then((freshResponse) => {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, freshResponse);
          });
        });
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Return a fallback for images
        if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
          return new Response('Image unavailable offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
      });
    })
  );
});

// Background sync for offline actions (optional future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contact-form') {
    event.waitUntil(syncContactForm());
  }
});

// Push notifications (optional future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: `${BASE}favicon.svg`,
    badge: `${BASE}favicon.svg`
  };

  event.waitUntil(
    self.registration.showNotification('KashhCMD Portfolio', options)
  );
});

async function syncContactForm() {
  // Future: Implement form data synchronization
  console.log('Syncing contact form data...');
}
