<script lang="ts">
	import { CAL_COM_LINK } from '$lib/constants';
	import { MessageCircle, Calendar } from 'lucide-svelte';

	let {
		senderName = '',
		senderEmail = '',
		bookCallUrl = CAL_COM_LINK,
		position = 'bottom'
	}: {
		senderName?: string;
		/** When set, "Reply to X" opens mailto this address */
		senderEmail?: string;
		bookCallUrl?: string;
		/** 'top' | 'bottom' - fixed bar position */
		position?: 'top' | 'bottom';
	} = $props();

	const ctaLabel = senderName ? `Reply to ${senderName}` : 'Book a call';
	const showReply = !!senderName;
	const replyHref = senderEmail ? `mailto:${senderEmail}?subject=Re: Your demo` : 'mailto:?subject=Re: Your demo';
</script>

<div
	class="sticky-cta-bar lr-brand lr-from-platform fixed left-0 right-0 z-40 safe-area-pb safe-area-pt px-4 py-3 shadow-lg border-t border-base-300/80 bg-base-100/98 backdrop-blur-md {position === 'top' ? 'top-0 border-b' : 'bottom-0'}"
	aria-label="Lead Rosetta – call to action"
>
	<div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
		<p class="text-base font-semibold text-base-content text-center sm:text-left">
			Want this live in 48 hours?
		</p>
		<div class="flex items-center gap-2 w-full sm:w-auto justify-center">
			{#if showReply}
				<a
					href={replyHref}
					class="btn btn-primary btn-sm sm:btn-md gap-2 flex-1 sm:flex-initial"
				>
					<MessageCircle class="w-4 h-4 shrink-0" aria-hidden="true" />
					{ctaLabel}
				</a>
			{/if}
			<a
				href={bookCallUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-primary btn-sm sm:btn-md gap-2 flex-1 sm:flex-initial"
			>
				<Calendar class="w-4 h-4 shrink-0" aria-hidden="true" />
				Book a call →
			</a>
		</div>
	</div>
</div>

<style>
	.sticky-cta-bar {
		/* Mobile-first: ensure bar doesn't cover content; add safe area for notched devices */
		padding-bottom: env(safe-area-inset-bottom, 0);
		padding-top: env(safe-area-inset-top, 0);
	}
</style>
