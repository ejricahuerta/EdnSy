#!/usr/bin/env python3
"""
Advanced Ontario Tenders Scraper with Selenium fallback
Handles both static and JavaScript-rendered content
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
from selenium.common.exceptions import TimeoutException, WebDriverException

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AdvancedOntarioTendersScraper:
    def __init__(self, use_selenium=False):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.target_url = "https://ontariotenders.app.jaggaer.com/esop/toolkit/opportunity/global/list.si?resetstored=true"
        self.use_selenium = use_selenium
        self.driver = None
        
        # Set up requests session
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
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
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            logger.info("Selenium WebDriver initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Selenium: {e}")
            return False
    
    def fetch_with_requests(self, url, max_retries=3):
        """Fetch page using requests"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching with requests (attempt {attempt + 1}): {url}")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                logger.warning(f"Requests attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
    
    def fetch_with_selenium(self, url, wait_time=10):
        """Fetch page using Selenium"""
        try:
            logger.info(f"Fetching with Selenium: {url}")
            self.driver.get(url)
            
            # Wait for the page to load
            WebDriverWait(self.driver, wait_time).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Wait a bit more for dynamic content
            time.sleep(3)
            
            # Try to wait for specific elements that might indicate the table is loaded
            try:
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "table"))
                )
            except TimeoutException:
                logger.warning("No table found within timeout, proceeding anyway")
            
            return self.driver.page_source
        except Exception as e:
            logger.error(f"Selenium fetch failed: {e}")
            raise
    
    def parse_tender_table(self, html_content):
        """Parse the tender opportunities table from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        tenders = []
        
        # Multiple strategies to find the tender table
        table_strategies = [
            # Strategy 1: Look for common table classes/IDs
            lambda s: s.find('table', {'class': lambda x: x and 'dataTable' in x}) if s.find('table', {'class': lambda x: x and 'dataTable' in x}) else None,
            lambda s: s.find('table', {'id': lambda x: x and 'opportunity' in x.lower()}) if s.find('table', {'id': lambda x: x and 'opportunity' in x.lower()}) else None,
            lambda s: s.find('table', {'class': lambda x: x and 'list' in x}) if s.find('table', {'class': lambda x: x and 'list' in x}) else None,
            
            # Strategy 2: Look for tables with specific content
            lambda s: next((table for table in s.find_all('table') if 'tender' in table.get_text().lower() or 'opportunity' in table.get_text().lower()), None),
            
            # Strategy 3: Find the largest table
            lambda s: max(s.find_all('table'), key=lambda t: len(t.find_all('tr'))) if s.find_all('table') else None,
        ]
        
        table = None
        for i, strategy in enumerate(table_strategies):
            try:
                table = strategy(soup)
                if table:
                    logger.info(f"Found table using strategy {i+1}")
                    break
            except Exception as e:
                logger.debug(f"Strategy {i+1} failed: {e}")
                continue
        
        if not table:
            logger.error("No suitable table found")
            # Save debug HTML
            with open('debug_page.html', 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            logger.info("Saved debug HTML to debug_page.html")
            return tenders
        
        # Extract headers
        headers = []
        thead = table.find('thead')
        if thead:
            header_cells = thead.find_all(['th', 'td'])
            headers = [cell.get_text(strip=True) for cell in header_cells]
        else:
            # Try first row
            first_row = table.find('tr')
            if first_row:
                header_cells = first_row.find_all(['th', 'td'])
                if header_cells and any('title' in cell.get_text().lower() or 'number' in cell.get_text().lower() for cell in header_cells):
                    headers = [cell.get_text(strip=True) for cell in header_cells]
        
        if not headers:
            # Generate generic headers
            max_cols = max(len(row.find_all(['td', 'th'])) for row in table.find_all('tr')) if table.find_all('tr') else 0
            headers = [f"Column_{i+1}" for i in range(max_cols)]
        
        logger.info(f"Using headers: {headers}")
        
        # Extract data rows
        rows = table.find_all('tr')
        if thead:
            rows = [row for row in rows if row.parent.name != 'thead']
        elif headers and table.find('tr'):
            # Skip first row if we used it for headers
            first_row = table.find('tr')
            if first_row and [cell.get_text(strip=True) for cell in first_row.find_all(['th', 'td'])] == headers:
                rows = rows[1:]
        
        for row_idx, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            if not cells:
                continue
                
            tender_data = {}
            
            for i, cell in enumerate(cells):
                header = headers[i] if i < len(headers) else f"Column_{i+1}"
                
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
            if any(value and value.strip() for value in tender_data.values() if isinstance(value, str)):
                tender_data['scraped_at'] = datetime.now().isoformat()
                tender_data['row_index'] = row_idx
                tenders.append(tender_data)
        
        logger.info(f"Extracted {len(tenders)} tender records")
        return tenders
    
    def scrape_tenders(self):
        """Main scraping function with fallback strategy"""
        html_content = None
        
        # Try requests first
        try:
            html_content = self.fetch_with_requests(self.target_url)
            logger.info("Successfully fetched page with requests")
        except Exception as e:
            logger.warning(f"Requests failed: {e}")
            
        # If requests failed or we're forced to use Selenium
        if not html_content or self.use_selenium:
            if self.setup_selenium():
                try:
                    html_content = self.fetch_with_selenium(self.target_url)
                    logger.info("Successfully fetched page with Selenium")
                except Exception as e:
                    logger.error(f"Selenium also failed: {e}")
                    if not html_content:
                        raise
        
        if not html_content:
            raise Exception("Failed to fetch page content with both methods")
        
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
        json_file = os.path.join(output_dir, f"ontario_tenders_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        saved_files.append(json_file)
        logger.info(f"Saved JSON: {json_file}")
        
        # Save as CSV
        try:
            df = pd.DataFrame(tenders)
            csv_file = os.path.join(output_dir, f"ontario_tenders_{timestamp}.csv")
            df.to_csv(csv_file, index=False, encoding='utf-8')
            saved_files.append(csv_file)
            logger.info(f"Saved CSV: {csv_file}")
        except Exception as e:
            logger.error(f"Failed to save CSV: {e}")
        
        # Save summary
        summary_file = os.path.join(output_dir, f"scrape_summary_{timestamp}.txt")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"Ontario Tenders Scrape Summary\n")
            f.write(f"=" * 40 + "\n")
            f.write(f"Scraped at: {datetime.now()}\n")
            f.write(f"Total records: {len(tenders)}\n")
            f.write(f"Source URL: {self.target_url}\n")
            f.write(f"Method used: {'Selenium' if self.use_selenium else 'Requests'}\n")
            
            if tenders:
                f.write(f"\nColumns found:\n")
                for col in tenders[0].keys():
                    f.write(f"  - {col}\n")
                
                f.write(f"\nSample record:\n")
                for key, value in list(tenders[0].items())[:10]:
                    f.write(f"  {key}: {value}\n")
        
        saved_files.append(summary_file)
        logger.info(f"Saved summary: {summary_file}")
        
        return saved_files
    
    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Selenium driver closed")
            except Exception as e:
                logger.warning(f"Error closing driver: {e}")

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape Ontario Tenders')
    parser.add_argument('--selenium', action='store_true', help='Force use of Selenium')
    parser.add_argument('--output', default='data', help='Output directory')
    args = parser.parse_args()
    
    scraper = AdvancedOntarioTendersScraper(use_selenium=args.selenium)
    
    try:
        logger.info("Starting Ontario Tenders scraping...")
        tenders = scraper.scrape_tenders()
        
        if tenders:
            saved_files = scraper.save_data(tenders, args.output)
            logger.info(f"Successfully scraped {len(tenders)} tender opportunities")
            logger.info(f"Files saved: {saved_files}")
            
            # Print sample
            print(f"\nScraping completed successfully!")
            print(f"Records found: {len(tenders)}")
            print(f"Files saved to: {args.output}/")
            
            if tenders:
                print(f"\nSample data:")
                for key, value in list(tenders[0].items())[:5]:
                    print(f"  {key}: {value}")
        else:
            logger.warning("No tender data was scraped")
            print("No data was found. Check the logs for details.")
            
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        print(f"Scraping failed: {e}")
        raise
    finally:
        scraper.cleanup()

if __name__ == "__main__":
    main()
