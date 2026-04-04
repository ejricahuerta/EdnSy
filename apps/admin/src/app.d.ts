import type { Session, SupabaseClient } from '@supabase/supabase-js';

declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
}

declare global {
	namespace App {
		interface Locals {
			/** PostgREST schema may be `public` or `dev` (SUPABASE_DB_SCHEMA or PUBLIC_SUPABASE_DB_SCHEMA). */
			supabase: SupabaseClient<any, 'public' | 'dev', 'public' | 'dev'>;
			getSession: () => Promise<Session | null>;
		}
		interface PageData {
			/** Injected when using SUPABASE_URL + SUPABASE_ANON_KEY without PUBLIC_* */
			supabasePublic?: { url: string; anonKey: string } | null;
			/** Resolved from SUPABASE_DB_SCHEMA (server) or PUBLIC_SUPABASE_DB_SCHEMA */
			supabaseDbSchema?: 'public' | 'dev';
		}
	}
}

export {};
