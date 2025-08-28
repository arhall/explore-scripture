# Current Context - Bible Static Site

## Project Overview
Bible Explorer - A static site built with Eleventy (11ty) that provides chapter-by-chapter Bible summaries, character information, and cross-references.

## Current State (Post-Testing Infrastructure Setup)
- **Build Status**: Fully functional, no build errors
- **Dev Server**: Running on `http://localhost:8080` 
- **Testing**: Comprehensive Selenium test suite implemented and passing
- **CI/CD**: GitHub Actions workflow configured for automated testing

## Recent Changes Applied
1. **Reverted Repository**: Back to commit 4e567b9 for clean state
2. **Build Configuration**: Fixed .eleventy.js passthrough configuration
3. **Testing Infrastructure**: Added comprehensive Selenium test suite with 13+ tests
4. **CI/CD Pipeline**: GitHub Actions workflow for automated testing
5. **Documentation**: Created technical, product, and content suggestion frameworks
6. **Scripture Widget System**: Implemented embedded Bible verse display with hover/tap functionality
7. **Chapter Reader Modal**: Simplified chapter reading with embedded BibleGateway iframe
8. **Bible Study Enhancement**: Integrated both systems for comprehensive study experience

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
│   ├── _includes/
│   │   ├── layouts/base.njk (main layout with widget integration)
│   │   └── macros/scripture.njk (Scripture reference macros)
│   ├── assets/
│   │   ├── scripture-widget.js (embedded verse display system)
│   │   └── chapter-reader.js (full chapter modal system)
│   ├── examples/
│   │   ├── genesis-1-enhanced.njk (Scripture widget demo)
│   │   └── john-3-complete.njk (complete integration demo)
│   ├── styles.css (main stylesheet)
│   ├── _data/ (JSON data files)
│   └── index.njk (homepage)
├── tests/test_scripture_widget.py (widget functionality tests)
├── SCRIPTURE_WIDGET_GUIDE.md (implementation documentation)
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
- **Scripture Widget System**: Hover/tap Bible verse display with configurable translations
- **Chapter Reader Modal**: Embedded BibleGateway iframe in responsive modal with external link access
- **Bible Study Integration**: Seamless combination of verse lookup and chapter reading

✅ **Recently Fixed:**
- Build configuration cleaned up (removed missing file references)
- Comprehensive test coverage implemented
- CI/CD pipeline established

## Previous Issues Resolved
1. **Off-screen Content**: Content was positioned at x: -330px, fixed with CSS positioning overrides
2. **Page Transitions**: Problematic animations disabled to prevent positioning issues
3. **Memory Issues**: JavaScript heap out of memory errors resolved by simplifying code
4. **Emergency Fixes**: Temporary debug styles removed, permanent fixes integrated

## Next Steps Priority
1. **Architecture Improvements**: Implement suggestions from tech_suggestions.md
2. **Product Enhancements**: Execute recommendations from product_suggestions.md  
3. **Content Review**: Address theological accuracy items from content_suggestions.md
4. **Performance Optimization**: Implement code splitting and caching strategies
5. **SEO Enhancement**: Add structured data and meta optimization

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