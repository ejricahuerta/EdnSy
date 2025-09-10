import { json, error } from '@sveltejs/kit';
import { NotionOAuthService } from '$lib/services/oauth/notion-oauth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      throw error(401, 'User not authenticated');
    }

    const { service, returnUrl } = await request.json();

    if (!service) {
      throw error(400, 'Service name is required');
    }

    let authUrl: string;
    const state = returnUrl ? JSON.stringify({ returnUrl, userId: user.id }) : user.id;

    switch (service) {
      case 'gmail':
      case 'google-calendar':
      case 'google-drive':
      case 'google-sheets':
        // Use Supabase OAuth for Google services
        const { data, error: oauthError } = await locals.supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${returnUrl || 'http://localhost:5173'}/auth/callback?redirect=${encodeURIComponent(returnUrl || '/integrations')}`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
              scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
            }
          }
        });
        
        if (oauthError) {
          throw error(500, `Failed to initiate Google OAuth: ${oauthError.message}`);
        }
        
        authUrl = data.url;
        break;
        
      case 'notion':
        authUrl = NotionOAuthService.getAuthUrl(state);
        break;
        
      case 'slack':
        // TODO: Implement when Slack OAuth service is created
        throw error(501, 'Slack integration not yet implemented');
        
      case 'telegram':
        // TODO: Implement when Telegram integration is created
        throw error(501, 'Telegram integration not yet implemented');
        
      case 'whatsapp':
        // TODO: Implement when WhatsApp integration is created
        throw error(501, 'WhatsApp integration not yet implemented');
        
      case 'stripe':
        // TODO: Implement when Stripe OAuth service is created
        throw error(501, 'Stripe integration not yet implemented');
        
      default:
        throw error(400, `Unknown service: ${service}`);
    }

    return json({ 
      authUrl,
      service,
      message: `Redirecting to ${service} for authorization...`
    });

  } catch (err) {
    console.error('Error initiating OAuth flow:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    throw error(500, 'Failed to initiate OAuth flow');
  }
};
