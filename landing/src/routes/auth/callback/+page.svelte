<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let isLoading = true;
  let errorMessage = '';

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      goto('/demos');
      return;
    }
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        errorMessage = 'Authentication failed. Please try again.';
        isLoading = false;
        return;
      }
      goto('/demos');
      return;
    }
    errorMessage = 'No authentication code found. Please try logging in again.';
    isLoading = false;
  });
</script>

<div class="flex flex-col items-center justify-center h-screen">
  {#if isLoading}
    <h1 class="text-2xl font-bold">Logging in...</h1>
  {:else}
    <h1 class="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
    <p class="text-lg text-gray-700 mb-6">{errorMessage}</p>
    <a href="/login" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Return to Login</a>
  {/if}
</div> 