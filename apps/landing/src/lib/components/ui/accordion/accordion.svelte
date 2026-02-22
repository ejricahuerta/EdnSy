<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<
		AccordionPrimitive.RootProps & HTMLAttributes<HTMLDivElement>
	>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AccordionPrimitive.Root
	bind:ref
	data-slot="accordion"
	class={cn("w-full", className)}
	{...restProps}
>
	{@render children?.()}
</AccordionPrimitive.Root>
