import { json, error } from '@sveltejs/kit';
import { TokenManager, type ServiceName } from '$lib/services/token-manager';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      throw error(401, 'User not authenticated');
    }

    const { service } = await request.json();

    if (!service) {
      throw error(400, 'Service name is required');
    }

    // Validate service name
    const validServices: ServiceName[] = ['google', 'notion', 'slack', 'stripe'];
    if (!validServices.includes(service)) {
      throw error(400, `Invalid service: ${service}`);
    }

    // Check if service is connected
    const isConnected = await TokenManager.isServiceConnected(user.id, service);
    if (!isConnected) {
      throw error(404, `${service} is not connected`);
    }

    // Remove tokens (this also revokes them with the service)
    await TokenManager.removeTokens(user.id, service);

    return json({ 
      success: true,
      service,
      message: `${service} disconnected successfully`
    });

  } catch (err) {
    console.error('Error disconnecting service:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    throw error(500, 'Failed to disconnect service');
  }
};
