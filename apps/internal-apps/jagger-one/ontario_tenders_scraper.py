#!/usr/bin/env python3
"""
Ontario Tenders Scraper
Scrapes tender opportunities from Ontario Tenders website
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

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OntarioTendersScraper:
    def __init__(self):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.target_url = "https://ontariotenders.app.jaggaer.com/esop/toolkit/opportunity/global/list.si?resetstored=true"
        self.session = requests.Session()
        
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def fetch_page(self, url, max_retries=3):
        """Fetch a page with retry logic"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching page (attempt {attempt + 1}): {url}")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return response
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
    
    def parse_tender_table(self, soup):
        """Parse the tender opportunities table"""
        tenders = []
        
        # Look for the main table containing tender data
        # The structure may vary, so we'll try multiple selectors
        table_selectors = [
            'table.dataTable',
            'table[id*="opportunity"]',
            'table[class*="list"]',
            'table tbody tr',
            '.opportunity-list table',
            '#opportunityList table'
        ]
        
        table = None
        for selector in table_selectors:
            table = soup.select_one(selector)
            if table:
                logger.info(f"Found table with selector: {selector}")
                break
        
        if not table:
            # If no table found, look for any table
            tables = soup.find_all('table')
            if tables:
                # Use the largest table (most likely to contain the data)
                table = max(tables, key=lambda t: len(t.find_all('tr')))
                logger.info(f"Using largest table with {len(table.find_all('tr'))} rows")
            else:
                logger.error("No tables found on the page")
                return tenders
        
        # Extract table headers
        headers = []
        header_row = table.find('thead')
        if header_row:
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
        else:
            # If no thead, try first row
            first_row = table.find('tr')
            if first_row:
                headers = [th.get_text(strip=True) for th in first_row.find_all(['th', 'td'])]
        
        logger.info(f"Found headers: {headers}")
        
        # Extract table rows
        rows = table.find_all('tr')
        if header_row:
            rows = rows[1:]  # Skip header row if it exists
        elif headers:
            rows = rows[1:]  # Skip first row if we used it for headers
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= len(headers):
                tender_data = {}
                
                for i, cell in enumerate(cells[:len(headers)]):
                    header = headers[i] if i < len(headers) else f"Column_{i+1}"
                    
                    # Extract text content
                    text = cell.get_text(strip=True)
                    
                    # Look for links
                    links = cell.find_all('a')
                    if links:
                        link_data = []
                        for link in links:
                            href = link.get('href')
                            if href and not href.startswith('javascript:'):
                                if href.startswith('/'):
                                    href = self.base_url + href
                                link_data.append({
                                    'text': link.get_text(strip=True),
                                    'url': href
                                })
                        if link_data:
                            tender_data[f"{header}_links"] = link_data
                    
                    tender_data[header] = text
                
                if any(tender_data.values()):  # Only add if row has data
                    tender_data['scraped_at'] = datetime.now().isoformat()
                    tenders.append(tender_data)
        
        logger.info(f"Extracted {len(tenders)} tender opportunities")
        return tenders
    
    def scrape_tenders(self):
        """Main scraping function"""
        try:
            # Fetch the main page
            response = self.fetch_page(self.target_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Parse the tender table
            tenders = self.parse_tender_table(soup)
            
            if not tenders:
                logger.warning("No tender data found. Saving page HTML for debugging.")
                with open('debug_page.html', 'w', encoding='utf-8') as f:
                    f.write(soup.prettify())
                
                # Try to find any tables for debugging
                all_tables = soup.find_all('table')
                logger.info(f"Found {len(all_tables)} tables on the page")
                for i, table in enumerate(all_tables):
                    rows = len(table.find_all('tr'))
                    logger.info(f"Table {i+1}: {rows} rows")
            
            return tenders
            
        except Exception as e:
            logger.error(f"Error scraping tenders: {e}")
            raise
    
    def save_data(self, tenders, output_dir="data"):
        """Save scraped data in multiple formats"""
        if not tenders:
            logger.warning("No data to save")
            return
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save as JSON
        json_file = os.path.join(output_dir, f"ontario_tenders_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved JSON data to: {json_file}")
        
        # Save as CSV
        if tenders:
            csv_file = os.path.join(output_dir, f"ontario_tenders_{timestamp}.csv")
            df = pd.DataFrame(tenders)
            df.to_csv(csv_file, index=False, encoding='utf-8')
            logger.info(f"Saved CSV data to: {csv_file}")
            
            # Save summary
            summary_file = os.path.join(output_dir, f"ontario_tenders_summary_{timestamp}.txt")
            with open(summary_file, 'w', encoding='utf-8') as f:
                f.write(f"Ontario Tenders Scrape Summary\n")
                f.write(f"Scraped at: {datetime.now()}\n")
                f.write(f"Total records: {len(tenders)}\n")
                f.write(f"Columns: {list(tenders[0].keys()) if tenders else 'None'}\n")
            logger.info(f"Saved summary to: {summary_file}")
        
        return json_file, csv_file if tenders else None

def main():
    """Main execution function"""
    scraper = OntarioTendersScraper()
    
    try:
        logger.info("Starting Ontario Tenders scraping...")
        tenders = scraper.scrape_tenders()
        
        if tenders:
            json_file, csv_file = scraper.save_data(tenders)
            logger.info(f"Successfully scraped {len(tenders)} tender opportunities")
            
            # Print sample data
            if tenders:
                logger.info("Sample tender data:")
                for key, value in list(tenders[0].items())[:5]:
                    logger.info(f"  {key}: {value}")
        else:
            logger.warning("No tender data was scraped")
            
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        raise

if __name__ == "__main__":
    main()
