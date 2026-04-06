<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight } from 'lucide-svelte';

	let { prospectId }: { prospectId: string } = $props();

	const returnTo = '/dashboard/demos';
</script>

<Button
	variant="ghost"
	size="icon"
	class="h-8 w-8"
	aria-label="View details"
	onclick={() =>
		goto(`/dashboard/prospects/${prospectId}?returnTo=${encodeURIComponent(returnTo)}`)}
>
	<ChevronRight class="h-4 w-4" />
</Button>
