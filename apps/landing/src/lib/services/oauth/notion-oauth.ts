import { env } from '$env/dynamic/private';

// Get environment variables with fallbacks
const getNotionClientId = () => env.NOTION_CLIENT_ID || 'your_notion_client_id';
const getNotionClientSecret = () => env.NOTION_CLIENT_SECRET || 'your_notion_client_secret';
const getNotionRedirectUri = () => env.NOTION_REDIRECT_URI || 'https://yourdomain.com/auth/notion/callback';

export interface NotionTokenData {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_icon: string;
  workspace_id: string;
  owner: {
    type: string;
    user?: {
      object: string;
      id: string;
      name: string;
      avatar_url: string;
      type: string;
      person: {
        email: string;
      };
    };
  };
}

export interface NotionTokenResponse extends NotionTokenData {
  // Notion doesn't provide refresh tokens - tokens don't expire
}

export class NotionOAuthService {
  private static readonly AUTH_URL = 'https://api.notion.com/v1/oauth/authorize';
  private static readonly TOKEN_URL = 'https://api.notion.com/v1/oauth/token';
  
  /**
   * Generate OAuth authorization URL for Notion
   */
  static getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: getNotionClientId(),
      redirect_uri: getNotionRedirectUri(),
      response_type: 'code',
      owner: 'user',
      ...(state && { state })
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForTokens(code: string): Promise<NotionTokenData> {
    const credentials = Buffer.from(`${getNotionClientId()}:${getNotionClientSecret()}`).toString('base64');
    
    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: getNotionRedirectUri(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const data: NotionTokenResponse = await response.json();
    
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      bot_id: data.bot_id,
      workspace_name: data.workspace_name,
      workspace_icon: data.workspace_icon,
      workspace_id: data.workspace_id,
      owner: data.owner,
    };
  }

  /**
   * Notion tokens don't expire, so no refresh needed
   * This method exists for interface consistency
   */
  static async refreshTokens(refreshToken: string): Promise<NotionTokenData> {
    throw new Error('Notion tokens do not expire and cannot be refreshed');
  }

  /**
   * Revoke Notion OAuth tokens
   * Note: Notion doesn't provide a revoke endpoint, tokens are revoked by removing the integration
   */
  static async revokeTokens(accessToken: string): Promise<void> {
    // Notion doesn't have a revoke endpoint
    // Tokens are revoked by the user removing the integration from their workspace
    console.warn('Notion tokens cannot be programmatically revoked. User must remove integration from workspace.');
  }

  /**
   * Validate if a token is still valid by making a test API call
   */
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get bot user info from Notion using the access token
   */
  static async getBotInfo(accessToken: string): Promise<{
    object: string;
    id: string;
    name: string;
    avatar_url: string;
    type: string;
    bot: {
      owner: {
        type: string;
        workspace: boolean;
      };
      workspace_name: string;
    };
  }> {
    const response = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get bot info: ${error}`);
    }

    return await response.json();
  }

  /**
   * Search for databases accessible to the integration
   */
  static async searchDatabases(accessToken: string): Promise<any> {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          value: 'database',
          property: 'object'
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to search databases: ${error}`);
    }

    return await response.json();
  }
}
