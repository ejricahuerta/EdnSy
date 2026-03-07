/** Re-export so callers avoid the identifier "invalidateAll" in Svelte files (Tailwind v4 can misparse it as CSS). */
export { invalidateAll as refreshRouteData } from '$app/navigation';
