<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { exchangeGoogleCodeForJwt } from '$lib/services/authService';
  import { fetchCurrentUser } from '$lib/services/userService';
  import { setUser } from '$lib/stores/user';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (!code || !state) {
      goto('/login');
      return;
    }

    try {
      // Exchange code for JWT
      const { jwt } = await exchangeGoogleCodeForJwt(code, state);
      
      // Set JWT cookie via SvelteKit endpoint
      await fetch('/oauth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
      });
      
      // Fetch and save user data
      const user = await fetchCurrentUser();
      setUser(user);
      
      // Navigate to dashboard
      goto('/');
    } catch (error) {
      console.error('Authentication failed:', error);
      goto('/login');
    }
  });
</script>

<section class="flex flex-col justify-center items-center h-screen bg-background">
  <div class="text-center space-y-6">
    <div class="space-y-4">
      <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <svg class="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-semibold text-foreground mb-2">Signing you in...</h2>
        <p class="text-muted-foreground">Please wait</p>
      </div>
    </div>
  </div>
</section>
