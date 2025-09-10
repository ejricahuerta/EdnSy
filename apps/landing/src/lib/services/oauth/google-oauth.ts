import { env } from '$env/dynamic/private';

// Get environment variables with fallbacks
const getGoogleClientId = () => env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const getGoogleClientSecret = () => env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';
const getGoogleRedirectUri = () => env.GOOGLE_REDIRECT_URI || 'https://yourdomain.com/auth/google/callback';

export interface GoogleTokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export class GoogleOAuthService {
  private static readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
  
  // Google API scopes for our integrations
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  /**
   * Generate OAuth authorization URL for Google
   */
  static getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: getGoogleClientId(),
      redirect_uri: getGoogleRedirectUri(),
      response_type: 'code',
      scope: this.SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      ...(state && { state })
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  static async exchangeCodeForTokens(code: string): Promise<GoogleTokenData> {
    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: getGoogleClientId(),
        client_secret: getGoogleClientSecret(),
        redirect_uri: getGoogleRedirectUri(),
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const data: GoogleTokenResponse = await response.json();
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      scope: data.scope,
      token_type: data.token_type,
    };
  }

  /**
   * Refresh an expired access token using the refresh token
   */
  static async refreshTokens(refreshToken: string): Promise<GoogleTokenData> {
    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: getGoogleClientId(),
        client_secret: getGoogleClientSecret(),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh tokens: ${error}`);
    }

    const data: GoogleTokenResponse = await response.json();
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token, // May be undefined for refresh
      expires_in: data.expires_in,
      scope: data.scope,
      token_type: data.token_type,
    };
  }

  /**
   * Revoke Google OAuth tokens
   */
  static async revokeTokens(accessToken: string): Promise<void> {
    const response = await fetch(this.REVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to revoke tokens: ${error}`);
    }
  }

  /**
   * Validate if a token is still valid by making a test API call
   */
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user info from Google using the access token
   */
  static async getUserInfo(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture: string;
  }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    return await response.json();
  }
}
