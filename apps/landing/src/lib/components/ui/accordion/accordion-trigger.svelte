<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<
		AccordionPrimitive.TriggerProps & HTMLButtonAttributes
	>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AccordionPrimitive.Header class="flex">
	<AccordionPrimitive.Trigger
		bind:ref
		data-slot="accordion-trigger"
		class={cn(
			"flex flex-1 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-foreground outline-none transition-all hover:bg-muted/50 hover:underline focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180 disabled:pointer-events-none disabled:opacity-50",
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
