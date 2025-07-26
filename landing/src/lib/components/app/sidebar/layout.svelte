<script lang="ts" module>
    import { Bot, Calendar, ChartLine, BotIcon, LifeBuoyIcon, SendIcon, CommandIcon } from "@lucide/svelte";
	const data = {
		user: {
			name: "Ed & Sy",
			email: "edmel@ednsy.com",
			avatar: "/avatars/ednsy.png",
		},// todo: needs real data from supabase
        navMain: [
            {
                title: "AI Assistant",
                url: "/demos/ai-assistant",
                icon: Bot,
            },
            {
                title: "Lead to Sale Automation",
                url: "/demos/automation-tasks",
                icon: Calendar,
            },
            {
                title: "Service Analytics",
                url: "/demos/data-insights",
                icon: ChartLine,
            },
            {
                title: "Full Business Operations",
                url: "/demos/business-operations",
                icon: Bot,
            },
        ]
	};
</script>

<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Nav from "./nav.svelte";
	import NavUser from "./nav-user.svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
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
