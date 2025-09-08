// Cloudflare Worker for Bible Explorer
// Advanced caching and optimization

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const cache = caches.default;
  
  // API endpoint caching
  if (url.pathname.startsWith('/api/')) {
    return handleAPIRequest(request, cache);
  }
  
  // Search optimization
  if (url.pathname.includes('search')) {
    return handleSearchRequest(request, cache);
  }
  
  // Entity page optimization
  if (url.pathname.startsWith('/entities/')) {
    return handleEntityRequest(request, cache);
  }
  
  // Default handling
  return fetch(request);
}

async function handleAPIRequest(request, cache) {
  const cacheKey = new Request(request.url, request);
  let response = await cache.match(cacheKey);
  
  if (!response) {
    response = await fetch(request);
    
    if (response.ok) {
      // Cache API responses for 5 minutes
      const responseToCache = response.clone();
      responseToCache.headers.set('Cache-Control', 'public, max-age=300');
      await cache.put(cacheKey, responseToCache);
    }
  }
  
  return response;
}

async function handleSearchRequest(request, cache) {
  // Implement search result caching and preloading
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  
  if (query && query.length > 2) {
    // Cache search results for popular queries
    const cacheKey = `search-${encodeURIComponent(query)}`;
    let cached = await cache.match(cacheKey);
    
    if (cached) {
      return cached;
    }
  }
  
  return fetch(request);
}

async function handleEntityRequest(request, cache) {
  // Preload related entities
  const response = await fetch(request);
  
  if (response.ok) {
    // Extract entity relationships and preload them
    const entityData = await response.clone().json();
    
    if (entityData.relations) {
      // Background preload of related entities
      Object.values(entityData.relations).flat().forEach(relatedId => {
        const relatedUrl = `/assets/data/entities/${relatedId}.json`;
        fetch(relatedUrl).then(r => {
          if (r.ok) {
            cache.put(relatedUrl, r.clone());
          }
        }).catch(() => {}); // Silent fail for preloading
      });
    }
  }
  
  return response;
}