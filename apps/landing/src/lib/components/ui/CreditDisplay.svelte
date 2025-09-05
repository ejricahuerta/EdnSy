<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditService, type UserCredits } from '$lib/services/creditService';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Coins, Zap } from 'lucide-svelte';

  let { credits: propCredits = null } = $props<{
    credits?: UserCredits | null;
  }>();

  let credits = $state<UserCredits | null>(null);
  let loading = $state(true);
  let error = $state('');



  onMount(() => {
    loadCredits();
  });

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

  // Update credits when prop changes
  $effect(() => {
    if (propCredits) {
      credits = propCredits;
      loading = false;
      error = '';
    }
  });

</script>

{#if loading}
  <div class="flex items-center gap-2 text-sm">
    <Skeleton class="h-4 w-4 rounded-full" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-12" />
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
  </div>
{:else}
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <Coins class="h-4 w-4" />
    <span>No credits available</span>
  </div>
{/if} 