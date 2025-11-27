// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			// No authentication locals needed
		}
		interface PageData {
			// No authentication data needed
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

