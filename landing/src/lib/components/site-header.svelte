<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from '$app/stores';

	let pathname = $derived($page.url.pathname);

	function getTitle(path: string) {
		if (path === '/app/home') return 'Dashboard';
		if (path === '/app/demos') return 'Demos';
		if (path === '/app/settings') return 'Settings';
		return 'Ed & Sy Dashboard';
	}
</script>

<header
	class="sticky top-0 z-50 bg-background h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">{getTitle(pathname)}</h1>
		<div class="ml-auto flex items-center gap-2">
			<Button
				href="/app/help"
				variant="ghost"
				size="sm"
				class="dark:text-foreground hidden sm:flex"
			>
				Help
			</Button>
		</div>
	</div>
</header>
