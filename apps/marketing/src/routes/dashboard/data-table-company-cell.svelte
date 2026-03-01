<script lang="ts">
	import type { Prospect } from '$lib/server/prospects';

	let { prospect, onView }: { prospect: Prospect; onView: (p: Prospect) => void } = $props();
</script>

<button
	type="button"
	class="font-medium text-[var(--sage)] hover:text-[var(--sage-light)] hover:underline text-left"
	onclick={() => onView(prospect)}
>
	{prospect.companyName}
</button>
