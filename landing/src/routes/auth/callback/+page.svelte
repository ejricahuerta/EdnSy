<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let isLoading = $state(true);
  let errorMessage = $state("");

  onMount(async () => {
    if (!browser) return;

    try {
      console.log('Processing OAuth callback...');
      
      // Handle OAuth callback - check for tokens in URL hash
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log('OAuth tokens found in URL hash');
        
        // Extract tokens from URL hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken) {
          console.log('Setting session with OAuth tokens...');
          
          // Set the session with the tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error('Error setting session:', error);
            errorMessage = 'Authentication failed. Please try again.';
          } else if (session) {
            console.log('Authentication successful:', session.user.email);
            // Redirect to demos page
            goto('/demos');
            return;
          }
        } else {
          errorMessage = 'No access token found in URL.';
        }
      } else {
        errorMessage = 'No OAuth tokens found in URL.';
      }
    } catch (error) {
      console.error('Unexpected error during OAuth callback:', error);
      errorMessage = 'An unexpected error occurred during authentication.';
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Authenticating... - Ed&Sy</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black">
  <div class="w-full max-w-md">
    <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center">
      {#if isLoading}
        <div class="flex flex-col items-center space-y-4">
          <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <h2 class="text-xl font-semibold text-gray-900">Authenticating...</h2>
          <p class="text-gray-600">Please wait while we complete your sign-in.</p>
        </div>
      {:else if errorMessage}
        <div class="flex flex-col items-center space-y-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">Authentication Failed</h2>
          <p class="text-red-600 text-sm">{errorMessage}</p>
          <button 
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            on:click={() => goto('/login')}
          >
            Try Again
          </button>
        </div>
      {:else}
        <div class="flex flex-col items-center space-y-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">Authentication Successful</h2>
          <p class="text-gray-600">Redirecting to demos...</p>
        </div>
      {/if}
    </div>
  </div>
</div> 