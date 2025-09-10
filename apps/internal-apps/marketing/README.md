# Instagram Content Automation

A Python script that replicates the n8n workflow for automating Instagram content creation. This script reads content plans from Google Sheets, searches Pexels for videos, downloads them, and uploads to Google Drive.

## Features

- **Google Sheets Integration**: Reads Instagram content plans from Google Sheets
- **Pexels Video Search**: Automatically searches for videos based on visual concepts
- **Video Download**: Downloads high-quality videos from Pexels
- **Google Drive Upload**: Uploads videos to specified Google Drive folders
- **Status Tracking**: Updates sheet status to track processed items
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Python 3.7 or higher
- Google Cloud Project with APIs enabled
- Pexels API key
- Google Sheets with content plan
- Google Drive folder for video storage

## Installation

1. **Clone or download the script files**:
   ```bash
   # Download the files to your project directory
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up credentials**:
   - Ensure you have a `.keys.json` file in the parent directory with your API credentials
   - The script will automatically create the required Google credentials file
   - No manual Google Cloud setup required - uses existing credentials

4. **Run the script**:
   - The script will automatically load credentials from `.keys.json`
   - First run will require Google OAuth authentication
   - Subsequent runs will use saved authentication tokens

## Configuration

Update the configuration in the `main()` function:

```python
config = {
    'pexels_api_key': 'your_pexels_api_key_here',
    'spreadsheet_id': 'your_google_sheets_id',
    'sheet_name': 'insta.reels',
    'drive_folder_id': 'your_google_drive_folder_id'
}
```

### Getting API Keys and IDs

**Pexels API Key**:
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up and get your API key

**Google Sheets ID**:
1. Open your Google Sheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

**Google Drive Folder ID**:
1. Open the target folder in Google Drive
2. Copy the ID from the URL: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`

## Google Sheets Format

Your Google Sheet should have the following columns:
- Day
- Date
- Phase
- Content Type
- Hobby Focus
- Mundane Task Addressed
- Visual Concept
- Ed/SY Commentary (Key Message)
- Caption/Text Overlay Ideas
- Call to Action (CTA)
- Hashtags
- Trending Audio/Music Idea (for Reels)
- Notes/Status

The script processes rows where "Notes/Status" is set to "Ready".

## Usage

1. **First Run (Authentication)**:
   ```bash
   python instagram_content_automation.py
   ```
   - A browser window will open for Google OAuth authentication
   - Complete the authentication process
   - Credentials will be saved for future runs

2. **Subsequent Runs**:
   ```bash
   python instagram_content_automation.py
   ```

## How It Works

1. **Read Content Plan**: Reads all rows from the specified Google Sheet
2. **Filter Ready Items**: Processes only items with "Ready" status
3. **Search Videos**: Searches Pexels for videos matching the visual concept
4. **Download Video**: Downloads the highest quality video file
5. **Upload to Drive**: Uploads the video to Google Drive with descriptive filename
6. **Update Status**: Marks the sheet row as "Processed"

## File Structure

```
marketing/
├── instagram_content_automation.py  # Main script
├── requirements.txt                 # Python dependencies
├── README.md                       # This file
├── .gitignore                      # Git ignore rules for sensitive files
├── credentials.json                # Google OAuth credentials (auto-generated from .keys.json)
└── token.pickle                    # Saved authentication token (auto-generated)

Parent directory:
├── .keys.json                      # Your API credentials (not in marketing folder)
```

## Error Handling

The script includes comprehensive error handling:
- **API Rate Limits**: Handles Pexels API rate limiting
- **Network Issues**: Retries failed downloads
- **Authentication**: Automatic token refresh
- **Missing Data**: Skips items with missing required fields
- **File Operations**: Safe temporary file handling

## Logging

The script provides detailed logging:
- INFO: Successful operations and progress
- WARNING: Non-critical issues (missing data, skipped items)
- ERROR: Failed operations with error details

## Customization

### Modify Video Search
Edit the `search_pexels_videos()` method to:
- Change search parameters (quality, duration, etc.)
- Add multiple search terms
- Implement different video selection logic

### Custom File Naming
Modify the filename generation in `process_content_item()`:
```python
filename = f"{caption}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
```

### Add Post-Processing
Extend the `process_content_item()` method to:
- Add video editing
- Generate thumbnails
- Create metadata files

## Troubleshooting

### Common Issues

**"No module named 'google'"**:
```bash
pip install -r requirements.txt
```

**"Invalid credentials"**:
- Delete `token.pickle` and re-authenticate
- Ensure `credentials.json` is in the correct location

**"Permission denied"**:
- Check Google Sheets and Drive permissions
- Ensure the Google account has access to the files

**"No videos found"**:
- Check Pexels API key validity
- Verify search terms are appropriate
- Check API rate limits

### Debug Mode

Enable debug logging by modifying the logging level:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Security Notes

- Keep your API keys secure
- Don't commit `credentials.json` or `token.pickle` to version control
- Use environment variables for production deployments
- Regularly rotate API keys

## License

This script is provided as-is for educational and automation purposes. Ensure compliance with:
- Pexels API terms of service
- Google API terms of service
- Your organization's data handling policies

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Verify all configuration values are correct
4. Ensure all prerequisites are met
