"""
Pytest configuration and shared fixtures for Bible Explorer tests
"""

import pytest
import subprocess
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


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