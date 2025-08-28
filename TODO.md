# Bible Static Site - TODO List

## Current Priority: Architecture & Content Improvements

### ✅ Recently Completed
- [x] Fixed .eleventy.js build configuration by removing missing file references
- [x] Set up Python virtual environment and Selenium dependencies
- [x] Created comprehensive Selenium test suite covering core functionality
- [x] Added CI-ready test configuration and reporting
- [x] Investigated and resolved CSS positioning issues (content was off-screen at x: -330px)
- [x] Implemented pull-to-refresh functionality for mobile
- [x] Added mobile touch target optimizations (44px minimum)
- [x] Created technical, product, and content suggestion documentation

### 📋 Current Priorities

#### Architecture Improvements (See tech_suggestions.md)
- [ ] Implement proper service worker for offline functionality
- [ ] Add progressive web app (PWA) features
- [ ] Optimize build pipeline with code splitting
- [ ] Implement proper error boundary handling
- [ ] Add comprehensive logging and monitoring

#### Product & SEO Enhancements (See product_suggestions.md)  
- [ ] Implement structured data for SEO
- [ ] Add social media sharing features
- [ ] Create user engagement tracking
- [ ] Implement search engine optimization
- [ ] Add accessibility improvements beyond WCAG AA

#### Content & Theological Accuracy (See content_suggestions.md)
- [ ] Review all chapter summaries for theological accuracy
- [ ] Implement cross-reference validation system
- [ ] Add doctrinal statement and hermeneutical approach
- [ ] Enhance character profiles with biblical context
- [ ] Validate gospel thread connections

### 🚫 Removed Features (Previously Completed)
- ~~Personal notes functionality~~
- ~~Personal highlighting~~  
- ~~Study questions~~
- ~~PDF export functionality~~

### 📝 Notes
- Site was reverted to commit 4e567b9 to clean state
- Previous positioning issues were resolved with CSS fixes
- Emergency debug files have been removed
- Focus is now on comprehensive testing infrastructure