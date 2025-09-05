import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Log the error for debugging
      return redirect(303, '/login?error=' + encodeURIComponent(error.message));
    }
  }
  throw redirect(303, '/dashboard');
};