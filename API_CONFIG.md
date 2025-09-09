# API Configuration Security Guide

## Overview

Explore Scripture integrates with external Bible APIs to provide scripture content. For security reasons, API keys are **not hardcoded** in the source code and must be configured separately.

## Security Best Practices

❌ **NEVER** commit API keys to source control  
❌ **NEVER** hardcode API keys in JavaScript files  
✅ **ALWAYS** use environment variables or secure config injection  
✅ **ALWAYS** rotate API keys regularly  

## Configuration Methods

### Method 1: Build-Time Injection (Recommended for Production)

Configure your build process to inject API keys:

```javascript
// In your build script or environment
window.BIBLE_EXPLORER_CONFIG = {
  apiKeys: {
    esv: process.env.ESV_API_KEY
  }
};
```

### Method 2: Development Configuration

For local development only, you can use localStorage:

```javascript
// In browser console (development only)
localStorage.setItem('bibleExplorerApiKeys', JSON.stringify({
  esv: 'your-esv-api-key-here'
}));
```

## Required API Keys

### ESV API
- Provider: [ESV API](https://api.esv.org/)
- Key: `esv`
- Purpose: English Standard Version scripture content

## Implementation Details

The `ChapterReader` class uses the `loadApiKeys()` method to securely load API keys:

1. **Primary**: Checks `window.BIBLE_EXPLORER_CONFIG.apiKeys`
2. **Fallback**: Checks `localStorage.bibleExplorerApiKeys` (development only)
3. **Safe Default**: Returns empty object if no keys found

## Error Handling

When API keys are missing:
- Warning logged to console
- Scripture loading gracefully degrades
- User sees "No API key configured" message
- Application continues to function for other features

## Production Deployment

For production deployments:

1. Set API keys as environment variables
2. Use your build system to inject them into `window.BIBLE_EXPLORER_CONFIG`
3. Ensure keys are not exposed in client-side bundles
4. Consider using a proxy server for additional security

## Security Audit

This configuration eliminates the following security vulnerabilities:
- ✅ Hardcoded API keys in source code
- ✅ API keys exposed in Git history
- ✅ API keys visible in client-side JavaScript bundles