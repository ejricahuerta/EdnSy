<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Clock, Zap, CheckCircle, Calendar, Coins } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';

  let demoHistory: any[] = [];
  let loading = $state(true);
  let error = $state('');
  let completingSessions = $state(false);

  async function loadDemoHistory() {
    try {
      loading = true;
      error = '';
      demoHistory = await CreditService.getDemoHistory();
    } catch (err) {
      error = 'Failed to load demo history';
      console.error('Error loading demo history:', err);
    } finally {
      loading = false;
    }
  }

  async function completeStuckSessions() {
    try {
      completingSessions = true;
      const result = await CreditService.completeAllInProgressSessions();
      if (result.success) {
        console.log(`Completed ${result.completedCount} stuck sessions`);
        // Reload the history to show updated status
        await loadDemoHistory();
      } else {
        error = result.error || 'Failed to complete sessions';
      }
    } catch (err) {
      error = 'Failed to complete stuck sessions';
      console.error('Error completing sessions:', err);
    } finally {
      completingSessions = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getDemoStatus(session: any) {
    if (session.completed_at) {
      return { status: 'completed', text: 'Completed', color: 'text-green-600 bg-green-100' };
    } else {
      return { status: 'in-progress', text: 'In Progress', color: 'text-yellow-600 bg-yellow-100' };
    }
  }

  onMount(() => {
    loadDemoHistory();
  });
</script>

<svelte:head>
  <title>Demo History - Ed & Sy</title>
  <meta name="description" content="Your demo history and credit usage" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Demo History</h1>
          <p class="mt-2 text-gray-600">Track your demo sessions and credit usage</p>
        </div>
        <div class="flex items-center gap-4">
          <CreditDisplay />
          {#if demoHistory.filter(s => !s.completed_at).length > 0}
            <Button 
              variant="outline" 
              size="sm"
              onclick={completeStuckSessions}
              disabled={completingSessions}
            >
              {#if completingSessions}
                Completing...
              {:else}
                Complete Stuck Sessions ({demoHistory.filter(s => !s.completed_at).length})
              {/if}
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="space-y-6">
        {#each Array(5) as _}
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <Skeleton class="h-6 w-48" />
                  <Skeleton class="h-6 w-20 rounded-full" />
                </div>
                <Skeleton class="h-4 w-full mb-3" />
                <div class="flex items-center gap-6">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-4 w-36" />
                  <Skeleton class="h-4 w-24" />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="text-right">
                  <Skeleton class="h-4 w-20 mb-1" />
                  <Skeleton class="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div class="text-center py-12">
        <div class="text-red-500 mb-4">
          <Clock class="h-12 w-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading history</h3>
        <p class="text-gray-600">{error}</p>
        <button
          onclick={loadDemoHistory}
          class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    {:else if demoHistory.length === 0}
      <div class="text-center py-12">
        <Calendar class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No demo history yet</h3>
        <p class="text-gray-600">Start your first demo to see your history here.</p>
        <a
          href="/demos"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Zap class="h-4 w-4" />
          Browse Demos
        </a>
      </div>
    {:else}
      <div class="space-y-6">
        {#each demoHistory as session}
          <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {session.services?.title || 'Unknown Demo'}
                  </h3>
                  <span class="px-2 py-1 rounded-full text-xs font-medium {getDemoStatus(session).color}">
                    {getDemoStatus(session).text}
                  </span>
                </div>
                
                <p class="text-gray-600 mb-3">
                  {session.services?.description || 'No description available'}
                </p>
                
                <div class="flex items-center gap-6 text-sm text-gray-500">
                  <div class="flex items-center gap-1">
                    <Calendar class="h-4 w-4" />
                    <span>Started: {formatDate(session.started_at)}</span>
                  </div>
                  
                  {#if session.completed_at}
                    <div class="flex items-center gap-1">
                      <CheckCircle class="h-4 w-4" />
                      <span>Completed: {formatDate(session.completed_at)}</span>
                    </div>
                  {/if}
                  
                  <div class="flex items-center gap-1">
                    <Coins class="h-4 w-4" />
                    <span>{session.credits_used} credits used</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">
                    {session.services?.industry || 'Unknown Industry'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Summary Stats -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Zap class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Total Demos</p>
              <p class="text-2xl font-bold text-gray-900">{demoHistory.length}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-gray-900">
                {demoHistory.filter(s => s.completed_at).length}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Coins class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Total Credits Used</p>
              <p class="text-2xl font-bold text-gray-900">
                {demoHistory.reduce((sum, session) => sum + session.credits_used, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div> 