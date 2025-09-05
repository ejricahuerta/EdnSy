#!/usr/bin/env python3
"""
Instagram Content Automation Script
Replicates the n8n workflow for automating Instagram content creation:
1. Read content plan from Google Sheets
2. Search Pexels for videos based on visual concepts
3. Download videos
4. Upload to Google Drive
5. Update sheet status
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime
import tempfile
import logging

# Google APIs
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_credentials() -> Dict:
    """
    Load credentials from .keys.json file
    
    Returns:
        Dictionary containing credentials
    """
    try:
        # Look for .keys.json in parent directory
        keys_path = os.path.join(os.path.dirname(__file__), '..', '.keys.json')
        
        if not os.path.exists(keys_path):
            logger.warning(f"Credentials file not found at {keys_path}")
            return {}
        
        with open(keys_path, 'r') as f:
            credentials = json.load(f)
        
        logger.info("Successfully loaded credentials from .keys.json")
        return credentials
        
    except Exception as e:
        logger.error(f"Failed to load credentials: {e}")
        return {}

def create_google_credentials_file(credentials: Dict) -> str:
    """
    Create Google OAuth credentials file from .keys.json data
    
    Args:
        credentials: Credentials dictionary from .keys.json
        
    Returns:
        Path to the created credentials file
    """
    try:
        google_creds = credentials.get('google console', [])
        if not google_creds:
            logger.error("No Google Console credentials found in .keys.json")
            return None
        
        # Use the first Google project (Ed & Sy)
        project_creds = google_creds[0]
        
        # Create the credentials.json structure
        google_credentials = {
            "installed": {
                "client_id": project_creds.get('client_id'),
                "project_id": project_creds.get('project', 'Ed & Sy'),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": project_creds.get('client_secret'),
                "redirect_uris": ["http://localhost:5173/auth/callback"]
            }
        }
        
        # Save to credentials.json in the marketing directory
        creds_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
        with open(creds_path, 'w') as f:
            json.dump(google_credentials, f, indent=2)
        
        logger.info(f"Created Google credentials file at {creds_path}")
        return creds_path
        
    except Exception as e:
        logger.error(f"Failed to create Google credentials file: {e}")
        return None

def get_google_credentials():
    """Get Google API credentials with proper OAuth flow"""
    creds = None
    
    # The file token.pickle stores the user's access and refresh tokens
    token_path = os.path.join(os.path.dirname(__file__), 'token.pickle')
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                logger.warning(f"Failed to refresh token: {e}")
                creds = None
        
        if not creds:
            try:
                # Load credentials from the credentials.json file
                creds_file_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
                if not os.path.exists(creds_file_path):
                    logger.error("credentials.json not found. Please ensure it exists in the marketing directory.")
                    return None
                
                # Define the scopes needed
                SCOPES = [
                    'https://www.googleapis.com/auth/spreadsheets.readonly',
                    'https://www.googleapis.com/auth/drive.file'
                ]
                
                # Create the flow with custom redirect URI
                flow = InstalledAppFlow.from_client_secrets_file(
                    creds_file_path, 
                    SCOPES,
                    redirect_uri='http://localhost:5173/auth/callback'
                )
                
                # Run the OAuth flow with custom redirect
                creds = flow.run_local_server(port=5173)
                
                # Save the credentials for the next run
                with open(token_path, 'wb') as token:
                    pickle.dump(creds, token)
                    
                logger.info("Successfully authenticated with Google")
                
            except Exception as e:
                logger.error(f"Authentication failed: {e}")
                logger.info("Please check your Google Cloud Console settings:")
                logger.info("1. Go to https://console.cloud.google.com/")
                logger.info("2. Select your project")
                logger.info("3. Go to APIs & Services > Credentials")
                logger.info("4. Edit your OAuth 2.0 Client ID")
                logger.info("5. Add 'http://localhost:5173/auth/callback' to Authorized redirect URIs")
                return None
    
    return creds

class InstagramContentAutomation:
    def __init__(self, config: Dict):
        """
        Initialize the automation with configuration
        
        Args:
            config: Dictionary containing API keys and settings
        """
        self.config = config
        self.pexels_api_key = config.get('pexels_api_key')
        self.sheets_service = None
        self.drive_service = None
        
        # Google Sheets configuration
        self.spreadsheet_id = config.get('spreadsheet_id')
        self.sheet_name = config.get('sheet_name', 'insta.reels')
        
        # Google Drive configuration
        self.drive_folder_id = config.get('drive_folder_id')
        
        # Initialize Google services
        self._setup_google_services()
    
    def _setup_google_services(self):
        """Setup Google Sheets and Drive API services"""
        try:
            # Use the new credential function
            creds = get_google_credentials()
            if not creds:
                logger.error("Failed to get Google credentials")
                raise Exception("Google authentication failed")
            
            # Build services
            self.sheets_service = build('sheets', 'v4', credentials=creds)
            self.drive_service = build('drive', 'v3', credentials=creds)
            
            logger.info("Google services initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to setup Google services: {e}")
            raise
    
    def read_instagram_content_plan(self) -> List[Dict]:
        """
        Read Instagram content plan from Google Sheets
        
        Returns:
            List of content items from the sheet
        """
        try:
            # Read the sheet data - use a broader range to ensure we get all columns
            range_name = f"{self.sheet_name}!A:Z"  # Read more columns to be safe
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            if not values:
                logger.warning("No data found in sheet")
                return []
            
            # Get headers (first row)
            headers = values[0]
            logger.info(f"Found {len(headers)} columns in sheet: {headers}")
            
            # Convert to list of dictionaries
            content_items = []
            for i, row in enumerate(values[1:], start=2):  # Start from row 2 (after headers)
                # Pad row to match headers length
                row_padded = row + [''] * (len(headers) - len(row))
                item = dict(zip(headers, row_padded))
                item['row_number'] = i  # Add row number for updates
                content_items.append(item)
            
            logger.info(f"Read {len(content_items)} content items from sheet")
            return content_items
            
        except Exception as e:
            logger.error(f"Failed to read content plan: {e}")
            raise
    
    def search_pexels_videos(self, visual_concept: str) -> Optional[Dict]:
        """
        Search Pexels for videos based on visual concept
        
        Args:
            visual_concept: Search term for video content
            
        Returns:
            Video data from Pexels API
        """
        try:
            url = "https://api.pexels.com/videos/search"
            headers = {
                "Authorization": self.pexels_api_key
            }
            params = {
                "query": visual_concept or "lifestyle",
                "per_page": 1,  # Get first result
                "orientation": "portrait"  # Better for Instagram
            }
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            videos = data.get('videos', [])
            
            if videos:
                video = videos[0]
                logger.info(f"Found video for '{visual_concept}': {video.get('url', 'N/A')}")
                return video
            else:
                logger.warning(f"No videos found for '{visual_concept}'")
                return None
                
        except Exception as e:
            logger.error(f"Failed to search Pexels: {e}")
            return None
    
    def download_video(self, video_data: Dict, filename: str) -> Optional[str]:
        """
        Download video from Pexels video data
        
        Args:
            video_data: Video data from Pexels API
            filename: Name to save the file as
            
        Returns:
            Path to downloaded file or None if failed
        """
        try:
            # Get video files from the video data
            video_files = video_data.get('video_files', [])
            
            if not video_files:
                logger.error("No video files found in video data")
                return None
            
            # Get the best quality video file (preferably portrait for Instagram)
            # Sort by quality and prefer portrait orientation
            def sort_key(video_file):
                width = video_file.get('width', 0)
                height = video_file.get('height', 0)
                quality = width * height
                # Prefer portrait orientation for Instagram
                orientation_bonus = 1000000 if height > width else 0
                return quality + orientation_bonus
            
            best_video = max(video_files, key=sort_key)
            download_url = best_video.get('link')
            
            if not download_url:
                logger.error("No download URL found")
                return None
            
            logger.info(f"Downloading video: {best_video.get('width')}x{best_video.get('height')} - {best_video.get('file_type', 'mp4')}")
            
            # Download the video
            video_response = requests.get(download_url, stream=True)
            video_response.raise_for_status()
            
            # Save to temporary file
            temp_dir = tempfile.gettempdir()
            file_path = os.path.join(temp_dir, f"{filename}.mp4")
            
            with open(file_path, 'wb') as f:
                for chunk in video_response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded video to {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to download video: {e}")
            return None
    
    def upload_to_google_drive(self, file_path: str, filename: str) -> Optional[str]:
        """
        Upload video to Google Drive
        
        Args:
            file_path: Path to the video file
            filename: Name for the file in Drive
            
        Returns:
            Google Drive file ID or None if failed
        """
        try:
            file_metadata = {
                'name': filename,
                'parents': [self.drive_folder_id]
            }
            
            media = MediaFileUpload(file_path, resumable=True)
            
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            file_id = file.get('id')
            logger.info(f"Uploaded video to Drive with ID: {file_id}")
            
            # Clean up temporary file
            os.remove(file_path)
            
            return file_id
            
        except Exception as e:
            logger.error(f"Failed to upload to Drive: {e}")
            return None
    
    def update_sheet_status(self, row_number: int, status: str = "Processed"):
        """
        Update the status in Google Sheets
        
        Args:
            row_number: Row number to update
            status: New status to set
        """
        try:
            # Update the Notes/Status column (column M)
            range_name = f"{self.sheet_name}!M{row_number}"
            values = [[status]]
            
            body = {
                'values': values
            }
            
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            logger.info(f"Updated row {row_number} status to '{status}'")
            
        except Exception as e:
            logger.error(f"Failed to update sheet status: {e}")
    
    def process_content_item(self, item: Dict) -> bool:
        """
        Process a single content item
        
        Args:
            item: Content item from the sheet
            
        Returns:
            True if processing was successful, False otherwise
        """
        try:
            # Check if item is ready for processing
            status = item.get('Notes/Status', '')
            if status != 'Ready':
                logger.info(f"Skipping item (status: {status})")
                return False
            
            visual_concept = item.get('Visual Concept', '')
            caption = item.get('Caption/Text Overlay Ideas', '')
            
            if not visual_concept:
                logger.warning("No visual concept found, skipping")
                return False
            
            # Search for video
            video_data = self.search_pexels_videos(visual_concept)
            if not video_data:
                logger.error(f"No video found for '{visual_concept}'")
                return False
            
            # Download video
            safe_filename = "".join(c for c in caption if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_filename = safe_filename[:50]  # Limit length
            filename = f"{safe_filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            file_path = self.download_video(video_data, filename)
            if not file_path:
                logger.error("Failed to download video")
                return False
            
            # Upload to Drive
            drive_file_id = self.upload_to_google_drive(file_path, filename)
            if not drive_file_id:
                logger.error("Failed to upload to Drive")
                return False
            
            # Update sheet status
            row_number = item.get('row_number')
            if row_number:
                self.update_sheet_status(row_number, "Processed")
            
            logger.info(f"Successfully processed content item: {caption}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process content item: {e}")
            return False
    
    def run_automation(self):
        """Run the complete automation workflow"""
        try:
            logger.info("Starting Instagram content automation")
            
            # Read content plan
            content_items = self.read_instagram_content_plan()
            if not content_items:
                logger.warning("No content items found")
                return
            
            # Process each item
            processed_count = 0
            for item in content_items:
                if self.process_content_item(item):
                    processed_count += 1
            
            logger.info(f"Automation completed. Processed {processed_count}/{len(content_items)} items")
            
        except Exception as e:
            logger.error(f"Automation failed: {e}")
            raise


def main():
    """Main function to run the automation"""
    # Load credentials from .keys.json
    credentials = load_credentials()
    
    # Create Google credentials file if needed
    if credentials:
        create_google_credentials_file(credentials)
    
    # Configuration - using credentials from .keys.json
    config = {
        'pexels_api_key': 'nM4JkGzPtbfkx5VlG6udbVlfXfKVr3SO1YaPbr6k8hkr8yiWD7xP0zg3',
        'spreadsheet_id': '17mU2YgDnq1W0VHq6XU5Mr-k8A9Z6k--8hrGq8Kc3wbI',
        'sheet_name': 'insta.reels',
        'drive_folder_id': '1k441LaBIS5cXwes1N9raXfLtv1aPXTkX'
    }
    
    # Create automation instance
    automation = InstagramContentAutomation(config)
    
    # Run the automation
    automation.run_automation()


if __name__ == "__main__":
    main()
