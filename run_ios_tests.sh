#!/bin/bash
# Run iOS Safari specific tests for Bible Explorer

set -e

echo " Starting iOS Safari Test Suite"
echo "=================================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "ERROR iOS testing requires macOS"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "test-env" ]; then
    echo " Creating Python virtual environment..."
    python3 -m venv test-env
fi

# Activate virtual environment
echo " Activating virtual environment..."
source test-env/bin/activate

# Install dependencies
echo " Installing test dependencies..."
pip install -r tests/requirements.txt > /dev/null 2>&1

# Check Safari WebDriver availability
echo " Checking Safari WebDriver..."
if ! command -v safaridriver &> /dev/null; then
    echo "ERROR Safari WebDriver not found. Please install or enable Safari WebDriver:"
    echo "   1. Open Safari > Preferences > Advanced"
    echo "   2. Check 'Show Develop menu in menu bar'"
    echo "   3. Go to Develop > Allow Remote Automation"
    echo "   4. Run: sudo safaridriver --enable"
    exit 1
fi

# Check if Appium is available for full iOS testing
APPIUM_AVAILABLE=false
if command -v appium &> /dev/null; then
    APPIUM_AVAILABLE=true
    echo "OK Appium found - full iOS simulator testing available"
else
    echo "WARN  Appium not found - using Safari desktop simulation"
    echo "   For full iOS testing, install Appium:"
    echo "   npm install -g appium@next"
    echo "   appium driver install xcuitest"
fi

# Check if iOS Simulator is available
IOS_SIM_AVAILABLE=false
if command -v xcrun &> /dev/null && xcrun simctl list devices available | grep -q "iPhone"; then
    IOS_SIM_AVAILABLE=true
    echo "OK iOS Simulator available"
else
    echo "WARN  iOS Simulator not available - install Xcode for full iOS testing"
fi

echo ""
echo " Running iOS Safari tests..."
echo ""

# Determine which tests to run based on availability
if [ "$APPIUM_AVAILABLE" = true ] && [ "$IOS_SIM_AVAILABLE" = true ]; then
    echo " Running full iOS test suite (including simulator tests)..."
    
    # Check if Appium server is running
    if ! curl -s http://localhost:4723/status > /dev/null; then
        echo "WARN  Appium server not running. Starting Appium in background..."
        appium --port 4723 > /dev/null 2>&1 &
        APPIUM_PID=$!
        echo "   Appium server started (PID: $APPIUM_PID)"
        sleep 5
        
        # Cleanup function
        cleanup() {
            if [ ! -z "$APPIUM_PID" ]; then
                echo " Stopping Appium server..."
                kill $APPIUM_PID 2>/dev/null || true
            fi
        }
        trap cleanup EXIT
    fi
    
    # Run all iOS tests
    python -m pytest tests/test_ios_safari.py \
        --html=ios_test_report.html \
        --self-contained-html \
        -v \
        --tb=short
else
    echo " Running Safari mobile simulation tests..."
    
    # Run only mobile simulation tests
    python -m pytest tests/test_ios_safari.py \
        --html=mobile_test_report.html \
        --self-contained-html \
        -v \
        --tb=short \
        -m "not ios"
fi

# Check test results
TEST_EXIT_CODE=$?

echo ""
echo "=================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "OK All iOS Safari tests passed!"
    if [ "$APPIUM_AVAILABLE" = true ]; then
        echo " Test report available at: ios_test_report.html"
    else
        echo " Test report available at: mobile_test_report.html"
    fi
    echo ""
    echo " To run specific test types:"
    echo "   npm run test:mobile   # Mobile responsive tests"
    echo "   npm run test:safari   # Safari-specific tests"
    echo "   npm run test:ios      # iOS-only tests (requires iOS Simulator)"
else
    echo "ERROR Some tests failed (exit code: $TEST_EXIT_CODE)"
    echo " Check the test report for detailed results"
fi

echo " iOS Safari test suite complete"
exit $TEST_EXIT_CODE
