import { json, error } from '@sveltejs/kit';
import { TokenManager } from '$lib/services/token-manager';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      throw error(401, 'User not authenticated');
    }

    // Get connected services
    const connectedServices = await TokenManager.getUserConnectedServices(user.id);
    
    // Validate tokens and get their status
    const tokenStatus = await TokenManager.validateUserTokens(user.id);

    // Combine the data
    const integrationsStatus = connectedServices.map(service => ({
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
      user_id: user.id,
      connected_services: integrationsStatus,
      total_connected: connectedServices.length,
    });

  } catch (err) {
    console.error('Error getting integration status:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    throw error(500, 'Failed to get integration status');
  }
};
