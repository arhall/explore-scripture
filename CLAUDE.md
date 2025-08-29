# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bible Explorer is a comprehensive static Bible study platform built with Eleventy (11ty). It features 66 biblical books, 229 character studies, interactive chapter reading with live translation switching, and a modern UX design optimized for both desktop and mobile study experiences. The site generates 300+ pages and is optimized for Cloudflare Pages deployment.

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
- **`src/_data/categories.json`**: Defines the 10 biblical categories with descriptions and testament associations
- **`src/_data/characters.js`**: All 229 biblical characters with basic metadata and appearance tracking
- **`src/_data/charactersForPages.js`**: Character data formatted for individual page generation
- **`src/_data/characterProfiles.js`**: Detailed character study profiles with gospel connections
- **`src/_data/charactersByBook/`**: Character appearance data organized by individual biblical books

### Template System (Nunjucks)
- **Base Layout** (`src/_includes/layouts/base-minimal.njk`): Clean HTML structure with navigation, theme toggle, and modern styling
- **Book Layout** (`src/_includes/layouts/book.njk`): Individual book pages with metadata display, chapter summary tables, and integrated chapter reader
- **Character Layout** (`src/_includes/layouts/character.njk`): Professional character study pages with gospel connections
- **Category Layout** (`src/_includes/layouts/category.njk`): Lists books within each category
- **Dynamic Page Generation**: 
  - Books: `src/books.njk` generates 66 individual book pages
  - Characters: `src/characters.njk` generates 229 character study pages with pagination
  - Categories: `src/categories.njk` generates category overview pages

### Interactive Features
- **Chapter Reader** (`src/assets/chapter-reader.js`): 
  - Modal-based chapter reading with BibleGateway integration
  - Live translation switching (ESV, NIV, NLT, NKJV, NASB, AMPC, WEB)
  - Mobile-optimized with maximized viewport space
  - Single button per chapter (no duplicates)
  - Smart duplicate detection and clean UI
- **Scripture Widget** (`src/assets/scripture-widget.js`): Hover/tap Scripture references with verse previews
- **Character Search** (`src/assets/character-search.js`): Fast client-side character search with filtering
- **Theme Manager** (`src/assets/theme-manager.js`): 24 professional color themes with automatic dark mode detection

### URL Structure
- Home: `/` (lists categories and books)
- Categories: `/categories/` (category overview) and `/categories/{slug}/` (individual category pages)
- Books: `/books/{slug}/` (individual book pages with chapter summaries)
- Characters: `/characters/` (character listing) and `/characters/{slug}/` (individual character study pages)
- Gospel Thread: `/gospel-thread/` (thematic connections throughout scripture)
- Links: `/links/` (external resources and references)

### Content Management
- **Books**: Chapter summaries stored as key-value pairs in `chapterSummaries` objects (chapter number as key, summary text as value)
- **Characters**: Detailed profiles in `characterProfiles.js` with study materials, gospel connections, and modern applications
- **Character Appearances**: Tracked per book with chapter-level precision for navigation
- **Gospel Connections**: Thematic data showing how characters point to Christ with theological insights
- **Markdown Support**: Rich formatting available in summary strings and character profiles

### Modern UX Design
- **Professional Styling**: Clean, minimal CSS with CSS custom properties for theming
- **Responsive Grid**: CSS Grid and Flexbox for optimal layouts across devices  
- **Character Pages**: Card-based design with clean typography and optimal information architecture
- **Mobile-First**: Responsive design prioritizing mobile Bible study experience
- **Theme System**: Comprehensive theming with 24 color options and automatic dark mode
- **Accessibility**: ARIA labels, keyboard navigation, focus states, and semantic HTML

## File Organization

```
src/
├── _data/                    # Data files for content generation
│   ├── books.json           # All 66 biblical books with metadata
│   ├── categories.json      # 10 biblical categories with descriptions
│   ├── characters.js        # 229 character basic data
│   ├── charactersForPages.js # Character data for page generation
│   ├── characterProfiles.js  # Detailed character studies
│   └── charactersByBook/    # Character appearances by book
├── _includes/               # Layouts and reusable templates
│   └── layouts/            # Nunjucks layout files
│       ├── base-minimal.njk # Clean base with theme system
│       ├── book.njk        # Individual book pages
│       ├── character.njk   # Character study template
│       └── category.njk    # Category listing pages
├── assets/                 # Interactive components and static assets
│   ├── chapter-reader.js   # Chapter reading modal with translations
│   ├── character-search.js # Client-side character search
│   ├── scripture-widget.js # Scripture reference tooltips
│   └── theme-manager.js    # 24-theme system with dark mode
├── *.njk                   # Page templates and generators
│   ├── books.njk          # Generates 66 book pages
│   ├── characters.njk     # Generates 229 character pages
│   ├── characters-paginated.njk # Character listing with pagination
│   └── categories.njk     # Category overview pages
└── styles.css             # Modern CSS with custom properties
```

## Key Development Patterns

### Content Updates
- **Books**: Modify `src/_data/books.json` to add chapter summaries or update book metadata
- **Characters**: Add profiles to `src/_data/characterProfiles.js` and basic data to `src/_data/characters.js`
- **Categories**: Update `src/_data/categories.json` for navigation and grouping changes
- **Character Appearances**: Add to relevant `src/_data/charactersByBook/*.json` files

### Code Patterns
- **Page Generation**: Use Eleventy pagination for generating multiple pages from data arrays
- **Templating**: Follow existing Nunjucks patterns with proper data binding and error handling
- **Styling**: Use CSS custom properties for theming, maintain mobile-first responsive design
- **JavaScript**: Component-based architecture with clean separation of concerns
- **URLs**: Slug-based URLs generated from book/category/character names for SEO

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

## Deployment

Optimized for Cloudflare Pages with build command `npm run build` and output directory `_site`. Use `npm run build:production` for production builds with full logging and performance analysis. No server-side dependencies required - purely static generation.