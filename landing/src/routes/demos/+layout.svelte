<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let isCheckingAuth = $state(true);

  onMount(async () => {
    if (browser) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        goto("/login");
      } else {
        isCheckingAuth = false;
      }
    }
  });
</script>

{#if isCheckingAuth}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600">Checking authentication...</p>
    </div>
  </div>
{:else}
  <slot />
{/if} 