# Documentation Index

## Getting Started

- [Main README](../README.md) - Project overview and quick start
- [Developer Guide](DEVELOPER_GUIDE.md) - Comprehensive development guide
- [Docker Setup](DOCKER.md) - Containerized development and deployment

## Features & Implementation

- [Chapter Reader Guide](CHAPTER_READER_GUIDE.md) - Embedded BibleGateway
  chapter reading
- [Scripture Widget Guide](SCRIPTURE_WIDGET_GUIDE.md) - Hover/tap Scripture
  references
- [Performance Guide](PERFORMANCE.md) - Performance optimization strategies

## Testing & Quality

- [Test Suite Documentation](TEST_SUITE_DOCUMENTATION.md) - Testing strategy and
  tools
- Code quality enforced by ESLint, Stylelint, and Prettier

## Project Planning

- [Suggestions](suggestions/) - Feature and improvement ideas
  - [Content Suggestions](suggestions/content_suggestions.md)
  - [Product Suggestions](suggestions/product_suggestions.md)
  - [Technical Suggestions](suggestions/tech_suggestions.md)

## Quick Reference

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run all linters
npm run test         # Run test suite
npm run validate     # Full validation (lint + build + test)
```

### Project Structure

```
explore-scripture/
├── src/             # Source code
├── docs/            # Documentation (you are here)
├── tests/           # Test suite
├── scripts/         # Build tools
├── tmp/             # Temporary files
└── build-logs/      # Build analysis
```

### Key Technologies

- **Eleventy**: Static site generator
- **Nunjucks**: Template engine
- **Vanilla JS**: Client-side functionality
- **CSS Custom Properties**: Theming system
- **Selenium**: End-to-end testing

## Support

For issues, questions, or contributions, refer to:

- [Developer Guide](DEVELOPER_GUIDE.md) for detailed technical information
- [Test Documentation](TEST_SUITE_DOCUMENTATION.md) for testing procedures
- Project README for contribution guidelines
