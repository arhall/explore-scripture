# Test Environment Setup

This directory contains automated tests for the Explore Scripture application.

## Quick Setup

1. **Install test dependencies:**
   ```bash
   npm run test:setup
   ```

2. **Configure test environment:**
   ```bash
   # Copy the example file and customize for your setup
   cp .env.test.example .env.test.local
   ```

3. **Run tests:**
   ```bash
   # All tests
   npm run test:selenium
   
   # Environment validation
   python -m pytest tests/test_env_config.py -v
   
   # Specific test suite
   npm run test:smoke
   ```

## Environment Configuration

Tests use `.env.test.local` for configuration:

```bash
# Test against local development server (default)
EXPLORE_SCRIPTURE_LOCAL=true
LOCAL_BASE_URL=http://localhost:8080

# Or test against production
EXPLORE_SCRIPTURE_LOCAL=false
PRODUCTION_BASE_URL=https://explore-scripture.pages.dev

# Browser settings
HEADLESS=false           # Show browser window during tests
BROWSER_WIDTH=1280
BROWSER_HEIGHT=720

# Timeouts
TEST_TIMEOUT=30000       # 30 seconds
PAGE_LOAD_TIMEOUT=10000  # 10 seconds
```

## Available Test Suites

- `npm run test:selenium` - All Selenium-based tests
- `npm run test:smoke` - Quick smoke tests
- `npm run test:ios` - iOS Safari tests
- `npm run test:mobile` - Mobile-specific tests
- `npm run test:entities` - Entity system tests

## Test Files

- `test_env_config.py` - Environment configuration validation
- `test_bible_explorer.py` - Main application tests
- `test_commentary_system.py` - Commentary functionality tests
- `test_regression_fixes.py` - Regression test suite
- `test_scripture_widget.py` - Scripture widget tests
- `config.py` - Centralized test configuration

## Browser Requirements

- **Chrome/Chromium** - Primary test browser
- **Safari** - For iOS testing (requires macOS)
- **Mobile Testing** - Requires Appium server

## Troubleshooting

1. **Environment not loading:**
   ```bash
   python tests/test_env_config.py
   ```

2. **Server connection issues:**
   - Ensure dev server is running on correct port
   - Check firewall settings
   - Verify URLs in configuration

3. **Browser driver issues:**
   - Update ChromeDriver: `brew install chromedriver`
   - For Safari: Enable Developer menu and Remote Automation

## CI/CD Integration

Tests are configured to run automatically with environment-specific settings:
- Local development: Uses `.env.test.local`
- CI/CD: Uses environment variables or `.env.test`
- Production testing: Configured via `EXPLORE_SCRIPTURE_LOCAL=false`