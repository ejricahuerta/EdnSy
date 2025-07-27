import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  console.log('OAuth code:', code);
  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
    console.log('Exchange result:', data, error);
    if (error) {
      // Log the error for debugging
      return redirect(303, '/login?error=' + encodeURIComponent(error.message));
    }
  }
  throw redirect(303, '/demos');
};