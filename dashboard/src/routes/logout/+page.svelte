<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	onMount(async () => {
		try {
			const { error } = await supabase.auth.signOut();
			
			if (error) {
				console.error('Sign out error:', error);
				// Try fallback method
				try {
					await supabase.auth.signOut({ scope: 'local' });
				} catch (fallbackError) {
					console.error('Exception during logout:', fallbackError);
				}
			}
			
			// Redirect to login page
			goto('/login');
		} catch (error) {
			console.error('Exception during logout:', error);
			// Try fallback method
			try {
				await supabase.auth.signOut({ scope: 'local' });
			} catch (fallbackError) {
				console.error('Exception during logout:', fallbackError);
			}
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Logging Out - EdnSy Dashboard</title>
</svelte:head>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
		<p class="text-muted-foreground">Logging out...</p>
	</div>
</div> 