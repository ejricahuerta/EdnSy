<script lang="ts">
	import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
	import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
	import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
	import SettingsIcon from "@tabler/icons-svelte/icons/settings";
	import CreditCardIcon from "@tabler/icons-svelte/icons/credit-card";
	import NavMain from "./nav-main.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { openConsultationPopup } from '$lib/stores/consultation';

	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';
	
	let currentUser = $derived($page.data.user);
	
	let data = $derived({
		user: {
			name: currentUser?.email?.split('@')[0] || "User",
			email: currentUser?.email || "user@example.com",
			avatar: "/avatars/user.jpg",
		},
		navMain: [
			{
				title: "Home",
				url: "/app/home",
				icon: DashboardIcon,
			},
			{
				title: "Demos",
				url: "/app/demos",
				icon: FileAiIcon,
			},
			{
				title: "Settings",
				url: "/app/settings",
				icon: SettingsIcon,
			},
		],
		navSecondary: [
			{
				title: "Ready for AI?",
				url: "#",
				icon: CreditCardIcon,
				onClick: () => openConsultationPopup(),
			},
		],
	});

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="/app/home" {...props}>
							<InnerShadowTopIcon class="!size-5" />
							<span class="text-base font-semibold">Ed & Sy</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
