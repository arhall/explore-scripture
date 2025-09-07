# Scripts Directory

This directory contains utility scripts for the Bible Explorer project.

## Active Scripts

### Build & Performance
- `build-logger.js` - Analyzes build performance, file sizes, and content statistics
- `performance-report.js` - Generates detailed performance reports
- `compress-html.js` - HTML compression utilities for production builds

## Entity Utilities (`entity-utils/`)

Scripts for managing the Biblical entities system (5,500+ entities across all 66 books).

### Active Entity Scripts
- `entity-processor.js` - Main entity processing and conversion script
- `extract-book-entities.js` - Extracts entities for specific books from the combined dataset
- `test-key-figures-loading.js` - Tests that all 66 books have working key figures data

### Usage Examples

```bash
# Test key figures loading for all books
node scripts/entity-utils/test-key-figures-loading.js

# Extract entities for specific books from Bible_combined_all_expanded.with_ids.v2.json
node scripts/entity-utils/extract-book-entities.js

# Process and convert entity data
node scripts/entity-utils/entity-processor.js
```

## Deprecated Scripts (`deprecated/`)

Scripts that are no longer actively used but kept for reference:

- `convert-ot-entities.js` - Original OT entity conversion (superseded by extract-book-entities.js)
- `debug-entity-references.js` - Debug utility for entity reference patterns
- `generate-missing-entity-files.js` - Simple entity file generator (superseded by extract-book-entities.js)

## Data Sources

The entity scripts work with these data files:
- `Bible_combined_all_expanded.with_ids.v2.json` - Combined biblical entity dataset (5,514 entities)
- `OT_EntitiesByBook/` - Individual Old Testament book entity files
- `src/assets/data/books/*.json` - Per-book entity files for the site

## Key Figures System

The key figures system loads biblical characters and entities for each book page:
- Each book needs a `src/assets/data/books/{book-slug}-entities.json` file
- The `loadKeyFigures()` function in `book.njk:712` fetches this data
- Entities are displayed in the "Key Figures" section of book pages
- All 66 biblical books now have working key figures data