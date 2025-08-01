<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';
  import DemoCard from '$lib/components/ui/DemoCard.svelte';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Filter, Search, Building2, Utensils, ShoppingBag, Wrench, Clock } from 'lucide-svelte';

  let services: any[] = [];
  let filteredServices = $state([]);
  let loading = $state(true);
  let searchTerm = $state('');
  let selectedIndustry = $state('all');

  const industries = [
    { id: 'all', name: 'All Services', icon: Building2 }
  ];

  async function loadServices() {
    try {
      loading = true;
      const { data, error } = await supabase
        .schema('demo')
        .from('services')
        .select('*')
        .order('title');

      if (error) {
        console.error('Error loading services:', error);
        return;
      }

      services = data || [];
      filterServices();
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      loading = false;
    }
  }

  function filterServices() {
    filteredServices = services.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || service.industry === selectedIndustry;
      
      return matchesSearch && matchesIndustry;
    });
  }

  function handleSearch() {
    filterServices();
  }

  function handleIndustryChange() {
    filterServices();
  }

  onMount(() => {
    loadServices();
  });

  $effect(() => {
    filterServices();
  });
</script>

<svelte:head>
  <title>Services - Ed & Sy</title>
  <meta name="description" content="Try our AI automation services" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">AI Automation Services</h1>
          <p class="mt-2 text-gray-600">Experience the power of AI automation for your business</p>
        </div>
        <div class="flex items-center gap-4">
          <CreditDisplay />
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
              placeholder="Search services..."
              bind:value={searchTerm}
              oninput={handleSearch}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Industry Filter -->
        <div class="flex gap-2">
          {#each industries as industry}
            <button
              onclick={() => { selectedIndustry = industry.id; handleIndustryChange(); }}
              class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors {selectedIndustry === industry.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
            >
              <industry.icon class="h-4 w-4" />
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
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton class="h-6 w-3/4 mb-4" />
            <Skeleton class="h-4 w-full mb-2" />
            <Skeleton class="h-4 w-2/3 mb-4" />
            <Skeleton class="h-10 w-full" />
          </div>
        {/each}
      </div>
    {:else if filteredServices.length === 0}
      <div class="text-center py-12">
        <Filter class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No services found</h3>
        <p class="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredServices as service}
          <DemoCard
            demoId={service.id}
            title={service.title}
            description={service.description}
            industry={service.industry}
            estimatedTime={service.estimated_time}
            benefits={service.benefits}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>
