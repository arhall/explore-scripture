# iOS Safari Testing Guide

## Overview
This guide covers setting up and running iOS Safari UI automation tests for Explore Scripture using Selenium WebDriver and Appium.

## Test Types

### 1. **Safari Desktop Simulation** (Easiest)
- Uses macOS Safari WebDriver
- Simulates mobile viewport (375x812, 393x852)
- Tests responsive design and touch interactions
- **Requirements**: macOS with Safari

### 2. **iOS Simulator Testing** (Recommended)
- Uses iOS Simulator with real Safari browser
- Tests actual iOS Safari behavior
- **Requirements**: macOS, Xcode, Appium Server

### 3. **Real iOS Device Testing** (Most Comprehensive)  
- Tests on actual iOS devices
- Real network conditions and hardware
- **Requirements**: iOS device, developer provisioning

## Setup Instructions

### Prerequisites
- macOS (required for iOS testing)
- Python 3.9+
- Node.js and npm
- Xcode (for iOS Simulator)

### Quick Setup (Safari Desktop Simulation)
```bash
# 1. Install Python dependencies
npm run test:setup

# 2. Enable Safari WebDriver (one time setup)
# Go to Safari > Preferences > Advanced
# Check "Show Develop menu in menu bar"
# Go to Develop > Allow Remote Automation

# 3. Run mobile Safari tests
npm run test:mobile
```

### Full iOS Setup (iOS Simulator)

#### 1. Install Xcode
```bash
# Install from App Store or developer.apple.com
# Install command line tools
xcode-select --install
```

#### 2. Install Appium
```bash
# Install Appium globally
npm install -g appium@next

# Install iOS driver
appium driver install xcuitest

# Install Appium Doctor to verify setup
npm install -g appium-doctor
appium-doctor --ios
```

#### 3. Setup iOS Simulator
```bash
# List available simulators
xcrun simctl list devices available

# Boot iPhone 14 simulator (adjust as needed)
xcrun simctl boot "iPhone 14"

# Open Simulator app
open -a Simulator
```

#### 4. Start Appium Server
```bash
# Start Appium server (run in separate terminal)
appium --port 4723
```

#### 5. Run iOS Tests
```bash
# Run all iOS tests
npm run test:ios-all

# Run only iOS-specific tests  
npm run test:ios

# Run only mobile responsive tests
npm run test:mobile
```

## Available Test Commands

### Safari Desktop Simulation
```bash
npm run test:safari     # Safari-specific tests
npm run test:mobile     # Mobile responsive tests
```

### iOS Simulator/Device Tests
```bash
npm run test:ios        # iOS-specific tests only
npm run test:ios-all    # All iOS Safari tests
```

### Individual Test Files
```bash
# Run specific test file
source test-env/bin/activate
python -m pytest tests/test_ios_safari.py -v

# Run with specific markers
python -m pytest tests/test_ios_safari.py -v -m mobile
python -m pytest tests/test_ios_safari.py -v -m ios
```

## Test Coverage

### Mobile Responsive Tests (`@pytest.mark.mobile`)
- ✅ Homepage loading on mobile viewport
- ✅ Mobile navigation menu
- ✅ Theme toggle functionality
- ✅ Character search on mobile
- ✅ Chapter reader modal behavior
- ✅ Mobile-specific view toggle (iframe vs text view)
- ✅ Scripture widget touch functionality
- ✅ Responsive design validation
- ✅ Touch target size verification (44px minimum)
- ✅ Mobile performance metrics
- ✅ Book navigation flow
- ✅ Basic accessibility features

### iOS-Specific Tests (`@pytest.mark.ios`)
- ✅ Safari viewport behavior (address bar hiding)
- ✅ iOS touch events and gestures
- ✅ Safari-specific UI behaviors
- ✅ iOS keyboard interactions

### Safari Tests (`@pytest.mark.safari`)
- ✅ Safari WebDriver functionality
- ✅ Safari-specific CSS features
- ✅ WebKit rendering behavior

## Troubleshooting

### Safari WebDriver Issues
```bash
# Enable Safari WebDriver
sudo safaridriver --enable

# Check Safari WebDriver status
safaridriver --version
```

### iOS Simulator Issues
```bash
# Reset iOS Simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Reinstall iOS Simulator
# Xcode > Preferences > Components > iOS Simulators
```

### Appium Server Issues
```bash
# Check Appium installation
appium --version
appium driver list

# Reset Appium
npm uninstall -g appium
npm install -g appium@next
appium driver install xcuitest
```

### Common Error Solutions

#### "Safari WebDriver not available"
- Enable Safari WebDriver in Safari preferences
- Run `sudo safaridriver --enable`

#### "iOS Simulator not available"
- Install Xcode and iOS Simulator
- Boot simulator: `xcrun simctl boot "iPhone 14"`

#### "Appium server not running"
- Start Appium: `appium --port 4723`
- Check firewall isn't blocking port 4723

#### "Touch actions not working"
- Ensure using TouchActions for iOS-specific touch events
- Verify simulator touch simulation is enabled

## CI/CD Integration

### GitHub Actions Example
```yaml
name: iOS Safari Tests
on: [push, pull_request]

jobs:
  ios-tests:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        npm install
        npm run test:setup
    
    - name: Setup Safari WebDriver
      run: sudo safaridriver --enable
    
    - name: Start dev server
      run: npm run dev &
    
    - name: Run Safari mobile tests
      run: npm run test:mobile
      
    - name: Setup iOS Simulator (if needed)
      run: |
        xcrun simctl boot "iPhone 14"
        npm install -g appium@next
        appium driver install xcuitest
        appium --port 4723 &
        
    - name: Run iOS tests
      run: npm run test:ios
```

## Performance Considerations

### Test Execution Time
- **Safari Simulation**: ~30 seconds per test
- **iOS Simulator**: ~60 seconds per test (includes boot time)
- **Real Device**: ~45 seconds per test

### Optimization Tips
1. **Reuse Safari instances** when possible
2. **Run tests in parallel** with pytest-xdist
3. **Use headless mode** for CI/CD
4. **Cache simulator state** between test runs

### Parallel Execution
```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
python -m pytest tests/test_ios_safari.py -n 2 -v
```

## Mobile-Specific Features Tested

### Chapter Reader Enhancements
- ✅ Full-screen mobile modal (100vw × 95vh)
- ✅ BibleGateway vs Text View toggle
- ✅ Mobile-optimized iframe sizing
- ✅ Touch-friendly controls
- ✅ Translation switching functionality

### Character Search  
- ✅ Client-side search without page refresh
- ✅ Touch-friendly search input
- ✅ Real-time result filtering

### Scripture Widget
- ✅ Touch/tap activation (vs hover on desktop)
- ✅ Mobile-optimized popup positioning
- ✅ Touch target sizing

### Theme System
- ✅ 24-theme support on mobile
- ✅ Automatic dark mode detection
- ✅ Touch-friendly theme toggle

This comprehensive iOS testing setup ensures Explore Scripture works perfectly on iOS Safari across different device sizes and iOS versions.