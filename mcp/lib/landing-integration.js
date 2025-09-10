/**
 * Landing App Integration for MCP Server
 * 
 * This module provides integration with the EdnSy landing app to resolve
 * user OAuth tokens for API calls.
 */

import { config } from '../config.js';

export class LandingIntegration {
  constructor() {
    this.landingAppUrl = process.env.LANDING_APP_URL || 'http://localhost:5173';
    this.mcpApiKey = process.env.MCP_API_KEY;
    
    // For testing purposes, allow running without API key
    this.isEnabled = !!this.mcpApiKey;
    
    if (!this.isEnabled) {
      console.warn('Landing integration is disabled - MCP_API_KEY not set');
    }
  }

  /**
   * Get a valid OAuth token for a user and service
   */
  async getToken(userId, serviceName) {
    if (!this.isEnabled) {
      throw new Error('Landing integration is disabled. Set MCP_API_KEY to enable.');
    }

    try {
      const response = await fetch(`${this.landingAppUrl}/api/mcp/tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.mcpApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          serviceName,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get token: ${response.status} ${error}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error(`Error getting ${serviceName} token for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all connected services for a user
   */
  async getUserServices(userId) {
    if (!this.isEnabled) {
      throw new Error('Landing integration is disabled. Set MCP_API_KEY to enable.');
    }

    try {
      const response = await fetch(`${this.landingAppUrl}/api/mcp/tokens?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.mcpApiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get user services: ${response.status} ${error}`);
      }

      const data = await response.json();
      return data.available_services || [];
    } catch (error) {
      console.error(`Error getting services for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Validate that a user has a specific service connected
   */
  async hasService(userId, serviceName) {
    if (!this.isEnabled) {
      // For testing, assume all services are available
      return true;
    }

    try {
      const services = await this.getUserServices(userId);
      return services.includes(serviceName);
    } catch (error) {
      console.error(`Error checking ${serviceName} for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user authentication context for MCP tools
   */
  async getUserAuthContext(userId) {
    if (!this.isEnabled) {
      // For testing, return mock auth context
      return {
        notion: { access_token: 'test-notion-token' },
        google: { access_token: 'test-google-token' }
      };
    }

    try {
      const services = await this.getUserServices(userId);
      
      const authContext = {};
      
      for (const serviceName of services) {
        try {
          const token = await this.getToken(userId, serviceName);
          authContext[serviceName] = {
            access_token: token,
            service_name: serviceName,
          };
        } catch (error) {
          console.warn(`Failed to get ${serviceName} token for user ${userId}:`, error);
        }
      }

      return authContext;
    } catch (error) {
      console.error(`Error getting auth context for user ${userId}:`, error);
      return {};
    }
  }
}

// Create a singleton instance
export const landingIntegration = new LandingIntegration();
