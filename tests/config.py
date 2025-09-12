"""
Test configuration for URL management
Provides centralized URL configuration for tests
"""
import os
from pathlib import Path

# Load environment variables from .env.test.local and .env files
try:
    from dotenv import load_dotenv
    
    # Get project root directory (one level up from tests/)
    project_root = Path(__file__).parent.parent
    
    # Load .env.test.local first (highest priority)
    env_test_local = project_root / '.env.test.local'
    if env_test_local.exists():
        load_dotenv(env_test_local)
        print(f"Loaded test configuration from: {env_test_local}")
    
    # Load .env.test if exists
    env_test = project_root / '.env.test'
    if env_test.exists():
        load_dotenv(env_test, override=False)
        print(f"Loaded test configuration from: {env_test}")
    
    # Load .env as fallback
    env_file = project_root / '.env'
    if env_file.exists():
        load_dotenv(env_file, override=False)
        
except ImportError:
    print("python-dotenv not installed. Install with: pip install python-dotenv")
except Exception as e:
    print(f"Warning: Could not load environment file: {e}")

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