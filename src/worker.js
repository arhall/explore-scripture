/**
 * Cloudflare Worker for Explore Scripture
 * Enhanced edge computing with KV storage, analytics, and smart caching
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Simple router implementation (lightweight alternative to itty-router)
class Router {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
    return this;
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
    return this;
  }

  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = this.matchPath(route.path, url.pathname);
      if (match) {
        request.params = match.params;
        return await route.handler(request, env, ctx);
      }
    }

    // No route matched, return 404
    return new Response('Not Found', { status: 404 });
  }

  matchPath(pattern, pathname) {
    // Simple path matching with parameters
    const patternParts = pattern.split('/');
    const pathParts = pathname.split('/');

    if (patternParts.length !== pathParts.length && !pattern.includes('*')) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Parameter
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart === '*') {
        // Wildcard - match rest
        return { params };
      } else if (patternPart !== pathPart) {
        return null;
      }
    }

    return { params };
  }
}

// Initialize router
const router = new Router();

// Constants
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400', // 24 hours
  'CDN-Cache-Control': 'public, max-age=31536000', // 1 year for CDN
  Vary: 'Accept-Encoding',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Book name mappings for API compatibility
const BOOK_MAPPINGS = {
  '1-chronicles': '1+Chronicles',
  '2-chronicles': '2+Chronicles',
  '1-corinthians': '1+Corinthians',
  '2-corinthians': '2+Corinthians',
  '1-john': '1+John',
  '2-john': '2+John',
  '3-john': '3+John',
  '1-kings': '1+Kings',
  '2-kings': '2+Kings',
  '1-peter': '1+Peter',
  '2-peter': '2+Peter',
  '1-samuel': '1+Samuel',
  '2-samuel': '2+Samuel',
  '1-thessalonians': '1+Thessalonians',
  '2-thessalonians': '2+Thessalonians',
  '1-timothy': '1+Timothy',
  '2-timothy': '2+Timothy',
  'song-of-songs': 'Song+of+Songs',
};

// Only handle API Routes - let static files pass through to Wrangler's static serving
router.get('/api/search', handleSearch);
router.get('/api/entities/:id', handleEntity);
router.get('/api/books/:book/chapters/:chapter', handleChapter);
router.get('/api/scripture/:reference', handleScripture);

/**
 * Main request handler
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Add request to analytics
  recordAnalytics(env, request, url);

  // Only handle API routes - let static files pass through
  if (url.pathname.startsWith('/api/')) {
    // Handle CORS for API requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      const response = await router.handle(request, env, ctx);

      // Create new headers object with security headers
      const newHeaders = new Headers(response.headers);
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      // Add CSP header
      if (env.CSP_HEADER) {
        newHeaders.set('Content-Security-Policy', env.CSP_HEADER);
      }

      // Create new response with combined headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('API Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: SECURITY_HEADERS,
      });
    }
  }

  // For non-API routes, serve static assets using legacy method
  try {
    // Check if __STATIC_CONTENT is available
    if (!env.__STATIC_CONTENT) {
      console.error('__STATIC_CONTENT not available');
      return new Response('Static content not configured', { status: 500 });
    }

    return await getAssetFromKV(
      {
        request,
        waitUntil(promise) {
          return ctx.waitUntil(promise);
        },
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: JSON.parse(__STATIC_CONTENT_MANIFEST),
        mapRequestToAsset: req => {
          // Handle directory requests by looking for index.html
          const url = new URL(req.url);
          if (url.pathname.endsWith('/')) {
            return new Request(`${url.origin}${url.pathname}index.html`, req);
          }
          return req;
        },
      }
    );
  } catch (error) {
    console.error('Static asset error:', error);
    console.error('Request URL:', request.url);
    console.error('__STATIC_CONTENT available:', !!env.__STATIC_CONTENT);
    console.error(
      'Manifest keys available:',
      env.__STATIC_CONTENT ? Object.keys(JSON.parse(__STATIC_CONTENT_MANIFEST)).slice(0, 5) : 'none'
    );
    return new Response(`Asset not found: ${request.url}`, { status: 404 });
  }
}

/**
 * Handle search API requests
 */
async function handleSearch(request, env) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const type = url.searchParams.get('type') || 'all';

  if (!query || query.length < 1) {
    return new Response(JSON.stringify({ error: 'Query required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
    });
  }

  const cacheKey = `search:${type}:${encodeURIComponent(query)}`;

  // Check KV cache
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        ...CACHE_HEADERS,
        ...SECURITY_HEADERS,
      },
    });
  }

  // Load search data and perform search
  const searchData = await loadSearchData(env, request);
  const results = performSearch(searchData, query, type);

  const response = JSON.stringify(results);

  // Cache results for 1 hour
  await env.CACHE.put(cacheKey, response, { expirationTtl: 3600 });

  return new Response(response, {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
      ...CACHE_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * Handle entity API requests
 */
async function handleEntity(request, env) {
  const entityId = request.params.id;

  if (!entityId || !entityId.match(/^[a-z0-9\-\.]+$/)) {
    return new Response('Invalid entity ID', {
      status: 400,
      headers: SECURITY_HEADERS,
    });
  }

  // Try KV storage first
  const entityData = await env.ENTITIES.get(`entity:${entityId}`);

  if (entityData) {
    return new Response(entityData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        ...CACHE_HEADERS,
        ...SECURITY_HEADERS,
      },
    });
  }

  // Fallback to static file
  const originUrl = new URL(request.url).origin;
  const entityFile = await fetch(`${originUrl}/assets/data/entities/${entityId}.json`);

  if (!entityFile.ok) {
    return new Response('Entity not found', {
      status: 404,
      headers: SECURITY_HEADERS,
    });
  }

  const data = await entityFile.text();

  // Cache in KV for future requests
  await env.ENTITIES.put(`entity:${entityId}`, data, { expirationTtl: 86400 });

  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
      ...CACHE_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * Handle chapter API requests with external Scripture API integration
 */
async function handleChapter(request, env) {
  const { book, chapter } = request.params;
  const translation = new URL(request.url).searchParams.get('translation') || 'ESV';

  // Validate inputs
  if (!book || !chapter || !chapter.match(/^\d+$/)) {
    return new Response('Invalid book or chapter', {
      status: 400,
      headers: SECURITY_HEADERS,
    });
  }

  const mappedBook = BOOK_MAPPINGS[book] || book.replace(/-/g, '+');
  const cacheKey = `chapter:${mappedBook}:${chapter}:${translation}`;

  // Check cache
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        ...CACHE_HEADERS,
        ...SECURITY_HEADERS,
      },
    });
  }

  // Fetch from ESV API or Bible Gateway
  let scriptureData;
  try {
    if (translation === 'ESV') {
      scriptureData = await fetchESVChapter(mappedBook, chapter, env);
    } else {
      scriptureData = await fetchBibleGatewayChapter(mappedBook, chapter, translation);
    }
  } catch (error) {
    console.error('Scripture fetch error:', error);
    return new Response('Scripture service unavailable', {
      status: 503,
      headers: SECURITY_HEADERS,
    });
  }

  const response = JSON.stringify(scriptureData);

  // Cache for 24 hours
  await env.CACHE.put(cacheKey, response, { expirationTtl: 86400 });

  return new Response(response, {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
      ...CACHE_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * Handle static assets with smart caching
 */
async function handleAssets(request, env) {
  const url = new URL(request.url);
  const assetPath = url.pathname;

  // Security check - prevent directory traversal
  if (assetPath.includes('..') || assetPath.includes('//')) {
    return new Response('Forbidden', {
      status: 403,
      headers: SECURITY_HEADERS,
    });
  }

  // Determine content type
  const contentType = getContentType(assetPath);

  // Check if it's a data file that should be cached in KV
  if (assetPath.includes('/data/')) {
    const cacheKey = `asset:${assetPath}`;
    const cached = await env.CACHE.get(cacheKey);

    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': contentType,
          'X-Cache': 'HIT',
          ...CACHE_HEADERS,
          ...SECURITY_HEADERS,
        },
      });
    }
  }

  // Fetch from origin (Pages)
  const originResponse = await fetch(request);

  if (!originResponse.ok) {
    return new Response('Asset not found', {
      status: 404,
      headers: SECURITY_HEADERS,
    });
  }

  // Clone response to cache
  const responseBody = await originResponse.text();

  // Cache data files in KV
  if (assetPath.includes('/data/') && contentType === 'application/json') {
    const cacheKey = `asset:${assetPath}`;
    await env.CACHE.put(cacheKey, responseBody, { expirationTtl: 86400 });
  }

  return new Response(responseBody, {
    headers: {
      'Content-Type': contentType,
      'X-Cache': 'MISS',
      ...CACHE_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * Handle page routes with server-side rendering enhancements
 */
async function handleEntityPage(request, env) {
  const entityId = request.params.id;

  // Pre-fetch entity data for faster page load
  const entityData = await env.ENTITIES.get(`entity:${entityId}`);

  if (entityData) {
    // Entity exists, fetch the page
    const pageResponse = await fetch(request);

    if (pageResponse.ok) {
      let html = await pageResponse.text();

      // Inject entity data for faster client-side rendering
      html = html.replace(
        '<script>',
        `<script>window.preloadedEntity = ${entityData};</script><script>`
      );

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          ...CACHE_HEADERS,
          ...SECURITY_HEADERS,
        },
      });
    }
  }

  // Default handling
  return fetch(request);
}

/**
 * Utility functions
 */

async function loadSearchData(env, request) {
  const cacheKey = 'search-data';
  let searchData = await env.CACHE.get(cacheKey);

  if (!searchData) {
    // Load from static assets using the request origin
    const originUrl = new URL(request.url).origin;
    const [books, categories, entities] = await Promise.all([
      fetch(`${originUrl}/assets/data/books.json`).then(r => r.json()),
      fetch(`${originUrl}/assets/data/categories.json`).then(r => r.json()),
      fetch(`${originUrl}/assets/data/entities-search.json`).then(r => r.json()),
    ]);

    searchData = { books, categories, entities };

    // Cache for 6 hours
    await env.CACHE.put(cacheKey, JSON.stringify(searchData), { expirationTtl: 21600 });
  } else {
    searchData = JSON.parse(searchData);
  }

  return searchData;
}

function performSearch(searchData, query, type) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // Search books
  if (type === 'all' || type === 'books') {
    searchData.books?.forEach(book => {
      if (book.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'book',
          text: book.name,
          url: `/books/${book.slug}/`,
          subtitle: book.testament,
        });
      }
    });
  }

  // Search entities
  if (type === 'all' || type === 'entities') {
    searchData.entities?.forEach(entity => {
      if (entity.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'entity',
          text: entity.name,
          url: entity.url,
          subtitle: entity.type,
        });
      }
    });
  }

  return results.slice(0, 8); // Limit results
}

function getContentType(path) {
  const extension = path.split('.').pop().toLowerCase();
  const types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    woff2: 'font/woff2',
    woff: 'font/woff',
    ttf: 'font/ttf',
  };
  return types[extension] || 'text/plain';
}

async function fetchESVChapter(book, chapter, env) {
  // Implement ESV API integration
  const apiKey = env.ESV_API_KEY;
  if (!apiKey) {
    throw new Error('ESV API key not configured');
  }

  const response = await fetch(`https://api.esv.org/v3/passage/text/?q=${book}+${chapter}`, {
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`ESV API error: ${response.status}`);
  }

  return response.json();
}

async function fetchBibleGatewayChapter(book, chapter, translation) {
  // Implement Bible Gateway fallback
  const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(book)}+${chapter}&version=${translation}&interface=print`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bible Gateway error: ${response.status}`);
  }

  const html = await response.text();
  // Parse HTML to extract chapter text (implement HTML parsing logic)
  return { passages: [html], reference: `${book} ${chapter}` };
}

function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...SECURITY_HEADERS,
    },
  });
}

function recordAnalytics(env, request, url) {
  // Record page view in Analytics Engine
  if (env.BIBLE_ANALYTICS) {
    env.BIBLE_ANALYTICS.writeDataPoint({
      blobs: [request.method, url.pathname],
      doubles: [Date.now()],
      indexes: [request.cf?.country || 'unknown'],
    });
  }
}

// Removed unused handlers - static files served by Wrangler's ASSETS

async function handleScripture(request, env) {
  const reference = request.params.reference;
  // Implement scripture lookup
  return new Response(JSON.stringify({ reference, text: 'Scripture text here' }), {
    headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
  });
}

// Removed - static assets handled by Wrangler's ASSETS

// Export the main handler
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
};
