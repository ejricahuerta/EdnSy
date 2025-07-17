import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();
  if (user && user.sub) {
    throw redirect(302, '/');
  }
  return {};
}; 