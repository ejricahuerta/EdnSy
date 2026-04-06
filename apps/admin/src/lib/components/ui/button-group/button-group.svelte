<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const buttonGroupVariants = tv({
		base: "has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg flex w-fit items-stretch [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
		variants: {
			orientation: {
				horizontal:
					"[&>[data-slot=button]:first-child]:rounded-l-lg! [&>[data-slot=button]:not(:has(~[data-slot=button]))]:rounded-r-lg! [&>[data-slot=button]]:rounded-r-none [&>[data-slot=button]~[data-slot=button]]:rounded-l-none [&>[data-slot=button]~[data-slot=button]]:border-l-0",
				vertical:
					"[&>[data-slot=button]:not(:has(~[data-slot=button]))]:rounded-b-lg! flex-col [&>[data-slot=button]]:rounded-b-none [&>[data-slot=button]~[data-slot=button]]:rounded-t-none [&>[data-slot=button]~[data-slot=button]]:border-t-0",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
		},
	});

	export type ButtonGroupOrientation = VariantProps<typeof buttonGroupVariants>["orientation"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		orientation = "horizontal",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: ButtonGroupOrientation;
	} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="button-group"
	data-orientation={orientation}
	class={cn(buttonGroupVariants({ orientation }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
