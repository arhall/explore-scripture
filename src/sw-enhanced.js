// Enhanced Service Worker for Bible Explorer - Scalability Focused
// Version 2.0 with advanced caching, performance monitoring, and intelligent strategies

const VERSION = '2.0.0';
const CACHE_PREFIX = 'bible-explorer';
const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-v${VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-v${VERSION}`,
  DATA: `${CACHE_PREFIX}-data-v${VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-v${VERSION}`,
  API: `${CACHE_PREFIX}-api-v${VERSION}`
};

// Security headers (inherited from original)
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN', 
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
};

// Allowed domains
const ALLOWED_DOMAINS = [
  'www.biblegateway.com',
  'api.esv.org', 
  'bible-api.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'cdnjs.cloudflare.com'
];

// Cache configurations with intelligent limits
const CACHE_CONFIGS = {
  static: { maxEntries: 100, maxAgeSeconds: 31536000 }, // 1 year
  dynamic: { maxEntries: 200, maxAgeSeconds: 604800 },  // 1 week
  data: { maxEntries: 1000, maxAgeSeconds: 7200 },     // 2 hours
  images: { maxEntries: 50, maxAgeSeconds: 2592000 },  // 1 month
  api: { maxEntries: 100, maxAgeSeconds: 1800 }        // 30 minutes
};

// High-priority resources for immediate caching
const CRITICAL_RESOURCES = [
  '/',
  '/offline.html',
  '/assets/bundle-optimizer.js',
  '/assets/theme-manager.js',
  '/assets/styles.css',
  '/manifest.json'
];

// Performance monitoring
const performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  totalRequests: 0
};

// Rate limiting for API calls
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Install event with progressive caching
self.addEventListener('install', event => {
  console.log(`[SW] Installing Enhanced Service Worker v${VERSION}`);
  
  event.waitUntil(
    (async () => {
      try {
        // Cache critical resources immediately
        const staticCache = await caches.open(CACHES.STATIC);
        await staticCache.addAll(CRITICAL_RESOURCES);
        
        // Initialize performance tracking
        await initializePerformanceTracking();
        
        console.log('[SW] Critical resources cached');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
        
      } catch (error) {
        console.error('[SW] Installation failed:', error);
        throw error;
      }
    })()
  );
});

// Activate with intelligent cache management
self.addEventListener('activate', event => {
  console.log(`[SW] Activating Enhanced Service Worker v${VERSION}`);
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith(CACHE_PREFIX) && !Object.values(CACHES).includes(name)
        );
        
        await Promise.all(oldCaches.map(name => caches.delete(name)));
        console.log(`[SW] Cleaned ${oldCaches.length} old caches`);
        
        // Take control of all clients
        await self.clients.claim();
        
        // Initialize cache optimization
        setTimeout(() => optimizeCaches(), 5000);
        
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

// Enhanced fetch handler with intelligent routing and monitoring
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and invalid protocols
  if (request.method !== 'GET' || 
      url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:') {
    return;
  }
  
  // Increment total requests
  performanceMetrics.totalRequests++;
  
  // Security check for external domains
  if (url.origin !== location.origin) {
    const isAllowed = ALLOWED_DOMAINS.some(domain => url.hostname.includes(domain));
    if (!isAllowed) {
      console.warn(`[SW] Blocked unauthorized domain: ${url.hostname}`);
      return;
    }
  }
  
  event.respondWith(handleRequest(request));
});

// Intelligent request routing with performance tracking
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Route 1: Static assets (JS, CSS, fonts) - Cache First
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request, CACHES.STATIC, CACHE_CONFIGS.static);
    }
    
    // Route 2: Entity data files - Smart Network First with background update
    if (pathname.includes('/assets/data/entities/')) {
      return await networkFirstWithBackgroundUpdate(request, CACHES.DATA, CACHE_CONFIGS.data);
    }
    
    // Route 3: Search and book data - Stale While Revalidate
    if (pathname.includes('/assets/data/') && (pathname.includes('search') || pathname.includes('books'))) {
      return await staleWhileRevalidate(request, CACHES.DATA, CACHE_CONFIGS.data);
    }
    
    // Route 4: Images - Cache First with compression
    if (isImageAsset(pathname)) {
      return await cacheFirst(request, CACHES.IMAGES, CACHE_CONFIGS.images);
    }
    
    // Route 5: API endpoints - Network First with rate limiting
    if (pathname.startsWith('/api/') || isExternalAPI(url.hostname)) {
      return await rateLimitedNetworkFirst(request, CACHES.API, CACHE_CONFIGS.api);
    }
    
    // Route 6: HTML pages - Network First with intelligent fallbacks
    if (request.headers.get('Accept')?.includes('text/html')) {
      return await networkFirstWithSmartFallback(request, CACHES.DYNAMIC);
    }
    
    // Default: Network with cache backup
    return await networkWithCacheBackup(request, CACHES.DYNAMIC);
    
  } catch (error) {
    console.error('[SW] Request handling failed:', error);
    performanceMetrics.cacheMisses++;
    return createErrorResponse(request);
  }
}

// Enhanced caching strategies with performance optimization

async function cacheFirst(request, cacheName, config) {
  try {
    const cache = await caches.open(cacheName);
    let cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, config.maxAgeSeconds)) {
      performanceMetrics.cacheHits++;
      return addSecurityHeaders(cachedResponse);
    }
    
    // Fetch from network with timeout
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.status === 200) {
      const responseToCache = addTimestamp(networkResponse.clone());
      await cache.put(request, responseToCache);
      await enforceMaxEntries(cache, config.maxEntries);
    }
    
    performanceMetrics.networkRequests++;
    return addSecurityHeaders(networkResponse);
    
  } catch (error) {
    // Serve stale content if available
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    
    if (staleResponse) {
      performanceMetrics.cacheHits++;
      return addSecurityHeaders(staleResponse);
    }
    
    performanceMetrics.cacheMisses++;
    throw error;
  }
}

async function networkFirstWithBackgroundUpdate(request, cacheName, config) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetchWithTimeout(request, 3000);
    
    if (networkResponse.status === 200) {
      // Update cache in background
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache).then(() => {
        enforceMaxEntries(cache, config.maxEntries);
      });
    }
    
    performanceMetrics.networkRequests++;
    return addSecurityHeaders(networkResponse);
    
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return addSecurityHeaders(cachedResponse);
    }
    
    performanceMetrics.cacheMisses++;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName, config) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const fetchPromise = fetchWithTimeout(request, 5000)
    .then(async (networkResponse) => {
      if (networkResponse.status === 200) {
        const responseToCache = addTimestamp(networkResponse.clone());
        await cache.put(request, responseToCache);
        await enforceMaxEntries(cache, config.maxEntries);
      }
      return networkResponse;
    })
    .catch(() => cachedResponse); // Return cached on network failure
  
  if (cachedResponse && !isExpired(cachedResponse, config.maxAgeSeconds)) {
    performanceMetrics.cacheHits++;
    // Start background update
    fetchPromise;
    return addSecurityHeaders(cachedResponse);
  }
  
  // Wait for network if no cache or cache expired
  const response = await fetchPromise;
  performanceMetrics.networkRequests++;
  return addSecurityHeaders(response);
}

async function rateLimitedNetworkFirst(request, cacheName, config) {
  const clientId = request.headers.get('X-Client-ID') || 'anonymous';
  
  // Check rate limit
  if (!checkRateLimit(clientId)) {
    const cachedResponse = await caches.open(cacheName).then(cache => cache.match(request));
    if (cachedResponse) {
      return addSecurityHeaders(cachedResponse);
    }
    
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter: 60 }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const responseToCache = addTimestamp(networkResponse.clone());
      await cache.put(request, responseToCache);
      await enforceMaxEntries(cache, config.maxEntries);
    }
    
    performanceMetrics.networkRequests++;
    return addSecurityHeaders(networkResponse);
    
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return addSecurityHeaders(cachedResponse);
    }
    
    performanceMetrics.cacheMisses++;
    throw error;
  }
}

async function networkFirstWithSmartFallback(request, cacheName) {
  try {
    const networkResponse = await fetchWithTimeout(request, 3000);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const responseToCache = addTimestamp(networkResponse.clone());
      await cache.put(request, responseToCache);
    }
    
    performanceMetrics.networkRequests++;
    return addSecurityHeaders(networkResponse);
    
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return addSecurityHeaders(cachedResponse);
    }
    
    // Serve offline page for HTML requests
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return addSecurityHeaders(offlineResponse);
    }
    
    performanceMetrics.cacheMisses++;
    return createOfflineResponse();
  }
}

async function networkWithCacheBackup(request, cacheName) {
  try {
    const networkResponse = await fetchWithTimeout(request, 4000);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const responseToCache = addTimestamp(networkResponse.clone());
      await cache.put(request, responseToCache);
    }
    
    performanceMetrics.networkRequests++;
    return addSecurityHeaders(networkResponse);
    
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return addSecurityHeaders(cachedResponse);
    }
    
    performanceMetrics.cacheMisses++;
    throw error;
  }
}

// Utility functions

function isStaticAsset(pathname) {
  return /\.(js|css|woff2|svg|ico)$/.test(pathname) || 
         pathname === '/manifest.json';
}

function isImageAsset(pathname) {
  return /\.(png|jpg|jpeg|gif|webp)$/.test(pathname);
}

function isExternalAPI(hostname) {
  return ['api.esv.org', 'bible-api.com'].includes(hostname);
}

async function fetchWithTimeout(request, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

function isExpired(response, maxAgeSeconds) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  
  const age = Date.now() - parseInt(cachedAt);
  return age > (maxAgeSeconds * 1000);
}

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

function checkRateLimit(clientId) {
  const now = Date.now();
  const clientLimits = rateLimits.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > clientLimits.resetTime) {
    clientLimits.count = 1;
    clientLimits.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    clientLimits.count++;
  }
  
  rateLimits.set(clientId, clientLimits);
  
  return clientLimits.count <= MAX_REQUESTS_PER_WINDOW;
}

async function enforceMaxEntries(cache, maxEntries) {
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const entriesToDelete = keys.length - maxEntries;
    const keysToDelete = keys.slice(0, entriesToDelete);
    
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

function createErrorResponse(request) {
  const isHTML = request.headers.get('Accept')?.includes('text/html');
  
  if (isHTML) {
    return createOfflineResponse();
  }
  
  return new Response(
    JSON.stringify({ error: 'Service unavailable' }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
    }
  );
}

function createOfflineResponse() {
  return new Response(
    `<!DOCTYPE html>
    <html><head><title>Offline - Bible Explorer</title>
    <style>body{font-family:Arial,sans-serif;text-align:center;padding:50px}
    .offline{color:#666}h1{color:#333}</style></head>
    <body><h1>You're Offline</h1>
    <p class="offline">This content isn't available offline yet.</p>
    <button onclick="window.location.reload()">Try Again</button></body></html>`,
    { 
      status: 503,
      headers: { 'Content-Type': 'text/html', ...SECURITY_HEADERS }
    }
  );
}

// Background optimization and maintenance
async function optimizeCaches() {
  console.log('[SW] Running cache optimization...');
  
  try {
    // Clean up expired entries
    for (const cacheName of Object.values(CACHES)) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const response = await cache.match(key);
        const config = CACHE_CONFIGS[cacheName.split('-')[2]] || CACHE_CONFIGS.dynamic;
        
        if (isExpired(response, config.maxAgeSeconds)) {
          await cache.delete(key);
        }
      }
    }
    
    console.log('[SW] Cache optimization complete');
  } catch (error) {
    console.error('[SW] Cache optimization failed:', error);
  }
}

async function initializePerformanceTracking() {
  // Reset metrics on new install
  Object.keys(performanceMetrics).forEach(key => {
    performanceMetrics[key] = 0;
  });
}

// Message handling for performance stats and control
self.addEventListener('message', event => {
  const { data } = event;
  
  if (data.type === 'GET_PERFORMANCE_STATS') {
    const hitRate = performanceMetrics.totalRequests > 0 
      ? (performanceMetrics.cacheHits / performanceMetrics.totalRequests * 100).toFixed(2)
      : 0;
    
    event.ports[0].postMessage({
      ...performanceMetrics,
      hitRate: `${hitRate}%`,
      version: VERSION
    });
  }
  
  if (data.type === 'CLEAR_CACHES') {
    Promise.all(Object.values(CACHES).map(name => caches.delete(name)))
      .then(() => event.ports[0].postMessage({ success: true }))
      .catch(error => event.ports[0].postMessage({ error: error.message }));
  }
  
  if (data.type === 'OPTIMIZE_CACHES') {
    optimizeCaches()
      .then(() => event.ports[0].postMessage({ success: true }))
      .catch(error => event.ports[0].postMessage({ error: error.message }));
  }
});

// Background sync for future features
self.addEventListener('sync', event => {
  if (event.tag === 'background-optimize') {
    event.waitUntil(optimizeCaches());
  }
});

// Periodic cache optimization (every 6 hours)
setInterval(optimizeCaches, 6 * 60 * 60 * 1000);

console.log(`[SW] Enhanced Service Worker v${VERSION} loaded with intelligent caching strategies`);