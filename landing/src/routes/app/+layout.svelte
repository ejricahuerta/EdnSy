<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/user';
  import { credits } from '$lib/stores/credits';
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import SiteHeader from "$lib/components/site-header.svelte";
  
  let props = $props();
  let children = props.children;
  
  let currentUser = $derived($page.data.user);
  let pathname = $derived($page.url.pathname);
  
  async function handleLogout() {
    try {
      await fetch('/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.warn('Backend not available, redirecting to home');
      window.location.href = '/';
    }
  }
</script>

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
  <AppSidebar variant="inset" />
  <Sidebar.Inset>
    <SiteHeader />
    <div class="flex flex-1 flex-col">
      <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {@render children?.()}
        </div>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider> 