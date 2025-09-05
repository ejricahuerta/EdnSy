# OAuth2 Integration Quick Start Guide

## 🚀 Get Started in 30 Minutes

This guide will walk you through setting up the first OAuth integration (Google) for your EdnSy platform.

## 📋 Prerequisites

- EdnSy landing app running locally
- Supabase project set up
- Google Cloud Console access
- Basic understanding of OAuth2 flows

## ⚡ Quick Setup Steps

### **Step 1: Create Google OAuth App (5 minutes)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Google Calendar API
   - Gmail API
   - Google Sheets API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:5173/auth/google/callback`
7. Copy your `Client ID` and `Client Secret`

### **Step 2: Environment Setup (2 minutes)**

```bash
# apps/landing/.env.local
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Generate a secure MCP API key
MCP_API_KEY=your_secure_random_string_here
LANDING_APP_URL=http://localhost:5173
```

### **Step 3: Database Setup (3 minutes)**

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U postgres -d postgres -f scripts/setup-oauth-tokens.sql
```

### **Step 4: Create Basic OAuth Service (10 minutes)**

```typescript
// apps/landing/src/lib/services/oauth/google-oauth.ts
export class GoogleOAuthService {
  static getAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
  }

  static async exchangeCodeForTokens(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }
}
```

### **Step 5: Create OAuth Callback Handler (5 minutes)**

```typescript
// apps/landing/src/routes/auth/google/callback/+server.ts
import { supabase } from '$lib/supabase-server';
import { GoogleOAuthService } from '$lib/services/oauth/google-oauth';
import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies }) {
  try {
    const code = url.searchParams.get('code');
    
    if (!code) {
      throw redirect(303, '/integrations?error=no_code');
    }

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw redirect(303, '/integrations?error=unauthorized');
    }

    // Exchange code for tokens
    const tokens = await GoogleOAuthService.exchangeCodeForTokens(code);

    // Store tokens in database
    await supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: user.id,
        service_name: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      });

    throw redirect(303, '/integrations?success=google');
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw redirect(303, '/integrations?error=oauth_failed');
  }
}
```

### **Step 6: Create Basic Integrations Page (5 minutes)**

```svelte
<!-- apps/landing/src/routes/integrations/+page.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  
  let user = $state(null);
  let integrations = $state([]);
  
  onMount(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    user = currentUser;
    await loadIntegrations();
  });
  
  async function loadIntegrations() {
    const { data } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', user.id);
    
    integrations = data || [];
  }
  
  async function connectGoogle() {
    const authUrl = '/api/integrations/connect/google';
    window.location.href = authUrl;
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Connect Your Apps</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Google Integration -->
    <div class="border rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Google Workspace</h3>
      
      {#if integrations.find(i => i.service_name === 'google')}
        <div class="text-green-600 mb-4">✅ Connected</div>
      {:else}
        <p class="text-gray-600 mb-4">Connect your Google Calendar, Gmail, and Sheets.</p>
        <button 
          on:click={connectGoogle}
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Connect Google
        </button>
      {/if}
    </div>
  </div>
</div>
```

### **Step 7: Create Connect API Endpoint (5 minutes)**

```typescript
// apps/landing/src/routes/api/integrations/connect/google/+server.ts
import { GoogleOAuthService } from '$lib/services/oauth/google-oauth';
import { redirect } from '@sveltejs/kit';

export async function GET() {
  const authUrl = GoogleOAuthService.getAuthUrl();
  throw redirect(302, authUrl);
}
```

## 🧪 Test Your Integration

1. **Start your app**: `npm run dev`
2. **Visit**: `http://localhost:5173/integrations`
3. **Click**: "Connect Google"
4. **Authorize**: In Google's OAuth page
5. **Verify**: You're redirected back and see "✅ Connected"

## 🔍 Troubleshooting

### **Common Issues**

- **"Invalid redirect URI"**: Check your Google OAuth app settings
- **"Missing environment variables"**: Verify your `.env.local` file
- **"Database connection failed"**: Check Supabase connection
- **"OAuth flow failed"**: Check browser console for errors

### **Debug Steps**

1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Supabase logs for database errors
4. Verify OAuth app configuration in Google Console

## 🚀 Next Steps

Once Google OAuth is working:

1. **Add token refresh logic**
2. **Implement other services** (Notion, Slack, Stripe)
3. **Create MCP integration layer**
4. **Add comprehensive error handling**
5. **Implement monitoring and analytics**

## 📚 Full Documentation

For complete implementation details, see:
- [OAuth2 Integration Plan](./OAUTH2_INTEGRATION_PLAN.md)
- [Database Schema](./scripts/setup-oauth-tokens.sql)

## 🆘 Need Help?

- Check the troubleshooting section above
- Review the full integration plan
- Check Supabase and Google Cloud Console logs
- Verify all environment variables are set correctly

---

**Time to complete**: ~30 minutes  
**Difficulty**: Beginner  
**Prerequisites**: Basic OAuth2 knowledge, EdnSy app running
