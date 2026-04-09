<script lang="ts">
	import type { Prospect } from '$lib/server/prospects';
	import { Button } from '$lib/components/ui/button';

	let { prospect, onView }: { prospect: Prospect; onView: (p: Prospect) => void } = $props();

	const name = $derived(prospect.companyName ?? '');
</script>

<Button
	type="button"
	variant="link"
	class="font-medium p-0 h-auto justify-start min-w-0 max-w-full"
	onclick={() => onView(prospect)}
	title={name}
>
	<span
		class="block min-w-0 max-w-full hyphens-auto break-words text-start sm:max-w-[18rem] sm:truncate sm:break-normal sm:hyphens-none"
		title={name}
	>
		{name || '—'}
	</span>
</Button>
