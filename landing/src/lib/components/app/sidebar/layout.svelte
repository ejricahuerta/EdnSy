<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Nav from "./nav.svelte";
	import NavUser from "./nav-user.svelte";
	import { Bot, Calendar, ChartLine, BotIcon, LifeBuoyIcon, SendIcon, CommandIcon } from "@lucide/svelte";
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let user = $state({
		name: "Loading...",
		email: "loading@example.com"
	});

	const data = $derived({
		user: user,
		navMain: [
			{
				title: "AI Assistant",
				url: "/demos/ai-assistant",
				icon: Bot,
			},
			{
				title: "Automation Tasks",
				url: "/demos/automation-tasks",
				icon: Calendar,
			},
			{
				title: "Data Insights",
				url: "/demos/data-insights",
				icon: ChartLine,
			},
			{
				title: "Business Operations",
				url: "/demos/business-operations",
				icon: Bot,
			},
		]
	});

	onMount(async () => {
		console.log("onMount called in sidebar");
		try {
			const { data: { session }, error } = await supabase.auth.getSession();
			console.log("Session result:", { session, error });

			if (error) {
				console.error("Session error:", error);
				return;
			}

			if (session?.user) {
				console.log("User data from session:", {
					full_name: session.user.user_metadata?.full_name,
					name: session.user.user_metadata?.name,
					email: session.user.email,
					user_metadata: session.user.user_metadata
				});

				user = {
					name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Demo User",
					email: session.user.email || session.user.user_metadata?.email || "demo@ednsy.com",
				};
				console.log("Updated user data:", user);
			} else {
				console.log("No session found");
			}
		} catch (error) {
			console.error("Error in onMount:", error);
		}
	});
</script>

<Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div
								class="bg-sidebar-secondary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
                            <img src="/logo.png" alt="Ed & Sy" class="size-6" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">Ed & Sy</span>
								<span class="truncate text-xs">AI Enabler</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Nav items={data.navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
