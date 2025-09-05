<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  onMount(async () => {
    // Check if user is already authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        goto(redirect);
      } else {
        goto('/demos');
      }
      return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const redirect = urlParams.get('redirect');

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      const errorUrl = '/login?error=' + encodeURIComponent(error);
      if (redirect) {
        goto(errorUrl + '&redirect=' + encodeURIComponent(redirect));
      } else {
        goto(errorUrl);
      }
      return;
    }

    if (code) {
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError);
        const errorUrl = '/login?error=authentication_failed';
        if (redirect) {
          goto(errorUrl + '&redirect=' + encodeURIComponent(redirect));
        } else {
          goto(errorUrl);
        }
        return;
      }

      if (data.session) {
        // Redirect to the specified page or default to demos
        if (redirect) {
          goto(redirect);
        } else {
          goto('/demos');
        }
        return;
      }
    }

    // No code found, redirect to login
    const errorUrl = '/login?error=no_code_found';
    if (redirect) {
      goto(errorUrl + '&redirect=' + encodeURIComponent(redirect));
    } else {
      goto(errorUrl);
    }
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