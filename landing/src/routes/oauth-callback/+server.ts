import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  const { jwt } = await request.json();
  if (!jwt) {
    return json({ error: 'Missing JWT' }, { status: 400 });
  }
  cookies.set('jwt', jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // Always false for localhost
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  console.log('[SvelteKit] Set JWT cookie');
  return json({ success: true });
} 