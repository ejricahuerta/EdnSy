#!/usr/bin/env python3
"""
Robust Ontario Tenders Scraper
Handles session management and multiple access strategies
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import csv
from datetime import datetime
import os
import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import re
from urllib.parse import urljoin, urlparse

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RobustOntarioTendersScraper:
    def __init__(self, use_selenium=True):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.use_selenium = use_selenium
        self.driver = None
        
        # Multiple potential URLs to try
        self.potential_urls = [
            "https://ontariotenders.app.jaggaer.com/esop/toolkit/opportunity/current/list.si",
            "https://ontariotenders.app.jaggaer.com/esop/public/opportunities",
            "https://ontariotenders.app.jaggaer.com/esop/public",
            "https://ontariotenders.app.jaggaer.com/esop/guest/opportunities",
            "https://ontariotenders.app.jaggaer.com/esop/guest",
            "https://ontariotenders.app.jaggaer.com/public",
            "https://ontariotenders.app.jaggaer.com/",
        ]
        
        # Set up requests session
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8,fr-CA;q=0.7,fr;q=0.6',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        })
    
    def setup_selenium(self):
        """Set up Selenium WebDriver"""
        try:
            chrome_options = Options()
            # Don't use headless for debugging
            # chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Selenium WebDriver initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Selenium: {e}")
            return False
    
    def find_working_url(self):
        """Find a working URL that provides tender data"""
        working_urls = []
        
        if self.use_selenium and self.setup_selenium():
            try:
                for url in self.potential_urls:
                    try:
                        logger.info(f"Testing URL with Selenium: {url}")
                        self.driver.get(url)
                        time.sleep(3)
                        
                        # Check for session expiry or error messages
                        page_text = self.driver.page_source.lower()
                        if any(error in page_text for error in ['session is invalid', 'expired', 'unauthorized', 'access denied']):
                            logger.info(f"❌ Session/auth error: {url}")
                            continue
                        
                        # Check for tender-related content
                        if any(keyword in page_text for keyword in ['tender', 'opportunity', 'bid', 'procurement']):
                            logger.info(f"✅ Found tender content: {url}")
                            
                            # Look for data tables or lists
                            tables = self.driver.find_elements(By.TAG_NAME, "table")
                            divs = self.driver.find_elements(By.CSS_SELECTOR, "div[class*='list'], div[class*='item'], div[class*='row']")
                            
                            if tables or divs:
                                logger.info(f"🎯 Found data structures: {len(tables)} tables, {len(divs)} potential containers")
                                working_urls.append({
                                    'url': url,
                                    'tables': len(tables),
                                    'containers': len(divs),
                                    'content_length': len(self.driver.page_source)
                                })
                            else:
                                logger.info(f"⚠️  Content found but no data structures: {url}")
                        else:
                            logger.info(f"❌ No tender content: {url}")
                            
                    except Exception as e:
                        logger.warning(f"Error testing {url}: {e}")
                        continue
                
            finally:
                if self.driver:
                    self.driver.quit()
                    self.driver = None
        
        return working_urls
    
    def interactive_url_finder(self):
        """Interactive approach to find the right URL"""
        print("\n" + "="*60)
        print("INTERACTIVE URL FINDER")
        print("="*60)
        print("Let's find the correct URL for the Ontario Tenders data.")
        print("I'll open a browser window for you to navigate manually.")
        print()
        
        if not self.setup_selenium():
            print("❌ Could not set up browser automation")
            return None
        
        try:
            # Start with the main page
            logger.info("Opening main Ontario Tenders page...")
            self.driver.get(self.base_url)
            
            print("🌐 Browser opened with Ontario Tenders main page")
            print("Please:")
            print("1. Navigate to the tender opportunities list")
            print("2. Make sure you can see the tender data")
            print("3. Copy the URL from the address bar")
            print("4. Press Enter here when ready")
            print()
            
            input("Press Enter when you've navigated to the tender list page...")
            
            # Get the current URL
            current_url = self.driver.current_url
            print(f"📋 Current URL: {current_url}")
            
            # Check if there's data on the page
            page_source = self.driver.page_source
            tables = self.driver.find_elements(By.TAG_NAME, "table")
            
            print(f"📊 Page analysis:")
            print(f"  - Page size: {len(page_source):,} characters")
            print(f"  - Tables found: {len(tables)}")
            
            if tables:
                print("✅ Tables detected! This looks promising.")
                
                # Save the page for analysis
                with open('interactive_page_capture.html', 'w', encoding='utf-8') as f:
                    f.write(page_source)
                print("💾 Saved page content to 'interactive_page_capture.html'")
                
                return {
                    'url': current_url,
                    'page_source': page_source,
                    'tables_count': len(tables)
                }
            else:
                print("⚠️  No tables found. The data might be in a different format.")
                
                # Save anyway for analysis
                with open('interactive_page_capture.html', 'w', encoding='utf-8') as f:
                    f.write(page_source)
                print("💾 Saved page content to 'interactive_page_capture.html' for analysis")
                
                return {
                    'url': current_url,
                    'page_source': page_source,
                    'tables_count': 0
                }
                
        except Exception as e:
            logger.error(f"Interactive URL finder failed: {e}")
            return None
        finally:
            if self.driver:
                input("Press Enter to close the browser...")
                self.driver.quit()
    
    def parse_tender_data(self, html_content, source_url):
        """Enhanced parsing for tender data"""
        soup = BeautifulSoup(html_content, 'html.parser')
        tenders = []
        
        # Save debug HTML
        debug_file = f'debug_page_{datetime.now().strftime("%Y%m%d_%H%M%S")}.html'
        with open(debug_file, 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        logger.info(f"Saved debug HTML to {debug_file}")
        
        # Strategy 1: Look for tables
        tables = soup.find_all('table')
        logger.info(f"Found {len(tables)} tables")
        
        for i, table in enumerate(tables):
            rows = table.find_all('tr')
            if len(rows) < 2:
                continue
                
            logger.info(f"Processing table {i+1} with {len(rows)} rows")
            
            # Extract headers
            headers = self.extract_table_headers(table)
            logger.info(f"Table {i+1} headers: {headers}")
            
            # Extract data
            table_data = self.extract_table_data(table, headers, source_url)
            if table_data:
                tenders.extend(table_data)
                logger.info(f"Extracted {len(table_data)} records from table {i+1}")
        
        # Strategy 2: Look for structured divs
        if not tenders:
            logger.info("No table data found, looking for div-based structures...")
            div_data = self.extract_div_data(soup, source_url)
            if div_data:
                tenders.extend(div_data)
                logger.info(f"Extracted {len(div_data)} records from div structures")
        
        # Strategy 3: Look for JSON data in script tags
        if not tenders:
            logger.info("Looking for JSON data in script tags...")
            json_data = self.extract_json_data(soup, source_url)
            if json_data:
                tenders.extend(json_data)
                logger.info(f"Extracted {len(json_data)} records from JSON data")
        
        logger.info(f"Total extracted: {len(tenders)} tender records")
        return tenders
    
    def extract_table_headers(self, table):
        """Extract headers from table"""
        headers = []
        
        # Try thead first
        thead = table.find('thead')
        if thead:
            header_cells = thead.find_all(['th', 'td'])
            headers = [cell.get_text(strip=True) for cell in header_cells]
        else:
            # Try first row
            first_row = table.find('tr')
            if first_row:
                cells = first_row.find_all(['th', 'td'])
                potential_headers = [cell.get_text(strip=True) for cell in cells]
                
                # Check if it looks like headers
                header_keywords = ['title', 'number', 'date', 'organization', 'tender', 'opportunity', 'closing', 'reference', 'description', 'status']
                if any(any(keyword in header.lower() for keyword in header_keywords) for header in potential_headers):
                    headers = potential_headers
        
        if not headers:
            # Generate generic headers
            max_cols = max(len(row.find_all(['td', 'th'])) for row in table.find_all('tr')) if table.find_all('tr') else 0
            headers = [f"Column_{j+1}" for j in range(max_cols)]
        
        return headers
    
    def extract_table_data(self, table, headers, source_url):
        """Extract data from table"""
        data = []
        rows = table.find_all('tr')
        
        # Skip header row if identified
        data_rows = rows
        if headers and table.find('tr'):
            first_row_cells = table.find('tr').find_all(['th', 'td'])
            first_row_text = [cell.get_text(strip=True) for cell in first_row_cells]
            if first_row_text == headers:
                data_rows = rows[1:]
        
        for row_idx, row in enumerate(data_rows):
            cells = row.find_all(['td', 'th'])
            if not cells:
                continue
            
            tender_data = {}
            
            for j, cell in enumerate(cells):
                header = headers[j] if j < len(headers) else f"Column_{j+1}"
                
                # Extract text
                text = cell.get_text(strip=True)
                tender_data[header] = text
                
                # Extract links
                links = cell.find_all('a', href=True)
                if links:
                    link_data = []
                    for link in links:
                        href = link.get('href')
                        if href and not href.startswith('javascript:'):
                            href = urljoin(self.base_url, href)
                            link_data.append({
                                'text': link.get_text(strip=True),
                                'url': href
                            })
                    
                    if link_data:
                        tender_data[f"{header}_links"] = link_data
            
            # Only add meaningful rows
            if any(value and str(value).strip() for value in tender_data.values() if isinstance(value, str)):
                tender_data['scraped_at'] = datetime.now().isoformat()
                tender_data['source_url'] = source_url
                tender_data['row_index'] = row_idx
                data.append(tender_data)
        
        return data
    
    def extract_div_data(self, soup, source_url):
        """Extract data from div-based structures"""
        data = []
        
        # Look for common container patterns
        selectors = [
            'div[class*="tender"]',
            'div[class*="opportunity"]',
            'div[class*="bid"]',
            'div[class*="listing"]',
            'div[class*="item"]',
            'div[class*="row"]',
            'li[class*="tender"]',
            'li[class*="opportunity"]'
        ]
        
        for selector in selectors:
            containers = soup.select(selector)
            if containers:
                logger.info(f"Found {len(containers)} containers with selector: {selector}")
                
                for i, container in enumerate(containers):
                    text_content = container.get_text(strip=True)
                    if len(text_content) > 30:  # Skip very short content
                        tender_data = {
                            'content': text_content,
                            'scraped_at': datetime.now().isoformat(),
                            'source_url': source_url,
                            'container_index': i,
                            'selector_used': selector
                        }
                        
                        # Extract links
                        links = container.find_all('a', href=True)
                        if links:
                            link_data = []
                            for link in links:
                                href = link.get('href')
                                if href and not href.startswith('javascript:'):
                                    href = urljoin(self.base_url, href)
                                    link_data.append({
                                        'text': link.get_text(strip=True),
                                        'url': href
                                    })
                            
                            if link_data:
                                tender_data['links'] = link_data
                        
                        data.append(tender_data)
                
                if data:  # If we found data with this selector, don't try others
                    break
        
        return data
    
    def extract_json_data(self, soup, source_url):
        """Extract data from JSON in script tags"""
        data = []
        
        script_tags = soup.find_all('script')
        for script in script_tags:
            if script.string:
                # Look for JSON-like structures
                try:
                    # Simple regex to find JSON objects
                    json_matches = re.findall(r'\{[^{}]*"[^"]*"[^{}]*\}', script.string)
                    for match in json_matches:
                        try:
                            json_obj = json.loads(match)
                            if isinstance(json_obj, dict) and any(
                                key.lower() in ['tender', 'opportunity', 'bid', 'title', 'name'] 
                                for key in json_obj.keys()
                            ):
                                json_obj['scraped_at'] = datetime.now().isoformat()
                                json_obj['source_url'] = source_url
                                json_obj['data_source'] = 'json_script'
                                data.append(json_obj)
                        except json.JSONDecodeError:
                            continue
                except Exception as e:
                    continue
        
        return data
    
    def save_data(self, tenders, output_dir="data"):
        """Save scraped data"""
        if not tenders:
            logger.warning("No data to save")
            return []
        
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_files = []
        
        # Save as JSON
        json_file = os.path.join(output_dir, f"ontario_tenders_robust_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        saved_files.append(json_file)
        logger.info(f"Saved JSON: {json_file}")
        
        # Save as CSV
        try:
            df = pd.DataFrame(tenders)
            csv_file = os.path.join(output_dir, f"ontario_tenders_robust_{timestamp}.csv")
            df.to_csv(csv_file, index=False, encoding='utf-8')
            saved_files.append(csv_file)
            logger.info(f"Saved CSV: {csv_file}")
        except Exception as e:
            logger.error(f"Failed to save CSV: {e}")
        
        return saved_files

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Robust Ontario Tenders Scraper')
    parser.add_argument('--interactive', action='store_true', help='Use interactive mode to find the correct URL')
    parser.add_argument('--auto-find', action='store_true', help='Automatically test multiple URLs')
    parser.add_argument('--output', default='data', help='Output directory')
    args = parser.parse_args()
    
    scraper = RobustOntarioTendersScraper()
    
    try:
        print("Robust Ontario Tenders Scraper")
        print("=" * 35)
        
        if args.interactive:
            print("🔍 Interactive mode: Manual navigation")
            result = scraper.interactive_url_finder()
            
            if result and result.get('page_source'):
                print("✅ Got page content, parsing...")
                tenders = scraper.parse_tender_data(result['page_source'], result['url'])
                
                if tenders:
                    saved_files = scraper.save_data(tenders, args.output)
                    print(f"✅ Success! Found {len(tenders)} records")
                    print(f"📁 Files saved: {saved_files}")
                else:
                    print("❌ No tender data found in the page")
            else:
                print("❌ Could not get page content")
                
        elif args.auto_find:
            print("🔍 Auto-find mode: Testing multiple URLs")
            working_urls = scraper.find_working_url()
            
            if working_urls:
                print(f"✅ Found {len(working_urls)} working URLs:")
                for url_info in working_urls:
                    print(f"  - {url_info['url']} ({url_info['tables']} tables, {url_info['containers']} containers)")
                
                # Use the best URL (most tables/containers)
                best_url = max(working_urls, key=lambda x: x['tables'] + x['containers'])
                print(f"🎯 Using best URL: {best_url['url']}")
                
                # Re-scrape with the best URL
                if scraper.setup_selenium():
                    try:
                        scraper.driver.get(best_url['url'])
                        time.sleep(5)
                        page_source = scraper.driver.page_source
                        
                        tenders = scraper.parse_tender_data(page_source, best_url['url'])
                        
                        if tenders:
                            saved_files = scraper.save_data(tenders, args.output)
                            print(f"✅ Success! Found {len(tenders)} records")
                            print(f"📁 Files saved: {saved_files}")
                        else:
                            print("❌ No tender data found")
                            
                    finally:
                        scraper.driver.quit()
            else:
                print("❌ No working URLs found")
                print("💡 Try the --interactive mode instead")
        else:
            print("Please specify --interactive or --auto-find mode")
            print("Use --help for more options")
            
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        print(f"❌ Scraping failed: {e}")

if __name__ == "__main__":
    main()

