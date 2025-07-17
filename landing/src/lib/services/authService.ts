// AuthService: Handles authentication API calls

const API_HOST = import.meta.env.VITE_API_HOST;

export async function loginWithGoogle(code: string, state: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', code, state })
  });
  if (!res.ok) throw new Error('Login failed');
  return await res.json();
}

export async function logout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return await res.json();
}

export async function getGoogleOAuthUrl() {
  const res = await fetch('/api/user/connect/google', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to get Google OAuth URL');
  return await res.json();
}

export async function exchangeGoogleCodeForJwt(code: string, state: string) {
  const res = await fetch(`${API_HOST}/oauth-callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state, redirectUri: window.location.origin + '/oauth-callback' })
  });
  if (!res.ok) throw new Error('Failed to exchange code for JWT');
  return await res.json();
} 