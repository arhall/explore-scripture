#!/usr/bin/env python3
"""
Selenium debugging script for Bible Static Site
Helps diagnose rendering and visibility issues
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def debug_page():
    # Setup Chrome options for headless mode
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-running-insecure-content')
    
    print("🚀 Starting Chrome WebDriver...")
    
    try:
        # Initialize Chrome WebDriver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Navigate to the local development server
        url = "http://localhost:8080"
        print(f"📍 Navigating to {url}")
        driver.get(url)
        
        # Wait for page to load
        time.sleep(3)
        
        print("\n" + "="*50)
        print("🔍 DEBUGGING REPORT")
        print("="*50)
        
        # Check page title
        title = driver.title
        print(f"📄 Page Title: {title}")
        
        # Check if emergency test div is visible
        try:
            emergency_div = driver.find_element(By.XPATH, "//div[contains(text(), 'EMERGENCY TEST')]")
            print(f"🚨 Emergency Test Div: FOUND and {'VISIBLE' if emergency_div.is_displayed() else 'HIDDEN'}")
        except:
            print("🚨 Emergency Test Div: NOT FOUND")
        
        # Check navigation
        try:
            nav_brand = driver.find_element(By.CLASS_NAME, "nav-brand")
            print(f"🧭 Navigation Brand: FOUND - '{nav_brand.text}' ({'VISIBLE' if nav_brand.is_displayed() else 'HIDDEN'})")
        except:
            print("🧭 Navigation Brand: NOT FOUND")
        
        # Check container
        try:
            container = driver.find_element(By.CLASS_NAME, "container")
            print(f"📦 Container: FOUND ({'VISIBLE' if container.is_displayed() else 'HIDDEN'})")
            print(f"    Size: {container.size}")
            print(f"    Location: {container.location}")
        except:
            print("📦 Container: NOT FOUND")
        
        # Check main content
        try:
            main_content = driver.find_element(By.ID, "main-content")
            print(f"📝 Main Content: FOUND ({'VISIBLE' if main_content.is_displayed() else 'HIDDEN'})")
            print(f"    Size: {main_content.size}")
            print(f"    Location: {main_content.location}")
            
            # Check if main content has any text
            main_text = main_content.text.strip()
            if main_text:
                print(f"    Text Preview: '{main_text[:100]}...'")
            else:
                print("    Text: EMPTY")
                
        except:
            print("📝 Main Content: NOT FOUND")
        
        # Check for specific content elements
        elements_to_check = [
            ("hero-section", "🦸 Hero Section"),
            ("features-grid", "⚡ Features Grid"), 
            ("testament-section", "📜 Testament Section"),
            ("category-group", "📂 Category Group"),
            ("book-card", "📖 Book Card")
        ]
        
        for class_name, display_name in elements_to_check:
            try:
                elements = driver.find_elements(By.CLASS_NAME, class_name)
                if elements:
                    visible_count = sum(1 for el in elements if el.is_displayed())
                    print(f"{display_name}: FOUND {len(elements)} element(s), {visible_count} visible")
                else:
                    print(f"{display_name}: NOT FOUND")
            except:
                print(f"{display_name}: ERROR checking")
        
        # Check computed styles for main content
        try:
            main_content = driver.find_element(By.ID, "main-content")
            opacity = driver.execute_script("return window.getComputedStyle(arguments[0]).opacity", main_content)
            visibility = driver.execute_script("return window.getComputedStyle(arguments[0]).visibility", main_content)
            display = driver.execute_script("return window.getComputedStyle(arguments[0]).display", main_content)
            transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", main_content)
            
            print(f"\n💅 Computed Styles for Main Content:")
            print(f"    Opacity: {opacity}")
            print(f"    Visibility: {visibility}")
            print(f"    Display: {display}")
            print(f"    Transform: {transform}")
            
        except:
            print("💅 Could not check computed styles")
        
        # Check for JavaScript errors
        try:
            logs = driver.get_log('browser')
            if logs:
                print(f"\n🐛 Browser Console Errors:")
                for log in logs:
                    if log['level'] in ['SEVERE', 'WARNING']:
                        print(f"    {log['level']}: {log['message']}")
            else:
                print("\n✅ No JavaScript errors found")
        except:
            print("\n🐛 Could not check console logs")
        
        # Take a screenshot
        screenshot_path = "/Users/andrewhall/repo/bible-static-site/debug-screenshot.png"
        driver.save_screenshot(screenshot_path)
        print(f"\n📸 Screenshot saved to: {screenshot_path}")
        
        # Get page source length
        page_source = driver.page_source
        print(f"\n📄 Page Source Length: {len(page_source)} characters")
        
        print("\n" + "="*50)
        print("✅ DEBUG REPORT COMPLETE")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error during debugging: {e}")
        
    finally:
        if 'driver' in locals():
            driver.quit()
            print("🏁 WebDriver closed")

if __name__ == "__main__":
    debug_page()