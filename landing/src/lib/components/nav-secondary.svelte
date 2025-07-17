<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { WithoutChildren } from "$lib/utils.js";
	import type { ComponentProps } from "svelte";
	import type { Icon } from "@tabler/icons-svelte";

	let {
		items,
		...restProps
	}: { items: { title: string; url: string; icon: Icon; onClick?: () => void }[] } & WithoutChildren<
		ComponentProps<typeof Sidebar.Group>
	> = $props();
</script>

<Sidebar.Group {...restProps}>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							{#if item.onClick}
								<button 
									onclick={item.onClick}
									class="w-full text-left"
									{...props}
								>
									<item.icon />
									<span>{item.title}</span>
								</button>
							{:else}
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{/if}
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
