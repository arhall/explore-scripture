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

# Check if Appium is available for iOS testing
APPIUM_AVAILABLE=false
if command -v appium &> /dev/null; then
    APPIUM_AVAILABLE=true
    echo "OK Appium found - iOS simulator testing available"
else
    echo "ERROR Appium not found - iOS tests require Appium now"
    echo "   Install Appium:"
    echo "   npm install -g appium@next"
    echo "   appium driver install xcuitest"
    exit 1
fi

# Check if iOS Simulator is available
IOS_SIM_AVAILABLE=false
if command -v xcrun &> /dev/null; then
    IOS_SIM_AVAILABLE=true
    echo "OK iOS Simulator available"
else
    echo "WARN  iOS Simulator not available - install Xcode for full iOS testing"
fi

echo ""
echo " Running iOS Safari tests..."
echo ""

IOS_PYTEST_MARKER="${IOS_PYTEST_MARKER:-}"

detect_ios_runtime_and_device() {
    python3 - <<'PY'
import json
import os
import subprocess

def parse_version(version):
    return tuple(int(part) for part in version.split(".") if part.isdigit())

data = json.loads(subprocess.check_output(["xcrun", "simctl", "list", "-j", "devices", "runtimes"], text=True))
runtimes = [
    rt for rt in data.get("runtimes", [])
    if rt.get("platform") == "iOS" and rt.get("isAvailable", True)
]
if not runtimes:
    raise SystemExit("No available iOS runtimes found.")

requested_version = os.getenv("IOS_PLATFORM_VERSION")
if requested_version:
    selected_runtime = next((rt for rt in runtimes if rt.get("version") == requested_version), None)
else:
    selected_runtime = max(runtimes, key=lambda rt: parse_version(rt.get("version", "0")))
    requested_version = selected_runtime.get("version")

if not selected_runtime:
    selected_runtime = max(runtimes, key=lambda rt: parse_version(rt.get("version", "0")))
    requested_version = selected_runtime.get("version")

runtime_id = selected_runtime.get("identifier")
devices = data.get("devices", {}).get(runtime_id, [])
available = [d for d in devices if d.get("isAvailable") and not d.get("availabilityError")]
if not available:
    raise SystemExit(f"No available devices for runtime {requested_version}.")

desired_name = (os.getenv("IOS_DEVICE_NAME") or "").lower()
selected_device = None
if desired_name:
    selected_device = next((d for d in available if desired_name in d.get("name", "").lower()), None)
if not selected_device:
    selected_device = next((d for d in available if d.get("name", "").startswith("iPhone")), None)
if not selected_device:
    selected_device = available[0]

print("|".join([
    requested_version or "",
    runtime_id or "",
    selected_device.get("udid", ""),
    selected_device.get("name", ""),
]))
PY
}

# Determine which tests to run based on availability
if [ "$IOS_SIM_AVAILABLE" = true ]; then
    echo " Detecting iOS runtime and simulator..."
    DETECTED_INFO="$(detect_ios_runtime_and_device)" || {
        echo "ERROR Failed to detect iOS runtime/device. Ensure simulators are installed."
        exit 1
    }
    IFS="|" read -r IOS_PLATFORM_VERSION IOS_RUNTIME_ID IOS_UDID IOS_DEVICE_NAME <<< "$DETECTED_INFO"
    export IOS_PLATFORM_VERSION IOS_DEVICE_NAME IOS_UDID
    echo "OK Using iOS runtime: ${IOS_PLATFORM_VERSION} | Device: ${IOS_DEVICE_NAME}"
    echo " Booting simulator..."
    xcrun simctl boot "$IOS_UDID" >/dev/null 2>&1 || true
    open -a Simulator >/dev/null 2>&1 || true
    echo " Running iOS Safari tests via Appium..."
else
    echo "ERROR iOS Simulator not available - install Xcode and boot a simulator"
    exit 1
fi

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

# Run iOS tests (optionally filtered by marker)
PYTEST_MARKER_ARGS=()
if [ -n "$IOS_PYTEST_MARKER" ]; then
    PYTEST_MARKER_ARGS=(-m "$IOS_PYTEST_MARKER")
fi

python -m pytest tests/test_ios_safari.py \
    "${PYTEST_MARKER_ARGS[@]}" \
    --html=ios_test_report.html \
    --self-contained-html \
    -v \
    --tb=short

# Check test results
TEST_EXIT_CODE=$?

echo ""
echo "=================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "OK All iOS Safari tests passed!"
    echo " Test report available at: ios_test_report.html"
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
