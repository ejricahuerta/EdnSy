<script lang="ts">
	import { page } from '$app/stores';
	import { MapPin, Mail, LayoutDashboard, User } from 'lucide-svelte';

	let { children } = $props();

	const pathname = $derived($page.url.pathname);

	const navItems = [
		{ href: '/dashboard/settings/profile', label: 'Profile', icon: User },
		{ href: '/dashboard/settings', label: 'General', icon: MapPin },
		{ href: '/dashboard/settings/demo-banner', label: 'Demo banner', icon: LayoutDashboard },
		{ href: '/dashboard/settings/email', label: 'Email', icon: Mail }
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard/settings') {
			return pathname === '/dashboard/settings';
		}
		return pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Settings · Dashboard</title>
</svelte:head>

<div class="lr-dashboard-settings-layout">
	<p class="border-b border-border/60 px-3 py-2 text-xs text-muted-foreground md:hidden">
		Swipe sideways for more sections
	</p>
	<nav class="lr-dashboard-settings-nav" aria-label="Settings sections">
		{#each navItems as { href, label, icon: Icon }}
			<a
				href={href}
				class="lr-dashboard-settings-link"
				class:lr-dashboard-settings-link-active={isActive(href)}
				title={label}
			>
				<Icon class="lr-dashboard-settings-link-icon" aria-hidden="true" strokeWidth={1.5} />
				<span class="lr-dashboard-settings-link-label">{label}</span>
			</a>
		{/each}
	</nav>
	<main class="lr-dashboard-settings-main">
		{@render children()}
	</main>
</div>
