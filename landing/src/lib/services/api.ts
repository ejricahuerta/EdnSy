const API_HOST = import.meta.env.VITE_API_HOST;

export async function fetchUserProfile() {
  const res = await fetch(`${API_HOST}/api/user`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return await res.json();
} 