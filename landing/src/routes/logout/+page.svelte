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
  <title>Logging Out - Ed & Sy</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-secondary">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">Logging out...</p>
  </div>
</div>