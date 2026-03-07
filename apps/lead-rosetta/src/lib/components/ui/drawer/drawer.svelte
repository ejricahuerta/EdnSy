<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	let {
		shouldScaleBackground = false,
		direction = "bottom",
		open = $bindable(false),
		activeSnapPoint = $bindable(null),
		...restProps
	}: DrawerPrimitive.RootProps = $props();
</script>

<DrawerPrimitive.Root {shouldScaleBackground} {direction} bind:open bind:activeSnapPoint {...restProps} />
