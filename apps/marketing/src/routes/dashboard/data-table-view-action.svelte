<script lang="ts">
	import type { Prospect } from '$lib/server/prospects';
	import { Button } from '$lib/components/ui/button';
	import { Info } from 'lucide-svelte';

	let { prospect, onView }: { prospect: Prospect; onView: (p: Prospect) => void } = $props();
</script>

<Button
	variant="ghost"
	size="sm"
	class="text-[var(--sage)] hover:bg-[var(--sage)]/10 hover:text-[var(--sage-light)]"
	onclick={() => onView(prospect)}
	aria-label="View details"
>
	<Info class="h-4 w-4" />
</Button>
