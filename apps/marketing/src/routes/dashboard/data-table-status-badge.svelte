<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	let { label, variant }: { label: string; variant: 'default' | 'secondary' | 'outline' } = $props();
</script>

<Badge
	{variant}
	class={cn(
		variant === 'secondary' && 'bg-[rgba(193,125,42,0.12)] text-[var(--amber)] border-[var(--amber)]/25',
		variant === 'outline' && 'bg-muted text-muted-foreground border-border'
	)}
>
	{label}
</Badge>
