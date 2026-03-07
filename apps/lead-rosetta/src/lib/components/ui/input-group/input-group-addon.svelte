<script lang="ts">
	import { tv, type VariantProps } from "tailwind-variants";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export const inputGroupAddonVariants = tv({
		base: "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
		variants: {
			align: {
				"inline-start":
					"order-first ps-3 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem]",
				"inline-end":
					"order-last pe-3 has-[>button]:me-[-0.45rem] has-[>kbd]:me-[-0.35rem]",
				"block-start":
					"order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
				"block-end":
					"order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	});

	export type InputGroupAddonAlign = VariantProps<typeof inputGroupAddonVariants>["align"];

	let {
		ref = $bindable(null),
		class: className,
		children,
		align = "inline-start",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: InputGroupAddonAlign;
	} = $props();

	function handleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest("button")) {
			return;
		}
		(e.currentTarget as HTMLElement).parentElement?.querySelector("input, textarea")?.focus();
	}
</script>

<div
	bind:this={ref}
	class={cn(inputGroupAddonVariants({ align }), className)}
	onclick={handleClick}
	role="presentation"
	{...restProps}
>
	{@render children?.()}
</div>
