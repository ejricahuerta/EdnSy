<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { browser } from '$app/environment';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let isLoading = $state(false);
  let errorMessage = $state("");
  let isLoggedIn = $state(false);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      isLoggedIn = true;
      goto('/demos');
    }
  });

  async function loginWithGoogle() {
    isLoading = true;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      errorMessage = error.message;
      isLoading = false;
    }
  }
</script>
<svelte:head>
  <title>Login - Ed&Sy</title>
  <meta name="description" content="Sign in to your Ed&Sy account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black">
  <div class="w-full max-w-md">
    <Card class="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader class="text-center pb-6">
        <div class="flex justify-center mb-4">
          <div class="font-heading text-3xl font-bold tracking-tight text-blue-600">
            Ed <span class="text-blue-600">&</span> Sy
          </div>
        </div>
        <CardTitle class="text-2xl font-semibold text-gray-900">
          Welcome back
        </CardTitle>
        <CardDescription class="text-gray-600">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6 mb-10 mx-2">
        {#if !isLoggedIn}
        <button
          onclick={loginWithGoogle}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
          disabled={isLoading}
        >
          <svg class="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 17.1 19.4 15 24 15c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 15.1 3 7.6 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.2 36.1 26.7 37 24 37c-5.5 0-10.1-3.7-11.7-8.7l-7 5.4C7.6 39.3 15.1 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z"/></g></svg>
          Continue with Google
        </button>
        {/if}
        {#if errorMessage}
          <div class="text-red-500 mt-2">{errorMessage}</div>
        {/if}
        
        <div class="text-center">
          <a class="text-blue-600 hover:text-blue-700" href="/">Return to Home</a>
        </div>
      </CardContent>
    </Card>
    
    <div class="mt-8 text-center">
      <p class="text-xs text-gray-500">
        By continuing, you agree to our 
        <a href="/terms" class="text-blue-600 hover:text-blue-700">Terms of Service</a>
        and 
        <a href="/privacy" class="text-blue-600 hover:text-blue-700">Privacy Policy</a>
      </p>
    </div>
  </div>
</div>
