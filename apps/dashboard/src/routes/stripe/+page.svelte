<script lang="ts">
	import StripeDashboard from '$lib/components/stripe-dashboard.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
	import type { PageData } from './$types';

	let { data: pageData }: { data: PageData } = $props();
	
	// Get user data from layout
	const user = pageData.user;
</script>

<svelte:head>
	<title>Stripe Dashboard</title>
</svelte:head>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar variant="inset" {user} />
	<Sidebar.Inset>
		<SiteHeader />
		<div class="flex flex-1 flex-col container mx-auto">
			<div class="@container/main flex flex-1 flex-col gap-2">
				<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
					<StripeDashboard />
				</div>
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider> 