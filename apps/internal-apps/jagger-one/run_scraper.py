#!/usr/bin/env python3
"""
Simple runner for Ontario Tenders scraper
"""

import sys
import os
import logging
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    print("Ontario Tenders Scraper")
    print("=" * 30)
    
    # Try the basic scraper first
    try:
        print("Attempting to scrape with basic requests method...")
        from ontario_tenders_scraper import OntarioTendersScraper
        
        scraper = OntarioTendersScraper()
        tenders = scraper.scrape_tenders()
        
        if tenders:
            files = scraper.save_data(tenders)
            print(f"✅ Success! Found {len(tenders)} tender opportunities")
            print(f"📁 Data saved to: {files}")
            return
        else:
            print("⚠️  No data found with basic method, trying advanced scraper...")
            
    except Exception as e:
        print(f"❌ Basic scraper failed: {e}")
        print("🔄 Trying advanced scraper with Selenium...")
    
    # Try advanced scraper with Selenium
    try:
        from advanced_scraper import AdvancedOntarioTendersScraper
        
        scraper = AdvancedOntarioTendersScraper(use_selenium=True)
        tenders = scraper.scrape_tenders()
        
        if tenders:
            files = scraper.save_data(tenders)
            print(f"✅ Success with Selenium! Found {len(tenders)} tender opportunities")
            print(f"📁 Data saved to: {files}")
        else:
            print("❌ No data found even with Selenium")
            print("🔍 The website might be using complex JavaScript or require authentication")
            
        scraper.cleanup()
        
    except Exception as e:
        print(f"❌ Advanced scraper also failed: {e}")
        print("💡 Try installing Chrome/Chromium and ChromeDriver")
        print("💡 Or check if the website requires authentication")

if __name__ == "__main__":
    main()
