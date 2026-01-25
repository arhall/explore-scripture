#!/usr/bin/env python3
"""
E2E UI tests for Explore Scripture
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestE2EUI:
    """End-to-end UI flows for critical user journeys"""

    def test_global_search_direct_reference(self, chrome_driver, server):
        """Search for a direct reference and navigate to the chapter"""
        driver = chrome_driver
        driver.get(server)

        search_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "searchInput"))
        )
        search_input.clear()
        search_input.send_keys("Romans 8")

        results_container = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "search-results"))
        )
        WebDriverWait(driver, 15).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "#search-results .search-result")) > 0
        )

        target = None
        for result in results_container.find_elements(By.CSS_SELECTOR, ".search-result"):
            if "Romans 8" in result.text:
                target = result
                break

        assert target is not None, "Expected a Romans 8 search result"
        target.click()

        WebDriverWait(driver, 15).until(lambda d: "/books/romans/" in d.current_url)
        chapter = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#chapter-8"))
        )
        assert chapter is not None

    def test_sections_browse_cards(self, chrome_driver, server):
        """Browse sections and open a category page"""
        driver = chrome_driver
        driver.get(f"{server}/categories/")

        header = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".header h1"))
        )
        assert "Sections" in header.text

        cards = WebDriverWait(driver, 10).until(
            lambda d: d.find_elements(By.CSS_SELECTOR, ".grid .card")
        )
        assert len(cards) > 5

        cards[0].click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".header h1"))
        )
        assert "/categories/" in driver.current_url

    def test_quick_access_panel_toggle(self, chrome_driver, server):
        """Open and close the Quick Access panel from the header"""
        driver = chrome_driver
        driver.get(server)

        toggle = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".recents-bookmarks-toggle"))
        )
        toggle.click()

        panel = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "recentsBookmarksPanel"))
        )
        WebDriverWait(driver, 5).until(
            lambda d: "visible" in panel.get_attribute("class")
        )

        toggle.click()
        WebDriverWait(driver, 5).until(
            lambda d: "visible" not in panel.get_attribute("class")
        )
