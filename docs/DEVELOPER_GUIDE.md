# Developer Guide

## Repository Structure

```
explore-scripture/
├── docs/                          # Documentation
│   ├── CHAPTER_READER_GUIDE.md   # Chapter reader implementation
│   ├── SCRIPTURE_WIDGET_GUIDE.md # Scripture widget implementation  
│   ├── TEST_SUITE_DOCUMENTATION.md # Testing documentation
│   ├── DEVELOPER_GUIDE.md        # This developer guide
│   ├── PERFORMANCE.md            # Performance optimization guide
│   └── README.md                 # Documentation overview
├── src/                          # Source code
│   ├── _data/                    # Eleventy data files
│   │   ├── books.json           # Book metadata and summaries (66 books)
│   │   ├── categories.js        # Book categories configuration (10 categories)
│   │   ├── characters.js        # Character database (229 characters)
│   │   ├── charactersForPages.js # Character data for page generation
│   │   ├── characterProfiles.js # Detailed character profiles
│   │   └── charactersByBook/    # Character data organized by book
│   ├── _includes/               # Templates and layouts
│   │   ├── layouts/            # Nunjucks layouts
│   │   │   ├── base.njk       # Base layout with navigation and theme system
│   │   │   ├── book.njk       # Book pages with chapter summaries
│   │   │   ├── category.njk   # Category pages with book listings
│   │   │   └── character.njk  # Character study pages
│   │   ├── components/         # Reusable components
│   │   └── macros/            # Template macros (scripture, themes, gospel connections)
│   ├── assets/                 # JavaScript and static assets
│   │   ├── chapter-reader.js   # Chapter reading with live translation switching
│   │   ├── scripture-widget.js # Scripture hover/tap functionality
│   │   ├── theme-manager.js    # 24-theme system with dark mode
│   │   ├── character-search.js # Client-side character search
│   │   ├── logger.js          # Logging and analytics
│   │   ├── telemetry.js       # OpenTelemetry integration
│   │   └── debug-dashboard.js  # Debug dashboard
│   ├── examples/               # Example pages for testing features
│   ├── characters.njk          # Character overview page
│   ├── characters-paginated.njk # Paginated character listing
│   └── *.njk                  # Other page templates
├── tests/                       # Test suite
│   ├── test_bible_explorer.py # Main Selenium test suite
│   ├── conftest.py            # Pytest configuration
│   └── requirements.txt       # Python dependencies
├── scripts/                     # Build and utility scripts
│   ├── build-logger.js        # Build performance analysis
│   ├── compress-html.js       # HTML minification
│   └── performance-report.js  # Performance reporting
├── build-logs/                 # Build analysis logs
└── run_tests.sh               # Test execution script
```

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Set up Python test environment
npm run test:setup

# Start development server
npm run dev
```

### Code Quality
```bash
# Run all linters
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run specific linters
npm run lint:js     # JavaScript linting
npm run lint:css    # CSS linting
npm run format      # Format code with Prettier
```

### Testing
```bash
# Run all tests (requires Chrome)
npm test

# Run only Selenium tests
npm run test:selenium

# Run smoke tests only
npm run test:smoke
```

### Building
```bash
# Development build
npm run build

# Production build with optimization
npm run build:production

# Build with performance analysis
npm run build:analyze
```

## Code Standards

### JavaScript
- ES6+ features preferred
- Use `const` and `let`, avoid `var`
- Proper error handling with try/catch
- ESLint configuration enforces standards
- Browser compatibility: Modern browsers (ES2020+)

### CSS
- CSS custom properties for theming
- Mobile-first responsive design
- BEM-like class naming where applicable
- Stylelint ensures consistent formatting

### HTML/Nunjucks
- Semantic HTML5 elements
- Accessible markup (ARIA labels, proper heading hierarchy)
- Nunjucks templating with data-driven content
- SEO-friendly meta tags

### Documentation
- Markdown format with consistent structure  
- Code examples for all features
- API documentation for JavaScript modules
- Keep README and guides up to date

## Key Technologies

### Core Stack
- **Eleventy (11ty)**: Static site generator for 300+ pages
- **Nunjucks**: Template engine with macros and data-driven content
- **Vanilla JavaScript**: Modern ES6+ with component-based architecture
- **CSS Custom Properties**: 24-theme system with automatic dark mode detection

### Development Tools
- **ESLint**: JavaScript linting
- **Stylelint**: CSS linting  
- **Prettier**: Code formatting
- **Jest**: JavaScript unit testing
- **Selenium**: End-to-end browser testing

### Build Tools
- **PostCSS**: CSS processing and optimization
- **Terser**: JavaScript minification
- **HTMLnano**: HTML optimization
- **Docker**: Containerized deployment

### Analytics & Monitoring
- **OpenTelemetry**: Performance monitoring
- **Custom Logger**: Client-side logging system
- **Lighthouse**: Performance auditing
- **Build Analytics**: Size and performance tracking

## Performance Considerations

### JavaScript Loading
- Scripts conditionally loaded based on page type
- Chapter Reader only loads on book pages (live translation switching)
- Character Search loads on character pages (client-side filtering)
- Lazy loading for non-critical features
- Service Worker for caching

### CSS Optimization
- Single CSS file with critical styles inline
- CSS custom properties reduce bundle size
- Media queries for responsive loading
- Vendor prefixes only where necessary

### Image & Asset Optimization
- SVG icons for scalability
- WebP format where supported
- Lazy loading for images
- CDN-ready structure

### Build Optimization
- HTML minification in production
- CSS optimization with cssnano
- JavaScript terser for compression
- Gzip compression via server config

## Testing Strategy

### Unit Tests (JavaScript)
- Core functionality testing
- API response handling
- Utility function validation
- Mocking for external dependencies

### Integration Tests (Selenium)
- End-to-end user workflows
- Cross-browser compatibility
- Mobile responsive testing
- Accessibility validation

### Performance Tests
- Lighthouse auditing
- Core Web Vitals monitoring
- Bundle size tracking
- Load time analysis

### Manual Testing
- Visual regression testing
- Usability testing
- Content validation
- Cross-device testing

## Deployment

### Development
- Local dev server with live reload
- Debug mode with enhanced logging
- Source maps for debugging
- Hot module replacement

### Staging/Production
- Cloudflare Pages deployment
- Optimized builds with compression
- CDN for static assets
- Performance monitoring enabled

### Docker Support
- Development container setup
- Production-ready images
- Multi-stage builds for optimization
- Health check endpoints

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (v16+ required)
- Clear `_site` directory and rebuild
- Verify all dependencies installed
- Check for syntax errors in templates

#### JavaScript Errors
- Open browser dev console
- Enable debug mode: `?debug=true`
- Check network tab for failed requests
- Verify API endpoints are accessible

#### Styling Issues
- Clear browser cache
- Check CSS custom property support
- Verify theme system is loaded
- Test in different browsers

#### Performance Issues
- Run build analysis: `npm run build:analyze`
- Check bundle sizes in build logs
- Use Lighthouse for performance audit
- Monitor loading waterfall

### Debug Mode
Enable enhanced debugging:
```javascript
localStorage.setItem('bibleExplorerDebug', 'true');
// or add ?debug=true to URL
```

Debug mode provides:
- Enhanced console logging
- Performance metrics dashboard
- Error tracking and reporting
- Network request monitoring

## Contributing

### Code Review Checklist
- [ ] All tests pass
- [ ] Code follows style guidelines  
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Accessibility considerations met
- [ ] Cross-browser testing completed

### Git Workflow
- Feature branches for new development
- Descriptive commit messages
- Squash commits before merging
- Update documentation with changes

### Issue Reporting
- Use provided issue templates
- Include reproduction steps
- Provide browser/device information
- Include relevant error messages

This developer guide should help new contributors understand the codebase structure, development workflow, and best practices for maintaining code quality and performance.