# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bible Explorer is a comprehensive static Bible study platform built with Eleventy (11ty). It features 66 biblical books, interactive chapter reading with live translation switching, and a modern UX design optimized for both desktop and mobile study experiences. The site is optimized for Cloudflare Pages deployment.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run dev

# Build static site for production
npm run build

# Build with performance analysis and logging
npm run build:analyze

# Build for production with full logging
npm run build:production

# Analyze existing build without rebuilding
npm run logs:analyze
```

The dev server runs Eleventy with `--serve` flag, providing live reload during development. Built files are output to `_site/` directory. Build analysis generates detailed performance logs in `build-logs/` directory.

## Architecture

### Data-Driven Structure
- **`src/_data/books.json`**: Contains all 66 biblical books with metadata (testament, category, author, language) and `chapterSummaries` object for chapter-by-chapter content
- **`src/_data/categories.js`**: Defines the 10 biblical categories with descriptions and testament associations, dynamically calculates book counts
- **`src/_data/bibleProjectVideos.json`**: YouTube video data for Bible Project overview videos integrated into book pages
- **`src/_data/crossReferences.js`**: Cross-reference data for scripture connections
- **`src/_data/gospelThreads.js`**: Thematic gospel thread data

### Template System (Nunjucks)
- **Base Layout** (`src/_includes/layouts/base-minimal.njk`): Clean HTML structure with navigation, theme toggle, PWA support, and dark mode default
- **Full Base Layout** (`src/_includes/layouts/base.njk`): Enhanced layout with comprehensive features:
  - Security headers (CSP, XSS protection, etc.)
  - YouTube video support and Bible Project integration
  - Advanced navigation with bookmarks and recent items
  - Font size controls and accessibility features
  - High contrast mode and dyslexia-friendly options
  - Service worker integration and PWA features
- **Book Layout** (`src/_includes/layouts/book.njk`): Individual book pages with metadata display, chapter summary tables, integrated chapter reader, and commentary buttons
- **Category Layout** (`src/_includes/layouts/category.njk`): Lists books within each category
- **Components**: `src/_includes/components/breadcrumb.njk` for navigation breadcrumbs
- **Macros**: `src/_includes/macros/scripture.njk` for scripture reference formatting
- **Dynamic Page Generation**: 
  - Books: `src/books.njk` generates 66 individual book pages
  - Categories: `src/categories.njk` and `src/categories-dynamic.njk` for category pages
  - Gospel Thread: `src/gospel-thread.njk` for thematic connections
  - Examples: `src/examples/` with enhanced chapter examples

### Interactive Features
- **Chapter Reader** (`src/assets/chapter-reader.js`): 
  - Modal-based chapter reading with multiple API integrations (ESV API, Bible API)
  - Live translation switching (ESV, NIV, NLT, NKJV, NASB, AMPC, WEB)
  - Mobile-optimized with maximized viewport space
  - Proper book name mapping for different APIs
  - Smart duplicate detection, caching, and keyboard navigation
- **Commentary Reader** (`src/assets/commentary-reader.js`):
  - Complete commentary system with 11 high-quality sources
  - Modal-based interface matching Chapter Reader design
  - 6 iframe-compatible sources (Enduring Word, Matthew Henry, JFB, Scofield, Pulpit, John Gill)
  - 4 direct-access sources with professional fallback UI (Barnes, Calvin, Homiletic, Biblical Illustrator)
  - Source-specific URL formatting for all commentary providers
  - Smart book name handling for edge cases (Song of Songs, numbered books)
  - Integrated with all 66 biblical books
- **Search Engine** (`src/assets/search-engine.js`): Advanced unified search system
  - Fuzzy matching with n-gram indexing and relevance scoring
  - Biblical synonyms and stop word filtering
  - Search across books, chapters, and categories
  - Performance optimization with caching and debouncing
  - Autocomplete and suggestion system
- **Search Interface** (`src/assets/search-interface.js`): UI components for search functionality
- **Scripture Widget** (`src/assets/scripture-widget.js`): Hover/tap Scripture references with verse previews
- **Theme Manager** (`src/assets/theme-manager.js`): Comprehensive theme system with multiple options
- **Module Loader** (`src/assets/module-loader.js`): Dynamic JavaScript module loading with lazy loading for performance
  - Priority loading for critical modules on specific page types
  - Event coordination and error handling
- **Debug Dashboard** (`src/assets/debug-dashboard.js`): Real-time debugging interface
- **Logger** (`src/assets/logger.js`): Multi-level logging system
- **Telemetry** (`src/assets/telemetry.js`): OpenTelemetry-compliant observability
- **Security Config** (`src/assets/security-config.js`): Security configuration management
- **Performance Optimizers**:
  - CSS Optimizer (`src/assets/css-optimizer.js`): Critical CSS inlining
  - Image Optimizer (`src/assets/image-optimizer.js`): Lazy loading and optimization
- **PWA Support**: Service worker, offline caching, install prompts, and update notifications

### URL Structure
- Home: `/` (lists categories and books)
- Categories: `/categories/` (category overview) and `/categories/{slug}/` (individual category pages)
- Books: `/books/{slug}/` (individual book pages with chapter summaries)
- Entities: `/entities/` (entity overview) and `/entities/{entity-id}/` (individual entity pages)
- Gospel Thread: `/gospel-thread/` (thematic connections throughout scripture)
- Links: `/links/` (external resources and references)

### Content Management
- **Books**: Chapter summaries stored as key-value pairs in `chapterSummaries` objects (chapter number as key, summary text as value)
- **Markdown Support**: Rich formatting available in summary strings

### Modern UX Design
- **Professional Styling**: Clean, minimal CSS with CSS custom properties for theming
- **Responsive Grid**: CSS Grid and Flexbox for optimal layouts across devices  
- **Mobile-First**: Responsive design prioritizing mobile Bible study experience
- **Theme System**: Comprehensive theming with 24 color options and dark mode as default
- **Accessibility**: ARIA labels, keyboard navigation, focus states, and semantic HTML
- **Progressive Web App**: Offline caching, install prompts, and native app-like experience

## File Organization

```
src/
├── _data/                    # Data files for content generation
│   ├── books.json           # All 66 biblical books with metadata and chapter summaries
│   ├── categories.js        # 10 biblical categories with dynamic book counts
│   ├── crossReferences.js   # Scripture cross-reference data
│   ├── gospelThreads.js     # Thematic gospel thread data
│   ├── bibleProjectVideos.json # YouTube integration data
├── _includes/               # Layouts and reusable templates
│   ├── components/         # Reusable components
│   │   └── breadcrumb.njk  # Navigation breadcrumbs
│   ├── layouts/            # Nunjucks layout files
│   │   ├── base-minimal.njk # Clean base with theme system
│   │   ├── base.njk        # Enhanced base with full features
│   │   ├── book.njk        # Individual book pages with videos
│   │   └── category.njk    # Category listing pages
│   └── macros/             # Template macros
│       └── scripture.njk   # Scripture reference formatting
├── assets/                 # Interactive components and static assets
│   ├── data/              # Generated data for client-side use
│   │   ├── books/         # Individual book data files
│   │   ├── entities/      # Entity data files (5516 entities)
│   │   ├── books.json     # Books data for search
│   │   ├── categories.json # Categories data for search
│   │   ├── entities-search.json # Entity search index
│   │   ├── redirects.json # Entity redirect mappings
│   │   └── search-data.json # Unified search index
│   ├── chapter-reader.js   # Chapter reading modal with multiple APIs
│   ├── commentary-reader.js # Commentary system with 11 sources
│   ├── search-engine.js    # Advanced unified search system
│   ├── search-interface.js # Search UI components
│   ├── scripture-widget.js # Scripture reference tooltips
│   ├── theme-manager.js    # Theme system
│   ├── module-loader.js    # Dynamic module loading system
│   ├── debug-dashboard.js  # Real-time debugging interface
│   ├── logger.js           # Multi-level logging system
│   ├── telemetry.js        # OpenTelemetry observability
│   ├── security-config.js  # Security configuration
│   ├── css-optimizer.js    # CSS optimization
│   ├── image-optimizer.js  # Image optimization
│   └── favicon.svg         # Site favicon
├── examples/               # Enhanced chapter examples
│   ├── genesis-1-enhanced.njk
│   └── john-3-complete.njk
├── *.njk                   # Page templates and generators
│   ├── books.njk          # Generates 66 book pages
│   ├── categories.njk     # Category overview pages
│   ├── categories-dynamic.njk # Dynamic category pages
│   ├── entities.njk       # Entity overview page
│   ├── entities-list.njk  # Entity listing page
│   ├── gospel-thread.njk  # Gospel thread connections
│   ├── index.njk          # Homepage
│   ├── links.njk          # External resources
│   └── offline.njk        # Offline page for PWA
├── styles.css             # Modern CSS with custom properties
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker for PWA
```

## Key Development Patterns

### Commentary System Architecture
- **11 Commentary Sources**: Enduring Word, Matthew Henry, JFB, Scofield, Pulpit, John Gill, Barnes, Calvin, Homiletic, Biblical Illustrator
- **Source-Specific URL Formatting**: Each commentary provider has custom URL patterns and book name mappings
- **Iframe vs Direct Access**: 6 sources support iframe embedding, 4 require direct access with fallback UI
- **Edge Case Handling**: Special URL formats for Song of Songs, numbered books (1 John, 1 Samuel, etc.)
- **Book Name Mapping**: Multiple mapping systems (BibleGateway, BibleHub, StudyLight, Enduring Word)

### Search System Reliability
- **Race Condition Prevention**: Module loading coordination with event-based synchronization
- **Error Handling**: Comprehensive fallback mechanisms and user feedback systems
- **Performance Optimization**: Priority loading (50ms for high-traffic pages vs 1000ms default)
- **State Management**: Proper coordination between search modules, data, and UI components

### Entity System Architecture
- **5516+ Entities**: Comprehensive biblical character and entity data with unique IDs
- **Entity Processing**: Automated processing via `scripts/entity-processor.js` during build
- **Cross-Reference System**: Bidirectional links between entities and biblical books
- **Search Integration**: Dedicated entity search index (`entities-search.json`) with fuzzy matching
- **URL Structure**: Entity pages use unique IDs (`/entities/{entity-id}/`) for consistent addressing
- **Redirect System**: Handles entity ID changes and legacy URLs via `redirects.json`

### Content Updates
- **Books**: Modify `src/_data/books.json` to add chapter summaries or update book metadata
- **Categories**: Update `src/_data/categories.js` for navigation and grouping changes (book counts are calculated dynamically)
- **Entities**: Process via `scripts/entity-processor.js` - entity data managed through JSON files and build scripts
- **Bible Project Videos**: Update `src/_data/bibleProjectVideos.json` for YouTube integration
- **Cross References**: Update `src/_data/crossReferences.js` for scripture connections

### Code Patterns
- **Page Generation**: Use Eleventy pagination for generating multiple pages from data arrays
- **Templating**: Follow existing Nunjucks patterns with proper data binding and error handling
- **Styling**: Use CSS custom properties for theming, maintain mobile-first responsive design
- **JavaScript**: Component-based architecture with clean separation of concerns
- **URLs**: Slug-based URLs generated from book/category names for SEO

### UX Considerations
- **Mobile-First**: Always test responsive design on mobile devices first
- **Accessibility**: Include ARIA labels, keyboard navigation, and semantic markup
- **Performance**: Minimize JavaScript footprint, optimize for fast static generation
- **Theming**: Support both light and dark modes with proper contrast ratios
- **Professional Design**: Clean, minimal styling without excessive decorations or animations

## Observability & Logging

The site includes comprehensive logging and telemetry capabilities:

### Client-Side Logging
- **Logger** (`/assets/logger.js`): Multi-level logging system with session tracking, performance monitoring, and error handling
- **Telemetry** (`/assets/telemetry.js`): OpenTelemetry-compliant observability with custom metrics and tracing
- **Debug Dashboard**: Press `Ctrl+Shift+D` in debug mode to access real-time logging dashboard

### Build-Time Logging  
- **Build Logger** (`build-logger.js`): Analyzes build performance, file sizes, and content statistics
- **Log Storage**: Build logs saved to `build-logs/` with detailed JSON reports
- **Metrics**: Tracks file counts, sizes, build duration, and content completeness

### Debug Mode
Enable debug features by:
- Adding `?debug=true` to any URL
- Setting `localStorage.bibleExplorerDebug = 'true'`
- Running on localhost (automatically enabled)

Debug mode provides:
- Enhanced console logging
- Real-time telemetry dashboard
- Performance metrics
- Error tracking and reporting
- Session analytics

### Key Metrics Tracked
- **Search Performance**: Query time, result counts, relevance scoring
- **Video Interactions**: Load events, user engagement with Bible Project videos
- **Navigation Patterns**: Page transitions, search result clicks, category browsing
- **Performance**: Page load times, resource loading, memory usage
- **Errors**: JavaScript errors, failed operations, user-facing issues

## Testing & Quality Assurance

Comprehensive test suite with multiple testing frameworks:

### JavaScript Testing
- **Jest** for unit tests and component testing
- **Benchmark tests** for performance validation
- **Data validation** tests for content integrity
- **Build tests** for static generation validation

### Python/Selenium Testing
- **Chapter Reader tests** (`tests/test_chapter_reader.py`)
- **Commentary System tests** (`tests/test_commentary_system.py`)
- **Bible Explorer tests** (`tests/test_bible_explorer.py`)
- **iOS Safari tests** (`tests/test_ios_safari.py`)
- **Regression tests** (`tests/test_regression_fixes.py`)
- **Scripture Widget tests** (`tests/test_scripture_widget.py`)

### Testing Commands
```bash
# Run all tests
npm run test

# Selenium tests
npm run test:selenium

# iOS-specific tests
npm run test:ios

# Mobile tests
npm run test:mobile

# Setup test environment
npm run test:setup
```

### Performance & Code Quality
- **Lighthouse testing** for performance metrics
- **ESLint** for JavaScript code quality
- **Stylelint** for CSS standards
- **Prettier** for code formatting
- **Performance reports** with detailed analysis

### Linting Commands
```bash
# Run all linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Docker Support

Complete Docker configuration for development and production:

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Development with Docker Compose
npm run docker:dev

# Full stack with Docker Compose
npm run docker:up
```

## Deployment

Optimized for Cloudflare Pages with build command `npm run build` and output directory `_site`. Use `npm run build:production` for production builds with full logging and performance analysis. No server-side dependencies required - purely static generation.

### Build Optimization
- **Search data generation** (`generate-search-data.js`) runs before build
- **HTML compression** with `htmlnano` and `html-minifier-terser`
- **CSS optimization** with `cssnano`
- **Performance analysis** with detailed build logging
- **Critical CSS inlining** for faster page loads