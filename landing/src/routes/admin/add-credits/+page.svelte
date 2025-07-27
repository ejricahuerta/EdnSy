<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { CreditService } from '$lib/services/creditService';
  import { Plus, CheckCircle, AlertCircle, Coins } from 'lucide-svelte';

  let currentCredits = $state(0);
  let amountToAdd = $state(25);
  let loading = $state(false);
  let initialLoading = $state(true);
  let message = $state('');
  let messageType = $state<'success' | 'error'>('success');

  async function loadCredits() {
    try {
      const credits = await CreditService.getUserCredits();
      currentCredits = credits.demo_credits;
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      initialLoading = false;
    }
  }

  async function addCredits() {
    if (!amountToAdd || amountToAdd <= 0) {
      message = 'Please enter a valid amount';
      messageType = 'error';
      return;
    }

    try {
      loading = true;
      message = '';
      
      await CreditService.addCredits(amountToAdd);
      
      message = `Successfully added ${amountToAdd} credits!`;
      messageType = 'success';
      
      // Reload credits
      await loadCredits();
      
      // Reset form
      amountToAdd = 25;
    } catch (error) {
      console.error('Error adding credits:', error);
      message = 'Failed to add credits. Please try again.';
      messageType = 'error';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadCredits();
  });
</script>

<svelte:head>
  <title>Add Credits - Ed&Sy</title>
  <meta name="description" content="Add credits to your account" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-md mx-auto px-4">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Coins class="h-5 w-5 text-yellow-500" />
          Add Credits
        </CardTitle>
        <CardDescription>
          Add credits to your account to access AI automation services
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Current Credits Display -->
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Current Credits</span>
            {#if initialLoading}
              <Skeleton class="h-8 w-16" />
            {:else}
              <span class="text-2xl font-bold text-gray-900">{currentCredits}</span>
            {/if}
          </div>
        </div>

        {#if initialLoading}
          <!-- Loading State -->
          <div class="space-y-4">
            <div>
              <Skeleton class="h-4 w-24 mb-2" />
              <Skeleton class="h-10 w-full" />
            </div>
            <Skeleton class="h-10 w-full" />
          </div>
        {:else}
          <!-- Add Credits Form -->
          <div class="space-y-4">
            <div>
              <Label for="amount" class="text-sm font-medium text-gray-700">
                Amount to Add
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="1000"
                bind:value={amountToAdd}
                class="mt-1"
                disabled={loading}
              />
            </div>

            <Button
              onclick={addCredits}
              disabled={loading}
              class="w-full"
            >
              {#if loading}
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Credits...
                </div>
              {:else}
                <div class="flex items-center gap-2">
                  <Plus class="h-4 w-4" />
                  Add Credits
                </div>
              {/if}
            </Button>
          </div>

          <!-- Message Display -->
          {#if message}
            <div class="p-3 rounded-lg border {messageType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}">
              <div class="flex items-center gap-2">
                {#if messageType === 'success'}
                  <CheckCircle class="h-4 w-4" />
                {:else}
                  <AlertCircle class="h-4 w-4" />
                {/if}
                <span class="text-sm">{message}</span>
              </div>
            </div>
          {/if}
        {/if}
      </CardContent>
    </Card>
  </div>
</div> 