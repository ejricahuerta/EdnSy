<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';
  import DemoCard from '$lib/components/ui/DemoCard.svelte';
  import { Filter, Search, Building2, Utensils, ShoppingBag, Wrench, Clock } from 'lucide-svelte';

  let demos: any[] = [];
  let filteredDemos: any[] = [];
  let loading = $state(true);
  let searchTerm = $state('');
  let selectedIndustry = $state('all');
  let creditDisplay: CreditDisplay;

  const industries = [
    { id: 'all', name: 'All Demos', icon: Building2 }
  ];

  async function loadDemos() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('demos')
        .select('*')
        .order('title');

      if (error) {
        console.error('Error loading demos:', error);
        return;
      }

      demos = data || [];
      filterDemos();
    } catch (error) {
      console.error('Error loading demos:', error);
    } finally {
      loading = false;
    }
  }

  function filterDemos() {
    filteredDemos = demos.filter(demo => {
      const matchesSearch = demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          demo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || demo.industry === selectedIndustry;
      
      return matchesSearch && matchesIndustry;
    });
  }

  function handleSearch() {
    filterDemos();
  }

  function handleIndustryChange() {
    filterDemos();
  }

  function refreshCredits() {
    if (creditDisplay) {
      creditDisplay.refresh();
    }
  }

  onMount(() => {
    loadDemos();
  });

  $effect(() => {
    filterDemos();
  });
</script>

<svelte:head>
  <title>Demos - Ed&Sy</title>
  <meta name="description" content="Try our AI automation demos" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">AI Automation Demos</h1>
          <p class="mt-2 text-gray-600">Experience the power of AI automation for your business</p>
        </div>
        <div class="flex items-center gap-4">
          <CreditDisplay bind:this={creditDisplay} />
          <a
            href="/demos/history"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Clock class="h-4 w-4" />
            History
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search demos..."
              bind:value={searchTerm}
              on:input={handleSearch}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Industry Filter -->
        <div class="flex gap-2">
          {#each industries as industry}
            <button
              on:click={() => { selectedIndustry = industry.id; handleIndustryChange(); }}
              class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors {selectedIndustry === industry.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
            >
              <svelte:component this={industry.icon} class="h-4 w-4" />
              <span class="text-sm font-medium">{industry.name}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each Array(6) as _}
          <div class="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div class="h-6 bg-gray-200 rounded mb-4"></div>
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded mb-4"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
          </div>
        {/each}
      </div>
    {:else if filteredDemos.length === 0}
      <div class="text-center py-12">
        <Filter class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No demos found</h3>
        <p class="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredDemos as demo}
          <DemoCard
            demoId={demo.id}
            title={demo.title}
            description={demo.description}
            industry={demo.industry}
            estimatedTime={demo.estimated_time}
            difficulty={demo.difficulty}
            benefits={demo.benefits}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>
