// @ts-ignore: Suppress missing types for jsonwebtoken
import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';

declare module '@sveltejs/kit' {
  interface Locals {
    user: any;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('jwt');
  if (token) {
    try {
      (event.locals as any).user = jwt.decode(token);
      console.log('[SvelteKit] Decoded user:', (event.locals as any).user);
    } catch {
      (event.locals as any).user = null;
      console.log('[SvelteKit] Failed to decode JWT');
    }
  } else {
    (event.locals as any).user = null;
    console.log('[SvelteKit] No JWT cookie');
  }
  return resolve(event);
}; 