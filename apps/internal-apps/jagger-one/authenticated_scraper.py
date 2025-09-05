#!/usr/bin/env python3
"""
Authenticated Ontario Tenders Scraper
Handles login and session management for the Ontario Tenders portal
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
import getpass

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AuthenticatedOntarioTendersScraper:
    def __init__(self, use_selenium=True):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.login_url = "https://ontariotenders.app.jaggaer.com/esop/login"
        self.target_url = "https://ontariotenders.app.jaggaer.com/esop/toolkit/opportunity/global/list.si?resetstored=true"
        self.use_selenium = use_selenium
        self.driver = None
        self.session = requests.Session()
        
        # Set up session headers
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
            # Don't use headless mode for authentication - user needs to see login
            # chrome_options.add_argument('--headless')
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
    
    def manual_login_selenium(self):
        """Handle manual login using Selenium"""
        try:
            logger.info("Opening login page...")
            self.driver.get(self.login_url)
            
            print("\n" + "="*60)
            print("MANUAL LOGIN REQUIRED")
            print("="*60)
            print("A browser window has opened with the Ontario Tenders login page.")
            print("Please:")
            print("1. Log in with your credentials")
            print("2. Navigate to the tenders list page if not redirected automatically")
            print("3. Press Enter here when you're logged in and on the tenders page")
            print("="*60)
            
            input("Press Enter when you have completed the login process...")
            
            # Check if we're on the right page
            current_url = self.driver.current_url
            logger.info(f"Current URL after login: {current_url}")
            
            if "login" in current_url.lower():
                print("It looks like you're still on the login page.")
                print("Please complete the login process and try again.")
                return False
            
            # Try to navigate to the target page if not already there
            if "list.si" not in current_url:
                logger.info("Navigating to tenders list page...")
                self.driver.get(self.target_url)
                time.sleep(3)
            
            return True
            
        except Exception as e:
            logger.error(f"Manual login failed: {e}")
            return False
    
    def auto_login_selenium(self, username, password):
        """Attempt automatic login using Selenium"""
        try:
            logger.info("Attempting automatic login...")
            self.driver.get(self.login_url)
            
            # Wait for login form
            wait = WebDriverWait(self.driver, 10)
            
            # Look for username field (try multiple selectors)
            username_selectors = [
                'input[name="username"]',
                'input[name="email"]',
                'input[name="login"]',
                'input[type="email"]',
                'input[id*="username"]',
                'input[id*="email"]',
                'input[id*="login"]'
            ]
            
            username_field = None
            for selector in username_selectors:
                try:
                    username_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    logger.info(f"Found username field with selector: {selector}")
                    break
                except TimeoutException:
                    continue
            
            if not username_field:
                logger.error("Could not find username field")
                return False
            
            # Look for password field
            password_selectors = [
                'input[name="password"]',
                'input[type="password"]',
                'input[id*="password"]'
            ]
            
            password_field = None
            for selector in password_selectors:
                try:
                    password_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                    logger.info(f"Found password field with selector: {selector}")
                    break
                except:
                    continue
            
            if not password_field:
                logger.error("Could not find password field")
                return False
            
            # Fill in credentials
            username_field.clear()
            username_field.send_keys(username)
            password_field.clear()
            password_field.send_keys(password)
            
            # Look for submit button
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button[id*="login"]',
                'button[id*="submit"]',
                'input[value*="Login"]',
                'input[value*="Sign"]'
            ]
            
            submit_button = None
            for selector in submit_selectors:
                try:
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    logger.info(f"Found submit button with selector: {selector}")
                    break
                except:
                    continue
            
            if not submit_button:
                logger.error("Could not find submit button")
                return False
            
            # Submit the form
            submit_button.click()
            
            # Wait for redirect
            time.sleep(5)
            
            current_url = self.driver.current_url
            if "login" not in current_url.lower():
                logger.info("Login appears successful")
                return True
            else:
                logger.error("Login failed - still on login page")
                return False
                
        except Exception as e:
            logger.error(f"Automatic login failed: {e}")
            return False
    
    def parse_tender_table(self, html_content):
        """Parse the tender opportunities table from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        tenders = []
        
        # Save the full HTML for debugging
        with open('full_page_debug.html', 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        logger.info("Saved full page HTML to full_page_debug.html")
        
        # Look for tables with various strategies
        tables = soup.find_all('table')
        logger.info(f"Found {len(tables)} tables on the page")
        
        if not tables:
            # Look for other data structures
            logger.info("No tables found, looking for other data structures...")
            
            # Look for divs that might contain tender data
            tender_containers = soup.find_all('div', {'class': lambda x: x and any(word in x.lower() for word in ['tender', 'opportunity', 'list', 'row', 'item'])})
            logger.info(f"Found {len(tender_containers)} potential tender containers")
            
            # Look for any structured data
            rows = soup.find_all(['tr', 'div'], {'class': lambda x: x and 'row' in x.lower()})
            logger.info(f"Found {len(rows)} potential data rows")
            
            return tenders
        
        # Process each table
        for i, table in enumerate(tables):
            logger.info(f"Processing table {i+1}...")
            
            # Get table info
            rows = table.find_all('tr')
            if len(rows) < 2:  # Skip tables with no data rows
                continue
                
            logger.info(f"Table {i+1} has {len(rows)} rows")
            
            # Extract headers
            headers = []
            header_row = table.find('thead')
            if header_row:
                headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
            else:
                # Try first row
                first_row = table.find('tr')
                if first_row:
                    potential_headers = [cell.get_text(strip=True) for cell in first_row.find_all(['th', 'td'])]
                    # Check if this looks like headers
                    if any(word in ' '.join(potential_headers).lower() for word in ['title', 'number', 'date', 'organization', 'tender', 'opportunity']):
                        headers = potential_headers
            
            if not headers:
                # Generate generic headers
                max_cols = max(len(row.find_all(['td', 'th'])) for row in rows) if rows else 0
                headers = [f"Column_{j+1}" for j in range(max_cols)]
            
            logger.info(f"Table {i+1} headers: {headers}")
            
            # Extract data rows
            data_rows = rows
            if header_row or (headers and table.find('tr')):
                # Skip header row if we identified one
                if header_row or (headers and [cell.get_text(strip=True) for cell in table.find('tr').find_all(['th', 'td'])] == headers):
                    data_rows = rows[1:]
            
            table_tenders = []
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
                
                # Only add rows with meaningful data
                if any(value and str(value).strip() for value in tender_data.values() if isinstance(value, str)):
                    tender_data['scraped_at'] = datetime.now().isoformat()
                    tender_data['table_index'] = i
                    tender_data['row_index'] = row_idx
                    table_tenders.append(tender_data)
            
            if table_tenders:
                logger.info(f"Extracted {len(table_tenders)} records from table {i+1}")
                tenders.extend(table_tenders)
        
        logger.info(f"Total extracted: {len(tenders)} tender records")
        return tenders
    
    def scrape_with_authentication(self, username=None, password=None, manual_login=True):
        """Main scraping function with authentication"""
        if not self.setup_selenium():
            raise Exception("Failed to set up Selenium WebDriver")
        
        try:
            # Handle login
            if manual_login:
                if not self.manual_login_selenium():
                    raise Exception("Manual login failed")
            else:
                if not username or not password:
                    username = input("Username: ")
                    password = getpass.getpass("Password: ")
                
                if not self.auto_login_selenium(username, password):
                    print("Automatic login failed. Trying manual login...")
                    if not self.manual_login_selenium():
                        raise Exception("Both automatic and manual login failed")
            
            # Navigate to target page if needed
            current_url = self.driver.current_url
            if self.target_url not in current_url:
                logger.info("Navigating to tenders list page...")
                self.driver.get(self.target_url)
                time.sleep(5)
            
            # Wait for content to load
            logger.info("Waiting for page content to load...")
            time.sleep(10)  # Give extra time for dynamic content
            
            # Get page source
            html_content = self.driver.page_source
            logger.info(f"Retrieved page content ({len(html_content)} characters)")
            
            # Parse the content
            tenders = self.parse_tender_table(html_content)
            return tenders
            
        except Exception as e:
            logger.error(f"Scraping with authentication failed: {e}")
            raise
        finally:
            if self.driver:
                input("Press Enter to close the browser and finish scraping...")
                self.driver.quit()
    
    def save_data(self, tenders, output_dir="data"):
        """Save scraped data in multiple formats"""
        if not tenders:
            logger.warning("No data to save")
            return []
        
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_files = []
        
        # Save as JSON
        json_file = os.path.join(output_dir, f"ontario_tenders_authenticated_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        saved_files.append(json_file)
        logger.info(f"Saved JSON: {json_file}")
        
        # Save as CSV
        try:
            df = pd.DataFrame(tenders)
            csv_file = os.path.join(output_dir, f"ontario_tenders_authenticated_{timestamp}.csv")
            df.to_csv(csv_file, index=False, encoding='utf-8')
            saved_files.append(csv_file)
            logger.info(f"Saved CSV: {csv_file}")
        except Exception as e:
            logger.error(f"Failed to save CSV: {e}")
        
        # Save summary
        summary_file = os.path.join(output_dir, f"scrape_summary_authenticated_{timestamp}.txt")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"Ontario Tenders Authenticated Scrape Summary\n")
            f.write(f"=" * 50 + "\n")
            f.write(f"Scraped at: {datetime.now()}\n")
            f.write(f"Total records: {len(tenders)}\n")
            f.write(f"Source URL: {self.target_url}\n")
            f.write(f"Authentication: Required\n")
            
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

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape Ontario Tenders with Authentication')
    parser.add_argument('--auto-login', action='store_true', help='Attempt automatic login (requires username/password)')
    parser.add_argument('--username', help='Username for automatic login')
    parser.add_argument('--password', help='Password for automatic login')
    parser.add_argument('--output', default='data', help='Output directory')
    args = parser.parse_args()
    
    scraper = AuthenticatedOntarioTendersScraper()
    
    try:
        logger.info("Starting authenticated Ontario Tenders scraping...")
        
        if args.auto_login:
            tenders = scraper.scrape_with_authentication(
                username=args.username,
                password=args.password,
                manual_login=False
            )
        else:
            tenders = scraper.scrape_with_authentication(manual_login=True)
        
        if tenders:
            saved_files = scraper.save_data(tenders, args.output)
            logger.info(f"Successfully scraped {len(tenders)} tender opportunities")
            
            print(f"\n✅ Scraping completed successfully!")
            print(f"📊 Records found: {len(tenders)}")
            print(f"📁 Files saved to: {args.output}/")
            print(f"📋 Files created: {saved_files}")
            
            if tenders:
                print(f"\n📝 Sample data:")
                for key, value in list(tenders[0].items())[:5]:
                    print(f"  {key}: {value}")
        else:
            logger.warning("No tender data was scraped")
            print("❌ No data was found. Check the debug files for more information.")
            
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        print(f"❌ Scraping failed: {e}")
        raise

if __name__ == "__main__":
    main()
