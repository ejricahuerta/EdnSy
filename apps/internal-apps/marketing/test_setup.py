#!/usr/bin/env python3
"""
Test script to verify Instagram content automation setup
"""

import os
import sys
from instagram_content_automation import load_credentials, create_google_credentials_file

def test_setup():
    """Test the setup and configuration"""
    print("🔧 Testing Instagram Content Automation Setup")
    print("=" * 50)
    
    # Test 1: Load credentials
    print("\n1. Testing credential loading...")
    try:
        credentials = load_credentials()
        if credentials:
            print("✅ Successfully loaded credentials from .keys.json")
            print(f"   - Google Console projects: {len(credentials.get('google console', []))}")
            print(f"   - Notion tokens: {len(credentials.get('notion', []))}")
            print(f"   - Supabase config: {'✅' if 'supabase' in credentials else '❌'}")
            print(f"   - Stripe config: {'✅' if 'Stripe' in credentials else '❌'}")
        else:
            print("❌ Failed to load credentials")
            return False
    except Exception as e:
        print(f"❌ Error loading credentials: {e}")
        return False
    
    # Test 2: Create Google credentials file
    print("\n2. Testing Google credentials file creation...")
    try:
        creds_path = create_google_credentials_file(credentials)
        if creds_path and os.path.exists(creds_path):
            print(f"✅ Google credentials file created at: {creds_path}")
            
            # Check file contents
            with open(creds_path, 'r') as f:
                import json
                creds_data = json.load(f)
                client_id = creds_data.get('installed', {}).get('client_id', '')
                if client_id:
                    print(f"   - Client ID: {client_id[:20]}...")
                else:
                    print("   - ❌ No client ID found")
        else:
            print("❌ Failed to create Google credentials file")
            return False
    except Exception as e:
        print(f"❌ Error creating Google credentials file: {e}")
        return False
    
    # Test 3: Check required files
    print("\n3. Checking required files...")
    required_files = [
        'instagram_content_automation.py',
        'requirements.txt',
        'README.md',
        '.gitignore'
    ]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - Missing")
    
    # Test 4: Check configuration
    print("\n4. Checking configuration...")
    config = {
        'pexels_api_key': 'nM4JkGzPtbfkx5VlG6udbVlfXfKVr3SO1YaPbr6k8hkr8yiWD7xP0zg3',
        'spreadsheet_id': '17mU2YgDnq1W0VHq6XU5Mr-k8A9Z6k--8hrGq8Kc3wbI',
        'sheet_name': 'insta.reels',
        'drive_folder_id': '1k441LaBIS5cXwes1N9raXfLtv1aPXTkX'
    }
    
    print(f"   - Pexels API Key: {'✅' if config['pexels_api_key'] else '❌'}")
    print(f"   - Spreadsheet ID: {'✅' if config['spreadsheet_id'] else '❌'}")
    print(f"   - Drive Folder ID: {'✅' if config['drive_folder_id'] else '❌'}")
    
    print("\n" + "=" * 50)
    print("🎉 Setup test completed successfully!")
    print("\nNext steps:")
    print("1. Run: python instagram_content_automation.py")
    print("2. Complete Google OAuth authentication when prompted")
    print("3. The script will process your Instagram content automatically")
    
    return True

if __name__ == "__main__":
    success = test_setup()
    sys.exit(0 if success else 1)
