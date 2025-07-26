<script lang="ts">
  import { onMount } from 'svelte';
  import { CreditService } from '$lib/services/creditService';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Coins, Plus, CheckCircle, AlertCircle } from 'lucide-svelte';

  let currentCredits = $state(0);
  let amountToAdd = $state(50);
  let loading = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error' | ''>('');

  async function loadCurrentCredits() {
    try {
      const credits = await CreditService.getUserCredits();
      if (credits) {
        currentCredits = credits.demo_credits;
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  }

  async function addCredits() {
    if (amountToAdd <= 0) {
      message = 'Please enter a positive amount';
      messageType = 'error';
      return;
    }

    try {
      loading = true;
      message = '';
      messageType = '';

      const result = await CreditService.addCredits(amountToAdd);
      
      if (result.success) {
        message = `Successfully added ${amountToAdd} credits!`;
        messageType = 'success';
        await loadCurrentCredits();
        amountToAdd = 50; // Reset to default
      } else {
        message = result.error || 'Failed to add credits';
        messageType = 'error';
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      message = 'An unexpected error occurred';
      messageType = 'error';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadCurrentCredits();
  });
</script>

<svelte:head>
  <title>Add Credits - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="text-center mb-6">
        <div class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Coins class="h-6 w-6 text-yellow-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Add Credits</h1>
        <p class="text-gray-600 mt-2">Add credits to your account for testing</p>
      </div>

      <!-- Current Credits Display -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Current Credits</span>
          <span class="text-2xl font-bold text-gray-900">{currentCredits}</span>
        </div>
      </div>

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
            placeholder="Enter amount"
          />
        </div>

        <!-- Quick Add Buttons -->
        <div class="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            on:click={() => amountToAdd = 25}
            class="text-xs"
          >
            +25
          </Button>
          <Button
            variant="outline"
            size="sm"
            on:click={() => amountToAdd = 50}
            class="text-xs"
          >
            +50
          </Button>
          <Button
            variant="outline"
            size="sm"
            on:click={() => amountToAdd = 100}
            class="text-xs"
          >
            +100
          </Button>
        </div>

        <Button
          on:click={addCredits}
          disabled={loading}
          class="w-full"
        >
          {#if loading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Adding...
          {:else}
            <Plus class="h-4 w-4 mr-2" />
            Add Credits
          {/if}
        </Button>
      </div>

      <!-- Message Display -->
      {#if message}
        <div class="mt-4 p-3 rounded-lg {messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
          <div class="flex items-center gap-2 {messageType === 'success' ? 'text-green-700' : 'text-red-700'}">
            {#if messageType === 'success'}
              <CheckCircle class="h-4 w-4" />
            {:else}
              <AlertCircle class="h-4 w-4" />
            {/if}
            <span class="text-sm">{message}</span>
          </div>
        </div>
      {/if}

      <!-- Navigation -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex gap-2">
          <a
            href="/demos"
            class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Browse Demos
          </a>
          <a
            href="/demos/history"
            class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Demo History
          </a>
        </div>
      </div>
    </div>
  </div>
</div> 