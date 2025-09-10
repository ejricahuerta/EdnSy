# Ontario Tenders Scraper

This tool scrapes tender opportunities from the Ontario Tenders website (https://ontariotenders.app.jaggaer.com).

## Features

- **Dual-method scraping**: Uses both requests/BeautifulSoup and Selenium for maximum compatibility
- **Multiple output formats**: Saves data as JSON, CSV, and summary text files
- **Robust error handling**: Includes retry logic and fallback strategies
- **Detailed logging**: Comprehensive logging for debugging and monitoring

## Files

- `ontario_tenders_scraper.py` - Basic scraper using requests and BeautifulSoup
- `advanced_scraper.py` - Advanced scraper with Selenium fallback
- `run_scraper.py` - Simple runner script that tries both methods
- `requirements.txt` - Python dependencies

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. For Selenium support, install Chrome/Chromium and ChromeDriver:
   - **Windows**: Download ChromeDriver from https://chromedriver.chromium.org/
   - **Ubuntu/Debian**: `sudo apt-get install chromium-browser chromium-chromedriver`
   - **macOS**: `brew install chromedriver`

## Usage

### Quick Start
```bash
python run_scraper.py
```

### Basic Scraper Only
```bash
python ontario_tenders_scraper.py
```

### Advanced Scraper with Selenium
```bash
python advanced_scraper.py --selenium
```

### Command Line Options (Advanced Scraper)
```bash
python advanced_scraper.py --help
python advanced_scraper.py --selenium --output my_data_folder
```

## Output

The scraper creates a `data/` directory (or custom directory) with:

- `ontario_tenders_YYYYMMDD_HHMMSS.json` - Raw data in JSON format
- `ontario_tenders_YYYYMMDD_HHMMSS.csv` - Data in CSV format for Excel
- `scrape_summary_YYYYMMDD_HHMMSS.txt` - Summary of the scraping session

## Data Structure

Each tender record typically includes:
- Tender title/name
- Reference number
- Closing date
- Organization
- Links to detailed pages
- Scraped timestamp

## Troubleshooting

### No Data Found
- The website might be using complex JavaScript - try the Selenium option
- Check if the website requires authentication or has changed its structure
- Look at the generated `debug_page.html` file to see what was actually scraped

### Selenium Issues
- Ensure Chrome/Chromium is installed
- Install the correct ChromeDriver version for your Chrome version
- Check that ChromeDriver is in your PATH

### Network Issues
- The scraper includes retry logic, but persistent network issues may require manual intervention
- Check if the website is accessible from your network

## Legal and Ethical Considerations

- This scraper is for educational and research purposes
- Respect the website's robots.txt and terms of service
- Don't overload the server with too many requests
- Consider reaching out to the website owners for API access if available

## Customization

You can modify the scrapers to:
- Change the target URL
- Adjust parsing logic for different table structures
- Add more output formats
- Implement data filtering or processing

## Logging

The scrapers use Python's logging module. To see detailed logs:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```
