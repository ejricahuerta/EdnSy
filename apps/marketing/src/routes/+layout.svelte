<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/stores';
	import { ModeWatcher } from 'mode-watcher';
	import { toggleMode } from 'mode-watcher';
	import { PLAN_LABELS } from '$lib/plans';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import { LayoutGrid, User, Users, Plug, CreditCard, Settings, PanelLeftClose, ChevronRight, Sun, Moon, Presentation, Bot } from 'lucide-svelte';
import { isEdnsyUser } from '$lib/plans';

	let { data, children } = $props();
	const siteOrigin = $derived(data?.siteOrigin ?? '');
	const ogImage = $derived(siteOrigin ? `${siteOrigin}/images/og-default.png` : '');
	const pathSegments = $derived($page.url.pathname.split('/').filter(Boolean));
	const demoBanner = $derived(data?.demoBanner ?? null);
	const bannerText = $derived(demoBanner?.text ?? 'Want this live in 48 hours?');
	const bannerCtaLabel = $derived(demoBanner?.ctaLabel ?? 'Try free →');
	const bannerCtaHref = $derived(demoBanner?.ctaHref ?? '/try');
	// Demo: /demo/[slug] — slug is prospect id; theme is determined by industry (v1.3 themes).
	const isDemoRoute = $derived(pathSegments[0] === 'demo' && pathSegments.length >= 2);
	const demoTheme = $derived(isDemoRoute ? (pathSegments[1] ?? '') : '');
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
	const isDashboardRoute = $derived(
		$page.url.pathname === '/dashboard' || $page.url.pathname.startsWith('/dashboard/')
	);
	const user = $derived(data?.user ?? null);
	const showAgentsLink = $derived(isEdnsyUser(user));
	/** Show loading bar only when navigating to a different dashboard page (internal navigation). Same-page goto (e.g. billing replaceState) does not show the bar. */
	const isInternalDashboardNav = $derived(
		$navigating?.to &&
			($navigating.to.url.pathname === '/dashboard' || $navigating.to.url.pathname.startsWith('/dashboard/')) &&
			$navigating.to.url.pathname !== $page.url.pathname
	);

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
		return () => {
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<ModeWatcher />
<svelte:body class:lr-scope-dashboard={isDashboardRoute} class:lr-scope-demo={isDemoRoute} />

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
	<div class="demo-route" data-demo-theme={demoTheme}>
		<div class="demo-lr-banner lr-brand" role="banner">
			<a href="/" class="demo-lr-banner-home" aria-label="Lead Rosetta – create your demo">
				<img src="/images/logo.png" alt="" class="demo-lr-banner-logo" width="28" height="28" />
				<span class="demo-lr-banner-brand">Lead <span>Rosetta</span></span>
			</a>
			<span class="demo-lr-banner-urgency">{bannerText}</span>
			<div class="demo-lr-banner-actions">
				<a href={bannerCtaHref} class="demo-lr-banner-cta">{bannerCtaLabel}</a>
			</div>
		</div>
		{@render children()}
	</div>
{:else if isAuthRoute}
	<div class="leadrosetta-app leadrosetta-app-auth">
		<main class="lr-auth-main">{@render children()}</main>
	</div>
{:else if isDashboardRoute && user}
	<div
		class="leadrosetta-app-dashboard"
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
					href="/dashboard/prospects"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/prospects' || $page.url.pathname.startsWith('/dashboard/prospects/')}
					title="Prospects"
				>
					<Users class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Prospects</span>
				</a>
				<a
					href="/dashboard/demos"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/demos'}
					title="Demos"
				>
					<Presentation class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
					<span class="lr-dashboard-sidebar-link-label">Demos</span>
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
				{#if showAgentsLink}
					<a
						href="/dashboard/agents"
						class="lr-dashboard-sidebar-link"
						class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/agents'}
						title="AI Agents"
					>
						<Bot class="lr-dashboard-sidebar-link-icon" aria-hidden="true" strokeWidth={1.5} />
						<span class="lr-dashboard-sidebar-link-label">AI Agents</span>
					</a>
				{/if}
				<a
					href="/dashboard/settings"
					class="lr-dashboard-sidebar-link"
					class:lr-dashboard-sidebar-link-active={$page.url.pathname === '/dashboard/settings' || $page.url.pathname.startsWith('/dashboard/settings/')}
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
									const labels: Record<string, string> = { profile: 'Profile', integrations: 'Integrations', billing: 'Billing', agents: 'AI Agents', settings: 'Settings', upload: 'Upload' };
									return labels[segment] ?? (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard');
								})()}
							</span>
						{/if}
					</nav>
				</div>
				<div class="lr-dashboard-topnav-right">
					<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle theme" title="Toggle theme" class="lr-dashboard-theme-toggle">
						<Sun class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
						<Moon class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" aria-hidden="true" />
					</Button>
					<span class="lr-dashboard-topnav-user" title={user.email}>{user.email}</span>
					<a href="/auth/logout" class="lr-dashboard-topnav-logout">Sign out</a>
				</div>
			</header>
			{#if isInternalDashboardNav}
				<div class="lr-dashboard-loading-bar" role="progressbar" aria-label="Loading page" aria-busy="true"></div>
			{/if}
			<div class="lr-dashboard-main-content">
				{@render children()}
			</div>
		</main>
		<Toaster />
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
					<li><a href="/try" class="btn-nav">Try free →</a></li>
				{/if}
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
