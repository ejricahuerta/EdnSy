# OAuth Authentication Setup

## Overview

The application uses Supabase OAuth with Google authentication and a custom callback route for better control over the authentication flow.

## How It Works

### 1. Login Flow
1. User visits `/login`
2. Clicks "Continue with Google"
3. Google OAuth redirects to `/auth/callback`
4. Callback processes the OAuth response and creates a session
5. User is redirected to `/demos` after successful authentication

### 2. Authentication Protection
- `/demos` and all sub-routes require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users trying to access `/login` are redirected to `/demos`
- `/auth/callback` is accessible without authentication for OAuth processing

### 3. Session Management
- Sessions are managed by Supabase
- Custom callback handling for better error reporting
- Sessions persist across browser sessions

## Configuration Required

### Supabase Setup
1. **Enable Google OAuth in Supabase:**
   - Go to Authentication → Settings → Auth Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret

### Google OAuth Setup
1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://your-domain.com/auth/callback`
     - `http://localhost:5174/auth/callback` (for development)

### Environment Variables
Create a `.env` file with:
```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the OAuth flow:**
   - Visit `http://localhost:5174/login`
   - Click "Continue with Google"
   - Complete the Google OAuth flow
   - Should redirect to `/demos` automatically

3. **Test authentication protection:**
   - Try accessing `/demos` without authentication → Should redirect to `/login`
   - After authentication → Should access `/demos` successfully

## Troubleshooting

### "No authorization code received" Error
- Check that Google OAuth is properly configured in Supabase
- Verify the redirect URIs in Google Cloud Console match your Supabase project
- Ensure environment variables are set correctly

### OAuth Not Working
- Check browser console for detailed error messages
- Verify Supabase project settings
- Ensure Google OAuth credentials are correct

## Security Features

- ✅ Server-side authentication checks
- ✅ Automatic session validation
- ✅ Protected route enforcement
- ✅ Secure OAuth flow handling
- ✅ Session persistence 