// Service Worker for Bible Explorer - Provides offline functionality
const CACHE_NAME = 'bible-explorer-v1';
const OFFLINE_URL = '/offline/';

// Essential resources to cache for offline functionality
const ESSENTIAL_RESOURCES = [
  '/',
  '/styles.css',
  '/assets/favicon.svg',
  '/assets/logger.js',
  '/assets/telemetry.js',
  '/assets/debug-dashboard.js',
  '/categories/',
  '/characters/',
  '/gospel-thread/',
  '/links/',
  OFFLINE_URL
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching essential resources');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Essential resources cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache essential resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API calls and external resources
  if (event.request.url.includes('api/') || 
      event.request.url.includes('youtube.com') || 
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('unpkg.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we got a response, cache it for future offline use
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            // Cache books, characters, and other content pages
            if (shouldCache(event.request.url)) {
              cache.put(event.request, responseClone);
              console.log('[SW] Cached:', event.request.url);
            }
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try to serve from cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('[SW] Serving from cache:', event.request.url);
              return response;
            }
            
            // If it's a navigation request and we don't have it cached,
            // serve the offline page
            if (event.request.mode === 'navigate') {
              console.log('[SW] Serving offline page for:', event.request.url);
              return caches.match(OFFLINE_URL);
            }
            
            // For other resources, return a network error
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Determine if a URL should be cached
function shouldCache(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // Cache main pages
  if (pathname === '/' || 
      pathname.startsWith('/categories/') ||
      pathname.startsWith('/characters/') ||
      pathname.startsWith('/books/') ||
      pathname.startsWith('/gospel-thread/') ||
      pathname === '/links/') {
    return true;
  }
  
  // Cache CSS and JS files
  if (pathname.endsWith('.css') || 
      pathname.endsWith('.js') || 
      pathname.endsWith('.svg')) {
    return true;
  }
  
  return false;
}

// Background sync for telemetry when back online
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // Sync any pending telemetry data
      syncPendingData()
    );
  }
});

async function syncPendingData() {
  try {
    // Get pending data from IndexedDB if available
    // This would sync with any analytics or telemetry endpoints
    console.log('[SW] Syncing pending data...');
    
    // Send a message to the main thread that we're back online
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BACK_ONLINE' });
    });
  } catch (error) {
    console.error('[SW] Failed to sync pending data:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_BOOK':
      // Cache a specific book page when user bookmarks it
      if (data.url) {
        caches.open(CACHE_NAME).then(cache => {
          fetch(data.url).then(response => {
            if (response.status === 200) {
              cache.put(data.url, response.clone());
              console.log('[SW] Cached bookmarked page:', data.url);
            }
          });
        });
      }
      break;
      
    case 'GET_CACHE_STATUS':
      // Report cache status back to main thread
      caches.open(CACHE_NAME).then(cache => {
        cache.keys().then(keys => {
          event.ports[0].postMessage({
            type: 'CACHE_STATUS',
            data: {
              cacheSize: keys.length,
              cachedUrls: keys.map(req => req.url)
            }
          });
        });
      });
      break;
  }
});

console.log('[SW] Service Worker loaded');