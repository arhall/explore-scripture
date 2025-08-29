// Bible Explorer Service Worker - Enhanced Security & Offline Functionality
const CACHE_NAME = 'bible-explorer-v1.0.0-secure';
const OFFLINE_URL = '/offline/';

// Security configuration
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
};

// Allowed domains for external requests
const ALLOWED_DOMAINS = [
  'www.biblegateway.com',
  'api.esv.org',
  'bible-api.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com'
];

// Rate limiting storage
const rateLimits = new Map();

// Essential resources to cache for offline functionality
const ESSENTIAL_RESOURCES = [
  '/',
  '/styles.css',
  '/assets/favicon.svg',
  '/assets/logger.js',
  '/assets/telemetry.js',
  '/assets/debug-dashboard.js',
  '/assets/scripture-widget.js',
  '/assets/chapter-reader.js',
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

// Security: Check if URL is allowed
function isUrlAllowed(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Allow same-origin requests
    if (parsedUrl.origin === self.location.origin) {
      return true;
    }
    
    // Check against allowed domains
    return ALLOWED_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

// Security: Rate limiting for requests
function checkRateLimit(clientId, maxRequests = 60, timeWindow = 60000) {
  const now = Date.now();
  const clientRequests = rateLimits.get(clientId) || [];
  
  // Remove old requests outside time window
  const validRequests = clientRequests.filter(time => now - time < timeWindow);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimits.set(clientId, validRequests);
  return true;
}

// Security: Add security headers to response
function addSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);
  
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    newHeaders.set(header, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Fetch event - secure and serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;
  
  // Security: Only handle safe methods
  if (!['GET', 'POST'].includes(request.method)) {
    return;
  }
  
  // Security: Check if URL is allowed
  if (!isUrlAllowed(url)) {
    console.warn('[SW Security] Blocked unauthorized request to:', url);
    event.respondWith(
      new Response('Unauthorized request blocked', { 
        status: 403,
        headers: SECURITY_HEADERS
      })
    );
    return;
  }
  
  // Security: Rate limiting check
  const clientId = event.clientId || 'unknown';
  if (!checkRateLimit(clientId)) {
    console.warn('[SW Security] Rate limit exceeded for client:', clientId);
    event.respondWith(
      new Response('Rate limit exceeded', { 
        status: 429,
        headers: SECURITY_HEADERS
      })
    );
    return;
  }

  // Handle Bible API requests specially
  if (event.request.url.includes('bible-api.com') || 
      event.request.url.includes('scripture.api.bible')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                  console.log('[SW] Cached Bible API response:', event.request.url);
                });
              }
              return response;
            })
            .catch(() => {
              // Return offline Bible verse response
              return new Response(JSON.stringify({
                text: 'Verse text unavailable offline. Please connect to the internet to load new verses.',
                reference: 'Offline',
                translation_name: 'System'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Skip other external resources
  if (event.request.url.includes('youtube.com') || 
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