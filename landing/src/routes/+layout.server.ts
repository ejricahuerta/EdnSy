import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, locals, cookies }) => {
  let userProfile = null;
  if (locals.user?.sub) {
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
      console.warn('Backend not available, using mock user profile');
      // Mock user profile for development
      userProfile = {
        id: locals.user.sub,
        email: locals.user.email,
        name: locals.user.name,
        organization: {
          id: 'mock-org-id',
          name: 'Mock Organization'
        }
      };
    }
  }
  return {
    user: locals.user,
    userProfile
  };
}