<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { MessageSquare, Users, Activity, ArrowRight } from '@lucide/svelte';
  import { onMount } from 'svelte';
  
  let currentUser = $derived($page.data.user);
  let promptsUsed = $state(0);
  let promptsRemaining = $derived(10 - promptsUsed);
  
  onMount(() => {
    // Load prompts used from localStorage
    const savedPrompts = localStorage.getItem('ednsy_prompts_used');
    if (savedPrompts) {
      promptsUsed = parseInt(savedPrompts);
    }
  });
</script>

<div class="px-4 lg:px-6">
  <!-- Welcome Section -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      Welcome back, {currentUser?.email?.split('@')[0] || 'User'}!
    </h1>
    <p class="text-gray-600">
      Here's what's happening with your {currentUser?.organization?.name || 'workspace'}.
    </p>
  </div>
  
  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Free Prompts</CardTitle>
        <MessageSquare class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{promptsRemaining}</div>
        <p class="text-xs text-muted-foreground">
          {promptsUsed} of 10 prompts used
        </p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Demo Usage</CardTitle>
        <Activity class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{promptsUsed}</div>
        <p class="text-xs text-muted-foreground">
          {promptsUsed > 0 ? 'Recent activity' : 'No activity yet'}
        </p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Workspace</CardTitle>
        <Users class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{currentUser?.organization?.name || 'Not set'}</div>
        <p class="text-xs text-muted-foreground">
          Your workspace
        </p>
      </CardContent>
    </Card>
  </div>
  
  <!-- Quick Actions -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Access your most used features
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <a href="/app/demos">
          <Button class="w-full justify-between" variant="outline">
            <span>Try AI Demos</span>
            <ArrowRight class="h-4 w-4" />
          </Button>
        </a>
        <a href="/app/settings">
          <Button class="w-full justify-between" variant="outline">
            <span>View Settings</span>
            <ArrowRight class="h-4 w-4" />
          </Button>
        </a>
        <a href="/app/demos">
          <Button class="w-full justify-between" variant="outline">
            <span>Try AI Demos</span>
            <ArrowRight class="h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest demo interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#if promptsUsed > 0}
            <div class="flex items-center space-x-4">
              <div class="w-2 h-2 bg-slate-500 rounded-full"></div>
              <div class="flex-1">
                <p class="text-sm font-medium">AI Demo Usage</p>
                <p class="text-xs text-gray-500">
                  {promptsUsed} prompts used of 10 free prompts
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div class="flex-1">
                <p class="text-sm font-medium">Demo Setup</p>
                <p class="text-xs text-gray-500">
                  Ready to explore AI tools with your data
                </p>
              </div>
            </div>
          {:else}
            <div class="text-sm text-gray-500 text-center py-4">
              No recent activity. Try your first AI demo!
            </div>
          {/if}
        </div>
      </CardContent>
    </Card>
  </div>
</div> 