"""
Pytest configuration and shared fixtures for Bible Explorer tests
"""

import os
import pytest
import subprocess
import time
import json
from datetime import timedelta
from pathlib import Path
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from appium import webdriver as appium_webdriver
from appium.options.ios import XCUITestOptions
from config import get_base_url, get_test_urls

REPORTS_DIR = Path(os.getenv("TEST_REPORT_DIR", Path(__file__).parent / "reports"))
ARTIFACTS_DIR = REPORTS_DIR / "artifacts"


@pytest.fixture(scope="session", autouse=True)
def ensure_report_dirs():
    """Ensure test report directories exist."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    yield


def _sanitize_nodeid(nodeid: str) -> str:
    return "".join(ch if ch.isalnum() or ch in "-_." else "_" for ch in nodeid)


def wait_for_server(url, timeout=30):
    """Wait for development server to be ready"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return True
        except requests.exceptions.RequestException:
            pass
        time.sleep(1)
    return False


def _configure_driver_timeouts(driver):
    test_timeout_ms = int(os.getenv("TEST_TIMEOUT", "240000"))
    page_load_timeout_ms = int(os.getenv("PAGE_LOAD_TIMEOUT", "240000"))
    command_timeout_seconds = max(test_timeout_ms, page_load_timeout_ms) / 1000
    try:
        driver.set_script_timeout(test_timeout_ms / 1000)
    except Exception:
        pass
    try:
        driver.set_page_load_timeout(page_load_timeout_ms / 1000)
    except Exception:
        pass
    try:
        client = getattr(driver, "command_executor", None)
        if client is None:
            return
        if hasattr(client, "_client_config"):
            current = client._client_config.timeout
            if not current or current < command_timeout_seconds:
                client._client_config.timeout = command_timeout_seconds
        elif hasattr(client, "timeout"):
            current = client.timeout
            if not current or current < command_timeout_seconds:
                client.timeout = command_timeout_seconds
    except Exception:
        pass


@pytest.fixture(scope="session")
def server():
    """Start development server for testing (only for local testing)"""
    base_url = get_base_url()
    
    # Only relevant for local testing
    if "localhost" not in base_url:
        print(f"Using production URL: {base_url}")
        yield base_url
        return
    
    # Check if server is already running
    if wait_for_server(base_url, timeout=5):
        print("Development server already running")
        yield base_url
        return
    
    # Start server if not running
    print("Starting development server...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    # Wait for server to be ready
    if not wait_for_server(base_url, timeout=30):
        proc.terminate()
        pytest.fail("Development server failed to start")
    
    print("Development server ready")
    yield base_url
    
    # Cleanup
    proc.terminate()
    proc.wait(timeout=10)


@pytest.fixture(scope="function")
def chrome_driver():
    """Create Chrome WebDriver instance for tests"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument('--disable-logging')
    chrome_options.add_argument('--log-level=3')
    
    # Enable browser logging
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(10)
    _configure_driver_timeouts(driver)
    
    yield driver
    
    driver.quit()


@pytest.fixture(scope="function")
def safari_driver():
    """Create Safari WebDriver instance for macOS testing"""
    try:
        driver = webdriver.Safari()
        driver.implicitly_wait(10)
        _configure_driver_timeouts(driver)
        yield driver
        driver.quit()
    except Exception as e:
        pytest.skip(f"Safari WebDriver not available: {e}")


def _get_appium_server_url():
    return os.getenv("APPIUM_SERVER_URL", "http://localhost:4723")


_DETECTED_IOS_RUNTIME = None


def _detect_ios_runtime_version():
    global _DETECTED_IOS_RUNTIME
    if _DETECTED_IOS_RUNTIME is not None:
        return _DETECTED_IOS_RUNTIME
    try:
        result = subprocess.run(
            ["xcrun", "simctl", "list", "runtimes", "-j"],
            check=True,
            capture_output=True,
            text=True,
        )
        data = json.loads(result.stdout)
        runtimes = [
            runtime
            for runtime in data.get("runtimes", [])
            if runtime.get("platform") == "iOS" and runtime.get("isAvailable", True)
        ]
        if not runtimes:
            _DETECTED_IOS_RUNTIME = None
            return None

        def _parse_version(version):
            return tuple(int(part) for part in version.split(".") if part.isdigit())

        best = max(runtimes, key=lambda rt: _parse_version(rt.get("version", "0")))
        _DETECTED_IOS_RUNTIME = best.get("version")
        return _DETECTED_IOS_RUNTIME
    except Exception:
        _DETECTED_IOS_RUNTIME = None
        return None


def _build_ios_options():
    options = XCUITestOptions()
    options.platform_name = os.getenv("IOS_PLATFORM_NAME", "iOS")
    platform_version = os.getenv("IOS_PLATFORM_VERSION")
    if not platform_version:
        platform_version = _detect_ios_runtime_version() or "16.0"
    options.platform_version = platform_version
    options.device_name = os.getenv("IOS_DEVICE_NAME", "iPhone 14")
    options.browser_name = "Safari"
    options.automation_name = "XCUITest"
    options.new_command_timeout = int(os.getenv("IOS_NEW_COMMAND_TIMEOUT", "60"))
    implicit_seconds = int(os.getenv("IOS_IMPLICIT_TIMEOUT", "30"))
    options.command_timeouts = {"implicit": timedelta(seconds=implicit_seconds)}
    udid = os.getenv("IOS_UDID")
    if udid:
        options.udid = udid
    return options


@pytest.fixture(scope="function")
def mobile_safari_driver(ios_simulator_driver):
    """Create mobile Safari driver via Appium (iOS Simulator/Device)."""
    return ios_simulator_driver


@pytest.fixture(scope="function")
def ios_simulator_driver():
    """Create iOS Simulator WebDriver instance (requires Appium)."""
    options = _build_ios_options()
    try:
        driver = appium_webdriver.Remote(
            command_executor=_get_appium_server_url(),
            options=options,
        )
        driver.implicitly_wait(10)
        _configure_driver_timeouts(driver)
        yield driver
        driver.quit()
    except Exception as e:
        pytest.skip(
            "iOS Simulator not available. Ensure Appium server is running and a simulator/device is booted. "
            f"Details: {e}"
        )


@pytest.fixture(scope="function")
def ios_driver(ios_simulator_driver):
    """Alias for iOS simulator/device driver used by iOS-specific tests."""
    return ios_simulator_driver


def pytest_configure(config):
    """Configure custom markers"""
    config.addinivalue_line(
        "markers", "ios: mark test to run only on iOS devices/simulators"
    )
    config.addinivalue_line(
        "markers", "safari: mark test to run only on Safari browser"
    )
    config.addinivalue_line(
        "markers", "mobile: mark test for mobile-specific functionality"
    )


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture artifacts on failure for WebDriver-based tests."""
    outcome = yield
    report = outcome.get_result()
    if report.when != "call" or not report.failed:
        return

    driver = None
    for key in (
        "chrome_driver",
        "driver",
        "browser",
        "mobile_safari_driver",
        "safari_driver",
        "ios_driver",
        "ios_simulator_driver",
    ):
        candidate = item.funcargs.get(key)
        if candidate and hasattr(candidate, "get_screenshot_as_file"):
            driver = candidate
            break

    if not driver:
        return

    filename = _sanitize_nodeid(item.nodeid)
    screenshot_path = ARTIFACTS_DIR / f"{filename}.png"
    html_path = ARTIFACTS_DIR / f"{filename}.html"

    try:
        driver.save_screenshot(str(screenshot_path))
    except Exception:
        pass

    try:
        html_path.write_text(driver.page_source, encoding="utf-8")
    except Exception:
        pass
