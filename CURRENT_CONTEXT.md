# Current Context - Bible Static Site

## Project Overview
Bible Explorer - A static site built with Eleventy (11ty) that provides chapter-by-chapter Bible summaries, character information, and cross-references.

## Current State (Post-Revert to 4e567b9)
- **Build Status**: Partially working with errors for missing passthrough files
- **Dev Server**: Running on `http://localhost:8080` 
- **Main Issue**: Missing files causing build warnings (sw.js, site.webmanifest, robots.txt)

## Recent Changes Applied
1. **Reverted Repository**: Back to commit 4e567b9 for clean state
2. **File Structure**: Core functionality restored, some optional features removed
3. **Build Configuration**: Needs cleanup in .eleventy.js for missing file references

## Technical Architecture
- **Static Site Generator**: Eleventy (11ty) v3.1.2
- **Templating**: Nunjucks (.njk files)
- **Styling**: Custom CSS with CSS variables for theming
- **JavaScript**: Vanilla JS with modern features (ES6+)
- **Build Process**: npm scripts for dev/build

## Key Files and Locations
```
/Users/andrewhall/repo/bible-static-site/
├── .eleventy.js (build configuration)
├── src/
│   ├── _includes/layouts/base.njk (main layout)
│   ├── styles.css (main stylesheet)
│   ├── _data/ (JSON data files)
│   └── index.njk (homepage)
└── _site/ (build output)
```

## Current Functionality Status
✅ **Working:**
- Homepage rendering and content visibility
- Navigation menu and links
- Theme toggle (light/dark)
- Font size controls
- High contrast mode
- Search functionality
- Character and book pages
- Responsive design

❌ **Build Issues:**
- Missing sw.js file reference in passthrough copy
- Missing site.webmanifest file reference
- Missing robots.txt file reference

## Previous Issues Resolved
1. **Off-screen Content**: Content was positioned at x: -330px, fixed with CSS positioning overrides
2. **Page Transitions**: Problematic animations disabled to prevent positioning issues
3. **Memory Issues**: JavaScript heap out of memory errors resolved by simplifying code
4. **Emergency Fixes**: Temporary debug styles removed, permanent fixes integrated

## Next Steps Priority
1. **Fix Build Configuration**: Remove references to missing files in .eleventy.js
2. **Create Selenium Test Suite**: Comprehensive testing for all functionality
3. **CI Integration**: Make tests suitable for continuous integration

## Testing Requirements
The Selenium test suite should cover:
- **Core Rendering**: Homepage, navigation, content visibility
- **Interactive Features**: Search, theme toggle, font controls
- **Accessibility**: Skip links, ARIA labels, keyboard navigation  
- **Responsive Design**: Mobile/desktop layouts
- **Performance**: Page load times, JavaScript execution
- **Error Handling**: 404 pages, broken links, JS errors

## Development Environment
- **Node.js**: Version compatible with Eleventy 3.x
- **Browser**: Chrome/Chromium for headless testing
- **OS**: macOS (Darwin 24.6.0)
- **Python**: Available for Selenium test scripts