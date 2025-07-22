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
				<Sidebar.MenuButton tooltipContent={item.title} class="w-full cursor-pointer" onclick={() => { goto(item.url) }} >
						<div class="flex items-center gap-2">
							<item.icon class="w-4 h-4" />
							<span>{item.title}</span>
						</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
