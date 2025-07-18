<script lang="ts">
	import CreditCardIcon from "@tabler/icons-svelte/icons/credit-card";
	import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
	import LogoutIcon from "@tabler/icons-svelte/icons/logout";
	import NotificationIcon from "@tabler/icons-svelte/icons/notification";
	import UserCircleIcon from "@tabler/icons-svelte/icons/user-circle";
	import LoaderIcon from "@tabler/icons-svelte/icons/loader-2";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { logout } from '$lib/services/logoutService';
	import { user } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	let { user: userProp }: { user: { name: string; email: string; avatar: string; company?: string } } = $props();

	const sidebar = Sidebar.useSidebar();
	
	let isLoggingOut = $state(false);
	
	async function handleLogout() {
		if (isLoggingOut) return; // Prevent multiple clicks
		
		try {
			isLoggingOut = true;
			await logout();
		} catch (error) {
			console.error('Logout failed:', error);
		} finally {
			isLoggingOut = false;
		}
	}
	
	function handleTermsClick() {
		goto('/terms');
	}
	
	function handlePrivacyClick() {
		goto('/privacy');
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar.Root class="size-8 rounded-lg grayscale">
							<Avatar.Image src={userProp.avatar} alt={userProp.name} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="text-muted-foreground truncate text-xs">
								{userProp.email}
							</span>
							<span class="text-muted-foreground truncate text-xs">
								{userProp.company || 'Company not set'}
							</span>
						</div>
						<DotsVerticalIcon class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={userProp.avatar} alt={userProp.email} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="text-muted-foreground truncate text-xs">
								{userProp.email}
							</span>
							<span class="text-muted-foreground truncate text-xs">
								{userProp.company || 'Company not set'}
							</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<CreditCardIcon />
						Credits Total: 100
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<CreditCardIcon />
						Credits Remaining: 85
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item onSelect={handleTermsClick}>
						Terms
					</DropdownMenu.Item>
					<DropdownMenu.Item onSelect={handlePrivacyClick}>
						Policy
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item 
					onSelect={handleLogout}
					disabled={isLoggingOut}
					class={isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
				>
					{#if isLoggingOut}
						<LoaderIcon class="animate-spin" />
					{:else}
						<LogoutIcon />
					{/if}
					{isLoggingOut ? 'Signing out...' : 'Sign out'}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
