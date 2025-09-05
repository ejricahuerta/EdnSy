import { supabase, type OAuthToken } from '$lib/supabase';
import { GoogleOAuthService, type GoogleTokenData } from './oauth/google-oauth';
import { NotionOAuthService, type NotionTokenData } from './oauth/notion-oauth';

export type ServiceName = 'google' | 'notion' | 'slack' | 'stripe';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type: string;
  [key: string]: any; // For service-specific data
}

export class TokenManager {
  /**
   * Get a valid access token for a user and service
   * Automatically refreshes if token is expired
   */
  static async getValidToken(userId: string, serviceName: ServiceName): Promise<string> {
    // Get current token from database
    const { data: tokenRecord, error } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
      .single();

    if (error || !tokenRecord) {
      throw new Error(`No ${serviceName} token found for user`);
    }

    // Check if token is expired
    if (tokenRecord.expires_at) {
      const expiresAt = new Date(tokenRecord.expires_at);
      const now = new Date();
      const bufferMinutes = 5; // Refresh 5 minutes before expiry
      
      if (now >= new Date(expiresAt.getTime() - bufferMinutes * 60 * 1000)) {
        // Token is expired or about to expire, refresh it
        if (tokenRecord.refresh_token) {
          return await this.refreshAndStoreToken(userId, serviceName, tokenRecord.refresh_token);
        } else {
          throw new Error(`${serviceName} token is expired and cannot be refreshed`);
        }
      }
    }

    return tokenRecord.access_token;
  }

  /**
   * Store OAuth tokens for a user and service
   */
  static async storeTokens(
    userId: string, 
    serviceName: ServiceName, 
    tokens: TokenData
  ): Promise<void> {
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const tokenRecord: OAuthToken = {
      id: '', // Will be generated
      user_id: userId,
      service_name: serviceName,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: expiresAt,
      scope: tokens.scope || null,
      token_type: tokens.token_type,
      created_at: '', // Will be generated
      updated_at: '', // Will be generated
    };

    const { error } = await supabase
      .from('user_oauth_tokens')
      .upsert(tokenRecord, {
        onConflict: 'user_id,service_name'
      });

    if (error) {
      throw new Error(`Failed to store ${serviceName} tokens: ${error.message}`);
    }
  }

  /**
   * Remove tokens for a user and service
   */
  static async removeTokens(userId: string, serviceName: ServiceName): Promise<void> {
    // First, try to revoke the token with the service
    try {
      const token = await this.getValidToken(userId, serviceName);
      await this.revokeTokenWithService(serviceName, token);
    } catch (error) {
      // If we can't revoke, we'll still remove from our database
      console.warn(`Failed to revoke ${serviceName} token:`, error);
    }

    const { error } = await supabase
      .from('user_oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('service_name', serviceName);

    if (error) {
      throw new Error(`Failed to remove ${serviceName} tokens: ${error.message}`);
    }
  }

  /**
   * Get all connected services for a user
   */
  static async getUserConnectedServices(userId: string): Promise<{
    service_name: ServiceName;
    connected_at: string;
    expires_at: string | null;
    scope: string | null;
  }[]> {
    const { data, error } = await supabase
      .from('user_oauth_tokens')
      .select('service_name, created_at, expires_at, scope')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get connected services: ${error.message}`);
    }

    return data.map(token => ({
      service_name: token.service_name as ServiceName,
      connected_at: token.created_at,
      expires_at: token.expires_at,
      scope: token.scope,
    }));
  }

  /**
   * Check if a user has a specific service connected
   */
  static async isServiceConnected(userId: string, serviceName: ServiceName): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_oauth_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
      .single();

    return !error && !!data;
  }

  /**
   * Refresh a token using the appropriate service
   */
  private static async refreshAndStoreToken(
    userId: string, 
    serviceName: ServiceName, 
    refreshToken: string
  ): Promise<string> {
    let newTokens: TokenData;

    switch (serviceName) {
      case 'google':
        newTokens = await GoogleOAuthService.refreshTokens(refreshToken);
        break;
      case 'notion':
        throw new Error('Notion tokens do not expire and cannot be refreshed');
      case 'slack':
        // TODO: Implement when Slack OAuth service is created
        throw new Error('Slack token refresh not implemented yet');
      case 'stripe':
        // TODO: Implement when Stripe OAuth service is created
        throw new Error('Stripe token refresh not implemented yet');
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }

    // Store the new tokens
    await this.storeTokens(userId, serviceName, newTokens);

    return newTokens.access_token;
  }

  /**
   * Revoke token with the actual service
   */
  private static async revokeTokenWithService(serviceName: ServiceName, accessToken: string): Promise<void> {
    switch (serviceName) {
      case 'google':
        await GoogleOAuthService.revokeTokens(accessToken);
        break;
      case 'notion':
        await NotionOAuthService.revokeTokens(accessToken);
        break;
      case 'slack':
        // TODO: Implement when Slack OAuth service is created
        console.warn('Slack token revocation not implemented yet');
        break;
      case 'stripe':
        // TODO: Implement when Stripe OAuth service is created
        console.warn('Stripe token revocation not implemented yet');
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
   * Validate all tokens for a user and return their status
   */
  static async validateUserTokens(userId: string): Promise<{
    [K in ServiceName]?: {
      valid: boolean;
      expires_at: string | null;
      needs_refresh: boolean;
    };
  }> {
    const { data: tokens, error } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user tokens: ${error.message}`);
    }

    const status: ReturnType<typeof TokenManager.validateUserTokens> = {};

    for (const token of tokens || []) {
      const serviceName = token.service_name as ServiceName;
      let valid = false;
      let needsRefresh = false;

      // Check expiration
      if (token.expires_at) {
        const expiresAt = new Date(token.expires_at);
        const now = new Date();
        const bufferMinutes = 5;
        
        if (now >= new Date(expiresAt.getTime() - bufferMinutes * 60 * 1000)) {
          needsRefresh = true;
        }
      }

      // Validate with service
      try {
        switch (serviceName) {
          case 'google':
            valid = await GoogleOAuthService.validateToken(token.access_token);
            break;
          case 'notion':
            valid = await NotionOAuthService.validateToken(token.access_token);
            break;
          default:
            valid = true; // Assume valid for services not yet implemented
        }
      } catch (error) {
        valid = false;
      }

      status[serviceName] = {
        valid,
        expires_at: token.expires_at,
        needs_refresh: needsRefresh,
      };
    }

    return status;
  }
}
