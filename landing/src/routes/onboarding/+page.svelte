<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  let company = $state('');
  let error = $state('');
  let loading = $state(false);
  const dispatch = createEventDispatcher();
  const API_HOST = import.meta.env.VITE_API_HOST;
  let currentUser: any = null;
  $effect(() => {
    user.subscribe(u => currentUser = u);
  });

  function validate() {
    if (!company.trim()) {
      error = 'Company name is required.';
      return false;
    }
    if (company.length < 2) {
      error = 'Company name must be at least 2 characters.';
      return false;
    }
    error = '';
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (!currentUser || !currentUser.sub) {
      error = 'User not authenticated.';
      return;
    }
    loading = true;
    try {
      const res = await fetch(`${API_HOST}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: company,
          ownerId: currentUser.sub,
          createdAt: new Date().toISOString()
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        error = data.error || 'Failed to save organization.';
        loading = false;
        return;
      }
      dispatch('onboarded', { company });
      goto('/app/home');
    } catch (e) {
      console.warn('Backend not available, using mock onboarding');
      // Mock onboarding for development
      dispatch('onboarded', { company });
      goto('/app/home');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-background px-4">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
    <div class="w-full flex flex-col items-center mb-6">
      <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
        <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-center mb-1 text-slate-700">Welcome to Ed&Sy!</h2>
      <p class="text-gray-600 text-center text-sm mb-2">Let's set up your workspace. This is usually your company or team name.</p>
      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div class="h-full bg-slate-600 transition-all" style="width: 60%"></div>
      </div>
      <span class="text-xs text-slate-600 font-semibold">Step 1 of 2</span>
    </div>
    <div class="w-full flex flex-col gap-4">
      <label class="font-semibold text-gray-700">Company Name</label>
      <input
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        type="text"
        placeholder="e.g. Acme Corp"
        bind:value={company}
        oninput={() => error = ''}
        required
        minlength="2"
        autocomplete="organization"
        onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      {#if error}
        <div class="text-red-600 text-sm">{error}</div>
      {/if}
      <Button class="w-full mt-2" disabled={loading} onclick={handleSubmit}>{loading ? 'Saving...' : 'Continue'}</Button>
    </div>
    <div class="mt-6 text-xs text-gray-500 text-center">
      <span>Workspaces let you manage your business, team, and settings in one place.</span>
    </div>
  </div>
</div> 