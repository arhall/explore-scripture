"""
Pytest configuration and shared fixtures for Bible Explorer tests
"""

import pytest
import subprocess
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.safari.options import Options as SafariOptions
from appium import webdriver as appium_webdriver
from appium.options.ios import XCUITestOptions


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


@pytest.fixture(scope="session")
def server():
    """Start development server for testing"""
    # Check if server is already running
    if wait_for_server("http://localhost:8080", timeout=5):
        print("Development server already running")
        yield "http://localhost:8080"
        return
    
    # Start server if not running
    print("Starting development server...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    # Wait for server to be ready
    if not wait_for_server("http://localhost:8080", timeout=30):
        proc.terminate()
        pytest.fail("Development server failed to start")
    
    print("Development server ready")
    yield "http://localhost:8080"
    
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
    
    yield driver
    
    driver.quit()


@pytest.fixture(scope="function")
def safari_driver():
    """Create Safari WebDriver instance for macOS testing"""
    try:
        driver = webdriver.Safari()
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    except Exception as e:
        pytest.skip(f"Safari WebDriver not available: {e}")


@pytest.fixture(scope="function")
def mobile_safari_driver():
    """Create mobile Safari simulation for responsive testing"""
    try:
        driver = webdriver.Safari()
        # Set iPhone 14 Pro dimensions
        driver.set_window_size(393, 852)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    except Exception as e:
        pytest.skip(f"Safari WebDriver not available: {e}")


@pytest.fixture(scope="function")
def ios_simulator_driver():
    """Create iOS Simulator WebDriver instance (requires Appium)"""
    options = XCUITestOptions()
    options.platform_name = "iOS"
    options.platform_version = "16.0"
    options.device_name = "iPhone 14"
    options.browser_name = "Safari"
    options.automation_name = "XCUITest"
    options.new_command_timeout = 60
    options.command_timeouts = {'implicit': 30}
    
    try:
        driver = appium_webdriver.Remote(
            command_executor='http://localhost:4723',
            options=options
        )
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    except Exception as e:
        pytest.skip(f"iOS Simulator not available: {e}. Ensure Appium server is running.")


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