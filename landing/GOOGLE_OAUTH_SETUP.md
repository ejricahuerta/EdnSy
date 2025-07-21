# Google OAuth Setup for Ed&Sy

## Environment Variables Required

Create a `.env` file in the landing directory with the following variables:

```env
# Supabase Configuration (Client-Side Safe)
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration (Client-Side Safe)
PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server-Side Supabase Configuration (Private)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (Client-Side Safe)
VITE_POSTHOG_API_KEY=your_posthog_api_key

# PostHog Configuration (Private)
POSTHOG_KEY=your_posthog_key
POSTHOG_HOST=https://us.i.posthog.com
```

## Security Notes

- **PUBLIC_ prefix**: Variables with this prefix are safe for client-side use
- **No prefix**: Variables without prefix are server-side only and private
- **VITE_ prefix**: Required for Vite to expose variables to the client

## Google OAuth Setup Steps

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/v1/callback` (for development)

2. **Configure Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Settings → Auth Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret
   - Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

3. **Update Environment Variables:**
   - Copy the Google Client ID and Secret to your `.env` file
   - Add your Supabase URL and anon key
   - Ensure all variables use the correct prefixes

## Features Implemented

- ✅ Google OAuth authentication
- ✅ Loading states and error handling
- ✅ Redirect to dashboard after successful login
- ✅ Session management
- ✅ Sign out functionality
- ✅ Protected dashboard route
- ✅ Dark theme consistent with design
- ✅ Secure environment variable handling

## Usage

1. Users visit `/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Redirected to `/dashboard` with user session
5. Can sign out from dashboard

The authentication is now fully functional with Google OAuth using Supabase Auth!

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] All variables use proper prefixes (PUBLIC_, VITE_)
- [ ] Server-side variables are private
- [ ] Environment variables are validated at startup
- [ ] No secrets are exposed in client-side code 