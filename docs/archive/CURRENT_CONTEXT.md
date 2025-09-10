# Current Context - Explore Scripture

## Project Overview

Explore Scripture — Interactive Study Site - A comprehensive Bible study
platform built with Eleventy (11ty) featuring 66 biblical books, 229 character
studies, interactive chapter reader with live translation switching, and
professional UX design optimized for desktop and mobile study.

## Current State (Modern Bible Study Platform)

- **Build Status**: Fully functional, optimized for performance (300+ pages in
  <3 seconds)
- **Dev Server**: Running on `http://localhost:8080` with live reload
- **Character Studies**: 229 biblical characters with detailed profiles and
  gospel connections
- **Chapter Reader**: Live translation switching (ESV, NIV, NLT, NKJV, NASB,
  AMPC, WEB)
- **Professional UX**: Clean, mobile-first design with 24-theme system
- **Testing**: Comprehensive Selenium test suite with build quality gates

## Major Features Implemented

1. **Character Study System**: 229 character pages with professional layouts,
   gospel connections, and biblical analysis
2. **Interactive Chapter Reader**: Modal-based reading with BibleGateway
   integration and translation switching
3. **Mobile Optimization**: Maximized viewport space, hidden external links on
   mobile, responsive design
4. **Theme System**: 24 professional color themes with automatic dark mode
   detection
5. **Client-Side Search**: Real-time character search with filtering (no page
   refresh)
6. **Scripture Widget**: Hover/tap Bible verse display with multi-translation
   support
7. **Clean Button Hierarchy**: Removed duplicate buttons, professional styling
   without emojis
8. **AMPC Support**: Fixed BibleGateway links for Amplified Bible Classic
   edition

## Technical Architecture

- **Static Site Generator**: Eleventy (11ty) v3.1.2
- **Templating**: Nunjucks (.njk files)
- **Styling**: Custom CSS with CSS variables for theming
- **JavaScript**: Vanilla JS with modern features (ES6+)
- **Build Process**: npm scripts for dev/build

## Key Files and Locations

```
/Users/andrewhall/repo/explore-scripture/
├── .eleventy.js (build configuration)
├── src/
│   ├── _data/
│   │   ├── books.json (66 books with chapter summaries)
│   │   ├── characters.js (229 character database)
│   │   ├── charactersForPages.js (character page generation)
│   │   ├── characterProfiles.js (detailed character profiles)
│   │   └── charactersByBook/ (character data organized by book)
│   ├── _includes/layouts/
│   │   ├── base.njk (main layout with theme system)
│   │   ├── book.njk (book pages with chapter summaries)
│   │   ├── category.njk (category pages with book listings)
│   │   └── character.njk (character study pages)
│   ├── assets/
│   │   ├── chapter-reader.js (chapter reader with translation switching)
│   │   ├── character-search.js (client-side character search)
│   │   ├── scripture-widget.js (embedded verse display)
│   │   ├── theme-manager.js (24-theme system)
│   │   ├── logger.js (comprehensive logging)
│   │   └── telemetry.js (performance monitoring)
│   ├── examples/
│   │   └── john-3-complete.njk (complete study example)
│   ├── characters.njk (character overview page)
│   ├── characters-paginated.njk (paginated character listing)
│   └── styles.css (main stylesheet with theme support)
├── tests/test_bible_explorer.py (comprehensive Selenium test suite)
├── docs/ (comprehensive documentation)
└── _site/ (build output - 300+ pages)
```

## Current Functionality Status

✅ **Core Features:**

- **66 Biblical Books**: Complete metadata with chapter-by-chapter summaries
  organized by 10 categories
- **229 Character Studies**: Detailed profiles with gospel connections,
  appearance tracking, and biblical analysis
- **Interactive Chapter Reader**: Live translation switching (ESV, NIV, NLT,
  NKJV, NASB, AMPC, WEB) without page refresh
- **Client-Side Character Search**: Real-time filtering and search results with
  no server requests
- **Professional UX Design**: Clean, mobile-first interface optimized for Bible
  study
- **24-Theme System**: Complete color theme support with automatic dark mode
  detection
- **Scripture Widget System**: Hover/tap Bible verse display with
  multi-translation support
- **Mobile Optimization**: Maximized viewport space, responsive controls,
  touch-friendly interface
- **Performance Optimized**: Static generation of 300+ pages in under 3 seconds
- **Accessibility Features**: ARIA labels, keyboard navigation, semantic HTML,
  screen reader support

✅ **Recently Fixed:**

- Build configuration cleaned up (removed missing file references)
- Comprehensive test coverage implemented
- CI/CD pipeline established

## Previous Issues Resolved

1. **Off-screen Content**: Content was positioned at x: -330px, fixed with CSS
   positioning overrides
2. **Page Transitions**: Problematic animations disabled to prevent positioning
   issues
3. **Memory Issues**: JavaScript heap out of memory errors resolved by
   simplifying code
4. **Emergency Fixes**: Temporary debug styles removed, permanent fixes
   integrated

## Next Steps Priority

1. **Architecture Improvements**: Implement suggestions from tech_suggestions.md
2. **Product Enhancements**: Execute recommendations from product_suggestions.md
3. **Content Review**: Address theological accuracy items from
   content_suggestions.md
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
