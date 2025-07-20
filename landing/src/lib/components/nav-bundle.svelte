<script lang="ts">
	import type { Component } from "svelte";
	import FolderIcon from "@lucide/svelte/icons/folder";
	import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
	import ShareIcon from "@lucide/svelte/icons/share";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	let {
		navs,
	}: {
		navs: {
			name: string;
			url: string;
			icon: Component;
		}[];
	} = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Custom AI Development</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each navs as item (item.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.name}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
