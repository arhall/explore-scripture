# Explore Scripture - Test Suite Documentation

## Overview

This repo uses two primary test stacks:

- **Pytest + Selenium/Appium** for end-to-end UI validation.
- **Jest** for data, build, and performance validation.

## Test Suite Features

### ✅ Implemented Tests

#### Core Functionality

- **Homepage Loading**: Validates page loads, container exists, navigation
  displays
- **Navigation Elements**: Tests nav brand, menu links (Sections, Characters,
  Gospel Thread, Links), and accessibility
- **Theme Toggle**: Verifies 24-theme system with light/dark mode switching
  functionality
- **Character Search**: Tests client-side character search input and filtering
  results
- **Chapter Reader**: Validates modal functionality, translation switching, and
  mobile optimization
- **Character Pages**: Tests professional layout, gospel connections, and
  responsive design
- **Book Pages**: Chapter summaries, commentary links, and "Read Chapter" button
  functionality
- **Category Pages**: Book listings and organization by biblical categories
- **Responsive Design**: Mobile viewport testing and content overflow checks
- **Accessibility Features**: Skip links, ARIA labels, keyboard navigation, and
  semantic HTML validation
- **Performance**: Page load time monitoring, CSS/JS validation, and static
  generation metrics

#### Error Handling

- **JavaScript Error Filtering**: Distinguishes critical errors from optional
  module failures
- **Graceful Degradation**: Tests work even when optional features fail
- **Timeout Handling**: Robust waiting for elements with appropriate timeouts

### 🚀 Usage

#### Quick Start

```bash
# Run Selenium/Pytest suite
./run_tests.sh

# Or use npm script
npm test

# Run Selenium suite only
npm run test:selenium

# Setup only (first time)
npm run test:setup
```

#### Performance Tests (Jest)

```bash
# Run performance project (build, Lighthouse, benchmarks)
npx jest --selectProjects performance
```

See `docs/PERFORMANCE_TESTING.md` for details and prerequisites.

#### iOS Safari Testing

```bash
# Run iOS Safari tests (macOS only)
./run_ios_tests.sh

# Or use npm scripts
npm run test:safari      # Safari desktop simulation
npm run test:mobile      # Mobile responsive tests
npm run test:ios         # iOS simulator tests
```

#### Manual Test Execution

```bash
# Activate environment
source test-env/bin/activate

# Run specific test categories
python -m pytest tests/ -v -m smoke      # Quick smoke tests
python -m pytest tests/ -v --tb=short    # Full suite with short traceback
python -m pytest tests/ --html=report.html  # Generate HTML report

# Run Jest unit/data tests (default project)
npx jest --selectProjects default
```

#### Selenium Worker Count

`npm run test:selenium` defaults to **2** workers for stability. Override with
`PYTEST_WORKERS`:

```bash
# Use 1 worker (serial)
PYTEST_WORKERS=1 npm run test:selenium

# Use 4 workers
PYTEST_WORKERS=4 npm run test:selenium
```

#### Selenium Marker Filter

`npm run test:selenium` skips iOS/Appium tests by default to avoid long setup
times. Override with `PYTEST_MARKERS`:

```bash
# Include everything (including iOS/mobile markers)
PYTEST_MARKERS="" npm run test:selenium

# Run only iOS/mobile tests (requires Appium + simulator)
PYTEST_MARKERS="ios or mobile" npm run test:selenium
```

### 📊 Test Configuration

#### Files Structure

```
tests/
├── test_bible_explorer.py     # Main test suite (Chrome)
├── test_commentary_system.py  # Commentary Reader comprehensive tests
├── test_entities_system.py    # Entity/Character system tests (NEW)
├── test_regression_fixes.py   # Regression tests for known issues
├── test_scripture_widget.py   # Scripture widget functionality tests
├── test_ios_safari.py         # iOS Safari test suite
├── conftest.py               # Pytest configuration and fixtures
├── requirements.txt          # Python dependencies
├── setup.js                  # JavaScript test setup
├── filters.test.js           # Template filter tests
├── data.test.js              # Data validation tests
├── build.test.js             # Build process tests
├── lighthouse.test.js        # Lighthouse performance tests (Jest)
├── benchmark.test.js         # Performance benchmarks (Jest)
└── performance.test.js       # Build/site/page performance tests (Jest)

pytest.ini                  # Pytest configuration with iOS markers
run_tests.sh                # Main test execution script
run_ios_tests.sh            # iOS Safari test execution script
.github/workflows/test.yml  # CI/CD pipeline
docs/IOS_TESTING_GUIDE.md   # Complete iOS testing setup guide
docs/PERFORMANCE_TESTING.md # Performance test usage and details
```

#### Dependencies

- **Selenium**: Browser automation and testing (Chrome & Safari)
- **Appium**: iOS mobile automation testing
- **Pytest**: Test framework with HTML reporting
- **Jest**: Unit/data and performance test runner
- **Puppeteer**: Browser automation for performance timing
- **Lighthouse CLI**: Performance audits
- **Chrome/Chromium**: Desktop browser for testing
- **Safari**: macOS/iOS browser testing
- **Python 3.9+**: Runtime environment

### 🎯 Test Coverage

#### Validated Functionality

✅ **Page Rendering**: All page types (home, books, characters, categories),
navigation, content sections  
✅ **Interactive Features**: 24-theme system with dark mode default, chapter
reader modal, character search, translation switching  
✅ **Entity/Character Studies**: Professional layouts, gospel connections,
cross-references, mobile responsiveness ✅ **Bible Reading**: Chapter reader
with 7 translations (ESV, NIV, NLT, NKJV, NASB, AMPC, WEB), mobile optimization
✅ **Responsive Design**: Mobile-first approach, optimized viewports, clean
button hierarchy  
✅ **Accessibility**: ARIA labels, keyboard navigation, semantic HTML, theme
compatibility  
✅ **Performance**: Fast static generation (300+ pages), optimized assets, lazy
loading with module loader ✅ **Modern UX**: Clean professional design, proper
spacing, no excessive decorations  
✅ **iOS Safari Compatibility**: Native iOS Safari testing with touch events and
viewport behavior ✅ **Mobile-First Design**: Full-screen modals, view toggles,
44px touch targets, responsive breakpoints ✅ **Progressive Web App**: Service
worker, offline caching, install prompts, update notifications ✅ **Regression
Testing**: YouTube video support, chapter reader functionality, theme toggle
restoration ✅ **Advanced Search**: Fuzzy matching with n-gram indexing,
relevance scoring, and synonym support ✅ **Commentary System**: 11 commentary
sources with modal interface and source-specific URL handling

#### Build Quality Gates

- Homepage must load within 10 seconds with proper navigation
- All page types (books, characters, categories) must render correctly
- Character reader modal must function with live translation switching and
  dynamic loading
- Entity/character search must filter results without page refresh
- No duplicate "Read Chapter" buttons per chapter
- Mobile design must maximize viewport space (hidden external links on mobile)
- All entity pages must generate with professional layouts and proper
  cross-references
- No critical JavaScript errors (excludes optional modules)
- Theme system must support all 24 themes with dark mode as default
- AMPC and other Bible translation links must work correctly
- YouTube Bible Project videos must load without CSP blocking
- Service worker must register successfully for PWA functionality
- Dynamic module loading must work without breaking existing features

### 🏗️ CI/CD Integration

#### GitHub Actions

- **Automated Testing**: Runs on push to main/develop branches
- **Matrix Testing**: Multiple Node.js and Python versions
- **Artifact Upload**: Test reports and screenshots on failure
- **Dependency Caching**: Faster builds with npm and pip caching

#### Local Development

- **Pre-commit Testing**: Run tests before committing changes
- **Development Server**: Automatically starts and validates dev server
- **Hot Reload**: Tests can run against live development server
- **Error Reporting**: Detailed HTML reports with screenshots

### 🔧 Configuration Options

#### Test Markers

```python
@pytest.mark.smoke      # Quick smoke tests for basic functionality
@pytest.mark.full       # Complete test suite
@pytest.mark.performance # Performance-related tests
@pytest.mark.accessibility # Accessibility tests
```

#### Environment Variables

- `EXPLORE_SCRIPTURE_LOCAL=true`: Use local server URLs
- `LOCAL_BASE_URL=http://localhost:8080`: Override local base URL
- `PRODUCTION_BASE_URL=https://explore-scripture.pages.dev`: Override production URL
- `TEST_TIMEOUT=240000`: Selenium script timeout (ms)
- `PAGE_LOAD_TIMEOUT=240000`: Selenium page-load timeout (ms)
- `PYTEST_WORKERS=auto`: Pytest-xdist worker count (use `1` to serialize)
- `APPIUM_SERVER_URL=http://localhost:4723`: Appium server URL
- `IOS_PLATFORM_VERSION`, `IOS_DEVICE_NAME`, `IOS_UDID`: iOS simulator/device selection
- `IOS_PYTEST_MARKER=ios|mobile|safari`: Limit iOS test markers in `run_ios_tests.sh`

#### Chrome Options

- Headless mode for CI/CD
- Custom window size (1920x1080)
- Disabled security for local testing
- Console log capture for error detection

### 🚨 Common Issues and Solutions

#### Test Failures

1. **Timeout Errors**: Increase wait times or check server startup
2. **Element Not Found**: Verify CSS selectors match current markup
3. **JavaScript Errors**: Update error filtering for new optional modules
4. **Chrome Driver Issues**: Ensure Chrome/Chromium is installed

#### Performance Issues

- Tests run in headless mode for speed
- Pytest uses xdist parallelism; set `PYTEST_WORKERS=1` to debug in serial
- Shared browser instances per test class to reduce overhead

### 📈 Future Enhancements

#### Potential Additions

- **Visual Regression**: Screenshot comparison testing
- **API Testing**: Backend endpoint validation
- **Load Testing**: Performance under concurrent users
- **Cross-browser**: Firefox, Safari, Edge testing
- **Mobile Devices**: Real device testing via cloud services
- **Accessibility**: WCAG compliance automation

#### Integration Options

- **Monitoring**: Connect to application performance monitoring
- **Reporting**: Integration with test management systems
- **Alerting**: Slack/email notifications for test failures
- **Metrics**: Test execution time and success rate tracking

## Success Criteria Met ✅

The comprehensive Selenium test suite successfully validates:

- ✅ Core site functionality works as expected
- ✅ Build process completes without critical errors
- ✅ User interface elements are accessible and functional
- ✅ Responsive design works across viewports
- ✅ JavaScript executes properly for core features
- ✅ Performance meets acceptable standards
- ✅ CI/CD pipeline ready for automated testing

This test infrastructure ensures that any code changes can be validated
automatically before deployment, maintaining high quality and reliability
standards for the Explore Scripture application.

## Commentary System Tests (`test_commentary_system.py`)

**Status**: ✅ **COMPLETED & FIXED**

Comprehensive test suite for the Commentary Reader system with 11 commentary
sources.

### Test Coverage

1. **Commentary Button Presence**: ✅ Validates Read Chapter and Read Commentary
   buttons exist for all book pages
2. **Modal Functionality**: ✅ Tests commentary modal opening (import issues
   fixed)
3. **Source Switching**: ✅ Verifies switching between different commentary
   sources
4. **Iframe vs Direct Access**: ✅ Tests iframe-compatible vs blocked sources
   handling
5. **Book Name Edge Cases**: ✅ Validates URL generation for special cases
6. **Keyboard Navigation**: ✅ Tests ESC key and keyboard interactions
7. **Chapter Reader Integration**: ✅ Ensures both systems work together
8. **Mobile Responsiveness**: ✅ Tests mobile viewport functionality
9. **Universal Coverage**: ✅ Validates all 66 biblical books have commentary

### Test Results Summary

- **✅ Core Functionality**: Commentary buttons are properly created and present
- **✅ UI Interactions**: Import issues resolved (selenium.webdriver vs
  selenium.webchrome_driver)
- **✅ Test Framework**: Proper Selenium setup with Chrome driver
- **✅ Server Integration**: Development server properly detected and used

## Entity System Tests (`test_entities_system.py`)

**Status**: 🆕 **NEW - COMPREHENSIVE COVERAGE**

Complete test suite for the new Entity/Character system replacing the old
character system.

### Test Coverage

1. **Entity Page Loading**: ✅ Tests entities overview page loads with proper
   listings
2. **Entity Search**: ✅ Validates search functionality for filtering entities
3. **Individual Entity Pages**: ✅ Tests specific entity pages with proper
   information display
4. **Cross-References**: ✅ Validates links between entities and biblical books
5. **Book Filtering**: ✅ Tests filtering entities by biblical books
6. **Responsive Design**: ✅ Mobile viewport testing and layout validation
7. **Navigation Breadcrumbs**: ✅ Tests navigation between entity and overview
   pages
8. **Error Handling**: ✅ Validates proper handling of invalid entity IDs
9. **Data Integrity**: ✅ Tests entity data loading and JavaScript error
   monitoring

### Key Features Validated

- **Entity Page Structure**: Professional layouts with entity information and
  cross-references
- **Search Integration**: Client-side filtering and search functionality
- **Cross-Reference System**: Links between entities and biblical books
- **Mobile Optimization**: Responsive design with proper card stacking
- **Error Handling**: Graceful handling of non-existent entities
- **Data Loading**: Proper entity data loading without critical JavaScript
  errors

### Entity Test Data

Sample entities tested:

- **Adam** (`p.adam.gene-2-5--6921e439`): Genesis references
- **Moses** (`p.moses.exod-2-10--e5a2f8b7`): Exodus, Numbers, Deuteronomy
- **David** (`p.david.1sam-16-13--c4d3e9f1`): Samuel, Psalms references

### Edge Cases Tested

- **Invalid Entity IDs**: Proper 404 handling or redirect to entities page
- **Mobile Responsiveness**: Card stacking and viewport optimization
- **Cross-References**: Bidirectional links between entities and books
- **Search Performance**: Real-time filtering without page refresh
- **Data Integrity**: JavaScript error monitoring for entity-related issues
