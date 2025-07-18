<script lang="ts">
  import { page } from "$app/stores";
  import { user } from "$lib/stores/user";
  import { credits } from "$lib/stores/credits";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import SiteHeader from "$lib/components/site-header.svelte";

  let props = $props();
  let children = props.children;

  let currentUser = $derived($page.data.user);
  let pathname = $derived($page.url.pathname);
</script>

<Sidebar.Provider style="--sidebar-width: calc(var(--spacing) * 72);">
  <AppSidebar variant="inset" />
  <Sidebar.Inset>
    {@render children?.()}
  </Sidebar.Inset>
</Sidebar.Provider>
