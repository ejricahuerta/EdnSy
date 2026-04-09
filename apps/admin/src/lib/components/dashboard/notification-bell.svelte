<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Bell } from 'lucide-svelte';
	import {
		notificationHistory,
		clearDashboardNotificationHistory,
		type NotificationHistoryEntry
	} from '$lib/notificationHistory';

	let items = $state<NotificationHistoryEntry[]>([]);

	$effect(() => {
		const unsub = notificationHistory.subscribe((v) => {
			items = v;
		});
		return () => unsub();
	});

	const kindClass: Record<NotificationHistoryEntry['kind'], string> = {
		success: 'text-green-600 dark:text-green-400',
		error: 'text-destructive',
		info: 'text-muted-foreground',
		warning: 'text-amber-600 dark:text-amber-400'
	};

	const countLabel = $derived(items.length > 99 ? '99+' : String(items.length));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="data-[state=open]:bg-accent text-muted-foreground relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
		aria-label="Prospect updates"
		title="Prospect updates"
	>
		<Bell class="h-[1.2rem] w-[1.2rem]" />
		{#if items.length > 0}
			<span
				class="pointer-events-none absolute end-0.5 top-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-primary-foreground ring-2 ring-background"
				aria-hidden="true"
			>
				{countLabel}
			</span>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		align="end"
		class="max-h-[min(24rem,var(--bits-dropdown-menu-content-available-height))] w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] p-0 sm:w-80"
	>
		<div class="border-b px-3 py-2">
			<p class="text-sm font-medium">Prospect updates</p>
		</div>
		<div class="max-h-64 overflow-y-auto px-2 py-2">
			{#if items.length === 0}
				<p class="px-2 py-6 text-center text-sm text-muted-foreground">No recent activity</p>
			{:else}
				<ul class="list-none space-y-2 p-0 m-0">
					{#each items as entry (entry.id)}
						<li class="rounded-md px-2 py-1.5 text-xs leading-snug {kindClass[entry.kind]}">
							<span class="text-muted-foreground tabular-nums">
								{new Date(entry.at).toLocaleTimeString(undefined, {
									hour: 'numeric',
									minute: '2-digit',
									second: '2-digit'
								})}
							</span>
							<span class="ms-2 text-foreground">{entry.text}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<DropdownMenu.Separator class="my-0" />
		<div class="p-1">
			<DropdownMenu.Item
				class="justify-center text-center text-sm"
				disabled={items.length === 0}
				onclick={() => clearDashboardNotificationHistory()}
			>
				Clear all
			</DropdownMenu.Item>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
