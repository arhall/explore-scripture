#!/bin/bash
# Run comprehensive test suite for Bible Explorer

set -e

echo "🚀 Starting Bible Explorer Test Suite"
echo "======================================"

# Check if virtual environment exists
if [ ! -d "test-env" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv test-env
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source test-env/bin/activate

# Install dependencies
echo "📥 Installing test dependencies..."
pip install -r tests/requirements.txt > /dev/null 2>&1

# Check if Chrome is available
echo "🌐 Checking Chrome availability..."
if ! command -v google-chrome &> /dev/null && ! command -v chrome &> /dev/null; then
    echo "❌ Chrome not found. Please install Chrome or Chromium for testing."
    exit 1
fi

# Start tests
echo "🧪 Running test suite..."
echo ""

# Run tests with detailed output
python -m pytest tests/ \
    --html=test_report.html \
    --self-contained-html \
    -v \
    --tb=short

# Check test results
TEST_EXIT_CODE=$?

echo ""
echo "======================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "📊 Test report available at: test_report.html"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
    echo "📊 Check test_report.html for detailed results"
fi

echo "🏁 Test suite complete"
exit $TEST_EXIT_CODE