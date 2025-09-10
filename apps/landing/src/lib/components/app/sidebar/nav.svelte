<script lang="ts">
	import type { Component } from "svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	let {
		items,
	}: {
		items: {
			title: string;
			url: string;
			icon: Component;
			isActive?: boolean;
		}[];
	} = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Select Demo</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent={item.title} class="p-0 bg-transparent shadow-none">
					{#snippet child({ props })}
						<a
							href={item.url}
							{...props}
							class="flex items-center gap-2 w-full h-full px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-left text-sm no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
							style="text-decoration: none;"
						>
							<item.icon class="w-4 h-4" />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
