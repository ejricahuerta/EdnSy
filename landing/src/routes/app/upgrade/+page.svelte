<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { CreditCard, Check, Star, Zap, Crown } from '@lucide/svelte';
  import { credits } from '$lib/stores/credits';
  import { onMount } from 'svelte';
  
  let currentUser = $derived($page.data.user);
  let creditsData = $derived($credits);
  
  onMount(() => {
    credits.fetchCredits();
  });
  
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      credits: 50,
      price: 9.99,
      popular: false,
      features: [
        '50 credits per month',
        'Basic AI demos',
        'Email support',
        'Standard features'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      credits: 200,
      price: 29.99,
      popular: true,
      features: [
        '200 credits per month',
        'All AI demos',
        'Priority support',
        'Advanced analytics',
        'Team collaboration'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 500,
      price: 79.99,
      popular: false,
      features: [
        '500 credits per month',
        'All AI demos',
        '24/7 support',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security'
      ]
    }
  ];
  
  let selectedPlan = $state(null);
  let isProcessing = $state(false);
  let showSuccess = $state(false);
  
  function selectPlan(plan: any) {
    selectedPlan = plan;
  }
  
  async function handleUpgrade() {
    if (!selectedPlan) return;
    
    isProcessing = true;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update credits
    await credits.useCredits('Plan Upgrade', -selectedPlan.credits, `Upgraded to ${selectedPlan.name} plan`);
    
    isProcessing = false;
    showSuccess = true;
    
    // Reset after 3 seconds
    setTimeout(() => {
      showSuccess = false;
      selectedPlan = null;
    }, 3000);
  }
</script>

<div class="px-4 lg:px-6 max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Upgrade Your Account</h1>
    <p class="text-gray-600">
      Choose the perfect plan for your business needs and unlock more AI-powered features.
    </p>
  </div>
  
  <!-- Current Plan Info -->
  <Card class="mb-8">
    <CardContent class="pt-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-slate-100 rounded-lg">
            <CreditCard class="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Current Plan</h3>
            <p class="text-sm text-gray-600">Free Plan - {creditsData.remainingCredits} credits remaining</p>
          </div>
        </div>
        <Badge variant="outline">Free</Badge>
      </div>
    </CardContent>
  </Card>
  
  <!-- Success Message -->
  {#if showSuccess}
    <Card class="mb-8 border-green-200 bg-green-50">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <Check class="h-5 w-5 text-green-600" />
          <div>
            <h3 class="font-semibold text-green-900">Upgrade Successful!</h3>
            <p class="text-sm text-green-700">
              Your account has been upgraded to the {selectedPlan?.name} plan. 
              You now have {creditsData.remainingCredits} credits available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <!-- Plans Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {#each plans as plan}
      {@const Icon = plan.popular ? Crown : plan.id === 'pro' ? Star : CreditCard}
      <Card class="relative hover:shadow-lg transition-shadow {selectedPlan?.id === plan.id ? 'ring-2 ring-slate-600' : ''}">
        {#if plan.popular}
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge class="bg-slate-600 text-white">Most Popular</Badge>
          </div>
        {/if}
        
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-slate-100 rounded-lg">
              <Icon class="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle class="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.credits} credits per month</CardDescription>
            </div>
          </div>
          <div class="pt-4">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold">${plan.price}</span>
              <span class="text-gray-500">/month</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent class="space-y-4">
          <div class="space-y-3">
            {#each plan.features as feature}
              <div class="flex items-center gap-2">
                <Check class="h-4 w-4 text-green-600" />
                <span class="text-sm text-gray-600">{feature}</span>
              </div>
            {/each}
          </div>
          
          <Button 
            class="w-full" 
            variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
            onclick={() => selectPlan(plan)}
          >
            {selectedPlan?.id === plan.id ? 'Selected' : 'Choose Plan'}
          </Button>
        </CardContent>
      </Card>
    {/each}
  </div>
  
  <!-- Upgrade Button -->
  {#if selectedPlan}
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-gray-900">Selected Plan: {selectedPlan.name}</h3>
            <p class="text-sm text-gray-600">
              ${selectedPlan.price}/month - {selectedPlan.credits} credits
            </p>
          </div>
          <Button 
            size="lg" 
            onclick={handleUpgrade}
            disabled={isProcessing}
          >
            {#if isProcessing}
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            {:else}
              <div class="flex items-center gap-2">
                <CreditCard class="h-4 w-4" />
                Upgrade Now
              </div>
            {/if}
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <!-- FAQ Section -->
  <Card class="mt-8">
    <CardHeader>
      <CardTitle>Frequently Asked Questions</CardTitle>
      <CardDescription>
        Everything you need to know about our upgrade plans
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-3">
        <div>
          <h4 class="font-medium text-gray-900">How do credits work?</h4>
          <p class="text-sm text-gray-600">
            Credits are used when you access AI demos and features. Each demo costs a certain number of credits, and unused credits roll over to the next month.
          </p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Can I change my plan later?</h4>
          <p class="text-sm text-gray-600">
            Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
          </p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">What happens if I run out of credits?</h4>
          <p class="text-sm text-gray-600">
            You'll receive a notification when credits are running low. You can upgrade your plan or wait until your credits refresh next month.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</div> 