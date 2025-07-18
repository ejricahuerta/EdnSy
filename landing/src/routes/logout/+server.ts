import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, url }) => {
  // Clear the JWT cookie
  cookies.delete('jwt', { path: '/' });
  
  // Get redirect parameter or default to login
  const redirectTo = url.searchParams.get('redirect') || '/login';
  
  throw redirect(302, redirectTo);
}; 