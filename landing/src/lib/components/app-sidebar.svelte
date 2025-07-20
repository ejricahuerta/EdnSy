<script lang="ts" module>
    import { Bot, Calendar, ChartLine, BotIcon, LifeBuoyIcon, SendIcon, CommandIcon } from "@lucide/svelte";
	const data = {
		user: {
			name: "Ed & Sy",
			email: "edmel@ednsy.com",
			avatar: "/avatars/ednsy.png",
		},
        navMain: [
            {
                title: "Chatbot",
                url: "/demos/chatbot",
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

        ],
        navBundle: [
            {
                name: "AI Agent",
                url: "/demos/custom-ai",
                icon: Bot,
            },
        ],
		navSecondary: [
			{
				title: "Support",
				url: "#",
				icon: LifeBuoyIcon,
			},
			{
				title: "Feedback",
				url: "#",
				icon: SendIcon,
			},
		],
	};
</script>

<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import NavMain from "./nav-main.svelte";
	import NavBundle from "./nav-bundle.svelte";
	import NavSecondary from "./nav-secondary.svelte";
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
		<NavMain items={data.navMain} />
		<NavBundle navs={data.navBundle} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
