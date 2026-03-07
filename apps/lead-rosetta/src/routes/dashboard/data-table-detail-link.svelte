<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	let { prospectId }: { prospectId: string } = $props();
	const href = $derived(`/dashboard/prospects/${prospectId}`);
</script>

<a
	href={href}
	class="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
	aria-label="View prospect details"
>
	<ChevronRight class="h-4 w-4" />
</a>
