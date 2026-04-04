<script lang="ts">
	import '../../styles/dashboard.css';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import DashboardProspectsRealtime from '$lib/components/dashboard/dashboard-prospects-realtime.svelte';

	let { data, children } = $props();
	const supabasePublic = $derived(data?.supabasePublic);
	const hasDashboardUser = $derived(Boolean(data?.user));
	const dashboardUserId = $derived(data?.user?.id ?? '');
	const supabaseDbSchema = $derived(data?.supabaseDbSchema ?? 'public');
</script>

<TooltipProvider>
	{#if hasDashboardUser && supabasePublic && dashboardUserId}
		<DashboardProspectsRealtime
			userId={dashboardUserId}
			supabasePublic={supabasePublic}
			dbSchema={supabaseDbSchema}
		/>
	{/if}
	{@render children()}
</TooltipProvider>
