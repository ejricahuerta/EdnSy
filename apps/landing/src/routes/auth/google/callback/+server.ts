import { error, redirect } from '@sveltejs/kit';
import { GoogleOAuthService } from '$lib/services/oauth/google-oauth';
import { TokenManager } from '$lib/services/token-manager';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // Check for OAuth errors
  if (errorParam) {
    console.error('Google OAuth error:', errorParam);
    throw redirect(303, `/integrations?error=${encodeURIComponent('Google authorization was denied or failed')}`);
  }

  if (!code) {
    throw redirect(303, `/integrations?error=${encodeURIComponent('No authorization code received from Google')}`);
  }

  try {
    // Get the current user
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      throw redirect(303, '/login?error=' + encodeURIComponent('You must be logged in to connect Google'));
    }

    // Exchange code for tokens
    const tokens = await GoogleOAuthService.exchangeCodeForTokens(code);

    // Store tokens in database
    await TokenManager.storeTokens(user.id, 'google', tokens);

    // Get user info from Google for verification
    const userInfo = await GoogleOAuthService.getUserInfo(tokens.access_token);
    
    console.log('Google integration successful for user:', user.email, 'Google account:', userInfo.email);

    // Redirect to integrations page with success message
    throw redirect(303, '/integrations?success=' + encodeURIComponent('Google account connected successfully!'));

  } catch (err) {
    console.error('Error in Google OAuth callback:', err);
    
    let errorMessage = 'Failed to connect Google account';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    throw redirect(303, `/integrations?error=${encodeURIComponent(errorMessage)}`);
  }
};
