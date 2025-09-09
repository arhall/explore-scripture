# Explore Scripture → Cloudflare Workers Migration Guide

This guide walks you through migrating the Explore Scripture static site to Cloudflare Workers for enhanced performance, global distribution, and edge computing capabilities.

## 🎯 Migration Overview

The migration transforms Explore Scripture from a pure static site to a hybrid edge-computing application that combines static assets with dynamic Workers functionality:

- **Static assets** served from Cloudflare Pages
- **API endpoints** powered by Cloudflare Workers
- **Data storage** using Cloudflare KV for instant global access
- **Caching** at the edge for sub-millisecond performance
- **Analytics** with Cloudflare Analytics Engine

## 📋 Prerequisites

1. **Cloudflare Account** with Workers plan
2. **Node.js** 18+ and npm
3. **Wrangler CLI** installed globally
4. **Git** for version control

```bash
npm install -g wrangler
```

## 🚀 Step-by-Step Migration

### 1. Setup & Authentication

```bash
# Clone or navigate to your Explore Scripture repository
cd explore-scripture

# Install new dependencies
npm install

# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 2. Configure Your Account

Edit `wrangler.toml` with your Cloudflare account details:

```toml
name = "bible-explorer"
account_id = "your-cloudflare-account-id"  # Get from Cloudflare dashboard
```

### 3. Create KV Namespaces

```bash
# Create production KV namespaces
wrangler kv:namespace create CACHE
wrangler kv:namespace create ENTITIES

# Create preview KV namespaces
wrangler kv:namespace create CACHE --preview
wrangler kv:namespace create ENTITIES --preview
```

Update `wrangler.toml` with the returned namespace IDs:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-cache-namespace-id"
preview_id = "your-cache-preview-namespace-id"

[[kv_namespaces]]
binding = "ENTITIES"
id = "your-entities-namespace-id"
preview_id = "your-entities-preview-namespace-id"
```

### 4. Build & Deploy

```bash
# Build for Workers deployment
npm run build:workers

# Upload data to KV storage
npm run workers:kv:upload

# Deploy to Cloudflare Workers
npm run workers:deploy
```

### 5. Verify Deployment

Test your deployment:

```bash
# Test the main site
curl https://bible-explorer.your-subdomain.workers.dev/

# Test API endpoints
curl https://bible-explorer.your-subdomain.workers.dev/api/search?q=david

# Test entity lookup
curl https://bible-explorer.your-subdomain.workers.dev/api/entities/p.david.king-israel--8e4b2a1c
```

## 🏗️ Architecture Overview

### Workers Components

1. **Main Worker** (`src/worker.js`)
   - Handles all incoming requests
   - Routes API calls and static assets
   - Implements caching strategies
   - Adds security headers

2. **Routing System**
   - `/api/search` - Search across books, entities, categories
   - `/api/entities/:id` - Individual entity data
   - `/api/books/:book/chapters/:chapter` - Scripture content
   - `/assets/*` - Static assets with edge caching
   - `/*` - Page routing for the main site

3. **KV Storage**
   - **ENTITIES namespace**: 5,500+ biblical entity records
   - **CACHE namespace**: Search indices, book data, API responses

4. **Edge Caching**
   - Static assets: 1 year
   - Entity data: 24 hours
   - Search results: 1 hour
   - API responses: 5 minutes

### Performance Benefits

- **Global Distribution**: Content served from 300+ edge locations
- **Sub-millisecond Lookups**: Entity data cached at the edge
- **Smart Preloading**: Related entities preloaded automatically
- **Reduced Origin Load**: 90%+ cache hit rate expected

## 🔧 Configuration Options

### Environment Variables

Add these to your `wrangler.toml`:

```toml
[env.production.vars]
ESV_API_KEY = "your-esv-api-key"  # Optional: for ESV Scripture API
ANALYTICS_TOKEN = "your-analytics-token"  # Optional: for enhanced analytics
```

### Custom Domain

To use a custom domain:

1. Add domain to Cloudflare
2. Create a Worker route:

```toml
[[routes]]
pattern = "bible.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### Analytics Setup

Enable Analytics Engine in `wrangler.toml`:

```toml
[analytics_engine_datasets]
[[analytics_engine_datasets.bindings]]
name = "BIBLE_ANALYTICS"
dataset = "bible_explorer_analytics"
```

## 📊 Monitoring & Analytics

### Built-in Metrics

The Workers deployment includes:

- **Page views** and user sessions
- **Search queries** and popular results  
- **Entity access** patterns
- **API response times**
- **Cache hit rates**

### Accessing Analytics

View analytics in the Cloudflare dashboard:
1. Go to Analytics & Logs > Analytics Engine
2. Query your datasets for insights
3. Create custom dashboards

## 🛠️ Development Workflow

### Local Development

```bash
# Start local Workers development server
npm run workers:dev

# This starts the Workers runtime at http://localhost:8787
```

### Testing Changes

```bash
# Build and test locally
npm run build:workers
wrangler dev --local

# Deploy to preview environment
wrangler deploy --env preview
```

### Updating Data

When you update entity data or search indices:

```bash
# Rebuild data files
npm run entities:process
npm run search:generate

# Build for Workers
npm run build:workers

# Upload updated data to KV
npm run workers:kv:upload

# Deploy updated Worker
npm run workers:deploy
```

## 🔐 Security Features

The Workers deployment includes:

- **Content Security Policy** (CSP) headers
- **XSS protection** headers
- **HTTPS enforcement**
- **Input validation** on all API endpoints
- **Rate limiting** (via Cloudflare)
- **DDoS protection** (via Cloudflare)

## 💰 Cost Optimization

### KV Storage Usage

- **5,500 entities**: ~50MB storage
- **Search indices**: ~10MB storage
- **Total storage**: ~60MB (well under free tier limits)

### Workers Requests

Free tier includes 100,000 requests/day:
- Typical site: 1,000-10,000 requests/day
- Large site: 50,000-100,000 requests/day
- Enterprise: Paid plan recommended

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   wrangler login
   wrangler whoami  # Verify authentication
   ```

2. **KV Upload Failures**
   ```bash
   # Check namespace configuration
   wrangler kv:namespace list
   
   # Verify data files exist
   ls -la _site/assets/data/
   ```

3. **Deployment Errors**
   ```bash
   # Check wrangler.toml syntax
   wrangler validate
   
   # View deployment logs
   wrangler tail
   ```

4. **Performance Issues**
   ```bash
   # Check KV usage
   wrangler kv:key list --binding=ENTITIES
   
   # Monitor cache hit rates in dashboard
   ```

### Getting Help

- **Cloudflare Community**: https://community.cloudflare.com/
- **Workers Discord**: https://discord.gg/cloudflaredev  
- **Documentation**: https://developers.cloudflare.com/workers/

## 📈 Performance Comparison

| Metric | Static Site | Workers Deployment |
|--------|-------------|-------------------|
| Global distribution | Pages only | Pages + Workers |
| Entity lookup | Client-side only | Edge KV (sub-ms) |
| Search performance | Client processing | Pre-indexed + cached |
| API responses | External only | Edge + external |
| Cache hit rate | ~70% | ~95% |
| TTFB (avg) | 200-500ms | 50-150ms |

## 🎉 Next Steps

After successful migration:

1. **Monitor performance** in Cloudflare dashboard
2. **Set up alerts** for errors or performance degradation  
3. **Optimize caching** based on usage patterns
4. **Implement A/B testing** for new features
5. **Add more API endpoints** as needed
6. **Scale KV storage** for additional data

## 🤝 Contributing

To contribute to the Workers implementation:

1. Fork the repository
2. Create a feature branch
3. Test locally with `npm run workers:dev`
4. Submit a pull request

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [KV Storage Guide](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Custom Router Implementation](src/worker.js) - Lightweight routing built-in
- [Workers Examples](https://developers.cloudflare.com/workers/examples/)

---

## Migration Checklist

- [ ] Cloudflare account setup
- [ ] Wrangler CLI installed and authenticated
- [ ] `wrangler.toml` configured with account ID
- [ ] KV namespaces created and configured
- [ ] Dependencies installed (`npm install`)
- [ ] Project built (`npm run build:workers`)
- [ ] Data uploaded to KV (`npm run workers:kv:upload`)
- [ ] Worker deployed (`npm run workers:deploy`)
- [ ] Deployment tested and verified
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled and monitored
- [ ] Performance optimized based on usage

Welcome to the edge! 🚀