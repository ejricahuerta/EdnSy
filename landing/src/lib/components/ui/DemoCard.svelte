<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditService, type ServiceInfo } from '$lib/services/creditService';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Coins, Clock, TrendingUp, Zap } from 'lucide-svelte';

  let { demoId, title, description, industry, estimatedTime, difficulty, benefits } = $props<{
    demoId: string;
    title: string;
    description: string;
    industry: string;
    estimatedTime: string;
    difficulty: string;
    benefits: string[];
  }>();

  let demoInfo = $state<ServiceInfo | null>(null);
  let loading = $state(true);
  let error = $state('');

  async function loadDemoInfo() {
    try {
      loading = true;
      error = '';
      demoInfo = await CreditService.getServiceInfo(demoId);
    } catch (err) {
      error = 'Failed to load demo info';
      console.error('Error loading demo info:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadDemoInfo();
  });

  $effect(() => {
    if (demoId) {
      loadDemoInfo();
    }
  });
</script>

<div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
  <div class="flex items-start justify-between mb-4">
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p class="text-gray-600 text-sm mb-3">{description}</p>
      
      <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div class="flex items-center gap-1">
          <Clock class="h-3 w-3" />
          <span>{estimatedTime}</span>
        </div>
        <div class="flex items-center gap-1">
          <TrendingUp class="h-3 w-3" />
          <span>{difficulty}</span>
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center gap-2">
      <Skeleton class="h-4 w-4 rounded-full" />
      <Skeleton class="h-4 w-8" />
      <Skeleton class="h-4 w-12" />
    </div>
  {:else if error}
    <div class="text-red-600 text-sm">{error}</div>
  {:else if demoInfo}
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Training Cost:</span>
        <div class="flex items-center gap-1">
          <Coins class="h-4 w-4 text-yellow-500" />
          <span class="font-medium">{demoInfo.training_cost} credits</span>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Response Cost:</span>
        <div class="flex items-center gap-1">
          <Zap class="h-4 w-4 text-blue-500" />
          <span class="font-medium">{demoInfo.response_cost} credit</span>
        </div>
      </div>
      
      {#if demoInfo.action_cost > 0}
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Action Cost:</span>
          <div class="flex items-center gap-1">
            <Zap class="h-4 w-4 text-green-500" />
            <span class="font-medium">{demoInfo.action_cost} credits</span>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="mt-4">
    <a
      href="/demos/{demoId === 'ai-assistant' ? 'ai-assistant' : demoId === 'automation-tasks' ? 'automation-tasks' : demoId === 'data-insights' ? 'data-insights' : 'business-operations'}"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center block"
    >
      Try Demo
    </a>
  </div>

  {#if benefits && benefits.length > 0}
    <div class="mt-4 pt-4 border-t border-gray-100">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Key Benefits:</h4>
      <ul class="space-y-1">
        {#each benefits as benefit}
          <li class="text-xs text-gray-600 flex items-start gap-2">
            <div class="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>{benefit}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div> 