#!/usr/bin/env python3
"""
Ontario Tenders Public Scraper
Scrapes from the public tender opportunities page
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

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OntarioPublicTendersScraper:
    def __init__(self, use_selenium=False):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.public_url = "https://ontariotenders.app.jaggaer.com/esop/toolkit/opportunity/current/list.si?reset=true&resetstored=true&customLoginPage=%2Fesop%2Fnac-host%2Fpublic%2Fweb%2Flogin.html&customGuest=&userAct=changeLangIndex&language=en_CA&_ncp=1756534667711.157646-1"
        self.use_selenium = use_selenium
        self.driver = None
        
        # Set up requests session
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
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
            chrome_options.add_argument('--headless')
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
    
    def fetch_with_requests(self, max_retries=3):
        """Fetch page using requests"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching with requests (attempt {attempt + 1}): {self.public_url}")
                response = self.session.get(self.public_url, timeout=30)
                response.raise_for_status()
                logger.info(f"Successfully fetched page ({len(response.text)} characters)")
                return response.text
            except requests.RequestException as e:
                logger.warning(f"Requests attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
    
    def fetch_with_selenium(self, wait_time=15):
        """Fetch page using Selenium"""
        try:
            logger.info(f"Fetching with Selenium: {self.public_url}")
            self.driver.get(self.public_url)
            
            # Wait for the page to load
            WebDriverWait(self.driver, wait_time).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Wait for potential dynamic content
            time.sleep(5)
            
            # Try to wait for tables or tender content
            try:
                WebDriverWait(self.driver, 10).until(
                    lambda driver: len(driver.find_elements(By.TAG_NAME, "table")) > 0 or
                                  "tender" in driver.page_source.lower() or
                                  "opportunity" in driver.page_source.lower()
                )
                logger.info("Found tender-related content")
            except TimeoutException:
                logger.warning("No specific tender content found within timeout, proceeding anyway")
            
            html_content = self.driver.page_source
            logger.info(f"Retrieved page content ({len(html_content)} characters)")
            return html_content
            
        except Exception as e:
            logger.error(f"Selenium fetch failed: {e}")
            raise
    
    def parse_tender_table(self, html_content):
        """Parse the tender opportunities table from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        tenders = []
        
        # Save debug HTML
        with open('public_page_debug.html', 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        logger.info("Saved debug HTML to public_page_debug.html")
        
        # Multiple strategies to find tender data
        
        # Strategy 1: Look for tables
        tables = soup.find_all('table')
        logger.info(f"Found {len(tables)} tables on the page")
        
        for i, table in enumerate(tables):
            rows = table.find_all('tr')
            if len(rows) < 2:  # Skip empty tables
                continue
                
            logger.info(f"Processing table {i+1} with {len(rows)} rows")
            
            # Try to identify headers
            headers = []
            thead = table.find('thead')
            if thead:
                header_cells = thead.find_all(['th', 'td'])
                headers = [cell.get_text(strip=True) for cell in header_cells]
            else:
                # Check if first row looks like headers
                first_row = table.find('tr')
                if first_row:
                    cells = first_row.find_all(['th', 'td'])
                    potential_headers = [cell.get_text(strip=True) for cell in cells]
                    # Check if it contains header-like words
                    header_keywords = ['title', 'number', 'date', 'organization', 'tender', 'opportunity', 'closing', 'reference', 'description']
                    if any(any(keyword in header.lower() for keyword in header_keywords) for header in potential_headers):
                        headers = potential_headers
            
            if not headers:
                # Generate generic headers based on column count
                max_cols = max(len(row.find_all(['td', 'th'])) for row in rows) if rows else 0
                headers = [f"Column_{j+1}" for j in range(max_cols)]
            
            logger.info(f"Table {i+1} headers: {headers}")
            
            # Extract data rows
            data_rows = rows
            if thead or (headers and len(headers) > 0):
                # Skip header row if we identified one
                first_row_cells = table.find('tr').find_all(['th', 'td']) if table.find('tr') else []
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
                    
                    # Extract text content
                    text = cell.get_text(strip=True)
                    tender_data[header] = text
                    
                    # Extract links
                    links = cell.find_all('a', href=True)
                    if links:
                        link_data = []
                        for link in links:
                            href = link.get('href')
                            if href and not href.startswith('javascript:'):
                                # Make absolute URLs
                                if href.startswith('/'):
                                    href = self.base_url + href
                                elif not href.startswith('http'):
                                    href = self.base_url + '/' + href
                                
                                link_data.append({
                                    'text': link.get_text(strip=True),
                                    'url': href
                                })
                        
                        if link_data:
                            tender_data[f"{header}_links"] = link_data
                    
                    # Extract any data attributes
                    for attr in cell.attrs:
                        if attr.startswith('data-'):
                            tender_data[f"{header}_{attr}"] = cell.attrs[attr]
                
                # Only add rows with meaningful data
                if any(value and str(value).strip() for value in tender_data.values() if isinstance(value, str)):
                    tender_data['scraped_at'] = datetime.now().isoformat()
                    tender_data['source_url'] = self.public_url
                    tender_data['table_index'] = i
                    tender_data['row_index'] = row_idx
                    tenders.append(tender_data)
        
        # Strategy 2: Look for div-based layouts (if no tables found)
        if not tenders:
            logger.info("No table data found, looking for div-based layouts...")
            
            # Look for common tender container patterns
            tender_containers = soup.find_all('div', {'class': lambda x: x and any(
                keyword in ' '.join(x).lower() for keyword in 
                ['tender', 'opportunity', 'bid', 'procurement', 'listing', 'item', 'row']
            )})
            
            logger.info(f"Found {len(tender_containers)} potential tender containers")
            
            for i, container in enumerate(tender_containers):
                # Extract text and links from each container
                text_content = container.get_text(strip=True)
                if len(text_content) > 20:  # Skip very short content
                    tender_data = {
                        'content': text_content,
                        'scraped_at': datetime.now().isoformat(),
                        'source_url': self.public_url,
                        'container_index': i
                    }
                    
                    # Extract links
                    links = container.find_all('a', href=True)
                    if links:
                        link_data = []
                        for link in links:
                            href = link.get('href')
                            if href and not href.startswith('javascript:'):
                                if href.startswith('/'):
                                    href = self.base_url + href
                                elif not href.startswith('http'):
                                    href = self.base_url + '/' + href
                                
                                link_data.append({
                                    'text': link.get_text(strip=True),
                                    'url': href
                                })
                        
                        if link_data:
                            tender_data['links'] = link_data
                    
                    tenders.append(tender_data)
        
        logger.info(f"Total extracted: {len(tenders)} tender records")
        return tenders
    
    def scrape_tenders(self):
        """Main scraping function"""
        html_content = None
        
        # Try requests first (faster)
        try:
            html_content = self.fetch_with_requests()
            logger.info("Successfully fetched page with requests")
        except Exception as e:
            logger.warning(f"Requests failed: {e}")
        
        # If requests failed or we're forced to use Selenium
        if not html_content or self.use_selenium:
            if self.setup_selenium():
                try:
                    html_content = self.fetch_with_selenium()
                    logger.info("Successfully fetched page with Selenium")
                except Exception as e:
                    logger.error(f"Selenium also failed: {e}")
                    if not html_content:
                        raise
                finally:
                    if self.driver:
                        self.driver.quit()
        
        if not html_content:
            raise Exception("Failed to fetch page content")
        
        # Parse the content
        tenders = self.parse_tender_table(html_content)
        return tenders
    
    def save_data(self, tenders, output_dir="data"):
        """Save scraped data in multiple formats"""
        if not tenders:
            logger.warning("No data to save")
            return []
        
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_files = []
        
        # Save as JSON
        json_file = os.path.join(output_dir, f"ontario_tenders_public_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        saved_files.append(json_file)
        logger.info(f"Saved JSON: {json_file}")
        
        # Save as CSV
        try:
            df = pd.DataFrame(tenders)
            csv_file = os.path.join(output_dir, f"ontario_tenders_public_{timestamp}.csv")
            df.to_csv(csv_file, index=False, encoding='utf-8')
            saved_files.append(csv_file)
            logger.info(f"Saved CSV: {csv_file}")
        except Exception as e:
            logger.error(f"Failed to save CSV: {e}")
        
        # Save summary
        summary_file = os.path.join(output_dir, f"scrape_summary_public_{timestamp}.txt")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"Ontario Tenders Public Scrape Summary\n")
            f.write(f"=" * 45 + "\n")
            f.write(f"Scraped at: {datetime.now()}\n")
            f.write(f"Total records: {len(tenders)}\n")
            f.write(f"Source URL: {self.public_url}\n")
            f.write(f"Method: {'Selenium' if self.use_selenium else 'Requests'}\n")
            
            if tenders:
                f.write(f"\nColumns found:\n")
                all_keys = set()
                for tender in tenders:
                    all_keys.update(tender.keys())
                for key in sorted(all_keys):
                    f.write(f"  - {key}\n")
                
                f.write(f"\nSample record:\n")
                for key, value in list(tenders[0].items())[:10]:
                    f.write(f"  {key}: {str(value)[:100]}{'...' if len(str(value)) > 100 else ''}\n")
        
        saved_files.append(summary_file)
        logger.info(f"Saved summary: {summary_file}")
        
        return saved_files

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape Ontario Tenders (Public Access)')
    parser.add_argument('--selenium', action='store_true', help='Force use of Selenium')
    parser.add_argument('--output', default='data', help='Output directory')
    args = parser.parse_args()
    
    scraper = OntarioPublicTendersScraper(use_selenium=args.selenium)
    
    try:
        logger.info("Starting Ontario Tenders public scraping...")
        print("Ontario Tenders Public Scraper")
        print("=" * 35)
        print(f"Target URL: {scraper.public_url}")
        print(f"Method: {'Selenium' if args.selenium else 'Requests (with Selenium fallback)'}")
        print()
        
        tenders = scraper.scrape_tenders()
        
        if tenders:
            saved_files = scraper.save_data(tenders, args.output)
            logger.info(f"Successfully scraped {len(tenders)} tender opportunities")
            
            print(f"✅ Scraping completed successfully!")
            print(f"📊 Records found: {len(tenders)}")
            print(f"📁 Files saved to: {args.output}/")
            print(f"📋 Files created:")
            for file in saved_files:
                print(f"  - {file}")
            
            if tenders:
                print(f"\n📝 Sample data (first record):")
                sample = tenders[0]
                for key, value in list(sample.items())[:8]:
                    display_value = str(value)[:80] + "..." if len(str(value)) > 80 else str(value)
                    print(f"  {key}: {display_value}")
                
                if len(sample) > 8:
                    print(f"  ... and {len(sample) - 8} more fields")
        else:
            logger.warning("No tender data was scraped")
            print("❌ No data was found.")
            print("💡 Check the debug file 'public_page_debug.html' to see what was retrieved")
            print("💡 The page might be using complex JavaScript or a different structure")
            
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        print(f"❌ Scraping failed: {e}")
        print("💡 Try using the --selenium flag for JavaScript-heavy pages")
        raise

if __name__ == "__main__":
    main()

