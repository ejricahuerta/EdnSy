<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';

	let isLoading = $state(true);

	onMount(async () => {
		try {
			// Check if user is authenticated
			const { data: { session } } = await supabase.auth.getSession();
			
			if (session) {
				// User is authenticated, redirect to dashboard
				goto('/dashboard');
			} else {
				// User is not authenticated, redirect to login
				goto('/login');
			}
		} catch (error) {
			console.error('Error checking authentication:', error);
			// Fallback to login page
			goto('/login');
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-2xl font-bold text-gray-900">Loading...</h1>
		<p class="mt-2 text-gray-600">
			{isLoading ? 'Checking authentication...' : 'Redirecting...'}
		</p>
	</div>
</div>
