import { json, error } from '@sveltejs/kit';
import { TokenManager, type ServiceName } from '$lib/services/token-manager';
import { MCP_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Validate MCP API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw error(401, 'Missing or invalid Authorization header');
    }

    const providedApiKey = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (providedApiKey !== MCP_API_KEY) {
      throw error(401, 'Invalid MCP API key');
    }

    const { userId, serviceName } = await request.json();

    if (!userId) {
      throw error(400, 'userId is required');
    }

    if (!serviceName) {
      throw error(400, 'serviceName is required');
    }

    // Validate service name
    const validServices: ServiceName[] = ['google', 'notion', 'slack', 'stripe'];
    if (!validServices.includes(serviceName)) {
      throw error(400, `Invalid service: ${serviceName}`);
    }

    // Get valid token for the user and service
    const accessToken = await TokenManager.getValidToken(userId, serviceName);

    return json({
      success: true,
      access_token: accessToken,
      service: serviceName,
      user_id: userId,
    });

  } catch (err) {
    console.error('Error resolving MCP token:', err);
    
    if (err instanceof Error) {
      // If it's a token manager error, return more specific error
      if (err.message.includes('No') && err.message.includes('token found')) {
        throw error(404, `User has not connected ${err.message.split(' ')[1]} account`);
      }
      
      if (err.message.includes('expired')) {
        throw error(403, `Token expired and could not be refreshed: ${err.message}`);
      }
    }
    
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    throw error(500, 'Failed to resolve token');
  }
};

export const GET: RequestHandler = async ({ request, url }) => {
  try {
    // Validate MCP API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw error(401, 'Missing or invalid Authorization header');
    }

    const providedApiKey = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (providedApiKey !== MCP_API_KEY) {
      throw error(401, 'Invalid MCP API key');
    }

    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      throw error(400, 'userId query parameter is required');
    }

    // Get all connected services for the user
    const connectedServices = await TokenManager.getUserConnectedServices(userId);
    const tokenStatus = await TokenManager.validateUserTokens(userId);

    const services = connectedServices.map(service => ({
      service_name: service.service_name,
      connected_at: service.connected_at,
      expires_at: service.expires_at,
      scope: service.scope,
      status: tokenStatus[service.service_name] || {
        valid: false,
        expires_at: service.expires_at,
        needs_refresh: false,
      }
    }));

    return json({
      user_id: userId,
      connected_services: services,
      available_services: services.filter(s => s.status.valid).map(s => s.service_name),
    });

  } catch (err) {
    console.error('Error getting user services:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    throw error(500, 'Failed to get user services');
  }
};
