#!/usr/bin/env python3
"""
Helper script to fix OAuth redirect URI issues
"""

import webbrowser
import os

def main():
    print("🔧 OAuth Redirect URI Fix Helper")
    print("=" * 50)
    print()
    print("The 'redirect_uri_mismatch' error occurs when the redirect URI")
    print("in your Google Cloud Console doesn't match what the script is using.")
    print()
    print("Let's fix this step by step:")
    print()
    
    # Check if credentials.json exists
    if not os.path.exists('credentials.json'):
        print("❌ credentials.json not found!")
        print("Please ensure the credentials file exists in this directory.")
        return
    
    print("✅ credentials.json found")
    print()
    
    print("📋 Steps to fix the redirect URI issue:")
    print()
    print("1. Open Google Cloud Console")
    print("2. Navigate to your project")
    print("3. Go to APIs & Services > Credentials")
    print("4. Find and edit your OAuth 2.0 Client ID")
    print("5. Add these redirect URIs to the 'Authorized redirect URIs' section:")
    print()
    print("   • http://localhost:5173/auth/callback")
    print("   • http://localhost:8080/")
    print("   • http://localhost:8090/")
    print("   • http://localhost:0/")
    print()
    print("6. Save the changes")
    print("7. Try running the script again")
    print()
    
    # Ask if user wants to open Google Cloud Console
    response = input("Would you like to open Google Cloud Console now? (y/n): ")
    if response.lower() in ['y', 'yes']:
        print("Opening Google Cloud Console...")
        webbrowser.open("https://console.cloud.google.com/apis/credentials")
        print("✅ Google Cloud Console opened in your browser")
    else:
        print("You can manually navigate to: https://console.cloud.google.com/apis/credentials")
    
    print()
    print("After updating the redirect URIs, try running the script again:")
    print("python instagram_content_automation.py")

if __name__ == "__main__":
    main()
