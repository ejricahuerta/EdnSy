import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
  // Check if user is authenticated
  if (!locals.user?.sub) {
    throw redirect(302, '/login');
  }

  // Fetch user profile
  let userProfile = null;
  try {
    const res = await fetch('http://localhost:5235/user/profile', {
      headers: {
        // The JWT is sent as a cookie, so no need for Authorization header
      },
      credentials: 'include'
    });
    if (res.ok) {
      userProfile = await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    // Don't set mock data, let the frontend handle the missing profile
  }

  return {
    user: locals.user,
    userProfile
  };
}; 