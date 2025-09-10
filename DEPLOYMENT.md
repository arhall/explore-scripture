# Deployment Guide

## Production Deployment (Cloudflare Pages)

The site is deployed to **https://explore-scripture.pages.dev** using Cloudflare
Pages.

### Automatic Deployment

- Connected to GitHub repository
- Automatic builds on push to `main` branch
- Build command: `npm run build`
- Output directory: `_site`

### Manual Deployment

```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy _site --project-name=explore-scripture
```

## Local Development

### Environment Setup

1. Copy test configuration:

   ```bash
   cp .env.test.example .env.test.local
   ```

2. For local testing, set in `.env.test.local`:
   ```
   EXPLORE_SCRIPTURE_LOCAL=true
   ```

### Development Commands

```bash
# Start local development server
npm run dev
# Runs at http://localhost:8080

# Run tests against local server
EXPLORE_SCRIPTURE_LOCAL=true npm test

# Run tests against production
npm test
```

## Configuration Files

### Sensitive Information

- `wrangler.local.toml` - Local Cloudflare configuration (not committed)
- `.env.test.local` - Local test configuration (not committed)
- `.wrangler/` - Wrangler cache and temporary files (not committed)

### Public Configuration

- `wrangler.toml` - Uses environment variables for sensitive data
- `.env.test.example` - Example test configuration
- `tests/config.py` - Centralized test URL configuration

## Testing

### URL Configuration

Tests automatically use:

- **Production URL**: `https://explore-scripture.pages.dev` (default)
- **Local URL**: `http://localhost:8080` (when `EXPLORE_SCRIPTURE_LOCAL=true`)

### Environment Variables

- `EXPLORE_SCRIPTURE_LOCAL=true` - Use local development server
- `LOCAL_BASE_URL` - Override local URL (default: http://localhost:8080)
- `PRODUCTION_BASE_URL` - Override production URL (default:
  https://explore-scripture.pages.dev)

## Security

### What's NOT Committed

- Account IDs and KV namespace IDs
- Local configuration files
- Sensitive deployment artifacts
- Development server outputs

### What's Committed

- Public URLs
- Example configurations
- Build scripts and deployment guides
