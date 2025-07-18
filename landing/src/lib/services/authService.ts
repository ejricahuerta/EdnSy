// AuthService: Handles authentication API calls

import { config } from '$lib/config';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5235';

interface AuthError extends Error {
  status?: number;
  code?: string;
}

class AuthServiceError extends Error implements AuthError {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export async function exchangeGoogleCodeForJwt(code: string, state: string) {
  try {
    const res = await fetch(`${API_HOST}/oauth-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        state, 
        redirectUri: config.oauth.redirectUri
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new AuthServiceError(`Failed to exchange code for JWT: ${errorText}`, res.status);
    }
    
    const data = await res.json();
    
    if (!data.jwt) {
      throw new AuthServiceError('No JWT received from server', 400, 'NO_JWT');
    }
    
    return data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Network error exchanging code for JWT', undefined, 'NETWORK_ERROR');
  }
}

export { AuthServiceError }; 