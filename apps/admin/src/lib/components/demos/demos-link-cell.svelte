<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import { normalizeExternalHref } from '$lib/externalUrl';

	let { demoLink }: { demoLink: string } = $props();
	const href = $derived(normalizeExternalHref(demoLink) ?? demoLink);
</script>

<a
	href={href}
	target="_blank"
	rel="noopener noreferrer"
	class="inline-flex max-w-[280px] items-center gap-1.5 truncate text-primary hover:underline"
	title={demoLink}
>
	<span class="truncate">{demoLink}</span>
	<ExternalLink class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
</a>
