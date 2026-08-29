/**
 * MONEA Service Worker v2
 * Handles static assets caching & SPA navigation fallback gracefully.
 */

const CACHE_NAME = 'monea-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
];

// Install: Cache critical shell assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Delete all previous outdated caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart routing & error safety
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Never intercept non-GET requests, API calls, or cross-origin workers requests
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('workers.dev') ||
    request.url.startsWith('chrome-extension') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('googleusercontent.com')
  ) {
    return; // Let browser handle natively
  }

  const url = new URL(request.url);

  // 2. SPA Navigation requests (e.g. /sign-up, /dashboard, /dashboard/schedule)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
        .then((response) => {
          if (response) return response;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3. Static assets: Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache (stale-while-revalidate for same-origin)
        if (url.origin === self.location.origin) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
              }
            })
            .catch(() => { /* ignore background update errors */ });
        }
        return cachedResponse;
      }

      // Not in cache: fetch from network
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch((fetchError) => {
          // If navigation or image fails, return a safe fallback or let error propagate safely
          console.warn('[SW] Fetch failed for:', request.url, fetchError);
          if (request.destination === 'image') {
            return new Response('', { status: 404, statusText: 'Not Found' });
          }
          throw fetchError;
        });
    })
  );
});
