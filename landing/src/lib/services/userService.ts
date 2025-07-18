// userService: Handles user profile API calls

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5235';

export async function fetchCurrentUser() {
  const res = await fetch(`${API_HOST}/user/profile`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return await res.json();
}

export async function updateUserProfile(data: any) {
  const res = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return await res.json();
} 