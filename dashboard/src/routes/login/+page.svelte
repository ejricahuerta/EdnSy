<script lang="ts">
	import { supabase } from "$lib/supabase";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import * as Alert from "$lib/components/ui/alert/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  
	let isLoading = $state(false);
	let errorMessage = $state("");
	let initialLoading = $state(true);
  
	onMount(async () => {
	  try {
		const {
		  data: { session },
		} = await supabase.auth.getSession();
		if (session) {
		  goto("/dashboard");
		  return;
		}
  
		// Get error message from URL and make it user-friendly
		const url = new URL(window.location.href);
		const error = url.searchParams.get("error");
		if (error) {
		  // Convert technical error messages to user-friendly ones
		  const userFriendlyError = getErrorMessage(error);
		  errorMessage = userFriendlyError;
		}
	  } finally {
		initialLoading = false;
	  }
	});
  
	function getErrorMessage(error: string): string {
	  const errorMap: Record<string, string> = {
		'access_denied': 'You cancelled the login process. Please try again.',
		'User cancelled the login': 'You cancelled the login process. Please try again.',
		'No authentication code found': 'The login process was interrupted. Please try again.',
		'Invalid code': 'The login link has expired. Please try again.',
		'Network error': 'There was a network problem. Please check your connection and try again.',
		'An unexpected error occurred': 'Something went wrong. Please try again.',
		'Authentication failed': 'Login failed. Please try again.',
		'Session expired': 'Your session has expired. Please log in again.',
		'Invalid credentials': 'Login failed. Please try again.',
		'User not found': 'Account not found. Please check your email and try again.',
		'Too many requests': 'Too many login attempts. Please wait a moment and try again.',
		'Service unavailable': 'The login service is temporarily unavailable. Please try again later.'
	  };
  
	  // Check for exact matches first
	  if (errorMap[error]) {
		return errorMap[error];
	  }
  
	  // Check for partial matches
	  for (const [key, message] of Object.entries(errorMap)) {
		if (error.toLowerCase().includes(key.toLowerCase())) {
		  return message;
		}
	  }
  
	  // Default user-friendly message
	  return 'Login failed. Please try again.';
	}
  
	async function loginWithGoogle() {
	  isLoading = true;
	  errorMessage = ""; // Clear any previous errors
	  const origin = typeof window !== "undefined" ? window.location.origin : "";
	  const redirectTo = `${origin}/auth/callback`;
	  const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
		  redirectTo,
		  queryParams: {
			access_type: "offline",
			prompt: "consent",
		  },
		},
	  });
	  if (error) {
		errorMessage = error.message;
		isLoading = false;
	  }
	}
  </script>
  
  <svelte:head>
	<title>Login - Ed&Sy</title>
	<meta name="description" content="Sign in to your Ed&Sy account" />
  </svelte:head>
  
  <div class="min-h-screen flex items-center justify-center bg-secondary space-y-4">
	<div class="w-full text-center space-y-2 max-w-md p-4">
	  <p class="text-3xl my-8">Ed <span class="text-primary">&</span> Sy</p>
  
	  {#if initialLoading}
		<!-- Loading State -->
		<div class="space-y-4">
		  <Skeleton class="h-8 w-64 mx-auto" />
		  <Skeleton class="h-4 w-80 mx-auto" />
		  <div class="space-y-3 mt-8">
			<Skeleton class="h-12 w-full" />
		  </div>
		  <div class="mt-6">
			<Skeleton class="h-4 w-32 mx-auto" />
		  </div>
		  <div class="mt-12">
			<Skeleton class="h-3 w-64 mx-auto" />
		  </div>
		</div>
	  {:else}
		<!-- Main Heading -->
		<h1 class="text-2xl text-primary text-center mb-4">
		  Log in for a more personalized demo
		</h1>
  
		<!-- Description -->
		<p class="text-sm text-gray-600 text-center mb-12">
		  Includes long-term memory, access to new features, and 30 minute sessions.
		</p>
  
		<!-- Error Alert -->
		{#if errorMessage}
		  <Alert.Root variant="destructive" class="mb-6 text-left">
			<AlertCircleIcon class="size-4" />
			<Alert.Title>Authentication Error</Alert.Title>
			<Alert.Description>
			  {errorMessage}
			</Alert.Description>
		  </Alert.Root>
		{/if}
  
		<!-- Login Buttons -->
		<div class="space-y-3">
		  <!-- Google Login -->
		  <button
			disabled={isLoading}
			onclick={loginWithGoogle}
			class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			type="button"
		  >
			<svg class="w-5 h-5" viewBox="0 0 24 24">
			  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
			  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
			  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
			  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			<span class="text-gray-900 font-medium">
			  {isLoading ? 'Signing in...' : 'Continue with Google'}
			</span>
		  </button>
  
		</div>
  
		<!-- Return to Home -->
		<div class="mt-6 text-center">
		  <a href="/" class="text-blue-600 hover:text-blue-700 text-sm">
			Return to Home
		  </a>
		</div>
  
	
	  {/if}
	</div>
  </div>
  