<script lang="ts">
	import { onMount } from 'svelte';

	let {
		label = 'Get in touch',
		phoneHref = 'tel:+12895135055',
		phoneDisplay = '+1 (289) 513-5055',
		onRequestCallback = () => {}
	}: {
		label?: string;
		phoneHref?: string;
		phoneDisplay?: string;
		onRequestCallback?: () => void;
	} = $props();

	let open = $state(false);
	let triggerEl: HTMLButtonElement | undefined = $state(undefined);
	let panelEl: HTMLDivElement | undefined = $state(undefined);

	function toggle() {
		open = !open;
	}

	function requestCallback() {
		onRequestCallback();
		open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as Node;
		if (open && triggerEl && !triggerEl.contains(target) && panelEl && !panelEl.contains(target)) {
			open = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="demo-cta-dropdown">
	<button
		type="button"
		bind:this={triggerEl}
		class="btn btn-primary demo-cta-dropdown-trigger"
		onclick={toggle}
		aria-haspopup="true"
		aria-expanded={open}
		aria-label={label}
	>
		{label}
		<span class="demo-cta-dropdown-chevron" aria-hidden="true">▼</span>
	</button>
	{#if open}
		<div
			bind:this={panelEl}
			class="demo-cta-dropdown-panel"
			role="menu"
		>
			<a
				href={phoneHref}
				class="demo-cta-dropdown-item"
				role="menuitem"
			>
				Call {phoneDisplay}
			</a>
			<button
				type="button"
				class="demo-cta-dropdown-item"
				role="menuitem"
				onclick={requestCallback}
			>
				Request AI Callback
			</button>
		</div>
	{/if}
</div>

<style>
	.demo-cta-dropdown {
		position: relative;
		display: inline-block;
	}
	.demo-cta-dropdown-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.demo-cta-dropdown-chevron {
		font-size: 0.6em;
		opacity: 0.9;
	}
	.demo-cta-dropdown-panel {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.25rem;
		min-width: 100%;
		background: var(--color-base-100, #1c1917);
		border: 1px solid var(--color-base-300, #44403c);
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		z-index: 50;
	}
	.demo-cta-dropdown-item {
		display: block;
		width: 100%;
		padding: 0.6rem 1rem;
		text-align: left;
		font-size: 0.875rem;
		background: none;
		border: none;
		color: var(--color-base-content, #e7e5e4);
		text-decoration: none;
		cursor: pointer;
		transition: background 0.15s;
	}
	.demo-cta-dropdown-item:hover {
		background: var(--color-base-200, #292524);
	}
	.demo-cta-dropdown-item:not(:last-child) {
		border-bottom: 1px solid var(--color-base-300, #44403c);
	}
</style>
