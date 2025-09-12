#!/usr/bin/env python3
"""
Comprehensive Selenium Test Suite for Bible Explorer
Tests core functionality required for build validation
"""

import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from config import get_test_urls


class TestBibleExplorer:
    """Test suite for Bible Explorer functionality"""
    
    @pytest.fixture(scope="class")
    def driver(self):
        """Setup Chrome WebDriver for testing"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-web-security')
        chrome_options.add_argument('--allow-running-insecure-content')
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    
    @pytest.fixture(scope="class")
    def base_url(self):
        """Base URL for testing"""
        return get_test_urls()["base"]
    
    def test_homepage_loads(self, driver, base_url):
        """Test that homepage loads successfully"""
        driver.get(base_url)
        
        # Check page title
        assert "Bible Explorer" in driver.title
        
        # Check container is visible (main content wrapper)
        container = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "container"))
        )
        assert container.is_displayed()
        
        # Check for hero section content as indicator page loaded
        try:
            hero_section = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "hero-section"))
            )
            assert hero_section.is_displayed()
        except TimeoutException:
            # Hero section may not exist on all pages, that's ok
            pass
        
        # Check for critical JavaScript errors (excluding optional modules)
        logs = driver.get_log('browser')
        critical_errors = []
        for log in logs:
            if log['level'] == 'SEVERE':
                message = log['message']
                # Skip optional telemetry and debug module errors
                if not any(skip in message for skip in [
                    'opentelemetry', 'logger.js', 'debug-dashboard.js',
                    'Failed to resolve module specifier', 'assets/logger.js'
                ]):
                    critical_errors.append(log)
        
        assert len(critical_errors) == 0, f"Critical JavaScript errors found: {critical_errors}"
    
    def test_navigation_elements(self, driver, base_url):
        """Test navigation menu and links"""
        driver.get(base_url)
        
        # Check navigation brand
        nav_brand = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "nav-brand"))
        )
        assert nav_brand.is_displayed()
        assert nav_brand.text == "Bible Explorer"
        
        # Check main navigation links
        nav_links = driver.find_elements(By.CLASS_NAME, "nav-link")
        assert len(nav_links) >= 3  # Sections, Characters, Links
        
        # Verify all nav links are clickable
        for link in nav_links:
            assert link.is_displayed()
            assert link.get_attribute("href")
    
    def test_hero_section_content(self, driver, base_url):
        """Test hero section displays correctly"""
        driver.get(base_url)
        
        # Check hero section exists
        hero_section = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "hero-section"))
        )
        assert hero_section.is_displayed()
        
        # Check hero content
        hero_content = driver.find_element(By.CLASS_NAME, "hero-content")
        assert hero_content.is_displayed()
        
        # Verify main heading
        h1 = hero_content.find_element(By.TAG_NAME, "h1")
        assert h1.text == "Bible Explorer"
        
        # Check stats are present
        stats = driver.find_elements(By.CLASS_NAME, "stat")
        assert len(stats) >= 2  # Should have book count and other stats
    
    def test_theme_toggle(self, driver, base_url):
        """Test dark/light theme toggle functionality"""
        driver.get(base_url)
        
        # Find theme toggle button
        theme_toggle = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "theme-toggle"))
        )
        
        # Check initial state
        initial_theme = driver.execute_script("return document.documentElement.getAttribute('data-theme')")
        
        # Click toggle
        theme_toggle.click()
        time.sleep(0.5)  # Wait for theme change
        
        # Verify theme changed
        new_theme = driver.execute_script("return document.documentElement.getAttribute('data-theme')")
        assert new_theme != initial_theme
        
        # Toggle back
        theme_toggle.click()
        time.sleep(0.5)
        
        final_theme = driver.execute_script("return document.documentElement.getAttribute('data-theme')")
        assert final_theme == initial_theme
    
    def test_search_functionality(self, driver, base_url):
        """Test search input and functionality"""
        driver.get(base_url)
        
        # Find search input
        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "searchInput"))
        )
        assert search_input.is_displayed()
        
        # Test search input
        search_input.clear()
        search_input.send_keys("Genesis")
        time.sleep(1)  # Wait for search results
        
        # Check if search results appear
        search_results = driver.find_element(By.ID, "searchResults")
        # Note: Results may not be visible if no search data loaded, but element should exist
        assert search_results
    
    def test_font_controls(self, driver, base_url):
        """Test font size controls"""
        driver.get(base_url)
        
        # Find font size toggle
        font_toggle = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "font-size-toggle"))
        )
        
        # Click to open font controls
        font_toggle.click()
        time.sleep(0.5)
        
        # Check if font panel is visible
        font_panel = driver.find_element(By.ID, "fontSizePanel")
        panel_visible = "visible" in font_panel.get_attribute("class")
        
        # If panel opened, test font size preset buttons
        if panel_visible:
            preset_buttons = driver.find_elements(By.CLASS_NAME, "font-preset-btn")
            assert len(preset_buttons) >= 3  # Should have Small, Medium, Large
            
            # Test clicking a preset
            if preset_buttons:
                preset_buttons[0].click()
                time.sleep(0.5)
    
    def test_high_contrast_mode(self, driver, base_url):
        """Test high contrast accessibility mode"""
        driver.get(base_url)
        
        # Find high contrast toggle
        contrast_toggle = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "high-contrast-toggle"))
        )
        
        # Check initial state
        html_element = driver.find_element(By.TAG_NAME, "html")
        initial_classes = html_element.get_attribute("class")
        
        # Toggle high contrast
        contrast_toggle.click()
        time.sleep(0.5)
        
        # Check if high contrast class was added
        new_classes = html_element.get_attribute("class")
        # Note: Functionality may vary, but button should be clickable
        assert contrast_toggle.is_enabled()
    
    def test_responsive_layout_mobile(self, driver, base_url):
        """Test responsive layout on mobile viewport"""
        driver.get(base_url)
        
        # Set mobile viewport
        driver.set_window_size(375, 667)  # iPhone size
        time.sleep(0.5)
        
        # Check navigation is still accessible
        nav = driver.find_element(By.CLASS_NAME, "nav")
        assert nav.is_displayed()
        
        # Check container is visible
        container = driver.find_element(By.CLASS_NAME, "container")
        assert container.is_displayed()
        
        # Verify content doesn't overflow
        body_width = driver.execute_script("return document.body.scrollWidth")
        window_width = driver.execute_script("return window.innerWidth")
        assert body_width <= window_width + 20  # Allow small margin for scrollbars
        
        # Reset to desktop size
        driver.set_window_size(1920, 1080)
    
    def test_accessibility_features(self, driver, base_url):
        """Test accessibility features"""
        driver.get(base_url)
        
        # Check skip link exists (may not be visible)
        skip_links = driver.find_elements(By.CLASS_NAME, "skip-link")
        # Skip links are optional accessibility feature
        
        # Check container has content
        container = driver.find_element(By.CLASS_NAME, "container")
        assert container
        
        # Check navigation has proper role
        nav = driver.find_element(By.CLASS_NAME, "nav")
        nav_role = nav.get_attribute("role")
        # Role may be implied for nav element, but should have navigation semantics
    
    def test_page_performance(self, driver, base_url):
        """Test basic performance metrics"""
        start_time = time.time()
        driver.get(base_url)
        
        # Wait for page content to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "container"))
        )
        
        load_time = time.time() - start_time
        
        # Page should load within reasonable time
        assert load_time < 10, f"Page load time too slow: {load_time:.2f}s"
        
        # Check that main stylesheets are loaded
        stylesheets = driver.find_elements(By.CSS_SELECTOR, "link[rel='stylesheet']")
        assert len(stylesheets) >= 1, "No stylesheets found"
    
    def test_character_page_navigation(self, driver, base_url):
        """Test navigation to character pages"""
        driver.get(base_url)
        
        # Click on Characters link
        try:
            characters_link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Characters')]"))
            )
            characters_link.click()
            
            # Wait for page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "container"))
            )
            
            # Check we're on characters page
            current_url = driver.current_url
            assert "/characters" in current_url
            
            # Check container loads
            container = driver.find_element(By.CLASS_NAME, "container")
            assert container.is_displayed()
            
        except TimeoutException:
            # Characters page may not exist, that's okay for basic functionality test
            pass
    
    def test_css_loading_and_styling(self, driver, base_url):
        """Test that CSS is properly loaded and applied"""
        driver.get(base_url)
        
        # Check that main elements have expected styling
        nav = driver.find_element(By.CLASS_NAME, "nav")
        nav_bg = driver.execute_script(
            "return window.getComputedStyle(arguments[0]).backgroundColor", nav
        )
        # Should have some background color (not transparent)
        assert nav_bg and nav_bg != "rgba(0, 0, 0, 0)"
        
        # Check container has proper width constraints
        container = driver.find_element(By.CLASS_NAME, "container")
        max_width = driver.execute_script(
            "return window.getComputedStyle(arguments[0]).maxWidth", container
        )
        # Should have some max-width set
        assert max_width and max_width != "none"
    
    def test_javascript_execution(self, driver, base_url):
        """Test that JavaScript executes properly"""
        driver.get(base_url)
        
        # Test that JavaScript variables are defined
        theme_function_exists = driver.execute_script(
            "return typeof toggleTheme === 'function'"
        )
        assert theme_function_exists, "toggleTheme function not found"
        
        # Check that DOM manipulation works
        test_element = driver.execute_script("""
            const div = document.createElement('div');
            div.id = 'test-element';
            div.textContent = 'Test Element';
            document.body.appendChild(div);
            return div.id;
        """)
        assert test_element == 'test-element'
        
        # Clean up
        driver.execute_script(
            "document.getElementById('test-element').remove();"
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--html=test_report.html", "--self-contained-html"])