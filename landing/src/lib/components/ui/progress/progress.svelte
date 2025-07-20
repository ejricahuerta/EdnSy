<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		value?: number;
		max?: number;
	};

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let value: $$Props['value'] = 0;
	export let max: $$Props['max'] = 100;

	$: percentage = Math.min(Math.max(((value || 0) / (max || 100)) * 100, 0), 100);
</script>

<div
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin="0"
	aria-valuemax={max}
	class={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
>
	<div
		class="h-full w-full flex-1 bg-primary transition-all"
		style="width: {percentage}%"
	></div>
</div> 