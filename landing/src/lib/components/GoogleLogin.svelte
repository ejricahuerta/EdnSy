<script lang="ts">
  import { goto } from '$app/navigation';
  import LoaderIcon from "@tabler/icons-svelte/icons/loader-2";
  
  let { class: className = "", label = "Login with Google" } = $props();
  
  let isLoading = $state(false);

  async function startGoogleLogin() {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      isLoading = true;
      const res = await fetch("http://localhost:5235/user/connect/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUri: "http://localhost:5173/oauth-callback",
        }),
      });
      
      if (res.ok) {
        const { oauthUrl } = await res.json();
        window.location.href = oauthUrl; // Redirect to Google OAuth
      } else {
        const error = await res.text();
        alert("Failed to start Google login: " + error);
      }
    } catch (error) {
      console.error("Failed to connect to authentication service:", error);
      alert("Authentication service is currently unavailable. Please try again later.");
    } finally {
      isLoading = false;
    }
  }
</script>

<button
  onclick={startGoogleLogin}
  disabled={isLoading}
  class={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-blue-500 hover:text-white/90 h-10 px-4 py-2 w-full ${className} ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
>
  <div class="flex items-center justify-center gap-2">
    {#if isLoading}
      <LoaderIcon class="animate-spin" />
    {:else}
      <!-- Google icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="25"
        height="25"
        viewBox="0 0 48 48"
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        ></path><path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        ></path><path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        ></path><path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
      </svg>
    {/if}
    {isLoading ? 'Signing in...' : label}
  </div>
</button>

