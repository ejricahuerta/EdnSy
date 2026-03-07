<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle } from 'lucide-svelte';

	let {
		label,
		variant,
		showSpinner = false
	}: { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; showSpinner?: boolean } =
		$props();
</script>

<Badge
	{variant}
	class="inline-flex items-center gap-1.5"
>
	{#if showSpinner}
		<LoaderCircle class="size-4 shrink-0 animate-spin text-current" aria-hidden="true" />
	{/if}
	<span class="whitespace-nowrap">{label}</span>
</Badge>
