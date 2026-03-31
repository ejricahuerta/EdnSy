import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';

const DEFAULT_DEBOUNCE_MS = 400;

/**
 * When the tab becomes visible or the window gains focus, debounce-refetch server data (Realtime fallback).
 */
export function visibilityInvalidateEffect(
	getEnabled: () => boolean,
	debounceMs = DEFAULT_DEBOUNCE_MS
): () => void {
	if (!browser) return () => {};

	let t: ReturnType<typeof setTimeout> | null = null;
	const run = () => {
		if (t) clearTimeout(t);
		t = setTimeout(() => {
			t = null;
			if (getEnabled()) void invalidateAll();
		}, debounceMs);
	};

	const onVis = () => {
		if (document.visibilityState === 'visible') run();
	};
	const onFocus = () => run();

	document.addEventListener('visibilitychange', onVis);
	window.addEventListener('focus', onFocus);

	return () => {
		document.removeEventListener('visibilitychange', onVis);
		window.removeEventListener('focus', onFocus);
		if (t) clearTimeout(t);
	};
}
