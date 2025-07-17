// See https://kit.svelte.dev/docs/types#app
import type { JwtPayload } from 'jsonwebtoken';

declare module '@sveltejs/kit' {
  interface Locals {
    user: JwtPayload | null;
  }
}
