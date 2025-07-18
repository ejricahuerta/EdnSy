<script lang="ts">
	import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
	import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
	import CreditCardIcon from "@tabler/icons-svelte/icons/credit-card";
	import { MessageSquare, CheckSquare, Zap, Grid3X3, ChartBar } from '@lucide/svelte';
	import NavMain from "./nav-main.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { openConsultationPopup } from '$lib/stores/consultation';
	import { goto } from '$app/navigation';

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
				title: "All Demos",
				url: "/demos",
				icon: Grid3X3,
			},
			{
				title: "Customer Service Helper",
				url: "/demos/chatbot",
				icon: MessageSquare,
			},
			{
				title: "Business Health Checker",
				url: "/demos/data-insights",
				icon: ChartBar,
			},
			{
				title: "Task Automation Helper",
				url: "/demos/task-automation",
				icon: CheckSquare,
			},
			{
				title: "Business Problem Solver",
				url: "/demos/ai-assistant",
				icon: Zap,
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
	
	function handleLogoClick() {
		goto('/');
	}
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<button 
							onclick={handleLogoClick}
							class="w-full text-left cursor-pointer"
							{...props}
						>
							<InnerShadowTopIcon class="!size-5" />
							<span class="text-base font-semibold">Ed & Sy</span>
						</button>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavSecondary items={data.navSecondary} class="mt-auto bg-blue-500 text-white font-bold rounded-lg" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
