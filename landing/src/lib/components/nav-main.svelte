<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentType } from "svelte";
	import { goto } from '$app/navigation';

	let { items }: { items: { title: string; url: string; icon?: ComponentType }[] } = $props();
	
	function handleNavigation(url: string) {
		goto(url);
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<button 
								onclick={() => handleNavigation(item.url)}
								class="w-full text-left cursor-pointer"
								{...props}
							>
								{#if item.icon}
									<item.icon />
								{/if}
								<span>{item.title}</span>
							</button>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
