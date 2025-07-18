<script lang="ts">
  import AppLayout from '$lib/components/app-layout.svelte';
  
  let props = $props();
  let children = props.children;
</script>

<AppLayout>
  {@render children?.()}
</AppLayout> 