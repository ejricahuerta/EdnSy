<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...props
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		"group/input-group flex flex-row flex-wrap rounded-md border border-input",
		"[&_[data-slot=button]]:hover:bg-transparent [&_[data-slot=button]]:hover:text-inherit",
		className
	)}
	data-group="input-group"
	{...props}
>
	{@render children?.()}
</div>
