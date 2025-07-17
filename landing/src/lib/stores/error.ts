import { writable } from 'svelte/store';

export const error = writable<string | null>(null);

export function setError(message: string) {
  error.set(message);
}

export function clearError() {
  error.set(null);
} 