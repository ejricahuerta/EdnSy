<script lang="ts">
  import { onMount } from 'svelte';
  import { clearUser } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  onMount(() => {
    clearUser();
    goto('/login');
  });
</script>

<section class="flex justify-center items-center h-screen">
  <p>Logging out...</p>
</section> 