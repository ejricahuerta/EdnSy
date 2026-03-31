import type { Session, SupabaseClient } from '@supabase/supabase-js';

declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
}

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			getSession: () => Promise<Session | null>;
		}
		interface PageData {
			/** Injected when using SUPABASE_URL + SUPABASE_ANON_KEY without PUBLIC_* */
			supabasePublic?: { url: string; anonKey: string } | null;
		}
	}
}

export {};
