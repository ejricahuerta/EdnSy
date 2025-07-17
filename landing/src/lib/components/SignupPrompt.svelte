<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let open = $state(true);
  function close() {
    open = false;
    dispatch('close');
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative flex flex-col items-center">
      <button 
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-700" 
        aria-label="Close" 
        onclick={close}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h2 class="text-2xl font-bold text-center mb-2 text-blue-700">Sign up to unlock full features</h2>
      <p class="text-gray-600 text-center mb-6">Create your free Ed&Sy account to access all AI demos, save your progress, and get personalized insights for your business.</p>
      <a href="/login" class="w-full mb-3 inline-block rounded-lg bg-blue-600 text-white font-semibold py-3 px-6 text-center hover:bg-blue-700 transition">Sign up for free</a>
      <a href="/login" class="w-full inline-block rounded-lg border border-blue-600 text-blue-600 font-semibold py-3 px-6 text-center hover:bg-blue-50 transition">Already have an account? Log in</a>
    </div>
  </div>
{/if}

<style>
  /* Add any additional modal-specific styles here if needed */
</style> 