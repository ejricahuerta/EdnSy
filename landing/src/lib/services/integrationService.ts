// integrationService: Handles Google token management API calls

export async function fetchGoogleAccessToken(clientId: string) {
  const res = await fetch(`/api/client/${clientId}/tokens`);
  if (!res.ok) throw new Error('Failed to fetch Google access token');
  return await res.json();
} 