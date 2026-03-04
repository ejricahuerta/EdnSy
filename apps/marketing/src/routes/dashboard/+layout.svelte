<script lang="ts">
	import '../../styles/dashboard.css';
	import { TooltipProvider } from '$lib/components/ui/tooltip';

	let { children } = $props();
</script>

<TooltipProvider>
	{@render children()}
</TooltipProvider>
