<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { ComponentProps } from "svelte";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...props
	}: ComponentProps<Textarea> = $props();
</script>

<Textarea
	bind:this={ref}
	bind:value
	data-slot="input-group-control"
	class={cn("min-w-0 flex-1 border-0 shadow-none focus-visible:ring-0", className)}
	{...props}
/>
