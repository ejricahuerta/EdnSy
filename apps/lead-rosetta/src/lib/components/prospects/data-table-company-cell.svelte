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
	<span class="block min-w-0 truncate max-w-[14rem] sm:max-w-[18rem]" title={name}>
		{name || '—'}
	</span>
</Button>
