<script lang="ts">
	/** F1a: shown when data confidence score < 50; do not generate full demo. */
	let { reason = 'Not enough public data to build a reliable demo.' }: { reason?: string } = $props();
</script>

<div class="low-data-view lr-from-platform min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-base-200/50">
	<div class="max-w-md w-full text-center space-y-6">
		<h1 class="text-xl md:text-2xl font-bold text-base-content">We couldn't build a reliable demo</h1>
		<p class="text-base-content/80">{reason}</p>
		<p class="text-sm text-base-content/70">Try adding a website or double-checking the business name.</p>
		<a
			href="/try"
			class="inline-block demo-btn demo-btn-primary demo-btn-md shadow-sm hover:shadow transition-shadow"
		>
			Try again with another prospect →
		</a>
	</div>
</div>
