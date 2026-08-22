const CACHE_NAME = 'monea-pwa-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/favicon.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Use Individual add to prevent one failure from blocking all
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url))
            ).then(results => {
                const failed = results.filter(r => r.status === 'rejected');
                if (failed.length > 0) {
                    console.warn('[SW] Some assets failed to cache:', failed);
                }
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle HTTP/HTTPS requests to avoid Chrome Extension/Data URI issues
    if (!event.request.url.startsWith('http')) return;

    // We want to skip caching for API calls, Next.js internal files, and HMR
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('/_next/') ||
        event.request.url.includes('hot-reloader') ||
        event.request.url.includes('webpack_hmr')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Development bypass: If we're on localhost, prefer network but fallback to cache
            const isLocalhost = event.request.url.includes('localhost');

            if (isLocalhost && !response) {
                return fetch(event.request);
            }

            return response || fetch(event.request).then((fetchResponse) => {
                // Ensure we have a valid response before caching
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }

                return caches.open(CACHE_NAME).then((cache) => {
                    // Dynamically cache other assets on the fly
                    if (event.request.method === 'GET') {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            // Return a minimal offline response to avoid "Failed to convert value to 'Response'" error
            return new Response('Offline content not available', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
            });
        })
    );
});
