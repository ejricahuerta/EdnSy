<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toastFromActionResult } from '$lib/toast';
	let { data } = $props<{ data: PageData }>();

	let bannerText = $state(data.demoBannerText ?? '');
	let ctaLabel = $state(data.demoBannerCtaLabel ?? '');
	let ctaHref = $state(data.demoBannerCtaHref ?? '');

	$effect(() => {
		bannerText = data.demoBannerText ?? '';
		ctaLabel = data.demoBannerCtaLabel ?? '';
		ctaHref = data.demoBannerCtaHref ?? '';
	});
</script>

<svelte:head>
	<title>Demo banner · Settings · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Demo banner</h1>
		<p class="text-muted-foreground mt-1">
			Customize the banner shown at the top of your demo pages. Visitors see this message and CTA when viewing a prospect’s demo.
		</p>
	</div>

	<form
		method="POST"
		action="?/saveDemoBanner"
		use:enhance={() => {
			return async ({ result }) => {
				toastFromActionResult('Demo banner', result, 'Banner saved.');
			};
		}}
	>
		<Card.Root class="border-0 bg-card shadow-none">
			<Card.Header>
				<Card.Title>Banner content</Card.Title>
				<Card.Description>
					Text and button shown in the fixed bar at the top of each demo (e.g. “Want this live in 48 hours?” with a “Try free →” button).
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2 max-w-md">
					<Label for="banner-text">Banner text</Label>
					<Input
						id="banner-text"
						name="bannerText"
						type="text"
						placeholder="e.g. Want this live in 48 hours?"
						bind:value={bannerText}
					/>
				</div>
				<div class="space-y-2 max-w-md">
					<Label for="cta-label">Button label (CTA)</Label>
					<Input
						id="cta-label"
						name="ctaLabel"
						type="text"
						placeholder="e.g. Try free →"
						bind:value={ctaLabel}
					/>
				</div>
				<div class="space-y-2 max-w-md">
					<Label for="cta-href">Button link</Label>
					<Input
						id="cta-href"
						name="ctaHref"
						type="text"
						placeholder="e.g. /try or https://..."
						bind:value={ctaHref}
					/>
					<p class="text-xs text-muted-foreground">
						Use a path like <code class="rounded bg-muted px-1">/try</code> for an in-app link, or a full URL for an external link.
					</p>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
