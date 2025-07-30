<script lang="ts">
	import "../app.css";
	import { Toaster } from 'svelte-sonner';
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { supabase } from "$lib/supabase";
	import type { LayoutData } from './$types';

	let { children, data } = $props<{ data: LayoutData }>();
	let user = $state<any>(data.user);

	async function handleLogout() {
		const { error } = await supabase.auth.signOut();
		if (!error) {
			goto('/login');
		}
	}
	
	// Update user state when auth state changes (only on client)
	if (browser) {
		supabase.auth.onAuthStateChange((event, session) => {
			user = session?.user || null;
		});
	}
</script>

<svelte:head>
	<title>EdnSy Dashboard</title>
	<meta name="description" content="EdnSy Dashboard - AI Automation Management" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<!-- Always render children, let individual pages handle their own authentication -->
{@render children()}

<Toaster />
