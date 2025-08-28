#!/usr/bin/env python3
"""
Test Chapter Reader functionality
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException


def test_chapter_reader_loads_on_book_pages(chrome_driver):
    """Test that Chapter Reader JavaScript loads only on book pages"""
    # Test book page (should load chapter-reader.js)
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    
    # Check if Chapter Reader script is available
    script_loaded = chrome_driver.execute_script("""
        return typeof window.ChapterReader !== 'undefined' && 
               typeof window.chapterReaderInstance !== 'undefined' &&
               typeof window.openChapterReader !== 'undefined';
    """)
    
    assert script_loaded, "Chapter Reader should be loaded on book pages"


def test_chapter_reader_not_loaded_on_main_pages(chrome_driver):
    """Test that Chapter Reader is not loaded on non-book pages for performance"""
    # Test main page (should NOT load chapter-reader.js)
    chrome_driver.get("http://localhost:8080/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    
    # Check that Chapter Reader script is NOT available
    script_loaded = chrome_driver.execute_script("""
        return typeof window.ChapterReader !== 'undefined';
    """)
    
    assert not script_loaded, "Chapter Reader should NOT be loaded on main page for performance"


def test_read_chapter_buttons_present(chrome_driver):
    """Test that Read Chapter buttons are present on book pages with summaries"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    
    # Find Read Chapter buttons
    read_chapter_btns = chrome_driver.find_elements(By.CLASS_NAME, "read-chapter-btn")
    
    assert len(read_chapter_btns) > 0, "Should have Read Chapter buttons on book pages with summaries"
    
    # Check button text and icon
    first_btn = read_chapter_btns[0]
    btn_text = first_btn.text
    assert "Read Chapter" in btn_text, "Button should have 'Read Chapter' text"
    assert "▦" in btn_text, "Button should have iframe icon"


def test_chapter_reader_modal_opens(chrome_driver):
    """Test that clicking Read Chapter button opens the modal"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    time.sleep(1)  # Allow JavaScript to initialize
    
    # Find and click first Read Chapter button
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    read_chapter_btn.click()
    
    # Wait for modal to appear
    try:
        modal = WebDriverWait(chrome_driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
        )
        assert modal.is_displayed(), "Chapter reader modal should be visible"
    except TimeoutException:
        pytest.fail("Chapter reader modal should open when Read Chapter button is clicked")


def test_chapter_reader_modal_contains_iframe(chrome_driver):
    """Test that the chapter reader modal contains BibleGateway iframe"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    time.sleep(1)
    
    # Click first Read Chapter button
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    read_chapter_btn.click()
    
    # Wait for modal and iframe
    WebDriverWait(chrome_driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Check for iframe
    iframe = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-iframe")
    assert iframe, "Modal should contain BibleGateway iframe"
    
    # Check iframe source
    iframe_src = iframe.get_attribute("src")
    assert "biblegateway.com" in iframe_src, "Iframe should point to BibleGateway"
    assert "Genesis" in iframe_src, "Iframe should contain correct chapter reference"


def test_chapter_reader_modal_has_external_link(chrome_driver):
    """Test that the modal has an external link button"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    time.sleep(1)
    
    # Click first Read Chapter button
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    read_chapter_btn.click()
    
    # Wait for modal
    WebDriverWait(chrome_driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Check for external link button
    external_link = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-external-link")
    assert external_link, "Modal should have external link button"
    
    link_text = external_link.text
    assert "Open in New Tab" in link_text, "External link should have proper text"
    assert "⧉" in link_text, "External link should have external icon"
    
    # Check link target
    link_href = external_link.get_attribute("href")
    assert "biblegateway.com" in link_href, "External link should point to BibleGateway"


def test_chapter_reader_modal_closes(chrome_driver):
    """Test that the modal can be closed"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    time.sleep(1)
    
    # Open modal
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    read_chapter_btn.click()
    
    # Wait for modal
    modal = WebDriverWait(chrome_driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Find and click close button
    close_btn = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-close")
    close_btn.click()
    
    # Wait for modal to disappear
    WebDriverWait(chrome_driver, 5).until_not(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )


@pytest.mark.responsive
def test_chapter_reader_responsive_sizing(chrome_driver):
    """Test that chapter reader modal is responsive on different screen sizes"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Test desktop size
    chrome_driver.set_window_size(1920, 1080)
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    time.sleep(1)
    
    # Open modal
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    read_chapter_btn.click()
    
    # Wait for modal
    WebDriverWait(chrome_driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Check iframe height on desktop
    iframe = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-iframe")
    desktop_height = iframe.size['height']
    assert desktop_height >= 500, "Iframe should have adequate height on desktop"
    
    # Close modal
    close_btn = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-close")
    close_btn.click()
    
    # Wait for modal to close
    WebDriverWait(chrome_driver, 5).until_not(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Test mobile size
    chrome_driver.set_window_size(375, 667)
    time.sleep(1)
    
    # Open modal again
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    read_chapter_btn.click()
    
    # Wait for modal
    WebDriverWait(chrome_driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Check mobile responsive behavior
    modal = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-modal")
    modal_width = modal.size['width']
    viewport_width = chrome_driver.execute_script("return window.innerWidth")
    
    # On mobile, modal should take most of the viewport width
    width_percentage = modal_width / viewport_width
    assert width_percentage > 0.9, "Modal should take most of viewport width on mobile"


def test_chapter_reader_works_across_books(chrome_driver):
    """Test that chapter reader works on different books"""
    books_to_test = [
        ("genesis", "Genesis"),
        ("matthew", "Matthew"),
        ("romans", "Romans")
    ]
    
    for book_slug, book_name in books_to_test:
        chrome_driver.get(f"http://localhost:8080/books/{book_slug}/")
        
        # Wait for page to load
        WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "container"))
        )
        time.sleep(1)
        
        # Check for Read Chapter buttons
        read_chapter_btns = chrome_driver.find_elements(By.CLASS_NAME, "read-chapter-btn")
        
        if len(read_chapter_btns) > 0:  # Only test if book has summaries
            # Click first button
            read_chapter_btns[0].click()
            
            # Wait for modal
            WebDriverWait(chrome_driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
            )
            
            # Check iframe contains correct book
            iframe = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-iframe")
            iframe_src = iframe.get_attribute("src")
            assert book_name in iframe_src, f"Iframe should contain {book_name} reference"
            
            # Close modal
            close_btn = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-close")
            close_btn.click()
            
            # Wait for modal to close
            WebDriverWait(chrome_driver, 5).until_not(
                EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
            )


@pytest.mark.accessibility
def test_chapter_reader_accessibility(chrome_driver):
    """Test chapter reader accessibility features"""
    chrome_driver.get("http://localhost:8080/books/genesis/")
    
    # Wait for page to load
    WebDriverWait(chrome_driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "container"))
    )
    time.sleep(1)
    
    # Check Read Chapter button accessibility
    read_chapter_btn = chrome_driver.find_element(By.CLASS_NAME, "read-chapter-btn")
    
    # Check button has proper title attribute
    title = read_chapter_btn.get_attribute("title")
    assert title is not None, "Read Chapter button should have title attribute"
    assert "BibleGateway" in title, "Title should mention BibleGateway"
    
    # Open modal
    read_chapter_btn.click()
    
    # Wait for modal
    WebDriverWait(chrome_driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "chapter-reader-overlay"))
    )
    
    # Check close button accessibility
    close_btn = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-close")
    aria_label = close_btn.get_attribute("aria-label")
    assert aria_label is not None, "Close button should have aria-label"
    
    # Check iframe accessibility
    iframe = chrome_driver.find_element(By.CLASS_NAME, "chapter-reader-iframe")
    iframe_title = iframe.get_attribute("title")
    assert iframe_title is not None, "Iframe should have title attribute"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])