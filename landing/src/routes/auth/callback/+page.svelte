<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  onMount(async () => {
    // Check if user is already authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      goto('/demos');
      return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      goto('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (code) {
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError);
        goto('/login?error=authentication_failed');
        return;
      }

      if (data.session) {
        goto('/demos');
        return;
      }
    }

    // No code found, redirect to login
    goto('/login?error=no_code_found');
  });
</script>

<svelte:head>
  <title>Processing Authentication - Ed & Sy</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-secondary">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">Processing authentication...</p>
  </div>
</div> 