# Entity System Documentation

The Bible Explorer Entity System provides comprehensive access to 5,500+ biblical characters, places, events, and concepts across all 66 books of the Bible.

## Overview

The entity system consists of:
- **5,514 Individual Entities**: Each with dedicated pages and detailed information
- **66 Book Entity Collections**: Key figures for each biblical book 
- **Search Integration**: Entities searchable through the unified search system
- **Cross-References**: Links between related entities and scripture passages

## Entity Types

The system includes 8 types of entities:

- **`person`**: Biblical characters (Abraham, Moses, Jesus, etc.)
- **`place`**: Geographic locations (Jerusalem, Egypt, Babylon, etc.) 
- **`divine`**: Divine beings and concepts (God, Holy Spirit, etc.)
- **`title`**: Roles and titles (King, Prophet, Priest, etc.)
- **`figure`**: Symbolic or metaphorical figures
- **`event`**: Significant biblical events
- **`group`**: People groups, nations, tribes
- **`entity`**: General entities and concepts

## Data Structure

### Individual Entity Files
Location: `src/assets/data/entities/{entity-id}.json`

```json
{
  "id": "p.david.1-sam-16--a1b2c3d4",
  "name": "David",
  "type": "person",
  "blurb": "Second king of Israel, man after God's own heart...",
  "category": "royalty",
  "references": ["1 Samuel 16:1-13", "2 Samuel 2:4"],
  "cross_references": ["Psalm 23", "Matthew 1:1"],
  "book_references": {
    "1 Samuel": [16, 17, 18, 19, 20],
    "2 Samuel": [1, 2, 3, 4, 5]
  },
  "source_testaments": ["OT"],
  "canonicalized_from": ["p.david-king--old-id"],
  "relations": {
    "father": ["Jesse"],
    "sons": ["Solomon", "Absalom"]
  }
}
```

### Book Entity Collections
Location: `src/assets/data/books/{book-slug}-entities.json`

```json
[
  {
    "id": "p.moses.exod-2--xyz123",
    "name": "Moses", 
    "type": "person",
    "url": "/entities/p.moses.exod-2--xyz123/",
    "blurb": "Prophet who led Israel out of Egypt",
    "searchText": "moses person prophet led israel out of egypt",
    "references": 247,
    "books": ["Exodus"],
    "category": "leadership"
  }
]
```

## URL Structure

- **Entity Pages**: `/entities/{entity-id}/`
- **Entity Listing**: `/entities/`
- **Book-Filtered Entities**: `/entities/{entity-id}/?book=Genesis`

## Key Features

### 1. Dynamic SEO Optimization
- Page titles update to `{Entity Name} - Bible Explorer`
- Meta descriptions auto-generated from entity blurbs
- Proper canonical URLs and redirects

### 2. Search Integration
- Entities indexed in `src/assets/data/entities-search.json`
- Searchable by name, type, category, and description
- Integrated with main site search engine

### 3. Cross-References
- Links to related scripture passages
- Navigation between related entities
- Book-specific filtering

### 4. Accessibility Features
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast mode compatibility

## Loading System

### Book Key Figures
The `loadKeyFigures()` function in `book.njk:712` fetches entity data for each book:

```javascript
async function loadKeyFigures() {
  const response = await fetch(`/assets/data/books/${bookSlug}-entities.json`);
  const entities = await response.json();
  displayKeyFigures(entities);
}
```

### Individual Entity Pages
Entity pages use pagination in `src/entities.njk`:

```yaml
pagination:
  data: entityIds
  size: 1
  alias: entityId
permalink: "/entities/{{ entityId }}/"
```

## Redirects System

Legacy entity IDs are mapped to canonical IDs in `src/assets/data/redirects.json`:

```json
{
  "old-entity-id--hash1": "canonical-entity-id--hash2"
}
```

JavaScript automatically redirects users from old URLs to canonical ones.

## Management Scripts

### Key Scripts
- `scripts/entity-utils/test-key-figures-loading.js` - Verify all 66 books have entity data
- `scripts/entity-utils/extract-book-entities.js` - Extract entities from combined dataset
- `scripts/entity-utils/validate-entity-schema.js` - Validate JSON schema compliance

### Usage Examples

```bash
# Test all book entity files
node scripts/entity-utils/test-key-figures-loading.js

# Extract specific book entities
node scripts/entity-utils/extract-book-entities.js

# Validate schema compliance
node scripts/entity-utils/validate-entity-schema.js
```

## Performance Metrics

- **Build Time**: 2.3 seconds for all 5,514 entity pages
- **File Size**: 22.2 MB total for all entity JSON files
- **Search Index**: Optimized for fast client-side search
- **Validation**: 98.8% of files pass schema validation

## API Integration

Entity data can be accessed programmatically:

```javascript
// Load specific entity
const entity = await fetch('/assets/data/entities/p.david.1-sam-16--a1b2c3d4.json')
  .then(r => r.json());

// Load book entities
const bookEntities = await fetch('/assets/data/books/genesis-entities.json')
  .then(r => r.json());

// Check for redirects
const redirects = await fetch('/assets/data/redirects.json')
  .then(r => r.json());
```

## Best Practices

### Adding New Entities
1. Generate unique ID using format: `{type}.{name-slug}.{reference}--{hash}`
2. Include all required fields: `id`, `name`, `type`
3. Add book references in `book_references` object
4. Update search index and book collections

### Schema Compliance
- Use established entity types (`person`, `place`, etc.)
- Include descriptive blurbs under 160 characters for SEO
- Format references as arrays of strings
- Validate with schema checker before deployment

### Performance Optimization
- Limit book entity collections to top 50 entities by reference count
- Use gzip-friendly JSON formatting
- Implement proper caching headers
- Monitor build performance with analytics

## Troubleshooting

### Common Issues
- **404 on entity pages**: Check `entityIds.js` is generating correct ID list
- **Missing key figures**: Verify book entity file exists and is valid JSON
- **Search not working**: Ensure `entities-search.json` is up to date
- **Redirect loops**: Check `redirects.json` for circular mappings

### Debug Tools
- Browser console shows entity loading errors
- Debug mode (`?debug=true`) provides detailed logging
- Test scripts validate data integrity
- Build logs show processing statistics

## Future Enhancements

- Geographic mapping for place entities
- Timeline visualization for event entities
- Enhanced relationship graphs
- Multi-language entity names
- Audio pronunciation guides
- Integration with Bible reading plans