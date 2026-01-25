"""
Comprehensive test suite for the Entities system.
Tests entity pages, search functionality, and cross-references.
"""

import pytest
from config import get_test_urls
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import re


class TestEntitiesSystem:
    """Test suite for the Entities functionality."""

    def wait_for_entities_loaded(self, driver, timeout=15):
        """Wait for entities data to load into the grid."""
        WebDriverWait(driver, timeout).until(
            lambda d: d.find_element(By.ID, "entitiesContent").is_displayed()
        )
        WebDriverWait(driver, timeout).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, ".entity-card")) > 0
        )

    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test environment."""
        self.base_url = get_test_urls()["base"]
        
        # Sample entities to test with
        self.test_entities = [
            {
                'id': 'p.adam.gene-2-5--6921e439',
                'name': 'Adam',
                'type': 'person',
                'expected_books': ['Genesis']
            },
            {
                'id': 'p.moses.exod-2-10--e5a2f8b7',
                'name': 'Moses', 
                'type': 'person',
                'expected_books': ['Exodus', 'Numbers', 'Deuteronomy']
            },
            {
                'id': 'p.david.1sam-16-13--c4d3e9f1',
                'name': 'David',
                'type': 'person',
                'expected_books': ['1 Samuel', '2 Samuel', 'Psalms']
            }
        ]

    def test_entities_page_loads(self, chrome_driver):
        """Test that entities overview page loads successfully."""
        chrome_driver.get(f"{self.base_url}/entities/")
        
        # Wait for page to load
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        
        # Check page title contains "Entities"
        page_title = chrome_driver.find_element(By.TAG_NAME, "h1")
        assert "Entities" in page_title.text or "Characters" in page_title.text
        
        # Wait for entity listings
        self.wait_for_entities_loaded(chrome_driver)
        entity_listings = chrome_driver.find_elements(By.CLASS_NAME, "entity-card")
        assert len(entity_listings) > 0, "No entity listings found on entities page"

    def test_entity_search_functionality(self, chrome_driver):
        """Test entity search functionality."""
        chrome_driver.get(f"{self.base_url}/entities/")
        
        # Wait for search input to load
        self.wait_for_entities_loaded(chrome_driver)
        search_input = WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.ID, "entitySearch"))
        )
        
        # Test searching for a common biblical character
        search_input.clear()
        search_input.send_keys("David")
        
        # Wait for search results
        WebDriverWait(chrome_driver, 10).until(
            lambda d: any("David" in card.text for card in d.find_elements(By.CSS_SELECTOR, ".entity-card") if card.is_displayed())
        )
        
        # Check that results are filtered
        entity_cards = chrome_driver.find_elements(By.CSS_SELECTOR, ".entity-card")
        
        # At least one result should contain "David"
        david_found = False
        for card in entity_cards:
            if card.is_displayed() and "David" in card.text:
                david_found = True
                break
        
        assert david_found, "Search for 'David' did not return expected results"

    def test_individual_entity_page(self, chrome_driver):
        """Test individual entity page functionality."""
        # Test with a known entity ID - Adam
        entity_id = "p.adam.gene-2-5--6921e439"
        chrome_driver.get(f"{self.base_url}/entities/{entity_id}/")

        # Wait for entity page to load
        WebDriverWait(chrome_driver, 15).until(
            lambda d: d.find_element(By.ID, "entityContent").is_displayed()
        )

        if chrome_driver.find_element(By.ID, "entityError").is_displayed():
            pytest.skip("Entity not found for individual page test")
        
        # Check that entity name is displayed
        page_title = chrome_driver.find_element(By.ID, "entityName")
        assert len(page_title.text.strip()) > 0, "Entity name not displayed"
        
        # Check for entity information sections
        # Look for common sections that might exist
        info_sections = chrome_driver.find_elements(By.CSS_SELECTOR, "#entityDescription, #entityProfile, #entityRelations")
        
        # Check for book references or appearances
        book_references = chrome_driver.find_elements(By.CSS_SELECTOR, "#referencesList .reference-card, #referencesList .reference-item")
        
        # At least one of these should exist for a valid entity page
        assert len(info_sections) > 0 or len(book_references) > 0, "No entity information or book references found"

    def test_entity_profile_content_loads(self, chrome_driver):
        """Test that character profile content loads on entity pages."""
        entity_id = "p.david--951bc327"
        chrome_driver.get(f"{self.base_url}/entities/{entity_id}/")

        WebDriverWait(chrome_driver, 15).until(
            lambda d: d.find_element(By.ID, "entityContent").is_displayed()
        )

        if chrome_driver.find_element(By.ID, "entityError").is_displayed():
            pytest.skip("Entity not found for profile test")

        profile_section = chrome_driver.find_element(By.ID, "entityProfile")
        if not profile_section.is_displayed():
            pytest.skip("Character profile not available for this entity")

        profile_content = chrome_driver.find_element(By.ID, "entityProfileContent").text.strip()
        assert profile_content != "", "Character profile content is empty"

    def test_entity_cross_references(self, chrome_driver):
        """Test cross-references between entities and books."""
        # Navigate to a book page that should have entities
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Wait for page to load
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        
        # Look for entity links or references within the book content
        entity_links = chrome_driver.find_elements(By.CSS_SELECTOR, "a[href*='/entities/']")
        
        if len(entity_links) > 0:
            # Test clicking on an entity link
            first_link = entity_links[0]
            link_href = first_link.get_attribute('href')
            chrome_driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_link)
            chrome_driver.execute_script("arguments[0].click();", first_link)
            
            # Wait for entity page to load
            WebDriverWait(chrome_driver, 10).until(
                EC.url_changes(f"{self.base_url}/books/genesis/")
            )
            
            # Verify we're on an entity page
            current_url = chrome_driver.current_url
            assert '/entities/' in current_url or '/characters/' in current_url, f"Did not navigate to entity page: {current_url}"

    def test_entity_book_filtering(self, chrome_driver):
        """Test filtering entities by biblical books."""
        chrome_driver.get(f"{self.base_url}/entities/")
        
        # Wait for page to load
        self.wait_for_entities_loaded(chrome_driver)
        
        # Look for book filter options
        book_filters = chrome_driver.find_elements(By.CSS_SELECTOR, "#bookFilter option")
        
        if len(book_filters) > 0:
            # Test filtering by Genesis
            from selenium.webdriver.support.ui import Select
            book_select = Select(chrome_driver.find_element(By.ID, "bookFilter"))
            if any("Genesis" in opt.text for opt in book_filters):
                book_select.select_by_visible_text("Genesis")
                time.sleep(2)
                
                # Check that results are filtered to Genesis characters
                entity_cards = chrome_driver.find_elements(By.CSS_SELECTOR, ".entity-card")
                visible_cards = [card for card in entity_cards if card.is_displayed()]
                
                # Should have at least some characters from Genesis
                assert len(visible_cards) > 0, "No entities shown after filtering by Genesis"

    def test_entities_filter_character_study_and_testament(self, chrome_driver):
        """Test filtering by character study availability and testament."""
        chrome_driver.get(f"{self.base_url}/entities/")

        self.wait_for_entities_loaded(chrome_driver)

        study_filter = WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.ID, "studyFilter"))
        )
        testament_filter = WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.ID, "testamentFilter"))
        )

        from selenium.webdriver.support.ui import Select
        Select(study_filter).select_by_value("yes")
        Select(testament_filter).select_by_value("OT")

        time.sleep(2)

        entity_cards = chrome_driver.find_elements(By.CSS_SELECTOR, ".entity-card, .character-card")
        visible_cards = [card for card in entity_cards if card.is_displayed()]

        assert len(visible_cards) > 0, "No entities shown after filtering by character study and OT"

    def test_entity_responsive_design(self, chrome_driver):
        """Test entity pages work on mobile viewport."""
        # Set mobile viewport
        chrome_driver.set_window_size(375, 667)  # iPhone size
        
        chrome_driver.get(f"{self.base_url}/entities/")
        
        # Wait for mobile layout
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check that the page is responsive
        body = chrome_driver.find_element(By.TAG_NAME, "body")
        body_width = body.size['width']
        viewport_width = chrome_driver.execute_script("return window.innerWidth")
        
        # Page should not exceed viewport width (allowing for some browser chrome)
        assert body_width <= viewport_width + 50, f"Page width {body_width} exceeds viewport {viewport_width}"
        
        # Check that entity cards stack properly on mobile
        entity_cards = chrome_driver.find_elements(By.CSS_SELECTOR, ".entity-card, .character-card")
        if len(entity_cards) >= 2:
            # Cards should stack vertically (second card below first)
            card1_rect = entity_cards[0].rect
            card2_rect = entity_cards[1].rect
            
            # Second card should be below first card (allowing for some margin)
            assert card2_rect['y'] >= card1_rect['y'] + card1_rect['height'] - 20, "Entity cards not stacking properly on mobile"

    def test_entity_navigation_breadcrumbs(self, chrome_driver):
        """Test navigation breadcrumbs on entity pages."""
        # Navigate to a specific entity
        entity_id = "p.adam.gene-2-5--6921e439"
        chrome_driver.get(f"{self.base_url}/entities/{entity_id}/")
        
        # Wait for page to load
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        
        # Look for breadcrumb navigation
        breadcrumbs = chrome_driver.find_elements(By.CSS_SELECTOR, ".breadcrumb, .breadcrumbs, nav[aria-label*='breadcrumb']")
        
        if len(breadcrumbs) > 0:
            breadcrumb = breadcrumbs[0]
            
            # Should contain link back to entities
            entities_link = breadcrumb.find_elements(By.CSS_SELECTOR, "a[href*='/entities']")
            if len(entities_link) > 0:
                entities_link[0].click()
                
                # Should navigate back to entities page
                WebDriverWait(chrome_driver, 5).until(
                    EC.url_to_be(f"{self.base_url}/entities/")
                )
                
                current_url = chrome_driver.current_url
                assert current_url.endswith('/entities/'), f"Breadcrumb navigation failed: {current_url}"

    def test_entity_error_handling(self, chrome_driver):
        """Test error handling for invalid entity IDs."""
        # Try to access a non-existent entity
        chrome_driver.get(f"{self.base_url}/entities/non-existent-entity/")
        
        # Wait for page to load
        time.sleep(3)
        
        # Should either show 404 or redirect to entities page
        current_url = chrome_driver.current_url
        page_source = chrome_driver.page_source.lower()
        
        is_error_handled = (
            "404" in page_source or
            "not found" in page_source or
            current_url.endswith('/entities/') or
            "error" in page_source
        )
        
        assert is_error_handled, "Error handling for invalid entity ID not working properly"

    def test_entity_data_integrity(self, chrome_driver):
        """Test that entity data is properly loaded and displayed."""
        chrome_driver.get(f"{self.base_url}/entities/")
        
        # Wait for page to load
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for JavaScript errors that might indicate data loading issues
        logs = chrome_driver.get_log('browser')
        critical_errors = [log for log in logs if log['level'] == 'SEVERE' and 'entity' in log['message'].lower()]
        
        # Should not have critical entity-related JavaScript errors
        assert len(critical_errors) == 0, f"Critical entity-related JavaScript errors found: {critical_errors}"
        
        # Check that entity data is loaded
        # Look for signs that entity data is present
        entity_elements = chrome_driver.find_elements(By.CSS_SELECTOR, ".entity-card, .character-card, [data-entity], .entity-name")
        
        assert len(entity_elements) > 0, "No entity data appears to be loaded"

    def test_parables_page_loads(self, chrome_driver):
        """Test that the parables page renders and has scripture references."""
        chrome_driver.get(f"{self.base_url}/parables/")

        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )

        heading = chrome_driver.find_element(By.TAG_NAME, "h1")
        assert "Parables" in heading.text, "Parables page heading missing"

        parable_cards = chrome_driver.find_elements(By.CLASS_NAME, "parable-card")
        assert len(parable_cards) > 0, "No parable cards found on parables page"

        scripture_refs = chrome_driver.find_elements(By.CSS_SELECTOR, "[data-scripture]")
        assert len(scripture_refs) > 0, "No scripture references found on parables page"

    def test_people_groups_page_loads(self, chrome_driver):
        """Test that the people groups page renders and lists groups."""
        chrome_driver.get(f"{self.base_url}/people-groups/")

        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )

        heading = chrome_driver.find_element(By.TAG_NAME, "h1")
        assert "People Groups" in heading.text, "People groups page heading missing"

        group_cards = chrome_driver.find_elements(By.CLASS_NAME, "people-group-card")
        assert len(group_cards) > 0, "No people group cards found on people groups page"

        page_text = chrome_driver.find_element(By.TAG_NAME, "body").text
        assert "Israelites" in page_text, "Expected people group name not found on page"

    def tearDown(self):
        """Clean up after tests."""
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
