<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditService, type UserCredits } from '$lib/services/creditService';
  import { Coins, Zap } from 'lucide-svelte';

  let credits: UserCredits | null = null;
  let loading = $state(true);
  let error = $state('');

  async function loadCredits() {
    try {
      loading = true;
      error = '';
      credits = await CreditService.getUserCredits();
    } catch (err) {
      error = 'Failed to load credits';
      console.error('Error loading credits:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadCredits();
  });

  // Refresh credits when component is shown
  export function refresh() {
    loadCredits();
  }
</script>

{#if loading}
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
    <span>Loading credits...</span>
  </div>
{:else if error}
  <div class="flex items-center gap-2 text-sm text-red-600">
    <Coins class="h-4 w-4" />
    <span>{error}</span>
  </div>
{:else if credits}
  <div class="flex items-center gap-2 text-sm">
    <Coins class="h-4 w-4 text-yellow-500" />
    <span class="font-medium">{credits.demo_credits}</span>
    <span class="text-gray-600">credits</span>
    {#if credits.total_demos_completed > 0}
      <span class="text-gray-400">•</span>
      <Zap class="h-4 w-4 text-blue-500" />
      <span class="text-gray-600">{credits.total_demos_completed} demos</span>
    {/if}
  </div>
{:else}
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <Coins class="h-4 w-4" />
    <span>No credits available</span>
  </div>
{/if} 