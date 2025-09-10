#!/usr/bin/env python3
"""
Enhanced Final Ontario Tenders Scraper
Automatically handles language selection and navigates to tender data
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

class EnhancedOntarioTendersScraper:
    def __init__(self):
        self.base_url = "https://ontariotenders.app.jaggaer.com"
        self.driver = None
        
    def setup_selenium(self):
        """Set up Selenium WebDriver"""
        try:
            chrome_options = Options()
            # Use headless mode for faster execution
            chrome_options.add_argument('--headless')
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
        """Navigate through language selection to tender opportunities"""
        try:
            print(f"🌐 Opening: {self.base_url}")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            current_url = self.driver.current_url
            print(f"📍 Current URL: {current_url}")
            
            # Check if we're on the language selection page
            page_source = self.driver.page_source
            if "eTendering" in page_source and ("Français" in page_source or "English" in page_source):
                print("🔍 Language selection page detected")
                
                # Click English link
                try:
                    # Try multiple selectors for the English link
                    english_selectors = [
                        'a[href="web/login.html"]',
                        'a[href*="web/login"]',
                        'a:contains("English")',
                        '#control-en a',
                        'div[lang="en"] a'
                    ]
                    
                    english_clicked = False
                    for selector in english_selectors:
                        try:
                            if selector.startswith('a:contains'):
                                # Use XPath for text-based selection
                                english_element = self.driver.find_element(By.XPATH, "//a[contains(text(), 'English')]")
                            else:
                                english_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                            
                            print(f"🎯 Found English link with selector: {selector}")
                            english_element.click()
                            english_clicked = True
                            break
                        except:
                            continue
                    
                    if not english_clicked:
                        print("⚠️  Could not find English link, trying direct URL")
                        # Construct the English URL directly
                        english_url = self.base_url + "/esop/nac-host/public/web/login.html"
                        self.driver.get(english_url)
                    
                    time.sleep(3)
                    print("✅ Selected English language")
                    
                except Exception as e:
                    print(f"⚠️  Error clicking English: {e}")
                    # Try direct navigation
                    english_url = self.base_url + "/esop/nac-host/public/web/login.html"
                    self.driver.get(english_url)
                    time.sleep(3)
            
            # Now look for tender opportunities
            current_url = self.driver.current_url
            print(f"📍 After language selection: {current_url}")
            
            # Look for links to tender opportunities
            print("🔍 Looking for tender opportunities...")
            
            # Common patterns for tender links
            tender_link_patterns = [
                'a[href*="opportunity"]',
                'a[href*="tender"]',
                'a[href*="current"]',
                'a[href*="list"]',
                'a[href*="search"]',
                'a[href*="browse"]'
            ]
            
            tender_links = []
            for pattern in tender_link_patterns:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, pattern)
                    for element in elements:
                        try:
                            href = element.get_attribute('href')
                            text = element.text.strip()
                            if href and text:
                                tender_links.append({'text': text, 'href': href, 'pattern': pattern})
                        except:
                            continue
                except:
                    continue
            
            if tender_links:
                print(f"🎯 Found {len(tender_links)} potential tender links:")
                for i, link in enumerate(tender_links[:5]):
                    print(f"   {i+1}. {link['text']} -> {link['href']}")
                
                # Try the most promising link
                best_link = None
                for link in tender_links:
                    link_text = link['text'].lower()
                    if any(keyword in link_text for keyword in ['opportunity', 'tender', 'current', 'search', 'browse']):
                        best_link = link
                        break
                
                if not best_link and tender_links:
                    best_link = tender_links[0]
                
                if best_link:
                    print(f"🚀 Navigating to: {best_link['text']} -> {best_link['href']}")
                    self.driver.get(best_link['href'])
                    time.sleep(5)
                    return self.driver.current_url
            
            # If no specific tender links found, look for navigation menus
            print("🔍 Looking for navigation menus...")
            
            # Try to find any navigation elements
            nav_elements = self.driver.find_elements(By.CSS_SELECTOR, "nav a, .menu a, .navigation a, ul li a")
            
            for element in nav_elements:
                try:
                    text = element.text.strip().lower()
                    href = element.get_attribute('href')
                    if text and href and any(keyword in text for keyword in ['opportunity', 'tender', 'search', 'browse', 'current']):
                        print(f"🎯 Found navigation link: {text} -> {href}")
                        element.click()
                        time.sleep(3)
                        return self.driver.current_url
                except:
                    continue
            
            # Try some common tender URLs directly
            print("🔍 Trying common tender URLs...")
            common_urls = [
                "/esop/toolkit/opportunity/current/list.si",
                "/esop/toolkit/opportunity/global/list.si",
                "/esop/public/opportunities",
                "/esop/guest/opportunities"
            ]
            
            for url_path in common_urls:
                try:
                    full_url = self.base_url + url_path
                    print(f"🔍 Trying: {full_url}")
                    self.driver.get(full_url)
                    time.sleep(3)
                    
                    # Check if we got tender content
                    page_text = self.driver.page_source.lower()
                    if any(keyword in page_text for keyword in ['tender', 'opportunity', 'bid']) and 'session' not in page_text:
                        print(f"✅ Found tender content at: {full_url}")
                        return full_url
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
            debug_file = f"enhanced_scraper_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
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
                
                # Check if this table contains tender data
                table_text = table.get_text().lower()
                if any(keyword in table_text for keyword in ['tender', 'opportunity', 'bid', 'closing', 'reference', 'title']):
                    print(f"   ✅ Table {i+1} appears to contain tender data")
                    table_data = self.extract_table_data(table, i)
                    if table_data:
                        tenders.extend(table_data)
                        print(f"   ✅ Extracted {len(table_data)} records from table {i+1}")
                else:
                    print(f"   ⚠️  Table {i+1} doesn't appear to contain tender data")
            
            # Strategy 2: Look for list items or divs with tender content
            if not tenders:
                print("🔍 No table data found, looking for other structures...")
                
                # Look for tender-specific containers
                tender_containers = soup.find_all(['div', 'li', 'article'], class_=lambda x: x and any(
                    keyword in ' '.join(x).lower() for keyword in ['tender', 'opportunity', 'bid', 'listing', 'item', 'row']
                ))
                
                print(f"📦 Found {len(tender_containers)} potential tender containers")
                
                for i, container in enumerate(tender_containers):
                    text = container.get_text(strip=True)
                    if len(text) > 50:  # Only meaningful content
                        # Check if it really contains tender info
                        if any(keyword in text.lower() for keyword in ['tender', 'opportunity', 'bid', 'rfp', 'rfq', 'closing']):
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
                                    for link in links if link.get('href') and not link.get('href').startswith('javascript:')
                                ]
                            
                            tenders.append(tender_data)
            
            # Strategy 3: Look for any structured content with tender keywords
            if not tenders:
                print("🔍 Looking for any tender-related content...")
                
                # Find all elements with tender-related text
                all_elements = soup.find_all(['p', 'div', 'span', 'td', 'li', 'h1', 'h2', 'h3'])
                tender_content = []
                
                for element in all_elements:
                    text = element.get_text(strip=True)
                    if len(text) > 20 and any(keyword in text.lower() for keyword in 
                                           ['tender', 'opportunity', 'bid', 'rfp', 'rfq', 'procurement', 'closing date', 'reference number']):
                        tender_content.append({
                            'text': text,
                            'tag': element.name,
                            'class': element.get('class', [])
                        })
                
                if tender_content:
                    print(f"📝 Found {len(tender_content)} elements with tender-related content")
                    for i, content in enumerate(tender_content):
                        tenders.append({
                            'content': content['text'],
                            'element_type': content['tag'],
                            'element_class': content['class'],
                            'content_index': i,
                            'scraped_at': datetime.now().isoformat(),
                            'source_url': self.driver.current_url
                        })
            
            # Strategy 4: Check for forms or search interfaces
            if not tenders:
                print("🔍 Looking for search forms or interfaces...")
                
                forms = soup.find_all('form')
                search_elements = soup.find_all(['input', 'button'], attrs={'type': lambda x: x and 'search' in x.lower()})
                
                if forms or search_elements:
                    print(f"📋 Found {len(forms)} forms and {len(search_elements)} search elements")
                    
                    # This might be a search interface - record it
                    tenders.append({
                        'content': 'Search interface detected - may require interaction to view tenders',
                        'forms_found': len(forms),
                        'search_elements_found': len(search_elements),
                        'page_type': 'search_interface',
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
            header_keywords = ['title', 'number', 'date', 'organization', 'tender', 'opportunity', 'closing', 'reference', 'description', 'status']
            
            if any(any(keyword in header.lower() for keyword in header_keywords) for header in potential_headers):
                headers = potential_headers
                data_rows = rows[1:]
            else:
                # Generate descriptive headers based on content
                headers = []
                for i, cell in enumerate(cells):
                    cell_text = cell.get_text(strip=True).lower()
                    if 'title' in cell_text or 'name' in cell_text:
                        headers.append('Title')
                    elif 'number' in cell_text or 'ref' in cell_text:
                        headers.append('Reference')
                    elif 'date' in cell_text or 'closing' in cell_text:
                        headers.append('Date')
                    elif 'org' in cell_text or 'department' in cell_text:
                        headers.append('Organization')
                    else:
                        headers.append(f"Column_{i+1}")
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
                            row_data[f"{header}_links"] = link_data
                
                # Only add meaningful rows
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
        json_file = os.path.join(output_dir, f"ontario_tenders_enhanced_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(tenders, f, indent=2, ensure_ascii=False)
        saved_files.append(json_file)
        print(f"💾 Saved JSON: {json_file}")
        
        # Save as CSV
        try:
            df = pd.DataFrame(tenders)
            csv_file = os.path.join(output_dir, f"ontario_tenders_enhanced_{timestamp}.csv")
            df.to_csv(csv_file, index=False, encoding='utf-8')
            saved_files.append(csv_file)
            print(f"💾 Saved CSV: {csv_file}")
        except Exception as e:
            print(f"⚠️  Could not save CSV: {e}")
        
        return saved_files
    
    def run(self):
        """Main execution method"""
        try:
            print("Enhanced Ontario Tenders Scraper")
            print("=" * 40)
            
            if not self.setup_selenium():
                return False
            
            # Navigate through language selection to tender page
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
                    print(f"\n📝 Sample records:")
                    for i, tender in enumerate(tenders[:3]):  # Show first 3
                        print(f"\n   Record {i+1}:")
                        for key, value in list(tender.items())[:5]:
                            display_value = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
                            print(f"     {key}: {display_value}")
                
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
                self.driver.quit()

def main():
    scraper = EnhancedOntarioTendersScraper()
    success = scraper.run()
    
    if success:
        print("\n✅ Enhanced scraping completed successfully!")
        print("🎯 Check the data/ directory for extracted tender information")
    else:
        print("\n❌ Scraping failed. Check the debug files for more information.")
        print("💡 The site might require additional navigation or authentication")

if __name__ == "__main__":
    main()


