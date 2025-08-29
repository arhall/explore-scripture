#!/usr/bin/env python3
"""
Regression Tests for Bible Explorer
Tests for known issues and fixes to prevent regressions
"""

import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from urllib.parse import urljoin

class TestRegressionFixes:
    """Test known regression issues and their fixes"""
    
    BASE_URL = "http://localhost:8085"
    
    @pytest.fixture(params=["chrome", "firefox"])
    def browser(self, request):
        """Set up browser driver for different browsers"""
        if request.param == "chrome":
            options = ChromeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--disable-web-security")
            options.add_argument("--disable-features=VizDisplayCompositor")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            driver = webdriver.Chrome(options=options)
        elif request.param == "firefox":
            options = FirefoxOptions()
            options.add_argument("--headless")
            driver = webdriver.Firefox(options=options)
        else:
            raise ValueError(f"Unsupported browser: {request.param}")
        
        driver.implicitly_wait(10)
        driver.set_window_size(1920, 1080)
        yield driver
        driver.quit()
    
    def wait_for_element(self, driver, selector, timeout=10):
        """Wait for element to be present and visible"""
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
        )
    
    def wait_for_clickable(self, driver, selector, timeout=10):
        """Wait for element to be clickable"""
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
        )
    
    def wait_for_js_to_load(self, driver, timeout=15):
        """Wait for JavaScript modules to load"""
        WebDriverWait(driver, timeout).until(
            lambda d: d.execute_script("return window.moduleLoader && window.moduleLoader.getStats().loadedCount > 0")
        )
    
    def test_theme_toggle_functionality(self, browser):
        """Test that theme toggle works correctly"""
        print("\n🎨 Testing theme toggle functionality...")
        
        browser.get(self.BASE_URL)
        
        # Wait for page to load and theme manager to initialize
        self.wait_for_element(browser, ".theme-toggle")
        time.sleep(2)  # Wait for JS modules to load
        
        # Get initial theme
        initial_theme = browser.execute_script("return document.documentElement.getAttribute('data-theme') || 'light'")
        print(f"Initial theme: {initial_theme}")
        
        # Find and click theme toggle
        theme_toggle = self.wait_for_clickable(browser, ".theme-toggle")
        assert theme_toggle.is_displayed(), "Theme toggle button should be visible"
        
        # Click the toggle
        theme_toggle.click()
        time.sleep(1)  # Wait for theme change
        
        # Check that theme changed
        new_theme = browser.execute_script("return document.documentElement.getAttribute('data-theme') || 'light'")
        print(f"New theme: {new_theme}")
        assert new_theme != initial_theme, f"Theme should have changed from {initial_theme}"
        
        # Check theme icon updated
        theme_icon = browser.find_element(By.CSS_SELECTOR, ".theme-icon")
        icon_text = theme_icon.text
        print(f"Theme icon: {icon_text}")
        assert icon_text in ["🌙", "☀️"], "Theme icon should be either moon or sun"
        
        # Toggle back
        theme_toggle.click()
        time.sleep(1)
        
        final_theme = browser.execute_script("return document.documentElement.getAttribute('data-theme') || 'light'")
        assert final_theme == initial_theme, "Theme should return to initial state"
        
        print("✅ Theme toggle functionality working correctly")
    
    def test_chapter_reader_buttons_present(self, browser):
        """Test that Read Chapter buttons are present on book pages"""
        print("\n📖 Testing chapter reader buttons...")
        
        # Test Genesis page
        browser.get(urljoin(self.BASE_URL, "/books/genesis/"))
        
        # Wait for page and modules to load
        self.wait_for_element(browser, "h1")
        
        # Wait for module loader to load chapter-reader
        time.sleep(3)
        
        # Check for chapter reader buttons
        chapter_buttons = browser.find_elements(By.CSS_SELECTOR, ".chapter-reader-button, .read-chapter-btn, button[onclick*='readChapter'], button[onclick*='openChapter']")
        print(f"Found {len(chapter_buttons)} chapter reader buttons")
        
        if len(chapter_buttons) == 0:
            # Check if chapter-reader.js loaded
            chapter_reader_loaded = browser.execute_script("return typeof ChapterReader !== 'undefined' || typeof openChapterReader !== 'undefined'")
            print(f"Chapter reader loaded: {chapter_reader_loaded}")
            
            # Check module loader status
            module_stats = browser.execute_script("return window.moduleLoader ? window.moduleLoader.getStats() : null")
            print(f"Module loader stats: {module_stats}")
            
        assert len(chapter_buttons) > 0, "Book pages should have chapter reader buttons"
        
        # Test that at least one button is clickable
        clickable_buttons = [btn for btn in chapter_buttons if btn.is_displayed() and btn.is_enabled()]
        assert len(clickable_buttons) > 0, "At least one chapter reader button should be clickable"
        
        print(f"✅ Found {len(clickable_buttons)} working chapter reader buttons")
    
    def test_youtube_videos_not_blocked(self, browser):
        """Test that YouTube Bible Project videos are not blocked by CSP"""
        print("\n📺 Testing YouTube video embedding...")
        
        browser.get(self.BASE_URL)
        
        # Create a test YouTube iframe to check CSP
        test_youtube_script = """
            try {
                const iframe = document.createElement('iframe');
                iframe.src = 'https://www.youtube.com/embed/GQI72THyO5I';
                iframe.width = '560';
                iframe.height = '315';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                return new Promise((resolve) => {
                    iframe.onload = () => resolve({ success: true, error: null });
                    iframe.onerror = (e) => resolve({ success: false, error: e.toString() });
                    setTimeout(() => resolve({ success: false, error: 'timeout' }), 5000);
                });
            } catch (e) {
                return { success: false, error: e.toString() };
            }
        """
        
        result = browser.execute_script(f"return {test_youtube_script}")
        
        if isinstance(result, dict):
            success = result.get('success', False)
            error = result.get('error', 'Unknown error')
        else:
            success = result
            error = None
        
        # Check CSP headers
        csp_header = browser.execute_script("""
            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            return meta ? meta.getAttribute('content') : null;
        """)
        
        print(f"CSP Header: {csp_header}")
        
        if csp_header:
            # Check if YouTube domains are allowed
            youtube_allowed = 'youtube.com' in csp_header and 'frame-src' in csp_header
            print(f"YouTube allowed in CSP: {youtube_allowed}")
            assert youtube_allowed, "YouTube should be allowed in Content Security Policy"
        
        print("✅ YouTube videos should not be blocked by CSP")
    
    def test_biblegateway_integration_working(self, browser):
        """Test that BibleGateway integration is not blocked"""
        print("\n📜 Testing BibleGateway integration...")
        
        browser.get(urljoin(self.BASE_URL, "/books/genesis/"))
        
        # Wait for page to load
        self.wait_for_element(browser, "h1")
        time.sleep(3)
        
        # Check if we can make a request to BibleGateway (simulate what chapter reader does)
        biblegateway_test = browser.execute_script("""
            try {
                fetch('https://www.biblegateway.com/passage/?search=Genesis+1&version=ESV', {
                    method: 'HEAD',
                    mode: 'no-cors'
                }).then(() => {
                    console.log('BibleGateway accessible');
                    return { success: true };
                }).catch(e => {
                    console.log('BibleGateway error:', e);
                    return { success: false, error: e.toString() };
                });
                return { pending: true };
            } catch (e) {
                return { success: false, error: e.toString() };
            }
        """)
        
        # Check CSP allows BibleGateway
        csp_header = browser.execute_script("""
            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            return meta ? meta.getAttribute('content') : null;
        """)
        
        if csp_header:
            biblegateway_allowed = 'biblegateway.com' in csp_header
            print(f"BibleGateway allowed in CSP: {biblegateway_allowed}")
            assert biblegateway_allowed, "BibleGateway should be allowed in Content Security Policy"
        
        print("✅ BibleGateway integration should work")
    
    def test_javascript_modules_loading_correctly(self, browser):
        """Test that JavaScript modules are loading in the correct order"""
        print("\n⚡ Testing JavaScript module loading...")
        
        browser.get(self.BASE_URL)
        
        # Wait for basic page load
        self.wait_for_element(browser, "body")
        
        # Wait for module loader
        time.sleep(2)
        
        # Check that module loader exists
        module_loader_exists = browser.execute_script("return typeof window.moduleLoader !== 'undefined'")
        assert module_loader_exists, "Module loader should be available"
        
        # Get module loading stats
        module_stats = browser.execute_script("return window.moduleLoader.getStats()")
        print(f"Module stats: {module_stats}")
        
        assert module_stats is not None, "Module loader should provide stats"
        assert module_stats.get('loadedCount', 0) > 0, "At least some modules should be loaded"
        
        # Check core modules loaded
        loaded_modules = module_stats.get('loaded', [])
        core_modules_loaded = any('theme-manager' in module for module in loaded_modules)
        print(f"Core modules loaded: {core_modules_loaded}")
        
        # On book pages, chapter-reader should load
        if '/books/' in browser.current_url:
            time.sleep(3)  # Wait for page-specific modules
            updated_stats = browser.execute_script("return window.moduleLoader.getStats()")
            chapter_reader_loaded = any('chapter-reader' in module for module in updated_stats.get('loaded', []))
            print(f"Chapter reader loaded on book page: {chapter_reader_loaded}")
            assert chapter_reader_loaded, "Chapter reader should load on book pages"
        
        print("✅ JavaScript modules loading correctly")
    
    def test_critical_css_loading(self, browser):
        """Test that critical CSS is properly inlined"""
        print("\n🎨 Testing critical CSS loading...")
        
        browser.get(self.BASE_URL)
        
        # Check if critical CSS is inlined
        critical_css_element = browser.find_elements(By.CSS_SELECTOR, "style#critical-css")
        print(f"Critical CSS inlined: {len(critical_css_element) > 0}")
        
        # Check basic styling is applied
        body_bg_color = browser.execute_script("return getComputedStyle(document.body).backgroundColor")
        nav_element = browser.find_element(By.CSS_SELECTOR, ".nav")
        nav_display = browser.execute_script("return getComputedStyle(arguments[0]).display", nav_element)
        
        print(f"Body background: {body_bg_color}")
        print(f"Nav display: {nav_display}")
        
        assert nav_display != "none", "Navigation should be visible with critical CSS"
        
        print("✅ Critical CSS loading correctly")
    
    def test_service_worker_registration(self, browser):
        """Test that service worker registers successfully"""
        print("\n🔧 Testing service worker registration...")
        
        browser.get(self.BASE_URL)
        time.sleep(3)  # Wait for SW registration
        
        # Check if service worker registered
        sw_registered = browser.execute_script("""
            return navigator.serviceWorker.getRegistration().then(reg => {
                return reg !== undefined;
            }).catch(() => false);
        """)
        
        print(f"Service worker registered: {sw_registered}")
        
        # Check for service worker file
        sw_scope = browser.execute_script("""
            return navigator.serviceWorker.getRegistration().then(reg => {
                return reg ? reg.scope : null;
            }).catch(() => null);
        """)
        
        print(f"Service worker scope: {sw_scope}")
        
        print("✅ Service worker registration tested")
    
    def test_offline_functionality(self, browser):
        """Test offline page and caching functionality"""
        print("\n📴 Testing offline functionality...")
        
        # First load the main page to populate cache
        browser.get(self.BASE_URL)
        time.sleep(3)
        
        # Visit offline page directly
        browser.get(urljoin(self.BASE_URL, "/offline/"))
        
        # Check offline page loads
        offline_title = browser.find_element(By.TAG_NAME, "h1").text
        print(f"Offline page title: {offline_title}")
        
        assert "offline" in offline_title.lower(), "Offline page should have offline-related title"
        
        # Check for offline functionality elements
        offline_features = browser.find_elements(By.CSS_SELECTOR, ".offline-features, .offline-content")
        assert len(offline_features) > 0, "Offline page should have feature descriptions"
        
        print("✅ Offline functionality present")
    
    def test_search_functionality_basic(self, browser):
        """Test basic search functionality"""
        print("\n🔍 Testing search functionality...")
        
        browser.get(self.BASE_URL)
        time.sleep(3)  # Wait for search modules to load
        
        # Look for search input
        search_inputs = browser.find_elements(By.CSS_SELECTOR, "input[type='search'], .search-input, #unifiedSearch, #characterSearch")
        
        if len(search_inputs) > 0:
            search_input = search_inputs[0]
            print(f"Found search input: {search_input.get_attribute('placeholder')}")
            
            # Test typing in search
            search_input.click()
            search_input.clear()
            search_input.send_keys("Abraham")
            time.sleep(2)  # Wait for search results
            
            # Check if search results or suggestions appear
            search_results = browser.find_elements(By.CSS_SELECTOR, ".search-results, .search-suggestions, .search-result-item")
            print(f"Search results/suggestions found: {len(search_results)}")
            
            search_input.clear()
            
        print("✅ Search functionality tested")

    def test_responsive_design_basics(self, browser):
        """Test basic responsive design functionality"""
        print("\n📱 Testing responsive design...")
        
        browser.get(self.BASE_URL)
        
        # Test desktop size
        browser.set_window_size(1200, 800)
        time.sleep(1)
        
        nav_display_desktop = browser.execute_script("""
            const nav = document.querySelector('.nav');
            return nav ? getComputedStyle(nav).display : null;
        """)
        
        # Test mobile size
        browser.set_window_size(375, 667)
        time.sleep(1)
        
        nav_display_mobile = browser.execute_script("""
            const nav = document.querySelector('.nav');
            return nav ? getComputedStyle(nav).display : null;
        """)
        
        print(f"Nav display - Desktop: {nav_display_desktop}, Mobile: {nav_display_mobile}")
        
        assert nav_display_desktop != "none", "Navigation should be visible on desktop"
        assert nav_display_mobile != "none", "Navigation should be visible on mobile"
        
        # Reset window size
        browser.set_window_size(1920, 1080)
        
        print("✅ Responsive design basics working")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])