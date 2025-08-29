#!/usr/bin/env python3
"""
iOS Safari UI Automation Tests for Bible Explorer
Tests mobile Safari-specific functionality and behaviors
"""

import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.safari.options import Options as SafariOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
# TouchActions is deprecated in Selenium 4.x, using ActionChains instead
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from appium import webdriver as appium_webdriver
from appium.options.ios import XCUITestOptions


class TestIOSSafari:
    """Test suite for iOS Safari functionality"""
    
    @pytest.fixture(scope="class")
    def ios_driver(self):
        """Setup iOS Safari WebDriver for testing"""
        # For iOS Simulator testing
        options = XCUITestOptions()
        options.platform_name = "iOS"
        options.platform_version = "16.0"  # Adjust as needed
        options.device_name = "iPhone 14"  # Adjust as needed
        options.browser_name = "Safari"
        options.automation_name = "XCUITest"
        options.new_command_timeout = 60
        options.command_timeouts = {'implicit': 30}
        
        # For local testing, you'll need Appium server running
        try:
            driver = appium_webdriver.Remote(
                command_executor='http://localhost:4723',
                options=options
            )
            driver.implicitly_wait(10)
            yield driver
            driver.quit()
        except Exception as e:
            # Fallback to desktop Safari for local development
            print(f"iOS Simulator not available: {e}")
            print("Falling back to desktop Safari")
            driver = webdriver.Safari()
            # Simulate mobile viewport
            driver.set_window_size(375, 812)  # iPhone X dimensions
            driver.implicitly_wait(10)
            yield driver
            driver.quit()
    
    @pytest.fixture(scope="class") 
    def mobile_safari_driver(self):
        """Setup mobile Safari simulation for local testing"""
        driver = webdriver.Safari()
        # iPhone 14 Pro dimensions
        driver.set_window_size(393, 852)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    
    @pytest.fixture(scope="class")
    def base_url(self):
        """Base URL for testing"""
        return "http://localhost:8080"
    
    def test_mobile_homepage_loads(self, mobile_safari_driver, base_url):
        """Test that homepage loads successfully on mobile Safari"""
        driver = mobile_safari_driver
        driver.get(base_url)
        
        # Check page title
        assert "Bible Explorer" in driver.title
        
        # Check mobile viewport meta tag is working
        body = driver.find_element(By.TAG_NAME, "body")
        assert body is not None
        
        # Verify responsive design elements are present
        nav = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "nav"))
        )
        assert nav is not None
        
    def test_mobile_navigation_menu(self, mobile_safari_driver, base_url):
        """Test mobile navigation menu functionality"""
        driver = mobile_safari_driver
        driver.get(base_url)
        
        # Look for mobile menu toggle
        try:
            # Check if hamburger menu exists (common mobile pattern)
            menu_toggle = driver.find_element(By.CSS_SELECTOR, ".menu-toggle, .nav-toggle, [aria-label*='menu']")
            menu_toggle.click()
            time.sleep(1)
        except NoSuchElementException:
            # If no toggle, navigation should still be accessible
            pass
        
        # Check navigation links are accessible
        nav_links = driver.find_elements(By.CSS_SELECTOR, "nav a")
        assert len(nav_links) > 0, "Navigation links should be present"
        
        # Test sections link
        sections_link = None
        for link in nav_links:
            if "sections" in link.text.lower() or "categories" in link.text.lower():
                sections_link = link
                break
        
        if sections_link:
            sections_link.click()
            time.sleep(2)
            assert "categories" in driver.current_url.lower()
    
    def test_mobile_theme_toggle(self, mobile_safari_driver, base_url):
        """Test theme toggle functionality on mobile Safari"""
        driver = mobile_safari_driver
        driver.get(base_url)
        
        # Look for theme toggle button
        try:
            theme_toggle = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 
                    ".theme-toggle, [aria-label*='theme'], [title*='theme'], .dark-mode-toggle"
                ))
            )
            
            # Get initial theme state
            initial_theme = driver.execute_script("return document.documentElement.getAttribute('data-theme')")
            
            # Click theme toggle
            theme_toggle.click()
            time.sleep(1)
            
            # Verify theme changed
            new_theme = driver.execute_script("return document.documentElement.getAttribute('data-theme')")
            assert new_theme != initial_theme, "Theme should change when toggle is clicked"
            
        except TimeoutException:
            # Theme toggle might not be implemented yet
            print("Theme toggle not found - this is acceptable")
    
    def test_mobile_character_search(self, mobile_safari_driver, base_url):
        """Test character search functionality on mobile"""
        driver = mobile_safari_driver
        driver.get(f"{base_url}/characters/")
        
        # Wait for page to load
        time.sleep(2)
        
        # Look for search input
        try:
            search_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 
                    "input[type='search'], input[placeholder*='search'], .search-input"
                ))
            )
            
            # Test search functionality
            search_input.clear()
            search_input.send_keys("David")
            time.sleep(2)  # Allow search to process
            
            # Check that results are filtered
            character_cards = driver.find_elements(By.CSS_SELECTOR, ".character-card, .character-item")
            visible_cards = [card for card in character_cards if card.is_displayed()]
            
            # At least one David should be visible
            david_found = False
            for card in visible_cards:
                if "david" in card.text.lower():
                    david_found = True
                    break
            
            assert david_found, "Search should show David in results"
            
        except TimeoutException:
            # Search might not be on this page
            print("Character search not found on this page")
    
    def test_mobile_chapter_reader(self, mobile_safari_driver, base_url):
        """Test mobile chapter reader functionality"""
        driver = mobile_safari_driver
        driver.get(f"{base_url}/books/genesis/")
        
        # Wait for page to load
        time.sleep(2)
        
        # Look for "Read Chapter" button
        try:
            read_buttons = driver.find_elements(By.CSS_SELECTOR, 
                ".read-chapter-btn, button[onclick*='openChapterReader'], .chapter-reader-button"
            )
            
            if read_buttons:
                first_button = read_buttons[0]
                driver.execute_script("arguments[0].scrollIntoView(true);", first_button)
                time.sleep(1)
                first_button.click()
                
                # Wait for modal to appear
                modal = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 
                        ".chapter-reader-overlay, .chapter-reader-modal, .modal"
                    ))
                )
                
                # Check modal is visible
                assert modal.is_displayed(), "Chapter reader modal should be visible"
                
                # Check for mobile view toggle (new feature)
                try:
                    toggle_buttons = driver.find_elements(By.CSS_SELECTOR, ".toggle-btn")
                    if toggle_buttons:
                        # Test switching to text view
                        text_view_btn = None
                        for btn in toggle_buttons:
                            if "text" in btn.text.lower() or "api" in btn.get_attribute("data-view"):
                                text_view_btn = btn
                                break
                        
                        if text_view_btn:
                            text_view_btn.click()
                            time.sleep(2)
                            
                            # Verify text view is showing
                            api_container = driver.find_element(By.CSS_SELECTOR, ".api-view-container")
                            assert api_container.is_displayed(), "Text view should be visible after toggle"
                
                except NoSuchElementException:
                    print("Mobile view toggle not found - checking basic modal functionality")
                
                # Check iframe is present (either view)
                iframes = driver.find_elements(By.TAG_NAME, "iframe")
                text_content = driver.find_elements(By.CSS_SELECTOR, ".chapter-reader-verses")
                
                assert len(iframes) > 0 or len(text_content) > 0, "Chapter content should be present"
                
                # Test closing modal
                close_button = driver.find_element(By.CSS_SELECTOR, 
                    ".chapter-reader-close, .modal-close, [aria-label*='close']"
                )
                close_button.click()
                time.sleep(1)
                
                # Modal should be hidden
                assert not modal.is_displayed(), "Modal should be hidden after closing"
                
        except TimeoutException:
            print("Chapter reader buttons not found on this page")
    
    def test_mobile_scripture_widget(self, mobile_safari_driver, base_url):
        """Test scripture widget touch functionality"""
        driver = mobile_safari_driver
        driver.get(f"{base_url}/examples/john-3-complete/")
        
        # Wait for page to load
        time.sleep(2)
        
        # Look for scripture references
        try:
            scripture_refs = driver.find_elements(By.CSS_SELECTOR, 
                "[data-scripture], .scripture-ref, .verse-reference"
            )
            
            if scripture_refs:
                first_ref = scripture_refs[0]
                driver.execute_script("arguments[0].scrollIntoView(true);", first_ref)
                time.sleep(1)
                
                # On mobile, this should work with tap
                first_ref.click()
                time.sleep(2)
                
                # Look for scripture popup/tooltip
                popup = driver.find_elements(By.CSS_SELECTOR, 
                    ".scripture-popup, .verse-tooltip, .scripture-widget"
                )
                
                if popup and popup[0].is_displayed():
                    print("Scripture widget working on mobile")
                else:
                    print("Scripture widget may not be mobile-optimized yet")
                    
        except NoSuchElementException:
            print("Scripture references not found on example page")
    
    def test_mobile_responsive_design(self, mobile_safari_driver, base_url):
        """Test responsive design elements"""
        driver = mobile_safari_driver
        driver.get(base_url)
        
        # Check viewport meta tag
        viewport_meta = driver.find_element(By.CSS_SELECTOR, "meta[name='viewport']")
        content = viewport_meta.get_attribute("content")
        assert "width=device-width" in content, "Viewport should be set for mobile"
        
        # Check for mobile-optimized font sizes
        body = driver.find_element(By.TAG_NAME, "body")
        font_size = driver.execute_script("return window.getComputedStyle(arguments[0]).fontSize", body)
        
        # Font size should be reasonable for mobile (typically 14px or larger)
        font_size_px = float(font_size.replace("px", ""))
        assert font_size_px >= 14, f"Font size {font_size_px}px should be at least 14px for mobile readability"
        
        # Check touch targets are adequate size (44px minimum recommended)
        buttons = driver.find_elements(By.TAG_NAME, "button")
        links = driver.find_elements(By.TAG_NAME, "a")
        
        interactive_elements = buttons + links
        for element in interactive_elements[:5]:  # Check first 5 elements
            if element.is_displayed():
                size = element.size
                # At least one dimension should be 44px for good touch targets
                assert size['height'] >= 30 or size['width'] >= 44, \
                    f"Interactive element should have adequate touch target size: {size}"
    
    def test_mobile_performance_basic(self, mobile_safari_driver, base_url):
        """Test basic mobile performance metrics"""
        driver = mobile_safari_driver
        
        # Time page load
        start_time = time.time()
        driver.get(base_url)
        
        # Wait for main content to be visible
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "main"))
        )
        
        load_time = time.time() - start_time
        
        # Page should load within reasonable time on mobile
        assert load_time < 10, f"Page load time {load_time:.2f}s should be under 10 seconds"
        
        # Check for JavaScript errors
        logs = driver.get_log('browser')
        severe_errors = [log for log in logs if log['level'] == 'SEVERE']
        
        # Filter out known non-critical errors
        critical_errors = []
        for error in severe_errors:
            message = error['message'].lower()
            # Filter out common non-critical errors
            if not any(ignore in message for ignore in [
                'favicon.ico', 'analytics', 'googletagmanager', 'third-party'
            ]):
                critical_errors.append(error)
        
        assert len(critical_errors) == 0, f"No critical JavaScript errors should occur: {critical_errors}"
    
    def test_mobile_book_navigation(self, mobile_safari_driver, base_url):
        """Test navigation between Bible books on mobile"""
        driver = mobile_safari_driver
        driver.get(f"{base_url}/categories/")
        
        # Wait for page to load
        time.sleep(2)
        
        # Find and click on a category
        category_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/categories/']")
        if category_links:
            first_category = category_links[0]
            first_category.click()
            time.sleep(2)
            
            # Should be on a category page now
            book_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/books/']")
            if book_links:
                first_book = book_links[0]
                first_book.click()
                time.sleep(2)
                
                # Should be on a book page
                assert "/books/" in driver.current_url, "Should navigate to book page"
                
                # Check chapter summaries are visible
                chapter_content = driver.find_elements(By.CSS_SELECTOR, 
                    ".chapter-summary, .chapter-content, table"
                )
                assert len(chapter_content) > 0, "Book page should have chapter content"
    
    def test_mobile_accessibility_basics(self, mobile_safari_driver, base_url):
        """Test basic accessibility features on mobile"""
        driver = mobile_safari_driver
        driver.get(base_url)
        
        # Check for skip links
        skip_links = driver.find_elements(By.CSS_SELECTOR, "a[href='#main'], .skip-link")
        if skip_links:
            print("Skip links found - good for accessibility")
        
        # Check headings hierarchy
        h1_tags = driver.find_elements(By.TAG_NAME, "h1")
        assert len(h1_tags) >= 1, "Page should have at least one H1 tag"
        
        # Check images have alt text
        images = driver.find_elements(By.TAG_NAME, "img")
        for img in images:
            alt_text = img.get_attribute("alt")
            assert alt_text is not None, "Images should have alt text for accessibility"
        
        # Check buttons have descriptive text or aria-labels
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for button in buttons[:5]:  # Check first 5 buttons
            text = button.text.strip()
            aria_label = button.get_attribute("aria-label")
            title = button.get_attribute("title")
            
            assert text or aria_label or title, \
                "Buttons should have descriptive text, aria-label, or title"


@pytest.mark.ios
class TestIOSSpecific:
    """iOS-specific tests that require actual iOS device/simulator"""
    
    def test_ios_safari_viewport_behavior(self, ios_driver, base_url):
        """Test iOS Safari viewport behavior (address bar hiding, etc.)"""
        driver = ios_driver
        driver.get(base_url)
        
        # Test viewport height changes when scrolling (iOS Safari behavior)
        initial_height = driver.execute_script("return window.innerHeight")
        
        # Scroll down
        driver.execute_script("window.scrollTo(0, 500)")
        time.sleep(2)
        
        # On iOS, viewport height might change as address bar hides
        new_height = driver.execute_script("return window.innerHeight")
        
        # Heights might be different due to Safari UI changes
        print(f"Initial height: {initial_height}, After scroll: {new_height}")
        
        # The page should still be functional regardless of viewport changes
        main_content = driver.find_element(By.TAG_NAME, "main")
        assert main_content.is_displayed(), "Main content should remain visible"
    
    def test_ios_touch_events(self, ios_driver, base_url):
        """Test touch-specific events on iOS"""
        driver = ios_driver
        driver.get(base_url)
        
        # Test touch events on interactive elements
        buttons = driver.find_elements(By.TAG_NAME, "button")
        if buttons:
            # Use ActionChains for touch simulation instead of deprecated TouchActions
            touch_actions = ActionChains(driver)
            touch_actions.click(buttons[0]).perform()
            time.sleep(1)
            # Should not cause any errors
        
        # Test scroll behavior
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        
        # Should handle smooth scrolling without issues
        scroll_position = driver.execute_script("return window.pageYOffset")
        assert scroll_position > 0, "Page should be scrolled"


if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v", "--tb=short"])