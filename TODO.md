# Bible Static Site - TODO List

## Current Priority: Selenium Testing Infrastructure

### ✅ Completed Tasks
- [x] Investigated CSS positioning issues (content was off-screen at x: -330px)
- [x] Fixed main content positioning with CSS overrides
- [x] Cleaned up emergency debug styles
- [x] Implemented pull-to-refresh functionality for mobile
- [x] Added mobile touch target optimizations (44px minimum)

### 🔄 In Progress
- [ ] **Create comprehensive Selenium Chrome headless test suite**
  - Setting up test infrastructure with proper dependencies
  - Implementing tests for main functionality (navigation, content visibility, search)
  - Adding build integration and CI-ready test configuration

### 📋 Pending Tasks

#### Build System Issues
- [ ] Fix missing passthrough files in .eleventy.js:
  - `src/sw.js` - service worker file missing
  - `src/site.webmanifest` - web app manifest missing  
  - `src/robots.txt` - SEO robots file missing
- [ ] Clean up .eleventy.js passthrough configuration to only include existing files
- [ ] Ensure build completes without errors

#### Testing Infrastructure  
- [ ] Set up Python virtual environment for Selenium
- [ ] Install Chrome WebDriver dependencies
- [ ] Create test configuration for CI/CD integration
- [ ] Add test reporting and screenshot capture on failures

#### Core Functionality Tests
- [ ] Homepage content visibility and positioning
- [ ] Navigation menu functionality
- [ ] Search functionality and results
- [ ] Theme toggle (light/dark mode)
- [ ] Font size controls
- [ ] High contrast mode
- [ ] Mobile responsiveness
- [ ] Accessibility features (skip links, ARIA labels)

#### Content-Specific Tests
- [ ] Bible book pages load correctly
- [ ] Character pages display properly
- [ ] Category pages function
- [ ] Cross-references work
- [ ] Chapter summaries are visible

#### Performance Tests
- [ ] Page load times within acceptable limits
- [ ] JavaScript executes without errors
- [ ] CSS loads and applies correctly
- [ ] Images and assets load properly

#### Integration Tests
- [ ] Service worker registration (when implemented)
- [ ] Offline functionality
- [ ] Local storage persistence
- [ ] Browser compatibility testing

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