<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Nav from "./nav.svelte";
	import { Bot, Calendar, ChartLine, BotIcon, LifeBuoyIcon, SendIcon, CommandIcon, HomeIcon } from "@lucide/svelte";
	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	const data = $derived({
		navMain: [
			{
				title: "Demos",
				url: "/demos",
				icon: HomeIcon,
			},
			{
				title: "AI Assistant",
				url: "/demos/ai-assistant",
				icon: Bot,
			},
			{
				title: "Lead Conversion Assistant",
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
</script>

<Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="bg-sidebar-secondary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
                            <img src="/logo/white transparent.png" alt="Ed & Sy" class="size-6" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">Ed & Sy</span>
								<span class="truncate text-xs">Scale Your Business with AI</span>
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
		<div class="p-4 text-center text-sm text-muted-foreground">
			Ed & Sy Digital Agency
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
