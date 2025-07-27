// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<any>;
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

