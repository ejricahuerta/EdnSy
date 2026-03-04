<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { getDemoTrackingLabel } from '$lib/demo';

	let {
		status,
		sendTime = null,
		openedAt = null,
		clickedAt = null,
		hasDemoLink = false,
		demoLink = null
	}: {
		status: string | undefined;
		sendTime?: string | null;
		openedAt?: string | null;
		clickedAt?: string | null;
		hasDemoLink?: boolean;
		demoLink?: string | null;
	} = $props();

	const label = $derived.by(() => {
		if (!status) return hasDemoLink ? 'Ready' : 'No demo';
		if (status === 'sent' && sendTime) {
			try {
				const d = new Date(sendTime);
				return `Sent ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
			} catch {
				return 'Sent';
			}
		}
		if (status === 'opened' && openedAt) {
			try {
				const d = new Date(openedAt);
				return `Opened ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
			} catch {
				return 'Opened';
			}
		}
		if (status === 'clicked' && clickedAt) {
			try {
				const d = new Date(clickedAt);
				return `Clicked ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
			} catch {
				return 'Clicked';
			}
		}
		return getDemoTrackingLabel(status);
	});

	const variant = $derived.by(() => {
		if (!status) return 'outline';
		return status === 'sent' || status === 'opened' || status === 'clicked' || status === 'replied'
			? 'default'
			: status === 'approved'
				? 'secondary'
				: 'outline';
	});

	const isMuted = $derived(!status && !hasDemoLink);
</script>

<div class="flex items-center gap-1.5">
	<Badge variant={variant} class="font-normal {isMuted ? 'text-muted-foreground border-muted-foreground/30' : ''}">
		{label}
	</Badge>
</div>
