# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static Bible study site built with Eleventy (11ty) that generates pages for all 66 biblical books organized by categories (Law, History, Poetry & Writings, Major Prophets, Minor Prophets, Gospels, Acts, Pauline Epistles, General Epistles, Apocalypse). The site is designed for deployment on Cloudflare Pages.

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

### Template System (Nunjucks)
- **Base Layout** (`src/_includes/layouts/base.njk`): Common HTML structure with navigation and footer
- **Book Layout** (`src/_includes/layouts/book.njk`): Individual book pages with metadata display and chapter summary tables
- **Category Layout** (`src/_includes/layouts/category.njk`): Lists books within each category
- **Dynamic Page Generation**: Uses Eleventy pagination to generate individual pages for each book via `src/books.njk`

### URL Structure
- Home: `/` (lists categories and books)
- Categories: `/categories/` (category overview) and `/categories/{slug}/` (individual category pages)
- Books: `/books/{slug}/` (individual book pages with chapter summaries)

### Content Management
- Chapter summaries are stored as key-value pairs in each book's `chapterSummaries` object (chapter number as key, summary text as value)
- Markdown can be used within summary strings for rich formatting
- Some books have example summaries (Genesis 1-3, Matthew 1-3, Romans 1-2), others have empty `chapterSummaries: {}` objects

### Styling
- Minimal CSS approach with intentionally basic styling in `src/styles.css`
- Uses CSS Grid for card layouts and simple table styling for chapter summaries
- Responsive design with mobile-friendly navigation

## File Organization

```
src/
├── _data/           # JSON data files for books and categories
├── _includes/       # Layouts and reusable templates
│   └── layouts/     # Nunjucks layout files
├── assets/          # Static assets (favicon, etc.)
├── *.njk           # Page templates and dynamic page generators
└── styles.css      # Site-wide styling
```

## Key Development Patterns

When adding new features or content:
- All book metadata lives in `src/_data/books.json` - modify this to add chapter summaries or update book information
- Category definitions are in `src/_data/categories.json` - changes here affect navigation and groupings
- Use Eleventy's pagination feature for generating multiple pages from data arrays
- Follow the existing Nunjucks templating patterns for consistency
- The site uses slug-based URLs generated from book/category names

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