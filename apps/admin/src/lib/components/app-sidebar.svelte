<script lang="ts">
	import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
	import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
	import PlugIcon from "@tabler/icons-svelte/icons/plug";
	import SettingsIcon from "@tabler/icons-svelte/icons/settings";
	import UserCircleIcon from "@tabler/icons-svelte/icons/user-circle";
	import NavDocuments from "./nav-documents.svelte";
	import NavMain from "./nav-main.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import type { Icon } from "@tabler/icons-svelte";

	const defaultData = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [
			{ title: "Dashboard", url: "/dashboard", icon: DashboardIcon },
			{ title: "Profile", url: "/dashboard/profile", icon: UserCircleIcon },
			{ title: "Integrations", url: "/dashboard/integrations", icon: PlugIcon },
			{ title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
		],
		navSecondary: [],
		documents: [],
	};

	type NavItem = { title: string; url: string; icon?: Icon };
	type DocItem = { name: string; url: string; icon: Icon };

	let {
		user,
		navMain,
		navSecondary,
		documents,
		brandTitle = "Acme Inc.",
		brandHref = "##",
		logoutHref,
		showQuickCreate = true,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		user?: { name: string; email: string; avatar?: string };
		navMain?: NavItem[];
		navSecondary?: NavItem[];
		documents?: DocItem[];
		brandTitle?: string;
		brandHref?: string;
		logoutHref?: string;
		showQuickCreate?: boolean;
	} = $props();

	const data = $derived({
		user: user ?? defaultData.user,
		navMain: navMain ?? defaultData.navMain,
		navSecondary: navSecondary ?? defaultData.navSecondary,
		documents: documents ?? defaultData.documents,
	});
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href={brandHref} {...props}>
							<InnerShadowTopIcon class="!size-5" />
							<span class="text-base font-semibold">{brandTitle}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} showQuickCreate={showQuickCreate} />
		{#if data.documents.length > 0}
			<NavDocuments items={data.documents} />
		{/if}
		{#if data.navSecondary.length > 0}
			<NavSecondary items={data.navSecondary} class="mt-auto" />
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} {logoutHref} />
	</Sidebar.Footer>
</Sidebar.Root>
