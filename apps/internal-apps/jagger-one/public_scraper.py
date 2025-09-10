#!/usr/bin/env python3
"""
Public Ontario Tenders Scraper
Attempts to scrape publicly available tender information
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
from datetime import datetime
import os
import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PublicOntarioTendersScraper:
    def __init__(self):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        # Try different public URLs
        self.public_urls = [
            "https://ontariotenders.app.jaggaer.com/esop/public/opportunities",
            "https://ontariotenders.app.jaggaer.com/public",
            "https://ontariotenders.app.jaggaer.com/esop/public",
            "https://ontariotenders.app.jaggaer.com/",
            "https://ontariotenders.app.jaggaer.com/esop/",
        ]
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
    
    def find_public_access(self):
        """Try to find publicly accessible pages"""
        accessible_urls = []
        
        for url in self.public_urls:
            try:
                logger.info(f"Trying URL: {url}")
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    logger.info(f"✅ Accessible: {url}")
                    accessible_urls.append(url)
                    
                    # Check if it contains tender data
                    soup = BeautifulSoup(response.content, 'html.parser')
                    if any(keyword in soup.get_text().lower() for keyword in ['tender', 'opportunity', 'bid', 'procurement']):
                        logger.info(f"🎯 Contains tender-related content: {url}")
                elif response.status_code == 401:
                    logger.info(f"🔒 Requires authentication: {url}")
                elif response.status_code == 404:
                    logger.info(f"❌ Not found: {url}")
                else:
                    logger.info(f"⚠️  Status {response.status_code}: {url}")
                    
            except Exception as e:
                logger.warning(f"Error accessing {url}: {e}")
                
            time.sleep(1)  # Be respectful
        
        return accessible_urls
    
    def scrape_with_selenium_public(self):
        """Try to access public pages with Selenium"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        driver = None
        try:
            driver = webdriver.Chrome(options=chrome_options)
            
            for url in self.public_urls:
                try:
                    logger.info(f"Selenium trying: {url}")
                    driver.get(url)
                    time.sleep(3)
                    
                    # Check for tender-related content
                    page_text = driver.page_source.lower()
                    if any(keyword in page_text for keyword in ['tender', 'opportunity', 'bid', 'procurement']):
                        logger.info(f"🎯 Found tender content with Selenium: {url}")
                        
                        # Look for links to tender lists
                        links = driver.find_elements(By.TAG_NAME, "a")
                        tender_links = []
                        
                        for link in links:
                            try:
                                href = link.get_attribute('href')
                                text = link.text.lower()
                                if href and any(keyword in text for keyword in ['tender', 'opportunity', 'bid', 'search', 'list']):
                                    tender_links.append({'url': href, 'text': link.text})
                            except:
                                continue
                        
                        if tender_links:
                            logger.info(f"Found {len(tender_links)} potential tender links:")
                            for link in tender_links[:5]:  # Show first 5
                                logger.info(f"  - {link['text']}: {link['url']}")
                            
                            return url, tender_links
                
                except Exception as e:
                    logger.warning(f"Selenium error for {url}: {e}")
                    continue
            
            return None, []
            
        except Exception as e:
            logger.error(f"Selenium setup failed: {e}")
            return None, []
        finally:
            if driver:
                driver.quit()
    
    def explore_site_structure(self):
        """Explore the site structure to find public endpoints"""
        logger.info("Exploring site structure...")
        
        # Try to get the main page
        try:
            response = self.session.get(self.base_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for navigation links
                links = soup.find_all('a', href=True)
                public_links = []
                
                for link in links:
                    href = link.get('href')
                    text = link.get_text(strip=True).lower()
                    
                    if href and not href.startswith('javascript:'):
                        if href.startswith('/'):
                            full_url = self.base_url + href
                        elif not href.startswith('http'):
                            full_url = self.base_url + '/' + href
                        else:
                            full_url = href
                        
                        # Look for public-sounding links
                        if any(keyword in text for keyword in ['public', 'search', 'browse', 'opportunities', 'tenders']) or \
                           any(keyword in href.lower() for keyword in ['public', 'search', 'browse']):
                            public_links.append({'url': full_url, 'text': text})
                
                logger.info(f"Found {len(public_links)} potential public links:")
                for link in public_links[:10]:  # Show first 10
                    logger.info(f"  - {link['text']}: {link['url']}")
                
                return public_links
                
        except Exception as e:
            logger.error(f"Failed to explore site structure: {e}")
        
        return []
    
    def create_alternative_approach_guide(self):
        """Create a guide for alternative approaches"""
        guide = """
# Ontario Tenders Scraping - Alternative Approaches

The Ontario Tenders website requires authentication to access the full tender listings.
Here are alternative approaches you can try:

## 1. Official Registration
- Visit: https://ontariotenders.app.jaggaer.com
- Register for a free account
- Use the authenticated_scraper.py script with your credentials

## 2. API Access (if available)
- Check if Ontario provides an official API
- Look for developer documentation
- Contact the site administrators

## 3. RSS/XML Feeds
- Check for RSS feeds: /rss, /feed, /xml
- Look in robots.txt for feed URLs
- Check the site's footer for feed links

## 4. Public Data Sources
- Ontario Open Data Portal: https://data.ontario.ca/
- Government procurement databases
- Municipal tender websites

## 5. Web Archive Access
- Wayback Machine: https://web.archive.org/
- Cached versions might have public data

## 6. Contact Information
- Reach out to Ontario procurement office
- Request bulk data access
- Ask about public data availability

## 7. Legal Considerations
- Ensure compliance with terms of service
- Respect rate limits and robots.txt
- Consider data usage rights

## Next Steps
1. Try registering for an account
2. Use authenticated_scraper.py for logged-in access
3. Explore official data sources
4. Contact site administrators for API access
"""
        
        with open('alternative_approaches.md', 'w', encoding='utf-8') as f:
            f.write(guide)
        
        logger.info("Created alternative_approaches.md with guidance")
        return guide

def main():
    """Main execution function"""
    scraper = PublicOntarioTendersScraper()
    
    print("Ontario Tenders Public Access Explorer")
    print("=" * 40)
    
    # Try to find accessible URLs
    logger.info("Step 1: Checking for publicly accessible URLs...")
    accessible_urls = scraper.find_public_access()
    
    if accessible_urls:
        print(f"✅ Found {len(accessible_urls)} accessible URLs")
        for url in accessible_urls:
            print(f"  - {url}")
    else:
        print("❌ No publicly accessible URLs found")
    
    # Try Selenium approach
    logger.info("Step 2: Trying Selenium for dynamic content...")
    selenium_url, tender_links = scraper.scrape_with_selenium_public()
    
    if selenium_url:
        print(f"✅ Selenium found content at: {selenium_url}")
        if tender_links:
            print(f"📋 Found {len(tender_links)} potential tender links")
    else:
        print("❌ Selenium didn't find accessible tender content")
    
    # Explore site structure
    logger.info("Step 3: Exploring site structure...")
    public_links = scraper.explore_site_structure()
    
    if public_links:
        print(f"✅ Found {len(public_links)} potential public links")
    else:
        print("❌ Could not explore site structure")
    
    # Create guidance
    logger.info("Step 4: Creating alternative approaches guide...")
    guide = scraper.create_alternative_approach_guide()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("The Ontario Tenders website requires authentication for full access.")
    print("To scrape tender data, you'll need to:")
    print("1. Register for an account on the website")
    print("2. Use the authenticated_scraper.py script")
    print("3. Or explore the alternative approaches in alternative_approaches.md")
    print("=" * 60)

if __name__ == "__main__":
    main()
