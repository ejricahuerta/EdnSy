# Security Guidelines for Environment Variables

## 🔒 Environment Variable Security

This document outlines the security measures implemented for environment variables in the Ed&Sy project.

### ✅ **Security Measures Implemented**

1. **Proper Git Exclusion**
   - `.env` files are now properly excluded from version control
   - Multiple environment file patterns are ignored (`.env.local`, `.env.backup`, etc.)

2. **Environment Variable Validation**
   - All environment variables are validated at startup
   - Clear error messages when required variables are missing
   - Production builds will fail if required variables are missing

3. **Public vs Private Variable Separation**
   - `PUBLIC_` prefix for client-side variables (safe for browser)
   - Private variables for server-side only (never exposed to client)

4. **Input Validation**
   - API endpoints validate request bodies
   - URL format validation for external API calls
   - Proper error handling and logging

### 📋 **Environment Variables Reference**

#### **Public Variables (Client-Side Safe)**
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_POSTHOG_API_KEY=your_posthog_api_key
```

#### **Private Variables (Server-Side Only)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
N8N_DEMO_CHAT_API_URL=https://your-n8n-instance.com/webhook/your-webhook-id/chat
POSTHOG_KEY=your_posthog_key
POSTHOG_HOST=https://us.i.posthog.com
```

### 🚨 **Security Best Practices**

1. **Never commit `.env` files to version control**
   - Use `.env.example` for documentation
   - Keep actual secrets in `.env` (already ignored)

2. **Use appropriate variable prefixes**
   - `PUBLIC_` for client-side variables
   - No prefix for server-side variables

3. **Validate all environment variables**
   - Check for missing variables at startup
   - Provide clear error messages

4. **Rotate secrets regularly**
   - Update API keys periodically
   - Use different keys for development/production

5. **Monitor for exposed secrets**
   - Regular security audits
   - Check for accidental commits

### 🔧 **Setup Instructions**

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Fill in your actual values:**
   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   # ... etc
   ```

3. **Verify the setup:**
   ```bash
   npm run dev
   # Check console for any missing variable warnings
   ```

### 🛡️ **Security Checklist**

- [ ] `.env` file is in `.gitignore`
- [ ] All required variables are documented in `env.example`
- [ ] Environment variables are validated at startup
- [ ] Public variables use `PUBLIC_` prefix
- [ ] Private variables have no prefix
- [ ] API endpoints validate input
- [ ] Error messages don't expose sensitive information
- [ ] Production builds fail on missing variables

### 🚨 **Emergency Response**

If you suspect secrets have been compromised:

1. **Immediately rotate all API keys**
2. **Check git history for exposed secrets**
3. **Update all affected services**
4. **Review access logs for unauthorized usage**

### 📞 **Support**

For security concerns or questions:
- Review this document first
- Check the console for validation errors
- Ensure all required variables are set 