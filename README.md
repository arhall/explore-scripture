# Explore Scripture — Interactive Study Site

[![Built with Eleventy](https://img.shields.io/badge/Built%20with-Eleventy-000000.svg)](https://11ty.dev/)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020.svg)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/arhall/bible-static-site/actions/workflows/test.yml/badge.svg)](https://github.com/arhall/bible-static-site/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/arhall/bible-static-site/branch/main/graph/badge.svg)](https://codecov.io/gh/arhall/bible-static-site)

A comprehensive Bible study platform featuring **5,500+ biblical entities**,
interactive chapter reading, and modern UX design optimized for desktop and
mobile study.

**🌐 Live Site**: **<https://explore-scripture.pages.dev>**

## ✨ Key Features

- **📚 66 Biblical Books** organized by categories (Law, History, Poetry,
  Prophets, Gospels, Epistles, Apocalypse)
- **👥 5,500+ Biblical Entities** including people, places, concepts with
  detailed study content
- **📖 Interactive Chapter Reader** with live translation switching (ESV, NIV,
  NLT, NKJV, NASB, AMPC, WEB)
- **💬 Commentary System** with 11 high-quality sources including Matthew Henry,
  JFB, and more
- **🔍 Advanced Search** with fuzzy matching, biblical synonyms, and unified
  entity search
- **🎨 24 Theme System** with automatic dark mode and accessibility features
- **📱 PWA Support** with offline caching and native app-like experience
- **⚡ High Performance** - 4,000+ pages generated in ~11 seconds

Built with **Eleventy (11ty)** for fast, static generation and optimized for
**Cloudflare Pages** deployment.

## 🛠️ Current Focus & Known Issues

- **Genealogy minimap QA** – Recent refactor caches node/link sets in
  `src/genealogies.njk` so the minimap scale tracks the main tree after
  `Fit tree`. Please verify on `/genealogies/` across desktop and mobile and
  record findings in `docs/genealogies-research/README.md`.
- Broader content expansion, SEO, and UX enhancements remain on the medium-term
  roadmap (see `TODO.md`).

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd explore-scripture
npm install

# Start development server
npm run dev
# Server runs at http://localhost:8080 (local development)

# Build for production
npm run build
```

**Directory Structure:**

- **Input**: `src/` (templates, data, assets)
- **Output**: `_site/` (generated static site)
- **Data**: `data/source-datasets/` (large entity datasets)
- **Scripts**: `scripts/` (build and utility scripts)
- **Tests**: `tests/` (Selenium and Jest test suites)

## 📋 Development Commands

### Core Development

```bash
# Development server with live reload
npm run dev
npm run dev:debug        # With debug logging
npm run dev:port         # Custom port (3000)

# Building
npm run build            # Standard build
npm run build:production # Production build with optimization
npm run build:analyze    # Build with performance analysis
npm run build:fast       # Skip entity processing
```

### Entity Management

```bash
npm run entities:process  # Process entity data
npm run entities:extract  # Extract book entities
npm run entities:validate # Validate entity schema
npm run entities:test     # Test key figures loading
```

### Testing & Quality

```bash
npm run test             # Run all tests
npm run test:selenium    # Selenium web tests
npm run test:entities    # Entity system tests
npm run test:setup       # Setup test environment

npm run lint             # Run all linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
```

### Optimization & Analysis

```bash
npm run optimize         # Optimize CSS and HTML
npm run performance:report # Generate performance report
npm run logs:analyze     # Analyze build logs
```

## 🏗️ Project Structure

```text
src/
├── _data/                    # Data files for content generation
│   ├── books.json           # 66 biblical books with metadata
│   ├── categories.js        # 10 biblical categories
│   └── entityIds.js         # Entity ID mappings
├── _includes/               # Layouts and templates
│   ├── layouts/            # Nunjucks layout files
│   ├── components/         # Reusable components
│   └── macros/             # Template macros
├── assets/                 # Interactive components
│   ├── data/              # Generated client-side data
│   │   ├── entities/      # Individual entity files
│   │   └── books/         # Book-specific entity data
│   ├── chapter-reader.js   # Chapter reading modal
│   ├── commentary-reader.js # Commentary system
│   ├── search-engine.js    # Advanced search system
│   └── theme-manager.js    # Theme system
├── entities.njk            # Entity page generator
├── books.njk              # Book page generator
└── styles.css             # Main stylesheet

data/source-datasets/       # Large entity datasets
├── Bible_combined_all_expanded.with_ids.v2.json
├── Bible_id_redirect_map.v2.json
scripts/                    # Build and utility scripts
tests/                      # Test suites (Selenium, Jest)
```

## 🗺️ Map (MVP) dev notes

- Data lives in `src/assets/map/` and is passed through to `/assets/map/` at build time.
  - `places.v1.json`, `journeys.v1.json`, `churches.v1.json`, and `styles/v1.json`
  - Bump the version suffix when making breaking changes to the schema.
- Journey stops reference `place_id` values in `places.v1.json`.
  - `segments` are ordered and should match the stop order (segments count = stops count - 1).
- Chip taxonomy for the MVP is **Roman provinces** (`chip.type = "province"`), so data and UI stay aligned.
- Search synonyms come from `names.also_known_as` + `names.modern_label`.
  - The search normalizer strips diacritics so `Selcuk` also matches `Selçuk` input.
- URL state is encoded as query params, e.g.
  `/map/?journey=jn_pauls_first&stop=0&layers=journeys,churches&z=6&c=27.34,37.93`
  - Load order: URL → `localStorage` (`mapState.v1`) → defaults.
  - Any journey/stop/layer/map move updates both the URL and `localStorage`.

## 🎯 Entity System

The heart of Explore Scripture is its comprehensive entity system with **5,500+
biblical entities**:

### Entity Types

- **👥 People**: Biblical characters with detailed profiles
- **📍 Places**: Geographical locations and their significance
- **💭 Concepts**: Theological concepts and themes
- **🏛️ Objects**: Significant items and artifacts
- **📅 Events**: Major biblical events and their context

### Entity Features

- **Unique URLs**: Each entity has a stable `/entities/{id}` URL
- **Cross-References**: Entities link to related people, places, and concepts
- **Search Integration**: All entities searchable through unified search system
- **Book Context**: Entities show their appearances across biblical books
- **Redirect System**: Canonical ID mapping prevents broken links

### Data Processing

```bash
# Process entity data from source datasets
npm run entities:process

# Extract entities for specific books
npm run entities:extract

# Validate entity schema and structure
npm run entities:validate
```

## 📖 Chapter & Commentary System

### Interactive Chapter Reader

- **Modal Interface**: Full-screen chapter reading experience
- **7 Translations**: ESV, NIV, NLT, NKJV, NASB, AMPC, WEB
- **Live Switching**: Change translations without page reload
- **Mobile Optimized**: Touch-friendly controls and responsive design
- **BibleGateway Integration**: Reliable verse fetching with fallbacks

### Commentary System

- **11 Commentary Sources**: Matthew Henry, JFB, Scofield, John Gill, and more
- **Source-Specific URLs**: Custom formatting for each commentary provider
- **Iframe Support**: 6 sources with embedded viewing, 4 with direct access
- **Book Name Mapping**: Handles edge cases (Song of Songs, numbered books)
- **Professional Fallback**: Clean UI for sources requiring external access

## 🔍 Search System

### Advanced Search Features

- **Unified Search**: Books, chapters, entities, and categories in one interface
- **Fuzzy Matching**: Find content even with typos or partial matches
- **Biblical Synonyms**: Understands biblical language and concepts
- **N-gram Indexing**: Fast, intelligent relevance scoring
- **Autocomplete**: Smart suggestions as you type
- **Performance Optimized**: Debounced queries with caching

### Search Data Generation

```bash
# Generate search indices
npm run search:generate

# Files generated:
# - src/assets/data/search-data.json (unified search)
# - src/assets/data/entities-search.json (entity search)
```

## 🎨 Theme & Accessibility

### Theme System

- **24 Color Themes**: Professional color palettes for every preference
- **Dark Mode Default**: Optimized for comfortable Bible study
- **Automatic Detection**: Respects user's system preferences
- **CSS Variables**: Modern theming with full browser support
- **Cross-Component**: Consistent theming across all interactive elements

### Accessibility Features

- **ARIA Labels**: Proper screen reader support throughout
- **Keyboard Navigation**: Full keyboard accessibility for all features
- **Focus Management**: Clear focus indicators and logical tab order
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Color Contrast**: All themes meet WCAG contrast requirements
- **Font Controls**: User-adjustable font sizes and readability options

## ⚡ Performance & Optimization

### Build Performance

- **Fast Generation**: 4,000+ pages in ~11 seconds
- **Incremental Builds**: Only regenerate changed content during development
- **Asset Optimization**: CSS minification, image optimization
- **Bundle Analysis**: Detailed build reports in `build-logs/`

### Runtime Performance

- **Static First**: Minimal JavaScript for core functionality
- **Lazy Loading**: Components load on demand
- **Service Worker**: Offline support and caching
- **Critical CSS**: Above-the-fold styles inlined
- **Resource Hints**: Preload and prefetch for faster navigation

## 🧪 Testing

### Test Coverage

- **Selenium Tests**: End-to-end browser testing with Python
- **Jest Tests**: Unit tests for JavaScript components
- **Performance Tests**: Lighthouse audits and build analysis
- **Entity Tests**: Data validation and integrity checks

### Running Tests

```bash
# Setup test environment (first time only)
npm run test:setup

# Run all tests
npm run test

# Specific test suites
npm run test:selenium    # Web browser tests
npm run test:entities    # Entity system tests
npm run test:smoke       # Quick smoke tests
npm run test:mobile      # Mobile-specific tests
```

### Test Categories

- **Core Functionality**: Search, navigation, content rendering
- **Interactive Features**: Chapter reader, commentary system, theme toggle
- **Accessibility**: Screen reader support, keyboard navigation
- **Mobile Support**: Touch interactions, responsive layouts
- **Performance**: Load times, bundle sizes, Lighthouse scores

## 🚀 Deployment

### Cloudflare Pages Setup

1. **Connect Repository**: Link your Git repository to Cloudflare Pages
2. **Build Configuration**:
   - **Framework**: Eleventy
   - **Build command**: `npm run build:production`
   - **Output directory**: `_site`
   - **Node version**: 18 or higher
3. **Environment Variables**: None required for basic deployment
4. **Custom Domain**: Optional - configure in Cloudflare Pages dashboard

### Build Optimization for Production

```bash
# Full production build with optimization
npm run build:production

# Includes:
# - Entity processing
# - Search data generation
# - HTML/CSS minification
# - Performance analysis
# - Asset optimization
```

## 🤝 Contributing

### Development Setup

1. **Fork and Clone**: Fork the repository and clone locally
2. **Install Dependencies**: `npm install`
3. **Setup Tests**: `npm run test:setup`
4. **Start Development**: `npm run dev`

### Code Standards

- **ESLint**: JavaScript code quality (`npm run lint:js`)
- **Stylelint**: CSS standards (`npm run lint:css`)
- **Prettier**: Code formatting (`npm run format`)
- **Pre-commit**: Validation runs automatically (`npm run precommit`)

### Content Editing

- **Books**: Edit `src/_data/books.json` for book metadata and chapter summaries
- **Entities**: Entity data managed through `scripts/entity-processor.js`
- **Themes**: Add themes in `src/assets/theme-manager.js`
- **Search**: Search data auto-generated from content changes

### Pull Request Process

1. **Create Branch**: Feature branches from `main`
2. **Run Tests**: Ensure all tests pass (`npm run test`)
3. **Check Quality**: Run linting and formatting (`npm run lint:fix`)
4. **Build Test**: Verify production build works (`npm run build:production`)
5. **Submit PR**: Clear description of changes and testing performed

## 📚 Documentation

### Quick Reference

- **[COMMANDS.md](COMMANDS.md)**: Essential commands reference and workflows
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Complete deployment and testing guide
- **[tests/README.md](tests/README.md)**: Detailed testing documentation

### Technical Guides

- **[CLAUDE.md](CLAUDE.md)**: Comprehensive technical documentation and AI assistant context
- **[SCALABILITY.md](SCALABILITY.md)**: Performance optimization and scaling details  
- **[CharactersAndEntities.md](CharactersAndEntities.md)**: Entity system implementation

### Development Resources

- **Architecture**: Component-based architecture with modern build tools
- **API Integration**: Multiple Bible translation sources and commentary providers
- **Performance**: Static generation with intelligent caching and optimization
- **Entity System**: 5,500+ entities with cross-reference search and linking

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Explore Scripture** - Making Scripture study accessible, interactive, and
engaging for modern Bible students.
