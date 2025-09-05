#!/usr/bin/env python3
"""
Simple test scraper for Ontario Tenders
Tests basic connectivity and explores the site structure
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time

def test_ontario_tenders():
    """Test basic access to Ontario Tenders site"""
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    })
    
    print("Ontario Tenders Simple Test")
    print("=" * 30)
    
    # Test URLs to try
    test_urls = [
        "https://ontariotenders.app.jaggaer.com/",
        "https://ontariotenders.app.jaggaer.com/esop/",
        "https://ontariotenders.app.jaggaer.com/esop/public",
        "https://ontariotenders.app.jaggaer.com/esop/guest",
        "https://ontariotenders.app.jaggaer.com/public",
    ]
    
    results = []
    
    for url in test_urls:
        try:
            print(f"\n🔍 Testing: {url}")
            response = session.get(url, timeout=10)
            
            result = {
                'url': url,
                'status_code': response.status_code,
                'content_length': len(response.text),
                'accessible': response.status_code == 200,
                'has_tender_content': False,
                'has_links': False,
                'timestamp': datetime.now().isoformat()
            }
            
            if response.status_code == 200:
                print(f"✅ Status: {response.status_code}")
                print(f"📄 Content length: {len(response.text):,} characters")
                
                # Parse content
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Check for tender-related content
                page_text = soup.get_text().lower()
                tender_keywords = ['tender', 'opportunity', 'bid', 'procurement', 'rfp', 'rfq']
                found_keywords = [kw for kw in tender_keywords if kw in page_text]
                
                if found_keywords:
                    result['has_tender_content'] = True
                    result['found_keywords'] = found_keywords
                    print(f"🎯 Found tender keywords: {', '.join(found_keywords)}")
                
                # Check for links
                links = soup.find_all('a', href=True)
                if links:
                    result['has_links'] = True
                    result['link_count'] = len(links)
                    print(f"🔗 Found {len(links)} links")
                    
                    # Look for promising links
                    promising_links = []
                    for link in links[:20]:  # Check first 20 links
                        href = link.get('href', '')
                        text = link.get_text(strip=True).lower()
                        
                        if any(kw in text or kw in href.lower() for kw in tender_keywords):
                            promising_links.append({
                                'text': link.get_text(strip=True),
                                'href': href
                            })
                    
                    if promising_links:
                        result['promising_links'] = promising_links
                        print(f"🎯 Found {len(promising_links)} promising links:")
                        for plink in promising_links[:5]:  # Show first 5
                            print(f"   - {plink['text']}: {plink['href']}")
                
                # Save page for analysis if it looks promising
                if result['has_tender_content'] or result['has_links']:
                    filename = f"test_page_{url.replace('https://', '').replace('/', '_')}.html"
                    with open(filename, 'w', encoding='utf-8') as f:
                        f.write(soup.prettify())
                    print(f"💾 Saved page to: {filename}")
                    result['saved_file'] = filename
                
            else:
                print(f"❌ Status: {response.status_code}")
                if response.status_code == 401:
                    print("   🔒 Requires authentication")
                elif response.status_code == 404:
                    print("   📭 Page not found")
                elif response.status_code == 403:
                    print("   🚫 Access forbidden")
            
            results.append(result)
            time.sleep(1)  # Be respectful
            
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({
                'url': url,
                'error': str(e),
                'accessible': False,
                'timestamp': datetime.now().isoformat()
            })
    
    # Save results
    with open('ontario_tenders_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📊 SUMMARY")
    print("=" * 30)
    accessible_urls = [r for r in results if r.get('accessible')]
    tender_content_urls = [r for r in results if r.get('has_tender_content')]
    
    print(f"✅ Accessible URLs: {len(accessible_urls)}/{len(test_urls)}")
    print(f"🎯 URLs with tender content: {len(tender_content_urls)}")
    
    if accessible_urls:
        print(f"\n📋 Accessible URLs:")
        for result in accessible_urls:
            print(f"  - {result['url']} ({result['content_length']:,} chars)")
    
    if tender_content_urls:
        print(f"\n🎯 URLs with tender content:")
        for result in tender_content_urls:
            print(f"  - {result['url']}")
            if 'found_keywords' in result:
                print(f"    Keywords: {', '.join(result['found_keywords'])}")
            if 'promising_links' in result:
                print(f"    Promising links: {len(result['promising_links'])}")
    
    print(f"\n💾 Results saved to: ontario_tenders_test_results.json")
    
    return results

if __name__ == "__main__":
    test_ontario_tenders()

