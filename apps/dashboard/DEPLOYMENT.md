# EdnSy Dashboard - Vercel Deployment Guide

This guide covers deploying the EdnSy Dashboard to Vercel with all the necessary configurations.

## Prerequisites

- Vercel account (free tier available)
- GitHub repository with the dashboard code
- Supabase project configured
- Google OAuth credentials set up

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `dashboard` folder

2. **Configure Build Settings**
   - Framework Preset: `SvelteKit`
   - Build Command: `yarn build`
   - Output Directory: `.svelte-kit/output/client`
   - Install Command: `yarn install`

3. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add the following variables:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration
PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Additional Integrations (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
N8N_BASE_URL=your_n8n_base_url
VONAGE_API_KEY=your_vonage_api_key
RETELL_API_KEY=your_retell_api_key
DIGITAL_OCEAN_TOKEN=your_digital_ocean_token
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your dashboard will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd dashboard
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add PUBLIC_SUPABASE_URL
   vercel env add PUBLIC_SUPABASE_ANON_KEY
   vercel env add PUBLIC_GOOGLE_CLIENT_ID
   vercel env add PUBLIC_GOOGLE_CLIENT_SECRET
   ```

## Configuration Details

### Vercel Adapter Configuration

The project uses `@sveltejs/adapter-vercel` with the following settings:

```javascript
// svelte.config.js
adapter: adapter({
  runtime: 'nodejs20.x',        // Node.js 20.x runtime
  regions: ['iad1'],            // US East (N. Virginia)
  split: false,                 // Don't split routes
  images: {
    sizes: [640, 828, 1200, 1920, 3840],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 300,
    domains: ['ednsy-dashboard.vercel.app']
  }
})
```

### Vercel Configuration File

The `vercel.json` file includes:

- **Build Commands**: Yarn-based build process
- **Function Configuration**: Node.js 20.x runtime with 1GB memory
- **Security Headers**: XSS protection, content type options
- **Redirects**: Clean URL handling

### Environment Variables

#### Required Variables

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration
PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Optional Variables (for integrations)

```env
# Stripe Integration
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# n8n Integration
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key

# Vonage Integration
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret

# Retell AI Integration
RETELL_API_KEY=your_retell_api_key

# Digital Ocean Integration
DIGITAL_OCEAN_TOKEN=your_digital_ocean_token

# Google Cloud Integration
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_PRIVATE_KEY=your_service_account_key
```

## Performance Optimizations

### Vercel Features Used

1. **Edge Functions**: Fast response times globally
2. **Image Optimization**: Automatic WebP/AVIF conversion
3. **Edge Caching**: Static assets cached at the edge
4. **Function Optimization**: 1GB memory allocation for complex operations

### Build Optimizations

- **Tree Shaking**: Unused code removed automatically
- **Code Splitting**: Routes loaded on demand
- **Asset Optimization**: CSS and JS minification
- **Bundle Analysis**: Built-in performance monitoring

## Monitoring and Analytics

### Custom Analytics

The dashboard includes PostHog analytics:

```env
VITE_POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_KEY=your_posthog_key
POSTHOG_HOST=https://us.i.posthog.com
```

## Security Considerations

### Environment Variables

- **Public Variables**: Only `PUBLIC_*` variables are exposed to client
- **Private Variables**: Server-side only, never exposed to client
- **Secret Management**: Use Vercel's secure environment variable storage

### Security Headers

The `vercel.json` includes security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify Supabase project is active

3. **Authentication Issues**
   - Verify Google OAuth redirect URIs
   - Check Supabase Auth settings
   - Ensure callback URLs are correct

4. **Performance Issues**
   - Monitor function execution times
   - Check bundle sizes
   - Optimize images and assets

### Debugging

1. **Local Testing**
   ```bash
   yarn build
   yarn preview
   ```

2. **Vercel Logs**
   - Check function logs in Vercel dashboard
   - Monitor build logs for errors
   - Review deployment status

3. **Environment Testing**
   ```bash
   vercel env pull .env.local
   yarn dev
   ```

## Custom Domains

### Adding Custom Domain

1. **In Vercel Dashboard**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

2. **Update Configuration**
   - Update `vercel.json` domains array
   - Update Supabase redirect URIs
   - Update Google OAuth redirect URIs

### SSL Certificate

- **Automatic**: Vercel provides free SSL certificates
- **Custom**: Upload your own certificate if needed
- **Renewal**: Automatic renewal handled by Vercel

## Scaling Considerations

### Free Tier Limits

- **Function Execution**: 100GB-hours/month
- **Bandwidth**: 100GB/month
- **Build Time**: 100 minutes/month
- **Serverless Functions**: 10 second timeout

### Pro Tier Benefits

- **Unlimited**: Function execution and bandwidth
- **Longer Timeouts**: Up to 900 seconds
- **More Memory**: Up to 3008MB per function
- **Multiple Regions**: Deploy to multiple edge locations

## Support

For deployment issues:

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **SvelteKit Documentation**: [svelte.dev/docs](https://svelte.dev/docs)
3. **Community Support**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps

After successful deployment:

1. **Test Authentication**: Verify Google OAuth flow works
2. **Monitor Performance**: Check PostHog analytics
3. **Set Up Monitoring**: Configure error tracking
4. **Add Integrations**: Connect additional services
5. **Customize Domain**: Add your custom domain 