<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { INDUSTRY_SLUGS } from '$lib/industries';
	import { PLAN_LABELS } from '$lib/plans';
	import { LayoutGrid, User, Users, Plug, CreditCard, Settings, PanelLeftClose, ChevronRight, FileCode } from 'lucide-svelte';

	let { data, children } = $props();
	const siteOrigin = $derived(data?.siteOrigin ?? '');
	const ogImage = $derived(siteOrigin ? `${siteOrigin}/images/og-default.png` : '');
	const pathSegments = $derived($page.url.pathname.split('/').filter(Boolean));
	const isDemoRoute = $derived(
		pathSegments.length >= 1 && (INDUSTRY_SLUGS as readonly string[]).includes(pathSegments[0])
	);
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
	const isDashboardRoute = $derived(
		$page.url.pathname === '/dashboard' || $page.url.pathname.startsWith('/dashboard/')
	);
	const user = $derived(data?.user ?? null);

	let sidebarCollapsed = $state(false);
	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
		try {
			localStorage.setItem('lr-sidebar-collapsed', String(sidebarCollapsed));
		} catch (_) {}
	}
	onMount(() => {
		try {
			const stored = localStorage.getItem('lr-sidebar-collapsed');
			if (stored === 'true') sidebarCollapsed = true;
		} catch (_) {}
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
				if (document.body.querySelector('.leadrosetta-app-dashboard')) {
					e.preventDefault();
					toggleSidebar();
				}
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<svelte:head>
	<title>Lead Rosetta – Personalized demo sites for cold outreach</title>
	<meta name="description" content="Generate personalized demo websites for each prospect. Send them via email. Turn cold outreach into warm conversations." />
	{#if ogImage}
		<meta property="og:type" content="website" />
		<meta property="og:title" content="Lead Rosetta – Personalized demo sites for cold outreach" />
		<meta property="og:description" content="Generate personalized demo websites for each prospect. Send them via email. Turn cold outreach into warm conversations." />
		<meta property="og:image" content={ogImage} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="Lead Rosetta – Personalized demo sites for cold outreach" />
		<meta name="twitter:description" content="Generate personalized demo websites for each prospect. Send them via email." />
		<meta name="twitter:image" content={ogImage} />
	{/if}
</svelte:head>

{#if isDemoRoute}
	<div class="demo-route" data-demo-theme={pathSegments[0] ?? ''}>
		<div class="demo-lr-banner lr-brand" role="banner">
			<a href="/" class="demo-lr-banner-home" aria-label="Lead Rosetta – create your demo">
				<img src="/images/logo.png" alt="" class="demo-lr-banner-logo" width="28" height="28" />
				<span class="demo-lr-banner-brand">Lead <span>Rosetta</span></span>
			</a>
			<span class="demo-lr-banner-urgency">Want this live in 48 hours?</span>
			<div class="demo-lr-banner-actions">
				<a href="/try" class="demo-lr-banner-cta">Try free →</a>
			</div>
		</div>
		{@render children()}
	</div>
{:else if isAuthRoute}
	<div class="leadrosetta-app leadrosetta-app-auth">
		<header class="lr-auth-header" role="banner">
			<a href="/" class="lr-auth-header-logo" aria-label="Lead Rosetta – Home">
				<img src="/images/logo.png" alt="" class="lr-auth-header-logo-img" width="32" height="32" />
				<span class="lr-auth-header-logo-text">Lead <span>Rosetta</span></span>
			</a>
			<a href="/" class="lr-auth-header-back">← Back to home</a>
		</header>
		<main class="lr-auth-main">{@render children()}</main>
	</div>
{:else if isDashboardRoute && user}
	<div
		class="leadrosetta-app leadrosetta-app-dashboard"
		data-sidebar-collapsed={sidebarCollapsed}
		style="--sidebar-width: {sidebarCollapsed ? '3.5rem' : '16rem'};"
	>
		<aside class="lr-dashboard-sidebar" aria-label="Dashboard navigation">
			<div class="lr-dashboard-sidebar-header">
				<a href="/dashboard" class="lr-dashboard-sidebar-logo" title="Lead Rosetta">
					<img src="/images/logo.png" alt="" class="lr-dashboard-sidebar-logo-img" width="28" height="28" />
					<span class="lr-dashboard-sidebar-logo-text">Lead <span>Rosetta</span></span>
				</a>
			</div>
			<nav class="lr-dashboard-sidebar-nav">
				<a
					href="/dashboard"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard'}
					title="Dashboard"
				>
					<LayoutGrid class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Dashboard</span>
				</a>
				<a
					href="/dashboard/clients"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/clients'}
					title="Clients"
				>
					<Users class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Clients</span>
				</a>
				<a
					href="/dashboard/profile"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/profile'}
					title="Profile"
				>
					<User class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Profile</span>
				</a>
				<a
					href="/dashboard/integrations"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/integrations'}
					title="Integrations"
				>
					<Plug class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Integrations</span>
				</a>
				<a
					href="/dashboard/billing"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/billing'}
					title="Billing"
				>
					<CreditCard class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Billing</span>
				</a>
				<a
					href="/dashboard/templates"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/templates'}
					title="Templates"
				>
					<FileCode class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Templates</span>
				</a>
				<a
					href="/dashboard/settings"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/settings'}
					title="Settings"
				>
					<Settings class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Settings</span>
				</a>
			</nav>
			<div class="lr-dashboard-sidebar-footer">
				<div class="lr-dashboard-sidebar-bottom">
					<span class="lr-dashboard-sidebar-plan">{data.plan ? PLAN_LABELS[data.plan] : '—'}</span>
					{#if data.plan === 'teams'}
						<span class="lr-dashboard-sidebar-demos">Unlimited demos</span>
					{:else}
						<a href="/dashboard/billing" class="lr-dashboard-sidebar-upgrade" title="Upgrade your plan for unlimited demos">
							Upgrade for unlimited demos
						</a>
					{/if}
					<a href="https://ednsy.com" class="lr-dashboard-sidebar-powered" target="_blank" rel="noopener noreferrer" title="Ed & Sy">
						Powered by Ed & Sy
					</a>
				</div>
				<button
					type="button"
					class="lr-dashboard-sidebar-rail"
					onclick={toggleSidebar}
					aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
				>
					{#if sidebarCollapsed}
						<ChevronRight class="lr-dashboard-sidebar-rail-icon" aria-hidden="true" strokeWidth={1.5} />
					{:else}
						<PanelLeftClose class="lr-dashboard-sidebar-rail-icon" aria-hidden="true" strokeWidth={1.5} />
					{/if}
				</button>
			</div>
		</aside>
		<main class="lr-dashboard-main">
			<header class="lr-dashboard-topnav" aria-label="Breadcrumb and user">
				<div class="lr-dashboard-topnav-left">
					<button
						type="button"
						class="lr-dashboard-sidebar-trigger"
						onclick={toggleSidebar}
						aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						title="Toggle sidebar (Ctrl+B)"
					>
						{#if sidebarCollapsed}
							<ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
						{:else}
							<PanelLeftClose size={18} strokeWidth={1.5} aria-hidden="true" />
						{/if}
					</button>
					<nav class="lr-dashboard-breadcrumb" aria-label="Breadcrumb">
						<a href="/dashboard">Dashboard</a>
						{#if $page.url.pathname !== '/dashboard'}
							<span class="lr-dashboard-breadcrumb-sep" aria-hidden="true">/</span>
							<span class="lr-dashboard-breadcrumb-current">
								{(() => {
									const segment = $page.url.pathname.split('/').filter(Boolean)[1] ?? '';
									const labels = { profile: 'Profile', integrations: 'Integrations', billing: 'Billing', settings: 'Settings', upload: 'Upload' };
									return labels[segment] ?? (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard');
								})()}
							</span>
						{/if}
					</nav>
				</div>
				<div class="lr-dashboard-topnav-right">
					<span class="lr-dashboard-topnav-user" title={user.email}>{user.email}</span>
					<a href="/auth/logout" class="lr-dashboard-topnav-logout">Sign out</a>
				</div>
			</header>
			<div class="lr-dashboard-main-content">
				{@render children()}
			</div>
		</main>
	</div>
{:else if isDashboardRoute}
	<div class="leadrosetta-app leadrosetta-app-auth">
		<main>{@render children()}</main>
	</div>
{:else}
	<div class="leadrosetta-app">
		<nav class="landing-nav">
			<a href={user ? '/dashboard' : '/'} class="logo" aria-label="Lead Rosetta">
				<img src="/images/logo.png" alt="Lead Rosetta" class="logo-img" width="32" height="32" />
				<span class="logo-text">Lead <span>Rosetta</span></span>
			</a>
			<ul class="nav-links">
				{#if user}
					<li><a href="/dashboard">Dashboard</a></li>
					<li>
						<span class="nav-email" style="font-size: 0.875rem; color: var(--muted);" title={user.email}>
							{user.email}
						</span>
					</li>
					<li><a href="/auth/logout">Sign out</a></li>
				{:else}
					<li><a href="/#how">How it works</a></li>
					<li><a href="/#pricing">Pricing</a></li>
					<li><a href="/auth/login">Sign in</a></li>
				{/if}
				<li><a href="/try" class="btn-nav">Try free →</a></li>
			</ul>
		</nav>
		<main>
			{@render children()}
		</main>
		<footer class="landing-footer">
			<span class="footer-note">© 2026 Ed & Sy Inc. All rights reserved.</span>
			<div class="footer-links">
				<a href="/privacy">Privacy</a>
				<a href="/terms">Terms</a>
				<a href="/cookies">Cookies</a>
				<a href="/dpa">DPA</a>
				<a href="/aup">AUP</a>
				<a href="/security">Security</a>
				{#if user}
					<a href="/dashboard">Dashboard</a>
				{/if}
				<a href="https://ednsy.com">Built by Ed & Sy →</a>
			</div>
		</footer>
	</div>
{/if}
<Toaster richColors position="top-center" />
