import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load = async () => {
  // SPA: No session check here. Use client-side guard in the Svelte component.
  return {};
}; 