import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete('jwt', { path: '/' });
  // Redirect to a logout page that clears the user store
  throw redirect(302, '/logout/clear');
}; 