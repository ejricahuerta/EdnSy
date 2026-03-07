<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		/** Named snippet for asChild + builder pattern. Use this instead of default children + let:builder to avoid Svelte 5 invalid_default_snippet. */
		trigger,
		...restProps
	}: Omit<AlertDialogPrimitive.TriggerProps, 'child'> & {
		children?: Snippet;
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

</script>

<AlertDialogPrimitive.Trigger
	bind:ref
	class={cn(className)}
	child={trigger ?? children}
	{...restProps}
/>
