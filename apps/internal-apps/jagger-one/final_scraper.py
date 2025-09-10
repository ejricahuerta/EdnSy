#!/usr/bin/env python3
"""
Final Ontario Tenders Scraper
Uses Selenium to handle JavaScript and find the actual tender data
"""

import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import pandas as pd
import os

class FinalOntarioTendersScraper:
    def __init__(self):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.driver = None
        
    def setup_selenium(self):
        """Set up Selenium WebDriver"""
        try:
            chrome_options = Options()
            # Don't use headless so we can see what's happening
            # chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Browser initialized successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize browser: {e}")
            return False
    
    def navigate_to_tenders(self):
        """Navigate to the tender opportunities page"""
        try:
            print(f"🌐 Opening: {self.base_url}")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            current_url = self.driver.current_url
            print(f"📍 Current URL: {current_url}")
            
            # Look for navigation elements or links to tender opportunities
            print("🔍 Looking for tender-related links...")
            
            # Common selectors for tender/opportunity links
            selectors_to_try = [
                "a[href*='opportunity']",
                "a[href*='tender']",
                "a[href*='bid']",
                "a[href*='procurement']",
                "a[href*='current']",
                "a[href*='list']",
                "a[href*='search']",
                "a:contains('Opportunities')",
                "a:contains('Tenders')",
                "a:contains('Current')",
                "a:contains('Search')",
                "a:contains('Browse')"
            ]
            
            found_links = []
            for selector in selectors_to_try:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        try:
                            href = element.get_attribute('href')
                            text = element.text.strip()
                            if href and text:
                                found_links.append({'text': text, 'href': href, 'selector': selector})
                        except:
                            continue
                except:
                    continue
            
            if found_links:
                print(f"🎯 Found {len(found_links)} potential links:")
                for i, link in enumerate(found_links[:10]):  # Show first 10
                    print(f"   {i+1}. {link['text']} -> {link['href']}")
                
                # Try the most promising link
                best_link = None
                for link in found_links:
                    if any(keyword in link['text'].lower() for keyword in ['opportunity', 'tender', 'current', 'search']):
                        best_link = link
                        break
                
                if not best_link and found_links:
                    best_link = found_links[0]
                
                if best_link:
                    print(f"🚀 Trying: {best_link['text']} -> {best_link['href']}")
                    self.driver.get(best_link['href'])
                    time.sleep(3)
                    
                    return self.driver.current_url
            
            # If no links found, try manual navigation
            print("🔍 No direct links found, looking for navigation menus...")
            
            # Look for menu items, buttons, etc.
            nav_selectors = [
                "nav a",
                ".menu a",
                ".navigation a",
                "button",
                "[role='button']",
                ".btn"
            ]
            
            for selector in nav_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        try:
                            text = element.text.strip().lower()
                            if any(keyword in text for keyword in ['opportunity', 'tender', 'search', 'browse', 'current']):
                                print(f"🎯 Found navigation element: {element.text}")
                                element.click()
                                time.sleep(3)
                                return self.driver.current_url
                        except:
                            continue
                except:
                    continue
            
            return current_url
            
        except Exception as e:
            print(f"❌ Navigation failed: {e}")
            return None
    
    def extract_tender_data(self):
        """Extract tender data from the current page"""
        try:
            print("📊 Extracting tender data...")
            
            # Wait for content to load
            time.sleep(5)
            
            # Get page source
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Save debug file
            debug_file = f"final_scraper_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            with open(debug_file, 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            print(f"💾 Saved debug HTML to: {debug_file}")
            
            tenders = []
            
            # Strategy 1: Look for tables
            tables = soup.find_all('table')
            print(f"📋 Found {len(tables)} tables")
            
            for i, table in enumerate(tables):
                rows = table.find_all('tr')
                if len(rows) < 2:
                    continue
                
                print(f"   Table {i+1}: {len(rows)} rows")
                
                # Try to extract data from this table
                table_data = self.extract_table_data(table, i)
                if table_data:
                    tenders.extend(table_data)
                    print(f"   ✅ Extracted {len(table_data)} records from table {i+1}")
            
            # Strategy 2: Look for list items or divs
            if not tenders:
                print("🔍 No table data found, looking for other structures...")
                
                # Look for common container patterns
                containers = soup.find_all(['div', 'li'], class_=lambda x: x and any(
                    keyword in x.lower() for keyword in ['item', 'row', 'tender', 'opportunity', 'listing']
                ))
                
                print(f"📦 Found {len(containers)} potential containers")
                
                for i, container in enumerate(containers[:20]):  # Limit to first 20
                    text = container.get_text(strip=True)
                    if len(text) > 50:  # Only meaningful content
                        tender_data = {
                            'content': text,
                            'container_index': i,
                            'scraped_at': datetime.now().isoformat(),
                            'source_url': self.driver.current_url
                        }
                        
                        # Look for links in this container
                        links = container.find_all('a', href=True)
                        if links:
                            tender_data['links'] = [
                                {'text': link.get_text(strip=True), 'url': link.get('href')}
                                for link in links
                            ]
                        
                        tenders.append(tender_data)
            
            # Strategy 3: Look for any structured data
            if not tenders:
                print("🔍 Looking for any structured content...")
                
                # Find all elements with meaningful text
                all_elements = soup.find_all(['p', 'div', 'span', 'td', 'li'])
                meaningful_content = []
                
                for element in all_elements:
                    text = element.get_text(strip=True)
                    if len(text) > 30 and any(keyword in text.lower() for keyword in 
                                           ['tender', 'opportunity', 'bid', 'rfp', 'rfq', 'procurement']):
                        meaningful_content.append({
                            'text': text,
                            'tag': element.name,
                            'class': element.get('class', [])
                        })
                
                if meaningful_content:
                    print(f"📝 Found {len(meaningful_content)} elements with tender-related content")
                    for i, content in enumerate(meaningful_content[:10]):
                        tenders.append({
                            'content': content['text'],
                            'element_type': content['tag'],
                            'element_class': content['class'],
                            'content_index': i,
                            'scraped_at': datetime.now().isoformat(),
                            'source_url': self.driver.current_url
                        })
            
            return tenders
            
        except Exception as e:
            print(f"❌ Data extraction failed: {e}")
            return []
    
    def extract_table_data(self, table, table_index):
        """Extract data from a specific table"""
        try:
            rows = table.find_all('tr')
            if len(rows) < 2:
                return []
            
            # Try to identify headers
            headers = []
            first_row = rows[0]
            cells = first_row.find_all(['th', 'td'])
            
            # Check if first row looks like headers
            potential_headers = [cell.get_text(strip=True) for cell in cells]
            if any(keyword in ' '.join(potential_headers).lower() for keyword in 
                   ['title', 'number', 'date', 'organization', 'tender', 'opportunity']):
                headers = potential_headers
                data_rows = rows[1:]
            else:
                # Generate generic headers
                headers = [f"Column_{i+1}" for i in range(len(cells))]
                data_rows = rows
            
            table_data = []
            for row_idx, row in enumerate(data_rows):
                cells = row.find_all(['td', 'th'])
                if not cells:
                    continue
                
                row_data = {}
                for i, cell in enumerate(cells):
                    header = headers[i] if i < len(headers) else f"Column_{i+1}"
                    text = cell.get_text(strip=True)
                    row_data[header] = text
                    
                    # Extract links
                    links = cell.find_all('a', href=True)
                    if links:
                        row_data[f"{header}_links"] = [
                            {'text': link.get_text(strip=True), 'url': link.get('href')}
                            for link in links
                        ]
                
                if any(value for value in row_data.values() if isinstance(value, str) and value.strip()):
                    row_data['table_index'] = table_index
                    row_data['row_index'] = row_idx
                    row_data['scraped_at'] = datetime.now().isoformat()
                    row_data['source_url'] = self.driver.current_url
                    table_data.append(row_data)
            
            return table_data
            
        except Exception as e:
            print(f"❌ Table extraction failed: {e}")
            return []
    
    def save_data(self, tenders, output_dir="data"):
        """Save the extracted data"""
        if not tenders:
            print("❌ No data to save")
            return []
        
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_files = []
        
        # Save as JSON
        json_file = os.path.join(output_dir, f"ontario_tenders_final_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        saved_files.append(json_file)
        print(f"💾 Saved JSON: {json_file}")
        
        # Save as CSV
        try:
            df = pd.DataFrame(tenders)
            csv_file = os.path.join(output_dir, f"ontario_tenders_final_{timestamp}.csv")
            df.to_csv(csv_file, index=False, encoding='utf-8')
            saved_files.append(csv_file)
            print(f"💾 Saved CSV: {csv_file}")
        except Exception as e:
            print(f"⚠️  Could not save CSV: {e}")
        
        return saved_files
    
    def run(self):
        """Main execution method"""
        try:
            print("Ontario Tenders Final Scraper")
            print("=" * 35)
            
            if not self.setup_selenium():
                return False
            
            # Navigate to tender page
            tender_url = self.navigate_to_tenders()
            if not tender_url:
                print("❌ Could not navigate to tender page")
                return False
            
            print(f"📍 Final URL: {tender_url}")
            
            # Extract data
            tenders = self.extract_tender_data()
            
            if tenders:
                print(f"✅ Found {len(tenders)} tender records")
                
                # Save data
                saved_files = self.save_data(tenders)
                
                print(f"\n🎉 SUCCESS!")
                print(f"📊 Records extracted: {len(tenders)}")
                print(f"📁 Files saved: {saved_files}")
                
                # Show sample data
                if tenders:
                    print(f"\n📝 Sample record:")
                    sample = tenders[0]
                    for key, value in list(sample.items())[:5]:
                        display_value = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
                        print(f"   {key}: {display_value}")
                
                return True
            else:
                print("❌ No tender data found")
                print("💡 Check the debug HTML file to see what was captured")
                return False
                
        except Exception as e:
            print(f"❌ Scraping failed: {e}")
            return False
        finally:
            if self.driver:
                input("\nPress Enter to close the browser...")
                self.driver.quit()

def main():
    scraper = FinalOntarioTendersScraper()
    success = scraper.run()
    
    if success:
        print("\n✅ Scraping completed successfully!")
    else:
        print("\n❌ Scraping failed. Check the debug files for more information.")

if __name__ == "__main__":
    main()

