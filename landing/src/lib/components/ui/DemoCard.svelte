<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditService, type DemoInfo } from '$lib/services/creditService';
  import { Clock, Zap, Star, Play, Lock } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  interface Props {
    demoId: string;
    title: string;
    description: string;
    industry: string;
    estimatedTime?: number;
    difficulty?: string;
    benefits?: string[];
  }

  let { demoId, title, description, industry, estimatedTime = 15, difficulty = 'beginner', benefits = [] } = $props<Props>();

  let demoInfo: DemoInfo | null = null;
  let canStart = $state(false);
  let userCredits = $state(0);
  let loading = $state(true);
  let starting = $state(false);

  async function loadDemoInfo() {
    try {
      loading = true;
      demoInfo = await CreditService.getDemoInfo(demoId);
      
      if (demoInfo) {
        const { canStart: canStartDemo, userCredits: credits } = await CreditService.canStartDemo(demoId);
        canStart = canStartDemo;
        userCredits = credits;
      }
    } catch (error) {
      console.error('Error loading demo info:', error);
    } finally {
      loading = false;
    }
  }

  async function startDemo() {
    if (!canStart || starting) return;

    try {
      starting = true;
      const result = await CreditService.startDemoSession(demoId);
      
      if (result.success) {
        // Navigate to the demo
        goto(`/demos/${demoId}`);
      } else {
        alert(result.error || 'Failed to start demo');
      }
    } catch (error) {
      console.error('Error starting demo:', error);
      alert('Failed to start demo. Please try again.');
    } finally {
      starting = false;
    }
  }

  onMount(() => {
    loadDemoInfo();
  });

  function getDifficultyColor(diff: string) {
    switch (diff) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getDifficultyIcon(diff: string) {
    switch (diff) {
      case 'beginner': return '⭐';
      case 'intermediate': return '⭐⭐';
      case 'advanced': return '⭐⭐⭐';
      default: return '⭐';
    }
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
  <div class="flex justify-between items-start mb-4">
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p class="text-gray-600 text-sm mb-3">{description}</p>
    </div>
    
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
    {:else if demoInfo}
      <div class="flex items-center gap-2 text-sm">
        <Zap class="h-4 w-4 text-yellow-500" />
        <span class="font-medium">{demoInfo.credit_cost}</span>
        <span class="text-gray-600">credits</span>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-4 mb-4 text-sm text-gray-600">
    <div class="flex items-center gap-1">
      <Clock class="h-4 w-4" />
      <span>{estimatedTime} min</span>
    </div>
    
    <div class="flex items-center gap-1">
      <span class="text-sm">{getDifficultyIcon(difficulty)}</span>
      <span class="px-2 py-1 rounded-full text-xs font-medium {getDifficultyColor(difficulty)}">
        {difficulty}
      </span>
    </div>
  </div>

  {#if benefits.length > 0}
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
      <ul class="space-y-1">
        {#each benefits as benefit}
          <li class="text-sm text-gray-600 flex items-start gap-2">
            <span class="text-green-500 mt-0.5">•</span>
            <span>{benefit}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="flex items-center justify-between">
    {#if loading}
      <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
    {:else if canStart}
      <button
        on:click={startDemo}
        disabled={starting}
        class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if starting}
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        {:else}
          <Play class="h-4 w-4" />
        {/if}
        <span>{starting ? 'Starting...' : 'Start Demo'}</span>
      </button>
    {:else}
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <Lock class="h-4 w-4" />
        <span>Need {demoInfo?.credit_cost || 0} credits (you have {userCredits})</span>
      </div>
    {/if}
  </div>
</div> 