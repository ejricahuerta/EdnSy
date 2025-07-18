<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { MessageSquare, BarChart3, CheckSquare, Zap, Globe, FileText, Calendar, Phone, Sparkles, Users, TrendingUp, ArrowRight } from '@lucide/svelte';
  import PartnershipPopup from '$lib/components/partnership-popup.svelte';
  import ConsultationPopup from '$lib/components/consultation-popup.svelte';
  import { goto } from '$app/navigation';
  
  let currentUser = $derived($page.data.user);
  let promptsUsed = $state(0);
  let promptsRemaining = $derived(10 - promptsUsed);
  let showPartnershipPopupState = $state(false);
  let showConsultationPopupState = $state(false);
  
  // Load prompts used from localStorage on mount
  if (typeof window !== 'undefined') {
    const savedPrompts = localStorage.getItem('ednsy_prompts_used');
    if (savedPrompts) {
      promptsUsed = parseInt(savedPrompts);
    }
  }
  
  const demos = [
    {
      id: 'chatbot',
      title: 'Customer Service Assistant',
      description: 'Answer customer questions automatically using your business information',
      icon: MessageSquare,
      status: 'available',
      dataType: 'website',
      dataDescription: 'Just enter your website address',
      features: ['Answer customer questions', 'Available 24/7', 'Uses your business info'],
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'data-insights',
      title: 'Business Health Checker',
      description: 'Get insights from your business documents and spreadsheets',
      icon: BarChart3,
      status: 'available',
      dataType: 'files',
      dataDescription: 'Upload your Excel files or documents',
      features: ['Sales reports', 'Customer analysis', 'Business performance'],
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'task-automation',
      title: 'Task Automation Helper',
      description: 'Automate repetitive tasks like emails and phone calls',
      icon: CheckSquare,
      status: 'available',
      dataType: 'contact',
      dataDescription: 'Provide your email and phone number',
      features: ['Automated emails', 'Text messages', 'Calendar reminders'],
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'ai-assistant',
      title: 'Business Problem Solver',
      description: 'Smart assistant that works with your existing systems',
      icon: Zap,
      status: 'available',
      dataType: 'knowledge',
      dataDescription: 'Upload your files and choose your systems',
      features: ['Customer management', 'Field service', 'Multi-system help'],
      color: 'bg-orange-50 border-orange-200'
    }
  ];
  
  function handleDemoClick(demo: any) {
    if (demo.status === 'coming-soon') {
      alert('This demo will be available soon!');
      return;
    }
    
    // Check if user has prompts remaining
    if (promptsRemaining <= 0) {
      showPartnershipPopup();
      return;
    }
    
    // Navigate to demo page
    goto(`/demos/${demo.id}`);
  }
  
  function showPartnershipPopup() {
    showPartnershipPopupState = true;
  }
  
  function showConsultationPopup() {
    showConsultationPopupState = true;
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Header -->
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold mb-2">AI Tools for Your Business</h1>
    <p class="text-gray-600">Try our tools and see how we can help grow your business</p>
  </div>
  
  <!-- Prompts Info -->
  <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <MessageSquare class="h-5 w-5 text-blue-600" />
        <div>
          <p class="text-sm font-medium text-gray-600">Free Tries Remaining</p>
          <p class="text-2xl font-bold text-blue-600">{promptsRemaining}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-600">Used {promptsUsed} of 10 tries</p>
      </div>
    </div>
  </div>
  
  <!-- Demos Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each demos as demo}
      {@const Icon = demo.icon}
      <button 
        class="w-full text-left border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-300 group cursor-pointer"
        onclick={() => handleDemoClick(demo)}
        disabled={demo.status === 'coming-soon'}
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="p-2 bg-gray-100 rounded-lg">
            <Icon class="h-5 w-5 text-gray-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{demo.title}</h3>
            <p class="text-sm text-gray-600">{demo.description}</p>
          </div>
          <ArrowRight class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        
        <div class="space-y-3 mb-4">
          <p class="text-sm font-medium text-gray-700">Features:</p>
          <ul class="space-y-1">
            {#each demo.features as feature}
              <li class="flex items-center gap-2 text-sm text-gray-600">
                <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
                {feature}
              </li>
            {/each}
          </ul>
        </div>
        
        <div class="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
          {#if demo.dataType === 'website'}
            <Globe class="h-4 w-4" />
          {:else if demo.dataType === 'files'}
            <FileText class="h-4 w-4" />
          {:else if demo.dataType === 'contact'}
            <Phone class="h-4 w-4" />
          {:else}
            <Zap class="h-4 w-4" />
          {/if}
          <span>{demo.dataDescription}</span>
        </div>
      </button>
    {/each}
  </div>
  
  <!-- Help Section -->
  <div class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div class="text-center">
      <h3 class="font-semibold mb-2">Need Help?</h3>
      <p class="text-sm text-gray-600 mb-3">Let's discuss how we can be your AI partner</p>
      <button 
        class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        onclick={showConsultationPopup}
      >
        Schedule a Call
      </button>
    </div>
  </div>
</div> 