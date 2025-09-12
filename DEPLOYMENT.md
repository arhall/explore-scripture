# Deployment Guide

## Quick Commands Summary

### Local Development & Testing
```bash
# Build and serve locally
npm run dev                     # Start development with live reload

# Manual build process  
npm run build                   # Full production build
npm run build:analyze           # Build with performance analysis

# Run tests locally
npm run test:setup              # One-time: setup test environment
npm run test:selenium           # Run all Selenium tests  
npm run test:smoke              # Quick smoke tests only
```

### Production Deployment
```bash
# Deploy to production
npm run build                   # Build first
wrangler pages deploy _site     # Deploy to Cloudflare Pages

# Quick deploy (combines both)
npm run build && wrangler pages deploy _site
```

---

## Production Deployment (Cloudflare Pages)

The site is deployed to **https://explore-scripture.pages.dev** using Cloudflare Pages.

### Automatic Deployment
- ✅ Connected to GitHub repository
- ✅ Automatic builds on push to `main` branch  
- ✅ Build command: `npm run build`
- ✅ Output directory: `_site`

### Manual Deployment
```bash
# 1. Build the site with all optimizations
npm run build:production       # Full build with logging and analysis

# 2. Deploy to Cloudflare Pages (preferred method)
wrangler pages deploy _site

# Alternative: Deploy with specific project name
wrangler pages deploy _site --project-name=explore-scripture
```

### Deployment Verification
```bash
# Check deployment status
wrangler pages deployment list

# View deployment logs
wrangler pages deployment tail
```

---

## Local Development Setup

### Initial Setup (One-time)
```bash
# 1. Install dependencies
npm install

# 2. Setup test environment
npm run test:setup

# 3. Create local test configuration
cp .env.test.example .env.test.local

# 4. Edit .env.test.local for your local setup:
#    EXPLORE_SCRIPTURE_LOCAL=true
#    LOCAL_BASE_URL=http://localhost:8080
```

### Development Commands
```bash
# Start local development server with live reload
npm run dev
# → Runs entities processing, search generation, and Eleventy serve
# → Available at http://localhost:8080

# Manual development build
npm run build:fast             # Quick build for development
npm run build                  # Full production build
npm run build:analyze          # Build with performance analysis

# Development utilities
npm run clean                  # Clean build artifacts
npm run clean:all              # Clean everything including node_modules
```

### Development Workflow
1. **Start development**: `npm run dev`
2. **Make changes** to files in `src/`
3. **Auto-reload** happens automatically
4. **Test locally** before deploying
5. **Deploy** when ready: `wrangler pages deploy _site`

---

## Testing Framework

### Test Environment Setup
```bash
# One-time setup (creates Python virtual environment)
npm run test:setup

# Verify environment configuration
source test-env/bin/activate && python -m pytest tests/test_env_config.py -v
```

### Running Tests

#### Local Testing (default with .env.test.local)
```bash
# All Selenium tests against local development server
npm run test:selenium

# Quick smoke tests
npm run test:smoke

# Specific test categories
npm run test:ios               # iOS Safari tests
npm run test:mobile            # Mobile-specific tests  
npm run test:entities          # Entity system tests
```

#### Production Testing
```bash
# Test against production (override local setting)
EXPLORE_SCRIPTURE_LOCAL=false npm run test:selenium

# Or temporarily edit .env.test.local:
# EXPLORE_SCRIPTURE_LOCAL=false
```

### Test Configuration

Tests automatically use configuration from `.env.test.local`:

```bash
# Local development testing (default)
EXPLORE_SCRIPTURE_LOCAL=true
LOCAL_BASE_URL=http://localhost:8080

# Production testing  
EXPLORE_SCRIPTURE_LOCAL=false
PRODUCTION_BASE_URL=https://explore-scripture.pages.dev

# Browser settings
HEADLESS=false                 # Show browser during tests
BROWSER_WIDTH=1280
BROWSER_HEIGHT=720

# Timeouts
TEST_TIMEOUT=30000            # 30 seconds
PAGE_LOAD_TIMEOUT=10000       # 10 seconds
```

---

## Build System

### Build Types
```bash
# Development build (fastest)
npm run build:fast             # Skip entity processing, quick search data

# Standard build
npm run build                  # Full entity processing + search generation + Eleventy

# Production build (most comprehensive)  
npm run build:production       # Full build + performance analysis + detailed logs

# Analysis build
npm run build:analyze          # Existing build + performance analysis only
```

### Build Process Details
1. **Entity Processing** (`npm run entities:process`)
   - Processes 5,514+ biblical entities
   - Generates entity pages and search indices
   - Creates cross-reference mappings

2. **Search Data Generation** (`npm run search:generate`)
   - Creates unified search index
   - Generates per-book entity data
   - Optimizes search performance

3. **Static Site Generation** (`eleventy`)
   - Processes Nunjucks templates
   - Generates 186+ static pages
   - Optimizes HTML/CSS/JS

### Performance Monitoring
```bash
# View build logs with performance data
npm run logs:analyze           # Analyze most recent build

# Build logs stored in:
ls build-logs/                 # Detailed performance reports
```

---

## Environment Configuration

### Local Files (Not Committed)
- **`.env.test.local`** - Your personal test configuration
- **`wrangler.local.toml`** - Local Cloudflare configuration  
- **`.wrangler/`** - Wrangler cache directory
- **`test-env/`** - Python virtual environment
- **`build-logs/`** - Build performance logs

### Shared Configuration (Committed)
- **`.env.test.example`** - Template for test configuration
- **`wrangler.toml`** - Production Cloudflare configuration (uses environment variables)
- **`tests/config.py`** - Centralized test URL management
- **`pytest.ini`** - Test framework configuration

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
npm run clean && npm run build

# Check for missing dependencies
npm install

# View detailed build logs
npm run build:analyze
```

#### Test Failures
```bash
# Verify environment configuration
source test-env/bin/activate && python -m pytest tests/test_env_config.py -v

# Check if local server is running
curl http://localhost:8080

# Reinstall test dependencies
npm run clean:all && npm install && npm run test:setup
```

#### Deployment Issues
```bash
# Check Wrangler authentication
wrangler whoami

# Login if needed
wrangler login

# Verify project configuration
wrangler pages project list
```

### Debug Mode
```bash
# Enable debug logging for development
DEBUG=true npm run dev

# Enable debug mode for tests
DEBUG=true npm run test:selenium
```

---

## Security Best Practices

### What's Protected (Not Committed)
- Cloudflare account IDs and API tokens
- KV namespace IDs  
- Local development configurations
- Test environment credentials
- Build artifacts and temporary files

### What's Public (Committed)
- Public URLs and endpoints
- Example configurations and templates  
- Build scripts and deployment automation
- Documentation and guides

### Security Checklist
- ✅ Sensitive data in environment variables
- ✅ Local config files in `.gitignore`
- ✅ CSP headers configured
- ✅ XSS protection enabled
- ✅ HTTPS enforced

---

## Performance Optimization

### Build Optimization
- **Entity Processing**: Batched processing of 5,514 entities in optimized chunks
- **Search Generation**: Efficient indexing with 607+ entities/second processing
- **Static Generation**: 186 pages built in ~4 seconds
- **Asset Optimization**: CSS/JS minification and compression

### Monitoring
```bash
# Performance analysis
npm run build:analyze          # Detailed build performance
npm run logs:analyze           # Review recent build logs

# Lighthouse testing
npm run test:lighthouse        # Web performance testing
```

---

## Related Documentation

- **[README.md](./README.md)** - Project overview and features
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive technical documentation  
- **[SCALABILITY.md](./SCALABILITY.md)** - Performance and scaling details
- **[tests/README.md](./tests/README.md)** - Detailed testing guide

## Support

For deployment issues or questions:
1. Check this documentation first
2. Review error logs in `build-logs/`
3. Test locally with `npm run dev`
4. Verify configuration with `npm run test:env`