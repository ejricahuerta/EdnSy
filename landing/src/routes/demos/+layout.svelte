<script lang="ts">
  import type { LayoutData } from './$types';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let { children, data } = $props<{ data: LayoutData }>();

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      goto('/login');
    }
  });
</script>

<!-- Demos Layout - Only accessible to authenticated users -->
<div class="flex flex-1 flex-col gap-4">
  {@render children()}
</div> 