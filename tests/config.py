"""
Test configuration for URL management
Provides centralized URL configuration for tests
"""
import os

# Default URLs - can be overridden by environment variables
DEFAULT_PRODUCTION_URL = "https://explore-scripture.pages.dev"
DEFAULT_LOCAL_URL = "http://localhost:8080"

def get_base_url():
    """
    Get the base URL for testing
    - Uses LOCAL_BASE_URL if EXPLORE_SCRIPTURE_LOCAL=true is set
    - Otherwise uses production URL
    - Can be overridden by environment variables
    """
    if os.getenv("EXPLORE_SCRIPTURE_LOCAL", "").lower() == "true":
        return os.getenv("LOCAL_BASE_URL", DEFAULT_LOCAL_URL)
    return os.getenv("PRODUCTION_BASE_URL", DEFAULT_PRODUCTION_URL)

def get_test_urls():
    """Get common test URLs"""
    base = get_base_url()
    return {
        "base": base,
        "genesis": f"{base}/books/genesis/",
        "entities": f"{base}/entities/",
        "categories": f"{base}/categories/",
        "gospel_thread": f"{base}/gospel-thread/",
        "search_api": f"{base}/api/search",
    }

# For backwards compatibility
BASE_URL = get_base_url()