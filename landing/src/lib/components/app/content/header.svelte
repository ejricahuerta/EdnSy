<script lang="ts">
	import SidebarIcon from "@lucide/svelte/icons/sidebar";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from "$app/stores";

	const sidebar = Sidebar.useSidebar();

	// Dynamic breadcrumb based on current route
	  let breadcrumbItems = $derived(getBreadcrumbItems($page.url.pathname));

	function getBreadcrumbItems(pathname: string) {
		if (pathname.startsWith('/demos/')) {
			const demoName = pathname.split('/').pop() || '';
			const demoTitle = getDemoTitle(demoName);
			return [
				{ text: 'Demos', href: '/demos' },
				{ text: demoTitle, href: null }
			];
		} else if (pathname === '/demos') {
			return [
				{ text: 'Demos', href: null }
			];
		} else {
			return [
				{ text: 'Home', href: '/' },
				{ text: 'Demos', href: '/demos' }
			];
		}
	}

	function getDemoTitle(demoName: string) {
		const demoMap = {
			'ai-assistant': 'Assistant',
			'automation-tasks': 'Lead Conversion Assistant',
			'data-insights': 'Data Insights',
			'business-operations': 'Business Operations',
		};
		return demoMap[demoName as keyof typeof demoMap] || 'Demo';
	}
</script>

<header class="bg-background sticky top-0 z-50 flex w-full items-center border-b">
	<div class="h-(--header-height) flex w-full items-center gap-2 px-4">
		<Button class="size-8" variant="ghost" size="icon" onclick={sidebar.toggle}>
			<SidebarIcon />
		</Button>
		<Separator orientation="vertical" class="mr-2 h-4" />
		<Breadcrumb.Root class="hidden sm:block">
			<Breadcrumb.List>
				{#each breadcrumbItems as item, index}
					<Breadcrumb.Item>
						{#if item.href}
							<Breadcrumb.Link href={item.href}>{item.text}</Breadcrumb.Link>
						{:else}
							<Breadcrumb.Page>{item.text}</Breadcrumb.Page>
						{/if}
					</Breadcrumb.Item>
					{#if index < breadcrumbItems.length - 1}
						<Breadcrumb.Separator />
					{/if}
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>
