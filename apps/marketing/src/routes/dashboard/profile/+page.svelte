<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Profile · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Profile</h1>
		<p class="text-muted-foreground">Your account details.</p>
	</div>

	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header>
			<Card.Title>Account</Card.Title>
			<Card.Description>Signed in with Google.</Card.Description>
		</Card.Header>
		<Card.Content>
			<dl class="space-y-2 text-sm">
				<div>
					<dt class="text-muted-foreground">Email</dt>
					<dd class="font-medium">{data.user?.email ?? '—'}</dd>
				</div>
			</dl>
		</Card.Content>
	</Card.Root>
</div>
