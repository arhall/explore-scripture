"""
Test environment configuration validation
"""
import os
import pytest
from config import get_base_url, get_test_urls


def test_environment_variables_loaded():
    """Test that environment variables are properly loaded"""
    # These should be loaded from .env.test.local
    assert os.getenv("EXPLORE_SCRIPTURE_LOCAL") is not None
    assert os.getenv("LOCAL_BASE_URL") is not None
    assert os.getenv("PRODUCTION_BASE_URL") is not None
    
    print(f"EXPLORE_SCRIPTURE_LOCAL: {os.getenv('EXPLORE_SCRIPTURE_LOCAL')}")
    print(f"LOCAL_BASE_URL: {os.getenv('LOCAL_BASE_URL')}")
    print(f"PRODUCTION_BASE_URL: {os.getenv('PRODUCTION_BASE_URL')}")


def test_base_url_selection():
    """Test that the correct base URL is selected based on environment"""
    base_url = get_base_url()
    
    if os.getenv("EXPLORE_SCRIPTURE_LOCAL", "").lower() == "true":
        expected = os.getenv("LOCAL_BASE_URL", "http://localhost:8080")
        assert base_url == expected, f"Expected {expected}, got {base_url}"
        print(f"✅ Using local development server: {base_url}")
    else:
        expected = os.getenv("PRODUCTION_BASE_URL", "https://explore-scripture.pages.dev")
        assert base_url == expected, f"Expected {expected}, got {base_url}"
        print(f"✅ Using production server: {base_url}")


def test_test_urls_generated():
    """Test that test URLs are properly generated"""
    urls = get_test_urls()
    
    required_keys = ["base", "genesis", "entities", "categories", "gospel_thread"]
    for key in required_keys:
        assert key in urls, f"Missing required URL key: {key}"
        assert urls[key].startswith("http"), f"Invalid URL for {key}: {urls[key]}"
    
    print("✅ Test URLs generated successfully:")
    for key, url in urls.items():
        print(f"  {key}: {url}")


def test_browser_configuration():
    """Test browser configuration variables"""
    width = os.getenv("BROWSER_WIDTH", "1280")
    height = os.getenv("BROWSER_HEIGHT", "720")
    headless = os.getenv("HEADLESS", "false").lower() == "true"
    
    assert width.isdigit(), f"BROWSER_WIDTH should be numeric, got: {width}"
    assert height.isdigit(), f"BROWSER_HEIGHT should be numeric, got: {height}"
    assert isinstance(headless, bool), f"HEADLESS should be boolean, got: {headless}"
    
    print(f"✅ Browser config - Width: {width}, Height: {height}, Headless: {headless}")


def test_timeout_configuration():
    """Test timeout configuration variables"""
    test_timeout = int(os.getenv("TEST_TIMEOUT", "30000"))
    page_load_timeout = int(os.getenv("PAGE_LOAD_TIMEOUT", "10000"))
    
    assert test_timeout > 0, f"TEST_TIMEOUT should be positive, got: {test_timeout}"
    assert page_load_timeout > 0, f"PAGE_LOAD_TIMEOUT should be positive, got: {page_load_timeout}"
    
    print(f"✅ Timeouts - Test: {test_timeout}ms, Page Load: {page_load_timeout}ms")


if __name__ == "__main__":
    """Run this test independently to validate environment setup"""
    test_environment_variables_loaded()
    test_base_url_selection()
    test_test_urls_generated()
    test_browser_configuration()
    test_timeout_configuration()
    print("\n🎉 All environment configuration tests passed!")