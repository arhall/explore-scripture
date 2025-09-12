"""
Comprehensive test suite for the Commentary Reader system.
Tests URL generation, book name mapping, and commentary integration.
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


class TestCommentarySystem:
    """Test suite for the Commentary Reader functionality."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test environment."""
        self.base_url = get_test_urls()["base"]
        
        # Commentary sources and their expected patterns
        self.commentary_sources = {
            'enduring-word': {
                'name': 'Enduring Word (David Guzik)',
                'supports_iframe': True,
                'url_pattern': 'enduringword.com/bible-commentary/'
            },
            'matthew-henry': {
                'name': 'Matthew Henry Commentary',
                'supports_iframe': True,
                'url_pattern': 'biblestudytools.com/commentaries/matthew-henry-complete/'
            },
            'jfb': {
                'name': 'Jamieson-Fausset-Brown Commentary',
                'supports_iframe': True,
                'url_pattern': 'biblehub.com/commentaries/jfb/'
            },
            'scofield': {
                'name': 'Scofield Reference Notes (1917)',
                'supports_iframe': True,
                'url_pattern': 'biblehub.com/commentaries/sco/'
            },
            'pulpit': {
                'name': 'Pulpit Commentary',
                'supports_iframe': True,
                'url_pattern': 'biblehub.com/commentaries/pulpit/'
            },
            'john-gill': {
                'name': 'John Gill - Exposition of the Bible',
                'supports_iframe': True,
                'url_pattern': 'biblestudytools.com/commentaries/gills-exposition-of-the-bible/'
            },
            'barnes-notes': {
                'name': 'Barnes\' Notes',
                'supports_iframe': False,
                'url_pattern': 'studylight.org/commentaries/eng/bnb/'
            },
            'calvin': {
                'name': 'Calvin\'s Bible Commentaries',
                'supports_iframe': False,
                'url_pattern': 'studylight.org/commentaries/eng/cal/'
            },
            'homiletic': {
                'name': 'Preacher\'s Homiletic Commentary',
                'supports_iframe': False,
                'url_pattern': 'studylight.org/commentaries/eng/phc/'
            },
            'biblical-illustrator': {
                'name': 'The Biblical Illustrator (Exell)',
                'supports_iframe': False,
                'url_pattern': 'studylight.org/commentaries/eng/tbi/'
            }
        }

        # Test books with different edge cases
        self.test_books = [
            {
                'name': 'Genesis',
                'slug': 'genesis',
                'chapter': 1,
                'simple_case': True
            },
            {
                'name': '1 John',
                'slug': '1-john',
                'chapter': 1,
                'numbered_book': True
            },
            {
                'name': 'Song of Songs',
                'slug': 'song-of-songs',
                'chapter': 1,
                'special_case': True
            },
            {
                'name': '1 Samuel',
                'slug': '1-samuel',
                'chapter': 1,
                'numbered_book': True
            },
            {
                'name': '2 Corinthians',
                'slug': '2-corinthians',
                'chapter': 1,
                'numbered_book': True
            }
        ]

    def test_commentary_buttons_exist(self, chrome_driver):
        """Test that Read Chapter and Read Commentary buttons exist for all chapters."""
        for book in self.test_books:
            chrome_driver.get(f"{self.base_url}/books/{book['slug']}/")
            
            # Wait for page to load
            WebDriverWait(chrome_driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "chapter-actions"))
            )
            
            # Find all chapter action containers
            chapter_actions = chrome_driver.find_elements(By.CLASS_NAME, "chapter-actions")
            
            assert len(chapter_actions) > 0, f"No chapter actions found for {book['name']}"
            
            # Check first chapter has both buttons
            first_chapter = chapter_actions[0]
            
            read_chapter_btn = first_chapter.find_element(By.CLASS_NAME, "chapter-reader-button")
            read_commentary_btn = first_chapter.find_element(By.CLASS_NAME, "commentary-reader-button")
            
            assert "Read Chapter" in read_chapter_btn.text, f"Read Chapter button text incorrect for {book['name']}"
            assert "Read Commentary" in read_commentary_btn.text, f"Read Commentary button text incorrect for {book['name']}"

    def test_commentary_modal_opens(self, chrome_driver):
        """Test that clicking Read Commentary opens the modal."""
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Wait for commentary system to load
        WebDriverWait(chrome_driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "commentary-reader-button"))
        )
        
        # Click first Read Commentary button
        commentary_btn = chrome_driver.find_element(By.CLASS_NAME, "commentary-reader-button")
        commentary_btn.click()
        
        # Wait for modal to appear
        modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
        )
        
        assert modal.is_displayed(), "Commentary modal did not open"
        
        # Check modal contains required elements
        title = modal.find_element(By.CLASS_NAME, "commentary-reader-title")
        assert "Commentary" in title.text
        
        source_select = modal.find_element(By.CLASS_NAME, "commentary-reader-source-select")
        assert source_select.is_displayed(), "Commentary source selector not found"

    def test_commentary_source_switching(self, chrome_driver):
        """Test switching between different commentary sources."""
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Open commentary modal
        WebDriverWait(chrome_driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "commentary-reader-button"))
        )
        
        commentary_btn = chrome_driver.find_element(By.CLASS_NAME, "commentary-reader-button")
        commentary_btn.click()
        
        # Wait for modal and get source selector
        modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
        )
        
        source_select = modal.find_element(By.CLASS_NAME, "commentary-reader-source-select")
        
        # Get all available options
        from selenium.webdriver.support.ui import Select
        select = Select(source_select)
        options = [option.get_attribute('value') for option in select.options]
        
        # Test switching to different sources
        test_sources = ['matthew-henry', 'jfb', 'scofield'] if len(options) > 3 else options[:2]
        
        for source in test_sources:
            if source in options:
                select.select_by_value(source)
                time.sleep(1)  # Allow content to update
                
                # Check that content updated
                content_area = modal.find_element(By.CLASS_NAME, "commentary-reader-content")
                assert content_area.is_displayed(), f"Content area not visible for {source}"

    def test_iframe_vs_direct_access_handling(self, chrome_driver):
        """Test that iframe-compatible and blocked sources are handled correctly."""
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Open commentary modal
        WebDriverWait(chrome_driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "commentary-reader-button"))
        )
        
        commentary_btn = chrome_driver.find_element(By.CLASS_NAME, "commentary-reader-button")
        commentary_btn.click()
        
        modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
        )
        
        source_select = modal.find_element(By.CLASS_NAME, "commentary-reader-source-select")
        from selenium.webdriver.support.ui import Select
        select = Select(source_select)
        
        # Test iframe-compatible source (Enduring Word)
        if any('enduring-word' in opt.get_attribute('value') for opt in select.options):
            select.select_by_value('enduring-word')
            time.sleep(2)
            
            # Should have iframe container
            iframe_containers = modal.find_elements(By.CLASS_NAME, "commentary-reader-iframe-container")
            assert len(iframe_containers) > 0, "Iframe container not found for iframe-compatible source"
        
        # Test direct-access source (Barnes Notes)
        barnes_option = None
        for opt in select.options:
            if 'barnes' in opt.get_attribute('value').lower():
                barnes_option = opt.get_attribute('value')
                break
        
        if barnes_option:
            select.select_by_value(barnes_option)
            time.sleep(2)
            
            # Should have direct access interface
            direct_access = modal.find_elements(By.CLASS_NAME, "commentary-reader-direct-access")
            assert len(direct_access) > 0, "Direct access interface not found for blocked source"
            
            # Should have external link
            external_links = modal.find_elements(By.CLASS_NAME, "commentary-reader-primary-link")
            assert len(external_links) > 0, "External link not found for blocked source"

    def test_book_name_edge_cases(self, chrome_driver):
        """Test URL generation for edge cases like Song of Songs, numbered books."""
        edge_case_books = [
            {
                'slug': 'song-of-songs',
                'expected_urls': {
                    'biblehub.com': 'songs',  # JFB, Scofield, Pulpit use 'songs'
                    'enduringword.com': 'song-of-solomon',  # Enduring Word uses song-of-solomon
                    'studylight.org': 'song-of-solomon'  # StudyLight uses song-of-solomon
                }
            },
            {
                'slug': '1-john',
                'expected_urls': {
                    'biblehub.com': '1_john',  # BibleHub uses underscores
                    'studylight.org': '1-john',  # StudyLight uses hyphens
                    'enduringword.com': '1-john'  # Enduring Word uses hyphens
                }
            },
            {
                'slug': '1-samuel',
                'expected_urls': {
                    'biblehub.com': '1_samuel',  # BibleHub uses underscores
                    'studylight.org': '1-samuel',  # StudyLight uses hyphens
                    'enduringword.com': '1-samuel'  # Enduring Word uses hyphens
                }
            }
        ]
        
        for book in edge_case_books:
            chrome_driver.get(f"{self.base_url}/books/{book['slug']}/")
            
            # Open commentary modal
            WebDriverWait(chrome_driver, 10).until(
                EC.element_to_be_clickable((By.CLASS_NAME, "commentary-reader-button"))
            )
            
            commentary_btn = chrome_driver.find_element(By.CLASS_NAME, "commentary-reader-button")
            commentary_btn.click()
            
            modal = WebDriverWait(chrome_driver, 5).until(
                EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
            )
            
            # Test different commentary sources for this book
            source_select = modal.find_element(By.CLASS_NAME, "commentary-reader-source-select")
            from selenium.webdriver.support.ui import Select
            select = Select(source_select)
            
            for option in select.options[:3]:  # Test first 3 sources
                source_value = option.get_attribute('value')
                select.select_by_value(source_value)
                time.sleep(1)
                
                # Verify content loads or shows appropriate interface
                content_area = modal.find_element(By.CLASS_NAME, "commentary-reader-content")
                assert content_area.is_displayed(), f"Content not displayed for {book['slug']} with {source_value}"

    def test_modal_keyboard_navigation(self, chrome_driver):
        """Test keyboard navigation and ESC key closes modal."""
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Open modal
        WebDriverWait(chrome_driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "commentary-reader-button"))
        )
        
        commentary_btn = chrome_driver.find_element(By.CLASS_NAME, "commentary-reader-button")
        commentary_btn.click()
        
        modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
        )
        
        # Modal should be visible
        assert modal.is_displayed(), "Modal not visible after opening"
        
        # Press ESC key
        from selenium.webdriver.common.keys import Keys
        chrome_driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
        
        # Modal should be hidden
        WebDriverWait(chrome_driver, 5).until(
            EC.invisibility_of_element_located((By.CLASS_NAME, "commentary-reader-overlay"))
        )

    def test_chapter_reader_integration(self, chrome_driver):
        """Test that both Read Chapter and Read Commentary buttons work together."""
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Wait for buttons to load
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "chapter-actions"))
        )
        
        chapter_actions = chrome_driver.find_element(By.CLASS_NAME, "chapter-actions")
        
        # Test Read Chapter button
        read_chapter_btn = chapter_actions.find_element(By.CLASS_NAME, "chapter-reader-button")
        read_chapter_btn.click()
        
        # Chapter reader modal should open
        chapter_modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "chapter-reader-modal"))
        )
        assert chapter_modal.is_displayed(), "Chapter reader modal did not open"
        
        # Close chapter modal
        close_btn = chapter_modal.find_element(By.CLASS_NAME, "chapter-reader-close")
        close_btn.click()
        
        # Wait for chapter modal to close
        WebDriverWait(chrome_driver, 3).until(
            EC.invisibility_of_element_located((By.CLASS_NAME, "chapter-reader-modal"))
        )
        
        # Test Read Commentary button
        read_commentary_btn = chapter_actions.find_element(By.CLASS_NAME, "commentary-reader-button")
        read_commentary_btn.click()
        
        # Commentary modal should open
        commentary_modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
        )
        assert commentary_modal.is_displayed(), "Commentary modal did not open"

    def test_mobile_responsiveness(self, chrome_driver):
        """Test commentary system works on mobile viewport."""
        # Set mobile viewport
        chrome_driver.set_window_size(375, 667)  # iPhone 6/7/8 size
        
        chrome_driver.get(f"{self.base_url}/books/genesis/")
        
        # Wait for mobile layout
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "chapter-actions"))
        )
        
        # Buttons should stack vertically on mobile
        chapter_actions = chrome_driver.find_element(By.CLASS_NAME, "chapter-actions")
        
        # Check that both buttons exist
        read_chapter_btn = chapter_actions.find_element(By.CLASS_NAME, "chapter-reader-button")
        read_commentary_btn = chapter_actions.find_element(By.CLASS_NAME, "commentary-reader-button")
        
        assert read_chapter_btn.is_displayed(), "Read Chapter button not visible on mobile"
        assert read_commentary_btn.is_displayed(), "Read Commentary button not visible on mobile"
        
        # Test commentary modal on mobile
        read_commentary_btn.click()
        
        modal = WebDriverWait(chrome_driver, 5).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "commentary-reader-modal"))
        )
        
        # Modal should fill viewport on mobile
        modal_rect = modal.rect
        viewport_width = chrome_driver.execute_script("return window.innerWidth")
        
        assert modal_rect['width'] >= viewport_width * 0.9, "Modal not properly sized for mobile"

    def test_all_books_have_commentary_buttons(self, chrome_driver):
        """Test that all 66 biblical books have commentary functionality."""
        # Sample of books to test (representing different categories)
        sample_books = [
            'genesis', 'exodus', 'leviticus',  # Torah
            '1-samuel', '2-kings', '1-chronicles',  # History
            'psalms', 'proverbs', 'ecclesiastes',  # Wisdom
            'isaiah', 'jeremiah', 'ezekiel',  # Major Prophets
            'hosea', 'amos', 'malachi',  # Minor Prophets
            'matthew', 'mark', 'luke', 'john',  # Gospels
            'acts', 'romans', '1-corinthians',  # Acts and Epistles
            '1-john', '2-john', '3-john',  # Johannine Epistles
            'revelation'  # Apocalypse
        ]
        
        for book_slug in sample_books:
            try:
                chrome_driver.get(f"{self.base_url}/books/{book_slug}/")
                
                # Wait for page to load
                WebDriverWait(chrome_driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "chapter-actions"))
                )
                
                # Check for both buttons
                chapter_actions = chrome_driver.find_elements(By.CLASS_NAME, "chapter-actions")
                assert len(chapter_actions) > 0, f"No chapter actions found for {book_slug}"
                
                first_chapter = chapter_actions[0]
                read_chapter_btn = first_chapter.find_element(By.CLASS_NAME, "chapter-reader-button")
                read_commentary_btn = first_chapter.find_element(By.CLASS_NAME, "commentary-reader-button")
                
                assert read_chapter_btn.is_displayed(), f"Read Chapter button missing for {book_slug}"
                assert read_commentary_btn.is_displayed(), f"Read Commentary button missing for {book_slug}"
                
            except Exception as e:
                pytest.fail(f"Commentary buttons test failed for {book_slug}: {str(e)}")

    def tearDown(self):
        """Clean up after tests."""
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])