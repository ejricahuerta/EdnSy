<script lang="ts">
	/**
	 * Demo page tracking: page view on load, and "hot lead" when prospect stays 2+ minutes.
	 * Pings the API so the sender can be notified (page view + hot lead).
	 */
	let {
		prospectId,
		demoPath = ''
	}: {
		prospectId: string;
		demoPath?: string;
	} = $props();

	const HOT_LEAD_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
	let pageViewSent = $state(false);
	let hotLeadSent = $state(false);

	$effect(() => {
		if (typeof window === 'undefined' || !prospectId || pageViewSent) return;
		pageViewSent = true;
		fetch('/api/demo/track', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				prospectId,
				event: 'page_view',
				path: demoPath || (typeof window !== 'undefined' ? window.location.pathname : '')
			})
		}).catch(() => {});
	});

	$effect(() => {
		if (typeof window === 'undefined' || !prospectId || hotLeadSent) return;
		const t = setTimeout(() => {
			hotLeadSent = true;
			fetch('/api/demo/track', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prospectId,
					event: 'time_on_page_2min',
					path: demoPath || (typeof window !== 'undefined' ? window.location.pathname : '')
				})
			}).catch(() => {});
		}, HOT_LEAD_THRESHOLD_MS);
		return () => clearTimeout(t);
	});
</script>
