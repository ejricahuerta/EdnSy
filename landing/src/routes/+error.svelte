<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Home, ArrowLeft, Search } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let { error } = $props<{ error: any }>();
  
  let status = $derived(error?.status || 404);
  let message = $derived(error?.message || 'Page not found');
  
  let countdown = $state(5);
  let redirecting = $state(false);
  
  onMount(() => {
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        redirecting = true;
        if (status === 401) {
          goto('/login');
        } else {
          goto('/');
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  });
  
  function goHome() {
    goto('/');
  }
  
  function goBack() {
    window.history.back();
  }
</script>

<svelte:head>
  <title>{status} - {message}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <Card class="text-center">
      <CardHeader class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span class="text-2xl font-bold text-red-600">{status}</span>
        </div>
        <CardTitle class="text-xl font-semibold text-gray-900">
          {status === 404 ? 'Page Not Found' : status === 401 ? 'Unauthorized' : 'Error'}
        </CardTitle>
        <p class="text-gray-600">
          {status === 404 
            ? "The page you're looking for doesn't exist or has been moved."
            : status === 401
            ? "You need to be logged in to access this page."
            : message}
        </p>
        {#if !redirecting}
          <div class="text-sm text-blue-600 font-medium">
            Redirecting to {status === 401 ? 'login page' : 'home page'} in {countdown} seconds...
          </div>
        {:else}
          <div class="text-sm text-blue-600 font-medium">
            Redirecting...
          </div>
        {/if}
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <Button variant="default" onclick={goHome} class="flex-1">
            <Home class="w-4 h-4 mr-2" />
            Go Home
          </Button>
          <Button variant="outline" onclick={goBack} class="flex-1">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        
        {#if status === 404}
          <div class="text-sm text-gray-500">
            <p>Try checking the URL or navigating from our homepage.</p>
          </div>
        {:else if status === 401}
          <div class="text-sm text-gray-500">
            <p>Please log in to access this page.</p>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</div> 