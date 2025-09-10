import { error, redirect } from '@sveltejs/kit';
import { NotionOAuthService } from '$lib/services/oauth/notion-oauth';
import { TokenManager } from '$lib/services/token-manager';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // Check for OAuth errors
  if (errorParam) {
    console.error('Notion OAuth error:', errorParam);
    throw redirect(303, `/integrations?error=${encodeURIComponent('Notion authorization was denied or failed')}`);
  }

  if (!code) {
    throw redirect(303, `/integrations?error=${encodeURIComponent('No authorization code received from Notion')}`);
  }

  try {
    // Get the current user
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      throw redirect(303, '/login?error=' + encodeURIComponent('You must be logged in to connect Notion'));
    }

    // Exchange code for tokens
    const tokens = await NotionOAuthService.exchangeCodeForTokens(code);

    // Store tokens in database (Notion tokens don't expire)
    await TokenManager.storeTokens(user.id, 'notion', {
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      // No expires_in for Notion tokens
    });

    // Get bot info from Notion for verification
    const botInfo = await NotionOAuthService.getBotInfo(tokens.access_token);
    
    console.log('Notion integration successful for user:', user.email, 'Workspace:', tokens.workspace_name);

    // Redirect to integrations page with success message
    throw redirect(303, '/integrations?success=' + encodeURIComponent(`Notion workspace "${tokens.workspace_name}" connected successfully!`));

  } catch (err) {
    console.error('Error in Notion OAuth callback:', err);
    
    let errorMessage = 'Failed to connect Notion workspace';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    throw redirect(303, `/integrations?error=${encodeURIComponent(errorMessage)}`);
  }
};
