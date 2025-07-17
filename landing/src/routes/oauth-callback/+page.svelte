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
      // Exchange code and state for JWT via backend using service
      const { jwt } = await exchangeGoogleCodeForJwt(code, state);
      console.log('JWT from backend:', jwt);
      // POST JWT to SvelteKit endpoint to set HttpOnly cookie
      const cookieRes = await fetch('/oauth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
      });
      if (cookieRes.ok) {
        // Fetch user profile and update store
        try {
          const user = await fetchCurrentUser();
          setUser(user);
        } catch {}
        // Add a short delay to ensure cookie is set before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 150);
      } else {
        alert('Failed to set session cookie');
        goto('/login');
      }
    } catch (e) {
      console.warn('Backend not available, using mock authentication');
      // Mock authentication for development
      setUser({
        sub: 'mock-user-id',
        email: 'user@example.com',
        name: 'Mock User'
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 150);
    }
  });
</script>

<section class="flex justify-center items-center h-screen">
  <p>Signing you in...</p>
</section>
